import { Router } from 'express';
import { examController } from '../controllers/exam.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createExamValidator, submitAttemptValidator, } from '../validators/feature.validators.js';
const router = Router();
router.use(authenticate);
router
    .route('/')
    .get(examController.list)
    .post(validate(createExamValidator), examController.create);
router.route('/:id').get(examController.get).delete(examController.remove);
router.get('/:id/start', examController.start);
router.post('/:id/submit', validate(submitAttemptValidator), examController.submit);
export default router;
//# sourceMappingURL=exam.routes.js.map