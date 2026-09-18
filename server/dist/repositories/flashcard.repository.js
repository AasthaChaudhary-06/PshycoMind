import { Flashcard } from '../models/Flashcard.js';
import { buildPaginatedResult } from '../utils/pagination.js';
export const flashcardRepository = {
    async createMany(items) {
        return Flashcard.insertMany(items);
    },
    async create(data) {
        return Flashcard.create(data);
    },
    async findById(id) {
        return Flashcard.findById(id).exec();
    },
    async findByIdForUser(id, userId) {
        return Flashcard.findOne({ _id: id, user: userId }).exec();
    },
    async listForUser(userId, { page, limit, sort, filters = {} }) {
        const query = { user: userId, ...filters };
        if (filters.dueToday) {
            query.nextReviewAt = { $lte: new Date() };
            delete query.dueToday;
        }
        const [docs, total] = await Promise.all([
            Flashcard.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            Flashcard.countDocuments(query),
        ]);
        return buildPaginatedResult(docs, total, { page, limit });
    },
    async updateById(id, userId, data) {
        return Flashcard.findOneAndUpdate({ _id: id, user: userId }, { $set: data }, { new: true, runValidators: true }).exec();
    },
    async deleteById(id) {
        return Flashcard.findByIdAndDelete(id).exec();
    },
    async countDueToday(userId) {
        return Flashcard.countDocuments({ user: userId, nextReviewAt: { $lte: new Date() } });
    },
};
//# sourceMappingURL=flashcard.repository.js.map