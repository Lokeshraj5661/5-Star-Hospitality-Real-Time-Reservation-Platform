import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { useMotion } from "@/context/MotionContext";

const MAP_TEXTURE =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/472e8329a19012dae4b9be7ab3c6568e015c236a30a560f91a480790dc0c86ba.png";

const COORDS = { lat: 14.415586124789657, lng: 78.22485412149683 };
const ADDRESS = "RTC Bus Stand, Islampuram, Pulivendula, Andhra Pradesh 516390";
const PHONE_RAW = "+919966211944";
const PHONE_DISPLAY = "+91 99662 11944";
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${COORDS.lat},${COORDS.lng}`;

// Hours: 11:00 – 22:30 daily
const OPEN_HOUR = 11;       // 11:00
const CLOSE_HOUR = 22;      // 22:00
const CLOSE_MIN = 30;       // :30
const CLOSING_SOON_MIN = 60; // soft amber within last 60 minutes

function useLiveStatus() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const open = OPEN_HOUR * 60;
  const close = CLOSE_HOUR * 60 + CLOSE_MIN;
  const isOpen = minutesNow >= open && minutesNow < close;
  const closingSoon = isOpen && close - minutesNow <= CLOSING_SOON_MIN;
  return {
    label: !isOpen ? "Closed · Doors Open at 11:00" : closingSoon ? "Closing Soon" : "Open Now",
    tone: !isOpen ? "closed" : closingSoon ? "amber" : "green",
  };
}

export default function ConciergeMap() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-15% 0px", once: true });
  const { label, tone } = useLiveStatus();
  const { haptics } = useMotion();

  const dotColor = tone === "green" ? "#34D399" : tone === "amber" ? "#F59E0B" : "#9CA3AF";

  return (
    <section
      id="concierge"
      ref={ref}
      data-testid="concierge-section"
      className="relative py-32 md:py-44 px-6 md:px-12 lg:px-24"
    >
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-16">
        {/* Left: Suite Directory / Information Panel */}
        <div className="lg:col-span-5 flex flex-col gap-10 lg:sticky lg:top-32 self-start">
          <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4">
            <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Chapter 04 · Smart Concierge
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[var(--lvff-cream-soft)]">
            Find the <span className="italic engraved">House.</span>
          </h2>
          <p className="text-[var(--lvff-cream)]/65 max-w-md leading-relaxed">
            A short walk from the RTC Bus Stand at Islampuram. The lantern in the map below marks the door — tap the
            direction card and your concierge will guide you in.
          </p>

          {/* Live Status */}
          <div
            className="gold-frame px-6 py-5 flex items-center gap-4"
            data-testid="live-status-panel"
          >
            <span className="relative flex w-3 h-3">
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-60"
                style={{ background: dotColor }}
              />
              <span
                className="relative rounded-full w-3 h-3"
                style={{ background: dotColor, boxShadow: `0 0 14px 2px ${dotColor}` }}
              />
            </span>
            <div className="flex-1">
              <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Live Status</div>
              <div className="font-serif text-xl text-[var(--lvff-cream-soft)] mt-1" data-testid="live-status-label">
                {label}
              </div>
            </div>
            <span className="text-[9px] tracking-luxe-sm uppercase text-[var(--lvff-cream)]/50 hidden md:block">
              11:00 — 22:30 · Daily
            </span>
          </div>

          {/* Suite Directory rows */}
          <div className="flex flex-col gap-7 mt-2">
            <ConciergeRow
              icon={<MapPin size={16} />}
              label="Address"
              value={ADDRESS}
              testid="address-row"
            />
            <ConciergeRow
              icon={<Clock size={16} />}
              label="Hours"
              value="Daily · 11:00 AM — 10:30 PM"
              testid="hours-row"
            />
            <ConciergeRow
              icon={<Phone size={16} />}
              label="Concierge"
              value={
                <a
                  href={`tel:${PHONE_RAW}`}
                  onClick={() => haptics.medium()}
                  className="lux-link text-[var(--lvff-cream-soft)]"
                  data-testid="phone-call-link"
                >
                  {PHONE_DISPLAY}
                </a>
              }
              testid="phone-row"
            />
          </div>

          {/* Direction Card */}
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptics.medium()}
            className="group relative gold-frame p-6 mt-4 flex items-center gap-5 hover:translate-y-[-2px] transition-transform"
            data-testid="direction-card"
          >
            <div className="w-12 h-12 border border-[var(--lvff-gold)] flex items-center justify-center text-[var(--lvff-gold)] shrink-0">
              <Navigation size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">Direction Card</div>
              <div className="font-serif text-xl text-[var(--lvff-cream-soft)] mt-1">Open in Google Maps</div>
              <div className="text-[10px] tracking-luxe-sm uppercase text-[var(--lvff-cream)]/45 mt-1">
                {COORDS.lat.toFixed(6)}°N, {COORDS.lng.toFixed(6)}°E
              </div>
            </div>
            <span className="text-[var(--lvff-gold)] text-2xl translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Right: Tactile Map */}
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
                style={{ filter: "saturate(0.7) contrast(1.08) brightness(0.85)" }}
                draggable={false}
              />
              {/* Gold streets overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,55 Q30,40 55,52 T100,48" stroke="#D4AF37" strokeWidth="0.32" fill="none" opacity="0.7" />
                <path d="M0,30 Q40,38 70,28 T100,32" stroke="#D4AF37" strokeWidth="0.28" fill="none" opacity="0.55" />
                <path d="M55,0 Q52,30 60,55 T58,100" stroke="#D4AF37" strokeWidth="0.32" fill="none" opacity="0.65" />
                <path d="M30,0 Q35,40 28,70 T32,100" stroke="#D4AF37" strokeWidth="0.22" fill="none" opacity="0.45" />
                <path d="M70,10 Q60,40 75,60 T80,95" stroke="#D4AF37" strokeWidth="0.22" fill="none" opacity="0.4" />
              </svg>

              {/* Golden Beacon at exact coords */}
              <div className="absolute" style={{ top: "48%", left: "56%" }}>
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="beacon-ring"
                    style={{ width: 32, height: 32, top: -16, left: -16, borderColor: "#D4AF37" }}
                  />
                  <div
                    className="beacon-ring delay"
                    style={{ width: 32, height: 32, top: -16, left: -16, borderColor: "#D4AF37" }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{
                      background: "#F5D67A",
                      boxShadow:
                        "0 0 24px 6px #D4AF37, 0 0 60px 14px rgba(212,175,55,0.55), inset 0 0 6px rgba(255,255,255,0.5)",
                    }}
                  />
                  <div className="absolute left-7 -top-2 whitespace-nowrap text-[10px] tracking-luxe-sm uppercase text-[var(--lvff-cream)] bg-[var(--lvff-bg)]/85 backdrop-blur px-3 py-2 border border-[var(--lvff-gold)]/40">
                    Lakshmi Venkateswara · The House
                  </div>
                </div>
              </div>

              {/* RTC Bus Stand label nearby */}
              <div className="absolute" style={{ top: "62%", left: "30%" }}>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-[var(--lvff-gold)]" />
                  <div className="absolute left-4 -top-1 whitespace-nowrap text-[9px] tracking-luxe-sm uppercase text-[var(--lvff-cream)]/70">
                    RTC Bus Stand · Islampuram
                  </div>
                </div>
              </div>

              {/* Map vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.7)" }} />
            </div>

            <div className="flex items-center justify-between px-2 pt-3 text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/45">
              <span>{COORDS.lat.toFixed(4)}°N {COORDS.lng.toFixed(4)}°E</span>
              <span>Pulivendula · Kadapa · 516390</span>
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
