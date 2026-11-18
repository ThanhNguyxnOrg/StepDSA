import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

/**
 * Bubble Sort, rebuilt to the StepDSA teaching standard:
 * - one meaningful operation per frame (pass start → swapped flag → scan start
 *   → compare → swap → pass end → early exit → done),
 * - WHAT/WHY/NEXT pedagogy on every frame,
 * - two prediction checkpoints and real milestones (no per-pass noise),
 * - five language snippets that share the exact same statement per line, and
 * - honest input normalisation reported in the INIT frame.
 */

export interface BubbleSortState extends ArrayStageState {
  /** Current outer pass (1-based). */
  pass: number;
  /** Current inner scan index j. */
  j: number | null;
  /** First index of the settled (sorted) suffix. */
  sortedFrom: number;
  phase: 'init' | 'pass' | 'scan' | 'settle' | 'done';
  actionType:
    | 'INIT'
    | 'PASS_START'
    | 'SWAPPED_FLAG'
    | 'SCAN_START'
    | 'COMPARE'
    | 'SWAP'
    | 'PASS_END'
    | 'EARLY_EXIT'
    | 'DONE';
  stats: {
    comparisons: number;
    swaps: number;
    passes: number;
  };
}

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [29, 10, 14, 37, 13, 45, 8];

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

