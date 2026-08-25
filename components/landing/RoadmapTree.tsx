'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Play, Sparkles, ChevronRight, Lock, Award } from 'lucide-react';
import { LESSONS } from '../../core/curriculum/lessons';
import { LessonObjective } from '../../core/types';
import { useAppStore } from '../../core/engine/StateManager';
import { RoadmapNodeDrawer } from './RoadmapNodeDrawer';

export const RoadmapTree: React.FC = () => {
  const { completedLessonIds, selectLesson } = useAppStore();
  const [selectedDrawerLesson, setSelectedDrawerLesson] = useState<LessonObjective | null>(null);

  const tier1Lessons = LESSONS.filter((l) => l.tier === 1);
  const tier2Lessons = LESSONS.filter((l) => l.tier === 2);
  const tier3Lessons = LESSONS.filter((l) => l.tier === 3);

  const progressPercent = Math.round((completedLessonIds.length / LESSONS.length) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-8">
      {/* Progress Header Bar with Liquid Glass */}
      <div
        className="p-6 rounded-[32px] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-100 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(36px) saturate(200%)',
          WebkitBackdropFilter: 'blur(36px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.55), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.45)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              boxShadow: '0 8px 20px rgba(56, 189, 248, 0.35), inset 0 1px 1.5px rgba(255,255,255,0.6)',
            }}
          >
            <Award size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white font-sans tracking-tight">
              Interactive Curriculum Roadmap
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              {completedLessonIds.length} of {LESSONS.length} levels mastered ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full sm:w-72 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Total Mastery</span>
            <span className="text-sky-300 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/15">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* 3 Tier Lanes */}
      <div className="space-y-7">
        {/* Tier 1 Lane */}
        <TierSection
          title="Tier 1: Visual First (Zero-Syntax Barrier)"
          badge="Levels 1–4"
          badgeColor="bg-sky-500/20 text-sky-300 border-sky-400/40"
          description="Understand snapshots, HEAD observation, branch pointers, and fast-forward merges with pure visual mechanics."
          lessons={tier1Lessons}
          completedIds={completedLessonIds}
          onSelect={(lesson) => setSelectedDrawerLesson(lesson)}
        />

        {/* Tier 2 Lane */}
        <TierSection
          title="Tier 2: CLI Transition, Staging & Remotes"
          badge="Levels 5–8"
          badgeColor="bg-purple-500/20 text-purple-300 border-purple-400/40"
          description="Master modern CLI flags (`git switch`), line diffing, 3-way merges vs rebases, and remote tracking (`origin/main`)."
          lessons={tier2Lessons}
          completedIds={completedLessonIds}
          onSelect={(lesson) => setSelectedDrawerLesson(lesson)}
        />

        {/* Tier 3 Lane */}
        <TierSection
          title="Tier 3: Production Scenarios & Recovery"
          badge="Levels 9–12"
          badgeColor="bg-amber-500/20 text-amber-300 border-amber-400/40"
          description="Visual 3-Way conflict resolution, Interactive Rebase studio, Stash pocket, and Reflog disaster recovery."
          lessons={tier3Lessons}
          completedIds={completedLessonIds}
          onSelect={(lesson) => setSelectedDrawerLesson(lesson)}
        />
      </div>

      {/* Node Slide-out Drawer */}
      <RoadmapNodeDrawer
        lesson={selectedDrawerLesson}
        onClose={() => setSelectedDrawerLesson(null)}
      />
    </div>
  );
};

interface TierSectionProps {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  lessons: LessonObjective[];
  completedIds: string[];
  onSelect: (lesson: LessonObjective) => void;
}

const TierSection: React.FC<TierSectionProps> = ({
  title,
  badge,
  badgeColor,
  description,
  lessons,
  completedIds,
  onSelect,
}) => {
  return (
    <div
      className="p-7 rounded-[32px] shadow-2xl space-y-5 text-slate-100 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(30px) saturate(190%)',
        WebkitBackdropFilter: 'blur(30px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.35)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="font-extrabold text-base text-white font-sans tracking-tight">{title}</h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeColor}`}>
              {badge}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans">{description}</p>
        </div>
      </div>

      {/* Node Cards Grid with Liquid Glass Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
        {lessons.map((lesson, idx) => {
          const isDone = completedIds.includes(lesson.id);
          return (
            <motion.button
              key={lesson.id}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(lesson)}
              className="p-5 rounded-[22px] border text-left flex flex-col justify-between h-40 transition-all duration-200 cursor-pointer relative overflow-hidden group"
              style={{
                background: isDone
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                borderColor: isDone ? 'rgba(16, 185, 129, 0.45)' : 'rgba(255, 255, 255, 0.15)',
                boxShadow: isDone
                  ? '0 12px 30px rgba(16, 185, 129, 0.15), inset 0 1px 1.5px rgba(255, 255, 255, 0.35)'
                  : '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.25)',
              }}
            >
              {/* Checkpoint glow tag */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  0{lesson.tier}.{idx + 1}
                </span>
                {isDone ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
                    <CheckCircle size={10} />
                    Done
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    {lesson.difficulty}
                  </span>
                )}
              </div>

              {/* Title & Category */}
              <div className="my-1">
                <h5 className="font-extrabold text-xs text-white line-clamp-1 mb-1 font-sans tracking-tight group-hover:text-sky-300 transition-colors">
                  {lesson.title.replace(/^\d+\.\s*/, '')}
                </h5>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
                  {lesson.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-sky-300 font-bold pt-1 group-hover:text-sky-200">
                <span>View Details</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
