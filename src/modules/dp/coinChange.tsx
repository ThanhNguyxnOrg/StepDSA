import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface CoinChangeInput {
  coins: number[];
  amount: number;
}

export interface CoinChangeState {
  coins: number[];
  amount: number;
  currentAmount: number;
  currentCoin: number;
  dpTable: number[]; // INF sentinel for unreachable
  transitionFrom?: number;
  optimalCoins: number[];
  /** Coin chosen for each amount; -1 when the amount is unreachable. */
  parentCoin: number[];
  /** Amounts visited while following parent pointers backwards from amount to 0. */
  reconstructPath?: number[];
  phase: 'dp' | 'reconstruct' | 'done';
}

export const coinChangeModule: AlgorithmModule<CoinChangeInput, CoinChangeState> = {
  id: 'coin-change',
  title: 'Coin Change (Fewest Coins DP)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(A * C)',
    timeAverage: 'O(A * C)',
    timeWorst: 'O(A * C)',
    spaceAuxiliary: 'O(A)',
    worstCaseCondition: 'All subproblems from 1 to A are evaluated across all C denominations',
  },
  theory: {
    overview:
      'The Coin Change Problem asks for the minimum number of coins needed to make up a given amount A using specified coin denominations. Since greedy choices fail for arbitrary denominations (e.g. coins [1, 3, 4] for amount 6: greedy gives 4+1+1=3 coins, optimal is 3+3=2 coins), Dynamic Programming guarantees the global optimum.',
    whyItWorks:
      'Optimal Substructure: The fewest coins to make amount a is 1 + min(dp[a - c]) across all valid coin values c <= a. Storing the coin that achieved the minimum in parent[a] lets us rebuild the actual solution after the table is filled.',
    invariant:
      'At step a, dp[a] holds the mathematically proven minimum coin count required to form amount a, or ∞ if unattainable. parent[a] records the last coin of one optimal solution for amount a.',
    pitfalls: [
      'Assuming greedy choice works for non-canonical coin systems.',
      'Integer overflow when using large dummy values instead of proper infinity representations.',
      'Reconstructing the coin list without storing parent pointers, which only recovers the count, not the coins used.',
    ],
  },
  presets: [
    {
      id: 'greedy-failure',
      label: 'Greedy Trap [1, 3, 4] for 6',
      description: 'Greedy picks 4+1+1 (3 coins); DP finds 3+3 (2 coins)',
      data: { coins: [1, 3, 4], amount: 6 },
    },
    {
      id: 'standard-us',
      label: 'US Denominations [1, 5, 10, 25]',
      description: 'Amount 30',
      data: { coins: [1, 5, 10, 25], amount: 30 },
    },
    {
      id: 'unreachable',
      label: 'Unreachable Target',
      description: 'Coins [2, 4] for amount 7 (impossible)',
      data: { coins: [2, 4], amount: 7 },
    },
  ],
  defaultInput: { coins: [1, 3, 4], amount: 6 },
  codeSnippets: {
    python: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    parent = [-1] * (amount + 1)
    dp[0] = 0

    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0 and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
                parent[a] = c




    if dp[amount] == float('inf'):
        return -1, []
    used = []
    a = amount
    while a > 0:
        used.append(parent[a])
        a -= parent[a]


    return dp[amount], used
`,
    typescript: `function coinChange(coins: number[], amount: number): [number, number[]] {
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  const parent: number[] = new Array(amount + 1).fill(-1);
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (a - c >= 0 && dp[a - c] + 1 < dp[a]) {
        dp[a] = dp[a - c] + 1;
        parent[a] = c;
      }
    }
  }

  if (dp[amount] === Infinity) return [-1, []];

  const used: number[] = [];
  let a = amount;
  while (a > 0) {
    used.push(parent[a]);
    a -= parent[a];
  }

  return [dp[amount], used];
}`,
    cpp: `pair<int, vector<int>> coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    vector<int> parent(amount + 1, -1);
    dp[0] = 0;

    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (a - c >= 0 && dp[a - c] + 1 < dp[a]) {
                dp[a] = dp[a - c] + 1;
                parent[a] = c;
            }
        }
    }

    if (dp[amount] > amount) return {-1, {}};

    vector<int> used;
    int a = amount;
    while (a > 0) {
        used.push_back(parent[a]);
        a -= parent[a];
    }

    return {dp[amount], used};
}`,
    java: `public int[][] coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    int[] parent = new int[amount + 1];
    Arrays.fill(dp, amount + 1); Arrays.fill(parent, -1); dp[0] = 0;

    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (a - c >= 0 && dp[a - c] + 1 < dp[a]) {
                dp[a] = dp[a - c] + 1;
                parent[a] = c;
            }
        }
    }

    if (dp[amount] > amount) return new int[][]{{-1}, {}};

    int[] used = new int[amount];
    int a = amount; int count = 0;
    while (a > 0) {
        used[count++] = parent[a];
        a -= parent[a];
    }

    return new int[][]{{dp[amount]}, Arrays.copyOf(used, count)};
}`,
    pseudocode: `function coinChange(coins, amount):
    dp = array of size amount + 1 filled with INF
    parent = array of size amount + 1 filled with -1
    dp[0] = 0

    for a from 1 to amount:
        for c in coins:
            if a >= c and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
                parent[a] = c




    if dp[amount] == INF:
        return -1, []
    used = []
    a = amount
    while a > 0:
        used.append(parent[a])
        a = a - parent[a]


    return dp[amount], used
