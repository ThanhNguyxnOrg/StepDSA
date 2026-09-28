import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const timsortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'timsort',
  title: 'Timsort (Adaptive Natural Run Merging O(N log N))',
  category: 'sorting',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N) on already sorted or partially sorted arrays',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N) run merge buffers',
    worstCaseCondition: 'Adversarial run distributions requiring balanced 2-way merges',
  },
  theory: {
    overview:
      "Timsort (Tim Peters, 2002) is the standard sorting algorithm in Python (list.sort) and Java (Arrays.sort for objects). It is an adaptive, stable hybrid derived from Mergesort and Insertion Sort, engineered to exploit existing ordered sequences ('natural runs') in real-world data.",
    whyItWorks:
      'Real-world data is frequently partially sorted. Timsort scans for contiguous non-decreasing or strictly decreasing segments (reversing descending runs). Short runs are extended to a minimum run size (minrun) via Binary Insertion Sort, then pushed onto a stack and merged according to strict invariant rules.',
    invariant:
      'Stack Balance Invariant: For the top three runs on the stack (A, B, C): |A| > |B| + |C| and |B| > |C|, ensuring balanced logarithmic merge passes.',
    pitfalls: [
      'Unstable merge logic breaking element ties.',
      'Stack overflow bugs if the merge invariant checks allow disproportionately skewed run stacks.',
    ],
  },
  presets: [
    {
      id: 'natural-runs',
      label: 'Natural Runs: [1, 2, 8, 7, 6, 3, 4, 9]',
      description: 'Contains ascending run [1, 2, 8] and descending run [7, 6] reversed',
      data: [1, 2, 8, 7, 6, 3, 4, 9],
    },
    {
      id: 'partially-sorted',
      label: 'Partially Sorted: [5, 6, 7, 1, 2, 3, 9, 8]',
      description: 'Multiple natural runs merged adaptively',
      data: [5, 6, 7, 1, 2, 3, 9, 8],
    },
    {
      id: 'already-sorted',
      label: 'Best Case O(N): [1, 2, 3, 4, 5, 6]',
      description: 'Single natural run spans the entire array',
      data: [1, 2, 3, 4, 5, 6],
    },
  ],
  defaultInput: [1, 2, 8, 7, 6, 3, 4, 9],
  codeSnippets: {
    cpp: `void timSort(vector<int>& arr) {
    int n = arr.size();
    const int RUN = 32;
    for (int i = 0; i < n; i += RUN)
        insertionSort(arr, i, min(i + RUN - 1, n - 1));
    for (int size = RUN; size < n; size = 2 * size) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = left + size - 1;
            int right = min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}`,
    python: `def timsort(arr):
    min_run = 32
    n = len(arr)
    for i in range(0, n, min_run):
        insertion_sort(arr, i, min(i + min_run - 1, n - 1))
    size = min_run
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(n - 1, left + size - 1)
            right = min(left + 2 * size - 1, n - 1)
            if mid < right:
                merge(arr, left, mid, right)
        size *= 2`,
    typescript: `function timSort(arr: number[]): void {
    const RUN = 32;
    const n = arr.length;
    for (let i = 0; i < n; i += RUN) {
        binaryInsertionSort(arr, i, Math.min(i + RUN - 1, n - 1));
    }
    for (let size = RUN; size < n; size = 2 * size) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = left + size - 1;
            const right = Math.min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}`,
    java: `public static void timSort(int[] arr) {
    int n = arr.length;
    int RUN = 32;
    for (int i = 0; i < n; i += RUN)
        insertionSort(arr, i, Math.min(i + RUN - 1, n - 1));
    for (int size = RUN; size < n; size = 2 * size) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = left + size - 1;
            int right = Math.min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}`,
    pseudocode: `function timsort(arr):
    minrun = calculateMinRun(length(arr))
    runs = identifyNaturalRuns(arr)
    for each run in runs:
        if length(run) < minrun:
            extendWithBinaryInsertionSort(run, minrun)
        push(stack, run)
        collapseStackInvariants(stack)
    while length(stack) > 1:
        mergeTopRuns(stack)`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const raw = input?.length ? [...input] : [1, 2, 8, 7, 6, 3, 4, 9];
    const arr = [...raw];
    const n = arr.length;
    const minRun = Math.max(2, Math.min(4, Math.floor(n / 2)));

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
      explanation: `Initialize Timsort on ${n} elements. MinRun target = ${minRun}. Scanning for natural monotonic runs.`,
      variables: { size: n, minRun, array: `[${arr.join(', ')}]` },
      callStack: [{ name: 'timSort()', params: { n, minRun }, line: 2, isCurrent: true }],
      state: {
        array: elements.map((e) => ({ ...e })),
        pointers: { scan: 0 },
      },
    });

    interface Run {
      start: number;
      len: number;
    }
    const runs: Run[] = [];
    let start = 0;

    // Phase 1: Identify and extend natural runs
    while (start < n) {
      let end = start + 1;
      if (end < n) {
        if (elements[end].value >= elements[start].value) {
          // Ascending run
          while (end < n && elements[end].value >= elements[end - 1].value) {
            end++;
          }
        } else {
          // Descending run -> reverse it
          while (end < n && elements[end].value < elements[end - 1].value) {
            end++;
          }
          // Reverse subsegment
          let left = start;
          let right = end - 1;
          while (left < right) {
            const tmp = elements[left].value;
            elements[left].value = elements[right].value;
            elements[right].value = tmp;
            left++;
            right--;
          }
        }
      }

      let runLen = end - start;

      // Extend to minRun with binary insertion sort if needed
      if (runLen < minRun && start + minRun <= n) {
        const targetEnd = Math.min(n, start + minRun);
        for (let i = start + 1; i < targetEnd; i++) {
          let j = i;
          while (j > start && elements[j].value < elements[j - 1].value) {
            const tmp = elements[j].value;
            elements[j].value = elements[j - 1].value;
            elements[j - 1].value = tmp;
            j--;
          }
        }
        end = targetEnd;
        runLen = end - start;
      }

      runs.push({ start, len: runLen });

      for (let k = start; k < end; k++) {
        elements[k].status = 'active';
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Formed Run #${runs.length}: [${start}..${end - 1}] (length ${runLen}): [${elements
          .slice(start, end)
          .map((e) => e.value)
          .join(', ')}].`,
        variables: {
          runNumber: runs.length,
          range: `[${start}..${end - 1}]`,
          length: runLen,
        },
        callStack: [
          { name: `buildRun(start=${start})`, params: { start, length: runLen }, line: 4, isCurrent: true },
          { name: 'timSort()', params: { n }, line: 2 },
        ],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { runStart: start, runEnd: end - 1 },
        },
      });

      for (let k = start; k < end; k++) {
        elements[k].status = 'default';
      }

      start = end;
    }

    // Phase 2: Merge adjacent runs
    while (runs.length > 1) {
      const r1 = runs.shift()!;
      const r2 = runs.shift()!;

      const mergeStart = r1.start;
      const mergeMid = r1.start + r1.len;
      const mergeEnd = r2.start + r2.len;

      for (let k = mergeStart; k < mergeEnd; k++) {
        elements[k].status = 'comparing';
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Merging adjacent runs: [${mergeStart}..${mergeMid - 1}] and [${mergeMid}..${mergeEnd - 1}].`,
        variables: {
          leftRun: `[${elements.slice(mergeStart, mergeMid).map((e) => e.value).join(', ')}]`,
          rightRun: `[${elements.slice(mergeMid, mergeEnd).map((e) => e.value).join(', ')}]`,
        },
        callStack: [{ name: `mergeRuns(${mergeStart}, ${mergeEnd})`, params: { mergeStart, mergeEnd }, line: 8, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { left: mergeStart, right: mergeEnd - 1 },
        },
      });

      // Merge sort the subsegment
      const mergedVals = elements.slice(mergeStart, mergeEnd).map((e) => e.value);
      mergedVals.sort((a, b) => a - b);
      for (let k = 0; k < mergedVals.length; k++) {
        elements[mergeStart + k].value = mergedVals[k];
        elements[mergeStart + k].status = 'sorted';
      }

      runs.unshift({ start: mergeStart, len: r1.len + r2.len });

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Merged into unified run: [${elements.slice(mergeStart, mergeEnd).map((e) => e.value).join(', ')}].`,
        variables: { mergedRange: `[${mergeStart}..${mergeEnd - 1}]` },
        callStack: [{ name: `mergeDone()`, params: { size: mergedVals.length }, line: 9, isCurrent: true }],
        state: {
          array: elements.map((e) => ({ ...e })),
          pointers: { start: mergeStart, end: mergeEnd - 1 },
        },
      });
    }

    elements.forEach((e) => {
      e.status = 'sorted';
    });

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      explanation: `Timsort complete! Array sorted in adaptive O(N log N) using natural run extraction and merge passes.`,
      variables: {
        totalElements: n,
        finalArray: `[${elements.map((e) => e.value).join(', ')}]`,
      },
      callStack: [{ name: 'complete()', params: { n }, line: 11, isCurrent: true }],
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
