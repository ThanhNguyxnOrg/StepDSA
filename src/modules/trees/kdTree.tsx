import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface KDPoint {
  id: number;
  x: number;
  y: number;
  label?: string;
}

export interface KDNodeData {
  id: string;
  point: KDPoint;
  axis: 'x' | 'y';
  depth: number;
  left: KDNodeData | null;
  right: KDNodeData | null;
}

export interface KDSplitLine {
  axis: 'x' | 'y';
  val: number;
  min: number;
  max: number;
  color: string;
}

export interface KDTreeState {
  points: KDPoint[];
  root: KDNodeData | null;
  activePointId: number | null;
  activeNodeId: string | null;
  splitLines: KDSplitLine[];
  searchTarget: KDPoint | null;
  bestPoint: KDPoint | null;
  bestDist: number | null;
  message: string;
}

function cloneKD(node: KDNodeData | null): KDNodeData | null {
  if (!node) return null;
  return {
    id: node.id,
    point: { ...node.point },
    axis: node.axis,
    depth: node.depth,
    left: cloneKD(node.left),
    right: cloneKD(node.right),
  };
}

export const kdTreeModule: AlgorithmModule<
  { points: { x: number; y: number }[]; targetQuery: { x: number; y: number } },
  KDTreeState
> = {
  id: 'kd-tree',
  title: 'KD-Tree (K-Dimensional Spatial Point Partitioning)',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N) nearest neighbor search',
    timeAverage: 'O(log N) point location & nearest neighbor',
    timeWorst: 'O(N) degraded hyper-plane scan (curse of dimensionality)',
    spaceAuxiliary: 'O(N) binary spatial partition tree',
    worstCaseCondition: 'High dimensions (k >= 20) or unbalanced distribution degenerating into linear tree scans',
  },
  theory: {
    overview:
      'A k-d tree (short for k-dimensional tree) is a space-partitioning data structure for organizing points in a k-dimensional space. In 2D, nodes alternate splitting the plane between vertical (x-axis) and horizontal (y-axis) hyperplanes.',
    whyItWorks:
      'At each depth d, the splitting axis is chosen as d % k. By partitioning points into left/bottom and right/top subspaces, range queries and nearest-neighbor searches prune entire geometric subtrees whose bounding boxes are further than the current best distance.',
    invariant:
      'Spatial Partition Invariant: For any node at depth d splitting on axis A (where A is X if d % 2 == 0 else Y): All nodes in the left subtree satisfy point[A] < node.point[A], and all nodes in the right subtree satisfy point[A] >= node.point[A].',
    pitfalls: [
      'In high dimensions (k > 15), almost all points lie near the boundary of the space, collapsing k-d tree search performance down to brute force O(N).',
      'Forgetting to check whether the hypersphere around the target query intersects the splitting hyperplane before pruning the opposite branch.',
    ],
  },
  defaultInput: {
    points: [
      { x: 30, y: 40 },
      { x: 5, y: 25 },
      { x: 70, y: 15 },
      { x: 10, y: 65 },
      { x: 80, y: 70 },
      { x: 50, y: 50 },
    ],
    targetQuery: { x: 65, y: 60 },
  },
  presets: [
    {
      id: 'cluster-partition',
      label: 'Cluster Partition (6 Points)',
      description: 'Distributed 2D points with alternating X/Y hyperplane cuts',
      data: {
        points: [
          { x: 20, y: 30 },
          { x: 40, y: 70 },
          { x: 80, y: 20 },
          { x: 90, y: 60 },
          { x: 50, y: 40 },
        ],
        targetQuery: { x: 45, y: 45 },
      },
    },
    {
      id: 'symmetric-grid',
      label: 'Symmetric Grid',
      description: 'Evenly spaced corner points surrounding center search target',
      data: {
        points: [
          { x: 25, y: 25 },
          { x: 25, y: 75 },
          { x: 75, y: 25 },
          { x: 75, y: 75 },
          { x: 50, y: 50 },
        ],
        targetQuery: { x: 30, y: 30 },
      },
    },
  ],
  codeSnippets: {
    cpp: `struct KDNode {
    Point pt;
    KDNode *left = nullptr, *right = nullptr;
    KDNode(Point p) : pt(p) {}
};

KDNode* insert(KDNode* root, Point pt, int depth = 0) {
    if (!root) return new KDNode(pt);
    int cd = depth % 2; // 0 for X, 1 for Y
    if ((cd == 0 ? pt.x : pt.y) < (cd == 0 ? root->pt.x : root->pt.y))
        root->left = insert(root->left, pt, depth + 1);
    else
        root->right = insert(root->right, pt, depth + 1);
    return root;
}`,
    python: `class KDNode:
    def __init__(self, point, axis, left=None, right=None):
        self.point = point
        self.axis = axis
        self.left = left
        self.right = right

def insert(node, point, depth=0):
    if not node:
        return KDNode(point, "x" if depth % 2 == 0 else "y")
    axis = node.axis
    val = point[0] if axis == "x" else point[1]
    node_val = node.point[0] if axis == "x" else node.point[1]
    if val < node_val:
        node.left = insert(node.left, point, depth + 1)
    else:
        node.right = insert(node.right, point, depth + 1)
    return node`,
    typescript: `interface KDNode {
  point: [number, number];
  axis: 'x' | 'y';
  left: KDNode | null;
  right: KDNode | null;
}

function insert(node: KDNode | null, pt: [number, number], depth = 0): KDNode {
  if (!node) return { point: pt, axis: depth % 2 === 0 ? 'x' : 'y', left: null, right: null };
  const axis = node.axis;
  const isLeft = (axis === 'x' ? pt[0] < node.point[0] : pt[1] < node.point[1]);
  if (isLeft) node.left = insert(node.left, pt, depth + 1);
  else node.right = insert(node.right, pt, depth + 1);
  return node;
}`,
    java: `class KDNode {
    double[] pt;
    KDNode left, right;
    int axis;
    KDNode(double[] pt, int axis) { this.pt = pt; this.axis = axis; }
}

KDNode insert(KDNode node, double[] pt, int depth) {
    if (node == null) return new KDNode(pt, depth % 2);
    int cd = depth % 2;
    if (pt[cd] < node.pt[cd]) node.left = insert(node.left, pt, depth + 1);
    else node.right = insert(node.right, pt, depth + 1);
    return node;
}`,
    pseudocode: `function insert(node, point, depth):
    if node is null:
        return Node(point, axis = depth % 2)
    axis = depth % 2
    if point[axis] < node.point[axis]:
        node.left = insert(node.left, point, depth + 1)
    else:
        node.right = insert(node.right, point, depth + 1)
    return node`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<KDTreeState>[] = [];
    const pts: KDPoint[] = input.points.map((p, idx) => ({ id: idx, x: p.x, y: p.y, label: `P${idx}` }));
    let root: KDNodeData | null = null;
    const splitLines: KDSplitLine[] = [];

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: KDTreeState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    addFrame(
      1,
      `Building 2D KD-Tree for ${pts.length} spatial points. Splitting alternates X (depth 0, 2...) and Y (depth 1, 3...).`,
      {
        points: pts,
        root: null,
        activePointId: null,
        activeNodeId: null,
        splitLines: [],
        searchTarget: input.targetQuery ? { id: 999, ...input.targetQuery, label: 'Target' } : null,
        bestPoint: null,
        bestDist: null,
        message: 'Initializing empty 2D KD-Tree structure.',
      },
      {
        action: 'INIT',
        variables: { totalPoints: pts.length, dimensions: 2 },
        callStack: [{ name: 'buildKDTree', params: { pointsCount: pts.length } }],
      }
    );

    let nodeCounter = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      let depth = 0;

      if (!root) {
        nodeCounter++;
        root = {
          id: `kd-${nodeCounter}`,
          point: p,
          axis: 'x',
          depth: 0,
          left: null,
          right: null,
        };
        splitLines.push({
          axis: 'x',
          val: p.x,
          min: 0,
          max: 100,
          color: '#38bdf8',
        });

        addFrame(
          4,
          `Inserted root point P${p.id} (${p.x}, ${p.y}) at depth 0. Split axis = X (Vertical line x = ${p.x}).`,
          {
            points: pts,
            root: cloneKD(root),
            activePointId: p.id,
            activeNodeId: root.id,
            splitLines: [...splitLines],
            searchTarget: input.targetQuery ? { id: 999, ...input.targetQuery, label: 'Target' } : null,
            bestPoint: null,
            bestDist: null,
            message: `Root inserted: P${p.id} splits entire 2D space on X = ${p.x}.`,
          },
          {
            action: 'INSERT_ROOT',
            variables: { pointId: p.id, x: p.x, y: p.y, axis: 'x', depth: 0 },
            callStack: [{ name: 'insert', params: { x: p.x, y: p.y, depth: 0 } }],
          }
        );
      } else {
        let curr: KDNodeData | null = root;
        let parent: KDNodeData | null = null;
        let isLeft = false;

        while (curr) {
          parent = curr;
          const axis = curr.depth % 2 === 0 ? 'x' : 'y';
          const pVal = axis === 'x' ? p.x : p.y;
          const currVal = axis === 'x' ? curr.point.x : curr.point.y;

          addFrame(
            7,
            `Comparing P${p.id}(${p.x}, ${p.y}) with node P${curr.point.id} on ${axis.toUpperCase()}-axis: ${pVal} ${pVal < currVal ? '<' : '>='} ${currVal}.`,
            {
              points: pts,
              root: cloneKD(root),
              activePointId: p.id,
              activeNodeId: curr.id,
              splitLines: [...splitLines],
              searchTarget: input.targetQuery ? { id: 999, ...input.targetQuery, label: 'Target' } : null,
              bestPoint: null,
              bestDist: null,
              message: `Traversing depth ${curr.depth} (Axis: ${axis.toUpperCase()}): Branching ${pVal < currVal ? 'Left/Bottom' : 'Right/Top'}.`,
            },
            {
              action: 'COMPARE_AXIS',
              variables: { currPoint: curr.point.id, axis, pVal, currVal },
              callStack: [{ name: 'insert', params: { id: p.id, depth: curr.depth } }],
            }
          );

          if (pVal < currVal) {
            isLeft = true;
            curr = curr.left;
          } else {
            isLeft = false;
            curr = curr.right;
          }
          depth++;
        }

        nodeCounter++;
        const nextAxis = depth % 2 === 0 ? 'x' : 'y';
        const newNode: KDNodeData = {
          id: `kd-${nodeCounter}`,
          point: p,
          axis: nextAxis,
          depth,
          left: null,
          right: null,
        };

        if (parent) {
          if (isLeft) parent.left = newNode;
          else parent.right = newNode;
        }

        splitLines.push({
          axis: nextAxis,
          val: nextAxis === 'x' ? p.x : p.y,
          min: 0,
          max: 100,
          color: nextAxis === 'x' ? '#38bdf8' : '#34d399',
        });

        addFrame(
          11,
          `Attached P${p.id} as ${isLeft ? 'Left' : 'Right'} child of P${parent?.point.id ?? 0} at depth ${depth}. Split axis: ${nextAxis.toUpperCase()}.`,
          {
            points: pts,
            root: cloneKD(root),
            activePointId: p.id,
            activeNodeId: newNode.id,
            splitLines: [...splitLines],
            searchTarget: input.targetQuery ? { id: 999, ...input.targetQuery, label: 'Target' } : null,
            bestPoint: null,
            bestDist: null,
            message: `P${p.id} inserted at depth ${depth}. Alternating axis: ${nextAxis.toUpperCase()} = ${nextAxis === 'x' ? p.x : p.y}.`,
          },
          {
            action: 'ATTACH_NODE',
            variables: { pointId: p.id, parentId: parent?.point.id ?? 0, depth, axis: nextAxis },
            callStack: [{ name: 'insert', params: { id: p.id, depth } }],
          }
        );
      }
    }

    // Nearest Neighbor Search on target
    if (input.targetQuery) {
      const target = { id: 999, ...input.targetQuery, label: 'Target' };
      let bestPt: KDPoint | null = null;
      let bestD = Infinity;

      addFrame(
        15,
        `Starting Nearest Neighbor Search for target query Q(${target.x}, ${target.y}).`,
        {
          points: pts,
          root: cloneKD(root),
          activePointId: null,
          activeNodeId: null,
          splitLines: [...splitLines],
          searchTarget: target,
          bestPoint: null,
          bestDist: null,
          message: `Locating closest point to Target Q(${target.x}, ${target.y}).`,
        },
        {
          action: 'NN_START',
          variables: { targetX: target.x, targetY: target.y, bestDist: 'Infinity' },
          callStack: [{ name: 'nearestNeighbor', params: { x: target.x, y: target.y } }],
        }
      );

      const searchStack: KDNodeData[] = root ? [root] : [];
      while (searchStack.length > 0) {
        const curr = searchStack.pop()!;
        const dist = Math.hypot(curr.point.x - target.x, curr.point.y - target.y);

        if (dist < bestD) {
          bestD = dist;
          bestPt = curr.point;
        }

        addFrame(
          18,
          `Examining node P${curr.point.id} (${curr.point.x}, ${curr.point.y}). Distance = ${dist.toFixed(2)}. Best: P${bestPt?.id ?? 0} (dist: ${bestD.toFixed(2)}).`,
          {
            points: pts,
            root: cloneKD(root),
            activePointId: curr.point.id,
            activeNodeId: curr.id,
            splitLines: [...splitLines],
            searchTarget: target,
            bestPoint: bestPt,
            bestDist: bestD,
            message: `Evaluated distance to P${curr.point.id}: ${dist.toFixed(1)} px. Current nearest: P${bestPt?.id ?? 0}.`,
          },
          {
            action: 'NN_EXPLORE',
            variables: { currPoint: curr.point.id, dist: dist.toFixed(2), bestDist: bestD.toFixed(2) },
            callStack: [{ name: 'nnExplore', params: { node: curr.point.id, dist: dist.toFixed(2) } }],
          }
        );

        if (curr.right) searchStack.push(curr.right);
        if (curr.left) searchStack.push(curr.left);
      }

      addFrame(
        22,
        `Nearest Neighbor Found: P${bestPt?.id ?? 0} (${bestPt?.x ?? 0}, ${bestPt?.y ?? 0}) with distance ${bestD.toFixed(2)}.`,
        {
          points: pts,
          root: cloneKD(root),
          activePointId: bestPt?.id ?? null,
          activeNodeId: null,
          splitLines: [...splitLines],
          searchTarget: target,
          bestPoint: bestPt,
          bestDist: bestD,
          message: `Query resolved: Nearest point is P${bestPt?.id ?? 0} at distance ${bestD.toFixed(2)}.`,
        },
        {
          action: 'NN_FOUND',
          variables: { bestId: bestPt?.id ?? 0, bestX: bestPt?.x ?? 0, bestY: bestPt?.y ?? 0, distance: bestD.toFixed(2) },
          callStack: [{ name: 'finish', params: { bestId: bestPt?.id ?? 0 } }],
        }
      );
    }

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<KDTreeState>) => {
    const { points, splitLines, activePointId, searchTarget, bestPoint, bestDist, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Status banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* 2D Plane Vector Stage */}
        <div className="relative w-full max-w-2xl aspect-square bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Coordinate Grid */}
            <defs>
              <pattern id="kd-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#kd-grid)" />

            {/* Split Lines */}
            {splitLines.map((line, idx) => {
              if (line.axis === 'x') {
                return (
                  <line
                    key={`line-${idx}`}
                    x1={line.val}
                    y1={0}
                    x2={line.val}
                    y2={100}
                    stroke={line.color}
                    strokeWidth="0.75"
                    strokeDasharray="1.5,1.5"
                    opacity="0.8"
                  />
                );
              } else {
                return (
                  <line
                    key={`line-${idx}`}
                    x1={0}
                    y1={line.val}
                    x2={100}
                    y2={line.val}
                    stroke={line.color}
                    strokeWidth="0.75"
                    strokeDasharray="1.5,1.5"
                    opacity="0.8"
                  />
                );
              }
            })}

            {/* Nearest Distance Circle */}
            {searchTarget && bestPoint && bestDist !== null && (
              <circle
                cx={searchTarget.x}
                cy={searchTarget.y}
                r={bestDist}
                fill="#f59e0b"
                fillOpacity="0.08"
                stroke="#f59e0b"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            )}

            {/* Connection Line to Nearest */}
            {searchTarget && bestPoint && (
              <line
                x1={searchTarget.x}
                y1={searchTarget.y}
                x2={bestPoint.x}
                y2={bestPoint.y}
                stroke="#f59e0b"
                strokeWidth="1"
              />
            )}

            {/* Points */}
            {points.map((p) => {
              const isActive = p.id === activePointId;
              const isBest = bestPoint && p.id === bestPoint.id;

              let fill = '#38bdf8';
              let r = 2.5;

              if (isBest) {
                fill = '#10b981';
                r = 3.5;
              } else if (isActive) {
                fill = '#fbbf24';
                r = 3.5;
              }

              return (
                <g key={`pt-${p.id}`}>
                  <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#ffffff" strokeWidth="0.6" />
                  <text
                    x={p.x + 3}
                    y={p.y + 1}
                    fontSize="3"
                    fill="#cbd5e1"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    P{p.id}({p.x},{p.y})
                  </text>
                </g>
              );
            })}

            {/* Target Query Point */}
            {searchTarget && (
              <g>
                <circle
                  cx={searchTarget.x}
                  cy={searchTarget.y}
                  r="3.5"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
                <text
                  x={searchTarget.x + 4}
                  y={searchTarget.y + 1}
                  fontSize="3.5"
                  fill="#fca5a5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Target({searchTarget.x},{searchTarget.y})
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-sky-400" />
            <span>Vertical X-Split</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-400" />
            <span>Horizontal Y-Split</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Nearest Neighbor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Search Target</span>
          </div>
        </div>
      </div>
    );
  },
};
