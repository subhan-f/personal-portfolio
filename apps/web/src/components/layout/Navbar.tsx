import { useState, useRef, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { OverlayMenu } from './OverlayMenu';

interface NavbarProps {
  currentPath?: string;
}

export const Navbar = ({ currentPath = '/' }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [forceVisible, setForceVisible] = useState(false);

  const lastScrollY = useRef(0);
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHomePage = currentPath === '/';

  useEffect(() => {
    const homeSection = document.getElementById('home');
    if (!homeSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setForceVisible(true);
          setVisible(true);
        } else {
          setForceVisible(false);
          setVisible(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(homeSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (forceVisible) {
        setVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
        if (isHomePage) {
          if (timerId.current) clearTimeout(timerId.current);
          timerId.current = setTimeout(() => setVisible(false), 3000);
        }
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, [forceVisible, isHomePage]);

  return (
    <>
      {/* Outer wrapper: full-width, pointer-events off so it doesn't block clicks */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none transition-all duration-300 ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        {/* Floating glass pill */}
        <nav
          className="pointer-events-auto flex items-center h-11 px-1.5 rounded-2xl"
          style={{
            background: 'oklch(from #0a0a0a l c h / 0.55)',
            backdropFilter: 'blur(12px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.8)',
            border: '1px solid oklch(from white l c h / 0.08)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 6px 24px rgba(0,0,0,0.25)',
            isolation: 'isolate',
          }}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <a
            href="/"
            aria-current={currentPath === '/' ? 'page' : undefined}
            className="flex items-center px-3 h-full"
          >
            <img
              src="https://res.cloudinary.com/dkcdwyrjl/image/upload/q_auto/f_auto/v1775601090/Logo_jqnt7d.svg"
              alt="logo"
              className="h-5"
              loading="lazy"
            />
          </a>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 shrink-0" />

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center px-3 h-full text-white/70 hover:text-white transition-colors duration-150 focus:outline-none"
            aria-label="Open Menu"
          >
            <FiMenu size={18} />
          </button>

          {/* Divider + Reach Out — desktop only */}
          <div className="hidden lg:flex items-center h-full">
            <div className="w-px h-5 bg-white/10 shrink-0" />
            <div className="px-2">
              <a
                href={isHomePage ? '#contact' : '/contact'}
                className="flex items-center bg-linear-to-r from-pink-500 to-blue-500 text-white text-sm px-4 py-1.5 rounded-xl font-medium hover:opacity-90 transition-opacity duration-200"
              >
                Reach Out
              </a>
            </div>
          </div>
        </nav>
      </div>

      <OverlayMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};
