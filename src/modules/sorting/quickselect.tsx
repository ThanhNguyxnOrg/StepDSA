import { AlgorithmModule, ElementStatus, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

/**
 * Quickselect, rebuilt to the StepDSA teaching standard:
 * - one meaningful operation per frame (window → pivot pick → compare →
 *   swap/no-swap → pivot placed at its rank → found / prune),
 * - WHAT/WHY/NEXT pedagogy on every frame,
 * - two prediction checkpoints and real milestones,
 * - five language snippets that share the exact same statement per line, and
 * - honest input normalisation reported in the INIT frame.
 */

export interface QuickselectInput {
  array: number[];
  k: number;
}

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_INPUT = { array: [7, 10, 4, 3, 20, 15, 8], k: 3 };

interface NormalisedInput {
  array: number[];
  k: number;
  notes: string[];
}

function normalise(input: QuickselectInput | undefined): NormalisedInput {
  const notes: string[] = [];

  const raw = input && typeof input === 'object' ? input : DEFAULT_INPUT;
  const rawArray = Array.isArray(raw.array) ? raw.array : DEFAULT_INPUT.array;

  const usable = rawArray.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  let array: number[];
  if (rawArray.length > 0 && usable.length === 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    array = [...DEFAULT_INPUT.array];
  } else {
    if (usable.length < rawArray.length) {
      notes.push(`${rawArray.length - usable.length} non-numeric value(s) dropped`);
    }
    const clamped = usable.map((value) => {
      const rounded = Math.max(-MAX_ABS, Math.min(MAX_ABS, Math.round(value)));
      if (rounded !== Math.round(value)) {
        notes.push(`value ${Math.round(value)} clamped to ${rounded} (±${MAX_ABS})`);
      }
      return rounded;
    });
    array = clamped;
    if (array.length > MAX_LEN) {
      notes.push(`${array.length} values truncated to ${MAX_LEN} for a readable strip`);
      array = array.slice(0, MAX_LEN);
    }
  }

  // The target rank must land inside the array; anything else is clamped honestly.
  let k = typeof raw.k === 'number' && Number.isFinite(raw.k) ? Math.round(raw.k) : NaN;
  if (Number.isNaN(k)) {
    k = Math.floor((array.length - 1) / 2);
    notes.push(`k was not a number, so the median rank ${k} is used`);
  } else if (k < 0) {
    notes.push(`k = ${k} clamped to 0 (rank must be non-negative)`);
    k = 0;
  } else if (array.length > 0 && k > array.length - 1) {
    notes.push(`k = ${k} clamped to ${array.length - 1} (largest valid rank)`);
    k = array.length - 1;
  }

  return { array, k, notes };
}

export const quickselectModule: AlgorithmModule<QuickselectInput, ArrayStageState> = {
  id: 'quickselect',
  title: 'Quickselect (k-th Order Statistic O(N))',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Worst-case pivot selection (already sorted with extremal pivot)',
  },
  theory: {
    overview:
      'Quickselect is a selection algorithm to find the k-th smallest element in an unordered array. Like Quicksort, it partitions the array around a pivot, but recurses only into the partition containing the target rank k.',
    whyItWorks:
      'After partitioning around pivot p at index pivotIdx, all elements to the left are <= arr[pivotIdx], and all to the right are >= arr[pivotIdx]. If pivotIdx == k, we are done! If k < pivotIdx, the element is in the left subarray; otherwise in the right. Average runtime: N + N/2 + N/4 + ... = 2N = O(N).',
    invariant:
      'Partition Invariant: arr[low ... pivotIdx - 1] <= arr[pivotIdx] <= arr[pivotIdx + 1 ... high].',
    pitfalls: [
      'Confusing 0-indexed rank with 1-indexed k (k-th smallest).',
      'Choosing deterministic bad pivots (leads to O(N²) worst-case).',
      'Only the window containing rank k is ever partitioned — the other side is discarded, not sorted.',
    ],
    steps: [
      'Guard: an empty array has no k-th element; the rank k is clamped into [0..n-1] with a note.',
      'Partition the window around its last element; the pivot lands at its exact global rank.',
      'If the pivot rank equals k, the pivot is the answer.',
      'Otherwise discard the side that cannot contain rank k and shrink the window.',
      'Repeat until the window is a single rank match.',
    ],
    watchOut: [
      'k is a 0-indexed rank: k = 0 is the minimum, k = n - 1 is the maximum.',
      'Unlike quicksort, the array is only partially ordered when quickselect finishes.',
    ],
  },
  presets: [
    {
      id: 'median',
      label: 'Find Median (k = 3 in 7 items)',
      description: 'Finds 3rd index (0-indexed) element in [7, 10, 4, 3, 20, 15, 8]',
      data: { array: [7, 10, 4, 3, 20, 15, 8], k: 3 },
    },
    {
      id: 'smallest',
      label: 'Find Minimum (k = 0)',
      description: 'Converges directly to the smallest element',
      data: { array: [25, 12, 48, 6, 33, 19], k: 0 },
    },
    {
      id: 'kth-largest',
      label: 'Find 2nd Largest (k = 5 in 7 items)',
      description: 'k = 5 in array of 7 elements',
      data: { array: [14, 3, 9, 21, 5, 18, 12], k: 5 },
    },
    {
      id: 'single-element',
      label: 'One Element (k = 0)',
      description: 'The first partition is already the answer',
      data: { array: [42], k: 0 },
    },
  ],
  defaultInput: { array: [7, 10, 4, 3, 20, 15, 8], k: 3 },
  codeSnippets: {
    python: `def partition(arr, low, high):
    pivot = arr[high]
    i = low
    for j in range(low, high):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[high] = arr[high], arr[i]
    return i
def quickselect(arr, k):
    low = 0
    high = len(arr) - 1
    while low <= high:
        p_idx = partition(arr, low, high)
        if p_idx == k: return arr[p_idx]
        elif p_idx < k:
            low = p_idx + 1
        else:
            high = p_idx - 1
    return -1`,
    typescript: `function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low;
  for (let j = low; j < high; ++j) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++; } }
  [arr[i], arr[high]] = [arr[high], arr[i]];
  return i; }
function quickselect(arr: number[], k: number): number {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const pIdx = partition(arr, low, high);
    if (pIdx === k) return arr[pIdx];
    if (pIdx < k) {
      low = pIdx + 1; }
    else {
      high = pIdx - 1; } }
  return -1; }`,
    cpp: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low;
    for (int j = low; j < high; ++j) {
        if (arr[j] <= pivot) {
            swap(arr[i], arr[j]);
            i++; } }
    swap(arr[i], arr[high]);
    return i; }
int quickselect(vector<int>& arr, int k) {
    int low = 0;
    int high = (int)arr.size() - 1;
    while (low <= high) {
        int pIdx = partition(arr, low, high);
        if (pIdx == k) return arr[pIdx];
        if (pIdx < k) {
            low = pIdx + 1; }
        else {
            high = pIdx - 1; } }
    return -1; }`,
    java: `int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low;
    for (int j = low; j < high; ++j) {
        if (arr[j] <= pivot) {
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            i++; } }
    int t = arr[i]; arr[i] = arr[high]; arr[high] = t;
    return i; }
