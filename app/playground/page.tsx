'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import LZString from 'lz-string';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '../../core/engine/StateManager';
import { createInitialRepository, commit, createBranch } from '../../core/engine/GitReducer';
import { FluidCanvas } from '../../components/canvas/FluidCanvas';
import { Terminal } from '../../components/terminal/Terminal';
import { ActionDeck } from '../../components/ui/ActionDeck';
import { StateDashboard } from '../../components/dashboard/StateDashboard';
import { InternalsInspector } from '../../components/dashboard/InternalsInspector';
import { PresetSelector } from '../../components/ui/PresetSelector';
import { LayoutGrid, Sparkles, CheckCircle2, X } from 'lucide-react';

function PlaygroundContent() {
  const { setRepo, selectLesson, executeCommand } = useAppStore();
  const searchParams = useSearchParams();
  const [executedBanner, setExecutedBanner] = useState<string | null>(null);
  // Track whether we've already done the one-time mount setup so that
  // changes to searchParams don't accidentally re-run selectLesson(null)
  // and wipe the user's in-progress sandbox state.
  const mountedRef = useRef(false);

  // One-time mount effect: enter freeform mode and handle URL params/hash.
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // If a recipe was pre-loaded (navigated from Explorer → Load Into Playground),
    // don't reset the repo — the recipe state is already set in the store.
    const hasPreloadedRecipe = useAppStore.getState().activeRecipeId;
    if (!hasPreloadedRecipe) {
      selectLesson(null); // Enter freeform sandbox mode
    }

    // 1. Check if command was passed via query param (from Help / Explorer)
    const cmdParam = searchParams.get('cmd');
    if (cmdParam) {
      // Prepare a rich starter repository with files and initial commits
      let baseState = createInitialRepository();
      baseState = commit(baseState, { message: 'feat: add user schema & database models' }).state;
      baseState = createBranch(baseState, 'feature-auth').state;

      // Populate working tree with editable files so add/commit/status works seamlessly
      baseState.workingTree['src/auth.ts'] = {
        path: 'src/auth.ts',
        content: 'export const token = "abc123xyz";',
        stage: 'modified',
      };
      baseState.workingTree['src/middleware/jwt.ts'] = {
        path: 'src/middleware/jwt.ts',
        content: 'export function verifyToken() { return true; }',
        stage: 'untracked',
      };

      setRepo(baseState);

      // Execute target command after a short delay so the canvas is ready
      const timer = setTimeout(() => {
        executeCommand(cmdParam);
        setExecutedBanner(cmdParam);
      }, 180);

      return () => clearTimeout(timer);
    }

    // 2. Check URL hash for shared graph `#graph=...`
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#graph=')) {
        try {
          const rawCompressed = hash.replace('#graph=', '');
          const decompressed = LZString.decompressFromEncodedURIComponent(rawCompressed);
          if (decompressed) {
            const parsed = JSON.parse(decompressed);
            if (parsed.objects && parsed.refs && parsed.head) {
              setRepo({
                ...parsed,
                stash: [],
                reflog: { HEAD: [] },
                conflicts: {},
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse shared graph hash', e);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps — intentionally mount-only. searchParams is read inside.

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[var(--bg-base)]">
      {/* Top Sandbox Controls */}
      <div className="px-4 py-2.5 glass-panel border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <LayoutGrid size={18} className="text-purple-400" />
          <h2 className="font-bold text-sm text-slate-100 font-sans tracking-tight">
            Freeform Git Sandbox
          </h2>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            (Interactive Topology Canvas · Execute any command)
          </span>
        </div>

        {/* Executed Command Feedback Pill */}
        {executedBanner && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Pre-loaded &amp; Executed: <strong>{executedBanner}</strong></span>
            <button
              onClick={() => setExecutedBanner(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <PresetSelector />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Canvas & Action Deck */}
        <div className="lg:col-span-7 h-full flex flex-col gap-3">
          <div className="flex-1 rounded-2xl overflow-hidden glass-panel-elevated shadow-2xl relative border border-white/5">
            <FluidCanvas />
          </div>
          <div className="h-44 shrink-0">
            <ActionDeck />
          </div>
        </div>

        {/* Right Split: Terminal & State Dashboard */}
        <div className="lg:col-span-5 h-full flex flex-col gap-3">
          <div className="h-1/2 rounded-2xl overflow-hidden glass-panel-elevated shadow-2xl border border-white/5 flex flex-col">
            <Terminal />
          </div>
          <div className="h-1/2 rounded-2xl overflow-hidden glass-panel-elevated shadow-2xl border border-white/5 flex flex-col">
            <StateDashboard />
          </div>
        </div>
      </div>

      {/* Slide-out Internals Drawer */}
      <InternalsInspector />
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-8 text-center text-slate-400 font-mono text-xs">Loading sandbox...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}
