import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DinicEdge {
  from: string;
  to: string;
  capacity: number;
  flow: number;
}

export interface DinicState {
  nodes: string[];
  edges: DinicEdge[];
  levels: Record<string, number>;
  source: string;
  sink: string;
  phase: 'BFS_LEVEL_GRAPH' | 'DFS_BLOCKING_FLOW' | 'TERMINATED';
  activeNode: string | null;
  totalFlow: number;
}

export const dinicModule: AlgorithmModule<
  { nodes: string[]; edges: { from: string; to: string; capacity: number }[]; source: string; sink: string },
  DinicState
> = {
  id: 'dinics-algorithm',
  title: "Dinic's Algorithm (Level Graph & Blocking Flow O(V^2 E))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(E sqrt(V)) on unit networks',
    timeAverage: 'O(V^2 E)',
    timeWorst: 'O(V^2 E)',
    spaceAuxiliary: 'O(V + E) for level graph and edge iterators',
    worstCaseCondition: 'At most V phase iterations, each finding a blocking flow in O(VE) time',
  },
  theory: {
    overview:
      "Dinic's algorithm is a strongly polynomial maximum flow algorithm that runs in O(V^2 E) for general networks and O(E sqrt(V)) for unit networks (e.g. bipartite matching). It decomposes flow computation into phases using BFS Level Graphs and DFS Blocking Flows.",
    whyItWorks:
      'In each phase, BFS builds a Level Graph assigning level[v] = shortest distance from s. DFS then pushes blocking flows strictly along admissible edges where level[v] == level[u] + 1. The distance to t strictly increases each phase, guaranteeing termination in at most V - 1 phases.',
    invariant:
      'Monotonically Increasing Sink Distance: In each successive phase, level[t] strictly increases: level_{k+1}[t] > level_k[t].',
    pitfalls: [
      'Forgetting the current edge pointer optimization (ptr array), degrading DFS to O(V^2) per push instead of O(VE) per phase.',
      'Allowing DFS to use edges that do not satisfy level[v] == level[u] + 1.',
    ],
  },
  presets: [
    {
      id: 'layered-network',
      label: 'Layered Network (4 Levels: S -> A, B -> C, D -> T)',
      description: 'Clear level graph structure with multi-path blocking flow',
      data: {
        nodes: ['S', 'A', 'B', 'C', 'T'],
        edges: [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'C', capacity: 4 },
          { from: 'A', to: 'T', capacity: 8 },
          { from: 'B', to: 'C', capacity: 9 },
          { from: 'C', to: 'T', capacity: 10 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
    {
      id: 'bipartite-unit',
      label: 'Bipartite Matching Network',
      description: 'Unit capacity edges demonstrating O(E sqrt(V)) matching speed',
      data: {
        nodes: ['S', 'L1', 'L2', 'R1', 'R2', 'T'],
        edges: [
          { from: 'S', to: 'L1', capacity: 1 },
          { from: 'S', to: 'L2', capacity: 1 },
          { from: 'L1', to: 'R1', capacity: 1 },
          { from: 'L1', to: 'R2', capacity: 1 },
          { from: 'L2', to: 'R2', capacity: 1 },
          { from: 'R1', to: 'T', capacity: 1 },
          { from: 'R2', to: 'T', capacity: 1 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
  ],
  defaultInput: {
    nodes: ['S', 'A', 'B', 'C', 'T'],
    edges: [
      { from: 'S', to: 'A', capacity: 10 },
      { from: 'S', to: 'B', capacity: 10 },
      { from: 'A', to: 'C', capacity: 4 },
      { from: 'A', to: 'T', capacity: 8 },
      { from: 'B', to: 'C', capacity: 9 },
      { from: 'C', to: 'T', capacity: 10 },
    ],
    source: 'S',
    sink: 'T',
  },
  codeSnippets: {
    cpp: `struct Edge { int to, cap, flow, rev; };
vector<vector<Edge>> adj;
vector<int> level, ptr;

bool bfs(int s, int t) {
    fill(level.begin(), level.end(), -1);
    level[s] = 0;
    queue<int> q; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& e : adj[u]) {
            if (e.cap - e.flow > 0 && level[e.to] == -1) {
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
        }
    }
    return level[t] != -1;
}

int dfs(int u, int t, int pushed) {
    if (pushed == 0 || u == t) return pushed;
    for (int& cid = ptr[u]; cid < adj[u].size(); ++cid) {
        auto& e = adj[u][cid];
        int tr = e.to;
        if (level[u] + 1 != level[tr] || e.cap - e.flow == 0) continue;
        int trPushed = dfs(tr, t, min(pushed, e.cap - e.flow));
        if (trPushed == 0) continue;
        e.flow += trPushed;
        adj[tr][e.rev].flow -= trPushed;
        return trPushed;
    }
    return 0;
}

int dinic(int s, int t) {
    int flow = 0;
    while (bfs(s, t)) {
        fill(ptr.begin(), ptr.end(), 0);
        while (int pushed = dfs(s, t, 1e9)) flow += pushed;
    }
    return flow;
}`,
    python: `def dinic(n, edges, s, t):
    # Construct residual graph and level graph
    flow = 0
    while True:
        level = [-1] * n
        level[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v, cap, f, _ in adj[u]:
                if cap - f > 0 and level[v] == -1:
                    level[v] = level[u] + 1
                    q.append(v)
        if level[t] == -1: break
        ptr = [0] * n
        def dfs(u, pushed):
            if u == t or not pushed: return pushed
            for cid in range(ptr[u], len(adj[u])):
                ptr[u] = cid
                v, cap, f, rev = adj[u][cid]
                if level[v] == level[u] + 1 and cap - f > 0:
                    tr = dfs(v, min(pushed, cap - f))
                    if tr > 0:
                        adj[u][cid][2] += tr
                        adj[v][rev][2] -= tr
                        return tr
            return 0
        while (pushed := dfs(s, float('inf'))):
            flow += pushed
    return flow`,
    typescript: `function dinic(n: number, s: number, t: number, cap: number[][]): number {
  let flow = 0;
  // Repeat BFS Level Graph construction + DFS Blocking Flow pushes
  return flow;
}`,
    java: `public int dinic(int s, int t) {
    int flow = 0;
    while (bfs(s, t)) {
        Arrays.fill(ptr, 0);
        int pushed;
        while ((pushed = dfs(s, t, Integer.MAX_VALUE)) > 0) flow += pushed;
    }
    return flow;
}`,
    pseudocode: `function dinic(s, t):
    maxFlow = 0
    while bfsLevelGraph(s, t):
        ptr = all zeros
        while pushed = dfsBlockingFlow(s, t, infinity):
            maxFlow += pushed
    return maxFlow`,
  },
  generateTimeline: (input: {
    nodes: string[];
    edges: { from: string; to: string; capacity: number }[];
    source: string;
    sink: string;
  }): ExecutionFrame<DinicState>[] => {
    const rawNodes = input?.nodes?.length ? input.nodes : ['S', 'A', 'B', 'C', 'T'];
    const rawEdges = input?.edges?.length
      ? input.edges
      : [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'C', capacity: 4 },
          { from: 'A', to: 'T', capacity: 8 },
          { from: 'B', to: 'C', capacity: 9 },
          { from: 'C', to: 'T', capacity: 10 },
        ];
    const source = input?.source || rawNodes[0];
    const sink = input?.sink || rawNodes[rawNodes.length - 1];

    const frames: ExecutionFrame<DinicState>[] = [];
    const flowEdges: DinicEdge[] = rawEdges.map((e) => ({ ...e, flow: 0 }));
    let totalFlow = 0;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        nodes: rawNodes,
        edges: flowEdges.map((e) => ({ ...e })),
        levels: {},
        source,
        sink,
        phase: 'BFS_LEVEL_GRAPH',
        activeNode: null,
        totalFlow: 0,
      },
      callStack: [{ name: 'dinic', params: { source, sink, edgeCount: rawEdges.length } }],
      variables: { source, sink, totalFlow: 0 },
      explanation: `Initialized Dinic's Algorithm. Ready for Phase 1 Level Graph BFS.`,
    });

    let phaseNum = 1;
    while (true) {
      // BFS for Level Graph
      const levels: Record<string, number> = {};
      const queue: string[] = [source];
      levels[source] = 0;

      while (queue.length > 0) {
        const u = queue.shift()!;
        for (const e of flowEdges) {
          if (e.from === u && levels[e.to] === undefined && e.capacity - e.flow > 0) {
            levels[e.to] = levels[u] + 1;
            queue.push(e.to);
          }
          if (e.to === u && levels[e.from] === undefined && e.flow > 0) {
            levels[e.from] = levels[u] + 1;
            queue.push(e.from);
          }
        }
      }

      if (levels[sink] === undefined) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 35,
          action: 'TERMINATED',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            levels,
            source,
            sink,
            phase: 'TERMINATED',
            activeNode: null,
            totalFlow,
          },
          callStack: [{ name: 'dinic', params: { maxFlow: totalFlow, status: 'DONE' } }],
          variables: { totalFlow, status: 'Sink unreachable in residual graph' },
          explanation: `Sink "${sink}" unreachable in Level Graph. Maximum Flow = ${totalFlow}.`,
        });
        break;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        action: 'LEVEL_GRAPH_BUILT',
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          levels: { ...levels },
          source,
          sink,
          phase: 'BFS_LEVEL_GRAPH',
          activeNode: null,
          totalFlow,
        },
        callStack: [{ name: 'bfsLevelGraph', params: { phase: phaseNum, sinkLevel: levels[sink] } }],
        variables: { phase: phaseNum, sinkLevel: levels[sink] },
        explanation: `Phase ${phaseNum} Level Graph built. Distance to sink = ${levels[sink]}. Admissible edges must step from level L to L+1.`,
      });

      // DFS to find blocking flows
      let phasePushed = 0;
      while (true) {
        // Find single augmenting path using DFS strictly on admissible edges
        const path: string[] = [];
        const edgeIdxPath: number[] = [];
        const isRevPath: boolean[] = [];

        function dfs(curr: string): number {
          if (curr === sink) return Infinity;
          for (let i = 0; i < flowEdges.length; i++) {
            const e = flowEdges[i];
            if (e.from === curr && levels[e.to] === levels[curr] + 1 && e.capacity - e.flow > 0) {
              path.push(e.to);
              edgeIdxPath.push(i);
              isRevPath.push(false);
              const push = Math.min(e.capacity - e.flow, dfs(e.to));
              if (push > 0) return push;
              path.pop();
              edgeIdxPath.pop();
              isRevPath.pop();
            }
          }
          return 0;
        }

        path.push(source);
        const pushed = dfs(source);

        if (pushed === 0 || pushed === Infinity) break;

        for (let k = 0; k < edgeIdxPath.length; k++) {
          const idx = edgeIdxPath[k];
          if (isRevPath[k]) flowEdges[idx].flow -= pushed;
          else flowEdges[idx].flow += pushed;
        }

        totalFlow += pushed;
        phasePushed += pushed;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 25,
          action: 'BLOCKING_FLOW_PUSH',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            levels: { ...levels },
            source,
            sink,
            phase: 'DFS_BLOCKING_FLOW',
            activeNode: path[path.length - 1],
            totalFlow,
          },
          callStack: [{ name: 'dfsBlocking', params: { path: path.join('->'), pushed } }],
          variables: { pushed, currentFlow: totalFlow, path: path.join(' -> ') },
          explanation: `Pushed ${pushed} units along admissible path ${path.join(' -> ')}. Cumulative flow: ${totalFlow}.`,
        });
      }

      phaseNum++;
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<DinicState>) => {
    const { nodes, edges, levels, source, sink, phase, totalFlow } = frame.state;

    // Group nodes by level
    const maxLevel = Math.max(...Object.values(levels).filter((l) => l !== undefined), 1);
    const width = 500;
    const height = 280;

    const positions: Record<string, { x: number; y: number }> = {};
    const levelBuckets: Record<number, string[]> = {};

    nodes.forEach((u) => {
      const lvl = levels[u] ?? 0;
      if (!levelBuckets[lvl]) levelBuckets[lvl] = [];
      levelBuckets[lvl].push(u);
    });

    Object.entries(levelBuckets).forEach(([lvlStr, bucket]) => {
      const lvl = Number(lvlStr);
      const x = 50 + (lvl * (width - 100)) / Math.max(1, maxLevel);
      bucket.forEach((u, idx) => {
        const y = 60 + ((height - 120) * (idx + 1)) / (bucket.length + 1);
        positions[u] = { x, y };
      });
    });

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
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Phase:</span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                phase === 'TERMINATED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}
            >
              {phase}
            </span>
          </div>
        </div>

        {/* SVG Level Graph */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <svg width={width} height={height} className="overflow-visible">
            {edges.map((e, idx) => {
              const p1 = positions[e.from];
              const p2 = positions[e.to];
              if (!p1 || !p2) return null;
              const isAdmissible = levels[e.to] === (levels[e.from] ?? 0) + 1;
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isAdmissible ? '#a855f7' : '#334155'}
                    strokeWidth={isAdmissible ? '3' : '1.5'}
                    strokeDasharray={!isAdmissible ? '3 3' : undefined}
                  />
                  <rect
                    x={midX - 16}
                    y={midY - 9}
                    width="32"
                    height="18"
                    rx="3"
                    fill="#0f172a"
                    stroke="#334155"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {e.flow}/{e.capacity}
                  </text>
                </g>
              );
            })}

            {nodes.map((u) => {
              const p = positions[u] || { x: 50, y: 140 };
              const isSource = u === source;
              const isSink = u === sink;
              const lvl = levels[u];

              return (
                <g key={u}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="19"
                    fill={isSource ? '#065f46' : isSink ? '#7f1d1d' : '#1e293b'}
                    stroke={isSource ? '#10b981' : isSink ? '#ef4444' : '#64748b'}
                    strokeWidth="3"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {u}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 25}
                    textAnchor="middle"
                    fill="#a78bfa"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    L:{lvl !== undefined ? lvl : '?'}
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
