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
      explanation: `Search target ${target} in rotated sorted array. Initialize low = 0, high = ${high}.`,
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

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Compute mid = ${mid} (value ${nums[mid]}). Test if nums[mid] == target.`,
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

      if (nums[mid] === target) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Target ${target} found at index ${mid}!`,
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
          explanation: `Left half [${low}..${mid}] is sorted (${nums[low]} <= ${nums[mid]}). Target ${target} is ${inLeft ? 'INSIDE' : 'OUTSIDE'} [${nums[low]}..${nums[mid]}).`,
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
        } else {
          low = mid + 1;
        }
      } else {
        // Right half sorted
        const inRight = nums[mid] < target && target <= nums[high];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Right half [${mid}..${high}] is sorted (${nums[mid]} <= ${nums[high]}). Target ${target} is ${inRight ? 'INSIDE' : 'OUTSIDE'} (${nums[mid]}..${nums[high]}].`,
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
        } else {
          high = mid - 1;
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: `Target ${target} not found in the array (low > high). Return -1.`,
      state: {
        array: [...nums],
        target,
        low,
        mid: null,
        high,
        foundIndex: -1,
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
