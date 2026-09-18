import { Progress } from '../models/Progress.js';
import { Flashcard } from '../models/Flashcard.js';
export const progressRepository = {
    async findByUser(userId) {
        return Progress.findOne({ user: userId }).exec();
    },
    async getOrCreate(userId) {
        let progress = await Progress.findOne({ user: userId }).exec();
        if (!progress) {
            progress = await Progress.create({ user: userId });
        }
        return progress;
    },
    async upsertUserProgress(userId, update) {
        return Progress.findOneAndUpdate({ user: userId }, update, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        }).exec();
    },
    async listLeaderboard({ limit = 20 }) {
        const docs = await Progress.find()
            .sort({ 'quizStats.averageScore': -1, totalPagesRead: -1 })
            .limit(Math.min(limit, 100))
            .populate('user', 'name avatar')
            .select('user totalPagesRead readingTimeSec quizStats streakDays lastActiveAt')
            .lean()
            .exec();
        return docs
            .filter((d) => d.user)
            .map((d, index) => ({ ...d, rank: index + 1 }));
    },
    async enrichFlashcardStats(userId) {
        const [totalCards, dueToday, mastered] = await Promise.all([
            Flashcard.countDocuments({ user: userId }),
            Flashcard.countDocuments({ user: userId, nextReviewAt: { $lte: new Date() } }),
            Flashcard.countDocuments({ user: userId, mastery: 'mastered' }),
        ]);
        return { totalCards, dueToday, mastered };
    },
};
//# sourceMappingURL=progress.repository.js.map