import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
let inMemoryServer;
export async function connectDB() {
    mongoose.set('strictQuery', true);
    mongoose.connection.on('connected', () => {
        logger.info('MongoDB connected');
    });
    mongoose.connection.on('error', (err) => {
        logger.error({ err }, 'MongoDB connection error');
    });
    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
    });
    try {
        await mongoose.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
    }
    catch (err) {
        logger.warn({ err: err.message }, 'MongoDB at %s unreachable - falling back to in-memory MongoDB', env.MONGODB_URI);
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        inMemoryServer = await MongoMemoryServer.create();
        const uri = inMemoryServer.getUri();
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000,
        });
        logger.info('Connected to in-memory MongoDB at %s', uri);
    }
    return mongoose.connection;
}
export async function disconnectDB() {
    if (inMemoryServer) {
        await inMemoryServer.stop();
        inMemoryServer = undefined;
    }
    await mongoose.disconnect();
}
//# sourceMappingURL=db.js.map