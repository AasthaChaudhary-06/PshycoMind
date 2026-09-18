import { Router } from 'express';
import { studyPlanController } from '../controllers/studyPlan.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createStudyPlanValidator, updateTaskValidator, } from '../validators/feature.validators.js';
const router = Router();
router.use(authenticate);
router
    .route('/')
    .get(studyPlanController.list)
    .post(validate(createStudyPlanValidator), studyPlanController.create);
router.route('/:id').get(studyPlanController.get).delete(studyPlanController.remove);
router.patch('/:id/tasks/:taskId', validate(updateTaskValidator), studyPlanController.updateTask);
export default router;
//# sourceMappingURL=studyPlan.routes.js.map