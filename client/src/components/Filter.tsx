export function Filter({ options = [], value, onChange, label, allLabel = 'All' }: any) {
  return (
    <label className="flex items-center gap-2">
      {label && <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input w-auto">
        <option value="">{allLabel}</option>
        {options.map((option) => {
          if (typeof option === 'string') {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          }
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export default Filter;
