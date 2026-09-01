'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TermIcon, Play, Copy, Check, Sparkles, HelpCircle, CornerDownLeft, RotateCcw, ExternalLink, Compass } from 'lucide-react';
import { COMMAND_HELP_DATA, CommandHelpItem } from '../../core/curriculum/commandHelpData';
import { MiniVisualDiagram } from './MiniVisualDiagram';
import Link from 'next/link';

interface HelpTerminalProps {
  activeQueryCommand?: string;
  onClearActiveQuery?: () => void;
}

interface TerminalLogLine {
  id: string;
  type: 'prompt' | 'output' | 'success' | 'system' | 'error';
  text: string;
}

export const HelpTerminal: React.FC<HelpTerminalProps> = ({
  activeQueryCommand,
  onClearActiveQuery,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [activeItem, setActiveItem] = useState<CommandHelpItem | null>(COMMAND_HELP_DATA[0]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogLine[]>([
    { id: '1', type: 'system', text: 'Fluid Git Terminal Shell v1.0.0 (x86_64-engine)' },
    { id: '2', type: 'system', text: 'Type any Git command or flag below, or click items to simulate output.' },
    { id: '3', type: 'prompt', text: '$ git status' },
    { id: '4', type: 'output', text: `On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\tmodified:   src/auth.ts\n\nno changes added to commit (use "git add")` },
  ]);
  const [copied, setCopied] = useState(false);
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalScrollBoxRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ONLY the internal terminal box, NOT the whole browser page
  useEffect(() => {
    if (terminalScrollBoxRef.current) {
      terminalScrollBoxRef.current.scrollTop = terminalScrollBoxRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Auto-execute when passed from Cheat Sheet
  useEffect(() => {
    if (activeQueryCommand) {
      handleAutoType(activeQueryCommand);
    }
  }, [activeQueryCommand]);

  const handleAutoType = (targetCmd: string) => {
    setIsTypingAnimation(true);
    setInputVal('');
    let currentIndex = 0;
    const query = targetCmd.startsWith('git ') || targetCmd.startsWith('help ') ? targetCmd : `git ${targetCmd}`;

    const timer = setInterval(() => {
      if (currentIndex <= query.length) {
        setInputVal(query.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsTypingAnimation(false);
        executeCommand(query);
      }
    }, 24);
  };

  const executeCommand = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setTerminalLogs([
        { id: String(Date.now()), type: 'system', text: 'Terminal cleared. Type "help" or any Git command.' },
      ]);
      setInputVal('');
      return;
    }

    const clean = trimmed.toLowerCase().replace(/^help\s+/, '').replace(/^man\s+/, '');
    const uid = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Find matching command in dictionary
    const matched = COMMAND_HELP_DATA.find((item) => {
      const bareCmd = item.command.toLowerCase().replace(/^git\s+/, '');
      const fullCmd = item.command.toLowerCase();
      return (
        clean === bareCmd ||
        clean === fullCmd ||
        item.tags.includes(clean) ||
        clean.includes(bareCmd)
      );
    });

    if (matched) {
      setActiveItem(matched);
      setTerminalLogs((prev) => [
        ...prev.slice(-18),
        { id: uid(), type: 'prompt', text: `$ ${trimmed}` },
        { id: uid(), type: 'output', text: matched.sampleOutput },
        { id: uid(), type: 'success', text: `✔ [STATE IMPACT]: ${matched.stateEffect}` },
      ]);
    } else {
      setTerminalLogs((prev) => [
        ...prev.slice(-18),
        { id: uid(), type: 'prompt', text: `$ ${trimmed}` },
        { id: uid(), type: 'error', text: `Command '${trimmed}' executed. Try: git add, git commit, git rebase, git status` },
      ]);
    }

    setInputVal('');
    if (onClearActiveQuery) onClearActiveQuery();
  };

  const handleFlagClick = (flag: string) => {
    if (!activeItem) return;
    const combined = `${activeItem.command} ${flag}`;
    handleAutoType(combined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTypingAnimation) return;
    executeCommand(inputVal);
  };

  const handleCopyCommand = () => {
    if (!activeItem) return;
    navigator.clipboard.writeText(activeItem.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleClearTerminal = () => {
    setTerminalLogs([
      { id: `clear-${Date.now()}`, type: 'system', text: 'Terminal buffer cleared. Ready for input.' },
    ]);
  };

  const quickPills = ['git add', 'git commit', 'git status', 'git rebase', 'git stash', 'git reflog'];

  return (
    <div id="help-terminal-root" className="rounded-2xl border border-white/10 glass-panel-elevated shadow-2xl overflow-hidden">
      {/* Top Terminal Chrome Bar */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/40" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/40" />
          </div>
          <TermIcon size={15} className="text-sky-400" />
          <span className="font-mono text-xs font-semibold text-slate-300">
            git-interactive-shell ~ {activeItem ? activeItem.command : 'live'}
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline">Quick chips:</span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => handleAutoType(pill)}
              disabled={isTypingAnimation}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 hover:bg-sky-500/20 hover:text-sky-300 text-slate-300 border border-white/10 transition cursor-pointer"
            >
              {pill}
            </button>
          ))}
          <button
            onClick={handleClearTerminal}
            title="Clear Terminal Output"
            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition ml-1"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Left: REAL Color-Coded Unix Terminal Output (6 cols) */}
        <div className="lg:col-span-6 bg-slate-950/95 p-4 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between font-mono text-xs shadow-inner">
          <div ref={terminalScrollBoxRef} className="space-y-2 overflow-y-auto max-h-[380px] lg:max-h-[420px] pr-1.5 scroll-smooth">
            {terminalLogs.map((log) => {
              if (log.type === 'prompt') {
                return (
                  <div key={log.id} className="text-sky-300 font-bold flex items-center gap-1 pt-1.5 border-t border-white/5">
                    <span className="text-emerald-400">dev@fluid-git:~/repo</span>
                    <span className="text-slate-500">$</span>
                    <span className="text-white">{log.text.replace(/^\$\s*/, '')}</span>
                  </div>
                );
              }
              if (log.type === 'success') {
                return (
                  <div key={log.id} className="text-emerald-400 font-semibold text-[11px] bg-emerald-950/30 p-2 rounded border border-emerald-500/20 leading-relaxed">
                    {log.text}
                  </div>
                );
              }
              if (log.type === 'system') {
                return (
                  <div key={log.id} className="text-slate-400 text-[11px] leading-relaxed">
                    {log.text}
                  </div>
                );
              }
              if (log.type === 'error') {
                return (
                  <div key={log.id} className="text-rose-400 text-[11.5px] leading-relaxed">
                    {log.text}
                  </div>
                );
              }
              // Standard output
              return (
                <div key={log.id} className="text-slate-300 whitespace-pre-wrap leading-relaxed text-[11px] pl-2 border-l border-white/10">
                  {log.text}
                </div>
              );
            })}
          </div>

          {/* CLI Input Form */}
          <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
            <span className="text-emerald-400 font-bold">$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type any git command or flag (e.g. git rebase, git stash pop, clear)..."
              disabled={isTypingAnimation}
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isTypingAnimation || !inputVal.trim()}
              className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <span>Run</span>
              <CornerDownLeft size={11} />
            </button>
          </form>
        </div>

        {/* Right: Interactive Inspector, Mini Visual Diagram & Clickable Flags (6 cols) */}
        {activeItem ? (
          <div className="lg:col-span-6 p-5 lg:p-6 space-y-5 bg-slate-900/40 overflow-y-auto max-h-[500px]">
            {/* Header with Badges & Try in Sandbox Action */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    {activeItem.categoryLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      activeItem.safetyLevel === 'safe'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : activeItem.safetyLevel === 'caution'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {activeItem.safetyLevel}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-mono">
                  {activeItem.command}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/playground?cmd=${encodeURIComponent(
                    activeItem.sampleExecution ? activeItem.sampleExecution.replace(/^\$\s*/, '') : activeItem.command
                  )}`}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-500 hover:brightness-110 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-md shadow-sky-500/20"
                >
                  <Sparkles size={12} />
                  <span>Try in Sandbox 🚀</span>
                </Link>

                <button
                  onClick={handleCopyCommand}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Command"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* 1. What It Does */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                1. What It Does
              </span>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                {activeItem.whatItDoes}
              </p>
            </div>

            {/* 2. Mini Visual Topology Diagram */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400">
                2. Visual Graph &amp; State Topology
              </span>
              <MiniVisualDiagram commandId={activeItem.id} />
            </div>

            {/* 3. Clickable Key Flags & Options */}
            {activeItem.commonFlags.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    3. Key Flags &amp; Options (Click to Simulate)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Click flag to run ⚡</span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {activeItem.commonFlags.map((flagItem) => (
                    <button
                      key={flagItem.flag}
                      onClick={() => handleFlagClick(flagItem.flag)}
                      className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-sky-950/40 border border-white/5 hover:border-sky-400/40 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-left transition cursor-pointer group"
                    >
                      <code className="text-amber-300 font-mono font-bold shrink-0 group-hover:text-sky-300 transition">
                        {flagItem.flag}
                      </code>
                      <span className="text-slate-300 text-[11.5px] leading-relaxed font-sans flex-1">
                        {flagItem.description}
                      </span>
                      <span className="text-[10px] font-mono text-sky-400 opacity-0 group-hover:opacity-100 transition shrink-0">
                        Run &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-6 p-8 flex flex-col items-center justify-center text-center text-slate-400">
            <HelpCircle size={32} className="text-sky-400 mb-2 opacity-50" />
            <p className="text-sm">Type a command in the terminal or pick any cheat sheet item.</p>
          </div>
        )}
      </div>
    </div>
  );
};
