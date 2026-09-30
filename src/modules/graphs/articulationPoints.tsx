import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface UndirectedEdge {
  u: string;
  v: string;
}

export interface ArticulationPointsState {
  nodes: string[];
  edges: UndirectedEdge[];
  activeNode: string | null;
  activeNeighbor: string | null;
  disc: Record<string, number>;
  low: Record<string, number>;
  cutVertices: string[];
}

export const articulationPointsModule: AlgorithmModule<
  { nodes: string[]; edges: UndirectedEdge[] },
  ArticulationPointsState
> = {
  id: 'articulation-points',
  title: 'Articulation Points (Cut Vertices & Root-Degree Checks O(V + E))',
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V) call stack and lowpoint arrays',
    worstCaseCondition: 'Single linear DFS traversal over vertices and undirected edges',
  },
  theory: {
    overview:
      'An articulation point (or cut vertex) is a vertex whose removal increases the number of connected components in an undirected graph.',
    whyItWorks:
      'In a DFS tree: (1) The root is a cut vertex iff it has >= 2 children in the DFS tree. (2) Any non-root vertex u is a cut vertex iff it has a child v such that low[v] >= disc[u], indicating that v has no back-edge reaching any proper ancestor of u.',
    invariant:
      'Cut Vertex Invariant: u separates v from ancestors of u if and only if low[v] >= disc[u].',
    pitfalls: [
      'Applying the non-root rule to the root vertex of the DFS tree.',
      'Counting duplicate entries for a cut vertex that separates multiple children.',
    ],
  },
  presets: [
    {
      id: 'classic-bowtie',
      label: 'Bowtie Graph: (A-B-C) and (C-D-E) with Bridge Node C',
      description: 'Vertex C is the central cut vertex connecting two triangles',
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
      },
    },
    {
      id: 'linear-chain',
      label: 'Linear Chain: 0 - 1 - 2 - 3',
      description: 'Internal nodes 1 and 2 are articulation points',
      data: {
        nodes: ['0', '1', '2', '3'],
        edges: [
          { u: '0', v: '1' },
          { u: '1', v: '2' },
          { u: '2', v: '3' },
        ],
      },
    },
  ],
  defaultInput: {
    nodes: ['A', 'B', 'C', 'D', 'E'],
    edges: [
      { u: 'A', v: 'B' },
      { u: 'B', v: 'C' },
      { u: 'C', v: 'A' },
      { u: 'C', v: 'D' },
      { u: 'D', v: 'E' },
      { u: 'E', v: 'C' },
    ],
  },
  codeSnippets: {
    cpp: `void dfs(int u, int p, int& timer, vector<int>& disc, vector<int>& low,
         vector<bool>& isCut, const vector<vector<int>>& adj) {
    disc[u] = low[u] = ++timer;
    int children = 0;
    for (int v : adj[u]) {
        if (v == p) continue;
        if (disc[v] != -1) {
            low[u] = min(low[u], disc[v]);
        } else {
            children++;
            dfs(v, u, timer, disc, low, isCut, adj);
            low[u] = min(low[u], low[v]);
            if (p != -1 && low[v] >= disc[u]) isCut[u] = true;
        }
    }
    if (p == -1 && children > 1) isCut[u] = true;
}`,
    python: `def find_cut_vertices(nodes, edges):
    adj = {u: [] for u in nodes}
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    timer = 0
    disc, low = {}, {}
    cut_vertices = set()

    def dfs(u, parent):
        nonlocal timer
        timer += 1
        disc[u] = low[u] = timer
        children = 0
        for v in adj[u]:
            if v == parent: continue
            if v in disc:
                low[u] = min(low[u], disc[v])
            else:
                children += 1
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if parent is not None and low[v] >= disc[u]:
                    cut_vertices.add(u)
        if parent is None and children > 1:
            cut_vertices.add(u)

    for n in nodes:
        if n not in disc: dfs(n, None)
    return list(cut_vertices)`,
    typescript: `function findArticulationPoints(nodes: string[], edges: UndirectedEdge[]): string[] {
    const adj: Record<string, string[]> = {};
    for (const n of nodes) adj[n] = [];
    for (const e of edges) { adj[e.u].push(e.v); adj[e.v].push(e.u); }

    let timer = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const isCut: Record<string, boolean> = {};

    function dfs(u: string, parent: string | null) {
        disc[u] = low[u] = ++timer;
        let children = 0;
        for (const v of adj[u]) {
            if (v === parent) continue;
            if (disc[v] !== undefined) {
                low[u] = Math.min(low[u], disc[v]);
            } else {
                children++;
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (parent !== null && low[v] >= disc[u]) isCut[u] = true;
            }
        }
        if (parent === null && children > 1) isCut[u] = true;
    }
    for (const n of nodes) if (disc[n] === undefined) dfs(n, null);
    return Object.keys(isCut).filter(k => isCut[k]);
}`,
    java: `void dfs(int u, int p, int[] disc, int[] low, boolean[] isCut, List<List<Integer>> adj) {
    // DFS with root degree and lowpoint checks
}`,
    pseudocode: `function findCutVertices(graph):
    timer = 0, disc = {}, low = {}, cut = {}
    function dfs(u, parent):
        disc[u] = low[u] = ++timer, children = 0
        for each v in adj[u]:
            if v == parent: continue
            if v visited: low[u] = min(low[u], disc[v])
            else:
                children++
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if parent != null and low[v] >= disc[u]: cut[u] = true
        if parent == null and children > 1: cut[u] = true`,
  },

  generateTimeline: (input: {
    nodes: string[];
    edges: UndirectedEdge[];
  }): ExecutionFrame<ArticulationPointsState>[] => {
    const nodes = input?.nodes?.length ? input.nodes : ['A', 'B', 'C', 'D', 'E'];
    const edges = input?.edges?.length
      ? input.edges
      : [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'A' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'C' },
        ];

    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      adj[n] = [];
    });
    edges.forEach((e) => {
      if (!adj[e.u]) adj[e.u] = [];
      if (!adj[e.v]) adj[e.v] = [];
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    let timer = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const cutVertices = new Set<string>();

    const frames: ExecutionFrame<ArticulationPointsState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Articulation Points detection for ${nodes.length} vertices and ${edges.length} edges.`,
      variables: { totalNodes: nodes.length, totalEdges: edges.length },
      callStack: [{ name: 'findArticulationPoints()', params: { n: nodes.length }, line: 2, isCurrent: true }],
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: {},
        low: {},
        cutVertices: [],
      },
    });

    function dfs(u: string, parent: string | null) {
      timer++;
      disc[u] = timer;
      low[u] = timer;
      let children = 0;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Visit "${u}" (parent: ${parent ?? 'none'}). Set disc[${u}]=${disc[u]}, low[${u}]=${low[u]}.`,
        variables: { node: u, disc: disc[u], low: low[u], parent: parent ?? 'null' },
        callStack: [{ name: `dfs(u="${u}")`, params: { u, parent: parent ?? 'null' }, line: 4, isCurrent: true }],
        state: {
          nodes,
          edges,
          activeNode: u,
          activeNeighbor: null,
          disc: { ...disc },
          low: { ...low },
          cutVertices: Array.from(cutVertices),
        },
      });

      for (const v of adj[u] || []) {
        if (v === parent) continue;

        if (disc[v] !== undefined) {
          low[u] = Math.min(low[u], disc[v]);
        } else {
          children++;
          dfs(v, u);

          low[u] = Math.min(low[u], low[v]);

          if (parent !== null && low[v] >= disc[u]) {
            cutVertices.add(u);
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 9,
              explanation: `Non-root cut condition satisfied for "${u}"! low[${v}]=${low[v]} >= disc[${u}]=${disc[u]} -> "${u}" is an Articulation Point!`,
              variables: { cutVertex: u, child: v, lowChild: low[v], discU: disc[u] },
              callStack: [{ name: `cutVertexFound(${u})`, params: { u, v }, line: 9, isCurrent: true }],
              state: {
                nodes,
                edges,
                activeNode: u,
                activeNeighbor: v,
                disc: { ...disc },
                low: { ...low },
                cutVertices: Array.from(cutVertices),
              },
            });
          }
        }
      }

      if (parent === null && children > 1) {
        cutVertices.add(u);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          explanation: `Root cut condition satisfied for "${u}"! Root has ${children} independent children in DFS tree -> "${u}" is an Articulation Point!`,
          variables: { rootCutVertex: u, childrenCount: children },
          callStack: [{ name: `rootCutFound(${u})`, params: { u, children }, line: 12, isCurrent: true }],
          state: {
            nodes,
            edges,
            activeNode: u,
            activeNeighbor: null,
            disc: { ...disc },
            low: { ...low },
            cutVertices: Array.from(cutVertices),
          },
        });
      }
    }

    for (const n of nodes) {
      if (disc[n] === undefined) dfs(n, null);
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `Articulation Points detection complete! Identified ${cutVertices.size} cut vertex/vertices: ${
        cutVertices.size > 0 ? Array.from(cutVertices).join(', ') : 'None (Biconnected)'
      }.`,
      variables: { totalCutVertices: cutVertices.size, cutVertices: Array.from(cutVertices).join(', ') },
      callStack: [{ name: 'complete()', params: { count: cutVertices.size }, line: 15, isCurrent: true }],
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: { ...disc },
        low: { ...low },
        cutVertices: Array.from(cutVertices),
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ArticulationPointsState>) => {
    const { nodes, edges, activeNode, disc, low, cutVertices } = frame.state;

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
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Vertices: <strong className="text-white">{nodes.length}</strong> | Edges:{' '}
              <strong className="text-white">{edges.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-400">
              Cut Vertices: <strong className="text-white">{cutVertices.length}</strong>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300">
            Articulation Points:{' '}
            <strong className="text-amber-400">
              {cutVertices.length > 0 ? cutVertices.join(', ') : 'None'}
            </strong>
          </div>
        </div>

        {/* Undirected Graph SVG */}
        <div className="w-full h-80 relative rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden my-auto flex items-center justify-center">
          <svg viewBox="0 0 500 360" className="w-full h-full">
            {edges.map((e, idx) => {
              const uPos = coords[e.u];
              const vPos = coords[e.v];
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
                />
              );
            })}

            {nodes.map((n) => {
              const pos = coords[n];
              if (!pos) return null;
              const isCurrent = n === activeNode;
              const isCut = cutVertices.includes(n);
              const hasDisc = disc[n] !== undefined;

              return (
                <g key={n} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r="22"
                    fill={isCut ? '#f59e0b22' : isCurrent ? '#06b6d422' : '#0f172a'}
                    stroke={isCut ? '#f59e0b' : isCurrent ? '#06b6d4' : hasDisc ? '#38bdf8' : '#334155'}
                    strokeWidth={isCut ? 3.5 : isCurrent ? 3 : 2}
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
                      className="text-[9px] font-mono fill-slate-400"
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
    );
  },
};
