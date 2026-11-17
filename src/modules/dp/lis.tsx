import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface LISInput {
  array: number[];
}

export type LISPhase = 'init' | 'fill' | 'scan' | 'walk' | 'done';

export type LISActionType =
  | 'GUARD'
  | 'SIZE'
  | 'BASE'
  | 'COMPARE'
  | 'CHECK'
  | 'UPDATE'
  | 'LINK'
  | 'SCAN'
  | 'BEST'
  | 'LENGTH'
  | 'WALK'
  | 'REVERSE'
  | 'DONE'
  | 'NONE';

export interface LISCandidate {
  i: number;
  j: number;
  arrI: number;
  arrJ: number;
  dpI: number;
  dpJPlusOne: number;
  canExtend: boolean;
  better: boolean;
}

export interface LISState {
  array: number[];
  /** dp[i] = length of the longest strictly increasing subsequence ending exactly at i. */
  dp: number[];
  /** parent[i] = predecessor index of i in its best chain, or -1 for a chain start. */
  parent: number[];
  currentI: number;
  currentJ: number;
  bestIndex: number;
  maxLisLength: number;
  phase: LISPhase;
  actionType: LISActionType;
  candidate: LISCandidate | null;
  /** Values appended by the walk, in walk order (end → start) until REVERSE. */
  walkSequence: number[];
  /** Indices appended by the walk, in walk order. */
  walkIndices: number[];
  /** Final chain indices in increasing (left-to-right) order, set at REVERSE. */
  chainIndices: number[];
  /** Final chain values in increasing order, set at REVERSE. */
  optimalSequence: number[];
  stats: {
    comparisons: number;
    extensions: number;
    kept: number;
    ties: number;
    bestUpdates: number;
    walkSteps: number;
  };
}

const MAX_LEN = 10;
const MAX_VALUE = 999;

const DEFAULT_ARRAY = [10, 9, 2, 5, 3, 7, 101, 18];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

