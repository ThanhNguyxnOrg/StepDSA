import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SubsetSumState {
  nums: number[];
  target: number;
  table: boolean[][]; // (N + 1) x (target + 1)
  currentRow: number;
  currentCol: number;
  isFeasible: boolean;
  selectedSubset: number[];
}

export const subsetSumModule: AlgorithmModule<
  { nums: number[]; target: number },
  SubsetSumState
> = {
  id: 'subset-sum',
  title: 'Subset Sum Problem (Boolean DP Matrix O(N * Target))',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N * Target)',
    timeAverage: 'O(N * Target)',
    timeWorst: 'O(N * Target)',
    spaceAuxiliary: 'O(N * Target) or O(Target) 1D rolling array',
    worstCaseCondition: 'Pseudo-polynomial runtime proportional to target sum magnitude',
  },
  theory: {
    overview:
      'Given a set of non-negative integers nums and a target value S, determine whether there exists a subset of the given set whose sum is exactly equal to S.',
    whyItWorks:
      'The optimal substructure property dictates that for item i with value v, a sum j can be formed if and only if: (1) we can already form sum j WITHOUT item i (dp[i-1][j] is true), OR (2) j >= v and we can form sum (j - v) using prior items (dp[i-1][j-v] is true).',
    invariant:
      'Subproblem Reachability Invariant: dp[i][j] is true iff a subset of nums[0..i-1] sums to j.',
    pitfalls: [
      'Target sum greater than total array sum (immediately impossible).',
      'For Partition Equal Subset Sum, odd sum total can never be partitioned into two equal integer halves.',
    ],
  },
  presets: [
    {
      id: 'standard-feasible',
      label: 'Standard Feasible: [3, 34, 4, 12, 5, 2], Target = 9',
      description: 'Subset [4, 5] or [3, 4, 2] forms 9',
      data: { nums: [3, 4, 5, 2], target: 9 },
    },
    {
      id: 'partition-equal',
      label: 'Partition Equal: [1, 5, 11, 5], Target = 11',
      description: 'Half of sum 22 is 11; subset [1, 5, 5] forms 11',
      data: { nums: [1, 5, 11, 5], target: 11 },
    },
    {
      id: 'infeasible-target',
      label: 'Infeasible Target: [3, 5, 7], Target = 9',
      description: 'No subset combination equals 9',
      data: { nums: [3, 5, 7], target: 9 },
    },
  ],
  defaultInput: { nums: [3, 4, 5, 2], target: 9 },
  codeSnippets: {
    python: `def isSubsetSum(nums, target):
    n = len(nums)
    dp = [[False] * (target + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = True # Sum 0 is always achievable (empty set)
    for i in range(1, n + 1):
        for j in range(1, target + 1):
            if j < nums[i - 1]:
                dp[i][j] = dp[i - 1][j]
            else:
                dp[i][j] = dp[i - 1][j] or dp[i - 1][j - nums[i - 1]]
    return dp[n][target]`,
    typescript: `function isSubsetSum(nums: number[], target: number): boolean {
  const n = nums.length;
  const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
    Array(target + 1).fill(false)
  );
  for (let i = 0; i <= n; i++) dp[i][0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= target; j++) {
      if (j < nums[i - 1]) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = dp[i - 1][j] || dp[i - 1][j - nums[i - 1]];
      }
    }
  }
  return dp[n][target];
}`,
    cpp: `bool isSubsetSum(vector<int>& nums, int target) {
    int n = nums.size();
    vector<vector<bool>> dp(n + 1, vector<bool>(target + 1, false));
    for (int i = 0; i <= n; i++) dp[i][0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= target; j++) {
            if (j < nums[i - 1]) dp[i][j] = dp[i - 1][j];
            else dp[i][j] = dp[i - 1][j] || dp[i - 1][j - nums[i - 1]];
        }
    }
    return dp[n][target];
}`,
    java: `public boolean isSubsetSum(int[] nums, int target) {
    int n = nums.length;
    boolean[][] dp = new boolean[n + 1][target + 1];
    for (int i = 0; i <= n; i++) dp[i][0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= target; j++) {
            if (j < nums[i - 1]) dp[i][j] = dp[i - 1][j];
            else dp[i][j] = dp[i - 1][j] || dp[i - 1][j - nums[i - 1]];
        }
    }
    return dp[n][target];
}`,
    pseudocode: `function isSubsetSum(nums, target):
    dp[0..N][0..Target] = false
    for i from 0 to N: dp[i][0] = true
    for i from 1 to N:
        for j from 1 to Target:
            if j < nums[i-1]:
                dp[i][j] = dp[i-1][j]
            else:
                dp[i][j] = dp[i-1][j] OR dp[i-1][j - nums[i-1]]
    return dp[N][Target]`,
  },

  generateTimeline: (input: { nums: number[]; target: number }): ExecutionFrame<SubsetSumState>[] => {
    const nums = input.nums.length > 0 ? input.nums : [3, 4, 5, 2];
    const target = Math.max(1, Math.min(input.target || 9, 20));
    const n = nums.length;

    const dp: boolean[][] = Array.from({ length: n + 1 }, () =>
      Array(target + 1).fill(false)
    );
    for (let i = 0; i <= n; i++) dp[i][0] = true;

    const frames: ExecutionFrame<SubsetSumState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialize DP table size (${n + 1} x ${target + 1}). Column 0 is set to TRUE because an empty subset achieves sum 0.`,
      variables: { target, arrayLength: n, baseCaseSum0: 'TRUE' },
      callStack: [
        { name: `isSubsetSum(nums, target=${target})`, params: { target, n }, line: 4, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nums,
        target,
        table: dp.map((r) => [...r]),
        currentRow: 0,
        currentCol: 0,
        isFeasible: false,
        selectedSubset: [],
      },
    });

    for (let i = 1; i <= n; i++) {
      const val = nums[i - 1];

      for (let j = 1; j <= target; j++) {
        const withoutItem = dp[i - 1][j];
        const withItem = j >= val ? dp[i - 1][j - val] : false;
        dp[i][j] = withoutItem || withItem;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: j < val ? 8 : 10,
          explanation: `Item #${i} (val = ${val}) for sum ${j}: without item = ${withoutItem ? 'T' : 'F'}, with item = ${
            j >= val ? (withItem ? 'T' : 'F') : 'N/A'
          }. Result dp[${i}][${j}] = ${dp[i][j] ? 'TRUE' : 'FALSE'}.`,
          variables: {
            itemVal: val,
            sum: j,
            exclude: String(withoutItem),
            include: j >= val ? String(withItem) : 'N/A',
            dpResult: String(dp[i][j]),
          },
          conditionEval: {
            expr: `dp[${i - 1}][${j}] || dp[${i - 1}][${j} - ${val}]`,
            result: dp[i][j],
          },
          callStack: [
            { name: `evaluateCell(item=${val}, sum=${j})`, params: { val, sum: j, reachable: String(dp[i][j]) }, line: j < val ? 8 : 10, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nums,
            target,
            table: dp.map((r) => [...r]),
            currentRow: i,
            currentCol: j,
            isFeasible: dp[n][target],
            selectedSubset: [],
          },
        });
      }
    }

    // Reconstruct subset if feasible
    const subset: number[] = [];
    if (dp[n][target]) {
      let currSum = target;
      for (let i = n; i >= 1 && currSum > 0; i--) {
        if (!dp[i - 1][currSum]) {
          subset.push(nums[i - 1]);
          currSum -= nums[i - 1];
        }
      }
    }

    // Final Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      isMilestone: true,
      milestoneTitle: dp[n][target] ? `Subset Found: [${subset.join(', ')}]` : 'No Subset Exists',
      explanation: dp[n][target]
        ? `dp[${n}][${target}] is TRUE. Backtracked subset [${subset.join(' + ')}] = ${target}.`
        : `dp[${n}][${target}] is FALSE. No combination of elements can sum to ${target}.`,
      variables: {
        isPossible: String(dp[n][target]),
        target,
        subset: subset.length > 0 ? `[${subset.join(', ')}]` : 'None',
      },
      callStack: [
        { name: 'complete()', params: { possible: String(dp[n][target]) }, line: 11, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nums,
        target,
        table: dp.map((r) => [...r]),
        currentRow: n,
        currentCol: target,
        isFeasible: dp[n][target],
        selectedSubset: subset,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<SubsetSumState>) => {
    const { nums, target, table, currentRow, currentCol, isFeasible, selectedSubset } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Target Sum: <strong className="text-white">S = {target}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Numbers: <strong className="text-white">[{nums.join(', ')}]</strong>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
              isFeasible
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {selectedSubset.length > 0 ? `SOLVED: [${selectedSubset.join(' + ')}] = ${target}` : `Target ${isFeasible ? 'REACHABLE' : 'UNREACHED'}`}
          </div>
        </div>

        {/* 2D Boolean DP Matrix */}
        <div className="w-full overflow-x-auto p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl my-auto">
          <table className="w-full text-center border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-2 text-slate-500">item \ sum</th>
                {Array.from({ length: target + 1 }, (_, s) => (
                  <th
                    key={s}
                    className={`p-2 ${s === currentCol ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-400'}`}
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className="border-b border-slate-900/60">
                  <td
                    className={`p-2 text-left font-bold ${
                      i === currentRow ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-500'
                    }`}
                  >
                    {i === 0 ? 'Ø (none)' : `#${i} (${nums[i - 1]})`}
                  </td>
                  {row.map((cell, j) => {
                    const isCurrent = i === currentRow && j === currentCol;
                    return (
                      <td
                        key={j}
                        className={`p-2 transition-all duration-200 ${
                          isCurrent
                            ? 'bg-cyan-500 text-slate-950 font-extrabold scale-110 shadow-md'
                            : cell
                            ? 'bg-emerald-950/40 text-emerald-400 font-bold'
                            : 'text-slate-700'
                        }`}
                      >
                        {cell ? 'T' : 'F'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
