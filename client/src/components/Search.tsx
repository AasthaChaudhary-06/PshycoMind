import { useDebouncedValue } from '@/hooks/useDebounce';

export function Search({ value, onChange, placeholder = 'Search…', className = '' }: any) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        ⌕
      </span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  );
}

export default Search;

export function useDebouncedSearch(onSearch: any, delay = 400) {
  const debounced = useDebouncedValue;
  return { debounced, onSearch, delay };
}
