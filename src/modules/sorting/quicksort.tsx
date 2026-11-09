import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const quicksortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'quicksort',
  title: 'Quicksort (Lomuto Partition)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(log N)',
    worstCaseCondition: 'Already sorted or reverse sorted with naive pivot',
  },
  theory: {
    overview:
      'Quicksort is an efficient divide-and-conquer sorting algorithm. It selects a pivot element and partitions the array such that elements smaller than the pivot go to the left, and elements greater go to the right.',
    whyItWorks:
      'By placing the pivot in its exact final sorted position at each recursive partition step, the problem reduces into sorting two independent, smaller subarrays.',
    invariant:
      'In Lomuto partition: All elements in arr[low ... pIndex-1] are <= pivot; all elements in arr[pIndex ... j-1] are > pivot.',
    pitfalls: [
      'Worst-case O(N²) occurs if pivot is repeatedly the smallest or largest element.',
      'Recursion depth can hit O(N) if tail-call optimization or randomized pivot is omitted.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Standard average case', data: [38, 27, 43, 3, 9, 82, 10] },
    { id: 'reversed', label: 'Worst Case (Reversed)', description: 'O(N²) triggers with last element pivot', data: [80, 70, 60, 50, 40, 30, 20] },
    { id: 'nearly-sorted', label: 'Nearly Sorted', description: 'Fast partition steps', data: [10, 20, 35, 30, 40, 50, 60] },
  ],
  defaultInput: [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 98],
  codeSnippets: {
    python: `def quicksort(arr, low, high):
    if low < high:
        p_index = partition(arr, low, high)
        quicksort(arr, low, p_index - 1)
        quicksort(arr, p_index + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    p_index = low
    for j in range(low, high):
        if arr[j] <= pivot:
            arr[p_index], arr[j] = arr[j], arr[p_index]
            p_index += 1
    arr[p_index], arr[high] = arr[high], arr[p_index]
    return p_index`,
    typescript: `function quicksort(arr: number[], low: number, high: number): void {
  if (low < high) {
    const pIndex = partition(arr, low, high);
    quicksort(arr, low, pIndex - 1);
    quicksort(arr, pIndex + 1, high);
  }
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let pIndex = low;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      [arr[pIndex], arr[j]] = [arr[j], arr[pIndex]];
      pIndex++;
    }
  }
  [arr[pIndex], arr[high]] = [arr[high], arr[pIndex]];
  return pIndex;
}`,
    cpp: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int pIndex = low;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            swap(arr[pIndex], arr[j]);
            pIndex++;
        }
    }
    swap(arr[pIndex], arr[high]);
    return pIndex;
}

void quicksort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pIndex = partition(arr, low, high);
        quicksort(arr, low, pIndex - 1);
        quicksort(arr, pIndex + 1, high);
    }
}`,
    java: `int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int pIndex = low;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            int temp = arr[pIndex];
            arr[pIndex] = arr[j];
            arr[j] = temp;
            pIndex++;
        }
    }
    int temp = arr[pIndex];
    arr[pIndex] = arr[high];
    arr[high] = temp;
    return pIndex;
}`,
    pseudocode: `function quicksort(arr, low, high):
    if low < high:
        pIndex = partition(arr, low, high)
        quicksort(arr, low, pIndex - 1)
        quicksort(arr, pIndex + 1, high)

