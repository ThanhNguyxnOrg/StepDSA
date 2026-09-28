import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface IntersectNode {
  id: string;
  val: number;
  isIntersection: boolean;
}

export interface IntersectionLinkedListState {
  listA: IntersectNode[];
  listB: IntersectNode[];
  sharedList: IntersectNode[];
  ptrA: { list: 'A' | 'B' | 'shared'; index: number } | null;
  ptrB: { list: 'A' | 'B' | 'shared'; index: number } | null;
  hasSwitchedA: boolean;
  hasSwitchedB: boolean;
  intersectionFound: boolean;
}

export const intersectionLinkedListModule: AlgorithmModule<
  { listA: number[]; listB: number[]; shared: number[] },
  IntersectionLinkedListState
> = {
  id: 'intersection-of-two-linked-lists',
  title: 'Intersection of Two Linked Lists (Pointer Alignment O(N + M))',
  category: 'linked-lists',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1) same head',
    timeAverage: 'O(N + M)',
    timeWorst: 'O(N + M)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Traverses length(A) + length(B) nodes before intersecting or reaching null',
  },
  theory: {
    overview:
      'Given the heads of two singly linked lists headA and headB, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return null.',
    whyItWorks:
      'By having pointer A traverse list A then redirect to headB, and pointer B traverse list B then redirect to headA, both pointers traverse identical total distance: len(A) + len(B). If an intersection exists, they will collide at the intersection node on their second pass.',
    invariant:
      'Distance Symmetry Invariant: dist(ptrA) == dist(ptrB) at step k. Collisions occur precisely when remaining suffix distances align.',
    pitfalls: [
      'Infinite looping if switching pointers without correctly halting when both reach null simultaneously.',
      'Comparing node values instead of reference identities.',
    ],
  },
  presets: [
    {
      id: 'classic-intersect',
      label: 'Intersect at 8 (A: [4,1], B: [5,6,1], Shared: [8,4,5])',
      description: 'List A (len 5) and List B (len 6) meet at node 8',
      data: { listA: [4, 1], listB: [5, 6, 1], shared: [8, 4, 5] },
    },
    {
      id: 'no-intersect',
      label: 'No Intersection (Disjoint Lists)',
      description: 'Both pointers cycle once and terminate together at null',
      data: { listA: [2, 6, 4], listB: [1, 5], shared: [] },
    },
  ],
  defaultInput: { listA: [4, 1], listB: [5, 6, 1], shared: [8, 4, 5] },
  codeSnippets: {
    python: `def getIntersectionNode(headA, headB):
    pA, pB = headA, headB
    while pA != pB:
        pA = pA.next if pA else headB
        pB = pB.next if pB else headA
    return pA`,
    typescript: `function getIntersectionNode(headA: ListNode | null, headB: ListNode | null): ListNode | null {
  let pA = headA;
  let pB = headB;
  while (pA !== pB) {
    pA = pA === null ? headB : pA.next;
    pB = pB === null ? headA : pB.next;
  }
  return pA;
}`,
    cpp: `ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
    ListNode *pA = headA, *pB = headB;
    while (pA != pB) {
        pA = pA ? pA->next : headB;
        pB = pB ? pB->next : headA;
    }
    return pA;
}`,
    java: `public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    ListNode pA = headA, pB = headB;
    while (pA != pB) {
        pA = (pA == null) ? headB : pA.next;
        pB = (pB == null) ? headA : pB.next;
    }
    return pA;
}`,
    pseudocode: `function getIntersectionNode(headA, headB):
    pA = headA, pB = headB
    while pA != pB:
        pA = (pA is null) ? headB : pA.next
        pB = (pB is null) ? headA : pB.next
    return pA`,
  },

  generateTimeline: (input: {
    listA: number[];
    listB: number[];
    shared: number[];
  }): ExecutionFrame<IntersectionLinkedListState>[] => {
    const rawA = input.listA.length > 0 ? input.listA : [4, 1];
    const rawB = input.listB.length > 0 ? input.listB : [5, 6, 1];
    const rawShared = input.shared;

    const fullA: IntersectNode[] = [
      ...rawA.map((v, i) => ({ id: `a-${i}`, val: v, isIntersection: false })),
      ...rawShared.map((v, i) => ({ id: `s-${i}`, val: v, isIntersection: true })),
    ];
    const fullB: IntersectNode[] = [
      ...rawB.map((v, i) => ({ id: `b-${i}`, val: v, isIntersection: false })),
      ...rawShared.map((v, i) => ({ id: `s-${i}`, val: v, isIntersection: true })),
    ];

    const frames: ExecutionFrame<IntersectionLinkedListState>[] = [];

    // Pointer sequences: A traverses fullA, then fullB, then null
    // B traverses fullB, then fullA, then null
    type PtrPos = { node: IntersectNode | null; desc: string; list: 'A' | 'B' | 'shared'; index: number };
    const seqA: PtrPos[] = [];
    fullA.forEach((n, i) => {
      const isShared = i >= rawA.length;
      seqA.push({
        node: n,
        desc: `A[${i}] (${n.val})`,
        list: isShared ? 'shared' : 'A',
        index: isShared ? i - rawA.length : i,
      });
    });
    // switch to B
    fullB.forEach((n, i) => {
      const isShared = i >= rawB.length;
      seqA.push({
        node: n,
        desc: `B[${i}] (${n.val})`,
        list: isShared ? 'shared' : 'B',
        index: isShared ? i - rawB.length : i,
      });
    });
    seqA.push({ node: null, desc: 'null', list: 'A', index: -1 });

    const seqB: PtrPos[] = [];
    fullB.forEach((n, i) => {
      const isShared = i >= rawB.length;
      seqB.push({
        node: n,
        desc: `B[${i}] (${n.val})`,
        list: isShared ? 'shared' : 'B',
        index: isShared ? i - rawB.length : i,
      });
    });
    // switch to A
    fullA.forEach((n, i) => {
      const isShared = i >= rawA.length;
      seqB.push({
        node: n,
        desc: `A[${i}] (${n.val})`,
        list: isShared ? 'shared' : 'A',
        index: isShared ? i - rawA.length : i,
      });
    });
    seqB.push({ node: null, desc: 'null', list: 'B', index: -1 });

    // Step 0: Initial
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize pointer pA at headA (${rawA[0] ?? 'empty'}) and pB at headB (${rawB[0] ?? 'empty'}). Length(A) = ${fullA.length}, Length(B) = ${fullB.length}.`,
      variables: {
        ptrA: seqA[0]?.desc ?? 'null',
        ptrB: seqB[0]?.desc ?? 'null',
        sharedNodes: rawShared.length,
      },
      callStack: [
        { name: 'getIntersectionNode(headA, headB)', params: { lenA: fullA.length, lenB: fullB.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        listA: fullA.filter((n) => !n.isIntersection),
        listB: fullB.filter((n) => !n.isIntersection),
        sharedList: fullA.filter((n) => n.isIntersection),
        ptrA: seqA[0] ? { list: seqA[0].list, index: seqA[0].index } : null,
        ptrB: seqB[0] ? { list: seqB[0].list, index: seqB[0].index } : null,
        hasSwitchedA: false,
        hasSwitchedB: false,
        intersectionFound: false,
      },
    });

    const maxSteps = Math.max(seqA.length, seqB.length);
    for (let step = 0; step < maxSteps; step++) {
      const posA = seqA[Math.min(step, seqA.length - 1)];
      const posB = seqB[Math.min(step, seqB.length - 1)];

      const isCollision = posA.node !== null && posA.node.id === posB.node?.id;
      const bothNull = posA.node === null && posB.node === null;

      if (isCollision) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          isMilestone: true,
          milestoneTitle: `Intersection Detected at Node (${posA.node?.val})`,
          explanation: `Pointers pA and pB collided at node ${posA.node?.val} (ID: ${posA.node?.id}). Both pointers have traveled equal distance and are aligned!`,
          variables: { intersectionNode: posA.node?.val ?? 0, totalSteps: step },
          callStack: [
            { name: `collision(node=${posA.node?.val})`, params: { val: posA.node?.val ?? 0 }, line: 5, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            listA: fullA.filter((n) => !n.isIntersection),
            listB: fullB.filter((n) => !n.isIntersection),
            sharedList: fullA.filter((n) => n.isIntersection),
            ptrA: { list: posA.list, index: posA.index },
            ptrB: { list: posB.list, index: posB.index },
            hasSwitchedA: step >= fullA.length,
            hasSwitchedB: step >= fullB.length,
            intersectionFound: true,
          },
        });
        break;
      }

      if (bothNull) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          isMilestone: true,
          milestoneTitle: 'No Intersection (Both Reached Null)',
          explanation: `Both pointers completed traversing len(A) + len(B) and reached null simultaneously. No intersection exists between the two lists.`,
          variables: { intersection: 'null' },
          callStack: [
            { name: 'returnNull()', params: {}, line: 5, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            listA: fullA.filter((n) => !n.isIntersection),
            listB: fullB.filter((n) => !n.isIntersection),
            sharedList: fullA.filter((n) => n.isIntersection),
            ptrA: null,
            ptrB: null,
            hasSwitchedA: true,
            hasSwitchedB: true,
            intersectionFound: false,
          },
        });
        break;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Step ${step + 1}: pA is at ${posA.desc}, pB is at ${posB.desc}.`,
        variables: { ptrA: posA.desc, ptrB: posB.desc, step: step + 1 },
        callStack: [
          { name: `advance(step=${step + 1})`, params: { pA: posA.desc, pB: posB.desc }, line: 4, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          listA: fullA.filter((n) => !n.isIntersection),
          listB: fullB.filter((n) => !n.isIntersection),
          sharedList: fullA.filter((n) => n.isIntersection),
          ptrA: posA.node ? { list: posA.list, index: posA.index } : null,
          ptrB: posB.node ? { list: posB.list, index: posB.index } : null,
          hasSwitchedA: step >= fullA.length,
          hasSwitchedB: step >= fullB.length,
          intersectionFound: false,
        },
      });
    }

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<IntersectionLinkedListState>) => {
    const { listA, listB, sharedList, ptrA, ptrB, intersectionFound } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              List A Exclusive: <strong className="text-white">{listA.length} nodes</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-400">
              List B Exclusive: <strong className="text-white">{listB.length} nodes</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Shared Suffix: <strong className="text-white">{sharedList.length} nodes</strong>
            </div>
          </div>

          {intersectionFound && (
            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold animate-pulse">
              🎯 COLLISION AT INTERSECTION NODE
            </div>
          )}
        </div>

        {/* Y-Shaped Linked List Visualizer */}
        <div className="w-full flex flex-col gap-6 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          {/* Branch A */}
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs font-mono font-bold text-cyan-400 shrink-0">LIST A:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {listA.map((node, idx) => {
                const hasA = ptrA?.list === 'A' && ptrA.index === idx;
                const hasB = ptrB?.list === 'A' && ptrB.index === idx;
                return (
                  <div key={node.id} className="relative flex flex-col items-center">
                    {hasA && (
                      <span className="absolute -top-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                        pA
                      </span>
                    )}
                    {hasB && (
                      <span className="absolute -bottom-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950">
                        pB
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-white">
                      {node.val}
                    </div>
                  </div>
                );
              })}
              <span className="text-slate-600 font-mono">↘</span>
            </div>
          </div>

          {/* Branch B */}
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs font-mono font-bold text-amber-400 shrink-0">LIST B:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {listB.map((node, idx) => {
                const hasA = ptrA?.list === 'B' && ptrA.index === idx;
                const hasB = ptrB?.list === 'B' && ptrB.index === idx;
                return (
                  <div key={node.id} className="relative flex flex-col items-center">
                    {hasA && (
                      <span className="absolute -top-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                        pA
                      </span>
                    )}
                    {hasB && (
                      <span className="absolute -bottom-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950">
                        pB
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-white">
                      {node.val}
                    </div>
                  </div>
                );
              })}
              <span className="text-slate-600 font-mono">↗</span>
            </div>
          </div>

          {/* Shared Common Suffix */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="w-16 text-xs font-mono font-bold text-emerald-400 shrink-0">SHARED:</span>
            {sharedList.length === 0 ? (
              <span className="text-xs font-mono text-slate-600 italic">No shared nodes (Disjoint lists)</span>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {sharedList.map((node, idx) => {
                  const hasA = ptrA?.list === 'shared' && ptrA.index === idx;
                  const hasB = ptrB?.list === 'shared' && ptrB.index === idx;
                  const isCollision = hasA && hasB;
                  return (
                    <div key={node.id} className="relative flex flex-col items-center">
                      {isCollision ? (
                        <span className="absolute -top-6 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-500 text-slate-950 animate-bounce">
                          pA == pB
                        </span>
                      ) : (
                        <>
                          {hasA && (
                            <span className="absolute -top-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                              pA
                            </span>
                          )}
                          {hasB && (
                            <span className="absolute -bottom-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950">
                              pB
                            </span>
                          )}
                        </>
                      )}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-white transition-all ${
                          isCollision
                            ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-110 font-extrabold'
                            : 'bg-emerald-950/40 border border-emerald-500/50'
                        }`}
                      >
                        {node.val}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};
