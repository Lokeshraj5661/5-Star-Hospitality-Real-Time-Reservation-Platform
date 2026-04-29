import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const DEITY_IMG =
  "https://customer-assets.emergentagent.com/job_hospitality-gallery/artifacts/pzi1af18_Skykishrain%20-%20Lord%20Venkateswara%20swamy%20Beautiful%20imAgeS.jpg";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.1]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section
      id="hero"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-[100vh] bg-mahogany overflow-hidden flex items-center"
    >
      {/* Ambient lanterns */}
      <div className="lantern" style={{ width: 380, height: 380, background: "#D4AF37", top: "10%", left: "8%" }} />
      <div className="lantern" style={{ width: 460, height: 460, background: "#8B6F2A", bottom: "5%", right: "0%", opacity: 0.35 }} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lvff-gold)]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lvff-gold)]/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 grid lg:grid-cols-12 gap-16 items-center w-full pt-32 pb-24">
        {/* Left: Headline */}
        <motion.div
          style={{ y: titleY }}
          className="lg:col-span-6 flex flex-col gap-10"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-[10px] md:text-xs tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4"
            data-testid="hero-eyebrow"
          >
            <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" />
            Est. Pulivendula · Andhra Pradesh
          </motion.span>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-[88px] leading-[0.95] tracking-tight text-[var(--lvff-cream-soft)]"
            data-testid="hero-headline"
          >
            The{" "}
            <span className="block italic engraved">Culinary</span>{" "}
            Sanctuary.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-[var(--lvff-cream)]/70 max-w-md text-base md:text-lg leading-relaxed font-light"
            data-testid="hero-description"
          >
            A quiet ode to South Indian craft — idli steamed at dawn, dosa folded by candlelight, and thali served on
            polished mahogany. Welcome to a fast food house redrawn with the manners of a five-star lobby.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-wrap items-center gap-6"
          >
            <a href="#menu" className="btn-lux btn-lux-solid" data-testid="hero-cta-menu">Browse the Menu</a>
            <a href="#concierge" className="btn-lux" data-testid="hero-cta-concierge">Find the House</a>
          </motion.div>

          <div className="flex items-center gap-8 md:gap-10 pt-10 flex-wrap">
            <Stat value="32+" label="Signature Dishes" />
            <div className="w-[1px] h-10 bg-[var(--lvff-gold)]/40" />
            <Stat value="18yrs" label="Of Quiet Craft" />
            <div className="w-[1px] h-10 bg-[var(--lvff-gold)]/40" />
            <Stat value="06:00" label="Doors Open" />
          </div>
        </motion.div>

        {/* Right: Sacred Frame — Lord Venkateswara */}
        <motion.div
          style={{ scale, opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-6 relative flex items-center justify-center"
          data-testid="hero-deity"
        >
          {/* Decorative concentric rings around the shrine */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[520px] h-[520px] rounded-full border border-[var(--lvff-gold)]/15 slow-spin" />
            <div className="absolute w-[420px] h-[420px] rounded-full border border-[var(--lvff-gold)]/25" />
          </div>

          {/* Lantern glows behind shrine */}
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full" style={{ background: "#D4AF37", filter: "blur(60px)", opacity: 0.45 }} />
          <div className="absolute -bottom-12 -right-8 w-40 h-40 rounded-full" style={{ background: "#FF8C00", filter: "blur(80px)", opacity: 0.3 }} />

          {/* Brushed-gold shrine frame */}
          <div className="relative gold-frame w-[88%] max-w-[520px] aspect-[4/5] overflow-hidden">
            {/* Inner image */}
            <div
              className="absolute inset-0 breathe"
              style={{
                backgroundImage: `url(${DEITY_IMG})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "saturate(0.92) contrast(1.04) brightness(0.98)",
              }}
            />
            {/* Soft warm light wash to harmonise with mahogany theme */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 35%, rgba(255,180,80,0.18), transparent 60%), linear-gradient(180deg, rgba(20,16,12,0.0) 50%, rgba(14,11,8,0.55) 100%)",
              }}
            />
            {/* Inner gold rule frame */}
            <div className="absolute inset-3 border border-[var(--lvff-gold)]/35 pointer-events-none" />

            {/* Bottom plaque */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/85">
              <span>Sri Venkateswara</span>
              <span className="w-8 h-[1px] bg-[var(--lvff-gold)]" />
              <span>Tirumala</span>
            </div>
          </div>

          {/* Floor reflection */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[320px] h-[40px] rounded-[50%] bg-[var(--lvff-gold)]/20 blur-2xl" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-10 flex flex-col items-center gap-3 z-10">
        <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/50">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[var(--lvff-gold)] to-transparent" />
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="flex flex-col">
      <span className="font-serif text-2xl text-[var(--lvff-cream)]">{value}</span>
      <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/50 mt-1">{label}</span>
    </div>
  );
}
