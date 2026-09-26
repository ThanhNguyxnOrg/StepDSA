import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const insertionSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'insertion-sort',
  title: 'Insertion Sort (Incremental Insertion)',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Strictly reversed array (maximum shifts)',
  },
  theory: {
    overview:
      'Insertion Sort builds the final sorted array one item at a time by taking the next element and shifting larger elements to the right to make room for insertion.',
    whyItWorks:
      'At each iteration i, the prefix arr[0 ... i-1] is already sorted. By scanning backwards, we find the exact position where key belongs and place it there.',
    invariant:
      'At the start of outer loop iteration i, subarray arr[0 ... i-1] is strictly in sorted order.',
    pitfalls: [
      'Quadratic O(N²) shifting makes it slow for large datasets.',
      'Highly efficient for tiny arrays (N <= 16) or nearly sorted data (O(N) time).',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Average case shifts', data: [35, 12, 48, 20, 9, 31, 15] },
    { id: 'nearly-sorted', label: 'Nearly Sorted', description: 'O(N) best-case demonstration', data: [5, 10, 15, 25, 20, 30, 35] },
    { id: 'reversed', label: 'Reversed Array', description: 'Worst case: every element shifts fully to the left', data: [50, 40, 30, 20, 10] },
  ],
  defaultInput: [35, 12, 48, 20, 9, 31, 15],
  codeSnippets: {
    python: `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
    typescript: `function insertionSort(arr: number[]): void {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}`,
    cpp: `void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    java: `void insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    pseudocode: `procedure insertionSort(arr):
    for i from 1 to n - 1:
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j = j - 1
        arr[j + 1] = key`,
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
      explanation: 'Array loaded. Subarray arr[0..0] is trivially sorted.',
      callStack: [
        { name: 'insertionSort(arr)', params: { n, i: 1 }, line: 1, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { n, i: 1 },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: idx === 0 ? 'sorted' : 'default' })),
        pointers: {},
      },
      invariantStatus: {
        isValid: true,
        label: 'arr[0..0] is sorted',
      },
    });

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      // Frame: pick key
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Picked key = ${key} at index [${i}]. Searching insertion point in sorted prefix arr[0..${i - 1}].`,
        callStack: [
          { name: 'insertionSort(arr)', params: { i, key, j }, line: 4, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { i, key, j },
        conditionEval: {
          expr: `i < ${n}`,
          result: true,
        },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx < i ? 'sorted' : idx === i ? 'pivot' : 'default',
          })),
          pointers: { key: i, j },
        },
        invariantStatus: {
          isValid: true,
          label: `arr[0..${i - 1}] sorted`,
        },
      });

      while (j >= 0 && arr[j] > key) {
        // Frame: compare arr[j] > key
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `arr[${j}] (${arr[j]}) > key (${key}). Shifting arr[${j}] right to [${j + 1}].`,
          callStack: [
            { name: 'insertionSort(arr)', params: { i, key, j, 'arr[j]': arr[j] }, line: 6, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, key, j, 'arr[j]': arr[j] },
          conditionEval: {
            expr: `arr[${j}] (${arr[j]}) > key (${key})`,
            result: true,
          },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === j ? 'comparing' : idx === i ? 'pivot' : idx < i ? 'sorted' : 'default',
            })),
            pointers: { key: i, j },
          },
        });

        // Perform shift
        arr[j + 1] = arr[j];

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Shifted value ${arr[j]} into position [${j + 1}]. Decrementing j.`,
          callStack: [
            { name: 'insertionSort(arr)', params: { i, key, j: j - 1 }, line: 7, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, key, j: j - 1 },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === j + 1 ? 'active' : idx < i ? 'sorted' : 'default',
            })),
            pointers: { key: i, j: j - 1 },
          },
        });

        j--;
      }

      // Check condition exit
      if (j >= 0) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `arr[${j}] (${arr[j]}) <= key (${key}). Found insertion slot at [${j + 1}].`,
          callStack: [
            { name: 'insertionSort(arr)', params: { i, key, insertAt: j + 1 }, line: 6, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { i, key, insertAt: j + 1 },
          conditionEval: {
            expr: `arr[${j}] > ${key}`,
            result: false,
          },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx <= i ? 'sorted' : 'default',
            })),
            pointers: { insertAt: j + 1 },
          },
        });
      }

      // Place key
      arr[j + 1] = key;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Inserted key = ${key} into position [${j + 1}]. Prefix arr[0..${i}] is now sorted.`,
        callStack: [
          { name: 'insertionSort(arr)', params: { i, placedKey: key, pos: j + 1 }, line: 9, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { i, placedKey: key, pos: j + 1 },
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
      codeLine: 11,
      explanation: 'Insertion Sort completed. Entire array is sorted.',
      callStack: [
        { name: 'insertionSort(arr)', params: { status: 'DONE' }, line: 11, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { status: 'COMPLETE' },
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
