'use client';

import React, { useState } from 'react';
import { Database, FileCode, GitCommit as GitCommitIcon, FolderTree } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';

export const InternalsInspector: React.FC = () => {
  const repo = useAppStore((s) => s.repo);
  const [selectedSha, setSelectedSha] = useState<string | null>(null);

  const objects = Object.entries(repo.objects);
  const commits = objects.filter(([_, obj]) => obj.type === 'commit');
  const trees = objects.filter(([_, obj]) => obj.type === 'tree');
  const blobs = objects.filter(([_, obj]) => obj.type === 'blob');

  const selectedObject = selectedSha ? repo.objects[selectedSha] : null;

  return (
    <div className="p-4 rounded-2xl glass-panel-elevated shadow-2xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-sky-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Git Object Database (.git/objects)
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {objects.length} total object{objects.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* 3 Categories: Commits, Trees, Blobs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Commits Column */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
          <div className="font-semibold text-sky-400 flex items-center gap-1.5 pb-1 border-b border-white/5">
            <GitCommitIcon size={14} />
            <span>Commits ({commits.length})</span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {commits.map(([sha, obj]: any) => (
              <button
                key={sha}
                onClick={() => setSelectedSha(sha)}
                className={`w-full text-left p-1.5 rounded-lg font-mono text-[11px] transition flex items-center justify-between ${
                  selectedSha === sha ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40' : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <span>{sha.slice(0, 7)}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[90px]">{obj.message}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trees Column */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
          <div className="font-semibold text-purple-400 flex items-center gap-1.5 pb-1 border-b border-white/5">
            <FolderTree size={14} />
            <span>Trees ({trees.length})</span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {trees.map(([sha]: any) => (
              <button
                key={sha}
                onClick={() => setSelectedSha(sha)}
                className={`w-full text-left p-1.5 rounded-lg font-mono text-[11px] transition flex items-center justify-between ${
                  selectedSha === sha ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40' : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <span>{sha.slice(0, 7)}</span>
                <span className="text-[10px] text-slate-500">tree</span>
              </button>
            ))}
          </div>
        </div>

        {/* Blobs Column */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
          <div className="font-semibold text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-white/5">
            <FileCode size={14} />
            <span>Blobs ({blobs.length})</span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {blobs.map(([sha]: any) => (
              <button
                key={sha}
                onClick={() => setSelectedSha(sha)}
                className={`w-full text-left p-1.5 rounded-lg font-mono text-[11px] transition flex items-center justify-between ${
                  selectedSha === sha ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <span>{sha.slice(0, 7)}</span>
                <span className="text-[10px] text-slate-500">blob</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Object Detail Panel */}
      {selectedObject && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/20 font-mono text-xs space-y-1.5">
          <div className="text-sky-400 font-bold flex items-center justify-between">
            <span>Object: {selectedSha}</span>
            <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-sky-500/10 border border-sky-400/20">
              {selectedObject.type}
            </span>
          </div>
          <pre className="text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto text-[11px] p-2 bg-slate-900/60 rounded">
            {JSON.stringify(selectedObject, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
