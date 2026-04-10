"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiBriefcaseLine, RiAddLine, RiDeleteBinLine, RiLoader4Line,
  RiArrowUpSLine, RiArrowDownSLine, RiRefreshLine, RiBrainLine,
  RiPieChartLine, RiBarChartLine, RiCheckLine, RiCloseLine,
  RiSparklingLine, RiArrowRightLine, RiSearchLine, RiInformationLine,
  RiShieldCheckLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";

import { searchTokens, formatPairData, formatCurrency, getChainLabel } from "@/lib/dexscreener";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

const PIE_COLORS = ["#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#16A34A", "#3B82F6", "#F97316"];

function generateRebalanceAdvice(portfolio) {
  if (!portfolio || portfolio.length === 0) return null;
  const advice = portfolio.map(token => {
    const score = token.alphaScore || 5;
    const momentum = token.priceChange24h || 0;
    let action = "HOLD";
    let reason = "Stable metric confluence suggests holding current exposure.";
    let newAlloc = token.allocation || Math.round(100 / portfolio.length);

    if (score >= 8 && momentum > 5) { action = "ACCUMULATE"; reason = `Alpha vector (${score}/10) aligns with positive momentum (+${momentum.toFixed(1)}%). Incrementing exposure target.`; newAlloc = Math.min(40, newAlloc + 8); }
    else if (score >= 7 && momentum > 0) { action = "HOLD+"; reason = `Solid fundamental floor with neutral-to-positive price drift. Incrementally overweighting.`; newAlloc = Math.min(35, newAlloc + 3); }
    else if (score < 5 || momentum < -10) { action = "REDUCE"; reason = `Deteriorating matrix indicators (Score: ${score}, Flow: ${momentum.toFixed(1)}%). De-risking recommended.`; newAlloc = Math.max(5, newAlloc - 10); }
    else if (momentum < -5) { action = "CAUTION"; reason = `Negative momentum vector (${momentum.toFixed(1)}%) flags potential downside. Trimming fat.`; newAlloc = Math.max(5, newAlloc - 5); }

    return { ...token, action, reason, suggestedAllocation: newAlloc };
  });

  // Normalize allocations to 100%
  const total = advice.reduce((a, t) => a + t.suggestedAllocation, 0);
  advice.forEach(t => { t.suggestedAllocation = Math.round((t.suggestedAllocation / total) * 100); });
  const diff = 100 - advice.reduce((a, t) => a + t.suggestedAllocation, 0);
  if (advice.length > 0) advice[0].suggestedAllocation += diff;

  return advice;
}

