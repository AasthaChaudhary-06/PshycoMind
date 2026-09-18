import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import searchAPI from '@/services/searchAPI';
import { timeAgo } from '@/utils/format';

const TYPE_META = {
  documents: { icon: '📄', label: 'Documents', to: (r) => `/documents/${r._id}` },
  notes: { icon: '🗒️', label: 'Notes', to: (r) => (r.document ? `/notes/${r.document}` : '/notes') },
  flashcards: { icon: '🃏', label: 'Flashcards', to: () => '/flashcards' },
  quizzes: { icon: '❓', label: 'Quizzes', to: (r) => `/quiz/${r._id}` },
  chats: { icon: '💬', label: 'Chats', to: (r) => (r.document ? `/chat/${r.document}` : '/chat') },
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchAPI.search({ q: debounced, limit: 5 }).then((r) => r.data.data),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  });

  const sections = data ? Object.entries(TYPE_META).map(([key, meta]) => ({ key, meta, items: data[key] || [] })) : [];
  const total = sections.reduce((sum, s) => sum + s.items.length, 0);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative hidden w-full max-w-xs md:block">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search everything…"
          className="input w-full !pl-9"
        />
        {isFetching && (
          <span className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-surface-card">
            {!isFetching && total === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No results for “{query}”.</p>
            )}

            {sections.map(({ key, meta, items }) =>
              items.length ? (
                <div key={key} className="border-b border-slate-100 py-1 last:border-0 dark:border-slate-800">
                  <p className="px-4 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {meta.icon} {meta.label}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setQuery('');
                        navigate(meta.to(item));
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {item.title || item.front || item._id.slice(-6)}
                      </p>
                      {item.snippet && (
                        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{item.snippet}</p>
                      )}
                      {item.updatedAt && (
                        <p className="text-[10px] text-slate-400">Updated {timeAgo(item.updatedAt)}</p>
                      )}
                    </button>
                  ))}
                </div>
              ) : null,
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GlobalSearch;
