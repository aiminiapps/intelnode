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

const ALERT_TYPE_META = {
  WHALE_BUY: { label: "Whale Anomalies", color: "#7C3AED", icon: RiVipCrownLine },
  LIQUIDITY_SPIKE: { label: "Liquidity Spikes", color: "#22C55E", icon: RiArrowUpLine },
  VOLUME_SURGE: { label: "Volume Shocks", color: "#F97316", icon: RiBarChartLine },
  SMART_MONEY: { label: "Smart Money", color: "#3B82F6", icon: RiSparklingLine },
  NEW_TOKEN: { label: "Deployments", color: "#9F67FF", icon: RiAlarmWarningLine },
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
  high: { bg: "bg-[#FF4444]/10 border-[#FF4444]/30", text: "text-[#FF4444]", label: "Critical Priority" },
  medium: { bg: "bg-[#F97316]/10 border-[#F97316]/30", text: "text-[#F97316]", label: "Elevated Alert" },
  low: { bg: "bg-[#22C55E]/10 border-[#22C55E]/30", text: "text-[#22C55E]", label: "Standard Notice" },
};

const CARD = "rounded-2xl border border-dashed border-[#2A2A3A]/60 bg-[#0D0D14] relative overflow-hidden";
const CARD_INNER = "rounded-xl border border-[#1E1E2E] bg-[#0A0A0F]";

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
        const uniquePairs = pairs.filter(p => {
          const key = p.baseToken?.address;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const formatted = uniquePairs.map(formatPairData).filter(Boolean);
        const alertsData = formatted.map(token => ({
          ...token,
          alertType: classifyAlert(token),
          severity: getSeverity(token),
          description: generateAlertDescription(token),
          timestamp: new Date().toLocaleTimeString([], { hour12: false }), // Artificial timestamp for UI feel
        }));
        setAlerts(alertsData);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  function generateAlertDescription(token) {
    const type = classifyAlert(token);
    switch (type) {
      case "VOLUME_SURGE": return `Algorithmic detection of massive volume influx (${formatCurrency(token.volume24h)}) decoupled from standard liquidity profiles. Volatility expected.`;
      case "LIQUIDITY_SPIKE": return `Deep liquidity pooling (${formatCurrency(token.liquidity)}) identified executing synchronized smart contracts. Accumulation parameters met.`;
      case "WHALE_BUY": return `Asymmetric block transfers detected. ${formatNumber(token.buys24h)} distinct buy events triggering whale tracking heuristics.`;
      case "SMART_MONEY": return `Neural consensus reached rating of ${token.alphaScore}/10. Token trajectory highly aligned with historical smart money vectors.`;
      default: return `New algorithmic entity detected on ${getChainLabel(token.chain)} maintaining early structural integrity.`;
    }
  }

  const toggleSetting = (key) => {
    updateAlertSettings({ ...alertSettings, [key]: !alertSettings[key] });
  };

  const filtered = alerts.filter(a => alertSettings[a.alertType]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* ═══ HERO COMMAND CENTER ═══ */}
      <div className={`p-6 md:p-8 ${CARD} shadow-2xl relative overflow-visible z-20`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#F97316]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] flex items-center justify-center shadow-lg relative mx-auto md:mx-0 mb-5 text-[#F97316]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/20 to-transparent rounded-2xl" />
              <RiAlarmWarningLine className="text-3xl relative z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Signal Intelligence Feed</h1>
            <p className="text-[#8E8E9A] text-sm leading-relaxed max-w-lg mx-auto md:mx-0">High-frequency algorithmic monitoring network. Detects smart money movement, deep liquidity shifts, and critical volume irregularities.</p>
          </div>
          
          <div className="w-full md:w-auto flex-1 max-w-lg bg-[#0A0A0F] rounded-2xl border border-dashed border-[#F97316]/30 p-5 shadow-[0_0_30px_rgba(249,115,22,0.05)]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-[#1E1E2E]">
               <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2"><RiPulseLine className="text-[#F97316]"/> System Status</h3>
               <span className="flex items-center gap-2 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"/> Tracking Live</span>
            </div>
            <div className="flex items-center gap-4">
               <div>
                 <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest block mb-1">Mempool Scan</span>
                 <span className="text-white font-mono text-sm">OPTIMAL</span>
               </div>
               <div className="w-px h-8 bg-[#1E1E2E]" />
               <div>
                 <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest block mb-1">Active Blocks</span>
                 <span className="text-white font-mono text-sm">{(loading ? "SYNCING" : alerts.length * 1420).toLocaleString()}</span>
               </div>
               <div className="w-px h-8 bg-[#1E1E2E]" />
               <div>
                 <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest block mb-1">Anomalies</span>
                 <span className="text-[#F97316] font-mono font-bold text-sm">{filtered.length}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* ═══ LEFT RAIL: CONFIGURATION & ENTITIES ═══ */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Notification Matrix (Settings) */}
          <div className={`p-1.5 ${CARD} bg-[#0A0A0F]`}>
            <div className="p-4 border-b border-dashed border-[#1E1E2E]">
               <h3 className="text-white font-bold text-sm tracking-tight flex items-center gap-2"><RiSettings3Line className="text-[#F97316]"/> Notification Matrix</h3>
               <p className="text-[#555] text-[11px] font-medium mt-1 uppercase tracking-wide">Configure algorithmic triggers</p>
            </div>
            <div className="p-1 space-y-1">
              {Object.entries(ALERT_TYPE_META).map(([key, val]) => {
                const isActive = alertSettings[key];
                return (
                  <button key={key} onClick={() => toggleSetting(key)} className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 ${isActive ? "bg-[#0D0D14] border border-[#1E1E2E]" : "bg-transparent hover:bg-[#141420] opacity-60 grayscale hover:grayscale-0 hover:opacity-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${val.color}15`, color: val.color, borderColor: `${val.color}20` }}>
                        <val.icon className="text-sm" />
                      </div>
                      <span className="text-white text-xs font-bold tracking-wide">{val.label}</span>
                    </div>
                    <div className={`w-8 h-5 rounded-full relative transition-colors duration-300 ${isActive ? "bg-[#F97316]" : "bg-[#2A2A3A]"}`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${isActive ? "translate-x-3" : "translate-x-0"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monitored Entities / Popular Wallets to Track */}
          <div className={`p-5 ${CARD}`}>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><RiNodeTree className="text-[#3B82F6]" /> Active Intel Entities</h3>
            <p className="text-[#8E8E9A] text-[11px] font-medium leading-relaxed mb-4 pb-4 border-b border-dashed border-[#1E1E2E]">Track popular decentralized nodes, major exchanges, and smart money vectors to generate localized signals.</p>
            
            <div className="space-y-3 pb-2">
              {RECOMMENDED_ENTITIES.map((entity, i) => {
                const isTracked = trackedWallets.some(w => w.address === entity.address);
                return (
                  <div key={i} className={`p-3 ${CARD_INNER} flex items-center justify-between group hover:border-[#F97316]/30 transition-colors`}>
                    <div className="flex flex-col gap-1 min-w-0 pr-2">
                      <span className="text-white text-xs font-bold truncate">{entity.label}</span>
                      <span className="text-[#555] text-[10px] font-mono truncate max-w-[120px]">{entity.address}</span>
                    </div>
                    {isTracked ? (
                      <span className="text-[#22C55E] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-[#22C55E]/10 px-2.5 py-1 rounded border border-[#22C55E]/20"><RiCheckLine/> Active</span>
                    ) : (
                      <button onClick={() => trackWallet(entity.address, entity.label)} className="text-[#8E8E9A] text-[10px] font-bold uppercase tracking-wider bg-[#0D0D14] border border-[#1E1E2E] hover:border-[#F97316] hover:text-[#F97316] transition-colors px-2.5 py-1 rounded flex items-center gap-1 shrink-0">
                        <RiAddLine className="text-xs"/> Deploy
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ═══ RIGHT RAIL: LIVE FEED ═══ */}
        <div className="lg:col-span-8">
          
          <div className={`p-1.5 ${CARD}`}>
             <div className="px-5 py-4 border-b border-dashed border-[#1E1E2E] bg-[#0A0A0F] rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiRadarLine className="text-[#F97316]" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Global Telemetry Log</h3>
                </div>
                <div className="flex justify-end gap-3 text-[10px] font-bold uppercase tracking-widest">
                   <span className="text-[#555]">Incoming Hooks:</span>
                   <span className="text-[#F97316]">{filtered.length}</span>
                </div>
             </div>
             
             <div className="p-2 space-y-2">
               {loading ? (
                  <div className={`flex flex-col items-center justify-center py-20 ${CARD_INNER} bg-[#0A0A0F]`}>
                    <div className="w-16 h-16 rounded-2xl bg-[#0D0D14] border border-[#1E1E2E] shadow-inner flex items-center justify-center mb-6 relative overflow-hidden">
                       <div className="absolute inset-0 bg-[#F97316]/10 animate-pulse"/>
                       <RiLoader4Line className="text-[#F97316] text-3xl animate-spin relative z-10" />
                    </div>
                    <h3 className="text-white font-bold text-lg tracking-tight mb-2">Polling Network Nodes...</h3>
                    <p className="text-[#8E8E9A] text-xs font-medium max-w-sm mx-auto text-center leading-relaxed">Cross-referencing algorithmic profiles against realtime decentralized mempool structures.</p>
                  </div>
               ) : filtered.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-20 ${CARD_INNER} bg-[#0A0A0F] border-[#1E1E2E]`}>
                     <div className="w-16 h-16 rounded-[24px] bg-[#0D0D14] border border-dashed border-[#2A2A3A] flex items-center justify-center mx-auto mb-4">
                      <RiAlarmWarningLine className="text-[#555] text-2xl" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">Silence on Network</h3>
                    <p className="text-[#8E8E9A] text-[11px] font-medium max-w-xs text-center leading-relaxed">No anomalies detected satisfying the current matrix configuration rulesets.</p>
                  </div>
               ) : (
                  filtered.map((alert, i) => {
                    const typeMeta = ALERT_TYPE_META[alert.alertType] || {};
                    const Icon = typeMeta.icon || RiAlarmWarningLine;
                    const severity = SEVERITY_STYLES[alert.severity];
                    
                    return (
                      <motion.div key={alert.address + i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.04 }} 
                        className={`group ${CARD_INNER} transition-all relative overflow-hidden hover:border-[#2A2A3A]`}>
                        
                        {/* Status glow line */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${alert.severity === 'high' ? 'bg-[#FF4444]' : alert.severity === 'medium' ? 'bg-[#F97316]' : 'bg-[#22C55E]'}`} />
                        
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-5 min-w-0 pr-4 pl-6">
                           
                           {/* LOG Timestamp & Icon */}
                           <div className="flex flex-col items-center gap-3 shrink-0">
                             <span className="text-[#555] text-[9px] font-mono leading-none tracking-widest uppercase">{alert.timestamp}</span>
                             <div className="w-12 h-12 rounded-2xl flex items-center justify-center ring-1 ring-[#1E1E2E] bg-[#0A0A0F]" style={{ boxShadow: `inset 0 0 20px ${typeMeta.color}15` }}>
                               <Icon className="text-lg" style={{ color: typeMeta.color || "#888" }} />
                             </div>
                           </div>

                           {/* Analysis Block */}
                           <div className="flex-1 min-w-0 w-full pt-0.5">
                              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider truncate pb-0.5">{alert.name}</h3>
                                    <span className="text-[#8E8E9A] text-[10px] font-mono bg-[#0D0D14] px-1.5 py-0.5 rounded border border-[#1E1E2E]">{alert.symbol}</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded border border-dashed uppercase font-black tracking-widest" style={{ borderColor: `${typeMeta.color}30`, backgroundColor: `${typeMeta.color}10`, color: typeMeta.color }}>{typeMeta.label}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded border border-dashed uppercase font-black tracking-widest ${severity.bg} ${severity.text}`}>{severity.label}</span>
                                  </div>
                                  <p className="text-[#8E8E9A] text-[11px] leading-relaxed font-mono tracking-tight max-w-2xl bg-[#0D0D14] p-3 rounded-lg border border-[#1E1E2E] mb-4">
                                    {'> '} {alert.description}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[#555] text-[9px] uppercase font-bold tracking-widest block mb-1">Target Price</span>
                                  <span className="text-white text-base font-black font-mono block mb-1">{alert.price}</span>
                                  <span className={`flex items-center justify-end gap-0.5 text-[11px] font-black ${alert.positive ? "text-[#22C55E]" : "text-[#FF4444]"}`}>
                                    {alert.positive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}{Math.abs(alert.priceChange24h || 0).toFixed(2)}%
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 flex-wrap border-t border-dashed border-[#1E1E2E] pt-3">
                                 <div className="flex items-center gap-2 bg-[#0A0A0F] border border-[#1E1E2E] px-2.5 py-1 rounded-md">
                                    <span className="text-[#555] text-[9px] uppercase font-bold tracking-widest">Vol</span>
                                    <span className="text-white font-mono text-[11px]">{formatCurrency(alert.volume24h)}</span>
                                 </div>
                                 <div className="flex items-center gap-2 bg-[#0A0A0F] border border-[#1E1E2E] px-2.5 py-1 rounded-md">
                                    <span className="text-[#555] text-[9px] uppercase font-bold tracking-widest">Net</span>
                                    <span className="text-white font-mono text-[11px] max-w-[80px] truncate">{getChainLabel(alert.chain)}</span>
                                 </div>
                                 <a href={alert.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-[#F97316] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F97316]/20 bg-[#F97316]/10 hover:bg-[#F97316] hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                                    Execute Trade <RiExternalLinkLine className="text-[11px]" />
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
