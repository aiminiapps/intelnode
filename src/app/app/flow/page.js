"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiNodeTree, RiPulseLine, RiWallet3Line, RiExchangeLine,
  RiArrowRightUpLine, RiRefreshLine, RiEyeLine,
  RiStackLine, RiInformationLine, RiShieldUserLine, RiCornerDownRightLine,
  RiGlobalLine, RiFundsLine, RiLinkM, RiDatabase2Line, RiTimeLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";

/* ═══════════════════════════════════════════
   REUSABLE PATTERNS
   ═══════════════════════════════════════════ */
function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
        backgroundSize: `${size} ${size}`,
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   EXCHANGE LOGOS
   ═══════════════════════════════════════════ */
const LogoBinance = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L16.5 6.5L12 11L7.5 6.5Z M2 12L6.5 7.5L11 12L6.5 16.5Z M22 12L17.5 7.5L13 12L17.5 16.5Z M12 22L7.5 17.5L12 13L16.5 17.5Z"/>
  </svg>
);

const LogoCoinbase = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 15c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z"/>
  </svg>
);

const LogoOKX = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 4h16v3H4V4zm0 6h8v10H4V10zm10 0h6v3h-6v-3zm0 5h6v5h-6v-5z"/>
  </svg>
);

/* ═══════════════════════════════════════════
   DATA SIMULATION
   ═══════════════════════════════════════════ */
const EXCHANGE_NODES = [
  { id: "binance", label: "Binance", type: "exchange", x: 0.8, y: 0.2, logo: LogoBinance },
  { id: "coinbase", label: "Coinbase", type: "exchange", x: 0.2, y: 0.25, logo: LogoCoinbase },
  { id: "okx", label: "OKX", type: "exchange", x: 0.5, y: 0.4, logo: LogoOKX },
];

const PROTOCOL_NODES = [
  { id: "uniswap", label: "Uniswap V3", type: "protocol", x: 0.35, y: 0.65 },
  { id: "aave", label: "Aave V3", type: "protocol", x: 0.65, y: 0.65 },
  { id: "layerzero", label: "LayerZero", type: "protocol", x: 0.5, y: 0.85 },
];

function generateFlows(wallets) {
  const allNodes = [...EXCHANGE_NODES, ...PROTOCOL_NODES];
  const flows = [];
  const walletNodes = wallets.slice(0, 6).map((w, i) => ({
    id: `w_${i}`, label: w.label || (w.address.slice(0, 6) + "..." + w.address.slice(-4)), type: "wallet",
    x: 0.15 + (i * 0.14), y: 0.9, address: w.address,
  }));
  const allWithWallets = [...allNodes, ...walletNodes];

  const amount = (mult) => Math.round(Math.random() * mult + 100);

  // Cross-entity flows
  walletNodes.forEach(w => {
    const targets = allNodes.filter(() => Math.random() > 0.4).slice(0, 3);
    targets.forEach(t => {
      flows.push({ id: `${w.id}-${t.id}`, from: w.id, to: t.id, amount: amount(800), token: Math.random() > 0.5 ? "ETH" : "USDC", speed: 1.5 + Math.random() });
    });
  });
  
  EXCHANGE_NODES.forEach((ex, i) => {
    if (i < EXCHANGE_NODES.length - 1) {
      flows.push({ id: `${ex.id}-${EXCHANGE_NODES[i + 1].id}`, from: ex.id, to: EXCHANGE_NODES[i + 1].id, amount: amount(5000), token: "USDT", speed: 1 + Math.random() });
    }
  });

  PROTOCOL_NODES.forEach((p) => {
    const ex = EXCHANGE_NODES[Math.floor(Math.random() * EXCHANGE_NODES.length)];
    flows.push({ id: `${p.id}-${ex.id}`, from: p.id, to: ex.id, amount: amount(2000), token: "USDC", speed: 1.2 + Math.random() });
  });

  return { nodes: allWithWallets, flows };
}

