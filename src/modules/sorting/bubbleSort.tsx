import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const bubbleSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'bubble-sort',
  title: 'Bubble Sort (Adjacent Swaps)',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Strictly reversed array',
  },
  theory: {
    overview:
      'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    whyItWorks:
      'In each pass k, the k-th largest remaining element "bubbles up" to its correct position at the end of the array.',
    invariant:
      'After pass k, the suffix arr[N-k ... N-1] consists of the k largest elements in sorted order.',
    pitfalls: [
      'O(N²) quadratic time makes it inefficient for large datasets.',
      'Without an early-exit swapped flag, best-case remains O(N²).',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Average case demonstration', data: [29, 10, 14, 37, 13] },
    { id: 'reversed', label: 'Reversed Array', description: 'Worst case (maximum swaps)', data: [50, 40, 30, 20, 10] },
    { id: 'sorted', label: 'Already Sorted', description: 'Best case (early exit in 1 pass)', data: [10, 20, 30, 40, 50] },
  ],
  defaultInput: [29, 10, 14, 37, 13, 45, 8],
  codeSnippets: {
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break`,
    typescript: `function bubbleSort(arr: number[]): void {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`,
    cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
    java: `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
    pseudocode: `function bubbleSort(arr):
    for i = 0 to length(arr) - 1:
        swapped = false
        for j = 0 to length(arr) - i - 2:
            if arr[j] > arr[j + 1]:
                swap arr[j] with arr[j + 1]
                swapped = true
        if not swapped: break`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedIndices = new Set<number>();
    let checkpointAdded = false;
    const baseCallStack = [{ name: 'bubbleSort', params: { n }, line: 1, isCurrent: true }];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      isMilestone: true,
      milestoneTitle: 'Bubble Sort Initialized',
      soundCue: { type: 'start' },
      variables: { n, pass: 0 },
      callStack: baseCallStack,
      conditionEval: { expr: `n > 1`, result: n > 1 },
      explanation: 'Starting Bubble Sort. Ready to compare adjacent pairs.',
      pedagogy: {
        what: 'Nothing is sorted yet; the full array is the unsorted region.',
        why: 'Bubble sort repeatedly walks adjacent pairs, so the largest unsorted value "bubbles" to the right boundary of each pass.',
        whatNext: `Pass 1 starts: compare arr[0] = ${arr[0]} with arr[1] = ${arr[1]}.`,
      },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
      },
    });

    for (let i = 0; i < n; i++) {
      let swapped = false;

      for (let j = 0; j < n - i - 1; j++) {
        const shouldSwap = arr[j] > arr[j + 1];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          soundCue: { type: 'compare' },
          variables: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1], shouldSwap },
          callStack: [{ name: 'bubbleSort', params: { pass: i + 1, j, limit: n - i - 1 }, line: 6, isCurrent: true }],
          conditionEval: { expr: `arr[${j}] > arr[${j + 1}] (${arr[j]} > ${arr[j + 1]})`, result: shouldSwap },
          explanation: `Comparing adjacent pair arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
          pedagogy: {
            what: `Adjacent pair (${arr[j]}, ${arr[j + 1]}) is compared at positions ${j} and ${j + 1} in pass ${i + 1}.`,
            why: 'Only out-of-order neighbours violate sortedness; fixing them one pair at a time over enough passes is exactly bubble sort.',
            whatNext: shouldSwap
              ? `${arr[j]} > ${arr[j + 1]}, so the two will swap.`
              : `${arr[j]} ≤ ${arr[j + 1]}, already in order — move the pair window right.`,
          },
          checkpoint: !checkpointAdded
            ? {
                id: 'bubble-sort-first-compare',
                question: `arr[${j}] = ${arr[j]} and arr[${j + 1}] = ${arr[j + 1]}. Will this pair swap?`,
                options: ['Yes — left is bigger', 'No — already in order'],
                correctIndex: shouldSwap ? 0 : 1,
                explanation: shouldSwap
                  ? `${arr[j]} > ${arr[j + 1]}, so the larger left value bubbles right.`
                  : `${arr[j]} ≤ ${arr[j + 1]}; the pair already satisfies sorted order.`,
              }
            : undefined,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: sortedIndices.has(idx) ? 'sorted' : idx === j || idx === j + 1 ? 'comparing' : 'default',
            })),
            pointers: { j, 'j+1': j + 1 },
          },
        });
        checkpointAdded = true;

        if (shouldSwap) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            soundCue: { type: 'swap' },
            variables: { swapA: arr[j], swapB: arr[j + 1], indexA: j, indexB: j + 1 },
            callStack: [{ name: 'swap', params: { j, next: j + 1 }, line: 7, isCurrent: true }],
            conditionEval: { expr: `swapped = true`, result: true },
            explanation: `arr[${j}] (${arr[j]}) > arr[${j + 1}] (${arr[j + 1]}). Swapping them.`,
            pedagogy: {
              what: `${arr[j]} and ${arr[j + 1]} trade places; the larger value keeps moving right.`,
              why: 'Marking swapped = true is what disables the early-exit check for this pass.',
              whatNext: `Continue with the next adjacent pair starting at index ${j + 1}.`,
            },
            state: {
              array: arr.map((v, idx) => ({
                id: idx,
                value: v,
                status: sortedIndices.has(idx) ? 'sorted' : idx === j || idx === j + 1 ? 'swapping' : 'default',
              })),
              pointers: { j, 'j+1': j + 1 },
            },
          });

          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
        }
      }

      // The final iteration of the outer loop has no adjacent pairs left to
      // compare; nothing observable happens there, so it emits no frames.
      const passHasPairs = n - i - 1 > 0;
      if (!passHasPairs) break;

      sortedIndices.add(n - i - 1);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        isMilestone: true,
        milestoneTitle: `Element ${arr[n - i - 1]} Settled`,
        soundCue: { type: 'sorted' },
        variables: { pass: i + 1, settledIndex: n - i - 1, settledValue: arr[n - i - 1] },
        callStack: [{ name: 'bubbleSort', params: { pass: i + 1, settled: arr[n - i - 1] }, line: 9, isCurrent: true }],
        conditionEval: { expr: `isSettled(n - i - 1)`, result: true },
        explanation: `Pass ${i + 1} complete. Largest unsorted element settled at index [${n - i - 1}].`,
        pedagogy: {
          what: `The pass swept the whole unsorted region and pushed its maximum ${arr[n - i - 1]} to index ${n - i - 1}.`,
          why: 'Every comparison moved the larger value right, so after one full sweep the largest value must be at the boundary.',
          whatNext: `The unsorted region shrinks to [0..${n - i - 2}]; start pass ${i + 2}.`,
        },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: sortedIndices.has(idx) ? 'sorted' : 'default',
          })),
          pointers: {},
        },
      });

      if (!swapped) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          isMilestone: true,
          milestoneTitle: 'Early Exit (Sorted)',
          soundCue: { type: 'complete' },
          variables: { earlyExit: true, totalPasses: i + 1 },
          callStack: baseCallStack,
          conditionEval: { expr: `swapped === false`, result: true },
          explanation: 'No swaps occurred in this pass. Array is already fully sorted (Early termination).',
          pedagogy: {
            what: `Pass ${i + 1} made zero swaps.`,
            why: 'A full pass with no out-of-order neighbours proves the array is sorted — no later pass could change anything.',
            whatNext: 'Stop early: skip all remaining passes.',
          },
          state: {
            array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
            pointers: {},
          },
        });
        break;
      }
    }

    for (let i = 0; i < n; i++) sortedIndices.add(i);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 1,
      explanation: '🎉 Bubble Sort complete! All elements sorted.',
      isMilestone: true,
      milestoneTitle: 'Finished',
      soundCue: { type: 'complete' },
      variables: { completed: true, totalSorted: n },
      callStack: baseCallStack,
      conditionEval: { expr: `isSorted(arr)`, result: true },
      pedagogy: {
        what: 'All elements are in non-decreasing order after pass-by-pass bubbling.',
        why: 'Each pass guarantees one more maximum in its final position, so n-1 passes always suffice.',
        whatNext: 'Try the "Nearly Sorted" preset to watch the early-exit fire after a single clean pass.',
      },
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
