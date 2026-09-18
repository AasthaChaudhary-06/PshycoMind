import { Router } from 'express';
import { documentController } from '../controllers/document.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadDocumentValidator, listDocumentsValidator, updateDocumentValidator, } from '../validators/document.validator.js';
const router = Router();
router.use(authenticate);
router
    .route('/')
    .get(validate(listDocumentsValidator), documentController.list)
    .post(auditLog('document.upload'), uploadSingle, validate(uploadDocumentValidator), documentController.upload);
router.get('/search', validate(listDocumentsValidator), documentController.list);
router
    .route('/:id')
    .get(documentController.get)
    .patch(auditLog('document.update'), validate(updateDocumentValidator), documentController.update)
    .delete(auditLog('document.delete'), documentController.remove);
router.get('/:id/content', documentController.getContent);
router.post('/:id/favorite', auditLog('document.favorite'), documentController.favorite);
router.delete('/:id/favorite', auditLog('document.unfavorite'), documentController.unfavorite);
export default router;
//# sourceMappingURL=document.routes.js.map