import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full border shadow-lg transition-all duration-200 hover:scale-110"
      style={{
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
        color: 'var(--text-2)',
        boxShadow: '0 4px 20px var(--shadow-color)',
      }}
    >
      <ArrowUp size={16} />
    </button>
  );
}
