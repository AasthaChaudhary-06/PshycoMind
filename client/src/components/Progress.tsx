export function Progress({ value = 0, label, size = 'md', color = 'bg-brand-600' }: any) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const height = size === 'lg' ? 'h-3' : size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">{label}</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className={`${height} w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700`}>
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;
