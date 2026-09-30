import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DirectedEdge {
  from: string;
  to: string;
}

export interface TopoSortDFSState {
  nodes: string[];
  edges: DirectedEdge[];
  nodeColors: Record<string, 'WHITE' | 'GRAY' | 'BLACK'>;
  activeNode: string | null;
  topoOrder: string[];
  hasCycle: boolean;
}

export const topologicalSortDFSModule: AlgorithmModule<
  { nodes: string[]; edges: DirectedEdge[] },
  TopoSortDFSState
> = {
  id: 'topological-sort-dfs',
  title: 'Topological Sort (DFS Post-Order Finish Times O(V + E))',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V) call stack and color arrays',
    worstCaseCondition: 'Traverses each vertex and directed edge once in DAG',
  },
  theory: {
    overview:
      'Topological sort of a Directed Acyclic Graph (DAG) is a linear ordering of vertices such that for every directed edge u -> v, u comes before v. The DFS approach orders vertices by reverse post-order (decreasing finish times).',
    whyItWorks:
      'In a DAG, when DFS on a vertex u finishes exploring all descendants, all reachable vertices have already been finalized. Thus, prepending u to the result list guarantees that u appears before all its downstream neighbors.',
    invariant:
      'Three-Color Cycle Invariant: WHITE = unvisited, GRAY = currently in recursion stack (visiting), BLACK = fully explored (finished). A back-edge to a GRAY node proves a cycle exists.',
    pitfalls: [
      'Topological ordering is only possible for DAGs; graphs with cycles have no topological sort.',
    ],
  },
  presets: [
    {
      id: 'course-schedule',
      label: 'Course Prerequisites: 5 Tasks (A -> B, A -> C, B -> D, C -> D, D -> E)',
      description: 'Classic diamond DAG dependency structure',
      data: {
        nodes: ['A', 'B', 'C', 'D', 'E'],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'A', to: 'C' },
          { from: 'B', to: 'D' },
          { from: 'C', to: 'D' },
          { from: 'D', to: 'E' },
        ],
      },
    },
    {
      id: 'simple-dag',
      label: 'Simple Chain: 4 Tasks (0 -> 1 -> 2 -> 3)',
      description: 'Linear dependency chain',
      data: {
        nodes: ['0', '1', '2', '3'],
        edges: [
          { from: '0', to: '1' },
          { from: '1', to: '2' },
          { from: '2', to: '3' },
        ],
      },
    },
  ],
  defaultInput: {
    nodes: ['A', 'B', 'C', 'D', 'E'],
    edges: [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'C', to: 'D' },
      { from: 'D', to: 'E' },
    ],
  },
  codeSnippets: {
    cpp: `bool dfs(int u, const vector<vector<int>>& adj, vector<int>& color, vector<int>& topo) {
    color[u] = 1; // GRAY (visiting)
    for (int v : adj[u]) {
        if (color[v] == 1) return false; // Cycle detected
        if (color[v] == 0 && !dfs(v, adj, color, topo)) return false;
    }
    color[u] = 2; // BLACK (finished)
    topo.push_back(u);
    return true;
}`,
    python: `def topo_sort_dfs(graph):
    color = {u: 'WHITE' for u in graph}
    order = []
    def dfs(u):
        color[u] = 'GRAY'
        for v in graph.get(u, []):
            if color[v] == 'GRAY': return False
            if color[v] == 'WHITE' and not dfs(v): return False
        color[u] = 'BLACK'
        order.append(u)
        return True
    for u in graph:
        if color[u] == 'WHITE':
            if not dfs(u): return None
    return order[::-1]`,
    typescript: `function topologicalSortDFS(nodes: string[], edges: DirectedEdge[]): string[] | null {
    const adj: Record<string, string[]> = {};
    for (const n of nodes) adj[n] = [];
    for (const e of edges) adj[e.from].push(e.to);
    const color: Record<string, 'WHITE' | 'GRAY' | 'BLACK'> = {};
    for (const n of nodes) color[n] = 'WHITE';
    const order: string[] = [];

    function dfs(u: string): boolean {
        color[u] = 'GRAY';
        for (const v of adj[u]) {
            if (color[v] === 'GRAY') return false; // Cycle
            if (color[v] === 'WHITE' && !dfs(v)) return false;
        }
        color[u] = 'BLACK';
        order.unshift(u);
        return true;
    }
    for (const n of nodes) {
        if (color[n] === 'WHITE' && !dfs(n)) return null;
    }
    return order;
}`,
    java: `boolean dfs(int u, List<List<Integer>> adj, int[] color, List<Integer> order) {
    color[u] = 1; // GRAY
    for (int v : adj.get(u)) {
        if (color[v] == 1) return false;
        if (color[v] == 0 && !dfs(v, adj, color, order)) return false;
    }
    color[u] = 2; // BLACK
    order.add(0, u);
    return true;
}`,
    pseudocode: `function topologicalSort(DAG):
    color = all WHITE, order = []
    function dfs(u):
        color[u] = GRAY
        for each v in adj[u]:
            if color[v] == GRAY: report cycle
            if color[v] == WHITE: dfs(v)
        color[u] = BLACK
        prepend u to order
    for each u in DAG: if color[u] == WHITE: dfs(u)
    return order`,
  },

  generateTimeline: (input: {
    nodes: string[];
    edges: DirectedEdge[];
  }): ExecutionFrame<TopoSortDFSState>[] => {
    const nodes = input?.nodes?.length ? input.nodes : ['A', 'B', 'C', 'D', 'E'];
    const edges = input?.edges?.length
      ? input.edges
      : [
          { from: 'A', to: 'B' },
          { from: 'A', to: 'C' },
          { from: 'B', to: 'D' },
          { from: 'C', to: 'D' },
          { from: 'D', to: 'E' },
        ];

    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      adj[n] = [];
    });
    edges.forEach((e) => {
      if (!adj[e.from]) adj[e.from] = [];
      adj[e.from].push(e.to);
    });

    const nodeColors: Record<string, 'WHITE' | 'GRAY' | 'BLACK'> = {};
    nodes.forEach((n) => {
      nodeColors[n] = 'WHITE';
    });

    const topoOrder: string[] = [];
    let hasCycle = false;

    const frames: ExecutionFrame<TopoSortDFSState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize DFS Topological Sort for ${nodes.length} vertices and ${edges.length} directed edges. All nodes initialized to WHITE (unvisited).`,
      variables: { totalNodes: nodes.length, totalEdges: edges.length },
      callStack: [{ name: 'topologicalSortDFS()', params: { vertices: nodes.length }, line: 2, isCurrent: true }],
      state: {
        nodes,
        edges,
        nodeColors: { ...nodeColors },
        activeNode: null,
        topoOrder: [],
        hasCycle: false,
      },
    });

    function dfs(u: string): boolean {
      nodeColors[u] = 'GRAY';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Visit node "${u}". Marked GRAY (active on recursion call stack). Exploring outgoing edges.`,
        variables: { visiting: u, color: 'GRAY' },
        callStack: [{ name: `dfs(u="${u}")`, params: { u }, line: 4, isCurrent: true }],
        state: {
          nodes,
          edges,
          nodeColors: { ...nodeColors },
          activeNode: u,
          topoOrder: [...topoOrder],
          hasCycle: false,
        },
      });

      for (const v of adj[u] || []) {
        if (nodeColors[v] === 'GRAY') {
          hasCycle = true;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            explanation: `Back-edge detected: ${u} -> ${v} points to active ancestor in call stack (GRAY)! Cycle detected -> No valid topological order.`,
            variables: { cycleEdge: `${u} -> ${v}` },
            callStack: [{ name: `cycleDetected(${u}, ${v})`, params: { u, v }, line: 6, isCurrent: true }],
            state: {
              nodes,
              edges,
              nodeColors: { ...nodeColors },
              activeNode: u,
              topoOrder: [...topoOrder],
              hasCycle: true,
            },
          });
          return false;
        }

        if (nodeColors[v] === 'WHITE') {
          if (!dfs(v)) return false;
        }
      }

      nodeColors[u] = 'BLACK';
      topoOrder.unshift(u);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Finish node "${u}". All descendants explored! Marked BLACK and prepended to topological order. Current order: [${topoOrder.join(' -> ')}].`,
        variables: { finished: u, color: 'BLACK', currentTopoOrder: topoOrder.join(' -> ') },
        callStack: [{ name: `finishNode(u="${u}")`, params: { u }, line: 9, isCurrent: true }],
        state: {
          nodes,
          edges,
          nodeColors: { ...nodeColors },
          activeNode: u,
          topoOrder: [...topoOrder],
          hasCycle: false,
        },
      });

      return true;
    }

    for (const node of nodes) {
      if (nodeColors[node] === 'WHITE') {
        if (!dfs(node)) break;
      }
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: hasCycle
        ? 'Cycle found in graph! Topological ordering does not exist.'
        : `DFS Topological Sort complete! Valid dependency ordering: ${topoOrder.join(' -> ')}.`,
      variables: { validOrdering: !hasCycle, finalOrder: topoOrder.join(' -> ') },
      callStack: [{ name: 'complete()', params: { count: topoOrder.length }, line: 12, isCurrent: true }],
      state: {
        nodes,
        edges,
        nodeColors: { ...nodeColors },
        activeNode: null,
        topoOrder: [...topoOrder],
        hasCycle,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<TopoSortDFSState>) => {
    const { nodes, edges, nodeColors, activeNode, topoOrder, hasCycle } = frame.state;

    const total = nodes.length;
    const cx = 250;
    const cy = 180;
    const rx = 180;
    const ry = 110;

    const coords: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      coords[n] = {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
      };
    });

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Vertices: <strong className="text-white">{nodes.length}</strong> | Edges:{' '}
              <strong className="text-white">{edges.length}</strong>
            </div>
            {hasCycle && (
              <div className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/50 text-xs font-mono text-red-300 font-bold">
                CYCLE DETECTED
              </div>
            )}
          </div>

          <div className="text-xs font-mono text-slate-300">
            Topological Order:{' '}
            <strong className="text-emerald-400">
              {topoOrder.length > 0 ? topoOrder.join(' -> ') : 'None yet'}
            </strong>
          </div>
        </div>

        {/* Directed Graph SVG */}
        <div className="w-full h-80 relative rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden my-auto flex items-center justify-center">
          <svg viewBox="0 0 500 360" className="w-full h-full">
            <defs>
              <marker
                id="topo-arrow"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
            </defs>

            {/* Directed Edges */}
            {edges.map((e, idx) => {
              const uPos = coords[e.from];
              const vPos = coords[e.to];
              if (!uPos || !vPos) return null;
              return (
                <line
                  key={idx}
                  x1={uPos.x}
                  y1={uPos.y}
                  x2={vPos.x}
                  y2={vPos.y}
                  stroke="#475569"
                  strokeWidth="2"
                  markerEnd="url(#topo-arrow)"
                />
              );
            })}

            {/* Vertices */}
            {nodes.map((n) => {
              const pos = coords[n];
              if (!pos) return null;
              const isCurrent = n === activeNode;
              const color = nodeColors[n] || 'WHITE';
              const strokeColor =
                color === 'BLACK'
                  ? '#10b981'
                  : color === 'GRAY'
                  ? '#06b6d4'
                  : '#475569';
              const fillColor =
                color === 'BLACK'
                  ? '#10b98122'
                  : color === 'GRAY'
                  ? '#06b6d422'
                  : '#0f172a';

              return (
                <g key={n} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r="22"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isCurrent ? 3 : 2}
                  />
                  <text
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono font-bold text-sm fill-white"
                  >
                    {n}
                  </text>
                  <text
                    y="34"
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400"
                  >
                    {color}
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
