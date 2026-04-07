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
const RISK_COLORS = { LOW: "#16A34A", MEDIUM: "#7C3AED", HIGH: "#F97316", CRITICAL: "#DC2626" };
const REC_COLORS = { STRONG_BUY: "#16A34A", BUY: "#16A34A", HOLD: "#7C3AED", CAUTION: "#F97316", AVOID: "#DC2626" };

const CARD = "rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden";
const CARD_INNER = "rounded-lg border border-[#E5E7EB] bg-[#F8F9FB]";

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-[#111827] font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="text-[#6B7280] italic">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#7C3AED] text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownBlock({ text }) {
  if (!text) return null;
  return (
    <div>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="text-[#111827] font-semibold text-sm mt-3 mb-1.5 flex items-center gap-2"><div className="w-1 h-3 bg-[#7C3AED] rounded-full"/>{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="text-[#111827] font-bold text-base mt-4 mb-2 flex items-center gap-2"><div className="w-1.5 h-4 bg-[#7C3AED] rounded-full"/>{line.slice(3)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-[#6B7280] text-[13px] ml-4 list-disc marker:text-[#D1D5DB] pl-1 leading-relaxed">{renderInline(line.slice(2))}</li>;
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-[#6B7280] text-[13px] leading-relaxed mb-2">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-lg p-2.5 shadow-lg shadow-black/5">
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2.5 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color || e.stroke }} />
          <span className="text-[#9CA3AF] text-[10px] font-medium">{e.name}:</span>
          <span className="text-[#111827] font-semibold">{typeof e.value === "number" ? `$${e.value < 0.01 ? e.value.toExponential(2) : e.value.toFixed(e.value < 1 ? 6 : 2)}` : e.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ score }) {
  const cfg = score >= 8 ? { c: "#16A34A", bg: "rgba(22,163,74,0.06)", bc: "rgba(22,163,74,0.2)" }
    : score >= 6 ? { c: "#7C3AED", bg: "rgba(124,58,237,0.06)", bc: "rgba(124,58,237,0.2)" }
    : { c: "#F97316", bg: "rgba(249,115,22,0.06)", bc: "rgba(249,115,22,0.2)" };
  return (
    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border relative overflow-hidden group"
      style={{ color: cfg.c, background: cfg.bg, borderColor: cfg.bc }}>
      <span className="text-[10px] font-bold mb-0.5 opacity-60">SCORE</span>
      <span className="text-sm font-bold leading-none">{score}</span>
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
        const results = await Promise.all(uniqueAddrs.slice(0, 5).map(a => searchTokens(a).catch(() => [])));
        const pairs = results.flatMap(r => r).filter(p => p && p.priceUsd);
        const seen = new Set();
        const unique = pairs.filter(p => { const k = p.baseToken?.address; if (seen.has(k)) return false; seen.add(k); return true; });
        setSuggestions(unique.slice(0, 6).map(formatPairData).filter(Boolean));
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
    const updated = [{ name: token.name, symbol: token.symbol, address: token.address, chain: token.chain, imageUrl: token.imageUrl }, ...recentSearches.filter(r => r.address !== token.address)].slice(0, 5);
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
      const formatted = pairs.slice(0, 10).map(formatPairData).filter(Boolean);
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
      else { setSearchResults(pairs.slice(0, 10).map(formatPairData).filter(Boolean)); }
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
    if (t.alphaScore >= 8) insights.push({ type: "positive", title: "Strong Multi-Factor Signal", text: `High Intel Score (${t.alphaScore}/10) indicating strong fundamentals and momentum.` });
    else if (t.alphaScore <= 4) insights.push({ type: "negative", title: "Elevated Risk Factors", text: `Low Intel Score (${t.alphaScore}/10) suggests extreme risk.` });
    if (buyRatio > 0.65) insights.push({ type: "positive", title: "Bullish Sentiment", text: `Strong buy pressure at ${(buyRatio * 100).toFixed(0)}%.` });
    else if (buyRatio < 0.35) insights.push({ type: "negative", title: "Bearish Signal", text: `Heavy sell pressure at ${((1 - buyRatio) * 100).toFixed(0)}%.` });
    if (volLiq > 3) insights.push({ type: "warning", title: "Extreme Activity", text: `Volume is ${volLiq.toFixed(1)}x liquidity — potential wash trading or massive hype.` });
    else if (volLiq > 1) insights.push({ type: "positive", title: "Healthy Interest", text: `Good volume-to-liquidity ratio (${volLiq.toFixed(1)}x).` });
    if (t.liquidity < 50000) insights.push({ type: "negative", title: "Critical Liquidity", text: `Very low liquidity pool (${formatCurrency(t.liquidity)}) — high slippage risk.` });
    else if (t.liquidity > 1000000) insights.push({ type: "positive", title: "Deep Liquidity", text: `Massive pool (${formatCurrency(t.liquidity)}) — low slippage for whales.` });
    if (t.priceChange24h > 100) insights.push({ type: "warning", title: "Massive Pump", text: `Up +${t.priceChange24h.toFixed(0)}% in 24h — high correction risk.` });
    return insights.slice(0, 5);
  }, [selectedToken]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* ═══ HERO SEARCH HEADER ═══ */}
      <div className={`p-6 md:p-8 ${CARD} text-center overflow-visible z-20`}>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:6px_6px]" style={{ '--pattern-fg': 'rgba(124,58,237,0.1)' }} />
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2 tracking-tight">AI Research Engine</h1>
        <p className="text-[#6B7280] text-sm max-w-lg mx-auto mb-8 leading-relaxed">Cross-reference real-time on-chain data with institutional-grade AI analysis to generate comprehensive research reports.</p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 relative z-30">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-lg" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter contract address or token symbol..." className="w-full pl-12 pr-6 py-4 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB] text-[#111827] text-base placeholder:text-[#9CA3AF] focus:border-[#7C3AED]/50 focus:outline-none transition-all" />
          </div>
          <button type="submit" disabled={searching} className="btn-intel px-8 py-4 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 text-sm font-bold">
            {searching ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSearchLine className="text-lg" />}
            Analyze
          </button>
        </form>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="absolute z-50 left-1/2 -translate-x-1/2 mt-4 bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-xl shadow-xl shadow-black/5 w-[calc(100%-48px)] max-w-2xl max-h-[400px] overflow-y-auto">
              <div className="sticky top-0 px-5 py-3 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md flex justify-between items-center z-10">
                 <p className="text-[#9CA3AF] text-[10px] uppercase tracking-widest font-bold">Select Token ({searchResults.length} results)</p>
                 <button onClick={() => setSearchResults([])} className="text-[#9CA3AF] hover:text-[#111827]"><RiCloseLine/></button>
              </div>
              <div className="p-2 space-y-1">
                {searchResults.map((token, i) => (
                  <button key={i} onClick={() => selectToken(token)} className="w-full flex items-center justify-between p-3 hover:bg-[#F8F9FB] transition-colors text-left rounded-lg group">
                    <div className="flex items-center gap-4 min-w-0">
                      {token.imageUrl ? <img src={token.imageUrl} alt="" className="w-10 h-10 rounded-full ring-1 ring-[#E5E7EB]" /> : <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.06)] ring-1 ring-[#E5E7EB] flex items-center justify-center text-sm font-bold text-[#7C3AED]">{token.symbol?.slice(0, 2)}</div>}
                      <div className="min-w-0">
                        <span className="text-[#111827] font-bold text-sm block truncate group-hover:text-[#7C3AED] transition-colors">{token.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[#6B7280] text-[11px] font-mono">{token.symbol}</span>
                          <span className="px-1.5 py-0.5 border border-[#E5E7EB] rounded bg-[#F8F9FB] text-[#9CA3AF] text-[9px] uppercase font-bold">{getChainLabel(token.chain)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#111827] text-sm font-bold block">{token.price}</span>
                      <span className={`flex items-center justify-end gap-0.5 text-[11px] font-bold ${token.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                        {token.positive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}{Math.abs(token.priceChange24h || 0).toFixed(2)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ STATE 1: NO TOKEN SELECTED ═══ */}
      {!selectedToken && !searching && searchResults.length === 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`lg:col-span-2 p-6 ${CARD}`}>
             <div className="flex items-center gap-2.5 mb-6">
              <RiPulseLine className="text-[#F97316] text-lg" />
              <h3 className="text-[#111827] font-bold text-lg">Trending Projects</h3>
            </div>
            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-12"><RiLoader4Line className="text-[#7C3AED] animate-spin text-3xl opacity-50" /></div>
            ) : suggestions.length === 0 ? (
              <p className="text-[#9CA3AF] text-sm text-center py-6">No trending data available</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {suggestions.map(s => (
                  <button key={s.address} onClick={() => quickAnalyze(s.address)} className={`flex items-center justify-between p-4 ${CARD_INNER} hover:border-[#7C3AED]/20 transition-all text-left group`}>
                    <div className="flex items-center gap-4 min-w-0 relative z-10">
                      {s.imageUrl ? <img src={s.imageUrl} alt="" className="w-10 h-10 rounded-full shrink-0" /> : <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.06)] flex items-center justify-center text-[13px] font-bold text-[#7C3AED] shrink-0 border border-[#E5E7EB]">{s.symbol?.slice(0, 2)}</div>}
                      <div className="min-w-0">
                        <span className="text-[#111827] text-sm font-bold block truncate">{s.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#6B7280] text-[11px] font-mono">{s.symbol}</span>
                          <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                          <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-wider">{getChainLabel(s.chain)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 relative z-10">
                       <span className="text-[#111827] text-xs font-bold block font-mono">{s.price}</span>
                       <span className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${s.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                        {s.positive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}{Math.abs(s.priceChange24h || 0).toFixed(1)}%
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
                <div className="flex items-center gap-2 mb-4">
                  <RiHistoryLine className="text-[#9CA3AF]" />
                  <h3 className="text-[#111827] font-bold text-sm">Recent Research</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {recentSearches.map(r => (
                    <button key={r.address} onClick={() => quickAnalyze(r.address)} className={`flex items-center gap-2 px-3 py-2 ${CARD_INNER} hover:border-[#7C3AED]/20 transition-colors group`}>
                      {r.imageUrl ? <img src={r.imageUrl} alt="" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-[rgba(124,58,237,0.06)] flex items-center justify-center text-[9px] font-bold text-[#7C3AED]">{r.symbol?.slice(0, 2)}</div>}
                      <span className="text-[#6B7280] text-[11px] font-bold group-hover:text-[#111827] transition-colors">{r.symbol}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 ${CARD}`}>
              <div className="flex items-center gap-2 mb-4">
                <RiLightbulbLine className="text-[#3B82F6]" />
                <h3 className="text-[#111827] font-bold text-sm">Research Tips</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Paste direct contract addresses for the most accurate results.",
                  "Tokens with Intel Score 8+ represent premium opportunities.",
                  "Healthy Vol/Liq ratios typically sit between 0.5x and 2.5x.",
                  "Heavy accumulation is signaled by >60% buy pressure over 24h.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1.5 shrink-0 opacity-80" />
                    <span className="text-[#6B7280] text-[11px] leading-relaxed font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      )}

      {/* ═══ STATE 2: TOKEN SELECTED ═══ */}
      {selectedToken && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">

          {/* Main Token Card */}
          <div className={`p-6 md:p-8 ${CARD}`}>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               <div className="flex items-center gap-5">
                 {selectedToken.imageUrl ? <img src={selectedToken.imageUrl} alt="" className="w-20 h-20 rounded-2xl ring-2 ring-[#E5E7EB]" /> : <div className="w-20 h-20 rounded-2xl bg-[rgba(124,58,237,0.06)] ring-2 ring-[#E5E7EB] flex items-center justify-center font-bold text-[#7C3AED] text-3xl">{selectedToken.symbol?.slice(0, 2)}</div>}
                 <div>
                   <div className="flex items-center gap-3 mb-1">
                     <h2 className="text-[#111827] font-black text-2xl tracking-tight">{selectedToken.name}</h2>
                     <ScoreBadge score={selectedToken.alphaScore} />
                   </div>
                   <div className="flex items-center gap-2 mb-2 flex-wrap">
                     <span className="text-[#6B7280] font-mono text-sm">{selectedToken.symbol}</span>
                     <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                     <span className="px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FB] text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">{getChainLabel(selectedToken.chain)}</span>
                     <span className="px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FB] text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">{selectedToken.dex}</span>
                   </div>
                   <div className="flex items-baseline gap-3">
                     <span className="text-[#111827] text-3xl font-black font-mono">{selectedToken.price}</span>
                     <span className={`flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${selectedToken.positive ? "bg-[#16A34A]/8 text-[#16A34A]" : "bg-[#DC2626]/8 text-[#DC2626]"}`}>
                        {selectedToken.positive ? "+" : ""}{selectedToken.priceChange24h?.toFixed(2)}%
                     </span>
                   </div>
                 </div>
               </div>
               <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <div className="flex gap-2">
                    {selectedToken.url && (
                      <a href={selectedToken.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-[#6B7280] hover:text-[#111827] hover:border-[#7C3AED]/30 transition-colors">
                        <RiExternalLinkLine className="text-lg" />
                      </a>
                    )}
                    <button onClick={() => { setSelectedToken(null); setAiReport(null); setReportUnlocked(false); }} className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-[#6B7280] hover:text-[#DC2626] hover:border-[#DC2626]/30 transition-colors">
                      <RiCloseLine className="text-lg" />
                    </button>
                  </div>
                  {!reportUnlocked && (
                    <button onClick={unlockReport} className="w-full btn-intel px-5 py-3 flex items-center justify-center gap-2 text-sm font-bold">
                      <RiSparklingLine className="text-lg" /> Unlock AI Report ({AI_REPORT_COST} INOD)
                    </button>
                  )}
               </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">

            {/* ═══ LEFT: METRICS ═══ */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`p-1.5 ${CARD}`}>
                 <div className="grid grid-cols-2 gap-1.5">
                   {[
                    { label: "Volume 24h", value: formatCurrency(selectedToken.volume24h), icon: RiBarChartBoxLine, color: "#3B82F6" },
                    { label: "Liquidity", value: formatCurrency(selectedToken.liquidity), icon: RiWaterFlashLine, color: "#06B6D4" },
                    { label: "Market Cap", value: formatCurrency(selectedToken.marketCap), icon: RiCoinLine, color: "#8B5CF6" },
                    { label: "Pair Age", value: timeAgo(selectedToken.pairCreatedAt), icon: RiTimeLine, color: "#F59E0B" },
                   ].map(m => (
                     <div key={m.label} className={`p-4 ${CARD_INNER} flex flex-col gap-2`}>
                        <div className="flex items-center gap-1.5">
                          <m.icon className="text-[13px]" style={{ color: m.color }}/>
                          <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest">{m.label}</span>
                        </div>
                        <span className="text-[#111827] font-black text-sm">{m.value}</span>
                     </div>
                   ))}
                   <div className={`p-4 ${CARD_INNER} flex flex-col gap-2`}>
                      <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"/> 24h Buys</span>
                      <span className="text-[#16A34A] font-black text-sm">{formatNumber(selectedToken.buys24h)}</span>
                   </div>
                   <div className={`p-4 ${CARD_INNER} flex flex-col gap-2`}>
                      <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"/> 24h Sells</span>
                      <span className="text-[#DC2626] font-black text-sm">{formatNumber(selectedToken.sells24h)}</span>
                   </div>
                 </div>
              </div>

               {smartInsights.length > 0 && (
                <div className={`p-5 ${CARD}`}>
                  <div className="flex items-center justify-between mb-5 border-b border-[#E5E7EB] pb-3">
                    <div className="flex items-center gap-2">
                      <RiPulseLine className="text-[#7C3AED]" />
                      <h3 className="text-[#111827] font-bold text-sm">Live Insights</h3>
                    </div>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]"></span>
                    </span>
                  </div>
                  <div className="space-y-4">
                    {smartInsights.map((insight, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          insight.type === "positive" ? "bg-[#16A34A]" : insight.type === "negative" ? "bg-[#DC2626]" : "bg-[#F97316]"
                        }`} />
                        <div>
                          <h4 className={`text-xs font-bold mb-0.5 ${
                            insight.type === "positive" ? "text-[#16A34A]" : insight.type === "negative" ? "text-[#DC2626]" : "text-[#F97316]"
                          }`}>{insight.title}</h4>
                          <p className="text-[#6B7280] text-[11px] leading-relaxed font-medium">{insight.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`p-5 ${CARD} aspect-square flex flex-col`}>
                <div className="flex items-center gap-2 mb-2">
                  <RiRadarLine className="text-[#7C3AED]" />
                  <h3 className="text-[#111827] font-bold text-sm">Token Profile</h3>
                </div>
                <div className="flex-1 relative -mx-4 -mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#6B7280", fontSize: 9, fontWeight: "bold" }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar name="Analysis" dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.1} strokeWidth={2} />
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT: CHARTS & DOSSIER ═══ */}
            <div className="lg:col-span-8 space-y-6">

              {/* Price Chart */}
              <div className={`p-6 ${CARD} h-[320px] flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                    <RiBarChartBoxLine className="text-[#3B82F6] text-lg" />
                    <h3 className="text-[#111827] font-bold text-sm">Price Trajectory</h3>
                  </div>
                  <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest border border-[#E5E7EB] px-2 py-1 rounded bg-[#F8F9FB]">24H View</span>
                </div>
                <div className="flex-1 -ml-4 -mr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="gPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={selectedToken.positive ? "#16A34A" : "#DC2626"} stopOpacity={0.15} />
                          <stop offset="100%" stopColor={selectedToken.positive ? "#16A34A" : "#DC2626"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="t" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={10} />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={v => `$${v < 0.01 ? v.toExponential(1) : v.toFixed(v < 1 ? 4 : 2)}`} width={80} />
                      <Area type="monotone" dataKey="p" name="Price" stroke={selectedToken.positive ? "#16A34A" : "#DC2626"} fill="url(#gPrice)" strokeWidth={2.5} activeDot={{ r: 5, strokeWidth: 2, fill: "white", stroke: selectedToken.positive ? "#16A34A" : "#DC2626" }} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Research Report */}
              <div className={`border border-[#7C3AED]/15 ${CARD} relative overflow-hidden`}>
                {reportLoading ? (
                  <div className="py-24 text-center relative z-10 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] flex items-center justify-center mb-6 relative overflow-hidden">
                       <div className="absolute inset-0 bg-[#7C3AED]/5 animate-pulse"/>
                       <RiLoader4Line className="text-[#7C3AED] text-4xl animate-spin relative z-10" />
                    </div>
                    <h3 className="text-[#111827] font-bold text-lg tracking-tight mb-2">Generating Research Report...</h3>
                    <p className="text-[#6B7280] text-sm max-w-sm mx-auto font-medium">Analyzing on-chain data, liquidity structures, and market dynamics.</p>
                  </div>
                ) : aiReport ? (
                  <div className="relative z-10 p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <RiBrainLine className="text-[#7C3AED] text-2xl" />
                           <h2 className="text-[#111827] font-black text-2xl tracking-tight">Research Report</h2>
                        </div>
                        <p className="text-[#9CA3AF] text-sm font-mono">ID: {selectedToken.address.slice(0,10)}... // GEN: INTELNODE-V1</p>
                      </div>
                      <div className="flex gap-4">
                         <div className="text-right">
                           <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest block mb-1">Risk Level</span>
                           <span className="font-black text-lg uppercase px-3 py-1 rounded bg-[#F8F9FB] border border-[#E5E7EB]" style={{ color: RISK_COLORS[aiReport.riskLevel] }}>{aiReport.riskLevel}</span>
                         </div>
                         <div className="text-right">
                           <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest block mb-1">Recommendation</span>
                           <span className="font-black text-lg uppercase px-3 py-1 rounded bg-[#F8F9FB] border border-[#E5E7EB]" style={{ color: REC_COLORS[aiReport.recommendation?.split(" ")[0]] }}>{aiReport.recommendation?.split(" — ")[0] || "UNKNOWN"}</span>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><RiSparklingLine className="text-[#7C3AED]"/> Executive Summary</h4>
                        <div className="text-[#111827] text-sm font-medium leading-relaxed bg-[#7C3AED]/[0.03] border-l-2 border-[#7C3AED] p-4 rounded-r-lg">
                          <MarkdownBlock text={aiReport.summary} />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <h4 className="text-[#16A34A] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full"/> Strengths</h4>
                           <ul className="space-y-2.5">
                            {aiReport.strengths?.map((s, i) => (
                              <li key={i} className="text-[#6B7280] text-xs leading-relaxed font-medium bg-[#F8F9FB] border border-[#E5E7EB] p-3 rounded-xl flex items-start gap-3">
                                <RiArrowRightUpLine className="text-[#16A34A] text-base shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                           <h4 className="text-[#DC2626] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full"/> Risks</h4>
                           <ul className="space-y-2.5">
                            {aiReport.risks?.map((r, i) => (
                              <li key={i} className="text-[#6B7280] text-xs leading-relaxed font-medium bg-[#F8F9FB] border border-[#E5E7EB] p-3 rounded-xl flex items-start gap-3">
                                <RiArrowRightDownLine className="text-[#DC2626] text-base shrink-0 mt-0.5" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {[
                          { title: "Liquidity Analysis", content: aiReport.liquidityAnalysis },
                          { title: "Volume Dynamics", content: aiReport.volumeAnalysis },
                          { title: "Narrative", content: aiReport.narrative },
                          { title: "Price Action", content: aiReport.priceAction },
                        ].filter(s => s.content).map(section => (
                          <div key={section.title} className="bg-[#F8F9FB] p-5 rounded-xl border border-[#E5E7EB]">
                            <h4 className="text-[#111827] text-xs font-bold uppercase tracking-wider mb-3">{section.title}</h4>
                            <MarkdownBlock text={section.content} />
                          </div>
                        ))}
                      </div>
                      {aiReport.keyInsights && (
                        <div>
                          <h4 className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><RiStarLine className="text-[#F59E0B]"/> Key Insights</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {aiReport.keyInsights.map((insight, i) => (
                              <div key={i} className="p-4 rounded-xl border border-[#F59E0B]/15 bg-[#F59E0B]/[0.03] flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-[#F59E0B]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#F59E0B] text-[10px] font-black">{i+1}</span></div>
                                <span className="text-[#6B7280] text-xs leading-relaxed font-medium">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiReport.recommendation?.includes(" — ") && (
                        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
                          <h4 className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><RiAlertLine className="text-[#111827]"/> Final Recommendation</h4>
                          <div className="p-5 rounded-xl border border-[#7C3AED]/15 bg-[rgba(124,58,237,0.03)]">
                            <MarkdownBlock text={aiReport.recommendation} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center relative z-10 px-6">
                    <div className="w-24 h-24 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-6 group">
                       <RiLockLine className="text-[#9CA3AF] text-4xl group-hover:text-[#7C3AED] transition-colors" />
                    </div>
                    <h3 className="text-[#111827] font-black text-2xl tracking-tight mb-3">Report Locked</h3>
                    <p className="text-[#6B7280] text-sm max-w-md mx-auto leading-relaxed mb-8">Unlock the full AI research report including risk profiling, market analysis, and actionable recommendations.</p>
                    <button onClick={unlockReport} className="btn-intel px-10 py-4 inline-flex items-center gap-3 font-bold text-sm">
                      <RiSparklingLine className="text-lg" /> Generate Report ({AI_REPORT_COST} INOD)
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
