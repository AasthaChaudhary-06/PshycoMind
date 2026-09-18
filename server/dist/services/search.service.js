import { ApiError } from '../utils/ApiError.js';
import { searchRepository } from '../repositories/search.repository.js';
export const searchService = {
    async globalSearch(userId, { q, limit = 10 }) {
        const term = (q || '').trim();
        if (!term)
            throw new ApiError(400, 'Search query is required');
        const regex = new RegExp(escapeRegex(term), 'i');
        const cap = Math.min(Math.max(limit, 1), 25);
        const [documents, notes, flashcards, quizzes, chats] = await Promise.all([
            searchRepository.documents(userId, regex, cap),
            searchRepository.notes(userId, regex, cap),
            searchRepository.flashcards(userId, regex, cap),
            searchRepository.quizzes(userId, regex, cap),
            searchRepository.chats(userId, regex, cap),
        ]);
        return {
            query: term,
            documents: documents.map((d) => ({
                _id: d._id,
                title: d.title,
                subject: d.subject,
                description: d.description,
                fileType: d.fileType,
                createdAt: d.createdAt,
                snippet: d.chunks?.[0]?.text?.slice(0, 200) || d.description || '',
            })),
            notes: notes.map((n) => ({
                _id: n._id,
                title: n.title,
                type: n.type,
                document: n.document,
                createdAt: n.createdAt,
                snippet: (n.body || '').slice(0, 200),
            })),
            flashcards: flashcards.map((f) => ({
                _id: f._id,
                front: f.front,
                back: f.back,
                topic: f.topic,
                mastery: f.mastery,
                document: f.document,
            })),
            quizzes: quizzes.map((q) => ({
                _id: q._id,
                title: q.title,
                topic: q.topic,
                subject: q.subject,
                difficulty: q.difficulty,
                document: q.document,
                createdAt: q.createdAt,
            })),
            chats: chats.map((c) => ({
                _id: c._id,
                title: c.title,
                document: c.document,
                pinned: c.pinned,
                updatedAt: c.updatedAt,
            })),
        };
    },
};
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=search.service.js.map