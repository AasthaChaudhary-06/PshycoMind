import { Router } from 'express';
import authRoutes from './auth.routes.js';
import documentRoutes from './document.routes.js';
import chatRoutes from './chat.routes.js';
import quizRoutes from './quiz.routes.js';
import noteRoutes from './note.routes.js';
import flashcardRoutes from './flashcard.routes.js';
import progressRoutes from './progress.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import notificationRoutes from './notification.routes.js';
import realtimeRoutes from './realtime.routes.js';
import gamificationRoutes from './gamification.routes.js';
import graphRoutes from './graph.routes.js';
import studyPlanRoutes from './studyPlan.routes.js';
import examRoutes from './exam.routes.js';
import analyticsRoutes from './analytics.routes.js';
import searchRoutes from './search.routes.js';
import tutorRoutes from './tutor.routes.js';
const router = Router();
const API_PREFIX = '/api/v1';
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'PhysioMind API is healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/documents`, documentRoutes);
router.use(`${API_PREFIX}/chat`, chatRoutes);
router.use(`${API_PREFIX}/quiz`, quizRoutes);
router.use(`${API_PREFIX}/notes`, noteRoutes);
router.use(`${API_PREFIX}/flashcards`, flashcardRoutes);
router.use(`${API_PREFIX}/progress`, progressRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/admin`, adminRoutes);
router.use(`${API_PREFIX}/notifications`, notificationRoutes);
router.use(`${API_PREFIX}/realtime`, realtimeRoutes);
router.use(`${API_PREFIX}/gamification`, gamificationRoutes);
router.use(`${API_PREFIX}/graph`, graphRoutes);
router.use(`${API_PREFIX}/plans`, studyPlanRoutes);
router.use(`${API_PREFIX}/exams`, examRoutes);
router.use(`${API_PREFIX}/analytics`, analyticsRoutes);
router.use(`${API_PREFIX}/search`, searchRoutes);
router.use(`${API_PREFIX}/tutor`, tutorRoutes);
export default router;
//# sourceMappingURL=index.js.map