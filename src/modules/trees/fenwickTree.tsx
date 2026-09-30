import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface FenwickTreeState {
  originalArray: number[];
  tree: number[]; // 1-indexed BIT
  activeIdx: number;
  lowbitVal: number;
  operation: 'INIT' | 'UPDATE' | 'QUERY' | 'DONE';
  querySum?: number;
}

export const fenwickTreeModule: AlgorithmModule<
  { array: number[]; queryIndex?: number },
  FenwickTreeState
> = {
  id: 'fenwick-tree',
  title: 'Fenwick Tree / Binary Indexed Tree (Prefix Sums & Updates O(log N))',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(log N) query & update',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(N) 1-indexed array storage',
    worstCaseCondition: 'Bitwise lowbit traversal traverses at most floor(log2(N)) bits',
  },
  theory: {
    overview:
      'A Fenwick Tree (or Binary Indexed Tree / BIT, Peter Fenwick 1994) maintains cumulative frequency prefix sums and point updates in O(log N) time with O(N) array storage.',
    whyItWorks:
      'Each index i in the 1-indexed tree is responsible for elements in the range (i - lowbit(i), i], where lowbit(i) = i & (-i) isolates the lowest set bit. Adding lowbit(i) ascends to the parent that covers i; subtracting lowbit(i) descends to accumulate prefix sums.',
    invariant:
      'Bitwise Range Responsibility Invariant: tree[i] = sum_{k = i - (i & -i) + 1}^{i} A[k].',
    pitfalls: [
      'Using 0-based indexing without offsetting (lowbit(0) = 0, causing infinite loops).',
      'Forgetting that point update adds a DELTA (newVal - oldVal), not the absolute value.',
    ],
  },
  presets: [
    {
      id: 'standard-bit',
      label: 'Standard: [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3]',
      description: '11-element array showing lowbit jumps',
      data: { array: [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3], queryIndex: 7 },
    },
    {
      id: 'power-of-two',
      label: 'Power of Two: [1, 2, 3, 4, 5, 6, 7, 8]',
      description: '8 elements demonstrating clean doubling intervals',
      data: { array: [1, 2, 3, 4, 5, 6, 7, 8], queryIndex: 6 },
    },
  ],
  defaultInput: { array: [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3], queryIndex: 7 },
  codeSnippets: {
    cpp: `void update(int i, int delta, int n, vector<int>& tree) {
    for (; i <= n; i += i & (-i)) {
        tree[i] += delta;
    }
}
int query(int i, const vector<int>& tree) {
    int sum = 0;
    for (; i > 0; i -= i & (-i)) {
        sum += tree[i];
    }
    return sum;
}`,
    python: `def update(i, delta, n, tree):
    while i <= n:
        tree[i] += delta
        i += i & (-i)

def query(i, tree):
    total = 0
    while i > 0:
        total += tree[i]
        i -= i & (-i)
    return total`,
    typescript: `function update(i: number, delta: number, n: number, tree: number[]): void {
    for (; i <= n; i += i & -i) {
        tree[i] += delta;
    }
}
function query(i: number, tree: number[]): number {
    let sum = 0;
    for (; i > 0; i -= i & -i) {
        sum += tree[i];
    }
    return sum;
}`,
    java: `void update(int i, int delta, int n, int[] tree) {
    for (; i <= n; i += i & (-i)) {
        tree[i] += delta;
    }
}
int query(int i, int[] tree) {
    int sum = 0;
    for (; i > 0; i -= i & (-i)) {
        sum += tree[i];
    }
    return sum;
}`,
    pseudocode: `function update(i, delta):
    while i <= n:
        tree[i] += delta
        i = i + (i AND -i)
function query(i):
    sum = 0
    while i > 0:
        sum += tree[i]
        i = i - (i AND -i)
    return sum`,
  },

  generateTimeline: (input: {
    array: number[];
    queryIndex?: number;
  }): ExecutionFrame<FenwickTreeState>[] => {
    const raw = input?.array?.length ? input.array : [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3];
    const n = Math.min(raw.length, 12);
    const originalArray = raw.slice(0, n);
    const queryIdx = Math.max(1, Math.min(input?.queryIndex ?? 6, n));

    const tree: number[] = Array(n + 1).fill(0);
    const frames: ExecutionFrame<FenwickTreeState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Fenwick Tree (BIT) with 1-based indexing for ${n} elements. Lowbit trick: lowbit(i) = i & (-i).`,
      variables: { size: n, array: `[${originalArray.join(', ')}]` },
      callStack: [{ name: 'initBIT()', params: { n }, line: 2, isCurrent: true }],
      state: {
        originalArray,
        tree: [...tree],
        activeIdx: 0,
        lowbitVal: 0,
        operation: 'INIT',
      },
    });

    // Build tree
    for (let k = 0; k < n; k++) {
      const idx = k + 1;
      const delta = originalArray[k];

      let i = idx;
      while (i <= n) {
        const lowbit = i & -i;
        tree[i] += delta;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Build: Add element A[${idx}]=${delta} into tree[${i}]. lowbit(${i}) = ${lowbit} -> Next update index: ${i} + ${lowbit} = ${
            i + lowbit
          }.`,
          variables: { elementIdx: idx, treeIdx: i, lowbit, delta, treeVal: tree[i] },
          callStack: [{ name: `update(idx=${idx}, delta=${delta})`, params: { i, delta }, line: 4, isCurrent: true }],
          state: {
            originalArray,
            tree: [...tree],
            activeIdx: i,
            lowbitVal: lowbit,
            operation: 'UPDATE',
          },
        });

        i += lowbit;
      }
    }

    // Prefix sum query
    let sum = 0;
    let q = queryIdx;
    while (q > 0) {
      const lowbit = q & -q;
      sum += tree[q];

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Query Prefix Sum [1..${queryIdx}]: Add tree[${q}] (${tree[q]}) -> Partial Sum = ${sum}. lowbit(${q}) = ${lowbit} -> Next query index: ${q} - ${lowbit} = ${
          q - lowbit
        }.`,
        variables: { queryTarget: queryIdx, currentTreeIdx: q, lowbit, partialSum: sum },
        callStack: [{ name: `query(i=${q})`, params: { q, sum }, line: 9, isCurrent: true }],
        state: {
          originalArray,
          tree: [...tree],
          activeIdx: q,
          lowbitVal: lowbit,
          operation: 'QUERY',
          querySum: sum,
        },
      });

      q -= lowbit;
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `Fenwick Tree execution complete! Prefix sum of A[1..${queryIdx}] is ${sum} computed in O(log N) jumps.`,
      variables: {
        totalElements: n,
        queryIndex: queryIdx,
        prefixSumResult: sum,
      },
      callStack: [{ name: 'complete()', params: { queryIdx, sum }, line: 12, isCurrent: true }],
      state: {
        originalArray,
        tree: [...tree],
        activeIdx: 0,
        lowbitVal: 0,
        operation: 'DONE',
        querySum: sum,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<FenwickTreeState>) => {
    const { originalArray, tree, activeIdx, lowbitVal, operation, querySum } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Active Index: <strong className="text-white">i = {activeIdx}</strong> (lowbit:{' '}
              {lowbitVal})
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Operation: <strong className="text-white">{operation}</strong>
            </div>
          </div>

          {querySum !== undefined && (
            <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold">
              Prefix Sum: {querySum}
            </div>
          )}
        </div>

        {/* Tree and Array Display */}
        <div className="w-full space-y-4 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          {/* Original Array */}
          <div>
            <div className="text-xs font-mono text-slate-400 mb-2 font-bold">
              Original Array A[1..N]
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {originalArray.map((val, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-center min-w-14"
                >
                  <span className="text-slate-400 block text-[10px]">A[{idx + 1}]</span>
                  <span className="font-bold text-white text-sm">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fenwick Tree */}
          <div>
            <div className="text-xs font-mono text-slate-400 mb-2 font-bold flex items-center justify-between">
              <span>Fenwick Tree BIT[1..N]</span>
              <span className="text-[10px] text-cyan-400 font-normal">
                covers range (i - lowbit(i), i]
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {tree.slice(1).map((val, idx) => {
                const i = idx + 1;
                const isCurrent = i === activeIdx;
                const rangeLow = i - (i & -i) + 1;

                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs text-center min-w-14 transition-all duration-200 ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 scale-105 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 block">T[{i}]</span>
                    <span className="font-bold text-sm block">{val}</span>
                    <span className="text-[8px] text-slate-500 block">
                      [{rangeLow}..{i}]
                    </span>
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
