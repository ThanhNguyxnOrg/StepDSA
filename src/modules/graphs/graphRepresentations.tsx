import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface GraphRepNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface GraphRepEdge {
  u: number;
  v: number;
  weight: number;
}

export interface GraphRepresentationsState {
  nodes: GraphRepNode[];
  edges: GraphRepEdge[];
  activeRepresentation: 'all' | 'matrix' | 'list' | 'edgeList';
  activeU: number | null;
  activeV: number | null;
  activeEdgeIdx: number | null;
  message: string;
}

export const graphRepresentationsModule: AlgorithmModule<
  {
    numVertices: number;
    edges: { u: number; v: number; weight: number }[];
    queries: { type: 'hasEdge' | 'getNeighbors'; u: number; v?: number }[];
  },
  GraphRepresentationsState
> = {
  id: 'graph-representations',
  title: 'Graph Representations (Adjacency Matrix, Adjacency List & Edge List)',
  category: 'graphs',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1) edge lookup (Matrix) / O(deg(u)) neighbors (List)',
    timeAverage: 'Matrix O(1) query, List O(V + E) traversal, Edge List O(E)',
    timeWorst: 'Matrix O(V^2) space, List O(V + E) space, Edge List O(E) space',
    spaceAuxiliary: 'Matrix O(V^2) bits/words; List O(V + E); Edge List O(E)',
    worstCaseCondition: 'Dense graphs (E ~ V^2) favor Matrix; Sparse graphs (E << V^2) favor Adjacency List',
  },
  theory: {
    overview:
      'Graphs are computationally represented using three primary data structures: (1) Adjacency Matrix (V x V table for O(1) edge lookups), (2) Adjacency List (dynamic neighbor buckets for optimal O(V+E) traversals), and (3) Edge List (flat array of (u, v, w) tuples optimal for Kruskal and Bellman-Ford).',
    whyItWorks:
      'Selecting the correct graph representation is a fundamental space-time trade-off. An Adjacency Matrix wastes O(V^2) memory on sparse road networks or social graphs, whereas an Adjacency List provides cache-friendly O(deg(u)) neighbor iteration.',
    invariant:
      'Structural Equivalence Invariant: For all vertex pairs (u, v): Matrix[u][v] == w <=> (v, w) in List[u] <=> (u, v, w) in EdgeList.',
    pitfalls: [
      'Using Adjacency Matrix on graphs with V > 10^5 causes Out-Of-Memory (O(V^2) = 10^10 cells).',
      'Forgetting that undirected graphs require symmetric entries in Matrix (M[u][v] = M[v][u]) and duplicate directed entries in Adjacency Lists.',
    ],
  },
  defaultInput: {
    numVertices: 5,
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 2, weight: 2 },
      { u: 1, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 5 },
      { u: 2, v: 3, weight: 8 },
      { u: 2, v: 4, weight: 10 },
      { u: 3, v: 4, weight: 2 },
    ],
    queries: [
      { type: 'hasEdge', u: 0, v: 2 },
      { type: 'hasEdge', u: 0, v: 3 },
      { type: 'getNeighbors', u: 2 },
      { type: 'getNeighbors', u: 3 },
    ],
  },
  presets: [
    {
      id: 'sparse-road-network',
      label: 'Sparse Road Network (V=5, E=4)',
      description: 'Sparse connectivity optimal for Adjacency List representation',
      data: {
        numVertices: 5,
        edges: [
          { u: 0, v: 1, weight: 3 },
          { u: 1, v: 2, weight: 7 },
          { u: 2, v: 3, weight: 2 },
          { u: 3, v: 4, weight: 6 },
        ],
        queries: [
          { type: 'hasEdge', u: 1, v: 3 },
          { type: 'getNeighbors', u: 2 },
        ],
      },
    },
    {
      id: 'dense-complete-graph',
      label: 'Dense Complete Graph (K4)',
      description: 'Fully connected 4-vertex clique ideal for Adjacency Matrix testing',
      data: {
        numVertices: 4,
        edges: [
          { u: 0, v: 1, weight: 1 },
          { u: 0, v: 2, weight: 2 },
          { u: 0, v: 3, weight: 3 },
          { u: 1, v: 2, weight: 4 },
          { u: 1, v: 3, weight: 5 },
          { u: 2, v: 3, weight: 6 },
        ],
        queries: [
          { type: 'hasEdge', u: 0, v: 3 },
          { type: 'getNeighbors', u: 1 },
        ],
      },
    },
  ],
  codeSnippets: {
    cpp: `// 1. Adjacency Matrix: O(V^2) space, O(1) query
int adjMatrix[V][V];
bool hasEdge(int u, int v) { return adjMatrix[u][v] != 0; }

// 2. Adjacency List: O(V + E) space, O(deg(u)) iteration
vector<pair<int, int>> adjList[V];
void addEdge(int u, int v, int w) {
    adjList[u].push_back({v, w});
    adjList[v].push_back({u, w});
}

// 3. Edge List: O(E) space, optimal for Kruskal
struct Edge { int u, v, w; };
vector<Edge> edgeList;`,
    python: `# 1. Adjacency Matrix
adj_matrix = [[0] * V for _ in range(V)]

# 2. Adjacency List
adj_list = {i: [] for i in range(V)}
def add_edge(u, v, w):
    adj_list[u].append((v, w))
    adj_list[v].append((u, w))

# 3. Edge List
edge_list = [(u, v, w) for u, v, w in edges]`,
    typescript: `// 1. Adjacency Matrix (V x V)
const matrix: number[][] = Array.from({ length: V }, () => Array(V).fill(0));

// 2. Adjacency List
const adjList: Map<number, { to: number; weight: number }[]> = new Map();

// 3. Edge List
interface Edge { u: number; v: number; weight: number; }
const edgeList: Edge[] = [];`,
    java: `// 1. Adjacency Matrix
int[][] matrix = new int[V][V];

// 2. Adjacency List
List<List<Edge>> adjList = new ArrayList<>();
for (int i = 0; i < V; i++) adjList.add(new ArrayList<>());

// 3. Edge List
record Edge(int u, int v, int w) {}
List<Edge> edgeList = new ArrayList<>();`,
    pseudocode: `Matrix[u][v] <- weight
List[u].append((v, weight))
EdgeList.append((u, v, weight))`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<GraphRepresentationsState>[] = [];
    const V = input.numVertices;
    const rawEdges = input.edges;

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: GraphRepresentationsState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    const nodes: GraphRepNode[] = Array.from({ length: V }, (_, i) => {
      const angle = (2 * Math.PI * i) / V - Math.PI / 2;
      return {
        id: i,
        label: `V${i}`,
        x: 180 + 110 * Math.cos(angle),
        y: 150 + 110 * Math.sin(angle),
      };
    });

    const edges: GraphRepEdge[] = rawEdges.map((e) => ({ ...e }));

    addFrame(
      1,
      `Initialized Graph with ${V} vertices and ${edges.length} edges. Inspecting representations.`,
      {
        nodes,
        edges,
        activeRepresentation: 'all',
        activeU: null,
        activeV: null,
        activeEdgeIdx: null,
        message: `Graph initialized: Matrix footprint = ${V * V} entries. List footprint = ${V} headers + ${edges.length * 2} items.`,
      },
      {
        action: 'INIT',
        variables: { numVertices: V, numEdges: edges.length, matrixCells: V * V },
        callStack: [{ name: 'initGraph', params: { V, E: edges.length } }],
      }
    );

    // Step 1: Step through edge insertions across all 3 representations
    for (let eIdx = 0; eIdx < edges.length; eIdx++) {
      const e = edges[eIdx];
      addFrame(
        1,
        `[Insert Edge #${eIdx + 1}] Adding edge (${e.u} <-> ${e.v}, weight=${e.weight}): Matrix updates M[${e.u}][${e.v}] = M[${e.v}][${e.u}] = ${e.weight}. List appends to List[${e.u}] and List[${e.v}]. EdgeList appends tuple.`,
        {
          nodes,
          edges,
          activeRepresentation: 'all',
          activeU: e.u,
          activeV: e.v,
          activeEdgeIdx: eIdx,
          message: `Inserted edge (${e.u}, ${e.v}, w=${e.weight}) into Matrix, List, and EdgeList.`,
        },
        {
          action: 'INSERT_EDGE',
          variables: { edgeIndex: eIdx, u: e.u, v: e.v, weight: e.weight },
          callStack: [{ name: 'addEdge', params: { u: e.u, v: e.v, weight: e.weight } }],
        }
      );
    }

    // Execute queries with step-by-step comparison
    for (let qIdx = 0; qIdx < input.queries.length; qIdx++) {
      const q = input.queries[qIdx];
      if (q.type === 'hasEdge' && q.v !== undefined) {
        const u = q.u;
        const v = q.v;
        const foundEdge = edges.find((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u));
        const edgeIdx = edges.findIndex((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u));

        // Sub-step A: Matrix direct cell check O(1)
        addFrame(
          3,
          `Query hasEdge(${u}, ${v}) via Adjacency Matrix: Direct cell indexing M[${u}][${v}] in O(1) time. Cell value is ${foundEdge ? foundEdge.weight : 0}.`,
          {
            nodes,
            edges,
            activeRepresentation: 'matrix',
            activeU: u,
            activeV: v,
            activeEdgeIdx: edgeIdx >= 0 ? edgeIdx : null,
            message: `Matrix[${u}][${v}] = ${foundEdge ? foundEdge.weight : 0} (${foundEdge ? 'Edge Present' : 'No Edge'}). Fast O(1) lookup!`,
          },
          {
            action: 'QUERY_MATRIX_EDGE',
            variables: { u, v, representation: 'matrix', exists: !!foundEdge, lookupTime: 'O(1)' },
            callStack: [{ name: 'matrixHasEdge', params: { u, v } }],
          }
        );

        // Sub-step B: List sequential scan O(deg(u))
        addFrame(
          4,
          `Query hasEdge(${u}, ${v}) via Adjacency List: Sequentially iterates through linked list at List[${u}] in O(deg(${u})) time to locate neighbor ${v}.`,
          {
            nodes,
            edges,
            activeRepresentation: 'list',
            activeU: u,
            activeV: v,
            activeEdgeIdx: edgeIdx >= 0 ? edgeIdx : null,
            message: `List[${u}] search for ${v}: ${foundEdge ? 'Found target neighbor node' : 'Target neighbor not in list'}.`,
          },
          {
            action: 'QUERY_LIST_EDGE',
            variables: { u, v, representation: 'list', exists: !!foundEdge, lookupTime: `O(deg(${u}))` },
            callStack: [{ name: 'listHasEdge', params: { u, v } }],
          }
        );
      } else if (q.type === 'getNeighbors') {
        const u = q.u;
        const neighbors = edges
          .filter((e) => e.u === u || e.v === u)
          .map((e) => (e.u === u ? { neighbor: e.v, weight: e.weight } : { neighbor: e.u, weight: e.weight }));

        // Sub-step A: Matrix scanning row u O(V)
        addFrame(
          7,
          `Query getNeighbors(${u}) via Adjacency Matrix: Must scan all ${V} columns in row M[${u}][*] in O(V) time to collect non-zero entries.`,
          {
            nodes,
            edges,
            activeRepresentation: 'matrix',
            activeU: u,
            activeV: null,
            activeEdgeIdx: null,
            message: `Matrix row ${u} scan: Checked ${V} entries, found ${neighbors.length} non-zero cells.`,
          },
          {
            action: 'MATRIX_GET_NEIGHBORS',
            variables: { u, representation: 'matrix', scannedCells: V, time: `O(${V})` },
            callStack: [{ name: 'matrixGetNeighbors', params: { u, scanned: V } }],
          }
        );

        // Sub-step B: List scanning directly in O(deg(u))
        addFrame(
          8,
          `Query getNeighbors(${u}) via Adjacency List: Scans only the ${neighbors.length} existing neighbors in List[${u}] in optimal O(deg(${u})) = O(${neighbors.length}) time.`,
          {
            nodes,
            edges,
            activeRepresentation: 'list',
            activeU: u,
            activeV: null,
            activeEdgeIdx: null,
            message: `List[${u}] contains ${neighbors.length} adjacent endpoints: ${neighbors.map((n) => `V${n.neighbor}(w=${n.weight})`).join(', ')}.`,
          },
          {
            action: 'LIST_GET_NEIGHBORS',
            variables: { u, representation: 'list', degree: neighbors.length, time: `O(${neighbors.length})` },
            callStack: [{ name: 'listGetNeighbors', params: { u, degree: neighbors.length } }],
          }
        );
      }
    }

    addFrame(
      14,
      `Representation analysis complete! Tradeoff summary: Matrix provides O(1) edge lookup at O(V^2) memory. List provides optimal O(V+E) memory and fast iteration. EdgeList is ideal for Kruskal's MST.`,
      {
        nodes,
        edges,
        activeRepresentation: 'all',
        activeU: null,
        activeV: null,
        activeEdgeIdx: null,
        message: `Analysis summary: Matrix: O(1) lookup, O(V^2) space. List: O(deg(u)) iteration, O(V+E) space. EdgeList: O(E) space.`,
      },
      {
        action: 'COMPLETE',
        variables: { V, E: edges.length, matrixSpace: `O(${V * V})`, listSpace: `O(${V}+${edges.length * 2})` },
        callStack: [{ name: 'complete', params: { V, E: edges.length } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<GraphRepresentationsState>) => {
    const { nodes, edges, activeU, activeV, activeEdgeIdx, message } = frame.state;
    const V = nodes.length;

    // Build matrix
    const matrix: (number | null)[][] = Array.from({ length: V }, () => Array(V).fill(null));
    edges.forEach((e) => {
      matrix[e.u][e.v] = e.weight;
      matrix[e.v][e.u] = e.weight;
    });

    // Build adjacency list
    const adjList: { to: number; weight: number }[][] = Array.from({ length: V }, () => []);
    edges.forEach((e) => {
      adjList[e.u].push({ to: e.v, weight: e.weight });
      adjList[e.v].push({ to: e.u, weight: e.weight });
    });

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Multi-Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Panel 1: Graph Topology SVG */}
          <div className="flex flex-col items-center p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Graph Topology (V={V}, E={edges.length})
            </span>
            <svg className="w-full h-72 border border-slate-800/80 rounded-lg bg-slate-950/60">
              {/* Edges */}
              {edges.map((e, idx) => {
                const uNode = nodes[e.u];
                const vNode = nodes[e.v];
                const isEdgeActive =
                  idx === activeEdgeIdx ||
                  (activeU !== null && activeV !== null && ((e.u === activeU && e.v === activeV) || (e.u === activeV && e.v === activeU)));

                const strokeColor = isEdgeActive ? '#fbbf24' : '#475569';
                const strokeWidth = isEdgeActive ? 3.5 : 1.5;

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={uNode.x}
                      y1={uNode.y}
                      x2={vNode.x}
                      y2={vNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                    <rect
                      x={(uNode.x + vNode.x) / 2 - 12}
                      y={(uNode.y + vNode.y) / 2 - 9}
                      width={24}
                      height={18}
                      rx={4}
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth={1}
                    />
                    <text
                      x={(uNode.x + vNode.x) / 2}
                      y={(uNode.y + vNode.y) / 2 + 4}
                      textAnchor="middle"
                      fill={isEdgeActive ? '#fef08a' : '#94a3b8'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {e.weight}
                    </text>
                  </g>
                );
              })}

              {/* Vertices */}
              {nodes.map((node) => {
                const isActive = node.id === activeU || node.id === activeV;
                return (
                  <g key={`node-${node.id}`}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={18}
                      fill={isActive ? '#0284c7' : '#1e293b'}
                      stroke={isActive ? '#38bdf8' : '#64748b'}
                      strokeWidth={isActive ? 3 : 1.5}
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={isActive ? '#ffffff' : '#e2e8f0'}
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Panel 2: Adjacency Matrix */}
          <div className="flex flex-col items-center p-4 bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Adjacency Matrix (Dense V x V)
            </span>
            <div className="grid gap-1 font-mono text-xs">
              {/* Header row */}
              <div className="flex gap-1 items-center">
                <div className="w-8 h-8 flex items-center justify-center text-slate-500 font-bold" />
                {nodes.map((n) => (
                  <div
                    key={`col-${n.id}`}
                    className={`w-8 h-8 flex items-center justify-center font-bold rounded ${
                      n.id === activeV ? 'bg-cyan-900/80 text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    V{n.id}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {nodes.map((r) => (
                <div key={`row-${r.id}`} className="flex gap-1 items-center">
                  <div
                    className={`w-8 h-8 flex items-center justify-center font-bold rounded ${
                      r.id === activeU ? 'bg-cyan-900/80 text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    V{r.id}
                  </div>
                  {nodes.map((c) => {
                    const val = matrix[r.id][c.id];
                    const isCellTarget =
                      (r.id === activeU && c.id === activeV) || (r.id === activeV && c.id === activeU);

                    return (
                      <div
                        key={`cell-${r.id}-${c.id}`}
                        className={`w-8 h-8 rounded flex items-center justify-center border font-bold ${
                          isCellTarget
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                            : val !== null
                            ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                            : 'bg-slate-900/40 border-slate-800 text-slate-600'
                        }`}
                      >
                        {val !== null ? val : 0}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Split: Adjacency List & Edge List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Adjacency List */}
          <div className="flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Adjacency List (Sparse V + E Buckets)
            </span>
            <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
              {adjList.map((neighbors, u) => {
                const isSelectedU = u === activeU;
                return (
                  <div
                    key={`adj-${u}`}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                      isSelectedU
                        ? 'bg-cyan-950/40 border-cyan-500/60'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <span className="w-10 font-bold text-cyan-400">V{u} →</span>
                    <div className="flex flex-wrap gap-1.5">
                      {neighbors.length > 0 ? (
                        neighbors.map((nb, i) => (
                          <span
                            key={`nb-${u}-${i}`}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                          >
                            V{nb.to} <span className="text-amber-400 font-semibold">(w={nb.weight})</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 italic">empty</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edge List */}
          <div className="flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Edge List (Flat Array of Triples for Sorting)
            </span>
            <div className="flex flex-wrap gap-2 font-mono text-xs max-h-48 overflow-y-auto p-1">
              {edges.map((e, idx) => {
                const isEdgeMatch =
                  idx === activeEdgeIdx ||
                  (activeU !== null && activeV !== null && ((e.u === activeU && e.v === activeV) || (e.u === activeV && e.v === activeU)));

                return (
                  <div
                    key={`edge-item-${idx}`}
                    className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${
                      isEdgeMatch
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 font-bold">#{idx}</span>
                    <span>
                      ({e.u}, {e.v})
                    </span>
                    <span className="text-emerald-400 font-bold">w={e.weight}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
