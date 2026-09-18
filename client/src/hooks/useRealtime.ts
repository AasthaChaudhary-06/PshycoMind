import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { selectAccessToken } from '@/features/auth/authSelectors';
import { showNotification } from '@/features/notification/notificationSlice';
import { API_URL } from '@/services/axios';

function mapType(type) {
  if (type === 'document' || type === 'quiz' || type === 'notes' || type === 'flashcards') {
    return 'success';
  }
  return 'info';
}

export function useRealtime() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = useSelector(selectAccessToken);

  useEffect(() => {
    if (!token) return undefined;

    const source = new EventSource(`${API_URL}/realtime/stream?token=${encodeURIComponent(token)}`);

    source.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data);
        dispatch(
          showNotification({
            id: notification._id,
            title: notification.title,
            message: notification.message,
            type: mapType(notification.type),
          }),
        );
      } catch {
        /* ignore malformed events */
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    source.addEventListener('notifications:count', (event) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    });

    source.addEventListener('document:status', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'ready') {
          dispatch(
            showNotification({
              id: `doc-ready-${data.documentId}`,
              type: 'success',
              title: 'Document ready',
              message: `"${data.title}" has been indexed and is ready.`,
            }),
          );
        } else if (data.status === 'failed') {
          dispatch(
            showNotification({
              id: `doc-failed-${data.documentId}`,
              type: 'error',
              title: 'Document processing failed',
              message: `"${data.title}" could not be processed.`,
            }),
          );
        }
      } catch {
        /* ignore malformed events */
      }
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    });

    source.onerror = () => {
      // EventSource reconnects automatically; nothing else needed here.
    };

    return () => source.close();
  }, [token, dispatch, queryClient]);
}
