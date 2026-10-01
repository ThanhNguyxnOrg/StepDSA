import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BFNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface BFEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface BellmanFordInput {
  nodes: BFNode[];
  edges: BFEdge[];
  startNode: string;
}

export interface BellmanFordState {
  nodes: BFNode[];
  edges: BFEdge[];
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  activeEdgeId?: string;
  currentPass: number;
  hasNegativeCycle: boolean;
  relaxedInPass: boolean;
}

const defaultBFGraph: BellmanFordInput = {
  startNode: 'S',
  nodes: [
    { id: 'S', label: 'S', x: 80, y: 180 },
    { id: 'A', label: 'A', x: 230, y: 90 },
    { id: 'B', label: 'B', x: 230, y: 270 },
    { id: 'C', label: 'C', x: 400, y: 90 },
    { id: 'D', label: 'D', x: 400, y: 270 },
  ],
  edges: [
    { id: 'e-SA', from: 'S', to: 'A', weight: 4 },
    { id: 'e-SB', from: 'S', to: 'B', weight: 5 },
    { id: 'e-AB', from: 'A', to: 'B', weight: -2 },
    { id: 'e-AC', from: 'A', to: 'C', weight: 3 },
    { id: 'e-BD', from: 'B', to: 'D', weight: 6 },
    { id: 'e-CD', from: 'C', to: 'D', weight: 2 },
    { id: 'e-DA', from: 'D', to: 'A', weight: 1 },
  ],
};

const INF = 9999;

