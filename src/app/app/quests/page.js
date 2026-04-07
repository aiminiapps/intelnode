"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  RiTwitterXLine, RiHeart3Line, RiChat3Line, RiTelegramLine,
  RiGroupLine, RiSearchLine, RiVipDiamondLine, RiNotification3Line,
  RiWallet3Line, RiCalendarLine, RiShareLine,
  RiCheckLine, RiCoinLine, RiArrowRightLine, RiStarLine,
  RiExternalLinkLine, RiLock2Line, RiTaskLine, RiLoader4Line
} from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const QUEST_ICONS = {
  twitter: RiTwitterXLine, like: RiHeart3Line, chat: RiChat3Line,
  telegram: RiTelegramLine, users: RiGroupLine, search: RiSearchLine,
  gem: RiVipDiamondLine, bell: RiNotification3Line, wallet: RiWallet3Line,
  calendar: RiCalendarLine, share: RiShareLine,
  coin: RiCoinLine, star: RiStarLine,
};

const CATEGORIES = [
  { id: "all", label: "All Quests" },
  { id: "social", label: "Social" },
  { id: "platform", label: "Platform" },
  { id: "community", label: "Community" },
];

const ALL_QUESTS = [
  { id: "q1", title: "Follow ChainOracle on X", desc: "Follow our official account and stay updated", category: "social", icon: "twitter", reward: 100, link: "https://x.com/aichainoracle" },
  { id: "q2", title: "Like & Repost Launch Tweet", desc: "Engage with our launch announcement", category: "social", icon: "like", reward: 50, link: "https://x.com/aichainoracle" },
  { id: "q3", title: "Join Telegram Community", desc: "Join our Telegram group for alpha leaks", category: "social", icon: "telegram", reward: 100, link: "https://x.com/aichainoracle" },
  { id: "q5", title: "Share ChainOracle with Friends", desc: "Share a referral link on any platform", category: "social", icon: "share", reward: 75, link: "https://x.com/intent/tweet?text=Check%20out%20ChainOracle%20-%20AI-powered%20predictive%20analytics%20platform!%20%40aichainoracle" },
  { id: "q6", title: "Run Your First Forecast", desc: "Run the AI Forecast Analyzer on any token", category: "platform", icon: "search", reward: 150, link: null },
  { id: "q7", title: "Explore Oracle Predictions", desc: "Open the Oracle Predictions page", category: "platform", icon: "gem", reward: 50, link: null },
  { id: "q8", title: "Connect Your Wallet", desc: "Link a wallet to your ChainOracle account", category: "platform", icon: "wallet", reward: 200, link: null },
  { id: "q9", title: "Set Up Signal Alerts", desc: "Customize your signal alert preferences", category: "platform", icon: "bell", reward: 50, link: null },
  { id: "q10", title: "Daily Login Streak (3 Days)", desc: "Open ChainOracle for 3 consecutive days", category: "community", icon: "calendar", reward: 150, link: null },
  { id: "q11", title: "Invite 3 Friends", desc: "Get 3 friends to sign up via referral", category: "community", icon: "users", reward: 300, link: null },
  { id: "q12", title: "Submit Feedback", desc: "Share your thoughts on how to improve ChainOracle", category: "community", icon: "chat", reward: 100, link: null },
];

const CARD = "rounded-2xl border border-dashed border-[#2A2A3A]/60 bg-[#0D0D14] relative overflow-hidden";
const CARD_INNER = "rounded-xl border border-[#1E1E2E] bg-[#0A0A0F]";

