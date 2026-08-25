'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, FileText } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';

export const DiffInspector: React.FC = () => {
  const { isDiffModalOpen, diffFileTarget, setDiffModalOpen, repo, executeCommand } = useAppStore();

  if (!isDiffModalOpen || !diffFileTarget) return null;

  const file = repo.workingTree[diffFileTarget];
  const oldText = file?.content || '';
  const newText = file?.stagedContent || file?.worktreeContent || oldText;

  // Simple line diff calculation
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const handleStageFile = () => {
    executeCommand(`git add ${diffFileTarget}`);
    setDiffModalOpen(false);
  };

  const handleUnstageFile = () => {
    executeCommand(`git restore --staged ${diffFileTarget}`);
    setDiffModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl rounded-2xl glass-panel-elevated shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-sky-400" />
              <span className="font-mono font-bold text-sm text-slate-100">{diffFileTarget}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Diff Inspector
              </span>
            </div>
            <button
              onClick={() => setDiffModalOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Diff Content Body */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-slate-950/90">
            <div className="text-slate-500 pb-2 border-b border-white/5 text-[11px]">
              --- a/{diffFileTarget}<br />
              +++ b/{diffFileTarget}
            </div>

            {newLines.map((line, idx) => {
              const isAdded = !oldLines.includes(line);
              return (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded ${
                    isAdded
                      ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="w-8 text-[10px] text-slate-600 select-none">{idx + 1}</span>
                  <span className="w-4 select-none">{isAdded ? '+' : ' '}</span>
                  <span className="flex-1 font-mono whitespace-pre-wrap">{line}</span>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950/80 border-t border-white/5 text-xs">
            <span className="text-slate-400">
              Status: <span className="font-mono text-sky-400">{file?.stage || 'modified'}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUnstageFile}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
              >
                Unstage File
              </button>
              <button
                onClick={handleStageFile}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Check size={14} />
                <span>Stage for Commit (`git add`)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
