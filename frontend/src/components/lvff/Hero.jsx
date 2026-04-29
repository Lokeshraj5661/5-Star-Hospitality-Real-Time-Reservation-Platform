import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const DEITY_IMG =
  "https://customer-assets.emergentagent.com/job_hospitality-gallery/artifacts/pzi1af18_Skykishrain%20-%20Lord%20Venkateswara%20swamy%20Beautiful%20imAgeS.jpg";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      id="hero"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-[100vh] bg-mahogany overflow-hidden flex items-center"
    >
      {/* Sacred backdrop — Lord Venkateswara, visible yet harmonised with the mahogany sanctuary */}
      <div className="absolute inset-0 pointer-events-none select-none" data-testid="hero-deity-backdrop">
        <motion.div
          style={{
            y: bgY,
            backgroundImage: `url(${DEITY_IMG})`,
            backgroundSize: "auto 110%",
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
            filter: "saturate(0.85) contrast(1.02) brightness(0.85)",
            opacity: 0.7,
          }}
          className="absolute inset-0"
        />
        {/* Warm gold tint wash to harmonise with theme */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.12), transparent 60%)",
            mixBlendMode: "overlay",
          }}
        />
        {/* Left-side mahogany fade — keeps headline crisp, lets deity breathe on the right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(14,11,8,0.95) 0%, rgba(20,16,12,0.85) 30%, rgba(20,16,12,0.35) 55%, rgba(20,16,12,0.15) 75%, rgba(20,16,12,0.35) 100%)",
          }}
        />
        {/* Top + bottom soft vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(14,11,8,0.55) 0%, transparent 25%, transparent 70%, rgba(14,11,8,0.85) 100%)",
          }}
        />
      </div>

      {/* Ambient lanterns */}
      <div className="lantern" style={{ width: 380, height: 380, background: "#D4AF37", top: "10%", left: "8%" }} />
      <div className="lantern" style={{ width: 460, height: 460, background: "#8B6F2A", bottom: "5%", right: "0%", opacity: 0.3 }} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lvff-gold)]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--lvff-gold)]/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 grid lg:grid-cols-12 gap-16 items-center w-full pt-32 pb-24">
        <motion.div
          style={{ y: titleY }}
          className="lg:col-span-7 flex flex-col gap-10"
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
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}
          >
            The{" "}
            <span className="block italic engraved">Culinary</span>{" "}
            Sanctuary.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-[var(--lvff-cream)]/80 max-w-md text-base md:text-lg leading-relaxed font-light"
            data-testid="hero-description"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
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
