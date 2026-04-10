"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiStarLine, RiLoader4Line, RiLockLine,
  RiRefreshLine, RiSparklingLine,
  RiFireLine, RiShieldCheckLine, RiBarChartBoxLine,
  RiFilter3Line, RiArrowUpSLine, RiArrowDownSLine,
  RiEyeLine, RiCoinLine, RiPulseLine, RiNodeTree, RiAddLine, RiCheckLine,
  RiRadarLine, RiCloseLine, RiArrowRightUpLine, RiArrowRightDownLine,
  RiExternalLinkLine, RiBrainLine, RiAlertLine, RiTimeLine,
  RiWaterFlashLine, RiArrowLeftLine
} from "react-icons/ri";
import {
  Line, LineChart, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useTokens } from "@/context/TokenContext";
import { getTrendingTokens, getTopBoostedTokens, searchTokens, formatPairData, formatCurrency, formatNumber, getChainLabel, timeAgo } from "@/lib/dexscreener";
import InsufficientTokensModal from "@/components/dashboard/InsufficientTokensModal";

const GEM_DETAIL_COST = 100;
const RISK_COLORS = { LOW: "#16A34A", MEDIUM: "#3B82F6", HIGH: "#F97316", CRITICAL: "#DC2626" };
const REC_COLORS = { STRONG_BUY: "#16A34A", BUY: "#16A34A", HOLD: "#3B82F6", CAUTION: "#F97316", AVOID: "#DC2626" };
const CARD = "rounded-2xl border border-[#E5E7EB] bg-white relative overflow-hidden transition-all hover:border-[#D1D5DB] hover:shadow-sm";
const CARD_INNER = "rounded-xl border border-[#E5E7EB] bg-[#FAFBFC]";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-[#111827] font-medium">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="text-[#6B7280] italic">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#FAFBFC] text-[#111827] text-[11px] font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownBlock({ text }) {
  if (!text) return null;
  return (
    <div>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="text-[#111827] font-medium text-[13px] mt-4 mb-2 flex items-center gap-2 tracking-wide opacity-90"><div className="w-1 h-3 bg-[#111827] rounded-full opacity-30"/>{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="text-[#111827] font-medium text-sm mt-5 mb-3 flex items-center gap-2 tracking-wide"><div className="w-1.5 h-4 bg-[#111827] rounded-sm opacity-30"/>{line.slice(3)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-[#4B5563] text-[12px] ml-4 list-none pl-4 leading-relaxed relative mb-2 after:content-[''] after:absolute after:left-0 after:top-2.5 after:w-1.5 after:h-px after:bg-[#9CA3AF]">{renderInline(line.slice(2))}</li>;
        if (line.trim() === "") return <div key={i} className="h-3" />;
        return <p key={i} className="text-[#6B7280] text-[12px] leading-relaxed mb-3 font-normal">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-xl p-3 shadow-lg flex flex-col gap-1.5 min-w-[120px]">
      {payload.map((e, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2.5">
             <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: e.color || e.stroke }} />
             <span className="text-[#6B7280] font-medium text-[10px] uppercase tracking-wider">{e.name}</span>
          </div>
          <span className="text-[#111827] font-mono font-medium">{typeof e.value === "number" ? `$${e.value < 0.01 ? e.value.toExponential(2) : e.value.toFixed(e.value < 1 ? 6 : 2)}` : e.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ score, size = "md" }) {
  const cfg = score >= 8 ? { c: "#16A34A", bg: "bg-green-50/50", bc: "border-green-100" }
    : score >= 6 ? { c: "#3B82F6", bg: "bg-blue-50/50", bc: "border-blue-100" }
    : { c: "#F97316", bg: "bg-orange-50/50", bc: "border-orange-100" };
  const dims = size === "sm" ? "w-8 h-8" : "w-[48px] h-[48px]";
  const scoreSz = size === "sm" ? "text-[12px]" : "text-[16px]";
  const labelSz = size === "sm" ? "text-[6px]" : "text-[8px]";
  return (
    <div className={`flex flex-col items-center justify-center ${dims} rounded-xl border ${cfg.bc} ${cfg.bg} relative overflow-hidden shadow-sm`}
      style={{ color: cfg.c }}>
      <span className={`${labelSz} font-medium mb-0.5 tracking-widest uppercase opacity-80`}>Score</span>
      <span className={`${scoreSz} font-mono font-medium leading-none`}>{score}</span>
    </div>
  );
}

function getSparkline(token) {
  const b = 100;
  return [
    { v: b }, { v: b * (1 + (token.priceChange6h || 0) / 100 * 0.1) },
    { v: b * (1 + (token.priceChange6h || 0) / 100 * 0.5) },
    { v: b * (1 + (token.priceChange1h || 0) / 100 * 0.3) },
    { v: b * (1 + (token.priceChange1h || 0) / 100) },
    { v: b * (1 + (token.priceChange24h || 0) / 100 * 0.8) },
    { v: b * (1 + (token.priceChange24h || 0) / 100) },
  ];
}

const RECOMMENDED_ENTITIES = [
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance Hot (EVM)" },
  { address: "FWznbcNXWQuHTaWE9RxvQ2LdCENssh12dsznf4RiouN5", label: "Wintermute (SOL)" },
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", label: "Vitalik Core (EVM)" }
];

export default function GemsPage() {
  const { balance, spendTokens, trackedWallets, trackWallet } = useTokens();
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("alphaScore");
  const [filterChain, setFilterChain] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [unlockedGems, setUnlockedGems] = useState(new Set());
  
  // Detail view state (replaces modal)
  const [activeGem, setActiveGem] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function fetchGems() {
    setLoading(true);
    try {
      const [trending, top] = await Promise.all([getTrendingTokens(), getTopBoostedTokens()]);
      const allTokens = [...(trending || []), ...(top || [])];
      const unique = [...new Map(allTokens.map(t => [t.tokenAddress, t])).values()];
      const searchPromises = unique.slice(0, 15).map(t => searchTokens(t.tokenAddress).catch(() => []));
      const results = await Promise.all(searchPromises);
      const pairs = results.flatMap(r => r).filter(p => p && p.priceUsd);
      const seen = new Set();
      const uniquePairs = pairs.filter(p => { const k = p.baseToken?.address; if (seen.has(k)) return false; seen.add(k); return true; });
      setGems(uniquePairs.map(formatPairData).filter(Boolean));
    } catch (err) { console.error("Failed to fetch gems:", err); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchGems(); }, []);

  function unlockGem(gem) {
    if (balance < GEM_DETAIL_COST) { setShowModal(true); return; }
    const success = spendTokens(GEM_DETAIL_COST, `Intel report: ${gem.symbol}`);
    if (!success) { setShowModal(true); return; }
    setUnlockedGems(prev => new Set(prev).add(gem.address));
    viewGemReport(gem);
  }

  async function viewGemReport(gem) {
    setActiveGem(gem);
    setAiReport(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenData: gem }) });
      const data = await res.json();
      setAiReport(data.report);
    } catch (err) { console.error("AI report failed:", err); }
    finally { setAiLoading(false); }
  }

  function closeDetail() {
    setActiveGem(null);
    setAiReport(null);
  }

  const chains = useMemo(() => ["all", ...new Set(gems.map(g => g.chain))], [gems]);

  const sorted = useMemo(() => {
    let filtered = filterChain === "all" ? gems : gems.filter(g => g.chain === filterChain);
    return [...filtered].sort((a, b) => {
      if (sortBy === "alphaScore") return b.alphaScore - a.alphaScore;
      if (sortBy === "volume") return b.volume24h - a.volume24h;
      if (sortBy === "liquidity") return b.liquidity - a.liquidity;
      if (sortBy === "priceChange") return b.priceChange24h - a.priceChange24h;
      return 0;
    });
  }, [gems, sortBy, filterChain]);

  const mStats = useMemo(() => {
    if (!gems.length) return null;
    return {
      avgScore: gems.reduce((s, g) => s + g.alphaScore, 0) / gems.length,
      totalVol: gems.reduce((s, g) => s + g.volume24h, 0),
      avgChange: gems.reduce((s, g) => s + g.priceChange24h, 0) / gems.length,
      highAlpha: gems.filter(g => g.alphaScore >= 8).length,
    };
  }, [gems]);

  // Computed data for active gem detail view
  const radarData = activeGem ? [
    { metric: "Liquidity", value: Math.min(10, (activeGem.liquidity / 500000) * 10) },
    { metric: "Volume", value: Math.min(10, (activeGem.volume24h / 1000000) * 10) },
    { metric: "Txns", value: Math.min(10, ((activeGem.buys24h + activeGem.sells24h) / 500) * 10) },
    { metric: "Momentum", value: Math.min(10, Math.max(0, (activeGem.priceChange24h + 50) / 10)) },
    { metric: "Buy Power", value: activeGem.buys24h + activeGem.sells24h > 0 ? (activeGem.buys24h / (activeGem.buys24h + activeGem.sells24h)) * 10 : 5 },
    { metric: "Score", value: activeGem.alphaScore },
  ] : [];

  const priceHistory = activeGem ? [
    { t: "-24h", p: activeGem.priceRaw * (1 - (activeGem.priceChange24h || 0) / 100) },
    { t: "-6h", p: activeGem.priceRaw * (1 - (activeGem.priceChange6h || 0) / 100) },
    { t: "-1h", p: activeGem.priceRaw * (1 - (activeGem.priceChange1h || 0) / 100) },
    { t: "-5m", p: activeGem.priceRaw * (1 - (activeGem.priceChange5m || 0) / 100) },
    { t: "Now", p: activeGem.priceRaw },
  ] : [];

  const smartInsights = useMemo(() => {
    if (!activeGem) return [];
    const t = activeGem;
    const insights = [];
    const buyRatio = t.buys24h + t.sells24h > 0 ? t.buys24h / (t.buys24h + t.sells24h) : 0.5;
    const volLiq = t.liquidity > 0 ? t.volume24h / t.liquidity : 0;
    if (t.alphaScore >= 8) insights.push({ type: "positive", title: "High Conviction Target", text: `Intel Score (${t.alphaScore}/10) indicates strong structural fundamentals.` });
    else if (t.alphaScore <= 4) insights.push({ type: "negative", title: "Elevated Risk", text: `Low Intel Score (${t.alphaScore}/10) implies significant systematic exposure.` });
    if (buyRatio > 0.65) insights.push({ type: "positive", title: "Accumulation Detected", text: `Buy-side dominance at ${(buyRatio * 100).toFixed(0)}% over 24h window.` });
    else if (buyRatio < 0.35) insights.push({ type: "negative", title: "Distribution Phase", text: `Sell pressure at ${((1 - buyRatio) * 100).toFixed(0)}% — potential capitulation.` });
    if (volLiq > 3) insights.push({ type: "warning", title: "Volume Anomaly", text: `${volLiq.toFixed(1)}x volume-to-liquidity — possible manipulation or extreme narrative.` });
    else if (volLiq > 1) insights.push({ type: "positive", title: "Healthy Throughput", text: `Balanced flow dynamics (${volLiq.toFixed(1)}x ratio).` });
    if (t.liquidity < 50000) insights.push({ type: "negative", title: "Shallow Pool", text: `Liquidity floor (${formatCurrency(t.liquidity)}) — maximum slippage risk.` });
    return insights.slice(0, 4);
  }, [activeGem]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto min-h-screen pb-12">

      {/* ═══ PREMIUM DARK HERO ═══ */}
      <div className="relative rounded-2xl bg-[#111827] p-8 md:p-12 shadow-xl border border-gray-800 text-center z-20">
        <CrosshatchStrip className="absolute inset-0 opacity-[0.06] pointer-events-none" color="rgba(255,255,255,0.8)" size="8px" />
        <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
           <h1 className="text-3xl md:text-5xl font-medium text-white mb-4 tracking-tight leading-tight">Intel Feed</h1>
           <p className="text-white/60 text-[13px] md:text-sm leading-relaxed font-normal mb-8 max-w-xl">AI-ranked intelligence on high-potential projects. Curated from trending protocols, boosted tokens, and cross-chain momentum signals.</p>

           <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl">
              <div className="relative">
                <select value={filterChain} onChange={e => setFilterChain(e.target.value)}
                  className="pl-4 pr-9 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-[13px] focus:outline-none cursor-pointer focus:border-white/30 appearance-none font-medium backdrop-blur-md min-w-[140px]">
                  {chains.map(c => <option key={c} value={c} className="text-[#111827]">{c === "all" ? "All Networks" : getChainLabel(c)}</option>)}
                </select>
                <RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-sm" />
              </div>
              
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="pl-4 pr-9 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-[13px] focus:outline-none cursor-pointer focus:border-white/30 appearance-none font-medium backdrop-blur-md min-w-[140px]">
                  <option value="alphaScore" className="text-[#111827]">Intel Score ↓</option>
                  <option value="volume" className="text-[#111827]">24h Volume ↓</option>
                  <option value="liquidity" className="text-[#111827]">Liquidity ↓</option>
                  <option value="priceChange" className="text-[#111827]">Momentum ↓</option>
                </select>
                <RiFilter3Line className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none text-sm" />
              </div>

              <button onClick={fetchGems} disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-white text-[#111827] text-[13px] font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 min-w-[100px] shadow-sm">
                <RiRefreshLine className={`${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
      {/* ═══ DETAIL VIEW: FULL-PAGE REPORT ═══ */}
      {activeGem ? (
        <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
          
          {/* Back Navigation */}
          <button onClick={closeDetail} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors group">
            <RiArrowLeftLine className="text-lg group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[12px] font-medium uppercase tracking-wider">Back to Intel Feed</span>
          </button>

          {/* Active Gem Header Card */}
          <div className={`p-6 md:p-8 ${CARD}`}>
             <CrosshatchStrip className="absolute inset-0 opacity-[0.015] pointer-events-none" size="8px" />
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               <div className="flex items-center gap-5">
                  {activeGem.imageUrl ? 
                     <img src={activeGem.imageUrl} alt="" className="w-16 h-16 rounded-2xl border border-gray-100 shadow-sm" /> : 
                     <div className="w-16 h-16 rounded-2xl bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center font-medium text-[#111827] text-xl shadow-sm">{activeGem.symbol?.slice(0, 2)}</div>
                  }
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-[#111827] font-medium text-[22px] tracking-tight truncate max-w-[200px] sm:max-w-xs">{activeGem.name}</h2>
                       <ScoreBadge score={activeGem.alphaScore} />
                     </div>
                     <div className="flex items-center gap-2 mb-2 flex-wrap">
                       <span className="text-[#6B7280] font-mono text-[11px] tracking-wide bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{activeGem.symbol}</span>
                       <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                       <span className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest">{getChainLabel(activeGem.chain)} / {activeGem.dex}</span>
                     </div>
                     <div className="flex items-baseline gap-3">
                       <span className="text-[#111827] text-2xl font-light font-mono tracking-tight">{activeGem.price}</span>
                       <span className={`flex items-center gap-0.5 text-[11px] font-medium ${activeGem.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                          {activeGem.positive ? <RiArrowUpSLine className="text-[14px]" /> : <RiArrowDownSLine className="text-[14px]" />}{Math.abs(activeGem.priceChange24h || 0).toFixed(2)}%
                       </span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                  {activeGem.url && (
                    <a href={activeGem.url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] text-[#9CA3AF] hover:text-[#111827] hover:border-[#111827]/20 hover:shadow-sm transition-all group">
                      <RiExternalLinkLine className="text-[17px] group-hover:scale-110 transition-transform" />
                    </a>
                  )}
                  <button onClick={closeDetail} className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] text-[#9CA3AF] hover:text-[#DC2626] hover:border-[#DC2626]/20 hover:bg-red-50 transition-all group">
                     <RiCloseLine className="text-[17px] group-hover:rotate-90 transition-transform" />
                  </button>
               </div>
             </div>
          </div>

          {/* Price Change Ribbon */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "5m", val: activeGem.priceChange5m },
              { label: "1h", val: activeGem.priceChange1h },
              { label: "6h", val: activeGem.priceChange6h },
              { label: "24h", val: activeGem.priceChange24h },
            ].map(c => (
              <div key={c.label} className={`p-3 rounded-xl border border-[#E5E7EB] bg-white text-center`}>
                <span className="text-[#9CA3AF] text-[9px] uppercase font-medium tracking-widest block mb-1">{c.label}</span>
                <span className={`text-[14px] font-mono font-medium ${(c.val || 0) >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                  {(c.val || 0) >= 0 ? "+" : ""}{(c.val || 0).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* LEFT: Metrics + Radar */}
            <div className="lg:col-span-4 space-y-6">
               <div className="flex items-center gap-2 mb-2 px-1">
                 <RiPulseLine className="text-[#111827] opacity-60" />
                 <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Core Diagnostics</h3>
               </div>
               
               <div className={`p-1.5 ${CARD}`}>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                     { label: "Volume 24h", value: formatCurrency(activeGem.volume24h), icon: RiBarChartBoxLine, color: "#3B82F6" },
                     { label: "Liquidity", value: formatCurrency(activeGem.liquidity), icon: RiWaterFlashLine, color: "#06B6D4" },
                     { label: "Market Cap", value: formatCurrency(activeGem.marketCap), icon: RiCoinLine, color: "#8B5CF6" },
                     { label: "Pair Age", value: timeAgo(activeGem.pairCreatedAt), icon: RiTimeLine, color: "#F59E0B" },
                    ].map(m => (
                      <div key={m.label} className={`p-4 ${CARD_INNER} flex flex-col justify-between min-h-[95px]`}>
                         <div className="flex items-center gap-1.5 mb-2">
                           <m.icon className="text-[14px]" style={{ color: m.color }}/>
                           <span className="text-[#9CA3AF] text-[9px] uppercase font-medium tracking-widest leading-none">{m.label}</span>
                         </div>
                         <span className="text-[#111827] font-mono font-medium text-[15px] leading-tight mt-auto">{m.value}</span>
                      </div>
                    ))}
                    <div className={`p-4 ${CARD_INNER} flex flex-col justify-between min-h-[95px]`}>
                       <span className="text-[#9CA3AF] text-[9px] uppercase font-medium tracking-widest flex items-center gap-1.5 leading-none mb-2"><div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"/> 24h Inflow</span>
                       <span className="text-[#16A34A] font-mono font-medium text-[15px] leading-tight mt-auto">{formatNumber(activeGem.buys24h)}</span>
                    </div>
                    <div className={`p-4 ${CARD_INNER} flex flex-col justify-between min-h-[95px]`}>
                       <span className="text-[#9CA3AF] text-[9px] uppercase font-medium tracking-widest flex items-center gap-1.5 leading-none mb-2"><div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"/> 24h Outflow</span>
                       <span className="text-[#DC2626] font-mono font-medium text-[15px] leading-tight mt-auto">{formatNumber(activeGem.sells24h)}</span>
                    </div>
                  </div>
               </div>

               {smartInsights.length > 0 && (
                 <div className={`p-6 ${CARD}`}>
                   <div className="flex items-center justify-between mb-5 border-b border-[#E5E7EB] pb-4">
                     <div className="flex items-center gap-2">
                       <RiBrainLine className="text-[#3B82F6]" />
                       <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Live Insights</h3>
                     </div>
                     <span className="flex h-2 w-2 relative">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]"></span>
                     </span>
                   </div>
                   <div className="space-y-4">
                     {smartInsights.map((insight, i) => (
                       <div key={i} className="flex gap-3 items-start border-l-2 pl-3 py-1" style={{ borderColor: insight.type === "positive" ? "#16A34A" : insight.type === "negative" ? "#DC2626" : "#F97316" }}>
                         <div>
                           <h4 className={`text-[11px] uppercase tracking-wider font-medium mb-1.5 leading-none ${
                             insight.type === "positive" ? "text-green-600/[0.8]" : insight.type === "negative" ? "text-red-600/[0.8]" : "text-orange-500/[0.8]"
                           }`}>{insight.title}</h4>
                           <p className="text-[#4B5563] text-[11px] leading-relaxed font-normal">{insight.text}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               <div className={`p-6 ${CARD} aspect-square flex flex-col`}>
                 <div className="flex items-center gap-2 mb-2">
                   <RiRadarLine className="text-[#111827] opacity-60" />
                   <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Topographical Plot</h3>
                 </div>
                 <div className="flex-1 relative -mx-4 -mb-4">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart data={radarData} outerRadius="70%">
                       <PolarGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                       <PolarAngleAxis dataKey="metric" tick={{ fill: "#6B7280", fontSize: 9, fontWeight: 500 }} />
                       <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                       <Radar name="Intel Rating" dataKey="value" stroke="#111827" fill="#111827" fillOpacity={0.06} strokeWidth={1.5} />
                       <Tooltip content={<ChartTooltip />} />
                     </RadarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </div>

            {/* RIGHT: Chart + AI Report */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-2 mt-1 px-1">
                 <div className="flex items-center gap-2">
                   <RiBarChartBoxLine className="text-[#111827] opacity-60" />
                   <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Velocity Render</h3>
                 </div>
                 <span className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest border border-dashed border-[#E5E7EB] px-2 py-1 rounded-md bg-white">24H Window</span>
              </div>
              <div className={`p-6 ${CARD} h-[320px] flex flex-col`}>
                 <div className="flex-1 -ml-4 -mr-2">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={priceHistory}>
                       <defs>
                         <linearGradient id="gPriceGem" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor={activeGem.positive ? "#16A34A" : "#DC2626"} stopOpacity={0.12} />
                           <stop offset="100%" stopColor={activeGem.positive ? "#16A34A" : "#DC2626"} stopOpacity={0} />
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={false} />
                       <XAxis dataKey="t" tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickMargin={12} />
                       <YAxis tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={v => `$${v < 0.01 ? v.toExponential(1) : v.toFixed(v < 1 ? 4 : 2)}`} width={80} />
                       <Area type="monotone" dataKey="p" name="Price Matrix" stroke={activeGem.positive ? "#16A34A" : "#DC2626"} fill="url(#gPriceGem)" strokeWidth={2} activeDot={{ r: 4, strokeWidth: 0, fill: activeGem.positive ? "#16A34A" : "#DC2626" }} />
                       <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* AI Research Report */}
              <div className={`border border-[#111827]/10 ${CARD} relative overflow-hidden bg-[#FAFBFC]/30`}>
                {aiLoading ? (
                  <div className="py-24 text-center relative z-10 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center mb-6 relative overflow-hidden">
                       <RiLoader4Line className="text-[#3B82F6] text-2xl animate-spin relative z-10" />
                    </div>
                    <h3 className="text-[#111827] font-medium text-[15px] tracking-tight mb-2">Assembling Neural Audit...</h3>
                    <p className="text-[#6B7280] text-[12px] max-w-[280px] leading-relaxed mx-auto font-normal">Structuring logic layers, querying sentiment matrices, and finalizing security footprints.</p>
                  </div>
                ) : aiReport ? (
                  <div className="relative z-10 p-6 md:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <RiShieldCheckLine className="text-[#111827] text-xl opacity-80" />
                           <h2 className="text-[#111827] font-medium text-xl tracking-tight">Executive Audit</h2>
                        </div>
                        <p className="text-[#9CA3AF] text-[10px] uppercase font-mono tracking-widest">UID: {activeGem.address.slice(0,10)}... // INOD-V2</p>
                      </div>
                      <div className="flex gap-4">
                         <div className="text-right">
                           <span className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest block mb-2">Risk Paradigm</span>
                           <span className="font-mono text-[13px] font-medium uppercase px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white shadow-sm" style={{ color: RISK_COLORS[aiReport.riskLevel] }}>{aiReport.riskLevel}</span>
                         </div>
                         <div className="text-right">
                           <span className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest block mb-2">Stance</span>
                           <span className="font-mono text-[13px] font-medium uppercase px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white shadow-sm" style={{ color: REC_COLORS[aiReport.recommendation?.split(" ")[0]] }}>{aiReport.recommendation?.split(" — ")[0] || "UNKNOWN"}</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest mb-4 flex items-center gap-2"><RiSparklingLine className="text-[#111827] opacity-60"/> Protocol Summary</h4>
                        <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-sm text-[#4B5563]">
                          <MarkdownBlock text={aiReport.summary} />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <h4 className="text-[#16A34A] text-[9px] font-medium uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"/> Bullish Vectors</h4>
                           <ul className="space-y-3">
                             {aiReport.strengths?.map((s, i) => (
                               <li key={i} className="text-[#4B5563] text-[12px] leading-relaxed font-normal bg-white border border-[#E5E7EB] p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-[#16A34A]/20 transition-colors">
                                 <RiArrowRightUpLine className="text-[#16A34A] text-sm shrink-0 mt-0.5" />
                                 <span>{s}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-[#DC2626] text-[9px] font-medium uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full"/> Bearish Constraints</h4>
                           <ul className="space-y-3">
                             {aiReport.risks?.map((r, i) => (
                               <li key={i} className="text-[#4B5563] text-[12px] leading-relaxed font-normal bg-white border border-[#E5E7EB] p-4 rounded-xl flex items-start gap-3 shadow-sm hover:border-[#DC2626]/20 transition-colors">
                                 <RiArrowRightDownLine className="text-[#DC2626] text-sm shrink-0 mt-0.5" />
                                 <span>{r}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { title: "Liquidity Blueprint", content: aiReport.liquidityAnalysis },
                          { title: "Volume Distribution", content: aiReport.volumeAnalysis },
                          { title: "Media Narrative", content: aiReport.narrative },
                          { title: "Graph Action", content: aiReport.priceAction },
                        ].filter(s => s.content).map(section => (
                          <div key={section.title} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                            <h4 className="text-[#111827] text-[10px] font-medium uppercase tracking-widest mb-4 inline-block border-b border-[#E5E7EB] pb-1 bg-white">{section.title}</h4>
                            <MarkdownBlock text={section.content} />
                          </div>
                        ))}
                      </div>
                      
                      {aiReport.keyInsights && (
                        <div>
                          <h4 className="text-[#111827] text-[10px] font-medium uppercase tracking-widest mb-4 flex items-center gap-2"><RiStarLine className="opacity-60"/> Tactical Learnings</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {aiReport.keyInsights.map((insight, i) => (
                              <div key={i} className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm flex items-start gap-4">
                                <div className="w-5 h-5 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#111827] text-[9px] font-medium">{i+1}</span></div>
                                <span className="text-[#4B5563] text-[12px] leading-relaxed font-normal">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {aiReport.recommendation?.includes(" — ") && (
                        <div className="mt-8 pt-8 border-t border-[#E5E7EB]">
                          <h4 className="text-[#111827] text-[10px] font-medium uppercase tracking-widest mb-4 flex items-center gap-2"><RiAlertLine className="opacity-60"/> Conclusive Directive</h4>
                          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#111827] opacity-10" />
                            <MarkdownBlock text={aiReport.recommendation} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center relative z-10 px-6">
                    <p className="text-[#9CA3AF] text-[13px] font-normal">Report is being assembled. If this persists, please try again.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

      ) : (
        /* ═══ FEED VIEW: GRID + SIDEBAR ═══ */
        <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-12 gap-8">

          {/* LEFT RAIL: Telemetry & Alpha Sources */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Global Network Telemetry */}
            <div className={`${CARD}`}>
              <div className="p-5 border-b border-[#E5E7EB]">
                 <div className="flex items-center gap-2">
                   <RiPulseLine className="text-[#16A34A]" />
                   <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Global Telemetry</h3>
                 </div>
              </div>
              
              {loading ? (
                 <div className="py-12 flex items-center justify-center">
                   <RiLoader4Line className="text-[#111827] text-2xl animate-spin" />
                 </div>
              ) : mStats ? (
                <div className="p-1.5 grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                  {[
                    { label: "Active Nodes", value: gems.length, icon: RiFireLine, color: "#F97316" },
                    { label: "High Conviction", value: mStats.highAlpha, icon: RiStarLine, color: "#16A34A" },
                    { label: "Network Avg", value: mStats.avgScore.toFixed(1), icon: RiShieldCheckLine, color: "#3B82F6" },
                    { label: "Volume Flux", value: formatCurrency(mStats.totalVol), icon: RiBarChartBoxLine, color: "#8B5CF6" },
                  ].map(s => (
                    <div key={s.label} className={`p-4 ${CARD_INNER} flex items-center gap-3 relative group`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-gray-100" style={{ backgroundColor: `${s.color}08`, color: s.color }}>
                        <s.icon className="text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[#9CA3AF] text-[9px] uppercase tracking-widest font-medium mb-0.5 leading-none">{s.label}</p>
                        <p className="text-[#111827] font-mono font-medium text-[14px] block truncate">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Track Alpha Sources */}
            <div className={`p-6 ${CARD}`}>
              <div className="flex items-center gap-2 mb-5">
                <RiNodeTree className="text-[#3B82F6]" />
                <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Alpha Sources</h3>
              </div>
              <p className="text-[#6B7280] text-[11px] font-normal leading-relaxed mb-5 pb-5 border-b border-[#E5E7EB]">Synchronize local signals with known smart money addresses to refine intelligence models.</p>
              
              <div className="space-y-3">
                {RECOMMENDED_ENTITIES.map((entity, i) => {
                  const isTracked = trackedWallets.some(w => w.address === entity.address);
                  return (
                    <div key={i} className={`p-3 ${CARD_INNER} flex flex-col xl:flex-row gap-2 xl:gap-0 xl:items-center justify-between`}>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[#111827] text-[12px] font-medium truncate">{entity.label}</span>
                        <span className="text-[#9CA3AF] text-[10px] font-mono truncate max-w-[120px]">{entity.address.slice(0,8)}...</span>
                      </div>
                      {isTracked ? (
                        <span className="text-[#16A34A] text-[9px] font-medium uppercase tracking-wider flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full inline-flex self-start xl:self-auto border border-green-100"><RiCheckLine/> Active</span>
                      ) : (
                        <button onClick={() => trackWallet(entity.address, entity.label)} className="text-[#6B7280] text-[9px] font-medium uppercase tracking-wider bg-white border border-[#E5E7EB] hover:border-[#111827]/20 hover:text-[#111827] transition-colors px-2 py-1 rounded-full flex items-center gap-1 shrink-0 inline-flex self-start xl:self-auto">
                          <RiAddLine className="text-xs"/> Track
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL: INTEL FEED */}
          <div className="lg:col-span-9 space-y-4">
            
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <RiRadarLine className="text-[#111827] opacity-60" />
                <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Active Intelligence</h3>
              </div>
              <span className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest border border-dashed border-[#E5E7EB] px-2 py-1 rounded-md bg-white">{sorted.length} Signals</span>
            </div>
             
            {loading ? (
              <div className={`flex flex-col items-center justify-center p-24 ${CARD} border-dashed`}>
                 <div className="w-16 h-16 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center mb-6 relative overflow-hidden">
                    <RiLoader4Line className="text-[#111827] text-2xl animate-spin relative z-10" />
                 </div>
                 <h3 className="text-[#111827] font-medium text-[15px] tracking-tight mb-2">Scanning Networks...</h3>
                 <p className="text-[#6B7280] text-[12px] max-w-[280px] leading-relaxed mx-auto font-normal text-center">Evaluating liquidity topology and generating intelligence vectors.</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className={`flex flex-col items-center justify-center p-24 ${CARD} border-dashed`}>
                 <div className="w-16 h-16 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center mb-4 shadow-sm">
                   <RiEyeLine className="text-[#9CA3AF] text-2xl" />
                 </div>
                 <h3 className="text-[#111827] font-medium text-[15px] mb-1">No Signals Detected</h3>
                 <p className="text-[#6B7280] text-[12px] font-normal max-w-xs text-center leading-relaxed">Relax filter parameters to reveal additional targets.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sorted.map((gem, i) => {
                  const buyPct = gem.buys24h + gem.sells24h > 0 ? Math.round((gem.buys24h / (gem.buys24h + gem.sells24h)) * 100) : 50;
                  const isUnlocked = unlockedGems.has(gem.address);
                  return (
                    <motion.div key={gem.address} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}
                      className={`group rounded-2xl border border-[#E5E7EB] bg-white relative overflow-hidden flex flex-col hover:border-[#D1D5DB] hover:shadow-sm transition-all`}>
                      
                      {/* Token Identity */}
                      <div className="p-4 pb-3 flex items-start justify-between relative">
                        {gem.alphaScore >= 8 && <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#16A34A]/5 rounded-full blur-2xl pointer-events-none" />}
                        
                        <div className="flex items-center gap-3 relative z-10">
                          {gem.imageUrl
                            ? <img src={gem.imageUrl} alt="" className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" />
                            : <div className="w-10 h-10 rounded-full bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center text-[11px] font-medium text-[#111827] shadow-sm">{gem.symbol?.slice(0, 2)}</div>
                          }
                          <div>
                            <h3 className="text-[#111827] font-medium text-[13px] truncate max-w-[120px] mb-0.5 leading-tight">{gem.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[#6B7280] text-[10px] font-mono">{gem.symbol}</span>
                              <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                              <span className="text-[9px] px-1 py-0.5 rounded uppercase font-medium tracking-wide bg-gray-50 border border-gray-100 text-[#9CA3AF]">{getChainLabel(gem.chain)}</span>
                            </div>
                          </div>
                        </div>
                        <ScoreBadge score={gem.alphaScore} size="sm" />
                      </div>

                      {/* Price & Sparkline */}
                      <div className="px-4 pb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[#111827] font-mono font-medium text-[18px] block leading-none mb-1">{gem.price}</span>
                          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${gem.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                            {gem.positive ? <RiArrowUpSLine className="text-[12px]" /> : <RiArrowDownSLine className="text-[12px]" />}
                            {gem.positive ? "+" : ""}{gem.priceChange24h?.toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getSparkline(gem)}>
                              <Line type="monotone" dataKey="v" stroke={gem.positive ? "#16A34A" : "#DC2626"} strokeWidth={1.5} dot={false} strokeLinecap="round" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Data Strip */}
                      <div className="mx-4 mb-3 grid grid-cols-2 gap-1.5">
                        <div className={`p-2 text-center ${CARD_INNER}`}>
                           <span className="text-[#9CA3AF] text-[8px] uppercase font-medium tracking-widest block mb-0.5">Vol 24H</span>
                           <span className="text-[#111827] font-mono text-[11px] font-medium">{formatCurrency(gem.volume24h)}</span>
                        </div>
                        <div className={`p-2 text-center ${CARD_INNER}`}>
                           <span className="text-[#9CA3AF] text-[8px] uppercase font-medium tracking-widest block mb-0.5">Liquidity</span>
                           <span className="text-[#111827] font-mono text-[11px] font-medium">{formatCurrency(gem.liquidity)}</span>
                        </div>
                      </div>

                      {/* Pressure Bar */}
                      <div className="px-4 pb-3 mt-auto">
                        <div className="flex justify-between text-[9px] items-center mb-1 font-medium uppercase tracking-widest">
                           <span className="text-[#16A34A] flex items-center gap-1">Buy <span className="opacity-70">{buyPct}%</span></span>
                           <span className="text-[#DC2626] flex items-center gap-1"><span className="opacity-70">{100 - buyPct}%</span> Sell</span>
                        </div>
                        <div className="h-1 rounded-full bg-[#F3F4F6] overflow-hidden flex">
                           <div className="h-full bg-[#16A34A] rounded-l-full transition-all duration-500 ease-out" style={{ width: `${buyPct}%` }} />
                           <div className="h-full bg-[#DC2626] rounded-r-full flex-1" />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="p-2 pt-0">
                        {!isUnlocked ? (
                          <button onClick={() => unlockGem(gem)}
                            className="w-full py-2.5 rounded-xl bg-[#FAFBFC] border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827]/20 hover:shadow-sm transition-all text-[11px] font-medium uppercase tracking-wider flex items-center justify-center gap-2">
                            <RiLockLine className="text-sm" /> Unlock Intel ({GEM_DETAIL_COST} INOD)
                          </button>
                        ) : (
                          <button onClick={() => viewGemReport(gem)} 
                            className="w-full py-2.5 rounded-xl bg-[#111827] text-white flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-wider shadow-md hover:bg-[#374151] transition-all group">
                            <RiSparklingLine className="text-sm opacity-80 group-hover:rotate-12 transition-transform" /> View Report
                          </button>
                        )}
                      </div>
                      
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <InsufficientTokensModal isOpen={showModal} onClose={() => setShowModal(false)} required={GEM_DETAIL_COST} balance={balance} />
    </div>
  );
}
