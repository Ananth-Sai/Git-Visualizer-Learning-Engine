'use client';

import React, { useState } from 'react';
import { FlagBuilder } from '../../components/explorer/FlagBuilder';
import { CommandComparison } from '../../components/explorer/CommandComparison';
import { RecipeScenarios } from '../../components/explorer/RecipeScenarios';
import { EmergencyWizard } from '../../components/explorer/EmergencyWizard';
import { PlumbingInspector } from '../../components/explorer/PlumbingInspector';
import { motion } from 'framer-motion';
import { BookOpen, Sliders, ArrowLeftRight, ChefHat, AlertOctagon, Layers, Sparkles } from 'lucide-react';
import { GLOSSARY } from '../../core/curriculum/glossary';

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'All Modules', icon: Sparkles },
    { id: 'flag-builder', label: 'Flag Builder', icon: Sliders },
    { id: 'comparisons', label: 'Comparisons', icon: ArrowLeftRight },
    { id: 'recipes', label: 'Recipe Scenarios', icon: ChefHat },
    { id: 'emergency', label: 'Emergency Triage', icon: AlertOctagon },
    { id: 'plumbing', label: '4-Zone Plumbing', icon: Layers },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
      {/* Header Banner (Full Width) */}
      <div className="space-y-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-400/20">
            <Sparkles size={13} />
            <span>Interactive Command Lab &amp; Visual Diffs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
            Git Command Explorer &amp; Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
            Deep-dive into side-by-side command behaviors, toggleable flag simulations, crisis triage escapes, and under-the-hood 4-zone plumbing.
          </p>
        </div>

        {/* Option 2: Clean Wrap Tab Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/25 scale-[1.02]'
                    : 'bg-slate-950/60 hover:bg-slate-900 text-slate-300 border border-white/10 hover:border-white/20'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-slate-950' : 'text-sky-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Module 1: Interactive Flag Builder */}
      {(activeTab === 'all' || activeTab === 'flag-builder') && (
        <section className="space-y-3">
          <FlagBuilder />
        </section>
      )}

      {/* Module 4: Git Emergency / Triage Wizard */}
      {(activeTab === 'all' || activeTab === 'emergency') && (
        <section className="space-y-3">
          <EmergencyWizard />
        </section>
      )}

      {/* Module 5: 4-Zone Plumbing & Data Flow */}
      {(activeTab === 'all' || activeTab === 'plumbing') && (
        <section className="space-y-3">
          <PlumbingInspector />
        </section>
      )}

      {/* Module 2: Side-by-Side Comparisons */}
      {(activeTab === 'all' || activeTab === 'comparisons') && (
        <section className="space-y-3">
          <CommandComparison />
        </section>
      )}

      {/* Module 3: Real-World Recipe Scenarios */}
      {(activeTab === 'all' || activeTab === 'recipes') && (
        <section className="space-y-3">
          <RecipeScenarios />
        </section>
      )}

      {/* Interactive Glossary Preview Section */}
      {activeTab === 'all' && (
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
      )}
    </div>
  );
}
