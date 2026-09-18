import { ApiError } from '../utils/ApiError.js';
import { getPaginationOptions } from '../utils/pagination.js';
import { llm } from '../ai/llm.service.js';
import { studyPlanRepository } from '../repositories/studyPlan.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { gamificationService } from './gamification.service.js';
import { notificationService } from './notification.service.js';

export const studyPlanService = {
  async create(userId, { title, goal = '', topic, dailyMinutes = 60, endDate = null, tasks = [] }) {
    const documents = await documentRepository.findPaginatedForUser(userId, {
      page: 1,
      limit: 5,
      sort: { createdAt: -1 },
      filters: {},
    });

    const suggested = tasks.length
      ? tasks
      : await this._generateTasks({ topic, dailyMinutes, documents: documents.docs });

    const plan = await studyPlanRepository.create({
      user: userId,
      title: title || `${topic || 'Study'} Plan`,
      goal: goal || topic || '',
      dailyMinutes,
      endDate: endDate ? new Date(endDate) : null,
      tasks: suggested.map((task, index) => ({ ...task, order: index })),
      status: 'active',
    });

    gamificationService.awardXp(userId, 'plan.created').catch(() => {});
    return plan;
  },

  async list(userId, query) {
    const pagination = getPaginationOptions(query);
    return studyPlanRepository.listForUser(userId, {
      ...pagination,
      status: query.status || null,
    });
  },

  async get(userId, planId) {
    const plan = await studyPlanRepository.findByIdForUser(planId, userId);
    if (!plan) throw new ApiError(404, 'Study plan not found');
    return plan;
  },

  async updateTask(userId, planId, taskId, { completed }) {
    const plan = await studyPlanRepository.findByIdForUser(planId, userId);
    if (!plan) throw new ApiError(404, 'Study plan not found');

    const updated = await studyPlanRepository.updateTask(planId, taskId, {
      completed,
      completedAt: completed ? new Date() : null,
    });

    if (completed) {
      gamificationService.awardXp(userId, 'plan.day').catch(() => {});
    }

    const allDone = updated.tasks.length > 0 && updated.tasks.every((t) => t.completed);
    if (allDone && plan.status !== 'completed') {
      await studyPlanRepository.updateById(planId, { status: 'completed' });
      notificationService
        .create({
          user: userId,
          type: 'planner',
          title: 'Study plan complete',
          message: `Congratulations! You finished "${plan.title}".`,
          data: { planId: plan._id.toString() },
        })
        .catch(() => {});
    }

    return studyPlanRepository.findByIdForUser(planId, userId);
  },

  async remove(userId, planId) {
    const plan = await studyPlanRepository.findByIdForUser(planId, userId);
    if (!plan) throw new ApiError(404, 'Study plan not found');
    await studyPlanRepository.deleteById(planId);
  },

  async _generateTasks({ topic, dailyMinutes, documents }) {
    const docLines = documents
      .map((d, i) => `- ${d.title}${d.subject ? ` (${d.subject})` : ''}`)
      .join('\n');

    const { content } = await llm.complete(
      [
        {
          role: 'system',
          content:
            'You are a medical study planner. Generate a weekly study plan. Return ONLY a JSON array of tasks with "title" and "durationMin". Produce 5-7 tasks covering reading, flashcards, and practice questions. Keep titles short.',
        },
        {
          role: 'user',
          content: `Topic: ${topic || 'physiology'}\nDaily budget: ${dailyMinutes} minutes/day\nDocuments:${docLines || ' none'}\n\nGenerate the tasks.`,
        },
      ],
      { temperature: 0.5, maxTokens: 1200 },
    );

    const parsed = this._parseTasks(content);
    if (parsed.length) return parsed;

    return [
      { title: `Read & annotate: ${topic || 'core concepts'}`, durationMin: dailyMinutes },
      { title: 'Create flashcards for key terms', durationMin: 20 },
      { title: 'Practice 10 MCQs on the topic', durationMin: 30 },
      { title: 'Summarize key points in your notes', durationMin: 20 },
      { title: 'Review flashcards from earlier sessions', durationMin: 15 },
      { title: 'Take a timed practice quiz', durationMin: 30 },
    ];
  },

  _parseTasks(content) {
    try {
      let parsed;
      if (typeof content === 'string') {
        const json = content.match(/\[[\s\S]*\]/)?.[0];
        if (!json) throw new Error('No JSON array found');
        parsed = JSON.parse(json);
      } else {
        parsed = content;
      }
      return (Array.isArray(parsed) ? parsed : [])
        .filter((t) => t.title)
        .map((t) => ({
          title: String(t.title).trim(),
          durationMin: Math.max(5, Math.min(240, Number(t.durationMin) || 30)),
        }));
    } catch {
      return [];
    }
  },
};
