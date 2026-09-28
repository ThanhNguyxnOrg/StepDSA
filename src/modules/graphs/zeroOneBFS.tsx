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

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialize 0-1 BFS. Source node ${source} set to distance 0. Deque initialized with [${source}]. All other distances initialized to ∞.`,
      variables: { source, dequeSize: 1, totalNodes: numNodes },
      callStack: [
        { name: `zeroOneBFS(src=${source})`, params: { src: source, nodes: numNodes }, line: 4, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
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
        codeLine: 8,
        explanation: `Popped node ${u} from FRONT of deque. Current finalized distance: ${uDist}. Inspecting outgoing {0, 1} edges.`,
        variables: { currentNode: u, finalizedDist: uDist, dequeRemaining: deque.length },
        callStack: [
          { name: `popFront(${u})`, params: { u, dist: uDist }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
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
          if (w === 0) {
            deque.unshift(v);
          } else {
            deque.push(v);
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: w === 0 ? 13 : 15,
            isMilestone: true,
            milestoneTitle: `Relax Edge (${u} ➔ ${v}, w=${w})`,
            explanation: `Relaxed edge ${u} ➔ ${v} with weight ${w}. Updated dist[${v}] = ${newDist}. Weight is ${w} ➔ Pushed to ${
              w === 0 ? 'FRONT (unshift)' : 'BACK (push)'
            } of deque.`,
            variables: {
              u,
              v,
              weight: w,
              oldDist: currentVDist ?? '∞',
              newDist,
              dequeAction: w === 0 ? 'push_front' : 'push_back',
            },
            callStack: [
              { name: `relaxEdge(${u}➔${v})`, params: { u, v, weight: w, newDist }, line: w === 0 ? 13 : 15, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
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
        }
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 17,
      isMilestone: true,
      milestoneTitle: '0-1 BFS Traversal Complete',
      explanation: `Deque empty. All reachable nodes relaxed with optimal shortest paths in O(V + E) linear time: [${dist
        .map((d, i) => `#${i}: ${d ?? '∞'}`)
        .join(', ')}].`,
      variables: { completedNodes: numNodes, summaryDistances: dist.map((d) => d ?? '∞').join(', ') },
      callStack: [
        { name: 'complete()', params: {}, line: 17, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
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
    const { numNodes, source, currentNode, deque, distances } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
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

        {/* Nodes Grid & Shortest Distances */}
        <div className="w-full flex flex-col gap-4 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>GRAPH VERTICES & SHORTEST DISTANCES</span>
            <span className="text-cyan-400 font-bold">Rule: w=0 ➔ FRONT | w=1 ➔ BACK</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: numNodes }, (_, idx) => {
              const d = distances[idx];
              const isCurrent = idx === currentNode;
              const inDeque = deque.includes(idx);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-105 font-bold'
                      : inDeque
                      ? 'bg-amber-950/40 border-amber-500/60 text-white'
                      : d !== null
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isCurrent ? 'text-slate-950' : 'text-slate-500'}`}>
                    VERTEX #{idx}
                  </span>
                  <div className={`text-2xl font-bold font-mono my-1 ${isCurrent ? 'text-slate-950' : 'text-white'}`}>
                    {d !== null ? d : '∞'}
                  </div>
                  <span className={`text-[10px] font-mono ${isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    {idx === source ? 'SOURCE' : d !== null ? 'REACHED' : 'UNVISITED'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deque State Visualizer */}
        <div className="w-full flex flex-col p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mt-4">
          <span className="text-xs font-mono font-bold text-amber-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span>双端队列 DEQUE (FRONT ➔ BACK)</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 text-[10px]">
              {deque.length} vertices
            </span>
          </span>
          <div className="flex items-center gap-2 overflow-x-auto min-h-[44px]">
            {deque.length === 0 ? (
              <span className="text-xs font-mono text-slate-600 italic">Empty Deque</span>
            ) : (
              deque.map((node, pos) => (
                <div
                  key={pos}
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
