import { ApiError } from '../utils/ApiError.js';
import { llm } from '../ai/llm.service.js';
import { KnowledgeGraph } from '../models/KnowledgeGraph.js';
import { documentRepository } from '../repositories/document.repository.js';
const MAX_CONTEXT_CHARS = 8000;
export const graphService = {
    async generate(userId, documentId) {
        const document = await documentRepository.findByIdForProcessing(documentId);
        if (!document)
            throw new ApiError(404, 'Document not found');
        if (document.owner?.toString() !== userId.toString()) {
            throw new ApiError(403, 'Not authorized to view this document');
        }
        const graph = await KnowledgeGraph.findOneAndUpdate({ user: userId, document: documentId }, { $set: { status: 'processing', processingError: null } }, { new: true, upsert: true }).exec();
        try {
            const context = buildContext(document);
            const { content } = await llm.complete([
                {
                    role: 'system',
                    content: 'You are a medical knowledge graph builder. Extract the key concepts and their relationships. Return ONLY a JSON object with "title", "nodes" (id, label, explanation, page, importance 1-5) and "edges" (source, target, relation). Keep ids short and unique.',
                },
                { role: 'user', content: `Document content:\n${context}\n\nBuild the concept graph.` },
            ], { temperature: 0.4, maxTokens: 3000 });
            const parsed = parseGraph(content);
            if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
                throw new Error('No graph structure returned');
            }
            const nodes = sanitizeNodes(parsed.nodes);
            const nodeIds = new Set(nodes.map((n) => n.id));
            const edges = (parsed.edges || [])
                .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
                .map((e) => ({ source: e.source, target: e.target, relation: e.relation || 'related to' }));
            graph.nodes = nodes;
            graph.edges = edges;
            graph.title = parsed.title || document.title || 'Knowledge Graph';
            graph.status = 'ready';
            await graph.save();
            return graph;
        }
        catch (err) {
            graph.status = 'failed';
            graph.processingError = err.message;
            await graph.save();
            throw new ApiError(502, `Failed to build knowledge graph: ${err.message}`);
        }
    },
    async getForUser(userId, documentId) {
        const graph = await KnowledgeGraph.findOne({ user: userId, document: documentId }).exec();
        if (!graph)
            throw new ApiError(404, 'Knowledge graph not found. Generate it first.');
        return graph;
    },
};
function buildContext(document) {
    const chunks = Array.isArray(document.chunks) ? document.chunks : [];
    let out = '';
    for (const chunk of chunks) {
        const text = (chunk.text || '').trim();
        if (!text)
            continue;
        if (out.length + text.length > MAX_CONTEXT_CHARS)
            break;
        out += `[Page ${chunk.page}]\n${text}\n\n`;
    }
    return out || (document.pages || []).map((p) => `[Page ${p.number}]\n${p.text}`).join('\n\n') || 'No content.';
}
function parseGraph(content) {
    try {
        if (typeof content === 'string') {
            const json = content.match(/\{[\s\S]*\}/)?.[0];
            if (!json)
                return null;
            return JSON.parse(json);
        }
        return content;
    }
    catch {
        return null;
    }
}
function sanitizeNodes(nodes) {
    const seen = new Set();
    const out = [];
    for (const node of nodes) {
        const id = String(node.id || '').trim();
        const label = String(node.label || node.id || '').trim();
        if (!id || !label || seen.has(id))
            continue;
        seen.add(id);
        out.push({
            id,
            label,
            explanation: String(node.explanation || ''),
            page: Math.max(1, parseInt(node.page, 10) || 1),
            importance: Math.min(5, Math.max(1, parseInt(node.importance, 10) || 3)),
        });
    }
    return out;
}
//# sourceMappingURL=graph.service.js.map