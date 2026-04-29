import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const DOSA_IMG =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/c66de5f4608703aa18be858a23ab3e55f5214ddbe7aa1dc0b53867a2df38183f.png";
const IDLI_IMG =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/90ecae5b7f75b6e81bb41252c92d2dd2d40d3d5336d49e5a1b4bf115c9cc694b.png";
const THALI_IMG =
  "https://static.prod-images.emergentagent.com/jobs/d80f9170-c393-4bd3-9ab1-5c075724dd15/images/937c3d12087057598417171b00c5a42c6e5d49d3e5b3349b3475878308e04e79.png";

const DISHES = [
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
    desc: "Lentil doughnut, fried to a whisper, crowned with curry leaf and black pepper.",
    price: "₹ 70",
    chef: "Crisp",
    image: IDLI_IMG,
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
    desc: "Chicory-laced, frothed at altitude, poured davarah-to-tumbler. The closing rite.",
    price: "₹ 40",
    chef: "Eternal",
    image: IDLI_IMG,
    span: "lg:col-span-4",
    height: "h-[340px]",
  },
];

export default function Menu() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-15% 0px", once: true });
  const [hovered, setHovered] = useState(null);

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
            A collection arranged like a brass-framed gallery wall — each plate is its own small painting. Hover to see
            the dish lean toward you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {DISHES.map((d, i) => (
            <motion.article
              key={d.id}
              initial={{ opacity: 0, y: 60 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.05 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              onMouseEnter={() => setHovered(d.id)}
              onMouseLeave={() => setHovered(null)}
              className={`gold-frame relative ${d.span} ${d.height} group overflow-hidden cursor-pointer`}
              data-testid={`menu-item-${d.id}`}
              style={{ perspective: "1200px" }}
            >
              {/* Image */}
              <motion.div
                animate={{
                  rotateX: hovered === d.id ? -8 : 0,
                  rotateY: hovered === d.id ? 8 : 0,
                  scale: hovered === d.id ? 1.06 : 1,
                }}
                transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="w-[80%] h-[80%] object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </motion.div>

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
                <div>
                  <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-gold)]">{d.chef}</span>
                </div>
                <span className="font-serif text-[var(--lvff-cream)]/40 text-sm">{d.sanskrit}</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between gap-6">
                <div className="flex-1">
                  <h3 className="font-serif text-2xl md:text-3xl text-[var(--lvff-cream-soft)] leading-tight">
                    {d.name}
                  </h3>
                  <p className="mt-3 text-[var(--lvff-cream)]/60 text-sm leading-relaxed max-w-md">{d.desc}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-serif text-2xl text-[var(--lvff-gold)]">{d.price}</span>
                  <span className="text-[9px] tracking-luxe uppercase text-[var(--lvff-cream)]/40 mt-1">Per Plate</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
