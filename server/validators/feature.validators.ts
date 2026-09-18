import { body } from 'express-validator';

export const createChatValidator = [
  body('title').optional().trim().isLength({ max: 120 }),
  body('documentId').optional().isMongoId().withMessage('Invalid documentId'),
];

export const sendMessageValidator = [
  body('content').trim().isLength({ min: 1, max: 4000 }).withMessage('Content is required'),
  body('documentId').optional().isMongoId(),
];

export const generateQuizValidator = [
  body('documentId').optional().isMongoId(),
  body('topic').optional().trim().isLength({ max: 100 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('questionCount').optional().isInt({ min: 3, max: 30 }),
  body('title').optional().trim().isLength({ max: 120 }),
];

export const submitAttemptValidator = [
  body('answers').isArray().withMessage('answers must be an array'),
  body('startedAt').optional().isISO8601().toDate(),
];

export const createNoteValidator = [
  body('documentId').optional().isMongoId(),
  body('title').optional().trim().isLength({ max: 160 }),
  body('body').optional().isString(),
  body('type').optional().isIn(['handwritten', 'ai-summary', 'personal']),
  body('tags').optional().isArray({ max: 20 }),
];

export const generateSummaryValidator = [
  body('documentId').isMongoId().withMessage('Valid documentId is required'),
  body('length').optional().isIn(['short', 'medium', 'long']),
];

export const generateFlashcardsValidator = [
  body('documentId').optional().isMongoId(),
  body('topic').optional().trim().isLength({ max: 100 }),
  body('count').optional().isInt({ min: 1, max: 50 }),
];

export const reviewFlashcardValidator = [
  body('quality').isInt({ min: 0, max: 5 }).withMessage('quality must be 0-5'),
];

export const createStudyPlanValidator = [
  body('title').optional().trim().isLength({ max: 160 }),
  body('goal').optional().trim().isLength({ max: 300 }),
  body('topic').optional().trim().isLength({ max: 100 }),
  body('dailyMinutes').optional().isInt({ min: 15, max: 480 }),
  body('endDate').optional().isISO8601().toDate(),
  body('tasks').optional().isArray({ max: 50 }),
];

export const updateTaskValidator = [
  body('completed').isBoolean().withMessage('completed must be a boolean'),
];

export const createExamValidator = [
  body('documentId').optional().isMongoId(),
  body('topic').optional().trim().isLength({ max: 100 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('questionCount').optional().isInt({ min: 5, max: 50 }),
  body('timeLimitMin').optional().isInt({ min: 5, max: 300 }),
  body('title').optional().trim().isLength({ max: 160 }),
];
