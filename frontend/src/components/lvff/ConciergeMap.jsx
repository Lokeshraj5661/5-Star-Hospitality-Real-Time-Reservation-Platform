import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Phone, Clock } from "lucide-react";

const MAP_TEXTURE =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/472e8329a19012dae4b9be7ab3c6568e015c236a30a560f91a480790dc0c86ba.png";

export default function ConciergeMap() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-15% 0px", once: true });

  return (
    <section
      id="concierge"
      ref={ref}
      data-testid="concierge-section"
      className="relative py-32 md:py-44 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 flex flex-col gap-10 lg:sticky lg:top-32 self-start">
          <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4">
            <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Chapter 04 · The Concierge
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[var(--lvff-cream-soft)]">
            Find the <span className="italic engraved">House.</span>
          </h2>
          <p className="text-[var(--lvff-cream)]/65 max-w-md leading-relaxed">
            A short walk from the RTC Bus Stand — the lantern in the map below marks the door. Step in, sit down, and
            let the kitchen do the rest.
          </p>

          <div className="flex flex-col gap-7 mt-4">
            <ConciergeRow
              icon={<MapPin size={16} />}
              label="Address"
              value="Opp. RTC Bus Stand, Main Bazaar Road, Pulivendula, Kadapa Dist. — 516390"
              testid="address-row"
            />
            <ConciergeRow
              icon={<Clock size={16} />}
              label="Hours"
              value="Daily · 06:00 – 22:30 · Filter coffee from sunrise"
              testid="hours-row"
            />
            <ConciergeRow
              icon={<Phone size={16} />}
              label="Concierge"
              value="+91 98765 43210"
              testid="phone-row"
            />
          </div>

          <a
            href="https://www.google.com/maps/search/RTC+Bus+Stand+Pulivendula"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-lux self-start mt-6"
            data-testid="map-directions-cta"
          >
            Direction Card
          </a>
        </div>

        {/* Tactile Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="lg:col-span-7 relative"
          data-testid="concierge-map"
        >
          <div className="gold-frame p-3 md:p-4 marble-tile">
            <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden">
              <img
                src={MAP_TEXTURE}
                alt="Topographical map of Pulivendula"
                className="w-full h-full object-cover"
                style={{ filter: "saturate(0.85) contrast(1.05)" }}
                draggable={false}
              />
              {/* Gold streets overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,55 Q30,40 55,52 T100,48" stroke="#D4AF37" strokeWidth="0.3" fill="none" opacity="0.6" />
                <path d="M0,30 Q40,38 70,28 T100,32" stroke="#D4AF37" strokeWidth="0.25" fill="none" opacity="0.5" />
                <path d="M55,0 Q52,30 60,55 T58,100" stroke="#D4AF37" strokeWidth="0.3" fill="none" opacity="0.55" />
                <path d="M30,0 Q35,40 28,70 T32,100" stroke="#D4AF37" strokeWidth="0.2" fill="none" opacity="0.4" />
              </svg>

              {/* Beacon */}
              <div className="absolute" style={{ top: "48%", left: "56%" }}>
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div className="beacon-ring" style={{ width: 28, height: 28, top: -14, left: -14 }} />
                  <div className="beacon-ring delay" style={{ width: 28, height: 28, top: -14, left: -14 }} />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: "#FF6B00",
                      boxShadow: "0 0 24px 4px #FF6B00, 0 0 60px 12px rgba(255,107,0,0.6)",
                    }}
                  />
                  <div className="absolute left-6 -top-1 whitespace-nowrap text-[10px] tracking-luxe-sm uppercase text-[var(--lvff-cream)] bg-[var(--lvff-bg)]/80 backdrop-blur px-3 py-2 border border-[var(--lvff-gold)]/40">
                    Lakshmi Venkateswara · The House
                  </div>
                </div>
              </div>

              {/* RTC Bus Stand label */}
              <div className="absolute" style={{ top: "62%", left: "30%" }}>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[var(--lvff-gold)]" />
                  <div className="absolute left-4 -top-1 whitespace-nowrap text-[9px] tracking-luxe-sm uppercase text-[var(--lvff-cream)]/70">
                    RTC Bus Stand
                  </div>
                </div>
              </div>

              {/* Map vignette + frame ticks */}
              <div className="absolute inset-0 pointer-events-none" style={{
                boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.7)",
              }} />
            </div>

            <div className="flex items-center justify-between px-2 pt-3 text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/40">
              <span>14°25′N 78°13′E</span>
              <span>Pulivendula · Kadapa</span>
              <span>Scale 1:8000</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ConciergeRow({ icon, label, value, testid }) {
  return (
    <div className="flex gap-5" data-testid={testid}>
      <div className="w-9 h-9 border border-[var(--lvff-gold)]/40 flex items-center justify-center text-[var(--lvff-gold)] shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">{label}</div>
        <div className="text-[var(--lvff-cream-soft)] mt-1 leading-relaxed">{value}</div>
      </div>
    </div>
  );
}
