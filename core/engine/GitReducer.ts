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
}

export function commit(state: GitRepositoryState, options: CommitOptions): { state: GitRepositoryState; commitId: ObjectId; error?: string } {
  const currentHeadCommitId = getCurrentCommitId(state);
  const objects = { ...state.objects };
  const workingTree = { ...state.workingTree };
  const stagingArea = { ...state.stagingArea };

  if (options.amend && currentHeadCommitId) {
    const oldCommit = objects[currentHeadCommitId] as GitCommit;
    if (!oldCommit) {
      return { state, commitId: '', error: 'Cannot amend without existing commit' };
    }

    const newCommitId = generateSha(`amend:${options.message}:${Date.now()}`);
    const newCommit: GitCommit = {
      ...oldCommit,
      id: newCommitId,
      message: options.message || oldCommit.message,
      author: {
        ...oldCommit.author,
        timestamp: Date.now(),
      },
    };
    objects[newCommitId] = newCommit;

    const refs = { ...state.refs, heads: { ...state.refs.heads } };
    if (state.head.type === 'branch') {
      refs.heads[state.head.target] = newCommitId;
    }
    const newHead = state.head.type === 'branch' ? { ...state.head } : { type: 'detached' as const, target: newCommitId };

    let nextState: GitRepositoryState = {
      ...state,
      objects,
      refs,
      head: newHead,
    };

    nextState = recordReflog(nextState, 'HEAD', currentHeadCommitId, newCommitId, 'commit (amend)', `commit (amend): ${newCommit.message}`);
    if (state.head.type === 'branch') {
      nextState = recordReflog(nextState, state.head.target, currentHeadCommitId, newCommitId, 'commit (amend)', `commit (amend): ${newCommit.message}`);
    }

    return { state: nextState, commitId: newCommitId };
  }

  // Create tree entries from stagingArea
  const treeEntries: Record<string, any> = {};
  for (const [path, blobId] of Object.entries(stagingArea)) {
    treeEntries[path] = {
      mode: '100644',
      path,
      id: blobId,
      type: 'blob',
    };
    if (workingTree[path]) {
      workingTree[path] = {
        ...workingTree[path],
        stage: 'committed',
      };
    }
  }

  const treeId = generateSha(JSON.stringify(treeEntries) + Date.now());
  const newTree: GitTree = {
    id: treeId,
    type: 'tree',
    entries: treeEntries,
  };
  objects[treeId] = newTree;

  const parents = currentHeadCommitId ? [currentHeadCommitId] : [];
  const newCommitId = generateSha(`commit:${options.message}:${treeId}:${parents.join(',')}:${Date.now()}`);

  const activeBranch = state.head.type === 'branch' ? state.head.target : undefined;
  const newCommit: GitCommit = {
    id: newCommitId,
    type: 'commit',
    tree: treeId,
    parents,
    author: {
      name: options.author?.name || 'Developer',
      email: options.author?.email || 'dev@gitfluid.io',
      timestamp: Date.now(),
    },
    message: options.message || 'Update files',
    branchTag: activeBranch,
  };
  objects[newCommitId] = newCommit;

  const refs = { ...state.refs, heads: { ...state.refs.heads } };
  if (state.head.type === 'branch') {
    refs.heads[state.head.target] = newCommitId;
  }

  const newHead = state.head.type === 'branch' ? { ...state.head } : { type: 'detached' as const, target: newCommitId };

  let nextState: GitRepositoryState = {
    ...state,
    objects,
    refs,
    head: newHead,
    workingTree,
  };

  nextState = recordReflog(nextState, 'HEAD', currentHeadCommitId, newCommitId, 'commit', `commit: ${newCommit.message}`);
  if (state.head.type === 'branch') {
    nextState = recordReflog(nextState, state.head.target, currentHeadCommitId, newCommitId, 'commit', `commit: ${newCommit.message}`);
  }

  return { state: nextState, commitId: newCommitId };
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

export function switchBranchOrCommit(state: GitRepositoryState, target: string, createNewBranch = false): { state: GitRepositoryState; error?: string } {
  const currentHeadCommitId = getCurrentCommitId(state);

  if (createNewBranch) {
    const branchRes = createBranch(state, target);
    if (branchRes.error) return branchRes;
    const nextState: GitRepositoryState = {
      ...branchRes.state,
      head: {
        type: 'branch',
        target,
      },
    };
    return {
      state: recordReflog(nextState, 'HEAD', currentHeadCommitId, getCurrentCommitId(nextState)!, 'checkout: moving from HEAD', `checkout: moving to ${target}`),
    };
  }

  // Check if target is a branch
  if (state.refs.heads[target]) {
    const nextCommit = state.refs.heads[target];
    const nextState: GitRepositoryState = {
      ...state,
      head: {
        type: 'branch',
        target,
      },
    };
    return {
      state: recordReflog(nextState, 'HEAD', currentHeadCommitId, nextCommit, 'checkout: moving', `checkout: moving from ${state.head.target} to ${target}`),
    };
  }

  // Check if target is a commit SHA (Detached HEAD)
  if (state.objects[target] && state.objects[target].type === 'commit') {
    const nextState: GitRepositoryState = {
      ...state,
      head: {
        type: 'detached',
        target,
      },
    };
    return {
      state: recordReflog(nextState, 'HEAD', currentHeadCommitId, target, 'checkout: moving', `checkout: moving to ${target.slice(0, 7)}`),
    };
  }

  return { state, error: `error: pathspec '${target}' did not match any file(s) known to git` };
}

export function findCommonAncestor(state: GitRepositoryState, commitAId: ObjectId, commitBId: ObjectId): ObjectId | null {
  const getAncestors = (startId: ObjectId): Set<ObjectId> => {
    const ancestors = new Set<ObjectId>();
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!current || ancestors.has(current)) continue;
      ancestors.add(current);
      const commitObj = state.objects[current] as GitCommit;
      if (commitObj && commitObj.parents) {
        queue.push(...commitObj.parents);
      }
    }
    return ancestors;
  };

  const ancestorsA = getAncestors(commitAId);
  const queueB = [commitBId];
  const visitedB = new Set<ObjectId>();

  while (queueB.length > 0) {
    const current = queueB.shift()!;
    if (visitedB.has(current)) continue;
    visitedB.add(current);
    if (ancestorsA.has(current)) {
      return current; // Lowest common ancestor
    }
    const commitObj = state.objects[current] as GitCommit;
    if (commitObj && commitObj.parents) {
      queueB.push(...commitObj.parents);
    }
  }

  return null;
}