/* ═══════════════════════════════════════════
   ADVANCED GRAPH COMPONENT
   ═══════════════════════════════════════════ */
function AdvancedFlowGraph({ nodes, flows, selected, onSelect }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setDims({ w: entries[0].contentRect.width, h: entries[0].contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[650px] overflow-hidden rounded-xl bg-white border border-[#E5E7EB]">
      {/* Intricate Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#6B7280 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}
      />
      <CrosshatchStrip className="absolute top-0 left-0 right-0 h-2 pointer-events-none opacity-[0.15]" color="rgba(0,0,0,0.15)" size="5px" />
      <CrosshatchStrip className="absolute bottom-0 left-0 right-0 h-2 pointer-events-none opacity-[0.15]" color="rgba(0,0,0,0.15)" size="5px" />

      {/* SVG Edges Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {flows.map((flow, idx) => {
          const fromNode = nodes.find(n => n.id === flow.from);
          const toNode = nodes.find(n => n.id === flow.to);
          if (!fromNode || !toNode) return null;
          
          const x1 = fromNode.x * dims.w;
          const y1 = fromNode.y * dims.h;
          const x2 = toNode.x * dims.w;
          const y2 = toNode.y * dims.h;
          
          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2 - Math.abs(x1 - x2) * 0.15; // Curve logic

          const isSelected = selected && (flow.from === selected || flow.to === selected);
          const isFaded = selected && !isSelected;
          
          return (
             <g key={`flow-${idx}`}>
               {/* Base Ghost Trace */}
               <path 
                 d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} 
                 fill="none" 
                 stroke={isSelected ? "#111827" : "#9CA3AF"} 
                 strokeWidth={isSelected ? 2 : 1.5}
                 strokeOpacity={isFaded ? 0.05 : isSelected ? 0.3 : 0.15}
                 className="transition-all duration-300"
               />
               {/* Animated Pulse Stream */}
               {!isFaded && (
                 <path 
                   d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} 
                   fill="none" 
                   stroke={isSelected ? "#111827" : "#6B7280"} 
                   strokeWidth={isSelected ? 3 : 2}
                   strokeDasharray="4 28"
                   strokeLinecap="round"
                   strokeOpacity={isSelected ? 1 : 0.4}
                   style={{ animation: `flow-anim ${flow.speed}s linear infinite` }}
                 />
               )}
             </g>
          );
        })}
      </svg>
      
      {/* HTML DOM Nodes Layer */}
      {nodes.map((node) => {
         const isSelected = selected === node.id;
         const isFaded = selected && !isSelected;
         
         const isExchange = node.type === "exchange";
         const isProtocol = node.type === "protocol";
         const IconConfig = isExchange ? node.logo : isProtocol ? RiStackLine : RiWallet3Line;
         
         return (
           <motion.div
             key={node.id}
             className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-out flex flex-col items-center ${isFaded ? 'opacity-30 scale-95 grayscale' : 'opacity-100 scale-100'}`}
             style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%`, zIndex: isSelected ? 50 : 10 }}
             onClick={() => onSelect(isSelected ? null : node.id)}
             whileHover={{ scale: 1.05 }}
           >
             {/* Selected Halo Pulse */}
             {isSelected && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#111827]/10 blur-xl pointer-events-none animate-pulse" />
             )}
             
             {isExchange ? (
               <div className={`relative flex items-center justify-center rounded-2xl w-14 h-14 shadow-xl border-[3px] transition-colors ${isSelected ? 'border-[#111827] bg-[#111827] text-white shadow-[#111827]/20 z-20' : 'border-white bg-[#111827] text-white hover:border-[#111827]/30'}`}>
                 <CrosshatchStrip className="absolute inset-0 opacity-[0.15] pointer-events-none rounded-xl" color="rgba(255,255,255,0.4)" />
                 <div className="w-7 h-7 relative z-10 drop-shadow-md">
                   {<IconConfig className="w-full h-full" />}
                 </div>
               </div>
             ) : isProtocol ? (
               <div className={`relative flex items-center justify-center rounded-full w-12 h-12 shadow-lg border-[3px] transition-colors ${isSelected ? 'border-[#111827] bg-[#111827] text-white z-20' : 'border-white bg-[#F3F4F6] text-[#111827] hover:border-[#111827]/30'}`}>
                 {isSelected && <CrosshatchStrip className="absolute inset-0 opacity-[0.15] pointer-events-none rounded-full" color="rgba(255,255,255,0.4)" />}
                 <IconConfig className="w-5 h-5 relative z-10" />
               </div>
             ) : (
               <div className={`relative flex items-center justify-center rounded-full w-10 h-10 shadow-md border-[3px] transition-colors ${isSelected ? 'border-[#111827] bg-[#111827] text-white z-20' : 'border-white bg-white text-[#6B7280] hover:border-[#111827]/30'}`}>
                 {isSelected && <CrosshatchStrip className="absolute inset-0 opacity-[0.15] pointer-events-none rounded-full" color="rgba(255,255,255,0.4)" />}
                 <IconConfig className="w-4 h-4 relative z-10" />
               </div>
             )}
             
             {/* Node Label Badge */}
             <div className={`mt-3 px-3 py-1 rounded-md text-[10px] font-bold tracking-[0.15em] whitespace-nowrap border uppercase transition-colors shadow-sm ${isSelected ? 'bg-[#111827] text-white border-[#111827] shadow-lg z-20' : 'bg-white/95 text-[#4B5563] border-[#E5E7EB] backdrop-blur-md'}`}>
               {node.label}
             </div>
           </motion.div>
         );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function FlowPage() {
  const { trackedWallets } = useTokens();
  const [selectedNode, setSelectedNode] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { nodes, flows } = useMemo(() => generateFlows(trackedWallets), [trackedWallets, refreshKey]);

  const selectedInfo = useMemo(() => {
    if (!selectedNode) return null;
    const node = nodes.find(n => n.id === selectedNode);
    const outFlows = flows.filter(f => f.from === selectedNode);
    const inFlows = flows.filter(f => f.to === selectedNode);
    const totalOut = outFlows.reduce((a, f) => a + f.amount, 0);
    const totalIn = inFlows.reduce((a, f) => a + f.amount, 0);
    return { node, outFlows, inFlows, totalOut, totalIn };
  }, [selectedNode, nodes, flows]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto min-h-screen pb-12">
      {/* Global Style overrides */}
      <style>{`
        @keyframes flow-anim {
          from { stroke-dashoffset: 32; }
          to { stroke-dashoffset: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #D1D5DB; }
      `}</style>

      {/* PREMIUM HERO BANNER */}
      <div className="relative rounded-2xl bg-[#111827] p-8 md:p-10 overflow-hidden shadow-2xl border border-gray-800">
        {/* Full textured crosshatch overlay */}
        <CrosshatchStrip className="absolute inset-0 opacity-[0.08] pointer-events-none" color="rgba(255,255,255,0.7)" size="8px" />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
           <div className="flex-1">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/10 border border-white/10 text-white/90 text-[10px] font-bold tracking-[0.2em] uppercase mb-5 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" /> Live Topology Sync
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">Whale Flow Visualizer</h1>
             <p className="text-white/60 text-sm leading-relaxed max-w-2xl font-medium">Advanced interactive matrix mapping on-chain capital velocity. Monitor highly algorithmic tracking connections between global exchanges, DeFi venues, and your personalized web3 monitored endpoints.</p>
           </div>
           <div className="flex flex-wrap items-center gap-3 shrink-0">
             <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-center backdrop-blur-md">
               <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em] block mb-1">Active Nodes</span>
               <span className="text-white font-black text-2xl font-mono">{nodes.length}</span>
             </div>
             <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-center backdrop-blur-md">
               <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em] block mb-1">Pathways</span>
               <span className="text-white font-black text-2xl font-mono">{flows.length}</span>
             </div>
             <button onClick={() => { setRefreshKey(k => k + 1); setSelectedNode(null); }} className="w-14 h-[76px] flex items-center justify-center rounded-xl bg-white text-[#111827] hover:bg-gray-100 transition-colors shadow-lg">
               <RiRefreshLine className="text-2xl" />
             </button>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* CANVAS PARENT */}
        <div className="lg:col-span-8">
          <div className="p-1.5 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F8F9FB] rounded-t-xl flex items-center justify-between relative overflow-hidden">
              <CrosshatchStrip className="absolute top-0 right-0 bottom-0 w-32 opacity-10 pointer-events-none" size="6px" />
              <div className="flex items-center gap-3 relative z-10"><RiPulseLine className="text-[#111827] shrink-0" /><h3 className="text-[#111827] font-bold text-sm uppercase tracking-[0.15em]">Network Topology Map</h3></div>
              <div className="flex items-center gap-2 relative z-10"><span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" /><span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">Streaming</span></div>
            </div>
            <div className="p-2 bg-[#FAFBFC] rounded-b-xl border-t border-white">
              <AdvancedFlowGraph nodes={nodes} flows={flows} selected={selectedNode} onSelect={setSelectedNode} />
            </div>
          </div>
        </div>

        {/* INFO PANEL */}
        <div className="lg:col-span-4 h-full">
          <AnimatePresence mode="wait">
            {!selectedInfo ? (
              <motion.div key="macro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 h-full flex flex-col">
                <div className="p-7 rounded-2xl border border-[#E5E7EB] bg-white relative overflow-hidden shadow-sm flex-1">
                  <CrosshatchStrip className="absolute -top-10 -right-10 w-48 h-48 opacity-[0.03] rotate-12 pointer-events-none" size="8px" />
                  
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#111827] text-white flex items-center justify-center shadow-sm relative overflow-hidden shrink-0">
                      <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.2)" />
                      <RiGlobalLine className="font-semibold text-2xl relative z-10"/>
                    </div>
                    <div>
                      <h3 className="text-[#111827] font-black text-lg tracking-tight">Macro Overview</h3>
                      <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-[0.15em]">Global Network State</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB] hover:border-[#111827]/20 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><RiFundsLine /></div>
                         <span className="text-[#4B5563] text-xs font-bold">Total Capital Flow</span>
                       </div>
                       <span className="text-[#111827] font-black font-mono text-base">${flows.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB] hover:border-[#111827]/20 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><RiLinkM /></div>
                         <span className="text-[#4B5563] text-xs font-bold">Active Connections</span>
                       </div>
                       <span className="text-[#111827] font-black font-mono text-base">{flows.length} Paths</span>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E7EB] hover:border-[#111827]/20 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><RiDatabase2Line /></div>
                         <span className="text-[#4B5563] text-xs font-bold">Monitored Entities</span>
                       </div>
                       <span className="text-[#111827] font-black font-mono text-base">{nodes.length} Nodes</span>
                    </div>
                  </div>

                  <div className="mt-8 p-5 rounded-xl border border-[#111827]/10 bg-[#FAFBFC] relative z-10">
                     <div className="flex gap-2.5 mb-2"><RiEyeLine className="text-[#111827] text-lg shrink-0" /><h4 className="text-[#111827] font-bold text-sm">Interactive Mapping</h4></div>
                     <p className="text-[#6B7280] text-xs leading-relaxed pl-7">Select any exchange, protocol, or wallet node on the canvas to isolate its capital streams and inspect detailed transaction trails.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 h-full flex flex-col">
                <div className="p-7 rounded-2xl border border-[#111827] bg-[#FAFBFC] shadow-xl relative overflow-hidden flex-1 flex flex-col">
                  <CrosshatchStrip className="absolute top-0 right-0 bottom-0 w-32 opacity-[0.03] pointer-events-none" size="6px" />
                  <CrosshatchStrip className="absolute -left-10 -top-10 w-40 h-40 opacity-[0.03] rotate-45 pointer-events-none" size="8px" />
                  
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E5E7EB] relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden shrink-0">
                         <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.3)" />
                         <div className="relative z-10 text-white w-8 h-8 flex items-center justify-center">
                            {selectedInfo.node.type === "exchange" ? selectedInfo.node.logo ? <selectedInfo.node.logo className="w-full h-full" /> : <RiExchangeLine className="text-2xl"/> : selectedInfo.node.type === "protocol" ? <RiStackLine className="text-2xl" /> : <RiWallet3Line className="text-2xl" />}
                         </div>
                      </div>
                      <div>
                        <h4 className="text-[#111827] font-black text-2xl tracking-tight leading-none mb-2">{selectedInfo.node.label}</h4>
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-white border border-[#E5E7EB] text-[#4B5563] shadow-sm">{selectedInfo.node.type}</span>
                           {selectedInfo.node.type === "exchange" && <span className="flex items-center gap-1 text-[9px] font-bold text-[#16A34A] tracking-widest uppercase bg-[#16A34A]/10 px-2 py-0.5 rounded"><RiShieldUserLine /> VERIFIED</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8 shrink-0 relative z-10">
                    <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm relative overflow-hidden flex flex-col justify-between">
                      <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-[0.15em] block mb-2">Total Inflow</span>
                      <span className="text-[#111827] font-black text-2xl font-mono">${selectedInfo.totalIn.toLocaleString()}</span>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#16A34A]/5 pointer-events-none"><RiCornerDownRightLine className="text-[80px] scale-x-[-1]" /></div>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-sm relative overflow-hidden flex flex-col justify-between">
                      <span className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-[0.15em] block mb-2">Total Outflow</span>
                      <span className="text-[#111827] font-black text-2xl font-mono">${selectedInfo.totalOut.toLocaleString()}</span>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#DC2626]/5 pointer-events-none"><RiCornerDownRightLine className="text-[80px]" /></div>
                    </div>
                  </div>

                  <h5 className="flex items-center gap-2 text-[#111827] font-bold text-sm mb-4 shrink-0 relative z-10"><RiTimeLine /> Active Streams ({selectedInfo.inFlows.length + selectedInfo.outFlows.length})</h5>
                  
                  <div className="space-y-2.5 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-10 min-h-[250px]">
                    {[...selectedInfo.inFlows.map(f => ({ ...f, dir: "in" })), ...selectedInfo.outFlows.map(f => ({ ...f, dir: "out" }))].map((f, i) => {
                      const other = nodes.find(n => n.id === (f.dir === "in" ? f.from : f.to));
                      return (
                        <div key={i} className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-between hover:border-[#111827]/40 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-3.5">
                             <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${f.dir === "in" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#DC2626]/10 text-[#DC2626]"}`}>
                               {f.dir === "in" ? <RiCornerDownRightLine className="scale-x-[-1] text-lg" /> : <RiCornerDownRightLine className="text-lg" />}
                             </div>
                             <div>
                               <p className="text-[#111827] text-[13px] font-bold leading-tight mb-0.5">{other?.label || "Unknown"}</p>
                               <p className="text-[#9CA3AF] text-[9px] uppercase tracking-[0.15em] font-bold">{f.dir === "in" ? "SOURCE" : "DESTINATION"}</p>
                             </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#111827] font-mono font-black text-[15px] leading-tight mb-0.5">${f.amount.toLocaleString()}</p>
                            <span className="px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280] text-[9px] font-mono font-bold">{f.token}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

