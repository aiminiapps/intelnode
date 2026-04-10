"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiSearchLine, RiShieldCheckLine, RiAlertLine,
  RiLockLine, RiSparklingLine, RiArrowRightUpLine,
  RiArrowRightDownLine, RiExternalLinkLine, RiCoinLine,
  RiLoader4Line, RiStarLine, RiFireLine, RiTimeLine,
  RiHistoryLine, RiCloseLine, RiLightbulbLine,
  RiBarChartBoxLine, RiPulseLine, RiArrowUpSLine, RiArrowDownSLine,
  RiRadarLine, RiBrainLine, RiWaterFlashLine
} from "react-icons/ri";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useTokens } from "@/context/TokenContext";
import { searchTokens, getTrendingTokens, formatPairData, formatCurrency, formatNumber, getChainLabel, timeAgo } from "@/lib/dexscreener";
import InsufficientTokensModal from "@/components/dashboard/InsufficientTokensModal";

const AI_REPORT_COST = 200;
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

function ScoreBadge({ score }) {
  const cfg = score >= 8 ? { c: "#16A34A", bg: "bg-green-50/50", bc: "border-green-100" }
    : score >= 6 ? { c: "#3B82F6", bg: "bg-blue-50/50", bc: "border-blue-100" }
    : { c: "#F97316", bg: "bg-orange-50/50", bc: "border-orange-100" };
  return (
    <div className={`flex flex-col items-center justify-center w-[48px] h-[48px] rounded-xl border ${cfg.bc} ${cfg.bg} relative overflow-hidden shadow-sm`}
      style={{ color: cfg.c }}>
      <span className="text-[8px] font-medium mb-0.5 tracking-widest uppercase opacity-80">Score</span>
      <span className="text-[16px] font-mono font-medium leading-none">{score}</span>
    </div>
  );
}

