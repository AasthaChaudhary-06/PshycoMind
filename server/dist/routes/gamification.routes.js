import { Router } from 'express';
import { gamificationController } from '../controllers/gamification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(authenticate);
router.get('/me', gamificationController.me);
router.get('/leaderboard', gamificationController.leaderboard);
export default router;
//# sourceMappingURL=gamification.routes.js.map