'use client';

import React from 'react';
import { Folder, Layers, Database, ArrowRight, Eye } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';

export const StateDashboard: React.FC = () => {
  const { repo, setDiffModalOpen } = useAppStore();

  const workingFiles = Object.entries(repo.workingTree).filter(
    ([_, f]) => f.stage === 'modified' || f.stage === 'untracked' || f.stage === 'conflicted'
  );
  const stagedFiles = Object.keys(repo.stagingArea);
  const commits = Object.values(repo.objects).filter((o) => o.type === 'commit');

  return (
    <div className="p-3.5 rounded-2xl glass-panel-elevated shadow-2xl border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <span>📊</span> The 3 File Zones (Three-Tree Architecture)
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          🛠️ Drafts → 📦 Staged → 📸 Commits
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* 1. Working Tree (Red/Untracked) */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-500/20 space-y-2">
          <div className="flex items-center justify-between font-semibold text-rose-400 pb-1 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Folder size={14} />
              <div className="flex flex-col">
                <span>Working Directory</span>
                <span className="text-[9px] font-normal text-slate-400">Draft edits on your desk</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
              {workingFiles.length}
            </span>
          </div>

          <div className="space-y-1.5 min-h-[60px] max-h-28 overflow-y-auto">
            {workingFiles.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic py-2 text-center">
                Clean working tree
              </div>
            ) : (
              workingFiles.map(([path, file]) => (
                <div
                  key={path}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 transition border border-rose-500/20"
                >
                  <span className="font-mono text-[11px] text-rose-300 truncate max-w-[120px]">
                    {path}
                  </span>
                  <button
                    onClick={() => setDiffModalOpen(true, path)}
                    className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-sans"
                  >
                    <Eye size={11} />
                    <span>Diff</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Staging Area / Index (Green) */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between font-semibold text-emerald-400 pb-1 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Layers size={14} />
              <div className="flex flex-col">
                <span>Staging Area (Index)</span>
                <span className="text-[9px] font-normal text-slate-400">Prepared in shipping box</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              {stagedFiles.length}
            </span>
          </div>

          <div className="space-y-1.5 min-h-[60px] max-h-28 overflow-y-auto">
            {stagedFiles.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic py-2 text-center">
                No files staged
              </div>
            ) : (
              stagedFiles.map((path) => (
                <div
                  key={path}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/15 transition border border-emerald-500/20"
                >
                  <span className="font-mono text-[11px] text-emerald-300 truncate max-w-[120px]">
                    {path}
                  </span>
                  <button
                    onClick={() => setDiffModalOpen(true, path)}
                    className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-sans"
                  >
                    <Eye size={11} />
                    <span>Inspect</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Repository Commits (Blue) */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-sky-500/20 space-y-2">
          <div className="flex items-center justify-between font-semibold text-sky-400 pb-1 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Database size={14} />
              <div className="flex flex-col">
                <span>Repository History</span>
                <span className="text-[9px] font-normal text-slate-400">Permanent photo album</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
              {commits.length}
            </span>
          </div>

          <div className="space-y-1.5 min-h-[60px] max-h-28 overflow-y-auto">
            {commits.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-sky-500/5 border border-sky-500/20 font-mono text-[11px]"
              >
                <span className="text-sky-300 font-bold">{c.id.slice(0, 7)}</span>
                <span className="text-slate-400 text-[10px] truncate max-w-[110px]">
                  {c.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
