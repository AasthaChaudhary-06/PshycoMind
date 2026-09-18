import mongoose from 'mongoose';
const studyTaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null,
    },
    durationMin: { type: Number, default: 30 },
    order: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    topics: { type: [String], default: [] },
}, { _id: true });
const studyPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: { type: String, required: true },
    goal: { type: String, default: '' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    dailyMinutes: { type: Number, default: 60 },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active',
    },
    tasks: { type: [studyTaskSchema], default: [] },
}, { timestamps: true });
studyPlanSchema.index({ user: 1, status: 1 });
studyPlanSchema.index({ user: 1, createdAt: -1 });
export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
//# sourceMappingURL=StudyPlan.js.map