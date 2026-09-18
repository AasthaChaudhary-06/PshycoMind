import { RefreshToken } from '../models/RefreshToken.js';
export const refreshTokenRepository = {
    async create(data) {
        return RefreshToken.create(data);
    },
    async findByHash(tokenHash) {
        return RefreshToken.findOne({ tokenHash }).exec();
    },
    async revoke(tokenHash) {
        return RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true, revokedAt: new Date() }, { new: true }).exec();
    },
    async revokeAllForUser(userId) {
        return RefreshToken.updateMany({ user: userId, revoked: false }, { revoked: true, revokedAt: new Date() }).exec();
    },
};
//# sourceMappingURL=refreshToken.repository.js.map