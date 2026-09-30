import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface GraphEdge {
  u: number;
  v: number;
  weight: number;
}

export interface BoruvkaState {
  vertices: number[];
  edges: GraphEdge[];
  mstEdges: GraphEdge[];
  cheapestEdges: GraphEdge[];
  componentMap: Record<number, number>;
  componentCount: number;
  phase: number;
  totalWeight: number;
}

export const boruvkaMSTModule: AlgorithmModule<
  { vertices: number[]; edges: GraphEdge[] },
  BoruvkaState
> = {
  id: 'boruvka-mst',
  title: "Boruvka's Algorithm (Parallel Component Contraction MST O(E log V))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(E log V)',
    timeAverage: 'O(E log V)',
    timeWorst: 'O(E log V)',
    spaceAuxiliary: 'O(V + E) component arrays and disjoint set structures',
    worstCaseCondition: 'Strictly O(E log V) across all connected undirected graphs with unique edge weights',
  },
  theory: {
    overview:
      "Invented in 1926 by Otakar Borůvka, this is the oldest known Minimum Spanning Tree algorithm. Designed for electrical network efficiency in Moravia, it contracts graph components in parallel phases.",
    whyItWorks:
      'In each phase, every connected component independently and concurrently identifies its cheapest incident edge crossing to a different component. Adding these edges contracts components, cutting total component count by at least half each phase (guaranteeing at most log2 V rounds).',
    invariant:
      'Cut Property Invariant: The lightest edge crossing any cut of a connected graph strictly belongs to the Minimum Spanning Tree. Parallel selection guarantees no cycle formation provided edge weights are distinct.',
    pitfalls: [
      'Duplicate edge weights causing cycle creation when two components pick opposing edges; resolved by tie-breaking via unique edge IDs.',
      'Failing to stop when the graph is disconnected into multiple spanning forests.',
    ],
  },
  presets: [
    {
      id: 'boruvka-classic-6v',
      label: '6-Vertex Parallel Contraction',
      description: 'Classic 6-vertex mesh demonstrating 2-round full MST contraction',
      data: {
        vertices: [1, 2, 3, 4, 5, 6],
        edges: [
          { u: 1, v: 2, weight: 4 },
          { u: 1, v: 3, weight: 2 },
          { u: 2, v: 3, weight: 1 },
          { u: 2, v: 4, weight: 5 },
          { u: 3, v: 4, weight: 8 },
          { u: 3, v: 5, weight: 10 },
          { u: 4, v: 5, weight: 2 },
          { u: 4, v: 6, weight: 6 },
          { u: 5, v: 6, weight: 3 },
        ],
      },
    },
    {
      id: 'boruvka-ring-5v',
      label: '5-Vertex Ring Network',
      description: 'Ring graph showing simultaneous parallel candidate selection',
      data: {
        vertices: [1, 2, 3, 4, 5],
        edges: [
          { u: 1, v: 2, weight: 3 },
          { u: 2, v: 3, weight: 7 },
          { u: 3, v: 4, weight: 2 },
          { u: 4, v: 5, weight: 8 },
          { u: 5, v: 1, weight: 4 },
          { u: 1, v: 3, weight: 5 },
        ],
      },
    },
  ],
  defaultInput: {
    vertices: [1, 2, 3, 4, 5, 6],
    edges: [
      { u: 1, v: 2, weight: 4 },
      { u: 1, v: 3, weight: 2 },
      { u: 2, v: 3, weight: 1 },
      { u: 2, v: 4, weight: 5 },
      { u: 3, v: 4, weight: 8 },
      { u: 3, v: 5, weight: 10 },
      { u: 4, v: 5, weight: 2 },
      { u: 4, v: 6, weight: 6 },
      { u: 5, v: 6, weight: 3 },
    ],
  },
  codeSnippets: {
    cpp: `struct Edge { int u, v, w; };

void boruvkaMST(int V, vector<Edge>& edges) {
    DSU dsu(V);
    int numComponents = V;
    vector<Edge> mst;

    while (numComponents > 1) {
        vector<int> cheapest(V + 1, -1);
        for (int i = 0; i < edges.size(); i++) {
            int setU = dsu.find(edges[i].u);
            int setV = dsu.find(edges[i].v);
            if (setU != setV) {
                if (cheapest[setU] == -1 || edges[i].w < edges[cheapest[setU]].w) cheapest[setU] = i;
                if (cheapest[setV] == -1 || edges[i].w < edges[cheapest[setV]].w) cheapest[setV] = i;
            }
        }
        for (int i = 1; i <= V; i++) {
            if (cheapest[i] != -1) {
                int u = edges[cheapest[i]].u, v = edges[cheapest[i]].v;
                if (dsu.unite(u, v)) {
                    mst.push_back(edges[cheapest[i]]);
                    numComponents--;
                }
            }
        }
    }
}`,
    python: `def boruvka_mst(vertices, edges):
    dsu = DSU(vertices)
    num_components = len(vertices)
    mst = []

    while num_components > 1:
        cheapest = {}
        for e in edges:
            set_u, set_v = dsu.find(e.u), dsu.find(e.v)
            if set_u != set_v:
                if set_u not in cheapest or e.weight < cheapest[set_u].weight: cheapest[set_u] = e
                if set_v not in cheapest or e.weight < cheapest[set_v].weight: cheapest[set_v] = e
        for e in set(cheapest.values()):
            if dsu.unite(e.u, e.v):
                mst.append(e)
                num_components -= 1
    return mst`,
    typescript: `function boruvkaMST(vertices: number[], edges: Edge[]): Edge[] {
  const dsu = new DSU(vertices);
  let numComponents = vertices.length;
  const mst: Edge[] = [];

  while (numComponents > 1) {
    const cheapest: Record<number, Edge> = {};
    for (const e of edges) {
      const uSet = dsu.find(e.u), vSet = dsu.find(e.v);
      if (uSet !== vSet) {
        if (!cheapest[uSet] || e.weight < cheapest[uSet].weight) cheapest[uSet] = e;
        if (!cheapest[vSet] || e.weight < cheapest[vSet].weight) cheapest[vSet] = e;
      }
    }
    for (const e of Object.values(cheapest)) {
      if (dsu.union(e.u, e.v)) {
        mst.push(e);
        numComponents--;
      }
    }
  }
  return mst;
}`,
    java: `public List<Edge> boruvkaMST(int V, List<Edge> edges) {
    DSU dsu = new DSU(V);
    int numComponents = V;
    List<Edge> mst = new ArrayList<>();
    while (numComponents > 1) {
        // Find cheapest crossing edge per component and contract
    }
    return mst;
}`,
    pseudocode: `function boruvka(G):
    while numComponents > 1:
        for each component C:
            find cheapest edge (u, v) crossing from C to another component
        for each selected edge:
            add to MST and union components in DSU`,
  },
  generateTimeline: (input: {
    vertices: number[];
    edges: GraphEdge[];
  }): ExecutionFrame<BoruvkaState>[] => {
    const vertices = input?.vertices?.length ? input.vertices : [1, 2, 3, 4, 5, 6];
    const edges = input?.edges?.length
      ? input.edges
      : [
          { u: 1, v: 2, weight: 4 },
          { u: 1, v: 3, weight: 2 },
          { u: 2, v: 3, weight: 1 },
          { u: 2, v: 4, weight: 5 },
          { u: 4, v: 5, weight: 2 },
        ];

    // DSU implementation
    const parent: Record<number, number> = {};
    for (const v of vertices) parent[v] = v;

    function find(i: number): number {
      if (parent[i] === i) return i;
      parent[i] = find(parent[i]);
      return parent[i];
    }

    function union(i: number, j: number): boolean {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
        return true;
      }
      return false;
    }

    function getComponentMap(): Record<number, number> {
      const map: Record<number, number> = {};
      for (const v of vertices) map[v] = find(v);
      return map;
    }

    function countComponents(): number {
      const sets = new Set<number>();
      for (const v of vertices) sets.add(find(v));
      return sets.size;
    }

    const mstEdges: GraphEdge[] = [];
    const frames: ExecutionFrame<BoruvkaState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        vertices,
        edges,
        mstEdges: [],
        cheapestEdges: [],
        componentMap: getComponentMap(),
        componentCount: vertices.length,
        phase: 0,
        totalWeight: 0,
      },
      callStack: [{ name: 'boruvkaInit', params: { vertexCount: vertices.length, edgeCount: edges.length } }],
      variables: { vertices: vertices.length, edges: edges.length, initialComponents: vertices.length },
      explanation: `Initialized Borůvka's algorithm with ${vertices.length} disconnected components.`,
    });

    let phase = 0;
    while (countComponents() > 1) {
      phase++;
      const cheapest: Record<number, GraphEdge> = {};

      for (const e of edges) {
        const uSet = find(e.u);
        const vSet = find(e.v);

        if (uSet !== vSet) {
          if (!cheapest[uSet] || e.weight < cheapest[uSet].weight) {
            cheapest[uSet] = e;
          }
          if (!cheapest[vSet] || e.weight < cheapest[vSet].weight) {
            cheapest[vSet] = e;
          }
        }
      }

      const candidateEdges = Object.values(cheapest);
      if (candidateEdges.length === 0) break; // Graph disconnected

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 12,
        action: 'PHASE_CHEAPEST_FOUND',
        state: {
          vertices,
          edges,
          mstEdges: [...mstEdges],
          cheapestEdges: [...candidateEdges],
          componentMap: getComponentMap(),
          componentCount: countComponents(),
          phase,
          totalWeight: mstEdges.reduce((acc, e) => acc + e.weight, 0),
        },
        callStack: [{ name: 'parallelSelect', params: { phase, candidates: candidateEdges.length } }],
        variables: { phase, candidatesCount: candidateEdges.length, componentsBefore: countComponents() },
        explanation: `Phase ${phase}: Parallel scan identified ${candidateEdges.length} cheapest crossing edges for active components.`,
      });

      for (const e of candidateEdges) {
        if (union(e.u, e.v)) {
          mstEdges.push(e);
        }
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 20,
        action: 'PHASE_CONTRACTED',
        state: {
          vertices,
          edges,
          mstEdges: [...mstEdges],
          cheapestEdges: [],
          componentMap: getComponentMap(),
          componentCount: countComponents(),
          phase,
          totalWeight: mstEdges.reduce((acc, e) => acc + e.weight, 0),
        },
        callStack: [{ name: 'contractComponents', params: { phase, remainingComponents: countComponents() } }],
        variables: { phase, newComponentCount: countComponents(), mstSize: mstEdges.length },
        explanation: `Phase ${phase} complete: Contracted components. Remaining components: ${countComponents()}. Total MST weight: ${mstEdges.reduce(
          (acc, e) => acc + e.weight,
          0
        )}.`,
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 28,
      action: 'COMPLETE',
      state: {
        vertices,
        edges,
        mstEdges: [...mstEdges],
        cheapestEdges: [],
        componentMap: getComponentMap(),
        componentCount: countComponents(),
        phase,
        totalWeight: mstEdges.reduce((acc, e) => acc + e.weight, 0),
      },
      callStack: [{ name: 'complete', params: { totalWeight: mstEdges.reduce((acc, e) => acc + e.weight, 0) } }],
      variables: { completed: true, mstEdges: mstEdges.length, totalWeight: mstEdges.reduce((acc, e) => acc + e.weight, 0) },
      explanation: `Borůvka's algorithm finished. MST constructed with ${mstEdges.length} edges and total weight ${mstEdges.reduce(
        (acc, e) => acc + e.weight,
        0
      )}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<BoruvkaState>) => {
    const { vertices, edges, mstEdges, cheapestEdges, componentMap, phase, totalWeight } =
      frame.state;

    // Node layout in circular ring
    const radius = 110;
    const centerX = 300;
    const centerY = 160;

    const coords: Record<number, { x: number; y: number }> = {};
    vertices.forEach((v, idx) => {
      const angle = (idx * 2 * Math.PI) / vertices.length - Math.PI / 2;
      coords[v] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Unique colors for component IDs
    const componentColors = [
      '#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa', '#fb923c', '#4ade80'
    ];

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Phase:</span>
            <span className="font-mono text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded">
              Round {phase}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>MST Edges: <strong className="text-emerald-400">{mstEdges.length}</strong></span>
            <span>Total Weight: <strong className="text-amber-400 text-sm">{totalWeight}</strong></span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[340px] flex items-center justify-center">
          <svg className="w-[600px] h-[320px]" viewBox="0 0 600 320">
            {/* Draw Edges */}
            {edges.map((e, idx) => {
              const uCoord = coords[e.u];
              const vCoord = coords[e.v];
              if (!uCoord || !vCoord) return null;

              const isMST = mstEdges.some(
                (me) => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u)
              );
              const isCheapest = cheapestEdges.some(
                (ce) => (ce.u === e.u && ce.v === e.v) || (ce.u === e.v && ce.v === e.u)
              );

              let stroke = '#334155';
              let strokeWidth = '1.5';
              let strokeDasharray = undefined as any;

              if (isMST) {
                stroke = '#10b981';
                strokeWidth = '3.5';
              } else if (isCheapest) {
                stroke = '#f59e0b';
                strokeWidth = '3';
                strokeDasharray = '4 2';
              }

              const midX = (uCoord.x + vCoord.x) / 2;
              const midY = (uCoord.y + vCoord.y) / 2;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={uCoord.x}
                    y1={uCoord.y}
                    x2={vCoord.x}
                    y2={vCoord.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    className="transition-all duration-300"
                  />
                  <rect
                    x={midX - 12}
                    y={midY - 10}
                    width="24"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={stroke}
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={isMST ? '#34d399' : isCheapest ? '#fbbf24' : '#94a3b8'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Draw Vertices */}
            {vertices.map((v) => {
              const coord = coords[v];
              if (!coord) return null;
              const rootSet = componentMap[v] ?? v;
              const compColor = componentColors[rootSet % componentColors.length];

              return (
                <g key={`v-${v}`} className="transition-all duration-300">
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="18"
                    fill="#1e293b"
                    stroke={compColor}
                    strokeWidth="3"
                  />
                  <text
                    x={coord.x}
                    y={coord.y + 5}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {v}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