function partition(arr, low, high):
    pivot = arr[high]
    pIndex = low
    for j = low to high - 1:
        if arr[j] <= pivot:
            swap arr[pIndex] with arr[j]
            pIndex = pIndex + 1
    swap arr[pIndex] with arr[high]
    return pIndex`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedIndices = new Set<number>();
    let checkpointAdded = false;

    const callStack: { name: string; params: Record<string, string | number>; line?: number; isCurrent?: boolean }[] = [
      { name: 'main', params: { n }, line: 1, isCurrent: true },
    ];

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: 'Initial array loaded. Starting Quicksort algorithm.',
      isMilestone: true,
      milestoneTitle: 'Quicksort Initialized',
      soundCue: { type: 'start' },
      variables: { n, low: 0, high: n - 1 },
      callStack: [...callStack],
      conditionEval: { expr: `n > 1`, result: n > 1 },
      pedagogy: {
        what: `The initial subproblem is the whole array [0..${n - 1}].`,
        why: 'Quicksort recursively partitions a range until every pivot is in its final position.',
        whatNext: 'Enter partition(0, n - 1), choose arr[high] as pivot, and scan j from low to high - 1.',
      },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
      },
    });

    function snapshot(
      codeLine: number,
      explanation: string,
      pointers: Record<string, number> = {},
      activeStatuses: Record<number, any> = {},
      invariantValid: boolean = true,
      milestone?: string,
      customVars?: Record<string, any>,
      conditionEval?: { expr: string; result: boolean },
      soundCue?: any,
      pedagogy?: ExecutionFrame['pedagogy'],
      checkpoint?: ExecutionFrame['checkpoint']
    ) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        explanation,
        invariantStatus: {
          label: 'arr[low..pIndex-1] <= pivot < arr[pIndex..j-1]',
          isValid: invariantValid,
        },
        isMilestone: !!milestone,
        milestoneTitle: milestone,
        soundCue: soundCue ?? (milestone ? { type: 'sorted' } : { type: 'step' }),
        pedagogy,
        checkpoint,
        variables: {
          ...pointers,
          ...(customVars || {}),
        },
        conditionEval,
        callStack: callStack.map((frame, i) => ({
          ...frame,
          line: i === callStack.length - 1 ? codeLine : frame.line,
          isCurrent: i === callStack.length - 1,
        })),
        state: {
          array: arr.map((v, idx) => {
            let status = 'default';
            if (sortedIndices.has(idx)) status = 'sorted';
            if (activeStatuses[idx]) status = activeStatuses[idx];
            return { id: idx, value: v, status: status as any };
          }),
          pointers,
        },
      });
    }

    function partition(low: number, high: number): number {
      const pivot = arr[high];
      let pIndex = low;

      callStack.push({ name: 'partition', params: { low, high, pivot }, line: 8 });

      snapshot(
        8,
        `Selected pivot = ${pivot} at index [${high}]. Initialized partition index pIndex = ${pIndex}.`,
        { pivot: high, pIndex, j: low },
        { [high]: 'pivot', [pIndex]: 'active' },
        true,
        `Pivot Selected (${pivot})`,
        { pivot, pIndex, low, high },
        { expr: `low < high (${low} < ${high})`, result: true },
        { type: 'pivot' },
        {
          what: `pivot = arr[${high}] = ${pivot}; pIndex starts at low = ${low}.`,
          why: 'Lomuto partition grows a <= pivot region from the left; pIndex marks the first slot after that region.',
          whatNext: `Scan j = ${low}. Compare arr[j] with pivot ${pivot}.`,
        }
      );

      for (let j = low; j < high; j++) {
        const isLessOrEqual = arr[j] <= pivot;
        snapshot(
          11,
          `Comparing arr[j] (${arr[j]}) with pivot (${pivot}).`,
          { pivot: high, pIndex, j },
          { [high]: 'pivot', [pIndex]: 'active', [j]: 'comparing' },
          true,
          undefined,
          { 'arr[j]': arr[j], pivot, pIndex, j },
          { expr: `arr[${j}] <= pivot (${arr[j]} <= ${pivot})`, result: isLessOrEqual },
          { type: 'compare' },
          {
            what: `Compare arr[${j}] = ${arr[j]} with pivot ${pivot}.`,
            why: 'Values <= pivot must end up left of pIndex; values > pivot stay in the right region.',
            whatNext: isLessOrEqual
              ? `The comparison is true, so arr[${j}] belongs in the left region.`
              : `The comparison is false, so arr[${j}] stays in the right region and j advances.`,
          },
          !checkpointAdded
            ? {
                id: 'quicksort-first-compare',
                question: `pivot = ${pivot}, arr[j] = ${arr[j]}. What should happen next?`,
                options: [
                  isLessOrEqual ? 'Swap arr[pIndex] with arr[j], then advance pIndex' : 'Advance j without swapping',
                  isLessOrEqual ? 'Advance j without swapping' : 'Swap arr[pIndex] with arr[j], then advance pIndex',
                  'Swap the pivot into arr[pIndex] now',
                ],
                correctIndex: 0,
                explanation: isLessOrEqual
                  ? `arr[j] <= pivot, so it is swapped into the <= region and pIndex grows.`
                  : `arr[j] > pivot, so it is already in the correct region; only j advances.`,
              }
            : undefined
        );
        checkpointAdded = true;

        if (isLessOrEqual) {
          if (pIndex !== j) {
            snapshot(
              12,
              `Since arr[j] (${arr[j]}) <= pivot (${pivot}), swap arr[pIndex] (${arr[pIndex]}) with arr[j] (${arr[j]}).`,
              { pivot: high, pIndex, j },
              { [high]: 'pivot', [pIndex]: 'swapping', [j]: 'swapping' },
              true,
              undefined,
              { pivot, pIndex, j, valPIndex: arr[pIndex], valJ: arr[j] },
              { expr: `pIndex !== j (${pIndex} !== ${j})`, result: true },
              { type: 'swap' },
              {
                what: `arr[${pIndex}] = ${arr[pIndex]} and arr[${j}] = ${arr[j]} exchange places.`,
                why: 'The smaller value must move into the <= pivot region; the larger value takes its place in the right region.',
                whatNext: `Advance pIndex to ${pIndex + 1}; the <= region grows by one.`,
              }
            );

            [arr[pIndex], arr[j]] = [arr[j], arr[pIndex]];
          } else {
            snapshot(
              12,
              `arr[j] (${arr[j]}) <= pivot (${pivot}), but pIndex === j (${pIndex}), so no swap is needed.`,
              { pivot: high, pIndex, j },
              { [high]: 'pivot', [pIndex]: 'active', [j]: 'comparing' },
              true,
              undefined,
              { pivot, pIndex, j, noSwap: true },
              { expr: `pIndex !== j (${pIndex} !== ${j})`, result: false },
              { type: 'step' },
              {
                what: 'The value is already at the boundary, so swapping it with itself would be a no-op.',
                why: 'pIndex and j refer to the same slot; the <= region can simply grow.',
                whatNext: `Advance pIndex to ${pIndex + 1}.`,
              }
            );
          }

          pIndex++;
          snapshot(
            13,
            `Incremented pIndex to ${pIndex}.`,
            { pivot: high, pIndex, j },
            { [high]: 'pivot', [pIndex]: 'active' },
            true,
            undefined,
            { pivot, pIndex, j },
            undefined,
            { type: 'step' },
            {
              what: `pIndex = ${pIndex} marks the first index after the <= pivot region.`,
              why: 'Every value in arr[low..pIndex-1] is now known to be <= pivot.',
              whatNext: j + 1 < high ? `Advance j to ${j + 1} and compare again.` : 'The scan is finished; place the pivot.',
            }
          );
        } else {
          snapshot(
            11,
            `arr[${j}] (${arr[j]}) > pivot (${pivot}). Leave it in the right region; advance j to ${j + 1}.`,
            { pivot: high, pIndex, j: j + 1 },
            { [high]: 'pivot', [pIndex]: 'active', [j]: 'comparing' },
            true,
            undefined,
            { pivot, pIndex, j, skipped: true },
            { expr: `arr[${j}] <= pivot (${arr[j]} <= ${pivot})`, result: false },
            { type: 'step' },
            {
              what: `The false branch does not swap; arr[${j}] remains in the > pivot region.`,
              why: 'Lomuto partition only swaps values that belong on the left side of pIndex.',
              whatNext: `Advance j to ${j + 1} and compare the next value.`,
            }
          );
        }
      }

      // Final pivot swap
      snapshot(
        14,
        `Partition loop complete. Swapping pivot (${pivot}) into its finalized sorted position at pIndex [${pIndex}].`,
        { pivot: high, pIndex },
        { [high]: 'swapping', [pIndex]: 'swapping' },
        true,
        `Partition Complete`,
        { pivot, finalPIndex: pIndex },
        { expr: `j === high`, result: true },
        { type: 'swap' },
        {
          what: `The scan is complete; pIndex = ${pIndex} is the pivot's final slot.`,
          why: 'Everything left of pIndex is <= pivot and everything from pIndex to high-1 is > pivot, so the pivot separates the two regions.',
          whatNext: `Swap arr[${pIndex}] = ${arr[pIndex]} with the pivot at arr[${high}] = ${pivot}.`,
        }
      );

      [arr[pIndex], arr[high]] = [arr[high], arr[pIndex]];
      sortedIndices.add(pIndex);

      snapshot(
        15,
        `Pivot ${arr[pIndex]} is now settled in its finalized sorted position at index [${pIndex}].`,
        { sorted: pIndex },
        { [pIndex]: 'sorted' },
        true,
        undefined,
        { pivot: arr[pIndex], sortedIndex: pIndex },
        { expr: `isSorted(pIndex)`, result: true },
        { type: 'sorted' },
        {
          what: `Pivot ${arr[pIndex]} is at index ${pIndex}, its final sorted position.`,
          why: 'No future recursive call can move it: the left subarray only contains <= values and the right only > values.',
          whatNext: 'Recurse on the left range, then the right range.',
        }
      );

      callStack.pop();
      return pIndex;
    }

    function quicksort(low: number, high: number) {
      callStack.push({ name: 'quicksort', params: { low, high }, line: 2 });
      if (low < high) {
        snapshot(
          2,
          `Enter quicksort(arr, ${low}, ${high}). The range has ${high - low + 1} elements, so it still needs work.`,
          { low, high },
          {},
          true,
          undefined,
          { low, high, rangeSize: high - low + 1 },
          { expr: `low < high (${low} < ${high})`, result: true },
          { type: 'step' },
          {
            what: `Recursive call for range [${low}..${high}].`,
            why: 'A range with at least two elements cannot be assumed sorted; partition it first.',
            whatNext: 'Call partition to place one pivot in its final position.',
          }
        );
        const p = partition(low, high);
        snapshot(
          4,
          `partition returned pIndex = ${p}. Recurse on [${low}..${p - 1}] and [${p + 1}..${high}].`,
          { low, high, pIndex: p },
          { [p]: 'sorted' },
          true,
          undefined,
          { pIndex: p },
          { expr: `low < high (${low} < ${high})`, result: true },
          { type: 'step' },
          {
            what: `Pivot index ${p} is fixed; the two remaining subproblems exclude it.`,
            why: 'The pivot is already globally placed, so neither recursive call needs to touch it.',
            whatNext: p - 1 > low ? `Sort the left range [${low}..${p - 1}].` : 'The left range has at most one element; move to the right range.',
          }
        );
        quicksort(low, p - 1);
        quicksort(p + 1, high);
      } else if (low === high) {
        sortedIndices.add(low);
        snapshot(
          2,
          `Base case: range [${low}..${high}] contains one element (${arr[low]}), already sorted.`,
          { low, high },
          { [low]: 'sorted' },
          true,
          undefined,
          { low, high, baseValue: arr[low] },
          { expr: `low < high (${low} < ${high})`, result: false },
          { type: 'step' },
          {
            what: `Single element arr[${low}] = ${arr[low]} is a sorted range.`,
            why: 'No partition is needed when low === high.',
            whatNext: 'Return to the caller; this element will not move again.',
          }
        );
      } else {
        snapshot(
          2,
          `Empty range: low = ${low} > high = ${high}. Nothing to sort.`,
          { low, high },
          {},
          true,
          undefined,
          { low, high },
          { expr: `low < high (${low} < ${high})`, result: false },
          { type: 'step' },
          {
            what: 'The recursive range is empty.',
            why: 'An empty range trivially satisfies the sorted invariant.',
            whatNext: 'Return immediately to the parent call.',
          }
        );
      }
      callStack.pop();
    }

    quicksort(0, n - 1);

    // Final settled state
    for (let i = 0; i < n; i++) sortedIndices.add(i);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 1,
      explanation: '🎉 Quicksort complete! All elements are verified sorted.',
      isMilestone: true,
      milestoneTitle: 'Quicksort Finished',
      soundCue: { type: 'complete' },
      variables: { totalSorted: n, completed: true },
      conditionEval: { expr: `isFullySorted(arr)`, result: true },
      pedagogy: {
        what: 'Every recursive range has either become empty, held one element, or been partitioned around a settled pivot.',
        why: 'The union of all settled pivots and base-case singletons covers the whole array, so no element is left unsorted.',
        whatNext: 'Try the Reversed preset to see the O(N²) worst case when the last element is always the smallest.',
      },
      callStack: [{ name: 'main', params: { n }, line: 1, isCurrent: true }],
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
    });

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
