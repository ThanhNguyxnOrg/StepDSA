import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface CircularListNode {
  val: number;
  id: string;
  status: 'normal' | 'active' | 'comparing' | 'tail' | 'head';
}

export interface CircularLinkedListState {
  nodes: CircularListNode[];
  activePointerIndex?: number;
  pointerName?: string;
  isClosedLoop: boolean;
}

export const circularLinkedListModule: AlgorithmModule<number[], CircularLinkedListState> = {
  id: 'circular-linked-list',
  title: 'Circular Linked List (Ring Buffer Traversal)',
  category: 'linked-lists',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Traversing the full cycle until returning to head',
  },
  theory: {
    overview:
      'A Circular Singly Linked List is a linear data structure where all nodes are connected in a continuous circle. The next pointer of the last node (tail) references the first node (head) rather than NULL.',
    whyItWorks:
      'Because there is no NULL terminator, any node can serve as a starting point to traverse the entire list. Useful for round-robin CPU scheduling and endlessly looping media playlists.',
    invariant:
      'Ring Invariant: Starting from any node and following next pointers exactly N times returns back to the originating node.',
    pitfalls: [
      'Infinite loops: forgetting the stop condition curr.next != head or using while(curr != null).',
      'Handling edge cases when the list has only 1 node pointing to itself (node.next = node).',
    ],
  },
  presets: [
    {
      id: 'round-robin',
      label: 'Round Robin Tasks (4 Nodes)',
      description: 'Tasks cycling in a closed loop',
      data: [10, 20, 30, 40],
    },
    {
      id: 'single-node',
      label: 'Single Self-Referential Node',
      description: 'Node pointing back to itself',
      data: [99],
    },
  ],
  defaultInput: [10, 20, 30, 40],
  codeSnippets: {
    python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

def traverse_circular(head):
    if not head: return
    curr = head
    while True:
        print(curr.data)
        curr = curr.next
        if curr == head:
            break`,
    typescript: `class CircularNode {
  val: number;
  next: CircularNode;
  constructor(val: number) {
    this.val = val;
    this.next = this;
  }
}

function traverse(head: CircularNode | null): void {
  if (!head) return;
  let curr: CircularNode = head;
  do {
    console.log(curr.val);
    curr = curr.next;
  } while (curr !== head);
}`,
    cpp: `struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

void traverse(Node* head) {
    if (!head) return;
    Node* curr = head;
    do {
        cout << curr->val << " -> ";
        curr = curr->next;
    } while (curr != head);
    cout << "(head)" << endl;
}`,
    java: `void traverse(Node head) {
    if (head == null) return;
    Node curr = head;
    do {
        System.out.print(curr.val + " -> ");
        curr = curr.next;
    } while (curr != head);
    System.out.println("(head)");
}`,
    pseudocode: `function traverse(head):
    curr <- head
    repeat:
        process(curr.val)
        curr <- curr.next
    until curr == head`,
  },
  generateTimeline: (input: number[]) => {
    const raw = input.length > 0 ? input.slice(0, 5) : [10, 20, 30, 40];
    const n = raw.length;
    const nodes: CircularListNode[] = raw.map((val, idx) => ({
      id: `cnode-${idx}`,
      val,
      status: idx === 0 ? 'head' : idx === n - 1 ? 'tail' : 'normal',
    }));

    const frames: ExecutionFrame<CircularLinkedListState>[] = [];

    // Frame 0: Ring Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized Circular Linked List with ${n} nodes. Tail node #${n - 1} (${raw[n - 1]}) points back to Head node #0 (${raw[0]}), forming a continuous cycle.`,
      isMilestone: true,
      milestoneTitle: 'Initialized Circular Ring',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'traverse(head)', params: { ringSize: n, headVal: raw[0], tailVal: raw[n - 1] }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { ringSize: n, 'head.val': raw[0], 'tail.val': raw[n - 1], 'tail.next': 'head (node #0)' },
      conditionEval: { expr: 'head != null', result: true },
      state: {
        nodes: [...nodes],
        activePointerIndex: 0,
        pointerName: 'curr (head)',
        isClosedLoop: true,
      },
    });

    // Traverse the full ring node by node
    for (let i = 0; i < n; ++i) {
      const nextIdx = (i + 1) % n;
      const isLastNode = i === n - 1;

      // Sub-step A: Process current node value
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `[Visit Node #${i}] Processing element value = ${raw[i]}. Active pointer curr is positioned at node #${i}.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'traverse(head)', params: { currIndex: i, 'curr.val': raw[i] }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { currIndex: i, 'curr.val': raw[i], isTail: isLastNode },
        state: {
          nodes: nodes.map((node, idx) => ({
            ...node,
            status: idx === i ? 'active' : idx === 0 ? 'head' : idx === n - 1 ? 'tail' : 'normal',
          })),
          activePointerIndex: i,
          pointerName: `curr (node #${i})`,
          isClosedLoop: true,
        },
      });

      // Sub-step B: Follow curr.next edge
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `[Follow Pointer] curr.next points to ${
          isLastNode ? `HEAD (node #0, value ${raw[0]}) across loopback edge!` : `node #${nextIdx} (value ${raw[nextIdx]})`
        }.`,
        isMilestone: isLastNode,
        milestoneTitle: isLastNode ? 'Loopback Edge Traversed' : undefined,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'traverse(head)', params: { from: i, to: nextIdx }, line: 6, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { fromIndex: i, nextIndex: nextIdx, isLoopback: isLastNode },
        conditionEval: { expr: `curr.next (${nextIdx}) == head (0)`, result: isLastNode },
        state: {
          nodes: nodes.map((node, idx) => ({
            ...node,
            status: idx === i ? 'active' : idx === nextIdx ? 'comparing' : idx === 0 ? 'head' : idx === n - 1 ? 'tail' : 'normal',
          })),
          activePointerIndex: i,
          pointerName: `curr.next -> #${nextIdx}`,
          isClosedLoop: true,
        },
      });

      // Sub-step C: Check do-while condition
      const willTerminate = isLastNode;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: willTerminate
          ? `Condition Evaluation: curr has wrapped around to head (node #0). while (curr != head) becomes FALSE.`
          : `Condition Evaluation: next node #${nextIdx} != head (node #0). while (curr != head) is TRUE, continuing cycle.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'traverse(head)', params: { curr: nextIdx, head: 0 }, line: 7, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { nextNode: nextIdx, headNode: 0, continueTraversal: !willTerminate },
        conditionEval: { expr: `curr (${nextIdx}) != head (0)`, result: !willTerminate },
        state: {
          nodes: nodes.map((node, idx) => ({
            ...node,
            status: idx === nextIdx ? 'active' : idx === 0 ? 'head' : idx === n - 1 ? 'tail' : 'normal',
          })),
          activePointerIndex: nextIdx,
          pointerName: willTerminate ? 'curr reached head' : `advance to #${nextIdx}`,
          isClosedLoop: true,
        },
      });
    }

    // Terminal Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `🎉 Complete 360° Ring Traversal finished! All ${n} circular nodes visited in order and returned safely to Head.`,
      isMilestone: true,
      milestoneTitle: 'Cycle Loop Completed',
      soundCue: { type: 'complete' },
      callStack: [
        { name: 'traverse(head)', params: { completed: true, visitedCount: n }, line: 8, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { ringSize: n, fullCycleVisited: true, finalPointer: 'head (node #0)' },
      state: {
        nodes: nodes.map((node, idx) => ({
          ...node,
          status: idx === 0 ? 'head' : 'normal',
        })),
        activePointerIndex: 0,
        pointerName: 'curr == head (TERMINATE)',
        isClosedLoop: true,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<CircularLinkedListState>) => {
    const { nodes, activePointerIndex, pointerName } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Nodes: <span className="text-cyan-400 font-bold">{nodes.length}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Structure: <span className="text-emerald-400 font-bold">Closed Loop (Ring)</span>
          </div>
          {pointerName && (
            <div className="px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs font-mono text-indigo-300 font-bold">
              {pointerName}
            </div>
          )}
        </div>

        {/* Circular Ring Visualizer */}
        <div className="relative flex flex-col items-center max-w-3xl w-full p-8 bg-slate-950/70 border border-slate-800 rounded-3xl">
          {/* Linear Nodes with arrows */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {nodes.map((node, idx) => {
              const isActive = idx === activePointerIndex;
              const isHead = idx === 0;
              const isTail = idx === nodes.length - 1;

              return (
                <div key={node.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold border-2 shadow-xl transition-all duration-300 ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-4 ring-cyan-400/40 scale-110'
                          : isHead
                          ? 'border-emerald-400 bg-emerald-950/50 text-emerald-200'
                          : isTail
                          ? 'border-amber-400 bg-amber-950/50 text-amber-200'
                          : 'border-blue-500/40 bg-slate-900/90 text-white'
                      }`}
                    >
                      <span className="text-lg">{node.val}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {isHead ? 'HEAD' : isTail ? 'TAIL' : `#${idx}`}
                      </span>
                    </div>

                    {isActive && (
                      <span className="mt-2 text-[9px] font-mono font-bold bg-cyan-950 border border-cyan-500 text-cyan-300 px-1.5 py-0.5 rounded">
                        ▲ curr
                      </span>
                    )}
                  </div>

                  {/* Next Arrow between nodes */}
                  {idx < nodes.length - 1 && (
                    <div className="flex items-center text-slate-500 font-mono text-lg font-bold">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Loop Return Path from Tail to Head */}
          <div className="w-full mt-6 pt-4 border-t border-dashed border-cyan-500/50 flex items-center justify-between text-xs font-mono text-cyan-400 px-4">
            <span className="flex items-center gap-1">⮐ Loop to Head</span>
            <span className="text-[10px] text-slate-500">tail.next === head (Infinite Ring)</span>
            <span>Tail ⮑</span>
          </div>
        </div>
      </div>
    );
  },
};
