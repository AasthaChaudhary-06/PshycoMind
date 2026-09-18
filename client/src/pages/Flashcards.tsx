import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import flashcardAPI from '@/services/flashcardAPI';
import documentAPI from '@/services/documentAPI';
import { Flashcards } from '@/components/Flashcards';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';

export default function FlashcardsPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [dueOnly, setDueOnly] = useState(false);

  const { data: documents } = useQuery({
    queryKey: ['documents', 'list-for-flashcards'],
    queryFn: () => documentAPI.list({ page: 1, limit: 50 }).then((r) => r.data.data),
  });

  const [documentId, setDocumentId] = useState('');

  const { data, isPending } = useQuery({
    queryKey: ['flashcards', { dueOnly }],
    queryFn: () => flashcardAPI.list({ dueToday: dueOnly ? 'true' : undefined }).then((r) => r.data.data),
  });

  const generateMutation = useMutation({
    mutationFn: (payload: any) => flashcardAPI.generate(payload).then((r) => r.data.data),
    onSuccess: (cards) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      dispatch(
        showNotification({ type: 'success', title: 'Flashcards created', message: `${cards.length} cards generated.` }),
      );
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Generation failed', message: getErrorMessage(err) }));
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, quality }: any) => flashcardAPI.review(id, quality),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards'] }),
  });

  const handleGenerate = () => {
    generateMutation.mutate({ documentId: documentId || undefined, count: 10 });
  };

  const cards = data?.docs || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Flashcards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Spaced-repetition review with the SuperMemo-2 algorithm.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setDueOnly((v) => !v)}
        >
          {dueOnly ? 'All cards' : 'Due today only'}
        </button>
      </div>

      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[220px] flex-1">
          <label className="label">Document</label>
          <select className="input" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
            <option value="">General (no document)</option>
            {documents?.docs?.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? 'Generating…' : 'Generate Flashcards'}
        </button>
      </div>

      {isPending ? (
        <FullPageLoader label="Loading flashcards…" />
      ) : (
        <Flashcards
          cards={cards}
          onReview={(id, quality) => reviewMutation.mutate({ id, quality })}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
