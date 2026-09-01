export type ObjectId = string; // Simulated SHA-1 hash, e.g. 'a1b2c3d'

export interface GitBlob {
  id: ObjectId;
  type: 'blob';
  content: string;
}

export interface GitTreeEntry {
  mode: '100644' | '040000';
  path: string;
  id: ObjectId;
  type: 'blob' | 'tree';
}

export interface GitTree {
  id: ObjectId;
  type: 'tree';
  entries: Record<string, GitTreeEntry>;
}

export interface GitCommit {
  id: ObjectId;
  type: 'commit';
  tree: ObjectId;
  parents: ObjectId[];
  author: { name: string; email: string; timestamp: number };
  message: string;
  branchTag?: string; // Optional branch tag metadata
}

export type GitObject = GitBlob | GitTree | GitCommit;

export interface DiffHunk {
  id: string;
  header: string; // e.g. '@@ -1,4 +1,6 @@'
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: Array<{
    type: 'add' | 'delete' | 'context';
    content: string;
    oldLineNumber?: number;
    newLineNumber?: number;
  }>;
  isStaged: boolean;
}

export interface FileState {
  path: string;
  content: string; // Canonical committed version
  stage: 'untracked' | 'modified' | 'staged' | 'committed' | 'conflicted';
  stagedContent?: string;
  worktreeContent?: string;
  hunks?: DiffHunk[];
}

export interface ReflogEntry {
  id: string;
  oldTarget: ObjectId | null;
  newTarget: ObjectId;
  command: string;
  message: string;
  timestamp: number;
}

export interface StashEntry {
  id: string;
  message: string;
  indexTree: ObjectId;
  workTree: ObjectId;
  baseCommit: ObjectId;
  timestamp: number;
  files: Record<string, { staged?: string; worktree?: string }>;
}

export interface ConflictFile {
  path: string;
  base: string;
  ours: string;
  theirs: string;
  resolvedContent?: string;
  isResolved: boolean;
}

export interface GitRepositoryState {
  objects: Record<ObjectId, GitBlob | GitTree | GitCommit>;
  refs: {
    heads: Record<string, ObjectId>;
    tags: Record<string, ObjectId>;
    remotes: Record<string, Record<string, ObjectId>>;
  };
  head: {
    type: 'branch' | 'detached';
    target: string; // branch name or commit hash
  };
  workingTree: Record<string, FileState>;
  stagingArea: Record<string, ObjectId>;
  stash: StashEntry[];
  reflog: Record<string, ReflogEntry[]>;
  conflicts: Record<string, ConflictFile>;
  activeOperation?: {
    type: 'merge' | 'rebase' | 'cherry-pick';
    sourceBranch?: string;
    targetBranch?: string;
    step: number;
    totalSteps: number;
    stepName: string;
    isPaused?: boolean;
  };
}

export type CommandSafety = 'safe' | 'caution' | 'destructive';

export interface ParsedCommand {
  raw: string;
  command: string; // e.g. 'commit', 'checkout', 'switch', 'branch'
  subcommand?: string;
  args: string[];
  flags: Record<string, string | boolean>;
  safety: CommandSafety;
  safetyExplanation?: string;
}

export type AiProvider = 'default-free' | 'google-gemini' | 'openai' | 'anthropic';

export interface UserAiSettings {
  provider: AiProvider;
  customApiKey?: string;
  customModel?: string;
}

export interface UnlockedPanels {
  terminal: boolean;
  stagingInspector: boolean;
  internalsInspector: boolean;
  stashPocket: boolean;
  rebaseStudio: boolean;
  remoteTracks: boolean;
  conflictLab: boolean;
}

export interface LessonObjective {
  id: string;
  title: string;
  description: string;
  tier: 1 | 2 | 3 | 4;
  tierTitle: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  initialState: () => GitRepositoryState;
  expectedGoalText: string;
  validate: (state: GitRepositoryState, history: ParsedCommand[]) => boolean;
  hints: string[];
  pedagogicalTip: string;
  realWorldContext?: string;
  commonGotcha?: string;
  recommendedCommands?: string[];
  unlockPanels: Partial<UnlockedPanels>;
}

export interface RecipeScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'Mistake Recovery' | 'Clean History' | 'Precision Staging';
  problemDescription: string;
  solutionSummary: string;
  initialState: () => GitRepositoryState;
  targetGoal: string;
  validate: (state: GitRepositoryState) => boolean;
  stepGuide: Array<{
    command: string;
    explanation: string;
  }>;
}

export interface GlossaryEntry {
  term: string;
  tag: 'Core' | 'Branching' | 'Internals' | 'Remotes' | 'Advanced';
  plainEnglish: string;
  technicalDetails: string;
  safetyNotice?: string;
  relatedCommands: string[];
}