export const bubbleSortModule: AlgorithmModule<number[], BubbleSortState> = {
  id: 'bubble-sort',
  title: 'Bubble Sort (Adjacent Swaps)',
  category: 'sorting',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'insertion-sort', label: 'Insertion Sort' },
    { id: 'selection-sort', label: 'Selection Sort' },
    { id: 'cocktail-shaker-sort', label: 'Cocktail Shaker' },
    { id: 'shellsort', label: 'Shell Sort' },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Strictly reversed array',
  },
  theory: {
    overview:
      'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    whyItWorks:
      'In each pass k, the k-th largest remaining element "bubbles up" to its correct position at the end of the array.',
    invariant:
      'After pass k, the suffix arr[N-k ... N-1] consists of the k largest elements in sorted order.',
    pitfalls: [
      'O(N²) quadratic time makes it inefficient for large datasets.',
      'Without an early-exit swapped flag, best-case remains O(N²).',
      'A pass never needs to touch the settled suffix — the scan limit shrinks by one each pass.',
    ],
    steps: [
      'Guard: an empty or one-element array is already sorted.',
      'Start a pass: reset the swapped flag and scan adjacent pairs from the left.',
      'If the left neighbour is bigger, swap the pair — the larger value bubbles right.',
      'When the scan ends, the largest unsorted value is at the boundary; the settled suffix grows.',
      'If a full pass made zero swaps, the array is proven sorted — exit early.',
    ],
    watchOut: [
      'The scan limit is n - i - 1: each pass compares one fewer pair because the settled suffix grows.',
      'The early-exit check happens after a complete pass, not inside the scan loop.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Average case demonstration', data: [29, 10, 14, 37, 13] },
    { id: 'reversed', label: 'Reversed Array', description: 'Worst case (maximum swaps)', data: [50, 40, 30, 20, 10] },
    { id: 'sorted', label: 'Already Sorted', description: 'Best case (early exit in 1 pass)', data: [10, 20, 30, 40, 50] },
    { id: 'single-element', label: 'One Element', description: 'The guard skips the passes entirely', data: [42] },
  ],
  defaultInput: [29, 10, 14, 37, 13, 45, 8],
  codeSnippets: {
    pseudocode: `function bubbleSort(arr):
    n = length(arr)
    for i = 0 to n - 1:
        swapped = false
        for j = 0 to n - i - 2:
            if arr[j] > arr[j + 1]:
                swap arr[j] with arr[j + 1]
                swapped = true
        if not swapped:
            break
    return arr`,
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    typescript: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true; } }
    if (!swapped) {
      break; } }
  return arr; }`,
    cpp: `vector<int> bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true; } }
        if (!swapped) {
            break; } }
    return arr; }`,
    java: `int[] bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
                swapped = true; } }
        if (!swapped) {
            break; } }
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<BubbleSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const frames: ExecutionFrame<BubbleSortState>[] = [];
    const arr = [...array];
    const settled = new Set<number>();
    const stats = { comparisons: 0, swaps: 0, passes: 0 };

    let phase: BubbleSortState['phase'] = 'init';
    let actionType: BubbleSortState['actionType'] = 'INIT';
    let pass = 0;
    let j: number | null = null;
    let sortedFrom = n;
    let compareCheckpointAdded = false;
    let passCheckpointAdded = false;
    let firstSettleMilestoneUsed = false;
    let halfMilestoneUsed = false;

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && settled.size >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Settled';
      }
      return undefined;
    };

    const pushFrame = (opts: {
      codeLine: number;
      action: BubbleSortState['actionType'];
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<BubbleSortState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<BubbleSortState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      compareIndex?: number | null;
      compareIndex2?: number | null;
      swapping?: boolean;
      pointers?: Record<string, number>;
    }) => {
      const statusFor = (idx: number): ElementStatus => {
        if (opts.swapping && (idx === opts.compareIndex || idx === opts.compareIndex2)) return 'swapping';
        if (idx === opts.compareIndex || idx === opts.compareIndex2) return 'comparing';
        if (idx >= sortedFrom) return 'sorted';
        return 'default';
      };

      const state: BubbleSortState = {
        array: arr.map((value, idx) => ({ id: idx, value, status: statusFor(idx) })),
        pointers: opts.pointers ?? {},
        pass,
        j,
        sortedFrom,
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
            name: 'bubbleSort',
            params: { n, pass, j: j ?? '∅', limit: n - (pass - 1) - 1 },
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
            sortedFrom < n
              ? `suffix arr[${sortedFrom}..${n - 1}] is settled and sorted`
              : 'no element is settled yet',
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
        `n = length(arr) = ${n}. The unsorted region is the whole array [0..${n - 1}].` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'n > 1', condition: `${n} > 1`, result: n > 1 },
      variables: { n },
      soundCue: 'start',
      pedagogy: {
        what:
          n > 1
            ? `Nothing is settled yet; the full array [0..${n - 1}] is the unsorted region.`
            : n === 1
              ? 'The array holds a single element, which is trivially sorted.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Bubble sort repeatedly walks adjacent pairs, so the largest unsorted value "bubbles" to the right boundary of each pass.',
        whatNext:
          n > 1
            ? `Pass 1 starts: compare arr[0] = ${arr[0]} with arr[1] = ${arr[1]}.`
            : 'No pass is needed at all.',
      },
    });

    if (n <= 1) {
      phase = 'done';
      actionType = 'DONE';
      pushFrame({
        codeLine: 11,
        action: 'DONE',
        explanation:
          n === 1
            ? `One element: no adjacent pair exists, so arr = [${arr[0]}] is returned unchanged with zero comparisons.`
            : 'Empty array: there is no adjacent pair to compare, so nothing happens.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: { result: n, comparisons: 0, swaps: 0, passes: 0 },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'finish',
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted array by definition.' : 'An empty array is sorted by definition.',
          why: 'Bubble sort works on adjacent pairs; with fewer than two elements there is no pair to consider.',
          whatNext: 'Load a preset such as Random Array to watch the passes run.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    for (let i = 0; i < n; i++) {
      const pairCount = n - i - 1;
      if (pairCount <= 0) break;

      pass = i + 1;
      stats.passes = pass;
      phase = 'pass';
      actionType = 'PASS_START';
      pushFrame({
        codeLine: 3,
        action: 'PASS_START',
        explanation: `Pass ${pass} starts: the unsorted region is arr[0..${n - i - 1}], so ${pairCount} adjacent pair(s) will be compared.`,
        variables: { pass, limit: pairCount, unsorted: `[0..${n - i - 1}]` },
        soundCue: 'step',
        pedagogy: {
          what: `Pass ${pass} sweeps the unsorted region [0..${n - i - 1}].`,
          why: 'The scan limit shrinks by one each pass because the settled suffix needs no re-checking.',
          whatNext: `Reset the swapped flag and start comparing at j = 0.`,
        },
      });

      phase = 'scan';
      actionType = 'SWAPPED_FLAG';
      pushFrame({
        codeLine: 4,
        action: 'SWAPPED_FLAG',
        explanation: `swapped = false: the early-exit check at the end of this pass will only fire if the scan never swaps.`,
        variables: { pass, swapped: false },
        soundCue: 'step',
        pedagogy: {
          what: 'The swapped flag is reset before the scan.',
          why: 'A full pass with zero swaps is the only proof bubble sort has that the array is sorted.',
          whatNext: `Scan j from 0 to ${pairCount - 1}.`,
        },
      });

      actionType = 'SCAN_START';
      pushFrame({
        codeLine: 5,
        action: 'SCAN_START',
        explanation: `Scan j = 0..${pairCount - 1}: compare each adjacent pair inside the unsorted region.`,
        variables: { pass, scanFrom: 0, scanTo: pairCount - 1 },
        soundCue: 'step',
        pedagogy: {
          what: 'The inner scan walks adjacent pairs left to right.',
          why: 'Each swap pushes the larger value one slot right, so a full sweep carries the regional maximum to the boundary.',
          whatNext: `Compare arr[0] = ${arr[0]} with arr[1] = ${arr[1]}.`,
        },
      });

      let swapped = false;
      for (let scan = 0; scan < pairCount; scan++) {
        j = scan;
        const shouldSwap = arr[scan] > arr[scan + 1];
        stats.comparisons += 1;
        actionType = 'COMPARE';

        const compareCheckpoint: PredictionCheckpoint | undefined = !compareCheckpointAdded
          ? {
              id: 'bubble-sort-first-compare',
              question: `arr[${scan}] = ${arr[scan]} and arr[${scan + 1}] = ${arr[scan + 1]}. Will this pair swap?`,
              options: ['Yes — the left value is bigger', 'No — already in order'],
              correctIndex: shouldSwap ? 0 : 1,
              explanation: shouldSwap
                ? `${arr[scan]} > ${arr[scan + 1]}, so the larger left value bubbles right.`
                : `${arr[scan]} ≤ ${arr[scan + 1]}; the pair already satisfies sorted order.`,
              hint: 'Bubble sort only fixes neighbours that violate sorted order.',
            }
          : undefined;

        pushFrame({
          codeLine: 6,
          action: 'COMPARE',
          explanation: `Compare arr[${scan}] = ${arr[scan]} with arr[${scan + 1}] = ${arr[scan + 1]} → ${shouldSwap ? 'out of order, they will swap' : 'in order, window moves right'}.`,
          compareIndex: scan,
          compareIndex2: scan + 1,
          pointers: { j: scan },
          variables: { pass, j: scan, 'arr[j]': arr[scan], 'arr[j+1]': arr[scan + 1], shouldSwap },
          conditionEval: {
            expr: `arr[${scan}] > arr[${scan + 1}]`,
            condition: `${arr[scan]} > ${arr[scan + 1]}`,
            result: shouldSwap,
          },
          soundCue: 'compare',
          checkpoint: compareCheckpoint,
          pedagogy: {
            what: `Adjacent pair (${arr[scan]}, ${arr[scan + 1]}) is compared at positions ${scan} and ${scan + 1} in pass ${pass}.`,
            why: 'Only out-of-order neighbours violate sortedness; fixing them one pair at a time over enough passes is exactly bubble sort.',
            whatNext: shouldSwap
              ? `${arr[scan]} > ${arr[scan + 1]}, so the two will swap.`
              : `${arr[scan]} ≤ ${arr[scan + 1]}, already in order — move the pair window right.`,
          },
        });
        if (compareCheckpoint) compareCheckpointAdded = true;

        if (shouldSwap) {
          actionType = 'SWAP';
          pushFrame({
            codeLine: 7,
            action: 'SWAP',
            explanation: `arr[${scan}] (${arr[scan]}) ⇄ arr[${scan + 1}] (${arr[scan + 1]}): the larger value keeps bubbling right.`,
            compareIndex: scan,
            compareIndex2: scan + 1,
            swapping: true,
            pointers: { j: scan },
            variables: { pass, swapA: arr[scan], swapB: arr[scan + 1], indexA: scan, indexB: scan + 1 },
            conditionEval: { expr: 'swapped = true', condition: 'true', result: true },
            soundCue: 'swap',
            pedagogy: {
              what: `${arr[scan]} and ${arr[scan + 1]} trade places; the larger value keeps moving right.`,
              why: 'Marking swapped = true is what disables the early-exit check for this pass.',
              whatNext: `Continue with the next adjacent pair starting at index ${scan + 1}.`,
            },
          });
          const tmp = arr[scan];
          arr[scan] = arr[scan + 1];
          arr[scan + 1] = tmp;
          swapped = true;
          stats.swaps += 1;
        }
      }
      j = null;

      settled.add(n - i - 1);
      sortedFrom = n - i - 1;
      phase = 'settle';
      actionType = 'PASS_END';

      let settleMilestone: string | undefined;
      if (!firstSettleMilestoneUsed) {
        settleMilestone = 'First Element Settled';
        firstSettleMilestoneUsed = true;
      } else {
        settleMilestone = maybeHalfMilestone();
      }

      const passCheckpoint: PredictionCheckpoint | undefined = !passCheckpointAdded
        ? {
            id: 'bubble-sort-pass-result',
            question: `Pass ${pass} just ended. Which index is now guaranteed to hold its final value?`,
            options: [
              `Index 0 — the smallest value bubbled left`,
              `Index ${n - i - 1} — the pass maximum bubbled to the boundary`,
              `No index — a pass without swaps proves nothing`,
            ],
            correctIndex: 1,
            explanation: `Every comparison moved the larger value right, so after one full sweep the largest unsorted value (${arr[n - i - 1]}) must sit at index ${n - i - 1}.`,
            hint: 'Which direction does a swapped value travel?',
          }
        : undefined;

      pushFrame({
        codeLine: 5,
        action: 'PASS_END',
        explanation: `Pass ${pass} complete with ${swapped ? 'at least one swap' : 'zero swaps'}. Largest unsorted element ${arr[n - i - 1]} settled at index [${n - i - 1}] (${settled.size}/${n} placed).`,
        variables: { pass, settledIndex: n - i - 1, settledValue: arr[n - i - 1], swapped },
        conditionEval: { expr: 'pass completed', condition: `settled contains ${n - i - 1}`, result: true },
        soundCue: 'sorted',
        milestone: settleMilestone,
        checkpoint: passCheckpoint,
        pedagogy: {
          what: `The pass swept the whole unsorted region and pushed its maximum ${arr[n - i - 1]} to index ${n - i - 1}.`,
          why: 'Every comparison moved the larger value right, so after one full sweep the largest value must be at the boundary.',
          whatNext: swapped
            ? `The unsorted region shrinks to [0..${n - i - 2}]; start pass ${pass + 1}.`
            : 'Check the swapped flag — zero swaps means the array is already sorted.',
        },
      });
      if (passCheckpoint) passCheckpointAdded = true;

      if (!swapped) {
        actionType = 'EARLY_EXIT';
        pushFrame({
          codeLine: 9,
          action: 'EARLY_EXIT',
          explanation: `swapped stayed false during pass ${pass}: no out-of-order neighbour exists, so the array is sorted and the loop breaks (Early termination).`,
          conditionEval: { expr: 'swapped === false', condition: 'false', result: true },
          variables: { pass, earlyExit: true, totalPasses: pass, settled: settled.size },
          soundCue: 'complete',
          milestone: maybeHalfMilestone() ?? 'Early Exit (Sorted)',
          pedagogy: {
            what: `Pass ${pass} made zero swaps.`,
            why: 'A full pass with no out-of-order neighbours proves the array is sorted — no later pass could change anything.',
            whatNext: 'Stop early: skip all remaining passes.',
          },
        });
        break;
      }
    }

    // ── Final frame ─────────────────────────────────────────────────────────
    phase = 'done';
    actionType = 'DONE';
    pushFrame({
      codeLine: 11,
      action: 'DONE',
      explanation: `Bubble Sort complete: [${arr.join(', ')}] is sorted after ${stats.passes} pass(es), ${stats.comparisons} comparison(s) and ${stats.swaps} swap(s).`,
      variables: {
        result: n,
        comparisons: stats.comparisons,
        swaps: stats.swaps,
        passes: stats.passes,
      },
      conditionEval: { expr: 'isSorted(arr)', condition: arr.join(', '), result: isSorted(arr) },
      soundCue: 'finish',
      milestone: 'Bubble Sort Complete',
      pedagogy: {
        what: 'All elements are in non-decreasing order after pass-by-pass bubbling.',
        why: 'Each pass guarantees one more maximum in its final position, so n-1 passes always suffice — and the swapped flag can end it sooner.',
        whatNext: 'Try the Already Sorted preset to watch the early-exit fire after a single clean pass.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<BubbleSortState>, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
