'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Play,
  Sparkles,
  ArrowRight,
  Compass,
  GitBranch,
  Layers,
  ShieldAlert,
  Cloud,
  Terminal,
  RotateCcw,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LESSONS } from '../../core/curriculum/lessons';
import { LessonObjective } from '../../core/types';
import { useAppStore } from '../../core/engine/StateManager';
import { RoadmapNodeDrawer } from '../landing/RoadmapNodeDrawer';

export const FlowchartRoadmap: React.FC = () => {
  const { completedLessonIds, selectLesson } = useAppStore();
  const [selectedDrawerLesson, setSelectedDrawerLesson] = useState<LessonObjective | null>(null);
  const router = useRouter();

  // Find the next recommended lesson (first uncompleted, or level-1)
  const nextRecommendedLesson =
    LESSONS.find((l) => !completedLessonIds.includes(l.id)) || LESSONS[0];
  const nextIndex = LESSONS.findIndex((l) => l.id === nextRecommendedLesson.id);

  const handleLaunchLesson = (lessonId: string) => {
    selectLesson(lessonId);
    router.push('/curriculum');
  };

  const progressCount = completedLessonIds.length;
  const progressPercent = Math.round((progressCount / LESSONS.length) * 100);

  // Group lessons into 4 comprehensive flowchart stages
  const milestones = [
    {
      id: 'm1',
      title: 'Stage 1: Repository Fundamentals',
      description: 'Master git init, the 3 file zones, snapshots, log inspection, and the HEAD pointer.',
      icon: Compass,
      tag: 'Levels 1–6: Fundamentals',
      lessons: LESSONS.slice(0, 6), // Levels 1 to 6
    },
    {
      id: 'm2',
      title: 'Stage 2: Branching & Merging Strategies',
      description: 'Create parallel feature branches, fast-forward, 3-way merges, linear rebasing, and cherry-picking.',
      icon: GitBranch,
      tag: 'Levels 7–12: Branching',
      lessons: LESSONS.slice(6, 12), // Levels 7 to 12
    },
    {
      id: 'm3',
      title: 'Stage 3: Precision Control & Undoing Mistakes',
      description: 'Amend commits, safely unstage files, master the 3 resets (--soft/mixed/hard), revert, and stash.',
      icon: Layers,
      tag: 'Levels 13–17: Undoing & Stashing',
      lessons: LESSONS.slice(12, 17), // Levels 13 to 17
    },
    {
      id: 'm4',
      title: 'Stage 4: Remotes & Disaster Recovery',
      description: 'Remote tracking, 3-way merge conflict resolution, interactive rebase, reflog rescue, and release tags.',
      icon: ShieldAlert,
      tag: 'Levels 18–22: Senior Recovery',
      lessons: LESSONS.slice(17, 22), // Levels 18 to 22
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* 🌟 (Recommended) Start / Next Step Hero Banner */}
      <div className="p-6 rounded-3xl glass-panel-elevated shadow-2xl border border-white/10 relative overflow-hidden bg-[var(--bg-surface)]/90">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
              <Sparkles size={13} />
              <span>(Recommended) Your Next Step</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-sans tracking-tight">
              Level {nextIndex + 1}: {nextRecommendedLesson.title.replace(/^\d+\.\s*/, '')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {nextRecommendedLesson.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => handleLaunchLesson(nextRecommendedLesson.id)}
              className="px-6 py-3 rounded-2xl font-black text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--branch-main)',
                color: 'var(--bg-base)',
              }}
            >
              <Play size={15} />
              <span>
                {progressCount === 0 ? 'Start Journey (Level 1)' : 'Continue Level ' + (nextIndex + 1)}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">
              {progressCount} of {LESSONS.length}
            </span>
            <span>interactive levels mastered</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'var(--branch-main)',
                }}
              />
            </div>
            <span className="font-mono font-bold text-slate-200 text-[11px]">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 🗺️ Visual Flowchart Tree (roadmap.sh style) */}
      <div className="relative space-y-12">
        {/* Continuous Spine Line */}
        <div
          className="absolute left-6 sm:left-8 top-12 bottom-12 w-0.5 pointer-events-none opacity-40"
          style={{ backgroundColor: 'var(--branch-main)' }}
        />

        {milestones.map((milestone, mIdx) => {
          const Icon = milestone.icon;
          return (
            <div key={milestone.id} className="relative pl-14 sm:pl-20 space-y-4">
              {/* Milestone Icon Node on Spine */}
              <div
                className="absolute left-2.5 sm:left-4.5 -top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shadow-lg border border-white/20 z-10"
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--branch-main)',
                }}
              >
                <Icon size={16} />
              </div>

              {/* Milestone Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/10 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono font-bold uppercase tracking-wider"
                      style={{ color: 'var(--branch-main)' }}
                    >
                      {milestone.tag}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 font-sans tracking-tight">
                    {milestone.title}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-sans">
                  {milestone.lessons.filter((l) => completedLessonIds.includes(l.id)).length} of{' '}
                  {milestone.lessons.length} complete
                </span>
              </div>

              {/* Connected Flowchart Node Cards (Every single node is clickable!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {milestone.lessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  const isRecommended = lesson.id === nextRecommendedLesson.id;

                  return (
                    <motion.div
                      key={lesson.id}
                      whileHover={{ scale: 1.02, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDrawerLesson(lesson)}
                      className={`group p-4 rounded-2xl border text-left flex flex-col justify-between min-h-[140px] transition-all duration-150 cursor-pointer relative overflow-hidden ${
                        isRecommended
                          ? 'border-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.15)] bg-black/50'
                          : isDone
                          ? 'border-emerald-500/30 bg-black/40 hover:border-emerald-400'
                          : 'border-white/10 bg-black/40 hover:border-white/20'
                      }`}
                    >
                      {/* Top status line */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          {lesson.title.split('.')[0]}. Level
                        </span>

                        {isDone ? (
                          <span
                            className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
                              color: 'var(--accent-success)',
                              border: '1px solid var(--accent-success)',
                            }}
                          >
                            <CheckCircle2 size={11} />
                            <span>Mastered</span>
                          </span>
                        ) : isRecommended ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                            <Sparkles size={10} />
                            <span>Recommended</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                            {lesson.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Title & Description in Plain English */}
                      <div className="space-y-1 my-2">
                        <h4 className="font-bold text-sm text-slate-100 font-sans tracking-tight group-hover:text-white transition">
                          {lesson.title.replace(/^\d+\.\s*/, '')}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                          {lesson.description}
                        </p>
                      </div>

                      {/* Bottom action row */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-sans">
                        <span
                          className="font-bold flex items-center gap-1"
                          style={{ color: 'var(--branch-main)' }}
                        >
                          <span>Explore Concept</span>
                          <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchLesson(lesson.id);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-slate-100 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Play size={10} />
                          <span>Practice</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Slide-out Plain English Drawer */}
      <RoadmapNodeDrawer
        lesson={selectedDrawerLesson}
        onClose={() => setSelectedDrawerLesson(null)}
      />
    </div>
  );
};
