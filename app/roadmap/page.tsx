'use client';

import React from 'react';
import { FlowchartRoadmap } from '../../components/roadmap/FlowchartRoadmap';
import { Compass } from 'lucide-react';

export default function RoadmapPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-base)]">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto pt-8 px-4 text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-slate-300">
          <Compass size={13} style={{ color: 'var(--branch-main)' }} />
          <span>Interactive Learning Flowchart</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-sans tracking-tight">
          Git Learning Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-xl mx-auto leading-relaxed">
          Follow the structured path from essential commits to advanced branching, rebasing, and conflict recovery. Select any topic to review the concept or practice interactively.
        </p>
      </div>

      {/* Main Flowchart Tree */}
      <FlowchartRoadmap />
    </div>
  );
}
