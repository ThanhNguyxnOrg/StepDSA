import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SlidingWindowInput {
  array: number[];
  k: number;
}

export interface SlidingWindowState {
  array: number[];
  k: number;
  windowStart: number;
  windowEnd: number;
  currentSum: number;
  maxSum: number;
  bestStart: number;
  phase: 'init' | 'slide' | 'done';
}

export const slidingWindowModule: AlgorithmModule<SlidingWindowInput, SlidingWindowState> = {
  id: 'sliding-window-max-sum',
  title: 'Sliding Window (Max Sum Subarray Size K)',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Constant window sliding across entire N elements',
  },
  theory: {
    overview:
      'Finds the maximum sum of any contiguous subarray of fixed size K. Instead of recomputing each subarray sum in O(K) time, sliding window updates the sum in O(1) time by adding the incoming element and subtracting the outgoing element.',
    whyItWorks:
      'Adjacent windows of length K share K - 1 overlapping elements. windowSum[i] = windowSum[i - 1] - array[i - 1] + array[i + K - 1].',
    invariant:
      'currentSum accurately reflects the exact sum of elements from array[windowStart] to array[windowEnd].',
    pitfalls: [
      'Off-by-one errors when establishing the initial window of size K.',
      'Assuming K is always strictly smaller than array length without boundary checks.',
    ],
  },
  codeSnippets: {
    python: `def max_sub_array_sum(arr, k):
    n = len(arr)
    if n < k: return 0
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, n):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum`,
    typescript: `function maxSubArraySum(arr: number[], k: number): number {
  if (arr.length < k) return 0;
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}`,
    cpp: `int maxSubArraySum(vector<int>& arr, int k) {
    if (arr.size() < k) return 0;
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];
    int maxSum = windowSum;
    for (size_t i = k; i < arr.size(); i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = max(maxSum, windowSum);
    }
    return maxSum;
}`,
    java: `public int maxSubArraySum(int[] arr, int k) {
    if (arr.length < k) return 0;
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];
    int maxSum = windowSum;
    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}`,
    pseudocode: `function maxSubArraySum(arr, k):
    windowSum <- sum(arr[0..k-1])
    maxSum <- windowSum
    for i from k to N - 1:
        windowSum <- windowSum + arr[i] - arr[i - k]
        maxSum <- max(maxSum, windowSum)
    return maxSum`,
  },
  defaultInput: { array: [2, 1, 5, 1, 3, 2, 8, 4], k: 3 },
  presets: [
    { id: 'standard', label: 'Array of 8 (K=3)', description: '[2, 1, 5, 1, 3, 2, 8, 4], K = 3', data: { array: [2, 1, 5, 1, 3, 2, 8, 4], k: 3 } },
    { id: 'alternating', label: 'Peaks (K=2)', description: '[10, 2, 15, 3, 20, 1], K = 2', data: { array: [10, 2, 15, 3, 20, 1], k: 2 } },
    { id: 'large_k', label: 'Wide Window (K=4)', description: '[1, 4, 2, 10, 23, 3, 1, 0, 20], K = 4', data: { array: [1, 4, 2, 10, 23, 3, 1, 0, 20], k: 4 } },
  ],
  generateTimeline: (input: SlidingWindowInput): ExecutionFrame<SlidingWindowState>[] => {
    const frames: ExecutionFrame<SlidingWindowState>[] = [];
    const arr = input.array;
    const k = input.k;
    const n = arr.length;

    // Step 0: Frame for initial window accumulation
    let initialSum = 0;
    for (let i = 0; i < k; i++) {
      initialSum += arr[i];
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 2,
        explanation: `Building initial window: Adding element arr[${i}] = ${arr[i]}. Cumulative sum = ${initialSum}.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'buildInitialWindow()', params: { i, 'arr[i]': arr[i], runningSum: initialSum }, line: 2, isCurrent: true },
          { name: 'maxSubArraySum(arr, k)', params: { k, n }, line: 1 },
        ],
        variables: { windowEnd: i, currentElement: arr[i], initialSum, k },
        state: {
          array: [...arr],
          k,
          windowStart: 0,
          windowEnd: i,
          currentSum: initialSum,
          maxSum: initialSum,
          bestStart: 0,
          phase: 'init',
        },
      });
    }

    let windowSum = initialSum;
    let maxSum = initialSum;
    let bestStart = 0;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initial window [0..${k - 1}] established! Base window sum = ${windowSum}. Initialized maxSum = ${maxSum}.`,
      isMilestone: true,
      milestoneTitle: `Initial Window Sum = ${windowSum}`,
      soundCue: { type: 'sorted' },
      callStack: [
        { name: 'maxSubArraySum(arr, k)', params: { windowSum, maxSum }, line: 4, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { windowRange: `[0..${k - 1}]`, windowSum, maxSum, bestStart: 0 },
      state: {
        array: [...arr],
        k,
        windowStart: 0,
        windowEnd: k - 1,
        currentSum: windowSum,
        maxSum,
        bestStart: 0,
        phase: 'init',
      },
    });

    for (let i = k; i < n; i++) {
      const incoming = arr[i];
      const outgoing = arr[i - k];
      const newStart = i - k + 1;

      // Sub-step 1: Expel outgoing element
      const sumAfterDrop = windowSum - outgoing;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `[Slide to index ${i}] Dropping outgoing left element arr[${i - k}] (${outgoing}). Intermediate sum: ${windowSum} - ${outgoing} = ${sumAfterDrop}.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'slideWindow(i)', params: { outgoingIdx: i - k, outgoingVal: outgoing }, line: 5, isCurrent: true },
          { name: 'maxSubArraySum(arr, k)', params: { i }, line: 5 },
        ],
        variables: { outgoingIndex: i - k, outgoingValue: outgoing, intermediateSum: sumAfterDrop, maxSum },
        state: {
          array: [...arr],
          k,
          windowStart: newStart,
          windowEnd: i - 1,
          currentSum: sumAfterDrop,
          maxSum,
          bestStart,
          phase: 'slide',
        },
      });

      // Sub-step 2: Admit incoming element
      windowSum = sumAfterDrop + incoming;
      const isNewMax = windowSum > maxSum;
      if (isNewMax) {
        maxSum = windowSum;
        bestStart = newStart;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `[Slide to index ${i}] Adding incoming right element arr[${i}] (${incoming}). New window [${newStart}..${i}] sum = ${windowSum}. ${
          isNewMax ? `🎉 NEW MAX FOUND: ${maxSum}!` : `Maintained previous max: ${maxSum}.`
        }`,
        isMilestone: isNewMax,
        milestoneTitle: isNewMax ? `New Max Sum = ${maxSum}` : undefined,
        soundCue: isNewMax ? { type: 'swap' } : { type: 'compare' },
        callStack: [
          { name: 'slideWindow(i)', params: { incomingIdx: i, incomingVal: incoming, windowSum }, line: 6, isCurrent: true },
          { name: 'maxSubArraySum(arr, k)', params: { i }, line: 5 },
        ],
        variables: {
          windowRange: `[${newStart}..${i}]`,
          incomingValue: incoming,
          currentSum: windowSum,
          maxSum,
          bestStart,
          isNewMax,
        },
        conditionEval: { expr: `windowSum (${windowSum}) > maxSum`, result: isNewMax },
        state: {
          array: [...arr],
          k,
          windowStart: newStart,
          windowEnd: i,
          currentSum: windowSum,
          maxSum,
          bestStart,
          phase: 'slide',
        },
      });
    }

    // Terminal Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      isMilestone: true,
      milestoneTitle: `Max Subarray Sum = ${maxSum}`,
      soundCue: { type: 'complete' },
      explanation: `🎉 Sliding Window traversal complete! Maximum sum subarray of length ${k} is ${maxSum} spanning indices [${bestStart}..${bestStart + k - 1}] (${arr
        .slice(bestStart, bestStart + k)
        .join(', ')}). Computed in O(N) time without redundant re-summing.`,
      callStack: [{ name: 'maxSubArraySum(arr, k)', params: { optimalSum: maxSum, bestStart }, line: 8, isCurrent: true }],
      variables: {
        maxSum,
        bestWindowRange: `[${bestStart}..${bestStart + k - 1}]`,
        elements: arr.slice(bestStart, bestStart + k),
        timeComplexity: 'O(N)',
      },
      state: {
        array: [...arr],
        k,
        windowStart: bestStart,
        windowEnd: bestStart + k - 1,
        currentSum: maxSum,
        maxSum,
        bestStart,
        phase: 'done',
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<SlidingWindowState>) => {
    const { array, k, windowStart, windowEnd, currentSum, maxSum, bestStart } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Metric Badges */}
        <div className="flex items-center gap-6 bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-2xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">WINDOW SIZE (K)</span>
            <span className="text-xl font-bold font-mono text-amber-400">{k}</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">CURRENT WINDOW SUM</span>
            <span className="text-xl font-bold font-mono text-sky-400">{currentSum}</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">MAX SUBARRAY SUM</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{maxSum}</span>
          </div>
        </div>

        {/* Array Cells with Sliding Frame Highlight */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl">
          {array.map((val, idx) => {
            const inCurrentWindow = idx >= windowStart && idx <= windowEnd;
            const inBestWindow = idx >= bestStart && idx < bestStart + k;

            let borderStyle = 'border-slate-800 bg-slate-900/40 text-slate-400';
            if (inCurrentWindow) {
              borderStyle = 'border-sky-400 bg-sky-950/60 text-white ring-2 ring-sky-400 font-bold';
            } else if (inBestWindow) {
              borderStyle = 'border-emerald-600 bg-emerald-950/30 text-emerald-200';
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`relative flex flex-col items-center justify-center w-14 h-20 rounded-xl border-2 transition-all ${borderStyle}`}>
                  <span className="text-xl font-mono">{val}</span>
                  <span className="text-[10px] font-mono text-slate-500 mt-1">[{idx}]</span>
                  {idx === windowStart && (
                    <span className="absolute -top-3 bg-sky-500 text-slate-950 text-[8px] px-1 rounded font-mono font-bold">START</span>
                  )}
                  {idx === windowEnd && (
                    <span className="absolute -bottom-3 bg-sky-500 text-slate-950 text-[8px] px-1 rounded font-mono font-bold">END</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
