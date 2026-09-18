import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import quizAPI from '@/services/quizAPI';
import documentAPI from '@/services/documentAPI';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';
import { DIFFICULTY_LEVELS } from '@/constants';

export default function Quiz() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { documentId } = useParams();

  const { data: document } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => documentAPI.get(documentId).then((r) => r.data.data),
    enabled: Boolean(documentId),
  });

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);

  const { data: quizzes, isPending } = useQuery({
    queryKey: ['quizzes', documentId],
    queryFn: () => quizAPI.list({ documentId, page: 1, limit: 20 }).then((r) => r.data.data),
  });

  const generateMutation = useMutation({
    mutationFn: (payload: any) => quizAPI.generate(payload).then((r) => r.data.data),
    onSuccess: (quiz) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      dispatch(
        showNotification({
          type: 'success',
          title: 'Quiz generated',
          message: `${quiz.questions?.length} questions ready.`,
        }),
      );
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Generation failed', message: getErrorMessage(err) }));
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      documentId,
      topic: topic || undefined,
      difficulty,
      questionCount,
      title: topic ? `${topic} Quiz` : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {document?.title ? `Generate a quiz from: ${document.title}` : 'Generate quizzes from your documents.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Generate New Quiz
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Topic (optional)</label>
              <input
                className="input"
                placeholder="e.g. Cardiac Output"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select
                className="input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d} value={d}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Questions</label>
              <input
                type="number"
                min={3}
                max={30}
                className="input"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? 'Generating…' : 'Generate Quiz'}
            </button>
            {!documentId && (
              <p className="text-xs text-slate-400">
                Tip: open a document and generate a quiz based on its content.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {isPending ? (
            <FullPageLoader label="Loading quizzes…" />
          ) : quizzes?.docs?.length ? (
            <div className="space-y-3">
              {quizzes.docs.map((quiz) => (
                <div key={quiz._id} className="card flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{quiz.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {quiz.questions?.length || '?'} questions · {quiz.difficulty} ·{' '}
                      {quiz.attempts?.length || 0} attempt(s)
                    </p>
                  </div>
                  <Link to={`/quiz/attempt/${quiz._id}`} className="btn-secondary">
                    Start
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700">
              No quizzes yet — generate your first one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
