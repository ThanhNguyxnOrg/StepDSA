import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface MidNode {
  id: string;
  val: number;
}

export interface MiddleLinkedListState {
  nodes: MidNode[];
  slowIndex: number;
  fastIndex: number;
  isFinished: boolean;
}

export const middleLinkedListModule: AlgorithmModule<number[], MiddleLinkedListState> = {
  id: 'middle-linked-list',
  title: 'Middle of the Linked List (Fast & Slow Pointers)',
  category: 'linked-lists',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N/2)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Traverses to end of list in exactly ceil(N / 2) pointer steps',
  },
  theory: {
    overview:
      'Finding the middle node of a linked list in a single pass without computing the total length beforehand using the Tortoise and Hare (Fast & Slow) two-pointer technique.',
    whyItWorks:
      'The fast pointer moves two nodes for every one node the slow pointer traverses. When the fast pointer reaches the end (null or fast.next == null), the slow pointer has traversed exactly half the list length (N/2), positioning it directly at the middle node.',
    invariant:
      'Speed Invariant: distance(head, fast) == 2 * distance(head, slow).',
    pitfalls: [
      'Null pointer dereference when checking fast.next before checking fast != null.',
      'Even vs odd length differences (returning lower-mid vs upper-mid node).',
    ],
  },
  presets: [
    {
      id: 'odd-length',
      label: 'Odd Length (5 Nodes)',
      description: 'Single exact center node (node #2)',
      data: [1, 2, 3, 4, 5],
    },
    {
      id: 'even-length',
      label: 'Even Length (6 Nodes)',
      description: 'Two center nodes; returns 2nd middle (node #3)',
      data: [10, 20, 30, 40, 50, 60],
    },
  ],
  defaultInput: [1, 2, 3, 4, 5],
  codeSnippets: {
    python: `def find_middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
    typescript: `function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next!;
    fast = fast.next.next;
  }
  return slow;
}`,
    cpp: `ListNode* middleNode(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
    java: `public ListNode middleNode(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
    pseudocode: `function findMiddle(head):
    slow <- head, fast <- head
    while fast != null and fast.next != null:
        slow <- slow.next
        fast <- fast.next.next
    return slow`,
  },
  generateTimeline: (input: number[]) => {
    const raw = input.length > 0 ? input.slice(0, 7) : [1, 2, 3, 4, 5];
    const n = raw.length;
    const nodes: MidNode[] = raw.map((val, idx) => ({ id: `mid-${idx}`, val }));

    let slow = 0;
    let fast = 0;
    const frames: ExecutionFrame<MiddleLinkedListState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize slow = 0 (val ${raw[0]}), fast = 0 (val ${raw[0]}). Both pointers start at head node.`,
      isMilestone: true,
      milestoneTitle: 'Initialized Pointers',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'middleNode(head)', params: { length: n, headVal: raw[0] }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { slow: 0, fast: 0, n, 'slow.val': raw[0], 'fast.val': raw[0] },
      conditionEval: { expr: 'fast != null && fast.next != null', result: true },
      state: { nodes, slowIndex: 0, fastIndex: 0, isFinished: false },
    });

    let iter = 1;
    while (fast < n && fast + 1 < n) {
      // Step A: Condition verification
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `Iteration ${iter}: Checking while condition. fast (node #${fast}) and fast.next (node #${fast + 1}) exist. Condition is TRUE.`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'middleNode(head)', params: { iter, slow, fast }, line: 3, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { iter, slow, fast, 'fast.next': fast + 1 < n ? fast + 1 : 'null' },
        conditionEval: { expr: `fast (${fast}) < ${n} && fast.next (${fast + 1}) < ${n}`, result: true },
        state: { nodes, slowIndex: slow, fastIndex: fast, isFinished: false },
      });

      // Step B: Advance slow by 1
      const oldSlow = slow;
      slow += 1;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Iteration ${iter}: Advance slow pointer 1 step: node #${oldSlow} -> node #${slow} (val ${raw[slow]}).`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'middleNode(head)', params: { iter, 'slow.next': slow }, line: 4, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { iter, slow, fast, 'slow.val': raw[slow] },
        state: { nodes, slowIndex: slow, fastIndex: fast, isFinished: false },
      });

      // Step C: Advance fast hop 1
      const oldFast = fast;
      const hop1 = fast + 1;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Iteration ${iter}: Fast pointer leaps 1st hop: node #${oldFast} -> node #${hop1} (val ${raw[hop1]}).`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'middleNode(head)', params: { iter, fastHop: 1 }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { iter, slow, fast: hop1, hop: '1 of 2' },
        state: { nodes, slowIndex: slow, fastIndex: hop1, isFinished: false },
      });

      // Step D: Advance fast hop 2
      fast += 2;
      const fastOut = fast >= n;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Iteration ${iter}: Fast pointer leaps 2nd hop: -> ${
          fastOut ? `NULL (beyond index ${n - 1})` : `node #${fast} (val ${raw[fast]})`
        }.`,
        soundCue: { type: 'step' },
        isMilestone: true,
        milestoneTitle: `Iteration ${iter} Completed`,
        callStack: [
          { name: 'middleNode(head)', params: { iter, fast: fastOut ? 'NULL' : fast }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { iter, slow, fast: fastOut ? 'NULL' : fast, 'slow.val': raw[slow] },
        state: { nodes, slowIndex: slow, fastIndex: Math.min(fast, n), isFinished: false },
      });

      iter++;
    }

    // Step: Loop termination check
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Loop terminates: fast pointer (${fast >= n ? 'NULL' : `node #${fast}`}) cannot advance 2 steps. Condition is FALSE.`,
      soundCue: { type: 'compare' },
      callStack: [
        { name: 'middleNode(head)', params: { slow, fast }, line: 3, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { slow, fast: fast >= n ? 'NULL' : fast, terminated: true },
      conditionEval: { expr: `fast (${fast}) < ${n} && fast.next < ${n}`, result: false },
      state: { nodes, slowIndex: slow, fastIndex: Math.min(fast, n), isFinished: false },
    });

    // Step: Final middle node result
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      explanation: `🎉 Middle node identified at index #${slow} with value ${raw[slow]}! Tortoise & Hare invariant holds.`,
      isMilestone: true,
      milestoneTitle: `Middle Node Found (${raw[slow]})`,
      soundCue: { type: 'complete' },
      callStack: [
        { name: 'middleNode(head)', params: { resultIndex: slow, resultVal: raw[slow] }, line: 7, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { middleIndex: slow, middleVal: raw[slow], isEvenLength: n % 2 === 0 },
      state: { nodes, slowIndex: slow, fastIndex: Math.min(fast, n), isFinished: true },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<MiddleLinkedListState>) => {
    const { nodes, slowIndex, fastIndex, isFinished } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Slow Pointer (1x): <span className="text-cyan-400 font-bold">Node #{slowIndex}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Fast Pointer (2x):{' '}
            <span className="text-amber-400 font-bold">
              {fastIndex >= nodes.length ? 'NULL (Past Tail)' : `Node #${fastIndex}`}
            </span>
          </div>
          {isFinished && (
            <div className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-600/60 text-xs font-mono text-emerald-300 font-bold animate-pulse">
              MIDDLE NODE: {nodes[slowIndex]?.val}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 max-w-4xl w-full p-8 bg-slate-950/70 border border-slate-800 rounded-3xl overflow-x-auto">
          {nodes.map((node, idx) => {
            const isSlow = idx === slowIndex;
            const isFast = idx === fastIndex;
            const isResolvedMid = isFinished && isSlow;

            return (
              <div key={node.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold border-2 shadow-xl transition-all duration-300 ${
                      isResolvedMid
                        ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200 ring-4 ring-emerald-400/50 scale-110'
                        : isSlow && isFast
                        ? 'border-purple-400 bg-purple-950/60 text-purple-200 ring-2 ring-purple-400/40'
                        : isSlow
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 ring-2 ring-cyan-400/40 scale-105'
                        : isFast
                        ? 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400/40'
                        : 'border-blue-500/40 bg-slate-900/90 text-white'
                    }`}
                  >
                    <span className="text-lg">{node.val}</span>
                    <span className="text-[9px] text-slate-400 font-normal">#{idx}</span>
                  </div>

                  <div className="flex flex-col gap-1 mt-2 items-center min-h-[36px]">
                    {isSlow && (
                      <span className="text-[8px] font-mono font-bold bg-cyan-950 border border-cyan-600 text-cyan-300 px-1 py-0.5 rounded">
                        SLOW (1x)
                      </span>
                    )}
                    {isFast && (
                      <span className="text-[8px] font-mono font-bold bg-amber-950 border border-amber-600 text-amber-300 px-1 py-0.5 rounded">
                        FAST (2x)
                      </span>
                    )}
                  </div>
                </div>

                {idx < nodes.length - 1 && (
                  <div className="flex items-center text-slate-500 font-mono text-lg font-bold">
                    →
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-slate-600 font-mono text-xs italic px-2">→ NULL</div>
        </div>
      </div>
    );
  },
};
