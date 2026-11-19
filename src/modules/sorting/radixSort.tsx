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

const MAX_LEN = 12;
const MAX_KEY = 9999;
const DEFAULT_ARRAY = [170, 45, 75, 90, 802, 24, 2, 66];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

/**
 * LSD radix sort needs non-negative integer keys: non-numeric entries and
 * negative values are dropped, values are clamped to MAX_KEY, and the input is
 * truncated to MAX_LEN elements. Every adjustment is reported as a note so the
 * INIT frame can state it honestly. An explicitly empty array stays empty —
 * it is a valid two-frame run, not an error.
 */
function normalise(input: number[] | undefined): NormalisedInput {
  const notes: string[] = [];

  if (!Array.isArray(input)) {
    notes.push('input was not an array, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  const usable = input.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  if (input.length > 0 && usable.length === 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }
  if (usable.length < input.length) {
    notes.push(`${input.length - usable.length} non-numeric value(s) dropped`);
  }

  const negatives = usable.filter((value) => Math.round(value) < 0);
  if (negatives.length > 0) {
    notes.push(`${negatives.length} negative value(s) dropped (LSD radix sort needs non-negative keys)`);
  }

  const kept: number[] = [];
  for (const value of usable) {
    const rounded = Math.round(value);
    if (rounded < 0) continue;
    const clamped = Math.min(MAX_KEY, rounded);
    if (clamped !== rounded) {
      notes.push(`value ${rounded} clamped to ${clamped} (max key ${MAX_KEY})`);
    }
    kept.push(clamped);
  }

  if (input.length > 0 && kept.length === 0) {
    notes.push('no non-negative keys remain, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  let array = kept;
  if (array.length > MAX_LEN) {
    notes.push(`${array.length} values truncated to ${MAX_LEN} for a readable strip`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

function isSorted(input: number[]): boolean {
  for (let i = 1; i < input.length; i++) {
    if (input[i] < input[i - 1]) return false;
  }
  return true;
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
    pseudocode: `function radixSort(arr):
    if length(arr) == 0: return arr
    maxVal = maximum value in arr
    exp = 1
    while floor(maxVal / exp) > 0:
        create 10 empty buckets B[0..9]
        for each x in arr:
            digit = floor(x / exp) mod 10
            append x into B[digit]
        clear arr
        append all bucket contents B[0..9] into arr in order
        exp = exp * 10
    return arr`,
    python: `def radix_sort(arr):
    if len(arr) == 0: return arr
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        buckets = [[] for _ in range(10)]
        for num in arr:
            digit = (num // exp) % 10
            buckets[digit].append(num)
        arr = []
        for bucket in buckets: arr.extend(bucket)
        exp *= 10
    return arr`,
    typescript: `function radixSort(arr: number[]): number[] {
  if (arr.length === 0) return arr;
  const maxVal = Math.max(...arr);
  let exp = 1;
  while (Math.floor(maxVal / exp) > 0) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    for (const num of arr) {
      const digit = Math.floor(num / exp) % 10;
      buckets[digit].push(num); }
    arr = [];
    for (const bucket of buckets) arr.push(...bucket);
    exp *= 10; }
  return arr; }`,
    cpp: `vector<int> radixSort(vector<int>& arr) {
    if (arr.empty()) return arr;
    int maxVal = *max_element(arr.begin(), arr.end());
    int exp = 1;
    while (maxVal / exp > 0) {
        vector<vector<int>> buckets(10);
        for (int x : arr) {
            int digit = (x / exp) % 10;
            buckets[digit].push_back(x); }
        arr.clear();
        for (auto& b : buckets) arr.insert(arr.end(), b.begin(), b.end());
        exp *= 10; }
    return arr; }`,
    java: `int[] radixSort(int[] arr) {
    if (arr.length == 0) return arr;
    int maxVal = Arrays.stream(arr).max().getAsInt();
    int exp = 1;
    while (maxVal / exp > 0) {
        int[][] buckets = new int[10][arr.length]; int[] size = new int[10];
        for (int x : arr) {
            int digit = (x / exp) % 10;
            buckets[digit][size[digit]++] = x; }
        int k = 0;
        for (int d = 0; d < 10; d++) for (int t = 0; t < size[d]; t++) arr[k++] = buckets[d][t];
        exp *= 10; }
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<RadixSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const maxVal = n > 0 ? Math.max(...array) : 0;
    const timeline: ExecutionFrame<RadixSortState>[] = [];

    let working = [...array];
    let buckets: number[][] = Array.from({ length: 10 }, () => []);
    let exp = 1;
    let currentIdx: number | null = null;
    let activeBucket: number | null = null;
    let collectBucket: number | null = null;
    let phase: RadixSortState['phase'] = 'inspect-digit';
    const stats = { routes: 0, collects: 0, passes: 0 };

    let collectCheckpointAdded = false;
    let digitCheckpointAdded = false;

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: { what: string; why: string; whatNext: string };
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<RadixSortState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<RadixSortState>['soundCue'];
      checkpoint?: ExecutionFrame<RadixSortState>['checkpoint'];
    }) => {
      timeline.push({
        stepIndex: timeline.length,
        totalSteps: timeline.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        state: {
          array: [...working],
          exp,
          maxVal,
          buckets: buckets.map((b) => [...b]),
          currentIdx,
          activeBucket,
          collectBucket,
          phase,
        },
        callStack: [
          {
            name: 'radixSort',
            params: { n: working.length, exp, maxVal },
            line: opts.codeLine,
            isCurrent: true,
          },
        ],
        scopeVariables: opts.variables ?? {},
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        explanation: opts.explanation,
        metrics: {
          comparisons: 0,
          swaps: stats.routes + stats.collects,
          accesses: stats.routes * 2 + stats.collects * 2,
          lookups: 0,
        },
        invariantStatus: {
          label:
            phase === 'done'
              ? 'the array is fully sorted across all digit places'
              : `the array is stably sorted by all digits below exp = ${exp * 10}`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    const digitNameFor = (e: number): string =>
      e === 1 ? '1s' : e === 10 ? '10s' : e === 100 ? '100s' : e === 1000 ? '1000s' : `${e}s`;

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (n > 0) {
      const digitCount = maxVal === 0 ? 1 : Math.floor(Math.log10(maxVal)) + 1;
      pushFrame({
        codeLine: 3,
        action: 'INIT',
        explanation:
          `maxVal = ${maxVal}, so ${digitCount} digit pass(es) are enough. Starting at the 1s place (exp = 1).` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        conditionEval: { expr: 'length(arr) == 0', condition: `${n} == 0`, result: false },
        variables: { N: n, maxVal, digitPasses: digitCount },
        soundCue: 'start',
        pedagogy: {
          what: `The largest key is ${maxVal}, so ${digitCount} digit passes are enough to place every value.`,
          why: 'LSD radix sort deliberately starts with the least significant digit; later passes only refine order without destroying it.',
          whatNext: 'Pass 1: route every number into one of ten buckets by its 1s digit.',
        },
      });

      while (Math.floor(maxVal / exp) > 0) {
        const digitName = digitNameFor(exp);
        buckets = Array.from({ length: 10 }, () => []);
        collectBucket = null;
        stats.passes += 1;
        phase = 'place-bucket';

        pushFrame({
          codeLine: 6,
          action: 'PASS_START',
          explanation: `Starting the ${digitName} pass (exp = ${exp}): ten fresh buckets [0..9] are cleared.`,
          variables: { exp, place: digitName, elements: working.length },
          soundCue: 'step',
          pedagogy: {
            what: `Pass for the ${digitName} place begins with exp = ${exp}; all ten buckets are empty.`,
            why: 'Buckets must be cleared every pass or items from the previous digit would leak into this pass.',
            whatNext: `For each number compute digit = (value ÷ ${exp}) mod 10 and append it to that bucket.`,
          },
        });

        for (let i = 0; i < working.length; i++) {
          const val = working[i];
          const digit = Math.floor(val / exp) % 10;
          currentIdx = i;
          activeBucket = digit;
          buckets[digit].push(val);
          stats.routes += 1;

          const digitCheckpoint: ExecutionFrame<RadixSortState>['checkpoint'] | undefined =
            !digitCheckpointAdded
              ? {
                  id: 'radix-digit-formula',
                  question: `${val} is routed by (val ÷ ${exp}) mod 10 = ${digit}. Which digit of ${val} decides its bucket in this pass?`,
                  options: [
                    'The most significant (leftmost) digit',
                    `The ${digitName}-place digit — position ${digit} from the right, 0-indexed`,
                    'A random digit, different every pass',
                  ],
                  correctIndex: 1,
                  explanation: `LSD passes read one fixed place: (${val} ÷ ${exp}) mod 10 isolates the ${digitName} digit, here ${digit}.`,
                  hint: 'exp = 1 means divide by 1 — which digit survives the mod 10?',
                }
              : undefined;

          pushFrame({
            codeLine: 9,
            action: 'DIGIT_PLACE',
            explanation: `(${val} ÷ ${exp}) % 10 = ${digit}: ${val} is appended to bucket [${digit}] (now ${buckets[digit].length} item(s)).`,
            variables: { i, val, exp, digit, bucketSize: buckets[digit].length },
            conditionEval: {
              expr: `(val ÷ exp) % 10`,
              condition: `(${val} ÷ ${exp}) % 10 = ${digit}`,
              result: digit,
            },
            soundCue: 'compare',
            checkpoint: digitCheckpoint,
            pedagogy: {
              what: `Value ${val} exposes digit ${digit} at the ${digitName} place and joins bucket [${digit}].`,
              why: 'A single arithmetic formula extracts the digit for any place value — no comparisons between keys are needed.',
              whatNext:
                i < working.length - 1
                  ? `Route the next value arr[${i + 1}] = ${working[i + 1]}.`
                  : 'All values are bucketed — gather the buckets next.',
            },
          });
          if (digitCheckpoint) digitCheckpointAdded = true;
        }
        currentIdx = null;
        activeBucket = null;

        phase = 'collect';
        const nextArr: number[] = [];
        const nonEmptyBuckets: number[] = [];
        for (let b = 0; b < 10; b++) {
          if (buckets[b].length > 0) nonEmptyBuckets.push(b);
        }

        nonEmptyBuckets.forEach((b, drainOrder) => {
          const drainedItems = [...buckets[b]];
          buckets[b] = []; // the bucket is genuinely empty once drained
          collectBucket = b;
          for (const item of drainedItems) nextArr.push(item);
          working = [...nextArr];
          stats.collects += 1;

          const nextBucket = nonEmptyBuckets[drainOrder + 1];
          const collectCheckpoint: ExecutionFrame<RadixSortState>['checkpoint'] | undefined =
            !collectCheckpointAdded && drainOrder === 0
              ? {
                  id: 'radix-collect-order',
                  question: 'When rebuilding the array, in which order are the buckets drained?',
                  options: [
                    'Descending: bucket [9] → bucket [0]',
                    'Ascending: bucket [0] → bucket [9]',
                  ],
                  correctIndex: 1,
                  explanation:
                    'Ascending order sorts by this digit, and stable appends preserve the ordering established by all lower-digit passes.',
                  hint: 'Which bucket holds the smallest current digit?',
                }
              : undefined;

          pushFrame({
            codeLine: 11,
            action: 'COLLECT_BUCKET',
            explanation: `Gathering bucket [${b}] (${drainedItems.length} item(s)): append [${drainedItems.join(', ')}] → rebuilt array [${working.join(', ')}].`,
            variables: { exp, bucket: b, drained: drainedItems.length, rebuilt: working.join(', ') },
            soundCue: 'step',
            checkpoint: collectCheckpoint,
            pedagogy: {
              what: `Bucket [${b}] is drained in arrival order and appended to the rebuilt array.`,
              why: 'Draining from bucket [0] upward puts all smaller digits first, and appending preserves each bucket\'s arrival order — that is the stability every earlier pass relies on.',
              whatNext:
                nextBucket !== undefined
                  ? `Drain bucket [${nextBucket}] next.`
                  : `All buckets drained — the ${digitName} pass is complete.`,
            },
          });
          if (collectCheckpoint) collectCheckpointAdded = true;
        });
        collectBucket = null;

        pushFrame({
          codeLine: 12,
          action: 'PASS_COMPLETE',
          explanation: `${digitName} pass complete: [${working.join(', ')}] is stably sorted by the lowest ${exp === 1 ? 1 : Math.floor(Math.log10(exp)) + 1} digit(s).`,
          variables: { exp, result: working.join(', ') },
          conditionEval: {
            expr: 'floor(maxVal / exp) > 0',
            condition: `${Math.floor(maxVal / exp)} > 0`,
            result: Math.floor(maxVal / exp) > 0,
          },
          soundCue: 'success',
          milestone: `${digitName} Pass Sorted`,
          pedagogy: {
            what: `The ${digitName} pass is complete; the rebuilt array is [${working.join(', ')}].`,
            why: `The array is now stably sorted by its lowest ${exp === 1 ? 1 : Math.floor(Math.log10(exp)) + 1} digit(s) — later passes may reorder by higher digits but will not break this.`,
            whatNext:
              Math.floor(maxVal / (exp * 10)) > 0
                ? `Advance exp to ${exp * 10} and repeat with the next digit.`
                : 'All digit places processed — the array must be fully sorted.',
          },
        });

        exp *= 10;
      }

      phase = 'done';
      pushFrame({
        codeLine: 13,
        action: 'DONE',
        explanation: `Radix Sort complete: [${working.join(', ')}] is sorted after ${stats.passes} pass(es), ${stats.routes} route(s) and ${stats.collects} bucket gather(s) — zero element-to-element comparisons.`,
        conditionEval: { expr: 'array is sorted', condition: working.join(', '), result: isSorted(working) },
        variables: {
          result: n,
          passes: stats.passes,
          routes: stats.routes,
          collects: stats.collects,
        },
        soundCue: 'complete',
        milestone: 'Radix Sort Complete',
        pedagogy: {
          what: `Final array: [${working.join(', ')}] — fully sorted after one pass per digit place.`,
          why: 'Each pass was stable for one digit, so the ordering from lower digits survived every higher-digit pass.',
          whatNext: 'Try the 3-digit preset and watch how the array becomes sorted by the 10s pass and only perfected by the 100s pass.',
        },
      });
    } else {
      // Explicitly empty input: a valid two-frame run, not a fallback.
      pushFrame({
        codeLine: 2,
        action: 'INIT',
        explanation:
          'n = length(arr) = 0: the guard returns the array immediately — no digit passes run.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        conditionEval: { expr: 'length(arr) == 0', condition: '0 == 0', result: true },
        variables: { N: 0, maxVal: null, digitPasses: 0 },
        soundCue: 'start',
        pedagogy: {
          what: 'The array is empty, so there is no maximum and no digit pass to run.',
          why: 'max(arr) would be undefined on an empty input — the length guard exists precisely to avoid that.',
          whatNext: 'Return the empty array; nothing is routed or gathered.',
        },
      });
      phase = 'done';
      pushFrame({
        codeLine: 13,
        action: 'DONE',
        explanation: 'Radix Sort complete on an empty array: zero passes, zero routes, zero gathers.',
        conditionEval: { expr: 'array is sorted', condition: '', result: true },
        variables: { result: 0, passes: 0, routes: 0, collects: 0 },
        soundCue: 'complete',
        milestone: 'Nothing to Sort',
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'The guard short-circuits before any bucket is allocated.',
          whatNext: 'Load a preset such as Classic 3-Digit Keys to watch the digit passes run.',
        },
      });
    }

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
