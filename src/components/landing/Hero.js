"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RiArrowRightUpLine, RiBookLine, RiSparklingLine, RiLineChartLine, RiShieldStarLine } from "react-icons/ri";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90svh] bg-white flex items-center pt-24 pb-16 overflow-hidden">
      {/* Premium Background Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 opacity-70" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        {/* ═══ LEFT SIDE: Content ═══ */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
          
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#111827]/10 bg-white/50 backdrop-blur-md mb-6 shadow-sm"
          >
            <RiSparklingLine className="text-purple-600 text-sm" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111827]">Terminal Logic v2.0 Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#111827] leading-[1.1] tracking-tight mb-6"
          >
            Institutional <br className="hidden lg:block" />
            <span className="relative">
              Intelligence
              <span className="absolute bottom-1 lg:bottom-2 left-0 right-0 h-3 lg:h-4 bg-purple-200/60 -z-10" />
            </span>
            <br className="hidden lg:block" /> at scale.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base lg:text-lg text-[#4B5563] max-w-xl leading-relaxed mb-10"
          >
            Deploy high-frequency algorithmic monitors, detect hidden liquidity spikes, and track smart money vectors through a single pristine dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* 3D Premium Button */}
            <Link
              href="/app"
              className="relative group w-full sm:w-auto inline-flex items-center justify-center font-bold text-[13px] uppercase tracking-widest text-white px-8 py-4 bg-[#111827] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_0_0_rgb(0,0,0)] hover:shadow-[0_4px_0_0_rgb(0,0,0)] hover:translate-y-1"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center gap-2">
                Launch App <RiArrowRightUpLine className="text-lg" />
              </span>
            </Link>

            {/* Secondary Docs Button */}
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold text-[13px] uppercase tracking-widest text-[#111827] px-8 py-4 bg-white border-2 border-[#111827]/10 hover:border-[#111827] rounded-xl transition-all duration-300"
            >
              <RiBookLine className="text-lg" /> Documentation
            </Link>
          </motion.div>

          {/* Social Proof / Mini Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 flex items-center gap-6 text-[#6B7280] text-sm font-medium"
          >
            <div className="flex items-center gap-2">
              <RiLineChartLine className="text-[#111827]" /> <span>Real-time Telemetry</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <RiShieldStarLine className="text-[#111827]" /> <span>Bank-grade Infrastructure</span>
            </div>
          </motion.div>
        </div>

        {/* ═══ RIGHT SIDE: Visual/Dashed Premium Box ═══ */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="flex-1 w-full max-w-[600px] lg:max-w-none relative"
        >
          {/* Dashed Border Container */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-[2rem] border-2 border-dashed border-[#111827]/15 p-4 lg:p-6 bg-white/50 backdrop-blur-xl">
            
            {/* Inner Premium Gradient/Pattern Container */}
            <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-br from-gray-50 via-gray-100 to-[#e5e7eb] relative overflow-hidden shadow-inner flex items-center justify-center">
              
              {/* Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-multiply" 
                style={{ 
                  backgroundImage: `repeating-linear-gradient(45deg, #111827 0, #111827 1px, transparent 0, transparent 50%)`, 
                  backgroundSize: `8px 8px` 
                }} 
              />
              
              {/* 3D Floating Elements or Premium Graphic */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                 {/* Central Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-400/20 blur-[60px] rounded-full" />
                 
                 {/* Abstract UI Elements to represent "Data" */}
                 <div className="relative w-full max-w-[320px] aspect-[4/5] bg-white rounded-2xl shadow-2xl border border-white p-5 flex flex-col gap-4 transform rotate-[-2deg] hover:rotate-[0deg] transition-transform duration-500">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Terminal</div>
                    </div>

                    {/* Simulated pulse bars */}
                    <div className="flex-1 w-full bg-gray-50 rounded-xl border border-gray-100 p-4 flex flex-col gap-3 justify-center">
                       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                         <motion.div animate={{ width: ["30%", "70%", "30%"] }} transition={{ duration: 3, repeat: Infinity }} className="h-full bg-[#111827] rounded-full" />
                       </div>
                       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                         <motion.div animate={{ width: ["80%", "40%", "80%"] }} transition={{ duration: 4, repeat: Infinity }} className="h-full bg-purple-500 rounded-full" />
                       </div>
                       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                         <motion.div animate={{ width: ["50%", "90%", "50%"] }} transition={{ duration: 3.5, repeat: Infinity }} className="h-full bg-blue-500 rounded-full" />
                       </div>
                    </div>

                    {/* Meta stats */}
                    <div className="flex justify-between gap-3">
                      <div className="flex-1 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xs font-mono font-medium text-gray-400 shadow-inner">0x9A..</div>
                      <div className="flex-1 h-14 bg-[#111827] shadow-lg shadow-[#111827]/20 rounded-xl flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-white">Active</div>
                    </div>
                 </div>

                 {/* Floating decorative elements */}
                 <motion.div 
                   animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                   className="absolute -right-8 top-16 w-24 h-24 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 flex items-center justify-center"
                 >
                   <RiLineChartLine className="text-3xl text-purple-600" />
                 </motion.div>
                 <motion.div 
                   animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity }}
                   className="absolute -left-6 bottom-20 w-20 h-20 bg-[#111827] rounded-xl shadow-2xl flex items-center justify-center"
                 >
                   <RiSparklingLine className="text-2xl text-white" />
                 </motion.div>
              </div>
            </div>
            
            {/* Decorative Corner Dashes (optional aesthetic finish) */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#111827]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#111827]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#111827]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#111827]" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}