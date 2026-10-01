import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface PrimNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface PrimEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  status: 'unvisited' | 'candidate' | 'selected' | 'discarded';
}

export interface PrimGraphInput {
  nodes: PrimNode[];
  edges: PrimEdge[];
  startNode: string;
}

export interface PrimMSTState {
  nodes: PrimNode[];
  edges: PrimEdge[];
  visitedNodes: string[];
  currentEdgeId?: string;
  totalWeight: number;
  mstEdgesCount: number;
}

const defaultPrimGraph: PrimGraphInput = {
  startNode: 'A',
  nodes: [
    { id: 'A', label: 'A', x: 120, y: 120 },
    { id: 'B', label: 'B', x: 280, y: 70 },
    { id: 'C', label: 'C', x: 440, y: 120 },
    { id: 'D', label: 'D', x: 120, y: 280 },
    { id: 'E', label: 'E', x: 280, y: 320 },
    { id: 'F', label: 'F', x: 440, y: 280 },
  ],
  edges: [
    { id: 'e-AB', from: 'A', to: 'B', weight: 4, status: 'unvisited' },
    { id: 'e-AD', from: 'A', to: 'D', weight: 2, status: 'unvisited' },
    { id: 'e-BD', from: 'B', to: 'D', weight: 1, status: 'unvisited' },
    { id: 'e-BC', from: 'B', to: 'C', weight: 5, status: 'unvisited' },
    { id: 'e-BE', from: 'B', to: 'E', weight: 3, status: 'unvisited' },
    { id: 'e-DE', from: 'D', to: 'E', weight: 7, status: 'unvisited' },
    { id: 'e-CE', from: 'C', to: 'E', weight: 2, status: 'unvisited' },
    { id: 'e-CF', from: 'C', to: 'F', weight: 6, status: 'unvisited' },
    { id: 'e-EF', from: 'E', to: 'F', weight: 4, status: 'unvisited' },
  ],
};

