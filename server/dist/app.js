import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { setupSwagger } from './docs/swagger.js';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
export const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = resolve(__dirname, '../client/dist');
app.set('trust proxy', 1);
app.use(helmet());
app.use(compression({
    filter: (req, res) => {
        if (req.headers.accept?.includes('text/event-stream'))
            return false;
        return compression.filter(req, res);
    },
}));
app.use(cors({
    origin: env.CLIENT_URL.split(',').map((o) => o.trim()),
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}
app.use(pinoHttp({ logger }));
if (existsSync(clientDist)) {
    app.use(express.static(clientDist, {
        maxAge: '1y',
        immutable: true,
        setHeaders(res, filePath) {
            if (filePath.endsWith('index.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        },
    }));
}
setupSwagger(app);
app.use('/api', apiLimiter);
app.use(routes);
if (existsSync(clientDist)) {
    app.get(/^(?!\/api\/).*/, (req, res) => {
        res.sendFile(join(clientDist, 'index.html'));
    });
}
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map