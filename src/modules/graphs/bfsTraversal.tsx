// bfsTraversal.tsx — BFS wavefront traversal module
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
  status: 'unvisited' | 'queued' | 'active' | 'visited';
}

export interface GraphEdge {
  from: number;
  to: number;
}

export interface GraphBFSState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  queue: number[];
  visitedOrder: number[];
  /** null means "not discovered yet" (infinity). */
  distances: Record<number, number | null>;
  /** BFS discovery-tree parent for each discovered vertex. */
  parents: Record<number, number | null>;
  activeEdge?: { from: number; to: number; kind: 'enqueue' | 'skip' } | null;
  /** Path from start to the vertex currently being processed/discovered. */
  pathToCurrent?: number[];
  /** Shortest path to the last discovered vertex, shown in the final frame. */
  shortestPath?: number[];
}

export const bfsTraversalModule: AlgorithmModule<number, GraphBFSState> = {
  id: 'graph-bfs',
  title: 'Graph Traversal (Breadth-First Search)',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V)',
    worstCaseCondition: 'Complete graph where every vertex connects to every other vertex',
  },
  theory: {
    overview:
      'Breadth-First Search (BFS) is a fundamental graph traversal algorithm that explores vertices level by level using a First-In-First-Out (FIFO) Queue.',
    whyItWorks:
      'By visiting all immediate neighbors before delving deeper, BFS is guaranteed to discover the shortest unweighted path from the starting source to any reachable vertex.',
    invariant:
      'Vertices are popped and finalized in non-decreasing order of their distance (edge count) from the start vertex.',
    pitfalls: [
      'Forgetting to mark a vertex as visited when pushing to the queue, causing infinite loops on cycles.',
      'Using a Stack instead of a Queue (which turns it into DFS).',
    ],
  },
  codeSnippets: {
    python: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    typescript: `function bfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>([start]);
  const queue: number[] = [start];
  const order: number[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
    cpp: `void bfs(const std::vector<std::vector<int>>& adj, int start) {
    std::vector<bool> visited(adj.size(), false);
    std::queue<int> q;
    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,
    java: `public void bfs(List<List<Integer>> adj, int start) {
    boolean[] visited = new boolean[adj.size()];
    Queue<Integer> queue = new LinkedList<>();
    visited[start] = true;
    queue.add(start);

    while (!queue.isEmpty()) {
        int u = queue.poll();
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                visited[v] = true;
                queue.add(v);
            }
        }
    }
}`,
    pseudocode: `function BFS(graph, start):
  visited = {start}
  queue = [start]
  while queue is not empty:
    node = dequeue(queue)
    for neighbor in graph.neighbors(node):
      if neighbor not in visited:
        visited.add(neighbor)
        enqueue(queue, neighbor)`,
  },
  presets: [
    {
      id: 'default',
      label: 'Sample Graph (5 Vertices, Cycle)',
      description: 'Start BFS from vertex 0 with connected cycle edges',
      data: 0,
    },
  ],
  defaultInput: 0,
  generateTimeline: (startInput?: number): ExecutionFrame<GraphBFSState>[] => {
    const initialNodes: GraphNode[] = [
      { id: 0, label: '0', x: 80, y: 70, status: 'unvisited' },
      { id: 1, label: '1', x: 190, y: 30, status: 'unvisited' },
      { id: 2, label: '2', x: 190, y: 110, status: 'unvisited' },
      { id: 3, label: '3', x: 300, y: 30, status: 'unvisited' },
      { id: 4, label: '4', x: 300, y: 110, status: 'unvisited' },
    ];

    const edges: GraphEdge[] = [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
    ];

    // Build adjacency list (undirected)
    const adj: Record<number, number[]> = { 0: [1, 2], 1: [0, 3], 2: [0, 4], 3: [1, 4], 4: [2, 3] };
    const startNode = typeof startInput === 'number' && adj[startInput] ? startInput : 0;

    const frames: ExecutionFrame<GraphBFSState>[] = [];
    const nodeStatus: Record<number, GraphNode['status']> = {};
    initialNodes.forEach((n) => {
      nodeStatus[n.id] = 'unvisited';
    });

    const queue: number[] = [startNode];
    const visitedSet = new Set<number>();
    const queuedSet = new Set<number>([startNode]);
    const visitedOrder: number[] = [];
    nodeStatus[startNode] = 'queued';

    const distances: Record<number, number | null> = {};
    const parents: Record<number, number | null> = {};
    initialNodes.forEach((n) => {
      distances[n.id] = n.id === startNode ? 0 : null;
      parents[n.id] = null;
    });

    const pathTo = (node: number | null): number[] => {
      if (node === null || distances[node] === null) return [];
      const path: number[] = [];
      let cursor: number | null = node;
      const guard = new Set<number>();
      while (cursor !== null && !guard.has(cursor)) {
        guard.add(cursor);
        path.unshift(cursor);
        cursor = parents[cursor] ?? null;
      }
      return path;
    };

    const getNodesState = (): GraphNode[] =>
      initialNodes.map((n) => ({ ...n, status: nodeStatus[n.id] }));

    const baseState = (): Omit<GraphBFSState, 'nodes' | 'edges'> => ({
      queue: [...queue],
      visitedOrder: [...visitedOrder],
      distances: { ...distances },
      parents: { ...parents },
      activeEdge: null,
    });

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized BFS at Start Node ${startNode}. Marked node ${startNode} as queued and pushed into FIFO Queue.`,
      isMilestone: true,
      milestoneTitle: `BFS Initialized at Node ${startNode}`,
      soundCue: { type: 'start' },
      callStack: [
        { name: 'bfs(graph, start)', params: { start: startNode }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { startNode, queue: [...queue], visitedOrder: [] },
      conditionEval: { expr: 'queue.length > 0', result: true },
      pedagogy: {
        what: `Vertex ${startNode} is marked discovered, its distance is 0, and it is the only queue entry.`,
        why: 'BFS starts from one source; marking on enqueue (not dequeue) prevents the same vertex from entering the queue twice.',
        whatNext: `Dequeue vertex ${startNode} and inspect its neighbors in adjacency order.`,
      },
      checkpoint: {
        id: 'bfs-initial-frontier',
        question: `Which vertex is at the front of the FIFO queue?`,
        options: [`${startNode}`, `${initialNodes.find((n) => n.id !== startNode)?.id ?? 1}`, 'The queue is empty'],
        correctIndex: 0,
        explanation: `The queue was initialized with the source vertex ${startNode}.`,
      },
      state: {
        nodes: getNodesState(),
        edges,
        ...baseState(),
      },
    });

    while (queue.length > 0) {
      // Step A: Dequeue vertex
      const curr = queue.shift()!;
      queuedSet.delete(curr);
      nodeStatus[curr] = 'active';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Dequeued vertex ${curr} from front of queue. Status changed to ACTIVE. Exploring neighbors: [${adj[curr].join(', ')}].`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'bfs(graph, start)', params: { currentVertex: curr, queueLength: queue.length }, line: 4, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { currentVertex: curr, queue: [...queue], neighbors: adj[curr], distance: distances[curr] },
        pedagogy: {
          what: `Vertex ${curr} leaves the front of the queue at distance ${distances[curr] ?? '∞'}.`,
          why: 'FIFO order guarantees vertices are processed in non-decreasing distance from the source.',
          whatNext: `Inspect each neighbor of ${curr} in order: [${adj[curr].join(', ')}].`,
        },
        state: {
          nodes: getNodesState(),
          edges,
          ...baseState(),
          pathToCurrent: pathTo(curr),
        },
      });

      // Step B: Explore each neighbor
      for (const neighbor of adj[curr]) {
        const isAlreadyKnown = visitedSet.has(neighbor) || queuedSet.has(neighbor);

        if (!isAlreadyKnown) {
          queuedSet.add(neighbor);
          queue.push(neighbor);
          nodeStatus[neighbor] = 'queued';
          distances[neighbor] = (distances[curr] ?? 0) + 1;
          parents[neighbor] = curr;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: `Inspecting neighbor ${neighbor} from vertex ${curr}: Not yet visited or queued! Enqueueing vertex ${neighbor}.`,
            isMilestone: true,
            milestoneTitle: `Enqueued Node ${neighbor}`,
            soundCue: { type: 'swap' },
            callStack: [
              { name: 'enqueueNeighbor()', params: { from: curr, neighbor }, line: 7, isCurrent: true },
              { name: 'bfs(graph, start)', params: { currentVertex: curr }, line: 5 },
            ],
            variables: {
              currentVertex: curr,
              neighbor,
              isKnown: false,
              queue: [...queue],
              newDistance: distances[neighbor],
              parent: curr,
            },
            conditionEval: { expr: `!visited.has(${neighbor})`, result: true },
            pedagogy: {
              what: `Neighbor ${neighbor} is discovered for the first time and enqueued behind the existing frontier.`,
              why: `Its distance is dist[${curr}] + 1 = ${distances[neighbor]}, the shortest possible unweighted distance because BFS processes layers in order.`,
              whatNext: `Record parent[${neighbor}] = ${curr}, then inspect the next neighbor of ${curr}.`,
            },
            state: {
              nodes: getNodesState(),
              edges,
              ...baseState(),
              activeEdge: { from: curr, to: neighbor, kind: 'enqueue' },
              pathToCurrent: pathTo(neighbor),
            },
          });
        } else {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            explanation: `Inspecting neighbor ${neighbor} from vertex ${curr}: Already discovered (${
              visitedSet.has(neighbor) ? 'Visited' : 'Queued'
            }). Skipping edge to avoid redundant cycle processing.`,
            soundCue: { type: 'compare' },
            callStack: [
              { name: 'checkNeighbor()', params: { from: curr, neighbor, status: 'already_known' }, line: 6, isCurrent: true },
              { name: 'bfs(graph, start)', params: { currentVertex: curr }, line: 5 },
            ],
            variables: {
              currentVertex: curr,
              neighbor,
              isKnown: true,
              queue: [...queue],
              existingDistance: distances[neighbor],
            },
            conditionEval: { expr: `visited.has(${neighbor}) || queued.has(${neighbor})`, result: true },
            pedagogy: {
              what: `Neighbor ${neighbor} was already discovered, so this edge is not added to the BFS tree.`,
              why: 'Re-enqueuing a discovered vertex would create duplicate work and could break the distance invariant on cyclic graphs.',
              whatNext: `Skip this edge and inspect the next neighbor of ${curr}.`,
            },
            state: {
              nodes: getNodesState(),
              edges,
              ...baseState(),
              activeEdge: { from: curr, to: neighbor, kind: 'skip' },
              pathToCurrent: pathTo(neighbor),
            },
          });
        }
      }

      // Step C: Mark current as finalized visited
      visitedSet.add(curr);
      visitedOrder.push(curr);
      nodeStatus[curr] = 'visited';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Vertex ${curr} completely processed! Marked as VISITED. Visited sequence: [${visitedOrder.join(' -> ')}].`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'bfs(graph, start)', params: { finalized: curr, totalVisited: visitedOrder.length }, line: 9, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: {
          finalizedVertex: curr,
          visitedOrder: [...visitedOrder],
          queue: [...queue],
          distance: distances[curr],
        },
        pedagogy: {
          what: `Vertex ${curr} is finalized after all of its neighbors have been inspected.`,
          why: 'Every edge leaving this layer has been considered, so its recorded distance and parent cannot improve later.',
          whatNext: queue.length > 0 ? `Dequeue the next vertex ${queue[0]} from the front.` : 'The queue is empty; traversal is complete.',
        },
        state: {
          nodes: getNodesState(),
          edges,
          ...baseState(),
          pathToCurrent: pathTo(curr),
        },
      });
    }

    // Terminal Frame
    const lastDiscovered = visitedOrder[visitedOrder.length - 1] ?? startNode;
    const shortestPath = pathTo(lastDiscovered);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      isMilestone: true,
      milestoneTitle: 'BFS Wavefront Complete',
      soundCue: { type: 'complete' },
      explanation: `Queue is empty! BFS traversal complete. Discovery order: [${visitedOrder.join(' -> ')}]. Shortest path to ${lastDiscovered}: [${shortestPath.join(' -> ')}].`,
      callStack: [{ name: 'bfs(graph, start)', params: { completed: true, totalNodes: visitedOrder.length }, line: 12, isCurrent: true }],
      variables: {
        completed: true,
        visitedOrder: [...visitedOrder],
        totalVisited: visitedOrder.length,
        shortestPath: shortestPath.join(' -> '),
      },
      conditionEval: { expr: 'queue.length == 0', result: true },
      pedagogy: {
        what: `All reachable vertices have been finalized; the queue is empty.`,
        why: 'BFS discovery-tree parents give a shortest unweighted path from the source to every discovered vertex.',
        whatNext: `Compare dist[] values: each layer is exactly one edge farther than the previous layer.`,
      },
      state: {
        nodes: getNodesState(),
        edges,
        ...baseState(),
        pathToCurrent: shortestPath,
        shortestPath,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<GraphBFSState>) => {
    const { nodes, edges, queue, visitedOrder, distances, parents, activeEdge } = frame.state;
    const path = frame.state.pathToCurrent ?? frame.state.shortestPath ?? [];
    const pathEdgeKeys = new Set(path.slice(1).map((to, i) => `${path[i]}-${to}`));
    const parentEdgeKeys = new Set(
      Object.entries(parents ?? {})
        .filter(([, parent]) => parent !== null)
        .map(([child, parent]) => `${parent}-${child}`)
    );
    const edgeMatches = (a: number, b: number, key: string) =>
      key === `${a}-${b}` || key === `${b}-${a}`;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 gap-4">
        {/* Queue, distance and path HUD */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 p-2 bg-slate-900 border border-purple-500/30 rounded-xl shadow-lg">
            <span className="text-[11px] font-mono text-purple-400 font-bold uppercase">FIFO Queue:</span>
            <div className="flex gap-1 min-w-[80px]">
              {queue.length > 0 ? (
                queue.map((q, idx) => (
                  <span
                    key={q}
                    className={`w-7 h-7 rounded border font-mono text-xs flex flex-col items-center justify-center font-bold leading-none ${
                      idx === 0
                        ? 'bg-purple-600/60 border-purple-300 text-white ring-1 ring-purple-300/60'
                        : 'bg-purple-600/30 border-purple-400/70 text-purple-100'
                    }`}
                    title={`distance ${distances?.[q] ?? '∞'}`}
                  >
                    <span>{q}</span>
                    <span className="text-[8px] opacity-80">d{distances?.[q] ?? '∞'}</span>
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs font-mono">empty</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-900 border border-emerald-500/30 rounded-xl shadow-lg">
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Visited:</span>
            <span className="font-mono text-xs text-white">
              [{visitedOrder.join(' → ')}]
            </span>
          </div>

          {path.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-slate-900 border border-violet-500/30 rounded-xl shadow-lg">
              <span className="text-[11px] font-mono text-violet-300 font-bold uppercase">Path:</span>
              <span className="font-mono text-xs text-violet-200">{path.join(' → ')}</span>
            </div>
          )}
        </div>

        {/* SVG Graph Layout */}
        <div className="w-full max-w-xl bg-[#111827]/70 border border-[#1F293D] rounded-2xl p-4 flex items-center justify-center">
          <svg viewBox="0 0 380 190" className="w-full h-56 overflow-visible">
            <defs>
              <marker id="bfs-arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
              </marker>
              <marker id="bfs-arrow-path" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#A78BFA" />
              </marker>
              <marker id="bfs-arrow-active" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
              </marker>
            </defs>

            {/* Edges: path edges are the strongest visual, then discovery-tree edges, then the active edge. */}
            {edges.map((e, idx) => {
              const fromNode = nodes.find((n) => n.id === e.from);
              const toNode = nodes.find((n) => n.id === e.to);
              if (!fromNode || !toNode) return null;

              const onPath = [...pathEdgeKeys].some((key) => edgeMatches(e.from, e.to, key));
              const isParentEdge = [...parentEdgeKeys].some((key) => edgeMatches(e.from, e.to, key));
              const isActive =
                !!activeEdge &&
                ((activeEdge.from === e.from && activeEdge.to === e.to) ||
                  (activeEdge.from === e.to && activeEdge.to === e.from));

              let stroke = '#475569';
              let strokeWidth = 2.25;
              let opacity = 0.55;
              let marker = 'url(#bfs-arrow)';
              let dash: string | undefined;
              if (onPath) {
                stroke = '#A78BFA';
                strokeWidth = 3.5;
                opacity = 1;
                marker = 'url(#bfs-arrow-path)';
                dash = '7 4';
              } else if (isActive) {
                stroke = activeEdge?.kind === 'enqueue' ? '#F59E0B' : '#06B6D4';
                strokeWidth = 3.5;
                opacity = 1;
                marker = 'url(#bfs-arrow-active)';
              } else if (isParentEdge) {
                stroke = '#10B981';
                strokeWidth = 2.5;
                opacity = 0.7;
              }

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                    markerEnd={marker}
                    strokeDasharray={dash}
                  />
                  {onPath && (
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#C4B5FD"
                      strokeWidth="1.5"
                      strokeDasharray="3 5"
                    >
                      <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.9s" repeatCount="indefinite" />
                    </line>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const isQueued = n.status === 'queued';
              const isVisited = n.status === 'visited';
              const isActive = n.status === 'active';
              const visitIdx = visitedOrder.indexOf(n.id);
              const onPath = path.includes(n.id);
              const distance = distances?.[n.id];
              const parent = parents?.[n.id];

              return (
                <g key={n.id}>
                  {onPath && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="24"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      opacity="0.9"
                    />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="18"
                    className="transition-all duration-300"
                    fill={
                      isActive
                        ? '#F59E0B'
                        : isVisited
                        ? '#10B981'
                        : isQueued
                        ? '#A855F7'
                        : '#1E293B'
                    }
                    stroke={
                      isActive
                        ? '#FDE68A'
                        : onPath
                        ? '#C4B5FD'
                        : isVisited
                        ? '#6EE7B7'
                        : isQueued
                        ? '#E9D5FF'
                        : '#475569'
                    }
                    strokeWidth={isActive || onPath ? '3' : '2.5'}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill={isVisited || isQueued || isActive ? '#0B0F19' : '#FFFFFF'}
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {n.label}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 31}
                    textAnchor="middle"
                    fill="#67E8F9"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    d={distance === null || distance === undefined ? '∞' : distance}
                    {parent !== null && parent !== undefined ? ` · p=${parent}` : ''}
                  </text>
                  {visitIdx >= 0 && (
                    <text
                      x={n.x}
                      y={n.y + 43}
                      textAnchor="middle"
                      fill="#34D399"
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      visit #{visitIdx + 1}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-400 inline-block" /> shortest path</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-400 inline-block" /> discovery tree</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block" /> active enqueue</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-400 inline-block" /> skipped edge</span>
        </div>
      </div>
    );
  },
};
