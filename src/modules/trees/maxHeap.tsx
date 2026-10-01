import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { TreeStage, TreeStageState, TreeNode } from '../../components/stage/TreeStage';

interface MaxHeapState extends TreeStageState {
  heapArray: number[];
  currentIndex?: number;
  largestIndex?: number;
}

export const maxHeapModule: AlgorithmModule<number[], MaxHeapState> = {
  id: 'max-heap-build',
  title: "Max-Heap & Floyd's Build-Heap O(N)",
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'All subtrees require full sift-down to the leaf level',
  },
  theory: {
    overview:
      "A Max-Heap is a complete binary tree where the key at root is greater than or equal to the keys of its children. Floyd's Build-Heap builds a valid heap in linear O(N) time starting from the lowest internal nodes up to the root.",
    whyItWorks:
      "Naive insertion takes O(N log N) because each inserted item sifts up through height O(log N). Floyd's bottom-up method sifts downward. Most nodes reside near the bottom (N/2 are leaves requiring 0 operations, N/4 require 1 operation, N/8 require 2). Summing N * sum(h / 2^(h+1)) converges to strictly 2N = O(N).",
    invariant:
      'Max-Heap Invariant: For every node i, arr[i] >= arr[2*i + 1] and arr[i] >= arr[2*i + 2].',
    pitfalls: [
      "Starting Floyd's algorithm at N - 1 instead of floor(N/2) - 1 wastes comparisons on leaves.",
      'Off-by-one errors in left child (2*i + 1) and right child (2*i + 2) calculations.',
    ],
  },
  presets: [
    {
      id: 'unsorted-7',
      label: '7 Elements Unsorted',
      description: '[4, 10, 3, 5, 1, 9, 8]',
      data: [4, 10, 3, 5, 1, 9, 8],
    },
    {
      id: 'ascending-worst',
      label: 'Ascending Array (Max Work)',
      description: '[1, 2, 3, 4, 5, 6, 7]',
      data: [1, 2, 3, 4, 5, 6, 7],
    },
  ],
  defaultInput: [4, 10, 3, 5, 1, 9, 8],
  codeSnippets: {
    python: `def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def build_max_heap(arr):
    n = len(arr)
    # Start from last non-leaf node down to 0
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    return arr`,
    typescript: `function heapify(arr: number[], n: number, i: number): void {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

function buildMaxHeap(arr: number[]): number[] {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; --i) {
    heapify(arr, n, i);
  }
  return arr;
}`,
    cpp: `void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void buildMaxHeap(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; --i) {
        heapify(arr, n, i);
    }
}`,
    java: `void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int swap = arr[i]; arr[i] = arr[largest]; arr[largest] = swap;
        heapify(arr, n, largest);
    }
}

void buildMaxHeap(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
}`,
    pseudocode: `function buildMaxHeap(arr):
    n <- length(arr)
    for i from floor(n / 2) - 1 down to 0:
        heapify(arr, n, i)

function heapify(arr, n, i):
    largest <- i
    if 2*i + 1 < n and arr[2*i + 1] > arr[largest]: largest <- 2*i + 1
    if 2*i + 2 < n and arr[2*i + 2] > arr[largest]: largest <- 2*i + 2
    if largest != i:
        swap(arr[i], arr[largest])
        heapify(arr, n, largest)`,
  },
  generateTimeline: (input: number[]) => {
    const arr = input.length > 0 ? [...input.slice(0, 7)] : [4, 10, 3, 5, 1, 9, 8];
    const n = arr.length;

    const buildTreeNodes = (
      heap: number[],
      currIdx?: number,
      largestIdx?: number
    ): TreeNode[] => {
      const nodes: TreeNode[] = [];
      const getPos = (idx: number): { x: number; y: number } => {
        if (idx === 0) return { x: 350, y: 50 };
        if (idx === 1) return { x: 230, y: 120 };
        if (idx === 2) return { x: 470, y: 120 };
        if (idx === 3) return { x: 170, y: 190 };
        if (idx === 4) return { x: 290, y: 190 };
        if (idx === 5) return { x: 410, y: 190 };
        return { x: 530, y: 190 };
      };

      for (let i = 0; i < heap.length; ++i) {
        const { x, y } = getPos(i);
        nodes.push({
          id: `heap-${i}-${heap[i]}`,
          value: heap[i],
          x,
          y,
          status:
            i === currIdx
              ? 'active'
              : i === largestIdx
              ? 'comparing'
              : 'default',
        });
      }
      return nodes;
    };

    const frames: ExecutionFrame<MaxHeapState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 13,
      explanation: `Initialized arbitrary array [${arr.join(', ')}] of size ${n}. Floyd's linear Build-Heap will start at index ${
        Math.floor(n / 2) - 1
      }.`,
      isMilestone: true,
      milestoneTitle: 'Build-Heap Initialized',
      soundCue: { type: 'start' },
      variables: { n, startInternalNode: Math.floor(n / 2) - 1 },
      callStack: [{ name: 'buildMaxHeap', params: { n }, line: 13, isCurrent: true }],
      conditionEval: { expr: `n > 1`, result: true },
      state: {
        nodes: buildTreeNodes(arr),
        heapArray: [...arr],
      },
    });

    const siftDown = (idx: number) => {
      let largest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 2,
        explanation: `Heapify at node index ${idx} (val ${arr[idx]}). Left child index ${left} (${
          left < n ? arr[left] : 'None'
        }), right child index ${right} (${right < n ? arr[right] : 'None'}).`,
        soundCue: { type: 'compare' },
        variables: { idx, val: arr[idx], left, right, leftVal: left < n ? arr[left] : null, rightVal: right < n ? arr[right] : null },
        callStack: [{ name: 'heapifyDown', params: { idx, val: arr[idx] }, line: 2, isCurrent: true }],
        conditionEval: { expr: `idx < Math.floor(n / 2)`, result: idx < Math.floor(n / 2) },
        state: {
          nodes: buildTreeNodes(arr, idx),
          heapArray: [...arr],
          currentIndex: idx,
        },
      });

      if (left < n && arr[left] > arr[largest]) {
        largest = left;
      }
      if (right < n && arr[right] > arr[largest]) {
        largest = right;
      }

      if (largest !== idx) {
        const temp = arr[idx];
        arr[idx] = arr[largest];
        arr[largest] = temp;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `Violation: child arr[${largest}] (${arr[idx]}) > parent (${temp}). Swapped elements. Sifting downward.`,
          isMilestone: true,
          milestoneTitle: `Sift Down Swap (${temp} ↔ ${arr[idx]})`,
          soundCue: { type: 'swap' },
          variables: { parentIdx: idx, largestIdx: largest, swappedVal: arr[idx], demotedVal: temp },
          callStack: [{ name: 'swapNodes', params: { parentIdx: idx, childIdx: largest }, line: 10, isCurrent: true }],
          conditionEval: { expr: `largest !== idx`, result: true },
          state: {
            nodes: buildTreeNodes(arr, idx, largest),
            heapArray: [...arr],
            currentIndex: idx,
            largestIndex: largest,
          },
        });

        siftDown(largest);
      }
    };

    // Floyd's build loop
    for (let i = Math.floor(n / 2) - 1; i >= 0; --i) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 15,
        explanation: `Floyd's bottom-up scan: processing internal subtree rooted at index ${i} (value ${arr[i]}).`,
        isMilestone: true,
        milestoneTitle: `Processing Subtree Root #${i}`,
        soundCue: { type: 'step' },
        variables: { currentInternalIdx: i, val: arr[i] },
        callStack: [{ name: 'buildMaxHeap.loop', params: { i }, line: 15, isCurrent: true }],
        conditionEval: { expr: `i >= 0 (${i} >= 0)`, result: true },
        state: {
          nodes: buildTreeNodes(arr, i),
          heapArray: [...arr],
          currentIndex: i,
        },
      });
      siftDown(i);
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      explanation: `Floyd's Build-Heap complete in O(N) operations! Valid Max-Heap: [${arr.join(
        ', '
      )}]. Root holds max element ${arr[0]}.`,
      isMilestone: true,
      milestoneTitle: 'Build-Heap Complete',
      soundCue: { type: 'complete' },
      variables: { maxElement: arr[0], n, heapValid: true },
      callStack: [{ name: 'buildMaxHeap.done', params: { maxVal: arr[0] }, line: 16, isCurrent: true }],
      conditionEval: { expr: `i < 0`, result: true },
      state: {
        nodes: buildTreeNodes(arr),
        heapArray: [...arr],
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    const { heapArray, currentIndex } = frame.state;

    return (
      <div className="flex flex-col w-full h-full">
        {/* Array Representation HUD */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">Array Repr:</span>
            <div className="flex items-center gap-1.5">
              {heapArray.map((val, idx) => (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all duration-300 ${
                    idx === currentIndex
                      ? 'border-amber-400 bg-amber-950/70 text-amber-200 ring-2 ring-amber-400/40'
                      : 'border-slate-700 bg-slate-950 text-slate-200'
                  }`}
                >
                  <span className="text-[9px] text-slate-500 mr-1">#{idx}</span>
                  {val}
                </div>
              ))}
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Max Element: {heapArray[0]}
          </span>
        </div>

        <div className="flex-1 flex flex-col">
          <TreeStage state={frame.state} projection={projection} />
        </div>
      </div>
    );
  },
};
