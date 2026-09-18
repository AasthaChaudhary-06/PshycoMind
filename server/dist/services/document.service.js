import { ApiError } from '../utils/ApiError.js';
import { storage } from '../utils/storage.js';
import { getPaginationOptions } from '../utils/pagination.js';
import { parseUpload, chunkPages } from '../ai/pdf.service.js';
import { embeddings } from '../ai/embeddings.service.js';
import { documentRepository } from '../repositories/document.repository.js';
import { realtime } from '../realtime/hub.js';
import { notificationService } from './notification.service.js';
import { gamificationService } from './gamification.service.js';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const documentService = {
    async upload({ owner, file, subject, description }) {
        if (!file)
            throw new ApiError(400, 'No file uploaded');
        if (file.size > MAX_FILE_SIZE) {
            throw new ApiError(413, `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
        }
        const fileType = normalizeFileType(file.originalname);
        const storageKey = await storage.save({
            buffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
        });
        const document = await documentRepository.create({
            owner,
            title: cleanTitle(file.originalname),
            subject,
            description,
            fileName: file.originalname,
            fileType,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storageKey,
            status: 'processing',
        });
        // Kick off async indexing (extraction -> chunking -> embeddings).
        this.processDocument(document._id).catch((err) => {
            this.failDocument(document._id, err);
        });
        gamificationService.awardXp(owner, 'document.uploaded').catch(() => { });
        return document.toSafeJSON();
    },
    async processDocument(documentId) {
        const document = await documentRepository.findByIdForProcessing(documentId);
        if (!document)
            return;
        const { pages, metadata } = await parseUpload({ buffer: await storage.readFile(document.storageKey) }, document.fileType);
        const chunks = chunkPages(pages);
        const chunkTexts = chunks.map((c) => c.text);
        const embeddedChunks = await embeddings.embedBatch(chunkTexts).then((vectors) => chunks.map((chunk, index) => ({ ...chunk, embedding: vectors[index] })));
        document.pages = pages;
        document.chunks = embeddedChunks;
        document.metadata = metadata;
        document.status = 'ready';
        document.processedAt = new Date();
        await document.save();
        realtime.broadcastToUser(document.owner, 'document:status', {
            documentId: document._id.toString(),
            status: 'ready',
            title: document.title,
        });
        notificationService
            .create({
            user: document.owner,
            type: 'document',
            title: 'Document ready',
            message: `"${document.title}" has been processed and is ready for AI-powered study.`,
            data: { documentId: document._id.toString() },
        })
            .catch(() => { });
    },
    async failDocument(documentId, err) {
        await documentRepository.updateById(documentId, {
            status: 'failed',
            processingError: err.message,
        });
        const document = await documentRepository.findById(documentId);
        if (!document)
            return;
        realtime.broadcastToUser(document.owner, 'document:status', {
            documentId: document._id.toString(),
            status: 'failed',
            title: document.title,
        });
        notificationService
            .create({
            user: document.owner,
            type: 'document',
            title: 'Document processing failed',
            message: `"${document.title}" could not be processed. ${err.message}`,
            data: { documentId: document._id.toString() },
        })
            .catch(() => { });
    },
    async listForUser(userId, query) {
        const pagination = getPaginationOptions(query);
        const filters = buildFilters(query);
        return documentRepository.findPaginatedForUser(userId, { ...pagination, filters });
    },
    async getForUser(documentId, userId, { includeContent = false } = {}) {
        const document = await documentRepository.findById(documentId, { includeContent });
        if (!document)
            throw new ApiError(404, 'Document not found');
        if (!isOwner(document, userId))
            throw new ApiError(403, 'Not authorized to view this document');
        return includeContent ? document : document.toSafeJSON();
    },
    async toggleFavorite(documentId, userId) {
        const document = await documentRepository.setFavorite(documentId, userId, true);
        if (!document)
            throw new ApiError(404, 'Document not found');
        return document.toSafeJSON();
    },
    async removeFavorite(documentId, userId) {
        const document = await documentRepository.setFavorite(documentId, userId, false);
        if (!document)
            throw new ApiError(404, 'Document not found');
        return document.toSafeJSON();
    },
    async update(documentId, userId, data) {
        const allowed = pick(data, ['title', 'subject', 'description', 'tags']);
        const document = await documentRepository.updateById(documentId, allowed);
        if (!document || !isOwner(document, userId)) {
            throw new ApiError(404, 'Document not found');
        }
        return document.toSafeJSON();
    },
    async delete(documentId, userId) {
        const document = await documentRepository.findById(documentId);
        if (!document)
            throw new ApiError(404, 'Document not found');
        if (!isOwner(document, userId))
            throw new ApiError(403, 'Not authorized');
        await storage.delete(document.storageKey);
        await documentRepository.deleteById(documentId);
    },
};
function normalizeFileType(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!['pdf', 'md', 'txt', 'docx'].includes(ext)) {
        throw new ApiError(415, `Unsupported file type ".${ext}"`);
    }
    return ext;
}
function cleanTitle(fileName) {
    return fileName.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();
}
function buildFilters(query) {
    const filters = {};
    if (query.search)
        filters.search = query.search;
    if (query.subject)
        filters.subject = query.subject;
    if (query.favorite === 'true')
        filters.isFavorite = true;
    if (query.period === 'recent')
        filters.createdAt = { $gte: new Date(Date.now() - 7 * 86400000) };
    return filters;
}
function isOwner(document, userId) {
    return document.owner?.toString?.() === userId.toString() || document.owner === userId;
}
function pick(obj, keys) {
    return keys.reduce((acc, key) => {
        if (obj[key] !== undefined)
            acc[key] = obj[key];
        return acc;
    }, {});
}
//# sourceMappingURL=document.service.js.map