import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const cocktailShakerSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'cocktail-shaker-sort',
  title: 'Cocktail Shaker Sort (Bidirectional Bubble Sort)',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N²)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Array in strictly reverse order',
  },
  theory: {
    overview:
      'Cocktail Shaker Sort (also known as Bidirectional Bubble Sort or Ripple Sort) traverses alternatingly in both directions through the list, sorting both ends simultaneously.',
    whyItWorks:
      'Standard Bubble Sort only passes in one direction, causing small values near the end (known as "turtles") to move forward very slowly (1 position per pass). By reversing direction after each pass, turtles are quickly swept back to their correct positions.',
    invariant:
      'After pass k, the k smallest elements are sorted at the prefix, and the k largest elements are sorted at the suffix.',
    pitfalls: [
      'Forgetting to update start boundary after backward pass.',
      'Failing to track whether any swaps occurred, missing the early termination O(N) best case.',
    ],
  },
  presets: [
    {
      id: 'random',
      label: 'Random Dataset',
      description: 'Shuffled array',
      data: [5, 1, 4, 2, 8, 0, 2],
    },
    {
      id: 'turtles',
      label: 'Turtle Problem',
      description: 'Small element at end: [2, 3, 4, 5, 6, 7, 8, 9, 1]',
      data: [2, 3, 4, 5, 6, 7, 8, 9, 1],
    },
    {
      id: 'reversed',
      label: 'Reversed Array',
      description: 'Worst case inverted array',
      data: [9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
  ],
  defaultInput: [5, 1, 4, 2, 8, 0, 2],
  codeSnippets: {
    python: `def cocktail_shaker_sort(arr):
    n = len(arr)
    swapped = True
    start = 0
    end = n - 1
    while swapped:
        swapped = False
        # Forward pass (left to right)
        for i in range(start, end):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        if not swapped:
            break
        end -= 1
        swapped = False
        # Backward pass (right to left)
        for i in range(end - 1, start - 1, -1):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
                swapped = True
        start += 1
    return arr`,
    typescript: `function cocktailShakerSort(arr: number[]): number[] {
  let swapped = true;
  let start = 0;
  let end = arr.length - 1;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; ++i) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
    end--;
    swapped = false;
    for (let i = end - 1; i >= start; --i) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    start++;
  }
  return arr;
}`,
    cpp: `void cocktailShakerSort(vector<int>& arr) {
    bool swapped = true;
    int start = 0, end = arr.size() - 1;
    while (swapped) {
        swapped = false;
        for (int i = start; i < end; ++i) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
        end--;
        swapped = false;
        for (int i = end - 1; i >= start; --i) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);
                swapped = true;
            }
        }
        start++;
    }
}`,
    java: `public void cocktailShakerSort(int[] arr) {
    boolean swapped = true;
    int start = 0, end = arr.length - 1;
    while (swapped) {
        swapped = false;
        for (int i = start; i < end; ++i) {
            if (arr[i] > arr[i + 1]) {
                int temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
        end--;
        swapped = false;
        for (int i = end - 1; i >= start; --i) {
            if (arr[i] > arr[i + 1]) {
                int temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp;
                swapped = true;
            }
        }
        start++;
    }
}`,
    pseudocode: `function cocktailShakerSort(arr):
    start <- 0, end <- length(arr) - 1, swapped <- true
    while swapped:
        swapped <- false
        for i from start to end - 1:
            if arr[i] > arr[i + 1]: swap(arr[i], arr[i + 1]); swapped <- true
        if not swapped: break
        end <- end - 1
        swapped <- false
        for i from end - 1 down to start:
            if arr[i] > arr[i + 1]: swap(arr[i], arr[i + 1]); swapped <- true
        start <- start + 1`,
  },
  generateTimeline: (input: number[]) => {
    const arr = [...input];
    const n = arr.length;
    let swapped = true;
    let start = 0;
    let end = n - 1;
    const sortedIndices = new Set<number>();
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    const makeFrameState = (
      active1?: number,
      active2?: number,
      status: 'comparing' | 'swapping' = 'comparing'
    ): ArrayStageState => {
      return {
        array: arr.map((val, idx) => ({
          id: idx,
          value: val,
          status: sortedIndices.has(idx)
            ? 'sorted'
            : idx === active1 || idx === active2
            ? status
            : 'default',
        })),
        pointers: {
          start,
          end,
          ...(active1 !== undefined ? { i: active1 } : {}),
        },
      };
    };

    const baseCallStack = [{ name: 'cocktailShakerSort', params: { n }, line: 1, isCurrent: true }];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      isMilestone: true,
      milestoneTitle: 'Cocktail Shaker Initialized',
      soundCue: { type: 'start' },
      variables: { start, end, n },
      callStack: baseCallStack,
      conditionEval: { expr: `start < end`, result: start < end },
      explanation: `Begin Cocktail Shaker Sort. Window bounds [start=${start}, end=${end}].`,
      state: makeFrameState(),
    });

    while (swapped) {
      swapped = false;

      // Forward Pass
      for (let i = start; i < end; ++i) {
        const shouldSwap = arr[i] > arr[i + 1];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          soundCue: { type: 'compare' },
          variables: { direction: 'FORWARD', i, next: i + 1, 'arr[i]': arr[i], 'arr[i+1]': arr[i + 1], shouldSwap },
          callStack: [{ name: 'forwardPass', params: { i, end }, line: 8, isCurrent: true }],
          conditionEval: { expr: `arr[${i}] > arr[${i + 1}] (${arr[i]} > ${arr[i + 1]})`, result: shouldSwap },
          explanation: `Forward pass: comparing arr[${i}] (${arr[i]}) with arr[${i + 1}] (${arr[i + 1]}).`,
          state: makeFrameState(i, i + 1, 'comparing'),
        });

        if (shouldSwap) {
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swapped = true;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            isMilestone: true,
            milestoneTitle: `Forward Swap (${arr[i]}, ${arr[i + 1]})`,
            soundCue: { type: 'swap' },
            variables: { swapped: true, indexA: i, indexB: i + 1, valA: arr[i], valB: arr[i + 1] },
            callStack: [{ name: 'swap', params: { i, next: i + 1 }, line: 10, isCurrent: true }],
            conditionEval: { expr: `swapped = true`, result: true },
            explanation: `Swapped arr[${i}] and arr[${i + 1}] (${temp} > ${arr[i]}).`,
            state: makeFrameState(i, i + 1, 'swapping'),
          });
        }
      }

      sortedIndices.add(end);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 13,
        isMilestone: true,
        milestoneTitle: `Max Placed at Index ${end}`,
        soundCue: { type: 'sorted' },
        variables: { lockedIndex: end, maxVal: arr[end], newEnd: end - 1 },
        callStack: baseCallStack,
        conditionEval: { expr: `isSorted(end)`, result: true },
        explanation: `Forward pass completed. Maximum element bubbled to index ${end}. Decrementing end to ${end - 1}.`,
        state: makeFrameState(),
      });

      if (!swapped) break;
      end--;

      swapped = false;

      // Backward Pass
      for (let i = end - 1; i >= start; --i) {
        const shouldSwap = arr[i] > arr[i + 1];
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 17,
          soundCue: { type: 'compare' },
          variables: { direction: 'BACKWARD', i, next: i + 1, 'arr[i]': arr[i], 'arr[i+1]': arr[i + 1], shouldSwap },
          callStack: [{ name: 'backwardPass', params: { i, start }, line: 17, isCurrent: true }],
          conditionEval: { expr: `arr[${i}] > arr[${i + 1}] (${arr[i]} > ${arr[i + 1]})`, result: shouldSwap },
          explanation: `Backward pass: comparing arr[${i}] (${arr[i]}) with arr[${i + 1}] (${arr[i + 1]}).`,
          state: makeFrameState(i, i + 1, 'comparing'),
        });

        if (shouldSwap) {
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swapped = true;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 19,
            isMilestone: true,
            milestoneTitle: `Backward Swap (${arr[i]}, ${arr[i + 1]})`,
            soundCue: { type: 'swap' },
            variables: { swapped: true, indexA: i, indexB: i + 1, valA: arr[i], valB: arr[i + 1] },
            callStack: [{ name: 'swap', params: { i, next: i + 1 }, line: 19, isCurrent: true }],
            conditionEval: { expr: `swapped = true`, result: true },
            explanation: `Swapped arr[${i}] and arr[${i + 1}] (${temp} > ${arr[i]}). Turtle element dragged to left.`,
            state: makeFrameState(i, i + 1, 'swapping'),
          });
        }
      }

      sortedIndices.add(start);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 21,
        isMilestone: true,
        milestoneTitle: `Min Placed at Index ${start}`,
        soundCue: { type: 'sorted' },
        variables: { lockedIndex: start, minVal: arr[start], newStart: start + 1 },
        callStack: baseCallStack,
        conditionEval: { expr: `isSorted(start)`, result: true },
        explanation: `Backward pass completed. Minimum element bubbled to index ${start}. Incrementing start to ${start + 1}.`,
        state: makeFrameState(),
      });

      start++;
    }

    for (let i = 0; i < n; i++) sortedIndices.add(i);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 22,
      isMilestone: true,
      milestoneTitle: 'Sorting Complete',
      soundCue: { type: 'complete' },
      variables: { completed: true, totalSorted: n },
      callStack: baseCallStack,
      conditionEval: { expr: `isSorted(arr)`, result: true },
      explanation: 'Array fully sorted in both directions. Cocktail Shaker Sort complete.',
      state: {
        array: arr.map((v, i) => ({ id: i, value: v, status: 'sorted' })),
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
