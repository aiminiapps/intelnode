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

/* ══════════════════════════════════════════════
   Split nav items into two groups:
   MAIN = first 3 (Dashboard, Intel Feed, Research)
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
     NAV LINK COMPONENT — Light theme
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
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200 relative overflow-hidden
            ${active
              ? "text-[#7C3AED] bg-[rgba(124,58,237,0.06)] border border-[#E5E7EB]"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FB]"
            }
          `}
          whileTap={{ scale: 0.97 }}
        >
          {/* Active indicator — left edge */}
          {active && (
            <motion.div
              layoutId="sidebar-active-glow"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#7C3AED]"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}

          <Icon className={`text-lg shrink-0 transition-colors duration-200 ${active ? "text-[#7C3AED]" : "group-hover:text-[#7C3AED]"}`} />
          {(!collapsed || mobile) && (
            <span className="truncate">{item.name}</span>
          )}

          {/* Collapsed active dot */}
          {collapsed && !mobile && active && (
            <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
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
      <div className="px-4 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {(!collapsed || mobile) && (
            <div>
              <h1 className="text-[#111827] font-bold text-base leading-tight tracking-tight">IntelNode</h1>
              <p className="text-[#9CA3AF] text-[10px] font-medium leading-tight">Intelligence Hub</p>
            </div>
          )}
        </Link>
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F8F9FB] transition-all"
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
          className="px-4 mb-3"
        >
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#F8F9FB] border border-[#E5E7EB] text-[#9CA3AF] hover:border-[#7C3AED]/20 transition-colors cursor-pointer group">
            <RiSearchLine className="text-sm shrink-0 group-hover:text-[#7C3AED] transition-colors" />
            <span className="text-xs flex-1">Search</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#9CA3AF] font-mono border border-[#E5E7EB]">/</kbd>
          </div>
        </motion.div>
      )}

      {/* Collapsed balance icon */}
      {collapsed && !mobile && (
        <div className="mx-auto my-2 w-9 h-9 rounded-lg bg-[rgba(124,58,237,0.06)] flex items-center justify-center" title={`${loaded ? balance : '...'} INOD`}>
          <RiCoinLine className="text-[#7C3AED] text-sm" />
        </div>
      )}

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 overflow-y-auto mt-1">
        {/* MAIN section */}
        {(!collapsed || mobile) && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] px-3 mb-2">
            Navigation
          </p>
        )}
        <div className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.name} item={item} mobile={mobile} />
          ))}
        </div>

        {/* Separator */}
        <div className={`my-3 ${collapsed && !mobile ? 'mx-2' : 'mx-3'} border-t border-[#E5E7EB]`} />

        {/* TOOLS section */}
        {(!collapsed || mobile) && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] px-3 mb-2">
            Tools
          </p>
        )}
        <div className="space-y-0.5">
          {TOOLS_NAV.map((item) => (
            <NavLink key={item.name} item={item} mobile={mobile} />
          ))}
        </div>
      </nav>

      {/* ─── PROJECT INFO CARD ─── */}
      {(!collapsed || mobile) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-3 mb-2"
        >
          <div className="relative rounded-lg overflow-hidden p-4 border border-[#E5E7EB] bg-white">
            {/* Crosshatch pattern accent at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:6px_6px]" style={{ '--pattern-fg': 'rgba(124,58,237,0.12)' }} />

            {/* Logo + Title */}
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-[#111827] font-bold text-sm leading-tight">IntelNode</h4>
                  <p className="text-[#9CA3AF] text-[10px] leading-tight">$INOD</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#6B7280] text-[11px] leading-relaxed mb-3">
                Crypto intelligence hub — institution-grade research & analytics.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/intelnode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-[#111827] bg-[#F8F9FB] border border-[#E5E7EB] hover:border-[#7C3AED]/30 hover:text-[#7C3AED] transition-all duration-200"
                >
                  <RiTwitterXLine className="text-xs" />
                  Follow
                </a>
                <a
                  href="https://bscscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-all duration-200"
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
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#DC2626]/5 transition-all text-sm font-medium w-full group
            ${collapsed && !mobile ? 'justify-center' : ''}
          `}
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
        className="hidden lg:flex flex-col bg-white h-screen sticky top-0 overflow-hidden border-r border-[#E5E7EB]"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-[#E5E7EB] flex items-center justify-center text-[#111827] shadow-sm"
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
              className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280, opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[270px] bg-white border-r border-[#E5E7EB] shadow-xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#F8F9FB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors z-10"
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
