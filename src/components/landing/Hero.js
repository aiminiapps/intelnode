"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { RiArrowRightUpLine } from "react-icons/ri";
import { useState, useEffect } from "react";
import Image from "next/image";

// Real memecoins with CoinGecko image URLs
const COINS = [
  {
    ticker: "$PEPE",
    score: "9.8",
    type: "Whale Accumulation",
    color: "#22C55E",
    img: "https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg",
  },
  {
    ticker: "$DOGE",
    score: "9.5",
    type: "Momentum Surge",
    color: "#F59E0B",
    img: "https://assets.coingecko.com/coins/images/5/standard/dogecoin.png",
  },
  {
    ticker: "$SHIB",
    score: "9.2",
    type: "Volume Breakout",
    color: "#EF4444",
    img: "https://assets.coingecko.com/coins/images/11939/standard/shiba.png",
  },
  {
    ticker: "$FLOKI",
    score: "9.0",
    type: "Smart Money Entry",
    color: "#3B82F6",
    img: "https://assets.coingecko.com/coins/images/16746/standard/PNG_image.png",
  },
  {
    ticker: "$WIF",
    score: "8.8",
    type: "Liquidity Spike",
    color: "#A78BFA",
    img: "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg",
  },
  {
    ticker: "$BONK",
    score: "8.6",
    type: "Sentiment Shift",
    color: "#FB923C",
    img: "https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg",
  },
];

const NOISE_WIDTHS = [
  [0.9, 0.65, 0.85, 0.5, 0.78, 0.6, 0.88],
  [0.55, 0.9, 0.4, 0.72, 0.6, 0.85, 0.5],
  [0.78, 0.5, 0.92, 0.65, 0.7, 0.45, 0.88],
  [0.5, 0.82, 0.6, 0.95, 0.7, 0.55, 0.78],
  [0.88, 0.6, 0.72, 0.48, 0.9, 0.65, 0.77],
  [0.65, 0.88, 0.5, 0.82, 0.58, 0.94, 0.7],
];

