'use client';

import React, { useState } from 'react';
import { Sliders, Copy, Check, Terminal as TermIcon, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface FlagOption {
  flag: string;
  name: string;
  desc: string;
  safety: 'safe' | 'caution' | 'destructive';
}

interface CommandProfile {
  id: string;
  baseCmd: string;
  title: string;
  summary: string;
  flags: FlagOption[];
  generateResult: (activeFlags: string[]) => {
    assembledCommand: string;
    explanation: string;
    simulatedOutput: string;
  };
}

const COMMAND_PROFILES: CommandProfile[] = [
  {
    id: 'git-log',
    baseCmd: 'git log',
    title: 'git log (History Explorer)',
    summary: 'Customize how commit history is formatted and filtered.',
    flags: [
      { flag: '--oneline', name: 'One-line Format', desc: 'Compress each commit into a single abbreviated line.', safety: 'safe' },
      { flag: '--graph', name: 'ASCII Tree Graph', desc: 'Draw a visual graph of branches and merges.', safety: 'safe' },
      { flag: '--all', name: 'All Refs', desc: 'Show commits from all local branches and remote tracking tips.', safety: 'safe' },
      { flag: '--stat', name: 'File Statistics', desc: 'Display insertion and deletion counts per file.', safety: 'safe' },
      { flag: '-n 3', name: 'Limit to 3', desc: 'Show only the 3 most recent commits.', safety: 'safe' },
    ],
    generateResult: (active) => {
      const assembled = `git log ${active.join(' ')}`.trim();
      let output = '';
      if (active.includes('--graph') && active.includes('--oneline')) {
        output = `* 7f8a12e (HEAD -> feature/auth) feat(auth): add JWT middleware\n* 3b91c04 feat(auth): password hashing\n| * d4e8910 (main) docs: update readme\n|/  \n* 81a941f Initial commit`;
      } else if (active.includes('--oneline')) {
        output = `7f8a12e (HEAD -> feature/auth) feat(auth): add JWT middleware\n3b91c04 feat(auth): password hashing\n81a941f Initial commit`;
      } else if (active.includes('--stat')) {
        output = `commit 7f8a12ed94e21a089cb120938f\nAuthor: Alex Rivera <alex@dev.io>\nDate:   Wed Aug 26 10:30:00 2026\n\n    feat(auth): add JWT middleware\n\n src/auth.ts           | 14 +++++++++++---\n src/middleware/jwt.ts | 82 +++++++++++++++++++++++++++++++++++++++++++\n 2 files changed, 93 insertions(+), 3 deletions(-)`;
      } else {
        output = `commit 7f8a12ed94e21a089cb120938f (HEAD -> feature/auth)\nAuthor: Alex Rivera <alex@dev.io>\nDate:   Wed Aug 26 10:30:00 2026\n\n    feat(auth): add JWT middleware\n\ncommit 3b91c0481fa98012bc099182\nAuthor: Alex Rivera <alex@dev.io>\nDate:   Tue Aug 25 18:14:02 2026\n\n    feat(auth): password hashing`;
      }

      return {
        assembledCommand: assembled,
        explanation: `Executes commit inspection with ${active.length === 0 ? 'default verbose' : active.join(', ')} formatting.`,
        simulatedOutput: output,
      };
    },
  },
  {
    id: 'git-commit',
    baseCmd: 'git commit',
    title: 'git commit (Snapshot Engine)',
    summary: 'Control staging shortcuts, amending, and signatures.',
    flags: [
      { flag: '-m "feat: user profile"', name: 'Inline Message', desc: 'Supply commit message directly without editor prompt.', safety: 'safe' },
      { flag: '--amend', name: 'Amend Previous Commit', desc: 'Replace last commit with current staged index and new timestamp.', safety: 'caution' },
      { flag: '-a', name: 'Stage Tracked Files', desc: 'Automatically stage all modified tracked files before committing.', safety: 'safe' },
      { flag: '--no-edit', name: 'Keep Message', desc: 'Retain the previous commit message without changing it.', safety: 'safe' },
    ],
    generateResult: (active) => {
      const assembled = `git commit ${active.join(' ')}`.trim();
      const isAmend = active.includes('--amend');
      const isAutoStage = active.includes('-a');

      let output = '';
      if (isAmend) {
        output = `[feature/auth e941b22] feat(auth): add JWT middleware (amended)\n Date: Wed Aug 26 10:35:10 2026\n 2 files changed, 93 insertions(+), 3 deletions(-)`;
      } else {
        output = `[feature/auth 7f8a12e] feat: user profile\n 1 file changed, 24 insertions(+)\n create mode 100644 src/profile.ts`;
      }

      return {
        assembledCommand: assembled,
        explanation: isAmend
          ? 'Rewrites the most recent commit on the current branch to include newly staged updates.'
          : 'Packages current staged state into a new immutable commit object and advances HEAD.',
        simulatedOutput: output,
      };
    },
  },
  {
    id: 'git-reset',
    baseCmd: 'git reset',
    title: 'git reset (Time Travel & Rewind)',
    summary: 'Adjust where HEAD points and choose what happens to your files.',
    flags: [
      { flag: 'HEAD~1', name: 'Rewind 1 Commit', desc: 'Target the immediate previous parent commit.', safety: 'safe' },
      { flag: '--soft', name: 'Soft Mode', desc: 'Keep all changes staged in the Index ready to re-commit.', safety: 'safe' },
      { flag: '--mixed', name: 'Mixed Mode (Default)', desc: 'Unstage changes into working directory as modified files.', safety: 'safe' },
      { flag: '--hard', name: 'Hard Mode (Wipe)', desc: '⚠️ Overwrites working tree files completely! Discards uncommitted work.', safety: 'destructive' },
    ],
    generateResult: (active) => {
      const assembled = `git reset ${active.join(' ')}`.trim();
      const isHard = active.includes('--hard');
      const isSoft = active.includes('--soft');

      let output = '';
      if (isHard) {
        output = `HEAD is now at 3b91c04 feat(auth): password hashing\n(All uncommitted file edits were discarded)`;
      } else if (isSoft) {
        output = `(HEAD moved to 3b91c04. Changes from undone commit are staged and ready in Index)`;
      } else {
        output = `Unstaged changes after reset:\nM\tsrc/auth.ts\nM\tsrc/middleware/jwt.ts`;
      }

      return {
        assembledCommand: assembled,
        explanation: isHard
          ? '⚠️ Destructive reset: rewinds HEAD and wipes working files to match target commit.'
          : isSoft
          ? 'Safe reset: rewinds HEAD while keeping all code staged in index ready for amendment.'
          : 'Standard reset: rewinds HEAD and unstages changes to working directory for review.',
        simulatedOutput: output,
      };
    },
  },
  {
    id: 'git-stash',
    baseCmd: 'git stash',
    title: 'git stash (Work-in-Progress Shelf)',
    summary: 'Temporarily store dirty modifications away.',
    flags: [
      { flag: 'push', name: 'Push to Stack', desc: 'Save uncommitted modifications to the stash stack.', safety: 'safe' },
      { flag: '-m "WIP auth"', name: 'Name Stash', desc: 'Tag the stash entry with a descriptive title.', safety: 'safe' },
      { flag: '-u', name: 'Include Untracked', desc: 'Stash newly created untracked files alongside tracked modifications.', safety: 'safe' },
      { flag: 'pop', name: 'Pop Latest', desc: 'Apply and delete the newest stashed work from stack.', safety: 'safe' },
    ],
    generateResult: (active) => {
      const assembled = `git stash ${active.join(' ')}`.trim();
      const isPop = active.includes('pop');

      let output = '';
      if (isPop) {
        output = `On branch feature/auth\nChanges to be committed:\n\tmodified:   src/auth.ts\nDropped refs/stash@{0} (a91b2c4819)`;
      } else {
        output = `Saved working directory and index state WIP on feature/auth: 7f8a12e feat(auth): add JWT\nHEAD is now at 7f8a12e feat(auth): add JWT`;
      }

      return {
        assembledCommand: assembled,
        explanation: isPop
          ? 'Re-applies the most recently shelved work back into your working tree and clears it from stash history.'
          : 'Captures your dirty changes, clears working tree back to match HEAD, and stores state safely.',
        simulatedOutput: output,
      };
    },
  },
];

export const FlagBuilder: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('git-log');
  const [activeFlags, setActiveFlags] = useState<string[]>(['--oneline', '--graph']);
  const [copied, setCopied] = useState(false);

  const profile = COMMAND_PROFILES.find((p) => p.id === selectedProfileId) || COMMAND_PROFILES[0];

  const handleSelectProfile = (pId: string) => {
    setSelectedProfileId(pId);
    if (pId === 'git-log') setActiveFlags(['--oneline', '--graph']);
    else if (pId === 'git-commit') setActiveFlags(['-m "feat: user profile"']);
    else if (pId === 'git-reset') setActiveFlags(['HEAD~1', '--soft']);
    else if (pId === 'git-stash') setActiveFlags(['push', '-m "WIP auth"']);
  };

  const toggleFlag = (flag: string) => {
    setActiveFlags((prev) => {
      if (prev.includes(flag)) {
        return prev.filter((f) => f !== flag);
      } else {
        // Handle mutual exclusions (e.g., --soft vs --mixed vs --hard)
        if (flag === '--soft' || flag === '--mixed' || flag === '--hard') {
          const withoutResetModes = prev.filter((f) => f !== '--soft' && f !== '--mixed' && f !== '--hard');
          return [...withoutResetModes, flag];
        }
        if (flag === 'push' || flag === 'pop') {
          const withoutStashModes = prev.filter((f) => f !== 'push' && f !== 'pop');
          return [...withoutStashModes, flag];
        }
        return [...prev, flag];
      }
    });
  };

  const result = profile.generateResult(activeFlags);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.assembledCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="p-6 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-sky-400" />
            <h3 className="text-base sm:text-lg font-bold text-white font-sans">
              Interactive Flag Builder &amp; Output Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Toggle flags to see the live assembled syntax and simulated terminal stdout.
          </p>
        </div>

        {/* Command Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {COMMAND_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProfile(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                selectedProfileId === p.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {p.baseCmd}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Flag Toggles (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
              Select Flags &amp; Options
            </span>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{profile.summary}</p>
          </div>

          <div className="space-y-2.5">
            {profile.flags.map((item) => {
              const isActive = activeFlags.includes(item.flag);
              return (
                <div
                  key={item.flag}
                  onClick={() => toggleFlag(item.flag)}
                  className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 ${
                    isActive
                      ? 'bg-sky-500/15 border-sky-400/40 shadow-sm'
                      : 'bg-slate-950/50 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className={`text-xs font-mono font-bold ${isActive ? 'text-sky-300' : 'text-white'}`}>
                        {item.flag}
                      </code>
                      <span className="text-xs font-sans text-slate-300 font-medium">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug font-sans">{item.desc}</p>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold shrink-0 ${
                      item.safety === 'destructive'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.safety === 'caution'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.safety}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Assembled Command & Simulated Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Assembled Command Box */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                1. Assembled Command String
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-base font-mono font-bold text-sky-300 break-all">
              $ {result.assembledCommand}
            </div>
            <p className="text-xs text-slate-300 font-sans pt-1 border-t border-white/5 leading-relaxed">
              <span className="text-slate-400 font-mono text-[11px] font-semibold">Action: </span>
              {result.explanation}
            </p>
          </div>

          {/* Simulated Terminal Output */}
          <div className="p-4 rounded-xl bg-black/80 border border-purple-500/20 space-y-2 flex-1 flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <TermIcon size={14} className="text-purple-400" />
                <span className="text-purple-300 font-semibold text-[11px]">
                  2. Simulated Execution Output
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Live preview</span>
            </div>

            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed flex-1 overflow-x-auto pt-1">
              {result.simulatedOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
