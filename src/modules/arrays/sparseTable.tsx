import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SparseTableState {
  array: number[];
  st: number[][]; // st[i][j] = min in range [i .. i + 2^j - 1]
  queryL: number | null;
  queryR: number | null;
  k: number | null;
  leftBlock: { start: number; len: number } | null;
  rightBlock: { start: number; len: number } | null;
  minVal: number | null;
  message: string;
}

export const sparseTableModule: AlgorithmModule<
  { array: number[]; queries: { L: number; R: number }[] },
  SparseTableState
> = {
  id: 'sparse-table',
  title: 'Sparse Table (Range Minimum Query RMQ in O(1) Time)',
  category: 'arrays-pointers',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(1) query / O(N log N) build',
    timeAverage: 'O(1) query / O(N log N) build',
    timeWorst: 'O(1) query / O(N log N) build',
    spaceAuxiliary: 'O(N log N) precomputation table',
    worstCaseCondition: 'Strictly O(1) per idempotent query following O(N log N) static precomputation',
  },
  theory: {
    overview:
      'A Sparse Table is a static data structure that answers Range Minimum Queries (RMQ) in strictly O(1) worst-case time after an O(N log N) preprocessing phase. It works for any idempotent operation (min, max, gcd) where op(x, x) = x.',
    whyItWorks:
      'By precomputing minimums for all intervals of power-of-two lengths 2^j, any arbitrary interval [L, R] can be covered by the union of two overlapping intervals of length 2^k where k = floor(log2(R - L + 1)). The overlap does not affect the minimum.',
    invariant:
      'Power-of-Two Covering: st[i][j] = min(st[i][j-1], st[i + 2^(j-1)][j-1]). Query RMQ(L, R) = min(st[L][k], st[R - 2^k + 1][k]).',
    pitfalls: [
      'Attempting to use Sparse Table for non-idempotent operations like range sum without O(log N) decomposition.',
      'Using Sparse Table on mutable arrays (updates require expensive O(N log N) rebuilding).',
    ],
  },
  presets: [
    {
      id: 'sparse-table-canonical',
      label: 'Canonical 8-Element Array',
      description: 'Precomputes 2^0, 2^1, 2^2, 2^3 intervals and queries RMQ(1, 6)',
      data: {
        array: [4, 2, 5, 1, 8, 3, 7, 6],
        queries: [
          { L: 1, R: 6 },
          { L: 2, R: 4 },
          { L: 0, R: 7 },
        ],
      },
    },
    {
      id: 'sparse-table-monotonic',
      label: 'Ascending Array [1..8]',
      description: 'Demonstrates power-of-two boundary alignment',
      data: {
        array: [10, 20, 15, 30, 25, 5, 40, 35],
        queries: [{ L: 0, R: 4 }, { L: 3, R: 7 }],
      },
    },
  ],
  defaultInput: {
    array: [4, 2, 5, 1, 8, 3, 7, 6],
    queries: [
      { L: 1, R: 6 },
      { L: 2, R: 4 },
      { L: 0, R: 7 },
    ],
  },
  codeSnippets: {
    cpp: `class SparseTable {
    vector<vector<int>> st;
    vector<int> lg;
public:
    SparseTable(const vector<int>& arr) {
        int n = arr.size(), K = log2(n) + 1;
        st.assign(n, vector<int>(K));
        lg.assign(n + 1, 0);
        for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
        for (int i = 0; i < n; i++) st[i][0] = arr[i];

        for (int j = 1; j < K; j++)
            for (int i = 0; i + (1 << j) <= n; i++)
                st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
    }

    int query(int L, int R) {
        int k = lg[R - L + 1];
        return min(st[L][k], st[R - (1 << k) + 1][k]); // O(1)
    }
};`,
    python: `import math

class SparseTable:
    def __init__(self, arr):
        n = len(arr)
        K = int(math.log2(n)) + 1
        self.st = [[0] * K for _ in range(n)]
        for i in range(n): self.st[i][0] = arr[i]

        for j in range(1, K):
            for i in range(n - (1 << j) + 1):
                self.st[i][j] = min(self.st[i][j - 1], self.st[i + (1 << (j - 1))][j - 1])

    def query(self, L, R):
        k = int(math.log2(R - L + 1))
        return min(self.st[L][k], self.st[R - (1 << k) + 1][k]) # O(1)`,
    typescript: `function buildSparseTable(arr: number[]): number[][] {
  const n = arr.length;
  const K = Math.floor(Math.log2(n)) + 1;
  const st: number[][] = Array.from({ length: n }, () => new Array(K).fill(0));
  for (let i = 0; i < n; i++) st[i][0] = arr[i];

  for (let j = 1; j < K; j++) {
    for (let i = 0; i + (1 << j) <= n; i++) {
      st[i][j] = Math.min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
    }
  }
  return st;
}

function queryRMQ(st: number[][], L: number, R: number): number {
  const k = Math.floor(Math.log2(R - L + 1));
  return Math.min(st[L][k], st[R - (1 << k) + 1][k]);
}`,
    java: `public int query(int L, int R) {
    int k = logTable[R - L + 1];
    return Math.min(st[L][k], st[R - (1 << k) + 1][k]);
}`,
    pseudocode: `function build(arr):
    for i = 0 to N-1: st[i][0] = arr[i]
    for j = 1 to log(N):
        for i = 0 to N - 2^j:
            st[i][j] = min(st[i][j-1], st[i + 2^(j-1)][j-1])

function query(L, R):
    k = floor(log2(R - L + 1))
    return min(st[L][k], st[R - 2^k + 1][k])`,
  },
  generateTimeline: (input: {
    array: number[];
    queries: { L: number; R: number }[];
  }): ExecutionFrame<SparseTableState>[] => {
    const arr = input?.array?.length ? input.array : [4, 2, 5, 1, 8, 3, 7, 6];
    const queries = input?.queries?.length
      ? input.queries
      : [{ L: 1, R: 6 }, { L: 2, R: 4 }];

    const n = arr.length;
    const K = Math.floor(Math.log2(n)) + 1;
    const st: number[][] = Array.from({ length: n }, () => new Array(K).fill(0));

    const frames: ExecutionFrame<SparseTableState>[] = [];

    // Base column j = 0
    for (let i = 0; i < n; i++) st[i][0] = arr[i];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      isMilestone: true,
      milestoneTitle: `Init Sparse Table (N=${n})`,
      action: 'INIT',
      state: {
        array: [...arr],
        st: st.map((r) => [...r]),
        queryL: null,
        queryR: null,
        k: null,
        leftBlock: null,
        rightBlock: null,
        minVal: null,
        message: `Initialized Sparse Table base layer 2^0 for N=${n} elements`,
      },
      callStack: [{ name: 'initSparseTable', params: { n, K }, line: 1, isCurrent: true }],
      variables: { n, maxPowerK: K, baseElements: arr.join(',') },
      conditionEval: { expr: 'array.length > 0', result: true },
      soundCue: { type: 'step' },
      explanation: `Initialized Sparse Table with base row length 1 (2^0 = 1). Each element is its own range minimum of length 1.`,
    });

    // Build phases j = 1 .. K - 1
    for (let j = 1; j < K; j++) {
      const len = 1 << j;
      const half = 1 << (j - 1);

      for (let i = 0; i + len <= n; i++) {
        st[i][j] = Math.min(st[i][j - 1], st[i + half][j - 1]);
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        isMilestone: true,
        milestoneTitle: `Precomputed Layer 2^${j} = ${len}`,
        action: 'BUILD_LAYER',
        state: {
          array: [...arr],
          st: st.map((r) => [...r]),
          queryL: null,
          queryR: null,
          k: j,
          leftBlock: null,
          rightBlock: null,
          minVal: null,
          message: `Precomputed column j=${j} (Interval length 2^${j} = ${len})`,
        },
        callStack: [{ name: 'buildLayer', params: { j, blockLength: len }, line: 14, isCurrent: true }],
        variables: { j, intervalLength: len, subproblems: n - len + 1, recurrence: `st[i][${j}] = min(st[i][${j-1}], st[i+${half}][${j-1}])` },
        conditionEval: { expr: `1 << ${j} <= ${n}`, result: true },
        soundCue: { type: 'swap' },
        explanation: `Computed layer j=${j} (power 2^${j} = ${len}). Merged two adjacent intervals of length ${half}: [i..i+${half}-1] and [i+${half}..i+${len}-1].`,
      });
    }

    // Now execute queries
    let qIdx = 1;
    for (const q of queries) {
      const L = Math.max(0, Math.min(q.L, n - 1));
      const R = Math.max(L, Math.min(q.R, n - 1));
      const rangeLen = R - L + 1;
      const k = Math.floor(Math.log2(rangeLen));
      const blockLen = 1 << k;

      const leftIdx = L;
      const rightIdx = R - blockLen + 1;
      const leftMin = st[leftIdx][k];
      const rightMin = st[rightIdx][k];
      const ans = Math.min(leftMin, rightMin);

      // Frame 1: Query decomposition
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 20,
        action: 'QUERY_DECOMPOSE',
        state: {
          array: [...arr],
          st: st.map((r) => [...r]),
          queryL: L,
          queryR: R,
          k,
          leftBlock: { start: leftIdx, len: blockLen },
          rightBlock: { start: rightIdx, len: blockLen },
          minVal: null,
          message: `Query #${qIdx} RMQ(${L}, ${R}): length = ${rangeLen}. Largest power of 2: k = floor(log2(${rangeLen})) = ${k} (size ${blockLen}).`,
        },
        callStack: [{ name: 'decomposeQuery', params: { L, R, length: rangeLen, k }, line: 20, isCurrent: true }],
        variables: { queryNumber: qIdx, range: `[${L}..${R}]`, rangeLength: rangeLen, powerOfTwo: blockLen, exponentK: k },
        conditionEval: { expr: `1 << ${k} <= ${rangeLen} && 1 << (${k} + 1) > ${rangeLen}`, result: true },
        soundCue: { type: 'select' },
        explanation: `Decomposing query range [${L}..${R}] into two overlapping power-of-two windows of length ${blockLen}: Left [${leftIdx}..${leftIdx + blockLen - 1}] and Right [${rightIdx}..${R}].`,
      });

      // Frame 2: O(1) Evaluation
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 24,
        isMilestone: true,
        milestoneTitle: `RMQ(${L}, ${R}) = ${ans}`,
        action: 'QUERY_EXECUTE',
        state: {
          array: [...arr],
          st: st.map((r) => [...r]),
          queryL: L,
          queryR: R,
          k,
          leftBlock: { start: leftIdx, len: blockLen },
          rightBlock: { start: rightIdx, len: blockLen },
          minVal: ans,
          message: `RMQ(${L}, ${R}): min(st[${leftIdx}][${k}] (${leftMin}), st[${rightIdx}][${k}] (${rightMin})) = ${ans}`,
        },
        callStack: [{ name: 'queryRMQ', params: { L, R, k, answer: ans }, line: 24, isCurrent: true }],
        variables: {
          range: `[${L}..${R}]`,
          length: rangeLen,
          k,
          leftBlockMin: leftMin,
          rightBlockMin: rightMin,
          minAnswer: ans,
          idempotentFormula: `min(${leftMin}, ${rightMin}) = ${ans}`,
        },
        conditionEval: { expr: `min(${leftMin}, ${rightMin}) === ${ans}`, result: true },
        soundCue: { type: 'insert' },
        explanation: `Evaluated RMQ(${L}, ${R}) in strictly O(1) time: min(${leftMin}, ${rightMin}) = ${ans}. Due to idempotence (min(x, x) = x), the overlapping middle elements do not distort the result.`,
      });
      qIdx++;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 30,
      isMilestone: true,
      milestoneTitle: `Sparse Table Complete (${queries.length} Queries Evaluated)`,
      action: 'COMPLETE',
      state: {
        array: [...arr],
        st: st.map((r) => [...r]),
        queryL: null,
        queryR: null,
        k: null,
        leftBlock: null,
        rightBlock: null,
        minVal: null,
        message: `Sparse Table operations completed for ${queries.length} queries`,
      },
      callStack: [{ name: 'complete', params: { totalQueries: queries.length }, line: 30, isCurrent: true }],
      variables: { completed: true, totalQueries: queries.length, totalTableCells: n * K },
      conditionEval: { expr: 'allQueriesCompleted', result: true },
      soundCue: { type: 'complete' },
      explanation: `All ${queries.length} RMQ queries processed in O(1) worst-case lookup time following static O(N log N) precomputation.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<SparseTableState>) => {
    const { array, st, queryL, queryR, k, leftBlock, rightBlock, minVal, message } =
      frame.state;
    const n = array.length;
    const K = st[0]?.length || 1;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Query Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          {minVal !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Result:</span>
              <span className="font-mono text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-0.5 rounded">
                min = {minVal}
              </span>
            </div>
          )}
        </div>

        {/* Array Visualization with Overlap Bands */}
        <div className="flex flex-col gap-2 w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner">
          <div className="text-xs font-mono text-slate-400 mb-1">
            Array A[0..{n - 1}]:
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {array.map((val, idx) => {
              const inRange = queryL !== null && queryR !== null && idx >= queryL && idx <= queryR;
              const inLeft = leftBlock && idx >= leftBlock.start && idx < leftBlock.start + leftBlock.len;
              const inRight = rightBlock && idx >= rightBlock.start && idx < rightBlock.start + rightBlock.len;

              let border = 'border-slate-800';
              let bg = 'bg-slate-900';
              if (inLeft && inRight) {
                border = 'border-purple-400 scale-105';
                bg = 'bg-purple-950/40 text-purple-200';
              } else if (inLeft) {
                border = 'border-cyan-400';
                bg = 'bg-cyan-950/40 text-cyan-200';
              } else if (inRight) {
                border = 'border-amber-400';
                bg = 'bg-amber-950/40 text-amber-200';
              } else if (inRange) {
                border = 'border-slate-600';
                bg = 'bg-slate-800/60';
              }

              return (
                <div
                  key={`arr-${idx}`}
                  className={`flex flex-col items-center justify-center w-12 h-16 rounded-xl border transition-all duration-300 font-mono ${border} ${bg}`}
                >
                  <span className="text-[10px] text-slate-500">[{idx}]</span>
                  <span className="text-base font-bold my-auto">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2D Sparse Table Grid */}
        <div className="relative overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-inner max-w-full">
          <table className="border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="p-1.5 text-slate-500">i \ j (2^j)</th>
                {Array.from({ length: K }).map((_, col) => (
                  <th key={`st-head-${col}`} className="p-1.5 text-center text-cyan-400 w-16">
                    j={col} (len={1 << col})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {st.map((row, rIdx) => (
                <tr key={`st-row-${rIdx}`}>
                  <td className="p-1.5 text-right font-bold text-cyan-400">i={rIdx}</td>
                  {row.map((cellVal, cIdx) => {
                    const isLeftActive = leftBlock && rIdx === leftBlock.start && cIdx === k;
                    const isRightActive = rightBlock && rIdx === rightBlock.start && cIdx === k;

                    let bg = cellVal > 0 ? 'bg-slate-800/30 text-slate-300' : 'text-slate-600';
                    if (isLeftActive) {
                      bg = 'bg-cyan-500/30 text-cyan-200 font-bold border-cyan-400';
                    } else if (isRightActive) {
                      bg = 'bg-amber-500/30 text-amber-200 font-bold border-amber-400';
                    }

                    return (
                      <td
                        key={`st-cell-${rIdx}-${cIdx}`}
                        className={`p-1.5 text-center border border-slate-800/60 rounded ${bg}`}
                      >
                        {rIdx + (1 << cIdx) <= n ? cellVal : '-'}
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
