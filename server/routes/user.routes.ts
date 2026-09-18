import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { auditLog } from '../middlewares/audit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { changePasswordValidator } from '../validators/auth.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.profile);
router.patch('/me', userController.updateProfile);
router.get('/me/analytics', userController.analytics);
router.post('/me/change-password', auditLog('user.changePassword'), validate(changePasswordValidator), userController.changePassword);

export default router;
