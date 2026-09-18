import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, APP_NAME, APP_TAGLINE } from '@/constants';

const ICONS = {
  dashboard: '▦',
  document: '▤',
  chat: '💬',
  quiz: '?',
  exam: '⏱',
  flashcard: '▱',
  planner: '🗓',
  notes: '✎',
  analytics: '📈',
  trophy: '🏆',
  settings: '⚙',
};

export function Sidebar({ open = false, onClose }: any) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              P
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{APP_NAME}</p>
              <p className="text-[11px] text-slate-500">{APP_TAGLINE}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <span className="w-5 text-center text-base">{ICONS[item.icon] || '•'}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="text-[11px] text-slate-400">PhysioMind v1.0 · Medical AI Study Platform</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
