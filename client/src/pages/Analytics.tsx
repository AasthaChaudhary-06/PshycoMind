import { useQuery } from '@tanstack/react-query';
import analyticsAPI from '@/services/analyticsAPI';
import { FullPageLoader } from '@/components/Loader';
import { formatDuration } from '@/utils/format';

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'full'],
    queryFn: () => analyticsAPI.getPlatformAnalytics().then((r) => r.data.data),
  });

  const { data: readiness } = useQuery({
    queryKey: ['analytics', 'readiness'],
    queryFn: () => analyticsAPI.getReadiness().then((r) => r.data.data),
  });

  const { data: topics } = useQuery({
    queryKey: ['analytics', 'topics'],
    queryFn: () => analyticsAPI.getTopics().then((r) => r.data.data),
  });

  const { data: trends } = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: () => analyticsAPI.getTrends().then((r) => r.data.data),
  });

  if (isLoading) return <FullPageLoader label="Loading analytics…" />;

  const reading = data?.reading || {};
  const quiz = data?.quizPerformance || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Exam Readiness</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Understand your progress and know when you are ready for the exam.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Pages read', value: reading.totalPagesRead ?? 0 },
          { label: 'Study time', value: formatDuration(reading.readingTimeSec) },
          { label: 'Streak', value: `${reading.streakDays ?? 0} days` },
          { label: 'Avg. quiz score', value: `${quiz.averageScore ?? 0}%` },
          { label: 'Exams taken', value: readiness?.totals?.examAttempts ?? 0 },
        ].map((item) => (
          <div key={item.label} className="card p-5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      {readiness && <ReadinessPanel readiness={readiness} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicMastery topics={topics?.topics || []} />
        <QuizTrend trend={trends?.quizTrend || []} />
      </div>
    </div>
  );
}

function ReadinessPanel({ readiness }) {
  const { overall, status, components, recommendations } = readiness;
  const statusMeta = {
    ready: { label: 'Exam ready', color: 'text-green-600', ring: 'stroke-green-500' },
    'getting-there': { label: 'Getting there', color: 'text-amber-600', ring: 'stroke-amber-500' },
    'not-ready': { label: 'Not ready yet', color: 'text-red-600', ring: 'stroke-red-500' },
  }[status] || { label: status, color: 'text-slate-600', ring: 'stroke-slate-400' };

  const CIRC = 2 * Math.PI * 52;

  const labels = {
    quizPerformance: 'Quiz performance',
    contentCoverage: 'Content coverage',
    flashcardMastery: 'Flashcard mastery',
    consistency: 'Consistency',
    examPractice: 'Exam practice',
  };

  return (
    <div className="card p-6">
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="flex flex-col items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - overall / 100)}
              className={statusMeta.ring}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-4xl font-bold ${statusMeta.color}`}>{overall}%</span>
            <span className="text-xs text-slate-500">{statusMeta.label}</span>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">Exam Readiness</h2>
          <div className="space-y-2.5">
            {Object.entries(components || {}).map(([key, raw]) => {
              const score = Number(raw) || 0;
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>{labels[key] || key}</span>
                    <span>{score}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-1.5">
            {recommendations?.map((r, i) => (
              <p key={i} className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                💡 {r.message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicMastery({ topics }) {
  if (!topics.length) {
    return (
      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Topic Mastery</h2>
        <p className="text-sm text-slate-400">Take quizzes to see per-topic accuracy.</p>
      </div>
    );
  }
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Topic Mastery</h2>
      <div className="space-y-3">
        {topics.map((t) => (
          <div key={t.name}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-200">{t.name}</span>
              <span className="text-slate-400">{t.accuracy}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${t.accuracy >= 70 ? 'bg-green-500' : t.accuracy >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${t.accuracy}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizTrend({ trend }) {
  if (!trend.length) {
    return (
      <div className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Performance Trend</h2>
        <p className="text-sm text-slate-400">Your recent quiz scores will appear here.</p>
      </div>
    );
  }
  const max = 100;
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Performance Trend</h2>
      <div className="flex h-40 items-end gap-2">
        {trend.slice(-14).map((point, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end" style={{ height: '100%' }}>
              <div
                className="w-full rounded-t bg-brand-600"
                style={{ height: `${Math.max(4, (point.score / max) * 100)}%` }}
                title={`${point.title || 'Quiz'}: ${point.score}%`}
              />
            </div>
            <span className="text-[9px] text-slate-400">
              {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
