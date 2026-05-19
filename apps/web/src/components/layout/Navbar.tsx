import { useState, useRef, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import { OverlayMenu } from "./OverlayMenu";

interface NavbarProps {
  currentPath?: string;
}

export const Navbar = ({ currentPath = "/" }: NavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [forceVisible, setForceVisible] = useState(false);

  const lastScrollY = useRef(0);
  const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const homeSection = document.getElementById("home");
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

  const isHomePage = currentPath === "/";

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (forceVisible) {
        setVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 10);
      if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
        // On the home page the hero owns the screen, so auto-hide after inactivity
        if (isHomePage) {
          if (timerId.current) clearTimeout(timerId.current);
          timerId.current = setTimeout(() => setVisible(false), 3000);
        }
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, [forceVisible, isHomePage]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-50 transition-all duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "backdrop-blur-md bg-black/40 border-b border-white/5" : ""}`}
        aria-label="Main navigation"
      >
        <div className="flex items-center space-x-2">
          <a href="/" aria-current={currentPath === "/" ? "page" : undefined}>
            <img src="https://res.cloudinary.com/dkcdwyrjl/image/upload/q_auto/f_auto/v1775601090/Logo_jqnt7d.svg" alt="logo" className=" h-6" loading="lazy" />
          </a>
        </div>
        <div className="block lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-white text-3xl focus:outline-none"
            aria-label="Open Menu"
          >
            <FiMenu />
          </button>
        </div>
        <div className="hidden lg:block">
          <a
            href={isHomePage ? "#contact" : "/contact"}
            className="bg-linear-to-r from-pink-500 to-blue-500 text-white px-5 py-2 rounded-full font-medium shadow-lg hover:opacity-90 transition-opacity duration-300"
          >
            Reach Out
          </a>
        </div>
      </nav>
      <OverlayMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};
