import { useState, useEffect } from 'react';
import Giscus from '@giscus/react';

interface Props {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  term: string;
}

export const GiscusComments = ({ repo, repoId, category, categoryId, term }: Props) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Read initial theme
    setIsDark(document.documentElement.classList.contains('dark'));

    // Sync when BlogThemeToggle fires the custom event
    const handler = (e: Event) => {
      setIsDark((e as CustomEvent<{ dark: boolean }>).detail.dark);
    };
    window.addEventListener('blog-theme-change', handler);
    return () => window.removeEventListener('blog-theme-change', handler);
  }, []);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Comments</h2>
      <Giscus
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="specific"
        term={term}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={isDark ? 'dark' : 'light'}
        lang="en"
        loading="lazy"
      />
    </div>
  );
};
