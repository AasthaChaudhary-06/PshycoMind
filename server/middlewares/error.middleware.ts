import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err;

  if (error.name === 'ValidationError') {
    error = new ApiError(400, 'Validation failed', error.errors);
  } else if (error.name === 'CastError') {
    error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  } else if (error.code === 11000) {
    error = new ApiError(409, 'Duplicate value violates a unique constraint');
  } else if (error.type === 'entity.parse.failed') {
    error = new ApiError(400, 'Malformed JSON body');
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(500, 'Internal server error', undefined, false);
  }

  if (error.statusCode >= 500) {
    logger.error({ err }, 'Unhandled error');
  } else {
    logger.warn({ err: error.message }, 'Request error');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV === 'development' && !error.isOperational
      ? { stack: err.stack }
      : {}),
  });
}
