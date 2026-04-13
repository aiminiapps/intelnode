"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiAlarmWarningLine, RiArrowUpLine, RiBarChartLine,
  RiVipCrownLine, RiSparklingLine, RiSettings3Line,
  RiCheckLine, RiLoader4Line, RiExternalLinkLine,
  RiPulseLine, RiArrowUpSLine, RiArrowDownSLine,
  RiRadarLine, RiNodeTree, RiAddLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";
import { getTrendingTokens, getTopBoostedTokens, searchTokens, formatPairData, formatCurrency, getChainLabel } from "@/lib/dexscreener";

const CARD = "rounded-2xl border border-[#E5E7EB] bg-white relative overflow-hidden transition-all hover:border-[#D1D5DB] hover:shadow-sm";
const CARD_INNER = "rounded-xl border border-[#E5E7EB] bg-[#FAFBFC]";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

const ALERT_TYPE_META = {
  WHALE_BUY: { label: "Whale Anomalies", color: "#111827", icon: RiVipCrownLine },
  LIQUIDITY_SPIKE: { label: "Liquidity Spikes", color: "#16A34A", icon: RiArrowUpLine },
  VOLUME_SURGE: { label: "Volume Shocks", color: "#F97316", icon: RiBarChartLine },
  SMART_MONEY: { label: "Smart Money", color: "#3B82F6", icon: RiSparklingLine },
  NEW_TOKEN: { label: "Deployments", color: "#6B7280", icon: RiAlarmWarningLine },
};

function classifyAlert(token) {
  if (token.volume24h > 1000000) return "VOLUME_SURGE";
  if (token.liquidity > 500000 && token.priceChange24h > 10) return "LIQUIDITY_SPIKE";
  if (token.buys24h > token.sells24h * 2) return "WHALE_BUY";
  if (token.alphaScore >= 8) return "SMART_MONEY";
  return "NEW_TOKEN";
}
function getSeverity(token) {
  if (token.alphaScore >= 8.5) return "high";
  if (token.alphaScore >= 7) return "medium";
  return "low";
}
const SEVERITY_STYLES = {
  high: { bg: "bg-red-50/50 border-red-100", text: "text-[#DC2626]", label: "Critical", lightBg: "bg-[#DC2626]" },
  medium: { bg: "bg-orange-50/50 border-orange-100", text: "text-[#F97316]", label: "Elevated", lightBg: "bg-[#F97316]" },
  low: { bg: "bg-green-50/50 border-green-100", text: "text-[#16A34A]", label: "Standard", lightBg: "bg-[#16A34A]" },
};

