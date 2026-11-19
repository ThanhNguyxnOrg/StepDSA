import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

/**
 * Selection Sort, rebuilt to the StepDSA teaching standard:
 * - one meaningful operation per frame (pass start → scan start → compare →
 *   min-index update → swap / skipped swap → index locked → done),
 * - WHAT/WHY/NEXT pedagogy on every frame,
 * - two prediction checkpoints and real milestones (no per-pass noise),
 * - five language snippets that share the exact same statement per line, and
 * - honest input normalisation reported in the INIT frame.
 */

export interface SelectionSortState extends ArrayStageState {
  /** Current outer pass (0-based pass index = i). */
  i: number;
  /** Current scan index j. */
  j: number | null;
  /** Index of the running minimum candidate. */
  minIdx: number | null;
  /** Inclusive end of the sorted prefix. */
  sortedEnd: number;
  phase: 'init' | 'scan' | 'swap' | 'done';
  actionType:
    | 'INIT'
    | 'PASS_START'
    | 'SCAN_START'
    | 'COMPARE'
    | 'MIN_UPDATE'
    | 'SWAP'
    | 'NO_SWAP'
    | 'INDEX_LOCKED'
    | 'DONE';
  stats: {
    comparisons: number;
    swaps: number;
    passes: number;
  };
}

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [64, 25, 12, 22, 11, 48, 9];

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

function isSorted(input: number[]): boolean {
  for (let i = 1; i < input.length; i++) {
    if (input[i] < input[i - 1]) return false;
  }
  return true;
}

