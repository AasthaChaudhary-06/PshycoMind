import mongoose from 'mongoose';
const highlightSchema = new mongoose.Schema({
    page: { type: Number, required: true },
    selection: { type: String, default: '' },
    color: {
        type: String,
        enum: ['yellow', 'green', 'blue', 'pink'],
        default: 'yellow',
    },
    range: {
        start: Number,
        end: Number,
    },
}, { _id: true });
const bookmarkSchema = new mongoose.Schema({
    page: { type: Number, required: true },
    label: { type: String, default: '' },
}, { _id: true });
const noteSchema = new mongoose.Schema({
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
    title: {
        type: String,
        default: 'Untitled Note',
        trim: true,
    },
    body: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        enum: ['handwritten', 'ai-summary', 'personal'],
        default: 'personal',
    },
    highlights: {
        type: [highlightSchema],
        default: [],
    },
    bookmarks: {
        type: [bookmarkSchema],
        default: [],
    },
    tags: {
        type: [String],
        default: [],
    },
    pinned: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
noteSchema.index({ user: 1, pinned: -1, updatedAt: -1 });
export const Note = mongoose.model('Note', noteSchema);
//# sourceMappingURL=Note.js.map