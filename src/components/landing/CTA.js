"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RiArrowRightUpLine, RiBookOpenLine } from "react-icons/ri";

/* ═══════════════════════════════════════════
   CROSSHATCH
   ═══════════════════════════════════════════ */
function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.03)", size = "8px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

export default function CTA() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden bg-white">
      {/* Subtle crosshatch */}
      <CrosshatchStrip className="absolute inset-0 opacity-[0.3]" color="rgba(0,0,0,0.012)" size="24px" />

      {/* Full-width vertical gradient stripes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.55]">
        <div className="absolute inset-0 flex justify-center gap-[4px]">
          {Array.from({ length: 120 }).map((_, i) => {
            const center = 60;
            const dist = Math.abs(i - center);
            const intensity = Math.max(0, 1 - dist / center);
            return (
              <div
                key={i}
                className="h-full shrink-0 rounded-full"
                style={{
                  width: "3px",
                  background: `linear-gradient(180deg, transparent 0%, rgba(124,58,237,${(0.04 + intensity * 0.12).toFixed(3)}) 25%, rgba(124,58,237,${(0.08 + intensity * 0.18).toFixed(3)}) 50%, rgba(124,58,237,${(0.04 + intensity * 0.12).toFixed(3)}) 75%, transparent 100%)`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-semibold text-[#111827] tracking-tight leading-[1.12] mb-10">
            Let AI handle the research,<br />
            you just stay ahead.
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-white bg-[#111827] rounded-2xl transition-all duration-300 hover:bg-[#1F2937] active:scale-[0.98]"
              style={{
                boxShadow: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 4px 12px rgba(17,24,39,0.25), 0 8px 32px rgba(17,24,39,0.15), 0 2px 0 0 #0A0E17",
              }}
            >
              <RiArrowRightUpLine className="text-[15px]" />
              Launch App
            </Link>

            <Link
              href="https://intel-node.gitbook.io/intel-node-docs" target="_blank"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#111827] bg-white border border-dashed border-[#D1D5DB] rounded-2xl transition-all duration-300 hover:border-[#111827] hover:bg-[#FAFBFC] active:scale-[0.98]"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <RiBookOpenLine className="text-[15px] opacity-60" />
              Read Docs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
