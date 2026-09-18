import crypto from 'node:crypto';
export function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
export function generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}
//# sourceMappingURL=tokens.js.map