`,
  },

  generateTimeline: (input: CoinChangeInput): ExecutionFrame<CoinChangeState>[] => {
    const frames: ExecutionFrame<CoinChangeState>[] = [];
    const { coins, amount } = input;
    const INF = 999;
    const dp = new Array(amount + 1).fill(INF);
    const parentCoin = new Array(amount + 1).fill(-1);

    const callStackAt = (line: number, extra: Record<string, any> = {}) => [
      {
        name: 'coinChange',
        params: { amount, coins: coins.join(','), ...extra },
        line,
        isCurrent: true,
      },
    ];

    const push = (
      codeLine: number,
      explanation: string,
      state: Omit<CoinChangeState, 'coins' | 'amount'>,
      options: {
        milestone?: string;
        soundCue?: ExecutionFrame['soundCue'];
        variables?: Record<string, any>;
        conditionEval?: { expr: string; result: boolean };
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
      } = {}
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        explanation,
        isMilestone: !!options.milestone,
        milestoneTitle: options.milestone,
        soundCue: options.soundCue ?? { type: 'step' },
        variables: options.variables,
        conditionEval: options.conditionEval,
        callStack: callStackAt(codeLine),
        pedagogy: options.pedagogy,
        checkpoint: options.checkpoint,
        state: {
          coins,
          amount,
          ...state,
        },
      });
    };

    const dpSnapshot = () => [...dp];
    const parentSnapshot = () => [...parentCoin];
    const fmt = (value: number) => (value >= INF ? '∞' : String(value));

    // --- Initialization -------------------------------------------------
    push(
      2,
      `Allocated dp[0..${amount}] with ∞ and parent[0..${amount}] with -1.`,
      {
        currentAmount: 0,
        currentCoin: 0,
        dpTable: dpSnapshot(),
        parentCoin: parentSnapshot(),
        optimalCoins: [],
        phase: 'dp',
      },
      {
        variables: { amount, coins: coins.join(', '), INF: '∞' },
        pedagogy: {
          what: `dp[a] will store the fewest coins needed for amount a; parent[a] will store the last coin used.`,
          why: 'Every subproblem needs both its optimal cost and one choice that achieved it, otherwise the coin list cannot be rebuilt.',
          whatNext: 'Set the base case dp[0] = 0 because making amount 0 requires no coins.',
        },
      }
    );

    dp[0] = 0;
    push(
      4,
      `Base case: dp[0] = 0. Zero coins are needed to form amount 0; every other amount is still unreachable (∞).`,
      {
        currentAmount: 0,
        currentCoin: 0,
        dpTable: dpSnapshot(),
        parentCoin: parentSnapshot(),
        optimalCoins: [],
        phase: 'dp',
      },
      {
        milestone: 'Base Case dp[0]=0',
        soundCue: { type: 'start' },
        variables: { 'dp[0]': 0, parent0: parentCoin[0] },
        conditionEval: { expr: 'dp[0] = 0', result: true },
        pedagogy: {
          what: 'dp[0] is set to 0, the only amount that costs zero coins.',
          why: 'The recurrence dp[a] = 1 + dp[a - c] eventually reaches a - c = 0; that chain is only valid if dp[0] is 0.',
          whatNext: 'Fill amounts 1 through ' + amount + ', testing every coin at each amount.',
        },
        checkpoint: {
          id: 'coin-change-base-case',
          question: 'What does dp[0] = 0 mean?',
          options: [
            'Making amount 0 needs 0 coins',
            'Making amount 1 needs 0 coins',
            'No coin denominations are available',
          ],
          correctIndex: 0,
          explanation:
            'dp[0] is the empty-sum base case: there is nothing left to pay, so no additional coin is needed.',
          hint: 'The index is the target amount, not the number of coins.',
        },
      }
    );

    // --- DP table fill --------------------------------------------------
    for (let a = 1; a <= amount; a++) {
      push(
        6,
        `Begin amount ${a}. dp[${a}] currently equals ${fmt(dp[a])}; test each coin to see if it improves this value.`,
        {
          currentAmount: a,
          currentCoin: 0,
          dpTable: dpSnapshot(),
          parentCoin: parentSnapshot(),
          optimalCoins: [],
          phase: 'dp',
        },
        {
          milestone: `Amount ${a}`,
          variables: { targetAmount: a, 'dp[a]': fmt(dp[a]) },
          pedagogy: {
            what: `The outer loop moves to target amount ${a}.`,
            why: 'Subproblems are solved in increasing amount order so dp[a - c] is already final before it is used.',
            whatNext: `Try each coin c and compare 1 + dp[${a} - c] with the current dp[${a}].`,
          },
        }
      );

      for (const c of coins) {
        if (a - c < 0) {
          push(
            8,
            `Coin ${c} cannot be used for amount ${a}: ${a} - ${c} = ${a - c} is negative. Skip to the next coin.`,
            {
              currentAmount: a,
              currentCoin: c,
              dpTable: dpSnapshot(),
              parentCoin: parentSnapshot(),
              optimalCoins: [],
              phase: 'dp',
            },
            {
              soundCue: { type: 'discard' },
              variables: { targetAmount: a, coin: c, remainder: a - c },
              conditionEval: { expr: `a - c >= 0 (${a} - ${c} >= 0)`, result: false },
              pedagogy: {
                what: `Coin ${c} is larger than the current amount ${a}.`,
                why: 'A coin larger than the remaining amount would make the subproblem index negative, which is outside the table.',
                whatNext: `Skip coin ${c}; no dp entry changes.`,
              },
            }
          );
          continue;
        }

        const subAmount = a - c;
        const subValue = dp[subAmount];
        const candidateVal = subValue + 1;
        const isImprovement = candidateVal < dp[a];
        const before = dp[a];

        push(
          8,
          `Test coin ${c} for amount ${a}: dp[${subAmount}] = ${fmt(subValue)}, so candidate = 1 + ${fmt(
            subValue
          )} = ${fmt(candidateVal)}. Compare with current dp[${a}] = ${fmt(before)}.`,
          {
            currentAmount: a,
            currentCoin: c,
            dpTable: dpSnapshot(),
            transitionFrom: subAmount,
            parentCoin: parentSnapshot(),
            optimalCoins: [],
            phase: 'dp',
          },
          {
            soundCue: { type: 'compare' },
            variables: {
              targetAmount: a,
              coin: c,
              subproblemAmount: subAmount,
              'dp[a-c]': fmt(subValue),
              candidate: fmt(candidateVal),
              'dp[a]': fmt(before),
              isImprovement,
            },
            conditionEval: {
              expr: `dp[${subAmount}] + 1 < dp[${a}] (${fmt(candidateVal)} < ${fmt(before)})`,
              result: isImprovement,
            },
            pedagogy: {
              what: `Using coin ${c} would add one coin to the best solution for amount ${subAmount}.`,
              why: 'The optimal solution for amount a either uses coin c or it does not; this comparison checks the using-c option.',
              whatNext: isImprovement
                ? `The candidate is smaller, so update dp[${a}] and record parent[${a}] = ${c}.`
                : `The candidate is not smaller, so keep dp[${a}] = ${fmt(before)} and try the next coin.`,
            },
            checkpoint:
              a === 1 && c === coins[0]
                ? {
                    id: 'coin-change-first-transition',
                    question: `Which value is a candidate for dp[${a}] using coin ${c}?`,
                    options: [`${fmt(subValue)}`, `${fmt(candidateVal)}`, `${fmt(before)}`],
                    correctIndex: 1,
                    explanation: `One coin of value ${c} is added to the optimal solution for amount ${subAmount}, so the candidate is 1 + dp[${subAmount}] = ${fmt(
                      candidateVal
                    )}.`,
                    hint: 'A candidate always adds exactly one coin to a smaller subproblem.',
                  }
                : undefined,
          }
        );

        if (isImprovement) {
          dp[a] = candidateVal;
          push(
            9,
            `Improved dp[${a}] from ${fmt(before)} to ${dp[a]} using coin ${c}. The parent pointer is not written yet.`,
            {
              currentAmount: a,
              currentCoin: c,
              dpTable: dpSnapshot(),
              transitionFrom: subAmount,
              parentCoin: parentSnapshot(),
              optimalCoins: [],
              phase: 'dp',
            },
            {
              milestone: `dp[${a}] = ${dp[a]}`,
              soundCue: { type: 'swap' },
              variables: { targetAmount: a, oldValue: fmt(before), newValue: dp[a], viaCoin: c },
              conditionEval: { expr: `candidate < dp[${a}]`, result: true },
              pedagogy: {
                what: `dp[${a}] now stores ${dp[a]}, the smallest coin count seen so far.`,
                why: 'A strictly smaller candidate replaces the previous best; ties are intentionally not replaced, keeping the first optimal choice stable.',
                whatNext: `Record coin ${c} in parent[${a}] so this decision can be reconstructed later.`,
              },
            }
          );

          parentCoin[a] = c;
          push(
            10,
            `Recorded parent[${a}] = ${c}. This is the coin that achieved dp[${a}] = ${dp[a]}.`,
            {
              currentAmount: a,
              currentCoin: c,
              dpTable: dpSnapshot(),
              transitionFrom: subAmount,
              parentCoin: parentSnapshot(),
              optimalCoins: [],
              phase: 'dp',
            },
            {
              soundCue: { type: 'insert' },
              variables: { targetAmount: a, parent: c, 'dp[a]': dp[a] },
              pedagogy: {
                what: `parent[${a}] points to coin ${c}.`,
                why: `Following parent pointers from ${a} will subtract ${c} each time until the chain reaches 0, rebuilding one optimal coin list.`,
                whatNext: `Continue testing the remaining coins for amount ${a}; a later coin could still improve dp[${a}].`,
              },
            }
          );
        }
      }

      push(
        13,
        `Amount ${a} finalized: dp[${a}] = ${fmt(dp[a])}${
          parentCoin[a] === -1 ? ' (unreachable).' : ` via coin ${parentCoin[a]}.`
        }`,
        {
          currentAmount: a,
          currentCoin: 0,
          dpTable: dpSnapshot(),
          parentCoin: parentSnapshot(),
          optimalCoins: [],
          phase: 'dp',
        },
        {
          soundCue: { type: 'sorted' },
          variables: {
            targetAmount: a,
            'dp[a]': fmt(dp[a]),
            parent: parentCoin[a] === -1 ? 'none' : parentCoin[a],
          },
          pedagogy: {
            what: `All coins have been tested for amount ${a}.`,
            why: 'dp[a] is now final because every possible last coin was considered against a smaller, already-final subproblem.',
            whatNext:
              a < amount
                ? `Move to amount ${a + 1}.`
                : 'The table is complete; either report unreachable or reconstruct the chosen coins.',
          },
        }
      );
    }

    // --- Result / reconstruction ---------------------------------------
    if (dp[amount] >= INF) {
      push(
        15,
        `Amount ${amount} is unreachable: dp[${amount}] is still ∞, so no combination of [${coins.join(
          ', '
        )}] sums to it.`,
        {
          currentAmount: amount,
          currentCoin: 0,
          dpTable: dpSnapshot(),
          parentCoin: parentSnapshot(),
          optimalCoins: [],
          reconstructPath: [],
          phase: 'done',
        },
        {
          milestone: 'Unreachable Target',
          soundCue: { type: 'fail' },
          variables: { result: -1, achievable: false },
          conditionEval: { expr: `dp[${amount}] == ∞`, result: true },
          pedagogy: {
            what: 'Every coin was tested for every amount, and the target entry never became reachable.',
            why: 'Unreachable is a valid final answer, not an error; returning -1 communicates that no combination exists.',
            whatNext: 'No parent chain exists, so there are no coins to reconstruct.',
          },
        }
      );
    } else {
      push(
        13,
        `DP table complete: dp[${amount}] = ${dp[amount]}. The minimum coin count is known; now rebuild the actual coin list.`,
        {
          currentAmount: amount,
          currentCoin: 0,
          dpTable: dpSnapshot(),
          parentCoin: parentSnapshot(),
          optimalCoins: [],
          phase: 'dp',
        },
        {
          milestone: `Minimum: ${dp[amount]} Coins`,
          soundCue: { type: 'success' },
          variables: { result: dp[amount], parentAtTarget: parentCoin[amount] },
          conditionEval: { expr: `dp[${amount}] < ∞`, result: true },
          pedagogy: {
            what: `The table is fully filled and dp[${amount}] = ${dp[amount]}.`,
            why: 'The cost is final, but the answer must also name the coins; parent[] stores those decisions.',
            whatNext: `Start at amount ${amount} and follow parent pointers down to 0.`,
          },
        }
      );

      const reconstructPath: number[] = [amount];
      const optimalCoins: number[] = [];

      push(
        17,
        `Start reconstruction with an empty used list and set a = ${amount}.`,
        {
          currentAmount: amount,
          currentCoin: 0,
          dpTable: dpSnapshot(),
          parentCoin: parentSnapshot(),
          optimalCoins: [],
          reconstructPath: [...reconstructPath],
          phase: 'reconstruct',
        },
        {
          milestone: 'Reconstruct Solution',
          soundCue: { type: 'step' },
          variables: { a: amount, used: '[]' },
          pedagogy: {
            what: `The backtracking pointer a starts at the target amount ${amount}.`,
            why: 'parent[amount] names the last coin of an optimal solution, so the target is the natural starting point.',
            whatNext: `Read parent[${amount}] to choose the first coin to add.`,
          },
          checkpoint: {
            id: 'coin-change-reconstruction-source',
            question: 'Which array tells us which coin to subtract at each reconstruction step?',
            options: ['dp', 'parent', 'coins'],
            correctIndex: 1,
            explanation:
              'dp stores costs only. parent[a] stores the coin that achieved dp[a], so it is the reconstruction map.',
            hint: 'Look for the array written whenever dp[a] improves.',
          },
        }
      );

      let a = amount;
      while (a > 0) {
        push(
          19,
          `While condition: a = ${a} > 0, so continue reconstructing.`,
          {
            currentAmount: a,
            currentCoin: parentCoin[a],
            dpTable: dpSnapshot(),
            parentCoin: parentSnapshot(),
            optimalCoins: [...optimalCoins],
            reconstructPath: [...reconstructPath],
            phase: 'reconstruct',
          },
          {
            variables: { a, condition: `${a} > 0`, nextParent: parentCoin[a] },
            conditionEval: { expr: `a > 0 (${a} > 0)`, result: true },
            pedagogy: {
              what: `The remaining amount is ${a}.`,
              why: 'Backtracking stops exactly when the remaining amount reaches 0, meaning the coin list sums to the target.',
              whatNext: `Append parent[${a}] = ${parentCoin[a]} to the used list.`,
            },
          }
        );

        const coin = parentCoin[a];
        optimalCoins.push(coin);
        push(
          20,
          `Appended parent[${a}] = ${coin} to used. Current coin list: [${optimalCoins.join(', ')}].`,
          {
            currentAmount: a,
            currentCoin: coin,
            dpTable: dpSnapshot(),
            parentCoin: parentSnapshot(),
            optimalCoins: [...optimalCoins],
            reconstructPath: [...reconstructPath],
            phase: 'reconstruct',
          },
          {
            soundCue: { type: 'insert' },
            variables: { a, appendedCoin: coin, used: optimalCoins.join(', ') },
            pedagogy: {
              what: `Coin ${coin} is part of the optimal solution.`,
              why: `By definition parent[${a}] = ${coin} achieved dp[${a}], so subtracting it preserves optimality for the remainder.`,
              whatNext: `Subtract ${coin} from ${a} to move to the next subproblem.`,
            },
          }
        );

        a -= coin;
        reconstructPath.push(a);
        push(
          21,
          `Subtracted coin ${coin}: a = ${a}. Reconstruction path is now ${reconstructPath.join(' → ')}.`,
          {
            currentAmount: a,
            currentCoin: coin,
            dpTable: dpSnapshot(),
            parentCoin: parentSnapshot(),
            optimalCoins: [...optimalCoins],
            reconstructPath: [...reconstructPath],
            phase: 'reconstruct',
          },
          {
            soundCue: { type: 'step' },
            variables: { a, subtracted: coin, path: reconstructPath.join(' -> ') },
            pedagogy: {
              what: `The remaining amount becomes ${a}.`,
              why: `The chosen coin ${coin} covers part of the target; the remaining subproblem must sum to ${a}.`,
              whatNext:
                a > 0
                  ? `Read parent[${a}] for the next coin.`
                  : 'The remaining amount is 0, so the reconstruction loop can stop.',
            },
          }
        );
      }

      push(
        19,
        `While condition: a = 0, so the reconstruction loop ends.`,
        {
          currentAmount: 0,
          currentCoin: 0,
          dpTable: dpSnapshot(),
          parentCoin: parentSnapshot(),
          optimalCoins: [...optimalCoins],
          reconstructPath: [...reconstructPath],
          phase: 'reconstruct',
        },
        {
          soundCue: { type: 'pop' },
          variables: { a: 0, condition: '0 > 0', used: optimalCoins.join(', ') },
          conditionEval: { expr: 'a > 0 (0 > 0)', result: false },
          pedagogy: {
            what: 'The remaining amount is exactly 0.',
            why: 'The parent chain has consumed the full target, so every coin in used is required and the sum is exact.',
            whatNext: 'Return the coin count together with the reconstructed coin list.',
          },
        }
      );

      push(
        24,
        `🎉 Optimal solution: ${dp[amount]} coins — ${optimalCoins.join(' + ')} = ${amount}.`,
        {
          currentAmount: amount,
          currentCoin: 0,
          dpTable: dpSnapshot(),
          parentCoin: parentSnapshot(),
          optimalCoins: [...optimalCoins],
          reconstructPath: [...reconstructPath],
          phase: 'done',
        },
        {
          milestone: `Optimal: ${dp[amount]} Coins`,
          soundCue: { type: 'complete' },
          variables: {
            totalCoinsNeeded: dp[amount],
            coinsUsed: optimalCoins.join(' + '),
            reconstructPath: reconstructPath.join(' -> '),
          },
          conditionEval: { expr: `sum(used) == ${amount}`, result: true },
          pedagogy: {
            what: `The reconstructed coins [${optimalCoins.join(', ')}] sum to ${amount}.`,
            why: 'The parent chain proves that each chosen coin was part of an optimal subproblem decision, so the whole list is optimal.',
            whatNext: 'Compare this result with the greedy trap preset to see why the DP choice is necessary.',
          },
        }
      );
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<CoinChangeState>) => {
    const {
      coins,
      amount,
      currentAmount,
      currentCoin,
      dpTable,
      transitionFrom,
      optimalCoins,
      parentCoin,
      reconstructPath,
      phase,
    } = frame.state;

    const pathSet = new Set(reconstructPath ?? []);
    const isReconstructing = phase === 'reconstruct';
    const isDone = phase === 'done';

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* Top HUD */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Available Coins:</span>
            <div className="flex gap-1.5">
              {coins.map((c) => (
                <span
                  key={c}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    c === currentCoin
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                      : 'bg-slate-800 text-amber-300'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Target Amount: <span className="text-cyan-400 font-bold">{amount}</span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
              isDone
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : isReconstructing
                ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                : 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300'
            }`}
          >
            {isDone ? 'DONE' : isReconstructing ? 'RECONSTRUCT' : 'FILL DP'}
          </div>
        </div>

        {/* DP Array Grid */}
        <div className="flex flex-col items-center max-w-4xl w-full">
          <div className="text-xs font-mono text-slate-400 mb-2">
            1D DP Table: <span className="text-slate-200">dp[a] = minimum coins for amount a</span>
          </div>
          <div className="flex items-start gap-2 overflow-x-auto p-4 max-w-full">
            {dpTable.map((val, idx) => {
              const isTarget = idx === currentAmount;
              const isTransition = idx === transitionFrom;
              const isOnPath = pathSet.has(idx);
              const isInfinity = val >= 999;
              const parent = parentCoin[idx];

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                      isOnPath && isReconstructing
                        ? 'border-cyan-400 bg-cyan-950/70 shadow-cyan-500/20 shadow-lg ring-2 ring-cyan-400/40'
                        : isTarget
                        ? 'border-emerald-400 bg-emerald-950/70 shadow-emerald-500/20 shadow-lg scale-105 ring-2 ring-emerald-400/40'
                        : isTransition
                        ? 'border-amber-400 bg-amber-950/70 shadow-amber-500/20 shadow-lg scale-105 ring-2 ring-amber-400/40'
                        : 'border-slate-800 bg-slate-900/90'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                    <span
                      className={`font-mono font-bold text-lg ${
                        isInfinity
                          ? 'text-rose-400 text-sm'
                          : isOnPath && isReconstructing
                          ? 'text-cyan-300'
                          : isTarget
                          ? 'text-emerald-300'
                          : isTransition
                          ? 'text-amber-300'
                          : 'text-white'
                      }`}
                    >
                      {isInfinity ? '∞' : val}
                    </span>
                  </div>
                  <span
                    className={`mt-1 text-[9px] font-mono ${
                      parent === -1 ? 'text-slate-600' : 'text-purple-300'
                    }`}
                    title={parent === -1 ? 'No parent coin' : `parent[${idx}] = ${parent}`}
                  >
                    {parent === -1 ? '·' : `p:${parent}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Transition / Reconstruction HUD */}
          {!isReconstructing && transitionFrom !== undefined && (
            <div className="mt-2 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
              Using coin <span className="text-amber-300 font-bold">{currentCoin}</span> for amount{' '}
              <span className="text-emerald-300 font-bold">{currentAmount}</span> reads subproblem{' '}
              <span className="text-amber-300 font-bold">dp[{transitionFrom}]</span>
            </div>
          )}

          {isReconstructing && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-mono text-cyan-200">
              <span className="font-bold">Backtrack:</span>
              <span>
                {(reconstructPath ?? []).map((value, idx) => (
                  <span key={`${value}-${idx}`}>
                    {idx > 0 && <span className="text-cyan-500 mx-1">→</span>}
                    <span className={value === currentAmount ? 'text-white font-bold' : ''}>
                      {value}
                    </span>
                  </span>
                ))}
              </span>
              <span className="text-cyan-500">|</span>
              <span>
                used: [{optimalCoins.join(', ')}]
              </span>
            </div>
          )}

          {/* Optimal Combination Banner */}
          {optimalCoins.length > 0 && (
            <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center gap-2 text-xs font-mono text-emerald-300 shadow-lg">
              <span className="font-bold">
                {isDone ? 'Optimal Coins' : 'Rebuilt Coins'} ({optimalCoins.length}):
              </span>
              <span>
                {optimalCoins.join(' + ')} = {amount}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
};
