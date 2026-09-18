import { analyticsService } from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const analyticsController = {
  readiness: asyncHandler(async (req, res) => {
    const readiness = await analyticsService.getReadiness(req.user._id);
    res.json(new ApiResponse(200, readiness, 'Exam readiness retrieved'));
  }),

  trends: asyncHandler(async (req, res) => {
    const trends = await analyticsService.getTrends(req.user._id);
    res.json(new ApiResponse(200, trends, 'Analytics trends retrieved'));
  }),

  topics: asyncHandler(async (req, res) => {
    const topics = await analyticsService.getTopics(req.user._id);
    res.json(new ApiResponse(200, topics, 'Topic mastery retrieved'));
  }),
};
