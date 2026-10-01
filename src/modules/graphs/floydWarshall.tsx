import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface FloydWarshallInput {
  vertices: string[];
  matrix: number[][]; // INF representation is 999
}

export interface FloydWarshallState {
  vertices: string[];
  matrix: number[][];
  k: number; // Intermediate vertex index
  i: number; // Source vertex index
  j: number; // Destination vertex index
  updated: boolean;
  explanationText: string;
}

const INF = 999;

const defaultFloydInput: FloydWarshallInput = {
  vertices: ['1', '2', '3', '4'],
  matrix: [
    [0, 3, INF, 7],
    [8, 0, 2, INF],
    [5, INF, 0, 1],
    [2, INF, INF, 0],
  ],
};

export const floydWarshallModule: AlgorithmModule<FloydWarshallInput, FloydWarshallState> = {
  id: 'floyd-warshall',
  title: 'Floyd-Warshall (All-Pairs Shortest Path DP)',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V³)',
    timeAverage: 'O(V³)',
    timeWorst: 'O(V³)',
    spaceAuxiliary: 'O(V²) distance matrix',
    worstCaseCondition: 'Strictly cubic runtime across all V³ combinations of intermediate and endpoint pairs',
  },
  theory: {
    overview:
      'The Floyd-Warshall algorithm computes all-pairs shortest paths on a directed, weighted graph (with positive or negative edges, provided no negative cycles exist). It uses 2D Dynamic Programming to incrementally allow more intermediate vertices.',
    whyItWorks:
      'Optimal Substructure: The shortest path from vertex i to vertex j using intermediate vertices from {0 ... k} either bypasses k (remaining at dist[i][j]) or passes through k (dist[i][k] + dist[k][j]). Taking the minimum guarantees correctness.',
    invariant:
      'After the outer loop finishes for intermediate index k, matrix[i][j] contains the length of the shortest path from i to j using only intermediate vertices from {0, 1, ..., k}.',
    pitfalls: [
      'Loop ordering must be k, then i, then j. Swapping loop orders violates the dynamic programming state dependency.',
      'Negative cycles produce negative values along the main diagonal (dist[i][i] < 0).',
    ],
  },
  presets: [
    {
      id: 'standard-4',
      label: 'Standard 4-Node Graph',
      description: '4 vertices with dense intermediate paths',
      data: defaultFloydInput,
    },
    {
      id: 'triangle-bridge',
      label: '3-Node Triangle',
      description: 'Simple bypass test',
      data: {
        vertices: ['A', 'B', 'C'],
        matrix: [
          [0, 5, INF],
          [INF, 0, 3],
          [2, INF, 0],
        ],
      },
    },
  ],
  defaultInput: defaultFloydInput,
  codeSnippets: {
    python: `def floyd_warshall(matrix):
    V = len(matrix)
    dist = [row[:] for row in matrix]

    for k in range(V):
        for i in range(V):
            for j in range(V):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist`,
    typescript: `function floydWarshall(matrix: number[][]): number[][] {
  const V = matrix.length;
  const dist = matrix.map(row => [...row]);

  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  return dist;
}`,
    cpp: `void floydWarshall(vector<vector<int>>& dist) {
    int V = dist.size();
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] < INF && dist[k][j] < INF) {
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }
}`,
    java: `public void floydWarshall(int[][] dist) {
    int V = dist.length;
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
}`,
    pseudocode: `function FloydWarshall(W):
    D = copy of W
    for k = 1 to V:
        for i = 1 to V:
            for j = 1 to V:
                D[i][j] = min(D[i][j], D[i][k] + D[k][j])
    return D`,
  },

  generateTimeline: (input: FloydWarshallInput): ExecutionFrame<FloydWarshallState>[] => {
    const frames: ExecutionFrame<FloydWarshallState>[] = [];
    const { vertices, matrix: initialMatrix } = input;
    const V = vertices.length;

    const dist = initialMatrix.map((row) => [...row]);

    const cloneMatrix = () => dist.map((row) => [...row]);

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Floyd-Warshall DP table for ${V} vertices. Direct edge weights loaded. Starting triple loop over intermediate k.`,
      isMilestone: true,
      milestoneTitle: 'Matrix Initialized',
      soundCue: { type: 'start' },
      variables: { totalVertices: V, intermediateLimit: V, k: -1 },
      callStack: [{ name: 'floydWarshall', params: { V }, line: 1, isCurrent: true }],
      conditionEval: { expr: `V > 0`, result: true },
      scopeVariables: { totalVertices: V, intermediateLimit: V },
      state: {
        vertices,
        matrix: cloneMatrix(),
        k: -1,
        i: -1,
        j: -1,
        updated: false,
        explanationText: 'Initial adjacency matrix D^(0)',
      },
    });

    for (let k = 0; k < V; k++) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Allowing intermediate vertex k = ${vertices[k]} (index ${k}). Evaluating paths through ${vertices[k]}.`,
        isMilestone: true,
        milestoneTitle: `Intermediate k = ${vertices[k]}`,
        soundCue: { type: 'step' },
        variables: { k: vertices[k], kIndex: k, V },
        callStack: [{ name: 'floydWarshall.loopK', params: { k: vertices[k] }, line: 5, isCurrent: true }],
        conditionEval: { expr: `k < V (${k} < ${V})`, result: true },
        scopeVariables: { k: vertices[k] },
        state: {
          vertices,
          matrix: cloneMatrix(),
          k,
          i: -1,
          j: -1,
          updated: false,
          explanationText: `Intermediate vertex k = ${vertices[k]}`,
        },
      });

      for (let i = 0; i < V; i++) {
        for (let j = 0; j < V; j++) {
          if (i === j) continue;

          const direct = dist[i][j];
          const throughK = dist[i][k] + dist[k][j];
          const canImprove = dist[i][k] < INF && dist[k][j] < INF && throughK < direct;

          if (canImprove) {
            dist[i][j] = throughK;

            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 8,
              explanation: `✨ Improved dist[${vertices[i]}][${vertices[j]}]: ${direct === INF ? '∞' : direct} → ${throughK} (via intermediate ${vertices[k]}: ${dist[i][k]} + ${dist[k][j]}).`,
              isMilestone: true,
              milestoneTitle: `Update (${vertices[i]}→${vertices[j]})`,
              soundCue: { type: 'swap' },
              variables: {
                i: vertices[i],
                j: vertices[j],
                k: vertices[k],
                newDistance: throughK,
                oldDistance: direct === INF ? '∞' : direct,
              },
              callStack: [{ name: 'relaxViaK', params: { i: vertices[i], j: vertices[j], k: vertices[k] }, line: 8, isCurrent: true }],
              conditionEval: { expr: `dist[i][k] + dist[k][j] < dist[i][j] (${throughK} < ${direct === INF ? '∞' : direct})`, result: true },
              scopeVariables: {
                i: vertices[i],
                j: vertices[j],
                k: vertices[k],
                newDistance: throughK,
                oldDistance: direct === INF ? '∞' : direct,
              },
              state: {
                vertices,
                matrix: cloneMatrix(),
                k,
                i,
                j,
                updated: true,
                explanationText: `dist[${vertices[i]}][${vertices[j]}] = ${throughK} via ${vertices[k]}`,
              },
            });
          }
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      explanation: `🎉 Floyd-Warshall complete! All-pairs shortest path matrix D^(${V}) finalized across all vertex pairs.`,
      isMilestone: true,
      milestoneTitle: 'All-Pairs Complete',
      soundCue: { type: 'complete' },
      variables: { status: 'Optimal Matrix Complete', totalVertices: V },
      callStack: [{ name: 'floydWarshall.done', params: { V }, line: 10, isCurrent: true }],
      conditionEval: { expr: `k == V (${V} == ${V})`, result: true },
      scopeVariables: { status: 'Optimal Matrix Complete' },
      state: {
        vertices,
        matrix: cloneMatrix(),
        k: -1,
        i: -1,
        j: -1,
        updated: false,
        explanationText: 'Final all-pairs shortest distances matrix',
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<FloydWarshallState>) => {
    const { vertices, matrix, k, i: activeI, j: activeJ, updated } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Intermediate k:{' '}
            <span className="text-amber-400 font-bold">
              {k >= 0 ? vertices[k] : 'None'}
            </span>
          </div>
          {activeI >= 0 && activeJ >= 0 && (
            <div className="px-3.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-xs font-mono text-cyan-300 font-bold">
              Pair: {vertices[activeI]} → {vertices[activeJ]}
            </div>
          )}
          {updated && (
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-xs font-mono text-emerald-300 font-bold animate-pulse">
              Shortest Path Improved!
            </div>
          )}
        </div>

        {/* 2D Distance Matrix Table */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-x-auto max-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2.5 text-xs font-mono text-slate-500 border-b border-slate-800">
                  from \ to
                </th>
                {vertices.map((v, colIdx) => (
                  <th
                    key={v}
                    className={`p-2.5 text-xs font-mono font-bold text-center border-b border-slate-800 transition-colors ${
                      colIdx === k
                        ? 'text-amber-400 bg-amber-950/40 rounded-t-lg'
                        : colIdx === activeJ
                        ? 'text-cyan-400 bg-cyan-950/40'
                        : 'text-slate-300'
                    }`}
                  >
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIdx) => (
                <tr key={vertices[rowIdx]}>
                  <td
                    className={`p-2.5 text-xs font-mono font-bold text-center border-r border-slate-800 transition-colors ${
                      rowIdx === k
                        ? 'text-amber-400 bg-amber-950/40'
                        : rowIdx === activeI
                        ? 'text-cyan-400 bg-cyan-950/40'
                        : 'text-slate-300'
                    }`}
                  >
                    {vertices[rowIdx]}
                  </td>
                  {row.map((val, colIdx) => {
                    const isCell = rowIdx === activeI && colIdx === activeJ;
                    const isKRowOrCol = rowIdx === k || colIdx === k;
                    const isInfinity = val >= 999;

                    return (
                      <td
                        key={colIdx}
                        className={`p-3 text-center font-mono text-sm border border-slate-800/60 transition-all duration-200 ${
                          isCell
                            ? 'bg-emerald-950/90 text-emerald-300 ring-2 ring-emerald-400 font-bold scale-105'
                            : isKRowOrCol
                            ? 'bg-amber-950/20 text-amber-200/90'
                            : 'bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        {isInfinity ? '∞' : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
