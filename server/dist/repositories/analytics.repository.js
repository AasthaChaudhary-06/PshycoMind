import { Quiz } from '../models/Quiz.js';
import { Exam } from '../models/Exam.js';
import { Flashcard } from '../models/Flashcard.js';
import { Progress } from '../models/Progress.js';
import { Document } from '../models/Document.js';
export const analyticsRepository = {
    quizzes(userId) {
        return Quiz.find({ user: userId })
            .select('title topic difficulty questions attempts createdAt')
            .sort({ createdAt: 1 })
            .lean()
            .exec();
    },
    exams(userId) {
        return Exam.find({ user: userId })
            .select('title topic difficulty questions attempts createdAt')
            .sort({ createdAt: 1 })
            .lean()
            .exec();
    },
    async flashcardStats(userId) {
        const [total, mastered, due] = await Promise.all([
            Flashcard.countDocuments({ user: userId }),
            Flashcard.countDocuments({ user: userId, mastery: 'mastered' }),
            Flashcard.countDocuments({ user: userId, nextReviewAt: { $lte: new Date() } }),
        ]);
        return { total, mastered, due };
    },
    progress(userId) {
        return Progress.findOne({ user: userId }).lean().exec();
    },
    documents(userId) {
        return Document.find({ owner: userId, status: 'ready' })
            .select('title subject pages createdAt')
            .lean()
            .exec();
    },
};
//# sourceMappingURL=analytics.repository.js.map