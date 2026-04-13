"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RiArrowRightUpLine, RiBookOpenLine, RiShieldCheckLine, RiBarChartBoxLine, RiFlashlightLine, RiNodeTree, RiGlobalLine, RiGroupLine } from "react-icons/ri";
import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════
   COINS — Live intel feed showcase data
   ═══════════════════════════════════════════ */
const COINS = [
  { ticker: "$PEPE", score: "9.8", type: "Whale Accumulation", color: "#22C55E", img: "https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg" },
  { ticker: "$DOGE", score: "9.5", type: "Momentum Surge", color: "#F59E0B", img: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png" },
  { ticker: "$SHIB", score: "9.2", type: "Volume Breakout", color: "#EF4444", img: "https://assets.coingecko.com/coins/images/11939/standard/shiba.png" },
  { ticker: "$FLOKI", score: "9.0", type: "Smart Money Entry", color: "#3B82F6", img: "https://assets.coingecko.com/coins/images/16746/standard/PNG_image.png" },
  { ticker: "$WIF", score: "8.8", type: "Liquidity Spike", color: "#A78BFA", img: "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg" },
  { ticker: "$BONK", score: "8.6", type: "Sentiment Shift", color: "#FB923C", img: "https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg" },
];

/* ═══════════════════════════════════════════
   METRIC CARDS — Floating intel metrics in the visual panel
   ═══════════════════════════════════════════ */
function FloatingMetric({ label, value, x, y, delay, icon: Icon, color }) {
  return (
    <motion.div
      className="absolute z-20"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay + 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="bg-white border border-dashed border-[#D1D5DB] rounded-2xl px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center gap-3 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}08` }}>
          <Icon className="text-sm" style={{ color }} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.15em] font-medium text-[#9CA3AF]">{label}</span>
          <span className="text-[#111827] text-[14px] font-semibold font-mono tracking-tight">{value}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SCORE ARC — Circular scoring display
   ═══════════════════════════════════════════ */
function ScoreArc({ score, color }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const filled = (parseFloat(score) / 10) * circ;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#E5E7EB" strokeWidth="2" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="2" strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" transform="rotate(-90 18 18)" />
      <text x="18" y="22" textAnchor="middle" fill="#111827" className="text-[8px] font-semibold font-mono">{score}</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   COIN CARD — White mode intel card
   ═══════════════════════════════════════════ */
function CoinCard({ coin }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-white/80 backdrop-blur-sm hover:border-[#D1D5DB] transition-all">
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-[#E5E7EB] bg-[#FAFBFC]">
        <img src={coin.img} alt={coin.ticker} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[#111827] text-[12px] font-semibold tracking-wide">{coin.ticker}</span>
          <span className="text-[8px] font-medium tracking-[0.12em] uppercase px-1.5 py-[2px] rounded-full border" style={{ color: coin.color, backgroundColor: `${coin.color}08`, borderColor: `${coin.color}20` }}>{coin.type}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: coin.color }} />
          <span className="text-[9px] font-medium text-[#9CA3AF]">Signal Active</span>
        </div>
      </div>
      <ScoreArc score={coin.score} color={coin.color} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   CROSSHATCH STRIP — Reused pattern
   ═══════════════════════════════════════════ */
function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.04)", size = "8px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

/* ═══════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════ */
export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tripled = [...COINS, ...COINS, ...COINS];

  return (
    <section className="relative w-full min-h-[100svh] flex items-center overflow-hidden bg-white pt-20 md:pt-0">
      {/* ── Subtle background grid ── */}
      <div className="absolute inset-0 pointer-events-none">
        <CrosshatchStrip className="absolute inset-0 opacity-[0.35]" color="rgba(0,0,0,0.018)" size="20px" />
      </div>

      {/* ── Main Container ── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100svh-120px)]">

          {/* ═══ LEFT COLUMN — Copy & CTAs ═══ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start text-left relative z-20"
          >
            {/* Headline */}
            <h1 className="text-[clamp(2.4rem,5.5vw,4.2rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[#111827] mb-6">
              <span className="">Unlock True Alpha From</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#9F67FF]"> Any Token</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#6B7280] text-[15px] md:text-[16px] leading-[1.8] font-normal max-w-[440px] mb-10">
              Deep liquidity and sentiment analysis distilled from raw on-chain noise into precise probability matrices.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mb-12">
              {/* Primary — Launch App */}
              <Link
                href="/app"
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-white bg-[#111827] rounded-2xl transition-all duration-300 hover:bg-[#1F2937] active:scale-[0.98]"
                style={{
                  boxShadow: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 4px 12px rgba(17,24,39,0.25), 0 8px 32px rgba(17,24,39,0.15), 0 2px 0 0 #0A0E17",
                }}
              >
                Launch App
                <RiArrowRightUpLine className="text-[16px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              {/* Secondary — Docs */}
              <Link
                href="#features"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#111827] bg-white border border-dashed border-[#D1D5DB] rounded-2xl transition-all duration-300 hover:border-[#111827] hover:bg-[#FAFBFC] active:scale-[0.98]"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 1px 0 0 rgba(0,0,0,0.02)",
                }}
              >
                <RiBookOpenLine className="text-[15px] opacity-60" />
                Docs
              </Link>
            </div>

            {/* Trust metrics */}
            <div className="flex flex-wrap items-center gap-6 border-t border-dashed border-[#E5E7EB] pt-8">
              {[
                { label: "Chains", value: "12+", icon: RiGlobalLine },
                { label: "Tokens Tracked", value: "50K+", icon: RiBarChartBoxLine },
                { label: "Intel Reports", value: "100K+", icon: RiShieldCheckLine },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-[#FAFBFC] flex items-center justify-center">
                    <stat.icon className="text-[#9CA3AF] text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#111827] text-[16px] font-semibold tracking-tight">{stat.value}</span>
                    <span className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.14em] font-medium">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ═══ RIGHT COLUMN — Visual Panel ═══ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center min-h-[520px] md:min-h-[600px]"
          >
            {/* Gradient backdrop blob */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-[10%] right-[5%] w-[80%] h-[80%] rounded-[60px] bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#F0EBFF] opacity-80" />
              <div className="absolute top-[25%] left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#EEF2FF] to-[#E0E7FF] opacity-50 blur-[40px]" />
            </div>

            {/* Crosshatch overlay on gradient area */}
            <div className="absolute top-[8%] right-[3%] w-[84%] h-[84%] rounded-[50px] overflow-hidden z-[1]">
              <CrosshatchStrip className="absolute inset-0 opacity-40" color="rgba(124,58,237,0.04)" size="12px" />
            </div>

            {/* Dashed border frame */}
            <div className="absolute top-[6%] right-[1%] w-[88%] h-[88%] rounded-[56px] border border-dashed border-[#D1D5DB]/60 z-[2]" />
            <div className="absolute top-[12%] right-[7%] w-[76%] h-[76%] rounded-[44px] border border-dashed border-[#E5E7EB]/40 z-[2]" />

            {/* Floating metric cards */}
            <div className="absolute inset-0 z-30 hidden lg:block">
              <FloatingMetric label="Intel Score" value="9.4 / 10" x="2%" y="12%" delay={0} icon={RiFlashlightLine} color="#7C3AED" />
              <FloatingMetric label="Live Signals" value="2,847" x="55%" y="5%" delay={0.12} icon={RiNodeTree} color="#16A34A" />
              <FloatingMetric label="Active Users" value="18.2K" x="5%" y="72%" delay={0.24} icon={RiGroupLine} color="#3B82F6" />
            </div>

            {/* Coin feed — scrolling */}
            <div className="relative z-10 w-full max-w-[340px] h-[440px] overflow-hidden mx-auto [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]">
              {mounted && (
                <motion.div
                  animate={{ y: ["0%", "-33.33%"] }}
                  transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                  className="flex flex-col gap-2.5"
                >
                  {tripled.map((coin, i) => (
                    <CoinCard key={`${coin.ticker}-${i}`} coin={coin} />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}