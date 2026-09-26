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
  dpTable: number[]; // -1 or infinity representation for unreachable
  transitionFrom?: number;
  optimalCoins: number[];
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
      'Optimal Substructure: The fewest coins to make amount a is 1 + min(dp[a - c]) across all valid coin values c <= a.',
    invariant:
      'At step a, dp[a] holds the mathematically proven minimum coin count required to form amount a, or ∞ if unattainable.',
    pitfalls: [
      'Assuming greedy choice works for non-canonical coin systems.',
      'Integer overflow when using large dummy values instead of proper infinity representations.',
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
    dp[0] = 0

    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0:
                dp[a] = min(dp[a], dp[a - c] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1`,
    typescript: `function coinChange(coins: number[], amount: number): number {
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (a - c >= 0) {
        dp[a] = Math.min(dp[a], dp[a - c] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (a - c >= 0) {
                dp[a] = min(dp[a], dp[a - c] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    java: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (a - c >= 0) {
                dp[a] = Math.min(dp[a], dp[a - c] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    pseudocode: `function coinChange(coins, amount):
    dp = array of size amount + 1 filled with INF
    dp[0] = 0
    for a from 1 to amount:
        for c in coins:
            if a >= c:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount]`,
  },

  generateTimeline: (input: CoinChangeInput): ExecutionFrame<CoinChangeState>[] => {
    const frames: ExecutionFrame<CoinChangeState>[] = [];
    const { coins, amount } = input;
    const INF = 999;
    const dp = new Array(amount + 1).fill(INF);
    dp[0] = 0;

    // Backtrack predecessor
    const parentCoin = new Array(amount + 1).fill(-1);

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized DP table of size ${amount + 1}. Base case: dp[0] = 0 coins needed to make amount 0. All other dp[a] = ∞.`,
      isMilestone: true,
      milestoneTitle: 'Base Case dp[0]=0',
      soundCue: 'start',
      scopeVariables: { amount, coins: coins.join(', ') },
      state: {
        coins,
        amount,
        currentAmount: 0,
        currentCoin: 0,
        dpTable: [...dp],
        optimalCoins: [],
      },
    });

    for (let a = 1; a <= amount; a++) {
      for (const c of coins) {
        if (a - c >= 0) {
          const candidateVal = dp[a - c] + 1;
          const isImprovement = candidateVal < dp[a];

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: `Testing amount ${a} with coin ${c}: subproblem dp[${a} - ${c}] = dp[${a - c}] (${dp[a - c] === INF ? '∞' : dp[a - c]}). Candidate coins = 1 + dp[${a - c}] = ${dp[a - c] === INF ? '∞' : candidateVal}.`,
            soundCue: 'compare',
            scopeVariables: {
              targetAmount: a,
              coin: c,
              subproblemAmount: a - c,
              currentDpVal: dp[a] === INF ? '∞' : dp[a],
              candidateVal: candidateVal >= INF ? '∞' : candidateVal,
            },
            state: {
              coins,
              amount,
              currentAmount: a,
              currentCoin: c,
              dpTable: [...dp],
              transitionFrom: a - c,
              optimalCoins: [],
            },
          });

          if (isImprovement) {
            dp[a] = candidateVal;
            parentCoin[a] = c;

            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 8,
              explanation: `✨ Improved dp[${a}] = ${dp[a]} using coin ${c}!`,
              soundCue: 'swap',
              isMilestone: true,
              milestoneTitle: `dp[${a}] = ${dp[a]}`,
              scopeVariables: { targetAmount: a, newMinCoins: dp[a], viaCoin: c },
              state: {
                coins,
                amount,
                currentAmount: a,
                currentCoin: c,
                dpTable: [...dp],
                transitionFrom: a - c,
                optimalCoins: [],
              },
            });
          }
        }
      }
    }

    // Reconstruct solution
    const optimalCoins: number[] = [];
    if (dp[amount] !== INF) {
      let curr = amount;
      while (curr > 0 && parentCoin[curr] !== -1) {
        optimalCoins.push(parentCoin[curr]);
        curr -= parentCoin[curr];
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      explanation:
        dp[amount] === INF
          ? `❌ Amount ${amount} cannot be formed using given coins.`
          : `🎉 Optimal solution found! Minimum ${dp[amount]} coins needed to form amount ${amount}: [${optimalCoins.join(' + ')} = ${amount}].`,
      isMilestone: true,
      milestoneTitle: dp[amount] === INF ? 'Unreachable' : `Optimal: ${dp[amount]} Coins`,
      soundCue: dp[amount] === INF ? 'discard' : 'complete',
      scopeVariables: {
        totalCoinsNeeded: dp[amount] === INF ? -1 : dp[amount],
        coinsUsed: optimalCoins.join(' + '),
      },
      state: {
        coins,
        amount,
        currentAmount: amount,
        currentCoin: 0,
        dpTable: [...dp],
        optimalCoins,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<CoinChangeState>) => {
    const { coins, amount, currentAmount, currentCoin, dpTable, transitionFrom, optimalCoins } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Available Coins:</span>
            <div className="flex gap-1.5">
              {coins.map((c) => (
                <span
                  key={c}
                  className={`px-2 py-0.5 rounded font-bold ${
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
        </div>

        {/* DP Array Grid */}
        <div className="flex flex-col items-center max-w-4xl w-full">
          <div className="text-xs font-mono text-slate-400 mb-2">
            1D DP Table: <span className="text-slate-200">dp[a] = minimum coins for amount a</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto p-4 max-w-full">
            {dpTable.map((val, idx) => {
              const isTarget = idx === currentAmount;
              const isTransition = idx === transitionFrom;
              const isInfinity = val >= 999;

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                      isTarget
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
                </div>
              );
            })}
          </div>

          {/* Optimal Combination Banner */}
          {optimalCoins.length > 0 && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 flex items-center gap-2 text-xs font-mono text-emerald-300 shadow-lg">
              <span className="font-bold">Optimal Coins ({optimalCoins.length}):</span>
              <span>{optimalCoins.join(' + ')} = {amount}</span>
            </div>
          )}
        </div>
      </div>
    );
  },
};
