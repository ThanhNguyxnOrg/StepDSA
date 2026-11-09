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
      isMilestone: true,
      milestoneTitle: 'Reverse List Initialized',
      soundCue: { type: 'start' },
      variables: { prev: null, curr: n > 0 ? 0 : null, length: n },
      callStack: [{ name: 'reverseList', params: { head: n > 0 ? initialNodes[0].val : null }, line: 2, isCurrent: true }],
      conditionEval: { expr: `curr !== null`, result: n > 0 },
      pedagogy: {
        what: `prev = null and curr points at the original head${n > 0 ? ` (${initialNodes[0].val})` : ''}.`,
        why: 'The reversed list starts empty; prev becomes the head of the already-reversed prefix as the loop advances.',
        whatNext: n > 0 ? 'Cache curr.next before changing any pointer.' : 'The list is empty; return null.',
      },
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
        soundCue: { type: 'step' },
        variables: { currIdx: curr, currVal: currentNodes[curr].val, nextIdx: next, prevIdx: prev },
        callStack: [{ name: 'reverseStep', params: { curr: currentNodes[curr].val, next: next !== null ? currentNodes[next].val : null }, line: 4, isCurrent: true }],
        conditionEval: { expr: `curr !== null`, result: true },
        pedagogy: {
          what: `next = ${next !== null ? `node(${currentNodes[next].val})` : 'null'} is cached before the pointer flip.`,
          why: 'Changing curr.next would otherwise destroy the only reference to the rest of the original list.',
          whatNext: `Redirect curr.next (node ${currentNodes[curr].val}) to prev ${prev !== null ? `node(${currentNodes[prev].val})` : 'null'}.`,
        },
        checkpoint:
          prev === null && curr === 0
            ? {
                id: 'reverse-linked-list-first-cache',
                question: 'Why must curr.next be saved before redirecting it?',
                options: [
                  'To keep the unprocessed remainder of the list reachable',
                  'To sort the node values',
                  'To update the prev pointer automatically',
                ],
                correctIndex: 0,
                explanation:
                  'Once curr.next is overwritten with prev, the saved next pointer is the only way to continue to the rest of the original list.',
              }
            : undefined,
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
        soundCue: { type: 'swap' },
        variables: { currVal: currentNodes[curr].val, newNext: prev !== null ? currentNodes[prev].val : null },
        callStack: [{ name: 'redirectPointer', params: { from: currentNodes[curr].val, to: prev !== null ? currentNodes[prev].val : null }, line: 5, isCurrent: true }],
        conditionEval: { expr: `curr.next = prev`, result: true },
        pedagogy: {
          what: `node(${currentNodes[curr].val}).next now points backwards to ${prev !== null ? `node(${currentNodes[prev].val})` : 'null'}.`,
          why: 'This is the actual reversal: the edge direction flips while the saved next pointer keeps the forward chain available.',
          whatNext: 'Advance prev to curr, then advance curr to the saved next node.',
        },
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
        soundCue: { type: 'step' },
        variables: { prevIdx: prev, prevVal: currentNodes[prev].val, currIdx: curr, currVal: curr !== null ? currentNodes[curr].val : null },
        callStack: [{ name: 'advancePointers', params: { prev: currentNodes[prev].val, curr: curr !== null ? currentNodes[curr].val : null }, line: 6, isCurrent: true }],
        conditionEval: { expr: `curr !== null (${curr !== null})`, result: curr !== null },
        pedagogy: {
          what: `prev now points at node(${currentNodes[prev].val}); curr points at ${curr !== null ? `node(${currentNodes[curr].val})` : 'null'}.`,
          why: 'The reversed prefix grows by one node, and the unprocessed suffix shrinks by one node.',
          whatNext: curr !== null ? 'Repeat: cache next, flip the link, then advance both pointers.' : 'curr is null; return prev as the new head.',
        },
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
      isMilestone: true,
      milestoneTitle: 'Reversal Complete',
      soundCue: { type: 'complete' },
      variables: { newHeadVal: prev !== null ? currentNodes[prev].val : null, isComplete: true },
      callStack: [{ name: 'reverseList', params: { returnVal: prev !== null ? currentNodes[prev].val : null }, line: 8, isCurrent: true }],
      conditionEval: { expr: `curr == null`, result: true },
      pedagogy: {
        what: `curr is null, so every original edge has been reversed; prev points at node(${prev !== null ? currentNodes[prev].val : 'null'}).`,
        why: 'The reversed prefix now contains all nodes, and its head is exactly the last node processed.',
        whatNext: 'Return prev. The original head is now the tail and points to null.',
      },
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
    const n = Math.max(nodes.length, 1);
    const nodeWidth = 66;
    const gap = 48;
    const leftPad = 34;
    const width = Math.max(520, leftPad * 2 + n * nodeWidth + (n - 1) * gap);
    const y = 108;
    const nodeX = (idx: number) => leftPad + idx * (nodeWidth + gap);

    const pointerBadge = (idx: number) => {
      const badges: { label: string; color: string }[] = [];
      if (prev === idx) badges.push({ label: 'prev', color: '#10B981' });
      if (curr === idx) badges.push({ label: 'curr', color: '#F59E0B' });
      if (next === idx) badges.push({ label: 'next', color: '#38BDF8' });
      return badges;
    };

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full min-h-[340px]">
        {/* Pointer Legend Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
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

        {/* Spatial list view: node positions stay stable; arrows show the actual next pointers. */}
        <div className="w-full max-w-5xl overflow-x-auto bg-[#111827]/60 border border-[#1F293D] rounded-2xl p-3">
          <svg
            viewBox={`0 0 ${width} 230`}
            className="w-full h-[230px]"
            style={{ minWidth: `${Math.min(width, 920)}px` }}
            role="img"
            aria-label="Linked list pointer diagram"
          >
            <defs>
              <marker id="ll-arrow-forward" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
              </marker>
              <marker id="ll-arrow-reversed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#34D399" />
              </marker>
              <marker id="ll-arrow-cached" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38BDF8" />
              </marker>
            </defs>

            {/* Edges are drawn from the actual nextIndex values, not from array order. */}
            {nodes.map((node, idx) => {
              const x1 = nodeX(idx) + nodeWidth / 2;
              if (node.nextIndex === null) {
                return (
                  <g key={`null-${node.id}`}>
                    <line
                      x1={x1}
                      y1={y + 26}
                      x2={x1}
                      y2={y + 52}
                      stroke="#64748B"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <text x={x1} y={y + 68} textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                      null
                    </text>
                  </g>
                );
              }

              const target = node.nextIndex;
              const x2 = nodeX(target) + nodeWidth / 2;
              const isReversed = target < idx;
              const isCached = next !== null && target === next && curr === idx;
              const midY = isReversed ? 38 : 182;
              const controlY = isReversed ? 16 : 212;
              const path = `M ${x1} ${y + (isReversed ? -26 : 26)} Q ${(x1 + x2) / 2} ${controlY} ${x2} ${y + (isReversed ? -26 : 26)}`;
              const stroke = isReversed ? '#34D399' : isCached ? '#38BDF8' : '#64748B';
              const marker = isReversed
                ? 'url(#ll-arrow-reversed)'
                : isCached
                ? 'url(#ll-arrow-cached)'
                : 'url(#ll-arrow-forward)';

              return (
                <g key={`edge-${node.id}`}>
                  <path
                    d={path}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={isReversed ? 2.8 : 2}
                    markerEnd={marker}
                    opacity={0.95}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={midY}
                    textAnchor="middle"
                    fill={stroke}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {isReversed ? `reversed → ${nodes[target]?.val}` : `next → ${nodes[target]?.val}`}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node, idx) => {
              const x = nodeX(idx);
              const isPrev = prev === idx;
              const isCurr = curr === idx;
              const isNext = next === idx;
              const fill = isCurr ? '#78350F' : isPrev ? '#064E3B' : isNext ? '#0C4A6E' : '#111827';
              const stroke = isCurr ? '#F59E0B' : isPrev ? '#10B981' : isNext ? '#38BDF8' : '#475569';

              return (
                <g key={node.id}>
                  <rect
                    x={x}
                    y={y - 26}
                    width={nodeWidth}
                    height={52}
                    rx={10}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isCurr || isPrev || isNext ? 3 : 1.8}
                  />
                  <text
                    x={x + nodeWidth / 2}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="16"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.val}
                  </text>
                  <text
                    x={x + nodeWidth / 2}
                    y={y + 19}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    idx {idx}
                  </text>

                  {pointerBadge(idx).map((badge, badgeIdx) => (
                    <g key={badge.label}>
                      <rect
                        x={x + 4 + badgeIdx * 22}
                        y={y - 46}
                        width={20}
                        height={13}
                        rx={3}
                        fill={badge.color}
                      />
                      <text
                        x={x + 14 + badgeIdx * 22}
                        y={y - 36.5}
                        textAnchor="middle"
                        fill="#0B0F19"
                        fontSize="7"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {badge.label}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-400 inline-block" /> reversed edge</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-sky-400 inline-block" /> cached next edge</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-slate-500 inline-block" /> untouched edge</span>
        </div>
      </div>
    );
  },
};