export const selectionSortModule: AlgorithmModule<number[], SelectionSortState> = {
  id: 'selection-sort',
  title: 'Selection Sort (Minimum Scan)',
  category: 'sorting',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'bubble-sort', label: 'Bubble Sort' },
    { id: 'insertion-sort', label: 'Insertion Sort' },
    { id: 'heapsort', label: 'Heap Sort' },
  ],
  complexity: {
    timeBest: 'O(N²)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Always O(N²) comparisons regardless of initial array ordering',
  },
  theory: {
    overview:
      'Selection Sort divides the input list into two parts: a sorted sublist of items built up from left to right, and an unsorted sublist. It repeatedly selects the minimum element from the unsorted sublist and moves it to the sorted sublist.',
    whyItWorks:
      'By repeatedly identifying the smallest remaining item and swapping it into the next available slot, each element is guaranteed to be in its permanent sorted index.',
    invariant:
      'Subarray arr[0 ... i-1] is sorted and contains the i smallest elements in the entire array.',
    pitfalls: [
      'Always performs O(N²) comparisons even on already sorted arrays.',
      'Minimizes number of memory writes/swaps to at most O(N), making it useful when write cost is expensive.',
      'The scan never swaps; it only tracks the minimum index. The single swap happens once per pass.',
    ],
    steps: [
      'Guard: an empty or one-element array is already sorted.',
      'Start a pass at index i: assume arr[i] is the minimum of [i..n-1].',
      'Scan j from i + 1: whenever arr[j] < arr[minIdx], move the minimum index to j.',
      'When the scan ends, swap arr[i] with arr[minIdx] — unless the minimum is already there.',
      'Index i is final; the sorted prefix grows by one. Repeat for the rest.',
    ],
    watchOut: [
      'Selection sort always costs O(N²) comparisons, even on sorted input — the scan cannot stop early.',
      'The swap guard (minIdx !== i) skips useless self-swaps, keeping writes at most O(N).',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Standard minimum search demonstration', data: [64, 25, 12, 22, 11] },
    { id: 'reversed', label: 'Reversed Array', description: 'Requires swaps on every pass', data: [50, 40, 30, 20, 10] },
    { id: 'sorted', label: 'Already Sorted', description: 'Scans all pairs with 0 swaps', data: [10, 20, 30, 40, 50] },
    { id: 'single-element', label: 'One Element', description: 'The guard skips the passes entirely', data: [42] },
  ],
  defaultInput: [64, 25, 12, 22, 11, 48, 9],
  codeSnippets: {
    pseudocode: `function selectionSort(arr):
    n = length(arr)
    for i from 0 to n - 2:
        minIdx = i
        for j from i + 1 to n - 1:
            if arr[j] < arr[minIdx]:
                minIdx = j
        if minIdx !== i:
            swap arr[i] with arr[minIdx]
    return arr`,
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    typescript: `function selectionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j; } }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; } }
  return arr; }`,
    cpp: `vector<int> selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j; } }
        if (minIdx != i) {
            swap(arr[i], arr[minIdx]); } }
    return arr; }`,
    java: `int[] selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j; } }
        if (minIdx != i) {
            int t = arr[minIdx]; arr[minIdx] = arr[i]; arr[i] = t; } }
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<SelectionSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const frames: ExecutionFrame<SelectionSortState>[] = [];
    const arr = [...array];
    const stats = { comparisons: 0, swaps: 0, passes: 0 };

    let phase: SelectionSortState['phase'] = 'init';
    let actionType: SelectionSortState['actionType'] = 'INIT';
    let i = 0;
    let j: number | null = null;
    let minIdx: number | null = null;
    let sortedEnd = -1;
    let scanCheckpointAdded = false;
    let swapCheckpointAdded = false;
    let firstLockMilestoneUsed = false;
    let halfMilestoneUsed = false;

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && sortedEnd + 1 >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Locked';
      }
      return undefined;
    };

    const pushFrame = (opts: {
      codeLine: number;
      action: SelectionSortState['actionType'];
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<SelectionSortState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<SelectionSortState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      compareIndex?: number | null;
      swapping?: boolean;
      pointers?: Record<string, number>;
    }) => {
      const statusFor = (idx: number): ElementStatus => {
        if (opts.swapping && (idx === i || idx === opts.compareIndex)) return 'swapping';
        if (idx === opts.compareIndex) return 'comparing';
        if (idx <= sortedEnd) return 'sorted';
        if (idx === i) return 'pivot';
        if (idx === minIdx && minIdx !== null) return 'active';
        return 'default';
      };

      const state: SelectionSortState = {
        array: arr.map((value, idx) => ({ id: idx, value, status: statusFor(idx) })),
        pointers: opts.pointers ?? {},
        i,
        j,
        minIdx,
        sortedEnd,
        phase,
        actionType,
        stats: { ...stats },
        action: opts.action,
      };

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state,
        callStack: [
          {
            name: 'selectionSort(arr)',
            params: { n, i, j: j ?? '∅', minIdx: minIdx ?? '∅' },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
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
            sortedEnd >= 0
              ? `arr[0..${sortedEnd}] is sorted and holds the ${sortedEnd + 1} smallest value(s)`
              : 'no element is locked yet',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 1,
      action: 'INIT',
      explanation:
        `n = length(arr) = ${n}. The sorted prefix is empty; every pass will lock exactly one index.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'n > 1', condition: `${n} > 1`, result: n > 1 },
      variables: { n },
      soundCue: 'start',
      pedagogy: {
        what:
          n > 1
            ? `The whole array [0..${n - 1}] is unsorted; the scan will cover it in ${n - 1} passes.`
            : n === 1
              ? 'The array holds a single element, which is trivially sorted.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Selection sort never moves an element more than once: each pass places the true minimum of the remaining range.',
        whatNext:
          n > 1
            ? `Pass 1: scan [0..${n - 1}] for the minimum, starting with the candidate arr[0] = ${arr[0]}.`
            : 'No pass is needed at all.',
      },
    });

    if (n <= 1) {
      phase = 'done';
      actionType = 'DONE';
      pushFrame({
        codeLine: 10,
        action: 'DONE',
        explanation:
          n === 1
            ? `One element: no scan is needed, so arr = [${arr[0]}] is returned unchanged with zero comparisons.`
            : 'Empty array: there is nothing to scan, so nothing happens.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: { result: n, comparisons: 0, swaps: 0, passes: 0 },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'finish',
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted array by definition.' : 'An empty array is sorted by definition.',
          why: 'Selection sort scans for a minimum among at least two candidates; smaller inputs are the base case.',
          whatNext: 'Load a preset such as Random Array to watch the minimum scans run.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    phase = 'scan';

    for (let pass = 0; pass < n - 1; pass++) {
      i = pass;
      minIdx = i;
      j = null;
      stats.passes = pass + 1;
      actionType = 'PASS_START';

      pushFrame({
        codeLine: 4,
        action: 'PASS_START',
        explanation: `Pass ${pass + 1} begins: everything left of index ${i} is already final. Assume the minimum is arr[${i}] = ${arr[i]}.`,
        variables: { i, minIdx, minVal: arr[i] },
        pointers: { i },
        soundCue: 'step',
        pedagogy: {
          what: `The minimum search covers [${i}..${n - 1}], seeded with the first candidate.`,
          why: 'Assuming the first candidate as the minimum gives the scan a concrete reference value to beat.',
          whatNext: `Scan j = ${i + 1}..${n - 1}; every time arr[j] < arr[minIdx], minIdx moves to j.`,
        },
      });

      actionType = 'SCAN_START';
      pushFrame({
        codeLine: 5,
        action: 'SCAN_START',
        explanation: `Scan j = ${i + 1}..${n - 1}: each candidate is compared against the running minimum — nothing is swapped during the scan.`,
        variables: { i, scanFrom: i + 1, scanTo: n - 1 },
        pointers: { i },
        soundCue: 'step',
        pedagogy: {
          what: 'The inner scan compares candidates left to right.',
          why: 'Tracking only the minimum index means the scan performs zero writes — selection sort is write-minimal.',
          whatNext: `Compare arr[${i + 1}] = ${arr[i + 1]} against the current minimum ${arr[minIdx]}.`,
        },
      });

      for (let scan = i + 1; scan < n; scan++) {
        j = scan;
        const isSmaller = arr[scan] < arr[minIdx];
        stats.comparisons += 1;
        actionType = 'COMPARE';

        const scanCheckpoint: PredictionCheckpoint | undefined = !scanCheckpointAdded
          ? {
              id: 'selection-sort-first-scan',
              question: `Current minimum is ${arr[minIdx]} (index ${minIdx}); the next candidate is ${arr[scan]} (index ${scan}). Does the minimum move?`,
              options: ['Yes — the new candidate is smaller', 'No — the current minimum stays'],
              correctIndex: isSmaller ? 0 : 1,
              explanation: isSmaller
                ? `${arr[scan]} < ${arr[minIdx]}, so minIdx becomes ${scan}.`
                : `${arr[scan]} ≥ ${arr[minIdx]}, so the minimum stays at index ${minIdx}.`,
              hint: 'Only a strictly smaller value can replace the running minimum.',
            }
          : undefined;

        pushFrame({
          codeLine: 6,
          action: 'COMPARE',
          explanation: `Compare arr[${scan}] = ${arr[scan]} with the running minimum arr[${minIdx}] = ${arr[minIdx]} → ${isSmaller ? 'smaller, minIdx moves' : 'not smaller, minIdx stays'}.`,
          compareIndex: scan,
          pointers: { i, min: minIdx, j: scan },
          variables: { i, j: scan, minIdx, 'arr[j]': arr[scan], 'arr[min]': arr[minIdx] },
          conditionEval: {
            expr: `arr[${scan}] < arr[${minIdx}]`,
            condition: `${arr[scan]} < ${arr[minIdx]}`,
            result: isSmaller,
          },
          soundCue: 'compare',
          checkpoint: scanCheckpoint,
          pedagogy: {
            what: `Candidate arr[${scan}] = ${arr[scan]} faces the current minimum arr[${minIdx}] = ${arr[minIdx]}.`,
            why: 'Only one running candidate is tracked; nothing is swapped during the scan.',
            whatNext: isSmaller
              ? `${arr[scan]} is smaller, so minIdx will move to ${scan}.`
              : `${arr[minIdx]} stays the minimum; continue scanning.`,
          },
        });
        if (scanCheckpoint) scanCheckpointAdded = true;

        if (isSmaller) {
          minIdx = scan;
          actionType = 'MIN_UPDATE';
          pushFrame({
            codeLine: 7,
            action: 'MIN_UPDATE',
            explanation: `Found a new minimum: ${arr[minIdx]} at index [${minIdx}]. minIdx updated.`,
            pointers: { i, min: minIdx, j: scan },
            variables: { i, minIdx, newMin: arr[minIdx] },
            soundCue: 'select',
            pedagogy: {
              what: `A new minimum was found: ${arr[minIdx]} at index ${minIdx}.`,
              why: 'Tracking the best candidate avoids re-scanning: the minimum only ever moves forward.',
              whatNext: `Compare the remaining candidates against ${arr[minIdx]}.`,
            },
          });
        }
      }
      j = null;

      phase = 'swap';
      if (minIdx !== i) {
        actionType = 'SWAP';

        const swapCheckpoint: PredictionCheckpoint | undefined = !swapCheckpointAdded
          ? {
              id: 'selection-sort-swap-guard',
              question: `The scan finished with minIdx = ${minIdx} (value ${arr[minIdx]}). What happens at index ${i}?`,
              options: [
                'Shift arr[minIdx] left through the sorted prefix',
                `Swap arr[${i}] ⇄ arr[${minIdx}] — the only write this pass`,
                'Restart the scan from index 0',
              ],
              correctIndex: 1,
              explanation: `Selection sort writes each value exactly once: a single swap puts ${arr[minIdx]} at index ${i} and never touches it again.`,
              hint: 'The scan already did the searching — only the placement remains.',
            }
          : undefined;

        pushFrame({
          codeLine: 9,
          action: 'SWAP',
          explanation: `Scan complete: swap arr[${i}] (${arr[i]}) ⇄ arr[${minIdx}] (${arr[minIdx]}) — the minimum lands at index ${i}.`,
          swapping: true,
          pointers: { i, min: minIdx },
          variables: { swapI: i, swapMin: minIdx, swapA: arr[i], swapB: arr[minIdx] },
          conditionEval: { expr: 'minIdx !== i', condition: `${minIdx} !== ${i}`, result: true },
          soundCue: 'swap',
          checkpoint: swapCheckpoint,
          pedagogy: {
            what: `The scan is over: ${arr[minIdx]} is the smallest value in [${i}..${n - 1}].`,
            why: `Placing it at index ${i} extends the sorted prefix by one and is the only write this pass performs.`,
            whatNext: `Swap ${arr[i]} ↔ ${arr[minIdx]}, then index ${i} is locked forever.`,
          },
        });
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;
        stats.swaps += 1;
      } else {
        actionType = 'NO_SWAP';

        const swapCheckpoint: PredictionCheckpoint | undefined = !swapCheckpointAdded
          ? {
              id: 'selection-sort-swap-guard',
              question: `The scan finished with minIdx = ${minIdx} — the same index it started on. What happens at index ${i}?`,
              options: [
                'Skip the swap — arr[i] is already the minimum',
                'Swap arr[i] with itself for symmetry',
                'Re-scan the range to double-check',
              ],
              correctIndex: 0,
              explanation: `arr[${i}] = ${arr[i]} is already the smallest value in [${i}..${n - 1}], so the guard minIdx !== i skips a useless self-swap.`,
              hint: 'The swap guard exists to avoid writing when nothing changes.',
            }
          : undefined;

        pushFrame({
          codeLine: 8,
          action: 'NO_SWAP',
          explanation: `minIdx == i (${minIdx}): the minimum of [${i}..${n - 1}] is already at index ${i}, so the swap is skipped.`,
          pointers: { i, min: minIdx },
          variables: { i, minIdx, swapSkipped: true },
          conditionEval: { expr: 'minIdx !== i', condition: `${minIdx} !== ${i}`, result: false },
          soundCue: 'step',
          checkpoint: swapCheckpoint,
          pedagogy: {
            what: `arr[${i}] = ${arr[i]} is already the smallest value in the remaining range.`,
            why: 'The swap guard exists precisely to avoid useless self-swaps; taking the shorter path is part of the algorithm.',
            whatNext: `Lock index ${i} as final and move to the next pass.`,
          },
        });
      }
      if (swapCheckpointAdded === false) {
        // the checkpoint above was just emitted; arm the flag
        swapCheckpointAdded = true;
      }

      actionType = 'INDEX_LOCKED';
      sortedEnd = i;
      phase = 'scan';

      const lockMilestone = !firstLockMilestoneUsed
        ? 'First Index Locked'
        : maybeHalfMilestone();
      if (lockMilestone) firstLockMilestoneUsed = true;

      pushFrame({
        codeLine: 3,
        action: 'INDEX_LOCKED',
        explanation: `Element at index [${i}] (${arr[i]}) is now in its finalized sorted position (${sortedEnd + 1}/${n} locked).`,
        variables: { sortedPrefixLen: sortedEnd + 1, lockedValue: arr[i] },
        pointers: { sortedEnd: i },
        soundCue: 'sorted',
        milestone: lockMilestone,
        pedagogy: {
          what: `Index ${i} is final: arr[${i}] = ${arr[i]} is the ${i + 1}-th smallest element.`,
          why: 'Every earlier pass already placed all smaller values to the left, so this position can never change again.',
          whatNext:
            i + 1 < n - 1
              ? `Continue with the unsorted range [${i + 1}..${n - 1}].`
              : 'One element remains — it is automatically the maximum.',
        },
      });
    }

    // ── Final frame ─────────────────────────────────────────────────────────
    phase = 'done';
    actionType = 'DONE';
    sortedEnd = n - 1;
    pushFrame({
      codeLine: 10,
      action: 'DONE',
      explanation: `Selection Sort complete: [${arr.join(', ')}] is sorted after ${stats.passes} pass(es), ${stats.comparisons} comparison(s) and ${stats.swaps} swap(s).`,
      variables: {
        result: n,
        comparisons: stats.comparisons,
        swaps: stats.swaps,
        passes: stats.passes,
      },
      conditionEval: { expr: 'isSorted(arr)', condition: arr.join(', '), result: isSorted(arr) },
      soundCue: 'finish',
      milestone: 'Selection Sort Complete',
      pedagogy: {
        what: `All ${n - 1} passes are done and the last remaining element is trivially the maximum.`,
        why: 'Selection sort guaranteed the invariant after every pass with at most one swap each.',
        whatNext: 'Try the Already Sorted preset: it performs the same O(N²) comparisons but zero swaps.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<SelectionSortState>, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
