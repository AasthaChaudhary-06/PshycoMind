import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import quizAPI from '@/services/quizAPI';
import analyticsAPI from '@/services/analyticsAPI';
import { QuizPanel } from '@/components/QuizPanel';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';

export default function QuizDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [answers, setAnswers] = useState({});
  const [startedAt] = useState(() => new Date().toISOString());
  const [result, setResult] = useState(null);

  const { data: quiz, isPending } = useQuery({
    queryKey: ['quiz', quizId, 'start'],
    queryFn: () => quizAPI.start(quizId).then((r) => r.data.data),
    enabled: Boolean(quizId),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: any) => quizAPI.submit(quizId, payload).then((r) => r.data.data),
    onSuccess: (data) => {
      setResult(data.attempt);
      analyticsAPI.trackQuiz();
      dispatch(
        showNotification({
          type: 'success',
          title: 'Quiz submitted',
          message: `You scored ${data.attempt.score}/${data.attempt.total} (${data.attempt.percentage}%)`,
        }),
      );
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Submit failed', message: getErrorMessage(err) }));
    },
  });

  const handleSelect = (index, answer) => {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleFinish = () => {
    const answersArray = (quiz?.questions || []).map((_, index) => answers[index]);
    submitMutation.mutate({ answers: answersArray, startedAt });
  };

  if (isPending) return <FullPageLoader label="Loading quiz…" />;

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500">Your score</p>
          <p className="mt-2 text-5xl font-bold text-brand-600">{result.percentage}%</p>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {result.score} of {result.total} correct
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => navigate('/quiz')}>
              More Quizzes
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setResult(null);
                setAnswers({});
                navigate(0);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizPanel
      quiz={quiz}
      onSelectAnswer={handleSelect}
      onFinish={handleFinish}
      currentAnswers={answers}
      isSubmitting={submitMutation.isPending}
    />
  );
}
