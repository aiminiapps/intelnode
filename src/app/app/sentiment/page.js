"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  RiBarChartGroupedLine, RiLineChartLine, RiArrowUpSLine, RiArrowDownSLine,
  RiLoader4Line, RiFlashlightLine, RiPulseLine, RiFireLine,
  RiEmotionHappyLine, RiEmotionUnhappyLine, RiEmotionNormalLine,
  RiTimeLine, RiGlobalLine, RiExternalLinkLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";

import { getTrendingTokens, searchTokens, formatPairData, formatCurrency, getChainLabel } from "@/lib/dexscreener";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

const SECTORS = [
  { id: "all", label: "All Sectors" },
  { id: "l1", label: "Layer 1" },
  { id: "defi", label: "DeFi" },
  { id: "ai", label: "AI & Data" },
  { id: "gaming", label: "Gaming" },
  { id: "meme", label: "Meme" },
];

const SECTOR_KEYWORDS = {
  l1: ["ETH", "SOL", "AVAX", "SUI", "APT", "BNB", "NEAR", "MATIC"],
  defi: ["UNI", "AAVE", "CAKE", "CRV", "MKR", "SUSHI", "1INCH", "COMP"],
  ai: ["FET", "RNDR", "OCEAN", "AGIX", "TAO", "ARKM", "WLD", "OLAS"],
  gaming: ["AXS", "SAND", "MANA", "IMX", "GALA", "ENJ", "RONIN", "YGG"],
  meme: ["DOGE", "SHIB", "PEPE", "WIF", "BONK", "FLOKI", "BRETT", "NEIRO"],
};

function computeSentiment(token) {
  let score = 50;
  if (token.priceChange24h > 10) score += 20;
  else if (token.priceChange24h > 3) score += 12;
  else if (token.priceChange24h > 0) score += 5;
  else if (token.priceChange24h > -3) score -= 5;
  else if (token.priceChange24h > -10) score -= 12;
  else score -= 20;
  const br = token.buys24h + token.sells24h > 0 ? token.buys24h / (token.buys24h + token.sells24h) : 0.5;
  if (br > 0.65) score += 15;
  else if (br > 0.55) score += 8;
  else if (br < 0.35) score -= 15;
  else if (br < 0.45) score -= 8;
  if (token.volume24h > 5000000) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getSentimentLabel(s) {
  if (s >= 75) return { label: "Extreme Greed", color: "#16A34A", icon: RiEmotionHappyLine };
  if (s >= 60) return { label: "Greed", color: "#16A34A", icon: RiEmotionHappyLine };
  if (s >= 45) return { label: "Neutral", color: "#6B7280", icon: RiEmotionNormalLine };
  if (s >= 30) return { label: "Fear", color: "#DC2626", icon: RiEmotionUnhappyLine };
  return { label: "Extreme Fear", color: "#DC2626", icon: RiEmotionUnhappyLine };
}

function classifySector(symbol) {
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(k => symbol?.toUpperCase().includes(k))) return sector;
  }
  return "other";
}

