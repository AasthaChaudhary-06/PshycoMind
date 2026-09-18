export class ApiError extends Error {
  statusCode: any;
  isOperational: any;
  details: any;

  constructor(statusCode, message, details = undefined, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
