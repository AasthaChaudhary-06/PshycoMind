import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { app } from './app.js';

async function start() {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`🚀 PhysioMind API running on http://localhost:${env.PORT}`);
      logger.info(`AI provider: ${env.AI_PROVIDER}`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();

export default app;