export default function AnalyzerPage() {
  const { balance, spendTokens, cacheAnalysis, getCachedAnalysis } = useTokens();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const boosts = await getTrendingTokens();
        const uniqueAddrs = [...new Set(boosts.slice(0, 8).map(b => b.tokenAddress))];
        const results = await Promise.all(uniqueAddrs.slice(0, 4).map(a => searchTokens(a).catch(() => [])));
        const pairs = results.flatMap(r => r).filter(p => p && p.priceUsd);
        const seen = new Set();
        const unique = pairs.filter(p => { const k = p.baseToken?.address; if (seen.has(k)) return false; seen.add(k); return true; });
        setSuggestions(unique.slice(0, 4).map(formatPairData).filter(Boolean));
      } catch (err) { console.error("Suggestions failed:", err); }
      finally { setSuggestionsLoading(false); }
    }
    loadSuggestions();
    try {
      const stored = localStorage.getItem("inod_recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  function saveRecentSearch(token) {
    const updated = [{ name: token.name, symbol: token.symbol, address: token.address, chain: token.chain, imageUrl: token.imageUrl }, ...recentSearches.filter(r => r.address !== token.address)].slice(0, 4);
    setRecentSearches(updated);
    try { localStorage.setItem("inod_recent_searches", JSON.stringify(updated)); } catch {}
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSelectedToken(null);
    setAiReport(null);
    setReportUnlocked(false);
    try {
      const pairs = await searchTokens(query.trim());
      const formatted = pairs.slice(0, 8).map(formatPairData).filter(Boolean);
      setSearchResults(formatted);
    } catch (err) { console.error("Search failed:", err); setSearchResults([]); }
    finally { setSearching(false); }
  }

  function selectToken(token) {
    setSelectedToken(token);
    setAiReport(null);
    setReportUnlocked(false);
    setSearchResults([]);
    saveRecentSearch(token);
    const cached = getCachedAnalysis(token.address);
    if (cached?.report) { setAiReport(cached.report); setReportUnlocked(true); }
  }

  async function quickAnalyze(addr) {
    setQuery(addr);
    setSearching(true);
    setSelectedToken(null);
    setAiReport(null);
    setReportUnlocked(false);
    setSearchResults([]);
    try {
      const pairs = await searchTokens(addr);
      const formatted = pairs.slice(0, 1).map(formatPairData).filter(Boolean);
      if (formatted.length > 0) { selectToken(formatted[0]); }
      else { setSearchResults(pairs.slice(0, 8).map(formatPairData).filter(Boolean)); }
    } catch (err) { console.error("Quick analyze failed:", err); }
    finally { setSearching(false); }
  }

  async function unlockReport() {
    if (balance < AI_REPORT_COST) { setShowModal(true); return; }
    const success = spendTokens(AI_REPORT_COST, `AI Research: ${selectedToken.symbol}`);
    if (!success) { setShowModal(true); return; }
    setReportLoading(true);
    setReportUnlocked(true);
    try {
      const res = await fetch("/api/ai/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenData: selectedToken }) });
      const data = await res.json();
      setAiReport(data.report);
      cacheAnalysis(selectedToken.address, { ...selectedToken, report: data.report });
    } catch (err) { console.error("AI report failed:", err); }
    finally { setReportLoading(false); }
  }

  const radarData = selectedToken ? [
    { metric: "Liquidity", value: Math.min(10, (selectedToken.liquidity / 500000) * 10) },
    { metric: "Volume", value: Math.min(10, (selectedToken.volume24h / 1000000) * 10) },
    { metric: "Txns", value: Math.min(10, ((selectedToken.buys24h + selectedToken.sells24h) / 500) * 10) },
    { metric: "Momentum", value: Math.min(10, Math.max(0, (selectedToken.priceChange24h + 50) / 10)) },
    { metric: "Buy Power", value: selectedToken.buys24h + selectedToken.sells24h > 0 ? (selectedToken.buys24h / (selectedToken.buys24h + selectedToken.sells24h)) * 10 : 5 },
    { metric: "Score", value: selectedToken.alphaScore },
  ] : [];

  const priceHistory = selectedToken ? [
    { t: "-24h", p: selectedToken.priceRaw * (1 - (selectedToken.priceChange24h || 0) / 100) },
    { t: "-6h", p: selectedToken.priceRaw * (1 - (selectedToken.priceChange6h || 0) / 100) },
    { t: "-1h", p: selectedToken.priceRaw * (1 - (selectedToken.priceChange1h || 0) / 100) },
    { t: "-5m", p: selectedToken.priceRaw * (1 - (selectedToken.priceChange5m || 0) / 100) },
    { t: "Now", p: selectedToken.priceRaw },
  ] : [];

  const smartInsights = useMemo(() => {
    if (!selectedToken) return [];
    const t = selectedToken;
    const insights = [];
    const buyRatio = t.buys24h + t.sells24h > 0 ? t.buys24h / (t.buys24h + t.sells24h) : 0.5;
    const volLiq = t.liquidity > 0 ? t.volume24h / t.liquidity : 0;
    if (t.alphaScore >= 8) insights.push({ type: "positive", title: "Strong Multi-Factor Signal", text: `High Intel Score (${t.alphaScore}/10) indicating sustained fundamentals and momentum logic.` });
    else if (t.alphaScore <= 4) insights.push({ type: "negative", title: "Elevated Risk Factors", text: `Low Intel Score (${t.alphaScore}/10) implies extreme systematic risk.` });
    if (buyRatio > 0.65) insights.push({ type: "positive", title: "Bullish Sentiment", text: `Accumulation wave detected at ${(buyRatio * 100).toFixed(0)}%.` });
    else if (buyRatio < 0.35) insights.push({ type: "negative", title: "Bearish Signal", text: `Aggressive capitulation measured at ${((1 - buyRatio) * 100).toFixed(0)}%.` });
    if (volLiq > 3) insights.push({ type: "warning", title: "Extreme Activity", text: `Volume sits at ${volLiq.toFixed(1)}x liquidity — potential manipulation or intense narrative hype.` });
    else if (volLiq > 1) insights.push({ type: "positive", title: "Healthy Interest", text: `Optimal dynamic throughput (${volLiq.toFixed(1)}x ratio).` });
    if (t.liquidity < 50000) insights.push({ type: "negative", title: "Critical Liquidity", text: `Shallow liquidity floor (${formatCurrency(t.liquidity)}) — maximum slippage danger.` });
    return insights.slice(0, 4);
  }, [selectedToken]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto min-h-screen pb-12">

      {/* ═══ PREMIUM DARK HERO ═══ */}
      <div className="relative rounded-2xl bg-[#111827] p-8 md:p-12  shadow-xl border border-gray-800 text-center z-20">
        <CrosshatchStrip className="absolute inset-0 opacity-[0.06] pointer-events-none" color="rgba(255,255,255,0.8)" size="8px" />
        <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
           <h1 className="text-3xl md:text-5xl font-medium text-white mb-4 tracking-tight leading-tight">AI Research Engine</h1>
           <p className="text-white/60 text-[13px] md:text-sm leading-relaxed font-normal mb-10 max-w-xl">Deep-scan real-time liquidity protocols and cross-reference token topography with our institutional-grade semantic network to generate actionable intel.</p>

           <form onSubmit={handleSearch} className="w-full relative max-w-2xl mx-auto">
              <div className="relative">
                 <RiSearchLine className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
                 <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Deposit contract address or ticker designation..." className="w-full pl-14 pr-32 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-[14px] placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all shadow-inner backdrop-blur-md font-medium" />
                 
                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
                   <button type="submit" disabled={searching} className="px-5 py-2.5 rounded-lg bg-white text-[#111827] text-[13px] font-medium hover:bg-gray-100 transition-colors flex items-center justify-center min-w-[100px] shadow-sm">
                     {searching ? <RiLoader4Line className="animate-spin text-lg" /> : "Analyze"}
                   </button>
                 </div>
              </div>
           </form>

           <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98, opacity: 0 }} className="absolute z-50 left-1/2 -translate-x-1/2 top-[calc(100%+8px)] bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl shadow-black/10 origin-top overflow-hidden w-[95%] max-w-2xl max-h-[350px] overflow-y-auto text-left">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between z-10">
                   <span className="text-[#9CA3AF] text-[9px] uppercase tracking-widest font-medium">Results Rendered ({searchResults.length})</span>
                   <button onClick={() => setSearchResults([])} className="text-[#9CA3AF] hover:text-[#111827] transition-colors"><RiCloseLine/></button>
                </div>
                <div className="p-2 space-y-1">
                  {searchResults.map((token, i) => (
                    <button key={i} onClick={() => selectToken(token)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                       <div className="flex items-center gap-4">
                          {token.imageUrl ? 
                             <img src={token.imageUrl} alt="" className="w-9 h-9 rounded-full border border-gray-100 shadow-sm shrink-0" /> : 
                             <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] text-gray-800 font-medium shrink-0">{token.symbol?.slice(0, 2)}</div>
                          }
                          <div className="text-left">
                             <span className="text-[#111827] text-[13px] font-medium leading-tight group-hover:text-[#3B82F6] transition-colors line-clamp-1">{token.name}</span>
                             <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-[#6B7280] text-[11px] font-mono">{token.symbol}</span>
                               <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#FAFBFC] text-[#9CA3AF] tracking-wide uppercase font-medium">{getChainLabel(token.chain)}</span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-[#111827] text-[13px] font-mono font-medium block">{token.price}</span>
                          <span className={`flex items-center justify-end gap-0.5 text-[10px] font-medium mt-0.5 ${token.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                            {token.positive ? <RiArrowUpSLine className="text-[12px]" /> : <RiArrowDownSLine className="text-[12px]" />}{Math.abs(token.priceChange24h || 0).toFixed(1)}%
                          </span>
                       </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>

      {/* ═══ STATE 1: IDLE / DASHBOARD ═══ */}
      {!selectedToken && !searching && searchResults.length === 0 && (
        <div className="grid lg:grid-cols-3 gap-8 pb-12">
          
          {/* Trending Scans */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
             <div className="flex items-center gap-2 mb-2 px-1">
               <RiPulseLine className="text-[#111827] opacity-60" />
               <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Trending Scans</h3>
             </div>
             
             {suggestionsLoading ? (
               <div className={`flex flex-col items-center justify-center p-20 ${CARD} border-dashed`}>
                  <RiLoader4Line className="text-2xl animate-spin text-[#111827] mb-3" />
                  <p className="text-[#6B7280] text-[12px] font-medium">Calibrating volume grids...</p>
               </div>
             ) : suggestions.length === 0 ? (
               <div className={`p-10 text-center ${CARD} border-dashed`}><p className="text-[#6B7280] text-[12px] font-medium">Awaiting indexation vectors.</p></div>
             ) : (
               <div className="grid sm:grid-cols-2 gap-4">
                 {suggestions.map((s, i) => (
                   <button key={s.address} onClick={() => quickAnalyze(s.address)} className={`flex items-center justify-between p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all hover:-translate-y-0.5 hover:shadow-sm text-left group`}>
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                         {s.imageUrl ? 
                            <img src={s.imageUrl} alt="" className="w-10 h-10 rounded-full border border-gray-100 shadow-sm shrink-0" /> : 
                            <div className="w-10 h-10 rounded-full bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center text-[11px] text-[#111827] font-medium shrink-0 shadow-sm">{s.symbol?.slice(0, 2)}</div>
                         }
                         <div className="min-w-0">
                           <span className="text-[#111827] text-[13px] font-medium block truncate max-w-[120px]">{s.name}</span>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-[#6B7280] text-[11px] font-mono tracking-wide leading-none">{s.symbol}</span>
                             <span className="text-[9px] text-[#9CA3AF] uppercase font-medium tracking-wide leading-none border border-gray-100 px-1 rounded bg-gray-50">{getChainLabel(s.chain)}</span>
                           </div>
                         </div>
                      </div>
                      <div className="text-right shrink-0">
                         <span className="text-[#111827] text-[12px] font-medium block font-mono bg-gray-50 rounded pl-1 leading-normal mb-0.5">{s.price}</span>
                         <span className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${s.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                          {s.positive ? <RiArrowUpSLine className="text-[12px]" /> : <RiArrowDownSLine className="text-[12px]" />}{Math.abs(s.priceChange24h || 0).toFixed(1)}%
                         </span>
                      </div>
                   </button>
                 ))}
               </div>
             )}
          </motion.div>

          <div className="space-y-6">
            {recentSearches.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 ${CARD}`}>
                 <div className="flex items-center gap-2 mb-5">
                   <RiHistoryLine className="text-[#9CA3AF]" />
                   <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Query History</h3>
                 </div>
                 <div className="flex flex-wrap gap-2.5">
                   {recentSearches.map(r => (
                     <button key={r.address} onClick={() => quickAnalyze(r.address)} className="flex items-center gap-2 pr-3 pl-1.5 py-1.5 rounded-full border border-[#E5E7EB] bg-[#FAFBFC] hover:border-[#D1D5DB] hover:bg-white hover:shadow-sm transition-all group">
                       {r.imageUrl ? <img src={r.imageUrl} alt="" className="w-5 h-5 rounded-full shadow-sm" /> : <div className="w-5 h-5 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[9px] font-medium text-gray-600">{r.symbol?.slice(0, 2)}</div>}
                       <span className="text-[#4B5563] text-[11px] font-medium font-mono tracking-wide group-hover:text-[#111827] transition-colors">{r.symbol}</span>
                     </button>
                   ))}
                 </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 ${CARD}`}>
               <div className="flex items-center gap-2 mb-5">
                 <RiLightbulbLine className="text-[#111827] opacity-60" />
                 <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Engine Directives</h3>
               </div>
               <div className="space-y-4">
                 {[
                   "Deposit direct contract addresses to circumvent synthetic spoofing vectors.",
                   "Matrix tokens holding an Intel Score >8 output substantial structural dominance.",
                   "Optimal Volume/Liquidity metrics compute between 0.5x and 2.5x tolerances.",
                   "Capital formation events correlate to >60% buy friction spanning 24h intervals.",
                 ].map((tip, i) => (
                   <div key={i} className="flex items-start gap-3">
                     <RiSparklingLine className="text-[#3B82F6] text-sm shrink-0 mt-0.5 opacity-80" />
                     <p className="text-[#6B7280] text-[11px] leading-relaxed font-normal">{tip}</p>
                   </div>
                 ))}
               </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ═══ STATE 2: TOKEN SELECTED ═══ */}
      {selectedToken && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">

          {/* Active Token Module */}
          <div className={`p-6 md:p-8 ${CARD}`}>
             <CrosshatchStrip className="absolute inset-0 opacity-[0.015] pointer-events-none" size="8px" />
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               <div className="flex items-center gap-5">
                  {selectedToken.imageUrl ? 
                     <img src={selectedToken.imageUrl} alt="" className="w-16 h-16 rounded-2xl border border-gray-100 shadow-sm" /> : 
                     <div className="w-16 h-16 rounded-2xl bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center font-medium text-[#111827] text-xl shadow-sm">{selectedToken.symbol?.slice(0, 2)}</div>
                  }
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-[#111827] font-medium text-[22px] tracking-tight truncate max-w-[200px] sm:max-w-xs">{selectedToken.name}</h2>
                       <ScoreBadge score={selectedToken.alphaScore} />
                     </div>
                     <div className="flex items-center gap-2 mb-2 flex-wrap">
                       <span className="text-[#6B7280] font-mono text-[11px] tracking-wide bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{selectedToken.symbol}</span>
                       <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                       <span className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest">{getChainLabel(selectedToken.chain)} / {selectedToken.dex}</span>
                     </div>
                     <div className="flex items-baseline gap-3">
                       <span className="text-[#111827] text-2xl font-light font-mono tracking-tight">{selectedToken.price}</span>
                       <span className={`flex items-center gap-0.5 text-[11px] font-medium ${selectedToken.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                          {selectedToken.positive ? <RiArrowUpSLine className="text-[14px]" /> : <RiArrowDownSLine className="text-[14px]" />}{Math.abs(selectedToken.priceChange24h || 0).toFixed(2)}%
                       </span>
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <div className="flex gap-2">
                    {selectedToken.url && (
                      <a href={selectedToken.url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] text-[#9CA3AF] hover:text-[#111827] hover:border-[#111827]/20 hover:shadow-sm transition-all group">
                        <RiExternalLinkLine className="text-[17px] group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    <button onClick={() => { setSelectedToken(null); setAiReport(null); setReportUnlocked(false); }} className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFBFC] text-[#9CA3AF] hover:text-[#DC2626] hover:border-[#DC2626]/20 hover:bg-red-50 transition-all group">
                       <RiCloseLine className="text-[17px] group-hover:rotate-90 transition-transform" />
                    </button>
                  </div>
                  {!reportUnlocked && (
                    <button onClick={unlockReport} className="w-full px-5 py-3 rounded-xl bg-[#111827] text-white flex items-center justify-center gap-2 text-[12px] font-medium shadow-md hover:bg-[#374151] transition-all group">
                       <RiSparklingLine className="text-lg opacity-80 group-hover:rotate-12 transition-transform" /> Generate Audit ({AI_REPORT_COST} INOD)
                    </button>
                  )}
               </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">

            {/* ═══ LEFT: METRICS ═══ */}
            <div className="lg:col-span-4 space-y-6">
               <div className="flex items-center gap-2 mb-2 px-1">
                 <RiPulseLine className="text-[#111827] opacity-60" />
                 <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Core Diagnostics</h3>
               </div>
               
               <div className={`p-1.5 ${CARD}`}>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                     { label: "Volume 24h", value: formatCurrency(selectedToken.volume24h), icon: RiBarChartBoxLine, color: "#3B82F6" },
                     { label: "Liquidity", value: formatCurrency(selectedToken.liquidity), icon: RiWaterFlashLine, color: "#06B6D4" },
                     { label: "Market Cap", value: formatCurrency(selectedToken.marketCap), icon: RiCoinLine, color: "#8B5CF6" },
                     { label: "Pair Age", value: timeAgo(selectedToken.pairCreatedAt), icon: RiTimeLine, color: "#F59E0B" },
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
                       <span className="text-[#16A34A] font-mono font-medium text-[15px] leading-tight mt-auto">{formatNumber(selectedToken.buys24h)}</span>
                    </div>
                    <div className={`p-4 ${CARD_INNER} flex flex-col justify-between min-h-[95px]`}>
                       <span className="text-[#9CA3AF] text-[9px] uppercase font-medium tracking-widest flex items-center gap-1.5 leading-none mb-2"><div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"/> 24h Outflow</span>
                       <span className="text-[#DC2626] font-mono font-medium text-[15px] leading-tight mt-auto">{formatNumber(selectedToken.sells24h)}</span>
                    </div>
                  </div>
               </div>

               {smartInsights.length > 0 && (
                 <div className={`p-6 ${CARD}`}>
                   <div className="flex items-center justify-between mb-5 border-b border-[#E5E7EB] pb-4">
                     <div className="flex items-center gap-2">
                       <RiBrainLine className="text-[#3B82F6]" />
                       <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Live Feed Insights</h3>
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

            {/* ═══ RIGHT: CHARTS & DOSSIER ═══ */}
            <div className="lg:col-span-8 space-y-6">

              {/* Price Chart */}
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
                         <linearGradient id="gPrice" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor={selectedToken.positive ? "#16A34A" : "#DC2626"} stopOpacity={0.12} />
                           <stop offset="100%" stopColor={selectedToken.positive ? "#16A34A" : "#DC2626"} stopOpacity={0} />
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={false} />
                       <XAxis dataKey="t" tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} tickMargin={12} />
                       <YAxis tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={v => `$${v < 0.01 ? v.toExponential(1) : v.toFixed(v < 1 ? 4 : 2)}`} width={80} />
                       <Area type="monotone" dataKey="p" name="Price Matrix" stroke={selectedToken.positive ? "#16A34A" : "#DC2626"} fill="url(#gPrice)" strokeWidth={2} activeDot={{ r: 4, strokeWidth: 0, fill: selectedToken.positive ? "#16A34A" : "#DC2626" }} />
                       <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* AI Research Report */}
              <div className={`border border-[#111827]/10 ${CARD} relative overflow-hidden bg-[#FAFBFC]/30`}>
                {reportLoading ? (
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
                        <p className="text-[#9CA3AF] text-[10px] uppercase font-mono tracking-widest">UID: {selectedToken.address.slice(0,10)}... // INOD-V2</p>
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
                  <div className="py-24 text-center relative z-10 px-6">
                    <div className="w-20 h-20 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-6 shadow-sm group">
                       <RiLockLine className="text-[#9CA3AF] text-2xl group-hover:text-[#111827] transition-colors" />
                    </div>
                    <h3 className="text-[#111827] font-medium text-xl tracking-tight mb-3">Audit Firewall Active</h3>
                    <p className="text-[#6B7280] text-[13px] max-w-sm mx-auto leading-relaxed mb-8 font-normal">Deploy tokens to decipher the complete neural assessment outlining risks, liquidity topologies, and concluding directions.</p>
                    <button onClick={unlockReport} className="px-8 py-3.5 rounded-xl bg-[#111827] text-white flex items-center justify-center gap-2 text-[13px] font-medium shadow-md hover:bg-[#374151] transition-all mx-auto">
                      <RiSparklingLine className="text-lg opacity-80" /> Execute Computation ({AI_REPORT_COST} INOD)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <InsufficientTokensModal isOpen={showModal} onClose={() => setShowModal(false)} required={AI_REPORT_COST} balance={balance} />
    </div>
  );
}
