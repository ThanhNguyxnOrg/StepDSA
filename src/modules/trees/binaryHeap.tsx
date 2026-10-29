// binaryHeap.tsx — Max Heap Insert & Sift-Up module
import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { computeHeapLayout } from '../../utils/stageLayout';

export interface HeapState {
  heap: number[];
  activeIndices?: number[];
  swappingIndices?: [number, number];
}

export const binaryHeapModule: AlgorithmModule<number[], HeapState> = {
  id: 'binary-heap',
  title: 'Binary Heap (Max Heap Insert & Sift-Up)',
  category: 'trees-bst',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'New element is greater than all ancestors, sifting up to the root',
  },
  theory: {
    overview:
      'A Binary Heap is a complete binary tree stored compactly as an array where every parent node satisfies the heap-order property relative to its children.',
    whyItWorks:
      'Because the tree is strictly complete, child indices can be calculated arithmetically without pointers: left child = 2i + 1, right child = 2i + 2, parent = floor((i - 1) / 2).',
    invariant:
      'In a Max Heap, for every node i other than root, heap[parent(i)] >= heap[i].',
    pitfalls: [
      'Confusing 0-indexed formula parent = (i-1)//2 with 1-indexed formula parent = i//2.',
      'Assuming the left child is always smaller than the right child (heaps are not BSTs).',
    ],
  },
  codeSnippets: {
    python: `def insert_max_heap(heap, val):
    heap.append(val)
    i = len(heap) - 1
    while i > 0:
        parent = (i - 1) // 2
        if heap[i] > heap[parent]:
            heap[i], heap[parent] = heap[parent], heap[i]
            i = parent
        else:
            break
    return heap`,
    typescript: `function insertMaxHeap(heap: number[], val: number): number[] {
  heap.push(val);
  let i = heap.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[i] > heap[parent]) {
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    } else {
      break;
    }
  }
  return heap;
}`,
    cpp: `void insertMaxHeap(std::vector<int>& heap, int val) {
    heap.push_back(val);
    int i = heap.size() - 1;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[i] > heap[parent]) {
            std::swap(heap[i], heap[parent]);
            i = parent;
        } else break;
    }
}`,
    java: `public void insertMaxHeap(List<Integer> heap, int val) {
    heap.add(val);
    int i = heap.size() - 1;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap.get(i) > heap.get(parent)) {
            Collections.swap(heap, i, parent);
            i = parent;
        } else break;
    }
}`,
    pseudocode: `function insert(heap, val):
  append val to heap
  i = last index
  while i > 0:
    parent = (i - 1) / 2
    if heap[i] > heap[parent]:
      swap(heap[i], heap[parent])
      i = parent
    else:
      break`,
  },
  presets: [
    {
      id: 'default',
      label: 'Standard Max Heap (6 Nodes)',
      description: 'Insert 95 into max heap [80, 65, 75, 40, 50, 60]',
      data: [80, 65, 75, 40, 50, 60],
    },
  ],
  defaultInput: [80, 65, 75, 40, 50, 60],
  generateTimeline: (input: number[]): ExecutionFrame<HeapState>[] => {
    const frames: ExecutionFrame<HeapState>[] = [];
    const heap = [...input];
    const newVal = 95;

    // Step 0: Initial valid heap
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Step 0: Initialized Max Heap with [${heap.join(', ')}]. Parent invariant heap[i] >= heap[2i+1], heap[2i+2] holds. Ready to insert ${newVal}.`,
      isMilestone: true,
      milestoneTitle: 'Initialized Max Heap',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'insertMaxHeap(heap, val)', params: { size: heap.length, val: newVal }, line: 1, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { size: heap.length, root: heap[0], inserting: newVal },
      state: { heap: [...heap] },
    });

    // Step 1: Append new value at tail
    heap.push(newVal);
    let i = heap.length - 1;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Step 1: Appended ${newVal} at index ${i} (last position to preserve complete binary tree shape). Now sifting up!`,
      soundCue: { type: 'step' },
      callStack: [
        { name: 'insertMaxHeap(heap, val)', params: { index: i, val: newVal }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { currentIndex: i, currentValue: newVal, heapSize: heap.length },
      state: { heap: [...heap], activeIndices: [i] },
    });

    // Step 2: Sift up loop
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      const needsSwap = heap[i] > heap[parent];

      // Comparison frame
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Comparing child heap[${i}] (${heap[i]}) with parent heap[${parent}] (${heap[parent]}). Condition ${heap[i]} > ${heap[parent]} is ${needsSwap ? 'TRUE (swap needed)' : 'FALSE (heap invariant satisfied)'}.`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'siftUp(i)', params: { i, parent, childVal: heap[i], parentVal: heap[parent] }, line: 6, isCurrent: true },
          { name: 'insertMaxHeap()', params: { val: newVal }, line: 4 },
        ],
        variables: { childIndex: i, parentIndex: parent, childVal: heap[i], parentVal: heap[parent], needsSwap },
        conditionEval: { expr: `heap[${i}] (${heap[i]}) > heap[${parent}] (${heap[parent]})`, result: needsSwap },
        state: { heap: [...heap], swappingIndices: [i, parent] },
      });

      if (needsSwap) {
        [heap[i], heap[parent]] = [heap[parent], heap[i]];
        i = parent;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `Swapped! Value ${newVal} climbed up to index ${i}.`,
          soundCue: { type: 'swap' },
          callStack: [
            { name: 'siftUp(i)', params: { newPosition: i }, line: 7, isCurrent: true },
            { name: 'insertMaxHeap()', params: { val: newVal }, line: 4 },
          ],
          variables: { currentIndex: i, currentValue: newVal },
          state: { heap: [...heap], activeIndices: [i] },
        });
      } else {
        break;
      }
    }

    // Insert complete milestone
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      isMilestone: true,
      milestoneTitle: `Inserted ${newVal} Successfully`,
      soundCue: { type: 'sorted' },
      explanation: `Insertion complete! Max Heap invariant restored with ${newVal} positioned at index ${i}. Root is now ${heap[0]}.`,
      callStack: [{ name: 'insertMaxHeap()', params: { root: heap[0] }, line: 11, isCurrent: true }],
      variables: { root: heap[0], finalIndex: i, heapSize: heap.length },
      state: { heap: [...heap], activeIndices: [i] },
    });

    // Step 3: Demonstrate Extract-Max
    const maxExtracted = heap[0];
    const lastElement = heap.pop()!;
    heap[0] = lastElement;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      isMilestone: true,
      milestoneTitle: `Extract-Max (${maxExtracted})`,
      soundCue: { type: 'step' },
      explanation: `Extract-Max: Removed root ${maxExtracted}. Replaced root with last element (${lastElement}). Now sifting down from root.`,
      callStack: [
        { name: 'extractMax(heap)', params: { extracted: maxExtracted, newRoot: lastElement }, line: 14, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { extractedMax: maxExtracted, temporaryRoot: lastElement, heapSize: heap.length },
      state: { heap: [...heap], activeIndices: [0] },
    });

    // Sift down loop
    let curr = 0;
    while (true) {
      let largest = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < heap.length && heap[left] > heap[largest]) {
        largest = left;
      }
      if (right < heap.length && heap[right] > heap[largest]) {
        largest = right;
      }

      if (largest !== curr) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          explanation: `Sift-Down: Node heap[${curr}] (${heap[curr]}) is smaller than largest child heap[${largest}] (${heap[largest]}). Swapping!`,
          soundCue: { type: 'compare' },
          callStack: [
            { name: 'siftDown(curr)', params: { curr, largestChild: largest }, line: 18, isCurrent: true },
            { name: 'extractMax()', params: {}, line: 14 },
          ],
          variables: { currIndex: curr, largestChildIndex: largest, childVal: heap[largest] },
          conditionEval: { expr: `heap[${largest}] > heap[${curr}]`, result: true },
          state: { heap: [...heap], swappingIndices: [curr, largest] },
        });

        [heap[curr], heap[largest]] = [heap[largest], heap[curr]];
        curr = largest;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 19,
          explanation: `Sift-Down: Swapped! Element moved down to index ${curr}.`,
          soundCue: { type: 'swap' },
          callStack: [{ name: 'siftDown(curr)', params: { newCurr: curr }, line: 19, isCurrent: true }],
          variables: { currentIndex: curr, currentValue: heap[curr] },
          state: { heap: [...heap], activeIndices: [curr] },
        });
      } else {
        break;
      }
    }

    // Final complete milestone
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 22,
      isMilestone: true,
      milestoneTitle: 'Heap Operations Complete',
      soundCue: { type: 'complete' },
      explanation: `🎉 Max Heap operations complete! Both O(log N) insert and extract-max verified. Final root = ${heap[0]}.`,
      callStack: [{ name: 'main()', params: { finalRoot: heap[0], size: heap.length }, line: 22, isCurrent: true }],
      variables: { finalRoot: heap[0], finalHeap: `[${heap.join(', ')}]`, finalSize: heap.length },
      state: { heap: [...heap], activeIndices: [0] },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<HeapState>) => {
    const { heap, activeIndices = [], swappingIndices } = frame.state;
    const { coords, width, height } = computeHeapLayout(heap.length, 54, 62);

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-5 overflow-auto">
        {/* Array Compact Representation */}
        <div className="flex flex-col items-center gap-1.5 max-w-full">
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Array Backing Store (0-Indexed · Parent = floor((i-1)/2))
          </span>
          <div className="flex flex-wrap justify-center gap-1.5 p-2.5 bg-[#111827] border border-[#1F293D] rounded-xl shadow-md">
            {heap.map((val, idx) => {
              const isActive = activeIndices.includes(idx);
              const isSwapping = swappingIndices?.includes(idx);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs tabular-nums transition-all duration-200 border ${
                      isSwapping
                        ? 'bg-rose-500/25 border-rose-500 text-rose-200 ring-2 ring-rose-500/40 scale-105'
                        : isActive
                        ? 'bg-amber-500/25 border-amber-500 text-amber-200 ring-2 ring-amber-500/40 scale-105'
                        : idx === 0
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-800/90 text-white border-slate-700'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums mt-0.5">
                    [{idx}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Binary Heap Tree Topology (Dynamic Responsive SVG) */}
        <div className="flex flex-col items-center w-full overflow-x-auto">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Complete Binary Tree Topology ({heap.length} Nodes)
          </span>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: `${Math.min(720, Math.max(380, width))}px`, height: `${height}px` }}
            className="overflow-visible"
          >
            {/* Edges */}
            {heap.map((_, idx) => {
              if (idx === 0) return null;
              const parent = Math.floor((idx - 1) / 2);
              const p = coords[parent];
              const c = coords[idx];
              if (!p || !c) return null;
              const isEdgeActive =
                (activeIndices.includes(idx) && activeIndices.includes(parent)) ||
                (swappingIndices?.includes(idx) && swappingIndices?.includes(parent));
              return (
                <line
                  key={`edge-${idx}`}
                  x1={p.x}
                  y1={p.y}
                  x2={c.x}
                  y2={c.y}
                  stroke={isEdgeActive ? '#F59E0B' : '#334155'}
                  strokeWidth={isEdgeActive ? '2.5' : '2'}
                />
              );
            })}

            {/* Nodes */}
            {heap.map((val, idx) => {
              const pos = coords[idx];
              if (!pos) return null;
              const isActive = activeIndices.includes(idx);
              const isSwapping = swappingIndices?.includes(idx);

              return (
                <g key={`node-${idx}`}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="17"
                    className="transition-all duration-200"
                    fill={
                      isSwapping
                        ? '#F43F5E'
                        : isActive
                        ? '#F59E0B'
                        : idx === 0
                        ? '#065F46'
                        : '#1E293B'
                    }
                    stroke={
                      isSwapping
                        ? '#FDA4AF'
                        : isActive
                        ? '#FDE047'
                        : idx === 0
                        ? '#10B981'
                        : '#475569'
                    }
                    strokeWidth="2"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill={isSwapping || isActive ? '#0B0F19' : '#FFFFFF'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 27}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    [{idx}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
