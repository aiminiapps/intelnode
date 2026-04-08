"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RiLock2Line, RiArrowRightLine, RiVipCrownLine } from "react-icons/ri";
import { useTokens, TIERS, getNextTier } from "@/context/TokenContext";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

/**
 * TierGate — wraps content that requires a minimum tier.
 * If the user doesn't meet the requirement, shows a premium lock overlay.
 *
 * @param {string} requiredTier - "PRO" or "INSTITUTIONAL"
 * @param {string} featureName - Name of the gated feature for the lock message
 * @param {React.ReactNode} children - The gated content
 * @param {string} className - Optional wrapper className
 */
export default function TierGate({ requiredTier = "PRO", featureName = "This feature", children, className = "" }) {
  const { tier, balance } = useTokens();

  const required = TIERS[requiredTier];
  if (!required) return children;

  const hasAccess = balance >= required.minBalance;
  if (hasAccess) return children;

  const next = required;
  const tokensNeeded = next.minBalance - balance;

  return (
    <div className={`relative ${className}`}>
      {/* Blurred, non-interactive content preview */}
      <div className="pointer-events-none select-none filter blur-[6px] opacity-40 overflow-hidden max-h-[500px]">
        {children}
      </div>

      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl"
      >
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center mx-auto mb-5 relative overflow-hidden shadow-sm">
            <CrosshatchStrip className="absolute inset-0 opacity-20 pointer-events-none" color="rgba(255,255,255,0.15)" size="5px" />
            <RiLock2Line className="text-white text-2xl relative z-10" />
          </div>

          <h3 className="text-[#111827] font-bold text-lg mb-2">{featureName}</h3>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
            Requires <span className="text-[#111827] font-bold">{next.name} Tier</span> ({next.minBalance.toLocaleString()} INOD).
            You need <span className="text-[#111827] font-semibold">{tokensNeeded.toLocaleString()}</span> more tokens.
          </p>

          {/* Tier progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <span className="text-[#9CA3AF]">{tier.name}</span>
              <span className="text-[#111827]">{next.name}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F3F4F6] overflow-hidden border border-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#111827] transition-all duration-500 relative overflow-hidden"
                style={{ width: `${Math.min(100, (balance / next.minBalance) * 100)}%` }}
              >
                <CrosshatchStrip className="absolute inset-0 opacity-15 pointer-events-none" color="rgba(255,255,255,0.4)" size="4px" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1 font-mono">
              <span>{balance.toLocaleString()}</span>
              <span>{next.minBalance.toLocaleString()} INOD</span>
            </div>
          </div>

          <Link
            href="/app/quests"
            className="btn-intel inline-flex items-center gap-2 px-6 py-3 text-sm w-full justify-center"
          >
            <RiVipCrownLine /> Earn $INOD to Unlock <RiArrowRightLine className="text-white/60" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
