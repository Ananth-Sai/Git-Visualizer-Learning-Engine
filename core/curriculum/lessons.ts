import { LessonObjective, GitRepositoryState, ParsedCommand } from '../types';
import {
  createInitialRepository,
  commit,
  createBranch,
  switchBranchOrCommit,
  getCurrentCommitId,
  stageFile,
} from '../engine/GitReducer';

function createEmptyRepository(): GitRepositoryState {
  return {
    objects: {},
    refs: {
      heads: {},
      tags: {},
      remotes: {},
    },
    head: {
      type: 'branch',
      target: 'main',
    },
    workingTree: {
      'index.ts': {
        path: 'index.ts',
        content: 'console.log("Hello, World!");',
        worktreeContent: 'console.log("Hello, World!");',
        stage: 'untracked',
      },
    },
    stagingArea: {},
    stash: [],
    reflog: { HEAD: [] },
    conflicts: {},
  };
}

export const LESSONS: LessonObjective[] = [
  // ================= STAGE 1: REPOSITORY FUNDAMENTALS =================
  {
    id: 'level-1',
    title: '1. Initializing a Repository',
    tier: 1,
    tierTitle: 'Stage 1: Fundamentals',
    category: 'Setup',
    difficulty: 'Beginner',
    description: 'Every Git journey begins by initializing a `.git` hidden database in your project folder. Type `git init` to set up your project repository.',
    expectedGoalText: '👉 In the terminal, type `git init` to initialize version control for this project.',
    initialState: () => createEmptyRepository(),
    validate: (state: GitRepositoryState, history: ParsedCommand[]) => {
      const hasInit = history.some((c) => c.command === 'init');
      const hasCommit = Object.values(state.objects).filter((o) => o.type === 'commit').length >= 1;
      return hasInit || hasCommit;
    },
    hints: [
      'Type `git init` into the terminal CLI below and press Enter.',
      'Watch your project folder transform into a Git repository with its initial commit!',
    ],
    pedagogicalTip: '`git init` creates the hidden `.git` folder containing objects, references, and configuration.',
    realWorldContext: 'Whenever you start a brand new project, `git init` transforms your folder into a version-controlled workspace.',
    commonGotcha: 'Running `git init` inside an existing Git repository creates nested repositories, which causes confusion. Always run it at the root.',
    recommendedCommands: ['init'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
      internalsInspector: false,
    },
  },
  {
    id: 'level-2',
    title: '2. The 3 Zones & File Status',
    tier: 1,
    tierTitle: 'Stage 1: Fundamentals',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    description: 'Git separates files into 3 zones: Working Tree (unstaged edits), Staging Area (prepared box), and Commit History (saved permanently).',
    expectedGoalText: '👉 In the terminal, type `git status` to inspect files, then type `git add .` to stage them.',
    initialState: () => {
      const state = createInitialRepository();
      state.workingTree['app.js'] = { path: 'app.js', content: 'console.log("App");', worktreeContent: 'console.log("App");', stage: 'untracked' };
      state.workingTree['style.css'] = { path: 'style.css', content: 'body { margin: 0; }', worktreeContent: 'body { margin: 0; }', stage: 'untracked' };
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return Object.keys(state.stagingArea).length >= 2;
    },
    hints: [
      'Type `git status` to see untracked files in red.',
      'Type `git add .` to move all untracked files into the green Staging Area.',
    ],
    pedagogicalTip: 'The staging area allows you to craft precise, clean commits rather than dumping every file modification into history.',
    realWorldContext: 'In real projects, staging lets you separate bugfix edits from feature edits before recording snapshots.',
    commonGotcha: 'Editing a file after `git add` leaves the new changes unstaged. You must re-add the file before committing!',
    recommendedCommands: ['status', 'add .'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-3',
    title: '3. Permanent Snapshots (Commits)',
    tier: 1,
    tierTitle: 'Stage 1: Fundamentals',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    description: 'A commit records a permanent cryptographic snapshot of all staged files with a clear message and author timestamp.',
    expectedGoalText: '👉 In the terminal, type: `git commit -m "Initialize web app"`',
    initialState: () => {
      let state = createInitialRepository();
      state = stageFile(state, 'index.html', '<!DOCTYPE html><html></html>');
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return Object.values(state.objects).filter((o) => o.type === 'commit').length >= 2;
    },
    hints: [
      'Type `git commit -m "Initialize web app"` in the terminal.',
      'Watch a new commit node with a unique 4-character SHA appear on the canvas!',
    ],
    pedagogicalTip: 'Every commit points to a parent commit, forming a chronological directed acyclic graph (DAG).',
    realWorldContext: 'Commit messages are the changelog of your software. Good messages help teammates understand why code was changed months later.',
    commonGotcha: 'Writing vague messages like "fixed stuff" makes tracking bugs in history difficult. Be descriptive and concise.',
    recommendedCommands: ['commit -m'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-4',
    title: '4. Reading History (Log & Graph)',
    tier: 1,
    tierTitle: 'Stage 1: Fundamentals',
    category: 'Inspection',
    difficulty: 'Beginner',
    description: '`git log` allows you to inspect past project commits. The `--oneline` flag formats the log into a clean compact summary.',
    expectedGoalText: '👉 In the terminal, type `git log` or `git log --oneline` to review repository history.',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Add header component' }).state;
      state = commit(state, { message: 'Add dark mode support' }).state;
      return state;
    },
    validate: (state: GitRepositoryState, history: ParsedCommand[]) => {
      return history.some((c) => c.command === 'log');
    },
    hints: [
      'Type `git log` in the terminal to view full commit authors and timestamps.',
      'Or type `git log --oneline` for a compact view.',
    ],
    pedagogicalTip: 'Git log traverses parent pointers backwards from the current HEAD commit.',
    realWorldContext: 'Developers use `git log` daily to find when a specific feature or regression was introduced.',
    commonGotcha: '`git log` only shows commits reachable from the current branch. To see all branches, developers use `git log --all --graph`.',
    recommendedCommands: ['log', 'log --oneline'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-5',
    title: '5. The Observer (HEAD & Detached Mode)',
    tier: 1,
    tierTitle: 'Stage 1: Fundamentals',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    description: 'HEAD is the camera lens of Git. Moving HEAD to an earlier commit puts you into Detached HEAD mode so you can inspect past code.',
    expectedGoalText: '👉 Click an earlier commit node on the canvas (or type `git checkout <sha>`) to detach HEAD.',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Add navbar component' }).state;
      state = commit(state, { message: 'Add hero layout' }).state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return state.head.type === 'detached';
    },
    hints: [
      'Click any past circular commit node in the center canvas.',
      'Notice how the yellow glowing HEAD indicator attaches directly to that commit.',
    ],
    pedagogicalTip: 'Detached HEAD means you are directly observing a commit rather than the tip of a named branch.',
    realWorldContext: 'Engineers use Detached HEAD to verify if a bug was present in an older release without creating temporary branches.',
    commonGotcha: 'Making new commits while in Detached HEAD can orphan your work when you switch back. Always create a branch if you want to keep changes!',
    recommendedCommands: ['switch', 'checkout'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-6',
    title: '6. Selective Staging (Precision Adds)',
    tier: 1,
    tierTitle: 'Stage 1: Fundamentals',
    category: 'Precision Staging',
    difficulty: 'Beginner',
    description: 'Instead of staging everything with `git add .`, stage individual files (`git add api.ts`) to keep commits atomic.',
    expectedGoalText: '👉 In the terminal, stage only `api.ts` with `git add api.ts` while leaving `notes.txt` unstaged.',
    initialState: () => {
      const state = createInitialRepository();
      state.workingTree['api.ts'] = { path: 'api.ts', content: 'export const api = {};', worktreeContent: 'export const api = {};', stage: 'untracked' };
      state.workingTree['notes.txt'] = { path: 'notes.txt', content: 'TODO list', worktreeContent: 'TODO list', stage: 'untracked' };
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return !!state.stagingArea['api.ts'] && !state.stagingArea['notes.txt'];
    },
    hints: [
      'Type `git add api.ts` in the terminal.',
      'Check the Staging Area panel to see `api.ts` in green and `notes.txt` remaining in red.',
    ],
    pedagogicalTip: 'Selective staging prevents accidental inclusion of scratch notes, temporary logs, or unfinished features.',
    realWorldContext: 'Senior developers stage specific files to write clean, self-contained commits that are easy to revert if bugs occur.',
    commonGotcha: 'Accidentally using `git add .` when you have temporary debug `console.log` statements.',
    recommendedCommands: ['add api.ts', 'status'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },

  // ================= STAGE 2: BRANCHING & MERGING =================
  {
    id: 'level-7',
    title: '7. Parallel Realities (Branches)',
    tier: 2,
    tierTitle: 'Stage 2: Branching & Merging',
    category: 'Branching',
    difficulty: 'Intermediate',
    description: 'Branches create an isolated timeline for new feature development without touching the stable `main` branch.',
    expectedGoalText: '👉 In the terminal, create and switch to a feature branch: `git switch -c feature`',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Base app setup' }).state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return !!state.refs.heads['feature'] && state.head.target === 'feature';
    },
    hints: [
      'Type `git switch -c feature` in the terminal.',
      'Notice the new branch pointer attach to your current commit!',
    ],
    pedagogicalTip: 'A branch is simply a 41-byte pointer file containing a commit SHA. Branching takes zero extra storage.',
    realWorldContext: 'Every feature, bugfix, and experiment starts in its own branch before undergoing code review in a pull request.',
    commonGotcha: 'Creating a branch with `git branch feat` does NOT switch to it. Always use `git switch -c` or `git checkout -b`.',
    recommendedCommands: ['switch -c', 'branch'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-8',
    title: '8. Deleting Merged Branches',
    tier: 2,
    tierTitle: 'Stage 2: Branching & Merging',
    category: 'Branching',
    difficulty: 'Intermediate',
    description: 'Once a feature branch has been merged into main, deleting the branch keeps your repository clean.',
    expectedGoalText: '👉 Switch to `main` with `git switch main`, then delete the obsolete branch with `git branch -d old-feat`.',
    initialState: () => {
      let state = createInitialRepository();
      state = createBranch(state, 'old-feat').state;
      state = switchBranchOrCommit(state, 'old-feat').state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return state.head.target === 'main' && !state.refs.heads['old-feat'];
    },
    hints: [
      'First switch to main: `git switch main`.',
      'Then delete the branch: `git branch -d old-feat`.',
    ],
    pedagogicalTip: 'Deleting a branch only removes the pointer label; the historical commits remain intact in the parent graph.',
    realWorldContext: 'Teams regularly prune merged branches so lists in GitHub / GitLab stay tidy.',
    commonGotcha: 'You cannot delete a branch while you are currently standing on it. Switch to `main` first!',
    recommendedCommands: ['switch main', 'branch -d'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-9',
    title: '9. Fast-Forward Merges',
    tier: 2,
    tierTitle: 'Stage 2: Branching & Merging',
    category: 'Merging',
    difficulty: 'Intermediate',
    description: 'When `main` has no new commits since branching, Git fast-forwards the `main` pointer straight to the feature tip.',
    expectedGoalText: '👉 Switch to `main` with `git switch main`, then type `git merge feature`.',
    initialState: () => {
      let state = createInitialRepository();
      state = createBranch(state, 'feature').state;
      state = switchBranchOrCommit(state, 'feature').state;
      state = commit(state, { message: 'Implement dark mode' }).state;
      state = commit(state, { message: 'Add theme toggle' }).state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return state.head.target === 'main' && state.refs.heads['main'] === state.refs.heads['feature'];
    },
    hints: [
      'Switch to main: `git switch main`.',
      'Merge feature: `git merge feature`.',
    ],
    pedagogicalTip: 'Fast-forward merges do not create an extra merge commit—the pointer simply slides forward.',
    realWorldContext: 'Fast-forward produces clean, linear histories that are very easy to trace.',
    commonGotcha: 'Fast-forward is only possible if main had no new commits. If main moved ahead, a 3-way merge commit is required.',
    recommendedCommands: ['switch main', 'merge feature'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-10',
    title: '10. Three-Way Merge Commits',
    tier: 2,
    tierTitle: 'Stage 2: Branching & Merging',
    category: 'Merging',
    difficulty: 'Intermediate',
    description: 'When both `main` and `feature` have new commits, a 3-way merge brings both storylines together with a merge commit.',
    expectedGoalText: '👉 In the terminal, switch to `main` with `git switch main`, then type `git merge feature`.',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Main commit 1' }).state;
      state = createBranch(state, 'feature').state;
      state = switchBranchOrCommit(state, 'feature').state;
      state = commit(state, { message: 'Feature work A' }).state;
      state = switchBranchOrCommit(state, 'main').state;
      state = commit(state, { message: 'Main commit 2 (diverged)' }).state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      const headCommit = state.objects[state.refs.heads['main']] as any;
      return headCommit && headCommit.parents && headCommit.parents.length === 2;
    },
    hints: [
      'Type `git switch main` to ensure you are on destination branch.',
      'Type `git merge feature` to create the converging merge commit.',
    ],
    pedagogicalTip: 'A 3-way merge has 2 parent commits, preserving the true non-linear history of both branches.',
    realWorldContext: 'Pull requests on GitHub typically generate 3-way merge commits to mark when a feature was integrated.',
    commonGotcha: 'Merging in the wrong direction! Always switch to `main` first before running `git merge feature`.',
    recommendedCommands: ['switch main', 'merge feature'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-11',
    title: '11. Linear Rebasing (`git rebase`)',
    tier: 2,
    tierTitle: 'Stage 2: Branching & Merging',
    category: 'Rebasing',
    difficulty: 'Intermediate',
    description: 'Rebase replays your feature commits on top of the latest `main`, creating a perfectly linear history without merge bubbles.',
    expectedGoalText: '👉 While on `feature`, type `git rebase main` to replay your commits on top of main.',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Base commit' }).state;
      state = createBranch(state, 'feature').state;
      state = switchBranchOrCommit(state, 'main').state;
      state = commit(state, { message: 'New work on main' }).state;
      state = switchBranchOrCommit(state, 'feature').state;
      state = commit(state, { message: 'Feature commit' }).state;
      return state;
    },
    validate: (state: GitRepositoryState, history: ParsedCommand[]) => {
      const hasRebased = history.some((c) => c.command === 'rebase');
      const featCommit = state.objects[state.refs.heads['feature']] as any;
      return hasRebased || featCommit?.parents?.[0] === state.refs.heads['main'];
    },
    hints: [
      'Ensure you are on `feature` (`git switch feature`).',
      'Type `git rebase main` in the terminal.',
    ],
    pedagogicalTip: 'Rebase moves the base of your branch to the tip of main by calculating diffs and creating new commit copies.',
    realWorldContext: 'Many engineering teams require rebasing feature branches before merging so git log remains clean and linear.',
    commonGotcha: 'Never rebase public commits that other teammates have already cloned! Rebase rewrites SHA hashes.',
    recommendedCommands: ['rebase main'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-12',
    title: '12. Cherry-Picking Single Commits',
    tier: 2,
    tierTitle: 'Stage 2: Branching & Merging',
    category: 'Precision Merging',
    difficulty: 'Intermediate',
    description: 'Want a single specific bugfix commit from another branch without merging all the experimental code? Use `git cherry-pick <sha>`.',
    expectedGoalText: '👉 On `main`, cherry-pick the bugfix commit from feature by typing: `git cherry-pick <sha>`',
    initialState: () => {
      let state = createInitialRepository();
      state = createBranch(state, 'feature').state;
      state = switchBranchOrCommit(state, 'feature').state;
      state = commit(state, { message: 'Hotfix: fix authentication bug' }).state;
      const bugfixSha = getCurrentCommitId(state)!;
      state = commit(state, { message: 'Experimental redesign (WIP)' }).state;
      state = switchBranchOrCommit(state, 'main').state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      const mainCommits = Object.values(state.objects).filter(
        (o) => o.type === 'commit' && o.message.toLowerCase().includes('hotfix')
      );
      return mainCommits.length >= 1 && state.head.target === 'main';
    },
    hints: [
      'Find the SHA of the hotfix commit on the feature branch in the graph.',
      'Type `git cherry-pick <sha>` (e.g. `git cherry-pick 1a2b`).',
    ],
    pedagogicalTip: 'Cherry-pick extracts the diff of a single commit and applies it as a brand new commit on the current branch.',
    realWorldContext: 'Engineers use cherry-pick to backport urgent security hotfixes into production release branches.',
    commonGotcha: 'Cherry-picking creates a duplicate commit with a different SHA. If you merge the full branch later, Git must resolve both.',
    recommendedCommands: ['cherry-pick <sha>'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },

  // ================= STAGE 3: PRECISION CONTROL & UNDOING =================
  {
    id: 'level-13',
    title: '13. Amending Commits (`commit --amend`)',
    tier: 3,
    tierTitle: 'Stage 3: Undoing & Precision',
    category: 'Mistake Recovery',
    difficulty: 'Intermediate',
    description: 'Forgot to add a file or made a typo in your last commit message? `git commit --amend` updates the last snapshot in place.',
    expectedGoalText: '👉 Stage `patch.ts` with `git add patch.ts`, then update the last commit with `git commit --amend -m "Updated message"`',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Add user profile (typo in msg)' }).state;
      state.workingTree['patch.ts'] = { path: 'patch.ts', content: 'export const patch = true;', worktreeContent: 'export const patch = true;', stage: 'untracked' };
      return state;
    },
    validate: (state: GitRepositoryState, history: ParsedCommand[]) => {
      return history.some((c) => c.command === 'commit' && !!c.flags['amend']);
    },
    hints: [
      'Type `git add patch.ts` to stage the forgotten file.',
      'Type `git commit --amend -m "Add user profile with patch"` to overwrite the last commit.',
    ],
    pedagogicalTip: '`--amend` replaces the tip commit with a newly minted commit containing the updated tree.',
    realWorldContext: 'Used constantly during local development to fix small typos before pushing code to GitHub.',
    commonGotcha: 'Do not amend commits that have already been pushed to a shared remote repository without coordination.',
    recommendedCommands: ['add patch.ts', 'commit --amend -m "..."'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-14',
    title: '14. Unstaging Files (`git restore`)',
    tier: 3,
    tierTitle: 'Stage 3: Undoing & Precision',
    category: 'Mistake Recovery',
    difficulty: 'Intermediate',
    description: 'Accidentally staged a secret or test file? Use `git restore --staged <file>` to safely unstage it without losing your edits.',
    expectedGoalText: '👉 In the terminal, unstage `secret.env` by typing: `git restore --staged secret.env`',
    initialState: () => {
      let state = createInitialRepository();
      state.stagingArea['app.ts'] = 'blob-app';
      state.stagingArea['secret.env'] = 'blob-secret';
      state.workingTree['app.ts'] = { path: 'app.ts', content: 'app code', stagedContent: 'app code', stage: 'staged' };
      state.workingTree['secret.env'] = { path: 'secret.env', content: 'SECRET_KEY=1234', stagedContent: 'SECRET_KEY=1234', stage: 'staged' };
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return !!state.stagingArea['app.ts'] && !state.stagingArea['secret.env'];
    },
    hints: [
      'Type `git restore --staged secret.env` in the terminal.',
      'Notice in the Staging Inspector how secret.env turns red (unstaged).',
    ],
    pedagogicalTip: '`git restore` was introduced in Git 2.23 to give developers a dedicated, safe command for undoing file staging.',
    realWorldContext: 'Prevents accidentally leaking credentials or private API keys to GitHub.',
    commonGotcha: 'Running `git restore <file>` (without `--staged`) will permanently discard your uncommitted code edits! Always verify flags.',
    recommendedCommands: ['restore --staged secret.env'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-15',
    title: '15. The 3 Resets (`--soft`, `--mixed`, `--hard`)',
    tier: 3,
    tierTitle: 'Stage 3: Undoing & Precision',
    category: 'Time Travel',
    difficulty: 'Advanced',
    description: '`git reset` moves HEAD backwards in time. `--soft` preserves staged changes, `--mixed` preserves uncommitted files, and `--hard` discards everything.',
    expectedGoalText: '👉 Undo the last commit while keeping files staged by running: `git reset --soft HEAD~1`',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Mistaken commit to undo' }).state;
      return state;
    },
    validate: (state: GitRepositoryState, history: ParsedCommand[]) => {
      return history.some((c) => c.command === 'reset' && (c.flags['soft'] || c.args.includes('HEAD~1')));
    },
    hints: [
      'Type `git reset --soft HEAD~1` in the terminal.',
      'Notice how the commit disappears from graph, but your files remain safely staged in green!',
    ],
    pedagogicalTip: '`--soft` moves the branch pointer back without touching the index or working tree.',
    realWorldContext: 'Engineers use `git reset --soft HEAD~N` to undo multiple commits and combine them into one clean snapshot.',
    commonGotcha: '`git reset --hard` permanently discards uncommitted work. Make sure your changes are committed or stashed before hard resetting!',
    recommendedCommands: ['reset --soft HEAD~1'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-16',
    title: '16. Safe Public Undoing (`git revert`)',
    tier: 3,
    tierTitle: 'Stage 3: Undoing & Precision',
    category: 'Mistake Recovery',
    difficulty: 'Advanced',
    description: 'If a bad commit is already pushed to GitHub, you cannot use reset! `git revert <sha>` safely inverts the bad commit by adding a new inverse snapshot.',
    expectedGoalText: '👉 Safely undo the bad commit on main by typing: `git revert <sha>`',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Good base commit' }).state;
      state = commit(state, { message: 'Bug: introduces broken feature' }).state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      const commits = Object.values(state.objects).filter((o) => o.type === 'commit');
      const hasRevert = commits.some((c: any) => c.message.toLowerCase().includes('revert'));
      return hasRevert;
    },
    hints: [
      'Find the SHA of the bad commit on the canvas.',
      'Type `git revert <sha>` (e.g. `git revert 3a4b`).',
    ],
    pedagogicalTip: 'Revert does not delete history—it records forward progress that inverses the changes of the target commit.',
    realWorldContext: 'Revert is the industry-standard way to rollback breaking production changes on shared branches without rewriting history.',
    commonGotcha: 'Reverting a 3-way merge commit requires specifying the `-m parent-number` flag.',
    recommendedCommands: ['revert <sha>'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-17',
    title: '17. The Stash Pocket (`git stash`)',
    tier: 3,
    tierTitle: 'Stage 3: Undoing & Precision',
    category: 'Context Switching',
    difficulty: 'Intermediate',
    description: 'Need to switch branches urgently for a hotfix but have unfinished work? Stash lets you tuck uncommitted files away safely and pop them back later.',
    expectedGoalText: '👉 In the terminal, type `git stash` to store changes, then type `git stash pop` to restore them.',
    initialState: () => {
      const state = createInitialRepository();
      state.workingTree['wip-feature.ts'] = {
        path: 'wip-feature.ts',
        content: '// half finished code',
        worktreeContent: '// half finished code',
        stage: 'modified',
      };
      return state;
    },
    validate: (state: GitRepositoryState, history: ParsedCommand[]) => {
      const hasStashed = history.some((c) => c.command === 'stash');
      const hasPop = history.some((c) => c.command === 'stash' && c.args.includes('pop'));
      return hasStashed && hasPop;
    },
    hints: [
      'Type `git stash` in the terminal to save your dirty work.',
      'When ready, type `git stash pop` to bring your files back.',
    ],
    pedagogicalTip: 'The stash acts as a temporary stack (LIFO) of uncommitted modifications.',
    realWorldContext: 'When an urgent bug occurs in production, stashing lets you jump branches in 2 seconds without making half-baked "wip" commits.',
    commonGotcha: 'Untracked files are not stashed by default. Use `git stash -u` if you created new files.',
    recommendedCommands: ['stash', 'stash pop'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
      stashPocket: true,
    },
  },

  // ================= STAGE 4: REMOTES & PRODUCTION RECOVERY =================
  {
    id: 'level-18',
    title: '18. Remote Tracking & Synchronization',
    tier: 4 as any,
    tierTitle: 'Stage 4: Remotes & Recovery',
    category: 'Remotes',
    difficulty: 'Advanced',
    description: 'Remote branches like `origin/main` track code on GitHub. Learn how `git fetch` checks for updates without touching your local working files.',
    expectedGoalText: '👉 In the terminal, type `git fetch` to download remote tracking references, then type `git merge origin/main`.',
    initialState: () => {
      const state = createInitialRepository();
      const remoteBlob = 'console.log("Remote patch");';
      const rId = 'r99a1b2';
      state.objects[rId] = {
        id: rId,
        type: 'commit',
        tree: 't99',
        parents: [state.refs.heads['main']],
        author: { name: 'Teammate', email: 'team@gitfluid.io', timestamp: Date.now() },
        message: 'Remote teammate patch',
        branchTag: 'origin/main',
      };
      state.refs.remotes.origin = { main: rId };
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return state.refs.heads['main'] === state.refs.remotes.origin['main'];
    },
    hints: [
      'Type `git fetch` to inspect the dashed `origin/main` remote track on the canvas.',
      'Type `git merge origin/main` to advance your local main to match remote.',
    ],
    pedagogicalTip: '`git pull` is simply a shortcut that runs `git fetch` followed by `git merge`.',
    realWorldContext: 'Running `git fetch` is always 100% safe because it never overwrites local code or creates merge conflicts.',
    commonGotcha: 'Running `git pull` blindly when you have uncommitted edits can trigger messy conflict blocks.',
    recommendedCommands: ['fetch', 'merge origin/main'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
      remoteTracks: true,
    },
  },
  {
    id: 'level-19',
    title: '19. Merge Conflict Resolution Studio',
    tier: 4 as any,
    tierTitle: 'Stage 4: Remotes & Recovery',
    category: 'Conflict Mastery',
    difficulty: 'Advanced',
    description: 'When two developers edit the same line of code, Git pauses and asks you to pick which version to keep.',
    expectedGoalText: '👉 Click the amber "Conflict in config.ts" button, choose a version, and click [ Mark as Resolved ].',
    initialState: () => {
      const state = createInitialRepository();
      state.conflicts['config.ts'] = {
        path: 'config.ts',
        base: 'export const PORT = 3000;',
        ours: 'export const PORT = 8080; // Ours (Main)',
        theirs: 'export const PORT = 5000; // Theirs (Feature)',
        isResolved: false,
      };
      state.workingTree['config.ts'] = {
        path: 'config.ts',
        content: 'export const PORT = 3000;',
        stage: 'conflicted',
      };
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return Object.keys(state.conflicts).length === 0 || Object.values(state.conflicts).every((c) => c.isResolved);
    },
    hints: [
      'Click the glowing amber conflict badge on screen.',
      'Select "Accept Current", "Accept Incoming", or "Accept Both", then submit.',
    ],
    pedagogicalTip: 'Conflicts are not errors—they are safety checkpoints where Git asks you to confirm code intent.',
    realWorldContext: 'Merge conflicts happen daily on engineering teams. Resolving them with clear 3-way visual tools prevents accidental code deletion.',
    commonGotcha: 'Leaving conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) inside your code files breaks the production build!',
    recommendedCommands: ['add config.ts', 'commit'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
      conflictLab: true,
    },
  },
  {
    id: 'level-20',
    title: '20. Interactive Rebase Studio (`rebase -i`)',
    tier: 4 as any,
    tierTitle: 'Stage 4: Remotes & Recovery',
    category: 'History Rewriting',
    difficulty: 'Advanced',
    description: 'Interactive rebase lets you clean up messy commits (like "fix typo", "oops") into one clean commit before merging.',
    expectedGoalText: '👉 Type `git rebase -i HEAD~3` (or open Rebase Studio), select "squash" for typo commits, and apply.',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'feat: add user profile page' }).state;
      state = commit(state, { message: 'fix typo in header' }).state;
      state = commit(state, { message: 'fix another css typo' }).state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      const commits = Object.values(state.objects).filter((o) => o.type === 'commit');
      return commits.length <= 2;
    },
    hints: [
      'Type `git rebase -i HEAD~3` in the terminal to launch the interactive editor.',
      'Change the action for the 2 typo commits to "squash", then click Apply.',
    ],
    pedagogicalTip: 'Squashing combines multiple small commits into one clean snapshot with a single clear message.',
    realWorldContext: 'Most companies enforce squash-merging or interactive rebase so their main branch commit log reads like a clean changelog.',
    commonGotcha: 'Never rebase commits that have already been pushed to a shared public branch! Rebase rewrites commit SHA hashes.',
    recommendedCommands: ['rebase -i HEAD~3'],
    unlockPanels: {
      terminal: true,
      rebaseStudio: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-21',
    title: '21. Reflog Disaster Recovery',
    tier: 4 as any,
    tierTitle: 'Stage 4: Remotes & Recovery',
    category: 'Disaster Recovery',
    difficulty: 'Advanced',
    description: 'Accidentally ran `git reset --hard` and lost your work? Git reflog keeps a secret journal of every HEAD movement so you can resurrect lost commits!',
    expectedGoalText: '👉 Type `git reflog`, find the lost commit hash, and restore it with: `git reset --hard <sha>`',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Important client feature v1' }).state;
      state = commit(state, { message: 'Important client feature v2 (LOST)' }).state;
      const lostSha = getCurrentCommitId(state)!;
      // Accidentally hard reset back 2 commits
      const rootSha = Object.keys(state.objects).find((k) => state.objects[k].type === 'commit' && (state.objects[k] as any).parents.length === 0)!;
      state.refs.heads['main'] = rootSha;
      state.reflog.HEAD.unshift({
        id: 'reflog-reset-accident',
        oldTarget: lostSha,
        newTarget: rootSha,
        command: 'reset --hard',
        message: 'reset --hard: moving to root (accidental)',
        timestamp: Date.now(),
      });
      return state;
    },
    validate: (state: GitRepositoryState) => {
      const currentCommit = state.objects[getCurrentCommitId(state)!] as any;
      return currentCommit && currentCommit.message.includes('LOST');
    },
    hints: [
      'Type `git reflog` to see past commit snapshots.',
      'Copy the lost commit SHA and type `git reset --hard <sha>` to recover it.',
    ],
    pedagogicalTip: 'Git never deletes data right away. Reflog gives you a 30-day safety net for undoing accidental resets.',
    realWorldContext: 'Reflog is the ultimate developer safety net. Even if a junior engineer runs a catastrophic hard reset, senior engineers use reflog to rescue the commits in 10 seconds.',
    commonGotcha: 'Reflog entries expire after 30 to 90 days. Always recover lost work as soon as you realize a mistake was made!',
    recommendedCommands: ['reflog', 'reset --hard'],
    unlockPanels: {
      terminal: true,
      internalsInspector: true,
      stagingInspector: true,
    },
  },
  {
    id: 'level-22',
    title: '22. Release Tagging (`git tag`)',
    tier: 4 as any,
    tierTitle: 'Stage 4: Remotes & Recovery',
    category: 'Releases',
    difficulty: 'Advanced',
    description: 'Tags mark permanent release milestones (e.g. `v1.0.0`, `v2.4.1`) in your Git history so deployments can reference fixed versions.',
    expectedGoalText: '👉 In the terminal, create a production release tag: `git tag -a v1.0.0`',
    initialState: () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'Release candidate v1.0' }).state;
      return state;
    },
    validate: (state: GitRepositoryState) => {
      return Object.keys(state.refs.tags || {}).length >= 1;
    },
    hints: [
      'Type `git tag -a v1.0.0` in the terminal.',
      'Notice the release badge attach to your latest commit on the canvas!',
    ],
    pedagogicalTip: 'Unlike branches which move when you commit, a tag remains permanently attached to a specific commit SHA.',
    realWorldContext: 'CI/CD deployment pipelines trigger automated production builds whenever a new version tag (like `v1.0.0`) is pushed.',
    commonGotcha: '`git push` does not push tags automatically! You must run `git push origin --tags` to upload release tags to GitHub.',
    recommendedCommands: ['tag -a v1.0.0', 'tag'],
    unlockPanels: {
      terminal: true,
      stagingInspector: true,
    },
  },
];
