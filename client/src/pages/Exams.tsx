import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import examAPI from '@/services/examAPI';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';
import { DIFFICULTY_LEVELS } from '@/constants';

export default function Exams() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimitMin, setTimeLimitMin] = useState(30);

  const { data: exams, isPending } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examAPI.list({ limit: 20 }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => examAPI.create(payload).then((r) => r.data.data),
    onSuccess: (exam) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      dispatch(
        showNotification({
          type: 'success',
          title: 'Exam created',
          message: `${exam.questions?.length} questions · ${exam.timeLimitMin} minutes.`,
        }),
      );
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Creation failed', message: getErrorMessage(err) }));
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      topic: topic || undefined,
      difficulty,
      questionCount,
      timeLimitMin,
      title: topic ? `${topic} Exam` : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Mode</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Timed mock exams to simulate real test conditions and build exam readiness.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Create Mock Exam
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Topic (optional)</label>
              <input className="input" placeholder="e.g. Respiratory physiology" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d} value={d}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Questions</label>
                <input type="number" min={5} max={50} className="input" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Minutes</label>
                <input type="number" min={5} max={300} className="input" value={timeLimitMin} onChange={(e) => setTimeLimitMin(Number(e.target.value))} />
              </div>
            </div>
            <button type="button" className="btn-primary w-full" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Generating…' : 'Create Exam'}
            </button>
            <p className="text-xs text-slate-400">⏱ The clock starts when you begin. Results are auto-graded instantly.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {isPending ? (
            <FullPageLoader label="Loading exams…" />
          ) : exams?.docs?.length ? (
            <div className="space-y-3">
              {exams.docs.map((exam) => {
                const best = exam.attempts?.length
                  ? Math.max(...exam.attempts.map((a) => a.percentage))
                  : null;
                return (
                  <div key={exam._id} className="card flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{exam.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {exam.questions?.length} questions · {exam.timeLimitMin} min · {exam.difficulty}
                        {best !== null ? ` · Best ${best}%` : ''}
                      </p>
                    </div>
                    <Link to={`/exams/${exam._id}`} className="btn-primary">
                      {best !== null ? 'Retake' : 'Start exam'}
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700">
              No exams yet — create your first mock exam.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
