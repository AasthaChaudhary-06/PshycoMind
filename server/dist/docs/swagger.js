import swaggerUi from 'swagger-ui-express';
export const OPENAPI_SPEC = {
    openapi: '3.0.3',
    info: {
        title: 'PhysioMind API',
        version: '1.0.0',
        description: 'Intelligence Beyond Reading — AI-powered study platform for physiotherapy students. Upload PDFs, generate summaries/quizzes/flashcards/exams/study plans, chat with your documents, and track exam readiness.',
        contact: { name: 'PhysioMind Team' },
    },
    servers: [
        { url: 'http://localhost:5001/api/v1', description: 'Local development' },
        { url: '/api/v1', description: 'Docker / production (same-origin)' },
    ],
    tags: [
        { name: 'Auth', description: 'Authentication & account management' },
        { name: 'Documents', description: 'Upload and process PDF/MD/TXT/DOCX study material' },
        { name: 'Chat', description: 'AI tutor conversations grounded in your documents' },
        { name: 'Quiz', description: 'Generate and attempt quizzes' },
        { name: 'Flashcards', description: 'Spaced-repetition flashcards' },
        { name: 'Notes', description: 'Personal and AI-generated notes' },
        { name: 'Exams', description: 'Timed mock exams with auto-grading' },
        { name: 'Plans', description: 'AI-generated study plans with task tracking' },
        { name: 'Analytics', description: 'Exam readiness and progress analytics' },
        { name: 'Graph', description: 'Document knowledge graphs' },
        { name: 'Gamification', description: 'XP, levels, badges and leaderboard' },
        { name: 'Search', description: 'Global search across all content' },
        { name: 'Tutor', description: 'AI tutor quick actions and intent routing' },
        { name: 'Notifications', description: 'In-app notifications' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {},
                },
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['student', 'faculty', 'admin'] },
                    avatar: { type: 'string', nullable: true },
                },
            },
            AuthTokens: {
                type: 'object',
                properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            Paginated: {
                type: 'object',
                properties: {
                    docs: { type: 'array', items: {} },
                    totalDocs: { type: 'integer' },
                    limit: { type: 'integer' },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    hasNextPage: { type: 'boolean' },
                },
            },
            QuizQuestion: {
                type: 'object',
                properties: {
                    question: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctIndex: { type: 'integer' },
                    explanation: { type: 'string' },
                    topic: { type: 'string' },
                    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                },
            },
            StudyPlanTask: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    durationMin: { type: 'integer' },
                    completed: { type: 'boolean' },
                    completedAt: { type: 'string', format: 'date-time', nullable: true },
                },
            },
        },
    },
    paths: {
        '/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new account',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 8 },
                                    role: { type: 'string', enum: ['student', 'faculty'] },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Account created' },
                    '409': { description: 'Email already in use' },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login and receive JWT tokens',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    password: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Authenticated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthTokens' },
                            },
                        },
                    },
                },
            },
        },
        '/auth/refresh': {
            post: {
                tags: ['Auth'],
                summary: 'Refresh access token',
                responses: { '200': { description: 'New tokens issued' } },
            },
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Logout and revoke refresh token',
                responses: { '200': { description: 'Logged out' } },
            },
        },
        '/documents': {
            get: {
                tags: ['Documents'],
                summary: 'List your documents',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Paginated documents' } },
            },
            post: {
                tags: ['Documents'],
                summary: 'Upload and process a document',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['file'],
                                properties: {
                                    file: { type: 'string', format: 'binary' },
                                    subject: { type: 'string' },
                                    description: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Document uploaded' },
                    '400': { description: 'Invalid file type or size' },
                },
            },
        },
        '/documents/{id}': {
            get: {
                tags: ['Documents'],
                summary: 'Get a document with its content',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Document' }, '404': { description: 'Not found' } },
            },
            delete: {
                tags: ['Documents'],
                summary: 'Delete a document',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Deleted' } },
            },
        },
        '/chat': {
            post: {
                tags: ['Chat'],
                summary: 'Create a chat session (optionally scoped to a document)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { documentId: { type: 'string' }, title: { type: 'string' } },
                            },
                        },
                    },
                },
                responses: { '201': { description: 'Chat created' } },
            },
        },
        '/chat/{id}/messages': {
            post: {
                tags: ['Chat'],
                summary: 'Send a message to the AI tutor',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['content'],
                                properties: {
                                    content: { type: 'string' },
                                    documentId: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'AI response with sources' } },
            },
        },
        '/quiz': {
            get: {
                tags: ['Quiz'],
                summary: 'List quizzes',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Paginated quizzes' } },
            },
            post: {
                tags: ['Quiz'],
                summary: 'Generate a quiz (AI or mock provider)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    documentId: { type: 'string' },
                                    topic: { type: 'string' },
                                    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                                    questionCount: { type: 'integer', minimum: 3, maximum: 30 },
                                    title: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Quiz generated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/QuizQuestion' },
                            },
                        },
                    },
                },
            },
        },
        '/quiz/{id}/submit': {
            post: {
                tags: ['Quiz'],
                summary: 'Submit quiz answers and get graded results',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['answers'],
                                properties: { answers: { type: 'array', items: { type: 'integer' } } },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Graded attempt with explanations' } },
            },
        },
        '/flashcards': {
            post: {
                tags: ['Flashcards'],
                summary: 'Generate flashcards for a document or topic',
                security: [{ bearerAuth: [] }],
                responses: { '201': { description: 'Flashcards generated' } },
            },
        },
        '/notes': {
            post: {
                tags: ['Notes'],
                summary: 'Create a note',
                security: [{ bearerAuth: [] }],
                responses: { '201': { description: 'Note created' } },
            },
        },
        '/exams': {
            get: {
                tags: ['Exams'],
                summary: 'List your mock exams',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Paginated exams' } },
            },
            post: {
                tags: ['Exams'],
                summary: 'Generate a timed mock exam',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    documentId: { type: 'string' },
                                    topic: { type: 'string' },
                                    difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                                    questionCount: { type: 'integer', minimum: 5, maximum: 50 },
                                    timeLimitMin: { type: 'integer', minimum: 5, maximum: 300 },
                                    title: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: { '201': { description: 'Exam created' } },
            },
        },
        '/exams/{id}/start': {
            get: {
                tags: ['Exams'],
                summary: 'Start an exam (returns questions without answers + a timer)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Exam started' } },
            },
        },
        '/exams/{id}/submit': {
            post: {
                tags: ['Exams'],
                summary: 'Submit an exam and receive auto-graded results',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Graded attempt with explanations' } },
            },
        },
        '/plans': {
            get: {
                tags: ['Plans'],
                summary: 'List study plans',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Paginated plans' } },
            },
            post: {
                tags: ['Plans'],
                summary: 'Generate an AI study plan',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    goal: { type: 'string' },
                                    topic: { type: 'string' },
                                    dailyMinutes: { type: 'integer', minimum: 15, maximum: 480 },
                                    endDate: { type: 'string', format: 'date' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Plan generated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StudyPlanTask' },
                            },
                        },
                    },
                },
            },
        },
        '/plans/{id}/tasks/{taskId}': {
            patch: {
                tags: ['Plans'],
                summary: 'Mark a study-plan task complete/incomplete',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['completed'],
                                properties: { completed: { type: 'boolean' } },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Updated plan' } },
            },
        },
        '/analytics/readiness': {
            get: {
                tags: ['Analytics'],
                summary: 'Get exam readiness score with component breakdown and recommendations',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Readiness assessment' } },
            },
        },
        '/analytics/trends': {
            get: {
                tags: ['Analytics'],
                summary: 'Get performance trends and weekly activity',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Trends' } },
            },
        },
        '/analytics/topics': {
            get: {
                tags: ['Analytics'],
                summary: 'Get per-topic mastery from quiz attempts',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Topic mastery' } },
            },
        },
        '/graph/{documentId}': {
            get: {
                tags: ['Graph'],
                summary: 'Get a document knowledge graph',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Knowledge graph' }, '404': { description: 'Not generated yet' } },
            },
        },
        '/graph/{documentId}/generate': {
            post: {
                tags: ['Graph'],
                summary: 'Generate a document knowledge graph',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Generated graph' } },
            },
        },
        '/gamification/me': {
            get: {
                tags: ['Gamification'],
                summary: 'Get your XP, level, badges and stats',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Gamification profile' } },
            },
        },
        '/gamification/leaderboard': {
            get: {
                tags: ['Gamification'],
                summary: 'Get the global XP leaderboard',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Leaderboard entries' } },
            },
        },
        '/search': {
            get: {
                tags: ['Search'],
                summary: 'Search documents, notes, flashcards, quizzes and chats',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 25 } },
                ],
                responses: { '200': { description: 'Grouped search results' } },
            },
        },
        '/tutor/quick-actions': {
            get: {
                tags: ['Tutor'],
                summary: 'List AI tutor quick actions',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Quick actions' } },
            },
        },
        '/tutor/intent': {
            post: {
                tags: ['Tutor'],
                summary: 'Classify intent and dispatch (quiz, exam, plan, flashcards, explain…)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['content'],
                                properties: {
                                    content: { type: 'string' },
                                    documentId: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: { '200': { description: 'Tutor response with optional action' } },
            },
        },
        '/notifications': {
            get: {
                tags: ['Notifications'],
                summary: 'List notifications',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Notifications' } },
            },
        },
    },
};
export function setupSwagger(app) {
    if (process.env.NODE_ENV === 'test')
        return;
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(OPENAPI_SPEC, {
        customSiteTitle: 'PhysioMind API Docs',
        swaggerOptions: { persistAuthorization: true },
    }));
}
//# sourceMappingURL=swagger.js.map