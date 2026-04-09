"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
  RiNodeTree, RiPulseLine, RiWallet3Line, RiExchangeLine,
  RiArrowRightLine, RiLoader4Line, RiRefreshLine, RiEyeLine,
  RiSearchLine, RiInformationLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";


function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

/* ═══════════════════════════════════════════
   SIMULATED NODE GRAPH DATA
   In production this would come from on-chain indexing
   ═══════════════════════════════════════════ */
const EXCHANGE_NODES = [
  { id: "binance", label: "Binance", type: "exchange", x: 0.5, y: 0.15 },
  { id: "coinbase", label: "Coinbase", type: "exchange", x: 0.2, y: 0.3 },
  { id: "okx", label: "OKX", type: "exchange", x: 0.8, y: 0.3 },
];

const PROTOCOL_NODES = [
  { id: "uniswap", label: "Uniswap", type: "protocol", x: 0.35, y: 0.55 },
  { id: "aave", label: "Aave", type: "protocol", x: 0.65, y: 0.55 },
  { id: "raydium", label: "Raydium", type: "protocol", x: 0.5, y: 0.7 },
];

function generateFlows(wallets) {
  const allNodes = [...EXCHANGE_NODES, ...PROTOCOL_NODES];
  const flows = [];
  const walletNodes = wallets.slice(0, 6).map((w, i) => ({
    id: `w_${i}`, label: w.label || w.address.slice(0, 8), type: "wallet",
    x: 0.12 + (i * 0.16), y: 0.88, address: w.address,
  }));
  const allWithWallets = [...allNodes, ...walletNodes];

  // Simulate flows between entities
  walletNodes.forEach(w => {
    const targets = allNodes.filter(() => Math.random() > 0.5).slice(0, 2);
    targets.forEach(t => {
      flows.push({ from: w.id, to: t.id, amount: Math.round(Math.random() * 500 + 50), token: Math.random() > 0.5 ? "ETH" : "USDC" });
    });
  });
  // Inter-exchange flows
  EXCHANGE_NODES.forEach((ex, i) => {
    if (i < EXCHANGE_NODES.length - 1) {
      flows.push({ from: ex.id, to: EXCHANGE_NODES[i + 1].id, amount: Math.round(Math.random() * 2000 + 500), token: "USDT" });
    }
  });
  // Protocol interactions
  PROTOCOL_NODES.forEach(p => {
    const ex = EXCHANGE_NODES[Math.floor(Math.random() * EXCHANGE_NODES.length)];
    flows.push({ from: p.id, to: ex.id, amount: Math.round(Math.random() * 1000 + 100), token: "ETH" });
  });

  return { nodes: allWithWallets, flows };
}

