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

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize slow = 0 (val ${raw[0]}), fast = 0 (val ${raw[0]}).`,
      state: { nodes, slowIndex: 0, fastIndex: 0, isFinished: false },
    });

    while (fast < n && fast + 1 < n) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `Checking condition: fast (node #${fast}) and fast.next (node #${fast + 1}) exist. Advance pointers.`,
        state: { nodes, slowIndex: slow, fastIndex: fast, isFinished: false },
      });

      slow += 1;
      fast += 2;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Advanced slow by 1 -> node #${slow} (val ${raw[slow]}), advanced fast by 2 -> ${
          fast >= n ? 'beyond tail (NULL)' : `node #${fast} (val ${raw[fast]})`
        }.`,
        isMilestone: true,
        milestoneTitle: `Step to Slow: #${slow}, Fast: #${fast}`,
        state: { nodes, slowIndex: slow, fastIndex: Math.min(fast, n), isFinished: false },
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `Fast reached tail boundary. Middle node identified at index #${slow} with value ${raw[slow]}!`,
      isMilestone: true,
      milestoneTitle: `Middle Node Found (${raw[slow]})`,
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
