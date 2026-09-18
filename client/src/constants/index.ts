export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: '/documents/:documentId',
  DOCUMENT_VIEW: (id) => `/documents/${id}`,
  CHAT: '/chat',
  CHAT_DOCUMENT: '/chat/:documentId',
  CHAT_WITH_DOCUMENT: (id) => `/chat/${id}`,
  QUIZ: '/quiz',
  QUIZ_DOCUMENT: '/quiz/:documentId',
  QUIZ_WITH_DOCUMENT: (id) => `/quiz/${id}`,
  NOTES: '/notes',
  NOTES_DOCUMENT: '/notes/:documentId',
  NOTES_WITH_DOCUMENT: (id) => `/notes/${id}`,
  FLASHCARDS: '/flashcards',
  ANALYTICS: '/analytics',
  PROGRESS: '/progress/:userId',
  PROGRESS_WITH_USER: (id) => `/progress/${id}`,
  GRAPH: '/graph/:documentId',
  GRAPH_WITH_DOCUMENT: (id) => `/graph/${id}`,
  PLANS: '/plans',
  EXAMS: '/exams',
  EXAM_ATTEMPT: '/exams/:examId',
  EXAM_WITH_ID: (id) => `/exams/${id}`,
  LEADERBOARD: '/leaderboard',
  ADMIN: '/admin',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Documents', path: ROUTES.DOCUMENTS, icon: 'document' },
  { label: 'AI Chat', path: ROUTES.CHAT, icon: 'chat' },
  { label: 'Quiz', path: ROUTES.QUIZ, icon: 'quiz' },
  { label: 'Exams', path: ROUTES.EXAMS, icon: 'exam' },
  { label: 'Flashcards', path: ROUTES.FLASHCARDS, icon: 'flashcard' },
  { label: 'Study Plans', path: ROUTES.PLANS, icon: 'planner' },
  { label: 'Notes', path: ROUTES.NOTES, icon: 'notes' },
  { label: 'Analytics', path: ROUTES.ANALYTICS, icon: 'analytics' },
  { label: 'Leaderboard', path: ROUTES.LEADERBOARD, icon: 'trophy' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: 'settings' },
];

export const SUBJECTS = [
  'General',
  'Anatomy',
  'Physiology',
  'Pathology',
  'Pharmacology',
  'Biomechanics',
  'Cardiovascular',
  'Neurology',
  'Respiratory',
  'Musculoskeletal',
];

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

export const MASTERY_LEVELS = ['new', 'learning', 'reviewing', 'mastered'];

export const NOTE_TYPES = ['personal', 'ai-summary', 'handwritten'];

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
};

export const DOCUMENT_FILTERS = ['all', 'bookmarked', 'recent'];

export const DEFAULT_AVATAR = '';

export const APP_NAME = 'PhysioMind';
export const APP_TAGLINE = 'Intelligence Beyond Reading';

export const API_STALE_TIMES = {
  DOCUMENTS: 60_000,
  CHATS: 30_000,
  QUIZZES: 60_000,
  NOTES: 30_000,
  ANALYTICS: 5 * 60_000,
  LEADERBOARD: 60_000,
};
