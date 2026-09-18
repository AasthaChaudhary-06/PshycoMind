import { Exam } from '../models/Exam.js';
import { buildPaginatedResult } from '../utils/pagination.js';

export const examRepository = {
  create(data) {
    return Exam.create(data);
  },

  findById(id) {
    return Exam.findById(id).exec();
  },

  findByIdForUser(id, userId) {
    return Exam.findOne({ _id: id, user: userId }).exec();
  },

  async listForUser(userId, { page, limit, sort = { createdAt: -1 }, status }: any) {
    const query: any = { user: userId };
    if (status) query.status = status;
    const [docs, total] = await Promise.all([
      Exam.find(query).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      Exam.countDocuments(query),
    ]);
    return buildPaginatedResult(docs, total, { page, limit });
  },

  async updateById(id, data) {
    return Exam.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async deleteById(id) {
    return Exam.findByIdAndDelete(id).exec();
  },
};
