'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Compass, BookOpen, Palette, ArrowRight, X } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { LESSONS } from '../../core/curriculum/lessons';
import { useRouter } from 'next/navigation';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    selectLesson,
    setGlossaryOpen,
    setTheme,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const router = useRouter();

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredLessons = LESSONS.filter(
    (l) =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/20 backdrop-blur-2xl backdrop-saturate-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="w-full max-w-xl rounded-[28px] overflow-hidden border flex flex-col max-h-[70vh] text-slate-100"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(36px) saturate(200%)',
            WebkitBackdropFilter: 'blur(36px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            boxShadow: '0 30px 90px rgba(0, 0, 0, 0.65), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -1.5px 1.5px 0 rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/15 bg-white/5">
            <Search className="text-white" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search curriculum levels, tools, themes, or glossary..."
              className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-400 font-sans"
              autoFocus
            />
            <span className="text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
              ESC to close
            </span>
          </div>

          {/* Results List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {/* Quick Actions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation & Tools</span>
              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  setGlossaryOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/10 text-slate-100 transition cursor-pointer border border-transparent hover:border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={15} className="text-sky-300" />
                  <span className="font-medium">Open Git Glossary (A–Z Dictionary)</span>
                </div>
                <ArrowRight size={13} className="text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setCommandPaletteOpen(false);
                  router.push('/roadmap');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/10 text-slate-100 transition cursor-pointer border border-transparent hover:border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <Compass size={15} className="text-purple-300" />
                  <span className="font-medium">Curriculum Roadmap View</span>
                </div>
                <ArrowRight size={13} className="text-slate-400" />
              </button>
            </div>

            {/* Curriculum Levels */}
            <div className="space-y-1.5 pt-2.5 border-t border-white/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Interactive Levels ({filteredLessons.length})
              </span>
              {filteredLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    selectLesson(lesson.id);
                    setCommandPaletteOpen(false);
                    router.push('/curriculum');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-sky-500/15 text-slate-100 transition group cursor-pointer border border-transparent hover:border-sky-400/20"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-white group-hover:text-sky-200">
                      {lesson.title}
                    </span>
                    <span className="text-[11px] text-slate-300">{lesson.tierTitle} · {lesson.difficulty}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-sky-200 border border-white/10 group-hover:bg-sky-500/30">
                    Jump 🚀
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
