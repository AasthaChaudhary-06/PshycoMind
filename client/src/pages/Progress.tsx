import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import analyticsAPI from '@/services/analyticsAPI';
import { FullPageLoader } from '@/components/Loader';
import { Progress as ProgressBar } from '@/components/Progress';
import { formatDuration } from '@/utils/format';

export default function Progress() {
  const { userId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['progress', userId],
    queryFn: () => analyticsAPI.getUserProgress(userId).then((r) => r.data.data),
    enabled: Boolean(userId),
  });

  if (isLoading) return <FullPageLoader label="Loading progress…" />;

  const flashcardStats = data?.flashcardStats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Progress</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Detailed study progress overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Documents processed', value: data?.documentsProcessed ?? 0 },
          { label: 'Pages read', value: data?.totalPagesRead ?? 0 },
          { label: 'Study time', value: formatDuration(data?.readingTimeSec) },
          { label: 'Streak', value: `${data?.streakDays ?? 0} days` },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Flashcards
          </h2>
          <div className="space-y-4">
            <ProgressBar label="Mastered"
              value={flashcardStats.totalCards ? (flashcardStats.mastered / flashcardStats.totalCards) * 100 : 0}
            />
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Total</p>
                <p className="font-semibold">{flashcardStats.totalCards ?? 0}</p>
              </div>
              <div>
                <p className="text-slate-500">Due today</p>
                <p className="font-semibold">{flashcardStats.dueToday ?? 0}</p>
              </div>
              <div>
                <p className="text-slate-500">Mastered</p>
                <p className="font-semibold">{flashcardStats.mastered ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Quiz Stats
          </h2>
          <div className="space-y-4">
            <ProgressBar label="Average score"
              value={data?.quizStats?.averageScore ?? 0}
              color="bg-green-600"
            />
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Attempts</p>
                <p className="font-semibold">{data?.quizStats?.totalAttempts ?? 0}</p>
              </div>
              <div>
                <p className="text-slate-500">Average</p>
                <p className="font-semibold">{data?.quizStats?.averageScore ?? 0}%</p>
              </div>
              <div>
                <p className="text-slate-500">Best</p>
                <p className="font-semibold">{data?.quizStats?.bestScore ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
