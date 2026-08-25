'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RenderNode } from '../../core/engine/PathTopology';
import { useAppStore } from '../../core/engine/StateManager';

interface CommitNodeProps {
  node: RenderNode;
  onSelect?: (node: RenderNode) => void;
}

export const CommitNode: React.FC<CommitNodeProps> = ({ node, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const executeCommand = useAppStore((s) => s.executeCommand);

  const isMain = node.lane === 0;
  const isHead = node.isHead;

  const handleNodeClick = () => {
    if (onSelect) {
      onSelect(node);
    } else {
      executeCommand(`git switch --detach ${node.id}`);
    }
  };

  const branchColor = isMain ? 'var(--branch-main)' : 'var(--branch-feat)';

  return (
    <div
      className="absolute group z-10 flex flex-col items-center"
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Pulse ring on active HEAD */}
      {isHead && (
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-3 rounded-full pointer-events-none"
          style={{
            border: '2px solid var(--branch-main)',
            boxShadow: '0 0 16px var(--glow-beacon)',
          }}
        />
      )}

      {/* Main Node Circle */}
      <motion.button
        whileHover={{ scale: 1.18 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleNodeClick}
        aria-label={`Commit ${node.id}: ${node.commit.message}`}
        className="w-12 h-12 rounded-full flex items-center justify-center font-mono text-xs font-black shadow-xl transition-all duration-150 cursor-pointer"
        style={{
          backgroundColor: isHead ? 'var(--branch-main)' : 'var(--bg-surface)',
          color: isHead ? 'var(--bg-base)' : branchColor,
          border: isHead ? '2px solid #ffffff' : `2.5px solid ${branchColor}`,
          boxShadow: isHead ? '0 0 26px var(--glow-beacon)' : '0 4px 14px rgba(0,0,0,0.4)',
        }}
      >
        {node.id.slice(0, 4)}
      </motion.button>

      {/* Inline Commit Message Label below node */}
      <div className="mt-2 text-center pointer-events-none select-none max-w-[130px]">
        <span
          className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-sans font-medium truncate max-w-[130px] shadow"
          style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
          }}
        >
          {node.commit.message}
        </span>
      </div>

      {/* Hover Info Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-64 p-3.5 rounded-2xl glass-panel-elevated shadow-2xl text-xs z-50 pointer-events-none"
            style={{
              border: `1px solid ${branchColor}`,
              boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px var(--glow-beacon)`,
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
              <span
                className="font-mono font-bold flex items-center gap-1"
                style={{ color: branchColor }}
              >
                <span>commit</span> {node.id}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(node.commit.author.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="font-medium text-slate-100 mb-2 leading-relaxed font-sans">
              &quot;{node.commit.message}&quot;
            </p>
            <div className="space-y-1 font-mono text-[10px] text-slate-300">
              <div className="flex justify-between">
                <span>Author:</span>
                <span className="font-semibold text-slate-100">{node.commit.author.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Tree SHA:</span>
                <span className="text-slate-300">{node.commit.tree.slice(0, 7)}</span>
              </div>
              {node.commit.parents.length > 0 && (
                <div className="flex justify-between">
                  <span>Parent(s):</span>
                  <span className="text-slate-300">
                    {node.commit.parents.map((p) => p.slice(0, 7)).join(', ')}
                  </span>
                </div>
              )}
            </div>
            <div
              className="mt-2.5 pt-1.5 border-t border-white/10 text-[9px] text-center font-sans font-semibold"
              style={{ color: branchColor }}
            >
              Click node to checkout (Detached HEAD)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
