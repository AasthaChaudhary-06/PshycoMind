import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    explanation: { type: String, default: '' },
    page: { type: Number, default: 1 },
    importance: { type: Number, default: 0 },
  },
  { _id: false },
);

const edgeSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    target: { type: String, required: true },
    relation: { type: String, default: 'related to' },
  },
  { _id: false },
);

const knowledgeGraphSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
    title: { type: String, default: '' },
    nodes: { type: [nodeSchema], default: [] },
    edges: { type: [edgeSchema], default: [] },
    processingError: String,
  },
  { timestamps: true },
);

knowledgeGraphSchema.index({ user: 1, document: 1 }, { unique: true });

export const KnowledgeGraph: mongoose.Model<any> = mongoose.model(
  'KnowledgeGraph',
  knowledgeGraphSchema,
);
