import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStageState } from '../../components/stage/ArrayStage';
import {
  MergeSortStage,
  MergeSortMergeCursor,
  MergeSortNodePhase,
  MergeSortNodeView,
  MergeSortStatusKind,
  MergeSortView,
} from '../../components/stage/MergeSortStage';

/** Array state plus the divide/merge decomposition view consumed by MergeSortStage. */
interface MergeSortState extends ArrayStageState {
  mergeView: MergeSortView;
}

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10];

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

export const mergesortModule: AlgorithmModule<number[], MergeSortState> = {
  id: 'mergesort',
  title: 'Mergesort (Divide & Conquer)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Guaranteed O(N log N) in all cases',
  },
  theory: {
    overview:
      'Mergesort is a divide-and-conquer algorithm that recursively divides the array into halves until each subarray contains a single element, then merges the sorted halves back together in order.',
    whyItWorks:
      'Merging two already-sorted subarrays takes linear time O(N) using two pointers. Recursing through log(N) levels guarantees O(N log N) total time complexity.',
    invariant:
      'At each merge step, the merged segment arr[left ... right] is guaranteed to be in non-decreasing order.',
    pitfalls: [
      'Requires O(N) auxiliary space for the temporary buffer during merging.',
      'Not strictly in-place compared to Heapsort or Quicksort.',
      'On equal values the LEFT front wins the comparison — that tie rule is exactly what makes mergesort stable.',
    ],
    steps: [
      'Guard: an empty or one-element range is already sorted.',
      'Split the range at mid = (left + right) / 2 and sort both halves recursively.',
      'Merge: append the smaller front of the two halves into the temp buffer until one half runs out.',
      'Append whatever remains of the other half — it is already sorted.',
      'Copy the temp buffer back into arr[left..right]; the range is now sorted.',
    ],
    watchOut: [
      'The original array is not touched until the copy-back phase — the temp buffer is the source of truth during a merge.',
      'Exhausting one half does not end the merge: the other half is appended without further comparisons.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Standard demonstration', data: [38, 27, 43, 3, 9, 82, 10] },
    { id: 'reversed', label: 'Reversed Array', description: 'Shows stable merge behavior', data: [70, 60, 50, 40, 30, 20] },
    { id: 'duplicates', label: 'With Duplicates', description: 'Tests stability', data: [15, 30, 15, 45, 30, 10] },
    { id: 'already-sorted', label: 'Already Sorted', description: 'Every compare takes the left front', data: [10, 20, 30, 40, 50] },
    { id: 'single-element', label: 'One Element', description: 'The guard rejects the range immediately', data: [42] },
  ],
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  codeSnippets: {
    pseudocode: `function mergesort(arr, left, right):
    if left < right:
        mid = (left + right) / 2
        mergesort(arr, left, mid)
        mergesort(arr, mid + 1, right)
        merge(arr, left, mid, right)
function merge(arr, left, mid, right):
    temp = []
    i = left
    j = mid + 1
    while i <= mid and j <= right:
        if arr[i] <= arr[j]:
            append arr[i] to temp; i = i + 1
        else:
            append arr[j] to temp; j = j + 1
    while i <= mid: append arr[i] to temp; i = i + 1
    while j <= right: append arr[j] to temp; j = j + 1
    copy temp back into arr[left..right]`,
    python: `def mergesort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        mergesort(arr, left, mid)
        mergesort(arr, mid + 1, right)
        merge(arr, left, mid, right)
def merge(arr, left, mid, right):
    temp = []
    i = left
    j = mid + 1
    while i <= mid and j <= right:
        if arr[i] <= arr[j]:
            temp.append(arr[i]); i += 1
        else:
            temp.append(arr[j]); j += 1
    while i <= mid: temp.append(arr[i]); i += 1
    while j <= right: temp.append(arr[j]); j += 1
    for k in range(len(temp)): arr[left + k] = temp[k]`,
    typescript: `function mergesort(arr: number[], left: number, right: number): void {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    mergesort(arr, left, mid);
    mergesort(arr, mid + 1, right);
    merge(arr, left, mid, right); }
function merge(arr: number[], left: number, mid: number, right: number): void {
  const temp: number[] = [];
  let i = left;
  let j = mid + 1;
  while (i <= mid && j <= right) {
    if (arr[i] <= arr[j]) {
      temp.push(arr[i]); i++; }
    else {
      temp.push(arr[j]); j++; } }
  while (i <= mid) temp.push(arr[i++]);
  while (j <= right) temp.push(arr[j++]);
  for (let k = 0; k < temp.length; k++) arr[left + k] = temp[k]; }`,
    cpp: `void mergesort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergesort(arr, left, mid);
        mergesort(arr, mid + 1, right);
        merge(arr, left, mid, right); }
void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp;
    int i = left;
    int j = mid + 1;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp.push_back(arr[i]); i++; }
        else {
            temp.push_back(arr[j]); j++; } }
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= right) temp.push_back(arr[j++]);
    for (int k = 0; k < (int)temp.size(); k++) arr[left + k] = temp[k]; }`,
    java: `void mergesort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergesort(arr, left, mid);
        mergesort(arr, mid + 1, right);
        merge(arr, left, mid, right); }
void merge(int[] arr, int left, int mid, int right) {
    int[] temp = new int[right - left + 1]; int tempSize = 0;
    int i = left;
    int j = mid + 1;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[tempSize++] = arr[i]; i++; }
        else {
            temp[tempSize++] = arr[j]; j++; } }
    while (i <= mid) temp[tempSize++] = arr[i++];
    while (j <= right) temp[tempSize++] = arr[j++];
    for (int k = 0; k < tempSize; k++) arr[left + k] = temp[k]; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<MergeSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const frames: ExecutionFrame<MergeSortState>[] = [];
    const arr = [...array];
    const stats = { comparisons: 0, appends: 0, copies: 0, merges: 0, calls: 0 };

    let compareCheckpointAdded = false;
    let copyCheckpointAdded = false;
    let firstMergeMilestoneUsed = false;
    let halfMilestoneUsed = false;
    const mergedRanges: { left: number; right: number }[] = [];
    const covered = new Set<number>();

    // Divide/merge decomposition tracking: nodes are created when a range is
    // first reached and never removed, so each recursion depth keeps its own
    // aligned row of segments in the stage.
    const nodeMap = new Map<string, MergeSortNodeView>();
    const nodeOrder: MergeSortNodeView[] = [];
    const makeNode = (
      left: number,
      right: number,
      depth: number,
      phase: MergeSortNodePhase = 'ready'
    ): MergeSortNodeView => {
      const id = `${left}-${right}`;
      const existing = nodeMap.get(id);
      if (existing) return existing;
      const node: MergeSortNodeView = { id, left, right, depth, phase };
      nodeMap.set(id, node);
      nodeOrder.push(node);
      return node;
    };
    const setPhase = (left: number, right: number, phase: MergeSortNodePhase) => {
      const node = nodeMap.get(`${left}-${right}`);
      if (node) node.phase = phase;
    };

    let statusLabel = `READY: divide [0..${n - 1}] into two halves`;
    let statusKind: MergeSortStatusKind = 'init';
    let mergeCursor: MergeSortMergeCursor | null = null;

    const mergeViewSnapshot = (): MergeSortView => ({
      nodes: nodeOrder.map((node) => ({ ...node })),
      merge: mergeCursor ? { ...mergeCursor } : null,
      statusLabel,
      statusKind,
    });

    makeNode(0, n - 1, 0, 'ready');

    const callStack: { name: string; params: Record<string, string | number>; line?: number; isCurrent?: boolean }[] = [
      { name: 'main', params: { n }, line: 1, isCurrent: true },
    ];

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && covered.size >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Merged';
      }
      return undefined;
    };

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy?: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<MergeSortState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<MergeSortState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      highlight?: Record<number, ElementStatus>;
      pointers?: Record<string, number>;
      auxiliary?: any;
    }) => {
      const statusFor = (idx: number): ElementStatus => {
        const explicit = opts.highlight?.[idx];
        if (explicit) return explicit;
        return 'default';
      };

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        invariantStatus: {
          label:
            opts.action === 'MERGED'
              ? `arr[${mergedRanges[mergedRanges.length - 1].left}..${mergedRanges[mergedRanges.length - 1].right}] is sorted`
              : 'Subarrays arr[left..mid] and arr[mid+1..right] are sorted',
          isValid: true,
        },
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? (opts.milestone ? 'sorted' : 'step'),
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        metrics: {
          comparisons: stats.comparisons,
          swaps: stats.appends + stats.copies,
          accesses: stats.comparisons * 2 + stats.appends * 2 + stats.copies * 2,
          lookups: 0,
        },
        variables: {
          ...(opts.pointers ?? {}),
          ...(opts.variables ?? {}),
        },
        conditionEval: opts.conditionEval,
        callStack: callStack.map((frame, idx) => ({
          ...frame,
          isCurrent: idx === callStack.length - 1,
        })),
        state: {
          array: arr.map((value, idx) => ({ id: idx, value, status: statusFor(idx) })),
          pointers: opts.pointers ?? {},
          auxiliary: opts.auxiliary,
          mergeView: mergeViewSnapshot(),
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 1,
      action: 'INIT',
      explanation:
        `mergesort(arr, 0, ${n - 1}) is invoked on ${n} element(s) [${arr.join(', ')}].` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'n > 1', condition: `${n} > 1`, result: n > 1 },
      variables: { n, left: 0, right: n - 1 },
      soundCue: 'start',
      pedagogy: {
        what:
          n > 1
            ? `The full range [0..${n - 1}] is the first subproblem.`
            : n === 1
              ? 'The array holds a single element, which is trivially sorted.'
              : 'The array is empty, so there is nothing to sort.',
        why: 'Divide-and-conquer only needs to solve this range; its two halves are independent until the merge.',
        whatNext:
          n > 1
            ? 'Split the range at mid, solve the left half, then the right half, then merge.'
            : 'The recursion is skipped entirely.',
      },
    });

    if (n <= 1) {
      const rootNode = makeNode(0, n - 1, 0);
      rootNode.phase = 'sorted';
      statusLabel = n === 1 ? `DONE: [${arr.join(', ')}] is trivially sorted` : 'DONE: the empty array is sorted';
      statusKind = 'done';
      pushFrame({
        codeLine: 1,
        action: 'DONE',
        explanation:
          n === 1
            ? `One element: the guard left < right is false (0 < 0), so arr = [${arr[0]}] is returned unchanged with zero comparisons.`
            : 'Empty array: the guard left < right is false (0 < -1), so nothing is divided and nothing is merged.',
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: true },
        variables: { result: n, comparisons: 0, merges: 0 },
        milestone: n === 1 ? 'Single Element' : 'Nothing to Sort',
        soundCue: 'finish',
        pedagogy: {
          what: n === 1 ? 'A single element is a sorted range by definition.' : 'An empty array is sorted by definition.',
          why: 'Mergesort only divides ranges with at least two elements; smaller ranges are the recursion base case.',
          whatNext: 'Load a preset such as Random Array to watch the divide-and-merge tree build up.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    function merge(left: number, mid: number, right: number): void {
      const temp: number[] = [];
      let i = left;
      let j = mid + 1;

      // Stage phases: the parent range is being rebuilt from its two halves.
      setPhase(left, right, 'merging');
      setPhase(left, mid, 'left');
      setPhase(mid + 1, right, 'right');
      mergeCursor = { left, mid, right, i, j, phase: 'merge' };
      statusLabel = `MERGE [${left}..${right}]: combine [${left}..${mid}] + [${mid + 1}..${right}]`;
      statusKind = 'merge';

      const tempAuxiliary = (activeIndex?: number, note?: string) => ({
        type: 'buffer' as const,
        name: 'temp',
        data: [...temp],
        activeIndex,
        note:
          note ??
          `Merge buffer for arr[${left}..${right}]. Values are appended in sorted order, then copied back.`,
      });

      pushFrame({
        codeLine: 8,
        action: 'TEMP_INIT',
        explanation: `temp = []: the merge buffer starts empty; the original array is untouched until the copy-back phase.`,
        pointers: { left, right },
        variables: { left, mid, right, leftLen: mid - left + 1, rightLen: right - mid },
        conditionEval: { expr: 'temp is empty', condition: 'temp.length == 0', result: temp.length === 0 },
        soundCue: 'step',
        auxiliary: tempAuxiliary(undefined, 'The merge buffer starts empty; the original array is still untouched.'),
        pedagogy: {
          what: 'An empty temp buffer is allocated for this merge.',
          why: 'Merging cannot overwrite the array in place without losing values, so the result is built aside first.',
          whatNext: `Point i at the front of the left half (arr[${left}]) and j at the front of the right half (arr[${mid + 1}]).`,
        },
      });

      pushFrame({
        codeLine: 9,
        action: 'POINTER_I',
        explanation: `i = ${left}: the scan pointer of the left half arr[${left}..${mid}], whose front is ${arr[left]}.`,
        highlight: { [left]: 'active' },
        pointers: { i: left, left, right },
        variables: { i, 'arr[i]': arr[left] },
        soundCue: 'step',
        auxiliary: tempAuxiliary(),
        pedagogy: {
          what: `i marks the next unmerged value of the left half: arr[${left}] = ${arr[left]}.`,
          why: 'Both halves are sorted, so their FRONT values are the only candidates for the next smallest overall value.',
          whatNext: `Point j at the front of the right half (arr[${mid + 1}]).`,
        },
      });

      pushFrame({
        codeLine: 10,
        action: 'POINTER_J',
        explanation: `j = ${mid + 1}: the scan pointer of the right half arr[${mid + 1}..${right}], whose front is ${arr[mid + 1]}.`,
        highlight: { [mid + 1]: 'active' },
        pointers: { i, j: mid + 1, left, right },
        variables: { j, 'arr[j]': arr[mid + 1] },
        soundCue: 'step',
        auxiliary: tempAuxiliary(),
        pedagogy: {
          what: `j marks the next unmerged value of the right half: arr[${mid + 1}] = ${arr[mid + 1]}.`,
          why: 'With both fronts marked, every comparison in this merge is arr[i] vs arr[j] — nothing else is ever inspected.',
          whatNext: `Compare arr[${i}] = ${arr[i]} with arr[${j}] = ${arr[j]}.`,
        },
      });

      while (i <= mid && j <= right) {
        const isLessOrEqual = arr[i] <= arr[j];
        const leftValue = arr[i];
        const rightValue = arr[j];
        stats.comparisons += 1;
        mergeCursor = { left, mid, right, i, j, phase: 'compare' };
        statusLabel = `COMPARE arr[${i}] = ${leftValue} vs arr[${j}] = ${rightValue}`;
        statusKind = 'compare';

        const compareCheckpoint: PredictionCheckpoint | undefined = !compareCheckpointAdded
          ? {
              id: 'mergesort-first-compare',
              question: `arr[i] = ${leftValue}, arr[j] = ${rightValue}. Which value enters temp next?`,
              options: [`${leftValue} (left half)`, `${rightValue} (right half)`],
              correctIndex: isLessOrEqual ? 0 : 1,
              explanation: isLessOrEqual
                ? `The left value is <= the right value, so it is appended first. Stability also prefers the left value on ties.`
                : `The right value is smaller, so it is appended first.`,
              hint: 'Only the two front elements can be the next smallest — and ties go to the left half.',
            }
          : undefined;

        pushFrame({
          codeLine: 12,
          action: 'COMPARE',
          explanation: `Compare arr[${i}] = ${leftValue} (left front) with arr[${j}] = ${rightValue} (right front) → ${isLessOrEqual ? 'left wins (<=)' : 'right wins (<)'}.`,
          highlight: { [i]: 'comparing', [j]: 'comparing' },
          pointers: { i, j, left, right },
          variables: { 'arr[i]': leftValue, 'arr[j]': rightValue, choose: isLessOrEqual ? 'left' : 'right' },
          conditionEval: {
            expr: `arr[${i}] <= arr[${j}]`,
            condition: `${leftValue} <= ${rightValue}`,
            result: isLessOrEqual,
          },
          soundCue: 'compare',
          checkpoint: compareCheckpoint,
          auxiliary: tempAuxiliary(undefined, 'Compare the two front elements; the winner has not been appended yet.'),
          pedagogy: {
            what: `The two candidates are ${leftValue} (left half) and ${rightValue} (right half).`,
            why: 'Each half is already sorted, so only their front elements can be the next smallest overall value.',
            whatNext: isLessOrEqual
              ? `${leftValue} <= ${rightValue}, so append the left value and advance i.`
              : `${rightValue} < ${leftValue}, so append the right value and advance j.`,
          },
        });
        if (compareCheckpoint) compareCheckpointAdded = true;

        if (isLessOrEqual) {
          temp.push(arr[i]);
          const appended = arr[i];
          i += 1;
          stats.appends += 1;
          mergeCursor = { left, mid, right, i, j, phase: 'append' };
          statusLabel = `APPEND ${appended} (left half) → temp[${temp.length - 1}]`;
          statusKind = 'append';
          pushFrame({
            codeLine: 13,
            action: 'APPEND_LEFT',
            explanation: `Appended ${appended} from the left half to temp[${temp.length - 1}]. Advanced i to ${i}.`,
            highlight: { [i - 1]: 'active', [j]: 'comparing' },
            pointers: { i, j, left, right },
            variables: { appended, from: 'left', tempSize: temp.length },
            soundCue: 'step',
            auxiliary: tempAuxiliary(temp.length - 1, `temp now holds ${temp.length} value(s).`),
            pedagogy: {
              what: `${appended} is written into the next free temp slot.`,
              why: 'The left value is the smaller front, so it must appear before the right value in sorted order — taking from the left on ties is what makes mergesort stable.',
              whatNext: `Advance i to ${i} and compare the next left value with arr[${j}].`,
            },
          });
        } else {
          temp.push(arr[j]);
          const appended = arr[j];
          j += 1;
          stats.appends += 1;
          mergeCursor = { left, mid, right, i, j, phase: 'append' };
          statusLabel = `APPEND ${appended} (right half) → temp[${temp.length - 1}]`;
          statusKind = 'append';
          pushFrame({
            codeLine: 15,
            action: 'APPEND_RIGHT',
            explanation: `Appended ${appended} from the right half to temp[${temp.length - 1}]. Advanced j to ${j}.`,
            highlight: { [i]: 'comparing', [j - 1]: 'active' },
            pointers: { i, j, left, right },
            variables: { appended, from: 'right', tempSize: temp.length },
            soundCue: 'step',
            auxiliary: tempAuxiliary(temp.length - 1, `temp now holds ${temp.length} value(s).`),
            pedagogy: {
              what: `${appended} is written into the next free temp slot.`,
              why: 'The right value is strictly smaller than the left front, so it must be placed first.',
              whatNext: `Advance j to ${j} and compare the next right value with arr[${i}].`,
            },
          });
        }
      }

      const exhaustedSide = i > mid ? 'left' : 'right';
      mergeCursor = { left, mid, right, i, j, phase: 'merge' };
      statusLabel = `FRONT EXHAUSTED: the ${exhaustedSide} half is fully consumed`;
      statusKind = 'merge';
      pushFrame({
        codeLine: 11,
        action: 'FRONT_EXHAUSTED',
        explanation: `The while guard fails: the ${exhaustedSide} half has no values left, so the main scan ends after ${temp.length} appends.`,
        pointers: { i, j, left, right },
        variables: { i, j, exhausted: exhaustedSide, tempSize: temp.length },
        conditionEval: {
          expr: 'i <= mid && j <= right',
          condition: `${i} <= ${mid} && ${j} <= ${right}`,
          result: false,
        },
        soundCue: 'step',
        auxiliary: tempAuxiliary(undefined, 'One half is fully consumed; the remainder loop takes over next.'),
        pedagogy: {
          what: `One of the two halves ran out — the merge loop guard failed.`,
          why: 'Every element merged so far was the smallest remaining; the leftover half is already sorted and only needs appending.',
          whatNext:
            exhaustedSide === 'right'
              ? `Append the remaining left values arr[${i}..${mid}] directly.`
              : `Append the remaining right values arr[${j}..${right}] directly.`,
        },
      });

      while (i <= mid) {
        temp.push(arr[i]);
        const appended = arr[i];
        i += 1;
        stats.appends += 1;
        mergeCursor = { left, mid, right, i, j, phase: 'append' };
        statusLabel = `APPEND ${appended} (left remainder) → temp[${temp.length - 1}]`;
        statusKind = 'append';
        pushFrame({
          codeLine: 16,
          action: 'APPEND_LEFT_REST',
          explanation: `Left half still has values: appended ${appended} to temp[${temp.length - 1}].`,
          highlight: { [i - 1]: 'active' },
          pointers: { i, left, right },
          variables: { appended, from: 'left-remainder', tempSize: temp.length },
          conditionEval: { expr: 'i <= mid', condition: `${i} <= ${mid}`, result: i <= mid },
          soundCue: 'step',
          auxiliary: tempAuxiliary(temp.length - 1, 'The right half is exhausted; copy the remaining left values in order.'),
          pedagogy: {
            what: `The right half has no values left, so ${appended} is appended directly.`,
            why: 'Remaining left values are already sorted among themselves and larger than every value already in temp.',
            whatNext: i <= mid ? `Append the next left value arr[${i}].` : 'Copy the completed temp buffer back into arr.',
          },
        });
      }
      while (j <= right) {
        temp.push(arr[j]);
        const appended = arr[j];
        j += 1;
        stats.appends += 1;
        mergeCursor = { left, mid, right, i, j, phase: 'append' };
        statusLabel = `APPEND ${appended} (right remainder) → temp[${temp.length - 1}]`;
        statusKind = 'append';
        pushFrame({
          codeLine: 17,
          action: 'APPEND_RIGHT_REST',
          explanation: `Right half still has values: appended ${appended} to temp[${temp.length - 1}].`,
          highlight: { [j - 1]: 'active' },
          pointers: { j, left, right },
          variables: { appended, from: 'right-remainder', tempSize: temp.length },
          conditionEval: { expr: 'j <= right', condition: `${j} <= ${right}`, result: j <= right },
          soundCue: 'step',
          auxiliary: tempAuxiliary(temp.length - 1, 'The left half is exhausted; copy the remaining right values in order.'),
          pedagogy: {
            what: `The left half has no values left, so ${appended} is appended directly.`,
            why: 'Remaining right values are already sorted and larger than every value already in temp.',
            whatNext: j <= right ? `Append the next right value arr[${j}].` : 'Copy the completed temp buffer back into arr.',
          },
        });
      }

      mergeCursor = { left, mid, right, i, j, phase: 'merge' };
      statusLabel = `BUFFER READY [${temp.join(', ')}] → copy back into arr[${left}..${right}]`;
      statusKind = 'merge';
      pushFrame({
        codeLine: 18,
        action: 'BUFFER_READY',
        explanation: `Merge buffer is complete: [${temp.join(', ')}]. Now copy it back into arr[${left}..${right}].`,
        pointers: { left, right },
        variables: { tempSize: temp.length },
        conditionEval: {
          expr: 'temp.length === right - left + 1',
          condition: `${temp.length} === ${right - left + 1}`,
          result: temp.length === right - left + 1,
        },
        soundCue: 'step',
        auxiliary: tempAuxiliary(undefined, 'The buffer is final. The next frames copy each value back into the original array.'),
        pedagogy: {
          what: `temp = [${temp.join(', ')}] is fully merged.`,
          why: 'The original array still holds the pre-merge values; copying back is a separate, observable phase.',
          whatNext: `Copy temp[0] = ${temp[0]} into arr[${left}], then continue left to right.`,
        },
      });

      // Copy back one element per frame so the buffer and the array never jump silently.
      for (let k = 0; k < temp.length; k++) {
        const copied = temp[k];
        arr[left + k] = copied;
        stats.copies += 1;
        mergeCursor = { left, mid, right, i, j, phase: 'copy', copyTo: left + k };
        statusLabel = `COPY BACK temp[${k}] = ${copied} → arr[${left + k}]`;
        statusKind = 'copy';

        const copyCheckpoint: PredictionCheckpoint | undefined = !copyCheckpointAdded
          ? {
              id: 'mergesort-copy-back',
              question: `temp = [${temp.join(', ')}] holds the merged result. How does it reach arr[${left}..${right}]?`,
              options: [
                'Merge the buffer with the array one more time',
                'Copy it back left to right: temp[k] → arr[left + k]',
                'Discard the buffer — the array is already updated',
              ],
              correctIndex: 1,
              explanation: `The array still holds pre-merge values, so each temp slot is copied straight across: temp[k] lands at arr[${left} + k].`,
              hint: 'During the merge the original array was never written to.',
            }
          : undefined;

        pushFrame({
          codeLine: 18,
          action: 'COPY_BACK',
          explanation: `Copied temp[${k}] (${copied}) into arr[${left + k}].`,
          highlight: { [left + k]: 'active' },
          pointers: { copyFrom: k, copyTo: left + k, left, right },
          variables: { copied, tempIndex: k, arrayIndex: left + k },
          soundCue: 'step',
          checkpoint: copyCheckpoint,
          auxiliary: tempAuxiliary(k, `Copying temp[${k}] = ${copied} back into the original array.`),
          pedagogy: {
            what: `arr[${left + k}] now equals ${copied}.`,
            why: 'The buffer is the source of truth during the merge; the array is rebuilt from it left to right.',
            whatNext:
              k + 1 < temp.length
                ? `Copy temp[${k + 1}] = ${temp[k + 1]} into arr[${left + k + 1}].`
                : `The range [${left}..${right}] is fully copied back and sorted.`,
          },
        });
        if (copyCheckpoint) copyCheckpointAdded = true;
      }

      const active: Record<number, ElementStatus> = {};
      for (let k = left; k <= right; k++) active[k] = 'sorted';
      mergedRanges.push({ left, right });
      for (let k = left; k <= right; k++) covered.add(k);
      stats.merges += 1;

      // Fragments rejoin: the parent range is sorted; the two source halves are consumed.
      setPhase(left, right, 'sorted');
      setPhase(left, mid, 'consumed');
      setPhase(mid + 1, right, 'consumed');
      mergeCursor = null;
      statusLabel = `MERGED [${left}..${right}] → [${temp.join(', ')}]`;
      statusKind = 'merged';

      let mergeMilestone: string | undefined;
      if (left === 0 && right === n - 1) {
        mergeMilestone = 'Top-Level Merge';
      } else if (!firstMergeMilestoneUsed) {
        mergeMilestone = 'First Merge';
        firstMergeMilestoneUsed = true;
      } else {
        mergeMilestone = maybeHalfMilestone();
      }

      pushFrame({
        codeLine: 18,
        action: 'MERGED',
        explanation: `Merged segment arr[${left}..${right}] is now sorted: [${temp.join(', ')}].`,
        highlight: active,
        pointers: { left, right },
        variables: { mergedCount: temp.length, range: `[${left}..${right}]`, mergedTotal: stats.merges },
        conditionEval: { expr: 'isSorted(range)', condition: temp.join(', '), result: true },
        soundCue: 'swap',
        milestone: mergeMilestone,
        auxiliary: tempAuxiliary(undefined, 'Copy-back finished; the auxiliary buffer is no longer needed for this range.'),
        pedagogy: {
          what: `The original array segment [${left}..${right}] now matches the sorted buffer.`,
          why: 'The merge invariant is restored for this range, so the parent merge can treat it as one sorted half.',
          whatNext: 'Return to the caller and continue merging larger ranges.',
        },
      });

      callStack.pop();
    }

    function mergesort(left: number, right: number, depth: number): void {
      stats.calls += 1;
      callStack.push({ name: 'mergesort', params: { left, right }, line: 2 });
      makeNode(left, right, depth, 'ready');
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        // The range visibly breaks apart: children appear on the next depth row.
        setPhase(left, right, 'splitting');
        makeNode(left, mid, depth + 1, 'ready');
        makeNode(mid + 1, right, depth + 1, 'ready');
        statusLabel = `DIVIDE [${left}..${right}] at mid ${mid} → [${left}..${mid}] + [${mid + 1}..${right}]`;
        statusKind = 'divide';
        pushFrame({
          codeLine: 3,
          action: 'DIVIDE',
          explanation: `Dividing range [${left}..${right}] at mid index ${mid}: left half [${left}..${mid}], right half [${mid + 1}..${right}].`,
          highlight: { [mid]: 'pivot' },
          pointers: { left, mid, right },
          variables: { left, mid, right, leftSize: mid - left + 1, rightSize: right - mid },
          conditionEval: { expr: 'left < right', condition: `${left} < ${right}`, result: true },
          soundCue: 'step',
          pedagogy: {
            what: `The range [${left}..${right}] splits into two halves at mid = ${mid}.`,
            why: 'Halving keeps the recursion depth at O(log N) — this is where the log N factor of the O(N log N) bound comes from.',
            whatNext: `Sort the left half [${left}..${mid}] first.`,
          },
        });
        setPhase(left, right, 'ready');

        pushFrame({
          codeLine: 4,
          action: 'CALL_LEFT',
          explanation: `Recurse on the left half [${left}..${mid}] (${mid - left + 1} element(s)).`,
          pointers: { left, right: mid },
          variables: { left, right: mid },
          soundCue: 'step',
          pedagogy: {
            what: 'The left recursive call is issued first.',
            why: 'The two halves are independent, so their order is a convention — depth-first left-first keeps the trace predictable.',
            whatNext: 'Watch the left half divide further until the base cases.',
          },
        });
        mergesort(left, mid, depth + 1);

        pushFrame({
          codeLine: 5,
          action: 'CALL_RIGHT',
          explanation: `Left half sorted. Recurse on the right half [${mid + 1}..${right}] (${right - mid} element(s)).`,
          pointers: { left: mid + 1, right },
          variables: { left: mid + 1, right },
          soundCue: 'step',
          pedagogy: {
            what: 'The right recursive call starts after the left one fully returns.',
            why: 'Only when both halves are individually sorted can the merge combine them.',
            whatNext: `With both halves sorted, call merge(arr, ${left}, ${mid}, ${right}).`,
          },
        });
        mergesort(mid + 1, right, depth + 1);

        pushFrame({
          codeLine: 6,
          action: 'MERGE_CALL',
          explanation: `Both halves of [${left}..${right}] are sorted — call merge(arr, ${left}, ${mid}, ${right}).`,
          pointers: { left, mid, right },
          variables: { left, mid, right },
          soundCue: 'step',
          pedagogy: {
            what: 'The merge subroutine is invoked on the two sorted halves.',
            why: 'Merging is where the actual ordering work happens; the divide phase only ever splits.',
            whatNext: 'Watch the two front pointers fill the temp buffer in sorted order.',
          },
        });
        merge(left, mid, right);
      } else {
        setPhase(left, right, 'base');
        statusLabel = `BASE CASE [${left}..${right}] = ${arr[left]} — a single element is already sorted`;
        statusKind = 'base';
        pushFrame({
          codeLine: 2,
          action: 'BASE_CASE',
          explanation: `Base case: range [${left}..${right}] contains one element (${arr[left]}), already sorted.`,
          highlight: { [left]: 'sorted' },
          pointers: { left, right },
          variables: { left, right, baseValue: arr[left] },
          conditionEval: { expr: 'left < right', condition: `${left} < ${right}`, result: false },
          soundCue: 'step',
          pedagogy: {
            what: `A single-element range [${left}..${right}] needs no further division.`,
            why: 'Any one-element array is sorted by definition; this is the recursion base case.',
            whatNext: 'Return to the parent call, which will merge this element with its sibling range.',
          },
        });
      }
      callStack.pop();
    }

    mergesort(0, n - 1, 0);

    // Final frame: the whole decomposition collapses back to one sorted range.
    const rootNode = makeNode(0, n - 1, 0);
    rootNode.phase = 'sorted';
    for (const node of nodeOrder) {
      if (node !== rootNode) node.phase = 'consumed';
    }
    mergeCursor = null;
    statusLabel = `DONE: [${arr.join(', ')}] is fully sorted`;
    statusKind = 'done';

    pushFrame({
      codeLine: 1,
      action: 'DONE',
      explanation: `Mergesort complete: [${arr.join(', ')}] is sorted after ${stats.merges} merge(s), ${stats.comparisons} comparison(s), ${stats.appends} appends and ${stats.copies} copy-backs.`,
      highlight: Object.fromEntries(arr.map((_, idx) => [idx, 'sorted' as ElementStatus])),
      pointers: {},
      variables: {
        result: n,
        comparisons: stats.comparisons,
        appends: stats.appends,
        copies: stats.copies,
        merges: stats.merges,
        calls: stats.calls,
      },
      conditionEval: { expr: 'isSorted(arr)', condition: arr.join(', '), result: isSorted(arr) },
      soundCue: 'finish',
      milestone: 'Mergesort Complete',
      pedagogy: {
        what: `Every range has been merged back into the array (${stats.merges} merges).`,
        why: 'Each merge restored the sorted invariant for its range, so after the top-level merge the whole array is sorted.',
        whatNext: 'Try the With Duplicates preset — equal values keep their relative order, demonstrating stability.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame, projection) => {
    return <MergeSortStage state={frame.state} projection={projection} />;
  },
};
