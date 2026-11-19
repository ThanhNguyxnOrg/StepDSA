import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

/**
 * Shellsort, rebuilt to the StepDSA teaching standard:
 * - one meaningful operation per frame (pass start → pickup → guard (both
 *   outcomes) → shift → cursor → insert → pass end → done),
 * - WHAT/WHY/NEXT pedagogy on every frame,
 * - two prediction checkpoints and real milestones (no per-pass noise beyond
 *   the genuine h-sorted turning points),
 * - five language snippets that share the exact same statement per line, and
 * - honest input normalisation reported in the INIT frame.
 */

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [62, 83, 18, 53, 7, 17, 95, 22, 47, 34];

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

export const shellsortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'shellsort',
  title: 'Shellsort (Diminishing Increment Gap Sort)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N^(4/3))',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Adversarial inputs with Shell original powers-of-two gap sequence',
  },
  theory: {
    overview:
      'Shellsort is an optimization over Insertion Sort that compares and swaps elements separated by a diminishing gap sequence. By moving elements across large distances early, it eliminates long-distance inversions in few operations.',
    whyItWorks:
      "Insertion sort performs poorly when small elements are far to the right, requiring O(N) shifts each. By first sorting sub-sequences separated by gap h, the array becomes 'h-sorted'. Subsequent passes with smaller gaps preserve this property while requiring very few shifts. The final pass (gap=1) is standard insertion sort running on nearly sorted data (O(N)).",
    invariant:
      'After completing a pass with gap h, the array is h-sorted: arr[i] <= arr[i + h] for all valid i.',
    pitfalls: [
      'Choosing a poor gap sequence can lead to O(N²) worst-case runtime (e.g. powers of 2).',
      'Confusing the inner gap-insertion loop index boundaries.',
      'Each pass insertion-sorts gap independent chains; the held key only ever moves within its own chain.',
    ],
    steps: [
      'Guard: an empty or one-element array is already sorted.',
      'Start with gap = floor(n / 2) and halve it after every pass.',
      'Each pass insertion-sorts the gap interleaved chains: pick up arr[i] as the held key.',
      'Shift chain partners that are bigger than the key right by gap; drop the key into the free slot.',
      'The final gap-1 pass is ordinary insertion sort on a nearly sorted array.',
    ],
    watchOut: [
      'The scan steps by gap, not by 1 — j - gap is the chain partner, not the neighbour.',
      'A pass never swaps: it shifts copies right and writes the held key once.',
    ],
  },
  presets: [
    {
      id: 'random',
      label: 'Random Array',
      description: 'Shuffled array of 10 elements',
      data: [62, 83, 18, 53, 7, 17, 95, 22, 47, 34],
    },
    {
      id: 'reversed',
      label: 'Reversed Array',
      description: 'Worst-case inversion profile',
      data: [90, 80, 70, 60, 50, 40, 30, 20, 10],
    },
    {
      id: 'nearly-sorted',
      label: 'Nearly Sorted',
      description: 'Quickly verified with large gap',
      data: [10, 15, 25, 20, 35, 30, 45, 40, 50],
    },
    {
      id: 'single-element',
      label: 'One Element',
      description: 'The gap loop never runs',
      data: [42],
    },
  ],
  defaultInput: [62, 83, 18, 53, 7, 17, 95, 22, 47, 34],
  codeSnippets: {
    python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`,
    typescript: `function shellSort(arr: number[]): number[] {
  const n = arr.length;
  let gap = Math.floor(n / 2);
  while (gap > 0) {
    for (let i = gap; i < n; ++i) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap; }
      arr[j] = temp; }
    gap = Math.floor(gap / 2); }
  return arr; }`,
    cpp: `vector<int> shellSort(vector<int>& arr) {
    int n = arr.size();
    int gap = n / 2;
    while (gap > 0) {
        for (int i = gap; i < n; ++i) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap; }
            arr[j] = temp; }
        gap /= 2; }
    return arr; }`,
    java: `int[] shellSort(int[] arr) {
    int n = arr.length;
    int gap = n / 2;
    while (gap > 0) {
        for (int i = gap; i < n; ++i) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap; }
            arr[j] = temp; }
        gap /= 2; }
    return arr; }`,
    pseudocode: `function shellSort(arr):
    n = length(arr)
    gap = floor(n / 2)
    while gap > 0:
        for i from gap to n - 1:
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j = j - gap
            arr[j] = temp
        gap = floor(gap / 2)
    return arr`,
  },
  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const { array, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;
    let gap = Math.floor(n / 2);
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const stats = { pickups: 0, comparisons: 0, shifts: 0, passes: 0 };

    let phase: 'init' | 'pass' | 'done' = 'init';
    let actionType:
      | 'INIT'
      | 'PASS_START'
      | 'PICKUP'
      | 'GUARD'
      | 'SHIFT'
      | 'CURSOR'
      | 'INSERT'
      | 'PASS_END'
      | 'DONE' = 'INIT';
    let guardCheckpointAdded = false;
    let halvingCheckpointAdded = false;

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
          swaps: stats.shifts + stats.pickups,
          accesses: stats.comparisons * 2 + stats.shifts * 2 + stats.pickups * 2,
          lookups: 0,
        },
        invariantStatus: {
          label:
            phase === 'done'
              ? 'the whole array is sorted'
              : stats.passes === 0
                ? 'no pass completed yet'
                : `the array is ${Math.min(MAX_LEN, 1 << (stats.passes - 1)) === 1 ? 1 : 'partially'} gap-sorted after ${stats.passes} pass(es)`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [{ name: 'shellSort', params: { n, gap }, line: opts.codeLine, isCurrent: true }],
        state: opts.state,
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 3,
      explanation:
        `n = length(arr) = ${n}, so the gap sequence starts at floor(${n} / 2) = ${gap} and halves each pass.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'n > 1', condition: `${n} > 1`, result: n > 1 },
      variables: { n, gap },
      soundCue: 'start',
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: n > 1 ? { gap } : {},
      },
      pedagogy: {
        what:
          n > 1
            ? `The gap sequence starts at floor(n / 2) = ${gap} and halves each pass: ${gap} → ${Math.max(1, Math.floor(gap / 2))} → … → 1.`
            : n === 1
              ? 'The array holds a single element, which is trivially sorted.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Large gaps move far-away elements long distances cheaply; each later pass only needs small, local fixes.',
        whatNext:
          n > 1
            ? `Pass 1: insertion-sort every chain of indices separated by gap = ${gap}.`
            : 'The gap loop never runs.',
      },
    });

    if (n <= 1) {
      phase = 'done';
      actionType = 'DONE';
      pushFrame({
        codeLine: 13,
        explanation:
          n === 1
            ? `One element: the initial gap floor(1 / 2) = 0 ends the loop before any pass, so arr = [${arr[0]}] is returned unchanged.`
            : 'Empty array: the initial gap is 0, so the gap loop never runs.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: { result: n, gap: 0, passes: 0 },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'complete',
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
          pointers: {},
        },
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted array by definition.' : 'An empty array is sorted by definition.',
          why: 'The gap loop only runs while gap > 0; with fewer than two elements the first gap is already 0.',
          whatNext: 'Load a preset such as Random Array to watch the gap passes run.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    phase = 'pass';

    while (gap > 0) {
      stats.passes += 1;
      actionType = 'PASS_START';
      pushFrame({
        codeLine: 4,
        explanation: `Starting the pass with gap = ${gap}: elements separated by ${gap} positions are compared and sorted as ${gap} interleaved chains.`,
        conditionEval: { expr: 'gap > 0', condition: `${gap} > 0`, result: true },
        variables: { gap, n },
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
          pointers: { gap },
        },
        pedagogy: {
          what: `This pass treats the array as ${gap} interleaved chains: indices (0, ${gap}, ${2 * gap}, …), (1, ${gap + 1}, …), …`,
          why: 'Each chain is insertion-sorted independently; the array becomes "gap-sorted", which never destroys earlier passes.',
          whatNext: `Pick up each chain element arr[i] (i = ${gap}…${n - 1}) as the held key temp and shift bigger partners right by ${gap}.`,
        },
      });

      for (let i = gap; i < n; ++i) {
        const temp = arr[i];
        let j = i;

        // All indices reachable from i by stepping -gap form one insertion chain.
        const chainIndices = new Set<number>();
        for (let chainIdx = i; chainIdx >= 0; chainIdx -= gap) chainIndices.add(chainIdx);

        const heldKey = {
          type: 'value' as const,
          name: 'temp',
          data: temp,
          note: `Held element from index ${i}. Its slot is logically empty while partners shift right by ${gap}.`,
        };

        const chainStatuses = (extra: Record<number, ElementStatus> = {}) => {
          const statuses: Record<number, ElementStatus> = {};
          chainIndices.forEach((chainIdx) => {
            statuses[chainIdx] = 'selected';
          });
          return { ...statuses, ...extra };
        };

        const arrayWith = (extra: Record<number, ElementStatus> = {}) => {
          const statuses = chainStatuses(extra);
          return arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: statuses[idx] ?? 'default',
          }));
        };

        // Pickup: the held key leaves the array into the auxiliary slot.
        stats.pickups += 1;
        actionType = 'PICKUP';
        pushFrame({
          codeLine: 6,
          explanation: `Pick up the held key: temp = arr[${i}] = ${temp}. Slot [${i}] is now logically empty for shifting.`,
          soundCue: 'select',
          variables: { gap, i, temp },
          conditionEval: { expr: 'i < n', condition: `${i} < ${n}`, result: true },
          pedagogy: {
            what: `${temp} is lifted out of index ${i}; the chain [${[...chainIndices].sort((a, b) => a - b).join(', ')}] will absorb it at the right slot.`,
            why: 'Holding the key aside is what makes the shifts non-destructive — no value is ever overwritten while moving.',
            whatNext: `Compare temp ${temp} against its chain partner at index ${i - gap} (distance gap = ${gap}).`,
          },
          state: {
            array: arrayWith({ [i]: 'active' }),
            pointers: { i, gap },
            auxiliary: heldKey,
          },
        });

        // Shift loop with explicit guard frames (both outcomes visible).
        for (;;) {
          const hasRoom = j >= gap;
          const parentVal = hasRoom ? arr[j - gap] : null;
          const willShift = hasRoom && (parentVal as number) > temp;
          stats.comparisons += 1;

          const guardCheckpoint: PredictionCheckpoint | undefined = !guardCheckpointAdded
            ? {
                id: 'shellsort-first-guard',
                question: `Held key temp = ${temp}; chain partner arr[${j - gap}] = ${parentVal}. Does the partner shift right by gap = ${gap}?`,
                options: ['Yes — partner is bigger', 'No — held key already fits'],
                correctIndex: willShift ? 0 : 1,
                explanation: willShift
                  ? `${parentVal} > ${temp}, so slot [${j}] is filled by the partner and the scan continues left.`
                  : `${parentVal} ≤ ${temp}, so the held key belongs at slot [${j}].`,
                hint: 'Only a partner greater than the key may slide right.',
              }
            : undefined;

          actionType = 'GUARD';
          pushFrame({
            codeLine: 8,
            explanation: hasRoom
              ? `${parentVal} vs held key ${temp}: ${willShift ? 'partner is bigger — shift it right by gap.' : 'held key fits here — stop shifting.'}`
              : `j = ${j} is smaller than gap = ${gap}: the start of this chain is reached.`,
            soundCue: 'compare',
            variables: { gap, j, temp, 'arr[j-gap]': parentVal },
            conditionEval: hasRoom
              ? {
                  expr: `j >= ${gap} && arr[${j - gap}] > temp`,
                  condition: `${parentVal} > ${temp}`,
                  result: willShift,
                }
              : { expr: 'j >= gap', condition: `${j} < ${gap}`, result: false },
            pedagogy: {
              what: hasRoom
                ? `The chain partner arr[${j - gap}] = ${parentVal} faces the held key ${temp}.`
                : `No partner exists at j - gap = ${j - gap} < 0; this chain is exhausted.`,
              why: 'Only partners greater than the held key may slide right; the first smaller partner marks the insertion slot.',
              whatNext: willShift
                ? `Shift ${parentVal} right into slot [${j}], then keep scanning left.`
                : `Drop the held key ${temp} into slot [${j}].`,
            },
            checkpoint: guardCheckpoint,
            state: {
              array: arrayWith(
                hasRoom ? { [j]: 'comparing', [j - gap]: 'comparing' } : { [j]: 'comparing' }
              ),
              pointers: hasRoom ? { j, 'j-gap': j - gap, gap } : { j, gap },
              auxiliary: heldKey,
            },
          });
          if (guardCheckpoint) guardCheckpointAdded = true;

          if (!willShift) break;

          const shiftedVal = arr[j - gap];
          arr[j] = shiftedVal;
          stats.shifts += 1;
          actionType = 'SHIFT';
          pushFrame({
            codeLine: 9,
            explanation: `Shift: arr[${j - gap}] (${shiftedVal}) moves right by gap into slot [${j}].`,
            soundCue: 'swap',
            variables: { gap, j, shiftedVal, temp },
            pedagogy: {
              what: `${shiftedVal} slides ${gap} slot(s) right; one position of the chain is now free further left.`,
              why: 'Shifting instead of swapping halves the writes: each value moves once, the held key moves once.',
              whatNext: `Advance the cursor left: j = j - gap = ${j - gap}.`,
            },
            state: {
              array: arrayWith({ [j]: 'swapping', [j - gap]: 'swapping' }),
              pointers: { j, 'j-gap': j - gap, gap },
              auxiliary: heldKey,
            },
          });

          j -= gap;
          actionType = 'CURSOR';
          pushFrame({
            codeLine: 10,
            explanation: `Cursor moves left by one gap: j = ${j}. Continue checking within the same chain.`,
            variables: { gap, j, temp },
            conditionEval: { expr: 'j = j - gap', condition: `${j}`, result: true },
            pedagogy: {
              what: `j steps back to ${j}; the scan continues along the same gap chain.`,
              why: 'The chain is being insertion-sorted, so earlier partners must also be checked against the held key.',
              whatNext: j >= gap ? `Compare the next partner arr[${j - gap}].` : 'The chain start is reached.',
            },
            state: {
              array: arrayWith({ [j]: 'comparing' }),
              pointers: { j, gap },
              auxiliary: heldKey,
            },
          });
        }

        arr[j] = temp;
        actionType = 'INSERT';
        pushFrame({
          codeLine: 11,
          explanation: `Place the held key: arr[${j}] = temp = ${temp}.`,
          variables: { gap, i, j, insertedVal: temp },
          conditionEval: { expr: 'arr[j] = temp', condition: `${temp} @ [${j}]`, result: true },
          pedagogy: {
            what: `${temp} lands at slot [${j}] — the first position in the chain where it is ≥ its left partner.`,
            why: 'Because every bigger partner already moved right, the chain from here on is locally sorted (gap-sorted).',
            whatNext:
              i < n - 1
                ? `Pick up the next chain element arr[${i + 1}].`
                : `The pass for gap = ${gap} is complete.`,
          },
          state: {
            array: arrayWith({ [j]: 'pivot' }),
            pointers: { j, gap },
            auxiliary: {
              ...heldKey,
              note: `Inserted at index ${j}; the auxiliary slot is free again.`,
            },
          },
        });
      }

      actionType = 'PASS_END';
      const nextGap = Math.floor(gap / 2);

      const halvingCheckpoint: PredictionCheckpoint | undefined = !halvingCheckpointAdded
        ? {
            id: 'shellsort-gap-halving',
            question: `The gap = ${gap} pass is complete. What gap does the next pass use?`,
            options: [
              `gap = ${gap} - 1 = ${gap - 1}`,
              `gap = floor(${gap} / 2) = ${nextGap}`,
              'gap = 1 immediately',
            ],
            correctIndex: 1,
            explanation: `Shell's original sequence halves the gap: the next pass sorts chains of stride ${nextGap}.`,
            hint: 'The gap sequence divides, it does not decrement.',
          }
        : undefined;

      pushFrame({
        codeLine: 12,
        explanation: `Completed pass for gap = ${gap}. Array is now ${gap}-sorted. Halving gap to ${nextGap}.`,
        milestone: `Gap ${gap} Pass Sorted`,
        variables: { completedGap: gap, nextGap },
        conditionEval: { expr: 'nextGap > 0', condition: `${nextGap} > 0`, result: nextGap > 0 },
        checkpoint: halvingCheckpoint,
        pedagogy: {
          what: `Every chain of stride ${gap} is now ordered; the array is ${gap}-sorted.`,
          why: 'Gap-sortedness is not full sortedness, but it guarantees elements are close to their final place, so later small-gap passes do little work.',
          whatNext:
            nextGap > 0
              ? `Halve the gap to ${nextGap} and repeat with shorter strides.`
              : 'The final gap-1 pass is ordinary insertion sort on a nearly sorted array.',
        },
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
          pointers: { prevGap: gap },
        },
      });
      if (halvingCheckpoint) halvingCheckpointAdded = true;

      gap = nextGap;
    }

    phase = 'done';
    actionType = 'DONE';
    pushFrame({
      codeLine: 13,
      explanation: `Shellsort complete: [${arr.join(', ')}] is sorted after ${stats.passes} pass(es), ${stats.pickups} pickup(s), ${stats.comparisons} comparison(s) and ${stats.shifts} shift(s).`,
      variables: {
        result: n,
        gap: 0,
        passes: stats.passes,
        pickups: stats.pickups,
        comparisons: stats.comparisons,
        shifts: stats.shifts,
      },
      conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: isSorted(arr) },
      milestone: 'Shellsort Completed',
      soundCue: 'complete',
      pedagogy: {
        what: `Final array: [${arr.join(', ')}] — sorted after gap passes ${Math.floor(n / 2)} → … → 1.`,
        why: 'The gap-1 pass is insertion sort, whose O(N²) worst case collapses to O(N) when the input is nearly sorted — exactly what the bigger gaps arranged.',
        whatNext: 'Compare with plain insertion sort on the same input: far fewer shifts happen here.',
      },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
