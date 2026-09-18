import mongoose from 'mongoose';
const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    documentsProcessed: {
        type: Number,
        default: 0,
    },
    totalPagesRead: {
        type: Number,
        default: 0,
    },
    readingTimeSec: {
        type: Number,
        default: 0,
    },
    documents: {
        type: [
            {
                document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
                pagesRead: Number,
                lastPage: Number,
                percentComplete: Number,
                lastOpenedAt: Date,
                isCompleted: { type: Boolean, default: false },
            },
        ],
        default: [],
    },
    quizStats: {
        totalAttempts: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        bestScore: { type: Number, default: 0 },
    },
    flashcardStats: {
        totalCards: { type: Number, default: 0 },
        dueToday: { type: Number, default: 0 },
        mastered: { type: Number, default: 0 },
    },
    streakDays: {
        type: Number,
        default: 0,
    },
    lastActiveAt: {
        type: Date,
        default: Date.now,
    },
    weeklyActivity: {
        type: [
            {
                day: String,
                studySeconds: Number,
            },
        ],
        default: [],
    },
}, { timestamps: true });
export const Progress = mongoose.model('Progress', progressSchema);
//# sourceMappingURL=Progress.js.map