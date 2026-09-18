import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, PublicOnlyRoute, AdminRoute, SuspenseFallback } from './guards';

const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));
const AuthLayout = lazy(() => import('@/layouts/AuthLayout'));

const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Documents = lazy(() => import('@/pages/Documents'));
const DocumentDetail = lazy(() => import('@/pages/DocumentDetail'));
const Chat = lazy(() => import('@/pages/Chat'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const QuizDetail = lazy(() => import('@/pages/QuizDetail'));
const Flashcards = lazy(() => import('@/pages/Flashcards'));
const Notes = lazy(() => import('@/pages/Notes'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const KnowledgeGraph = lazy(() => import('@/pages/KnowledgeGraph'));
const StudyPlanner = lazy(() => import('@/pages/StudyPlanner'));
const Exams = lazy(() => import('@/pages/Exams'));
const ExamAttempt = lazy(() => import('@/pages/ExamAttempt'));
const Gamification = lazy(() => import('@/pages/Gamification'));
const Progress = lazy(() => import('@/pages/Progress'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const Admin = lazy(() => import('@/pages/Admin'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const withSuspense = (element) => <Suspense fallback={<SuspenseFallback />}>{element}</Suspense>;

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={withSuspense(<AuthLayout><Login /></AuthLayout>)} />
        <Route path="/register" element={withSuspense(<AuthLayout><Register /></AuthLayout>)} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={withSuspense(<DashboardLayout />)}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={withSuspense(<Dashboard />)} />
          <Route path="/documents" element={withSuspense(<Documents />)} />
          <Route path="/documents/:documentId" element={withSuspense(<DocumentDetail />)} />
          <Route path="/chat" element={withSuspense(<Chat />)} />
          <Route path="/chat/:documentId" element={withSuspense(<Chat />)} />
          <Route path="/quiz" element={withSuspense(<Quiz />)} />
          <Route path="/quiz/:documentId" element={withSuspense(<Quiz />)} />
          <Route path="/quiz/attempt/:quizId" element={withSuspense(<QuizDetail />)} />
          <Route path="/flashcards" element={withSuspense(<Flashcards />)} />
          <Route path="/notes" element={withSuspense(<Notes />)} />
          <Route path="/notes/:documentId" element={withSuspense(<Notes />)} />
          <Route path="/analytics" element={withSuspense(<Analytics />)} />
          <Route path="/graph/:documentId" element={withSuspense(<KnowledgeGraph />)} />
          <Route path="/plans" element={withSuspense(<StudyPlanner />)} />
          <Route path="/exams" element={withSuspense(<Exams />)} />
          <Route path="/exams/:examId" element={withSuspense(<ExamAttempt />)} />
          <Route path="/leaderboard" element={withSuspense(<Gamification />)} />
          <Route path="/progress/:userId" element={withSuspense(<Progress />)} />
          <Route path="/profile" element={withSuspense(<Profile />)} />
          <Route path="/settings" element={withSuspense(<Settings />)} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={withSuspense(<DashboardLayout><Admin /></DashboardLayout>)} />
        </Route>
      </Route>

      <Route path="*" element={withSuspense(<NotFound />)} />
    </Routes>
  );
}
