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
    <main className="min-h-screen w-full relative bg-[#0A0A0F]">
      
      {/* ─── FIXED ATMOSPHERIC BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep Radial Glow */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 10%, #0A0A0F 40%, rgba(124, 58, 237, 0.15) 100%)",
          }}
        />
        {/* Grain Noise Effect */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

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
