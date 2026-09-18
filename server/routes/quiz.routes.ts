import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { generateQuizValidator, submitAttemptValidator } from '../validators/feature.validators.js';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(quizController.list)
  .post(validate(generateQuizValidator), quizController.generate);

router
  .route('/:id')
  .get(quizController.get)
  .delete(auditLog('quiz.delete'), quizController.remove);

router.get('/:id/start', quizController.start);
router.post('/:id/submit', validate(submitAttemptValidator), auditLog('quiz.submit'), quizController.submit);

export default router;
