import { AnimatePresence, motion, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useMotion } from "@/context/MotionContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DishModal({ dish, onClose }) {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const { tiltX, tiltY, haptics } = useMotion();

  // Gyro + drag rotate for the 3D stage
  const [dragRot, setDragRot] = useState({ x: 0, y: 0 });
  const tiltRotX = useTransform(tiltY, (v) => -v * 28 + dragRot.x);
  const tiltRotY = useTransform(tiltX, (v) => v * 28 + dragRot.y);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const dec = () => {
    if (qty > 1) {
      haptics.tick();
      setQty(qty - 1);
    }
  };
  const inc = () => {
    haptics.tick();
    setQty(qty + 1);
  };

  const addToOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      haptics.light();
      toast.error("Name and phone are required.");
      return;
    }
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/orders`, {
        customer_name: name,
        customer_phone: phone,
        items: [{ id: dish.id, name: dish.name, price: dish.price, qty }],
        total: dish.price * qty,
      });
      haptics.success();
      toast.success(`Order placed · #${data.id.slice(0, 6).toUpperCase()} — table ready soon.`);
      onClose();
    } catch (e) {
      haptics.light();
      toast.error("The kitchen could not be reached. Please retry.");
    } finally {
      setSending(false);
    }
  };

  if (!dish) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[90] bg-black/82 backdrop-blur-xl"
        onClick={onClose}
        data-testid="dish-modal"
      >
        {/* Close */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            haptics.light();
            onClose();
          }}
          className="absolute top-6 right-6 z-10 w-12 h-12 border border-[var(--lvff-gold)]/60 text-[var(--lvff-gold)] flex items-center justify-center hover:bg-[var(--lvff-gold)] hover:text-[var(--lvff-bg)] transition-colors"
          data-testid="dish-modal-close"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <motion.div
          layoutId={`dish-card-${dish.id}`}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 top-0 bottom-0 m-auto max-w-[1500px] grid lg:grid-cols-12 gap-0 lg:gap-10 bg-mahogany overflow-hidden"
          style={{ maxHeight: "100vh" }}
        >
          {/* Interactive 3D Stage */}
          <div className="lg:col-span-7 relative min-h-[55vh] lg:min-h-[100vh] flex items-center justify-center overflow-hidden">
            <div className="lantern" style={{ width: 380, height: 380, background: "#D4AF37", top: "10%", left: "10%" }} />
            <div className="lantern" style={{ width: 460, height: 460, background: "#8B6F2A", bottom: "0%", right: "0%", opacity: 0.35 }} />

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                rotateX: tiltRotX,
                rotateY: tiltRotY,
                transformStyle: "preserve-3d",
                perspective: 1400,
              }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={1}
              onDrag={(_, info) =>
                setDragRot({ x: -info.offset.y * 0.2, y: info.offset.x * 0.2 })
              }
              onDragEnd={() => setDragRot({ x: 0, y: 0 })}
            >
              <motion.img
                src={dish.image}
                alt={dish.name}
                className="w-[78%] h-[78%] object-contain select-none cursor-grab active:cursor-grabbing"
                draggable={false}
                animate={{
                  scale: [1, 1.02, 1],
                  rotate: [0, 1.2, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 60px rgba(212,175,55,0.2))" }}
              />
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/50">
              Drag · Tilt to rotate
            </div>
          </div>

          {/* Premium Info Panel */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-5 p-8 md:p-14 flex flex-col gap-6 overflow-y-auto bg-[var(--lvff-bg)]/96 border-l border-[var(--lvff-gold)]/15"
          >
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">{dish.chef}</span>
              <span className="w-8 h-[1px] bg-[var(--lvff-gold)]/40" />
              <span className="font-serif italic text-[var(--lvff-cream)]/50">{dish.sanskrit}</span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl text-[var(--lvff-cream-soft)] leading-[1.05]" data-testid="dish-modal-name">
              {dish.name}
            </h2>

            {dish.tags && (
              <div className="flex flex-wrap gap-2">
                {dish.tags.map((t) => (
                  <span key={t} className="text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/65 border border-[var(--lvff-gold)]/30 px-3 py-1">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[var(--lvff-cream)]/70 leading-relaxed">{dish.desc}</p>

            <div className="gold-rule my-2" />

            {/* Qty */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Quantity</span>
              <div className="flex items-center gap-4 border border-[var(--lvff-gold)]/40">
                <button onClick={dec} className="w-10 h-10 flex items-center justify-center text-[var(--lvff-cream)] hover:text-[var(--lvff-gold)] transition-colors" data-testid="dish-modal-qty-decrement">
                  <Minus size={14} />
                </button>
                <span className="font-serif text-xl text-[var(--lvff-cream-soft)] w-8 text-center" data-testid="dish-modal-qty">{qty}</span>
                <button onClick={inc} className="w-10 h-10 flex items-center justify-center text-[var(--lvff-cream)] hover:text-[var(--lvff-gold)] transition-colors" data-testid="dish-modal-qty-increment">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Total</div>
                <div className="font-serif text-4xl text-[var(--lvff-cream-soft)] mt-1">₹ {dish.price * qty}</div>
              </div>
              <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/40">
                ₹ {dish.price} / plate
              </div>
            </div>

            {/* Guest details */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <label className="flex flex-col gap-2">
                <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">Your Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="lux-input" placeholder="Full Name" data-testid="dish-modal-name-input" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="lux-input" placeholder="+91" data-testid="dish-modal-phone-input" />
              </label>
            </div>

            <button
              onClick={addToOrder}
              disabled={sending}
              className="btn-lux btn-lux-solid justify-center mt-4 disabled:opacity-60"
              data-testid="dish-modal-add-to-order"
            >
              <ShoppingBag size={14} />
              {sending ? "Sending to Kitchen…" : "Add to Order"}
            </button>

            <p className="text-[10px] tracking-luxe-sm uppercase text-[var(--lvff-cream)]/40 text-center mt-2">
              Confirmation in 30 minutes · No payment online
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
