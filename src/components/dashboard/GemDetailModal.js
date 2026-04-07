"use client";

import { motion } from "motion/react";
import {
  RiCloseLine, RiSparklingLine, RiShieldCheckLine, RiStarLine,
  RiExternalLinkLine, RiArrowRightUpLine, RiArrowRightDownLine,
  RiLoader4Line, RiBrainLine,
} from "react-icons/ri";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { formatCurrency, formatNumber, getChainLabel, timeAgo } from "@/lib/dexscreener";

const RISK_COLORS = { LOW: "#16A34A", MEDIUM: "#111827", HIGH: "#F97316", CRITICAL: "#DC2626" };
const REC_COLORS = { STRONG_BUY: "#16A34A", BUY: "#16A34A", HOLD: "#111827", CAUTION: "#F97316", AVOID: "#DC2626" };

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-[#111827] font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="text-[#6B7280] italic">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#111827] text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownBlock({ text }) {
  if (!text) return null;
  return (
    <div>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="text-[#111827] font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="text-[#111827] font-bold text-base mt-4 mb-1">{line.slice(3)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-[#6B7280] text-sm ml-4 list-disc marker:text-[#D1D5DB]">{renderInline(line.slice(2))}</li>;
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-[#6B7280] text-sm leading-relaxed mb-1">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-[#E5E7EB] rounded-lg p-2.5 shadow-lg shadow-black/5">
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color || e.fill }} />
          <span className="text-[#9CA3AF]">{e.name}:</span>
          <span className="text-[#111827] font-medium">{e.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function GemDetailModal({ gem, aiReport, aiLoading, onClose }) {
  if (!gem) return null;

  const radarData = [
    { m: "Liquidity", v: Math.min(10, (gem.liquidity / 500000) * 10) },
    { m: "Volume", v: Math.min(10, (gem.volume24h / 1000000) * 10) },
    { m: "Txns", v: Math.min(10, ((gem.buys24h + gem.sells24h) / 500) * 10) },
    { m: "Momentum", v: Math.min(10, Math.max(0, (gem.priceChange24h + 50) / 10)) },
    { m: "Buy Power", v: gem.buys24h + gem.sells24h > 0 ? (gem.buys24h / (gem.buys24h + gem.sells24h)) * 10 : 5 },
    { m: "Score", v: gem.alphaScore },
  ];
  const pieData = [{ name: "Buys", value: gem.buys24h || 1 }, { name: "Sells", value: gem.sells24h || 1 }];
  const priceHistory = [
    { t: "-24h", p: gem.priceRaw * (1 - (gem.priceChange24h || 0) / 100) },
    { t: "-6h", p: gem.priceRaw * (1 - (gem.priceChange6h || 0) / 100) },
    { t: "-1h", p: gem.priceRaw * (1 - (gem.priceChange1h || 0) / 100) },
    { t: "-5m", p: gem.priceRaw * (1 - (gem.priceChange5m || 0) / 100) },
    { t: "Now", p: gem.priceRaw },
  ];
  const buyRatio = gem.buys24h + gem.sells24h > 0 ? Math.round((gem.buys24h / (gem.buys24h + gem.sells24h)) * 100) : 50;
  const volLiqRatio = gem.liquidity > 0 ? (gem.volume24h / gem.liquidity).toFixed(2) : "N/A";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 backdrop-blur-sm overflow-y-auto p-4 pt-8 pb-8" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} className="w-full max-w-3xl rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden shadow-xl shadow-black/5">

        <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none z-20" color="rgba(0,0,0,0.04)" size="6px" />

        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors">
          <RiCloseLine size={18} />
        </button>

        <div className="relative z-10 p-5 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start gap-4">
            {gem.imageUrl ? <img src={gem.imageUrl} alt="" className="w-14 h-14 rounded-2xl shrink-0 ring-1 ring-[#E5E7EB]" /> : <div className="w-14 h-14 rounded-2xl bg-[#F3F4F6] flex items-center justify-center font-bold text-[#111827] text-lg shrink-0 border border-[#E5E7EB]">{gem.symbol?.slice(0, 2)}</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[#111827] font-bold text-xl">{gem.name}</h2>
                <span className="text-[#6B7280] text-sm">{gem.symbol}</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#F3F4F6] text-[#6B7280] text-[10px] font-medium border border-[#E5E7EB]">{getChainLabel(gem.chain)}</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#F3F4F6] text-[#6B7280] text-[10px] font-medium border border-[#E5E7EB]">{gem.dex}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[#111827] text-2xl font-bold">{gem.price}</span>
                <span className={`flex items-center gap-1 text-sm font-medium ${gem.positive ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                  {gem.positive ? <RiArrowRightUpLine /> : <RiArrowRightDownLine />}
                  {gem.positive ? "+" : ""}{gem.priceChange24h?.toFixed(2)}%
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border ${gem.alphaScore >= 8 ? "bg-[#16A34A]/5 text-[#16A34A] border-[#16A34A]/15" : gem.alphaScore >= 6 ? "bg-[#111827]/5 text-[#111827] border-[#111827]/15" : "bg-[#F97316]/5 text-[#F97316] border-[#F97316]/15"}`}>
                  <RiStarLine className="text-[10px]" /> {gem.alphaScore}/10
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Volume 24h", value: formatCurrency(gem.volume24h) },
              { label: "Liquidity", value: formatCurrency(gem.liquidity) },
              { label: "FDV", value: formatCurrency(gem.fdv) },
              { label: "Market Cap", value: formatCurrency(gem.marketCap) },
              { label: "Buys 24h", value: formatNumber(gem.buys24h), color: "#16A34A" },
              { label: "Sells 24h", value: formatNumber(gem.sells24h), color: "#DC2626" },
              { label: "Vol/Liq", value: `${volLiqRatio}x` },
              { label: "Pair Age", value: timeAgo(gem.pairCreatedAt) },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]">
                <span className="text-[#9CA3AF] text-[10px] uppercase tracking-wider block mb-1">{m.label}</span>
                <span className="text-[#111827] font-semibold text-sm" style={m.color ? { color: m.color } : undefined}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Price changes */}
          <div className="grid grid-cols-4 gap-2">
            {[{ label: "5m", val: gem.priceChange5m }, { label: "1h", val: gem.priceChange1h }, { label: "6h", val: gem.priceChange6h }, { label: "24h", val: gem.priceChange24h }].map(c => (
              <div key={c.label} className="p-2 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-center">
                <span className="text-[#9CA3AF] text-[10px] block">{c.label}</span>
                <span className={`text-sm font-bold ${(c.val || 0) >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                  {(c.val || 0) >= 0 ? "+" : ""}{(c.val || 0).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          {/* Price chart */}
          <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]">
            <h4 className="text-[#111827] text-sm font-semibold mb-3">Price Trend</h4>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory}>
                  <defs><linearGradient id="gemPG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={gem.positive ? "#16A34A" : "#DC2626"} stopOpacity={0.15} /><stop offset="100%" stopColor={gem.positive ? "#16A34A" : "#DC2626"} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={v => `$${v < 0.01 ? v.toExponential(1) : v.toFixed(v < 1 ? 4 : 2)}`} />
                  <Area type="monotone" dataKey="p" stroke={gem.positive ? "#16A34A" : "#DC2626"} fill="url(#gemPG)" strokeWidth={2} />
                  <Tooltip content={<ChartTooltip />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar & Pie */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]">
              <h4 className="text-[#111827] text-sm font-semibold mb-2">Risk / Strength Radar</h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}><PolarGrid stroke="#E5E7EB" /><PolarAngleAxis dataKey="m" tick={{ fill: "#6B7280", fontSize: 10 }} /><PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} /><Radar dataKey="v" stroke="#111827" fill="#111827" fillOpacity={0.08} strokeWidth={2} /></RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]">
              <h4 className="text-[#111827] text-sm font-semibold mb-2">Buy / Sell Pressure</h4>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} strokeWidth={0}><Cell fill="#16A34A" /><Cell fill="#DC2626" /></Pie></PieChart></ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" /><span className="text-[#6B7280] text-xs">Buys {buyRatio}%</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /><span className="text-[#6B7280] text-xs">Sells {100 - buyRatio}%</span></div>
              </div>
            </div>
          </div>

          {/* AI Report */}
          <div className="p-4 rounded-lg bg-white border border-[#E5E7EB] relative overflow-hidden">
            <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1 pointer-events-none" color="rgba(0,0,0,0.03)" size="5px" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <RiBrainLine className="text-[#111827]" />
              <h4 className="text-[#111827] font-bold">AI Research Report</h4>
            </div>
            {aiLoading ? (
              <div className="text-center py-10">
                <RiLoader4Line className="text-[#111827] text-2xl animate-spin mx-auto mb-3" />
                <p className="text-[#6B7280] text-sm">Analyzing {gem.symbol}...</p>
                <p className="text-[#9CA3AF] text-xs mt-1">Generating risk assessment, insights & recommendations</p>
              </div>
            ) : aiReport ? (
              <div className="space-y-4 relative z-10">
                <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><h5 className="text-[#111827] text-xs font-semibold mb-1">Executive Summary</h5><MarkdownBlock text={aiReport.summary} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><span className="text-[#9CA3AF] text-[10px] block mb-1">Risk Level</span><div className="flex items-center gap-2"><RiShieldCheckLine style={{ color: RISK_COLORS[aiReport.riskLevel] || "#6B7280" }} /><span className="font-bold text-sm" style={{ color: RISK_COLORS[aiReport.riskLevel] }}>{aiReport.riskLevel}</span></div></div>
                  <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><span className="text-[#9CA3AF] text-[10px] block mb-1">Recommendation</span><span className="font-bold text-sm" style={{ color: REC_COLORS[aiReport.recommendation?.split(" ")[0]] || "#6B7280" }}>{aiReport.recommendation?.split(" — ")[0] || aiReport.recommendation}</span></div>
                </div>
                {aiReport.narrative && <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><h5 className="text-[#111827] text-xs font-semibold mb-1">Narrative</h5><MarkdownBlock text={aiReport.narrative} /></div>}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><h5 className="text-[#16A34A] text-xs font-semibold mb-2">Strengths</h5><ul className="space-y-1.5">{aiReport.strengths?.map((s, i) => <li key={i} className="text-[#6B7280] text-xs flex items-start gap-2"><span className="text-[#16A34A] mt-0.5 text-[10px]">●</span>{s}</li>)}</ul></div>
                  <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><h5 className="text-[#DC2626] text-xs font-semibold mb-2">Risks</h5><ul className="space-y-1.5">{aiReport.risks?.map((r, i) => <li key={i} className="text-[#6B7280] text-xs flex items-start gap-2"><span className="text-[#DC2626] mt-0.5 text-[10px]">●</span>{r}</li>)}</ul></div>
                </div>
                {[{ title: "Liquidity Analysis", content: aiReport.liquidityAnalysis }, { title: "Volume Analysis", content: aiReport.volumeAnalysis }, { title: "Buy Pressure", content: aiReport.buyPressureAnalysis }, { title: "Price Action", content: aiReport.priceAction }].filter(s => s.content).map(section => (
                  <div key={section.title} className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><h5 className="text-[#111827] text-xs font-semibold mb-1">{section.title}</h5><MarkdownBlock text={section.content} /></div>
                ))}
                {aiReport.keyInsights && <div className="p-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]"><h5 className="text-[#111827] text-xs font-semibold mb-2">Key Insights</h5><ul className="space-y-1.5">{aiReport.keyInsights.map((ins, i) => <li key={i} className="text-[#6B7280] text-xs flex items-start gap-2"><span className="text-[#111827] mt-0.5 text-[10px]">★</span>{ins}</li>)}</ul></div>}
                {aiReport.recommendation?.includes(" — ") && <div className="p-3 rounded-lg bg-[#111827]/[0.03] border border-[#111827]/10"><h5 className="text-[#111827] text-xs font-semibold mb-1">Detailed Recommendation</h5><MarkdownBlock text={aiReport.recommendation} /></div>}
              </div>
            ) : (
              <p className="text-[#9CA3AF] text-sm text-center py-6">Report unavailable. Try again later.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {gem.url && (
              <a href={gem.url} target="_blank" rel="noopener noreferrer" className="btn-intel flex-1 flex items-center justify-center gap-2 py-3 text-sm">
                <RiExternalLinkLine /> View on DexScreener
              </a>
            )}
            <button onClick={onClose} className="flex-1 py-3 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] text-sm font-medium transition-colors">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
