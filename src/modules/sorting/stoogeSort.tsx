import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const stoogeSortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'stooge-sort',
  title: 'Stooge Sort (Recursive 2/3 Overlapping Segment Sort O(N^2.71))',
  category: 'sorting',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N^2.7095)',
    timeAverage: 'O(N^2.7095)',
    timeWorst: 'O(N^2.7095)',
    spaceAuxiliary: 'O(log N) recursion depth',
    worstCaseCondition: 'Recurrence T(N) = 3 * T(2N / 3) + O(1) applies uniformly',
  },
  theory: {
    overview:
      'Stooge Sort is a recursive sorting algorithm with an unusual time complexity of O(N^(log 3 / log 1.5)) ≈ O(N^2.7095). It sorts by swapping boundary elements if out of order, then recursively sorting the first 2/3, the last 2/3, and the first 2/3 again.',
    whyItWorks:
      'Sorting the first 2/3 brings the largest elements of that subsegment into the middle third; sorting the last 2/3 then pushes the overall largest elements into the final third; sorting the first 2/3 once more places the remaining elements in exact order.',
    invariant:
      'Overlapping Trisection Invariant: After three overlapping 2/3 passes, the entire subsegment [i..j] is sorted.',
    pitfalls: [
      'Extremely slow even compared to Bubble Sort (O(N^2.71) vs O(N^2)).',
      'Large recursion call stacks for inputs with N > 30.',
    ],
  },
  presets: [
    {
      id: 'classic-5',
      label: 'Small Array: [5, 2, 4, 1, 3]',
      description: '5 elements demonstrates all 3 recursive branches cleanly',
      data: [5, 2, 4, 1, 3],
    },
    {
      id: 'reversed-4',
      label: 'Reversed: [4, 3, 2, 1]',
      description: 'Worst-case inversion profile',
      data: [4, 3, 2, 1],
    },
    {
      id: 'three-elements',
      label: '3 Elements: [3, 1, 2]',
      description: 'Single-level trisection demonstration',
      data: [3, 1, 2],
    },
  ],
  defaultInput: [5, 2, 4, 1, 3],
  codeSnippets: {
    cpp: `void stoogeSort(vector<int>& arr, int i, int j) {
    if (arr[i] > arr[j]) swap(arr[i], arr[j]);
    if (j - i + 1 > 2) {
        int t = (j - i + 1) / 3;
        stoogeSort(arr, i, j - t);     // First 2/3
        stoogeSort(arr, i + t, j);     // Last 2/3
        stoogeSort(arr, i, j - t);     // First 2/3 again
    }
}`,
    python: `def stoogesort(arr, i=0, j=None):
    if j is None: j = len(arr) - 1
    if arr[i] > arr[j]:
        arr[i], arr[j] = arr[j], arr[i]
    if (j - i + 1) > 2:
        t = (j - i + 1) // 3
        stoogesort(arr, i, j - t)     # First 2/3
        stoogesort(arr, i + t, j)     # Last 2/3
        stoogesort(arr, i, j - t)     # First 2/3 again`,
    typescript: `function stoogeSort(arr: number[], i = 0, j = arr.length - 1): void {
    if (arr[i] > arr[j]) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (j - i + 1 > 2) {
        const t = Math.floor((j - i + 1) / 3);
        stoogeSort(arr, i, j - t); // First 2/3
        stoogeSort(arr, i + t, j); // Last 2/3
        stoogeSort(arr, i, j - t); // First 2/3
    }
}`,
    java: `void stoogeSort(int[] arr, int i, int j) {
    if (arr[i] > arr[j]) {
        int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    if (j - i + 1 > 2) {
        int t = (j - i + 1) / 3;
        stoogeSort(arr, i, j - t);
        stoogeSort(arr, i + t, j);
        stoogeSort(arr, i, j - t);
    }
}`,
    pseudocode: `function stoogeSort(arr, i, j):
    if arr[i] > arr[j]:
        swap arr[i], arr[j]
    if (j - i + 1) > 2:
        t = floor((j - i + 1) / 3)
        stoogeSort(arr, i, j - t)
        stoogeSort(arr, i + t, j)
        stoogeSort(arr, i, j - t)`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const raw = input?.length ? [...input] : [5, 2, 4, 1, 3];
    const arr = raw.slice(0, 6);
    const n = arr.length;

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    let checkpointAdded = false;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Stooge Sort on array of size ${n}. Recurrence: T(N) = 3T(2N/3) + O(1).`,
      variables: { size: n, array: `[${arr.join(', ')}]` },
      pedagogy: {
        what: `Stooge sort recursively fixes the first 2/3, then the last 2/3, then the first 2/3 again — three recursive calls per level.`,
        why: 'The third call is the trick: after the first two, the largest element is pushed to the end, so re-sorting the front guarantees global order.',
        whatNext: `Start with the whole range [0..${n - 1}]: compare its boundary elements first.`,
      },
      callStack: [{ name: `stoogeSort(i=0, j=${n - 1})`, params: { i: 0, j: n - 1 }, line: 2, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: { i: 0, j: n - 1 },
      },
    });

    function stooge(i: number, j: number) {
      elements[i].status = 'comparing';
      elements[j].status = 'comparing';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 2,
        explanation: `Comparing boundary elements: arr[${i}] = ${elements[i].value} and arr[${j}] = ${elements[j].value}.`,
        variables: { i, j, valI: elements[i].value, valJ: elements[j].value },
        conditionEval: {
          expr: `arr[${i}] > arr[${j}] (${elements[i].value} > ${elements[j].value})`,
          result: elements[i].value > elements[j].value,
        },
        pedagogy: {
          what: `Boundary check on [${i}..${j}]: ${elements[i].value} vs ${elements[j].value}.`,
          why: 'Making the outer pair ordered first means the later recursive passes can never break the ends.',
          whatNext:
            elements[i].value > elements[j].value
              ? 'They are out of order — swap them.'
              : 'They are already in order — no swap needed.',
        },
        callStack: [{ name: `stooge(i=${i}, j=${j})`, params: { i, j }, line: 2, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { i, j },
        },
      });

      if (elements[i].value > elements[j].value) {
        elements[i].status = 'swapping';
        elements[j].status = 'swapping';

        const tmp = elements[i].value;
        elements[i].value = elements[j].value;
        elements[j].value = tmp;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 3,
          explanation: `Boundary swap: ${elements[j].value} > ${elements[i].value} -> Swapped arr[${i}] and arr[${j}]!`,
          variables: { i, j, newValI: elements[i].value, newValJ: elements[j].value },
          callStack: [{ name: `swap(${i}, ${j})`, params: { i, j }, line: 3, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { i, j },
          },
        });
      }

      elements[i].status = 'default';
      elements[j].status = 'default';

      if (j - i + 1 <= 2) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 3,
          explanation: `Range [${i}..${j}] has length ${j - i + 1} ≤ 2: the boundary swap already ordered it, so no recursion is needed.`,
          variables: { i, j, length: j - i + 1 },
          conditionEval: { expr: `j - i + 1 > 2 (${j - i + 1} > 2)`, result: false },
          callStack: [{ name: `stooge(i=${i}, j=${j})`, params: { base: true }, line: 3, isCurrent: true }],
          pedagogy: {
            what: `A pair (or single element) after the boundary swap is guaranteed sorted.`,
            why: 'This is the recursion base case; the exponential branching only happens for longer ranges.',
            whatNext: 'Return to the caller and continue with its other branches.',
          },
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { i, j },
          },
        });
      }

      if (j - i + 1 > 2) {
        const t = Math.floor((j - i + 1) / 3);

        // Branch 1: First 2/3
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Interval length ${j - i + 1} > 2 (t=${t}). Branch 1: Recursively sort First 2/3 [${i}..${j - t}].`,
          variables: { branch: '1/3: First 2/3', range: `[${i}..${j - t}]` },
          pedagogy: {
            what: `Branch 1 recursively sorts the first two-thirds [${i}..${j - t}] (t = ${t}).`,
            why: 'Trisecting instead of halving is what makes the recurrence T(N) = 3T(2N/3) — correct but far slower than mergesort.',
            whatNext: `After this, branch 2 must sort the overlapping last 2/3 [${i + t}..${j}].`,
          },
          checkpoint: !checkpointAdded
            ? {
                id: 'stooge-third-branch',
                question: `After branch 1 sorts only the first 2/3 of [${i}..${j}], is the whole range sorted?`,
                options: ['No — branches 2 and 3 are still required', 'Yes — one recursive pass is enough'],
                correctIndex: 0,
                explanation: `The largest value can still sit in the unsorted last third; branch 2 pushes it to the end, and branch 3 re-sorts the front to finalize order.`,
              }
            : undefined,
          callStack: [{ name: `stooge(i=${i}, j=${j - t}) [Branch 1]`, params: { i, j: j - t }, line: 5, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { i, j: j - t },
          },
        });
        checkpointAdded = true;
        stooge(i, j - t);

        // Branch 2: Last 2/3
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Branch 2: Recursively sort Last 2/3 [${i + t}..${j}].`,
          variables: { branch: '2/3: Last 2/3', range: `[${i + t}..${j}]` },
          pedagogy: {
            what: `Branch 2 sorts the overlapping last two-thirds [${i + t}..${j}].`,
            why: 'The overlap with branch 1 (the middle third) is deliberate: it lets large values migrate right while small values stay put.',
            whatNext: 'The maximum is now guaranteed at index j; branch 3 re-sorts the front to restore full order.',
          },
          callStack: [{ name: `stooge(i=${i + t}, j=${j}) [Branch 2]`, params: { i: i + t, j }, line: 6, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { i: i + t, j },
          },
        });
        stooge(i + t, j);

        // Branch 3: First 2/3 again
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Branch 3: Recursively sort First 2/3 [${i}..${j - t}] once more to finalize ordering.`,
          variables: { branch: '3/3: First 2/3 Again', range: `[${i}..${j - t}]` },
          pedagogy: {
            what: `Branch 3 re-sorts the first two-thirds [${i}..${j - t}] — the famous "first 2/3 again" call.`,
            why: 'Branch 2 may have disturbed the front while moving large values right; re-sorting it costs another T(2N/3) but guarantees the invariant.',
            whatNext: `This subproblem is done: [${i}..${j}] is sorted — return to the caller.`,
          },
          callStack: [{ name: `stooge(i=${i}, j=${j - t}) [Branch 3]`, params: { i, j: j - t }, line: 7, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { i, j: j - t },
          },
        });
        stooge(i, j - t);
      }
    }

    if (n > 1) {
      stooge(0, n - 1);
    }

    elements.forEach((e) => {
      e.status = 'sorted';
    });

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      explanation: `Stooge Sort complete! Array fully sorted in O(N^2.71) time: [${elements.map((e) => e.value).join(', ')}].`,
      variables: { totalSorted: n, sortedArray: `[${elements.map((e) => e.value).join(', ')}]` },
      pedagogy: {
        what: `Final array: [${elements.map((e) => e.value).join(', ')}].`,
        why: 'The three overlapping thirds conflict heavily: the same elements get revisited T(2N/3) three times, yielding ~N^2.71 — correct, but a stress test of why smarter recursion (merge/quick) matters.',
        whatNext: 'Compare the frame count with insertion sort on the same 5 elements: stooge re-sorts the same ranges repeatedly.',
      },
      callStack: [{ name: 'complete()', params: { size: n }, line: 9, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: {},
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ArrayStageState>, projection: '2d' | 'isometric') => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
