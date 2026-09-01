'use client';

import React, { useState } from 'react';
import { HelpTerminal } from '../../components/help/HelpTerminal';
import { CheatSheetGrid } from '../../components/help/CheatSheetGrid';
import { Terminal, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

export default function HelpPage() {
  const [activeQueryCommand, setActiveQueryCommand] = useState<string>('help commit');

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-400/20">
            <Sparkles size={13} />
            <span>Interactive CLI Reference &amp; Manual</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
            Git Help Center &amp; Living Cheat Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
            Query any command in the smart help terminal or browse the living cheat sheet to see what every command does, its syntax, and realistic execution output.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl glass-panel border border-white/10 flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400" />
            <div className="text-xs font-mono">
              <div className="font-bold text-white">Full Safety Guidance</div>
              <div className="text-[10px] text-slate-400">Safe vs Destructive Badges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top: Interactive Smart Help Terminal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 font-sans flex items-center gap-2">
            <Terminal size={16} className="text-sky-400" />
            <span>Smart Help Terminal</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Auto-types syntax, explanation &amp; realistic output
          </span>
        </div>

        <HelpTerminal
          activeQueryCommand={activeQueryCommand}
          onClearActiveQuery={() => setActiveQueryCommand('')}
        />
      </div>

      {/* Bottom: Living Cheat Sheet Matrix */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <CheatSheetGrid onSelectCommand={(cmd) => setActiveQueryCommand(cmd)} />
      </div>
    </div>
  );
}
