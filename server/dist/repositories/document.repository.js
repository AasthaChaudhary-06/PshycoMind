import { Document } from '../models/Document.js';
import { buildPaginatedResult } from '../utils/pagination.js';
const BASE_FILTERS = { status: 'ready' };
export const documentRepository = {
    async create(data) {
        return Document.create(data);
    },
    async findById(id, { includeContent = false } = {}) {
        const query = Document.findById(id);
        if (includeContent)
            query.select('+pages +chunks');
        else
            query.select('-pages -chunks');
        return query.exec();
    },
    async findByIdForProcessing(id) {
        return Document.findById(id).select('+pages +chunks').exec();
    },
    async findPaginatedForUser(userId, { page, limit, sort, filters = {} }) {
        const query = { ...BASE_FILTERS, owner: userId, ...filters };
        if (filters.search) {
            query.$text = { $search: filters.search };
            delete query.search;
        }
        const [docs, total] = await Promise.all([
            Document.find(query)
                .select('-pages -chunks')
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            Document.countDocuments(query),
        ]);
        return buildPaginatedResult(docs, total, { page, limit });
    },
    async updateById(id, data) {
        return Document.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).exec();
    },
    async setFavorite(id, userId, isFavorite) {
        return Document.findOneAndUpdate({ _id: id, owner: userId }, { isFavorite }, { new: true }).exec();
    },
    async deleteById(id) {
        return Document.findByIdAndDelete(id).exec();
    },
    async countByOwner(userId) {
        return Document.countDocuments({ owner: userId });
    },
};
//# sourceMappingURL=document.repository.js.map