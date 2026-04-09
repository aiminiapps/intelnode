"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiLineChartLine, RiArrowUpSLine, RiArrowDownSLine,
  RiLoader4Line, RiFireLine, RiPulseLine,
  RiEmotionHappyLine, RiEmotionUnhappyLine, RiEmotionNormalLine,
  RiGlobalLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";

import { getTrendingTokens, searchTokens, formatPairData, formatCurrency, getChainLabel } from "@/lib/dexscreener";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

const SECTORS = [
  { id: "all", label: "All Assets" },
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
        const trending = await getTrendingTokens().catch(() => []);
        const unique = [...new Map((trending || []).map(t => [t.tokenAddress, t])).values()];
        
        // Guarantee at least some data for all sectors to fix empty filtering bugs
        const GUARANTEED = ["ETH", "UNI", "FET", "GALA", "PEPE", "SOL", "AAVE", "RNDR", "WIF"];
        
        const mainSearches = unique.slice(0, 10).map(t => searchTokens(t.tokenAddress).catch(() => []));
        const guaranteedSearches = GUARANTEED.map(q => searchTokens(q).catch(() => []));
        
        const results = await Promise.all([...mainSearches, ...guaranteedSearches]);
        const pairs = results.flatMap(r => r).filter(p => p?.priceUsd);
        
        const seen = new Set();
        const formatted = pairs.filter(p => { 
            const k = p.baseToken?.address; 
            if (seen.has(k)) return false; 
            seen.add(k); 
            return true; 
          })
          .map(formatPairData).filter(Boolean)
          .map(t => ({ ...t, sentiment: computeSentiment(t), sector: classifySector(t.symbol) }));
          
        setTokens(formatted.sort((a,b) => b.volume24h - a.volume24h));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => tokens.filter(t => sector === "all" || t.sector === sector), [tokens, sector]);
  
  const avgSentiment = useMemo(() => { 
    if (tokens.length === 0) return 50; 
    return Math.round(tokens.reduce((a, t) => a + t.sentiment, 0) / tokens.length); 
  }, [tokens]);
  const globalSent = getSentimentLabel(avgSentiment);

  const sectorBreakdown = useMemo(() => {
    return SECTORS.map(s => {
      if(s.id === "all") {
         return { ...s, count: tokens.length, avg: avgSentiment, meta: globalSent };
      }
      const sectorTokens = tokens.filter(t => t.sector === s.id);
      const avg = sectorTokens.length > 0 ? Math.round(sectorTokens.reduce((a, t) => a + t.sentiment, 0) / sectorTokens.length) : 50;
      return { ...s, avg, count: sectorTokens.length, meta: getSentimentLabel(avg) };
    });
  }, [tokens, avgSentiment, globalSent]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto min-h-screen pb-12">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #D1D5DB; }
      `}</style>

      {/* PREMIUM HERO BANNER */}
      <div className="relative rounded-2xl bg-[#111827] p-8 md:p-10 overflow-hidden shadow-xl border border-gray-800">
        <CrosshatchStrip className="absolute inset-0 opacity-[0.06] pointer-events-none" color="rgba(255,255,255,0.8)" size="8px" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
           <div className="flex-1 max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/10 border border-white/10 text-white/90 text-[10px] font-medium tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Analysis
             </div>
             <h1 className="text-3xl md:text-4xl font-medium text-white mb-3 tracking-tight leading-tight">Sentiment Matrix</h1>
             <p className="text-white/60 text-[13px] md:text-sm leading-relaxed font-normal">AI-driven market sentiment analysis across crypto sectors. Real-time multi-signal fusion from volume, buy pressure, and momentum vectors to gauge market fear and greed.</p>
           </div>
           
           <div className="shrink-0 flex items-center bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md shadow-lg gap-6">
             <div>
               <p className="text-white/40 text-[10px] uppercase font-medium tracking-widest mb-1.5 text-center">Global Index</p>
               <div className="flex items-center justify-center gap-2">
                 {loading ? <RiLoader4Line className="animate-spin text-3xl text-white/60" /> : <span className="text-4xl md:text-5xl font-light text-white font-mono leading-none tracking-tighter">{avgSentiment}</span>}
               </div>
             </div>
             <div className="w-px h-12 bg-white/10 hidden sm:block" />
             <div className="flex flex-col items-center sm:items-start min-w-[100px]">
               <div className="flex items-center gap-2 mb-1">
                 <globalSent.icon className="text-lg" style={{ color: globalSent.color }} />
                 <span className="text-[13px] font-medium tracking-wide" style={{ color: globalSent.color }}>{globalSent.label}</span>
               </div>
               {/* mini gauge */}
               <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 overflow-hidden relative opacity-80 mt-1">
                  <div className="absolute top-0 bottom-0 w-px bg-white z-10 transition-all duration-1000" style={{ left: `${avgSentiment}%` }}>
                     <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-sm" />
                  </div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* FILTER TABS & HEATMAP METRICS */}
      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {sectorBreakdown.map(s => {
          const isActive = sector === s.id;
          return (
            <button 
              key={s.id} 
              onClick={() => setSector(s.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-300 shrink-0 ${isActive ? 'bg-[#111827] border-[#111827] text-white shadow-md shadow-[#111827]/10' : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:border-[#111827]/20 hover:bg-gray-50'}`}
            >
              <div className="flex flex-col items-start pr-4 border-r border-dotted relative" style={{ borderColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}>
                 <span className="text-[13px] font-medium leading-none mb-1.5">{s.label}</span>
                 <span className={`text-[10px] font-normal opacity-70 leading-none`}>{s.count} assets</span>
              </div>
              <div className="flex flex-col items-start pl-1">
                 <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[15px] font-light font-mono leading-none">{s.avg}</span>
                    <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: s.meta.color }} />
                 </div>
                 <span className="text-[9px] font-medium leading-none whitespace-nowrap opacity-70" style={{ color: isActive ? 'white' : s.meta.color }}>{s.meta.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CARDS GRID */}
      <div>
         <div className="flex items-center gap-2 mb-4 px-1">
            <RiPulseLine className="text-[#111827]" />
            <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Real-time Topography Matrix</h3>
         </div>
         
         {loading ? (
             <div className="w-full flex flex-col items-center justify-center p-20 bg-white border border-[#E5E7EB] rounded-2xl border-dashed">
                <RiLoader4Line className="text-3xl animate-spin text-[#111827] mb-3" />
                <p className="text-[#6B7280] text-[13px] font-normal">Streaming live index data...</p>
             </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filtered.length === 0 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full py-16 text-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
                     <RiEmotionNormalLine className="text-3xl text-gray-300 mx-auto mb-3" />
                     <p className="text-[#4B5563] text-[13px] font-medium">No top-volume signals found for this sector presently.</p>
                   </motion.div>
                )}

                {filtered.map((token, i) => {
                  const sent = getSentimentLabel(token.sentiment);
                  const br = token.buys24h + token.sells24h > 0 ? Math.round((token.buys24h / (token.buys24h + token.sells24h)) * 100) : 50;
                  
                  return (
                    <motion.div 
                      layout
                      key={token.address + i} 
                      initial={{ opacity: 0, scale: 0.98 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative group flex flex-col overflow-hidden"
                    >
                       <div className="absolute top-0 left-0 right-0 h-1 opacity-80" style={{ backgroundColor: sent.color }} />
                       <CrosshatchStrip className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] pointer-events-none transition-opacity" size="6px" />
                       
                       <div className="flex justify-between items-start mb-6 mt-1 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                             {token.imageUrl ? 
                                <img src={token.imageUrl} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm shrink-0" alt={token.symbol} /> : 
                                <div className="w-10 h-10 rounded-full bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center text-[11px] text-[#111827] font-medium shrink-0 shadow-sm">{token.symbol?.slice(0, 2)}</div>
                             }
                             <div className="min-w-0">
                                <h3 className="text-[#111827] text-[13px] font-medium leading-tight max-w-[110px] truncate">{token.name}</h3>
                                <p className="text-[#6B7280] text-[11px] font-mono mt-1 tracking-wide">{token.symbol}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[#111827] text-[13px] font-mono font-medium leading-tight">{token.price}</p>
                             <div className={`flex items-center justify-end gap-0.5 text-[10px] font-medium mt-1 ${token.positive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                               {token.positive ? <RiArrowUpSLine className="text-xs" /> : <RiArrowDownSLine className="text-xs" />}
                               {Math.abs(token.priceChange24h || 0).toFixed(1)}%
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex-1" />
                       
                       <div className="flex justify-between items-end pt-5 border-t border-[#F3F4F6] relative z-10">
                          <div>
                             <p className="text-[#9CA3AF] text-[9px] uppercase tracking-widest mb-2 font-medium">Index Score</p>
                             <div className="flex flex-col gap-1.5">
                               <span className="text-3xl font-light font-mono leading-none tracking-tighter" style={{ color: sent.color }}>{token.sentiment}</span>
                               <div className="inline-flex items-center gap-1 bg-[#FAFBFC] px-2 py-0.5 rounded-full border border-[#E5E7EB] w-max">
                                  <sent.icon className="text-[10px]" style={{ color: sent.color }} />
                                  <span className="text-[9px] font-medium tracking-wide" style={{ color: sent.color }}>{sent.label}</span>
                               </div>
                             </div>
                          </div>
                          
                          <div className="w-24 shrink-0 text-right">
                             <p className="text-[#9CA3AF] text-[9px] uppercase tracking-widest mb-1.5 font-medium">Flow Vol</p>
                             <p className="text-[#111827] text-[11px] font-mono font-medium mb-2 leading-none">{formatCurrency(token.volume24h)}</p>
                             <div className="h-1.5 w-full rounded-full bg-[#FAFBFC] border border-[#E5E7EB] overflow-hidden flex relative">
                                <div className="h-full bg-gradient-to-r from-[#16A34A]/80 to-[#16A34A]" style={{ width: `${br}%` }} />
                                <div className="h-full bg-gradient-to-r from-[#DC2626] to-[#DC2626]/80 flex-1" />
                                <div className="absolute top-0 bottom-0 w-px bg-white left-1/2 -translate-x-1/2 opacity-50" />
                             </div>
                             <div className="flex justify-between mt-1 text-[8px] font-mono text-[#9CA3AF]">
                                <span>{br}%</span><span>{100-br}%</span>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
         )}
      </div>
    </div>
  );
}
