"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  RiCheckLine, RiArrowRightUpLine, RiCloseLine,
  RiShieldCheckLine, RiVipDiamondLine, RiSparklingLine,
} from "react-icons/ri";

/* ═══════════════════════════════════════════
   CROSSHATCH
   ═══════════════════════════════════════════ */
function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.03)", size = "8px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

/* ═══════════════════════════════════════════
   PLAN DATA
   ═══════════════════════════════════════════ */
const PLANS = [
  {
    id: "basic",
    badge: "Starter",
    badgeColor: "#6B7280",
    name: "Basic",
    subtitle: "For researchers who want core AI intelligence without the extras.",
    price: "Free",
    priceSub: "500 INOD credits on signup",
    cta: "Get Started",
    ctaStyle: "ghost",
    features: [
      { text: "3 AI research reports per month", included: true },
      { text: "Basic token search and lookup", included: true },
      { text: "Community quests and credit earning", included: true },
      { text: "3 wallet tracking slots", included: true },
      { text: "5 alert configurations", included: true },
      { text: "Sentiment matrix access", included: false },
      { text: "Whale flow visualization", included: false },
      { text: "Portfolio autopilot", included: false },
      { text: "PDF export and sharing", included: false },
    ],
  },
  {
    id: "pro",
    badge: "Recommended",
    badgeColor: "#7C3AED",
    name: "Pro",
    subtitle: "For active traders who need deeper signals and more capacity.",
    price: "2,000",
    priceSub: "INOD credits required",
    cta: "Upgrade to Pro",
    ctaStyle: "primary",
    features: [
      { text: "15 AI research reports per month", included: true },
      { text: "Advanced token and pair analysis", included: true },
      { text: "All community quests and bounties", included: true },
      { text: "10 wallet tracking slots", included: true },
      { text: "20 alert configurations", included: true },
      { text: "Full sentiment matrix access", included: true },
      { text: "Whale flow visualization", included: false },
      { text: "Portfolio autopilot", included: false },
      { text: "PDF export and sharing", included: false },
    ],
  },
  {
    id: "institutional",
    badge: "Full Access",
    badgeColor: "#111827",
    name: "Institutional",
    subtitle: "For teams and power users who demand unlimited intelligence access.",
    price: "10,000",
    priceSub: "INOD credits required",
    cta: "Go Institutional",
    ctaStyle: "dark",
    features: [
      { text: "Unlimited AI research reports", included: true },
      { text: "Deep protocol and contract auditing", included: true },
      { text: "Priority quests and exclusive bounties", included: true },
      { text: "Unlimited wallet tracking", included: true },
      { text: "Unlimited alert configurations", included: true },
      { text: "Full sentiment matrix access", included: true },
      { text: "Whale flow + network topology", included: true },
      { text: "AI portfolio autopilot engine", included: true },
      { text: "PDF export, sharing, and API access", included: true },
    ],
  },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function TokenSection() {
  return (
    <section id="token" className="relative py-24 md:py-32 overflow-hidden bg-white">
      <CrosshatchStrip className="absolute inset-0 opacity-[0.25]" color="rgba(0,0,0,0.012)" size="24px" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-14 md:mb-20"
        >
          <div>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-semibold text-[#111827] tracking-tight leading-tight">
              Choose the right tier,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]">and start researching</span>
            </h2>
          </div>

          <p className="text-[#6B7280] text-[14px] font-normal leading-relaxed max-w-sm lg:text-right lg:pb-1">
            Earn INOD credits through quests and community participation, then use them to unlock deeper intelligence tiers.
          </p>
        </motion.div>

        {/* ── Plan Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const isRecommended = plan.id === "pro";
            const isDark = plan.id === "institutional";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`rounded-3xl p-7 md:p-8 flex flex-col relative overflow-hidden transition-all duration-300 ${
                  isDark
                    ? "bg-[#111827] border border-[#1F2937] text-white shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
                    : isRecommended
                    ? "bg-white border-2 border-[#7C3AED]/25 shadow-[0_8px_40px_rgba(124,58,237,0.08)]"
                    : "bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
                }`}
              >
                {/* Badge */}
                <div className="mb-6">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.14em] font-semibold border"
                    style={{
                      color: isDark ? "#A78BFA" : plan.badgeColor,
                      borderColor: isDark ? "rgba(167,139,250,0.2)" : `${plan.badgeColor}20`,
                      backgroundColor: isDark ? "rgba(167,139,250,0.08)" : `${plan.badgeColor}08`,
                    }}
                  >
                    {plan.id === "basic" && <RiShieldCheckLine />}
                    {plan.id === "pro" && <RiSparklingLine />}
                    {plan.id === "institutional" && <RiVipDiamondLine />}
                    {plan.badge}
                  </span>
                </div>

                {/* Plan Name */}
                <h3 className={`text-[22px] font-semibold tracking-tight mb-1.5 ${isDark ? "text-white" : "text-[#111827]"}`}>
                  {plan.name} <span className={isDark ? "text-white/40" : "text-[#9CA3AF]"}>Plan</span>
                </h3>

                <p className={`text-[12px] font-normal leading-relaxed mb-6 ${isDark ? "text-white/40" : "text-[#6B7280]"}`}>
                  {plan.subtitle}
                </p>

                {/* Features */}
                <div className="mb-8 flex-1">
                  <div className={`text-[11px] font-semibold mb-4 ${isDark ? "text-white/60" : "text-[#111827]"}`}>
                    This tier includes
                  </div>
                  <div className="space-y-2.5">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2.5">
                        {f.included ? (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isDark ? "bg-[#A78BFA]/15" : "bg-[#7C3AED]/8"}`}>
                            <RiCheckLine className={`text-[9px] ${isDark ? "text-[#A78BFA]" : "text-[#7C3AED]"}`} />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 mt-0.5">
                            <RiCloseLine className="text-[9px] text-[#D1D5DB]" />
                          </span>
                        )}
                        <span className={`text-[12px] leading-relaxed ${
                          f.included
                            ? isDark ? "text-white/70" : "text-[#374151]"
                            : isDark ? "text-white/20" : "text-[#D1D5DB]"
                        }`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className={`border-t pt-6 mb-6 ${isDark ? "border-white/[0.06]" : "border-[#E5E7EB]"}`}>
                  <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-[32px] font-semibold font-mono tracking-tight ${isDark ? "text-white" : "text-[#111827]"}`}>
                        {plan.price}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-medium pb-1.5 ${isDark ? "text-white/30" : "text-[#9CA3AF]"}`}>
                      {plan.priceSub}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/app"
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[12px] font-semibold uppercase tracking-[0.1em] transition-all duration-300 active:scale-[0.98] ${
                    plan.ctaStyle === "dark"
                      ? "bg-white text-[#111827] hover:bg-[#F8F9FB]"
                      : plan.ctaStyle === "primary"
                      ? "bg-[#111827] text-white hover:bg-[#1F2937] shadow-[0_2px_8px_rgba(17,24,39,0.2),0_1px_0_0_#0A0E17]"
                      : "bg-white text-[#111827] border border-dashed border-[#D1D5DB] hover:border-[#111827] hover:bg-[#FAFBFC]"
                  }`}
                >
                  {plan.cta}
                  <RiArrowRightUpLine className="text-sm" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
