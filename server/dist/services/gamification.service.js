import { User } from '../models/User.js';
import { Progress } from '../models/Progress.js';
export const XP_LEVEL_STEP = 250;
export const BADGES = [
    { id: 'first_document', name: 'First Steps', description: 'Uploaded your first document', icon: '📄' },
    { id: 'quiz_ace', name: 'Quiz Ace', description: 'Scored 100% on a quiz', icon: '🎯' },
    { id: 'flashcard_fan', name: 'Flashcard Fanatic', description: 'Reviewed 25 flashcards', icon: '🃏' },
    { id: 'chatty', name: 'Curious Mind', description: 'Sent 10 chat messages', icon: '💬' },
    { id: 'streak_3', name: 'On Fire', description: '3-day study streak', icon: '🔥' },
    { id: 'planner', name: 'Strategist', description: 'Generated a study plan', icon: '🗓️' },
    { id: 'exam_taker', name: 'Exam Warrior', description: 'Completed an exam', icon: '⚔️' },
];
const XP_AWARDS = {
    'document.uploaded': { xp: 50, counter: 'documentsUploaded' },
    'quiz.completed': { xp: 20, counter: 'quizzesTaken' },
    'quiz.ace': { xp: 30 },
    'flashcard.review': { xp: 2, counter: 'flashcardReviews' },
    'chat.message': { xp: 1, counter: 'chatMessages' },
    'exam.completed': { xp: 40, counter: 'examsTaken' },
    'plan.created': { xp: 25, counter: 'plansCreated' },
    'plan.day': { xp: 10, counter: 'daysCompleted' },
};
export const gamificationService = {
    async awardXp(userId, reason, extra = {}) {
        const config = XP_AWARDS[reason];
        if (!config)
            return null;
        const user = await User.findById(userId);
        if (!user)
            return null;
        const before = user.xp || 0;
        user.xp = before + config.xp;
        const newLevel = 1 + Math.floor(user.xp / XP_LEVEL_STEP);
        const leveledUp = newLevel > (user.level || 1);
        user.level = newLevel;
        if (config.counter && user.stats) {
            user.stats[config.counter] = (user.stats[config.counter] || 0) + 1;
        }
        if (extra.bestQuizScore !== undefined) {
            user.stats.bestQuizScore = Math.max(user.stats.bestQuizScore || 0, extra.bestQuizScore);
        }
        const newBadges = await this._checkBadges(user);
        await user.save();
        return { xp: user.xp, level: user.level, leveledUp, newBadges };
    },
    async _checkBadges(user) {
        const owned = new Set(user.badges || []);
        const unlocked = [];
        const progress = await Progress.findOne({ user: user._id }).exec();
        const conditions = {
            first_document: (user.stats?.documentsUploaded || 0) >= 1,
            quiz_ace: (user.stats?.bestQuizScore || 0) >= 100,
            flashcard_fan: (user.stats?.flashcardReviews || 0) >= 25,
            chatty: (user.stats?.chatMessages || 0) >= 10,
            planner: (user.stats?.plansCreated || 0) >= 1,
            exam_taker: (user.stats?.examsTaken || 0) >= 1,
            streak_3: (progress?.streakDays || 0) >= 3,
        };
        for (const badge of BADGES) {
            if (!owned.has(badge.id) && conditions[badge.id]) {
                owned.add(badge.id);
                unlocked.push(badge.id);
            }
        }
        user.badges = [...owned];
        return unlocked;
    },
    async getProfile(userId) {
        const user = await User.findById(userId).select('name email role xp level badges stats avatar').exec();
        if (!user)
            return null;
        const xp = user.xp || 0;
        const level = user.level || 1;
        const currentLevelXp = (level - 1) * XP_LEVEL_STEP;
        const nextLevelXp = level * XP_LEVEL_STEP;
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            xp,
            level,
            xpIntoLevel: xp - currentLevelXp,
            xpToNextLevel: nextLevelXp - currentLevelXp,
            progressPct: Math.min(100, Math.round(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)),
            badges: (user.badges || []).map((id) => BADGES.find((b) => b.id === id) || { id, name: id, description: '', icon: '🏅' }),
            stats: user.stats || {},
        };
    },
    async getLeaderboard({ limit = 50 } = {}) {
        return User.find({})
            .select('name xp level badges avatar role')
            .sort({ xp: -1 })
            .limit(limit)
            .lean()
            .exec();
    },
};
export function levelForXp(xp) {
    return 1 + Math.floor(xp / XP_LEVEL_STEP);
}
//# sourceMappingURL=gamification.service.js.map