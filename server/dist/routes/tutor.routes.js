import { Router } from 'express';
import { tutorController } from '../controllers/tutor.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { body } from 'express-validator';
const router = Router();
router.use(authenticate);
router.get('/quick-actions', tutorController.quickActions);
router.post('/intent', validate([
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content is required'),
    body('documentId').optional().isMongoId(),
]), tutorController.intent);
export default router;
//# sourceMappingURL=tutor.routes.js.map