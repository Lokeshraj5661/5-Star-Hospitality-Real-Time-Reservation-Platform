import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X } from "lucide-react";

const links = [
  { label: "Sanctuary", href: "#hero" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Gallery", href: "#menu" },
  { label: "Concierge", href: "#concierge" },
  { label: "Reservation", href: "#reservation" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? "py-4 backdrop-blur-md" : "py-7"
      }`}
      style={{
        backgroundColor: scrolled ? "rgba(20,20,20,0.72)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(212,175,55,0.18)" : "1px solid transparent",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <a href="#hero" data-testid="brand-logo" className="flex items-center gap-3 group">
          <div className="w-9 h-9 border border-[var(--lvff-gold)] flex items-center justify-center text-[var(--lvff-gold)] font-serif text-lg">
            L
          </div>
          <div className="hidden md:flex flex-col leading-none">
            <span className="font-serif text-[var(--lvff-cream)] text-lg tracking-wide">Lakshmi Venkateswara</span>
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] mt-1">Fast Foods · Est. Pulivendula</span>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-12">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="lux-link text-[11px] tracking-luxe uppercase text-[var(--lvff-cream)]/80"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#reservation"
          data-testid="navbar-reserve-cta"
          className="hidden md:inline-flex btn-lux"
        >
          Reserve a Table
        </a>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen(!open)}
          className="lg:hidden text-[var(--lvff-gold)]"
          aria-label="Open menu"
        >
          {open ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-[var(--lvff-bg)]/95 backdrop-blur-xl border-t border-[var(--lvff-gold)]/20"
            data-testid="mobile-menu"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-[var(--lvff-cream)] tracking-luxe uppercase text-xs"
                >
                  {l.label}
                </a>
              ))}
              <a href="#reservation" className="btn-lux self-start" onClick={() => setOpen(false)}>
                Reserve
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
