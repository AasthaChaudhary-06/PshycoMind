import { useParams } from 'react-router'
import { ChatWindow } from '../components'

export default function ChatPage() {
  const { documentId } = useParams()

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <h1 className="mb-4 text-2xl font-bold">AI Chat</h1>
      <ChatWindow documentId={documentId} />
    </div>
  )
}
