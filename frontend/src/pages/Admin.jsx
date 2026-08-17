import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import {
  ShoppingBag,
  CalendarDays,
  Wifi,
  WifiOff,
  LogOut,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getToken, clearToken, authHeaders } from "@/lib/adminAuth";

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

const COL = {
  pending: { key: "pending", label: "Incoming", accent: "#F59E0B" },
  confirmed: { key: "confirmed", label: "Confirmed", accent: "#34D399" },
  cancelled: { key: "cancelled", label: "Cancelled", accent: "#9CA3AF" },
};

export default function Admin() {
  const nav = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [config, setConfig] = useState({});
  const [wsState, setWsState] = useState("idle");
  const [pipe, setPipe] = useState("reservations");
  const wsRef = useRef(null);

  const logout = useCallback(() => {
    clearToken();
    wsRef.current?.close();
    nav("/admin/portal", { replace: true });
  }, [nav]);

  // Boot: verify token or redirect
  useEffect(() => {
    if (!getToken()) {
      nav("/admin/portal", { replace: true });
      return;
    }
    axios.get(`${API}/admin/auth/me`, { headers: authHeaders() }).catch(() => logout());
    axios.get(`${API}/admin/config`).then((r) => setConfig(r.data)).catch(() => {});
  }, [nav, logout]);

  const refreshAll = useCallback(async () => {
    try {
      const [r, o, a] = await Promise.all([
        axios.get(`${API}/reservations`, { headers: authHeaders() }),
        axios.get(`${API}/orders`, { headers: authHeaders() }),
        axios.get(`${API}/admin/analytics`, { headers: authHeaders() }),
      ]);
      setReservations(r.data);
      setOrders(o.data);
      setAnalytics(a.data);
    } catch (e) {
      if (e.response?.status === 401) logout();
    }
  }, [logout]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // WebSocket
  useEffect(() => {
    if (!getToken() || !WS_URL) return;
    setWsState("connecting");
    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(getToken())}`);
    wsRef.current = ws;
    ws.onopen = () => setWsState("open");
    ws.onclose = () => setWsState("closed");
    ws.onerror = () => setWsState("error");
    ws.onmessage = (evt) => {
      try {
        const m = JSON.parse(evt.data);
        if (m.type === "order.created") {
          setOrders((prev) => [m.data, ...prev.filter((x) => x.id !== m.data.id)]);
          toast.success(`New order · ${m.data.customer_name}`);
          refreshAll();
        } else if (m.type === "order.updated") {
          setOrders((prev) => prev.map((x) => (x.id === m.data.id ? m.data : x)));
          refreshAll();
        } else if (m.type === "reservation.created") {
          setReservations((prev) => [m.data, ...prev.filter((x) => x.id !== m.data.id)]);
          toast.success(`New reservation · ${m.data.name}`);
          refreshAll();
        } else if (m.type === "reservation.updated") {
          setReservations((prev) => prev.map((x) => (x.id === m.data.id ? m.data : x)));
          refreshAll();
        }
      } catch {
        /* ignore */
      }
    };
    return () => ws.close();
  }, [refreshAll]);

  const updateStatus = async (kind, id, statusKey) => {
    try {
      const url = kind === "reservation" ? `${API}/reservations/${id}` : `${API}/orders/${id}`;
      const { data } = await axios.patch(url, { status: statusKey }, { headers: authHeaders() });
      if (kind === "reservation") {
        setReservations((prev) => prev.map((r) => (r.id === id ? data : r)));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      }
      toast.success(`${kind === "reservation" ? "Reservation" : "Order"} · ${statusKey.toUpperCase()}`);
      refreshAll();
    } catch (e) {
      toast.error(`Could not update. ${e.response?.data?.detail || ""}`);
    }
  };

  const kanban = useMemo(() => {
    const src = pipe === "reservations" ? reservations : orders;
    const byStatus = { pending: [], confirmed: [], cancelled: [] };
    src.forEach((x) => byStatus[x.status || "pending"].push(x));
    return byStatus;
  }, [pipe, reservations, orders]);

  return (
    <div className="min-h-screen bg-marble bg-noise" data-testid="admin-dashboard">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--lvff-gold)]/20 px-6 md:px-10 py-4 flex items-center justify-between bg-[var(--lvff-bg)]/90 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[var(--lvff-gold)] flex items-center justify-center text-[var(--lvff-gold)] font-serif">
            L
          </div>
          <div>
            <div className="font-serif text-[var(--lvff-cream-soft)] text-lg leading-none">Concierge Console</div>
            <div className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)] mt-1">
              Lakshmi Venkateswara · Live
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/70">
            {wsState === "open" ? (
              <><Wifi size={14} className="text-emerald-400" /> Live</>
            ) : (
              <><WifiOff size={14} className="text-amber-400" /> {wsState}</>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/70 hover:text-[var(--lvff-gold)]"
            data-testid="admin-logout"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto flex flex-col gap-8">
        {/* Analytics banner */}
        <Analytics data={analytics} />

        {/* Pipeline toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Pipeline</span>
            <div className="flex bg-[var(--lvff-bg)]/70 border border-[var(--lvff-gold)]/25">
              {[
                { id: "reservations", label: "Reservations", icon: <CalendarDays size={12} /> },
                { id: "orders", label: "Orders", icon: <ShoppingBag size={12} /> },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPipe(p.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-[10px] tracking-luxe uppercase transition-colors ${
                    pipe === p.id ? "text-[var(--lvff-bg)]" : "text-[var(--lvff-cream)]/70 hover:text-[var(--lvff-gold)]"
                  }`}
                  data-testid={`pipe-toggle-${p.id}`}
                >
                  {pipe === p.id && (
                    <motion.span
                      layoutId="pipe-pill"
                      className="absolute inset-0 bg-[var(--lvff-gold)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">{p.icon}{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/50">
            <Phone size={11} className="text-[var(--lvff-gold)]" />
            <a href="tel:+919966211944" className="hover:text-[var(--lvff-gold)]">+91 99662 11944</a>
            <span className="w-1 h-1 rounded-full bg-[var(--lvff-gold)]/40" />
            <MapPin size={11} className="text-[var(--lvff-gold)]" />
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=14.415586124789657,78.22485412149683"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--lvff-gold)]"
            >
              RTC Bus Stand · Pulivendula
            </a>
            <span className="w-1 h-1 rounded-full bg-[var(--lvff-gold)]/40" />
            <Clock size={11} className="text-[var(--lvff-gold)]" />
            11:00 — 22:30
          </div>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="admin-kanban">
          {["pending", "confirmed", "cancelled"].map((k) => (
            <Column
              key={k}
              spec={COL[k]}
              items={kanban[k]}
              kind={pipe === "reservations" ? "reservation" : "order"}
              onUpdate={updateStatus}
            />
          ))}
        </div>

        {/* Bottom status bar */}
        <div className="border-t border-[var(--lvff-gold)]/15 pt-5 flex flex-wrap items-center gap-6 text-[10px] tracking-luxe uppercase">
          <ChipStatus label="Twilio SMS" ok={config.twilio_configured} />
          <ChipStatus label="Gmail Dispatch" ok={config.email_configured} />
          <ChipStatus label="WebSocket" ok={wsState === "open"} />
          <span className="text-[var(--lvff-cream)]/45">Dispatch → {config.notify_email_to}</span>
        </div>
      </div>
    </div>
  );
}

// ============ Analytics Banner ============
function Analytics({ data }) {
  const today = data?.today || { revenue: 0, orders: 0, confirmed_orders: 0 };
  const trend = data?.trend_14d || [];
  const orderMix = data?.orders || { pending: 0, confirmed: 0, cancelled: 0 };
  const resMix = data?.reservations || { pending: 0, confirmed: 0, cancelled: 0 };

  const totalConf = orderMix.confirmed + resMix.confirmed;
  const totalCanc = orderMix.cancelled + resMix.cancelled;
  const pie = [
    { name: "Confirmed", value: totalConf, fill: "#34D399" },
    { name: "Cancelled", value: totalCanc, fill: "#9CA3AF" },
  ];

  const weekRevenue = trend.slice(-7).reduce((s, d) => s + (d.revenue || 0), 0);
  const monthRevenue = trend.reduce((s, d) => s + (d.revenue || 0), 0);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4" data-testid="analytics-banner">
      <Metric span="lg:col-span-3" label="Today's Revenue" value={`₹ ${Math.round(today.revenue).toLocaleString("en-IN")}`}
        sub={`${today.confirmed_orders} confirmed · ${today.orders} total`} icon={<IndianRupee size={14} />} />
      <Metric span="lg:col-span-3" label="7-Day Revenue" value={`₹ ${Math.round(weekRevenue).toLocaleString("en-IN")}`}
        sub="Rolling week" icon={<TrendingUp size={14} />} />
      <Metric span="lg:col-span-3" label="Completion" value={`${data?.completion_rate ?? 0}%`}
        sub={`${totalConf} confirmed · ${totalCanc} cancelled`} icon={<CheckCircle2 size={14} />} />
      <Metric span="lg:col-span-3" label="Cancellation" value={`${data?.cancellation_rate ?? 0}%`}
        sub="Aim to keep below 15%" icon={<XCircle size={14} />} />

      {/* Line chart */}
      <div className="lg:col-span-8 gold-frame p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">14-Day Revenue Trend</div>
            <div className="font-serif text-2xl text-[var(--lvff-cream-soft)] mt-1">₹ {Math.round(monthRevenue).toLocaleString("en-IN")}</div>
          </div>
          <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/45">Confirmed orders only</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#D4AF3720" strokeDasharray="2 5" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#F9F5F080", fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)}
                stroke="#D4AF3730" />
              <YAxis tick={{ fill: "#F9F5F080", fontSize: 10 }} stroke="#D4AF3730" />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #D4AF3760", borderRadius: 0, fontFamily: "Manrope" }}
                labelStyle={{ color: "#F5F5DC", fontFamily: "Cormorant Garamond, serif" }}
                itemStyle={{ color: "#D4AF37" }}
                formatter={(v) => [`₹ ${v}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2}
                dot={{ r: 3, fill: "#D4AF37", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#F5F5DC", stroke: "#D4AF37", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie */}
      <div className="lg:col-span-4 gold-frame p-5 md:p-6 flex flex-col">
        <div className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">Completed vs Cancelled</div>
        <div className="flex-1 flex items-center justify-center h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                {pie.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #D4AF3760", borderRadius: 0 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[10px] tracking-luxe uppercase mt-2">
          <span className="text-emerald-400">● Confirmed {totalConf}</span>
          <span className="text-[var(--lvff-cream)]/50">● Cancelled {totalCanc}</span>
        </div>
      </div>
    </section>
  );
}

function Metric({ span, label, value, sub, icon }) {
  return (
    <div className={`gold-frame p-5 md:p-6 flex flex-col gap-2 ${span}`}>
      <div className="flex items-center gap-2 text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">
        {icon} {label}
      </div>
      <div className="font-serif text-3xl md:text-4xl text-[var(--lvff-cream-soft)] leading-none">{value}</div>
      <div className="text-[10px] tracking-luxe-sm uppercase text-[var(--lvff-cream)]/45">{sub}</div>
    </div>
  );
}

// ============ Kanban Column ============
function Column({ spec, items, kind, onUpdate }) {
  return (
    <div className="flex flex-col gap-3" data-testid={`column-${spec.key}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: spec.accent }} />
          <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/80">{spec.label}</span>
        </div>
        <span className="font-serif text-xl text-[var(--lvff-cream-soft)]">{items.length}</span>
      </div>

      {items.length === 0 && (
        <div className="text-[11px] tracking-luxe-sm uppercase text-[var(--lvff-cream)]/35 border border-dashed border-[var(--lvff-gold)]/20 p-6 text-center">
          None
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {items.map((it) => (
          <motion.div
            key={it.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="gold-frame p-5 flex flex-col gap-3"
            data-testid={`${kind}-card-${it.id.slice(0, 6)}`}
          >
            {kind === "reservation" ? (
              <ReservationBody it={it} />
            ) : (
              <OrderBody it={it} />
            )}
            <StatusActions currentStatus={it.status} onUpdate={(next) => onUpdate(kind, it.id, next)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ReservationBody({ it }) {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <div className="font-serif text-lg text-[var(--lvff-cream-soft)]">
          #{it.id.slice(0, 6).toUpperCase()} · {it.name}
        </div>
        <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">{it.guests} guests</span>
      </div>
      <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/55">
        {it.phone} · {it.date} {it.time}
      </div>
      {it.occasion && <div className="text-sm text-[var(--lvff-cream)]/70 italic">{it.occasion}</div>}
      {it.note && <div className="text-sm text-[var(--lvff-cream)]/60">Note: {it.note}</div>}
    </>
  );
}

function OrderBody({ it }) {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <div className="font-serif text-lg text-[var(--lvff-cream-soft)]">
          #{it.id.slice(0, 6).toUpperCase()} · {it.customer_name}
        </div>
        <span className="font-serif text-xl text-[var(--lvff-gold)]">₹ {Math.round(it.total)}</span>
      </div>
      <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/55">{it.customer_phone}</div>
      <div className="text-sm text-[var(--lvff-cream)]/75">
        {it.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
      </div>
    </>
  );
}

function StatusActions({ currentStatus, onUpdate }) {
  return (
    <div className="flex gap-2 mt-1">
      {currentStatus !== "confirmed" && (
        <button
          onClick={() => onUpdate("confirmed")}
          className="flex-1 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-400 hover:text-[var(--lvff-bg)] transition-colors py-2 text-[10px] tracking-luxe uppercase flex items-center justify-center gap-1"
          data-testid="btn-confirm"
        >
          <CheckCircle2 size={12} /> Confirm
        </button>
      )}
      {currentStatus !== "cancelled" && (
        <button
          onClick={() => onUpdate("cancelled")}
          className="flex-1 border border-[var(--lvff-cream)]/30 text-[var(--lvff-cream)]/70 hover:bg-[var(--lvff-cream)]/85 hover:text-[var(--lvff-bg)] transition-colors py-2 text-[10px] tracking-luxe uppercase flex items-center justify-center gap-1"
          data-testid="btn-cancel"
        >
          <XCircle size={12} /> Cancel
        </button>
      )}
      {currentStatus !== "pending" && (
        <button
          onClick={() => onUpdate("pending")}
          className="border border-amber-400/50 text-amber-300 hover:bg-amber-400 hover:text-[var(--lvff-bg)] transition-colors px-3 py-2 text-[10px] tracking-luxe uppercase flex items-center gap-1"
          data-testid="btn-reset-pending"
          title="Move back to Incoming"
        >
          <Clock size={12} />
        </button>
      )}
    </div>
  );
}

function ChipStatus({ label, ok }) {
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