export default function SentimentPage() {
  const { tier } = useTokens();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const trending = await getTrendingTokens();
        const unique = [...new Map((trending || []).map(t => [t.tokenAddress, t])).values()];
        const searches = unique.slice(0, 20).map(t => searchTokens(t.tokenAddress).catch(() => []));
        const results = await Promise.all(searches);
        const pairs = results.flatMap(r => r).filter(p => p?.priceUsd);
        const seen = new Set();
        const formatted = pairs.filter(p => { const k = p.baseToken?.address; if (seen.has(k)) return false; seen.add(k); return true; })
          .map(formatPairData).filter(Boolean)
          .map(t => ({ ...t, sentiment: computeSentiment(t), sector: classifySector(t.symbol) }));
        setTokens(formatted);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => tokens.filter(t => sector === "all" || t.sector === sector), [tokens, sector]);
  const avgSentiment = useMemo(() => { if (filtered.length === 0) return 50; return Math.round(filtered.reduce((a, t) => a + t.sentiment, 0) / filtered.length); }, [filtered]);
  const globalSent = getSentimentLabel(avgSentiment);

  // Sector breakdown
  const sectorBreakdown = useMemo(() => {
    return SECTORS.filter(s => s.id !== "all").map(s => {
      const sectorTokens = tokens.filter(t => t.sector === s.id);
      const avg = sectorTokens.length > 0 ? Math.round(sectorTokens.reduce((a, t) => a + t.sentiment, 0) / sectorTokens.length) : 50;
      return { ...s, avg, count: sectorTokens.length, meta: getSentimentLabel(avg) };
    });
  }, [tokens]);

  const content = (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* HERO */}
      <div className="p-6 md:p-8 rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden">
        <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none" color="rgba(0,0,0,0.04)" size="6px" />
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center shadow-sm relative mx-auto md:mx-0 mb-5 overflow-hidden">
              <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.15)" size="5px" />
              <RiBarChartGroupedLine className="text-white text-2xl relative z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2 tracking-tight">Sentiment Intelligence Matrix</h1>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-lg mx-auto md:mx-0">AI-driven social & market sentiment analysis across crypto sectors. Multi-signal fusion from volume, buy pressure, and momentum vectors.</p>
          </div>

          {/* Global Fear/Greed Gauge */}
          <div className="w-full md:w-auto max-w-xs">
            <div className="p-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-center relative overflow-hidden">
              <CrosshatchStrip className="absolute bottom-0 left-0 right-0 h-8 opacity-20 pointer-events-none" color="rgba(0,0,0,0.03)" size="8px" />
              <p className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest mb-3">Global Sentiment Index</p>
              {loading ? (
                <RiLoader4Line className="text-[#111827] text-3xl animate-spin mx-auto" />
              ) : (
                <>
                  <div className="text-5xl font-black text-[#111827] mb-1 font-mono">{avgSentiment}</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <globalSent.icon className="text-sm" style={{ color: globalSent.color }} />
                    <span className="text-sm font-bold" style={{ color: globalSent.color }}>{globalSent.label}</span>
                  </div>
                  {/* Mini gauge bar */}
                  <div className="mt-4 h-3 rounded-full bg-gradient-to-r from-[#DC2626] via-[#F97316] via-[#EAB308] via-[#16A34A] to-[#16A34A] overflow-hidden relative border border-[#E5E7EB]">
                    <div className="absolute top-0 bottom-0 w-0.5 bg-[#111827] shadow-sm z-10" style={{ left: `${avgSentiment}%` }}>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#111827] border-2 border-white shadow-sm" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#9CA3AF] font-bold uppercase tracking-widest mt-1.5">
                    <span>Fear</span>
                    <span>Greed</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTOR HEATMAP */}
      <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
        <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8F9FB] rounded-t-lg">
          <div className="flex items-center gap-2"><RiFireLine className="text-[#F97316]" /><h3 className="text-[#111827] font-bold text-sm uppercase tracking-widest">Sector Sentiment Heatmap</h3></div>
        </div>
        <div className="p-3 grid grid-cols-2 md:grid-cols-5 gap-2">
          {sectorBreakdown.map((s, i) => (
            <motion.button key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSector(s.id === sector ? "all" : s.id)}
              className={`p-4 rounded-lg border transition-all text-center relative overflow-hidden group ${sector === s.id ? "border-[#111827]/20 bg-[#111827]/[0.03] shadow-sm" : "border-[#E5E7EB] bg-white hover:border-[#111827]/10"}`}>
              <CrosshatchStrip className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" color="rgba(0,0,0,0.015)" size="8px" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2 relative z-10">{s.label}</p>
              <div className="text-2xl font-black font-mono mb-1 relative z-10" style={{ color: s.meta.color }}>{s.avg}</div>
              <div className="flex items-center justify-center gap-1 relative z-10">
                <s.meta.icon className="text-xs" style={{ color: s.meta.color }} />
                <span className="text-[10px] font-bold" style={{ color: s.meta.color }}>{s.meta.label}</span>
              </div>
              <span className="text-[9px] text-[#9CA3AF] mt-1 block relative z-10">{s.count} tokens</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* SECTOR FILTER PILLS */}
      <div className="flex gap-2 flex-wrap">
        {SECTORS.map(s => (
          <button key={s.id} onClick={() => setSector(s.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${sector === s.id ? "bg-[#111827] border-[#111827] text-white" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827]/20"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* TOKEN SENTIMENT GRID */}
      <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
        <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8F9FB] rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2"><RiPulseLine className="text-[#111827]" /><h3 className="text-[#111827] font-bold text-sm uppercase tracking-widest">Token Sentiment Stream</h3></div>
          <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest">{filtered.length} signals</span>
        </div>
        <div className="p-2 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] flex items-center justify-center mb-6 relative overflow-hidden">
                <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.03)" size="6px" />
                <RiLoader4Line className="text-[#111827] text-3xl animate-spin relative z-10" />
              </div>
              <h3 className="text-[#111827] font-bold text-lg mb-2">Sampling Sentiment Vectors...</h3>
              <p className="text-[#6B7280] text-xs max-w-sm mx-auto text-center">Aggregating social signals, volume patterns, and momentum indicators across decentralized markets.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#6B7280] text-sm">No tokens found for this sector filter.</p>
            </div>
          ) : (
            filtered.map((token, i) => {
              const sent = getSentimentLabel(token.sentiment);
              const br = token.buys24h + token.sells24h > 0 ? Math.round((token.buys24h / (token.buys24h + token.sells24h)) * 100) : 50;
              return (
                <motion.div key={token.address + i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="p-4 rounded-lg border border-[#E5E7EB] bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-[#111827]/15 transition-all relative overflow-hidden">

                  <div className="absolute top-0 left-0 w-1.5 h-full transition-colors" style={{ backgroundColor: sent.color + "30" }} />

                  <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                    {token.imageUrl ? <img src={token.imageUrl} alt="" className="w-10 h-10 rounded-xl shrink-0 ring-1 ring-[#E5E7EB]" /> : <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] ring-1 ring-[#E5E7EB] flex items-center justify-center text-sm font-black text-[#111827] shrink-0">{token.symbol?.slice(0, 2)}</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[#111827] text-sm font-bold truncate max-w-[120px]">{token.name}</span>
                        <span className="text-[#6B7280] text-[11px] font-mono">{token.symbol}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FB] uppercase font-bold tracking-widest text-[#9CA3AF]">{getChainLabel(token.chain)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#111827] font-black text-sm">{token.price}</span>
                        <span className={`flex items-center gap-0.5 text-[11px] font-bold ${token.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                          {token.positive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}{Math.abs(token.priceChange24h || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Score + Buy-Sell Bar */}
                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto pl-2 sm:pl-0">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF]">Buy/Sell</span>
                      <div className="w-20 h-2 rounded-full bg-[#F3F4F6] overflow-hidden flex border border-[#E5E7EB]">
                        <div className="h-full bg-[#16A34A] rounded-l-full" style={{ width: `${br}%` }} />
                        <div className="h-full bg-[#DC2626] rounded-r-full flex-1" />
                      </div>
                      <div className="flex justify-between w-20 text-[8px] font-mono text-[#9CA3AF]"><span>{br}%</span><span>{100 - br}%</span></div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF]">Volume</span>
                      <span className="text-[#111827] font-mono text-xs font-bold">{formatCurrency(token.volume24h)}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg border" style={{ borderColor: sent.color + "20", backgroundColor: sent.color + "06" }}>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: sent.color }}>Sentiment</span>
                      <span className="text-xl font-black font-mono" style={{ color: sent.color }}>{token.sentiment}</span>
                      <div className="flex items-center gap-1">
                        <sent.icon className="text-[10px]" style={{ color: sent.color }} />
                        <span className="text-[9px] font-bold" style={{ color: sent.color }}>{sent.label}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return content;
}
