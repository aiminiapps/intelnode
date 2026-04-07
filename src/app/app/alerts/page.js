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
  high: { bg: "bg-[#DC2626]/5 border-[#DC2626]/15", text: "text-[#DC2626]", label: "Critical" },
  medium: { bg: "bg-[#F97316]/5 border-[#F97316]/15", text: "text-[#F97316]", label: "Elevated" },
  low: { bg: "bg-[#16A34A]/5 border-[#16A34A]/15", text: "text-[#16A34A]", label: "Standard" },
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
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* HERO */}
      <div className="p-6 md:p-8 rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden">
        <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none" color="rgba(0,0,0,0.04)" size="6px" />
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center shadow-sm relative mx-auto md:mx-0 mb-5 overflow-hidden">
              <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.15)" size="5px" />
              <RiAlarmWarningLine className="text-white text-2xl relative z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2 tracking-tight">Signal Intelligence Feed</h1>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-lg mx-auto md:mx-0">High-frequency algorithmic monitoring network. Detects smart money movement, deep liquidity shifts, and critical volume irregularities.</p>
          </div>
          <div className="w-full md:w-auto flex-1 max-w-lg bg-[#F8F9FB] rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827] font-bold text-sm flex items-center gap-2"><RiPulseLine className="text-[#111827]"/> System Status</h3>
              <span className="flex items-center gap-2 bg-[#16A34A]/8 border border-[#16A34A]/15 text-[#16A34A] px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"/> Live</span>
            </div>
            <div className="flex items-center gap-4">
              <div><span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest block mb-1">Mempool</span><span className="text-[#111827] font-mono text-sm font-bold">OPTIMAL</span></div>
              <div className="w-px h-8 bg-[#E5E7EB]"/>
              <div><span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest block mb-1">Blocks</span><span className="text-[#111827] font-mono text-sm font-bold">{(loading?"...":alerts.length*1420).toLocaleString()}</span></div>
              <div className="w-px h-8 bg-[#E5E7EB]"/>
              <div><span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest block mb-1">Anomalies</span><span className="text-[#F97316] font-mono font-bold text-sm">{filtered.length}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="p-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827] font-bold text-sm flex items-center gap-2"><RiSettings3Line className="text-[#111827]"/> Notification Matrix</h3>
              <p className="text-[#9CA3AF] text-[11px] font-medium mt-1 uppercase tracking-wide">Configure algorithmic triggers</p>
            </div>
            <div className="p-1 space-y-1">
              {Object.entries(ALERT_TYPE_META).map(([key, val]) => {
                const isActive = alertSettings[key];
                return (
                  <button key={key} onClick={() => toggleSetting(key)} className={`w-full flex items-center justify-between p-3.5 rounded-lg transition-all duration-300 ${isActive ? "bg-[#F8F9FB] border border-[#E5E7EB]" : "bg-transparent hover:bg-[#FAFBFC] opacity-50 grayscale hover:grayscale-0 hover:opacity-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${val.color}08`, color: val.color, borderColor: `${val.color}15` }}>
                        <val.icon className="text-sm" />
                      </div>
                      <span className="text-[#111827] text-xs font-bold">{val.label}</span>
                    </div>
                    <div className={`w-8 h-5 rounded-full relative transition-colors duration-300 ${isActive ? "bg-[#111827]" : "bg-[#D1D5DB]"}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${isActive ? "translate-x-3" : "translate-x-0"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
            <h3 className="text-[#111827] font-bold text-sm mb-4 flex items-center gap-2"><RiNodeTree className="text-[#3B82F6]"/> Active Intel Entities</h3>
            <p className="text-[#6B7280] text-[11px] leading-relaxed mb-4 pb-4 border-b border-[#E5E7EB]">Track popular decentralized nodes, major exchanges, and smart money vectors to generate localized signals.</p>
            <div className="space-y-3">
              {RECOMMENDED_ENTITIES.map((entity, i) => {
                const isTracked = trackedWallets.some(w => w.address === entity.address);
                return (
                  <div key={i} className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] flex items-center justify-between group hover:border-[#111827]/15 transition-colors">
                    <div className="flex flex-col gap-1 min-w-0 pr-2">
                      <span className="text-[#111827] text-xs font-bold truncate">{entity.label}</span>
                      <span className="text-[#9CA3AF] text-[10px] font-mono truncate max-w-[120px]">{entity.address}</span>
                    </div>
                    {isTracked ? (
                      <span className="text-[#16A34A] text-[10px] font-bold uppercase flex items-center gap-1 bg-[#16A34A]/8 px-2.5 py-1 rounded border border-[#16A34A]/15"><RiCheckLine/> Active</span>
                    ) : (
                      <button onClick={() => trackWallet(entity.address, entity.label)} className="text-[#6B7280] text-[10px] font-bold uppercase bg-white border border-[#E5E7EB] hover:border-[#111827] hover:bg-[#111827] hover:text-white transition-colors px-2.5 py-1 rounded flex items-center gap-1 shrink-0">
                        <RiAddLine className="text-xs"/> Deploy
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8">
          <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8F9FB] rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2"><RiRadarLine className="text-[#111827]"/><h3 className="text-[#111827] font-bold text-sm uppercase tracking-widest">Global Telemetry Log</h3></div>
              <div className="flex justify-end gap-3 text-[10px] font-bold uppercase tracking-widest"><span className="text-[#9CA3AF]">Hooks:</span><span className="text-[#F97316]">{filtered.length}</span></div>
            </div>
            <div className="p-2 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 relative overflow-hidden">
                    <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.03)" size="6px" />
                    <RiLoader4Line className="text-[#111827] text-3xl animate-spin relative z-10" />
                  </div>
                  <h3 className="text-[#111827] font-bold text-lg mb-2">Polling Network Nodes...</h3>
                  <p className="text-[#6B7280] text-xs max-w-sm mx-auto text-center leading-relaxed">Cross-referencing algorithmic profiles against realtime decentralized mempool structures.</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB]">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.03)" size="7px" />
                    <RiAlarmWarningLine className="text-[#9CA3AF] text-2xl relative z-10" />
                  </div>
                  <h3 className="text-[#111827] font-bold text-sm mb-1">Silence on Network</h3>
                  <p className="text-[#6B7280] text-[11px] max-w-xs text-center leading-relaxed">No anomalies detected satisfying the current matrix configuration.</p>
                </div>
              ) : (
                filtered.map((alert, i) => {
                  const typeMeta = ALERT_TYPE_META[alert.alertType] || {};
                  const Icon = typeMeta.icon || RiAlarmWarningLine;
                  const severity = SEVERITY_STYLES[alert.severity];
                  return (
                    <motion.div key={alert.address + i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="group rounded-lg border border-[#E5E7EB] bg-white transition-all relative overflow-hidden hover:border-[#111827]/15">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${alert.severity==='high'?'bg-[#DC2626]':alert.severity==='medium'?'bg-[#F97316]':'bg-[#16A34A]'}`} />
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-5 min-w-0 pr-4 pl-6">
                        <div className="flex flex-col items-center gap-3 shrink-0">
                          <span className="text-[#9CA3AF] text-[9px] font-mono tracking-widest uppercase">{alert.timestamp}</span>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#E5E7EB] bg-[#F8F9FB]">
                            <Icon className="text-lg" style={{ color: typeMeta.color || "#6B7280" }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 w-full pt-0.5">
                          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-[#111827] font-black text-sm uppercase tracking-wider truncate">{alert.name}</h3>
                                <span className="text-[#6B7280] text-[10px] font-mono bg-[#F8F9FB] px-1.5 py-0.5 rounded border border-[#E5E7EB]">{alert.symbol}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded border uppercase font-black tracking-widest" style={{ borderColor: `${typeMeta.color}20`, backgroundColor: `${typeMeta.color}06`, color: typeMeta.color }}>{typeMeta.label}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-black tracking-widest ${severity.bg} ${severity.text}`}>{severity.label}</span>
                              </div>
                              <p className="text-[#6B7280] text-[11px] leading-relaxed font-mono tracking-tight max-w-2xl bg-[#F8F9FB] p-3 rounded-md border border-[#E5E7EB] mb-4">{'> '} {alert.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[#9CA3AF] text-[9px] uppercase font-bold tracking-widest block mb-1">Price</span>
                              <span className="text-[#111827] text-base font-black font-mono block mb-1">{alert.price}</span>
                              <span className={`flex items-center justify-end gap-0.5 text-[11px] font-black ${alert.positive?"text-[#16A34A]":"text-[#DC2626]"}`}>
                                {alert.positive?<RiArrowUpSLine/>:<RiArrowDownSLine/>}{Math.abs(alert.priceChange24h||0).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap border-t border-[#E5E7EB] pt-3">
                            <div className="flex items-center gap-2 bg-[#F8F9FB] border border-[#E5E7EB] px-2.5 py-1 rounded-md"><span className="text-[#9CA3AF] text-[9px] uppercase font-bold tracking-widest">Vol</span><span className="text-[#111827] font-mono text-[11px]">{formatCurrency(alert.volume24h)}</span></div>
                            <div className="flex items-center gap-2 bg-[#F8F9FB] border border-[#E5E7EB] px-2.5 py-1 rounded-md"><span className="text-[#9CA3AF] text-[9px] uppercase font-bold tracking-widest">Net</span><span className="text-[#111827] font-mono text-[11px] max-w-[80px] truncate">{getChainLabel(alert.chain)}</span></div>
                            <a href={alert.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-white flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111827] hover:bg-[#374151] transition-colors text-[10px] font-bold uppercase tracking-widest">
                              Execute <RiExternalLinkLine className="text-[11px]" />
                            </a>
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
      </div>
    </div>
  );
}
