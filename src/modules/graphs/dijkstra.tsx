import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DijkstraNode {
  id: string;
  label: string;
  x: number;
  y: number;
  dist: number; // Infinity or numeric
  status: 'unvisited' | 'evaluating' | 'settled';
}

export interface DijkstraEdge {
  from: string;
  to: string;
  weight: number;
  status: 'default' | 'evaluating' | 'relaxed' | 'shortest-path';
}

export interface DijkstraState {
  nodes: DijkstraNode[];
  edges: DijkstraEdge[];
  priorityQueue: { node: string; dist: number }[];
  settledOrder: string[];
  currentNode?: string;
  evaluatingEdge?: { from: string; to: string; weight: number; newDist: number; isRelaxed: boolean };
}

export interface DijkstraGraphInput {
  startNode: string;
  nodes: { id: string; label: string; x: number; y: number }[];
  edges: { from: string; to: string; weight: number }[];
}

const defaultGraph: DijkstraGraphInput = {
  startNode: 'A',
  nodes: [
    { id: 'A', label: 'A (Source)', x: 90, y: 160 },
    { id: 'B', label: 'B', x: 250, y: 70 },
    { id: 'C', label: 'C', x: 250, y: 250 },
    { id: 'D', label: 'D', x: 420, y: 70 },
    { id: 'E', label: 'E', x: 420, y: 250 },
    { id: 'F', label: 'F (Target)', x: 570, y: 160 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'C', to: 'E', weight: 8 },
    { from: 'C', to: 'D', weight: 10 },
    { from: 'D', to: 'F', weight: 6 },
    { from: 'E', to: 'D', weight: 2 },
    { from: 'E', to: 'F', weight: 3 },
  ],
};

