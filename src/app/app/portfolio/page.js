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
import TierGate from "@/components/dashboard/TierGate";
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
    let reason = "Stable metrics suggest maintaining current position.";
    let newAlloc = token.allocation || Math.round(100 / portfolio.length);

    if (score >= 8 && momentum > 5) { action = "ACCUMULATE"; reason = `Strong alpha score (${score}/10) with positive momentum (+${momentum.toFixed(1)}%). Increase exposure.`; newAlloc = Math.min(40, newAlloc + 8); }
    else if (score >= 7 && momentum > 0) { action = "HOLD+"; reason = `Solid fundamentals with neutral-to-positive price action. Slowly increase.`; newAlloc = Math.min(35, newAlloc + 3); }
    else if (score < 5 || momentum < -10) { action = "REDUCE"; reason = `Deteriorating metrics (score: ${score}/10, momentum: ${momentum.toFixed(1)}%). Reduce risk exposure.`; newAlloc = Math.max(5, newAlloc - 10); }
    else if (momentum < -5) { action = "CAUTION"; reason = `Negative momentum (${momentum.toFixed(1)}%) signals potential downside risk. Monitor closely.`; newAlloc = Math.max(5, newAlloc - 5); }

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
  ACCUMULATE: { bg: "bg-[#16A34A]/5", border: "border-[#16A34A]/15", text: "text-[#16A34A]", label: "Accumulate" },
  "HOLD+": { bg: "bg-[#3B82F6]/5", border: "border-[#3B82F6]/15", text: "text-[#3B82F6]", label: "Hold+" },
  HOLD: { bg: "bg-[#6B7280]/5", border: "border-[#6B7280]/15", text: "text-[#6B7280]", label: "Hold" },
  CAUTION: { bg: "bg-[#F97316]/5", border: "border-[#F97316]/15", text: "text-[#F97316]", label: "Caution" },
  REDUCE: { bg: "bg-[#DC2626]/5", border: "border-[#DC2626]/15", text: "text-[#DC2626]", label: "Reduce" },
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

  const content = (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* HERO */}
      <div className="p-6 md:p-8 rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden">
        <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none" color="rgba(0,0,0,0.04)" size="6px" />
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center shadow-sm relative mx-auto md:mx-0 mb-5 overflow-hidden">
              <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.15)" size="5px" />
              <RiBriefcaseLine className="text-white text-2xl relative z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2 tracking-tight">AI Portfolio Autopilot</h1>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-lg mx-auto md:mx-0">Build a mock portfolio and let IntelNode&apos;s AI engine generate weekly rebalancing strategies based on real-time intelligence, alpha scores, and momentum vectors.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSearch(!showSearch)} className="btn-intel px-5 py-3 text-sm flex items-center gap-2"><RiAddLine className="text-lg" /> Add Token</button>
            <button onClick={runRebalance} disabled={portfolio.length === 0 || rebalancing} className="px-5 py-3 rounded-xl bg-white border border-[#E5E7EB] text-[#111827] font-bold text-sm hover:border-[#111827]/20 transition-colors flex items-center gap-2 disabled:opacity-40">
              {rebalancing ? <RiLoader4Line className="text-lg animate-spin" /> : <RiBrainLine className="text-lg" />} Rebalance
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH PANEL */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#111827] font-bold text-sm flex items-center gap-2"><RiSearchLine /> Search Tokens to Add</h3>
                <button onClick={() => setShowSearch(false)} className="text-[#9CA3AF] hover:text-[#111827] transition-colors"><RiCloseLine size={20} /></button>
              </div>
              <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                <div className="relative flex-1"><RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Token name or contract..." className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[#111827] text-sm placeholder:text-[#9CA3AF] focus:border-[#111827]/30 focus:outline-none" /></div>
                <button type="submit" disabled={searching} className="btn-intel px-5 py-3 text-sm">{searching ? <RiLoader4Line className="animate-spin" /> : "Search"}</button>
              </form>
              {searchResults.length > 0 && (
                <div className="space-y-2">{searchResults.map((token, i) => {
                  const isAdded = portfolio.some(p => p.symbol === token.symbol);
                  return (
                    <div key={token.address || i} className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] flex items-center gap-4">
                      {token.imageUrl ? <img src={token.imageUrl} alt="" className="w-8 h-8 rounded-lg ring-1 ring-[#E5E7EB]" /> : <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] ring-1 ring-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#111827]">{token.symbol?.slice(0, 2)}</div>}
                      <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-[#111827] text-sm font-bold truncate max-w-[120px]">{token.name}</span><span className="text-[#6B7280] text-xs font-mono">{token.symbol}</span></div><span className="text-[#111827] font-mono text-xs font-bold">{token.price}</span></div>
                      {isAdded ? <span className="text-[#16A34A] text-[10px] font-bold uppercase flex items-center gap-1"><RiCheckLine /> Added</span>
                        : <button onClick={() => handleAdd(token)} className="px-3 py-1.5 rounded-md bg-[#111827] text-white text-[11px] font-bold hover:bg-[#374151] transition-colors flex items-center gap-1"><RiAddLine /> Add</button>}
                    </div>);
                })}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT — PIE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
            <h3 className="text-[#111827] font-bold text-sm mb-4 flex items-center gap-2"><RiPieChartLine /> {advice ? "Recommended" : "Current"} Allocation</h3>
            {portfolio.length > 0 ? (
              <>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} strokeWidth={2} stroke="#FFFFFF">{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }} /></PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">{pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} /><span className="text-[#111827] font-medium">{d.name}</span></div>
                    <span className="text-[#6B7280] font-mono font-bold">{d.value}%</span>
                  </div>
                ))}</div>
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                  <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.03)" size="7px" />
                  <RiPieChartLine className="text-[#9CA3AF] text-xl relative z-10" />
                </div>
                <p className="text-[#6B7280] text-xs">Add tokens to see your allocation chart.</p>
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB]">
            <div className="flex items-center gap-2.5 mb-2"><RiInformationLine className="text-[#111827] text-lg" /><h3 className="text-[#111827] font-bold text-sm">How It Works</h3></div>
            <p className="text-[#6B7280] text-xs leading-relaxed">Add tokens to your mock portfolio, then click <strong className="text-[#111827]">Rebalance</strong> to get AI-driven allocation advice based on real-time alpha scores, momentum, and buy pressure analysis. This is simulation-only and not financial advice.</p>
          </div>
        </div>

        {/* RIGHT — PORTFOLIO */}
        <div className="lg:col-span-8">
          <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8F9FB] rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2"><RiBarChartLine className="text-[#111827]" /><h3 className="text-[#111827] font-bold text-sm uppercase tracking-widest">Portfolio Holdings</h3></div>
              <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest">{portfolio.length} assets</span>
            </div>
            <div className="p-2 space-y-2">
              {portfolio.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.03)" size="7px" />
                    <RiBriefcaseLine className="text-[#9CA3AF] text-2xl relative z-10" />
                  </div>
                  <h3 className="text-[#111827] font-bold text-lg mb-2">Empty Portfolio</h3>
                  <p className="text-[#6B7280] text-xs max-w-sm mx-auto leading-relaxed mb-4">Add tokens to your mock portfolio to receive AI-generated rebalancing strategies.</p>
                  <button onClick={() => setShowSearch(true)} className="btn-intel px-5 py-2.5 text-sm inline-flex items-center gap-2"><RiAddLine /> Add Your First Token</button>
                </div>
              ) : (
                (advice || portfolio).map((token, i) => {
                  const adv = advice?.find(a => a.symbol === token.symbol);
                  const actionStyle = adv ? ACTION_STYLES[adv.action] || ACTION_STYLES.HOLD : null;
                  return (
                    <motion.div key={token.symbol} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="p-4 rounded-lg border border-[#E5E7EB] bg-white flex flex-col gap-4 group hover:border-[#111827]/15 transition-colors relative overflow-hidden">
                      {adv && <div className={`absolute top-0 left-0 w-1.5 h-full ${adv.action === "ACCUMULATE" ? "bg-[#16A34A]" : adv.action === "REDUCE" ? "bg-[#DC2626]" : adv.action === "CAUTION" ? "bg-[#F97316]" : "bg-[#6B7280]"}`} />}
                      <div className="flex items-center gap-4 pl-2">
                        {token.imageUrl ? <img src={token.imageUrl} alt="" className="w-10 h-10 rounded-xl ring-1 ring-[#E5E7EB] shrink-0" /> : <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] ring-1 ring-[#E5E7EB] flex items-center justify-center text-sm font-bold text-[#111827] shrink-0">{token.symbol?.slice(0, 2)}</div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1"><span className="text-[#111827] text-sm font-bold">{token.name}</span><span className="text-[#6B7280] text-xs font-mono">{token.symbol}</span>
                            {adv && actionStyle && <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-black tracking-widest ${actionStyle.bg} ${actionStyle.border} ${actionStyle.text}`}>{actionStyle.label}</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[#111827] font-mono text-sm font-bold">{token.price}</span>
                            <span className={`flex items-center gap-0.5 text-[11px] font-bold ${token.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{token.positive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}{Math.abs(token.priceChange24h || 0).toFixed(1)}%</span>
                            <span className="text-[10px] text-[#9CA3AF] font-mono bg-[#F8F9FB] px-1.5 py-0.5 rounded border border-[#E5E7EB]">Score: {token.alphaScore}/10</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {adv && (
                            <div className="text-center">
                              <span className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-widest block">Target</span>
                              <span className="text-[#111827] font-black text-lg font-mono">{adv.suggestedAllocation}%</span>
                            </div>
                          )}
                          <button onClick={() => handleRemove(token.symbol)} className="p-2 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#DC2626] hover:border-[#DC2626]/20 transition-colors"><RiDeleteBinLine className="text-sm" /></button>
                        </div>
                      </div>
                      {adv && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-4 pr-2">
                          <div className="p-3 rounded-md bg-[#F8F9FB] border border-[#E5E7EB] flex items-start gap-2.5">
                            <RiSparklingLine className="text-[#111827] shrink-0 mt-0.5" />
                            <p className="text-[#6B7280] text-[11px] leading-relaxed">{adv.reason}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TierGate requiredTier="INSTITUTIONAL" featureName="AI Portfolio Autopilot">
      {content}
    </TierGate>
  );
}
