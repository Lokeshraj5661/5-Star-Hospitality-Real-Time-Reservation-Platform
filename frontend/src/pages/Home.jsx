import Navbar from "@/components/lvff/Navbar";
import Hero from "@/components/lvff/Hero";
import Philosophy from "@/components/lvff/Philosophy";
import Menu from "@/components/lvff/Menu";
import Signature from "@/components/lvff/Signature";
import ConciergeMap from "@/components/lvff/ConciergeMap";
import Reservation from "@/components/lvff/Reservation";
import Footer from "@/components/lvff/Footer";

export default function Home() {
  return (
    <main data-testid="home-page" className="bg-marble bg-noise relative">
      <Navbar />
      <Hero />
      <Philosophy />
      <Menu />
      <Signature />
      <ConciergeMap />
      <Reservation />
      <Footer />
    </main>
  );
}
