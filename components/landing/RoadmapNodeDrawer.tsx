'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, X, Target, Lightbulb, Sparkles, Compass, GitBranch, Layers, ShieldAlert, ArrowRight } from 'lucide-react';
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

  // Stage-based color theming
  const stageColor =
    lesson.tier === 1 ? '#38bdf8' : lesson.tier === 2 ? '#c084fc' : lesson.tier === 3 ? '#fbbf24' : '#fb7185';

  const StageIcon =
    lesson.tier === 1 ? Compass : lesson.tier === 2 ? GitBranch : lesson.tier === 3 ? Layers : ShieldAlert;

  const handleLaunch = () => {
    selectLesson(lesson.id);
    onClose();
    router.push('/curriculum');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-md select-none">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="w-full max-w-md h-full flex flex-col justify-between text-slate-100 shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(2, 6, 23, 0.96) 100%)',
            backdropFilter: 'blur(40px) saturate(220%)',
            WebkitBackdropFilter: 'blur(40px) saturate(220%)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '-20px 0 80px rgba(0, 0, 0, 0.8), inset 1.5px 0 1.5px rgba(255, 255, 255, 0.35)',
          }}
        >
          {/* Ambient colored background orb */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25"
            style={{ backgroundColor: stageColor }}
          />

          {/* Top Section */}
          <div className="p-6 sm:p-7 space-y-6 overflow-y-auto relative z-10">
            {/* Header with Stage Color Squircle */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: `${stageColor}22`,
                    color: stageColor,
                    border: `1px solid ${stageColor}50`,
                    boxShadow: `0 4px 14px ${stageColor}25, inset 0 1px 1px rgba(255,255,255,0.4)`,
                  }}
                >
                  <StageIcon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${stageColor}18`,
                        color: stageColor,
                        border: `1px solid ${stageColor}35`,
                      }}
                    >
                      {lesson.tierTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                      {lesson.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="font-extrabold text-xl sm:text-2xl text-white font-sans tracking-tight">
                {lesson.title.replace(/^\d+\.\s*/, '')}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                {lesson.description}
              </p>
            </div>

            {/* Goal Card (Liquid Frosted Glass) */}
            <div
              className="p-4.5 rounded-[22px] space-y-2 text-xs relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: `1px solid ${stageColor}35`,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              }}
            >
              <span
                className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 font-mono"
                style={{ color: stageColor }}
              >
                <Target size={14} />
                <span>Practice Goal</span>
              </span>
              <p className="text-white font-medium font-sans leading-relaxed">{lesson.expectedGoalText}</p>
            </div>

            {/* How It Works Card */}
            <div
              className="p-4.5 rounded-[22px] space-y-2 text-xs relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              }}
            >
              <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 text-amber-300 font-mono">
                <Lightbulb size={14} />
                <span>How It Works Under the Hood</span>
              </span>
              <p className="text-slate-300 text-xs leading-relaxed font-sans">
                {lesson.pedagogicalTip}
              </p>
            </div>

            {/* Real World Context */}
            {lesson.realWorldContext && (
              <div
                className="p-4.5 rounded-[22px] space-y-2 text-xs relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                }}
              >
                <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-2 text-indigo-300 font-mono">
                  <Sparkles size={14} />
                  <span>Industry Practice</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed font-sans">
                  {lesson.realWorldContext}
                </p>
              </div>
            )}

            {/* Status Switcher */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Progress Status:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markLessonComplete(lesson.id)}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-emerald-500/10'
                      : 'bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>{isCompleted ? 'Cleared & Mastered' : 'Mark as Mastered'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Tactile Launch Bar */}
          <div
            className="p-5 sm:p-6 border-t border-white/15 space-y-2 relative z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
            }}
          >
            <button
              onClick={handleLaunch}
              className="w-full py-4 rounded-2xl font-black text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)',
                color: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 2px 2px rgba(255, 255, 255, 1)',
              }}
            >
              <Play size={15} fill="#090d16" />
              <span>Launch Interactive Practice</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
