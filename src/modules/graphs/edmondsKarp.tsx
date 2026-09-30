import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface FlowEdge {
  from: string;
  to: string;
  capacity: number;
  flow: number;
}

export interface EdmondsKarpState {
  nodes: string[];
  edges: FlowEdge[];
  source: string;
  sink: string;
  augmentingPath: string[] | null;
  bottleneck: number;
  totalFlow: number;
}

export const edmondsKarpModule: AlgorithmModule<
  { nodes: string[]; edges: { from: string; to: string; capacity: number }[]; source: string; sink: string },
  EdmondsKarpState
> = {
  id: 'edmonds-karp',
  title: "Ford-Fulkerson & Edmonds-Karp (BFS Augmenting Paths Max Flow O(V E^2))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(E)',
    timeAverage: 'O(V E^2)',
    timeWorst: 'O(V E^2)',
    spaceAuxiliary: 'O(V + E) for residual capacity graph and parent pointers',
    worstCaseCondition: 'Graphs requiring V * E / 2 augmentation iterations of length up to V',
  },
  theory: {
    overview:
      "The Edmonds-Karp algorithm computes the Maximum Flow in a flow network from source s to sink t. It specializes the Ford-Fulkerson method by choosing the shortest augmenting path (fewest edges) via Breadth-First Search (BFS), bounding execution to O(V E^2).",
    whyItWorks:
      'By using BFS to find augmenting paths in the residual graph, the shortest distance from s to any vertex in the residual graph monotonically increases throughout execution. Each edge can become critical at most V / 2 times.',
    invariant:
      'Flow Conservation & Capacity Constraints: For every node v != s, t: sum(inflow) == sum(outflow). For every edge: 0 <= flow <= capacity.',
    pitfalls: [
      'Using DFS instead of BFS (can lead to O(E * max_flow) worst-case time or infinite loops with irrational capacities).',
      'Forgetting to maintain backward residual edges with capacity equal to current forward flow.',
    ],
  },
  presets: [
    {
      id: 'classic-network',
      label: 'Diamond Network (4 Nodes: S -> A, B -> T)',
      description: 'Classic diamond flow network with bottleneck capacity 7',
      data: {
        nodes: ['S', 'A', 'B', 'T'],
        edges: [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'B', capacity: 2 },
          { from: 'A', to: 'T', capacity: 4 },
          { from: 'B', to: 'T', capacity: 8 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
    {
      id: 'bridge-network',
      label: 'Bottleneck Bridge (S -> A, B -> C, D -> T)',
      description: 'Single critical bridge edge between two clusters',
      data: {
        nodes: ['S', 'A', 'B', 'C', 'T'],
        edges: [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 5 },
          { from: 'A', to: 'C', capacity: 8 },
          { from: 'B', to: 'C', capacity: 4 },
          { from: 'C', to: 'T', capacity: 9 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
  ],
  defaultInput: {
    nodes: ['S', 'A', 'B', 'T'],
    edges: [
      { from: 'S', to: 'A', capacity: 10 },
      { from: 'S', to: 'B', capacity: 10 },
      { from: 'A', to: 'B', capacity: 2 },
      { from: 'A', to: 'T', capacity: 4 },
      { from: 'B', to: 'T', capacity: 8 },
    ],
    source: 'S',
    sink: 'T',
  },
  codeSnippets: {
    cpp: `int edmondsKarp(int s, int t, int n, vector<vector<int>>& cap) {
    int maxFlow = 0;
    vector<int> parent(n);
    auto bfs = [&]() -> int {
        fill(parent.begin(), parent.end(), -1);
        parent[s] = -2;
        queue<pair<int, int>> q;
        q.push({s, 1e9});
        while (!q.empty()) {
            auto [u, flow] = q.front(); q.pop();
            for (int v = 0; v < n; ++v) {
                if (parent[v] == -1 && cap[u][v] > 0) {
                    parent[v] = u;
                    int newFlow = min(flow, cap[u][v]);
                    if (v == t) return newFlow;
                    q.push({v, newFlow});
                }
            }
        }
        return 0;
    };
    int push = 0;
    while ((push = bfs()) > 0) {
        maxFlow += push;
        for (int v = t; v != s; v = parent[v]) {
            int u = parent[v];
            cap[u][v] -= push;
            cap[v][u] += push;
        }
    }
    return maxFlow;
}`,
    python: `def edmonds_karp(capacity: list[list[int]], s: int, t: int) -> int:
    n = len(capacity)
    flow = [[0] * n for _ in range(n)]
    max_flow = 0
    while True:
        parent = [-1] * n
        parent[s] = s
        q = deque([s])
        while q and parent[t] == -1:
            u = q.popleft()
            for v in range(n):
                if parent[v] == -1 and capacity[u][v] - flow[u][v] > 0:
                    parent[v] = u
                    q.append(v)
        if parent[t] == -1: break
        path_flow = min(capacity[parent[v]][v] - flow[parent[v]][v] for v in range(t, s, parent[v]))
        v = t
        while v != s:
            u = parent[v]
            flow[u][v] += path_flow
            flow[v][u] -= path_flow
            v = u
        max_flow += path_flow
    return max_flow`,
    typescript: `function edmondsKarp(n: number, s: number, t: number, cap: number[][]): number {
  let maxFlow = 0;
  while (true) {
    const parent = new Array(n).fill(-1);
    parent[s] = s;
    const queue = [s];
    while (queue.length > 0 && parent[t] === -1) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && cap[u][v] > 0) {
          parent[v] = u;
          queue.push(v);
        }
      }
    }
    if (parent[t] === -1) break;
    let push = Infinity;
    for (let v = t; v !== s; v = parent[v]) push = Math.min(push, cap[parent[v]][v]);
    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      cap[u][v] -= push;
      cap[v][u] += push;
    }
    maxFlow += push;
  }
  return maxFlow;
}`,
    java: `public int edmondsKarp(int s, int t, int n, int[][] cap) {
    int maxFlow = 0;
    while (true) {
        int[] parent = new int[n];
        Arrays.fill(parent, -1);
        parent[s] = s;
        Queue<Integer> q = new LinkedList<>();
        q.add(s);
        while (!q.isEmpty() && parent[t] == -1) {
            int u = q.poll();
            for (int v = 0; v < n; v++) {
                if (parent[v] == -1 && cap[u][v] > 0) {
                    parent[v] = u; q.add(v);
                }
            }
        }
        if (parent[t] == -1) break;
        int push = Integer.MAX_VALUE;
        for (int v = t; v != s; v = parent[v]) push = Math.min(push, cap[parent[v]][v]);
        for (int v = t; v != s; v = parent[v]) {
            int u = parent[v];
            cap[u][v] -= push; cap[v][u] += push;
        }
        maxFlow += push;
    }
    return maxFlow;
}`,
    pseudocode: `function edmondsKarp(s, t):
    maxFlow = 0
    while true:
        path, bottleneck = bfsShortestAugmentingPath(s, t)
        if no path: break
        for each edge (u, v) in path:
            residualCap(u, v) -= bottleneck
            residualCap(v, u) += bottleneck
            flow(u, v) += bottleneck
        maxFlow += bottleneck
    return maxFlow`,
  },
  generateTimeline: (input: {
    nodes: string[];
    edges: { from: string; to: string; capacity: number }[];
    source: string;
    sink: string;
  }): ExecutionFrame<EdmondsKarpState>[] => {
    const rawNodes = input?.nodes?.length ? input.nodes : ['S', 'A', 'B', 'T'];
    const rawEdges = input?.edges?.length
      ? input.edges
      : [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'B', capacity: 2 },
          { from: 'A', to: 'T', capacity: 4 },
          { from: 'B', to: 'T', capacity: 8 },
        ];
    const source = input?.source || rawNodes[0];
    const sink = input?.sink || rawNodes[rawNodes.length - 1];

    const frames: ExecutionFrame<EdmondsKarpState>[] = [];
    const flowEdges: FlowEdge[] = rawEdges.map((e) => ({ ...e, flow: 0 }));
    let totalFlow = 0;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        nodes: rawNodes,
        edges: flowEdges.map((e) => ({ ...e })),
        source,
        sink,
        augmentingPath: null,
        bottleneck: 0,
        totalFlow: 0,
      },
      callStack: [{ name: 'edmondsKarp', params: { source, sink, edgeCount: rawEdges.length } }],
      variables: { source, sink, totalFlow: 0, status: 'Ready for BFS' },
      explanation: `Initialized Edmonds-Karp with source "${source}" and sink "${sink}". Zero initial flow.`,
    });

    while (true) {
      // Run BFS in residual graph
      const parent = new Map<string, string>();
      const parentEdgeIndex = new Map<string, number>();
      const isReverse = new Map<string, boolean>();
      const queue: string[] = [source];
      parent.set(source, source);

      while (queue.length > 0 && !parent.has(sink)) {
        const u = queue.shift()!;
        for (let i = 0; i < flowEdges.length; i++) {
          const e = flowEdges[i];
          // Forward residual edge
          if (e.from === u && !parent.has(e.to) && e.capacity - e.flow > 0) {
            parent.set(e.to, u);
            parentEdgeIndex.set(e.to, i);
            isReverse.set(e.to, false);
            queue.push(e.to);
          }
          // Backward residual edge
          else if (e.to === u && !parent.has(e.from) && e.flow > 0) {
            parent.set(e.from, u);
            parentEdgeIndex.set(e.from, i);
            isReverse.set(e.from, true);
            queue.push(e.from);
          }
        }
      }

      if (!parent.has(sink)) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          action: 'NO_MORE_PATHS',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            source,
            sink,
            augmentingPath: null,
            bottleneck: 0,
            totalFlow,
          },
          callStack: [{ name: 'edmondsKarp', params: { maxFlow: totalFlow, status: 'OPTIMAL' } }],
          variables: { totalFlow, status: 'Max-Flow Min-Cut Achieved' },
          explanation: `No augmenting paths remain from "${source}" to "${sink}". Max flow = ${totalFlow}.`,
        });
        break;
      }

      // Reconstruct path
      const path: string[] = [];
      let curr = sink;
      let bottleneck = Infinity;
      while (curr !== source) {
        path.unshift(curr);
        const p = parent.get(curr)!;
        const eIdx = parentEdgeIndex.get(curr)!;
        const rev = isReverse.get(curr)!;
        const e = flowEdges[eIdx];
        const resCap = rev ? e.flow : e.capacity - e.flow;
        bottleneck = Math.min(bottleneck, resCap);
        curr = p;
      }
      path.unshift(source);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        action: 'PATH_FOUND',
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          source,
          sink,
          augmentingPath: [...path],
          bottleneck,
          totalFlow,
        },
        callStack: [{ name: 'bfsAugment', params: { path: path.join('->'), bottleneck } }],
        variables: {
          augmentingPath: path.join(' -> '),
          bottleneckCapacity: bottleneck,
          currentTotalFlow: totalFlow,
        },
        explanation: `BFS found shortest augmenting path: ${path.join(' -> ')} with bottleneck capacity ${bottleneck}.`,
      });

      // Apply augmentation
      curr = sink;
      while (curr !== source) {
        const p = parent.get(curr)!;
        const eIdx = parentEdgeIndex.get(curr)!;
        const rev = isReverse.get(curr)!;
        if (rev) {
          flowEdges[eIdx].flow -= bottleneck;
        } else {
          flowEdges[eIdx].flow += bottleneck;
        }
        curr = p;
      }
      totalFlow += bottleneck;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        action: 'AUGMENT_FLOW',
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          source,
          sink,
          augmentingPath: [...path],
          bottleneck,
          totalFlow,
        },
        callStack: [{ name: 'edmondsKarp', params: { addedFlow: bottleneck, totalFlow } }],
        variables: { pushedFlow: bottleneck, newTotalFlow: totalFlow },
        explanation: `Pushed ${bottleneck} units along ${path.join(' -> ')}. Cumulative flow is now ${totalFlow}.`,
      });
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<EdmondsKarpState>) => {
    const { nodes, edges, source, sink, augmentingPath, bottleneck, totalFlow } = frame.state;
    const n = nodes.length;
    const width = 500;
    const height = 280;

    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((u, i) => {
      if (u === source) {
        positions[u] = { x: 50, y: height / 2 };
      } else if (u === sink) {
        positions[u] = { x: width - 50, y: height / 2 };
      } else {
        const col = 120 + ((width - 240) * (i - 1)) / Math.max(1, n - 2);
        const yOffset = i % 2 === 1 ? 70 : 210;
        positions[u] = { x: col, y: yOffset };
      }
    });

    const pathEdges = new Set<string>();
    if (augmentingPath) {
      for (let i = 0; i < augmentingPath.length - 1; i++) {
        pathEdges.add(`${augmentingPath[i]}->${augmentingPath[i + 1]}`);
        pathEdges.add(`${augmentingPath[i + 1]}->${augmentingPath[i]}`);
      }
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Total Max Flow:</span>
            <span className="text-xl font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded">
              {totalFlow}
            </span>
          </div>
          {augmentingPath && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded animate-pulse">
                + Path: {augmentingPath.join('→')} (Capacity {bottleneck})
              </span>
            </div>
          )}
        </div>

        {/* Network Stage SVG */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <marker
                id="arrow-cyan"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
              </marker>
              <marker
                id="arrow-amber"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((e, idx) => {
              const p1 = positions[e.from];
              const p2 = positions[e.to];
              if (!p1 || !p2) return null;
              const isAugPath = pathEdges.has(`${e.from}->${e.to}`);
              const isSaturated = e.flow === e.capacity && e.capacity > 0;
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isAugPath ? '#f59e0b' : isSaturated ? '#ef4444' : '#334155'}
                    strokeWidth={isAugPath ? '4' : '2'}
                    strokeDasharray={isSaturated ? '4 3' : undefined}
                    markerEnd={isAugPath ? 'url(#arrow-amber)' : 'url(#arrow-cyan)'}
                    className="transition-colors duration-200"
                  />
                  <rect
                    x={midX - 18}
                    y={midY - 10}
                    width="36"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={isAugPath ? '#f59e0b' : '#334155'}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={isAugPath ? '#fef08a' : isSaturated ? '#f87171' : '#94a3b8'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {e.flow}/{e.capacity}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((u) => {
              const p = positions[u];
              const isSource = u === source;
              const isSink = u === sink;
              const inPath = augmentingPath && augmentingPath.includes(u);

              return (
                <g key={u}>
                  {inPath && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="26"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="18"
                    fill={isSource ? '#065f46' : isSink ? '#7f1d1d' : '#1e293b'}
                    stroke={isSource ? '#10b981' : isSink ? '#ef4444' : '#64748b'}
                    strokeWidth="3"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {u}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-700 border border-emerald-500 inline-block" />
            <span>Source (S)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-700 border border-rose-500 inline-block" />
            <span>Sink (T)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400 inline-block" />
            <span>Augmenting Path</span>
          </div>
        </div>
      </div>
    );
  },
};
