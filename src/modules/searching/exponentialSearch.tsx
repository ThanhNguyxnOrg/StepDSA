import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const exponentialSearchModule: AlgorithmModule<
  { array: number[]; target: number },
  ArrayStageState
> = {
  id: 'exponential-search',
  title: 'Exponential Search (Doubling Range O(log i))',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log i)',
    timeWorst: 'O(log i)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Target is located at index i with i near end of array',
  },
  theory: {
    overview:
      'Exponential Search (also known as Galloping Search or Doubling Search) finds the range where the target resides by repeatedly doubling an index boundary (1, 2, 4, 8...), then executes Binary Search within that bounded window.',
    whyItWorks:
      'Doubling takes O(log i) steps to bound the target index i. Binary search within [i/2, i] takes O(log(i/2)) = O(log i) steps, yielding an overall O(log i) runtime. This is exceptionally fast when the target is located near the beginning of large or infinite streams.',
    invariant:
      'Bounding Invariant: If target > arr[i/2], target must reside in the half-open window [i/2 ... min(i, n-1)].',
    pitfalls: [
      'Must check index 0 first before beginning the doubling loop starting at 1.',
      'Must clamp the upper bound with min(i, n - 1) to avoid index out-of-bounds.',
    ],
  },
  presets: [
    {
      id: 'target-early',
      label: 'Target Near Front (Find 17)',
      description: 'Bounded quickly at small index (i = 4)',
      data: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 17 },
    },
    {
      id: 'target-deep',
      label: 'Target Near End (Find 104)',
      description: 'Multiple doubling iterations up to i = 16',
      data: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 104 },
    },
    {
      id: 'target-index-zero',
      label: 'Target at Index 0 (Find 2)',
      description: 'Handled in O(1) before doubling loop',
      data: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 2 },
    },
  ],
  defaultInput: { array: [2, 5, 8, 12, 17, 23, 38, 45, 56, 72, 85, 91, 104, 118, 130], target: 17 },
  codeSnippets: {
    python: `def exponential_search(arr, target):
    n = len(arr)
    if arr[0] == target:
        return 0
    i = 1
    while i < n and arr[i] <= target:
        i = i * 2
    # Binary search within [i // 2, min(i, n - 1)]
    low, high = i // 2, min(i, n - 1)
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: low = mid + 1
        else: high = mid - 1
    return -1`,
    typescript: `function exponentialSearch(arr: number[], target: number): number {
  const n = arr.length;
  if (arr[0] === target) return 0;
  let i = 1;
  while (i < n && arr[i] <= target) {
    i *= 2;
  }
  let low = Math.floor(i / 2);
  let high = Math.min(i, n - 1);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    cpp: `int exponentialSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    if (arr[0] == target) return 0;
    int i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    int low = i / 2, high = min(i, n - 1);
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    java: `public int exponentialSearch(int[] arr, int target) {
    int n = arr.length;
    if (arr[0] == target) return 0;
    int i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    int low = i / 2, high = Math.min(i, n - 1);
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    pseudocode: `function exponentialSearch(arr, target):
    if arr[0] == target: return 0
    i <- 1
    while i < n and arr[i] <= target:
        i <- i * 2
    return binarySearch(arr, target, i / 2, min(i, n - 1))`,
  },
  generateTimeline: (input) => {
    const arr = [...input.array].sort((a, b) => a - b);
    const target = input.target;
    const n = arr.length;
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Checking base index arr[0] = ${arr[0]}. Target is ${target}.`,
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: i === 0 ? 'comparing' : 'default' })),
        pointers: { check: 0 },
        target,
      },
    });

    if (arr[0] === target) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Target ${target} matches arr[0] immediately!`,
        isMilestone: true,
        milestoneTitle: 'Target Found at Index 0',
        state: {
          array: arr.map((v, i) => ({ id: i, value: v, status: i === 0 ? 'sorted' : 'default' })),
          pointers: { found: 0 },
          target,
        },
      });
      const total = frames.length;
      return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
    }

    let i = 1;
    while (i < n && arr[i] <= target) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Exponential Doubling: arr[${i}] = ${arr[i]} <= target (${target}). Doubling index: next boundary = ${i * 2}.`,
        isMilestone: true,
        milestoneTitle: `Doubling Bound to i = ${i}`,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === i ? 'active' : idx < i ? 'discarded' : 'default',
          })),
          pointers: { bound: i },
          target,
        },
      });
      i *= 2;
    }

    let low = Math.floor(i / 2);
    let high = Math.min(i, n - 1);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      explanation: `Search range successfully bounded between [low=${low}, high=${high}]. Beginning Binary Search.`,
      isMilestone: true,
      milestoneTitle: 'Bounded Subarray Located',
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

    // Binary search phase
    let found = -1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `Binary Search mid = ${mid}, arr[${mid}] = ${arr[mid]}. Comparing with ${target}.`,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === mid ? 'comparing' : idx >= low && idx <= high ? 'active' : 'discarded',
          })),
          pointers: { low, mid, high },
          target,
        },
      });

      if (arr[mid] === target) {
        found = mid;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          explanation: `Target ${target} located at index ${mid}!`,
          isMilestone: true,
          milestoneTitle: 'Target Found',
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === mid ? 'sorted' : 'default',
            })),
            pointers: { found: mid },
            target,
          },
        });
        break;
      }

      if (arr[mid] < target) {
        low = mid + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          explanation: `arr[${mid}] (${arr[mid]}) < ${target}. Search right half [${low}..${high}].`,
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
        high = mid - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          explanation: `arr[${mid}] (${arr[mid]}) > ${target}. Search left half [${low}..${high}].`,
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

    if (found === -1) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 16,
        explanation: `Target ${target} not found within range. Search complete. Returning -1.`,
        state: {
          array: arr.map((v, idx) => ({ id: idx, value: v, status: 'discarded' })),
          pointers: {},
          target,
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
