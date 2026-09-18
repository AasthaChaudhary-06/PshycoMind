const clients = new Map();
export const realtime = {
    subscribe(userId, res) {
        const key = userId.toString();
        if (!clients.has(key))
            clients.set(key, new Set());
        clients.get(key).add(res);
        return () => this.unsubscribe(key, res);
    },
    unsubscribe(key, res) {
        const set = clients.get(key);
        if (!set)
            return;
        set.delete(res);
        if (set.size === 0)
            clients.delete(key);
    },
    broadcastToUser(userId, event, data) {
        const set = clients.get(userId.toString());
        if (!set)
            return 0;
        for (const res of set) {
            if (res.writableEnded) {
                this.unsubscribe(userId, res);
                continue;
            }
            if (event)
                res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
        return set.size;
    },
    getSubscriberCount() {
        let count = 0;
        for (const set of clients.values())
            count += set.size;
        return count;
    },
};
//# sourceMappingURL=hub.js.map