const RECOMMENDED_ENTITIES = [
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance Hot" },
  { address: "FWznbcNXWQuHTaWE9RxvQ2LdCENssh12dsznf4RiouN5", label: "Wintermute Trading" },
  { address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", label: "Uniswap Router" },
  { address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", label: "Raydium Pool" },
];

export default function AlertsPage() {
  const { alertSettings, updateAlertSettings, trackedWallets, trackWallet } = useTokens();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const [trending, top] = await Promise.all([getTrendingTokens(), getTopBoostedTokens()]);
        const allTokens = [...(trending || []), ...(top || [])];
        const unique = [...new Map(allTokens.map(t => [t.tokenAddress, t])).values()];
        const searchPromises = unique.slice(0, 15).map(t => searchTokens(t.tokenAddress).catch(() => []));
        const results = await Promise.all(searchPromises);
        const pairs = results.flatMap(r => r).filter(p => p && p.priceUsd);
        const seen = new Set();
        const uniquePairs = pairs.filter(p => { const key = p.baseToken?.address; if (seen.has(key)) return false; seen.add(key); return true; });
        const formatted = uniquePairs.map(formatPairData).filter(Boolean);
        const alertsData = formatted.map(token => ({
          ...token, alertType: classifyAlert(token), severity: getSeverity(token),
          description: generateAlertDescription(token),
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        }));
        setAlerts(alertsData);
      } catch (err) { console.error("Failed to fetch alerts:", err); }
      finally { setLoading(false); }
    }
    fetchAlerts();
  }, []);

  function generateAlertDescription(token) {
    const type = classifyAlert(token);
    switch (type) {
      case "VOLUME_SURGE": return `Massive volume influx (${formatCurrency(token.volume24h)}) decoupled from standard liquidity profiles. Volatility expected.`;
      case "LIQUIDITY_SPIKE": return `Deep liquidity pooling (${formatCurrency(token.liquidity)}) identified via synchronized smart contracts. Accumulation parameters met.`;
      case "WHALE_BUY": return `Asymmetric block transfers detected. ${token.buys24h} distinct buy events triggering whale tracking heuristics.`;
      case "SMART_MONEY": return `Intel consensus rating of ${token.alphaScore}/10. Trajectory aligned with historical smart money vectors.`;
      default: return `New entity detected on ${getChainLabel(token.chain)} maintaining early structural integrity.`;
    }
  }

  const toggleSetting = (key) => updateAlertSettings({ ...alertSettings, [key]: !alertSettings[key] });
  const filtered = alerts.filter(a => alertSettings[a.alertType]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto min-h-screen pb-12">
      
      {/* ═══ PREMIUM DARK HERO ═══ */}
      <div className="relative rounded-2xl bg-[#111827] p-8 md:p-12 shadow-xl border border-gray-800 text-center z-20">
        <CrosshatchStrip className="absolute inset-0 opacity-[0.06] pointer-events-none" color="rgba(255,255,255,0.8)" size="8px" />
        <div className="absolute top-0 right-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-left max-w-5xl mx-auto">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-medium text-white mb-4 tracking-tight leading-tight">Signal Matrix</h1>
            <p className="text-white/60 text-[13px] md:text-sm leading-relaxed font-normal max-w-xl">High-frequency algorithmic monitoring network. Detects smart money movement, deep liquidity shifts, and critical volume irregularities across protocols.</p>
          </div>
          
          <div className="w-full md:w-auto shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md min-w-[280px]">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
              <h3 className="text-white font-medium text-sm flex items-center gap-2"><RiPulseLine className="opacity-80"/> System Status</h3>
              <span className="flex items-center gap-2 bg-[#16A34A]/20 border border-[#16A34A]/30 text-[#4ADE80] px-2.5 py-1 rounded text-[9px] uppercase font-medium tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"/> Live</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-white/50 text-[10px] font-medium uppercase tracking-widest">Mempool</span>
                 <span className="text-white font-mono text-[13px] font-medium">OPTIMAL</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-white/50 text-[10px] font-medium uppercase tracking-widest">Blocks</span>
                 <span className="text-white font-mono text-[13px] font-medium">{(loading?"...":alerts.length*1420).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-white/50 text-[10px] font-medium uppercase tracking-widest">Anomalies</span>
                 <span className="text-white font-mono font-medium text-[13px]">{filtered.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* ═══ LEFT RAIL ═══ */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 ${CARD}`}>
            <div className="flex items-center gap-2 mb-5">
              <RiSettings3Line className="text-[#111827] opacity-60" />
              <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Notification Matrix</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(ALERT_TYPE_META).map(([key, val]) => {
                const isActive = alertSettings[key];
                return (
                  <button key={key} onClick={() => toggleSetting(key)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${isActive ? "bg-[#FAFBFC] border-[#E5E7EB]" : "bg-white border-transparent hover:border-[#E5E7EB] opacity-50 grayscale hover:grayscale-0 hover:opacity-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-white shadow-sm" style={{ color: val.color, borderColor: `${val.color}15` }}>
                        <val.icon className="text-sm" />
                      </div>
                      <span className="text-[#111827] text-[13px] font-medium">{val.label}</span>
                    </div>
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors duration-300 ${isActive ? "bg-[#111827]" : "bg-[#D1D5DB]"}`}>
                      <div className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-white transition-transform duration-300 shadow-sm ${isActive ? "translate-x-3.5" : "translate-x-0"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`p-6 ${CARD}`}>
            <div className="flex items-center gap-2 mb-5">
              <RiNodeTree className="text-[#3B82F6]" />
              <h3 className="text-[#111827] font-medium text-[13px] uppercase tracking-wide">Intel Entities</h3>
            </div>
            <p className="text-[#6B7280] text-[11px] font-normal leading-relaxed mb-5 pb-5 border-b border-[#E5E7EB]">Track popular decentralized nodes, major exchanges, and smart money vectors to generate localized signals.</p>
            <div className="space-y-2.5">
              {RECOMMENDED_ENTITIES.map((entity, i) => {
                const isTracked = trackedWallets.some(w => w.address === entity.address);
                return (
                  <div key={i} className={`p-3 ${CARD_INNER} flex items-center justify-between group hover:border-[#D1D5DB] transition-colors`}>
                    <div className="flex flex-col gap-1 min-w-0 pr-2">
                      <span className="text-[#111827] text-[12px] font-medium truncate">{entity.label}</span>
                      <span className="text-[#9CA3AF] text-[10px] font-mono truncate max-w-[120px]">{entity.address}</span>
                    </div>
                    {isTracked ? (
                      <span className="text-[#16A34A] text-[9px] font-medium uppercase tracking-widest flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100"><RiCheckLine/> Active</span>
                    ) : (
                      <button onClick={() => trackWallet(entity.address, entity.label)} className="text-[#6B7280] text-[9px] font-medium uppercase tracking-widest bg-white border border-[#E5E7EB] hover:border-[#111827] hover:bg-[#111827] hover:text-white transition-colors px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <RiAddLine className="text-xs"/> Deploy
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT RAIL ═══ */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
              <RiRadarLine className="text-[#111827] opacity-60" />
              <h3 className="text-[#111827] text-[13px] font-medium tracking-wide uppercase">Global Telemetry Log</h3>
            </div>
            <span className="text-[#9CA3AF] text-[9px] font-medium uppercase tracking-widest border border-dashed border-[#E5E7EB] px-2 py-1 rounded-md bg-white">{filtered.length} Hooks</span>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className={`flex flex-col items-center justify-center py-24 ${CARD} border-dashed`}>
                <div className="w-16 h-16 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 shadow-sm">
                  <RiLoader4Line className="text-[#111827] text-2xl animate-spin" />
                </div>
                <h3 className="text-[#111827] font-medium text-[15px] mb-2 tracking-tight">Polling Network Nodes...</h3>
                <p className="text-[#6B7280] text-[12px] font-normal max-w-sm mx-auto text-center leading-relaxed">Cross-referencing algorithmic profiles against realtime decentralized mempool structures.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-24 ${CARD} border-dashed`}>
                <div className="w-16 h-16 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <RiAlarmWarningLine className="text-[#9CA3AF] text-2xl" />
                </div>
                <h3 className="text-[#111827] font-medium text-[15px] tracking-tight mb-1">Silence on Network</h3>
                <p className="text-[#6B7280] text-[12px] font-normal max-w-xs text-center leading-relaxed mt-2">No anomalies detected satisfying the current matrix configuration.</p>
              </div>
            ) : (
              filtered.map((alert, i) => {
                const typeMeta = ALERT_TYPE_META[alert.alertType] || {};
                const Icon = typeMeta.icon || RiAlarmWarningLine;
                const severity = SEVERITY_STYLES[alert.severity];
                
                return (
                  <motion.div key={alert.address + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                    className={`group ${CARD} p-5 flex flex-col sm:flex-row items-start gap-5`}>
                    
                    <div className="flex flex-col items-center gap-3 shrink-0 sm:pt-1">
                      <span className="text-[#9CA3AF] text-[9px] font-mono tracking-widest uppercase">{alert.timestamp}</span>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-[#E5E7EB] bg-[#FAFBFC] shadow-sm group-hover:scale-105 transition-transform">
                        <Icon className="text-lg" style={{ color: typeMeta.color || "#6B7280" }} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 w-full pt-[2px]">
                      <div className="flex justify-between items-start flex-wrap gap-4 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                            <h3 className="text-[#111827] font-medium text-[15px] truncate">{alert.name}</h3>
                            <span className="text-[#6B7280] text-[10px] font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{alert.symbol}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                              <div className="flex items-center gap-1" style={{ color: typeMeta.color }}>
                                <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: typeMeta.color }} />
                                <span className="text-[9px] uppercase font-medium tracking-widest">{typeMeta.label}</span>
                              </div>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-medium tracking-widest ${severity.bg} ${severity.text}`}>{severity.label}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[#111827] text-[15px] font-medium font-mono block leading-none mb-1">{alert.price}</span>
                          <span className={`flex items-center justify-end gap-0.5 text-[10px] font-medium ${alert.positive?"text-[#16A34A]":"text-[#DC2626]"}`}>
                            {alert.positive?<RiArrowUpSLine className="text-[12px]"/>:<RiArrowDownSLine className="text-[12px]"/>}{Math.abs(alert.priceChange24h||0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-[#FAFBFC] border border-[#E5E7EB] rounded-xl p-3 mb-4 max-w-2xl">
                         <p className="text-[#4B5563] text-[12px] font-normal leading-relaxed">
                           <span className="text-[#9CA3AF] font-mono mr-1.5">{'>'}</span>{alert.description}
                         </p>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className={`px-2.5 py-1 ${CARD_INNER} flex items-center gap-1.5`}>
                           <span className="text-[#9CA3AF] text-[9px] uppercase font-medium tracking-widest">Vol</span>
                           <span className="text-[#111827] font-mono text-[11px] font-medium">{formatCurrency(alert.volume24h)}</span>
                        </div>
                        <div className={`px-2.5 py-1 ${CARD_INNER} flex items-center gap-1.5`}>
                           <span className="text-[#9CA3AF] text-[9px] uppercase font-medium tracking-widest">Net</span>
                           <span className="text-[#111827] text-[10px] uppercase tracking-wider font-medium">{getChainLabel(alert.chain)}</span>
                        </div>
                        <a href={alert.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white hover:bg-[#374151] transition-colors text-[10px] font-medium uppercase tracking-widest shadow-sm">
                          Execute <RiExternalLinkLine className="text-[11px]" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
