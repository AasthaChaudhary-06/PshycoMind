import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken, generateRandomToken } from '../utils/tokens.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const authService = {
    async register({ name, email, password, role = 'student' }) {
        if (!EMAIL_REGEX.test(email)) {
            throw new ApiError(400, 'Invalid email format');
        }
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            throw new ApiError(409, 'An account with this email already exists');
        }
        const user = await userRepository.create({ name, email, password, role });
        return this._issueTokens(user);
    },
    async login({ email, password }) {
        const user = await userRepository.findByEmail(email, { includePassword: true });
        if (!user)
            throw new ApiError(401, 'Invalid email or password');
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            throw new ApiError(401, 'Invalid email or password');
        if (!user.isActive)
            throw new ApiError(403, 'Account has been deactivated');
        await userRepository.updateLastLogin(user._id);
        return this._issueTokens(user);
    },
    async refresh(refreshToken, { ip, userAgent }) {
        if (!refreshToken)
            throw new ApiError(401, 'Refresh token is required');
        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        }
        catch {
            throw new ApiError(401, 'Invalid or expired refresh token');
        }
        const tokenHash = hashToken(refreshToken);
        const stored = await refreshTokenRepository.findByHash(tokenHash);
        if (!stored || stored.revoked || stored.expiresAt < new Date()) {
            throw new ApiError(401, 'Refresh token has been revoked');
        }
        const user = await userRepository.findById(payload.sub);
        if (!user || !user.isActive)
            throw new ApiError(401, 'User no longer active');
        await refreshTokenRepository.revoke(tokenHash);
        return this._issueTokens(user, { ip, userAgent });
    },
    async logout(refreshToken) {
        if (refreshToken) {
            await refreshTokenRepository.revoke(hashToken(refreshToken));
        }
    },
    async logoutAll(userId) {
        await refreshTokenRepository.revokeAllForUser(userId);
    },
    async _issueTokens(user, meta = {}) {
        const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role });
        const refreshToken = signRefreshToken({
            sub: user._id.toString(),
            jti: generateRandomToken(16),
        });
        await refreshTokenRepository.create({
            user: user._id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + msFromString(env.JWT_REFRESH_EXPIRES_IN)),
            userAgent: meta.userAgent,
            ip: meta.ip,
        });
        return {
            accessToken,
            refreshToken,
            user: user.toSafeJSON(),
        };
    },
};
function msFromString(str) {
    const match = /^(\d+)([smhd])$/.exec(str);
    if (!match)
        return 7 * 24 * 60 * 60 * 1000;
    const [_, value, unit] = match;
    const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return Number(value) * multipliers[unit];
}
//# sourceMappingURL=auth.service.js.map