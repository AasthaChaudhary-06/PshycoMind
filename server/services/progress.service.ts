import { ApiError } from '../utils/ApiError.js';
import { progressRepository } from '../repositories/progress.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { quizRepository } from '../repositories/quiz.repository.js';

export const progressService = {
  async getDashboard(userId) {
    const progress = await progressRepository.getOrCreate(userId);
    const flashcardStats = await progressRepository.enrichFlashcardStats(userId);

    return {
      ...progress.toObject(),
      flashcardStats: { ...progress.flashcardStats, ...flashcardStats },
      totals: {
        documents: await documentRepository.countByOwner(userId),
      },
    };
  },

  async trackReading(userId, { documentId, page, totalPages }) {
    const progress = await progressRepository.getOrCreate(userId);

    const entryIndex = progress.documents.findIndex(
      (d) => d.document.toString() === documentId,
    );

    const percent = totalPages > 0 ? Math.min(100, Math.round((page / totalPages) * 100)) : 0;

    if (entryIndex === -1) {
      progress.documents.push({
        document: documentId,
        pagesRead: page,
        lastPage: page,
        percentComplete: percent,
        lastOpenedAt: new Date(),
        isCompleted: percent >= 100,
      });
    } else {
      progress.documents[entryIndex] = {
        ...progress.documents[entryIndex],
        pagesRead: Math.max(progress.documents[entryIndex].pagesRead, page),
        lastPage: page,
        percentComplete: percent,
        lastOpenedAt: new Date(),
        isCompleted: percent >= 100,
      };
    }

    progress.totalPagesRead = progress.documents.reduce(
      (sum, d) => sum + (d.pagesRead || 0),
      0,
    );
    progress.lastActiveAt = new Date();
    progress.streakDays = Math.min(progress.streakDays + 1, 365);

    await progress.save();
    return progress;
  },

  async trackReadingTime(userId, { seconds }) {
    const progress = await progressRepository.getOrCreate(userId);
    progress.readingTimeSec += Math.max(0, Number(seconds) || 0);
    progress.lastActiveAt = new Date();
    await progress.save();
    return progress;
  },

  async trackQuizAttempt(userId) {
    const progress = await progressRepository.getOrCreate(userId);
    const quizzes = await quizRepository.listForUser(userId, {
      page: 1,
      limit: 100,
      sort: { createdAt: -1 },
      filters: {},
    });

    const attempts = quizzes.docs.flatMap((q) => q.attempts || []);
    if (attempts.length) {
      const avg = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length;
      const best = Math.max(...attempts.map((a) => a.percentage || 0));
      progress.quizStats = {
        totalAttempts: attempts.length,
        averageScore: Math.round(avg),
        bestScore: best,
      };
    }

    progress.lastActiveAt = new Date();
    await progress.save();
    return progress;
  },

  async getLeaderboard(query) {
    const docs = await progressRepository.listLeaderboard(query);
    return docs;
  },

  async requireOwner(progress, userId) {
    if (progress.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to view this progress');
    }
  },
};
