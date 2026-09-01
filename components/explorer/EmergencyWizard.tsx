'use client';

import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle2, Copy, Check, Terminal as TermIcon, ArrowRight, LifeBuoy } from 'lucide-react';

interface EmergencyScenario {
  id: string;
  title: string;
  category: 'lost-work' | 'wrong-branch' | 'merge-conflict' | 'secrets' | 'bad-commit';
  symptom: string;
  rescueCommand: string;
  whatItDoes: string;
  stepByStep: string[];
  expectedOutput: string;
  riskLevel: 'Safe (No Data Loss)' | 'Caution' | 'Requires Attention';
}

const EMERGENCIES: EmergencyScenario[] = [
  {
    id: 'deleted-branch',
    title: 'Accidentally Deleted a Branch with Unmerged Work',
    category: 'lost-work',
    symptom: 'You ran `git branch -D feature-login` thinking you didn\'t need it, but had unmerged commits you now need back.',
    rescueCommand: 'git reflog\ngit checkout -b feature-login-recovered <commit-sha>',
    whatItDoes: 'Git never deletes commits immediately; commits stay in the reflog database for 30-90 days. We find the lost commit hash in the reflog and attach a new branch pointer to it.',
    stepByStep: [
      'Run `git reflog` to find the last commit hash on your deleted branch (e.g. `7f8a12e`).',
      'Run `git checkout -b feature-recovered 7f8a12e` to create a fresh branch directly at that commit.',
      'All your deleted code and commits are instantly restored!',
    ],
    expectedOutput: `$ git reflog -n 3
7f8a12e (HEAD -> main) HEAD@{0}: checkout: moving from feature-login to main
7f8a12e HEAD@{1}: commit: feat(login): implement auth form

$ git checkout -b feature-login-recovered 7f8a12e
Switched to a new branch 'feature-login-recovered'`,
    riskLevel: 'Safe (No Data Loss)',
  },
  {
    id: 'committed-secrets',
    title: 'Accidentally Committed API Keys or Passwords',
    category: 'secrets',
    symptom: 'You committed a `.env` file with Stripe or AWS API secret keys to your local branch and have not pushed yet.',
    rescueCommand: 'git reset --soft HEAD~1\ngit restore --staged .env\necho ".env" >> .gitignore\ngit commit -m "feat: setup without secrets"',
    whatItDoes: 'Soft-resets the bad commit so your code stays in staging, un-stages the `.env` secret file, adds it to `.gitignore`, and re-commits cleanly.',
    stepByStep: [
      'Undo the commit while keeping all code staged: `git reset --soft HEAD~1`',
      'Un-stage the secret file: `git restore --staged .env`',
      'Add `.env` to `.gitignore` so Git never tracks it again.',
      'Re-commit your safe files with a clean message.',
    ],
    expectedOutput: `$ git reset --soft HEAD~1
(HEAD is now at previous commit. Changes kept in staging)

$ git restore --staged .env
Unstaged changes after reset:
M\t.env

$ git commit -m "feat: clean commit without sensitive keys"
[feature/api a94bc12] feat: clean commit without sensitive keys`,
    riskLevel: 'Safe (No Data Loss)',
  },
  {
    id: 'stuck-in-merge-conflict',
    title: 'Stuck in a Chaotic Merge Conflict and Want Out',
    category: 'merge-conflict',
    symptom: 'You ran `git merge main` and got conflict markers in 20 files. You want to cancel completely and return to safety.',
    rescueCommand: 'git merge --abort',
    whatItDoes: 'Instantly cancels the merge operation and cleanly restores your working tree and branch back to the exact state before `git merge` was invoked.',
    stepByStep: [
      'Simply type `git merge --abort` in your terminal.',
      'All conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) are removed automatically.',
      'Your working tree is 100% clean again.',
    ],
    expectedOutput: `$ git merge --abort
(Merge aborted. Branch restored to clean state prior to merge attempt)`,
    riskLevel: 'Safe (No Data Loss)',
  },
  {
    id: 'committed-to-main',
    title: 'Committed to `main` Instead of a Feature Branch',
    category: 'wrong-branch',
    symptom: 'You wrote 3 commits directly on local `main` that should have been on a new `feature/dashboard` branch.',
    rescueCommand: 'git branch feature/dashboard\ngit reset --hard origin/main',
    whatItDoes: 'Creates the new feature branch pointing to your new commits, then snaps local `main` back to match `origin/main` without losing any work.',
    stepByStep: [
      'Create feature branch with all 3 commits: `git branch feature/dashboard`',
      'Reset local main back to remote: `git reset --hard origin/main`',
      'Switch to your feature branch: `git switch feature/dashboard`',
    ],
    expectedOutput: `$ git branch feature/dashboard
(Branch created at current HEAD)

$ git reset --hard origin/main
HEAD is now at d4e8910 (origin/main) docs: update readme

$ git switch feature/dashboard
Switched to branch 'feature/dashboard'`,
    riskLevel: 'Caution',
  },
  {
    id: 'undo-last-pushed-commit',
    title: 'Pushed a Broken Commit to Shared Team Branch',
    category: 'bad-commit',
    symptom: 'You pushed a bug to `main` on GitHub that broke the build and teammates are already pulling from it.',
    rescueCommand: 'git revert <broken-commit-sha>\ngit push origin main',
    whatItDoes: 'Creates an inverse commit that cancels out the bug without rewriting history, making it completely safe and transparent for all teammates.',
    stepByStep: [
      'Find the bad commit SHA with `git log --oneline -n 3`.',
      'Run `git revert <sha>` to produce an inverse patch commit.',
      'Push the revert commit with `git push origin main`.',
    ],
    expectedOutput: `$ git revert 7f8a12e
[main 9d4e21a] Revert "feat(auth): broken token verification"
 1 file changed, 2 insertions(+), 18 deletions(-)

$ git push origin main
To https://github.com/company/core-api.git
   7f8a12e..9d4e21a  main -> main`,
    riskLevel: 'Safe (No Data Loss)',
  },
];

