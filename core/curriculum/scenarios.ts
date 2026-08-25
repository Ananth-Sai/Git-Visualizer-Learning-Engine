import { RecipeScenario, GitRepositoryState } from '../types';
import { createInitialRepository, commit, createBranch, switchBranchOrCommit } from '../engine/GitReducer';

export const RECIPE_SCENARIOS: RecipeScenario[] = [
  {
    id: 'recipe-wrong-branch',
    title: 'Committed to Wrong Branch',
    subtitle: 'Move your new commit from main to a dedicated feature branch.',
    category: 'Mistake Recovery',
    problemDescription: 'You accidentally made 2 commits directly on the `main` branch instead of creating a feature branch first.',
    solutionSummary: 'Create the new feature branch at the current tip, then reset `main` back without losing your work.',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'accidental feature work 1' }).state;
      state = commit(state, { message: 'accidental feature work 2' }).state;
      return state;
    },
    targetGoal: 'Move the 2 commits to `feature-fix` and reset `main` to the initial commit.',
    validate: (state: GitRepositoryState) => {
      return !!state.refs.heads['feature-fix'];
    },
    stepGuide: [
      {
        command: 'git branch feature-fix',
        explanation: 'Creates the new branch at your current commit position.',
      },
      {
        command: 'git reset --hard HEAD~2',
        explanation: 'Rewinds main back 2 commits to its clean original state.',
      },
      {
        command: 'git switch feature-fix',
        explanation: 'Switches to the new branch where your commits are safe and sound.',
      },
    ],
  },
  {
    id: 'recipe-amend-typo',
    title: 'Fix Typo in Last Commit',
    subtitle: 'Update your last commit message or add a forgotten file without creating a new commit.',
    category: 'Clean History',
    problemDescription: 'You committed with a typo in the message: "Add usre autentication" and forgot to include `types.ts`.',
    solutionSummary: 'Use `git commit --amend` to rewrite the last commit in-place.',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Add usre autentication' }).state;
      state.workingTree['types.ts'] = {
        path: 'types.ts',
        content: 'export type User = {};',
        stagedContent: 'export type User = {};',
        stage: 'staged',
      };
      state.stagingArea['types.ts'] = 'blob-types';
      return state;
    },
    targetGoal: 'Amend the commit with message "Add user authentication" including `types.ts`.',
    validate: (state: GitRepositoryState) => {
      const lastCommit = Object.values(state.objects).find(
        (o) => o.type === 'commit' && o.message === 'Add user authentication'
      );
      return !!lastCommit;
    },
    stepGuide: [
      {
        command: 'git add types.ts',
        explanation: 'Stage any missing files you forgot in the initial commit.',
      },
      {
        command: 'git commit --amend -m "Add user authentication"',
        explanation: 'Replaces the previous commit with the new message and staged files.',
      },
    ],
  },
  {
    id: 'recipe-partial-staging',
    title: 'Stage Only Selected Lines',
    subtitle: 'Use interactive patch staging (`git add -p`) to split changes into separate commits.',
    category: 'Precision Staging',
    problemDescription: 'You modified `app.ts` with both a bug fix AND experimental testing code. You only want to commit the bug fix.',
    solutionSummary: 'Use selective hunk staging to commit only the clean lines.',
    initialState: () => {
      const state = createInitialRepository();
      state.workingTree['app.ts'] = {
        path: 'app.ts',
        content: 'console.log("Bug fixed");\nconsole.log("DEBUG_TEMP_LOG");',
        worktreeContent: 'console.log("Bug fixed");\nconsole.log("DEBUG_TEMP_LOG");',
        stagedContent: 'console.log("Bug fixed");',
        stage: 'staged',
      };
      state.stagingArea['app.ts'] = 'blob-fix-only';
      return state;
    },
    targetGoal: 'Stage only the bug fix and commit it as "fix: resolve bug in app.ts".',
    validate: (state: GitRepositoryState) => {
      return Object.values(state.objects).some(
        (o) => o.type === 'commit' && o.message.toLowerCase().includes('fix')
      );
    },
    stepGuide: [
      {
        command: 'git add -p app.ts',
        explanation: 'Opens interactive patch staging to select specific code hunks.',
      },
      {
        command: 'git commit -m "fix: resolve bug in app.ts"',
        explanation: 'Creates a clean commit with only the approved lines.',
      },
    ],
  },
];
