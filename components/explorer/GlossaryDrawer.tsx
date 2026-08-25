'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Search, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { GLOSSARY } from '../../core/curriculum/glossary';

export const GlossaryDrawer: React.FC = () => {
  const { isGlossaryOpen, setGlossaryOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  if (!isGlossaryOpen) return null;

  const tags = ['All', 'Core', 'Branching', 'Internals', 'Remotes', 'Advanced'];

  const filteredEntries = GLOSSARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || item.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-white/10 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <BookOpen className="text-sky-400" size={18} />
              <h2 className="font-bold text-sm text-slate-100 font-sans">
                Searchable Git Glossary A–Z
              </h2>
            </div>
            <button
              onClick={() => setGlossaryOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 space-y-3 border-b border-white/5 bg-slate-950/40">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Git terms (e.g. HEAD, Detached, Rebase)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-sky-500"
              />
            </div>

            {/* Tag Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Glossary List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                No glossary terms matched &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.term}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-sky-300 font-sans">{entry.term}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
                      {entry.tag}
                    </span>
                  </div>

                  <p className="text-slate-200 leading-relaxed font-sans">{entry.plainEnglish}</p>

                  <div className="p-2 rounded-lg bg-slate-900/80 text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-500 font-bold">Internals: </span>
                    {entry.technicalDetails}
                  </div>

                  {entry.safetyNotice && (
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <ShieldCheck size={12} />
                      <span>{entry.safetyNotice}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {entry.relatedCommands.map((cmd) => (
                      <span
                        key={cmd}
                        className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px] border border-sky-500/20"
                      >
                        {cmd}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
