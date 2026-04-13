"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  RiCoinLine,RiSearchEyeLine, RiAlertLine, RiStarLine,
  RiArrowRightUpLine, RiArrowRightDownLine, RiFlashlightLine,
  RiVipDiamondLine, RiTaskLine, RiFireLine, RiBarChartBoxLine,
  RiShieldCheckLine, RiPulseLine, RiLineChartLine,
  RiTrophyLine, RiEyeLine, RiSparklingLine, RiFilter3Line,
  RiArrowUpSLine, RiArrowDownSLine, RiRadarLine, RiNodeTree
} from "react-icons/ri";
import {
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  Bar, BarChart, Cell, PieChart, Pie,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { useTokens } from "@/context/TokenContext";
import { getTrendingTokens, searchTokens, formatPairData, formatCurrency, formatNumber, getChainLabel } from "@/lib/dexscreener";

const CARD = "rounded-2xl border border-[#E5E7EB] bg-white relative overflow-hidden transition-all hover:border-[#D1D5DB] hover:shadow-sm";
const CARD_INNER = "rounded-xl border border-[#E5E7EB] bg-[#FAFBFC]";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

function deduplicatePairs(pairs) {
  const best = {};
  for (const p of pairs) {
    const a = p.baseToken?.address;
    if (!a) continue;
    if (!best[a] || (p.liquidity?.usd || 0) > (best[a].liquidity?.usd || 0)) best[a] = p;
  }
  return Object.values(best);
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-xl p-3 shadow-lg shadow-black/5">
      <p className="text-[#111827] text-[11px] font-medium tracking-wide mb-2 uppercase">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-[12px] mb-1 last:mb-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
            <span className="text-[#6B7280]">{e.name}</span>
          </div>
          <span className="text-[#111827] font-medium font-mono">{e.name === "Change %" ? `${e.value}%` : formatCurrency(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { balance, history, completedQuests, loaded } = useTokens();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const boosts = await getTrendingTokens();
        const addrs = [...new Set(boosts.slice(0, 20).map(b => b.tokenAddress))];
        const results = await Promise.all(addrs.slice(0, 10).map(a => searchTokens(a).catch(() => [])));
        const all = results.flatMap(r => r).filter(p => p?.priceUsd);
        setTrending(deduplicatePairs(all).slice(0, 10).map(formatPairData).filter(Boolean));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const pulse = useMemo(() => {
    if (!trending.length) return null;
    const tB = trending.reduce((s, t) => s + (t.buys24h || 0), 0);
    const tS = trending.reduce((s, t) => s + (t.sells24h || 0), 0);
    const tot = tB + tS;
    const bp = tot > 0 ? Math.round((tB / tot) * 100) : 50;
    const avg = trending.reduce((s, t) => s + (t.alphaScore || 0), 0) / trending.length;
    const avgC = trending.reduce((s, t) => s + (t.priceChange24h || 0), 0) / trending.length;
    const totalVol = trending.reduce((s, t) => s + (t.volume24h || 0), 0);
    const totalLiq = trending.reduce((s, t) => s + (t.liquidity || 0), 0);
    return { tB, tS, bp, avg, avgC, totalVol, totalLiq, sent: avgC > 5 ? "Bullish" : avgC > -5 ? "Neutral" : "Bearish", sentC: avgC > 5 ? "#16A34A" : avgC > -5 ? "#7C3AED" : "#DC2626" };
  }, [trending]);

  const bestWeek = useMemo(() => !trending.length ? [] : [...trending].sort((a, b) => b.alphaScore - a.alphaScore).slice(0, 3), [trending]);
  const bestMonth = useMemo(() => !trending.length ? [] : [...trending].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0)).slice(0, 3), [trending]);

  const barData = useMemo(() => trending.slice(0, 8).map(t => ({
    name: t.symbol?.length > 5 ? t.symbol.slice(0, 5) : t.symbol,
    volume: t.volume24h || 0, liquidity: t.liquidity || 0, "Change %": t.priceChange24h || 0,
  })), [trending]);

  const donutData = useMemo(() => {
    if (!trending.length) return [];
    const chains = {};
    trending.forEach(t => { const c = getChainLabel(t.chain); chains[c] = (chains[c] || 0) + (t.volume24h || 0); });
    return Object.entries(chains).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [trending]);
  const DONUT_COLORS = ["#7C3AED", "#3B82F6", "#16A34A", "#F97316", "#9F67FF", "#DC2626"];

  const radarData = useMemo(() => {
    if (!trending.length) return [];
    return trending.slice(0, 5).map(t => {
      const mV = Math.max(...trending.map(x => x.volume24h || 1));
      const mL = Math.max(...trending.map(x => x.liquidity || 1));
      return { name: t.symbol?.slice(0, 5), Vol: Math.round(((t.volume24h || 0) / mV) * 100), Liq: Math.round(((t.liquidity || 0) / mL) * 100), Score: Math.round((t.alphaScore / 10) * 100), Mom: Math.min(100, Math.max(0, 50 + (t.priceChange24h || 0))) };
    });
  }, [trending]);

  const recentHistory = loaded ? history.slice(0, 4) : [];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1600px] mx-auto pb-12">
      
      {/* ═══ PREMIUM DARK HERO ═══ */}
      <div className="relative rounded-2xl bg-[#111827] p-8 md:p-12 shadow-xl border border-gray-800 z-20">
        <CrosshatchStrip className="absolute inset-0 opacity-[0.05] pointer-events-none" color="rgba(255,255,255,1)" size="8px" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center xl:text-left">
            <h1 className="text-3xl md:text-5xl font-medium text-white mb-4 tracking-tight leading-tight">Terminal Command</h1>
            <p className="text-white/60 text-[13px] md:text-sm leading-relaxed font-normal max-w-xl mx-auto xl:mx-0">
              Your central intelligence hub. Real-time network telemetry, smart money movement tracking, and deep liquidity analytics across interconnected chains.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center xl:justify-start gap-4">
               {[
                 { label: "Credit Balance", value: loaded ? balance.toLocaleString() : "...", icon: RiCoinLine, color: "#16A34A" },
                 { label: "Active Tracking", value: loading ? "..." : trending.length.toString(), icon: RiFireLine, color: "#F97316" },
                 { label: "Total Volume", value: pulse ? formatCurrency(pulse.totalVol) : "...", icon: RiBarChartBoxLine, color: "#7C3AED" },
                 { label: "Total Liquidity", value: pulse ? formatCurrency(pulse.totalLiq) : "...", icon: RiShieldCheckLine, color: "#3B82F6" },
               ].map((stat, i) => (
                 <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-2.5 px-4 shrink-0 hover:bg-white/10 transition-colors">
                   <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                     <stat.icon style={{ color: stat.color }} className="text-base" />
                   </div>
                   <div className="flex flex-col text-left">
                     <span className="text-white/50 text-[9px] uppercase tracking-widest font-medium mb-0.5">{stat.label}</span>
                     <span className="text-white font-mono text-[13px] font-medium">{stat.value}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="w-full xl:w-auto shrink-0 bg-[#0A0D14]/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl min-w-[300px]">
             <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
               <h3 className="text-white font-medium text-sm flex items-center gap-2"><RiPulseLine className="opacity-80"/> Ecosystem Status</h3>
               <span className="flex items-center gap-2 bg-[#16A34A]/20 border border-[#16A34A]/30 text-[#4ADE80] px-2.5 py-1 rounded text-[9px] uppercase font-medium tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"/> Syncing</span>
             </div>
             <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px] font-medium uppercase tracking-widest">Market Sentiment</span>
                  <span className="px-2 py-0.5 rounded border text-[10px] uppercase font-medium tracking-widest bg-white/5" style={{ borderColor: pulse ? `${pulse.sentC}40` : "transparent", color: pulse?.sentC || "white" }}>
                    {pulse ? pulse.sent : "..."}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px] font-medium uppercase tracking-widest">Global Heat</span>
                  <span className="text-white font-mono text-[13px] font-medium">{pulse?.avgC >= 0 ? "+" : ""}{pulse ? pulse.avgC.toFixed(2) : "0.00"}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-[10px] font-medium uppercase tracking-widest">Avg Intel Score</span>
                  <span className="flex items-center gap-1.5 text-white font-mono font-medium text-[13px]">
                     <RiStarLine className="text-[#F97316]" /> {pulse ? pulse.avg.toFixed(1) : "0.0"} <span className="opacity-40">/ 10</span>
                  </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {!loading && trending.length > 0 && pulse && (
        <>
          {/* ═══ BENTO ROW 1: Chart & Distribution ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`lg:col-span-8 p-6 lg:p-8 ${CARD}`}>
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2.5">
                    <RiBarChartBoxLine className="text-[#111827] opacity-60 text-lg" />
                    <h3 className="text-[#111827] text-[14px] font-medium uppercase tracking-wider">Volume & Liquidity Metrics</h3>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-[#7C3AED]" /><span className="text-[10px] uppercase tracking-widest font-medium text-[#6B7280]">Vol</span></div>
                     <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded bg-[#3B82F6]" /><span className="text-[10px] uppercase tracking-widest font-medium text-[#6B7280]">Liq</span></div>
                  </div>
               </div>
               <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barGap={4} barCategoryGap="25%">
                      <defs>
                        <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 9, fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} dx={-8} />
                      <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(124,58,237,0.03)" }} />
                      <Bar dataKey="volume" name="Volume" fill="url(#gV)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="liquidity" name="Liquidity" fill="url(#gL)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </motion.div>

            <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-6 ${CARD} flex-1`}>
                  <div className="flex items-center gap-2.5 mb-6">
                    <RiNodeTree className="text-[#111827] opacity-60 text-lg" />
                    <h3 className="text-[#111827] text-[13px] font-medium uppercase tracking-wider">Network Distribution</h3>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row lg:flex-col items-center justify-between gap-6">
                     <div className="w-full flex flex-wrap lg:grid lg:grid-cols-2 gap-2">
                       {donutData.slice(0, 4).map((d, i) => (
                         <div key={d.name} className={`flex items-center gap-2 p-2 ${CARD_INNER}`}>
                           <div className="w-1.5 h-6 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                           <div className="flex flex-col min-w-0">
                             <span className="text-[#9CA3AF] text-[9px] uppercase tracking-widest font-medium mb-0.5">{d.name}</span>
                             <span className="text-[#111827] font-mono text-[11px] font-medium truncate">{formatCurrency(d.value)}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                     <div style={{ height: 140, width: "100%" }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} strokeWidth={0} paddingAngle={4}>
                             {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                           </Pie>
                           <Tooltip content={<ChartTip />} />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
               </motion.div>
            </div>
          </div>

          {/* ═══ BENTO ROW 2: Trending Feed & Top Mover/Intel Lists ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`lg:col-span-8 p-6 lg:p-8 ${CARD}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                     <RiFireLine className="text-[#F97316] text-lg" />
                     <h3 className="text-[#111827] text-[14px] font-medium uppercase tracking-wider">Live Intel Feed</h3>
                  </div>
                  <Link href="/app/gems" className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#7C3AED] font-medium hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 transition-colors">Open Terminal</Link>
                </div>
                
                <div className="overflow-x-auto">
                   <table className="w-full min-w-[600px]">
                     <thead>
                       <tr className="border-b border-[#E5E7EB]">
                         {["Asset", "Price", "24h", "Volume", "Liquid", "Rating"].map(h => (
                           <th key={h} className={`text-${h === "Asset" ? "left" : "right"} text-[#9CA3AF] text-[9px] font-medium py-3 px-2 uppercase tracking-widest`}>{h}</th>
                         ))}
                       </tr>
                     </thead>
                     <tbody>
                       {trending.slice(0, 6).map(t => (
                         <tr key={t.address} className="border-b border-[#E5E7EB]/50 hover:bg-[#FAFBFC] transition-colors group">
                           <td className="py-3 px-2">
                             <div className="flex items-center gap-3">
                               {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-8 h-8 rounded-full border border-[#E5E7EB]" /> : <div className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-[#FAFBFC] flex items-center justify-center text-[10px] font-medium text-[#7C3AED]">{t.symbol?.slice(0, 2)}</div>}
                               <div>
                                 <span className="text-[#111827] text-[13px] font-medium block">{t.name}</span>
                                 <span className="text-[#9CA3AF] text-[10px] font-mono">{t.symbol} · {getChainLabel(t.chain)}</span>
                               </div>
                             </div>
                           </td>
                           <td className="py-3 px-2 text-right text-[#111827] text-[13px] font-mono font-medium">{t.price}</td>
                           <td className={`py-3 px-2 text-right text-[12px] font-mono font-medium ${t.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{t.positive ? "+" : ""}{t.priceChange24h?.toFixed(1)}%</td>
                           <td className="py-3 px-2 text-right text-[#6B7280] text-[12px] font-mono">{formatCurrency(t.volume24h)}</td>
                           <td className="py-3 px-2 text-right text-[#6B7280] text-[12px] font-mono">{formatCurrency(t.liquidity)}</td>
                           <td className="py-3 px-2 text-right">
                             <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-medium uppercase tracking-widest ${t.alphaScore >= 8 ? "border-[#16A34A]/20 bg-[#16A34A]/5 text-[#16A34A]" : t.alphaScore >= 7 ? "border-[#7C3AED]/20 bg-[#7C3AED]/5 text-[#7C3AED]" : "border-[#F97316]/20 bg-[#F97316]/5 text-[#F97316]"}`}>
                               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.alphaScore >= 8 ? "#16A34A" : t.alphaScore >= 7 ? "#7C3AED" : "#F97316" }} /> 
                               {t.alphaScore} <span className="opacity-40">/10</span>
                             </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </motion.div>
             
             <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
               {[
                 { title: "Top Intel Week", sub: "Highest rated AI projections", icon: RiTrophyLine, color: "#7C3AED", data: bestWeek },
                 { title: "Volatility Watch", sub: "Extreme momentum shifts", icon: RiArrowRightUpLine, color: "#16A34A", data: [...trending].sort((a,b)=>Math.abs(b.priceChange24h)-Math.abs(a.priceChange24h)).slice(0,3) }
               ].map((widget, i) => (
                 <motion.div key={widget.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i*0.05 }} className={`p-6 ${CARD} flex-1`}>
                    <div className="flex flex-col gap-1 mb-5">
                       <h3 className="text-[#111827] text-[13px] font-medium uppercase tracking-wider flex items-center gap-2">
                         <widget.icon style={{ color: widget.color }} /> {widget.title}
                       </h3>
                       <p className="text-[#9CA3AF] text-[10px] ml-6">{widget.sub}</p>
                    </div>
                    <div className="space-y-2">
                       {widget.data.map(t => (
                         <div key={t.address} className={`flex items-center justify-between p-3 ${CARD_INNER}`}>
                           <div className="flex items-center gap-3">
                             <div className="w-6 h-6 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center overflow-hidden">
                                {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[8px] font-medium" style={{ color: widget.color }}>{t.symbol?.slice(0,2)}</span>}
                             </div>
                             <span className="text-[#111827] text-[12px] font-medium">{t.symbol}</span>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className={`text-[11px] font-mono font-medium ${t.priceChange24h > 0 ? "text-[#16A34A]":"text-[#DC2626]"}`}>
                                {t.priceChange24h > 0 ? "+" : ""}{t.priceChange24h?.toFixed(1)}%
                             </span>
                           </div>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               ))}
             </div>
          </div>

          {/* ═══ BENTO ROW 3: Radar & Activity ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`lg:col-span-4 p-6 ${CARD}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <RiRadarLine className="text-[#111827] opacity-60 text-lg" />
                <h3 className="text-[#111827] text-[13px] font-medium uppercase tracking-wider">Top 5 Vector Analysis</h3>
              </div>
              <div style={{ height: 260 }} className="relative z-10 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 9, fontWeight: 500 }} />
                    <Radar dataKey="Vol" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} strokeWidth={1} />
                    <Radar dataKey="Score" stroke="#16A34A" fill="#16A34A" fillOpacity={0.1} strokeWidth={1} />
                    <Tooltip content={<ChartTip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className={`lg:col-span-8 p-6 ${CARD}`}>
              <div className="flex items-center gap-2.5 mb-6">
                 <RiTaskLine className="text-[#111827] opacity-60 text-lg" />
                 <h3 className="text-[#111827] text-[13px] font-medium uppercase tracking-wider">Operator Ledger</h3>
              </div>
              {recentHistory.length === 0 ? <p className="text-[#9CA3AF] text-xs text-center py-10">Deploy tasks to generate node history.</p> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentHistory.map((e, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 ${CARD_INNER} group hover:border-[#D1D5DB] transition-all`}>
                      <div className="mt-0.5 w-8 h-8 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-center shrink-0 shadow-sm">
                        <RiCoinLine className="text-[14px]" style={{ color: e.type === "earn" ? "#16A34A" : "#F97316" }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[10px] uppercase font-medium tracking-widest mb-1 ${e.type === "earn" ? "text-[#16A34A]" : "text-[#F97316]"}`}>{e.type === "earn" ? "+" : "-"}{e.amount} INOD</span>
                        <p className="text-[#111827] text-[12px] font-medium leading-snug">{e.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* QUICK JUMPS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E5E7EB]">
         {[
           { title: "Terminal", desc: "Live feed data", href: "/app/gems", icon: RiEyeLine },
           { title: "Research", desc: "AI audit reports", href: "/app/analyzer", icon: RiSearchEyeLine },
           { title: "Sentiment", desc: "Social matrices", href: "/app/sentiment", icon: RiBarChartBoxLine },
           { title: "Quests", desc: "Earn operator intel", href: "/app/quests", icon: RiTaskLine },
         ].map((act, i) => (
           <motion.div key={act.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i*0.05 }}>
              <Link href={act.href} className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#111827] hover:shadow-sm transition-all group">
                <div className="flex flex-col gap-0.5">
                   <h4 className="text-[#111827] font-medium text-[13px]">{act.title}</h4>
                   <p className="text-[#6B7280] text-[10px] uppercase tracking-widest font-medium opacity-80">{act.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center group-hover:bg-[#111827] group-hover:text-white transition-colors">
                  <act.icon />
                </div>
              </Link>
           </motion.div>
         ))}
      </div>
    </div>
  );
}
