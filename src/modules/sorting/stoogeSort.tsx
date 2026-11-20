import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

const MAX_LEN = 6; // stooge recursion grows as 3^(log N) — cap keeps the tree watchable
const MAX_ABS = 999;
const DEFAULT_ARRAY = [5, 2, 4, 1, 3];

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
    notes.push(`${array.length} values truncated to ${MAX_LEN} so the 3-branch recursion tree stays watchable`);
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

export const stoogeSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'stooge-sort',
  title: 'Stooge Sort (Recursive 2/3 Overlapping Segment Sort O(N^2.71))',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N^2.7095)',
    timeAverage: 'O(N^2.7095)',
    timeWorst: 'O(N^2.7095)',
    spaceAuxiliary: 'O(log N) recursion depth',
    worstCaseCondition: 'Recurrence T(N) = 3 * T(2N / 3) + O(1) applies uniformly',
  },
  theory: {
    overview:
      'Stooge Sort is a recursive sorting algorithm with an unusual time complexity of O(N^(log 3 / log 1.5)) ≈ O(N^2.7095). It sorts by swapping boundary elements if out of order, then recursively sorting the first 2/3, the last 2/3, and the first 2/3 again.',
    whyItWorks:
      'Sorting the first 2/3 brings the largest elements of that subsegment into the middle third; sorting the last 2/3 then pushes the overall largest elements into the final third; sorting the first 2/3 once more places the remaining elements in exact order.',
    invariant:
      'Overlapping Trisection Invariant: After three overlapping 2/3 passes, the entire subsegment [i..j] is sorted.',
    pitfalls: [
      'Extremely slow even compared to Bubble Sort (O(N^2.71) vs O(N^2)).',
      'Large recursion call stacks for inputs with N > 30.',
      'The middle third is visited by all three branches — that overlap is both why it works and why it is slow.',
    ],
    steps: [
      'Guard: an empty or one-element range is already sorted.',
      'Order the boundary pair arr[i], arr[j] with a single swap if needed.',
      'Branch 1: recursively sort the first two-thirds [i..j-t].',
      'Branch 2: recursively sort the overlapping last two-thirds [i+t..j] — this pushes the maximum to j.',
      'Branch 3: recursively sort the first two-thirds again to finalize the front.',
    ],
    watchOut: [
      'Ranges of length ≤ 2 stop after the boundary swap — that is the recursion base case.',
      'The three branches overlap, so the same elements are re-sorted many times: T(N) = 3T(2N/3).',
    ],
  },
  presets: [
    {
      id: 'classic-5',
      label: 'Small Array: [5, 2, 4, 1, 3]',
      description: '5 elements demonstrates all 3 recursive branches cleanly',
      data: [5, 2, 4, 1, 3],
    },
    {
      id: 'reversed-4',
      label: 'Reversed: [4, 3, 2, 1]',
      description: 'Worst-case inversion profile',
      data: [4, 3, 2, 1],
    },
    {
      id: 'three-elements',
      label: '3 Elements: [3, 1, 2]',
      description: 'Single-level trisection demonstration',
      data: [3, 1, 2],
    },
    {
      id: 'single-element',
      label: 'One Element',
      description: 'Sorted without any comparison',
      data: [42],
    },
  ],
  defaultInput: [5, 2, 4, 1, 3],
  codeSnippets: {
    pseudocode: `function stoogeSort(arr, i, j):
    if arr[i] > arr[j]:
        swap arr[i], arr[j]
    if (j - i + 1) > 2:
        t = floor((j - i + 1) / 3)
        stoogeSort(arr, i, j - t)
        stoogeSort(arr, i + t, j)
        stoogeSort(arr, i, j - t)
    return arr`,
    python: `def stoogesort(arr, i, j):
    if arr[i] > arr[j]:
        arr[i], arr[j] = arr[j], arr[i]
    if (j - i + 1) > 2:
        t = (j - i + 1) // 3
        stoogesort(arr, i, j - t)
        stoogesort(arr, i + t, j)
        stoogesort(arr, i, j - t)
    return arr`,
    typescript: `function stoogeSort(arr: number[], i: number, j: number): number[] {
  if (arr[i] > arr[j]) {
    [arr[i], arr[j]] = [arr[j], arr[i]]; }
  if (j - i + 1 > 2) {
    const t = Math.floor((j - i + 1) / 3);
    stoogeSort(arr, i, j - t);
    stoogeSort(arr, i + t, j);
    stoogeSort(arr, i, j - t); }
  return arr; }`,
    cpp: `vector<int> stoogeSort(vector<int>& arr, int i, int j) {
    if (arr[i] > arr[j]) {
        swap(arr[i], arr[j]); }
    if (j - i + 1 > 2) {
        int t = (j - i + 1) / 3;
        stoogeSort(arr, i, j - t);
        stoogeSort(arr, i + t, j);
        stoogeSort(arr, i, j - t); }
    return arr; }`,
    java: `int[] stoogeSort(int[] arr, int i, int j) {
    if (arr[i] > arr[j]) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
    if (j - i + 1 > 2) {
        int t = (j - i + 1) / 3;
        stoogeSort(arr, i, j - t);
        stoogeSort(arr, i + t, j);
        stoogeSort(arr, i, j - t); }
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const { array, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const stats = { compares: 0, swaps: 0, calls: 0 };

    let actionType:
      | 'INIT'
      | 'BOUNDARY_COMPARE'
      | 'BOUNDARY_SWAP'
      | 'BASE_CASE'
      | 'BRANCH_FIRST'
      | 'BRANCH_LAST'
      | 'BRANCH_FIRST_AGAIN'
      | 'DONE' = 'INIT';
    let branchCheckpointAdded = false;
    let overlapCheckpointAdded = false;
    let firstTrisectionMilestoneUsed = false;

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy?: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<ArrayStageState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<ArrayStageState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      statuses?: Record<number, ElementStatus>;
      pointers?: Record<string, number>;
      callStack?: any[];
    }) => {
      const statusFor = (idx: number): ElementStatus => opts.statuses?.[idx] ?? elements[idx].status;
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: actionType,
        explanation: opts.explanation,
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: {
          comparisons: stats.compares,
          swaps: stats.swaps,
          accesses: stats.compares * 2 + stats.swaps * 4,
          lookups: 0,
        },
        invariantStatus: {
          label:
            actionType === 'DONE'
              ? 'the whole array is sorted'
              : 'after branches 1-3, range [i..j] is guaranteed sorted',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: opts.callStack ?? [
          { name: `stoogeSort(i=${opts.pointers?.i ?? 0}, j=${opts.pointers?.j ?? n - 1})`, params: {}, line: opts.codeLine, isCurrent: true },
        ],
        state: {
          array: elements.map((e, idx) => ({ id: e.id, value: e.value, status: statusFor(idx) })),
          pointers: opts.pointers ?? {},
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (n > 0) {
      actionType = 'INIT';
      pushFrame({
        codeLine: 1,
        explanation:
          `Stooge Sort on [${arr.join(', ')}] (${n} element(s)): recurrence T(N) = 3T(2N/3) + O(1) ≈ O(N^2.71).` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { size: n, array: `[${arr.join(', ')}]` },
        soundCue: 'start',
        pedagogy: {
          what:
            n > 1
              ? 'Stooge sort recursively fixes the first 2/3, then the last 2/3, then the first 2/3 again — three recursive calls per level.'
              : n === 1
                ? 'The array holds a single element, which is trivially sorted.'
                : 'The array is empty, so there is nothing to sort.',
          why: 'The third call is the trick: after the first two, the largest element is pushed to the end, so re-sorting the front guarantees global order.',
          whatNext: `Start with the whole range [0..${n - 1}]: compare its boundary elements first.`,
        },
        pointers: { i: 0, j: n - 1 },
      });
    } else {
      actionType = 'INIT';
      pushFrame({
        codeLine: 1,
        explanation:
          'n = length(arr) = 0: an empty range is sorted, so the recursion never starts.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { size: 0 },
        soundCue: 'start',
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'There is no boundary pair to compare and no range to trisect.',
          whatNext: 'Return the empty array immediately.',
        },
      });
      actionType = 'DONE';
      pushFrame({
        codeLine: 1,
        explanation: 'Stooge Sort complete on an empty array: 0 comparisons, 0 swaps.',
        variables: { totalSorted: 0, result: 0, calls: 0, compares: 0, swaps: 0 },
        milestone: 'Nothing to Sort',
        soundCue: 'complete',
        pedagogy: {
          what: 'The recursion body never runs for an empty range.',
          why: 'Both the boundary check and the trisection need at least two elements.',
          whatNext: 'Load a preset such as Small Array to watch the three branches.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    function stooge(i: number, j: number) {
      stats.calls += 1;
      elements[i].status = 'comparing';
      elements[j].status = 'comparing';
      actionType = 'BOUNDARY_COMPARE';

      pushFrame({
        codeLine: 2,
        explanation: `Boundary check on [${i}..${j}]: arr[${i}] = ${elements[i].value} vs arr[${j}] = ${elements[j].value} → ${elements[i].value > elements[j].value ? 'out of order, swap' : 'in order'}.`,
        variables: { i, j, valI: elements[i].value, valJ: elements[j].value },
        conditionEval: {
          expr: `arr[${i}] > arr[${j}]`,
          condition: `${elements[i].value} > ${elements[j].value}`,
          result: elements[i].value > elements[j].value,
        },
        pedagogy: {
          what: `Boundary check on [${i}..${j}]: ${elements[i].value} vs ${elements[j].value}.`,
          why: 'Making the outer pair ordered first means the later recursive passes can never break the ends.',
          whatNext:
            elements[i].value > elements[j].value
              ? 'They are out of order — swap them.'
              : 'They are already in order — no swap needed.',
        },
        statuses: { [i]: 'comparing', [j]: 'comparing' },
        pointers: { i, j },
        callStack: [{ name: `stoogeSort(i=${i}, j=${j})`, params: { i, j }, line: 2, isCurrent: true }],
      });

      if (elements[i].value > elements[j].value) {
        elements[i].status = 'swapping';
        elements[j].status = 'swapping';

        const tmp = elements[i].value;
        elements[i].value = elements[j].value;
        elements[j].value = tmp;
        stats.swaps += 1;
        actionType = 'BOUNDARY_SWAP';

        pushFrame({
          codeLine: 3,
          explanation: `Boundary swap: ${elements[j].value} ⇄ ${elements[i].value} — arr[${i}] and arr[${j}] exchanged.`,
          variables: { i, j, newValI: elements[i].value, newValJ: elements[j].value },
          pedagogy: {
            what: `The outer pair is exchanged so the range ends are ordered.`,
            why: 'A single swap here is the only write stooge sort performs before recursing — everything else is delegated.',
            whatNext: 'Recurse on the three overlapping two-thirds ranges.',
          },
          statuses: { [i]: 'swapping', [j]: 'swapping' },
          pointers: { i, j },
          callStack: [{ name: `stoogeSort(i=${i}, j=${j})`, params: { i, j }, line: 3, isCurrent: true }],
        });
      }

      elements[i].status = 'default';
      elements[j].status = 'default';

      if (j - i + 1 <= 2) {
        actionType = 'BASE_CASE';
        pushFrame({
          codeLine: 4,
          explanation: `Range [${i}..${j}] has length ${j - i + 1} ≤ 2: the boundary swap already ordered it, so no recursion is needed.`,
          variables: { i, j, length: j - i + 1 },
          conditionEval: { expr: 'j - i + 1 > 2', condition: `${j - i + 1} > 2`, result: false },
          pedagogy: {
            what: `A pair (or single element) after the boundary swap is guaranteed sorted.`,
            why: 'This is the recursion base case; the exponential branching only happens for longer ranges.',
            whatNext: 'Return to the caller and continue with its other branches.',
          },
          statuses: { [i]: 'sorted', [j]: 'sorted' },
          pointers: { i, j },
          callStack: [{ name: `stoogeSort(i=${i}, j=${j})`, params: { base: true }, line: 4, isCurrent: true }],
        });
      }

      if (j - i + 1 > 2) {
        const t = Math.floor((j - i + 1) / 3);

        // Branch 1: First 2/3
        const branchCheckpoint: PredictionCheckpoint | undefined = !branchCheckpointAdded
          ? {
              id: 'stooge-third-branch',
              question: `After branch 1 sorts only the first 2/3 of [${i}..${j}], is the whole range sorted?`,
              options: ['Yes — one recursive pass is enough', 'No — branches 2 and 3 are still required'],
              correctIndex: 1,
              explanation: `The largest value can still sit in the unsorted last third; branch 2 pushes it to the end, and branch 3 re-sorts the front to finalize order.`,
              hint: 'What about values living in the last third?',
            }
          : undefined;

        const trisectionMilestone = !firstTrisectionMilestoneUsed ? 'First Trisection' : undefined;
        if (trisectionMilestone) firstTrisectionMilestoneUsed = true;

        actionType = 'BRANCH_FIRST';
        pushFrame({
          codeLine: 6,
          explanation: `Interval length ${j - i + 1} > 2 (t=${t}). Branch 1: recursively sort the First 2/3 [${i}..${j - t}].`,
          variables: { branch: '1/3: First 2/3', range: `[${i}..${j - t}]`, t },
          pedagogy: {
            what: `Branch 1 recursively sorts the first two-thirds [${i}..${j - t}] (t = ${t}).`,
            why: 'Trisecting instead of halving is what makes the recurrence T(N) = 3T(2N/3) — correct but far slower than mergesort.',
            whatNext: `After this, branch 2 must sort the overlapping last 2/3 [${i + t}..${j}].`,
          },
          checkpoint: branchCheckpoint,
          milestone: trisectionMilestone,
          statuses: Object.fromEntries(
            elements.map((_, idx) => [idx, idx >= i && idx <= j - t ? ('active' as ElementStatus) : ('default' as ElementStatus)])
          ),
          pointers: { i, j: j - t },
          callStack: [{ name: `stoogeSort(i=${i}, j=${j - t}) [Branch 1]`, params: { i, j: j - t }, line: 6, isCurrent: true }],
        });
        if (branchCheckpoint) branchCheckpointAdded = true;
        stooge(i, j - t);

        // Branch 2: Last 2/3
        actionType = 'BRANCH_LAST';

        const overlapCheckpoint: PredictionCheckpoint | undefined = !overlapCheckpointAdded
          ? {
              id: 'stooge-why-overlap',
              question: `Branch 2 sorts [${i + t}..${j}] — the LAST two-thirds, overlapping branch 1's middle third. Why the overlap?`,
              options: [
                'To save memory by reusing the middle third',
                'So the overall maximum is guaranteed to reach index j',
              ],
              correctIndex: 1,
              explanation: `After branch 2, the largest value of [${i}..${j}] must sit at index j — that guarantee is what makes branch 3's clean-up sufficient.`,
              hint: 'Which element ends up at the right edge after sorting the last two-thirds?',
            }
          : undefined;

        pushFrame({
          codeLine: 7,
          explanation: `Branch 2: recursively sort the Last 2/3 [${i + t}..${j}] (overlaps branch 1's middle third).`,
          variables: { branch: '2/3: Last 2/3', range: `[${i + t}..${j}]`, t },
          pedagogy: {
            what: `Branch 2 sorts the overlapping last two-thirds [${i + t}..${j}].`,
            why: 'The overlap with branch 1 (the middle third) is deliberate: it lets large values migrate right while small values stay put.',
            whatNext: 'The maximum is now guaranteed at index j; branch 3 re-sorts the front to restore full order.',
          },
          checkpoint: overlapCheckpoint,
          statuses: Object.fromEntries(
            elements.map((_, idx) => [idx, idx >= i + t && idx <= j ? ('active' as ElementStatus) : ('default' as ElementStatus)])
          ),
          pointers: { i: i + t, j },
          callStack: [{ name: `stoogeSort(i=${i + t}, j=${j}) [Branch 2]`, params: { i: i + t, j }, line: 7, isCurrent: true }],
        });
        if (overlapCheckpoint) overlapCheckpointAdded = true;
        stooge(i + t, j);

        // Branch 3: First 2/3 again
        actionType = 'BRANCH_FIRST_AGAIN';
        pushFrame({
          codeLine: 8,
          explanation: `Branch 3: recursively sort the First 2/3 [${i}..${j - t}] once more to finalize ordering.`,
          variables: { branch: '3/3: First 2/3 Again', range: `[${i}..${j - t}]`, t },
          pedagogy: {
            what: `Branch 3 re-sorts the first two-thirds [${i}..${j - t}] — the famous "first 2/3 again" call.`,
            why: 'Branch 2 may have disturbed the front while moving large values right; re-sorting it costs another T(2N/3) but guarantees the invariant.',
            whatNext: `This subproblem is done: [${i}..${j}] is sorted — return to the caller.`,
          },
          statuses: Object.fromEntries(
            elements.map((_, idx) => [idx, idx >= i && idx <= j - t ? ('active' as ElementStatus) : ('default' as ElementStatus)])
          ),
          pointers: { i, j: j - t },
          callStack: [{ name: `stoogeSort(i=${i}, j=${j - t}) [Branch 3]`, params: { i, j: j - t }, line: 8, isCurrent: true }],
        });
        stooge(i, j - t);
      }
    }

    if (n > 1) {
      stooge(0, n - 1);
    }

    elements.forEach((e) => {
      e.status = 'sorted';
    });

    // Final Completion
    actionType = 'DONE';
    pushFrame({
      codeLine: 1,
      explanation: `Stooge Sort complete: [${elements.map((e) => e.value).join(', ')}] sorted after ${stats.calls} recursive call(s), ${stats.compares} comparison(s) and ${stats.swaps} swap(s) in O(N^2.71).`,
      variables: {
        totalSorted: n,
        result: n,
        calls: stats.calls,
        compares: stats.compares,
        swaps: stats.swaps,
      },
      conditionEval: { expr: 'array is sorted', condition: elements.map((e) => e.value).join(', '), result: isSorted(elements.map((e) => e.value)) },
      milestone: 'Stooge Sort Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `Final array: [${elements.map((e) => e.value).join(', ')}].`,
        why: 'The three overlapping thirds conflict heavily: the same elements get revisited T(2N/3) three times, yielding ~N^2.71 — correct, but a stress test of why smarter recursion (merge/quick) matters.',
        whatNext: 'Compare the frame count with insertion sort on the same 5 elements: stooge re-sorts the same ranges repeatedly.',
      },
      callStack: [{ name: 'complete()', params: { size: n }, line: 1, isCurrent: true }],
      statuses: Object.fromEntries(elements.map((_, idx) => [idx, 'sorted' as ElementStatus])),
      pointers: {},
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ArrayStageState>, projection: '2d' | 'isometric') => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
