import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useIsMobile } from "@hooks/useIsMobile";
import { useEffect, useRef, useCallback } from "react";

const menuItems = [
  { label: "Home", path: "/", external: false },
  { label: "About", path: "/about", external: false },
  { label: "Projects", path: "/projects", external: false },
  { label: "Experience", path: "/experience", external: false },
  { label: "Testimonials", path: "/testimonials", external: false },
  { label: "Blog", path: "https://blog.subhanfarrakh.com", external: true },
  { label: "Contact", path: "/contact", external: false },
];

interface OverlayMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OverlayMenu = ({ isOpen, onClose }: OverlayMenuProps) => {
  const isMobile = useIsMobile("(max-width: 1023px)");
  const origin = isMobile ? "95% 8%" : "50% 8%";
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Hide main content from assistive technology when menu is open
      const mainContent = document.getElementById("main-content");
      if (mainContent) mainContent.setAttribute("aria-hidden", "true");
      // Focus the close button when menu opens
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      const mainContent = document.getElementById("main-content");
      if (mainContent) mainContent.removeAttribute("aria-hidden");
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      const mainContent = document.getElementById("main-content");
      if (mainContent) mainContent.removeAttribute("aria-hidden");
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          initial={{ clipPath: `circle(0% at ${origin})` }}
          animate={{ clipPath: `circle(150% at ${origin})` }}
          exit={{ clipPath: `circle(0% at ${origin})` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
        >
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-6 right-6 text-white text-3xl"
            aria-label="Close Menu"
          >
            <FiX className="hover:cursor-pointer" />
          </button>
          <ul className="space-y-7 text-center">
            {menuItems.map((item, index) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <a
                  href={item.path}
                  onClick={onClose}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-4xl text-white font-semibold hover:text-pink-400 transition-colors duration-300"
                >
                  {item.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
