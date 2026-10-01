import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TreeDPNode {
  id: number;
  height: number;
  maxThrough: number;
}

export interface TreeDiameterState {
  nodes: TreeDPNode[];
  edges: { u: number; v: number }[];
  activeNode: number | null;
  diameter: number;
  diameterPath: number[];
  postOrderStack: number[];
  message: string;
}

export const treeDiameterDPModule: AlgorithmModule<
  { edges: { u: number; v: number }[]; root?: number },
  TreeDiameterState
> = {
  id: 'tree-diameter-dp',
  title: 'Tree DP (Tree Diameter & Subtree Post-Order Decomposition O(N))',
  category: 'dynamic-programming',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) post-order call stack and height memoization',
    worstCaseCondition: 'Strictly linear across all arbitrary unweighted tree topologies',
  },
  theory: {
    overview:
      'The diameter of a tree is the length of the longest simple path between any pair of vertices. Tree Dynamic Programming solves this in optimal linear O(N) time by decomposing the tree in bottom-up post-order.',
    whyItWorks:
      'For every vertex u, we maintain height[u], the maximum distance from u down to any leaf in its subtree. The longest path having u as its highest common ancestor is formed by combining the two largest child heights: height[child_1] + height[child_2] + 2. The global diameter is the maximum across all vertices.',
    invariant:
      'Subtree Optimal Substructure: height[u] = 1 + max_{v in children(u)} (height[v]). Diameter = max_{u} (top1_height[u] + top2_height[u] + 2).',
    pitfalls: [
      'Assuming the diameter must pass through the arbitrary tree root (it may lie entirely inside a deep subtree).',
      'Forgetting that leaves with no children have height = 0.',
    ],
  },
  presets: [
    {
      id: 'diameter-star-branches',
      label: '7-Node Tree with Long Outer Path',
      description: 'Diameter path passes through node 1 connecting leaves 4 and 7',
      data: {
        edges: [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 4 },
          { u: 1, v: 5 },
          { u: 5, v: 6 },
          { u: 6, v: 7 },
        ],
        root: 1,
      },
    },
    {
      id: 'diameter-subtree-dominant',
      label: 'Subtree Dominant Diameter',
      description: 'Longest path resides entirely within child branch 2 without reaching root 1',
      data: {
        edges: [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 4 },
          { u: 2, v: 5 },
          { u: 5, v: 6 },
          { u: 1, v: 7 },
        ],
        root: 1,
      },
    },
  ],
  defaultInput: {
    edges: [
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 4 },
      { u: 1, v: 5 },
      { u: 5, v: 6 },
      { u: 6, v: 7 },
    ],
    root: 1,
  },
  codeSnippets: {
    cpp: `int maxDiameter = 0;
int dfs(int u, int p) {
    int max1 = 0, max2 = 0;
    for (int v : adj[u]) {
        if (v == p) continue;
        int h = 1 + dfs(v, u);
        if (h > max1) { max2 = max1; max1 = h; }
        else if (h > max2) { max2 = h; }
    }
    maxDiameter = max(maxDiameter, max1 + max2);
    return max1;
}`,
    python: `def tree_diameter(root):
    max_diameter = 0
    def dfs(u, p):
        nonlocal max_diameter
        max1, max2 = 0, 0
        for v in adj[u]:
            if v != p:
                h = 1 + dfs(v, u)
                if h > max1: max1, max2 = h, max1
                elif h > max2: max2 = h
        max_diameter = max(max_diameter, max1 + max2)
        return max1
    dfs(root, -1)
    return max_diameter`,
    typescript: `function treeDiameter(root: number, adj: number[][]): number {
  let diameter = 0;
  function dfs(u: number, parent: number): number {
    let top1 = 0, top2 = 0;
    for (const v of adj[u]) {
      if (v !== parent) {
        const h = 1 + dfs(v, u);
        if (h > top1) { top2 = top1; top1 = h; }
        else if (h > top2) { top2 = h; }
      }
    }
    diameter = Math.max(diameter, top1 + top2);
    return top1;
  }
  dfs(root, -1);
  return diameter;
}`,
    java: `int dfs(int u, int p) {
    int top1 = 0, top2 = 0;
    for (int v : adj.get(u)) {
        if (v != p) {
            int h = 1 + dfs(v, u);
            if (h > top1) { top2 = top1; top1 = h; }
            else if (h > top2) top2 = h;
        }
    }
    diameter = Math.max(diameter, top1 + top2);
    return top1;
}`,
    pseudocode: `function dfs(u, parent):
    top1 = 0, top2 = 0
    for each child v in adj[u]:
        h = 1 + dfs(v, u)
        update top1 and top2
    diameter = max(diameter, top1 + top2)
    return top1`,
  },
  generateTimeline: (input: {
    edges: { u: number; v: number }[];
    root?: number;
  }): ExecutionFrame<TreeDiameterState>[] => {
    const edges = input?.edges?.length
      ? input.edges
      : [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 4 },
          { u: 1, v: 5 },
          { u: 5, v: 6 },
          { u: 6, v: 7 },
        ];
    const rootId = input?.root ?? 1;

    // Collect all unique vertex IDs
    const vertices = [...new Set(edges.flatMap((e) => [e.u, e.v]))];
    const adj: Record<number, number[]> = {};
    for (const v of vertices) adj[v] = [];
    for (const e of edges) {
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    }

    const heightMap: Record<number, number> = {};
    const maxThroughMap: Record<number, number> = {};
    for (const v of vertices) {
      heightMap[v] = 0;
      maxThroughMap[v] = 0;
    }

    const frames: ExecutionFrame<TreeDiameterState>[] = [];
    let globalDiameter = 0;
    const postStack: number[] = [];

    function makeNodes(): TreeDPNode[] {
      return vertices.map((v) => ({
        id: v,
        height: heightMap[v],
        maxThrough: maxThroughMap[v],
      }));
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      isMilestone: true,
      milestoneTitle: 'Tree DP Initialized',
      soundCue: { type: 'start' },
      state: {
        nodes: makeNodes(),
        edges,
        activeNode: null,
        diameter: 0,
        diameterPath: [],
        postOrderStack: [],
        message: `Tree DP initialized with Root=${rootId}, ${vertices.length} vertices, and ${edges.length} edges.`,
      },
      callStack: [{ name: 'initTreeDP', params: { root: rootId, vertices: vertices.length } }],
      variables: { root: rootId, totalVertices: vertices.length, diameter: 0 },
      conditionEval: { expr: `vertices.length > 0`, result: true },
      explanation: `Initialized Tree DP on root ${rootId}. Post-order DFS traversal will compute subtree heights and diameter.`,
    });

    function dfs(u: number, parent: number): number {
      postStack.push(u);
      let top1 = 0;
      let top2 = 0;

      for (const v of adj[u]) {
        if (v === parent) continue;

        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 5,
          action: 'DFS_DESCENT',
          soundCue: { type: 'step' },
          state: {
            nodes: makeNodes(),
            edges,
            activeNode: u,
            diameter: globalDiameter,
            diameterPath: [],
            postOrderStack: [...postStack],
            message: `Descent: traversing from node ${u} down to child ${v}`,
          },
          callStack: [
            { name: `dfs(child=${v}, parent=${u})`, params: { u: v, parent: u }, line: 5, isCurrent: true },
            { name: `dfs(node=${u})`, params: { u }, line: 4 },
          ],
          variables: { currentNode: u, childNode: v, parentNode: parent },
          conditionEval: { expr: `v !== parent (${v} !== ${parent})`, result: true },
          explanation: `Recursive descent: visit child node ${v} from parent ${u} to compute subtree height.`,
        });

        const h = 1 + dfs(v, u);
        if (h > top1) {
          top2 = top1;
          top1 = h;
        } else if (h > top2) {
          top2 = h;
        }
      }

      heightMap[u] = top1;
      maxThroughMap[u] = top1 + top2;
      const prevDiameter = globalDiameter;
      const newDiameterFound = top1 + top2 > globalDiameter;
      globalDiameter = Math.max(globalDiameter, top1 + top2);

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 12,
        action: 'POST_ORDER_EVAL',
        isMilestone: newDiameterFound,
        milestoneTitle: newDiameterFound ? `New Diameter Record: ${globalDiameter}` : undefined,
        soundCue: { type: newDiameterFound ? 'swap' : 'compare' },
        state: {
          nodes: makeNodes(),
          edges,
          activeNode: u,
          diameter: globalDiameter,
          diameterPath: [],
          postOrderStack: [...postStack],
          message: `Node ${u} (post-order): height=${top1}, path_through=${top1 + top2}, max_diameter=${globalDiameter}`,
        },
        callStack: [{ name: 'evalSubtree', params: { node: u, height: top1, diameter: globalDiameter } }],
        variables: {
          node: u,
          subtreeHeight: top1,
          longestPathThroughNode: top1 + top2,
          diameterUpdated: newDiameterFound,
        },
        conditionEval: { expr: `pathThrough (${top1 + top2}) > prevDiameter (${prevDiameter})`, result: newDiameterFound },
        explanation: `Post-order evaluation at Node ${u}: top1 child height=${top1}, top2 child height=${top2}. Longest path through ${u} = ${
          top1 + top2
        }. Global tree diameter = ${globalDiameter}.`,
      });

      postStack.pop();
      return top1;
    }

    dfs(rootId, -1);

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 20,
      action: 'COMPLETE',
      isMilestone: true,
      milestoneTitle: `Tree Diameter: ${globalDiameter} Edges`,
      soundCue: { type: 'complete' },
      state: {
        nodes: makeNodes(),
        edges,
        activeNode: null,
        diameter: globalDiameter,
        diameterPath: [],
        postOrderStack: [],
        message: `Tree DP complete: Maximum Tree Diameter = ${globalDiameter} edges`,
      },
      callStack: [{ name: 'complete', params: { diameter: globalDiameter } }],
      variables: { completed: true, treeDiameter: globalDiameter },
      conditionEval: { expr: `dfsFinished === true`, result: true },
      explanation: `Tree Dynamic Programming complete. Evaluated all ${vertices.length} vertices. Maximum diameter = ${globalDiameter} edges.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<TreeDiameterState>) => {
    const { nodes, edges, activeNode, diameter, message } = frame.state;

    // Layout tree with simple DFS positioning
    const adj: Record<number, number[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    }

    const coords: Record<number, { x: number; y: number }> = {};
    const visited = new Set<number>();

    function layoutTree(u: number, x: number, y: number, dx: number) {
      visited.add(u);
      coords[u] = { x, y };
      const children = adj[u].filter((v) => !visited.has(v));
      const slice = children.length > 0 ? (dx * 2) / children.length : 0;
      children.forEach((c, idx) => {
        layoutTree(c, x - dx + (idx + 0.5) * slice, y + 65, Math.max(45, dx * 0.45));
      });
    }

    if (nodes.length > 0) {
      layoutTree(nodes[0].id, 360, 45, 170);
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Tree Diameter:</span>
            <span className="font-mono text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-0.5 rounded">
              {diameter} edges
            </span>
          </div>
        </div>

        {/* Tree Stage */}
        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[320px] flex items-center justify-center">
          <svg className="w-[720px] h-[300px]" viewBox="0 0 720 300">
            {edges.map((e, idx) => {
              const uCoord = coords[e.u];
              const vCoord = coords[e.v];
              if (!uCoord || !vCoord) return null;

              return (
                <line
                  key={`edge-${idx}`}
                  x1={uCoord.x}
                  y1={uCoord.y}
                  x2={vCoord.x}
                  y2={vCoord.y}
                  stroke="#475569"
                  strokeWidth="2"
                />
              );
            })}

            {nodes.map((n) => {
              const coord = coords[n.id];
              if (!coord) return null;
              const isActive = n.id === activeNode;

              return (
                <g key={`node-${n.id}`} className="transition-all duration-300">
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="18"
                    fill={isActive ? '#78350f' : '#0f172a'}
                    stroke={isActive ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={isActive ? '3' : '1.5'}
                  />
                  <text
                    x={coord.x}
                    y={coord.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {n.id}
                  </text>
                  <text
                    x={coord.x}
                    y={coord.y + 28}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    h:{n.height}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
