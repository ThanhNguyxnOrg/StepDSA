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
    let checkpointAdded = false;
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
      pedagogy: {
        what: `The unsorted window is the whole array [${start}..${end}]; nothing is locked yet.`,
        why: 'Shaking in both directions fixes the classic bubble-sort weakness: "turtles" (small values near the end) move only one slot per pass.',
        whatNext: `Forward pass: walk i = ${start}..${end - 1} and swap every out-of-order neighbour.`,
      },
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
          pedagogy: {
            what: `Forward sweep compares the pair (${arr[i]}, ${arr[i + 1]}) at indices ${i}, ${i + 1}.`,
            why: 'A left-to-right sweep pushes the largest value of the window toward the right boundary, exactly like bubble sort.',
            whatNext: shouldSwap
              ? `${arr[i]} > ${arr[i + 1]} — swap and keep moving right.`
              : `${arr[i]} ≤ ${arr[i + 1]} — already ordered, move the pair window right.`,
          },
          checkpoint: !checkpointAdded
            ? {
                id: 'cocktail-first-forward-compare',
                question: `Forward pass, window [${start}..${end}]: arr[${i}] = ${arr[i]} vs arr[${i + 1}] = ${arr[i + 1]}. Swap?`,
                options: ['Yes — left is bigger', 'No — already in order'],
                correctIndex: shouldSwap ? 0 : 1,
                explanation: shouldSwap
                  ? `${arr[i]} > ${arr[i + 1]}, so the larger value keeps moving right.`
                  : `${arr[i]} ≤ ${arr[i + 1]}; the sweep just moves on.`,
              }
            : undefined,
          state: makeFrameState(i, i + 1, 'comparing'),
        });
        checkpointAdded = true;

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
            pedagogy: {
              what: `${temp} moved right past ${arr[i]}; the larger value continues its journey toward the right boundary.`,
              why: 'Recording swapped = true disables the early-exit check for this sweep.',
              whatNext: `Continue comparing at index ${i + 1}.`,
            },
            state: makeFrameState(i, i + 1, 'swapping'),
          });
        }
      }

      if (!swapped) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          isMilestone: true,
          milestoneTitle: 'Early Exit (Sorted)',
          soundCue: { type: 'complete' },
          variables: { earlyExit: true, pass: 'forward' },
          callStack: baseCallStack,
          conditionEval: { expr: `swapped === false`, result: true },
          explanation: 'Forward pass made zero swaps: the window is already ordered, so the sort stops early.',
          pedagogy: {
            what: 'A full forward sweep found no out-of-order neighbour.',
            why: 'Zero swaps in one complete sweep proves the whole window is sorted — no later pass could change anything.',
            whatNext: 'Break out and finish.',
          },
          state: makeFrameState(),
        });
        break;
      }

      sortedIndices.add(end);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        isMilestone: true,
        milestoneTitle: `Max Placed at Index ${end}`,
        soundCue: { type: 'sorted' },
        variables: { lockedIndex: end, maxVal: arr[end], newEnd: end - 1 },
        callStack: baseCallStack,
        conditionEval: { expr: `isSorted(end)`, result: true },
        explanation: `Forward pass completed. Maximum element bubbled to index ${end}. Decrementing end to ${end - 1}.`,
        pedagogy: {
          what: `The maximum of the window, ${arr[end]}, is parked at index ${end} — one more element is final.`,
          why: 'Every forward comparison pushed larger values right, so after the sweep the window maximum must sit at its right edge.',
          whatNext: `Shrink the window (end = ${end - 1}) and sweep backward.`,
        },
        state: makeFrameState(),
      });

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
          pedagogy: {
            what: `Backward sweep compares the pair (${arr[i]}, ${arr[i + 1]}) moving right-to-left.`,
            why: 'The reverse sweep is what drags "turtles" (small values near the end) back to the left quickly instead of one slot per pass.',
            whatNext: shouldSwap
              ? `${arr[i]} > ${arr[i + 1]} — swap so the smaller value keeps moving left.`
              : `${arr[i]} ≤ ${arr[i + 1]} — already ordered, move the pair window left.`,
          },
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
            pedagogy: {
              what: `${arr[i]} moved left past ${temp}; the smaller value closes in on its final position.`,
              why: 'Direction reversal after each pass is exactly what fixes the turtle problem.',
              whatNext: `Continue comparing at index ${i - 1}.`,
            },
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
        pedagogy: {
          what: `The minimum of the window, ${arr[start]}, is parked at index ${start} — the left boundary is now final too.`,
          why: 'The backward sweep pushed smaller values left on every comparison, so the window minimum ends at its left edge.',
          whatNext: `Shrink the window (start = ${start + 1}) and start another forward pass while swaps still happen.`,
        },
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
      pedagogy: {
        what: `Both boundaries met after sweeping left and right, leaving the array sorted: [${arr.join(', ')}].`,
        why: 'Every outer iteration finalized one maximum (right) and one minimum (left), so the window shrank by two.',
        whatNext: 'Try the "Turtle Problem" preset: the reverse sweep rescues the small trailing value in a single pass.',
      },
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
