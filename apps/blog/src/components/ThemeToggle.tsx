import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// Read DOM state synchronously — called as a lazy initializer so it runs
// on the first client render (after the anti-FOUC script has already applied
// the correct class), giving the right icon with no flash.
const readTheme = (): boolean =>
  typeof document !== 'undefined' &&
  document.documentElement.classList.contains('dark');

export function ThemeToggle() {
  // Lazy initializer: called once on mount with the correct DOM state
  const [dark, setDark] = useState<boolean>(readTheme);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('blog-theme', next ? 'dark' : 'light');
    setDark(next);
    window.dispatchEvent(new CustomEvent('blog-theme-change', { detail: { dark: next } }));
  };

  // Follow system preference changes only when the user has no manual override
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('blog-theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
        setDark(e.matches);
      }
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
      style={{ color: 'var(--text-3)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-1)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
