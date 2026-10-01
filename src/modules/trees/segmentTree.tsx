import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

export interface SegmentTreeNodeInfo {
  treeIndex: number;
  l: number;
  r: number;
  sum: number;
}

export interface SegmentTreeState extends TreeStageState {
  rawArray: number[];
  activeRange?: [number, number];
  queryResult?: number;
  highlightedTreeIndex?: number;
}

export const segmentTreeModule: AlgorithmModule<
  { array: number[]; query: [number, number] },
  SegmentTreeState
> = {
  id: 'segment-tree',
  title: 'Segment Tree (Range Sum Query & Updates O(log N))',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(4N)',
    worstCaseCondition: 'Range query spans multiple non-contiguous segment canonical intervals',
  },
  theory: {
    overview:
      'A Segment Tree is a balanced binary tree used for storing information about intervals or segments. It allows querying which segments contain a given point or range aggregate (sum, min, max) in O(log N) time, while supporting point updates in O(log N).',
    whyItWorks:
      'Each leaf node corresponds to a single array element [i, i]. Each internal node merges the answers of its left child [l, mid] and right child [mid + 1, r]. Any arbitrary range query [L, R] can be decomposed into at most 2 * log2(N) disjoint canonical segment nodes.',
    invariant:
      'Range Merge Invariant: tree[node] == tree[2*node] + tree[2*node + 1] for all non-leaf nodes.',
    pitfalls: [
      'Array sizing: tree array must be sized 4 * N to prevent heap buffer overflow on power-of-two boundaries.',
      'Partial vs total interval overlaps in range queries.',
    ],
  },
  presets: [
    {
      id: 'query-mid',
      label: 'Query Range [1, 3] on [1, 3, 5, 7]',
      description: 'Sum over indices 1 to 3: 3 + 5 + 7 = 15',
      data: { array: [1, 3, 5, 7], query: [1, 3] },
    },
    {
      id: 'query-full',
      label: 'Full Array Range [0, 3]',
      description: 'Single O(1) root hit: 1 + 3 + 5 + 7 = 16',
      data: { array: [1, 3, 5, 7], query: [0, 3] },
    },
  ],
  defaultInput: { array: [1, 3, 5, 7], query: [1, 3] },
  codeSnippets: {
    python: `class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.build(arr, 1, 0, self.n - 1)

    def build(self, arr, node, l, r):
        if l == r:
            self.tree[node] = arr[l]
            return
        mid = (l + r) // 2
        self.build(arr, 2 * node, l, mid)
        self.build(arr, 2 * node + 1, mid + 1, r)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, node, l, r, ql, qr):
        if ql <= l and r <= qr:
            return self.tree[node]
        if r < ql or l > qr:
            return 0
        mid = (l + r) // 2
        return (self.query(2 * node, l, mid, ql, qr) +
                self.query(2 * node + 1, mid + 1, r, ql, qr))`,
    typescript: `class SegmentTree {
  private tree: number[];
  private n: number;
  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.build(arr, 1, 0, this.n - 1);
  }
  private build(arr: number[], node: number, l: number, r: number): void {
    if (l === r) { this.tree[node] = arr[l]; return; }
    const mid = Math.floor((l + r) / 2);
    this.build(arr, 2 * node, l, mid);
    this.build(arr, 2 * node + 1, mid + 1, r);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }
  query(node: number, l: number, r: number, ql: number, qr: number): number {
    if (ql <= l && r <= qr) return this.tree[node];
    if (r < ql || l > qr) return 0;
    const mid = Math.floor((l + r) / 2);
    return this.query(2 * node, l, mid, ql, qr) + this.query(2 * node + 1, mid + 1, r, ql, qr);
  }
}`,
    cpp: `void build(const vector<int>& arr, int node, int l, int r, vector<int>& tree) {
    if (l == r) { tree[node] = arr[l]; return; }
    int mid = (l + r) / 2;
    build(arr, 2 * node, l, mid, tree);
    build(arr, 2 * node + 1, mid + 1, r, tree);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}

int query(int node, int l, int r, int ql, int qr, const vector<int>& tree) {
    if (ql <= l && r <= qr) return tree[node];
    if (r < ql || l > qr) return 0;
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr, tree) + query(2 * node + 1, mid + 1, r, ql, qr, tree);
}`,
    java: `int query(int node, int l, int r, int ql, int qr, int[] tree) {
    if (ql <= l && r <= qr) return tree[node];
    if (r < ql || l > qr) return 0;
    int mid = (l + r) / 2;
    return query(2 * node, l, mid, ql, qr, tree) + query(2 * node + 1, mid + 1, r, ql, qr, tree);
}`,
    pseudocode: `function query(node, l, r, ql, qr):
    if [l, r] is within [ql, qr]: return tree[node]
    if [l, r] outside [ql, qr]: return 0
    mid <- (l + r) / 2
    return query(2*node, l, mid, ql, qr) + query(2*node+1, mid+1, r, ql, qr)`,
  },
  generateTimeline: (input) => {
    const rawArr = input.array.length > 0 ? input.array.slice(0, 4) : [1, 3, 5, 7];
    const n = rawArr.length;
    const tree = new Array(4 * n).fill(0);
    const nodeCoords: Record<number, { x: number; y: number; l: number; r: number }> = {
      1: { x: 350, y: 50, l: 0, r: 3 },
      2: { x: 230, y: 130, l: 0, r: 1 },
      3: { x: 470, y: 130, l: 2, r: 3 },
      4: { x: 170, y: 210, l: 0, r: 0 },
      5: { x: 290, y: 210, l: 1, r: 1 },
      6: { x: 410, y: 210, l: 2, r: 2 },
      7: { x: 530, y: 210, l: 3, r: 3 },
    };

    const buildTreeNodes = (
      activeTreeIdx?: number,
      selectedTreeIndices: Set<number> = new Set()
    ): TreeNode[] => {
      const nodes: TreeNode[] = [];
      Object.entries(nodeCoords).forEach(([k, coord]) => {
        const idx = Number(k);
        nodes.push({
          id: `seg-${idx}`,
          value: tree[idx],
          x: coord.x,
          y: coord.y,
          status:
            idx === activeTreeIdx
              ? 'active'
              : selectedTreeIndices.has(idx)
              ? 'sorted'
              : 'default',
        });
      });
      return nodes;
    };

    const frames: ExecutionFrame<SegmentTreeState>[] = [];

    // Build segment tree
    const build = (node: number, l: number, r: number) => {
      if (l === r) {
        tree[node] = rawArr[l];
        return;
      }
      const mid = Math.floor((l + r) / 2);
      build(2 * node, l, mid);
      build(2 * node + 1, mid + 1, r);
      tree[node] = tree[2 * node] + tree[2 * node + 1];
    };

    build(1, 0, n - 1);

    const ql = Math.max(0, input.query[0]);
    const qr = Math.min(n - 1, input.query[1]);

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Segment Tree built over array [${rawArr.join(
        ', '
      )}]. Root node #1 represents interval [0, 3] with total sum ${
        tree[1]
      }. Target Range Query: [${ql}, ${qr}].`,
      isMilestone: true,
      milestoneTitle: 'Segment Tree Initialized',
      soundCue: { type: 'start' },
      variables: { queryRange: `[${ql}, ${qr}]`, rootSum: tree[1], arrayLength: n },
      callStack: [{ name: 'buildSegmentTree', params: { n }, line: 4, isCurrent: true }],
      conditionEval: { expr: `n > 0`, result: true },
      state: {
        rawArray: [...rawArr],
        nodes: buildTreeNodes(),
        activeRange: [ql, qr],
      },
    });

    const chosenSegments = new Set<number>();
    let totalSum = 0;

    const query = (node: number, l: number, r: number): number => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 16,
        explanation: `Query visiting node #${node} spanning [${l}, ${r}] with sum ${tree[node]}. Comparing against target range [${ql}, ${qr}].`,
        soundCue: { type: 'compare' },
        variables: { node, segment: `[${l}, ${r}]`, sum: tree[node], target: `[${ql}, ${qr}]` },
        callStack: [{ name: 'rangeQuery', params: { node, l, r }, line: 16, isCurrent: true }],
        conditionEval: { expr: `ql <= l && r <= qr (${ql} <= ${l} && ${r} <= ${qr})`, result: ql <= l && r <= qr },
        state: {
          rawArray: [...rawArr],
          nodes: buildTreeNodes(node, chosenSegments),
          activeRange: [ql, qr],
          queryResult: totalSum,
          highlightedTreeIndex: node,
        },
      });

      // Total overlap
      if (ql <= l && r <= qr) {
        chosenSegments.add(node);
        totalSum += tree[node];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          explanation: `Total overlap! Segment [${l}, ${r}] is strictly inside [${ql}, ${qr}]. Adding ${tree[node]} to accumulator. Running sum = ${totalSum}.`,
          isMilestone: true,
          milestoneTitle: `Merged Segment [${l}, ${r}]: +${tree[node]}`,
          soundCue: { type: 'swap' },
          variables: { matchedSegment: `[${l}, ${r}]`, addedValue: tree[node], runningTotal: totalSum },
          callStack: [{ name: 'accumulateSegment', params: { node, val: tree[node] }, line: 18, isCurrent: true }],
          conditionEval: { expr: `ql <= l && r <= qr`, result: true },
          state: {
            rawArray: [...rawArr],
            nodes: buildTreeNodes(node, chosenSegments),
            activeRange: [ql, qr],
            queryResult: totalSum,
            highlightedTreeIndex: node,
          },
        });
        return tree[node];
      }

      // No overlap
      if (r < ql || l > qr) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 20,
          explanation: `Disjoint: Segment [${l}, ${r}] lies entirely outside [${ql}, ${qr}]. Returning 0.`,
          soundCue: { type: 'step' },
          variables: { disjointSegment: `[${l}, ${r}]`, target: `[${ql}, ${qr}]`, contribution: 0 },
          callStack: [{ name: 'disjointSegment', params: { node, l, r }, line: 20, isCurrent: true }],
          conditionEval: { expr: `r < ql || l > qr`, result: true },
          state: {
            rawArray: [...rawArr],
            nodes: buildTreeNodes(undefined, chosenSegments),
            activeRange: [ql, qr],
            queryResult: totalSum,
          },
        });
        return 0;
      }

      // Partial overlap: split
      const mid = Math.floor((l + r) / 2);
      const leftSum = query(2 * node, l, mid);
      const rightSum = query(2 * node + 1, mid + 1, r);
      return leftSum + rightSum;
    };

    query(1, 0, n - 1);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 23,
      explanation: `Range Sum Query for [${ql}, ${qr}] complete in O(log N)! Total Range Sum = ${totalSum}.`,
      isMilestone: true,
      milestoneTitle: `Query Result: ${totalSum}`,
      soundCue: { type: 'complete' },
      variables: { totalRangeSum: totalSum, range: `[${ql}, ${qr}]`, queryComplete: true },
      callStack: [{ name: 'rangeQuery.done', params: { result: totalSum }, line: 23, isCurrent: true }],
      conditionEval: { expr: `totalSum >= 0`, result: true },
      state: {
        rawArray: [...rawArr],
        nodes: buildTreeNodes(undefined, chosenSegments),
        activeRange: [ql, qr],
        queryResult: totalSum,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    const { rawArray, activeRange, queryResult } = frame.state;

    return (
      <div className="flex flex-col w-full h-full">
        {/* HUD */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Array:</span>
            <div className="flex items-center gap-1.5">
              {rawArray.map((val, idx) => {
                const inRange =
                  activeRange && idx >= activeRange[0] && idx <= activeRange[1];
                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                      inRange
                        ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    [{idx}]: {val}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeRange && (
              <span className="text-xs font-mono text-amber-300 font-bold">
                Query Range: [{activeRange[0]}, {activeRange[1]}]
              </span>
            )}
            {queryResult !== undefined && (
              <span className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500 text-xs font-mono text-emerald-300 font-bold">
                Sum: {queryResult}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <TreeStage state={frame.state} projection={projection} />
        </div>
      </div>
    );
  },
};
