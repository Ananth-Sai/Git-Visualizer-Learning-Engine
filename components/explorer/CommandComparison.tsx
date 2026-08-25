'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitMerge, GitBranch, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ComparisonPair {
  id: string;
  title: string;
  leftCmd: string;
  leftTitle: string;
  leftDesc: string;
  leftPros: string[];
  rightCmd: string;
  rightTitle: string;
  rightDesc: string;
  rightPros: string[];
  recommendation: string;
}

const COMPARISONS: ComparisonPair[] = [
  {
    id: 'merge-vs-rebase',
    title: 'git merge vs git rebase',
    leftCmd: 'git merge feature',
    leftTitle: 'Three-Way Merge',
    leftDesc: 'Combines branches by creating a new merge commit with two parents. Preserves complete historical context.',
    leftPros: ['Preserves true chronological order', 'Non-destructive to existing SHAs', 'Clear record of when branches merged'],
    rightCmd: 'git rebase main',
    rightTitle: 'Linear Rebase',
    rightDesc: 'Replays branch commits on top of main, creating duplicate commits with new timestamps to produce a clean single line.',
    rightPros: ['Creates clean, linear git log', 'Easier to bisect and cherry-pick', 'Eliminates clutter merge commits'],
    recommendation: 'Use rebase for local feature branches before sharing; use merge when integrating into shared production branches.',
  },
  {
    id: 'reset-vs-revert',
    title: 'git reset vs git revert',
    leftCmd: 'git reset --hard HEAD~1',
    leftTitle: 'Reset (Rewind History)',
    leftDesc: 'Moves the HEAD and branch pointer backward in time, discarding or unstaging commits.',
    leftPros: ['Erases mistaken commits locally', 'Can keep changes with --soft', 'Great for private unpushed branches'],
    rightCmd: 'git revert <commit-sha>',
    rightTitle: 'Revert (Inversion Commit)',
    rightDesc: 'Appends a brand new commit that applies the exact inverse diff of a previous bad commit.',
    rightPros: ['Safe for public shared branches', 'Does not rewrite commit history', 'Fully transparent to teammates'],
    recommendation: 'Use reset for private unpushed mistakes; use revert once commits are pushed to GitHub.',
  },
  {
    id: 'switch-vs-checkout',
    title: 'git switch vs git checkout',
    leftCmd: 'git switch <branch>',
    leftTitle: 'git switch (Modern)',
    leftDesc: 'Dedicated modern command introduced in Git 2.23 specifically for switching and creating branches.',
    leftPros: ['Zero ambiguity with file names', 'Simpler -c flag to create', 'Clearer mental model for beginners'],
    rightCmd: 'git checkout <branch>',
    rightTitle: 'git checkout (Legacy)',
    rightDesc: 'Multi-purpose legacy command that handled branch switching, commit observation, AND file discarding.',
    rightPros: ['Universally supported across older Git', 'Familiar to veteran developers', 'Handles commit SHAs directly'],
    recommendation: 'Prefer `git switch` for branch navigation and `git restore` for files to avoid accidental file overwrites.',
  },
];

export const CommandComparison: React.FC = () => {
  const [selectedId, setSelectedId] = useState('merge-vs-rebase');
  const activeComp = COMPARISONS.find((c) => c.id === selectedId) || COMPARISONS[0];

  return (
    <div
      className="p-7 rounded-[32px] shadow-2xl space-y-6 text-slate-100 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), inset 0 1px 1.5px rgba(56, 189, 248, 0.3)',
      }}
    >
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ArrowLeftRight className="text-sky-300" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-400/30">
                TELEMETRY MATRIX
              </span>
            </div>
            <h2 className="font-extrabold text-lg text-white font-sans tracking-tight mt-0.5">
              Side-by-Side Command Comparer
            </h2>
          </div>
        </div>

        {/* HUD Tab Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 border border-white/15">
          {COMPARISONS.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedId(comp.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-150 cursor-pointer ${
                selectedId === comp.id
                  ? 'bg-sky-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {comp.title.split(' vs ')[0]} vs {comp.title.split(' vs ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison HUD Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Left Side (Cyan Terminal HUD) */}
        <div
          className="p-6 rounded-[24px] space-y-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(6, 182, 212, 0.3)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <span className="font-bold text-cyan-300 font-sans text-sm tracking-tight">{activeComp.leftTitle}</span>
            <code className="px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 font-mono font-bold text-[11px]">
              {activeComp.leftCmd}
            </code>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">{activeComp.leftDesc}</p>
          <div className="space-y-2 pt-2 border-t border-cyan-500/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
              Key Mechanics:
            </span>
            <ul className="space-y-1.5 font-sans">
              {activeComp.leftPros.map((pro, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side (Purple / Amber Terminal HUD) */}
        <div
          className="p-6 rounded-[24px] space-y-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(168, 85, 247, 0.3)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <span className="font-bold text-purple-300 font-sans text-sm tracking-tight">{activeComp.rightTitle}</span>
            <code className="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-400/40 font-mono font-bold text-[11px]">
              {activeComp.rightCmd}
            </code>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">{activeComp.rightDesc}</p>
          <div className="space-y-2 pt-2 border-t border-purple-500/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
              Key Mechanics:
            </span>
            <ul className="space-y-1.5 font-sans">
              {activeComp.rightPros.map((pro, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Pro Recommendation HUD Banner */}
      <div
        className="p-4 rounded-2xl flex items-center gap-3.5"
        style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.35)',
        }}
      >
        <AlertCircle size={18} className="text-amber-400 shrink-0" />
        <div className="text-xs font-sans text-slate-200 leading-relaxed">
          <span className="font-bold text-amber-300 mr-1.5 font-mono text-[11px] uppercase">Industry Protocol:</span>
          {activeComp.recommendation}
        </div>
      </div>
    </div>
  );
};
