import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface UnboundedItem {
  id: number;
  name: string;
  weight: number;
  value: number;
}

export interface UnboundedInput {
  items: { name: string; weight: number; value: number }[];
  capacity: number;
}

export type UnboundedPhase = 'init' | 'fill' | 'walk' | 'done';

export interface UnboundedCandidate {
  w: number;
  i: number;
  itemName: string;
  itemWeight: number;
  itemValue: number;
  sourceW: number;
  candidateVal: number;
  currentBest: number;
  canFit: boolean;
  better: boolean;
}

export interface UnboundedPick {
  itemIndex: number;
  itemName: string;
  weight: number;
  value: number;
  capacityBefore: number;
  capacityAfter: number;
}

export interface UnboundedKnapsackState {
  items: UnboundedItem[];
  capacity: number;
  /** dp[w] = best value with capacity exactly w available; unbounded supply. */
  dp: number[];
  /** parent[w] = index of the last item added when dp[w] was set, or -1. */
  parent: number[];
  currentW: number;
  currentItem: number;
  phase: UnboundedPhase;
  actionType: 'INIT' | 'W_START' | 'TRY' | 'CANDIDATE' | 'UPDATE' | 'LINK' | 'WALK' | 'NONE';
  candidate: UnboundedCandidate | null;
  walkPicks: UnboundedPick[];
  pickedCounts: Record<string, number>;
  remainingCapacity: number;
  stats: {
    tries: number;
    fits: number;
    updates: number;
    skipped: number;
    walkSteps: number;
  };
}

const MAX_CAPACITY = 15;
const MAX_ITEMS = 5;
const MAX_ITEM_WEIGHT = 15;
const MAX_ITEM_VALUE = 99;

const DEFAULT_ITEMS: UnboundedItem[] = [
  { id: 1, name: 'A', weight: 2, value: 5 },
  { id: 2, name: 'B', weight: 3, value: 8 },
  { id: 3, name: 'C', weight: 5, value: 14 },
];

