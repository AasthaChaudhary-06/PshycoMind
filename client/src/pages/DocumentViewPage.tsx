import { Link, useParams } from 'react-router'
import { useDocument } from '../features/documents/documentHooks'
import { PDFViewer } from '../components'
import { ROUTES } from '../constants'

const actions = [
  { to: 'chat', label: 'AI Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: 'quiz', label: 'Quiz', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { to: 'notes', label: 'Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
]

export default function DocumentViewPage() {
  const { documentId } = useParams()
  const { data: doc, isLoading } = useDocument(documentId)

  if (isLoading) return <p className="text-sm text-gray-500">Loading document...</p>
  if (!doc) return <p className="text-sm text-red-600">Document not found</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          <p className="text-sm text-gray-500">
            {doc.subject ?? 'General'} · {doc.pageCount ?? '—'} pages
          </p>
        </div>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to === 'chat' ? ROUTES.CHAT_WITH_DOCUMENT(doc._id) : action.to === 'quiz' ? ROUTES.QUIZ_WITH_DOCUMENT(doc._id) : ROUTES.NOTES_WITH_DOCUMENT(doc._id)}
              className="btn-secondary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {doc.summary && (
        <div className="card p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            AI Summary
          </h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
            {doc.summary}
          </p>
        </div>
      )}

      <div className="h-[70vh]">
        <PDFViewer url={doc.fileUrl} documentId={doc._id} />
      </div>
    </div>
  )
}
