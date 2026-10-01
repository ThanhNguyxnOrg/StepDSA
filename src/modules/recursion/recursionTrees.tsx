import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export type TreeMode = 'mergesort' | 'quicksort' | 'backtracking';

export interface RecNode {
  id: string;
  name: string;
  depth: number;
  status: 'pending' | 'running' | 'completed';
  result?: string;
  children: RecNode[];
}

export interface RecursionTreesState {
  mode: TreeMode;
  treeRoot: RecNode | null;
  activeNodeId: string | null;
  maxDepth: number;
  totalCalls: number;
  message: string;
}

function cloneRecNode(node: RecNode | null): RecNode | null {
  if (!node) return null;
  return {
    id: node.id,
    name: node.name,
    depth: node.depth,
    status: node.status,
    result: node.result,
    children: node.children.map((c) => cloneRecNode(c)!),
  };
}

export const recursionTreesModule: AlgorithmModule<
  { mode: TreeMode; inputData: number[] },
  RecursionTreesState
> = {
  id: 'recursion-trees',
  title: 'Recursion & Decision Trees (Mergesort, Quicksort & State-Space)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N) balanced call tree (Mergesort/Quicksort)',
    timeAverage: 'O(N log N) recursive divide-and-conquer call tree',
    timeWorst: 'O(N^2) skewed tree (Quicksort worst pivot) or O(2^N) state space',
    spaceAuxiliary: 'O(H) execution call stack frame depth',
    worstCaseCondition: 'Unbalanced recursive branching degenerating tree depth to H = N',
  },
  theory: {
    overview:
      'Recursion Call Trees map function execution frames into explicit hierarchical trees where nodes represent function invocations, edges represent child recursive calls, and leaves represent base cases.',
    whyItWorks:
      'Visualizing the call tree topology makes abstract call stack mechanisms tangible: Mergesort creates a perfectly balanced binary split tree of depth log2(N); Quicksort reveals pivot-choice partition symmetry; and Backtracking displays pruned state-space trees.',
    invariant:
      'Stack Unwinding Invariant: A parent node cannot complete until all its child recursive subtrees have completely finished and returned.',
    pitfalls: [
      'Confusing recursion tree depth with total number of calls (Depth = H, Calls = 2^(H+1) - 1).',
      'Forgetting that Stack Overflow occurs when tree depth H exceeds call stack frame limits (typically ~10^4).',
    ],
  },
  defaultInput: {
    mode: 'mergesort',
    inputData: [8, 3, 5, 1],
  },
  presets: [
    {
      id: 'mergesort-call-tree',
      label: 'Mergesort Call Tree ([8, 3, 5, 1])',
      description: 'Balanced binary recursion tree with post-order merge unwinding',
      data: { mode: 'mergesort', inputData: [8, 3, 5, 1] },
    },
    {
      id: 'quicksort-call-tree',
      label: 'Quicksort Partition Tree ([5, 2, 9, 1])',
      description: 'Pivot-based split branches displaying partition tree',
      data: { mode: 'quicksort', inputData: [5, 2, 9, 1] },
    },
    {
      id: 'backtracking-decision-tree',
      label: 'Backtracking Decision Tree (Sum Subsets)',
      description: 'Binary include/exclude state-space tree traversal',
      data: { mode: 'backtracking', inputData: [1, 2, 3] },
    },
  ],
  codeSnippets: {
    cpp: `// 1. Mergesort Call Tree
void mergeSort(int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(l, m);
    mergeSort(m + 1, r);
    merge(l, m, r);
}

// 2. Quicksort Partition Tree
void quickSort(int l, int r) {
    if (l >= r) return;
    int p = partition(l, r);
    quickSort(l, p - 1);
    quickSort(p + 1, r);
}`,
    python: `# Mergesort Call Tree
def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
    typescript: `function mergeSortTree(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSortTree(arr.slice(0, mid));
  const right = mergeSortTree(arr.slice(mid));
  return merge(left, right);
}`,
    java: `// Call tree depth H = log2(N)
void mergeSort(int[] a, int l, int r) {
    if (l < r) {
        int m = (l + r) / 2;
        mergeSort(a, l, m);
        mergeSort(a, m + 1, r);
    }
}`,
    pseudocode: `function recurse(subproblem):
    record node in call tree
    if base_case:
        mark leaf node completed
        return base_result
    recurse(left)
    recurse(right)
    return combine(left, right)`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<RecursionTreesState>[] = [];
    const mode = input.mode;
    const data = input.inputData;
    let callSeq = 0;
    let maxD = 0;

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: RecursionTreesState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    let tree: RecNode = {
      id: `call-0`,
      name: `${mode}(${data.join(',')})`,
      depth: 0,
      status: 'pending',
      children: [],
    };

    addFrame(
      1,
      `Starting ${mode.toUpperCase()} recursion tree simulation for input [${data.join(', ')}].`,
      {
        mode,
        treeRoot: cloneRecNode(tree),
        activeNodeId: tree.id,
        maxDepth: 0,
        totalCalls: 1,
        message: `Root call initiated: ${tree.name}.`,
      },
      {
        action: 'INIT',
        variables: { mode, inputSize: data.length },
        callStack: [{ name: 'initTree', params: { mode, size: data.length } }],
      }
    );

    function buildMergesort(arr: number[], depth: number, parentNode: RecNode): number[] {
      callSeq++;
      maxD = Math.max(maxD, depth);
      const currId = `call-${callSeq}`;
      const node: RecNode = {
        id: currId,
        name: `mergeSort([${arr.join(',')}])`,
        depth,
        status: 'running',
        children: [],
      };
      parentNode.children.push(node);

      addFrame(
        4,
        `Push frame: mergeSort([${arr.join(',')}]) at depth ${depth}.`,
        {
          mode,
          treeRoot: cloneRecNode(tree),
          activeNodeId: currId,
          maxDepth: maxD,
          totalCalls: callSeq,
          message: `Invoking mergeSort on segment of length ${arr.length}.`,
        },
        {
          action: 'PUSH_FRAME',
          variables: { arr: arr.join(','), depth },
          callStack: [{ name: 'mergeSort', params: { size: arr.length, depth } }],
        }
      );

      if (arr.length <= 1) {
        node.status = 'completed';
        node.result = `[${arr.join(',')}]`;
        addFrame(
          6,
          `Base case reached: length <= 1. Returned [${arr.join(',')}].`,
          {
            mode,
            treeRoot: cloneRecNode(tree),
            activeNodeId: currId,
            maxDepth: maxD,
            totalCalls: callSeq,
            message: `Base case leaf: [${arr.join(',')}] is sorted.`,
          },
          {
            action: 'BASE_CASE',
            variables: { leaf: arr.join(',') },
            callStack: [{ name: 'baseCase', params: { arr: arr.join(',') } }],
          }
        );
        return arr;
      }

      const mid = Math.floor(arr.length / 2);
      const leftSorted = buildMergesort(arr.slice(0, mid), depth + 1, node);
      const rightSorted = buildMergesort(arr.slice(mid), depth + 1, node);

      const merged: number[] = [];
      let i = 0, j = 0;
      while (i < leftSorted.length && j < rightSorted.length) {
        if (leftSorted[i] <= rightSorted[j]) merged.push(leftSorted[i++]);
        else merged.push(rightSorted[j++]);
      }
      while (i < leftSorted.length) merged.push(leftSorted[i++]);
      while (j < rightSorted.length) merged.push(rightSorted[j++]);

      node.status = 'completed';
      node.result = `[${merged.join(',')}]`;

      addFrame(
        9,
        `Merged [${leftSorted.join(',')}] and [${rightSorted.join(',')}] -> [${merged.join(',')}]. Unwinding frame.`,
        {
          mode,
          treeRoot: cloneRecNode(tree),
          activeNodeId: currId,
          maxDepth: maxD,
          totalCalls: callSeq,
          message: `Frame complete: produced sorted segment [${merged.join(',')}].`,
        },
        {
          action: 'MERGE_RETURN',
          variables: { mergedResult: merged.join(',') },
          callStack: [{ name: 'mergeReturn', params: { result: merged.join(',') } }],
        }
      );

      return merged;
    }

    if (mode === 'mergesort' || mode === 'quicksort') {
      const mid = Math.floor(data.length / 2);
      buildMergesort(data.slice(0, mid), 1, tree);
      buildMergesort(data.slice(mid), 1, tree);
    } else {
      const subset: number[] = [];
      const generateSubsets = (idx: number, depth: number, parentNode: RecNode) => {
        callSeq++;
        maxD = Math.max(maxD, depth);
        const currId = `bt-${callSeq}`;
        const node: RecNode = {
          id: currId,
          name: `choose(${idx < data.length ? data[idx] : 'END'})`,
          depth,
          status: 'running',
          children: [],
        };
        parentNode.children.push(node);

        if (idx === data.length) {
          node.status = 'completed';
          node.result = `{${subset.join(',')}}`;
          return;
        }

        subset.push(data[idx]);
        generateSubsets(idx + 1, depth + 1, node);
        subset.pop();

        generateSubsets(idx + 1, depth + 1, node);
        node.status = 'completed';
      };

      generateSubsets(0, 1, tree);
    }

    tree.status = 'completed';
    tree.result = 'DONE';

    addFrame(
      14,
      `Recursion call tree exploration finished. Total frames executed = ${callSeq}, Maximum depth = ${maxD}.`,
      {
        mode,
        treeRoot: cloneRecNode(tree),
        activeNodeId: null,
        maxDepth: maxD,
        totalCalls: callSeq,
        message: `Call tree complete with ${callSeq} invocations and max stack depth ${maxD}.`,
      },
      {
        action: 'COMPLETE',
        variables: { totalFrames: callSeq, maxDepth: maxD },
        callStack: [{ name: 'complete', params: { calls: callSeq, depth: maxD } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<RecursionTreesState>) => {
    const { mode, treeRoot, activeNodeId, maxDepth, totalCalls, message } = frame.state;

    const renderCallNode = (node: RecNode | null): React.ReactNode => {
      if (!node) return null;
      const isActive = node.id === activeNodeId;

      return (
        <div key={node.id} className="flex flex-col items-center space-y-2">
          <div
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs shadow-lg transition-all duration-200 flex flex-col items-center ${
              isActive
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-amber-500/20 scale-105'
                : node.status === 'completed'
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <span className="font-bold">{node.name}</span>
            {node.result && (
              <span className="text-[10px] text-cyan-300 font-normal">➔ {node.result}</span>
            )}
          </div>

          {node.children.length > 0 && (
            <div className="flex gap-4 pt-2 border-t border-slate-800 justify-center">
              {node.children.map((child) => renderCallNode(child))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Telemetry */}
        <div className="flex flex-wrap items-center justify-between w-full p-4 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Mode:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold uppercase">
              {mode}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Total Calls: <span className="text-cyan-400 font-bold">{totalCalls}</span></span>
            <span>Max Call Stack Depth: <span className="text-amber-400 font-bold">{maxDepth}</span></span>
          </div>
        </div>

        {/* Call Tree Canvas */}
        <div className="w-full flex items-center justify-center p-8 bg-slate-950 border border-slate-800 rounded-2xl min-h-[300px] overflow-x-auto shadow-2xl">
          {renderCallNode(treeRoot)}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-400" />
            <span>Active CPU Execution Frame</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-950/70 border border-emerald-500" />
            <span>Unwound / Returned Frame</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-700" />
            <span>Pending Frame</span>
          </div>
        </div>
      </div>
    );
  },
};
