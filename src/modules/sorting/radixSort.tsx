import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface RadixSortState {
  array: number[];
  exp: number; // 1, 10, 100...
  maxVal: number;
  buckets: number[][]; // 10 buckets (0-9)
  currentIdx: number | null;
  activeBucket: number | null;
  /** Bucket currently being drained during the collect phase (null otherwise). */
  collectBucket: number | null;
  phase: 'inspect-digit' | 'place-bucket' | 'collect' | 'done';
}

export const radixSortModule: AlgorithmModule<number[], RadixSortState> = {
  id: 'radix-sort',
  title: 'Radix Sort (LSD Digit Buckets)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(d · (N + b))',
    timeAverage: 'O(d · (N + b))',
    timeWorst: 'O(d · (N + b))',
    spaceAuxiliary: 'O(N + b)',
    worstCaseCondition: 'Items with very large maximum digits d relative to N',
  },
  theory: {
    overview:
      'LSD (Least Significant Digit) Radix Sort is a non-comparison integer sorting algorithm. It sorts keys digit by digit starting from the lowest significant digit (1s place) to the highest, distributing items into 10 buckets (0-9) and gathering them back stably at each pass.',
    whyItWorks:
      'Because the bucket distribution at each digit place is stable, items with identical higher digits preserve their relative sorted order established during earlier lower-digit passes.',
    invariant:
      'After pass with divisor exp = 10^k, the entire array is stably sorted with respect to its lowest k+1 digits.',
    pitfalls: [
      'Only applies to fixed-width keys or integers; negative numbers require offset normalization.',
      'Memory overhead of 10 bucket queues or count arrays at each pass.',
    ],
  },
  presets: [
    {
      id: 'classic',
      label: 'Classic 3-Digit Keys',
      description: 'Numbers up to 802 with 3 passes',
      data: [170, 45, 75, 90, 802, 24, 2, 66],
    },
    {
      id: 'two-digit',
      label: '2-Digit Densities',
      description: 'Fast 2-pass demonstration',
      data: [64, 34, 25, 12, 22, 11, 90],
    },
    {
      id: 'sorted',
      label: 'Already Sorted',
      description: 'Preserves stability across digits',
      data: [10, 22, 35, 41, 58, 69, 73],
    },
  ],
  defaultInput: [170, 45, 75, 90, 802, 24, 2, 66],
  codeSnippets: {
    python: `def radix_sort(arr):
    if not arr: return arr
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        buckets = [[] for _ in range(10)]
        for num in arr:
            digit = (num // exp) % 10
            buckets[digit].append(num)
        arr = [num for bucket in buckets for num in bucket]
        exp *= 10
    return arr`,
    typescript: `function radixSort(arr: number[]): number[] {
  if (arr.length === 0) return arr;
  const maxVal = Math.max(...arr);
  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (const num of arr) {
      const digit = Math.floor(num / exp) % 10;
      buckets[digit].push(num);
    }
    arr = buckets.flat();
  }
  return arr;
}`,
    cpp: `void radixSort(vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        vector<int> output(arr.size());
        int count[10] = {0};
        for (int x : arr) count[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = arr.size() - 1; i >= 0; i--) {
            output[count[(arr[i] / exp) % 10] - 1] = arr[i];
            count[(arr[i] / exp) % 10]--;
        }
        arr = output;
    }
}`,
    java: `public static void radixSort(int[] arr) {
    if (arr.length == 0) return;
    int maxVal = Arrays.stream(arr).max().getAsInt();
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        int[] output = new int[arr.length];
        int[] count = new int[10];
        for (int x : arr) count[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = arr.length - 1; i >= 0; i--) {
            output[count[(arr[i] / exp) % 10] - 1] = arr[i];
            count[(arr[i] / exp) % 10]--;
        }
        System.arraycopy(output, 0, arr, 0, arr.length);
    }
}`,
    pseudocode: `function RadixSort(A):
    maxVal = maximum value in A
    exp = 1
    while floor(maxVal / exp) > 0:
        create 10 empty buckets B[0..9]
        for each x in A:
            digit = floor(x / exp) mod 10
            append x into B[digit]
        A = concatenate all B[0..9] in order
        exp = exp * 10
    return A`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<RadixSortState>[] => {
    let arr = Array.isArray(input) && input.length > 0 ? input.map((n) => Math.max(0, Math.floor(n))) : [170, 45, 75, 90, 802, 24, 2, 66];
    const maxVal = Math.max(...arr, 0);
    const timeline: ExecutionFrame<RadixSortState>[] = [];

    const baseFrame = (
      stepIdx: number,
      state: RadixSortState,
      codeLine: number,
      explanation: string,
      action: string,
      isMilestone: boolean,
      scope: Record<string, string | number>,
      soundCue?: ExecutionFrame<RadixSortState>['soundCue']
    ): ExecutionFrame<RadixSortState> => ({
      stepIndex: stepIdx,
      totalSteps: 0,
      codeLine,
      state: {
        array: [...state.array],
        exp: state.exp,
        maxVal: state.maxVal,
        buckets: state.buckets.map((b) => [...b]),
        currentIdx: state.currentIdx,
        activeBucket: state.activeBucket,
        collectBucket: state.collectBucket,
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
          id: 'radix-frame',
          name: 'radixSort',
          file: 'radixSort.ts',
          line: codeLine,
          params: { n: arr.length, exp: state.exp, maxVal },
        },
      ],
      scopeVariables: scope,
      explanation,
      action,
      isMilestone,
      soundCue,
      invariantStatus:
        state.phase === 'done'
          ? 'Array is fully sorted across all digit places.'
          : `Array is stably sorted for all digits < ${state.exp * 10}.`,
    });

    const state: RadixSortState = {
      array: [...arr],
      exp: 1,
      maxVal,
      buckets: Array.from({ length: 10 }, () => []),
      currentIdx: null,
      activeBucket: null,
      collectBucket: null,
      phase: 'inspect-digit',
    };

    let step = 0;
    let checkpointAdded = false;

    // Initial step
    timeline.push({
      ...baseFrame(
        step++,
        state,
        3,
        `Initialized Radix Sort. Maximum element = ${maxVal}. Starting with Least Significant Digit (exp = 1, 1s place).`,
        'Initialize Radix Sort',
        true,
        { N: arr.length, maxVal, exp: 1 },
        'start'
      ),
      pedagogy: {
        what: `The largest key is ${maxVal}, so ${maxVal === 0 ? 1 : Math.floor(Math.log10(maxVal)) + 1} digit passes are enough to place every value.`,
        why: 'LSD radix sort deliberately starts with the least significant digit; later passes only refine order without destroying it.',
        whatNext: 'Pass 1: route every number into one of ten buckets by its 1s digit.',
      },
    });

    let exp = 1;
    while (Math.floor(maxVal / exp) > 0) {
      state.exp = exp;
      state.buckets = Array.from({ length: 10 }, () => []);
      state.collectBucket = null;
      const digitName = exp === 1 ? '1s' : exp === 10 ? '10s' : exp === 100 ? '100s' : `${exp}s`;

      timeline.push({
        ...baseFrame(
          step++,
          state,
          5,
          `Starting pass for ${digitName} place (divisor exp = ${exp}). Cleared 10 digit buckets (0 to 9).`,
          `Start pass exp = ${exp}`,
          true,
          { exp, place: digitName, activeElements: state.array.length }
        ),
        pedagogy: {
          what: `Pass for the ${digitName} place begins with exp = ${exp}; all ten buckets are empty.`,
          why: 'Buckets must be cleared every pass or items from the previous digit would leak into this pass.',
          whatNext: `For each number compute digit = (value ÷ ${exp}) mod 10 and append it to that bucket.`,
        },
      });

      // Phase 1: Distribute numbers into buckets
      state.phase = 'place-bucket';
      for (let i = 0; i < state.array.length; i++) {
        const val = state.array[i];
        const digit = Math.floor(val / exp) % 10;
        state.currentIdx = i;
        state.activeBucket = digit;

        timeline.push({
          ...baseFrame(
            step++,
            state,
            8,
            `Inspecting ${val}: (${val} // ${exp}) % 10 = ${digit}. Routing ${val} into bucket [${digit}].`,
            `Route ${val} -> bucket ${digit}`,
            false,
            { i, val, exp, digit },
            'compare'
          ),
          pedagogy: {
            what: `Value ${val} exposes digit ${digit} at the ${digitName} place: (${val} ÷ ${exp}) mod 10.`,
            why: 'A single arithmetic formula extracts the digit for any place value — no comparisons between keys are needed.',
            whatNext: `Append ${val} at the tail of bucket [${digit}] so equal digits keep their arrival order.`,
          },
        });

        state.buckets[digit].push(val);

        timeline.push({
          ...baseFrame(
            step++,
            state,
            9,
            `Placed ${val} into bucket [${digit}]. Bucket [${digit}] now has ${state.buckets[digit].length} items.`,
            `Placed in bucket ${digit}`,
            false,
            { val, bucket: digit, bucketSize: state.buckets[digit].length },
            'step'
          ),
          pedagogy: {
            what: `${val} joined bucket [${digit}]; the bucket now holds ${state.buckets[digit].length} item(s).`,
            why: 'Items are always appended at the tail: within one bucket, earlier-arriving equal-digit keys stay ahead (stability).',
            whatNext:
              i < state.array.length - 1
                ? `Route the next array value at index ${i + 1}.`
                : 'All values are bucketed — gather the buckets next.',
          },
        });
      }

      // Phase 2: Collect numbers from buckets 0 to 9 — one frame per non-empty
      // bucket so the stable drain order is never hidden in a single jump.
      state.phase = 'collect';
      state.currentIdx = null;
      state.activeBucket = null;

      const nextArr: number[] = [];
      const nonEmptyBuckets: number[] = [];
      for (let b = 0; b < 10; b++) {
        if (state.buckets[b].length > 0) nonEmptyBuckets.push(b);
      }

      nonEmptyBuckets.forEach((b, drainOrder) => {
        const drainedItems = [...state.buckets[b]];
        state.buckets[b] = []; // the bucket is genuinely empty once drained
        state.collectBucket = b;
        for (const item of drainedItems) nextArr.push(item);
        state.array = [...nextArr];

        const nextBucket = nonEmptyBuckets[drainOrder + 1];
        const attachCheckpoint = !checkpointAdded && drainOrder === 0;

        timeline.push({
          ...baseFrame(
            step++,
            state,
            10,
            `Gathering bucket [${b}] (${drainedItems.length} item(s)): append [${drainedItems.join(', ')}] → rebuilt array [${state.array.join(', ')}].`,
            `Gather bucket ${b}`,
            false,
            { exp, bucket: b, drained: drainedItems.length, rebuilt: state.array.join(', ') }
          ),
          pedagogy: {
            what: `Bucket [${b}] is drained in arrival order and appended to the rebuilt array.`,
            why: 'Draining from bucket [0] upward puts all smaller digits first, and appending preserves each bucket\'s arrival order — that is the stability every earlier pass relies on.',
            whatNext:
              nextBucket !== undefined
                ? `Drain bucket [${nextBucket}] next.`
                : `All buckets drained — the ${digitName} pass is complete.`,
          },
          checkpoint: attachCheckpoint
            ? {
                id: 'radix-collect-order',
                question: 'When rebuilding the array, in which order are the buckets drained?',
                options: [
                  'Ascending: bucket [0] → bucket [9]',
                  'Descending: bucket [9] → bucket [0]',
                ],
                correctIndex: 0,
                explanation:
                  'Ascending order sorts by this digit, and stable appends preserve the ordering established by all lower-digit passes.',
              }
            : undefined,
        });
        if (attachCheckpoint) checkpointAdded = true;
      });

      state.collectBucket = null;

      timeline.push({
        ...baseFrame(
          step++,
          state,
          10,
          `Gathered all buckets in stable order for ${digitName} place: [${state.array.join(', ')}].`,
          `Gather buckets for exp = ${exp}`,
          true,
          { exp, result: state.array.join(', ') },
          'success'
        ),
        pedagogy: {
          what: `The ${digitName} pass is complete; the rebuilt array is [${state.array.join(', ')}].`,
          why: `The array is now stably sorted by its lowest ${exp === 1 ? 1 : Math.floor(Math.log10(exp)) + 1} digit(s) — later passes may reorder by higher digits but will not break this.`,
          whatNext:
            Math.floor(maxVal / (exp * 10)) > 0
              ? `Advance exp to ${exp * 10} and repeat with the next digit.`
              : 'All digit places processed — the array must be fully sorted.',
        },
      });

      exp *= 10;
    }

    state.phase = 'done';
    state.currentIdx = null;
    state.activeBucket = null;
    state.collectBucket = null;

    timeline.push({
      ...baseFrame(
        step++,
        state,
        12,
        `Radix Sort complete! All digit places processed. Final sorted array: [${state.array.join(', ')}].`,
        'Sort Complete',
        true,
        { finalArray: state.array.join(', ') },
        'complete'
      ),
      pedagogy: {
        what: `Final array: [${state.array.join(', ')}] — fully sorted after one pass per digit place.`,
        why: 'Each pass was stable for one digit, so the ordering from lower digits survived every higher-digit pass.',
        whatNext: 'Try the 3-digit preset and watch how the array becomes sorted by the 10s pass and only perfected by the 100s pass.',
      },
    });

    const total = timeline.length;
    timeline.forEach((f) => {
      f.totalSteps = total;
    });

    return timeline;
  },

  renderStage: (frame: ExecutionFrame<RadixSortState>) => {
    const { array, exp, buckets, currentIdx, activeBucket, collectBucket, phase } = frame.state;
    const digitName = exp === 1 ? '1s place' : exp === 10 ? '10s place' : exp === 100 ? '100s place' : `${exp}s place`;

    return (
      <div className="w-full flex flex-col items-center justify-center p-4 space-y-6 select-none">
        {/* Top Header */}
        <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-2.5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Active Digit Pass:</span>
            <span className="text-sm font-mono font-bold text-sky-400 uppercase">{digitName} (exp = {exp})</span>
          </div>
          <div className="h-4 w-px bg-slate-700/60" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Phase:</span>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
              {phase.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Current Array View */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">Array Buffer (N = {array.length})</span>
            {currentIdx !== null && (
              <span className="text-xs font-mono text-amber-300 font-bold">Scanning arr[{currentIdx}] = {array[currentIdx]}</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {array.map((val, idx) => {
              const isCurrent = currentIdx === idx;
              const digit = Math.floor(val / exp) % 10;

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg font-mono text-sm font-bold transition-all duration-200 border ${
                      isCurrent
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-110 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-200 border-slate-700/70'
                    }`}
                  >
                    <span>{val}</span>
                    <span className="text-[9px] font-extrabold text-sky-400 font-mono -mt-0.5">d:{digit}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 10 Digit Buckets 0 to 9 */}
        <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur">
          <div className="text-xs font-medium text-slate-400 mb-3 flex items-center justify-between">
            <span>Digit Buckets [0 ... 9]</span>
            <span className="text-[11px] font-mono text-slate-400">Values routed by (x // {exp}) % 10</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {buckets.map((bList, digitKey) => {
              const isActive = activeBucket === digitKey;
              const isDraining = collectBucket === digitKey;
              const isDrained =
                phase === 'collect' && collectBucket !== null && digitKey < collectBucket;

              return (
                <div
                  key={digitKey}
                  data-bucket={digitKey}
                  data-draining={isDraining ? 'true' : 'false'}
                  data-drained={isDrained ? 'true' : 'false'}
                  className={`flex flex-col items-center min-h-[110px] p-2 rounded-xl border transition-all duration-200 ${
                    isDraining
                      ? 'bg-purple-500/15 border-purple-400 ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/20'
                      : isActive
                      ? 'bg-sky-500/15 border-sky-400 ring-2 ring-sky-400/40 shadow-lg shadow-sky-500/20'
                      : isDrained
                      ? 'bg-slate-950/40 border-slate-900 opacity-45'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1 w-full text-center flex items-center justify-center gap-1">
                    [{digitKey}]
                    {isDraining && <span className="text-purple-300 text-[10px]">▼ drain</span>}
                    {isDrained && <span className="text-[#10B981] text-[10px]">✓</span>}
                  </span>

                  <div className="flex flex-col-reverse gap-1.5 w-full items-center">
                    {bList.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="w-full py-1 text-center font-mono text-xs font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 rounded shadow-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
