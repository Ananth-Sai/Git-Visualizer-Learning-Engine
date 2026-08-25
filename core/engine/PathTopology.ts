import { GitRepositoryState, GitCommit, ObjectId } from '../types';

export interface RenderNode {
  id: ObjectId;
  commit: GitCommit;
  x: number;
  y: number;
  lane: number;
  branchName?: string;
  isHead: boolean;
  isBranchTip: boolean;
  branchTips: string[];
  tags: string[];
  isRemoteTip: boolean;
  remoteBranchTips: string[];
}

export interface RenderSpline {
  id: string;
  fromId: ObjectId;
  toId: ObjectId;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  pathD: string;
  isMerge: boolean;
}

export interface TopologyLayout {
  nodes: RenderNode[];
  splines: RenderSpline[];
  width: number;
  height: number;
  laneCount: number;
}

const HORIZONTAL_SPACING = 160;
const VERTICAL_SPACING = 110;
const PADDING_X = 120;
const PADDING_Y = 180;

export function computeTopology(state: GitRepositoryState): TopologyLayout {
  const commitMap = new Map<ObjectId, GitCommit>();
  const childrenMap = new Map<ObjectId, ObjectId[]>();

  // Extract all commits
  for (const [id, obj] of Object.entries(state.objects)) {
    if (obj.type === 'commit') {
      commitMap.set(id, obj);
      if (!childrenMap.has(id)) childrenMap.set(id, []);
    }
  }

  // Build children relationship
  for (const [id, commit] of commitMap.entries()) {
    for (const parentId of commit.parents) {
      if (commitMap.has(parentId)) {
        if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
        childrenMap.get(parentId)!.push(id);
      }
    }
  }

  // Find root commits (commits with no parents or parents not in map)
  const rootCommits: ObjectId[] = [];
  for (const [id, commit] of commitMap.entries()) {
    if (commit.parents.length === 0 || !commit.parents.some((p) => commitMap.has(p))) {
      rootCommits.push(id);
    }
  }

  // Assign columns (X depth) via topological BFS
  const xDepthMap = new Map<ObjectId, number>();
  const queue: Array<{ id: ObjectId; depth: number }> = rootCommits.map((id) => ({ id, depth: 0 }));
  const visited = new Set<ObjectId>();

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const currentMax = xDepthMap.get(id) ?? 0;
    xDepthMap.set(id, Math.max(currentMax, depth));

    const children = childrenMap.get(id) || [];
    for (const childId of children) {
      queue.push({ id: childId, depth: depth + 1 });
    }
  }

  // Assign branch lanes: main is Lane 0. Branches increment outwards +1, -1, +2, -2
  const branchLanes = new Map<string, number>();
  branchLanes.set('main', 0);
  branchLanes.set('master', 0);

  let nextPosLane = 1;
  let nextNegLane = -1;

  for (const branchName of Object.keys(state.refs.heads)) {
    if (!branchLanes.has(branchName)) {
      if (nextPosLane <= Math.abs(nextNegLane)) {
        branchLanes.set(branchName, nextPosLane++);
      } else {
        branchLanes.set(branchName, nextNegLane--);
      }
    }
  }

  // Determine branch ownership for each commit
  const commitLaneMap = new Map<ObjectId, number>();

  // Helper to trace back from branch tips
  for (const [branchName, tipCommitId] of Object.entries(state.refs.heads)) {
    const lane = branchLanes.get(branchName) ?? 0;
    let curr: ObjectId | null = tipCommitId;
    while (curr && commitMap.has(curr)) {
      if (!commitLaneMap.has(curr)) {
        commitLaneMap.set(curr, lane);
      } else if (branchName === 'main' || branchName === 'master') {
        // Main always locks to 0
        commitLaneMap.set(curr, 0);
      }
      const c: GitCommit = commitMap.get(curr)!;
      curr = c.parents.length > 0 ? c.parents[0] : null;
    }
  }

  // Reverse mapping for head and refs
  const headTargetCommit = state.head.type === 'branch' ? state.refs.heads[state.head.target] : state.head.target;

  // Build render nodes
  const nodes: RenderNode[] = [];
  let maxCol = 0;
  let minLane = 0;
  let maxLane = 0;

  for (const [id, commit] of commitMap.entries()) {
    const col = xDepthMap.get(id) || 0;
    const lane = commitLaneMap.get(id) || 0;

    maxCol = Math.max(maxCol, col);
    minLane = Math.min(minLane, lane);
    maxLane = Math.max(maxLane, lane);

    const x = PADDING_X + col * HORIZONTAL_SPACING;
    const y = PADDING_Y + lane * VERTICAL_SPACING;

    const branchTips = Object.entries(state.refs.heads)
      .filter(([_, commitId]) => commitId === id)
      .map(([name]) => name);

    const tags = Object.entries(state.refs.tags || {})
      .filter(([_, commitId]) => commitId === id)
      .map(([name]) => name);

    const remoteBranchTips: string[] = [];
    for (const [remoteName, branches] of Object.entries(state.refs.remotes || {})) {
      for (const [bName, rCommitId] of Object.entries(branches)) {
        if (rCommitId === id) {
          remoteBranchTips.push(`${remoteName}/${bName}`);
        }
      }
    }

    nodes.push({
      id,
      commit,
      x,
      y,
      lane,
      branchName: commit.branchTag,
      isHead: headTargetCommit === id,
      isBranchTip: branchTips.length > 0,
      branchTips,
      tags,
      isRemoteTip: remoteBranchTips.length > 0,
      remoteBranchTips,
    });
  }

  // Sort nodes from root to tip for proper rendering
  nodes.sort((a, b) => a.x - b.x);

  // Build Bézier spline connectors
  const splines: RenderSpline[] = [];
  const nodePositionMap = new Map<ObjectId, { x: number; y: number }>();
  for (const node of nodes) {
    nodePositionMap.set(node.id, { x: node.x, y: node.y });
  }

  for (const node of nodes) {
    const childPos = { x: node.x, y: node.y };
    for (let i = 0; i < node.commit.parents.length; i++) {
      const parentId = node.commit.parents[i];
      const parentPos = nodePositionMap.get(parentId);
      if (!parentPos) continue;

      const isMerge = i > 0;
      const dx = childPos.x - parentPos.x;
      const cp1x = parentPos.x + dx * 0.5;
      const cp1y = parentPos.y;
      const cp2x = parentPos.x + dx * 0.5;
      const cp2y = childPos.y;

      const pathD = `M ${parentPos.x} ${parentPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${childPos.x} ${childPos.y}`;

      splines.push({
        id: `spline-${parentId}-${node.id}-${i}`,
        fromId: parentId,
        toId: node.id,
        fromX: parentPos.x,
        fromY: parentPos.y,
        toX: childPos.x,
        toY: childPos.y,
        pathD,
        isMerge,
      });
    }
  }

  const width = Math.max(800, PADDING_X * 2 + (maxCol + 1) * HORIZONTAL_SPACING);
  const totalLanes = Math.max(1, maxLane - minLane + 1);
  const height = Math.max(400, PADDING_Y * 2 + totalLanes * VERTICAL_SPACING);

  return {
    nodes,
    splines,
    width,
    height,
    laneCount: totalLanes,
  };
}
