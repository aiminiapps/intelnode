"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RiTerminalBoxLine, RiArrowRightSLine, RiPulseLine } from "react-icons/ri";

export default function CTA() {
  return (
    <section className="py-24 relative bg-transparent overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-[2.5rem] border border-[#2A2A3A] bg-[#0A0A0F]/60 backdrop-blur-3xl p-10 md:p-20 text-center overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] group"
        >
          {/* Premium Noise Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6  tracking-tighter leading-none">
              Initialize  
              <span className="text-[#7C3AED]"> the Subsystem</span>
            </h2>
            
            <p className="text-[#A1A1AA] text-sm md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Synchronize your encrypted Web3 identity with the ChainOracle neural network. Extract pristine, high-conviction Alpha from the market noise before anyone else.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
               <Link
                 href="/app"
                 className="btn-3d flex items-center justify-center gap-2 px-10 py-5 text-sm font-bold uppercase tracking-widest w-full sm:w-auto overflow-hidden relative"
               >
                 <span className="relative z-10 flex items-center gap-2">Launch App  <RiArrowRightSLine className="text-xl" /></span>
               </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
