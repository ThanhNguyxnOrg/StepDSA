import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface KnapsackItem {
  id: number;
  name: string;
  weight: number;
  value: number;
}

export interface KnapsackInput {
  capacity: number;
  items: KnapsackItem[];
}

export type KnapsackDecision = 'include' | 'exclude' | 'skip-too-heavy' | 'compare';

export interface KnapsackCandidate {
  i: number;
  w: number;
  itemName: string;
  itemWeight: number;
  itemValue: number;
  excludeVal: number;
  includeVal: number;
  canTake: boolean;
  decision: KnapsackDecision;
  value: number;
}

export interface KnapsackState {
  items: KnapsackItem[];
  capacity: number;
  /** [items + 1][capacity + 1]; row 0 = no items, column 0 = no capacity. */
  dpTable: number[][];
  /** 1-based row of the cell being written (0 = the base row). */
  currentItemIndex: number;
  currentWeight: number;
  activeDependencies?: {
    excludeCell?: [number, number];
    includeCell?: [number, number];
  };
  decision?: KnapsackDecision;
  /** Item ids (1-based row numbers) recovered by the backtrack walk. */
  chosenItems?: number[];
  phase: 'init' | 'table' | 'backtrack' | 'done';
  candidate: KnapsackCandidate | null;
  /** Cells visited by the reconstruction, bottom-right first. */
  walkPath: [number, number][];
  remainingCapacity: number;
  chosenWeight: number;
  chosenValue: number;
  stats: {
    cells: number;
    includes: number;
    excludes: number;
    tooHeavy: number;
    backtrackSteps: number;
  };
}

const MAX_CAPACITY = 12;
const MAX_ITEMS = 6;
const MAX_ITEM_WEIGHT = 12;
const MAX_ITEM_VALUE = 99;

const DEFAULT_ITEMS: KnapsackItem[] = [
  { id: 1, name: 'Gem', weight: 1, value: 1 },
  { id: 2, name: 'Vase', weight: 3, value: 4 },
  { id: 3, name: 'Book', weight: 4, value: 5 },
  { id: 4, name: 'Gold', weight: 5, value: 7 },
];

interface NormalisedInput {
  capacity: number;
  items: KnapsackItem[];
  notes: string[];
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalise(input: KnapsackInput | undefined): NormalisedInput {
  const notes: string[] = [];
  const rawCapacity =
    typeof input?.capacity === 'number' && Number.isFinite(input.capacity) ? input.capacity : 7;
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
    // An explicitly empty item list is a valid input (answer 0); a list with no
    // usable entries is treated as a typo and falls back to the documented default.
    notes.push('no usable items in the input, so the default item set is used');
    usable.push(...DEFAULT_ITEMS);
  }
  if (usable.length > MAX_ITEMS) {
    notes.push(`${usable.length} items truncated to ${MAX_ITEMS} for a readable table`);
  }

