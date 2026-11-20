import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [24, 9, 29, 14, 19, 27, 4, 30];

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

export const introsortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'introsort',
  title: 'Introsort (Hybrid Quick / Heap / Insertion Sort O(N log N))',
  category: 'sorting',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N) on sorted small inputs',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N) guaranteed by Heapsort fallback',
    spaceAuxiliary: 'O(log N) stack frames',
    worstCaseCondition: 'Degenerate Quicksort partitions trigger Heapsort cutoff',
  },
  theory: {
    overview:
      "Introsort (Introspective Sort, Musser 1997) is the production-grade hybrid sorting algorithm used in standard C++ std::sort. It combines the raw speed of Quicksort, the worst-case O(N log N) guarantee of Heapsort, and the small-array efficiency of Insertion Sort.",
    whyItWorks:
      'Quicksort performs exceptionally on average but can degrade to O(N^2) on adversarial inputs. Introsort monitors recursion depth: if depth exceeds 2 * floor(log2(N)), it preemptively aborts Quicksort and switches to Heapsort, eliminating the quadratic tail.',
    invariant:
      'Hybrid Safety Invariant: Recursion depth never exceeds 2 * log2(N); all subpartitions with <= 16 elements are sorted via cache-efficient Insertion Sort.',
    pitfalls: [
      'Forgetting the depth limit check, leaving Quicksort vulnerable to worst-case quadratic degradation.',
      'Using Heapsort for small partitions instead of Insertion Sort.',
      'The depth budget is shared: every partition spends exactly one unit, whichever side it recurses into.',
    ],
    steps: [
      'Guard: an empty or one-element array is already sorted.',
      'Dispatch order on every call: size ≤ 4 → Insertion Sort; depth exhausted → Heapsort; otherwise → Quicksort partition.',
      'The demo scales the depth limit to floor(log2(N)) so the Heapsort fallback is observable at small sizes.',
      'Each partition locks one pivot at its final rank and spends one depth unit on both children.',
      'The whole array ends up sorted with no merge step — leaves are sorted ranges.',
    ],
    watchOut: [
      'The real production bound is 2 * floor(log2(N)); this demo states the scaled limit in the INIT frame.',
      'The Heapsort fallback sorts its whole range from scratch — it is a rescue, not a continuation.',
    ],
  },
  presets: [
    {
      id: 'quicksort-ideal',
      label: 'Standard Shuffle: [24, 9, 29, 14, 19, 27, 4, 30]',
      description: 'Quicksort partitioning executes without hitting depth limit',
      data: [24, 9, 29, 14, 19, 27, 4, 30],
    },
    {
      id: 'depth-cutoff',
      label: 'Adversarial Pivot Trigger: [1, 2, 3, 4, 5, 6, 7, 8]',
      description: 'Triggers depth limit cutoff switching into Heapsort',
      data: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      id: 'small-insertion',
      label: 'Small Array (Insertion Sort Cutoff): [8, 3, 5, 1, 9]',
      description: 'Directly handled by Insertion Sort',
      data: [8, 3, 5, 1, 9],
    },
    {
      id: 'single-element',
      label: 'One Element',
      description: 'The guard skips every engine',
      data: [42],
    },
  ],
  defaultInput: [24, 9, 29, 14, 19, 27, 4, 30],
  codeSnippets: {
    pseudocode: `function introsort(arr, low, high, depthLimit):
    size = high - low + 1
    if size <= 16:
        insertionSort(arr, low, high)
        return
    if depthLimit == 0:
        heapsort(arr, low, high)
        return
    p = partition(arr, low, high)
    introsort(arr, low, p - 1, depthLimit - 1)
    introsort(arr, p + 1, high, depthLimit - 1)`,
    python: `def introsort(arr, low, high, depth_limit):
    size = high - low + 1
    if size <= 16:
        insertion_sort(arr, low, high)
        return
    if depth_limit == 0:
        heapsort(arr, low, high)
        return
    p = partition(arr, low, high)
    introsort(arr, low, p - 1, depth_limit - 1)
    introsort(arr, p + 1, high, depth_limit - 1)`,
    typescript: `function introsort(arr: number[], low: number, high: number, depthLimit: number): void {
  const size = high - low + 1;
  if (size <= 16) {
    insertionSort(arr, low, high);
    return; }
  if (depthLimit === 0) {
    heapsort(arr, low, high);
    return; }
  const p = partition(arr, low, high);
  introsort(arr, low, p - 1, depthLimit - 1);
  introsort(arr, p + 1, high, depthLimit - 1); }`,
    cpp: `void introsort(vector<int>& arr, int low, int high, int depthLimit) {
    int size = high - low + 1;
    if (size <= 16) {
        insertionSort(arr, low, high);
        return; }
    if (depthLimit == 0) {
        heapsort(arr, low, high);
        return; }
    int p = partition(arr, low, high);
    introsort(arr, low, p - 1, depthLimit - 1);
    introsort(arr, p + 1, high, depthLimit - 1); }`,
    java: `void introsort(int[] arr, int low, int high, int depthLimit) {
    int size = high - low + 1;
    if (size <= 16) {
        insertionSort(arr, low, high);
        return; }
    if (depthLimit == 0) {
        heapsort(arr, low, high);
        return; }
    int p = partition(arr, low, high);
    introsort(arr, low, p - 1, depthLimit - 1);
    introsort(arr, p + 1, high, depthLimit - 1); }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const { array, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;
    // Real Introsort aborts at 2 * floor(log2(N)) recursion depth. At the small
    // sizes used for interactive demos that bound is unreachable, so the demo
    // scales the limit to floor(log2(N)) — stated explicitly in the init frame —
    // which keeps the Heapsort fallback observable on adversarial inputs.
    const fullMaxDepth = Math.max(1, 2 * Math.floor(Math.log2(n || 1)));
    const maxDepth = Math.max(1, Math.floor(Math.log2(n || 1)));

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const stats = { compares: 0, swaps: 0, engineCalls: 0 };

    let actionType:
      | 'INIT'
      | 'INSERTION_ENTRY'
      | 'INSERTION_SHIFT'
      | 'INSERTION_DONE'
      | 'HEAPSORT_ENTRY'
      | 'HEAPSORT_SIFT'
      | 'HEAPSORT_EXTRACT'
      | 'PIVOT_SELECTED'
      | 'COMPARE'
      | 'SWAP'
      | 'PIVOT_PLACED'
      | 'CALL_LEFT'
      | 'CALL_RIGHT'
      | 'DONE' = 'INIT';
    let dispatchCheckpointAdded = false;
    let cutoffCheckpointAdded = false;
    let firstPivotMilestoneUsed = false;
    let halfMilestoneUsed = false;
    let lockedCount = 0;

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && lockedCount >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Locked';
      }
      return undefined;
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
      callStack?: any[];
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
              : `depth budget ${maxDepth} · ${lockedCount}/${n} element(s) at final ranks`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: opts.callStack ?? [
          { name: 'introsort()', params: { n, maxDepth }, line: opts.codeLine, isCurrent: true },
        ],
        state: {
          array: elements.map((e, idx) => ({ id: e.id, value: e.value, status: statusFor(idx) })),
          pointers: opts.pointers ?? {},
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 2,
      explanation:
        `Introsort on ${n} element(s): real depth limit 2 * floor(log2(${n})) = ${fullMaxDepth}, scaled to ${maxDepth} for demo sizes so the fallback is observable. Small cutoff ≤ 4 elements → Insertion Sort.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: { size: n, maxDepthLimit: maxDepth, fullMaxDepth, activeEngine: 'QUICKSORT_INITIAL' },
      soundCue: 'start',
      pedagogy: {
        what:
          n > 1
            ? `Three engines cooperate: Quicksort partitions, Insertion Sort finishes small ranges (≤ 4 here), Heapsort rescues any recursion that exhausts depth ${maxDepth}.`
            : n === 1
              ? 'The array holds a single element, which is trivially sorted.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Quicksort is fastest on average but can degrade to O(N²) on adversarial pivots; the depth counter guarantees the swap to Heapsort before that happens.',
        whatNext:
          n > 1
            ? 'Start with the whole array: size > 4 and depth > 0, so Quicksort partitions first.'
            : 'Every engine is skipped.',
      },
      pointers: { low: 0, high: n - 1 },
    });

    if (n <= 1) {
      actionType = 'DONE';
      elements.forEach((e) => {
        e.status = 'sorted';
      });
      pushFrame({
        codeLine: 1,
        explanation:
          n === 1
            ? `One element: size 1 ≤ 4 would hand it to Insertion Sort, which returns immediately — arr = [${arr[0]}] is unchanged.`
            : 'Empty array: size 0, no engine ever runs.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: { result: n, compares: 0, swaps: 0 },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'complete',
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted array by definition.' : 'An empty array is sorted by definition.',
          why: 'Every engine has a size guard; with fewer than two elements the first dispatch returns immediately.',
          whatNext: 'Load a preset such as the adversarial trigger to watch the Heapsort fallback fire.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    // Helper functions
    function insertionSortSub(low: number, high: number) {
      stats.engineCalls += 1;
      actionType = 'INSERTION_ENTRY';

      const cutoffCheckpoint: PredictionCheckpoint | undefined = !cutoffCheckpointAdded
        ? {
            id: 'introsort-size-cutoff',
            question: `Range [${low}..${high}] has size ${high - low + 1} ≤ 4. Which engine takes over now?`,
            options: [
              'Heapsort — the depth limit was hit',
              'Insertion Sort — the small-size cutoff',
              'Quicksort — another partition',
            ],
            correctIndex: 1,
            explanation: `The size guard fires before the depth guard: ranges of ${high - low + 1} element(s) are cheaper to finish with insertion sort than to recurse into.`,
            hint: 'Which engine has zero recursion overhead on tiny ranges?',
          }
        : undefined;

      pushFrame({
        codeLine: 4,
        explanation: `Subarray [${low}..${high}] has size ${high - low + 1} ≤ 4. Executing Insertion Sort.`,
        variables: { engine: 'INSERTION_SORT', range: `[${low}..${high}]` },
        checkpoint: cutoffCheckpoint,
        callStack: [{ name: `insertionSort(${low}, ${high})`, params: { low, high }, line: 4, isCurrent: true }],
        pedagogy: {
          what: `Range [${low}..${high}] has only ${high - low + 1} element(s) — below the small cutoff.`,
          why: 'For tiny ranges, insertion sort beats quicksort: it has no recursion overhead and is cache-friendly (this is why std::sort does the same).',
          whatNext: 'Insert each element into the sorted prefix one shift at a time.',
        },
        pointers: { low, high },
      });
      if (cutoffCheckpoint) cutoffCheckpointAdded = true;

      for (let i = low + 1; i <= high; i++) {
        let j = i;
        while (j > low && elements[j].value < elements[j - 1].value) {
          elements[j].status = 'swapping';
          elements[j - 1].status = 'swapping';

          const tmp = elements[j].value;
          elements[j].value = elements[j - 1].value;
          elements[j - 1].value = tmp;
          stats.swaps += 1;

          actionType = 'INSERTION_SHIFT';
          pushFrame({
            codeLine: 4,
            explanation: `Insertion shift: ${elements[j - 1].value} moves one slot left past ${tmp}.`,
            variables: { i, j, value: elements[j - 1].value },
            callStack: [{ name: `insertionShift(${j})`, params: { j }, line: 4, isCurrent: true }],
            pedagogy: {
              what: `${tmp} slides one slot right; the element below it re-inserts into the sorted prefix.`,
              why: 'Shifting within the small range is what makes insertion sort cheaper than recursing here.',
              whatNext: 'Keep shifting until the element finds its place in the prefix.',
            },
            pointers: { pos: j },
          });

          elements[j].status = 'default';
          elements[j - 1].status = 'default';
          j--;
        }
      }

      for (let k = low; k <= high; k++) {
        elements[k].status = 'sorted';
      }
      lockedCount += high - low + 1;

      actionType = 'INSERTION_DONE';
      pushFrame({
        codeLine: 4,
        explanation: `Insertion Sort finished: range [${low}..${high}] is now fully sorted (${lockedCount}/${n} placed).`,
        soundCue: 'sorted',
        variables: { engine: 'INSERTION_SORT', range: `[${low}..${high}]`, sortedCount: high - low + 1 },
        callStack: [{ name: `insertionSort(${low}, ${high})`, params: { done: true }, line: 4, isCurrent: true }],
        pedagogy: {
          what: `Every element of [${low}..${high}] is in order — this leaf of the recursion tree is complete.`,
          why: 'Because introsort only hands sorted subranges back, the parent partition ranges merge trivially (no merge step needed).',
          whatNext: 'Return to the caller; the sibling range (if any) continues independently.',
        },
        pointers: { low, high },
      });
    }

    function heapsortSub(low: number, high: number) {
      const len = high - low + 1;
      stats.engineCalls += 1;
      actionType = 'HEAPSORT_ENTRY';
      pushFrame({
        codeLine: 7,
        explanation: `DEPTH LIMIT HIT (0 remaining)! Aborting Quicksort recursion. Switching to Heapsort for guaranteed O(N log N) on [${low}..${high}].`,
        milestone: 'Heapsort Fallback Triggered',
        soundCue: 'compare',
        variables: { engine: 'HEAPSORT_FALLBACK', range: `[${low}..${high}]`, reason: 'AVOID_QUADRATIC_DEGRADATION' },
        pedagogy: {
          what: `This recursion path has consumed its entire depth budget on a range still larger than the cutoff.`,
          why: 'Deep unbalanced partitions are the signature of adversarial pivots (e.g. sorted input with last-element pivot) — continuing would risk O(N²).',
          whatNext: `Hand [${low}..${high}] to Heapsort: build a max-heap, then extract maxima — guaranteed O(N log N) regardless of data.`,
        },
        callStack: [{ name: `heapsort(${low}, ${high})`, params: { low, high }, line: 7, isCurrent: true }],
        statuses: Object.fromEntries(
          elements.map((_, idx) => [idx, idx >= low && idx <= high ? ('active' as ElementStatus) : ('default' as ElementStatus)])
        ),
        pointers: { heapLow: low, heapHigh: high },
      });

      function siftDown(rootOffset: number, endOffset: number) {
        let root = rootOffset;
        while (root * 2 + 1 <= endOffset) {
          const leftChild = root * 2 + 1;
          let swapIdx = root;

          if (elements[low + swapIdx].value < elements[low + leftChild].value) {
            swapIdx = leftChild;
          }
          if (
            leftChild + 1 <= endOffset &&
            elements[low + swapIdx].value < elements[low + leftChild + 1].value
          ) {
            swapIdx = leftChild + 1;
          }
          if (swapIdx === root) return;

          const pIdx = low + root;
          const cIdx = low + swapIdx;
          elements[pIdx].status = 'swapping';
          elements[cIdx].status = 'swapping';

          const tmp = elements[pIdx].value;
          elements[pIdx].value = elements[cIdx].value;
          elements[cIdx].value = tmp;
          stats.swaps += 1;

          actionType = 'HEAPSORT_SIFT';
          pushFrame({
            codeLine: 7,
            explanation: `Heapsort siftDown on [${low}..${low + endOffset}]: parent arr[${pIdx}]=${tmp} swaps with larger child arr[${cIdx}]=${elements[pIdx].value}.`,
            soundCue: 'swap',
            variables: { engine: 'HEAPSORT_SIFT', parentIdx: pIdx, childIdx: cIdx },
            pedagogy: {
              what: `Inside the fallback heap, the larger child at [${cIdx}] moved up over its parent at [${pIdx}].`,
              why: 'Sift-down restores the max-heap property after the root was extracted — the invariant heapsort relies on.',
              whatNext: 'Continue sifting down the same path if a child is still larger.',
            },
            callStack: [{ name: `siftDown(${pIdx}, ${cIdx})`, params: { pIdx, cIdx }, line: 7, isCurrent: true }],
            pointers: { parent: pIdx, child: cIdx },
          });

          elements[pIdx].status = 'default';
          elements[cIdx].status = 'default';
          root = swapIdx;
        }
      }

      // Build max-heap over [low..high]
      for (let start = Math.floor((len - 2) / 2); start >= 0; start--) {
        siftDown(start, len - 1);
      }

      // Extract max elements one by one
      for (let end = len - 1; end > 0; end--) {
        const maxIdx = low;
        const targetIdx = low + end;
        const maxVal = elements[maxIdx].value;
        elements[maxIdx].value = elements[targetIdx].value;
        elements[targetIdx].value = maxVal;
        elements[targetIdx].status = 'sorted';
        lockedCount += 1;

        actionType = 'HEAPSORT_EXTRACT';
        pushFrame({
          codeLine: 7,
          explanation: `Heapsort extractMax: heap root ${maxVal} locked into sorted slot [${targetIdx}] (${lockedCount}/${n} placed).`,
          soundCue: 'sorted',
          variables: { engine: 'HEAPSORT_EXTRACT', extractedMax: maxVal, sortedIdx: targetIdx },
          pedagogy: {
            what: `The heap's root — the current maximum ${maxVal} — is locked at the right edge of this fallback range.`,
            why: 'Repeated extraction builds the sorted suffix from the largest down, all in O(log N) per element.',
            whatNext: `Shrink the heap and sift-down the new root again.`,
          },
          callStack: [{ name: `extractMax(${targetIdx})`, params: { maxVal, targetIdx }, line: 7, isCurrent: true }],
          pointers: { root: low, sorted: targetIdx },
        });

        siftDown(0, end - 1);
      }
      elements[low].status = 'sorted';
    }

    function intro(low: number, high: number, depth: number) {
      if (low >= high) {
        if (low === high) {
          elements[low].status = 'sorted';
          lockedCount += 1;
        }
        return;
      }

      const size = high - low + 1;
      if (size <= 4) {
        insertionSortSub(low, high);
        return;
      }

      if (depth <= 0) {
        heapsortSub(low, high);
        return;
      }

      // Quicksort partition
      const pivotVal = elements[high].value;
      elements[high].status = 'pivot';

      const dispatchCheckpoint: PredictionCheckpoint | undefined = !dispatchCheckpointAdded
        ? {
            id: 'introsort-engine-dispatch',
            question: `Call on [${low}..${high}]: size ${high - low + 1} > 4 and depth left ${depth} > 0. Which engine handles it?`,
            options: [
              'Quicksort partition (neither fallback applies)',
              'Heapsort (depth exhausted)',
            ],
            correctIndex: 0,
            explanation:
              'Only when size ≤ 4 does insertion take over, and only when depth reaches 0 does heapsort; here depth ' +
              depth +
              ' > 0, so quicksort partitions.',
            hint: 'Check the two guards in order: size first, then depth.',
          }
        : undefined;

      actionType = 'PIVOT_SELECTED';
      pushFrame({
        codeLine: 9,
        explanation: `Quicksort step on [${low}..${high}] (depth=${depth}): Pivot = ${pivotVal} at index ${high}.`,
        soundCue: 'compare',
        variables: { low, high, pivot: pivotVal, remainingDepth: depth },
        checkpoint: dispatchCheckpoint,
        pedagogy: {
          what: `Range [${low}..${high}] has size ${high - low + 1} > 4 and depth ${depth} > 0, so Quicksort partitions around pivot ${pivotVal}.`,
          why: 'This dispatch order is the "introspective" part: small → insertion, exhausted depth → heapsort, otherwise quicksort.',
          whatNext: `Scan the range: values < ${pivotVal} move left of the boundary, then the pivot locks into its final rank.`,
        },
        callStack: [{ name: `partition(low=${low}, high=${high})`, params: { pivotVal, depth }, line: 9, isCurrent: true }],
        pointers: { low, high, pivot: high },
      });
      if (dispatchCheckpoint) dispatchCheckpointAdded = true;

      let i = low;
      for (let j = low; j < high; j++) {
        const curVal = elements[j].value;
        const isLess = curVal < pivotVal;
        elements[j].status = 'comparing';
        stats.compares += 1;

        actionType = 'COMPARE';
        pushFrame({
          codeLine: 9,
          explanation: `Compare arr[${j}] = ${curVal} against pivot ${pivotVal}: ${curVal} ${isLess ? '<' : '>='} ${pivotVal}.`,
          soundCue: 'compare',
          variables: { low, high, i, j, 'arr[j]': curVal, pivot: pivotVal },
          conditionEval: {
            expr: `arr[${j}] < pivot`,
            condition: `${curVal} < ${pivotVal}`,
            result: isLess,
          },
          pedagogy: {
            what: `Candidate arr[${j}] = ${curVal} faces pivot ${pivotVal}.`,
            why: 'Only values strictly smaller than the pivot belong on its left side; equal values stay put to keep this partition scheme simple.',
            whatNext: isLess
              ? `It belongs left: swap into boundary slot ${i} and advance i.`
              : 'It belongs right: leave it and keep scanning.',
          },
          callStack: [{ name: `partition(${low}, ${high})`, params: { i, j, pivotVal }, line: 9, isCurrent: true }],
          pointers: { i, j, pivot: high },
        });

        if (isLess) {
          if (i !== j) {
            const tmp = elements[i].value;
            elements[i].value = elements[j].value;
            elements[j].value = tmp;
            elements[i].status = 'swapping';
            elements[j].status = 'swapping';
            stats.swaps += 1;

            actionType = 'SWAP';
            pushFrame({
              codeLine: 9,
              explanation: `Swap arr[${i}] (${tmp}) ⇄ arr[${j}] (${elements[i].value}) into the left partition; boundary i → ${i + 1}.`,
              soundCue: 'swap',
              variables: { i, j, swappedLeft: elements[i].value, swappedRight: tmp, pivot: pivotVal },
              pedagogy: {
                what: `${elements[i].value} crossed into the left region while ${tmp} moved right of the boundary.`,
                why: 'Swapping (not shifting) keeps the partition single-pass and lets any out-of-place element cross in O(1).',
                whatNext: `Boundary moves to i = ${i + 1}; continue scanning j = ${j + 1}.`,
              },
              callStack: [{ name: `swap(${i}, ${j})`, params: { i, j }, line: 9, isCurrent: true }],
              pointers: { i, j, pivot: high },
            });
            elements[i].status = 'default';
          }
          i++;
        }
        elements[j].status = 'default';
      }

      // Swap pivot into place
      const displaced = elements[i].value;
      elements[i].value = elements[high].value;
      elements[high].value = displaced;
      elements[i].status = 'sorted';
      elements[high].status = 'default';
      lockedCount += 1;

      actionType = 'PIVOT_PLACED';
      const pivotMilestone = !firstPivotMilestoneUsed
        ? 'First Pivot Locked'
        : maybeHalfMilestone();
      if (pivotMilestone) firstPivotMilestoneUsed = true;

      pushFrame({
        codeLine: 9,
        explanation: `Pivot ${pivotVal} locked into final sorted index ${i} (${lockedCount}/${n} placed). Both children get depth=${depth - 1}.`,
        milestone: pivotMilestone,
        soundCue: 'sorted',
        variables: { pivotIndex: i, leftPart: `[${low}..${i - 1}]`, rightPart: `[${i + 1}..${high}]`, nextDepth: depth - 1 },
        conditionEval: { expr: 'pivot placed at rank i', condition: `${pivotVal} @ [${i}]`, result: true },
        pedagogy: {
          what: `Pivot ${pivotVal} is at rank ${i} forever; left range [${low}..${i - 1}] and right range [${i + 1}..${high}] remain.`,
          why: `Both children get depth ${depth - 1}: every partition spends exactly one unit of the depth budget — that meter is what triggers the heapsort safety net.`,
          whatNext: `Recurse left first, then right (depth ${depth - 1} each).`,
        },
        callStack: [{ name: `pivotPlaced(${i})`, params: { i }, line: 9, isCurrent: true }],
        pointers: { pivot: i },
      });

      actionType = 'CALL_LEFT';
      pushFrame({
        codeLine: 10,
        explanation:
          low <= i - 1
            ? `Recurse on the left range [${low}..${i - 1}] with depth ${depth - 1}.`
            : `The left range [${low}..${i - 1}] is empty — the call returns immediately.`,
        variables: { left: `[${low}..${i - 1}]`, nextDepth: depth - 1 },
        pedagogy: {
          what: 'The left recursive call is issued first.',
          why: 'Depth-first left-right order keeps the trace predictable; both calls share the same reduced depth budget.',
          whatNext: 'Watch the left range dispatched to whichever engine applies.',
        },
        callStack: [{ name: `introsort(${low}, ${i - 1})`, params: { depth: depth - 1 }, line: 10, isCurrent: true }],
        pointers: { low, high: i - 1 },
      });
      intro(low, i - 1, depth - 1);

      actionType = 'CALL_RIGHT';
      pushFrame({
        codeLine: 11,
        explanation:
          i + 1 <= high
            ? `Left range done. Recurse on the right range [${i + 1}..${high}] with depth ${depth - 1}.`
            : `The right range [${i + 1}..${high}] is empty — the call returns immediately.`,
        variables: { right: `[${i + 1}..${high}]`, nextDepth: depth - 1 },
        pedagogy: {
          what: 'The right recursive call starts after the left one fully returns.',
          why: 'The two subranges are independent; the pivot between them never moves again.',
          whatNext: 'Watch the right range dispatched, then this partition is complete.',
        },
        callStack: [{ name: `introsort(${i + 1}, ${high})`, params: { depth: depth - 1 }, line: 11, isCurrent: true }],
        pointers: { low: i + 1, high },
      });
      intro(i + 1, high, depth - 1);
    }

    intro(0, n - 1, maxDepth);

    elements.forEach((e) => {
      e.status = 'sorted';
    });

    // Final Completion
    actionType = 'DONE';
    pushFrame({
      codeLine: 1,
      explanation: `Introsort complete: [${elements.map((e) => e.value).join(', ')}] sorted in guaranteed O(N log N) after ${stats.engineCalls} engine call(s), ${stats.compares} comparison(s) and ${stats.swaps} swap(s).`,
      variables: {
        totalElements: n,
        result: n,
        engineCalls: stats.engineCalls,
        compares: stats.compares,
        swaps: stats.swaps,
      },
      conditionEval: { expr: 'array is sorted', condition: elements.map((e) => e.value).join(', '), result: isSorted(elements.map((e) => e.value)) },
      milestone: 'Introsort Complete',
      pedagogy: {
        what: `Final array: [${elements.map((e) => e.value).join(', ')}].`,
        why: 'Each engine contributed its strength: quicksort divided fast, insertion sort finished the small leaves cheaply, and the depth meter guaranteed no quadratic tail existed.',
        whatNext: 'Try the adversarial presets: sorted input with last-element pivots is exactly what fires the heapsort fallback.',
      },
      callStack: [{ name: 'complete()', params: { n }, line: 1, isCurrent: true }],
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
