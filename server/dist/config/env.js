import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/physiomind'),
    JWT_ACCESS_SECRET: z.string().default('dev-access-secret'),
    JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    USE_S3: z.coerce.boolean().default(false),
    S3_ENDPOINT: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_REGION: z.string().default('us-east-1'),
    VECTOR_DB_URL: z.string().optional(),
    AI_PROVIDER: z.enum(['openai', 'anthropic', 'mock']).default('mock'),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default('gpt-4o-mini'),
    ANTHROPIC_API_KEY: z.string().optional(),
    ANTHROPIC_MODEL: z.string().default('claude-3-5-sonnet-20240620'),
    EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
    MAX_FILE_SIZE_MB: z.coerce.number().default(50),
    ALLOWED_FILE_TYPES: z.string().default('pdf,md,txt,docx'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(300),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map