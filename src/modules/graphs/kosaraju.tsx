import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DirectedEdge {
  from: string;
  to: string;
}

export interface KosarajuState {
  nodes: string[];
  edges: DirectedEdge[];
  phase: 'PASS_1_DFS' | 'TRANSPOSE' | 'PASS_2_SCC' | 'DONE';
  activeNode: string | null;
  finishStack: string[];
  sccList: string[][];
  visited: Record<string, boolean>;
}

export const kosarajuModule: AlgorithmModule<
  { nodes: string[]; edges: DirectedEdge[] },
  KosarajuState
> = {
  id: 'kosaraju-scc',
  title: "Kosaraju's Algorithm (Two-Pass Transposed DFS O(V + E))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V + E) for transposed adjacency list and finish stack',
    worstCaseCondition: 'Two linear DFS passes over vertices and directed edges',
  },
  theory: {
    overview:
      "Kosaraju's algorithm partitions a directed graph into Strongly Connected Components (SCCs) in linear time using two Depth-First Search passes and graph transposition.",
    whyItWorks:
      'Pass 1 orders vertices by finish times onto a stack. Transposing reverses all edges, preserving intra-SCC reachability while reversing cross-SCC edges. In Pass 2, popping vertices from the stack prevents DFS from leaking into previously finished SCCs.',
    invariant:
      'Transposed Reachability Invariant: If SCC A has an edge to SCC B in G, then in the transposed graph G^T, SCC B has an edge to SCC A, guaranteeing isolated component extraction.',
    pitfalls: [
      'Forgetting to reset the visited array between Pass 1 and Pass 2.',
      'Reversing edges incorrectly during transposition.',
    ],
  },
  presets: [
    {
      id: 'classic-two-sccs',
      label: 'Two Cycles: (A-B-C) -> (D-E)',
      description: 'Cycle {A, B, C} connects to cycle {D, E}',
      data: {
        nodes: ['A', 'B', 'C', 'D', 'E'],
        edges: [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
          { from: 'C', to: 'A' },
          { from: 'C', to: 'D' },
          { from: 'D', to: 'E' },
          { from: 'E', to: 'D' },
        ],
      },
    },
    {
      id: 'linear-chain',
      label: 'DAG Chain (Each node is its own SCC): 4 Nodes',
      description: '0 -> 1 -> 2 -> 3 yields 4 single-node SCCs',
      data: {
        nodes: ['0', '1', '2', '3'],
        edges: [
          { from: '0', to: '1' },
          { from: '1', to: '2' },
          { from: '2', to: '3' },
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
      { from: 'C', to: 'D' },
      { from: 'D', to: 'E' },
      { from: 'E', to: 'D' },
    ],
  },
  codeSnippets: {
    cpp: `void dfs1(int u, const vector<vector<int>>& adj, vector<bool>& vis, stack<int>& st) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs1(v, adj, vis, st);
    st.push(u);
}
void dfs2(int u, const vector<vector<int>>& radj, vector<bool>& vis, vector<int>& scc) {
    vis[u] = true;
    scc.push_back(u);
    for (int v : radj[u]) if (!vis[v]) dfs2(v, radj, vis, scc);
}
vector<vector<int>> kosaraju(int n, const vector<vector<int>>& adj) {
    stack<int> st;
    vector<bool> vis(n, false);
    for (int i = 0; i < n; i++) if (!vis[i]) dfs1(i, adj, vis, st);

    vector<vector<int>> radj(n);
    for (int u = 0; u < n; u++)
        for (int v : adj[u]) radj[v].push_back(u);

    fill(vis.begin(), vis.end(), false);
    vector<vector<int>> sccs;
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (!vis[u]) {
            vector<int> scc;
            dfs2(u, radj, vis, scc);
            sccs.push_back(scc);
        }
    }
    return sccs;
}`,
    python: `def kosaraju(nodes, edges):
    adj = {u: [] for u in nodes}
    radj = {u: [] for u in nodes}
    for u, v in edges:
        adj[u].append(v)
        radj[v].append(u)

    visited = set()
    stack = []
    def dfs1(u):
        visited.add(u)
        for v in adj[u]:
            if v not in visited: dfs1(v)
        stack.append(u)

    for n in nodes:
        if n not in visited: dfs1(n)

    visited.clear()
    sccs = []
    def dfs2(u, component):
        visited.add(u)
        component.append(u)
        for v in radj[u]:
            if v not in visited: dfs2(v, component)

    while stack:
        u = stack.pop()
        if u not in visited:
            comp = []
            dfs2(u, comp)
            sccs.append(comp)
    return sccs`,
    typescript: `function kosaraju(nodes: string[], edges: DirectedEdge[]): string[][] {
    const adj: Record<string, string[]> = {};
    const radj: Record<string, string[]> = {};
    for (const n of nodes) { adj[n] = []; radj[n] = []; }
    for (const e of edges) { adj[e.from].push(e.to); radj[e.to].push(e.from); }

    const visited: Record<string, boolean> = {};
    const stack: string[] = [];

    function dfs1(u: string) {
        visited[u] = true;
        for (const v of adj[u]) if (!visited[v]) dfs1(v);
        stack.push(u);
    }
    for (const n of nodes) if (!visited[n]) dfs1(n);

    for (const n of nodes) visited[n] = false;
    const sccs: string[][] = [];

    function dfs2(u: string, comp: string[]) {
        visited[u] = true;
        comp.push(u);
        for (const v of radj[u]) if (!visited[v]) dfs2(v, comp);
    }

    while (stack.length > 0) {
        const u = stack.pop()!;
        if (!visited[u]) {
            const comp: string[] = [];
            dfs2(u, comp);
            sccs.push(comp);
        }
    }
    return sccs;
}`,
    java: `List<List<String>> kosaraju(List<String> nodes, List<Edge> edges) {
    // 2-pass DFS with reversed adjacency list
    return new ArrayList<>();
}`,
    pseudocode: `function kosaraju(G):
    S = []
    for each u in G: if unvisited dfs1(u, S)
    G_rev = transpose(G)
    reset visited
    sccs = []
    while S not empty:
        u = S.pop()
        if u unvisited:
            comp = []
            dfs2(u, G_rev, comp)
            sccs.append(comp)
    return sccs`,
  },

  generateTimeline: (input: {
    nodes: string[];
    edges: DirectedEdge[];
  }): ExecutionFrame<KosarajuState>[] => {
    const nodes = input?.nodes?.length ? input.nodes : ['A', 'B', 'C', 'D', 'E'];
    const edges = input?.edges?.length
      ? input.edges
      : [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
          { from: 'C', to: 'A' },
          { from: 'C', to: 'D' },
          { from: 'D', to: 'E' },
          { from: 'E', to: 'D' },
        ];

    const adj: Record<string, string[]> = {};
    const radj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      adj[n] = [];
      radj[n] = [];
    });
    edges.forEach((e) => {
      if (!adj[e.from]) adj[e.from] = [];
      if (!radj[e.to]) radj[e.to] = [];
      adj[e.from].push(e.to);
      radj[e.to].push(e.from);
    });

    const visited: Record<string, boolean> = {};
    nodes.forEach((n) => {
      visited[n] = false;
    });

    const finishStack: string[] = [];
    const sccList: string[][] = [];
    const frames: ExecutionFrame<KosarajuState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Kosaraju's Algorithm for ${nodes.length} vertices and ${edges.length} directed edges.`,
      variables: { totalNodes: nodes.length, phase: 'PASS_1_DFS' },
      callStack: [{ name: 'kosaraju()', params: { n: nodes.length }, line: 2, isCurrent: true }],
      state: {
        nodes,
        edges,
        phase: 'PASS_1_DFS',
        activeNode: null,
        finishStack: [],
        sccList: [],
        visited: { ...visited },
      },
    });

    // Pass 1: DFS for finish order
    function dfs1(u: string) {
      visited[u] = true;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Pass 1: Visit node "${u}". Exploring forward edges.`,
        variables: { node: u, phase: 'PASS_1_DFS' },
        callStack: [{ name: `dfs1(u="${u}")`, params: { u }, line: 4, isCurrent: true }],
        state: {
          nodes,
          edges,
          phase: 'PASS_1_DFS',
          activeNode: u,
          finishStack: [...finishStack],
          sccList: [],
          visited: { ...visited },
        },
      });

      for (const v of adj[u] || []) {
        if (!visited[v]) dfs1(v);
      }

      finishStack.push(u);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Pass 1: Finished node "${u}". Pushed to finish stack: [${finishStack.join(', ')}].`,
        variables: { finishedNode: u, stackTop: u },
        callStack: [{ name: `pushStack(${u})`, params: { u }, line: 6, isCurrent: true }],
        state: {
          nodes,
          edges,
          phase: 'PASS_1_DFS',
          activeNode: u,
          finishStack: [...finishStack],
          sccList: [],
          visited: { ...visited },
        },
      });
    }

    for (const n of nodes) {
      if (!visited[n]) dfs1(n);
    }

    // Step: Transpose graph
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `Transpose graph G -> G^T: All ${edges.length} directed edges reversed. Reset visited markers for Pass 2.`,
      variables: { phase: 'TRANSPOSE', finishStack: finishStack.join(', ') },
      callStack: [{ name: 'transposeGraph()', params: { edges: edges.length }, line: 8, isCurrent: true }],
      state: {
        nodes,
        edges: edges.map((e) => ({ from: e.to, to: e.from })),
        phase: 'TRANSPOSE',
        activeNode: null,
        finishStack: [...finishStack],
        sccList: [],
        visited: nodes.reduce((acc, k) => ({ ...acc, [k]: false }), {}),
      },
    });

    nodes.forEach((n) => {
      visited[n] = false;
    });

    // Pass 2: Pop from stack and traverse transposed graph
    function dfs2(u: string, comp: string[]) {
      visited[u] = true;
      comp.push(u);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `Pass 2 (Transposed): Visit "${u}". Added to active SCC: [${comp.join(', ')}].`,
        variables: { node: u, currentSCC: comp.join(', ') },
        callStack: [{ name: `dfs2(u="${u}")`, params: { u }, line: 12, isCurrent: true }],
        state: {
          nodes,
          edges: edges.map((e) => ({ from: e.to, to: e.from })),
          phase: 'PASS_2_SCC',
          activeNode: u,
          finishStack: [...finishStack],
          sccList: sccList.map((c) => [...c]),
          visited: { ...visited },
        },
      });

      for (const v of radj[u] || []) {
        if (!visited[v]) dfs2(v, comp);
      }
    }

    while (finishStack.length > 0) {
      const u = finishStack.pop()!;
      if (!visited[u]) {
        const comp: string[] = [];
        dfs2(u, comp);
        sccList.push(comp);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          explanation: `Completed SCC #${sccList.length}: {${comp.join(', ')}}!`,
          variables: { sccFound: comp.join(', '), totalSCCs: sccList.length },
          callStack: [{ name: `finishSCC()`, params: { count: comp.length }, line: 15, isCurrent: true }],
          state: {
            nodes,
            edges: edges.map((e) => ({ from: e.to, to: e.from })),
            phase: 'PASS_2_SCC',
            activeNode: u,
            finishStack: [...finishStack],
            sccList: sccList.map((c) => [...c]),
            visited: { ...visited },
          },
        });
      }
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: `Kosaraju's algorithm complete! Identified ${sccList.length} strongly connected components: ${sccList
        .map((c, idx) => `SCC #${idx + 1}: {${c.join(', ')}}`)
        .join(' | ')}.`,
      variables: { totalSCCs: sccList.length },
      callStack: [{ name: 'complete()', params: { sccCount: sccList.length }, line: 18, isCurrent: true }],
      state: {
        nodes,
        edges,
        phase: 'DONE',
        activeNode: null,
        finishStack: [],
        sccList: sccList.map((c) => [...c]),
        visited: { ...visited },
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<KosarajuState>) => {
    const { nodes, edges, phase, activeNode, finishStack, sccList, visited } = frame.state;

    const total = nodes.length;
    const cx = 250;
    const cy = 180;
    const rx = 180;
    const ry = 110;

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
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Phase:</span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                {phase}
              </span>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              SCCs Found: <strong>{sccList.length}</strong>
            </div>
          </div>

          <div className="w-full h-80 relative rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 500 360" className="w-full h-full">
              <defs>
                <marker
                  id="kosaraju-arrow"
                  viewBox="0 0 10 10"
                  refX="26"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
              </defs>

              {edges.map((e, idx) => {
                const uPos = coords[e.from];
                const vPos = coords[e.to];
                if (!uPos || !vPos) return null;
                return (
                  <line
                    key={idx}
                    x1={uPos.x}
                    y1={uPos.y}
                    x2={vPos.x}
                    y2={vPos.y}
                    stroke="#475569"
                    strokeWidth="2"
                    markerEnd="url(#kosaraju-arrow)"
                  />
                );
              })}

              {nodes.map((n) => {
                const pos = coords[n];
                if (!pos) return null;
                const isCurrent = n === activeNode;
                const isVis = visited[n];

                return (
                  <g key={n} transform={`translate(${pos.x}, ${pos.y})`}>
                    <circle
                      r="22"
                      fill={isCurrent ? '#06b6d433' : isVis ? '#10b98122' : '#0f172a'}
                      stroke={isCurrent ? '#06b6d4' : isVis ? '#10b981' : '#334155'}
                      strokeWidth={isCurrent ? 3 : 2}
                    />
                    <text
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-mono font-bold text-sm fill-white"
                    >
                      {n}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Sidebar: Stack & SCC List */}
        <div className="w-full md:w-60 flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="text-xs font-mono font-bold text-slate-300 mb-2">Finish Stack</div>
            <div className="min-h-16 max-h-32 overflow-y-auto flex flex-col-reverse gap-1 p-2 rounded-xl bg-slate-950">
              {finishStack.length === 0 ? (
                <div className="text-[10px] font-mono text-slate-600 text-center py-2">Empty</div>
              ) : (
                finishStack.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-mono text-xs text-center border border-cyan-800/40"
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex-1">
            <div className="text-xs font-mono font-bold text-slate-300 mb-2">
              Identified SCCs ({sccList.length})
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {sccList.map((c, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-300 font-bold"
                >
                  #{idx + 1}: {'{' + c.join(', ') + '}'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
