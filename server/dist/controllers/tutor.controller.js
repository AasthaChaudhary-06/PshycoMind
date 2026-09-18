import { tutorService } from '../services/tutor.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const tutorController = {
    quickActions: asyncHandler(async (req, res) => {
        res.json(new ApiResponse(200, tutorService.quickActions(), 'Quick actions retrieved'));
    }),
    intent: asyncHandler(async (req, res) => {
        const result = await tutorService.handle(req.user._id, {
            content: req.body.content,
            documentId: req.body.documentId,
        });
        res.json(new ApiResponse(200, result, 'Tutor responded'));
    }),
};
//# sourceMappingURL=tutor.controller.js.map