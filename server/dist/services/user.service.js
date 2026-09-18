import { ApiError } from '../utils/ApiError.js';
import { userRepository } from '../repositories/user.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
import { quizRepository } from '../repositories/quiz.repository.js';
import { chatRepository } from '../repositories/chat.repository.js';
import { noteRepository } from '../repositories/note.repository.js';
import { progressRepository } from '../repositories/progress.repository.js';
import { flashcardRepository } from '../repositories/flashcard.repository.js';
export const userService = {
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user)
            throw new ApiError(404, 'User not found');
        return user.toSafeJSON();
    },
    async updateProfile(userId, data) {
        const allowed = pick(data, ['name', 'avatar', 'preferences']);
        return userRepository.updateById(userId, allowed);
    },
    async changePassword(userId, { currentPassword, newPassword }) {
        const user = await userRepository.findById(userId, { includePassword: true });
        if (!user)
            throw new ApiError(404, 'User not found');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch)
            throw new ApiError(400, 'Current password is incorrect');
        user.password = newPassword;
        await user.save();
        return user.toSafeJSON();
    },
    async getAnalytics(userId) {
        const [documents, quizzes, chats, notes, progress, dueFlashcards,] = await Promise.all([
            documentRepository.countByOwner(userId),
            quizRepository.listForUser(userId, {
                page: 1,
                limit: 1,
                sort: { createdAt: -1 },
                filters: {},
            }),
            chatRepository.listForUser(userId, {
                page: 1,
                limit: 1,
                sort: { createdAt: -1 },
                filters: {},
            }),
            noteRepository.listForUser(userId, {
                page: 1,
                limit: 1,
                sort: { createdAt: -1 },
                filters: {},
            }),
            progressRepository.getOrCreate(userId),
            flashcardRepository.countDueToday(userId),
        ]);
        const quizAttempts = quizzes.docs.flatMap((q) => q.attempts || []);
        return {
            totals: {
                documents,
                notes: notes.total,
                chats: chats.total,
                quizzes: quizzes.total,
                dueFlashcards,
            },
            reading: {
                totalPagesRead: progress.totalPagesRead,
                readingTimeSec: progress.readingTimeSec,
                streakDays: progress.streakDays,
                documentsStarted: progress.documents.length,
                documentsCompleted: progress.documents.filter((d) => d.isCompleted).length,
            },
            quizPerformance: {
                attempts: quizAttempts.length,
                averageScore: quizAttempts.length
                    ? Math.round(quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length)
                    : 0,
                bestScore: quizAttempts.length
                    ? Math.max(...quizAttempts.map((a) => a.percentage))
                    : 0,
            },
        };
    },
};
function pick(obj, keys) {
    return keys.reduce((acc, key) => {
        if (obj[key] !== undefined)
            acc[key] = obj[key];
        return acc;
    }, {});
}
//# sourceMappingURL=user.service.js.map