import { gamificationService } from '../services/gamification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const gamificationController = {
  me: asyncHandler(async (req: any, res) => {
    const profile = await gamificationService.getProfile(req.user._id);
    res.json(new ApiResponse(200, profile, 'Gamification profile retrieved'));
  }),

  leaderboard: asyncHandler(async (req: any, res) => {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const leaderboard = await gamificationService.getLeaderboard({ limit });
    res.json(new ApiResponse(200, leaderboard, 'Leaderboard retrieved'));
  }),
};
