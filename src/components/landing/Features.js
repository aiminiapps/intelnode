"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  RiLineChartLine,
  RiTrophyLine,
  RiEyeLine,
  RiNotification3Line,
  RiFileChartLine,
  RiCheckLine, RiLoader4Line, RiLinkM, RiStarLine,
  RiBrainLine, RiDatabase2Line
} from "react-icons/ri";
import { useState, useEffect } from "react";

/* ─── VISUAL 1: Predictive AI Engine ─── */
function PredictiveVisual() {
  return (
    <div className="w-full flex items-center justify-center pt-8">
      <div className="w-full max-w-[320px] rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] p-4 shadow-2xl relative overflow-hidden">
        {/* Token header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center">
              <RiLineChartLine className="text-[#F97316] text-xs" />
            </div>
            <div>
              <div className="text-white text-[10px] font-bold">$ORACLE</div>
              <div className="text-[#6B6B76] text-[8px]">AI Forecast</div>
            </div>
          </div>
          <div className="text-[#F97316] text-[10px] font-bold bg-[#F97316]/10 border border-[#F97316]/20 px-2 py-0.5 rounded">
            94% Probability
          </div>
        </div>

        {/* Mini predictive chart */}
        <div className="h-[80px] relative overflow-hidden rounded bg-[#0D0D14] border border-[#1E1E2E] mb-3 p-1">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="predFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,40 C20,38 30,30 50,32 C70,34 80,20 100,22 C110,23 115,18 120,15 L120,50 L0,50 Z"
              fill="url(#predFill)"
              initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <motion.path
              d="M0,40 C20,38 30,30 50,32 C70,34 80,20 100,22 C110,23 115,18 120,15"
              fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            <motion.path
              d="M120,15 C140,10 160,8 180,5 C190,3 195,6 200,4"
              fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 2, repeat: Infinity, repeatDelay: 3.5 }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── VISUAL 2: Curated Alpha Feeds ─── */
function FeedsVisual() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setStep(s => (s + 1) % 3), 2000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="w-full flex items-center justify-center pt-8 relative">
      <div className="w-full max-w-[320px] rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] p-4 shadow-2xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#22C55E]/5 to-transparent">
        <div className="flex justify-between items-center mb-4">
           <div className="text-white text-xs font-bold flex items-center gap-2"><RiTrophyLine className="text-[#22C55E]"/> Top Ranking Matrix</div>
        </div>
        
        <div className="space-y-2">
           {[ {t: "$NEIRO", tag: "Liquid", c: "#22C55E"}, {t: "$CORA", tag: "Momentum", c: "#3B82F6"}, {t: "$AIX", tag: "Volume", c: "#9F67FF"} ].map((item, i) => (
             <motion.div 
               key={i}
               initial={false}
               animate={{ opacity: step === i ? 1 : 0.4, borderColor: step === i ? `${item.c}50` : '#1E1E2E', backgroundColor: step === i ? `${item.c}10` : '#0D0D14' }}
               className="p-2.5 rounded-lg border flex items-center justify-between transition-colors"
             >
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded bg-[#0A0A0F] border border-[#2A2A3A] flex justify-center items-center text-[8px] font-bold text-white">{i+1}</div>
                   <div>
                     <div className="text-white text-[11px] font-bold">{item.t}</div>
                     <div className="text-[#8E8E9A] text-[9px]">{item.tag}</div>
                   </div>
                </div>
                <div className="w-16 h-1 rounded bg-[#1E1E2E]">
                   <motion.div className="h-full rounded" style={{ backgroundColor: item.c }} animate={{ width: step >= i ? "100%" : "30%" }} transition={{ duration: 1 }}/>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}

/* ─── VISUAL 3: Signal Alerts ─── */
function AlertsVisual() {
  return (
    <div className="w-full h-[200px] flex items-center justify-center pt-8 relative">
      <div className="relative w-full max-w-[280px] h-[120px]">
        {[
          { color: "#3B82F6", icon: "🐋", text: "Whale accumulated 200 ETH", delay: 0 },
          { color: "#7C3AED", icon: "📈", text: "Trend acceleration detected", delay: 2 },
          { color: "#F97316", icon: "💎", text: "Early-stage momentum signal", delay: 4 },
        ].map((alert, i) => (
          <motion.div
            key={i}
            animate={{ y: [40, 0, 0, -40, -40, -80, -80], opacity: [0, 1, 1, 0.5, 0.5, 0, 0], scale: [0.9, 1, 1, 0.95, 0.95, 0.9, 0.9], zIndex: [3, 3, 3, 2, 2, 1, 1] }}
            transition={{ repeat: Infinity, duration: 6, delay: alert.delay, times: [0, 0.08, 0.33, 0.41, 0.66, 0.74, 1], ease: "easeInOut" }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] p-3 flex items-center gap-3 shadow-xl"
          >
            <div className="w-8 h-8 rounded border flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${alert.color}10`, borderColor: `${alert.color}30` }}>{alert.icon}</div>
            <div className="flex-1 min-w-0">
               <div className="text-white text-[11px] font-bold truncate">{alert.text}</div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: alert.color, boxShadow: `0 0 6px ${alert.color}` }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── VISUAL 4: Local Insights (Reports) ─── */
function InsightsVisual() {
  return (
    <div className="w-full flex items-center justify-center pt-8">
      <div className="w-full max-w-[320px] rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] p-4 shadow-2xl relative">
        <div className="flex gap-2 mb-4">
           <div className="flex-1 p-2 rounded border border-[#1E1E2E] bg-[#0D0D14] flex flex-col gap-1 items-center justify-center">
              <RiBrainLine className="text-[#7C3AED]"/>
              <span className="text-[9px] text-white">Narrative</span>
           </div>
           <div className="flex-1 p-2 rounded border border-[#7C3AED]/30 bg-[#7C3AED]/10 flex flex-col gap-1 items-center justify-center">
              <RiDatabase2Line className="text-[#7C3AED]"/>
              <span className="text-[9px] text-white font-bold">Deep Scan</span>
           </div>
        </div>
        <div className="space-y-2">
           <div className="w-3/4 h-2 rounded bg-[#1E1E2E]"/>
           <div className="w-full h-2 rounded bg-[#1E1E2E]"/>
           <div className="w-5/6 h-2 rounded bg-[#1E1E2E]"/>
        </div>
        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mt-4 flex justify-center">
           <div className="text-[10px] text-[#7C3AED] font-bold bg-[#7C3AED]/10 px-3 py-1 rounded-full border border-[#7C3AED]/30">Analyzing Node Data...</div>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN FEATURES COMPONENT
   ═══════════════════════════════════════════ */
export default function Features() {

  const bentoGrid = [
    {
       color: "#F97316",
       title: "Forecast market movements with high precision",
       desc: "Our neural engine intelligently breaks down historical data and real-time liquidity to create accurate trend analysis.",
       visual: <PredictiveVisual />
    },
    {
       color: "#22C55E",
       title: "Automated ranking of top performance signals",
       desc: "AI dynamically filters the market to identify the 'Best of the Week' and 'Best of the Month' based on momentum.",
       visual: <FeedsVisual />
    },
    {
       color: "#3B82F6",
       title: "Easily track and analyze smart money",
       desc: "Visualize complex on-chain behavior with ease. AI works on every token and returns results in a structured feed.",
       visual: <AlertsVisual />
    },
    {
       color: "#7C3AED",
       title: "Run detailed analysis entirely within your browser",
       desc: "Run deep document and contract analysis efficiently. Perfect for users focused on speed, privacy, and precision.",
       visual: <InsightsVisual />
    }
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Oracle <span className="text-[#7C3AED]">Main Features</span>
          </h2>
        </motion.div>

        {/* ═══════ 2x2 BENTO GRID ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {bentoGrid.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="rounded-3xl border border-[#1E1E2E] bg-[#0A0A0F]/60 backdrop-blur-3xl p-8 md:p-10 flex flex-col justify-between overflow-hidden group hover:border-[#2A2A3A] transition-all duration-500 relative"
            >
               {/* Premium Noise Overlay */}
               <div 
                 className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
               />
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />

               {/* Top Content (Text) */}
               <div className="relative z-10 mb-8">                  
                  {/* Title & Desc */}
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 pr-4 leading-[1.3] text-balance">
                     {feature.title}
                  </h3>
                  <p className="text-[#8E8E9A] text-sm md:text-[15px] leading-relaxed pr-8">
                     {feature.desc}
                  </p>
               </div>

               {/* Bottom Content (Visual Container) */}
               <div className="relative z-10 flex-1 flex flex-col justify-end mt-4">
                  <div className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-2xl overflow-hidden relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-[220px]">
                     {/* Window UI Header */}
                     <div className="absolute top-0 inset-x-0 h-6 bg-[#0D0D14] border-b border-[#1E1E2E] flex items-center px-3 gap-1.5 z-20">
                        <div className="w-2 h-2 rounded-full bg-[#3F3F46]" />
                        <div className="w-2 h-2 rounded-full bg-[#3F3F46]" />
                        <div className="w-2 h-2 rounded-full bg-[#3F3F46]" />
                     </div>
                     {/* Visual Content mapped exactly to the box constraint */}
                     <div className="absolute inset-0 pt-6">
                        {feature.visual}
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
