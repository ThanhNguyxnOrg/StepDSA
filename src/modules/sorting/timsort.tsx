import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [1, 2, 8, 7, 6, 3, 4, 9];

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

export const timsortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'timsort',
  title: 'Timsort (Adaptive Natural Run Merging O(N log N))',
  category: 'sorting',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N) on already sorted or partially sorted arrays',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N) run merge buffers',
    worstCaseCondition: 'Adversarial run distributions requiring balanced 2-way merges',
  },
  theory: {
    overview:
      "Timsort (Tim Peters, 2002) is the standard sorting algorithm in Python (list.sort) and Java (Arrays.sort for objects). It is an adaptive, stable hybrid derived from Mergesort and Insertion Sort, engineered to exploit existing ordered sequences ('natural runs') in real-world data.",
    whyItWorks:
      'Real-world data is frequently partially sorted. Timsort scans for contiguous non-decreasing or strictly decreasing segments (reversing descending runs). Short runs are extended to a minimum run size (minrun) via Binary Insertion Sort, then pushed onto a stack and merged according to strict invariant rules.',
    invariant:
      'Stack Balance Invariant: For the top three runs on the stack (A, B, C): |A| > |B| + |C| and |B| > |C|, ensuring balanced logarithmic merge passes.',
    pitfalls: [
      'Unstable merge logic breaking element ties.',
      'Stack overflow bugs if the merge invariant checks allow disproportionately skewed run stacks.',
      'Only strictly descending runs may be reversed — equal neighbours would flip the tie order and break stability.',
    ],
    steps: [
      'Guard: an empty or one-element array is already sorted.',
      'Scan for the next natural run (ascending, or strictly descending which gets reversed).',
      'Extend short runs to minrun with binary insertion sort, then push every run onto the stack.',
      'Merge adjacent runs two at a time until one run spans the whole array.',
      'Ties in a merge go to the left run — that is the stability guarantee.',
    ],
    watchOut: [
      'Natural runs are found, not created: longer runs cost nothing, which is why sorted input is O(N).',
      'The merge writes back into the array left-to-right, so the write cursor only ever advances.',
    ],
  },
  presets: [
    {
      id: 'natural-runs',
      label: 'Natural Runs: [1, 2, 8, 7, 6, 3, 4, 9]',
      description: 'Contains ascending run [1, 2, 8] and descending run [7, 6] reversed',
      data: [1, 2, 8, 7, 6, 3, 4, 9],
    },
    {
      id: 'partially-sorted',
      label: 'Partially Sorted: [5, 6, 7, 1, 2, 3, 9, 8]',
      description: 'Multiple natural runs merged adaptively',
      data: [5, 6, 7, 1, 2, 3, 9, 8],
    },
    {
      id: 'already-sorted',
      label: 'Best Case O(N): [1, 2, 3, 4, 5, 6]',
      description: 'Single natural run spans the entire array',
      data: [1, 2, 3, 4, 5, 6],
    },
    {
      id: 'single-element',
      label: 'One Element',
      description: 'A single run spans the array immediately',
      data: [42],
    },
  ],
  defaultInput: [1, 2, 8, 7, 6, 3, 4, 9],
  codeSnippets: {
    pseudocode: `function timsort(arr):
    minrun = calculateMinRun(length(arr))
    runs = identifyNaturalRuns(arr)
    for each run in runs:
        if length(run) < minrun:
            extendWithBinaryInsertionSort(run, minrun)
        push(stack, run)
        collapseStackInvariants(stack)
    while length(stack) > 1:
        mergeTopRuns(stack)
    return arr`,
    python: `def timsort(arr):
    minrun = calculate_min_run(len(arr))
    runs = identify_natural_runs(arr)
    for run in runs:
        if run_length(run) < minrun:
            extend_with_binary_insertion(run, minrun)
        push(stack, run)
        collapse_stack_invariants(stack)
    while stack_length(stack) > 1:
        merge_top_runs(stack)
    return arr`,
    typescript: `function timsort(arr: number[]): number[] {
  const minrun = calculateMinRun(arr.length);
  const runs = identifyNaturalRuns(arr);
  for (const run of runs) {
    if (runLength(run) < minrun) {
      extendWithBinaryInsertion(run, minrun); }
    push(stack, run);
    collapseStackInvariants(stack); }
  while (stackLength(stack) > 1) {
    mergeTopRuns(stack); }
  return arr; }`,
    cpp: `vector<int> timsort(vector<int>& arr) {
    int minrun = calculateMinRun(arr.size());
    auto runs = identifyNaturalRuns(arr);
    for (auto& run : runs) {
        if (runLength(run) < minrun) {
            extendWithBinaryInsertion(run, minrun); }
        push(stack, run);
        collapseStackInvariants(stack); }
    while (stackLength(stack) > 1) {
        mergeTopRuns(stack); }
    return arr; }`,
    java: `int[] timsort(int[] arr) {
    int minrun = calculateMinRun(arr.length);
    var runs = identifyNaturalRuns(arr);
    for (var run : runs) {
        if (runLength(run) < minrun) {
            extendWithBinaryInsertion(run, minrun); }
        push(stack, run);
        collapseStackInvariants(stack); }
    while (stackLength(stack) > 1) {
        mergeTopRuns(stack); }
    return arr; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const { array, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;
    const minRun = Math.max(2, Math.min(4, Math.floor(n / 2)));

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const stats = { runsFound: 0, reversed: 0, merges: 0 };

    let actionType:
      | 'INIT'
      | 'SCAN_RUN'
      | 'REVERSE_RUN'
      | 'EXTEND_RUN'
      | 'EXTEND_SHIFT'
      | 'RUN_PUSHED'
      | 'MERGE_START'
      | 'MERGE_COMPARE'
      | 'MERGE_COPY'
      | 'MERGED'
      | 'DONE' = 'INIT';
    let scanCheckpointAdded = false;
    let mergeCheckpointAdded = false;
    let firstRunMilestoneUsed = false;
    let firstMergeMilestoneUsed = false;

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
          comparisons: stats.runsFound + stats.merges,
          swaps: stats.reversed + stats.merges,
          accesses: stats.runsFound * 2 + stats.reversed * 2 + stats.merges * 4,
          lookups: 0,
        },
        invariantStatus: {
          label:
            actionType === 'DONE'
              ? 'one run spans the whole array — fully sorted'
              : `run stack holds ${stats.runsFound} sorted run(s), ${stats.merges} merge(s) done`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: opts.callStack ?? [
          { name: 'timSort()', params: { n, minRun }, line: opts.codeLine, isCurrent: true },
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
        `Timsort on ${n} element(s): minRun target = ${minRun}. Scanning for natural monotonic runs first.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: { size: n, minRun, array: `[${arr.join(', ')}]` },
      soundCue: 'start',
      pedagogy: {
        what:
          n > 1
            ? 'Timsort first looks for already-ordered segments ("natural runs") instead of sorting blindly.'
            : n === 1
              ? 'The array holds a single element, which is a run by itself.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Real data is often partially sorted; exploiting existing runs is what makes the best case O(N).',
        whatNext:
          n > 1
            ? 'Scan from index 0: measure the first run and its direction (ascending or strictly descending).'
            : 'A single-element run spans the array already.',
      },
      statuses: n > 0 ? { 0: 'active' } : undefined,
      pointers: { scan: 0 },
    });

    if (n <= 1) {
      actionType = 'DONE';
      elements.forEach((e) => {
        e.status = 'sorted';
      });
      pushFrame({
        codeLine: 11,
        explanation:
          n === 1
            ? `One element: the single natural run [${arr[0]}] spans the array — zero merges needed.`
            : 'Empty array: there is no run to find and nothing to merge.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: { result: n, runsFound: 0, merges: 0 },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'complete',
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted array by definition.' : 'An empty array is sorted by definition.',
          why: 'The run scan needs at least one element; with fewer the stack is trivially complete.',
          whatNext: 'Load a preset such as Natural Runs to watch run discovery and merging.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    interface Run {
      start: number;
      len: number;
    }
    const runs: Run[] = [];
    let start = 0;

    // Phase 1: Identify and extend natural runs
    while (start < n) {
      let end = start + 1;
      const isAscending = end < n && elements[end].value >= elements[start].value;
      actionType = 'SCAN_RUN';

      const scanCheckpoint: PredictionCheckpoint | undefined = !scanCheckpointAdded
        ? {
            id: 'timsort-run-direction',
            question: `Scanning from index ${start} (value ${elements[start].value}) toward ${end < n ? elements[end].value : 'the end'}. Which direction is this natural run?`,
            options: [
              'Strictly descending — it will be reversed in place',
              'Ascending (non-decreasing) — it is kept as-is',
            ],
            correctIndex: end < n && !isAscending ? 0 : 1,
            explanation:
              end < n
                ? isAscending
                  ? `${elements[end].value} ≥ ${elements[start].value}, so the run grows ascending without any write.`
                  : `${elements[end].value} < ${elements[start].value}, so the run is strictly descending and will be reversed for free.`
                : 'Only one element remains — a run of length 1, trivially ascending.',
            hint: 'Compare the first two values of the run.',
          }
        : undefined;

      pushFrame({
        codeLine: 3,
        explanation: `Scanning for the natural run starting at index ${start} (value ${elements[start].value}). Direction: ${
          end < n ? (isAscending ? 'ascending (≥)' : 'strictly descending (<)') : 'single element'
        }.`,
        soundCue: 'step',
        checkpoint: scanCheckpoint,
        variables: { start, 'arr[start]': elements[start].value, minRun, direction: isAscending ? 'asc' : 'desc' },
        pedagogy: {
          what: `From index ${start} (value ${elements[start].value}) the run direction is ${isAscending ? 'ascending (≥)' : 'strictly descending (<)'}.`,
          why: 'Descending runs are legal because they can be reversed in place — but only strict descent keeps ties stable.',
          whatNext: isAscending
            ? 'Grow the run while values stay non-decreasing.'
            : 'Grow the run while values strictly decrease, then reverse it to ascending.',
        },
        statuses: { [start]: 'active' },
        pointers: { scan: start },
        callStack: [
          { name: 'identifyRun(start)', params: { start, initialVal: elements[start].value }, line: 3, isCurrent: true },
          { name: 'timSort()', params: { n, minRun }, line: 2 },
        ],
      });
      if (scanCheckpoint) scanCheckpointAdded = true;

      if (end < n) {
        if (isAscending) {
          while (end < n && elements[end].value >= elements[end - 1].value) {
            end++;
          }
        } else {
          while (end < n && elements[end].value < elements[end - 1].value) {
            end++;
          }
          // Reverse strictly descending run to ascending
          let left = start;
          let right = end - 1;
          while (left < right) {
            const tmp = elements[left].value;
            elements[left].value = elements[right].value;
            elements[right].value = tmp;
            left++;
            right--;
          }
          stats.reversed += 1;
          actionType = 'REVERSE_RUN';
          pushFrame({
            codeLine: 3,
            explanation: `Reversed strictly descending run [${start}..${end - 1}] into ascending order: [${elements.slice(start, end).map((e) => e.value).join(', ')}].`,
            soundCue: 'swap',
            variables: { reversedRange: `[${start}..${end - 1}]`, newValues: elements.slice(start, end).map((e) => e.value) },
            pedagogy: {
              what: `The descending run [${start}..${end - 1}] was reversed into ascending order.`,
              why: 'Reversing (instead of insertion-sorting) turns a ready-made descending run into a ready-made ascending one for free.',
              whatNext: 'If this run is still shorter than minRun, extend it with insertion sort.',
            },
            statuses: Object.fromEntries(
              elements.map((_, idx) => [idx, idx >= start && idx < end ? ('active' as ElementStatus) : ('default' as ElementStatus)])
            ),
            pointers: { start, end: end - 1 },
            callStack: [
              { name: 'reverseRun()', params: { start, end: end - 1 }, line: 3, isCurrent: true },
              { name: 'timSort()', params: { n }, line: 2 },
            ],
          });
        }
      }

      let runLen = end - start;

      // Extend to minRun with binary insertion sort if needed
      if (runLen < minRun && start + minRun <= n) {
        const targetEnd = Math.min(n, start + minRun);
        actionType = 'EXTEND_RUN';
        pushFrame({
          codeLine: 6,
          explanation: `Run length ${runLen} < minRun ${minRun}. Extending the run to index ${targetEnd - 1} via binary insertion sort.`,
          soundCue: 'compare',
          conditionEval: { expr: 'runLen < minRun', condition: `${runLen} < ${minRun}`, result: true },
          variables: { naturalLength: runLen, minRunTarget: minRun, targetEnd },
          pedagogy: {
            what: `The natural run has length ${runLen}, below the minRun target ${minRun}.`,
            why: 'Tiny runs make merging unbalanced; enforcing a minimum size keeps the merge tree near-logarithmic.',
            whatNext: `Extend the ascending prefix up to index ${targetEnd - 1} using binary insertion sort.`,
          },
          statuses: Object.fromEntries(
            elements.map((_, idx) => [idx, idx >= start && idx < targetEnd ? ('comparing' as ElementStatus) : ('default' as ElementStatus)])
          ),
          pointers: { start, targetEnd: targetEnd - 1 },
          callStack: [
            { name: 'binaryInsertionSort(start, end)', params: { start, targetEnd }, line: 6, isCurrent: true },
            { name: 'timSort()', params: { n }, line: 2 },
          ],
        });

        for (let i = start + 1; i < targetEnd; i++) {
          let j = i;
          while (j > start && elements[j].value < elements[j - 1].value) {
            const tmp = elements[j].value;
            elements[j].value = elements[j - 1].value;
            elements[j - 1].value = tmp;
            elements[j].status = 'swapping';
            elements[j - 1].status = 'swapping';

            actionType = 'EXTEND_SHIFT';
            pushFrame({
              codeLine: 6,
              explanation: `Binary insertion extension: ${tmp} shifted left past ${elements[j].value} at index ${j - 1}.`,
              soundCue: 'swap',
              variables: { start, i, j: j - 1, key: tmp },
              pedagogy: {
                what: `${tmp} slides left into its sorted position inside the extended run.`,
                why: 'Binary search finds the slot in O(log k); the shift still costs O(k) but inside a tiny run.',
                whatNext: 'Continue extending element by element until the run reaches minRun.',
              },
              statuses: { [j]: 'swapping', [j - 1]: 'swapping' },
              pointers: { start, key: j - 1, targetEnd: targetEnd - 1 },
              callStack: [
                { name: 'binaryInsertionSort(start, end)', params: { start, i, j: j - 1 }, line: 6, isCurrent: true },
                { name: 'timSort()', params: { n }, line: 2 },
              ],
            });

            elements[j].status = 'default';
            elements[j - 1].status = 'default';
            j--;
          }
        }
        end = targetEnd;
        runLen = end - start;
      }

      runs.push({ start, len: runLen });
      stats.runsFound += 1;
      actionType = 'RUN_PUSHED';

      const runMilestone = !firstRunMilestoneUsed
        ? 'First Run Finalized'
        : start + runLen >= n
          ? 'All Runs Stacked'
          : undefined;
      if (runMilestone) firstRunMilestoneUsed = true;

      pushFrame({
        codeLine: 7,
        explanation: `Run #${runs.length} pushed to the stack: sorted range [${start}..${end - 1}] (length ${runLen}): [${elements.slice(start, end).map((e) => e.value).join(', ')}].`,
        milestone: runMilestone,
        soundCue: 'sorted',
        variables: {
          runNumber: runs.length,
          range: `[${start}..${end - 1}]`,
          length: runLen,
          stackSize: runs.length,
        },
        pedagogy: {
          what: `Run #${runs.length} is finalized: sorted range [${start}..${end - 1}] of length ${runLen}.`,
          why: 'Every run is an already-ascending block, so the remaining work is pure merging — no element-level sorting later.',
          whatNext:
            start + runLen < n
              ? `Continue scanning for the next natural run at index ${start + runLen}.`
              : 'All natural runs are stacked — merge them pairwise.',
        },
        statuses: Object.fromEntries(
          elements.map((_, idx) => [idx, idx >= start && idx < end ? ('active' as ElementStatus) : ('default' as ElementStatus)])
        ),
        pointers: { runStart: start, runEnd: end - 1 },
        callStack: [
          { name: `pushRun(start=${start})`, params: { start, length: runLen }, line: 7, isCurrent: true },
          { name: 'timSort()', params: { n }, line: 2 },
        ],
      });

      start = end;
    }

    // Phase 2: Merge adjacent runs step-by-step
    while (runs.length > 1) {
      const r1 = runs.shift()!;
      const r2 = runs.shift()!;

      const mergeStart = r1.start;
      const mergeMid = r1.start + r1.len;
      const mergeEnd = r2.start + r2.len;

      const leftArr = elements.slice(mergeStart, mergeMid).map((e) => e.value);
      const rightArr = elements.slice(mergeMid, mergeEnd).map((e) => e.value);
      actionType = 'MERGE_START';

      pushFrame({
        codeLine: 10,
        explanation: `Merging adjacent runs: Run A [${mergeStart}..${mergeMid - 1}] = [${leftArr.join(', ')}] and Run B [${mergeMid}..${mergeEnd - 1}] = [${rightArr.join(', ')}].`,
        soundCue: 'compare',
        variables: {
          runA: `[${leftArr.join(', ')}]`,
          runB: `[${rightArr.join(', ')}]`,
          AuxRunA: leftArr,
          AuxRunB: rightArr,
        },
        pedagogy: {
          what: `Two adjacent sorted runs are merged: A = [${leftArr.join(', ')}] and B = [${rightArr.join(', ')}].`,
          why: 'Merging two sorted runs is linear and stable — the same reason mergesort works.',
          whatNext: 'Two pointers walk the runs; each step writes the smaller front value into the target position.',
        },
        statuses: Object.fromEntries(
          elements.map((_, idx) => [idx, idx >= mergeStart && idx < mergeEnd ? ('comparing' as ElementStatus) : ('default' as ElementStatus)])
        ),
        pointers: { left: mergeStart, mid: mergeMid, right: mergeEnd - 1 },
        callStack: [{ name: `mergeRuns(${mergeStart}, ${mergeEnd})`, params: { mergeStart, mergeEnd }, line: 10, isCurrent: true }],
      });

      // Step-by-step two-pointer merge writing directly to elements[mergeStart + k]
      let pL = 0;
      let pR = 0;
      let writeOffset = 0;

      while (pL < leftArr.length && pR < rightArr.length) {
        const lVal = leftArr[pL];
        const rVal = rightArr[pR];
        const pickLeft = lVal <= rVal;
        const chosen = pickLeft ? lVal : rVal;
        const targetIdx = mergeStart + writeOffset;

        elements[targetIdx].value = chosen;
        elements[targetIdx].status = 'sorted';
        stats.merges += 1;

        const mergeCheckpoint: PredictionCheckpoint | undefined = !mergeCheckpointAdded
          ? {
              id: 'timsort-first-merge-compare',
              question: `Front values: RunA[${pL}] = ${lVal} and RunB[${pR}] = ${rVal}. Which lands next in the merged output?`,
              options: [`${lVal} (from Run A)`, `${rVal} (from Run B)`],
              correctIndex: pickLeft ? 0 : 1,
              explanation: pickLeft
                ? `${lVal} ≤ ${rVal}, so the left run's head is written next (ties prefer the left run, keeping stability).`
                : `${rVal} < ${lVal}, so the right run's head is written next.`,
              hint: 'On ties, which run wins in a stable merge?',
            }
          : undefined;

        actionType = 'MERGE_COMPARE';
        pushFrame({
          codeLine: 10,
          explanation: `Merge compare: RunA[${pL}]=${lVal} <= RunB[${pR}]=${rVal} is ${pickLeft ? 'TRUE' : 'FALSE'} → write ${chosen} to arr[${targetIdx}].`,
          soundCue: 'swap',
          conditionEval: { expr: 'RunA head <= RunB head', condition: `${lVal} <= ${rVal}`, result: pickLeft },
          checkpoint: mergeCheckpoint,
          pedagogy: {
            what: `Heads of the runs: RunA[${pL}] = ${lVal} vs RunB[${pR}] = ${rVal}; ${chosen} is smaller-or-equal and gets written to arr[${targetIdx}].`,
            why: 'Because each run is sorted, only the two front values can be the next smallest overall — one comparison decides.',
            whatNext: pickLeft
              ? `Advance Run A to index ${pL + 1}.`
              : `Advance Run B to index ${pR + 1}.`,
          },
          variables: {
            writeIdx: targetIdx,
            chosenValue: chosen,
            pL: pickLeft ? pL + 1 : pL,
            pR: pickLeft ? pR : pR + 1,
            AuxRunA: leftArr.slice(pickLeft ? pL + 1 : pL),
            AuxRunB: rightArr.slice(pickLeft ? pR : pR + 1),
          },
          callStack: [{ name: `mergeStep(idx=${targetIdx})`, params: { lVal, rVal, chosen }, line: 10, isCurrent: true }],
          statuses: {
            [targetIdx]: 'swapping',
            ...Object.fromEntries(
              Array.from({ length: targetIdx - mergeStart }, (_, off) => [mergeStart + off, 'sorted' as ElementStatus])
            ),
          },
          pointers: { write: targetIdx, end: mergeEnd - 1 },
        });
        if (mergeCheckpoint) mergeCheckpointAdded = true;

        elements[targetIdx].status = 'sorted';
        if (pickLeft) pL++;
        else pR++;
        writeOffset++;
      }

      while (pL < leftArr.length) {
        const chosen = leftArr[pL++];
        const targetIdx = mergeStart + writeOffset++;
        elements[targetIdx].value = chosen;
        elements[targetIdx].status = 'sorted';
        stats.merges += 1;

        actionType = 'MERGE_COPY';
        pushFrame({
          codeLine: 10,
          explanation: `Run B exhausted — copy the remaining Run A element ${chosen} into arr[${targetIdx}].`,
          soundCue: 'step',
          variables: { writeIdx: targetIdx, chosenValue: chosen, AuxRunA: leftArr.slice(pL) },
          pedagogy: {
            what: `Run B is exhausted; the rest of Run A (${leftArr.length - pL + 1} element(s) left) is copied in order.`,
            why: 'Remaining values are already sorted and larger than everything written so far, so no comparisons are needed.',
            whatNext: 'Continue copying until Run A empties.',
          },
          statuses: { [targetIdx]: 'swapping' },
          pointers: { write: targetIdx },
          callStack: [{ name: `flushRunA(idx=${targetIdx})`, params: { chosen }, line: 10, isCurrent: true }],
        });
      }

      while (pR < rightArr.length) {
        const chosen = rightArr[pR++];
        const targetIdx = mergeStart + writeOffset++;
        elements[targetIdx].value = chosen;
        elements[targetIdx].status = 'sorted';
        stats.merges += 1;

        actionType = 'MERGE_COPY';
        pushFrame({
          codeLine: 10,
          explanation: `Run A exhausted — copy the remaining Run B element ${chosen} into arr[${targetIdx}].`,
          soundCue: 'step',
          variables: { writeIdx: targetIdx, chosenValue: chosen, AuxRunB: rightArr.slice(pR) },
          pedagogy: {
            what: `Run A is exhausted; the rest of Run B (${rightArr.length - pR + 1} element(s) left) is copied in order.`,
            why: 'Remaining values are already sorted and larger than everything written so far, so no comparisons are needed.',
            whatNext: 'Continue copying until Run B empties.',
          },
          statuses: { [targetIdx]: 'swapping' },
          pointers: { write: targetIdx },
          callStack: [{ name: `flushRunB(idx=${targetIdx})`, params: { chosen }, line: 10, isCurrent: true }],
        });
      }

      runs.unshift({ start: mergeStart, len: r1.len + r2.len });
      actionType = 'MERGED';

      const mergeMilestone = !firstMergeMilestoneUsed ? 'First Merge Complete' : undefined;
      if (mergeMilestone) firstMergeMilestoneUsed = true;

      pushFrame({
        codeLine: 10,
        explanation: `Runs fused into one sorted run [${mergeStart}..${mergeEnd - 1}]: [${elements.slice(mergeStart, mergeEnd).map((e) => e.value).join(', ')}]. Stack holds ${runs.length} run(s).`,
        milestone: mergeMilestone,
        soundCue: 'sorted',
        variables: { mergedRange: `[${mergeStart}..${mergeEnd - 1}]`, remainingRuns: runs.length },
        pedagogy: {
          what: `Runs A and B fused into one sorted run [${mergeStart}..${mergeEnd - 1}]; the stack now holds ${runs.length} run(s).`,
          why: 'Each merge halves the number of runs, so O(log R) merge levels remain — the logarithmic half of O(N log N).',
          whatNext:
            runs.length > 1
              ? 'Merge the next adjacent pair of runs.'
              : 'A single run spans the array — fully sorted.',
        },
        statuses: Object.fromEntries(
          elements.map((_, idx) => [idx, idx >= mergeStart && idx < mergeEnd ? ('sorted' as ElementStatus) : ('default' as ElementStatus)])
        ),
        pointers: { start: mergeStart, end: mergeEnd - 1 },
        callStack: [{ name: `mergeDone()`, params: { size: r1.len + r2.len }, line: 10, isCurrent: true }],
      });
    }

    elements.forEach((e) => {
      e.status = 'sorted';
    });

    // Final Completion
    actionType = 'DONE';
    pushFrame({
      codeLine: 11,
      explanation: `Timsort complete: [${elements.map((e) => e.value).join(', ')}] sorted adaptively after ${stats.runsFound} natural run(s) and ${stats.merges} merge write(s).`,
      variables: {
        totalElements: n,
        result: n,
        runsFound: stats.runsFound,
        merges: stats.merges,
      },
      conditionEval: { expr: 'array is sorted', condition: elements.map((e) => e.value).join(', '), result: isSorted(elements.map((e) => e.value)) },
      milestone: 'Timsort Complete',
      pedagogy: {
        what: `Final array: [${elements.map((e) => e.value).join(', ')}].`,
        why: 'The cost was dominated by discovering existing order: sorted input needs just one scan (O(N)), adversarial input degenerates to classic O(N log N) merging.',
        whatNext: 'Try the "Best Case O(N)" preset: a single natural run spans the whole array and nothing is merged.',
      },
      callStack: [{ name: 'complete()', params: { n }, line: 11, isCurrent: true }],
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
