"use client";

import { motion } from "motion/react";
import {
  RiBrainLine,
  RiStarLine, RiWaterFlashLine, RiBarChart2Line
} from "react-icons/ri";
import { BsGem } from "react-icons/bs";

/* ═══════════════════════════════════════════
   CROSSHATCH
   ═══════════════════════════════════════════ */
function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.03)", size = "8px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

/* ═══════════════════════════════════════════
   BENTO CARD WRAPPER
   ═══════════════════════════════════════════ */
function BentoCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-3xl border border-[#E5E7EB] bg-white p-6 md:p-8 relative overflow-hidden group hover:border-[#D1D5DB] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   VISUAL 1 — AI Research Report (Large Left)
   ═══════════════════════════════════════════ */
function ResearchVisual() {
  return (
    <div className="mt-6">
      {/* Mini report card */}
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC] p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/8 border border-[#7C3AED]/15 flex items-center justify-center">
            <RiBrainLine className="text-[#7C3AED] text-sm" />
          </div>
          <div>
            <div className="text-[#111827] text-[12px] font-semibold">$PEPE Analysis</div>
            <div className="text-[#9CA3AF] text-[9px] uppercase tracking-widest font-medium">Deep Scan Complete</div>
          </div>
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/8 border border-[#16A34A]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[#16A34A] text-[8px] font-medium uppercase tracking-widest">9.4</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { label: "Liquidity", pct: 92, color: "#7C3AED" },
            { label: "Holders", pct: 78, color: "#3B82F6" },
            { label: "Momentum", pct: 85, color: "#16A34A" },
          ].map((b, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1">
                <span className="text-[#6B7280] text-[9px] uppercase tracking-widest font-medium">{b.label}</span>
                <span className="text-[#111827] text-[10px] font-semibold font-mono">{b.pct}%</span>
              </div>
              <div className="h-[5px] rounded-full bg-[#F3F4F6] overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: b.color }} initial={{ width: 0 }} whileInView={{ width: `${b.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 py-2 rounded-xl border border-dashed border-[#E5E7EB] text-center text-[9px] uppercase tracking-widest font-medium text-[#6B7280] bg-[#FAFBFC]">Full Report</div>
        <div className="flex-1 py-2 rounded-xl border border-dashed border-[#E5E7EB] text-center text-[9px] uppercase tracking-widest font-medium text-[#6B7280] bg-[#FAFBFC]">Export PDF</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VISUAL 2 — Signal Alerts (Top Right)
   ═══════════════════════════════════════════ */
function SignalsVisual() {
  return (
    <div className="mt-5 space-y-2">
      {[
        { icon: RiWaterFlashLine, text: "Whale accumulated 200 ETH", token: "$PEPE", time: "2m", color: "#16A34A" },
        { icon: RiBarChart2Line, text: "4.2x volume spike detected", token: "$WIF", time: "8m", color: "#F97316" },
        { icon: BsGem, text: "Smart money entry signal", token: "$FLOKI", time: "14m", color: "#3B82F6" },
      ].map((a, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC]"
        >
          <div className="w-7 h-7 rounded-lg border border-[#E5E7EB] bg-white flex items-center justify-center shrink-0">
            <a.icon className="text-[#6B7280] text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[#111827] text-[11px] font-medium block truncate">{a.text}</span>
            <span className="text-[#9CA3AF] text-[9px] font-mono">{a.token} · {a.time} ago</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   VISUAL 3 — Chain Coverage (Bottom Middle)
   ═══════════════════════════════════════════ */
function ChainsVisual() {
  const chains = [
    { name: "Ethereum", short: "ETH", logo: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png" },
    { name: "Solana", short: "SOL", logo: "https://assets.coingecko.com/coins/images/4128/standard/solana.png" },
    { name: "Base", short: "BASE", logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4" },
    { name: "Arbitrum", short: "ARB", logo: "https://assets.coingecko.com/coins/images/16547/standard/photo_2023-03-29_21.47.00.jpeg" },
    { name: "BSC", short: "BNB", logo: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png" },
  ];

  return (
    <div className="mt-5 flex flex-wrap gap-2 justify-center">
      {chains.map((c, i) => (
        <motion.div
          key={c.short}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC] hover:border-[#D1D5DB] transition-colors"
        >
          <div className="w-5 h-5 rounded-full border border-[#E5E7EB] overflow-hidden bg-white">
            <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-[#111827] text-[11px] font-medium">{c.name}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   VISUAL 4 — Sentiment Matrix (Small)
   ═══════════════════════════════════════════ */
function SentimentVisual() {
  const data = [
    { label: "Bullish", pct: 64, color: "#16A34A" },
    { label: "Neutral", pct: 24, color: "#F97316" },
    { label: "Bearish", pct: 12, color: "#DC2626" },
  ];

  return (
    <div className="mt-5">
      {/* Mini sentiment bar */}
      <div className="h-2.5 rounded-full overflow-hidden flex mb-4 bg-[#F3F4F6]">
        {data.map((d, i) => (
          <motion.div
            key={d.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ backgroundColor: d.color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${d.pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[#6B7280] text-[10px] font-medium">{d.label}</span>
            <span className="text-[#111827] text-[10px] font-semibold font-mono">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VISUAL 5 — Token Scoring (Right Column)
   ═══════════════════════════════════════════ */
function ScoringVisual() {
  const tokens = [
    { name: "$PEPE", score: 9.8, change: "+28.4%", color: "#16A34A", logo: "https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg" },
    { name: "$WIF", score: 8.8, change: "+12.1%", color: "#16A34A", logo: "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg" },
    { name: "$DOGE", score: 9.5, change: "-3.2%", color: "#DC2626", logo: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png" },
  ];

  return (
    <div className="mt-5 space-y-2">
      {tokens.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E5E7EB] bg-white">
               <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[#111827] text-[12px] font-semibold">{t.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-medium" style={{ color: t.color }}>{t.change}</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-[#7C3AED]/15 bg-[#7C3AED]/5">
              <RiStarLine className="text-[#7C3AED] text-[9px]" />
              <span className="text-[#7C3AED] text-[10px] font-semibold font-mono">{t.score}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ABOUT COMPONENT — BENTO GRID
   ═══════════════════════════════════════════ */
export default function About() {
  return (
    <section id="about" className="relative py-20 md:py-28 overflow-hidden bg-white">
      <CrosshatchStrip className="absolute inset-0 opacity-[0.25]" color="rgba(0,0,0,0.012)" size="24px" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold text-[#111827] tracking-tight leading-tight mb-4">
            Master every aspect of your<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]">On-Chain Data</span>
          </h2>
          <p className="text-[#6B7280] text-[15px] font-normal leading-relaxed max-w-md mx-auto">
            Experience our unified suite of high-fidelity analysis and tracking metrics.
          </p>
        </motion.div>

        {/* ═══ BENTO GRID ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-5">

          {/* ── CARD 1: AI Research (Tall Left — spans 5 cols) ── */}
          <BentoCard className="md:col-span-3 lg:col-span-5 md:row-span-2" delay={0}>
            <span className="text-[#7C3AED] text-[9px] uppercase tracking-[0.16em] font-semibold">AI Research</span>
            <h3 className="text-[#111827] text-[22px] md:text-[24px] font-semibold tracking-tight leading-snug mt-2 mb-1">
              Institution-Grade Token Analysis
            </h3>
            <p className="text-[#6B7280] text-[13px] font-normal leading-relaxed max-w-sm">
              Generate deep AI-powered audit reports on any token — liquidity depth, holder distribution, smart money flows, and narrative positioning.
            </p>
            <ResearchVisual />
          </BentoCard>

          {/* ── CARD 2: Live Signals (Top Right — spans 4 cols) ── */}
          <BentoCard className="md:col-span-3 lg:col-span-4" delay={0.06}>
            <span className="text-[#16A34A] text-[9px] uppercase tracking-[0.16em] font-semibold">Live Signals</span>
            <h3 className="text-[#111827] text-[18px] font-semibold tracking-tight leading-snug mt-2 mb-1">
              Real-Time Alert Detection
            </h3>
            <p className="text-[#6B7280] text-[12px] font-normal leading-relaxed">
              Monitor whale movements, liquidity spikes, and volume anomalies across 12+ chains.
            </p>
            <SignalsVisual />
          </BentoCard>

          {/* ── CARD 3: Token Scoring (Right column — spans 3 cols) ── */}
          <BentoCard className="md:col-span-3 lg:col-span-3 md:row-span-2" delay={0.12}>
            <span className="text-[#F97316] text-[9px] uppercase tracking-[0.16em] font-semibold">Intel Scoring</span>
            <h3 className="text-[#111827] text-[18px] font-semibold tracking-tight leading-snug mt-2 mb-1">
              Alpha Score Matrix
            </h3>
            <p className="text-[#6B7280] text-[12px] font-normal leading-relaxed">
              Every token is scored across multiple vectors for instant evaluation.
            </p>
            <ScoringVisual />

            {/* Extra decorator */}
            <div className="mt-6 p-4 rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#9CA3AF] text-[9px] uppercase tracking-widest font-medium">Avg Score</span>
                <span className="text-[#111827] text-[16px] font-semibold font-mono">9.4<span className="text-[#9CA3AF] text-[11px] font-normal"> /10</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                <motion.div className="h-full rounded-full bg-[#7C3AED]" initial={{ width: 0 }} whileInView={{ width: "94%" }} viewport={{ once: true }} transition={{ duration: 1 }} />
              </div>
            </div>
          </BentoCard>

          {/* ── CARD 4: Chain Coverage (Bottom Middle — spans 4 cols) ── */}
          <BentoCard className="md:col-span-3 lg:col-span-4" delay={0.18}>
            <span className="text-[#3B82F6] text-[9px] uppercase tracking-[0.16em] font-semibold">Cross-Chain</span>
            <h3 className="text-[#111827] text-[18px] font-semibold tracking-tight leading-snug mt-2 mb-1">
              Multi-Network Coverage
            </h3>
            <p className="text-[#6B7280] text-[12px] font-normal leading-relaxed">
              Unified intelligence across every major blockchain — from Ethereum to Solana, Base to Arbitrum.
            </p>
            <ChainsVisual />
          </BentoCard>

          {/* ── CARD 5: Sentiment (Bottom — spans 8 cols) ── */}
          <BentoCard className="md:col-span-6 lg:col-span-8" delay={0.22}>
            <div className="flex flex-col lg:flex-row gap-6">
               <div className="flex-1">
                 <span className="text-[#DC2626] text-[9px] uppercase tracking-[0.16em] font-semibold">Sentiment Engine</span>
                 <h3 className="text-[#111827] text-[18px] font-semibold tracking-tight leading-snug mt-2 mb-1">
                   Market Confidence Index
                 </h3>
                 <p className="text-[#6B7280] text-[12px] font-normal leading-relaxed pr-6">
                   Aggregate social sentiment, on-chain momentum, and trading volume into a unified confidence matrix to instantly identify narrative shifts.
                 </p>
               </div>
               <div className="flex-1">
                 <SentimentVisual />
               </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
