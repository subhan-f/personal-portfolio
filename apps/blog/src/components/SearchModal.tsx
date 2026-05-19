import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Search, X, ArrowRight, Hash } from 'lucide-react';

interface Post {
  title: string;
  description: string;
  slug: string;
  tags: string[];
}

export function SearchModal({ posts }: { posts: Post[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () => new Fuse(posts, { keys: ['title', 'description', 'tags'], threshold: 0.4, minMatchCharLength: 2 }),
    [posts]
  );

  const results = query.trim().length >= 2 ? fuse.search(query).map((r) => r.item) : [];

  const openModal = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const closeModal = useCallback(() => { setOpen(false); setQuery(''); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open ? closeModal() : openModal(); }
      if (e.key === 'Escape' && open) closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, openModal, closeModal]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={openModal}
        aria-label="Search posts (⌘K)"
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
        style={{
          color: 'var(--text-3)',
          borderColor: 'var(--border)',
          background: 'var(--surface)',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
      >
        <Search size={13} />
        <span className="hidden sm:inline">Search</span>
        <kbd
          className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)' }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={closeModal} />

          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <Search size={16} className="shrink-0" style={{ color: 'var(--text-3)' }} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts…"
                className="flex-1 py-4 text-sm bg-transparent focus:outline-none"
                style={{ color: 'var(--text-1)' }}
              />
              {query ? (
                <button onClick={() => setQuery('')} style={{ color: 'var(--text-3)' }}>
                  <X size={15} />
                </button>
              ) : (
                <kbd
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)' }}
                  onClick={closeModal}
                >
                  ESC
                </kbd>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="max-h-80 overflow-y-auto">
                {results.slice(0, 7).map((post) => (
                  <li key={post.slug} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="last:border-0">
                    <a
                      href={`/${post.slug}`}
                      onClick={closeModal}
                      className="flex items-center gap-3 px-4 py-3 group transition-colors"
                      style={{ color: 'var(--text-1)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-raised)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-3)' }}>{post.description}</p>
                      </div>
                      {post.tags[0] && (
                        <span className="hidden sm:flex items-center gap-1 text-[11px] shrink-0" style={{ color: 'var(--text-3)' }}>
                          <Hash size={10} />{post.tags[0]}
                        </span>
                      )}
                      <ArrowRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--brand)' }} />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {query.trim().length >= 2 && results.length === 0 && (
              <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {query.trim().length < 2 && (
              <div className="px-4 py-5 text-center text-xs" style={{ color: 'var(--text-3)' }}>
                Type at least 2 characters
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
