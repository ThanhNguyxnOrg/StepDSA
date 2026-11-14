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
            break
    return heap
function extractMax(heap):
    max = heap[0]; heap[0] = heap.pop()
    i = 0
    while true:
        largest = max of i, 2i+1, 2i+2 within bounds
        if largest == i: break
        swap(heap[i], heap[largest])
        i = largest
    return max`,
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

    let checkpointAdded = false;

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
      pedagogy: {
        what: `A binary heap is a complete tree stored in an array: children of i live at 2i+1 and 2i+2, parent (i-1)/2.`,
        why: 'The max-heap property heap[parent] >= heap[child] makes the maximum the root in O(1), at the price of fixing one path per change.',
        whatNext: `Append ${newVal} at the first free slot to keep the tree complete.`,
      },
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
      pedagogy: {
        what: `${newVal} starts at the very bottom (index ${i}).`,
        why: 'Appending keeps the shape complete; the order is what sift-up will repair.',
        whatNext: `Compare ${newVal} with its parent.`,
      },
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
        pedagogy: {
          what: `heap[${i}] = ${heap[i]} vs heap[${parent}] = ${heap[parent]}: ${needsSwap ? 'the child is larger, so the pair is inverted.' : 'the parent is already at least as large — the invariant holds here.'}`,
          why: 'Only this ancestor chain can be violated by the append; everything else was a valid heap before.',
          whatNext: needsSwap ? 'Swap the pair and climb one level.' : 'Stop: the heap property is restored.',
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'binary-heap-single-path',
              question: 'Why does fixing a single ancestor path restore the heap after an insert?',
              options: [
                'Only the appended node\'s ancestors can violate the invariant, so sift-up repairs one path and every other parent-child pair was already valid',
                'Because the heap array is kept sorted left to right',
              ],
              correctIndex: 0,
              explanation:
                'Insert changes exactly one leaf; a violation can only propagate upward. Sift-up stops at the first valid parent, so O(log n) fixes suffice. Extract-max mirrors this downward.',
            }
          : undefined,
        state: { heap: [...heap], swappingIndices: [i, parent] },
      });
      checkpointAdded = true;

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
          pedagogy: {
            what: `${newVal} moved up one level to index ${i}.`,
            why: 'Swapping with the parent is the only way to move a larger value upward without breaking anything else.',
            whatNext: i > 0 ? 'Continue comparing with the next parent.' : 'Reached the root — the heap is fully repaired.',
          },
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
      explanation: `return heap: insertion complete with ${newVal} positioned at index ${i}. Root is now ${heap[0]}.`,
      callStack: [{ name: 'insertMaxHeap()', params: { root: heap[0] }, line: 11, isCurrent: true }],
      variables: { root: heap[0], finalIndex: i, heapSize: heap.length },
      pedagogy: {
        what: `The sift-up visited ${heap.length > 0 ? 'a suffix of one ancestor path' : 'nothing'} and stopped at the first valid parent.`,
        why: 'Total cost O(log n): at most one swap per level of a complete tree.',
        whatNext: 'Demonstrate the symmetric operation: extract the maximum.',
      },
      state: { heap: [...heap], activeIndices: [i] },
    });

    // Step 3: Demonstrate Extract-Max
    const maxExtracted = heap[0];
    const lastElement = heap.pop()!;
    heap[0] = lastElement;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 13,
      isMilestone: true,
      milestoneTitle: `Extract-Max (${maxExtracted})`,
      soundCue: { type: 'step' },
      explanation: `max = heap[0] (${maxExtracted}); heap[0] = heap.pop() (${lastElement}). The shape stays complete and sift-down repairs the order from the root.`,
      callStack: [
        { name: 'extractMax(heap)', params: { extracted: maxExtracted, newRoot: lastElement }, line: 13, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { extractedMax: maxExtracted, temporaryRoot: lastElement, heapSize: heap.length },
      pedagogy: {
        what: `The maximum was the root ${maxExtracted}. The last element ${lastElement} takes its place temporarily.`,
        why: 'Removing the root would break the tree shape; overwriting it with the last leaf keeps the complete-tree array compact before re-ordering.',
        whatNext: 'Sift the temporary root down to its correct level.',
      },
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

      const leftVal = left < heap.length ? heap[left] : 'none';
      const rightVal = right < heap.length ? heap[right] : 'none';

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 16,
        action: 'FIND_LARGEST_CHILD',
        explanation: `Sift-Down at index ${curr} (${heap[curr]}): compare with children left=${leftVal}${left < heap.length ? ` (idx ${left})` : ''}, right=${rightVal}${right < heap.length ? ` (idx ${right})` : ''} → largest is index ${largest}.`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'siftDown(curr)', params: { curr, largestChild: largest }, line: 16, isCurrent: true },
          { name: 'extractMax()', params: {}, line: 13 },
        ],
        variables: { currIndex: curr, currVal: heap[curr], leftVal: String(leftVal), rightVal: String(rightVal), largestChildIndex: largest },
        conditionEval: { expr: `largest == ${curr}`, result: largest === curr },
        pedagogy: {
          what: `Among {${heap[curr]}, ${leftVal}, ${rightVal}} the largest is ${heap[largest]}.`,
          why: 'A max-heap only needs the maximum child: swapping with it restores the local invariant, and the other child can never be larger than the new parent.',
          whatNext: largest === curr ? 'The node is already the largest — stop.' : `Swap with child at index ${largest}.`,
        },
        state: { heap: [...heap], swappingIndices: [curr, largest] },
      });

      if (largest !== curr) {
        [heap[curr], heap[largest]] = [heap[largest], heap[curr]];
        curr = largest;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 18,
          explanation: `swap(heap[i], heap[largest]) done: the element moved down to index ${curr}.`,
          soundCue: { type: 'swap' },
          callStack: [{ name: 'siftDown(curr)', params: { newCurr: curr }, line: 18, isCurrent: true }],
          variables: { currentIndex: curr, currentValue: heap[curr] },
          pedagogy: {
            what: `The larger child rose one level; the displaced value continues falling from index ${curr}.`,
            why: 'Sift-down is the mirror of sift-up: one path from root toward the leaves, O(log n) swaps.',
            whatNext: 'Repeat the comparison at the new position.',
          },
          state: { heap: [...heap], activeIndices: [curr] },
        });
      } else {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 17,
          action: 'SIFT_DOWN_DONE',
          explanation: `largest == i (${curr}): node ${heap[curr]} is at least as large as both children. Break — the heap is valid again.`,
          soundCue: { type: 'sorted' },
          callStack: [{ name: 'siftDown(curr)', params: { stopAt: curr }, line: 17, isCurrent: true }],
          variables: { stoppedAtIndex: curr, value: heap[curr] },
          conditionEval: { expr: `largest == i`, result: true },
          pedagogy: {
            what: `The falling element found a valid home at index ${curr}.`,
            why: 'Once a node is ≥ both children, every descendant below is already in order — no further checks needed.',
            whatNext: 'Return the extracted maximum.',
          },
          state: { heap: [...heap], activeIndices: [curr] },
        });
        break;
      }
    }

    // Final complete milestone
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 20,
      isMilestone: true,
      milestoneTitle: 'Heap Operations Complete',
      soundCue: { type: 'complete' },
      explanation: `return max: both O(log N) insert and extract-max verified. Final root = ${heap[0]}.`,
      callStack: [{ name: 'main()', params: { finalRoot: heap[0], size: heap.length }, line: 20, isCurrent: true }],
      variables: { finalRoot: heap[0], finalHeap: `[${heap.join(', ')}]`, finalSize: heap.length },
      pedagogy: {
        what: `Final heap array [${heap.join(', ')}] with root ${heap[0]} — the new maximum.`,
        why: 'Both operations touched a single O(log n) path; arrays give the complete tree its cache-friendly layout.',
        whatNext: 'Compare with a sorted array: heaps trade full order for fast max access and fast updates.',
      },
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
