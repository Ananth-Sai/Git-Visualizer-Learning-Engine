import { describe, it, expect } from 'vitest';
import {
  createInitialRepository,
  commit,
  createBranch,
  switchBranchOrCommit,
  merge,
  rebase,
  reset,
  stageFile,
  stashPush,
  stashPop,
  findCommonAncestor,
  performThreeWayLineMerge,
  getCommitFiles,
  generateSha,
  getCurrentCommitId,
  cherryPick,
  revertCommit,
  fetchRemote,
  pushRemote,
} from '../core/engine/GitReducer';
import { GitRepositoryState, GitCommit } from '../core/types';

describe('Git Engine Core Reducer & Invariants', () => {
  // 1. Line-Level 3-Way Merge Algorithm
  describe('Line-Level 3-Way Merge', () => {
    it('cleanly auto-merges non-overlapping line edits in the same file', () => {
      const base = `line 1: header\nline 2: middle content\nline 3: footer`;
      const ours = `line 1: header (MODIFIED BY OURS)\nline 2: middle content\nline 3: footer`;
      const theirs = `line 1: header\nline 2: middle content\nline 3: footer (MODIFIED BY THEIRS)`;

      const result = performThreeWayLineMerge(base, ours, theirs, 'main', 'feature');

      expect(result.hasConflict).toBe(false);
      expect(result.content).toContain('MODIFIED BY OURS');
      expect(result.content).toContain('MODIFIED BY THEIRS');
      expect(result.content).toContain('line 2: middle content');
    });

    it('organically detects conflicts when both branches modify the same overlapping lines', () => {
      const base = `function calculateTotal(items) {\n  return items.reduce((a, b) => a + b, 0);\n}`;
      const ours = `function calculateTotal(items) {\n  // Currency formatted\n  return '$' + items.reduce((a, b) => a + b, 0);\n}`;
      const theirs = `function calculateTotal(items) {\n  // Euro formatted\n  return '€' + items.reduce((a, b) => a + b, 0);\n}`;

      const result = performThreeWayLineMerge(base, ours, theirs, 'main', 'feature');

      expect(result.hasConflict).toBe(true);
      expect(result.content).toContain('<<<<<<< main');
      expect(result.content).toContain('=======');
      expect(result.content).toContain('>>>>>>> feature');
      expect(result.conflictData).toBeDefined();
      expect(result.conflictData?.isResolved).toBe(false);
    });
  });

  // 2. Complex DAGs & Lowest Common Ancestor (LCA)
  describe('findCommonAncestor on Non-Trivial DAGs', () => {
    it('correctly resolves Lowest Common Ancestor on a multi-branch diamond DAG', () => {
      // Setup Diamond DAG:
      //         (c2) ── (c4) ── (c6)  [branch-B]
      //        /         \     /
      // (c1) ──           \   /
      //        \           \ /
      //         (c3) ─── (c5) ────── (c7)  [branch-A]
      let state = createInitialRepository(); // c1
      const c1 = state.refs.heads['main'];

      // Branch A path: c1 -> c3 -> c5
      state = createBranch(state, 'branch-A').state;
      state = switchBranchOrCommit(state, 'branch-A').state;
      state = commit(state, { allowEmpty: true, message: 'c3' }).state;
      const c3 = state.refs.heads['branch-A'];
      state = commit(state, { allowEmpty: true, message: 'c5' }).state;
      const c5 = state.refs.heads['branch-A'];

      // Branch B path: c1 -> c2 -> c4
      state = createBranch(state, 'branch-B').state;
      state = switchBranchOrCommit(state, 'branch-B').state;
      // Force parent of c2 to be c1
      state.refs.heads['branch-B'] = c1;
      state = commit(state, { allowEmpty: true, message: 'c2' }).state;
      const c2 = state.refs.heads['branch-B'];
      state = commit(state, { allowEmpty: true, message: 'c4' }).state;
      const c4 = state.refs.heads['branch-B'];

      // Merge c5 into branch-B to create merge commit c6
      const mergeRes = merge(state, 'branch-A');
      expect(mergeRes.type).toBe('three-way');
      const c6 = mergeRes.state.refs.heads['branch-B'];

      // Advance branch-A with c7
      state = switchBranchOrCommit(mergeRes.state, 'branch-A').state;
      state = commit(state, { allowEmpty: true, message: 'c7' }).state;
      const c7 = state.refs.heads['branch-A'];

      // The lowest common ancestor between c6 (merge of c4 & c5) and c7 (child of c5) MUST be c5, NOT c1!
      const lca = findCommonAncestor(state, c6, c7);
      expect(lca).toBe(c5);
    });
  });

  // 3. Full Repository Merge Workflows
  describe('Repository Merging End-to-End', () => {
    it('executes fast-forward merge cleanly and moves branch pointer', () => {
      let state = createInitialRepository();
      const initialCommitId = state.refs.heads['main'];

      state = createBranch(state, 'feat').state;
      state = switchBranchOrCommit(state, 'feat').state;
      state = commit(state, { allowEmpty: true, message: 'feat: add login' }).state;
      const featCommitId = state.refs.heads['feat'];

      state = switchBranchOrCommit(state, 'main').state;
      const mergeRes = merge(state, 'feat');

      expect(mergeRes.type).toBe('fast-forward');
      expect(mergeRes.state.refs.heads['main']).toBe(featCommitId);
    });

    it('organically enters conflict state when merging divergent conflicting branches in sandbox', () => {
      let state = createInitialRepository();
      
      // Commit on main
      state.workingTree['config.ts'] = { path: 'config.ts', content: 'port = 3000;\nenv = "production";', stage: 'modified' };
      state = stageFile(state, 'config.ts');
      state = commit(state, { message: 'main: config v1' }).state;

      // Branch out
      state = createBranch(state, 'feat-port').state;
      state = switchBranchOrCommit(state, 'feat-port').state;
      state.workingTree['config.ts'] = { path: 'config.ts', content: 'port = 8080;\nenv = "production";', stage: 'modified' };
      state = stageFile(state, 'config.ts');
      state = commit(state, { message: 'feat: change port to 8080' }).state;

      // Switch to main and make conflicting change
      state = switchBranchOrCommit(state, 'main').state;
      state.workingTree['config.ts'] = { path: 'config.ts', content: 'port = 9000;\nenv = "production";', stage: 'modified' };
      state = stageFile(state, 'config.ts');
      state = commit(state, { message: 'main: change port to 9000' }).state;

      // Merge feat-port into main -> MUST trigger conflict!
      const mergeRes = merge(state, 'feat-port');

      expect(mergeRes.type).toBe('conflict');
      expect(mergeRes.state.conflicts['config.ts']).toBeDefined();
      expect(mergeRes.state.conflicts['config.ts'].isResolved).toBe(false);
      expect(mergeRes.state.workingTree['config.ts'].stage).toBe('conflicted');
      expect(mergeRes.state.activeOperation?.type).toBe('merge');
    });
  });

  // 4. Rebase Engine
  describe('Linear Rebase Engine', () => {
    it('replays branch commits linearly on top of upstream target with new SHAs', () => {
      let state = createInitialRepository();
      state = commit(state, { allowEmpty: true, message: 'main commit 1' }).state;
      const mainTip = state.refs.heads['main'];

      state = createBranch(state, 'feat').state;
      state = switchBranchOrCommit(state, 'feat').state;
      state = commit(state, { allowEmpty: true, message: 'feat commit 1' }).state;
      const oldFeatTip = state.refs.heads['feat'];

      state = switchBranchOrCommit(state, 'main').state;
      state = commit(state, { allowEmpty: true, message: 'main commit 2' }).state;
      const newMainTip = state.refs.heads['main'];

      // Rebase feat onto main
      state = switchBranchOrCommit(state, 'feat').state;
      const rebaseRes = rebase(state, 'main');

      expect(rebaseRes.error).toBeUndefined();
      const newFeatTip = rebaseRes.state.refs.heads['feat'];
      expect(newFeatTip).not.toBe(oldFeatTip);

      const rebasedCommit = rebaseRes.state.objects[newFeatTip] as GitCommit;
      expect(rebasedCommit.parents).toContain(newMainTip);
    });
  });

  // 5. Reset Invariants
  describe('Reset Modes (--soft, --mixed, --hard)', () => {
    it('--soft rewinds HEAD pointer while preserving staged index', () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'c1' }).state;
      const c1Id = state.refs.heads['main'];

      state.workingTree['auth.ts'] = { path: 'auth.ts', content: 'token=123', stage: 'modified' };
      state = stageFile(state, 'auth.ts');
      state = commit(state, { message: 'c2' }).state;

      const resetRes = reset(state, 'HEAD~1', 'soft');
      expect(resetRes.state.refs.heads['main']).toBe(c1Id);
      expect(resetRes.state.stagingArea['auth.ts']).toBeDefined();
    });

    it('--hard wipes uncommitted working tree and index to match target commit', () => {
      let state = createInitialRepository();
      state = commit(state, { message: 'c1' }).state;
      const c1Id = state.refs.heads['main'];

      state.workingTree['dirty.txt'] = { path: 'dirty.txt', content: 'uncommitted edits', stage: 'modified' };

      const resetRes = reset(state, 'HEAD', 'hard');
      expect(resetRes.state.workingTree['dirty.txt']).toBeUndefined();
    });
  });

  // 6. Stash Stack
  describe('Stash Operations', () => {
    it('shelves dirty modifications and restores cleanly on pop', () => {
      let state = createInitialRepository();
      state.workingTree['wip.ts'] = { path: 'wip.ts', content: 'in progress code', stage: 'modified' };

      const stashRes = stashPush(state, 'WIP my work');
      expect(stashRes.state.stash.length).toBe(1);
      expect(stashRes.state.workingTree['wip.ts']).toBeUndefined();

      const popRes = stashPop(stashRes.state);
      expect(popRes.state.stash.length).toBe(0);
      expect(popRes.state.workingTree['wip.ts']).toBeDefined();
      expect(popRes.state.workingTree['wip.ts'].content).toBe('in progress code');
    });
  });

  // 7. Organic Merge Conflict Resolution Lifecycle
  describe('Organic Merge Conflict Lifecycle', () => {
    it('triggers conflict on diverged line overlap and creates 2-parent merge commit upon resolution', () => {
      let state = createInitialRepository();
      state = stageFile(state, 'config.ts', 'export const PORT = 3000;\nexport const HOST = "localhost";');
      state = commit(state, { message: 'Base config' }).state;

      // Diverged branch feature: PORT = 5000
      state = createBranch(state, 'feature').state;
      state = switchBranchOrCommit(state, 'feature').state;
      state = stageFile(state, 'config.ts', 'export const PORT = 5000;\nexport const HOST = "localhost";');
      state = commit(state, { message: 'Feature config' }).state;
      const featTip = state.refs.heads['feature'];

      // Diverged branch main: PORT = 8080
      state = switchBranchOrCommit(state, 'main').state;
      state = stageFile(state, 'config.ts', 'export const PORT = 8080;\nexport const HOST = "localhost";');
      state = commit(state, { message: 'Main config' }).state;
      const mainTip = state.refs.heads['main'];

      // 1. Merge feature into main -> must trigger conflict halt
      const mergeRes = merge(state, 'feature');
      expect(mergeRes.type).toBe('conflict');
      expect(mergeRes.state.conflicts['config.ts']).toBeDefined();
      expect(mergeRes.state.conflicts['config.ts'].isResolved).toBe(false);
      expect(mergeRes.state.activeOperation?.type).toBe('merge');

      // 2. Resolve conflict
      let resolvedState = mergeRes.state;
      resolvedState = stageFile(resolvedState, 'config.ts', 'export const PORT = 8080;\nexport const HOST = "localhost";');
      resolvedState.conflicts['config.ts'] = {
        ...resolvedState.conflicts['config.ts'],
        isResolved: true,
        resolvedContent: 'export const PORT = 8080;\nexport const HOST = "localhost";',
      };

      // 3. Finalize merge commit
      const finalRes = commit(resolvedState, { message: "Merge branch 'feature' into main" });
      const finalCommit = finalRes.state.objects[finalRes.commitId] as GitCommit;

      expect(finalCommit.parents).toContain(mainTip);
      expect(finalCommit.parents).toContain(featTip);
      expect(finalCommit.parents.length).toBe(2);
      expect(Object.keys(finalRes.state.conflicts).length).toBe(0);
    });
  });

  // 8. Cherry-Pick & Revert (Real File Content State Transitions)
  describe('Cherry-Pick & Revert Operations', () => {
    it('cherry-picks a commit by applying its file changes on current HEAD', () => {
      let state = createInitialRepository();
      state = createBranch(state, 'feature').state;
      state = switchBranchOrCommit(state, 'feature').state;
      state = stageFile(state, 'utils.ts', 'export const add = (a, b) => a + b;');
      const featureCommit = commit(state, { message: 'feat: add math utils' });
      state = featureCommit.state;

      // Switch back to main (where utils.ts does not exist)
      state = switchBranchOrCommit(state, 'main').state;
      expect(getCommitFiles(state, getCurrentCommitId(state))['utils.ts']).toBeUndefined();

      // Cherry-pick feature commit onto main
      const cpRes = cherryPick(state, featureCommit.commitId);
      expect(cpRes.error).toBeUndefined();
      const mainFiles = getCommitFiles(cpRes.state, getCurrentCommitId(cpRes.state));
      expect(mainFiles['utils.ts']).toBe('export const add = (a, b) => a + b;');
    });

    it('reverts a commit by restoring previous file states in a new commit', () => {
      let state = createInitialRepository();
      state = stageFile(state, 'config.json', '{"debug": true}');
      const commitRes = commit(state, { message: 'enable debug mode' });
      state = commitRes.state;

      // Revert the debug commit
      const revRes = revertCommit(state, commitRes.commitId);
      expect(revRes.error).toBeUndefined();
      const revertedFiles = getCommitFiles(revRes.state, getCurrentCommitId(revRes.state));
      expect(revertedFiles['config.json']).toBeUndefined();
    });
  });

  // 9. Remote Tracking Synchronization (Fetch & Push)
  describe('Remote Tracking Synchronization', () => {
    it('updates origin remote refs upon fetch and push', () => {
      let state = createInitialRepository();
      state = stageFile(state, 'app.ts', 'console.log("prod");');
      const c1 = commit(state, { message: 'prod release v1' });
      state = c1.state;

      // Push to origin
      const pushRes = pushRemote(state, 'origin', 'main');
      expect(pushRes.state.refs.remotes['origin']['main']).toBe(c1.commitId);

      // Fetch from origin
      const fetchRes = fetchRemote(pushRes.state, 'origin');
      expect(fetchRes.state.refs.remotes['origin']['main']).toBe(c1.commitId);
    });
  });
});



