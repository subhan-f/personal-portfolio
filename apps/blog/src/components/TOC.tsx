'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ChevronDown } from 'lucide-react';

export interface TocHeading { id: string; text: string; level: 2 | 3; }

// ── Desktop sidebar ────────────────────────────────────────────────────────────

export function TOCSidebar({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState('');
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    // Active heading via IntersectionObserver
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { setActiveId(entry.target.id); break; }
        }
      },
      { rootMargin: '0px 0px -65% 0px', threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  useEffect(() => {
    // Scroll progress relative to article
    const article = document.querySelector('article');
    if (!article) return;
    const onScroll = () => {
      const { top, height } = article.getBoundingClientRect();
      const viewH = window.innerHeight;
      const pct = Math.min(1, Math.max(0, (viewH - top) / (height + viewH)));
      setScrollPct(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="w-56 shrink-0">
      <div
        className="sticky top-20 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 7rem)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>
          On this page
        </p>

        <div className="flex gap-3">
          {/* Scroll progress track */}
          <div className="relative w-0.5 shrink-0 rounded-full self-stretch" style={{ background: 'var(--border)' }}>
            <div
              className="toc-progress-fill absolute top-0 left-0 w-full rounded-full"
              style={{ height: `${scrollPct * 100}%` }}
            />
          </div>

          {/* Links */}
          <ol className="flex flex-col gap-1 min-w-0">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  data-active={activeId === h.id ? 'true' : undefined}
                  className="toc-link block text-sm leading-snug py-0.5 transition-colors truncate"
                  style={{
                    paddingLeft: h.level === 3 ? '0.75rem' : '0',
                    fontSize: h.level === 3 ? '0.8rem' : '0.875rem',
                    color: activeId === h.id ? 'var(--brand)' : 'var(--text-3)',
                    fontWeight: activeId === h.id ? '500' : '400',
                  }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}

// ── Mobile accordion ───────────────────────────────────────────────────────────

export function TOCMobile({ headings }: { headings: TocHeading[] }) {
  const [open, setOpen] = useState(false);

  if (headings.length < 2) return null;

  return (
    <div
      className="lg:hidden mb-8 rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-1)' }}
      >
        <span className="flex items-center gap-2">
          <List size={14} style={{ color: 'var(--brand)' }} />
          On this page
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} style={{ color: 'var(--text-3)' }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm transition-colors"
                  style={{
                    paddingLeft: h.level === 3 ? '2rem' : '1rem',
                    color: 'var(--text-2)',
                    fontSize: h.level === 3 ? '0.8rem' : '0.875rem',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}
