"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import Image from "next/image";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "$CORA", href: "#token" },
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
      {/* Navbar Container */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`relative flex items-center justify-between w-full max-w-5xl px-4 py-2.5 mx-auto transition-all duration-500 pointer-events-auto rounded-full ${
            scrolled || mobileOpen
              ? "bg-[#0D0D14]/70 backdrop-blur-2xl border border-[#7C3AED]/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              : "bg-[#0A0A0F]/30 backdrop-blur-lg border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          }`}
          style={{
            boxShadow: scrolled || mobileOpen ? "inset 0 1px 0 0 rgba(124,58,237,0.1), 0 8px 32px rgba(0,0,0,0.6)" : "none"
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 relative z-10 group pl-2">
            <Image src="/logo.png" alt="Logo" width={160} height={32} />
          </Link>

          {/* Desktop Links - Centered */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-5 py-2 text-[#A1A1AA] hover:text-[#9F67FF] hover:bg-white/[0.04] rounded-full transition-all text-sm font-medium"
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
                className="btn-3d btn-3d-sm block"
              >
                Launch App
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[5.5rem] left-4 right-4 z-40 bg-[#141420]/90 backdrop-blur-3xl border border-[#7C3AED]/15 rounded-[2rem] p-6 md:hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            style={{
              boxShadow: "inset 0 1px 0 0 rgba(124,58,237,0.1), 0 20px 60px rgba(0,0,0,0.8)"
            }}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#CCC] hover:text-[#9F67FF] hover:bg-white/[0.04] px-4 py-3.5 rounded-xl text-lg font-medium transition-all"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 pb-2 mt-2 border-t border-white/5">
                <Link
                  href="/app"
                  onClick={() => setMobileOpen(false)}
                  className="btn-3d block w-full py-4 text-center"
                >
                  Launch App
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
