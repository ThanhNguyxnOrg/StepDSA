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

    let checkpointAdded = false;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialize Fenwick Tree (BIT) with 1-based indexing for ${n} elements. Build by calling update(${1}, A[1]) … update(${n}, A[n]).`,
      variables: { size: n, array: `[${originalArray.join(', ')}]` },
      callStack: [{ name: 'initBIT()', params: { n }, line: 1, isCurrent: true }],
      pedagogy: {
        what: `A Fenwick tree stores partial sums in tree[1..n]; index i is responsible for a block of length lowbit(i) = i & (-i).`,
        why: 'Both update and query walk indices by adding/subtracting that lowest set bit, visiting only O(log n) nodes.',
        whatNext: 'Build the tree by updating every element — each update touches all blocks covering it.',
      },
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
          codeLine: 3,
          action: 'UPDATE_ADD',
          explanation: `update(idx=${idx}): tree[${i}] += ${delta} → tree[${i}] = ${tree[i]}. Block length lowbit(${i}) = ${lowbit}.`,
          variables: { elementIdx: idx, treeIdx: i, lowbit, delta, treeVal: tree[i] },
          callStack: [{ name: `update(idx=${idx}, delta=${delta})`, params: { i, delta }, line: 3, isCurrent: true }],
          pedagogy: {
            what: `Element A[${idx}] = ${delta} is folded into tree[${i}], whose block covers index ${idx}.`,
            why: 'Every ancestor block that spans the changed index must include the delta — those are exactly the indices reached by lowbit jumping.',
            whatNext: `Advance i by lowbit: ${i} + ${lowbit} = ${i + lowbit}.`,
          },
          state: {
            originalArray,
            tree: [...tree],
            activeIdx: i,
            lowbitVal: lowbit,
            operation: 'UPDATE',
          },
        });

        i += lowbit;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          action: 'UPDATE_ADVANCE',
          explanation: `i = i + lowbit(${i - lowbit}) = ${i}. ${i <= n ? `tree[${i}] is the next covering block.` : `i > n = ${n}, so update stops.`}`,
          variables: { nextIdx: i, inRange: i <= n, elementIdx: idx },
          callStack: [{ name: `update(idx=${idx})`, params: { nextI: i }, line: 4, isCurrent: true }],
          pedagogy: {
            what: i <= n ? `Next covering block index ${i}.` : 'The jump left the array — update is complete.',
            why: 'Adding the lowbit climbs to the next block that covers the same position; each step at least doubles the block size, hence O(log n).',
            whatNext: i <= n ? `Add ${delta} into tree[${i}].` : `Continue with A[${idx + 1}] or run the query.`,
          },
          state: {
            originalArray,
            tree: [...tree],
            activeIdx: i <= n ? i : i - (i & -i),
            lowbitVal: i <= n ? i & -i : 0,
            operation: 'UPDATE',
          },
        });
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
        codeLine: 8,
        action: 'QUERY_ADD',
        explanation: `query(${queryIdx}): sum += tree[${q}] (${tree[q]}) → partial sum ${sum}. Block [${q - lowbit + 1}..${q}] is added whole.`,
        variables: { queryTarget: queryIdx, currentTreeIdx: q, lowbit, addedBlock: `[${q - lowbit + 1}..${q}]`, partialSum: sum },
        callStack: [{ name: `query(i=${q})`, params: { q, sum }, line: 8, isCurrent: true }],
        pedagogy: {
          what: `tree[${q}] already equals the sum of the block [${q - lowbit + 1}..${q}], so it is added in one step.`,
          why: 'The prefix [1..i] decomposes into these disjoint blocks; adding them tiling-wise gives the exact sum.',
          whatNext: `Subtract lowbit: q = ${q} - ${lowbit} = ${q - lowbit}.`,
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'fenwick-lowbit-blocks',
              question: 'Why does subtracting lowbit (i & -i) enumerate the prefix [1..i] exactly?',
              options: [
                'lowbit isolates the lowest set bit, and each subtraction jumps back to the next disjoint block, so the visited blocks tile [1..i] with no overlap',
                'Because the index is halved at every step, so the loop runs log2 n times',
              ],
              correctIndex: 0,
              explanation:
                'Each block [i - lowbit + 1 .. i] is disjoint from the next (i - lowbit), and their lengths sum to exactly i. The count of steps is the number of set bits, at most log n — but the correctness comes from the tiling, not from halving.',
            }
          : undefined,
        state: {
          originalArray,
          tree: [...tree],
          activeIdx: q,
          lowbitVal: lowbit,
          operation: 'QUERY',
          querySum: sum,
        },
      });
      checkpointAdded = true;

      q -= lowbit;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        action: 'QUERY_ADVANCE',
        explanation: `q = q - lowbit(${q + lowbit}) = ${q}. ${q > 0 ? `Continue with tree[${q}].` : 'q == 0 — all blocks collected.'}`,
        variables: { nextIdx: q, done: q <= 0, queryTarget: queryIdx, partialSum: sum },
        callStack: [{ name: `query(i=${q})`, params: { nextQ: q }, line: 9, isCurrent: true }],
        pedagogy: {
          what: q > 0 ? `The walk continues at index ${q}.` : 'No blocks remain; the prefix sum is complete.',
          why: 'Subtracting the block length removes exactly the block just added, so blocks never overlap.',
          whatNext: q > 0 ? `Add tree[${q}].` : 'Return the accumulated sum.',
        },
        state: {
          originalArray,
          tree: [...tree],
          activeIdx: q,
          lowbitVal: q > 0 ? q & -q : 0,
          operation: 'QUERY',
          querySum: sum,
        },
      });
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      isMilestone: true,
      milestoneTitle: `Prefix Sum [1..${queryIdx}] = ${sum}`,
      explanation: `return sum: prefix sum of A[1..${queryIdx}] is ${sum}, computed in O(log N) jumps.`,
      variables: {
        totalElements: n,
        queryIndex: queryIdx,
        prefixSumResult: sum,
      },
      callStack: [{ name: 'complete()', params: { queryIdx, sum }, line: 10, isCurrent: true }],
      pedagogy: {
        what: `The query cost only O(log ${n}) additions thanks to the block decomposition.`,
        why: 'Point updates would walk the same kind of index chain upward, so both operations are logarithmic.',
        whatNext: 'Fenwick trees suit prefix sums with updates; segment trees generalize to arbitrary associative merges.',
      },
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

          {/* Fenwick Tree & Responsibility Range Bars */}
          <div>
            <div className="text-xs font-mono text-slate-400 mb-2 font-bold flex items-center justify-between">
              <span>Fenwick Tree BIT[1..N] & Power-of-2 Responsibility Ranges</span>
              <span className="text-[10px] text-cyan-400 font-normal">
                T[i] covers range [i - lowbit(i) + 1 .. i]
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {tree.slice(1).map((val, idx) => {
                const i = idx + 1;
                const isCurrent = i === activeIdx;
                const len = i & -i;
                const rangeLow = i - len + 1;

                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl border font-mono text-xs text-center min-w-14 transition-all duration-200 ${
                      isCurrent
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 scale-105 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block">T[{i}]</span>
                    <span className="font-bold text-sm block">{val}</span>
                    <span className="text-[9px] text-cyan-400 font-semibold block">
                      [{rangeLow}..{i}]
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Visual Interval Coverage Bars (VisuAlgo BIT Tree Diagram) */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
              {tree.slice(1).map((val, idx) => {
                const i = idx + 1;
                const n = Math.max(1, originalArray.length);
                const len = i & -i;
                const rangeLow = i - len + 1;
                const leftPct = ((rangeLow - 1) / n) * 100;
                const widthPct = (len / n) * 100;
                const isCurrent = i === activeIdx;

                return (
                  <div key={`bar-${i}`} className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-10 text-right text-slate-400 shrink-0">T[{i}]</span>
                    <div className="flex-1 h-4 bg-slate-900/80 rounded relative overflow-hidden border border-slate-800/60">
                      <div
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className={`absolute top-0.5 bottom-0.5 rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                          isCurrent
                            ? 'bg-cyan-400 text-slate-950 shadow'
                            : 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-300'
                        }`}
                      >
                        [{rangeLow}..{i}] = {val}
                      </div>
                    </div>
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
