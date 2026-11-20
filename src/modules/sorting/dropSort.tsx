import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [3, 1, 4, 2, 5, 3, 6];

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

export const dropSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'drop-sort',
  title: 'Drop Sort (Lossy Non-Decreasing Extraction O(N))',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1) in-place filter',
    worstCaseCondition: 'Strictly linear scan across all array elements',
  },
  theory: {
    overview:
      'Drop Sort (humorously known as Stalin Sort) is an O(N) lossy sorting algorithm. It iterates through the array and immediately drops (discards) any element that is smaller than the previous retained element, ensuring the surviving sequence is strictly non-decreasing.',
    whyItWorks:
      'By maintaining a running maximum of retained elements, every inspected element either exceeds or equals this maximum (kept) or falls below it (eliminated). The surviving array is guaranteed sorted in a single linear pass.',
    invariant:
      'Monotonic Survival Invariant: All retained elements strictly satisfy arr[k] <= arr[k+1] at all times.',
    pitfalls: [
      'Lossy algorithm: destroys elements that violate monotonic order.',
      'A strictly descending input [5, 4, 3, 2, 1] reduces to a single element [5].',
    ],
  },
  presets: [
    {
      id: 'mixed-drop',
      label: 'Mixed Array: [3, 1, 4, 2, 5, 3, 6]',
      description: 'Drops 1, 2, 3 to produce [3, 4, 5, 6]',
      data: [3, 1, 4, 2, 5, 3, 6],
    },
    {
      id: 'already-sorted',
      label: 'Already Sorted: [1, 2, 3, 4, 5]',
      description: 'Zero elements dropped; 100% survival',
      data: [1, 2, 3, 4, 5],
    },
    {
      id: 'reverse-drop',
      label: 'Worst Case Loss: [8, 7, 6, 5, 4, 3]',
      description: 'All elements except the first are dropped',
      data: [8, 7, 6, 5, 4, 3],
    },
  ],
  defaultInput: [3, 1, 4, 2, 5, 3, 6],
  codeSnippets: {
    pseudocode: `function dropSort(arr):
    result = [arr[0]]
    for i from 1 to length(arr) - 1:
        if arr[i] >= last(result):
            append arr[i] to result
    return result`,
    python: `def drop_sort(arr):
    result = [arr[0]]
    for i in range(1, len(arr)):
        if arr[i] >= result[-1]:
            result.append(arr[i])
    return result`,
    typescript: `function dropSort(arr: number[]): number[] {
  const result: number[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] >= result[result.length - 1]) {
      result.push(arr[i]); } }
  return result; }`,
    cpp: `vector<int> dropSort(const vector<int>& arr) {
    vector<int> result = {arr[0]};
    for (size_t i = 1; i < arr.size(); i++) {
        if (arr[i] >= result.back()) {
            result.push_back(arr[i]); } }
    return result; }`,
    java: `List<Integer> dropSort(int[] arr) {
    List<Integer> result = new ArrayList<>(List.of(arr[0]));
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] >= result.get(result.size() - 1)) {
            result.add(arr[i]); } }
    return result; }`,
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
    let scanCheckpointAdded = false;
    let firstDropMilestoneUsed = false;

    let actionType: 'INIT' | 'COMPARE' | 'RETAIN' | 'DROP' | 'DONE' = 'INIT';

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy?: { what: string; why: string; whatNext: string };
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<ArrayStageState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<ArrayStageState>['soundCue'];
      checkpoint?: ExecutionFrame<ArrayStageState>['checkpoint'];
      statuses?: Record<number, ElementStatus>;
      pointers?: Record<string, number>;
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
        invariantStatus: {
          label: 'every retained element is ≥ the previous retained element',
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [{ name: 'dropSort()', params: { n }, line: opts.codeLine, isCurrent: true }],
        state: {
          array: elements.map((e, idx) => ({ id: e.id, value: e.value, status: statusFor(idx) })),
          pointers: opts.pointers ?? {},
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (n > 0) {
      elements[0].status = 'sorted';
      actionType = 'INIT';
      pushFrame({
        codeLine: 2,
        explanation:
          `result = [arr[0]] = [${arr[0]}]: the first element is retained as the baseline maximum.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { index: 0, retainedMax: arr[0], survivingCount: 1 },
        pedagogy: {
          what: 'Drop sort keeps the first element, then retains only values ≥ the last kept value (a running maximum).',
          why: 'The kept subsequence is non-decreasing by construction — but it is NOT the sorted array: out-of-order elements are simply discarded, not moved.',
          whatNext: `Inspect arr[1] and decide: keep it (≥ ${arr[0]}) or drop it.`,
        },
        pointers: { current: 0 },
      });
    } else {
      actionType = 'INIT';
      pushFrame({
        codeLine: 2,
        explanation:
          'n = length(arr) = 0: the first element does not exist, so the result starts and stays empty.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        variables: { retainedMax: null, survivingCount: 0 },
        pedagogy: {
          what: 'An empty array has no first element to retain.',
          why: 'result = [arr[0]] would be undefined on an empty input — the guard exists precisely to avoid that.',
          whatNext: 'Return the empty result; nothing is inspected.',
        },
      });
      actionType = 'DONE';
      pushFrame({
        codeLine: 6,
        explanation: 'Drop Sort complete on an empty array: 0 of 0 elements survived — the result is the empty array.',
        variables: { originalCount: 0, survivingCount: 0, droppedCount: 0, result: 0 },
        milestone: 'Nothing to Sort',
        soundCue: 'complete',
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'The scan loop never runs because there is nothing after index 0.',
          whatNext: 'Load a preset such as Mixed Array to watch drops happen.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    let currentMax = arr[0];
    let surviving = 1;

    for (let i = 1; i < n; i++) {
      const val = arr[i];
      const keeps = val >= currentMax;

      elements[i].status = 'comparing';
      actionType = 'COMPARE';

      const scanCheckpoint: ExecutionFrame<ArrayStageState>['checkpoint'] | undefined =
        !scanCheckpointAdded
          ? {
              id: 'dropsort-survival',
              question: `Running maximum is ${currentMax}; the next value is ${val}. Does it survive?`,
              options: ['Yes — it is ≥ the running maximum', 'No — it gets discarded'],
              correctIndex: keeps ? 0 : 1,
              explanation: keeps
                ? `${val} ≥ ${currentMax}, so the non-decreasing chain continues.`
                : `${val} < ${currentMax}: to keep the chain monotone, the element is thrown away — losing data, which is the joke of this "sort".`,
              hint: 'Would keeping the value break the non-decreasing chain?',
            }
          : undefined;

      pushFrame({
        codeLine: 4,
        explanation: `Inspect arr[${i}] = ${val} against the retained maximum ${currentMax} → ${keeps ? 'survives' : 'drops'}.`,
        variables: { index: i, value: val, currentMax, satisfiesMonotonic: keeps ? 'YES' : 'NO' },
        conditionEval: {
          expr: `arr[${i}] >= retainedMax`,
          condition: `${val} >= ${currentMax}`,
          result: keeps,
        },
        checkpoint: scanCheckpoint,
        pedagogy: {
          what: `arr[${i}] = ${val} faces the running maximum ${currentMax}.`,
          why: 'Only values that do not break the non-decreasing chain of kept elements can survive.',
          whatNext: keeps ? `${val} stays in order — retain it.` : `${val} would break the chain — drop it entirely.`,
        },
        pointers: { current: i },
      });
      if (scanCheckpoint) scanCheckpointAdded = true;

      if (keeps) {
        currentMax = val;
        surviving++;
        elements[i].status = 'sorted';
        actionType = 'RETAIN';
        pushFrame({
          codeLine: 5,
          explanation: `arr[${i}] = ${val} ≥ the previous maximum → Retained! New maximum is ${val}. Total kept: ${surviving}.`,
          variables: { index: i, value: val, currentMax: val, totalSurviving: surviving },
          pedagogy: {
            what: `${val} is appended to the kept run; the running maximum becomes ${val}.`,
            why: 'Keeping only non-decreasing values means the result is sorted without any movement.',
            whatNext: `Continue with arr[${i + 1}] (if any).`,
          },
          pointers: { current: i },
        });
      } else {
        elements[i].status = 'discarded';
        actionType = 'DROP';
        const dropMilestone = !firstDropMilestoneUsed ? 'First Drop' : undefined;
        if (dropMilestone) firstDropMilestoneUsed = true;
        pushFrame({
          codeLine: 4,
          explanation: `arr[${i}] = ${val} < ${currentMax} → DROPPED (discarded)! Monotonic order preserved.`,
          variables: { index: i, droppedValue: val, currentMax },
          milestone: dropMilestone,
          soundCue: 'pop',
          pedagogy: {
            what: `${val} is discarded — it existed in the input but will not exist in the output.`,
            why: 'This is why drop sort is a parody: it never moves elements, it deletes the ones that are in the way.',
            whatNext: `Continue scanning; the running maximum stays ${currentMax}.`,
          },
          pointers: { current: i },
        });
      }
    }

    // Final Completion
    actionType = 'DONE';
    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 6,
      action: 'DONE',
      isMilestone: true,
      milestoneTitle: 'Drop Sort Complete',
      explanation: `Drop Sort complete! ${surviving} of ${n} elements survived in sorted order (${n - surviving} discarded).`,
      variables: {
        originalCount: n,
        survivingCount: surviving,
        droppedCount: n - surviving,
        result: surviving,
      },
      pedagogy: {
        what: `Output: [${elements.filter((e) => e.status !== 'discarded').map((e) => e.value).join(', ')}] — sorted, but ${n - surviving} of ${n} elements were deleted.`,
        why: 'The survivors were never moved; they were merely the values that happened to be in non-decreasing order already.',
        whatNext: 'Compare the output length with the input: a real sort must preserve every element.',
      },
      callStack: [{ name: 'complete()', params: { surviving }, line: 6, isCurrent: true }],
      state: {
        array: elements
          .filter((e) => e.status !== 'discarded')
          .map((e, idx) => ({ ...e, id: idx, status: 'sorted' as ElementStatus })),
        pointers: {},
      },
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
