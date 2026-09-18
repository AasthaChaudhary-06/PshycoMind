export function Loader({ label = 'Loading...', size = 'md' }: any) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-brand-600 border-t-transparent`}
      />
      {label && <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
}

export function FullPageLoader({ label = 'Loading...' }: any) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader label={label} size="lg" />
    </div>
  );
}

export default Loader;
