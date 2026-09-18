export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-surface px-4 dark:from-surface dark:via-slate-900 dark:to-black">
      <div className="w-full max-w-md animate-slide-up rounded-2xl border border-white/10 bg-white p-8 shadow-2xl dark:bg-surface-card">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">PhysioMind</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Intelligence Beyond Reading
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
