import { AlgorithmModule, ElementStatus, ExecutionFrame } from '../../core/types';
import { ArrayElement } from '../../components/stage/ArrayStage';
import {
  HeapSortPhase,
  HeapSortStage,
  HeapSortStatusKind,
  HeapSortView,
} from '../../components/stage/HeapSortStage';

interface HeapSortState {
  array: ArrayElement[];
  pointers?: Record<string, number>;
  heapView: HeapSortView;
}

export const heapsortModule: AlgorithmModule<number[], HeapSortState> = {
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
    python: `def heap_sort(arr):
    n = len(arr)
    # Phase 1: build max-heap bottom-up
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, n, i)
    # Phase 2: extract max, shrink the heap
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        sift_down(arr, i, 0)
    return arr

def sift_down(arr, n, i):
    while i < n:
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        if left < n and arr[left] > arr[largest]:
            largest = left
        if right < n and arr[right] > arr[largest]:
            largest = right
        if largest == i:
            break  # subtree already satisfies the max-heap property
        arr[i], arr[largest] = arr[largest], arr[i]
        i = largest  # continue sifting down`,
    typescript: `function heapSort(arr: number[]): void {
  const n = arr.length;
  // Phase 1: build max-heap bottom-up
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, n, i);
  }
  // Phase 2: extract max, shrink the heap
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    siftDown(arr, i, 0);
  }
}

function siftDown(arr: number[], n: number, i: number): void {
  while (i < n) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest === i) break; // subtree already satisfies the max-heap property
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest; // continue sifting down
  }
}`,
    cpp: `void siftDown(vector<int>& arr, int n, int i) {
    while (i < n) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }
        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }
        if (largest == i) {
            break; // subtree already satisfies the max-heap property
        }
        swap(arr[i], arr[largest]);
        i = largest; // continue sifting down
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
    while (i < n) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < n && arr[left] > arr[largest]) {
            largest = left;
        }
        if (right < n && arr[right] > arr[largest]) {
            largest = right;
        }
        if (largest == i) {
            break; // subtree already satisfies the max-heap property
        }
        int swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;
        i = largest; // continue sifting down
    }
}`,
    pseudocode: `function heapSort(arr):
    n = length(arr)
    # Phase 1: build max-heap bottom-up
    for i = floor(n / 2) - 1 down to 0:
        siftDown(arr, n, i)
    # Phase 2: extract max, shrink the heap
    for i = n - 1 down to 1:
        swap arr[0] with arr[i]
        siftDown(arr, i, 0)
    return arr

function siftDown(arr, n, i):
    while i < n:
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        if left < n and arr[left] > arr[largest]:
            largest = left
        if right < n and arr[right] > arr[largest]:
            largest = right
        if largest == i:
            break  # subtree already satisfies the max-heap property
        swap arr[i] with arr[largest]
        i = largest  # continue sifting down`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<HeapSortState>[] => {
    const frames: ExecutionFrame<HeapSortState>[] = [];
    const arr = [...input];
    const n = arr.length;
    const sortedIndices = new Set<number>();
    let heapPhase: HeapSortPhase = 'build';
    let checkpointAdded = false;

    const baseCallStack = [{ name: 'heapSort', params: { n }, line: 1, isCurrent: true }];

    interface SnapshotOpts {
      heapSize?: number;
      statusKind?: HeapSortStatusKind;
      statusLabel?: string;
      currentNode?: number;
      leftChild?: number;
      rightChild?: number;
      chosenChild?: number;
      swappingIdxs?: number[];
      activeIdxs?: number[];
      comparingIdxs?: number[];
      pivotIdx?: number;
      milestone?: string;
      soundCue?: any;
      variables?: Record<string, any>;
      conditionEval?: { expr: string; result: boolean };
      callStack?: any[];
      pedagogy?: ExecutionFrame['pedagogy'];
      checkpoint?: ExecutionFrame['checkpoint'];
    }

    const snapshot = (codeLine: number, explanation: string, opts: SnapshotOpts) => {
      const heapSize = opts.heapSize ?? n;
      const activeIdxs = opts.activeIdxs ?? [];
      const comparingIdxs = opts.comparingIdxs ?? [];
      const swappingIdxs = opts.swappingIdxs ?? [];
      const statusFor = (idx: number): ElementStatus => {
        if (sortedIndices.has(idx)) return 'sorted';
        if (swappingIdxs.includes(idx)) return 'swapping';
        if (opts.pivotIdx === idx) return 'pivot';
        if (activeIdxs.includes(idx)) return 'active';
        if (comparingIdxs.includes(idx)) return 'comparing';
        return 'default';
      };

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        explanation,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        callStack: opts.callStack ?? baseCallStack,
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        state: {
          array: arr.map((val, idx) => ({ id: idx, value: val, status: statusFor(idx) })),
          pointers: {
            ...(opts.currentNode !== undefined ? { root: opts.currentNode } : {}),
            ...(heapSize < n ? { heapEnd: heapSize - 1 } : {}),
          },
          heapView: {
            heapSize,
            phase: heapPhase,
            statusLabel: opts.statusLabel,
            statusKind: opts.statusKind,
            currentNode: opts.currentNode,
            leftChild: opts.leftChild,
            rightChild: opts.rightChild,
            chosenChild: opts.chosenChild,
            swapping: swappingIdxs.length > 0 ? [...swappingIdxs] : undefined,
          },
        },
      });
    };

    // Initial frame
    snapshot(
      1,
      `Initialized Heapsort on ${n} element(s). Phase 1: bottom-up build of a max-heap by sifting down every internal node.`,
      {
        heapSize: n,
        statusKind: 'init',
        statusLabel: `INIT: build max-heap (${n} nodes)`,
        milestone: 'Build Max-Heap Start',
        soundCue: 'start',
        variables: { n, phase: 'build-heap' },
        conditionEval: { expr: `n > 1`, result: n > 1 },
        pedagogy: {
          what: `The whole array [0..${n - 1}] is interpreted as a complete binary tree: children of i are 2i+1 and 2i+2.`,
          why: 'Building the heap bottom-up costs O(N) because most nodes are near the leaves.',
          whatNext: `Start sifting down from the last internal node (index ${Math.floor(n / 2) - 1}).`,
        },
      }
    );

    const siftDown = (heapLimit: number, rootIdx: number) => {
      let current = rootIdx;
      while (current < heapLimit) {
        const left = 2 * current + 1;
        const right = 2 * current + 2;
        const hasLeft = left < heapLimit;
        const hasRight = right < heapLimit;

        snapshot(
          13,
          `Inspect node ${current} (${arr[current]}): ${hasLeft ? `left child ${left} = ${arr[left]}` : 'no left child'}${hasRight ? `, right child ${right} = ${arr[right]}` : ''}.`,
          {
            heapSize: heapLimit,
            statusKind: 'inspect',
            statusLabel: `SIFT-DOWN: inspect node ${current} (${arr[current]})`,
            currentNode: current,
            leftChild: hasLeft ? left : undefined,
            rightChild: hasRight ? right : undefined,
            activeIdxs: [current],
            comparingIdxs: [left, right].filter((idx) => idx < heapLimit),
            variables: { current, largest: current, left, right, heapLimit },
            conditionEval: { expr: `current < heapLimit (${current} < ${heapLimit})`, result: true },
            callStack: [
              ...baseCallStack,
              { name: 'siftDown', params: { root: rootIdx, current, heapLimit }, line: 13, isCurrent: true },
            ],
            pedagogy: {
              what: `Node ${current} holds ${arr[current]}; its subtree must satisfy parent ≥ children.`,
              why: 'Only the frontier between the node and its children can violate the max-heap property — everything below is already a valid heap.',
              whatNext: hasLeft
                ? `Compare the left child ${arr[left]} against the current largest (${arr[current]}).`
                : 'This node is a leaf; there is nothing to compare.',
            },
          }
        );

        if (!hasLeft && !hasRight) {
          snapshot(
            22,
            `Node ${current} (${arr[current]}) is a leaf: no children exist, so its one-node subtree is trivially a valid max-heap. Stop sifting.`,
            {
              heapSize: heapLimit,
              statusKind: 'noswap',
              statusLabel: `LEAF: node ${current} — stop`,
              currentNode: current,
              activeIdxs: [current],
              variables: { current, largest: current, left, right, heapLimit },
              conditionEval: { expr: `largest == i (leaf, no children)`, result: true },
              callStack: [
                ...baseCallStack,
                { name: 'siftDown', params: { root: rootIdx, current, heapLimit }, line: 22, isCurrent: true },
              ],
              pedagogy: {
                what: `A leaf has no children, so it cannot violate parent ≥ children.`,
                why: 'This is the natural base case of sift-down; the recursion (loop) ends here.',
                whatNext: 'Return control to the caller.',
              },
            }
          );
          break;
        }

        let largest = current;
        if (hasLeft) {
          const leftValue = arr[left];
          const largestValue = arr[largest];
          const leftWins = leftValue > largestValue;
          if (leftWins) largest = left;
          snapshot(
            17,
            leftWins
              ? `Left child ${leftValue} (index ${left}) > current largest ${largestValue} — the left child becomes the new largest.`
              : `Left child ${leftValue} (index ${left}) ≤ current largest ${largestValue} — the current node stays largest for now.`,
            {
              heapSize: heapLimit,
              statusKind: 'compare',
              statusLabel: `COMPARE left: ${leftValue} vs ${largestValue}`,
              currentNode: current,
              leftChild: left,
              chosenChild: leftWins ? left : undefined,
              activeIdxs: [current],
              comparingIdxs: [left],
              variables: { current, left, 'arr[left]': leftValue, 'arr[largest]': largestValue, largest, heapLimit },
              conditionEval: { expr: `arr[${left}] > arr[${largest}] (${leftValue} > ${largestValue})`, result: leftWins },
              callStack: [
                ...baseCallStack,
                { name: 'siftDown', params: { root: rootIdx, current, left }, line: 17, isCurrent: true },
              ],
              pedagogy: {
                what: `The left child was compared against the largest candidate so far.`,
                why: 'Sift-down always moves the largest of {parent, left, right} up, never a smaller value.',
                whatNext: hasRight
                  ? `Compare the right child ${arr[right]} against the largest (${arr[largest]} now).`
                  : 'No right child exists; decide whether to swap.',
              },
              checkpoint: !checkpointAdded
                ? {
                    id: 'heapsort-first-left-compare',
                    question: `Node ${current} holds ${arr[current]} and its left child holds ${leftValue}. Does the left child become the new largest?`,
                    options: [
                      `Yes — ${leftValue} is larger`,
                      `No — keep the current largest`,
                    ],
                    correctIndex: leftWins ? 0 : 1,
                    explanation: leftWins
                      ? `${leftValue} > ${largestValue}, so largest moves to index ${left}.`
                      : `${leftValue} ≤ ${largestValue}, so the current largest stays unchanged.`,
                  }
                : undefined,
            }
          );
          checkpointAdded = true;
        }

        if (hasRight) {
          const rightValue = arr[right];
          const largestValue = arr[largest];
          const rightWins = rightValue > largestValue;
          if (rightWins) largest = right;
          snapshot(
            19,
            rightWins
              ? `Right child ${rightValue} (index ${right}) > largest so far ${largestValue} — the right child becomes the new largest.`
              : `Right child ${rightValue} (index ${right}) ≤ largest so far ${largestValue} — the largest stays where it is.`,
            {
              heapSize: heapLimit,
              statusKind: 'compare',
              statusLabel: `COMPARE right: ${rightValue} vs ${largestValue}`,
              currentNode: current,
              leftChild: hasLeft ? left : undefined,
              rightChild: right,
              chosenChild: rightWins ? right : largest !== current ? largest : undefined,
              activeIdxs: [current],
              comparingIdxs: [left, right].filter((idx) => idx < heapLimit),
              variables: { current, right, 'arr[right]': rightValue, 'arr[largest]': largestValue, largest, heapLimit },
              conditionEval: { expr: `arr[${right}] > arr[${largest}] (${rightValue} > ${largestValue})`, result: rightWins },
              callStack: [
                ...baseCallStack,
                { name: 'siftDown', params: { root: rootIdx, current, right }, line: 19, isCurrent: true },
              ],
              pedagogy: {
                what: `The right child was compared against the best candidate so far.`,
                why: 'After both children are checked, `largest` is guaranteed to hold the maximum of the three.',
                whatNext:
                  largest === current
                    ? 'largest still points at the node — no swap needed.'
                    : `largest points at index ${largest} — a swap will restore the property.`,
              },
            }
          );
        }

        const noSwap = largest === current;
        snapshot(
          21,
          noSwap
            ? `largest == i: node ${current} (${arr[current]}) is already ≥ all of its children — the subtree is a valid max-heap.`
            : `largest (${largest}) differs from i (${current}): the child ${arr[largest]} must move up.`,
          {
            heapSize: heapLimit,
            statusKind: noSwap ? 'noswap' : 'compare',
            statusLabel: noSwap
              ? `NO SWAP: node ${current} already largest`
              : `SWAP NEEDED: ${arr[largest]} > ${arr[current]}`,
            currentNode: current,
            leftChild: hasLeft ? left : undefined,
            rightChild: hasRight ? right : undefined,
            chosenChild: noSwap ? undefined : largest,
            activeIdxs: [current],
            comparingIdxs: noSwap ? [] : [largest],
            variables: { current, largest, heapLimit },
            conditionEval: { expr: `largest == i (${largest} == ${current})`, result: noSwap },
            callStack: [
              ...baseCallStack,
              { name: 'siftDown', params: { root: rootIdx, current, largest }, line: 21, isCurrent: true },
            ],
            pedagogy: {
              what: noSwap
                ? `The decision is decided: no child is larger than node ${current}.`
                : `The decision is decided: child ${largest} (${arr[largest]}) is larger and must be promoted.`,
              why: 'This single check is what terminates the sift-down loop — comparing once more than needed would waste work.',
              whatNext: noSwap
                ? 'Break out of the loop; this subtree is finished.'
                : `Swap node ${current} with child ${largest}.`,
            },
          }
        );

        if (noSwap) {
          break;
        }

        const movedUp = arr[largest];
        const movedDown = arr[current];
        arr[current] = movedUp;
        arr[largest] = movedDown;
        snapshot(
          23,
          `Swapped ${movedDown} ⇄ ${movedUp}: ${movedUp} moves up into index ${current}, ${movedDown} moves down into index ${largest}.`,
          {
            heapSize: heapLimit,
            statusKind: 'swap',
            statusLabel: `SWAP: ${movedUp} ↑ over ${movedDown} ↓`,
            currentNode: current,
            chosenChild: largest,
            swappingIdxs: [current, largest],
            variables: { current, largest, swappedUp: movedUp, swappedDown: movedDown, heapLimit },
            conditionEval: { expr: `largest != i (${largest} != ${current})`, result: true },
            soundCue: 'swap',
            callStack: [
              ...baseCallStack,
              { name: 'siftDown', params: { root: rootIdx, current, largest }, line: 23, isCurrent: true },
            ],
            pedagogy: {
              what: `${movedUp} (the largest of the three) now sits at index ${current}; ${movedDown} moved down.`,
              why: 'Promoting the largest value restores parent ≥ children at this position immediately.',
              whatNext: `${movedDown} may now violate the heap below, so continue sifting from index ${largest}.`,
            },
          }
        );

        snapshot(
          24,
          `Continue sifting from index ${largest} (value ${movedDown}) to repair the subtree below.`,
          {
            heapSize: heapLimit,
            statusKind: 'inspect',
            statusLabel: `SIFT CONTINUE → node ${largest}`,
            currentNode: largest,
            activeIdxs: [largest],
            variables: { i: largest, previous: current, heapLimit },
            conditionEval: { expr: `i = largest (${largest})`, result: true },
            callStack: [
              ...baseCallStack,
              { name: 'siftDown', params: { root: rootIdx, current: largest, heapLimit }, line: 24, isCurrent: true },
            ],
            pedagogy: {
              what: `${movedDown} is now the root of the subtree at index ${largest}.`,
              why: 'The swap moved a smaller value down; only that subtree can still violate the heap property.',
              whatNext: `Re-inspect node ${largest} against its own children.`,
            },
          }
        );

        current = largest;
      }
    };

    // Phase 1: build max-heap bottom-up
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      snapshot(
        4,
        `Phase 1: sift down internal node ${i} (value ${arr[i]}) to enforce the max-heap property across its subtree.`,
        {
          heapSize: n,
          statusKind: 'build',
          statusLabel: `BUILD HEAP: sift-down from node ${i}`,
          currentNode: i,
          activeIdxs: [i],
          milestone: `Sift Down node ${i}`,
          soundCue: 'step',
          variables: { i, heapSize: n, phase: 'build-heap' },
          conditionEval: { expr: `i >= 0`, result: true },
          callStack: [
            ...baseCallStack,
            { name: 'buildHeap', params: { i, n }, line: 4, isCurrent: true },
          ],
          pedagogy: {
            what: `All subtrees below index ${i} are already valid heaps; only the subtree rooted at ${i} may be broken.`,
            why: 'Processing internal nodes right-to-left means each sift-down encounters children that are already heaps.',
            whatNext: `Sift node ${arr[i]} down by repeatedly promoting its largest child.`,
          },
        }
      );
      siftDown(n, i);
    }

    snapshot(
      6,
      `✅ Max-heap complete: every parent ≥ its children, so arr[0] = ${arr[0]} is the global maximum. Switching to Phase 2: extraction.`,
      {
        heapSize: n,
        statusKind: 'build',
        statusLabel: `MAX-HEAP READY (root = ${arr[0]})`,
        currentNode: 0,
        activeIdxs: [0],
        milestone: 'Max-Heap Ready',
        soundCue: 'success',
        variables: { max: arr[0], phase: 'extract-max' },
        conditionEval: { expr: `isMaxHeap(arr)`, result: true },
        pedagogy: {
          what: `The array now satisfies the heap property at every internal node.`,
          why: 'Bottom-up sifting fixed each node exactly once, which is why build-heap is O(N), not O(N log N).',
          whatNext: `Swap the root maximum ${arr[0]} to index ${n - 1} and shrink the heap by one.`,
        },
      }
    );

    heapPhase = 'extract';

    // Phase 2: extract elements
    for (let i = n - 1; i > 0; i--) {
      const rootMax = arr[0];
      snapshot(
        8,
        `Extract max ${rootMax} from the root: swap it with the current boundary element ${arr[i]} at index ${i}.`,
        {
          heapSize: i + 1,
          statusKind: 'extract',
          statusLabel: `EXTRACT MAX ${rootMax} → index ${i}`,
          currentNode: 0,
          chosenChild: i,
          swappingIdxs: [0, i],
          milestone: `Extract Max (${rootMax})`,
          soundCue: 'swap',
          variables: { rootMax, targetIdx: i, heapSize: i + 1, phase: 'extract-max' },
          conditionEval: { expr: `i > 0`, result: true },
          callStack: [
            ...baseCallStack,
            { name: 'extractMax', params: { remainingHeap: i + 1 }, line: 8, isCurrent: true },
          ],
          pedagogy: {
            what: `The root holds the largest remaining value ${rootMax}; index ${i} is the last slot of the active heap.`,
            why: 'Moving the maximum to the boundary grows the sorted suffix by exactly one element per iteration.',
            whatNext: `Lock ${rootMax} into index ${i}, then repair the heap with a single sift-down of the new root.`,
          },
        }
      );

      arr[0] = arr[i];
      arr[i] = rootMax;
      sortedIndices.add(i);

      snapshot(
        9,
        `${rootMax} is locked into the sorted suffix at index ${i}. Re-sift the new root ${arr[0]} down the heap of size ${i}.`,
        {
          heapSize: i,
          statusKind: 'lock',
          statusLabel: `LOCKED ${rootMax} @ [${i}] · heap size ${i}`,
          currentNode: 0,
          activeIdxs: [0],
          variables: { sortedIndex: i, newRoot: arr[0], heapSize: i },
          conditionEval: { expr: `sorted suffix [${i}..${n - 1}] locked`, result: true },
          soundCue: 'sorted',
          callStack: [
            ...baseCallStack,
            { name: 'siftDown', params: { root: 0, heapLimit: i }, line: 9, isCurrent: true },
          ],
          pedagogy: {
            what: `Suffix [${i}..${n - 1}] is now final; the active heap is only [0..${i - 1}].`,
            why: 'The boundary swap put the previous last heap element at the root, which is almost certainly not the maximum.',
            whatNext: `Sift ${arr[0]} down so the root holds the new maximum of the remaining heap.`,
          },
        }
      );

      siftDown(i, 0);
    }

    sortedIndices.add(0);
    heapPhase = 'done';
    snapshot(
      10,
      `🎉 Heapsort complete! All elements in non-decreasing order: [${arr.join(', ')}] in guaranteed O(N log N).`,
      {
        heapSize: 0,
        statusKind: 'done',
        statusLabel: 'DONE: fully sorted',
        milestone: 'Sorted Complete',
        soundCue: 'complete',
        variables: { completed: true, totalSorted: n },
        conditionEval: { expr: `isSorted(arr)`, result: true },
        pedagogy: {
          what: 'Every extraction locked one maximum into the suffix, from largest to smallest.',
          why: 'N-1 extractions × O(log N) sift-down cost gives the guaranteed O(N log N) bound with O(1) extra space.',
          whatNext: 'Try the reversed preset: build-heap does more swaps there, but extraction behaves identically.',
        },
      }
    );

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <HeapSortStage state={frame.state} projection={projection} />;
  },
};
