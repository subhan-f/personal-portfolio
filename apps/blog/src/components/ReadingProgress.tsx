import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] h-[2px] origin-left will-change-transform"
      style={{
        background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-alt) 100%)',
        transform: `scaleX(${pct / 100})`,
        transition: 'transform 0.05s linear',
      }}
    />
  );
}
