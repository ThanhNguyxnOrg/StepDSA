import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const quickselectModule: AlgorithmModule<{ array: number[]; k: number }, ArrayStageState> = {
  id: 'quickselect',
  title: 'Quickselect (k-th Order Statistic O(N))',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Worst-case pivot selection (already sorted with extremal pivot)',
  },
  theory: {
    overview:
      'Quickselect is a selection algorithm to find the k-th smallest element in an unordered array. Like Quicksort, it partitions the array around a pivot, but recurses only into the partition containing the target rank k.',
    whyItWorks:
      'After partitioning around pivot p at index pivotIdx, all elements to the left are <= arr[pivotIdx], and all to the right are >= arr[pivotIdx]. If pivotIdx == k, we are done! If k < pivotIdx, the element is in the left subarray; otherwise in the right. Average runtime: N + N/2 + N/4 + ... = 2N = O(N).',
    invariant:
      'Partition Invariant: arr[low ... pivotIdx - 1] <= arr[pivotIdx] <= arr[pivotIdx + 1 ... high].',
    pitfalls: [
      'Confusing 0-indexed rank with 1-indexed k (k-th smallest).',
      'Choosing deterministic bad pivots (leads to O(N²) worst-case).',
    ],
  },
  presets: [
    {
      id: 'median',
      label: 'Find Median (k = 3 in 7 items)',
      description: 'Finds 3rd index (0-indexed) element in [7, 10, 4, 3, 20, 15, 8]',
      data: { array: [7, 10, 4, 3, 20, 15, 8], k: 3 },
    },
    {
      id: 'smallest',
      label: 'Find Minimum (k = 0)',
      description: 'Converges directly to the smallest element',
      data: { array: [25, 12, 48, 6, 33, 19], k: 0 },
    },
    {
      id: 'kth-largest',
      label: 'Find 2nd Largest (k = 5 in 7 items)',
      description: 'k = 5 in array of 7 elements',
      data: { array: [14, 3, 9, 21, 5, 18, 12], k: 5 },
    },
  ],
  defaultInput: { array: [7, 10, 4, 3, 20, 15, 8], k: 3 },
  codeSnippets: {
    python: `def quickselect(arr, k):
    def partition(low, high):
        pivot = arr[high]
        i = low
        for j in range(low, high):
            if arr[j] <= pivot:
                arr[i], arr[j] = arr[j], arr[i]
                i += 1
        arr[i], arr[high] = arr[high], arr[i]
        return i

    low, high = 0, len(arr) - 1
    while low <= high:
        p_idx = partition(low, high)
        if p_idx == k:
            return arr[p_idx]
        elif p_idx < k:
            low = p_idx + 1
        else:
            high = p_idx - 1
    return -1`,
    typescript: `function quickselect(arr: number[], k: number): number {
  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low;
    for (let j = low; j < high; ++j) {
      if (arr[j] <= pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
    }
    [arr[i], arr[high]] = [arr[high], arr[i]];
    return i;
  }

  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const pIdx = partition(low, high);
    if (pIdx === k) return arr[pIdx];
    if (pIdx < k) low = pIdx + 1;
    else high = pIdx - 1;
  }
  return -1;
}`,
    cpp: `int quickselect(vector<int>& arr, int k) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int pivot = arr[high], i = low;
        for (int j = low; j < high; ++j) {
            if (arr[j] <= pivot) swap(arr[i++], arr[j]);
        }
        swap(arr[i], arr[high]);
        if (i == k) return arr[i];
        if (i < k) low = i + 1;
        else high = i - 1;
    }
    return -1;
}`,
    java: `public int quickselect(int[] arr, int k) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int pivot = arr[high], i = low;
        for (int j = low; j < high; ++j) {
            if (arr[j] <= pivot) {
                int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
                i++;
            }
        }
        int t = arr[i]; arr[i] = arr[high]; arr[high] = t;
        if (i == k) return arr[i];
        if (i < k) low = i + 1;
        else high = i - 1;
    }
    return -1;
}`,
    pseudocode: `function quickselect(arr, k):
    low <- 0, high <- length(arr) - 1
    while low <= high:
        pIdx <- partition(arr, low, high)
        if pIdx == k: return arr[pIdx]
        else if pIdx < k: low <- pIdx + 1
        else: high <- pIdx - 1`,
  },
  generateTimeline: (input) => {
    const arr = [...input.array];
    const k = Math.max(0, Math.min(input.k, arr.length - 1));
    const n = arr.length;
    let low = 0;
    let high = n - 1;
    const finalPlaced = new Set<number>();
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    const baseCallStack = [{ name: 'quickselect', params: { k, n }, line: 1, isCurrent: true }];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 12,
      isMilestone: true,
      milestoneTitle: 'Quickselect Initialized',
      soundCue: { type: 'start' },
      variables: { targetK: k, low, high, n },
      callStack: baseCallStack,
      conditionEval: { expr: `k >= 0 && k < ${n}`, result: true },
      explanation: `Initialized Quickselect. Searching for target rank k = ${k} (0-indexed). Array size = ${n}.`,
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: { low, high, targetK: k },
      },
    });

    while (low <= high) {
      const pivot = arr[high];
      let i = low;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        isMilestone: true,
        milestoneTitle: `Pivot ${pivot} Selected`,
        soundCue: { type: 'pivot' },
        variables: { pivot, low, high, targetK: k },
        callStack: [{ name: 'partition', params: { low, high, pivot }, line: 4, isCurrent: true }],
        conditionEval: { expr: `low <= high (${low} <= ${high})`, result: true },
        explanation: `Subarray [${low}..${high}]: Selected pivot arr[${high}] = ${pivot}. Partitioning around pivot.`,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: finalPlaced.has(idx)
              ? 'sorted'
              : idx === high
              ? 'pivot'
              : idx >= low && idx < high
              ? 'active'
              : 'discarded',
          })),
          pointers: { low, high, pivotIdx: high, targetK: k },
        },
      });

      for (let j = low; j < high; ++j) {
        const isLessOrEqual = arr[j] <= pivot;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          soundCue: { type: 'compare' },
          variables: { 'arr[j]': arr[j], pivot, i, j, isLessOrEqual },
          callStack: [{ name: 'compare', params: { j, pivot }, line: 7, isCurrent: true }],
          conditionEval: { expr: `arr[${j}] <= pivot (${arr[j]} <= ${pivot})`, result: isLessOrEqual },
          explanation: `Comparing arr[${j}] (${arr[j]}) with pivot (${pivot}).`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: finalPlaced.has(idx)
                ? 'sorted'
                : idx === high
                ? 'pivot'
                : idx === j
                ? 'comparing'
                : idx >= low && idx < high
                ? 'active'
                : 'discarded',
            })),
            pointers: { low, i, j, high, targetK: k },
          },
        });

        if (isLessOrEqual) {
          if (i !== j) {
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 8,
              soundCue: { type: 'swap' },
              variables: { swapped: true, indexA: i, indexB: j, valA: arr[i], valB: arr[j] },
              callStack: [{ name: 'swap', params: { i, j }, line: 8, isCurrent: true }],
              conditionEval: { expr: `i !== j (${i} !== ${j})`, result: true },
              explanation: `Swapped arr[${i}] (${temp}) with arr[${j}] (${arr[i]}) so smaller element is at left partition.`,
              state: {
                array: arr.map((v, idx) => ({
                  id: idx,
                  value: v,
                  status: idx === i || idx === j ? 'swapping' : idx === high ? 'pivot' : 'default',
                })),
                pointers: { low, i, j, high, targetK: k },
              },
            });
          }
          i++;
        }
      }

      // Swap pivot to i
      const temp = arr[i];
      arr[i] = arr[high];
      arr[high] = temp;
      const pIdx = i;
      finalPlaced.add(pIdx);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        isMilestone: true,
        milestoneTitle: `Pivot Placed at Index ${pIdx}`,
        soundCue: { type: 'sorted' },
        variables: { pIdx, targetK: k, pivotVal: arr[pIdx], rankMatch: pIdx === k },
        callStack: [{ name: 'partitionComplete', params: { pIdx, k }, line: 10, isCurrent: true }],
        conditionEval: { expr: `pIdx === k (${pIdx} === ${k})`, result: pIdx === k },
        explanation: `Placed pivot ${arr[pIdx]} at its final sorted rank index ${pIdx}. Comparing pIdx (${pIdx}) with target k (${k}).`,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === pIdx ? 'sorted' : idx >= low && idx <= high ? 'active' : 'discarded',
          })),
          pointers: { low, high, pIdx, targetK: k },
        },
      });

      if (pIdx === k) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          isMilestone: true,
          milestoneTitle: `Found k-th Element: ${arr[pIdx]}`,
          soundCue: { type: 'complete' },
          variables: { found: true, k, answer: arr[pIdx] },
          callStack: baseCallStack,
          conditionEval: { expr: `pIdx === k`, result: true },
          explanation: `Rank match found! Pivot index ${pIdx} == k (${k}). The k-th smallest element is ${arr[pIdx]}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === k ? 'sorted' : 'default',
            })),
            pointers: { targetK: k },
          },
        });
        const total = frames.length;
        return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
      }

      if (pIdx < k) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          soundCue: { type: 'step' },
          variables: { pIdx, k, pruneDirection: 'LEFT', newLow: pIdx + 1 },
          callStack: baseCallStack,
          conditionEval: { expr: `pIdx < k (${pIdx} < ${k})`, result: true },
          explanation: `pIdx (${pIdx}) < k (${k}): Target lies in right partition. Pruning left half [${low}..${pIdx}]. New low = ${pIdx + 1}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx > pIdx && idx <= high ? 'active' : 'discarded',
            })),
            pointers: { low: pIdx + 1, high, targetK: k },
          },
        });
        low = pIdx + 1;
      } else {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 20,
          soundCue: { type: 'step' },
          variables: { pIdx, k, pruneDirection: 'RIGHT', newHigh: pIdx - 1 },
          callStack: baseCallStack,
          conditionEval: { expr: `pIdx > k (${pIdx} > ${k})`, result: true },
          explanation: `pIdx (${pIdx}) > k (${k}): Target lies in left partition. Pruning right half [${pIdx}..${high}]. New high = ${pIdx - 1}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx >= low && idx < pIdx ? 'active' : 'discarded',
            })),
            pointers: { low, high: pIdx - 1, targetK: k },
          },
        });
        high = pIdx - 1;
      }
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
