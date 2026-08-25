'use client';

import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useAppStore, ThemeName } from '../../core/engine/StateManager';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes: Array<{ id: ThemeName; name: string; dot: string }> = [
    { id: 'linear', name: 'Linear Gunmetal', dot: '#60a5fa' },
    { id: 'github', name: 'GitHub Dimmed', dot: '#539bf5' },
    { id: 'jetbrains', name: 'JetBrains Charcoal', dot: '#56a8f5' },
    { id: 'espresso', name: 'Warm Espresso', dot: '#e07a5f' },
    { id: 'sage', name: 'Sage Forest', dot: '#52b788' },
    { id: 'monochrome', name: 'Monochrome Zinc', dot: '#e4e4e7' },
  ];

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0];

  if (!mounted) {
    return (
      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs shadow-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]" />
        <span className="text-slate-200 font-semibold text-xs">Linear Gunmetal</span>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs shadow-sm hover:border-white/20 transition">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{
          backgroundColor: currentThemeObj.dot,
        }}
      />
      <select
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
        className="bg-transparent border-none outline-none text-slate-200 font-semibold cursor-pointer text-xs pr-1"
      >
        {themes.map((t) => (
          <option key={t.id} value={t.id} className="bg-zinc-900 text-zinc-200 font-medium py-1">
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};
