'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, GitBranch, Sparkles } from 'lucide-react';

export const InteractivePreview: React.FC = () => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full rounded-2xl glass-panel-elevated p-4 border border-sky-500/20 shadow-2xl space-y-3">
      {/* Top mini toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping inline-block" />
          <span className="text-xs font-mono font-bold text-sky-300">
            Live Fluid Topology Simulation
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Step {step} of 4 · Auto-loop
        </span>
      </div>

      {/* SVG Canvas Stage */}
      <div className="relative h-48 w-full bg-slate-950/80 rounded-xl overflow-hidden flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 180">
          {/* Main spine guideline */}
          <line
            x1={50}
            y1={90}
            x2={450}
            y2={90}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4,4"
          />

          {/* Spline: Root (80, 90) to Main 1 (180, 90) */}
          <path
            d="M 80 90 L 180 90"
            fill="none"
            stroke="var(--branch-main)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Spline: Main 1 (180, 90) to Feature 1 (280, 45) */}
          {step >= 2 && (
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
              d="M 180 90 C 230 90, 230 45, 280 45"
              fill="none"
              stroke="var(--branch-feat)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Spline: Main 1 (180, 90) to Main 2 (280, 90) */}
          {step >= 3 && (
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
              d="M 180 90 L 280 90"
              fill="none"
              stroke="var(--branch-main)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Spline: Feature 1 (280, 45) & Main 2 (280, 90) into Merge Node (380, 90) */}
          {step >= 4 && (
            <>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
                d="M 280 45 C 330 45, 330 90, 380 90"
                fill="none"
                stroke="var(--branch-feat)"
                strokeWidth="3.5"
                strokeDasharray="4,4"
                strokeLinecap="round"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
                d="M 280 90 L 380 90"
                fill="none"
                stroke="var(--branch-main)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Node 1: Root */}
          <circle cx={80} cy={90} r={16} fill="#0f172a" stroke="var(--branch-main)" strokeWidth={2.5} />
          <text x={80} y={94} fill="#38bdf8" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            init
          </text>

          {/* Node 2: Main 1 */}
          <circle cx={180} cy={90} r={16} fill="#0f172a" stroke="var(--branch-main)" strokeWidth={2.5} />
          <text x={180} y={94} fill="#38bdf8" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            c1
          </text>

          {/* Node 3: Feature Branch Node */}
          {step >= 2 && (
            <g>
              <circle cx={280} cy={45} r={16} fill="#0f172a" stroke="var(--branch-feat)" strokeWidth={2.5} />
              <text x={280} y={49} fill="#a78bfa" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                feat
              </text>
            </g>
          )}

          {/* Node 4: Main 2 Diverged Node */}
          {step >= 3 && (
            <g>
              <circle cx={280} cy={90} r={16} fill="#0f172a" stroke="var(--branch-main)" strokeWidth={2.5} />
              <text x={280} y={94} fill="#38bdf8" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                c2
              </text>
            </g>
          )}

          {/* Node 5: Merge Node */}
          {step >= 4 && (
            <g>
              <circle cx={380} cy={90} r={18} fill="#38bdf8" stroke="#ffffff" strokeWidth={3} />
              <text x={380} y={94} fill="#0b0f17" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                merge
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Step Explanation Banner */}
      <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5">
        <span className="font-mono text-sky-300">
          {step === 1 && '$ git commit -m "Initialize project"'}
          {step === 2 && '$ git switch -c feature && git commit -m "Add auth"'}
          {step === 3 && '$ git switch main && git commit -m "Update core"'}
          {step === 4 && '$ git merge feature (Three-Way Merge Converges)'}
        </span>
        <button
          onClick={() => setStep(1)}
          className="p-1 text-slate-400 hover:text-white transition"
          title="Restart Demo"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
};
