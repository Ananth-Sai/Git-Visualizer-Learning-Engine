import { GitRepositoryState } from '../types';

export interface AiPromptContext {
  command?: string;
  errorMessage?: string;
  levelObjective?: string;
  levelTitle?: string;
  repoSnapshot: {
    branches: string[];
    head: string;
    commitCount: number;
    stagedFiles: string[];
    modifiedFiles: string[];
    conflicts: string[];
  };
  userQuestion?: string;
}

export function buildContextSnapshot(state: GitRepositoryState, activeLevelTitle?: string, goalText?: string, lastError?: string, lastCommand?: string, question?: string): AiPromptContext {
  const branches = Object.keys(state.refs.heads);
  const head = state.head.type === 'branch' ? `Branch: ${state.head.target}` : `Detached HEAD at ${state.head.target}`;
  const commitCount = Object.values(state.objects).filter((o) => o.type === 'commit').length;
  const stagedFiles = Object.keys(state.stagingArea);
  const modifiedFiles = Object.keys(state.workingTree).filter((k) => state.workingTree[k].stage === 'modified');
  const conflicts = Object.keys(state.conflicts);

  return {
    command: lastCommand,
    errorMessage: lastError,
    levelTitle: activeLevelTitle,
    levelObjective: goalText,
    repoSnapshot: {
      branches,
      head,
      commitCount,
      stagedFiles,
      modifiedFiles,
      conflicts,
    },
    userQuestion: question,
  };
}

export function buildSystemPrompt(): string {
  return `You are the AI Git Coach in the Modern Fluid Git Visualizer.
Your goal is to guide developers in mastering Git visually and intuitively without confusing jargon.
Rules:
1. Provide concise, friendly, and practical advice.
2. In Free/Quick Mode: Give a 2-sentence conversational explanation of what happened and the exact next command to try in markdown backticks.
3. In Deep Mode: Provide a brief diagnosis, the mental model explanation, and numbered next steps.
4. Always be encouraging and clear.`;
}
