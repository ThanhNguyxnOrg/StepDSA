import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface MCMState {
  dims: number[]; // Length N + 1 for N matrices
  costTable: number[][]; // (N + 1) x (N + 1)
  splitTable: number[][]; // (N + 1) x (N + 1)
  i: number;
  j: number;
  k: number;
  currentLen: number;
  currentCostCalc: string;
  optimalFormula: string;
}

export const matrixChainMultiplicationModule: AlgorithmModule<
  { dims: number[] },
  MCMState
> = {
  id: 'matrix-chain-multiplication',
  title: 'Matrix Chain Multiplication (MCM Interval DP O(N^3))',
  category: 'dynamic-programming',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N^3)',
    timeAverage: 'O(N^3)',
    timeWorst: 'O(N^3)',
    spaceAuxiliary: 'O(N^2)',
    worstCaseCondition: 'All matrix chains evaluate all split partitions',
  },
  theory: {
    overview:
      'Given a chain of matrices <A1, A2, ..., An> where matrix Ai has dimension p[i-1] x p[i], find the parenthesization that minimizes the total number of scalar multiplications.',
    whyItWorks:
      'Matrix multiplication is associative but not commutative. Multiplying (AB)C can take significantly fewer operations than A(BC). For interval [i..j], we test every split point k (i <= k < j): cost = m[i][k] + m[k+1][j] + p[i-1] * p[k] * p[j], and choose the minimum.',
    invariant:
      'Optimal Substructure Invariant: m[i][j] holds the strictly minimum scalar operations to compute A_i * ... * A_j, with split point s[i][j] recording the optimal partition.',
    pitfalls: [
      'Off-by-one errors with dimension array p: matrix Ai has dimensions p[i-1] x p[i].',
      'Iterating by row/column order rather than increasing chain length L from 2 to N.',
    ],
  },
  presets: [
    {
      id: 'classic-4',
      label: 'Classic 4 Matrices: dims = [10, 20, 30, 40, 30]',
      description: 'Matrices: 10x20, 20x30, 30x40, 40x30. Optimal: 30,000 ops',
      data: { dims: [10, 20, 30, 40, 30] },
    },
    {
      id: 'dramatic-diff',
      label: 'Extreme Variance: dims = [10, 100, 5, 50]',
      description: 'Matrices: 10x100, 100x5, 5x50. Optimal is 7,500 vs 75,000 ops',
      data: { dims: [10, 100, 5, 50] },
    },
    {
      id: 'five-matrices',
      label: '5 Matrices: dims = [40, 20, 30, 10, 30]',
      description: 'Tests multi-level nested parenthesizations',
      data: { dims: [40, 20, 30, 10, 30] },
    },
  ],
  defaultInput: { dims: [10, 20, 30, 40, 30] },
  codeSnippets: {
    cpp: `int matrixChainOrder(const vector<int>& p) {
    int n = p.size() - 1; // n matrices
    vector<vector<int>> m(n + 1, vector<int>(n + 1, 0));
    for (int L = 2; L <= n; L++) {
        for (int i = 1; i <= n - L + 1; i++) {
            int j = i + L - 1;
            m[i][j] = INT_MAX;
            for (int k = i; k < j; k++) {
                int cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < m[i][j]) m[i][j] = cost;
            }
        }
    }
    return m[1][n];
}`,
    python: `def matrix_chain_order(p: list[int]) -> int:
    n = len(p) - 1
    m = [[0] * (n + 1) for _ in range(n + 1)]
    for L in range(2, n + 1):
        for i in range(1, n - L + 2):
            j = i + L - 1
            m[i][j] = float('inf')
            for k in range(i, j):
                cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
                if cost < m[i][j]:
                    m[i][j] = cost
    return m[1][n]`,
    typescript: `function matrixChainOrder(p: number[]): number {
    const n = p.length - 1;
    const m: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    for (let L = 2; L <= n; L++) {
        for (let i = 1; i <= n - L + 1; i++) {
            const j = i + L - 1;
            m[i][j] = Infinity;
            for (let k = i; k < j; k++) {
                const cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < m[i][j]) m[i][j] = cost;
            }
        }
    }
    return m[1][n];
}`,
    java: `public int matrixChainOrder(int[] p) {
    int n = p.length - 1;
    int[][] m = new int[n + 1][n + 1];
    for (int L = 2; L <= n; L++) {
        for (int i = 1; i <= n - L + 1; i++) {
            int j = i + L - 1;
            m[i][j] = Integer.MAX_VALUE;
            for (int k = i; k < j; k++) {
                int cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < m[i][j]) m[i][j] = cost;
            }
        }
    }
    return m[1][n];
}`,
    pseudocode: `function matrixChainOrder(p):
    n = length(p) - 1
    m[1..n][1..n] = 0
    for L from 2 to n:
        for i from 1 to n - L + 1:
            j = i + L - 1
            m[i][j] = INFINITY
            for k from i to j - 1:
                cost = m[i][k] + m[k+1][j] + p[i-1] * p[k] * p[j]
                if cost < m[i][j]:
                    m[i][j] = cost
                    s[i][j] = k
    return m[1][n]`,
  },

  generateTimeline: (input: { dims: number[] }): ExecutionFrame<MCMState>[] => {
    const rawDims = input.dims && input.dims.length >= 3 ? input.dims : [10, 20, 30, 40, 30];
    const dims = rawDims.slice(0, 6);
    const n = dims.length - 1; // number of matrices

    const m: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    const s: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));

    const frames: ExecutionFrame<MCMState>[] = [];

    // Helper to build parenthesization string
    const buildParentheses = (i: number, j: number): string => {
      if (i === j) return `A${i}`;
      const k = s[i][j];
      if (!k) return `(A${i}..A${j})`;
      return `(${buildParentheses(i, k)} × ${buildParentheses(k + 1, j)})`;
    };

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialize DP table for ${n} matrices with dimensions [${dims.join(', ')}]. Base cost for single matrices m[i][i] = 0.`,
      variables: { numMatrices: n, dimensions: dims.join(' x ') },
      callStack: [
        { name: `matrixChainOrder(dims)`, params: { n }, line: 4, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        dims,
        costTable: m.map((r) => [...r]),
        splitTable: s.map((r) => [...r]),
        i: 1,
        j: 1,
        k: 1,
        currentLen: 1,
        currentCostCalc: 'Diagonal initialized to 0',
        optimalFormula: '',
      },
    });

    for (let L = 2; L <= n; L++) {
      for (let i = 1; i <= n - L + 1; i++) {
        const j = i + L - 1;
        m[i][j] = Infinity;

        for (let k = i; k < j; k++) {
          const multCost = dims[i - 1] * dims[k] * dims[j];
          const totalCost = m[i][k] + m[k + 1][j] + multCost;
          const calcStr = `m[${i}][${k}] (${m[i][k]}) + m[${k + 1}][${j}] (${m[k + 1][j]}) + (${dims[i - 1]}×${dims[k]}×${dims[j]} = ${multCost}) = ${totalCost}`;

          let improved = false;
          if (totalCost < m[i][j]) {
            m[i][j] = totalCost;
            s[i][j] = k;
            improved = true;
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            explanation: `Chain length L=${L}, interval [A${i}..A${j}]: Testing split k=${k}. ${calcStr}. ${
              improved ? `-> New Minimum Found: ${totalCost} operations!` : `-> Exceeds current minimum (${m[i][j]}).`
            }`,
            variables: {
              L,
              i: `A${i}`,
              j: `A${j}`,
              splitK: `A${k}`,
              candidateCost: totalCost,
              bestCost: m[i][j],
            },
            callStack: [
              { name: `evaluateSplit(i=${i}, j=${j}, k=${k})`, params: { L, i, j, k }, line: 10, isCurrent: true },
              { name: `matrixChainOrder()`, params: { n }, line: 5 },
            ],
            state: {
              dims,
              costTable: m.map((r) => [...r]),
              splitTable: s.map((r) => [...r]),
              i,
              j,
              k,
              currentLen: L,
              currentCostCalc: calcStr,
              optimalFormula: buildParentheses(i, j),
            },
          });
        }
      }
    }

    const finalFormula = buildParentheses(1, n);

    // Final Completion Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `Optimization complete! Optimal multiplication order is ${finalFormula} requiring a minimum of ${m[1][n].toLocaleString()} scalar operations.`,
      variables: {
        totalCost: m[1][n],
        optimalOrder: finalFormula,
      },
      callStack: [
        { name: 'complete()', params: { minOperations: m[1][n], order: finalFormula }, line: 15, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        dims,
        costTable: m.map((r) => [...r]),
        splitTable: s.map((r) => [...r]),
        i: 1,
        j: n,
        k: s[1][n],
        currentLen: n,
        currentCostCalc: `Solved in ${m[1][n].toLocaleString()} operations`,
        optimalFormula: finalFormula,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<MCMState>) => {
    const { dims, costTable, splitTable, i, j, k, currentLen, currentCostCalc, optimalFormula } = frame.state;
    const n = dims.length - 1;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Matrix Dimension Sequence Cards */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 mr-2">Matrices:</span>
            {Array.from({ length: n }, (_, idx) => {
              const matIdx = idx + 1;
              const inInterval = matIdx >= i && matIdx <= j;
              const isSplitLeft = matIdx <= k && matIdx >= i;
              return (
                <div
                  key={matIdx}
                  className={`px-3 py-1.5 rounded-xl border font-mono text-xs transition-all duration-200 ${
                    !inInterval
                      ? 'bg-slate-900/40 text-slate-600 border-slate-800'
                      : isSplitLeft
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold scale-105 shadow-md shadow-cyan-500/10'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-400 font-bold scale-105 shadow-md shadow-indigo-500/10'
                  }`}
                >
                  <span className="font-extrabold">A{matIdx}</span> ({dims[idx]} × {dims[idx + 1]})
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Chain L: <strong className="text-white">{currentLen}</strong>
            </div>
            {optimalFormula && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold">
                {optimalFormula}
              </div>
            )}
          </div>
        </div>

        {/* Calculation Banner */}
        <div className="w-full mb-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
          <div className="text-cyan-400 truncate mr-2">
            Step: <span className="text-slate-200">{currentCostCalc}</span>
          </div>
          <div className="text-slate-400 shrink-0">
            Min Cost m[{i}][{j}]:{' '}
            <strong className="text-white">{costTable[i]?.[j] === Infinity ? '∞' : costTable[i]?.[j]?.toLocaleString()}</strong>
          </div>
        </div>

        {/* 2D MCM Cost Table */}
        <div className="w-full overflow-x-auto p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl my-auto">
          <table className="w-full text-center border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-2 text-slate-500">i \ j</th>
                {Array.from({ length: n }, (_, col) => {
                  const colIdx = col + 1;
                  return (
                    <th
                      key={colIdx}
                      className={`p-2 ${colIdx === j ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-400'}`}
                    >
                      A{colIdx}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: n }, (_, row) => {
                const rowIdx = row + 1;
                return (
                  <tr key={rowIdx} className="border-b border-slate-900/60">
                    <td
                      className={`p-2 text-left font-bold ${
                        rowIdx === i ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-500'
                      }`}
                    >
                      A{rowIdx}
                    </td>
                    {Array.from({ length: n }, (_, col) => {
                      const colIdx = col + 1;
                      const isCurrent = rowIdx === i && colIdx === j;
                      const isInvalid = rowIdx > colIdx;
                      const cost = costTable[rowIdx]?.[colIdx];
                      const splitK = splitTable[rowIdx]?.[colIdx];

                      return (
                        <td
                          key={colIdx}
                          className={`p-2.5 transition-all duration-200 ${
                            isInvalid
                              ? 'text-slate-800 bg-slate-950/40'
                              : isCurrent
                              ? 'bg-cyan-500 text-slate-950 font-extrabold scale-110 shadow-lg'
                              : cost !== undefined && cost !== Infinity && cost > 0
                              ? 'bg-slate-900/80 text-emerald-400 font-bold'
                              : cost === 0
                              ? 'text-slate-500'
                              : 'text-slate-700'
                          }`}
                        >
                          {isInvalid ? (
                            '—'
                          ) : cost === Infinity ? (
                            '∞'
                          ) : (
                            <div>
                              <span>{cost?.toLocaleString()}</span>
                              {splitK ? <div className="text-[9px] text-cyan-300 font-normal">k={splitK}</div> : null}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
