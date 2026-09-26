import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TopoNode {
  id: number;
  label: string;
  x: number;
  y: number;
  inDegree: number;
  status: 'unvisited' | 'in-queue' | 'processing' | 'processed';
}

export interface TopoEdge {
  from: number;
  to: number;
  status: 'default' | 'active' | 'removed';
}

export interface TopoState {
  nodes: TopoNode[];
  edges: TopoEdge[];
  queue: number[];
  topoOrder: number[];
  currentNode?: number;
  cycleDetected?: boolean;
}

export interface TopoGraphInput {
  nodes: { id: number; label: string; x: number; y: number }[];
  edges: { from: number; to: number }[];
}

const defaultTopoGraph: TopoGraphInput = {
  nodes: [
    { id: 0, label: 'CS101', x: 80, y: 100 },
    { id: 1, label: 'DataStruct', x: 230, y: 60 },
    { id: 2, label: 'MathDiscrete', x: 230, y: 180 },
    { id: 3, label: 'Algorithms', x: 400, y: 60 },
    { id: 4, label: 'Compilers', x: 400, y: 180 },
    { id: 5, label: 'Capstone', x: 550, y: 120 },
  ],
  edges: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
  ],
};

const cycleTopoGraph: TopoGraphInput = {
  nodes: [
    { id: 0, label: 'Task A', x: 120, y: 90 },
    { id: 1, label: 'Task B', x: 300, y: 60 },
    { id: 2, label: 'Task C', x: 480, y: 90 },
    { id: 3, label: 'Task D', x: 300, y: 190 },
  ],
  edges: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 1 }, // Cycle: B -> C -> D -> B
  ],
};

