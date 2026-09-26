import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ReverseNode {
  val: number;
  id: string;
  nextIndex: number | null; // index this node points to
}

export interface ReverseLLState {
  nodes: ReverseNode[];
  prev: number | null;
  curr: number | null;
  next: number | null;
}

export const reverseLinkedListModule: AlgorithmModule<number[], ReverseLLState> = {
  id: 'reverse-linked-list',
  title: 'Reverse Linked List',
  category: 'linked-lists',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Must traverse all N nodes to reverse pointers',
  },
  theory: {
    overview:
      'Reverses a singly linked list in-place by maintaining three pointers: prev, curr, and next. At each step, curr.next is redirected to prev.',
    whyItWorks:
      'By caching curr.next before modifying it, the algorithm safely flips the directional link backwards without losing reference to the remainder of the list.',
    invariant:
      'All nodes prior to curr are completely reversed and point backwards to their predecessor. Nodes from curr onwards retain original orientation.',
    pitfalls: [
      'Losing reference to curr.next when flipping curr.next to prev if next is not cached first.',
      'Forgetting to return prev as the new head when curr reaches null.',
    ],
  },
  codeSnippets: {
    python: `def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    typescript: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
    cpp: `ListNode* reverseList(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    java: `public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    pseudocode: `function reverseList(head):
    prev <- NULL
    curr <- head
    while curr is not NULL:
        next <- curr.next
        curr.next <- prev
        prev <- curr
        curr <- next
    return prev`,
  },
  defaultInput: [1, 2, 3, 4, 5],
  presets: [
    { id: 'standard', label: 'Standard 5 Nodes', description: '[1, 2, 3, 4, 5]', data: [1, 2, 3, 4, 5] },
    { id: 'short', label: 'Short 3 Nodes', description: '[10, 20, 30]', data: [10, 20, 30] },
    { id: 'single', label: 'Single Node', description: '[42]', data: [42] },
  ],
  generateTimeline: (input: number[]): ExecutionFrame<ReverseLLState>[] => {
    const frames: ExecutionFrame<ReverseLLState>[] = [];
    const n = input.length;
    const initialNodes: ReverseNode[] = input.map((val, idx) => ({
      val,
      id: `node-${idx}`,
      nextIndex: idx + 1 < n ? idx + 1 : null,
    }));

    // Step 0: Initial state
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: 'Initialize prev = null, curr = head. Ready to reverse linked list.',
      state: {
        nodes: JSON.parse(JSON.stringify(initialNodes)),
        prev: null,
        curr: n > 0 ? 0 : null,
        next: null,
      },
    });

    let prev: number | null = null;
    let curr: number | null = n > 0 ? 0 : null;
    const currentNodes: ReverseNode[] = JSON.parse(JSON.stringify(initialNodes));

    while (curr !== null) {
      const next: number | null = currentNodes[curr].nextIndex;

      // Frame: Inspect curr and save next
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Cache next pointer: next = node(${next !== null ? currentNodes[next].val : 'null'}).`,
        state: {
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          prev,
          curr,
          next,
        },
      });

      // Frame: Flip curr.next to prev
      currentNodes[curr].nextIndex = prev;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Redirect node(${currentNodes[curr].val}).next to point backwards to ${prev !== null ? `node(${currentNodes[prev].val})` : 'null'}.`,
        state: {
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          prev,
          curr,
          next,
        },
      });

      // Frame: Advance prev and curr
      prev = curr;
      curr = next;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Advance pointers: prev = node(${currentNodes[prev].val}), curr = ${curr !== null ? `node(${currentNodes[curr].val})` : 'null'}.`,
        state: {
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          prev,
          curr,
          next: null,
        },
      });
    }

    // Final frame: Reversal complete
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `Reversal complete! Return prev (node ${prev !== null ? currentNodes[prev].val : 'null'}) as new head.`,
      state: {
        nodes: JSON.parse(JSON.stringify(currentNodes)),
        prev,
        curr: null,
        next: null,
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<ReverseLLState>) => {
    const { nodes, prev, curr, next } = frame.state;
    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[340px]">
        {/* Pointer Legend Badges */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono text-emerald-300">prev: {prev !== null ? nodes[prev]?.val : 'null'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-xs font-mono text-amber-300">curr: {curr !== null ? nodes[curr]?.val : 'null'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400"></span>
            <span className="text-xs font-mono text-sky-300">next: {next !== null ? nodes[next]?.val : 'null'}</span>
          </div>
        </div>

        {/* Nodes and Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl">
          {nodes.map((node, idx) => {
            const isPrev = prev === idx;
            const isCurr = curr === idx;
            const isNext = next === idx;

            let borderColor = 'border-slate-700 bg-slate-900/80';
            if (isCurr) borderColor = 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400';
            else if (isPrev) borderColor = 'border-emerald-500 bg-emerald-950/40';
            else if (isNext) borderColor = 'border-sky-400 bg-sky-950/30';

            return (
              <div key={node.id} className="flex items-center gap-3">
                <div className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 transition-all duration-200 ${borderColor}`}>
                  <span className="text-xl font-bold font-mono text-white">{node.val}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">idx: {idx}</span>
                  
                  {/* Floating pointer tag */}
                  <div className="absolute -top-3 flex gap-1">
                    {isPrev && <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">PREV</span>}
                    {isCurr && <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">CURR</span>}
                    {isNext && <span className="bg-sky-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">NEXT</span>}
                  </div>
                </div>

                {/* Pointer indicator */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-mono text-slate-400 mb-0.5">
                    {node.nextIndex !== null ? `→ [${node.nextIndex}]` : '→ ∅'}
                  </span>
                  <div className="w-8 h-0.5 bg-slate-600"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
