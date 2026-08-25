'use client';

import React, { useState } from 'react';
import { PlusCircle, GitBranch, GitMerge, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';

export const ActionDeck: React.FC = () => {
  const { executeCommand, repo } = useAppStore();

  const [commitMsg, setCommitMsg] = useState('Update feature');
  const [branchName, setBranchName] = useState('feature');
  const [selectedMergeBranch, setSelectedMergeBranch] = useState('');
  const [isAmend, setIsAmend] = useState(false);
  const [showAdvancedFlags, setShowAdvancedFlags] = useState(false);

  const branches = Object.keys(repo.refs.heads);
  const currentBranch = repo.head.type === 'branch' ? repo.head.target : '';
  const mergeableBranches = branches.filter((b) => b !== currentBranch);

  const handleCommit = () => {
    const cmd = isAmend
      ? `git commit --amend -m "${commitMsg}"`
      : `git commit -m "${commitMsg}"`;
    executeCommand(cmd);
    setCommitMsg('Update feature');
    setIsAmend(false);
  };

  const handleCreateBranch = () => {
    if (!branchName.trim()) return;
    executeCommand(`git switch -c ${branchName.trim()}`);
    setBranchName('');
  };

  const handleMerge = () => {
    const target = selectedMergeBranch || mergeableBranches[0];
    if (!target) return;
    executeCommand(`git merge ${target}`);
  };

  return (
    <div
      className="p-4 rounded-3xl space-y-3 select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(30px) saturate(190%)',
        WebkitBackdropFilter: 'blur(30px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 1.5px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans drop-shadow-sm">
          <span className="text-amber-400">⚡</span> Action Deck
        </span>
        <button
          onClick={() => setShowAdvancedFlags(!showAdvancedFlags)}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
        >
          <SlidersHorizontal size={12} />
          <span>{showAdvancedFlags ? 'Hide Flags' : 'Flag Options'}</span>
        </button>
      </div>

      {/* Flag modifiers section */}
      {showAdvancedFlags && (
        <div
          className="p-2.5 rounded-2xl flex items-center gap-4 text-xs"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          }}
        >
          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={isAmend}
              onChange={(e) => setIsAmend(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-sky-400 focus:ring-0"
            />
            <span className="font-mono text-[11px]">--amend (rewrite last commit message/tree)</span>
          </label>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Commit Card */}
        <div
          className="p-3 rounded-2xl space-y-2.5 transition group"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.25), 0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <PlusCircle size={14} />
              <span>Commit</span>
            </span>
            <span className="text-[10px] text-cyan-300/70 font-mono">
              {isAmend ? 'amend' : 'new snapshot'}
            </span>
          </div>
          <input
            type="text"
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Commit message..."
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-100 text-xs focus:border-cyan-400 focus:bg-black/60 outline-none transition"
          />
          <button
            onClick={handleCommit}
            className="w-full py-2 px-3 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
              color: '#02181d',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 4px 12px rgba(6, 182, 212, 0.3)',
            }}
          >
            <span>Create Commit</span>
          </button>
        </div>

        {/* 2. Branch & Switch Card */}
        <div
          className="p-3 rounded-2xl space-y-2.5 transition group"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.25), 0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <GitBranch size={14} />
              <span>New Branch</span>
            </span>
            <span className="text-[10px] text-amber-300/70 font-mono">switch -c</span>
          </div>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Branch name..."
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-100 text-xs focus:border-amber-400 focus:bg-black/60 outline-none font-mono transition"
          />
          <button
            onClick={handleCreateBranch}
            className="w-full py-2 px-3 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
              color: '#1c1002',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <span>Create & Switch</span>
          </button>
        </div>

        {/* 3. Merge Card */}
        <div
          className="p-3 rounded-2xl space-y-2.5 transition group"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.25), 0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <GitMerge size={14} />
              <span>Merge Branch</span>
            </span>
            <span className="text-[10px] text-emerald-300/70 font-mono truncate max-w-[100px]">
              into {currentBranch || 'HEAD'}
            </span>
          </div>
          <select
            value={selectedMergeBranch}
            onChange={(e) => setSelectedMergeBranch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-slate-100 text-xs focus:border-emerald-400 focus:bg-black/60 outline-none font-mono transition"
            disabled={mergeableBranches.length === 0}
          >
            {mergeableBranches.length === 0 ? (
              <option value="">No other branches</option>
            ) : (
              mergeableBranches.map((b) => (
                <option key={b} value={b}>
                  branch &apos;{b}&apos;
                </option>
              ))
            )}
          </select>
          <button
            onClick={handleMerge}
            disabled={mergeableBranches.length === 0}
            className="w-full py-2 px-3 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
              color: '#021e14',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <span>Merge into {currentBranch || 'HEAD'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
