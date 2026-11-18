import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

/**
 * Quicksort (Lomuto partition), rebuilt to the StepDSA teaching standard:
 * - one meaningful operation per frame (enter range → call partition → pick
 *   pivot → compare → swap/no-swap → advance pIndex → pivot swap → pivot
 *   settled → recurse left/right),
 * - WHAT/WHY/NEXT pedagogy on every frame,
 * - two prediction checkpoints and real milestones (no per-partition noise),
 * - five language snippets sharing the same statement on every line, and
 * - honest input normalisation reported in the INIT frame.
 */

export interface QuickSortState extends ArrayStageState {
  /** Current recursive range being worked on. */
  low: number;
  high: number;
  /** Index of the pivot of the partition currently running (null outside partition). */
  pivotIndex: number | null;
  pivotValue: number | null;
  /** Lomuto boundary: first slot after the <= pivot region. */
  pIndex: number | null;
  /** Scan index. */
  j: number | null;
  phase: 'init' | 'call' | 'partition' | 'base' | 'done';
  actionType:
    | 'INIT'
    | 'ENTER_RANGE'
    | 'EMPTY_RANGE'
    | 'BASE_CASE'
    | 'CALL_PARTITION'
    | 'PIVOT_SELECTED'
    | 'PINDEX_INIT'
    | 'SCAN_START'
    | 'COMPARE'
    | 'SWAP'
    | 'NO_SWAP'
    | 'ADVANCE_PINDEX'
    | 'PIVOT_SWAP'
    | 'PIVOT_SETTLED'
    | 'PARTITION_RETURNED'
    | 'CALL_LEFT'
    | 'CALL_RIGHT'
    | 'DONE';
  /** Elements that have reached their final position (pivots + singletons). */
  settledCount: number;
  stats: {
    comparisons: number;
    swaps: number;
    partitions: number;
    calls: number;
  };
  /** History of settled pivots (value, final index). */
  settledLog: { value: number; index: number }[];
}

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 98];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