export const primMSTModule: AlgorithmModule<PrimGraphInput, PrimMSTState> = {
  id: 'prim-mst',
  title: "Prim's Algorithm (Minimum Spanning Tree)",
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(E log V)',
    timeAverage: 'O(E log V)',
    timeWorst: 'O(E log V)',
    spaceAuxiliary: 'O(V + E) Min-Heap',
    worstCaseCondition: 'Dense graphs approach O(V²); with Fibonacci Heap O(E + V log V)',
  },
  theory: {
    overview:
      "Prim's algorithm is a greedy algorithm that finds a Minimum Spanning Tree (MST) for a connected, weighted undirected graph. Starting from an arbitrary root vertex, it grows the tree one edge at a time by continuously adding the cheapest edge across the cut separating visited vertices from unvisited ones.",
    whyItWorks:
      'The Cut Property of MSTs states that for any cut of the graph, the minimum-weight edge crossing the cut must belong to the MST. Prim greedily exploits this property at every step.',
    invariant:
      'At each iteration, the set of selected edges forms a tree spanning all vertices currently in the visited set, with minimal total weight.',
    pitfalls: [
      'Disconnected graphs: Prim only spans the connected component containing the start node.',
      'Unlike Kruskal which processes global sorted edges, Prim relies on a local priority queue of fringe edges crossing the frontier.',
    ],
  },
  presets: [
    {
      id: 'default',
      label: 'Standard 6-Node Graph',
      description: 'Connected network with varying edge weights',
      data: defaultPrimGraph,
    },
    {
      id: 'sparse',
      label: 'Diamond Graph',
      description: '4 nodes with cross edge',
      data: {
        startNode: 'A',
        nodes: [
          { id: 'A', label: 'A', x: 150, y: 200 },
          { id: 'B', label: 'B', x: 280, y: 100 },
          { id: 'C', label: 'C', x: 280, y: 300 },
          { id: 'D', label: 'D', x: 420, y: 200 },
        ],
        edges: [
          { id: 'e1', from: 'A', to: 'B', weight: 3, status: 'unvisited' },
          { id: 'e2', from: 'A', to: 'C', weight: 5, status: 'unvisited' },
          { id: 'e3', from: 'B', to: 'C', weight: 1, status: 'unvisited' },
          { id: 'e4', from: 'B', to: 'D', weight: 4, status: 'unvisited' },
          { id: 'e5', from: 'C', to: 'D', weight: 2, status: 'unvisited' },
        ],
      },
    },
  ],
  defaultInput: defaultPrimGraph,
  codeSnippets: {
    python: `import heapq

def prim_mst(graph, start):
    mst = []
    visited = set([start])
    pq = [(weight, start, to) for to, weight in graph[start]]
    heapq.heapify(pq)
    
    while pq and len(visited) < len(graph):
        weight, frm, to = heapq.heappop(pq)
        if to in visited:
            continue
        visited.add(to)
        mst.append((frm, to, weight))
        for next_node, next_wt in graph[to]:
            if next_node not in visited:
                heapq.heappush(pq, (next_wt, to, next_node))
    return mst`,
    typescript: `function primMST(graph: Graph, start: string): Edge[] {
  const visited = new Set<string>([start]);
  const mst: Edge[] = [];
  const pq = new MinPriorityQueue();
  
  // Push incident edges of start node
  for (const edge of graph.getEdges(start)) pq.enqueue(edge);
  
  while (!pq.isEmpty() && visited.size < graph.nodeCount) {
    const edge = pq.dequeue();
    const nextNode = visited.has(edge.from) ? edge.to : edge.from;
    if (visited.has(nextNode)) continue;
    
    visited.add(nextNode);
    mst.push(edge);
    for (const nextEdge of graph.getEdges(nextNode)) {
      if (!visited.has(nextEdge.other(nextNode))) pq.enqueue(nextEdge);
    }
  }
  return mst;
}`,
    cpp: `vector<Edge> primMST(int n, vector<vector<pair<int, int>>>& adj) {
    vector<bool> visited(n, false);
    priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<>> pq;
    vector<Edge> mst;
    visited[0] = true;
    for (auto& edge : adj[0]) pq.push({edge.second, 0, edge.first});
    
    while (!pq.empty() && mst.size() < n - 1) {
        auto [wt, u, v] = pq.top(); pq.pop();
        if (visited[v]) continue;
        visited[v] = true;
        mst.push_back({u, v, wt});
        for (auto& next : adj[v]) {
            if (!visited[next.first]) pq.push({next.second, v, next.first});
        }
    }
    return mst;
}`,
    java: `public List<Edge> primMST(Graph graph, int start) {
    boolean[] visited = new boolean[graph.V];
    PriorityQueue<Edge> pq = new PriorityQueue<>(Comparator.comparingInt(e -> e.weight));
    List<Edge> mst = new ArrayList<>();
    visited[start] = true;
    pq.addAll(graph.adj[start]);
    
    while (!pq.isEmpty() && mst.size() < graph.V - 1) {
        Edge edge = pq.poll();
        int next = visited[edge.u] ? edge.v : edge.u;
        if (visited[next]) continue;
        visited[next] = true;
        mst.add(edge);
        for (Edge e : graph.adj[next]) if (!visited[e.other(next)]) pq.add(e);
    }
    return mst;
}`,
    pseudocode: `function Prim(Graph G, root):
    visited = {root}
    MST = empty set
    PQ = incident_edges(root)
    while PQ is not empty and |visited| < |G.V|:
        (u, v, weight) = extract_min(PQ)
        if v not in visited:
            visited.add(v)
            MST.add((u, v, weight))
            for each edge (v, w) in G:
                if w not in visited: PQ.insert(v, w)
    return MST`,
  },

  generateTimeline: (input: PrimGraphInput): ExecutionFrame<PrimMSTState>[] => {
    const frames: ExecutionFrame<PrimMSTState>[] = [];
    const nodes = input.nodes;
    const edges: PrimEdge[] = input.edges.map((e) => ({ ...e, status: 'unvisited' }));
    const visited = new Set<string>([input.startNode]);
    let totalWeight = 0;
    let mstEdgeCount = 0;

    const makeState = (currentEdgeId?: string): PrimMSTState => ({
      nodes,
      edges: edges.map((e) => ({ ...e })),
      visitedNodes: Array.from(visited),
      currentEdgeId,
      totalWeight,
      mstEdgesCount: mstEdgeCount,
    });

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Prim's MST starting from root vertex '${input.startNode}'. Cut frontier established.`,
      isMilestone: true,
      milestoneTitle: `Root: ${input.startNode}`,
      soundCue: { type: 'start' },
      variables: { startNode: input.startNode, totalVertices: nodes.length, totalWeight: 0, mstEdgeCount: 0 },
      callStack: [{ name: 'primMST', params: { root: input.startNode, V: nodes.length }, line: 1, isCurrent: true }],
      conditionEval: { expr: `visited.size < nodes.length`, result: true },
      scopeVariables: { startNode: input.startNode, totalVertices: nodes.length },
      state: makeState(),
    });

    while (visited.size < nodes.length) {
      // Find candidate cut edges
      const candidateEdges = edges.filter((e) => {
        const hasFrom = visited.has(e.from);
        const hasTo = visited.has(e.to);
        return (hasFrom && !hasTo) || (!hasFrom && hasTo);
      });

      if (candidateEdges.length === 0) break; // Disconnected graph

      // Highlight candidates
      candidateEdges.forEach((e) => {
        if (e.status === 'unvisited') e.status = 'candidate';
      });

      // Find minimum weight edge among candidates
      candidateEdges.sort((a, b) => a.weight - b.weight);
      const minEdge = candidateEdges[0];

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Inspecting cut frontier: found ${candidateEdges.length} crossing edges. Minimum weight cut edge is (${minEdge.from} - ${minEdge.to}, weight ${minEdge.weight}).`,
        soundCue: { type: 'compare' },
        variables: {
          minEdge: `${minEdge.from}-${minEdge.to}`,
          minWeight: minEdge.weight,
          candidateCount: candidateEdges.length,
        },
        callStack: [{ name: 'findMinCutEdge', params: { candidateCount: candidateEdges.length }, line: 8, isCurrent: true }],
        conditionEval: { expr: `candidateEdges.length > 0`, result: true },
        scopeVariables: {
          minEdge: `${minEdge.from}-${minEdge.to}`,
          minWeight: minEdge.weight,
          candidateCount: candidateEdges.length,
        },
        state: makeState(minEdge.id),
      });

      // Select this edge
      minEdge.status = 'selected';
      const newlyVisited = visited.has(minEdge.from) ? minEdge.to : minEdge.from;
      visited.add(newlyVisited);
      totalWeight += minEdge.weight;
      mstEdgeCount += 1;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `✅ Added edge (${minEdge.from} - ${minEdge.to}, weight ${minEdge.weight}) to MST. Vertex '${newlyVisited}' annexed into visited set. Total MST weight = ${totalWeight}.`,
        isMilestone: true,
        milestoneTitle: `Annex ${newlyVisited} (wt: ${minEdge.weight})`,
        soundCue: { type: 'swap' },
        variables: {
          annexedVertex: newlyVisited,
          edge: `${minEdge.from}-${minEdge.to}`,
          totalWeight,
          mstCount: mstEdgeCount,
        },
        callStack: [{ name: 'annexVertex', params: { vertex: newlyVisited, weight: minEdge.weight }, line: 12, isCurrent: true }],
        conditionEval: { expr: `mstEdgeCount < nodes.length - 1`, result: mstEdgeCount < nodes.length - 1 },
        scopeVariables: {
          annexedVertex: newlyVisited,
          edge: `${minEdge.from}-${minEdge.to}`,
          totalWeight,
          mstCount: mstEdgeCount,
        },
        state: makeState(minEdge.id),
      });

      // Mark internal edges between visited nodes as discarded
      edges.forEach((e) => {
        if (e.status === 'candidate' && visited.has(e.from) && visited.has(e.to)) {
          e.status = 'discarded';
        }
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `🎉 Prim's MST Complete! Selected ${mstEdgeCount} edges spanning all ${nodes.length} vertices with minimal total weight of ${totalWeight}.`,
      isMilestone: true,
      milestoneTitle: 'MST Complete',
      soundCue: { type: 'complete' },
      variables: { totalWeight, mstEdges: mstEdgeCount, isComplete: true },
      callStack: [{ name: 'primMST.complete', params: { totalWeight, edges: mstEdgeCount }, line: 15, isCurrent: true }],
      conditionEval: { expr: `visited.size == nodes.length`, result: visited.size === nodes.length },
      scopeVariables: { totalWeight, mstEdges: mstEdgeCount },
      state: makeState(),
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<PrimMSTState>) => {
    const { nodes, edges, visitedNodes, currentEdgeId, totalWeight, mstEdgesCount } =
      frame.state;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            MST Weight: <span className="text-emerald-400 font-bold">{totalWeight}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Edges in MST:{' '}
            <span className="text-cyan-400 font-bold">
              {mstEdgesCount} / {nodes.length - 1}
            </span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Visited Vertices:{' '}
            <span className="text-amber-400 font-bold">{visitedNodes.join(', ')}</span>
          </div>
        </div>

        {/* SVG Graph Canvas */}
        <div className="relative w-full max-w-2xl h-[360px] bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
          <svg className="w-full h-full" viewBox="0 0 560 360">
            {/* Edges */}
            {edges.map((e) => {
              const u = nodeMap.get(e.from);
              const v = nodeMap.get(e.to);
              if (!u || !v) return null;

              const isSelected = e.status === 'selected';
              const isCandidate = e.status === 'candidate';
              const isDiscarded = e.status === 'discarded';
              const isCurrent = e.id === currentEdgeId;

              const strokeColor = isSelected
                ? '#10b981' // emerald
                : isCurrent
                ? '#38bdf8' // sky
                : isCandidate
                ? '#f59e0b' // amber
                : isDiscarded
                ? '#334155' // slate-700
                : '#475569'; // slate-600

              const strokeWidth = isSelected ? 4 : isCandidate || isCurrent ? 3 : 1.5;
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
                    strokeWidth={strokeWidth}
                    strokeDasharray={isCandidate ? '6 3' : undefined}
                    className="transition-all duration-300"
                  />
                  {/* Weight label badge */}
                  <rect
                    x={midX - 12}
                    y={midY - 10}
                    width={24}
                    height={20}
                    rx={6}
                    fill="#0f172a"
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#34d399' : '#e2e8f0'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const isVisited = visitedNodes.includes(n.id);

              return (
                <g key={n.id} className="transition-all duration-300">
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={22}
                    fill={isVisited ? '#064e3b' : '#0f172a'}
                    stroke={isVisited ? '#10b981' : '#64748b'}
                    strokeWidth={isVisited ? 3 : 2}
                    className="shadow-md"
                  />
                  <text
                    x={n.x}
                    y={n.y + 5}
                    textAnchor="middle"
                    fill={isVisited ? '#6ee7b7' : '#f8fafc'}
                    fontSize="14"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {n.label}
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
