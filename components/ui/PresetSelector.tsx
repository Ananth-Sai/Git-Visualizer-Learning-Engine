'use client';

import React from 'react';
import { Package, Sparkles } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { createInitialRepository, commit, createBranch, switchBranchOrCommit } from '../../core/engine/GitReducer';
import { GitRepositoryState } from '../../core/types';

export const PresetSelector: React.FC = () => {
  const { setRepo, selectLesson } = useAppStore();

  const loadPreset = (presetKey: string) => {
    selectLesson(null);
    let state = createInitialRepository();

    switch (presetKey) {
      case 'diverged': {
        state = commit(state, { message: 'feat: add database layer' }).state;
        state = createBranch(state, 'feature-auth').state;
        state = switchBranchOrCommit(state, 'feature-auth').state;
        state = commit(state, { message: 'auth: add token generator' }).state;
        state = switchBranchOrCommit(state, 'main').state;
        state = commit(state, { message: 'core: optimize query cache' }).state;
        break;
      }

      case 'conflict': {
        state.conflicts['config.ts'] = {
          path: 'config.ts',
          base: 'export const API_URL = "http://localhost:3000";',
          ours: 'export const API_URL = "https://prod.gitfluid.io";',
          theirs: 'export const API_URL = "https://staging.gitfluid.io";',
          isResolved: false,
        };
        state.workingTree['config.ts'] = {
          path: 'config.ts',
          content: 'export const API_URL = "http://localhost:3000";',
          stage: 'conflicted',
        };
        break;
      }

      case 'detached': {
        state = commit(state, { message: 'First major release v1.0' }).state;
        state = commit(state, { message: 'Experimental draft v2.0' }).state;
        const commits = Object.keys(state.objects).filter((k) => state.objects[k].type === 'commit');
        if (commits.length > 1) {
          state = switchBranchOrCommit(state, commits[1]).state;
        }
        break;
      }

      case 'messy': {
        state = commit(state, { message: 'feat: add user profile page' }).state;
        state = commit(state, { message: 'fix typo in header' }).state;
        state = commit(state, { message: 'fix another css typo' }).state;
        state = commit(state, { message: 'fix linting error' }).state;
        break;
      }

      default:
        state = createInitialRepository();
    }

    setRepo(state);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
      <Package size={13} className="text-slate-400 ml-1.5" />
      <select
        onChange={(e) => {
          if (e.target.value) loadPreset(e.target.value);
        }}
        defaultValue=""
        className="bg-transparent border-none outline-none text-slate-300 font-medium cursor-pointer text-xs pr-2"
      >
        <option value="" disabled className="bg-slate-900 text-slate-400">
          Load Scenario Preset...
        </option>
        <option value="diverged" className="bg-slate-900 text-slate-200">
          🌿 Diverged Feature (Merge vs Rebase)
        </option>
        <option value="conflict" className="bg-slate-900 text-slate-200">
          ⚠️ Pending Merge Conflict
        </option>
        <option value="detached" className="bg-slate-900 text-slate-200">
          🔭 Detached HEAD Inspection
        </option>
        <option value="messy" className="bg-slate-900 text-slate-200">
          🔀 Messy History (Squash Rebase)
        </option>
      </select>
    </div>
  );
};
