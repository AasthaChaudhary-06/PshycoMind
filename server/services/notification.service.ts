import { Notification } from '../models/Notification.js';
import { getPaginationOptions, buildPaginatedResult } from '../utils/pagination.js';
import { realtime } from '../realtime/hub.js';

export const notificationService = {
  async create({ user, type = 'system', title, message = '', data = {} }) {
    const notification = await Notification.create({ user, type, title, message, data });
    const payload = notification.toJSON();
    realtime.broadcastToUser(user, 'notification', payload);
    realtime.broadcastToUser(user, 'notifications:count', { unread: await this.unreadCount(user) });
    return notification;
  },

  async listForUser(userId, query) {
    const pagination = getPaginationOptions(query);
    const filter = { user: userId };

    const [docs, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
      Notification.countDocuments(filter),
    ]);

    const unread = await Notification.countDocuments({ user: userId, read: false });

    return { ...buildPaginatedResult(docs, total, pagination), unread };
  },

  async unreadCount(userId) {
    return Notification.countDocuments({ user: userId, read: false });
  },

  async markRead(userId, id) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true },
    );
    if (!notification) return null;
    realtime.broadcastToUser(userId, 'notifications:count', { unread: await this.unreadCount(userId) });
    return notification;
  },

  async markAllRead(userId) {
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    realtime.broadcastToUser(userId, 'notifications:count', { unread: 0 });
  },
};
