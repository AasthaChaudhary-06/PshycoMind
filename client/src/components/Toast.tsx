import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { dismissNotification, clearNotifications } from '@/features/notification/notificationSlice';
import { selectNotifications } from '@/features/notification/notificationSelectors';

const STYLES = {
  success: { bg: 'bg-green-600', icon: '✓' },
  error: { bg: 'bg-red-600', icon: '✕' },
  warning: { bg: 'bg-amber-500', icon: '!' },
  info: { bg: 'bg-brand-600', icon: 'i' },
};

export function ToastContainer() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {notifications.length > 1 && (
        <button
          type="button"
          className="pointer-events-auto self-end text-xs text-slate-500 hover:text-slate-700"
          onClick={() => dispatch(clearNotifications())}
        >
          Clear all
        </button>
      )}
      <AnimatePresence>
        {notifications.map((n) => {
          const style = STYLES[n.type] || STYLES.info;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-white/10 bg-surface-card p-3 text-white shadow-lg dark:bg-slate-800"
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${style.bg}`}
              >
                {style.icon}
              </span>
              <div className="flex-1">
                {n.title && <p className="text-sm font-medium">{n.title}</p>}
                <p className="text-xs text-slate-300">{n.message}</p>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white"
                onClick={() => dispatch(dismissNotification(n.id))}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
