'use client';

import React from 'react';
import { Wrench, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { RECIPE_SCENARIOS } from '../../core/curriculum/scenarios';
import { useAppStore } from '../../core/engine/StateManager';

export const RecipeScenarios: React.FC = () => {
  const { setRepo, selectRecipe, activeRecipeId } = useAppStore();

  const handleLaunchRecipe = (recipe: any) => {
    setRepo(recipe.initialState());
    selectRecipe(recipe.id);
  };

  return (
    <div className="p-5 rounded-2xl glass-panel-elevated shadow-2xl border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="text-amber-400" size={18} />
          <h2 className="font-bold text-sm text-slate-100 font-sans">
            Real-World Recipe Scenarios (&quot;I Messed Up, How Do I Fix It?&quot;)
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">3 Interactive Recipes</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {RECIPE_SCENARIOS.map((recipe) => (
          <div
            key={recipe.id}
            className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {recipe.category}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-100 font-sans">{recipe.title}</h3>
              <p className="text-slate-400 leading-relaxed">{recipe.problemDescription}</p>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Step-by-Step Fix:
                </span>
                {recipe.stepGuide.map((s, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-900 font-mono text-[10px] text-sky-300">
                    <div>{s.command}</div>
                    <div className="text-slate-400 text-[9px] font-sans mt-0.5">{s.explanation}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleLaunchRecipe(recipe)}
              className="w-full mt-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play size={13} />
              <span>Load Into Playground</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
