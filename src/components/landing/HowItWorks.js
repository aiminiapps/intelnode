"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  RiWalletLine, RiSearchEyeLine, RiBrainLine, RiShieldCheckLine,
} from "react-icons/ri";

/* ═══════════════════════════════════════════
   CROSSHATCH — Dark variant
   ═══════════════════════════════════════════ */
function CrosshatchStrip({ className = "", color = "rgba(255,255,255,0.03)", size = "8px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

/* ═══════════════════════════════════════════
   STEPS DATA
   ═══════════════════════════════════════════ */
const STEPS = [
  {
    num: "01",
    label: "Connect",
    title: "Link Your Wallet",
    desc: "Start from any browser. Connect your Web3 wallet with a single click IntelNode instantly syncs your on chain identity as a universal key to the network.",
    bullets: [
      "Supports MetaMask, Phantom, WalletConnect & more",
      "No personal data required fully pseudonymous",
      "Instantly unlocks your INOD credit balance",
    ],
    visual: (
      <div className="w-full">
        {/* Wallet connect mockup */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
              <RiWalletLine className="text-[#A78BFA] text-lg" />
            </div>
            <div>
              <div className="text-white text-[13px] font-semibold">IntelNode Gateway</div>
              <div className="text-white/40 text-[10px] uppercase tracking-widest font-medium">Secure Uplink</div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { name: "MetaMask", color: "#F6851B", status: "Popular" },
              { name: "Phantom", color: "#AB9FF2", status: "Solana" },
              { name: "WalletConnect", color: "#3B99FC", status: "Multi-Chain" },
            ].map((w, i) => (
              <motion.div
                key={w.name}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${w.color}15`, border: `1px solid ${w.color}25` }}>
                    <RiWalletLine style={{ color: w.color }} className="text-sm" />
                  </div>
                  <span className="text-white text-[12px] font-medium">{w.name}</span>
                </div>
                <span className="text-white/30 text-[9px] uppercase tracking-widest font-medium px-2 py-0.5 rounded border border-white/[0.06]">{w.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    label: "Search",
    title: "Enter Any Token",
    desc: "Paste a contract address or search by name. IntelNode locks onto the target across all supported networks and starts pulling real-time data instantly.",
    bullets: [
      "Supports token, pair, or wallet address lookup",
      "Auto-detects chain and resolves to the top liquidity pool",
      "Displays instant price, volume, and holder snapshots",
    ],
    visual: (
      <div className="w-full">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
          {/* Search bar */}
          <div className="relative mb-5">
            <RiSearchEyeLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C3AED] text-lg" />
            <div className="w-full bg-white/[0.04] border border-[#7C3AED]/25 rounded-xl py-3.5 pl-12 pr-4 flex items-center">
              <span className="text-white/70 font-mono text-[11px] truncate">0x6982508145454Ce325dDbE47a25d4ec3d2311933</span>
              <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-px h-4 bg-[#7C3AED] ml-1 shrink-0" />
            </div>
          </div>

          {/* Resolved result */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-white/5">
                  <img src="https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg" alt="PEPE" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-white text-[12px] font-semibold">PEPE</div>
                  <div className="text-white/30 text-[9px] font-mono uppercase tracking-widest">Ethereum</div>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20">
                <RiShieldCheckLine className="text-[#4ADE80] text-[10px]" />
                <span className="text-[#4ADE80] text-[9px] font-medium uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Price", value: "$0.0000132" },
                { label: "24h Vol", value: "$485M" },
                { label: "Holders", value: "245K" },
              ].map(m => (
                <div key={m.label} className="flex flex-col">
                  <span className="text-white/25 text-[8px] uppercase tracking-widest font-medium">{m.label}</span>
                  <span className="text-white text-[11px] font-mono font-medium">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "03",
    label: "Analyze",
    title: "AI Deep Scan",
    desc: "Our neural engine processes millions of on-chain data points in seconds evaluating contract integrity, smart money patterns, social narrative, and liquidity structure.",
    bullets: [
      "Scans liquidity depth, holder concentration, and contract safety",
      "Maps smart money wallets and accumulation patterns",
      "Evaluates social sentiment and narrative positioning",
    ],
    visual: (
      <div className="w-full">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <RiBrainLine className="text-[#A78BFA] text-lg" />
            <span className="text-white text-[13px] font-semibold">Neural Processing Engine</span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Contract Verification", pct: 100, color: "#16A34A", status: "Pass" },
              { label: "Liquidity Analysis", pct: 92, color: "#7C3AED", status: "Deep" },
              { label: "Smart Money Flow", pct: 78, color: "#3B82F6", status: "Active" },
              { label: "Narrative Sentiment", pct: 85, color: "#F97316", status: "Bullish" },
            ].map((task, i) => (
              <div key={i} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-[10px] uppercase tracking-widest font-medium">{task.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-[10px] font-medium">{task.pct}%</span>
                    <span className="text-[8px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded border" style={{ color: task.color, borderColor: `${task.color}30`, backgroundColor: `${task.color}10` }}>{task.status}</span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: task.color }} initial={{ width: 0 }} whileInView={{ width: `${task.pct}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.15 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "04",
    label: "Execute",
    title: "Act on Intel",
    desc: "Receive the final intelligence report with an Alpha Score, actionable insights, and predictive matrices then execute your strategy with confidence before the market moves.",
    bullets: [
      "Structured AI report with probability matrices",
      "Alpha Score rated across 6 intelligence vectors",
      "Export, share, or track tokens for ongoing monitoring",
    ],
    visual: (
      <div className="w-full">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm relative overflow-hidden">
          {/* Left accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#16A34A] to-transparent" />

          <div className="flex items-center justify-between mb-5 pl-3">
            <div>
              <div className="text-white text-[14px] font-semibold">Intelligence Report</div>
              <div className="text-white/30 text-[9px] uppercase tracking-widest font-medium font-mono">ANALYSIS_COMPLETE : PASS</div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              <span className="text-[#4ADE80] text-[9px] font-medium uppercase tracking-widest">High Conviction</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-5 pl-3">
            {[
              { label: "Alpha Score", value: "9.6", sub: "/10" },
              { label: "Confidence", value: "94", sub: "%" },
              { label: "Risk Level", value: "Low", sub: "" },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
                <div className="text-white/30 text-[8px] uppercase tracking-widest font-medium mb-1">{m.label}</div>
                <div className="text-white text-[20px] font-semibold font-mono leading-none">{m.value}<span className="text-white/25 text-[11px]">{m.sub}</span></div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-3">
            {["Export PDF", "Track Token", "Share Report"].map(a => (
              <div key={a} className="flex-1 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center text-white/40 text-[9px] uppercase tracking-widest font-medium hover:bg-white/[0.05] transition-colors cursor-pointer">{a}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden bg-[#0F1219]">
      {/* Background textures */}
      <CrosshatchStrip className="absolute inset-0 opacity-30" color="rgba(255,255,255,0.012)" size="20px" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold text-white tracking-tight leading-tight mb-4">
            How IntelNode works, from<br />
            <span className="text-white/50">wallet to intel report</span>
          </h2>
          <p className="text-white/35 text-[15px] font-normal leading-relaxed max-w-md mx-auto">
            See how our neural engine transforms raw chain data into actionable intelligence in four seamless steps.
          </p>
        </motion.div>

        {/* ── Steps ── */}
        <div className="space-y-0 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent pointer-events-none hidden md:block" />

          {STEPS.map((step, i) => {
            const isEven = i % 2 === 0;

            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="relative"
              >
                {/* Step connector dot */}
                <div className="absolute left-1/2 -translate-x-1/2 top-12 w-3 h-3 rounded-full bg-[#0F1219] border-2 border-white/10 z-20 hidden md:block">
                  <div className="absolute inset-[3px] rounded-full bg-[#7C3AED]" />
                </div>

                {/* Content row */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-12 md:py-20 ${isEven ? "" : "md:direction-rtl"}`}>

                  {/* Text Side */}
                  <div className={`${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:order-2"}`}>
                    {/* Step number badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] mb-5 ${isEven ? "md:ml-auto" : ""}`}>
                      <span className="text-white/50 text-[10px] uppercase tracking-[0.16em] font-semibold">Step {step.num}</span>
                    </div>

                    <h3 className="text-white text-[24px] md:text-[28px] font-semibold tracking-tight leading-snug mb-3">
                      {step.title}
                    </h3>

                    <p className="text-white/40 text-[14px] font-normal leading-relaxed mb-6 max-w-md"
                       style={isEven ? { marginLeft: "auto" } : {}}>
                      {step.desc}
                    </p>

                    {/* What happens here */}
                    <div className={`${isEven ? "md:ml-auto" : ""} max-w-md`}>
                      <div className="text-white/60 text-[11px] font-semibold mb-3">What happens here:</div>
                      <div className="space-y-2">
                        {step.bullets.map((b, bi) => (
                          <div key={bi} className={`flex items-start gap-2.5 ${isEven ? "md:flex-row-reverse md:text-right" : ""}`}>
                            <span className="w-[5px] h-[5px] rounded-full bg-[#7C3AED]/60 mt-1.5 shrink-0" />
                            <span className="text-white/30 text-[12px] leading-relaxed">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visual Side */}
                  <div className={`${isEven ? "md:pl-16 md:order-2" : "md:pr-16 md:order-1"}`}>
                    {step.visual}
                  </div>
                </div>

                {/* Horizontal separator */}
                {i < STEPS.length - 1 && (
                  <div className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