function NoiseCard({ index, total }) {
  const lines = NOISE_WIDTHS[index % NOISE_WIDTHS.length];
  
  // Stagger the animation delays evenly
  const delay = (index / total) * 8.5;
  
  // Create a funnel effect by staggering the starting Y positions
  // High, Low, High-mid, Low-mid, etc.
  const startY = ["-100%", "0%", "-85%", "-15%", "-110%", "10%"][index];
  const midY = ["-75%", "-25%", "-65%", "-35%", "-80%", "-20%"][index];
  
  return (
    <motion.div
      className="absolute -left-[10%] top-1/2 w-[clamp(140px,17vw,210px)] [transform-style:preserve-3d]"
      initial={{ x: "-50%", y: startY, opacity: 0, rotateY: "40deg", scale: 0.5 }}
      animate={{
        // X moves steadily right, then accelerates into the node
        x: ["-50%", "30%", "140%", "240%"], 
        // Y funnels inward from scattered heights to the exact dead center (-50%)
        y: [startY, midY, "-50%", "-50%"],
        // Fades in, stays solid, then vanishes into the beam
        opacity: [0, 0, 0.8, 0.9, 0],
        // Grows as it approaches, then shrinks rapidly to get "sucked in"
        scale: [0.5, 0.75, 0.95, 0.2],
        // Flattens out as it enters the beam
        rotateY: ["40deg", "30deg", "10deg", "0deg"],
      }}
      transition={{
        duration: 8.5,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
        times: [0, 0.15, 0.7, 1] // Controls the pacing of the keyframes
      }}
    >
      <div className="rounded-2xl bg-black border border-white/[0.055] bg-[linear-gradient(145deg,rgba(18,18,30,0.92)_0%,rgba(12,12,20,0.96)_100%)] shadow-[0_24px_64px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)] p-4 h-[clamp(160px,20vw,230px)] flex flex-col gap-2.5 overflow-hidden relative">
        {/* shimmer overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(108deg,transparent_38%,rgba(255,255,255,0.04)_50%,transparent_62%)] pointer-events-none" />
        <div className="w-9 h-1 rounded-full bg-white/10 mb-1" />
        
        <div className="flex flex-col gap-2">
          {lines.map((w, i) => (
            <div
              key={i}
              className="h-[3px] rounded-full"
              style={{
                width: `${w * 100}%`,
                background:
                  i % 4 === 0
                    ? "rgba(124,58,237,0.22)"
                    : i % 4 === 2
                    ? "rgba(124,58,237,0.12)"
                    : "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
        
        <div className="mt-auto pt-3 border-t border-white/[0.045] flex justify-between items-center">
          <div className="w-4 h-4 rounded-[5px] bg-white/5" />
          <div className="w-9 h-[3px] rounded-full bg-white/5" />
        </div>
      </div>
    </motion.div>
  );
}

function ScoreArc({ score, color }) {
  const r = 13;
  const circ = 2 * Math.PI * r;
  const filled = (parseFloat(score) / 10) * circ;
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" className="shrink-0">
      <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.2" />
      <circle
        cx="17" cy="17" r={r} fill="none" stroke={color} strokeWidth="2.2"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 17 17)"
        style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
      />
      <text
        x="17" y="21" textAnchor="middle" fill="white"
        className="text-[7.5px] font-bold font-mono"
      >
        {score}
      </text>
    </svg>
  );
}

function CoinCard({ coin }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[14px] border border-white/[0.065] relative overflow-hidden bg-white/[0.02] backdrop-blur-sm">
      {/* coin image */}
      <div
        className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-white/5"
        style={{
          border: `1.5px solid ${coin.color}35`,
          boxShadow: `0 0 10px ${coin.color}25`,
        }}
      >
        <img
          src={coin.img}
          alt={coin.ticker}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>

      {/* info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5 mb-[3px]">
          <span className="text-white text-[11px] font-bold tracking-[0.04em]">
            {coin.ticker}
          </span>
          <span
            className="text-[8.5px] font-semibold tracking-[0.08em] uppercase px-1.5 py-[1px] rounded flex items-center justify-center"
            style={{
              color: coin.color,
              backgroundColor: `${coin.color}12`,
              borderColor: `${coin.color}22`,
              borderWidth: "1px",
              borderStyle: "solid"
            }}
          >
            {coin.type}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-[5px] h-[5px] rounded-full shrink-0"
            style={{ background: coin.color, boxShadow: `0 0 4px ${coin.color}` }}
          />
          <span className="text-[9px] font-medium" style={{ color: `${coin.color}80` }}>
            Signal Active
          </span>
        </div>
      </div>

      <ScoreArc score={coin.score} color={coin.color} />
    </div>
  );
}

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tripled = [...COINS, ...COINS, ...COINS];

  return (
    // Replaced `justify-start` with `justify-center` to perfectly align everything on the Y-Axis!
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-transparent py-16">
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,black_0%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,black_0%,transparent_100%)]" />
        {/* bottom fade */}
        <div className="absolute hidden bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-[#06060f] to-transparent" />
      </div>

      {/* ── Main Content ── */}
      {/* Removed the hardcoded top padding to allow flexbox justify-center to do its job */}
      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-[clamp(16px,4vw,48px)] flex flex-col items-center text-center">
        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(2.2rem,6.2vw,4.8rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white max-w-[860px] mb-[clamp(14px,2vw,20px)] flex flex-col items-center"
        >
          <span>Unlock True Alpha From</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#C4B5FD] via-[#A78BFA] to-[#6D28D9]">
            Any Token
          </span>
        </motion.h1>

        {/* subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="text-[clamp(0.875rem,1.6vw,1rem)] text-[#9494af]/80 max-w-[480px] leading-[1.8] mb-[clamp(28px,4vw,40px)] mx-auto"
        >
          Deep liquidity and sentiment analysis distilled from raw on-chain
          noise into precise probability matrices.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mb-[clamp(40px,6vw,72px)]"
        >
          <Link
            href="/app"
            className="btn-3d group inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all"
          >
            Launch App{" "}
            <RiArrowRightUpLine className="text-[17px] group-hover:text-gray-300 transition-colors" />
          </Link>
        </motion.div>

        {/* ── PIPELINE ANIMATION ── */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col md:flex-row items-center justify-center relative h-[450px] md:h-[clamp(260px,36vw,400px)] gap-6 md:gap-0 mt-4 md:mt-0"
        >
          {/* LEFT: Noise Stream (Hidden on mobile to keep layout clean) */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-[44%] perspective-[1100px] overflow-hidden">
            {/* <div className="absolute left-0 top-0 bottom-0 w-[35%] bg-gradient-to-r from-[#06060f] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[28%] bg-gradient-to-l from-[#06060f] to-transparent z-10 pointer-events-none" /> */}
            {mounted &&
              Array.from({ length: 6 }).map((_, i) => (
                <NoiseCard key={i} index={i} total={6} />
              ))}
          </div>

          {/* CENTER: Beam + Oracle Node */}
          <div className="md:absolute md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 flex flex-col items-center z-30 h-[100px] md:h-full">
            {/* Desktop top beam */}
            <div className="hidden md:block flex-1 w-[1px] bg-gradient-to-b from-transparent via-purple-600/20 to-purple-600/85 shadow-[0_0_12px_rgba(124,58,237,0.35)]" />
            
            {/* Mobile top connecting beam */}
            <div className="md:hidden w-[1px] h-6 bg-gradient-to-b from-transparent to-purple-600/85 shadow-[0_0_12px_rgba(124,58,237,0.35)]" />

            {/* Oracle node */}
            <div className="relative shrink-0 z-20">
              <div className="w-[54px] h-[54px] rounded-full overflow-hidden border-[1.5px] border-purple-600/65 shadow-[0_0_28px_rgba(124,58,237,0.55),0_0_10px_rgba(124,58,237,0.8),inset_0_0_18px_rgba(0,0,0,0.7)] bg-[#080812] flex items-center justify-center relative z-20">
                <Image
                  src="/agent.png"
                  alt="Oracle"
                  width={54}
                  height={54}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Desktop bottom beam */}
            <div className="hidden md:block flex-1 w-[1px] bg-gradient-to-b from-purple-600/85 via-purple-600/20 to-transparent shadow-[0_0_12px_rgba(124,58,237,0.35)]" />
            
            {/* Mobile bottom connecting beam */}
            <div className="md:hidden w-[1px] h-12 bg-gradient-to-b from-purple-600/85 to-transparent shadow-[0_0_12px_rgba(124,58,237,0.35)]" />
          </div>

          {/* RIGHT: Coin Feed (Stacked below Oracle on Mobile) */}
          <div className="w-full max-w-[340px] md:max-w-none md:absolute md:right-0 md:top-0 md:bottom-0 md:w-[44%] h-[300px] md:h-full overflow-hidden md:pl-[clamp(16px,2.5vw,36px)] flex items-center justify-center md:justify-start mx-auto relative">
            {/* <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#06060f] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#06060f] to-transparent z-10 pointer-events-none" /> */}

            {mounted && (
              <div className="w-full max-w-[320px] h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_84%,transparent_100%)]">
                <motion.div
                  animate={{ y: ["0%", "-33.33%"] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="flex flex-col gap-2"
                >
                  {tripled.map((coin, i) => (
                    <CoinCard key={`${coin.ticker}-${i}`} coin={coin} />
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}