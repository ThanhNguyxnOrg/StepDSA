import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface HierholzerState {
  nodes: string[];
  remainingEdges: { u: string; v: string; id: number }[];
  currentStack: string[];
  circuit: string[];
  activeNode: string | null;
  activeEdgeId: number | null;
}

export const hierholzerModule: AlgorithmModule<
  { nodes: string[]; edges: { u: string; v: string }[]; startNode?: string },
  HierholzerState
> = {
  id: 'hierholzer-eulerian',
  title: "Hierholzer's Algorithm (Eulerian Path & Circuit Backtracking O(V + E))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V + E) recursion stack and edge removal tracking',
    worstCaseCondition: 'All Eulerian graphs require traversing each edge exactly once',
  },
  theory: {
    overview:
      "Hierholzer's algorithm finds an Eulerian path or circuit in a connected graph where every vertex has an even degree (Eulerian circuit) or exactly two vertices have odd degree (Eulerian path). It visits every edge exactly once in linear time.",
    whyItWorks:
      'It greedily walks along available edges until getting stuck (which must happen at a cycle closing node due to degree parities). Vertices with exhausted outgoing edges are popped onto the circuit. This naturally splices smaller sub-tours into a single unified Eulerian path.',
    invariant:
      'Degree Parity Invariant: A closed Eulerian circuit exists if and only if every vertex in the connected component has an even degree.',
    pitfalls: [
      'Applying the algorithm to disconnected components with edges.',
      'Failing to reverse the final circuit array when popping backtracked nodes.',
    ],
  },
  presets: [
    {
      id: 'envelope-house',
      label: 'House / Envelope Graph (5 Nodes, 8 Edges)',
      description: 'Classic Königsberg-style house with roof; exactly 2 odd-degree vertices',
      data: {
        nodes: ['1', '2', '3', '4', '5'],
        edges: [
          { u: '1', v: '2' },
          { u: '2', v: '3' },
          { u: '3', v: '4' },
          { u: '4', v: '1' },
          { u: '1', v: '3' },
          { u: '2', v: '4' },
          { u: '3', v: '5' },
          { u: '4', v: '5' },
        ],
        startNode: '1',
      },
    },
    {
      id: 'bowtie-two-triangles',
      label: 'Bowtie (Two Triangles sharing Hub C)',
      description: 'All nodes have degree 2 or 4 (Eulerian circuit starts anywhere)',
      data: {
        nodes: ['A', 'B', 'C', 'D', 'E'],
        edges: [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'A' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'C' },
        ],
        startNode: 'C',
      },
    },
  ],
  defaultInput: {
    nodes: ['1', '2', '3', '4', '5'],
    edges: [
      { u: '1', v: '2' },
      { u: '2', v: '3' },
      { u: '3', v: '4' },
      { u: '4', v: '1' },
      { u: '1', v: '3' },
      { u: '2', v: '4' },
      { u: '3', v: '5' },
      { u: '4', v: '5' },
    ],
    startNode: '1',
  },
  codeSnippets: {
    cpp: `vector<int> hierholzer(int V, vector<pair<int,int>>& edges, int start) {
    vector<unordered_multiset<int>> adj(V);
    for (auto& [u, v] : edges) {
        adj[u].insert(v); adj[v].insert(u);
    }
    stack<int> st;
    vector<int> circuit;
    st.push(start);
    while (!st.empty()) {
        int u = st.top();
        if (!adj[u].empty()) {
            int v = *adj[u].begin();
            adj[u].erase(adj[u].begin());
            adj[v].erase(adj[v].find(u));
            st.push(v);
        } else {
            circuit.push_back(u);
            st.pop();
        }
    }
    reverse(circuit.begin(), circuit.end());
    return circuit;
}`,
    python: `def hierholzer(adj: dict[str, list[str]], start: str) -> list[str]:
    stack = [start]
    circuit = []
    while stack:
        curr = stack[-1]
        if adj[curr]:
            nxt = adj[curr].pop()
            adj[nxt].remove(curr)
            stack.append(nxt)
        else:
            circuit.append(stack.pop())
    return circuit[::-1]`,
    typescript: `function hierholzer(nodes: string[], edges: { u: string; v: string }[], start: string): string[] {
  const adj = new Map<string, string[]>();
  nodes.forEach(u => adj.set(u, []));
  edges.forEach(({ u, v }) => {
    adj.get(u)!.push(v);
    adj.get(v)!.push(u);
  });
  const stack = [start];
  const circuit: string[] = [];
  while (stack.length > 0) {
    const curr = stack[stack.length - 1];
    const neighbors = adj.get(curr)!;
    if (neighbors.length > 0) {
      const next = neighbors.pop()!;
      const nextList = adj.get(next)!;
      nextList.splice(nextList.indexOf(curr), 1);
      stack.push(next);
    } else {
      circuit.push(stack.pop()!);
    }
  }
  return circuit.reverse();
}`,
    java: `public List<String> hierholzer(Map<String, List<String>> adj, String start) {
    Deque<String> stack = new ArrayDeque<>();
    List<String> circuit = new ArrayList<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        String curr = stack.peek();
        List<String> nbs = adj.get(curr);
        if (nbs != null && !nbs.isEmpty()) {
            String next = nbs.remove(nbs.size() - 1);
            adj.get(next).remove(curr);
            stack.push(next);
        } else {
            circuit.add(stack.pop());
        }
    }
    Collections.reverse(circuit);
    return circuit;
}`,
    pseudocode: `function hierholzer(graph, start):
    stack = [start]
    circuit = []
    while stack is not empty:
        curr = stack.top()
        if curr has unused edges:
            choose and remove edge (curr, next)
            stack.push(next)
        else:
            circuit.append(stack.pop())
    return reverse(circuit)`,
  },
  generateTimeline: (input: {
    nodes: string[];
    edges: { u: string; v: string }[];
    startNode?: string;
  }): ExecutionFrame<HierholzerState>[] => {
    const rawNodes = input?.nodes?.length ? input.nodes : ['1', '2', '3', '4', '5'];
    const rawEdges = input?.edges?.length
      ? input.edges
      : [
          { u: '1', v: '2' },
          { u: '2', v: '3' },
          { u: '3', v: '4' },
          { u: '4', v: '1' },
          { u: '1', v: '3' },
          { u: '2', v: '4' },
          { u: '3', v: '5' },
          { u: '4', v: '5' },
        ];
    const startNode = input?.startNode || rawNodes[0];

    const frames: ExecutionFrame<HierholzerState>[] = [];
    const edgeList = rawEdges.map((e, idx) => ({ ...e, id: idx, used: false }));
    const stack: string[] = [startNode];
    const circuit: string[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        nodes: rawNodes,
        remainingEdges: edgeList.filter((e) => !e.used),
        currentStack: [...stack],
        circuit: [],
        activeNode: startNode,
        activeEdgeId: null,
      },
      callStack: [{ name: 'hierholzer', params: { startNode, totalEdges: rawEdges.length } }],
      variables: { startNode, stack: stack.join(' -> '), edgesLeft: rawEdges.length },
      explanation: `Initialized Hierholzer's Algorithm starting at vertex "${startNode}". Pushed start node onto traversal stack.`,
    });

    while (stack.length > 0) {
      const curr = stack[stack.length - 1];

      // Find an unused edge incident to curr
      const edge = edgeList.find((e) => !e.used && (e.u === curr || e.v === curr));

      if (edge) {
        edge.used = true;
        const next = edge.u === curr ? edge.v : edge.u;
        stack.push(next);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          action: 'TRAVERSE_EDGE',
          state: {
            nodes: rawNodes,
            remainingEdges: edgeList.filter((e) => !e.used),
            currentStack: [...stack],
            circuit: [...circuit],
            activeNode: next,
            activeEdgeId: edge.id,
          },
          callStack: [{ name: 'exploreEdge', params: { from: curr, to: next, edgeId: edge.id } }],
          variables: {
            from: curr,
            to: next,
            stack: stack.join(' -> '),
            remainingEdges: edgeList.filter((e) => !e.used).length,
          },
          explanation: `Traversed edge (${curr}, ${next}). Pushed "${next}" onto stack. Remaining unused edges: ${
            edgeList.filter((e) => !e.used).length
          }.`,
        });
      } else {
        const popped = stack.pop()!;
        circuit.unshift(popped);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          action: 'BACKTRACK_POP',
          state: {
            nodes: rawNodes,
            remainingEdges: edgeList.filter((e) => !e.used),
            currentStack: [...stack],
            circuit: [...circuit],
            activeNode: popped,
            activeEdgeId: null,
          },
          callStack: [{ name: 'popVertex', params: { popped, circuitLength: circuit.length } }],
          variables: {
            poppedVertex: popped,
            currentCircuit: circuit.join(' -> '),
            stackLength: stack.length,
          },
          explanation: `Vertex "${popped}" has no more unused incident edges. Popped to circuit: [${circuit.join(' -> ')}].`,
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      action: 'COMPLETE',
      state: {
        nodes: rawNodes,
        remainingEdges: [],
        currentStack: [],
        circuit: [...circuit],
        activeNode: null,
        activeEdgeId: null,
      },
      callStack: [{ name: 'hierholzer', params: { totalPathEdges: circuit.length - 1, status: 'DONE' } }],
      variables: { completeEulerianTrail: circuit.join(' -> '), length: circuit.length },
      explanation: `Complete Eulerian path discovered: ${circuit.join(' -> ')}. Every edge traversed exactly once!`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<HierholzerState>) => {
    const { nodes, remainingEdges, currentStack, circuit, activeNode } = frame.state;
    const n = nodes.length;
    const radius = 120;
    const centerX = 200;
    const centerY = 160;

    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((u, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      positions[u] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Trail Banner */}
        <div className="flex flex-col gap-2 w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Eulerian Circuit / Path:</span>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              {circuit.length > 0 ? `${circuit.length - 1} Edges Traversed` : 'Building trail'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 font-mono text-sm font-bold">
            {circuit.length > 0 ? (
              circuit.map((v, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {v}
                  </span>
                  {i < circuit.length - 1 && <span className="text-slate-500">→</span>}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-xs italic">Awaiting first popped vertex...</span>
            )}
          </div>
        </div>

        {/* Graph Stage & Stack */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-around gap-6 w-full">
          <svg width="400" height="320" className="overflow-visible">
            {/* Draw remaining edges */}
            {remainingEdges.map((e, idx) => {
              const p1 = positions[e.u];
              const p2 = positions[e.v];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={idx}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((u) => {
              const p = positions[u];
              const isActive = activeNode === u;
              const inStack = currentStack.includes(u);

              return (
                <g key={u} className="transition-transform duration-200">
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="26"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="19"
                    fill={isActive ? '#78350f' : inStack ? '#1e3a8a' : '#0f172a'}
                    stroke={isActive ? '#f59e0b' : inStack ? '#3b82f6' : '#475569'}
                    strokeWidth="3"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {u}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Call Stack Inspector */}
          <div className="flex flex-col gap-2 w-full md:w-56">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              DFS Traversal Stack:
            </span>
            <div className="flex flex-col-reverse gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl p-3 min-h-[140px] justify-end">
              {currentStack.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded font-mono text-xs font-bold border flex items-center justify-between ${
                    idx === currentStack.length - 1
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <span>Node {item}</span>
                  {idx === currentStack.length - 1 && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                      TOP
                    </span>
                  )}
                </div>
              ))}
              {currentStack.length === 0 && (
                <span className="text-slate-600 text-xs italic text-center py-8">Stack empty</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
