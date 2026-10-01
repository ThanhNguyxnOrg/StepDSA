import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface LISInput {
  array: number[];
}

export interface LISState {
  array: number[];
  dp: number[];
  currentI: number;
  currentJ: number;
  maxLisLength: number;
  optimalSequence: number[];
  actionType: 'COMPARE' | 'UPDATE' | 'NONE';
}

export const lisModule: AlgorithmModule<LISInput, LISState> = {
  id: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence (LIS)',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N) with Patience Sorting',
    timeAverage: 'O(N²) classic DP',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Strictly decreasing sequence requires full quadratic predecessor scans',
  },
  theory: {
    overview:
      'The Longest Increasing Subsequence (LIS) problem finds the length of the longest subsequence in a given sequence such that all elements of the subsequence are sorted in strictly increasing order. The elements do not need to be contiguous in the original array.',
    whyItWorks:
      'Optimal Substructure: If an increasing subsequence ends at index i, its prefix is the longest increasing subsequence ending at some prior index j < i where arr[j] < arr[i].',
    invariant:
      'At any step i, dp[i] equals the exact length of the longest increasing subsequence ending strictly at arr[i].',
    pitfalls: [
      'Confusing subsequence (elements can skip positions) with contiguous subarray.',
      'Forgetting that every single element forms an LIS of length 1 by itself (base case dp[i] = 1).',
    ],
  },
  presets: [
    {
      id: 'classic-leetcode',
      label: 'LeetCode 300 Standard',
      description: 'Sequence [10, 9, 2, 5, 3, 7, 101, 18]',
      data: { array: [10, 9, 2, 5, 3, 7, 101, 18] },
    },
    {
      id: 'alternating',
      label: 'Alternating High-Low',
      description: 'Sequence [0, 8, 4, 12, 2, 10, 6, 14, 1, 9]',
      data: { array: [0, 8, 4, 12, 2, 10, 6, 14, 1, 9] },
    },
    {
      id: 'sorted',
      label: 'Already Sorted',
      description: 'Sequence [1, 2, 3, 4, 5] (LIS = 5)',
      data: { array: [1, 2, 3, 4, 5] },
    },
  ],
  defaultInput: { array: [10, 9, 2, 5, 3, 7, 101, 18] },
  codeSnippets: {
    python: `def length_of_lis(nums):
    if not nums:
        return 0
    n = len(nums)
    dp = [1] * n

    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)

    return max(dp)`,
    typescript: `function lengthOfLIS(nums: number[]): number {
  if (nums.length === 0) return 0;
  const n = nums.length;
  const dp: number[] = new Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}`,
    cpp: `int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    if (n == 0) return 0;
    vector<int> dp(n, 1);
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
    }
    return *max_element(dp.begin(), dp.end());
}`,
    java: `public int lengthOfLIS(int[] nums) {
    if (nums.length == 0) return 0;
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1);
    int maxLen = 1;
    for (int i = 1; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}`,
    pseudocode: `function lengthOfLIS(nums):
    dp = array of size N filled with 1
    for i = 1 to N - 1:
        for j = 0 to i - 1:
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
  },

  generateTimeline: (input: LISInput): ExecutionFrame<LISState>[] => {
    const frames: ExecutionFrame<LISState>[] = [];
    const arr = input.array;
    const n = arr.length;
    const dp = new Array(n).fill(1);
    const parent = new Array(n).fill(-1);

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized LIS DP array of size ${n} with base values 1 (every standalone element forms an LIS of length 1).`,
      isMilestone: true,
      milestoneTitle: 'Base Case dp[:]=1',
      soundCue: { type: 'start' },
      variables: { arraySize: n, initialLIS: 1, n },
      callStack: [{ name: 'lengthOfLIS', params: { n }, line: 1, isCurrent: true }],
      conditionEval: { expr: `n > 0`, result: true },
      scopeVariables: { arraySize: n, initialLIS: 1 },
      state: {
        array: [...arr],
        dp: [...dp],
        currentI: -1,
        currentJ: -1,
        maxLisLength: 1,
        optimalSequence: [],
        actionType: 'NONE',
      },
    });

    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        const canExtend = arr[j] < arr[i];
        const isBetter = canExtend && dp[j] + 1 > dp[i];

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `Comparing arr[j]=${arr[j]} (idx ${j}) with arr[i]=${arr[i]} (idx ${i}). Condition: arr[j] < arr[i] is ${canExtend ? 'TRUE' : 'FALSE'}.`,
          soundCue: { type: 'compare' },
          variables: { i, j, 'arr[i]': arr[i], 'arr[j]': arr[j], 'dp[i]': dp[i], 'dp[j]+1': dp[j] + 1, canExtend, isBetter },
          callStack: [{ name: 'checkExtension', params: { i, j, 'arr[i]': arr[i], 'arr[j]': arr[j] }, line: 8, isCurrent: true }],
          conditionEval: { expr: `arr[${j}] < arr[${i}] (${arr[j]} < ${arr[i]})`, result: canExtend },
          scopeVariables: { i, j, 'arr[i]': arr[i], 'arr[j]': arr[j], 'dp[i]': dp[i], 'dp[j]+1': dp[j] + 1 },
          state: {
            array: [...arr],
            dp: [...dp],
            currentI: i,
            currentJ: j,
            maxLisLength: Math.max(...dp),
            optimalSequence: [],
            actionType: 'COMPARE',
          },
        });

        if (isBetter) {
          dp[i] = dp[j] + 1;
          parent[i] = j;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `✨ Extended LIS! dp[${i}] updated to ${dp[i]} (extending LIS ending at index ${j}).`,
            soundCue: { type: 'swap' },
            isMilestone: true,
            milestoneTitle: `dp[${i}] = ${dp[i]}`,
            variables: { i, newDp: dp[i], extendedFrom: j },
            callStack: [{ name: 'updateLIS', params: { i, newLength: dp[i] }, line: 9, isCurrent: true }],
            conditionEval: { expr: `dp[${j}] + 1 > dp[${i}]`, result: true },
            scopeVariables: { i, newDp: dp[i], extendedFrom: j },
            state: {
              array: [...arr],
              dp: [...dp],
              currentI: i,
              currentJ: j,
              maxLisLength: Math.max(...dp),
              optimalSequence: [],
              actionType: 'UPDATE',
            },
          });
        }
      }
    }

    // Reconstruct optimal LIS
    let maxIdx = 0;
    for (let i = 1; i < n; i++) {
      if (dp[i] > dp[maxIdx]) maxIdx = i;
    }

    const optimalSeq: number[] = [];
    let curr: number = maxIdx;
    while (curr !== -1) {
      optimalSeq.unshift(arr[curr]);
      curr = parent[curr];
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `🎉 LIS Computation complete! Maximum LIS length is ${dp[maxIdx]}. Optimal subsequence: [${optimalSeq.join(', ')}].`,
      isMilestone: true,
      milestoneTitle: `LIS Length = ${dp[maxIdx]}`,
      soundCue: { type: 'complete' },
      variables: { maxLength: dp[maxIdx], sequence: optimalSeq.join(', '), completed: true },
      callStack: [{ name: 'lengthOfLIS.done', params: { maxLIS: dp[maxIdx] }, line: 12, isCurrent: true }],
      conditionEval: { expr: `i == n (${n} == ${n})`, result: true },
      scopeVariables: { maxLength: dp[maxIdx], sequence: optimalSeq.join(', ') },
      state: {
        array: [...arr],
        dp: [...dp],
        currentI: -1,
        currentJ: -1,
        maxLisLength: dp[maxIdx],
        optimalSequence: optimalSeq,
        actionType: 'NONE',
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<LISState>) => {
    const { array, dp, currentI, currentJ, maxLisLength, optimalSequence } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Max LIS Length: <span className="text-emerald-400 font-bold">{maxLisLength}</span>
          </div>
          {optimalSequence.length > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs font-mono text-emerald-300 font-bold shadow-lg">
              Optimal: [{optimalSequence.join(', ')}]
            </div>
          )}
        </div>

        {/* Dual Stacked Strip: Original Array & DP Array */}
        <div className="flex flex-col items-center max-w-4xl w-full gap-4">
          {/* Values Row */}
          <div className="flex flex-col items-start w-full">
            <span className="text-xs font-mono text-slate-400 mb-1">
              Array Elements <span className="text-slate-500">(arr[i])</span>:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto p-2 w-full">
              {array.map((val, idx) => {
                const isI = idx === currentI;
                const isJ = idx === currentJ;
                const inOptimal = optimalSequence.includes(val);

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-lg border-2 transition-all duration-200 ${
                        isI
                          ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 ring-2 ring-cyan-400/40 scale-105'
                          : isJ
                          ? 'border-amber-400 bg-amber-950/80 text-amber-200 ring-2 ring-amber-400/40 scale-105'
                          : inOptimal
                          ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                          : 'border-slate-800 bg-slate-900/90 text-white'
                      }`}
                    >
                      {val}
                    </div>
                    <div className="mt-1 flex flex-col items-center">
                      <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                      {isI && (
                        <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950 px-1 rounded border border-cyan-800">
                          i
                        </span>
                      )}
                      {isJ && (
                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950 px-1 rounded border border-amber-800">
                          j
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DP Values Row */}
          <div className="flex flex-col items-start w-full mt-2">
            <span className="text-xs font-mono text-slate-400 mb-1">
              DP Table <span className="text-slate-500">(dp[i] = LIS ending at i)</span>:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto p-2 w-full">
              {dp.map((val, idx) => {
                const isI = idx === currentI;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-base border-2 transition-all duration-200 ${
                        isI
                          ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300 ring-2 ring-emerald-400/30'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
