export default function Footer() {
  return (
    <footer data-testid="footer" className="relative px-6 md:px-12 lg:px-24 pt-24 pb-12 border-t border-[var(--lvff-gold)]/15">
      <div className="max-w-[1600px] mx-auto grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-[var(--lvff-gold)] shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              <img
                src="https://customer-assets.emergentagent.com/job_hospitality-gallery/artifacts/pzi1af18_Skykishrain%20-%20Lord%20Venkateswara%20swamy%20Beautiful%20imAgeS.jpg"
                alt="Sri Venkateswara"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 28%" }}
                draggable={false}
              />
            </div>
            <div className="leading-none">
              <div className="font-serif text-xl text-[var(--lvff-cream-soft)]">Lakshmi Venkateswara</div>
              <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] mt-1">Fast Foods · The Culinary Sanctuary</div>
            </div>
          </div>
          <p className="text-[var(--lvff-cream)]/55 leading-relaxed mt-8 max-w-sm">
            A small house of South Indian craft, serving Pulivendula since 2007. Welcoming guests with warm lanterns and
            warmer plates.
          </p>
        </div>

        <FooterCol
          title="The House"
          items={[
            { label: "Sanctuary", href: "#hero" },
            { label: "Philosophy", href: "#philosophy" },
            { label: "Gallery", href: "#menu" },
            { label: "Concierge", href: "#concierge" },
          ]}
        />
        <FooterCol
          title="Visit"
          items={[
            { label: "RTC Bus Stand, Islampuram" },
            { label: "Pulivendula, AP — 516390" },
            { label: "11:00 AM — 10:30 PM · Daily" },
            { label: "+91 99662 11944", href: "tel:+919966211944" },
          ]}
        />
        <FooterCol
          title="Press"
          items={[
            { label: "The Hindu, 2018" },
            { label: "Conde Nast, 2021" },
            { label: "Goya Journal, 2023" },
            { label: "Mint Lounge, 2024" },
          ]}
        />
      </div>

      <div className="max-w-[1600px] mx-auto mt-20 pt-8 border-t border-[var(--lvff-gold)]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/40">
        <span>© 2026 Lakshmi Venkateswara Fast Foods</span>
        <span className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[var(--lvff-gold)]" />
          Crafted with patience in Pulivendula
        </span>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div className="md:col-span-2">
      <div className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)] mb-6">{title}</div>
      <ul className="flex flex-col gap-3">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-[var(--lvff-cream)]/70">
            {it.href ? (
              <a href={it.href} className="lux-link">{it.label}</a>
            ) : (
              it.label
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
