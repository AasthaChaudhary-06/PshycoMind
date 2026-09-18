import { useState } from 'react';

export function Flashcards({ cards = [], onReview, isLoading = false }: any) {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = cards[currentIndex];

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((i) => (i + 1) % cards.length);
  };

  const review = (quality) => {
    if (!current) return;
    onReview?.(current._id, quality);
    nextCard();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading flashcards…
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No flashcards yet — generate some from a document.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span className="capitalize">{current.mastery}</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="card flex h-72 w-full cursor-pointer flex-col items-center justify-center p-8 text-center transition-transform"
      >
        {flipped ? (
          <>
            <span className="mb-3 text-xs font-medium uppercase tracking-widest text-brand-600">
              Answer
            </span>
            <p className="text-lg text-slate-900 dark:text-white">{current.back}</p>
          </>
        ) : (
          <>
            <span className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">
              Question
            </span>
            <p className="text-lg font-medium text-slate-900 dark:text-white">{current.front}</p>
          </>
        )}
        <span className="mt-6 text-xs text-slate-400">Click to flip</span>
      </button>

      {flipped && (
        <div className="mt-6 flex justify-center gap-3">
          {[
            { value: 0, label: 'Again', color: 'bg-red-600 hover:bg-red-700' },
            { value: 3, label: 'Good', color: 'bg-amber-500 hover:bg-amber-600' },
            { value: 5, label: 'Easy', color: 'bg-green-600 hover:bg-green-700' },
          ].map((btn) => (
            <button
              key={btn.value}
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${btn.color}`}
              onClick={() => review(btn.value)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Flashcards;
