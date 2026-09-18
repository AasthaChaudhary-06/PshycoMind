import multer from 'multer';
import path from 'path';
import fs from 'fs';
// @ts-expect-error package ships no types
import { nanoid } from 'nanoid';
// @ts-expect-error package ships no types
import { config } from './env.js';
fs.mkdirSync(path.resolve(config.upload.dir), { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.resolve(config.upload.dir)),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${nanoid(16)}${ext}`);
    },
});
const allowedMimeTypes = ['application/pdf', 'application/octet-stream'];
const fileFilter = (req, file, cb) => {
    const isPdf = allowedMimeTypes.includes(file.mimetype) ||
        file.originalname.toLowerCase().endsWith('.pdf');
    if (isPdf)
        cb(null, true);
    else
        cb(new Error('Only PDF files are allowed'));
};
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxSizeMb * 1024 * 1024,
    },
});
//# sourceMappingURL=upload.js.map