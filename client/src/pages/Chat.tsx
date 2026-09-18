import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import chatAPI from '@/services/chatAPI';
import documentAPI from '@/services/documentAPI';
import tutorAPI from '@/services/tutorAPI';
import { ChatWindow } from '@/components/ChatWindow';
import { FullPageLoader } from '@/components/Loader';
import { showNotification } from '@/features/notification/notificationSlice';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/error';

export default function Chat() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { documentId } = useParams();

  const { data: document } = useQuery({
    queryKey: ['documents', documentId],
    queryFn: () => documentAPI.get(documentId).then((r) => r.data.data),
    enabled: Boolean(documentId),
  });

  const [chatId, setChatId] = useState(null);

  const createMutation = useMutation({
    mutationFn: (payload: any) => chatAPI.create(payload).then((r) => r.data.data),
    onSuccess: (chat) => setChatId(chat._id),
  });

  useEffect(() => {
    if (!chatId) createMutation.mutate(documentId ? { documentId } : {});
  }, [chatId, documentId]);

  const { data, isPending } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatAPI.get(chatId).then((r) => r.data.data),
    enabled: Boolean(chatId),
  });

  const sendMutation = useMutation({
    mutationFn: ({ content }: any) =>
      chatAPI.sendMessage(chatId, { content, documentId }).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Failed to send', message: getErrorMessage(err) }));
    },
  });

  const { data: quickActions } = useQuery({
    queryKey: ['tutor', 'quick-actions'],
    queryFn: () => tutorAPI.quickActions().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const intentMutation = useMutation({
    mutationFn: (content: string) => tutorAPI.intent({ content, documentId }).then((r) => r.data.data),
    onSuccess: (result) => {
      const action = result.action;
      if (!action) return;
      const navigateTo = { quiz: `/quiz/attempt/${action.id}`, exam: `/exams/${action.id}`, plan: '/plans', flashcards: '/flashcards' }[action.type];
      dispatch(
        showNotification({
          type: 'success',
          title: 'Ready',
          message: navigateTo ? 'Opened in a new tab — tap to view.' : 'Completed.',
        }),
      );
      if (navigateTo) navigate(navigateTo);
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      dispatch(showNotification({ type: 'error', title: 'Failed', message: getErrorMessage(err) }));
    },
  });

  const handleSend = (content) => {
    if (!chatId) return;
    sendMutation.mutate({ content });
  };

  const handleQuickAction = (action: any) => {
    if (action === '__NO_SPEECH__') {
      dispatch(
        showNotification({
          type: 'error',
          title: 'Voice not supported',
          message: 'Your browser does not support speech recognition. Type your question instead.',
        }),
      );
      return;
    }
    if (action?.prompt) intentMutation.mutate(action.prompt);
  };

  if (isPending || !chatId) return <FullPageLoader label="Starting chat…" />;

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Tutor Chat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {document?.title
            ? `Context: ${document.title}`
            : 'Ask any medical question — answers will cite your uploaded material.'}
        </p>
      </div>

      <ChatWindow
        messages={data?.messages || []}
        onSend={handleSend}
        onQuickAction={handleQuickAction}
        isStreaming={sendMutation.isPending || intentMutation.isPending}
        documentTitle={document?.title}
        quickActions={quickActions?.actions || []}
      />
    </div>
  );
}
