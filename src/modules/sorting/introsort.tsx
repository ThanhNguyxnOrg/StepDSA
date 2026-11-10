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
    // Real Introsort aborts at 2 * floor(log2(N)) recursion depth. At the small
    // sizes used for interactive demos that bound is unreachable, so the demo
    // scales the limit to floor(log2(N)) — stated explicitly in the init frame —
    // which keeps the Heapsort fallback observable on adversarial inputs.
    const fullMaxDepth = Math.max(1, 2 * Math.floor(Math.log2(n || 1)));
    const maxDepth = Math.max(1, Math.floor(Math.log2(n || 1)));

    const elements = arr.map((val, idx) => ({
      id: idx,
      value: val,
      status: 'default' as ElementStatus,
    }));

    const frames: ExecutionFrame<ArrayStageState>[] = [];
    let checkpointAdded = false;

    // Frame 0: Start
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Introsort on ${n} elements. Depth limit: real formula 2 * floor(log2(${n})) = ${fullMaxDepth}, scaled to ${maxDepth} for demo sizes so the fallback is observable. Small cutoff <= 4 elements -> Insertion Sort.`,
      variables: { size: n, maxDepthLimit: maxDepth, fullMaxDepth, activeEngine: 'QUICKSORT_INITIAL' },
      callStack: [{ name: 'introsort()', params: { n, maxDepth }, line: 2, isCurrent: true }],
      pedagogy: {
        what: `Three engines cooperate: Quicksort partitions, Insertion Sort finishes small ranges (≤ 4 here), Heapsort rescues any recursion that exhausts depth ${maxDepth}.`,
        why: 'Quicksort is fastest on average but can degrade to O(N²) on adversarial pivots; the depth counter guarantees the swap to Heapsort before that happens.',
        whatNext: 'Start with the whole array: size 8 > 4 and depth > 0, so Quicksort partitions first.',
      },
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
        pedagogy: {
          what: `Range [${low}..${high}] has only ${high - low + 1} element(s) — below the small cutoff.`,
          why: 'For tiny ranges, insertion sort beats quicksort: it has no recursion overhead and is cache-friendly (this is why std::sort does the same).',
          whatNext: 'Insert each element into the sorted prefix one shift at a time.',
        },
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

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Insertion Sort finished: range [${low}..${high}] is now fully sorted.`,
        soundCue: { type: 'sorted' },
        variables: { engine: 'INSERTION_SORT', range: `[${low}..${high}]`, sortedCount: high - low + 1 },
        callStack: [{ name: `insertionSort(${low}, ${high})`, params: { done: true }, line: 4, isCurrent: true }],
        pedagogy: {
          what: `Every element of [${low}..${high}] is in order — this leaf of the recursion tree is complete.`,
          why: 'Because introsort only hands sorted subranges back, the parent partition ranges merge trivially (no merge step needed).',
          whatNext: 'Return to the caller; the sibling range (if any) continues independently.',
        },
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { low, high },
        },
      });
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
        pedagogy: {
          what: `This recursion path has consumed its entire depth budget on a range still larger than the cutoff.`,
          why: 'Deep unbalanced partitions are the signature of adversarial pivots (e.g. sorted input with last-element pivot) — continuing would risk O(N²).',
          whatNext: `Hand [${low}..${high}] to Heapsort: build a max-heap, then extract maxima — guaranteed O(N log N) regardless of data.`,
        },
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
            pedagogy: {
              what: `Inside the fallback heap, the larger child at [${cIdx}] moved up over its parent at [${pIdx}].`,
              why: 'Sift-down restores the max-heap property after the root was extracted — the invariant heapsort relies on.',
              whatNext: 'Continue sifting down the same path if a child is still larger.',
            },
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
          pedagogy: {
            what: `The heap's root — the current maximum ${maxVal} — is locked at the right edge of this fallback range.`,
            why: 'Repeated extraction builds the sorted suffix from the largest down, all in O(log N) per element.',
            whatNext: `Shrink the heap and sift-down the new root again.`,
          },
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
        codeLine: 9,
        explanation: `Quicksort step on [${low}..${high}] (depth=${depth}): Pivot selected = ${pivotVal} at index ${high}.`,
        isMilestone: true,
        milestoneTitle: `Partition [${low}..${high}] (pivot=${pivotVal})`,
        soundCue: { type: 'compare' },
        variables: { low, high, pivot: pivotVal, remainingDepth: depth },
        pedagogy: {
          what: `Range [${low}..${high}] has size ${high - low + 1} > 4 and depth ${depth} > 0, so Quicksort partitions around pivot ${pivotVal}.`,
          why: 'This dispatch order is the "introspective" part: small → insertion, exhausted depth → heapsort, otherwise quicksort.',
          whatNext: `Scan the range: values < ${pivotVal} move left of the boundary, then the pivot locks into its final rank.`,
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'introsort-engine-dispatch',
              question: `Call on [${low}..${high}]: size ${high - low + 1} > 4 and depth left ${depth} > 0. Which engine handles it?`,
              options: [
                'Quicksort partition (neither fallback applies)',
                'Heapsort (depth exhausted)',
              ],
              correctIndex: 0,
              explanation:
                'Only when size ≤ 4 does insertion take over, and only when depth reaches 0 does heapsort; here depth ' +
                depth +
                ' > 0, so quicksort partitions.',
            }
          : undefined,
        callStack: [{ name: `partition(low=${low}, high=${high})`, params: { pivotVal, depth }, line: 10, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { low, high, pivot: high },
        },
      });
      checkpointAdded = true;

      let i = low;
      for (let j = low; j < high; j++) {
        const curVal = elements[j].value;
        const isLess = curVal < pivotVal;
        elements[j].status = 'comparing';

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Compare arr[${j}] = ${curVal} against pivot ${pivotVal}: ${curVal} ${isLess ? '<' : '>='} ${pivotVal}.`,
          soundCue: { type: 'compare' },
          variables: { low, high, i, j, 'arr[j]': curVal, pivot: pivotVal },
          conditionEval: { expr: `arr[${j}] (${curVal}) < pivot (${pivotVal})`, result: isLess },
          pedagogy: {
            what: `Candidate arr[${j}] = ${curVal} faces pivot ${pivotVal}.`,
            why: 'Only values strictly smaller than the pivot belong on its left side; equal values stay put to keep this partition scheme simple.',
            whatNext: isLess
              ? `It belongs left: swap into boundary slot ${i} and advance i.`
              : 'It belongs right: leave it and keep scanning.',
          },
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
              codeLine: 9,
              explanation: `Swap arr[${i}] (${tmp}) and arr[${j}] (${elements[i].value}) into left partition; advance i to ${i + 1}.`,
              soundCue: { type: 'swap' },
              variables: { i, j, swappedLeft: elements[i].value, swappedRight: tmp, pivot: pivotVal },
              pedagogy: {
                what: `${elements[i].value} crossed into the left region while ${tmp} moved right of the boundary.`,
                why: 'Swapping (not shifting) keeps the partition single-pass and lets any out-of-place element cross in O(1).',
                whatNext: `Boundary moves to i = ${i + 1}; continue scanning j = ${j + 1}.`,
              },
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
        codeLine: 10,
        explanation: `Pivot ${pivotVal} locked into final sorted index ${i}. Recursing on [${low}..${i - 1}] and [${i + 1}..${high}] with depth=${depth - 1}.`,
        isMilestone: true,
        milestoneTitle: `Pivot ${pivotVal} @ [${i}]`,
        soundCue: { type: 'sorted' },
        variables: { pivotIndex: i, leftPart: `[${low}..${i - 1}]`, rightPart: `[${i + 1}..${high}]`, nextDepth: depth - 1 },
        pedagogy: {
          what: `Pivot ${pivotVal} is at rank ${i} forever; left range [${low}..${i - 1}] and right range [${i + 1}..${high}] remain.`,
          why: `Both children get depth ${depth - 1}: every partition spends exactly one unit of the depth budget — that meter is what triggers the heapsort safety net.`,
          whatNext: `Recurse left first, then right (depth ${depth - 1} each).`,
        },
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
      codeLine: 12,
      explanation: `Introsort complete! Array sorted in guaranteed O(N log N) using Quicksort + Heapsort cutoff + Insertion Sort.`,
      variables: {
        totalElements: n,
        result: `[${elements.map((e) => e.value).join(', ')}]`,
      },
      pedagogy: {
        what: `Final array: [${elements.map((e) => e.value).join(', ')}].`,
        why: 'Each engine contributed its strength: quicksort divided fast, insertion sort finished the small leaves cheaply, and the depth meter guaranteed no quadratic tail existed.',
        whatNext: 'Try the adversarial presets: sorted input with last-element pivots is exactly what fires the heapsort fallback.',
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