export const bellmanFordModule: AlgorithmModule<BellmanFordInput, BellmanFordState> = {
  id: 'bellman-ford',
  title: 'Bellman-Ford (Negative Weights & Cycles)',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(E) with early termination',
    timeAverage: 'O(V * E)',
    timeWorst: 'O(V * E)',
    spaceAuxiliary: 'O(V) for distance table',
    worstCaseCondition: 'Chain topology requiring full V - 1 relaxation iterations across all E edges',
  },
  theory: {
    overview:
      'The Bellman-Ford algorithm computes single-source shortest paths on weighted directed graphs, supporting negative edge weights. By relaxing all E edges V - 1 times, it guarantees optimal distances. A subsequent V-th pass tests whether any edge can still relax, which definitively detects negative-weight cycles.',
    whyItWorks:
      'Any simple shortest path in a graph of V vertices contains at most V - 1 edges. Therefore, after k global passes over all edges, every shortest path of up to k edges has been discovered.',
    invariant:
      'After pass k, dist[v] is less than or equal to the length of the shortest path from start to v consisting of at most k edges.',
    pitfalls: [
      'Dijkstra’s greedy approach fails on negative edges; Bellman-Ford is mandatory when weights can be negative.',
      'Negative cycles allow infinite loops reducing path weight to -∞; shortest path is undefined.',
    ],
  },
  presets: [
    {
      id: 'default',
      label: 'Negative Weights (No Cycle)',
      description: '5 vertices with edge weight -2',
      data: defaultBFGraph,
    },
    {
      id: 'negative-cycle',
      label: 'Negative Cycle Detection',
      description: 'Contains a cycle A -> B -> D -> A summing to -1',
      data: {
        startNode: 'S',
        nodes: [
          { id: 'S', label: 'S', x: 90, y: 180 },
          { id: 'A', label: 'A', x: 240, y: 100 },
          { id: 'B', label: 'B', x: 390, y: 180 },
          { id: 'C', label: 'C', x: 240, y: 260 },
        ],
        edges: [
          { id: 'e1', from: 'S', to: 'A', weight: 3 },
          { id: 'e2', from: 'A', to: 'B', weight: 1 },
          { id: 'e3', from: 'B', to: 'C', weight: -3 },
          { id: 'e4', from: 'C', to: 'A', weight: 1 }, // Cycle: A -> B -> C -> A (1 - 3 + 1 = -1)
        ],
      },
    },
  ],
  defaultInput: defaultBFGraph,
  codeSnippets: {
    python: `def bellman_ford(vertices, edges, start):
    dist = {v: float('inf') for v in vertices}
    dist[start] = 0

    # Relax edges V - 1 times
    for _ in range(len(vertices) - 1):
        relaxed = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                relaxed = True
        if not relaxed:
            break

    # Check for negative-weight cycles
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None # Negative cycle detected
    return dist`,
    typescript: `function bellmanFord(nodes: string[], edges: Edge[], start: string) {
  const dist: Record<string, number> = {};
  nodes.forEach(n => dist[n] = Infinity);
  dist[start] = 0;

  for (let i = 1; i <= nodes.length - 1; i++) {
    let relaxed = false;
    for (const { from, to, weight } of edges) {
      if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {
        dist[to] = dist[from] + weight;
        relaxed = true;
      }
    }
    if (!relaxed) break;
  }

  for (const { from, to, weight } of edges) {
    if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {
      throw new Error("Negative-weight cycle detected");
    }
  }
  return dist;
}`,
    cpp: `bool bellmanFord(int n, vector<Edge>& edges, int start, vector<int>& dist) {
    dist.assign(n, 1e9);
    dist[start] = 0;
    for (int i = 0; i < n - 1; i++) {
        bool any = false;
        for (auto& e : edges) {
            if (dist[e.u] < 1e9 && dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
                any = true;
            }
        }
        if (!any) break;
    }
    for (auto& e : edges) {
        if (dist[e.u] < 1e9 && dist[e.u] + e.w < dist[e.v]) return false; // Cycle
    }
    return true;
}`,
    java: `public boolean bellmanFord(int n, List<Edge> edges, int start, int[] dist) {
    Arrays.fill(dist, Integer.MAX_VALUE / 2);
    dist[start] = 0;
    for (int i = 1; i < n; i++) {
        boolean changed = false;
        for (Edge e : edges) {
            if (dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
                changed = true;
            }
        }
        if (!changed) break;
    }
    for (Edge e : edges) {
        if (dist[e.u] + e.w < dist[e.v]) return false; // Negative cycle
    }
    return true;
}`,
    pseudocode: `function BellmanFord(G, s):
    for each v in G.V: dist[v] = INF
    dist[s] = 0
    repeat |G.V| - 1 times:
        for each (u, v, w) in G.E:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for each (u, v, w) in G.E:
        if dist[u] + w < dist[v]: return NEGATIVE_CYCLE
    return dist`,
  },

  generateTimeline: (input: BellmanFordInput): ExecutionFrame<BellmanFordState>[] => {
    const frames: ExecutionFrame<BellmanFordState>[] = [];
    const { nodes, edges, startNode } = input;
    const V = nodes.length;

    const dist: Record<string, number> = {};
    const pred: Record<string, string | null> = {};
    nodes.forEach((n) => {
      dist[n.id] = INF;
      pred[n.id] = null;
    });
    dist[startNode] = 0;

    const makeState = (
      pass: number,
      activeEdge?: string,
      hasCycle = false,
      relaxed = false
    ): BellmanFordState => ({
      nodes,
      edges,
      distances: { ...dist },
      predecessors: { ...pred },
      activeEdgeId: activeEdge,
      currentPass: pass,
      hasNegativeCycle: hasCycle,
      relaxedInPass: relaxed,
    });

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Bellman-Ford from source '${startNode}'. dist[${startNode}] = 0, all other vertices dist = ∞. Will perform up to ${V - 1} relaxation passes.`,
      isMilestone: true,
      milestoneTitle: `Init dist[${startNode}]=0`,
      soundCue: { type: 'start' },
      variables: { source: startNode, numVertices: V, numEdges: edges.length, pass: 0 },
      callStack: [{ name: 'bellmanFord', params: { source: startNode, V }, line: 1, isCurrent: true }],
      conditionEval: { expr: `V > 1`, result: V > 1 },
      scopeVariables: { source: startNode, numVertices: V, numEdges: edges.length },
      state: makeState(0),
    });

    // Passes 1 to V - 1
    for (let pass = 1; pass <= V - 1; pass++) {
      let passRelaxed = false;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Beginning Pass #${pass} of ${V - 1}. Scanning all ${edges.length} edges for relaxation opportunities.`,
        isMilestone: true,
        milestoneTitle: `Pass #${pass} Start`,
        soundCue: { type: 'step' },
        variables: { pass, totalPasses: V - 1, edgesToScan: edges.length },
        callStack: [{ name: 'bellmanFord.pass', params: { pass, maxPasses: V - 1 }, line: 5, isCurrent: true }],
        conditionEval: { expr: `pass <= V - 1 (${pass} <= ${V - 1})`, result: true },
        scopeVariables: { pass, totalPasses: V - 1 },
        state: makeState(pass),
      });

      for (const edge of edges) {
        const u = edge.from;
        const v = edge.to;
        const w = edge.weight;

        const uDist = dist[u];
        const vDist = dist[v];
        const canRelax = uDist !== INF && uDist + w < vDist;

        if (canRelax) {
          const oldDist = vDist;
          dist[v] = uDist + w;
          pred[v] = u;
          passRelaxed = true;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            explanation: `✨ Relaxed edge (${u} → ${v}, weight ${w}): dist[${v}] updated from ${oldDist === INF ? '∞' : oldDist} down to ${dist[v]} (via ${u}).`,
            isMilestone: true,
            milestoneTitle: `Relax (${u}→${v})`,
            soundCue: { type: 'swap' },
            variables: { edge: `${u}→${v}`, u, v, weight: w, newDist: dist[v], oldDist: oldDist === INF ? '∞' : oldDist },
            callStack: [{ name: 'relaxEdge', params: { from: u, to: v, weight: w }, line: 8, isCurrent: true }],
            conditionEval: { expr: `dist[${u}] + ${w} < dist[${v}] (${uDist + w} < ${vDist === INF ? '∞' : vDist})`, result: true },
            scopeVariables: { edge: `${u}→${v}`, weight: w, newDist: dist[v], oldDist: oldDist === INF ? '∞' : oldDist },
            state: makeState(pass, edge.id, false, true),
          });
        }
      }

      if (!passRelaxed) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Pass #${pass} completed with 0 relaxations. Shortest paths have converged early!`,
          isMilestone: true,
          milestoneTitle: 'Early Convergence',
          soundCue: { type: 'step' },
          variables: { pass, convergedEarly: true, totalRelaxations: 0 },
          callStack: [{ name: 'bellmanFord.earlyExit', params: { pass }, line: 11, isCurrent: true }],
          conditionEval: { expr: `!passRelaxed`, result: true },
          scopeVariables: { pass, converged: true },
          state: makeState(pass, undefined, false, false),
        });
        break;
      }
    }

    // Negative cycle detection pass
    let negativeCycleDetected = false;
    for (const edge of edges) {
      const u = edge.from;
      const v = edge.to;
      const w = edge.weight;
      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        negativeCycleDetected = true;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          explanation: `🚨 NEGATIVE-WEIGHT CYCLE DETECTED! Edge (${u} → ${v}, weight ${w}) can still be relaxed: dist[${u}] (${dist[u]}) + ${w} < dist[${v}] (${dist[v]}). Shortest paths are undefined!`,
          isMilestone: true,
          milestoneTitle: 'Negative Cycle!',
          soundCue: { type: 'compare' },
          variables: { cycleEdge: `${u}→${v}`, weight: w, negativeCycle: true },
          callStack: [{ name: 'detectNegativeCycle', params: { from: u, to: v }, line: 15, isCurrent: true }],
          conditionEval: { expr: `dist[${u}] + ${w} < dist[${v}]`, result: true },
          scopeVariables: { cycleEdge: `${u}→${v}`, weight: w, negativeCycle: true },
          state: makeState(V, edge.id, true, true),
        });
        break;
      }
    }

    if (!negativeCycleDetected) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 18,
        explanation: `🎉 Bellman-Ford execution complete! Verified 0 negative-weight cycles. All shortest paths proven optimal.`,
        isMilestone: true,
        milestoneTitle: 'Shortest Paths Confirmed',
        soundCue: { type: 'complete' },
        variables: {
          converged: true,
          negativeCycleDetected: false,
          distances: Object.entries(dist)
            .map(([k, v]) => `${k}:${v === INF ? '∞' : v}`)
            .join(', '),
        },
        callStack: [{ name: 'bellmanFord.complete', params: { optimal: true }, line: 18, isCurrent: true }],
        conditionEval: { expr: `!negativeCycleDetected`, result: true },
        scopeVariables: {
          distances: Object.entries(dist)
            .map(([k, v]) => `${k}:${v === INF ? '∞' : v}`)
            .join(', '),
        },
        state: makeState(V, undefined, false, false),
      });
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<BellmanFordState>) => {
    const { nodes, edges, distances, activeEdgeId, currentPass, hasNegativeCycle } =
      frame.state;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Pass: <span className="text-cyan-400 font-bold">{currentPass} / {nodes.length - 1}</span>
          </div>
          {hasNegativeCycle ? (
            <div className="px-3.5 py-1.5 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-300 text-xs font-mono font-bold animate-bounce">
              ⚠️ NEGATIVE CYCLE DETECTED
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              Weights: Supports negative values
            </div>
          )}
        </div>

        {/* SVG Graph Canvas */}
        <div className="relative w-full max-w-2xl h-[340px] bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
          <svg className="w-full h-full" viewBox="0 0 520 340">
            <defs>
              <marker
                id="bf-arrow"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker
                id="bf-arrow-active"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
            </defs>

            {/* Directed Edges */}
            {edges.map((e) => {
              const u = nodeMap.get(e.from);
              const v = nodeMap.get(e.to);
              if (!u || !v) return null;

              const isActive = e.id === activeEdgeId;
              const isNegative = e.weight < 0;

              const strokeColor = isActive
                ? '#38bdf8'
                : isNegative
                ? '#f43f5e'
                : '#475569';

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={e.id}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={strokeColor}
                    strokeWidth={isActive ? 3.5 : 2}
                    markerEnd={isActive ? 'url(#bf-arrow-active)' : 'url(#bf-arrow)'}
                    className="transition-all duration-300"
                  />
                  {/* Weight pill */}
                  <rect
                    x={midX - 14}
                    y={midY - 11}
                    width={28}
                    height={20}
                    rx={6}
                    fill="#0f172a"
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fill={isNegative ? '#fb7185' : '#e2e8f0'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Vertices */}
            {nodes.map((n) => {
              const d = distances[n.id];
              const isReachable = d !== INF;

              return (
                <g key={n.id} className="transition-all duration-300">
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={24}
                    fill={isReachable ? '#0f172a' : '#090d16'}
                    stroke={isReachable ? '#10b981' : '#475569'}
                    strokeWidth={isReachable ? 2.5 : 1.5}
                  />
                  <text
                    x={n.x}
                    y={n.y - 2}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {n.label}
                  </text>
                  {/* Distance badge below vertex */}
                  <text
                    x={n.x}
                    y={n.y + 13}
                    textAnchor="middle"
                    fill={isReachable ? '#34d399' : '#64748b'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {d === INF ? '∞' : d}
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
