import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu as MenuIcon, X, LogOut } from "lucide-react";
import { startGoogleLogin, useAuth } from "@/context/AuthContext";

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
  const { user, logout } = useAuth();

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
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--lvff-gold)] shadow-[0_0_20px_rgba(212,175,55,0.35)]">
            <img
              src="https://customer-assets.emergentagent.com/job_hospitality-gallery/artifacts/pzi1af18_Skykishrain%20-%20Lord%20Venkateswara%20swamy%20Beautiful%20imAgeS.jpg"
              alt="Sri Venkateswara"
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 28%" }}
              draggable={false}
            />
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

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3" data-testid="navbar-user">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-[var(--lvff-gold)]" />
              ) : (
                <div className="w-8 h-8 rounded-full border border-[var(--lvff-gold)] flex items-center justify-center text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">
                  {user.name?.[0]?.toUpperCase() || "G"}
                </div>
              )}
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] text-[var(--lvff-cream-soft)] font-serif">{user.name?.split(" ")[0]}</span>
                <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/45">{user.is_admin ? "Concierge" : "Guest"}</span>
              </div>
              <button
                onClick={() => logout()}
                className="ml-1 text-[var(--lvff-cream)]/45 hover:text-[var(--lvff-gold)]"
                data-testid="navbar-logout"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
            <button
              onClick={() => startGoogleLogin("/")}
              className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/70 hover:text-[var(--lvff-gold)]"
              data-testid="navbar-google-signin"
            >
              <GoogleGlyph /> Sign in
            </button>
          )}
          <a
            href="#reservation"
            data-testid="navbar-reserve-cta"
            className="btn-lux"
          >
            Reserve a Table
          </a>
        </div>

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

function GoogleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.7 19 12 24 12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.4C29.6 34.6 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.7 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.6 5.4C41.6 35.5 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
