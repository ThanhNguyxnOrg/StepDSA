import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface MergeNode {
  id: string;
  val: number;
  listOrigin: 1 | 2;
  status: 'normal' | 'comparing' | 'merged';
}

export interface MergeListsState {
  list1: MergeNode[];
  list2: MergeNode[];
  mergedList: MergeNode[];
  p1: number;
  p2: number;
}

export const mergeTwoListsModule: AlgorithmModule<
  { list1: number[]; list2: number[] },
  MergeListsState
> = {
  id: 'merge-two-sorted-lists',
  title: 'Merge Two Sorted Lists (Pointer Splice O(N + M))',
  category: 'linked-lists',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(min(N, M))',
    timeAverage: 'O(N + M)',
    timeWorst: 'O(N + M)',
    spaceAuxiliary: 'O(1) in-place pointer relinking',
    worstCaseCondition: 'Elements alternate strictly between list 1 and list 2',
  },
  theory: {
    overview:
      'Merge two sorted linked lists into a single sorted linked list by splicing together the nodes of the original lists in non-decreasing order.',
    whyItWorks:
      'Because both lists are pre-sorted, comparing the heads of the remaining lists (p1 and p2) guarantees that min(list1[p1], list2[p2]) is smaller than all remaining elements in both lists. Appending the smaller node to the merged list and advancing that pointer maintains the sorted invariant.',
    invariant:
      'Sorted Prefix Invariant: The merged list contains the k smallest elements from the union of list1 and list2 in sorted order.',
    pitfalls: [
      'Forgetting to attach remaining tail when one list is exhausted.',
      'Creating redundant new nodes instead of re-linking existing node pointers.',
    ],
  },
  presets: [
    {
      id: 'interleaved',
      label: 'Interleaved Lists',
      description: 'L1: [1, 3, 5], L2: [2, 4, 6]',
      data: { list1: [1, 3, 5], list2: [2, 4, 6] },
    },
    {
      id: 'disjoint-ranges',
      label: 'Disjoint Ranges',
      description: 'L1: [1, 2, 3], L2: [7, 8, 9]',
      data: { list1: [1, 2, 3], list2: [7, 8, 9] },
    },
  ],
  defaultInput: { list1: [1, 3, 5], list2: [2, 4, 6] },
  codeSnippets: {
    python: `def merge_two_lists(l1, l2):
    dummy = ListNode(0)
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
    tail.next = l1 if l1 else l2
    return dummy.next`,
    typescript: `function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 !== null ? l1 : l2;
  return dummy.next;
}`,
    cpp: `ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) {
            tail->next = l1;
            l1 = l1->next;
        } else {
            tail->next = l2;
            l2 = l2->next;
        }
        tail = tail->next;
    }
    tail->next = l1 ? l1 : l2;
    return dummy.next;
}`,
    java: `public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    while (l1 != null && l2 != null) {
        if (l1.val <= l2.val) {
            tail.next = l1; l1 = l1.next;
        } else {
            tail.next = l2; l2 = l2.next;
        }
        tail = tail.next;
    }
    tail.next = (l1 != null) ? l1 : l2;
    return dummy.next;
}`,
    pseudocode: `function mergeTwoLists(l1, l2):
    dummy <- new Node(0)
    tail <- dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next <- l1; l1 <- l1.next
        else:
            tail.next <- l2; l2 <- l2.next
        tail <- tail.next
    tail.next <- l1 or l2
    return dummy.next`,
  },
  generateTimeline: (input) => {
    const rawL1 = input.list1.length > 0 ? input.list1 : [1, 3, 5];
    const rawL2 = input.list2.length > 0 ? input.list2 : [2, 4, 6];

    const nodesL1: MergeNode[] = rawL1.map((v, i) => ({ id: `l1-${i}`, val: v, listOrigin: 1, status: 'normal' }));
    const nodesL2: MergeNode[] = rawL2.map((v, i) => ({ id: `l2-${i}`, val: v, listOrigin: 2, status: 'normal' }));

    const mergedList: MergeNode[] = [];
    let p1 = 0;
    let p2 = 0;
    const frames: ExecutionFrame<MergeListsState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized Merge of List 1 ([${rawL1.join(', ')}]) and List 2 ([${rawL2.join(', ')}]).`,
      variables: { p1: 0, p2: 0, mergedCount: 0 },
      callStack: [{ name: 'mergeTwoLists(l1, l2)', params: { p1: 0, p2: 0 }, line: 2, isCurrent: true }, { name: 'main()', params: {}, line: 1 }],
      state: { list1: nodesL1, list2: nodesL2, mergedList: [], p1: 0, p2: 0 },
    });

    while (p1 < nodesL1.length && p2 < nodesL2.length) {
      const v1 = nodesL1[p1].val;
      const v2 = nodesL2[p2].val;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Comparing List 1 element ${v1} with List 2 element ${v2}.`,
        variables: { val1: v1, val2: v2, p1, p2 },
        callStack: [{ name: 'mergeTwoLists(l1, l2)', params: { val1: v1, val2: v2 }, line: 4, isCurrent: true }, { name: 'main()', params: {}, line: 1 }],
        conditionEval: { expr: `${v1} <= ${v2}`, result: v1 <= v2 },
        state: {
          list1: nodesL1.map((n, i) => ({ ...n, status: i === p1 ? 'comparing' : 'normal' })),
          list2: nodesL2.map((n, i) => ({ ...n, status: i === p2 ? 'comparing' : 'normal' })),
          mergedList: [...mergedList],
          p1,
          p2,
        },
      });

      if (v1 <= v2) {
        mergedList.push({ ...nodesL1[p1], status: 'merged' });
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Appended ${v1} from List 1 to merged chain. Advanced p1 to ${p1 + 1}.`,
          isMilestone: true,
          milestoneTitle: `Merged ${v1} from List 1`,
          variables: { appended: v1, p1: p1 + 1, p2 },
          state: {
            list1: nodesL1.map((n, i) => ({ ...n, status: i <= p1 ? 'merged' : 'normal' })),
            list2: nodesL2.map((n, i) => ({ ...n, status: i < p2 ? 'merged' : 'normal' })),
            mergedList: [...mergedList],
            p1: p1 + 1,
            p2,
          },
        });
        p1++;
      } else {
        mergedList.push({ ...nodesL2[p2], status: 'merged' });
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          explanation: `Appended ${v2} from List 2 to merged chain. Advanced p2 to ${p2 + 1}.`,
          isMilestone: true,
          milestoneTitle: `Merged ${v2} from List 2`,
          variables: { appended: v2, p1, p2: p2 + 1 },
          state: {
            list1: nodesL1.map((n, i) => ({ ...n, status: i < p1 ? 'merged' : 'normal' })),
            list2: nodesL2.map((n, i) => ({ ...n, status: i <= p2 ? 'merged' : 'normal' })),
            mergedList: [...mergedList],
            p1,
            p2: p2 + 1,
          },
        });
        p2++;
      }
    }

    // Drain remaining
    while (p1 < nodesL1.length) {
      mergedList.push({ ...nodesL1[p1], status: 'merged' });
      p1++;
    }
    while (p2 < nodesL2.length) {
      mergedList.push({ ...nodesL2[p2], status: 'merged' });
      p2++;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      explanation: `All remaining nodes spliced! Final merged chain: [${mergedList.map((n) => n.val).join(' → ')}].`,
      isMilestone: true,
      milestoneTitle: 'Merge Complete',
      variables: { totalMerged: mergedList.length },
      state: {
        list1: nodesL1.map((n) => ({ ...n, status: 'merged' })),
        list2: nodesL2.map((n) => ({ ...n, status: 'merged' })),
        mergedList: [...mergedList],
        p1,
        p2,
      },
    });

    const total = frames.length;
    return frames.map((f, i) => ({ ...f, stepIndex: i, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<MergeListsState>) => {
    const { list1, list2, mergedList, p1, p2 } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 gap-6">
        {/* Source Lists */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
          {/* List 1 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-mono font-bold text-cyan-400 mb-2">LIST 1</span>
            <div className="flex items-center gap-2">
              {list1.map((n, i) => (
                <div
                  key={n.id}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm border-2 ${
                    i === p1
                      ? 'border-amber-400 bg-amber-950/70 text-amber-200 ring-2 ring-amber-400/40'
                      : i < p1
                      ? 'border-slate-800 bg-slate-900/30 text-slate-600 line-through'
                      : 'border-cyan-500/50 bg-cyan-950/40 text-cyan-200'
                  }`}
                >
                  {n.val}
                </div>
              ))}
            </div>
          </div>

          {/* List 2 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-mono font-bold text-rose-400 mb-2">LIST 2</span>
            <div className="flex items-center gap-2">
              {list2.map((n, i) => (
                <div
                  key={n.id}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm border-2 ${
                    i === p2
                      ? 'border-amber-400 bg-amber-950/70 text-amber-200 ring-2 ring-amber-400/40'
                      : i < p2
                      ? 'border-slate-800 bg-slate-900/30 text-slate-600 line-through'
                      : 'border-rose-500/50 bg-rose-950/40 text-rose-200'
                  }`}
                >
                  {n.val}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unified Merged List */}
        <div className="p-5 bg-slate-950/90 border-2 border-emerald-500/40 rounded-3xl w-full max-w-3xl flex flex-col items-center">
          <span className="text-xs font-mono font-bold text-emerald-400 mb-3 uppercase tracking-wider">
            Merged Sorted Chain
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-center min-h-[50px]">
            {mergedList.length === 0 ? (
              <span className="text-xs font-mono text-slate-600 italic">(Empty merged chain)</span>
            ) : (
              mergedList.map((n, idx) => (
                <div key={`${n.id}-${idx}`} className="flex items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold border-2 ${
                      n.listOrigin === 1
                        ? 'border-cyan-400 bg-cyan-950 text-cyan-200'
                        : 'border-rose-400 bg-rose-950 text-rose-200'
                    }`}
                  >
                    <span className="text-sm">{n.val}</span>
                    <span className="text-[8px] text-slate-400">L{n.listOrigin}</span>
                  </div>
                  {idx < mergedList.length - 1 && (
                    <span className="text-slate-500 font-mono font-bold">→</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
};
