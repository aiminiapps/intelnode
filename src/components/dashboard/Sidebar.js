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
} from "react-icons/ri";
import { NAV_ITEMS } from "@/lib/constants";
import { useTokens } from "@/context/TokenContext";

const MAIN_NAV = NAV_ITEMS.slice(0, 3);
const ADVANCED_NAV = NAV_ITEMS.slice(3, 6);
const TOOLS_NAV = NAV_ITEMS.slice(6);

/* ═══════════════════════════════════════════
   Inline SVG pattern as a reusable component
   Used throughout sidebar for texture
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
    if (isConnected) disconnect();
  }

  /* ═══════════════════════════════════════════
     NAV LINK — Black accent, SVG pattern active
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
            flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium
            transition-all duration-200 relative overflow-hidden
            ${active
              ? "text-[#111827] bg-[#F8F9FB] border border-[#E5E7EB]"
              : "text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFBFC]"
            }
          `}
          whileTap={{ scale: 0.97 }}
        >
          {/* ── Active: crosshatch pattern fills the entire background ── */}
          {active && (
            <CrosshatchStrip
              className="absolute inset-0 opacity-[0.35] pointer-events-none"
              color="rgba(0,0,0,0.045)"
              size="8px"
            />
          )}

          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${active ? "bg-[#111827] text-white shadow-sm" : "bg-transparent text-[#9CA3AF] group-hover:text-[#111827]"}`}>
            <Icon className="text-[15px]" />
          </div>

          {(!collapsed || mobile) && (
            <span className="truncate relative z-10">{item.name}</span>
          )}

          {/* Active: small arrow indicator on right */}
          {active && (!collapsed || mobile) && (
            <svg className="ml-auto w-3 h-3 text-[#9CA3AF] relative z-10" viewBox="0 0 6 10" fill="none">
              <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}

          {/* Collapsed active dot */}
          {collapsed && !mobile && active && (
            <div className="absolute hidden -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#111827]" />
          )}
        </motion.div>
      </Link>
    );
  }

  /* ═══════════════════════════════════════════
     SIDEBAR CONTENT
     ═══════════════════════════════════════════ */
  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full relative">

      {/* ── Full-height right-edge crosshatch strip ── */}
      <CrosshatchStrip
        className="absolute top-0 right-0 w-[1px] h-full z-10 opacity-0"
        color="rgba(0,0,0,0.07)"
        size="6px"
      />

      {/* ─── Logo Bar ─── */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between relative">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* Logo mark — black with crosshatch texture */}
          <div className="w-9 h-9 rounded-sm bg-[#111827] flex items-center justify-center relative overflow-hidden shadow-sm">
            {/* Subtle crosshatch on logo bg */}
            <CrosshatchStrip
              className="absolute inset-0 opacity-20 pointer-events-none"
              color="rgba(255,255,255,0.15)"
              size="5px"
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative z-10">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {(!collapsed || mobile) && (
            <div>
              <h1 className="text-[#111827] font-bold text-[15px] leading-tight tracking-tight">IntelNode</h1>
              <p className="text-[#9CA3AF] text-[10px] font-medium leading-tight tracking-wide">INTELLIGENCE HUB</p>
            </div>
          )}
        </Link>
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all"
          >
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <RiMenu3Line size={14} />
            </motion.div>
          </button>
        )}
      </div>

      {/* ── Crosshatch separator under logo ── */}
      <div className="mx-4 mb-3">
        <CrosshatchStrip
          className="h-[5px] rounded-sm"
          color="rgba(0,0,0,0.04)"
          size="6px"
        />
      </div>

      {/* ─── INOD Balance Pill (expanded) ─── */}
      {(!collapsed || mobile) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 mb-4"
        >
          <div className="flex items-center justify-between px-3 py-2.5 rounded-sm bg-[#FAFBFC] border border-[#E5E7EB] relative overflow-hidden">
            {/* Pattern accent on balance card */}
            <CrosshatchStrip
              className="absolute right-0 top-0 bottom-0 w-10 opacity-30 pointer-events-none"
              color="rgba(0,0,0,0.04)"
              size="7px"
            />
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-6 h-6 rounded-md bg-[#111827] flex items-center justify-center">
                <RiCoinLine className="text-white text-[11px]" />
              </div>
              <div>
                <p className="text-[#111827] font-bold text-sm leading-none">{loaded ? balance.toLocaleString() : "..."}</p>
                <p className="text-[#9CA3AF] text-[9px] font-semibold tracking-widest uppercase">INOD</p>
              </div>
            </div>
            <Link href="/app/quests" className="text-[10px] font-bold text-[#111827] bg-white border border-[#E5E7EB] px-2 py-1 rounded-md hover:bg-[#111827] hover:text-white hover:border-[#111827] transition-all relative z-10">
              EARN
            </Link>
          </div>
        </motion.div>
      )}

      {/* Collapsed balance icon */}
      {collapsed && !mobile && (
        <div className="mx-auto my-2 w-9 h-9 rounded-sm bg-[#111827] flex items-center justify-center" title={`${loaded ? balance : '...'} INOD`}>
          <RiCoinLine className="text-white text-sm" />
        </div>
      )}

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {/* MAIN section */}
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Intelligence
            </p>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>
        )}
        <div className="space-y-1">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.name} item={item} mobile={mobile} />
          ))}
        </div>

        {/* ── Crosshatch separator ── */}
        <div className={`my-3 ${collapsed && !mobile ? 'mx-1' : 'mx-2'}`}>
          <CrosshatchStrip
            className="h-[5px] rounded-sm"
            color="rgba(0,0,0,0.035)"
            size="6px"
          />
        </div>

        {/* ADVANCED section */}
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Advanced
            </p>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>
        )}
        <div className="space-y-1">
          {ADVANCED_NAV.map((item) => (
            <NavLink key={item.name} item={item} mobile={mobile} />
          ))}
        </div>

        {/* ── Crosshatch separator ── */}
        <div className={`my-3 ${collapsed && !mobile ? 'mx-1' : 'mx-2'}`}>
          <CrosshatchStrip
            className="h-[5px] rounded-sm"
            color="rgba(0,0,0,0.035)"
            size="6px"
          />
        </div>

        {/* TOOLS section */}
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Tools
            </p>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>
        )}
        <div className="space-y-1">
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
          <div className="relative rounded-sm overflow-hidden bg-[#111827] p-4">
            {/* ── Full crosshatch pattern overlay on dark card ── */}
            <CrosshatchStrip
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              color="rgba(255,255,255,0.4)"
              size="8px"
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-[13px] leading-tight">IntelNode</h4>
                  <p className="text-white/40 text-[10px] leading-tight font-mono">$INOD</p>
                </div>
              </div>

              <p className="text-white/50 text-[11px] leading-relaxed mb-3">
                Institution-grade crypto intelligence & research platform.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href="https://x.com/intelnode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-[7px] rounded-md text-[11px] font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <RiTwitterXLine className="text-xs" />
                  Follow
                </a>
                <a
                  href="https://bscscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-[7px] rounded-md text-[11px] font-semibold text-[#111827] bg-white hover:bg-white/90 transition-all duration-200"
                >
                  <RiGlobalLine className="text-xs" />
                  BSCScan
                  <RiArrowRightUpLine className="text-[10px] opacity-40" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Disconnect Button ─── */}
      <div className="px-3 pb-3 pt-1">
        <div className="mx-1 mb-2">
          <CrosshatchStrip
            className="h-[3px] rounded-sm"
            color="rgba(0,0,0,0.03)"
            size="5px"
          />
        </div>
        <button
          onClick={handleDisconnect}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all text-[13px] font-medium w-full group
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
                className="absolute top-4 right-4 w-8 h-8 rounded-sm bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-colors z-10"
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
