import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import studyPlanAPI from '@/services/studyPlanAPI';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';

export default function StudyPlanner() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const { data, isPending } = useQuery({
    queryKey: ['plans'],
    queryFn: () => studyPlanAPI.list({ limit: 50 }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => studyPlanAPI.create(payload).then((r) => r.data.data),
    onSuccess: (plan) => {
      dispatch(showNotification({ type: 'success', title: 'Plan created', message: plan.title }));
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowCreate(false);
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Could not create plan', message: getErrorMessage(err) }));
    },
  });

  const toggleTask = useMutation({
    mutationFn: ({ planId, taskId, completed }: { planId: string; taskId: string; completed: boolean }) =>
      studyPlanAPI.updateTask(planId, taskId, completed).then((r) => r.data.data),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      if (plan.status === 'completed') {
        dispatch(showNotification({ type: 'success', title: 'Plan complete', message: `"${plan.title}" finished — well done!` }));
      }
    },
    onError: (err) => dispatch(showNotification({ type: 'error', title: 'Update failed', message: getErrorMessage(err) })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => studyPlanAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setExpanded(null);
      dispatch(showNotification({ type: 'info', title: 'Plan deleted', message: 'The study plan was removed.' }));
    },
    onError: (err) => dispatch(showNotification({ type: 'error', title: 'Delete failed', message: getErrorMessage(err) })),
  });

  if (isPending) return <FullPageLoader label="Loading study plans…" />;

  const plans = data?.docs || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Planner</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Plan your revision, check off tasks, and keep your momentum.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Cancel' : '+ New plan'}
        </button>
      </div>

      {showCreate && (
        <CreatePlanForm
          onCancel={() => setShowCreate(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {plans.length === 0 && !showCreate ? (
        <div className="card p-10 text-center">
          <p className="text-3xl">🗓️</p>
          <p className="mt-2 text-sm text-slate-500">No study plans yet. Create one to organize your revision.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => {
            const total = plan.tasks?.length || 0;
            const done = plan.tasks?.filter((t) => t.completed).length || 0;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={plan._id} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-white">{plan.title}</h3>
                    {plan.goal && <p className="truncate text-xs text-slate-500">{plan.goal}</p>}
                  </div>
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-red-500"
                    onClick={() => deleteMutation.mutate(plan._id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{pct}%</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {done}/{total} tasks · {plan.dailyMinutes || 0} min/day
                  </span>
                  <button
                    type="button"
                    className="font-medium text-brand-600 hover:underline"
                    onClick={() => setExpanded(expanded === plan._id ? null : plan._id)}
                  >
                    {expanded === plan._id ? 'Hide' : 'View tasks'}
                  </button>
                </div>

                {expanded === plan._id && (
                  <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {(plan.tasks || []).map((task) => (
                      <li key={task._id} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(task.completed)}
                          onChange={(e) =>
                            toggleTask.mutate({
                              planId: plan._id,
                              taskId: task._id,
                              completed: e.target.checked,
                            })
                          }
                          className="mt-0.5 h-4 w-4 accent-brand-600"
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-400">{task.durationMin} min</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreatePlanForm({ onCancel, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ title: '', topic: '', goal: '', dailyMinutes: 60, endDate: '' });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title || undefined,
      topic: form.topic || undefined,
      goal: form.goal || undefined,
      dailyMinutes: Number(form.dailyMinutes) || 60,
      endDate: form.endDate || undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="e.g. Cardio final exam prep" value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className="label">Topic</label>
          <input className="input" placeholder="e.g. Cardiovascular physiology" value={form.topic} onChange={set('topic')} />
        </div>
        <div>
          <label className="label">Goal</label>
          <input className="input" placeholder="What do you want to achieve?" value={form.goal} onChange={set('goal')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Minutes/day</label>
            <input type="number" min="15" max="480" className="input" value={form.dailyMinutes} onChange={set('dailyMinutes')} />
          </div>
          <div>
            <label className="label">End date</label>
            <input type="date" className="input" value={form.endDate} onChange={set('endDate')} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Generating tasks…' : 'Generate plan'}
        </button>
      </div>
    </form>
  );
}
