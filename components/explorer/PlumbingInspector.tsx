'use client';

import React, { useState } from 'react';
import { Layers, ArrowRight, ArrowLeft, RefreshCw, GitCommit, HardDrive, Server, FileCode, CheckCircle2 } from 'lucide-react';

interface PlumbingAction {
  id: string;
  command: string;
  label: string;
  activeFrom: 'working' | 'staging' | 'local' | 'remote';
  activeTo: 'working' | 'staging' | 'local' | 'remote';
  direction: 'forward' | 'backward' | 'bi-directional';
  summary: string;
  whatItDoes: string;
  pointersMoved: string;
  statusDiff: {
    before: string;
    after: string;
  };
}

const PLUMBING_ACTIONS: PlumbingAction[] = [
  {
    id: 'git-add',
    command: 'git add <file>',
    label: 'Stage Files (git add)',
    activeFrom: 'working',
    activeTo: 'staging',
    direction: 'forward',
    summary: 'Working Directory ➔ Staging Area (Index)',
    whatItDoes: 'Creates SHA blob objects in `.git/objects` and registers their paths in `.git/index`.',
    pointersMoved: 'None. HEAD stays untouched.',
    statusDiff: {
      before: `Untracked files:\n  (use "git add <file>..." to include)\n\tsrc/auth.ts`,
      after: `Changes to be committed:\n  (use "git restore --staged <file>...")\n\tnew file:   src/auth.ts`,
    },
  },
  {
    id: 'git-commit',
    command: 'git commit -m "<msg>"',
    label: 'Commit Snapshot (git commit)',
    activeFrom: 'staging',
    activeTo: 'local',
    direction: 'forward',
    summary: 'Staging Area ➔ Local Repository (HEAD)',
    whatItDoes: 'Packs staged index into a commit object tree and advances branch pointer + HEAD forward.',
    pointersMoved: 'HEAD and current branch advance to new commit SHA (e.g. 7f8a12e).',
    statusDiff: {
      before: `Changes to be committed:\n\tmodified:   src/auth.ts`,
      after: `On branch feature/auth\nnothing to commit, working tree clean`,
    },
  },
  {
    id: 'git-restore-staged',
    command: 'git restore --staged <file>',
    label: 'Unstage Files (git restore)',
    activeFrom: 'staging',
    activeTo: 'working',
    direction: 'backward',
    summary: 'Staging Area ➔ Working Directory',
    whatItDoes: 'Removes file reference from the index while keeping modified text in working directory.',
    pointersMoved: 'None.',
    statusDiff: {
      before: `Changes to be committed:\n\tmodified:   src/auth.ts`,
      after: `Changes not staged for commit:\n\tmodified:   src/auth.ts`,
    },
  },
  {
    id: 'git-push',
    command: 'git push origin <branch>',
    label: 'Push Upstream (git push)',
    activeFrom: 'local',
    activeTo: 'remote',
    direction: 'forward',
    summary: 'Local Repository ➔ Remote Server (origin)',
    whatItDoes: 'Transfers local commit objects to GitHub and updates `refs/remotes/origin/<branch>` and remote HEAD.',
    pointersMoved: 'Remote branch reference advances to match local branch SHA.',
    statusDiff: {
      before: `Your branch is ahead of 'origin/main' by 1 commit.`,
      after: `Your branch is up to date with 'origin/main'.`,
    },
  },
  {
    id: 'git-fetch',
    command: 'git fetch origin',
    label: 'Fetch Commits (git fetch)',
    activeFrom: 'remote',
    activeTo: 'local',
    direction: 'backward',
    summary: 'Remote Server ➔ Local Remote-Tracking Ref',
    whatItDoes: 'Downloads commits and updates `origin/main` without touching your working files or local branches.',
    pointersMoved: '`origin/main` updates to remote tip; local `main` and HEAD stay unchanged.',
    statusDiff: {
      before: `Your branch is up to date with 'origin/main'.`,
      after: `Your branch is behind 'origin/main' by 2 commits, and can be fast-forwarded.`,
    },
  },
];

export const PlumbingInspector: React.FC = () => {
  const [selectedActionId, setSelectedActionId] = useState<string>('git-add');

  const action = PLUMBING_ACTIONS.find((a) => a.id === selectedActionId) || PLUMBING_ACTIONS[0];

  const zones = [
    {
      id: 'working',
      title: '1. Working Tree',
      subtitle: 'Unstaged Files on Disk',
      icon: FileCode,
      color: '#38bdf8',
    },
    {
      id: 'staging',
      title: '2. Staging Area',
      subtitle: 'The Index (.git/index)',
      icon: Layers,
      color: '#fbbf24',
    },
    {
      id: 'local',
      title: '3. Local Repo',
      subtitle: 'HEAD & Commit Store',
      icon: GitCommit,
      color: '#c084fc',
    },
    {
      id: 'remote',
      title: '4. Remote Origin',
      subtitle: 'GitHub / GitLab Hub',
      icon: Server,
      color: '#34d399',
    },
  ];

  return (
    <div className="p-6 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-sky-400" />
            <h3 className="text-base sm:text-lg font-bold text-white font-sans">
              4-Zone Plumbing &amp; Data Flow Inspector
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Visualize how Git moves data and pointers across the 4 architectural layers.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {PLUMBING_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedActionId(a.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                selectedActionId === a.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {a.command.split(' ')[1] || a.command}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Interactive Zone Boxes with Data Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative">
        {zones.map((zone, idx) => {
          const Icon = zone.icon;
          const isSource = action.activeFrom === zone.id;
          const isTarget = action.activeTo === zone.id;
          const isHighlighted = isSource || isTarget;

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] relative ${
                isHighlighted
                  ? 'bg-slate-900/90 shadow-xl'
                  : 'bg-slate-950/40 border-white/5 opacity-70'
              }`}
              style={{
                borderColor: isSource
                  ? '#38bdf8'
                  : isTarget
                  ? '#c084fc'
                  : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isHighlighted
                  ? `0 10px 25px -5px ${zone.color}25`
                  : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${zone.color}20`, color: zone.color }}
                >
                  <Icon size={16} />
                </div>
                {isSource && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 animate-pulse">
                    SOURCE (FROM)
                  </span>
                )}
                {isTarget && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 animate-pulse">
                    TARGET (TO)
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-white font-sans">{zone.title}</h4>
                <p className="text-[11px] text-slate-400 font-sans">{zone.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Flow Breakdown & Status Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-white/5">
        {/* Left: What happens under the hood (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                Command Operation
              </span>
              <code className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded">
                $ {action.command}
              </code>
            </div>
            <div className="text-xs font-mono text-purple-300 font-semibold">{action.summary}</div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1 border-t border-white/5">
              {action.whatItDoes}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Pointer Movement (HEAD / Refs)
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {action.pointersMoved}
            </p>
          </div>
        </div>

        {/* Right: Before vs After git status diff (6 cols) */}
        <div className="lg:col-span-6 space-y-3 font-mono text-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            git status State Impact (Before vs After)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Before */}
            <div className="p-3.5 rounded-xl bg-black/70 border border-white/5 space-y-1.5">
              <span className="text-[10px] font-bold text-rose-400 block">BEFORE RUNNING</span>
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {action.statusDiff.before}
              </pre>
            </div>

            {/* After */}
            <div className="p-3.5 rounded-xl bg-black/70 border border-emerald-500/20 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-400 block">AFTER RUNNING</span>
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {action.statusDiff.after}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
