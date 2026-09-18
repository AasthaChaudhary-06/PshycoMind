import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['document', 'quiz', 'notes', 'flashcards', 'chat', 'system'],
        default: 'system',
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        default: '',
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
}, { timestamps: true });
notificationSchema.index({ user: 1, createdAt: -1 });
export const Notification = mongoose.model('Notification', notificationSchema);
//# sourceMappingURL=Notification.js.map