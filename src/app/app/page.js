"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  RiCoinLine, RiSearchEyeLine, RiAlertLine, RiStarLine,
  RiArrowRightUpLine, RiArrowRightDownLine, RiFlashlightLine,
  RiVipDiamondLine, RiTaskLine, RiFireLine, RiBarChartBoxLine,
  RiShieldCheckLine, RiPulseLine, RiLineChartLine,
  RiTrophyLine, RiEyeLine, RiSparklingLine, RiFilter3Line,
  RiArrowUpSLine, RiArrowDownSLine,
} from "react-icons/ri";
import {
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  Bar, BarChart, Cell, PieChart, Pie,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { useTokens } from "@/context/TokenContext";
import { getTrendingTokens, searchTokens, formatPairData, formatCurrency, formatNumber, getChainLabel } from "@/lib/dexscreener";

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
    <div className="bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-lg p-2.5 shadow-lg shadow-black/5">
      <p className="text-[#111827] text-[11px] font-semibold mb-1.5">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
          <span className="text-[#6B7280]">{e.name}:</span>
          <span className="text-[#111827] font-medium">{e.name === "Change %" ? `${e.value}%` : formatCurrency(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { balance, history, completedQuests, loaded } = useTokens();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volumeFilter, setVolumeFilter] = useState("all");

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

  const areaData = useMemo(() => trending.slice(0, 6).map(t => ({
    name: t.symbol?.length > 5 ? t.symbol.slice(0, 5) : t.symbol,
    "5m": t.priceChange5m || 0, "1h": t.priceChange1h || 0, "6h": t.priceChange6h || 0, "24h": t.priceChange24h || 0,
  })), [trending]);

  const radarData = useMemo(() => {
    if (!trending.length) return [];
    return trending.slice(0, 5).map(t => {
      const mV = Math.max(...trending.map(x => x.volume24h || 1));
      const mL = Math.max(...trending.map(x => x.liquidity || 1));
      return { name: t.symbol?.slice(0, 5), Vol: Math.round(((t.volume24h || 0) / mV) * 100), Liq: Math.round(((t.liquidity || 0) / mL) * 100), Score: Math.round((t.alphaScore / 10) * 100), Mom: Math.min(100, Math.max(0, 50 + (t.priceChange24h || 0))) };
    });
  }, [trending]);

  const stats = [
    { label: "Total Volume", value: pulse ? formatCurrency(pulse.totalVol) : "...", sub: pulse ? `${pulse.avgC >= 0 ? "+" : ""}${pulse.avgC.toFixed(1)}% avg` : "", subUp: pulse?.avgC >= 0, icon: RiBarChartBoxLine, color: "#7C3AED" },
    { label: "Total Liquidity", value: pulse ? formatCurrency(pulse.totalLiq) : "...", sub: `${trending.length} tokens tracked`, subUp: true, icon: RiShieldCheckLine, color: "#3B82F6" },
    { label: "INOD Balance", value: loaded ? balance.toLocaleString() : "...", sub: `${loaded ? completedQuests.length : 0} quests done`, subUp: true, icon: RiCoinLine, color: "#16A34A" },
    { label: "Trending Live", value: loading ? "..." : trending.length.toString(), sub: loading ? "" : "boosted tokens", subUp: true, icon: RiFireLine, color: "#F97316" },
  ];

  const recentHistory = loaded ? history.slice(0, 5) : [];

  const CARD = "rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden";
  const CARD_INNER = "rounded-lg border border-[#E5E7EB] bg-[#F8F9FB]";

  return (
    <div className="space-y-5">
      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.08 }}
            className={`p-5 ${CARD} group hover:border-[#7C3AED]/20 transition-colors`}
          >
            {/* Pattern accent strip at top */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:6px_6px]" style={{ '--pattern-fg': `${s.color}18` }} />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}0A` }}>
                  <s.icon className="text-base" style={{ color: s.color }} />
                </div>
                <span className="text-[#6B7280] text-xs font-medium">{s.label}</span>
              </div>
            </div>
            <p className="text-[#111827] font-bold text-2xl mb-1 relative z-10">{s.value}</p>
            {s.sub && (
              <div className="flex items-center gap-1.5 relative z-10">
                <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${s.subUp ? "bg-[#16A34A]/8 text-[#16A34A]" : "bg-[#DC2626]/8 text-[#DC2626]"}`}>
                  {s.subUp ? <RiArrowUpSLine className="text-xs" /> : <RiArrowDownSLine className="text-xs" />}
                  {s.sub.split(" ")[0]}
                </span>
                <span className="text-[#9CA3AF] text-[11px]">{s.sub.split(" ").slice(1).join(" ")}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ═══ ROW 1: Volume Chart (2/3) + Chain Donut (1/3) ═══ */}
      {!loading && trending.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Volume Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`lg:col-span-2 p-5 ${CARD}`}
          >
            <div className="flex items-center justify-between mb-1 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <RiBarChartBoxLine className="text-[#7C3AED] text-sm" />
                  <h3 className="text-[#111827] font-semibold">Volume Overview</h3>
                </div>
                <p className="text-[#9CA3AF] text-xs mt-0.5">Volume vs Liquidity by trending token</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] text-[11px] font-medium hover:border-[#7C3AED]/30 hover:text-[#7C3AED] transition-all">
                  <RiFilter3Line className="text-xs" /> Filter
                </button>
              </div>
            </div>
            {/* Big number */}
            <div className="mt-2 mb-4 relative z-10">
              <p className="text-[#111827] font-bold text-3xl">{pulse ? formatCurrency(pulse.totalVol) : "$0"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${pulse?.avgC >= 0 ? "bg-[#16A34A]/8 text-[#16A34A]" : "bg-[#DC2626]/8 text-[#DC2626]"}`}>
                  {pulse?.avgC >= 0 ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                  {pulse ? `${Math.abs(pulse.avgC).toFixed(1)}%` : "0%"}
                </span>
                <span className="text-[#9CA3AF] text-xs">avg price change</span>
              </div>
            </div>
            <div className="relative z-10" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barGap={2} barCategoryGap="15%">
                  <defs>
                    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.25} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(124,58,237,0.03)" }} />
                  <Bar dataKey="volume" name="Volume" fill="url(#gV)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="liquidity" name="Liquidity" fill="url(#gL)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 relative z-10">
              {[{ c: "#7C3AED", l: "Volume" }, { c: "#3B82F6", l: "Liquidity" }].map(x => (
                <div key={x.l} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: x.c }} />
                  <span className="text-[#6B7280] text-xs">{x.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chain Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className={`p-5 ${CARD}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <RiPulseLine className="text-[#7C3AED] text-sm" />
                <h3 className="text-[#111827] font-semibold text-sm">Chain Distribution</h3>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-lg border border-[#E5E7EB] text-[#6B7280]">Volume</span>
            </div>
            {/* Stat pills */}
            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              {donutData.slice(0, 3).map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-1 h-4 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                  <div>
                    <p className="text-[#9CA3AF] text-[10px]">{d.name}</p>
                    <p className="text-[#111827] font-bold text-sm">{formatCurrency(d.value)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} strokeWidth={0} paddingAngle={2}>
                    {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ ROW 2: Top Intel This Week + Top Intel This Month ═══ */}
      {!loading && trending.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { title: "Top Intel This Week", sub: "AI-curated highest scoring projects", icon: RiTrophyLine, color: "#7C3AED", data: bestWeek },
            { title: "Top Intel This Month", sub: "Highest volume & momentum tracked", icon: RiSparklingLine, color: "#16A34A", data: bestMonth },
          ].map((sec, si) => (
            <motion.div key={sec.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + si * 0.1 }}
              className={`p-5 ${CARD}`}
            >
              <div className="flex items-center gap-2.5 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${sec.color}0A` }}>
                  <sec.icon className="text-sm" style={{ color: sec.color }} />
                </div>
                <div>
                  <h3 className="text-[#111827] font-semibold text-sm">{sec.title}</h3>
                  <p className="text-[#9CA3AF] text-[10px]">{sec.sub}</p>
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                {sec.data.map((t, i) => (
                  <div key={t.address} className={`flex items-center justify-between p-3 ${CARD_INNER} hover:border-[#7C3AED]/15 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[#9CA3AF] text-xs font-mono w-5">#{i + 1}</span>
                      {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${sec.color}0A`, color: sec.color }}>{t.symbol?.slice(0, 2)}</div>}
                      <div>
                        <span className="text-[#111827] text-sm font-medium block truncate max-w-[100px]">{t.name}</span>
                        <span className="text-[#9CA3AF] text-[10px]">{t.symbol} · {getChainLabel(t.chain)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[#111827] text-sm font-medium block">{t.price}</span>
                        <span className={`text-xs font-medium ${t.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{t.positive ? "+" : ""}{t.priceChange24h?.toFixed(1)}%</span>
                      </div>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border" style={{ borderColor: `${sec.color}20`, background: `${sec.color}06`, color: sec.color }}>
                        <RiStarLine className="text-[10px]" />{t.alphaScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══ ROW 3: Trending Table (2/3) + Pulse + Radar (1/3) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className={`lg:col-span-2 p-5 ${CARD}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RiFireLine className="text-[#F97316] text-sm" />
              <h3 className="text-[#111827] font-semibold">Trending Tokens</h3>
              <span className="text-[#9CA3AF] text-xs ml-1">· Live DexScreener</span>
            </div>
            <Link href="/app/gems" className="text-[11px] px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#7C3AED] font-medium hover:border-[#7C3AED]/40 hover:bg-[rgba(124,58,237,0.04)] transition-colors">See All</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead><tr className="border-b border-[#E5E7EB]">
                    {["Token", "Price", "24h", "Volume", "Liq", "Score"].map(h => (
                      <th key={h} className={`text-${h === "Token" ? "left" : "right"} text-[#9CA3AF] text-[11px] font-medium py-2.5 px-2 uppercase tracking-wider`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {trending.map(t => (
                      <tr key={t.address} className="border-b border-[#E5E7EB]/50 hover:bg-[rgba(124,58,237,0.02)] transition-colors cursor-pointer">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2.5">
                            {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-7 h-7 rounded-full" /> : <div className="w-7 h-7 rounded-full bg-[rgba(124,58,237,0.06)] flex items-center justify-center text-[10px] font-bold text-[#7C3AED]">{t.symbol?.slice(0, 2)}</div>}
                            <div><span className="text-[#111827] text-sm font-medium block truncate max-w-[100px]">{t.name}</span><span className="text-[#9CA3AF] text-[10px]">{t.symbol} · {getChainLabel(t.chain)}</span></div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right text-[#111827] text-sm">{t.price}</td>
                        <td className={`py-3 px-2 text-right text-sm font-medium ${t.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{t.positive ? "+" : ""}{t.priceChange24h?.toFixed(1)}%</td>
                        <td className="py-3 px-2 text-right text-[#6B7280] text-sm">{formatCurrency(t.volume24h)}</td>
                        <td className="py-3 px-2 text-right text-[#6B7280] text-sm">{formatCurrency(t.liquidity)}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${t.alphaScore >= 8 ? "border-[#16A34A]/20 bg-[#16A34A]/6 text-[#16A34A]" : t.alphaScore >= 7 ? "border-[#7C3AED]/20 bg-[#7C3AED]/6 text-[#7C3AED]" : "border-[#F97316]/20 bg-[#F97316]/6 text-[#F97316]"}`}>
                            <RiStarLine className="text-[9px]" />{t.alphaScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="sm:hidden space-y-2">
                {trending.map(t => (
                  <div key={t.address} className={`flex items-center justify-between p-3 ${CARD_INNER}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-8 h-8 rounded-full shrink-0" /> : <div className="w-8 h-8 rounded-full bg-[rgba(124,58,237,0.06)] flex items-center justify-center text-[10px] font-bold text-[#7C3AED] shrink-0">{t.symbol?.slice(0, 2)}</div>}
                      <div className="min-w-0"><span className="text-[#111827] text-sm font-medium block truncate">{t.name}</span><span className="text-[#9CA3AF] text-[10px]">{t.symbol}</span></div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[#111827] text-sm font-medium block">{t.price}</span>
                      <span className={`text-xs font-medium ${t.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>{t.positive ? "+" : ""}{t.priceChange24h?.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Right: Market Pulse + Radar */}
        <div className="flex flex-col gap-5">
          {pulse && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className={`p-5 ${CARD}`}>
              <div className="flex items-center gap-2 mb-3">
                <RiPulseLine className="text-sm" style={{ color: pulse.sentC }} />
                <h3 className="text-[#111827] font-semibold text-sm">Market Pulse</h3>
                <span className="ml-auto px-2 py-0.5 rounded-md text-[11px] font-bold border" style={{ borderColor: `${pulse.sentC}20`, color: pulse.sentC, background: `${pulse.sentC}08` }}>{pulse.sent}</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[#16A34A] font-medium">Buys {pulse.bp}%</span>
                  <span className="text-[#DC2626] font-medium">Sells {100 - pulse.bp}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden flex">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pulse.bp}%` }} transition={{ duration: 1 }} className="h-full rounded-l-full" style={{ background: "linear-gradient(90deg, #16A34A, #4ADE80)" }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${100 - pulse.bp}%` }} transition={{ duration: 1 }} className="h-full rounded-r-full" style={{ background: "linear-gradient(90deg, #FCA5A5, #DC2626)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2.5 ${CARD_INNER} text-center`}><p className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-0.5">Buys</p><p className="text-[#111827] font-bold">{formatNumber(pulse.tB)}</p></div>
                <div className={`p-2.5 ${CARD_INNER} text-center`}><p className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-0.5">Sells</p><p className="text-[#111827] font-bold">{formatNumber(pulse.tS)}</p></div>
              </div>
            </motion.div>
          )}
          {!loading && trending.length >= 3 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className={`p-5 ${CARD} flex-1`}>
              <h3 className="text-[#111827] font-semibold text-sm mb-0.5 relative z-10">Intel Radar</h3>
              <p className="text-[#9CA3AF] text-[10px] mb-2 relative z-10">Top 5 comparison</p>
              <div className="relative z-10" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                    <PolarGrid stroke="#E5E7EB" strokeDasharray="4 4" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 10 }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
                    <Radar dataKey="Vol" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.1} strokeWidth={1.5} />
                    <Radar dataKey="Liq" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.06} strokeWidth={1.5} />
                    <Radar dataKey="Score" stroke="#16A34A" fill="#16A34A" fillOpacity={0.06} strokeWidth={1.5} />
                    <Tooltip content={<ChartTip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ ROW 4: Activity + Intel Score + Top Movers ═══ */}
      {!loading && trending.length > 0 && pulse && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className={`p-5 ${CARD}`}>
            <h3 className="text-[#111827] font-semibold text-sm mb-3">Recent Activity</h3>
            {recentHistory.length === 0 ? <p className="text-[#9CA3AF] text-xs text-center py-6">Complete quests to see activity here.</p> : (
              <div className="space-y-2">
                {recentHistory.map((e, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 ${CARD_INNER}`}>
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      {e.type === "earn" ? <RiCoinLine className="text-[#16A34A] text-xs" /> : <RiCoinLine className="text-[#F97316] text-xs" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#111827] text-xs font-medium truncate">{e.reason}</p>
                      <span className={`text-[11px] font-semibold ${e.type === "earn" ? "text-[#16A34A]" : "text-[#F97316]"}`}>{e.type === "earn" ? "+" : "-"}{e.amount} INOD</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className={`p-5 ${CARD}`}>
            <div className="flex items-center gap-2 mb-3">
              <RiShieldCheckLine className="text-[#7C3AED] text-sm" />
              <h3 className="text-[#111827] font-semibold text-sm">Intel Score</h3>
            </div>
            <div className={`p-4 ${CARD_INNER} text-center mb-4`}>
              <p className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-1">Avg Intel Score</p>
              <p className="text-[#111827] font-bold text-3xl">{pulse.avg.toFixed(1)}<span className="text-[#9CA3AF] text-sm font-normal"> / 10</span></p>
            </div>
            {[
              { l: "High (8-10)", c: trending.filter(t => t.alphaScore >= 8).length, cl: "#16A34A" },
              { l: "Medium (6-8)", c: trending.filter(t => t.alphaScore >= 6 && t.alphaScore < 8).length, cl: "#7C3AED" },
              { l: "Low (1-6)", c: trending.filter(t => t.alphaScore < 6).length, cl: "#F97316" },
            ].map(x => (
              <div key={x.l} className="flex items-center gap-3 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: x.cl }} />
                <span className="text-[#6B7280] text-xs flex-1">{x.l}</span>
                <div className="w-16 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(x.c / Math.max(1, trending.length)) * 100}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: x.cl }} />
                </div>
                <span className="text-[#111827] text-xs font-bold w-5 text-right">{x.c}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className={`p-5 ${CARD}`}>
            <div className="flex items-center gap-2 mb-3">
              <RiFireLine className="text-[#F97316] text-sm" />
              <h3 className="text-[#111827] font-semibold text-sm">Top Movers</h3>
            </div>
            {[
              { label: "Gainers", emoji: "🟢", color: "#16A34A", tokens: [...trending].sort((a, b) => b.priceChange24h - a.priceChange24h).filter(t => t.priceChange24h > 0).slice(0, 3) },
              { label: "Losers", emoji: "🔴", color: "#DC2626", tokens: [...trending].sort((a, b) => a.priceChange24h - b.priceChange24h).filter(t => t.priceChange24h < 0).slice(0, 3) },
            ].map(group => (
              <div key={group.label} className="mb-3 last:mb-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: group.color }}>{group.emoji} {group.label}</p>
                {group.tokens.length === 0 ? <p className="text-[#9CA3AF] text-xs">None</p> : group.tokens.map(t => (
                  <div key={t.address} className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB]/50 last:border-0">
                    <div className="flex items-center gap-2">
                      {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: `${group.color}0A`, color: group.color }}>{t.symbol?.slice(0, 2)}</div>}
                      <span className="text-[#111827] text-xs font-medium">{t.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 rounded-full overflow-hidden" style={{ width: 50, background: `${group.color}10` }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.abs(t.priceChange24h))}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: group.color }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: group.color }}>{t.priceChange24h > 0 ? "+" : ""}{t.priceChange24h?.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ═══ QUICK ACTIONS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "AI Research", desc: "Generate institution-grade reports", href: "/app/analyzer", icon: RiLineChartLine, color: "#7C3AED" },
          { title: "Intel Feed", desc: "Curated intelligence & signals", href: "/app/gems", icon: RiEyeLine, color: "#9F67FF" },
          { title: "Earn $INOD", desc: "Complete quests for rewards", href: "/app/quests", icon: RiCoinLine, color: "#16A34A" },
        ].map((a, i) => (
          <motion.div key={a.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.08 }}>
            <Link href={a.href} className={`flex items-center gap-4 p-4 ${CARD} group hover:border-[#7C3AED]/20 transition-all`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}08` }}>
                <a.icon className="text-lg" style={{ color: a.color }} />
              </div>
              <div>
                <h4 className="text-[#111827] font-medium text-sm group-hover:text-[#7C3AED] transition-colors">{a.title}</h4>
                <p className="text-[#9CA3AF] text-xs">{a.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
