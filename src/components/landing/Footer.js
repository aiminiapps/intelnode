"use client";

import Image from "next/image";
import Link from "next/link";
import { RiTwitterXLine, RiArrowRightUpLine, RiBookOpenLine } from "react-icons/ri";
import { SiBnbchain } from "react-icons/si";

const footerLinks = {
  Product: [
    { name: "AI Research", href: "/app/analyzer" },
    { name: "Intel Terminal", href: "/app/gems" },
    { name: "Signal Alerts", href: "/app/alerts" },
    { name: "Sentiment Matrix", href: "/app/sentiment" },
  ],
  Community: [
    { name: "Twitter / X", href: "https://x.com/intelnode_ai" },
    { name: "BscScan", href: "#" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAFBFC] border-t border-[#E5E7EB] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-16 pb-8 relative z-10">

        {/* ── Main Grid ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-14">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <Image src="/logo.png" alt="IntelNode" width={45} height={45} />
            </Link>
            <p className="text-[#6B7280] text-[13px] leading-relaxed mb-6">
              AI-powered on-chain intelligence platform. Research tokens, track smart money, and execute with institution-grade confidence.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {[
                { icon: RiTwitterXLine, href: "https://x.com/intelnode_ai", label: "Twitter" },
                { icon: SiBnbchain, href: "#", label: "BscScan" },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:border-[#D1D5DB] transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12 md:gap-16 lg:gap-20">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col">
                <h4 className="text-[#111827] font-semibold text-[12px] uppercase tracking-[0.14em] mb-5">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[#6B7280] text-[13px] font-normal hover:text-[#111827] transition-colors inline-flex items-center gap-1"
                      >
                        {link.name}
                        {link.href.startsWith("http") && <RiArrowRightUpLine className="text-[10px] opacity-40" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-dashed border-[#E5E7EB] flex items-center justify-center gap-4">
          <p className="text-[#9CA3AF] text-[12px] font-medium">
            © {currentYear} IntelNode. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
