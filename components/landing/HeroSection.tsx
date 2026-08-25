'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Sparkles, LayoutGrid, ShieldCheck, ArrowRight } from 'lucide-react';
import { InteractivePreview } from './InteractivePreview';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full max-w-6xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Background glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Hero Header */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-300 border border-sky-400/30 shadow-sm"
        >
          <Sparkles size={13} className="text-sky-400 animate-pulse" />
          <span>Zero-Latency Client Simulator · BYOK AI Gateway</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight font-sans"
        >
          Master Git Through{' '}
          <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-amber-300 bg-clip-text text-transparent">
            Physics-Driven Fluid Visuals
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans"
        >
          Stop memorizing dry terminal flags in fear. Watch commits flow like streams, branches split with spring elasticity, and merge conflicts resolve with clarity in real-time.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Link
            href="/roadmap"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-400 hover:to-purple-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 cursor-pointer"
          >
            <Play size={16} />
            <span>Start Guided Roadmap</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/playground"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <LayoutGrid size={16} className="text-purple-400" />
            <span>Open Freeform Sandbox</span>
          </Link>
        </motion.div>
      </div>

      {/* Interactive Hero Preview Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-2xl mx-auto"
      >
        <InteractivePreview />
      </motion.div>
    </section>
  );
};
