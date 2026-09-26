// binaryHeap.tsx — Max Heap Insert & Sift-Up module
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

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
      totalSteps: 5,
      codeLine: 1,
      explanation: `Step 0: Existing Max Heap array: [${heap.join(', ')}]. Ready to insert ${newVal}.`,
      state: { heap: [...heap] },
    });

    // Step 1: Append new value at tail
    heap.push(newVal);
    let i = heap.length - 1;
    frames.push({
      stepIndex: 1,
      totalSteps: 5,
      codeLine: 2,
      explanation: `Step 1: Appended ${newVal} at index ${i} (last position to keep tree complete). Now sifting up!`,
      state: { heap: [...heap], activeIndices: [i] },
    });

    // Step 2: Sift up loop
    let step = 2;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);

      frames.push({
        stepIndex: step++,
        totalSteps: 5,
        codeLine: 6,
        explanation: `Step: Comparing child heap[${i}] (${heap[i]}) with parent heap[${parent}] (${heap[parent]}). Since ${heap[i]} > ${heap[parent]}, swap needed!`,
        state: { heap: [...heap], swappingIndices: [i, parent] },
      });

      if (heap[i] > heap[parent]) {
        [heap[i], heap[parent]] = [heap[parent], heap[i]];
        i = parent;

        frames.push({
          stepIndex: step++,
          totalSteps: 5,
          codeLine: 7,
          explanation: `Step: Swapped! Value ${newVal} moved up to index ${i}.`,
          state: { heap: [...heap], activeIndices: [i] },
        });
      } else {
        break;
      }
    }

    // Milestone complete
    frames.push({
      stepIndex: step,
      totalSteps: step + 1,
      codeLine: 11,
      isMilestone: true,
      milestoneTitle: 'Heap Property Satisfied',
      explanation: `Final Step: Max Heap property restored! Root is now ${heap[0]}.`,
      state: { heap: [...heap], activeIndices: [0] },
    });

    // Normalize stepIndex and totalSteps to actual frame count
    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<HeapState>) => {
    const { heap, activeIndices = [], swappingIndices } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 gap-8">
        {/* Array Compact Representation */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Array Representation (0-Indexed)
          </span>
          <div className="flex gap-1.5 p-2 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-lg">
            {heap.map((val, idx) => {
              const isActive = activeIndices.includes(idx);
              const isSwapping = swappingIndices?.includes(idx);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-11 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all duration-300 ${
                      isSwapping
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-110'
                        : isActive
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 scale-105'
                        : 'bg-slate-800 text-white border border-slate-700'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Binary Heap Tree Topology (SVG) */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Complete Binary Tree Topology
          </span>
          <svg viewBox="0 0 360 160" className="w-80 h-40">
            {/* Edges */}
            {heap.map((_, idx) => {
              if (idx === 0) return null;
              const parent = Math.floor((idx - 1) / 2);
              const coords = [
                { x: 180, y: 25 },
                { x: 90, y: 75 },
                { x: 270, y: 75 },
                { x: 45, y: 130 },
                { x: 135, y: 130 },
                { x: 225, y: 130 },
                { x: 315, y: 130 },
              ];
              const p = coords[parent];
              const c = coords[idx];
              if (!p || !c) return null;
              return (
                <line
                  key={`edge-${idx}`}
                  x1={p.x}
                  y1={p.y}
                  x2={c.x}
                  y2={c.y}
                  stroke="#38BDF8"
                  strokeWidth="2"
                  opacity="0.5"
                />
              );
            })}

            {/* Nodes */}
            {heap.map((val, idx) => {
              const coords = [
                { x: 180, y: 25 },
                { x: 90, y: 75 },
                { x: 270, y: 75 },
                { x: 45, y: 130 },
                { x: 135, y: 130 },
                { x: 225, y: 130 },
                { x: 315, y: 130 },
              ];
              const pos = coords[idx];
              if (!pos) return null;
              const isActive = activeIndices.includes(idx);
              const isSwapping = swappingIndices?.includes(idx);

              return (
                <g key={`node-${idx}`}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="15"
                    className="transition-all duration-300"
                    fill={isSwapping ? '#F59E0B' : isActive ? '#06B6D4' : '#1E293B'}
                    stroke={isSwapping ? '#FDE047' : isActive ? '#67E8F9' : '#0284C7'}
                    strokeWidth="2.5"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4.5}
                    textAnchor="middle"
                    fill={isSwapping || isActive ? '#000000' : '#FFFFFF'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {val}
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
