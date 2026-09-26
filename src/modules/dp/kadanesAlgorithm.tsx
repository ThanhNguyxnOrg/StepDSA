import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface KadaneInput {
  array: number[];
}

export interface KadaneState {
  array: number[];
  currentIndex: number;
  currentSum: number;
  maxSum: number;
  windowStart: number;
  windowEnd: number;
  bestStart: number;
  bestEnd: number;
  resetOccurred: boolean;
}

const defaultKadaneInput: KadaneInput = {
  array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
};

export const kadanesAlgorithmModule: AlgorithmModule<KadaneInput, KadaneState> = {
  id: 'kadanes-algorithm',
  title: "Kadane's Algorithm (Maximum Subarray Sum)",
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Guaranteed single-pass linear time O(N) across all input arrays',
  },
  theory: {
    overview:
      "Kadane's Algorithm solves the Maximum Contiguous Subarray problem in linear O(N) time and O(1) space. At each element, it decides whether to add the current element to the existing contiguous subarray or start a brand-new subarray beginning at the current element.",
    whyItWorks:
      'Optimal Substructure: The maximum subarray ending at index i is either arr[i] alone (if the accumulated sum prior to i is negative) or max_ending_here[i-1] + arr[i]. A negative prefix never contributes positively to any subsequent sum.',
    invariant:
      'At step i, currentSum holds the maximum contiguous subarray sum ending strictly at arr[i], and maxSum holds the global maximum encountered so far.',
    pitfalls: [
      'Initializing maxSum to 0 fails when all array elements are strictly negative; maxSum must initialize to arr[0] or -∞.',
      'Confusing contiguous subarray with non-contiguous subsequence.',
    ],
  },
  presets: [
    {
      id: 'leetcode-53',
      label: 'LeetCode 53 Standard',
      description: '[-2, 1, -3, 4, -1, 2, 1, -5, 4] (Max = 6: [4, -1, 2, 1])',
      data: defaultKadaneInput,
    },
    {
      id: 'all-negatives',
      label: 'All Negative Numbers',
      description: '[-8, -3, -6, -2, -5] (Max = -2)',
      data: { array: [-8, -3, -6, -2, -5] },
    },
    {
      id: 'alternating',
      label: 'Alternating High Spikes',
      description: '[5, -2, 3, -8, 7, 2, -1, 4]',
      data: { array: [5, -2, 3, -8, 7, 2, -1, 4] },
    },
  ],
  defaultInput: defaultKadaneInput,
  codeSnippets: {
    python: `def max_subarray(nums):
    current_sum = max_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
    typescript: `function maxSubArray(nums: number[]): number {
  let currentSum = nums[0];
  let maxSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
    cpp: `int maxSubArray(vector<int>& nums) {
    int currentSum = nums[0], maxSum = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        currentSum = max(nums[i], currentSum + nums[i]);
        maxSum = max(maxSum, currentSum);
    }
    return maxSum;
}`,
    java: `public int maxSubArray(int[] nums) {
    int currentSum = nums[0], maxSum = nums[0];
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    pseudocode: `function Kadane(A):
    currentSum = A[0]
    maxSum = A[0]
    for i = 1 to length(A) - 1:
        currentSum = max(A[i], currentSum + A[i])
        maxSum = max(maxSum, currentSum)
    return maxSum`,
  },

  generateTimeline: (input: KadaneInput): ExecutionFrame<KadaneState>[] => {
    const frames: ExecutionFrame<KadaneState>[] = [];
    const arr = input.array;
    const n = arr.length;

    let currentSum = arr[0];
    let maxSum = arr[0];
    let windowStart = 0;
    let windowEnd = 0;
    let bestStart = 0;
    let bestEnd = 0;

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Kadane's algorithm. Base case: index 0 (val: ${arr[0]}). currentSum = ${currentSum}, maxSum = ${maxSum}.`,
      isMilestone: true,
      milestoneTitle: `Base Case arr[0]=${arr[0]}`,
      soundCue: 'start',
      scopeVariables: { currentSum, maxSum, element: arr[0], index: 0 },
      state: {
        array: [...arr],
        currentIndex: 0,
        currentSum,
        maxSum,
        windowStart: 0,
        windowEnd: 0,
        bestStart: 0,
        bestEnd: 0,
        resetOccurred: false,
      },
    });

    for (let i = 1; i < n; i++) {
      const val = arr[i];
      const sumWithCurrent = currentSum + val;
      const shouldRestart = val > sumWithCurrent;

      if (shouldRestart) {
        currentSum = val;
        windowStart = i;
        windowEnd = i;
      } else {
        currentSum = sumWithCurrent;
        windowEnd = i;
      }

      const isNewGlobalMax = currentSum > maxSum;
      if (isNewGlobalMax) {
        maxSum = currentSum;
        bestStart = windowStart;
        bestEnd = windowEnd;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: shouldRestart
          ? `Element arr[${i}] (${val}) > accumulated sum (${sumWithCurrent}). Discarding negative prefix! Restarting new window at index ${i}.`
          : `Extending contiguous subarray: adding arr[${i}] (${val}). currentSum = ${currentSum}.`,
        soundCue: shouldRestart ? 'discard' : isNewGlobalMax ? 'swap' : 'step',
        isMilestone: isNewGlobalMax,
        milestoneTitle: isNewGlobalMax ? `New Max Sum (${maxSum})` : undefined,
        scopeVariables: {
          index: i,
          val,
          currentSum,
          maxSum,
          window: `[${windowStart} ... ${windowEnd}]`,
        },
        state: {
          array: [...arr],
          currentIndex: i,
          currentSum,
          maxSum,
          windowStart,
          windowEnd,
          bestStart,
          bestEnd,
          resetOccurred: shouldRestart,
        },
      });
    }

    const optimalSubarray = arr.slice(bestStart, bestEnd + 1);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `🎉 Kadane's Algorithm Complete! Maximum contiguous subarray sum is ${maxSum}. Subarray: [${optimalSubarray.join(', ')}] spanning indices [${bestStart} ... ${bestEnd}].`,
      isMilestone: true,
      milestoneTitle: `Max Sum = ${maxSum}`,
      soundCue: 'complete',
      scopeVariables: {
        maxSum,
        optimalSubarray: `[${optimalSubarray.join(', ')}]`,
        range: `[${bestStart} ... ${bestEnd}]`,
      },
      state: {
        array: [...arr],
        currentIndex: -1,
        currentSum,
        maxSum,
        windowStart: bestStart,
        windowEnd: bestEnd,
        bestStart,
        bestEnd,
        resetOccurred: false,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<KadaneState>) => {
    const { array, currentIndex, currentSum, maxSum, windowStart, windowEnd, bestStart, bestEnd, resetOccurred } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-8">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono shadow-md">
            Current Sum:{' '}
            <span className={`font-bold ${currentSum >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {currentSum}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono shadow-md">
            Max Sum So Far:{' '}
            <span className="text-emerald-400 font-bold">{maxSum}</span>
          </div>
          {resetOccurred && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-mono font-bold animate-pulse">
              Prefix Reset!
            </div>
          )}
        </div>

        {/* Array Visualization Strip */}
        <div className="flex items-center gap-2 overflow-x-auto p-4 max-w-4xl w-full justify-center">
          {array.map((val, idx) => {
            const isCurrent = idx === currentIndex;
            const inActiveWindow = idx >= windowStart && idx <= windowEnd;
            const inBestWindow = idx >= bestStart && idx <= bestEnd;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-14 h-16 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-cyan-400 bg-cyan-950/80 ring-2 ring-cyan-400/50 scale-110 z-10'
                      : inActiveWindow
                      ? 'border-amber-400/80 bg-amber-950/40 shadow-amber-500/20 shadow-md'
                      : inBestWindow
                      ? 'border-emerald-500/60 bg-emerald-950/30'
                      : 'border-slate-800 bg-slate-900/80 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                  <span
                    className={`font-mono font-bold text-base ${
                      val >= 0 ? 'text-white' : 'text-rose-300'
                    }`}
                  >
                    {val}
                  </span>
                </div>

                {/* Subarray indicator label */}
                <div className="mt-2 h-5 flex items-center">
                  {isCurrent && (
                    <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-1 rounded">
                      curr
                    </span>
                  )}
                  {!isCurrent && inActiveWindow && (
                    <span className="text-[8px] font-mono text-amber-400">●</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Active Contiguous Window</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>Global Maximum Window</span>
          </div>
        </div>
      </div>
    );
  },
};
