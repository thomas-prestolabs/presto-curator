import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Vaults from "@/components/sections/Vaults";
import Stats from "@/components/sections/Stats";
import News from "@/components/sections/News";
import Partners from "@/components/sections/Partners";
import ContactBand from "@/components/sections/ContactBand";

// ISR: the page (and the vault numbers in it) is regenerated in the background at
// most once a minute, on demand. Visitors always get the cached HTML instantly and
// the protocol APIs are never called per page view.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Vaults />
        <Stats />
        <News />
        <Partners />
        <ContactBand />
      </main>
      <Footer />
    </>
  );
}
