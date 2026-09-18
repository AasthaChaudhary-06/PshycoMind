import { User } from '../models/User.js';
export const userRepository = {
    async create(data) {
        return User.create(data);
    },
    async findByEmail(email, { includePassword = false } = {}) {
        const query = User.findOne({ email: email.toLowerCase() });
        if (includePassword)
            query.select('+password');
        return query.exec();
    },
    async findById(id, { includePassword = false } = {}) {
        const query = User.findById(id);
        if (includePassword)
            query.select('+password');
        return query.exec();
    },
    async updateById(id, data) {
        return User.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).exec();
    },
    async updateLastLogin(id) {
        return User.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
    },
    async deleteById(id) {
        return User.findByIdAndDelete(id).exec();
    },
};
//# sourceMappingURL=user.repository.js.map