import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

const MAX_SIZE = env.MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED = new Set(env.ALLOWED_FILE_TYPES.split(',').map((t) => t.trim()));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ALLOWED.has(ext)) {
      return cb(new ApiError(415, `File type ".${ext}" is not allowed`));
    }
    return cb(null, true);
  },
});

export const uploadSingle = upload.single('file');
