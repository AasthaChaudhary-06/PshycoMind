import { useState } from 'react';

export function QuizPanel({ quiz, onSelectAnswer, onFinish, currentAnswers = {}, isSubmitting = false }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const questions = quiz?.questions || [];
  const current = questions[currentIndex];
  const answeredCount = Object.keys(currentAnswers).length;

  const selectAnswer = (optionIndex) => {
    onSelectAnswer?.(currentIndex, optionIndex);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span className="font-medium text-slate-800 dark:text-white">{quiz?.title}</span>
        <span>
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      <div className="mb-6 flex gap-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`h-2 flex-1 rounded-full transition-colors ${
              currentAnswers[i] !== undefined
                ? 'bg-brand-500'
                : i === currentIndex
                  ? 'bg-slate-400'
                  : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {current && (
        <div className="card p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-brand-600">
            Question {currentIndex + 1} · {current.difficulty}
          </p>
          <h3 className="mb-5 text-lg font-medium text-slate-900 dark:text-white">
            {current.question}
          </h3>
          <div className="space-y-2">
            {current.options.map((option, optionIndex) => {
              const selected = currentAnswers[currentIndex] === optionIndex;
              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() => selectAnswer(optionIndex)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs ${
                      selected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              className="btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={onFinish}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting…' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizPanel;
