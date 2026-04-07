"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiAddLine, RiDeleteBinLine, RiSearchLine, RiExternalLinkLine,
  RiLoader4Line, RiWallet3Line, RiStarLine, RiFileCopyLine,
  RiCheckLine, RiArrowRightUpLine, RiArrowUpSLine, RiArrowDownSLine,
  RiInformationLine, RiEyeLine, RiRadarLine, RiPulseLine, RiFireLine,
  RiGlobalLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";
import { searchTokens, formatPairData, formatCurrency, formatNumber, getChainLabel, timeAgo } from "@/lib/dexscreener";

const CARD = "rounded-2xl border border-dashed border-[#2A2A3A]/60 bg-[#0D0D14] relative overflow-hidden";
const CARD_INNER = "rounded-xl border border-[#1E1E2E] bg-[#0A0A0F]";

const POPULAR_WALLETS = [
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", label: "vitalik.eth (Creator)" },
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance 14 (Exchange)" },
  { address: "FWznbcNXWQuHTaWE9RxvQ2LdCENssh12dsznf4RiouN5", label: "Wintermute (MM SOL)" },
  { address: "0x55FA1E515b6dEEce2AE66e5D9BEFf527c956DBf5", label: "Justin Sun (Whale)" },
  { address: "0x00000000219ab540356cBB839Cbe05303d7705Fa", label: "Deposit Contract" },
];

function detectChain(address) {
  if (!address) return "unknown";
  if (address.startsWith("0x")) return "ethereum";
  if (address.length >= 32 && address.length <= 44 && !address.startsWith("0x")) return "solana";
  return "unknown";
}

function getExplorerUrl(address) {
  const chain = detectChain(address);
  if (chain === "ethereum") return `https://etherscan.io/address/${address}`;
  if (chain === "solana") return `https://solscan.io/account/${address}`;
  return null;
}

function getExplorerLabel(address) {
  const chain = detectChain(address);
  if (chain === "ethereum") return "Etherscan";
  if (chain === "solana") return "Solscan";
  return "Explorer";
}

