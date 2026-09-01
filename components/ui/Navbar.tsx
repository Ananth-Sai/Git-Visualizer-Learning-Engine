'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GitBranch,
  Undo2,
  Redo2,
  BookOpen,
  Settings,
  Share2,
  Compass,
  LayoutGrid,
  Search,
  Sparkles,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { ThemeSelector } from './ThemeSelector';
import { SoundToggle } from './SoundToggle';
import { ShareGraphModal } from './ShareGraphModal';
import { ByokSettingsModal } from '../ai/ByokSettingsModal';
import { GlossaryDrawer } from '../explorer/GlossaryDrawer';
import { CommandPalette } from './CommandPalette';
import { ConflictResolver } from '../labs/ConflictResolver';
import { InteractiveRebase } from '../labs/InteractiveRebase';
import { DiffInspector } from '../dashboard/DiffInspector';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    undo,
    redo,
    pastRepoStates,
    futureRepoStates,
    setGlossaryOpen,
    setAiModalOpen,
    setCommandPaletteOpen,
    hydrateFromStorage,
  } = useAppStore();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  React.useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const navLinks = [
    { href: '/', label: 'Overview', icon: LayoutGrid },
    { href: '/roadmap', label: 'Roadmap Flowchart', icon: Compass },
    { href: '/curriculum', label: 'Practice Levels', icon: GitBranch },
    { href: '/playground', label: 'Sandbox', icon: Terminal },
    { href: '/explorer', label: 'Command Explorer', icon: BookOpen },
    { href: '/help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
              <GitBranch className="text-slate-950 font-bold" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-1.5 font-sans">
                Fluid Git <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">v1.0</span>
              </span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                Physics-Driven Learning Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-white/10 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-sky-400' : 'text-slate-400'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Power Tools & Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Undo / Redo */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-xl bg-slate-950/60 border border-white/5">
            <button
              onClick={undo}
              disabled={pastRepoStates.length === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={redo}
              disabled={futureRepoStates.length === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* Quick Command Palette Button (Cmd+K) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
          >
            <Search size={13} />
            <span className="text-[11px]">Quick Jump</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-[9px] font-mono text-slate-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Share Graph Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Share Sanitized Graph URL"
          >
            <Share2 size={13} className="text-sky-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Glossary Drawer Toggle */}
          <button
            onClick={() => setGlossaryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <BookOpen size={13} className="text-purple-400" />
            <span className="hidden sm:inline">Glossary</span>
          </button>

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Sound FX Toggle */}
          <SoundToggle />

          {/* AI Settings Trigger */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition"
            title="AI Coach & BYOK Key Settings"
            aria-label="AI Settings"
          >
            <Sparkles size={15} className="text-purple-400" />
          </button>
        </div>
      </header>

      {/* Global Modals */}
      <ShareGraphModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <ByokSettingsModal />
      <GlossaryDrawer />
      <CommandPalette />
      <ConflictResolver />
      <InteractiveRebase />
      <DiffInspector />
    </>
  );
};
