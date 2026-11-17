import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface SubsetSumState {
  nums: number[];
  target: number;
  /** table[i][j] is true iff some subset of nums[0..i-1] sums to exactly j. */
  table: boolean[][];
  currentRow: number;
  currentCol: number;
  phase: 'init' | 'base' | 'fill' | 'backtrack' | 'done';
  actionType: 'INIT' | 'BASE' | 'ROW' | 'INHERIT' | 'COMPARE' | 'DECIDE' | 'CHECK' | 'TAKE' | 'NONE';
  activeDependencies?: {
    excludeCell?: [number, number];
    includeCell?: [number, number];
  };
  candidate: {
    i: number;
    j: number;
    val: number;
    exclude: boolean;
    include: boolean;
    result: boolean;
  } | null;
  /** Cells visited by the reconstruction, bottom-right first. */
  walkPath: [number, number][];
  /** Values of the recovered subset, in the order the walk took them. */
  subset: number[];
  /** 1-based rows whose items were taken. */
  chosenRows: number[];
  remainingSum: number;
  isFeasible: boolean;
  stats: {
    cells: number;
    trueCells: number;
    falseCells: number;
    inherited: number;
    compared: number;
    backtrackSteps: number;
  };
}

const MAX_N = 6;
const MAX_TARGET = 20;
const MAX_VALUE = 99;

const DEFAULT_NUMS = [3, 4, 5, 2];

interface NormalisedInput {
  nums: number[];
  target: number;
  notes: string[];
}

function normalise(input: { nums: number[]; target: number } | undefined): NormalisedInput {
  const notes: string[] = [];
  const rawTarget =
    typeof input?.target === 'number' && Number.isFinite(input.target) ? input.target : 9;
  const target = Math.max(0, Math.min(MAX_TARGET, Math.round(rawTarget)));
  if (target !== Math.round(rawTarget)) {
    notes.push(`target clamped from ${Math.round(rawTarget)} to ${target} (visual limit ${MAX_TARGET})`);
  }

  const rawNums = Array.isArray(input?.nums) ? input.nums : DEFAULT_NUMS;
  const usable = rawNums.filter((value) => typeof value === 'number' && Number.isFinite(value));
  if (usable.length === 0 && rawNums.length > 0) {
    notes.push('no usable numbers in the input, so the default set is used');
    usable.push(...DEFAULT_NUMS);
  }
  if (usable.length < rawNums.length) {
    notes.push(`${rawNums.length - usable.length} non-numeric value(s) dropped`);
  }
  if (usable.length > MAX_N) {
    notes.push(`${usable.length} numbers truncated to ${MAX_N} for a readable table`);
  }

  const nums = usable.slice(0, MAX_N).map((value) => {
    const rounded = Math.max(0, Math.min(MAX_VALUE, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`value ${Math.round(value)} clamped to ${rounded} (0..${MAX_VALUE})`);
    }
    return rounded;
  });

  return { nums, target, notes };
}

export const subsetSumModule: AlgorithmModule<
  { nums: number[]; target: number },
  SubsetSumState
