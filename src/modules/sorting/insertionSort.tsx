import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

/**
 * Insertion Sort, rebuilt to the StepDSA teaching standard:
 * - one meaningful operation per frame (pick key → set j → evaluate guard →
 *   shift → decrement j → insert key → advance the outer loop),
 * - WHAT/WHY/NEXT pedagogy on every frame,
 * - two prediction checkpoints, real milestones (no per-frame noise),
 * - five language snippets that share the same statement on every line, and
 * - honest input normalisation reported in the INIT frame.
 */

export interface InsertionSortState extends ArrayStageState {
  /** Inclusive index of the last element that is already in its final sorted slot. */
  sortedEnd: number;
  /** The element currently held aside in the `key` slot (null when no key is held). */
  heldKey: number | null;
  /** Index of the hole the held key will be written into (null while undecided). */
  holeIndex: number | null;
  /** Outer-loop index i. */
  i: number;
  /** Inner scan index j. */
  j: number;
  phase: 'init' | 'pick' | 'scan' | 'insert' | 'done';
  actionType:
    | 'INIT'
    | 'PICK_KEY'
    | 'SET_J'
    | 'CHECK_GUARD'
    | 'SHIFT'
    | 'DECREMENT_J'
    | 'INSERT_KEY'
    | 'NEXT_ITERATION'
    | 'DONE';
  stats: {
    comparisons: number;
    shifts: number;
    insertions: number;
  };
  /** History of completed insertions (key, origin index, final index, shifts). */
  insertionLog: { key: number; from: number; to: number; shifts: number }[];
}

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [35, 12, 48, 20, 9, 31, 15];

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

/** Per-iteration shift counts from a quiet simulation, used to mark the most expensive insertion. */
function simulateShiftCounts(input: number[]): number[] {
  const work = [...input];
  const counts: number[] = [];
  for (let i = 1; i < work.length; i++) {
    const key = work[i];
    let j = i - 1;
    let shifts = 0;
    while (j >= 0 && work[j] > key) {
      work[j + 1] = work[j];
      j -= 1;
      shifts += 1;
    }
    work[j + 1] = key;
    counts.push(shifts);
  }
  return counts;
}

function isSorted(input: number[]): boolean {
  for (let i = 1; i < input.length; i++) {
    if (input[i] < input[i - 1]) return false;
  }
  return true;
}

