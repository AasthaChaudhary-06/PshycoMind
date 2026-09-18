import { useState } from 'react'
import { Link } from 'react-router'
import { useDocuments } from '../features/documents/documentHooks'
import { DOCUMENT_FILTERS, ROUTES } from '../constants'
import { formatDate, formatBytes } from '../utils/format'
import { Pagination, Search, Filter } from '../components'

export default function DocumentsPage() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  const { data, isLoading } = useDocuments({ page, limit: 10, q: query, filter, sort })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Link to={ROUTES.DOCUMENTS} className="btn-secondary">
          All Documents
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Search onSearch={setQuery} placeholder="Search documents..." className="w-64" />
        <Filter
          options={DOCUMENT_FILTERS}
          value={filter}
          onChange={(v) => {
            setFilter(v)
            setPage(1)
          }}
          label="Filter documents"
        />
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value)
            setPage(1)
          }}
          className="input w-auto"
          aria-label="Sort"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.documents?.map((doc) => (
            <Link
              key={doc._id}
              to={ROUTES.DOCUMENT_VIEW(doc._id)}
              className="card group p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="rounded-lg bg-brand-50 p-2 dark:bg-brand-900/30">
                  <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                {doc.bookmarked && (
                  <span className="badge bg-amber-100 text-amber-700">Bookmarked</span>
                )}
              </div>
              <h3 className="font-semibold group-hover:text-brand-600">{doc.title}</h3>
              <p className="mt-1 text-xs text-gray-500">
                {doc.subject ?? 'General'} · {formatBytes(doc.size)}
              </p>
              <p className="mt-3 text-xs text-gray-400">Uploaded {formatDate(doc.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      {data?.totalPages > 1 && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  )
}
