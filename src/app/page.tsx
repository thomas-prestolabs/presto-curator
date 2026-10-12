import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Vaults from "@/components/sections/Vaults";
import Stats from "@/components/sections/Stats";
import News from "@/components/sections/News";
import Partners from "@/components/sections/Partners";
import ContactBand from "@/components/sections/ContactBand";

// Vault numbers are fetched on the server and cached for VAULT_REVALIDATE_SECONDS.
export const revalidate = 300;

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
