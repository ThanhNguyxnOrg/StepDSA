import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface UniquePathsState {
  m: number;
  n: number;
  /** dp[r][c] = number of unique paths from (0,0) to (r,c); null = not filled yet. */
  dp: (number | null)[][];
  currentCell: [number, number] | null;
  fromCells: [number, number][];
  phase: 'init' | 'base' | 'fill' | 'done';
  actionType: 'INIT' | 'BASE_ROW' | 'BASE_COL' | 'CELL' | 'NONE';
  lastSum: { r: number; c: number; top: number; left: number; result: number } | null;
  stats: {
    boundaryCells: number;
    sumCells: number;
  };
}

const MAX_GRID = 6;

const DEFAULT_INPUT = { m: 3, n: 4 };

interface NormalisedInput {
  m: number;
  n: number;
  notes: string[];
}

function normalise(input: { m: number; n: number } | undefined): NormalisedInput {
  const notes: string[] = [];
  const readDim = (value: number | undefined, name: string): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 1;
    const rounded = Math.max(1, Math.min(MAX_GRID, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`${name} clamped from ${Math.round(value)} to ${rounded} (1..${MAX_GRID})`);
    }
    return rounded;
  };
  const m = readDim(input?.m, 'rows');
  const n = readDim(input?.n, 'columns');
  return { m, n, notes };
}

function pathsFor(m: number, n: number): number {
  // Binomial C(m+n-2, m-1).
  let result = 1;
  for (let k = 1; k <= m - 1; k++) {
    result = (result * (m + n - 2 - (m - 1 - k))) / k;
  }
  return result;
}

