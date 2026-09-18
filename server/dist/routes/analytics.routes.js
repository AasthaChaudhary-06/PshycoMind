import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(authenticate);
router.get('/readiness', analyticsController.readiness);
router.get('/trends', analyticsController.trends);
router.get('/topics', analyticsController.topics);
export default router;
//# sourceMappingURL=analytics.routes.js.map