export function merge(state: GitRepositoryState, sourceBranch: string): { state: GitRepositoryState; type: 'fast-forward' | 'three-way' | 'already-up-to-date' | 'conflict'; error?: string } {
  const targetBranch = state.head.type === 'branch' ? state.head.target : null;
  if (!targetBranch) {
    return { state, type: 'already-up-to-date', error: 'You are not on a branch to merge into' };
  }

  const currentCommitId = state.refs.heads[targetBranch];
  const sourceCommitId = state.refs.heads[sourceBranch] || (state.objects[sourceBranch] ? sourceBranch : null);

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
    let nextState: GitRepositoryState = {
      ...state,
      refs,
    };
    nextState = recordReflog(nextState, 'HEAD', currentCommitId, sourceCommitId, 'merge (fast-forward)', `merge ${sourceBranch}: Fast-forward`);
    nextState = recordReflog(nextState, targetBranch, currentCommitId, sourceCommitId, 'merge (fast-forward)', `merge ${sourceBranch}: Fast-forward`);
    return { state: nextState, type: 'fast-forward' };
  }

  // Already up to date
  if (commonAncestor === sourceCommitId) {
    return { state, type: 'already-up-to-date' };
  }

  // Three-Way Merge
  const mergeMessage = `Merge branch '${sourceBranch}' into ${targetBranch}`;
  const objects = { ...state.objects };

  const mergeCommitId = generateSha(`merge:${currentCommitId}:${sourceCommitId}:${Date.now()}`);
  const currentCommit = objects[currentCommitId] as GitCommit;
  const sourceCommit = objects[sourceCommitId] as GitCommit;

  const mergeCommit: GitCommit = {
    id: mergeCommitId,
    type: 'commit',
    tree: currentCommit.tree,
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
  };

  nextState = recordReflog(nextState, 'HEAD', currentCommitId, mergeCommitId, 'merge', `merge ${sourceBranch}: Merge made by recursive strategy.`);
  nextState = recordReflog(nextState, targetBranch, currentCommitId, mergeCommitId, 'merge', `merge ${sourceBranch}: Merge made by recursive strategy.`);

  return { state: nextState, type: 'three-way' };
}

