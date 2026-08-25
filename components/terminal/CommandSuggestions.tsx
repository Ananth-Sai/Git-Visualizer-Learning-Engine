'use client';

import React from 'react';
import { SafetyBadge } from './SafetyBadge';
import { CommandSafety } from '../../core/types';

interface SuggestionItem {
  command: string;
  description: string;
  safety: CommandSafety;
}

const COMMON_SUGGESTIONS: SuggestionItem[] = [
  { command: 'git commit -m "msg"', description: 'Record changes to the repository', safety: 'safe' },
  { command: 'git switch -c feature', description: 'Create and switch to a new branch', safety: 'safe' },
  { command: 'git switch main', description: 'Switch to the main branch', safety: 'safe' },
  { command: 'git add .', description: 'Stage all modified files for commit', safety: 'safe' },
  { command: 'git status', description: 'Show working tree and staging status', safety: 'safe' },
  { command: 'git merge feature', description: 'Merge branch into current branch', safety: 'caution' },
  { command: 'git rebase main', description: 'Reapply commits on top of main', safety: 'caution' },
  { command: 'git rebase -i HEAD~3', description: 'Interactive rebase studio', safety: 'caution' },
  { command: 'git commit --amend', description: 'Amend the latest commit', safety: 'caution' },
  { command: 'git reset --soft HEAD~1', description: 'Undo commit keeping changes staged', safety: 'caution' },
  { command: 'git reset --hard HEAD~1', description: 'Discard latest commit and file changes', safety: 'destructive' },
  { command: 'git stash', description: 'Save uncommitted work in stash pocket', safety: 'safe' },
  { command: 'git stash pop', description: 'Restore previously stashed changes', safety: 'safe' },
  { command: 'git log --oneline', description: 'View linear commit history summary', safety: 'safe' },
  { command: 'git reflog', description: 'Inspect safety net chronological history', safety: 'safe' },
];

interface CommandSuggestionsProps {
  query: string;
  onSelect: (cmd: string) => void;
  selectedIndex?: number;
}

export const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({
  query,
  onSelect,
  selectedIndex = 0,
}) => {
  const filtered = COMMON_SUGGESTIONS.filter((item) =>
    item.command.toLowerCase().includes(query.toLowerCase().trim())
  ).slice(0, 5);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full max-w-lg rounded-xl glass-panel-elevated shadow-2xl p-1.5 z-50 border border-sky-500/20">
      <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-white/5 flex justify-between">
        <span>Autocomplete Suggestions</span>
        <span>Tab or Enter to select</span>
      </div>
      <div className="space-y-1 mt-1">
        {filtered.map((item, idx) => (
          <button
            key={item.command}
            onClick={() => onSelect(item.command)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
              idx === selectedIndex
                ? 'bg-sky-500/20 text-sky-200 border border-sky-500/30'
                : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sky-300">{item.command}</span>
              <span className="text-[10px] text-slate-400">{item.description}</span>
            </div>
            <SafetyBadge safety={item.safety} showText={false} />
          </button>
        ))}
      </div>
    </div>
  );
};
