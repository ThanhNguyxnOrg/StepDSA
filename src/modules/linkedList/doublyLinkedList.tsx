import React from 'react';
import { motion } from 'motion/react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DoublyNode {
  id: string;
  val: number;
  status: 'normal' | 'active' | 'comparing' | 'modified';
}

export interface DoublyLinkedListState {
  nodes: DoublyNode[];
  activePointer?: { name: string; nodeIndex: number };
  direction?: 'forward' | 'backward';
}

export const doublyLinkedListModule: AlgorithmModule<number[], DoublyLinkedListState> = {
  id: 'doubly-linked-list',
  title: 'Doubly Linked List (Bidirectional Pointers)',
  category: 'linked-lists',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Traversing to arbitrary index in the center of list',
  },
  theory: {
    overview:
      'A Doubly Linked List extends the singly linked list by maintaining two explicit pointers per node: "next" pointing to the successor, and "prev" pointing to the predecessor. This enables two-way traversal and O(1) removal of any node given its reference.',
    whyItWorks:
      'Having symmetric references allows constant-time insertion and deletion before or after an existing node without scanning from the head.',
    invariant:
      'For every node X between head and tail: X.next.prev == X and X.prev.next == X.',
    pitfalls: [
      'Forgetting to update both pointers (next AND prev) during insertion/deletion leads to dangling links and infinite loops.',
      'Edge cases when operating on head (prev is NULL) or tail (next is NULL).',
    ],
  },
  presets: [
    { id: 'standard', label: 'Standard Sequence', description: '5 nodes bidirectional', data: [15, 30, 45, 60, 75] },
    { id: 'short', label: 'Short List', description: '3 elements', data: [10, 20, 30] },
    { id: 'alternating', label: 'Alternating Values', description: 'Sample dataset', data: [8, 42, 19, 73, 5] },
  ],
  defaultInput: [15, 30, 45, 60, 75],
  codeSnippets: {
    python: `class Node:
    def __init__(self, val, prev=None, next=None):
        self.val = val
        self.prev = prev
        self.next = next

def insert_after(node, val):
    new_node = Node(val, prev=node, next=node.next)
    if node.next:
        node.next.prev = new_node
    node.next = new_node
    return new_node`,
    typescript: `class DoublyNode {
  val: number;
  prev: DoublyNode | null = null;
  next: DoublyNode | null = null;
  constructor(val: number) { this.val = val; }
}

function insertAfter(node: DoublyNode, val: number): DoublyNode {
  const newNode = new DoublyNode(val);
  newNode.prev = node;
  newNode.next = node.next;
  if (node.next) node.next.prev = newNode;
  node.next = newNode;
  return newNode;
}`,
    cpp: `struct Node {
    int val;
    Node* prev;
    Node* next;
    Node(int v) : val(v), prev(nullptr), next(nullptr) {}
};

void insertAfter(Node* node, int val) {
    Node* newNode = new Node(val);
    newNode->prev = node;
    newNode->next = node->next;
    if (node->next) node->next->prev = newNode;
    node->next = newNode;
}`,
    java: `class Node {
    int val;
    Node prev, next;
    Node(int val) { this.val = val; }
}

void insertAfter(Node node, int val) {
    Node newNode = new Node(val);
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next != null) node.next.prev = newNode;
    node.next = newNode;
}`,
    pseudocode: `function insertAfter(node, val):
    newNode = new Node(val)
    newNode.prev = node
    newNode.next = node.next
    if node.next != null:
        node.next.prev = newNode
    node.next = newNode`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<DoublyLinkedListState>[] => {
    const frames: ExecutionFrame<DoublyLinkedListState>[] = [];
    const values = [...input];

    const makeNodes = (
      activeIdx?: number,
      comparingIdx?: number,
      modifiedIdx?: number
    ): DoublyNode[] => {
      return values.map((v, i) => ({
        id: `node-${i}-${v}`,
        val: v,
        status:
          modifiedIdx === i
            ? 'modified'
            : activeIdx === i
            ? 'active'
            : comparingIdx === i
            ? 'comparing'
            : 'normal',
      }));
    };

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Doubly Linked List with ${values.length} nodes. Each node links to both prev and next.`,
      isMilestone: true,
      milestoneTitle: 'List Initialized',
      soundCue: { type: 'start' },
      variables: { head: values[0], tail: values[values.length - 1], size: values.length },
      callStack: [{ name: 'DoublyLinkedList.init', params: { size: values.length }, line: 1, isCurrent: true }],
      conditionEval: { expr: `values.length > 0`, result: true },
      scopeVariables: { head: values[0], tail: values[values.length - 1], size: values.length },
      state: {
        nodes: makeNodes(),
        activePointer: { name: 'HEAD', nodeIndex: 0 },
        direction: 'forward',
      },
    });

    // Forward traversal demonstration
    for (let i = 0; i < values.length; i++) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Forward scan: currently visiting node [${i}] with value ${values[i]}. Reading curr.next pointer.`,
        soundCue: { type: 'step' },
        isMilestone: i === 0 || i === values.length - 1,
        milestoneTitle: i === 0 ? 'Head Visit' : i === values.length - 1 ? 'Reached Tail' : undefined,
        variables: { currIndex: i, currVal: values[i], direction: 'next' },
        callStack: [{ name: 'DoublyLinkedList.forwardTraverse', params: { i, val: values[i] }, line: 8, isCurrent: true }],
        conditionEval: { expr: `curr !== null (${i} < ${values.length})`, result: true },
        scopeVariables: { currIndex: i, currVal: values[i], direction: 'next' },
        state: {
          nodes: makeNodes(i),
          activePointer: { name: i === 0 ? 'HEAD' : i === values.length - 1 ? 'TAIL' : 'CURR', nodeIndex: i },
          direction: 'forward',
        },
      });
    }

    // Backward traversal demonstration from tail
    for (let i = values.length - 1; i >= 0; i--) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Reverse scan: moving backwards via curr.prev pointer from node [${i}] (value ${values[i]}).`,
        soundCue: { type: 'step' },
        variables: { currIndex: i, currVal: values[i], direction: 'prev' },
        callStack: [{ name: 'DoublyLinkedList.backwardTraverse', params: { i, val: values[i] }, line: 8, isCurrent: true }],
        conditionEval: { expr: `curr !== null (${i} >= 0)`, result: true },
        scopeVariables: { currIndex: i, currVal: values[i], direction: 'prev' },
        state: {
          nodes: makeNodes(i),
          activePointer: { name: 'CURR', nodeIndex: i },
          direction: 'backward',
        },
      });
    }

    // Insertion operation
    const insertVal = 99;
    const insertAfterIdx = Math.min(1, values.length - 1);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      explanation: `Inserting new node (${insertVal}) after node [${insertAfterIdx}] (value ${values[insertAfterIdx]}). Preparing pointers.`,
      isMilestone: true,
      milestoneTitle: `Insert ${insertVal}`,
      soundCue: { type: 'compare' },
      variables: { insertVal, targetIndex: insertAfterIdx },
      callStack: [{ name: 'DoublyLinkedList.insertAfter', params: { insertAfterIdx, insertVal }, line: 10, isCurrent: true }],
      conditionEval: { expr: `targetNode !== null`, result: true },
      scopeVariables: { insertVal, targetIndex: insertAfterIdx },
      state: {
        nodes: makeNodes(insertAfterIdx, undefined),
        activePointer: { name: 'TARGET', nodeIndex: insertAfterIdx },
      },
    });

    values.splice(insertAfterIdx + 1, 0, insertVal);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      explanation: `Linked new node ${insertVal}: newNode.prev = target, newNode.next = target.next, target.next.prev = newNode, target.next = newNode.`,
      isMilestone: true,
      milestoneTitle: 'Pointers Linked',
      soundCue: { type: 'swap' },
      variables: { newIndex: insertAfterIdx + 1, newVal: insertVal },
      callStack: [{ name: 'DoublyLinkedList.linkPointers', params: { index: insertAfterIdx + 1, val: insertVal }, line: 14, isCurrent: true }],
      conditionEval: { expr: `newNode.next !== null`, result: true },
      scopeVariables: { newIndex: insertAfterIdx + 1, newVal: insertVal },
      state: {
        nodes: makeNodes(undefined, undefined, insertAfterIdx + 1),
        activePointer: { name: 'NEW', nodeIndex: insertAfterIdx + 1 },
      },
    });

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: '🎉 Doubly Linked List operation complete! List invariants intact.',
      isMilestone: true,
      milestoneTitle: 'Complete',
      soundCue: { type: 'complete' },
      variables: { totalNodes: values.length },
      callStack: [{ name: 'DoublyLinkedList.done', params: { size: values.length }, line: 15, isCurrent: true }],
      conditionEval: { expr: `values.length > 0`, result: true },
      scopeVariables: { totalNodes: values.length },
      state: {
        nodes: makeNodes(),
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<DoublyLinkedListState>) => {
    const { nodes, activePointer, direction } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 gap-5 select-none">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono bg-[#111827] px-3.5 py-1.5 rounded-xl border border-[#1F293D]">
          <span className="text-slate-400">Direction:</span>
          <span className="text-cyan-400 font-bold uppercase">{direction || 'idle'}</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-bold">next → (top)</span>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-bold">← prev (bottom)</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-y-8 gap-x-1.5 max-w-5xl py-6">
          {/* NULL head boundary */}
          <div className="flex items-center gap-1.5 font-mono text-xs self-center -mt-3">
            <span className="px-2 py-1 rounded-md bg-[#1E293B] border border-dashed border-[#334155] text-[10px] font-bold text-slate-400">
              NULL
            </span>
            <svg width="22" height="16" viewBox="0 0 22 16">
              <line x1="20" y1="8" x2="6" y2="8" style={{ stroke: 'var(--sem-comparing-solid)' }} strokeWidth="1.8" />
              <polygon points="8,4 1,8 8,12" style={{ fill: 'var(--sem-comparing-solid)' }} />
            </svg>
          </div>

          {nodes.map((node, i) => {
            const isActive = activePointer?.nodeIndex === i;
            const isModified = node.status === 'modified';

            const boxStyle: React.CSSProperties = isModified
              ? {
                  backgroundColor: 'var(--sem-sorted-bg)',
                  borderColor: 'var(--sem-sorted-border)',
                  color: 'var(--sem-sorted-text)',
                }
              : isActive
              ? {
                  backgroundColor: 'var(--sem-active-bg)',
                  borderColor: 'var(--sem-active-border)',
                  color: 'var(--sem-active-text)',
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
                  initial={{ opacity: 0, scale: 0.85, y: -8 }}
                  animate={{ opacity: 1, scale: isActive || isModified ? 1.05 : 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                  className="flex flex-col items-center"
                >
                  <div className="h-4 flex items-center gap-1 mb-1">
                    {i === 0 && (
                      <span
                        style={{ backgroundColor: 'var(--sem-active-solid)', color: 'var(--sem-active-on-solid)' }}
                        className="theme-solid-badge px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase"
                      >
                        HEAD
                      </span>
                    )}
                    {i === nodes.length - 1 && (
                      <span className="px-1.5 py-0.2 rounded bg-[#1E293B] border border-[#334155] text-[8px] font-mono text-slate-400 uppercase">
                        TAIL
                      </span>
                    )}
                  </div>

                  {/* 3-Compartment Struct: [ ←P | val | N→ ] */}
                  <div
                    style={boxStyle}
                    className={`flex items-stretch rounded-xl border-2 shadow-md overflow-hidden ${
                      isActive ? 'ring-2 ring-[#06B6D4]/40' : isModified ? 'ring-2 ring-[#10B981]/40' : ''
                    }`}
                  >
                    <div className="px-2 py-2.5 bg-black/5 text-[9.5px] font-mono text-amber-400 font-bold border-r border-current/20 flex items-center">
                      ←P
                    </div>
                    <div className="px-3.5 py-2.5 min-w-[48px] text-center font-mono font-extrabold text-base tabular-nums flex items-center justify-center">
                      {node.val}
                    </div>
                    <div className="px-2 py-2.5 bg-black/5 text-[9.5px] font-mono text-emerald-400 font-bold border-l border-current/20 flex items-center">
                      N→
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-slate-500 mt-1 tabular-nums">[{i}]</span>

                  {/* Gliding Active Pointer Pill */}
                  <div className="h-6 mt-0.5 flex items-start justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="dll-active-ptr"
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        style={{
                          backgroundColor: isModified ? 'var(--sem-sorted-solid)' : 'var(--sem-active-solid)',
                          color: isModified ? 'var(--sem-sorted-on-solid)' : 'var(--sem-active-on-solid)',
                        }}
                        className="theme-solid-badge text-[9px] font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded shadow-sm whitespace-nowrap"
                      >
                        ▲ {activePointer.name}
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Dual Parallel Bidirectional Arrows (top: next →, bottom: ← prev) */}
                {i < nodes.length - 1 ? (
                  <div className="flex items-center self-center -mt-3">
                    <svg width="34" height="26" viewBox="0 0 34 26" className="overflow-visible">
                      {/* Top: next → */}
                      <line
                        x1="2"
                        y1="7"
                        x2="26"
                        y2="7"
                        style={{
                          stroke: direction === 'forward' && isActive ? 'var(--sem-sorted-solid)' : 'var(--svg-label-emerald)',
                        }}
                        strokeWidth={direction === 'forward' && isActive ? 2.4 : 1.75}
                      />
                      <polygon
                        points="24,3.5 32,7 24,10.5"
                        style={{
                          fill: direction === 'forward' && isActive ? 'var(--sem-sorted-solid)' : 'var(--svg-label-emerald)',
                        }}
                      />
                      {/* Bottom: ← prev */}
                      <line
                        x1="32"
                        y1="19"
                        x2="8"
                        y2="19"
                        style={{
                          stroke: direction === 'backward' && isActive ? 'var(--sem-comparing-solid)' : 'var(--svg-label-amber)',
                        }}
                        strokeWidth={direction === 'backward' && isActive ? 2.4 : 1.75}
                      />
                      <polygon
                        points="10,15.5 2,19 10,22.5"
                        style={{
                          fill: direction === 'backward' && isActive ? 'var(--sem-comparing-solid)' : 'var(--svg-label-amber)',
                        }}
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-mono text-xs self-center -mt-3">
                    <svg width="22" height="16" viewBox="0 0 22 16">
                      <line x1="2" y1="8" x2="16" y2="8" style={{ stroke: 'var(--svg-label-emerald)' }} strokeWidth="1.8" />
                      <polygon points="14,4 21,8 14,12" style={{ fill: 'var(--svg-label-emerald)' }} />
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