export default function QuestsPage() {
  const { balance, completedQuests, completeQuest, isConnected } = useTokens();
  const { openConnectModal } = useConnectModal();
  const [category, setCategory] = useState("all");
  const [claimingId, setClaimingId] = useState(null);

  const filtered = ALL_QUESTS.filter((q) => category === "all" || q.category === category);
  const totalReward = ALL_QUESTS.reduce((acc, q) => acc + q.reward, 0);
  const earnedReward = ALL_QUESTS.filter(q => completedQuests.includes(q.id)).reduce((acc, q) => acc + q.reward, 0);
  const progressPct = (completedQuests.length / ALL_QUESTS.length) * 100;

  function handleClaim(quest) {
    if (!isConnected) return;
    if (completedQuests.includes(quest.id)) return;
    setClaimingId(quest.id);
    if (quest.link) {
      window.open(quest.link, "_blank", "noopener,noreferrer");
    }
    setTimeout(() => {
      completeQuest(quest.id, quest.reward);
      setClaimingId(null);
    }, 1200);
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="max-w-md w-full relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#7C3AED]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <div className="w-24 h-24 rounded-3xl bg-[#0D0D14] border border-dashed border-[#7C3AED]/30 flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/20 to-transparent rounded-3xl" />
            <RiLock2Line className="text-[#9F67FF] text-4xl relative z-10 drop-shadow-[0_0_15px_rgba(159,103,255,0.5)]" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">Connect Wallet to Access Quests</h1>
          <p className="text-[#8E8E9A] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            To start earning <span className="text-[#9F67FF] font-semibold">$CORA</span> tokens, you need to connect your wallet first. You'll receive <span className="text-[#9F67FF] font-semibold">500 $CORA</span> as a welcome bonus!
          </p>
          
          <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-dashed border-[#2A2A3A]/60 bg-[#0A0A0F] mb-8 w-fit mx-auto">
            <RiCoinLine className="text-[#7C3AED] text-lg" />
            <span className="text-[#555] font-bold text-xl">0</span>
            <span className="text-[#555] text-xs font-semibold uppercase tracking-wider">CORA</span>
          </div>
          
          <button onClick={openConnectModal} className="btn-3d px-8 py-4 text-sm flex items-center gap-2 mx-auto">
            <RiWallet3Line className="text-lg" />
            Connect Wallet
          </button>
          
          <div className="mt-12 relative">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] rounded-2xl pointer-events-none" />
            <div className="grid gap-3 opacity-30 select-none">
              {ALL_QUESTS.slice(0, 3).map((q) => {
                const Icon = QUEST_ICONS[q.icon] || RiStarLine;
                return (
                  <div key={q.id} className={`p-4 ${CARD} flex items-center gap-4 border-[#1E1E2E]`}>
                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center shrink-0">
                      <Icon className="text-[#7C3AED] text-lg" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-semibold text-sm">{q.title}</h3>
                      <p className="text-[#555] text-xs">{q.desc}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#7C3AED]/10 text-[#9F67FF] text-[10px] font-bold">+{q.reward}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center border border-[#22C55E]/20">
            <RiTaskLine className="text-[#22C55E] text-sm" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Quest Center</h1>
            <p className="text-[#555] text-xs mt-0.5">Complete tasks to earn $CORA tokens</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D0D14] border border-dashed border-[#2A2A3A]">
          <RiCoinLine className="text-[#22C55E] text-sm" />
          <span className="text-white font-bold">{balance.toLocaleString()}</span>
          <span className="text-[#555] text-[10px] uppercase font-bold tracking-wider">CORA</span>
        </div>
      </div>

      <div className={`p-5 ${CARD}`}>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#22C55E]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <RiTaskLine className="text-[#22C55E] text-sm" />
            <span className="text-white font-semibold text-sm">Overall Progress</span>
          </div>
          <span className="text-[#8E8E9A] text-[11px] font-medium">
            <span className="text-white">{completedQuests.length}</span>/{ALL_QUESTS.length} Quests 
            <span className="mx-2 text-[#2A2A3A]">|</span> 
            <span className="text-[#22C55E]">{earnedReward.toLocaleString()}</span>/{totalReward.toLocaleString()} CORA
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#1E1E2E] overflow-hidden relative z-10">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progressPct}%` }} 
            transition={{ duration: 1, ease: "easeOut" }} 
            className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80]" 
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} 
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat.id 
                ? "bg-[#22C55E]/10 border border-dashed border-[#22C55E]/40 text-[#22C55E]" 
                : "bg-[#0D0D14] border border-dashed border-[#2A2A3A]/60 text-[#8E8E9A] hover:text-white hover:border-[#22C55E]/30"
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((quest, i) => {
          const isCompleted = completedQuests.includes(quest.id);
          const isClaiming = claimingId === quest.id;
          const Icon = QUEST_ICONS[quest.icon] || RiStarLine;
          const hasLink = !!quest.link;
          
          return (
            <motion.div key={quest.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`p-4 group ${CARD} transition-all duration-300 ${isCompleted ? "border-[#22C55E]/20 bg-[#22C55E]/[0.02]" : "hover:border-[#2A2A3A]"}`}>
              
              {isCompleted && <div className="absolute top-0 left-0 w-1 h-full bg-[#22C55E]/50" />}
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 h-full">
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isCompleted ? "bg-[#22C55E]/10 ring-1 ring-[#22C55E]/20" : "bg-[#22C55E]/5 ring-1 ring-[#1E1E2E]"
                }`}>
                  {isCompleted ? <RiCheckLine className="text-[#22C55E] text-xl" /> : <Icon className="text-[#22C55E] text-xl opacity-80 group-hover:opacity-100 transition-opacity" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`font-semibold text-sm truncate ${isCompleted ? "text-[#555] line-through" : "text-white"}`}>{quest.title}</h3>
                    {hasLink && !isCompleted && <RiExternalLinkLine className="text-[#555] text-[10px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <p className={`text-[11px] leading-relaxed mb-3 ${isCompleted ? "text-[#555]" : "text-[#8E8E9A]"}`}>{quest.desc}</p>
                  
                  <div className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-bold border border-dashed ${
                    isCompleted ? "bg-[#22C55E]/5 border-[#22C55E]/20 text-[#22C55E]/60" : "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
                  }`}>
                    <RiCoinLine className={isCompleted ? "opacity-60" : ""} />
                    +{quest.reward} CORA
                  </div>
                </div>
                
                <div className="shrink-0 mt-3 sm:mt-0 sl:self-end">
                  {isCompleted ? (
                    <div className="flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold border border-[#22C55E]/20">
                      Completed
                    </div>
                  ) : (
                    <button onClick={() => handleClaim(quest)} disabled={isClaiming} 
                      className="btn-3d btn-3d-sm w-full sm:w-auto px-5 py-2 text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 group/btn border-[#22C55E] bg-[#22C55E] hover:bg-[#16A34A]">
                      {isClaiming ? (
                        <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                          <RiLoader4Line className="text-sm" />
                        </motion.div>
                      ) : (
                        <>Claim <RiArrowRightLine className="group-hover/btn:translate-x-0.5 transition-transform" /></>
                      )}
                    </button>
                  )}
                </div>
                
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
