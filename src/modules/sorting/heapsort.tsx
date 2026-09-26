import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const heapsortModule: AlgorithmModule<number[], ArrayStageState> = {
  id: 'heapsort',
  title: 'Heapsort (Max-Heap In-Place)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'All inputs guarantee O(N log N) runtime; no degenerate quadratic worst-case.',
  },
  theory: {
    overview:
      'Heapsort transforms the unsorted array into a binary max-heap, where each parent is greater than or equal to its children. It then repeatedly extracts the maximum element at the root, swaps it to the current end of the array, and sifts down the new root to restore the max-heap property.',
    whyItWorks:
      'The max-heap property guarantees that the root (index 0) always contains the largest remaining element. Placing it at index i and reducing the active heap boundary by 1 incrementally builds the sorted suffix in-place.',
    invariant:
      'During phase 2 at iteration i, arr[0 ... i] satisfies the max-heap invariant, and suffix arr[i+1 ... N-1] contains the N-1-i largest elements in sorted ascending order.',
    pitfalls: [
      'Cache locality is poorer than Quicksort due to power-of-two index jumping (2*i + 1, 2*i + 2).',
      'Heapsort is an unstable sort; equal elements can have their relative orders inverted during sifting.',
    ],
  },
  presets: [
    { id: 'random', label: 'Random Array', description: 'Average case demonstration', data: [35, 12, 45, 9, 28, 50, 18] },
    { id: 'reversed', label: 'Reversed Array', description: 'Already a max-heap candidate', data: [60, 50, 40, 30, 20, 10] },
    { id: 'nearly-sorted', label: 'Nearly Sorted', description: 'Ascending array', data: [10, 15, 25, 30, 45, 60] },
  ],
  defaultInput: [35, 12, 45, 9, 28, 50, 18],
  codeSnippets: {
    python: `def heapsort(arr):
    n = len(arr)
    # Build max-heap
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, n, i)
    # Extract elements from heap
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        sift_down(arr, i, 0)

def sift_down(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        sift_down(arr, n, largest)`,
    typescript: `function heapsort(arr: number[]): void {
  const n = arr.length;
  // Build max-heap (bottom-up)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, n, i);
  }
  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    siftDown(arr, i, 0);
  }
}

function siftDown(arr: number[], n: number, i: number): void {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    siftDown(arr, n, largest);
  }
}`,
    cpp: `void siftDown(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        siftDown(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        siftDown(arr, i, 0);
    }
}`,
    java: `public void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        siftDown(arr, i, 0);
    }
}

private void siftDown(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;
        siftDown(arr, n, largest);
    }
}`,
    pseudocode: `function heapSort(arr):
    n = length(arr)
    for i = floor(n / 2) - 1 down to 0:
        siftDown(arr, n, i)
    for i = n - 1 down to 1:
        swap arr[0] with arr[i]
        siftDown(arr, i, 0)`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<ArrayStageState>[] => {
    const frames: ExecutionFrame<ArrayStageState>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedIndices = new Set<number>();

    const makeState = (
      activeIdxs: number[] = [],
      comparingIdxs: number[] = [],
      pivotIdx?: number,
      heapSize: number = n
    ): ArrayStageState => {
      return {
        array: arr.map((val, idx) => ({
          id: idx,
          value: val,
          status: sortedIndices.has(idx)
            ? 'sorted'
            : idx >= heapSize
            ? 'sorted'
            : pivotIdx === idx
            ? 'pivot'
            : activeIdxs.includes(idx)
            ? 'active'
            : comparingIdxs.includes(idx)
            ? 'comparing'
            : 'default',
        })),
        pointers: {
          ...(pivotIdx !== undefined ? { root: pivotIdx } : {}),
          ...(activeIdxs[0] !== undefined ? { active: activeIdxs[0] } : {}),
          ...(heapSize < n ? { heapEnd: heapSize - 1 } : {}),
        },
      };
    };

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Heapsort on array of size ${n}. Phase 1: Build Max-Heap via bottom-up sift-down.`,
      isMilestone: true,
      milestoneTitle: 'Build Max-Heap Start',
      soundCue: 'start',
      scopeVariables: { n, phase: 'build-heap' },
      state: makeState(),
    });

    const siftDown = (heapLimit: number, rootIdx: number) => {
      let current = rootIdx;
      while (true) {
        let largest = current;
        const left = 2 * current + 1;
        const right = 2 * current + 2;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          explanation: `Inspecting node index ${current} (val: ${arr[current]}). Left child: ${left < heapLimit ? `index ${left} (val: ${arr[left]})` : 'none'}, Right child: ${right < heapLimit ? `index ${right} (val: ${arr[right]})` : 'none'}.`,
          soundCue: 'compare',
          scopeVariables: { current, largest, left, right, heapLimit },
          state: makeState([current], [left, right].filter((idx) => idx < heapLimit), current, heapLimit),
        });

        if (left < heapLimit && arr[left] > arr[largest]) {
          largest = left;
        }
        if (right < heapLimit && arr[right] > arr[largest]) {
          largest = right;
        }

        if (largest !== current) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 24,
            explanation: `Child at index ${largest} (val: ${arr[largest]}) > parent at index ${current} (val: ${arr[current]}). Swapping to restore max-heap.`,
            soundCue: 'swap',
            scopeVariables: { current, largest, heapLimit },
            state: makeState([current, largest], [], largest, heapLimit),
          });

          const tmp = arr[current];
          arr[current] = arr[largest];
          arr[largest] = tmp;

          current = largest;
        } else {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 27,
            explanation: `Subtree rooted at index ${current} satisfies max-heap invariant.`,
            soundCue: 'step',
            scopeVariables: { current, heapLimit },
            state: makeState([], [], undefined, heapLimit),
          });
          break;
        }
      }
    };

    // Phase 1: Build max-heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Phase 1: Sifting down internal node at index ${i} (value: ${arr[i]}).`,
        isMilestone: true,
        milestoneTitle: `Sift Down node ${i}`,
        scopeVariables: { i, heapSize: n },
        state: makeState([i], [], i, n),
      });
      siftDown(n, i);
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: '✅ Max-heap successfully constructed! Root contains maximum element. Starting Phase 2: Extraction.',
      isMilestone: true,
      milestoneTitle: 'Max-Heap Ready',
      soundCue: 'success',
      scopeVariables: { max: arr[0], phase: 'extract-max' },
      state: makeState([], [], 0, n),
    });

    // Phase 2: Extract elements
    for (let i = n - 1; i > 0; i--) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Extracting max element ${arr[0]} from root. Swapping with boundary element ${arr[i]} at index ${i}.`,
        soundCue: 'swap',
        isMilestone: true,
        milestoneTitle: `Extract Max (${arr[0]})`,
        scopeVariables: { rootMax: arr[0], targetIdx: i, heapSize: i },
        state: makeState([0, i], [], 0, i + 1),
      });

      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      sortedIndices.add(i);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Element ${temp} locked in sorted partition at index ${i}. Re-sifting new root ${arr[0]} down heap of size ${i}.`,
        soundCue: 'sorted',
        scopeVariables: { sortedIndex: i, newRoot: arr[0], heapSize: i },
        state: makeState([0], [], 0, i),
      });

      siftDown(i, 0);
    }

    sortedIndices.add(0);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      explanation: '🎉 Heapsort complete! All elements in non-decreasing order.',
      isMilestone: true,
      milestoneTitle: 'Sorted Complete',
      soundCue: 'complete',
      scopeVariables: { finalArray: arr.join(', ') },
      state: {
        array: arr.map((val, idx) => ({ id: idx, value: val, status: 'sorted' })),
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
