'use client';

import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { RoadmapTree } from '../components/landing/RoadmapTree';
import { FeatureGrid } from '../components/landing/FeatureGrid';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section with Live Demo */}
      <HeroSection />

      {/* Visual Roadmap Tree Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 border-t border-white/5 bg-slate-950/40">
        <RoadmapTree />
      </section>

      {/* Anti-Clutter Design Showcase & Features */}
      <FeatureGrid />

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-slate-500 font-mono">
        <p>Fluid Git Visualizer & Learning Engine · Built for Zero-Latency Client Simulation</p>
      </footer>
    </div>
  );
}
