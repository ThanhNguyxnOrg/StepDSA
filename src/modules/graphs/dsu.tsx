import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DSUOperation {
  type: 'FIND' | 'UNION';
  x: string;
  y?: string;
}

export interface DSUInput {
  elements: string[];
  operations: DSUOperation[];
}

export interface DSUState {
  elements: string[];
  parents: Record<string, string>;
  ranks: Record<string, number>;
  activeElements: string[];
  rootMap: Record<string, string>;
  currentOp?: string;
  actionMessage?: string;
}

const defaultDSUInput: DSUInput = {
  elements: ['A', 'B', 'C', 'D', 'E', 'F'],
  operations: [
    { type: 'UNION', x: 'A', y: 'B' },
    { type: 'UNION', x: 'C', y: 'D' },
    { type: 'UNION', x: 'B', y: 'C' },
    { type: 'FIND', x: 'D' },
    { type: 'UNION', x: 'E', y: 'F' },
    { type: 'FIND', x: 'A' },
  ],
};

export const dsuModule: AlgorithmModule<DSUInput, DSUState> = {
  id: 'disjoint-set-union',
  title: 'Disjoint Set Union (DSU / Union-Find)',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(α(N)) nearly constant',
    timeWorst: 'O(α(N)) via Ackermann Inverse',
    spaceAuxiliary: 'O(N) for parent and rank arrays',
    worstCaseCondition: 'With Path Compression and Union by Rank, any sequence of M operations takes O(M α(N))',
  },
  theory: {
    overview:
      'Disjoint Set Union (DSU), also known as Union-Find, tracks partitioned sets of elements. It supports two near-constant-time operations: UNION (merging two sets together) and FIND (identifying the canonical representative of a set). It is the backbone of Kruskal’s MST and dynamic connectivity graphs.',
    whyItWorks:
      'Path Compression flattens the tree during FIND by pointing visited nodes directly to the root. Union by Rank always attaches the shallower tree under the deeper tree, keeping tree height bounded by O(log N) even before compression.',
    invariant:
      'Every set is represented by a unique rooted tree whose representative root satisfies parent[r] == r. Two nodes u and v belong to the same component if and only if FIND(u) == FIND(v).',
    pitfalls: [
      'Omitting path compression degrades tree height to O(N) linear chains during repeated sequential unions.',
      'Union by size/rank must only increment rank when merging two trees of strictly equal rank.',
    ],
  },
  presets: [
    {
      id: 'chain-merge',
      label: 'Standard Merge Sequence',
      description: 'Progressively unites 6 components into larger trees',
      data: defaultDSUInput,
    },
    {
      id: 'path-compression',
      label: 'Path Compression Demo',
      description: 'Long chain flattened on single FIND call',
      data: {
        elements: ['0', '1', '2', '3', '4'],
        operations: [
          { type: 'UNION', x: '0', y: '1' },
          { type: 'UNION', x: '1', y: '2' },
          { type: 'UNION', x: '2', y: '3' },
          { type: 'UNION', x: '3', y: '4' },
          { type: 'FIND', x: '4' },
        ],
      },
    },
  ],
  defaultInput: defaultDSUInput,
  codeSnippets: {
    python: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x]) # Path compression
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True`,
    typescript: `class DSU {
  parent: number[];
  rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    let rx = this.find(x);
    let ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) [rx, ry] = [ry, rx];
    this.parent[ry] = rx;
    if (this.rank[rx] === this.rank[ry]) this.rank[rx]++;
    return true;
  }
}`,
    cpp: `class DSU {
    vector<int> parent, rank;
public:
    DSU(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (rank[rx] < rank[ry]) swap(rx, ry);
        parent[ry] = rx;
        if (rank[rx] == rank[ry]) rank[rx]++;
        return true;
    }
};`,
    java: `class DSU {
    int[] parent, rank;
    public DSU(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    public int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    public boolean union(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (rank[rx] < rank[ry]) { int t = rx; rx = ry; ry = t; }
        parent[ry] = rx;
        if (rank[rx] == rank[ry]) rank[rx]++;
        return true;
    }
}`,
    pseudocode: `function find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]

