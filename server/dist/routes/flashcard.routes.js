import { Router } from 'express';
import { flashcardController } from '../controllers/flashcard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { generateFlashcardsValidator, reviewFlashcardValidator } from '../validators/feature.validators.js';
const router = Router();
router.use(authenticate);
router
    .route('/')
    .get(flashcardController.list)
    .post(validate(generateFlashcardsValidator), flashcardController.generate);
router
    .route('/:id')
    .delete(auditLog('flashcard.delete'), flashcardController.remove);
router.post('/:id/review', validate(reviewFlashcardValidator), auditLog('flashcard.review'), flashcardController.review);
export default router;
//# sourceMappingURL=flashcard.routes.js.map