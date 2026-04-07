"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useDisconnect, useAccount } from "wagmi";
import {
  RiMenu3Line,
  RiCloseLine,
  RiLogoutBoxRLine,
  RiCoinLine,
  RiTwitterXLine,
  RiGlobalLine,
  RiArrowRightUpLine,
  RiSearchLine,
  RiDashboardLine,
} from "react-icons/ri";
import { NAV_ITEMS } from "@/lib/constants";
import { useTokens } from "@/context/TokenContext";
import Image from "next/image";

/* ══════════════════════════════════════════════
   Split nav items into two groups:
   MAIN = first 3 (Dashboard, Predictions, Analyzer)
   TOOLS = rest (Quests, Wallets, Alerts)
   ══════════════════════════════════════════════ */
const MAIN_NAV = NAV_ITEMS.slice(0, 3);
const TOOLS_NAV = NAV_ITEMS.slice(3);

export default function Sidebar() {
  const pathname = usePathname();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const { balance, loaded } = useTokens();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  function handleDisconnect() {
    if (isConnected) {
      disconnect();
    }
  }

  /* ═══════════════════════════════════════════
     NAV LINK COMPONENT — 3D style
     ═══════════════════════════════════════════ */
  function NavLink({ item, mobile }) {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={() => mobile && setMobileOpen(false)}
        className="relative block group"
      >
        <motion.div
          layout
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium
            transition-all duration-300 relative overflow-hidden
            ${active
              ? "text-white border-dashed border border-gray-500/30"
              : "text-[#8E8E9A] hover:text-white "
            }
          `}
          style={active ? {
            background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(159,103,255,0.08) 100%)",
            boxShadow: `
              0 1px 0 0 rgba(159,103,255,0.1) inset,
              0 -1px 0 0 rgba(91,33,182,0.15) inset,
              0 2px 8px rgba(124,58,237,0.12),
              0 0 0 1px rgba(124,58,237,0.15)
            `,
          } : {}}
          whileHover={!active ? {
            backgroundColor: "rgba(28,28,46,0.5)",
            transition: { duration: 0.2 },
          } : {}}
          whileTap={{ scale: 0.97 }}
        >
          {/* Active glow indicator — left edge */}
          {active && (
            <motion.div
              layoutId="sidebar-active-glow"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#7C3AED]"
              style={{ boxShadow: "0 0 8px 2px rgba(124,58,237,0.4)" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}

          <Icon className={`text-lg shrink-0 transition-colors duration-200 ${active ? "text-[#9F67FF]" : "group-hover:text-[#9F67FF]"}`} />
          {(!collapsed || mobile) && (
            <span className="truncate">{item.name}</span>
          )}

          {/* Collapsed active dot */}
          {collapsed && !mobile && active && (
            <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#7C3AED] shadow-[0_0_6px_rgba(124,58,237,0.6)]" />
          )}
        </motion.div>
      </Link>
    );
  }

  /* ═══════════════════════════════════════════
     SIDEBAR CONTENT
     ═══════════════════════════════════════════ */
  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">

      {/* ─── Logo Bar ─── */}
      <div className="px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="Logo" width={160} height={50} className="pl-2"/>
        </Link>
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#6B6B76] hover:text-white hover:bg-[#1C1C2E] transition-all"
          >
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
              {collapsed ? <RiMenu3Line size={14} /> : <RiCloseLine size={14} className="sm:hidden block" />}
            </motion.div>
          </button>
        )}
      </div>

      {/* ─── Search Bar (expanded only) ─── */}
      {(!collapsed || mobile) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 mb-2"
        >
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0D0D14] border border-[#2A2A3A] text-[#6B6B76] hover:border-[#7C3AED]/20 transition-colors cursor-pointer group">
            <RiSearchLine className="text-sm shrink-0 group-hover:text-[#9F67FF] transition-colors" />
            <span className="text-xs flex-1">Search</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1C2E] text-[#555] font-mono border border-[#2A2A3A]/50">/</kbd>
          </div>
        </motion.div>
      )}

      {/* Collapsed balance icon */}
      {collapsed && !mobile && (
        <div className="mx-auto my-2 w-9 h-9 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center" title={`${loaded ? balance : '...'} CORA`}>
          <RiCoinLine className="text-[#9F67FF] text-sm" />
        </div>
      )}

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 overflow-y-auto mt-2">
        {/* MAIN section */}
        {(!collapsed || mobile) && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#555] px-3 mb-2">
            Navigation
          </p>
        )}
        <div className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.name} item={item} mobile={mobile} />
          ))}
        </div>

        {/* Separator */}
        <div className={`my-3 ${collapsed && !mobile ? 'mx-2' : 'mx-3'} border-t border-[#2A2A3A]/50`} />

        {/* TOOLS section */}
        {(!collapsed || mobile) && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#555] px-3 mb-2">
            Tools
          </p>
        )}
        <div className="space-y-0.5">
          {TOOLS_NAV.map((item) => (
            <NavLink key={item.name} item={item} mobile={mobile} />
          ))}
        </div>
      </nav>

      {/* ─── PROJECT INFO CARD (above disconnect) ─── */}
      {(!collapsed || mobile) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-3 mb-2"
        >
          <div className="relative rounded-sm overflow-hidden p-4  border-dashed border border-gray-500/30"
            style={{
              background: "linear-gradient(145deg, rgba(124,58,237,0.25) 0%, rgba(88,28,195,0.15) 40%, rgba(30,20,60,0.9) 100%)",
            }}
          >
            {/* Decorative glow orbs */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#7C3AED]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#9F67FF]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Logo + Title */}
            <div className="relative z-10 ">
              <div className="flex items-center gap-2.5 mb-2">
                <Image src="/agent.png" alt="Logo" width={32} height={32} />
                <div>
                  <h4 className="text-white font-bold text-sm leading-tight">ChainOracle</h4>
                  <p className="text-[#B8B8CC] text-[10px] leading-tight">$CORA</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#A1A1B5] text-[11px] leading-relaxed mb-3">
                AI-powered predictive analytics for DeFi alpha.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/aichainoracle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <RiTwitterXLine className="text-xs" />
                  Follow
                </a>
                <a
                  href="https://bscscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200"
                  style={{
                    background: "linear-gradient(180deg, #9F67FF 0%, #7C3AED 100%)",
                    color: "#fff",
                    boxShadow: "0 2px 0 0 #5B21B6, 0 2px 6px rgba(124,58,237,0.3), 0 1px 0 rgba(159,103,255,0.3) inset",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 3px 0 0 #5B21B6, 0 3px 10px rgba(124,58,237,0.4), 0 1px 0 rgba(159,103,255,0.4) inset";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 0 0 #5B21B6, 0 2px 6px rgba(124,58,237,0.3), 0 1px 0 rgba(159,103,255,0.3) inset";
                  }}
                >
                  <RiGlobalLine className="text-xs" />
                  BSCScan
                  <RiArrowRightUpLine className="text-[10px] opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Disconnect Button ─── */}
      <div className="px-3 pb-3 pt-1">
        <button
          onClick={handleDisconnect}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#8E8E9A] hover:text-[#EF4444] transition-all text-sm font-medium w-full group
            ${collapsed && !mobile ? 'justify-center' : ''}
          `}
          style={{
            background: "transparent",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <RiLogoutBoxRLine className="text-lg shrink-0 group-hover:rotate-12 transition-transform duration-300" />
          {(!collapsed || mobile) && <span>Disconnect</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="hidden lg:flex flex-col bg-[#0A0A0F] h-screen sticky top-0 overflow-hidden border-r border-[#1E1E2E]"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#141420]/90 backdrop-blur-md border border-[#2A2A3A] flex items-center justify-center text-white shadow-lg shadow-black/30"
      >
        <RiMenu3Line size={18} />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280, opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[270px] bg-[#0A0A0F] border-r border-[#1E1E2E] shadow-2xl shadow-black/50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#1C1C2E] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors z-10"
              >
                <RiCloseLine size={18} />
              </button>
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
