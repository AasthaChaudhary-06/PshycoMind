import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { User } from './models/User.js';

const ADMIN = {
  name: 'Admin User',
  email: 'admin@physiomind.dev',
  password: 'Admin@123',
  role: 'admin',
};

const FACULTY = {
  name: 'Dr. Jane Faculty',
  email: 'faculty@physiomind.dev',
  password: 'Faculty@123',
  role: 'faculty',
};

const STUDENT = {
  name: 'Demo Student',
  email: 'student@physiomind.dev',
  password: 'Student@123',
  role: 'student',
};

async function seed() {
  await connectDB();
  logger.info('Connected to database, seeding...');

  for (const seedUser of [ADMIN, FACULTY, STUDENT]) {
    const exists = await User.findOne({ email: seedUser.email });
    if (exists) {
      logger.info('Skipping existing user: %s', seedUser.email);
      continue;
    }

    await User.create({ ...seedUser });
    logger.info('Created user: %s (%s)', seedUser.email, seedUser.role);
  }

  logger.info('✅ Seed complete. Demo credentials:');
  logger.info('  Admin  : %s / %s', ADMIN.email, ADMIN.password);
  logger.info('  Faculty: %s / %s', FACULTY.email, FACULTY.password);
  logger.info('  Student: %s / %s', STUDENT.email, STUDENT.password);

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
