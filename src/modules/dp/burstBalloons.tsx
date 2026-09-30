import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BurstBalloonsState {
  nums: number[];
  padded: number[];
  dp: number[][];
  activeI: number | null;
  activeJ: number | null;
  activeK: number | null;
  currentLen: number;
  maxCoins: number;
}

export const burstBalloonsModule: AlgorithmModule<
  { nums: number[] },
  BurstBalloonsState
> = {
  id: 'burst-balloons',
  title: 'Burst Balloons (Interval Matrix DP Decomposition O(N^3))',
  category: 'dynamic-programming',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N^3)',
    timeAverage: 'O(N^3)',
    timeWorst: 'O(N^3)',
    spaceAuxiliary: 'O(N^2) 2D interval memoization matrix',
    worstCaseCondition: 'Strict cubic state-space evaluation over all interval lengths and pivot permutations',
  },
  theory: {
    overview:
      'Burst Balloons is an iconic interval DP problem. Given N balloons with values, bursting balloon i yields coins equal to left_neighbor * val[i] * right_neighbor. The key insight is thinking in reverse: choose which balloon k is burst LAST in interval (i, j).',
    whyItWorks:
      'Bursting a balloon creates dependencies between formerly distant neighbors. By fixing balloon k as the LAST balloon to pop in open interval (i, j), subproblems (i, k) and (k, j) become completely independent, allowing optimal substructure DP.',
    invariant:
      'Interval Subproblem Invariant: dp[i][j] = max_{i < k < j} (dp[i][k] + nums[i] * nums[k] * nums[j] + dp[k][j]), where balloon k is bounded by fixed boundaries nums[i] and nums[j].',
    pitfalls: [
      'Attempting greedy choice of highest/lowest balloon first (violates future boundary condition).',
      'Forgetting the padding boundaries of 1 at both extremities of the array.',
    ],
  },
  presets: [
    {
      id: 'classic-balloons',
      label: 'Classic [3, 1, 5, 8]',
      description: 'Canonical LeetCode 312 example yielding max 167 coins',
      data: {
        nums: [3, 1, 5, 8],
      },
    },
    {
      id: 'small-balloons',
      label: 'Small Array [1, 5]',
      description: 'Compact 2-balloon test case showing boundary multiplications',
      data: {
        nums: [1, 5],
      },
    },
  ],
  defaultInput: {
    nums: [3, 1, 5, 8],
  },
  codeSnippets: {
    cpp: `int maxCoins(vector<int>& nums) {
    int n = nums.size();
    vector<int> A(n + 2, 1);
    for (int i = 0; i < n; i++) A[i + 1] = nums[i];

    vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));
    for (int len = 1; len <= n; len++) {
        for (int i = 1; i <= n - len + 1; i++) {
            int j = i + len - 1;
            for (int k = i; k <= j; k++) {
                int coins = A[i - 1] * A[k] * A[j + 1] + dp[i][k - 1] + dp[k + 1][j];
                dp[i][j] = max(dp[i][j], coins);
            }
        }
    }
    return dp[1][n];
}`,
    python: `def max_coins(nums):
    A = [1] + nums + [1]
    n = len(nums)
    dp = [[0] * (n + 2) for _ in range(n + 2)]

    for length in range(1, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            for k in range(i, j + 1):
                coins = A[i - 1] * A[k] * A[j + 1] + dp[i][k - 1] + dp[k + 1][j]
                dp[i][j] = max(dp[i][j], coins)
    return dp[1][n]`,
    typescript: `function maxCoins(nums: number[]): number {
  const A = [1, ...nums, 1];
  const n = nums.length;
  const dp: number[][] = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));

  for (let len = 1; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      for (let k = i; k <= j; k++) {
        const coins = A[i - 1] * A[k] * A[j + 1] + dp[i][k - 1] + dp[k + 1][j];
        dp[i][j] = Math.max(dp[i][j], coins);
      }
    }
  }
  return dp[1][n];
}`,
    java: `public int maxCoins(int[] nums) {
    int n = nums.length;
    int[] A = new int[n + 2];
    A[0] = A[n + 1] = 1;
    for (int i = 0; i < n; i++) A[i + 1] = nums[i];

    int[][] dp = new int[n + 2][n + 2];
    for (int len = 1; len <= n; len++) {
        for (int i = 1; i <= n - len + 1; i++) {
            int j = i + len - 1;
            for (int k = i; k <= j; k++) {
                int coins = A[i - 1] * A[k] * A[j + 1] + dp[i][k - 1] + dp[k + 1][j];
                dp[i][j] = Math.max(dp[i][j], coins);
            }
        }
    }
    return dp[1][n];
}`,
    pseudocode: `function maxCoins(nums):
    A = [1] + nums + [1]
    dp = matrix of zeros (size N+2 x N+2)
    for length = 1 to N:
        for i = 1 to N - length + 1:
            j = i + length - 1
            for k = i to j (k burst last in interval):
                coins = A[i-1] * A[k] * A[j+1] + dp[i][k-1] + dp[k+1][j]
                dp[i][j] = max(dp[i][j], coins)
    return dp[1][N]`,
  },
  generateTimeline: (input: { nums: number[] }): ExecutionFrame<BurstBalloonsState>[] => {
    const rawNums = input?.nums?.length ? input.nums : [3, 1, 5, 8];
    const n = rawNums.length;
    const padded = [1, ...rawNums, 1];

    const dp: number[][] = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));
    const frames: ExecutionFrame<BurstBalloonsState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        nums: rawNums,
        padded: [...padded],
        dp: dp.map((row) => [...row]),
        activeI: null,
        activeJ: null,
        activeK: null,
        currentLen: 0,
        maxCoins: 0,
      },
      callStack: [{ name: 'maxCoinsInit', params: { n, paddedSize: padded.length } }],
      variables: { n, paddedBalloons: padded.join(','), totalSubproblems: (n * (n + 1)) / 2 },
      explanation: `Padded input array with boundary 1s: [${padded.join(', ')}]. DP table initialized with zeros.`,
    });

    for (let len = 1; len <= n; len++) {
      for (let i = 1; i <= n - len + 1; i++) {
        const j = i + len - 1;

        for (let k = i; k <= j; k++) {
          const product = padded[i - 1] * padded[k] * padded[j + 1];
          const leftCost = dp[i][k - 1];
          const rightCost = dp[k + 1][j];
          const totalCost = product + leftCost + rightCost;

          dp[i][j] = Math.max(dp[i][j], totalCost);

          frames.push({
            stepIndex: frames.length,
            totalSteps: frames.length + 1,
            codeLine: 12,
            action: 'EVALUATE_PIVOT',
            state: {
              nums: rawNums,
              padded: [...padded],
              dp: dp.map((row) => [...row]),
              activeI: i,
              activeJ: j,
              activeK: k,
              currentLen: len,
              maxCoins: dp[1][n],
            },
            callStack: [{ name: 'evalInterval', params: { i, j, k, len } }],
            variables: {
              interval: `[${i}..${j}]`,
              lastBurst: `k=${k} (val=${padded[k]})`,
              leftBound: padded[i - 1],
              rightBound: padded[j + 1],
              coinsFormula: `${padded[i - 1]} * ${padded[k]} * ${padded[j + 1]} + ${leftCost} + ${rightCost} = ${totalCost}`,
              updatedMax: dp[i][j],
            },
            explanation: `Testing k=${k} (val ${padded[k]}) burst last in interval [${i}..${j}]: ${padded[i - 1]}*${padded[k]}*${padded[j + 1]} + dp[${i}][${k - 1}] (${leftCost}) + dp[${k + 1}][${j}] (${rightCost}) = ${totalCost} coins. DP[${i}][${j}] = ${dp[i][j]}.`,
          });
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 20,
      action: 'COMPLETE',
      state: {
        nums: rawNums,
        padded: [...padded],
        dp: dp.map((row) => [...row]),
        activeI: 1,
        activeJ: n,
        activeK: null,
        currentLen: n,
        maxCoins: dp[1][n],
      },
      callStack: [{ name: 'complete', params: { maxCoins: dp[1][n] } }],
      variables: { optimalCoins: dp[1][n], completed: true },
      explanation: `Dynamic programming finished. Maximum coins obtainable bursting all balloons = ${dp[1][n]}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<BurstBalloonsState>) => {
    const { nums, padded, dp, activeI, activeJ, activeK, maxCoins } = frame.state;
    const n = nums.length;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Interval:</span>
            {activeI !== null && activeJ !== null ? (
              <span className="font-mono text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-3 py-1 rounded">
                [{activeI} .. {activeJ}] {activeK !== null && `(Last Burst: k=${activeK})`}
              </span>
            ) : (
              <span className="text-slate-500 text-xs italic">Complete</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Optimal Coins: <strong className="text-amber-400 text-base">{maxCoins}</strong>
            </span>
          </div>
        </div>

        {/* Balloon Visual Chain */}
        <div className="flex items-center justify-center gap-2 flex-wrap py-2">
          {padded.map((val, idx) => {
            const isBoundary = idx === 0 || idx === padded.length - 1;
            const isLeft = activeI !== null && idx === activeI - 1;
            const isRight = activeJ !== null && idx === activeJ + 1;
            const isPivot = activeK !== null && idx === activeK;
            const isInRange = activeI !== null && activeJ !== null && idx >= activeI && idx <= activeJ;

            let bg = isBoundary ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-900 text-slate-200 border-slate-700';
            if (isPivot) {
              bg = 'bg-amber-500/30 text-amber-200 border-amber-400 scale-110 shadow-lg';
            } else if (isLeft || isRight) {
              bg = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
            } else if (isInRange) {
              bg = 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40';
            }

            return (
              <div
                key={`balloon-${idx}`}
                className={`flex flex-col items-center justify-center w-12 h-14 rounded-2xl border transition-all duration-300 ${bg}`}
              >
                <span className="text-xs font-mono text-slate-500">i={idx}</span>
                <span className="text-base font-bold font-mono">{val}</span>
              </div>
            );
          })}
        </div>

        {/* DP Interval Matrix */}
        <div className="relative overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-inner max-w-full">
          <table className="border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="p-1.5 text-slate-500">i \ j</th>
                {Array.from({ length: n }).map((_, col) => (
                  <th key={`head-${col + 1}`} className="p-1.5 text-center text-cyan-400 w-12">
                    {col + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: n }).map((_, row) => {
                const r = row + 1;
                return (
                  <tr key={`row-${r}`}>
                    <td className="p-1.5 text-right font-bold text-cyan-400">{r}</td>
                    {Array.from({ length: n }).map((_, col) => {
                      const c = col + 1;
                      const val = dp[r]?.[c] ?? 0;
                      const isActiveCell = r === activeI && c === activeJ;

                      return (
                        <td
                          key={`cell-${r}-${c}`}
                          className={`p-1.5 text-center border border-slate-800/60 rounded ${
                            isActiveCell
                              ? 'bg-amber-500/30 text-amber-300 font-bold border-amber-400'
                              : val > 0
                              ? 'bg-slate-800/40 text-slate-200'
                              : 'text-slate-600'
                          }`}
                        >
                          {c >= r ? val : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
