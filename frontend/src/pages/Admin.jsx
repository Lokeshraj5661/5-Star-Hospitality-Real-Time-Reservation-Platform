import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, CalendarDays, Wifi, WifiOff, LogOut, KeyRound } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WS_URL = (() => {
  try {
    const u = new URL(BACKEND_URL);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return u.toString().replace(/\/$/, "") + "/api/admin/ws";
  } catch {
    return "";
  }
})();

export default function Admin() {
  const [pwd, setPwd] = useState(sessionStorage.getItem("lvff-admin-pwd") || "");
  const [authed, setAuthed] = useState(false);
  const [config, setConfig] = useState({});
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [wsState, setWsState] = useState("idle");
  const wsRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/admin/config`).then((r) => setConfig(r.data)).catch(() => {});
  }, []);

  // Try auto-login if a pwd is cached
  useEffect(() => {
    if (pwd && !authed) {
      tryLogin(pwd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryLogin = async (password) => {
    try {
      await axios.post(`${API}/admin/login`, { password });
      sessionStorage.setItem("lvff-admin-pwd", password);
      setAuthed(true);
      loadAll(password);
      openWS(password);
    } catch (e) {
      sessionStorage.removeItem("lvff-admin-pwd");
      setAuthed(false);
      if (e.response?.status === 503) {
        toast.error("Admin password not configured on server. Set ADMIN_PASSWORD in backend/.env");
      } else if (e.response?.status === 401) {
        toast.error("Invalid password.");
      } else {
        toast.error("Could not reach admin endpoint.");
      }
    }
  };

  const loadAll = async (password) => {
    const headers = { "X-Admin-Password": password };
    try {
      const [o, r] = await Promise.all([
        axios.get(`${API}/orders`, { headers }),
        axios.get(`${API}/reservations`, { headers }),
      ]);
      setOrders(o.data);
      setReservations(r.data);
    } catch (e) {
      // ignore
    }
  };

  const openWS = (password) => {
    if (!WS_URL) return;
    setWsState("connecting");
    const ws = new WebSocket(`${WS_URL}?password=${encodeURIComponent(password)}`);
    wsRef.current = ws;
    ws.onopen = () => setWsState("open");
    ws.onclose = () => setWsState("closed");
    ws.onerror = () => setWsState("error");
    ws.onmessage = (evt) => {
      try {
        const m = JSON.parse(evt.data);
        if (m.type === "order") {
          setOrders((prev) => [m.data, ...prev]);
          toast.success(`New order from ${m.data.customer_name}`);
        } else if (m.type === "reservation") {
          setReservations((prev) => [m.data, ...prev]);
          toast.success(`New reservation by ${m.data.name}`);
        }
      } catch {
        /* ignore */
      }
    };
  };

  const logout = () => {
    sessionStorage.removeItem("lvff-admin-pwd");
    wsRef.current?.close();
    setAuthed(false);
    setPwd("");
    setOrders([]);
    setReservations([]);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-marble bg-noise flex items-center justify-center p-6" data-testid="admin-login-page">
        <div className="gold-frame max-w-md w-full p-10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <KeyRound className="text-[var(--lvff-gold)]" size={18} />
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Concierge Console</span>
          </div>
          <h1 className="font-serif text-4xl text-[var(--lvff-cream-soft)] leading-tight">
            Enter the <span className="italic engraved">House</span>.
          </h1>
          {!config.admin_configured && (
            <p className="text-sm text-[var(--lvff-cream)]/60 leading-relaxed border border-amber-500/40 p-3">
              Admin password is not yet configured on the server. Add <code className="text-[var(--lvff-gold)]">ADMIN_PASSWORD</code> to <code className="text-[var(--lvff-gold)]">/app/backend/.env</code> and restart.
            </p>
          )}
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryLogin(pwd)}
            className="lux-input"
            placeholder="Admin Password"
            data-testid="admin-password-input"
          />
          <button onClick={() => tryLogin(pwd)} className="btn-lux btn-lux-solid justify-center" data-testid="admin-login-submit">
            Open Console
          </button>
          <a href="/" className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/45 text-center hover:text-[var(--lvff-gold)]">
            ← Back to Sanctuary
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-marble bg-noise" data-testid="admin-page">
      {/* Top bar */}
      <header className="border-b border-[var(--lvff-gold)]/20 px-6 md:px-12 py-5 flex items-center justify-between bg-[var(--lvff-bg)]/85 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 border border-[var(--lvff-gold)] flex items-center justify-center text-[var(--lvff-gold)] font-serif">
            L
          </div>
          <div>
            <div className="font-serif text-[var(--lvff-cream-soft)] text-lg leading-none">Concierge Console</div>
            <div className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)] mt-1">Lakshmi Venkateswara · Live</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/70">
            {wsState === "open" ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-amber-400" />}
            {wsState === "open" ? "Live Feed" : `WS: ${wsState}`}
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/70 hover:text-[var(--lvff-gold)]" data-testid="admin-logout">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="px-6 md:px-12 py-10 grid lg:grid-cols-2 gap-10 max-w-[1500px] mx-auto">
        {/* Orders */}
        <section data-testid="admin-orders">
          <SectionHeader icon={<ShoppingBag size={14} />} title="Orders" count={orders.length} />
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {orders.length === 0 && (
                <div className="text-sm text-[var(--lvff-cream)]/45 border border-dashed border-[var(--lvff-gold)]/25 p-6 text-center">
                  No orders yet. They will appear here in real time.
                </div>
              )}
              {orders.map((o) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="gold-frame p-5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-serif text-lg text-[var(--lvff-cream-soft)]">
                      #{o.id.slice(0, 6).toUpperCase()} · {o.customer_name}
                    </div>
                    <div className="font-serif text-lg text-[var(--lvff-gold)]">₹ {Math.round(o.total)}</div>
                  </div>
                  <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/55">
                    {o.customer_phone} · {fmtTime(o.created_at)}
                  </div>
                  <div className="text-sm text-[var(--lvff-cream)]/75 mt-1">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Reservations */}
        <section data-testid="admin-reservations">
          <SectionHeader icon={<CalendarDays size={14} />} title="Reservations" count={reservations.length} />
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {reservations.length === 0 && (
                <div className="text-sm text-[var(--lvff-cream)]/45 border border-dashed border-[var(--lvff-gold)]/25 p-6 text-center">
                  No reservations yet.
                </div>
              )}
              {reservations.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="gold-frame p-5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-serif text-lg text-[var(--lvff-cream-soft)]">
                      #{r.id.slice(0, 6).toUpperCase()} · {r.name}
                    </div>
                    <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">{r.guests} guests</div>
                  </div>
                  <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/55">
                    {r.phone} · {r.date} {r.time}
                  </div>
                  {r.occasion && (
                    <div className="text-sm text-[var(--lvff-cream)]/75 italic">{r.occasion}</div>
                  )}
                  {r.note && (
                    <div className="text-sm text-[var(--lvff-cream)]/65">Note: {r.note}</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Footer with config status */}
      <footer className="px-6 md:px-12 py-8 border-t border-[var(--lvff-gold)]/15">
        <div className="max-w-[1500px] mx-auto flex flex-wrap items-center gap-6 text-[10px] tracking-luxe uppercase">
          <Pill label="Twilio SMS" ok={config.twilio_configured} />
          <Pill label="Gmail Dispatch" ok={config.email_configured} />
          <Pill label="WebSocket" ok={wsState === "open"} />
          <span className="text-[var(--lvff-cream)]/45">Dispatch → {config.notify_email_to}</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ icon, title, count }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3 text-[var(--lvff-gold)]">
        {icon}
        <span className="text-[10px] tracking-luxe uppercase">{title}</span>
      </div>
      <span className="font-serif text-2xl text-[var(--lvff-cream-soft)]">{count}</span>
    </div>
  );
}

function Pill({ label, ok }) {
  return (
    <span
      className="flex items-center gap-2 border px-3 py-1.5"
      style={{
        borderColor: ok ? "rgba(52, 211, 153, 0.5)" : "rgba(245, 158, 11, 0.4)",
        color: ok ? "#34D399" : "#F59E0B",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? "#34D399" : "#F59E0B" }} />
      {label} {ok ? "Live" : "Not Configured"}
    </span>
  );
}

function fmtTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}
