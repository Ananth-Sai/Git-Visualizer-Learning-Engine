'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TermIcon, Sparkles, Trash2, HelpCircle } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { CommandSuggestions } from './CommandSuggestions';

interface TerminalProps {
  className?: string;
  onAskAi?: (lastCommand?: string, error?: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ className = '', onAskAi }) => {
  const {
    terminalLogs,
    executeCommand,
    commandHistory,
    lastError,
    lastCommand,
    repo,
  } = useAppStore();

  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const logsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    executeCommand(inputVal);
    setInputVal('');
    setHistoryIndex(null);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      } else {
        setHistoryIndex(null);
        setInputVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setShowSuggestions(true);
    }
  };

  // Convert basic ANSI colors to HTML styling
  const formatAnsi = (text: string) => {
    return text
      .replace(/\x1b\[32m/g, '<span class="text-emerald-400 font-semibold">')
      .replace(/\x1b\[31m/g, '<span class="text-rose-400 font-semibold">')
      .replace(/\x1b\[33m/g, '<span class="text-amber-400 font-semibold">')
      .replace(/\x1b\[34m/g, '<span class="text-sky-400 font-semibold">')
      .replace(/\x1b\[0m/g, '</span>');
  };

  const currentBranch = repo.head.type === 'branch' ? repo.head.target : `detached:${repo.head.target.slice(0, 7)}`;

  return (
    <div className={`flex flex-col h-full rounded-2xl glass-panel-elevated overflow-hidden font-mono text-xs shadow-2xl ${className}`}>
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-400 font-medium ml-2 flex items-center gap-1.5">
            <TermIcon size={13} className="text-sky-400" />
            <span>git-cli</span>
            <span className="text-[10px] text-slate-500">({currentBranch})</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastError && (
            <button
              onClick={() => onAskAi?.(lastCommand || undefined, lastError || undefined)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium bg-purple-500/20 text-purple-300 border border-purple-400/40 hover:bg-purple-500/30 transition shadow"
            >
              <Sparkles size={12} className="text-purple-300 animate-pulse" />
              <span>Why did this fail?</span>
            </button>
          )}
          <button
            onClick={() => useAppStore.setState({ terminalLogs: [] })}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Clear Console"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Output Logs */}
      <div
        ref={logsContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-2 select-text leading-relaxed min-h-0"
      >
        {terminalLogs.map((log) => (
          <div key={log.id} className="text-left">
            {log.type === 'input' ? (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sky-400 font-bold">$</span>
                <span className="text-white font-medium">{log.text}</span>
              </div>
            ) : log.type === 'error' ? (
              <div className="text-rose-400 bg-rose-500/10 border-l-2 border-rose-500 px-2.5 py-1 rounded-r">
                {log.text}
              </div>
            ) : (
              <div
                className="text-slate-300 whitespace-pre-wrap font-mono"
                dangerouslySetInnerHTML={{ __html: formatAnsi(log.text) }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Command Input Bar */}
      <div className="relative p-2.5 bg-slate-950/80 border-t border-white/5">
        {showSuggestions && inputVal.length > 0 && (
          <CommandSuggestions
            query={inputVal}
            selectedIndex={suggestionIndex}
            onSelect={(cmd) => {
              setInputVal(cmd);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
          />
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-sky-400 font-bold text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (e.target.value.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type any git command (e.g. git commit -m 'feat', git switch -c new-branch)..."
            className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 font-mono text-xs"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 font-semibold transition"
          >
            Run
          </button>
        </form>
      </div>
    </div>
  );
};