int quickselect(int[] arr, int k) {
    int low = 0;
    int high = arr.length - 1;
    while (low <= high) {
        int pIdx = partition(arr, low, high);
        if (pIdx == k) return arr[pIdx];
        if (pIdx < k) {
            low = pIdx + 1; }
        else {
            high = pIdx - 1; } }
    return -1; }`,
    pseudocode: `function partition(arr, low, high):
    pivot = arr[high]
    i = low
    for j from low to high - 1:
        if arr[j] <= pivot:
            swap arr[i] with arr[j]
            i = i + 1
    swap arr[i] with arr[high]
    return i
function quickselect(arr, k):
    low = 0
    high = length(arr) - 1
    while low <= high:
        pIdx = partition(arr, low, high)
        if pIdx == k: return arr[pIdx]
        else if pIdx < k:
            low = pIdx + 1
        else:
            high = pIdx - 1
    return -1`,
  },
  generateTimeline: (input: QuickselectInput): ExecutionFrame<ArrayStageState>[] => {
    const { array, k, notes } = normalise(input);
    const arr = [...array];
    const n = arr.length;
    let low = 0;
    let high = n - 1;
    const finalPlaced = new Set<number>();
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const stats = { comparisons: 0, swaps: 0, partitions: 0 };

    let actionType:
      | 'INIT'
      | 'WINDOW'
      | 'PIVOT_SELECTED'
      | 'COMPARE'
      | 'SWAP'
      | 'NO_SWAP'
      | 'PIVOT_PLACED'
      | 'FOUND'
      | 'PRUNE_RIGHT'
      | 'PRUNE_LEFT'
      | 'DONE' = 'INIT';
    let rankCheckpointAdded = false;
    let pruneCheckpointAdded = false;
    let firstRankMilestoneUsed = false;
    let halfMilestoneUsed = false;

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && n - (high - low + 1) >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Discarded';
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
      statuses?: Record<number, ElementStatus>;
      pointers?: Record<string, number>;
    }) => {
      const statusFor = (idx: number): ElementStatus => {
        if (opts.statuses?.[idx]) return opts.statuses[idx];
        if (finalPlaced.has(idx)) return 'sorted';
        if (idx >= low && idx <= high) return 'active';
        return 'discarded';
      };

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
            opts.statuses && Object.keys(opts.statuses).length === 1 && 'answerIdx' in (opts.statuses as any)
              ? `arr[${(opts.statuses as any).answerIdx}] is the element of rank ${k}`
              : `arr[${low}..${high}] <= rank-${k} <= window; discarded sides can never hold the answer`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [
          { name: 'quickselect', params: { k, n, low, high }, line: opts.codeLine, isCurrent: true },
        ],
        state: {
          array: arr.map((val, idx) => ({ id: idx, value: val, status: statusFor(idx) })),
          pointers: opts.pointers ?? { low, high, targetK: k },
        },
      });
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (n > 0) {
      pushFrame({
        codeLine: 11,
        explanation:
          `low = 0, high = ${n - 1}: the search starts on the whole array, hunting the element of rank k = ${k} (0-indexed).` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        conditionEval: { expr: 'k >= 0 && k < n', condition: `${k} in [0..${n - 1}]`, result: true },
        variables: { targetK: k, low, high, n },
        soundCue: 'start',
        pedagogy: {
          what: `We need the element of rank k = ${k} in [0..${n - 1}] — not a fully sorted array.`,
          why: 'Partitioning tells us the exact final rank of the pivot, so we can discard half of the search space each round: N + N/2 + N/4 + … = O(N).',
          whatNext: `Partition the window [${low}..${high}] around the last element as pivot.`,
        },
      });

      while (low <= high) {
        const pivot = arr[high];
        let i = low;

        actionType = 'WINDOW';
        pushFrame({
          codeLine: 13,
          explanation: `Search window is [${low}..${high}] (${high - low + 1} element(s)). Rank k = ${k} must lie inside it if it exists.`,
          conditionEval: { expr: 'low <= high', condition: `${low} <= ${high}`, result: true },
          variables: { low, high, targetK: k, windowSize: high - low + 1 },
          pedagogy: {
            what: `A new iteration starts on window [${low}..${high}].`,
            why: 'All indices outside this window were proven to be on the wrong side of rank k and can never be the answer.',
            whatNext: `Pick the window's last element arr[${high}] = ${pivot} as the pivot.`,
          },
          statuses: Object.fromEntries(
            arr.map((_, idx) => [idx, idx >= low && idx <= high ? ('active' as ElementStatus) : ('discarded' as ElementStatus)])
          ),
        });

        actionType = 'PIVOT_SELECTED';
        pushFrame({
          codeLine: 2,
          explanation: `Pivot = arr[${high}] = ${pivot}, the last element of the window [${low}..${high}].`,
          soundCue: 'pivot',
          variables: { pivot, low, high, targetK: k },
          conditionEval: { expr: 'pivot = arr[high]', condition: `${pivot} @ [${high}]`, result: pivot },
          statuses: {
            [high]: 'pivot',
            ...Object.fromEntries(
              Array.from({ length: high - low }, (_, off) => [low + off, 'active' as ElementStatus])
            ),
          },
          pointers: { low, high, pivotIdx: high, targetK: k },
          pedagogy: {
            what: `Pivot = ${pivot} (last element of the window).`,
            why: 'After one partition pass, the pivot sits at its exact global rank — the only fact quickselect needs.',
            whatNext: `Scan j = ${low}..${high - 1}: everything ≤ ${pivot} moves into the left (≤) partition.`,
          },
        });

        for (let j = low; j < high; ++j) {
          const isLessOrEqual = arr[j] <= pivot;
          stats.comparisons += 1;
          actionType = 'COMPARE';

          pushFrame({
            codeLine: 5,
            explanation: `Compare arr[${j}] = ${arr[j]} with pivot ${pivot} → ${isLessOrEqual ? '<= pivot, joins the left partition' : '> pivot, stays on the right'}.`,
            soundCue: 'compare',
            variables: { 'arr[j]': arr[j], pivot, i, j, isLessOrEqual },
            conditionEval: {
              expr: `arr[${j}] <= pivot`,
              condition: `${arr[j]} <= ${pivot}`,
              result: isLessOrEqual,
            },
            statuses: {
              [high]: 'pivot',
              [j]: 'comparing',
              ...Object.fromEntries(
                Array.from({ length: high - low }, (_, off) => {
                  const idx = low + off;
                  if (idx === j || idx === high) return [idx, undefined];
                  return [idx, 'active' as ElementStatus];
                }).filter(([, v]) => v !== undefined)
              ),
            },
            pointers: { low, i, j, high, targetK: k },
            pedagogy: {
              what: `Candidate arr[${j}] = ${arr[j]} faces pivot ${pivot}.`,
              why: 'The left partition holds only values ≤ pivot; this test decides which side of the boundary this element belongs to.',
              whatNext: isLessOrEqual
                ? `It belongs left: swap it into slot i = ${i} (if needed) and advance i.`
                : 'It belongs right: leave it where it is and keep scanning.',
            },
          });

          if (isLessOrEqual) {
            if (i !== j) {
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;
              stats.swaps += 1;
              actionType = 'SWAP';
              pushFrame({
                codeLine: 6,
                explanation: `Swapped arr[${i}] (${temp}) ⇄ arr[${j}] (${arr[i]}): the smaller value joins the left partition.`,
                soundCue: 'swap',
                variables: { swapped: true, indexA: i, indexB: j, valA: arr[i], valB: arr[j] },
                conditionEval: { expr: 'i !== j', condition: `${i} !== ${j}`, result: true },
                statuses: { [i]: 'swapping', [j]: 'swapping', [high]: 'pivot' },
                pointers: { low, i, j, high, targetK: k },
                pedagogy: {
                  what: `${temp} moved right past ${arr[i]}; the ≤-partition boundary advanced to i = ${i}.`,
                  why: 'Swapping (instead of shifting) keeps the partition loop linear with at most one exchange per element.',
                  whatNext: `Advance i to ${i + 1} and continue the scan at j = ${j + 1}.`,
                },
              });
            } else {
              actionType = 'NO_SWAP';
              pushFrame({
                codeLine: 6,
                explanation: `arr[${j}] (${arr[j]}) ≤ pivot and i === j (${i}): the element already sits inside the left partition, so the swap is skipped.`,
                variables: { noSwap: true, i, j, pivot },
                conditionEval: { expr: 'i !== j', condition: `${i} === ${j}`, result: false },
                statuses: { [j]: 'active', [high]: 'pivot' },
                pointers: { low, i, j, high, targetK: k },
                pedagogy: {
                  what: `The candidate is already exactly where the left partition expects it (i === j = ${i}).`,
                  why: 'The `i !== j` guard avoids a useless self-swap — the same short-circuit a real implementation uses.',
                  whatNext: `Advance i to ${i + 1} and continue scanning.`,
                },
              });
            }
            i++;
          }
        }

        // Swap pivot to i
        const temp = arr[i];
        arr[i] = arr[high];
        arr[high] = temp;
        const pIdx = i;
        finalPlaced.add(pIdx);
        stats.partitions += 1;
        actionType = 'PIVOT_PLACED';

        const rankCheckpoint: PredictionCheckpoint | undefined = !rankCheckpointAdded
          ? pIdx === k
            ? {
                id: 'quickselect-rank-decision',
                question: `The pivot settled at rank ${pIdx}, and the target is k = ${k}. Is the search over?`,
                options: ['Yes — the pivot IS the k-th element', 'No — partition the remaining window again'],
                correctIndex: 0,
                explanation: `pIdx = ${pIdx} === k: exactly ${k} values are ≤ the pivot, so it is the k-th smallest element.`,
                hint: 'How many values are strictly left of the pivot after partitioning?',
              }
            : {
                id: 'quickselect-rank-decision',
                question: `The pivot settled at rank ${pIdx}, but the target rank is k = ${k}. Where must the k-th element be?`,
                options: ['In the left window', 'In the right window'],
                correctIndex: pIdx < k ? 1 : 0,
                explanation:
                  pIdx < k
                    ? `${pIdx} < ${k}: rank ${k} lies beyond the pivot — keep the right window.`
                    : `${pIdx} > ${k}: rank ${k} lies before the pivot — keep the left window.`,
                hint: 'Which side of the pivot holds ranks greater than pIdx?',
              }
          : undefined;

        const placedMilestone = !firstRankMilestoneUsed ? 'First Rank Locked' : maybeHalfMilestone();
        if (placedMilestone) firstRankMilestoneUsed = true;

        pushFrame({
          codeLine: 8,
          explanation: `Pivot ${arr[pIdx]} placed at its final rank ${pIdx} (${stats.partitions} partition(s) done). Comparing pIdx (${pIdx}) with k (${k}).`,
          soundCue: 'sorted',
          milestone: placedMilestone,
          checkpoint: rankCheckpoint,
          variables: { pIdx, targetK: k, pivotVal: arr[pIdx], rankMatch: pIdx === k },
          conditionEval: { expr: 'pIdx === k', condition: `${pIdx} === ${k}`, result: pIdx === k },
          statuses: { [pIdx]: 'sorted' },
          pointers: { low, high, pIdx, targetK: k },
          pedagogy: {
            what: `The pivot ${arr[pIdx]} now sits at global rank ${pIdx} — everything left is ≤ it, everything right is ≥ it.`,
            why: 'That rank is final: no future operation can move this value, which is why we can discard one side entirely.',
            whatNext:
              pIdx === k
                ? `pIdx equals k = ${k} — this is the answer!`
                : pIdx < k
                  ? `Rank ${k} is to the RIGHT of ${pIdx}; discard the left side.`
                  : `Rank ${k} is to the LEFT of ${pIdx}; discard the right side.`,
          },
        });
        if (rankCheckpoint) rankCheckpointAdded = true;

        if (pIdx === k) {
          actionType = 'FOUND';
          pushFrame({
            codeLine: 15,
            explanation: `Rank match found! Pivot index ${pIdx} == k (${k}). The k-th smallest element is ${arr[pIdx]}.`,
            soundCue: 'complete',
            milestone: `Found k-th Element: ${arr[pIdx]}`,
            variables: { found: true, k, answer: arr[pIdx], result: arr[pIdx] },
            conditionEval: { expr: 'pIdx === k', condition: `${pIdx} === ${k}`, result: true },
            statuses: { [k]: 'sorted', answerIdx: k } as any,
            pointers: { targetK: k },
            pedagogy: {
              what: `The partition placed ${arr[pIdx]} at exactly rank k = ${k}.`,
              why: 'The left partition contains k smaller-or-equal values, so by definition this element is the k-th smallest.',
              whatNext: 'Total work was N + N/2 + N/4 + … — about 2N comparisons, not a full O(N log N) sort.',
            },
          });
          break;
        }

        if (pIdx < k) {
          actionType = 'PRUNE_RIGHT';
          const pruneCheckpoint: PredictionCheckpoint | undefined = !pruneCheckpointAdded
            ? {
                id: 'quickselect-prune-direction',
                question: `pIdx = ${pIdx} < k = ${k}. Which side of the array can be discarded?`,
                options: [
                  `The right side [${pIdx + 1}..${high}] — the answer is left of the pivot`,
                  `The left side [${low}..${pIdx}] — every rank there is smaller than k`,
                ],
                correctIndex: 1,
                explanation: `All of [${low}..${pIdx}] holds ranks < k, so none of them can be the answer; the window becomes [${pIdx + 1}..${high}].`,
                hint: 'Ranks left of the pivot are all smaller than pIdx.',
              }
            : undefined;

          pushFrame({
            codeLine: 17,
            explanation: `pIdx (${pIdx}) < k (${k}): the target rank lies right. Pruning [${low}..${pIdx}]; new low = ${pIdx + 1}.`,
            variables: { pIdx, k, pruneDirection: 'RIGHT-KEEP', newLow: pIdx + 1 },
            conditionEval: { expr: 'pIdx < k', condition: `${pIdx} < ${k}`, result: true },
            checkpoint: pruneCheckpoint,
            statuses: Object.fromEntries(
              arr.map((_, idx) => [idx, idx > pIdx && idx <= high ? ('active' as ElementStatus) : ('discarded' as ElementStatus)])
            ),
            pointers: { low: pIdx + 1, high, targetK: k },
            pedagogy: {
              what: 'The pivot is smaller than the target rank, so the k-th element must be somewhere to the right.',
              why: 'All of [low..pIdx] holds values with ranks < k — none of them can be the answer, so the left side is discarded in one move.',
              whatNext: `Continue with the window [${pIdx + 1}..${high}].`,
            },
          });
          if (pruneCheckpoint) pruneCheckpointAdded = true;
          low = pIdx + 1;
        } else {
          actionType = 'PRUNE_LEFT';
          const pruneCheckpoint: PredictionCheckpoint | undefined = !pruneCheckpointAdded
            ? {
                id: 'quickselect-prune-direction',
                question: `pIdx = ${pIdx} > k = ${k}. Which side of the array can be discarded?`,
                options: [
                  `The left side [${low}..${pIdx - 1}] — the answer is right of the pivot`,
                  `The right side [${pIdx}..${high}] — every rank there is greater than k`,
                ],
                correctIndex: 1,
                explanation: `All of [${pIdx}..${high}] holds ranks > k, so none of them can be the answer; the window becomes [${low}..${pIdx - 1}].`,
                hint: 'Ranks right of the pivot are all greater than pIdx.',
              }
            : undefined;

          pushFrame({
            codeLine: 19,
            explanation: `pIdx (${pIdx}) > k (${k}): the target rank lies left. Pruning [${pIdx}..${high}]; new high = ${pIdx - 1}.`,
            variables: { pIdx, k, pruneDirection: 'LEFT-KEEP', newHigh: pIdx - 1 },
            conditionEval: { expr: 'pIdx > k', condition: `${pIdx} > ${k}`, result: true },
            checkpoint: pruneCheckpoint,
            statuses: Object.fromEntries(
              arr.map((_, idx) => [idx, idx >= low && idx < pIdx ? ('active' as ElementStatus) : ('discarded' as ElementStatus)])
            ),
            pointers: { low, high: pIdx - 1, targetK: k },
            pedagogy: {
              what: 'The pivot already outranks the target, so the k-th element must be somewhere to the left.',
              why: 'All of [pIdx..high] holds values with ranks ≥ pIdx > k — the right side cannot contain the answer.',
              whatNext: `Continue with the window [${low}..${pIdx - 1}].`,
            },
          });
          if (pruneCheckpoint) pruneCheckpointAdded = true;
          high = pIdx - 1;
        }
      }
    } else {
      // Explicitly empty input: a valid two-frame run, not a fallback.
      pushFrame({
        codeLine: 11,
        explanation:
          'n = length(arr) = 0: there is no element of any rank to select.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        conditionEval: { expr: 'k >= 0 && k < n', condition: `${k} < 0`, result: false },
        variables: { targetK: k, low: 0, high: -1, n: 0 },
        soundCue: 'start',
        pedagogy: {
          what: 'The array is empty, so no rank exists inside it.',
          why: 'Quickselect partitions elements; with zero elements there is nothing to partition and no k-th element.',
          whatNext: 'Return the sentinel -1.',
        },
      });
      actionType = 'DONE';
      pushFrame({
        codeLine: 20,
        explanation: 'Quickselect on an empty array returns the sentinel -1 — there is no k-th smallest element.',
        conditionEval: { expr: 'low <= high', condition: '0 <= -1', result: false },
        variables: { found: false, result: -1 },
        soundCue: 'complete',
        milestone: 'Nothing to Select',
        pedagogy: {
          what: 'The while guard low <= high is false immediately (0 <= -1).',
          why: 'The sentinel -1 mirrors the snippet: no partition ever ran, so no element can be returned.',
          whatNext: 'Load a preset such as Find Median to watch the rank search converge.',
        },
      });
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
