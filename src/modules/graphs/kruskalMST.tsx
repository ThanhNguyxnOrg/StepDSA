import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface KruskalNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface KruskalEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  status: 'unprocessed' | 'evaluating' | 'accepted' | 'rejected';
}

export interface KruskalMSTState {
  nodes: KruskalNode[];
  edges: KruskalEdge[];
  sortedEdges: { id: string; from: string; to: string; weight: number }[];
  currentEdgeId: string | null;
  dsuParent: Record<string, string>;
  dsuRank: Record<string, number>;
  mstWeight: number;
  mstEdgeCount: number;
  cycleDetected: boolean;
}

export interface KruskalGraphInput {
  nodes: KruskalNode[];
  edges: { from: string; to: string; weight: number }[];
}

const defaultKruskalGraph: KruskalGraphInput = {
  nodes: [
    { id: 'A', label: 'A', x: 100, y: 80 },
    { id: 'B', label: 'B', x: 260, y: 60 },
    { id: 'C', label: 'C', x: 420, y: 80 },
    { id: 'D', label: 'D', x: 100, y: 220 },
    { id: 'E', label: 'E', x: 260, y: 240 },
    { id: 'F', label: 'F', x: 420, y: 220 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 3 },
    { from: 'B', to: 'D', weight: 2 },
    { from: 'B', to: 'E', weight: 3 },
    { from: 'B', to: 'C', weight: 5 },
    { from: 'C', to: 'F', weight: 6 },
    { from: 'D', to: 'E', weight: 7 },
    { from: 'E', to: 'F', weight: 4 },
    { from: 'C', to: 'E', weight: 1 },
  ],
};

