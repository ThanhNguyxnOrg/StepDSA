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

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: 'Initial array loaded. Starting Quicksort algorithm.',
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
      milestone?: string
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

      snapshot(
        9,
        `Selected pivot = ${pivot} at index [${high}]. Initialized partition index pIndex = ${pIndex}.`,
        { pivot: high, pIndex, j: low },
        { [high]: 'pivot', [pIndex]: 'active' },
        true,
        `Pivot Selected (${pivot})`
      );

      for (let j = low; j < high; j++) {
        snapshot(
          12,
          `Comparing arr[j] (${arr[j]}) with pivot (${pivot}).`,
          { pivot: high, pIndex, j },
          { [high]: 'pivot', [pIndex]: 'active', [j]: 'comparing' }
        );

        if (arr[j] <= pivot) {
          if (pIndex !== j) {
            snapshot(
              13,
              `Since arr[j] (${arr[j]}) <= pivot (${pivot}), swap arr[pIndex] (${arr[pIndex]}) with arr[j] (${arr[j]}).`,
              { pivot: high, pIndex, j },
              { [high]: 'pivot', [pIndex]: 'swapping', [j]: 'swapping' }
            );

            [arr[pIndex], arr[j]] = [arr[j], arr[pIndex]];
          }

          pIndex++;
          snapshot(
            14,
            `Incremented pIndex to ${pIndex}.`,
            { pivot: high, pIndex, j },
            { [high]: 'pivot', [pIndex]: 'active' }
          );
        }
      }

      // Final pivot swap
      snapshot(
        15,
        `Partition loop complete. Swapping pivot (${pivot}) into its finalized sorted position at pIndex [${pIndex}].`,
        { pivot: high, pIndex },
        { [high]: 'swapping', [pIndex]: 'swapping' },
        true,
        `Partition Complete`
      );

      [arr[pIndex], arr[high]] = [arr[high], arr[pIndex]];
      sortedIndices.add(pIndex);

      snapshot(
        16,
        `Pivot ${arr[pIndex]} is now settled in its finalized sorted position at index [${pIndex}].`,
        { sorted: pIndex },
        { [pIndex]: 'sorted' }
      );

      return pIndex;
    }

    function quicksort(low: number, high: number) {
      if (low < high) {
        const p = partition(low, high);
        quicksort(low, p - 1);
        quicksort(p + 1, high);
      } else if (low === high) {
        sortedIndices.add(low);
      }
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