export const dijkstraModule: AlgorithmModule<DijkstraGraphInput, DijkstraState> = {
  id: 'dijkstra',
  title: "Dijkstra's Shortest Path (Priority Queue)",
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O((V + E) log V)',
    timeAverage: 'O((V + E) log V)',
    timeWorst: 'O((V + E) log V)',
    spaceAuxiliary: 'O(V + E)',
    worstCaseCondition: 'Dense connected graph evaluated using binary min-heap',
  },
  theory: {
    overview:
      "Dijkstra's algorithm determines the single-source shortest path to all vertices in a weighted directed graph with non-negative edge weights.",
    whyItWorks:
      'Greedy choice invariant: The unvisited node with the smallest tentative distance in the min-heap can never be improved later because all edge weights are non-negative (>= 0).',
    invariant:
      'Settled Invariant: For every finalized node u, dist[u] is guaranteed to be the global minimum distance from source.',
    pitfalls: [
      'Cannot be used with negative edge weights; negative cycles cause infinite reduction (use Bellman-Ford).',
      'Forgetting to discard stale min-heap entries when a shorter path to a node is rediscovered.',
    ],
  },
  presets: [
    {
      id: 'classic-network',
      label: 'Classic 6-Node Network',
      description: 'Standard interview network with multi-hop shortcuts',
      data: defaultGraph,
    },
    {
      id: 'direct-vs-indirect',
      label: 'Indirect Shortcut',
      description: 'Direct edge (A->D wt: 15) vs multi-hop (A->B->C->D wt: 6)',
      data: {
        startNode: 'A',
        nodes: [
          { id: 'A', label: 'A', x: 100, y: 160 },
          { id: 'B', label: 'B', x: 260, y: 80 },
          { id: 'C', label: 'C', x: 420, y: 80 },
          { id: 'D', label: 'D', x: 580, y: 160 },
        ],
        edges: [
          { from: 'A', to: 'D', weight: 15 },
          { from: 'A', to: 'B', weight: 2 },
          { from: 'B', to: 'C', weight: 2 },
          { from: 'C', to: 'D', weight: 2 },
        ],
      },
    },
  ],
  defaultInput: defaultGraph,
  codeSnippets: {
    cpp: `vector<int> dijkstra(int n, vector<vector<pair<int, int>>>& adj, int src) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    vector<int> dist(n, 1e9);

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto& [v, weight] : adj[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
    python: `import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)] # (distance, node)

    while pq:
        current_dist, u = heapq.heappop(pq)
        if current_dist > distances[u]:
            continue

        for neighbor, weight in graph[u].items():
            new_dist = current_dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                heapq.heappush(pq, (new_dist, neighbor))

    return distances`,
    typescript: `function dijkstra(graph: Record<string, [string, number][]>, start: string): Record<string, number> {
  const dist: Record<string, number> = {};
  const pq = new MinPriorityQueue();

  dist[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { element: u, priority: d } = pq.dequeue();
    if (d > dist[u]) continue;

    for (const [v, weight] of graph[u] || []) {
      if (dist[u] + weight < (dist[v] ?? Infinity)) {
        dist[v] = dist[u] + weight;
        pq.enqueue(v, dist[v]);
      }
    }
  }
  return dist;
}`,
    java: `public int[] dijkstra(int n, List<List<int[]>> adj, int src) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));

    dist[src] = 0;
    pq.offer(new int[]{0, src});

    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;

        for (int[] edge : adj.get(u)) {
            int v = edge[0], weight = edge[1];
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.offer(new int[]{dist[v], v});
            }
        }
    }
    return dist;
}`,
    pseudocode: `function dijkstra(Graph, source):
    dist[source] = 0
    create priority queue PQ
    PQ.push(source, 0)

    while PQ is not empty:
        u = PQ.extractMin()
        mark u as settled

        for each neighbor v of u:
            if dist[u] + weight(u, v) < dist[v]:
                dist[v] = dist[u] + weight(u, v)
                PQ.push(v, dist[v])`,
  },

  generateTimeline: (input: DijkstraGraphInput): ExecutionFrame<DijkstraState>[] => {
    const { startNode, nodes, edges } = input;
    const frames: ExecutionFrame<DijkstraState>[] = [];

    // Initialize distances
    const distMap: Record<string, number> = {};
    const settledSet = new Set<string>();
    nodes.forEach((n) => {
      distMap[n.id] = n.id === startNode ? 0 : Infinity;
    });

    const pq: { node: string; dist: number }[] = [{ node: startNode, dist: 0 }];
    const settledOrder: string[] = [];

    const buildState = (
      currentNode?: string,
      evalEdge?: { from: string; to: string; weight: number; newDist: number; isRelaxed: boolean }
    ): DijkstraState => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        x: n.x,
        y: n.y,
        dist: distMap[n.id],
        status: settledSet.has(n.id)
          ? 'settled'
          : n.id === currentNode
          ? 'evaluating'
          : 'unvisited',
      })),
      edges: edges.map((e) => {
        let status: 'default' | 'evaluating' | 'relaxed' | 'shortest-path' = 'default';
        if (evalEdge && e.from === evalEdge.from && e.to === evalEdge.to) {
          status = evalEdge.isRelaxed ? 'relaxed' : 'evaluating';
        } else if (settledSet.has(e.from) && settledSet.has(e.to)) {
          status = 'shortest-path';
        }
        return { ...e, status };
      }),
      priorityQueue: [...pq].sort((a, b) => a.dist - b.dist),
      settledOrder: [...settledOrder],
      currentNode,
      evaluatingEdge: evalEdge,
    });

    // Frame 0: Init
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 5,
      explanation: `Initialized Dijkstra from source '${startNode}'. dist[${startNode}] = 0, all other nodes = ∞. Enqueued (${startNode}, 0) into Min-Heap.`,
      variables: { source: startNode, pqSize: 1, settled: 0 },
      invariantStatus: {
        label: `dist[${startNode}] = 0 (Global Minimum)`,
        isValid: true,
      },
      state: buildState(),
    });

    while (pq.length > 0) {
      // Sort PQ and pop min
      pq.sort((a, b) => a.dist - b.dist);
      const { node: u, dist: d } = pq.shift()!;

      if (settledSet.has(u)) {
        continue;
      }

      settledSet.add(u);
      settledOrder.push(u);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        explanation: `Popped node '${u}' from Min-Heap with min distance ${d}. Node '${u}' is now permanently settled!`,
        isMilestone: true,
        milestoneTitle: `Settled Node ${u} (dist: ${d})`,
        variables: { current: u, dist: d, heapSize: pq.length, settledCount: settledSet.size },
        invariantStatus: {
          label: `Optimal shortest path to ${u} confirmed = ${d}`,
          isValid: true,
        },
        state: buildState(u),
      });

      // Relax outgoing edges
      const outgoingEdges = edges.filter((e) => e.from === u);
      for (const edge of outgoingEdges) {
        const v = edge.to;
        if (settledSet.has(v)) continue;

        const candidateDist = d + edge.weight;
        const currentDist = distMap[v];
        const isRelaxed = candidateDist < currentDist;

        if (isRelaxed) {
          distMap[v] = candidateDist;
          pq.push({ node: v, dist: candidateDist });
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          explanation: isRelaxed
            ? `⚡ Edge Relaxed: dist[${u}] (${d}) + wt(${edge.weight}) = ${candidateDist} < dist[${v}] (${currentDist === Infinity ? '∞' : currentDist}). Updated dist[${v}] = ${candidateDist}.`
            : `Edge ${u}→${v} (wt: ${edge.weight}) gives ${candidateDist} >= current dist[${v}] (${currentDist}). No relaxation.`,
          variables: {
            u,
            v,
            weight: edge.weight,
            candidateDist,
            newDist: distMap[v],
          },
          invariantStatus: {
            label: `Triangular Inequality checked: dist[${u}] + wt(${edge.weight})`,
            isValid: true,
          },
          state: buildState(u, {
            from: u,
            to: v,
            weight: edge.weight,
            newDist: distMap[v],
            isRelaxed,
          }),
        });
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 24,
      isMilestone: true,
      milestoneTitle: 'Dijkstra Complete',
      explanation: `All reachable vertices have been settled! Shortest distances from ${startNode}: ${Object.entries(
        distMap
      )
        .map(([k, v]) => `${k}:${v === Infinity ? '∞' : v}`)
        .join(', ')}.`,
      variables: { status: 'COMPLETED', totalSettled: settledSet.size },
      invariantStatus: {
        label: 'All shortest paths globally verified',
        isValid: true,
      },
      state: buildState(),
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<DijkstraState>) => {
    const { nodes, edges, priorityQueue, settledOrder, currentNode } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-4 max-w-5xl mx-auto min-h-[360px]">
        {/* Graph Canvas */}
        <div className="flex-1 w-full bg-[#111827]/70 border border-[#1F293D] rounded-2xl p-4 relative flex items-center justify-center min-h-[300px]">
          <svg className="w-full h-[280px]" viewBox="0 0 660 320">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#06B6D4" />
              </marker>
              <marker
                id="arrow-relaxed"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              let strokeColor = '#334155';
              let strokeWidth = 2;
              let marker = 'url(#arrow)';

              if (edge.status === 'relaxed') {
                strokeColor = '#10B981';
                strokeWidth = 3.5;
                marker = 'url(#arrow-relaxed)';
              } else if (edge.status === 'evaluating') {
                strokeColor = '#06B6D4';
                strokeWidth = 3;
                marker = 'url(#arrow-active)';
              } else if (edge.status === 'shortest-path') {
                strokeColor = '#8B5CF6';
                strokeWidth = 2.5;
              }

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2 - 8;

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={marker}
                    className="transition-colors duration-300"
                  />
                  {/* Weight Badge */}
                  <rect
                    x={midX - 12}
                    y={midY - 10}
                    width={24}
                    height={18}
                    rx={5}
                    fill="#1F2937"
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={strokeColor === '#334155' ? '#94A3B8' : strokeColor}
                    fontSize={11}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              let circleFill = '#1E293B';
              let stroke = '#475569';
              let strokeWidth = 2;
              let textColor = '#F1F5F9';

              if (node.status === 'settled') {
                circleFill = '#10B981';
                stroke = '#059669';
                textColor = '#0B0F19';
                strokeWidth = 3;
              } else if (node.status === 'evaluating') {
                circleFill = '#06B6D4';
                stroke = '#0891B2';
                textColor = '#0B0F19';
                strokeWidth = 3;
              }

              return (
                <g key={node.id} className="cursor-pointer group">
                  {/* Outer glow ring for active node */}
                  {node.id === currentNode && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={28}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={22}
                    fill={circleFill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-300 shadow-lg"
                  />

                  {/* Node Name */}
                  <text
                    x={node.x}
                    y={node.y - 2}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={13}
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {node.id}
                  </text>

                  {/* Tentative Distance Label */}
                  <text
                    x={node.x}
                    y={node.y + 11}
                    textAnchor="middle"
                    fill={node.status === 'settled' || node.status === 'evaluating' ? '#0B0F19' : '#06B6D4'}
                    fontSize={10}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.dist === Infinity ? '∞' : node.dist}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Priority Queue & Status Inspector Side Panel */}
        <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
          {/* Min-Heap Priority Queue Card */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-[#06B6D4]">
                <span>⚡</span> Min-Heap (PQ)
              </span>
              <span className="font-mono text-[10px] text-slate-500">{priorityQueue.length} items</span>
            </div>

            {priorityQueue.length === 0 ? (
              <div className="text-[11px] font-mono text-slate-500 italic py-2 text-center">
                Priority Queue Empty
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
                {priorityQueue.map((item, idx) => (
                  <div
                    key={`${item.node}-${idx}`}
                    className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-xs font-mono ${
                      idx === 0
                        ? 'bg-[#06B6D4]/15 border-[#06B6D4]/40 text-cyan-200 font-bold'
                        : 'bg-[#1F2937]/50 border-[#374151]/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {idx === 0 && <span className="text-[#06B6D4] text-[10px]">MIN</span>}
                      <span>Node {item.node}</span>
                    </span>
                    <span className="text-[#10B981] font-bold">dist: {item.dist}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settled Shortest Paths Summary */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <span>✓</span> Settled Nodes
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {settledOrder.length}/{nodes.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {nodes.map((node) => {
                const isSettled = settledOrder.includes(node.id);
                return (
                  <div
                    key={node.id}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-mono flex items-center gap-1 ${
                      isSettled
                        ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981] font-semibold'
                        : 'bg-[#1F2937]/30 border-[#374151] text-slate-500'
                    }`}
                  >
                    <span>{node.id}:</span>
                    <span>{node.dist === Infinity ? '∞' : node.dist}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