function normalise(input: LISInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = Array.isArray(input?.array) ? input.array : DEFAULT_ARRAY;
  const usable = raw.filter((value) => typeof value === 'number' && Number.isFinite(value));

  if (usable.length === 0 && raw.length > 0) {
    // An explicitly empty sequence is a valid input (answer 0); a list with no
    // usable numbers is treated as a typo and falls back to the documented default.
    notes.push('no usable numbers in the input, so the default sequence is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  if (usable.length < raw.length) {
    notes.push(`${raw.length - usable.length} non-numeric value(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.max(-MAX_VALUE, Math.min(MAX_VALUE, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`value ${Math.round(value)} clamped to ${rounded} (±${MAX_VALUE})`);
    }
    return rounded;
  });

  let array = clamped;
  if (array.length > MAX_LEN) {
    notes.push(`${array.length} values truncated to ${MAX_LEN} for a readable stage`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

export const lisModule: AlgorithmModule<LISInput, LISState> = {
  id: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence (LIS)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'longest-common-subsequence', label: 'LCS' },
    { id: 'kadanes-algorithm', label: 'Kadane — Max Subarray' },
    { id: 'knapsack-01', label: '0/1 Knapsack' },
  ],
  complexity: {
    timeBest: 'O(N²)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(N) for dp + parent',
    worstCaseCondition:
      'The pair count N(N−1)/2 is input-independent: even a sorted or strictly decreasing sequence compares every (i, j) with j < i',
  },
  theory: {
    overview:
      'The Longest Increasing Subsequence (LIS) problem finds the length of the longest subsequence of a sequence whose elements are strictly increasing. The elements do not need to be contiguous: positions may be skipped, but the relative order must be kept.',
    whyItWorks:
      'Optimal substructure: if the best chain ends at index i, removing nums[i] leaves the best chain that ends at some j < i with nums[j] < nums[i]. So dp[i] = 1 + max(dp[j] over valid j), and taking the maximum over all valid predecessors cannot be beaten.',
    invariant:
      'After the fill phase, dp[i] equals the exact length of the longest strictly increasing subsequence ending at index i, and parent[i] points at one predecessor that achieves dp[i] − 1.',
    pitfalls: [
      'Confusing a subsequence (positions may be skipped) with a contiguous subarray.',
      'Forgetting the base case: every single element is an increasing subsequence of length 1, so dp starts filled with 1, not 0.',
      'Strictness matters: nums[j] < nums[i] (not <=). Equal values must not extend the chain — using <= silently computes the longest non-decreasing subsequence.',
      'parent[i] records only one optimal predecessor; when dp[j] + 1 ties dp[i], other equally long chains exist that the reconstruction does not show.',
      'Patience sorting solves LIS in O(N log N), but this module visualises the classic O(N²) DP because every decision is visible.',
    ],
    steps: [
      'Initialise dp[i] = 1 and parent[i] = -1 for every index.',
      'For each i, scan every j < i: if nums[j] < nums[i], the chain ending at j can be extended to length dp[j] + 1.',
      'If dp[j] + 1 > dp[i], write dp[i] = dp[j] + 1 and record parent[i] = j.',
      'Find best = argmax dp with a linear scan (ties keep the earlier index).',
      'Follow parent pointers from best to collect the chain end → start, then reverse it.',
    ],
    watchOut: [
      'The scan keeps the earlier index when two ends have the same length, so the recovered chain is one of possibly several optimal answers.',
      'parent[i] is overwritten whenever dp[i] improves; only the final pointer values form the recovered chain.',
    ],
  },
  defaultInput: { array: DEFAULT_ARRAY },
  presets: [
    {
      id: 'classic-leetcode',
      label: 'LeetCode 300 Standard',
      description: 'Sequence [10, 9, 2, 5, 3, 7, 101, 18], LIS length 4 = [2, 5, 7, 101]',
      data: { array: [10, 9, 2, 5, 3, 7, 101, 18] },
    },
    {
      id: 'alternating',
      label: 'Alternating High-Low',
      description: 'Sequence [0, 8, 4, 12, 2, 10, 6, 14, 1, 9] — many ties between equally long chains',
      data: { array: [0, 8, 4, 12, 2, 10, 6, 14, 1, 9] },
    },
    {
      id: 'sorted',
      label: 'Already Sorted',
      description: 'Sequence [1, 2, 3, 4, 5] — every comparison extends, dp grows by one each row',
      data: { array: [1, 2, 3, 4, 5] },
    },
    {
      id: 'all-equal',
      label: 'All Equal (strict <)',
      description: 'Sequence [4, 4, 4, 4] — equal values never extend a chain, so the LIS has length 1',
      data: { array: [4, 4, 4, 4] },
    },
  ],
  codeSnippets: {
    pseudocode: `function lengthOfLIS(nums):
    if length(nums) == 0: return 0, []
    n = length(nums)
    dp = array of size n filled with 1
    parent = array of size n filled with -1
    for i = 1 to n - 1:
        for j = 0 to i - 1:
            if nums[j] < nums[i]:
                if dp[j] + 1 > dp[i]:
                    dp[i] = dp[j] + 1
                    parent[i] = j
    best = 0
    for i = 1 to n - 1:
        if dp[i] > dp[best]:
            best = i
    maxLen = dp[best]
    sequence = []
    while best != -1:
        sequence.push(nums[best])
        best = parent[best]
    reverse(sequence)
    return maxLen, sequence`,
    python: `def length_of_lis(nums):
    if len(nums) == 0: return 0, []
    n = len(nums)
    dp = [1] * n
    parent = [-1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                if dp[j] + 1 > dp[i]:
                    dp[i] = dp[j] + 1
                    parent[i] = j
    best = 0
    for i in range(1, n):
        if dp[i] > dp[best]:
            best = i
    max_len = dp[best]
    sequence = []
    while best != -1:
        sequence.append(nums[best])
        best = parent[best]
    sequence.reverse()
    return max_len, sequence`,
    typescript: `function lengthOfLIS(nums: number[]): [number, number[]] {
  if (nums.length === 0) return [0, []];
  const n = nums.length;
  const dp: number[] = new Array(n).fill(1);
  const parent: number[] = new Array(n).fill(-1);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          parent[i] = j; } } } }
  let best = 0;
  for (let i = 1; i < n; i++) {
    if (dp[i] > dp[best]) {
      best = i; } }
  const maxLen = dp[best];
  const sequence: number[] = [];
  while (best !== -1) {
    sequence.push(nums[best]);
    best = parent[best]; }
  sequence.reverse();
  return [maxLen, sequence]; }`,
    cpp: `pair<int, vector<int>> lengthOfLIS(vector<int>& nums) {
    if (nums.empty()) return {0, {}};
    int n = nums.size();
    vector<int> dp(n, 1);
    vector<int> parent(n, -1);
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                if (dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                    parent[i] = j; } } } }
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (dp[i] > dp[best]) {
            best = i; } }
    int maxLen = dp[best];
    vector<int> sequence;
    while (best != -1) {
        sequence.push_back(nums[best]);
        best = parent[best]; }
    reverse(sequence.begin(), sequence.end());
    return {maxLen, sequence}; }`,
    java: `public int[] lengthOfLIS(int[] nums) {
    if (nums.length == 0) return new int[] {0};
    int n = nums.length;
    int[] dp = new int[n]; Arrays.fill(dp, 1);
    int[] parent = new int[n]; Arrays.fill(parent, -1);
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                if (dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                    parent[i] = j; } } } }
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (dp[i] > dp[best]) {
            best = i; } }
    int maxLen = dp[best];
    List<Integer> sequence = new ArrayList<>();
    while (best != -1) {
        sequence.add(nums[best]);
        best = parent[best]; }
    Collections.reverse(sequence);
    return sequence.stream().mapToInt(Integer::intValue).toArray(); }`,
  },

  generateTimeline: (input: LISInput): ExecutionFrame<LISState>[] => {
    const { array: arr, notes } = normalise(input);
    const n = arr.length;
    const dp = new Array(n).fill(1);
    const parent = new Array(n).fill(-1);

    const frames: ExecutionFrame<LISState>[] = [];
    let phase: LISPhase = 'init';
    let currentI = -1;
    let currentJ = -1;
    let bestIndex = 0;
    let maxSeen = n > 0 ? 1 : 0;
    let actionType: LISActionType = 'NONE';
    let candidate: LISCandidate | null = null;
    const walkSequence: number[] = [];
    const walkIndices: number[] = [];
    let chainIndices: number[] = [];
    let optimalSequence: number[] = [];

    const stats = { comparisons: 0, extensions: 0, kept: 0, ties: 0, bestUpdates: 0, walkSteps: 0 };

    let firstExtensionMilestone = false;
    let extendCheckpointAdded = false;
    let parentCheckpointAdded = false;

    const snapshot = (): LISState => ({
      array: [...arr],
      dp: [...dp],
      parent: [...parent],
      currentI,
      currentJ,
      bestIndex,
      maxLisLength: maxSeen,
      phase,
      actionType,
      candidate: candidate ? { ...candidate } : null,
      walkSequence: [...walkSequence],
      walkIndices: [...walkIndices],
      chainIndices: [...chainIndices],
      optimalSequence: [...optimalSequence],
      stats: { ...stats },
    });

    const callStack = (codeLine: number) => {
      const params: Record<string, any> =
        phase === 'fill'
          ? { i: currentI, j: currentJ }
          : phase === 'scan'
            ? { i: currentI, best: bestIndex }
            : phase === 'walk'
              ? { best: bestIndex }
              : phase === 'done'
                ? { maxLen: maxSeen }
                : { n };
      return [
        { name: 'lengthOfLIS(nums)', params, line: codeLine, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ];
    };

    const invariantLabel = (): string => {
      if (phase === 'init') {
        return n === 0
          ? 'An empty sequence has no element to extend: the answer is 0'
          : 'Every dp[i] = 1: any single element is a strictly increasing subsequence of length 1';
      }
      if (phase === 'fill') {
        return `dp[${currentI}] = ${dp[currentI] ?? 1} = longest strictly increasing subsequence ending exactly at nums[${currentI}]`;
      }
      if (phase === 'scan') {
        return `best = ${bestIndex} holds the largest dp value seen so far (dp[${bestIndex}] = ${dp[bestIndex] ?? 1})`;
      }
      if (phase === 'walk') {
        return `Chain has ${walkSequence.length} element(s); walking parent pointers from index ${bestIndex}`;
      }
      return `LIS length ${maxSeen} recovered as ${optimalSequence.length > 0 ? `[${optimalSequence.join(', ')}]` : '[]'}`;
    };

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<LISState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<LISState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(),
        callStack: callStack(opts.codeLine),
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: {
          comparisons: stats.comparisons + stats.bestUpdates,
          swaps: stats.extensions,
          accesses: stats.comparisons * 2,
          lookups: stats.walkSteps,
        },
        invariantStatus: { label: invariantLabel(), isValid: true },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    // ─── guard + setup ───
    pushFrame({
      codeLine: 2,
      action: 'GUARD',
      explanation:
        `n = length(nums) = ${n}` +
        (n === 0
          ? ': the sequence is empty, so the guard is true and the answer is 0 with an empty chain.'
          : `, so the empty-sequence guard is false and the DP runs. The fill phase will compare all ${((n - 1) * n) / 2} pair(s) with j < i.`) +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'length(nums) == 0', condition: `${n} == 0`, result: n === 0 },
      variables: { n, values: arr.join(', '), plannedComparisons: ((n - 1) * n) / 2 },
      soundCue: 'start',
      pedagogy: {
        what:
          n === 0
            ? 'An empty sequence has no element, so the longest increasing subsequence is the empty one with length 0.'
            : `The sequence has ${n} value(s); every index will get its own dp entry and parent pointer.`,
        why: 'The guard is the base case: with no elements there is nothing to extend, and the answer is 0 immediately.',
        whatNext: n === 0 ? 'Return 0 with an empty sequence.' : 'Store n, then allocate the dp array.',
      },
    });

    if (n === 0) {
      phase = 'done';
      pushFrame({
        codeLine: 2,
        action: 'EMPTY_DONE',
        explanation: 'Empty sequence: return maxLen = 0 and an empty chain — nothing can be increasing.',
        variables: { maxLen: 0, sequence: '' },
        milestone: 'Empty Sequence',
        soundCue: 'finish',
        pedagogy: {
          what: 'dp is never allocated because there is no index to fill.',
          why: 'The empty subsequence is the only subsequence of an empty sequence, and its length is 0.',
          whatNext: 'Try a preset with values to see the comparison and extension frames.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    pushFrame({
      codeLine: 3,
      action: 'SIZE',
      explanation: `Store n = ${n}. The outer loop will run i = 1..${n - 1} and each i is compared with every j < i — ${((n - 1) * n) / 2} pair comparison(s) in total.`,
      variables: { n, outerIterations: n - 1, pairs: ((n - 1) * n) / 2 },
      soundCue: 'step',
      pedagogy: {
        what: `n = ${n} is now fixed; index 0 needs no loop because dp[0] = 1 is already correct.`,
        why: 'A chain ending at index i must pass through some earlier index j < i, so only previous indices can extend it.',
        whatNext: 'Fill dp with the base value 1 for every index.',
      },
    });

    pushFrame({
      codeLine: 4,
      action: 'BASE_DP',
      explanation: `dp[i] = 1 for all ${n} index(es): every value by itself is a strictly increasing subsequence of length 1.`,
      variables: { dp: `[1 × ${n}]`, baseLength: 1 },
      milestone: 'Base Case dp[:]=1',
      soundCue: 'step',
      pedagogy: {
        what: 'The dp array starts as all ones — not zeros.',
        why: 'A single element is already an increasing subsequence, so the worst-case answer for any index is 1; starting at 0 would under-count every chain.',
        whatNext: 'Fill parent with -1 so "no predecessor" has an unambiguous marker.',
      },
    });

    pushFrame({
      codeLine: 5,
      action: 'BASE_PARENT',
      explanation: `parent[i] = -1 for all ${n} index(es): -1 means "this chain starts here". The pointers are what make the reconstruction possible at the end.`,
      variables: { parent: `[-1 × ${n}]`, rootMarker: -1 },
      soundCue: 'step',
      pedagogy: {
        what: 'Alongside dp, a parent array is allocated and filled with -1.',
        why: 'dp only stores lengths; to recover the actual values later, each index must remember which predecessor achieved its length.',
        whatNext: `Start the fill phase with i = 1 (nums[1] = ${arr[1]}).`,
      },
    });

    // ─── fill phase ───
    phase = 'fill';
    if (n === 1) {
      pushFrame({
        codeLine: 6,
        action: 'FILL_SKIP',
        explanation:
          'n = 1, so the outer loop body never runs: there is no j < i to compare and dp stays [1] — the single element is the whole answer.',
        variables: { i: 1, skippedComparisons: 0, dp: '[1]' },
        milestone: 'Fill Complete',
        soundCue: 'step',
        pedagogy: {
          what: 'With one element the nested loops are skipped entirely.',
          why: 'The loop range 1..n−1 is empty, and dp[0] = 1 already satisfies the invariant.',
          whatNext: 'Go straight to finding the maximum of dp.',
        },
      });
    } else {
      for (let i = 1; i < n; i++) {
        currentI = i;
        currentJ = -1;
        candidate = null;
        actionType = 'NONE';

        pushFrame({
          codeLine: 6,
          action: 'ITER_START',
          explanation: `Outer loop i = ${i}: compute dp[${i}] for nums[${i}] = ${arr[i]}. It only depends on earlier indices j < ${i}, because a chain ending at ${i} must pass through some j before it.`,
          variables: { i, value: arr[i], dpI: dp[i], candidatesToScan: i },
          soundCue: 'step',
          pedagogy: {
            what: `The DP now finalises index ${i}, currently dp[${i}] = ${dp[i]} (base case).`,
            why: 'dp[i] is defined as the best chain ending exactly here, and every such chain minus its last element is a chain ending at some j < i.',
            whatNext: `Compare nums[0] = ${arr[0]} with nums[${i}] = ${arr[i]}.`,
          },
        });

        for (let j = 0; j < i; j++) {
          const canExtend = arr[j] < arr[i];
          const better = canExtend && dp[j] + 1 > dp[i];
          stats.comparisons++;
          currentI = i;
          currentJ = j;
          actionType = 'COMPARE';
          candidate = {
            i,
            j,
            arrI: arr[i],
            arrJ: arr[j],
            dpI: dp[i],
            dpJPlusOne: dp[j] + 1,
            canExtend,
            better,
          };

          pushFrame({
            codeLine: 8,
            action: 'PAIR_COMPARE',
            explanation: canExtend
              ? `nums[${j}] = ${arr[j]} < nums[${i}] = ${arr[i]}: the chain ending at ${j} can be extended by ${arr[i]}; candidate length dp[${j}] + 1 = ${dp[j] + 1}.`
              : `nums[${j}] = ${arr[j]} is not < nums[${i}] = ${arr[i]} (equal or larger), so no chain through ${j} can end at ${i} — strictness is required.`,
            conditionEval: {
              expr: `nums[${j}] < nums[${i}]`,
              condition: `${arr[j]} < ${arr[i]}`,
              result: canExtend,
            },
            variables: {
              i,
              j,
              'nums[i]': arr[i],
              'nums[j]': arr[j],
              'dp[i]': dp[i],
              'dp[j]+1': dp[j] + 1,
              canExtend,
            },
            soundCue: 'compare',
            pedagogy: {
              what: canExtend
                ? `The strict comparison passes, so index ${j} is a legal predecessor of ${i}.`
                : `The strict comparison fails: equal or larger values cannot appear after ${arr[i]} in an increasing chain.`,
              why: canExtend
                ? 'Appending nums[i] to the best chain ending at j keeps the subsequence strictly increasing and yields length dp[j] + 1.'
                : 'Using <= here would silently compute the longest non-decreasing subsequence instead of the LIS.',
              whatNext: canExtend
                ? `Compare the candidate ${dp[j] + 1} with the current dp[${i}] = ${dp[i]}.`
                : j + 1 < i
                  ? `Move to j = ${j + 1} (nums[${j + 1}] = ${arr[j + 1]}).`
                  : `No j remains; keep dp[${i}] = ${dp[i]} and continue with the next i.`,
            },
          });

          if (canExtend) {
            actionType = 'CHECK';
            if (!better) {
              if (dp[j] + 1 === dp[i]) stats.ties++;
              else stats.kept++;
            }

            const emitExtendCheckpoint = !extendCheckpointAdded && dp[j] + 1 !== dp[i];
            pushFrame({
              codeLine: 9,
              action: 'CHECK_BETTER',
              explanation: better
                ? `Candidate ${dp[j] + 1} beats the current dp[${i}] = ${dp[i]}, so dp[${i}] will be raised by extending the chain through index ${j}.`
                : dp[j] + 1 === dp[i]
                  ? `Candidate ${dp[j] + 1} ties the current dp[${i}] = ${dp[i]}: keeping the current chain is equally optimal, so nothing changes (another optimal predecessor exists, but the first one is kept).`
                  : `Candidate ${dp[j] + 1} is shorter than the current dp[${i}] = ${dp[i]}: the chain through ${j} is not an improvement.`,
              conditionEval: {
                expr: `dp[${j}] + 1 > dp[${i}]`,
                condition: `${dp[j] + 1} > ${dp[i]}`,
                result: better,
              },
              variables: {
                i,
                j,
                candidate: dp[j] + 1,
                'dp[i]': dp[i],
                better,
                outcome: better ? 'will update' : dp[j] + 1 === dp[i] ? 'tie — keep' : 'keep',
              },
              soundCue: better ? 'compare' : 'discard',
              checkpoint: emitExtendCheckpoint
                  ? {
                      id: 'lis-extend-or-keep',
                      question: `dp[${i}] is currently ${dp[i]}. Extending the chain ending at index ${j} (nums[${j}] = ${arr[j]}, dp[${j}] = ${dp[j]}) gives a candidate of ${dp[j] + 1}. What should dp[${i}] become?`,
                      options: [
                        `${dp[j] + 1} — the candidate is longer, update dp[${i}]`,
                        `${dp[i]} — the current chain is at least as long, keep it`,
                        `${dp[i] + dp[j] + 1} — add both lengths together`,
                      ],
                      correctIndex: better ? 0 : 1,
                      explanation: better
                        ? `dp[j] + 1 = ${dp[j] + 1} > dp[i] = ${dp[i]}, so the recurrence takes the longer chain: dp[${i}] = ${dp[j] + 1} and parent[${i}] = ${j}.`
                        : `dp[j] + 1 = ${dp[j] + 1} < dp[i] = ${dp[i]}, so extending through ${j} would shorten the best chain: dp[${i}] stays ${dp[i]}.`,
                      hint: 'dp[i] keeps the maximum of its current value and every candidate dp[j] + 1.',
                    }
                  : undefined,
              pedagogy: {
                what: better
                  ? `The candidate ${dp[j] + 1} is strictly longer than the current ${dp[i]}.`
                  : dp[j] + 1 === dp[i]
                    ? `The candidate ties the current value ${dp[i]}, so the update condition fails.`
                    : `The candidate ${dp[j] + 1} is shorter than the current ${dp[i]}.`,
                why: 'The recurrence is dp[i] = max over predecessors, so a candidate must be strictly better to replace the stored answer; on a tie the first predecessor stays.',
                whatNext: better
                  ? `Write dp[${i}] = ${dp[j] + 1}, then record parent[${i}] = ${j}.`
                  : `Keep dp[${i}] = ${dp[i]} and move to the next candidate.`,
              },
            });

            if (better) {
              dp[i] = dp[j] + 1;
              stats.extensions++;
              maxSeen = Math.max(maxSeen, dp[i]);
              actionType = 'UPDATE';

              pushFrame({
                codeLine: 10,
                action: 'UPDATE',
                explanation: `dp[${i}] = dp[${j}] + 1 = ${dp[j] + 1}: the best chain ending at ${i} now goes through index ${j} and reaches length ${dp[i]}.`,
                conditionEval: {
                  expr: `dp[${i}] = dp[${j}] + 1`,
                  condition: `${dp[j]} + 1`,
                  result: dp[i],
                  formatted: `dp[${i}] = ${dp[i]}`,
                },
                variables: {
                  i,
                  j,
                  'dp[i]': dp[i],
                  previousDpI: dp[j],
                  extensionCount: stats.extensions,
                },
                milestone: !firstExtensionMilestone ? 'First Extension' : undefined,
                soundCue: 'success',
                pedagogy: {
                  what: `dp[${i}] is raised from the base value to ${dp[i]}.`,
                  why: 'This is the recurrence in action: the chain ending at j plus nums[i] is the longest one found so far that ends exactly at i.',
                  whatNext: `Record parent[${i}] = ${j} so the chain can be rebuilt later.`,
                },
              });
              if (!firstExtensionMilestone) firstExtensionMilestone = true;

              parent[i] = j;
              actionType = 'LINK';

              pushFrame({
                codeLine: 11,
                action: 'LINK',
                explanation: `parent[${i}] = ${j}: index ${i} remembers that its best chain arrives from nums[${j}] = ${arr[j]}. Following these pointers later rebuilds the whole chain.`,
                variables: {
                  i,
                  j,
                  'parent[i]': j,
                  'nums[j]': arr[j],
                  chainSoFar: `${arr[j]} → ${arr[i]}`,
                },
                soundCue: 'select',
                pedagogy: {
                  what: `The parent pointer of ${i} is set to ${j}.`,
                  why: 'Storing only lengths would make recovery impossible; the pointer is the "previous hop" of the chain and is overwritten whenever dp[i] improves again.',
                  whatNext:
                    j + 1 < i
                      ? `Continue with j = ${j + 1} (nums[${j + 1}] = ${arr[j + 1]}).`
                      : `Row ${i} is done; continue with i = ${i + 1}.`,
                },
              });
            }
            if (emitExtendCheckpoint) extendCheckpointAdded = true;
          }
        }
      }

      currentI = -1;
      currentJ = -1;
      candidate = null;
      actionType = 'NONE';

      pushFrame({
        codeLine: 6,
        action: 'FILL_COMPLETE',
        explanation: `All pairs compared: ${stats.comparisons} comparison(s) produced ${stats.extensions} extension(s), ${stats.kept} shorter candidate(s) and ${stats.ties} tie(s). dp = [${dp.join(', ')}] now holds the LIS length ending at each index.`,
        variables: {
          comparisons: stats.comparisons,
          extensions: stats.extensions,
          kept: stats.kept,
          ties: stats.ties,
          dp: `[${dp.join(', ')}]`,
        },
        milestone: 'Fill Complete',
        soundCue: 'complete',
        pedagogy: {
          what: `Every (i, j) pair with j < i has been evaluated — ${((n - 1) * n) / 2} comparisons in total.`,
          why: 'Each dp[i] used only earlier entries, so the table is filled once and no subsequence was enumerated.',
          whatNext: 'Scan dp for the maximum: the reconstruction starts at that index.',
        },
      });
    }

    // ─── scan for argmax ───
    phase = 'scan';
    bestIndex = 0;
    currentI = -1;
    currentJ = bestIndex;

    pushFrame({
      codeLine: 12,
      action: 'RECON_START',
      explanation: `best = 0: the reconstruction will start from the index with the largest dp value. The scan begins at index 1 with dp[0] = ${dp[0]} as the running maximum.`,
      variables: { best: 0, 'dp[best]': dp[0], scanFrom: 1 },
      soundCue: 'start',
      pedagogy: {
        what: 'A separate linear scan finds argmax(dp) before any pointer chasing.',
        why: 'The longest chain ends wherever dp is maximal; any index with that value is a valid end, and the scan keeps the first one on ties.',
        whatNext: n > 1 ? `Compare dp[1] = ${dp[1]} with dp[best] = ${dp[0]}.` : 'n = 1, so the scan loop is skipped and best stays 0.',
      },
    });

    if (n === 1) {
      pushFrame({
        codeLine: 13,
        action: 'SCAN_SKIP',
        explanation: 'n = 1, so the scan loop never runs: best stays 0 and dp[0] = 1 is already the maximum.',
        variables: { best: 0, 'dp[best]': dp[0], skippedScans: 0 },
        soundCue: 'step',
        pedagogy: {
          what: 'The scan range 1..n−1 is empty for a single element.',
          why: 'With one index there is nothing to compare, and dp[0] = 1 is trivially the maximum.',
          whatNext: 'Read maxLen = dp[0] = 1 and start the walk.',
        },
      });
    } else {
      for (let i = 1; i < n; i++) {
        const improves = dp[i] > dp[bestIndex];
        currentI = i;
        currentJ = bestIndex;
        actionType = 'SCAN';

        pushFrame({
          codeLine: 14,
          action: 'SCAN_COMPARE',
          explanation: improves
            ? `dp[${i}] = ${dp[i]} beats dp[${bestIndex}] = ${dp[bestIndex]}: a longer chain ends at index ${i}, so best will move to ${i}.`
            : `dp[${i}] = ${dp[i]} does not beat dp[${bestIndex}] = ${dp[bestIndex]}${dp[i] === dp[bestIndex] ? ' (equal length — the earlier index is kept)' : ''}.`,
          conditionEval: {
            expr: `dp[${i}] > dp[${bestIndex}]`,
            condition: `${dp[i]} > ${dp[bestIndex]}`,
            result: improves,
          },
          variables: {
            i,
            best: bestIndex,
            'dp[i]': dp[i],
            'dp[best]': dp[bestIndex],
            improves,
          },
          soundCue: improves ? 'compare' : 'discard',
          pedagogy: {
            what: `The scan compares candidate index ${i} against the current best ${bestIndex}.`,
            why: 'Only a strictly larger dp value moves best; equal values keep the earlier end, so exactly one optimal end is chosen even when several exist.',
            whatNext: improves
              ? `Set best = ${i}.`
              : i + 1 < n
                ? `Compare dp[${i + 1}] = ${dp[i + 1]} with dp[best] = ${dp[bestIndex]}.`
                : `Scan finished: best = ${bestIndex} with dp = ${dp[bestIndex]}.`,
          },
        });

        if (improves) {
          bestIndex = i;
          stats.bestUpdates++;
          actionType = 'BEST';

          pushFrame({
            codeLine: 15,
            action: 'NEW_BEST',
            explanation: `best = ${i}: the longest chain seen so far ends at nums[${i}] = ${arr[i]} with length ${dp[i]}.`,
            variables: { best: bestIndex, 'dp[best]': dp[bestIndex], value: arr[i], bestUpdates: stats.bestUpdates },
            soundCue: 'success',
            pedagogy: {
              what: `best moves to index ${i}.`,
              why: 'dp[i] is strictly larger than every dp value scanned before it, so this index is a better place to start the reconstruction.',
              whatNext: i + 1 < n ? `Continue scanning with dp[${i + 1}] = ${dp[i + 1]}.` : 'The scan is complete.',
            },
          });
        }
      }
    }

    currentI = -1;
    currentJ = -1;
    actionType = 'LENGTH';

    pushFrame({
      codeLine: 16,
      action: 'LENGTH',
      explanation: `maxLen = dp[${bestIndex}] = ${dp[bestIndex]}: the longest strictly increasing subsequence has ${dp[bestIndex]} element(s) and ends at nums[${bestIndex}] = ${arr[bestIndex]}.`,
      variables: { maxLen: dp[bestIndex], best: bestIndex, 'nums[best]': arr[bestIndex] },
      milestone: 'Longest Chain Found',
      soundCue: 'complete',
      pedagogy: {
        what: `The answer length is ${dp[bestIndex]}, read straight from dp[${bestIndex}].`,
        why: 'The fill phase proved dp[best] is the maximum over all chain endings, so no other end can be longer.',
        whatNext: `Walk the parent pointers from ${bestIndex} to recover the values, end → start.`,
      },
    });

    // ─── walk the parent pointers ───
    phase = 'walk';
    while (bestIndex !== -1) {
      currentI = bestIndex;
      currentJ = parent[bestIndex];
      actionType = 'WALK';
      walkSequence.push(arr[bestIndex]);
      walkIndices.push(bestIndex);
      stats.walkSteps++;

      const pickCheckpoint: PredictionCheckpoint | undefined = !parentCheckpointAdded
        ? {
            id: 'lis-parent-jump',
            question:
              parent[bestIndex] !== -1
                ? `The walk just appended nums[${bestIndex}] = ${arr[bestIndex]}; parent[${bestIndex}] = ${parent[bestIndex]}. Where does the walk continue?`
                : `The walk just appended nums[${bestIndex}] = ${arr[bestIndex]}; parent[${bestIndex}] = -1. What happens next?`,
            options:
              parent[bestIndex] !== -1
                ? parent[bestIndex] === bestIndex - 1
                  ? [
                      `Index ${parent[bestIndex]} (nums[${parent[bestIndex]}] = ${arr[parent[bestIndex]]}) — exactly the parent pointer`,
                      'The walk stops — the chain is already complete',
                      `Index ${bestIndex} is visited again`,
                    ]
                  : [
                      `Index ${parent[bestIndex]} (nums[${parent[bestIndex]}] = ${arr[parent[bestIndex]]}) — the parent pointer`,
                      `Index ${bestIndex - 1} — the adjacent position`,
                      'The walk stops — the chain is already complete',
                    ]
                : [
                    'The walk stops — -1 marks the start of the chain',
                    `The walk continues at index ${bestIndex - 1}`,
                    `nums[${bestIndex}] is appended a second time`,
                  ],
            correctIndex: 0,
            explanation:
              parent[bestIndex] !== -1
                ? `parent[${bestIndex}] = ${parent[bestIndex]} is the recorded predecessor, so the next element of the chain is nums[${parent[bestIndex]}] = ${arr[parent[bestIndex]]}.`
                : 'parent = -1 means "no predecessor", so this is the first element of the chain and the while loop terminates.',
            hint: 'The reconstruction follows parent pointers, never positional adjacency.',
          }
        : undefined;

      pushFrame({
        codeLine: 19,
        action: 'WALK_PICK',
        explanation: `Append nums[${bestIndex}] = ${arr[bestIndex]} to the chain (walk order: end → start). This is element ${walkSequence.length} of ${dp[walkIndices[0]]} in the recovered chain.`,
        conditionEval: { expr: 'best != -1', condition: `${bestIndex} != -1`, result: true },
        variables: {
          best: bestIndex,
          appended: arr[bestIndex],
          chainSoFar: `[${walkSequence.join(', ')}]`,
          walkSteps: stats.walkSteps,
        },
        soundCue: 'select',
        checkpoint: pickCheckpoint,
        pedagogy: {
          what: `nums[${bestIndex}] = ${arr[bestIndex]} joins the chain.`,
          why: 'best currently holds an end of the longest chain, so its value belongs to the answer; the walk collects values from the end backwards.',
          whatNext:
            parent[bestIndex] !== -1
              ? `Jump to parent[${bestIndex}] = ${parent[bestIndex]} (nums[${parent[bestIndex]}] = ${arr[parent[bestIndex]]}).`
              : 'parent is -1, so the walk is complete after this element.',
        },
      });
      if (pickCheckpoint) parentCheckpointAdded = true;

      const next = parent[bestIndex];
      pushFrame({
        codeLine: 20,
        action: 'WALK_MOVE',
        explanation:
          next !== -1
            ? `best = parent[${bestIndex}] = ${next}: jump to the predecessor nums[${next}] = ${arr[next]}.`
            : `parent[${bestIndex}] = -1 marks the start of the chain, so best becomes -1 and the while loop stops.`,
        conditionEval: {
          expr: `parent[${bestIndex}] != -1`,
          condition: `${next} != -1`,
          result: next !== -1,
        },
        variables: {
          previousBest: bestIndex,
          nextBest: next,
          'parent[best]': next,
          chainSoFar: `[${walkSequence.join(', ')}]`,
        },
        soundCue: next !== -1 ? 'step' : 'pop',
        pedagogy: {
          what: next !== -1 ? `The walk moves to index ${next}.` : 'The walk terminates at the chain start.',
          why: 'Each parent pointer was written when dp improved, so following them visits exactly the predecessors that achieve dp[best] − 1, dp[best] − 2, …, 1.',
          whatNext: next !== -1 ? `Append nums[${next}] = ${arr[next]} next.` : 'Reverse the collected values into increasing order.',
        },
      });

      bestIndex = next;
    }

    phase = 'done';
    currentI = -1;
    currentJ = -1;
    bestIndex = -1;
    actionType = 'REVERSE';
    const reversed = [...walkSequence].reverse();
    chainIndices = [...walkIndices].reverse();
    optimalSequence = reversed;

    pushFrame({
      codeLine: 21,
      action: 'REVERSE',
      explanation: `The walk collected [${walkSequence.join(', ')}] from end to start; reversing gives the increasing order [${reversed.join(', ')}] — a strictly increasing subsequence of the input.`,
      variables: {
        walkOrder: `[${walkSequence.join(', ')}]`,
        reversed: `[${reversed.join(', ')}]`,
        chainLength: reversed.length,
      },
      soundCue: 'swap',
      pedagogy: {
        what: 'The chain is reversed once, turning walk order (end → start) into reading order (start → end).',
        why: 'Following parent pointers necessarily visits the answer backwards, because every pointer points from an index to an earlier one.',
        whatNext: 'Return maxLen together with the reversed sequence.',
      },
    });

    actionType = 'DONE';
    pushFrame({
      codeLine: 22,
      action: 'DONE',
      explanation: `LIS solved: length ${maxSeen} with chain [${reversed.join(', ')}]${stats.ties > 0 ? ` — ${stats.ties} tie(s) mean other equally long chains exist` : ''}. The recovered values realise dp[${chainIndices.length > 0 ? chainIndices[chainIndices.length - 1] : 0}] = ${maxSeen}.`,
      conditionEval: {
        expr: 'sequence.length == maxLen',
        condition: `${reversed.length} == ${maxSeen}`,
        result: reversed.length === maxSeen,
      },
      variables: {
        maxLen: maxSeen,
        sequence: reversed.join(', '),
        chainLength: reversed.length,
        comparisons: stats.comparisons,
        extensions: stats.extensions,
        ties: stats.ties,
      },
      milestone: 'LIS Reconstructed',
      soundCue: 'finish',
      pedagogy: {
        what: `The answer is ${maxSeen} element(s): [${reversed.join(', ')}].`,
        why: 'Every element was justified by a dp improvement and a parent pointer, so the chain is strictly increasing and its length matches maxLen.',
        whatNext:
          stats.ties > 0
            ? `${stats.ties} tie frame(s) showed equal-length candidates — try the Alternating preset to see several optimal chains.`
            : 'Compare the presets: sorted input extends at every step, equal values never extend.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<LISState>) => {
    const {
      array,
      dp,
      parent,
      currentI,
      currentJ,
      bestIndex,
      maxLisLength,
      phase,
      actionType,
      candidate,
      walkSequence,
      walkIndices,
      chainIndices,
      optimalSequence,
      stats,
    } = frame.state;

    const phaseLabel =
      phase === 'init'
        ? 'allocate'
        : phase === 'fill'
          ? 'filling dp'
          : phase === 'scan'
            ? 'scanning argmax'
            : phase === 'walk'
              ? 'walking parents'
              : 'done';

    const chainSet = new Set(chainIndices);
    const walkSet = new Set(walkIndices);
    const walkOrder = new Map(walkIndices.map((idx, pos) => [idx, walkIndices.length - pos]));
    const chainOrder = new Map(chainIndices.map((idx, pos) => [idx, pos + 1]));

    const formula = candidate
      ? candidate.canExtend
        ? `dp[${candidate.i}] = max(dp[${candidate.i}] = ${candidate.dpI}, dp[${candidate.j}] + 1 = ${candidate.dpJPlusOne}) → ${candidate.better ? `update to ${candidate.dpJPlusOne}` : `keep ${candidate.dpI}`}`
        : `nums[${candidate.j}] = ${candidate.arrJ} ≥ nums[${candidate.i}] = ${candidate.arrI}: index ${candidate.j} cannot precede ${candidate.i}`
      : phase === 'scan'
        ? `argmax scan: dp[${currentI}] = ${dp[currentI] ?? '—'} vs dp[best = ${bestIndex}] = ${dp[bestIndex] ?? '—'}`
        : phase === 'walk'
          ? `walk: parent[${currentI}] = ${parent[currentI] ?? -1} — follow the pointer, not adjacency`
          : phase === 'done'
            ? `LIS = ${maxLisLength}: [${optimalSequence.join(', ')}]`
            : 'dp[i] = 1 + max(dp[j] : j < i, nums[j] < nums[i]), base dp[i] = 1';

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span
              className={`rounded-md border px-2 py-0.5 font-bold uppercase ${
                phase === 'walk' || phase === 'done'
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
              compare <span className="font-bold text-cyan-300">{stats.comparisons}</span>/{(array.length * (array.length - 1)) / 2}
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              extend <span className="font-bold text-emerald-300">{stats.extensions}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              kept <span className="font-bold text-slate-300">{stats.kept}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              tie <span className="font-bold text-amber-300">{stats.ties}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              LIS length <span className="font-bold">{maxLisLength}</span>
            </span>
            <span className="rounded-md border border-violet-800 bg-violet-950/40 px-2 py-0.5 text-violet-200">
              chain <span className="font-bold">{phase === 'done' ? chainIndices.length : walkSequence.length}</span>
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 pb-4">
            <div className="mb-1 font-mono text-[11px] text-slate-400">
              array <span className="text-slate-500">nums[i]</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {array.map((value, idx) => {
                const isI = idx === currentI;
                const isJ = idx === currentJ;
                const inChain = phase === 'done' ? chainSet.has(idx) : walkSet.has(idx);
                const order = phase === 'done' ? chainOrder.get(idx) : walkOrder.get(idx);
                let style = 'border-slate-800 bg-slate-900/90 text-slate-200';
                if (isI && phase === 'fill') {
                  style = 'border-cyan-400 bg-cyan-500/20 text-cyan-100 ring-2 ring-cyan-400/50';
                } else if (isI && (phase === 'walk' || phase === 'done')) {
                  style = 'border-violet-400 bg-violet-500/20 text-violet-100 ring-2 ring-violet-400/50';
                } else if (isI) {
                  style = 'border-cyan-500 bg-cyan-500/15 text-cyan-100';
                } else if (isJ) {
                  style = 'border-amber-400 bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/40';
                } else if (inChain) {
                  style = 'border-emerald-500 bg-emerald-500/15 text-emerald-100';
                }
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 font-mono text-base font-bold transition-all ${style}`}>
                      {value}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-[9px] text-slate-500">
                      <span>[{idx}]</span>
                      {isI && <span className="font-bold text-cyan-400">i</span>}
                      {isJ && <span className="font-bold text-amber-400">j</span>}
                      {inChain && order !== undefined && (
                        <span className="font-bold text-emerald-400">#{order}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-1 mt-3 font-mono text-[11px] text-slate-400">
              dp[i] <span className="text-slate-500">= LIS ending exactly at i</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dp.map((value, idx) => {
                const isI = idx === currentI;
                const isJ = idx === currentJ;
                const isBest = phase === 'scan' && idx === bestIndex;
                const inChain = phase === 'done' ? chainSet.has(idx) : walkSet.has(idx);
                const isUpdated = actionType === 'UPDATE' && isI;
                const showCandidate = candidate && candidate.canExtend && isJ;
                let style = 'border-slate-800 bg-slate-900/60 text-slate-300';
                if (isUpdated) {
                  style = 'border-emerald-400 bg-emerald-500/25 font-bold text-emerald-100 ring-2 ring-emerald-400/50';
                } else if (isI) {
                  style = 'border-cyan-400 bg-cyan-500/20 font-bold text-cyan-100 ring-2 ring-cyan-400/40';
                } else if (isJ && phase === 'fill') {
                  style = 'border-amber-400 bg-amber-500/15 font-bold text-amber-100';
                } else if (isBest) {
                  style = 'border-violet-400 bg-violet-500/20 font-bold text-violet-100';
                } else if (inChain) {
                  style = 'border-emerald-600 bg-emerald-950/40 text-emerald-200';
                }
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`flex h-11 w-12 items-center justify-center rounded-xl border-2 font-mono text-base transition-all ${style}`}>
                      {value}
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] text-slate-500">
                      {parent[idx] === -1 ? (
                        <span className="text-slate-600">root</span>
                      ) : (
                        <span className="text-slate-500">
                          ←{parent[idx]}
                          {showCandidate && (
                            <span className="ml-1 font-bold text-amber-400">+1?</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
            {candidate && (
              <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-3 font-mono text-[11px]">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  candidate
                </div>
                <div className="text-slate-200">
                  nums[{candidate.j}] = {candidate.arrJ} {candidate.canExtend ? '<' : '≥'} nums[{candidate.i}] = {candidate.arrI}
                </div>
                {candidate.canExtend && (
                  <div className="mt-1 text-slate-200">
                    dp[{candidate.j}] + 1 = {candidate.dpJPlusOne} vs dp[{candidate.i}] = {candidate.dpI}
                    <span className={`ml-1 font-bold ${candidate.better ? 'text-emerald-400' : 'text-amber-400'}`}>
                      → {candidate.better ? 'update' : candidate.dpJPlusOne === candidate.dpI ? 'tie, keep' : 'keep'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(phase === 'walk' || phase === 'done') && (
              <div className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
                  <span>{phase === 'done' ? 'Recovered LIS' : 'Walk chain (end → start)'}</span>
                  <span>len {phase === 'done' ? chainIndices.length : walkSequence.length}</span>
                </div>
                {walkSequence.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] font-bold text-violet-100">
                    {(phase === 'done' ? optimalSequence : walkSequence).map((value, pos) => (
                      <span key={pos} className="flex items-center gap-1">
                        {pos > 0 && <span className="text-violet-500">→</span>}
                        <span className="rounded-md border border-violet-400 bg-violet-500/25 px-1.5 py-0.5">{value}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-slate-500">no element collected yet</div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-xs">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>i — index being finalised</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>j — candidate predecessor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                  <span>dp update / chain element</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-violet-400" />
                  <span>best / walk position</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">←p</span>
                  <span>parent pointer (root = −1)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Stats</div>
              <div className="flex flex-col gap-0.5">
                <span>comparisons <span className="font-bold text-cyan-300">{stats.comparisons}</span></span>
                <span>extensions <span className="font-bold text-emerald-300">{stats.extensions}</span></span>
                <span>kept (shorter) <span className="font-bold">{stats.kept}</span></span>
                <span>ties <span className="font-bold text-amber-300">{stats.ties}</span></span>
                <span>best updates <span className="font-bold text-violet-300">{stats.bestUpdates}</span></span>
                <span>walk steps <span className="font-bold text-violet-300">{stats.walkSteps}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
