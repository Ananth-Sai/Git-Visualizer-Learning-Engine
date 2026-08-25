'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Play, Sparkles, ChevronRight, Award, Compass, GitBranch, Layers, ShieldAlert } from 'lucide-react';
import { LESSONS } from '../../core/curriculum/lessons';
import { LessonObjective } from '../../core/types';
import { useAppStore } from '../../core/engine/StateManager';
import { RoadmapNodeDrawer } from './RoadmapNodeDrawer';

export const RoadmapTree: React.FC = () => {
  const { completedLessonIds, selectLesson } = useAppStore();
  const [selectedDrawerLesson, setSelectedDrawerLesson] = useState<LessonObjective | null>(null);

  const progressPercent = Math.round((completedLessonIds.length / LESSONS.length) * 100);

  const stages = [
    {
      id: 'stage-1',
      title: 'Stage 1: Repository Fundamentals',
      badge: 'Levels 1–6',
      color: '#38bdf8',
      icon: Compass,
      description: 'Master git init, the 3 file zones, snapshots, log inspection, and the HEAD pointer.',
      lessons: LESSONS.slice(0, 6),
    },
    {
      id: 'stage-2',
      title: 'Stage 2: Branching & Merging Strategies',
      badge: 'Levels 7–12',
      color: '#c084fc',
      icon: GitBranch,
      description: 'Create parallel feature branches, fast-forward, 3-way merges, linear rebasing, and cherry-picking.',
      lessons: LESSONS.slice(6, 12),
    },
    {
      id: 'stage-3',
      title: 'Stage 3: Precision Control & Undoing Mistakes',
      badge: 'Levels 13–17',
      color: '#fbbf24',
      icon: Layers,
      description: 'Amend commits, safely unstage files, master the 3 resets (--soft/mixed/hard), revert, and stash.',
      lessons: LESSONS.slice(12, 17),
    },
    {
      id: 'stage-4',
      title: 'Stage 4: Remotes & Disaster Recovery',
      badge: 'Levels 18–22',
      color: '#fb7185',
      icon: ShieldAlert,
      description: 'Remote tracking, 3-way merge conflict resolution, interactive rebase, reflog rescue, and release tags.',
      lessons: LESSONS.slice(17, 22),
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 py-8">
      {/* Progress Header Bar with Sleek Liquid Glass */}
      <div
        className="p-6 sm:p-7 rounded-[28px] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 text-slate-100 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(36px) saturate(200%)',
          WebkitBackdropFilter: 'blur(36px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.45)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              boxShadow: '0 8px 20px rgba(56, 189, 248, 0.35), inset 0 1px 1.5px rgba(255,255,255,0.6)',
            }}
          >
            <Award size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white font-sans tracking-tight">
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
            <span className="text-slate-300">Total Progress</span>
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

      {/* 4 Balanced Stage Lanes */}
      <div className="space-y-12">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="space-y-4">
              {/* Clean Stage Header (No heavy dark outer container) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md font-mono text-xs font-bold shrink-0"
                    style={{
                      backgroundColor: `${stage.color}20`,
                      color: stage.color,
                      border: `1px solid ${stage.color}50`,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-extrabold text-base text-white font-sans tracking-tight">
                        {stage.title}
                      </h4>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: `${stage.color}20`,
                          color: stage.color,
                          border: `1px solid ${stage.color}40`,
                        }}
                      >
                        {stage.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">{stage.description}</p>
                  </div>
                </div>

                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {stage.lessons.filter((l) => completedLessonIds.includes(l.id)).length} / {stage.lessons.length} complete
                </span>
              </div>

              {/* Symmetrical 3-Column Liquid Glass Cards Grid with True Image 2 Bento Styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                {stage.lessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <motion.button
                      key={lesson.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDrawerLesson(lesson)}
                      className="p-6 rounded-[28px] text-left flex flex-col justify-between min-h-[200px] transition-all duration-200 cursor-pointer relative overflow-hidden group"
                      style={{
                        background: isDone
                          ? `linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(255, 255, 255, 0.03) 100%)`
                          : `linear-gradient(135deg, ${stage.color}18 0%, rgba(255, 255, 255, 0.02) 100%)`,
                        backdropFilter: 'blur(30px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                        border: isDone ? '1px solid rgba(16, 185, 129, 0.5)' : `1px solid ${stage.color}45`,
                        boxShadow: isDone
                          ? '0 20px 45px rgba(0, 0, 0, 0.5), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.4)'
                          : `0 20px 45px rgba(0, 0, 0, 0.5), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.35)`,
                      }}
                    >
                      {/* Ambient background glow orb */}
                      <div
                        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-300"
                        style={{ backgroundColor: stage.color }}
                      />

                      {/* Header Row: Icon Squircle + Tag */}
                      <div className="flex items-center justify-between w-full relative z-10 mb-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-2"
                          style={{
                            backgroundColor: `${stage.color}25`,
                            color: stage.color,
                            border: `1px solid ${stage.color}50`,
                            boxShadow: `0 4px 14px ${stage.color}25, inset 0 1px 1px rgba(255,255,255,0.4)`,
                          }}
                        >
                          <Icon size={19} />
                        </div>

                        {isDone ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/50 shadow-sm">
                            <CheckCircle2 size={11} />
                            <span>CLEARED</span>
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-mono font-bold px-3 py-1 rounded-full border uppercase tracking-wider"
                            style={{
                              backgroundColor: `${stage.color}15`,
                              color: stage.color,
                              borderColor: `${stage.color}35`,
                            }}
                          >
                            Level {lesson.title.split('.')[0]}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5 relative z-10 my-1">
                        <h5 className="font-extrabold text-base text-white line-clamp-1 font-sans tracking-tight group-hover:text-white transition-colors">
                          {lesson.title.replace(/^\d+\.\s*/, '')}
                        </h5>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                          {lesson.description}
                        </p>
                      </div>

                      {/* Footer Row (Like Image 2) */}
                      <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between font-mono text-[11px] relative z-10 w-full">
                        <span className="text-slate-400 font-sans text-xs flex items-center gap-1.5">
                          <span>{lesson.difficulty}</span>
                        </span>
                        <span
                          className="font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                          style={{ color: stage.color }}
                        >
                          <span>Explore Concept</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Slide-out Drawer */}
      <RoadmapNodeDrawer
        lesson={selectedDrawerLesson}
        onClose={() => setSelectedDrawerLesson(null)}
      />
    </div>
  );
};