function union(x, y):
    rootX = find(x), rootY = find(y)
    if rootX == rootY: return false
    if rank[rootX] < rank[rootY]: swap(rootX, rootY)
    parent[rootY] = rootX
    if rank[rootX] == rank[rootY]: rank[rootX]++
    return true`,
  },

  generateTimeline: (input: DSUInput): ExecutionFrame<DSUState>[] => {
    const frames: ExecutionFrame<DSUState>[] = [];
    const elements = input.elements;
    const parents: Record<string, string> = {};
    const ranks: Record<string, number> = {};

    elements.forEach((el) => {
      parents[el] = el;
      ranks[el] = 0;
    });

    const getRootMap = (): Record<string, string> => {
      const map: Record<string, string> = {};
      elements.forEach((el) => {
        let curr = el;
        while (parents[curr] !== curr) curr = parents[curr];
        map[el] = curr;
      });
      return map;
    };

    const makeState = (
      active: string[] = [],
      currentOp?: string,
      actionMessage?: string
    ): DSUState => ({
      elements,
      parents: { ...parents },
      ranks: { ...ranks },
      activeElements: active,
      rootMap: getRootMap(),
      currentOp,
      actionMessage,
    });

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized DSU with ${elements.length} disjoint singletons: {${elements.map((e) => `[${e}]`).join(', ')}}. Each element is its own parent (rank = 0).`,
      isMilestone: true,
      milestoneTitle: 'DSU Initialized',
      soundCue: { type: 'start' },
      variables: { totalSets: elements.length, elements: elements.join(', ') },
      callStack: [{ name: 'DSU.init', params: { size: elements.length }, line: 1, isCurrent: true }],
      conditionEval: { expr: `elements.length > 0`, result: true },
      scopeVariables: { totalSets: elements.length, elements: elements.join(', ') },
      state: makeState([], 'INIT', 'Initial State: All elements are independent singletons'),
    });

    const findWithLogging = (x: string): string => {
      const path: string[] = [];
      let curr = x;
      while (parents[curr] !== curr) {
        path.push(curr);
        curr = parents[curr];
      }
      const root = curr;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `FIND(${x}): Traversed path [${[...path, root].join(' → ')}]. Canonical root is '${root}'.`,
        soundCue: { type: 'compare' },
        variables: { target: x, root, pathLength: path.length },
        callStack: [{ name: 'find', params: { x }, line: 7, isCurrent: true }],
        conditionEval: { expr: `parent[${curr}] == ${curr}`, result: true },
        scopeVariables: { target: x, root, pathLength: path.length },
        state: makeState([x, root], `FIND(${x})`, `Traversing path from ${x} to root ${root}`),
      });

      // Path compression
      if (path.length > 1) {
        path.forEach((node) => {
          parents[node] = root;
        });
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `⚡ Path Compression: Re-linked intermediate nodes [${path.join(', ')}] directly to root '${root}' in O(1).`,
          isMilestone: true,
          milestoneTitle: `Compress (${x} → ${root})`,
          soundCue: { type: 'swap' },
          variables: { compressedNodes: path.join(', '), newDirectParent: root },
          callStack: [{ name: 'compressPath', params: { root, path: path.join(',') }, line: 8, isCurrent: true }],
          conditionEval: { expr: `path.length > 1 (${path.length} > 1)`, result: true },
          scopeVariables: { compressedNodes: path.join(', '), newDirectParent: root },
          state: makeState(path, `COMPRESS(${x})`, `Flattened tree path directly under ${root}`),
        });
      }

      return root;
    };

    for (const op of input.operations) {
      if (op.type === 'FIND') {
        findWithLogging(op.x);
      } else if (op.type === 'UNION' && op.y) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          explanation: `UNION(${op.x}, ${op.y}): Initiating set merge. Finding representatives of both elements.`,
          soundCue: { type: 'step' },
          variables: { elementA: op.x, elementB: op.y },
          callStack: [{ name: 'union', params: { x: op.x, y: op.y }, line: 12, isCurrent: true }],
          conditionEval: { expr: `op.x !== op.y`, result: op.x !== op.y },
          scopeVariables: { elementA: op.x, elementB: op.y },
          state: makeState([op.x, op.y], `UNION(${op.x}, ${op.y})`, `Searching roots for ${op.x} and ${op.y}`),
        });

        const rootX = findWithLogging(op.x);
        const rootY = findWithLogging(op.y);

        if (rootX === rootY) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 14,
            explanation: `Notice: '${op.x}' and '${op.y}' already share identical root '${rootX}'. No union required (Cycle avoided).`,
            isMilestone: true,
            milestoneTitle: `Redundant Union (${op.x}, ${op.y})`,
            soundCue: { type: 'compare' },
            variables: { sharedRoot: rootX },
            callStack: [{ name: 'union.redundant', params: { rootX, rootY }, line: 14, isCurrent: true }],
            conditionEval: { expr: `rootX == rootY (${rootX} == ${rootY})`, result: true },
            scopeVariables: { sharedRoot: rootX },
            state: makeState([rootX], `UNION(${op.x}, ${op.y})`, `Already in same component (${rootX})`),
          });
        } else {
          // Union by rank
          let leader = rootX;
          let subordinate = rootY;
          if (ranks[rootX] < ranks[rootY]) {
            leader = rootY;
            subordinate = rootX;
          }

          parents[subordinate] = leader;
          const rankIncremented = ranks[leader] === ranks[subordinate];
          if (rankIncremented) ranks[leader] += 1;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 17,
            explanation: `✅ UNION Successful: Linked component '${subordinate}' under '${leader}' (by rank). ${rankIncremented ? `Rank of '${leader}' increased to ${ranks[leader]}.` : `Rank preserved.`}`,
            isMilestone: true,
            milestoneTitle: `United (${subordinate} → ${leader})`,
            soundCue: { type: 'swap' },
            variables: { leader, subordinate, newRank: ranks[leader] },
            callStack: [{ name: 'linkRoots', params: { leader, subordinate, rank: ranks[leader] }, line: 17, isCurrent: true }],
            conditionEval: { expr: `rank[leader] >= rank[subordinate]`, result: true },
            scopeVariables: { leader, subordinate, newRank: ranks[leader] },
            state: makeState([leader, subordinate], `UNION(${op.x}, ${op.y})`, `Component ${subordinate} merged into ${leader}`),
          });
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 21,
      explanation: `🎉 All DSU operations executed. Disjoint partition components stabilized.`,
      isMilestone: true,
      milestoneTitle: 'DSU Sequence Done',
      soundCue: { type: 'complete' },
      variables: { totalElements: elements.length, done: true },
      callStack: [{ name: 'dsu.complete', params: { count: elements.length }, line: 21, isCurrent: true }],
      conditionEval: { expr: `operations.done == true`, result: true },
      scopeVariables: { totalElements: elements.length },
      state: makeState([], 'DONE', 'Operations complete'),
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<DSUState>) => {
    const { elements, parents, ranks, activeElements, rootMap, currentOp, actionMessage } =
      frame.state;

    // Distinct colors for each component root
    const rootColors: Record<string, string> = {
      A: '#10b981', // emerald
      B: '#38bdf8', // sky
      C: '#f59e0b', // amber
      D: '#8b5cf6', // purple
      E: '#ec4899', // pink
      F: '#06b6d4', // cyan
      '0': '#10b981',
      '1': '#38bdf8',
      '2': '#f59e0b',
      '3': '#8b5cf6',
      '4': '#ec4899',
    };

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none">
        {/* Top Operation Banner */}
        <div className="flex items-center gap-4 mb-6">
          {currentOp && (
            <div className="px-3.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold shadow-md">
              OP: {currentOp}
            </div>
          )}
          {actionMessage && (
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              {actionMessage}
            </div>
          )}
        </div>

        {/* Element Nodes Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-4xl w-full py-4">
          {elements.map((el) => {
            const parent = parents[el];
            const root = rootMap[el] || el;
            const isRoot = parent === el;
            const isActive = activeElements.includes(el);
            const compColor = rootColors[root] || '#64748b';

            return (
              <div
                key={el}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 shadow-xl ${
                  isActive
                    ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400/50 scale-105'
                    : isRoot
                    ? 'border-emerald-500/70 bg-slate-900/90'
                    : 'border-slate-800 bg-slate-950/80'
                }`}
              >
                {/* Node ID Badge */}
                <div
                  style={{ borderColor: compColor }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg text-white border-2 shadow-md bg-slate-900"
                >
                  {el}
                </div>

                {/* Parent & Rank Details */}
                <div className="mt-2.5 flex flex-col items-center gap-0.5 text-[10px] font-mono">
                  <div className="flex items-center gap-1 text-slate-400">
                    <span>parent:</span>
                    <span
                      style={{ color: compColor }}
                      className="font-bold underline"
                    >
                      {parent} {isRoot ? '(ROOT)' : ''}
                    </span>
                  </div>
                  <div className="text-slate-500">rank: {ranks[el]}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Root Node (parent[x] == x)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Active Step Element</span>
          </div>
        </div>
      </div>
    );
  },
};