function normalise(input: number[] | undefined): NormalisedInput {
  const notes: string[] = [];

  if (!Array.isArray(input)) {
    notes.push('input was not an array, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  const usable = input.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  // An explicitly empty array is a valid run (nothing to sort), not an error.
  if (input.length > 0 && usable.length === 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }
  if (usable.length < input.length) {
    notes.push(`${input.length - usable.length} non-numeric value(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.max(-MAX_ABS, Math.min(MAX_ABS, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`value ${Math.round(value)} clamped to ${rounded} (±${MAX_ABS})`);
    }
    return rounded;
  });

  let array = clamped;
  if (array.length > MAX_LEN) {
    notes.push(`${array.length} values truncated to ${MAX_LEN} for a readable strip`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

/** Number of partition calls the deterministic Lomuto recursion will make. */
function simulatePartitionCount(input: number[]): number {
  const work = [...input];
  let count = 0;
  const qs = (low: number, high: number): void => {
    if (low >= high) return;
    count += 1;
    const pivot = work[high];
    let pIndex = low;
    for (let j = low; j < high; j++) {
      if (work[j] <= pivot) {
        [work[pIndex], work[j]] = [work[j], work[pIndex]];
        pIndex += 1;
      }
    }
    [work[pIndex], work[high]] = [work[high], work[pIndex]];
    qs(low, pIndex - 1);
    qs(pIndex + 1, high);
  };
  qs(0, work.length - 1);
  return count;
}

function isSorted(input: number[]): boolean {
  for (let i = 1; i < input.length; i++) {
    if (input[i] < input[i - 1]) return false;
  }
  return true;
}

export const quicksortModule: AlgorithmModule<number[], QuickSortState> = {
  id: 'quicksort',
  title: 'Quicksort (Lomuto Partition)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(log N)',
    worstCaseCondition: 'Already sorted or reverse sorted with naive pivot',
  },
  theory: {
    overview:
      'Quicksort is an efficient divide-and-conquer sorting algorithm. It selects a pivot element and partitions the array such that elements smaller than the pivot go to the left, and elements greater go to the right.',
    whyItWorks:
      'By placing the pivot in its exact final sorted position at each recursive partition step, the problem reduces into sorting two independent, smaller subarrays.',
    invariant:
      'In Lomuto partition: All elements in arr[low ... pIndex-1] are <= pivot; all elements in arr[pIndex ... j-1] are > pivot.',
    pitfalls: [
      'Worst-case O(N²) occurs if pivot is repeatedly the smallest or largest element.',
      'Recursion depth can hit O(N) if tail-call optimization or randomized pivot is omitted.',
      'When arr[j] <= pivot and pIndex === j, the swap is a no-op — only pIndex grows.',
    ],
    steps: [
      'Guard: an empty or one-element range is already sorted.',
      'Pick the last element of the range as the pivot.',
      'Scan j from low to high - 1: values <= pivot are swapped into the growing left region.',
      'After the scan, swap the pivot into index pIndex — its final sorted position.',
      'Recurse on the left range [low..pIndex-1], then the right range [pIndex+1..high].',
    ],
    watchOut: [
      'The pivot is settled exactly once and never moves again; recursive calls exclude it.',
      'The final swap can put the pivot back onto itself when it is already the largest of the range.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Standard average case', data: [38, 27, 43, 3, 9, 82, 10] },
    { id: 'reversed', label: 'Worst Case (Reversed)', description: 'O(N²) triggers with last element pivot', data: [80, 70, 60, 50, 40, 30, 20] },
    { id: 'nearly-sorted', label: 'Nearly Sorted', description: 'Fast partition steps', data: [10, 20, 35, 30, 40, 50, 60] },
    { id: 'already-sorted', label: 'Already Sorted', description: 'Every element is the largest — worst-case splits', data: [10, 20, 30, 40, 50] },
    { id: 'single-element', label: 'One Element', description: 'The guard rejects the range immediately', data: [42] },
  ],
  defaultInput: [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 98],
  codeSnippets: {
    pseudocode: `function quicksort(arr, low, high):
    if low < high:
        pIndex = partition(arr, low, high)
        quicksort(arr, low, pIndex - 1)
        quicksort(arr, pIndex + 1, high)
function partition(arr, low, high):
    pivot = arr[high]
    pIndex = low
    for j = low to high - 1:
        if arr[j] <= pivot:
            swap arr[pIndex] with arr[j]
            pIndex = pIndex + 1
    swap arr[pIndex] with arr[high]
    return pIndex`,
    python: `def quicksort(arr, low, high):
    if low < high:
        p_index = partition(arr, low, high)
        quicksort(arr, low, p_index - 1)
        quicksort(arr, p_index + 1, high)
def partition(arr, low, high):
    pivot = arr[high]
    p_index = low
    for j in range(low, high):
        if arr[j] <= pivot:
            arr[p_index], arr[j] = arr[j], arr[p_index]
            p_index += 1
    arr[p_index], arr[high] = arr[high], arr[p_index]
    return p_index`,
    typescript: `function quicksort(arr: number[], low: number, high: number): void {
  if (low < high) {
    const pIndex = partition(arr, low, high);
    quicksort(arr, low, pIndex - 1);
    quicksort(arr, pIndex + 1, high); } }
function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let pIndex = low;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      [arr[pIndex], arr[j]] = [arr[j], arr[pIndex]];
      pIndex++; } }
  [arr[pIndex], arr[high]] = [arr[high], arr[pIndex]];
  return pIndex; }`,
    cpp: `void quicksort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pIndex = partition(arr, low, high);
        quicksort(arr, low, pIndex - 1);
        quicksort(arr, pIndex + 1, high); } }
int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int pIndex = low;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            swap(arr[pIndex], arr[j]);
            pIndex++; } }
    swap(arr[pIndex], arr[high]);
    return pIndex; }`,
    java: `void quicksort(int[] arr, int low, int high) {
    if (low < high) {
        int pIndex = partition(arr, low, high);
        quicksort(arr, low, pIndex - 1);
        quicksort(arr, pIndex + 1, high); } }
