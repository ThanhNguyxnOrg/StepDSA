import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface CycleNode {
  val: number;
  id: string;
  nextIndex: number;
}

export interface FloydCycleState {
  nodes: CycleNode[];
  slow: number;
  fast: number;
  hasCycle: boolean;
  meetingPoint: number | null;
  phase: 'detect' | 'found' | 'no_cycle';
}

export const floydCycleDetectionModule: AlgorithmModule<{ values: number[]; cycleToIndex: number }, FloydCycleState> = {
  id: 'floyd-cycle-detection',
  title: "Floyd's Cycle Detection (Tortoise & Hare)",
  category: 'linked-lists',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Fast pointer circles loop until catching slow pointer in O(N) steps',
  },
  theory: {
    overview:
      "Floyd's Cycle-Finding Algorithm (Tortoise and Hare) detects cycles in a linked list using two pointers moving at different speeds: slow moves 1 step, fast moves 2 steps.",
    whyItWorks:
      'If a cycle exists, the distance between fast and slow decreases by 1 step in each iteration within the cycle, guaranteeing collision in at most cycle-length steps without requiring extra memory (O(1) space).',
    invariant:
      'In each step within the cycle of length C, the relative gap (fast - slow) mod C increases by 1 until gap = 0.',
    pitfalls: [
      'Null pointer exceptions if fast or fast.next is not checked before advancing two steps.',
      'Infinite loop in custom tracers if loop bounds are unbounded.',
    ],
  },
  codeSnippets: {
    python: `def has_cycle(head):
    if not head or not head.next: return False
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
    typescript: `function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) return false;
  let slow: ListNode | null = head;
  let fast: ListNode | null = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    cpp: `bool hasCycle(ListNode *head) {
    if (!head || !head->next) return false;
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
    java: `public boolean hasCycle(ListNode head) {
    if (head == null || head.next == null) return false;
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`,
    pseudocode: `function hasCycle(head):
    slow <- head, fast <- head
    while fast is not NULL and fast.next is not NULL:
        slow <- slow.next
        fast <- fast.next.next
        if slow == fast: return true
    return false`,
  },
  defaultInput: { values: [3, 2, 0, -4, 5, 8], cycleToIndex: 2 },
  presets: [
    {
      id: 'cycle_mid',
      label: 'Cycle to Index 2',
      description: 'Values [3, 2, 0, -4, 5, 8] with node(8) pointing to node(0)',
      data: { values: [3, 2, 0, -4, 5, 8], cycleToIndex: 2 },
    },
    {
      id: 'cycle_head',
      label: 'Cycle to Head',
      description: 'Values [1, 2, 3, 4] with tail pointing to head',
      data: { values: [1, 2, 3, 4], cycleToIndex: 0 },
    },
  ],
  generateTimeline: (input: { values: number[]; cycleToIndex: number }): ExecutionFrame<FloydCycleState>[] => {
    const frames: ExecutionFrame<FloydCycleState>[] = [];
    const n = input.values.length;
    const nodes: CycleNode[] = input.values.map((v, i) => ({
      val: v,
      id: `node-${i}`,
      nextIndex: i + 1 < n ? i + 1 : input.cycleToIndex,
    }));

    let slow = 0;
    let fast = 0;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Tortoise (slow = node[0], val ${nodes[0].val}) and Hare (fast = node[0], val ${nodes[0].val}). Tail points to cycle index ${input.cycleToIndex}.`,
      isMilestone: true,
      milestoneTitle: 'Initialized Pointers',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'hasCycle(head)', params: { head: nodes[0].val, cycleTo: input.cycleToIndex }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { slow: 0, fast: 0, 'nodes[0]': nodes[0].val, cycleToIndex: input.cycleToIndex },
      state: {
        nodes,
        slow: 0,
        fast: 0,
        hasCycle: false,
        meetingPoint: null,
        phase: 'detect',
      },
    });

    let meetingNode: number | null = null;

    for (let step = 1; step <= 20; step++) {
      // Step A: Advance slow by 1
      const prevSlow = slow;
      slow = nodes[slow].nextIndex;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Iteration ${step}: Tortoise crawls 1 hop from node[${prevSlow}] to node[${slow}] (val ${nodes[slow].val}).`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'hasCycle(head)', params: { step, slow, fast }, line: 4, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { step, slow, fast, slowVal: nodes[slow].val, fastVal: nodes[fast].val },
        state: {
          nodes,
          slow,
          fast,
          hasCycle: false,
          meetingPoint: null,
          phase: 'detect',
        },
      });

      // Step B: Advance fast 1st hop
      const fastHop1 = nodes[fast].nextIndex;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Iteration ${step}: Hare leaps hop 1/2 from node[${fast}] to node[${fastHop1}] (val ${nodes[fastHop1].val}).`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'hasCycle(head)', params: { step, fastHop: 1 }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { step, slow, fast: fastHop1, hop: '1 of 2' },
        state: {
          nodes,
          slow,
          fast: fastHop1,
          hasCycle: false,
          meetingPoint: null,
          phase: 'detect',
        },
      });

      // Step C: Advance fast 2nd hop
      const prevFast = fastHop1;
      fast = nodes[fastHop1].nextIndex;
      const met = slow === fast;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Iteration ${step}: Hare leaps hop 2/2 from node[${prevFast}] to node[${fast}] (val ${nodes[fast].val}). Checking collision: slow (${slow}) vs fast (${fast}).`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'hasCycle(head)', params: { step, slow, fast }, line: 6, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { step, slow, fast, collision: met },
        conditionEval: {
          expr: `slow (node[${slow}]) == fast (node[${fast}])`,
          result: met,
        },
        state: {
          nodes,
          slow,
          fast,
          hasCycle: met,
          meetingPoint: met ? slow : null,
          phase: met ? 'found' : 'detect',
        },
      });

      if (met) {
        meetingNode = slow;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `🎯 COLLISION! Tortoise and Hare intersect at node[${slow}] (val ${nodes[slow].val}). Cycle is guaranteed!`,
          isMilestone: true,
          milestoneTitle: `Intersection at node[${slow}]`,
          soundCue: { type: 'sorted' },
          callStack: [
            { name: 'hasCycle(head)', params: { meetingNode: slow }, line: 7, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { meetingNode: slow, hasCycle: true },
          state: {
            nodes,
            slow,
            fast,
            hasCycle: true,
            meetingPoint: slow,
            phase: 'found',
          },
        });
        break;
      }
    }

    // Phase 2: Find cycle entry node if meeting occurred
    if (meetingNode !== null) {
      let ptr1 = 0; // reset to head
      let ptr2 = meetingNode; // stays at meeting point

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Phase 2 (Cycle Entry Detection): Reset pointer 1 to Head (node[0]) and keep pointer 2 at meeting point node[${ptr2}]. Both advance at 1x speed to find cycle start!`,
        isMilestone: true,
        milestoneTitle: 'Finding Cycle Entry',
        soundCue: { type: 'step' },
        callStack: [
          { name: 'findCycleStart(head, meetingNode)', params: { ptr1: 0, ptr2 }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { ptr1, ptr2, phase: 'find_entry' },
        conditionEval: { expr: `ptr1 (${ptr1}) == ptr2 (${ptr2})`, result: ptr1 === ptr2 },
        state: {
          nodes,
          slow: ptr1,
          fast: ptr2,
          hasCycle: true,
          meetingPoint: meetingNode,
          phase: 'found',
        },
      });

      let entryStep = 1;
      while (ptr1 !== ptr2 && entryStep <= 15) {
        ptr1 = nodes[ptr1].nextIndex;
        ptr2 = nodes[ptr2].nextIndex;
        const reached = ptr1 === ptr2;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: reached
            ? `Cycle start found at node[${ptr1}] (val ${nodes[ptr1].val})! Both pointers converged at cycle origin.`
            : `Entry Step ${entryStep}: Pointer 1 advanced to node[${ptr1}], Pointer 2 advanced to node[${ptr2}].`,
          isMilestone: reached,
          milestoneTitle: reached ? `Cycle Origin: node[${ptr1}]` : undefined,
          soundCue: reached ? { type: 'complete' } : { type: 'step' },
          callStack: [
            { name: 'findCycleStart(head, meetingNode)', params: { ptr1, ptr2, entryStep }, line: 9, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { entryStep, ptr1, ptr2, entryNode: reached ? ptr1 : undefined },
          conditionEval: { expr: `ptr1 (${ptr1}) == ptr2 (${ptr2})`, result: reached },
          state: {
            nodes,
            slow: ptr1,
            fast: ptr2,
            hasCycle: true,
            meetingPoint: reached ? ptr1 : meetingNode,
            phase: 'found',
          },
        });
        entryStep++;
      }
    }

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<FloydCycleState>) => {
    const { nodes, slow, fast, hasCycle, meetingPoint } = frame.state;
    const n = nodes.length;
    // Detect where the cycle back-edge lands (tail's nextIndex)
    const lastNode = nodes[n - 1];
    const cycleEntry =
      lastNode && typeof lastNode.nextIndex === 'number' && lastNode.nextIndex >= 0 && lastNode.nextIndex < n
        ? lastNode.nextIndex
        : null;

    // Layout as a true textbook ρ-shape: linear stem [0..cycleEntry-1] -> circular cycle ring [cycleEntry..n-1]
    const nodeR = 21;
    const stemCount = cycleEntry !== null ? cycleEntry : n;
    const ringCount = cycleEntry !== null ? n - cycleEntry : 0;
    const stemSpacing = 74;
    const ringRadius = Math.max(58, Math.min(82, ringCount * 16));
    const stemStartX = 48;
    const cy = 128;
    const ringCx = stemStartX + stemCount * stemSpacing + ringRadius - 10;

    const coords = nodes.map((_, idx) => {
      if (cycleEntry === null || idx < cycleEntry) {
        return { x: stemStartX + idx * stemSpacing, y: cy };
      }
      const ringPos = idx - cycleEntry;
      // Start cycle entry at the left (angle = π) and go clockwise
      const angle = Math.PI + (ringPos / Math.max(1, ringCount)) * Math.PI * 2;
      return {
        x: ringCx + ringRadius * Math.cos(angle),
        y: cy + ringRadius * Math.sin(angle),
      };
    });
    const svgWidth = Math.max(420, ringCx + ringRadius + 64);

    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full min-h-[360px] gap-4 select-none">
        {/* Status HUD */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-[#111827] border border-[#1F293D] px-5 py-2.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐢</span>
            <div className="flex flex-col">
              <span className="text-[9.5px] font-mono text-slate-400">SLOW (+1 step)</span>
              <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                node[{slow}] = {nodes[slow]?.val}
              </span>
            </div>
          </div>
          <div className="w-px h-7 bg-[#1F293D]" />
          <div className="flex items-center gap-2">
            <span className="text-lg">🐇</span>
            <div className="flex flex-col">
              <span className="text-[9.5px] font-mono text-slate-400">FAST (+2 steps)</span>
              <span className="text-xs font-bold font-mono text-amber-400 tabular-nums">
                node[{fast}] = {nodes[fast]?.val}
              </span>
            </div>
          </div>
          <div className="w-px h-7 bg-[#1F293D]" />
          <div className="flex flex-col items-center">
            <span className="text-[9.5px] font-mono text-slate-400">CYCLE STATUS</span>
            <span
              style={
                hasCycle
                  ? {
                      backgroundColor: 'var(--sem-sorted-bg)',
                      color: 'var(--sem-sorted-text)',
                      borderColor: 'var(--sem-sorted-border)',
                    }
                  : undefined
              }
              className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
                hasCycle ? '' : 'bg-[#1E293B] border-[#334155] text-slate-400'
              }`}
            >
              {hasCycle ? `COLLISION @ [${meetingPoint}]` : 'RACING...'}
            </span>
          </div>
        </div>

        {/* True ρ-Shape (Stem + Cycle Loop) SVG Diagram */}
        <div className="w-full max-w-2xl rounded-2xl bg-[#111827] border border-[#1F293D] p-3 flex items-center justify-center overflow-x-auto shadow-sm">
          <svg viewBox={`0 0 ${svgWidth} 256`} className="w-full h-auto min-w-[380px] max-h-[260px] overflow-visible">
            <defs>
              <marker id="floyd-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'var(--svg-edge-default)' }} />
              </marker>
              <marker id="floyd-arr-cycle" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'var(--sem-swapping-solid)' }} />
              </marker>
            </defs>

            {/* Edges */}
            {nodes.map((node, idx) => {
              const target = node.nextIndex;
              if (target === null || target === undefined || !coords[target]) return null;
              const a = coords[idx];
              const b = coords[target];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy) || 1;
              const ux = dx / dist;
              const uy = dy / dist;
              const isBackEdge = target <= idx;

              return (
                <g key={`floyd-edge-${idx}`}>
                  <line
                    x1={a.x + ux * (nodeR + 2)}
                    y1={a.y + uy * (nodeR + 2)}
                    x2={b.x - ux * (nodeR + 8)}
                    y2={b.y - uy * (nodeR + 8)}
                    style={{ stroke: isBackEdge ? 'var(--sem-swapping-solid)' : 'var(--svg-edge-default)' }}
                    strokeWidth={isBackEdge ? 2.8 : 2}
                    strokeDasharray={isBackEdge ? '5 3' : undefined}
                    markerEnd={isBackEdge ? 'url(#floyd-arr-cycle)' : 'url(#floyd-arr)'}
                  />
                  {isBackEdge &&
                    (() => {
                      const mx = (a.x + b.x) / 2;
                      const my = (a.y + b.y) / 2;
                      // Push badge cleanly outward away from the cycle center so it never collides with the dashed arrow
                      const outDx = mx - ringCx;
                      const outDy = my - cy;
                      const outLen = Math.hypot(outDx, outDy) || 1;
                      const lx = mx + (outDx / outLen) * 26;
                      const ly = my + (outDy / outLen) * 26;
                      return (
                        <g>
                          <rect
                            x={lx - 42}
                            y={ly - 8}
                            width={84}
                            height={15}
                            rx={4}
                            style={{
                              fill: 'var(--svg-badge-bg)',
                              stroke: 'var(--sem-swapping-border)',
                            }}
                            strokeWidth="1"
                          />
                          <text
                            x={lx}
                            y={ly + 2.5}
                            textAnchor="middle"
                            style={{ fill: 'var(--sem-swapping-text)' }}
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            cycle back-edge
                          </text>
                        </g>
                      );
                    })()}
                </g>
              );
            })}

            {cycleEntry !== null && (
              <text
                x={ringCx}
                y={cy + 4}
                textAnchor="middle"
                style={{ fill: 'var(--theme-text-muted)' }}
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                CYCLE LOOP
              </text>
            )}

            {/* Nodes */}
            {nodes.map((node, idx) => {
              const pos = coords[idx];
              const isSlow = slow === idx;
              const isFast = fast === idx;
              const isMeeting = meetingPoint === idx;
              const isEntry = cycleEntry === idx;

              const fill = isMeeting
                ? 'var(--sem-sorted-bg)'
                : isSlow && isFast
                ? 'var(--sem-pivot-bg)'
                : isSlow
                ? 'var(--sem-sorted-bg)'
                : isFast
                ? 'var(--sem-comparing-bg)'
                : 'var(--svg-node-bg)';
              const stroke = isMeeting
                ? 'var(--sem-sorted-border)'
                : isSlow && isFast
                ? 'var(--sem-pivot-border)'
                : isSlow
                ? 'var(--sem-sorted-border)'
                : isFast
                ? 'var(--sem-comparing-border)'
                : isEntry
                ? 'var(--sem-swapping-border)'
                : 'var(--svg-node-border)';
              const textFill = isMeeting
                ? 'var(--sem-sorted-text)'
                : isSlow && isFast
                ? 'var(--sem-pivot-text)'
                : isSlow
                ? 'var(--sem-sorted-text)'
                : isFast
                ? 'var(--sem-comparing-text)'
                : 'var(--svg-node-text)';

              return (
                <g key={node.id}>
                  {(isMeeting || (isSlow && isFast)) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeR + 6}
                      fill="none"
                      style={{ stroke: 'var(--sem-sorted-solid)' }}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeR}
                    style={{ fill, stroke }}
                    strokeWidth={isSlow || isFast || isMeeting ? 3 : 2}
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
                    [{idx}]
                  </text>

                  {/* Slow / Fast pointer badges above node */}
                  {(isSlow || isFast) && (
                    <g>
                      <rect
                        x={pos.x - (isSlow && isFast ? 28 : 20)}
                        y={pos.y - nodeR - 18}
                        width={isSlow && isFast ? 56 : 40}
                        height={15}
                        rx={4}
                        style={{
                          fill:
                            isSlow && isFast
                              ? 'var(--sem-pivot-solid)'
                              : isSlow
                              ? 'var(--sem-sorted-solid)'
                              : 'var(--sem-comparing-solid)',
                        }}
                      />
                      <text
                        x={pos.x}
                        y={pos.y - nodeR - 8}
                        textAnchor="middle"
                        className="svg-on-solid"
                        style={{
                          fill:
                            isSlow && isFast
                              ? 'var(--sem-pivot-on-solid)'
                              : isSlow
                              ? 'var(--sem-sorted-on-solid)'
                              : 'var(--sem-comparing-on-solid)',
                        }}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {isSlow && isFast ? '🐢+🐇' : isSlow ? '🐢 SLOW' : '🐇 FAST'}
                      </text>
                    </g>
                  )}

                  {isEntry && (
                    <text
                      x={pos.x}
                      y={pos.y + nodeR + 13}
                      textAnchor="middle"
                      style={{ fill: 'var(--sem-swapping-text)' }}
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ENTRY
                    </text>
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
