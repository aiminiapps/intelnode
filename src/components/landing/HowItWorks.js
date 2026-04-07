"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiWalletLine,
  RiSearchLine,
  RiServerLine,
  RiCheckDoubleLine,
  RiLoader4Line,
  RiShieldCheckLine, RiTrophyLine, RiPulseLine
} from "react-icons/ri";

const steps = [
  {
    id: "01",
    title: "Initialize Oracle Link",
    description: "Connect your Web3 identity to sync with ChainOracle's intelligence network.",
    icon: RiWalletLine,
    details: {
      tag: "PHASE I",
      heading: "Establish Secure Uplink",
      text: "Instantly link your wallet with our encrypted subsystem. No personal data required—your on-chain identity serves as your universal secure key to the platform.",
      visual: (
        <div className="w-full h-[220px] bg-[#0A0A0F]/80 border border-[#2A2A3A]/50 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
           <motion.div 
             animate={{ y: [0, -5, 0] }} 
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="w-20 h-20 rounded-full bg-[#141420] border border-[#2A2A3A] flex items-center justify-center relative z-10 shadow-[0_0_30px_#7C3AED40]"
           >
              <RiWalletLine className="text-[#9F67FF] text-3xl" />
              <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.5, type: "spring" }}
                 className="absolute -top-1 -right-1 w-5 h-5 bg-[#22C55E] rounded-full border-4 border-[#0A0A0F]" 
              />
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8 }}
             className="mt-6 text-center z-10"
           >
             <div className="text-white font-mono text-sm tracking-widest font-bold mb-1">AUTHENTICATED</div>
             <div className="text-[#8E8E9A] text-xs font-mono">ID: 0x7F2...K9A4B</div>
           </motion.div>
        </div>
      )
    }
  },
  {
    id: "02",
    title: "Input Target Vector",
    description: "Provide the smart contract or wallet address you want the AI to analyze.",
    icon: RiSearchLine,
    details: {
      tag: "PHASE II",
      heading: "Designate Your Target",
      text: "Paste any token contract, liquidity pair, or wallet address. The Oracle Engine instantly locks onto the target across all supported networks.",
      visual: (
        <div className="w-full h-[220px] bg-[#0A0A0F]/80 border border-[#2A2A3A]/50 rounded-2xl p-8 flex flex-col justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
           <div className="relative z-10">
              <div className="relative mb-6">
                 <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F97316] text-xl" />
                 <div className="w-full bg-[#141420] border border-[#F97316]/40 rounded-xl py-4 flex items-center pl-12 pr-4 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                    <span className="text-[#E0E0E0] font-mono text-xs overflow-hidden whitespace-nowrap">0x6982508145454Ce325dDbE47a25d4ec3d2311933</span>
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-px h-5 bg-[#F97316] ml-1" />
                 </div>
              </div>
              <div className="flex flex-wrap gap-2">
                 <div className="px-3 py-1.5 rounded-md bg-[#1C1C2E] border border-[#2A2A3A] text-[10px] text-white flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" /> Ethereum Network
                 </div>
                 <div className="px-3 py-1.5 rounded-md bg-[#1C1C2E] border border-[#2A2A3A] text-[10px] text-white flex items-center gap-1.5">
                    <RiShieldCheckLine className="text-[#22C55E]" /> Target Verified
                 </div>
              </div>
           </div>
        </div>
      )
    }
  },
  {
    id: "03",
    title: "Neural Processing",
    description: "The AI deeply scans liquidity, narrative sentiment, and holder distribution.",
    icon: RiServerLine,
    details: {
      tag: "PHASE III",
      heading: "Oracle Deep Scan Engaged",
      text: "Our proprietary neural-net filters millions of on-chain data points in seconds. We analyze smart money wallets, check contract safety, and measure momentum volume organically.",
      visual: (
        <div className="w-full h-[220px] bg-[#0A0A0F]/80 border border-[#2A2A3A]/50 rounded-2xl p-6 flex flex-col justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-3">
           {[
             { label: "Validating Contract Integrity", delay: 0, color: "#22C55E" },
             { label: "Mapping Smart Money Flows", delay: 0.5, color: "#3B82F6" },
             { label: "Evaluating Social Narrative", delay: 1, color: "#9F67FF" }
           ].map((task, i) => (
             <div key={i} className="bg-[#141420] border border-[#2A2A3A] p-3 rounded-xl flex items-center gap-3 relative overflow-hidden">
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: task.delay + 1, duration: 0.1 }}
                  className="absolute inset-0 bg-[#1C1C2E] z-10 flex items-center justify-center text-[10px] text-[#A1A1AA] uppercase tracking-widest font-mono"
                >
                  <RiLoader4Line className="animate-spin text-lg" />
                </motion.div>
                
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color, boxShadow: `0 0 8px ${task.color}` }} />
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[#E0E0E0] text-[10px] uppercase font-bold tracking-wider">{task.label}</span>
                      <span className="text-[#8E8E9A] text-[9px] font-mono">100%</span>
                   </div>
                   <div className="w-full h-1 bg-[#0A0A0F] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: task.delay, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: task.color }}
                      />
                   </div>
                </div>
             </div>
           ))}
        </div>
      )
    }
  },
  {
    id: "04",
    title: "Extract Intelligence",
    description: "Receive the final Alpha score with actionable, predictive insights.",
    icon: RiCheckDoubleLine,
    details: {
      tag: "PHASE IV",
      heading: "Execute with Absolute Confidence",
      text: "The final intelligence report is compiled perfectly into the dashboard. Review the comprehensive probability matrix and act on the insights before the market moves.",
      visual: (
        <div className="w-full h-[220px] bg-[#0A0A0F]/80 border border-[#2A2A3A]/50 rounded-2xl p-6 flex flex-col justify-between relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#22C55E]" />
           
           <div className="relative z-10 flex justify-between items-start">
             <div>
                <h4 className="text-white font-bold text-lg leading-tight uppercase tracking-wider mb-1">Target Resolved</h4>
                <p className="text-[#8E8E9A] text-[10px] font-mono">ANALYSIS_COMPLETE : PASS</p>
             </div>
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ type: "spring", delay: 0.3 }}
               className="px-3 py-1 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[9px] font-black rounded uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.2)]"
             >
               High Conviction
             </motion.div>
           </div>
           
           <div className="relative z-10 mt-auto flex items-end justify-between border-t border-[#2A2A3A] pt-4">
              <div>
                 <div className="text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1 font-mono">Forecast Score</div>
                 <div className="flex items-end gap-1.5">
                    <span className="text-5xl font-black text-white leading-none tracking-tighter shadow-sm text-transparent bg-clip-text bg-gradient-to-b from-white to-[#A1A1AA]">9.6</span>
                    <span className="text-[#6B6B76] text-sm font-bold pb-1">/ 10</span>
                 </div>
              </div>
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 rounded-full bg-[#1C1C2E] border border-[#2A2A3A] flex items-center justify-center text-[#22C55E]"
              >
                 <RiPulseLine className="text-xl" />
              </motion.div>
           </div>
        </div>
      )
    }
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            How The <span className="text-[#7C3AED]">Oracle Works</span>
          </h2>
        </motion.div>

        {/* Main Interface */}
        <div className="bg-[#0A0A0F]/60 backdrop-blur-3xl border border-[#1E1E2E] rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col justify-between lg:flex-row min-h-[500px] relative group">
          
          {/* Premium Noise Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none z-0"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none z-0" />
          
          {/* LEFT PANEL - Timeline/Stepper */}
          <div className="lg:w-[45%] p-8 md:p-12 relative border-b lg:border-b-0 lg:border-r border-[#1E1E2E] flex flex-col justify-center">
            
            <div className="relative z-10 space-y-8">
              {/* Stepper Line */}
              <div className="absolute left-[28px] top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-[#2A2A3A] to-transparent z-0" />

              {steps.map((step, index) => {
                const isActive = activeStep === index;
                const isPast = index < activeStep;
                
                return (
                  <div 
                    key={step.id} 
                    className="relative z-10 flex gap-6 cursor-pointer group"
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex-shrink-0 relative">
                      {/* Active Glow Ring */}
                      {isActive && (
                         <motion.div 
                           layoutId="activeRing"
                           className="absolute -inset-2 h-18 rounded-lg border border-[#7C3AED]/30 bg-[#7C3AED]/5"
                           transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                         />
                      )}
                      <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-300 relative z-10 ${
                        isActive 
                          ? "bg-[#7C3AED]/10 border border-[#7C3AED]/50 shadow-[0_0_20px_rgba(124,58,237,0.3)]" 
                          : isPast 
                            ? "bg-[#141420] border-[#2A2A3A] border" 
                            : "bg-[#0A0A0F] border-[#1E1E2E] border group-hover:border-[#3F3F46]"
                      }`}>
                        <span className={`text-[9px] font-bold tracking-widest leading-none mb-1 transition-colors ${isActive ? "text-[#9F67FF]" : isPast ? "text-[#6B6B76]" : "text-[#3F3F46]"}`}>
                           {step.id}
                        </span>
                        <step.icon className={`text-lg transition-colors duration-300 ${
                          isActive ? "text-[#E0E0E0]" : isPast ? "text-[#8E8E9A]" : "text-[#3F3F46]"
                        }`} />
                      </div>
                    </div>
                    <div className="pt-2 flex-1 pr-4">
                      <h4 className={`text-[17px] font-bold transition-all duration-300 ${
                        isActive ? "text-white translate-x-1" : isPast ? "text-[#A1A1AA]" : "text-[#6B6B76]"
                      }`}>
                        {step.title}
                      </h4>
                      {isActive && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-[#8E8E9A] text-[13px] mt-2 leading-relaxed"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT PANEL - Dynamic Visualizer */}
          <div className="lg:w-[55%] relative overflow-hidden flex flex-col z-10 border-t lg:border-t-0 border-[#1E1E2E]/50">
            {/* Background effects removed to favor noise/transparency */}
            
            <div className="flex-1 p-8 md:p-12 flex items-center justify-center">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeStep}
                   initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                   animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                   exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                   transition={{ duration: 0.4, ease: "easeOut" }}
                   className="w-full max-w-sm"
                 >
                    {steps[activeStep].details.visual}
                 </motion.div>
               </AnimatePresence>
            </div>

            {/* Bottom Text Description */}
            <div className="p-8 md:p-12 border-t border-[#1E1E2E]/50 bg-transparent relative z-10">
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeStep}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3 }}
                 >
                   <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-0.5 rounded bg-[#1C1C2E] border border-[#2A2A3A] text-[#7C3AED] text-[9px] font-black uppercase tracking-widest">{steps[activeStep].details.tag}</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{steps[activeStep].details.heading}</h3>
                   <p className="text-[#8E8E9A] text-[13px] leading-relaxed max-w-md">{steps[activeStep].details.text}</p>
                 </motion.div>
               </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
