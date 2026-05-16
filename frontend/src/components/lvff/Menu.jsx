import { useEffect, useRef, useState } from "react";
import { motion, useInView, useTransform } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

const DOSA_IMG =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/c66de5f4608703aa18be858a23ab3e55f5214ddbe7aa1dc0b53867a2df38183f.png";
const IDLI_IMG =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/90ecae5b7f75b6e81bb41252c92d2dd2d40d3d5336d49e5a1b4bf115c9cc694b.png";
const THALI_IMG =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/937c3d12087057598417171b00c5a42c6e5d49d3e5b3349b3475878308e04e79.png";
// Hyper-real AI-generated assets served from /public/dishes/
const VADA_IMG = "/dishes/vada.png";
const COFFEE_IMG = "/dishes/filter_coffee.png";
const GOBI_MANCH_IMG = "/dishes/gobi_manchurian.png";
const GOBI_RICE_IMG = "/dishes/gobi_fried_rice.png";
const EGG_RICE_IMG = "/dishes/egg_fried_rice.png";
const EGG_GOBI_RICE_IMG = "/dishes/egg_gobi_fried_rice.png";
const EGG_NOODLES_IMG = "/dishes/egg_noodles.png";
const GOBI_NOODLES_IMG = "/dishes/gobi_noodles.png";

const SOUTH_INDIAN = [
  {
    id: "thali",
    name: "Lakshmi Thali",
    sanskrit: "लक्ष्मी थाली",
    desc: "A presentation of nine offerings — sambar, rasam, two curries, pickle, curd, payasam, rice and ghee.",
    price: "₹ 240",
    chef: "Chef's Selection",
    image: THALI_IMG,
    span: "lg:col-span-6 lg:row-span-2",
    height: "h-[640px]",
  },
  {
    id: "dosa",
    name: "Crystal Masala Dosa",
    sanskrit: "मसाला डोसा",
    desc: "Twenty-four-hour fermented batter, ghee-roasted to lace, folded over potato masala.",
    price: "₹ 120",
    chef: "Signature",
    image: DOSA_IMG,
    span: "lg:col-span-6",
    height: "h-[300px]",
  },
  {
    id: "idli",
    name: "Cloud Idli",
    sanskrit: "इडली",
    desc: "Steamed by sunrise, served with three chutneys — coconut, tomato-ginger, and gunpowder.",
    price: "₹ 80",
    chef: "Heritage",
    image: IDLI_IMG,
    span: "lg:col-span-3",
    height: "h-[300px]",
  },
  {
    id: "vada",
    name: "Medu Vada Royale",
    sanskrit: "मेदु वड़ा",
    desc: "Lentil doughnut, fried to a whisper, embedded with cracked pepper and curry leaf — crowned with a gold bowl of coconut chutney.",
    price: "₹ 70",
    chef: "Crisp",
    image: VADA_IMG,
    span: "lg:col-span-3",
    height: "h-[300px]",
  },
  {
    id: "pongal",
    name: "Ven Pongal",
    sanskrit: "वेन पोंगल",
    desc: "Rice and moong dal, peppered, ghee-laden — a winter morning in a brass bowl.",
    price: "₹ 110",
    chef: "Comfort",
    image: THALI_IMG,
    span: "lg:col-span-4",
    height: "h-[340px]",
  },
  {
    id: "upma",
    name: "Rava Upma",
    sanskrit: "उपमा",
    desc: "Roasted semolina, mustard seed, cashew, served with a sliver of lime.",
    price: "₹ 90",
    chef: "Daily",
    image: DOSA_IMG,
    span: "lg:col-span-4",
    height: "h-[340px]",
  },
  {
    id: "filter",
    name: "Filter Coffee",
    sanskrit: "कापी",
    desc: "Chicory-laced, frothed at altitude, poured davarah-to-tumbler in brushed brass — the closing rite.",
    price: "₹ 40",
    chef: "Eternal",
    image: COFFEE_IMG,
    span: "lg:col-span-4",
    height: "h-[340px]",
  },
];

