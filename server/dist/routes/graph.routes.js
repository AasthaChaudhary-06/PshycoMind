import { Router } from 'express';
import { graphController } from '../controllers/graph.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(authenticate);
router.get('/:documentId', graphController.get);
router.post('/:documentId/generate', graphController.generate);
export default router;
//# sourceMappingURL=graph.routes.js.map