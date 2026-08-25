'use client';

import React, { useEffect } from 'react';
import LZString from 'lz-string';
import { useAppStore } from '../../core/engine/StateManager';
import { FluidCanvas } from '../../components/canvas/FluidCanvas';
import { Terminal } from '../../components/terminal/Terminal';
import { ActionDeck } from '../../components/ui/ActionDeck';
import { StateDashboard } from '../../components/dashboard/StateDashboard';
import { InternalsInspector } from '../../components/dashboard/InternalsInspector';
import { PresetSelector } from '../../components/ui/PresetSelector';
import { LayoutGrid, Sparkles } from 'lucide-react';

export default function PlaygroundPage() {
  const { setRepo, selectLesson } = useAppStore();

  // On mount: check URL hash for shared graph `#graph=...`
  useEffect(() => {
    selectLesson(null); // Freeform mode

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
  }, [selectLesson, setRepo]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[var(--bg-base)]">
      {/* Top Sandbox Controls */}
      <div className="px-4 py-2.5 glass-panel border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <LayoutGrid size={18} className="text-purple-400" />
          <h2 className="font-bold text-sm text-slate-100 font-sans tracking-tight">
            Freeform Git Sandbox
          </h2>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            (No constraints · Type any command or click actions)
          </span>
        </div>

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
          <div className="shrink-0">
            <ActionDeck />
          </div>
        </div>

        {/* State Dashboard & Terminal */}
        <div className="lg:col-span-5 h-full flex flex-col gap-3 overflow-hidden">
          <div className="shrink-0">
            <StateDashboard />
          </div>

          <div className="flex-1 overflow-hidden">
            <Terminal />
          </div>

          <div className="shrink-0">
            <InternalsInspector />
          </div>
        </div>
      </div>
    </div>
  );
}
