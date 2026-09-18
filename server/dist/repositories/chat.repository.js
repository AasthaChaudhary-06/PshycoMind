import { Chat } from '../models/Chat.js';
import { buildPaginatedResult } from '../utils/pagination.js';
export const chatRepository = {
    async create(data) {
        return Chat.create(data);
    },
    async findById(id) {
        return Chat.findById(id).exec();
    },
    async findByIdForUser(id, userId) {
        return Chat.findOne({ _id: id, user: userId }).exec();
    },
    async listForUser(userId, { page, limit, sort, filters = {} }) {
        const query = { user: userId, ...filters };
        if (filters.search) {
            query.title = { $regex: filters.search, $options: 'i' };
            delete query.search;
        }
        const [docs, total] = await Promise.all([
            Chat.find(query)
                .select('title document pinned bookmarked lastMessageAt createdAt updatedAt')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            Chat.countDocuments(query),
        ]);
        return buildPaginatedResult(docs, total, { page, limit });
    },
    async pushMessage(id, userId, message) {
        return Chat.findOneAndUpdate({ _id: id, user: userId }, {
            $push: { messages: message },
            $set: { lastMessageAt: new Date() },
        }, { new: true }).exec();
    },
    async updateById(id, data) {
        return Chat.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).exec();
    },
    async deleteById(id) {
        return Chat.findByIdAndDelete(id).exec();
    },
};
//# sourceMappingURL=chat.repository.js.map