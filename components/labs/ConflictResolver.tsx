'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';

export const ConflictResolver: React.FC = () => {
  const { isConflictModalOpen, setConflictModalOpen, repo, resolveConflict } = useAppStore();

  const conflictEntries = Object.entries(repo.conflicts);
  const [activeFile, setActiveFile] = useState<string>(conflictEntries[0]?.[0] || '');
  const [customDraft, setCustomDraft] = useState<string>('');

  if (!isConflictModalOpen || conflictEntries.length === 0) return null;

  const currentConflict = repo.conflicts[activeFile] || conflictEntries[0][1];
  const activeFileName = activeFile || conflictEntries[0][0];

  const handleAcceptOurs = () => {
    resolveConflict(activeFileName, currentConflict.ours);
  };

  const handleAcceptTheirs = () => {
    resolveConflict(activeFileName, currentConflict.theirs);
  };

  const handleAcceptBoth = () => {
    const combined = `${currentConflict.ours}\n${currentConflict.theirs}`;
    resolveConflict(activeFileName, combined);
  };

  const handleSaveCustom = () => {
    if (!customDraft) return;
    resolveConflict(activeFileName, customDraft);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-4xl rounded-2xl glass-panel-elevated shadow-2xl overflow-hidden border border-amber-500/30 flex flex-col max-h-[90vh]"
        >
          {/* Top Banner */}
          <div className="flex items-center justify-between px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-amber-400" size={22} />
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>3-Way Conflict Resolution Studio</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {conflictEntries.length} conflicting file{conflictEntries.length === 1 ? '' : 's'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select which changes to keep or merge both versions together.
                </p>
              </div>
            </div>

            <button
              onClick={() => setConflictModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Conflict 3-Way Grid */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-950/90 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-mono font-bold text-slate-200 text-sm">
                File: <span className="text-amber-400">{activeFileName}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ours (Current Branch) */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
                  <span className="font-semibold text-sky-400 font-mono flex items-center gap-1.5">
                    <span>{'<<<'} HEAD (Current Branch)</span>
                  </span>
                  <button
                    onClick={handleAcceptOurs}
                    className="px-3 py-1 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 font-semibold transition cursor-pointer"
                  >
                    Accept Current
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950/80 font-mono text-slate-200 whitespace-pre-wrap overflow-x-auto">
                  {currentConflict.ours}
                </pre>
              </div>

              {/* Theirs (Incoming Branch) */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="font-semibold text-purple-400 font-mono flex items-center gap-1.5">
                    <span>{'>>>'} Incoming Branch</span>
                  </span>
                  <button
                    onClick={handleAcceptTheirs}
                    className="px-3 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 font-semibold transition cursor-pointer"
                  >
                    Accept Incoming
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950/80 font-mono text-slate-200 whitespace-pre-wrap overflow-x-auto">
                  {currentConflict.theirs}
                </pre>
              </div>
            </div>

            {/* Base Ancestor Preview */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 font-mono text-slate-400 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Common Ancestor Base:
              </span>
              <pre className="text-slate-400 text-[11px]">{currentConflict.base}</pre>
            </div>
          </div>

          {/* Footer Decision Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-white/5">
            <button
              onClick={handleAcceptBoth}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer"
            >
              Accept Both Changes (Combine)
            </button>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Resolving marks file staged (`git add`)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
