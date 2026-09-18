import mongoose from 'mongoose';

const examQuestionSchema = new mongoose.Schema(
  {
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
  },
  { _id: true },
);

const examSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    subject: { type: String, default: 'General' },
    topic: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questionCount: { type: Number, default: 20 },
    timeLimitMin: { type: Number, default: 30 },
    questions: { type: [examQuestionSchema], default: [] },
    attempts: {
      type: [
        {
          startedAt: Date,
          submittedAt: Date,
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
  },
  { timestamps: true },
);

examSchema.index({ user: 1, createdAt: -1 });
examSchema.index({ user: 1, status: 1 });

export const Exam: mongoose.Model<any> = mongoose.model('Exam', examSchema);
