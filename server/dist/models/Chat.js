import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sources: {
        type: [
            {
                document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
                page: Number,
                excerpt: String,
                score: Number,
            },
        ],
        default: [],
    },
    latencyMs: Number,
    tokenCount: Number,
}, { timestamps: true });
const chatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: 'New Chat',
        trim: true,
        maxlength: 120,
    },
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null,
        index: true,
    },
    bookmarked: {
        type: Boolean,
        default: false,
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    messages: {
        type: [messageSchema],
        default: [],
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
chatSchema.index({ user: 1, lastMessageAt: -1 });
export const Chat = mongoose.model('Chat', chatSchema);
//# sourceMappingURL=Chat.js.map