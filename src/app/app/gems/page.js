"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiStarLine, RiLoader4Line, RiLockLine,
  RiRefreshLine, RiSparklingLine,
  RiFireLine, RiShieldCheckLine, RiBarChartBoxLine,
  RiFilter3Line, RiArrowUpSLine, RiArrowDownSLine,
  RiEyeLine, RiCoinLine, RiPulseLine, RiNodeTree, RiAddLine, RiCheckLine,
  RiRadarLine
} from "react-icons/ri";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useTokens } from "@/context/TokenContext";
import { getTrendingTokens, getTopBoostedTokens, searchTokens, formatPairData, formatCurrency, formatNumber, getChainLabel } from "@/lib/dexscreener";
import InsufficientTokensModal from "@/components/dashboard/InsufficientTokensModal";
import GemDetailModal from "@/components/dashboard/GemDetailModal";

const GEM_DETAIL_COST = 100;
const CARD = "rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden";
const CARD_INNER = "rounded-lg border border-[#E5E7EB] bg-[#F8F9FB]";

const RECOMMENDED_ENTITIES = [
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance Hot (EVM)" },
  { address: "FWznbcNXWQuHTaWE9RxvQ2LdCENssh12dsznf4RiouN5", label: "Wintermute (SOL)" },
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", label: "Vitalik Core (EVM)" }
];

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

function ScoreBadge({ score }) {
  const cfg = score >= 8 ? { c: "#16A34A", bg: "rgba(22,163,74,0.06)", bc: "rgba(22,163,74,0.2)" }
    : score >= 6 ? { c: "#7C3AED", bg: "rgba(124,58,237,0.06)", bc: "rgba(124,58,237,0.2)" }
    : { c: "#F97316", bg: "rgba(249,115,22,0.06)", bc: "rgba(249,115,22,0.2)" };
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border flex-col"
      style={{ color: cfg.c, background: cfg.bg, borderColor: cfg.bc }}>
      <span className="text-[7px] font-bold uppercase block mb-[-2px] opacity-70 tracking-widest leading-none">Sc</span>
      <span className="text-xs font-black leading-none">{score}</span>
    </span>
  );
}

