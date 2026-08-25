'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X, ShieldCheck, Download } from 'lucide-react';
import LZString from 'lz-string';
import { useAppStore } from '../../core/engine/StateManager';

interface ShareGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareGraphModal: React.FC<ShareGraphModalProps> = ({ isOpen, onClose }) => {
  const repo = useAppStore((s) => s.repo);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Strict Sanitization Guarantee: Only extract pure Git DAG elements, strip all API keys/settings
  const sanitizedPayload = {
    objects: repo.objects,
    refs: repo.refs,
    head: repo.head,
    workingTree: repo.workingTree,
    stagingArea: repo.stagingArea,
  };

  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(sanitizedPayload));
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/playground#graph=${compressed}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-lg rounded-2xl glass-panel-elevated shadow-2xl overflow-hidden border border-sky-500/30 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-sky-500/10 border-b border-sky-500/20">
            <div className="flex items-center gap-2.5">
              <Share2 className="text-sky-400" size={20} />
              <h3 className="font-bold text-sm text-slate-100 font-sans">
                Share Sanitized Graph URL
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Share your exact Git commit graph and branch topology instantly with anyone via a compressed URL hash. No login or backend storage required!
            </p>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-400">Shareable URL:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-300 select-all outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Privacy Guarantee */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-slate-300 flex items-start gap-2.5 text-[11px]">
              <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold text-emerald-400">Strict Sanitization Guarantee: </span>
                All private keys, curriculum notes, and personal settings are strictly stripped from the share payload.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
