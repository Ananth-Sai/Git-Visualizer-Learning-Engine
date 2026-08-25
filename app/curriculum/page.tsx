'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Play,
  Layers,
  Terminal as TermIcon,
  Award,
  ArrowRight,
  Map,
  Building2,
  AlertTriangle,
  Activity,
  Target,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '../../core/engine/StateManager';
import { LESSONS } from '../../core/curriculum/lessons';
import { FluidCanvas } from '../../components/canvas/FluidCanvas';
import { Terminal } from '../../components/terminal/Terminal';
import { ActionDeck } from '../../components/ui/ActionDeck';
import { StateDashboard } from '../../components/dashboard/StateDashboard';
import { InternalsInspector } from '../../components/dashboard/InternalsInspector';

export default function CurriculumPage() {
  const {
    repo,
    activeLessonId,
    selectLesson,
    completedLessonIds,
    isCurrentSessionCompleted,
    resetCurrentLesson,
    unlockedPanels,
  } = useAppStore();

  const [showHint, setShowHint] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(true);

  // Default to level-1 if none selected
  useEffect(() => {
    if (!activeLessonId) {
      selectLesson('level-1');
    }
  }, [activeLessonId, selectLesson]);

  const router = useRouter();
  const currentIndex = LESSONS.findIndex((l) => l.id === (activeLessonId || 'level-1'));
  const currentLesson = LESSONS[currentIndex] || LESSONS[0];
  const nextLesson = currentIndex < LESSONS.length - 1 ? LESSONS[currentIndex + 1] : null;
  const wasPreviouslyMastered = completedLessonIds.includes(currentLesson.id);

  // Synchronize URL with active lesson
  useEffect(() => {
    if (activeLessonId) {
      router.replace(`/curriculum?level=${activeLessonId}`, { scroll: false });
      setShowBriefingModal(true);
    }
  }, [activeLessonId, router]);

  const handleNext = () => {
    if (currentIndex < LESSONS.length - 1) {
      selectLesson(LESSONS[currentIndex + 1].id);
      setShowHint(false);
      setShowBriefingModal(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      selectLesson(LESSONS[currentIndex - 1].id);
      setShowHint(false);
      setShowBriefingModal(true);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  useEffect(() => {
    if (isCurrentSessionCompleted) {
      triggerConfetti();
    }
  }, [isCurrentSessionCompleted]);

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-[var(--bg-base)]">
      {/* Top Level Objectives & Navigation Bar */}
      <div className="px-4 py-3 glass-panel border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Level Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition"
              title="Previous Level"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-sky-400">
              Level {currentIndex + 1}/{LESSONS.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === LESSONS.length - 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition"
              title="Next Level"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Level Title & Tier Badge */}
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-100 font-sans tracking-tight truncate max-w-xs sm:max-w-md">
              {currentLesson.title}
            </h2>
            <span className="hidden md:inline px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-zinc-800/80 text-zinc-300 border border-white/10">
              {currentLesson.tierTitle}
            </span>
            <button
              onClick={() => setShowBriefingModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-400/20 transition ml-1 cursor-pointer"
              title="Open Level Mission Briefing"
            >
              <span>📋 Briefing</span>
            </button>
            <Link
              href="/roadmap"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
              title="Return to Visual Roadmap Flowchart"
            >
              <Map size={13} style={{ color: 'var(--branch-main)' }} />
              <span>Roadmap Map</span>
            </Link>
          </div>
        </div>

        {/* Level Controls & Status */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Difficulty & Stage Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--branch-main)' }} />
            <span>{currentLesson.category}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{currentLesson.difficulty}</span>
          </div>

          {/* Hint Toggle */}
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-400/30 hover:bg-amber-500/20 transition"
          >
            <HelpCircle size={13} />
            <span>Hint</span>
          </button>

          {/* Reset Lesson */}
          <button
            onClick={resetCurrentLesson}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition flex items-center gap-1 text-xs"
            title="Reset Level Goal"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:inline text-[11px]">Reset</span>
          </button>

          {/* Completion / Session Indicator */}
          {isCurrentSessionCompleted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono shadow-lg shadow-emerald-500/10"
            >
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Goal Achieved! 🎉</span>
            </motion.div>
          ) : wasPreviouslyMastered ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 text-slate-300 border border-emerald-500/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-[11px]">Saved Done · Replaying</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 text-slate-400 border border-white/5 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              <span className="text-[11px]">In Progress</span>
            </div>
          )}
        </div>
      </div>

      {/* Hint Drawer */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200 font-sans space-y-1 overflow-hidden"
          >
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Step Hints:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {currentLesson.hints.map((h, idx) => (
                <li key={idx}>{h}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace Layout (Desktop-First Zero-Scroll Grid) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden min-h-0">
        {/* Left / Main Column: Fluid Canvas & Action Deck */}
        <div className="h-full flex flex-col gap-2.5 lg:col-span-8 overflow-hidden min-h-0">
          {/* Canvas Container */}
          <div className="flex-1 rounded-2xl overflow-hidden glass-panel-elevated shadow-2xl relative border border-white/5 min-h-0">
            <FluidCanvas />

            {/* 1. Level Entry Mission Briefing Modal (True Liquid Glassmorphism Overlay) */}
            <AnimatePresence>
              {showBriefingModal && !isCurrentSessionCompleted && (() => {
                const stageLessons = LESSONS.filter((l) => l.tier === currentLesson.tier);
                const stageIndex = stageLessons.findIndex((l) => l.id === currentLesson.id) + 1;
                const stageProgressPct = Math.round((stageIndex / stageLessons.length) * 100);

                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.92, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.92, y: 15 }}
                      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                      className="w-full max-w-lg p-6 sm:p-7 rounded-2xl space-y-4 border my-auto text-slate-100 shadow-2xl"
                      style={{
                        background: '#16181d',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {/* Header (Clean Monochrome + Emerald Progress) */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-slate-100 font-bold text-base shadow-sm shrink-0 font-mono">
                            {currentIndex + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-white font-sans tracking-tight">
                                {currentLesson.title.replace(/^\d+\.\s*/, '')}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-400 font-sans">
                              {currentLesson.tierTitle} · Stage {currentLesson.tier}
                            </p>
                          </div>
                        </div>

                        {/* Progress Badge */}
                        <div className="flex flex-col items-end gap-1 font-mono">
                          <span className="text-[11px] text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10 font-medium">
                            {stageIndex} / {stageLessons.length} Complete
                          </span>
                          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-emerald-400"
                              style={{ width: `${stageProgressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Structured Info Cards (Non-Blank Developer Docs Style) */}
                      <div className="space-y-3 text-xs">
                        {/* 1. Core Mission & Target Command */}
                        <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Target Concept & Command
                            </span>
                            {currentLesson.recommendedCommands && currentLesson.recommendedCommands.length > 0 && (
                              <code className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold">
                                git {currentLesson.recommendedCommands[0]}
                              </code>
                            )}
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed font-sans font-normal">
                            {currentLesson.description}
                          </p>
                        </div>

                        {/* 2. Your Practice Goal (High Contrast Emerald Focus) */}
                        <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/30 space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-emerald-400 font-mono">
                              <Target size={13} />
                              <span>Practice Goal</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                              Required
                            </span>
                          </div>
                          <p className="text-white font-medium font-sans text-xs leading-relaxed">
                            {currentLesson.expectedGoalText}
                          </p>
                        </div>

                        {/* 3. Real-World Context (Clean Key Takeaway) */}
                        {currentLesson.realWorldContext && (
                          <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/10 space-y-1">
                            <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-300 font-mono">
                              <Building2 size={13} className="text-slate-400" />
                              <span>Industry Takeaway</span>
                            </span>
                            <p className="text-slate-400 text-xs leading-relaxed font-sans font-normal">
                              {currentLesson.realWorldContext}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-white/10">
                        <button
                          onClick={() => setShowBriefingModal(false)}
                          className="w-full py-3 px-6 rounded-xl font-semibold text-xs tracking-wide transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:brightness-105 active:scale-[0.98] bg-white text-slate-950 hover:bg-slate-100"
                        >
                          <span>Start Level {currentIndex + 1} Challenge</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* 2. Center Celebration & Concept Learning Modal (Matte Smoked Satin Glass) */}
            <AnimatePresence>
              {isCurrentSessionCompleted && (() => {
                const stageLessons = LESSONS.filter((l) => l.tier === currentLesson.tier);
                const stageIndex = stageLessons.findIndex((l) => l.id === currentLesson.id) + 1;
                const stageProgressPct = Math.round((stageIndex / stageLessons.length) * 100);

                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.92, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.92, y: 15 }}
                      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                      className="w-full max-w-lg p-6 sm:p-7 rounded-2xl space-y-4 border my-auto text-slate-100 shadow-2xl"
                      style={{
                        background: 'rgba(15, 23, 42, 0.92)',
                        backdropFilter: 'blur(28px)',
                        WebkitBackdropFilter: 'blur(28px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base shadow-sm shrink-0">
                            ✓
                          </div>
                          <div>
                            <h3 className="font-semibold text-base text-white font-sans tracking-tight">
                              Level {currentIndex + 1} Mastered!
                            </h3>
                            <p className="text-xs text-slate-400 font-sans">
                              {currentLesson.title.replace(/^\d+\.\s*/, '')}
                            </p>
                          </div>
                        </div>

                        {/* Stage Progress Pill */}
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                            {currentLesson.tierTitle} ({stageIndex}/{stageLessons.length})
                          </span>
                          <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-emerald-400"
                              style={{ width: `${stageProgressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Learning Cards (Matte Satin) */}
                      <div className="space-y-2.5 text-xs">
                        {/* 1. What Just Happened */}
                        <div
                          className="p-3 rounded-xl space-y-1"
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-sky-400 font-mono">
                            <Sparkles size={12} />
                            <span>1. What Just Happened</span>
                          </span>
                          <p className="text-slate-300 text-xs leading-relaxed font-sans font-normal">
                            {currentLesson.pedagogicalTip || currentLesson.description}
                          </p>
                        </div>

                        {/* 2. Syntax Breakdown */}
                        {currentLesson.recommendedCommands && currentLesson.recommendedCommands.length > 0 && (
                          <div
                            className="p-3 rounded-xl space-y-1.5"
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-400 font-mono">
                              <span>2. Syntax Anatomy</span>
                            </span>
                            <div className="text-slate-300 text-xs font-mono leading-relaxed space-y-1">
                              {currentLesson.recommendedCommands.map((c) => (
                                <div key={c} className="flex items-center gap-2">
                                  <code className="px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-500/30 font-bold text-[11px]">
                                    git {c}
                                  </code>
                                  <span className="text-xs text-slate-300 font-sans font-normal">
                                    {c === 'init'
                                      ? 'Initializes the hidden local repository database (.git) in this folder.'
                                      : c.includes('commit')
                                      ? 'Permanently records the staged snapshot with your custom note.'
                                      : c.includes('add')
                                      ? 'Stages modified files into the shipping box ready for commit.'
                                      : 'Executes this operation across your repository track.'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Pro Tip & Gotcha Defense */}
                        {currentLesson.commonGotcha && (
                          <div
                            className="p-3 rounded-xl space-y-1"
                            style={{
                              background: 'rgba(245, 158, 11, 0.04)',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                            }}
                          >
                            <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-amber-400 font-mono">
                              <AlertTriangle size={12} />
                              <span>3. Watch Out For (Gotcha)</span>
                            </span>
                            <p className="text-slate-300 text-xs leading-relaxed font-sans font-normal">
                              {currentLesson.commonGotcha}
                            </p>
                          </div>
                        )}

                        {/* 4. Why Teams Use This */}
                        {currentLesson.realWorldContext && (
                          <div
                            className="p-3 rounded-xl space-y-1"
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-400 font-mono">
                              <Building2 size={12} className="text-indigo-400" />
                              <span>4. Why Teams Use This</span>
                            </span>
                            <p className="text-slate-300 text-xs leading-relaxed font-sans font-normal">
                              {currentLesson.realWorldContext}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer: Next Level Preview & CTA */}
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        {nextLesson ? (
                          <>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans px-1">
                              <span>Up Next:</span>
                              <span className="font-medium text-slate-200">
                                Level {currentIndex + 2}: {nextLesson.title.replace(/^\d+\.\s*/, '')}
                              </span>
                            </div>
                            <button
                              onClick={handleNext}
                              className="w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:brightness-110 active:scale-[0.98] bg-sky-400 text-slate-950"
                            >
                              <span>Continue to Next Level</span>
                              <ArrowRight size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => router.push('/playground')}
                            className="w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:brightness-110 active:scale-[0.98] bg-emerald-400 text-slate-950"
                          >
                            <span>🏆 All {LESSONS.length} Levels Mastered! Open Sandbox</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* Action Deck (Tier 1 default & quick modifiers) */}
          <div className="shrink-0">
            <ActionDeck />
          </div>
        </div>

        {/* Right Column: Always-Visible Companion (Guide & Checklist / 3-Tree Zones) + Terminal */}
        <div className="lg:col-span-4 h-full flex flex-col gap-2.5 overflow-hidden min-h-0">
          {/* Top Companion Card: Tabbed between Guide & 3-Zones */}
          <div
            className="shrink-0 h-[56%] flex flex-col rounded-2xl shadow-xl overflow-hidden"
            style={{
              background: 'rgba(13, 17, 23, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header Tabs */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-black/40 text-xs">
              <div className="flex items-center gap-2 font-sans font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-slate-200 text-xs font-mono">Level {currentIndex + 1} Companion</span>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px] font-sans">
                <button
                  onClick={() => setShowHint(false)}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition cursor-pointer ${
                    !showHint
                      ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Guide & Goals
                </button>
                <button
                  onClick={() => setShowHint(true)}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition cursor-pointer ${
                    showHint
                      ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3 File Zones
                </button>
              </div>
            </div>

            {/* Scrollable Tab Content */}
            <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {!showHint ? (
                <>
                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-slate-100 font-sans tracking-tight">
                      {currentLesson.title.replace(/^\d+\.\s*/, '')}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans font-normal">
                      {currentLesson.description}
                    </p>
                  </div>

                  {/* Practice Goal Card */}
                  <div
                    className="p-3.5 rounded-xl space-y-1.5 text-xs shadow-sm"
                    style={{
                      background: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-sky-400 font-mono">
                      <Target size={13} />
                      <span>Practice Goal</span>
                    </span>
                    <p className="text-slate-100 font-medium font-sans leading-relaxed text-xs">
                      {currentLesson.expectedGoalText}
                    </p>
                  </div>

                  {/* What to Do Steps */}
                  <div
                    className="p-3.5 rounded-xl text-xs font-sans space-y-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span className="text-amber-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Lightbulb size={13} />
                      <span>Step-by-Step Action</span>
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs leading-relaxed font-normal">
                      {currentLesson.hints.map((hint, hIdx) => (
                        <li key={hIdx}>{hint}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Terms Decoder */}
                  <div
                    className="p-3.5 rounded-xl space-y-2 text-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-300 font-mono">
                      <Sparkles size={13} className="text-purple-400" />
                      <span>Core Terms</span>
                    </span>
                    <div className="space-y-1.5 text-slate-300 font-sans leading-relaxed text-xs">
                      <div>
                        <strong className="text-slate-100 font-semibold">HEAD:</strong> The camera lens showing your active snapshot view.
                      </div>
                      <div>
                        <strong className="text-slate-100 font-semibold">Snapshot ID:</strong> Unique cryptographic fingerprint for each save point.
                      </div>
                      <div>
                        <strong className="text-slate-100 font-semibold">Branch (main):</strong> A movable label attached to the latest commit.
                      </div>
                    </div>
                  </div>

                  {/* Real-World Context Card */}
                  {currentLesson.realWorldContext && (
                    <div
                      className="p-3.5 rounded-xl space-y-1.5 text-xs shadow-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-300 font-mono">
                        <Building2 size={13} className="text-indigo-400" />
                        <span>Why Teams Use This</span>
                      </span>
                      <p className="text-slate-300 text-xs leading-relaxed font-sans font-normal">
                        {currentLesson.realWorldContext}
                      </p>
                    </div>
                  )}

                  {/* Common Gotcha Card */}
                  {currentLesson.commonGotcha && (
                    <div
                      className="p-3.5 rounded-xl space-y-1.5 text-xs shadow-sm"
                      style={{
                        background: 'rgba(245, 158, 11, 0.04)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                      }}
                    >
                      <span className="font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-amber-400 font-mono">
                        <AlertTriangle size={13} />
                        <span>Common Gotcha</span>
                      </span>
                      <p className="text-slate-300 text-xs leading-relaxed font-sans font-normal">
                        {currentLesson.commonGotcha}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* 3 File Zones */
                <StateDashboard />
              )}
            </div>
          </div>

          {/* Interactive Terminal CLI (Always available below) */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  );
}
