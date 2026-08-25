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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xl backdrop-saturate-200 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="w-full max-w-4xl rounded-[32px] overflow-hidden border flex flex-col max-h-[90vh] text-slate-100 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(40px) saturate(220%)',
            WebkitBackdropFilter: 'blur(40px) saturate(220%)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.7), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.5), 0 0 40px rgba(251, 191, 36, 0.15)',
          }}
        >
          {/* Top IDE Studio Header Banner */}
          <div className="flex items-center justify-between px-6 py-4.5 bg-amber-500/15 border-b border-amber-500/25">
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: 'inset 0 1px 1.5px rgba(255,255,255,0.6)',
                }}
              >
                <ShieldAlert className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white font-sans flex items-center gap-2.5 tracking-tight">
                  <span>3-Way Conflict Resolution Studio</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {conflictEntries.length} conflict{conflictEntries.length === 1 ? '' : 's'}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  Dual-pane IDE studio: pick changes or combine into a synthesized merge.
                </p>
              </div>
            </div>

            <button
              onClick={() => setConflictModalOpen(false)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Split-Screen 3-Way Grid */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="text-slate-400">Target File:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {activeFileName}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ours (Current Branch - Cyan Pane) */}
              <div
                className="p-4 rounded-2xl space-y-3"
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <span className="font-bold text-cyan-300 font-mono text-xs flex items-center gap-1.5">
                    <span>{'<<<'} HEAD (Current Branch)</span>
                  </span>
                  <button
                    onClick={handleAcceptOurs}
                    className="px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer hover:brightness-110 active:scale-95 shadow-md"
                    style={{
                      background: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
                      color: '#02181d',
                    }}
                  >
                    Accept Current
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black/60 font-mono text-slate-100 whitespace-pre-wrap overflow-x-auto border border-white/5">
                  {currentConflict.ours}
                </pre>
              </div>

              {/* Theirs (Incoming Branch - Purple Pane) */}
              <div
                className="p-4 rounded-2xl space-y-3"
                style={{
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                  <span className="font-bold text-purple-300 font-mono text-xs flex items-center gap-1.5">
                    <span>{'>>>'} Incoming Branch</span>
                  </span>
                  <button
                    onClick={handleAcceptTheirs}
                    className="px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer hover:brightness-110 active:scale-95 shadow-md"
                    style={{
                      background: 'linear-gradient(180deg, #c084fc 0%, #a855f7 100%)',
                      color: '#1a052e',
                    }}
                  >
                    Accept Incoming
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black/60 font-mono text-slate-100 whitespace-pre-wrap overflow-x-auto border border-white/5">
                  {currentConflict.theirs}
                </pre>
              </div>
            </div>

            {/* Base Ancestor Preview */}
            <div
              className="p-3.5 rounded-2xl font-mono text-slate-300 space-y-1"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Common Ancestor Base:
              </span>
              <pre className="text-slate-300 text-xs">{currentConflict.base}</pre>
            </div>
          </div>

          {/* Footer Decision Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-t border-white/10">
            <button
              onClick={handleAcceptBoth}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs transition cursor-pointer hover:brightness-110 active:scale-95 shadow-md border border-white/15"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              }}
            >
              Accept Both Changes (Synthesize)
            </button>

            <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
              <span>Resolving automatically stages file (`git add`)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
