import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import documentAPI from '@/services/documentAPI';
import { useDebouncedValue } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { FullPageLoader } from '@/components/Loader';
import { DocumentCard } from '@/components/DocumentCard';
import { Pagination } from '@/components/Pagination';
import { Search } from '@/components/Search';
import { Filter } from '@/components/Filter';
import { Upload } from '@/components/Upload';
import { SUBJECTS } from '@/constants';

export default function Documents() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 400);
  const [subject, setSubject] = useState('');
  const [favorite, setFavorite] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showUpload, setShowUpload] = useState(false);

  const { page, limit, totalPages, goToPage, reset } = usePagination({ limit: 12 });

  useEffect(() => {
    reset();
  }, [search, subject, favorite, sortBy, sortOrder, reset]);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', { page, limit, search, subject, favorite, sortBy, sortOrder }],
    queryFn: () =>
      documentAPI
        .list({ page, limit, search, subject, favorite, sortBy, sortOrder })
        .then((r) => r.data.data),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload study material and let PhysioMind index it for AI-powered learning.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowUpload(true)}>
          + Upload Document
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Search value={searchInput} onChange={setSearchInput} placeholder="Search documents…" className="flex-1 min-w-[200px]" />
        <Filter
          label="Subject"
          options={SUBJECTS}
          value={subject}
          onChange={setSubject}
        />
        <Filter
          options={[
            { value: 'true', label: 'Favorites' },
            { value: 'false', label: 'Not favorites' },
          ]}
          value={favorite}
          onChange={setFavorite}
          allLabel="All favorites"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input w-auto">
          <option value="createdAt">Newest first</option>
          <option value="title">Alphabetical</option>
        </select>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
        >
          {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
        </button>
      </div>

      {isLoading ? (
        <FullPageLoader label="Loading documents…" />
      ) : data?.docs?.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.docs.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            onPageChange={goToPage}
          />
        </>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500">No documents yet.</p>
          <button type="button" className="btn-primary" onClick={() => setShowUpload(true)}>
            Upload your first document
          </button>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowUpload(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-surface-card" onClick={(e) => e.stopPropagation()}>
            <Upload />
            <button type="button" className="btn-secondary mt-3 w-full" onClick={() => setShowUpload(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
