import * as Diff from 'diff';
import {
  GitRepositoryState,
  GitCommit,
  GitTree,
  GitBlob,
  ObjectId,
  FileState,
  ReflogEntry,
  StashEntry,
  ConflictFile,
} from '../types';

// Deterministic short SHA-1 generator based on input payload
export function generateSha(content: string, salt = ''): ObjectId {
  let hash = 0;
  const combined = content + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(7, '0').slice(0, 7);
  return hex;
}

export function createInitialRepository(): GitRepositoryState {
  const rootBlobId = generateSha('console.log("Hello, Fluid Git!");');
  const rootTreeId = generateSha(`100644 blob ${rootBlobId}\tindex.ts`);
  const initialCommitId = generateSha(`tree ${rootTreeId}\nauthor Initial\nInitial commit`, 'init');

  const rootBlob: GitBlob = {
    id: rootBlobId,
    type: 'blob',
    content: 'console.log("Hello, Fluid Git!");',
  };

  const rootTree: GitTree = {
    id: rootTreeId,
    type: 'tree',
    entries: {
      'index.ts': {
        mode: '100644',
        path: 'index.ts',
        id: rootBlobId,
        type: 'blob',
      },
    },
  };

  const initialCommit: GitCommit = {
    id: initialCommitId,
    type: 'commit',
    tree: rootTreeId,
    parents: [],
    author: {
      name: 'Developer',
      email: 'dev@gitfluid.io',
      timestamp: Date.now(),
    },
    message: 'Initial commit',
    branchTag: 'main',
  };

  const fileState: FileState = {
    path: 'index.ts',
    content: 'console.log("Hello, Fluid Git!");',
    stage: 'committed',
  };

  const state: GitRepositoryState = {
    objects: {
      [rootBlobId]: rootBlob,
      [rootTreeId]: rootTree,
      [initialCommitId]: initialCommit,
    },
    refs: {
      heads: {
        main: initialCommitId,
      },
      tags: {},
      remotes: {
        origin: {
          main: initialCommitId,
        },
      },
    },
    head: {
      type: 'branch',
      target: 'main',
    },
    workingTree: {
      'index.ts': fileState,
    },
    stagingArea: {
      'index.ts': rootBlobId,
    },
    stash: [],
    reflog: {
      HEAD: [
        {
          id: `reflog-${Date.now()}-1`,
          oldTarget: null,
          newTarget: initialCommitId,
          command: 'commit (initial)',
          message: 'commit (initial): Initial commit',
          timestamp: Date.now(),
        },
      ],
      main: [
        {
          id: `reflog-${Date.now()}-2`,
          oldTarget: null,
          newTarget: initialCommitId,
          command: 'commit (initial)',
          message: 'commit (initial): Initial commit',
          timestamp: Date.now(),
        },
      ],
    },
    conflicts: {},
  };

  return state;
}

export function getCurrentCommitId(state: GitRepositoryState): ObjectId | null {
  if (state.head.type === 'branch') {
    return state.refs.heads[state.head.target] || null;
  }
  return state.head.target || null;
}

