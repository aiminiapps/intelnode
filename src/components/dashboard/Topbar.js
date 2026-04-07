"use client";

import { useState, useRef, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { RiSearchLine, RiNotification3Line, RiCoinLine, RiFileCopyLine, RiCheckLine, RiLogoutBoxRLine, RiWallet3Line, RiArrowDownSLine } from "react-icons/ri";
import { useTokens } from "@/context/TokenContext";

export default function Topbar() {
  const { balance, loaded } = useTokens();
  const { disconnect } = useDisconnect();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function copyAddress(addr) {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#2A2A3A]">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex opacity-0 items-center gap-3 flex-1 max-w-md ml-12 lg:ml-0">
          <div className="relative w-full">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B76] text-sm" />
            <input
              type="text"
              placeholder="Search tokens, wallets..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141420] border border-[#2A2A3A] text-white text-sm placeholder:text-[#6B6B76] focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141420] border border-[#2A2A3A]">
            <RiCoinLine className="text-[#7C3AED] text-sm" />
            <span className="text-[#7C3AED] font-semibold text-sm">
              {loaded ? balance.toLocaleString() : "..."}
            </span>
            <span className="text-[#6B6B76] text-xs">CORA</span>
          </div>

          <button className="relative w-9 h-9 rounded-xl bg-[#141420] border border-[#2A2A3A] flex items-center justify-center text-[#A1A1AA] hover:text-white transition-colors">
            <RiNotification3Line className="text-sm" />
          </button>

          <ConnectButton.Custom>
            {({ account, chain, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none", userSelect: "none" } })}>
                  {connected ? (
                    <div className="relative" ref={dropdownRef}>
                      {/* Wallet button */}
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141420] border border-[#2A2A3A] hover:border-[#7C3AED]/30 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9F67FF]" />
                        <span className="text-white text-sm font-medium hidden sm:block">{account.displayName}</span>
                        <RiArrowDownSLine className={`text-[#6B6B76] text-sm transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Dropdown */}
                      {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#2A2A3A] bg-[#141420] shadow-2xl overflow-hidden z-50">
                          {/* Header */}
                          <div className="p-4 border-b border-[#2A2A3A]">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold">Connected Wallet</p>
                                <p className="text-[#A1A1AA] text-xs">{account.displayName}</p>
                              </div>
                            </div>

                            {/* Full address with copy */}
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A]">
                              <span className="text-[#A1A1AA] text-xs font-mono truncate flex-1">{account.address}</span>
                              <button
                                onClick={() => copyAddress(account.address)}
                                className="text-[#A1A1AA] hover:text-white transition-colors shrink-0 p-1 rounded-md hover:bg-[#2A2A3A]"
                              >
                                {copied ? <RiCheckLine className="text-[#22C55E] text-sm" /> : <RiFileCopyLine className="text-sm" />}
                              </button>
                            </div>
                          </div>

                          {/* Network */}
                          <div className="p-3 border-b border-[#2A2A3A]">
                            <button
                              onClick={() => { openChainModal(); setDropdownOpen(false); }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1C1C2E] transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {chain.hasIcon && chain.iconUrl && (
                                  <img src={chain.iconUrl} alt={chain.name} className="w-5 h-5 rounded-full" />
                                )}
                                <span className="text-white text-sm font-medium">{chain.name}</span>
                              </div>
                              {chain.unsupported ? (
                                <span className="text-[#EF4444] text-xs font-medium px-2 py-0.5 rounded-lg bg-[#EF4444]/10">Wrong Network</span>
                              ) : (
                                <span className="text-[#22C55E] text-xs font-medium px-2 py-0.5 rounded-lg bg-[#22C55E]/10">Connected</span>
                              )}
                            </button>
                          </div>

                          {/* Balance */}
                          {account.displayBalance && (
                            <div className="px-3 py-2 border-b border-[#2A2A3A]">
                              <div className="flex items-center justify-between p-2.5">
                                <span className="text-[#A1A1AA] text-sm">Balance</span>
                                <span className="text-white text-sm font-semibold">{account.displayBalance}</span>
                              </div>
                            </div>
                          )}

                          {/* Explorer link */}
                          <div className="p-3 border-b border-[#2A2A3A]">
                            <a
                              href={`https://bscscan.com/address/${account.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setDropdownOpen(false)}
                              className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#1C1C2E] transition-colors text-[#A1A1AA] hover:text-white"
                            >
                              <RiWallet3Line className="text-sm" />
                              <span className="text-sm">View on BscScan</span>
                            </a>
                          </div>

                          {/* Disconnect */}
                          <div className="p-3">
                            <button
                              onClick={() => { disconnect(); setDropdownOpen(false); }}
                              className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#EF4444]/10 transition-colors text-[#EF4444]"
                            >
                              <RiLogoutBoxRLine className="text-sm" />
                              <span className="text-sm font-medium">Disconnect Wallet</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={openConnectModal} className="btn-3d btn-3d-sm">
                      Connect
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
