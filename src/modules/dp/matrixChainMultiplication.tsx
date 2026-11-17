import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface MCMState {
  /** p has length n + 1: matrix A_i has dimensions p[i-1] x p[i]. */
  dims: number[];
  n: number;
  /** costTable[i][j] = minimum scalar multiplications for A_i..A_j. */
  costTable: number[][];
  /** splitTable[i][j] = optimal split point k for A_i..A_j (0 = unset). */
  splitTable: number[][];
  currentI: number;
  currentJ: number;
  currentK: number;
  currentLen: number;
  phase: 'init' | 'fill' | 'backtrack' | 'done';
  actionType: 'INIT' | 'ALLOC' | 'L_START' | 'SET_INF' | 'TRY' | 'WRITE' | 'RECORD' | 'WALK' | 'NONE';
  candidate: {
    i: number;
    j: number;
    k: number;
    leftCost: number;
    rightCost: number;
    multCost: number;
    totalCost: number;
    bestBefore: number;
    improved: boolean;
  } | null;
  dependencies?: {
    leftCell?: [number, number];
    rightCell?: [number, number];
  };
  /** Intervals expanded by the reconstruction, outermost first. */
  splitPath: [number, number][];
  formula: string;
  minCost: number;
  stats: {
    intervals: number;
    splits: number;
    updates: number;
    reconSteps: number;
  };
}

const MAX_MATRICES = 6;
const MAX_DIM = 999;

const DEFAULT_DIMS = [10, 20, 30, 40, 30];

interface NormalisedInput {
  dims: number[];
  notes: string[];
}

