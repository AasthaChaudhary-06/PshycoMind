import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const authenticate = asyncHandler(async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token)
        throw new ApiError(401, 'Authentication token is missing');
    let payload;
    try {
        payload = verifyAccessToken(token);
    }
    catch {
        throw new ApiError(401, 'Invalid or expired token');
    }
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive)
        throw new ApiError(401, 'User is no longer active');
    req.user = user;
    req.tokenPayload = payload;
    next();
});
//# sourceMappingURL=auth.middleware.js.map