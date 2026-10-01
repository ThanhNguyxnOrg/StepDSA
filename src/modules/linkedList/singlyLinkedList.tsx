import React from 'react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ListNode {
  val: number;
  id: string;
  status: 'normal' | 'active' | 'comparing' | 'sorted';
}

export interface LinkedListState {
  nodes: ListNode[];
  activePointer?: { name: string; nodeIndex: number };
}

export const singlyLinkedListModule: AlgorithmModule<number[], LinkedListState> = {
  id: 'linked-list',
  title: 'Linked List (Traversal & Insertion)',
  category: 'linked-lists',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Traversing to tail or searching non-existent value',
  },
  theory: {
    overview:
      'A Singly Linked List is a linear collection of data nodes where each node points to the next node via a reference pointer. Unlike arrays, nodes are not stored contiguously in memory.',
    whyItWorks:
      'Insertion and deletion at the head execute in constant O(1) time by re-linking pointers without shifting subsequent elements.',
    invariant:
      'Each node maintains a valid pointer to its successor until reaching NULL at the tail.',
    pitfalls: [
      'Losing reference to the rest of the list when updating head before linking new node.',
      'Dereferencing a null pointer when traversing past the tail.',
    ],
  },
  codeSnippets: {
    python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def traverse_and_insert(head, new_val):
    curr = head
    while curr.next:
        curr = curr.next
    curr.next = ListNode(new_val)
    return head`,
    typescript: `class ListNode {
  val: number;
  next: ListNode | null = null;
  constructor(val: number) { this.val = val; }
}

function insertAtTail(head: ListNode, val: number): ListNode {
  let curr = head;
  while (curr.next !== null) {
    curr = curr.next;
  }
  curr.next = new ListNode(val);
  return head;
}`,
    cpp: `struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* insertAtTail(ListNode* head, int val) {
    ListNode* curr = head;
    while (curr->next) curr = curr->next;
    curr->next = new ListNode(val);
    return head;
}`,
    java: `public class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

public ListNode insertAtTail(ListNode head, int val) {
    ListNode curr = head;
    while (curr.next != null) {
        curr = curr.next;
    }
    curr.next = new ListNode(val);
    return head;
}`,
    pseudocode: `function insertAtTail(head, val):
  curr = head
  while curr.next is not NULL:
    curr = curr.next
  curr.next = new Node(val)
  return head`,
  },
  presets: [
    {
      id: 'default',
      label: 'Standard List (4 Nodes)',
      description: 'A 4-element linked list traversed to insert a new tail',
      data: [12, 28, 45, 67],
    },
    {
      id: 'short',
      label: 'Short List (2 Nodes)',
      description: 'Quick 2-node traversal',
      data: [5, 10],
    },
  ],
  defaultInput: [12, 28, 45, 67],
  generateTimeline: (input: number[]): ExecutionFrame<LinkedListState>[] => {
    const frames: ExecutionFrame<LinkedListState>[] = [];
    const baseNodes: ListNode[] = input.map((v, i) => ({
      val: v,
      id: `node-${i}`,
      status: 'normal',
    }));
    const insertVal = 99;

    // Step 0: Initial state & new node allocation
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Step 0: Initialized list with ${input.length} nodes. Head points to node[0] (val ${baseNodes[0]?.val || 0}). Goal: insert val ${insertVal} at tail.`,
      isMilestone: true,
      milestoneTitle: 'Initialized List',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'insertAtTail(head, val)', params: { head: baseNodes[0]?.val, val: insertVal }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { head: baseNodes[0]?.val, insertVal, length: input.length },
      conditionEval: { expr: 'head != null', result: true },
      state: {
        nodes: baseNodes.map((n, idx) => ({
          ...n,
          status: idx === 0 ? 'active' : 'normal',
        })),
        activePointer: { name: 'curr (HEAD)', nodeIndex: 0 },
      },
    });

    // Step-by-step traversal
    for (let i = 0; i < input.length; i++) {
      const isTail = i === input.length - 1;

      // Sub-step 1: Inspect curr node
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `[Step ${i + 1}A] curr positioned at node #${i} (value ${input[i]}). Checking whether curr.next is null.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'insertAtTail(head, val)', params: { currIndex: i, 'curr.val': input[i] }, line: 3, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { currIndex: i, 'curr.val': input[i], 'curr.next': isTail ? 'null' : `node #${i + 1}` },
        conditionEval: { expr: `curr.next != null`, result: !isTail },
        state: {
          nodes: baseNodes.map((n, idx) => ({
            ...n,
            status: idx === i ? 'active' : idx < i ? 'sorted' : 'normal',
          })),
          activePointer: {
            name: isTail ? 'curr (TAIL CANDIDATE)' : `curr (node #${i})`,
            nodeIndex: i,
          },
        },
      });

      if (!isTail) {
        // Sub-step 2: Advance curr = curr.next
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `[Step ${i + 1}B] curr.next is not null. Advancing pointer curr forward: node #${i} -> node #${i + 1}.`,
          soundCue: { type: 'compare' },
          callStack: [
            { name: 'insertAtTail(head, val)', params: { advanceTo: i + 1 }, line: 4, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { oldIndex: i, newIndex: i + 1, 'next.val': input[i + 1] },
          state: {
            nodes: baseNodes.map((n, idx) => ({
              ...n,
              status: idx === i + 1 ? 'comparing' : idx <= i ? 'sorted' : 'normal',
            })),
            activePointer: {
              name: `advancing to node #${i + 1}`,
              nodeIndex: i + 1,
            },
          },
        });
      }
    }

    // Step: Tail found!
    const tailIndex = input.length - 1;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 5,
      explanation: `Tail node identified at node #${tailIndex} (value ${input[tailIndex]}). curr.next == NULL. Loop terminates.`,
      isMilestone: true,
      milestoneTitle: 'Tail Node Confirmed',
      soundCue: { type: 'step' },
      callStack: [
        { name: 'insertAtTail(head, val)', params: { tailIndex, 'tail.val': input[tailIndex] }, line: 5, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { tailIndex, 'tail.val': input[tailIndex], 'tail.next': 'null' },
      conditionEval: { expr: 'curr.next != null', result: false },
      state: {
        nodes: baseNodes.map((n, idx) => ({
          ...n,
          status: idx === tailIndex ? 'active' : 'sorted',
        })),
        activePointer: { name: 'curr (TAIL)', nodeIndex: tailIndex },
      },
    });

    // Step: Allocate and rewire curr.next = new ListNode(insertVal)
    const newNodes = [
      ...baseNodes.map((n) => ({ ...n, status: 'sorted' as const })),
      { val: insertVal, id: 'node-new', status: 'comparing' as const },
    ];

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `Allocating new node: newNode = new ListNode(${insertVal}). Rewiring curr.next = newNode.`,
      soundCue: { type: 'swap' },
      callStack: [
        { name: 'insertAtTail(head, val)', params: { action: 'allocate & link', newNodeVal: insertVal }, line: 6, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { 'curr.next': 'newNode', 'newNode.val': insertVal, 'newNode.next': 'null' },
      state: {
        nodes: newNodes,
        activePointer: { name: 'linking curr.next', nodeIndex: tailIndex },
      },
    });

    // Final step: attach new node as official tail
    const finalNodes = [
      ...baseNodes.map((n) => ({ ...n, status: 'sorted' as const })),
      { val: insertVal, id: 'node-new', status: 'sorted' as const },
    ];

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      isMilestone: true,
      milestoneTitle: 'Node Inserted at Tail',
      soundCue: { type: 'complete' },
      explanation: `🎉 Successfully attached new ListNode(${insertVal}) to tail! New list length is ${newNodes.length}. Returning head.`,
      callStack: [
        { name: 'insertAtTail(head, val)', params: { newLength: newNodes.length, returnHead: input[0] }, line: 7, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { newLength: newNodes.length, newTailVal: insertVal, returnHead: input[0] },
      state: {
        nodes: finalNodes,
        activePointer: { name: 'NEW TAIL', nodeIndex: finalNodes.length - 1 },
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<LinkedListState>) => {
    const { nodes, activePointer } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl py-12">
          {nodes.map((node, i) => {
            const isActive = activePointer?.nodeIndex === i;
            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-stretch rounded-xl border-2 shadow-lg transition-all duration-300 ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-950/40 shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400/30'
                        : node.status === 'comparing'
                        ? 'border-amber-400 bg-amber-950/40 shadow-amber-500/20 scale-105'
                        : 'border-blue-500/40 bg-slate-900/90'
                    }`}
                  >
                    {/* Value cell */}
                    <div className="px-4 py-3 min-w-[56px] text-center font-mono font-bold text-base text-white border-r border-slate-700/60 flex items-center justify-center">
                      {node.val}
                    </div>
                    {/* Next pointer pointer-bullet */}
                    <div className="px-3 py-3 bg-slate-800/60 flex items-center justify-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isActive ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Pointer Label */}
                  {isActive && (
                    <div className="mt-2 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shadow-sm animate-bounce">
                      {activePointer.name}
                    </div>
                  )}
                </div>

                {/* Arrow to Next Node */}
                {i < nodes.length - 1 ? (
                  <div className="flex items-center text-blue-400">
                    <span className="font-mono text-lg font-bold">→</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
                      NULL
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  },
};
