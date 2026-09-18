import { logger } from '../utils/logger.js';
/**
 * Structured audit logging for sensitive operations.
 * Middleware style: attach to routes that mutate data.
 */
export const auditLog = (action) => (req, res, next) => {
    const started = Date.now();
    res.on('finish', () => {
        if (res.statusCode < 500) {
            logger.info({
                action,
                userId: req.user?._id,
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                durationMs: Date.now() - started,
            }, `audit:${action}`);
        }
    });
    next();
};
//# sourceMappingURL=audit.middleware.js.map