import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const storage = {
    async save({ buffer, originalName, mimeType }) {
        const key = buildKey(originalName);
        if (env.USE_S3) {
            return this._saveS3(buffer, key, mimeType);
        }
        await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
        await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, key), buffer);
        logger.info('Saved upload locally: %s', key);
        return key;
    },
    async delete(key) {
        if (env.USE_S3) {
            await this._deleteS3(key);
            return;
        }
        try {
            await fs.unlink(path.join(LOCAL_UPLOAD_DIR, key));
        }
        catch (err) {
            if (err.code !== 'ENOENT')
                logger.warn({ err }, 'Failed to delete local file');
        }
    },
    async readFile(key) {
        if (env.USE_S3) {
            throw new Error('S3 storage is not configured. Install @aws-sdk/client-s3 and set S3_* env vars.');
        }
        return fs.readFile(path.join(LOCAL_UPLOAD_DIR, key));
    },
    async _saveS3(buffer, key, mimeType) {
        // Requires the AWS SDK v3 (@aws-sdk/client-s3) to be installed.
        throw new Error('S3 storage is not configured. Install @aws-sdk/client-s3 and set S3_* env vars.');
    },
    async _deleteS3(key) {
        throw new Error('S3 storage is not configured. Install @aws-sdk/client-s3 and set S3_* env vars.');
    },
};
function buildKey(originalName) {
    const ext = path.extname(originalName || '').toLowerCase();
    return `${randomUUID()}${ext}`;
}
//# sourceMappingURL=storage.js.map