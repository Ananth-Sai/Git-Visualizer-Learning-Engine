'use client';

import React from 'react';
import { CommandSafety } from '../../core/types';

interface SafetyBadgeProps {
  safety: CommandSafety;
  showText?: boolean;
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({ safety, showText = true }) => {
  const config = {
    safe: {
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
      label: 'Safe',
    },
    caution: {
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
      label: 'Caution',
    },
    destructive: {
      color: 'bg-red-500/20 text-red-300 border-red-500/40',
      dot: 'bg-red-400',
      label: 'Destructive',
    },
  }[safety];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showText && config.label}
    </span>
  );
};
