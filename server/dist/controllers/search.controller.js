import { searchService } from '../services/search.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const searchController = {
    search: asyncHandler(async (req, res) => {
        const results = await searchService.globalSearch(req.user._id, {
            q: req.query.q,
            limit: Number(req.query.limit) || 10,
        });
        res.json(new ApiResponse(200, results, 'Search completed'));
    }),
};
//# sourceMappingURL=search.controller.js.map