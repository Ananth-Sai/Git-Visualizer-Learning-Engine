'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Send, X, Settings2, Loader2, Play } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { askAiCoach } from '../../core/ai/AiClientGateway';
import { buildContextSnapshot } from '../../core/ai/PromptBuilder';
import { LESSONS } from '../../core/curriculum/lessons';

export const AiCoachPill: React.FC = () => {
  const {
    repo,
    activeLessonId,
    lastError,
    lastCommand,
    aiSettings,
    setAiModalOpen,
    executeCommand,
  } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId);

  const handleAsk = async (customQ?: string) => {
    const q = customQ || question;
    setIsLoading(true);
    setAiAdvice(null);

    const context = buildContextSnapshot(
      repo,
      activeLesson?.title,
      activeLesson?.expectedGoalText,
      lastError || undefined,
      lastCommand || undefined,
      q || undefined
    );

    const response = await askAiCoach(context, aiSettings);
    setAiAdvice(response.advice);
    setIsLoading(false);
    setQuestion('');
  };

  const handleRunCommand = (cmd: string) => {
    executeCommand(cmd);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="w-80 sm:w-96 rounded-[28px] overflow-hidden flex flex-col text-slate-100 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.16) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -1.5px 1.5px 0 rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-purple-500/15 border-b border-purple-500/25">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                    boxShadow: 'inset 0 1px 1.5px rgba(255,255,255,0.6)',
                  }}
                >
                  <Sparkles size={15} className="text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white font-sans drop-shadow-sm">AI Git Coach</h4>
                  <span className="text-[10px] text-purple-200 font-mono">
                    {aiSettings.provider === 'default-free' ? 'Free Gemini Proxy' : aiSettings.provider}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAiModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Configure BYOK Key"
                >
                  <Settings2 size={15} />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Advice Body */}
            <div className="p-4 max-h-72 overflow-y-auto space-y-3 text-xs">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-purple-200">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="font-mono text-xs">Analyzing repository state...</span>
                </div>
              ) : aiAdvice ? (
                <div className="space-y-2">
                  <div
                    className="p-3.5 rounded-2xl text-slate-100 leading-relaxed whitespace-pre-wrap font-sans text-xs"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {aiAdvice}
                  </div>
                  {lastError && (
                    <button
                      onClick={() => handleAsk('Why did my last command fail?')}
                      className="text-[11px] text-purple-300 hover:text-purple-200 hover:underline font-mono"
                    >
                      ↻ Re-evaluate last error
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <p className="text-slate-300 text-xs">
                    Stuck or confused? Ask me anything about your current Git graph!
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAsk('What should I do next to complete this level?')}
                      className="p-2.5 rounded-xl text-slate-100 text-left text-xs transition cursor-pointer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                      }}
                    >
                      🎯 What should I do next?
                    </button>
                    {lastError && (
                      <button
                        onClick={() => handleAsk('Why did my last command fail?')}
                        className="p-2.5 rounded-xl text-rose-200 text-left text-xs transition cursor-pointer"
                        style={{
                          background: 'rgba(244, 63, 94, 0.15)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                        }}
                      >
                        ⚠️ Why did my last command fail?
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ask Input Bar */}
            <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/20">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask AI Coach a question..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder:text-slate-400 focus:border-purple-400 focus:bg-black/60 outline-none transition"
              />
              <button
                onClick={() => handleAsk()}
                disabled={isLoading}
                className="p-2 rounded-xl text-slate-950 font-bold transition-all duration-150 cursor-pointer hover:brightness-110 active:scale-95 shadow-md disabled:opacity-40"
                style={{
                  background: 'linear-gradient(180deg, #c084fc 0%, #a855f7 100%)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)',
                }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsExpanded(true);
              if (!aiAdvice) handleAsk();
            }}
            className="flex items-center gap-2.5 px-5 py-3 rounded-full font-sans font-bold text-xs text-white shadow-2xl transition cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(255, 255, 255, 0.15) 100%)',
              backdropFilter: 'blur(24px) saturate(200%)',
              WebkitBackdropFilter: 'blur(24px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              boxShadow: '0 12px 35px rgba(168, 85, 247, 0.3), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            <Sparkles size={15} className="text-purple-300 animate-pulse" />
            <span>Ask AI Coach</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
