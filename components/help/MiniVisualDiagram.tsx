'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, GitCommit, Layers, HardDrive, ArrowRight, ArrowDown, Sparkles, Server } from 'lucide-react';

interface MiniVisualDiagramProps {
  commandId: string;
}

export const MiniVisualDiagram: React.FC<MiniVisualDiagramProps> = ({ commandId }) => {
  // Determine diagram type based on command
  if (commandId === 'git-add') {
    return (
      <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/20 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>Topological Zone Movement</span>
          </span>
          <span className="text-emerald-400 font-semibold">Working Tree ➔ Staging Index</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
          {/* Working Tree */}
          <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-400/30 flex flex-col items-center justify-between h-20">
            <span className="text-[10px] text-slate-400">Working Tree</span>
            <div className="text-rose-400 text-[11px] font-bold line-through">unstaged edit</div>
            <span className="text-[9px] text-slate-400">disk files</span>
          </div>

          {/* Animated Arrow */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="p-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40"
            >
              <ArrowRight size={14} />
            </motion.div>
            <span className="text-[9px] text-sky-400 mt-1 font-bold">git add</span>
          </div>

          {/* Staging Index */}
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-400/40 flex flex-col items-center justify-between h-20 shadow-lg shadow-emerald-500/10">
            <span className="text-[10px] text-emerald-400 font-bold">Staging Index</span>
            <div className="text-emerald-300 text-[11px] font-bold">ready: blob sha</div>
            <span className="text-[9px] text-emerald-400/80">.git/index</span>
          </div>
        </div>
      </div>
    );
  }

  if (commandId === 'git-commit') {
    return (
      <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <GitCommit size={13} />
            <span>Cryptographic Commit Node Spawn</span>
          </span>
          <span className="text-sky-300">HEAD &amp; main advance forward</span>
        </div>

        {/* Node Lineage */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {/* Commit 1 */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-[10px] font-mono text-slate-400">
              81a9
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1">c1 (parent)</span>
          </div>

          <div className="w-6 h-0.5 bg-slate-700" />

          {/* Commit 2 */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-[10px] font-mono text-slate-400">
              3b91
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1">c2</span>
          </div>

          <div className="w-6 h-0.5 bg-emerald-500/60" />

          {/* New Commit 3 */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-300 shadow-lg shadow-emerald-500/30"
            >
              7f8a
            </motion.div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1">HEAD -&gt; main</span>
          </div>
        </div>
      </div>
    );
  }

  if (commandId === 'git-branch' || commandId === 'git-switch') {
    return (
      <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch size={13} />
            <span>Pointer &amp; Branch Lineage</span>
          </span>
          <span className="text-slate-300 font-mono text-[10px]">HEAD points to branch ref</span>
        </div>

        <div className="space-y-2 pt-1 font-mono text-xs">
          {/* Main line */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-sky-400 w-14 text-right font-bold">main:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 text-[9px] flex items-center justify-center text-sky-300">c1</div>
              <div className="w-4 h-0.5 bg-sky-400/40" />
              <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/40 text-[9px] flex items-center justify-center text-sky-300">c2</div>
            </div>
          </div>

          {/* Feature branch line */}
          <div className="flex items-center gap-3 pl-8">
            <div className="w-3 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-purple-300 font-bold">feature/auth:</span>
              <div className="w-6 h-6 rounded-full bg-purple-500/30 border border-purple-400 text-[9px] flex items-center justify-center text-purple-200 shadow-md">c3</div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                HEAD
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (commandId === 'git-rebase') {
    return (
      <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>Linear Rebase Replay</span>
          </span>
          <span className="text-slate-400 text-[10px]">Zero merge bubbles</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] font-mono">
          <div className="px-2 py-1 rounded bg-sky-950 border border-sky-400/30 text-sky-300">main (c1, c2)</div>
          <ArrowRight size={12} className="text-amber-400" />
          <div className="px-2 py-1 rounded bg-purple-950 border border-purple-400/40 text-purple-300 font-bold">c3&apos; (replayed)</div>
          <ArrowRight size={12} className="text-amber-400" />
          <div className="px-2 py-1 rounded bg-purple-950 border border-purple-400/40 text-purple-300 font-bold">c4&apos; (HEAD)</div>
        </div>
      </div>
    );
  }

  if (commandId === 'git-reset' || commandId === 'git-restore') {
    return (
      <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/20 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <ArrowRight size={13} className="rotate-180 text-rose-400" />
            <span>Pointer Rewind &amp; State Unstage</span>
          </span>
          <span className="text-slate-400 text-[10px]">HEAD moves back</span>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2 font-mono text-xs">
          <div className="p-2 rounded-lg bg-slate-900 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400">Target Commit</div>
            <div className="text-sky-300 font-bold">HEAD~1 (c1)</div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-rose-400 font-bold">&larr; Rewind</span>
            <div className="w-8 h-0.5 bg-rose-500/50 my-1" />
          </div>
          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-400/30 text-center opacity-70">
            <div className="text-[10px] text-slate-400">Old Tip (c2)</div>
            <div className="text-rose-400 line-through">undone</div>
          </div>
        </div>
      </div>
    );
  }

  // Default Topology Card
  return (
    <div className="p-4 rounded-xl bg-slate-950/70 border border-sky-500/20 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <HardDrive size={13} />
          <span>Local &amp; Remote Architecture</span>
        </span>
        <span className="text-emerald-400 text-[10px]">Active Repository</span>
      </div>
      <div className="flex items-center justify-around pt-1 text-[11px] font-mono text-slate-300">
        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">Working Tree</span>
        <ArrowRight size={12} className="text-slate-500" />
        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10">Index</span>
        <ArrowRight size={12} className="text-slate-500" />
        <span className="px-2.5 py-1 rounded bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold">HEAD</span>
      </div>
    </div>
  );
};