export const uniquePathsModule: AlgorithmModule<{ m: number; n: number }, UniquePathsState> = {
  id: 'unique-paths',
  title: 'Unique Paths in 2D Grid (Grid DP)',
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'house-robber', label: 'House Robber' },
    { id: 'longest-common-subsequence', label: 'LCS' },
    { id: 'edit-distance', label: 'Edit Distance (2D grid)' },
  ],
  complexity: {
    timeBest: 'O(M * N)',
    timeAverage: 'O(M * N)',
    timeWorst: 'O(M * N)',
    spaceAuxiliary: 'O(M * N) grid (reducible to O(N))',
    worstCaseCondition: 'Every inner cell is the sum of exactly two predecessors',
  },
  theory: {
    overview:
      'A robot starts at the top-left corner of an M x N grid and moves only right or down. How many distinct paths reach the bottom-right corner?',
    whyItWorks:
      'Every path into cell (r, c) takes its final step either from above (r-1, c) or from the left (r, c-1), and those two groups are disjoint and exhaustive, so their path counts add: dp[r][c] = dp[r-1][c] + dp[r][c-1].',
    invariant:
      'dp[r][c] holds the exact number of unique right/down paths from (0, 0) to (r, c); boundary cells are 1 because a straight line is the only way to reach them.',
    pitfalls: [
      'Boundary cells are 1, not 0: reaching any cell in row 0 or column 0 has exactly one straight-line way.',
      '(0, 0) belongs to both the first row and the first column — set it once, not twice.',
      'The count grows like a binomial coefficient: C(m+n-2, m-1), so large grids overflow 32-bit integers quickly.',
      'A 1×N or M×1 grid has exactly one path — the whole table is boundary.',
    ],
    steps: [
      'Allocate the M×N grid filled with 0.',
      'Set the first column dp[r][0] = 1 for every row: only one way — straight down.',
      'Set the first row dp[0][c] = 1 for every remaining column: only one way — straight right.',
      'For each inner cell in row-major order: dp[r][c] = dp[r-1][c] + dp[r][c-1].',
      'The answer is dp[M-1][N-1].',
    ],
    watchOut: [
      'Every inner cell is a pure sum — there is no max and no choice, which is why the walk back is unnecessary here.',
      'The counts double roughly every step diagonal-wise: a 6×6 grid already holds 924 paths.',
    ],
  },
  defaultInput: DEFAULT_INPUT,
  presets: [
    {
      id: 'grid-3x4',
      label: '3 x 4 Grid',
      description: 'Standard 3 rows by 4 columns — 10 unique paths (C(5,2))',
      data: { m: 3, n: 4 },
    },
    {
      id: 'grid-3x3',
      label: '3 x 3 Square Grid',
      description: 'Symmetric grid — 6 unique paths (C(4,2))',
      data: { m: 3, n: 3 },
    },
    {
      id: 'grid-2x2',
      label: '2 x 2 Grid',
      description: 'The smallest interesting grid — exactly 2 paths (right-then-down or down-then-right)',
      data: { m: 2, n: 2 },
    },
    {
      id: 'grid-1x5',
      label: '1 x 5 Corridor',
      description: 'A single row — the whole table is boundary and there is exactly 1 path',
      data: { m: 1, n: 5 },
    },
  ],
  codeSnippets: {
    pseudocode: `function uniquePaths(m, n):
    dp = m x n grid filled with 0
    for r = 0 to m - 1:
        dp[r][0] = 1
    for c = 1 to n - 1:
        dp[0][c] = 1
    for r = 1 to m - 1:
        for c = 1 to n - 1:
            dp[r][c] = dp[r-1][c] + dp[r][c-1]
    return dp[m-1][n-1]`,
    python: `def unique_paths(m, n):
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        dp[r][0] = 1
    for c in range(1, n):
        dp[0][c] = 1
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]`,
    typescript: `function uniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let r = 0; r < m; r++) {
    dp[r][0] = 1; }
  for (let c = 1; c < n; c++) {
    dp[0][c] = 1; }
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; } }
  return dp[m - 1][n - 1]; }`,
    cpp: `int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 0));
    for (int r = 0; r < m; r++) {
        dp[r][0] = 1; }
    for (int c = 1; c < n; c++) {
        dp[0][c] = 1; }
    for (int r = 1; r < m; r++) {
        for (int c = 1; c < n; c++) {
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; } }
    return dp[m - 1][n - 1]; }`,
    java: `public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    for (int r = 0; r < m; r++) {
        dp[r][0] = 1; }
    for (int c = 1; c < n; c++) {
        dp[0][c] = 1; }
    for (int r = 1; r < m; r++) {
        for (int c = 1; c < n; c++) {
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; } }
    return dp[m - 1][n - 1]; }`,
  },

  generateTimeline: (input: { m: number; n: number }): ExecutionFrame<UniquePathsState>[] => {
    const { m, n, notes } = normalise(input);
    const dp: (number | null)[][] = Array.from({ length: m }, () => new Array(n).fill(null));
    const frames: ExecutionFrame<UniquePathsState>[] = [];

    let phase: UniquePathsState['phase'] = 'init';
    let currentCell: [number, number] | null = null;
    let fromCells: [number, number][] = [];
    let actionType: UniquePathsState['actionType'] = 'INIT';
    let lastSum: UniquePathsState['lastSum'] = null;
    const stats = { boundaryCells: 0, sumCells: 0 };

    let firstSumMilestone = false;
    let boundaryCheckpointAdded = false;
    let sumCheckpointAdded = false;

    const snapshot = (): UniquePathsState => ({
      m,
      n,
      dp: dp.map((row) => [...row]),
      currentCell: currentCell ? ([...currentCell] as [number, number]) : null,
      fromCells: fromCells.map(([r, c]) => [r, c] as [number, number]),
      phase,
      actionType,
      lastSum: lastSum ? { ...lastSum } : null,
      stats: { ...stats },
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<UniquePathsState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<UniquePathsState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(),
        callStack: [
          {
            name: 'uniquePaths(m, n)',
            params: phase === 'fill' && currentCell ? { r: currentCell[0], c: currentCell[1] } : { m, n },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: stats.sumCells, swaps: 0, accesses: stats.sumCells * 2, lookups: 0 },
        invariantStatus: {
          label:
            phase === 'init'
              ? 'The grid starts empty: 0 means "no path counted yet"'
              : phase === 'base'
                ? `dp[${currentCell?.[0] ?? 0}][${currentCell?.[1] ?? 0}] = 1 — a straight line is the only way to reach a boundary cell`
                : phase === 'fill'
                  ? `dp[${currentCell?.[0]}][${currentCell?.[1]}] = ${dp[currentCell?.[0] ?? 0]?.[currentCell?.[1] ?? 0] ?? '—'} paths from (0,0)`
                  : `Answer: dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]} unique paths`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    pushFrame({
      codeLine: 2,
      action: 'INIT',
      explanation:
        `Allocate the ${m}×${n} grid for a robot that moves only right or down from (0,0) to (${m - 1},${n - 1}). Every cell starts at 0 until its path count is written.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: { m, n, cells: m * n, expectedPaths: pathsFor(m, n) },
      soundCue: 'start',
      pedagogy: {
        what: `A ${m} row(s) × ${n} column(s) grid with one dp cell per intersection.`,
        why: 'The robot only ever moves right or down, so the number of ways into a cell depends solely on its top and left neighbours — a perfect grid DP.',
        whatNext: m > 1 ? 'Fill the first column: one straight path down.' : 'A single row has no inner cells; the boundary is the whole answer.',
      },
    });

    phase = 'base';
    for (let r = 0; r < m; r++) {
      dp[r][0] = 1;
      stats.boundaryCells++;
      currentCell = [r, 0];
      fromCells = [];
      actionType = 'BASE_ROW';
      pushFrame({
        codeLine: 4,
        action: 'BASE_ROW',
        explanation: `dp[${r}][0] = 1: the first column can only be reached by moving straight down ${r} time(s) — exactly one path.`,
        variables: { r, c: 0, value: 1, reason: 'straight down only' },
        milestone: r === 0 ? 'Boundary Base Case' : undefined,
        soundCue: 'step',
        checkpoint:
          !boundaryCheckpointAdded && n > 1
            ? {
                id: 'unique-paths-boundary',
                question: `The robot can only move right or down. How many distinct paths reach a cell in the first column, like (${r}, 0)?`,
                options: [
                  '1 — only one way: straight down, no choices exist',
                  '2 — one for each direction it could have come from',
                  `${r + 1} — one per cell visited so far`,
                ],
                correctIndex: 0,
                explanation: 'With only right/down moves, a first-column cell cannot be entered from the left, so the straight-down walk is the single possibility.',
                hint: 'Which predecessor cells even exist next to the first column?',
              }
            : undefined,
        pedagogy: {
          what: `The first column becomes 1 at row ${r}.`,
          why: 'No cell to the left exists, so the only arrival is from above — a single straight path.',
          whatNext: r + 1 < m ? `Set dp[${r + 1}][0] = 1.` : n > 1 ? 'First column done; fill the first row.' : 'A single-column grid is pure boundary — the answer is 1.',
        },
      });
      if (n > 1) boundaryCheckpointAdded = true;
    }

    for (let c = 1; c < n; c++) {
      dp[0][c] = 1;
      stats.boundaryCells++;
      currentCell = [0, c];
      fromCells = [];
      actionType = 'BASE_COL';
      pushFrame({
        codeLine: 6,
        action: 'BASE_COL',
        explanation: `dp[0][${c}] = 1: the first row can only be reached by moving straight right ${c} time(s) — exactly one path.`,
        variables: { r: 0, c, value: 1, reason: 'straight right only' },
        soundCue: 'step',
        pedagogy: {
          what: `The first row becomes 1 at column ${c}.`,
          why: 'No cell above exists, so the only arrival is from the left — again a single straight path.',
          whatNext: c + 1 < n ? `Set dp[0][${c + 1}] = 1.` : m > 1 ? `Boundaries are set: start summing at cell (1, 1).` : 'A single-row grid has no inner cells.',
        },
      });
    }

    phase = 'fill';
    for (let r = 1; r < m; r++) {
      for (let c = 1; c < n; c++) {
        const top = dp[r - 1][c] ?? 0;
        const left = dp[r][c - 1] ?? 0;
        const result = top + left;
        currentCell = [r, c];
        fromCells = [
          [r - 1, c],
          [r, c - 1],
        ];
        actionType = 'CELL';

        pushFrame({
          codeLine: 9,
          action: 'CELL_SUM',
          explanation: `dp[${r}][${c}] = dp[${r - 1}][${c}] + dp[${r}][${c - 1}] = ${top} + ${left} = ${result}: every path arrives from the top or from the left, and no path does both.`,
          conditionEval: {
            expr: `dp[${r - 1}][${c}] + dp[${r}][${c - 1}]`,
            condition: `${top} + ${left}`,
            result,
            formatted: `dp[${r}][${c}] = ${result}`,
          },
          variables: {
            r,
            c,
            fromTop: top,
            fromLeft: left,
            'dp[r][c]': result,
            sumCells: stats.sumCells + 1,
          },
          milestone: !firstSumMilestone ? 'First Sum' : undefined,
          soundCue: 'compare',
          checkpoint:
            !sumCheckpointAdded
              ? {
                  id: 'unique-paths-first-sum',
                  question: `Cell (${r}, ${c}) can be entered from the top (dp[${r - 1}][${c}] = ${top}) or from the left (dp[${r}][${c - 1}] = ${left}). How many paths reach it?`,
                  options: [
                    `${result} — the two groups of paths add up`,
                    `${Math.max(top, left)} — only the larger group survives`,
                    `${top * left} — every top path pairs with every left path`,
                  ],
                  correctIndex: 0,
                  explanation: `The final step of a path is unique (either the last move was down or right), so the counts simply add: dp[${r}][${c}] = ${result}.`,
                  hint: 'A path cannot arrive from both directions at once — the two groups are disjoint.',
                }
              : undefined,
          pedagogy: {
            what: `${result} paths reach cell (${r}, ${c}): ${top} through the top + ${left} through the left.`,
            why: 'The last move partitions all paths into two disjoint sets, so the counts add with no double counting.',
            whatNext:
              c + 1 < n
                ? `Move to cell (${r}, ${c + 1}).`
                : r + 1 < m
                  ? `Row ${r} is complete; start row ${r + 1}.`
                  : `Grid complete: dp[${m - 1}][${n - 1}] = ${result} is the answer.`,
          },
        });
        dp[r][c] = result;
        stats.sumCells++;
        lastSum = { r, c, top, left, result };
        if (!firstSumMilestone) firstSumMilestone = true;
        sumCheckpointAdded = true;
      }
    }

    phase = 'done';
    currentCell = [m - 1, n - 1];
    fromCells = [];
    actionType = 'NONE';

    pushFrame({
      codeLine: 10,
      action: 'GRID_DONE',
      explanation: `Table filled (${stats.boundaryCells} boundary + ${stats.sumCells} summed cell(s)): dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]} unique paths — matching C(${m + n - 2}, ${m - 1}).`,
      variables: {
        totalPaths: dp[m - 1][n - 1],
        boundaryCells: stats.boundaryCells,
        sumCells: stats.sumCells,
      },
      milestone: 'Grid Fill Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `Every cell holds its exact path count; the bottom-right cell is the answer ${dp[m - 1][n - 1]}.`,
        why: 'Sums flow row by row from the boundary, so the goal cell accumulates all possibilities without enumerating paths.',
        whatNext: 'No walk is needed — the count itself is the answer. Try a square or corridor preset to see the shape of the counts.',
      },
    });

    pushFrame({
      codeLine: 10,
      action: 'DONE',
      explanation: `Unique Paths solved: ${dp[m - 1][n - 1]} path(s) from (0,0) to (${m - 1},${n - 1}) moving only right or down.`,
      conditionEval: {
        expr: 'dp[m-1][n-1] == C(m+n-2, m-1)',
        condition: `${dp[m - 1][n - 1]} == ${pathsFor(m, n)}`,
        result: dp[m - 1][n - 1] === pathsFor(m, n),
      },
      variables: {
        totalPaths: dp[m - 1][n - 1],
        start: '(0, 0)',
        goal: `(${m - 1}, ${n - 1})`,
      },
      milestone: 'Goal Reached',
      soundCue: 'finish',
      pedagogy: {
        what: `The answer is ${dp[m - 1][n - 1]} unique path(s).`,
        why: 'The goal count was assembled from its two predecessors, which were assembled from theirs, back to the boundary ones.',
        whatNext: 'Compare presets: a corridor has exactly 1 path, a square grid grows like a binomial coefficient.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<UniquePathsState>) => {
    const { m, n, dp, currentCell, fromCells, phase, actionType, lastSum, stats } = frame.state;

    const phaseLabel = phase === 'init' ? 'allocate' : phase === 'base' ? 'boundary' : phase === 'fill' ? 'summing' : 'done';
    const fromSet = new Set((fromCells ?? []).map(([r, c]) => `${r}:${c}`));

    const formula = lastSum && phase === 'fill'
      ? `dp[${lastSum.r}][${lastSum.c}] = dp[${lastSum.r - 1}][${lastSum.c}] (${lastSum.top}) + dp[${lastSum.r}][${lastSum.c - 1}] (${lastSum.left}) = ${lastSum.result}`
      : phase === 'done'
        ? `answer: dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]} unique paths`
        : 'dp[r][c] = dp[r-1][c] + dp[r][c-1] — boundaries are 1';

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span
              className={`rounded-md border px-2 py-0.5 font-bold uppercase ${
                phase === 'done'
                  ? 'border-violet-500/40 bg-violet-500/20 text-violet-200'
                  : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200'
              }`}
            >
              {phaseLabel}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300">
              grid <span className="font-bold text-amber-300">{m}×{n}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              boundary <span className="font-bold text-amber-300">{stats.boundaryCells}</span>/{m + n - 1}
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              summed <span className="font-bold text-cyan-300">{stats.sumCells}</span>/{Math.max(0, (m - 1) * (n - 1))}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              paths to goal <span className="font-bold">{dp[m - 1]?.[n - 1] ?? '—'}</span>
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 pb-4">
            <div className="mb-2 flex flex-col gap-1.5">
              {dp.map((row, r) => (
                <div key={r} className="flex gap-1.5">
                  {row.map((val, c) => {
                    const isCurrent = currentCell?.[0] === r && currentCell?.[1] === c;
                    const isFrom = fromSet.has(`${r}:${c}`);
                    const isStart = r === 0 && c === 0;
                    const isGoal = r === m - 1 && c === n - 1;
                    let style = 'border-slate-800 bg-slate-900/30 text-slate-600';
                    if (isCurrent) {
                      style =
                        actionType === 'BASE_ROW' || actionType === 'BASE_COL'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-100 ring-2 ring-amber-400/40'
                          : 'border-emerald-400 bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/40';
                    } else if (isFrom) {
                      style = 'border-cyan-400 bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/40';
                    } else if (isGoal) {
                      style = 'border-violet-500 bg-violet-950/40 text-violet-200';
                    } else if (val !== null) {
                      style = 'border-slate-700 bg-slate-900/70 text-slate-200';
                    }
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl border-2 font-mono transition-all ${style}`}
                      >
                        <span className="text-base font-bold">{val ?? '—'}</span>
                        <span className="text-[8px] font-normal text-slate-500">
                          {isStart ? 'START' : isGoal ? 'GOAL' : `(${r},${c})`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>boundary cell = 1 (straight line only)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>top / left predecessors being summed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  <span>cell being computed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-violet-400" />
                  <span>goal cell</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Stats</div>
              <div className="flex flex-col gap-0.5">
                <span>boundary cells <span className="font-bold text-amber-300">{stats.boundaryCells}</span></span>
                <span>summed cells <span className="font-bold text-cyan-300">{stats.sumCells}</span></span>
                <span>formula check <span className="font-bold text-emerald-300">C({m + n - 2}, {m - 1}) = {pathsFor(m, n)}</span></span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Why sums, not max?</div>
              <div className="text-[10px] leading-relaxed text-slate-400">
                A path's final move is either down or right — never both — so the two arrival groups are disjoint. Counts add; no path is counted twice.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
