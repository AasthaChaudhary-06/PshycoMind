import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import notesAPI from '@/services/notesAPI';
import documentAPI from '@/services/documentAPI';
import { NoteEditor } from '@/components/Notes';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';
import { timeAgo } from '@/utils/format';

export default function Notes() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { documentId } = useParams();

  const { data: document } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => documentAPI.get(documentId).then((r) => r.data.data),
    enabled: Boolean(documentId),
  });

  const [activeNoteId, setActiveNoteId] = useState(null);

  const { data: notes, isPending } = useQuery({
    queryKey: ['notes', documentId],
    queryFn: () => notesAPI.list({ documentId, page: 1, limit: 50 }).then((r) => r.data.data),
  });

  const activeNote = notes?.docs?.find((n) => n._id === activeNoteId) || notes?.docs?.[0];

  const createMutation = useMutation({
    mutationFn: (payload: any) => notesAPI.create(payload).then((r) => r.data.data),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setActiveNoteId(note._id);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: any) => notesAPI.update(id, payload).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      dispatch(showNotification({ type: 'success', message: 'Note saved' }));
    },
    onError: (err) => dispatch(showNotification({ type: 'error', message: getErrorMessage(err) })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notesAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const handleNewNote = () => {
    createMutation.mutate({ documentId: documentId || undefined, title: 'New Note', body: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {document?.title ? `Notes for: ${document.title}` : 'Personal notes and AI summaries.'}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleNewNote} disabled={createMutation.isPending}>
          + New Note
        </button>
      </div>

      {isPending ? (
        <FullPageLoader label="Loading notes…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {notes?.docs?.length ? (
              notes.docs.map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => setActiveNoteId(note._id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    activeNote?._id === note._id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                      : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
                  }`}
                >
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {note.title || 'Untitled'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{timeAgo(note.updatedAt)}</p>
                </button>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400 dark:border-slate-700">
                No notes yet.
              </p>
            )}
          </div>

          <div className="card p-5">
            {activeNote ? (
              <NoteEditor
                key={activeNote._id}
                note={activeNote}
                onSave={(payload) => updateMutation.mutate({ id: activeNote._id, payload })}
                onDelete={() => {
                  deleteMutation.mutate(activeNote._id);
                  setActiveNoteId(null);
                }}
                isLoading={updateMutation.isPending}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                Select or create a note to begin.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
