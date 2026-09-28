import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SlidingWindowMaxState {
  nums: number[];
  k: number;
  currentIndex: number;
  dequeIndices: number[]; // monotonically decreasing values
  windowStart: number;
  windowEnd: number;
  maxArray: number[];
}

export const slidingWindowMaxModule: AlgorithmModule<
  { nums: number[]; k: number },
  SlidingWindowMaxState
> = {
  id: 'sliding-window-maximum',
  title: 'Sliding Window Maximum (Monotonic Deque O(N))',
  category: 'stack-queue',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(K)',
    worstCaseCondition: 'Each array element is pushed and popped from deque at most once',
  },
  theory: {
    overview:
      'Given an array of integers nums and a sliding window of size k moving from left to right, return the max sliding window values in linear O(N) time using a Monotonic Double-Ended Queue (Deque).',
    whyItWorks:
      'The deque maintains indices of candidate maxima in strictly decreasing order of their values. If a new element is greater than elements already in the deque, those smaller elements can never become the maximum of any future window, so they are popped from the back in O(1) amortized time.',
    invariant:
      'Monotonic Decreasing Invariant: For any two adjacent indices in the deque [i1, i2], i1 < i2 and nums[i1] >= nums[i2]. The front element deque[0] is always the maximum of the active window.',
    pitfalls: [
      'Storing values instead of indices in the deque (indices are required to detect when an element falls out of the sliding window).',
      'Forgetting that the window only yields output when currentIndex >= k - 1.',
    ],
  },
  presets: [
    {
      id: 'classic-leetcode',
      label: 'Standard: [1, 3, -1, -3, 5, 3, 6, 7], k = 3',
      description: 'Classic LeetCode 239 window sequence',
      data: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
    },
    {
      id: 'strictly-increasing',
      label: 'Strictly Increasing: [1, 2, 3, 4, 5, 6], k = 3',
      description: 'Deque repeatedly clears back, always holding 1 element',
      data: { nums: [1, 2, 3, 4, 5, 6], k: 3 },
    },
    {
      id: 'strictly-decreasing',
      label: 'Strictly Decreasing: [9, 8, 7, 6, 5, 4], k = 3',
      description: 'Deque retains full window k elements',
      data: { nums: [9, 8, 7, 6, 5, 4], k: 3 },
    },
  ],
  defaultInput: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
  codeSnippets: {
    python: `def maxSlidingWindow(nums, k):
    from collections import deque
    dq = deque() # Stores indices
    res = []
    for i, x in enumerate(nums):
        # 1. Remove out-of-bounds indices from front
        if dq and dq[0] < i - k + 1:
            dq.popleft()
        # 2. Maintain monotonic decreasing order
        while dq and nums[dq[-1]] < x:
            dq.pop()
        dq.append(i)
        # 3. Append window maximum
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res`,
    typescript: `function maxSlidingWindow(nums: number[], k: number): number[] {
  const deque: number[] = []; // Stores indices
  const res: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    if (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }
    deque.push(i);
    if (i >= k - 1) {
      res.push(nums[deque[0]]);
    }
  }
  return res;
}`,
    cpp: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> res;
    for (int i = 0; i < nums.size(); ++i) {
        if (!dq.empty() && dq.front() < i - k + 1) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) res.push_back(nums[dq.front()]);
    }
    return res;
}`,
    java: `public int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    int[] res = new int[n - k + 1];
    Deque<Integer> dq = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        if (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
        while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
        dq.offerLast(i);
        if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];
    }
    return res;
}`,
    pseudocode: `function maxSlidingWindow(nums, k):
    dq = empty deque (stores indices)
    result = empty list
    for i from 0 to len(nums) - 1:
        if dq.front < i - k + 1: dq.pop_front()
        while dq not empty and nums[dq.back] < nums[i]:
            dq.pop_back()
        dq.push_back(i)
        if i >= k - 1:
            result.append(nums[dq.front])
    return result`,
  },

  generateTimeline: (input: { nums: number[]; k: number }): ExecutionFrame<SlidingWindowMaxState>[] => {
    const nums = input.nums.length > 0 ? input.nums : [1, 3, -1, -3, 5, 3, 6, 7];
    const k = Math.max(1, Math.min(input.k || 3, nums.length));

    const frames: ExecutionFrame<SlidingWindowMaxState>[] = [];
    const deque: number[] = [];
    const results: number[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Monotonic Queue for array [${nums.join(', ')}] with window size k = ${k}. Deque is empty.`,
      variables: { windowSizeK: k, totalElements: nums.length },
      callStack: [
        { name: `maxSlidingWindow(nums, k=${k})`, params: { k, length: nums.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nums,
        k,
        currentIndex: -1,
        dequeIndices: [],
        windowStart: 0,
        windowEnd: -1,
        maxArray: [],
      },
    });

    for (let i = 0; i < nums.length; i++) {
      const val = nums[i];

      // 1. Evict stale elements out of window bounds
      if (deque.length > 0 && deque[0] < i - k + 1) {
        const evicted = deque.shift()!;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Index ${evicted} (value ${nums[evicted]}) is out of bounds for sliding window [${i - k + 1}..${i}]. Evict from deque front.`,
          variables: { evictedIndex: evicted, evictedVal: nums[evicted], windowStart: i - k + 1 },
          callStack: [
            { name: `popFront(${evicted})`, params: { idx: evicted, val: nums[evicted] }, line: 7, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nums,
            k,
            currentIndex: i,
            dequeIndices: [...deque],
            windowStart: Math.max(0, i - k + 1),
            windowEnd: i,
            maxArray: [...results],
          },
        });
      }

      // 2. Monotonic maintenance: pop back if smaller than nums[i]
      while (deque.length > 0 && nums[deque[deque.length - 1]] < val) {
        const popped = deque.pop()!;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `Current element nums[${i}] = ${val} is strictly greater than deque back nums[${popped}] = ${nums[popped]}. Pop back to preserve monotonic descending invariant.`,
          variables: { incomingVal: val, poppedIdx: popped, poppedVal: nums[popped] },
          callStack: [
            { name: `popBack(${popped})`, params: { incoming: val, popped: nums[popped] }, line: 10, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nums,
            k,
            currentIndex: i,
            dequeIndices: [...deque],
            windowStart: Math.max(0, i - k + 1),
            windowEnd: i,
            maxArray: [...results],
          },
        });
      }

      // 3. Push current index
      deque.push(i);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `Pushed index ${i} (value ${val}) to deque back. Active deque values: [${deque.map((idx) => nums[idx]).join(', ')}].`,
        variables: { pushedIdx: i, val, dequeSize: deque.length },
        callStack: [
          { name: `pushBack(${i})`, params: { idx: i, val }, line: 12, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          nums,
          k,
          currentIndex: i,
          dequeIndices: [...deque],
          windowStart: Math.max(0, i - k + 1),
          windowEnd: i,
          maxArray: [...results],
        },
      });

      // 4. Record window max
      if (i >= k - 1) {
        const maxVal = nums[deque[0]];
        results.push(maxVal);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          isMilestone: true,
          milestoneTitle: `Window [${i - k + 1}..${i}] Max = ${maxVal}`,
          explanation: `Full window [${i - k + 1}..${i}] formed. Deque front index ${deque[0]} holds current window maximum: ${maxVal}. Recorded to results.`,
          variables: { windowMax: maxVal, window: `[${i - k + 1}..${i}]`, totalOutputs: results.length },
          callStack: [
            { name: `recordWindowMax(${maxVal})`, params: { max: maxVal, frontIdx: deque[0] }, line: 15, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            nums,
            k,
            currentIndex: i,
            dequeIndices: [...deque],
            windowStart: i - k + 1,
            windowEnd: i,
            maxArray: [...results],
          },
        });
      }
    }

    // Final Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      isMilestone: true,
      milestoneTitle: 'Sliding Window Sweep Complete',
      explanation: `Completed scanning all ${nums.length} elements. Final window maxima sequence: [${results.join(', ')}].`,
      variables: { resultsCount: results.length, finalMax: results.join(', ') },
      callStack: [
        { name: 'complete()', params: { totalResults: results.length }, line: 16, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nums,
        k,
        currentIndex: nums.length,
        dequeIndices: [...deque],
        windowStart: nums.length - k,
        windowEnd: nums.length - 1,
        maxArray: [...results],
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<SlidingWindowMaxState>) => {
    const { nums, k, currentIndex, dequeIndices, windowStart, windowEnd, maxArray } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Window Width: <strong className="text-white">k = {k}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Computed Maxima: <strong className="text-white">{maxArray.length}</strong>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            Window Bounds: <strong className="text-cyan-300">[{windowStart} .. {windowEnd}]</strong>
          </div>
        </div>

        {/* Array Cells with Sliding Window Highlight */}
        <div className="w-full flex flex-col items-center my-auto">
          <div className="flex items-center gap-2 flex-wrap justify-center p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
            {nums.map((val, idx) => {
              const inWindow = idx >= windowStart && idx <= windowEnd;
              const isFrontMax = dequeIndices[0] === idx;
              const isCurrent = idx === currentIndex;

              return (
                <div key={idx} className="relative flex flex-col items-center mx-1">
                  {isFrontMax && (
                    <span className="absolute -top-7 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-500 text-slate-950 animate-bounce">
                      MAX
                    </span>
                  )}
                  {isCurrent && !isFrontMax && (
                    <span className="absolute -top-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                      i
                    </span>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-base transition-all duration-300 ${
                      isFrontMax
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-110 font-extrabold'
                        : inWindow
                        ? 'bg-cyan-950/60 border-2 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{val}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono mt-1">#{idx}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Split: Monotonic Deque & Result Stream */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Deque State */}
          <div className="flex flex-col p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 mb-2 uppercase tracking-wider">
              Monotonic Deque (Indices & Values)
            </span>
            <div className="flex items-center gap-2 overflow-x-auto min-h-[48px] p-2 bg-slate-900/60 rounded-xl border border-slate-800">
              {dequeIndices.length === 0 ? (
                <span className="text-xs font-mono text-slate-600 italic">Empty Deque</span>
              ) : (
                dequeIndices.map((idx, pos) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 ${
                      pos === 0
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 font-bold'
                    }`}
                  >
                    <span>nums[{idx}] = {nums[idx]}</span>
                    <span className="text-[9px] opacity-75">{pos === 0 ? 'FRONT' : 'BACK'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Results Output Array */}
          <div className="flex flex-col p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-mono font-bold text-emerald-400 mb-2 uppercase tracking-wider">
              Output Max Array ({maxArray.length})
            </span>
            <div className="flex items-center gap-2 overflow-x-auto min-h-[48px] p-2 bg-emerald-950/20 rounded-xl border border-emerald-900/40">
              {maxArray.length === 0 ? (
                <span className="text-xs font-mono text-slate-600 italic">Awaiting first window completion...</span>
              ) : (
                maxArray.map((m, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs shrink-0"
                  >
                    {m}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
