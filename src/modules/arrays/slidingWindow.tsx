import React from 'react';
import { motion } from 'motion/react';
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
    const { array, k, windowStart, windowEnd, currentSum, maxSum, bestStart, phase } = frame.state;
    const leavingIdx = phase === 'slide' && windowStart > 0 ? windowStart - 1 : null;
    const enteringIdx = phase === 'slide' ? windowEnd : null;
    const maxVal = Math.max(...array.map((v) => Math.abs(v)), 1);

    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full min-h-[360px] gap-5 select-none">
        {/* Metric HUD + O(1) Sliding Delta Formula */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-5 bg-[#111827] border border-[#1F293D] px-5 py-2.5 rounded-2xl shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase">Window Size (k)</span>
              <span className="text-lg font-extrabold font-mono text-amber-400 tabular-nums">{k}</span>
            </div>
            <div className="w-px h-7 bg-[#1F293D]" />
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase">Window Sum</span>
              <span className="text-lg font-extrabold font-mono text-cyan-400 tabular-nums">{currentSum}</span>
            </div>
            <div className="w-px h-7 bg-[#1F293D]" />
            <div className="flex flex-col items-center">
              <span className="text-[9.5px] font-mono text-slate-400 uppercase">Best Max Sum</span>
              <span className="text-lg font-extrabold font-mono text-emerald-400 tabular-nums">{maxSum}</span>
            </div>
          </div>

          {leavingIdx !== null && enteringIdx !== null && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111827] border border-[#1F293D] text-xs font-mono">
              <span className="text-slate-400">O(1) Slide:</span>
              <span
                style={{
                  backgroundColor: 'var(--sem-swapping-bg)',
                  color: 'var(--sem-swapping-text)',
                  borderColor: 'var(--sem-swapping-border)',
                }}
                className="px-1.5 py-0.5 rounded border font-bold tabular-nums"
              >
                -{array[leavingIdx]}
              </span>
              <span
                style={{
                  backgroundColor: 'var(--sem-sorted-bg)',
                  color: 'var(--sem-sorted-text)',
                  borderColor: 'var(--sem-sorted-border)',
                }}
                className="px-1.5 py-0.5 rounded border font-bold tabular-nums"
              >
                +{array[enteringIdx]}
              </span>
              <span className="text-slate-400">=</span>
              <strong className="text-cyan-400 tabular-nums">{currentSum}</strong>
            </div>
          )}
        </div>

        {/* Array Cells with Proportional Mini-Bars, Sliding Bracket & Leaving/Entering Badges */}
        <div className="flex flex-wrap items-end justify-center gap-2 max-w-4xl pt-6 pb-4">
          {array.map((val, idx) => {
            const inCurrentWindow = idx >= windowStart && idx <= windowEnd;
            const inBestWindow = idx >= bestStart && idx < bestStart + k;
            const isLeaving = idx === leavingIdx;
            const isEntering = idx === enteringIdx;
            const miniBarH = Math.max(10, Math.round((Math.abs(val) / maxVal) * 48));

            const cellStyle: React.CSSProperties = isEntering
              ? {
                  backgroundColor: 'var(--sem-sorted-bg)',
                  borderColor: 'var(--sem-sorted-border)',
                  color: 'var(--sem-sorted-text)',
                }
              : inCurrentWindow
              ? {
                  backgroundColor: 'var(--sem-active-bg)',
                  borderColor: 'var(--sem-active-border)',
                  color: 'var(--sem-active-text)',
                }
              : isLeaving
              ? {
                  backgroundColor: 'var(--sem-swapping-bg)',
                  borderColor: 'var(--sem-swapping-border)',
                  color: 'var(--sem-swapping-text)',
                }
              : inBestWindow
              ? {
                  backgroundColor: 'var(--sem-sorted-bg)',
                  borderColor: 'var(--sem-sorted-border)',
                  color: 'var(--sem-sorted-text)',
                }
              : {
                  backgroundColor: 'var(--sem-default-cell-bg)',
                  borderColor: 'var(--sem-default-border)',
                  color: 'var(--sem-default-text)',
                };

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 relative">
                {/* Leaving / Entering Delta Indicator */}
                <div className="h-5 flex items-center justify-center">
                  {isLeaving && (
                    <span
                      style={{
                        backgroundColor: 'var(--sem-swapping-solid)',
                        color: 'var(--sem-swapping-on-solid)',
                      }}
                      className="theme-solid-badge px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold whitespace-nowrap"
                    >
                      OUT -{val}
                    </span>
                  )}
                  {isEntering && (
                    <span
                      style={{
                        backgroundColor: 'var(--sem-sorted-solid)',
                        color: 'var(--sem-sorted-on-solid)',
                      }}
                      className="theme-solid-badge px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold whitespace-nowrap"
                    >
                      IN +{val}
                    </span>
                  )}
                  {!isLeaving && !isEntering && idx === windowStart && (
                    <span
                      style={{
                        backgroundColor: 'var(--sem-active-solid)',
                        color: 'var(--sem-active-on-solid)',
                      }}
                      className="theme-solid-badge px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold"
                    >
                      L={idx}
                    </span>
                  )}
                </div>

                {/* Proportional Mini-Bar */}
                <div className="h-12 w-14 flex items-end justify-center px-2">
                  <motion.div
                    initial={false}
                    animate={{ height: miniBarH }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    style={{
                      backgroundColor: inCurrentWindow
                        ? 'var(--sem-active-solid)'
                        : isLeaving
                        ? 'var(--sem-swapping-solid)'
                        : inBestWindow
                        ? 'var(--sem-sorted-solid)'
                        : 'var(--sem-default-border)',
                    }}
                    className="w-7 rounded-t-md opacity-80"
                  />
                </div>

                {/* Memory Cell */}
                <motion.div
                  layout
                  animate={{ scale: inCurrentWindow ? 1.04 : 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  style={cellStyle}
                  className={`relative flex flex-col items-center justify-center w-14 h-16 rounded-xl border-2 font-mono font-bold transition-shadow ${
                    inCurrentWindow ? 'ring-2 ring-[#06B6D4]/40 shadow-md' : ''
                  } ${isLeaving ? 'border-dashed opacity-75' : ''}`}
                >
                  <span className="text-lg font-extrabold tabular-nums leading-none">{val}</span>
                  <span className="text-[10px] opacity-65 mt-1 tabular-nums">[{idx}]</span>
                </motion.div>

                {/* Active Window Range Bar */}
                <div className="h-5 flex items-center justify-center w-full">
                  {inCurrentWindow ? (
                    <div
                      style={{ backgroundColor: 'var(--sem-active-solid)' }}
                      className="w-full h-1.5 rounded-full"
                    />
                  ) : inBestWindow ? (
                    <span className="text-[8.5px] font-mono font-bold text-emerald-400">BEST</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
