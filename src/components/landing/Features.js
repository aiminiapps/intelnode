"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  RiLineChartLine, RiTrophyLine, RiEyeLine, RiNotification3Line,
  RiFileChartLine, RiCheckLine, RiStarLine, RiBrainLine,
  RiDatabase2Line, RiNodeTree, RiBarChartBoxLine, RiShieldCheckLine,
  RiFlashlightLine, RiRadarLine, RiArrowRightUpLine
} from "react-icons/ri";
import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════
   CROSSHATCH STRIP
   ═══════════════════════════════════════════ */
function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.03)", size = "8px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

/* ═══════════════════════════════════════════
   TAB-BASED FEATURE DATA
   ═══════════════════════════════════════════ */
const FEATURES = [
  {
    id: "analyzer",
    tab: "AI Research",
    icon: RiBrainLine,
    title: "Institution-Grade Intelligence Reports",
    subtitle: "Generate deep AI-powered audit reports on any token. Analyze liquidity, holder distribution, smart money flows, and narrative positioning with one click.",
    highlights: ["Protocol Deep Scan", "Risk Assessment Matrix", "Narrative Classification", "Holder Distribution Map"],
    visual: "analyzer",
  },
  {
    id: "signals",
    tab: "Live Signals",
    icon: RiRadarLine,
    title: "Real-Time Market Signal Detection",
    subtitle: "Monitor whale movements, liquidity spikes, and volume anomalies across 12+ chains. Algorithmically scored alerts delivered in milliseconds.",
    highlights: ["Whale Tracking", "Volume Anomaly Detection", "Smart Money Alerts", "Cross-Chain Monitoring"],
    visual: "signals",
  },
  {
    id: "sentiment",
    tab: "Sentiment",
    icon: RiBarChartBoxLine,
    title: "Multi-Layer Sentiment Intelligence",
    subtitle: "Aggregate social sentiment, on-chain momentum, and trading volume into a unified confidence matrix. Filter by sector, chain, or narrative.",
    highlights: ["Social Signal Aggregation", "Momentum Scoring", "Sector Heat Maps", "Confidence Indices"],
    visual: "sentiment",
  },
  {
    id: "portfolio",
    tab: "Portfolio",
    icon: RiShieldCheckLine,
    title: "Autonomous Portfolio Optimization",
    subtitle: "AI-driven portfolio construction and rebalancing. Track allocation health, risk exposure, and performance metrics with institutional precision.",
    highlights: ["Allocation Engine", "Risk Analytics", "Performance Tracking", "Smart Rebalancing"],
    visual: "portfolio",
  },
];

/* ═══════════════════════════════════════════
   VISUAL SHOWCASES — One per tab
   ═══════════════════════════════════════════ */

