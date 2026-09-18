import { Router } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { realtime } from '../realtime/hub.js';

const router = Router();

const HEARTBEAT_MS = 25 * 1000;

router.get('/stream', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : typeof req.query.token === 'string'
      ? req.query.token
      : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token is missing' });
  }

  let user;
  try {
    const payload = verifyAccessToken(token);
    user = await userRepository.findById(payload.sub);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'User is no longer active' });
  }

  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write('retry: 3000\n\n');

  const unsubscribe = realtime.subscribe(user._id, res);

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(`: hb ${Date.now()}\n\n`);
  }, HEARTBEAT_MS);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

export default router;