interface NormalisedInput {
  capacity: number;
  items: UnboundedItem[];
  notes: string[];
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalise(input: UnboundedInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const rawCapacity =
    typeof input?.capacity === 'number' && Number.isFinite(input.capacity) ? input.capacity : 10;
  const capacity = clampInt(rawCapacity, 1, MAX_CAPACITY);
  if (capacity !== Math.round(rawCapacity)) {
    notes.push(`capacity clamped from ${Math.round(rawCapacity)} to ${capacity} (visual limit ${MAX_CAPACITY})`);
  }

  const rawItems = Array.isArray(input?.items) ? input.items : DEFAULT_ITEMS;
  const usable = rawItems.filter(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof item.weight === 'number' &&
      Number.isFinite(item.weight) &&
      typeof item.value === 'number' &&
      Number.isFinite(item.value)
  );
  if (usable.length === 0 && rawItems.length > 0) {
    notes.push('no usable items in the input, so the default item set is used');
    usable.push(...DEFAULT_ITEMS);
  }
  if (usable.length > MAX_ITEMS) {
    notes.push(`${usable.length} items truncated to ${MAX_ITEMS} for a readable stage`);
  }

  const items: UnboundedItem[] = usable.slice(0, MAX_ITEMS).map((item, index) => {
    // A weight-0 item would make the walk loop forever, so weights start at 1.
    const weight = clampInt(item.weight, 1, MAX_ITEM_WEIGHT);
    const value = clampInt(item.value, 1, MAX_ITEM_VALUE);
    if (weight !== Math.round(item.weight)) {
      notes.push(`item ${index + 1} weight clamped from ${Math.round(item.weight)} to ${weight} (1..${MAX_ITEM_WEIGHT})`);
    }
    if (value !== Math.round(item.value)) {
      notes.push(`item ${index + 1} value clamped from ${Math.round(item.value)} to ${value} (1..${MAX_ITEM_VALUE})`);
    }
    return {
      id: index + 1,
      name: typeof item.name === 'string' && item.name.length > 0 ? item.name : `Item ${index + 1}`,
      weight,
      value,
    };
  });

  return { capacity, items, notes };
}

export const unboundedKnapsackModule: AlgorithmModule<UnboundedInput, UnboundedKnapsackState> = {
  id: 'unbounded-knapsack',
  title: 'Unbounded Knapsack (Repetitive Choice 1D DP O(N * W))',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'knapsack-01', label: '0/1 Knapsack' },
    { id: 'coin-change', label: 'Coin Change (unbounded)' },
    { id: 'subset-sum', label: 'Subset Sum' },
  ],
  complexity: {
    timeBest: 'O(N * W)',
    timeAverage: 'O(N * W)',
    timeWorst: 'O(N * W)',
    spaceAuxiliary: 'O(W) for dp + parent',
    worstCaseCondition: 'Every (capacity, item) pair is tested, so runtime grows with capacity, not just item count',
  },
  theory: {
    overview:
      'Given a knapsack of capacity W and N items each with a weight and a value, find the maximum value obtainable when each item can be chosen ANY number of times (unbounded supply).',
    whyItWorks:
      'Iterating capacity FORWARD lets dp[w - weight[i]] already include copies of item i, so taking the same item repeatedly is expressed naturally: dp[w] = max(dp[w], dp[w - weight[i]] + value[i]). The 0/1 variant must iterate backwards precisely to forbid that reuse.',
    invariant:
      'For every w already processed, dp[w] stores the optimal value achievable with any multiset of items of total weight at most w, and parent[w] records one item achieving it.',
    pitfalls: [
      'Iterating capacity backwards reduces the problem to 0/1 Knapsack where each item can be picked once.',
      'Items with weight 0 would allow infinite loops — every usable item needs weight >= 1.',
      'dp[w] answers capacity "exactly w is available", not "exactly w is used": leaving space unused is fine, so dp[W] is the answer without scanning for a max.',
    ],
    steps: [
      'Allocate dp[0..W] = 0 and parent[0..W] = -1; dp[0] = 0 is the empty knapsack.',
      'For each capacity w in increasing order, test every item: if it fits, candidate = dp[w - weight] + value.',
      'If the candidate beats dp[w], write dp[w] = candidate and record parent[w] = item index.',
      'After the table is filled, dp[W] is the maximum value.',
      'Walk w = W → parent[w] → w - weight, collecting one item copy per step until w hits 0 or parent = -1.',
    ],
    watchOut: [
      'The walk may pick the same item several times — that is exactly what "unbounded" means.',
      'A capacity w whose parent is still -1 (no item fits) simply ends the walk with capacity left over.',
    ],
  },
  defaultInput: {
    items: [
      { name: 'A', weight: 2, value: 5 },
      { name: 'B', weight: 3, value: 8 },
      { name: 'C', weight: 5, value: 14 },
    ],
    capacity: 10,
  },
  presets: [
    {
      id: 'coin-density',
      label: 'Standard: W = 10, 3 Items',
      description: 'Items: A (wt 2, val 5), B (wt 3, val 8), C (wt 5, val 14) — best value 28 with two copies of C',
      data: {
        items: [
          { name: 'A', weight: 2, value: 5 },
          { name: 'B', weight: 3, value: 8 },
          { name: 'C', weight: 5, value: 14 },
        ],
        capacity: 10,
      },
    },
    {
      id: 'high-density-light',
      label: 'Dominant Light Item: W = 8',
      description: 'Light item has highest density; the Gem is taken 4 times for value 28',
      data: {
        items: [
          { name: 'Gem', weight: 2, value: 7 },
          { name: 'Relic', weight: 4, value: 10 },
          { name: 'Armor', weight: 6, value: 15 },
        ],
        capacity: 8,
      },
    },
    {
      id: 'reuse-beats-unique',
      label: 'Reuse Beats Unique: W = 10',
      description: 'One Sword (5, 9): unbounded takes it twice for 18 — 0/1 knapsack could only reach 9',
      data: {
        items: [{ name: 'Sword', weight: 5, value: 9 }],
        capacity: 10,
      },
    },
  ],
  codeSnippets: {
    pseudocode: `function unboundedKnapsack(W, wt, val, n):
    dp = array of size W + 1 filled with 0
    parent = array of size W + 1 filled with -1
    for w = 1 to W:
        for i = 0 to n - 1:
            if wt[i] <= w:
                candidate = dp[w - wt[i]] + val[i]
                if candidate > dp[w]:
                    dp[w] = candidate
                    parent[w] = i
    best = dp[W]
    picks = []
    w = W
    while w > 0 and parent[w] != -1:
        picks.push(parent[w])
        w = w - wt[parent[w]]
    return best, picks`,
    python: `def unbounded_knapsack(W, wt, val, n):
    dp = [0] * (W + 1)
    parent = [-1] * (W + 1)
    for w in range(1, W + 1):
        for i in range(n):
            if wt[i] <= w:
                candidate = dp[w - wt[i]] + val[i]
                if candidate > dp[w]:
                    dp[w] = candidate
                    parent[w] = i
    best = dp[W]
    picks = []
    w = W
    while w > 0 and parent[w] != -1:
        picks.append(parent[w])
        w -= wt[parent[w]]
    return best, picks`,
    typescript: `function unboundedKnapsack(W: number, wt: number[], val: number[], n: number): [number, number[]] {
  const dp: number[] = new Array(W + 1).fill(0);
  const parent: number[] = new Array(W + 1).fill(-1);
  for (let w = 1; w <= W; w++) {
    for (let i = 0; i < n; i++) {
      if (wt[i] <= w) {
        const candidate = dp[w - wt[i]] + val[i];
        if (candidate > dp[w]) {
          dp[w] = candidate;
          parent[w] = i; } } } }
  const best = dp[W];
  const picks: number[] = [];
  let w = W;
  while (w > 0 && parent[w] !== -1) {
    picks.push(parent[w]);
    w -= wt[parent[w]]; }
  return [best, picks]; }`,
    cpp: `pair<int, vector<int>> unboundedKnapsack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<int> dp(W + 1, 0);
    vector<int> parent(W + 1, -1);
    for (int w = 1; w <= W; w++) {
        for (int i = 0; i < n; i++) {
            if (wt[i] <= w) {
                int candidate = dp[w - wt[i]] + val[i];
                if (candidate > dp[w]) {
                    dp[w] = candidate;
                    parent[w] = i; } } } }
    int best = dp[W];
    vector<int> picks;
    int w = W;
    while (w > 0 && parent[w] != -1) {
        picks.push_back(parent[w]);
        w -= wt[parent[w]]; }
    return {best, picks}; }`,
    java: `public int[] unboundedKnapsack(int W, int[] wt, int[] val, int n) {
    int[] dp = new int[W + 1];
    int[] parent = new int[W + 1]; Arrays.fill(parent, -1);
    for (int w = 1; w <= W; w++) {
        for (int i = 0; i < n; i++) {
            if (wt[i] <= w) {
                int candidate = dp[w - wt[i]] + val[i];
                if (candidate > dp[w]) {
                    dp[w] = candidate;
                    parent[w] = i; } } } }
    int best = dp[W];
    int[] picks = new int[W]; int count = 0;
    int w = W;
    while (w > 0 && parent[w] != -1) {
        picks[count++] = parent[w];
        w -= wt[parent[w]]; }
    return Arrays.copyOf(picks, count); }`,
  },

  generateTimeline: (input: UnboundedInput): ExecutionFrame<UnboundedKnapsackState>[] => {
    const { capacity: W, items, notes } = normalise(input);
    const n = items.length;

    const dp: number[] = new Array(W + 1).fill(0);
    const parent: number[] = new Array(W + 1).fill(-1);
    const frames: ExecutionFrame<UnboundedKnapsackState>[] = [];
    const walkPicks: UnboundedPick[] = [];
    const pickedCounts: Record<string, number> = {};

    let phase: UnboundedPhase = 'init';
    let currentW = 0;
    let currentItem = -1;
    let actionType: UnboundedKnapsackState['actionType'] = 'INIT';
    let candidate: UnboundedCandidate | null = null;
    let remainingCapacity = W;

    const stats = { tries: 0, fits: 0, updates: 0, skipped: 0, walkSteps: 0 };

    let firstUpdateMilestone = false;
    let firstPickMilestone = false;
    let reuseMilestone = false;
    let choiceCheckpointAdded = false;
    let walkCheckpointAdded = false;

    const snapshot = (): UnboundedKnapsackState => ({
      items: items.map((item) => ({ ...item })),
      capacity: W,
      dp: [...dp],
      parent: [...parent],
      currentW,
      currentItem,
      phase,
      actionType,
      candidate: candidate ? { ...candidate } : null,
      walkPicks: walkPicks.map((pick) => ({ ...pick })),
      pickedCounts: { ...pickedCounts },
      remainingCapacity,
      stats: { ...stats },
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<UnboundedKnapsackState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<UnboundedKnapsackState>['soundCue'];
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
            name: phase === 'walk' || phase === 'done' ? 'reconstruct(dp, wt, W)' : 'unboundedKnapsack(W, wt, val, n)',
            params:
              phase === 'fill'
                ? { w: currentW, i: currentItem }
                : phase === 'walk'
                  ? { w: remainingCapacity }
                  : { W, n },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: stats.tries, swaps: stats.updates, accesses: stats.fits * 2, lookups: stats.walkSteps },
        invariantStatus: {
          label:
            phase === 'init'
              ? 'dp[0] = 0: the empty knapsack carries no value'
              : phase === 'fill'
                ? `dp[${currentW}] = ${dp[currentW] ?? 0} = best value using any multiset of items within capacity ${currentW}`
                : `Walk at capacity ${remainingCapacity}: ${walkPicks.length} item copy(ies) picked so far`,
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
        `Allocate the 1D table dp[0..${W}] = 0 and parent[0..${W}] = -1 for ${n} item(s) with unbounded supply; ` +
        `forward iteration lets dp[w - weight] already contain copies of the current item.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: {
        capacity: W,
        items: n,
        cells: W + 1,
        totalValue: items.reduce((sum, item) => sum + item.value, 0),
      },
      soundCue: 'start',
      pedagogy: {
        what: `A single row of ${W + 1} cell(s) replaces the (N+1)×(W+1) table of the 0/1 variant, because supply is unlimited.`,
        why: 'dp[w] only needs dp of smaller capacities, and the forward sweep is what allows the current item to appear in its own sub-answer.',
        whatNext: n > 0 ? `Start capacity 1 and test '${items[0].name}' (weight ${items[0].weight}, value ${items[0].value}).` : 'There are no items, so every cell stays 0.',
      },
    });

    phase = 'fill';
    for (let w = 1; w <= W; w++) {
      currentW = w;
      currentItem = -1;
      candidate = null;
      actionType = 'W_START';

      pushFrame({
        codeLine: 4,
        action: 'W_START',
        explanation: `Capacity w = ${w}: test every item against the current best dp[${w}] = ${dp[w]}. Because the sweep moves forward, dp[w - weight] may already include copies of the item being tested.`,
        variables: { w, currentBest: dp[w], itemsToTest: n },
        soundCue: 'step',
        pedagogy: {
          what: `The DP answers one new question: what is the best value with capacity ${w}?`,
          why: 'Any optimal multiset for capacity w is a single item plus an optimal multiset for the remaining capacity — and that remainder may reuse the same item.',
          whatNext: n > 0 ? `Test '${items[0].name}' (weight ${items[0].weight}) against w = ${w}.` : 'No items exist, so nothing can be tested at this capacity.',
        },
      });

      for (let i = 0; i < n; i++) {
        const item = items[i];
        const canFit = item.weight <= w;
        stats.tries++;
        currentItem = i;
        actionType = 'TRY';
        candidate = {
          w,
          i,
          itemName: item.name,
          itemWeight: item.weight,
          itemValue: item.value,
          sourceW: w - item.weight,
          candidateVal: canFit ? dp[w - item.weight] + item.value : Number.NaN,
          currentBest: dp[w],
          canFit,
          better: false,
        };

        pushFrame({
          codeLine: 6,
          action: 'ITEM_TRY',
          explanation: canFit
            ? `'${item.name}' (weight ${item.weight}, value ${item.value}) fits in capacity ${w}: it may extend the best packing of capacity ${w - item.weight}.`
            : `'${item.name}' weighs ${item.weight} > capacity ${w}: it cannot be part of any packing of this capacity (even with unlimited copies, one copy must fit).`,
          conditionEval: {
            expr: `wt[${i}] <= ${w}`,
            condition: `${item.weight} <= ${w}`,
            result: canFit,
          },
          variables: {
            w,
            item: item.name,
            itemWeight: item.weight,
            itemValue: item.value,
            fits: canFit,
            'dp[w]': dp[w],
          },
          soundCue: canFit ? 'compare' : 'discard',
          pedagogy: {
            what: canFit
              ? `The fit test passes, so '${item.name}' is a legal last item for capacity ${w}.`
              : `The fit test fails: one copy alone already exceeds the capacity.`,
            why: canFit
              ? 'If this item is last, the rest of the knapsack must be an optimal packing of capacity w - weight[i], read from dp[w - weight[i]].'
              : 'Unbounded supply cannot help — at least one copy of the chosen item must physically fit.',
            whatNext: canFit
              ? `Compute the candidate dp[${w - item.weight}] + ${item.value}.`
              : `Skip '${item.name}' and test the next item.`,
          },
        });

        if (!canFit) continue;

        const sourceW = w - item.weight;
        const candidateVal = dp[sourceW] + item.value;
        const better = candidateVal > dp[w];
        stats.fits++;
        actionType = 'CANDIDATE';
        candidate = {
          w,
          i,
          itemName: item.name,
          itemWeight: item.weight,
          itemValue: item.value,
          sourceW,
          candidateVal,
          currentBest: dp[w],
          canFit: true,
          better,
        };

        pushFrame({
          codeLine: 7,
          action: 'CANDIDATE',
          explanation: `Candidate: dp[${sourceW}] (${dp[sourceW]}) + ${item.value} = ${candidateVal} vs current dp[${w}] = ${dp[w]}. Note dp[${sourceW}] is allowed to contain '${item.name}' itself — that is what makes the supply unbounded.`,
          conditionEval: {
            expr: `dp[${sourceW}] + ${item.value}`,
            condition: `${dp[sourceW]} + ${item.value} = ${candidateVal}`,
            result: candidateVal,
            formatted: `candidate ${candidateVal} vs best ${dp[w]}`,
          },
          variables: {
            w,
            item: item.name,
            sourceCapacity: sourceW,
            'dp[w-wt]': dp[sourceW],
            itemValue: item.value,
            candidate: candidateVal,
            currentBest: dp[w],
          },
          milestone: !firstUpdateMilestone && better ? undefined : undefined,
          soundCue: 'compare',
          checkpoint:
            !choiceCheckpointAdded && candidateVal !== dp[w]
              ? {
                  id: 'unbounded-candidate-vs-best',
                  question: `At capacity ${w}, '${item.name}' gives candidate dp[${sourceW}] + ${item.value} = ${candidateVal}, while the current best is dp[${w}] = ${dp[w]}. Which value belongs in dp[${w}]?`,
                  options: [
                    `${Math.max(candidateVal, dp[w])} — the larger of candidate and current best`,
                    `${Math.min(candidateVal, dp[w])} — the smaller of the two`,
                    `${candidateVal + dp[w]} — the two values added together`,
                  ],
                  correctIndex: better ? 0 : 1,
                  explanation: better
                    ? `The recurrence keeps the maximum, so dp[${w}] = ${candidateVal} and parent[${w}] = ${i}.`
                    : `The recurrence keeps the maximum, so dp[${w}] stays ${dp[w]} and this candidate is skipped.`,
                  hint: 'dp[w] is a running maximum over every item that fits.',
                }
              : undefined,
          pedagogy: {
            what: `The two options are known: keep ${dp[w]} or take '${item.name}' last and reach ${candidateVal}.`,
            why: 'Every optimal multiset for capacity w either does not end with this item (dp[w]) or does (dp[w - weight] + value); the max covers both.',
            whatNext: `Write the larger of ${dp[w]} and ${candidateVal} into dp[${w}].`,
          },
        });
        if (candidateVal !== dp[w]) choiceCheckpointAdded = true;

        if (better) {
          dp[w] = candidateVal;
          stats.updates++;
          actionType = 'UPDATE';

          pushFrame({
            codeLine: 9,
            action: 'UPDATE',
            explanation: `dp[${w}] = ${candidateVal}: ending the packing with '${item.name}' beats the previous best ${candidate.currentBest}.`,
            conditionEval: {
              expr: `dp[${w}] = dp[${sourceW}] + ${item.value}`,
              condition: `${dp[sourceW]} + ${item.value}`,
              result: dp[w],
              formatted: `dp[${w}] = ${dp[w]}`,
            },
            variables: {
              w,
              item: item.name,
              previousBest: candidate.currentBest,
              'dp[w]': dp[w],
              updates: stats.updates,
            },
            milestone: !firstUpdateMilestone ? 'First Update' : undefined,
            soundCue: 'success',
            pedagogy: {
              what: `dp[${w}] rises from ${candidate.currentBest} to ${dp[w]}.`,
              why: 'The forward sweep already solved capacity ' + sourceW + ', and that sub-answer may itself contain copies of this item — the recurrence composes them legally.',
              whatNext: `Record parent[${w}] = ${i} so the packing can be rebuilt later.`,
            },
          });
          if (!firstUpdateMilestone) firstUpdateMilestone = true;

          parent[w] = i;
          actionType = 'LINK';

          pushFrame({
            codeLine: 10,
            action: 'LINK',
            explanation: `parent[${w}] = ${i}: capacity ${w} remembers that its best packing ends with '${item.name}' (weight ${item.weight}). Following these pointers rebuilds the multiset.`,
            variables: {
              w,
              item: item.name,
              'parent[w]': i,
              nextCapacity: w - item.weight,
            },
            soundCue: 'select',
            pedagogy: {
              what: `The parent pointer of capacity ${w} now names '${item.name}'.`,
              why: 'Values alone cannot rebuild the packing; the pointer is the "last item added" and is overwritten whenever dp[w] improves.',
              whatNext: i + 1 < n ? `Test '${items[i + 1].name}' against capacity ${w}.` : `Capacity ${w} is done; continue with capacity ${w + 1}.`,
            },
          });
        } else {
          stats.skipped++;
        }
      }
    }

    currentW = -1;
    currentItem = -1;
    candidate = null;
    actionType = 'W_START';

    pushFrame({
      codeLine: 11,
      action: 'TABLE_DONE',
      explanation: `Table filled: dp[${W}] = ${dp[W]} is the maximum value for capacity ${W} (${stats.updates} update(s), ${stats.skipped} candidate(s) skipped). No scan for a maximum is needed — dp[W] is the answer.`,
      variables: {
        maxValue: dp[W],
        updates: stats.updates,
        skipped: stats.skipped,
        dp: `[${dp.join(', ')}]`,
      },
      milestone: 'Table Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `All ${W + 1} cells are decided; the last cell holds the answer ${dp[W]}.`,
        why: 'Each dp[w] reused smaller capacities, so every multiset was evaluated exactly once without enumerating combinations.',
        whatNext: `Walk the parent pointers from capacity ${W} to recover which items were packed.`,
      },
    });

    // ─── reconstruction ───
    phase = 'walk';
    let wCursor = W;
    remainingCapacity = wCursor;
    actionType = 'WALK';

    pushFrame({
      codeLine: 13,
      action: 'WALK_START',
      explanation: `Walk back from capacity ${W} with parent[${W}] = ${parent[W] === -1 ? '-1 (nothing fits)' : `'${items[parent[W]].name}'`}. The walk collects one item copy per step and subtracts its weight.`,
      variables: { w: wCursor, 'parent[w]': parent[wCursor], picks: '' },
      soundCue: 'start',
      pedagogy: {
        what: `The reconstruction starts at the full capacity ${W}.`,
        why: 'parent[w] names the last item added to the best packing of w, so reading it backwards un-packs the multiset one copy at a time.',
        whatNext: parent[wCursor] === -1 ? 'No item fits at this capacity, so the walk ends immediately.' : `Take '${items[parent[wCursor]].name}' and jump to capacity ${wCursor - items[parent[wCursor]].weight}.`,
      },
    });

    while (wCursor > 0 && parent[wCursor] !== -1) {
      const idx = parent[wCursor];
      const item = items[idx];
      const capacityBefore = wCursor;
      const isReuse = (pickedCounts[item.name] ?? 0) >= 1;
      walkPicks.push({
        itemIndex: idx,
        itemName: item.name,
        weight: item.weight,
        value: item.value,
        capacityBefore,
        capacityAfter: capacityBefore - item.weight,
      });
      pickedCounts[item.name] = (pickedCounts[item.name] ?? 0) + 1;
      stats.walkSteps++;
      remainingCapacity = capacityBefore - item.weight;
      currentW = wCursor;
      currentItem = idx;
      actionType = 'WALK';

      pushFrame({
        codeLine: 15,
        action: 'PICK',
        explanation: `parent[${capacityBefore}] = ${idx}: take one copy of '${item.name}' (weight ${item.weight}, value ${item.value})${isReuse ? ` — copy #${pickedCounts[item.name]} of the same item, exactly what unbounded supply allows` : ''}.`,
        conditionEval: {
          expr: `w > 0 and parent[w] != -1`,
          condition: `${capacityBefore} > 0 and ${idx} != -1`,
          result: true,
        },
        variables: {
          w: capacityBefore,
          item: item.name,
          copyNumber: pickedCounts[item.name],
          itemValue: item.value,
          picksSoFar: walkPicks.map((pick) => pick.itemName).join(', '),
        },
        milestone: !firstPickMilestone ? 'First Copy Picked' : isReuse && !reuseMilestone ? 'Same Item Reused' : undefined,
        soundCue: 'select',
        checkpoint:
          !walkCheckpointAdded
            ? {
                id: 'unbounded-walk-jump',
                question: `The walk just picked '${item.name}' (weight ${item.weight}) at capacity ${capacityBefore}. Which capacity does it continue from?`,
                options: [
                  `${capacityBefore - item.weight} — subtract the item's weight`,
                  `${capacityBefore - 1} — step back one capacity unit`,
                  'The walk stops — one copy is always enough',
                ],
                correctIndex: 0,
                explanation: `parent[${capacityBefore}] solved the sub-problem at capacity ${capacityBefore} − ${item.weight} = ${capacityBefore - item.weight}, so the walk continues there and may pick '${item.name}' again.`,
                hint: 'The parent pointer was written together with dp[w - weight[i]] + value[i].',
              }
            : undefined,
        pedagogy: {
          what: `'${item.name}' joins the packing${isReuse ? ' for a second (or later) time' : ''}.`,
          why: 'The forward sweep let dp[w - weight] contain this very item, so the parent chain can revisit it — the hallmark of unbounded choice.',
          whatNext: `Continue from capacity ${capacityBefore - item.weight}.`,
        },
      });
      if (!firstPickMilestone) firstPickMilestone = true;
      if (isReuse && !reuseMilestone) reuseMilestone = true;
      if (walkCheckpointAdded === false) walkCheckpointAdded = true;

      wCursor = remainingCapacity;

      pushFrame({
        codeLine: 16,
        action: 'MOVE',
        explanation: `w = ${capacityBefore} − ${item.weight} = ${wCursor}. ${wCursor === 0 ? 'The knapsack is exactly full.' : `parent[${wCursor}] = ${parent[wCursor] === -1 ? '-1, so the walk will stop here' : `'${items[parent[wCursor]].name}'`}.`}`,
        conditionEval: {
          expr: `w = w - wt[parent[w]]`,
          condition: `${capacityBefore} - ${item.weight}`,
          result: wCursor,
          formatted: `w = ${wCursor}`,
        },
        variables: {
          previousW: capacityBefore,
          w: wCursor,
          remainingValue: walkPicks.reduce((sum, pick) => sum + pick.value, 0),
        },
        soundCue: 'step',
        pedagogy: {
          what: `The remaining capacity drops to ${wCursor}.`,
          why: 'Each picked copy consumed its weight from the capacity, mirroring exactly how dp was built.',
          whatNext: wCursor === 0 || parent[wCursor] === -1 ? 'The walk is complete.' : `Read parent[${wCursor}] next.`,
        },
      });
    }

    phase = 'done';
    currentW = -1;
    currentItem = -1;
    remainingCapacity = wCursor;
    const pickNames = walkPicks.map((pick) => pick.itemName);
    const pickedValue = walkPicks.reduce((sum, pick) => sum + pick.value, 0);
    const pickedWeight = walkPicks.reduce((sum, pick) => sum + pick.weight, 0);

    pushFrame({
      codeLine: 17,
      action: 'DONE',
      explanation: `Unbounded knapsack solved: best value ${dp[W]} using ${pickNames.length > 0 ? pickNames.join(' + ') : 'no item'} (weight ${pickedWeight}/${W}). The recovered copies add up to ${pickedValue}, matching dp[${W}].`,
      conditionEval: {
        expr: 'sum of picked values == dp[W]',
        condition: `${pickedValue} == ${dp[W]}`,
        result: pickedValue === dp[W],
      },
      variables: {
        maxValue: dp[W],
        picks: pickNames.join(', ') || '(none)',
        pickCount: pickNames.length,
        pickedWeight,
        capacity: W,
        leftoverCapacity: wCursor,
      },
      milestone: 'Knapsack Solved',
      soundCue: 'finish',
      pedagogy: {
        what: `The packing uses ${pickNames.length} item copy(ies) with total weight ${pickedWeight} and value ${pickedValue}.`,
        why: 'Each copy was justified by a parent pointer, and the pointers were only written when dp improved, so the multiset realises the table value exactly.',
        whatNext:
          pickedWeight < W
            ? `${W - pickedWeight} capacity unit(s) remain unused: no item fits or improves the value there.`
            : 'The knapsack is exactly full; compare the presets to see the same item picked several times.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<UnboundedKnapsackState>) => {
    const {
      items,
      capacity,
      dp,
      parent,
      currentW,
      currentItem,
      phase,
      actionType,
      candidate,
      walkPicks,
      pickedCounts,
      remainingCapacity,
      stats,
    } = frame.state;

    const phaseLabel = phase === 'init' ? 'allocate' : phase === 'fill' ? 'filling dp' : phase === 'walk' ? 'reconstruction' : 'done';
    const walkSet = new Set(walkPicks.map((pick) => pick.capacityBefore));

    const formula = candidate
      ? candidate.canFit
        ? `dp[${candidate.w}] = max(dp[${candidate.w}] = ${candidate.currentBest}, dp[${candidate.sourceW}] + ${candidate.itemValue} = ${candidate.candidateVal}) → ${candidate.better ? `update to ${candidate.candidateVal}` : `keep ${candidate.currentBest}`}`
        : `dp[${candidate.w}]: '${candidate.itemName}' weight ${candidate.itemWeight} > capacity ${candidate.w} — cannot fit even once`
      : phase === 'walk' || phase === 'done'
        ? 'walk: parent[w] names the last item added; subtract its weight and repeat'
        : 'dp[w] = max(dp[w], dp[w - wt[i]] + val[i]) — forward sweep, unlimited copies';

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
              capacity <span className="font-bold text-amber-300">{capacity}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              tries <span className="font-bold text-cyan-300">{stats.tries}</span>/{items.length * capacity}
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              fit <span className="font-bold text-slate-300">{stats.fits}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              update <span className="font-bold text-emerald-300">{stats.updates}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              skip <span className="font-bold text-slate-400">{stats.skipped}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              value <span className="font-bold">{dp[capacity] ?? 0}</span>
            </span>
            <span className="rounded-md border border-violet-800 bg-violet-950/40 px-2 py-0.5 text-violet-200">
              copies <span className="font-bold">{walkPicks.length}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              weight <span className="font-bold text-slate-200">{walkPicks.reduce((sum, pick) => sum + pick.weight, 0)}</span>/{capacity}
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-3 pb-4">
            <div className="mb-1.5 font-mono text-[11px] text-slate-400">
              dp[w] <span className="text-slate-500">= best value within capacity w (unbounded supply)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dp.map((val, w) => {
                const isCurrent = w === currentW && phase === 'fill';
                const isSource = candidate && candidate.canFit && w === candidate.sourceW && phase === 'fill';
                const onWalk = walkSet.has(w);
                const isPick = walkPicks.some((pick) => pick.capacityBefore === w);
                let style = 'border-slate-800 bg-slate-900/60 text-slate-300';
                if (actionType === 'UPDATE' && isCurrent) {
                  style = 'border-emerald-400 bg-emerald-500/25 font-bold text-emerald-100 ring-2 ring-emerald-400/50';
                } else if (isCurrent) {
                  style = 'border-cyan-400 bg-cyan-500/20 font-bold text-cyan-100 ring-2 ring-cyan-400/40';
                } else if (isSource) {
                  style = 'border-amber-400 bg-amber-500/15 font-bold text-amber-100';
                } else if (onWalk) {
                  style = 'border-violet-500 bg-violet-950/40 text-violet-200';
                } else if (val > 0) {
                  style = 'border-slate-800 bg-slate-900/40 text-slate-200';
                }
                return (
                  <div key={w} className="flex flex-col items-center">
                    <div className={`flex h-12 w-11 items-center justify-center rounded-xl border-2 font-mono text-sm font-bold transition-all ${style}`}>
                      {val}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 font-mono text-[9px]">
                      <span className="text-slate-500">{w}</span>
                      {parent[w] !== -1 && (
                        <span className={onWalk ? 'font-bold text-violet-300' : 'text-slate-500'}>←{items[parent[w]]?.name ?? parent[w]}</span>
                      )}
                      {isPick && <span className="font-bold text-violet-400">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="text-cyan-300">Items (unlimited copies)</span>
                {currentItem >= 0 && phase === 'fill' && <span className="font-mono text-[10px] text-slate-400">testing #{currentItem + 1}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                {items.map((item, idx) => {
                  const isTesting = idx === currentItem && phase === 'fill';
                  const copies = pickedCounts[item.name] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-all ${
                        copies > 0
                          ? 'border-emerald-500 bg-emerald-500/15 font-semibold text-emerald-200'
                          : isTesting
                            ? 'border-cyan-500 bg-cyan-500/15 font-semibold text-cyan-200'
                            : 'border-slate-700/60 bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{copies > 0 ? `✓×${copies}` : isTesting ? '►' : '•'}</span>
                        <span>{item.name}</span>
                      </span>
                      <span className="text-[11px] tabular-nums text-slate-400">
                        wt:<strong className="ml-0.5 text-white">{item.weight}</strong> · val:
                        <strong className="ml-0.5 text-emerald-300">{item.value}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(phase === 'walk' || phase === 'done') && (
              <div className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
                  <span>Recovered packing</span>
                  <span>
                    value {walkPicks.reduce((sum, pick) => sum + pick.value, 0)} · w {remainingCapacity}
                  </span>
                </div>
                {walkPicks.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] font-bold text-violet-100">
                    {walkPicks.map((pick, pos) => (
                      <span key={pos} className="flex items-center gap-1">
                        {pos > 0 && <span className="text-violet-500">+</span>}
                        <span className="rounded-md border border-violet-400 bg-violet-500/25 px-1.5 py-0.5">{pick.itemName}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-slate-500">no copy picked yet</div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-400" />
                  <span>w — capacity being solved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>dp[w - wt] — sub-answer (may reuse the item)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  <span>dp update</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-violet-400" />
                  <span>walk cell (reconstruction)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">←X</span>
                  <span>parent pointer (last item added)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