/* Analyzer Visual — Report generation mockup */
function AnalyzerVisual() {
  return (
    <div className="w-full h-full flex items-start justify-center px-6 py-6">
      <div className="w-full max-w-[520px]">
        {/* Simulated report header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] flex items-center justify-center">
            <RiBrainLine className="text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-[#111827] text-[13px] font-semibold">$PEPE Deep Analysis</div>
            <div className="text-[#9CA3AF] text-[10px] uppercase tracking-widest font-medium">AI Executive Audit — 6 Vectors</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#16A34A]/20 bg-[#16A34A]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[#16A34A] text-[9px] font-medium uppercase tracking-widest">Complete</span>
          </div>
        </div>

        {/* Score bars */}
        <div className="space-y-3">
          {[
            { label: "Liquidity Depth", score: 92, color: "#7C3AED" },
            { label: "Holder Distribution", score: 78, color: "#3B82F6" },
            { label: "Momentum Vector", score: 85, color: "#16A34A" },
            { label: "Risk Assessment", score: 64, color: "#F97316" },
          ].map((bar, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#6B7280] text-[10px] uppercase tracking-widest font-medium">{bar.label}</span>
                <span className="text-[#111827] text-[11px] font-semibold font-mono">{bar.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: bar.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${bar.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Signals Visual — Alert feed mockup */
function SignalsVisual() {
  return (
    <div className="w-full h-full flex items-start justify-center px-6 py-6">
      <div className="w-full max-w-[520px] space-y-2.5">
        {[
          { icon: "🐋", type: "Whale Accumulation", token: "$PEPE", detail: "200 ETH block purchase detected", color: "#16A34A", time: "2m ago" },
          { icon: "📊", type: "Volume Anomaly", token: "$WIF", detail: "4.2x average volume spike on Solana", color: "#F97316", time: "8m ago" },
          { icon: "💎", type: "Smart Money Entry", token: "$FLOKI", detail: "3 tracked wallets opened positions", color: "#3B82F6", time: "14m ago" },
          { icon: "⚡", type: "Liquidity Surge", token: "$BONK", detail: "Pool depth increased by 340%", color: "#7C3AED", time: "22m ago" },
        ].map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all"
          >
            <div className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] flex items-center justify-center text-sm shrink-0">{alert.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#111827] text-[12px] font-medium">{alert.token}</span>
                <span className="text-[9px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded-full border" style={{ color: alert.color, borderColor: `${alert.color}25`, backgroundColor: `${alert.color}06` }}>{alert.type}</span>
              </div>
              <span className="text-[#6B7280] text-[11px]">{alert.detail}</span>
            </div>
            <span className="text-[#9CA3AF] text-[9px] font-mono shrink-0">{alert.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* Sentiment Visual — Heat matrix mockup */
function SentimentVisual() {
  const sectors = ["Layer 1", "DeFi", "AI & Data", "Gaming", "Meme"];
  const metrics = ["Social", "Volume", "Momentum"];
  const data = [
    [88, 72, 91], [65, 84, 58], [92, 67, 79], [45, 53, 62], [96, 88, 94]
  ];

  return (
    <div className="w-full h-full flex items-start justify-center px-6 py-6">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center gap-2 mb-5">
          <RiBarChartBoxLine className="text-[#7C3AED] text-lg" />
          <span className="text-[#111827] text-[13px] font-semibold">Sentiment Heat Matrix</span>
        </div>

        {/* Matrix header */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div />
          {metrics.map(m => (
            <div key={m} className="text-center text-[9px] uppercase tracking-widest font-medium text-[#9CA3AF]">{m}</div>
          ))}
        </div>

        {/* Matrix rows */}
        <div className="space-y-2">
          {sectors.map((sector, si) => (
            <motion.div
              key={sector}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: si * 0.08 }}
              className="grid grid-cols-4 gap-2 items-center"
            >
              <span className="text-[#111827] text-[11px] font-medium">{sector}</span>
              {data[si].map((val, mi) => {
                const color = val >= 80 ? "#16A34A" : val >= 60 ? "#3B82F6" : val >= 40 ? "#F97316" : "#DC2626";
                return (
                  <div key={mi} className="rounded-lg border border-[#E5E7EB] bg-[#FAFBFC] p-2 text-center relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-lg" style={{ backgroundColor: `${color}30` }}>
                      <motion.div className="h-full rounded-b-lg" style={{ backgroundColor: color }} initial={{ width: 0 }} whileInView={{ width: `${val}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: si * 0.08 + mi * 0.05 }} />
                    </div>
                    <span className="text-[12px] font-semibold font-mono" style={{ color }}>{val}</span>
                  </div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Portfolio Visual — Allocation breakdown mockup */
function PortfolioVisual() {
  const allocations = [
    { name: "ETH", pct: 35, color: "#7C3AED", change: "+4.2%" },
    { name: "SOL", pct: 25, color: "#3B82F6", change: "+12.8%" },
    { name: "PEPE", pct: 20, color: "#16A34A", change: "+28.1%" },
    { name: "Others", pct: 20, color: "#9CA3AF", change: "+1.4%" },
  ];

  return (
    <div className="w-full h-full flex items-start justify-center px-6 py-6">
      <div className="w-full max-w-[520px]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <RiShieldCheckLine className="text-[#7C3AED] text-lg" />
            <span className="text-[#111827] text-[13px] font-semibold">Portfolio Health</span>
          </div>
          <span className="text-[#16A34A] text-[13px] font-semibold font-mono flex items-center gap-1">
            <RiArrowRightUpLine className="text-sm" /> +8.4%
          </span>
        </div>

        {/* Allocation bar */}
        <div className="h-3 rounded-full overflow-hidden flex mb-5 bg-[#F3F4F6]">
          {allocations.map((a, i) => (
            <motion.div
              key={a.name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: a.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${a.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
          ))}
        </div>

        {/* Allocation list */}
        <div className="space-y-2">
          {allocations.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-8 rounded-full" style={{ backgroundColor: a.color }} />
                <div>
                  <span className="text-[#111827] text-[12px] font-semibold block">{a.name}</span>
                  <span className="text-[#9CA3AF] text-[10px] font-mono">{a.pct}% Allocation</span>
                </div>
              </div>
              <span className="text-[#16A34A] text-[11px] font-semibold font-mono">{a.change}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const VISUAL_MAP = {
  analyzer: <AnalyzerVisual />,
  signals: <SignalsVisual />,
  sentiment: <SentimentVisual />,
  portfolio: <PortfolioVisual />,
};

/* ═══════════════════════════════════════════
   MAIN FEATURES COMPONENT
   ═══════════════════════════════════════════ */
export default function Features() {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden bg-white">
      {/* Subtle background */}
      <CrosshatchStrip className="absolute inset-0 opacity-[0.3]" color="rgba(0,0,0,0.012)" size="24px" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold text-[#111827] tracking-tight leading-tight mb-4">
            The control center for your<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]">on-chain intelligence</span>
          </h2>
          <p className="text-[#6B7280] text-[15px] font-normal leading-relaxed max-w-md mx-auto">
            Research, signals, and portfolio tools that keep your edge sharp and consistent.
          </p>
        </motion.div>

        {/* ── Tab Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-2 mb-10 md:mb-14"
        >
          {FEATURES.map((f, i) => {
            const isActive = active === i;
            return (
              <button
                key={f.id}
                onClick={() => setActive(i)}
                className={`relative px-5 py-2.5 rounded-full text-[11px] md:text-[12px] uppercase tracking-[0.12em] font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#111827] text-white shadow-[0_2px_8px_rgba(17,24,39,0.2),0_1px_0_0_#0A0E17]"
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FB]"
                }`}
              >
                {f.tab}
              </button>
            );
          })}
        </motion.div>

        {/* ── Content Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="relative"
        >
          {/* Outer dashed frame */}
          <div className="absolute -inset-3 md:-inset-4 rounded-[32px] border border-dashed border-[#E5E7EB]/70 pointer-events-none" />

          {/* Main card */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.04)]">
            
            {/* Top info bar */}
            <div className="border-b border-[#E5E7EB] px-8 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const f = FEATURES[active];
                  const Icon = f.icon;
                  return (
                    <>
                      <div className="w-10 h-10 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] flex items-center justify-center">
                        <Icon className="text-[#7C3AED] text-lg" />
                      </div>
                      <div>
                        <h3 className="text-[#111827] text-[16px] font-semibold tracking-tight">{f.title}</h3>
                        <p className="text-[#6B7280] text-[12px] font-normal leading-relaxed max-w-lg mt-0.5">{f.subtitle}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Highlight pills */}
              <div className="flex flex-wrap gap-2 shrink-0">
                {FEATURES[active].highlights.map((h, i) => (
                  <span key={i} className="text-[9px] uppercase tracking-widest font-medium text-[#6B7280] border border-dashed border-[#D1D5DB] bg-[#FAFBFC] px-3 py-1.5 rounded-full">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual showcase area */}
            <div className="relative min-h-[360px] md:min-h-[400px] bg-[#FAFBFC]">
              {/* Gradient accents — like the reference image */}
              <div className="absolute top-0 right-0 w-[40%] h-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-[#EDE9FE]/40 via-[#F5F3FF]/20 to-transparent" />
                <CrosshatchStrip className="absolute inset-0 opacity-30" color="rgba(124,58,237,0.04)" size="6px" />
              </div>

              {/* Vertical stripe accents — matching the reference */}
              <div className="absolute top-0 right-[15%] w-[1px] h-full bg-gradient-to-b from-transparent via-[#7C3AED]/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-[25%] w-[1px] h-full bg-gradient-to-b from-transparent via-[#7C3AED]/6 to-transparent pointer-events-none" />

              {/* Visual content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 w-full h-full"
                >
                  {VISUAL_MAP[FEATURES[active].visual]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Bottom feature cards — quick info grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 md:mt-16">
          {[
            { icon: RiFlashlightLine, label: "Sub-Second Alerts", desc: "Instant anomaly detection" },
            { icon: RiNodeTree, label: "12+ Chains", desc: "Cross-chain coverage" },
            { icon: RiDatabase2Line, label: "50K+ Tokens", desc: "Comprehensive dataset" },
            { icon: RiEyeLine, label: "Always Watching", desc: "24/7 monitoring network" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl border border-dashed border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all text-center group"
            >
              <div className="w-10 h-10 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] flex items-center justify-center mx-auto mb-3 group-hover:bg-[#111827] group-hover:border-[#111827] transition-colors">
                <item.icon className="text-[#9CA3AF] text-lg group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-[#111827] text-[13px] font-semibold mb-1">{item.label}</h4>
              <p className="text-[#9CA3AF] text-[11px] font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
