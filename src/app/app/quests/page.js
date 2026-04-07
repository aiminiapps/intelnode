"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  RiTwitterXLine, RiHeart3Line, RiChat3Line, RiTelegramLine,
  RiGroupLine, RiSearchLine, RiVipDiamondLine, RiNotification3Line,
  RiWallet3Line, RiCalendarLine, RiShareLine,
  RiCheckLine, RiCoinLine, RiArrowRightLine, RiStarLine,
  RiExternalLinkLine, RiLock2Line, RiTaskLine, RiLoader4Line,
  RiTrophyLine, RiFlashlightLine
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
  { id: "q1", title: "Follow IntelNode on X", desc: "Follow our official account and stay updated with the latest intel", category: "social", icon: "twitter", reward: 100, link: "https://x.com/intelnode" },
  { id: "q2", title: "Like & Repost Launch Tweet", desc: "Engage with our launch announcement to spread the word", category: "social", icon: "like", reward: 50, link: "https://x.com/intelnode" },
  { id: "q3", title: "Join Telegram Community", desc: "Join our Telegram group for early alpha and intelligence leaks", category: "social", icon: "telegram", reward: 100, link: "https://x.com/intelnode" },
  { id: "q5", title: "Share IntelNode with Friends", desc: "Share a referral link on any social platform", category: "social", icon: "share", reward: 75, link: "https://x.com/intent/tweet?text=Check%20out%20IntelNode%20-%20AI-powered%20crypto%20intelligence%20hub!%20%40intelnode" },
  { id: "q6", title: "Run Your First Analysis", desc: "Use the AI Research Engine to analyze any token", category: "platform", icon: "search", reward: 150, link: null },
  { id: "q7", title: "Explore Intel Feed", desc: "Browse the Intel Feed for trending research reports", category: "platform", icon: "gem", reward: 50, link: null },
  { id: "q8", title: "Connect Your Wallet", desc: "Link a wallet to your IntelNode account", category: "platform", icon: "wallet", reward: 200, link: null },
  { id: "q9", title: "Set Up Signal Alerts", desc: "Customize your signal alert preferences", category: "platform", icon: "bell", reward: 50, link: null },
  { id: "q10", title: "Daily Login Streak (3 Days)", desc: "Open IntelNode for 3 consecutive days", category: "community", icon: "calendar", reward: 150, link: null },
  { id: "q11", title: "Invite 3 Friends", desc: "Get 3 friends to sign up via your referral", category: "community", icon: "users", reward: 300, link: null },
  { id: "q12", title: "Submit Feedback", desc: "Share your thoughts on how to improve IntelNode", category: "community", icon: "chat", reward: 100, link: null },
];

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

  /* ═══ WALLET NOT CONNECTED STATE ═══ */
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="max-w-md w-full relative z-10">

          <div className="w-24 h-24 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-8 shadow-sm relative overflow-hidden">
            <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.04)" size="8px" />
            <RiLock2Line className="text-[#111827] text-4xl relative z-10" />
          </div>

          <h1 className="text-3xl font-bold text-[#111827] mb-3">Connect Wallet to Access Quests</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            To start earning <span className="text-[#111827] font-semibold">$INOD</span> tokens, you need to connect your wallet first. You&apos;ll receive <span className="text-[#111827] font-semibold">500 $INOD</span> as a welcome bonus!
          </p>

          <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#E5E7EB] bg-white mb-8 w-fit mx-auto">
            <RiCoinLine className="text-[#111827] text-lg" />
            <span className="text-[#9CA3AF] font-bold text-xl">0</span>
            <span className="text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">INOD</span>
          </div>

          <button onClick={openConnectModal} className="btn-intel px-8 py-4 text-sm flex items-center gap-2 mx-auto">
            <RiWallet3Line className="text-lg" />
            Connect Wallet
          </button>

          <div className="mt-12 relative">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-[#F8F9FB]/80 to-[#F8F9FB] rounded-2xl pointer-events-none" />
            <div className="grid gap-3 opacity-40 select-none">
              {ALL_QUESTS.slice(0, 3).map((q) => {
                const Icon = QUEST_ICONS[q.icon] || RiStarLine;
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-[#E5E7EB] bg-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
                      <Icon className="text-[#111827] text-lg" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-[#111827] font-semibold text-sm">{q.title}</h3>
                      <p className="text-[#9CA3AF] text-xs">{q.desc}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#F3F4F6] text-[#111827] text-[10px] font-bold">+{q.reward}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ═══ MAIN QUESTS VIEW ═══ */
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center relative overflow-hidden">
            <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.15)" size="5px" />
            <RiTrophyLine className="text-white text-lg relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111827]">Quest Center</h1>
            <p className="text-[#9CA3AF] text-xs mt-0.5">Complete tasks to earn $INOD tokens</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] relative overflow-hidden">
          <CrosshatchStrip className="absolute right-0 top-0 bottom-0 w-8 opacity-25 pointer-events-none" color="rgba(0,0,0,0.04)" size="6px" />
          <RiCoinLine className="text-[#111827] text-sm" />
          <span className="text-[#111827] font-bold">{balance.toLocaleString()}</span>
          <span className="text-[#9CA3AF] text-[10px] uppercase font-bold tracking-wider">INOD</span>
        </div>
      </div>

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden">
        <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none" color="rgba(0,0,0,0.04)" size="6px" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <RiFlashlightLine className="text-[#111827] text-sm" />
            <span className="text-[#111827] font-semibold text-sm">Overall Progress</span>
          </div>
          <span className="text-[#6B7280] text-[11px] font-medium">
            <span className="text-[#111827] font-bold">{completedQuests.length}</span>/{ALL_QUESTS.length} Quests
            <span className="mx-2 text-[#E5E7EB]">|</span>
            <span className="text-[#111827] font-bold">{earnedReward.toLocaleString()}</span>/{totalReward.toLocaleString()} INOD
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden relative z-10 border border-[#E5E7EB]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-[#111827] relative overflow-hidden"
          >
            <CrosshatchStrip className="absolute inset-0 opacity-15 pointer-events-none" color="rgba(255,255,255,0.4)" size="4px" />
          </motion.div>
        </div>
      </div>

      {/* ═══ CATEGORY FILTERS ═══ */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
              category === cat.id
                ? "bg-[#111827] border-[#111827] text-white"
                : "bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827]/20"
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ═══ QUEST CARDS GRID ═══ */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((quest, i) => {
          const isCompleted = completedQuests.includes(quest.id);
          const isClaiming = claimingId === quest.id;
          const Icon = QUEST_ICONS[quest.icon] || RiStarLine;
          const hasLink = !!quest.link;

          return (
            <motion.div key={quest.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`p-5 group rounded-xl border bg-white transition-all duration-300 relative overflow-hidden ${isCompleted ? "border-[#16A34A]/20" : "border-[#E5E7EB] hover:border-[#111827]/15 hover:shadow-sm"}`}>

              {/* Completed left accent */}
              {isCompleted && <div className="absolute top-0 left-0 w-1 h-full bg-[#16A34A]" />}

              {/* Crosshatch accent on hover (non-completed) */}
              {!isCompleted && (
                <CrosshatchStrip className="absolute top-0 right-0 w-12 h-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" color="rgba(0,0,0,0.02)" size="8px" />
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 h-full relative z-10">

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border relative overflow-hidden ${
                  isCompleted ? "bg-[#16A34A]/5 border-[#16A34A]/20" : "bg-[#F8F9FB] border-[#E5E7EB] group-hover:bg-[#111827] group-hover:border-[#111827]"
                }`}>
                  {!isCompleted && (
                    <CrosshatchStrip className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity" color="rgba(255,255,255,0.2)" size="5px" />
                  )}
                  {isCompleted
                    ? <RiCheckLine className="text-[#16A34A] text-xl relative z-10" />
                    : <Icon className="text-[#6B7280] text-xl group-hover:text-white transition-colors relative z-10" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-sm truncate ${isCompleted ? "text-[#9CA3AF] line-through" : "text-[#111827]"}`}>{quest.title}</h3>
                    {hasLink && !isCompleted && <RiExternalLinkLine className="text-[#D1D5DB] text-[10px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  <p className={`text-[11px] leading-relaxed mb-3 ${isCompleted ? "text-[#D1D5DB]" : "text-[#6B7280]"}`}>{quest.desc}</p>

                  <div className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                    isCompleted ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#9CA3AF]" : "bg-[#F8F9FB] border-[#E5E7EB] text-[#111827]"
                  }`}>
                    <RiCoinLine className={isCompleted ? "opacity-40" : ""} />
                    +{quest.reward} INOD
                  </div>
                </div>

                <div className="shrink-0 mt-3 sm:mt-0">
                  {isCompleted ? (
                    <div className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#16A34A]/5 text-[#16A34A] text-xs font-bold border border-[#16A34A]/15">
                      <RiCheckLine className="mr-1.5" /> Completed
                    </div>
                  ) : (
                    <button onClick={() => handleClaim(quest)} disabled={isClaiming}
                      className="btn-intel w-full sm:w-auto px-5 py-2.5 text-xs disabled:opacity-50 flex items-center justify-center gap-1.5">
                      {isClaiming ? (
                        <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                          <RiLoader4Line className="text-sm" />
                        </motion.div>
                      ) : (
                        <>Claim <RiArrowRightLine className="group-hover:translate-x-0.5 transition-transform" /></>
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