export default function WalletsPage() {
  const { trackedWallets, trackWallet, removeTrackedWallet } = useTokens();
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [addError, setAddError] = useState("");
  const [copiedAddr, setCopiedAddr] = useState(null);
  
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [expandedToken, setExpandedToken] = useState(null);
  const [walletToDelete, setWalletToDelete] = useState(null);

  function handleAddWallet(e, addrOverride=null, labelOverride=null) {
    if (e) e.preventDefault();
    setAddError("");
    const addr = addrOverride || newAddress.trim();
    const lbl = labelOverride !== null ? labelOverride : newLabel.trim();
    
    if (!addr) { setAddError("Please enter a wallet address"); return; }
    if (addr.length < 20) { setAddError("Address seems too short"); return; }
    if (trackedWallets.find(w => w.address === addr)) { setAddError("This wallet is already tracked"); return; }
    
    const added = trackWallet(addr, lbl);
    if (added && !addrOverride) { setNewAddress(""); setNewLabel(""); setAddError(""); }
  }

  async function copyAddress(addr) {
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedAddr(addr);
      setTimeout(() => setCopiedAddr(null), 2000);
    } catch {}
  }

  async function handleTokenLookup(e) {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setExpandedToken(null);
    try {
      const pairs = await searchTokens(lookupQuery.trim());
      const seen = new Set();
      const unique = pairs.filter(p => {
        const k = p.baseToken?.address;
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setLookupResults(unique.slice(0, 8).map(formatPairData).filter(Boolean));
    } catch (err) {
      console.error("Lookup failed:", err);
    } finally {
      setLookupLoading(false);
    }
  }

  const walletsByChain = useMemo(() => {
    const groups = {};
    trackedWallets.forEach(w => {
      const chain = detectChain(w.address);
      if (!groups[chain]) groups[chain] = [];
      groups[chain].push(w);
    });
    return groups;
  }, [trackedWallets]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* ═══ HERO HEADER & ADD WALLET ═══ */}
      <div className={`p-6 md:p-8 ${CARD} shadow-2xl relative overflow-visible z-20`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-[#0A0A0F] border border-[#1E1E2E] flex items-center justify-center shadow-lg relative mx-auto md:mx-0 mb-5 text-[#3B82F6]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/20 to-transparent rounded-2xl" />
              <RiGlobalLine className="text-3xl relative z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Wallet Intelligence</h1>
            <p className="text-[#8E8E9A] text-sm leading-relaxed max-w-md mx-auto md:mx-0">Monitor smart money, track whale accumulation, and maintain intelligence on critical on-chain entities.</p>
          </div>
          
          <div className="w-full md:w-auto flex-1 max-w-lg bg-[#0A0A0F] p-5 rounded-2xl border border-dashed border-[#2A2A3A] shadow-inner">
             <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><RiRadarLine className="text-[#3B82F6]"/> Deploy Tracking Vector</h3>
             <form onSubmit={e => handleAddWallet(e)} className="flex flex-col gap-3">
              <div>
                <input type="text" value={newAddress} onChange={e => { setNewAddress(e.target.value); setAddError(""); }} placeholder="Target Address (0x... or SOL...)" className="w-full px-4 py-3 rounded-xl bg-[#0D0D14] border border-[#1E1E2E] text-white text-sm placeholder:text-[#555] focus:border-[#3B82F6]/50 focus:outline-none font-mono transition-colors shadow-sm" />
              </div>
              <div className="flex gap-3">
                <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Alias (optional)" className="flex-1 px-4 py-3 rounded-xl bg-[#0D0D14] border border-[#1E1E2E] text-white text-sm placeholder:text-[#555] focus:border-[#3B82F6]/50 focus:outline-none transition-colors shadow-sm" />
                <button type="submit" className="btn-3d px-6 py-3 flex items-center justify-center gap-2 shrink-0 border-[#3B82F6] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm">
                  <RiAddLine className="text-lg" /> Track
                </button>
              </div>
              {addError && <p className="text-[#FF4444] text-[11px] font-bold tracking-wide mt-1 pl-1">{addError}</p>}
            </form>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* ═══ LEFT RAIL: INTELLIGENCE & DISCOVERY ═══ */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stats Grid */}
          <div className={`p-1.5 ${CARD} bg-[#0A0A0F]`}>
            <div className="grid grid-cols-2 gap-1.5">
              <div className={`p-4 ${CARD_INNER} flex flex-col gap-1.5 col-span-2 sm:col-span-1 lg:col-span-2`}>
                <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><RiEyeLine className="text-[#3B82F6]"/> Total Targets</span>
                <span className="text-white font-black text-3xl">{trackedWallets.length}</span>
              </div>
              <div className={`p-4 ${CARD_INNER} flex flex-col gap-1.5 col-span-1 lg:col-span-1`}>
                <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#627EEA]"/> EVM Nodes</span>
                <span className="text-white font-black text-xl">{walletsByChain["ethereum"]?.length || 0}</span>
              </div>
               <div className={`p-4 ${CARD_INNER} flex flex-col gap-1.5 col-span-1 lg:col-span-1`}>
                <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#14F195]"/> SOL Nodes</span>
                <span className="text-white font-black text-xl">{walletsByChain["solana"]?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Popular Wallets Widget */}
          <div className={`p-5 ${CARD}`}>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><RiFireLine className="text-[#F97316]" /> Recommended Targets</h3>
            <div className="space-y-3">
              {POPULAR_WALLETS.map((pw, i) => {
                const isTracked = trackedWallets.some(w => w.address === pw.address);
                const chain = detectChain(pw.address);
                return (
                  <div key={i} className={`p-3 ${CARD_INNER} flex flex-col gap-2 relative group hover:border-[#2A2A3A] transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-bold">{pw.label}</span>
                        <span className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-widest ${chain === "solana" ? "bg-[#14F195]/10 text-[#14F195]" : chain === "ethereum" ? "bg-[#627EEA]/10 text-[#627EEA]" : "bg-[#555]/10 text-[#8E8E9A]"}`}>
                          {chain === "solana" ? "SOL" : chain === "ethereum" ? "EVM" : "???"}
                        </span>
                      </div>
                      {isTracked ? (
                        <span className="text-[#22C55E] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-[#22C55E]/10 px-2 py-0.5 rounded"><RiCheckLine/> Active</span>
                      ) : (
                        <button onClick={() => handleAddWallet(null, pw.address, pw.label)} className="text-[#8E8E9A] text-[10px] font-bold uppercase tracking-wider bg-[#1E1E2E] hover:bg-[#3B82F6] hover:text-white transition-colors px-2 py-0.5 rounded flex items-center gap-1">
                          <RiAddLine/> Deploy
                        </button>
                      )}
                    </div>
                    <span className="text-[#555] text-[10px] font-mono truncate">{pw.address}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`p-5 ${CARD} bg-[#3B82F6]/5 border-[#3B82F6]/20`}>
             <div className="flex items-center gap-2.5 mb-2">
               <RiInformationLine className="text-[#3B82F6] text-lg" />
               <h3 className="text-white font-bold text-sm">Intel Protocol</h3>
             </div>
             <p className="text-[#8E8E9A] text-xs leading-relaxed font-medium">Tracking high-conviction entities allows for real-time emulation of smart money. Always cross-reference targets via the **Token Lookup Engine** before executing trades.</p>
          </div>

        </div>

        {/* ═══ RIGHT RAIL: MONITORED ASSETS & LOOKUP ═══ */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Target Monitioring */}
          <div className={`p-1.5 ${CARD}`}>
             <div className="px-5 py-4 border-b border-dashed border-[#1E1E2E] bg-[#0A0A0F] rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiPulseLine className="text-[#3B82F6]" />
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Active Monitored Targets</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-[#8E8E9A] text-[10px] font-bold uppercase tracking-wider">Online</span>
                </div>
             </div>
             
             <div className="p-2">
               {trackedWallets.length > 0 ? (
                 <div className="space-y-2">
                   {trackedWallets.map(wallet => {
                      const chain = detectChain(wallet.address);
                      const explorerUrl = getExplorerUrl(wallet.address);
                      return (
                        <motion.div key={wallet.address} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 ${CARD_INNER} flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#3B82F6]/30 transition-colors relative overflow-hidden`}>
                          
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6]/30 group-hover:bg-[#3B82F6] transition-colors" />

                          <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ring-1 ring-[#1E1E2E] ${chain === "solana" ? "bg-[#14F195]/5" : "bg-[#627EEA]/5"}`}>
                              <RiWallet3Line className={`text-xl ${chain === "solana" ? "text-[#14F195]" : "text-[#627EEA]"}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2.5 mb-1">
                                <span className="text-white text-sm font-bold truncate">{wallet.label}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest border ${chain === "solana" ? "bg-[#14F195]/10 text-[#14F195] border-[#14F195]/20" : chain === "ethereum" ? "bg-[#627EEA]/10 text-[#627EEA] border-[#627EEA]/20" : "bg-[#555]/10 text-[#8E8E9A] border-[#555]/20"}`}>
                                  {chain === "solana" ? "SOL Network" : chain === "ethereum" ? "EVM Chain" : "Unknown"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 bg-[#0D0D14] w-fit px-2 py-1 rounded-md border border-[#1E1E2E]">
                                <span className="text-[#8E8E9A] text-[11px] truncate block font-mono max-w-[200px] sm:max-w-[300px]">{wallet.address}</span>
                                <button onClick={() => copyAddress(wallet.address)} className="text-[#555] hover:text-[#3B82F6] transition-colors shrink-0 p-0.5">
                                  {copiedAddr === wallet.address ? <RiCheckLine className="text-[#22C55E] text-xs" /> : <RiFileCopyLine className="text-xs" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 sm:ml-auto pl-2 sm:pl-0">
                            {explorerUrl && (
                              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-xl text-[#8E8E9A] bg-[#0D0D14] border border-[#1E1E2E] hover:text-white hover:border-[#3B82F6]/50 transition-colors flex items-center gap-2 text-xs font-bold">
                                <RiExternalLinkLine className="text-sm" /> Explore
                              </a>
                            )}
                            {walletToDelete === wallet.address ? (
                              <div className="flex items-center gap-1.5 bg-[#FF4444]/10 p-1 rounded-xl border border-[#FF4444]/20">
                                <button onClick={() => { removeTrackedWallet(wallet.address); setWalletToDelete(null); }} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#FF4444] text-white hover:bg-[#CC0000] transition-colors">Confirm Drop</button>
                                <button onClick={() => setWalletToDelete(null)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#8E8E9A] hover:text-white transition-colors">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setWalletToDelete(wallet.address)} className="p-2.5 rounded-xl bg-[#0D0D14] border border-[#1E1E2E] text-[#555] hover:text-[#FF4444] hover:border-[#FF4444]/30 transition-colors">
                                <RiDeleteBinLine className="text-sm" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                   })}
                 </div>
               ) : (
                 <div className={`p-10 text-center`}>
                    <div className="w-16 h-16 rounded-3xl bg-[#0A0A0F] border border-dashed border-[#2A2A3A] flex items-center justify-center mx-auto mb-4">
                      <RiEyeLine className="text-[#555] text-2xl" />
                    </div>
                    <h3 className="text-white font-bold text-lg tracking-tight mb-2">No Active Targets</h3>
                    <p className="text-[#8E8E9A] text-xs max-w-sm mx-auto leading-relaxed font-medium">Deploy a tracking vector above or select a recommended target to begin monitoring entity flow.</p>
                 </div>
               )}
             </div>
          </div>

          {/* Token Lookup Engine */}
          <div className={`p-6 ${CARD} bg-[#0A0A0F]`}>
            <div className="flex items-center gap-2 mb-1">
               <RiSearchLine className="text-[#9F67FF]" />
               <h3 className="text-white font-bold text-sm uppercase tracking-widest">Token Intelligence Engine</h3>
            </div>
            <p className="text-[#555] text-[11px] font-medium mb-5 uppercase tracking-wide">Enter contract hash to query decentralized liquidity pools</p>
            
            <form onSubmit={handleTokenLookup} className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] text-lg" />
                <input type="text" value={lookupQuery} onChange={e => setLookupQuery(e.target.value)} placeholder="Contract hash or token alias..." className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0D0D14] border border-dashed border-[#2A2A3A] text-white text-sm placeholder:text-[#555] focus:border-[#9F67FF]/50 focus:bg-[#0A0A0F] focus:outline-none transition-colors" />
              </div>
              <button type="submit" disabled={lookupLoading} className="btn-3d px-6 py-3 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 text-sm font-bold border-[#9F67FF] bg-[#9F67FF] hover:bg-[#7C3AED] text-white">
                {lookupLoading ? <RiLoader4Line className="animate-spin text-lg" /> : <RiSearchLine className="text-lg" />} Query Engine
              </button>
            </form>

            <AnimatePresence>
              {lookupResults.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                  <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest block mb-2 px-1">Query Results ({lookupResults.length})</span>
                  {lookupResults.map((token, i) => {
                    const isExpanded = expandedToken === token.address;
                    const buyRatio = token.buys24h + token.sells24h > 0 ? Math.round((token.buys24h / (token.buys24h + token.sells24h)) * 100) : 50;
                    return (
                      <motion.div key={token.address || i} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} 
                        className={`rounded-2xl border border-dashed transition-all overflow-hidden ${isExpanded ? "bg-[#0D0D14] border-[#9F67FF]/30 shadow-[0_0_20px_rgba(159,103,255,0.05)]" : "bg-[#0D0D14] border-[#1E1E2E] hover:border-[#2A2A3A]"}`}>
                        
                        <button onClick={() => setExpandedToken(isExpanded ? null : token.address)} className="w-full flex items-center justify-between p-4 text-left">
                          <div className="flex items-center gap-4 min-w-0">
                            {token.imageUrl ? <img src={token.imageUrl} alt="" className="w-10 h-10 rounded-xl shrink-0 ring-1 ring-[#1E1E2E] shadow-md" /> : <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 ring-1 ring-[#1E1E2E] flex items-center justify-center text-sm font-black text-[#9F67FF] shrink-0">{token.symbol?.slice(0, 2)}</div>}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 pl-1">
                                <span className="text-white text-sm font-bold truncate max-w-[140px]">{token.name}</span>
                                <span className="text-[#8E8E9A] text-[11px] font-mono">{token.symbol}</span>
                                <span className="text-[#8E8E9A] text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#1E1E2E] bg-[#0A0A0F]">{getChainLabel(token.chain)}</span>
                              </div>
                              <div className="flex items-center gap-3 bg-[#0A0A0F] px-2 py-1 rounded-md border border-[#1E1E2E] w-fit">
                                <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest">Vol <span className="text-[#8E8E9A] ml-1">{formatCurrency(token.volume24h)}</span></span>
                                <span className="w-1 h-1 rounded-full bg-[#2A2A3A]"/>
                                <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest">Liq <span className="text-[#8E8E9A] ml-1">{formatCurrency(token.liquidity)}</span></span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <span className="text-white text-base font-black block mb-1 tracking-tight">{token.price}</span>
                              <span className={`flex items-center justify-end gap-0.5 text-[11px] font-black ${token.positive ? "text-[#22C55E]" : "text-[#FF4444]"}`}>
                                {token.positive ? <RiArrowUpSLine /> : <RiArrowDownSLine />}{Math.abs(token.priceChange24h || 0).toFixed(2)}%
                              </span>
                            </div>
                            <div className="w-px h-8 bg-[#1E1E2E] mx-1 hidden sm:block"/>
                            <div className="hidden sm:flex flex-col items-center justify-center px-3">
                              <span className="text-[#555] text-[8px] font-bold uppercase tracking-widest mb-0.5">Score</span>
                              <div className={`flex items-center justify-center w-8 h-8 rounded-lg border border-dashed ${token.alphaScore >= 8 ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]" : token.alphaScore >= 6 ? "bg-[#7C3AED]/10 border-[#7C3AED]/30 text-[#9F67FF]" : "bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]"}`}>
                                <span className="font-black text-sm">{token.alphaScore}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden bg-[#0A0A0F] border-t border-[#1E1E2E]">
                              <div className="p-4 space-y-4">
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {[
                                    { label: "FDV", value: formatCurrency(token.fdv) },
                                    { label: "Market Cap", value: formatCurrency(token.marketCap) },
                                    { label: "1h Momentum", value: `${token.priceChange1h >= 0 ? "+" : ""}${token.priceChange1h?.toFixed(2)}%`, color: token.priceChange1h >= 0 ? "#22C55E" : "#FF4444" },
                                    { label: "Pair Age", value: timeAgo(token.pairCreatedAt) },
                                  ].map(m => (
                                    <div key={m.label} className="p-3 rounded-xl border border-[#1E1E2E] bg-[#0D0D14] flex flex-col gap-1.5">
                                      <span className="text-[#555] text-[10px] uppercase font-bold tracking-widest">{m.label}</span>
                                      <span className="text-white text-sm font-black tracking-tight" style={m.color ? { color: m.color } : undefined}>{m.value}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="p-4 rounded-xl border border-[#1E1E2E] bg-[#0D0D14]">
                                  <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col">
                                      <span className="text-[#22C55E] text-[10px] font-bold uppercase tracking-widest mb-0.5">Buy Flow</span>
                                      <span className="text-[#22C55E] font-black text-sm">{formatNumber(token.buys24h)} <span className="text-xs font-semibold opacity-70">({buyRatio}%)</span></span>
                                    </div>
                                    <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest mb-1.5">24H Transaction Imbalance</span>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[#FF4444] text-[10px] font-bold uppercase tracking-widest mb-0.5">Sell Flow</span>
                                      <span className="text-[#FF4444] font-black text-sm">{formatNumber(token.sells24h)} <span className="text-xs font-semibold opacity-70">({100 - buyRatio}%)</span></span>
                                    </div>
                                  </div>
                                  <div className="h-2 rounded-full bg-[#1E1E2E] overflow-hidden flex ring-1 ring-[#1E1E2E]">
                                    <div className="h-full bg-[#22C55E] rounded-l-full" style={{ width: `${buyRatio}%` }} />
                                    <div className="h-full bg-[#FF4444] rounded-r-full flex-1" />
                                  </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D0D14] p-3 rounded-xl border border-[#1E1E2E]">
                                  <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <span className="text-[#555] text-[10px] font-bold uppercase tracking-widest shrink-0">Contract</span>
                                    <span className="text-[#8E8E9A] text-xs font-mono font-medium truncate">{token.address}</span>
                                    <button onClick={() => copyAddress(token.address)} className="text-[#555] hover:text-white transition-colors p-1.5 shrink-0 bg-[#0A0A0F] rounded-lg border border-[#1E1E2E]">
                                      {copiedAddr === token.address ? <RiCheckLine className="text-[#22C55E]" /> : <RiFileCopyLine />}
                                    </button>
                                  </div>
                                  <a href={token.url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-lg border border-[#9F67FF]/20 bg-[#9F67FF]/10 text-[#9F67FF] hover:bg-[#9F67FF] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                                    <RiExternalLinkLine className="text-sm" /> DexScreener
                                  </a>
                                </div>
                                
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

    </div>
  );
}