const INDO_CHINESE = [
  {
    id: "gobi-manchurian",
    name: "Gobi Manchurian",
    sanskrit: "गोबी मंचूरियन",
    desc: "Crisped cauliflower lacquered in a glossy soy-chilli glaze, scattered with vibrant scallion ribbons.",
    price: "₹ 160",
    chef: "Wok · Signature",
    image: GOBI_MANCH_IMG,
    span: "lg:col-span-6",
    height: "h-[420px]",
  },
  {
    id: "egg-gobi-rice",
    name: "Egg & Gobi Fried Rice",
    sanskrit: "एग गोबी राइस",
    desc: "Soft yellow egg ribbons folded through wok-tossed rice with deeply caramelised gobi florets.",
    price: "₹ 180",
    chef: "Dual Texture",
    image: EGG_GOBI_RICE_IMG,
    span: "lg:col-span-6",
    height: "h-[420px]",
  },
  {
    id: "gobi-rice",
    name: "Gobi Fried Rice",
    sanskrit: "गोबी राइस",
    desc: "Ring-moulded basmati, wok-kissed amber, embedded with dark-glazed gobi and micro-diced vegetables.",
    price: "₹ 150",
    chef: "Wok",
    image: GOBI_RICE_IMG,
    span: "lg:col-span-4",
    height: "h-[360px]",
  },
  {
    id: "egg-rice",
    name: "Egg Fried Rice",
    sanskrit: "एग राइस",
    desc: "Minimalist wok-fried rice with bright yellow scrambled egg ribbons and a sheen of sesame oil.",
    price: "₹ 140",
    chef: "Wok",
    image: EGG_RICE_IMG,
    span: "lg:col-span-4",
    height: "h-[360px]",
  },
  {
    id: "egg-noodles",
    name: "Egg Hakka Noodles",
    sanskrit: "एग नूडल्स",
    desc: "Slender Hakka noodles tossed with matchstick cabbage, carrot, pepper and golden egg shreds.",
    price: "₹ 150",
    chef: "Hakka",
    image: EGG_NOODLES_IMG,
    span: "lg:col-span-4",
    height: "h-[360px]",
  },
  {
    id: "gobi-noodles",
    name: "Gobi Hakka Noodles",
    sanskrit: "गोबी नूडल्स",
    desc: "Hakka noodles woven around deeply glazed gobi florets — pale strands, dark-crimson contrast.",
    price: "₹ 160",
    chef: "Hakka · Signature",
    image: GOBI_NOODLES_IMG,
    span: "lg:col-span-6",
    height: "h-[420px]",
  },
];

export default function Menu() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-15% 0px", once: true });
  const [hovered, setHovered] = useState(null);

  // Gyroscope-driven dish tilt + dynamic shimmer
  const { tiltX, tiltY, granted, haptics } = useMotion();
  const cardRotX = useTransform(tiltY, (v) => -v * 22);
  const cardRotY = useTransform(tiltX, (v) => v * 22);
  const shimmer = useTransform(
    tiltX,
    (v) =>
      `linear-gradient(${100 + v * 60}deg, transparent 30%, rgba(212,175,55,${0.1 + Math.abs(v) * 0.18}) 50%, transparent 70%)`
  );

  // Magnetic snap haptic — tick when each card centers in viewport on mobile
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
  }, [granted, haptics]);

  return (
    <section
      id="menu"
      ref={ref}
      data-testid="menu-section"
      className="relative py-32 md:py-44 px-6 md:px-12 lg:px-24 bg-mahogany"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-20">
          <div>
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Chapter 02 · The Gallery
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-8 leading-[1.05] text-[var(--lvff-cream-soft)]">
              The <span className="italic engraved">Curated</span> Menu.
            </h2>
          </div>
          <p className="max-w-md text-[var(--lvff-cream)]/65 leading-relaxed">
            A collection arranged like a brass-framed gallery wall — each plate is its own small painting. Tilt your
            phone or hover to see the dish lean toward you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {SOUTH_INDIAN.map((d, i) => (
            <DishCard
              key={d.id}
              d={d}
              i={i}
              inView={inView}
              hovered={hovered}
              setHovered={setHovered}
              cardRotX={cardRotX}
              cardRotY={cardRotY}
              shimmer={shimmer}
              haptics={haptics}
            />
          ))}
        </div>

        {/* Indo-Chinese collection */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mt-28 mb-14">
          <div>
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[var(--lvff-gold)]" /> Collection · The Wok Room
            </span>
            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl mt-6 leading-[1.05] text-[var(--lvff-cream-soft)]">
              <span className="italic engraved">Indo-Chinese</span>, recast as fine dining.
            </h3>
          </div>
          <p className="max-w-md text-[var(--lvff-cream)]/60 leading-relaxed">
            Street-corner classics — gobi, noodles, rice — re-staged with mirror-glazes, hand-folded egg ribbons and
            architectural plating. Tilt the room: the lacquer shifts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {INDO_CHINESE.map((d, i) => (
            <DishCard
              key={d.id}
              d={d}
              i={i}
              inView={inView}
              hovered={hovered}
              setHovered={setHovered}
              cardRotX={cardRotX}
              cardRotY={cardRotY}
              shimmer={shimmer}
              haptics={haptics}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DishCard({ d, i, inView, hovered, setHovered, cardRotX, cardRotY, shimmer, haptics }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: 0.05 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseEnter={() => setHovered(d.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => haptics.light()}
      className={`gold-frame relative ${d.span} ${d.height} group overflow-hidden cursor-pointer`}
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
          />
        </motion.div>
      </motion.div>

      {/* Dynamic refractive shimmer — fixed-in-space studio light */}
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

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between gap-6 bg-gradient-to-t from-black/60 to-transparent pt-16">
        <div className="flex-1">
          <h3 className="font-serif text-2xl md:text-3xl text-[var(--lvff-cream-soft)] leading-tight">
            {d.name}
          </h3>
          <p className="mt-3 text-[var(--lvff-cream)]/65 text-sm leading-relaxed max-w-md">{d.desc}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-serif text-2xl text-[var(--lvff-gold)]">{d.price}</span>
          <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/40 mt-1">Per Plate</span>
        </div>
      </div>
    </motion.article>
  );
}
