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
    const n = Math.max(nodes.length, 1);
    const cx = 185;
    const cy = 148;
    const rx = 122;
    const ry = 88;
    const nodeR = 23;

    const coords = nodes.map((_, idx) => {
      const angle = (idx / n) * Math.PI * 2 - Math.PI / 2;
      return {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
        tagX: cx + (rx + 36) * Math.cos(angle),
        tagY: cy + (ry + 30) * Math.sin(angle),
      };
    });

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 gap-4 select-none">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Nodes: <span className="text-cyan-400 font-bold tabular-nums">{nodes.length}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Invariant: <span className="text-emerald-400 font-bold">tail.next === head</span>
          </div>
          {pointerName && (
            <div
              style={{
                backgroundColor: 'var(--sem-active-bg)',
                borderColor: 'var(--sem-active-border)',
                color: 'var(--sem-active-text)',
              }}
              className="px-2.5 py-1 rounded-lg border text-xs font-mono font-bold"
            >
              {pointerName}
            </div>
          )}
        </div>

        {/* True 360° SVG Circular Linked Ring */}
        <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#1F293D] p-3 flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 370 296" className="w-full max-w-[400px] h-auto overflow-visible">
            <defs>
              <marker id="cll-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'var(--svg-edge-default)' }} />
              </marker>
              <marker id="cll-arr-active" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'var(--sem-comparing-solid)' }} />
              </marker>
              <marker id="cll-arr-loop" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'var(--sem-sorted-solid)' }} />
              </marker>
            </defs>

            {/* Directed circular next edges including TAIL -> HEAD wrap edge */}
            {nodes.map((_, idx) => {
              const nextIdx = (idx + 1) % n;
              const a = coords[idx];
              const b = coords[nextIdx];
              if (!a || !b) return null;
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy) || 1;
              const ux = dx / dist;
              const uy = dy / dist;
              const isLoopBack = idx === n - 1;
              const isCurrentEdge = idx === activePointerIndex;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={a.x + ux * (nodeR + 3)}
                    y1={a.y + uy * (nodeR + 3)}
                    x2={b.x - ux * (nodeR + 8)}
                    y2={b.y - uy * (nodeR + 8)}
                    style={{
                      stroke: isCurrentEdge
                        ? 'var(--sem-comparing-solid)'
                        : isLoopBack
                        ? 'var(--sem-sorted-solid)'
                        : 'var(--svg-edge-default)',
                    }}
                    strokeWidth={isCurrentEdge || isLoopBack ? 2.6 : 2}
                    strokeDasharray={isLoopBack ? '5 3' : undefined}
                    markerEnd={
                      isCurrentEdge
                        ? 'url(#cll-arr-active)'
                        : isLoopBack
                        ? 'url(#cll-arr-loop)'
                        : 'url(#cll-arr)'
                    }
                  />
                  {isLoopBack && (
                    <text
                      x={(a.x + b.x) / 2 - 14}
                      y={(a.y + b.y) / 2 - 6}
                      textAnchor="middle"
                      style={{ fill: 'var(--svg-label-emerald)' }}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      tail→head
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center label */}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              style={{ fill: 'var(--theme-text-muted)' }}
              fontSize="9.5"
              fontWeight="bold"
              fontFamily="monospace"
            >
              360° CLOSED RING
            </text>
            <text
              x={cx}
              y={cy + 11}
              textAnchor="middle"
              style={{ fill: 'var(--theme-text-subtle)' }}
              fontSize="8.5"
              fontFamily="monospace"
            >
              no NULL terminator
            </text>

            {/* Circular Nodes */}
            {nodes.map((node, idx) => {
              const pos = coords[idx];
              const isActive = idx === activePointerIndex;
              const isHead = idx === 0;
              const isTail = idx === n - 1;
              const fill = isActive
                ? 'var(--sem-comparing-bg)'
                : isHead
                ? 'var(--sem-sorted-bg)'
                : isTail
                ? 'var(--sem-pivot-bg)'
                : 'var(--svg-node-bg)';
              const stroke = isActive
                ? 'var(--sem-comparing-border)'
                : isHead
                ? 'var(--sem-sorted-border)'
                : isTail
                ? 'var(--sem-pivot-border)'
                : 'var(--svg-node-border)';
              const textFill = isActive
                ? 'var(--sem-comparing-text)'
                : isHead
                ? 'var(--sem-sorted-text)'
                : isTail
                ? 'var(--sem-pivot-text)'
                : 'var(--svg-node-text)';

              return (
                <g key={node.id}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeR}
                    style={{ fill, stroke }}
                    strokeWidth={isActive ? 3.2 : 2.2}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    textAnchor="middle"
                    style={{ fill: textFill }}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.val}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 14}
                    textAnchor="middle"
                    style={{ fill: 'var(--theme-text-muted)' }}
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    {isHead ? 'HEAD' : isTail ? 'TAIL' : `#${idx}`}
                  </text>

                  {isActive && (
                    <g>
                      <rect
                        x={pos.tagX - 20}
                        y={pos.tagY - 8}
                        width={40}
                        height={15}
                        rx={4}
                        style={{ fill: 'var(--sem-comparing-solid)' }}
                      />
                      <text
                        x={pos.tagX}
                        y={pos.tagY + 2.5}
                        textAnchor="middle"
                        className="svg-on-solid"
                        style={{ fill: 'var(--sem-comparing-on-solid)' }}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        curr
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