export function rebase(state: GitRepositoryState, upstreamBranch: string): { state: GitRepositoryState; error?: string } {
  const currentBranch = state.head.type === 'branch' ? state.head.target : null;
  if (!currentBranch) {
    return { state, error: 'Cannot rebase in detached HEAD' };
  }

  const currentCommitId = state.refs.heads[currentBranch];
  const upstreamCommitId = state.refs.heads[upstreamBranch] || (state.objects[upstreamBranch] ? upstreamBranch : null);

  if (!upstreamCommitId) {
    return { state, error: `fatal: invalid upstream '${upstreamBranch}'` };
  }

  const commonAncestor = findCommonAncestor(state, currentCommitId, upstreamCommitId);
  if (!commonAncestor) {
    return { state, error: 'fatal: no common ancestor found' };
  }

  if (commonAncestor === currentCommitId) {
    // Fast forward to upstream
    return { state: merge(state, upstreamBranch).state };
  }

  // Collect commits from currentBranch back to commonAncestor (exclusive)
  const commitsToReplay: GitCommit[] = [];
  let currId: ObjectId | null = currentCommitId;
  while (currId && currId !== commonAncestor) {
    const c = state.objects[currId] as GitCommit;
    if (!c) break;
    commitsToReplay.unshift(c);
    currId = c.parents.length > 0 ? c.parents[0] : null;
  }

  let newParentId = upstreamCommitId;
  const objects = { ...state.objects };

  for (const c of commitsToReplay) {
    const rebasedCommitId = generateSha(`rebase:${c.message}:${newParentId}:${Date.now()}`);
    const rebasedCommit: GitCommit = {
      ...c,
      id: rebasedCommitId,
      parents: [newParentId],
      branchTag: currentBranch,
    };
    objects[rebasedCommitId] = rebasedCommit;
    newParentId = rebasedCommitId;
  }

  const refs = {
    ...state.refs,
    heads: {
      ...state.refs.heads,
      [currentBranch]: newParentId,
    },
  };

  let nextState: GitRepositoryState = {
    ...state,
    objects,
    refs,
  };

  nextState = recordReflog(nextState, 'HEAD', currentCommitId, newParentId, 'rebase finished', `rebase: fast-forwarding onto ${upstreamBranch}`);
  nextState = recordReflog(nextState, currentBranch, currentCommitId, newParentId, 'rebase finished', `rebase: fast-forwarding onto ${upstreamBranch}`);

  return { state: nextState };
}

export function reset(state: GitRepositoryState, targetCommit: string, mode: 'soft' | 'mixed' | 'hard' = 'mixed'): { state: GitRepositoryState; error?: string } {
  const currentHeadCommitId = getCurrentCommitId(state);
  const targetId = state.refs.heads[targetCommit] || (state.objects[targetCommit] ? targetCommit : null);

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
  const currentFile = state.workingTree[filePath];
  const fileContent = content || currentFile?.worktreeContent || currentFile?.content || 'console.log("Updated");';
  const blobId = generateSha(fileContent);

  const objects = {
    ...state.objects,
    [blobId]: {
      id: blobId,
      type: 'blob' as const,
      content: fileContent,
    },
  };

  const stagingArea = {
    ...state.stagingArea,
    [filePath]: blobId,
  };

  const workingTree = {
    ...state.workingTree,
    [filePath]: {
      path: filePath,
      content: currentFile?.content || fileContent,
      stagedContent: fileContent,
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

  const workingTree = { ...state.workingTree };
  for (const [path, file] of Object.entries(workingTree)) {
    stashEntry.files[path] = {
      staged: file.stagedContent,
      worktree: file.worktreeContent,
    };
    workingTree[path] = {
      path,
      content: file.content,
      stage: 'committed',
    };
  }

  return {
    state: {
      ...state,
      stash: [stashEntry, ...state.stash],
      workingTree,
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
      content: workingTree[path]?.content || '',
      stagedContent: data.staged,
      worktreeContent: data.worktree,
      stage: data.staged ? 'staged' : 'modified',
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
