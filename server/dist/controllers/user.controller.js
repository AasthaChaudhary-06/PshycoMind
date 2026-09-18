import { userService } from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const userController = {
    profile: asyncHandler(async (req, res) => {
        const profile = await userService.getProfile(req.user._id);
        res.json(new ApiResponse(200, profile, 'Profile retrieved'));
    }),
    updateProfile: asyncHandler(async (req, res) => {
        const profile = await userService.updateProfile(req.user._id, req.body);
        res.json(new ApiResponse(200, profile, 'Profile updated'));
    }),
    changePassword: asyncHandler(async (req, res) => {
        const profile = await userService.changePassword(req.user._id, req.body);
        res.json(new ApiResponse(200, profile, 'Password changed'));
    }),
    analytics: asyncHandler(async (req, res) => {
        const analytics = await userService.getAnalytics(req.user._id);
        res.json(new ApiResponse(200, analytics, 'Analytics retrieved'));
    }),
};
//# sourceMappingURL=user.controller.js.map