export const topologicalSortModule: AlgorithmModule<TopoGraphInput, TopoState> = {
  id: 'topological-sort',
  title: "Topological Sort (Kahn's Algorithm)",
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V)',
    worstCaseCondition: 'All vertices and edges processed once',
  },
  theory: {
    overview:
      "Kahn's algorithm produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u -> v, u comes before v. It iteratively removes vertices with zero in-degree.",
    whyItWorks:
      'A node with in-degree 0 has all prerequisites satisfied and can be executed immediately. Removing its outgoing edges reduces the prerequisites for neighboring nodes.',
    invariant:
      'Any node enqueued has in-degree == 0 (all prerequisite dependencies already processed and emitted).',
    pitfalls: [
      'Cannot run on graphs with directed cycles (queue empties before all V vertices are emitted).',
      'A valid topological order is not necessarily unique (multiple DAG valid topological orderings may exist).',
    ],
  },
  presets: [
    { id: 'cs-courses', label: 'Course Prerequisites (DAG)', description: 'Academic course dependency chain', data: defaultTopoGraph },
    { id: 'cycle-deadlock', label: 'Circular Dependency (Cycle)', description: 'Deadlock detection when queue empties prematurely', data: cycleTopoGraph },
  ],
  defaultInput: defaultTopoGraph,
  codeSnippets: {
    python: `def topological_sort(V, adj):
    in_degree = [0] * V
    for u in range(V):
        for v in adj[u]:
            in_degree[v] += 1
            
    queue = deque([u for u in range(V) if in_degree[u] == 0])
    order = []
    
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
                
    if len(order) != V:
        return [] # Cycle detected!
    return order`,
    typescript: `function topologicalSort(V: number, edges: [number, number][]): number[] {
  const inDegree = new Array(V).fill(0);
  const adj = Array.from({ length: V }, () => [] as number[]);
  for (const [u, v] of edges) {
    adj[u].push(v);
    inDegree[v]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < V; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order: number[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }

  return order.length === V ? order : []; // Cycle detected if length < V
}`,
    cpp: `vector<int> topologicalSort(int V, vector<vector<int>>& adj) {
    vector<int> inDegree(V, 0);
    for (int u = 0; u < V; u++) {
        for (int v : adj[u]) inDegree[v]++;
    }
    queue<int> q;
    for (int u = 0; u < V; u++) {
        if (inDegree[u] == 0) q.push(u);
    }
    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    if (order.size() != V) return {}; // Cycle detected
    return order;
}`,
    java: `public List<Integer> topologicalSort(int V, List<List<Integer>> adj) {
    int[] inDegree = new int[V];
    for (int u = 0; u < V; u++) {
        for (int v : adj.get(u)) inDegree[v]++;
    }
    Queue<Integer> q = new LinkedList<>();
    for (int u = 0; u < V; u++) {
        if (inDegree[u] == 0) q.offer(u);
    }
    List<Integer> order = new ArrayList<>();
    while (!q.isEmpty()) {
        int u = q.poll();
        order.add(u);
        for (int v : adj.get(u)) {
            if (--inDegree[v] == 0) q.offer(v);
        }
    }
    return order.size() == V ? order : new ArrayList<>();
}`,
    pseudocode: `function topologicalSort(DAG):
    compute inDegree for all vertices
    queue = [v for v with inDegree[v] == 0]
    order = []
    while queue is not empty:
        u = queue.pop()
        order.append(u)
        for each neighbor v of u:
            inDegree[v] -= 1
            if inDegree[v] == 0:
                queue.push(v)
    return order`,
  },

  generateTimeline: (input: TopoGraphInput): ExecutionFrame<TopoState>[] => {
    const frames: ExecutionFrame<TopoState>[] = [];
    const V = input.nodes.length;
    const inDegree = new Array(V).fill(0);
    const adj: number[][] = Array.from({ length: V }, () => []);

    for (const e of input.edges) {
      if (e.to < V && e.from < V) {
        adj[e.from].push(e.to);
        inDegree[e.to]++;
      }
    }

    // Step 0: Calculate In-Degrees
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: 'Calculated in-degree (number of incoming dependency edges) for all vertices.',
      callStack: [
        { name: 'topologicalSort(V, adj)', params: { V }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { V, inDegrees: inDegree.join(', ') },
      state: {
        nodes: input.nodes.map((n) => ({
          ...n,
          inDegree: inDegree[n.id],
          status: 'unvisited',
        })),
        edges: input.edges.map((e) => ({ ...e, status: 'default' })),
        queue: [],
        topoOrder: [],
      },
      invariantStatus: {
        isValid: true,
        label: 'In-degrees initialized',
      },
    });

    // Enqueue initial zero in-degree nodes
    const queue: number[] = [];
    for (let u = 0; u < V; u++) {
      if (inDegree[u] === 0) {
        queue.push(u);
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      explanation: `Enqueued initial nodes with in-degree 0 (no prerequisites): [${queue.map((id) => input.nodes[id]?.label || id).join(', ')}].`,
      callStack: [
        { name: 'topologicalSort(V, adj)', params: { queueSize: queue.length }, line: 7, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { queue: queue.join(', ') },
      conditionEval: { expr: 'inDegree[u] == 0', result: true },
      state: {
        nodes: input.nodes.map((n) => ({
          ...n,
          inDegree: inDegree[n.id],
          status: queue.includes(n.id) ? 'in-queue' : 'unvisited',
        })),
        edges: input.edges.map((e) => ({ ...e, status: 'default' })),
        queue: [...queue],
        topoOrder: [],
      },
    });

    const topoOrder: number[] = [];
    const activeEdges: TopoEdge[] = input.edges.map((e) => ({ ...e, status: 'default' }));

    while (queue.length > 0) {
      const u = queue.shift()!;
      topoOrder.push(u);
      const uLabel = input.nodes[u]?.label || `Node ${u}`;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation: `Dequeued ${uLabel}. Added to Topological Ordering output.`,
        callStack: [
          { name: 'topologicalSort(V, adj)', params: { activeNode: uLabel, emitted: topoOrder.length }, line: 11, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { u: uLabel, orderLen: topoOrder.length },
        state: {
          nodes: input.nodes.map((n) => ({
            ...n,
            inDegree: inDegree[n.id],
            status: n.id === u ? 'processing' : topoOrder.includes(n.id) ? 'processed' : queue.includes(n.id) ? 'in-queue' : 'unvisited',
          })),
          edges: [...activeEdges],
          queue: [...queue],
          topoOrder: [...topoOrder],
          currentNode: u,
        },
        invariantStatus: {
          isValid: true,
          label: `${uLabel} emitted`,
        },
      });

      // Process outgoing edges
      for (const v of adj[u]) {
        inDegree[v]--;
        const vLabel = input.nodes[v]?.label || `Node ${v}`;

        // Mark edge active
        const edgeIdx = activeEdges.findIndex((e) => e.from === u && e.to === v);
        if (edgeIdx !== -1) {
          activeEdges[edgeIdx].status = 'removed';
        }

        const isNewlyZero = inDegree[v] === 0;
        if (isNewlyZero) {
          queue.push(v);
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          explanation: `Decremented in-degree of ${vLabel} to ${inDegree[v]}.${isNewlyZero ? ` In-degree is now 0! Enqueued ${vLabel}.` : ''}`,
          callStack: [
            { name: 'topologicalSort(V, adj)', params: { from: uLabel, to: vLabel, 'inDegree[to]': inDegree[v] }, line: 14, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { from: uLabel, to: vLabel, newInDegree: inDegree[v] },
          conditionEval: { expr: `inDegree[${v}] == 0`, result: isNewlyZero },
          state: {
            nodes: input.nodes.map((n) => ({
              ...n,
              inDegree: inDegree[n.id],
              status: n.id === u ? 'processing' : topoOrder.includes(n.id) ? 'processed' : queue.includes(n.id) ? 'in-queue' : 'unvisited',
            })),
            edges: [...activeEdges],
            queue: [...queue],
            topoOrder: [...topoOrder],
            currentNode: u,
          },
        });
      }
    }

    // Check for cycles
    const hasCycle = topoOrder.length < V;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 17,
      explanation: hasCycle
        ? `Queue became empty but only ${topoOrder.length}/${V} vertices were emitted! DIRECTED CYCLE DETECTED.`
        : `Topological ordering successfully found for all ${V} vertices!`,
      callStack: [
        { name: 'topologicalSort(V, adj)', params: { completed: !hasCycle ? 1 : 0 }, line: 17, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { result: hasCycle ? 'CYCLE_DETECTED' : 'VALID_DAG', emittedCount: topoOrder.length },
      conditionEval: { expr: `order.size() == ${V}`, result: !hasCycle },
      state: {
        nodes: input.nodes.map((n) => ({
          ...n,
          inDegree: inDegree[n.id],
          status: topoOrder.includes(n.id) ? 'processed' : 'unvisited',
        })),
        edges: [...activeEdges],
        queue: [],
        topoOrder: [...topoOrder],
        cycleDetected: hasCycle,
      },
      invariantStatus: {
        isValid: !hasCycle,
        label: hasCycle ? 'Cycle Detected' : 'DAG Ordering Complete',
      },
    });

    const totalSteps = frames.length;
    return frames.map((f) => ({ ...f, totalSteps }));
  },

  renderStage: (frame: ExecutionFrame<TopoState>) => {
    const { nodes, edges, queue, topoOrder, currentNode, cycleDetected } = frame.state;

    return (
      <div className="w-full h-full flex flex-col justify-between p-4 bg-[#0B0F19] rounded-2xl border border-[#1F293D] relative overflow-hidden select-none">
        {/* Top Status Bar: Queue & Output Order */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827]/90 p-3 rounded-xl border border-[#1F293D] z-10">
          {/* In-Degree Queue */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Zero-InDegree Queue:</span>
            <div className="flex items-center gap-1.5 min-h-[26px]">
              {queue.length > 0 ? (
                queue.map((id) => {
                  const node = nodes.find((n) => n.id === id);
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#06B6D4]/20 border border-[#06B6D4] text-[#06B6D4] shadow-sm animate-pulse"
                    >
                      {node?.label || id}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs font-mono text-slate-500 italic">Empty</span>
              )}
            </div>
          </div>

          {/* Topological Order Emitted */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Order:</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {topoOrder.length > 0 ? (
                topoOrder.map((id, idx) => {
                  const node = nodes.find((n) => n.id === id);
                  return (
                    <React.Fragment key={id}>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981]">
                        {node?.label || id}
                      </span>
                      {idx < topoOrder.length - 1 && <span className="text-slate-600 text-xs">→</span>}
                    </React.Fragment>
                  );
                })
              ) : (
                <span className="text-xs font-mono text-slate-500 italic">None yet</span>
              )}
            </div>
          </div>
        </div>

        {/* SVG Graph Canvas */}
        <div className="flex-1 w-full relative flex items-center justify-center min-h-[260px]">
          <svg className="w-full h-full max-w-[680px] max-h-[320px]" viewBox="0 0 680 260">
            <defs>
              <marker id="arrow-default" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
                <polygon points="0 1, 8 4, 0 7" fill="#4B5563" />
              </marker>
              <marker id="arrow-removed" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
                <polygon points="0 1, 8 4, 0 7" fill="#10B981" />
              </marker>
            </defs>

            {/* Render Directed Edges */}
            {edges.map((e, idx) => {
              const u = nodes.find((n) => n.id === e.from);
              const v = nodes.find((n) => n.id === e.to);
              if (!u || !v) return null;

              const isRemoved = e.status === 'removed';
              const strokeColor = isRemoved ? '#10B981' : '#4B5563';
              const strokeWidth = isRemoved ? 2.5 : 1.5;
              const strokeDash = isRemoved ? '4,4' : 'none';

              return (
                <line
                  key={`edge-${idx}`}
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  markerEnd={isRemoved ? 'url(#arrow-removed)' : 'url(#arrow-default)'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isCurrent = node.id === currentNode;
              let fill = '#111827';
              let stroke = '#374151';
              let textColor = '#9CA3AF';

              if (node.status === 'processed') {
                fill = '#10B98125';
                stroke = '#10B981';
                textColor = '#10B981';
              } else if (node.status === 'processing') {
                fill = '#F59E0B25';
                stroke = '#F59E0B';
                textColor = '#F59E0B';
              } else if (node.status === 'in-queue') {
                fill = '#06B6D425';
                stroke = '#06B6D4';
                textColor = '#06B6D4';
              }

              return (
                <g key={`node-${node.id}`} className="transition-all duration-300 cursor-pointer">
                  {/* Outer Glow */}
                  {isCurrent && (
                    <circle cx={node.x} cy={node.y} r="26" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.6" className="animate-ping" />
                  )}

                  {/* Main Circle */}
                  <circle cx={node.x} cy={node.y} r="22" fill={fill} stroke={stroke} strokeWidth={isCurrent ? 3 : 2} />

                  {/* Node Label */}
                  <text
                    x={node.x}
                    y={node.y - 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-mono font-bold"
                    fill={textColor}
                  >
                    {node.label}
                  </text>

                  {/* In-Degree Counter Badge */}
                  <g transform={`translate(${node.x + 12}, ${node.y - 14})`}>
                    <circle r="9" fill="#1F2937" stroke={node.inDegree === 0 ? '#10B981' : '#F43F5E'} strokeWidth="1.5" />
                    <text
                      y="3"
                      textAnchor="middle"
                      className="text-[9px] font-mono font-bold"
                      fill={node.inDegree === 0 ? '#10B981' : '#F43F5E'}
                    >
                      {node.inDegree}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#0E1420] px-3 py-1.5 rounded-lg border border-[#1F293D]/60">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> In Queue (deg=0)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Processing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Emitted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-[#F43F5E] text-[8px] flex items-center justify-center font-bold text-[#F43F5E]">#</span>
              In-Degree
            </span>
          </div>

          {cycleDetected && (
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40">
              Cycle Detected (Deadlock)
            </span>
          )}
        </div>
      </div>
    );
  },
};
