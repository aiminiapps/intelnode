"use client";

import { motion } from "motion/react";
import {
  RiCloseLine, RiSparklingLine, RiShieldCheckLine, RiStarLine,
  RiExternalLinkLine, RiArrowRightUpLine, RiArrowRightDownLine,
  RiLoader4Line,
} from "react-icons/ri";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { formatCurrency, formatNumber, getChainLabel, timeAgo } from "@/lib/dexscreener";

const RISK_COLORS = { LOW: "#22C55E", MEDIUM: "#7C3AED", HIGH: "#F97316", CRITICAL: "#FF4444" };
const REC_COLORS = { STRONG_BUY: "#22C55E", BUY: "#22C55E", HOLD: "#7C3AED", CAUTION: "#F97316", AVOID: "#FF4444" };

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i} className="text-[#DDD] italic">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="px-1.5 py-0.5 rounded bg-[#2A2A3A] text-[#9F67FF] text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownBlock({ text }) {
  if (!text) return null;
  return (
    <div>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <h4 key={i} className="text-white font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>;
        if (line.startsWith("## ")) return <h3 key={i} className="text-white font-bold text-base mt-4 mb-1">{line.slice(3)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-[#CCC] text-sm ml-4 list-disc">{renderInline(line.slice(2))}</li>;
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i} className="text-[#CCC] text-sm leading-relaxed mb-1">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141420]/95 backdrop-blur-xl border border-[#2A2A3A] rounded-xl p-2 shadow-2xl">
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color || e.fill }} />
          <span className="text-[#A1A1AA]">{e.name}:</span>
          <span className="text-white font-medium">{e.value}</span>
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

  const pieData = [
    { name: "Buys", value: gem.buys24h || 1 },
    { name: "Sells", value: gem.sells24h || 1 },
  ];

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4 pt-8 pb-8" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} className="w-full max-w-3xl rounded-2xl border border-[#2A2A3A] bg-[#0A0A0F] relative overflow-hidden">

        <div className="absolute -top-24 -right-24 w-56 h-56 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg bg-[#141420] border border-[#2A2A3A] flex items-center justify-center text-[#6B6B76] hover:text-white transition-colors">
          <RiCloseLine size={18} />
        </button>

        <div className="relative z-10 p-5 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div className="flex items-start gap-4">
            {gem.imageUrl ? <img src={gem.imageUrl} alt="" className="w-14 h-14 rounded-2xl shrink-0" /> : <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center font-bold text-[#9F67FF] text-lg shrink-0">{gem.symbol?.slice(0, 2)}</div>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white font-bold text-xl">{gem.name}</h2>
                <span className="text-[#A1A1AA] text-sm">{gem.symbol}</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#1C1C2E] text-[#A1A1AA] text-[10px] font-medium">{getChainLabel(gem.chain)}</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#1C1C2E] text-[#A1A1AA] text-[10px] font-medium">{gem.dex}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-white text-2xl font-bold">{gem.price}</span>
                <span className={`flex items-center gap-1 text-sm font-medium ${gem.positive ? "text-[#22C55E]" : "text-[#FF4444]"}`}>
                  {gem.positive ? <RiArrowRightUpLine /> : <RiArrowRightDownLine />}
                  {gem.positive ? "+" : ""}{gem.priceChange24h?.toFixed(2)}%
                </span>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${gem.alphaScore >= 8 ? "bg-[#22C55E]/10 text-[#22C55E]" : gem.alphaScore >= 6 ? "bg-[#7C3AED]/10 text-[#9F67FF]" : "bg-[#F97316]/10 text-[#F97316]"}`}>
                  <RiStarLine className="text-[10px]" /> {gem.alphaScore}/10
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Volume 24h", value: formatCurrency(gem.volume24h) },
              { label: "Liquidity", value: formatCurrency(gem.liquidity) },
              { label: "FDV", value: formatCurrency(gem.fdv) },
              { label: "Market Cap", value: formatCurrency(gem.marketCap) },
              { label: "Buys 24h", value: formatNumber(gem.buys24h), color: "#22C55E" },
              { label: "Sells 24h", value: formatNumber(gem.sells24h), color: "#FF4444" },
              { label: "Vol/Liq", value: `${volLiqRatio}x` },
              { label: "Pair Age", value: timeAgo(gem.pairCreatedAt) },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl bg-[#141420] border border-[#2A2A3A]">
                <span className="text-[#6B6B76] text-[10px] uppercase tracking-wider block mb-1">{m.label}</span>
                <span className="text-white font-semibold text-sm" style={m.color ? { color: m.color } : undefined}>{m.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "5m", val: gem.priceChange5m },
              { label: "1h", val: gem.priceChange1h },
              { label: "6h", val: gem.priceChange6h },
              { label: "24h", val: gem.priceChange24h },
            ].map(c => (
              <div key={c.label} className="p-2 rounded-xl bg-[#141420] border border-[#2A2A3A] text-center">
                <span className="text-[#6B6B76] text-[10px] block">{c.label}</span>
                <span className={`text-sm font-bold ${(c.val || 0) >= 0 ? "text-[#22C55E]" : "text-[#FF4444]"}`}>
                  {(c.val || 0) >= 0 ? "+" : ""}{(c.val || 0).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#141420] border border-[#2A2A3A]">
            <h4 className="text-white text-sm font-semibold mb-3">Price Trend</h4>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="gemPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gem.positive ? "#22C55E" : "#FF4444"} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={gem.positive ? "#22C55E" : "#FF4444"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: "#A1A1AA", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#A1A1AA", fontSize: 10 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} tickFormatter={v => `$${v < 0.01 ? v.toExponential(1) : v.toFixed(v < 1 ? 4 : 2)}`} />
                  <Area type="monotone" dataKey="p" stroke={gem.positive ? "#22C55E" : "#FF4444"} fill="url(#gemPriceGrad)" strokeWidth={2} />
                  <Tooltip content={<ChartTooltip />} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#141420] border border-[#2A2A3A]">
              <h4 className="text-white text-sm font-semibold mb-2">Risk / Strength Radar</h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2A2A3A" />
                    <PolarAngleAxis dataKey="m" tick={{ fill: "#A1A1AA", fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar dataKey="v" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#141420] border border-[#2A2A3A]">
              <h4 className="text-white text-sm font-semibold mb-2">Buy / Sell Pressure</h4>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} strokeWidth={0}>
                      <Cell fill="#22C55E" />
                      <Cell fill="#FF4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /><span className="text-[#A1A1AA] text-xs">Buys {buyRatio}%</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF4444]" /><span className="text-[#A1A1AA] text-xs">Sells {100 - buyRatio}%</span></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141420] border border-[#2A2A3A] relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <RiSparklingLine className="text-[#9F67FF]" />
              <h4 className="text-white font-bold">AI Oracle Report</h4>
            </div>
            {aiLoading ? (
              <div className="text-center py-10">
                <RiLoader4Line className="text-[#7C3AED] text-2xl animate-spin mx-auto mb-3" />
                <p className="text-[#A1A1AA] text-sm">Oracle is analyzing {gem.symbol}...</p>
                <p className="text-[#555] text-xs mt-1">Generating risk assessment, insights & recommendations</p>
              </div>
            ) : aiReport ? (
              <div className="space-y-4 relative z-10">
                <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                  <h5 className="text-white text-xs font-semibold mb-1">Executive Summary</h5>
                  <MarkdownBlock text={aiReport.summary} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                    <span className="text-[#6B6B76] text-[10px] block mb-1">Risk Level</span>
                    <div className="flex items-center gap-2">
                      <RiShieldCheckLine style={{ color: RISK_COLORS[aiReport.riskLevel] || "#888" }} />
                      <span className="font-bold text-sm" style={{ color: RISK_COLORS[aiReport.riskLevel] }}>{aiReport.riskLevel}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                    <span className="text-[#6B6B76] text-[10px] block mb-1">Recommendation</span>
                    <span className="font-bold text-sm" style={{ color: REC_COLORS[aiReport.recommendation?.split(" ")[0]] || "#888" }}>
                      {aiReport.recommendation?.split(" — ")[0] || aiReport.recommendation}
                    </span>
                  </div>
                </div>
                {aiReport.narrative && (
                  <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                    <h5 className="text-white text-xs font-semibold mb-1">Narrative</h5>
                    <MarkdownBlock text={aiReport.narrative} />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                    <h5 className="text-[#22C55E] text-xs font-semibold mb-2">Strengths</h5>
                    <ul className="space-y-1.5">
                      {aiReport.strengths?.map((s, i) => (
                        <li key={i} className="text-[#CCC] text-xs flex items-start gap-2"><span className="text-[#22C55E] mt-0.5 text-[10px]">●</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                    <h5 className="text-[#FF4444] text-xs font-semibold mb-2">Risks</h5>
                    <ul className="space-y-1.5">
                      {aiReport.risks?.map((r, i) => (
                        <li key={i} className="text-[#CCC] text-xs flex items-start gap-2"><span className="text-[#FF4444] mt-0.5 text-[10px]">●</span>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {[
                  { title: "Liquidity Analysis", content: aiReport.liquidityAnalysis },
                  { title: "Volume Analysis", content: aiReport.volumeAnalysis },
                  { title: "Buy Pressure Analysis", content: aiReport.buyPressureAnalysis },
                  { title: "Price Action", content: aiReport.priceAction },
                ].filter(s => s.content).map(section => (
                  <div key={section.title} className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                    <h5 className="text-white text-xs font-semibold mb-1">{section.title}</h5>
                    <MarkdownBlock text={section.content} />
                  </div>
                ))}
                {aiReport.keyInsights && (
                  <div className="p-3 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                    <h5 className="text-[#9F67FF] text-xs font-semibold mb-2">Key Insights</h5>
                    <ul className="space-y-1.5">
                      {aiReport.keyInsights.map((ins, i) => (
                        <li key={i} className="text-[#CCC] text-xs flex items-start gap-2"><span className="text-[#9F67FF] mt-0.5 text-[10px]">★</span>{ins}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiReport.recommendation?.includes(" — ") && (
                  <div className="p-3 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/20">
                    <h5 className="text-[#9F67FF] text-xs font-semibold mb-1">Detailed Recommendation</h5>
                    <MarkdownBlock text={aiReport.recommendation} />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[#6B6B76] text-sm text-center py-6">Report unavailable. Try again later.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {gem.url && (
              <a href={gem.url} target="_blank" rel="noopener noreferrer" className="btn-3d flex-1 flex items-center justify-center gap-2 py-3 text-sm">
                <RiExternalLinkLine /> View on DexScreener
              </a>
            )}
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#2A2A3A] text-[#A1A1AA] hover:text-white text-sm font-medium transition-colors">
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
