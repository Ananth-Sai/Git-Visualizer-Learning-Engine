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
    <div className="p-5 rounded-2xl glass-panel-elevated shadow-2xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="text-sky-400" size={18} />
          <h2 className="font-bold text-sm text-slate-100 font-sans">
            Side-by-Side Command Comparisons
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-white/5">
          {COMPARISONS.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedId(comp.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedId === comp.id
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {comp.title.split(' vs ')[0]} vs {comp.title.split(' vs ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Left Side */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/20 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
            <span className="font-bold text-sky-300 font-sans text-sm">{activeComp.leftTitle}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              {activeComp.leftCmd}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">{activeComp.leftDesc}</p>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Strengths:
            </span>
            {activeComp.leftPros.map((pro, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>{pro}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <span className="font-bold text-purple-300 font-sans text-sm">{activeComp.rightTitle}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              {activeComp.rightCmd}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">{activeComp.rightDesc}</p>

          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Strengths:
            </span>
            {activeComp.rightPros.map((pro, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                <span>{pro}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pro Recommendation Box */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs flex items-start gap-2.5">
        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300">When to use which: </span>
          {activeComp.recommendation}
        </div>
      </div>
    </div>
  );
};
