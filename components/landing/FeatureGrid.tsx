'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Sliders, ShieldCheck, Sparkles, Terminal, BookOpen } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Progressive UI Disclosure',
      desc: 'No cognitive overload. Tier 1 gives you clean visual buttons; the terminal CLI and advanced rebase studios unlock progressively as you advance.',
      color: 'text-sky-400',
      glow: 'group-hover:border-sky-500/50 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.18)]',
      iconBg: 'bg-sky-500/10 border-sky-400/20 group-hover:bg-sky-500/20 group-hover:border-sky-400/40',
    },
    {
      icon: Sliders,
      title: 'Step-by-Step Animation Scrubber',
      desc: 'Multi-step commands (merge, rebase, cherry-pick) break down into pauseable, rewindable animated phases with plain-English step explanations.',
      color: 'text-purple-400',
      glow: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.18)]',
      iconBg: 'bg-purple-500/10 border-purple-400/20 group-hover:bg-purple-500/20 group-hover:border-purple-400/40',
    },
    {
      icon: Terminal,
      title: 'Real Interactive Simulator CLI',
      desc: 'Not a passive video player! Type real commands with safety badges (🟢 Safe, 🟡 Caution, 🔴 Destructive) and test any branching strategy.',
      color: 'text-emerald-400',
      glow: 'group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.18)]',
      iconBg: 'bg-emerald-500/10 border-emerald-400/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/40',
    },
    {
      icon: Sparkles,
      title: 'BYOK AI Git Coach',
      desc: 'Never get stuck. Free default Gemini proxy + bring your own OpenAI/Anthropic keys for deep troubleshooting with zero server key storage.',
      color: 'text-amber-400',
      glow: 'group-hover:border-amber-500/50 group-hover:shadow-[0_0_30px_rgba(251,191,36,0.18)]',
      iconBg: 'bg-amber-500/10 border-amber-400/20 group-hover:bg-amber-500/20 group-hover:border-amber-400/40',
    },
    {
      icon: BookOpen,
      title: 'Searchable A–Z Glossary',
      desc: 'Built-in interactive Git dictionary with plain-language definitions and inline hover tooltips on jargon throughout the app.',
      color: 'text-sky-400',
      glow: 'group-hover:border-sky-500/50 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.18)]',
      iconBg: 'bg-sky-500/10 border-sky-400/20 group-hover:bg-sky-500/20 group-hover:border-sky-400/40',
    },
    {
      icon: ShieldCheck,
      title: '100% Zero-Login Local Storage',
      desc: 'Your progress, badges, and sandbox repositories save instantly to your browser with JSON export/import and LZ-compressed URL hash sharing.',
      color: 'text-emerald-400',
      glow: 'group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.18)]',
      iconBg: 'bg-emerald-500/10 border-emerald-400/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/40',
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-sans tracking-tight">
          Engineered for Deep Mental Models
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-sans">
          Built from the ground up to replace confusing cheat-sheets with intuitive physics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`group relative p-6 rounded-2xl glass-panel-elevated shadow-lg border border-white/5 space-y-4 flex flex-col justify-between cursor-pointer overflow-hidden ${f.glow}`}
            >
              {/* Subtle dynamic background glow orb on hover */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-opacity duration-200 pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-150 transform group-hover:scale-110 group-hover:-rotate-3 ${f.iconBg}`}
                >
                  <Icon size={20} className={`${f.color} transition-transform duration-150`} />
                </div>
                <h3 className="font-bold text-sm text-slate-100 font-sans tracking-tight group-hover:text-white transition-colors duration-150">
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed font-sans text-xs group-hover:text-slate-300 transition-colors duration-150">
                  {f.desc}
                </p>
              </div>

              {/* Bottom active line highlight */}
              <div className="w-full h-0.5 rounded-full bg-white/5 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-white/20 group-hover:to-transparent transition-colors duration-150 mt-2" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
