import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface KadaneInput {
  array: number[];
}

export interface KadaneCandidate {
  i: number;
  val: number;
  prefixSum: number;
  extendedSum: number;
  restart: boolean;
  newMax: boolean;
}

export interface KadaneState {
  array: number[];
  currentIndex: number;
  /** Best sum of a subarray ending exactly at currentIndex. */
  currentSum: number;
  maxSum: number;
  /** Current running window [windowStart..windowEnd]. */
  windowStart: number;
  windowEnd: number;
  /** Best window seen so far [bestStart..bestEnd]. */
  bestStart: number;
  bestEnd: number;
  phase: 'init' | 'setup' | 'scan' | 'done';
  actionType: 'INIT' | 'SETUP' | 'CHECK' | 'RESTART' | 'EXTEND' | 'MAXCHECK' | 'NEWMAX' | 'RECORD' | 'NONE';
  candidate: KadaneCandidate | null;
  stats: {
    elements: number;
    restarts: number;
    maxUpdates: number;
  };
}

const MAX_LEN = 10;
const MAX_ABS = 999;

const DEFAULT_ARRAY = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

function normalise(input: KadaneInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = Array.isArray(input?.array) ? input.array : DEFAULT_ARRAY;
  const usable = raw.filter((value) => typeof value === 'number' && Number.isFinite(value));

  if (usable.length === 0 && raw.length > 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }
  if (usable.length < raw.length) {
    notes.push(`${raw.length - usable.length} non-numeric value(s) dropped`);
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

function bruteForceMax(array: number[]): number {
  let best = -Infinity;
  for (let i = 0; i < array.length; i++) {
    let sum = 0;
    for (let j = i; j < array.length; j++) {
      sum += array[j];
      best = Math.max(best, sum);
    }
  }
  return best;
}

export const kadanesAlgorithmModule: AlgorithmModule<KadaneInput, KadaneState> = {
  id: 'kadanes-algorithm',
  title: "Kadane's Algorithm (Maximum Subarray Sum)",
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'house-robber', label: 'House Robber' },
    { id: 'climbing-stairs', label: 'Climbing Stairs' },
    { id: 'two-pointers-water', label: 'Two Pointers (container)' },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Guaranteed single-pass linear time O(N) across all input arrays',
  },
  theory: {
    overview:
      "Kadane's Algorithm finds the maximum sum over all contiguous subarrays in one linear pass. At each element it decides: extend the running subarray, or throw the prefix away and start fresh here.",
    whyItWorks:
      'The best subarray ending at index i either contains nothing before i (currentSum + nums[i] < nums[i], i.e. the accumulated prefix is negative) or extends the best subarray ending at i-1. A negative prefix can never help a later sum, so discarding it is always safe.',
    invariant:
      'After processing index i, currentSum is the maximum subarray sum ending exactly at i, and maxSum is the maximum over all endings seen so far.',
    pitfalls: [
      'Initialising maxSum to 0 fails when every element is negative — the answer is the largest single element, so seed with nums[0] (or -infinity).',
      'The restart test is `currentSum < 0`, NOT `nums[i] < 0`: a negative element can still be worth extending when the running sum is positive.',
      'A subarray must be contiguous and non-empty — you cannot skip elements the way LIS or the house-robber recurrence does.',
      'The running window [start..i] and the best window [bestStart..bestEnd] are different things; confusing them loses the answer location.',
    ],
    steps: [
      'Guard: an empty array has no subarray — return 0 with an empty window.',
      'Seed currentSum = maxSum = nums[0]; the running window and the best window both start at index 0.',
      'For each i from 1: if currentSum < 0, restart — currentSum = nums[i] and the window moves to i.',
      'Otherwise extend: currentSum += nums[i], growing the window to include i.',
      'If currentSum beats maxSum, record it together with the window bounds.',
      'The answer is maxSum with the window [bestStart..bestEnd].',
    ],
    watchOut: [
      'Every element is visited exactly once — there is no backtracking and no second pass.',
      'On an all-negative array the algorithm still works: it simply restarts at every element and keeps the largest single one.',
    ],
  },
  defaultInput: { array: DEFAULT_ARRAY },
  presets: [
    {
      id: 'leetcode-53',
      label: 'LeetCode 53 Standard',
      description: '[-2, 1, -3, 4, -1, 2, 1, -5, 4] — max 6 with the window [4, -1, 2, 1] (indices 3..6)',
      data: { array: DEFAULT_ARRAY },
    },
    {
      id: 'all-negatives',
      label: 'All Negative Numbers',
      description: '[-8, -3, -6, -2, -5] — every prefix is poison, so the answer is the single element -2',
      data: { array: [-8, -3, -6, -2, -5] },
    },
    {
      id: 'alternating',
      label: 'Alternating High Spikes',
      description: '[5, -2, 3, -8, 7, 2, -1, 4] — one dead prefix restart, final max 12 over [7, 2, -1, 4]',
      data: { array: [5, -2, 3, -8, 7, 2, -1, 4] },
    },
    {
      id: 'single-element',
      label: 'One Element',
      description: '[-7] — the loop never runs; the seeded answer is returned directly',
      data: { array: [-7] },
    },
  ],
  codeSnippets: {
    pseudocode: `function maxSubArray(nums):
    if length(nums) == 0: return 0, []
    currentSum = nums[0]
    maxSum = nums[0]
    start = 0
    bestStart = 0
    bestEnd = 0
    for i = 1 to length(nums) - 1:
        if currentSum < 0:
            currentSum = nums[i]
            start = i
        else:
            currentSum = currentSum + nums[i]
        if currentSum > maxSum:
            maxSum = currentSum
            bestStart = start
            bestEnd = i
    return maxSum, bestStart, bestEnd`,
    python: `def max_subarray(nums):
    if len(nums) == 0: return 0, 0, 0
    current_sum = nums[0]
    max_sum = nums[0]
    start = 0
    best_start = 0
    best_end = 0
    for i in range(1, len(nums)):
        if current_sum < 0:
            current_sum = nums[i]
            start = i
        else:
            current_sum = current_sum + nums[i]
        if current_sum > max_sum:
            max_sum = current_sum
            best_start = start
            best_end = i
    return max_sum, best_start, best_end`,
    typescript: `function maxSubArray(nums: number[]): [number, number, number] {
  if (nums.length === 0) return [0, 0, 0];
  let currentSum = nums[0];
  let maxSum = nums[0];
  let start = 0;
  let bestStart = 0;
  let bestEnd = 0;
  for (let i = 1; i < nums.length; i++) {
    if (currentSum < 0) {
      currentSum = nums[i];
      start = i;
    } else {
      currentSum = currentSum + nums[i]; }
    if (currentSum > maxSum) {
      maxSum = currentSum;
      bestStart = start;
      bestEnd = i; } }
  return [maxSum, bestStart, bestEnd]; }`,
    cpp: `void maxSubArray(vector<int>& nums, int& outSum, int& outStart, int& outEnd) {
    if (nums.empty()) { outSum = 0; outStart = 0; outEnd = 0; return; }
    int currentSum = nums[0];
    int maxSum = nums[0];
    int start = 0;
    int bestStart = 0;
    int bestEnd = 0;
    for (int i = 1; i < (int)nums.size(); i++) {
        if (currentSum < 0) {
            currentSum = nums[i];
            start = i;
        } else {
            currentSum = currentSum + nums[i]; }
        if (currentSum > maxSum) {
            maxSum = currentSum;
            bestStart = start;
            bestEnd = i; } }
    outSum = maxSum; outStart = bestStart; outEnd = bestEnd; }`,
    java: `public int[] maxSubArray(int[] nums) {
    if (nums.length == 0) return new int[] {0, 0, 0};
    int currentSum = nums[0];
    int maxSum = nums[0];
    int start = 0;
    int bestStart = 0;
    int bestEnd = 0;
    for (int i = 1; i < nums.length; i++) {
        if (currentSum < 0) {
            currentSum = nums[i];
            start = i;
        } else {
            currentSum = currentSum + nums[i]; }
        if (currentSum > maxSum) {
            maxSum = currentSum;
            bestStart = start;
            bestEnd = i; } }
    return new int[] {maxSum, bestStart, bestEnd}; }`,
  },

  generateTimeline: (input: KadaneInput): ExecutionFrame<KadaneState>[] => {
    const { array: arr, notes } = normalise(input);
    const n = arr.length;

    const frames: ExecutionFrame<KadaneState>[] = [];
    let phase: KadaneState['phase'] = 'init';
    let currentIndex = -1;
    let actionType: KadaneState['actionType'] = 'INIT';
    let candidate: KadaneCandidate | null = null;

    let currentSum = 0;
    let maxSum = 0;
    let windowStart = 0;
    let windowEnd = 0;
    let bestStart = 0;
    let bestEnd = 0;
    const stats = { elements: 0, restarts: 0, maxUpdates: 0 };

    let firstRestartMilestone = false;
    let firstMaxMilestone = false;
    let restartCheckpointAdded = false;
    let maxCheckpointAdded = false;

    const snapshot = (): KadaneState => ({
      array: [...arr],
      currentIndex,
      currentSum,
      maxSum,
      windowStart,
      windowEnd,
      bestStart,
      bestEnd,
      phase,
      actionType,
      candidate: candidate ? { ...candidate } : null,
      stats: { ...stats },
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<KadaneState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<KadaneState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(),
        callStack: [
          { name: 'maxSubArray(nums)', params: { n, i: currentIndex }, line: opts.codeLine, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: stats.elements * 2, swaps: stats.maxUpdates, accesses: stats.elements * 2, lookups: 0 },
        invariantStatus: {
          label:
            phase === 'init' || phase === 'setup'
              ? 'The running window and the best window both start at index 0'
              : phase === 'scan'
                ? `currentSum = ${currentSum} (best subarray ending at ${currentIndex}); maxSum = ${maxSum}`
                : `Answer: maxSum = ${maxSum} over [${bestStart}..${bestEnd}]`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    pushFrame({
      codeLine: 2,
      action: 'INIT',
      explanation:
        `n = length(nums) = ${n} element(s) [${arr.join(', ')}]. The empty guard is ${n === 0 ? 'TRUE — a zero-length array has no non-empty subarray, so the answer is 0 with an empty window' : 'false, so the scan runs'}.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'length(nums) == 0', condition: `${n} == 0`, result: n === 0 },
      variables: { n, values: arr.join(', ') },
      soundCue: 'start',
      pedagogy: {
        what: `A contiguous (non-skipping) maximum-sum subarray problem over ${n} element(s).`,
        why: 'The empty guard exists because Kadane seeds from nums[0]; an empty array would read an undefined element.',
        whatNext: n > 0 ? 'Seed currentSum and maxSum with nums[0].' : 'Return 0 with an empty window.',
      },
    });

    if (n === 0) {
      phase = 'done';
      pushFrame({
        codeLine: 2,
        action: 'EMPTY_DONE',
        explanation: 'Empty array: return maxSum = 0 with an empty window — there is no non-empty subarray to consider.',
        variables: { maxSum: 0, window: '[]' },
        milestone: 'Empty Array',
        soundCue: 'finish',
        pedagogy: {
          what: 'No elements means no subarrays.',
          why: 'A subarray must be non-empty and contiguous; the empty input has neither.',
          whatNext: 'Try a preset — the all-negative one shows why seeding with nums[0] matters.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    phase = 'setup';
    currentIndex = 0;
    currentSum = arr[0];
    actionType = 'SETUP';
    pushFrame({
      codeLine: 3,
      action: 'SETUP_CUR',
      explanation: `currentSum = nums[0] = ${arr[0]}: the best subarray ending at index 0 is the element itself.`,
      conditionEval: { expr: 'currentSum = nums[0]', condition: `${arr[0]}`, result: currentSum, formatted: `currentSum = ${currentSum}` },
      variables: { i: 0, 'nums[0]': arr[0], currentSum },
      soundCue: 'step',
      pedagogy: {
        what: 'The running sum is seeded with the first element.',
        why: 'Subarrays are non-empty, so the best one ending at index 0 is exactly nums[0] — there is nothing before it to extend.',
        whatNext: `Seed maxSum with the same value.`,
      },
    });

    maxSum = arr[0];
    actionType = 'SETUP';
    pushFrame({
      codeLine: 4,
      action: 'SETUP_MAX',
      explanation: `maxSum = nums[0] = ${arr[0]}: seeding with the element itself (never 0) is what makes all-negative arrays work.`,
      variables: { i: 0, maxSum, window: '[0..0]' },
      milestone: 'Base Window Seeded',
      soundCue: 'step',
      pedagogy: {
        what: `The global maximum starts at ${arr[0]}.`,
        why: 'If every element is negative, a 0 seed would report the empty subarray and hide the true answer — the largest single element.',
        whatNext: 'Initialise the window trackers at index 0.',
      },
    });

    windowStart = 0;
    windowEnd = 0;
    bestStart = 0;
    bestEnd = 0;
    pushFrame({
      codeLine: 5,
      action: 'WINDOW_INIT',
      explanation: 'Window trackers: the running window starts at index 0, and the best window is likewise [0..0] until something beats it.',
      variables: { window: '[0..0]', best: '[0..0]' },
      soundCue: 'step',
      pedagogy: {
        what: 'Two windows are tracked: the running one and the best one.',
        why: 'maxSum alone says how good the answer is; the window bounds say which subarray achieves it.',
        whatNext: n > 1 ? `Scan element 1 (value ${arr[1]}).` : 'n = 1, so the scan loop is skipped and the seed is the answer.',
      },
    });

    phase = 'scan';
    if (n === 1) {
      pushFrame({
        codeLine: 8,
        action: 'SCAN_SKIP',
        explanation: 'n = 1, so the scan loop never runs: currentSum and maxSum both stay nums[0], and the window is [0..0].',
        variables: { skippedElements: 0, maxSum, window: '[0..0]' },
        soundCue: 'step',
        pedagogy: {
          what: 'With one element the loop range 1..0 is empty.',
          why: 'The seeds already satisfy the invariant for the whole array.',
          whatNext: 'Return the seeded answer.',
        },
      });
    }

    for (let i = 1; i < n; i++) {
      const val = arr[i];
      const prefixSum = currentSum;
      const extendedSum = currentSum + val;
      const restart = prefixSum < 0;
      currentIndex = i;
      stats.elements++;
      candidate = { i, val, prefixSum, extendedSum, restart, newMax: false };

      actionType = 'CHECK';
      pushFrame({
        codeLine: 9,
        action: 'CHECK_PREFIX',
        explanation: `Element ${i} (value ${val}): the running sum is ${prefixSum}. Test currentSum < 0 — ${restart ? `it is negative, so dragging it along would only drag nums[i] down (${extendedSum} < ${val})` : `it is non-negative, so extending beats starting over (${extendedSum} >= ${val})`}.`,
        conditionEval: {
          expr: `currentSum < 0`,
          condition: `${prefixSum} < 0`,
          result: restart,
        },
        variables: {
          i,
          'nums[i]': val,
          currentSum: prefixSum,
          extendedSum,
          freshSum: val,
          restart,
        },
        soundCue: 'compare',
        pedagogy: {
          what: `Testing whether the accumulated prefix is worth keeping.`,
          why: 'A negative prefix subtracts from every future sum, so dropping it can never hurt — this single comparison is the entire heuristic.',
          whatNext: restart ? `Restart: currentSum = ${val}, window moves to ${i}.` : `Extend: currentSum = ${prefixSum} + ${val} = ${extendedSum}.`,
        },
      });

      if (restart) {
        currentSum = val;
        stats.restarts++;
        actionType = 'RESTART';
        pushFrame({
          codeLine: 10,
          action: 'RESTART',
          explanation: `currentSum = nums[${i}] = ${val}: the old prefix (${prefixSum}) is dead weight, so the best subarray ending here starts fresh at this element.`,
          conditionEval: {
            expr: `currentSum = nums[${i}]`,
            condition: `${val}`,
            result: currentSum,
            formatted: `currentSum = ${currentSum}`,
          },
          variables: {
            i,
            discardedPrefix: prefixSum,
            currentSum,
          },
          milestone: !firstRestartMilestone ? 'First Prefix Restart' : undefined,
          soundCue: 'discard',
          checkpoint:
            !restartCheckpointAdded
              ? {
                  id: 'kadane-negative-prefix',
                  question: `Before reading nums[${i}] = ${val}, currentSum is ${prefixSum} (negative). What should the running sum become?`,
                  options: [
                    `${val} — drop the dead prefix and start fresh at this element`,
                    `${extendedSum} — keep dragging the negative prefix along`,
                    `0 — reset to zero and skip this element`,
                  ],
                  correctIndex: 0,
                  explanation: `A negative prefix only lowers future sums, so currentSum = ${val} and the window restarts at index ${i}.`,
                  hint: 'Would the negative prefix ever help a later sum?',
                }
                : undefined,
          pedagogy: {
            what: `The prefix is discarded: currentSum resets to ${val}.`,
            why: 'This is the DP transition max(nums[i], currentSum + nums[i]) choosing its first argument.',
            whatNext: `Move the running window to start at index ${i}.`,
          },
        });
        if (!firstRestartMilestone) firstRestartMilestone = true;
        if (!restartCheckpointAdded) restartCheckpointAdded = true;

        windowStart = i;
        windowEnd = i;
        actionType = 'RESTART';
        pushFrame({
          codeLine: 11,
          action: 'WINDOW_START',
          explanation: `start = ${i}: the running window is now [${i}..${i}], a brand-new candidate subarray.`,
          conditionEval: { expr: 'start = i', condition: `${i}`, result: i, formatted: `window [${i}..${i}]` },
          variables: { i, window: `[${i}..${i}]` },
          soundCue: 'step',
          pedagogy: {
            what: `The running window restarts at index ${i}.`,
            why: 'The window must match what currentSum now represents — the subarray from i to i.',
            whatNext: `Compare the new running sum against maxSum.`,
          },
        });
      } else {
        currentSum = extendedSum;
        actionType = 'EXTEND';
        pushFrame({
          codeLine: 13,
          action: 'EXTEND',
          explanation: `currentSum = ${prefixSum} + ${val} = ${currentSum}: the prefix is still pulling its weight, so the window grows to [${windowStart}..${i}].`,
          conditionEval: {
            expr: `currentSum = currentSum + nums[${i}]`,
            condition: `${prefixSum} + ${val}`,
            result: currentSum,
            formatted: `currentSum = ${currentSum}`,
          },
          variables: {
            i,
            previousSum: prefixSum,
            'nums[i]': val,
            currentSum,
            window: `[${windowStart}..${i}]`,
          },
          soundCue: 'step',
          pedagogy: {
            what: `The running subarray extends through index ${i}.`,
            why: 'This is the DP transition max(nums[i], currentSum + nums[i]) choosing its second argument — the prefix is non-negative, so extending wins.',
            whatNext: `Compare the running sum against maxSum.`,
          },
        });
        windowEnd = i;
      }

      const newMax = currentSum > maxSum;
      candidate = { i, val, prefixSum, extendedSum, restart, newMax };
      actionType = 'MAXCHECK';
      pushFrame({
        codeLine: 14,
        action: 'CHECK_MAX',
        explanation: newMax
          ? `currentSum (${currentSum}) > maxSum (${maxSum}): the running subarray is the best seen so far and must be recorded.`
          : `currentSum (${currentSum}) <= maxSum (${maxSum}): the global record stands${currentSum === maxSum ? ' (a tie — the earlier window is kept)' : ''}.`,
        conditionEval: {
          expr: `currentSum > maxSum`,
          condition: `${currentSum} > ${maxSum}`,
          result: newMax,
        },
        variables: {
          i,
          currentSum,
          maxSum,
          newMax,
          window: `[${windowStart}..${windowEnd}]`,
          best: `[${bestStart}..${bestEnd}]`,
        },
        soundCue: newMax ? 'compare' : 'step',
        checkpoint:
          !maxCheckpointAdded && newMax
            ? {
                id: 'kadane-new-max',
                question: `At index ${i}: currentSum = ${currentSum} and maxSum = ${maxSum}. What should the algorithm do?`,
                options: [
                  `Record maxSum = ${currentSum} with the window [${windowStart}..${i}]`,
                  `Keep maxSum = ${maxSum} — the running sum is irrelevant`,
                  `Set maxSum = ${currentSum} but keep the old window`,
                ],
                correctIndex: 0,
                explanation: `The running subarray ending here is strictly better, so maxSum rises to ${currentSum} and the recorded window moves to [${windowStart}..${i}].`,
                hint: 'maxSum is only a snapshot; the running sum is what just improved.',
              }
            : undefined,
        pedagogy: {
          what: `Comparing the best subarray ending here against the global record.`,
          why: 'currentSum answers "best ending at i" while maxSum answers "best anywhere so far" — both invariants must hold before moving on.',
          whatNext: newMax ? `Write maxSum = ${currentSum} and record the window.` : `Move to element ${i + 1}.`,
        },
      });
      if (newMax && !maxCheckpointAdded) maxCheckpointAdded = true;

      if (newMax) {
        maxSum = currentSum;
        bestStart = windowStart;
        bestEnd = i;
        stats.maxUpdates++;
        actionType = 'NEWMAX';
        candidate = { i, val, prefixSum, extendedSum, restart, newMax: true };

        pushFrame({
          codeLine: 15,
          action: 'NEW_MAX',
          explanation: `maxSum = ${maxSum}: the running subarray [${bestStart}..${i}] is the new global best.`,
          conditionEval: {
            expr: `maxSum = currentSum`,
            condition: `${currentSum}`,
            result: maxSum,
            formatted: `maxSum = ${maxSum}`,
          },
          variables: {
            i,
            maxSum,
            updates: stats.maxUpdates,
          },
          milestone: !firstMaxMilestone ? 'New Global Max' : undefined,
          soundCue: 'success',
          pedagogy: {
            what: `maxSum rises to ${maxSum}.`,
            why: 'The best subarray ending at i is better than everything seen before, so the global answer must follow it.',
            whatNext: `Record the winning window bounds.`,
          },
        });
        if (!firstMaxMilestone) firstMaxMilestone = true;

        actionType = 'RECORD';
        pushFrame({
          codeLine: 16,
          action: 'RECORD_WINDOW',
          explanation: `bestStart = ${bestStart}, bestEnd = ${i}: the answer window [${bestStart}..${i}] is stored alongside the record sum.`,
          variables: {
            best: `[${bestStart}..${bestEnd}]`,
            windowSum: maxSum,
            subarray: arr.slice(bestStart, bestEnd + 1).join(', '),
          },
          soundCue: 'select',
          pedagogy: {
            what: `The best window is now [${bestStart}..${bestEnd}].`,
            why: 'Storing the bounds together with the sum is what lets the algorithm return the actual subarray, not just its total.',
            whatNext: i + 1 < n ? `Scan element ${i + 1} (value ${arr[i + 1]}).` : 'All elements scanned.',
          },
        });
      }
    }

    phase = 'done';
    currentIndex = -1;
    candidate = null;
    const answerSubarray = arr.slice(bestStart, bestEnd + 1);

    pushFrame({
      codeLine: 18,
      action: 'DONE',
      explanation: `Kadane's algorithm complete: maxSum = ${maxSum} achieved by the contiguous subarray [${answerSubarray.join(', ')}] over indices [${bestStart}..${bestEnd}] (${stats.restarts} prefix restart(s), ${stats.maxUpdates} record update(s)).`,
      conditionEval: {
        expr: 'maxSum == brute force maximum',
        condition: `${maxSum} == ${bruteForceMax(arr)}`,
        result: maxSum === bruteForceMax(arr),
      },
      variables: {
        maxSum,
        subarray: answerSubarray.join(', '),
        range: `[${bestStart}..${bestEnd}]`,
        restarts: stats.restarts,
        maxUpdates: stats.maxUpdates,
      },
      milestone: 'Max Subarray Found',
      soundCue: 'finish',
      pedagogy: {
        what: `The maximum contiguous subarray sums to ${maxSum}.`,
        why: 'Every element was folded in with one comparison: extend or restart, then a single record check — the invariants held at every step.',
        whatNext: 'Compare the presets: all-negative input still answers correctly because the seeds come from nums[0], not 0.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<KadaneState>) => {
    const { array, currentIndex, currentSum, maxSum, windowStart, windowEnd, bestStart, bestEnd, phase, actionType, candidate, stats } =
      frame.state;

    const phaseLabel = phase === 'init' || phase === 'setup' ? 'seeding' : phase === 'scan' ? 'scanning' : 'done';
    const inBest = (idx: number) => idx >= bestStart && idx <= bestEnd;
    const inWindow = (idx: number) => idx >= windowStart && idx <= windowEnd;

    const formula = candidate
      ? candidate.restart
        ? `prefix ${candidate.prefixSum} < 0 → discard: currentSum = nums[${candidate.i}] = ${candidate.val}`
        : `prefix ${candidate.prefixSum} >= 0 → extend: currentSum = ${candidate.prefixSum} + ${candidate.val} = ${candidate.extendedSum}`
      : phase === 'done'
        ? `maxSum = ${maxSum} over [${bestStart}..${bestEnd}] = [${array.slice(bestStart, bestEnd + 1).join(', ')}]`
        : 'currentSum = max(nums[i], currentSum + nums[i]); maxSum = max(maxSum, currentSum)';

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
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
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              scanned <span className="font-bold text-cyan-300">{stats.elements}</span>/{Math.max(0, array.length - 1)}
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              restarts <span className="font-bold text-rose-300">{stats.restarts}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              records <span className="font-bold text-emerald-300">{stats.maxUpdates}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              currentSum{' '}
              <span className={`font-bold ${currentSum >= 0 ? 'text-amber-300' : 'text-rose-300'}`}>{currentSum}</span>
            </span>
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              maxSum <span className="font-bold">{maxSum}</span>
            </span>
            <span className="rounded-md border border-violet-800 bg-violet-950/40 px-2 py-0.5 text-violet-200">
              best <span className="font-bold">[{bestStart}..{bestEnd}]</span>
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-3 pb-4">
            <div className="mb-2 flex items-end gap-2">
              {array.map((val, idx) => {
                const isCurrent = idx === currentIndex;
                const isBest = inBest(idx);
                const isWindow = inWindow(idx);
                let style = 'border-slate-800 bg-slate-900/80 text-slate-400';
                if (isCurrent) {
                  style =
                    actionType === 'RESTART'
                      ? 'border-rose-400 bg-rose-500/20 text-rose-100 ring-2 ring-rose-400/50'
                      : actionType === 'NEWMAX'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/50'
                        : 'border-cyan-400 bg-cyan-500/20 text-cyan-100 ring-2 ring-cyan-400/40';
                } else if (isBest) {
                  style = 'border-emerald-600 bg-emerald-950/40 text-emerald-200';
                } else if (isWindow) {
                  style = 'border-amber-400/70 bg-amber-950/30 text-amber-100';
                }
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`flex h-14 w-12 flex-col items-center justify-center rounded-xl border-2 font-mono transition-all ${style}`}>
                      <span className="text-[9px] text-slate-500">[{idx}]</span>
                      <span className={`text-base font-bold ${val >= 0 ? 'text-white' : 'text-rose-300'}`}>{val}</span>
                    </div>
                    <div className="mt-1 flex h-4 items-center font-mono text-[9px]">
                      {isCurrent ? (
                        <span className="rounded border border-cyan-800 bg-cyan-950 px-1 font-bold text-cyan-400">curr</span>
                      ) : isBest ? (
                        <span className="text-emerald-500">best</span>
                      ) : isWindow ? (
                        <span className="text-amber-500">win</span>
                      ) : (
                        '\u00A0'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>element being decided</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-rose-400" />
                  <span>prefix discarded (restart)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>running window [start..i]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                  <span>best window [bestStart..bestEnd]</span>
                </div>
              </div>
            </div>

            {phase === 'done' && (
              <div className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
                  <span>Answer subarray</span>
                  <span>sum {maxSum}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] font-bold text-violet-100">
                  {answerSlice(array, bestStart, bestEnd).map((value, pos) => (
                    <span key={pos} className="flex items-center gap-1">
                      {pos > 0 && <span className="text-violet-500">+</span>}
                      <span className="rounded-md border border-violet-400 bg-violet-500/25 px-1.5 py-0.5">{value}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-1 font-mono text-[10px] text-slate-400">
                  indices [{bestStart}..{bestEnd}] of {array.length}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Stats</div>
              <div className="flex flex-col gap-0.5">
                <span>elements scanned <span className="font-bold text-cyan-300">{stats.elements}</span></span>
                <span>prefix restarts <span className="font-bold text-rose-300">{stats.restarts}</span></span>
                <span>record updates <span className="font-bold text-emerald-300">{stats.maxUpdates}</span></span>
                <span>brute force check <span className="font-bold text-emerald-300">{bruteForceMax(array)}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

function answerSlice(array: number[], start: number, end: number): number[] {
  return array.slice(start, end + 1);
}
