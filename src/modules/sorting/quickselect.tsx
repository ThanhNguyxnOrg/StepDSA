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
    let checkpointAdded = false;

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
      pedagogy: {
        what: `We need the element of rank k = ${k} in [0..${n - 1}] — not a fully sorted array.`,
        why: 'Partitioning tells us the exact final rank of the pivot, so we can discard half of the search space each round: N + N/2 + N/4 + … = O(N).',
        whatNext: `Partition the window [${low}..${high}] around the last element as pivot.`,
      },
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
        codeLine: 13,
        soundCue: { type: 'step' },
        variables: { low, high, targetK: k, windowSize: high - low + 1 },
        callStack: baseCallStack,
        conditionEval: { expr: `low <= high (${low} <= ${high})`, result: true },
        explanation: `Search window is [${low}..${high}] (${high - low + 1} element(s)). Rank k = ${k} must lie inside it if it exists.`,
        pedagogy: {
          what: `A new iteration starts on window [${low}..${high}].`,
          why: 'All indices outside this window were proven to be on the wrong side of rank k and can never be the answer.',
          whatNext: `Pick the window's last element arr[${high}] = ${pivot} as the pivot.`,
        },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: finalPlaced.has(idx)
              ? 'sorted'
              : idx >= low && idx <= high
              ? 'active'
              : 'discarded',
          })),
          pointers: { low, high, targetK: k },
        },
      });

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        isMilestone: true,
        milestoneTitle: `Pivot ${pivot} Selected`,
        soundCue: { type: 'pivot' },
        variables: { pivot, low, high, targetK: k },
        callStack: [{ name: 'partition', params: { low, high, pivot }, line: 3, isCurrent: true }],
        explanation: `Subarray [${low}..${high}]: Selected pivot arr[${high}] = ${pivot}. Partitioning around pivot.`,
        pedagogy: {
          what: `Pivot = ${pivot} (last element of the window).`,
          why: 'After one partition pass, the pivot sits at its exact global rank — the only fact quickselect needs.',
          whatNext: `Scan j = ${low}..${high - 1}: everything ≤ ${pivot} moves into the left (≤) partition.`,
        },
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
          codeLine: 6,
          soundCue: { type: 'compare' },
          variables: { 'arr[j]': arr[j], pivot, i, j, isLessOrEqual },
          callStack: [{ name: 'compare', params: { j, pivot }, line: 6, isCurrent: true }],
          conditionEval: { expr: `arr[${j}] <= pivot (${arr[j]} <= ${pivot})`, result: isLessOrEqual },
          explanation: `Comparing arr[${j}] (${arr[j]}) with pivot (${pivot}).`,
          pedagogy: {
            what: `Candidate arr[${j}] = ${arr[j]} faces pivot ${pivot}.`,
            why: 'The left partition holds only values ≤ pivot; this test decides which side of the boundary this element belongs to.',
            whatNext: isLessOrEqual
              ? `It belongs left: swap it into slot i = ${i} (if needed) and advance i.`
              : 'It belongs right: leave it where it is and keep scanning.',
          },
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
              codeLine: 7,
              soundCue: { type: 'swap' },
              variables: { swapped: true, indexA: i, indexB: j, valA: arr[i], valB: arr[j] },
              callStack: [{ name: 'swap', params: { i, j }, line: 7, isCurrent: true }],
              conditionEval: { expr: `i !== j (${i} !== ${j})`, result: true },
              explanation: `Swapped arr[${i}] (${temp}) with arr[${j}] (${arr[i]}) so smaller element is at left partition.`,
              pedagogy: {
                what: `${temp} moved right past ${arr[i]}; the ≤-partition boundary advanced to i = ${i}.`,
                why: 'Swapping (instead of shifting) keeps the partition loop linear with at most one exchange per element.',
                whatNext: `Advance i to ${i + 1} and continue the scan at j = ${j + 1}.`,
              },
              state: {
                array: arr.map((v, idx) => ({
                  id: idx,
                  value: v,
                  status: idx === i || idx === j ? 'swapping' : idx === high ? 'pivot' : 'default',
                })),
                pointers: { low, i, j, high, targetK: k },
              },
            });
          } else {
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 7,
              soundCue: { type: 'step' },
              variables: { noSwap: true, i, j, pivot },
              callStack: [{ name: 'swap', params: { i, j, skipped: true }, line: 7, isCurrent: true }],
              conditionEval: { expr: `i !== j (${i} === ${j})`, result: false },
              explanation: `arr[${j}] (${arr[j]}) ≤ pivot and i === j (${i}): the element already sits inside the left partition, so the swap is skipped.`,
              pedagogy: {
                what: `The candidate is already exactly where the left partition expects it (i === j = ${i}).`,
                why: 'The `i !== j` guard avoids a useless self-swap — the same short-circuit a real implementation uses.',
                whatNext: `Advance i to ${i + 1} and continue scanning.`,
              },
              state: {
                array: arr.map((v, idx) => ({
                  id: idx,
                  value: v,
                  status: idx === j ? 'active' : idx === high ? 'pivot' : 'default',
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
      const attachRankCheckpoint = !checkpointAdded;

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
        pedagogy: {
          what: `The pivot ${arr[pIdx]} now sits at global rank ${pIdx} — everything left is ≤ it, everything right is ≥ it.`,
          why: 'That rank is final: no future operation can move this value, which is why we can discard one side entirely.',
          whatNext:
            pIdx === k
              ? `pIdx equals k = ${k} — this is the answer!`
              : pIdx < k
              ? `Rank ${k} is to the RIGHT of ${pIdx}; discard the left side.`
              : `Rank ${k} is to the LEFT of ${pIdx}; discard the right side.`,
        },
        checkpoint: attachRankCheckpoint
          ? pIdx === k
            ? {
                id: 'quickselect-rank-decision',
                question: `The pivot settled at rank ${pIdx}, and the target is k = ${k}. Is the search over?`,
                options: ['Yes — the pivot IS the k-th element', 'No — partition the remaining window again'],
                correctIndex: 0,
                explanation: `pIdx = ${pIdx} === k: exactly ${k} values are ≤ the pivot, so it is the k-th smallest element.`,
              }
            : {
                id: 'quickselect-rank-decision',
                question: `The pivot settled at rank ${pIdx}, but the target rank is k = ${k}. Where must the k-th element be?`,
                options: ['In the left window', 'In the right window'],
                correctIndex: pIdx < k ? 1 : 0,
                explanation:
                  pIdx < k
                    ? `${pIdx} < ${k}: rank ${k} lies beyond the pivot — keep the right window.`
                    : `${pIdx} > ${k}: rank ${k} lies before the pivot — keep the left window.`,
              }
          : undefined,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === pIdx ? 'sorted' : idx >= low && idx <= high ? 'active' : 'discarded',
          })),
          pointers: { low, high, pIdx, targetK: k },
        },
      });
      checkpointAdded = true;

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
          pedagogy: {
            what: `The partition placed ${arr[pIdx]} at exactly rank k = ${k}.`,
            why: 'The left partition contains k smaller-or-equal values, so by definition this element is the k-th smallest.',
            whatNext: `Total work was N + N/2 + N/4 + … — about 2N comparisons, not a full O(N log N) sort.`,
          },
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
          variables: { pIdx, k, pruneDirection: 'RIGHT-KEEP', newLow: pIdx + 1 },
          callStack: baseCallStack,
          conditionEval: { expr: `pIdx < k (${pIdx} < ${k})`, result: true },
          explanation: `pIdx (${pIdx}) < k (${k}): Target lies in right partition. Pruning left half [${low}..${pIdx}]. New low = ${pIdx + 1}.`,
          pedagogy: {
            what: `The pivot is smaller than the target rank, so the k-th element must be somewhere to the right.`,
            why: 'All of [low..pIdx] holds values with ranks < k — none of them can be the answer, so the left side is discarded in one move.',
            whatNext: `Continue with the window [${pIdx + 1}..${high}].`,
          },
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
          variables: { pIdx, k, pruneDirection: 'LEFT-KEEP', newHigh: pIdx - 1 },
          callStack: baseCallStack,
          conditionEval: { expr: `pIdx > k (${pIdx} > ${k})`, result: true },
          explanation: `pIdx (${pIdx}) > k (${k}): Target lies in left partition. Pruning right half [${pIdx}..${high}]. New high = ${pIdx - 1}.`,
          pedagogy: {
            what: `The pivot already outranks the target, so the k-th element must be somewhere to the left.`,
            why: 'All of [pIdx..high] holds values with ranks ≥ pIdx > k — the right side cannot contain the answer.',
            whatNext: `Continue with the window [${low}..${pIdx - 1}].`,
          },
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
