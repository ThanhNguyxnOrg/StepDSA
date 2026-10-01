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

    const baseCallStack = [{ name: 'exponentialSearch', params: { n, target }, line: 1, isCurrent: true }];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Exponential Search for target ${target} in sorted array of ${n} elements.`,
      isMilestone: true,
      milestoneTitle: 'Search Initialized',
      soundCue: 'start',
      variables: { n, target, i: 1 },
      callStack: baseCallStack,
      conditionEval: { expr: `n > 0`, result: true },
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'default' })),
        pointers: { target },
        target,
      },
    });

    // Frame 1: Base check at index 0
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Checking base element arr[0] = ${arr[0]}. Testing if arr[0] == target (${target}).`,
      soundCue: 'compare',
      variables: { n, target, 'arr[0]': arr[0] },
      callStack: baseCallStack,
      conditionEval: { expr: `arr[0] === target`, result: arr[0] === target },
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
        explanation: `Target ${target} matches arr[0] immediately! Returning index 0 in O(1).`,
        isMilestone: true,
        milestoneTitle: 'Target Found at Index 0',
        soundCue: 'complete',
        variables: { foundIndex: 0, target },
        callStack: baseCallStack,
        conditionEval: { expr: `arr[0] === target`, result: true },
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
      // Comparison at current power of 2
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Exponential Doubling probe: arr[${i}] = ${arr[i]}. Evaluating arr[${i}] <= target (${target}).`,
        soundCue: 'compare',
        variables: { i, 'arr[i]': arr[i], target, nextCandidate: i * 2 },
        callStack: baseCallStack,
        conditionEval: { expr: `i < ${n} && arr[${i}] <= ${target}`, result: true },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === i ? 'comparing' : idx < i ? 'discarded' : 'default',
          })),
          pointers: { bound: i },
          target,
        },
      });

      const nextI = i * 2;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Condition met: ${arr[i]} <= ${target}. Doubling index jump: i = ${i} * 2 = ${nextI}.`,
        soundCue: 'step',
        variables: { prevI: i, i: nextI, target },
        callStack: baseCallStack,
        conditionEval: { expr: `i *= 2`, result: nextI },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === i ? 'active' : idx < i ? 'discarded' : 'default',
          })),
          pointers: { leapFrom: i, leapTo: Math.min(nextI, n - 1) },
          target,
        },
      });

      i = nextI;
    }

    // Bound overshoot or bound loop exit check
    const overshootExceeded = i < n ? `arr[${i}] (${arr[i]}) > ${target}` : `i (${i}) >= array length (${n})`;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      explanation: `Doubling loop terminated: ${overshootExceeded}. Target must reside between index ${Math.floor(i / 2)} and ${Math.min(i, n - 1)}.`,
      soundCue: 'pivot',
      variables: { i, 'arr[i]': i < n ? arr[i] : 'OOB', target },
      callStack: baseCallStack,
      conditionEval: { expr: `i < n && arr[i] <= target`, result: false },
      state: {
        array: arr.map((v, idx) => ({
          id: idx,
          value: v,
          status: idx === Math.min(i, n - 1) ? 'pivot' : idx < Math.floor(i / 2) ? 'discarded' : 'default',
        })),
        pointers: { overshoot: Math.min(i, n - 1) },
        target,
      },
    });

    let low = Math.floor(i / 2);
    let high = Math.min(i, n - 1);

    const bsCallStack = [
      { name: 'exponentialSearch', params: { n, target }, line: 10, isCurrent: false },
      { name: 'binarySearch', params: { low, high, target }, line: 11, isCurrent: true },
    ];

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      explanation: `Bounded Search Window: low = ${low}, high = ${high}. Subarray size = ${high - low + 1}. Invoking binarySearch.`,
      isMilestone: true,
      milestoneTitle: 'Subarray Bounded',
      soundCue: 'pivot',
      variables: { low, high, target, windowSpan: high - low + 1 },
      callStack: bsCallStack,
      conditionEval: { expr: `low <= high`, result: low <= high },
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

      // Mid calculation frame
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `Binary Search mid calculation: mid = floor((${low} + ${high}) / 2) = ${mid}. Inspecting arr[${mid}] = ${arr[mid]}.`,
        soundCue: 'compare',
        variables: { low, mid, high, 'arr[mid]': arr[mid], target },
        callStack: [
          { name: 'exponentialSearch', params: { n, target }, line: 10, isCurrent: false },
          { name: 'binarySearch', params: { low, high, target }, line: 12, isCurrent: true },
        ],
        conditionEval: { expr: `low <= high`, result: true },
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
          explanation: `🎯 Target ${target} successfully matched at index ${mid}! Exponential search complete in O(log i) time.`,
          isMilestone: true,
          milestoneTitle: `Target Found at Index ${mid}`,
          soundCue: 'complete',
          variables: { foundIndex: mid, value: arr[mid], target },
          callStack: [
            { name: 'exponentialSearch', params: { n, target }, line: 10, isCurrent: false },
            { name: 'binarySearch', params: { low, high, target }, line: 13, isCurrent: true },
          ],
          conditionEval: { expr: `arr[${mid}] === target`, result: true },
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
        const nextLow = mid + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          explanation: `arr[${mid}] (${arr[mid]}) < ${target}. Discarding left subarray [${low}..${mid}]. Adjusting low = ${nextLow}.`,
          soundCue: 'discard',
          variables: { oldLow: low, newLow: nextLow, high, mid, target },
          callStack: [
            { name: 'exponentialSearch', params: { n, target }, line: 10, isCurrent: false },
            { name: 'binarySearch', params: { low: nextLow, high, target }, line: 14, isCurrent: true },
          ],
          conditionEval: { expr: `arr[${mid}] < target`, result: true },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= nextLow && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low: nextLow, high },
            target,
          },
        });
        low = nextLow;
      } else {
        const nextHigh = mid - 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 15,
          explanation: `arr[${mid}] (${arr[mid]}) > ${target}. Discarding right subarray [${mid}..${high}]. Adjusting high = ${nextHigh}.`,
          soundCue: 'discard',
          variables: { low, oldHigh: high, newHigh: nextHigh, mid, target },
          callStack: [
            { name: 'exponentialSearch', params: { n, target }, line: 10, isCurrent: false },
            { name: 'binarySearch', params: { low, high: nextHigh, target }, line: 15, isCurrent: true },
          ],
          conditionEval: { expr: `arr[${mid}] > target`, result: true },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx <= nextHigh ? 'active' : 'discarded',
            })),
            pointers: { low, high: nextHigh },
            target,
          },
        });
        high = nextHigh;
      }
    }

    if (found === -1) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 16,
        explanation: `Target ${target} not found within range (low > high). Search terminated. Returning -1.`,
        isMilestone: true,
        milestoneTitle: 'Target Not Found',
        soundCue: 'complete',
        variables: { low, high, found: -1, target },
        callStack: baseCallStack,
        conditionEval: { expr: `low <= high`, result: false },
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
