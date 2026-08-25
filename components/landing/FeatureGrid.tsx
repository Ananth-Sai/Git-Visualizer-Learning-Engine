'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Sliders, ShieldCheck, Sparkles, Terminal, BookOpen } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
          Everything You Need to Master Git
        </h2>
        <p className="text-sm text-slate-300 font-sans">
          Learn by seeing and doing — not by memorizing abstract commands.
        </p>
      </div>

      {/* Asymmetrical Rich-Color Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
        {/* Bento Item 1: Large Featured Card (8 cols) - Physics Graph (Cyan) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-8 p-7 rounded-[32px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(30px) saturate(190%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-sky-500/25 transition-all duration-300" />
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255,255,255,0.4)',
                }}
              >
                <Layers size={22} className="text-sky-300" />
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] font-bold border border-sky-400/40">
                TOPOLOGY PHYSICS
              </span>
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-bold text-white font-sans tracking-tight">
                Progressive Disclosure & Topological Fluidity
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs">
                Branches pull with spring elasticity, commits link via cubic Bézier curves, and merge parents converge visually. Zero cognitive overload.
              </p>
            </div>
          </div>
          <div className="pt-6 mt-4 border-t border-sky-500/20 flex items-center justify-between text-slate-400 font-mono text-[11px] relative z-10">
            <span className="text-sky-300 font-medium">⚡ Zero syntax barrier</span>
            <span className="text-sky-400 font-bold group-hover:translate-x-1 transition-transform">Explore Visuals ➔</span>
          </div>
        </motion.div>

        {/* Bento Item 2: Vertical Card (4 cols) - Animation Scrubber (Purple) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-4 p-7 rounded-[32px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(30px) saturate(190%)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition-all duration-300" />
          <div className="space-y-4 relative z-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.25), inset 0 1px 1px rgba(255,255,255,0.4)',
              }}
            >
              <Sliders size={22} className="text-purple-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-sans tracking-tight">
                Step-by-Step Animation Scrubber
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs">
                Pause, rewind, and scrub through multi-stage merges and rebases frame-by-frame with plain-English narration.
              </p>
            </div>
          </div>
          <div className="pt-6 mt-4 border-t border-purple-500/20 flex items-center justify-between text-purple-300 font-mono text-[11px] relative z-10">
            <span>Rewind anytime</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </motion.div>

        {/* Bento Item 3: Regular Card (4 cols) - Terminal CLI (Green) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-4 p-7 rounded-[32px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(30px) saturate(190%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="space-y-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25), inset 0 1px 1px rgba(255,255,255,0.4)',
              }}
            >
              <Terminal size={22} className="text-emerald-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-sans tracking-tight">
                Authentic Interactive CLI
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs">
                Real command simulation with safety badges: 🟢 Safe, 🟡 Caution, and 🔴 Destructive safeguards.
              </p>
            </div>
          </div>
          <div className="pt-6 mt-4 border-t border-emerald-500/20 flex items-center justify-between text-emerald-300 font-mono text-[11px]">
            <span>Full Lexer & Parser</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </motion.div>

        {/* Bento Item 4: Regular Card (4 cols) - AI Coach (Yellow/Amber) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-4 p-7 rounded-[32px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(30px) saturate(190%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="space-y-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255,255,255,0.4)',
              }}
            >
              <Sparkles size={22} className="text-amber-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-sans tracking-tight">
                BYOK AI Git Coach
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs">
                Free default Gemini proxy + Bring Your Own Key for zero-latency explanations when commands error.
              </p>
            </div>
          </div>
          <div className="pt-6 mt-4 border-t border-amber-500/20 flex items-center justify-between text-amber-300 font-mono text-[11px]">
            <span>Private & Client-Side</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </motion.div>

        {/* Bento Item 5: Regular Card (4 cols) - Zero-Login Persistence (Blue/Indigo) */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-4 p-7 rounded-[32px] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(30px) saturate(190%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="space-y-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25), inset 0 1px 1px rgba(255,255,255,0.4)',
              }}
            >
              <ShieldCheck size={22} className="text-indigo-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-sans tracking-tight">
                100% Zero-Login Storage
              </h3>
              <p className="text-slate-300 leading-relaxed text-xs">
                Progress, badges, and sandbox history save automatically to your local browser with LZ-compressed share links.
              </p>
            </div>
          </div>
          <div className="pt-6 mt-4 border-t border-indigo-500/20 flex items-center justify-between text-indigo-300 font-mono text-[11px]">
            <span>No Account Needed</span>
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
