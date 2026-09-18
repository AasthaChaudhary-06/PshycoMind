import { useParams } from 'react-router'
import { Notes } from '../components'

export default function NotesPage() {
  const { documentId } = useParams()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">AI Notes</h1>
      <Notes documentId={documentId} />
    </div>
  )
}