int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int pIndex = low;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            int t = arr[pIndex]; arr[pIndex] = arr[j]; arr[j] = t;
            pIndex++; } }
    int t = arr[pIndex]; arr[pIndex] = arr[high]; arr[high] = t;
    return pIndex; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<QuickSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const frames: ExecutionFrame<QuickSortState>[] = [];

    const arr = [...array];
    const settled = new Set<number>();
    const settledLog: QuickSortState['settledLog'] = [];
    const stats = { comparisons: 0, swaps: 0, partitions: 0, calls: 0 };

    const totalPartitions = simulatePartitionCount(array);
    let partitionCounter = 0;
    let settledCount = 0;
    let firstPivotMilestoneUsed = false;
    let halfMilestoneUsed = false;
    let compareCheckpointAdded = false;
    let pivotCheckpointAdded = false;

    let phase: QuickSortState['phase'] = 'init';
    let actionType: QuickSortState['actionType'] = 'INIT';
    let range = { low: 0, high: n - 1 };
    let pivotIndex: number | null = null;
    let pivotValue: number | null = null;
    let pIndex: number | null = null;
    let j: number | null = null;

    const callStack: { name: string; params: Record<string, any>; line?: number; isCurrent?: boolean }[] = [
      { name: 'main', params: { n }, line: 1, isCurrent: true },
    ];

    const pushFrame = (opts: {
      codeLine: number;
      action: QuickSortState['actionType'];
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<QuickSortState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<QuickSortState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      /** Explicit per-index statuses layered over the settled/default backdrop. */
      highlight?: Record<number, ElementStatus>;
      pointers?: Record<string, number>;
    }) => {
      const statusFor = (idx: number): ElementStatus => {
        const explicit = opts.highlight?.[idx];
        if (explicit) return explicit;
        if (settled.has(idx)) return 'sorted';
        return 'default';
      };

      const state: QuickSortState = {
        array: arr.map((value, idx) => ({ id: idx, value, status: statusFor(idx) })),
        pointers: opts.pointers ?? {},
        low: range.low,
        high: range.high,
        pivotIndex,
        pivotValue,
        pIndex,
        j,
        phase,
        actionType,
        settledCount,
        stats: { ...stats },
        settledLog: settledLog.map((entry) => ({ ...entry })),
        action: opts.action,
      };

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state,
        callStack: callStack.map((frame, idx) => ({
          ...frame,
          isCurrent: idx === callStack.length - 1,
        })),
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: {
          comparisons: stats.comparisons,
          swaps: stats.swaps,
          accesses: stats.comparisons * 2 + stats.swaps * 4,
          lookups: 0,
        },
        invariantStatus: {
          label:
            phase === 'partition' && pivotValue !== null
              ? `arr[${range.low}..${pIndex !== null ? pIndex - 1 : range.low - 1}] <= pivot(${pivotValue}) < arr[${pIndex !== null ? pIndex : range.low}..${j !== null ? j - 1 : range.high - 1}]`
              : phase === 'done'
                ? 'the whole array is sorted'
                : `range [${range.low}..${range.high}] pending partition`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && settledCount >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Settled';
      }
      return undefined;
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 1,
      action: 'INIT',
      explanation:
        `quicksort(arr, 0, ${n - 1}) is invoked on ${n} element(s) [${arr.join(', ')}].` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'n > 1', condition: `${n} > 1`, result: n > 1 },
      variables: { n, low: 0, high: n - 1 },
      soundCue: 'start',
      pedagogy: {
        what:
          n > 1
            ? `The initial subproblem is the whole array [0..${n - 1}].`
            : n === 1
              ? 'The array holds a single element, which is trivially sorted.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Quicksort recursively partitions a range until every pivot is in its final position; a range of zero or one elements needs no partition.',
        whatNext:
          n > 1
            ? `Enter the range guard low < high with low = 0 and high = ${n - 1}.`
            : 'The recursion is skipped entirely.',
      },
    });

    if (n <= 1) {
      phase = 'done';
      actionType = 'DONE';
      pushFrame({
        codeLine: 1,
        action: 'DONE',
        explanation:
          n === 1
            ? `One element: the guard low < high is false (0 < 0), so arr = [${arr[0]}] is returned unchanged with zero comparisons and zero swaps.`
            : 'Empty array: the guard low < high is false (0 < -1), so nothing is compared and nothing is swapped.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: {
          result: n,
          comparisons: 0,
          swaps: 0,
          partitions: 0,
          calls: 0,
        },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'finish',
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted range by definition.' : 'An empty array is sorted by definition.',
          why: 'Quicksort only partitions ranges with at least two elements; smaller ranges are the recursion base case.',
          whatNext: 'Load a preset such as Random Array to watch the partition loop run.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    function partition(low: number, high: number): number {
      const pivot = arr[high];
      phase = 'partition';
      pivotIndex = high;
      pivotValue = pivot;
      pIndex = low;
      j = low;
      stats.partitions += 1;
      callStack.push({ name: 'partition', params: { low, high, pivot }, line: 7 });

      pushFrame({
        codeLine: 7,
        action: 'PIVOT_SELECTED',
        explanation: `pivot = arr[${high}] = ${pivot}: Lomuto partition always takes the last element of the range as the pivot.`,
        highlight: { [high]: 'pivot' },
        pointers: { low, high, pivot: high },
        variables: { pivot, low, high },
        conditionEval: { expr: 'low < high', condition: `${low} < ${high}`, result: true },
        soundCue: 'pivot',
        pedagogy: {
          what: `The pivot is arr[${high}] = ${pivot}, the last element of the range [${low}..${high}].`,
          why: 'Choosing the last element keeps the code simple; the cost is the O(N²) worst case when the range is already ordered.',
          whatNext: `Start the <= region at pIndex = ${low} and scan j from ${low}.`,
        },
      });

      pushFrame({
        codeLine: 8,
        action: 'PINDEX_INIT',
        explanation: `pIndex = ${low}: the <= pivot region starts empty, right at the left edge of the range.`,
        highlight: { [high]: 'pivot', [low]: 'active' },
        pointers: { low, high, pivot: high, pIndex },
        variables: { pivot, pIndex, low, high },
        soundCue: 'step',
        pedagogy: {
          what: `pIndex = ${low} marks the first slot after the <= pivot region.`,
          why: 'Everything in arr[low..pIndex-1] must end up <= pivot; initially that region is empty, so pIndex starts at low.',
          whatNext: `Scan j = ${low}: compare arr[${low}] = ${arr[low]} with pivot ${pivot}.`,
        },
      });

      pushFrame({
        codeLine: 9,
        action: 'SCAN_START',
        explanation: `Scan j from ${low} to ${high - 1}: every element except the pivot itself gets exactly one comparison.`,
        highlight: { [high]: 'pivot' },
        pointers: { low, high, pivot: high, pIndex: low },
        variables: { pivot, pIndex, scanFrom: low, scanTo: high - 1 },
        soundCue: 'step',
        pedagogy: {
          what: `The partition loop covers j = ${low}..${high - 1}.`,
          why: 'The pivot at arr[' + high + '] is excluded from the scan — it only moves once, in the final swap.',
          whatNext: `Compare arr[${low}] = ${arr[low]} with pivot ${pivot}.`,
        },
      });

      for (let scan = low; scan < high; scan++) {
        j = scan;
        const isLessOrEqual = arr[scan] <= pivot;
        stats.comparisons += 1;

        const compareCheckpoint: PredictionCheckpoint | undefined = !compareCheckpointAdded
          ? {
              id: 'quicksort-first-compare',
              question: `pivot = ${pivot}, arr[j] = ${arr[scan]}. What should happen next?`,
              options: [
                isLessOrEqual
                  ? 'Swap arr[pIndex] with arr[j], then advance pIndex'
                  : 'Advance j without swapping',
                isLessOrEqual
                  ? 'Advance j without swapping'
                  : 'Swap arr[pIndex] with arr[j], then advance pIndex',
                'Swap the pivot into arr[pIndex] now',
              ],
              correctIndex: 0,
              explanation: isLessOrEqual
                ? `arr[${scan}] = ${arr[scan]} <= pivot ${pivot}, so it belongs in the left region: swap it into pIndex and grow the region.`
                : `arr[${scan}] = ${arr[scan]} > pivot ${pivot}, so it is already in the correct region; only j advances.`,
              hint: 'Only values <= pivot may cross into the left region.',
            }
          : undefined;

        pushFrame({
          codeLine: 10,
          action: 'COMPARE',
          explanation: `j = ${scan}: compare arr[${scan}] = ${arr[scan]} with pivot ${pivot} → ${isLessOrEqual ? '<= pivot, it joins the left region' : '> pivot, it stays in the right region'}.`,
          highlight: { [high]: 'pivot', [pIndex as number]: 'active', [scan]: 'comparing' },
          pointers: { low, high, pivot: high, pIndex: pIndex as number, j: scan },
          variables: { pivot, pIndex, j: scan, 'arr[j]': arr[scan] },
          conditionEval: {
            expr: `arr[${scan}] <= pivot`,
            condition: `${arr[scan]} <= ${pivot}`,
            result: isLessOrEqual,
          },
          soundCue: 'compare',
          checkpoint: compareCheckpoint,
          pedagogy: {
            what: `Comparing arr[${scan}] = ${arr[scan]} against the pivot ${pivot}.`,
            why: 'This one comparison decides the region: <= pivot grows the left region, > pivot leaves the value where it is.',
            whatNext: isLessOrEqual
              ? pIndex !== scan
                ? `Swap arr[${pIndex}] with arr[${scan}], then advance pIndex.`
                : `pIndex === j, so no swap is needed — just advance pIndex.`
              : `Leave arr[${scan}] in place and advance j to ${scan + 1}.`,
          },
        });
        if (compareCheckpoint) compareCheckpointAdded = true;

        if (isLessOrEqual) {
          if (pIndex !== scan) {
            pushFrame({
              codeLine: 11,
              action: 'SWAP',
              explanation: `arr[${pIndex}] = ${arr[pIndex]} ⇄ arr[${scan}] = ${arr[scan]}: the smaller value moves into the <= region and the larger value takes its place on the right.`,
              highlight: {
                [high]: 'pivot',
                [pIndex as number]: 'swapping',
                [scan]: 'swapping',
              },
              pointers: { low, high, pivot: high, pIndex: pIndex as number, j: scan },
              variables: { pivot, pIndex, j: scan, valPIndex: arr[pIndex as number], valJ: arr[scan] },
              conditionEval: {
                expr: `pIndex !== j`,
                condition: `${pIndex} !== ${scan}`,
                result: true,
              },
              soundCue: 'swap',
              pedagogy: {
                what: `Values at ${pIndex} and ${scan} exchange places.`,
                why: 'arr[scan] <= pivot must sit left of pIndex; the displaced value is still > pivot or unscanned, so the right region absorbs it.',
                whatNext: `Advance pIndex to ${(pIndex as number) + 1}; the <= region grows by one.`,
              },
            });
            const a = pIndex as number;
            const b = scan;
            const tmp = arr[a];
            arr[a] = arr[b];
            arr[b] = tmp;
            stats.swaps += 1;
          } else {
            pushFrame({
              codeLine: 11,
              action: 'NO_SWAP',
              explanation: `arr[${scan}] = ${arr[scan]} <= pivot ${pivot}, but pIndex === j (${scan}), so swapping with itself is skipped.`,
              highlight: { [high]: 'pivot', [scan]: 'comparing' },
              pointers: { low, high, pivot: high, pIndex: scan, j: scan },
              variables: { pivot, pIndex, j: scan, noSwap: true },
              conditionEval: {
                expr: `pIndex !== j`,
                condition: `${pIndex} !== ${scan}`,
                result: false,
              },
              soundCue: 'step',
              pedagogy: {
                what: 'The value is already at the boundary of the two regions.',
                why: 'Swapping an element with itself changes nothing, so the implementation only advances pIndex.',
                whatNext: `Advance pIndex to ${(pIndex as number) + 1}.`,
              },
            });
          }

          pIndex = (pIndex as number) + 1;
          pushFrame({
            codeLine: 12,
            action: 'ADVANCE_PINDEX',
            explanation: `pIndex = ${pIndex}: every value in arr[${low}..${(pIndex as number) - 1}] is now known to be <= pivot.`,
            highlight: {
              [high]: 'pivot',
              ...(pIndex !== null && (pIndex as number) < high ? { [pIndex as number]: 'active' as ElementStatus } : {}),
            },
            pointers: { low, high, pivot: high, pIndex: pIndex as number, j: scan },
            variables: { pivot, pIndex, j: scan },
            soundCue: 'step',
            pedagogy: {
              what: `pIndex grew to ${pIndex}, so the <= pivot region is arr[${low}..${(pIndex as number) - 1}].`,
              why: 'Growing pIndex by exactly one per accepted value keeps the region contiguous — the invariant that makes the final pivot swap correct.',
              whatNext:
                scan + 1 < high
                  ? `Advance j to ${scan + 1} and compare arr[${scan + 1}] = ${arr[scan + 1]}.`
                  : 'The scan is finished; place the pivot.',
            },
          });
        }
      }

      pushFrame({
        codeLine: 13,
        action: 'PIVOT_SWAP',
        explanation: `Scan complete: swap the pivot ${pivot} at arr[${high}] into arr[${pIndex}] — its final sorted position.`,
        highlight: {
          [high]: 'swapping',
          [pIndex as number]: 'swapping',
        },
        pointers: { low, high, pivot: high, pIndex: pIndex as number },
        variables: { pivot, finalPIndex: pIndex },
        conditionEval: { expr: 'j === high', condition: `${high} === ${high}`, result: true },
        soundCue: 'swap',
        checkpoint: !pivotCheckpointAdded
          ? {
              id: 'quicksort-pivot-position',
              question: `The scan finished with pIndex = ${pIndex}. What does the final swap do?`,
              options: [
                'Swaps the pivot back to its old slot at arr[' + high + ']',
                'Swaps the pivot into index ' + pIndex + ' — its final sorted position',
                'Sorts the left half before placing the pivot',
              ],
              correctIndex: 1,
              explanation:
                'Everything left of pIndex is <= pivot and everything from pIndex to high-1 is > pivot, ' +
                'so the pivot belongs exactly at index ' + pIndex + ' and never moves again.',
              hint: 'Which side of pIndex holds values greater than the pivot?',
            }
          : undefined,
        pedagogy: {
          what: `The pivot moves from index ${high} to index ${pIndex}.`,
          why: 'Everything left of pIndex is <= pivot and everything from pIndex to high-1 is > pivot, so index pIndex separates the two regions exactly.',
          whatNext: `After the swap, arr[${pIndex}] is final and the recursion splits around it.`,
        },
      });
      if (!pivotCheckpointAdded) pivotCheckpointAdded = true;
      const finalPivotIndex = pIndex as number;
      const tmpPivot = arr[finalPivotIndex];
      arr[finalPivotIndex] = arr[high];
      arr[high] = tmpPivot;
      stats.swaps += 1;
      settled.add(finalPivotIndex);
      settledCount += 1;
      partitionCounter += 1;
      settledLog.push({ value: arr[finalPivotIndex], index: finalPivotIndex });

      let pivotMilestone: string | undefined;
      if (partitionCounter === totalPartitions) {
        pivotMilestone = 'Final Pivot Settled';
      } else if (!firstPivotMilestoneUsed) {
        pivotMilestone = 'First Pivot Settled';
        firstPivotMilestoneUsed = true;
      } else {
        pivotMilestone = maybeHalfMilestone();
      }

      pushFrame({
        codeLine: 14,
        action: 'PIVOT_SETTLED',
        explanation: `Pivot ${arr[finalPivotIndex]} is settled at index [${finalPivotIndex}] — its position can never change again (${settledCount}/${n} elements placed).`,
        highlight: { [finalPivotIndex]: 'sorted' },
        pointers: { sorted: finalPivotIndex },
        variables: { pivot: arr[finalPivotIndex], sortedIndex: finalPivotIndex, settled: settledCount },
        conditionEval: { expr: 'pivot is in final position', condition: `settled contains ${finalPivotIndex}`, result: true },
        soundCue: 'sorted',
        milestone: pivotMilestone,
        pedagogy: {
          what: `arr[${finalPivotIndex}] = ${arr[finalPivotIndex]} is fixed forever.`,
          why: 'The left subarray only holds <= values and the right only > values, so no later partition can move this element.',
          whatNext: `Recurse on the left range [${low}..${finalPivotIndex - 1}], then the right range [${finalPivotIndex + 1}..${high}].`,
        },
      });

      callStack.pop();
      const result = finalPivotIndex;
      pivotIndex = null;
      pivotValue = null;
      pIndex = null;
      j = null;
      return result;
    }

    function quicksort(low: number, high: number): void {
      stats.calls += 1;
      phase = 'call';
      range = { low, high };
      callStack.push({ name: 'quicksort', params: { low, high }, line: 2 });

      if (low < high) {
        pushFrame({
          codeLine: 2,
          action: 'ENTER_RANGE',
          explanation: `Enter quicksort(arr, ${low}, ${high}). The range has ${high - low + 1} elements, so it still needs work.`,
          pointers: { low, high },
          variables: { low, high, rangeSize: high - low + 1 },
          conditionEval: { expr: 'low < high', condition: `${low} < ${high}`, result: true },
          soundCue: 'step',
          pedagogy: {
            what: `A recursive call owns the range [${low}..${high}].`,
            why: 'A range with at least two elements cannot be assumed sorted; it must be partitioned around a pivot first.',
            whatNext: `Call partition(arr, ${low}, ${high}) to place one pivot.`,
          },
        });

        pushFrame({
          codeLine: 3,
          action: 'CALL_PARTITION',
          explanation: `Call partition(arr, ${low}, ${high}) — the pivot will be arr[${high}].`,
          pointers: { low, high },
          variables: { low, high },
          soundCue: 'step',
          pedagogy: {
            what: 'The partition subroutine is invoked on the current range.',
            why: 'Partitioning is the only real work in quicksort: everything else is recursion bookkeeping.',
            whatNext: 'Watch the scan place every value relative to the pivot.',
          },
        });

        const p = partition(low, high);

        pushFrame({
          codeLine: 3,
          action: 'PARTITION_RETURNED',
          explanation: `partition returned pIndex = ${p}. arr[${p}] is final; the two remaining subproblems are [${low}..${p - 1}] and [${p + 1}..${high}].`,
          highlight: { [p]: 'sorted' },
          pointers: { low, high, sorted: p },
          variables: { pIndex: p, left: `[${low}..${p - 1}]`, right: `[${p + 1}..${high}]` },
          conditionEval: { expr: 'partition returned', condition: `pIndex = ${p}`, result: true },
          soundCue: 'step',
          pedagogy: {
            what: `The pivot index ${p} is fixed and excluded from both subproblems.`,
            why: 'The pivot is already globally placed, so neither recursive call needs to touch it — this exclusion is what guarantees termination.',
            whatNext:
              p - 1 >= low
                ? `Recurse on the left range [${low}..${p - 1}].`
                : 'The left range is empty; move straight to the right range.',
          },
        });

        pushFrame({
          codeLine: 4,
          action: 'CALL_LEFT',
          explanation:
            p - 1 >= low
              ? `Recurse on the left range [${low}..${p - 1}] (${p - low} element(s) <= pivot ${arr[p]}).`
              : `The left range [${low}..${p - 1}] is empty — the call returns immediately.`,
          pointers: { low, high: p - 1 },
          variables: { left: `[${low}..${p - 1}]`, leftSize: p - low },
          soundCue: 'step',
          pedagogy: {
            what: 'The left recursive call is issued first.',
            why: 'Quicksort finishes one side completely before touching the other; the call stack records this depth-first order.',
            whatNext: 'Watch the left range being partitioned the same way.',
          },
        });
        quicksort(low, p - 1);

        pushFrame({
          codeLine: 5,
          action: 'CALL_RIGHT',
          explanation:
            p + 1 <= high
              ? `Left range done. Recurse on the right range [${p + 1}..${high}] (${high - p} element(s) > pivot ${arr[p]}).`
              : `The right range [${p + 1}..${high}] is empty — the call returns immediately.`,
          pointers: { low: p + 1, high },
          variables: { right: `[${p + 1}..${high}]`, rightSize: high - p },
          soundCue: 'step',
          pedagogy: {
            what: 'The right recursive call starts after the left one fully returns.',
            why: 'The two subproblems are independent — values left of the pivot never interact with values right of it.',
            whatNext: 'Watch the right range being partitioned, then this call returns.',
          },
        });
        quicksort(p + 1, high);
      } else if (low === high) {
        settled.add(low);
        settledCount += 1;
        pushFrame({
          codeLine: 2,
          action: 'BASE_CASE',
          explanation: `Base case: range [${low}..${high}] contains one element (${arr[low]}), already sorted.`,
          highlight: { [low]: 'sorted' },
          pointers: { low, high },
          variables: { low, high, baseValue: arr[low], settled: settledCount },
          conditionEval: { expr: 'low < high', condition: `${low} < ${high}`, result: false },
          soundCue: 'sorted',
          milestone: maybeHalfMilestone(),
          pedagogy: {
            what: `Single element arr[${low}] = ${arr[low]} is a sorted range.`,
            why: 'No partition is needed when low === high — the guard rejects the range and the element is marked settled.',
            whatNext: 'Return to the caller; this element will not move again.',
          },
        });
      } else {
        pushFrame({
          codeLine: 2,
          action: 'EMPTY_RANGE',
          explanation: `Empty range: low = ${low} > high = ${high}. Nothing to sort.`,
          pointers: { low, high },
          variables: { low, high },
          conditionEval: { expr: 'low < high', condition: `${low} < ${high}`, result: false },
          soundCue: 'step',
          pedagogy: {
            what: 'The recursive range is empty.',
            why: 'An empty range trivially satisfies the sorted invariant, so the call returns without work.',
            whatNext: 'Return immediately to the parent call.',
          },
        });
      }

      callStack.pop();
    }

    quicksort(0, n - 1);

    // ── Final frame ─────────────────────────────────────────────────────────
    phase = 'done';
    actionType = 'DONE';
    pushFrame({
      codeLine: 1,
      action: 'DONE',
      explanation: `Quicksort complete: [${arr.join(', ')}] is sorted after ${stats.partitions} partition(s), ${stats.comparisons} comparison(s) and ${stats.swaps} swap(s) across ${stats.calls} call(s).`,
      highlight: Object.fromEntries(arr.map((_, idx) => [idx, 'sorted' as ElementStatus])),
      pointers: {},
      variables: {
        result: n,
        comparisons: stats.comparisons,
        swaps: stats.swaps,
        partitions: stats.partitions,
        calls: stats.calls,
      },
      conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: isSorted(arr) },
      soundCue: 'finish',
      milestone: 'Quicksort Complete',
      pedagogy: {
        what: `Every element has been settled by a partition or a base case (${settledCount}/${n}).`,
        why: 'The union of all settled pivots and base-case singletons covers the whole array, so no element is left unsorted.',
        whatNext: 'Try the Already Sorted preset to see the O(N²) worst case when the last element is always the largest.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<QuickSortState>, projection) => {
    const { low, high, pivotIndex, pivotValue, pIndex, j, phase, stats, settledCount, settledLog, array } =
      frame.state;

    const phaseLabel =
      phase === 'init'
        ? 'starting'
        : phase === 'call'
          ? 'recursing'
          : phase === 'partition'
            ? 'partitioning'
            : phase === 'base'
              ? 'base case'
              : 'done';

    const formula =
      phase === 'init'
        ? `quicksort(arr, 0, ${Math.max(0, array.length - 1)})`
        : phase === 'partition' && pivotValue !== null
          ? `pivot = ${pivotValue} · pIndex = ${pIndex} · j = ${j} · arr[low..pIndex-1] <= pivot`
          : phase === 'done'
            ? `sorted · ${stats.partitions} partition(s) · ${stats.comparisons} compare(s) · ${stats.swaps} swap(s)`
            : `range [${low}..${high}] · ${high - low + 1} element(s)`;

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
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
              range <span className="font-bold text-amber-300">[{low}..{high}]</span>
            </span>
            {pivotValue !== null && (
              <span className="rounded-md border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 font-bold text-purple-200">
                pivot = {pivotValue} @{pivotIndex}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              compares <span className="font-bold text-amber-300">{stats.comparisons}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              swaps <span className="font-bold text-rose-300">{stats.swaps}</span>
            </span>
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              settled <span className="font-bold">{settledCount}</span>/{array.length}
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
            <ArrayStage state={frame.state} projection={projection} />
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-purple-400" />
                  <span>pivot of the current partition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>arr[j] being compared</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>pIndex — start of the &gt; region</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-rose-400" />
                  <span>pair being swapped</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  <span>settled in final position</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Settled pivots</div>
              {settledLog.length === 0 ? (
                <span className="text-slate-500">no pivot settled yet</span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {settledLog.map((entry, pos) => (
                    <span key={pos}>
                      <span className="font-bold text-emerald-300">{entry.value}</span> → index{' '}
                      <span className="font-bold text-cyan-300">{entry.index}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
