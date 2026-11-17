import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface HouseRobberInput {
  houses: number[];
}

export interface HouseRobberCandidate {
  i: number;
  value: number;
  skipVal: number;
  robVal: number;
  robSourceI: number;
  decision: 'skip' | 'rob';
}

export interface HouseRobberState {
  houses: number[];
  /** dp[i] = maximum loot using houses 0..i. */
  dp: number[];
  currentIndex: number;
  phase: 'init' | 'fill' | 'walk' | 'done';
  actionType: 'INIT' | 'ALLOC' | 'SKIP' | 'ROB' | 'DECIDE' | 'CHECK' | 'TAKE' | 'MOVE' | 'NONE';
  candidate: HouseRobberCandidate | null;
  /** Indices visited by the reconstruction, from the last house backwards. */
  walkPath: number[];
  /** Robbed house indices in walk order (last house first). */
  loot: number[];
  maxLoot: number;
  stats: {
    decisions: number;
    robs: number;
    skips: number;
    walkSteps: number;
  };
}

const MAX_HOUSES = 10;
const MAX_CASH = 999;

const DEFAULT_HOUSES = [2, 7, 9, 3, 1];

interface NormalisedInput {
  houses: number[];
  notes: string[];
}

function normalise(input: HouseRobberInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = Array.isArray(input?.houses) ? input.houses : DEFAULT_HOUSES;
  const usable = raw.filter((value) => typeof value === 'number' && Number.isFinite(value));

  if (usable.length === 0 && raw.length > 0) {
    notes.push('no usable cash values in the input, so the default street is used');
    return { houses: [...DEFAULT_HOUSES], notes };
  }
  if (usable.length < raw.length) {
    notes.push(`${raw.length - usable.length} non-numeric value(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.max(0, Math.min(MAX_CASH, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`cash ${Math.round(value)} clamped to ${rounded} (0..${MAX_CASH})`);
    }
    return rounded;
  });

  let houses = clamped;
  if (houses.length > MAX_HOUSES) {
    notes.push(`${houses.length} houses truncated to ${MAX_HOUSES} for a readable street`);
    houses = houses.slice(0, MAX_HOUSES);
  }

  return { houses, notes };
}

export const houseRobberModule: AlgorithmModule<HouseRobberInput, HouseRobberState> = {
  id: 'house-robber',
  title: 'House Robber (Non-Adjacent Maximum Sum)',
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'climbing-stairs', label: 'Climbing Stairs' },
    { id: 'kadanes-algorithm', label: 'Kadane — Max Subarray' },
    { id: 'longest-increasing-subsequence', label: 'Longest Increasing Subsequence' },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) dp table (O(1) with two rolling variables)',
    worstCaseCondition: 'Single linear scan across all houses',
  },
  theory: {
    overview:
      'The House Robber problem asks for the maximum sum of money you can rob tonight without robbing two adjacent houses (which triggers the alarm), plus the list of houses to rob.',
    whyItWorks:
      'At house i only two futures exist: skip it (loot stays dp[i-1]) or rob it (nums[i] plus the best loot from houses 0..i-2, because i-1 is now forbidden). Every strategy is one of these, so the max is exact.',
    invariant:
      'After house i is processed, dp[i] holds the maximum loot obtainable from the prefix houses[0..i], respecting the non-adjacency rule.',
    pitfalls: [
      'Greedily robbing the richest house locks out both neighbours — [2, 7, 9] answers 11 (2 + 9), not 9 or 7.',
      'The base cases are folded into the loop: at i = 0 there is nothing to skip, and at i = 1 robbing reaches back to an empty street (0).',
      'On a tie (skip value equals rob value) several optimal sets exist; this walk takes the later house, which is still optimal.',
      'The walk tests dp[i] == dp[i-2] + nums[i], NOT dp[i] > dp[i-1]: a house can be robbed even when the totals happen to be equal.',
    ],
    steps: [
      'Allocate dp[0..N-1] = 0.',
      'For each house i: skip value = dp[i-1] (0 at the start), rob value = dp[i-2] + nums[i] (nums[i] alone near the start).',
      'Write dp[i] = max(skip, rob) — the best loot for the prefix ending at i.',
      'The answer is dp[N-1].',
      'Walk i = N-1 → 0: when dp[i] equals dp[i-2] + nums[i], house i was robbed — record it and jump two back; otherwise step one back.',
    ],
    watchOut: [
      'The walk may finish with cash left on the table: skipping a small house is optimal even though robbing it feels free.',
      'loot is collected from the last house backwards, so it reads in descending index order until reversed for display.',
    ],
  },
  defaultInput: { houses: DEFAULT_HOUSES },
  presets: [
    {
      id: 'leetcode-198',
      label: 'LeetCode 198 Standard',
      description: 'Houses [2, 7, 9, 3, 1] — max loot 12 = 2 + 9 + 1 (houses 0, 2, 4)',
      data: { houses: [2, 7, 9, 3, 1] },
    },
    {
      id: 'alternating-high',
      label: 'Extremes at Ends',
      description: 'Houses [50, 1, 1, 50] — robbing both ends (100) beats any rich middle pick',
      data: { houses: [50, 1, 1, 50] },
    },
    {
      id: 'staircase',
      label: 'Monotonic Values',
      description: 'Houses [1, 2, 3, 1] — taking houses 0 and 2 (1 + 3 = 4) beats grabbing the tempting 2',
      data: { houses: [1, 2, 3, 1] },
    },
    {
      id: 'single-house',
      label: 'One House',
      description: 'Houses [7] — the loop solves even the trivial street with the same recurrence',
      data: { houses: [7] },
    },
  ],
  codeSnippets: {
    pseudocode: `function rob(nums):
    if length(nums) == 0: return 0, []
    dp = array of size length(nums) filled with 0
    for i = 0 to length(nums) - 1:
        skip = i > 0 ? dp[i - 1] : 0
        rob = (i > 1 ? dp[i - 2] : 0) + nums[i]
        dp[i] = max(skip, rob)
    loot = []
    i = length(nums) - 1
    while i >= 0:
        robVal = (i > 1 ? dp[i - 2] : 0) + nums[i]
        if robVal == dp[i]:
            loot.push(i)
            i = i - 2
        else:
            i = i - 1
    return dp[length(nums) - 1], loot`,
    python: `def rob(nums):
    if len(nums) == 0: return 0, []
    dp = [0] * len(nums)
    for i in range(len(nums)):
        skip = dp[i - 1] if i > 0 else 0
        rob = (dp[i - 2] if i > 1 else 0) + nums[i]
        dp[i] = max(skip, rob)
    loot = []
    i = len(nums) - 1
    while i >= 0:
        rob_val = (dp[i - 2] if i > 1 else 0) + nums[i]
        if rob_val == dp[i]:
            loot.append(i)
            i -= 2
        else:
            i -= 1
    return dp[len(nums) - 1], loot`,
    typescript: `function rob(nums: number[]): [number, number[]] {
  if (nums.length === 0) return [0, []];
  const dp: number[] = new Array(nums.length).fill(0);
  for (let i = 0; i < nums.length; i++) {
    const skip = i > 0 ? dp[i - 1] : 0;
    const rob = (i > 1 ? dp[i - 2] : 0) + nums[i];
    dp[i] = Math.max(skip, rob); }
  const loot: number[] = [];
  let i = nums.length - 1;
  while (i >= 0) {
    const robVal = (i > 1 ? dp[i - 2] : 0) + nums[i];
    if (robVal === dp[i]) {
      loot.push(i);
      i -= 2;
    } else {
      i -= 1; } }
  return [dp[nums.length - 1], loot]; }`,
    cpp: `pair<int, vector<int>> rob(vector<int>& nums) {
    if (nums.empty()) return {0, {}};
    vector<int> dp(nums.size(), 0);
    for (int i = 0; i < (int)nums.size(); i++) {
        int skip = i > 0 ? dp[i - 1] : 0;
        int rob = (i > 1 ? dp[i - 2] : 0) + nums[i];
        dp[i] = max(skip, rob); }
    vector<int> loot;
    int i = (int)nums.size() - 1;
    while (i >= 0) {
        int robVal = (i > 1 ? dp[i - 2] : 0) + nums[i];
        if (robVal == dp[i]) {
            loot.push_back(i);
            i -= 2;
        } else {
            i -= 1; } }
    return {dp[nums.size() - 1], loot}; }`,
    java: `public int[] rob(int[] nums) {
    if (nums.length == 0) return new int[] {0};
    int[] dp = new int[nums.length];
    for (int i = 0; i < nums.length; i++) {
        int skip = i > 0 ? dp[i - 1] : 0;
        int rob = (i > 1 ? dp[i - 2] : 0) + nums[i];
        dp[i] = Math.max(skip, rob); }
    int[] loot = new int[nums.length]; int count = 0;
    int i = nums.length - 1;
    while (i >= 0) {
        int robVal = (i > 1 ? dp[i - 2] : 0) + nums[i];
        if (robVal == dp[i]) {
            loot[count++] = i;
            i -= 2;
        } else {
            i -= 1; } }
    return java.util.Arrays.copyOf(loot, count); }`,
  },

  generateTimeline: (input: HouseRobberInput): ExecutionFrame<HouseRobberState>[] => {
    const { houses: nums, notes } = normalise(input);
    const n = nums.length;

    const dp: number[] = new Array(n).fill(0);
    const frames: ExecutionFrame<HouseRobberState>[] = [];
    const walkPath: number[] = [];
    const loot: number[] = [];

    let phase: HouseRobberState['phase'] = 'init';
    let currentIndex = -1;
    let actionType: HouseRobberState['actionType'] = 'INIT';
    let candidate: HouseRobberCandidate | null = null;
    let maxSeen = 0;

    const stats = { decisions: 0, robs: 0, skips: 0, walkSteps: 0 };

    let firstDecisionMilestone = false;
    let firstTakeMilestone = false;
    let choiceCheckpointAdded = false;
    let walkCheckpointAdded = false;

    const snapshot = (): HouseRobberState => ({
      houses: [...nums],
      dp: [...dp],
      currentIndex,
      phase,
      actionType,
      candidate: candidate ? { ...candidate } : null,
      walkPath: [...walkPath],
      loot: [...loot],
      maxLoot: maxSeen,
      stats: { ...stats },
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<HouseRobberState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<HouseRobberState>['soundCue'];
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
          {
            name: phase === 'walk' || phase === 'done' ? 'recover(dp, nums)' : 'rob(nums)',
            params:
              phase === 'fill'
                ? { i: currentIndex }
                : phase === 'walk'
                  ? { i: currentIndex }
                  : { n },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: stats.decisions + stats.walkSteps, swaps: stats.robs, accesses: stats.decisions * 3, lookups: stats.walkSteps },
        invariantStatus: {
          label:
            phase === 'init'
              ? 'dp starts at 0 everywhere: an empty street has no loot'
              : phase === 'fill'
                ? `dp[${currentIndex}] = ${dp[currentIndex] ?? 0} = best loot from houses 0..${currentIndex} without robbing two adjacent ones`
                : phase === 'walk'
                  ? `Walk at house ${currentIndex}: ${loot.length} house(s) selected, loot ${loot.reduce((sum, idx) => sum + nums[idx], 0)}`
                  : `Answer: dp[${n - 1}] = ${maxSeen}`,
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
        `n = length(nums) = ${n} house(s) on the street [${nums.join(', ')}], so the empty-street guard is false and the DP runs. The non-adjacency rule means robbing house i forbids house i±1.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'length(nums) == 0', condition: `${n} == 0`, result: n === 0 },
      variables: { n, totalCash: nums.reduce((sum, value) => sum + value, 0), houses: n },
      soundCue: 'start',
      pedagogy: {
        what: `The street has ${n} house(s); dp will hold one answer per house.`,
        why: 'The guard handles the empty street: with no houses there is nothing to rob and the answer is 0.',
        whatNext: n > 0 ? 'Allocate the dp table and evaluate house 0.' : 'Return 0 with an empty loot list.',
      },
    });

    if (n === 0) {
      phase = 'done';
      pushFrame({
        codeLine: 2,
        action: 'EMPTY_DONE',
        explanation: 'Empty street: return max loot 0 with an empty loot list — the guard answered without touching the DP.',
        variables: { maxLoot: 0, loot: '' },
        milestone: 'Empty Street',
        soundCue: 'finish',
        pedagogy: {
          what: 'No houses means no loot, no decisions, no walk.',
          why: 'The base case at the top of the function covers the degenerate input exactly.',
          whatNext: 'Try a preset with houses to see the skip/rob decisions.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    phase = 'fill';
    currentIndex = 0;
    actionType = 'ALLOC';
    pushFrame({
      codeLine: 3,
      action: 'ALLOC',
      explanation: `Allocate dp[0..${n - 1}] = 0. Every cell will hold the best loot for the prefix of houses ending at that index.`,
      variables: { dp: `[0 × ${n}]`, houses: n },
      soundCue: 'step',
      pedagogy: {
        what: 'One dp cell per house — a 1D table suffices because only the two previous prefixes matter.',
        why: 'dp[i] depends on dp[i-1] (skip) and dp[i-2] (rob), so a linear scan with the two previous values carries the whole history.',
        whatNext: `Evaluate house 0 (cash ${nums[0]}).`,
      },
    });

    for (let i = 0; i < n; i++) {
      currentIndex = i;
      const skipVal = i > 0 ? dp[i - 1] : 0;
      const robVal = (i > 1 ? dp[i - 2] : 0) + nums[i];

      actionType = 'SKIP';
      candidate = { i, value: nums[i], skipVal, robVal, robSourceI: i - 2, decision: 'skip' };
      pushFrame({
        codeLine: 5,
        action: 'SKIP_BRANCH',
        explanation:
          i > 0
            ? `House ${i} (cash ${nums[i]}) — option SKIP: leave house ${i} standing and keep dp[${i - 1}] = ${skipVal}.`
            : `House 0 (cash ${nums[0]}) — option SKIP: there is no previous house, so skipping yields 0.`,
        conditionEval: { expr: `i > 0`, condition: `${i} > 0`, result: i > 0 },
        variables: { i, 'nums[i]': nums[i], skip: skipVal, rob: robVal },
        soundCue: 'step',
        pedagogy: {
          what: `The skip branch is worth ${skipVal}.`,
          why: 'If house i stays unrobbed, the best loot for the prefix is exactly the previous prefix answer dp[i-1] — house i imposes no constraint.',
          whatNext: `Read the rob branch: dp[${Math.max(0, i - 2)}] + ${nums[i]}.`,
        },
      });

      actionType = 'ROB';
      pushFrame({
        codeLine: 6,
        action: 'ROB_BRANCH',
        explanation:
          i > 1
            ? `House ${i} — option ROB: take ${nums[i]} plus the best loot ending at house ${i - 2}, which is dp[${i - 2}] = ${dp[i - 2]} → ${robVal}. House ${i - 1} becomes forbidden.`
            : i === 1
              ? `House 1 — option ROB: house 0 would be adjacent, so the best prior loot is the empty street (0) plus ${nums[1]} → ${robVal}.`
              : `House 0 — option ROB: the street before it is empty (0) plus ${nums[0]} → ${robVal}.`,
        conditionEval: { expr: `i > 1`, condition: `${i} > 1`, result: i > 1 },
        variables: { i, 'nums[i]': nums[i], 'dp[i-2]': i > 1 ? dp[i - 2] : 0, rob: robVal, skip: skipVal },
        soundCue: 'compare',
        pedagogy: {
          what: `The rob branch is worth ${robVal}.`,
          why: 'Robbing house i bans house i-1, so the remainder is the best prefix ending two houses back — the reason the recurrence skips one.',
          whatNext: `Write the larger of ${skipVal} and ${robVal} into dp[${i}].`,
        },
      });

      const decision: 'skip' | 'rob' = robVal > skipVal ? 'rob' : 'skip';
      dp[i] = Math.max(skipVal, robVal);
      maxSeen = Math.max(maxSeen, dp[i]);
      stats.decisions++;
      if (decision === 'rob') stats.robs++;
      else stats.skips++;
      actionType = 'DECIDE';
      candidate = { i, value: nums[i], skipVal, robVal, robSourceI: i - 2, decision };

      pushFrame({
        codeLine: 7,
        action: 'DECIDE',
        explanation:
          decision === 'rob'
            ? `Robbing (${robVal}) beats skipping (${skipVal}): dp[${i}] = ${dp[i]} and house ${i} is part of this prefix's optimum.`
            : `Skipping (${skipVal}) is at least as good as robbing (${robVal}): dp[${i}] = ${dp[i]}${skipVal === robVal ? ' — a tie, and skipping keeps the previous plan' : ''}.`,
        conditionEval: {
          expr: `max(skip, rob)`,
          condition: `max(${skipVal}, ${robVal})`,
          result: dp[i],
          formatted: `dp[${i}] = ${dp[i]} (${decision})`,
        },
        variables: {
          i,
          'nums[i]': nums[i],
          skip: skipVal,
          rob: robVal,
          'dp[i]': dp[i],
          decision,
        },
        milestone: !firstDecisionMilestone ? 'First Decision' : undefined,
        soundCue: decision === 'rob' ? 'success' : 'step',
        checkpoint:
          !choiceCheckpointAdded && skipVal !== robVal
            ? {
                id: 'house-robber-skip-or-rob',
                question: `House ${i} holds ${nums[i]}. Skipping keeps dp[${i - 1 < 0 ? 0 : i - 1}] = ${skipVal}; robbing gives ${i > 1 ? `dp[${i - 2}] + ${nums[i]}` : `0 + ${nums[i]}`} = ${robVal}. What is dp[${i}]?`,
                options: [
                  `${Math.max(skipVal, robVal)} — the larger of the two branches`,
                  `${Math.min(skipVal, robVal)} — the smaller of the two branches`,
                  `${skipVal + robVal} — both branches combined`,
                ],
                correctIndex: decision === 'rob' ? 0 : 1,
                explanation: `The recurrence keeps the maximum, so dp[${i}] = ${dp[i]} (${decision === 'rob' ? 'rob house i' : 'skip house i'}).`,
                hint: 'dp[i] is the best of exactly two futures for house i.',
              }
            : undefined,
        pedagogy: {
          what:
            decision === 'rob'
              ? `House ${i} is robbed and dp[${i}] rises to ${dp[i]}.`
              : `House ${i} is skipped and dp[${i}] stays ${dp[i]}.`,
          why:
            decision === 'rob'
              ? 'The extra cash beats whatever the previous prefix could offer, and the robbed prefix is built on the optimal i-2 answer.'
              : 'The previous prefix already collects at least as much, so forcing house i in would only add the adjacency constraint.',
          whatNext:
            i + 1 < n
              ? `Evaluate house ${i + 1} (cash ${nums[i + 1]}).`
              : `Table complete: dp[${n - 1}] = ${dp[n - 1]} is the answer. Walk back to recover the houses.`,
        },
      });
      if (!firstDecisionMilestone) firstDecisionMilestone = true;
      if (skipVal !== robVal) choiceCheckpointAdded = true;
    }

    currentIndex = -1;
    candidate = null;
    actionType = 'NONE';
    pushFrame({
      codeLine: 4,
      action: 'TABLE_DONE',
      explanation: `Table filled after ${stats.decisions} decision(s): dp[${n - 1}] = ${dp[n - 1]} is the maximum loot (${stats.robs} house(s) robbed, ${stats.skips} skipped along the way).`,
      variables: {
        maxLoot: dp[n - 1],
        decisions: stats.decisions,
        robs: stats.robs,
        skips: stats.skips,
        dp: `[${dp.join(', ')}]`,
      },
      milestone: 'Table Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `Every house has been priced: dp = [${dp.join(', ')}].`,
        why: 'Each dp[i] reused only earlier prefixes, so the last cell is the global optimum with no combination enumeration.',
        whatNext: `Walk from house ${n - 1} backwards, testing dp[i] == dp[i-2] + nums[i].`,
      },
    });

    // ─── reconstruction ───
    phase = 'walk';
    let cursor = n - 1;
    currentIndex = cursor;
    actionType = 'CHECK';

    pushFrame({
      codeLine: 10,
      action: 'BT_START',
      explanation: `Walk back from house ${n - 1} with dp[${n - 1}] = ${dp[n - 1]}: a house was robbed exactly when dp[i] equals dp[i-2] + nums[i].`,
      variables: { i: cursor, 'dp[i]': dp[cursor], loot: '' },
      soundCue: 'start',
      pedagogy: {
        what: `The reconstruction starts at the last house.`,
        why: 'dp[i] was written as max(skip, rob); testing the rob equation reveals which branch actually produced it.',
        whatNext: `Test dp[${cursor}] == ${cursor > 1 ? `dp[${cursor - 2}] + ${nums[cursor]}` : `0 + ${nums[cursor]}`}.`,
      },
    });

    while (cursor >= 0) {
      const robVal = (cursor > 1 ? dp[cursor - 2] : 0) + nums[cursor];
      const taken = robVal === dp[cursor];
      stats.walkSteps++;
      walkPath.push(cursor);
      currentIndex = cursor;
      actionType = 'CHECK';

      pushFrame({
        codeLine: 12,
        action: 'BT_CHECK',
        explanation: taken
          ? `dp[${cursor}] (${dp[cursor]}) == ${cursor > 1 ? `dp[${cursor - 2}] (${dp[cursor - 2]})` : '0'} + nums[${cursor}] (${nums[cursor]}) = ${robVal}: house ${cursor} was ROBBED.`
          : `dp[${cursor}] (${dp[cursor]}) != rob value ${robVal}: house ${cursor} was SKIPPED — its loot came from dp[${cursor - 1 < 0 ? 0 : cursor - 1}].`,
        conditionEval: {
          expr: `robVal == dp[${cursor}]`,
          condition: `${robVal} == ${dp[cursor]}`,
          result: taken,
        },
        variables: {
          i: cursor,
          'nums[i]': nums[cursor],
          robVal,
          'dp[i]': dp[cursor],
          taken,
          loot: loot.join(', ') || '(empty)',
        },
        soundCue: taken ? 'select' : 'discard',
        checkpoint:
          !walkCheckpointAdded
            ? {
                id: 'house-robber-backtrack-first',
                question: `At house ${cursor}: dp[${cursor}] = ${dp[cursor]} and the rob value is ${robVal}. What does the reconstruction conclude?`,
                options: [
                  `House ${cursor} was robbed — record it and jump two houses back`,
                  `House ${cursor} was skipped — step one house back`,
                  'The table is inconsistent and must be rebuilt',
                ],
                correctIndex: taken ? 0 : 1,
                explanation: taken
                  ? `The rob branch produced dp[${cursor}], so house ${cursor} is in the set and the walk continues at house ${cursor - 2 < 0 ? 0 : cursor - 2}.`
                  : 'The skip branch produced dp[i], so the optimum for this prefix already existed one house earlier.',
                hint: 'Compare dp[i] against the rob equation, not against dp[i-1].',
              }
            : undefined,
        pedagogy: {
          what: taken ? `House ${cursor} joins the loot.` : `House ${cursor} is skipped.`,
          why: taken
            ? 'Only the rob branch adds nums[i] on top of dp[i-2], so equality pinpoints the robbed houses.'
            : 'When the rob value falls short, dp[i] was inherited from dp[i-1] and this house is not needed.',
          whatNext: taken
            ? `Record house ${cursor}, drop to house ${cursor - 2 < 0 ? 0 : cursor - 2}.`
            : `Keep the loot and inspect house ${cursor - 1}.`,
        },
      });
      if (!walkCheckpointAdded) walkCheckpointAdded = true;

      if (taken) {
        loot.push(cursor);
        actionType = 'TAKE';
        const next = cursor - 2;

        pushFrame({
          codeLine: 13,
          action: 'BT_TAKE',
          explanation: `House ${cursor} (cash ${nums[cursor]}) is recorded; the walk jumps to house ${next < 0 ? -1 : next} because house ${cursor - 1} is adjacent and forbidden.`,
          conditionEval: {
            expr: `i = i - 2`,
            condition: `${cursor} - 2`,
            result: next,
            formatted: `i = ${next}`,
          },
          variables: {
            robbed: cursor,
            cash: nums[cursor],
            lootSoFar: loot.join(', '),
            lootTotal: loot.reduce((sum, idx) => sum + nums[idx], 0),
            nextHouse: next,
          },
          milestone: !firstTakeMilestone ? 'First House Robbed' : undefined,
          soundCue: 'insert',
          pedagogy: {
            what: `House ${cursor} is added to the loot list.`,
            why: 'The rob branch solved dp[i] from dp[i-2], so the chain continues two houses back, skipping the forbidden neighbour.',
            whatNext: next >= 0 ? `Test house ${next} next.` : 'The walk reached the start of the street.',
          },
        });
        if (!firstTakeMilestone) firstTakeMilestone = true;
        cursor = next;
      } else {
        actionType = 'MOVE';
        const next = cursor - 1;
        pushFrame({
          codeLine: 16,
          action: 'BT_SKIP',
          explanation: `House ${cursor} was skipped: step to house ${next < 0 ? -1 : next} with the loot unchanged.`,
          conditionEval: {
            expr: `i = i - 1`,
            condition: `${cursor} - 1`,
            result: next,
            formatted: `i = ${next}`,
          },
          variables: {
            skipped: cursor,
            nextHouse: next,
            lootSoFar: loot.join(', ') || '(empty)',
          },
          soundCue: 'step',
          pedagogy: {
            what: `The walk steps back one house.`,
            why: 'dp[i] came from dp[i-1], so the prefix answer already exists without this house — no loot is recorded.',
            whatNext: next >= 0 ? `Test house ${next} next.` : 'The walk reached the start of the street.',
          },
        });
        cursor = next;
      }
    }

    phase = 'done';
    currentIndex = -1;
    candidate = null;
    const lootTotal = loot.reduce((sum, idx) => sum + nums[idx], 0);

    pushFrame({
      codeLine: 17,
      action: 'DONE',
      explanation: `House Robber solved: max loot ${dp[n - 1]} by robbing houses [${[...loot].reverse().join(', ')}] (cash ${loot.reduce((sum, idx) => sum + nums[idx], 0)}). No two robbed houses are adjacent.`,
      conditionEval: {
        expr: 'sum of loot == dp[n-1]',
        condition: `${lootTotal} == ${dp[n - 1]}`,
        result: lootTotal === dp[n - 1],
      },
      variables: {
        maxLoot: dp[n - 1],
        loot: [...loot].reverse().join(', '),
        lootCount: loot.length,
        lootTotal,
      },
      milestone: 'Max Loot Secured',
      soundCue: 'finish',
      pedagogy: {
        what: `The plan robs ${loot.length} house(s) for ${dp[n - 1]} in total.`,
        why: 'Each recorded house was justified by the rob equation at its dp cell, so the set is non-adjacent and realises the table value.',
        whatNext: 'Compare the presets: extremes at both ends beat a greedy middle pick, and a single house still runs the same loop.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<HouseRobberState>) => {
    const { houses, dp, currentIndex, phase, actionType, candidate, walkPath, loot, maxLoot, stats } =
      frame.state;

    const phaseLabel = phase === 'init' ? 'allocate' : phase === 'fill' ? 'deciding' : phase === 'walk' ? 'reconstruction' : 'done';
    const walkSet = new Set(walkPath);
    const lootSet = new Set(loot);

    const formula = candidate
      ? `dp[${candidate.i}] = max(skip dp[${candidate.i - 1 < 0 ? 0 : candidate.i - 1}] = ${candidate.skipVal}, rob dp[${candidate.robSourceI < 0 ? 0 : candidate.robSourceI}] + ${candidate.value} = ${candidate.robVal}) = ${dp[candidate.i] ?? 0} → ${candidate.decision}`
      : phase === 'walk' || phase === 'done'
        ? 'walk: dp[i] == dp[i-2] + nums[i] ⇒ house i was robbed (jump two back), else skip (step one back)'
        : 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]) — never rob two adjacent houses';

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
              houses <span className="font-bold text-amber-300">{houses.length}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              decisions <span className="font-bold text-cyan-300">{stats.decisions}</span>/{houses.length}
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              rob <span className="font-bold text-emerald-300">{stats.robs}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              skip <span className="font-bold text-slate-400">{stats.skips}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              max loot <span className="font-bold">{maxLoot}</span>
            </span>
            <span className="rounded-md border border-violet-800 bg-violet-950/40 px-2 py-0.5 text-violet-200">
              loot <span className="font-bold">{loot.length}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              cash <span className="font-bold text-slate-200">{loot.reduce((sum, idx) => sum + (houses[idx] ?? 0), 0)}</span>
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 pb-4">
            <div className="mb-1 font-mono text-[11px] text-slate-400">
              the street <span className="text-slate-500">(adjacent houses cannot both be robbed)</span>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              {houses.map((cash, idx) => {
                const isCurrent = idx === currentIndex;
                const isRobbed = lootSet.has(idx);
                const onWalk = walkSet.has(idx);
                const isSkipDep = candidate && candidate.i - 1 === idx && phase === 'fill';
                const isRobDep = candidate && candidate.i - 2 === idx && phase === 'fill';
                let houseStyle = 'border-slate-800 bg-slate-900/90 text-slate-300';
                let roofStyle = 'border-b-slate-700';
                if (isRobbed) {
                  houseStyle = 'border-emerald-400 bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/50';
                  roofStyle = 'border-b-emerald-400';
                } else if (isCurrent && actionType === 'DECIDE') {
                  houseStyle = 'border-emerald-400 bg-emerald-500/15 text-emerald-100 ring-2 ring-emerald-400/40';
                  roofStyle = 'border-b-emerald-400';
                } else if (isCurrent) {
                  houseStyle = 'border-cyan-400 bg-cyan-500/20 text-cyan-100 ring-2 ring-cyan-400/40';
                  roofStyle = 'border-b-cyan-400';
                } else if (isRobDep) {
                  houseStyle = 'border-indigo-400 bg-indigo-500/15 text-indigo-100';
                  roofStyle = 'border-b-indigo-400';
                } else if (isSkipDep) {
                  houseStyle = 'border-amber-400 bg-amber-500/15 text-amber-100';
                  roofStyle = 'border-b-amber-400';
                } else if (onWalk) {
                  houseStyle = 'border-violet-600 bg-violet-950/40 text-violet-200';
                  roofStyle = 'border-b-violet-600';
                }
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="flex h-4 items-center justify-center">
                      <div className={`h-0 w-0 border-b-[14px] border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent transition-colors ${roofStyle}`} />
                    </div>
                    <div className={`flex h-16 w-14 flex-col items-center justify-center rounded-b-xl border-2 font-mono transition-all ${houseStyle}`}>
                      <span className="text-[9px] text-slate-500">#{idx}</span>
                      <span className="text-sm font-bold text-amber-300">{cash}</span>
                      {isRobbed && <span className="mt-0.5 text-[8px] font-bold text-emerald-400">ROBBED</span>}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-slate-400">
                      dp[{idx}]=<span className="font-bold text-white">{dp[idx]}</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500">
                      {isRobDep ? <span className="text-indigo-300">rob base</span> : isSkipDep ? <span className="text-amber-300">skip</span> : '\u00A0'}
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
                  house {candidate.i} decision
                </div>
                <div className="text-slate-200">
                  skip → <span className="font-bold text-amber-300">{candidate.skipVal}</span>
                  {candidate.i - 1 >= 0 ? ` (dp[${candidate.i - 1}])` : ' (empty street)'}
                </div>
                <div className="text-slate-200">
                  rob → <span className="font-bold text-indigo-300">{candidate.robVal}</span>
                  {candidate.i > 1 ? ` (dp[${candidate.robSourceI}] + ${candidate.value})` : ` (0 + ${candidate.value})`}
                </div>
                <div className="mt-1 text-slate-200">
                  <span className={`font-bold ${candidate.decision === 'rob' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    → {candidate.decision === 'rob' ? 'rob it' : 'skip it'}
                  </span>
                </div>
              </div>
            )}

            {(phase === 'walk' || phase === 'done') && (
              <div className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
                  <span>Robbed houses</span>
                  <span>
                    loot {loot.reduce((sum, idx) => sum + (houses[idx] ?? 0), 0)}
                  </span>
                </div>
                {loot.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] font-bold text-violet-100">
                    {[...loot].reverse().map((idx, pos) => (
                      <span key={idx} className="flex items-center gap-1">
                        {pos > 0 && <span className="text-violet-500">·</span>}
                        <span className="rounded-md border border-violet-400 bg-violet-500/25 px-1.5 py-0.5">#{idx}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-slate-500">no house robbed yet</div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>house being decided</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>dp[i-1] — skip branch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-indigo-400" />
                  <span>dp[i-2] — rob branch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  <span>robbed house</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-violet-400" />
                  <span>walk position (reconstruction)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Stats</div>
              <div className="flex flex-col gap-0.5">
                <span>decisions <span className="font-bold text-cyan-300">{stats.decisions}</span></span>
                <span>robbed <span className="font-bold text-emerald-300">{stats.robs}</span></span>
                <span>skipped <span className="font-bold">{stats.skips}</span></span>
                <span>walk steps <span className="font-bold text-violet-300">{stats.walkSteps}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
