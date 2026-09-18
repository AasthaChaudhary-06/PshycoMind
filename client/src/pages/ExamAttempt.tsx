import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import examAPI from '@/services/examAPI';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ExamAttempt() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { examId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startedAt] = useState(() => new Date().toISOString());
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(0);

  const { data: exam, isPending } = useQuery({
    queryKey: ['exam', examId, 'start'],
    queryFn: () => examAPI.start(examId).then((r) => r.data.data),
    enabled: Boolean(examId),
  });

  useEffect(() => {
    if (exam?.attempt?.timeLimitMin) {
      setRemaining(exam.attempt.timeLimitMin * 60);
    }
  }, [exam]);

  const submitMutation = useMutation({
    mutationFn: (payload: any) => examAPI.submit(examId, payload).then((r) => r.data.data),
    onSuccess: (data) => {
      setResult(data.attempt);
      dispatch(
        showNotification({
          type: 'success',
          title: 'Exam submitted',
          message: `You scored ${data.attempt.percentage}% (${data.attempt.score}/${data.attempt.total})`,
        }),
      );
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Submit failed', message: getErrorMessage(err) }));
    },
  });

  useEffect(() => {
    if (!remaining || submitMutation.isPending) return undefined;
    const timer = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, submitMutation.isPending]);

  const handleFinish = () => {
    const answersArray = (exam?.questions || []).map((_, index) => answers[index]);
    submitMutation.mutate({ answers: answersArray, startedAt });
  };

  if (isPending) return <FullPageLoader label="Starting exam…" />;

  const questions = exam?.questions || [];
  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const lowTime = remaining > 0 && remaining <= 60;

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500">Exam score</p>
          <p className="mt-2 text-5xl font-bold text-brand-600">{result.percentage}%</p>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {result.score} of {result.total} correct · {Math.floor(result.timeTakenSec / 60)}m {result.timeTakenSec % 60}s
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => navigate('/exams')}>
              Back to exams
            </button>
            <button type="button" className="btn-primary" onClick={() => navigate(0)}>
              Retake
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div>
          <p className="font-medium text-slate-800 dark:text-white">{exam?.title}</p>
          <p className="text-xs text-slate-500">
            {answeredCount}/{questions.length} answered
          </p>
        </div>
        <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold ${lowTime ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
          ⏱ {formatTime(remaining)}
        </div>
      </div>

      <div className="mb-6 flex gap-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`h-2 flex-1 rounded-full transition-colors ${
              answers[i] !== undefined ? 'bg-brand-500' : i === currentIndex ? 'bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {current && (
        <div className="card p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-brand-600">
            Question {currentIndex + 1} · {current.difficulty}
          </p>
          <h3 className="mb-5 text-lg font-medium text-slate-900 dark:text-white">{current.question}</h3>
          <div className="space-y-2">
            {current.options.map((option, optionIndex) => {
              const selected = answers[currentIndex] === optionIndex;
              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }))}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs ${selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button type="button" className="btn-secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button type="button" className="btn-primary" onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={handleFinish} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? 'Submitting…' : 'Submit exam'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
