"use client";

import { motion } from "motion/react";
import { RiDatabase2Line, RiBrainLine, RiCheckDoubleLine } from "react-icons/ri";

const FEATURES = [
  {
    title: "Aggregate On-Chain Data",
    desc: "Real-time monitoring of decentralized exchanges, smart contracts, and liquidity pools across all major networks to ensure complete market coverage.",
    icon: RiDatabase2Line,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)"
  },
  {
    title: "Process with AI Intelligence",
    desc: "Proprietary predictive models filter out noise, honeypots, and rug-pulls to identify high probability alpha signals and accumulation patterns.",
    icon: RiBrainLine,
    color: "#9F67FF",
    bg: "rgba(159,103,255,0.1)",
    border: "rgba(159,103,255,0.2)"
  },
  {
    title: "Execute with Confidence",
    desc: "Receive pristine, verifiable intelligence directly to your dashboard giving you the analytical edge to act before the market moves.",
    icon: RiCheckDoubleLine,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)"
  }
];

export default function About() {
  return (
    <section className="relative py-16 bg-transparent overflow-hidden">
      
      {/* Background glow for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#9F67FF]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            How Oracle Empowers <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white">Your Market Intelligence</span>
          </h2>
        </motion.div>

        {/* 3-Column Feature Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
          {FEATURES.map((feature, i) => (
            <motion.div 
              key={i}
              className="flex items-start gap-5 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Premium Icon Block */}
              <div 
                className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                style={{ backgroundColor: feature.bg, borderColor: feature.border, color: feature.color }}
              >
                <feature.icon className="text-2xl" />
              </div>
              
              {/* Text Content */}
              <div>
                <h3 className="text-white font-bold text-[17px] mb-2">{feature.title}</h3>
                <p className="text-[#8E8E9A] text-sm leading-[1.6]">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
