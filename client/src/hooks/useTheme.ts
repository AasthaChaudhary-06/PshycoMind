import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectThemeMode } from '@/features/theme/themeSelectors';
import { toggleTheme, setTheme } from '@/features/theme/themeSlice';

export function useTheme() {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('physiomind-theme', mode);
  }, [mode]);

  const toggle = () => dispatch(toggleTheme());
  const set = (next) => dispatch(setTheme(next));

  return { mode, toggle, set, isDark: mode === 'dark' };
}
