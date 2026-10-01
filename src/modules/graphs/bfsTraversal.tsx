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

    const getNodesState = (): GraphNode[] =>
      initialNodes.map((n) => ({ ...n, status: nodeStatus[n.id] }));

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
      state: {
        nodes: getNodesState(),
        edges,
        queue: [...queue],
        visitedOrder: [...visitedOrder],
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
        variables: { currentVertex: curr, queue: [...queue], neighbors: adj[curr] },
        state: {
          nodes: getNodesState(),
          edges,
          queue: [...queue],
          visitedOrder: [...visitedOrder],
        },
      });

      // Step B: Explore each neighbor
      for (const neighbor of adj[curr]) {
        const isAlreadyKnown = visitedSet.has(neighbor) || queuedSet.has(neighbor);

        if (!isAlreadyKnown) {
          queuedSet.add(neighbor);
          queue.push(neighbor);
          nodeStatus[neighbor] = 'queued';

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
            variables: { currentVertex: curr, neighbor, isKnown: false, queue: [...queue] },
            conditionEval: { expr: `!visited.has(${neighbor})`, result: true },
            state: {
              nodes: getNodesState(),
              edges,
              queue: [...queue],
              visitedOrder: [...visitedOrder],
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
            variables: { currentVertex: curr, neighbor, isKnown: true, queue: [...queue] },
            conditionEval: { expr: `visited.has(${neighbor}) || queued.has(${neighbor})`, result: true },
            state: {
              nodes: getNodesState(),
              edges,
              queue: [...queue],
              visitedOrder: [...visitedOrder],
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
        variables: { finalizedVertex: curr, visitedOrder: [...visitedOrder], queue: [...queue] },
        state: {
          nodes: getNodesState(),
          edges,
          queue: [...queue],
          visitedOrder: [...visitedOrder],
        },
      });
    }

    // Terminal Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      isMilestone: true,
      milestoneTitle: 'BFS Wavefront Complete',
      soundCue: { type: 'complete' },
      explanation: `🎉 Queue is empty! BFS traversal complete. Final level-order discovery order: [${visitedOrder.join(' -> ')}].`,
      callStack: [{ name: 'bfs(graph, start)', params: { completed: true, totalNodes: visitedOrder.length }, line: 12, isCurrent: true }],
      variables: { completed: true, visitedOrder: [...visitedOrder], totalVisited: visitedOrder.length },
      conditionEval: { expr: 'queue.length == 0', result: true },
      state: {
        nodes: getNodesState(),
        edges,
        queue: [],
        visitedOrder: [...visitedOrder],
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<GraphBFSState>) => {
    const { nodes, edges, queue, visitedOrder } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 gap-6">
        {/* Queue and Visited HUD */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 p-2 bg-slate-900 border border-purple-500/30 rounded-xl shadow-lg">
            <span className="text-[11px] font-mono text-purple-400 font-bold uppercase">FIFO Queue:</span>
            <div className="flex gap-1 min-w-[80px]">
              {queue.length > 0 ? (
                queue.map((q) => (
                  <span
                    key={q}
                    className="w-7 h-7 rounded bg-purple-600/40 border border-purple-400 text-white font-mono text-xs flex items-center justify-center font-bold"
                  >
                    {q}
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
        </div>

        {/* SVG Graph Layout */}
        <svg viewBox="0 0 380 150" className="w-96 h-40">
          {/* Edges */}
          {edges.map((e, idx) => {
            const fromNode = nodes.find((n) => n.id === e.from);
            const toNode = nodes.find((n) => n.id === e.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={`edge-${idx}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#64748B"
                strokeWidth="2.5"
                opacity="0.6"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const isQueued = n.status === 'queued';
            const isVisited = n.status === 'visited';

            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="16"
                  className="transition-all duration-300"
                  fill={isVisited ? '#10B981' : isQueued ? '#A855F7' : '#1E293B'}
                  stroke={isVisited ? '#6EE7B7' : isQueued ? '#E9D5FF' : '#475569'}
                  strokeWidth="2.5"
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fill={isVisited || isQueued ? '#000000' : '#FFFFFF'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  },
};
