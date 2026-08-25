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

  // Group lessons into 4 comprehensive subway transit line stages
  const milestones = [
    {
      id: 'm1',
      lineCode: 'L1',
      lineName: 'Blue Line · Fundamentals',
      lineColor: '#38bdf8',
      title: 'Stage 1: Repository Fundamentals',
      description: 'Master git init, the 3 file zones, snapshots, log inspection, and the HEAD pointer.',
      icon: Compass,
      tag: 'Levels 1–6: Fundamentals Express',
      lessons: LESSONS.slice(0, 6),
    },
    {
      id: 'm2',
      lineCode: 'L2',
      lineName: 'Purple Line · Branching & Merge',
      lineColor: '#c084fc',
      title: 'Stage 2: Branching & Merging Strategies',
      description: 'Create parallel feature branches, fast-forward, 3-way merges, linear rebasing, and cherry-picking.',
      icon: GitBranch,
      tag: 'Levels 7–12: Branching Trunk',
      lessons: LESSONS.slice(6, 12),
    },
    {
      id: 'm3',
      lineCode: 'L3',
      lineName: 'Amber Line · Undo & Stash',
      lineColor: '#fbbf24',
      title: 'Stage 3: Precision Control & Undoing Mistakes',
      description: 'Amend commits, safely unstage files, master the 3 resets (--soft/mixed/hard), revert, and stash.',
      icon: Layers,
      tag: 'Levels 13–17: Safety & Rewind Line',
      lessons: LESSONS.slice(12, 17),
    },
    {
      id: 'm4',
      lineCode: 'L4',
      lineName: 'Rose Line · Senior Recovery',
      lineColor: '#fb7185',
      title: 'Stage 4: Remotes & Disaster Recovery',
      description: 'Remote tracking, 3-way merge conflict resolution, interactive rebase, reflog rescue, and release tags.',
      icon: ShieldAlert,
      tag: 'Levels 18–22: Senior Disaster Terminal',
      lessons: LESSONS.slice(17, 22),
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-8 px-4">
      {/* 🌟 (Recommended) Start / Next Step Hero Banner with Liquid Glass */}
      <div
        className="p-7 rounded-[32px] shadow-2xl relative overflow-hidden text-slate-100"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(36px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.55), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm">
              <Sparkles size={13} />
              <span>(Recommended) Next Station</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
              Station {nextIndex + 1}: {nextRecommendedLesson.title.replace(/^\d+\.\s*/, '')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {nextRecommendedLesson.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => handleLaunchLesson(nextRecommendedLesson.id)}
              className="px-7 py-3.5 rounded-2xl font-black text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)',
                color: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 2px 2px rgba(255, 255, 255, 1)',
              }}
            >
              <Play size={15} fill="#090d16" />
              <span>
                {progressCount === 0 ? 'Depart Station (Level 1)' : 'Board Level ' + (nextIndex + 1)}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              {progressCount} of {LESSONS.length} Stations Reached
            </span>
            <span className="text-slate-400">({progressPercent}% of network mastered)</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-72">
            <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/15">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #38bdf8 0%, #c084fc 50%, #fbbf24 100%)',
                }}
              />
            </div>
            <span className="font-mono font-bold text-white text-xs">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 Metro Transit Map Layout */}
      <div className="relative space-y-16">
        {milestones.map((milestone) => {
          const Icon = milestone.icon;
          return (
            <div key={milestone.id} className="relative pl-14 sm:pl-20 space-y-5">
              {/* Continuous Luminous Track Rail */}
              <div
                className="absolute left-6 sm:left-8 top-8 bottom-[-4rem] w-1 pointer-events-none rounded-full shadow-lg"
                style={{
                  backgroundColor: milestone.lineColor,
                  boxShadow: `0 0 16px ${milestone.lineColor}88`,
                }}
              />

              {/* Transit Line Junction Icon */}
              <div
                className="absolute left-2.5 sm:left-4.5 -top-1 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center font-mono text-xs font-black shadow-2xl border z-10"
                style={{
                  backgroundColor: '#090d16',
                  color: milestone.lineColor,
                  borderColor: milestone.lineColor,
                  boxShadow: `0 0 20px ${milestone.lineColor}66`,
                }}
              >
                <span>{milestone.lineCode}</span>
              </div>

              {/* Transit Line Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/15 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                      style={{
                        color: milestone.lineColor,
                        borderColor: `${milestone.lineColor}44`,
                        backgroundColor: `${milestone.lineColor}15`,
                      }}
                    >
                      {milestone.lineName}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white font-sans tracking-tight mt-1">
                    {milestone.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {milestone.lessons.filter((l) => completedLessonIds.includes(l.id)).length} / {milestone.lessons.length} Stations Done
                </span>
              </div>

              {/* Connected Transit Station Node Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {milestone.lessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  const isRecommended = lesson.id === nextRecommendedLesson.id;

                  return (
                    <motion.div
                      key={lesson.id}
                      whileHover={{ scale: 1.02, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDrawerLesson(lesson)}
                      className="group p-5 rounded-[24px] border text-left flex flex-col justify-between min-h-[140px] transition-all duration-200 cursor-pointer relative overflow-hidden"
                      style={{
                        background: isRecommended
                          ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%)'
                          : isDone
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderColor: isRecommended
                          ? '#fbbf24'
                          : isDone
                          ? 'rgba(16, 185, 129, 0.4)'
                          : 'rgba(255, 255, 255, 0.12)',
                        boxShadow: isRecommended
                          ? '0 15px 35px rgba(251, 191, 36, 0.25), inset 0 1px 1.5px rgba(255, 255, 255, 0.4)'
                          : isDone
                          ? '0 10px 25px rgba(16, 185, 129, 0.15), inset 0 1px 1.5px rgba(255, 255, 255, 0.3)'
                          : '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      {/* Top status line */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          Station {lesson.title.split('.')[0]}
                        </span>

                        {isDone ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            <CheckCircle2 size={11} />
                            <span>CLEARED</span>
                          </span>
                        ) : isRecommended ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 animate-pulse">
                            <span>NEXT STOP</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {lesson.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Title & Description in Plain English */}
                      <div className="space-y-1 my-2">
                        <h4 className="font-bold text-sm text-white font-sans tracking-tight group-hover:text-sky-300 transition">
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