export const insertionSortModule: AlgorithmModule<number[], InsertionSortState> = {
  id: 'insertion-sort',
  title: 'Insertion Sort (Incremental Insertion)',
  category: 'sorting',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'bubble-sort', label: 'Bubble Sort' },
    { id: 'selection-sort', label: 'Selection Sort' },
    { id: 'shellsort', label: 'Shell Sort' },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Strictly reversed array (maximum shifts)',
  },
  theory: {
    overview:
      'Insertion Sort builds the final sorted array one item at a time by taking the next element and shifting larger elements to the right to make room for insertion.',
    whyItWorks:
      'At each iteration i, the prefix arr[0 ... i-1] is already sorted. By scanning backwards, we find the exact position where key belongs and place it there.',
    invariant:
      'At the start of outer loop iteration i, subarray arr[0 ... i-1] is strictly in sorted order.',
    pitfalls: [
      'Quadratic O(N²) shifting makes it slow for large datasets.',
      'Highly efficient for tiny arrays (N <= 16) or nearly sorted data (O(N) time).',
      'Insertion sort never swaps — it shifts copies right and writes the held key once at the end of the scan.',
    ],
    steps: [
      'Guard: an empty array is trivially sorted — zero comparisons, zero shifts.',
      'Start with the one-element sorted prefix arr[0..0].',
      'For each i from 1: copy arr[i] into the key slot so the scan can overwrite behind it.',
      'Scan left while j >= 0 and arr[j] > key, shifting each larger value one slot right.',
      'When the guard fails, write the key into the hole at index j + 1.',
      'The sorted prefix has grown by one; repeat until the whole array is sorted.',
    ],
    watchOut: [
      'While the key is held aside, the array holds a deliberate duplicate — the shifted copy that will be overwritten or filled by the key.',
      'The guard is evaluated on every scan step, including the exit step — that final FALSE evaluation is where the insertion position comes from.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Average case shifts', data: [35, 12, 48, 20, 9, 31, 15] },
    { id: 'nearly-sorted', label: 'Nearly Sorted', description: 'O(N) best-case demonstration', data: [5, 10, 15, 25, 20, 30, 35] },
    { id: 'reversed', label: 'Reversed Array', description: 'Worst case: every element shifts fully to the left', data: [50, 40, 30, 20, 10] },
    { id: 'already-sorted', label: 'Already Sorted', description: 'Zero shifts — every guard fails on the first compare', data: [10, 20, 30, 40, 50] },
    { id: 'single-element', label: 'One Element', description: 'The outer loop never runs', data: [42] },
  ],
  defaultInput: [35, 12, 48, 20, 9, 31, 15],
  codeSnippets: {
    pseudocode: `function insertionSort(arr):
    n = length(arr)
    for i from 1 to n - 1:
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j = j - 1
        arr[j + 1] = key
    return arr`,
    python: `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    typescript: `function insertionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--; }
    arr[j + 1] = key; }
  return arr; }`,
    cpp: `vector<int> insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--; }
        arr[j + 1] = key; }
    return arr; }`,
    java: `int[] insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--; }
        arr[j + 1] = key; }
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<InsertionSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const frames: ExecutionFrame<InsertionSortState>[] = [];

    const arr = [...array];
    let sortedEnd = n > 0 ? 0 : -1;
    let heldKey: number | null = null;
    let holeIndex: number | null = null;
    let i = 0;
    let j = -1;
    let phase: InsertionSortState['phase'] = 'init';
    let actionType: InsertionSortState['actionType'] = 'INIT';
    const stats = { comparisons: 0, shifts: 0, insertions: 0 };
    const insertionLog: InsertionSortState['insertionLog'] = [];

    const shiftPlan = simulateShiftCounts(array);
    const maxShifts = shiftPlan.length ? Math.max(...shiftPlan) : 0;
    let longestShiftMilestoneUsed = false;
    let firstCompareCheckpointAdded = false;
    let firstInsertCheckpointAdded = false;

    const pushFrame = (opts: {
      codeLine: number;
      action: InsertionSortState['actionType'];
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<InsertionSortState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<InsertionSortState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      /** Index compared against the key (amber). */
      compareIndex?: number | null;
      /** Index written this step (cyan). */
      writeIndex?: number | null;
      /** Index the key was lifted from while it is held aside (purple). */
      keyIndex?: number | null;
      pointers?: Record<string, number>;
      auxiliaryNote?: string;
    }) => {
      const statusFor = (idx: number): ElementStatus => {
        if (opts.writeIndex != null && idx === opts.writeIndex) return 'active';
        if (opts.compareIndex != null && idx === opts.compareIndex) return 'comparing';
        if (opts.keyIndex != null && idx === opts.keyIndex && heldKey !== null) return 'pivot';
        if (idx <= sortedEnd) return 'sorted';
        return 'default';
      };

      const invariantLabel =
        n === 0
          ? 'the empty array is trivially sorted'
          : phase === 'done'
            ? `arr[0..${n - 1}] is sorted`
            : heldKey !== null
              ? `arr[0..${sortedEnd}] is sorted; key = ${heldKey} is held aside`
              : `arr[0..${sortedEnd}] is sorted`;

      const state: InsertionSortState = {
        array: arr.map((value, idx) => ({ id: idx, value, status: statusFor(idx) })),
        pointers: opts.pointers ?? {},
        auxiliary:
          heldKey !== null
            ? {
                type: 'value' as const,
                name: 'key',
                data: heldKey,
                note:
                  opts.auxiliaryNote ??
                  `arr[${i}] was copied into key; index [${i}] is free to overwrite.`,
              }
            : undefined,
        sortedEnd,
        heldKey,
        holeIndex,
        i,
        j,
        phase,
        actionType,
        stats: { ...stats },
        insertionLog: insertionLog.map((entry) => ({ ...entry })),
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
            name: 'insertionSort(arr)',
            params: { n, i, j, key: heldKey ?? '∅' },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: {
          comparisons: stats.comparisons,
          swaps: stats.shifts,
          accesses: stats.comparisons * 2 + stats.shifts * 2,
          lookups: 0,
        },
        invariantStatus: { label: invariantLabel, isValid: true },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 2,
      action: 'INIT',
      explanation:
        `n = length(arr) = ${n}. The sorted prefix starts as arr[0..0]${n > 0 ? ` = [${arr[0]}]` : ''}, which is trivially sorted.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'length(arr) > 0', condition: `${n} > 0`, result: n > 0 },
      variables: { n, values: arr.join(', ') },
      soundCue: 'start',
      pedagogy: {
        what:
          n > 0
            ? `The array has ${n} element(s); only the first one is already in its final place.`
            : 'The array is empty, so there is nothing to sort.',
        why: 'Insertion sort starts from a one-element sorted prefix — the base case every later insertion extends by one.',
        whatNext:
          n > 1
            ? `Pick arr[1] as the key and find its place inside arr[0..0].`
            : 'The outer loop never runs, so the array is already sorted.',
      },
    });

    if (n === 0) {
      phase = 'done';
      actionType = 'DONE';
      pushFrame({
        codeLine: 10,
        action: 'DONE',
        explanation:
          'Empty array: the outer loop has no iterations, so nothing is compared, nothing is shifted, and the result is the empty array itself.',
        variables: { n: 0, result: 0, comparisons: 0, shifts: 0, insertions: 0 },
        milestone: 'Nothing to Sort',
        soundCue: 'finish',
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'There is no element to violate the ordering, so zero comparisons and zero shifts are the correct, honest cost.',
          whatNext: 'Load a preset such as Random Array to watch the insertion loop run.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    if (n === 1) {
      phase = 'done';
      actionType = 'DONE';
      pushFrame({
        codeLine: 10,
        action: 'DONE',
        explanation: `One element: the loop range 1..0 is empty, so arr = [${arr[0]}] is returned unchanged with zero comparisons.`,
        conditionEval: { expr: 'array is sorted', condition: `${arr.join(', ')}`, result: true },
        variables: { result: 1, comparisons: 0, shifts: 0, insertions: 0 },
        milestone: 'Single Element',
        soundCue: 'finish',
        pedagogy: {
          what: 'With one element the sorted prefix already covers the whole array.',
          why: 'The for-loop range from 1 to n-1 = 0 is empty, so the base case is the final answer.',
          whatNext: 'Try the Nearly Sorted preset to see the loop do real (but cheap) work.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    // ── Outer loop: one insertion per iteration ─────────────────────────────
    for (let outer = 1; outer < n; outer++) {
      const key = arr[outer];
      const originIndex = outer;
      i = outer;
      phase = 'pick';
      actionType = 'PICK_KEY';
      heldKey = key;
      holeIndex = null;

      pushFrame({
        codeLine: 4,
        action: 'PICK_KEY',
        explanation: `key = arr[${outer}] = ${key}: the element is copied into the temporary slot, so the array behind it can be overwritten while shifting.`,
        keyIndex: outer,
        pointers: { i: outer },
        variables: { i: outer, key, 'arr[i]': key },
        soundCue: 'select',
        pedagogy: {
          what: `arr[${outer}] = ${key} is lifted out of the array into the variable key.`,
          why: 'The scan shifts values right through the slot the key came from, so the value must be saved somewhere else first.',
          whatNext: `Point j at the right edge of the sorted prefix (arr[${outer - 1}]) and get ready to scan left.`,
        },
      });

      j = outer - 1;
      phase = 'scan';
      actionType = 'SET_J';
      pushFrame({
        codeLine: 5,
        action: 'SET_J',
        explanation: `j = ${j}: the scan starts at the right edge of the sorted prefix arr[0..${outer - 1}] and moves left.`,
        keyIndex: outer,
        pointers: { i: outer, j },
        variables: { i: outer, key, j, 'arr[j]': arr[j] },
        soundCue: 'step',
        pedagogy: {
          what: `j points at arr[${j}] = ${arr[j]}, the largest element of the sorted prefix.`,
          why: 'Scanning from the right means the first value that is not greater than key marks the exact insertion point — no search afterwards.',
          whatNext: `Evaluate the guard j >= 0 && arr[j] > key with j = ${j}.`,
        },
      });

      // Inner loop: evaluate the real guard on every step, including the exit step.
      let shiftCount = 0;
      for (;;) {
        const inBounds = j >= 0;
        const valueAtJ = inBounds ? arr[j] : undefined;
        const guard = inBounds && (valueAtJ as number) > key;
        stats.comparisons += 1;
        actionType = 'CHECK_GUARD';

        const firstCompareCheckpoint: PredictionCheckpoint | undefined =
          !firstCompareCheckpointAdded
            ? {
                id: 'insertion-sort-first-compare',
                question: inBounds
                  ? `key = ${key} and arr[${j}] = ${valueAtJ}. The guard "arr[j] > key" evaluates to ${guard ? 'TRUE' : 'FALSE'} — what must happen next?`
                  : `key = ${key} and j = ${j} has run past the left edge — what must happen next?`,
                options: guard
                  ? [
                      'Shift arr[j] one slot right and keep scanning left',
                      'Insert key at index j immediately and stop',
                      'Swap key with arr[j] and end the pass',
                    ]
                  : inBounds
                    ? [
                        'Shift arr[j] right anyway to make room',
                        'Insert key at index j + 1 — the prefix is already ordered',
                        'Keep scanning further left past the prefix',
                      ]
                    : [
                        'Shift a value from index 0 to the right',
                        'Restart the outer loop without inserting',
                        'Insert key at index 0 — it is the smallest value so far',
                      ],
                correctIndex: 0,
                explanation: guard
                  ? `arr[${j}] = ${valueAtJ} is greater than key = ${key}, so it must slide right to open a hole and the scan continues left.`
                  : inBounds
                    ? `arr[${j}] = ${valueAtJ} <= key = ${key}, and the prefix is sorted, so every earlier value is also <= key — key belongs at index ${j + 1}.`
                    : `The scan crossed the left edge, so key = ${key} is smaller than everything in the prefix and lands at index 0.`,
                hint: 'Insertion sort never swaps — it only shifts values that are too large.',
              }
            : undefined;

        pushFrame({
          codeLine: 6,
          action: 'CHECK_GUARD',
          explanation: inBounds
            ? `Guard check: j = ${j} >= 0 and arr[${j}] = ${valueAtJ} > key = ${key} → ${guard ? 'TRUE' : 'FALSE'}.`
            : `Guard check: j = ${j} < 0, so the scan has run past the left edge → FALSE.`,
          conditionEval: {
            expr: `j >= 0 && arr[${j}] > key`,
            condition: inBounds ? `${j} >= 0 && ${valueAtJ} > ${key}` : `${j} >= 0`,
            result: guard,
          },
          compareIndex: inBounds ? j : null,
          keyIndex: originIndex,
          pointers: inBounds ? { j } : {},
          variables: { i: originIndex, key, j, 'arr[j]': valueAtJ ?? '∅' },
          soundCue: 'compare',
          checkpoint: firstCompareCheckpoint,
          pedagogy: {
            what: inBounds
              ? `Comparing the candidate arr[${j}] = ${valueAtJ} against the held key = ${key}.`
              : 'The scan has crossed the left boundary of the array.',
            why: 'The prefix is sorted, so the first value that is not greater than key is exactly where key must land — everything further left is also <= key.',
            whatNext: guard
              ? `Shift arr[${j}] into arr[${j + 1}], then decrement j.`
              : `Insert key at index ${j + 1} — the hole is ready.`,
          },
        });
        if (firstCompareCheckpoint) firstCompareCheckpointAdded = true;

        if (!guard) break;

        // Shift: this creates a deliberate duplicate; the key is still held aside.
        arr[j + 1] = arr[j];
        stats.shifts += 1;
        shiftCount += 1;
        actionType = 'SHIFT';
        pushFrame({
          codeLine: 7,
          action: 'SHIFT',
          explanation: `arr[${j + 1}] = arr[${j}] = ${arr[j]}: the larger value slides one slot right, and the hole for key moves to index ${j}.`,
          compareIndex: j,
          writeIndex: j + 1,
          keyIndex: originIndex,
          pointers: { j, write: j + 1 },
          variables: { i: originIndex, key, j, shiftedValue: arr[j], writeTo: j + 1 },
          soundCue: 'swap',
          auxiliaryNote: `key = ${key} is still held aside while index [${j + 1}] is overwritten by the shifted copy.`,
          pedagogy: {
            what: `The value ${arr[j]} moves from index ${j} to index ${j + 1}.`,
            why: 'Every element greater than key must end up to the right of it, and because the prefix is sorted, one backwards pass of shifts is enough.',
            whatNext: `Move j one slot left to ${j - 1} and compare the next candidate with key.`,
          },
        });

        j -= 1;
        actionType = 'DECREMENT_J';
        pushFrame({
          codeLine: 8,
          action: 'DECREMENT_J',
          explanation: `j = ${j}: the scan continues one position left; the hole for key is now at index ${j + 1}.`,
          compareIndex: j >= 0 ? j : null,
          keyIndex: originIndex,
          pointers: j >= 0 ? { j } : {},
          variables: { i: originIndex, key, j, hole: j + 1 },
          soundCue: 'step',
          pedagogy: {
            what: `j moved from ${j + 1} to ${j}.`,
            why: 'The value just shifted is already in its final relative position, so only the next candidate left of it can still block the key.',
            whatNext:
              j >= 0
                ? `Compare arr[${j}] = ${arr[j]} with key = ${key}.`
                : 'The left edge is reached — key belongs at index 0.',
          },
        });
      }

      // Place the held key into the hole.
      const finalPos = j + 1;
      arr[finalPos] = key;
      holeIndex = finalPos;
      heldKey = null;
      sortedEnd = outer;
      stats.insertions += 1;
      phase = 'insert';
      actionType = 'INSERT_KEY';
      insertionLog.push({ key, from: originIndex, to: finalPos, shifts: shiftCount });

      let milestoneTitle: string | undefined;
      if (outer === 1 && n === 2) {
        milestoneTitle = 'Only Insert';
      } else if (outer === n - 1) {
        milestoneTitle = 'Final Insert';
      } else if (shiftCount === maxShifts && maxShifts > 0 && !longestShiftMilestoneUsed) {
        milestoneTitle = 'Longest Shift Run';
        longestShiftMilestoneUsed = true;
      } else if (outer === 1) {
        milestoneTitle = 'First Insert';
      }

      const firstInsertCheckpoint: PredictionCheckpoint | undefined =
        !firstInsertCheckpointAdded
          ? {
              id: 'insertion-sort-insert-position',
              question: `The scan stopped with j = ${j}. Where does key = ${key} belong?`,
              options: [
                `Back at index ${originIndex} — its original position`,
                `At index ${finalPos} — the hole one slot right of where the scan stopped`,
                'Nowhere yet — it stays on the shelf until the next pass',
              ],
              correctIndex: 1,
              explanation: `The guard failed (or the left edge was crossed) at j = ${j}, so every value right of index ${j} is greater than key and every value left of it is <= key — key is written at index ${finalPos}.`,
              hint: 'The hole is exactly one slot right of where the scan stopped.',
            }
          : undefined;

      pushFrame({
        codeLine: 9,
        action: 'INSERT_KEY',
        explanation: `arr[${finalPos}] = key = ${key}: the held key lands in the hole after ${shiftCount} shift(s), so arr[0..${outer}] is sorted again.`,
        writeIndex: finalPos,
        pointers: { sortedEnd: outer },
        variables: { i: outer, placedKey: key, pos: finalPos, shifts: shiftCount },
        milestone: milestoneTitle,
        soundCue: 'insert',
        checkpoint: firstInsertCheckpoint,
        pedagogy: {
          what: `key = ${key} fills the hole at index ${finalPos}.`,
          why: 'Every value to the right was shifted one slot right and every value to the left is <= key, so writing the key here restores the sorted-prefix invariant.',
          whatNext:
            outer + 1 < n
              ? `The outer loop advances to i = ${outer + 1} and picks arr[${outer + 1}] = ${arr[outer + 1]}.`
              : 'All elements have been inserted; the array is sorted.',
        },
      });
      if (firstInsertCheckpoint) firstInsertCheckpointAdded = true;

      if (outer < n - 1) {
        i = outer + 1;
        phase = 'pick';
        actionType = 'NEXT_ITERATION';
        pushFrame({
          codeLine: 3,
          action: 'NEXT_ITERATION',
          explanation: `Outer loop advances to i = ${outer + 1}: arr[0..${outer}] stays sorted and arr[${outer + 1}] is the next element to insert.`,
          pointers: { i: outer + 1 },
          variables: {
            i: outer + 1,
            sortedPrefix: `[0..${outer}]`,
            nextValue: arr[outer + 1],
          },
          soundCue: 'step',
          pedagogy: {
            what: `The sorted prefix has grown to arr[0..${outer}] and the loop moves on.`,
            why: 'The invariant only requires the prefix to be sorted; the untouched tail stays exactly as it was.',
            whatNext: `Pick arr[${outer + 1}] = ${arr[outer + 1]} as the next key.`,
          },
        });
      }
    }

    // ── Final frame ─────────────────────────────────────────────────────────
    phase = 'done';
    actionType = 'DONE';
    pushFrame({
      codeLine: 10,
      action: 'DONE',
      explanation: `Insertion Sort complete: the array [${arr.join(', ')}] is sorted after ${stats.insertions} insertion(s), ${stats.comparisons} comparison(s) and ${stats.shifts} shift(s).`,
      conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: isSorted(arr) },
      variables: {
        result: n,
        comparisons: stats.comparisons,
        shifts: stats.shifts,
        insertions: stats.insertions,
      },
      milestone: 'Insertion Sort Complete',
      soundCue: 'finish',
      pedagogy: {
        what: `Every element has been inserted, so arr[0..${n - 1}] is sorted.`,
        why: 'Each insertion restored the invariant for a prefix one element longer, so after the final iteration the invariant covers the whole array.',
        whatNext: 'Run the Reversed preset to see the quadratic worst case, or Already Sorted for the linear best case.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<InsertionSortState>, projection) => {
    const { array, sortedEnd, heldKey, phase, actionType, stats, insertionLog } = frame.state;

    const phaseLabel =
      phase === 'init'
        ? 'starting'
        : phase === 'pick'
          ? actionType === 'NEXT_ITERATION'
            ? 'advancing'
            : 'picking key'
          : phase === 'scan'
            ? 'scanning left'
            : phase === 'insert'
              ? 'inserting'
              : 'done';

    const formula =
      phase === 'init'
        ? `sorted prefix = arr[0..${Math.max(0, sortedEnd)}] · key slot empty`
        : phase === 'done'
          ? `sorted · ${stats.comparisons} comparison(s) · ${stats.shifts} shift(s) · ${stats.insertions} insertion(s)`
          : actionType === 'INSERT_KEY'
            ? `arr[j + 1] = key · sorted prefix grows to arr[0..${sortedEnd}]`
            : heldKey !== null
              ? `key = ${heldKey} held aside · scan j from right to left while arr[j] > key`
              : `sorted prefix = arr[0..${sortedEnd}]`;

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
              n <span className="font-bold text-amber-300">{array.length}</span>
            </span>
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              sorted <span className="font-bold">[0..{sortedEnd}]</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              compares <span className="font-bold text-amber-300">{stats.comparisons}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              shifts <span className="font-bold text-rose-300">{stats.shifts}</span>
            </span>
            {heldKey !== null && (
              <span className="rounded-md border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 font-bold text-purple-200">
                key = {heldKey}
              </span>
            )}
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
                  <span>key lifted from the array</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>candidate being compared</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>slot written this step</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  <span>sorted prefix</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Insertion log</div>
              {insertionLog.length === 0 ? (
                <span className="text-slate-500">no insertion completed yet</span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {insertionLog.map((entry, pos) => (
                    <span key={pos}>
                      key <span className="font-bold text-purple-300">{entry.key}</span> → index{' '}
                      <span className="font-bold text-cyan-300">{entry.to}</span>{' '}
                      <span className="text-slate-500">
                        ({entry.shifts} shift{entry.shifts === 1 ? '' : 's'})
                      </span>
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
