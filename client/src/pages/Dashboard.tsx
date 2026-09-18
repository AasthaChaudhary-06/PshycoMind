import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import analyticsAPI from '@/services/analyticsAPI';
import { selectUser } from '@/features/auth/authSelectors';
import { FullPageLoader } from '@/components/Loader';
import { Progress } from '@/components/Progress';
import { formatDuration } from '@/utils/format';

export default function Dashboard() {
  const user = useSelector(selectUser);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsAPI.getPlatformAnalytics().then((r) => r.data.data),
  });

  if (isLoading) return <FullPageLoader />;

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-slate-500">Could not load your dashboard.</p>
        <Link to="/documents" className="btn-primary">
          Go to Documents
        </Link>
      </div>
    );
  }

  const stats = data || {};

  const cards = [
    { label: 'Documents', value: stats.totals?.documents ?? 0, icon: '📄', to: '/documents' },
    { label: 'Notes', value: stats.totals?.notes ?? 0, icon: '✎', to: '/notes' },
    { label: 'Chats', value: stats.totals?.chats ?? 0, icon: '💬', to: '/chat' },
    { label: 'Quizzes', value: stats.totals?.quizzes ?? 0, icon: '?', to: '/quiz' },
    { label: 'Cards due', value: stats.totals?.dueFlashcards ?? 0, icon: '▱', to: '/flashcards' },
  ];

  const reading = stats.reading || {};
  const quiz = stats.quizPerformance || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Continue learning — your streak is <span className="font-medium text-brand-600">{reading.streakDays ?? 0} days</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-xl">{card.icon}</span>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Reading Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Pages read</span>
                <span>{reading.totalPagesRead ?? 0}</span>
              </div>
              <Progress value={(reading.totalPagesRead ?? 0) % 100} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>Documents started</span>
                <span>
                  {reading.documentsCompleted ?? 0}/{reading.documentsStarted ?? 0} completed
                </span>
              </div>
              <Progress
                value={
                  reading.documentsStarted
                    ? ((reading.documentsCompleted ?? 0) / reading.documentsStarted) * 100
                    : 0
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Total study time</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatDuration(reading.readingTimeSec)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Current streak</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {reading.streakDays ?? 0} days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Quiz Performance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {quiz.attempts ?? 0}
              </p>
              <p className="text-xs text-slate-500">Attempts</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800">
              <p className="text-2xl font-bold text-brand-600">{quiz.averageScore ?? 0}%</p>
              <p className="text-xs text-slate-500">Average</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800">
              <p className="text-2xl font-bold text-green-600">{quiz.bestScore ?? 0}%</p>
              <p className="text-xs text-slate-500">Best</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link to="/quiz" className="btn-primary">
              Generate Quiz
            </Link>
            <Link to="/chat" className="btn-secondary">
              Ask AI Tutor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
