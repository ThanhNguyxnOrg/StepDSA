import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface UniquePathsState {
  m: number;
  n: number;
  dp: (number | null)[][];
  currentCell?: [number, number];
  fromCells?: [number, number][];
}

export const uniquePathsModule: AlgorithmModule<{ m: number; n: number }, UniquePathsState> = {
  id: 'unique-paths',
  title: 'Unique Paths in 2D Grid (Grid DP)',
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(M * N)',
    timeAverage: 'O(M * N)',
    timeWorst: 'O(M * N)',
    spaceAuxiliary: 'O(M * N) (reducible to O(N))',
    worstCaseCondition: 'Iterates sequentially through all M x N grid cells',
  },
  theory: {
    overview:
      'A robot is located at the top-left corner of an M x N grid (grid[0][0]). The robot can only move either down or right at any point. The goal is to reach the bottom-right corner (grid[M - 1][N - 1]). How many unique possible paths exist?',
    whyItWorks:
      'To reach cell (r, c), the robot can only come from either the cell directly above (r - 1, c) or the cell directly to the left (r, c - 1). Therefore, the number of unique paths to (r, c) is the sum of unique paths to those two predecessors: dp[r][c] = dp[r - 1][c] + dp[r][c - 1].',
    invariant:
      'Grid DP Invariant: dp[r][c] represents the exact count of unique paths from (0, 0) to (r, c).',
    pitfalls: [
      'Incorrect boundary initialization: all cells in row 0 and column 0 have exactly 1 path (only moving straight right or straight down).',
      'Memory optimization: 2D matrix can be compressed to a 1D array of size N.',
    ],
  },
  presets: [
    {
      id: 'grid-3x4',
      label: '3 x 4 Grid',
      description: 'Standard 3 rows by 4 columns (10 paths)',
      data: { m: 3, n: 4 },
    },
    {
      id: 'grid-3x3',
      label: '3 x 3 Square Grid',
      description: 'Symmetric grid (6 paths)',
      data: { m: 3, n: 3 },
    },
  ],
  defaultInput: { m: 3, n: 4 },
  codeSnippets: {
    python: `def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]`,
    typescript: `function uniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let r = 1; r < m; ++r) {
    for (let c = 1; c < n; ++c) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
    }
  }
  return dp[m - 1][n - 1];
}`,
    cpp: `int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 1));
    for (int r = 1; r < m; ++r) {
        for (int c = 1; c < n; ++c) {
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
        }
    }
    return dp[m - 1][n - 1];
}`,
    java: `public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int r = 0; r < m; r++) dp[r][0] = 1;
    for (int c = 0; c < n; c++) dp[0][c] = 1;
    for (int r = 1; r < m; r++) {
        for (int c = 1; c < n; c++) {
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
        }
    }
    return dp[m - 1][n - 1];
}`,
    pseudocode: `function uniquePaths(m, n):
    for r from 0 to m - 1: dp[r][0] <- 1
    for c from 0 to n - 1: dp[0][c] <- 1
    for r from 1 to m - 1:
        for c from 1 to n - 1:
            dp[r][c] <- dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]`,
  },
  generateTimeline: (input) => {
    const m = Math.max(2, Math.min(input.m, 4));
    const n = Math.max(2, Math.min(input.n, 5));
    const dp: (number | null)[][] = Array.from({ length: m }, () => new Array(n).fill(null));

    const frames: ExecutionFrame<UniquePathsState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized DP grid of size ${m} x ${n}. Target destination is bottom-right cell (${
        m - 1
      }, ${n - 1}).`,
      isMilestone: true,
      milestoneTitle: 'Unique Paths Initialized',
      soundCue: { type: 'start' },
      variables: { m, n, totalCells: m * n },
      callStack: [{ name: 'uniquePaths', params: { m, n }, line: 2, isCurrent: true }],
      conditionEval: { expr: `m > 0 && n > 0`, result: true },
      state: { m, n, dp: dp.map((row) => [...row]) },
    });

    // Initialize first row and column to 1
    for (let c = 0; c < n; ++c) dp[0][c] = 1;
    for (let r = 0; r < m; ++r) dp[r][0] = 1;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 2,
      explanation: 'Base cases: all boundary cells in Row 0 and Col 0 set to 1 (only 1 straight path).',
      isMilestone: true,
      milestoneTitle: 'Initialized Boundary Base Cases = 1',
      soundCue: { type: 'step' },
      variables: { m, n, boundaryVal: 1 },
      callStack: [{ name: 'initBoundaries', params: { m, n }, line: 2, isCurrent: true }],
      conditionEval: { expr: `dp[0][0] == 1`, result: true },
      state: { m, n, dp: dp.map((row) => [...row]) },
    });

    // DP transitions
    for (let r = 1; r < m; ++r) {
      for (let c = 1; c < n; ++c) {
        const topVal = dp[r - 1][c]!;
        const leftVal = dp[r][c - 1]!;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Evaluating cell (${r}, ${c}): can arrive from above (${r - 1}, ${c}) [${topVal} paths] or left (${r}, ${
            c - 1
          }) [${leftVal} paths].`,
          soundCue: { type: 'compare' },
          variables: { r, c, fromTop: topVal, fromLeft: leftVal, sum: topVal + leftVal },
          callStack: [{ name: 'computeCell', params: { r, c }, line: 4, isCurrent: true }],
          conditionEval: { expr: `r >= 1 && c >= 1`, result: true },
          state: {
            m,
            n,
            dp: dp.map((row) => [...row]),
            currentCell: [r, c],
            fromCells: [
              [r - 1, c],
              [r, c - 1],
            ],
          },
        });

        dp[r][c] = topVal + leftVal;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Computed dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${topVal} + ${leftVal} = ${
            dp[r][c]
          } paths.`,
          isMilestone: true,
          milestoneTitle: `Cell (${r}, ${c}) = ${dp[r][c]}`,
          soundCue: { type: 'swap' },
          variables: { r, c, 'dp[r][c]': dp[r][c], topVal, leftVal },
          callStack: [{ name: 'setCellDP', params: { r, c, paths: dp[r][c] }, line: 5, isCurrent: true }],
          conditionEval: { expr: `dp[r][c] == topVal + leftVal`, result: true },
          state: {
            m,
            n,
            dp: dp.map((row) => [...row]),
            currentCell: [r, c],
          },
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `Reached destination (${m - 1}, ${n - 1})! Total unique paths = ${
        dp[m - 1][n - 1]
      }.`,
      isMilestone: true,
      milestoneTitle: `Result: ${dp[m - 1][n - 1]} Paths`,
      soundCue: { type: 'complete' },
      variables: { targetR: m - 1, targetC: n - 1, totalPaths: dp[m - 1][n - 1], completed: true },
      callStack: [{ name: 'uniquePaths.done', params: { paths: dp[m - 1][n - 1] }, line: 6, isCurrent: true }],
      conditionEval: { expr: `r == m - 1 && c == n - 1`, result: true },
      state: {
        m,
        n,
        dp: dp.map((row) => [...row]),
        currentCell: [m - 1, n - 1],
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<UniquePathsState>) => {
    const { m, n, dp, currentCell, fromCells = [] } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Grid Dimensions:{' '}
            <span className="text-cyan-400 font-bold">
              {m} rows x {n} cols
            </span>
          </div>
          {dp[m - 1][n - 1] !== null && (
            <div className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500 text-xs font-mono text-emerald-300 font-bold animate-pulse">
              TOTAL PATHS: {dp[m - 1][n - 1]}
            </div>
          )}
        </div>

        {/* 2D Grid Cells */}
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl shadow-2xl flex flex-col gap-3">
          {dp.map((row, r) => (
            <div key={r} className="flex gap-3">
              {row.map((val, c) => {
                const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
                const isFrom = fromCells.some(([fr, fc]) => fr === r && fc === c);
                const isStart = r === 0 && c === 0;
                const isDest = r === m - 1 && c === n - 1;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-base border-2 transition-all duration-300 ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-950/70 text-amber-200 ring-4 ring-amber-400/40 scale-105'
                        : isFrom
                        ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-2 ring-cyan-400/30'
                        : isDest
                        ? 'border-emerald-400 bg-emerald-950/50 text-emerald-200'
                        : val !== null
                        ? 'border-blue-500/40 bg-slate-900/90 text-white'
                        : 'border-slate-800 bg-slate-900/30 text-slate-600'
                    }`}
                  >
                    <span>{val ?? '—'}</span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      {isStart ? 'START' : isDest ? 'GOAL' : `(${r},${c})`}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
};