describe('Repository snapshot semantics', () => {
  it('keeps the HEAD snapshot intact while committing only staged changes', () => {
    let state = createInitialRepository();
    const initialHead = getCurrentCommitId(state)!;
    state = stageFile(state, 'new.ts', 'export const value = 1;');
    state.workingTree['index.ts'].content = 'console.log("unstaged");';
    const result = commit(state, { message: 'Add new file' });

    expect(result.error).toBeUndefined();
    expect(getCommitFiles(result.state, result.commitId)['new.ts']).toBe('export const value = 1;');
    expect(getCommitFiles(result.state, result.commitId)['index.ts']).toBe('console.log("Hello, Fluid Git!");');
    expect(getCommitFiles(result.state, initialHead)['index.ts']).toBe('console.log("Hello, Fluid Git!");');
    expect(result.state.workingTree['index.ts'].stage).toBe('modified');
  });

  it('rejects a normal commit when the index and HEAD are identical', () => {
    const state = createInitialRepository();
    const result = commit(state, { message: 'Nothing changed' });
    expect(result.error).toContain('nothing to commit');
  });

  it('allows explicit empty commits for curriculum fixture construction', () => {
    const state = createInitialRepository();
    const result = commit(state, { allowEmpty: true, message: 'Fixture checkpoint' });
    expect(result.error).toBeUndefined();
    expect(result.state.refs.heads.main).toBe(result.commitId);
    expect(getCommitFiles(result.state, result.commitId)).toEqual(getCommitFiles(state, getCurrentCommitId(state)));
  });

  it('amends the last commit using the current index snapshot', () => {
    let state = createInitialRepository();
    state = stageFile(state, 'profile.ts', 'export const profile = true;');
    state = commit(state, { message: 'Add profile' }).state;
    const oldHead = getCurrentCommitId(state)!;
    state = stageFile(state, 'profile.ts', 'export const profile = false;');
    const result = commit(state, { amend: true, message: 'Fix profile' });

    expect(result.error).toBeUndefined();
    expect(result.commitId).not.toBe(oldHead);
    expect(getCommitFiles(result.state, result.commitId)['profile.ts']).toBe('export const profile = false;');
    expect((result.state.objects[result.commitId] as GitCommit).parents).toEqual(
      (state.objects[oldHead] as GitCommit).parents
    );
  });

  it('cherry-picks the target commit delta rather than copying the whole target tree', () => {
    let state = createInitialRepository();
    state = createBranch(state, 'feature').state;
    state = switchBranchOrCommit(state, 'feature').state;
    state = stageFile(state, 'feature.ts', 'feature work');
    const featureCommit = commit(state, { message: 'Add feature' }).state;
    const featureId = getCurrentCommitId(featureCommit)!;
    state = switchBranchOrCommit(featureCommit, 'main').state;

    const result = cherryPick(state, featureId);
    expect(result.error).toBeUndefined();
    expect(getCommitFiles(result.state, result.commitId!)['feature.ts']).toBe('feature work');
    expect(getCommitFiles(result.state, result.commitId!)['index.ts']).toBe('console.log("Hello, Fluid Git!");');
  });

  it('reverts an added file by removing it from the resulting snapshot', () => {
    let state = createInitialRepository();
    state = stageFile(state, 'bad.ts', 'bad change');
    state = commit(state, { message: 'Add bad change' }).state;
    const badCommit = getCurrentCommitId(state)!;

    const result = revertCommit(state, badCommit);
    expect(result.error).toBeUndefined();
    expect(getCommitFiles(result.state, result.commitId!)['bad.ts']).toBeUndefined();
    expect((result.state.objects[result.commitId!] as GitCommit).message).toContain('Revert');
  });
});