const ACTION_STYLES = {
  ACCUMULATE: { bgClass: "bg-green-500/10", borderClass: "border-green-500/20", textClass: "text-green-600", label: "Accumulate", hex: "#16A34A" },
  "HOLD+": { bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20", textClass: "text-blue-600", label: "Hold+", hex: "#3B82F6" },
  HOLD: { bgClass: "bg-gray-500/10", borderClass: "border-gray-500/20", textClass: "text-gray-600", label: "Hold", hex: "#6B7280" },
  CAUTION: { bgClass: "bg-orange-500/10", borderClass: "border-orange-500/20", textClass: "text-orange-600", label: "Caution", hex: "#F97316" },
  REDUCE: { bgClass: "bg-red-500/10", borderClass: "border-red-500/20", textClass: "text-red-600", label: "Reduce", hex: "#DC2626" },
};

export default function PortfolioPage() {
  const { portfolio, addToPortfolio, removeFromPortfolio, tier } = useTokens();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [advice, setAdvice] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const pairs = await searchTokens(searchQuery.trim());
      const seen = new Set();
      const unique = pairs.filter(p => { const k = p.baseToken?.address; if (!k || seen.has(k)) return false; seen.add(k); return true; });
      setSearchResults(unique.slice(0, 6).map(formatPairData).filter(Boolean));
    } catch { }
    finally { setSearching(false); }
  }

  function handleAdd(token) {
    const defaultAlloc = portfolio.length === 0 ? 100 : Math.round(100 / (portfolio.length + 1));
    addToPortfolio({ ...token, allocation: defaultAlloc });
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setAdvice(null);
  }

  function handleRemove(symbol) {
    removeFromPortfolio(symbol);
    setAdvice(null);
  }

  function runRebalance() {
    if (portfolio.length === 0) return;
    setRebalancing(true);
    setAdvice(null);
    setTimeout(() => {
      const result = generateRebalanceAdvice(portfolio);
      setAdvice(result);
      setRebalancing(false);
    }, 1500);
  }

  const pieData = useMemo(() => {
    if (!portfolio || portfolio.length === 0) return [];
    const alloc = portfolio.map((t, i) => ({
      name: t.symbol, value: advice ? (advice.find(a => a.symbol === t.symbol)?.suggestedAllocation || 0) : Math.round(100 / portfolio.length),
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
    return alloc;
  }, [portfolio, advice]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto min-h-screen pb-12">
      
      {/* PREMIUM HERO BANNER */}
      <div className="relative rounded-2xl bg-[#111827] p-8 md:p-10 overflow-hidden shadow-xl border border-gray-800">
        <CrosshatchStrip className="absolute inset-0 opacity-[0.06] pointer-events-none" color="rgba(255,255,255,0.8)" size="8px" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
           <div className="flex-1 max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/10 border border-white/10 text-white/90 text-[10px] font-medium tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-sm">
                <RiBrainLine className="text-[#3B82F6]" /> AI Engine
             </div>
             <h1 className="text-3xl md:text-4xl font-medium text-white mb-3 tracking-tight leading-tight">Portfolio Autopilot</h1>
             <p className="text-white/60 text-[13px] md:text-sm leading-relaxed font-normal flex max-w-lg">Build a mock portfolio and let IntelNode&apos;s AI engine simulate allocation rebalancing strategies computed from live alpha scores, volume grids, and momentum flow vectors.</p>
           </div>
           
           <div className="shrink-0 flex items-center gap-4 flex-wrap">
             <button onClick={() => setShowSearch(!showSearch)} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-[13px] hover:bg-white/10 transition-colors flex items-center gap-2 backdrop-blur-md shadow-sm">
                <RiAddLine className="text-lg opacity-70" /> Add Asset
             </button>
             <button onClick={runRebalance} disabled={portfolio.length === 0 || rebalancing} 
               className="px-6 py-3 rounded-xl bg-white text-[#111827] border border-transparent font-medium text-[13px] hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
               {rebalancing ? <RiLoader4Line className="text-lg animate-spin" /> : <RiSparklingLine className="text-lg text-blue-600" />} Compute Vector
             </button>
           </div>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="overflow-hidden">
            <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-md shadow-[#111827]/[0.02] relative mb-2">
               <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1" size="5px" />
               <div className="flex items-center justify-between mb-5 mt-2">
                  <h3 className="text-[#111827] font-medium text-[14px] flex items-center gap-2"><RiSearchLine className="opacity-50" /> Search Market Assets</h3>
                  <button onClick={() => setShowSearch(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827] transition-colors"><RiCloseLine size={18} /></button>
               </div>
               <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                 <div className="relative flex-1">
                   <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                   <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Type token symbol or contract address..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FAFBFC] border border-[#E5E7EB] text-[#111827] text-[13px] placeholder:text-[#9CA3AF] font-medium focus:border-[#111827]/30 focus:bg-white focus:outline-none transition-colors" />
                 </div>
                 <button type="submit" disabled={searching} className="px-6 py-3 rounded-xl bg-[#111827] text-white text-[13px] font-medium hover:bg-[#374151] shadow-sm transition-colors min-w-[120px] flex items-center justify-center">
                   {searching ? <RiLoader4Line className="animate-spin text-lg" /> : "Search"}
                 </button>
               </form>
               
               {searchResults.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {searchResults.map((token, i) => {
                     const isAdded = portfolio.some(p => p.symbol === token.symbol);
                     return (
                       <div key={token.address || i} className="p-4 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] transition-all flex items-center gap-4 group">
                          {token.imageUrl ? 
                             <img src={token.imageUrl} alt="" className="w-9 h-9 rounded-full border border-gray-100 shrink-0" /> : 
                             <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] text-gray-800 font-medium shrink-0">{token.symbol?.slice(0, 2)}</div>
                          }
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-0.5">
                               <span className="text-[#111827] text-[13px] font-medium truncate max-w-[90px]">{token.name}</span>
                               <span className="text-[#9CA3AF] text-[11px] font-mono">{token.symbol}</span>
                             </div>
                             <span className="text-[#111827] font-mono text-[12px] font-medium">{token.price}</span>
                          </div>
                          {isAdded ? 
                             <span className="text-[#16A34A] text-[10px] font-medium uppercase tracking-wide flex items-center gap-1 bg-green-50 px-2.5 py-1.5 rounded-md"><RiCheckLine /> Added</span> : 
                             <button onClick={() => handleAdd(token)} className="px-3.5 py-1.5 rounded-md bg-[#FAFBFC] text-[#111827] text-[12px] font-medium hover:bg-[#111827] shadow-sm hover:text-white border border-[#E5E7EB] transition-all flex items-center gap-1"><RiAddLine /> Add</button>
                          }
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT — CHART & MECHANICS */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white relative overflow-hidden transition-shadow">
            <CrosshatchStrip className="absolute inset-0 opacity-[0.02] pointer-events-none" size="6px" />
            <div className="flex items-center gap-2 mb-8 relative z-10">
               <RiPieChartLine className="text-[#111827]" />
               <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">{advice ? "Suggested Reallocation Matrix" : "Current Exposure Distribution"}</h3>
            </div>
            
            {portfolio.length > 0 ? (
              <div className="relative z-10">
                <div style={{ height: 240 }} className="w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={95} strokeWidth={0} paddingAngle={2}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", fontSize: "11px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }} itemStyle={{ color: "#111827", fontWeight: 500 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                      <span className="text-[#4B5563] font-medium">{d.name}</span>
                    </div>
                    <span className="text-[#111827] font-mono font-medium text-[12px]">{d.value}%</span>
                  </div>
                ))}</div>
              </div>
            ) : (
              <div className="py-12 text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <RiPieChartLine className="text-[#9CA3AF] text-xl" />
                </div>
                <p className="text-[#6B7280] text-[12px] font-medium">Render queue empty.</p>
                <p className="text-[#9CA3AF] text-[11px] mt-1">Awaiting asset selection.</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-[#FAFBFC]/50 flex flex-col gap-3">
             <div className="flex items-center gap-2.5">
               <div className="text-[#4B5563]"><RiInformationLine className="text-lg" /></div>
               <h3 className="text-[#111827] font-medium text-[13px]">Simulation Logic</h3>
             </div>
             <p className="text-[#6B7280] text-[12px] leading-loose">The autopilot matrix evaluates simulated portfolios utilizing real-time neural filters built into IntelNode. Alpha signals and on-chain buy-volume deterministically calculate the suggested weighting drift. Actionable advice is isolated for research scopes.</p>
          </div>
        </div>

        {/* RIGHT COMPONENT — HOLDINGS GRID */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-5 px-1">
             <div className="flex items-center gap-2">
                <RiBarChartLine className="text-[#111827]" />
                <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Index Components</h3>
             </div>
             <span className="text-[#9CA3AF] text-[10px] font-medium uppercase tracking-widest">{portfolio.length} assets mapped</span>
          </div>

          {portfolio.length === 0 ? (
             <div className="w-full flex flex-col items-center justify-center p-24 bg-white border border-[#E5E7EB] rounded-2xl border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-5 shadow-sm">
                   <RiBriefcaseLine className="text-[#9CA3AF] text-2xl" />
                </div>
                <h3 className="text-[#111827] font-medium text-[14px] mb-2">No active indices</h3>
                <p className="text-[#6B7280] text-[12px] font-normal mb-6 text-center max-w-[250px] leading-relaxed">Search to add initial index constituents and generate your first report.</p>
                <button onClick={() => setShowSearch(true)} className="px-5 py-2.5 rounded-lg bg-[#111827] text-white text-[12px] font-medium hover:bg-[#374151] transition-colors inline-flex items-center gap-2"><RiAddLine /> Find Asset</button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AnimatePresence>
                {(advice || portfolio).map((token, i) => {
                   const adv = advice?.find(a => a.symbol === token.symbol);
                   const actionStyle = adv ? ACTION_STYLES[adv.action] || ACTION_STYLES.HOLD : null;
                   
                   return (
                     <motion.div layout key={token.symbol} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03, duration: 0.2 }}
                       className="p-5 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative group flex flex-col overflow-hidden min-h-[220px]">
                       
                       {adv && <div className={`absolute top-0 left-0 right-0 h-1 opacity-90 ${actionStyle.bgClass.replace('bg-', 'bg-').replace('/10', '')}`} style={{ backgroundColor: actionStyle.hex }} />}
                       <CrosshatchStrip className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] pointer-events-none transition-opacity" size="6px" />
                       
                       {/* Header Row */}
                       <div className="flex justify-between items-start mb-6 mt-1 relative z-10 pr-6">
                          <div className="flex items-center gap-3.5">
                             {token.imageUrl ? 
                                <img src={token.imageUrl} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm shrink-0" alt={token.symbol} /> : 
                                <div className="w-10 h-10 rounded-full bg-[#FAFBFC] border border-[#E5E7EB] flex items-center justify-center text-[11px] text-[#111827] font-medium shrink-0 shadow-sm">{token.symbol?.slice(0, 2)}</div>
                             }
                             <div className="min-w-0">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                  <h3 className="text-[#111827] text-[14px] font-medium leading-none truncate max-w-[100px]">{token.name}</h3>
                                  {adv && actionStyle && <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-medium tracking-wider ${actionStyle.bgClass} border ${actionStyle.borderClass} ${actionStyle.textClass} leading-none`}>{actionStyle.label}</span>}
                                </div>
                                <p className="text-[#6B7280] text-[11px] font-mono tracking-wide leading-none">{token.symbol}</p>
                             </div>
                          </div>
                          
                          <button onClick={() => handleRemove(token.symbol)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-[#FAFBFC] border border-transparent hover:border-red-100 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-all absolute top-0 right-0">
                             <RiDeleteBinLine className="text-sm" />
                          </button>
                       </div>
                       
                       {/* Key Metrics Row */}
                       <div className="grid grid-cols-2 gap-4 mb-6">
                         <div>
                           <p className="text-[#9CA3AF] text-[9px] uppercase tracking-widest mb-1.5 font-medium">Spot Vector</p>
                           <span className="text-[#111827] font-mono text-[14px] font-medium block leading-none mb-1.5">{token.price}</span>
                           <div className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${token.positive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                              {token.positive ? <RiArrowUpSLine className="text-[12px]" /> : <RiArrowDownSLine className="text-[12px]" />}
                              {Math.abs(token.priceChange24h || 0).toFixed(1)}%
                           </div>
                         </div>
                         <div>
                            <p className="text-[#9CA3AF] text-[9px] uppercase tracking-widest mb-1.5 font-medium">Alpha Synthesis</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[22px] font-light font-mono leading-none tracking-tight text-[#111827]">{token.alphaScore}</span>
                              <span className="text-[10px] text-[#9CA3AF] font-medium uppercase">Score</span>
                            </div>
                         </div>
                       </div>
                       
                       {/* Footer / AI Strategy Context */}
                       {adv ? (
                         <div className="pt-5 border-t border-[#F3F4F6] mt-auto">
                           <div className="flex justify-between items-end mb-3">
                             <span className="text-[#9CA3AF] text-[9px] uppercase tracking-widest font-medium">Strategy & reasoning</span>
                             <div className="text-right">
                               <span className="text-[#9CA3AF] text-[9px] uppercase tracking-widest block font-medium mb-1">Target Alloc</span>
                               <span className="text-[#111827] font-medium font-mono text-[15px]">{adv.suggestedAllocation}%</span>
                             </div>
                           </div>
                           <div className="p-3.5 rounded-xl bg-[#FAFBFC] border border-[#E5E7EB] flex items-start gap-3">
                             <RiSparklingLine className="text-[#3B82F6] shrink-0 mt-0.5 text-[15px]" />
                             <p className="text-[#4B5563] text-[11px] leading-relaxed font-normal">{adv.reason}</p>
                           </div>
                         </div>
                       ) : (
                          <div className="pt-4 border-t border-[#F3F4F6] mt-auto flex items-end justify-between relative z-10">
                             <div>
                               <span className="text-[#9CA3AF] text-[9px] uppercase tracking-widest block font-medium mb-1.5">Current Distribution</span>
                               <span className="text-[#111827] font-medium font-mono text-[14px]">{token.allocation}%</span>
                             </div>
                          </div>
                       )}
                       
                     </motion.div>
                   );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