function FlowCanvas({ nodes, flows, selected, onSelect }) {
  const canvasRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });
  const animRef = useRef(0);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: Math.max(400, height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, dims.w, dims.h);

      // Draw grid
      ctx.strokeStyle = "rgba(229,231,235,0.5)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < dims.w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dims.h); ctx.stroke(); }
      for (let y = 0; y < dims.h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dims.w, y); ctx.stroke(); }

      // Draw flows
      flows.forEach(flow => {
        const fromNode = nodes.find(n => n.id === flow.from);
        const toNode = nodes.find(n => n.id === flow.to);
        if (!fromNode || !toNode) return;
        const fx = fromNode.x * dims.w, fy = fromNode.y * dims.h;
        const tx = toNode.x * dims.w, ty = toNode.y * dims.h;
        const isHighlighted = selected && (flow.from === selected || flow.to === selected);

        ctx.strokeStyle = isHighlighted ? "rgba(17,24,39,0.35)" : "rgba(17,24,39,0.08)";
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        const mx = (fx + tx) / 2, my = (fy + ty) / 2 - 20;
        ctx.quadraticCurveTo(mx, my, tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated dot along path
        if (isHighlighted || frame % 3 === 0) {
          const t = ((frame * 0.008) % 1);
          const px = (1 - t) * (1 - t) * fx + 2 * (1 - t) * t * mx + t * t * tx;
          const py = (1 - t) * (1 - t) * fy + 2 * (1 - t) * t * my + t * t * ty;
          ctx.fillStyle = isHighlighted ? "#111827" : "rgba(17,24,39,0.2)";
          ctx.beginPath();
          ctx.arc(px, py, isHighlighted ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const nx = node.x * dims.w, ny = node.y * dims.h;
        const isSelected = selected === node.id;
        const r = node.type === "exchange" ? 24 : node.type === "protocol" ? 20 : 16;

        // Glow for selected
        if (isSelected) {
          ctx.fillStyle = "rgba(17,24,39,0.05)";
          ctx.beginPath();
          ctx.arc(nx, ny, r + 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        ctx.fillStyle = isSelected ? "#111827" : node.type === "exchange" ? "#374151" : node.type === "protocol" ? "#6B7280" : "#F3F4F6";
        ctx.strokeStyle = isSelected ? "#111827" : "#E5E7EB";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = isSelected ? "#111827" : "#6B7280";
        ctx.font = `${isSelected ? "bold" : "normal"} 10px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(node.label, nx, ny + r + 14);

        // Inner icon text
        ctx.fillStyle = node.type === "wallet" && !isSelected ? "#111827" : "#FFFFFF";
        ctx.font = "bold 11px system-ui";
        ctx.fillText(node.type === "exchange" ? "EX" : node.type === "protocol" ? "PR" : "W", nx, ny + 4);
      });

      frame++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, flows, selected, dims]);

  const handleClick = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const clicked = nodes.find(n => {
      const nx = n.x * dims.w, ny = n.y * dims.h;
      return Math.hypot(cx - nx, cy - ny) < 28;
    });
    onSelect(clicked ? clicked.id : null);
  }, [nodes, dims, onSelect]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="w-full rounded-lg cursor-crosshair"
      style={{ height: `${dims.h}px` }}
    />
  );
}

export default function FlowPage() {
  const { trackedWallets, tier } = useTokens();
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

  const content = (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* HERO */}
      <div className="p-6 md:p-8 rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden">
        <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none" color="rgba(0,0,0,0.04)" size="6px" />
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center shadow-sm relative mx-auto md:mx-0 mb-5 overflow-hidden">
              <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.15)" size="5px" />
              <RiNodeTree className="text-white text-2xl relative z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2 tracking-tight">Whale Flow Visualizer</h1>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-lg mx-auto md:mx-0">Interactive on-chain fund flow topology. Track how value moves between your tracked wallets, exchanges, and DeFi protocols in real time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-center"><span className="text-[#9CA3AF] text-[9px] font-bold uppercase tracking-widest block mb-1">Nodes</span><span className="text-[#111827] font-black text-xl font-mono">{nodes.length}</span></div>
            <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-center"><span className="text-[#9CA3AF] text-[9px] font-bold uppercase tracking-widest block mb-1">Flows</span><span className="text-[#111827] font-black text-xl font-mono">{flows.length}</span></div>
            <button onClick={() => { setRefreshKey(k => k + 1); setSelectedNode(null); }} className="p-4 rounded-lg bg-[#111827] text-white border border-[#111827] hover:bg-[#374151] transition-colors"><RiRefreshLine className="text-xl" /></button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* CANVAS */}
        <div className="lg:col-span-8">
          <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8F9FB] rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2"><RiPulseLine className="text-[#111827]" /><h3 className="text-[#111827] font-bold text-sm uppercase tracking-widest">Network Topology</h3></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" /><span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">Streaming</span></div>
            </div>
            <div className="p-2 bg-[#FAFBFC] rounded-b-lg">
              <FlowCanvas nodes={nodes} flows={flows} selected={selectedNode} onSelect={setSelectedNode} />
            </div>
          </div>
        </div>

        {/* INFO PANEL */}
        <div className="lg:col-span-4 space-y-6">
          {/* Legend */}
          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
            <h3 className="text-[#111827] font-bold text-sm mb-4 flex items-center gap-2"><RiInformationLine /> Legend</h3>
            <div className="space-y-3">
              {[{ color: "#374151", label: "Exchange", desc: "CEX entities (Binance, Coinbase...)" }, { color: "#6B7280", label: "Protocol", desc: "DeFi protocols (Uniswap, Aave...)" }, { color: "#F3F4F6", label: "Wallet", desc: "Your tracked wallets" }].map(l => (
                <div key={l.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-[#E5E7EB] shrink-0" style={{ backgroundColor: l.color }} />
                  <div><p className="text-[#111827] text-xs font-bold">{l.label}</p><p className="text-[#9CA3AF] text-[10px]">{l.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected node details */}
          {selectedInfo ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E5E7EB]">
                <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-white text-sm font-bold shrink-0 relative overflow-hidden">
                  <CrosshatchStrip className="absolute inset-0 opacity-15 pointer-events-none" color="rgba(255,255,255,0.2)" size="5px" />
                  <span className="relative z-10">{selectedInfo.node.type === "exchange" ? "EX" : selectedInfo.node.type === "protocol" ? "PR" : "W"}</span>
                </div>
                <div>
                  <h4 className="text-[#111827] font-bold text-sm">{selectedInfo.node.label}</h4>
                  <p className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest">{selectedInfo.node.type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-lg bg-[#16A34A]/5 border border-[#16A34A]/15"><span className="text-[#16A34A] text-[9px] font-bold uppercase tracking-widest block mb-1">Inflow</span><span className="text-[#16A34A] font-black text-lg font-mono">${selectedInfo.totalIn.toLocaleString()}</span><span className="text-[#16A34A]/70 text-[10px] block">{selectedInfo.inFlows.length} streams</span></div>
                <div className="p-3 rounded-lg bg-[#DC2626]/5 border border-[#DC2626]/15"><span className="text-[#DC2626] text-[9px] font-bold uppercase tracking-widest block mb-1">Outflow</span><span className="text-[#DC2626] font-black text-lg font-mono">${selectedInfo.totalOut.toLocaleString()}</span><span className="text-[#DC2626]/70 text-[10px] block">{selectedInfo.outFlows.length} streams</span></div>
              </div>

              <h5 className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-2">Active Streams</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...selectedInfo.inFlows.map(f => ({ ...f, dir: "in" })), ...selectedInfo.outFlows.map(f => ({ ...f, dir: "out" }))].map((f, i) => {
                  const other = nodes.find(n => n.id === (f.dir === "in" ? f.from : f.to));
                  return (
                    <div key={i} className="p-2.5 rounded-md bg-[#F8F9FB] border border-[#E5E7EB] flex items-center gap-3 text-xs">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${f.dir === "in" ? "bg-[#16A34A]/8 text-[#16A34A]" : "bg-[#DC2626]/8 text-[#DC2626]"}`}>{f.dir === "in" ? "IN" : "OUT"}</span>
                      <span className="text-[#6B7280] truncate flex-1">{other?.label || "Unknown"}</span>
                      <span className="text-[#111827] font-mono font-bold">${f.amount}</span>
                      <span className="text-[#9CA3AF] text-[10px] font-mono">{f.token}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] text-center">
              <RiEyeLine className="text-[#9CA3AF] text-2xl mx-auto mb-3" />
              <p className="text-[#6B7280] text-xs font-medium">Click any node on the topology map to inspect its fund flows and connections.</p>
            </div>
          )}

          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB]">
            <div className="flex items-center gap-2.5 mb-2"><RiInformationLine className="text-[#111827] text-lg" /><h3 className="text-[#111827] font-bold text-sm">Flow Analysis</h3></div>
            <p className="text-[#6B7280] text-xs leading-relaxed">This visualization maps capital flows between your tracked entities, major exchanges, and DeFi venues. Connect more wallets from the <strong className="text-[#111827]">Wallets</strong> page to generate richer flow patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return content;
}
