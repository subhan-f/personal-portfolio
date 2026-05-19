import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const BlogThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    const next = !isDark;
    html.classList.toggle('dark', next);
    localStorage.setItem('blog-theme', next ? 'dark' : 'light');
    setIsDark(next);
    window.dispatchEvent(new CustomEvent('blog-theme-change', { detail: { dark: next } }));
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
