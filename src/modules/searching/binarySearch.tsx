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
      id: 'target-multistep',
      label: 'Find 89 (3 Iteration Halving)',
      description: 'Search converges over 3 full bisection cycles',
      data: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 89 },
    },
    {
      id: 'target-left',
      label: 'Find 8 (Converges Left)',
      description: 'Search converges to left subarray',
      data: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 8 },
    },
    {
      id: 'target-mid',
      label: 'Find 42 (Middle Hit)',
      description: 'Target located on first mid probe',
      data: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 42 },
    },
    {
      id: 'target-absent',
      label: 'Find 50 (Target Absent)',
      description: 'Search space reduces to zero without match',
      data: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 50 },
    },
  ],
  defaultInput: { array: [3, 8, 15, 23, 31, 42, 56, 68, 77, 89, 94], target: 89 },
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

    const baseCallStack = [
      { name: 'binarySearch', params: { n: arr.length, target }, line: 2, isCurrent: true },
    ];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized Binary Search for target ${target} across sorted array of size ${arr.length}. Boundaries set to [low=0, high=${high}].`,
      action: 'INIT',
      callStack: baseCallStack,
      variables: { low, high, target, 'arr.length': arr.length, 'searchRange': `[${arr[low]} .. ${arr[high]}]` },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: { low, high },
      },
    });

    while (low <= high) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Checking loop invariant: low (${low}) <= high (${high}). Search window contains ${high - low + 1} candidate elements.`,
        action: 'CHECK_BOUNDS',
        callStack: baseCallStack,
        conditionEval: {
          expr: `${low} <= ${high}`,
          result: true,
        },
        variables: { low, high, windowSize: high - low + 1, target },
        invariantStatus: {
          label: `Target ${target} must be in [${arr[low]}..${arr[high]}] if present`,
          isValid: true,
        },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx >= low && idx <= high ? 'active' : 'discarded',
          })),
          pointers: { low, high },
        },
      });

      const mid = low + Math.floor((high - low) / 2);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Calculated probe index mid = ${low} + Math.floor((${high} - ${low}) / 2) = ${mid}. Inspecting candidate arr[${mid}] = ${arr[mid]}.`,
        action: 'CALCULATE_MID',
        isMilestone: true,
        milestoneTitle: `Inspect Mid [${mid}] = ${arr[mid]}`,
        callStack: baseCallStack,
        variables: { low, high, mid, 'arr[mid]': arr[mid], target },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === mid ? 'comparing' : idx >= low && idx <= high ? 'active' : 'discarded',
          })),
          pointers: { low, mid, high },
        },
      });

      // Comparison check
      const cmpResult = arr[mid] === target ? 'EQUAL' : arr[mid] < target ? 'LESS_THAN' : 'GREATER_THAN';
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Evaluating comparison: arr[${mid}] (${arr[mid]}) vs target (${target}) -> ${
          cmpResult === 'EQUAL' ? 'MATCH' : cmpResult === 'LESS_THAN' ? 'LESS (target is larger)' : 'GREATER (target is smaller)'
        }.`,
        action: 'COMPARE',
        callStack: baseCallStack,
        conditionEval: {
          expr: `arr[${mid}] (${arr[mid]}) === ${target}`,
          result: arr[mid] === target,
        },
        variables: { low, high, mid, 'arr[mid]': arr[mid], target, comparison: cmpResult },
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
          explanation: `🎯 Comparison match! arr[${mid}] (${arr[mid]}) === target (${target}). Search succeeded at index ${mid}!`,
          action: 'MATCH_FOUND',
          isMilestone: true,
          milestoneTitle: `Found Target at [${mid}]`,
          callStack: baseCallStack,
          conditionEval: {
            expr: `arr[${mid}] (${arr[mid]}) === ${target}`,
            result: true,
          },
          variables: { low, high, mid, 'arr[mid]': arr[mid], target, foundAt: mid },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === mid ? 'sorted' : idx >= low && idx <= high ? 'default' : 'discarded',
            })),
            pointers: { target: mid },
          },
        });
        break;
      } else if (arr[mid] < target) {
        const prevLow = low;
        low = mid + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Since arr[mid] (${arr[mid]}) < target (${target}), target must lie to the right. Discarding left segment [${prevLow}..${mid}]. Updating low = ${low}.`,
          action: 'DISCARD_LEFT',
          callStack: baseCallStack,
          conditionEval: {
            expr: `arr[${mid}] (${arr[mid]}) < ${target}`,
            result: true,
          },
          variables: { low, high, mid, 'arr[mid]': arr[mid], target, eliminatedCount: mid - prevLow + 1 },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            discardedRange: [prevLow, mid],
          },
        });
      } else {
        const prevHigh = high;
        high = mid - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Since arr[mid] (${arr[mid]}) > target (${target}), target must lie to the left. Discarding right segment [${mid}..${prevHigh}]. Updating high = ${high}.`,
          action: 'DISCARD_RIGHT',
          callStack: baseCallStack,
          conditionEval: {
            expr: `arr[${mid}] (${arr[mid]}) > ${target}`,
            result: true,
          },
          variables: { low, high, mid, 'arr[mid]': arr[mid], target, eliminatedCount: prevHigh - mid + 1 },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            discardedRange: [mid, prevHigh],
          },
        });
      }
    }

    if (foundIndex === -1) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 13,
        explanation: `Search space exhausted: low (${low}) > high (${high}). Target ${target} does not exist in the array. Returning -1.`,
        action: 'NOT_FOUND',
        isMilestone: true,
        milestoneTitle: 'Target Not Found',
        callStack: baseCallStack,
        conditionEval: {
          expr: `${low} <= ${high}`,
          result: false,
        },
        variables: { low, high, target, result: -1 },
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
