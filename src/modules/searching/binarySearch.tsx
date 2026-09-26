import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const binarySearchModule: AlgorithmModule<{ array: number[]; target: number }, ArrayStageState> = {
  id: 'binary-search',
  title: 'Binary Search (Logarithmic Halving)',
  category: 'searching',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Target at extreme bounds or not present in array',
  },
  theory: {
    overview:
      'Binary Search finds the position of a target value within a sorted array by comparing the target value to the middle element. It repeatedly halves the remaining search interval.',
    whyItWorks:
      'Because the array is monotonically sorted, comparing with the middle element immediately eliminates half of all remaining candidates without inspecting them.',
    invariant:
      'Loop Invariant: If target exists in the initial array, it is guaranteed to lie within the inclusive interval arr[low ... high].',
    pitfalls: [
      'Array MUST be pre-sorted; binary search produces incorrect results on unsorted data.',
      'Integer overflow in mid calculation: prefer low + (high - low) / 2 over (low + high) / 2.',
      'Off-by-one errors in while condition (low <= high vs low < high) and boundary updates (high = mid - 1).',
    ],
  },
  presets: [
    {
      id: 'target-present',
      label: 'Target Present (Find 42)',
      description: 'Standard successful search',
      data: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 42 },
    },
    {
      id: 'target-left',
      label: 'Target at Left (Find 8)',
      description: 'Search converges to left subarray',
      data: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 8 },
    },
    {
      id: 'target-absent',
      label: 'Target Absent (Find 50)',
      description: 'Search space reduces to zero',
      data: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 50 },
    },
  ],
  defaultInput: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 42 },
  codeSnippets: {
    python: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    typescript: `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return -1;
}`,
    cpp: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    java: `public int binarySearch(int[] arr, int target) {
    int low = 0;
    int high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    pseudocode: `function binarySearch(arr, target):
    low = 0
    high = length(arr) - 1
    while low <= high:
        mid = low + (high - low) / 2
        if arr[mid] == target:
            return mid
        else if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1 (Not Found)`,
  },

  generateTimeline: (input: { array: number[]; target: number }): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input.array].sort((a, b) => a - b);
    const target = input.target;
    let low = 0;
    let high = arr.length - 1;
    let foundIndex = -1;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Searching for target ${target} in sorted array of size ${arr.length}.`,
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: { low, high },
      },
    });

    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Calculated mid = ${low} + (${high} - ${low}) / 2 = index [${mid}]. Comparing arr[mid] (${arr[mid]}) with target (${target}).`,
        invariantStatus: {
          label: `Target ${target} is within arr[${low}..${high}]`,
          isValid: true,
        },
        isMilestone: true,
        milestoneTitle: `Inspect Mid [${mid}] = ${arr[mid]}`,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === mid ? 'comparing' : idx >= low && idx <= high ? 'active' : 'discarded',
          })),
          pointers: { low, mid, high },
        },
      });

      if (arr[mid] === target) {
        foundIndex = mid;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `🎯 Found target ${target} at index [${mid}]! Search terminates successfully.`,
          isMilestone: true,
          milestoneTitle: `Found Target at [${mid}]`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === mid ? 'sorted' : 'default',
            })),
            pointers: { target: mid },
          },
        });
        break;
      } else if (arr[mid] < target) {
        const discardedRange: [number, number] = [low, mid];
        low = mid + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Since arr[mid] (${arr[mid]}) < ${target}, target must be in right half. Discarding left range [${discardedRange[0]}..${discardedRange[1]}]. Setting low = ${low}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            discardedRange,
          },
        });
      } else {
        const discardedRange: [number, number] = [mid, high];
        high = mid - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Since arr[mid] (${arr[mid]}) > ${target}, target must be in left half. Discarding right range [${discardedRange[0]}..${discardedRange[1]}]. Setting high = ${high}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            discardedRange,
          },
        });
      }
    }

    if (foundIndex === -1) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 13,
        explanation: `Search space exhausted (low > high). Target ${target} is not present in the array. Returning -1.`,
        isMilestone: true,
        milestoneTitle: 'Target Not Found',
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'discarded' })),
          pointers: { low, high },
        },
      });
    }

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