export const EmergencyWizard: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('deleted-branch');
  const [copied, setCopied] = useState(false);

  const scenario = EMERGENCIES.find((s) => s.id === selectedId) || EMERGENCIES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(scenario.rescueCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="p-6 rounded-2xl glass-panel-elevated border border-rose-500/20 shadow-2xl space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertOctagon size={13} />
            <span>Crisis &amp; Emergency Triage Wizard</span>
          </div>
          <h3 className="text-lg font-bold text-white font-sans">
            &quot;Oh Shit, Git!&quot; Recovery Protocols
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Pick a panic scenario to see exact rescue commands, explanations, and recovery output.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-emerald-400 font-semibold">
            {scenario.riskLevel}
          </span>
        </div>
      </div>

      {/* Scenario Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {EMERGENCIES.map((s) => {
          const isSelected = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`p-3.5 rounded-xl text-left border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-rose-500/15 border-rose-400/50 shadow-md shadow-rose-500/10'
                  : 'bg-slate-950/40 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="font-bold text-xs text-white font-sans line-clamp-2">
                {s.title}
              </div>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span>View Rescue Protocol</span>
                <ArrowRight size={10} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Triage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-white/5">
        {/* Left: Diagnosis & Steps (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Symptom */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
              Symptom / The Mistake
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {scenario.symptom}
            </p>
          </div>

          {/* What It Does Under The Hood */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
              Why This Works (Under The Hood)
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {scenario.whatItDoes}
            </p>
          </div>

          {/* Step-by-Step Guide */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Step-by-Step Rescue Procedure
            </span>
            <div className="space-y-2">
              {scenario.stepByStep.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-sans">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Rescue Command & Output Simulator (6 cols) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* Rescue Commands Box */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <LifeBuoy size={13} />
                <span>Execute Rescue Commands</span>
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono font-bold text-sky-300 whitespace-pre-wrap leading-relaxed">
              {scenario.rescueCommand}
            </pre>
          </div>

          {/* Expected Output Simulator */}
          <div className="p-4 rounded-xl bg-black/80 border border-purple-500/20 space-y-2 flex-1 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-purple-300 font-semibold text-[11px] flex items-center gap-1.5">
                <TermIcon size={13} />
                <span>Simulated Terminal Recovery Output</span>
              </span>
              <span className="text-[10px] text-emerald-400">Status: Recovered</span>
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px]">
              {scenario.expectedOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
