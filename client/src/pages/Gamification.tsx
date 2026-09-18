import { useQuery } from '@tanstack/react-query';
import gamificationAPI from '@/services/gamificationAPI';
import { FullPageLoader } from '@/components/Loader';

export default function Gamification() {
  const { data: me, isPending } = useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: () => gamificationAPI.me().then((r) => r.data.data),
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['gamification', 'leaderboard'],
    queryFn: () => gamificationAPI.leaderboard({ limit: 50 }).then((r) => r.data.data),
  });

  if (isPending) return <FullPageLoader label="Loading profile…" />;

  const myRank = (leaderboard || []).findIndex((u) => u._id === me?._id) + 1;
  const meId = me?._id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gamification</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Earn XP for studying, unlock badges, and climb the leaderboard.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Your Progress</h2>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-brand-600">{me?.level}</p>
              <p className="text-xs text-slate-500">Level</p>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>{me?.xpIntoLevel ?? 0} XP</span>
                <span>{me?.xpToNextLevel ?? 250} XP</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${me?.progressPct || 0}%` }} />
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Total <span className="font-semibold text-slate-800 dark:text-white">{me?.xp ?? 0} XP</span>
            {myRank > 0 && <> · Rank <span className="font-semibold text-slate-800 dark:text-white">#{myRank}</span></>}
          </p>

          <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-900 dark:text-white">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {me?.badges?.length ? (
              me.badges.map((badge) => (
                <span key={badge.id} title={`${badge.name} — ${badge.description}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800">
                  {badge.icon} <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{badge.name}</span>
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-400">No badges yet. Upload documents, take quizzes, and study daily to earn them.</p>
            )}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Leaderboard</h2>
          {leaderboard?.length ? (
            <ol className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isMe = entry._id === meId;
                return (
                  <li
                    key={entry._id}
                    className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${isMe ? 'bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-950/40 dark:ring-brand-800' : 'bg-slate-50 dark:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-bold text-slate-400">
                        {index + 1}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                        {entry.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {entry.name}
                        {isMe && <span className="ml-2 text-xs text-brand-600">(you)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {entry.badges?.length > 0 && <span>{entry.badges.length} badges</span>}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Lv {entry.level || 1}</span>
                      <span className="font-semibold text-brand-600">{entry.xp || 0} XP</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Be the first to earn XP!</p>
          )}
        </div>
      </div>
    </div>
  );
}
