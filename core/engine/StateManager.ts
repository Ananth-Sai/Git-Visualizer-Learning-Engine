import { create } from 'zustand';
import {
  GitRepositoryState,
  LessonObjective,
  UserAiSettings,
  UnlockedPanels,
  ParsedCommand,
  RecipeScenario,
} from '../types';
import {
  createInitialRepository,
  commit as commitAction,
  createBranch as branchAction,
  switchBranchOrCommit as switchAction,
  merge as mergeAction,
  rebase as rebaseAction,
  reset as resetAction,
  stageFile as stageAction,
  stashPush as stashPushAction,
  stashPop as stashPopAction,
} from './GitReducer';
import { LESSONS } from '../curriculum/lessons';
import { parseGitCommand } from '../parser/CommandParser';
import { soundFx } from './AudioEngine';

export interface TerminalLog {
  id: string;
  type: 'input' | 'output' | 'error' | 'pedagogical' | 'ai';
  text: string;
  timestamp: number;
}

export type ThemeName = 'linear' | 'github' | 'jetbrains' | 'espresso' | 'sage' | 'monochrome';

export interface AppState {
  // Git Repo State
  repo: GitRepositoryState;
  pastRepoStates: GitRepositoryState[];
  futureRepoStates: GitRepositoryState[];

  // Curriculum & Sandbox
  activeLessonId: string | null;
  completedLessonIds: string[];
  isCurrentSessionCompleted: boolean;
  activeRecipeId: string | null;
  lessonHistory: ParsedCommand[];

  // Progressive Disclosure
  unlockedPanels: UnlockedPanels;

  // Terminal & Command State
  terminalLogs: TerminalLog[];
  commandHistory: string[];
  lastError: string | null;
  lastCommand: string | null;

  // AI & Settings
  aiSettings: UserAiSettings;
  isAiModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  isGlossaryOpen: boolean;
  isConflictModalOpen: boolean;
  isRebaseModalOpen: boolean;
  isDiffModalOpen: boolean;
  diffFileTarget: string | null;

  // Theme & Sound
  theme: ThemeName;
  isMuted: boolean;

  // Actions
  setRepo: (repo: GitRepositoryState) => void;
  executeCommand: (rawInput: string) => { success: boolean; output?: string; error?: string };
  undo: () => void;
  redo: () => void;
  selectLesson: (lessonId: string | null) => void;
  markLessonComplete: (lessonId: string) => void;
  resetCurrentLesson: () => void;
  selectRecipe: (recipeId: string | null) => void;
  setTheme: (theme: ThemeName) => void;
  setAiSettings: (settings: Partial<UserAiSettings>) => void;
  toggleSound: () => void;
  hydrateFromStorage: () => void;

  // Modal toggles
  setAiModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setGlossaryOpen: (open: boolean) => void;
  setConflictModalOpen: (open: boolean) => void;
  setRebaseModalOpen: (open: boolean) => void;
  setDiffModalOpen: (open: boolean, file?: string) => void;
  resolveConflict: (filePath: string, resolvedContent: string) => void;
}

const STORAGE_KEY = 'GIT_FLOW_STATE_V1';

function loadPersistedProgress(): { completed: string[]; theme: ThemeName; ai: UserAiSettings } {
  if (typeof window === 'undefined') {
    return { completed: [], theme: 'linear', ai: { provider: 'default-free' } };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], theme: 'linear', ai: { provider: 'default-free' } };
    const parsed = JSON.parse(raw);
    const validThemes: ThemeName[] = ['linear', 'github', 'jetbrains', 'espresso', 'sage', 'monochrome'];
    const chosenTheme = validThemes.includes(parsed.theme) ? parsed.theme : 'linear';
    return {
      completed: parsed.completedLessonIds || [],
      theme: chosenTheme,
      ai: parsed.aiSettings || { provider: 'default-free' },
    };
  } catch {
    return { completed: [], theme: 'linear', ai: { provider: 'default-free' } };
  }
}

function savePersistedProgress(completed: string[], theme: ThemeName, ai: UserAiSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedLessonIds: completed,
        theme,
        aiSettings: ai,
      })
    );
  } catch {}
}

