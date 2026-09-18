/**
 * Normalize a request query into a pagination contract used by repositories.
 * Supports `?page=1&limit=10&sortBy=createdAt&sortOrder=desc`.
 */
export function getPaginationOptions(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    return {
        page,
        limit,
        skip: (page - 1) * limit,
        sort: { [sortBy]: sortOrder },
    };
}
export function buildPaginatedResult(data, total, { page, limit }) {
    return {
        docs: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    };
}
//# sourceMappingURL=pagination.js.map