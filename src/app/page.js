import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TokenSection from "@/components/landing/TokenSection";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full relative bg-white">
      
      {/* ─── CONTENT ─── */}
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <TokenSection />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
