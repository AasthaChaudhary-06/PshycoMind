import { progressService } from '../services/progress.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const progressController = {
  dashboard: asyncHandler(async (req, res) => {
    const progress = await progressService.getDashboard(req.user._id);
    res.json(new ApiResponse(200, progress, 'Progress retrieved'));
  }),

  trackReading: asyncHandler(async (req, res) => {
    const progress = await progressService.trackReading(req.user._id, req.body);
    res.json(new ApiResponse(200, progress, 'Reading progress saved'));
  }),

  trackTime: asyncHandler(async (req, res) => {
    const progress = await progressService.trackReadingTime(req.user._id, req.body);
    res.json(new ApiResponse(200, progress, 'Reading time saved'));
  }),

  trackQuiz: asyncHandler(async (req, res) => {
    const progress = await progressService.trackQuizAttempt(req.user._id);
    res.json(new ApiResponse(200, progress, 'Quiz stats updated'));
  }),

  leaderboard: asyncHandler(async (req, res) => {
    const leaderboard = await progressService.getLeaderboard(req.query);
    res.json(new ApiResponse(200, leaderboard, 'Leaderboard retrieved'));
  }),

  getUser: asyncHandler(async (req, res) => {
    const progress = await progressService.getDashboard(req.params.userId);
    await progressService.requireOwner(progress, req.user._id);
    res.json(new ApiResponse(200, progress, 'User progress retrieved'));
  }),
};