export const kruskalMSTModule: AlgorithmModule<KruskalGraphInput, KruskalMSTState> = {
  id: 'kruskal-mst',
  title: "Kruskal's MST (Disjoint Set Union)",
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(E log E)',
    timeAverage: 'O(E log E) or O(E log V)',
    timeWorst: 'O(E log E)',
    spaceAuxiliary: 'O(V + E)',
    worstCaseCondition: 'Dense graphs where E ≈ V², sorting dominates runtime',
  },
  theory: {
    overview:
      "Kruskal's algorithm finds a Minimum Spanning Tree (MST) for a connected, weighted undirected graph. It sorts all edges by weight in ascending order and greedily adds each edge if and only if it connects two previously disconnected components, using Disjoint Set Union (DSU / Union-Find) to detect cycles in nearly O(1) amortized time.",
    whyItWorks:
      'By the Cut Property and Greedy Choice Property of Spanning Trees, the minimum weight edge spanning any valid cut of vertices must be part of some MST. Sorting guarantees we always consider the globally cheapest valid edge next.',
    invariant:
      'At any step, the set of accepted edges forms an acyclic forest that is a subgraph of some minimum spanning tree.',
    pitfalls: [
      'Graph must be connected to span all V vertices; otherwise Kruskal generates a Minimum Spanning Forest.',
      'Without path compression and union-by-rank, DSU operations can degrade from O(α(V)) to O(V).',
    ],
  },
  presets: [
    { id: 'default', label: 'Standard 6-Node Graph', description: '9 edges with varying weights', data: defaultKruskalGraph },
    {
      id: 'simple-triangle',
      label: 'Dense 4-Node Clique',
      description: 'Fully connected 4 vertices',
      data: {
        nodes: [
          { id: '1', label: '1', x: 120, y: 90 },
          { id: '2', label: '2', x: 380, y: 90 },
          { id: '3', label: '3', x: 380, y: 220 },
          { id: '4', label: '4', x: 120, y: 220 },
        ],
        edges: [
          { from: '1', to: '2', weight: 1 },
          { from: '2', to: '3', weight: 2 },
          { from: '3', to: '4', weight: 3 },
          { from: '4', to: '1', weight: 4 },
          { from: '1', to: '3', weight: 5 },
          { from: '2', to: '4', weight: 6 },
        ],
      },
    },
  ],
  defaultInput: defaultKruskalGraph,
  codeSnippets: {
    python: `def kruskal(vertices, edges):
    # Sort edges ascending by weight
    edges.sort(key=lambda e: e[2])
    parent = {v: v for v in vertices}
    rank = {v: 0 for v in vertices}

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x]) # Path compression
        return parent[x]

    def union(x, y):
        root_x, root_y = find(x), find(y)
        if root_x == root_y:
            return False # Cycle detected
        if rank[root_x] < rank[root_y]:
            parent[root_x] = root_y
        elif rank[root_x] > rank[root_y]:
            parent[root_y] = root_x
        else:
            parent[root_y] = root_x
            rank[root_x] += 1
        return True

    mst = []
    for u, v, w in edges:
        if union(u, v):
            mst.append((u, v, w))
            if len(mst) == len(vertices) - 1:
                break
    return mst`,
    typescript: `function kruskal(nodes: string[], edges: [string, string, number][]): [string, string, number][] {
  // Sort edges ascending by weight
  edges.sort((a, b) => a[2] - b[2]);
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  for (const n of nodes) {
    parent[n] = n;
    rank[n] = 0;
  }

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x: string, y: string): boolean {
    const rootX = find(x), rootY = find(y);
    if (rootX === rootY) return false;
    if (rank[rootX] < rank[rootY]) parent[rootX] = rootY;
    else if (rank[rootX] > rank[rootY]) parent[rootY] = rootX;
    else { parent[rootY] = rootX; rank[rootX]++; }
    return true;
  }

  const mst: [string, string, number][] = [];
  for (const [u, v, w] of edges) {
    if (union(u, v)) {
      mst.push([u, v, w]);
      if (mst.length === nodes.length - 1) break;
    }
  }
  return mst;
}`,
    cpp: `struct Edge { int u, v, weight; };

struct DSU {
    vector<int> parent, rank;
    DSU(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int x, int y) {
        int rootX = find(x), rootY = find(y);
        if (rootX == rootY) return false;
        if (rank[rootX] < rank[rootY]) swap(rootX, rootY);
        parent[rootY] = rootX;
        if (rank[rootX] == rank[rootY]) rank[rootX]++;
        return true;
    }
};`,
    java: `class KruskalMST {
    static class Edge implements Comparable<Edge> {
        int src, dest, weight;
        public int compareTo(Edge compareEdge) {
            return this.weight - compareEdge.weight;
        }
    }
    static int find(int[] parent, int i) {
        if (parent[i] != i) parent[i] = find(parent, parent[i]);
        return parent[i];
    }
    static boolean union(int[] parent, int[] rank, int x, int y) {
        int rootX = find(parent, x), rootY = find(parent, y);
        if (rootX == rootY) return false;
        if (rank[rootX] < rank[rootY]) parent[rootX] = rootY;
        else if (rank[rootX] > rank[rootY]) parent[rootY] = rootX;
        else { parent[rootY] = rootX; rank[rootX]++; }
        return true;
    }
}`,
    pseudocode: `function Kruskal(Graph G):
    A = empty set
    sort edges of G into nondecreasing order by weight w
    for each vertex v in G.V:
        MAKE-SET(v)
    for each edge (u, v) taken from sorted order:
        if FIND-SET(u) != FIND-SET(v):
            A = A union {(u, v)}
            UNION(u, v)
            if |A| == |G.V| - 1:
                break
    return A`,
  },

  generateTimeline: (input: KruskalGraphInput): ExecutionFrame<KruskalMSTState>[] => {
    const nodes = input?.nodes?.length ? input.nodes : defaultKruskalGraph.nodes;
    const rawEdges = input?.edges?.length ? input.edges : defaultKruskalGraph.edges;

    const edges: KruskalEdge[] = rawEdges.map((e, idx) => ({
      id: `e-${idx}`,
      from: e.from,
      to: e.to,
      weight: e.weight,
      status: 'unprocessed',
    }));

    // Sort edges ascending by weight
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

    const dsuParent: Record<string, string> = {};
    const dsuRank: Record<string, number> = {};
    nodes.forEach((n) => {
      dsuParent[n.id] = n.id;
      dsuRank[n.id] = 0;
    });

    const find = (x: string, p: Record<string, string>): string => {
      let cur = x;
      while (p[cur] !== cur) {
        cur = p[cur];
      }
      return cur;
    };

    const timeline: ExecutionFrame<KruskalMSTState>[] = [];

    const baseFrame = (
      stepIdx: number,
      state: KruskalMSTState,
      codeLine: number,
      explanation: string,
      action: string,
      isMilestone: boolean,
      scope: Record<string, string | number>,
      soundCue?: ExecutionFrame<KruskalMSTState>['soundCue'],
      extra?: Partial<ExecutionFrame<KruskalMSTState>>
    ): ExecutionFrame<KruskalMSTState> => ({
      stepIndex: stepIdx,
      totalSteps: 0,
      codeLine,
      state: {
        nodes: [...state.nodes],
        edges: state.edges.map((e) => ({ ...e })),
        sortedEdges: state.sortedEdges.map((e) => ({ ...e })),
        currentEdgeId: state.currentEdgeId,
        dsuParent: { ...state.dsuParent },
        dsuRank: { ...state.dsuRank },
        mstWeight: state.mstWeight,
        mstEdgeCount: state.mstEdgeCount,
        cycleDetected: state.cycleDetected,
      },
      codeHighlights: {
        python: [codeLine],
        typescript: [codeLine],
        cpp: [codeLine],
        java: [codeLine],
        pseudocode: [codeLine],
      },
      callStack: [
        {
          id: 'kruskal-frame',
          name: 'kruskal',
          file: 'kruskalMST.ts',
          line: codeLine,
          params: { V: nodes.length, E: edges.length, mstWeight: state.mstWeight },
        },
      ],
      scopeVariables: scope,
      explanation,
      action,
      isMilestone,
      soundCue,
      invariantStatus:
        state.mstEdgeCount === nodes.length - 1
          ? 'MST complete: spanning all vertices with minimal total edge weight.'
          : 'Accepted edges maintain an acyclic forest property at every step.',
      ...extra,
    });

    const currentState: KruskalMSTState = {
      nodes: [...nodes],
      edges: [...edges],
      sortedEdges: sortedEdges.map((e) => ({ id: e.id, from: e.from, to: e.to, weight: e.weight })),
      currentEdgeId: null,
      dsuParent: { ...dsuParent },
      dsuRank: { ...dsuRank },
      mstWeight: 0,
      mstEdgeCount: 0,
      cycleDetected: false,
    };

    let step = 0;

    // Step 0a: Sort edges
    timeline.push(
      baseFrame(
        step++,
        currentState,
        3,
        `Sort all ${edges.length} edges into nondecreasing order by weight: [${sortedEdges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}].`,
        'Sort edges by weight',
        false,
        {
          vertices: nodes.length,
          edges: edges.length,
          sortedOrder: sortedEdges.map((e) => `${e.from}-${e.to}:${e.weight}`).join(', '),
        },
        'start',
        {
          pedagogy: {
            what: `Kruskal's algorithm processes edges cheapest-first; sorting is what makes the greedy choice safe.`,
            why: 'The cut property: the cheapest edge crossing any cut belongs to some MST. Processing in weight order means each accepted edge is the cheapest available bridge between two components.',
            whatNext: 'Initialize one DSU component per vertex.',
          },
        }
      )
    );

    // Step 0b: Make-set
    timeline.push(
      baseFrame(
        step++,
        currentState,
        5,
        `MAKE-SET for all ${nodes.length} vertices: each starts as its own singleton component.`,
        'Initialize DSU',
        true,
        { vertices: nodes.length, components: nodes.length },
        'start',
        {
          pedagogy: {
            what: `Every vertex is its own component; no edges have been accepted yet.`,
            why: 'DSU tracks which vertices are already connected by accepted MST edges, so a single find() answers "would this edge create a cycle?".',
            whatNext: 'Inspect the lightest remaining edge.',
          },
        }
      )
    );

    const neededEdges = nodes.length - 1;
    let checkpointAdded = false;

    for (let i = 0; i < sortedEdges.length; i++) {
      if (currentState.mstEdgeCount >= neededEdges) {
        break;
      }

      const edge = sortedEdges[i];
      currentState.currentEdgeId = edge.id;
      currentState.cycleDetected = false;

      // Update edge in graph to 'evaluating'
      const edgeInGraph = currentState.edges.find((e) => e.id === edge.id);
      if (edgeInGraph) edgeInGraph.status = 'evaluating';

      const rootU = find(edge.from, currentState.dsuParent);
      const rootV = find(edge.to, currentState.dsuParent);

      timeline.push(
        baseFrame(
          step++,
          currentState,
          7,
          `Evaluating cheapest available edge (${edge.from} - ${edge.to}, weight: ${edge.weight}). Finding roots: find(${edge.from}) = ${rootU}, find(${edge.to}) = ${rootV}.`,
          `Inspect edge (${edge.from}-${edge.to}, ${edge.weight})`,
          false,
          { u: edge.from, v: edge.to, weight: edge.weight, rootU, rootV },
          'compare',
          {
            pedagogy: {
              what: `Take the lightest unprocessed edge ${edge.from} — ${edge.to} (w=${edge.weight}) and ask whether its endpoints are already connected.`,
              why: 'find() returns each endpoint\'s component root. Different roots mean the edge bridges two components and is safe; equal roots mean it would close a cycle.',
              whatNext: rootU === rootV ? 'Same root: reject this edge.' : 'Different roots: accept it and union the components.',
            },
            checkpoint: !checkpointAdded
              ? {
                  id: 'kruskal-cycle-check',
                  question: `Kruskal inspects ${edge.from} — ${edge.to}. Under what condition must this edge be rejected?`,
                  options: [
                    'When find(u) == find(v): both endpoints already lie in the same accepted component, so adding it closes a cycle',
                    'When its weight is larger than the current total MST weight',
                  ],
                  correctIndex: 0,
                  explanation:
                    'Kruskal builds a forest. An edge inside one component adds no new vertex and creates a cycle; an edge between two components always merges them and is safe.',
                }
              : undefined,
          }
        )
      );
      checkpointAdded = true;

      if (rootU === rootV) {
        // Cycle!
        currentState.cycleDetected = true;
        if (edgeInGraph) edgeInGraph.status = 'rejected';

        timeline.push(
          baseFrame(
            step++,
            currentState,
            7,
            `Cycle detected! Both vertices ${edge.from} and ${edge.to} already share root '${rootU}'. Rejecting edge (${edge.from} - ${edge.to}) to prevent a cycle.`,
            `Reject edge (${edge.from}-${edge.to})`,
            true,
            { u: edge.from, v: edge.to, weight: edge.weight, cycle: 'yes', sharedRoot: rootU },
            'step',
            {
              pedagogy: {
                what: `find(${edge.from}) = find(${edge.to}) = ${rootU}, so the endpoints are already connected inside the accepted forest.`,
                why: 'Adding this edge would create exactly one cycle and would not help span a new vertex; Kruskal rejects it and moves on.',
                whatNext: 'Try the next-lightest edge.',
              },
            }
          )
        );
      } else {
        // Disconnected, accept!
        if (edgeInGraph) edgeInGraph.status = 'accepted';
        currentState.mstWeight += edge.weight;
        currentState.mstEdgeCount += 1;

        timeline.push(
          baseFrame(
            step++,
            currentState,
            8,
            `Accept edge (${edge.from} - ${edge.to}, weight ${edge.weight}) into A: it joins two different components. Total weight = ${currentState.mstWeight} (${currentState.mstEdgeCount}/${neededEdges} edges).`,
            `Accept edge (${edge.from}-${edge.to})`,
            true,
            {
              u: edge.from,
              v: edge.to,
              weight: edge.weight,
              totalWeight: currentState.mstWeight,
              edgesCount: currentState.mstEdgeCount,
            },
            'success',
            {
              pedagogy: {
                what: `The edge is safe, so it enters the MST edge set A; the running weight becomes ${currentState.mstWeight}.`,
                why: 'It is the lightest edge connecting two distinct components — the cut property guarantees some MST contains it.',
                whatNext: `Union the components rooted at ${rootU} and ${rootV}.`,
              },
            }
          )
        );

        // Perform union by rank
        const rankU = currentState.dsuRank[rootU];
        const rankV = currentState.dsuRank[rootV];
        if (rankU < rankV) {
          currentState.dsuParent[rootU] = rootV;
        } else if (rankU > rankV) {
          currentState.dsuParent[rootV] = rootU;
        } else {
          currentState.dsuParent[rootV] = rootU;
          currentState.dsuRank[rootU] += 1;
        }

        timeline.push(
          baseFrame(
            step++,
            currentState,
            9,
            `UNION(${rootU}, ${rootV}): components merge under root '${find(edge.from, currentState.dsuParent)}'. Future edges inside this component will be rejected.`,
            `Union components (${rootU}, ${rootV})`,
            false,
            {
              rootU,
              rootV,
              mergedRoot: find(edge.from, currentState.dsuParent),
              mstEdgeCount: currentState.mstEdgeCount,
            },
            'step',
            {
              pedagogy: {
                what: `The two components are now one; find() on any vertex in either returns the same root.`,
                why: 'Union by rank keeps the DSU tree shallow, so future find() calls stay near-constant time.',
                whatNext:
                  currentState.mstEdgeCount >= neededEdges
                    ? 'V − 1 edges reached: stop.'
                    : 'Continue with the next edge.',
              },
            }
          )
        );

        if (currentState.mstEdgeCount >= neededEdges) {
          timeline.push(
            baseFrame(
              step++,
              currentState,
              11,
              `|A| = ${currentState.mstEdgeCount} = V - 1 = ${neededEdges}. A spanning tree is complete, so break out of the edge loop.`,
              'Early exit: V-1 edges',
              true,
              { mstEdgeCount: currentState.mstEdgeCount, neededEdges, finalWeight: currentState.mstWeight },
              'complete',
              {
                pedagogy: {
                  what: `The MST already has V − 1 edges and spans every vertex.`,
                  why: 'Any spanning tree on V vertices has exactly V − 1 edges; one more would necessarily create a cycle.',
                  whatNext: 'Stop early and return A.',
                },
              }
            )
          );
          break;
        }
      }
    }

    currentState.currentEdgeId = null;
    timeline.push(
      baseFrame(
        step++,
        currentState,
        12,
        `Kruskal's MST complete! Selected ${currentState.mstEdgeCount} edges spanning all ${nodes.length} vertices with minimal total weight of ${currentState.mstWeight}.`,
        'MST Construction Complete',
        true,
        { finalWeight: currentState.mstWeight, edgesInMST: currentState.mstEdgeCount },
        'complete',
        {
          milestoneTitle: `MST Complete (weight ${currentState.mstWeight})`,
          pedagogy: {
            what: `Return A with ${currentState.mstEdgeCount} edges and total weight ${currentState.mstWeight}.`,
            why: 'Each accepted edge was the lightest edge joining two components, so by the cut property the resulting spanning tree is minimum.',
            whatNext: 'Compare with Prim: same MST weight, different exploration order (Kruskal is edge-centric, Prim is vertex-centric).',
          },
        }
      )
    );

    const total = timeline.length;
    timeline.forEach((f) => {
      f.totalSteps = total;
    });

    return timeline;
  },

  renderStage: (frame: ExecutionFrame<KruskalMSTState>) => {
    const { nodes, edges, sortedEdges, currentEdgeId, dsuParent, mstWeight, mstEdgeCount, cycleDetected } = frame.state;

    // Helper to get component root color
    const getRoot = (id: string): string => {
      let cur = id;
      while (dsuParent[cur] && dsuParent[cur] !== cur) {
        cur = dsuParent[cur];
      }
      return cur;
    };

    const rootColors: Record<string, string> = {
      A: '#38bdf8', // sky
      B: '#a855f7', // purple
      C: '#ec4899', // pink
      D: '#f59e0b', // amber
      E: '#10b981', // emerald
      F: '#6366f1', // indigo
      '1': '#38bdf8',
      '2': '#a855f7',
      '3': '#10b981',
      '4': '#f59e0b',
    };

    return (
      <div className="w-full flex flex-col items-center justify-center p-4 space-y-6 select-none">
        {/* Top Summary Header */}
        <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-2.5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">MST Weight:</span>
            <span className="text-base font-mono font-bold text-emerald-400">{mstWeight}</span>
          </div>
          <div className="h-4 w-px bg-slate-700/60" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">MST Edges:</span>
            <span className="text-base font-mono font-bold text-sky-400">
              {mstEdgeCount} / {nodes.length - 1}
            </span>
          </div>
          {cycleDetected && (
            <>
              <div className="h-4 w-px bg-slate-700/60" />
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
                CYCLE PREVENTED
              </span>
            </>
          )}
        </div>

        {/* SVG Graph Visualization */}
        <div className="relative w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur">
          <svg className="w-full h-72" viewBox="0 0 520 300">
            <defs>
              <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Edges */}
            {edges.map((edge) => {
              const u = nodes.find((n) => n.id === edge.from);
              const v = nodes.find((n) => n.id === edge.to);
              if (!u || !v) return null;

              const isEvaluating = edge.id === currentEdgeId;
              const isAccepted = edge.status === 'accepted';
              const isRejected = edge.status === 'rejected';

              let strokeColor = '#334155'; // slate-700
              let strokeWidth = 2;
              let strokeDasharray = 'none';

              if (isAccepted) {
                strokeColor = '#10b981'; // emerald-500
                strokeWidth = 4;
              } else if (isEvaluating) {
                strokeColor = '#f59e0b'; // amber-500
                strokeWidth = 3;
                strokeDasharray = '5,5';
              } else if (isRejected) {
                strokeColor = '#ef4444'; // rose-500
                strokeWidth = 1.5;
                strokeDasharray = '3,3';
              }

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={edge.id} className="transition-all duration-300">
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    filter={isAccepted ? 'url(#glow-emerald)' : undefined}
                  />
                  {/* Weight Badge */}
                  <rect
                    x={midX - 12}
                    y={midY - 10}
                    width={24}
                    height={20}
                    rx={6}
                    fill={isAccepted ? '#064e3b' : isEvaluating ? '#78350f' : '#1e293b'}
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isAccepted ? '#34d399' : isEvaluating ? '#fde68a' : '#94a3b8'}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const root = getRoot(node.id);
              const color = rootColors[root] || '#94a3b8';

              return (
                <g key={node.id} className="transition-transform duration-300">
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={3}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sorted Edges Queue strip */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Sorted Edges Priority Consideration:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {sortedEdges.map((e) => {
              const edgeRecord = edges.find((edge) => edge.id === e.id);
              const isCur = e.id === currentEdgeId;
              const status = edgeRecord?.status || 'unprocessed';

              return (
                <div
                  key={e.id}
                  className={`flex flex-col items-center px-3 py-1.5 rounded-lg border font-mono text-xs transition-all duration-200 shrink-0 ${
                    isCur
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 scale-105'
                      : status === 'accepted'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : status === 'rejected'
                      ? 'bg-rose-950/30 border-rose-900/40 text-rose-400 line-through opacity-60'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
                  }`}
                >
                  <span className="font-bold">
                    {e.from}—{e.to}
                  </span>
                  <span className="text-[10px] text-slate-400">wt: {e.weight}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
