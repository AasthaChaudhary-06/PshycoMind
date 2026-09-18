import { useState } from 'react';

export function NoteEditor({ note, onSave, onDelete, isLoading = false }: any) {
  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');

  const handleSave = () => {
    onSave?.({ title, body });
  };

  return (
    <div className="flex h-full flex-col">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="input mb-3 text-base font-medium"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your notes, highlights, or AI summaries…"
        className="input min-h-[280px] flex-1 resize-none leading-relaxed"
      />
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          className="btn-danger"
          onClick={() => onDelete?.()}
          disabled={isLoading}
        >
          Delete
        </button>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}

export default NoteEditor;
