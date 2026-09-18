import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['student', 'faculty', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      fontSize: {
        type: Number,
        default: 16,
      },
    },
    xp: {
      type: Number,
      default: 0,
      index: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    badges: {
      type: [String],
      default: [],
    },
    stats: {
      documentsUploaded: { type: Number, default: 0 },
      quizzesTaken: { type: Number, default: 0 },
      bestQuizScore: { type: Number, default: 0 },
      flashcardReviews: { type: Number, default: 0 },
      chatMessages: { type: Number, default: 0 },
      examsTaken: { type: Number, default: 0 },
      plansCreated: { type: Number, default: 0 },
      daysCompleted: { type: Number, default: 0 },
      studyStreakDays: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const { password, ...rest } = this.toObject();
  return rest;
};

export const User: mongoose.Model<any> = mongoose.model('User', userSchema);
export const USER_ROLES = ROLES;
