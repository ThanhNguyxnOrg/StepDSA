import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ZeroOneEdge {
  u: number;
  v: number;
  weight: 0 | 1;
}

export interface ZeroOneBFSState {
  numNodes: number;
  edges: ZeroOneEdge[];
  source: number;
  currentNode: number | null;
  deque: number[];
  distances: (number | null)[];
  visitedEdges: { u: number; v: number; weight: 0 | 1; active: boolean }[];
  phase: 'exploring' | 'relax' | 'done';
}

export const zeroOneBFSModule: AlgorithmModule<
  { numNodes: number; edges: ZeroOneEdge[]; source: number },
  ZeroOneBFSState
> = {
  id: 'zero-one-bfs',
  title: '0-1 BFS (Double-Ended Queue Shortest Path O(V + E))',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V)',
    worstCaseCondition: 'Graph contains V vertices and E edges with weights in {0, 1}',
  },
  theory: {
    overview:
      '0-1 BFS computes shortest paths in graphs where edge weights are strictly restricted to 0 or 1. Instead of using a standard priority queue (which incurs an O((V + E) log V) factor), it uses a Double-Ended Queue (Deque) to achieve optimal O(V + E) linear runtime.',
    whyItWorks:
      'When relaxing an edge with weight 0, the target vertex has the same distance as the current vertex, so it is pushed to the FRONT of the deque to be processed immediately. When relaxing an edge with weight 1, it is pushed to the BACK. This guarantees that distances in the deque remain monotonically non-decreasing at all times.',
    invariant:
      'Deque Monotonicity Invariant: At any step, the maximum distance difference between any two vertices currently stored in the deque is at most 1: dist(back) - dist(front) <= 1.',
    pitfalls: [
      'Applying 0-1 BFS to graphs with arbitrary non-negative weights (which requires Dijkstra).',
      'Relaxing an edge without checking if the new path distance is strictly smaller than the recorded distance.',
    ],
  },
  presets: [
    {
      id: 'grid-teleport',
      label: 'Teleport Graph: 6 Nodes with 0-weight tunnels',
      description: 'Nodes 0 to 5 with free zero-cost tunnels and cost-1 walkways',
      data: {
        numNodes: 6,
        edges: [
          { u: 0, v: 1, weight: 1 },
          { u: 0, v: 2, weight: 0 },
          { u: 1, v: 3, weight: 1 },
          { u: 2, v: 3, weight: 0 },
          { u: 3, v: 4, weight: 1 },
          { u: 2, v: 5, weight: 1 },
          { u: 5, v: 4, weight: 0 },
        ],
        source: 0,
      },
    },
    {
      id: 'chain-graph',
      label: 'Alternating 0-1 Chain',
      description: '0 -(1)-> 1 -(0)-> 2 -(1)-> 3',
      data: {
        numNodes: 4,
        edges: [
          { u: 0, v: 1, weight: 1 },
          { u: 1, v: 2, weight: 0 },
          { u: 2, v: 3, weight: 1 },
        ],
        source: 0,
      },
    },
  ],
  defaultInput: {
    numNodes: 6,
    edges: [
      { u: 0, v: 1, weight: 1 },
      { u: 0, v: 2, weight: 0 },
      { u: 1, v: 3, weight: 1 },
      { u: 2, v: 3, weight: 0 },
      { u: 3, v: 4, weight: 1 },
      { u: 2, v: 5, weight: 1 },
      { u: 5, v: 4, weight: 0 },
    ],
    source: 0,
  },
  codeSnippets: {
    python: `from collections import deque

def zero_one_bfs(graph, source, n):
    dist = [float('inf')] * n
    dist[source] = 0
    dq = deque([source])

    while dq:
        u = dq.popleft()
        for v, weight in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                if weight == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return dist`,
    typescript: `function zeroOneBFS(n: number, adj: { to: number; weight: 0 | 1 }[][], source: number): number[] {
  const dist: number[] = Array(n).fill(Infinity);
  dist[source] = 0;
  const deque: number[] = [source];

  while (deque.length > 0) {
    const u = deque.shift()!;
    for (const edge of adj[u]) {
      if (dist[u] + edge.weight < dist[edge.to]) {
        dist[edge.to] = dist[u] + edge.weight;
        if (edge.weight === 0) {
          deque.unshift(edge.to);
        } else {
          deque.push(edge.to);
        }
      }
    }
  }
  return dist;
}`,
    cpp: `vector<int> zeroOneBFS(int n, vector<vector<pair<int, int>>>& adj, int src) {
    vector<int> dist(n, 1e9);
    dist[src] = 0;
    deque<int> dq;
    dq.push_back(src);

    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto& edge : adj[u]) {
            int v = edge.first, w = edge.second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);
                else dq.push_back(v);
            }
        }
    }
    return dist;
}`,
    java: `public int[] zeroOneBFS(int n, List<List<int[]>> adj, int src) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    Deque<Integer> dq = new ArrayDeque<>();
    dq.offerLast(src);

    while (!dq.isEmpty()) {
        int u = dq.pollFirst();
        for (int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.offerFirst(v);
                else dq.offerLast(v);
            }
        }
    }
    return dist;
}`,
    pseudocode: `function zeroOneBFS(graph, source, n):
    dist = array of infinity, dist[source] = 0
    deque = [source]
    while deque not empty:
        u = deque.pop_front()
        for each (v, weight) in graph[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                if weight == 0: deque.push_front(v)
                else: deque.push_back(v)
    return dist`,
  },

  generateTimeline: (input: {
    numNodes: number;
    edges: ZeroOneEdge[];
    source: number;
  }): ExecutionFrame<ZeroOneBFSState>[] => {
    const numNodes = input.numNodes || 6;
    const edges = input.edges || [];
    const source = input.source ?? 0;

    // Build adjacency list
    const adj: { to: number; weight: 0 | 1 }[][] = Array.from({ length: numNodes }, () => []);
    edges.forEach((e) => {
      adj[e.u].push({ to: e.v, weight: e.weight });
    });

    const dist: (number | null)[] = Array(numNodes).fill(null);
    dist[source] = 0;
    const deque: number[] = [source];

    const frames: ExecutionFrame<ZeroOneBFSState>[] = [];
    let checkpointAdded = false;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize 0-1 BFS. Source node ${source} set to distance 0. Deque initialized with [${source}]. All other distances initialized to ∞.`,
      variables: { source, dequeSize: 1, totalNodes: numNodes },
      callStack: [
        { name: `zeroOneBFS(src=${source})`, params: { src: source, nodes: numNodes }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      pedagogy: {
        what: `0-1 BFS computes single-source shortest paths when every edge weighs exactly 0 or 1, using a deque instead of a heap.`,
        why: 'A 0-weight edge keeps the same distance, so its target belongs at the front; a 1-weight edge adds one, so its target belongs at the back. The deque therefore stays sorted by distance.',
        whatNext: `Pop the front node (${source}) and relax its outgoing edges.`,
      },
      state: {
        numNodes,
        edges,
        source,
        currentNode: source,
        deque: [...deque],
        distances: [...dist],
        visitedEdges: [],
        phase: 'exploring',
      },
    });

    const visitedEdgesRecord: { u: number; v: number; weight: 0 | 1; active: boolean }[] = [];

    while (deque.length > 0) {
      const u = deque.shift()!;
      const uDist = dist[u]!;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Popped node ${u} from FRONT of deque. Current finalized distance: ${uDist}. Inspecting outgoing {0, 1} edges.`,
        variables: { currentNode: u, finalizedDist: uDist, dequeRemaining: deque.length },
        callStack: [
          { name: `popFront(${u})`, params: { u, dist: uDist }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        invariantStatus: {
          label: `Deque ordered by non-decreasing distance; front #${u} has dist ${uDist}`,
          isValid: true,
        },
        pedagogy: {
          what: `Pop the front node #${u}: its distance ${uDist} is final.`,
          why: 'The deque is kept sorted by distance, so the front is always the closest unsettled node — the same role Dijkstra\'s heap plays, but in O(1).',
          whatNext: `Scan every outgoing edge of #${u}.`,
        },
        state: {
          numNodes,
          edges,
          source,
          currentNode: u,
          deque: [...deque],
          distances: [...dist],
          visitedEdges: visitedEdgesRecord.map((e) => ({ ...e, active: false })),
          phase: 'exploring',
        },
      });

      for (const edge of adj[u]) {
        const v = edge.to;
        const w = edge.weight;
        const newDist = uDist + w;
        const currentVDist = dist[v];
        const canRelax = currentVDist === null || newDist < currentVDist;

        visitedEdgesRecord.push({ u, v, weight: w, active: true });

        if (canRelax) {
          dist[v] = newDist;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            isMilestone: true,
            milestoneTitle: `Relax Edge (${u} → ${v}, w=${w})`,
            explanation: `Relax edge ${u} → ${v} (weight ${w}): dist[${v}] improves from ${currentVDist ?? '∞'} to ${newDist}.`,
            variables: {
              u,
              v,
              weight: w,
              oldDist: currentVDist ?? '∞',
              newDist,
            },
            callStack: [
              { name: `relaxEdge(${u}→${v})`, params: { u, v, weight: w, newDist }, line: 8, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            conditionEval: {
              expr: `dist[${u}] + ${w} (${newDist}) < dist[${v}] (${currentVDist ?? '∞'})`,
              result: true,
            },
            pedagogy: {
              what: `The route ${u} → ${v} costs ${newDist}, strictly less than the previous best ${currentVDist ?? '∞'}, so dist[${v}] is updated.`,
              why: 'Relaxation only fires on strict improvement; equal distances are ignored, which is what keeps each vertex from being enqueued needlessly.',
              whatNext: w === 0
                ? `Weight 0 means the same distance — push #${v} to the FRONT so it is processed next.`
                : `Weight 1 adds one — push #${v} to the BACK to preserve distance order.`,
            },
            checkpoint: !checkpointAdded
              ? {
                  id: 'zero-one-bfs-front-back',
                  question: `The edge ${u} → ${v} has weight ${w}. Why does 0-1 BFS push a 0-weight target to the front but a 1-weight target to the back?`,
                  options: [
                    'A 0-weight edge keeps the same distance (front), a 1-weight edge adds one (back), so the deque stays sorted by distance',
                    'It is an arbitrary convention; both ends give the same result',
                  ],
                  correctIndex: 0,
                  explanation:
                    'Monotone order is the whole trick: the front always holds the minimum distance. Pushing a same-distance node to the back would break that order and require a heap like Dijkstra.',
                }
              : undefined,
            state: {
              numNodes,
              edges,
              source,
              currentNode: u,
              deque: [...deque],
              distances: [...dist],
              visitedEdges: [...visitedEdgesRecord],
              phase: 'relax',
            },
          });
          checkpointAdded = true;

          if (w === 0) {
            deque.unshift(v);
          } else {
            deque.push(v);
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: w === 0 ? 9 : 10,
            explanation: `Push #${v} to the ${w === 0 ? 'FRONT (unshift)' : 'BACK (push)'} of the deque because its edge weight is ${w}. Deque is now [${deque.join(', ')}].`,
            variables: {
              v,
              weight: w,
              dequeAction: w === 0 ? 'push_front' : 'push_back',
              deque: deque.join(', '),
              dequeSize: deque.length,
            },
            callStack: [
              { name: `push${w === 0 ? 'Front' : 'Back'}(${v})`, params: { v, weight: w }, line: w === 0 ? 9 : 10, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            pedagogy: {
              what: `#${v} enters the deque at the ${w === 0 ? 'front' : 'back'}; deque = [${deque.join(', ')}].`,
              why: w === 0
                ? 'Its distance equals the current node\'s distance, so it must be settled before any larger-distance node — the front guarantees that.'
                : 'Its distance is one more than the current node\'s, so it goes behind all equal-or-smaller distances — the back guarantees that.',
              whatNext: 'Pop the next front node and continue.',
            },
            state: {
              numNodes,
              edges,
              source,
              currentNode: u,
              deque: [...deque],
              distances: [...dist],
              visitedEdges: [...visitedEdgesRecord],
              phase: 'relax',
            },
          });
        } else {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: `Edge ${u} → ${v} (weight ${w}) gives ${newDist}, which is not better than dist[${v}] = ${currentVDist ?? '∞'}. No relaxation; deque unchanged.`,
            variables: {
              u,
              v,
              weight: w,
              candidate: newDist,
              currentDist: currentVDist ?? '∞',
              rejected: true,
            },
            callStack: [
              { name: `checkEdge(${u}→${v})`, params: { u, v, candidate: newDist }, line: 7, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            conditionEval: {
              expr: `dist[${u}] + ${w} (${newDist}) < dist[${v}] (${currentVDist ?? '∞'})`,
              result: false,
            },
            pedagogy: {
              what: `The candidate distance ${newDist} does not beat the recorded ${currentVDist ?? '∞'}, so nothing changes.`,
              why: 'Skipping non-improving edges is what prevents infinite enqueueing; only strict improvements may push a vertex.',
              whatNext: `Inspect the next outgoing edge of #${u}.`,
            },
            state: {
              numNodes,
              edges,
              source,
              currentNode: u,
              deque: [...deque],
              distances: [...dist],
              visitedEdges: [...visitedEdgesRecord],
              phase: 'exploring',
            },
          });
        }
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      isMilestone: true,
      milestoneTitle: '0-1 BFS Traversal Complete',
      explanation: `Deque empty. All reachable nodes relaxed with optimal shortest paths in O(V + E) linear time: [${dist
        .map((d, i) => `#${i}: ${d ?? '∞'}`)
        .join(', ')}].`,
      variables: { completedNodes: numNodes, summaryDistances: dist.map((d) => d ?? '∞').join(', ') },
      callStack: [
        { name: 'complete()', params: {}, line: 11, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      pedagogy: {
        what: `Final distances: ${dist.map((d, i) => `#${i}=${d ?? '∞'}`).join(', ')}.`,
        why: 'Each vertex was pushed only when its distance improved; the deque order guaranteed every pop was already minimal, so no vertex needs reprocessing after it settles.',
        whatNext: 'Total cost is O(V + E) — every edge is inspected at most once per relaxation, and each vertex is pushed a bounded number of times.',
      },
      state: {
        numNodes,
        edges,
        source,
        currentNode: null,
        deque: [],
        distances: [...dist],
        visitedEdges: visitedEdgesRecord.map((e) => ({ ...e, active: false })),
        phase: 'done',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ZeroOneBFSState>) => {
    const { numNodes, edges = [], source, currentNode, deque, distances } = frame.state;

    // Circular/hexagonal node layout for 0-1 BFS graph SVG
    const nodePositions = Array.from({ length: numNodes }, (_, i) => {
      if (numNodes === 6) {
        const coords = [
          { x: 70, y: 85 },
          { x: 195, y: 32 },
          { x: 195, y: 138 },
          { x: 335, y: 32 },
          { x: 335, y: 138 },
          { x: 455, y: 85 },
        ];
        return coords[i] || { x: 80 + i * 70, y: 85 };
      }
      const angle = (2 * Math.PI * i) / Math.max(1, numNodes) - Math.PI / 2;
      return {
        x: 260 + 160 * Math.cos(angle),
        y: 85 + 60 * Math.sin(angle),
      };
    });

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-4 sm:p-6 select-none max-w-5xl mx-auto gap-3">
        {/* Metric Badges */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Source: <strong className="text-white">Node #{source}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Deque Size: <strong className="text-white">{deque.length}</strong>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            Current Vertex: <strong className="text-cyan-300">{currentNode !== null ? `#${currentNode}` : 'None'}</strong>
          </div>
        </div>

        {/* 0-1 Weighted Graph Topology SVG + Distance Strip */}
        <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span>0-1 WEIGHTED GRAPH TOPOLOGY & SHORTEST DISTANCES</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-cyan-400 font-bold">── w=0 (Push Front)</span>
              <span className="text-amber-400 font-bold">── w=1 (Push Back)</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-center overflow-x-auto">
            <svg viewBox="0 0 525 170" className="w-full max-w-2xl h-40 overflow-visible">
              {edges.map((e, idx) => {
                const p1 = nodePositions[e.u];
                const p2 = nodePositions[e.v];
                if (!p1 || !p2) return null;
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                const isZero = e.weight === 0;
                const isFromCurrent = e.u === currentNode;

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isZero ? '#06B6D4' : '#F59E0B'}
                      strokeWidth={isFromCurrent ? '3' : '2'}
                      strokeDasharray={isZero ? '5 3' : undefined}
                      opacity={isFromCurrent ? 1 : 0.7}
                    />
                    <rect
                      x={midX - 12}
                      y={midY - 8}
                      width="24"
                      height="16"
                      rx="4"
                      fill="#0B0F19"
                      stroke={isZero ? '#06B6D4' : '#F59E0B'}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 3}
                      textAnchor="middle"
                      fill={isZero ? '#22D3EE' : '#FBBF24'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      w={e.weight}
                    </text>
                  </g>
                );
              })}

              {nodePositions.map((pos, idx) => {
                const d = distances[idx];
                const isCurrent = idx === currentNode;
                const inDeque = deque.includes(idx);

                return (
                  <g key={`node-${idx}`}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill={
                        isCurrent
                          ? '#06B6D4'
                          : inDeque
                          ? '#78350F'
                          : d !== null
                          ? '#064E3B'
                          : '#1E293B'
                      }
                      stroke={
                        isCurrent
                          ? '#A5F3FC'
                          : inDeque
                          ? '#F59E0B'
                          : d !== null
                          ? '#10B981'
                          : '#475569'
                      }
                      strokeWidth="2.5"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 2}
                      textAnchor="middle"
                      fill={isCurrent ? '#0B0F19' : '#FFFFFF'}
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      #{idx}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 10}
                      textAnchor="middle"
                      fill={isCurrent ? '#0F172A' : '#34D399'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      d={d !== null ? d : '∞'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {Array.from({ length: numNodes }, (_, idx) => {
              const d = distances[idx];
              const isCurrent = idx === currentNode;
              const inDeque = deque.includes(idx);

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-md scale-105 font-bold'
                      : inDeque
                      ? 'bg-amber-950/40 border-amber-500/60 text-white'
                      : d !== null
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isCurrent ? 'text-slate-950' : 'text-slate-400'}`}>
                    VERTEX #{idx}
                  </span>
                  <div className={`text-base font-bold font-mono ${isCurrent ? 'text-slate-950' : 'text-white'}`}>
                    {d !== null ? d : '∞'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deque State Visualizer */}
        <div className="w-full flex flex-col p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-xs font-mono font-bold text-amber-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span>DOUBLE-ENDED QUEUE (DEQUE: FRONT → BACK)</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 text-[10px]">
              {deque.length} vertices
            </span>
          </span>
          <div className="flex items-center gap-2 overflow-x-auto min-h-[38px]">
            {deque.length === 0 ? (
              <span className="text-xs font-mono text-slate-500 italic">Empty Deque</span>
            ) : (
              deque.map((node, pos) => (
                <div
                  key={`${node}-${pos}`}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 ${
                    pos === 0
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                      : 'bg-slate-800 border border-slate-700 text-slate-200'
                  }`}
                >
                  <span>Node #{node}</span>
                  <span className="text-[9px] opacity-75">{pos === 0 ? 'FRONT' : `#${pos}`}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
};