  const items: KnapsackItem[] = usable.slice(0, MAX_ITEMS).map((item, index) => {
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

function describeDecision(decision: KnapsackDecision): string {
  if (decision === 'include') return 'include';
  if (decision === 'exclude') return 'exclude';
  if (decision === 'skip-too-heavy') return 'too heavy';
  return 'compare';
}

export const knapsackModule: AlgorithmModule<KnapsackInput, KnapsackState> = {
  id: 'knapsack-01',
  title: '0/1 Knapsack Problem (Dynamic Programming Table)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'unbounded-knapsack', label: 'Unbounded Knapsack' },
    { id: 'subset-sum', label: 'Subset Sum' },
    { id: 'coin-change', label: 'Coin Change' },
    { id: 'edit-distance', label: 'Edit Distance' },
  ],
  complexity: {
    timeBest: 'O(N · W)',
    timeAverage: 'O(N · W)',
    timeWorst: 'O(N · W)',
    spaceAuxiliary: 'O(N · W) table, O(N + W) for the reconstruction walk',
    worstCaseCondition: 'Pseudo-polynomial: every one of the N · W cells is evaluated, so runtime grows with capacity, not just item count',
  },
  theory: {
    overview:
      'Given weights and values of N items, put a subset in a knapsack of capacity W to maximise the total value. Each item is taken whole (1) or left behind (0) — nothing is split.',
    whyItWorks:
      'Optimal substructure: the best answer for the first i items at capacity w either excludes item i (inherit dp[i-1][w]) or includes it (value[i] + the best answer for the first i-1 items at capacity w - weight[i]). Taking the larger of those two options cannot be beaten, and every subproblem is solved once.',
    invariant:
      'dp[i][w] holds the exact maximum value attainable using any subset of the first i items with total weight at most w. Row 0 and column 0 are 0 because no item or no capacity yields no value.',
    pitfalls: [
      '0/1 knapsack items cannot be split — fractional knapsack is a greedy problem, not this DP.',
      'The include branch must read row i-1 (not row i): reading row i would allow the same item to be reused, which is the unbounded variant.',
      'Off-by-one indexing: dp[i][w] talks about item i-1 in the zero-based item list.',
      'Ties are real: when dp[i-1][w] == value[i] + dp[i-1][w-weight[i]], excluding the item is still optimal, so the walk may skip an item that another optimal solution takes.',
    ],
    steps: [
      'Allocate the (N+1)×(W+1) table; row 0 and column 0 stay 0.',
      'For each item i and capacity w: if the item is heavier than w, inherit dp[i-1][w].',
      'Otherwise read the exclude value dp[i-1][w] and the include value value[i] + dp[i-1][w-weight[i]].',
      'Write the larger of the two into dp[i][w] and remember which branch won.',
      'Walk back from dp[N][W]: when the value differs from the row above, item i was taken; subtract its weight and continue.',
    ],
    watchOut: [
      'The walk only proves which items this particular table used; ties can give several optimal subsets with the same value.',
      'A cell marked “too heavy” never compares values: the item cannot fit at that capacity at all.',
    ],
  },
  defaultInput: { capacity: 7, items: DEFAULT_ITEMS },
  presets: [
    {
      id: 'classic-4-items',
      label: 'Classic 4 Items (W=7)',
      description: 'Textbook input: Gem/Vase/Book/Gold, best value 9 with Vase + Gold',
      data: { capacity: 7, items: DEFAULT_ITEMS },
    },
    {
      id: 'heavy-items',
      label: 'Heavy vs High Value (W=8)',
      description: 'One heavy item competes with several cheap ones; watch the include/exclude ties',
      data: {
        capacity: 8,
        items: [
          { id: 1, name: 'Coin', weight: 2, value: 3 },
          { id: 2, name: 'Relic', weight: 3, value: 4 },
          { id: 3, name: 'Sword', weight: 4, value: 5 },
          { id: 4, name: 'Armor', weight: 5, value: 6 },
        ],
      },
    },
    {
      id: 'one-heavy',
      label: 'One Item Too Heavy (W=5)',
      description: 'Anvil weighs 9 > capacity 5, so its whole row is inherited — the skip branch',
      data: {
        capacity: 5,
        items: [
          { id: 1, name: 'Pearl', weight: 1, value: 2 },
          { id: 2, name: 'Anvil', weight: 9, value: 50 },
          { id: 3, name: 'Ruby', weight: 3, value: 6 },
        ],
      },
    },
    {
      id: 'tie-breaker',
      label: 'Exact Tie (W=4)',
      description: 'Two different subsets reach value 4, so the walk’s tie-break decides which one is shown',
      data: {
        capacity: 4,
        items: [
          { id: 1, name: 'A', weight: 2, value: 2 },
          { id: 2, name: 'B', weight: 2, value: 2 },
          { id: 3, name: 'C', weight: 4, value: 4 },
        ],
      },
    },
  ],
  codeSnippets: {
    pseudocode: `function knapsack(W, wt, val, n):
    dp = (n + 1) x (W + 1) matrix of zeros
    for i = 1 to n:
        for w = 1 to W:
            if wt[i-1] <= w:
                exclude = dp[i-1][w]
                include = val[i-1] + dp[i-1][w - wt[i-1]]
                dp[i][w] = max(exclude, include)
            else:
                dp[i][w] = dp[i-1][w]
    w = W; chosen = []
    for i = n down to 1:
        if dp[i][w] != dp[i-1][w]:
            chosen.push(i); w = w - wt[i-1]
    return dp[n][W], chosen`,
    python: `def knapsack(W, wt, val, n):
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if wt[i - 1] <= w:
                exclude = dp[i - 1][w]
                include = val[i - 1] + dp[i - 1][w - wt[i - 1]]
                dp[i][w] = max(exclude, include)
            else:
                dp[i][w] = dp[i - 1][w]
    w, chosen = W, []
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            chosen.append(i); w -= wt[i - 1]
    return dp[n][W], chosen`,
    typescript: `function knapsack(W: number, wt: number[], val: number[], n: number, chosen: number[]): number {
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= W; w++) {
      if (wt[i - 1] <= w) {
        const exclude = dp[i - 1][w];
        const include = val[i - 1] + dp[i - 1][w - wt[i - 1]];
        dp[i][w] = Math.max(exclude, include);
      } else {
        dp[i][w] = dp[i - 1][w]; } }
  let w = W;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      chosen.push(i); w -= wt[i - 1]; } }
  return dp[n][W]; }`,
    cpp: `int knapsack(int W, vector<int>& wt, vector<int>& val, int n, vector<int>& chosen) {
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w) {
                int exclude = dp[i - 1][w];
                int include = val[i - 1] + dp[i - 1][w - wt[i - 1]];
                dp[i][w] = max(exclude, include);
            } else {
                dp[i][w] = dp[i - 1][w]; } }
    int w = W;
    for (int i = n; i >= 1; i--) {
        if (dp[i][w] != dp[i - 1][w]) {
            chosen.push_back(i); w -= wt[i - 1]; } }
    return dp[n][W]; }`,
    java: `public int knapsack(int W, int[] wt, int[] val, int n, List<Integer> chosen) {
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w) {
                int exclude = dp[i - 1][w];
                int include = val[i - 1] + dp[i - 1][w - wt[i - 1]];
                dp[i][w] = Math.max(exclude, include);
            } else {
                dp[i][w] = dp[i - 1][w]; } }
    int w = W;
    for (int i = n; i >= 1; i--) {
        if (dp[i][w] != dp[i - 1][w]) {
            chosen.add(i); w -= wt[i - 1]; } }
    return dp[n][W]; }`,
  },
  generateTimeline: (input: KnapsackInput): ExecutionFrame<KnapsackState>[] => {
    const { capacity: W, items, notes } = normalise(input);
    const n = items.length;

    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    const frames: ExecutionFrame<KnapsackState>[] = [];
    const chosenItems: number[] = [];
    const walkPath: [number, number][] = [];

    let currentItemIndex = 0;
    let currentWeight = 0;
    let activeDependencies: KnapsackState['activeDependencies'] = undefined;
    let decision: KnapsackDecision | undefined;
    let candidate: KnapsackCandidate | null = null;
    let phase: KnapsackState['phase'] = 'init';
    let remainingCapacity = W;
    let lastCellLine = 8;

    let cells = 0;
    let includes = 0;
    let excludes = 0;
    let tooHeavy = 0;
    let backtrackSteps = 0;

    let firstFitMilestone = false;
    let firstIncludeMilestone = false;
    let firstTakeMilestone = false;
    let choiceCheckpointAdded = false;
    let backtrackCheckpointAdded = false;

    const chosenWeight = () =>
      chosenItems.reduce((sum, id) => sum + (items[id - 1]?.weight ?? 0), 0);

    const stats = () => ({ cells, includes, excludes, tooHeavy, backtrackSteps });

    const snapshot = (overrides: Partial<KnapsackState> = {}): KnapsackState => ({
      items: items.map((item) => ({ ...item })),
      capacity: W,
      dpTable: dp.map((row) => [...row]),
      currentItemIndex,
      currentWeight,
      activeDependencies,
      decision,
      chosenItems: [...chosenItems].sort((a, b) => a - b),
      phase,
      candidate,
      walkPath: walkPath.map(([i, w]) => [i, w] as [number, number]),
      remainingCapacity,
      chosenWeight: chosenWeight(),
      chosenValue: chosenItems.reduce((sum, id) => sum + (items[id - 1]?.value ?? 0), 0),
      stats: stats(),
      ...overrides,
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<KnapsackState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<KnapsackState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
      snapshotOverrides?: Partial<KnapsackState>;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(opts.snapshotOverrides),
        callStack: [
          {
            name: phase === 'backtrack' || phase === 'done' ? 'reconstruct(dp, wt, W)' : 'knapsack(W, wt, val, n)',
            params: {
              i: currentItemIndex,
              w: currentWeight,
              ...(phase === 'backtrack' || phase === 'done' ? { remaining: remainingCapacity } : {}),
            },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: cells + backtrackSteps, accesses: cells, lookups: backtrackSteps },
        invariantStatus: {
          label:
            phase === 'init'
              ? 'Row 0 and column 0 are 0: no items or no capacity means no value'
              : phase === 'table'
                ? `dp[${currentItemIndex}][${currentWeight}] = ${dp[currentItemIndex]?.[currentWeight] ?? 0} = best value using the first ${currentItemIndex} item(s) within capacity ${currentWeight}`
                : `Walk at (${currentItemIndex}, ${remainingCapacity}): ${chosenItems.length} item(s) selected so far`,
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
        `Allocate the (N+1)×(W+1) = ${n + 1}×${W + 1} table for ${n} item(s) and capacity ${W}; row 0 (no items) and column 0 (no capacity) stay 0.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: {
        items: n,
        capacity: W,
        cells: (n + 1) * (W + 1),
        decisions: n * W,
        totalValue: items.reduce((sum, item) => sum + item.value, 0),
        totalWeight: items.reduce((sum, item) => sum + item.weight, 0),
      },
      soundCue: 'start',
      pedagogy: {
        what: `The table has ${n + 1} row(s) and ${W + 1} column(s); each inner cell answers one (first i items, capacity w) question.`,
        why: 'The base row and column encode “no item chosen” and “no capacity left”, where the best value is 0 by definition.',
        whatNext: n > 0 ? `Start row 1 with '${items[0].name}' (weight ${items[0].weight}, value ${items[0].value}).` : 'There are no items, so the answer is 0.',
      },
    });

    if (n === 0) {
      phase = 'done';
      pushFrame({
        codeLine: 15,
        action: 'DONE',
        explanation: 'There are no items to place, so the best value is 0 and no item is selected.',
        variables: { maxValue: 0, chosen: '', chosenWeight: 0, capacity: W },
        milestone: 'Knapsack Solved',
        soundCue: 'finish',
        pedagogy: {
          what: 'With an empty item list every cell stays 0.',
          why: 'The base row of the table is the whole answer here.',
          whatNext: 'Add at least one item to see include/exclude decisions.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    phase = 'table';
    for (let i = 1; i <= n; i++) {
      const item = items[i - 1];
      currentItemIndex = i;
      currentWeight = 0;
      activeDependencies = undefined;
      decision = undefined;
      candidate = null;

      pushFrame({
        codeLine: 3,
        action: 'ITEM_START',
        explanation: `Row ${i} asks: with the first ${i} item(s), what is the best value for every capacity 0..${W}? This row adds '${item.name}' (weight ${item.weight}, value ${item.value}).`,
        variables: { i, item: item.name, weight: item.weight, value: item.value, cellsFilled: cells },
        soundCue: 'step',
        pedagogy: {
          what: `The DP moves to item ${i}: '${item.name}' may now be added to any subset of the previous ${i - 1} item(s).`,
          why: 'Each row keeps the answers of the row above, so the previous items remain available through dp[i-1][*].',
          whatNext: `Compare '${item.name}' weight ${item.weight} with capacity 1.`,
        },
      });

      for (let w = 1; w <= W; w++) {
        const canTake = item.weight <= w;
        currentWeight = w;
        cells++;

        if (!canTake) {
          tooHeavy++;
          dp[i][w] = dp[i - 1][w];
          lastCellLine = 10;
          activeDependencies = { excludeCell: [i - 1, w] };
          decision = 'skip-too-heavy';
          candidate = {
            i,
            w,
            itemName: item.name,
            itemWeight: item.weight,
            itemValue: item.value,
            excludeVal: dp[i - 1][w],
            includeVal: Number.NaN,
            canTake: false,
            decision: 'skip-too-heavy',
            value: dp[i][w],
          };

          pushFrame({
            codeLine: 10,
            action: 'CELL_TOO_HEAVY',
            explanation: `'${item.name}' weighs ${item.weight} > capacity ${w}, so it cannot be taken at all: dp[${i}][${w}] inherits dp[${i - 1}][${w}] = ${dp[i][w]}.`,
            conditionEval: {
              expr: `wt[${i - 1}] <= ${w}`,
              condition: `${item.weight} <= ${w}`,
              result: false,
            },
            variables: {
              i,
              w,
              item: item.name,
              itemWeight: item.weight,
              capacity: w,
              'dp[i][w]': dp[i][w],
              inheritedFrom: `dp[${i - 1}][${w}]`,
              decision: 'skip (too heavy)',
            },
            soundCue: 'discard',
            pedagogy: {
              what: `The item is heavier than this capacity, so there is only one option: copy the value from the row above.`,
              why: 'An item that does not fit cannot appear in any subset of capacity w, so the best value is unchanged from the previous items.',
              whatNext: w < W ? `Move to capacity ${w + 1}; the item may fit there.` : `Row ${i} is done; continue with the next item.`,
            },
          });
          continue;
        }

        const excludeVal = dp[i - 1][w];
        const includeVal = item.value + dp[i - 1][w - item.weight];
        const willInclude = includeVal > excludeVal;
        lastCellLine = 8;
        activeDependencies = {
          excludeCell: [i - 1, w],
          includeCell: [i - 1, w - item.weight],
        };
        decision = 'compare';
        candidate = {
          i,
          w,
          itemName: item.name,
          itemWeight: item.weight,
          itemValue: item.value,
          excludeVal,
          includeVal,
          canTake: true,
          decision: 'compare',
          value: Math.max(excludeVal, includeVal),
        };

        pushFrame({
          codeLine: 7,
          action: 'CELL_COMPARE',
          explanation: `At capacity ${w}: excluding '${item.name}' keeps dp[${i - 1}][${w}] = ${excludeVal}; including it costs ${item.weight} capacity and adds ${item.value} + dp[${i - 1}][${w - item.weight}] = ${item.value} + ${includeVal - item.value} = ${includeVal}.`,
          conditionEval: {
            expr: `wt[${i - 1}] <= ${w}`,
            condition: `${item.weight} <= ${w}`,
            result: true,
          },
          variables: {
            i,
            w,
            item: item.name,
            itemWeight: item.weight,
            itemValue: item.value,
            exclude: excludeVal,
            include: includeVal,
            remainingCapacityIfTaken: w - item.weight,
            'dp[i][w]': Math.max(excludeVal, includeVal),
          },
          milestone: !firstFitMilestone ? 'First Fitting Item' : undefined,
          soundCue: 'compare',
          pedagogy: {
            what: `Both branches are known: exclude = ${excludeVal}, include = ${includeVal}.`,
            why: 'These are exactly the two ways the optimal subset can treat the newest item — leave it out, or take it and fill the remaining capacity optimally.',
            whatNext: `Write the larger of ${excludeVal} and ${includeVal} into dp[${i}][${w}].`,
          },
        });
        if (!firstFitMilestone) firstFitMilestone = true;

        dp[i][w] = Math.max(excludeVal, includeVal);
        decision = willInclude ? 'include' : 'exclude';
        candidate = {
          i,
          w,
          itemName: item.name,
          itemWeight: item.weight,
          itemValue: item.value,
          excludeVal,
          includeVal,
          canTake: true,
          decision,
          value: dp[i][w],
        };
        if (willInclude) includes++;
        else excludes++;

        pushFrame({
          codeLine: 8,
          action: 'CELL_DECIDE',
          explanation: willInclude
            ? `Include wins: ${includeVal} > ${excludeVal}, so dp[${i}][${w}] = ${dp[i][w]} and '${item.name}' is part of the best subset for this cell.`
            : `Exclude wins: ${excludeVal} >= ${includeVal}, so dp[${i}][${w}] = ${dp[i][w]} and the best subset for this cell leaves '${item.name}' out${excludeVal === includeVal ? ' (a tie: including it would give the same value)' : ''}.`,
          conditionEval: {
            expr: `max(dp[${i - 1}][${w}], ${item.value} + dp[${i - 1}][${w - item.weight}])`,
            condition: `max(${excludeVal}, ${includeVal}) = ${dp[i][w]}`,
            result: dp[i][w],
            formatted: `${dp[i][w]} (${willInclude ? 'include' : 'exclude'})`,
          },
          variables: {
            i,
            w,
            item: item.name,
            exclude: excludeVal,
            include: includeVal,
            decision: describeDecision(decision),
            'dp[i][w]': dp[i][w],
            cellsFilled: cells,
          },
          milestone: willInclude && !firstIncludeMilestone ? `First Include (${item.name})` : undefined,
          soundCue: willInclude ? 'success' : 'step',
          checkpoint:
            !choiceCheckpointAdded && excludeVal !== includeVal
              ? {
                  id: 'knapsack-include-or-exclude',
                  question: `dp[${i}][${w}] for '${item.name}' (weight ${item.weight}, value ${item.value}): exclude keeps ${excludeVal}, include gives ${item.value} + dp[${i - 1}][${w - item.weight}] = ${includeVal}. Which value belongs in the cell?`,
                  options: [
                    `${includeVal} — take the item (${includeVal} > ${excludeVal})`,
                    `${excludeVal} — always skip the newest item`,
                    `${excludeVal + includeVal} — add both branches`,
                  ],
                  correctIndex: willInclude ? 0 : 1,
                  explanation: `The recurrence takes the larger branch, so dp[${i}][${w}] = ${dp[i][w]}${willInclude ? ' and the item is included here' : ' and the item is excluded here'}.`,
                  hint: 'Compare the two branch values; the larger one is the optimal sub-answer.',
                }
              : undefined,
          pedagogy: {
            what: willInclude
              ? `Taking '${item.name}' is better (${includeVal} > ${excludeVal}), so the cell becomes ${dp[i][w]}.`
              : `Leaving '${item.name}' out is at least as good (${excludeVal} >= ${includeVal}), so the cell stays ${dp[i][w]}.`,
            why: willInclude
              ? 'The include branch adds the item value on top of the best solution for the remaining capacity, and that total beats every solution without the item.'
              : 'Every solution that takes the item is no better than the best solution that ignores it, so the optimum never needs it at this capacity.',
            whatNext:
              w < W
                ? `Move to capacity ${w + 1} and repeat the same comparison.`
                : i < n
                  ? `Row ${i} is complete; start row ${i + 1} with '${items[i].name}'.`
                  : `Table complete: dp[${n}][${W}] = ${dp[n][W]}. Walk back to see which items produced it.`,
          },
        });
        if (willInclude && !firstIncludeMilestone) firstIncludeMilestone = true;
        if (excludeVal !== includeVal) choiceCheckpointAdded = true;
      }
    }

    pushFrame({
      codeLine: lastCellLine,
      action: 'TABLE_COMPLETE',
      explanation: `Table filled: dp[${n}][${W}] = ${dp[n][W]} is the maximum value within capacity ${W} (${includes} include cell(s), ${excludes} exclude cell(s), ${tooHeavy} too-heavy cell(s)).`,
      variables: { maxValue: dp[n][W], includes, excludes, tooHeavy, cells },
      milestone: 'Table Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `All ${cells} inner cells are decided; the bottom-right cell holds the answer ${dp[n][W]}.`,
        why: 'Every cell used only the row above, so each subproblem was solved exactly once and no subset was enumerated twice.',
        whatNext: `Start at dp[${n}][${W}] and walk upwards to recover the chosen items.`,
      },
    });

    // ─── reconstruction ───
    phase = 'backtrack';
    let wCursor = W;
    remainingCapacity = wCursor;
    currentItemIndex = n;
    currentWeight = W;
    activeDependencies = undefined;
    decision = undefined;
    candidate = null;
    walkPath.push([n, W]);

    pushFrame({
      codeLine: 11,
      action: 'BT_START',
      explanation: `Walk back from dp[${n}][${W}] = ${dp[n][W]} with an empty selection and remaining capacity ${W}.`,
      variables: { i: n, w: W, 'dp[i][w]': dp[n][W], remaining: W, chosen: '' },
      soundCue: 'start',
      pedagogy: {
        what: `The reconstruction starts at the bottom-right cell (${n}, ${W}) whose value ${dp[n][W]} is the final answer.`,
        why: 'The table stores values only; comparing each cell with the row above reveals whether the newest item was used.',
        whatNext: `Compare dp[${n}][${W}] with dp[${n - 1}][${W}].`,
      },
    });

    for (let i = n; i >= 1; i--) {
      const item = items[i - 1];
      const above = dp[i - 1][wCursor];
      const cellValue = dp[i][wCursor];
      const differs = cellValue !== above;
      backtrackSteps++;
      currentItemIndex = i;
      currentWeight = wCursor;
      remainingCapacity = wCursor;
      activeDependencies = { excludeCell: [i - 1, wCursor] };
      decision = differs ? 'include' : 'exclude';
      candidate = {
        i,
        w: wCursor,
        itemName: item.name,
        itemWeight: item.weight,
        itemValue: item.value,
        excludeVal: above,
        includeVal: cellValue,
        canTake: true,
        decision: differs ? 'include' : 'exclude',
        value: cellValue,
      };

      pushFrame({
        codeLine: 13,
        action: 'BT_CHECK',
        explanation: differs
          ? `dp[${i}][${wCursor}] = ${cellValue} differs from dp[${i - 1}][${wCursor}] = ${above}, so '${item.name}' must be in this optimal subset.`
          : `dp[${i}][${wCursor}] = ${cellValue} equals dp[${i - 1}][${wCursor}] = ${above}, so '${item.name}' is not needed at capacity ${wCursor}.`,
        conditionEval: {
          expr: `dp[${i}][${wCursor}] != dp[${i - 1}][${wCursor}]`,
          condition: `${cellValue} != ${above}`,
          result: differs,
        },
        variables: {
          i,
          w: wCursor,
          item: item.name,
          'dp[i][w]': cellValue,
          'dp[i-1][w]': above,
          differs,
          chosen: chosenItems
            .slice()
            .sort((a, b) => a - b)
            .map((id) => items[id - 1]?.name)
            .join(', '),
        },
        soundCue: differs ? 'select' : 'discard',
        checkpoint:
          !backtrackCheckpointAdded
            ? {
                id: 'knapsack-backtrack-first-decision',
                question: `At (${i}, ${wCursor}): dp[${i}][${wCursor}] = ${cellValue} while the row above holds ${above}. What does this comparison tell the reconstruction?`,
                options: [
                  `'${item.name}' is in this optimal subset`,
                  `'${item.name}' is not in this optimal subset`,
                  'The table is inconsistent and must be rebuilt',
                ],
                correctIndex: differs ? 0 : 1,
                explanation: differs
                  ? `A larger value than the row above can only come from taking '${item.name}', so it is selected and the remaining capacity drops to ${wCursor - item.weight}.`
                  : 'Equal values mean the optimum is already reachable without this item, so the walk skips it and keeps the same capacity.',
                hint: 'Only the include branch can make a cell larger than the cell directly above it.',
              }
            : undefined,
        pedagogy: {
          what: differs
            ? `The value grew compared with the row above, so '${item.name}' was taken at this capacity.`
            : `The value is unchanged from the row above, so '${item.name}' was not taken here.`,
          why: 'dp[i][w] is built either by copying dp[i-1][w] or by adding value[i] on top of dp[i-1][w-weight[i]]; only the include branch can raise the value.',
          whatNext: differs
            ? `Record '${item.name}', subtract its weight ${item.weight}, and continue from dp[${i - 1}][${wCursor - item.weight}].`
            : `Keep capacity ${wCursor} and continue from dp[${i - 1}][${wCursor}].`,
        },
      });
      backtrackCheckpointAdded = true;

      if (differs) {
        chosenItems.push(i);
        remainingCapacity = wCursor - item.weight;
        currentWeight = remainingCapacity;
        activeDependencies = {
          excludeCell: [i - 1, wCursor],
          includeCell: [i - 1, remainingCapacity],
        };
        candidate = {
          i,
          w: wCursor,
          itemName: item.name,
          itemWeight: item.weight,
          itemValue: item.value,
          excludeVal: above,
          includeVal: cellValue,
          canTake: true,
          decision: 'include',
          value: cellValue,
        };

        pushFrame({
          codeLine: 14,
          action: 'BT_TAKE',
          explanation: `Take '${item.name}' (weight ${item.weight}, value ${item.value}): remaining capacity becomes ${wCursor} − ${item.weight} = ${remainingCapacity}.`,
          variables: {
            i,
            item: item.name,
            itemWeight: item.weight,
            itemValue: item.value,
            capacityBefore: wCursor,
            remaining: remainingCapacity,
            chosenCount: chosenItems.length,
            chosenWeight: chosenWeight(),
          },
          milestone: !firstTakeMilestone ? 'First Item Selected' : undefined,
          soundCue: 'insert',
          pedagogy: {
            what: `'${item.name}' joins the selection and consumes ${item.weight} capacity.`,
            why: 'The include branch solved the subproblem at capacity w − weight[i], so the walk must continue in that exact cell.',
            whatNext: i > 1 ? `Continue with item ${i - 1} at capacity ${remainingCapacity}.` : 'The walk reached row 0; the selection is complete.',
          },
        });
        if (!firstTakeMilestone) firstTakeMilestone = true;
        wCursor = remainingCapacity;
        walkPath.push([i - 1, wCursor]);
      } else {
        walkPath.push([i - 1, wCursor]);
      }
    }

    currentItemIndex = 0;
    currentWeight = 0;
    remainingCapacity = wCursor;
    activeDependencies = undefined;
    decision = undefined;
    candidate = null;
    phase = 'done';
    const orderedChosen = [...chosenItems].sort((a, b) => a - b);
    const chosenNames = orderedChosen.map((id) => items[id - 1]?.name).filter(Boolean);
    const finalWeight = chosenWeight();
    const finalValue = chosenItems.reduce((sum, id) => sum + (items[id - 1]?.value ?? 0), 0);

    pushFrame({
      codeLine: 15,
      action: 'DONE',
      explanation: `Knapsack solved: best value ${dp[n][W]} using ${chosenNames.length > 0 ? chosenNames.join(' + ') : 'no items'} (weight ${finalWeight} / ${W}). The recovered values add up to ${finalValue}, matching dp[${n}][${W}].`,
      variables: {
        maxValue: dp[n][W],
        chosen: chosenNames.join(', ') || '(none)',
        chosenCount: chosenNames.length,
        chosenWeight: finalWeight,
        capacity: W,
        recoveredValue: finalValue,
      },
      milestone: 'Knapsack Solved',
      soundCue: 'finish',
      pedagogy: {
        what: `The walk selected ${chosenNames.length} item(s) with total weight ${finalWeight} and value ${finalValue}.`,
        why: 'Each selected item was justified by a cell that grew relative to the row above, and its weight was subtracted, so the selection fits the capacity and realises the table value.',
        whatNext:
          finalWeight < W
            ? `There are ${W - finalWeight} unused capacity unit(s): no remaining item improves the value.`
            : 'The knapsack is exactly full; compare the other presets to see ties and too-heavy rows.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<KnapsackState>) => {
    const {
      items,
      capacity,
      dpTable,
      currentItemIndex,
      currentWeight,
      activeDependencies,
      decision,
      chosenItems,
      phase,
      candidate,
      walkPath,
      remainingCapacity,
      chosenWeight,
      chosenValue,
      stats,
    } = frame.state;

    const activeItem = currentItemIndex > 0 ? items[currentItemIndex - 1] : null;
    const walkSet = new Set(walkPath.map(([i, w]) => `${i}:${w}`));
    const chosenSet = new Set(chosenItems ?? []);

    const formula = candidate
      ? candidate.canTake
        ? `dp[${candidate.i}][${candidate.w}] = max(exclude ${candidate.excludeVal}, include ${candidate.itemValue} + dp[${candidate.i - 1}][${candidate.w - candidate.itemWeight}] = ${candidate.includeVal}) = ${candidate.value} → ${describeDecision(candidate.decision)}`
        : `dp[${candidate.i}][${candidate.w}] = dp[${candidate.i - 1}][${candidate.w}] = ${candidate.value} (weight ${candidate.itemWeight} > capacity ${candidate.w})`
      : phase === 'backtrack' || phase === 'done'
        ? 'walk back: a cell larger than the row above means the item was taken; subtract its weight'
        : 'exclude = dp[i-1][w]; include = val[i-1] + dp[i-1][w-wt[i-1]]; dp[i][w] = max(exclude, include)';

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span
              className={`rounded-md border px-2 py-0.5 font-bold uppercase ${
                phase === 'backtrack' || phase === 'done'
                  ? 'border-violet-500/40 bg-violet-500/20 text-violet-200'
                  : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200'
              }`}
            >
              {phase === 'init' ? 'allocate' : phase === 'table' ? 'filling table' : phase === 'backtrack' ? 'reconstruction' : 'done'}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300">
              capacity <span className="font-bold text-amber-300">{capacity}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              cells <span className="font-bold text-cyan-300">{stats.cells}</span>/{items.length * capacity}
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              include <span className="font-bold text-emerald-300">{stats.includes}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              exclude <span className="font-bold text-cyan-300">{stats.excludes}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              too heavy <span className="font-bold text-amber-300">{stats.tooHeavy}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              value <span className="font-bold">{dpTable[items.length]?.[capacity] ?? 0}</span>
            </span>
            <span className="rounded-md border border-violet-800 bg-violet-950/40 px-2 py-0.5 text-violet-200">
              selected <span className="font-bold">{chosenItems?.length ?? 0}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              weight <span className="font-bold text-slate-200">{chosenWeight}</span>/{capacity}
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
            <table className="w-full border-collapse font-mono text-xs tabular-nums">
              <thead>
                <tr>
                  <th className="min-w-[86px] border-b border-r border-slate-800 bg-slate-900/40 p-1.5 text-left text-slate-400">
                    item / w
                  </th>
                  {Array.from({ length: capacity + 1 }).map((_, w) => (
                    <th
                      key={w}
                      className={`border-b border-slate-800 p-1.5 text-center transition-colors ${
                        w === currentWeight
                          ? 'bg-cyan-500/20 font-bold text-cyan-300'
                          : 'font-medium text-slate-400'
                      }`}
                    >
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dpTable.map((row, i) => {
                  const item = i > 0 ? items[i - 1] : null;
                  const isCurrentRow = i === currentItemIndex;
                  return (
                    <tr key={i} className={isCurrentRow ? 'bg-slate-800/40' : ''}>
                      <td className="whitespace-nowrap border-b border-r border-slate-800 p-1.5 text-[11px] text-slate-300">
                        {i === 0 ? (
                          <span className="text-slate-500">0 (base)</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {chosenSet.has(i) && <span className="text-emerald-400">✓</span>}
                            <span>{item?.name}</span>
                            <span className="text-[10px] text-slate-500">
                              ({item?.weight}w, {item?.value}v)
                            </span>
                          </span>
                        )}
                      </td>
                      {row.map((val, w) => {
                        const isCurrentCell = i === currentItemIndex && w === currentWeight;
                        const isExcludeDep =
                          activeDependencies?.excludeCell?.[0] === i && activeDependencies?.excludeCell?.[1] === w;
                        const isIncludeDep =
                          activeDependencies?.includeCell?.[0] === i && activeDependencies?.includeCell?.[1] === w;
                        const onWalk = walkSet.has(`${i}:${w}`);
                        let cellStyle = 'border-slate-800/60 bg-slate-900/40 text-slate-300';
                        if (isCurrentCell) {
                          cellStyle =
                            decision === 'include'
                              ? 'border-emerald-400 bg-emerald-500/25 font-bold text-emerald-100 ring-2 ring-emerald-500/50'
                              : decision === 'exclude'
                                ? 'border-cyan-400 bg-cyan-500/25 font-bold text-cyan-100 ring-2 ring-cyan-500/50'
                                : decision === 'skip-too-heavy'
                                  ? 'border-amber-400 bg-amber-500/25 font-bold text-amber-100 ring-2 ring-amber-500/50'
                                  : 'border-indigo-400 bg-indigo-500/25 font-bold text-indigo-100 ring-2 ring-indigo-500/50';
                        } else if (isIncludeDep) {
                          cellStyle = 'border-emerald-500 bg-emerald-500/20 font-bold text-emerald-200 ring-1 ring-emerald-500/40';
                        } else if (isExcludeDep) {
                          cellStyle = 'border-cyan-500 bg-cyan-500/20 font-bold text-cyan-200 ring-1 ring-cyan-500/40';
                        } else if (onWalk) {
                          cellStyle = 'border-violet-700 bg-violet-950/40 text-violet-200';
                        }
                        return (
                          <td key={w} className={`relative border-b border-slate-800 p-1.5 text-center transition-all ${cellStyle}`}>
                            <span>{val}</span>
                            {isIncludeDep && <span className="mt-0.5 block text-[8px] leading-none text-emerald-400">+incl</span>}
                            {isExcludeDep && !isIncludeDep && (
                              <span className="mt-0.5 block text-[8px] leading-none text-cyan-400">↑excl</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="text-cyan-300">Items</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {activeItem ? `row ${currentItemIndex}` : 'base row'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {items.map((item, idx) => {
                  const rowId = idx + 1;
                  const isInspecting = currentItemIndex === rowId;
                  const isSelected = chosenSet.has(rowId);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/20 font-bold text-emerald-200'
                          : isInspecting
                            ? 'border-cyan-500 bg-cyan-500/15 font-semibold text-cyan-200'
                            : 'border-slate-700/60 bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{isSelected ? '✓' : isInspecting ? '►' : '•'}</span>
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

            {(phase === 'backtrack' || phase === 'done') && (
              <div className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
                  <span>Recovered selection</span>
                  <span>
                    value {chosenValue} · weight {chosenWeight}/{capacity}
                  </span>
                </div>
                {chosenItems && chosenItems.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {[...chosenItems]
                      .sort((a, b) => a - b)
                      .map((id) => (
                        <span
                          key={id}
                          className="rounded-md border border-violet-400 bg-violet-500/25 px-2 py-0.5 font-mono text-[11px] font-bold text-violet-100"
                        >
                          {items[id - 1]?.name}
                        </span>
                      ))}
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-slate-500">no item selected yet</div>
                )}
                <div className="mt-1 font-mono text-[10px] text-slate-400">
                  remaining capacity <span className="font-bold text-violet-200">{remainingCapacity}</span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-xs">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-500" />
                  <span>↑excl: dp[i-1][w]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                  <span>+incl: val + dp[i-1][w-wt]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-violet-500" />
                  <span>walk cell (reconstruction)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-500" />
                  <span>too heavy at this capacity</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  },
};

