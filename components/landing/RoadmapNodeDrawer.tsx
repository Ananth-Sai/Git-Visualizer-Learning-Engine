'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, X, Target, Lightbulb } from 'lucide-react';
import { LessonObjective } from '../../core/types';
import { useAppStore } from '../../core/engine/StateManager';
import { useRouter } from 'next/navigation';

interface RoadmapNodeDrawerProps {
  lesson: LessonObjective | null;
  onClose: () => void;
}

export const RoadmapNodeDrawer: React.FC<RoadmapNodeDrawerProps> = ({ lesson, onClose }) => {
  const { completedLessonIds, markLessonComplete, selectLesson } = useAppStore();
  const router = useRouter();

  if (!lesson) return null;

  const isCompleted = completedLessonIds.includes(lesson.id);

  const handleLaunch = () => {
    selectLesson(lesson.id);
    onClose();
    router.push('/curriculum');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-white/10 shadow-2xl flex flex-col justify-between"
        >
          {/* Top Section */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--branch-main) 15%, transparent)',
                    color: 'var(--branch-main)',
                    border: '1px solid var(--branch-main)',
                  }}
                >
                  {lesson.tierTitle}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                  {lesson.difficulty}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h2 className="font-bold text-lg text-slate-100 font-sans tracking-tight">
                {lesson.title}
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed font-sans">
                {lesson.description}
              </p>
            </div>

            {/* Goal Card */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
              <span
                className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--branch-main)' }}
              >
                <Target size={13} />
                <span>Practice Goal</span>
              </span>
              <p className="text-slate-200 font-medium font-sans">{lesson.expectedGoalText}</p>
            </div>

            {/* How It Works */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
              <span
                className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--accent-warm)' }}
              >
                <Lightbulb size={13} />
                <span>How It Works</span>
              </span>
              <p className="text-slate-300 text-xs leading-relaxed font-sans">
                {lesson.pedagogicalTip}
              </p>
            </div>

            {/* Status Switcher */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Progress Status:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markLessonComplete(lesson.id)}
                  className={`flex-1 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{isCompleted ? 'Marked as Done' : 'Mark as Done'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Launch Bar */}
          <div className="p-5 bg-black/40 border-t border-white/10 space-y-2">
            <button
              onClick={handleLaunch}
              className="w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--branch-main)',
                color: 'var(--bg-base)',
              }}
            >
              <Play size={15} />
              <span>Practice in Simulator</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
