'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { computeTopology, TopologyLayout } from '../../core/engine/PathTopology';
import { SplineConnector } from './SplineConnector';
import { CommitNode } from './CommitNode';
import { RefPointer } from './RefPointer';
import { AnimationScrubber } from './AnimationScrubber';

interface FluidCanvasProps {
  className?: string;
  showScrubber?: boolean;
}

export const FluidCanvas: React.FC<FluidCanvasProps> = ({ className = '', showScrubber = false }) => {
  const repo = useAppStore((s) => s.repo);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 80, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const layout: TopologyLayout = useMemo(() => {
    return computeTopology(repo);
  }, [repo]);

  // Auto-center the active graph in the container viewport
  const centerGraph = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    // Center of graph
    const graphCenterX = layout.width / 2;
    const graphCenterY = 180; // primary spine Y

    const newPanX = clientWidth / 2 - graphCenterX * zoom;
    const newPanY = clientHeight / 2 - graphCenterY * zoom;

    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [layout, zoom]);

  // Center on mount and when graph expands
  useEffect(() => {
    const timer = setTimeout(() => {
      centerGraph();
    }, 100);
    return () => clearTimeout(timer);
  }, [repo, centerGraph]);

  // Handle drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    centerGraph();
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-[var(--bg-base)] ${className}`}
    >
      {/* Background Canvas Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1 p-1.5 rounded-2xl glass-panel-elevated shadow-xl border border-white/5">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z * 1.15))}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z * 0.85))}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={centerGraph}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Center Graph"
          aria-label="Center Graph"
        >
          <Crosshair size={15} />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          title="Reset Zoom"
          aria-label="Reset View"
        >
          <Maximize2 size={15} />
        </button>
        <span className="text-[10px] font-mono text-slate-400 px-1.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Scaled & Panned Canvas Content */}
      <div
        className="absolute origin-top-left transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: `${layout.width}px`,
          height: `${layout.height}px`,
        }}
      >
        {/* SVG Splines Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          width={layout.width}
          height={layout.height}
        >
          <defs>
            <linearGradient id="mainBranchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--branch-main)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--branch-main)" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Lane Horizontal Guidelines */}
          {Array.from({ length: layout.laneCount }).map((_, idx) => {
            const laneY = 180 + (idx - Math.floor(layout.laneCount / 2)) * 110;
            return (
              <line
                key={`lane-guide-${idx}`}
                x1={0}
                y1={laneY}
                x2={layout.width}
                y2={laneY}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Spline Connectors */}
          {layout.splines.map((spline) => (
            <SplineConnector key={spline.id} spline={spline} />
          ))}
        </svg>

        {/* Ref Pointers & Branch Badges */}
        {layout.nodes.map((node) => {
          if (!node.isBranchTip && !node.isHead && node.tags.length === 0 && !node.isRemoteTip) {
            return null;
          }
          return (
            <RefPointer
              key={`ref-${node.id}`}
              x={node.x}
              y={node.y}
              isHead={node.isHead}
              branchTips={node.branchTips}
              tags={node.tags}
              remoteTips={node.remoteBranchTips}
            />
          );
        })}

        {/* Interactive Commit Nodes */}
        {layout.nodes.map((node) => (
          <CommitNode key={node.id} node={node} />
        ))}

        {/* Option A: Animated Ghost Node (When 0 commits exist) */}
        {layout.nodes.length === 0 && (
          <div
            className="absolute flex flex-col items-center justify-center select-none"
            style={{
              left: `${layout.width / 2}px`,
              top: '180px',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="flex flex-col items-center gap-3">
              {/* Ghost Circle */}
              <div className="relative flex items-center justify-center">
                <div
                  className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center animate-pulse shadow-lg"
                  style={{
                    borderColor: 'var(--branch-main)',
                    backgroundColor: 'color-mix(in srgb, var(--branch-main) 12%, transparent)',
                  }}
                >
                  <span className="font-mono text-xs font-bold text-slate-400">.git ?</span>
                </div>
                <div
                  className="absolute -inset-2 rounded-full border border-dashed opacity-30 animate-ping"
                  style={{ borderColor: 'var(--branch-main)' }}
                />
              </div>

              {/* Ghost Indicator Labels */}
              <div className="text-center space-y-1 pointer-events-none">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-md"
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
                  }}
                >
                  <span>⚡ Project Uninitialized</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans max-w-xs leading-snug">
                  Type <code className="px-1.5 py-0.5 rounded bg-black/50 text-amber-300 font-mono font-bold border border-white/10">git init</code> in terminal below to create repository
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation Scrubber (Contextual) */}
      {showScrubber && (
        <AnimationScrubber
          operationType="merge"
          sourceBranch="feature"
          targetBranch="main"
        />
      )}
    </div>
  );
};
