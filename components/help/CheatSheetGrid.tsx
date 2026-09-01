'use client';

import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Play, Terminal as TermIcon, Sparkles, Filter } from 'lucide-react';
import { COMMAND_HELP_DATA, CommandHelpItem } from '../../core/curriculum/commandHelpData';

interface CheatSheetGridProps {
  onSelectCommand: (command: string) => void;
}

export const CheatSheetGrid: React.FC<CheatSheetGridProps> = ({ onSelectCommand }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Commands' },
    { id: 'getting-started', label: 'Setup & Config' },
    { id: 'staging-commits', label: 'Staging & Commits' },
    { id: 'branching-switching', label: 'Branching & Merging' },
    { id: 'inspecting-history', label: 'Inspecting & Logs' },
    { id: 'undoing-fixing', label: 'Undoing & Fixing' },
    { id: 'stashing-syncing', label: 'Stash & Remotes' },
  ];

  const filteredItems = useMemo(() => {
    return COMMAND_HELP_DATA.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.command.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.whatItDoes.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRunInTerminal = (cmd: string) => {
    onSelectCommand(cmd);
    const terminalEl = document.getElementById('help-terminal-root');
    if (terminalEl) {
      terminalEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span>Living Git Cheat Sheet Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Quick syntax reference with 1-click execution &amp; output simulation.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, flag, or tag..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-sky-500/50 transition"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cheat Sheet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => handleRunInTerminal(item.command)}
              className="group p-5 rounded-2xl glass-panel border border-white/5 hover:border-sky-500/30 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-400/20">
                    {item.categoryLabel.split('&')[0].trim()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCopy(item.id, item.command, e)}
                      title="Copy Command"
                      className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    >
                      {copiedId === item.id ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <code className="text-base font-bold text-white font-mono group-hover:text-sky-300 transition">
                    {item.command}
                  </code>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                  {item.summary}
                </p>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                  {item.whatItDoes}
                </p>
              </div>

              {/* Card Footer with Run Trigger */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 truncate max-w-[140px]">
                  {item.syntax.split(' ')[1] || item.command}
                </span>
                <span className="text-sky-400 group-hover:translate-x-0.5 flex items-center gap-1 font-semibold transition">
                  <TermIcon size={12} />
                  <span>Explain &amp; Output &rarr;</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-panel border border-white/5 text-slate-400">
          <p className="text-sm">No commands match &quot;{searchQuery}&quot;.</p>
        </div>
      )}
    </div>
  );
};
