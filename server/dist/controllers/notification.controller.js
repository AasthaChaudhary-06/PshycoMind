import { notificationService } from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
export const notificationController = {
    list: asyncHandler(async (req, res) => {
        const result = await notificationService.listForUser(req.user._id, req.query);
        res.json(new ApiResponse(200, result, 'Notifications retrieved'));
    }),
    unreadCount: asyncHandler(async (req, res) => {
        const unread = await notificationService.unreadCount(req.user._id);
        res.json(new ApiResponse(200, { unread }, 'Unread count retrieved'));
    }),
    markRead: asyncHandler(async (req, res) => {
        const notification = await notificationService.markRead(req.user._id, req.params.id);
        if (!notification)
            throw new ApiError(404, 'Notification not found');
        res.json(new ApiResponse(200, notification, 'Notification marked as read'));
    }),
    markAllRead: asyncHandler(async (req, res) => {
        await notificationService.markAllRead(req.user._id);
        res.json(new ApiResponse(200, { unread: 0 }, 'All notifications marked as read'));
    }),
};
//# sourceMappingURL=notification.controller.js.map