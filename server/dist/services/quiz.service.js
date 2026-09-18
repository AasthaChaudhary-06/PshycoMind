import { ApiError } from '../utils/ApiError.js';
import { getPaginationOptions } from '../utils/pagination.js';
import { llm } from '../ai/llm.service.js';
import { retrieveRelevantChunks } from '../ai/retrieval.service.js';
import { quizRepository } from '../repositories/quiz.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { gamificationService } from './gamification.service.js';
export const quizService = {
    async generateQuiz(userId, { documentId, topic, difficulty = 'medium', questionCount = 10, title = null }) {
        const document = documentId
            ? await documentRepository.findByIdForProcessing(documentId)
            : null;
        const context = document ? await this._buildContext(document, topic, questionCount) : '';
        const system = [
            `You generate medical MCQs for physiotherapy and physiology students.`,
            `Return a JSON object with "title" and "questions" array.`,
            `Each question has: question, options (4 strings), correctIndex, explanation, topic, difficulty.`,
            `Ensure exactly ${questionCount} questions at ${difficulty} difficulty.`,
            `Base questions strictly on the provided context when present.`,
        ].join(' ');
        const { content } = await llm.complete([
            { role: 'system', content: system },
            {
                role: 'user',
                content: context
                    ? `Document context:\n${context}\n\nGenerate the quiz.`
                    : 'Generate the quiz.',
            },
        ], { temperature: 0.7, maxTokens: 4000 });
        const parsed = this._parseQuiz(content);
        const quiz = await quizRepository.create({
            user: userId,
            title: title || parsed.title || `${topic || 'Quiz'} - ${difficulty}`,
            document: documentId || null,
            subject: document?.subject || 'General',
            topic,
            difficulty,
            questions: parsed.questions,
            status: 'active',
        });
        return quiz;
    },
    async listQuizzes(userId, query) {
        const pagination = getPaginationOptions(query);
        const filters = {};
        if (query.difficulty)
            filters.difficulty = query.difficulty;
        if (query.subject)
            filters.subject = query.subject;
        if (query.topic)
            filters.topic = query.topic;
        return quizRepository.listForUser(userId, { ...pagination, filters });
    },
    async getQuiz(userId, quizId, { includeAnswers = true } = {}) {
        const quiz = await quizRepository.findByIdForUser(quizId, userId);
        if (!quiz)
            throw new ApiError(404, 'Quiz not found');
        if (!includeAnswers) {
            const safe = quiz.toObject();
            safe.questions = safe.questions.map((q) => {
                const { correctIndex, ...rest } = q;
                return rest;
            });
            return safe;
        }
        return quiz;
    },
    async submitAttempt(userId, quizId, { answers, startedAt }) {
        const quiz = await this.getQuiz(userId, quizId);
        if (!Array.isArray(answers))
            throw new ApiError(400, 'answers must be an array');
        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctIndex)
                score += 1;
        });
        const total = quiz.questions.length;
        const attempt = {
            startedAt: startedAt ? new Date(startedAt) : new Date(),
            completedAt: new Date(),
            answers,
            score,
            total,
            percentage: total ? Math.round((score / total) * 100) : 0,
            timeTakenSec: startedAt
                ? Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000))
                : 0,
        };
        const updated = await quizRepository.updateById(quizId, {
            $push: { attempts: attempt },
            status: 'completed',
        });
        gamificationService
            .awardXp(userId, 'quiz.completed', { bestQuizScore: attempt.percentage })
            .catch(() => { });
        if (attempt.percentage === 100) {
            gamificationService.awardXp(userId, 'quiz.ace').catch(() => { });
        }
        return {
            attempt,
            explanations: quiz.questions.map((q) => ({
                index: quiz.questions.indexOf(q),
                correctIndex: q.correctIndex,
                yourAnswer: answers[quiz.questions.indexOf(q)],
                explanation: q.explanation,
            })),
            quiz: updated,
        };
    },
    async deleteQuiz(userId, quizId) {
        const quiz = await quizRepository.findByIdForUser(quizId, userId);
        if (!quiz)
            throw new ApiError(404, 'Quiz not found');
        await quizRepository.deleteById(quizId);
    },
    async _buildContext(document, topic, questionCount) {
        const chunks = await retrieveRelevantChunks(document, topic || 'overview', {
            topK: Math.max(4, Math.min(questionCount, 8)),
        });
        return chunks.map((c) => `[Page ${c.page}]\n${c.text}`).join('\n\n');
    },
    _parseQuiz(content) {
        try {
            let parsed;
            if (typeof content === 'string') {
                const json = content.match(/\{[\s\S]*\}/)?.[0];
                if (!json)
                    throw new Error('No JSON found in response');
                parsed = JSON.parse(json);
            }
            else {
                parsed = content;
            }
            if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
                throw new Error('Response contains no questions');
            }
            return parsed;
        }
        catch (err) {
            throw new ApiError(502, `Failed to generate quiz: ${err.message}`);
        }
    },
};
//# sourceMappingURL=quiz.service.js.map