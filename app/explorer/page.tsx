'use client';

import React from 'react';
import { CommandComparison } from '../../components/explorer/CommandComparison';
import { RecipeScenarios } from '../../components/explorer/RecipeScenarios';
import { BookOpen } from 'lucide-react';
import { GLOSSARY } from '../../core/curriculum/glossary';

export default function ExplorerPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          Git Command Explorer & Comparisons
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans">
          Deep-dive into side-by-side command behaviors, real-world fix recipes, and internal Git definitions.
        </p>
      </div>

      {/* Side-by-Side Comparisons */}
      <CommandComparison />

      {/* Real-World Recipe Scenarios */}
      <RecipeScenarios />

      {/* Interactive Glossary Preview Section */}
      <div className="p-6 rounded-2xl glass-panel-elevated shadow-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-sky-400" size={18} />
          <h3 className="font-bold text-sm text-slate-100 font-sans">
            Quick Glossary Reference
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {GLOSSARY.slice(0, 6).map((entry) => (
            <div
              key={entry.term}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5 hover:border-sky-500/40 hover:bg-slate-900/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300 font-sans">{entry.term}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                  {entry.tag}
                </span>
              </div>
              <p className="text-slate-300 line-clamp-3 leading-relaxed">{entry.plainEnglish}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
