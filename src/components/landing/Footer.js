"use client";

import Image from "next/image";
import Link from "next/link";
import { RiTwitterXLine, RiArrowRightUpLine, RiBnbFill } from "react-icons/ri";

const footerLinks = {
  Product: [
    { name: "AI Forecast", href: "/app/analyzer" },
    { name: "Predictions", href: "/app/gems" },
    { name: "Wallet Tracker", href: "/app/wallets" },
    { name: "Signal Alerts", href: "/app/alerts" },
  ],
  Community: [
    { name: "Twitter / X", href: "https://x.com/aichainoracle" },
    { name: "Whitepaper", href: "https://chain-oracle.gitbook.io/chain-oracle-docs" }
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-transparent pt-24 pb-12 relative overflow-hidden"> 
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20">
          
          {/* Brand & Socials */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group inline-flex">
            <Image src="/logo.png" alt="Logo" width={160} height={32} />
            
            </Link>
            <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8">
              The premier AI-powered predictive analytics platform. Forecast token trends, discover alpha opportunities, and receive real-time signal intelligence before the crowd.
            </p>
            
            {/* Minimal Socials */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://x.com/aichainoracle"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#0A0A0F] border border-[#2A2A3A] text-[#A1A1AA] hover:text-[#9F67FF] hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 transition-all duration-300"
              >
                <RiTwitterXLine className="text-lg" />
                <span className="text-sm font-medium">Twitter / X</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#0A0A0F] border border-[#2A2A3A] text-[#A1A1AA] hover:text-[#9F67FF] hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/5 transition-all duration-300 group"
              >
                <div className="text-lg">
                <RiBnbFill />
                </div>
                <span className="text-sm font-medium">BscScan</span>
                <RiArrowRightUpLine className="text-xs opacity-50 group-hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap gap-16 md:gap-24 pt-2">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col">
                <h4 className="text-white font-bold text-base mb-6 tracking-wide uppercase">
                  {category}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[#A1A1AA] text-sm hover:text-[#9F67FF] hover:translate-x-1 inline-block transition-all duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#1C1C2E] flex items-center justify-center text-center">
          <p className="text-[#6B6B76] text-sm tracking-wide">
            © {currentYear} ChainOracle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
