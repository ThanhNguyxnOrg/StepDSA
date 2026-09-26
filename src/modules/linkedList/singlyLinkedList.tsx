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

    // Step 0: Initial state
    frames.push({
      stepIndex: 0,
      totalSteps: input.length + 2,
      codeLine: 7,
      explanation: `Step 0: Head initialized pointing to node with value ${baseNodes[0]?.val || 0}.`,
      state: {
        nodes: baseNodes.map((n, idx) => ({
          ...n,
          status: idx === 0 ? 'active' : 'normal',
        })),
        activePointer: { name: 'curr (HEAD)', nodeIndex: 0 },
      },
    });

    // Step 1 to N-1: Traversal
    for (let i = 0; i < input.length; i++) {
      frames.push({
        stepIndex: i + 1,
        totalSteps: input.length + 2,
        codeLine: 8,
        explanation:
          i < input.length - 1
            ? `Step ${i + 1}: curr node has value ${input[i]}. Next pointer is not NULL, moving curr forward.`
            : `Step ${i + 1}: curr reached tail node with value ${input[i]}. Next pointer is NULL!`,
        state: {
          nodes: baseNodes.map((n, idx) => ({
            ...n,
            status: idx === i ? 'active' : idx < i ? 'sorted' : 'normal',
          })),
          activePointer: {
            name: i === input.length - 1 ? 'curr (TAIL)' : 'curr',
            nodeIndex: i,
          },
        },
      });
    }

    // Final step: attach new node
    const newNodes = [
      ...baseNodes.map((n) => ({ ...n, status: 'sorted' as const })),
      { val: 99, id: 'node-new', status: 'comparing' as const },
    ];

    frames.push({
      stepIndex: input.length + 1,
      totalSteps: input.length + 2,
      codeLine: 10,
      isMilestone: true,
      milestoneTitle: 'Node Inserted at Tail',
      explanation: `Step ${input.length + 1}: Successfully attached new ListNode(99) to curr.next. Traversal complete!`,
      state: {
        nodes: newNodes,
        activePointer: { name: 'NEW TAIL', nodeIndex: newNodes.length - 1 },
      },
    });

    return frames;
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
