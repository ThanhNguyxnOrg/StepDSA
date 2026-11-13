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
    let checkpointAdded = false;

    const makeState = (currentEdgeId?: string): PrimMSTState => ({
      nodes,
      edges: edges.map((e) => ({ ...e })),
      visitedNodes: Array.from(visited),
      currentEdgeId,
      totalWeight,
      mstEdgesCount: mstEdgeCount,
    });

    // Frame 0: root enters the tree
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Prim starts from root '${input.startNode}': visited = {'${input.startNode}'}, MST is empty.`,
      isMilestone: true,
      milestoneTitle: `Root: ${input.startNode}`,
      soundCue: { type: 'start' },
      variables: { startNode: input.startNode, totalVertices: nodes.length, totalWeight: 0, mstEdgeCount: 0 },
      callStack: [{ name: 'primMST', params: { root: input.startNode, V: nodes.length }, line: 2, isCurrent: true }],
      conditionEval: { expr: `visited.size < nodes.length`, result: nodes.length > 1 },
      pedagogy: {
        what: `The tree starts as the single vertex '${input.startNode}'; every other vertex lies outside the cut.`,
        why: 'Prim grows one tree from one root. At each step only edges crossing from the tree to the outside may be chosen.',
        whatNext: 'Insert every edge incident to the root into the frontier (priority queue).',
      },
      state: makeState(),
    });

    // Frame 1: frontier seeded with root-incident edges
    const rootIncident = edges.filter((e) => e.from === input.startNode || e.to === input.startNode);
    rootIncident.forEach((e) => {
      if (e.status === 'unvisited') e.status = 'candidate';
    });

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Frontier seeded with ${rootIncident.length} edge(s) incident to '${input.startNode}': [${rootIncident
        .map((e) => `${e.from}-${e.to}(${e.weight})`)
        .join(', ')}].`,
      variables: {
        frontierSize: rootIncident.length,
        frontier: rootIncident.map((e) => `${e.from}-${e.to}:${e.weight}`).join(', '),
      },
      callStack: [{ name: 'initFrontier', params: { root: input.startNode, edges: rootIncident.length }, line: 4, isCurrent: true }],
      pedagogy: {
        what: `The frontier contains the ${rootIncident.length} edge(s) crossing the cut between {'${input.startNode}'} and the rest of the graph.`,
        why: 'Only a crossing edge can extend the tree without creating a cycle, so the priority queue needs nothing else.',
        whatNext: 'Extract the lightest crossing edge.',
      },
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
      const minEdgeLabel = `${minEdge.from}-${minEdge.to}`;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Inspect the cut frontier: ${candidateEdges.length} crossing edge(s); extract_min gives (${minEdgeLabel}, weight ${minEdge.weight}).`,
        soundCue: { type: 'compare' },
        variables: {
          minEdge: minEdgeLabel,
          minWeight: minEdge.weight,
          candidateCount: candidateEdges.length,
          frontier: candidateEdges.map((e) => `${e.from}-${e.to}:${e.weight}`).join(', '),
        },
        callStack: [{ name: 'extractMin', params: { candidateCount: candidateEdges.length, weight: minEdge.weight }, line: 6, isCurrent: true }],
        conditionEval: { expr: `candidateEdges.length > 0`, result: true },
        scopeVariables: {
          minEdge: minEdgeLabel,
          minWeight: minEdge.weight,
          candidateCount: candidateEdges.length,
        },
        pedagogy: {
          what: `Of the ${candidateEdges.length} edge(s) crossing the current cut, ${minEdgeLabel} (w=${minEdge.weight}) is the cheapest.`,
          why: 'The cut property guarantees the lightest crossing edge belongs to some MST, so taking it now can never hurt optimality.',
          whatNext: `Annex the unvisited endpoint of ${minEdgeLabel} into the tree.`,
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'prim-min-cut-edge',
              question: `Prim picks ${minEdgeLabel} (w=${minEdge.weight}), the lightest edge crossing the current cut. Why is that choice always safe?`,
              options: [
                'The cut property: the minimum-weight edge crossing any cut belongs to some MST, so this edge cannot be a mistake',
                'Because it is the globally lightest edge in the whole graph, which is always in every MST',
              ],
              correctIndex: 0,
              explanation:
                'Prim only needs optimality across the current cut, not globally. A globally light edge may be inside one component and useless; the cut property is what justifies each greedy annexation.',
            }
          : undefined,
        state: makeState(minEdge.id),
      });
      checkpointAdded = true;

      const newlyVisited = visited.has(minEdge.from) ? minEdge.to : minEdge.from;

      // Annex the new vertex (line 8)
      visited.add(newlyVisited);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `visited.add('${newlyVisited}'): the tree now spans ${visited.size}/${nodes.length} vertices. The selected edge is not yet counted.`,
        isMilestone: true,
        milestoneTitle: `Annex ${newlyVisited} (wt: ${minEdge.weight})`,
        soundCue: { type: 'swap' },
        variables: {
          annexedVertex: newlyVisited,
          visitedSize: visited.size,
          totalVertices: nodes.length,
          edge: minEdgeLabel,
        },
        callStack: [{ name: 'annexVertex', params: { vertex: newlyVisited }, line: 8, isCurrent: true }],
        conditionEval: { expr: `'${newlyVisited}' not in visited`, result: true },
        pedagogy: {
          what: `'${newlyVisited}' joins the visited set, so the cut moves: edges from it to unvisited vertices become crossing edges.`,
          why: 'Annexing exactly one new endpoint per chosen edge is what keeps the selected edges a tree rather than a cycle-bearing subgraph.',
          whatNext: `Add ${minEdgeLabel} to the MST and increase the total weight by ${minEdge.weight}.`,
        },
        state: makeState(minEdge.id),
      });

      // Add the edge to MST (line 9)
      minEdge.status = 'selected';
      totalWeight += minEdge.weight;
      mstEdgeCount += 1;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `MST.add((${minEdgeLabel}, ${minEdge.weight})): MST now has ${mstEdgeCount} edge(s), total weight ${totalWeight}.`,
        soundCue: { type: 'step' },
        variables: {
          edge: minEdgeLabel,
          weight: minEdge.weight,
          totalWeight,
          mstCount: mstEdgeCount,
        },
        callStack: [{ name: 'addToMST', params: { edge: minEdgeLabel, weight: minEdge.weight }, line: 9, isCurrent: true }],
        pedagogy: {
          what: `${minEdgeLabel} is committed to the MST; the running weight becomes ${totalWeight}.`,
          why: 'The edge was the cheapest way to reach the newly annexed vertex, so any cheaper spanning tree would have to contradict the cut property.',
          whatNext: 'Update the frontier with edges leaving the newly annexed vertex.',
        },
        state: makeState(minEdge.id),
      });

      // Refresh the frontier: candidate edges with both endpoints visited are no longer crossing.
      const discarded: PrimEdge[] = [];
      edges.forEach((e) => {
        if (e.status === 'candidate' && visited.has(e.from) && visited.has(e.to)) {
          e.status = 'discarded';
          discarded.push(e);
        }
      });

      const frontierAfter = edges.filter((e) => {
        const hasFrom = visited.has(e.from);
        const hasTo = visited.has(e.to);
        return hasFrom !== hasTo;
      });

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation:
          `Frontier updated: ${frontierAfter.length} crossing edge(s) remain` +
          (discarded.length
            ? `; discarded ${discarded.map((e) => `${e.from}-${e.to}`).join(', ')} because both endpoints are now visited.`
            : '; no edge became internal.'),
        variables: {
          frontierSize: frontierAfter.length,
          frontier: frontierAfter.map((e) => `${e.from}-${e.to}:${e.weight}`).join(', '),
          discardedCount: discarded.length,
          discarded: discarded.map((e) => `${e.from}-${e.to}`).join(', ') || '—',
        },
        callStack: [{ name: 'updateFrontier', params: { crossing: frontierAfter.length }, line: 11, isCurrent: true }],
        pedagogy: {
          what: discarded.length
            ? `${discarded.map((e) => `${e.from}-${e.to}`).join(', ')} stop crossing the cut, so they leave the frontier; ${frontierAfter.length} edge(s) remain.`
            : `No frontier edge became internal; ${frontierAfter.length} edge(s) still cross the cut.`,
          why: 'An edge with both endpoints visited would close a cycle, so it must never be inserted into the priority queue again.',
          whatNext: 'Extract the next lightest crossing edge.',
        },
        state: makeState(),
      });
    }

    const isComplete = visited.size === nodes.length;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: isComplete
        ? `Prim's MST complete: ${mstEdgeCount} edge(s) span all ${nodes.length} vertices with total weight ${totalWeight}.`
        : `Frontier exhausted after ${mstEdgeCount} edge(s): only ${visited.size}/${nodes.length} vertices are reachable from '${input.startNode}'. Prim returns a minimum spanning forest for that component, not a spanning tree.`,
      isMilestone: true,
      milestoneTitle: isComplete ? `MST Complete (weight ${totalWeight})` : 'Disconnected — Spanning Forest',
      soundCue: { type: 'complete' },
      variables: {
        totalWeight,
        mstEdges: mstEdgeCount,
        isComplete,
        reachedVertices: visited.size,
        totalVertices: nodes.length,
      },
      callStack: [{ name: 'primMST.complete', params: { totalWeight, edges: mstEdgeCount }, line: 12, isCurrent: true }],
      conditionEval: { expr: `visited.size == nodes.length`, result: isComplete },
      scopeVariables: { totalWeight, mstEdges: mstEdgeCount, isComplete },
      pedagogy: {
        what: isComplete
          ? `Return MST with ${mstEdgeCount} edges and total weight ${totalWeight}.`
          : `Return a spanning forest: ${visited.size} of ${nodes.length} vertices are reachable, so no spanning tree exists.`,
        why: isComplete
          ? 'Every vertex was annexed through its cheapest crossing edge, so the final tree is minimum by repeated application of the cut property.'
          : 'Prim can only cross edges; with an empty frontier there is no path to the remaining vertices, and pretending otherwise would be false.',
        whatNext: isComplete
          ? 'Compare with Kruskal: same MST weight, but Prim grows one tree while Kruskal merges many.'
          : 'Run Prim again from an unreached vertex to obtain the other components of the forest.',
      },
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
