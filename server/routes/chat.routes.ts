import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createChatValidator, sendMessageValidator } from '../validators/feature.validators.js';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(chatController.list)
  .post(validate(createChatValidator), chatController.create);

router
  .route('/:id')
  .get(chatController.get)
  .delete(auditLog('chat.delete'), chatController.remove);

router.post('/:id/messages', validate(sendMessageValidator), chatController.sendMessage);
router.patch('/:id/title', chatController.rename);
router.post('/:id/bookmark', auditLog('chat.bookmark'), chatController.bookmark);
router.post('/:id/pin', auditLog('chat.pin'), chatController.pin);

export default router;
