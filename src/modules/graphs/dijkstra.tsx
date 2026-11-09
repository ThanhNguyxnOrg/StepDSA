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
  /** Predecessor tree: predecessor[v] is the node that gave v its final distance. */
  predecessor: Record<string, string | null>;
  /** Edges that belong to the shortest-path tree, not merely edges between settled nodes. */
  shortestPathEdges: { from: string; to: string }[];
  /** Source-to-target path highlighted during reconstruction. */
  pathToTarget?: string[];
  targetNode?: string;
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
    const targetNode = nodes[nodes.length - 1]?.id ?? startNode;
    const predecessor: Record<string, string | null> = {};
    nodes.forEach((n) => {
      predecessor[n.id] = null;
    });

    const reconstructPath = (target: string): string[] => {
      const path: string[] = [];
      let cursor: string | null = target;
      const guard = new Set<string>();
      while (cursor !== null && !guard.has(cursor)) {
        guard.add(cursor);
        path.unshift(cursor);
        const parent: string | null = predecessor[cursor] ?? null;
        if (parent === null) {
          return cursor === startNode ? path : [];
        }
        cursor = parent;
      }
      return [];
    };

    const buildState = (
      currentNode?: string,
      evalEdge?: { from: string; to: string; weight: number; newDist: number; isRelaxed: boolean },
      explicitPath?: string[]
    ): DijkstraState => {
      const predecessorEdges = Object.entries(predecessor)
        .filter(([, parent]) => parent !== null)
        .map(([child, parent]) => ({ from: parent as string, to: child }));
      const pathToTarget = explicitPath ?? reconstructPath(targetNode);
      return {
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
          } else if (settledSet.has(e.to) && predecessor[e.to] === e.from) {
            // Only a settled node's predecessor edge is guaranteed final.
            status = 'shortest-path';
          }
          return { ...e, status };
        }),
        priorityQueue: [...pq].sort((a, b) => a.dist - b.dist),
        settledOrder: [...settledOrder],
        currentNode,
        evaluatingEdge: evalEdge,
        predecessor: { ...predecessor },
        shortestPathEdges: predecessorEdges,
        pathToTarget,
        targetNode,
      };
    };

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
      pedagogy: {
        what: `Only the source has a finite tentative distance: dist[${startNode}] = 0.`,
        why: 'All edge weights are non-negative, so any path leaving the source costs at least 0.',
        whatNext: `Extract the minimum entry from the priority queue. It must be (${startNode}, 0).`,
      },
      checkpoint: {
        id: 'dijkstra-first-extract',
        question: 'Which node must the min-priority queue extract first?',
        options: [`${startNode} (distance 0)`, 'The node with the largest label', 'A random unvisited node'],
        correctIndex: 0,
        explanation: `The source is the only queued node and has distance 0, which is the global minimum.`,
      },
      state: buildState(),
    });

    while (pq.length > 0) {
      // Sort PQ and pop min
      pq.sort((a, b) => a.dist - b.dist);
      const { node: u, dist: d } = pq.shift()!;

      if (settledSet.has(u) || d > distMap[u]) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          explanation: `Skipped stale priority-queue entry (${u}, ${d}): ${
            settledSet.has(u) ? 'the node is already settled' : `the current best distance is ${distMap[u]}`
          }.`,
          soundCue: 'discard',
          variables: { staleNode: u, staleDist: d, bestDist: distMap[u], skipped: true },
          pedagogy: {
            what: `The heap still contains an outdated entry for ${u}.`,
            why: 'Lazy deletion keeps the heap simple: stale entries are ignored when popped instead of being removed eagerly.',
            whatNext: 'Pop the next heap entry; only the smallest current distance matters.',
          },
          state: buildState(),
        });
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
        soundCue: 'sorted',
        variables: {
          current: u,
          dist: d,
          heapSize: pq.length,
          settledCount: settledSet.size,
          predecessor: predecessor[u] ?? 'none',
        },
        invariantStatus: {
          label: `Optimal shortest path to ${u} confirmed = ${d}`,
          isValid: true,
        },
        pedagogy: {
          what: `The smallest tentative distance is ${d}, so ${u} is finalized.`,
          why: 'Any alternative route would have to leave the heap with an even smaller key; non-negative weights make that impossible.',
          whatNext: `Relax each outgoing edge ${u}→v and update predecessor[v] only when the distance strictly improves.`,
        },
        state: buildState(u),
      });

      // Relax outgoing edges
      const outgoingEdges = edges.filter((e) => e.from === u);
      for (const edge of outgoingEdges) {
        const v = edge.to;
        if (settledSet.has(v)) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 16,
            explanation: `Edge ${u}→${v} (wt: ${edge.weight}) is skipped because ${v} is already settled with dist ${distMap[v]}.`,
            soundCue: 'discard',
            variables: { u, v, weight: edge.weight, skipped: 'settled' },
            pedagogy: {
              what: `${v} already has a finalized shortest distance.`,
              why: 'Relaxing an edge into a settled node cannot improve it, because its distance was already the global minimum when it was extracted.',
              whatNext: `Continue with the next outgoing edge of ${u}.`,
            },
            state: buildState(u),
          });
          continue;
        }

        const candidateDist = d + edge.weight;
        const currentDist = distMap[v];
        const isRelaxed = candidateDist < currentDist;

        if (isRelaxed) {
          distMap[v] = candidateDist;
          predecessor[v] = u;
          pq.push({ node: v, dist: candidateDist });
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          explanation: isRelaxed
            ? `Edge relaxed: dist[${u}] (${d}) + wt(${edge.weight}) = ${candidateDist} < dist[${v}] (${currentDist === Infinity ? '∞' : currentDist}). Updated dist[${v}] = ${candidateDist} and predecessor[${v}] = ${u}.`
            : `Edge ${u}→${v} (wt: ${edge.weight}) gives ${candidateDist} >= current dist[${v}] (${currentDist === Infinity ? '∞' : currentDist}). No relaxation; predecessor unchanged.`,
          soundCue: isRelaxed ? 'swap' : 'compare',
          isMilestone: isRelaxed,
          milestoneTitle: isRelaxed ? `Relaxed ${u}→${v} (dist ${candidateDist})` : undefined,
          variables: {
            u,
            v,
            weight: edge.weight,
            candidateDist,
            previousDist: currentDist === Infinity ? '∞' : currentDist,
            newDist: distMap[v],
            predecessor: predecessor[v] ?? 'none',
          },
          invariantStatus: {
            label: `Triangular Inequality checked: dist[${u}] + wt(${edge.weight})`,
            isValid: true,
          },
          pedagogy: {
            what: isRelaxed
              ? `The candidate distance ${candidateDist} beats the old tentative distance ${currentDist === Infinity ? '∞' : currentDist}.`
              : `The candidate distance ${candidateDist} does not beat the old tentative distance ${currentDist === Infinity ? '∞' : currentDist}.`,
            why: isRelaxed
              ? 'A strictly smaller path was found, so dist[v] and the predecessor pointer must be updated together.'
              : 'Keeping the old path is correct because the new route is no better.',
            whatNext: isRelaxed
              ? `Push (${v}, ${candidateDist}) into the heap; it may be extracted later.`
              : `Continue with the next outgoing edge of ${u}.`,
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

    // Post-run path reconstruction: follow predecessor pointers from target to source.
    // These frames are explicitly labelled as visualization-only; the source snippets
    // return the distance table, while the predecessor table is built during relaxation.
    const fullPath = reconstructPath(targetNode);
    if (fullPath.length > 0) {
      for (let i = fullPath.length - 1; i >= 0; i--) {
        const partial = fullPath.slice(i);
        const current = partial[0];
        const parent = predecessor[current] ?? null;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 21,
          explanation:
            i === fullPath.length - 1
              ? `Post-processing visualization (not a new source line): start backtracking at target ${current}. predecessor[${current}] = ${parent ?? 'none'}.`
              : `Follow predecessor[${current}] = ${parent ?? 'none'}. Partial path to target: [${partial.join(' → ')}].`,
          soundCue: 'step',
          variables: {
            reconstructFrom: current,
            predecessor: parent ?? 'none',
            partialPath: partial.join(' → '),
            note: 'predecessor[] was recorded during relaxation',
          },
          pedagogy: {
            what: `The reconstruction walks backwards from ${current} to ${startNode}.`,
            why: 'Each predecessor pointer stores the edge that produced the final distance, so the path is recovered without searching again.',
            whatNext:
              parent !== null
                ? `Follow predecessor[${current}] = ${parent}.`
                : 'The source has been reached; reverse the collected nodes to display source → target.',
          },
          state: buildState(undefined, undefined, partial),
        });
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 21,
      isMilestone: true,
      milestoneTitle: 'Dijkstra Complete',
      explanation: `All reachable vertices have been settled! Shortest distances from ${startNode}: ${Object.entries(
        distMap
      )
        .map(([k, v]) => `${k}:${v === Infinity ? '∞' : v}`)
        .join(', ')}.${fullPath.length > 0 ? ` Shortest path to ${targetNode}: ${fullPath.join(' → ')}.` : ''}`,
      soundCue: 'complete',
      variables: {
        status: 'COMPLETED',
        totalSettled: settledSet.size,
        pathToTarget: fullPath.join(' → ') || 'unreachable',
      },
      invariantStatus: {
        label: 'All shortest paths globally verified',
        isValid: true,
      },
      pedagogy: {
        what: 'Every reachable node has been extracted once and has a final distance.',
        why: 'The predecessor tree contains exactly the edges that achieved those distances.',
        whatNext: 'Compare the settled distances with the highlighted source-to-target path.',
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
    const pathToTarget = frame.state.pathToTarget ?? [];
    const pathEdgeKeys = new Set(
      pathToTarget.slice(1).map((to, i) => `${pathToTarget[i]}->${to}`)
    );

    return (
      <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-4 max-w-5xl mx-auto min-h-[360px]">
        {/* Graph Canvas */}
        <div className="flex-1 w-full bg-[#111827]/70 border border-[#1F293D] rounded-2xl p-4 relative flex items-center justify-center min-h-[300px]">
          <svg className="w-full h-[280px]" viewBox="0 0 660 320">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="27"
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
                refX="27"
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
                refX="27"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
              <marker
                id="arrow-path"
                viewBox="0 0 10 10"
                refX="27"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#A78BFA" />
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
              let dash: string | undefined;
              const onTargetPath = pathEdgeKeys.has(`${edge.from}->${edge.to}`);

              if (onTargetPath) {
                strokeColor = '#A78BFA';
                strokeWidth = 4;
                marker = 'url(#arrow-path)';
                dash = '7 4';
              } else if (edge.status === 'relaxed') {
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

              const t = idx % 2 === 0 ? 0.44 : 0.56;
              const midX = fromNode.x + (toNode.x - fromNode.x) * t;
              const midY = fromNode.y + (toNode.y - fromNode.y) * t;

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
                    strokeDasharray={dash}
                    className="transition-colors duration-300"
                  />
                  {/* Weight Badge */}
                  <rect
                    x={midX - 12}
                    y={midY - 9}
                    width={24}
                    height={18}
                    rx={5}
                    fill="#0B0F19"
                    stroke={strokeColor}
                    strokeWidth={1.25}
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fill={strokeColor === '#334155' ? '#CBD5E1' : strokeColor}
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

              const onTargetPath = pathToTarget.includes(node.id);
              return (
                <g key={node.id} className="cursor-pointer group">
                  {onTargetPath && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={27}
                      fill="none"
                      stroke="#A78BFA"
                      strokeWidth={2.5}
                      strokeDasharray="5 3"
                      opacity={0.95}
                    />
                  )}
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

          {/* Predecessor Path Reconstruction */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-violet-300">
                <span>↩</span> Predecessor Path
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                target {frame.state.targetNode ?? '—'}
              </span>
            </div>
            {pathToTarget.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-violet-200">
                {pathToTarget.map((id, idx) => (
                  <span key={`${id}-${idx}`} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-slate-500">→</span>}
                    <span className="px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/40">
                      {id}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[11px] font-mono text-slate-500 italic">
                No complete predecessor chain to target yet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};
