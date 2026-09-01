export interface CommandHelpItem {
  id: string;
  command: string;
  category: 'getting-started' | 'staging-commits' | 'branching-switching' | 'inspecting-history' | 'undoing-fixing' | 'stashing-syncing';
  categoryLabel: string;
  summary: string;
  whatItDoes: string;
  syntax: string;
  sampleExecution: string;
  sampleOutput: string;
  stateEffect: string;
  safetyLevel: 'safe' | 'caution' | 'destructive';
  commonFlags: { flag: string; description: string }[];
  tags: string[];
}

export const COMMAND_HELP_DATA: CommandHelpItem[] = [
  // 1. Getting Started
  {
    id: 'git-init',
    command: 'git init',
    category: 'getting-started',
    categoryLabel: 'Getting Started & Setup',
    summary: 'Initializes a brand new, empty local Git repository.',
    whatItDoes: 'Creates a hidden `.git` directory inside the current folder containing the object store, ref pointers (HEAD), configuration file, and hooks infrastructure.',
    syntax: 'git init [directory-name]',
    sampleExecution: '$ git init my-awesome-project',
    sampleOutput: 'Initialized empty Git repository in /home/dev/my-awesome-project/.git/',
    stateEffect: 'Creates .git directory. Sets default branch (main/master) with HEAD pointing to an unborn ref.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '-b <name>', description: 'Initializes the repository with a specific initial branch name (e.g. `git init -b main`).' },
      { flag: '--bare', description: 'Creates a bare repository without a working directory (used for remote servers/hubs).' },
    ],
    tags: ['init', 'setup', 'start', 'create', 'new'],
  },
  {
    id: 'git-clone',
    command: 'git clone',
    category: 'getting-started',
    categoryLabel: 'Getting Started & Setup',
    summary: 'Clones a remote repository into a newly created local directory.',
    whatItDoes: 'Copies the complete commit history, objects, and refs from a remote URL, checks out the default branch, and configures `origin` as the remote pointer.',
    syntax: 'git clone <url> [destination-folder]',
    sampleExecution: '$ git clone https://github.com/torvalds/linux.git',
    sampleOutput: `Cloning into 'linux'...
remote: Enumerating objects: 1042301, done.
remote: Counting objects: 100% (1042301/1042301), done.
remote: Compressing objects: 100% (164920/164920), done.
Receiving objects: 100% (1042301/1042301), 384.21 MiB | 18.40 MiB/s, done.
Resolving deltas: 100% (872109/872109), done.
Updating files: 100% (82410/82410), done.`,
    stateEffect: 'Copies remote commit tree, sets up remote-tracking branches (origin/main), and initializes working directory.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '--depth <N>', description: 'Creates a shallow clone with a history truncated to the specified number of commits.' },
      { flag: '-b <branch>', description: 'Clones and immediately checks out a specific branch instead of default HEAD.' },
    ],
    tags: ['clone', 'download', 'remote', 'github', 'copy'],
  },
  {
    id: 'git-config',
    command: 'git config',
    category: 'getting-started',
    categoryLabel: 'Getting Started & Setup',
    summary: 'Gets and sets repository or global configuration options.',
    whatItDoes: 'Writes key-value preferences to local (`.git/config`), global (`~/.gitconfig`), or system configuration files (e.g. username, email, editor, aliases).',
    syntax: 'git config [--global] <key> [value]',
    sampleExecution: '$ git config --global user.name "Alex Rivera"',
    sampleOutput: '(Config saved to ~/.gitconfig)',
    stateEffect: 'Updates your author signature for all subsequent commits.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '--global', description: 'Applies configuration to the current OS user profile across all repositories.' },
      { flag: '--list', description: 'Lists all resolved configuration settings currently active.' },
    ],
    tags: ['config', 'settings', 'user', 'email', 'name'],
  },

  // 2. Staging & Commits
  {
    id: 'git-status',
    command: 'git status',
    category: 'staging-commits',
    categoryLabel: 'Staging & Commits',
    summary: 'Displays working tree and staging index status.',
    whatItDoes: 'Compares the three Git zones (Working Tree vs Index vs HEAD) to report untracked files, staged changes, unstaged modifications, and branch sync status.',
    syntax: 'git status [-s]',
    sampleExecution: '$ git status',
    sampleOutput: `On branch feature/auth
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   src/auth.ts
	new file:   src/middleware/jwt.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	temp-debug.log`,
    stateEffect: 'Read-only operation; does not alter repository state.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '-s, --short', description: 'Provides compact, tabular status representation (e.g. `M  src/auth.ts`, `?? log.txt`).' },
      { flag: '-b', description: 'Includes branch and tracking info even in short-format output.' },
    ],
    tags: ['status', 'inspect', 'changed', 'dirty', 'check'],
  },
  {
    id: 'git-add',
    command: 'git add',
    category: 'staging-commits',
    categoryLabel: 'Staging & Commits',
    summary: 'Adds file contents to the staging area (index).',
    whatItDoes: 'Reads file data from the Working Tree, creates SHA-1/SHA-256 blob objects in the `.git/objects` database, and records their paths in `.git/index`.',
    syntax: 'git add <pathspec>',
    sampleExecution: '$ git add src/auth.ts src/middleware/jwt.ts',
    sampleOutput: '(Files staged into Index ready for commit snapshot)',
    stateEffect: 'Populates Staging Index with new blob hashes; marks files green in git status.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '.', description: 'Stages all modified, new, and deleted files in the current directory and subdirectories.' },
      { flag: '-p, --patch', description: 'Interactively review and stage individual diff hunks line-by-line.' },
      { flag: '-u, --update', description: 'Stages modified and deleted files without adding newly created untracked files.' },
    ],
    tags: ['add', 'stage', 'index', 'prepare', 'track'],
  },
  {
    id: 'git-commit',
    command: 'git commit',
    category: 'staging-commits',
    categoryLabel: 'Staging & Commits',
    summary: 'Records snapshots of the staged index changes to the repository history.',
    whatItDoes: 'Packages the staged tree structure into a permanent cryptographically hashed Commit object, links it to current parent commit, and advances the current branch pointer.',
    syntax: 'git commit -m "<message>"',
    sampleExecution: '$ git commit -m "feat(auth): implement JWT token verification middleware"',
    sampleOutput: `[feature/auth 7f8a12e] feat(auth): implement JWT token verification middleware
 2 files changed, 84 insertions(+), 12 deletions(-)
 create mode 100644 src/middleware/jwt.ts`,
    stateEffect: 'Creates new commit object; moves current branch pointer and HEAD to point to new commit SHA.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '-m "<msg>"', description: 'Specifies the commit message directly without opening an external text editor.' },
      { flag: '--amend', description: 'Replaces the tip of the current branch by creating a new commit with combined staged changes.' },
      { flag: '-a, --all', description: 'Automatically stages all tracked modified files before committing (skips untracked).' },
    ],
    tags: ['commit', 'save', 'snapshot', 'record', 'checkpoint'],
  },

  // 3. Branching & Switching
  {
    id: 'git-branch',
    command: 'git branch',
    category: 'branching-switching',
    categoryLabel: 'Branching & Merging',
    summary: 'Lists, creates, renames, or deletes branches.',
    whatItDoes: 'Manages pointer references in `.git/refs/heads/`. A Git branch is merely a 41-byte text file storing the 40-character SHA of a commit.',
    syntax: 'git branch [<branch-name>] [-d <branch-name>]',
    sampleExecution: '$ git branch -a',
    sampleOutput: `  main
* feature/auth
  fix/navbar-overflow
  remotes/origin/main
  remotes/origin/feature/auth`,
    stateEffect: 'Creates or removes a ref pointer file without touching any commit objects.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '-d <name>', description: 'Safely deletes a branch only if it has already been fully merged into upstream.' },
      { flag: '-D <name>', description: 'Force deletes a branch even if it contains unmerged commits.' },
      { flag: '-m <new>', description: 'Renames the current branch to the specified new name.' },
      { flag: '-a, --all', description: 'Lists both local branches and remote-tracking references.' },
    ],
    tags: ['branch', 'pointers', 'list', 'delete', 'create'],
  },
  {
    id: 'git-switch',
    command: 'git switch',
    category: 'branching-switching',
    categoryLabel: 'Branching & Merging',
    summary: 'Switches branches and updates working directory files.',
    whatItDoes: 'Points the `HEAD` reference to another branch and updates files in the Working Tree and Staging Area to match the target commit snapshot.',
    syntax: 'git switch <branch-name>',
    sampleExecution: '$ git switch -c feature/payment-gateway',
    sampleOutput: `Switched to a new branch 'feature/payment-gateway'`,
    stateEffect: 'HEAD ref updated to refs/heads/feature/payment-gateway. Working directory updated.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '-c <name>', description: 'Creates a new branch starting at the current commit and immediately switches to it.' },
      { flag: '-', description: 'Switches back to the previously checked-out branch (quick toggle).' },
      { flag: '--detach', description: 'Checks out a specific commit in Detached HEAD state without branch attachment.' },
    ],
    tags: ['switch', 'checkout', 'navigate', 'move', 'change-branch'],
  },
  {
    id: 'git-merge',
    command: 'git merge',
    category: 'branching-switching',
    categoryLabel: 'Branching & Merging',
    summary: 'Joins two or more development histories together.',
    whatItDoes: 'Finds the best common ancestor commit between current branch and target branch, creates a three-way diff, and creates a new merge commit (or fast-forwards).',
    syntax: 'git merge <target-branch>',
    sampleExecution: '$ git merge feature/auth',
    sampleOutput: `Updating a4b12c9..7f8a12e
Fast-forward
 src/auth.ts           | 14 +++++++++++---
 src/middleware/jwt.ts | 82 +++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 93 insertions(+), 3 deletions(-)
 create mode 100644 src/middleware/jwt.ts`,
    stateEffect: 'Creates a merge commit with 2 parent pointers, or moves branch tip forward in fast-forward mode.',
    safetyLevel: 'caution',
    commonFlags: [
      { flag: '--no-ff', description: 'Always creates a distinct merge commit even if a fast-forward is possible.' },
      { flag: '--squash', description: 'Combines all changes from target branch into working index as a single uncommitted change.' },
      { flag: '--abort', description: 'Aborts an in-progress merge conflict and restores previous pre-merge state.' },
    ],
    tags: ['merge', 'combine', 'integrate', 'fast-forward', 'join'],
  },
  {
    id: 'git-rebase',
    command: 'git rebase',
    category: 'branching-switching',
    categoryLabel: 'Branching & Merging',
    summary: 'Reapplies commits on top of another base tip.',
    whatItDoes: 'Calculates patch diffs for current branch commits, rewinds to common ancestor with target base, and re-executes each commit sequentially to produce a clean linear history.',
    syntax: 'git rebase <upstream-branch>',
    sampleExecution: '$ git rebase main',
    sampleOutput: `Successfully rebased and updated refs/heads/feature/auth.
First, rewinding head to replay your work on top of it...
Applying: feat(auth): add password hashing
Applying: feat(auth): implement JWT token verification middleware`,
    stateEffect: 'Generates duplicate commits with new SHA-1 hashes and timestamps; rewrites local commit lineage.',
    safetyLevel: 'caution',
    commonFlags: [
      { flag: '-i, --interactive', description: 'Opens interactive todo list to squash, edit, reword, or drop individual commits.' },
      { flag: '--onto <newbase>', description: 'Transplants a commit sub-tree onto an entirely new base branch.' },
      { flag: '--abort', description: 'Cancels the rebase and returns the branch to its exact state before rebase was called.' },
      { flag: '--continue', description: 'Continues the rebase loop after manually resolving conflict hunks.' },
    ],
    tags: ['rebase', 'linear', 'interactive', 'squash', 'history'],
  },

  // 4. Inspecting & History
  {
    id: 'git-log',
    command: 'git log',
    category: 'inspecting-history',
    categoryLabel: 'Inspecting & History',
    summary: 'Shows commit logs and cryptographic lineage.',
    whatItDoes: 'Traverses parent pointers starting from HEAD backward in time, displaying author, date, message, and commit hashes.',
    syntax: 'git log [--oneline] [--graph] [--all]',
    sampleExecution: '$ git log --graph --oneline --all -n 5',
    sampleOutput: `* 7f8a12e (HEAD -> feature/auth) feat(auth): implement JWT token verification
* 3b91c04 feat(auth): add password hashing utility
| * d4e8910 (origin/main, main) docs: update installation guide
| * e2109ab fix: resolve memory leak in websocket engine
|/  
* 81a941f Initial project setup with Next.js & Tailwind`,
    stateEffect: 'Read-only inspection tool; does not modify repository state.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '--oneline', description: 'Condenses each commit into a single line with 7-char abbreviated SHA and message.' },
      { flag: '--graph', description: 'Draws a visual ASCII lineage tree showing branch divergences and merges.' },
      { flag: '--all', description: 'Shows commits across all local and remote-tracking branch refs.' },
      { flag: '-n <N>', description: 'Limits the output to the specified number of recent commits.' },
    ],
    tags: ['log', 'history', 'commits', 'inspect', 'tree', 'graph'],
  },
  {
    id: 'git-diff',
    command: 'git diff',
    category: 'inspecting-history',
    categoryLabel: 'Inspecting & History',
    summary: 'Show changes between commits, commit and working tree, etc.',
    whatItDoes: 'Computes line-by-line unified diffs comparing files between Working Tree, Staging Area, or between two arbitrary commit SHAs.',
    syntax: 'git diff [<file>]',
    sampleExecution: '$ git diff --staged',
    sampleOutput: `diff --git a/src/auth.ts b/src/auth.ts
index e69de29..4b825dc 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,3 +10,5 @@ export function verifyToken(rawToken: string): TokenPayload {
+  if (!rawToken.startsWith('Bearer ')) {
+    throw new Error('Malformed authorization header');
+  }
   return jwt.verify(token, process.env.JWT_SECRET);
 }`,
    stateEffect: 'Read-only inspection tool.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '--staged / --cached', description: 'Shows differences between the staging area (index) and the last commit (HEAD).' },
      { flag: 'HEAD~1..HEAD', description: 'Compares the previous commit directly against the latest tip.' },
      { flag: '--stat', description: 'Generates a high-level summary of changed lines and files without full diff chunks.' },
    ],
    tags: ['diff', 'compare', 'changes', 'patch', 'inspect'],
  },
  {
    id: 'git-reflog',
    command: 'git reflog',
    category: 'inspecting-history',
    categoryLabel: 'Inspecting & History',
    summary: 'Manages and displays reference log information.',
    whatItDoes: 'Records every single time the HEAD pointer moved in your local repository (commits, resets, checkouts, merges, rebases). Your ultimate undo safety net.',
    syntax: 'git reflog [show]',
    sampleExecution: '$ git reflog -n 5',
    sampleOutput: `7f8a12e (HEAD -> feature/auth) HEAD@{0}: commit: feat(auth): implement JWT token verification
3b91c04 HEAD@{1}: commit: feat(auth): add password hashing utility
a4b12c9 HEAD@{2}: checkout: moving from main to feature/auth
a4b12c9 (main) HEAD@{3}: reset: moving to HEAD~1
81a941f HEAD@{4}: commit: Initial project setup`,
    stateEffect: 'Read-only log of local pointer trajectory; retains commits for 30-90 days before garbage collection.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: 'expire --expire=now', description: 'Prunes expired reflog entries manually.' },
      { flag: '<refname>', description: 'Inspects movement history for a specific branch (e.g. `git reflog main`).' },
    ],
    tags: ['reflog', 'rescue', 'recover', 'lost', 'undo-anything'],
  },

  // 5. Undoing & Fixing
  {
    id: 'git-restore',
    command: 'git restore',
    category: 'undoing-fixing',
    categoryLabel: 'Undoing & Fixing Mistakes',
    summary: 'Restores working tree files or staging area.',
    whatItDoes: 'Modern command (Git 2.23+) designed specifically to discard uncommitted working changes or unstage files without touching commit history.',
    syntax: 'git restore [--staged] <file>',
    sampleExecution: '$ git restore --staged src/auth.ts',
    sampleOutput: '(Unstaged src/auth.ts — changes preserved in working directory)',
    stateEffect: 'Removes file from Staging Area back to Unstaged modified state without losing edits.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '--staged', description: 'Unstages a file from the Index while keeping your edits intact in the file.' },
      { flag: '.', description: 'Discards all unstaged modifications across the current folder.' },
      { flag: '--source=<commit>', description: 'Restores file content to its exact state in a specific historical commit.' },
    ],
    tags: ['restore', 'unstage', 'discard', 'undo', 'clean'],
  },
  {
    id: 'git-reset',
    command: 'git reset',
    category: 'undoing-fixing',
    categoryLabel: 'Undoing & Fixing Mistakes',
    summary: 'Resets current HEAD to the specified state.',
    whatItDoes: 'Moves the current branch pointer backward to an earlier commit, with flags controlling whether index and working tree are preserved or wiped.',
    syntax: 'git reset [--soft | --mixed | --hard] <commit>',
    sampleExecution: '$ git reset --soft HEAD~1',
    sampleOutput: '(HEAD moved back 1 commit; previous commit changes kept staged in index)',
    stateEffect: 'Rewinds branch ref pointer. `--soft` keeps changes in index; `--hard` wipes files completely.',
    safetyLevel: 'destructive',
    commonFlags: [
      { flag: '--soft', description: 'Moves HEAD only. All committed changes remain staged in the index ready to re-commit.' },
      { flag: '--mixed (default)', description: 'Moves HEAD and unstages changes; keeps modifications in working tree.' },
      { flag: '--hard', description: '⚠️ Destructive! Moves HEAD, resets index, AND overwrites working tree files.' },
    ],
    tags: ['reset', 'rewind', 'undo', 'hard', 'soft'],
  },
  {
    id: 'git-revert',
    command: 'git revert',
    category: 'undoing-fixing',
    categoryLabel: 'Undoing & Fixing Mistakes',
    summary: 'Reverts existing commits by creating an inverse commit.',
    whatItDoes: 'Generates a brand-new commit that applies the exact inverse mathematical diff of a specified bad commit, making it safe for public shared branches.',
    syntax: 'git revert <commit-sha>',
    sampleExecution: '$ git revert 3b91c04',
    sampleOutput: `[main 9d4e21a] Revert "feat(auth): add password hashing utility"
 1 file changed, 2 insertions(+), 18 deletions(-)
 (Brand new commit created preserving full history)`,
    stateEffect: 'Creates a new commit on top of HEAD. Zero history rewritten; completely safe for shared branches.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '--no-commit, -n', description: 'Applies inverse diffs directly to the working tree and index without creating the commit immediately.' },
      { flag: '-m <parent-number>', description: 'Required when reverting a merge commit to declare which parent line to keep.' },
    ],
    tags: ['revert', 'safe-undo', 'public', 'inverse', 'rollback'],
  },

  // 6. Stashing & Syncing
  {
    id: 'git-stash',
    command: 'git stash',
    category: 'stashing-syncing',
    categoryLabel: 'Stashing & Remote Sync',
    summary: 'Stashes changes in a dirty working directory away.',
    whatItDoes: 'Takes all modified tracked files and staged changes, saves them as a temporary shelf object in `.git/refs/stash`, and reverts your working tree to clean HEAD state.',
    syntax: 'git stash [push -m "<name>"] [pop]',
    sampleExecution: '$ git stash push -m "WIP: auth token expiry redesign"',
    sampleOutput: `Saved working directory and index state WIP on feature/auth: 7f8a12e feat(auth): implement JWT token verification
HEAD is now at 7f8a12e feat(auth): implement JWT token verification`,
    stateEffect: 'Stores dirty state in stash stack; cleans working tree to pristine matching HEAD.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: 'pop', description: 'Restores the most recently stashed changes and removes them from the stash stack.' },
      { flag: 'apply', description: 'Restores stashed changes without deleting them from the stash stack.' },
      { flag: '-u, --include-untracked', description: 'Stashes newly created untracked files in addition to tracked modifications.' },
      { flag: 'list', description: 'Displays all stashed work items currently on the stack.' },
    ],
    tags: ['stash', 'save', 'pause', 'temporary', 'shelve'],
  },
  {
    id: 'git-fetch',
    command: 'git fetch',
    category: 'stashing-syncing',
    categoryLabel: 'Stashing & Remote Sync',
    summary: 'Downloads objects and refs from another repository.',
    whatItDoes: 'Contacts remote server (`origin`), downloads any new commits and branches, and updates remote-tracking references (`origin/main`) without modifying your local working files.',
    syntax: 'git fetch [remote] [branch]',
    sampleExecution: '$ git fetch origin',
    sampleOutput: `From https://github.com/company/core-api
 * [new branch]      release/2.0 -> origin/release/2.0
   81a941f..d4e8910  main        -> origin/main`,
    stateEffect: 'Updates remote tracking refs (`refs/remotes/origin/*`). Zero changes to local working tree or local branches.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '--prune, -p', description: 'Deletes local tracking branches that no longer exist on the remote server.' },
      { flag: '--all', description: 'Fetches updates from all configured remotes at once.' },
    ],
    tags: ['fetch', 'sync', 'download', 'remote', 'check-updates'],
  },
  {
    id: 'git-pull',
    command: 'git pull',
    category: 'stashing-syncing',
    categoryLabel: 'Stashing & Remote Sync',
    summary: 'Fetches from and integrates with another repository or a local branch.',
    whatItDoes: 'Combines `git fetch` followed immediately by `git merge FETCH_HEAD` (or `git rebase` if configured).',
    syntax: 'git pull [--rebase] [remote] [branch]',
    sampleExecution: '$ git pull --rebase origin main',
    sampleOutput: `From https://github.com/company/core-api
 * branch            main       -> FETCH_HEAD
Successfully rebased and updated refs/heads/main.`,
    stateEffect: 'Fetches new remote commits and incorporates them directly into your current working branch.',
    safetyLevel: 'caution',
    commonFlags: [
      { flag: '--rebase', description: 'Reapplies your local unpushed commits on top of newly fetched remote commits, preventing ugly merge bubble commits.' },
      { flag: '--no-rebase', description: 'Forces a three-way merge commit when integrating remote changes.' },
    ],
    tags: ['pull', 'update', 'sync', 'download-merge', 'rebase-pull'],
  },
  {
    id: 'git-push',
    command: 'git push',
    category: 'stashing-syncing',
    categoryLabel: 'Stashing & Remote Sync',
    summary: 'Updates remote refs along with associated objects.',
    whatItDoes: 'Sends local commit objects and packfiles to the remote repository and advances the corresponding branch reference on the server.',
    syntax: 'git push [remote] [branch]',
    sampleExecution: '$ git push -u origin feature/auth',
    sampleOutput: `Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (8/8), 2.41 KiB | 2.41 MiB/s, done.
Total 8 (delta 4), reused 0 (delta 0), pack-reused 0
To https://github.com/company/core-api.git
 * [new branch]      feature/auth -> feature/auth
branch 'feature/auth' set up to track 'origin/feature/auth'.`,
    stateEffect: 'Transfers commit objects to remote; synchronizes remote branch tip to match local branch.',
    safetyLevel: 'safe',
    commonFlags: [
      { flag: '-u, --set-upstream', description: 'Configures default remote tracking link so future `git pull` and `git push` require no arguments.' },
      { flag: '--force-with-lease', description: 'Safer force push that ensures you don’t overwrite teammate commits pushed in the interim.' },
    ],
    tags: ['push', 'upload', 'publish', 'remote', 'github'],
  },
];
