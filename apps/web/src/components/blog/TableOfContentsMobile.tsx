import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { TocHeading } from '@lib/markdown';

interface Props {
  headings: TocHeading[];
}

export const TableOfContentsMobile = ({ headings }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
        aria-expanded={open}
      >
        <span>On this page</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            key="toc-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden px-4 pb-3 space-y-2 text-sm"
          >
            {headings.map((h) => (
              <li
                key={h.id}
                className={h.level === 3 ? 'pl-3' : ''}
                onClick={() => setOpen(false)}
              >
                <a
                  href={`#${h.id}`}
                  className="block text-gray-600 dark:text-gray-400 hover:text-[#1cd8d2] transition-colors py-0.5 leading-snug"
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
};
