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
                    className="fixed inset-0 z-50 bg-black/15 backdrop-blur-2xl backdrop-saturate-200 flex items-center justify-center p-4 select-none overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.88, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.88, y: 20 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                      className="w-full max-w-xl p-7 rounded-[32px] space-y-4 border my-auto text-slate-100"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
                        backdropFilter: 'blur(40px) saturate(220%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(220%)',
                        border: '1px solid rgba(255, 255, 255, 0.28)',
                        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.65), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 1.5px 0 rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/15 pb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shrink-0"
                            style={{
                              backgroundColor: 'var(--branch-main)',
                              color: 'var(--bg-base)',
                              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 4px 14px rgba(0,0,0,0.3)',
                            }}
                          >
                            🚀
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-white font-sans tracking-tight drop-shadow-sm">
                              Level {currentIndex + 1} Mission Briefing
                            </h3>
                            <p className="text-xs text-slate-300 font-sans">
                              {currentLesson.title.replace(/^\d+\.\s*/, '')}
                            </p>
                          </div>
                        </div>

                        {/* Stage Progress Pill */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className="text-[10px] font-mono font-bold px-3 py-1 rounded-full border shadow-sm"
                            style={{
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: '#ffffff',
                              background: 'rgba(255, 255, 255, 0.1)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            {currentLesson.tierTitle} ({stageIndex}/{stageLessons.length})
                          </span>
                          <div className="w-28 h-1.5 rounded-full bg-white/15 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${stageProgressPct}%`,
                                backgroundColor: 'var(--branch-main)',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Core Content */}
                      <div className="space-y-2.5 text-xs">
                        {/* 1. What You'll Learn */}
                        <div
                          className="p-4 rounded-2xl space-y-1"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.16)',
                            boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(16px)',
                          }}
                        >
                          <span
                            className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                            style={{ color: 'var(--branch-main)' }}
                          >
                            <span>📖</span>
                            <span>What You&apos;ll Learn:</span>
                          </span>
                          <p className="text-slate-100 text-xs leading-relaxed font-sans font-normal">
                            {currentLesson.description}
                          </p>
                        </div>

                        {/* 2. Your Practice Goal */}
                        <div
                          className="p-4 rounded-2xl space-y-1.5 shadow-md"
                          style={{
                            background: 'linear-gradient(135deg, color-mix(in srgb, var(--branch-main) 18%, transparent) 0%, rgba(255, 255, 255, 0.05) 100%)',
                            border: '1.5px solid color-mix(in srgb, var(--branch-main) 60%, white 30%)',
                            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.45), 0 8px 24px color-mix(in srgb, var(--branch-main) 20%, transparent)',
                            backdropFilter: 'blur(16px)',
                          }}
                        >
                          <span
                            className="font-bold text-[11px] uppercase tracking-wider block"
                            style={{ color: 'var(--branch-main)' }}
                          >
                            🎯 Your Practice Goal:
                          </span>
                          <p className="text-white font-semibold font-sans text-xs leading-relaxed drop-shadow-sm">
                            {currentLesson.expectedGoalText}
                          </p>
                        </div>

                        {/* 3. Real-World Context (Why Teams Use This) */}
                        {currentLesson.realWorldContext && (
                          <div
                            className="p-4 rounded-2xl space-y-1"
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.16)',
                              boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(16px)',
                            }}
                          >
                            <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-slate-200">
                              <Building2 size={13} style={{ color: 'var(--branch-main)' }} />
                              <span>Why Teams Use This:</span>
                            </span>
                            <p className="text-slate-200 text-xs leading-relaxed font-sans font-normal">
                              {currentLesson.realWorldContext}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-white/15">
                        <button
                          onClick={() => setShowBriefingModal(false)}
                          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)',
                            color: '#090d16',
                            border: '1px solid rgba(255, 255, 255, 0.9)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 2px 2px rgba(255, 255, 255, 1), inset 0 -2px 2px rgba(0, 0, 0, 0.15)',
                          }}
                        >
                          <span>🚀 Start Level {currentIndex + 1} Challenge</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* 2. Center Celebration & Concept Learning Modal (True Liquid Glassmorphism Overlay) */}
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
                    className="fixed inset-0 z-50 bg-black/15 backdrop-blur-2xl backdrop-saturate-200 flex items-center justify-center p-4 select-none overflow-y-auto"
                  >
                    <motion.div
                      initial={{ scale: 0.88, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.88, y: 20 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                      className="w-full max-w-xl p-7 rounded-[32px] space-y-4 border my-auto text-slate-100"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
                        backdropFilter: 'blur(40px) saturate(220%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(220%)',
                        border: '1px solid rgba(255, 255, 255, 0.28)',
                        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.65), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 1.5px 0 rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/15 pb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base shadow-lg shrink-0"
                            style={{
                              backgroundColor: 'var(--accent-success)',
                              color: 'var(--bg-base)',
                              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 4px 14px rgba(0,0,0,0.3)',
                            }}
                          >
                            ✓
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-white font-sans tracking-tight drop-shadow-sm">
                              Level {currentIndex + 1} Mastered!
                            </h3>
                            <p className="text-xs text-slate-300 font-sans">
                              {currentLesson.title.replace(/^\d+\.\s*/, '')}
                            </p>
                          </div>
                        </div>

                        {/* Stage Progress Pill */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className="text-[10px] font-mono font-bold px-3 py-1 rounded-full border shadow-sm"
                            style={{
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: '#ffffff',
                              background: 'rgba(255, 255, 255, 0.1)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            {currentLesson.tierTitle} ({stageIndex}/{stageLessons.length})
                          </span>
                          <div className="w-28 h-1.5 rounded-full bg-white/15 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${stageProgressPct}%`,
                                backgroundColor: 'var(--branch-main)',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4 Rich Learning Cards */}
                      <div className="space-y-2 text-xs">
                        {/* 1. What Just Happened */}
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                          <span
                            className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                            style={{ color: 'var(--branch-main)' }}
                          >
                            <Sparkles size={12} />
                            <span>1. What Just Happened:</span>
                          </span>
                          <p className="text-slate-200 text-[11px] leading-relaxed font-sans font-normal">
                            {currentLesson.pedagogicalTip || currentLesson.description}
                          </p>
                        </div>

                        {/* 2. Syntax Breakdown */}
                        {currentLesson.recommendedCommands && currentLesson.recommendedCommands.length > 0 && (
                          <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                            <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-sky-400">
                              <span>🔍</span>
                              <span>2. Syntax Anatomy:</span>
                            </span>
                            <div className="text-slate-300 text-[11px] font-mono leading-relaxed">
                              {currentLesson.recommendedCommands.map((c) => (
                                <div key={c} className="flex items-center gap-2">
                                  <code className="px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-500/30 font-bold">
                                    git {c}
                                  </code>
                                  <span className="text-[11px] text-slate-300 font-sans font-normal">
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
                          <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 space-y-1">
                            <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-amber-300">
                              <AlertTriangle size={12} />
                              <span>3. Watch Out For (Gotcha):</span>
                            </span>
                            <p className="text-slate-300 text-[11px] leading-relaxed font-sans font-normal">
                              {currentLesson.commonGotcha}
                            </p>
                          </div>
                        )}

                        {/* 4. Why Teams Use This */}
                        {currentLesson.realWorldContext && (
                          <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                            <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                              <Building2 size={12} style={{ color: 'var(--branch-main)' }} />
                              <span>4. Why Teams Use This:</span>
                            </span>
                            <p className="text-slate-300 text-[11px] leading-relaxed font-sans font-normal">
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
                              <span className="font-semibold text-slate-200">
                                Level {currentIndex + 2}: {nextLesson.title.replace(/^\d+\.\s*/, '')}
                              </span>
                            </div>
                            <button
                              onClick={handleNext}
                              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.98]"
                              style={{
                                backgroundColor: 'var(--branch-main)',
                                color: 'var(--bg-base)',
                              }}
                            >
                              <span>Continue to Next Level</span>
                              <ArrowRight size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => router.push('/playground')}
                            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.98]"
                            style={{
                              backgroundColor: 'var(--branch-main)',
                              color: 'var(--bg-base)',
                            }}
                          >
                            <span>🏆 All {LESSONS.length} Levels Mastered! Open Sandbox</span>
                            <ArrowRight size={15} />
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
          <div className="shrink-0 h-[56%] flex flex-col rounded-2xl glass-panel-elevated shadow-xl border border-white/10 overflow-hidden bg-[var(--bg-surface)]">
            {/* Header Tabs */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 text-xs">
              <div className="flex items-center gap-1.5 font-sans font-bold">
                <span style={{ color: 'var(--branch-main)' }}>💡</span>
                <span className="text-slate-100 text-xs">Level {currentIndex + 1} Companion</span>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[10px] font-sans">
                <button
                  onClick={() => setShowHint(false)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    !showHint
                      ? 'bg-[var(--branch-main)] text-[var(--bg-base)] shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Step Guide & Goals
                </button>
                <button
                  onClick={() => setShowHint(true)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    showHint
                      ? 'bg-[var(--branch-main)] text-[var(--bg-base)] shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3 File Zones
                </button>
              </div>
            </div>

            {/* Scrollable Tab Content */}
            <div className="p-3.5 overflow-y-auto space-y-3 flex-1 text-xs">
              {!showHint ? (
                <>
                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-100 font-sans">
                      {currentLesson.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {currentLesson.description}
                    </p>
                  </div>

                  {/* 🎯 Practice Goal Card */}
                  <div
                    className="p-3 rounded-xl bg-black/40 space-y-1 text-xs shadow-sm"
                    style={{
                      border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
                    }}
                  >
                    <span
                      className="font-bold text-[11px] uppercase tracking-wider block"
                      style={{ color: 'var(--branch-main)' }}
                    >
                      🎯 Goal Checklist:
                    </span>
                    <p className="text-slate-100 font-medium font-sans leading-relaxed">
                      {currentLesson.expectedGoalText}
                    </p>
                  </div>

                  {/* 💡 What to Do Steps */}
                  <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs font-sans space-y-1.5">
                    <span className="text-slate-200 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <span>💡</span> Step-by-Step Action:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                      {currentLesson.hints.map((hint, hIdx) => (
                        <li key={hIdx}>{hint}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 📖 Day 1 Terms Decoder */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-[11px]">
                    <span
                      className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1"
                      style={{ color: 'var(--branch-main)' }}
                    >
                      <Sparkles size={12} />
                      <span>Day 1 Terms Decoder:</span>
                    </span>
                    <div className="space-y-1 text-slate-300 font-sans leading-snug">
                      <div>
                        <strong className="text-slate-100">📍 HEAD:</strong> The &quot;You Are Here&quot; camera lens showing your active snapshot view.
                      </div>
                      <div>
                        <strong className="text-slate-100">📸 Snapshot ID (e.g. 4d4a):</strong> Unique tracking fingerprint for that exact save point.
                      </div>
                      <div>
                        <strong className="text-slate-100">🌿 Branch (main):</strong> A movable sticky-note label attached to the latest commit.
                      </div>
                    </div>
                  </div>

                  {/* 🏢 Real-World Context Card */}
                  {currentLesson.realWorldContext && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs shadow-sm">
                      <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-slate-200">
                        <Building2 size={13} style={{ color: 'var(--branch-main)' }} />
                        <span>Why Teams Use This:</span>
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                        {currentLesson.realWorldContext}
                      </p>
                    </div>
                  )}

                  {/* ⚠️ Common Gotcha Card */}
                  {currentLesson.commonGotcha && (
                    <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 space-y-1 text-xs shadow-sm">
                      <span className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 text-amber-300">
                        <AlertTriangle size={13} />
                        <span>Common Gotcha:</span>
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
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