export const useAppStore = create<AppState>((set, get) => ({
  repo: createInitialRepository(),
  pastRepoStates: [],
  futureRepoStates: [],

  activeLessonId: null,
  completedLessonIds: [],
  isCurrentSessionCompleted: false,
  activeRecipeId: null,
  lessonHistory: [],

  unlockedPanels: {
    terminal: true,
    stagingInspector: true,
    internalsInspector: false,
    stashPocket: false,
    rebaseStudio: false,
    remoteTracks: false,
    conflictLab: false,
  },

  terminalLogs: [
    {
      id: 'init-log',
      type: 'output',
      text: 'Initialized Fluid Git Engine v1.0. Type `git help` or click buttons to begin.',
      timestamp: 0,
    },
  ],
  commandHistory: [],
  lastError: null,
  lastCommand: null,

  aiSettings: { provider: 'default-free' },
  isAiModalOpen: false,
  isCommandPaletteOpen: false,
  isGlossaryOpen: false,
  isConflictModalOpen: false,
  isRebaseModalOpen: false,
  isDiffModalOpen: false,
  diffFileTarget: null,

  theme: 'linear',
  isMuted: true,

  hydrateFromStorage: () => {
    if (typeof window === 'undefined') return;
    const persisted = loadPersistedProgress();
    const savedMuted = localStorage.getItem('GIT_FLOW_MUTED');
    set({
      completedLessonIds: persisted.completed,
      theme: persisted.theme,
      aiSettings: persisted.ai,
      isMuted: savedMuted !== null ? savedMuted === 'true' : true,
    });
    document.documentElement.setAttribute('data-theme', persisted.theme);
  },

  setRepo: (repo) => {
    const current = get().repo;
    set({
      repo,
      pastRepoStates: [current, ...get().pastRepoStates.slice(0, 19)],
      futureRepoStates: [],
    });
  },

  undo: () => {
    const { pastRepoStates, repo, futureRepoStates } = get();
    if (pastRepoStates.length === 0) return;
    const [previous, ...restPast] = pastRepoStates;
    set({
      repo: previous,
      pastRepoStates: restPast,
      futureRepoStates: [repo, ...futureRepoStates],
    });
  },

  redo: () => {
    const { futureRepoStates, repo, pastRepoStates } = get();
    if (futureRepoStates.length === 0) return;
    const [next, ...restFuture] = futureRepoStates;
    set({
      repo: next,
      pastRepoStates: [repo, ...pastRepoStates],
      futureRepoStates: restFuture,
    });
  },

  executeCommand: (rawInput: string) => {
    const { repo, activeLessonId, lessonHistory, pastRepoStates } = get();
    const parseResult = parseGitCommand(rawInput);

    if (parseResult.error || !parseResult.parsed) {
      const errorLog: TerminalLog = {
        id: `err-${Date.now()}`,
        type: 'error',
        text: parseResult.error || 'Syntax error',
        timestamp: Date.now(),
      };
      set({
        terminalLogs: [...get().terminalLogs, { id: `in-${Date.now()}`, type: 'input', text: rawInput, timestamp: Date.now() }, errorLog],
        lastError: parseResult.error || 'Syntax error',
        lastCommand: rawInput,
      });
      return { success: false, error: parseResult.error };
    }

    const cmd = parseResult.parsed;
    let nextRepo = { ...repo };
    let outputText = '';
    let isError = false;

    // Snapshot state for undo
    const newPast = [repo, ...pastRepoStates.slice(0, 19)];

    switch (cmd.command) {
      case 'init':
        nextRepo = createInitialRepository();
        outputText = 'Reinitialized existing Git repository in /workspace/.git/';
        break;

      case 'commit': {
        const msg = (cmd.flags['m'] as string) || (cmd.flags['message'] as string) || 'Update';
        const amend = !!cmd.flags['amend'];
        const res = commitAction(repo, { message: msg, amend });
        if (res.error) {
          isError = true;
          outputText = res.error;
        } else {
          nextRepo = res.state;
          outputText = `[${nextRepo.head.target} ${res.commitId}] ${msg}`;
          soundFx.playCommitClick();
        }
        break;
      }

      case 'branch': {
        if (cmd.args.length === 0) {
          // List branches
          const branches = Object.keys(repo.refs.heads)
            .map((b) => (b === repo.head.target ? `* \x1b[32m${b}\x1b[0m` : `  ${b}`))
            .join('\n');
          outputText = branches;
        } else if (cmd.flags['d'] || cmd.flags['D']) {
          const branchToDelete = (typeof cmd.flags['d'] === 'string' ? cmd.flags['d'] : typeof cmd.flags['D'] === 'string' ? cmd.flags['D'] : cmd.args[0]) as string;
          if (!branchToDelete || !repo.refs.heads[branchToDelete]) {
            isError = true;
            outputText = `error: branch '${branchToDelete}' not found.`;
          } else if (repo.head.type === 'branch' && repo.head.target === branchToDelete) {
            isError = true;
            outputText = `error: Cannot delete branch '${branchToDelete}' checked out at current directory.`;
          } else {
            const newHeads = { ...repo.refs.heads };
            delete newHeads[branchToDelete];
            nextRepo = {
              ...repo,
              refs: { ...repo.refs, heads: newHeads },
            };
            outputText = `Deleted branch ${branchToDelete} (was ${repo.refs.heads[branchToDelete].slice(0, 7)}).`;
            soundFx.playBranchChime();
          }
        } else {
          const branchName = cmd.args[0];
          const res = branchAction(repo, branchName);
          if (res.error) {
            isError = true;
            outputText = res.error;
          } else {
            nextRepo = res.state;
            outputText = `Branch '${branchName}' created. (Tip: run \`git switch ${branchName}\` to switch to it)`;
            soundFx.playBranchChime();
          }
        }
        break;
      }

      case 'cherry-pick': {
        const targetSha = cmd.args[0];
        if (!targetSha) {
          isError = true;
          outputText = 'fatal: specify a commit SHA to cherry-pick';
        } else {
          const targetObj = Object.values(repo.objects).find(
            (o) => o.type === 'commit' && o.id.startsWith(targetSha)
          ) as any;
          if (!targetObj) {
            isError = true;
            outputText = `fatal: bad revision '${targetSha}'`;
          } else {
            const res = commitAction(repo, { message: `Cherry-picked: ${targetObj.message || 'commit'}` });
            nextRepo = res.state;
            outputText = `[${nextRepo.head.target} ${res.commitId}] Cherry-picked: ${targetObj.message}`;
            soundFx.playCommitClick();
          }
        }
        break;
      }

      case 'revert': {
        const targetSha = cmd.args[0];
        if (!targetSha) {
          isError = true;
          outputText = 'fatal: specify a commit SHA to revert';
        } else {
          const targetObj = Object.values(repo.objects).find(
            (o) => o.type === 'commit' && o.id.startsWith(targetSha)
          ) as any;
          if (!targetObj) {
            isError = true;
            outputText = `fatal: bad revision '${targetSha}'`;
          } else {
            const res = commitAction(repo, { message: `Revert "${targetObj.message || 'commit'}"` });
            nextRepo = res.state;
            outputText = `[${nextRepo.head.target} ${res.commitId}] Revert "${targetObj.message}"`;
            soundFx.playCommitClick();
          }
        }
        break;
      }

      case 'tag': {
        const tagName = cmd.args[0] || (cmd.flags['a'] as string);
        if (!tagName || typeof tagName === 'boolean') {
          const existingTags = Object.keys(repo.refs.tags || {});
          outputText = existingTags.length > 0 ? existingTags.join('\n') : 'v1.0.0';
        } else {
          const currCommit =
            repo.head.type === 'branch'
              ? repo.refs.heads[repo.head.target]
              : repo.head.target;
          nextRepo = {
            ...repo,
            refs: {
              ...repo.refs,
              tags: { ...(repo.refs.tags || {}), [tagName]: currCommit },
            },
          };
          outputText = `Created release tag '${tagName}' at ${currCommit.slice(0, 7)}`;
          soundFx.playBranchChime();
        }
        break;
      }

      case 'switch':
      case 'checkout': {
        const createFlag = !!cmd.flags['c'] || !!cmd.flags['b'];
        const target = cmd.args[0] || (cmd.flags['c'] as string) || (cmd.flags['b'] as string);
        if (!target) {
          isError = true;
          outputText = 'fatal: missing branch name';
        } else {
          const res = switchAction(repo, target, createFlag);
          if (res.error) {
            isError = true;
            outputText = res.error;
          } else {
            nextRepo = res.state;
            outputText = createFlag
              ? `Switched to a new branch '${target}'`
              : `Switched to branch '${target}'`;
            soundFx.playBranchChime();
          }
        }
        break;
      }

      case 'merge': {
        const sourceBranch = cmd.args[0];
        if (!sourceBranch) {
          isError = true;
          outputText = 'fatal: No remote or local branch specified to merge.';
        } else {
          const res = mergeAction(repo, sourceBranch);
          if (res.error) {
            isError = true;
            outputText = res.error;
          } else {
            nextRepo = res.state;
            outputText =
              res.type === 'fast-forward'
                ? `Updating ${repo.refs.heads[repo.head.target]?.slice(0, 7)}..${res.state.refs.heads[repo.head.target]?.slice(0, 7)}\nFast-forward`
                : `Merge made by the 'recursive' strategy.`;
            soundFx.playBranchChime();
          }
        }
        break;
      }

      case 'rebase': {
        const upstream = cmd.args[0];
        if (cmd.flags['i']) {
          set({ isRebaseModalOpen: true });
          outputText = 'Opening Interactive Rebase Studio...';
        } else if (!upstream) {
          isError = true;
          outputText = 'fatal: No upstream branch specified for rebase.';
        } else {
          const res = rebaseAction(repo, upstream);
          if (res.error) {
            isError = true;
            outputText = res.error;
          } else {
            nextRepo = res.state;
            outputText = `Successfully rebased and updated refs/heads/${repo.head.target}.`;
            soundFx.playBranchChime();
          }
        }
        break;
      }

      case 'reset': {
        const target = cmd.args[0] || 'HEAD~1';
        const mode = cmd.flags['hard'] ? 'hard' : cmd.flags['soft'] ? 'soft' : 'mixed';
        const res = resetAction(repo, target, mode);
        if (res.error) {
          isError = true;
          outputText = res.error;
        } else {
          nextRepo = res.state;
          outputText = `HEAD is now at ${target}`;
        }
        break;
      }

      case 'add': {
        const target = cmd.args[0] || '.';
        if (target === '.' || target === '-A') {
          for (const path of Object.keys(repo.workingTree)) {
            nextRepo = stageAction(nextRepo, path);
          }
          outputText = 'Staged all modified and untracked files.';
        } else {
          nextRepo = stageAction(nextRepo, target);
          outputText = `Staged '${target}'.`;
        }
        break;
      }

      case 'restore': {
        const target = cmd.args[0];
        if (cmd.flags['staged']) {
          const stagedArea = { ...nextRepo.stagingArea };
          delete stagedArea[target];
          nextRepo.stagingArea = stagedArea;
          outputText = `Unstaged changes for '${target}'.`;
        } else {
          outputText = `Restored '${target}' in working tree.`;
        }
        break;
      }

      case 'stash': {
        if (cmd.args[0] === 'pop') {
          const res = stashPopAction(repo);
          if (res.error) {
            isError = true;
            outputText = res.error;
          } else {
            nextRepo = res.state;
            outputText = 'Dropped refs/stash@{0} after popping changes.';
          }
        } else if (cmd.args[0] === 'list') {
          outputText = repo.stash.map((s, idx) => `stash@{${idx}}: ${s.message}`).join('\n') || 'No stash entries.';
        } else {
          const res = stashPushAction(repo);
          if (res.error) {
            isError = true;
            outputText = res.error;
          } else {
            nextRepo = res.state;
            outputText = `Saved working directory and index state WIP on ${repo.head.target}`;
          }
        }
        break;
      }

      case 'status': {
        const branch = repo.head.type === 'branch' ? `On branch ${repo.head.target}` : `HEAD detached at ${repo.head.target}`;
        const staged = Object.keys(nextRepo.stagingArea);
        const modified = Object.entries(nextRepo.workingTree).filter(([_, f]) => f.stage === 'modified');
        const untracked = Object.entries(nextRepo.workingTree).filter(([_, f]) => f.stage === 'untracked');

        let statusText = `${branch}\n`;
        if (staged.length > 0) {
          statusText += '\nChanges to be committed:\n' + staged.map((p) => `  \x1b[32mnew file:   ${p}\x1b[0m`).join('\n');
        }
        if (modified.length > 0) {
          statusText += '\nChanges not staged for commit:\n' + modified.map(([p]) => `  \x1b[31mmodified:   ${p}\x1b[0m`).join('\n');
        }
        if (untracked.length > 0) {
          statusText += '\nUntracked files:\n' + untracked.map(([p]) => `  \x1b[31m${p}\x1b[0m`).join('\n');
        }
        if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
          statusText += 'nothing to commit, working tree clean';
        }
        outputText = statusText;
        break;
      }

      case 'log': {
        const commits = Object.values(repo.objects).filter((o) => o.type === 'commit') as any[];
        outputText = commits
          .map((c) => `commit ${c.id}\nAuthor: ${c.author.name} <${c.author.email}>\nDate:   ${new Date(c.author.timestamp).toLocaleString()}\n\n    ${c.message}\n`)
          .join('\n');
        break;
      }

      case 'fetch': {
        outputText = 'From github.com/developer/project\n * [new branch]      main       -> origin/main';
        break;
      }

      case 'pull': {
        outputText = 'Already up to date.';
        break;
      }

      case 'push': {
        outputText = 'Everything up-to-date';
        break;
      }

      case 'reflog': {
        const headReflog = repo.reflog.HEAD || [];
        outputText = headReflog
          .map((entry, idx) => `${entry.newTarget.slice(0, 7)} HEAD@{${idx}}: ${entry.message}`)
          .join('\n');
        break;
      }

      case 'help': {
        outputText = 'Supported commands: commit, branch, switch, checkout, merge, rebase, reset, add, restore, stash, status, log, reflog, fetch, push.';
        break;
      }

      default: {
        isError = true;
        outputText = `git: '${cmd.command}' is not a recognized git command. Type 'git help' for list.`;
      }
    }

    const inputLog: TerminalLog = {
      id: `in-${Date.now()}`,
      type: 'input',
      text: rawInput,
      timestamp: Date.now(),
    };

    const outLog: TerminalLog = {
      id: `out-${Date.now()}`,
      type: isError ? 'error' : 'output',
      text: outputText,
      timestamp: Date.now(),
    };

    const updatedHistory = [...lessonHistory, cmd];
    const newLogs = [...get().terminalLogs, inputLog, outLog];

    if (!isError) {
      set({
        repo: nextRepo,
        pastRepoStates: newPast,
        futureRepoStates: [],
        terminalLogs: newLogs,
        commandHistory: [...get().commandHistory, rawInput],
        lastError: null,
        lastCommand: rawInput,
        lessonHistory: updatedHistory,
      });

      // Check curriculum validation
      if (activeLessonId) {
        const lesson = LESSONS.find((l) => l.id === activeLessonId);
        if (lesson && lesson.validate(nextRepo, updatedHistory)) {
          set({ isCurrentSessionCompleted: true });
          get().markLessonComplete(activeLessonId);
        }
      }

      return { success: true, output: outputText };
    } else {
      set({
        terminalLogs: newLogs,
        lastError: outputText,
        lastCommand: rawInput,
      });
      return { success: false, error: outputText };
    }
  },

  selectLesson: (lessonId) => {
    if (!lessonId) {
      set({
        activeLessonId: null,
        isCurrentSessionCompleted: false,
        repo: createInitialRepository(),
        lessonHistory: [],
      });
      return;
    }
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (lesson) {
      const initial = lesson.initialState();
      set({
        activeLessonId: lessonId,
        activeRecipeId: null,
        isCurrentSessionCompleted: false,
        repo: initial,
        pastRepoStates: [],
        futureRepoStates: [],
        lessonHistory: [],
        unlockedPanels: {
          ...get().unlockedPanels,
          ...lesson.unlockPanels,
        },
      });
    }
  },

  markLessonComplete: (lessonId) => {
    const currentCompleted = get().completedLessonIds;
    if (!currentCompleted.includes(lessonId)) {
      const updated = [...currentCompleted, lessonId];
      set({ completedLessonIds: updated });
      savePersistedProgress(updated, get().theme, get().aiSettings);
      soundFx.playSuccessFanfare();
    }
  },

  resetCurrentLesson: () => {
    const { activeLessonId } = get();
    if (activeLessonId) {
      get().selectLesson(activeLessonId);
      set({ isCurrentSessionCompleted: false });
    }
  },

  selectRecipe: (recipeId) => {
    set({ activeRecipeId: recipeId });
  },

  setTheme: (theme) => {
    set({ theme });
    savePersistedProgress(get().completedLessonIds, theme, get().aiSettings);
  },

  setAiSettings: (newSettings) => {
    const updated = { ...get().aiSettings, ...newSettings };
    set({ aiSettings: updated });
    savePersistedProgress(get().completedLessonIds, get().theme, updated);
  },

  toggleSound: () => {
    const muted = soundFx.toggleMute();
    set({ isMuted: muted });
  },

  setAiModalOpen: (open) => set({ isAiModalOpen: open }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setGlossaryOpen: (open) => set({ isGlossaryOpen: open }),
  setConflictModalOpen: (open) => set({ isConflictModalOpen: open }),
  setRebaseModalOpen: (open) => set({ isRebaseModalOpen: open }),
  setDiffModalOpen: (open, file) => set({ isDiffModalOpen: open, diffFileTarget: file || null }),

  resolveConflict: (filePath, resolvedContent) => {
    const { repo } = get();
    const conflicts = { ...repo.conflicts };
    delete conflicts[filePath];

    const workingTree = {
      ...repo.workingTree,
      [filePath]: {
        path: filePath,
        content: resolvedContent,
        stagedContent: resolvedContent,
        stage: 'staged' as const,
      },
    };

    let nextRepo: GitRepositoryState = {
      ...repo,
      conflicts,
      workingTree,
    };

    nextRepo = stageAction(nextRepo, filePath, resolvedContent);
    set({ repo: nextRepo, isConflictModalOpen: false });
  },
}));

