import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useTransform } from "framer-motion";
import { useMotion } from "@/context/MotionContext";
import { DISHES, CATEGORIES } from "./menuData";
import DishModal from "./DishModal";

export default function Menu() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-15% 0px", once: true });
  const [hovered, setHovered] = useState(null);
  const [active, setActive] = useState("breakfast");
  const [selected, setSelected] = useState(null);

  const { tiltX, tiltY, granted, haptics } = useMotion();
  const cardRotX = useTransform(tiltY, (v) => -v * 18);
  const cardRotY = useTransform(tiltX, (v) => v * 18);
  const shimmer = useTransform(
    tiltX,
    (v) =>
      `linear-gradient(${100 + v * 60}deg, transparent 30%, rgba(212,175,55,${0.1 + Math.abs(v) * 0.18}) 50%, transparent 70%)`
  );

  const filtered = useMemo(() => DISHES.filter((d) => d.category === active), [active]);

  // Magnetic snap haptic — tick when a card centers in viewport (mobile, post-permission)
  useEffect(() => {
    if (!granted) return;
    const triggered = new Set();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = e.target.getAttribute("data-testid");
          if (e.isIntersecting && e.intersectionRatio >= 0.7) {
            if (!triggered.has(id)) {
              triggered.add(id);
              haptics.tick();
            }
          } else if (e.intersectionRatio < 0.4) {
            triggered.delete(id);
          }
        });
      },
      { threshold: [0.4, 0.7] }
    );
    document
      .querySelectorAll('[data-testid^="menu-item-"]')
      .forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [granted, haptics, active]);

  const onSelectCategory = (id) => {
    haptics.tick();
    setActive(id);
  };

  return (
    <section
      id="menu"
      ref={ref}
      data-testid="menu-section"
      className="relative py-32 md:py-44 px-6 md:px-12 lg:px-24 bg-mahogany"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-12">
          <div>
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Chapter 02 · The Gallery
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-8 leading-[1.05] text-[var(--lvff-cream-soft)]">
              The <span className="italic engraved">Curated</span> Menu.
            </h2>
          </div>
          <p className="max-w-md text-[var(--lvff-cream)]/65 leading-relaxed">
            A brass-framed gallery of eight chapters. Tap a plate to step inside its sanctuary — tilt to make it
            shimmer.
          </p>
        </div>

        {/* Category selector */}
        <div className="scroll-x flex items-center gap-2 md:gap-3 overflow-x-auto pb-6 mb-12 border-b border-[var(--lvff-gold)]/15">
          {CATEGORIES.map((c) => {
            const isActive = c.id === active;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                data-testid={`category-${c.id}`}
                className={`relative shrink-0 px-5 md:px-7 py-3 text-[10px] tracking-luxe uppercase transition-colors ${
                  isActive ? "text-[var(--lvff-bg)]" : "text-[var(--lvff-cream)]/70 hover:text-[var(--lvff-gold)]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 bg-[var(--lvff-gold)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bento grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6"
          >
            {filtered.map((d, i) => {
              const span = bentoSpan(i, filtered.length);
              return (
                <DishCard
                  key={d.id}
                  d={d}
                  i={i}
                  span={span}
                  inView={inView}
                  hovered={hovered}
                  setHovered={setHovered}
                  cardRotX={cardRotX}
                  cardRotY={cardRotY}
                  shimmer={shimmer}
                  onSelect={() => {
                    haptics.light();
                    setSelected(d);
                  }}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Deep-dive modal */}
      <AnimatePresence>
        {selected && <DishModal dish={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

// Asymmetric bento spans — first item large hero
function bentoSpan(i, total) {
  if (total === 1) return "lg:col-span-12 h-[520px]";
  if (total === 2) return `lg:col-span-6 h-[480px]`;
  if (i === 0) return "lg:col-span-7 h-[520px]";
  if (i === 1) return "lg:col-span-5 h-[520px]";
  if (i % 3 === 0) return "lg:col-span-4 h-[360px]";
  if (i % 3 === 1) return "lg:col-span-4 h-[360px]";
  return "lg:col-span-4 h-[360px]";
}

function DishCard({ d, i, span, inView, hovered, setHovered, cardRotX, cardRotY, shimmer, onSelect }) {
  return (
    <motion.article
      layoutId={`dish-card-${d.id}`}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: 0.05 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseEnter={() => setHovered(d.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={onSelect}
      className={`gold-frame relative ${span} group overflow-hidden cursor-pointer`}
      data-testid={`menu-item-${d.id}`}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateX: cardRotX, rotateY: cardRotY, transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{
            rotateX: hovered === d.id ? -6 : 0,
            rotateY: hovered === d.id ? 6 : 0,
            scale: hovered === d.id ? 1.06 : 1,
          }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <img
            src={d.image}
            alt={d.name}
            className="w-[88%] h-[88%] object-contain pointer-events-none select-none"
            draggable={false}
            loading="lazy"
          />
        </motion.div>
      </motion.div>

      {/* Dynamic refractive shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: shimmer, mixBlendMode: "screen" }}
      />

      {/* Hover bronze wash */}
      <div
        className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.18), transparent 65%)",
          opacity: hovered === d.id ? 1 : 0,
        }}
      />

      {/* Card chrome */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-8 flex items-start justify-between">
        <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">{d.chef}</span>
        <span className="font-serif text-[var(--lvff-cream)]/40 text-sm">{d.sanskrit}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between gap-6 bg-gradient-to-t from-black/70 to-transparent pt-20">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-2xl md:text-3xl text-[var(--lvff-cream-soft)] leading-tight truncate">
            {d.name}
          </h3>
          <p className="mt-2 text-[var(--lvff-cream)]/65 text-sm leading-relaxed max-w-md line-clamp-2">
            {d.desc}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-serif text-2xl text-[var(--lvff-gold)]">₹ {d.price}</span>
          <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/40 mt-1">Per Plate</span>
        </div>
      </div>
    </motion.article>
  );
}
