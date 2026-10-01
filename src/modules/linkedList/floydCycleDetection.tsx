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

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Status Indicators */}
        <div className="flex items-center gap-6 bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐢</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-400">TORTOISE (SLOW)</span>
              <span className="text-sm font-bold font-mono text-emerald-400">Node [{slow}] = {nodes[slow]?.val}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐇</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-400">HARE (FAST)</span>
              <span className="text-sm font-bold font-mono text-amber-400">Node [{fast}] = {nodes[fast]?.val}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">CYCLE STATUS</span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${hasCycle ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {hasCycle ? `FOUND AT NODE [${meetingPoint}]` : 'SEARCHING...'}
            </span>
          </div>
        </div>

        {/* Nodes and Cycle Link Graphic */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl">
          {nodes.map((node, idx) => {
            const isSlow = slow === idx;
            const isFast = fast === idx;
            const isMeeting = meetingPoint === idx;

            let borderStyle = 'border-slate-700 bg-slate-900/60';
            if (isMeeting) borderStyle = 'border-emerald-400 bg-emerald-950/80 ring-4 ring-emerald-400';
            else if (isSlow && isFast) borderStyle = 'border-purple-400 bg-purple-950/60 ring-2 ring-purple-400';
            else if (isSlow) borderStyle = 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500';
            else if (isFast) borderStyle = 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400';

            return (
              <div key={node.id} className="flex items-center gap-2">
                <div className={`relative flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 transition-all ${borderStyle}`}>
                  <span className="text-lg font-bold font-mono text-white">{node.val}</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">[{idx}]</span>

                  {/* Animal Pointer Tags */}
                  <div className="absolute -top-3 flex gap-0.5">
                    {isSlow && <span className="bg-emerald-600 text-white text-[8px] px-1 rounded font-mono font-bold">🐢</span>}
                    {isFast && <span className="bg-amber-600 text-white text-[8px] px-1 rounded font-mono font-bold">🐇</span>}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-400">→ [{node.nextIndex}]</span>
                  <div className="w-4 h-0.5 bg-slate-600"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
