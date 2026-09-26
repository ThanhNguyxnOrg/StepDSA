import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface CountingSortState {
  original: number[];
  count: number[];
  output: (number | null)[];
  currOrigIdx: number | null;
  currCountIdx: number | null;
  currOutputIdx: number | null;
  phase: 'find-max' | 'count-freq' | 'prefix-sum' | 'build-output' | 'done';
}

export const countingSortModule: AlgorithmModule<number[], CountingSortState> = {
  id: 'counting-sort',
  title: 'Counting Sort (Integer Frequency)',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N + K)',
    timeAverage: 'O(N + K)',
    timeWorst: 'O(N + K)',
    spaceAuxiliary: 'O(N + K)',
    worstCaseCondition: 'Inefficient if range K is significantly larger than N (e.g. K >> N²)',
  },
  theory: {
    overview:
      'Counting Sort is a non-comparison integer sorting algorithm. It operates by counting the number of occurrences of each distinct value in the input array, computing prefix sums to determine positions, and placing elements directly into a sorted output array.',
    whyItWorks:
      'Because the values are integers in a known bounded range [0...K], we can use direct array indexing to compute the exact rank and destination of every element in linear O(N + K) time, bypassing the O(N log N) comparison sort lower bound.',
    invariant:
      'After the prefix-sum phase, count[v] - 1 gives the exact target 0-indexed position for the next occurrence of value v.',
    pitfalls: [
      'Only applicable to non-negative discrete integer values (or items mappable to a finite integer key).',
      'Consumes O(K) auxiliary memory where K is the maximum element in the dataset.',
    ],
  },
  presets: [
    { id: 'standard', label: 'Standard Integers', description: 'Duplicated keys up to 8', data: [4, 2, 2, 8, 3, 3, 1] },
    { id: 'dense', label: 'Dense Repetitions', description: 'Values in range 0..4', data: [1, 4, 1, 2, 7, 5, 2] },
    { id: 'sorted', label: 'Already Sorted', description: 'Keys 1 to 6 in order', data: [1, 2, 3, 4, 5, 6] },
  ],
  defaultInput: [4, 2, 2, 8, 3, 3, 1],
  codeSnippets: {
    python: `def counting_sort(arr):
    if not arr: return []
    k = max(arr)
    count = [0] * (k + 1)
    output = [0] * len(arr)
    # Count frequencies
    for x in arr:
        count[x] += 1
    # Prefix sums for indices
    for i in range(1, k + 1):
        count[i] += count[i - 1]
    # Place elements into output (stable from right)
    for x in reversed(arr):
        output[count[x] - 1] = x
        count[x] -= 1
    return output`,
    typescript: `function countingSort(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const k = Math.max(...arr);
  const count = new Array(k + 1).fill(0);
  const output = new Array(arr.length).fill(0);
  // Count frequencies
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
  }
  // Compute prefix sums
  for (let i = 1; i <= k; i++) {
    count[i] += count[i - 1];
  }
  // Place into output
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  return output;
}`,
    cpp: `vector<int> countingSort(vector<int>& arr) {
    if (arr.empty()) return {};
    int k = *max_element(arr.begin(), arr.end());
    vector<int> count(k + 1, 0);
    vector<int> output(arr.size());
    for (int x : arr) count[x]++;
    for (int i = 1; i <= k; i++) count[i] += count[i - 1];
    for (int i = (int)arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    return output;
}`,
    java: `public static int[] countingSort(int[] arr) {
    if (arr.length == 0) return arr;
    int k = Arrays.stream(arr).max().getAsInt();
    int[] count = new int[k + 1];
    int[] output = new int[arr.length];
    for (int x : arr) count[x]++;
    for (int i = 1; i <= k; i++) count[i] += count[i - 1];
    for (int i = arr.length - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    return output;
}`,
    pseudocode: `function CountingSort(A):
    K = max(A)
    allocate count[0..K] initialized to 0
    allocate output[0..len(A)-1]
    for each x in A:
        count[x] = count[x] + 1
    for i = 1 to K:
        count[i] = count[i] + count[i - 1]
    for i = len(A) - 1 down to 0:
        val = A[i]
        output[count[val] - 1] = val
        count[val] = count[val] - 1
    return output`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<CountingSortState>[] => {
    const rawArr = input && input.length > 0 ? input.map((n) => Math.max(0, Math.min(20, Math.floor(n)))) : [4, 2, 2, 8, 3, 3, 1];
    const n = rawArr.length;
    const maxVal = Math.max(...rawArr);
    const timeline: ExecutionFrame<CountingSortState>[] = [];

    const baseFrame = (
      stepIdx: number,
      state: CountingSortState,
      codeLine: number,
      explanation: string,
      action: string,
      isMilestone: boolean,
      scope: Record<string, string | number>,
      soundCue?: ExecutionFrame<CountingSortState>['soundCue']
    ): ExecutionFrame<CountingSortState> => ({
      stepIndex: stepIdx,
      totalSteps: 0,
      codeLine,
      state: {
        original: [...state.original],
        count: [...state.count],
        output: [...state.output],
        currOrigIdx: state.currOrigIdx,
        currCountIdx: state.currCountIdx,
        currOutputIdx: state.currOutputIdx,
        phase: state.phase,
      },
      codeHighlights: {
        python: [codeLine],
        typescript: [codeLine],
        cpp: [codeLine],
        java: [codeLine],
        pseudocode: [codeLine],
      },
      callStack: [
        {
          id: 'frame-1',
          name: 'countingSort',
          file: 'countingSort.ts',
          line: codeLine,
          params: { n, k: maxVal },
        },
      ],
      scopeVariables: scope,
      explanation,
      action,
      isMilestone,
      soundCue,
      invariantStatus:
        state.phase === 'done'
          ? 'Output array is fully sorted and stable.'
          : state.phase === 'prefix-sum'
          ? 'Building cumulative prefix sums for 0-indexed destination offsets.'
          : 'Frequency counting and direct bucket placement in O(N + K).',
    });

    const state: CountingSortState = {
      original: [...rawArr],
      count: new Array(maxVal + 1).fill(0),
      output: new Array(n).fill(null),
      currOrigIdx: null,
      currCountIdx: null,
      currOutputIdx: null,
      phase: 'find-max',
    };

    let step = 0;

    // Step 0: Initial Frame
    timeline.push(
      baseFrame(
        step++,
        state,
        3,
        `Initialized Counting Sort. Max value K = ${maxVal}, array length N = ${n}. Allocated count array of size ${maxVal + 1}.`,
        'Initialize arrays',
        true,
        { N: n, K: maxVal, phase: 'find-max' },
        'start'
      )
    );

    // Phase 1: Count frequencies
    state.phase = 'count-freq';
    for (let i = 0; i < n; i++) {
      const val = state.original[i];
      state.currOrigIdx = i;
      state.currCountIdx = val;

      timeline.push(
        baseFrame(
          step++,
          state,
          7,
          `Scanning arr[${i}] = ${val}. Increment count[${val}] from ${state.count[val]} to ${state.count[val] + 1}.`,
          `Read arr[${i}] = ${val}`,
          false,
          { i, val, currentFreq: state.count[val] },
          'compare'
        )
      );

      state.count[val]++;

      timeline.push(
        baseFrame(
          step++,
          state,
          8,
          `Incremented count[${val}] = ${state.count[val]}.`,
          `count[${val}]++`,
          i === n - 1,
          { i, val, updatedFreq: state.count[val] },
          'swap'
        )
      );
    }

    // Phase 2: Prefix sums
    state.phase = 'prefix-sum';
    state.currOrigIdx = null;

    timeline.push(
      baseFrame(
        step++,
        state,
        10,
        `Frequency counting complete. Now computing cumulative prefix sums across count[0...${maxVal}].`,
        'Start prefix sums',
        true,
        { K: maxVal, phase: 'prefix-sum' }
      )
    );

    for (let i = 1; i <= maxVal; i++) {
      state.currCountIdx = i;
      const prevVal = state.count[i - 1];
      const curVal = state.count[i];
      state.count[i] += prevVal;

      timeline.push(
        baseFrame(
          step++,
          state,
          11,
          `Accumulated prefix sum: count[${i}] = count[${i}] (${curVal}) + count[${i - 1}] (${prevVal}) = ${state.count[i]}.`,
          `count[${i}] += count[${i - 1}]`,
          i === maxVal,
          { i, 'count[i-1]': prevVal, 'count[i]': state.count[i] },
          'step'
        )
      );
    }

    // Phase 3: Build output (traverse right-to-left)
    state.phase = 'build-output';
    timeline.push(
      baseFrame(
        step++,
        state,
        13,
        `Prefix sums calculated. Traversing input right-to-left to place items stably into output array.`,
        'Start output placement',
        true,
        { phase: 'build-output' }
      )
    );

    for (let i = n - 1; i >= 0; i--) {
      const val = state.original[i];
      state.currOrigIdx = i;
      state.currCountIdx = val;
      const targetPos = state.count[val] - 1;
      state.currOutputIdx = targetPos;

      timeline.push(
        baseFrame(
          step++,
          state,
          15,
          `Reading arr[${i}] = ${val}. According to count[${val}] (${state.count[val]}), destination index is ${targetPos}.`,
          `Map ${val} to output[${targetPos}]`,
          false,
          { i, val, targetPos, 'count[val]': state.count[val] },
          'compare'
        )
      );

      state.output[targetPos] = val;
      state.count[val]--;

      timeline.push(
        baseFrame(
          step++,
          state,
          16,
          `Placed ${val} at output[${targetPos}]. Decremented count[${val}] to ${state.count[val]} for previous duplicate instances.`,
          `output[${targetPos}] = ${val}`,
          true,
          { i, val, targetPos, remainingCount: state.count[val] },
          'success'
        )
      );
    }

    // Phase 4: Done
    state.phase = 'done';
    state.currOrigIdx = null;
    state.currCountIdx = null;
    state.currOutputIdx = null;

    timeline.push(
      baseFrame(
        step++,
        state,
        18,
        `Counting Sort complete! Final sorted output: [${state.output.join(', ')}]. Time: O(N + K), Space: O(N + K).`,
        'Sort complete',
        true,
        { status: 'complete', N: n, K: maxVal },
        'complete'
      )
    );

    const total = timeline.length;
    timeline.forEach((f) => {
      f.totalSteps = total;
    });

    return timeline;
  },

  renderStage: (frame: ExecutionFrame<CountingSortState>) => {
    const { original, count, output, currOrigIdx, currCountIdx, currOutputIdx, phase } = frame.state;

    return (
      <div className="w-full flex flex-col items-center justify-center p-6 space-y-8 select-none">
        {/* Phase Header Badge */}
        <div className="flex items-center space-x-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Current Phase:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase border ${
              phase === 'done'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : phase === 'build-output'
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                : phase === 'prefix-sum'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {phase.replace('-', ' ')}
          </span>
        </div>

        {/* 1. Original Input Array */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-slate-400">Input Array A (length {original.length})</span>
            {currOrigIdx !== null && (
              <span className="text-xs font-mono text-amber-400 font-semibold">Scanning index {currOrigIdx}</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {original.map((val, idx) => {
              const isActive = currOrigIdx === idx;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-base font-bold transition-all duration-200 border ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700/60'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Frequency / Cumulative Count Array */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-slate-400">
              Count Table (indices 0 ... {count.length - 1})
            </span>
            {currCountIdx !== null && (
              <span className="text-xs font-mono text-purple-400 font-semibold">Active key {currCountIdx}</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {count.map((cnt, keyVal) => {
              const isActive = currCountIdx === keyVal;
              return (
                <div key={keyVal} className="flex flex-col items-center">
                  <div
                    className={`w-11 h-11 flex items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-200 border ${
                      isActive
                        ? 'bg-purple-500/25 text-purple-300 border-purple-400 ring-2 ring-purple-400/50 scale-105 shadow-md shadow-purple-500/20'
                        : cnt > 0
                        ? 'bg-slate-800 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {cnt}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">key:{keyVal}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Output Array */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-slate-400">Sorted Output Array</span>
            {currOutputIdx !== null && (
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Writing index {currOutputIdx}
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {output.map((val, idx) => {
              const isTarget = currOutputIdx === idx;
              const hasVal = val !== null;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-mono text-base font-bold transition-all duration-200 border ${
                      isTarget
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/50 scale-105 shadow-md shadow-emerald-500/20'
                        : hasVal
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                        : 'bg-slate-950/60 text-slate-600 border-dashed border-slate-800'
                    }`}
                  >
                    {hasVal ? val : '·'}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
