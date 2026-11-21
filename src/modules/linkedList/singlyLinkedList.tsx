import React from 'react';
import { motion } from 'motion/react';
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
  relatedModules: [
    { id: 'doubly-linked-list', label: 'Doubly Linked List' },
    { id: 'circular-linked-list', label: 'Circular Linked List' },
  ],
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
    // Deterministic simulated non-contiguous heap addresses so learners see why linked lists aren't indexed contiguously
    const heapAddr = (i: number) => `0x${(0x104 + i * 0x38 + (i % 2) * 0x14).toString(16).toUpperCase()}`;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 gap-5 select-none">
        {/* Compact Memory Topology Header */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-300">
            Nodes: <strong className="text-cyan-400 tabular-nums">{nodes.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-slate-300">
            HEAD: <strong className="text-emerald-400 tabular-nums">{nodes[0] ? `${nodes[0].val} (${heapAddr(0)})` : 'NULL'}</strong>
          </span>
          {activePointer && nodes[activePointer.nodeIndex] && (
            <span
              style={{
                backgroundColor: 'var(--sem-comparing-bg)',
                borderColor: 'var(--sem-comparing-border)',
                color: 'var(--sem-comparing-text)',
              }}
              className="px-2.5 py-1 rounded-lg border font-bold tabular-nums"
            >
              {activePointer.name} → node[{activePointer.nodeIndex}] ({nodes[activePointer.nodeIndex].val})
            </span>
          )}
        </div>

        {/* Textbook Memory-Cell Diagram ([ DATA | next → ] -> ... -> NULL) */}
        <div className="flex flex-wrap items-center justify-center gap-y-10 gap-x-2 max-w-5xl py-6 px-2">
          {nodes.map((node, i) => {
            const isActive = activePointer?.nodeIndex === i;
            const isNew = node.status === 'comparing';
            const isSettled = node.status === 'sorted';
            const nextAddr = i < nodes.length - 1 ? heapAddr(i + 1) : 'NULL';

            const boxStyle: React.CSSProperties = isActive
              ? {
                  backgroundColor: 'var(--sem-comparing-bg)',
                  borderColor: 'var(--sem-comparing-border)',
                  color: 'var(--sem-comparing-text)',
                }
              : isNew
              ? {
                  backgroundColor: 'var(--sem-pivot-bg)',
                  borderColor: 'var(--sem-pivot-border)',
                  color: 'var(--sem-pivot-text)',
                }
              : isSettled
              ? {
                  backgroundColor: 'var(--sem-sorted-bg)',
                  borderColor: 'var(--sem-sorted-border)',
                  color: 'var(--sem-sorted-text)',
                }
              : {
                  backgroundColor: 'var(--sem-default-cell-bg)',
                  borderColor: 'var(--sem-default-border)',
                  color: 'var(--sem-default-text)',
                };

            return (
              <React.Fragment key={node.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: -10 }}
                  animate={{ opacity: 1, scale: isActive || isNew ? 1.05 : 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                  className="flex flex-col items-center relative"
                >
                  {/* Top Role Tag (HEAD / TAIL / NEW) */}
                  <div className="h-5 flex items-end justify-center gap-1 mb-1">
                    {i === 0 && (
                      <span
                        style={{
                          backgroundColor: 'var(--sem-active-solid)',
                          color: 'var(--sem-active-on-solid)',
                        }}
                        className="theme-solid-badge px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider leading-none"
                      >
                        HEAD
                      </span>
                    )}
                    {isNew && (
                      <span
                        style={{
                          backgroundColor: 'var(--sem-pivot-solid)',
                          color: 'var(--sem-pivot-on-solid)',
                        }}
                        className="theme-solid-badge px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider leading-none"
                      >
                        NEW
                      </span>
                    )}
                    {i === nodes.length - 1 && !isNew && (
                      <span className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-[8.5px] font-mono text-slate-400 uppercase leading-none">
                        TAIL
                      </span>
                    )}
                  </div>

                  {/* Two-Compartment Struct Box: [ val | next ] */}
                  <div
                    style={boxStyle}
                    className={`flex items-stretch rounded-xl border-2 shadow-md overflow-hidden transition-shadow ${
                      isActive ? 'ring-2 ring-[#F59E0B]/40 shadow-lg' : ''
                    }`}
                  >
                    <div className="px-3.5 py-2.5 min-w-[56px] flex flex-col items-center justify-center border-r border-current/20">
                      <span className="text-[8px] font-mono uppercase opacity-65 leading-none mb-1">val</span>
                      <span className="font-mono font-extrabold text-base tabular-nums leading-none">
                        {node.val}
                      </span>
                    </div>
                    <div className="px-2.5 py-2.5 flex flex-col items-center justify-center bg-black/5 min-w-[54px]">
                      <span className="text-[8px] font-mono uppercase opacity-65 leading-none mb-1">next</span>
                      <span className="text-[9.5px] font-mono font-bold tabular-nums leading-none opacity-90">
                        {nextAddr}
                      </span>
                    </div>
                  </div>

                  {/* Heap Address & Node Index */}
                  <span className="mt-1 text-[9.5px] font-mono text-slate-500 tabular-nums">
                    #{i} · {heapAddr(i)}
                  </span>

                  {/* Gliding Active Pointer Pill */}
                  <div className="h-6 mt-1 flex items-start justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="sll-active-ptr"
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        style={{
                          backgroundColor: 'var(--sem-comparing-solid)',
                          color: 'var(--sem-comparing-on-solid)',
                        }}
                        className="theme-solid-badge px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase tracking-wide shadow-sm whitespace-nowrap"
                      >
                        ▲ {activePointer.name}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Directional Link Arrow */}
                {i < nodes.length - 1 ? (
                  <div className="flex items-center self-center -mt-3">
                    <svg width="32" height="16" viewBox="0 0 32 16" className="overflow-visible">
                      <line
                        x1="2"
                        y1="8"
                        x2="24"
                        y2="8"
                        style={{
                          stroke:
                            isActive || nodes[i + 1]?.status === 'comparing'
                              ? 'var(--sem-comparing-solid)'
                              : isSettled
                              ? 'var(--sem-sorted-solid)'
                              : 'var(--svg-edge-default)',
                        }}
                        strokeWidth={isActive ? 2.5 : 2}
                        strokeDasharray={nodes[i + 1]?.status === 'comparing' ? '4 2' : undefined}
                      />
                      <polygon
                        points="22,3.5 30,8 22,12.5"
                        style={{
                          fill:
                            isActive || nodes[i + 1]?.status === 'comparing'
                              ? 'var(--sem-comparing-solid)'
                              : isSettled
                              ? 'var(--sem-sorted-solid)'
                              : 'var(--svg-edge-default)',
                        }}
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 self-center -mt-3 font-mono text-xs">
                    <svg width="24" height="16" viewBox="0 0 24 16">
                      <line
                        x1="2"
                        y1="8"
                        x2="17"
                        y2="8"
                        style={{ stroke: 'var(--svg-edge-default)' }}
                        strokeWidth="2"
                      />
                      <polygon
                        points="15,4 22,8 15,12"
                        style={{ fill: 'var(--svg-edge-default)' }}
                      />
                    </svg>
                    <span className="px-2 py-1 rounded-md bg-[#1E293B] border border-dashed border-[#334155] text-[10px] font-bold text-slate-400">
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
