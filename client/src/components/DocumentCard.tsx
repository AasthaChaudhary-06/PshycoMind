import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatBytes } from '@/utils/format';

export const DocumentCard = memo(function DocumentCard({ document }: any) {
  const isReady = document.status === 'ready';

  return (
    <Link
      to={`/documents/${document._id}`}
      className="card group block p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-lg text-brand-600 dark:bg-brand-950 dark:text-brand-300">
          {document.fileType === 'pdf' ? '📄' : '📝'}
        </span>
        {document.isFavorite && (
          <span className="text-amber-500" title="Favorited">
            ★
          </span>
        )}
      </div>

      <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white">
        {document.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
        {document.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{document.subject}</span>
        <span>{formatBytes(document.sizeBytes)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>{formatDate(document.createdAt)}</span>
        {isReady ? (
          <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-600 dark:bg-green-950 dark:text-green-400">
            Ready
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            Indexing
          </span>
        )}
      </div>
    </Link>
  );
});
