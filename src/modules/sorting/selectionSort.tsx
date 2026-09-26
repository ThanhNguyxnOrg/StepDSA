import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const selectionSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'selection-sort',
  title: 'Selection Sort (Minimum Scan)',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N²)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Always O(N²) comparisons regardless of initial array ordering',
  },
  theory: {
    overview:
      'Selection Sort divides the input list into two parts: a sorted sublist of items built up from left to right, and an unsorted sublist. It repeatedly selects the minimum element from the unsorted sublist and moves it to the sorted sublist.',
    whyItWorks:
      'By repeatedly identifying the smallest remaining item and swapping it into the next available slot, each element is guaranteed to be in its permanent sorted index.',
    invariant:
      'Subarray arr[0 ... i-1] is sorted and contains the i smallest elements in the entire array.',
    pitfalls: [
      'Always performs O(N²) comparisons even on already sorted arrays.',
      'Minimizes number of memory writes/swaps to at most O(N), making it useful when write cost is expensive.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Standard minimum search demonstration', data: [64, 25, 12, 22, 11] },
    { id: 'reversed', label: 'Reversed Array', description: 'Requires swaps on every pass', data: [50, 40, 30, 20, 10] },
    { id: 'sorted', label: 'Already Sorted', description: 'Scans all pairs with 0 swaps', data: [10, 20, 30, 40, 50] },
  ],
  defaultInput: [64, 25, 12, 22, 11, 48, 9],
  codeSnippets: {
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    typescript: `function selectionSort(arr: number[]): void {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
}`,
    cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            swap(arr[i], arr[minIdx]);
        }
    }
}`,
    java: `void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}`,
    pseudocode: `procedure selectionSort(arr):
    for i from 0 to n - 2:
        minIdx = i
        for j from i + 1 to n - 1:
            if arr[j] < arr[minIdx]:
                minIdx = j
        swap arr[i] with arr[minIdx]`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input];
    const n = arr.length;

    // Step 0: Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: 'Array loaded. Starting Selection Sort.',
      callStack: [
        { name: 'selectionSort(arr)', params: { n, i: 0 }, line: 1, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { n, i: 0 },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
      },
    });

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      // Frame: assume minIdx = i
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Starting pass ${i + 1}. Assuming initial minimum at index [${i}] (value: ${arr[i]}).`,
        callStack: [
          { name: 'selectionSort(arr)', params: { i, minIdx, currentMin: arr[i] }, line: 4, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { i, minIdx, minVal: arr[i] },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx < i ? 'sorted' : idx === i ? 'pivot' : 'default',
          })),
          pointers: { i, min: minIdx },
        },
        invariantStatus: {
          isValid: true,
          label: i > 0 ? `arr[0..${i - 1}] sorted` : 'Scanning for minimum',
        },
      });

      for (let j = i + 1; j < n; j++) {
        const isSmaller = arr[j] < arr[minIdx];

        // Frame: compare arr[j] with arr[minIdx]
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Comparing arr[${j}] (${arr[j]}) with current minimum arr[${minIdx}] (${arr[minIdx]}).`,
          callStack: [
            { name: 'selectionSort(arr)', params: { i, j, 'arr[j]': arr[j], minVal: arr[minIdx] }, line: 6, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, j, minIdx, 'arr[j]': arr[j], 'arr[min]': arr[minIdx] },
          conditionEval: {
            expr: `arr[${j}] (${arr[j]}) < arr[${minIdx}] (${arr[minIdx]})`,
            result: isSmaller,
          },
          soundCue: { type: 'compare' },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === j ? 'comparing' : idx === minIdx ? 'pivot' : idx < i ? 'sorted' : 'default',
            })),
            pointers: { i, min: minIdx, j },
          },
        });

        if (isSmaller) {
          minIdx = j;

          // Frame: update minIdx
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: `Found new smaller element ${arr[minIdx]} at index [${minIdx}]. Updating minIdx.`,
            callStack: [
              { name: 'selectionSort(arr)', params: { i, minIdx, newMinVal: arr[minIdx] }, line: 7, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            variables: { i, minIdx, newMin: arr[minIdx] },
            soundCue: { type: 'active' as any },
            state: {
              array: arr.map((v, idx) => ({
                id: idx,
                value: v,
                status: idx === minIdx ? 'pivot' : idx < i ? 'sorted' : 'default',
              })),
              pointers: { i, min: minIdx, j },
            },
          });
        }
      }

      // Frame: Swap arr[i] with arr[minIdx]
      if (minIdx !== i) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `Swapping arr[${i}] (${arr[i]}) with minimum element arr[${minIdx}] (${arr[minIdx]}).`,
          callStack: [
            { name: 'selectionSort(arr)', params: { swapI: i, swapMin: minIdx }, line: 11, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { swapI: i, swapMin: minIdx },
          isMilestone: true,
          milestoneTitle: `Swap to index ${i}`,
          soundCue: { type: 'swap' },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === i || idx === minIdx ? 'swapping' : idx < i ? 'sorted' : 'default',
            })),
            pointers: { i, min: minIdx },
          },
        });

        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
      }

      // Frame: Position i is now finalized
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `Element at index [${i}] (${arr[i]}) is now in its finalized sorted position.`,
        callStack: [
          { name: 'selectionSort(arr)', params: { finalized: i, val: arr[i] }, line: 12, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { sortedPrefixLen: i + 1 },
        soundCue: { type: 'sorted' },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx <= i ? 'sorted' : 'default',
          })),
          pointers: { sortedEnd: i },
        },
        invariantStatus: {
          isValid: true,
          label: `arr[0..${i}] sorted`,
        },
      });
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      explanation: 'Selection Sort completed. All elements are sorted.',
      callStack: [
        { name: 'selectionSort(arr)', params: { status: 'COMPLETE' }, line: 14, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { status: 'DONE' },
      isMilestone: true,
      milestoneTitle: 'Sorting Complete',
      soundCue: { type: 'sorted' },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
      invariantStatus: {
        isValid: true,
        label: 'arr[0..N-1] sorted',
      },
    });

    const totalSteps = frames.length;
    return frames.map((f) => ({ ...f, totalSteps }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
