'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Key, Lock, Check, X, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { AiProvider } from '../../core/types';

export const ByokSettingsModal: React.FC = () => {
  const { isAiModalOpen, setAiModalOpen, aiSettings, setAiSettings } = useAppStore();

  const [provider, setProvider] = useState<AiProvider>(aiSettings.provider || 'default-free');
  const [apiKey, setApiKey] = useState<string>(aiSettings.customApiKey || '');
  const [model, setModel] = useState<string>(aiSettings.customModel || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isAiModalOpen) return null;

  const handleSave = () => {
    setAiSettings({
      provider,
      customApiKey: apiKey.trim() || undefined,
      customModel: model.trim() || undefined,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setAiModalOpen(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-lg rounded-2xl glass-panel-elevated shadow-2xl overflow-hidden border border-purple-500/30 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-purple-500/10 border-b border-purple-500/20">
            <div className="flex items-center gap-2.5">
              <Sparkles className="text-purple-400" size={20} />
              <h3 className="font-bold text-sm text-slate-100 font-sans">
                AI Coach & BYOK Key Settings
              </h3>
            </div>
            <button
              onClick={() => setAiModalOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4 text-xs">
            {/* Provider Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">AI Engine Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as AiProvider)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-purple-500 outline-none font-medium"
              >
                <option value="default-free">Default (Free Gemini Proxy - Zero Key Required)</option>
                <option value="google-gemini">Google Gemini (BYOK)</option>
                <option value="openai">OpenAI GPT-4o / Mini (BYOK)</option>
                <option value="anthropic">Anthropic Claude 3.5 Sonnet (BYOK)</option>
              </select>
            </div>

            {/* Custom API Key input if not default */}
            {provider !== 'default-free' && (
              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Custom {provider.toUpperCase()} API Key</span>
                  <span className="text-[10px] text-slate-400 font-normal">Client-side only</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 text-slate-500" size={14} />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${provider} API key...`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-purple-500 outline-none font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Security Guarantee Notice */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-slate-300 flex items-start gap-2.5 leading-relaxed text-[11px]">
              <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
              <div>
                <span className="font-bold text-emerald-400">Storage & privacy: </span>
                Your custom API key is kept in this browser&apos;s localStorage and is sent to the AI proxy only when you request coaching. The app does not persist it in a database.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-white/5">
            <span className="text-xs text-slate-400">
              Current: <span className="text-purple-400 font-bold capitalize">{provider}</span>
            </span>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/20"
            >
              <Check size={16} />
              <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
