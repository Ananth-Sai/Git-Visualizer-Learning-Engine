'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';

export const SoundToggle: React.FC = () => {
  const { isMuted, toggleSound } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="p-2 rounded-xl border bg-slate-950/60 border-white/5 text-slate-500"
        aria-label="Sound Toggle"
      >
        <VolumeX size={15} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleSound}
      className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
        isMuted
          ? 'bg-slate-950/60 border-white/5 text-slate-500 hover:text-slate-300'
          : 'bg-sky-500/20 border-sky-400/30 text-sky-300 shadow-sm'
      }`}
      title={isMuted ? 'Unmute Tactile Sound FX' : 'Mute Tactile Sound FX'}
      aria-label="Toggle Sound Effects"
    >
      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
    </button>
  );
};
