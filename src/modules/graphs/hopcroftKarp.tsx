import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BipartiteEdge {
  u: number;
  v: number;
}

export interface HopcroftKarpState {
  uCount: number;
  vCount: number;
  edges: BipartiteEdge[];
  pairU: Record<number, number>; // u -> matched v (-1 if unmatched)
  pairV: Record<number, number>; // v -> matched u (-1 if unmatched)
  dist: Record<number, number>;
  activePath: { u: number; v: number }[];
  phase: 'BFS' | 'DFS' | 'COMPLETE';
  matchingSize: number;
}

export const hopcroftKarpModule: AlgorithmModule<
  { uCount: number; vCount: number; edges: BipartiteEdge[] },
  HopcroftKarpState
> = {
  id: 'hopcroft-karp',
  title: 'Hopcroft-Karp Algorithm (Maximum Bipartite Matching O(E sqrt(V)))',
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(E)',
    timeAverage: 'O(E sqrt(V))',
    timeWorst: 'O(E sqrt(V))',
    spaceAuxiliary: 'O(V) queue & distance arrays',
    worstCaseCondition: 'Dense graphs requiring O(sqrt(V)) full phases of BFS and DFS traversals',
  },
  theory: {
    overview:
      'The Hopcroft-Karp algorithm finds the maximum cardinality matching in a bipartite graph G = (U, V, E). By augmenting along multiple shortest vertex-disjoint augmenting paths simultaneously, it achieves an optimal O(E sqrt(V)) runtime, outperforming Edmonds-Karp and Ford-Fulkerson.',
    whyItWorks:
      'Each iteration runs a BFS to discover the length of the shortest augmenting paths and create a level graph, followed immediately by a maximal DFS that augments along disjoint paths without interference. The shortest path length increases strictly each phase, bounding iterations by 2 * sqrt(V).',
    invariant:
      'Alternating Path Invariant: Every augmenting path alternates between unmatched and matched edges, starting and ending at free (unmatched) vertices in U and V. Augmentation inverts edge membership, increasing total matching size by 1 per path.',
    pitfalls: [
      'Failing to reset visited markers between DFS searches within the same phase, leading to overlapping non-disjoint path augmentations.',
      'Allowing BFS to proceed past the minimum distance layer where a free vertex was already found.',
    ],
  },
  presets: [
    {
      id: 'bipartite-4x4-standard',
      label: '4x4 Bipartite Job Assignment',
      description: '4 workers and 4 tasks with overlapping qualifications',
      data: {
        uCount: 4,
        vCount: 4,
        edges: [
          { u: 1, v: 1 },
          { u: 1, v: 2 },
          { u: 2, v: 1 },
          { u: 2, v: 3 },
          { u: 3, v: 2 },
          { u: 3, v: 4 },
          { u: 4, v: 3 },
        ],
      },
    },
    {
      id: 'bipartite-chain',
      label: 'Alternating Path Chain',
      description: 'Requires multi-hop alternating path discovery across sets',
      data: {
        uCount: 4,
        vCount: 4,
        edges: [
          { u: 1, v: 1 },
          { u: 2, v: 1 },
          { u: 2, v: 2 },
          { u: 3, v: 2 },
          { u: 3, v: 3 },
          { u: 4, v: 3 },
          { u: 4, v: 4 },
        ],
      },
    },
  ],
  defaultInput: {
    uCount: 4,
    vCount: 4,
    edges: [
      { u: 1, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 1 },
      { u: 2, v: 3 },
      { u: 3, v: 2 },
      { u: 3, v: 4 },
      { u: 4, v: 3 },
    ],
  },
  codeSnippets: {
    cpp: `bool bfs() {
    queue<int> Q;
    for (int u = 1; u <= uCount; u++) {
        if (pairU[u] == 0) { dist[u] = 0; Q.push(u); }
        else dist[u] = INF;
    }
    dist[0] = INF;
    while (!Q.empty()) {
        int u = Q.front(); Q.pop();
        if (dist[u] < dist[0]) {
            for (int v : adj[u]) {
                if (dist[pairV[v]] == INF) {
                    dist[pairV[v]] = dist[u] + 1;
                    Q.push(pairV[v]);
                }
            }
        }
    }
    return dist[0] != INF;
}

bool dfs(int u) {
    if (u != 0) {
        for (int v : adj[u]) {
            if (dist[pairV[v]] == dist[u] + 1 && dfs(pairV[v])) {
                pairV[v] = u; pairU[u] = v;
                return true;
            }
        }
        dist[u] = INF;
        return false;
    }
    return true;
}`,
    python: `def hopcroft_karp(u_count, v_count, adj):
    pair_u = {u: None for u in range(1, u_count + 1)}
    pair_v = {v: None for v in range(1, v_count + 1)}
    dist = {}

    def bfs():
        queue = collections.deque()
        for u in range(1, u_count + 1):
            if pair_u[u] is None:
                dist[u] = 0
                queue.append(u)
            else:
                dist[u] = float('inf')
        dist[None] = float('inf')
        while queue:
            u = queue.popleft()
            if dist[u] < dist[None]:
                for v in adj[u]:
                    nxt = pair_v[v]
                    if dist[nxt] == float('inf'):
                        dist[nxt] = dist[u] + 1
                        queue.append(nxt)
        return dist[None] != float('inf')

    matching = 0
    while bfs():
        for u in range(1, u_count + 1):
            if pair_u[u] is None and dfs(u):
                matching += 1
    return matching`,
    typescript: `function hopcroftKarp(uCount: number, vCount: number, adj: number[][]): number {
  const pairU: number[] = new Array(uCount + 1).fill(0);
  const pairV: number[] = new Array(vCount + 1).fill(0);
  const dist: number[] = new Array(uCount + 1).fill(0);
  let matching = 0;

  while (bfs(uCount, pairU, pairV, dist, adj)) {
    for (let u = 1; u <= uCount; u++) {
      if (pairU[u] === 0 && dfs(u, pairU, pairV, dist, adj)) {
        matching++;
      }
    }
  }
  return matching;
}`,
    java: `public int hopcroftKarp() {
    matching = 0;
    while (bfs()) {
        for (int u = 1; u <= uCount; u++) {
            if (pairU[u] == 0 && dfs(u)) matching++;
        }
    }
    return matching;
}`,
    pseudocode: `function hopcroftKarp(G):
    matching = 0
    while bfs() finds shortest augmenting paths:
        for each free vertex u in U:
            if dfs(u) successfully augments:
                matching += 1
    return matching`,
  },
  generateTimeline: (input: {
    uCount: number;
    vCount: number;
    edges: BipartiteEdge[];
  }): ExecutionFrame<HopcroftKarpState>[] => {
    const uCount = input?.uCount ?? 4;
    const vCount = input?.vCount ?? 4;
    const edges = input?.edges ?? [
      { u: 1, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 1 },
      { u: 2, v: 3 },
      { u: 3, v: 2 },
      { u: 3, v: 4 },
      { u: 4, v: 3 },
    ];

    const adj: Record<number, number[]> = {};
    for (let u = 1; u <= uCount; u++) adj[u] = [];
    for (const e of edges) {
      if (!adj[e.u]) adj[e.u] = [];
      adj[e.u].push(e.v);
    }

    const pairU: Record<number, number> = {};
    for (let u = 1; u <= uCount; u++) pairU[u] = 0;
    const pairV: Record<number, number> = {};
    for (let v = 1; v <= vCount; v++) pairV[v] = 0;
    const dist: Record<number, number> = {};

    const frames: ExecutionFrame<HopcroftKarpState>[] = [];
    let matchingSize = 0;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      isMilestone: true,
      milestoneTitle: `Init Hopcroft-Karp (|U|=${uCount}, |V|=${vCount})`,
      action: 'INIT',
      state: {
        uCount,
        vCount,
        edges,
        pairU: { ...pairU },
        pairV: { ...pairV },
        dist: {},
        activePath: [],
        phase: 'BFS',
        matchingSize: 0,
      },
      callStack: [{ name: 'hopcroftKarp', params: { uCount, vCount, edgeCount: edges.length }, line: 1, isCurrent: true }],
      variables: { uCount, vCount, matchingSize: 0, phase: 'Initialization' },
      conditionEval: { expr: 'uCount > 0 && vCount > 0', result: true },
      soundCue: { type: 'step' },
      explanation: `Initialized bipartite graph with |U|=${uCount}, |V|=${vCount}, and ${edges.length} candidate edges. Matching size: 0.`,
    });

    const INF = 999999;

    function bfs(): boolean {
      const queue: number[] = [];
      for (let u = 1; u <= uCount; u++) {
        if (pairU[u] === 0) {
          dist[u] = 0;
          queue.push(u);
        } else {
          dist[u] = INF;
        }
      }
      dist[0] = INF;

      while (queue.length > 0) {
        const u = queue.shift()!;
        if (dist[u] < dist[0]) {
          for (const v of adj[u] || []) {
            const nextU = pairV[v];
            if (dist[nextU] === INF) {
              dist[nextU] = dist[u] + 1;
              queue.push(nextU);
            }
          }
        }
      }
      return dist[0] !== INF;
    }

    function dfs(u: number, currentPath: { u: number; v: number }[]): boolean {
      if (u !== 0) {
        for (const v of adj[u] || []) {
          const nextU = pairV[v];
          if (dist[nextU] === dist[u] + 1) {
            currentPath.push({ u, v });
            if (dfs(nextU, currentPath)) {
              pairV[v] = u;
              pairU[u] = v;
              return true;
            }
            currentPath.pop();
          }
        }
        dist[u] = INF;
        return false;
      }
      return true;
    }

    let iteration = 0;
    while (bfs()) {
      iteration++;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 15,
        isMilestone: true,
        milestoneTitle: `BFS Phase ${iteration} Level Graph`,
        action: 'BFS_LAYER_BUILT',
        state: {
          uCount,
          vCount,
          edges,
          pairU: { ...pairU },
          pairV: { ...pairV },
          dist: { ...dist },
          activePath: [],
          phase: 'BFS',
          matchingSize,
        },
        callStack: [{ name: 'bfsPhase', params: { iteration }, line: 15, isCurrent: true }],
        variables: { iteration, shortestAugPathLength: dist[0], currentMatching: matchingSize },
        conditionEval: { expr: `dist[0] !== INF`, result: true },
        soundCue: { type: 'step' },
        explanation: `BFS Phase ${iteration}: Level graph constructed. Shortest augmenting path layer distance = ${dist[0]}. DFS will now extract maximal vertex-disjoint paths.`,
      });

      for (let u = 1; u <= uCount; u++) {
        if (pairU[u] === 0) {
          const path: { u: number; v: number }[] = [];

          // Frame: DFS search attempt from free vertex
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 22,
            action: 'DFS_SEARCH',
            state: {
              uCount,
              vCount,
              edges,
              pairU: { ...pairU },
              pairV: { ...pairV },
              dist: { ...dist },
              activePath: [],
              phase: 'DFS',
              matchingSize,
            },
            callStack: [{ name: 'dfs', params: { u }, line: 22, isCurrent: true }],
            variables: { startFreeU: u, matchingSize },
            conditionEval: { expr: `pairU[${u}] === 0`, result: true },
            soundCue: { type: 'compare' },
            explanation: `DFS initiated from unmatched vertex U${u} exploring admissible alternating edges where dist[nextU] == dist[u] + 1.`,
          });

          if (dfs(u, path)) {
            matchingSize++;
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 28,
              isMilestone: true,
              milestoneTitle: `Augmented: +1 Match (${matchingSize})`,
              action: 'AUGMENT_PATH',
              state: {
                uCount,
                vCount,
                edges,
                pairU: { ...pairU },
                pairV: { ...pairV },
                dist: { ...dist },
                activePath: [...path],
                phase: 'DFS',
                matchingSize,
              },
              callStack: [{ name: 'dfsAugment', params: { startU: u, pathLength: path.length }, line: 28, isCurrent: true }],
              variables: {
                augmentedStartU: u,
                newMatchingSize: matchingSize,
                pathSummary: path.map((e) => `U${e.u}-V${e.v}`).join(' -> '),
              },
              conditionEval: { expr: 'augmentingPathFound', result: true },
              soundCue: { type: 'insert' },
              explanation: `Augmented matching along path [${path.map((e) => `U${e.u}-V${e.v}`).join(' -> ')}]. Inverted edge matches, expanding matching cardinality to ${matchingSize}.`,
            });
          }
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 35,
      isMilestone: true,
      milestoneTitle: `Max Matching: ${matchingSize} Pairs`,
      action: 'COMPLETE',
      state: {
        uCount,
        vCount,
        edges,
        pairU: { ...pairU },
        pairV: { ...pairV },
        dist: {},
        activePath: [],
        phase: 'COMPLETE',
        matchingSize,
      },
      callStack: [{ name: 'complete', params: { maxMatching: matchingSize }, line: 35, isCurrent: true }],
      variables: { completed: true, maxMatching: matchingSize, matchedPairs: Object.entries(pairU).filter(([, v]) => v > 0).map(([u, v]) => `U${u}=V${v}`).join(', ') },
      conditionEval: { expr: 'bfsNoMoreAugmentingPaths', result: true },
      soundCue: { type: 'complete' },
      explanation: `Hopcroft-Karp algorithm terminated. No augmenting paths remain. Maximum Bipartite Matching cardinality = ${matchingSize}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<HopcroftKarpState>) => {
    const { uCount, vCount, edges, pairU, activePath, phase, matchingSize } = frame.state;

    const leftX = 140;
    const rightX = 460;
    const spacing = 65;
    const startY = 60;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Phase:</span>
            <span
              className={`font-mono text-xs font-bold px-3 py-1 rounded border ${
                phase === 'COMPLETE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : phase === 'DFS'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {phase}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Cardinality: <strong className="text-emerald-400 text-sm">{matchingSize}</strong>
            </span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[360px] flex items-center justify-center">
          <svg className="w-[600px] h-[340px]" viewBox="0 0 600 340">
            {/* Draw Edges */}
            {edges.map((e, idx) => {
              const uy = startY + (e.u - 1) * spacing;
              const vy = startY + (e.v - 1) * spacing;
              const isMatched = pairU[e.u] === e.v;
              const isPath = activePath.some((p) => p.u === e.u && p.v === e.v);

              let stroke = '#334155';
              let width = '1.5';
              let dash = '4 4';

              if (isPath) {
                stroke = '#f59e0b';
                width = '3.5';
                dash = undefined as any;
              } else if (isMatched) {
                stroke = '#10b981';
                width = '3';
                dash = undefined as any;
              }

              return (
                <line
                  key={`edge-${idx}`}
                  x1={leftX}
                  y1={uy}
                  x2={rightX}
                  y2={vy}
                  stroke={stroke}
                  strokeWidth={width}
                  strokeDasharray={dash}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Left Column U Vertices */}
            {Array.from({ length: uCount }).map((_, i) => {
              const u = i + 1;
              const y = startY + i * spacing;
              const isMatched = pairU[u] > 0;

              return (
                <g key={`u-${u}`}>
                  <circle
                    cx={leftX}
                    cy={y}
                    r="20"
                    fill={isMatched ? '#064e3b' : '#1e293b'}
                    stroke={isMatched ? '#34d399' : '#64748b'}
                    strokeWidth="2"
                  />
                  <text
                    x={leftX}
                    y={y + 5}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    U{u}
                  </text>
                  <text
                    x={leftX - 35}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {isMatched ? `-> V${pairU[u]}` : 'free'}
                  </text>
                </g>
              );
            })}

            {/* Right Column V Vertices */}
            {Array.from({ length: vCount }).map((_, i) => {
              const v = i + 1;
              const y = startY + i * spacing;
              const matchedU = Object.entries(pairU).find(([_, mv]) => mv === v)?.[0];
              const isMatched = !!matchedU;

              return (
                <g key={`v-${v}`}>
                  <circle
                    cx={rightX}
                    cy={y}
                    r="20"
                    fill={isMatched ? '#064e3b' : '#1e293b'}
                    stroke={isMatched ? '#34d399' : '#64748b'}
                    strokeWidth="2"
                  />
                  <text
                    x={rightX}
                    y={y + 5}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    V{v}
                  </text>
                  <text
                    x={rightX + 35}
                    y={y + 4}
                    textAnchor="start"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {isMatched ? `<- U${matchedU}` : 'free'}
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
