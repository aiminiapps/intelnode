"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RiAddLine, RiDeleteBinLine, RiSearchLine, RiExternalLinkLine,
  RiLoader4Line, RiWallet3Line, RiFileCopyLine,
  RiCheckLine, RiArrowUpSLine, RiArrowDownSLine,
  RiInformationLine, RiEyeLine, RiRadarLine, RiPulseLine, RiFireLine,
  RiGlobalLine
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";
import { searchTokens, formatPairData, formatCurrency, formatNumber, getChainLabel, timeAgo } from "@/lib/dexscreener";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}
const POPULAR_WALLETS = [
  { address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", label: "vitalik.eth" },
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", label: "Binance 14" },
  { address: "FWznbcNXWQuHTaWE9RxvQ2LdCENssh12dsznf4RiouN5", label: "Wintermute SOL" },
  { address: "0x55FA1E515b6dEEce2AE66e5D9BEFf527c956DBf5", label: "Justin Sun" },
  { address: "0x00000000219ab540356cBB839Cbe05303d7705Fa", label: "Deposit Contract" },
];
function detectChain(a){if(!a)return"unknown";if(a.startsWith("0x"))return"ethereum";if(a.length>=32&&a.length<=44&&!a.startsWith("0x"))return"solana";return"unknown";}
function getExplorerUrl(a){const c=detectChain(a);if(c==="ethereum")return`https://etherscan.io/address/${a}`;if(c==="solana")return`https://solscan.io/account/${a}`;return null;}

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

  function handleAddWallet(e, addrO=null, lblO=null) {
    if(e)e.preventDefault(); setAddError("");
    const addr=addrO||newAddress.trim(), lbl=lblO!==null?lblO:newLabel.trim();
    if(!addr){setAddError("Please enter a wallet address");return;}
    if(addr.length<20){setAddError("Address seems too short");return;}
    if(trackedWallets.find(w=>w.address===addr)){setAddError("Already tracked");return;}
    const added=trackWallet(addr,lbl);
    if(added&&!addrO){setNewAddress("");setNewLabel("");setAddError("");}
  }
  async function copyAddress(addr){try{await navigator.clipboard.writeText(addr);setCopiedAddr(addr);setTimeout(()=>setCopiedAddr(null),2000);}catch{}}
  async function handleTokenLookup(e){
    e.preventDefault();if(!lookupQuery.trim())return;setLookupLoading(true);setExpandedToken(null);
    try{const pairs=await searchTokens(lookupQuery.trim());const seen=new Set();const unique=pairs.filter(p=>{const k=p.baseToken?.address;if(!k||seen.has(k))return false;seen.add(k);return true;});setLookupResults(unique.slice(0,8).map(formatPairData).filter(Boolean));}catch(err){console.error(err);}finally{setLookupLoading(false);}
  }
  const walletsByChain=useMemo(()=>{const g={};trackedWallets.forEach(w=>{const c=detectChain(w.address);if(!g[c])g[c]=[];g[c].push(w);});return g;},[trackedWallets]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* HERO */}
      <div className="p-6 md:p-8 rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden">
        <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none" color="rgba(0,0,0,0.04)" size="6px" />
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center shadow-sm relative mx-auto md:mx-0 mb-5 overflow-hidden">
              <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.15)" size="5px" />
              <RiGlobalLine className="text-white text-2xl relative z-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2 tracking-tight">Wallet Intelligence</h1>
            <p className="text-[#6B7280] text-sm leading-relaxed max-w-md mx-auto md:mx-0">Monitor smart money, track whale accumulation, and maintain intelligence on critical on-chain entities.</p>
          </div>
          <div className="w-full md:w-auto flex-1 max-w-lg bg-[#F8F9FB] p-5 rounded-xl border border-[#E5E7EB]">
            <h3 className="text-[#111827] font-bold text-sm mb-4 flex items-center gap-2"><RiRadarLine className="text-[#111827]"/> Deploy Tracking Vector</h3>
            <form onSubmit={e=>handleAddWallet(e)} className="flex flex-col gap-3">
              <input type="text" value={newAddress} onChange={e=>{setNewAddress(e.target.value);setAddError("");}} placeholder="Target Address (0x... or SOL...)" className="w-full px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] text-sm placeholder:text-[#9CA3AF] focus:border-[#111827]/30 focus:outline-none font-mono transition-colors" />
              <div className="flex gap-3">
                <input type="text" value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Alias (optional)" className="flex-1 px-4 py-3 rounded-lg bg-white border border-[#E5E7EB] text-[#111827] text-sm placeholder:text-[#9CA3AF] focus:border-[#111827]/30 focus:outline-none transition-colors" />
                <button type="submit" className="btn-intel px-6 py-3 flex items-center justify-center gap-2 shrink-0 text-sm font-bold"><RiAddLine className="text-lg" /> Track</button>
              </div>
              {addError && <p className="text-[#DC2626] text-[11px] font-bold mt-1 pl-1">{addError}</p>}
            </form>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] flex flex-col gap-1.5 col-span-2 sm:col-span-1 lg:col-span-2">
                <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><RiEyeLine className="text-[#111827]"/> Total Targets</span>
                <span className="text-[#111827] font-black text-3xl">{trackedWallets.length}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] flex flex-col gap-1.5">
                <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#627EEA]"/> EVM</span>
                <span className="text-[#111827] font-black text-xl">{walletsByChain["ethereum"]?.length||0}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] flex flex-col gap-1.5">
                <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#14F195]"/> SOL</span>
                <span className="text-[#111827] font-black text-xl">{walletsByChain["solana"]?.length||0}</span>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
            <h3 className="text-[#111827] font-bold text-sm mb-4 flex items-center gap-2"><RiFireLine className="text-[#F97316]"/> Recommended Targets</h3>
            <div className="space-y-3">
              {POPULAR_WALLETS.map((pw,i)=>{const isT=trackedWallets.some(w=>w.address===pw.address);const ch=detectChain(pw.address);return(
                <div key={i} className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] flex flex-col gap-2 group hover:border-[#111827]/15 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="text-[#111827] text-xs font-bold">{pw.label}</span><span className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-widest border ${ch==="solana"?"bg-[#14F195]/8 text-[#059669] border-[#14F195]/20":ch==="ethereum"?"bg-[#627EEA]/8 text-[#627EEA] border-[#627EEA]/20":"bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]"}`}>{ch==="solana"?"SOL":ch==="ethereum"?"EVM":"???"}</span></div>
                    {isT?<span className="text-[#16A34A] text-[10px] font-bold uppercase flex items-center gap-1 bg-[#16A34A]/8 px-2 py-0.5 rounded border border-[#16A34A]/15"><RiCheckLine/> Active</span>
                    :<button onClick={()=>handleAddWallet(null,pw.address,pw.label)} className="text-[#6B7280] text-[10px] font-bold uppercase bg-white border border-[#E5E7EB] hover:bg-[#111827] hover:text-white hover:border-[#111827] transition-colors px-2 py-0.5 rounded flex items-center gap-1"><RiAddLine/> Deploy</button>}
                  </div>
                  <span className="text-[#9CA3AF] text-[10px] font-mono truncate">{pw.address}</span>
                </div>);})}
            </div>
          </div>
          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB]">
            <div className="flex items-center gap-2.5 mb-2"><RiInformationLine className="text-[#111827] text-lg"/><h3 className="text-[#111827] font-bold text-sm">Intel Protocol</h3></div>
            <p className="text-[#6B7280] text-xs leading-relaxed font-medium">Tracking high-conviction entities allows for real-time emulation of smart money. Always cross-reference targets via the <strong className="text-[#111827]">Token Lookup Engine</strong> before executing trades.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-1.5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F8F9FB] rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2"><RiPulseLine className="text-[#111827]"/><h3 className="text-[#111827] font-bold text-sm uppercase tracking-widest">Active Monitored Targets</h3></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"/><span className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">Online</span></div>
            </div>
            <div className="p-2">
              {trackedWallets.length>0?(
                <div className="space-y-2">{trackedWallets.map(wallet=>{const ch=detectChain(wallet.address);const eu=getExplorerUrl(wallet.address);return(
                  <motion.div key={wallet.address} initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} className="p-4 rounded-lg border border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#111827]/15 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#E5E7EB] group-hover:bg-[#111827] transition-colors"/>
                    <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${ch==="solana"?"bg-[#14F195]/5 border-[#14F195]/15":"bg-[#627EEA]/5 border-[#627EEA]/15"}`}>
                        <RiWallet3Line className={`text-xl ${ch==="solana"?"text-[#059669]":"text-[#627EEA]"}`}/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-[#111827] text-sm font-bold truncate">{wallet.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest border ${ch==="solana"?"bg-[#14F195]/8 text-[#059669] border-[#14F195]/15":ch==="ethereum"?"bg-[#627EEA]/8 text-[#627EEA] border-[#627EEA]/15":"bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]"}`}>{ch==="solana"?"SOL":ch==="ethereum"?"EVM":"Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#F8F9FB] w-fit px-2 py-1 rounded-md border border-[#E5E7EB]">
                          <span className="text-[#6B7280] text-[11px] truncate block font-mono max-w-[200px] sm:max-w-[300px]">{wallet.address}</span>
                          <button onClick={()=>copyAddress(wallet.address)} className="text-[#9CA3AF] hover:text-[#111827] transition-colors shrink-0 p-0.5">
                            {copiedAddr===wallet.address?<RiCheckLine className="text-[#16A34A] text-xs"/>:<RiFileCopyLine className="text-xs"/>}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 sm:ml-auto pl-2 sm:pl-0">
                      {eu&&<a href={eu} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-[#6B7280] bg-[#F8F9FB] border border-[#E5E7EB] hover:text-[#111827] hover:border-[#111827]/20 transition-colors flex items-center gap-2 text-xs font-bold"><RiExternalLinkLine className="text-sm"/> Explore</a>}
                      {walletToDelete===wallet.address?(
                        <div className="flex items-center gap-1.5 bg-[#FEF2F2] p-1 rounded-lg border border-[#DC2626]/10">
                          <button onClick={()=>{removeTrackedWallet(wallet.address);setWalletToDelete(null);}} className="px-3 py-1.5 rounded-md text-[11px] font-bold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors">Confirm</button>
                          <button onClick={()=>setWalletToDelete(null)} className="px-3 py-1.5 rounded-md text-[11px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors">Cancel</button>
                        </div>
                      ):<button onClick={()=>setWalletToDelete(wallet.address)} className="p-2.5 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#DC2626] hover:border-[#DC2626]/20 transition-colors"><RiDeleteBinLine className="text-sm"/></button>}
                    </div>
                  </motion.div>);})}</div>
              ):(
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.03)" size="7px"/>
                    <RiEyeLine className="text-[#9CA3AF] text-2xl relative z-10"/>
                  </div>
                  <h3 className="text-[#111827] font-bold text-lg mb-2">No Active Targets</h3>
                  <p className="text-[#6B7280] text-xs max-w-sm mx-auto leading-relaxed">Deploy a tracking vector above or select a recommended target.</p>
                </div>
              )}
            </div>
          </div>

          {/* Token Lookup */}
          <div className="p-6 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="flex items-center gap-2 mb-1"><RiSearchLine className="text-[#111827]"/><h3 className="text-[#111827] font-bold text-sm uppercase tracking-widest">Token Intelligence Engine</h3></div>
            <p className="text-[#9CA3AF] text-[11px] font-medium mb-5 uppercase tracking-wide">Enter contract hash to query decentralized liquidity pools</p>
            <form onSubmit={handleTokenLookup} className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1"><RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-lg"/><input type="text" value={lookupQuery} onChange={e=>setLookupQuery(e.target.value)} placeholder="Contract hash or token alias..." className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[#111827] text-sm placeholder:text-[#9CA3AF] focus:border-[#111827]/30 focus:outline-none transition-colors"/></div>
              <button type="submit" disabled={lookupLoading} className="btn-intel px-6 py-3 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 text-sm font-bold">{lookupLoading?<RiLoader4Line className="animate-spin text-lg"/>:<RiSearchLine className="text-lg"/>} Query</button>
            </form>
            <AnimatePresence>
              {lookupResults.length>0&&(
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="space-y-3 overflow-hidden">
                  <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest block mb-2 px-1">Results ({lookupResults.length})</span>
                  {lookupResults.map((token,i)=>{const isExp=expandedToken===token.address;const br=token.buys24h+token.sells24h>0?Math.round((token.buys24h/(token.buys24h+token.sells24h))*100):50;return(
                    <motion.div key={token.address||i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}} className={`rounded-xl border overflow-hidden transition-all ${isExp?"bg-white border-[#111827]/15 shadow-sm":"bg-white border-[#E5E7EB] hover:border-[#111827]/10"}`}>
                      <button onClick={()=>setExpandedToken(isExp?null:token.address)} className="w-full flex items-center justify-between p-4 text-left">
                        <div className="flex items-center gap-4 min-w-0">
                          {token.imageUrl?<img src={token.imageUrl} alt="" className="w-10 h-10 rounded-xl shrink-0 ring-1 ring-[#E5E7EB]"/>:<div className="w-10 h-10 rounded-xl bg-[#F3F4F6] ring-1 ring-[#E5E7EB] flex items-center justify-center text-sm font-black text-[#111827] shrink-0">{token.symbol?.slice(0,2)}</div>}
                          <div className="min-w-0"><div className="flex items-center gap-2 mb-1"><span className="text-[#111827] text-sm font-bold truncate max-w-[140px]">{token.name}</span><span className="text-[#6B7280] text-[11px] font-mono">{token.symbol}</span><span className="text-[#9CA3AF] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FB]">{getChainLabel(token.chain)}</span></div>
                          <div className="flex items-center gap-3 bg-[#F8F9FB] px-2 py-1 rounded-md border border-[#E5E7EB] w-fit"><span className="text-[#9CA3AF] text-[10px] font-bold uppercase">Vol <span className="text-[#6B7280] ml-1">{formatCurrency(token.volume24h)}</span></span><span className="w-1 h-1 rounded-full bg-[#D1D5DB]"/><span className="text-[#9CA3AF] text-[10px] font-bold uppercase">Liq <span className="text-[#6B7280] ml-1">{formatCurrency(token.liquidity)}</span></span></div></div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0"><div className="text-right"><span className="text-[#111827] text-base font-black block mb-1">{token.price}</span><span className={`flex items-center justify-end gap-0.5 text-[11px] font-black ${token.positive?"text-[#16A34A]":"text-[#DC2626]"}`}>{token.positive?<RiArrowUpSLine/>:<RiArrowDownSLine/>}{Math.abs(token.priceChange24h||0).toFixed(2)}%</span></div>
                        <div className="hidden sm:flex flex-col items-center px-3"><span className="text-[#9CA3AF] text-[8px] font-bold uppercase mb-0.5">Score</span><div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${token.alphaScore>=8?"bg-[#16A34A]/8 border-[#16A34A]/20 text-[#16A34A]":token.alphaScore>=6?"bg-[#111827]/5 border-[#111827]/15 text-[#111827]":"bg-[#F97316]/8 border-[#F97316]/20 text-[#F97316]"}`}><span className="font-black text-sm">{token.alphaScore}</span></div></div></div>
                      </button>
                      <AnimatePresence>{isExp&&(
                        <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden bg-[#F8F9FB] border-t border-[#E5E7EB]">
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{[{l:"FDV",v:formatCurrency(token.fdv)},{l:"MCap",v:formatCurrency(token.marketCap)},{l:"1h",v:`${token.priceChange1h>=0?"+":""}${token.priceChange1h?.toFixed(2)}%`,c:token.priceChange1h>=0?"#16A34A":"#DC2626"},{l:"Age",v:timeAgo(token.pairCreatedAt)}].map(m=><div key={m.l} className="p-3 rounded-lg border border-[#E5E7EB] bg-white flex flex-col gap-1.5"><span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-widest">{m.l}</span><span className="text-[#111827] text-sm font-black" style={m.c?{color:m.c}:undefined}>{m.v}</span></div>)}</div>
                            <div className="p-4 rounded-lg border border-[#E5E7EB] bg-white"><div className="flex justify-between items-end mb-2"><div><span className="text-[#16A34A] text-[10px] font-bold uppercase block mb-0.5">Buys</span><span className="text-[#16A34A] font-black text-sm">{formatNumber(token.buys24h)} ({br}%)</span></div><div className="text-right"><span className="text-[#DC2626] text-[10px] font-bold uppercase block mb-0.5">Sells</span><span className="text-[#DC2626] font-black text-sm">{formatNumber(token.sells24h)} ({100-br}%)</span></div></div><div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden flex border border-[#E5E7EB]"><div className="h-full bg-[#16A34A] rounded-l-full" style={{width:`${br}%`}}/><div className="h-full bg-[#DC2626] rounded-r-full flex-1"/></div></div>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#E5E7EB]"><div className="flex items-center gap-3 w-full sm:w-auto"><span className="text-[#9CA3AF] text-[10px] font-bold uppercase shrink-0">Contract</span><span className="text-[#6B7280] text-xs font-mono truncate">{token.address}</span><button onClick={()=>copyAddress(token.address)} className="text-[#9CA3AF] hover:text-[#111827] transition-colors p-1.5 shrink-0 bg-[#F8F9FB] rounded-md border border-[#E5E7EB]">{copiedAddr===token.address?<RiCheckLine className="text-[#16A34A]"/>:<RiFileCopyLine/>}</button></div><a href={token.url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 rounded-md bg-[#111827] text-white hover:bg-[#374151] transition-colors text-xs font-bold uppercase tracking-widest"><RiExternalLinkLine className="text-sm"/> DexScreener</a></div>
                          </div>
                        </motion.div>
                      )}</AnimatePresence>
                    </motion.div>);})}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
