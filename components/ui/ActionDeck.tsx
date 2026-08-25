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
      className="p-4 rounded-2xl space-y-3 select-none"
      style={{
        background: 'rgba(13, 17, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Action Deck
          </span>
        </div>
        <button
          onClick={() => setShowAdvancedFlags(!showAdvancedFlags)}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer font-sans"
        >
          <SlidersHorizontal size={12} />
          <span>{showAdvancedFlags ? 'Hide Flags' : 'Flag Options'}</span>
        </button>
      </div>

      {/* Flag modifiers section */}
      {showAdvancedFlags && (
        <div
          className="p-2.5 rounded-xl flex items-center gap-4 text-xs"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-sans text-xs">
            <input
              type="checkbox"
              checked={isAmend}
              onChange={(e) => setIsAmend(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-sky-400 focus:ring-0 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-slate-300">--amend (rewrite last commit message/tree)</span>
          </label>
        </div>
      )}

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Commit Card */}
        <div
          className="p-3.5 rounded-xl space-y-2.5 transition"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-200">
            <span className="flex items-center gap-1.5 text-sky-400 font-semibold font-sans">
              <PlusCircle size={14} />
              <span>Commit</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isAmend ? 'amend' : 'new snapshot'}
            </span>
          </div>
          <input
            type="text"
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Commit message..."
            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-100 text-xs focus:border-sky-400 focus:outline-none transition font-sans"
          />
          <button
            onClick={handleCommit}
            className="w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:brightness-110 active:scale-[0.98]"
            style={{
              background: '#38bdf8',
              color: '#082f49',
            }}
          >
            <span>Create Commit</span>
          </button>
        </div>

        {/* 2. New Branch Card */}
        <div
          className="p-3.5 rounded-xl space-y-2.5 transition"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-200">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold font-sans">
              <GitBranch size={14} />
              <span>New Branch</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">switch -c</span>
          </div>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="branch-name"
            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-100 text-xs focus:border-amber-400 focus:outline-none transition font-sans"
          />
          <button
            onClick={handleCreateBranch}
            className="w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:brightness-110 active:scale-[0.98]"
            style={{
              background: '#fbbf24',
              color: '#451a03',
            }}
          >
            <span>Create & Switch</span>
          </button>
        </div>

        {/* 3. Merge Branch Card */}
        <div
          className="p-3.5 rounded-xl space-y-2.5 transition"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-200">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold font-sans">
              <GitMerge size={14} />
              <span>Merge Branch</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              into {currentBranch || 'HEAD'}
            </span>
          </div>
          <select
            value={selectedMergeBranch}
            onChange={(e) => setSelectedMergeBranch(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-100 text-xs focus:border-emerald-400 focus:outline-none transition font-sans cursor-pointer"
          >
            {mergeableBranches.length === 0 ? (
              <option value="">No other branches</option>
            ) : (
              mergeableBranches.map((b) => (
                <option key={b} value={b} className="bg-slate-900 text-slate-100">
                  {b}
                </option>
              ))
            )}
          </select>
          <button
            onClick={handleMerge}
            disabled={mergeableBranches.length === 0}
            className="w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: '#10b981',
              color: '#022c22',
            }}
          >
            <span>Merge Into {currentBranch || 'main'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
