export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: (id) => `/documents/${id}`,
  CHAT: (id) => `/chat/${id}`,
  QUIZ: (id) => `/quiz/${id}`,
  NOTES: (id) => `/notes/${id}`,
  PROGRESS: (userId) => `/progress/${userId}`,
  SETTINGS: '/settings',
  ADMIN: '/admin',
}

export const ADMIN_ROUTES = {
  USERS: '/admin/users',
  DOCUMENTS: '/admin/documents',
  ANALYTICS: '/admin/analytics',
}
