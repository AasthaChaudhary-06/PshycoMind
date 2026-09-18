import { ApiError } from '../utils/ApiError.js';
import { getPaginationOptions } from '../utils/pagination.js';
import { llm } from '../ai/llm.service.js';
import { retrieveRelevantChunks } from '../ai/retrieval.service.js';
import { noteRepository } from '../repositories/note.repository.js';
import { documentRepository } from '../repositories/document.repository.js';
export const noteService = {
    async create(userId, { documentId, title, body, type = 'personal', tags = [] }) {
        return noteRepository.create({
            user: userId,
            document: documentId || null,
            title: title || 'Untitled Note',
            body: body || '',
            type,
            tags,
        });
    },
    async listNotes(userId, query) {
        const pagination = getPaginationOptions(query);
        const filters = {};
        if (query.documentId)
            filters.document = query.documentId;
        if (query.type)
            filters.type = query.type;
        if (query.pinned === 'true')
            filters.pinned = true;
        if (query.search)
            filters.search = query.search;
        return noteRepository.listForUser(userId, { ...pagination, filters });
    },
    async getNote(userId, noteId) {
        const note = await noteRepository.findByIdForUser(noteId, userId);
        if (!note)
            throw new ApiError(404, 'Note not found');
        return note;
    },
    async update(userId, noteId, data) {
        const note = await noteRepository.findByIdForUser(noteId, userId);
        if (!note)
            throw new ApiError(404, 'Note not found');
        const allowed = pick(data, ['title', 'body', 'tags', 'pinned', 'highlights', 'bookmarks']);
        return noteRepository.updateById(noteId, userId, allowed);
    },
    async delete(userId, noteId) {
        const note = await noteRepository.findByIdForUser(noteId, userId);
        if (!note)
            throw new ApiError(404, 'Note not found');
        await noteRepository.deleteById(noteId);
    },
    async generateSummary(userId, { documentId, length = 'medium' }) {
        const document = await documentRepository.findByIdForProcessing(documentId);
        if (!document)
            throw new ApiError(404, 'Document not found');
        const chunks = await retrieveRelevantChunks(document, 'summary overview key concepts', {
            topK: 6,
        });
        const context = chunks.map((c) => `[Page ${c.page}]\n${c.text}`).join('\n\n');
        const { content } = await llm.complete([
            {
                role: 'system',
                content: `You create concise, well-structured study summaries for medical students. Length: ${length}. Use markdown headings and bullet points.`,
            },
            { role: 'user', content: `Summarize this document:\n\n${context}` },
        ], { maxTokens: 2500 });
        const note = await noteRepository.create({
            user: userId,
            document: documentId,
            title: `Summary - ${document.title}`,
            body: content,
            type: 'ai-summary',
            tags: ['ai-generated', 'summary'],
        });
        return note;
    },
};
function pick(obj, keys) {
    return keys.reduce((acc, key) => {
        if (obj[key] !== undefined)
            acc[key] = obj[key];
        return acc;
    }, {});
}
//# sourceMappingURL=note.service.js.map