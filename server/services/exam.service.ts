import { ApiError } from '../utils/ApiError.js';
import { getPaginationOptions } from '../utils/pagination.js';
import { llm } from '../ai/llm.service.js';
import { retrieveRelevantChunks } from '../ai/retrieval.service.js';
import { examRepository } from '../repositories/exam.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { gamificationService } from './gamification.service.js';

const MAX_CONTEXT_CHARS = 8000;

export const examService = {
  async create(userId, { documentId, topic, difficulty = 'medium', questionCount = 20, timeLimitMin = 30, title = null }) {
    const document = documentId
      ? await documentRepository.findByIdForProcessing(documentId)
      : null;

    const context = document
      ? await this._buildContext(document, topic, questionCount)
      : '';

    const { content } = await llm.complete(
      [
        {
          role: 'system',
          content: `You create rigorous medical exam papers. Return a JSON object with "title" and "questions" array. Each question has: question, options (4 strings), correctIndex, explanation, topic, difficulty. Ensure exactly ${questionCount} questions at ${difficulty} difficulty. Base questions on context when present.`,
        },
        {
          role: 'user',
          content: context
            ? `Document context:\n${context}\n\nGenerate the exam paper.`
            : `Generate an exam paper on topic: ${topic || 'physiology'}.`,
        },
      ],
      { temperature: 0.6, maxTokens: 5000 },
    );

    const parsed = this._parseExam(content);
    const exam = await examRepository.create({
      user: userId,
      title: title || parsed.title || `${topic || 'Exam'} - ${difficulty}`,
      document: documentId || null,
      subject: document?.subject || 'General',
      topic,
      difficulty,
      questionCount: parsed.questions.length,
      timeLimitMin,
      questions: parsed.questions,
      status: 'active',
    });

    return exam;
  },

  async list(userId, query) {
    const pagination = getPaginationOptions(query);
    return examRepository.listForUser(userId, {
      ...pagination,
      status: query.status || null,
    });
  },

  async get(userId, examId) {
    const exam = await examRepository.findByIdForUser(examId, userId);
    if (!exam) throw new ApiError(404, 'Exam not found');
    return exam;
  },

  async start(userId, examId) {
    const exam = await examRepository.findByIdForUser(examId, userId);
    if (!exam) throw new ApiError(404, 'Exam not found');

    const safe = exam.toObject();
    safe.questions = safe.questions.map(({ correctIndex, ...rest }) => rest);
    safe.attempt = {
      startedAt: new Date(),
      timeLimitMin: exam.timeLimitMin,
    };
    return safe;
  },

  async submit(userId, examId, { answers, startedAt }) {
    const exam = await this.get(userId, examId);
    if (!Array.isArray(answers)) throw new ApiError(400, 'answers must be an array');

    let score = 0;
    exam.questions.forEach((q, index) => {
      if (answers[index] === q.correctIndex) score += 1;
    });

    const total = exam.questions.length;
    const attempt = {
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      submittedAt: new Date(),
      answers,
      score,
      total,
      percentage: total ? Math.round((score / total) * 100) : 0,
      timeTakenSec: startedAt
        ? Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000))
        : 0,
    };

    const updated = await examRepository.updateById(examId, {
      $push: { attempts: attempt },
      status: 'completed',
    });

    gamificationService
      .awardXp(userId, 'exam.completed', { bestQuizScore: attempt.percentage })
      .catch(() => {});
    if (attempt.percentage === 100) {
      gamificationService.awardXp(userId, 'quiz.ace').catch(() => {});
    }

    return {
      attempt,
      explanations: exam.questions.map((q, index) => ({
        index,
        correctIndex: q.correctIndex,
        yourAnswer: answers[index],
        explanation: q.explanation,
      })),
      exam: updated,
    };
  },

  async remove(userId, examId) {
    const exam = await examRepository.findByIdForUser(examId, userId);
    if (!exam) throw new ApiError(404, 'Exam not found');
    await examRepository.deleteById(examId);
  },

  async _buildContext(document, topic, questionCount) {
    const chunks = await retrieveRelevantChunks(document, topic || 'overview', {
      topK: Math.max(4, Math.min(questionCount, 8)),
    });
    let out = '';
    for (const chunk of chunks) {
      if (out.length + chunk.text.length > MAX_CONTEXT_CHARS) break;
      out += `[Page ${chunk.page}]\n${chunk.text}\n\n`;
    }
    return out;
  },

  _parseExam(content) {
    try {
      let parsed;
      if (typeof content === 'string') {
        const json = content.match(/\{[\s\S]*\}/)?.[0];
        if (!json) throw new Error('No JSON found');
        parsed = JSON.parse(json);
      } else {
        parsed = content;
      }
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Response contains no questions');
      }
      return parsed;
    } catch (err) {
      throw new ApiError(502, `Failed to generate exam: ${err.message}`);
    }
  },
};
