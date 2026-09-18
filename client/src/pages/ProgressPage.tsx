import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { Progress } from '../components'
import { useProgress } from '../features/analytics/analyticsHooks'
import { selectUser } from '../features/auth/authSelectors'

export default function ProgressPage() {
  const { userId } = useParams()
  const user = useSelector(selectUser)
  const resolvedUserId = userId === 'me' ? user?.id : userId
  const { data, isLoading } = useProgress(resolvedUserId)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>
      <Progress data={data} isLoading={isLoading} />
    </div>
  )
}
