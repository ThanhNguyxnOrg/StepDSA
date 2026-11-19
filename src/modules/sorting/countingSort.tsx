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

const MAX_LEN = 12;
const MAX_KEY = 99;
const DEFAULT_ARRAY = [4, 2, 2, 8, 3, 3, 1];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

/**
 * Counting sort needs non-negative integer keys: non-numeric entries and
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
    notes.push(
      `${negatives.length} negative value(s) dropped (counting sort needs non-negative keys)`
    );
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
    pseudocode: `function countingSort(arr):
    if length(arr) == 0: return []
    k = max(arr)
    allocate count[0..k] filled with 0
    allocate output[0..length(arr)-1]
    for each x in arr:
        count[x] = count[x] + 1
    for i = 1 to k:
        count[i] = count[i] + count[i - 1]
    for i = length(arr) - 1 down to 0:
        val = arr[i]
        output[count[val] - 1] = val
        count[val] = count[val] - 1
    return output`,
    python: `def counting_sort(arr):
    if len(arr) == 0: return []
    k = max(arr)
    count = [0] * (k + 1)
    output = [0] * len(arr)
    for x in arr:
        count[x] += 1
    for i in range(1, k + 1):
        count[i] += count[i - 1]
    for i in range(len(arr) - 1, -1, -1):
        val = arr[i]
        output[count[val] - 1] = val
        count[val] -= 1
    return output`,
    typescript: `function countingSort(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const k = Math.max(...arr);
  const count = new Array(k + 1).fill(0);
  const output = new Array(arr.length).fill(0);
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++; }
  for (let i = 1; i <= k; i++) {
    count[i] += count[i - 1]; }
  for (let i = arr.length - 1; i >= 0; i--) {
    const val = arr[i];
    output[count[val] - 1] = val;
    count[val]--; }
  return output; }`,
    cpp: `vector<int> countingSort(vector<int>& arr) {
    if (arr.empty()) return {};
    int k = *max_element(arr.begin(), arr.end());
    vector<int> count(k + 1, 0);
    vector<int> output(arr.size());
    for (int x : arr) {
        count[x]++; }
    for (int i = 1; i <= k; i++) {
        count[i] += count[i - 1]; }
    for (int i = (int)arr.size() - 1; i >= 0; i--) {
        int val = arr[i];
        output[count[val] - 1] = val;
        count[val]--; }
    return output; }`,
    java: `int[] countingSort(int[] arr) {
    if (arr.length == 0) return arr;
    int k = Arrays.stream(arr).max().getAsInt();
    int[] count = new int[k + 1];
    int[] output = new int[arr.length];
    for (int x : arr) {
        count[x]++; }
    for (int i = 1; i <= k; i++) {
        count[i] += count[i - 1]; }
    for (int i = arr.length - 1; i >= 0; i--) {
        int val = arr[i];
        output[count[val] - 1] = val;
        count[val]--; }
    return output; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<CountingSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const timeline: ExecutionFrame<CountingSortState>[] = [];

    const original = [...array];
    let count: number[] = [];
    let output: (number | null)[] = [];
    let currOrigIdx: number | null = null;
    let currCountIdx: number | null = null;
    let currOutputIdx: number | null = null;
    let phase: CountingSortState['phase'] = 'find-max';
    const stats = { reads: 0, prefixSteps: 0, placements: 0 };

    let countCheckpointAdded = false;
    let prefixCheckpointAdded = false;
    let firstPlacementMilestoneUsed = false;
    let halfMilestoneUsed = false;

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && stats.placements >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Output Filled';
      }
      return undefined;
    };

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: { what: string; why: string; whatNext: string };
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<CountingSortState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<CountingSortState>['soundCue'];
      checkpoint?: ExecutionFrame<CountingSortState>['checkpoint'];
    }) => {
      timeline.push({
        stepIndex: timeline.length,
        totalSteps: timeline.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        state: {
          original: [...original],
          count: [...count],
          output: [...output],
          currOrigIdx,
          currCountIdx,
          currOutputIdx,
          phase,
        },
        callStack: [
          {
            name: 'countingSort',
            params: { n, k: count.length - 1 },
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
          swaps: stats.reads + stats.prefixSteps + stats.placements,
          accesses: stats.reads * 2 + stats.prefixSteps * 2 + stats.placements * 3,
          lookups: 0,
        },
        invariantStatus: {
          label:
            phase === 'done'
              ? 'output array is fully sorted and stable'
              : phase === 'prefix-sum'
                ? 'count[i] = number of elements <= i (cumulative)'
                : phase === 'build-output'
                  ? 'count[v] - 1 is the last free slot of key v\'s output block'
                  : 'frequency table tracks every occurrence of each key',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    // ── Frame 0: initialisation (compute K) ────────────────────────────────
    if (n > 0) {
      const maxVal = Math.max(...array);
      count = new Array(maxVal + 1).fill(0);
      output = new Array(n).fill(null);

      pushFrame({
        codeLine: 3,
        action: 'INIT',
        explanation:
          `k = max(arr) = ${maxVal}: the key range is [0..${maxVal}], so a count table of ${maxVal + 1} slots indexes every possible key directly.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        conditionEval: { expr: 'length(arr) == 0', condition: `${n} == 0`, result: false },
        variables: { N: n, K: maxVal, countSlots: maxVal + 1 },
        soundCue: 'start',
        pedagogy: {
          what: `The value range is [0..${maxVal}], so a ${maxVal + 1}-slot count table can index every possible key.`,
          why: 'No comparisons are needed at all: integer keys act as their own array indices.',
          whatNext: 'Scan the input left to right and tally each value into count[value].',
        },
      });

      // ── Phase 1: count frequencies (one frame per element) ───────────────
      phase = 'count-freq';
      for (let i = 0; i < n; i++) {
        const val = original[i];
        const freqBefore = count[val];
        count[val] += 1;
        stats.reads += 1;
        currOrigIdx = i;
        currCountIdx = val;

        pushFrame({
          codeLine: 7,
          action: 'COUNT',
          explanation: `Read arr[${i}] = ${val}: count[${val}] increments from ${freqBefore} to ${count[val]}.`,
          variables: { i, val, 'count[val]': count[val], freqBefore },
          conditionEval: { expr: 'count[x] = count[x] + 1', condition: `${freqBefore} + 1 = ${count[val]}`, result: count[val] },
          soundCue: 'compare',
          pedagogy: {
            what: `arr[${i}] = ${val} is tallied into its own slot: count[${val}] is now ${count[val]}.`,
            why: 'Every occurrence of the same value lands in the identical slot, which is how duplicates are counted in one pass.',
            whatNext:
              i < n - 1
                ? `Read arr[${i + 1}] = ${original[i + 1]} next.`
                : 'Frequency pass done — compute prefix sums next.',
          },
        });
      }
      currOrigIdx = null;

      // ── Phase 2: prefix sums ─────────────────────────────────────────────
      phase = 'prefix-sum';
      pushFrame({
        codeLine: 8,
        action: 'PREFIX_START',
        explanation: `Frequencies are raw counts. Sweep keys 1..${maxVal} turning each into a cumulative "number of elements <= i".`,
        variables: { K: maxVal },
        soundCue: 'step',
        pedagogy: {
          what: 'Every slot count[v] currently holds a raw frequency; duplicates share one slot.',
          why: 'A slot alone cannot tell duplicates apart, so this pass turns each frequency into a cumulative "last free position" pointer.',
          whatNext: 'Sweep left to right: count[i] += count[i-1] starting at i = 1.',
        },
      });

      for (let i = 1; i <= maxVal; i++) {
        const prevVal = count[i - 1];
        const curVal = count[i];
        count[i] += prevVal;
        stats.prefixSteps += 1;
        currCountIdx = i;

        const prefixCheckpoint: ExecutionFrame<CountingSortState>['checkpoint'] | undefined =
          !prefixCheckpointAdded
            ? {
                id: 'counting-sort-prefix-meaning',
                question: `After the sweep, count[${i}] = ${count[i]}. What does that number mean?`,
                options: [
                  `The raw frequency of key ${i}`,
                  `The number of elements <= ${i} — so count[${i}] - 1 is the last slot of key ${i}'s output block`,
                  'A random offset into the output',
                ],
                correctIndex: 1,
                explanation: `Prefix sums convert frequencies into ranks: count[${i}] = ${count[i]} counts every element <= ${i}, so the last occurrence of key ${i} belongs at output[${count[i] - 1}].`,
                hint: 'What does adding count[i-1] to count[i] accumulate?',
              }
            : undefined;

        pushFrame({
          codeLine: 9,
          action: 'PREFIX_ACC',
          explanation: `count[${i}] = count[${i}] (${curVal}) + count[${i - 1}] (${prevVal}) = ${count[i]} — the number of elements <= ${i}.`,
          variables: { i, 'count[i-1]': prevVal, 'count[i]': count[i], freqOfKey: curVal },
          conditionEval: {
            expr: `count[i] += count[i - 1]`,
            condition: `${curVal} + ${prevVal} = ${count[i]}`,
            result: count[i],
          },
          soundCue: 'step',
          checkpoint: prefixCheckpoint,
          pedagogy: {
            what: `count[${i}] becomes ${count[i]}: the frequency of key ${i} (${curVal}) plus everything smaller (${prevVal}).`,
            why: 'This is the count of elements <= i, so count[i] - 1 is the exact 0-indexed slot of the LAST occurrence of key i.',
            whatNext:
              i < maxVal
                ? `Continue to key ${i + 1}.`
                : 'Prefix sums complete — place elements right-to-left for stability.',
          },
        });
        if (prefixCheckpoint) prefixCheckpointAdded = true;
      }
      currCountIdx = null;

      // ── Phase 3: build output right-to-left (one frame per element) ──────
      phase = 'build-output';
      pushFrame({
        codeLine: 10,
        action: 'BUILD_START',
        explanation: 'Prefix sums reserve one contiguous output block per key. Traverse the input right-to-left so equal keys keep their original order.',
        variables: { phase: 'build-output' },
        soundCue: 'step',
        pedagogy: {
          what: 'Prefix sums now reserve one contiguous output block per key.',
          why: 'Walking the input right-to-left is deliberate: the original last occurrence of a key claims the highest slot, so equal keys keep their input order (stability).',
          whatNext: `Read arr[${n - 1}] = ${original[n - 1]} and compute its slot as count[${original[n - 1]}] - 1.`,
        },
      });

      for (let i = n - 1; i >= 0; i--) {
        const val = original[i];
        const countBefore = count[val];
        const targetPos = countBefore - 1;
        output[targetPos] = val;
        count[val] -= 1;
        const remaining = count[val];
        stats.placements += 1;
        currOrigIdx = i;
        currCountIdx = val;
        currOutputIdx = targetPos;

        const placeCheckpoint: ExecutionFrame<CountingSortState>['checkpoint'] | undefined =
          !countCheckpointAdded && remaining >= 1
            ? {
                id: 'counting-sort-duplicate-slot',
                question: `${val} landed at output[${targetPos}] and count[${val}] dropped to ${remaining}. When the scan reaches the next ${val}, which slot will it take?`,
                options: [`output[${remaining - 1}]`, `output[${targetPos}]`],
                correctIndex: 0,
                explanation: `The next placement uses count[${val}] - 1 = ${remaining - 1}, so duplicates fill their block from right to left, keeping stability.`,
                hint: 'Which end of the block shrinks first?',
              }
            : undefined;

        const placeMilestone = !firstPlacementMilestoneUsed
          ? 'First Placement'
          : maybeHalfMilestone();
        if (placeMilestone) firstPlacementMilestoneUsed = true;

        pushFrame({
          codeLine: 12,
          action: 'PLACE',
          explanation: `arr[${i}] = ${val}: count[${val}] was ${countBefore}, so it writes to output[${targetPos}] and shrinks to ${remaining}.`,
          variables: { i, val, targetPos, 'count[val]': remaining, countBefore },
          conditionEval: {
            expr: 'output[count[val] - 1] = val',
            condition: `${countBefore} - 1 = ${targetPos}`,
            result: targetPos,
          },
          soundCue: 'success',
          milestone: placeMilestone,
          checkpoint: placeCheckpoint,
          pedagogy: {
            what: `${val} now occupies output[${targetPos}]; count[${val}] dropped to ${remaining} so the slot cannot be used twice.`,
            why: 'Right-to-left placement plus decrement means earlier duplicates from the input claim lower slots, which preserves their relative order.',
            whatNext:
              remaining > 0
                ? `The next ${val} encountered will land at output[${remaining - 1}].`
                : i > 0
                  ? `Read arr[${i - 1}] = ${original[i - 1]} next.`
                  : 'All elements are placed.',
          },
        });
        if (placeCheckpoint) countCheckpointAdded = true;
      }
      currOrigIdx = null;
      currCountIdx = null;
      currOutputIdx = null;

      // ── Phase 4: done ─────────────────────────────────────────────────────
      phase = 'done';
      pushFrame({
        codeLine: 14,
        action: 'DONE',
        explanation: `Counting Sort complete: [${output.join(', ')}] — sorted with zero element-to-element comparisons after ${stats.reads} count(s), ${stats.prefixSteps} prefix step(s) and ${stats.placements} placement(s).`,
        conditionEval: { expr: 'output is sorted', condition: output.join(', '), result: isSorted(output.map((v) => v as number)) },
        variables: {
          result: n,
          reads: stats.reads,
          prefixSteps: stats.prefixSteps,
          placements: stats.placements,
        },
        soundCue: 'complete',
        milestone: 'Counting Sort Complete',
        pedagogy: {
          what: `Output is fully sorted: [${output.join(', ')}] — zero element-to-element comparisons were made.`,
          why: 'Placement was pure arithmetic (count[value] - 1), so the cost is bounded by the input size N and value range K, not by log-factors.',
          whatNext: 'Watch the count table during placement: each key\'s block shrinks from the right, which is the stability mechanism.',
        },
      });
    } else {
      // Explicitly empty input: a valid two-frame run, not a fallback.
      pushFrame({
        codeLine: 2,
        action: 'INIT',
        explanation:
          'n = length(arr) = 0: the guard at the top of the function short-circuits before any table is allocated.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        conditionEval: { expr: 'length(arr) == 0', condition: '0 == 0', result: true },
        variables: { N: 0, K: null },
        soundCue: 'start',
        pedagogy: {
          what: 'The array is empty, so there is no key range to index.',
          why: 'max(arr) would be undefined on an empty input — the length guard exists precisely to avoid that.',
          whatNext: 'Return the empty array; nothing is counted, summed, or placed.',
        },
      });
      phase = 'done';
      pushFrame({
        codeLine: 2,
        action: 'DONE',
        explanation:
          'Empty array: the guard returns [] immediately — zero reads, zero prefix steps, zero placements.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        conditionEval: { expr: 'length(arr) == 0', condition: '0 == 0', result: true },
        variables: { result: 0, reads: 0, prefixSteps: 0, placements: 0 },
        soundCue: 'complete',
        milestone: 'Nothing to Sort',
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'The guard at the top of the function short-circuits before any table is allocated.',
          whatNext: 'Load a preset such as Standard Integers to watch the three phases run.',
        },
      });
    }

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
