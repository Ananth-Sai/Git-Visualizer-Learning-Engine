'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../core/engine/StateManager';

interface RefPointerProps {
  branchTips: string[];
  tags?: string[];
  remoteTips?: string[];
  isHead: boolean;
  x: number;
  y: number;
}

export const RefPointer: React.FC<RefPointerProps> = ({
  branchTips,
  tags = [],
  remoteTips = [],
  isHead,
  x,
  y,
}) => {
  const remoteTracksUnlocked = useAppStore((s) => s.unlockedPanels.remoteTracks);
  const visibleRemoteTips = remoteTracksUnlocked ? remoteTips : [];

  const totalItems = branchTips.length + tags.length + visibleRemoteTips.length + (isHead ? 1 : 0);

  return (
    <div
      className="absolute flex flex-col gap-1.5 items-center pointer-events-none transform -translate-x-1/2 select-none"
      style={{
        left: `${x}px`,
        top: `${y - 48 - totalItems * 28}px`,
      }}
    >
      {/* HEAD Beacon Indicator */}
      {isHead && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black shadow-lg animate-head-beacon"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-warm) 25%, transparent)',
            color: 'var(--accent-warm)',
            border: '1.5px solid var(--accent-warm)',
            boxShadow: '0 0 16px var(--accent-warm)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping inline-block"
            style={{ backgroundColor: 'var(--accent-warm)' }}
          />
          HEAD
        </motion.div>
      )}

      {/* Local Branch Tips */}
      {branchTips.map((branch) => {
        const isMain = branch === 'main' || branch === 'master';
        const colorVar = isMain ? 'var(--branch-main)' : 'var(--branch-feat)';
        return (
          <motion.div
            key={branch}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-md flex items-center gap-1.5"
            style={{
              backgroundColor: `color-mix(in srgb, ${colorVar} 22%, transparent)`,
              color: colorVar,
              border: `1.5px solid ${colorVar}`,
              boxShadow: `0 2px 10px rgba(0,0,0,0.3)`,
            }}
          >
            <span className="opacity-90">🌿</span>
            <span>{branch}</span>
          </motion.div>
        );
      })}

      {/* Remote Branch Tips (Only when unlocked) */}
      {visibleRemoteTips.map((rBranch) => (
        <motion.div
          key={rBranch}
          initial={{ y: 4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-900/90 text-slate-300 border border-dashed border-slate-600 shadow"
        >
          ☁️ {rBranch}
        </motion.div>
      ))}

      {/* Tags */}
      {tags.map((tag) => (
        <motion.div
          key={tag}
          className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent-success) 20%, transparent)',
            color: 'var(--accent-success)',
            border: '1px solid var(--accent-success)',
          }}
        >
          🏷️ {tag}
        </motion.div>
      ))}

      {/* Downward Pointer Triangle */}
      <div
        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] opacity-80 mt-0.5"
        style={{
          borderTopColor: 'var(--branch-main)',
        }}
      />
    </div>
  );
};
