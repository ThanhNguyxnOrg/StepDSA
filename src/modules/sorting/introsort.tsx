import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const introsortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'introsort',
  title: 'Introsort (Hybrid Quick / Heap / Insertion Sort O(N log N))',
  category: 'sorting',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N) on sorted small inputs',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N) guaranteed by Heapsort fallback',
    spaceAuxiliary: 'O(log N) stack frames',
    worstCaseCondition: 'Degenerate Quicksort partitions trigger Heapsort cutoff',
  },
  theory: {
    overview:
      "Introsort (Introspective Sort, Musser 1997) is the production-grade hybrid sorting algorithm used in standard C++ std::sort. It combines the raw speed of Quicksort, the worst-case O(N log N) guarantee of Heapsort, and the small-array efficiency of Insertion Sort.",
    whyItWorks:
      'Quicksort performs exceptionally on average but can degrade to O(N^2) on adversarial inputs. Introsort monitors recursion depth: if depth exceeds 2 * floor(log2(N)), it preemptively aborts Quicksort and switches to Heapsort, eliminating the quadratic tail.',
    invariant:
      'Hybrid Safety Invariant: Recursion depth never exceeds 2 * log2(N); all subpartitions with <= 16 elements are sorted via cache-efficient Insertion Sort.',
    pitfalls: [
      'Forgetting the depth limit check, leaving Quicksort vulnerable to worst-case quadratic degradation.',
      'Using Heapsort for small partitions instead of Insertion Sort.',
    ],
  },
  presets: [
    {
      id: 'quicksort-ideal',
      label: 'Standard Shuffle: [24, 9, 29, 14, 19, 27, 4, 30]',
      description: 'Quicksort partitioning executes without hitting depth limit',
      data: [24, 9, 29, 14, 19, 27, 4, 30],
    },
    {
      id: 'depth-cutoff',
      label: 'Adversarial Pivot Trigger: [1, 2, 3, 4, 5, 6, 7, 8]',
      description: 'Triggers depth limit cutoff switching into Heapsort',
      data: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      id: 'small-insertion',
      label: 'Small Array (Insertion Sort Cutoff): [8, 3, 5, 1, 9]',
      description: 'Directly handled by Insertion Sort',
      data: [8, 3, 5, 1, 9],
    },
  ],
  defaultInput: [24, 9, 29, 14, 19, 27, 4, 30],
  codeSnippets: {
    cpp: `void introsort(vector<int>& arr, int begin, int end, int depthLimit) {
    int size = end - begin;
    if (size <= 16) {
        insertionSort(arr, begin, end);
        return;
    }
    if (depthLimit == 0) {
        heapsort(arr, begin, end);
        return;
    }
    int pivot = partition(arr, begin, end);
    introsort(arr, begin, pivot, depthLimit - 1);
    introsort(arr, pivot + 1, end, depthLimit - 1);
}`,
    python: `def introsort(arr):
    max_depth = 2 * (len(arr).bit_length() - 1)
    def _intro(low, high, depth):
        size = high - low + 1
        if size <= 16:
            insertion_sort(arr, low, high)
            return
        if depth == 0:
            heapsort(arr, low, high)
            return
        p = partition(arr, low, high)
        _intro(low, p - 1, depth - 1)
        _intro(p + 1, high, depth - 1)
    _intro(0, len(arr) - 1, max_depth)`,
    typescript: `function introsort(arr: number[]): void {
    const maxDepth = 2 * Math.floor(Math.log2(arr.length || 1));
    function sort(low: number, high: number, depth: number) {
        const size = high - low + 1;
        if (size <= 16) {
            insertionSort(arr, low, high);
            return;
        }
        if (depth === 0) {
            heapsort(arr, low, high);
            return;
        }
        const p = partition(arr, low, high);
        sort(low, p - 1, depth - 1);
        sort(p + 1, high, depth - 1);
    }
    sort(0, arr.length - 1, maxDepth);
}`,
    java: `void introsort(int[] arr, int low, int high, int depthLimit) {
    int size = high - low + 1;
    if (size <= 16) {
        insertionSort(arr, low, high);
        return;
    }
    if (depthLimit == 0) {
        heapsort(arr, low, high);
        return;
    }
    int p = partition(arr, low, high);
    introsort(arr, low, p - 1, depthLimit - 1);
    introsort(arr, p + 1, high, depthLimit - 1);
}`,
    pseudocode: `function introsort(arr, low, high, depthLimit):
    if (high - low + 1) <= 16:
        insertionSort(arr, low, high)
    else if depthLimit == 0:
        heapsort(arr, low, high)
    else:
        p = partition(arr, low, high)
        introsort(arr, low, p - 1, depthLimit - 1)
        introsort(arr, p + 1, high, depthLimit - 1)`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const raw = input?.length ? [...input] : [24, 9, 29, 14, 19, 27, 4, 30];
    const arr = [...raw];
    const n = arr.length;
    // Set depth limit threshold for demonstration
    const maxDepth = Math.max(1, 2 * Math.floor(Math.log2(n || 1)));

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];

    // Frame 0: Start
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Introsort on ${n} elements. Max Quicksort depth before Heapsort fallback: 2 * floor(log2(${n})) = ${maxDepth}. Small cutoff <= 4 elements -> Insertion Sort.`,
      variables: { size: n, maxDepthLimit: maxDepth, activeEngine: 'QUICKSORT_INITIAL' },
      callStack: [{ name: 'introsort()', params: { n, maxDepth }, line: 2, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: { low: 0, high: n - 1 },
      },
    });

    // Helper functions
    function insertionSortSub(low: number, high: number) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Subarray [${low}..${high}] has size ${high - low + 1} <= threshold. Executing fast Insertion Sort.`,
        variables: { engine: 'INSERTION_SORT', range: `[${low}..${high}]` },
        callStack: [{ name: `insertionSort(${low}, ${high})`, params: { low, high }, line: 4, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { low, high },
        },
      });

      for (let i = low + 1; i <= high; i++) {
        let j = i;
        while (j > low && elements[j].value < elements[j - 1].value) {
          elements[j].status = 'swapping';
          elements[j - 1].status = 'swapping';

          const tmp = elements[j].value;
          elements[j].value = elements[j - 1].value;
          elements[j - 1].value = tmp;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 4,
            explanation: `Insertion sort shift: Swapped ${elements[j].value} and ${elements[j - 1].value}.`,
            variables: { i, j, value: elements[j - 1].value },
            callStack: [{ name: `insertionShift(${j})`, params: { j }, line: 4, isCurrent: true }],
            state: {
              array: elements.map((e) => ({ ...e })),
              pointers: { pos: j },
            },
          });

          elements[j].status = 'default';
          elements[j - 1].status = 'default';
          j--;
        }
      }

      for (let k = low; k <= high; k++) {
        elements[k].status = 'sorted';
      }
    }

    function heapsortSub(low: number, high: number) {
      const len = high - low + 1;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `DEPTH LIMIT HIT (0 remaining)! Aborting Quicksort recursion. Switching to Heapsort for guaranteed O(N log N) on [${low}..${high}].`,
        isMilestone: true,
        milestoneTitle: 'Heapsort Fallback Triggered',
        soundCue: { type: 'compare' },
        variables: { engine: 'HEAPSORT_FALLBACK', range: `[${low}..${high}]`, reason: 'AVOID_QUADRATIC_DEGRADATION' },
        callStack: [{ name: `heapsort(${low}, ${high})`, params: { low, high }, line: 7, isCurrent: true }],
        state: {
          array: elements.map((e, idx) => ({
            ...e,
            status: idx >= low && idx <= high ? 'active' : e.status,
          })),
          pointers: { heapLow: low, heapHigh: high },
        },
      });

      function siftDown(rootOffset: number, endOffset: number) {
        let root = rootOffset;
        while (root * 2 + 1 <= endOffset) {
          const leftChild = root * 2 + 1;
          let swapIdx = root;

          if (elements[low + swapIdx].value < elements[low + leftChild].value) {
            swapIdx = leftChild;
          }
          if (
            leftChild + 1 <= endOffset &&
            elements[low + swapIdx].value < elements[low + leftChild + 1].value
          ) {
            swapIdx = leftChild + 1;
          }
          if (swapIdx === root) return;

          const pIdx = low + root;
          const cIdx = low + swapIdx;
          elements[pIdx].status = 'swapping';
          elements[cIdx].status = 'swapping';

          const tmp = elements[pIdx].value;
          elements[pIdx].value = elements[cIdx].value;
          elements[cIdx].value = tmp;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: `Heapsort siftDown on [${low}..${low + endOffset}]: swapped parent arr[${pIdx}]=${tmp} with larger child arr[${cIdx}]=${elements[pIdx].value}.`,
            soundCue: { type: 'swap' },
            variables: { engine: 'HEAPSORT_SIFT', parentIdx: pIdx, childIdx: cIdx },
            callStack: [{ name: `siftDown(${pIdx}, ${cIdx})`, params: { pIdx, cIdx }, line: 7, isCurrent: true }],
            state: {
              array: elements.map((e) => ({ ...e })),
              pointers: { parent: pIdx, child: cIdx },
            },
          });

          elements[pIdx].status = 'default';
          elements[cIdx].status = 'default';
          root = swapIdx;
        }
      }

      // Build max-heap over [low..high]
      for (let start = Math.floor((len - 2) / 2); start >= 0; start--) {
        siftDown(start, len - 1);
      }

      // Extract max elements one by one
      for (let end = len - 1; end > 0; end--) {
        const maxIdx = low;
        const targetIdx = low + end;
        const maxVal = elements[maxIdx].value;
        elements[maxIdx].value = elements[targetIdx].value;
        elements[targetIdx].value = maxVal;
        elements[targetIdx].status = 'sorted';

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Heapsort extractMax: moved heap root ${maxVal} to sorted slot [${targetIdx}].`,
          soundCue: { type: 'sorted' },
          variables: { engine: 'HEAPSORT_EXTRACT', extractedMax: maxVal, sortedIdx: targetIdx },
          callStack: [{ name: `extractMax(${targetIdx})`, params: { maxVal, targetIdx }, line: 7, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { root: low, sorted: targetIdx },
          },
        });

        siftDown(0, end - 1);
      }
      elements[low].status = 'sorted';
    }

    function intro(low: number, high: number, depth: number) {
      if (low >= high) {
        if (low === high) elements[low].status = 'sorted';
        return;
      }

      const size = high - low + 1;
      if (size <= 4) {
        insertionSortSub(low, high);
        return;
      }

      if (depth <= 0) {
        heapsortSub(low, high);
        return;
      }

      // Quicksort partition
      const pivotVal = elements[high].value;
      elements[high].status = 'pivot';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        explanation: `Quicksort step on [${low}..${high}] (depth=${depth}): Pivot selected = ${pivotVal} at index ${high}.`,
        isMilestone: true,
        milestoneTitle: `Partition [${low}..${high}] (pivot=${pivotVal})`,
        soundCue: { type: 'compare' },
        variables: { low, high, pivot: pivotVal, remainingDepth: depth },
        callStack: [{ name: `partition(low=${low}, high=${high})`, params: { pivotVal, depth }, line: 10, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { low, high, pivot: high },
        },
      });

      let i = low;
      for (let j = low; j < high; j++) {
        const curVal = elements[j].value;
        const isLess = curVal < pivotVal;
        elements[j].status = 'comparing';

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `Compare arr[${j}] = ${curVal} against pivot ${pivotVal}: ${curVal} ${isLess ? '<' : '>='} ${pivotVal}.`,
          soundCue: { type: 'compare' },
          variables: { low, high, i, j, 'arr[j]': curVal, pivot: pivotVal },
          conditionEval: { expr: `arr[${j}] (${curVal}) < pivot (${pivotVal})`, result: isLess },
          callStack: [{ name: `partition(${low}, ${high})`, params: { i, j, pivotVal }, line: 10, isCurrent: true }],
          state: {
            array: elements.map((e) => ({ ...e })),
            pointers: { i, j, pivot: high },
          },
        });

        if (isLess) {
          if (i !== j) {
            const tmp = elements[i].value;
            elements[i].value = elements[j].value;
            elements[j].value = tmp;
            elements[i].status = 'swapping';
            elements[j].status = 'swapping';

            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 10,
              explanation: `Swap arr[${i}] (${tmp}) and arr[${j}] (${elements[i].value}) into left partition; advance i to ${i + 1}.`,
              soundCue: { type: 'swap' },
              variables: { i, j, swappedLeft: elements[i].value, swappedRight: tmp, pivot: pivotVal },
              callStack: [{ name: `swap(${i}, ${j})`, params: { i, j }, line: 10, isCurrent: true }],
              state: {
                array: elements.map((e) => ({ ...e })),
                pointers: { i, j, pivot: high },
              },
            });
            elements[i].status = 'default';
          }
          i++;
        }
        elements[j].status = 'default';
      }

      // Swap pivot into place
      const displaced = elements[i].value;
      elements[i].value = elements[high].value;
      elements[high].value = displaced;
      elements[i].status = 'sorted';
      elements[high].status = 'default';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation: `Pivot ${pivotVal} locked into final sorted index ${i}. Recursing on [${low}..${i - 1}] and [${i + 1}..${high}] with depth=${depth - 1}.`,
        isMilestone: true,
        milestoneTitle: `Pivot ${pivotVal} @ [${i}]`,
        soundCue: { type: 'sorted' },
        variables: { pivotIndex: i, leftPart: `[${low}..${i - 1}]`, rightPart: `[${i + 1}..${high}]`, nextDepth: depth - 1 },
        callStack: [{ name: `pivotPlaced(${i})`, params: { i }, line: 11, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { pivot: i },
        },
      });

      intro(low, i - 1, depth - 1);
      intro(i + 1, high, depth - 1);
    }

    intro(0, n - 1, maxDepth);

    elements.forEach((e) => {
      e.status = 'sorted';
    });

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      explanation: `Introsort complete! Array sorted in guaranteed O(N log N) using Quicksort + Heapsort cutoff + Insertion Sort.`,
      variables: {
        totalElements: n,
        result: `[${elements.map((e) => e.value).join(', ')}]`,
      },
      callStack: [{ name: 'complete()', params: { n }, line: 14, isCurrent: true }],
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
