import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.AI_PROVIDER = 'mock';
process.env.PORT = '5000';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:59999/physiomind-test';

const { default: app } = await import('../app.js');
const { connectDB, disconnectDB } = await import('../config/db.js');

let accessToken: string;
let userId: string;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Health', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Student',
      email: 'test@physiomind.dev',
      password: 'Test@1234',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('test@physiomind.dev');
  });

  it('rejects duplicate emails', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Student',
      email: 'test@physiomind.dev',
      password: 'Test@1234',
    });
    expect(res.status).toBe(409);
  });

  it('logs in and returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@physiomind.dev',
      password: 'Test@1234',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    accessToken = res.body.data.accessToken;
    userId = res.body.data.user._id;
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@physiomind.dev',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
  });
});

describe('Gamification', () => {
  it('GET /gamification/me requires auth', async () => {
    const res = await request(app).get('/api/v1/gamification/me');
    expect(res.status).toBe(401);
  });

  it('returns a gamification profile', async () => {
    const res = await request(app)
      .get('/api/v1/gamification/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('xp');
    expect(res.body.data).toHaveProperty('level');
    expect(res.body.data).toHaveProperty('badges');
  });

  it('returns a leaderboard', async () => {
    const res = await request(app)
      .get('/api/v1/gamification/leaderboard')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Quiz flow (mock AI)', () => {
  let quizId: string;

  it('generates a quiz with the requested question count', async () => {
    const res = await request(app)
      .post('/api/v1/quiz')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ topic: 'Respiratory physiology', questionCount: 5, difficulty: 'easy' });
    expect(res.status).toBe(201);
    expect(res.body.data.questions).toHaveLength(5);
    quizId = res.body.data._id;
  });

  it('submits a quiz and returns a grade', async () => {
    const quiz = await request(app)
      .get(`/api/v1/quiz/${quizId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    const questions = quiz.body.data.questions;
    const answers = questions.map((q: any) => q.correctIndex);

    const res = await request(app)
      .post(`/api/v1/quiz/${quizId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ answers });
    expect(res.status).toBe(200);
    expect(res.body.data.attempt.percentage).toBe(100);
  });

  it('awards XP for completing a quiz', async () => {
    const res = await request(app)
      .get('/api/v1/gamification/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.stats.quizzesTaken).toBeGreaterThanOrEqual(1);
  });
});

describe('Exam flow (mock AI)', () => {
  let examId: string;

  it('creates a timed mock exam', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ topic: 'Cardiovascular physiology', questionCount: 10, timeLimitMin: 15 });
    expect(res.status).toBe(201);
    expect(res.body.data.questions).toHaveLength(10);
    examId = res.body.data._id;
  });

  it('start hides correct answers', async () => {
    const res = await request(app)
      .get(`/api/v1/exams/${examId}/start`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.questions[0]).not.toHaveProperty('correctIndex');
    expect(res.body.data.attempt.timeLimitMin).toBe(15);
  });

  it('submits the exam and grades it', async () => {
    const res = await request(app)
      .post(`/api/v1/exams/${examId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ answers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1] });
    expect(res.status).toBe(200);
    expect(res.body.data.attempt.total).toBe(10);
    expect(res.body.data.explanations).toHaveLength(10);
  });
});

describe('Study plans (mock AI)', () => {
  it('creates a study plan with generated tasks', async () => {
    const res = await request(app)
      .post('/api/v1/plans')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Final prep', topic: 'Cardiovascular physiology', dailyMinutes: 60 });
    expect(res.status).toBe(201);
    expect(res.body.data.tasks.length).toBeGreaterThan(0);
  });

  it('lists plans', async () => {
    const res = await request(app)
      .get('/api/v1/plans')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Analytics & search', () => {
  it('returns exam readiness', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/readiness')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('overall');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('components');
  });

  it('returns topic mastery', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/topics')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('topics');
  });

  it('searches across content', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=cardiac')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('documents');
  });

  it('rejects empty search queries', async () => {
    const res = await request(app)
      .get('/api/v1/search')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(400);
  });
});
