import { Note } from '../models/Note.js';
import { buildPaginatedResult } from '../utils/pagination.js';
export const noteRepository = {
    async create(data) {
        return Note.create(data);
    },
    async findById(id) {
        return Note.findById(id).exec();
    },
    async findByIdForUser(id, userId) {
        return Note.findOne({ _id: id, user: userId }).exec();
    },
    async listForUser(userId, { page, limit, sort, filters = {} }) {
        const query = { user: userId, ...filters };
        if (filters.search) {
            query.$text = { $search: filters.search };
            delete query.search;
        }
        const [docs, total] = await Promise.all([
            Note.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            Note.countDocuments(query),
        ]);
        return buildPaginatedResult(docs, total, { page, limit });
    },
    async updateById(id, userId, data) {
        return Note.findOneAndUpdate({ _id: id, user: userId }, { $set: data }, { new: true, runValidators: true }).exec();
    },
    async deleteById(id) {
        return Note.findByIdAndDelete(id).exec();
    },
};
//# sourceMappingURL=note.repository.js.map