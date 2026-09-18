import { ApiError } from '../utils/ApiError.js';
export const authorize = (...roles) => (req, res, next) => {
    if (!req.user)
        throw new ApiError(401, 'Authentication required');
    if (!roles.includes(req.user.role)) {
        throw new ApiError(403, `Requires role: ${roles.join(' or ')}`);
    }
    next();
};
export const requireAdmin = authorize('admin');
export const requireFacultyOrAdmin = authorize('faculty', 'admin');
//# sourceMappingURL=role.middleware.js.map