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

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Tortoise (slow) and Hare (fast) at head node [0] (val ${nodes[0].val}). Loop points back to index ${input.cycleToIndex}.`,
      state: {
        nodes,
        slow: 0,
        fast: 0,
        hasCycle: false,
        meetingPoint: null,
        phase: 'detect',
      },
    });

    for (let step = 1; step <= 20; step++) {
      slow = nodes[slow].nextIndex;
      const nextFast = nodes[fast].nextIndex;
      fast = nodes[nextFast].nextIndex;

      const met = slow === fast;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Step ${step}: Tortoise advances 1 step to [${slow}] (val ${nodes[slow].val}), Hare advances 2 steps to [${fast}] (val ${nodes[fast].val}).`,
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
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `COLLISION DETECTED! Tortoise and Hare meet at node [${slow}] (val ${nodes[slow].val}). Cycle verified!`,
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
