import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ListNodeItem {
  id: string;
  val: number;
  isRemoved?: boolean;
}

export interface RemoveNthState {
  nodes: ListNodeItem[];
  fastIndex: number; // -1 for dummy/out of bounds, 0..N-1
  slowIndex: number; // -1 for dummy, 0..N-1
  targetN: number;
  phase: 'lead' | 'slide' | 'unlink' | 'done';
}

export const removeNthFromEndModule: AlgorithmModule<
  { values: number[]; n: number },
  RemoveNthState
> = {
  id: 'remove-nth-node-from-end',
  title: 'Remove N-th Node From End (Two-Pointer Window O(N))',
  category: 'linked-lists',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Requires exactly N traversal steps across the entire list',
  },
  theory: {
    overview:
      'Given the head of a linked list, remove the n-th node from the end of the list and return its head in a single traversal pass using a fixed-width window of two pointers.',
    whyItWorks:
      'By advancing the fast pointer n + 1 steps ahead of the slow pointer (using a dummy head node), a constant gap of n nodes is maintained. When fast reaches null, slow is positioned exactly at the predecessor of the node to remove.',
    invariant:
      'Window Gap Invariant: index(fast) - index(slow) == n + 1 at all sliding steps.',
    pitfalls: [
      'Removing the head node (resolved gracefully by introducing a dummy sentinel node).',
      'n greater than the length of the linked list.',
      'Memory leak in non-garbage-collected languages if the unlinked node is not freed.',
    ],
  },
  presets: [
    {
      id: 'remove-second-from-end',
      label: 'Remove 2nd From End ([1,2,3,4,5], n=2)',
      description: 'Removes node 4 from list of 5 nodes',
      data: { values: [1, 2, 3, 4, 5], n: 2 },
    },
    {
      id: 'remove-head-node',
      label: 'Remove Head Node ([10, 20, 30], n=3)',
      description: 'Dummy sentinel gracefully protects head deletion',
      data: { values: [10, 20, 30], n: 3 },
    },
    {
      id: 'remove-tail-node',
      label: 'Remove Tail Node ([7, 14, 21, 28], n=1)',
      description: 'Removes last element from list',
      data: { values: [7, 14, 21, 28], n: 1 },
    },
  ],
  defaultInput: { values: [1, 2, 3, 4, 5], n: 2 },
  codeSnippets: {
    python: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next`,
    typescript: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let fast: ListNode | null = dummy;
  let slow: ListNode | null = dummy;
  for (let i = 0; i <= n; i++) {
    fast = fast!.next;
  }
  while (fast !== null) {
    slow = slow!.next;
    fast = fast.next;
  }
  slow!.next = slow!.next!.next;
  return dummy.next;
}`,
    cpp: `ListNode* removeNthFromEnd(ListNode* head, int n) {
    ListNode dummy(0, head);
    ListNode* fast = &dummy;
    ListNode* slow = &dummy;
    for (int i = 0; i <= n; ++i) fast = fast->next;
    while (fast != nullptr) {
        slow = slow->next;
        fast = fast->next;
    }
    ListNode* toDelete = slow->next;
    slow->next = slow->next->next;
    delete toDelete;
    return dummy.next;
}`,
    java: `public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head);
    ListNode fast = dummy, slow = dummy;
    for (int i = 0; i <= n; i++) fast = fast.next;
    while (fast != null) {
        slow = slow.next;
        fast = fast.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
}`,
    pseudocode: `function removeNthFromEnd(head, n):
    dummy = new Node(0, head)
    fast = dummy, slow = dummy
    repeat (n + 1) times:
        fast = fast.next
    while fast is not null:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next`,
  },

  generateTimeline: (input: { values: number[]; n: number }): ExecutionFrame<RemoveNthState>[] => {
    const frames: ExecutionFrame<RemoveNthState>[] = [];
    const values = input.values.length > 0 ? input.values : [1, 2, 3, 4, 5];
    const n = Math.max(1, Math.min(input.n, values.length));

    const initialNodes: ListNodeItem[] = values.map((v, i) => ({
      id: `node-${i}`,
      val: v,
    }));

    // Step 0: Initialize
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Create dummy sentinel node pointing to head [${values.join(' -> ')}]. Initialize fast and slow pointers at dummy.`,
      variables: { n, slow: 'dummy (-1)', fast: 'dummy (-1)', gap: 0 },
      callStack: [
        { name: `removeNthFromEnd(head, ${n})`, params: { n, length: values.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nodes: [...initialNodes],
        fastIndex: -1,
        slowIndex: -1,
        targetN: n,
        phase: 'lead',
      },
    });

    let fastPos = -1;
    // Step 1: Advance fast pointer n + 1 times
    for (let step = 1; step <= n + 1; step++) {
      fastPos = step - 1; // -1 is dummy, 0 is node 0, 1 is node 1...
      const fastLabel = fastPos === -1 ? 'dummy' : fastPos >= values.length ? 'null' : `${values[fastPos]} (index ${fastPos})`;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Advancing fast pointer: step ${step} of ${n + 1}. Fast is now at ${fastLabel}. Gap = ${step}.`,
        variables: { step, targetGap: n + 1, fastPos: fastPos >= values.length ? 'null' : fastPos, slowPos: -1 },
        callStack: [
          { name: `removeNthFromEnd(head, ${n})`, params: { fast: fastLabel, step }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          nodes: [...initialNodes],
          fastIndex: fastPos,
          slowIndex: -1,
          targetN: n,
          phase: 'lead',
        },
      });
    }

    // Step 2: Slide both pointers until fast is beyond last node (fastPos >= values.length)
    let slowPos = -1;
    while (fastPos < values.length) {
      slowPos++;
      fastPos++;
      const slowLabel = slowPos === -1 ? 'dummy' : `${values[slowPos]}`;
      const fastLabel = fastPos >= values.length ? 'null' : `${values[fastPos]}`;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Sliding window forward: slow -> ${slowLabel}, fast -> ${fastLabel}. Preserving constant offset of ${n + 1}.`,
        variables: { slowIndex: slowPos, fastIndex: fastPos >= values.length ? 'null' : fastPos, n },
        callStack: [
          { name: `removeNthFromEnd(head, ${n})`, params: { slow: slowLabel, fast: fastLabel }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          nodes: [...initialNodes],
          fastIndex: fastPos,
          slowIndex: slowPos,
          targetN: n,
          phase: 'slide',
        },
      });
    }

    // Step 3: Fast is null. Identify node to delete (slowPos + 1)
    const deleteIdx = slowPos + 1;
    const deleteVal = values[deleteIdx];

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      isMilestone: true,
      milestoneTitle: `Target Node Identified (${deleteVal})`,
      explanation: `Fast reached null. Slow is at index ${slowPos}. Target node to remove is slow.next (index ${deleteIdx}, value ${deleteVal}).`,
      variables: { slowPredecessor: slowPos, targetToDelete: deleteVal, deleteIndex: deleteIdx },
      callStack: [
        { name: `removeNthFromEnd(head, ${n})`, params: { toDelete: deleteVal, predecessor: slowPos }, line: 10, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nodes: [...initialNodes],
        fastIndex: fastPos,
        slowIndex: slowPos,
        targetN: n,
        phase: 'unlink',
      },
    });

    // Step 4: Unlink the node
    const updatedNodes = initialNodes.map((node, idx) => ({
      ...node,
      isRemoved: idx === deleteIdx,
    }));

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      isMilestone: true,
      milestoneTitle: `Node Removed (${deleteVal})`,
      explanation: `Executed slow.next = slow.next.next. Node with value ${deleteVal} is detached from the list.`,
      variables: { removedNode: deleteVal, remainingNodes: values.length - 1 },
      callStack: [
        { name: `removeNthFromEnd(head, ${n})`, params: { unlinked: deleteVal }, line: 11, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        nodes: updatedNodes,
        fastIndex: fastPos,
        slowIndex: slowPos,
        targetN: n,
        phase: 'done',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<RemoveNthState>) => {
    const { nodes, fastIndex, slowIndex, targetN, phase } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 select-none">
        {/* Metric Badges */}
        <div className="flex items-center gap-3 mb-8">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
            N from End: <strong className="text-white">{targetN}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
            Phase: <strong className="text-white uppercase">{phase}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-400">
            Slow: <strong className="text-white">{slowIndex === -1 ? 'Dummy' : `Index ${slowIndex}`}</strong>
          </div>
        </div>

        {/* Chain Visualizer */}
        <div className="flex items-center justify-center flex-wrap gap-y-10 max-w-4xl px-4">
          {/* Dummy Node */}
          <div className="relative flex flex-col items-center mx-2">
            {slowIndex === -1 && (
              <span className="absolute -top-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
                SLOW
              </span>
            )}
            {fastIndex === -1 && (
              <span className="absolute -bottom-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                FAST
              </span>
            )}
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-600 bg-slate-900/90 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[10px] font-mono text-slate-500 font-bold">DUMMY</span>
              <span className="text-xs font-mono text-slate-400">0</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1">head-1</span>
          </div>

          <span className="text-slate-600 font-mono text-base">→</span>

          {nodes.map((node, idx) => {
            const isSlow = slowIndex === idx;
            const isFast = fastIndex === idx;
            const isRemoved = node.isRemoved;

            return (
              <React.Fragment key={node.id}>
                <div className="relative flex flex-col items-center mx-2">
                  {isSlow && (
                    <span className="absolute -top-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
                      SLOW
                    </span>
                  )}
                  {isFast && (
                    <span className="absolute -bottom-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                      FAST
                    </span>
                  )}

                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-base transition-all duration-300 ${
                      isRemoved
                        ? 'bg-rose-950/40 border-2 border-rose-500/50 text-rose-400 line-through opacity-40 scale-90'
                        : isSlow
                        ? 'bg-amber-950/60 border-2 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : isFast
                        ? 'bg-cyan-950/60 border-2 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900 border-2 border-slate-700 text-white'
                    }`}
                  >
                    {node.val}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">#{idx}</span>
                </div>

                {idx < nodes.length - 1 && (
                  <span
                    className={`font-mono text-base transition-colors ${
                      isRemoved ? 'text-rose-500/50 line-through' : 'text-slate-600'
                    }`}
                  >
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}

          <span className="text-slate-600 font-mono text-base">→</span>

          {/* Null Terminator */}
          <div className="relative flex flex-col items-center mx-2">
            {fastIndex >= nodes.length && (
              <span className="absolute -bottom-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                FAST
              </span>
            )}
            <div className="w-14 h-14 rounded-2xl border border-slate-800 bg-slate-950/80 flex items-center justify-center font-mono text-xs text-slate-600">
              NULL
            </div>
            <span className="text-[10px] text-slate-700 font-mono mt-1">tail+1</span>
          </div>
        </div>
      </div>
    );
  },
};
