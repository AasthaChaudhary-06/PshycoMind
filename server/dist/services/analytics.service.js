import { analyticsRepository } from '../repositories/analytics.repository.js';
export const analyticsService = {
    async getReadiness(userId) {
        const [quizzes, exams, flashcards, progress, documents] = await Promise.all([
            analyticsRepository.quizzes(userId),
            analyticsRepository.exams(userId),
            analyticsRepository.flashcardStats(userId),
            analyticsRepository.progress(userId),
            analyticsRepository.documents(userId),
        ]);
        const quizAttempts = quizzes
            .flatMap((q) => (q.attempts || []).map((a) => ({ ...a, topic: q.topic })))
            .sort((a, b) => new Date(a.submittedAt || a.completedAt || 0).getTime() -
            new Date(b.submittedAt || b.completedAt || 0).getTime());
        const examAttempts = exams.flatMap((e) => e.attempts || []);
        const avgQuiz = quizAttempts.length
            ? quizAttempts.reduce((s, a) => s + a.percentage, 0) / quizAttempts.length
            : 0;
        const started = progress?.documents?.length || 0;
        const completedDocs = progress?.documents?.filter((d) => d.isCompleted).length || 0;
        const coverage = started ? (completedDocs / started) * 100 : Math.min(100, documents.length * 20);
        const mastery = flashcards.total ? (flashcards.mastered / flashcards.total) * 100 : 0;
        const streak = Math.min(progress?.streakDays || 0, 30);
        const consistency = (streak / 30) * 100;
        const examPractice = Math.min(100, (examAttempts.length / 3) * 100);
        const components = {
            quizPerformance: { score: clamp(avgQuiz), weight: 40 },
            contentCoverage: { score: clamp(coverage), weight: 15 },
            flashcardMastery: { score: clamp(mastery), weight: 15 },
            consistency: { score: clamp(consistency), weight: 15 },
            examPractice: { score: clamp(examPractice), weight: 15 },
        };
        const overall = Math.round(Object.values(components).reduce((sum, c) => sum + c.score * (c.weight / 100), 0));
        return {
            overall,
            status: overall >= 80 ? 'ready' : overall >= 50 ? 'getting-there' : 'not-ready',
            components: Object.fromEntries(Object.entries(components).map(([key, c]) => [key, Math.round(c.score)])),
            totals: {
                quizAttempts: quizAttempts.length,
                examAttempts: examAttempts.length,
                documents: documents.length,
                flashcards: flashcards.total,
                masteredFlashcards: flashcards.mastered,
                streakDays: progress?.streakDays || 0,
                averageQuizScore: Math.round(avgQuiz),
            },
            recommendations: buildRecommendations({
                avgQuiz,
                coverage,
                mastery,
                consistency: progress?.streakDays || 0,
                examAttempts: examAttempts.length,
                flashcards,
            }),
        };
    },
    async getTrends(userId) {
        const [quizzes, progress] = await Promise.all([
            analyticsRepository.quizzes(userId),
            analyticsRepository.progress(userId),
        ]);
        const quizTrend = quizzes
            .flatMap((q) => (q.attempts || []).map((a) => ({
            date: (a.submittedAt || a.completedAt || q.createdAt),
            score: a.percentage || 0,
            title: q.title,
        })))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-20);
        const weekly = (progress?.weeklyActivity || []).map((w) => ({
            day: w.day,
            studySeconds: w.studySeconds || 0,
        }));
        return {
            quizTrend,
            weeklyActivity: weekly,
            readingTimeSec: progress?.readingTimeSec || 0,
            totalPagesRead: progress?.totalPagesRead || 0,
        };
    },
    async getTopics(userId) {
        const [quizzes, flashcards] = await Promise.all([
            analyticsRepository.quizzes(userId),
            analyticsRepository.flashcardStats(userId),
        ]);
        const topicMap = {};
        for (const quiz of quizzes) {
            for (const attempt of quiz.attempts || []) {
                quiz.questions.forEach((q, index) => {
                    const topic = q.topic || quiz.topic || 'General';
                    if (!topicMap[topic]) {
                        topicMap[topic] = { total: 0, correct: 0, attempts: 0 };
                    }
                    topicMap[topic].total += 1;
                    topicMap[topic].attempts += 1;
                    if (attempt.answers?.[index] === q.correctIndex) {
                        topicMap[topic].correct += 1;
                    }
                });
            }
        }
        const topics = Object.entries(topicMap)
            .map(([name, data]) => ({
            name,
            questions: data.total,
            attempts: data.attempts,
            accuracy: data.total ? Math.round((data.correct / data.total) * 100) : 0,
        }))
            .sort((a, b) => b.questions - a.questions)
            .slice(0, 15);
        return { topics, flashcards };
    },
};
function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
function buildRecommendations({ avgQuiz, coverage, mastery, consistency, examAttempts, flashcards }) {
    const recommendations = [];
    if (avgQuiz < 60) {
        recommendations.push({
            type: 'quiz',
            message: 'Your average quiz score is below 60%. Retake quizzes and review explanations for missed questions.',
        });
    }
    if (coverage < 50) {
        recommendations.push({
            type: 'coverage',
            message: 'You have not finished most of your documents. Complete reading them to unlock more targeted practice.',
        });
    }
    if (mastery < 40 && flashcards.total > 0) {
        recommendations.push({
            type: 'flashcards',
            message: 'Master more flashcards — aim to move at least 40% of your cards to "mastered" via spaced review.',
        });
    }
    if (consistency < 3) {
        recommendations.push({
            type: 'consistency',
            message: 'Build a daily study streak. Even 20 minutes a day compounds your exam readiness.',
        });
    }
    if (examAttempts < 3) {
        recommendations.push({
            type: 'exam',
            message: 'Take timed mock exams to simulate real test conditions and build endurance.',
        });
    }
    if (!recommendations.length) {
        recommendations.push({
            type: 'ready',
            message: 'You look exam-ready! Maintain your routine and take a mock exam every few days to stay sharp.',
        });
    }
    return recommendations;
}
//# sourceMappingURL=analytics.service.js.map