import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const ternarySearchModule: AlgorithmModule<{ array: number[]; target: number }, ArrayStageState> = {
  id: 'ternary-search',
  title: 'Ternary Search (Tri-Sectioning O(log3 N))',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log3 N)',
    timeWorst: 'O(log3 N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Target is located at extreme bounds or not present in array',
  },
  theory: {
    overview:
      'Ternary Search is a divide-and-conquer search algorithm that splits the active search space into three equal segments using two midpoints (mid1 and mid2), eliminating 1/3 or 2/3 of remaining candidates per iteration.',
    whyItWorks:
      'By comparing target against arr[mid1] and arr[mid2], the algorithm immediately determines which of the 3 intervals ([low..mid1-1], [mid1+1..mid2-1], or [mid2+1..high]) the target must occupy.',
    invariant:
      'Ternary Invariant: If target exists, low <= targetIndex <= high must hold.',
    pitfalls: [
      'While it reduces iterations to log3(N), it requires 2 comparisons per step, so 2 * log3(N) ≈ 1.26 * log2(N) which is slightly more comparisons than binary search for sorted lists.',
      'Off-by-one errors when partitioning mid1 and mid2.',
    ],
  },
  presets: [
    {
      id: 'target-mid-segment',
      label: 'Find 45 (Middle Third)',
      description: 'Lies in the center segment between mid1 and mid2',
      data: { array: [5, 12, 23, 34, 45, 56, 67, 78, 89, 99], target: 45 },
    },
    {
      id: 'target-first-segment',
      label: 'Find 12 (First Third)',
      description: 'Discards right two-thirds in first iteration',
      data: { array: [5, 12, 23, 34, 45, 56, 67, 78, 89, 99], target: 12 },
    },
    {
      id: 'target-absent',
      label: 'Target Absent (Find 50)',
      description: 'Narrows search space down to empty interval',
      data: { array: [5, 12, 23, 34, 45, 56, 67, 78, 89, 99], target: 50 },
    },
  ],
  defaultInput: { array: [5, 12, 23, 34, 45, 56, 67, 78, 89, 99], target: 45 },
  codeSnippets: {
    python: `def ternary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid1 = low + (high - low) // 3
        mid2 = high - (high - low) // 3
        if arr[mid1] == target: return mid1
        if arr[mid2] == target: return mid2
        if target < arr[mid1]:
            high = mid1 - 1
        elif target > arr[mid2]:
            low = mid2 + 1
        else:
            low = mid1 + 1
            high = mid2 - 1
    return -1`,
    typescript: `function ternarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid1 = low + Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);
    if (arr[mid1] === target) return mid1;
    if (arr[mid2] === target) return mid2;
    if (target < arr[mid1]) {
      high = mid1 - 1;
    } else if (target > arr[mid2]) {
      low = mid2 + 1;
    } else {
      low = mid1 + 1;
      high = mid2 - 1;
    }
  }
  return -1;
}`,
    cpp: `int ternarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid1 = low + (high - low) / 3;
        int mid2 = high - (high - low) / 3;
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else { low = mid1 + 1; high = mid2 - 1; }
    }
    return -1;
}`,
    java: `public int ternarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid1 = low + (high - low) / 3;
        int mid2 = high - (high - low) / 3;
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        if (target < arr[mid1]) high = mid1 - 1;
        else if (target > arr[mid2]) low = mid2 + 1;
        else { low = mid1 + 1; high = mid2 - 1; }
    }
    return -1;
}`,
    pseudocode: `function ternarySearch(arr, target):
    low <- 0, high <- length(arr) - 1
    while low <= high:
        mid1 <- low + (high - low) / 3
        mid2 <- high - (high - low) / 3
        if arr[mid1] == target: return mid1
        if arr[mid2] == target: return mid2
        if target < arr[mid1]: high <- mid1 - 1
        else if target > arr[mid2]: low <- mid2 + 1
        else: low <- mid1 + 1, high <- mid2 - 1
    return -1`,
  },
  generateTimeline: (input) => {
    const arr = [...input.array].sort((a, b) => a - b);
    const target = input.target;
    let low = 0;
    let high = arr.length - 1;
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized Ternary Search on sorted array of size ${arr.length}. Target: ${target}.`,
      variables: { low, high, target },
      callStack: [{ name: 'ternarySearch(arr, target)', params: { target, low, high }, line: 2, isCurrent: true }, { name: 'main()', params: {}, line: 1 }],
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: { low, high },
        target,
      },
    });

    while (low <= high) {
      const mid1 = low + Math.floor((high - low) / 3);
      const mid2 = high - Math.floor((high - low) / 3);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Tri-section points: mid1 = ${mid1} (val ${arr[mid1]}), mid2 = ${mid2} (val ${arr[mid2]}). Comparing with ${target}.`,
        variables: { low, mid1, mid2, high, target },
        callStack: [{ name: 'ternarySearch(arr, target)', params: { mid1, mid2, target }, line: 5, isCurrent: true }, { name: 'main()', params: {}, line: 1 }],
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status:
              idx === mid1 || idx === mid2
                ? 'comparing'
                : idx >= low && idx <= high
                ? 'active'
                : 'discarded',
          })),
          pointers: { low, mid1, mid2, high },
          target,
        },
      });

      if (arr[mid1] === target) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Target ${target} located at mid1 (index ${mid1})!`,
          isMilestone: true,
          milestoneTitle: 'Target Found at mid1',
          variables: { foundIndex: mid1, target },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === mid1 ? 'sorted' : 'default',
            })),
            pointers: { found: mid1 },
            target,
          },
        });
        const total = frames.length;
        return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
      }

      if (arr[mid2] === target) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Target ${target} located at mid2 (index ${mid2})!`,
          isMilestone: true,
          milestoneTitle: 'Target Found at mid2',
          variables: { foundIndex: mid2, target },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === mid2 ? 'sorted' : 'default',
            })),
            pointers: { found: mid2 },
            target,
          },
        });
        const total = frames.length;
        return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
      }

      if (target < arr[mid1]) {
        high = mid1 - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Target ${target} < arr[mid1] (${arr[mid1]}): target must reside in 1st segment. New high = ${high}.`,
          variables: { low, high, target },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            target,
          },
        });
      } else if (target > arr[mid2]) {
        low = mid2 + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Target ${target} > arr[mid2] (${arr[mid2]}): target must reside in 3rd segment. New low = ${low}.`,
          variables: { low, high, target },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            target,
          },
        });
      } else {
        low = mid1 + 1;
        high = mid2 - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          explanation: `arr[mid1] < ${target} < arr[mid2]: target must reside in middle segment [${low}..${high}].`,
          variables: { low, high, target },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low, high },
            target,
          },
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `Search range exhausted (low > high). Target ${target} not found. Returning -1.`,
      variables: { result: -1, target },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'discarded' })),
        pointers: {},
        target,
      },
    });

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
