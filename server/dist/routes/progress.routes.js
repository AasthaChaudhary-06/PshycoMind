import { Router } from 'express';
import { progressController } from '../controllers/progress.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(authenticate);
router.get('/me', progressController.dashboard);
router.get('/leaderboard', progressController.leaderboard);
router.post('/reading', progressController.trackReading);
router.post('/time', progressController.trackTime);
router.post('/quiz', progressController.trackQuiz);
router.get('/users/:userId', progressController.getUser);
export default router;
//# sourceMappingURL=progress.routes.js.map