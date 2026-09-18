import { useParams } from 'react-router'
import { QuizPanel } from '../components'

export default function QuizPage() {
  const { documentId } = useParams()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Quiz</h1>
      <QuizPanel documentId={documentId} />
    </div>
  )
}
