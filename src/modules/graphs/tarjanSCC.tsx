import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DirectedEdge {
  from: string;
  to: string;
}

export interface TarjanSCCState {
  nodes: string[];
  edges: DirectedEdge[];
  activeNode: string | null;
  activeNeighbor: string | null;
  disc: Record<string, number>;
  low: Record<string, number>;
  stack: string[];
  inStack: Record<string, boolean>;
  sccList: string[][];
  completedSCCNodeColor: Record<string, string>;
}

export const tarjanSCCModule: AlgorithmModule<
  { nodes: string[]; edges: DirectedEdge[] },
  TarjanSCCState
> = {
  id: 'tarjan-scc',
  title: "Tarjan's SCC Algorithm (Low-Link DFS Timestamps O(V + E))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V) stack & timestamp arrays',
    worstCaseCondition: 'Traverses each vertex and directed edge exactly once in single DFS pass',
  },
  theory: {
    overview:
      "Tarjan's algorithm finds all Strongly Connected Components (SCCs) of a directed graph in linear time using a single Depth-First Search traversal.",
    whyItWorks:
      "A vertex u is the root of an SCC if and only if low[u] == disc[u] upon DFS completion. By keeping visited nodes on an auxiliary stack, when u returns with low[u] == disc[u], all nodes popped from the stack down to u form a maximal SCC.",
    invariant:
      'Low-Link Invariant: low[u] is the smallest discovery time reachable from u via DFS tree edges and at most one back-edge into nodes currently on the active stack.',
    pitfalls: [
      'Updating low[u] with a cross-edge pointing to a node already finalized in a prior SCC (must check inStack[v]).',
      'Using undirected DFS bridge logic instead of directed low-link stack popping.',
    ],
  },
  presets: [
    {
      id: 'classic-cycle-tail',
      label: 'Cycle with Tail: 5 Vertices (A-B-C Cycle + D, E)',
      description: 'Cycle {A, B, C} with outgoing paths to {D} and {E}',
      data: {
        nodes: ['A', 'B', 'C', 'D', 'E'],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
          { from: 'C', to: 'A' },
          { from: 'B', to: 'D' },
          { from: 'D', to: 'E' },
        ],
      },
    },
    {
      id: 'two-sccs',
      label: 'Two Interconnected Cycles: 6 Vertices',
      description: 'Component 1 {0, 1, 2} feeds into Component 2 {3, 4, 5}',
      data: {
        nodes: ['0', '1', '2', '3', '4', '5'],
        edges: [
          { from: '0', to: '1' },
          { from: '1', to: '2' },
          { from: '2', to: '0' },
          { from: '1', to: '3' },
          { from: '3', to: '4' },
          { from: '4', to: '5' },
          { from: '5', to: '3' },
        ],
      },
    },
  ],
  defaultInput: {
    nodes: ['A', 'B', 'C', 'D', 'E'],
    edges: [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'A' },
      { from: 'B', to: 'D' },
      { from: 'D', to: 'E' },
    ],
  },
  codeSnippets: {
    cpp: `void tarjanDFS(int u, vector<int>& disc, vector<int>& low, stack<int>& st,
               vector<bool>& inStack, const vector<vector<int>>& adj, int& timer) {
    disc[u] = low[u] = ++timer;
    st.push(u);
    inStack[u] = true;
    for (int v : adj[u]) {
        if (disc[v] == -1) {
            tarjanDFS(v, disc, low, st, inStack, adj, timer);
            low[u] = min(low[u], low[v]);
        } else if (inStack[v]) {
            low[u] = min(low[u], disc[v]);
        }
    }
    if (low[u] == disc[u]) {
        vector<int> scc;
        while (true) {
            int v = st.top(); st.pop();
            inStack[v] = false;
            scc.push_back(v);
            if (u == v) break;
        }
    }
}`,
    python: `def tarjan_scc(graph):
    timer = 0
    disc, low = {}, {}
    stack, in_stack = [], set()
    sccs = []

    def dfs(u):
        nonlocal timer
        disc[u] = low[u] = timer
        timer += 1
        stack.append(u)
        in_stack.add(u)

        for v in graph.get(u, []):
            if v not in disc:
                dfs(v)
                low[u] = min(low[u], low[v])
            elif v in in_stack:
                low[u] = min(low[u], disc[v])

        if low[u] == disc[u]:
            component = []
            while True:
                w = stack.pop()
                in_stack.remove(w)
                component.append(w)
                if w == u: break
            sccs.append(component)

    for node in graph:
        if node not in disc:
            dfs(node)
    return sccs`,
    typescript: `function tarjanSCC(nodes: string[], adj: Record<string, string[]>): string[][] {
    let timer = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const stack: string[] = [];
    const inStack: Record<string, boolean> = {};
    const sccs: string[][] = [];

    function dfs(u: string) {
        disc[u] = low[u] = ++timer;
        stack.push(u);
        inStack[u] = true;

        for (const v of adj[u] || []) {
            if (disc[v] === undefined) {
                dfs(v);
                low[u] = Math.min(low[u], low[v]);
            } else if (inStack[v]) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }

        if (low[u] === disc[u]) {
            const scc: string[] = [];
            while (stack.length > 0) {
                const w = stack.pop()!;
                inStack[w] = false;
                scc.push(w);
                if (w === u) break;
            }
            sccs.push(scc);
        }
    }

    for (const node of nodes) {
        if (disc[node] === undefined) dfs(node);
    }
    return sccs;
}`,
    java: `void dfs(int u, int[] disc, int[] low, Stack<Integer> stack, boolean[] inStack, List<List<Integer>> adj) {
    disc[u] = low[u] = ++timer;
    stack.push(u);
    inStack[u] = true;
    for (int v : adj.get(u)) {
        if (disc[v] == -1) {
            dfs(v, disc, low, stack, inStack, adj);
            low[u] = Math.min(low[u], low[v]);
        } else if (inStack[v]) {
            low[u] = Math.min(low[u], disc[v]);
        }
    }
    if (low[u] == disc[u]) {
        List<Integer> scc = new ArrayList<>();
        while (true) {
            int v = stack.pop();
            inStack[v] = false;
            scc.add(v);
            if (u == v) break;
        }
        sccs.add(scc);
    }
}`,
    pseudocode: `function tarjanSCC(graph):
    timer = 0
    disc = {}, low = {}
    stack = [], inStack = {}
    sccs = []

    function dfs(u):
        disc[u] = low[u] = ++timer
        stack.push(u)
        inStack[u] = true
        for each neighbor v of u:
            if v not visited:
                dfs(v)
                low[u] = min(low[u], low[v])
            else if inStack[v]:
                low[u] = min(low[u], disc[v])
        if low[u] == disc[u]:
            pop all nodes down to u from stack into new SCC
    for each u in graph: if u unvisited dfs(u)`,
  },

  generateTimeline: (input: {
    nodes: string[];
    edges: DirectedEdge[];
  }): ExecutionFrame<TarjanSCCState>[] => {
    const nodes = input.nodes?.length ? input.nodes : ['A', 'B', 'C', 'D', 'E'];
    const edges = input.edges?.length
      ? input.edges
      : [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
          { from: 'C', to: 'A' },
          { from: 'B', to: 'D' },
          { from: 'D', to: 'E' },
        ];

    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      adj[n] = [];
    });
    edges.forEach((e) => {
      if (!adj[e.from]) adj[e.from] = [];
      adj[e.from].push(e.to);
    });

    let timer = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const stack: string[] = [];
    const inStack: Record<string, boolean> = {};
    const sccList: string[][] = [];
    const completedSCCNodeColor: Record<string, string> = {};

    const sccPalette = ['#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6'];

    const frames: ExecutionFrame<TarjanSCCState>[] = [];

    // Frame 0: Start
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialize Tarjan's SCC algorithm with ${nodes.length} vertices and ${edges.length} directed edges.`,
      variables: { totalNodes: nodes.length, totalEdges: edges.length },
      callStack: [{ name: 'tarjanSCC()', params: { vertices: nodes.length }, line: 1, isCurrent: true }],
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: {},
        low: {},
        stack: [],
        inStack: {},
        sccList: [],
        completedSCCNodeColor: {},
      },
    });

    function dfs(u: string) {
      timer++;
      disc[u] = timer;
      low[u] = timer;
      stack.push(u);
      inStack[u] = true;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Visit node "${u}". Assign disc[${u}]=${disc[u]}, low[${u}]=${low[u]}. Push onto active DFS stack.`,
        variables: {
          node: u,
          disc: disc[u],
          low: low[u],
          stack: `[${stack.join(', ')}]`,
        },
        callStack: [
          { name: `dfs(u="${u}")`, params: { disc: disc[u], low: low[u] }, line: 4, isCurrent: true },
          { name: 'tarjanSCC()', params: {}, line: 1 },
        ],
        state: {
          nodes,
          edges,
          activeNode: u,
          activeNeighbor: null,
          disc: { ...disc },
          low: { ...low },
          stack: [...stack],
          inStack: { ...inStack },
          sccList: sccList.map((c) => [...c]),
          completedSCCNodeColor: { ...completedSCCNodeColor },
        },
      });

      const neighbors = adj[u] || [];
      for (const v of neighbors) {
        if (disc[v] === undefined) {
          // Tree edge
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `Explore tree edge (${u} -> ${v}): neighbor "${v}" is unvisited. Recurse DFS.`,
            variables: { from: u, to: v, edgeType: 'TREE_EDGE' },
            callStack: [
              { name: `dfs(u="${u}") -> visit "${v}"`, params: { u, v }, line: 9, isCurrent: true },
            ],
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              stack: [...stack],
              inStack: { ...inStack },
              sccList: sccList.map((c) => [...c]),
              completedSCCNodeColor: { ...completedSCCNodeColor },
            },
          });

          dfs(v);

          // Backtrack from tree edge
          const oldLow = low[u];
          low[u] = Math.min(low[u], low[v]);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            explanation: `Backtrack to "${u}" from child "${v}". Update low[${u}] = min(${oldLow}, low[${v}]=${low[v]}) -> ${low[u]}.`,
            variables: { u, child: v, lowChild: low[v], updatedLowU: low[u] },
            callStack: [
              { name: `backtrack(u="${u}")`, params: { u, low: low[u] }, line: 11, isCurrent: true },
            ],
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              stack: [...stack],
              inStack: { ...inStack },
              sccList: sccList.map((c) => [...c]),
              completedSCCNodeColor: { ...completedSCCNodeColor },
            },
          });
        } else if (inStack[v]) {
          // Back-edge
          const oldLow = low[u];
          low[u] = Math.min(low[u], disc[v]);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 13,
            explanation: `Found back-edge (${u} -> ${v}): "${v}" is currently in the active stack! Update low[${u}] = min(${oldLow}, disc[${v}]=${disc[v]}) -> ${low[u]}.`,
            variables: { from: u, to: v, discV: disc[v], lowU: low[u], edgeType: 'BACK_EDGE' },
            callStack: [
              { name: `backEdge(u="${u}", v="${v}")`, params: { u, v, lowU: low[u] }, line: 13, isCurrent: true },
            ],
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              stack: [...stack],
              inStack: { ...inStack },
              sccList: sccList.map((c) => [...c]),
              completedSCCNodeColor: { ...completedSCCNodeColor },
            },
          });
        }
      }

      // Check if u is root of an SCC
      if (low[u] === disc[u]) {
        const scc: string[] = [];
        const color = sccPalette[sccList.length % sccPalette.length];
        while (stack.length > 0) {
          const w = stack.pop()!;
          inStack[w] = false;
          scc.push(w);
          completedSCCNodeColor[w] = color;
          if (w === u) break;
        }
        sccList.push(scc);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          explanation: `Root of SCC reached at "${u}" (low[${u}] == disc[${u}] == ${low[u]})! Popped component [${scc.join(', ')}] from stack. Identified SCC #${sccList.length}!`,
          variables: {
            sccRoot: u,
            component: `[${scc.join(', ')}]`,
            totalSCCsFound: sccList.length,
          },
          callStack: [
            { name: `popSCC(root="${u}")`, params: { size: scc.length }, line: 18, isCurrent: true },
          ],
          state: {
            nodes,
            edges,
            activeNode: u,
            activeNeighbor: null,
            disc: { ...disc },
            low: { ...low },
            stack: [...stack],
            inStack: { ...inStack },
            sccList: sccList.map((c) => [...c]),
            completedSCCNodeColor: { ...completedSCCNodeColor },
          },
        });
      }
    }

    for (const node of nodes) {
      if (disc[node] === undefined) {
        dfs(node);
      }
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 25,
      explanation: `Tarjan's SCC search complete! Found ${sccList.length} strongly connected components: ${sccList
        .map((scc, idx) => `SCC #${idx + 1}: {${scc.join(', ')}}`)
        .join(' | ')}.`,
      variables: {
        totalSCCs: sccList.length,
      },
      callStack: [{ name: 'complete()', params: { totalSCCs: sccList.length }, line: 25, isCurrent: true }],
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: { ...disc },
        low: { ...low },
        stack: [],
        inStack: {},
        sccList: sccList.map((c) => [...c]),
        completedSCCNodeColor: { ...completedSCCNodeColor },
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<TarjanSCCState>) => {
    const {
      nodes,
      edges,
      activeNode,
      activeNeighbor,
      disc,
      low,
      stack,
      sccList,
      completedSCCNodeColor,
    } = frame.state;

    // Arrange nodes nicely in an elliptical circle or grid
    const total = nodes.length;
    const cx = 260;
    const cy = 200;
    const rx = 180;
    const ry = 130;

    const coords: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      coords[n] = {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
      };
    });

    return (
      <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-between p-6 select-none max-w-6xl mx-auto gap-6">
        {/* Main Graph SVG Canvas */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">SCCs Identified:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                {sccList.length} Components
              </span>
            </div>
            {activeNode && (
              <div className="text-xs font-mono text-cyan-400">
                Active Node: <strong className="text-white">{activeNode}</strong> (disc: {disc[activeNode]}, low: {low[activeNode]})
              </div>
            )}
          </div>

          <div className="w-full h-96 relative rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 520 400" className="w-full h-full">
              <defs>
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="26"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="26"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                </marker>
              </defs>

              {/* Directed Edges */}
              {edges.map((e, idx) => {
                const uPos = coords[e.from];
                const vPos = coords[e.to];
                if (!uPos || !vPos) return null;
                const isActiveEdge =
                  (e.from === activeNode && e.to === activeNeighbor) ||
                  (e.from === activeNeighbor && e.to === activeNode);

                return (
                  <line
                    key={idx}
                    x1={uPos.x}
                    y1={uPos.y}
                    x2={vPos.x}
                    y2={vPos.y}
                    stroke={isActiveEdge ? '#06b6d4' : '#475569'}
                    strokeWidth={isActiveEdge ? 3 : 1.5}
                    markerEnd={isActiveEdge ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Vertices */}
              {nodes.map((n) => {
                const pos = coords[n];
                if (!pos) return null;
                const isCurrent = n === activeNode;
                const isNeighbor = n === activeNeighbor;
                const completedColor = completedSCCNodeColor[n];
                const hasDisc = disc[n] !== undefined;

                return (
                  <g key={n} transform={`translate(${pos.x}, ${pos.y})`}>
                    <circle
                      r="22"
                      fill={
                        completedColor
                          ? completedColor + '33'
                          : isCurrent
                          ? '#06b6d433'
                          : '#0f172a'
                      }
                      stroke={
                        completedColor
                          ? completedColor
                          : isCurrent
                          ? '#06b6d4'
                          : isNeighbor
                          ? '#a855f7'
                          : hasDisc
                          ? '#38bdf8'
                          : '#334155'
                      }
                      strokeWidth={isCurrent ? 3 : 2}
                      className="transition-all duration-300"
                    />
                    <text
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-mono font-bold text-sm fill-white"
                    >
                      {n}
                    </text>
                    {hasDisc && (
                      <text
                        y="34"
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-slate-400 font-semibold"
                      >
                        {disc[n]}/{low[n]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Sidebar: Auxiliary Stack & SCC Components */}
        <div className="w-full md:w-64 flex flex-col gap-4">
          {/* Active Auxiliary Stack */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col">
            <div className="text-xs font-mono font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>DFS Call Stack</span>
              <span className="text-[10px] text-cyan-400 font-normal">Top is last</span>
            </div>
            <div className="min-h-24 max-h-36 overflow-y-auto flex flex-col-reverse gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
              {stack.length === 0 ? (
                <div className="text-[11px] font-mono text-slate-600 text-center py-4">Stack is empty</div>
              ) : (
                stack.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 font-mono text-xs text-cyan-300 flex items-center justify-between"
                  >
                    <span>Node: <strong>{item}</strong></span>
                    <span className="text-[10px] text-slate-400">low={low[item]}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SCC Groupings List */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col flex-1">
            <div className="text-xs font-mono font-bold text-slate-300 mb-2">
              Committed Components ({sccList.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sccList.length === 0 ? (
                <div className="text-[11px] font-mono text-slate-600 text-center py-4">No SCCs finalized yet</div>
              ) : (
                sccList.map((scc, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl border border-slate-700/60 bg-slate-950 flex flex-col gap-1"
                  >
                    <div className="text-[10px] font-mono text-slate-400 font-bold">
                      SCC #{idx + 1} ({scc.length} vertices)
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {scc.map((node) => (
                        <span
                          key={node}
                          style={{
                            borderColor: completedSCCNodeColor[node] || '#10b981',
                            color: completedSCCNodeColor[node] || '#10b981',
                          }}
                          className="px-2 py-0.5 rounded-md border text-xs font-mono font-bold bg-slate-900"
                        >
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
