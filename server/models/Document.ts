import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    charCount: { type: Number, default: 0 },
  },
  { _id: false },
);

const chunkSchema = new mongoose.Schema(
  {
    page: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], default: [] },
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    subject: {
      type: String,
      default: 'General',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'md', 'txt', 'docx'],
    },
    mimeType: String,
    sizeBytes: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      comment: 'Local path or S3 key',
    },
    pages: {
      type: [pageSchema],
      default: [],
      select: false,
    },
    chunks: {
      type: [chunkSchema],
      default: [],
      select: false,
    },
    metadata: {
      author: String,
      keywords: [String],
      createdAt: Date,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
      index: true,
    },
    processingError: String,
    processedAt: Date,
  },
  { timestamps: true },
);

documentSchema.index({ owner: 1, isFavorite: 1 });
documentSchema.index({ owner: 1, status: 1 });
documentSchema.index({ subject: 1, status: 1 });

documentSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.pages;
  delete obj.chunks;
  return obj;
};

export const Document: mongoose.Model<any> = mongoose.model('Document', documentSchema);
