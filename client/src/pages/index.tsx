import { lazy, Suspense } from 'react'
import Loader from '../components/Loader'

export const Login = lazy(() => import('./Login'))
export const Register = lazy(() => import('./Register'))
export const DashboardPage = lazy(() => import('./DashboardPage'))
export const DocumentsPage = lazy(() => import('./DocumentsPage'))
export const DocumentViewPage = lazy(() => import('./DocumentViewPage'))
export const ChatPage = lazy(() => import('./ChatPage'))
export const QuizPage = lazy(() => import('./QuizPage'))
export const NotesPage = lazy(() => import('./NotesPage'))
export const FlashcardsPage = lazy(() => import('./FlashcardsPage'))
export const ProgressPage = lazy(() => import('./ProgressPage'))
export const ProfilePage = lazy(() => import('./ProfilePage'))
export const SettingsPage = lazy(() => import('./SettingsPage'))
export const AdminPage = lazy(() => import('./AdminPage'))
export const NotFound = lazy(() => import('./NotFound'))

export function PageSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
