import pino from 'pino';
export const logger = pino({
    level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
        : undefined,
});
//# sourceMappingURL=logger.js.map