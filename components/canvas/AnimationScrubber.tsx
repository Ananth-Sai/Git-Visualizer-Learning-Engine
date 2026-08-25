'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, X } from 'lucide-react';

interface AnimationScrubberProps {
  operationType: 'merge' | 'rebase' | 'cherry-pick';
  sourceBranch?: string;
  targetBranch?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const AnimationScrubber: React.FC<AnimationScrubberProps> = ({
  operationType,
  sourceBranch = 'feature',
  targetBranch = 'main',
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const stepsMap: Record<string, string[]> = {
    merge: [
      `1. Find common ancestor of ${targetBranch} and ${sourceBranch}`,
      `2. Compare branch tips for divergent commits`,
      `3. Compute 3-way delta without conflict`,
      `4. Record converging merge commit with 2 parents`,
    ],
    rebase: [
      `1. Identify range of commits unique to ${sourceBranch}`,
      `2. Detach HEAD and reset branch pointer to ${targetBranch} tip`,
      `3. Sequentially replay and create duplicate commit snapshots`,
      `4. Update branch pointer to the new rebased tip`,
    ],
    'cherry-pick': [
      `1. Inspect target commit delta from parent`,
      `2. Generate patch diff for working tree`,
      `3. Apply patch on top of current HEAD`,
      `4. Commit new duplicate snapshot on active branch`,
    ],
  };

  const steps = stepsMap[operationType] || stepsMap.merge;
  const totalSteps = steps.length;

  useEffect(() => {
    let timer: any;
    if (isPlaying && currentStep < totalSteps) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1800);
    } else if (isPlaying && currentStep >= totalSteps) {
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl p-5 rounded-[28px] shadow-2xl z-40 text-slate-100"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
        backdropFilter: 'blur(36px) saturate(200%)',
        WebkitBackdropFilter: 'blur(36px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.28)',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -1.5px 1.5px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.1) 100%)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)',
            }}
          >
            {operationType} Scrubber
          </span>
          <span className="text-xs font-semibold text-white">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close scrubber"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Plain-English Current Step */}
      <div
        className="py-2.5 px-4 rounded-2xl font-sans text-xs text-white mb-3.5 leading-relaxed font-medium"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'inset 0 1px 1.5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {steps[currentStep - 1]}
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-2 bg-black/50 rounded-full mb-3.5 overflow-hidden border border-white/15">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)',
          }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Tactile Skeuomorphic Playback Controls */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep <= 1}
            className="p-2.5 rounded-xl transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 text-white"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
            title="Step Back"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-150 cursor-pointer shadow-lg hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)',
              color: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1.5px 1.5px rgba(255, 255, 255, 1)',
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="#090d16" />}
            <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
          </button>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
            disabled={currentStep >= totalSteps}
            className="p-2.5 rounded-xl transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 text-white"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
            title="Step Forward"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={() => {
              setCurrentStep(1);
              setIsPlaying(true);
            }}
            className="p-2.5 rounded-xl transition cursor-pointer hover:brightness-110 active:scale-95 text-white"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="text-[11px] text-slate-300 font-mono">
          {currentStep === totalSteps ? '✅ Complete' : 'Scrub or step to inspect'}
        </div>
      </div>
    </motion.div>
  );
};
