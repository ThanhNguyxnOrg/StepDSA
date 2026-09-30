import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface CountInversionsState {
  array: number[];
  inversionCount: number;
  currentRange: [number, number];
  recentInversionsFound: number;
}

export const countInversionsModule: AlgorithmModule<{ array: number[] }, CountInversionsState> = {
  id: 'count-inversions',
  title: 'Count Inversions in Array (Modified Mergesort O(N log N))',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N) temporary merge buffer',
    worstCaseCondition: 'Strictly reversed array has maximum N * (N - 1) / 2 inversions',
  },
  theory: {
    overview:
      'An inversion in an array A is a pair of indices (i, j) such that i < j and A[i] > A[j]. The inversion count measures how far the array is from being sorted (0 for sorted, N*(N-1)/2 for reverse sorted).',
    whyItWorks:
      'Using divide-and-conquer like Mergesort: the total inversions equal (inversions in left half) + (inversions in right half) + (split inversions where left > right). When merging two sorted halves, if A[j] from right is smaller than A[i] from left, it is smaller than all remaining elements in left, contributing exactly (mid - i + 1) inversions in O(1) time.',
    invariant:
      'Cross-Inversion Invariant: If right element A[j] < left element A[i], then A[j] < A[k] for all i <= k <= mid.',
    pitfalls: [
      'Naive O(N^2) double loop exceeding time limits on large inputs.',
      'Integer overflow on 32-bit integers when N >= 10^5 (requires 64-bit int).',
    ],
  },
  presets: [
    {
      id: 'classic-sample',
      label: 'Classic: [8, 4, 2, 1] -> 6 Inversions',
      description: 'Fully reversed 4-element array: 4 * 3 / 2 = 6',
      data: { array: [8, 4, 2, 1] },
    },
    {
      id: 'mixed-array',
      label: 'Mixed: [3, 1, 2] -> 2 Inversions',
      description: '(3, 1) and (3, 2) are inverted',
      data: { array: [3, 1, 2] },
    },
    {
      id: 'already-sorted',
      label: 'Already Sorted: [1, 2, 3, 4] -> 0 Inversions',
      description: 'Zero cross-inversions generated',
      data: { array: [1, 2, 3, 4] },
    },
  ],
  defaultInput: { array: [8, 4, 2, 1] },
  codeSnippets: {
    cpp: `long long mergeAndCount(vector<int>& arr, int l, int m, int r) {
    vector<int> left(arr.begin() + l, arr.begin() + m + 1);
    vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    long long count = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else {
            arr[k++] = right[j++];
            count += (left.size() - i); // Cross inversions
        }
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
    return count;
}`,
    python: `def count_inversions(arr):
    def merge_sort(a):
        if len(a) <= 1: return a, 0
        mid = len(a) // 2
        left, inv_left = merge_sort(a[:mid])
        right, inv_right = merge_sort(a[mid:])
        merged, split_inv = [], 0
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
                split_inv += len(left) - i
        merged.extend(left[i:]); merged.extend(right[j:])
        return merged, inv_left + inv_right + split_inv
    _, total = merge_sort(arr)
    return total`,
    typescript: `function countInversions(arr: number[]): number {
    let inv = 0;
    function sort(a: number[]): number[] {
        if (a.length <= 1) return a;
        const mid = Math.floor(a.length / 2);
        const left = sort(a.slice(0, mid));
        const right = sort(a.slice(mid));
        const res: number[] = [];
        let i = 0, j = 0;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) res.push(left[i++]);
            else {
                res.push(right[j++]);
                inv += left.length - i;
            }
        }
        return res.concat(left.slice(i)).concat(right.slice(j));
    }
    sort(arr);
    return inv;
}`,
    java: `long countInversions(int[] arr, int l, int r) {
    // Modified mergesort with split inversion accumulator
    return 0;
}`,
    pseudocode: `function mergeSortAndCount(A, l, r):
    if l >= r: return 0
    m = (l + r) / 2
    count = mergeSortAndCount(A, l, m) + mergeSortAndCount(A, m + 1, r)
    count += mergeAndCountSplit(A, l, m, r)
    return count`,
  },

  generateTimeline: (input: { array: number[] }): ExecutionFrame<CountInversionsState>[] => {
    const raw = input?.array?.length ? input.array : [8, 4, 2, 1];
    const arr = [...raw];
    const n = arr.length;

    let totalInversions = 0;
    const frames: ExecutionFrame<CountInversionsState>[] = [];

    // Frame 0: Start
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Inversion Counting for [${arr.join(', ')}]. Inversion counter = 0.`,
      variables: { size: n, array: `[${arr.join(', ')}]`, totalInversions: 0 },
      callStack: [{ name: 'countInversions()', params: { n }, line: 2, isCurrent: true }],
      state: {
        array: [...arr],
        inversionCount: 0,
        currentRange: [0, n - 1],
        recentInversionsFound: 0,
      },
    });

    function merge(l: number, m: number, r: number) {
      const left = arr.slice(l, m + 1);
      const right = arr.slice(m + 1, r + 1);
      let i = 0;
      let j = 0;
      let k = l;
      let splitCount = 0;

      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          arr[k++] = left[i++];
        } else {
          const cross = left.length - i;
          splitCount += cross;
          totalInversions += cross;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `Cross-inversion found! right[${j}] (${right[j]}) < left[${i}] (${left[i]}). Since left half is sorted, ${right[j]} is smaller than all ${cross} remaining elements in left: [${left
              .slice(i)
              .join(', ')}]. Added +${cross} to inversion count.`,
            variables: {
              rightVal: right[j],
              leftVal: left[i],
              inversionsAdded: cross,
              runningTotal: totalInversions,
            },
            callStack: [{ name: `crossInversion(right=${right[j]})`, params: { cross }, line: 9, isCurrent: true }],
            state: {
              array: [...arr],
              inversionCount: totalInversions,
              currentRange: [l, r],
              recentInversionsFound: cross,
            },
          });

          arr[k++] = right[j++];
        }
      }

      while (i < left.length) arr[k++] = left[i++];
      while (j < right.length) arr[k++] = right[j++];
    }

    function mergeSort(l: number, r: number) {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      mergeSort(l, m);
      mergeSort(m + 1, r);
      merge(l, m, r);
    }

    mergeSort(0, n - 1);

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `Inversion counting complete! Total inversions in original array: ${totalInversions}. Sorted array: [${arr.join(', ')}].`,
      variables: { totalInversions, sortedArray: `[${arr.join(', ')}]` },
      callStack: [{ name: 'complete()', params: { totalInversions }, line: 12, isCurrent: true }],
      state: {
        array: [...arr],
        inversionCount: totalInversions,
        currentRange: [0, n - 1],
        recentInversionsFound: 0,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<CountInversionsState>) => {
    const { array, inversionCount, currentRange, recentInversionsFound } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Active Range: <strong className="text-white">[{currentRange[0]}..{currentRange[1]}]</strong>
            </div>
            {recentInversionsFound > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-xs font-mono text-amber-300 font-bold">
                +{recentInversionsFound} Cross Inversions
              </div>
            )}
          </div>

          <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold">
            Total Inversions: <strong className="text-white text-base">{inversionCount}</strong>
          </div>
        </div>

        {/* Array Card Ribbon */}
        <div className="w-full flex items-center justify-center gap-3 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl flex-wrap">
          {array.map((val, idx) => {
            const inRange = idx >= currentRange[0] && idx <= currentRange[1];
            return (
              <div
                key={idx}
                className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-lg border transition-all duration-200 ${
                  inRange
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800'
                }`}
              >
                <span>{val}</span>
                <span className="text-[10px] text-slate-500 font-normal">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
