import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const initial = { name: "", phone: "", date: "", time: "19:30", guests: 2, occasion: "", note: "" };

export default function Reservation() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const { haptics } = useMotion();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.name && !form.name) {
      setForm((f) => ({ ...f, name: user.name }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) {
      haptics.light();
      toast.error("Please complete name, phone, and date.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/reservations`, {
        ...form,
        guests: Number(form.guests) || 2,
      });
      haptics.success();
      toast.success(`Table secured · Reservation #${data.id.slice(0, 6).toUpperCase()}`);
      setForm(initial);
    } catch (err) {
      haptics.light();
      toast.error("The concierge could not be reached. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="reservation"
      data-testid="reservation-section"
      className="relative py-32 md:py-44 px-6 md:px-12 lg:px-24 bg-mahogany"
    >
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4">
            <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Chapter 05 · The Reservation
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-8 leading-[1.05] text-[var(--lvff-cream-soft)]">
            Secure a <span className="italic engraved">Quiet</span> Seat.
          </h2>
          <p className="text-[var(--lvff-cream)]/65 max-w-md leading-relaxed mt-8">
            We hold a small set of corner tables for guests who write ahead. Tell us the hour and we&apos;ll prepare a place
            with banana leaf, brass davarah, and warm-pressed napkins.
          </p>

          <div className="mt-12 gold-rule" />
          <div className="mt-10 grid grid-cols-2 gap-8">
            <Detail label="Service" value="11:00 — 22:30" />
            <Detail label="Closed" value="Never" />
            <Detail label="Dress" value="As you are" />
            <Detail label="Children" value="Most welcome" />
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          onSubmit={submit}
          className="lg:col-span-7 gold-frame p-8 md:p-12 flex flex-col gap-8"
          data-testid="reservation-form"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <Field label="Full Name">
              <input
                value={form.name}
                onChange={update("name")}
                className="lux-input"
                placeholder="Enter your name"
                data-testid="reservation-input-name"
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={update("phone")}
                className="lux-input"
                placeholder="+91"
                data-testid="reservation-input-phone"
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={update("date")}
                className="lux-input"
                data-testid="reservation-input-date"
              />
            </Field>
            <Field label="Time">
              <input
                type="time"
                value={form.time}
                onChange={update("time")}
                className="lux-input"
                data-testid="reservation-input-time"
              />
            </Field>
            <Field label="Guests">
              <input
                type="number"
                min="1"
                max="20"
                value={form.guests}
                onChange={update("guests")}
                className="lux-input"
                data-testid="reservation-input-guests"
              />
            </Field>
            <Field label="Occasion">
              <input
                value={form.occasion}
                onChange={update("occasion")}
                className="lux-input"
                placeholder="Birthday · Anniversary · None"
                data-testid="reservation-input-occasion"
              />
            </Field>
          </div>

          <Field label="Note to the Kitchen">
            <textarea
              rows={3}
              value={form.note}
              onChange={update("note")}
              className="lux-input resize-none"
              placeholder="Spice level · Allergies · Preferred table"
              data-testid="reservation-input-note"
            />
          </Field>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/45">
              We confirm by phone within 30 minutes
            </span>
            <button
              type="submit"
              disabled={loading}
              className="btn-lux btn-lux-solid"
              data-testid="reservation-submit"
            >
              {loading ? "Sending…" : "Reserve the Table"}
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">{label}</div>
      <div className="font-serif text-xl text-[var(--lvff-cream-soft)] mt-1">{value}</div>
    </div>
  );
}