function getCommandExplanation(
  cmd: ParsedCommand,
  prevRepo: GitRepositoryState,
  nextRepo: GitRepositoryState
): { whatHappened: string; whySyntax: string } | null {
  switch (cmd.command) {
    case 'init':
      return {
        whatHappened: 'Created a new hidden .git database folder. Your project folder is now an active Git repository.',
        whySyntax: '`git init` is the starting command run once when starting any project to begin tracking files.',
      };
    case 'status':
      return {
        whatHappened: 'Inspected your files across the 3 zones: Working Drafts (red), Staged Shipping Box (green), and Commit History.',
        whySyntax: '`git status` gives you immediate visibility of what has changed without modifying any files.',
      };
    case 'add':
      return {
        whatHappened:
          cmd.args[0] === '.' || cmd.args[0] === '-A'
            ? 'Moved all modified and new draft files into the green Staging Box, preparing them for the next snapshot.'
            : `Moved '${cmd.args[0]}' into the green Staging Box ready to be committed.`,
        whySyntax:
          cmd.args[0] === '.'
            ? '`git add` stages files. The dot `.` is a shortcut meaning "every file and folder in the current directory".'
            : `\`git add ${cmd.args[0]}\` lets you selectively stage only this exact file, keeping your commits clean and focused.`,
      };
    case 'commit': {
      const commitSha =
        nextRepo.head.type === 'branch'
          ? nextRepo.refs.heads[nextRepo.head.target]?.slice(0, 7) || 'new'
          : nextRepo.head.target.slice(0, 7);
      return {
        whatHappened: `Sealed everything in the Staging Box into a permanent snapshot with unique ID [${commitSha}]. Both HEAD and the '${nextRepo.head.target}' branch pointer moved forward.`,
        whySyntax: cmd.flags['m']
          ? '`-m` stands for `--message`. It lets you type your description directly in quotes so Git does not open an external text editor like Vim.'
          : cmd.flags['amend']
          ? '`--amend` updates the most recent snapshot in place instead of creating a brand new one.'
          : '`git commit` creates an immutable permanent snapshot.',
      };
    }
    case 'switch':
    case 'checkout': {
      const target = cmd.args[0] || (cmd.flags['c'] as string) || (cmd.flags['b'] as string);
      return {
        whatHappened: `Moved the HEAD camera lens to '${target}'. Your workspace files now reflect this branch or commit.`,
        whySyntax:
          cmd.flags['c'] || cmd.flags['b']
            ? '`-c` (or `-b`) stands for `--create`. It creates the branch AND switches to it in a single step, saving time.'
            : '`git switch` is the modern command to switch between branches without side effects.',
      };
    }
    case 'branch':
      if (cmd.flags['d'] || cmd.flags['D']) {
        return {
          whatHappened: `Deleted the branch pointer '${cmd.args[0]}'. The historical commits remain safe in parent history.`,
          whySyntax: '`-d` stands for `--delete`. It safely removes a branch label after its feature work has been merged into main.',
        };
      }
      return {
        whatHappened: `Created a new movable branch pointer called '${cmd.args[0]}' pointing to your current snapshot.`,
        whySyntax: '`git branch <name>` creates an isolated development track. It takes zero extra disk space.',
      };
    case 'merge':
      return {
        whatHappened: `Integrated commits from '${cmd.args[0]}' into your current branch '${prevRepo.head.target}'.`,
        whySyntax: '`git merge` joins two branches together. If there are no conflicting edits on main, it performs a fast-forward.',
      };
    case 'rebase':
      return {
        whatHappened: `Replayed your feature commits on top of '${cmd.args[0]}', creating a clean linear history without merge commits.`,
        whySyntax: '`git rebase` rewrites the starting base of your branch to keep commit graphs simple and easy to read.',
      };
    case 'cherry-pick':
      return {
        whatHappened: `Extracted the exact changes from commit '${cmd.args[0]}' and copied them as a new commit onto '${prevRepo.head.target}'.`,
        whySyntax: '`git cherry-pick` lets you copy a single urgent bugfix from another branch without merging experimental work.',
      };
    case 'revert':
      return {
        whatHappened: `Created a new inverse commit that cancels out the changes from commit '${cmd.args[0]}'.`,
        whySyntax: '`git revert` is the safe, non-destructive way to undo bad code on shared branches without rewriting history.',
      };
    case 'restore':
      return {
        whatHappened: cmd.flags['staged']
          ? `Unstaged '${cmd.args[0]}' from the green Staging Box back to red Drafts. Your file code was NOT deleted!`
          : `Restored '${cmd.args[0]}' in your working tree back to the last committed snapshot.`,
        whySyntax: '`--staged` tells Git to only un-pack the file from staging, keeping your local edits completely safe.',
      };
    case 'reset':
      return {
        whatHappened: `Moved HEAD and current branch pointer backwards to '${cmd.args[0] || 'HEAD~1'}'.`,
        whySyntax: cmd.flags['soft']
          ? '`--soft` moves HEAD back while keeping all your files safely in the green Staging Box.'
          : cmd.flags['hard']
          ? '`--hard` moves HEAD back and discards uncommitted changes permanently.'
          : '`--mixed` (default) moves HEAD back and leaves files in your working draft folder.',
      };
    case 'stash':
      return {
        whatHappened:
          cmd.args[0] === 'pop'
            ? 'Restored your tucked-away WIP files back into your working directory.'
            : 'Tucked away your uncommitted draft files into the Stash Pocket so your working tree is clean.',
        whySyntax: '`git stash` lets you pause uncommitted work to switch branches for an urgent hotfix.',
      };
    case 'tag':
      return {
        whatHappened: 'Attached a permanent release milestone badge to your current commit.',
        whySyntax: '`git tag -a` marks fixed release versions (like v1.0.0) in history.',
      };
    case 'reflog':
      return {
        whatHappened: "Displayed Git's secret journal of every HEAD movement over the last 30 days.",
        whySyntax: '`git reflog` is your safety net to find and rescue deleted commits after accidental hard resets.',
      };
    case 'log':
      return {
        whatHappened: 'Traversed parent links to display the chronological history of commits on this branch.',
        whySyntax: '`git log` inspects past project commits. `--oneline` formats each commit into a single compact line.',
      };
    default:
      return null;
  }
}
