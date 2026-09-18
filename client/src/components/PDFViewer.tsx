import { memo, useState } from 'react';

/**
 * Lightweight text-based PDF viewer.
 * Renders document pages with scroll-tracking for progress reporting.
 * A real implementation can swap in react-pdf / pdfjs-dist.
 */
export const PDFViewer = memo(function PDFViewer({ pages = [], onPageChange, onScrollProgress }: any) {
  const [currentPage, setCurrentPage] = useState(1);

  const handleScroll = (e) => {
    const el = e.target;
    const progress = el.scrollHeight - el.clientHeight;
    const ratio = progress > 0 ? el.scrollTop / progress : 1;

    const estimatedPage = Math.max(1, Math.ceil(ratio * pages.length));
    if (estimatedPage !== currentPage) {
      setCurrentPage(estimatedPage);
      onPageChange?.(estimatedPage);
    }
    onScrollProgress?.(ratio);
  };

  if (!pages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        No content available
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <span>
          Page {currentPage} of {pages.length}
        </span>
        <span>{Math.round((currentPage / pages.length) * 100)}% read</span>
      </div>
      <div
        className="flex-1 space-y-4 overflow-y-auto p-4"
        onScroll={handleScroll}
        data-testid="pdf-viewer"
      >
        {pages.map((page) => (
          <section
            key={page.number}
            className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-surface-card"
          >
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Page {page.number}
            </p>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
              {page.text}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
});

export default PDFViewer;
