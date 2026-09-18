import { body, query } from 'express-validator';

export const uploadDocumentValidator = [
  body('subject').optional().trim().isLength({ max: 60 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

export const listDocumentsValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('subject').optional().isString(),
  query('favorite').optional().isIn(['true', 'false']),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc']),
];

export const updateDocumentValidator = [
  body('title').optional().trim().isLength({ min: 1, max: 160 }),
  body('subject').optional().trim().isLength({ max: 60 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('tags').optional().isArray({ max: 20 }),
];
