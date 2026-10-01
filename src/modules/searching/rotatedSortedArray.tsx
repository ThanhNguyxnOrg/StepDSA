import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface RotatedSearchInput {
  array: number[];
  target: number;
}

export interface RotatedSearchState {
  array: number[];
  target: number;
  low: number;
  mid: number | null;
  high: number;
  foundIndex: number | null;
  phase: 'check' | 'narrow_left' | 'narrow_right' | 'found' | 'not_found';
}

export const rotatedSortedArrayModule: AlgorithmModule<RotatedSearchInput, RotatedSearchState> = {
  id: 'rotated-sorted-array',
  title: 'Search in Rotated Sorted Array',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Rotated distinct array halved at each step',
  },
  theory: {
    overview:
      'Given a sorted array rotated at an unknown pivot, find a target value in O(log N) time by exploiting the property that at least one half (left or right of mid) is always strictly sorted.',
    whyItWorks:
      'If nums[low] <= nums[mid], the left subarray is sorted. We can test if target lies within [nums[low], nums[mid]]. Otherwise, the right subarray is sorted and symmetric logic applies.',
    invariant:
      'If the target is present in the original rotated array, it is guaranteed to reside within the index window [low, high].',
    pitfalls: [
      'Forgetting <= when comparing boundaries (e.g. nums[low] <= target && target < nums[mid]).',
      'Assuming the entire array is monotonic.',
    ],
  },
  codeSnippets: {
    python: `def search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        # Left half is sorted
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]:
                high = mid - 1
            else:
                low = mid + 1
        # Right half is sorted
        else:
            if nums[mid] < target <= nums[high]:
                low = mid + 1
            else:
                high = mid - 1
    return -1`,
    typescript: `function search(nums: number[], target: number): number {
  let low = 0, high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    // Left half sorted
    if (nums[low] <= nums[mid]) {
      if (nums[low] <= target && target < nums[mid]) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    } else { // Right half sorted
      if (nums[mid] < target && target <= nums[high]) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }
  return -1;
}`,
    cpp: `int search(vector<int>& nums, int target) {
    int low = 0, high = nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[low] <= nums[mid]) {
            if (nums[low] <= target && target < nums[mid])
                high = mid - 1;
            else
                low = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[high])
                low = mid + 1;
            else
                high = mid - 1;
        }
    }
    return -1;
}`,
    java: `public int search(int[] nums, int target) {
    int low = 0, high = nums.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[low] <= nums[mid]) {
            if (nums[low] <= target && target < nums[mid])
                high = mid - 1;
            else
                low = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[high])
                low = mid + 1;
            else
                high = mid - 1;
        }
    }
    return -1;
}`,
    pseudocode: `function search(nums, target):
    low <- 0, high <- N - 1
    while low <= high:
        mid <- (low + high) / 2
        if nums[mid] == target: return mid
        if nums[low] <= nums[mid]:
            if nums[low] <= target < nums[mid]: high <- mid - 1
            else: low <- mid + 1
        else:
            if nums[mid] < target <= nums[high]: low <- mid + 1
            else: high <- mid - 1
    return -1`,
  },
  defaultInput: { array: [4, 5, 6, 7, 0, 1, 2], target: 0 },
  presets: [
    { id: 'right', label: 'Target in Right Part', description: '[4, 5, 6, 7, 0, 1, 2], target = 0', data: { array: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
    { id: 'left', label: 'Target in Left Part', description: '[6, 7, 1, 2, 3, 4, 5], target = 7', data: { array: [6, 7, 1, 2, 3, 4, 5], target: 7 } },
    { id: 'miss', label: 'Target Missing', description: '[4, 5, 6, 7, 0, 1, 2], target = 3', data: { array: [4, 5, 6, 7, 0, 1, 2], target: 3 } },
  ],
  generateTimeline: (input: RotatedSearchInput): ExecutionFrame<RotatedSearchState>[] => {
    const frames: ExecutionFrame<RotatedSearchState>[] = [];
    const nums = input.array;
    const target = input.target;
    let low = 0;
    let high = nums.length - 1;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Search target ${target} in rotated sorted array of size ${nums.length}. Low = ${low}, High = ${high}. Modified Binary Search handles pivot break.`,
      isMilestone: true,
      milestoneTitle: 'Initialized Rotated Search',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'search(nums, target)', params: { target, low, high, n: nums.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { low, high, target, 'nums[low]': nums[low], 'nums[high]': nums[high] },
      conditionEval: { expr: 'low <= high', result: low <= high },
      state: {
        array: [...nums],
        target,
        low,
        mid: null,
        high,
        foundIndex: null,
        phase: 'check',
      },
    });

    let iter = 1;
    while (low <= high) {
      // Frame: Loop boundary condition check
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `[Iter ${iter}] Loop condition check: low (${low}) <= high (${high}). Search interval is [${low}..${high}] (${high - low + 1} elements).`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'search(nums, target)', params: { iter, low, high }, line: 3, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { iter, low, high, target, windowSize: high - low + 1 },
        conditionEval: { expr: `low <= high`, result: true },
        state: {
          array: [...nums],
          target,
          low,
          mid: null,
          high,
          foundIndex: null,
          phase: 'check',
        },
      });

      const mid = Math.floor((low + high) / 2);
      const isMatch = nums[mid] === target;

      // Frame: Midpoint inspection
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `[Iter ${iter}] Compute mid = ⌊(${low} + ${high}) / 2⌋ = ${mid} (value ${nums[mid]}). Comparing nums[mid] == target (${target}).`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'search(nums, target)', params: { iter, low, mid, high, midVal: nums[mid] }, line: 4, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { iter, low, mid, high, 'nums[mid]': nums[mid], target },
        conditionEval: { expr: `nums[${mid}] (${nums[mid]}) == target (${target})`, result: isMatch },
        state: {
          array: [...nums],
          target,
          low,
          mid,
          high,
          foundIndex: null,
          phase: 'check',
        },
      });

      if (isMatch) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `🎉 MATCH FOUND! nums[${mid}] == ${target}. Target located at index ${mid} in O(log N) time!`,
          isMilestone: true,
          milestoneTitle: `Target Found at [${mid}]`,
          soundCue: { type: 'sorted' },
          callStack: [
            { name: 'search(nums, target)', params: { foundIndex: mid }, line: 5, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { resultIndex: mid, target, iterations: iter },
          conditionEval: { expr: `nums[${mid}] == target`, result: true },
          state: {
            array: [...nums],
            target,
            low,
            mid,
            high,
            foundIndex: mid,
            phase: 'found',
          },
        });
        const total = frames.length;
        frames.forEach((f, idx) => {
          f.stepIndex = idx;
          f.totalSteps = total;
        });
        return frames;
      }

      // Check which half is sorted
      if (nums[low] <= nums[mid]) {
        // Left half sorted
        const inLeft = nums[low] <= target && target < nums[mid];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Left half [${low}..${mid}] is strictly sorted (${nums[low]} <= ${nums[mid]}). Target ${target} is ${
            inLeft ? 'WITHIN left range' : 'OUTSIDE left range'
          } [${nums[low]}..${nums[mid]}).`,
          soundCue: { type: 'step' },
          callStack: [
            { name: 'evaluateHalves()', params: { leftSorted: true, inLeft }, line: 6, isCurrent: true },
            { name: 'search()', params: { low, high }, line: 6 },
          ],
          variables: { sortedHalf: 'LEFT', range: `[${nums[low]}..${nums[mid]})`, target, inLeft },
          conditionEval: { expr: `nums[${low}] <= target && target < nums[${mid}]`, result: inLeft },
          state: {
            array: [...nums],
            target,
            low,
            mid,
            high,
            foundIndex: null,
            phase: inLeft ? 'narrow_left' : 'narrow_right',
          },
        });

        if (inLeft) {
          high = mid - 1;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: `Discarding right half [${mid}..${high + 1}]. Narrowing search window to [${low}..${high}].`,
            soundCue: { type: 'step' },
            callStack: [{ name: 'search()', params: { newLow: low, newHigh: high }, line: 7, isCurrent: true }],
            variables: { low, high, discarded: `[${mid}..${high + 1}]` },
            state: { array: [...nums], target, low, mid: null, high, foundIndex: null, phase: 'narrow_left' },
          });
        } else {
          low = mid + 1;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            explanation: `Discarding left half [${low - 1}..${mid}]. Narrowing search window to [${low}..${high}].`,
            soundCue: { type: 'step' },
            callStack: [{ name: 'search()', params: { newLow: low, newHigh: high }, line: 8, isCurrent: true }],
            variables: { low, high, discarded: `[${low - 1}..${mid}]` },
            state: { array: [...nums], target, low, mid: null, high, foundIndex: null, phase: 'narrow_right' },
          });
        }
      } else {
        // Right half sorted
        const inRight = nums[mid] < target && target <= nums[high];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Right half [${mid}..${high}] is sorted (${nums[mid]} <= ${nums[high]}). Target ${target} is ${
            inRight ? 'WITHIN right range' : 'OUTSIDE right range'
          } (${nums[mid]}..${nums[high]}].`,
          soundCue: { type: 'step' },
          callStack: [
            { name: 'evaluateHalves()', params: { rightSorted: true, inRight }, line: 11, isCurrent: true },
            { name: 'search()', params: { low, high }, line: 11 },
          ],
          variables: { sortedHalf: 'RIGHT', range: `(${nums[mid]}..${nums[high]}]`, target, inRight },
          conditionEval: { expr: `nums[${mid}] < target && target <= nums[${high}]`, result: inRight },
          state: {
            array: [...nums],
            target,
            low,
            mid,
            high,
            foundIndex: null,
            phase: inRight ? 'narrow_right' : 'narrow_left',
          },
        });

        if (inRight) {
          low = mid + 1;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            explanation: `Discarding left half [${low - 1}..${mid}]. Narrowing search window to [${low}..${high}].`,
            soundCue: { type: 'step' },
            callStack: [{ name: 'search()', params: { newLow: low, newHigh: high }, line: 12, isCurrent: true }],
            variables: { low, high, discarded: `[${low - 1}..${mid}]` },
            state: { array: [...nums], target, low, mid: null, high, foundIndex: null, phase: 'narrow_right' },
          });
        } else {
          high = mid - 1;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 13,
            explanation: `Discarding right half [${mid}..${high + 1}]. Narrowing search window to [${low}..${high}].`,
            soundCue: { type: 'step' },
            callStack: [{ name: 'search()', params: { newLow: low, newHigh: high }, line: 13, isCurrent: true }],
            variables: { low, high, discarded: `[${mid}..${high + 1}]` },
            state: { array: [...nums], target, low, mid: null, high, foundIndex: null, phase: 'narrow_left' },
          });
        }
      }

      iter++;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      explanation: `Search exhausted: low (${low}) > high (${high}). Target ${target} does not exist in array. Returning -1.`,
      soundCue: { type: 'complete' },
      callStack: [{ name: 'search()', params: { returnVal: -1 }, line: 16, isCurrent: true }],
      variables: { returnVal: -1, notFound: true, totalIterations: iter },
      conditionEval: { expr: 'low <= high', result: false },
      state: {
        array: [...nums],
        target,
        low,
        mid: null,
        high,
        foundIndex: null,
        phase: 'not_found',
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<RotatedSearchState>) => {
    const { array, target, low, mid, high, foundIndex } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Target Badge */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700 px-6 py-2.5 rounded-xl">
          <span className="text-xs font-mono text-slate-400">SEARCH TARGET:</span>
          <span className="text-xl font-bold font-mono text-amber-400">{target}</span>
        </div>

        {/* Array Bars */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl">
          {array.map((val, idx) => {
            const isMid = mid === idx;
            const isLow = low === idx;
            const isHigh = high === idx;
            const inRange = idx >= low && idx <= high;
            const isFound = foundIndex === idx;

            let barColor = 'border-slate-800 bg-slate-900/40 opacity-40';
            if (isFound) barColor = 'border-emerald-400 bg-emerald-950/60 ring-4 ring-emerald-400 opacity-100';
            else if (isMid) barColor = 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400 opacity-100';
            else if (inRange) barColor = 'border-indigo-500 bg-indigo-950/40 opacity-100';

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`relative flex flex-col items-center justify-center w-14 h-20 rounded-xl border-2 transition-all ${barColor}`}>
                  <span className="text-lg font-bold font-mono text-white">{val}</span>
                  <span className="text-[10px] text-slate-400 font-mono">[{idx}]</span>

                  {/* Pointer tag */}
                  <div className="absolute -top-3 flex gap-0.5">
                    {isLow && <span className="bg-sky-600 text-white text-[8px] px-1 py-0.2 rounded font-mono font-bold">L</span>}
                    {isMid && <span className="bg-amber-600 text-white text-[8px] px-1 py-0.2 rounded font-mono font-bold">M</span>}
                    {isHigh && <span className="bg-rose-600 text-white text-[8px] px-1 py-0.2 rounded font-mono font-bold">H</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
