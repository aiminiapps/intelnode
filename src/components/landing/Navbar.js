"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { RiMenu3Line, RiCloseLine, RiArrowRightUpLine } from "react-icons/ri";
import Image from "next/image";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "$INOD", href: "#token" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`relative flex items-center justify-between w-full max-w-5xl px-5 py-2.5 mx-auto transition-all duration-500 pointer-events-auto rounded-full ${
            scrolled || mobileOpen
              ? "bg-white/85 backdrop-blur-2xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
              : "bg-white/50 backdrop-blur-lg border border-[#E5E7EB]/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 relative z-10 group pl-1">
            <Image src="/logo.png" alt="Logo" width={160} height={32} />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-5 py-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FB] rounded-full transition-all text-[13px] font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="hidden md:block">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white bg-[#111827] rounded-full transition-all hover:bg-[#1F2937] active:scale-[0.97]"
                style={{ boxShadow: "0 2px 8px rgba(17,24,39,0.2), 0 1px 0 0 #0A0E17" }}
              >
                Launch App
                <RiArrowRightUpLine className="text-[14px]" />
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[#111827] w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F8F9FB] transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <RiCloseLine size={22} /> : <RiMenu3Line size={22} />}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[5.5rem] left-4 right-4 z-40 bg-white/95 backdrop-blur-2xl border border-[#E5E7EB] rounded-3xl p-6 md:hidden shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FB] px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 pb-2 mt-3 border-t border-dashed border-[#E5E7EB]">
                <Link
                  href="/app"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white bg-[#111827] rounded-2xl transition-all hover:bg-[#1F2937]"
                  style={{ boxShadow: "0 2px 8px rgba(17,24,39,0.2), 0 1px 0 0 #0A0E17" }}
                >
                  Launch App
                  <RiArrowRightUpLine className="text-[14px]" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
