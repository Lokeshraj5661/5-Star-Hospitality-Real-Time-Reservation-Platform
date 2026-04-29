import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const TEXTURE =
  "https://images.unsplash.com/photo-1690049104977-938673e707f7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

export default function Signature() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={ref}
      data-testid="signature-section"
      className="relative py-32 md:py-44 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      <motion.div
        style={{ y, backgroundImage: `url(${TEXTURE})`, backgroundSize: "cover" }}
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--lvff-bg)] via-transparent to-[var(--lvff-bg)] pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto text-center">
        <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center justify-center gap-4">
          <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Chapter 03 · The Signature
          <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" />
        </span>
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl mt-10 leading-[1.05] text-[var(--lvff-cream-soft)]">
          <span className="italic">"Served slow, in a town</span>
          <br /> that knows the difference."
        </h2>

        <div className="mt-16 flex flex-col items-center gap-3">
          <div className="w-16 h-[1px] bg-[var(--lvff-gold)]" />
          <span className="font-serif italic text-[var(--lvff-gold)]">— V. Subramanyam, House Patron</span>
          <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/40 mt-2">Pulivendula · 2007</span>
        </div>
      </div>
    </section>
  );
}
