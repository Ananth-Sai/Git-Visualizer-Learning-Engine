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
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl p-4 rounded-2xl glass-panel-elevated shadow-2xl border border-sky-500/20 z-40"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
            {operationType} Scrubber
          </span>
          <span className="text-xs font-medium text-slate-300">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close scrubber"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Plain-English Current Step */}
      <div className="py-1.5 px-3 rounded-lg bg-slate-950/60 border border-white/5 font-sans text-xs text-sky-200 mb-3">
        {steps[currentStep - 1]}
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-1.5 bg-slate-800 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-400 to-purple-400 rounded-full"
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep <= 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-200"
            title="Step Back"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-semibold hover:bg-sky-400 transition"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
          </button>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
            disabled={currentStep >= totalSteps}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-200"
            title="Step Forward"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={() => {
              setCurrentStep(1);
              setIsPlaying(true);
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-slate-200"
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          {currentStep === totalSteps ? '✅ Complete' : 'Scrub or step to inspect'}
        </div>
      </div>
    </motion.div>
  );
};
