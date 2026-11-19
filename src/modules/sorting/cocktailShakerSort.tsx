import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

/**
 * Cocktail Shaker Sort, rebuilt to the StepDSA teaching standard:
 * - one meaningful operation per frame (forward compare/swap, boundary locks,
 *   backward compare/swap, early exit),
 * - WHAT/WHY/NEXT pedagogy on every frame,
 * - two prediction checkpoints and real milestones (no per-swap noise),
 * - five language snippets that share the exact same statement per line, and
 * - honest input normalisation reported in the INIT frame.
 */

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [5, 1, 4, 2, 8, 0, 2];

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

export const cocktailShakerSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'cocktail-shaker-sort',
  title: 'Cocktail Shaker Sort (Bidirectional Bubble Sort)',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Array in strictly reverse order',
  },
  theory: {
    overview:
      'Cocktail Shaker Sort (also known as Bidirectional Bubble Sort or Ripple Sort) traverses alternatingly in both directions through the list, sorting both ends simultaneously.',
    whyItWorks:
      'Standard Bubble Sort only passes in one direction, causing small values near the end (known as "turtles") to move forward very slowly (1 position per pass). By reversing direction after each pass, turtles are quickly swept back to their correct positions.',
    invariant:
      'After pass k, the k smallest elements are sorted at the prefix, and the k largest elements are sorted at the suffix.',
    pitfalls: [
      'Forgetting to update start boundary after backward pass.',
      'Failing to track whether any swaps occurred, missing the early termination O(N) best case.',
      'The two sweeps lock one element each per full shake: the window maximum (right) and the window minimum (left).',
    ],
    steps: [
      'Guard: an empty or one-element array is already sorted.',
      'Forward sweep: push the window maximum to the right boundary, then shrink end by one.',
      'Backward sweep: drag the window minimum to the left boundary, then advance start by one.',
      'If a forward sweep makes zero swaps, the window is provably sorted — exit early.',
      'Repeat until the boundaries meet.',
    ],
    watchOut: [
      'Both boundaries move: end shrinks after the forward sweep, start advances after the backward sweep.',
      'The early-exit check happens after the forward sweep only — the backward sweep runs while swaps occurred.',
    ],
  },
  presets: [
    {
      id: 'random',
      label: 'Random Dataset',
      description: 'Shuffled array',
      data: [5, 1, 4, 2, 8, 0, 2],
    },
    {
      id: 'turtles',
      label: 'Turtle Problem',
      description: 'Small element at end: [2, 3, 4, 5, 6, 7, 8, 9, 1]',
      data: [2, 3, 4, 5, 6, 7, 8, 9, 1],
    },
    {
      id: 'reversed',
      label: 'Reversed Array',
      description: 'Worst case inverted array',
      data: [9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
    {
      id: 'single-element',
      label: 'One Element',
      description: 'The shake loop never runs',
      data: [42],
    },
  ],
  defaultInput: [5, 1, 4, 2, 8, 0, 2],
  codeSnippets: {
    python: `def cocktail_shaker_sort(arr):
    start = 0
    end = len(arr) - 1
    swapped = True
    while swapped:
        swapped = False
        for i in range(start, end):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        if not swapped:
            break
        end -= 1
        swapped = False
        for i in range(end - 1, start - 1, -1):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        start += 1
    return arr`,
    typescript: `function cocktailShakerSort(arr: number[]): number[] {
  let start = 0;
  let end = arr.length - 1;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; ++i) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true; } }
    if (!swapped) {
      break; }
    end--;
    swapped = false;
    for (let i = end - 1; i >= start; --i) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true; } }
    start++; }
  return arr; }`,
    cpp: `vector<int> cocktailShakerSort(vector<int>& arr) {
    int start = 0;
    int end = arr.size() - 1;
    bool swapped = true;
    while (swapped) {
        swapped = false;
        for (int i = start; i < end; ++i) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);
                swapped = true; } }
        if (!swapped) {
            break; }
        end--;
        swapped = false;
        for (int i = end - 1; i >= start; --i) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);
                swapped = true; } }
        start++; }
    return arr; }`,
    java: `int[] cocktailShakerSort(int[] arr) {
    int start = 0;
    int end = arr.length - 1;
    boolean swapped = true;
    while (swapped) {
        swapped = false;
        for (int i = start; i < end; ++i) {
            if (arr[i] > arr[i + 1]) {
                int t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t;
                swapped = true; } }
        if (!swapped) {
            break; }
        end--;
        swapped = false;
        for (int i = end - 1; i >= start; --i) {
            if (arr[i] > arr[i + 1]) {
                int t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t;
                swapped = true; } }
        start++; }
    return arr; }`,
    pseudocode: `function cocktailShakerSort(arr):
    start = 0
    end = length(arr) - 1
    swapped = true
    while swapped:
        swapped = false
        for i from start to end - 1:
            if arr[i] > arr[i + 1]:
                swap arr[i] with arr[i + 1]
                swapped = true
        if not swapped:
            break
        end = end - 1
        swapped = false
        for i from end - 1 down to start:
            if arr[i] > arr[i + 1]:
                swap arr[i] with arr[i + 1]
                swapped = true
        start = start + 1
    return arr`,
  },
  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const { array, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;
    let swapped = true;
    let start = 0;
    let end = n - 1;
    const settled = new Set<number>();
    const stats = { comparisons: 0, swaps: 0, shakes: 0 };
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    let actionType:
      | 'INIT'
      | 'FORWARD_COMPARE'
      | 'FORWARD_SWAP'
      | 'EARLY_EXIT'
      | 'MAX_LOCKED'
      | 'BACKWARD_COMPARE'
      | 'BACKWARD_SWAP'
      | 'MIN_LOCKED'
      | 'DONE' = 'INIT';
    let forwardCheckpointAdded = false;
    let shrinkCheckpointAdded = false;
    let firstLockMilestoneUsed = false;
    let halfMilestoneUsed = false;

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && settled.size >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Locked';
      }
      return undefined;
    };

    const makeFrameState = (
      active1?: number,
      active2?: number,
      status: 'comparing' | 'swapping' = 'comparing'
    ): ArrayStageState => {
      const statusFor = (idx: number): ElementStatus => {
        if (settled.has(idx)) return 'sorted';
        if (idx === active1 || idx === active2) return status;
        return 'default';
      };
      return {
        array: arr.map((val, idx) => ({ id: idx, value: val, status: statusFor(idx) })),
        pointers: { start, end, ...(active1 !== undefined ? { i: active1 } : {}) },
      };
    };

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy?: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<ArrayStageState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<ArrayStageState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      state: ArrayStageState;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: actionType,
        explanation: opts.explanation,
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
            settled.size > 0
              ? `prefix arr[0..${[...settled].filter((v) => v < Math.ceil(n / 2)).length - 1 >= 0 ? Math.min(...settled) - 1 : -1}] and suffix arr[${Math.max(...settled) + 1}..${n - 1}] are locked`
              : 'no element is locked yet',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [
          { name: 'cocktailShakerSort', params: { n, start, end }, line: opts.codeLine, isCurrent: true },
        ],
        state: opts.state,
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 2,
      explanation:
        `Window bounds [start=${start}, end=${end}] cover the whole array; the shake loop runs while a sweep swaps.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'n > 1', condition: `${n} > 1`, result: n > 1 },
      variables: { start, end, n },
      soundCue: 'start',
      state: makeFrameState(),
      pedagogy: {
        what:
          n > 1
            ? `The unsorted window is the whole array [${start}..${end}]; nothing is locked yet.`
            : n === 1
              ? 'The array holds a single element, which is trivially sorted.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Shaking in both directions fixes the classic bubble-sort weakness: "turtles" (small values near the end) move only one slot per pass.',
        whatNext:
          n > 1
            ? `Forward pass: walk i = ${start}..${end - 1} and swap every out-of-order neighbour.`
            : 'The shake loop never runs.',
      },
    });

    if (n <= 1) {
      actionType = 'DONE';
      pushFrame({
        codeLine: 20,
        explanation:
          n === 1
            ? `One element: no adjacent pair exists, so arr = [${arr[0]}] is returned unchanged with zero comparisons.`
            : 'Empty array: there is no pair to compare, so nothing happens.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: { result: n, comparisons: 0, swaps: 0 },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'complete',
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
          pointers: {},
        },
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted array by definition.' : 'An empty array is sorted by definition.',
          why: 'Cocktail shaker sort works on adjacent pairs; with fewer than two elements there is no pair to consider.',
          whatNext: 'Load a preset such as Turtle Problem to watch the backward sweep rescue a trailing small value.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    while (swapped) {
      stats.shakes += 1;
      swapped = false;

      // Forward Pass
      for (let i = start; i < end; ++i) {
        const shouldSwap = arr[i] > arr[i + 1];
        stats.comparisons += 1;
        actionType = 'FORWARD_COMPARE';

        const forwardCheckpoint: PredictionCheckpoint | undefined = !forwardCheckpointAdded
          ? {
              id: 'cocktail-first-forward-compare',
              question: `Forward pass, window [${start}..${end}]: arr[${i}] = ${arr[i]} vs arr[${i + 1}] = ${arr[i + 1]}. Swap?`,
              options: ['Yes — left is bigger', 'No — already in order'],
              correctIndex: shouldSwap ? 0 : 1,
              explanation: shouldSwap
                ? `${arr[i]} > ${arr[i + 1]}, so the larger value keeps moving right.`
                : `${arr[i]} ≤ ${arr[i + 1]}; the sweep just moves on.`,
              hint: 'Same rule as bubble sort — only out-of-order neighbours swap.',
            }
          : undefined;

        pushFrame({
          codeLine: 8,
          explanation: `Forward pass: compare arr[${i}] (${arr[i]}) with arr[${i + 1}] (${arr[i + 1]}) → ${shouldSwap ? 'out of order, swap' : 'in order, move on'}.`,
          soundCue: 'compare',
          variables: { direction: 'FORWARD', i, next: i + 1, 'arr[i]': arr[i], 'arr[i+1]': arr[i + 1], shouldSwap },
          conditionEval: {
            expr: `arr[${i}] > arr[${i + 1}]`,
            condition: `${arr[i]} > ${arr[i + 1]}`,
            result: shouldSwap,
          },
          checkpoint: forwardCheckpoint,
          state: makeFrameState(i, i + 1, 'comparing'),
          pedagogy: {
            what: `Forward sweep compares the pair (${arr[i]}, ${arr[i + 1]}) at indices ${i}, ${i + 1}.`,
            why: 'A left-to-right sweep pushes the largest value of the window toward the right boundary, exactly like bubble sort.',
            whatNext: shouldSwap
              ? `${arr[i]} > ${arr[i + 1]} — swap and keep moving right.`
              : `${arr[i]} ≤ ${arr[i + 1]} — already ordered, move the pair window right.`,
          },
        });
        if (forwardCheckpoint) forwardCheckpointAdded = true;

        if (shouldSwap) {
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swapped = true;
          stats.swaps += 1;
          actionType = 'FORWARD_SWAP';

          pushFrame({
            codeLine: 9,
            explanation: `Swapped arr[${i}] ⇄ arr[${i + 1}]: ${temp} moves right past ${arr[i]}.`,
            soundCue: 'swap',
            variables: { swapped: true, indexA: i, indexB: i + 1, valA: arr[i], valB: arr[i + 1] },
            conditionEval: { expr: 'swapped = true', condition: 'true', result: true },
            state: makeFrameState(i, i + 1, 'swapping'),
            pedagogy: {
              what: `${temp} moved right past ${arr[i]}; the larger value continues its journey toward the right boundary.`,
              why: 'Recording swapped = true disables the early-exit check for this sweep.',
              whatNext: `Continue comparing at index ${i + 1}.`,
            },
          });
        }
      }

      if (!swapped) {
        actionType = 'EARLY_EXIT';
        pushFrame({
          codeLine: 11,
          explanation: 'Forward pass made zero swaps: the window is already ordered, so the sort stops early (Early termination).',
          conditionEval: { expr: 'swapped === false', condition: 'false', result: true },
          variables: { earlyExit: true, pass: 'forward', shakes: stats.shakes },
          soundCue: 'complete',
          milestone: maybeHalfMilestone() ?? 'Early Exit (Sorted)',
          state: makeFrameState(),
          pedagogy: {
            what: 'A full forward sweep found no out-of-order neighbour.',
            why: 'Zero swaps in one complete sweep proves the whole window is sorted — no later pass could change anything.',
            whatNext: 'Break out and finish.',
          },
        });
        break;
      }

      settled.add(end);
      actionType = 'MAX_LOCKED';

      const shrinkCheckpoint: PredictionCheckpoint | undefined = !shrinkCheckpointAdded
        ? {
            id: 'cocktail-window-shrink',
            question: `The forward sweep parked the window maximum ${arr[end]} at index ${end}. Which boundary shrinks now?`,
            options: [
              `start += 1 — the left boundary`,
              `end -= 1 — the right boundary`,
              'Both boundaries at once',
            ],
            correctIndex: 1,
            explanation: `The maximum is final at index ${end}, so end shrinks to ${end - 1}; the left boundary only moves after the backward sweep.`,
            hint: 'Which end did the forward sweep finish on?',
          }
        : undefined;

      const maxMilestone = !firstLockMilestoneUsed
        ? 'First Max Locked'
        : maybeHalfMilestone();
      if (maxMilestone) firstLockMilestoneUsed = true;

      pushFrame({
        codeLine: 13,
        explanation: `Forward pass completed. Maximum ${arr[end]} bubbled to index ${end} and is locked (${settled.size}/${n} placed). Shrinking end to ${end - 1}.`,
        soundCue: 'sorted',
        milestone: maxMilestone,
        checkpoint: shrinkCheckpoint,
        variables: { lockedIndex: end, maxVal: arr[end], newEnd: end - 1 },
        conditionEval: { expr: 'isSorted(end)', condition: `locked ${end}`, result: true },
        state: makeFrameState(),
        pedagogy: {
          what: `The maximum of the window, ${arr[end]}, is parked at index ${end} — one more element is final.`,
          why: 'Every forward comparison pushed larger values right, so after the sweep the window maximum must sit at its right edge.',
          whatNext: `Shrink the window (end = ${end - 1}) and sweep backward.`,
        },
      });
      if (shrinkCheckpoint) shrinkCheckpointAdded = true;

      end--;
      swapped = false;

      // Backward Pass
      for (let i = end - 1; i >= start; --i) {
        const shouldSwap = arr[i] > arr[i + 1];
        stats.comparisons += 1;
        actionType = 'BACKWARD_COMPARE';

        pushFrame({
          codeLine: 16,
          explanation: `Backward pass: compare arr[${i}] (${arr[i]}) with arr[${i + 1}] (${arr[i + 1]}) → ${shouldSwap ? 'out of order, swap' : 'in order, move on'}.`,
          soundCue: 'compare',
          variables: { direction: 'BACKWARD', i, next: i + 1, 'arr[i]': arr[i], 'arr[i+1]': arr[i + 1], shouldSwap },
          conditionEval: {
            expr: `arr[${i}] > arr[${i + 1}]`,
            condition: `${arr[i]} > ${arr[i + 1]}`,
            result: shouldSwap,
          },
          state: makeFrameState(i, i + 1, 'comparing'),
          pedagogy: {
            what: `Backward sweep compares the pair (${arr[i]}, ${arr[i + 1]}) moving right-to-left.`,
            why: 'The reverse sweep is what drags "turtles" (small values near the end) back to the left quickly instead of one slot per pass.',
            whatNext: shouldSwap
              ? `${arr[i]} > ${arr[i + 1]} — swap so the smaller value keeps moving left.`
              : `${arr[i]} ≤ ${arr[i + 1]} — already ordered, move the pair window left.`,
          },
        });

        if (shouldSwap) {
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swapped = true;
          stats.swaps += 1;
          actionType = 'BACKWARD_SWAP';

          pushFrame({
            codeLine: 17,
            explanation: `Swapped arr[${i}] ⇄ arr[${i + 1}]: ${arr[i]} moves left past ${temp}. Turtle element dragged to left.`,
            soundCue: 'swap',
            variables: { swapped: true, indexA: i, indexB: i + 1, valA: arr[i], valB: arr[i + 1] },
            conditionEval: { expr: 'swapped = true', condition: 'true', result: true },
            state: makeFrameState(i, i + 1, 'swapping'),
            pedagogy: {
              what: `${arr[i]} moved left past ${temp}; the smaller value closes in on its final position.`,
              why: 'Direction reversal after each pass is exactly what fixes the turtle problem.',
              whatNext: `Continue comparing at index ${i - 1}.`,
            },
          });
        }
      }

      settled.add(start);
      actionType = 'MIN_LOCKED';

      const minMilestone = !firstLockMilestoneUsed
        ? 'First Min Locked'
        : maybeHalfMilestone();

      pushFrame({
        codeLine: 19,
        explanation: `Backward pass completed. Minimum ${arr[start]} bubbled to index ${start} and is locked (${settled.size}/${n} placed). Advancing start to ${start + 1}.`,
        soundCue: 'sorted',
        milestone: minMilestone,
        variables: { lockedIndex: start, minVal: arr[start], newStart: start + 1 },
        conditionEval: { expr: 'isSorted(start)', condition: `locked ${start}`, result: true },
        state: makeFrameState(),
        pedagogy: {
          what: `The minimum of the window, ${arr[start]}, is parked at index ${start} — the left boundary is now final too.`,
          why: 'The backward sweep pushed smaller values left on every comparison, so the window minimum ends at its left edge.',
          whatNext: `Shrink the window (start = ${start + 1}) and start another forward pass while swaps still happen.`,
        },
      });

      start++;
    }

    actionType = 'DONE';
    pushFrame({
      codeLine: 20,
      explanation: `Cocktail Shaker Sort complete: [${arr.join(', ')}] is sorted after ${stats.shakes} shake(s), ${stats.comparisons} comparison(s) and ${stats.swaps} swap(s).`,
      variables: {
        result: n,
        comparisons: stats.comparisons,
        swaps: stats.swaps,
        shakes: stats.shakes,
      },
      conditionEval: { expr: 'isSorted(arr)', condition: arr.join(', '), result: isSorted(arr) },
      soundCue: 'complete',
      milestone: 'Cocktail Shaker Complete',
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
      pedagogy: {
        what: `Both boundaries met after sweeping left and right, leaving the array sorted: [${arr.join(', ')}].`,
        why: 'Every full shake finalized one maximum (right) and one minimum (left), so the window shrank by two.',
        whatNext: 'Try the "Turtle Problem" preset: the reverse sweep rescues the small trailing value in a single pass.',
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
