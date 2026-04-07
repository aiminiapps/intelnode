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
const RISK_COLORS = { LOW: "#22C55E", MEDIUM: "#7C3AED", HIGH: "#F97316", CRITICAL: "#FF4444" };
const REC_COLORS = { STRONG_BUY: "#22C55E", BUY: "#22C55E", HOLD: "#7C3AED", CAUTION: "#F97316", AVOID: "#FF4444" };

const CARD = "rounded-2xl border border-dashed border-[#2A2A3A]/60 bg-[#0D0D14] relative overflow-hidden";
const CARD_INNER = "rounded-xl border border-[#1E1E2E] bg-[#0A0A0F]";

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="text-[#8E8E9A] italic">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="px-1.5 py-0.5 rounded bg-[#1E1E2E] text-[#9F67FF] text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownBlock({ text }) {
  if (!text) return null;
  return (
    <div>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="text-white font-semibold text-sm mt-3 mb-1.5 flex items-center gap-2"><div className="w-1 h-3 bg-[#7C3AED] rounded-full"/>{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="text-white font-bold text-base mt-4 mb-2 flex items-center gap-2"><div className="w-1.5 h-4 bg-[#9F67FF] rounded-full"/>{line.slice(3)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-[#8E8E9A] text-[13px] ml-4 list-disc marker:text-[#333] pl-1 leading-relaxed">{renderInline(line.slice(2))}</li>;
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-[#8E8E9A] text-[13px] leading-relaxed mb-2">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0A0F]/95 backdrop-blur-xl border border-dashed border-[#2A2A3A] rounded-xl p-2.5 shadow-2xl">
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2.5 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color || e.stroke }} />
          <span className="text-[#8E8E9A] uppercase tracking-wider text-[10px] font-bold">{e.name}:</span>
          <span className="text-white font-bold">{typeof e.value === "number" ? `$${e.value < 0.01 ? e.value.toExponential(2) : e.value.toFixed(e.value < 1 ? 6 : 2)}` : e.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ score }) {
  const cfg = score >= 8 ? { c: "#22C55E", bg: "rgba(34,197,94,0.1)", bc: "rgba(34,197,94,0.3)" }
    : score >= 6 ? { c: "#7C3AED", bg: "rgba(124,58,237,0.1)", bc: "rgba(124,58,237,0.3)" }
    : { c: "#F97316", bg: "rgba(249,115,22,0.1)", bc: "rgba(249,115,22,0.3)" };
  return (
    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-dashed shadow-inner relative overflow-hidden group"
      style={{ color: cfg.c, background: cfg.bg, borderColor: cfg.bc }}>
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
      const stored = localStorage.getItem("cora_recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  function saveRecentSearch(token) {
    const updated = [{ name: token.name, symbol: token.symbol, address: token.address, chain: token.chain, imageUrl: token.imageUrl }, ...recentSearches.filter(r => r.address !== token.address)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem("cora_recent_searches", JSON.stringify(updated)); } catch {}
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
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectToken(token) {
    setSelectedToken(token);
    setAiReport(null);
    setReportUnlocked(false);
    setSearchResults([]);
    saveRecentSearch(token);
    const cached = getCachedAnalysis(token.address);
    if (cached?.report) {
      setAiReport(cached.report);
      setReportUnlocked(true);
    }
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
    const success = spendTokens(AI_REPORT_COST, `AI Forecast: ${selectedToken.symbol}`);
    if (!success) { setShowModal(true); return; }
    setReportLoading(true);
    setReportUnlocked(true);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenData: selectedToken }),
      });
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

  const pieData = selectedToken ? [
    { name: "Buys", value: selectedToken.buys24h || 1 },
    { name: "Sells", value: selectedToken.sells24h || 1 },
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
    if (t.alphaScore >= 8) insights.push({ type: "positive", title: "Strong Multi-Factor Signal", text: `High Forecast Score (${t.alphaScore}/10) indicating strong fundamentals and momentum.` });
    else if (t.alphaScore <= 4) insights.push({ type: "negative", title: "Elevated Risk Factors", text: `Low Forecast Score (${t.alphaScore}/10) suggests extreme risk.` });
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
      
      {/* ═══ GLOBAL HERO SEARCH HEADER (Always Visible) ═══ */}
      <div className={`p-6 md:p-8 ${CARD} text-center overflow-visible shadow-2xl z-20`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#7C3AED]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">AI Protocol Analyzer</h1>
        <p className="text-[#8E8E9A] text-sm max-w-lg mx-auto mb-8 leading-relaxed">Cross-reference real-time on-chain data with our proprietary AI neural engine to forecast token trajectories.</p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 relative z-30">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-5 top-1/2 -translate-y-1/2 text-[#555] text-lg" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter contract address or token symbol..." className="w-full pl-12 pr-6 py-4 rounded-xl bg-[#0A0A0F] border-2 border-dashed border-[#2A2A3A] text-white text-base placeholder:text-[#555] focus:border-[#7C3AED]/60 focus:bg-[#0D0D14] focus:outline-none transition-all shadow-inner" />
          </div>
          <button type="submit" disabled={searching} className="btn-3d px-8 py-4 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 text-sm font-bold uppercase tracking-wide">
            {searching ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSearchLine className="text-lg" />}
            Scan Network
          </button>
        </form>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="absolute z-50 left-1/2 -translate-x-1/2 mt-4 bg-[#0A0A0F]/95 backdrop-blur-xl border border-[#2A2A3A] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[calc(100%-48px)] max-w-2xl max-h-[400px] overflow-y-auto">
              <div className="sticky top-0 px-5 py-3 border-b border-[#1E1E2E] bg-[#0A0A0F]/95 backdrop-blur-md flex justify-between items-center z-10">
                 <p className="text-[#555] text-[10px] uppercase tracking-widest font-bold">Select Token ({searchResults.length} targets found)</p>
                 <button onClick={() => setSearchResults([])} className="text-[#555] hover:text-white"><RiCloseLine/></button>
              </div>
              <div className="p-2 space-y-1">
                {searchResults.map((token, i) => (
                  <button key={i} onClick={() => selectToken(token)} className="w-full flex items-center justify-between p-3 hover:bg-[#1E1E2E] transition-colors text-left rounded-lg group">
                    <div className="flex items-center gap-4 min-w-0">
                      {token.imageUrl ? <img src={token.imageUrl} alt="" className="w-10 h-10 rounded-full ring-1 ring-[#2A2A3A]" /> : <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 ring-1 ring-[#2A2A3A] flex items-center justify-center text-sm font-bold text-[#9F67FF]">{token.symbol?.slice(0, 2)}</div>}
                      <div className="min-w-0">
                        <span className="text-white font-bold text-sm block truncate group-hover:text-[#9F67FF] transition-colors">{token.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[#8E8E9A] text-[11px] font-mono">{token.symbol}</span>
                          <span className="px-1.5 py-0.5 border border-dashed border-[#2A2A3A] rounded bg-[#0A0A0F] text-[#555] text-[9px] uppercase font-bold">{getChainLabel(token.chain)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-white text-sm font-bold block bg-gradient-to-r from-white to-[#8E8E9A] bg-clip-text text-transparent">{token.price}</span>
                      <span className={`flex items-center justify-end gap-0.5 text-[11px] font-bold ${token.positive ? "text-[#22C55E]" : "text-[#FF4444]"}`}>
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
              <h3 className="text-white font-bold text-lg">Live Oracle Scanners</h3>
            </div>
            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RiLoader4Line className="text-[#9F67FF] animate-spin text-3xl opacity-50" />
              </div>
            ) : suggestions.length === 0 ? (
              <p className="text-[#555] text-sm text-center py-6">Scanner feed offline</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {suggestions.map(s => (
                  <button key={s.address} onClick={() => quickAnalyze(s.address)} className={`flex items-center justify-between p-4 ${CARD_INNER} hover:border-[#7C3AED]/40 hover:bg-[#141420] transition-all text-left group relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#7C3AED]/5 to-transparent rounded-bl-[100px] pointer-events-none" />
                    <div className="flex items-center gap-4 min-w-0 relative z-10">
                      {s.imageUrl ? <img src={s.imageUrl} alt="" className="w-10 h-10 rounded-full shrink-0 shadow-md" /> : <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[13px] font-bold text-[#9F67FF] shrink-0 border border-[#2A2A3A]">{s.symbol?.slice(0, 2)}</div>}
                      <div className="min-w-0">
                        <span className="text-white text-sm font-bold block truncate group-hover:text-white transition-colors">{s.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#8E8E9A] text-[11px] font-mono">{s.symbol}</span>
                          <span className="w-1 h-1 rounded-full bg-[#2A2A3A]" />
                          <span className="text-[#555] text-[10px] uppercase font-bold tracking-wider">{getChainLabel(s.chain)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 relative z-10">
                       <span className="text-white text-xs font-bold block font-mono">{s.price}</span>
                       <span className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${s.positive ? "text-[#22C55E]" : "text-[#FF4444]"}`}>
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
                  <RiHistoryLine className="text-[#555] " />
                  <h3 className="text-white font-bold text-sm">Recent Intel</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {recentSearches.map(r => (
                    <button key={r.address} onClick={() => quickAnalyze(r.address)} className={`flex items-center gap-2 px-3 py-2 ${CARD_INNER} hover:border-[#2A2A3A] hover:bg-[#1C1C2E] transition-colors group`}>
                      {r.imageUrl ? <img src={r.imageUrl} alt="" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[9px] font-bold text-[#9F67FF]">{r.symbol?.slice(0, 2)}</div>}
                      <div className="text-left">
                        <span className="text-[#8E8E9A] text-[11px] font-bold group-hover:text-white block transition-colors">{r.symbol}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 ${CARD} bg-[#0A0A0F]`}>
              <div className="flex items-center gap-2 mb-4">
                <RiLightbulbLine className="text-[#3B82F6] " />
                <h3 className="text-white font-bold text-sm">Oracle Guidelines</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Paste direct contract addresses for hyper-accurate targeting.",
                  "Tokens with Forecast Score 8+ represent premium algorithmic opportunities.",
                  "Healthy Vol/Liq ratios typically sit between 0.5x and 2.5x.",
                  "Heavy accumulation is signaled by >60% buy pressure over 24h.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1.5 shrink-0 opacity-80" />
                    <span className="text-[#8E8E9A] text-[11px] leading-relaxed font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      )}

      {/* ═══ STATE 2: TOKEN SELECTED (BENTO GRID DESIGN) ═══ */}
      {selectedToken && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          
          {/* Main Top Token Card */}
          <div className={`p-6 md:p-8 ${CARD} shadow-xl border-[#7C3AED]/20`}>
             <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7C3AED]/10 to-transparent blur-3xl rounded-full pointer-events-none" />
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
               
               <div className="flex items-center gap-5">
                 {selectedToken.imageUrl ? <img src={selectedToken.imageUrl} alt="" className="w-20 h-20 rounded-2xl ring-2 ring-[#1E1E2E] shadow-2xl" /> : <div className="w-20 h-20 rounded-2xl bg-[#7C3AED]/10 ring-2 ring-[#1E1E2E] flex items-center justify-center font-bold text-[#9F67FF] text-3xl shadow-2xl">{selectedToken.symbol?.slice(0, 2)}</div>}
                 <div>
                   <div className="flex items-center gap-3 mb-1">
                     <h2 className="text-white font-black text-2xl tracking-tight">{selectedToken.name}</h2>
                     <ScoreBadge score={selectedToken.alphaScore} />
                   </div>
                   <div className="flex items-center gap-2 mb-2 flex-wrap">
                     <span className="text-[#8E8E9A] font-mono text-sm">{selectedToken.symbol}</span>
                     <span className="w-1 h-1 rounded-full bg-[#333]" />
                     <span className="px-2 py-0.5 rounded border border-dashed border-[#2A2A3A] bg-[#0A0A0F] text-[#8E8E9A] text-[10px] font-bold uppercase tracking-wider">{getChainLabel(selectedToken.chain)}</span>
                     <span className="px-2 py-0.5 rounded border border-dashed border-[#2A2A3A] bg-[#0A0A0F] text-[#8E8E9A] text-[10px] font-bold uppercase tracking-wider">{selectedToken.dex}</span>
                   </div>
                   <div className="flex items-baseline gap-3">
                     <span className="text-white text-3xl font-black font-mono">{selectedToken.price}</span>
                     <span className={`flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${selectedToken.positive ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#FF4444]/10 text-[#FF4444]"}`}>
                        {selectedToken.positive ? "+" : ""}{selectedToken.priceChange24h?.toFixed(2)}%
                     </span>
                   </div>
                 </div>
               </div>

               <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <div className="flex gap-2">
                    {selectedToken.url && (
                      <a href={selectedToken.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl border border-dashed border-[#2A2A3A] bg-[#0A0A0F] text-[#8E8E9A] hover:text-white hover:border-[#7C3AED]/50 transition-colors shadow-sm">
                        <RiExternalLinkLine className="text-lg" />
                      </a>
                    )}
                    <button onClick={() => { setSelectedToken(null); setAiReport(null); setReportUnlocked(false); }} className="p-3 rounded-xl border border-dashed border-[#2A2A3A] bg-[#0A0A0F] text-[#8E8E9A] hover:text-[#FF4444] hover:border-[#FF4444]/50 transition-colors shadow-sm">
                      <RiCloseLine className="text-lg" />
                    </button>
                  </div>
                  {!reportUnlocked && (
                    <button onClick={unlockReport} className="w-full btn-3d px-5 py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-shadow">
                      <RiSparklingLine className="text-lg" /> Unlock AI Intel ({AI_REPORT_COST} CORA)
                    </button>
                  )}
               </div>

             </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* ═══ LEFT SIDEBAR: METRICS & TELEMETRY ═══ */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Dense Metrics */}
              <div className={`p-1.5 ${CARD} bg-[#0A0A0F]`}>
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
                          <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest">{m.label}</span>
                        </div>
                        <span className="text-white font-black text-sm">{m.value}</span>
                     </div>
                   ))}
                   <div className={`p-4 ${CARD_INNER} flex flex-col gap-2`}>
                      <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"/> 24h Buys</span>
                      <span className="text-[#22C55E] font-black text-sm">{formatNumber(selectedToken.buys24h)}</span>
                   </div>
                   <div className={`p-4 ${CARD_INNER} flex flex-col gap-2`}>
                      <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#FF4444]"/> 24h Sells</span>
                      <span className="text-[#FF4444] font-black text-sm">{formatNumber(selectedToken.sells24h)}</span>
                   </div>
                 </div>
              </div>

               {/* Smart Insights Telemetry Feed */}
               {smartInsights.length > 0 && (
                <div className={`p-5 ${CARD}`}>
                  <div className="flex items-center justify-between mb-5 border-b border-dashed border-[#1E1E2E] pb-3">
                    <div className="flex items-center gap-2">
                      <RiPulseLine className="text-[#9F67FF]" />
                      <h3 className="text-white font-bold text-sm">Live Telemetry</h3>
                    </div>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F67FF] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9F67FF]"></span>
                    </span>
                  </div>
                  <div className="space-y-4">
                    {smartInsights.map((insight, i) => (
                      <div key={i} className="flex gap-3 items-start relative before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-[#1E1E2E] before:-z-10 last:before:hidden">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 border-[#0D0D14] ${
                          insight.type === "positive" ? "bg-[#22C55E]" :
                          insight.type === "negative" ? "bg-[#FF4444]" :
                          insight.type === "warning" ? "bg-[#F97316]" : "bg-[#3B82F6]"
                        }`} />
                        <div>
                          <h4 className={`text-xs font-bold mb-0.5 ${
                            insight.type === "positive" ? "text-[#22C55E]" :
                            insight.type === "negative" ? "text-[#FF4444]" :
                            insight.type === "warning" ? "text-[#F97316]" : "text-[#3B82F6]"
                          }`}>{insight.title}</h4>
                          <p className="text-[#8E8E9A] text-[11px] leading-relaxed font-medium">{insight.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Radar Chart Component */}
              <div className={`p-5 ${CARD} aspect-square flex flex-col`}>
                <div className="flex items-center gap-2 mb-2">
                  <RiRadarLine className="text-[#7C3AED]" />
                  <h3 className="text-white font-bold text-sm">Vector Profile</h3>
                </div>
                <div className="flex-1 relative -mx-4 -mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="#1E1E2E" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#8E8E9A", fontSize: 9, fontWeight: "bold" }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar name="Scoring" dataKey="value" stroke="#9F67FF" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* ═══ RIGHT MAIN AREA: CHARTS & DOSSIER ═══ */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Price Area Chart */}
              <div className={`p-6 ${CARD} h-[320px] flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                    <RiBarChartBoxLine className="text-[#3B82F6] text-lg" />
                    <h3 className="text-white font-bold text-sm">Momentum Trajectory</h3>
                  </div>
                  <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest border border-dashed border-[#2A2A3A] px-2 py-1 rounded bg-[#0A0A0F]">24H View</span>
                </div>
                <div className="flex-1 -ml-4 -mr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="gPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={selectedToken.positive ? "#22C55E" : "#FF4444"} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={selectedToken.positive ? "#22C55E" : "#FF4444"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#1E1E2E" vertical={false} />
                      <XAxis dataKey="t" tick={{ fill: "#555", fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} tickMargin={10} />
                      <YAxis tick={{ fill: "#8E8E9A", fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={v => `$${v < 0.01 ? v.toExponential(1) : v.toFixed(v < 1 ? 4 : 2)}`} width={80} />
                      <Area type="monotone" dataKey="p" name="Price" stroke={selectedToken.positive ? "#22C55E" : "#FF4444"} fill="url(#gPrice)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 2, fill: "#0D0D14", stroke: selectedToken.positive ? "#22C55E" : "#FF4444" }} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#2A2A3A', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* The AI Dossier */}
              <div className={`border border-[#7C3AED]/30 ${CARD} bg-[#0A0A0F] relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_70%)] pointer-events-none" />
                
                {reportLoading ? (
                  <div className="py-24 text-center relative z-10 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-[#0D0D14] border border-[#1E1E2E] flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-[#7C3AED]/20 animate-pulse"/>
                       <RiLoader4Line className="text-[#9F67FF] text-4xl animate-spin relative z-10" />
                    </div>
                    <h3 className="text-white font-bold text-lg tracking-tight mb-2">Compiling Oracle Dossier...</h3>
                    <p className="text-[#8E8E9A] text-sm max-w-sm mx-auto font-medium">Interrogating neural networks and analyzing deep on-chain liquidity structures.</p>
                  </div>
                ) : aiReport ? (
                  <div className="relative z-10 p-6 md:p-8">
                    {/* Dossier Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-dashed border-[#2A2A3A] pb-6 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <RiBrainLine className="text-[#9F67FF] text-2xl" />
                           <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Classified Dossier</h2>
                        </div>
                        <p className="text-[#8E8E9A] text-sm font-mono opacity-80">ID: {selectedToken.address.slice(0,10)}... // GEN: ORACLE-V3</p>
                      </div>
                      <div className="flex gap-4">
                         <div className="text-right">
                           <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest block mb-1">Threat Level</span>
                           <span className="font-black text-lg uppercase px-3 py-1 rounded bg-[#0D0D14] border border-dashed border-[#1E1E2E]" style={{ color: RISK_COLORS[aiReport.riskLevel] }}>{aiReport.riskLevel}</span>
                         </div>
                         <div className="text-right">
                           <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest block mb-1">Directive</span>
                           <span className="font-black text-lg uppercase px-3 py-1 rounded bg-[#0D0D14] border border-dashed border-[#1E1E2E]" style={{ color: REC_COLORS[aiReport.recommendation?.split(" ")[0]] }}>{aiReport.recommendation?.split(" — ")[0] || "UNKNOWN"}</span>
                         </div>
                      </div>
                    </div>

                    {/* Dossier Body grid */}
                    <div className="space-y-8">
                      
                      <div>
                        <h4 className="text-[#555] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><RiSparklingLine className="text-[#9F67FF]"/> Executive Summary</h4>
                        <div className="text-white text-sm font-medium leading-relaxed bg-[#7C3AED]/5 border-l-2 border-[#7C3AED] p-4 rounded-r-lg">
                          <MarkdownBlock text={aiReport.summary} />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <h4 className="text-[#22C55E] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"/> Protocol Strengths</h4>
                           <ul className="space-y-2.5">
                            {aiReport.strengths?.map((s, i) => (
                              <li key={i} className="text-[#8E8E9A] text-xs leading-relaxed font-medium bg-[#0D0D14] border border-dashed border-[#1E1E2E] p-3 rounded-xl flex items-start gap-3">
                                <RiArrowRightUpLine className="text-[#22C55E] text-base shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                           <h4 className="text-[#FF4444] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#FF4444] rounded-full"/> Identified Risks</h4>
                           <ul className="space-y-2.5">
                            {aiReport.risks?.map((r, i) => (
                              <li key={i} className="text-[#8E8E9A] text-xs leading-relaxed font-medium bg-[#0D0D14] border border-dashed border-[#1E1E2E] p-3 rounded-xl flex items-start gap-3">
                                <RiArrowRightDownLine className="text-[#FF4444] text-base shrink-0 mt-0.5" />
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
                          { title: "Network Narrative", content: aiReport.narrative },
                          { title: "Price Action", content: aiReport.priceAction },
                        ].filter(s => s.content).map(section => (
                          <div key={section.title} className="bg-[#0D0D14] p-5 rounded-2xl border border-dashed border-[#1E1E2E]">
                            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">{section.title}</h4>
                            <div className="text-[#8E8E9A]">
                              <MarkdownBlock text={section.content} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {aiReport.keyInsights && (
                        <div>
                          <h4 className="text-[#555] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><RiStarLine className="text-[#F59E0B]"/> Neural Extraction</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {aiReport.keyInsights.map((insight, i) => (
                              <div key={i} className="p-4 rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 flex items-start gap-3">
                                <div className="w-5 h-5 rounded bg-[#F59E0B]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[#F59E0B] text-[10px] font-black">{i+1}</span></div>
                                <span className="text-[#D4D4D8] text-xs leading-relaxed font-medium">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiReport.recommendation?.includes(" — ") && (
                        <div className="mt-8 pt-6 border-t border-dashed border-[#2A2A3A]">
                          <h4 className="text-[#555] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><RiAlertLine className="text-white"/> Final Directive</h4>
                          <div className="p-5 rounded-2xl border-2 border-dashed border-[#7C3AED]/40 bg-[#7C3AED]/10 backdrop-blur-sm">
                            <MarkdownBlock text={aiReport.recommendation} />
                          </div>
                        </div>
                      )}
                      
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center relative z-10 px-6">
                    <div className="w-24 h-24 rounded-[32px] bg-[#0A0A0F] border border-dashed border-[#2A2A3A] flex items-center justify-center mx-auto mb-6 shadow-2xl relative group overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/10 to-transparent group-hover:from-[#7C3AED]/20 transition-colors blur-xl" />
                       <RiLockLine className="text-[#555] text-4xl group-hover:text-[#9F67FF] transition-colors relative z-10" />
                    </div>
                    <h3 className="text-white font-black text-2xl tracking-tight mb-3">Intelligence Locked</h3>
                    <p className="text-[#8E8E9A] text-sm max-w-md mx-auto leading-relaxed mb-8">Authorize neural extraction to access deep structural logic, risk profiling, and an algorithmic directive.</p>
                    <button onClick={unlockReport} className="btn-3d px-10 py-4 inline-flex items-center gap-3 font-bold text-sm tracking-wide">
                      <RiSparklingLine className="text-lg" /> Initiate Neural Scan ({AI_REPORT_COST} CORA)
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