export default function GemsPage() {
  const { balance, spendTokens, trackedWallets, trackWallet } = useTokens();
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("alphaScore");
  const [filterChain, setFilterChain] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [unlockedGems, setUnlockedGems] = useState(new Set());
  const [selectedGem, setSelectedGem] = useState(null);
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
    openGemPopup(gem);
  }

  async function openGemPopup(gem) {
    setSelectedGem(gem);
    setAiReport(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenData: gem }) });
      const data = await res.json();
      setAiReport(data.report);
    } catch (err) { console.error("AI report failed:", err); }
    finally { setAiLoading(false); }
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* ═══ HERO HEADER ═══ */}
      <div className={`p-6 md:p-8 ${CARD} relative overflow-visible z-20`}>
        {/* Crosshatch pattern accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:6px_6px]" style={{ '--pattern-fg': 'rgba(124,58,237,0.1)' }} />
        
        <div className="flex flex-col xl:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex-1 text-center xl:text-left">
            <div className="w-14 h-14 rounded-xl bg-[rgba(124,58,237,0.06)] border border-[#E5E7EB] flex items-center justify-center mx-auto xl:mx-0 mb-5 text-[#7C3AED]">
              <RiSparklingLine className="text-2xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2 tracking-tight">Intel Feed</h1>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-xl mx-auto xl:mx-0">Curated intelligence on high-potential projects. AI-ranked opportunities across EVM and Solana networks with institutional-grade analysis.</p>
          </div>
          
          <div className="w-full xl:w-auto shrink-0 bg-[#F8F9FB] rounded-xl border border-[#E5E7EB] p-4 xl:p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
               <h3 className="text-[#111827] font-bold text-sm tracking-tight flex items-center gap-2"><RiFilter3Line className="text-[#7C3AED]"/> Intelligence Filters</h3>
               <span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">{GEM_DETAIL_COST} INOD / Report</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="relative w-full sm:w-auto">
                <select value={filterChain} onChange={e => setFilterChain(e.target.value)}
                  className="w-full sm:w-40 px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] text-sm focus:outline-none cursor-pointer focus:border-[#7C3AED]/50 appearance-none font-medium">
                  {chains.map(c => <option key={c} value={c}>{c === "all" ? "All Networks" : getChainLabel(c)}</option>)}
                </select>
                <RiFilter3Line className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>
              
              <div className="relative w-full sm:w-auto">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="w-full sm:w-40 px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] text-sm focus:outline-none cursor-pointer focus:border-[#7C3AED]/50 appearance-none font-medium">
                  <option value="alphaScore">Intel Score ↓</option>
                  <option value="volume">24h Volume ↓</option>
                  <option value="liquidity">Liquidity ↓</option>
                  <option value="priceChange">Momentum ↓</option>
                </select>
                <RiFilter3Line className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              </div>

              <button onClick={fetchGems} disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#7C3AED]/20 bg-[rgba(124,58,237,0.04)] text-[#7C3AED] hover:bg-[rgba(124,58,237,0.08)] transition-all flex items-center justify-center gap-2 font-bold text-sm shrink-0">
                <RiRefreshLine className={`${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">

        {/* ═══ LEFT RAIL: TELEMETRY & INTEL ═══ */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-6">
          
          {/* Global Network Telemetry */}
          <div className={`${CARD}`}>
            <div className="p-4 border-b border-[#E5E7EB]">
               <h3 className="text-[#111827] font-bold text-sm tracking-tight flex items-center gap-2"><RiPulseLine className="text-[#16A34A]"/> Global Telemetry</h3>
            </div>
            
            {loading ? (
               <div className="py-12 flex items-center justify-center">
                 <RiLoader4Line className="text-[#7C3AED] text-2xl animate-spin" />
               </div>
            ) : mStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-px p-1.5">
                {[
                  { label: "Active Nodes", value: gems.length, icon: RiFireLine, color: "#F97316" },
                  { label: "High Conviction", value: mStats.highAlpha, icon: RiStarLine, color: "#16A34A" },
                  { label: "Network Avg", value: mStats.avgScore.toFixed(1), icon: RiShieldCheckLine, color: "#7C3AED" },
                  { label: "Volume Flux", value: formatCurrency(mStats.totalVol), icon: RiBarChartBoxLine, color: "#3B82F6" },
                ].map((s, i) => (
                  <div key={s.label} className={`p-3.5 ${CARD_INNER} flex items-center gap-3 overflow-hidden relative group hover:border-[#7C3AED]/15 transition-colors`}>
                    <div className="absolute top-0 left-0 w-1 h-full opacity-20 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: s.color }} />
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${s.color}08`, color: s.color, borderColor: `${s.color}15` }}>
                      <s.icon className="text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#9CA3AF] text-[9px] uppercase tracking-widest font-bold mb-0.5">{s.label}</p>
                      <p className="text-[#111827] font-black text-sm block truncate">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Track Alpha Sources */}
          <div className={`p-5 ${CARD}`}>
            <h3 className="text-[#111827] font-bold text-sm mb-4 flex items-center gap-2"><RiNodeTree className="text-[#3B82F6]" /> Track Alpha Sources</h3>
            <p className="text-[#6B7280] text-[11px] font-medium leading-relaxed mb-4 pb-4 border-b border-[#E5E7EB]">Synchronize local alerts with known smart money addresses to refine intelligence models.</p>
            
            <div className="space-y-3 pb-2">
              {RECOMMENDED_ENTITIES.map((entity, i) => {
                const isTracked = trackedWallets.some(w => w.address === entity.address);
                return (
                  <div key={i} className={`p-3 ${CARD_INNER} flex flex-col xl:flex-row gap-2 xl:gap-0 xl:items-center justify-between group hover:border-[#7C3AED]/20 transition-colors`}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[#111827] text-xs font-bold truncate">{entity.label}</span>
                      <span className="text-[#9CA3AF] text-[10px] font-mono truncate max-w-[100px]">{entity.address}</span>
                    </div>
                    {isTracked ? (
                      <span className="text-[#16A34A] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 bg-[#16A34A]/6 px-2 py-1 rounded inline-flex self-start xl:self-auto"><RiCheckLine/> Active</span>
                    ) : (
                      <button onClick={() => trackWallet(entity.address, entity.label)} className="text-[#6B7280] text-[9px] font-bold uppercase tracking-wider bg-white border border-[#E5E7EB] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors px-2 py-1 rounded flex items-center gap-1 shrink-0 inline-flex self-start xl:self-auto">
                        <RiAddLine className="text-xs"/> Track
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ═══ RIGHT RAIL: INTEL FEED ═══ */}
        <div className="lg:col-span-9 xl:col-span-9 space-y-6">
          
          <div className={`${CARD}`}>
             <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiRadarLine className="text-[#7C3AED]" />
                  <h3 className="text-[#111827] font-bold text-sm uppercase tracking-wider">Active Intelligence ({sorted.length})</h3>
                </div>
             </div>
             
             <div className="p-2">
                {/* ═══ LOADING ═══ */}
                {loading ? (
                  <div className={`flex flex-col items-center justify-center py-20 ${CARD_INNER}`}>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[#7C3AED]/5 animate-pulse"/>
                         <RiLoader4Line className="text-[#7C3AED] text-3xl animate-spin relative z-10" />
                      </div>
                      <h3 className="text-[#111827] font-bold text-lg tracking-tight mb-2">Analyzing Markets...</h3>
                      <p className="text-[#6B7280] text-xs font-medium max-w-sm mx-auto">Evaluating liquidity flows and generating intelligence reports.</p>
                    </div>
                  </div>
                ) : sorted.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-20 ${CARD_INNER}`}>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4">
                        <RiEyeLine className="text-[#9CA3AF] text-2xl" />
                      </div>
                      <h3 className="text-[#111827] font-bold text-sm mb-1">No Matches Found</h3>
                      <p className="text-[#6B7280] text-[11px] font-medium max-w-xs text-center leading-relaxed">Relax filters to reveal additional targets.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                    {sorted.map((gem, i) => {
                      const buyPct = gem.buys24h + gem.sells24h > 0 ? Math.round((gem.buys24h / (gem.buys24h + gem.sells24h)) * 100) : 50;
                      const isUnlocked = unlockedGems.has(gem.address);
                      return (
                        <motion.div key={gem.address} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.035 }}
                          className={`group ${CARD_INNER} hover:border-[#7C3AED]/20 transition-all duration-300 relative overflow-hidden flex flex-col`}>
                          
                          {/* Top Identity Block */}
                          <div className="p-4 pb-3 flex items-start justify-between border-b border-[#E5E7EB] bg-white rounded-t-lg group-hover:bg-[#FAFBFD] transition-colors relative">
                            {gem.alphaScore >= 8 && <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#16A34A]/5 rounded-full blur-2xl pointer-events-none" />}
                            
                            <div className="flex items-center gap-3">
                              {gem.imageUrl
                                ? <img src={gem.imageUrl} alt="" className="w-10 h-10 rounded-full ring-2 ring-[#E5E7EB] relative z-10" />
                                : <div className="w-10 h-10 rounded-full bg-[rgba(124,58,237,0.06)] ring-2 ring-[#E5E7EB] flex items-center justify-center text-sm font-black text-[#7C3AED] relative z-10">{gem.symbol?.slice(0, 2)}</div>
                              }
                              <div className="relative z-10">
                                <h3 className="text-[#111827] font-bold text-sm truncate max-w-[120px] mb-0.5">{gem.name}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#6B7280] text-[10px] font-mono">{gem.symbol}</span>
                                  <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                                  <span className="text-[9px] px-1 py-0.5 rounded uppercase font-bold tracking-widest bg-[#F8F9FB] border border-[#E5E7EB] text-[#9CA3AF]">{getChainLabel(gem.chain)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="relative z-10">
                              <ScoreBadge score={gem.alphaScore} />
                            </div>
                          </div>

                          {/* Price & Sparkline */}
                          <div className="p-4 flex items-center justify-between">
                            <div>
                              <span className="text-[#9CA3AF] text-[9px] uppercase font-bold tracking-widest block mb-1">Live Price</span>
                              <span className="text-[#111827] font-black text-xl font-mono block leading-none">{gem.price}</span>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={`flex items-center gap-0.5 text-[10px] font-bold tracking-wide ${gem.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                                  {gem.positive ? <RiArrowUpSLine className="text-xs" /> : <RiArrowDownSLine className="text-xs" />}
                                  {gem.positive ? "+" : ""}{gem.priceChange24h?.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-20 h-12 opacity-70 group-hover:opacity-100 transition-opacity">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getSparkline(gem)}>
                                  <Line type="monotone" dataKey="v" stroke={gem.positive ? "#16A34A" : "#DC2626"} strokeWidth={2} dot={false} strokeLinecap="round" />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Data Strip */}
                          <div className="grid grid-cols-2 gap-px bg-[#E5E7EB] mx-4 rounded-lg overflow-hidden border border-[#E5E7EB]">
                            <div className="p-2 text-center bg-white">
                               <span className="text-[#9CA3AF] text-[9px] uppercase font-bold tracking-widest block mb-0.5">Vol 24H</span>
                               <span className="text-[#111827] font-mono text-[11px] font-semibold">{formatCurrency(gem.volume24h)}</span>
                            </div>
                            <div className="p-2 text-center bg-white">
                               <span className="text-[#9CA3AF] text-[9px] uppercase font-bold tracking-widest block mb-0.5">Liquidity</span>
                               <span className="text-[#111827] font-mono text-[11px] font-semibold">{formatCurrency(gem.liquidity)}</span>
                            </div>
                          </div>

                          {/* Pressure Bar */}
                          <div className="px-4 py-4 mt-auto">
                            <div className="flex justify-between text-[10px] items-center mb-1.5 font-bold uppercase tracking-widest">
                               <span className="text-[#16A34A] flex items-center gap-1">Buy <span className="opacity-70">{buyPct}%</span></span>
                               <span className="text-[#DC2626] flex items-center gap-1"><span className="opacity-70">{100 - buyPct}%</span> Sell</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden flex">
                               <div className="h-full bg-[#16A34A] rounded-l-full transition-all duration-500 ease-out" style={{ width: `${buyPct}%` }} />
                               <div className="h-full bg-[#DC2626] rounded-r-full flex-1" />
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="p-2 pt-0">
                            {!isUnlocked ? (
                              <button onClick={() => unlockGem(gem)}
                                className="w-full py-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[#6B7280] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:bg-[rgba(124,58,237,0.04)] transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <RiLockLine className="text-sm" /> Unlock Intel
                              </button>
                            ) : (
                              <button onClick={() => openGemPopup(gem)} 
                                className="btn-intel w-full py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <RiSparklingLine className="text-sm" /> View Report
                              </button>
                            )}
                          </div>
                          
                        </motion.div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>
          
        </div>
      </div>

      <AnimatePresence>
        {selectedGem && (
          <GemDetailModal gem={selectedGem} aiReport={aiReport} aiLoading={aiLoading} onClose={() => { setSelectedGem(null); setAiReport(null); }} />
        )}
      </AnimatePresence>
      <InsufficientTokensModal isOpen={showModal} onClose={() => setShowModal(false)} required={GEM_DETAIL_COST} balance={balance} />
    </div>
  );
}
