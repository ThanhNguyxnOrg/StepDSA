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
    let checkpointAdded = false;

    const keyAuxiliary = (key: number, i: number) => ({
      type: 'value' as const,
      name: 'key',
      data: key,
      note: `arr[${i}] was copied into key; index [${i}] is now free to overwrite.`,
    });

    const callStackAt = (line: number, params: Record<string, any> = {}) => [
      { name: 'insertionSort(arr)', params: { n, ...params }, line, isCurrent: true },
      { name: 'main()', params: {}, line: 1 },
    ];

    // Step 0: Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: 'Array loaded. Subarray arr[0..0] is trivially sorted.',
      pedagogy: {
        what: `The sorted prefix is just arr[0] = ${arr[0] ?? '∅'}.`,
        why: 'A one-element prefix can never violate sorted order, so it is a valid base case.',
        whatNext: 'Take the next element as key and compare it with the element immediately to its left.',
      },
      callStack: callStackAt(1, { i: 1 }),
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

      // Frame: pick key and remember the hole it leaves behind.
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Picked key = ${key} at index [${i}]. The prefix arr[0..${i - 1}] is already sorted; find where key belongs.`,
        pedagogy: {
          what: `key = arr[${i}] = ${key} is copied into a temporary variable.`,
          why: 'The slot at index i may be overwritten while larger prefix values shift right, so key must be saved first.',
          whatNext: `Compare key with arr[${j}]${j >= 0 ? ` = ${arr[j]}` : ''} to decide whether another shift is needed.`,
        },
        callStack: callStackAt(4, { i, key, j }),
        variables: { i, key, j },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx < i ? 'sorted' : idx === i ? 'pivot' : 'default',
          })),
          pointers: { i, j },
          auxiliary: keyAuxiliary(key, i),
        },
        invariantStatus: {
          isValid: true,
          label: `arr[0..${i - 1}] sorted`,
        },
      });

      // Frame: initialize j = i - 1.
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Set j = ${j}. Scan the sorted prefix from right to left looking for the first value <= key.`,
        pedagogy: {
          what: `j points at the last element of the sorted prefix: arr[${j}]${j >= 0 ? ` = ${arr[j]}` : ''}.`,
          why: 'Scanning backwards visits candidates in decreasing index order, so the first value <= key marks the insertion boundary.',
          whatNext: 'Evaluate the loop guard j >= 0 && arr[j] > key.',
        },
        callStack: callStackAt(5, { i, key, j }),
        variables: { i, key, j },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx < i ? 'sorted' : idx === i ? 'pivot' : 'default',
          })),
          pointers: { i, j },
          auxiliary: keyAuxiliary(key, i),
        },
      });

      // Evaluate the real loop guard on every iteration, including the exit case.
      while (true) {
        const jInBounds = j >= 0;
        const valueAtJ = jInBounds ? arr[j] : undefined;
        const isGreater = jInBounds && valueAtJ! > key;
        const guardResult = jInBounds && isGreater;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: !jInBounds
            ? `j = ${j} is out of bounds, so the scan stops. key = ${key} belongs at index 0.`
            : isGreater
            ? `arr[${j}] (${valueAtJ}) > key (${key}). Shift arr[${j}] one slot right.`
            : `arr[${j}] (${valueAtJ}) <= key (${key}). The insertion boundary is index ${j + 1}.`,
          pedagogy: {
            what: !jInBounds
              ? 'The left boundary was crossed; no smaller prefix element exists.'
              : isGreater
              ? `The guard is true because ${valueAtJ} > ${key}.`
              : `The guard is false because ${valueAtJ} <= ${key}.`,
            why: 'The prefix is sorted, so once a value <= key is found, every earlier value is also <= key and can stay in place.',
            whatNext: guardResult
              ? `Write arr[${j}] into arr[${j + 1}], then decrement j.`
              : `Insert key at index ${j + 1} and stop scanning.`,
          },
          callStack: callStackAt(6, { i, key, j }),
          variables: { i, key, j, 'arr[j]': valueAtJ ?? '∅' },
          conditionEval: {
            expr: `j >= 0 && arr[${j}] > ${key}`,
            result: guardResult,
          },
          checkpoint:
            i === 1 && !checkpointAdded
              ? {
                  id: 'insertion-sort-first-compare',
                  question: guardResult
                    ? `key = ${key} and arr[0] = ${valueAtJ}. What should happen next?`
                    : `key = ${key} and arr[0] = ${valueAtJ}. What should happen next?`,
                  options: guardResult
                    ? ['Shift arr[0] right', 'Insert key at index 1 immediately', 'Swap key with arr[0]']
                    : ['Insert key at index 1', 'Shift arr[0] right', 'Keep scanning left'],
                  correctIndex: 0,
                  explanation: guardResult
                    ? `Because arr[0] > key, arr[0] moves right to index 1 and the scan continues left.`
                    : `Because arr[0] <= key, the prefix is already ordered; key is inserted at index 1.`,
                }
              : undefined,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx === j ? 'comparing' : idx === i ? 'pivot' : idx < i ? 'sorted' : 'default',
            })),
            pointers: { j },
            auxiliary: keyAuxiliary(key, i),
          },
        });
        if (i === 1) checkpointAdded = true;

        if (!guardResult) break;

        // Perform shift: this creates a deliberate duplicate; key is still held aside.
        arr[j + 1] = arr[j];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Copied arr[${j}] (${arr[j]}) into arr[${j + 1}]. Index [${j}] now holds a duplicate that will be overwritten or filled by key.`,
          pedagogy: {
            what: `arr[${j + 1}] now contains ${arr[j]}, temporarily duplicating the value at arr[${j}].`,
            why: 'Shifting right opens a hole at index j without losing any prefix value.',
            whatNext: `Decrement j to ${j - 1} and compare the next value with key.`,
          },
          soundCue: 'swap',
          callStack: callStackAt(7, { i, key, j }),
          variables: { i, key, j, shiftedValue: arr[j], writeTo: j + 1 },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status:
                idx === j + 1
                  ? 'active'
                  : idx === j
                  ? 'comparing'
                  : idx < i
                  ? 'sorted'
                  : 'default',
            })),
            pointers: { j, write: j + 1 },
            auxiliary: keyAuxiliary(key, i),
          },
        });

        j--;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `Decremented j to ${j}. The hole to fill is now index ${j + 1}.`,
          pedagogy: {
            what: `j moved one slot left to ${j}.`,
            why: 'Each shifted element is already in its final relative position; the hole moves left with j.',
            whatNext: j >= 0 ? `Compare arr[${j}] = ${arr[j]} with key.` : 'The hole is at index 0; insert key there.',
          },
          callStack: callStackAt(8, { i, key, j }),
          variables: { i, key, j },
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx < i ? 'sorted' : 'default',
            })),
            pointers: { j },
            auxiliary: keyAuxiliary(key, i),
          },
        });
      }

      // Place key into the final hole.
      arr[j + 1] = key;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        explanation: `Inserted key = ${key} into index [${j + 1}]. Prefix arr[0..${i}] is now sorted.`,
        pedagogy: {
          what: `key = ${key} fills the hole at index ${j + 1}.`,
          why: 'Every value to the right was shifted, and every value to the left is <= key, so the prefix invariant is restored.',
          whatNext: i + 1 < n ? `Move to i = ${i + 1} and pick the next key.` : 'All elements have been inserted; the array is sorted.',
        },
        isMilestone: true,
        milestoneTitle: `Inserted ${key} at index ${j + 1}`,
        soundCue: 'sorted',
        callStack: callStackAt(10, { i, placedKey: key, pos: j + 1 }),
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
      codeLine: 12,
      explanation: 'Insertion Sort completed. Entire array is sorted.',
      pedagogy: {
        what: 'The outer loop has inserted every element into the sorted prefix.',
        why: 'After iteration i = n - 1, the invariant says arr[0..n-1] is sorted, which is the whole array.',
        whatNext: 'Try the Reversed preset to see the worst-case quadratic shift count.',
      },
      isMilestone: true,
      milestoneTitle: 'Insertion Sort Complete',
      soundCue: 'complete',
      callStack: callStackAt(12, { status: 'DONE' }),
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
