import { Quiz } from '../models/Quiz.js';
import { buildPaginatedResult } from '../utils/pagination.js';
export const quizRepository = {
    async create(data) {
        return Quiz.create(data);
    },
    async findById(id) {
        return Quiz.findById(id).exec();
    },
    async findByIdForUser(id, userId) {
        return Quiz.findOne({ _id: id, user: userId }).exec();
    },
    async listForUser(userId, { page, limit, sort, filters = {} }) {
        const query = { user: userId, ...filters };
        const [docs, total] = await Promise.all([
            Quiz.find(query)
                .select('title subject topic difficulty questions status attempts createdAt updatedAt')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            Quiz.countDocuments(query),
        ]);
        return buildPaginatedResult(docs, total, { page, limit });
    },
    async updateById(id, data) {
        return Quiz.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).exec();
    },
    async deleteById(id) {
        return Quiz.findByIdAndDelete(id).exec();
    },
};
//# sourceMappingURL=quiz.repository.js.map