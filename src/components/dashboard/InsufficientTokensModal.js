"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { RiCoinLine, RiCloseLine, RiArrowRightLine } from "react-icons/ri";

function CrosshatchStrip({ className = "", color = "rgba(0,0,0,0.06)", size = "7px" }) {
  return <div className={className} style={{ backgroundImage: `repeating-linear-gradient(315deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`, backgroundSize: `${size} ${size}` }} />;
}

export default function InsufficientTokensModal({ isOpen, onClose, required, balance }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm p-6 rounded-xl border border-[#E5E7EB] bg-white relative overflow-hidden shadow-xl shadow-black/5"
        >
          <CrosshatchStrip className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none z-10" color="rgba(0,0,0,0.04)" size="6px" />

          <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111827] transition-colors z-10">
            <RiCloseLine size={20} />
          </button>

          <div className="text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F9FB] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
              <CrosshatchStrip className="absolute inset-0 opacity-30 pointer-events-none" color="rgba(0,0,0,0.03)" size="7px" />
              <RiCoinLine className="text-[#111827] text-2xl relative z-10" />
            </div>
            <h3 className="text-[#111827] font-bold text-lg mb-2">Insufficient $INOD</h3>
            <p className="text-[#6B7280] text-sm mb-4">
              You need <span className="text-[#111827] font-semibold">{required} INOD</span> for this action but only have <span className="text-[#111827] font-semibold">{balance} INOD</span>.
            </p>
            <p className="text-[#6B7280] text-sm mb-6">
              Complete quests to earn more tokens and unlock premium features.
            </p>
            <Link
              href="/app/quests"
              onClick={onClose}
              className="btn-intel inline-flex items-center gap-2 px-6 py-3 text-sm w-full justify-center"
            >
              Earn More $INOD <RiArrowRightLine />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
