import { llm } from '../ai/llm.service.js';
import { quizService } from './quiz.service.js';
import { flashcardService } from './flashcard.service.js';
import { examService } from './exam.service.js';
import { studyPlanService } from './studyPlan.service.js';
const QUICK_ACTIONS = [
    { id: 'summarize', label: 'Summarize this document', prompt: 'Summarize the key concepts of this document' },
    { id: 'quiz', label: 'Quiz me', prompt: 'Generate a quiz for me' },
    { id: 'flashcards', label: 'Make flashcards', prompt: 'Create flashcards for this topic' },
    { id: 'exam', label: 'Mock exam', prompt: 'Create a timed mock exam' },
    { id: 'plan', label: 'Study plan', prompt: 'Build me a study plan' },
    { id: 'explain', label: 'Explain a concept', prompt: 'Explain cardiac output' },
    { id: 'examTips', label: 'Exam tips', prompt: 'Give me exam preparation tips' },
];
export const tutorService = {
    quickActions() {
        return QUICK_ACTIONS;
    },
    async handle(userId, { content, documentId }) {
        const text = (content || '').trim();
        if (!text)
            return { intent: 'ask', response: 'Please type a message.' };
        const intent = classifyIntent(text);
        if (intent === 'quiz') {
            const quiz = await quizService.generateQuiz(userId, {
                documentId,
                topic: extractTopic(text),
                difficulty: extractDifficulty(text),
                questionCount: 10,
            });
            return {
                intent,
                response: `I created a quiz for you: **${quiz.title}** with ${quiz.questions.length} questions.`,
                action: { type: 'quiz', id: quiz._id.toString() },
            };
        }
        if (intent === 'flashcards') {
            const cards = await flashcardService.generate(userId, {
                documentId,
                topic: extractTopic(text),
                count: 10,
            });
            return {
                intent,
                response: `I generated ${cards.length} flashcards to help you memorize key concepts.`,
                action: { type: 'flashcards', id: cards[0]?._id?.toString() },
            };
        }
        if (intent === 'exam') {
            const exam = await examService.create(userId, {
                documentId,
                topic: extractTopic(text),
                difficulty: extractDifficulty(text),
                questionCount: 20,
                timeLimitMin: 30,
            });
            return {
                intent,
                response: `Mock exam ready: **${exam.title}** — ${exam.questions.length} questions, ${exam.timeLimitMin} minutes.`,
                action: { type: 'exam', id: exam._id.toString() },
            };
        }
        if (intent === 'plan') {
            const plan = await studyPlanService.create(userId, {
                title: `${extractTopic(text) || 'Study'} Plan`,
                topic: extractTopic(text),
                dailyMinutes: 60,
            });
            return {
                intent,
                response: `I built a study plan **"${plan.title}"** with ${plan.tasks.length} tasks.`,
                action: { type: 'plan', id: plan._id.toString() },
            };
        }
        const response = await this._answer(text, documentId, intent);
        return { intent, response };
    },
    async _answer(question, documentId, intent) {
        const prompt = intent === 'summarize'
            ? `Summarize the key concepts.`
            : question;
        const system = `You are PhysioMind, an expert medical education assistant for physiotherapy and physiology students. Answer clearly with structured headings and cite page numbers when a document context is provided.`;
        if (!documentId) {
            const { content } = await llm.complete([
                { role: 'system', content: system },
                { role: 'user', content: prompt },
            ]);
            return content;
        }
        const { retrieveRelevantChunks } = await import('../ai/retrieval.service.js');
        const { documentRepository } = await import('../repositories/document.repository.js');
        const document = await documentRepository.findByIdForProcessing(documentId);
        if (!document)
            return 'Document not found.';
        const chunks = await retrieveRelevantChunks(document, question);
        const context = chunks.map((c) => `[Page ${c.page}]\n${c.text}`).join('\n\n');
        const { content } = await llm.complete([
            { role: 'system', content: system },
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
        ]);
        return content;
    },
};
function classifyIntent(text) {
    const t = text.toLowerCase();
    if (/\b(summariz|summary|tl;?dr)\b/.test(t))
        return 'summarize';
    if (/\b(quiz|mcq|question|test me)\b/.test(t))
        return 'quiz';
    if (/\b(flashcard|study card|anki)\b/.test(t))
        return 'flashcards';
    if (/\b(exam|mock test|paper)\b/.test(t))
        return 'exam';
    if (/\b(plan|schedule|syllabus|routine)\b/.test(t))
        return 'plan';
    if (/\b(explain|what is|what are|define|how does|why)\b/.test(t))
        return 'explain';
    return 'ask';
}
function extractTopic(text) {
    const match = /topic\s*(?:of|on|:)?\s*([a-z][a-z\s]{2,40})/i.exec(text);
    const cleaned = match?.[1]?.trim();
    return cleaned && cleaned.split(/\s+/).length <= 8 ? cleaned : undefined;
}
function extractDifficulty(text) {
    const match = /(easy|medium|hard)/i.exec(text);
    return match ? match[1].toLowerCase() : undefined;
}
//# sourceMappingURL=tutor.service.js.map