function normalise(input: { dims: number[] } | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = Array.isArray(input?.dims) ? input.dims : DEFAULT_DIMS;
  const usable = raw.filter((value) => typeof value === 'number' && Number.isFinite(value));

  if (usable.length < 2) {
    notes.push('at least 2 dimensions are needed for one matrix, so the default chain is used');
    return { dims: [...DEFAULT_DIMS], notes };
  }
  if (usable.length < raw.length) {
    notes.push(`${raw.length - usable.length} non-numeric dimension(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.max(1, Math.min(MAX_DIM, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`dimension ${Math.round(value)} clamped to ${rounded} (1..${MAX_DIM})`);
    }
    return rounded;
  });

  let dims = clamped;
  if (dims.length > MAX_MATRICES + 1) {
    notes.push(`${dims.length - 1} matrices truncated to ${MAX_MATRICES} for a readable table`);
    dims = dims.slice(0, MAX_MATRICES + 1);
  }

  return { dims, notes };
}

function buildFormula(splitTable: number[][], i: number, j: number): string {
  if (i === j) return `A${i}`;
  const k = splitTable[i][j];
  if (!k) return `(A${i}..A${j})`;
  return `(${buildFormula(splitTable, i, k)} × ${buildFormula(splitTable, k + 1, j)})`;
}

export const matrixChainMultiplicationModule: AlgorithmModule<
  { dims: number[] },
  MCMState
> = {
  id: 'matrix-chain-multiplication',
  title: 'Matrix Chain Multiplication (MCM Interval DP O(N^3))',
  category: 'dynamic-programming',
  difficulty: 'Advanced',
  relatedModules: [
    { id: 'burst-balloons', label: 'Burst Balloons (interval DP)' },
    { id: 'longest-palindromic-substring', label: 'Longest Palindromic Substring' },
    { id: 'knapsack-01', label: '0/1 Knapsack' },
  ],
  complexity: {
    timeBest: 'O(N^3)',
    timeAverage: 'O(N^3)',
    timeWorst: 'O(N^3)',
    spaceAuxiliary: 'O(N^2) for the cost and split tables',
    worstCaseCondition: 'Every interval tests every split point: sum over L of (N-L+1)(L-1) = N(N-1)(N+1)/6 splits',
  },
  theory: {
    overview:
      'Given a chain of matrices A1..An where matrix Ai has dimensions p[i-1] × p[i], find the parenthesisation that minimises the total number of scalar multiplications.',
    whyItWorks:
      'Matrix multiplication is associative but not commutative: (AB)C can cost far less than A(BC). For interval [i..j] every split point k is tried — cost = m[i][k] + m[k+1][j] + p[i-1]·p[k]·p[j] — and the minimum is exact because the two sub-chains are independent.',
    invariant:
      'm[i][j] holds the exact minimum scalar operations to compute A_i × … × A_j, and splitTable[i][j] records one split achieving it.',
    pitfalls: [
      'Off-by-one indexing: matrix Ai has dimensions p[i-1] × p[i], so the chain uses p, not the matrix list.',
      'Filling row by row is wrong: m[i][j] needs sub-answers of shorter chains, so intervals must be processed by increasing chain length L.',
      'The diagonal is 0, not infinity: multiplying a single matrix needs no work.',
      'A cheaper split can appear later, so splitTable[i][j] is overwritten — only the final table reconstructs the optimal order.',
    ],
    steps: [
      'Allocate m and split as (N+1)×(N+1) tables; the diagonal m[i][i] = 0.',
      'For each chain length L from 2 to N, for each interval [i..j] with j = i + L - 1: set m[i][j] = infinity.',
      'For each split k in [i, j): cost = m[i][k] + m[k+1][j] + p[i-1]·p[k]·p[j].',
      'If the cost beats m[i][j], write it and record splitTable[i][j] = k.',
      'The answer is m[1][N]; read splitTable recursively from (1, N) to print the parenthesisation.',
    ],
    watchOut: [
      'Every split of the winning interval is tried before the minimum is finalised, so an early "new minimum" frame can still be beaten.',
      'Leaves A_i are single matrices: the reconstruction splits until every piece is one matrix.',
    ],
  },
  presets: [
    {
      id: 'classic-4',
      label: 'Classic 4 Matrices: dims = [10, 20, 30, 40, 30]',
      description: 'Matrices 10×20, 20×30, 30×40, 40×30 — optimal 30,000 ops via ((A1×A2)×A3)×A4 split tree',
      data: { dims: [10, 20, 30, 40, 30] },
    },
    {
      id: 'dramatic-diff',
      label: 'Extreme Variance: dims = [10, 100, 5, 50]',
      description: 'The good split costs 7,500 ops; the bad one 75,000 — a 10× difference from one parenthesisation',
      data: { dims: [10, 100, 5, 50] },
    },
    {
      id: 'five-matrices',
      label: '5 Matrices: dims = [40, 20, 30, 10, 30]',
      description: 'Nested parenthesisations across 4 matrices and 3 chain lengths',
      data: { dims: [40, 20, 30, 10, 30] },
    },
    {
      id: 'two-matrices',
      label: 'Single Product: dims = [10, 20, 30]',
      description: 'Two matrices have exactly one parenthesisation — the table is one cell',
      data: { dims: [10, 20, 30] },
    },
  ],
  defaultInput: { dims: DEFAULT_DIMS },
  codeSnippets: {
    pseudocode: `function matrixChainOrder(p):
    n = length(p) - 1
    m = (n + 1) x (n + 1) matrix of 0
    s = (n + 1) x (n + 1) matrix of 0
    for L = 2 to n:
        for i = 1 to n - L + 1:
            j = i + L - 1
            m[i][j] = INFINITY
            for k = i to j - 1:
                cost = m[i][k] + m[k+1][j] + p[i-1] * p[k] * p[j]
                if cost < m[i][j]:
                    m[i][j] = cost
                    s[i][j] = k
    order = buildOrder(s, 1, n)
    return m[1][n], order`,
    python: `def matrix_chain_order(p):
    n = len(p) - 1
    m = [[0] * (n + 1) for _ in range(n + 1)]
    s = [[0] * (n + 1) for _ in range(n + 1)]
    for L in range(2, n + 1):
        for i in range(1, n - L + 2):
            j = i + L - 1
            m[i][j] = float('inf')
            for k in range(i, j):
                cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
                if cost < m[i][j]:
                    m[i][j] = cost
                    s[i][j] = k
    order = build_order(s, 1, n)
    return m[1][n], order`,
    typescript: `function matrixChainOrder(p: number[]): [number, string] {
  const n = p.length - 1;
  const m: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  const s: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  for (let L = 2; L <= n; L++) {
    for (let i = 1; i <= n - L + 1; i++) {
      const j = i + L - 1;
      m[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
        if (cost < m[i][j]) {
          m[i][j] = cost;
          s[i][j] = k; } } } }
  const order = buildOrder(s, 1, n);
  return [m[1][n], order]; }`,
    cpp: `pair<long long, string> matrixChainOrder(const vector<int>& p) {
    int n = p.size() - 1;
    vector<vector<long long>> m(n + 1, vector<long long>(n + 1, 0));
    vector<vector<int>> s(n + 1, vector<int>(n + 1, 0));
    for (int L = 2; L <= n; L++) {
        for (int i = 1; i <= n - L + 1; i++) {
            int j = i + L - 1;
            m[i][j] = LLONG_MAX;
            for (int k = i; k < j; k++) {
                long long cost = m[i][k] + m[k + 1][j] + (long long)p[i - 1] * p[k] * p[j];
                if (cost < m[i][j]) {
                    m[i][j] = cost;
                    s[i][j] = k; } } } }
    string order = buildOrder(s, 1, n);
    return {m[1][n], order}; }`,
    java: `public long matrixChainOrder(int[] p, int[][] s) {
    int n = p.length - 1;
    long[][] m = new long[n + 1][n + 1];
    int[][] sTable = new int[n + 1][n + 1];
    for (int L = 2; L <= n; L++) {
        for (int i = 1; i <= n - L + 1; i++) {
            int j = i + L - 1;
            m[i][j] = Long.MAX_VALUE;
            for (int k = i; k < j; k++) {
                long cost = m[i][k] + m[k + 1][j] + (long) p[i - 1] * p[k] * p[j];
                if (cost < m[i][j]) {
                    m[i][j] = cost;
                    sTable[i][j] = k; } } } }
    String order = buildOrder(sTable, 1, n);
    return m[1][n]; }`,
  },

  generateTimeline: (input: { dims: number[] }): ExecutionFrame<MCMState>[] => {
    const { dims, notes } = normalise(input);
    const n = dims.length - 1;

    const m: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    const s: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));

    const frames: ExecutionFrame<MCMState>[] = [];
    const splitPath: [number, number][] = [];

    let phase: MCMState['phase'] = 'init';
    let currentI = 0;
    let currentJ = 0;
    let currentK = 0;
    let currentLen = 1;
    let actionType: MCMState['actionType'] = 'INIT';
    let candidate: MCMState['candidate'] = null;
    let dependencies: MCMState['dependencies'] = undefined;
    let formula = '';
    let minCost = n >= 1 ? 0 : 0;

    const stats = { intervals: 0, splits: 0, updates: 0, reconSteps: 0 };

    let firstMinMilestone = false;
    let firstSplitMilestone = false;
    let choiceCheckpointAdded = false;
    let walkCheckpointAdded = false;

    const snapshot = (): MCMState => ({
      dims: [...dims],
      n,
      costTable: m.map((row) => [...row]),
      splitTable: s.map((row) => [...row]),
      currentI,
      currentJ,
      currentK,
      currentLen,
      phase,
      actionType,
      candidate: candidate ? { ...candidate } : null,
      dependencies: dependencies
        ? {
            leftCell: dependencies.leftCell ? ([...dependencies.leftCell] as [number, number]) : undefined,
            rightCell: dependencies.rightCell ? ([...dependencies.rightCell] as [number, number]) : undefined,
          }
        : undefined,
      splitPath: splitPath.map(([i, j]) => [i, j] as [number, number]),
      formula,
      minCost,
      stats: { ...stats },
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<MCMState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<MCMState>['soundCue'];
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
            name:
              phase === 'backtrack' || phase === 'done'
                ? 'buildOrder(s, 1, n)'
                : 'matrixChainOrder(p)',
            params:
              phase === 'fill'
                ? { L: currentLen, i: currentI, j: currentJ, k: currentK }
                : phase === 'backtrack'
                  ? { interval: `A${currentI}..A${currentJ}` }
                  : { n },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: stats.splits, swaps: stats.updates, accesses: stats.splits * 3, lookups: stats.reconSteps },
        invariantStatus: {
          label:
            phase === 'init'
              ? 'm[i][i] = 0: multiplying a single matrix needs no work'
              : phase === 'fill'
                ? `m[${currentI}][${currentJ}] = ${m[currentI]?.[currentJ] === Infinity ? '∞' : m[currentI]?.[currentJ] ?? 0} = min operations for A${currentI}..A${currentJ}`
                : phase === 'backtrack'
                  ? `Splitting A${currentI}..A${currentJ} at k = ${currentK}: ${stats.reconSteps} split(s) revealed`
                  : `Solved: m[1][${n}] = ${minCost} with ${formula}`,
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
        `n = length(p) − 1 = ${n}: the dimension list [${dims.join(', ')}] describes ${n} matrix(es), where A_i is ${dims[0]}×${dims[1]}${n > 1 ? ` … A_${n} is ${dims[n - 1]}×${dims[n]}` : ''}.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: { n, dimensions: dims.join(', '), matrices: n },
      soundCue: 'start',
      pedagogy: {
        what: `A chain of ${n} matrix(es) is fully described by ${n + 1} dimensions.`,
        why: 'Adjacent matrices share a dimension (A_i is p[i-1] × p[i]), so the list p encodes the whole chain without naming the matrices.',
        whatNext: 'Allocate the cost and split tables.',
      },
    });

    currentI = 1;
    currentJ = n >= 1 ? 1 : 0;
    actionType = 'ALLOC';
    pushFrame({
      codeLine: 3,
      action: 'ALLOC',
      explanation: `Allocate (${n + 1})×(${n + 1}) tables m (costs) and s (split points). The diagonal m[i][i] = 0 is the base case: a single matrix needs no multiplication.`,
      variables: {
        tableSize: `${n + 1} x ${n + 1}`,
        diagonal: 'm[i][i] = 0',
        splitTable: 's[i][j] records the best k (0 = unset)',
      },
      soundCue: 'step',
      pedagogy: {
        what: 'Two tables are born: m for minimum costs, s for the winning split of each interval.',
        why: 'Costs alone cannot rebuild the parenthesisation; s stores the argument of the min so buildOrder can read it back later.',
        whatNext: n > 1 ? `Start with chain length L = 2 (adjacent pairs).` : 'n = 1, so no chain longer than one matrix exists — the answer is 0.',
      },
    });

    if (n === 1) {
      phase = 'fill';
      pushFrame({
        codeLine: 5,
        action: 'TABLE_DONE',
        explanation:
          'n = 1, so the length loop (L = 2..n) never runs: the only entry is the diagonal m[1][1] = 0 — one matrix is already "multiplied".',
        variables: { n, skippedLengths: 0, minCost: 0 },
        milestone: 'Table Complete',
        soundCue: 'complete',
        pedagogy: {
          what: 'With a single matrix there is nothing to optimise.',
          why: 'The loop range 2..1 is empty and m[1][1] = 0 already satisfies the invariant.',
          whatNext: 'The reconstruction is a single leaf A1 with no split.',
        },
      });

      phase = 'backtrack';
      currentI = 1;
      currentJ = 1;
      currentK = 0;
      actionType = 'WALK';
      pushFrame({
        codeLine: 14,
        action: 'BT_START',
        explanation: 'buildOrder starts at (1, 1): the interval is a single matrix, so the order is just "A1" with no split.',
        variables: { interval: 'A1..A1', split: 'none' },
        soundCue: 'start',
        pedagogy: {
          what: 'The reconstruction visits the only interval, which is a leaf.',
          why: 'A one-matrix chain has no multiplication, so the parenthesisation is the matrix itself.',
          whatNext: 'Return m[1][1] = 0 with order "A1".',
        },
      });

      phase = 'done';
      formula = 'A1';
      minCost = 0;
      pushFrame({
        codeLine: 15,
        action: 'DONE',
        explanation: 'Solved: one matrix, zero scalar multiplications, order "A1".',
        conditionEval: { expr: 'n == 1', condition: '1 == 1', result: true },
        variables: { minCost: 0, order: 'A1', matrices: 1 },
        milestone: 'Optimal Order Found',
        soundCue: 'finish',
        pedagogy: {
          what: 'The answer is 0 operations for the trivial chain.',
          why: 'No pair of matrices exists, so no multiplication happens.',
          whatNext: 'Try a preset with 3+ matrices to see splits compete.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    phase = 'fill';
    for (let L = 2; L <= n; L++) {
      currentLen = L;
      currentI = 0;
      currentJ = 0;
      currentK = 0;
      candidate = null;
      dependencies = undefined;
      actionType = 'L_START';

      pushFrame({
        codeLine: 5,
        action: 'L_START',
        explanation: `Chain length L = ${L}: solve every interval A_i..A_j with j = i + ${L - 1}. Shorter chains are already optimal, so each longer interval can be split into two solved pieces.`,
        variables: {
          L,
          intervals: n - L + 1,
          splitsPerInterval: L - 1,
        },
        soundCue: 'step',
        pedagogy: {
          what: `All intervals of ${L} matrix(es) are solved in this sweep.`,
          why: 'm[i][j] depends on m[i][k] and m[k+1][j], both of length < L — increasing L guarantees every dependency is ready.',
          whatNext: `Evaluate interval A1..A${L} (j = 1 + ${L - 1}).`,
        },
      });

      for (let i = 1; i <= n - L + 1; i++) {
        const j = i + L - 1;
        currentI = i;
        currentJ = j;
        currentK = 0;
        stats.intervals++;
        m[i][j] = Infinity;
        candidate = null;
        dependencies = undefined;
        actionType = 'SET_INF';

        pushFrame({
          codeLine: 8,
          action: 'SET_INF',
          explanation: `Interval A${i}..A${j} (length ${L}): m[${i}][${j}] = ∞ — "not solved yet" — before trying its ${L - 1} split point(s) k = ${i}..${j - 1}.`,
          variables: {
            L,
            i: `A${i}`,
            j: `A${j}`,
            splitsToTry: L - 1,
            'm[i][j]': 'INF',
          },
          soundCue: 'step',
          pedagogy: {
            what: `The cell m[${i}][${j}] is armed with infinity so any real cost becomes the first minimum.`,
            why: 'The minimum must start worse than every possible cost; the diagonal stays 0 because single matrices are already solved.',
            whatNext: `Try split k = ${i}: left A${i}..A${i}, right A${i + 1}..A${j}.`,
          },
        });

        for (let k = i; k < j; k++) {
          const leftCost = m[i][k];
          const rightCost = m[k + 1][j];
          const multCost = dims[i - 1] * dims[k] * dims[j];
          const totalCost = leftCost + rightCost + multCost;
          const bestBefore = m[i][j];
          const improved = totalCost < bestBefore;
          stats.splits++;
          currentK = k;
          dependencies = {
            leftCell: [i, k],
            rightCell: [k + 1, j],
          };
          actionType = 'TRY';
          candidate = { i, j, k, leftCost, rightCost, multCost, totalCost, bestBefore, improved };

          pushFrame({
            codeLine: 10,
            action: 'TRY_SPLIT',
            explanation: `Split A${i}..A${j} after A${k}: cost = m[${i}][${k}] (${leftCost}) + m[${k + 1}][${j}] (${rightCost}) + ${dims[i - 1]}×${dims[k]}×${dims[j]} (${multCost}) = ${totalCost} vs current min ${bestBefore === Infinity ? '∞' : bestBefore}.`,
            conditionEval: {
              expr: `cost < m[${i}][${j}]`,
              condition: `${totalCost} < ${bestBefore === Infinity ? 'INF' : bestBefore}`,
              result: improved,
            },
            variables: {
              L,
              i: `A${i}`,
              j: `A${j}`,
              splitK: `A${k}`,
              leftCost,
              rightCost,
              multCost,
              candidateCost: totalCost,
              currentMin: bestBefore === Infinity ? 'INF' : bestBefore,
              improved,
            },
            soundCue: 'compare',
            checkpoint:
              !choiceCheckpointAdded && bestBefore !== Infinity && totalCost !== bestBefore
                ? {
                    id: 'mcm-split-cost',
                    question: `Interval A${i}..A${j}: split k = ${k} costs m[${i}][${k}] + m[${k + 1}][${j}] + ${multCost} = ${totalCost}, while the current minimum is ${bestBefore}. What becomes m[${i}][${j}]?`,
                    options: [
                      `${Math.min(totalCost, bestBefore)} — the cheaper of the two`,
                      `${Math.max(totalCost, bestBefore)} — the more expensive of the two`,
                      `${totalCost + bestBefore} — the two costs added together`,
                    ],
                    correctIndex: improved ? 0 : 1,
                    explanation: improved
                      ? `${totalCost} < ${bestBefore}, so m[${i}][${j}] = ${totalCost} and splitTable[${i}][${j}] = ${k}.`
                      : `${totalCost} >= ${bestBefore}, so the current minimum ${bestBefore} stands and this split is discarded.`,
                    hint: 'The recurrence keeps the minimum over every split, unlike the knapsack maximum.',
                  }
                : undefined,
            pedagogy: {
              what: `The split after A${k} prices the whole product as left + right + join.`,
              why: 'The join cost p[i-1]·p[k]·p[j] is fixed by the split, and both sub-chains are already optimal because shorter lengths were solved first.',
              whatNext: improved
                ? `Write ${totalCost} into m[${i}][${j}] and record split ${k}.`
                : `Keep the current minimum and try the next split.`,
            },
          });
          if (bestBefore !== Infinity && totalCost !== bestBefore) choiceCheckpointAdded = true;

          if (improved) {
            m[i][j] = totalCost;
            stats.updates++;
            actionType = 'WRITE';

            pushFrame({
              codeLine: 12,
              action: 'WRITE_MIN',
              explanation: `m[${i}][${j}] = ${totalCost}: splitting after A${k} beats the previous best ${bestBefore === Infinity ? '∞' : bestBefore}.`,
              conditionEval: {
                expr: `m[${i}][${j}] = ${leftCost} + ${rightCost} + ${multCost}`,
                condition: `${totalCost}`,
                result: totalCost,
                formatted: `m[${i}][${j}] = ${totalCost}`,
              },
              variables: {
                i: `A${i}`,
                j: `A${j}`,
                previousMin: bestBefore === Infinity ? 'INF' : bestBefore,
                'm[i][j]': totalCost,
                updates: stats.updates,
              },
              milestone: !firstMinMilestone ? 'First Minimum' : undefined,
              soundCue: 'success',
              pedagogy: {
                what: `m[${i}][${j}] drops from ${bestBefore === Infinity ? '∞' : bestBefore} to ${totalCost}.`,
                why: 'A cheaper way to break the product in two halves was found; later splits may still beat it.',
                whatNext: `Record splitTable[${i}][${j}] = ${k} so the order can be rebuilt.`,
              },
            });
            if (!firstMinMilestone) firstMinMilestone = true;

            s[i][j] = k;
            actionType = 'RECORD';

            pushFrame({
              codeLine: 13,
              action: 'RECORD_SPLIT',
              explanation: `splitTable[${i}][${j}] = ${k}: the best known parenthesisation of A${i}..A${j} is (A${i}..A${k}) × (A${k + 1}..A${j}).`,
              variables: {
                i: `A${i}`,
                j: `A${j}`,
                splitK: k,
                leftChain: `A${i}..A${k}`,
                rightChain: `A${k + 1}..A${j}`,
              },
              soundCue: 'select',
              pedagogy: {
                what: `The split table now remembers k = ${k} for this interval.`,
                why: 'The record is overwritten whenever a cheaper split appears; only the final table is used by buildOrder.',
                whatNext: k + 1 < j ? `Try split k = ${k + 1}.` : `Interval A${i}..A${j} is complete.`,
              },
            });
          }
        }
      }
    }

    currentI = -1;
    currentJ = -1;
    currentK = 0;
    candidate = null;
    dependencies = undefined;
    actionType = 'L_START';

    pushFrame({
      codeLine: 5,
      action: 'TABLE_DONE',
      explanation: `Table filled: m[1][${n}] = ${m[1][n]} is the minimum number of scalar multiplications (${stats.intervals} interval(s), ${stats.splits} split(s) tested, ${stats.updates} new minima).`,
      variables: {
        minCost: m[1][n],
        intervals: stats.intervals,
        splits: stats.splits,
        updates: stats.updates,
      },
      milestone: 'Table Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `Every interval up to the full chain A1..A${n} has its exact minimum cost.`,
        why: 'Each m[i][j] used only shorter chains, so the bottom-right cell is optimal without enumerating all parenthesisations (which grow like Catalan numbers).',
        whatNext: `Read splitTable[1][${n}] recursively to rebuild the optimal order.`,
      },
    });

    // ─── reconstruction ───
    phase = 'backtrack';
    const finalFormula = buildFormula(s, 1, n);
    minCost = m[1][n];

    pushFrame({
      codeLine: 14,
      action: 'BT_START',
      explanation: `buildOrder(s, 1, ${n}): start at the full interval A1..A${n} whose minimum cost ${m[1][n]} is known; the split table tells where to break it.`,
      variables: { interval: `A1..A${n}`, minCost: m[1][n] },
      soundCue: 'start',
      pedagogy: {
        what: `The reconstruction reads s top-down from (1, ${n}).`,
        why: 'Each s[i][j] is the argument that achieved the minimum, so following the splits rebuilds exactly the parenthesisation the DP chose.',
        whatNext: `Read splitTable[1][${n}] = ${s[1][n]}.`,
      },
    });

    const stack: [number, number][] = [[1, n]];
    while (stack.length > 0) {
      const [i, j] = stack.pop()!;
      if (i === j) continue;
      const k = s[i][j];
      stats.reconSteps++;
      currentI = i;
      currentJ = j;
      currentK = k;
      splitPath.push([i, j]);
      dependencies = {
        leftCell: [i, k],
        rightCell: [k + 1, j],
      };
      actionType = 'WALK';

      // DFS: push right first so the left interval is revealed next.
      stack.push([k + 1, j]);
      stack.push([i, k]);

      pushFrame({
        codeLine: 14,
        action: 'BT_SPLIT',
        explanation: `splitTable[${i}][${j}] = ${k}: A${i}..A${j} (cost ${m[i][j]}) is (${buildFormula(s, i, k)}) × (${buildFormula(s, k + 1, j)}) = ${m[i][k]} + ${m[k + 1][j]} + ${dims[i - 1]}×${dims[k]}×${dims[j]} = ${m[i][j]} operations.`,
        conditionEval: {
          expr: `splitTable[${i}][${j}]`,
          condition: `k = ${k}`,
          result: k,
          formatted: `(${buildFormula(s, i, k)}) × (${buildFormula(s, k + 1, j)})`,
        },
        variables: {
          interval: `A${i}..A${j}`,
          splitK: k,
          leftFormula: buildFormula(s, i, k),
          rightFormula: buildFormula(s, k + 1, j),
          cost: m[i][j],
        },
        milestone: !firstSplitMilestone ? 'First Split Revealed' : undefined,
        soundCue: 'select',
        checkpoint:
          !walkCheckpointAdded
            ? {
                id: 'mcm-backtrack-first-split',
                question: `The reconstruction reads splitTable[${i}][${j}] = ${k} for the interval A${i}..A${j}. How is the product broken up?`,
                options: [
                  `(A${i}..A${k}) × (A${k + 1}..A${j}) — the split the table recorded`,
                  `(A${i}..A${j - 1}) × (A${j}) — split off the last matrix`,
                  `(A${i}) × (A${i + 1}..A${j}) — split off the first matrix`,
                ],
                correctIndex: 0,
                explanation: `The recorded split k = ${k} is exactly the one that achieved m[${i}][${j}] = ${m[i][j]}, so both halves carry their own recorded costs.`,
                hint: 'The reconstruction follows the split table, never positional convenience.',
              }
            : undefined,
        pedagogy: {
          what: `Interval A${i}..A${j} is split after A${k} into ${buildFormula(s, i, k)} and ${buildFormula(s, k + 1, j)}.`,
          why: 'That k achieved the recorded minimum; the two halves are themselves optimal by the invariant, so the composition is optimal.',
          whatNext:
            k > i
              ? `Recurse into the left half A${i}..A${k} (splitTable[${i}][${k}] = ${s[i][k]}).`
              : `The left half is the single matrix A${i}; continue with the right half A${k + 1}..A${j}.`,
        },
      });
      if (!firstSplitMilestone) firstSplitMilestone = true;
      if (!walkCheckpointAdded) walkCheckpointAdded = true;
    }

    phase = 'done';
    currentI = 1;
    currentJ = n;
    currentK = s[1][n];
    formula = finalFormula;
    actionType = 'NONE';

    pushFrame({
      codeLine: 15,
      action: 'DONE',
      explanation: `Solved: the optimal parenthesisation is ${finalFormula}, requiring ${m[1][n]} scalar multiplications across ${n} matrix(es).`,
      conditionEval: {
        expr: 'splits revealed == n - 1',
        condition: `${stats.reconSteps} == ${n - 1}`,
        result: stats.reconSteps === n - 1,
      },
      variables: {
        minCost: m[1][n],
        order: finalFormula,
        matrices: n,
        splits: stats.splits,
        updates: stats.updates,
      },
      milestone: 'Optimal Order Found',
      soundCue: 'finish',
      pedagogy: {
        what: `The optimal order is ${finalFormula} at ${m[1][n]} operations.`,
        why: 'Every split was recorded when it achieved the running minimum, so the reconstructed tree reproduces the DP choice exactly.',
        whatNext: 'Compare the presets: one bad split can cost 10× more multiplications.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<MCMState>) => {
    const {
      dims,
      n,
      costTable,
      splitTable,
      currentI,
      currentJ,
      currentK,
      currentLen,
      phase,
      actionType,
      candidate,
      dependencies,
      splitPath,
      formula,
      minCost,
      stats,
    } = frame.state;

    const phaseLabel = phase === 'init' ? 'allocate' : phase === 'fill' ? 'filling table' : phase === 'backtrack' ? 'reconstruction' : 'done';
    const splitSet = new Set(splitPath.map(([i, j]) => `${i}:${j}`));

    const fmt = (value: number | undefined) =>
      value === undefined ? '—' : value === Infinity ? '∞' : value.toLocaleString();

    const formulaBanner = candidate
      ? `m[${candidate.i}][${candidate.j}] split k=${candidate.k}: m[${candidate.i}][${candidate.k}] (${candidate.leftCost}) + m[${candidate.k + 1}][${candidate.j}] (${candidate.rightCost}) + ${dims[candidate.i - 1]}×${dims[candidate.k]}×${dims[candidate.j]} (${candidate.multCost}) = ${candidate.totalCost}${candidate.improved ? ` → new min (was ${candidate.bestBefore === Infinity ? '∞' : candidate.bestBefore})` : ' → kept'}`
      : phase === 'backtrack'
        ? `reconstruct: splitTable[${currentI}][${currentJ}] = ${currentK} → (A${currentI}..A${currentK}) × (A${currentK + 1}..A${currentJ})`
        : phase === 'done'
          ? `optimal order: ${formula} — ${minCost.toLocaleString()} ops`
          : 'cost = m[i][k] + m[k+1][j] + p[i-1]·p[k]·p[j]';

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span
              className={`rounded-md border px-2 py-0.5 font-bold uppercase ${
                phase === 'backtrack' || phase === 'done'
                  ? 'border-violet-500/40 bg-violet-500/20 text-violet-200'
                  : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200'
              }`}
            >
              {phaseLabel}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300">
              matrices <span className="font-bold text-amber-300">{n}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              chain L <span className="font-bold text-cyan-300">{currentLen}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              splits <span className="font-bold text-cyan-300">{stats.splits}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              minima <span className="font-bold text-emerald-300">{stats.updates}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              m[1][{n}] <span className="font-bold">{minCost === 0 ? '0' : minCost.toLocaleString()}</span>
            </span>
            <span className="rounded-md border border-violet-800 bg-violet-950/40 px-2 py-0.5 text-violet-200">
              splits read <span className="font-bold">{splitPath.length}</span>/{n - 1}
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formulaBanner}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
            <table className="w-full border-collapse font-mono text-xs tabular-nums">
              <thead>
                <tr>
                  <th className="min-w-[72px] border-b border-r border-slate-800 bg-slate-900/40 p-1.5 text-left text-slate-400">
                    i \ j
                  </th>
                  {Array.from({ length: n }).map((_, col) => {
                    const colIdx = col + 1;
                    return (
                      <th
                        key={colIdx}
                        className={`border-b border-slate-800 p-1.5 text-center transition-colors ${
                          colIdx === currentJ
                            ? 'bg-cyan-500/20 font-bold text-cyan-300'
                            : 'font-medium text-slate-400'
                        }`}
                      >
                        A{colIdx}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n }).map((_, row) => {
                  const rowIdx = row + 1;
                  return (
                    <tr key={rowIdx} className={rowIdx === currentI ? 'bg-slate-800/40' : ''}>
                      <td className="border-b border-r border-slate-800 p-1.5 text-[11px] font-bold text-slate-300">
                        A{rowIdx}
                      </td>
                      {Array.from({ length: n }).map((_, col) => {
                        const colIdx = col + 1;
                        const isCurrent = rowIdx === currentI && colIdx === currentJ;
                        const isInvalid = rowIdx > colIdx;
                        const cost = costTable[rowIdx]?.[colIdx];
                        const split = splitTable[rowIdx]?.[colIdx];
                        const isLeftDep = dependencies?.leftCell?.[0] === rowIdx && dependencies?.leftCell?.[1] === colIdx;
                        const isRightDep = dependencies?.rightCell?.[0] === rowIdx && dependencies?.rightCell?.[1] === colIdx;
                        const onSplit = splitSet.has(`${rowIdx}:${colIdx}`);
                        let cellStyle = 'border-slate-800/60 bg-slate-900/40 text-slate-300';
                        if (isInvalid) {
                          cellStyle = 'border-slate-900 bg-slate-950/60 text-slate-700';
                        } else if (isCurrent) {
                          cellStyle =
                            actionType === 'WRITE'
                              ? 'border-emerald-400 bg-emerald-500/25 font-bold text-emerald-100 ring-2 ring-emerald-500/50'
                              : 'border-cyan-400 bg-cyan-500/25 font-bold text-cyan-100 ring-2 ring-cyan-500/50';
                        } else if (isLeftDep) {
                          cellStyle = 'border-indigo-400 bg-indigo-500/20 font-bold text-indigo-200 ring-1 ring-indigo-500/40';
                        } else if (isRightDep) {
                          cellStyle = 'border-sky-400 bg-sky-500/20 font-bold text-sky-200 ring-1 ring-sky-500/40';
                        } else if (onSplit) {
                          cellStyle = 'border-violet-700 bg-violet-950/40 text-violet-200';
                        } else if (cost === 0) {
                          cellStyle = 'border-slate-800/60 bg-slate-900/40 text-slate-500';
                        }
                        return (
                          <td key={colIdx} className={`relative border-b border-slate-800 p-1.5 text-center transition-all ${cellStyle}`}>
                            {isInvalid ? (
                              '—'
                            ) : (
                              <>
                                <span>{fmt(cost)}</span>
                                {split ? <span className="mt-0.5 block text-[8px] leading-none text-cyan-300">k={split}</span> : null}
                              </>
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

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="mb-2 text-xs font-semibold text-slate-300">
                <span className="text-cyan-300">Matrices</span>{' '}
                <span className="font-mono text-[10px] text-slate-400">A_i = p(i-1) × p(i)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: n }).map((_, idx) => {
                  const matIdx = idx + 1;
                  const inInterval = currentI > 0 && matIdx >= currentI && matIdx <= currentJ;
                  const isSplitBoundary = currentK > 0 && matIdx === currentK;
                  return (
                    <div
                      key={matIdx}
                      className={`rounded-lg border px-2 py-1 font-mono text-[11px] transition-all ${
                        isSplitBoundary
                          ? 'border-amber-400 bg-amber-500/20 font-bold text-amber-200'
                          : inInterval
                            ? 'border-cyan-500 bg-cyan-500/15 font-semibold text-cyan-200'
                            : 'border-slate-700/60 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      <span className="font-bold">A{matIdx}</span>{' '}
                      <span className="text-[10px] text-slate-400">
                        {dims[idx]}×{dims[idx + 1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(phase === 'backtrack' || phase === 'done') && (
              <div className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
                  <span>Optimal order</span>
                  <span>{minCost.toLocaleString()} ops</span>
                </div>
                <div className="font-mono text-[11px] font-bold text-violet-100">{formula || 'building…'}</div>
                <div className="mt-1 font-mono text-[10px] text-slate-400">
                  split tree: {splitPath.map(([i, j]) => `A${i}..A${j}@k=${splitTable[i]?.[j]}`).join(' → ') || '—'}
                </div>
              </div>
            )}

            {candidate && (
              <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-3 font-mono text-[11px]">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  split candidate
                </div>
                <div className="text-slate-200">
                  (A{candidate.i}..A{candidate.k}) cost {candidate.leftCost.toLocaleString()}
                </div>
                <div className="text-slate-200">
                  (A{candidate.k + 1}..A{candidate.j}) cost {candidate.rightCost.toLocaleString()}
                </div>
                <div className="text-slate-200">
                  join {dims[candidate.i - 1]}×{dims[candidate.k]}×{dims[candidate.j]} = {candidate.multCost.toLocaleString()}
                </div>
                <div className="mt-1 text-slate-200">
                  total <span className="font-bold">{candidate.totalCost.toLocaleString()}</span> vs min{' '}
                  <span className="font-bold">{candidate.bestBefore === Infinity ? '∞' : candidate.bestBefore.toLocaleString()}</span>
                  <span className={`ml-1 font-bold ${candidate.improved ? 'text-emerald-400' : 'text-amber-400'}`}>
                    → {candidate.improved ? 'update' : 'keep'}
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>m[i][j] — interval being solved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-indigo-400" />
                  <span>left m[i][k]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-sky-400" />
                  <span>right m[k+1][j]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  <span>new minimum written</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-violet-400" />
                  <span>split read (reconstruction)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300">k=…</span>
                  <span>recorded split point</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
