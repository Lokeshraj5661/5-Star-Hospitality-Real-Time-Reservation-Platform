import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, RefreshCw, ShieldCheck, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setToken, generateCaptcha, getToken } from "@/lib/adminAuth";
import { startGoogleLogin, useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Dark-mode visual CAPTCHA rendered as SVG (no external service required)
function Captcha({ value, onRefresh }) {
  const chars = value.split("");
  return (
    <div className="relative gold-frame w-full h-16 md:h-20 flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 280 80" className="w-full h-full" role="img" aria-label={`Captcha: ${value}`}>
        <defs>
          <linearGradient id="glyph-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#F5F5DC" />
            <stop offset="55%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6F2A" />
          </linearGradient>
        </defs>
        {/* Noise strokes */}
        {[...Array(9)].map((_, i) => (
          <line
            key={i}
            x1={Math.random() * 280}
            y1={Math.random() * 80}
            x2={Math.random() * 280}
            y2={Math.random() * 80}
            stroke="#D4AF37"
            strokeOpacity={0.15}
            strokeWidth={1}
          />
        ))}
        {/* Dots */}
        {[...Array(50)].map((_, i) => (
          <circle
            key={`d-${i}`}
            cx={Math.random() * 280}
            cy={Math.random() * 80}
            r={Math.random() * 1.4}
            fill="#D4AF37"
            fillOpacity={0.35}
          />
        ))}
        {chars.map((c, i) => (
          <text
            key={i}
            x={30 + i * 46}
            y={54 + (Math.random() * 6 - 3)}
            fontFamily="'Cormorant Garamond', serif"
            fontSize={44}
            fontStyle={i % 2 === 0 ? "italic" : "normal"}
            fontWeight={600}
            fill="url(#glyph-grad)"
            transform={`rotate(${(Math.random() - 0.5) * 20} ${30 + i * 46} 54)`}
            style={{ letterSpacing: "0.1em" }}
          >
            {c}
          </text>
        ))}
      </svg>
      <button
        type="button"
        onClick={onRefresh}
        className="absolute top-2 right-2 w-8 h-8 border border-[var(--lvff-gold)]/40 flex items-center justify-center text-[var(--lvff-gold)] hover:bg-[var(--lvff-gold)] hover:text-[var(--lvff-bg)] transition-colors"
        aria-label="Refresh captcha"
        data-testid="captcha-refresh"
      >
        <RefreshCw size={12} />
      </button>
    </div>
  );
}

export default function AdminPortal() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaExpected, setCaptchaExpected] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({});

  // If already authed (JWT) or Google admin, jump straight to /admin
  useEffect(() => {
    if (getToken()) {
      axios
        .get(`${API}/admin/auth/me`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(() => nav("/admin", { replace: true }))
        .catch(() => {});
    }
    axios.get(`${API}/admin/config`).then((r) => setConfig(r.data)).catch(() => {});
  }, [nav]);

  useEffect(() => {
    if (user?.is_admin) nav("/admin", { replace: true });
  }, [user, nav]);

  const refreshCaptcha = () => {
    setCaptchaExpected(generateCaptcha());
    setCaptchaInput("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Username and password are required.");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaExpected) {
      toast.error("Captcha does not match.");
      refreshCaptcha();
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/admin/auth/login`, {
        username: username.trim(),
        password,
        captcha: captchaInput.trim().toUpperCase(),
        captcha_expected: captchaExpected,
      });
      setToken(data.token);
      toast.success("Console unlocked · welcome back.");
      nav("/admin", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed.";
      toast.error(msg);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const configStatus = useMemo(() => {
    if (!config) return null;
    return (
      <div className="flex flex-wrap gap-3 text-[9px] tracking-luxe uppercase">
        <Pill ok={config.twilio_configured} label="SMS" />
        <Pill ok={config.email_configured} label="Email" />
      </div>
    );
  }, [config]);

  return (
    <div className="min-h-screen bg-marble bg-noise flex items-center justify-center p-6 relative overflow-hidden" data-testid="admin-portal">
      <div className="lantern" style={{ width: 420, height: 420, background: "#D4AF37", top: "10%", left: "10%" }} />
      <div className="lantern" style={{ width: 480, height: 480, background: "#8B6F2A", bottom: "10%", right: "8%", opacity: 0.35 }} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lvff-gold)]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lvff-gold)]/40 to-transparent" />
      </div>

      <AnimatePresence>
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="gold-frame max-w-md w-full p-10 md:p-12 flex flex-col gap-6 relative z-10 bg-[var(--lvff-bg)]/95 backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[var(--lvff-gold)]" size={16} />
              <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Concierge Portal</span>
            </div>
            {configStatus}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-[var(--lvff-cream-soft)] leading-tight">
            The <span className="italic engraved">House</span> Awaits.
          </h1>
          <p className="text-sm text-[var(--lvff-cream)]/55 leading-relaxed">
            Secured administrative access. Signed sessions expire in 12 hours.
          </p>

          <label className="flex flex-col gap-2">
            <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-2">
              <User size={11} /> Username
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="lux-input"
              placeholder="username"
              autoComplete="username"
              data-testid="admin-username-input"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-2">
              <Lock size={11} /> Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="lux-input"
              placeholder="•••••••••"
              autoComplete="current-password"
              data-testid="admin-password-input"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-2">
              <KeyRound size={11} /> Prove You Belong
            </span>
            <Captcha value={captchaExpected} onRefresh={refreshCaptcha} />
            <input
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="lux-input"
              placeholder="Type the code above"
              autoComplete="off"
              data-testid="admin-captcha-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-lux btn-lux-solid justify-center mt-2 disabled:opacity-60"
            data-testid="admin-login-submit"
          >
            {loading ? "Verifying…" : "Enter the Console"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-1">
            <div className="flex-1 h-[1px] bg-[var(--lvff-gold)]/25" />
            <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/40">Or</span>
            <div className="flex-1 h-[1px] bg-[var(--lvff-gold)]/25" />
          </div>

          {/* Google Sign-In */}
          {/* REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH */}
          <button
            type="button"
            onClick={() => startGoogleLogin("/admin/portal")}
            className="btn-lux justify-center flex items-center gap-3"
            data-testid="admin-google-signin"
          >
            <GoogleGlyph /> Sign in with Google
          </button>
          <div className="text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/40 text-center">
            Only allowlisted emails may enter the console
          </div>

          <a
            href="/"
            className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/45 text-center hover:text-[var(--lvff-gold)] transition-colors"
          >
            ← Back to Sanctuary
          </a>
        </motion.form>
      </AnimatePresence>
    </div>
  );
}

function Pill({ ok, label }) {
  return (
    <span
      className="flex items-center gap-1.5 border px-2 py-1"
      style={{
        borderColor: ok ? "rgba(52,211,153,0.4)" : "rgba(245,158,11,0.4)",
        color: ok ? "#34D399" : "#F59E0B",
      }}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: ok ? "#34D399" : "#F59E0B" }} />
      {label}
    </span>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.7 19 12 24 12c3.1 0 5.9 1.2 8.1 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.4C29.6 34.6 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.7 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.6 5.4C41.6 35.5 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
