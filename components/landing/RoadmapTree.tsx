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
      {/* Progress Header Bar */}
      <div className="p-5 rounded-2xl glass-panel-elevated shadow-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <Award size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 font-sans">
              Interactive Curriculum Roadmap
            </h3>
            <p className="text-xs text-slate-400">
              {completedLessonIds.length} of {LESSONS.length} levels mastered ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Progress</span>
            <span className="text-sky-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* 3 Tier Lanes */}
      <div className="space-y-6">
        {/* Tier 1 Lane */}
        <TierSection
          title="Tier 1: Visual First (Zero-Syntax Barrier)"
          badge="Levels 1–4"
          badgeColor="bg-sky-500/20 text-sky-300 border-sky-400/30"
          description="Understand snapshots, HEAD observation, branch pointers, and fast-forward merges with pure visual mechanics."
          lessons={tier1Lessons}
          completedIds={completedLessonIds}
          onSelect={(lesson) => setSelectedDrawerLesson(lesson)}
        />

        {/* Tier 2 Lane */}
        <TierSection
          title="Tier 2: CLI Transition, Staging & Remotes"
          badge="Levels 5–8"
          badgeColor="bg-purple-500/20 text-purple-300 border-purple-400/30"
          description="Master modern CLI flags (`git switch`), line diffing, 3-way merges vs rebases, and remote tracking (`origin/main`)."
          lessons={tier2Lessons}
          completedIds={completedLessonIds}
          onSelect={(lesson) => setSelectedDrawerLesson(lesson)}
        />

        {/* Tier 3 Lane */}
        <TierSection
          title="Tier 3: Production Scenarios & Recovery"
          badge="Levels 9–12"
          badgeColor="bg-amber-500/20 text-amber-300 border-amber-400/30"
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
    <div className="p-6 rounded-2xl glass-panel shadow-xl border border-white/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h4 className="font-bold text-sm text-slate-100 font-sans">{title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeColor}`}>
              {badge}
            </span>
          </div>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {/* Node Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
        {lessons.map((lesson, idx) => {
          const isDone = completedIds.includes(lesson.id);
          return (
            <motion.button
              key={lesson.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(lesson)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-36 transition cursor-pointer relative overflow-hidden ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400 shadow-emerald-500/5'
                  : 'bg-slate-950/60 border-white/5 hover:border-sky-500/40 hover:bg-slate-900/80 shadow-lg'
              }`}
            >
              {/* Checkpoint glow tag */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  0{lesson.tier}.{idx + 1}
                </span>
                {isDone ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                    <CheckCircle size={10} />
                    Done
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">
                    {lesson.difficulty}
                  </span>
                )}
              </div>

              {/* Title & Category */}
              <div>
                <h5 className="font-bold text-xs text-slate-100 line-clamp-1 mb-1 font-sans">
                  {lesson.title.replace(/^\d+\.\s*/, '')}
                </h5>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-sky-400 font-semibold pt-1">
                <span>View Details</span>
                <ChevronRight size={11} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
