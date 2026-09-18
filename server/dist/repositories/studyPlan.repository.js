import { StudyPlan } from '../models/StudyPlan.js';
import { buildPaginatedResult } from '../utils/pagination.js';
export const studyPlanRepository = {
    create(data) {
        return StudyPlan.create(data);
    },
    findByIdForUser(id, userId) {
        return StudyPlan.findOne({ _id: id, user: userId }).exec();
    },
    listForUser(userId, { page, limit, sort = { createdAt: -1 }, status }) {
        const query = { user: userId };
        if (status)
            query.status = status;
        return StudyPlan.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec()
            .then((docs) => buildPaginatedResult(docs, docs.length, { page, limit }));
    },
    async updateById(id, data) {
        return StudyPlan.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).exec();
    },
    async updateTask(id, taskId, data) {
        const plan = await StudyPlan.findOne({ _id: id }).exec();
        if (!plan)
            return null;
        const task = plan.tasks.id(taskId);
        if (!task)
            return null;
        Object.assign(task, data);
        await plan.save();
        return plan;
    },
    async deleteById(id) {
        return StudyPlan.findByIdAndDelete(id).exec();
    },
    async countActiveForUser(userId) {
        return StudyPlan.countDocuments({ user: userId, status: 'active' });
    },
};
//# sourceMappingURL=studyPlan.repository.js.map