export function recordReflog(
  state: GitRepositoryState,
  ref: string,
  oldTarget: ObjectId | null,
  newTarget: ObjectId,
  command: string,
  message: string
): GitRepositoryState {
  const entry: ReflogEntry = {
    id: `reflog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    oldTarget,
    newTarget,
    command,
    message,
    timestamp: Date.now(),
  };

  const currentReflog = state.reflog[ref] ? [...state.reflog[ref]] : [];
  return {
    ...state,
    reflog: {
      ...state.reflog,
      [ref]: [entry, ...currentReflog],
    },
  };
}

export interface CommitOptions {
  message: string;
  author?: { name: string; email: string };
  amend?: boolean;
  allowEmpty?: boolean;
}

export function commit(state: GitRepositoryState, options: CommitOptions): { state: GitRepositoryState; commitId: ObjectId; error?: string } {
  const currentHeadCommitId = getCurrentCommitId(state);
  const currentFiles = commitTreeFiles(state, currentHeadCommitId);
  const index = normalizeIndexAgainstHead(state);
  const indexFiles = snapshotFromIndex(state, index);
  const workingTree = { ...state.workingTree };

  if (
    !options.amend &&
    state.activeOperation?.type !== 'merge' &&
    JSON.stringify(indexFiles) === JSON.stringify(currentFiles) &&
    !options.allowEmpty
  ) {
    return { state, commitId: '', error: 'nothing to commit, working tree clean' };
  }

  const parents = currentHeadCommitId ? [currentHeadCommitId] : [];
  if (state.activeOperation?.type === 'merge' && state.activeOperation.sourceBranch) {
    const sourceCommitId = state.refs.heads[state.activeOperation.sourceBranch];
    if (sourceCommitId && !parents.includes(sourceCommitId)) parents.push(sourceCommitId);
  }

  const treeResult = buildTreeFromFiles(state, indexFiles);
  const objects = treeResult.objects;
  const timestamp = Date.now();
  const message = options.message || 'Update files';
  const oldCommit = options.amend && currentHeadCommitId ? objects[currentHeadCommitId] as GitCommit : null;
  const finalParents = oldCommit ? [...oldCommit.parents] : parents;
  const newCommitId = generateSha(
    `commit:${message}:${treeResult.treeId}:${finalParents.join(',')}:${timestamp}`
  );
  const newCommit: GitCommit = {
    id: newCommitId,
    type: 'commit',
    tree: treeResult.treeId,
    parents: finalParents,
    author: {
      name: options.author?.name || oldCommit?.author.name || 'Developer',
      email: options.author?.email || oldCommit?.author.email || 'dev@gitfluid.io',
      timestamp,
    },
    message,
    branchTag: state.head.type === 'branch' ? state.head.target : undefined,
  };
  objects[newCommitId] = newCommit;

  const refs = { ...state.refs, heads: { ...state.refs.heads } };
  if (state.head.type === 'branch') refs.heads[state.head.target] = newCommitId;

  for (const [path, file] of Object.entries(workingTree)) {
    const stagedContent = indexFiles[path];
    workingTree[path] = {
      ...file,
      stage: stagedContent !== undefined && file.content === stagedContent ? 'committed' : file.stage,
      stagedContent: stagedContent,
    };
  }

  const committedWorkingTree: Record<string, FileState> = {};
  for (const [path, content] of Object.entries(indexFiles)) {
    committedWorkingTree[path] = {
      ...(workingTree[path] || { path }),
      path,
      content: workingTree[path]?.content ?? content,
      stage: workingTree[path]?.content === content ? 'committed' : 'modified',
      stagedContent: content,
    };
  }
  for (const [path, file] of Object.entries(workingTree)) {
    if (!(path in indexFiles)) committedWorkingTree[path] = file;
  }

  const nextState: GitRepositoryState = {
    ...state,
    objects,
    refs,
    // The index represents the new HEAD snapshot after a successful commit.
    stagingArea: Object.fromEntries(
      Object.entries(treeResult.tree.entries).map(([path, entry]) => [path, entry.id])
    ),
    workingTree: committedWorkingTree,
    head: state.head.type === 'branch' ? { ...state.head } : { type: 'detached', target: newCommitId },
    conflicts: {},
    activeOperation: undefined,
  };

  let withReflog = recordReflog(
    nextState,
    'HEAD',
    currentHeadCommitId,
    newCommitId,
    options.amend ? 'commit (amend)' : 'commit',
    `${options.amend ? 'commit (amend)' : 'commit'}: ${message}`
  );
  if (state.head.type === 'branch') {
    withReflog = recordReflog(
      withReflog,
      state.head.target,
      currentHeadCommitId,
      newCommitId,
      options.amend ? 'commit (amend)' : 'commit',
      `${options.amend ? 'commit (amend)' : 'commit'}: ${message}`
    );
  }
  return { state: withReflog, commitId: newCommitId };
}

export function createBranch(state: GitRepositoryState, branchName: string, startPoint?: string): { state: GitRepositoryState; error?: string } {
  if (state.refs.heads[branchName]) {
    return { state, error: `fatal: a branch named '${branchName}' already exists` };
  }

  const targetCommit = startPoint ? (state.refs.heads[startPoint] || startPoint) : getCurrentCommitId(state);
  if (!targetCommit || !state.objects[targetCommit]) {
    return { state, error: `fatal: not a valid object name: '${startPoint || 'HEAD'}'` };
  }

  const refs = {
    ...state.refs,
    heads: {
      ...state.refs.heads,
      [branchName]: targetCommit,
    },
  };

  let nextState: GitRepositoryState = {
    ...state,
    refs,
  };

  nextState = recordReflog(nextState, branchName, null, targetCommit, 'branch: Created', `branch: Created from ${state.head.target}`);

  return { state: nextState };
}


function repositoryIsDirty(state: GitRepositoryState): boolean {
  const headFiles = getCommitFiles(state, getCurrentCommitId(state));
  const indexFiles = getIndexFiles(state);
  const paths = new Set([...Object.keys(headFiles), ...Object.keys(indexFiles), ...Object.keys(state.workingTree)]);
  for (const path of paths) {
    if (headFiles[path] !== indexFiles[path]) return true;
    if (indexFiles[path] !== state.workingTree[path]?.content) return true;
    if (headFiles[path] !== state.workingTree[path]?.content) return true;
  }
  return false;
}

function checkoutCommitSnapshot(state: GitRepositoryState, commitId: ObjectId): GitRepositoryState {
  const files = getCommitFiles(state, commitId);
  const objects = { ...state.objects };
  const stagingArea: Record<string, ObjectId> = {};
  const workingTree: Record<string, FileState> = {};
  for (const [path, content] of Object.entries(files)) {
    const existing = Object.entries(objects).find(([, obj]) => obj.type === 'blob' && obj.content === content);
    const blobId = existing?.[0] || generateSha(`blob:${content}`);
    if (!existing) objects[blobId] = { id: blobId, type: 'blob', content };
    stagingArea[path] = blobId;
    workingTree[path] = { path, content, stage: 'committed', stagedContent: content };
  }
  return { ...state, objects, stagingArea, workingTree };
}

export function switchBranchOrCommit(state: GitRepositoryState, target: string, createNewBranch = false): { state: GitRepositoryState; error?: string } {
  const currentHeadCommitId = getCurrentCommitId(state);

  if (createNewBranch) {
    const branchRes = createBranch(state, target);
    if (branchRes.error) return branchRes;
    const nextState: GitRepositoryState = { ...branchRes.state, head: { type: 'branch', target } };
    return {
      state: recordReflog(nextState, 'HEAD', currentHeadCommitId, getCurrentCommitId(nextState)!, 'checkout: moving from HEAD', `checkout: moving to ${target}`),
    };
  }

  let nextCommit: ObjectId | null = null;
  let nextHead: GitRepositoryState['head'] | null = null;
  if (state.refs.heads[target]) {
    nextCommit = state.refs.heads[target];
    nextHead = { type: 'branch', target };
  } else if (state.objects[target]?.type === 'commit') {
    nextCommit = target;
    nextHead = { type: 'detached', target };
  }

  if (!nextCommit || !nextHead) {
    return { state, error: `error: pathspec '${target}' did not match any file(s) known to git` };
  }

  if (repositoryIsDirty(state)) {
    return { state, error: 'error: Your local changes would be overwritten by checkout. Commit, stash, or restore them before switching.' };
  }

  let nextState = checkoutCommitSnapshot(state, nextCommit);
  nextState = { ...nextState, head: nextHead };
  return {
    state: recordReflog(
      nextState,
      'HEAD',
      currentHeadCommitId,
      nextCommit,
      'checkout: moving',
      `checkout: moving from ${state.head.target} to ${target}`
    ),
  };
}

export function getCommitFiles(state: GitRepositoryState, commitId: ObjectId | null): Record<string, string> {
  if (!commitId) return {};
  const commitObj = state.objects[commitId] as GitCommit;
  if (!commitObj || !commitObj.tree) return {};
  const treeObj = state.objects[commitObj.tree] as GitTree;
  if (!treeObj || !treeObj.entries) return {};

  const files: Record<string, string> = {};
  for (const [path, entry] of Object.entries(treeObj.entries)) {
    const blobObj = state.objects[entry.id] as GitBlob;
    files[path] = blobObj ? blobObj.content : '';
  }
  return files;
}


export function getIndexFiles(state: GitRepositoryState): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [path, blobId] of Object.entries(state.stagingArea)) {
    const blob = state.objects[blobId] as GitBlob;
    if (blob?.type === 'blob') files[path] = blob.content;
  }
  return files;
}

function buildTreeFromFiles(
  state: GitRepositoryState,
  files: Record<string, string>
): { objects: GitRepositoryState['objects']; treeId: ObjectId; tree: GitTree } {
  const objects = { ...state.objects };
  const entries: Record<string, GitTree['entries'][string]> = {};
  for (const [path, content] of Object.entries(files)) {
    const blobId = generateSha(`blob:${content}`);
    objects[blobId] = { id: blobId, type: 'blob', content };
    entries[path] = { mode: '100644', path, id: blobId, type: 'blob' };
  }
  const treeId = generateSha(`tree:${JSON.stringify(entries)}`);
  const tree: GitTree = { id: treeId, type: 'tree', entries };
  objects[treeId] = tree;
  return { objects, treeId, tree };
}

function normalizeIndexAgainstHead(state: GitRepositoryState): Record<string, ObjectId> {
  const index: Record<string, ObjectId> = {};
  const headId = getCurrentCommitId(state);
  if (headId) {
    const headCommit = state.objects[headId] as GitCommit;
    const headTree = headCommit ? (state.objects[headCommit.tree] as GitTree) : undefined;
    if (headTree?.entries) {
      for (const [path, entry] of Object.entries(headTree.entries)) {
        if (!(path in state.workingTree) && !(path in state.stagingArea)) {
          continue;
        }
        index[path] = entry.id;
      }
    }
  }
  for (const [path, blobId] of Object.entries(state.stagingArea)) index[path] = blobId;
  return index;
}

function snapshotFromIndex(state: GitRepositoryState, index: Record<string, ObjectId>): Record<string, string> {
  const files: Record<string, string> = {};
  for (const [path, blobId] of Object.entries(index)) {
    const blob = state.objects[blobId] as GitBlob;
    if (blob?.type === 'blob') files[path] = blob.content;
  }
  return files;
}

function applySnapshotToWorkingTree(
  state: GitRepositoryState,
  files: Record<string, string>
): GitRepositoryState {
  const workingTree: Record<string, FileState> = {};
  const stagingArea: Record<string, ObjectId> = {};
  const objects = { ...state.objects };
  for (const [path, content] of Object.entries(files)) {
    const blobId = generateSha(`blob:${content}`);
    objects[blobId] = { id: blobId, type: 'blob', content };
    stagingArea[path] = blobId;
    workingTree[path] = { path, content, stage: 'staged' };
  }
  return { ...state, objects, stagingArea, workingTree };
}

function commitTreeFiles(state: GitRepositoryState, commitId: ObjectId | null): Record<string, string> {
  return getCommitFiles(state, commitId);
}

export interface ThreeWayLineMergeResult {
  hasConflict: boolean;
  content: string;
  conflictData?: {
    base: string;
    ours: string;
    theirs: string;
    isResolved: boolean;
  };
}

/**
 * Line-level 3-way merge algorithm.
 * Compares Base (ancestor), Ours (current HEAD), and Theirs (source branch).
 * Automatically merges non-overlapping line changes cleanly.
 * Flags conflicts only when modifications overlap on the exact same lines.
 */
export function performThreeWayLineMerge(
  base: string,
  ours: string,
  theirs: string,
  oursLabel = 'HEAD',
  theirsLabel = 'incoming'
): ThreeWayLineMergeResult {
  // Fast path 1: identical content in ours and theirs
  if (ours === theirs) {
    return { hasConflict: false, content: ours };
  }
  // Fast path 2: only theirs modified from base
  if (ours === base) {
    return { hasConflict: false, content: theirs };
  }
  // Fast path 3: only ours modified from base
  if (theirs === base) {
    return { hasConflict: false, content: ours };
  }

  const baseLines = base.split('\n');
  const oursLines = ours.split('\n');
  const theirsLines = theirs.split('\n');

  // Base is empty or newly created file on both sides
  if (base.trim() === '') {
    if (ours.trim() === theirs.trim()) {
      return { hasConflict: false, content: ours };
    }
    const conflictContent = `<<<<<<< ${oursLabel}\n${ours}\n=======\n${theirs}\n>>>>>>> ${theirsLabel}`;
    return {
      hasConflict: true,
      content: conflictContent,
      conflictData: { base, ours, theirs, isResolved: false },
    };
  }

  // Compute array-level line diffs against base
  const changesOurs = Diff.diffArrays(baseLines, oursLines);
  const changesTheirs = Diff.diffArrays(baseLines, theirsLines);

  interface LineRegion {
    baseStart: number;
    baseEnd: number;
    newLines: string[];
    isUnchanged: boolean;
  }

  const getRegions = (changes: Diff.ArrayChange<string>[]): LineRegion[] => {
    const regions: LineRegion[] = [];
    let curBase = 0;
    for (const change of changes) {
      const count = change.value.length;
      if (!change.added && !change.removed) {
        regions.push({ baseStart: curBase, baseEnd: curBase + count, newLines: change.value, isUnchanged: true });
        curBase += count;
      } else if (change.removed) {
        regions.push({ baseStart: curBase, baseEnd: curBase + count, newLines: [], isUnchanged: false });
        curBase += count;
      } else if (change.added) {
        regions.push({ baseStart: curBase, baseEnd: curBase, newLines: change.value, isUnchanged: false });
      }
    }
    return regions;
  };

  const regOurs = getRegions(changesOurs).filter((r) => !r.isUnchanged);
  const regTheirs = getRegions(changesTheirs).filter((r) => !r.isUnchanged);

  // Detect line range overlaps in base coordinates
  let hasOverlap = false;
  for (const ro of regOurs) {
    for (const rt of regTheirs) {
      const rangesOverlap =
        (ro.baseStart < rt.baseEnd && rt.baseStart < ro.baseEnd) ||
        (ro.baseStart === ro.baseEnd && rt.baseStart === rt.baseEnd && ro.baseStart === rt.baseStart);
      if (rangesOverlap) {
        if (ro.newLines.join('\n') !== rt.newLines.join('\n')) {
          hasOverlap = true;
          break;
        }
      }
    }
    if (hasOverlap) break;
  }

  if (hasOverlap) {
    // True line-level overlap conflict!
    const conflictContent = `<<<<<<< ${oursLabel}\n${ours}\n=======\n${theirs}\n>>>>>>> ${theirsLabel}`;
    return {
      hasConflict: true,
      content: conflictContent,
      conflictData: { base, ours, theirs, isResolved: false },
    };
  }

  // Non-overlapping: apply edits in base line order cleanly
  const allEdits = [
    ...regOurs.map((r) => ({ ...r, side: 'ours' })),
    ...regTheirs.map((r) => ({ ...r, side: 'theirs' })),
  ].sort((a, b) => a.baseStart - b.baseStart);

  const resultLines: string[] = [];
  let basePointer = 0;

  for (const edit of allEdits) {
    while (basePointer < edit.baseStart) {
      resultLines.push(baseLines[basePointer]);
      basePointer++;
    }
    resultLines.push(...edit.newLines);
    basePointer = Math.max(basePointer, edit.baseEnd);
  }

  while (basePointer < baseLines.length) {
    resultLines.push(baseLines[basePointer]);
    basePointer++;
  }

  return {
    hasConflict: false,
    content: resultLines.join('\n'),
  };
}

export function resolveCommitRef(state: GitRepositoryState, refOrSha: string): ObjectId | null {
  if (refOrSha === 'HEAD') {
    return getCurrentCommitId(state);
  }
  if (refOrSha.startsWith('HEAD~')) {
    const count = parseInt(refOrSha.replace('HEAD~', ''), 10) || 1;
    let cur = getCurrentCommitId(state);
    for (let i = 0; i < count; i++) {
      if (!cur) return null;
      const c = state.objects[cur] as GitCommit;
      if (!c || !c.parents || c.parents.length === 0) return null;
      cur = c.parents[0];
    }
    return cur;
  }
  if (state.refs.heads[refOrSha]) return state.refs.heads[refOrSha];
  if (state.refs.tags[refOrSha]) return state.refs.tags[refOrSha];
  if (state.objects[refOrSha] && state.objects[refOrSha].type === 'commit') return refOrSha;
  return null;
}

/**
 * Finds the Lowest Common Ancestor (LCA) in a Git DAG.
 * Uses topological shortest combined distance to ensure correct resolution on complex criss-cross merges.
 */
export function findCommonAncestor(state: GitRepositoryState, commitAId: ObjectId, commitBId: ObjectId): ObjectId | null {
  if (commitAId === commitBId) return commitAId;

  const getAncestorsWithDepth = (startId: ObjectId): Map<ObjectId, number> => {
    const depths = new Map<ObjectId, number>();
    const queue: { id: ObjectId; depth: number }[] = [{ id: startId, depth: 0 }];
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (!id) continue;
      if (depths.has(id) && depths.get(id)! <= depth) continue;
      depths.set(id, depth);
      const commitObj = state.objects[id] as GitCommit;
      if (commitObj && commitObj.parents) {
        for (const parent of commitObj.parents) {
          queue.push({ id: parent, depth: depth + 1 });
        }
      }
    }
    return depths;
  };

  const ancestorsA = getAncestorsWithDepth(commitAId);
  const ancestorsB = getAncestorsWithDepth(commitBId);

  let bestAncestor: ObjectId | null = null;
  let minCombinedDepth = Infinity;

  for (const [commitId, depthA] of ancestorsA.entries()) {
    if (ancestorsB.has(commitId)) {
      const depthB = ancestorsB.get(commitId)!;
      const combined = depthA + depthB;
      if (combined < minCombinedDepth) {
        minCombinedDepth = combined;
        bestAncestor = commitId;
      }
    }
  }

  return bestAncestor;
}

export function merge(state: GitRepositoryState, sourceBranch: string): { state: GitRepositoryState; type: 'fast-forward' | 'three-way' | 'already-up-to-date' | 'conflict'; error?: string } {
  const targetBranch = state.head.type === 'branch' ? state.head.target : null;
  if (!targetBranch) {
    return { state, type: 'already-up-to-date', error: 'You are not on a branch to merge into' };
  }

  const currentCommitId = state.refs.heads[targetBranch];
  const remoteMatch = sourceBranch.match(/^([^/]+)\/(.+)$/);
  const sourceCommitId = state.refs.heads[sourceBranch] ||
    (remoteMatch ? state.refs.remotes[remoteMatch[1]]?.[remoteMatch[2]] || null : null) ||
    (state.objects[sourceBranch]?.type === 'commit' ? sourceBranch : null);

  if (!sourceCommitId) {
    return { state, type: 'already-up-to-date', error: `merge: ${sourceBranch} - not something we can merge` };
  }

  if (currentCommitId === sourceCommitId) {
    return { state, type: 'already-up-to-date' };
  }

  const commonAncestor = findCommonAncestor(state, currentCommitId, sourceCommitId);

  // Fast-Forward Merge
  if (commonAncestor === currentCommitId) {
    const refs = {
      ...state.refs,
      heads: {
        ...state.refs.heads,
        [targetBranch]: sourceCommitId,
      },
    };
    let nextState: GitRepositoryState = checkoutCommitSnapshot({ ...state, refs }, sourceCommitId);
    nextState = recordReflog(nextState, 'HEAD', currentCommitId, sourceCommitId, 'merge (fast-forward)', `merge ${sourceBranch}: Fast-forward`);
    nextState = recordReflog(nextState, targetBranch, currentCommitId, sourceCommitId, 'merge (fast-forward)', `merge ${sourceBranch}: Fast-forward`);
    return { state: nextState, type: 'fast-forward' };
  }

  // Already up to date
  if (commonAncestor === sourceCommitId) {
    return { state, type: 'already-up-to-date' };
  }

  // 3-Way File-by-File & Line-by-Line Content Comparison
  const baseFiles = getCommitFiles(state, commonAncestor);
  const oursFiles = getCommitFiles(state, currentCommitId);
  const theirsFiles = getCommitFiles(state, sourceCommitId);

  const allFilePaths = Array.from(new Set([
    ...Object.keys(baseFiles),
    ...Object.keys(oursFiles),
    ...Object.keys(theirsFiles),
  ]));

  const mergedFiles: Record<string, string> = {};
  const conflicts: Record<string, ConflictFile> = {};
  const workingTree = { ...state.workingTree };
  const objects = { ...state.objects };

  for (const path of allFilePaths) {
    const baseContent = baseFiles[path] ?? '';
    const oursContent = oursFiles[path] ?? '';
    const theirsContent = theirsFiles[path] ?? '';

    const inBase = path in baseFiles;
    const inOurs = path in oursFiles;
    const inTheirs = path in theirsFiles;

    // File only in ours
    if (inOurs && !inBase && !inTheirs) {
      mergedFiles[path] = oursContent;
      continue;
    }
    // File only in theirs
    if (inTheirs && !inBase && !inOurs) {
      mergedFiles[path] = theirsContent;
      continue;
    }
    // Deleted in both
    if (!inOurs && !inTheirs && inBase) {
      continue;
    }
    // Deleted in ours, unchanged in theirs -> delete
    if (!inOurs && inTheirs && theirsContent === baseContent) {
      continue;
    }
    // Deleted in theirs, unchanged in ours -> delete
    if (inOurs && !inTheirs && oursContent === baseContent) {
      continue;
    }

    // Perform line-level 3-way merge
    const lineResult = performThreeWayLineMerge(baseContent, oursContent, theirsContent, targetBranch, sourceBranch);

    if (lineResult.hasConflict) {
      conflicts[path] = {
        path,
        base: baseContent,
        ours: oursContent,
        theirs: theirsContent,
        isResolved: false,
      };
      workingTree[path] = {
        path,
        content: lineResult.content,
        stage: 'conflicted',
      };
    } else {
      mergedFiles[path] = lineResult.content;
      workingTree[path] = {
        path,
        content: lineResult.content,
        stage: 'committed',
      };
    }
  }

  // If any conflicts occurred, pause merge and transition into Conflict Resolution State
  if (Object.keys(conflicts).length > 0) {
    const nextState: GitRepositoryState = {
      ...state,
      conflicts: {
        ...state.conflicts,
        ...conflicts,
      },
      workingTree,
      activeOperation: {
        type: 'merge',
        sourceBranch,
        targetBranch,
        step: 1,
        totalSteps: 1,
        stepName: `Automatic merge failed for ${Object.keys(conflicts).length} file(s); fix conflicts and commit the result.`,
        isPaused: true,
      },
    };
    return { state: nextState, type: 'conflict' };
  }

  // Clean 3-Way Merge: Create merged Tree & Blobs
  const treeEntries: Record<string, any> = {};
  const stagingArea: Record<string, ObjectId> = {};

  for (const [path, content] of Object.entries(mergedFiles)) {
    const blobId = generateSha(content);
    objects[blobId] = {
      id: blobId,
      type: 'blob',
      content,
    };
    stagingArea[path] = blobId;
    treeEntries[path] = {
      mode: '100644',
      path,
      id: blobId,
      type: 'blob',
    };
  }

  const treeId = generateSha(JSON.stringify(treeEntries) + Date.now());
  const newTree: GitTree = {
    id: treeId,
    type: 'tree',
    entries: treeEntries,
  };
  objects[treeId] = newTree;

  const mergeMessage = `Merge branch '${sourceBranch}' into ${targetBranch}`;
  const mergeCommitId = generateSha(`merge:${currentCommitId}:${sourceCommitId}:${Date.now()}`);

  const mergeCommit: GitCommit = {
    id: mergeCommitId,
    type: 'commit',
    tree: treeId,
    parents: [currentCommitId, sourceCommitId],
    author: {
      name: 'Developer',
      email: 'dev@gitfluid.io',
      timestamp: Date.now(),
    },
    message: mergeMessage,
    branchTag: targetBranch,
  };
  objects[mergeCommitId] = mergeCommit;

  const refs = {
    ...state.refs,
    heads: {
      ...state.refs.heads,
      [targetBranch]: mergeCommitId,
    },
  };

  let nextState: GitRepositoryState = {
    ...state,
    objects,
    refs,
    workingTree,
    stagingArea,
    conflicts: {},
    activeOperation: undefined,
  };

  nextState = recordReflog(nextState, 'HEAD', currentCommitId, mergeCommitId, 'merge', `merge ${sourceBranch}: Merge made by recursive strategy.`);
  nextState = recordReflog(nextState, targetBranch, currentCommitId, mergeCommitId, 'merge', `merge ${sourceBranch}: Merge made by recursive strategy.`);

  return { state: nextState, type: 'three-way' };
}

export function rebase(state: GitRepositoryState, upstreamBranch: string): { state: GitRepositoryState; error?: string } {
  const currentBranch = state.head.type === 'branch' ? state.head.target : null;
  if (!currentBranch) return { state, error: 'Cannot rebase in detached HEAD' };

  const currentCommitId = state.refs.heads[currentBranch];
  const upstreamCommitId = state.refs.heads[upstreamBranch] || (state.objects[upstreamBranch]?.type === 'commit' ? upstreamBranch : null);
  if (!upstreamCommitId) return { state, error: `fatal: invalid upstream '${upstreamBranch}'` };

  const commonAncestor = findCommonAncestor(state, currentCommitId, upstreamCommitId);
  if (!commonAncestor) return { state, error: 'fatal: no common ancestor found' };
  if (commonAncestor === currentCommitId) {
    const merged = merge(state, upstreamBranch);
    return merged.error ? { state, error: merged.error } : { state: merged.state };
  }

  const commitsToReplay: GitCommit[] = [];
  let currId: ObjectId | null = currentCommitId;
  while (currId && currId !== commonAncestor) {
    const c = state.objects[currId] as GitCommit;
    if (!c) break;
    // Educational rebase intentionally follows the first-parent line, matching a
    // normal linear feature branch and making merge commits explicit edge cases.
    commitsToReplay.unshift(c);
    currId = c.parents[0] || null;
  }

  let replayedFiles = getCommitFiles(state, upstreamCommitId);
  let newParentId = upstreamCommitId;
  const objects = { ...state.objects };

  for (const c of commitsToReplay) {
    const parentId = c.parents[0] || null;
    const baseFiles = getCommitFiles(state, parentId);
    const commitFiles = getCommitFiles(state, c.id);
    const resultFiles = { ...replayedFiles };
    const paths = new Set([...Object.keys(baseFiles), ...Object.keys(commitFiles)]);

    for (const path of paths) {
      const base = baseFiles[path];
      const incoming = commitFiles[path];
      const onto = replayedFiles[path];
      if (incoming === base) continue;

      if (onto === base || onto === incoming) {
        if (incoming === undefined) delete resultFiles[path];
        else resultFiles[path] = incoming;
        continue;
      }

      if (base === undefined && incoming !== undefined && onto !== undefined) {
        return { state, error: `CONFLICT (add/add): Merge conflict in '${path}' while replaying '${c.message}'` };
      }

      const mergeResult = performThreeWayLineMerge(base ?? '', onto ?? '', incoming ?? '', 'upstream', 'commit');
      if (mergeResult.hasConflict) {
        return { state, error: `CONFLICT (content): Merge conflict in '${path}' while replaying '${c.message}'` };
      }
      if (incoming === undefined && mergeResult.content === '') delete resultFiles[path];
      else resultFiles[path] = mergeResult.content;
    }

    const treeResult = buildTreeFromFiles({ ...state, objects }, resultFiles);
    Object.assign(objects, treeResult.objects);
    const rebasedCommitId = generateSha(`rebase:${c.id}:${treeResult.treeId}:${newParentId}:${Date.now()}`);
    objects[rebasedCommitId] = {
      ...c,
      id: rebasedCommitId,
      tree: treeResult.treeId,
      parents: [newParentId],
      branchTag: currentBranch,
    };
    newParentId = rebasedCommitId;
    replayedFiles = resultFiles;
  }

  const refs = {
    ...state.refs,
    heads: { ...state.refs.heads, [currentBranch]: newParentId },
  };
  const rebuilt = applySnapshotToWorkingTree({ ...state, objects, refs }, replayedFiles);
  const committedWorkingTree = Object.fromEntries(
    Object.entries(rebuilt.workingTree).map(([path, file]) => [path, { ...file, stage: 'committed' as const, stagedContent: file.content }])
  );
  let nextState: GitRepositoryState = {
    ...rebuilt,
    workingTree: committedWorkingTree,
    activeOperation: undefined,
    conflicts: {},
  };
  nextState = recordReflog(nextState, 'HEAD', currentCommitId, newParentId, 'rebase finished', `rebase: fast-forwarding onto ${upstreamBranch}`);
  nextState = recordReflog(nextState, currentBranch, currentCommitId, newParentId, 'rebase finished', `rebase: fast-forwarding onto ${upstreamBranch}`);
  return { state: nextState };
}

export function reset(state: GitRepositoryState, targetCommit: string, mode: 'soft' | 'mixed' | 'hard' = 'mixed'): { state: GitRepositoryState; error?: string } {
  const currentHeadCommitId = getCurrentCommitId(state);
  const targetId = resolveCommitRef(state, targetCommit);

  if (!targetId || !state.objects[targetId] || state.objects[targetId].type !== 'commit') {
    return { state, error: `fatal: ambiguous argument '${targetCommit}': unknown revision` };
  }

  const targetCommitObj = state.objects[targetId] as GitCommit;
  const refs = { ...state.refs, heads: { ...state.refs.heads } };
  if (state.head.type === 'branch') {
    refs.heads[state.head.target] = targetId;
  }

  let workingTree = { ...state.workingTree };
  let stagingArea = { ...state.stagingArea };

  if (mode === 'hard') {
    // Reset staging and working tree to target commit tree
    const treeObj = state.objects[targetCommitObj.tree] as GitTree;
    if (treeObj) {
      stagingArea = {};
      workingTree = {};
      for (const [path, entry] of Object.entries(treeObj.entries)) {
        stagingArea[path] = entry.id;
        const blobObj = state.objects[entry.id] as GitBlob;
        workingTree[path] = {
          path,
          content: blobObj?.content || '',
          stage: 'committed',
        };
      }
    }
  } else if (mode === 'mixed') {
    // Clear uncommitted staging area
    const treeObj = state.objects[targetCommitObj.tree] as GitTree;
    if (treeObj) {
      stagingArea = {};
      for (const [path, entry] of Object.entries(treeObj.entries)) {
        stagingArea[path] = entry.id;
      }
    }
  }

  let nextState: GitRepositoryState = {
    ...state,
    refs,
    workingTree,
    stagingArea,
  };

  nextState = recordReflog(nextState, 'HEAD', currentHeadCommitId, targetId, `reset --${mode}`, `reset: moving to ${targetCommit}`);
  if (state.head.type === 'branch') {
    nextState = recordReflog(nextState, state.head.target, currentHeadCommitId, targetId, `reset --${mode}`, `reset: moving to ${targetCommit}`);
  }

  return { state: nextState };
}

export function stageFile(state: GitRepositoryState, filePath: string, content?: string): GitRepositoryState {
  const file = state.workingTree[filePath];
  const fileContent = content !== undefined ? content : file?.content || '';

  const blobId = generateSha(fileContent);
  const blob: GitBlob = {
    id: blobId,
    type: 'blob',
    content: fileContent,
  };

  const objects = {
    ...state.objects,
    [blobId]: blob,
  };

  const stagingArea = {
    ...state.stagingArea,
    [filePath]: blobId,
  };

  const workingTree = {
    ...state.workingTree,
    [filePath]: {
      path: filePath,
      content: fileContent,
      stage: 'staged' as const,
    },
  };

  return {
    ...state,
    objects,
    stagingArea,
    workingTree,
  };
}

export function stashPush(state: GitRepositoryState, message?: string): { state: GitRepositoryState; error?: string } {
  const currentHeadCommitId = getCurrentCommitId(state);
  if (!currentHeadCommitId) return { state, error: 'Cannot stash on unborn branch' };

  const currentCommit = state.objects[currentHeadCommitId] as GitCommit;
  const stashId = `stash-${Date.now()}`;
  const stashEntry: StashEntry = {
    id: stashId,
    message: message || `WIP on ${state.head.target}: ${currentCommit.message}`,
    indexTree: currentCommit.tree,
    workTree: currentCommit.tree,
    baseCommit: currentHeadCommitId,
    timestamp: Date.now(),
    files: {},
  };

  for (const [path, file] of Object.entries(state.workingTree)) {
    if (file.stage === 'modified' || file.stage === 'staged' || file.stage === 'untracked') {
      stashEntry.files[path] = {
        staged: file.stagedContent,
        worktree: file.content,
      };
    }
  }

  // Restore working tree from head commit tree
  const headTree = state.objects[currentCommit.tree] as GitTree;
  const cleanWorkingTree: Record<string, FileState> = {};
  if (headTree && headTree.entries) {
    for (const [path, entry] of Object.entries(headTree.entries)) {
      const blob = state.objects[entry.id] as GitBlob;
      cleanWorkingTree[path] = {
        path,
        content: blob ? blob.content : '',
        stage: 'committed',
      };
    }
  }

  return {
    state: {
      ...state,
      stash: [stashEntry, ...state.stash],
      workingTree: cleanWorkingTree,
    },
  };
}

export function stashPop(state: GitRepositoryState): { state: GitRepositoryState; error?: string } {
  if (state.stash.length === 0) {
    return { state, error: 'error: No stash entries found.' };
  }

  const [topStash, ...remainingStash] = state.stash;
  const workingTree = { ...state.workingTree };

  for (const [path, data] of Object.entries(topStash.files)) {
    workingTree[path] = {
      path,
      content: data.worktree || data.staged || '',
      stagedContent: data.staged,
      worktreeContent: data.worktree,
      stage: 'modified',
    };
  }

  return {
    state: {
      ...state,
      stash: remainingStash,
      workingTree,
    },
  };
}

export function cherryPick(
  state: GitRepositoryState,
  commitRefOrSha: string
): { state: GitRepositoryState; commitId?: ObjectId; error?: string } {
  const targetId = resolveCommitRef(state, commitRefOrSha);
  if (!targetId || !state.objects[targetId] || state.objects[targetId].type !== 'commit') {
    return { state, error: `fatal: bad revision '${commitRefOrSha}'` };
  }
  const targetCommit = state.objects[targetId] as GitCommit;
  if (targetCommit.parents.length === 0) return { state, error: 'fatal: cannot cherry-pick a root commit' };

  const parentFiles = getCommitFiles(state, targetCommit.parents[0]);
  const targetFiles = getCommitFiles(state, targetId);
  const currentFiles = getCommitFiles(state, getCurrentCommitId(state));

  for (const path of new Set([...Object.keys(parentFiles), ...Object.keys(targetFiles)])) {
    const before = parentFiles[path];
    const incoming = targetFiles[path];
    const current = currentFiles[path];
    if (current !== before && incoming !== before && current !== incoming) {
      return { state, error: `error: could not apply ${targetId.slice(0, 7)}: conflict in '${path}'` };
    }
  }

  const resultFiles = { ...currentFiles };
  for (const path of new Set([...Object.keys(parentFiles), ...Object.keys(targetFiles)])) {
    if (targetFiles[path] === undefined) delete resultFiles[path];
    else if (targetFiles[path] !== parentFiles[path]) resultFiles[path] = targetFiles[path];
  }

  const nextState = applySnapshotToWorkingTree(state, resultFiles);
  const commitRes = commit(nextState, { message: `Cherry-picked: ${targetCommit.message}` });
  return commitRes.error
    ? { state, error: commitRes.error }
    : { state: commitRes.state, commitId: commitRes.commitId };
}

export function revertCommit(
  state: GitRepositoryState,
  commitRefOrSha: string
): { state: GitRepositoryState; commitId?: ObjectId; error?: string } {
  const targetId = resolveCommitRef(state, commitRefOrSha);
  if (!targetId || !state.objects[targetId] || state.objects[targetId].type !== 'commit') {
    return { state, error: `fatal: bad revision '${commitRefOrSha}'` };
  }
  const targetCommit = state.objects[targetId] as GitCommit;
  if (targetCommit.parents.length === 0) return { state, error: 'fatal: cannot revert a root commit' };

  const parentFiles = getCommitFiles(state, targetCommit.parents[0]);
  const targetFiles = getCommitFiles(state, targetId);
  const currentFiles = getCommitFiles(state, getCurrentCommitId(state));

  for (const path of new Set([...Object.keys(parentFiles), ...Object.keys(targetFiles)])) {
    const before = parentFiles[path];
    const current = currentFiles[path];
    const inverse = before;
    const changedByTarget = targetFiles[path] !== before;
    if (changedByTarget && current !== targetFiles[path] && current !== inverse) {
      return { state, error: `error: could not revert ${targetId.slice(0, 7)}: conflict in '${path}'` };
    }
  }

  const resultFiles = { ...currentFiles };
  for (const path of new Set([...Object.keys(parentFiles), ...Object.keys(targetFiles)])) {
    if (targetFiles[path] === parentFiles[path]) continue;
    if (parentFiles[path] === undefined) delete resultFiles[path];
    else resultFiles[path] = parentFiles[path];
  }

  const nextState = applySnapshotToWorkingTree(state, resultFiles);
  const commitRes = commit(nextState, { allowEmpty: true, message: `Revert "${targetCommit.message}"` });
  return commitRes.error
    ? { state, error: commitRes.error }
    : { state: commitRes.state, commitId: commitRes.commitId };
}

export function fetchRemote(
  state: GitRepositoryState,
  remoteName = 'origin'
): { state: GitRepositoryState; output: string } {
  const remotes = { ...state.refs.remotes };
  const originRemotes = { ...(remotes[remoteName] || {}) };

  const currentHeadCommitId = getCurrentCommitId(state);
  if (currentHeadCommitId) {
    originRemotes['main'] = originRemotes['main'] || currentHeadCommitId;
  }
  remotes[remoteName] = originRemotes;

  const nextState: GitRepositoryState = {
    ...state,
    refs: {
      ...state.refs,
      remotes,
    },
  };
  return {
    state: nextState,
    output: `From github.com/developer/project\n * [new branch]      main       -> ${remoteName}/main`,
  };
}

export function pushRemote(
  state: GitRepositoryState,
  remoteName = 'origin',
  branchName?: string
): { state: GitRepositoryState; output: string } {
  const targetBranch = branchName || (state.head.type === 'branch' ? state.head.target : 'main');
  const targetCommit = state.refs.heads[targetBranch] || getCurrentCommitId(state);

  const remotes = { ...state.refs.remotes };
  const originRemotes = { ...(remotes[remoteName] || {}) };
  if (targetCommit) {
    originRemotes[targetBranch] = targetCommit;
  }
  remotes[remoteName] = originRemotes;

  const nextState: GitRepositoryState = {
    ...state,
    refs: {
      ...state.refs,
      remotes,
    },
  };
  return {
    state: nextState,
    output: `To github.com/developer/project.git\n   ${targetCommit?.slice(0, 7)}..${targetCommit?.slice(
      0,
      7
    )}  ${targetBranch} -> ${targetBranch}`,
  };
}
