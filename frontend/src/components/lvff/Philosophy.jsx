import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PILLARS = [
  {
    no: "I",
    title: "The Hand",
    body: "Every dosa is poured by hand on cast iron seasoned over two decades. No machines, no shortcuts.",
  },
  {
    no: "II",
    title: "The Hour",
    body: "Idli batter rests through the night. Sambar simmers from 4am. Time is the most expensive ingredient.",
  },
  {
    no: "III",
    title: "The House",
    body: "A serene room of brushed gold and mahogany — a five-star calm for a four-rupee filter coffee.",
  },
];

export default function Philosophy() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-20% 0px" });

  return (
    <section
      id="philosophy"
      ref={ref}
      data-testid="philosophy-section"
      className="relative py-32 md:py-44 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-16 items-end mb-24">
          <div className="lg:col-span-5">
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Chapter 01 · The Philosophy
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-8 leading-[1.05] text-[var(--lvff-cream-soft)]">
              An ode to the <span className="italic engraved">unhurried</span> meal.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 text-[var(--lvff-cream)]/70 text-base md:text-lg leading-relaxed font-light">
            We are a fast-food house only by the speed of welcome. The kitchen runs on the rhythm of grandmothers —
            patient, exacting, devoted to the small ceremony of a banana-leaf service. This is not a restaurant. It is a
            sanctuary stitched into the fabric of Pulivendula.
          </div>
        </div>

        <div className="gold-rule mb-20" />

        <div className="grid md:grid-cols-3 gap-px bg-[var(--lvff-gold)]/15">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.no}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              className="bg-[var(--lvff-bg)] p-10 md:p-14 flex flex-col gap-8"
              data-testid={`philosophy-pillar-${i}`}
            >
              <span className="font-serif italic text-[var(--lvff-gold)] text-3xl">{p.no}</span>
              <h3 className="font-serif text-3xl text-[var(--lvff-cream-soft)]">{p.title}</h3>
              <p className="text-[var(--lvff-cream)]/65 leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
