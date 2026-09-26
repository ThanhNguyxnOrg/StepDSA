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
  generateTimeline: (): ExecutionFrame<GraphBFSState>[] => {
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

    const frames: ExecutionFrame<GraphBFSState>[] = [];

    // Frame 0: Init
    frames.push({
      stepIndex: 0,
      totalSteps: 6,
      codeLine: 4,
      explanation: 'Step 0: Initializing BFS with Start Node 0. Enqueueing [0].',
      state: {
        nodes: initialNodes.map((n) => (n.id === 0 ? { ...n, status: 'queued' } : n)),
        edges,
        queue: [0],
        visitedOrder: [],
      },
    });

    // Frame 1: Visit 0, enqueue 1 and 2
    frames.push({
      stepIndex: 1,
      totalSteps: 6,
      codeLine: 8,
      explanation: 'Step 1: Dequeued Node 0. Visiting neighbors 1 and 2 → enqueued.',
      state: {
        nodes: initialNodes.map((n) =>
          n.id === 0
            ? { ...n, status: 'visited' }
            : n.id === 1 || n.id === 2
            ? { ...n, status: 'queued' }
            : n
        ),
        edges,
        queue: [1, 2],
        visitedOrder: [0],
      },
    });

    // Frame 2: Visit 1, enqueue 3
    frames.push({
      stepIndex: 2,
      totalSteps: 6,
      codeLine: 8,
      explanation: 'Step 2: Dequeued Node 1. Visiting neighbor 3 → enqueued.',
      state: {
        nodes: initialNodes.map((n) =>
          n.id === 0 || n.id === 1
            ? { ...n, status: 'visited' }
            : n.id === 2 || n.id === 3
            ? { ...n, status: 'queued' }
            : n
        ),
        edges,
        queue: [2, 3],
        visitedOrder: [0, 1],
      },
    });

    // Frame 3: Visit 2, enqueue 4
    frames.push({
      stepIndex: 3,
      totalSteps: 6,
      codeLine: 8,
      explanation: 'Step 3: Dequeued Node 2. Visiting neighbor 4 → enqueued.',
      state: {
        nodes: initialNodes.map((n) =>
          n.id === 0 || n.id === 1 || n.id === 2
            ? { ...n, status: 'visited' }
            : n.id === 3 || n.id === 4
            ? { ...n, status: 'queued' }
            : n
        ),
        edges,
        queue: [3, 4],
        visitedOrder: [0, 1, 2],
      },
    });

    // Frame 4: Visit 3
    frames.push({
      stepIndex: 4,
      totalSteps: 6,
      codeLine: 8,
      explanation: 'Step 4: Dequeued Node 3. Neighbor 4 is already queued, skipping cycle.',
      state: {
        nodes: initialNodes.map((n) =>
          n.id !== 4 ? { ...n, status: 'visited' } : { ...n, status: 'queued' }
        ),
        edges,
        queue: [4],
        visitedOrder: [0, 1, 2, 3],
      },
    });

    // Frame 5: Visit 4 (All nodes visited)
    frames.push({
      stepIndex: 5,
      totalSteps: 6,
      codeLine: 12,
      isMilestone: true,
      milestoneTitle: 'BFS Wavefront Complete',
      explanation: 'Step 5: Dequeued Node 4. Queue is empty. BFS traversal complete!',
      state: {
        nodes: initialNodes.map((n) => ({ ...n, status: 'visited' })),
        edges,
        queue: [],
        visitedOrder: [0, 1, 2, 3, 4],
      },
    });

    return frames;
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
