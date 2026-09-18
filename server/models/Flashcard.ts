import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    front: { type: String, required: true },
    back: { type: String, required: true },
    topic: { type: String, default: '' },
    mastery: {
      type: String,
      enum: ['new', 'learning', 'reviewing', 'mastered'],
      default: 'new',
    },
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
      max: 3.5,
    },
    intervalDays: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    nextReviewAt: {
      type: Date,
      default: Date.now,
    },
    lastReviewedAt: Date,
  },
  { timestamps: true },
);

flashcardSchema.index({ user: 1, nextReviewAt: 1 });
flashcardSchema.index({ user: 1, mastery: 1 });

export const Flashcard: mongoose.Model<any> = mongoose.model('Flashcard', flashcardSchema);
