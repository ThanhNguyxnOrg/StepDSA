import React from 'react';
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
      soundCue: 'start',
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
        soundCue: 'step',
        isMilestone: i === 0 || i === values.length - 1,
        milestoneTitle: i === 0 ? 'Head Visit' : i === values.length - 1 ? 'Reached Tail' : undefined,
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
        soundCue: 'step',
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
      soundCue: 'compare',
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
      soundCue: 'success',
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
      soundCue: 'complete',
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
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          <span>Mode:</span>
          <span className="text-cyan-400 font-bold uppercase">{direction || 'idle'} traversal</span>
          <span>•</span>
          <span className="text-amber-400 font-bold">Prev (←) & Next (→)</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl py-8">
          {/* NULL indicator at head */}
          <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
            <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400">
              NULL
            </span>
            <span className="text-slate-600 font-bold">⇄</span>
          </div>

          {nodes.map((node, i) => {
            const isActive = activePointer?.nodeIndex === i;
            return (
              <React.Fragment key={node.id}>
                {/* Doubly Linked Node Box */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center rounded-xl border-2 shadow-lg transition-all duration-300 overflow-hidden ${
                      node.status === 'modified'
                        ? 'border-emerald-400 bg-emerald-950/50 shadow-emerald-500/20 scale-105 ring-2 ring-emerald-400/40'
                        : isActive
                        ? 'border-cyan-400 bg-cyan-950/50 shadow-cyan-500/20 scale-105 ring-2 ring-cyan-400/40'
                        : 'border-slate-700 bg-slate-900/90'
                    }`}
                  >
                    {/* Prev link pin */}
                    <div className="px-2 py-3 bg-slate-800/80 text-[10px] font-mono text-cyan-400 font-bold border-r border-slate-700/60">
                      ←P
                    </div>

                    {/* Value cell */}
                    <div className="px-4 py-3 min-w-[50px] text-center font-mono font-bold text-base text-white flex items-center justify-center">
                      {node.val}
                    </div>

                    {/* Next link pin */}
                    <div className="px-2 py-3 bg-slate-800/80 text-[10px] font-mono text-indigo-400 font-bold border-l border-slate-700/60">
                      N→
                    </div>
                  </div>

                  {/* Active pointer badge */}
                  {isActive && (
                    <div className="mt-2 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40 shadow-sm animate-bounce">
                      {activePointer.name}
                    </div>
                  )}
                </div>

                {/* Bidirectional connector */}
                {i < nodes.length - 1 ? (
                  <div className="flex items-center text-cyan-400 font-mono text-base font-bold px-1">
                    ⇄
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                    <span className="text-slate-600 font-bold">⇄</span>
                    <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-slate-400">
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
