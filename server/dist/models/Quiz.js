import mongoose from 'mongoose';
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
    topic: { type: String, default: '' },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
}, { _id: true });
const quizSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null,
    },
    subject: {
        type: String,
        default: 'General',
    },
    topic: {
        type: String,
        default: '',
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    questions: {
        type: [questionSchema],
        default: [],
    },
    attempts: {
        type: [
            {
                startedAt: Date,
                completedAt: Date,
                answers: [Number],
                score: Number,
                total: Number,
                percentage: Number,
                timeTakenSec: Number,
            },
        ],
        default: [],
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed'],
        default: 'draft',
    },
}, { timestamps: true });
quizSchema.index({ user: 1, createdAt: -1 });
quizSchema.index({ user: 1, difficulty: 1 });
export const Quiz = mongoose.model('Quiz', quizSchema);
//# sourceMappingURL=Quiz.js.map