"use client";

import { motion } from "motion/react";
import Image from "next/image";
import {
  RiShieldCheckLine,
  RiCopperCoinLine,
  RiTeamLine,
  RiLock2Line,
  RiArrowRightDoubleLine
} from "react-icons/ri";

const EARN_NODES = [
  { label: "Community Quests", reward: "+ 50", delay: 0.1 },
  { label: "Predictive Bounties", reward: "+ 150", delay: 0.2 },
  { label: "Network Staking", reward: "+ 12%", delay: 0.3 }
];

const SPEND_NODES = [
  { label: "Deep AI Analysis", cost: "- 200", delay: 0.4 },
  { label: "Real-Time Target Alerts", cost: "- 100", delay: 0.5 },
  { label: "Wallet Tracking Maps", cost: "- 300", delay: 0.6 }
];

export default function TokenSection() {
  return (
    <section id="token" className="py-24 relative overflow-hidden bg-transparent">

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            The Intelligence <span className="text-[#7C3AED]">Economy</span>
          </h2>
          <p className="text-[#8E8E9A] mt-4 max-w-2xl mx-auto text-[15px] leading-relaxed">
            $CORA is the proprietary fuel powering the neural engine. Earn tokens through community participation and burn them to extract high-conviction market signals.
          </p>
        </motion.div>

        {/* ═══════ THE ENGINE PIPELINE ═══════ */}
        <div className="w-full bg-[#0D0D14] border border-[#1E1E2E] rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl mb-6">
           
           {/* Pipeline Background Lines connecting the three columns */}
           <div className="hidden md:block absolute top-[55%] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-[#7C3AED]/40 to-transparent shadow-[0_0_10px_#7C3AED]" />
           <motion.div 
             className="hidden md:block absolute top-[55%] left-1/4 h-0.5 w-10 bg-white rounded-full blur-[1px]" 
             animate={{ left: ["20%", "75%"], opacity: [0, 1, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
           />

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative z-10 items-center">
              
              {/* LEFT: EARN STREAM */}
              <div className="flex flex-col gap-4">
                 <div className="text-center md:text-left mb-2">
                    <span className="text-[#22C55E] text-[11px] font-black uppercase tracking-widest">Input Raw Value</span>
                 </div>
                 {EARN_NODES.map((node, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: node.delay, duration: 0.4 }}
                      className="bg-[#0A0A0F] border border-[#2A2A3A] p-3.5 rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.3)] flex items-center justify-between group hover:border-[#22C55E]/40 transition-colors"
                    >
                       <span className="text-white text-sm font-medium">{node.label}</span>
                       <span className="px-2 py-0.5 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold font-mono rounded">+ {node.reward}</span>
                    </motion.div>
                 ))}
              </div>

              {/* CENTER: THE ORACLE CORE */}
              <div className="flex flex-col sm:mt-10 items-center justify-center py-8 md:py-0">
                 <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Atmospheric Glow */}
                    <div className="absolute inset-0 bg-[#7C3AED]/20 rounded-full blur-[40px] animate-pulse" />
                    
                    {/* Precision Orbital Rings */}
                    <div className="absolute w-full h-full rounded-full border-[1px] border-dashed border-[#7C3AED]/30 animate-[spin_20s_linear_infinite]" />
                    <div className="absolute w-[80%] h-[80%] rounded-full border-[1px] border-[#9F67FF]/20 animate-[spin_15s_linear_infinite_reverse]" />
                    
                    {/* The Core Container */}
                    <motion.div 
                      animate={{ scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-[100px] h-[100px] rounded-full bg-gradient-to-tr from-[#5B21B6] to-[#A78BFA] shadow-[0_0_50px_rgba(124,58,237,0.5)] p-[2px]"
                    >
                       <div className="w-full h-full bg-[#0A0A0F] rounded-full flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl">
                        <Image src="/agent.png" alt="Logo" width={100} height={100} />
                       </div>
                    </motion.div>
                 </div>
              </div>

              {/* RIGHT: SPEND STREAM */}
              <div className="flex flex-col gap-4">
                 <div className="text-center md:text-right mb-2">
                    <span className="text-[#F97316] text-[11px] font-black uppercase tracking-widest">Extract Compute</span>
                 </div>
                 {SPEND_NODES.map((node, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: node.delay, duration: 0.4 }}
                      className="bg-[#0A0A0F] border border-[#2A2A3A] p-3.5 rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.3)] flex items-center justify-between flex-row-reverse md:flex-row group hover:border-[#F97316]/40 transition-colors"
                    >
                       <span className="text-white text-sm font-medium">{node.label}</span>
                       <span className="px-2 py-0.5 bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] text-[10px] font-bold font-mono rounded">- {node.cost}</span>
                    </motion.div>
                 ))}
              </div>

           </div>
        </div>

        {/* ═══════ ARCHITECTURE PILLARS ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="bg-[#0D0D14] border border-[#1E1E2E] p-6 rounded-2xl flex flex-col gap-3 group hover:border-[#2A2A3A]"
           >
              <div className="w-10 h-10 rounded-lg bg-[#141420] border border-[#2A2A3A] flex items-center justify-center text-[#7C3AED] group-hover:bg-[#7C3AED]/10 transition-colors">
                 <RiShieldCheckLine className="text-xl" />
              </div>
              <div>
                 <h4 className="text-white font-bold text-[15px] mb-1">Anti-Sybil Guardrails</h4>
                 <p className="text-[#8E8E9A] text-xs leading-relaxed">Sophisticated on-chain safeguards prevent bot farming, ensuring fair dynamic limits for organic users.</p>
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="bg-[#0D0D14] border border-[#1E1E2E] p-6 rounded-2xl flex flex-col gap-3 group hover:border-[#2A2A3A]"
           >
               <div className="w-10 h-10 rounded-lg bg-[#141420] border border-[#2A2A3A] flex items-center justify-center text-[#22C55E] group-hover:bg-[#22C55E]/10 transition-colors">
                 <RiTeamLine className="text-xl" />
              </div>
              <div>
                 <h4 className="text-white font-bold text-[15px] mb-1">Decentralized Effort</h4>
                 <p className="text-[#8E8E9A] text-xs leading-relaxed">By crowdsourcing noise-filtering tasks to the community, the computational AI cost remains radically accessible.</p>
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-[#141420] border border-[#3F3F46] p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden group hover:border-[#7C3AED]"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 to-transparent" />
              <div className="w-10 h-10 rounded-lg bg-[#0A0A0F] border border-[#3F3F46] flex items-center justify-center text-[#9F67FF] relative z-10">
                 <RiLock2Line className="text-xl" />
              </div>
              <div className="relative z-10">
                 <h4 className="text-white font-bold text-[15px] mb-1">Read The Master Blueprint</h4>
                 <p className="text-[#CCC] text-xs leading-relaxed mb-4">Dive deep into the mathematical models driving the $CORA circular intelligence economy.</p>
                 <button className="flex items-center gap-1.5 text-[11px] font-bold text-[#9F67FF] uppercase tracking-widest hover:text-white transition-colors">
                    Access Docs <RiArrowRightDoubleLine />
                 </button>
              </div>
           </motion.div>
        </div>

      </div>
    </section>
  );
}
