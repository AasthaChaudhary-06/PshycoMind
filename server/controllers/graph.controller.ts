import { graphService } from '../services/graph.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const graphController = {
  generate: asyncHandler(async (req: any, res) => {
    const { documentId } = req.params;
    const graph = await graphService.generate(req.user._id, documentId);
    res.json(new ApiResponse(200, graph, 'Knowledge graph generated'));
  }),

  get: asyncHandler(async (req: any, res) => {
    const { documentId } = req.params;
    const graph = await graphService.getForUser(req.user._id, documentId);
    res.json(new ApiResponse(200, graph, 'Knowledge graph retrieved'));
  }),
};
