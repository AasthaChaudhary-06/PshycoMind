import { Router } from 'express';
import { noteController } from '../controllers/note.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createNoteValidator, generateSummaryValidator } from '../validators/feature.validators.js';
const router = Router();
router.use(authenticate);
router
    .route('/')
    .get(noteController.list)
    .post(validate(createNoteValidator), noteController.create);
router
    .route('/:id')
    .get(noteController.get)
    .patch(auditLog('note.update'), noteController.update)
    .delete(auditLog('note.delete'), noteController.remove);
router.post('/generate/summary', validate(generateSummaryValidator), noteController.generateSummary);
export default router;
//# sourceMappingURL=note.routes.js.map