describe('Branch checkout and rebase snapshots', () => {
  it('checks out the target branch snapshot instead of leaving the old files visible', () => {
    let state = createInitialRepository();
    state = createBranch(state, 'feature').state;
    state = switchBranchOrCommit(state, 'feature').state;
    state = stageFile(state, 'feature.ts', 'feature only');
    state = commit(state, { message: 'Feature file' }).state;
    state = switchBranchOrCommit(state, 'main').state;

    expect(state.workingTree['feature.ts']).toBeUndefined();
    expect(state.workingTree['index.ts']?.content).toBe('console.log("Hello, Fluid Git!");');
  });

  it("replays a feature commit's content delta onto the new base during rebase", () => {
    let state = createInitialRepository();
    state = stageFile(state, 'app.ts', 'const value = 1;');
    state = commit(state, { message: 'Base app' }).state;
    state = createBranch(state, 'feature').state;
    state = switchBranchOrCommit(state, 'feature').state;
    state = stageFile(state, 'feature.ts', 'feature work');
    state = commit(state, { message: 'Feature work' }).state;
    state = switchBranchOrCommit(state, 'main').state;
    state = stageFile(state, 'app.ts', 'const value = 2;');
    state = commit(state, { message: 'Main update' }).state;
    state = switchBranchOrCommit(state, 'feature').state;

    const result = rebase(state, 'main');
    expect(result.error).toBeUndefined();
    const rebasedId = result.state.refs.heads.feature;
    const files = getCommitFiles(result.state, rebasedId);
    expect(files['app.ts']).toBe('const value = 2;');
    expect(files['feature.ts']).toBe('feature work');
    expect((result.state.objects[rebasedId] as GitCommit).parents[0]).toBe(result.state.refs.heads.main);
  });
});
