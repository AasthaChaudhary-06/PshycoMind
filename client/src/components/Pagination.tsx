import { motion } from 'framer-motion';

export function Pagination({ page, totalPages, onPageChange, totalItems }: any) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = getPageWindow(page, totalPages);

  return (
    <nav className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {totalItems} item{totalItems === 1 ? '' : 's'}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Previous
        </button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 rounded-md text-sm ${
                p === page
                  ? 'bg-brand-600 font-semibold text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </motion.button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

function getPageWindow(current: number, total: number): (number | string)[] {
  const windowSize = 3;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);

  if (start > 2) pages.push('ellipsis');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);

  return pages;
}

export default Pagination;
