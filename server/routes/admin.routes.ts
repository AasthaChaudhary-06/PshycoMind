import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/User.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [users, documents, quizzes, notes] = await Promise.all([
      User.countDocuments(),
      import('../models/Document.js').then(({ Document }) => Document.countDocuments()),
      import('../models/Quiz.js').then(({ Quiz }) => Quiz.countDocuments()),
      import('../models/Note.js').then(({ Note }) => Note.countDocuments()),
    ]);

    res.json(new ApiResponse(200, { users, documents, quizzes, notes }, 'Platform stats'));
  }),
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const [docs, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      User.countDocuments(),
    ]);

    res.json(
      new ApiResponse(200, {
        docs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }, 'Users list'),
    );
  }),
);

export default router;
