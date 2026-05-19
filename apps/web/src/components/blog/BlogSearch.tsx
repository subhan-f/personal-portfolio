import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchPost {
  title: string;
  description: string;
  slug: string;
  tags: string[];
}

interface Props {
  posts: SearchPost[];
}

export const BlogSearch = ({ posts }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.4,
        minMatchCharLength: 2,
      }),
    [posts]
  );

  const results = query.trim().length >= 2 ? fuse.search(query).map((r) => r.item) : [];

  const openModal = useCallback(() => {
    setOpen(true);
    // focus after paint
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? closeModal() : openModal();
      }
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, openModal, closeModal]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Trigger button — lives in the navbar */}
      <button
        onClick={openModal}
        aria-label="Search posts"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Input row */}
            <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800">
              <Search size={16} className="shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts…"
                className="flex-1 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none"
              />
              {query ? (
                <button
                  onClick={() => setQuery('')}
                  className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear"
                >
                  <X size={15} />
                </button>
              ) : (
                <button
                  onClick={closeModal}
                  className="shrink-0 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {results.slice(0, 7).map((post) => (
                  <li key={post.slug}>
                    <a
                      href={`/blog/${post.slug}`}
                      onClick={closeModal}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                          {post.description}
                        </p>
                      </div>
                      <ArrowRight size={14} className="shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-[#1cd8d2] transition-colors" />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {query.trim().length >= 2 && results.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                No posts found for &ldquo;{query}&rdquo;
              </div>
            )}

            {query.trim().length < 2 && (
              <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                Type at least 2 characters to search
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