> = {
  id: 'subset-sum',
  title: 'Subset Sum Problem (Boolean DP Matrix O(N * Target))',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  relatedModules: [
    { id: 'knapsack-01', label: '0/1 Knapsack' },
    { id: 'unbounded-knapsack', label: 'Unbounded Knapsack' },
    { id: 'coin-change', label: 'Coin Change' },
  ],
  complexity: {
    timeBest: 'O(N * Target)',
    timeAverage: 'O(N * Target)',
    timeWorst: 'O(N * Target)',
    spaceAuxiliary: 'O(N * Target) boolean table, O(N) for the reconstruction walk',
    worstCaseCondition: 'Pseudo-polynomial runtime proportional to the target sum magnitude',
  },
  theory: {
    overview:
      'Given a set of non-negative integers nums and a target value S, decide whether some subset of nums sums to exactly S, and recover one such subset.',
    whyItWorks:
      'A subset of the first i items summing to j either ignores item i (dp[i-1][j]) or contains it (dp[i-1][j - nums[i-1]], which needs j >= nums[i-1]). The OR of those two cases covers every possibility exactly once.',
    invariant:
      'dp[i][j] is true iff some subset of nums[0..i-1] sums to exactly j; column 0 is all true because the empty subset sums to 0.',
    pitfalls: [
      'Column 0 must be true, not false: the empty subset reaches sum 0, and every chain of include-steps bottoms out there.',
      'The include branch reads row i-1 (not row i): reading row i would allow the same item twice — that is unbounded knapsack, not subset sum.',
      'If the target exceeds the total sum of the input, the answer is immediately false — the DP still proves it cell by cell.',
      'A true cell does not mean its item is used: dp[i][j] can be true purely via dp[i-1][j], so the walk must compare with the row above.',
    ],
    steps: [
      'Allocate the (N+1)×(Target+1) boolean table and set dp[i][0] = true for every row.',
      'For each item i and sum j: if the item alone exceeds j, inherit dp[i-1][j].',
      'Otherwise write dp[i][j] = dp[i-1][j] OR dp[i-1][j - nums[i-1]].',
      'The answer is dp[N][Target].',
      'Walk i = N → 1: when dp[i][j] is true but dp[i-1][j] is false, item i is required — take it and reduce j by its value.',
    ],
    watchOut: [
      'Several different subsets can reach the target; the walk returns the one this table encodes.',
      'A zero-valued item is legal but never changes reachability, so it never appears in the recovered subset.',
    ],
  },
  presets: [
    {
      id: 'standard-feasible',
      label: 'Standard Feasible: [3, 4, 5, 2], Target = 9',
      description: 'Subset [4, 5] or [3, 4, 2] forms 9; the walk recovers [5, 4]',
      data: { nums: [3, 4, 5, 2], target: 9 },
    },
    {
      id: 'partition-equal',
      label: 'Partition Equal: [1, 5, 11, 5], Target = 11',
      description: 'Half of sum 22 is 11; the walk recovers the single item [11]',
      data: { nums: [1, 5, 11, 5], target: 11 },
    },
    {
      id: 'infeasible-target',
      label: 'Infeasible Target: [3, 5, 7], Target = 9',
      description: 'No subset combination equals 9 — every cell of the last row stays FALSE',
      data: { nums: [3, 5, 7], target: 9 },
    },
    {
      id: 'empty-subset-target-zero',
      label: 'Target 0 (empty subset)',
      description: 'Target 0 is always reachable by taking nothing — the base column is the whole answer',
      data: { nums: [3, 4, 5], target: 0 },
    },
  ],
  defaultInput: { nums: DEFAULT_NUMS, target: 9 },
  codeSnippets: {
    pseudocode: `function isSubsetSum(nums, target):
    n = length(nums)
    dp = (n + 1) x (target + 1) matrix of false
    for i = 0 to n:
        dp[i][0] = true
    for i = 1 to n:
        for j = 1 to target:
            if nums[i - 1] > j:
                dp[i][j] = dp[i - 1][j]
            else:
                exclude = dp[i - 1][j]
                include = dp[i - 1][j - nums[i - 1]]
                dp[i][j] = exclude or include
    subset = []
    j = target
    for i = n down to 1:
        if dp[i][j] and not dp[i - 1][j]:
            subset.push(nums[i - 1])
            j = j - nums[i - 1]
    return dp[n][target], subset`,
    python: `def is_subset_sum(nums, target):
    n = len(nums)
    dp = [[False] * (target + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = True
    for i in range(1, n + 1):
        for j in range(1, target + 1):
            if nums[i - 1] > j:
                dp[i][j] = dp[i - 1][j]
            else:
                exclude = dp[i - 1][j]
                include = dp[i - 1][j - nums[i - 1]]
                dp[i][j] = exclude or include
    subset = []
    j = target
    for i in range(n, 0, -1):
        if dp[i][j] and not dp[i - 1][j]:
            subset.append(nums[i - 1])
            j -= nums[i - 1]
    return dp[n][target], subset`,
    typescript: `function isSubsetSum(nums: number[], target: number): [boolean, number[]] {
  const n = nums.length;
  const dp: boolean[][] = Array.from({ length: n + 1 }, () => Array(target + 1).fill(false));
  for (let i = 0; i <= n; i++) {
    dp[i][0] = true; }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= target; j++) {
      if (nums[i - 1] > j) {
        dp[i][j] = dp[i - 1][j];
      } else {
        const exclude = dp[i - 1][j];
        const include = dp[i - 1][j - nums[i - 1]];
        dp[i][j] = exclude || include; } } }
  const subset: number[] = [];
  let j = target;
  for (let i = n; i >= 1; i--) {
    if (dp[i][j] && !dp[i - 1][j]) {
      subset.push(nums[i - 1]);
      j -= nums[i - 1]; } }
  return [dp[n][target], subset]; }`,
    cpp: `pair<bool, vector<int>> isSubsetSum(vector<int>& nums, int target) {
    int n = nums.size();
    vector<vector<bool>> dp(n + 1, vector<bool>(target + 1, false));
    for (int i = 0; i <= n; i++) {
        dp[i][0] = true; }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= target; j++) {
            if (nums[i - 1] > j) {
                dp[i][j] = dp[i - 1][j];
            } else {
                bool exclude = dp[i - 1][j];
                bool include = dp[i - 1][j - nums[i - 1]];
                dp[i][j] = exclude || include; } } }
    vector<int> subset;
    int j = target;
    for (int i = n; i >= 1; i--) {
        if (dp[i][j] && !dp[i - 1][j]) {
            subset.push_back(nums[i - 1]);
            j -= nums[i - 1]; } }
    return {dp[n][target], subset}; }`,
    java: `public int[] isSubsetSum(int[] nums, int target) {
    int n = nums.length;
    boolean[][] dp = new boolean[n + 1][target + 1];
    for (int i = 0; i <= n; i++) {
        dp[i][0] = true; }
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= target; j++) {
            if (nums[i - 1] > j) {
                dp[i][j] = dp[i - 1][j];
            } else {
                boolean exclude = dp[i - 1][j];
                boolean include = dp[i - 1][j - nums[i - 1]];
                dp[i][j] = exclude || include; } } }
    int[] subset = new int[n]; int count = 0;
    int j = target;
    for (int i = n; i >= 1; i--) {
        if (dp[i][j] && !dp[i - 1][j]) {
            subset[count++] = nums[i - 1];
            j -= nums[i - 1]; } }
    return java.util.Arrays.copyOf(subset, count); }`,
  },

  generateTimeline: (input: { nums: number[]; target: number }): ExecutionFrame<SubsetSumState>[] => {
    const { nums, target, notes } = normalise(input);
    const n = nums.length;

    const dp: boolean[][] = Array.from({ length: n + 1 }, () => Array(target + 1).fill(false));
    for (let i = 0; i <= n; i++) dp[i][0] = true;

    const frames: ExecutionFrame<SubsetSumState>[] = [];
    const walkPath: [number, number][] = [];
    const subset: number[] = [];
    const chosenRows: number[] = [];

    let phase: SubsetSumState['phase'] = 'init';
    let currentRow = 0;
    let currentCol = 0;
    let actionType: SubsetSumState['actionType'] = 'INIT';
    let activeDependencies: SubsetSumState['activeDependencies'] = undefined;
    let candidate: SubsetSumState['candidate'] = null;
    let remainingSum = target;

    const stats = { cells: 0, trueCells: 0, falseCells: 0, inherited: 0, compared: 0, backtrackSteps: 0 };

    let firstTrueMilestone = false;
    let firstTakeMilestone = false;
    let choiceCheckpointAdded = false;
    let walkCheckpointAdded = false;

    const snapshot = (): SubsetSumState => ({
      nums: [...nums],
      target,
      table: dp.map((row) => [...row]),
      currentRow,
      currentCol,
      phase,
      actionType,
      activeDependencies: activeDependencies
        ? {
            excludeCell: activeDependencies.excludeCell
              ? ([...activeDependencies.excludeCell] as [number, number])
              : undefined,
            includeCell: activeDependencies.includeCell
              ? ([...activeDependencies.includeCell] as [number, number])
              : undefined,
          }
        : undefined,
      candidate: candidate ? { ...candidate } : null,
      walkPath: walkPath.map(([i, j]) => [i, j] as [number, number]),
      subset: [...subset],
      chosenRows: [...chosenRows],
      remainingSum,
      isFeasible: dp[n][target],
      stats: { ...stats },
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<SubsetSumState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<SubsetSumState>['soundCue'];
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
            name: phase === 'backtrack' || phase === 'done' ? 'recover(dp, nums, target)' : 'isSubsetSum(nums, target)',
            params:
              phase === 'fill'
                ? { i: currentRow, j: currentCol }
                : phase === 'backtrack'
                  ? { i: currentRow, j: remainingSum }
                  : { n, target },
            line: opts.codeLine,
            isCurrent: true,
          },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: stats.cells + stats.backtrackSteps, swaps: 0, accesses: stats.cells * 2, lookups: stats.backtrackSteps },
        invariantStatus: {
          label:
            phase === 'init' || phase === 'base'
              ? 'dp[i][0] = true: the empty subset always reaches sum 0'
              : phase === 'fill'
                ? `dp[${currentRow}][${currentCol}] = ${dp[currentRow]?.[currentCol] ? 'TRUE' : 'FALSE'} = "some subset of the first ${currentRow} item(s) sums to ${currentCol}"`
                : phase === 'backtrack'
                  ? `Walk at row ${currentRow}, remaining sum ${remainingSum}: ${subset.length} item(s) taken`
                  : `Answer: dp[${n}][${target}] = ${dp[n][target] ? 'TRUE' : 'FALSE'}`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    pushFrame({
      codeLine: 3,
      action: 'INIT',
      explanation:
        `Allocate the (${n + 1})×(${target + 1}) boolean table for ${n} number(s) and target ${target}; every cell starts FALSE until a subset proves it reachable.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      variables: {
        n,
        target,
        cells: (n + 1) * (target + 1),
        totalSum: nums.reduce((sum, value) => sum + value, 0),
      },
      soundCue: 'start',
      pedagogy: {
        what: `The table has ${n + 1} row(s) and ${target + 1} column(s); one boolean question per cell: "can the first i item(s) sum to exactly j?"`,
        why: 'Reachability composes: a sum is reachable either with or without the newest item, and the OR of both cases is exact.',
        whatNext: 'Fill column 0 first: sum 0 is reachable by taking nothing.',
      },
    });

    // ─── base column ───
    phase = 'base';
    for (let i = 0; i <= n; i++) {
      currentRow = i;
      currentCol = 0;
      actionType = 'BASE';
      pushFrame({
        codeLine: 5,
        action: 'BASE_ROW',
        explanation: `dp[${i}][0] = TRUE: with the first ${i} item(s), the empty subset sums to 0 — the base case every include-chain will bottom out in.`,
        variables: { i, j: 0, value: 'TRUE', reason: 'empty subset' },
        milestone: i === 0 ? 'Base Case: sum 0 always reachable' : undefined,
        soundCue: 'step',
        pedagogy: {
          what: `Column 0 becomes TRUE for row ${i}.`,
          why: 'Taking no items yields sum 0, so every row must start reachable at j = 0; the reconstruction relies on this anchor.',
          whatNext: i < n ? `Set dp[${i + 1}][0] = TRUE next.` : 'Column 0 is complete; start filling row 1.',
        },
      });
    }

    // ─── fill ───
    phase = 'fill';
    for (let i = 1; i <= n; i++) {
      const val = nums[i - 1];
      currentRow = i;
      currentCol = 0;
      activeDependencies = undefined;
      candidate = null;
      actionType = 'ROW';

      pushFrame({
        codeLine: 6,
        action: 'ROW_START',
        explanation: `Row ${i} asks: with item ${i} (value ${val}) available, which sums 1..${target} become reachable? The row only reads row ${i - 1}, so every previous answer stays intact.`,
        variables: { i, itemValue: val, sums: target },
        soundCue: 'step',
        pedagogy: {
          what: `Item ${i} (value ${val}) joins the pool of usable items.`,
          why: 'dp[i][j] is defined over the first i items, so adding one item means extending the previous row with include-possibilities.',
          whatNext: `Compare ${val} with sum 1.`,
        },
      });

      for (let j = 1; j <= target; j++) {
        currentRow = i;
        currentCol = j;
        stats.cells++;

        if (val > j) {
          stats.inherited++;
          const inherited = dp[i - 1][j];
          dp[i][j] = inherited;
          if (inherited) stats.trueCells++;
          else stats.falseCells++;
          activeDependencies = { excludeCell: [i - 1, j] };
          actionType = 'INHERIT';
          candidate = { i, j, val, exclude: inherited, include: false, result: inherited };

          pushFrame({
            codeLine: 9,
            action: 'CELL_TOO_BIG',
            explanation: `Item ${i} (value ${val}) alone exceeds sum ${j}, so it cannot be in any subset reaching ${j}: dp[${i}][${j}] inherits dp[${i - 1}][${j}] = ${inherited ? 'TRUE' : 'FALSE'}.`,
            conditionEval: {
              expr: `nums[${i - 1}] > ${j}`,
              condition: `${val} > ${j}`,
              result: true,
            },
            variables: {
              i,
              j,
              itemValue: val,
              inheritedFrom: `dp[${i - 1}][${j}]`,
              result: inherited ? 'TRUE' : 'FALSE',
              decision: 'inherit (item too big)',
            },
            soundCue: 'discard',
            pedagogy: {
              what: `The item is larger than the sum, so there is only one option: copy the row above.`,
              why: 'An item bigger than j cannot be part of a subset summing to j, so reachability is unchanged from the previous items.',
              whatNext: j < target ? `Move to sum ${j + 1}; the item may fit there.` : `Row ${i} is done; continue with the next item.`,
            },
          });
          continue;
        }

        const excludeVal = dp[i - 1][j];
        const includeVal = dp[i - 1][j - val];
        const result = excludeVal || includeVal;
        stats.compared++;
        activeDependencies = {
          excludeCell: [i - 1, j],
          includeCell: [i - 1, j - val],
        };
        actionType = 'COMPARE';
        candidate = { i, j, val, exclude: excludeVal, include: includeVal, result };

        pushFrame({
          codeLine: 11,
          action: 'CELL_COMPARE',
          explanation: `Sum ${j} with item ${i} (value ${val}): without it dp[${i - 1}][${j}] = ${excludeVal ? 'TRUE' : 'FALSE'}; with it, the remaining ${j} − ${val} = ${j - val} must be reachable: dp[${i - 1}][${j - val}] = ${includeVal ? 'TRUE' : 'FALSE'}.`,
          conditionEval: {
            expr: `nums[${i - 1}] > ${j}`,
            condition: `${val} > ${j}`,
            result: false,
          },
          variables: {
            i,
            j,
            itemValue: val,
            exclude: excludeVal ? 'TRUE' : 'FALSE',
            include: includeVal ? 'TRUE' : 'FALSE',
            remainingIfTaken: j - val,
            'dp[i][j]': result ? 'TRUE' : 'FALSE',
          },
          soundCue: 'compare',
          pedagogy: {
            what: `Both branches are known: exclude = ${excludeVal ? 'TRUE' : 'FALSE'}, include = ${includeVal ? 'TRUE' : 'FALSE'}.`,
            why: 'These are the only two ways a subset of the first i items can treat item i — leave it out, or take it and reach for the leftover sum.',
            whatNext: `Write the OR of the two branches into dp[${i}][${j}].`,
          },
        });

        dp[i][j] = result;
        if (result) stats.trueCells++;
        else stats.falseCells++;
        actionType = 'DECIDE';
        candidate = { i, j, val, exclude: excludeVal, include: includeVal, result };

        pushFrame({
          codeLine: 13,
          action: 'CELL_DECIDE',
          explanation: result
            ? `dp[${i}][${j}] = TRUE: sum ${j} is reachable${includeVal && !excludeVal ? ` only by taking item ${i} (value ${val})` : excludeVal && !includeVal ? ' without item i — the exclude branch wins' : ' via both branches'}${!excludeVal && !includeVal ? '' : ''}.`
            : `dp[${i}][${j}] = FALSE: neither keeping the old reachability nor taking item ${i} makes sum ${j} reachable.`,
          conditionEval: {
            expr: `dp[${i - 1}][${j}] || dp[${i - 1}][${j - val}]`,
            condition: `${excludeVal ? 'TRUE' : 'FALSE'} || ${includeVal ? 'TRUE' : 'FALSE'}`,
            result,
            formatted: `dp[${i}][${j}] = ${result ? 'TRUE' : 'FALSE'}`,
          },
          variables: {
            i,
            j,
            itemValue: val,
            exclude: excludeVal ? 'TRUE' : 'FALSE',
            include: includeVal ? 'TRUE' : 'FALSE',
            result: result ? 'TRUE' : 'FALSE',
            cellsFilled: stats.cells,
          },
          milestone: result && !firstTrueMilestone ? 'First Reachable Sum' : undefined,
          soundCue: result ? 'success' : 'step',
          checkpoint:
            !choiceCheckpointAdded && excludeVal !== includeVal
              ? {
                  id: 'subset-sum-or-choice',
                  question: `dp[${i}][${j}] for item ${i} (value ${val}) at sum ${j}: the exclude branch is ${excludeVal ? 'TRUE' : 'FALSE'} and the include branch is ${includeVal ? 'TRUE' : 'FALSE'}. What is dp[${i}][${j}]?`,
                  options: [
                    'TRUE — the OR of the two branches, so at least one holds',
                    'FALSE — neither branch is TRUE',
                    'TRUE — but only when the include branch is TRUE',
                  ],
                  correctIndex: result ? 0 : 1,
                  explanation: `The recurrence is exclude OR include, so dp[${i}][${j}] = ${result ? 'TRUE' : 'FALSE'}${result ? (includeVal && !excludeVal ? ` and the only proof is taking item ${i}` : '') : ''}.`,
                  hint: 'A disjunction is true as soon as one side is true.',
                }
              : undefined,
          pedagogy: {
            what: result
              ? `Sum ${j} is now certified reachable with the first ${i} item(s).`
              : `Sum ${j} stays unreachable even with item ${i} available.`,
            why: result
              ? `At least one branch is TRUE${includeVal ? `: taking item ${i} leaves sum ${j - val}, which was reachable` : ' the sum was already reachable without this item'} — the OR copies that proof.`
              : 'Both branches are FALSE: the sum was unreachable before, and taking the item would require an unreachable leftover sum.',
            whatNext:
              j < target
                ? `Move to sum ${j + 1} and repeat the comparison.`
                : i < n
                  ? `Row ${i} is complete; start row ${i + 1} (item value ${nums[i]}).`
                  : `Table complete: dp[${n}][${target}] = ${dp[n][target] ? 'TRUE' : 'FALSE'}.`,
          },
        });
        if (result && !firstTrueMilestone) firstTrueMilestone = true;
        if (excludeVal !== includeVal) choiceCheckpointAdded = true;
      }
    }

    currentRow = -1;
    currentCol = -1;
    activeDependencies = undefined;
    candidate = null;
    actionType = 'NONE';

    pushFrame({
      codeLine: 14,
      action: 'TABLE_COMPLETE',
      explanation: `Table filled: dp[${n}][${target}] = ${dp[n][target] ? 'TRUE' : 'FALSE'} (${stats.trueCells} TRUE cell(s), ${stats.falseCells} FALSE, ${stats.inherited} inherited). ${dp[n][target] ? 'A subset exists — walk back to recover it.' : 'No subset reaches the target, so there is nothing to recover.'}`,
      variables: {
        feasible: dp[n][target],
        trueCells: stats.trueCells,
        falseCells: stats.falseCells,
        inherited: stats.inherited,
        cells: stats.cells,
      },
      milestone: 'Table Complete',
      soundCue: 'complete',
      pedagogy: {
        what: `All ${stats.cells} inner cells are decided; the bottom-right cell holds the answer.`,
        why: 'Each cell used only the row above, so every subset possibility was covered exactly once without enumeration.',
        whatNext: dp[n][target]
          ? `Start at dp[${n}][${target}] and compare upward to find which items are required.`
          : 'Finish with the negative answer — no walk is needed.',
      },
    });

    if (!dp[n][target]) {
      phase = 'done';
      pushFrame({
        codeLine: 20,
        action: 'NO_SOLUTION',
        explanation: `dp[${n}][${target}] is FALSE: no subset of [${nums.join(', ')}] sums to ${target}. The possible sums are exactly the TRUE cells of row ${n}.`,
        variables: {
          feasible: false,
          target,
          reachableSums: dp[n]
            .map((reachable, sum) => (reachable ? sum : -1))
            .filter((sum) => sum >= 0),
        },
        milestone: 'No Subset Exists',
        soundCue: 'finish',
        pedagogy: {
          what: `The target ${target} is unreachable with these numbers.`,
          why: 'The last row is the definitive reachability set: a FALSE there means every subset was accounted for.',
          whatNext: 'Try a preset with a feasible target, or change the input to see the walk.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    // ─── reconstruction ───
    phase = 'backtrack';
    let jCursor = target;
    remainingSum = jCursor;
    currentRow = n;
    currentCol = jCursor;
    actionType = 'CHECK';
    walkPath.push([n, jCursor]);

    pushFrame({
      codeLine: 15,
      action: 'BT_START',
      explanation: `Walk back from dp[${n}][${target}] = TRUE with remaining sum ${target} and an empty subset: an item is required exactly when its row is TRUE but the row above is FALSE.`,
      variables: { i: n, j: jCursor, subset: '' },
      soundCue: 'start',
      pedagogy: {
        what: `The reconstruction starts at the bottom-right cell, which is TRUE by assumption.`,
        why: 'The table stores reachability only; comparing each cell with the row above reveals whether the newest item is necessary for that proof.',
        whatNext: `Compare dp[${n}][${jCursor}] with dp[${n - 1}][${jCursor}].`,
      },
    });

    for (let i = n; i >= 1 && jCursor > 0; i--) {
      const val = nums[i - 1];
      const taken = dp[i][jCursor] && !dp[i - 1][jCursor];
      stats.backtrackSteps++;
      currentRow = i;
      currentCol = jCursor;
      remainingSum = jCursor;
      activeDependencies = { excludeCell: [i - 1, jCursor] };
      actionType = 'CHECK';
      candidate = { i, j: jCursor, val, exclude: dp[i - 1][jCursor], include: dp[i][jCursor], result: dp[i][jCursor] };

      pushFrame({
        codeLine: 17,
        action: 'BT_CHECK',
        explanation: taken
          ? `dp[${i}][${jCursor}] is TRUE but dp[${i - 1}][${jCursor}] is FALSE: every proof of sum ${jCursor} uses item ${i} (value ${val}), so it is required.`
          : `dp[${i}][${jCursor}] = ${dp[i][jCursor] ? 'TRUE' : 'FALSE'} equals the row above (dp[${i - 1}][${jCursor}] = ${dp[i - 1][jCursor] ? 'TRUE' : 'FALSE'}), so item ${i} (value ${val}) is not needed for this subset.`,
        conditionEval: {
          expr: `dp[${i}][${jCursor}] && !dp[${i - 1}][${jCursor}]`,
          condition: `${dp[i][jCursor] ? 'TRUE' : 'FALSE'} && !${dp[i - 1][jCursor] ? 'TRUE' : 'FALSE'}`,
          result: taken,
        },
        variables: {
          i,
          j: jCursor,
          itemValue: val,
          'dp[i][j]': dp[i][jCursor] ? 'TRUE' : 'FALSE',
          'dp[i-1][j]': dp[i - 1][jCursor] ? 'TRUE' : 'FALSE',
          taken,
          subset: subset.join(', ') || '(empty)',
        },
        soundCue: taken ? 'select' : 'discard',
        checkpoint:
          !walkCheckpointAdded
            ? {
                id: 'subset-sum-backtrack-first-take',
                question: `At row ${i}, sum ${jCursor}: dp[${i}][${jCursor}] = ${dp[i][jCursor] ? 'TRUE' : 'FALSE'} and dp[${i - 1}][${jCursor}] = ${dp[i - 1][jCursor] ? 'TRUE' : 'FALSE'}. What does the reconstruction conclude?`,
                options: [
                  `Item ${i} (value ${val}) is required — take it and reduce the sum`,
                  `Item ${i} is not needed — keep the same sum and move up`,
                  'The table is inconsistent and must be rebuilt',
                ],
                correctIndex: taken ? 0 : 1,
                explanation: taken
                  ? `Only the include branch can make a cell TRUE while the cell above is FALSE, so item ${i} is taken and the remaining sum becomes ${jCursor} − ${val} = ${jCursor - val}.`
                  : 'The row above already proves the sum, so the walk skips this item and keeps the same remaining sum.',
                hint: 'Only the include branch can make a cell differ from the row above it.',
              }
            : undefined,
        pedagogy: {
          what: taken
            ? `Item ${i} (value ${val}) is part of this subset.`
            : `Item ${i} (value ${val}) is skipped.`,
          why: 'dp[i][j] is built from exclude OR include; when exclude is FALSE the TRUE can only come from taking the item, otherwise the proof already existed above.',
          whatNext: taken
            ? `Record value ${val}, reduce the sum to ${jCursor - val}, and continue from row ${i - 1}.`
            : `Keep sum ${jCursor} and continue from row ${i - 1}.`,
        },
      });
      if (!walkCheckpointAdded) walkCheckpointAdded = true;

      if (taken) {
        subset.push(val);
        chosenRows.push(i);
        remainingSum = jCursor - val;
        jCursor = remainingSum;
        actionType = 'TAKE';
        walkPath.push([i - 1, jCursor]);

        pushFrame({
          codeLine: 18,
          action: 'BT_TAKE',
          explanation: `Take item ${i} (value ${val}): subset becomes [${subset.join(', ')}] and the remaining sum drops to ${jCursor}.${
            jCursor === 0 ? ' Sum 0 is the base case — the walk can stop.' : ''
          }`,
          conditionEval: {
            expr: `j = j - nums[i - 1]`,
            condition: `${jCursor + val} - ${val}`,
            result: jCursor,
            formatted: `remaining sum = ${jCursor}`,
          },
          variables: {
            i,
            itemValue: val,
            subset: subset.join(', '),
            subsetSum: subset.reduce((sum, v) => sum + v, 0),
            remainingSum: jCursor,
          },
          milestone: !firstTakeMilestone ? 'First Item Taken' : undefined,
          soundCue: 'insert',
          pedagogy: {
            what: `Item ${i} joins the subset and consumes ${val} of the remaining sum.`,
            why: 'The include branch proved dp[i][j] via dp[i-1][j - value], so the walk must continue at that exact cell.',
            whatNext: jCursor === 0 ? 'The remaining sum is 0 — the subset is complete.' : `Continue with row ${i - 1} at sum ${jCursor}.`,
          },
        });
        if (!firstTakeMilestone) firstTakeMilestone = true;
      } else {
        walkPath.push([i - 1, jCursor]);
      }
    }

    phase = 'done';
    currentRow = -1;
    currentCol = -1;
    activeDependencies = undefined;
    candidate = null;
    const subsetSum = subset.reduce((sum, value) => sum + value, 0);

    pushFrame({
      codeLine: 20,
      action: 'DONE',
      explanation: `Subset found: [${subset.join(' + ')}] = ${subsetSum} (target ${target}). The recovered values match the TRUE at dp[${n}][${target}].`,
      conditionEval: {
        expr: 'sum of subset == target',
        condition: `${subsetSum} == ${target}`,
        result: subsetSum === target,
      },
      variables: {
        feasible: true,
        subset: subset.join(', '),
        subsetSum,
        target,
        itemsTaken: chosenRows.length,
      },
      milestone: 'Subset Found',
      soundCue: 'finish',
      pedagogy: {
        what: `The subset [${subset.join(', ')}] sums to exactly ${target}.`,
        why: 'Each taken item was justified by a TRUE cell whose row above was FALSE, so the total is forced to equal the target.',
        whatNext: 'Compare the presets: a partition target recovers one item, an infeasible target stops before the walk.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<SubsetSumState>) => {
    const {
      nums,
      target,
      table,
      currentRow,
      currentCol,
      phase,
      actionType,
      activeDependencies,
      candidate,
      walkPath,
      subset,
      chosenRows,
      remainingSum,
      isFeasible,
      stats,
    } = frame.state;

    const phaseLabel =
      phase === 'init' || phase === 'base'
        ? 'base column'
        : phase === 'fill'
          ? 'filling table'
          : phase === 'backtrack'
            ? 'reconstruction'
            : 'done';
    const walkSet = new Set(walkPath.map(([i, j]) => `${i}:${j}`));
    const chosenSet = new Set(chosenRows);

    const formula = candidate
      ? actionType === 'INHERIT'
        ? `dp[${candidate.i}][${candidate.j}] = dp[${candidate.i - 1}][${candidate.j}] = ${candidate.result ? 'TRUE' : 'FALSE'} (value ${candidate.val} > sum ${candidate.j})`
        : `dp[${candidate.i}][${candidate.j}] = dp[${candidate.i - 1}][${candidate.j}] (${candidate.exclude ? 'T' : 'F'}) OR dp[${candidate.i - 1}][${candidate.j - candidate.val}] (${candidate.include ? 'T' : 'F'}) = ${candidate.result ? 'TRUE' : 'FALSE'}`
      : phase === 'backtrack' || phase === 'done'
        ? 'walk: a TRUE cell whose row above is FALSE forces its item into the subset'
        : 'dp[i][j] = dp[i-1][j] OR dp[i-1][j - nums[i-1]]';

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
              {phaseLabel}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300">
              target <span className="font-bold text-amber-300">{target}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              cells <span className="font-bold text-cyan-300">{stats.cells}</span>/{nums.length * target}
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              TRUE <span className="font-bold text-emerald-300">{stats.trueCells}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              FALSE <span className="font-bold text-slate-400">{stats.falseCells}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              inherit <span className="font-bold text-amber-300">{stats.inherited}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span
              className={`rounded-md border px-2 py-0.5 ${
                isFeasible
                  ? 'border-emerald-800 bg-emerald-950/40 text-emerald-200'
                  : 'border-slate-800 bg-slate-900/70 text-slate-400'
              }`}
            >
              dp[{nums.length}][{target}] <span className="font-bold">{isFeasible ? 'TRUE' : 'FALSE'}</span>
            </span>
            <span className="rounded-md border border-violet-800 bg-violet-950/40 px-2 py-0.5 text-violet-200">
              subset <span className="font-bold">{subset.length}</span>
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
                    item / sum
                  </th>
                  {Array.from({ length: target + 1 }).map((_, j) => (
                    <th
                      key={j}
                      className={`border-b border-slate-800 p-1.5 text-center transition-colors ${
                        j === currentCol
                          ? 'bg-cyan-500/20 font-bold text-cyan-300'
                          : 'font-medium text-slate-400'
                      }`}
                    >
                      {j}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => {
                  const isCurrentRow = i === currentRow;
                  return (
                    <tr key={i} className={isCurrentRow ? 'bg-slate-800/40' : ''}>
                      <td className="whitespace-nowrap border-b border-r border-slate-800 p-1.5 text-[11px] text-slate-300">
                        {i === 0 ? (
                          <span className="text-slate-500">0 (empty)</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {chosenSet.has(i) && <span className="text-emerald-400">✓</span>}
                            <span>
                              #{i} <span className="text-slate-500">({nums[i - 1]})</span>
                            </span>
                          </span>
                        )}
                      </td>
                      {row.map((cell, j) => {
                        const isCurrentCell = i === currentRow && j === currentCol;
                        const isExcludeDep =
                          activeDependencies?.excludeCell?.[0] === i && activeDependencies?.excludeCell?.[1] === j;
                        const isIncludeDep =
                          activeDependencies?.includeCell?.[0] === i && activeDependencies?.includeCell?.[1] === j;
                        const onWalk = walkSet.has(`${i}:${j}`);
                        let cellStyle = 'border-slate-800/60 bg-slate-900/40 text-slate-400';
                        if (cell && !isCurrentCell && !isExcludeDep && !isIncludeDep && !onWalk) {
                          cellStyle = 'border-slate-800/60 bg-slate-900/40 text-emerald-300';
                        }
                        if (isCurrentCell) {
                          cellStyle =
                            actionType === 'INHERIT'
                              ? 'border-amber-400 bg-amber-500/25 font-bold text-amber-100 ring-2 ring-amber-500/50'
                              : cell
                                ? 'border-emerald-400 bg-emerald-500/25 font-bold text-emerald-100 ring-2 ring-emerald-500/50'
                                : 'border-rose-400 bg-rose-500/20 font-bold text-rose-100 ring-2 ring-rose-500/50';
                        } else if (isIncludeDep) {
                          cellStyle = 'border-emerald-500 bg-emerald-500/20 font-bold text-emerald-200 ring-1 ring-emerald-500/40';
                        } else if (isExcludeDep) {
                          cellStyle = 'border-cyan-500 bg-cyan-500/20 font-bold text-cyan-200 ring-1 ring-cyan-500/40';
                        } else if (onWalk) {
                          cellStyle = 'border-violet-700 bg-violet-950/40 text-violet-200';
                        }
                        return (
                          <td key={j} className={`relative border-b border-slate-800 p-1.5 text-center transition-all ${cellStyle}`}>
                            <span>{cell ? 'T' : 'F'}</span>
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
                <span className="text-cyan-300">Numbers</span>
                <span className="font-mono text-[10px] text-slate-400">
                  {currentRow > 0 ? `row ${currentRow}` : 'base'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {nums.map((value, idx) => {
                  const rowId = idx + 1;
                  const isInspecting = currentRow === rowId;
                  const isTaken = chosenSet.has(rowId);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-all ${
                        isTaken
                          ? 'border-emerald-500 bg-emerald-500/20 font-bold text-emerald-200'
                          : isInspecting
                            ? 'border-cyan-500 bg-cyan-500/15 font-semibold text-cyan-200'
                            : 'border-slate-700/60 bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{isTaken ? '✓' : isInspecting ? '►' : '•'}</span>
                        <span>
                          #{rowId} <span className="text-slate-400">val {value}</span>
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500">row {rowId}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(phase === 'backtrack' || phase === 'done') && (
              <div className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-violet-300">
                  <span>Recovered subset</span>
                  <span>
                    sum {subset.reduce((sum, value) => sum + value, 0)}/{target}
                  </span>
                </div>
                {subset.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] font-bold text-violet-100">
                    {subset.map((value, pos) => (
                      <span key={pos} className="flex items-center gap-1">
                        {pos > 0 && <span className="text-violet-500">+</span>}
                        <span className="rounded-md border border-violet-400 bg-violet-500/25 px-1.5 py-0.5">{value}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-slate-500">no item taken yet</div>
                )}
                <div className="mt-1 font-mono text-[10px] text-slate-400">
                  remaining sum <span className="font-bold text-violet-200">{remainingSum}</span>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-cyan-500" />
                  <span>↑excl: dp[i-1][j] (without item)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                  <span>+incl: dp[i-1][j-value] (with item)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-500" />
                  <span>inherited (item too big)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-violet-500" />
                  <span>walk cell (reconstruction)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
