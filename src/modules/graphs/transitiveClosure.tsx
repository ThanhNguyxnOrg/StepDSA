import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TransitiveClosureState {
  nodes: string[];
  matrix: number[][]; // V x V reachability matrix
  k: number;
  i: number;
  j: number;
  justUpdated: [number, number] | null;
}

export const transitiveClosureModule: AlgorithmModule<
  { nodes: string[]; edges: { from: string; to: string }[] },
  TransitiveClosureState
> = {
  id: 'transitive-closure',
  title: "Transitive Closure (Warshall's Reachability Matrix O(V^3))",
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V^3)',
    timeAverage: 'O(V^3)',
    timeWorst: 'O(V^3)',
    spaceAuxiliary: 'O(V^2) binary reachability matrix',
    worstCaseCondition: 'All graphs require examining all V^3 node triples (i, k, j)',
  },
  theory: {
    overview:
      "Warshall's algorithm computes the transitive closure of a directed graph: determining for every pair of vertices (u, v) whether there exists a directed path of arbitrary length from u to v.",
    whyItWorks:
      'Dynamic Programming over intermediate vertices: R_k[i][j] is true if there exists a directed path from i to j using only intermediate vertices from {0, ..., k}. Transition: R_k[i][j] = R_{k-1}[i][j] OR (R_{k-1}[i][k] AND R_{k-1}[k][j]).',
    invariant:
      'Intermediate Vertex Reachability: After outer loop iteration k, matrix[i][j] == 1 if and only if there exists a path from i to j whose intermediate vertices belong to {0, ..., k}.',
    pitfalls: [
      'Loop ordering error: The intermediate pivot k must be the outermost loop.',
      'Forgetting that a vertex can reach itself via a cycle or trivial self-loop depending on definition.',
    ],
  },
  presets: [
    {
      id: 'four-node-chain',
      label: 'Directed Chain: 0 -> 1 -> 2 -> 3',
      description: 'Linear chain where reachability propagates transitively from 0 to 3',
      data: {
        nodes: ['0', '1', '2', '3'],
        edges: [
          { from: '0', to: '1' },
          { from: '1', to: '2' },
          { from: '2', to: '3' },
        ],
      },
    },
    {
      id: 'cycle-with-tail',
      label: 'Cycle with Branch: (0->1->2->0) & 1->3',
      description: 'Nodes 0, 1, 2 reach each other; all can reach 3',
      data: {
        nodes: ['0', '1', '2', '3'],
        edges: [
          { from: '0', to: '1' },
          { from: '1', to: '2' },
          { from: '2', to: '0' },
          { from: '1', to: '3' },
        ],
      },
    },
  ],
  defaultInput: {
    nodes: ['0', '1', '2', '3'],
    edges: [
      { from: '0', to: '1' },
      { from: '1', to: '2' },
      { from: '2', to: '3' },
    ],
  },
  codeSnippets: {
    cpp: `vector<vector<int>> transitiveClosure(int V, vector<pair<int,int>>& edges) {
    vector<vector<int>> reach(V, vector<int>(V, 0));
    for (int i = 0; i < V; ++i) reach[i][i] = 1;
    for (auto& [u, v] : edges) reach[u][v] = 1;
    for (int k = 0; k < V; ++k)
        for (int i = 0; i < V; ++i)
            for (int j = 0; j < V; ++j)
                reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]);
    return reach;
}`,
    python: `def transitive_closure(V: int, edges: list[tuple[int, int]]) -> list[list[int]]:
    reach = [[1 if i == j else 0 for j in range(V)] for i in range(V)]
    for u, v in edges:
        reach[u][v] = 1
    for k in range(V):
        for i in range(V):
            for j in range(V):
                reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j])
    return reach`,
    typescript: `function transitiveClosure(V: number, edges: [number, number][]): number[][] {
  const reach = Array.from({ length: V }, (_, i) =>
    Array.from({ length: V }, (_, j) => (i === j ? 1 : 0))
  );
  for (const [u, v] of edges) reach[u][v] = 1;
  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]) ? 1 : 0;
      }
    }
  }
  return reach;
}`,
    java: `public int[][] transitiveClosure(int V, int[][] edges) {
    int[][] reach = new int[V][V];
    for (int i = 0; i < V; i++) reach[i][i] = 1;
    for (int[] e : edges) reach[e[0]][e[1]] = 1;
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                reach[i][j] = (reach[i][j] == 1 || (reach[i][k] == 1 && reach[k][j] == 1)) ? 1 : 0;
            }
        }
    }
    return reach;
}`,
    pseudocode: `function transitiveClosure(V, edges):
    initialize reach[V][V] with 0
    for each vertex v: reach[v][v] = 1
    for each edge (u, v): reach[u][v] = 1
    for k from 0 to V - 1:
        for i from 0 to V - 1:
            for j from 0 to V - 1:
                reach[i][j] = reach[i][j] OR (reach[i][k] AND reach[k][j])
    return reach`,
  },
  generateTimeline: (input: {
    nodes: string[];
    edges: { from: string; to: string }[];
  }): ExecutionFrame<TransitiveClosureState>[] => {
    const rawNodes = input?.nodes?.length ? input.nodes : ['0', '1', '2', '3'];
    const rawEdges = input?.edges?.length
      ? input.edges
      : [
          { from: '0', to: '1' },
          { from: '1', to: '2' },
          { from: '2', to: '3' },
        ];

    const frames: ExecutionFrame<TransitiveClosureState>[] = [];
    const V = rawNodes.length;
    const nodeIndex = new Map<string, number>();
    rawNodes.forEach((name: string, idx: number) => nodeIndex.set(name, idx));

    const matrix: number[][] = Array.from({ length: V }, (_, i) =>
      Array.from({ length: V }, (_, j) => (i === j ? 1 : 0))
    );

    rawEdges.forEach((e: { from: string; to: string }) => {
      const u = nodeIndex.get(e.from);
      const v = nodeIndex.get(e.to);
      if (u !== undefined && v !== undefined) {
        matrix[u][v] = 1;
      }
    });

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        nodes: rawNodes,
        matrix: matrix.map((row) => [...row]),
        k: -1,
        i: -1,
        j: -1,
        justUpdated: null,
      },
      callStack: [{ name: 'transitiveClosure', params: { V, edgesCount: rawEdges.length } }],
      variables: { V, totalEdges: rawEdges.length, status: 'Adjacency initialized' },
      explanation: `Initialized reachability matrix with reflexive 1s on diagonal and direct graph edges.`,
    });

    for (let k = 0; k < V; k++) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        action: 'PIVOT_SELECT',
        state: {
          nodes: rawNodes,
          matrix: matrix.map((row) => [...row]),
          k,
          i: -1,
          j: -1,
          justUpdated: null,
        },
        callStack: [{ name: 'transitiveClosure', params: { pivotK: rawNodes[k], k } }],
        variables: { pivotNode: rawNodes[k], k, phase: `Exploring paths through node ${rawNodes[k]}` },
        explanation: `Set intermediate pivot vertex k = ${rawNodes[k]} (index ${k}). Examining paths i -> k -> j.`,
      });

      for (let i = 0; i < V; i++) {
        for (let j = 0; j < V; j++) {
          const throughK = matrix[i][k] === 1 && matrix[k][j] === 1;
          const wasReachable = matrix[i][j] === 1;

          if (!wasReachable && throughK) {
            matrix[i][j] = 1;
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 8,
              action: 'REACHABILITY_DISCOVERED',
              state: {
                nodes: rawNodes,
                matrix: matrix.map((row) => [...row]),
                k,
                i,
                j,
                justUpdated: [i, j],
              },
              callStack: [{ name: 'transitiveClosure', params: { k, i, j } }],
              variables: {
                from: rawNodes[i],
                pivot: rawNodes[k],
                to: rawNodes[j],
                formula: `reach[${rawNodes[i]}][${rawNodes[k]}] (1) && reach[${rawNodes[k]}][${rawNodes[j]}] (1)`,
                newReach: `reach[${rawNodes[i]}][${rawNodes[j]}] = 1`,
              },
              explanation: `New path discovered: ${rawNodes[i]} -> ${rawNodes[k]} -> ${rawNodes[j]}. Updated reach[${rawNodes[i]}][${rawNodes[j]}] = 1!`,
            });
          }
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      action: 'COMPLETE',
      state: {
        nodes: rawNodes,
        matrix: matrix.map((row) => [...row]),
        k: V - 1,
        i: V - 1,
        j: V - 1,
        justUpdated: null,
      },
      callStack: [{ name: 'transitiveClosure', params: { status: 'DONE' } }],
      variables: { V, status: 'Transitive closure complete' },
      explanation: "Warshall's algorithm completed. Reachability matrix fully computed in O(V^3).",
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<TransitiveClosureState>) => {
    const { nodes, matrix, k, justUpdated } = frame.state;
    const V = nodes.length;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Pivot Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Current Pivot (k):</span>
            <span className="font-mono font-bold text-sm bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded">
              {k >= 0 ? `Node ${nodes[k]} (Index ${k})` : 'Initializing'}
            </span>
          </div>
          {justUpdated && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded animate-pulse">
                + Path {nodes[justUpdated[0]]} → {nodes[justUpdated[1]]}
              </span>
            </div>
          )}
        </div>

        {/* Matrix Visualization */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Reachability Matrix R (V x V)
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `auto repeat(${V}, minmax(44px, 1fr))` }}
          >
            {/* Header row */}
            <div className="h-10 flex items-center justify-center text-xs font-mono text-slate-500 font-bold">
              i \ j
            </div>
            {nodes.map((nodeName, colIdx) => (
              <div
                key={colIdx}
                className={`h-10 flex items-center justify-center font-mono font-bold text-sm rounded ${
                  colIdx === k
                    ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50'
                    : 'text-slate-400'
                }`}
              >
                {nodeName}
              </div>
            ))}

            {/* Matrix rows */}
            {nodes.map((rowName, rowIdx) => (
              <div key={`row-${rowIdx}`} className="contents">
                <div
                  className={`w-10 h-11 flex items-center justify-center font-mono font-bold text-sm rounded ${
                    rowIdx === k
                      ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50'
                      : 'text-slate-400'
                  }`}
                >
                  {rowName}
                </div>

                {matrix[rowIdx].map((val, colIdx) => {
                  const isUpdatedNow =
                    justUpdated && justUpdated[0] === rowIdx && justUpdated[1] === colIdx;
                  const isPivotCell = rowIdx === k || colIdx === k;

                  return (
                    <div
                      key={`cell-${rowIdx}-${colIdx}`}
                      className={`h-11 rounded-lg flex items-center justify-center font-mono font-bold text-base transition-all duration-200 border ${
                        isUpdatedNow
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 scale-110 shadow-lg shadow-emerald-500/20 z-10'
                          : val === 1
                          ? isPivotCell
                            ? 'bg-purple-600/25 border-purple-400 text-purple-200'
                            : 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                          : isPivotCell
                          ? 'bg-slate-900/90 border-purple-900/40 text-slate-600'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-600/30 border border-cyan-500 inline-block" />
            <span>Reachable (1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-600/30 border border-purple-400 inline-block" />
            <span>Active Pivot Row/Col (k)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400 inline-block" />
            <span>Newly Discovered Path</span>
          </div>
        </div>
      </div>
    );
  },
};
