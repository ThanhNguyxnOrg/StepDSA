import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface QueueItem {
  id: string;
  val: number;
  status: 'enqueued' | 'dequeued' | 'front' | 'rear' | 'normal';
}

export interface QueueState {
  items: QueueItem[];
  frontIndex: number;
  rearIndex: number;
  capacity: number;
  recentAction?: 'ENQUEUE' | 'DEQUEUE' | 'PEEK';
  incomingQueue?: number[];
  servedHistory?: number[];
}

export const queueVisualizerModule: AlgorithmModule<number[], QueueState> = {
  id: 'queue-fifo',
  title: 'Queue (FIFO Operations)',
  category: 'stack-queue',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'stack-lifo', label: 'Stack (LIFO)' },
    { id: 'circular-queue', label: 'Circular Queue' },
    { id: 'deque-visualizer', label: 'Deque' },
  ],
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1)',
    timeWorst: 'O(1)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Circular buffer resizing if dynamic expansion is needed',
  },
  theory: {
    overview:
      'A Queue is a linear data structure adhering strictly to the First-In, First-Out (FIFO) principle. New elements arrive at the rear (enqueue), and existing elements leave from the front (dequeue).',
    whyItWorks:
      'By maintaining two independent indices or pointers (front and rear), both enqueue and dequeue execute in constant O(1) time without shifting intermediate elements.',
    invariant:
      'Elements are processed in the strict sequential order of their arrival: the element that has resided longest in the queue is always at the front.',
    pitfalls: [
      'Queue Underflow: attempting to dequeue from an empty queue.',
      'False Overflow in non-circular array implementations when rear reaches capacity while front has advanced.',
    ],
  },
  presets: [
    { id: 'standard', label: 'Order Processing', description: '5 arriving items', data: [10, 25, 40, 55, 70] },
    { id: 'burst', label: 'Traffic Burst', description: 'Batch arrivals', data: [3, 14, 15, 92, 65, 35] },
  ],
  defaultInput: [10, 25, 40, 55, 70],
  codeSnippets: {
    python: `class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if not self.is_empty():
            return self.items.pop(0)
        raise IndexError("Queue is empty")

    def peek(self):
        return self.items[0] if not self.is_empty() else None

    def is_empty(self):
        return len(self.items) == 0`,
    typescript: `class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) throw new Error("Underflow");
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}`,
    cpp: `template <typename T>
class Queue {
    vector<T> data;
    int head = 0;
public:
    void enqueue(T val) { data.push_back(val); }
    T dequeue() {
        if (head >= data.size()) throw runtime_error("Empty");
        return data[head++];
    }
    T peek() const { return data[head]; }
    bool isEmpty() const { return head >= data.size(); }
};`,
    java: `public class Queue<T> {
    private LinkedList<T> list = new LinkedList<>();

    public void enqueue(T item) { list.addLast(item); }
    public T dequeue() {
        if (list.isEmpty()) throw new NoSuchElementException();
        return list.removeFirst();
    }
    public T peek() { return list.peekFirst(); }
    public boolean isEmpty() { return list.isEmpty(); }
}`,
    pseudocode: `class Queue:
    procedure enqueue(x):
        rear = rear + 1
        buffer[rear] = x
    function dequeue():
        if front > rear: error Underflow
        val = buffer[front]
        front = front + 1
        return val`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<QueueState>[] => {
    const rawItems = input && input.length > 0 ? input : [10, 25, 40, 55, 70];
    const frames: ExecutionFrame<QueueState>[] = [];
    const queue: number[] = [rawItems[0]];
    const servedHistory: number[] = [];
    const capacity = 8;

    // Initial seeded state with first element so Step 1 is immediately visual
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized Queue (capacity ${capacity}) with initial arrival ${rawItems[0]} at Front [0] & Rear [0]. ${rawItems.length - 1} items queued in arriving stream.`,
      isMilestone: true,
      milestoneTitle: `Seeded Front (${rawItems[0]})`,
      soundCue: { type: 'start' },
      variables: { front: 0, rear: 0, size: 1, seed: rawItems[0], capacity },
      callStack: [{ name: 'Queue.init', params: { capacity, seed: rawItems[0] }, line: 1, isCurrent: true }],
      conditionEval: { expr: `size < capacity (1 < ${capacity})`, result: true },
      scopeVariables: { front: 0, rear: 0, size: 1, capacity },
      state: {
        items: [{ id: `item-0-${rawItems[0]}`, val: rawItems[0], status: 'front' }],
        frontIndex: 0,
        rearIndex: 0,
        capacity,
        recentAction: 'ENQUEUE',
        incomingQueue: rawItems.slice(1),
        servedHistory: [],
      },
    });

    // Enqueue remaining elements step-by-step
    for (let i = 1; i < rawItems.length; i++) {
      const val = rawItems[i];
      queue.push(val);
      const rear = queue.length - 1;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `ENQUEUE(${val}): Element enters at rear index [${rear}]. Current queue size = ${queue.length}.`,
        isMilestone: true,
        milestoneTitle: `Enqueue ${val}`,
        soundCue: { type: 'swap' },
        variables: { enqueued: val, front: 0, rear, size: queue.length },
        callStack: [{ name: 'Queue.enqueue', params: { val, rear }, line: 5, isCurrent: true }],
        conditionEval: { expr: `size < capacity (${queue.length} < ${capacity})`, result: true },
        scopeVariables: { enqueued: val, front: 0, rear, size: queue.length },
        state: {
          items: queue.map((v, idx) => ({
            id: `item-${idx}-${v}`,
            val: v,
            status: idx === rear ? 'enqueued' : idx === 0 ? 'front' : 'normal',
          })),
          frontIndex: 0,
          rearIndex: rear,
          capacity,
          recentAction: 'ENQUEUE',
          incomingQueue: rawItems.slice(i + 1),
          servedHistory: [...servedHistory],
        },
      });
    }

    // Peek operation
    if (queue.length > 0) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `PEEK(): Inspecting oldest element at FRONT [0] without removal. Value = ${queue[0]}.`,
        soundCue: { type: 'compare' },
        variables: { frontVal: queue[0], size: queue.length },
        callStack: [{ name: 'Queue.peek', params: {}, line: 12, isCurrent: true }],
        conditionEval: { expr: `!isEmpty() (${queue.length} > 0)`, result: true },
        scopeVariables: { frontVal: queue[0], size: queue.length },
        state: {
          items: queue.map((v, idx) => ({
            id: `item-${idx}-${v}`,
            val: v,
            status: idx === 0 ? 'front' : 'normal',
          })),
          frontIndex: 0,
          rearIndex: queue.length - 1,
          capacity,
          recentAction: 'PEEK',
          incomingQueue: [],
          servedHistory: [...servedHistory],
        },
      });
    }

    // Dequeue 2 items (keeping at least 1 item in queue)
    const dequeueCount = Math.min(2, Math.max(0, queue.length - 1));
    for (let i = 0; i < dequeueCount; i++) {
      const dequeuedVal = queue.shift()!;
      servedHistory.push(dequeuedVal);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `DEQUEUE(): Removed oldest element (${dequeuedVal}) from FRONT (FIFO). ${queue[0]} advances to FRONT.`,
        isMilestone: true,
        milestoneTitle: `Dequeue ${dequeuedVal}`,
        soundCue: { type: 'step' },
        variables: { dequeued: dequeuedVal, newFront: queue[0], remainingSize: queue.length },
        callStack: [{ name: 'Queue.dequeue', params: {}, line: 8, isCurrent: true }],
        conditionEval: { expr: `size > 0 (${queue.length + 1} > 0)`, result: true },
        scopeVariables: { dequeued: dequeuedVal, remainingSize: queue.length },
        state: {
          items: queue.map((v, idx) => ({
            id: `item-${idx}-${v}`,
            val: v,
            status: idx === 0 ? 'front' : 'normal',
          })),
          frontIndex: 0,
          rearIndex: queue.length - 1,
          capacity,
          recentAction: 'DEQUEUE',
          incomingQueue: [],
          servedHistory: [...servedHistory],
        },
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `🎉 Queue lifecycle operations complete. FIFO ordering preserved across all ${rawItems.length} arrivals.`,
      isMilestone: true,
      milestoneTitle: 'Queue Ready',
      soundCue: { type: 'complete' },
      variables: { finalSize: queue.length, capacity },
      callStack: [{ name: 'Queue.summary', params: { size: queue.length }, line: 15, isCurrent: true }],
      conditionEval: { expr: `queue.length >= 0`, result: true },
      scopeVariables: { finalSize: queue.length },
      state: {
        items: queue.map((v, idx) => ({
          id: `item-${idx}-${v}`,
          val: v,
          status: idx === 0 ? 'front' : 'normal',
        })),
        frontIndex: 0,
        rearIndex: queue.length - 1,
        capacity,
        incomingQueue: [],
        servedHistory: [...servedHistory],
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<QueueState>) => {
    const { items, frontIndex, rearIndex, capacity, recentAction, incomingQueue = [], servedHistory = [] } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-5 select-none">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Capacity: <span className="text-cyan-400 font-bold tabular-nums">{capacity}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Size: <span className="text-emerald-400 font-bold tabular-nums">{items.length}/{capacity}</span>
          </div>
          {recentAction && (
            <div
              style={{
                backgroundColor:
                  recentAction === 'DEQUEUE' ? 'var(--sem-swapping-bg)' : 'var(--sem-active-bg)',
                borderColor:
                  recentAction === 'DEQUEUE' ? 'var(--sem-swapping-border)' : 'var(--sem-active-border)',
                color:
                  recentAction === 'DEQUEUE' ? 'var(--sem-swapping-text)' : 'var(--sem-active-text)',
              }}
              className="px-2.5 py-1 rounded-lg border text-xs font-mono font-bold"
            >
              OP: {recentAction}
            </div>
          )}
        </div>

        {/* Open-Ended FIFO Pipeline Container */}
        <div className="relative flex items-center justify-between py-6 px-4 sm:px-6 bg-[#111827] border-y-2 border-x-0 border-[#334155] rounded-2xl max-w-4xl w-full shadow-inner gap-3">
          {/* Outflow Label (Front / Dequeue) */}
          <div className="flex flex-col items-center text-rose-400 font-mono text-xs font-bold shrink-0">
            <span>← EXIT</span>
            <span className="text-[9.5px] text-slate-500 font-normal">DEQUEUE (FRONT)</span>
          </div>

          {/* Animated Queue Items */}
          <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 px-2 flex-1 min-h-[96px]">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <span className="text-xs font-mono text-slate-500 italic">Queue is empty</span>
              ) : (
                items.map((item, idx) => {
                  const isFront = idx === frontIndex;
                  const isRear = idx === rearIndex;

                  const boxStyle: React.CSSProperties = isFront
                    ? {
                        backgroundColor: 'var(--sem-swapping-bg)',
                        borderColor: 'var(--sem-swapping-border)',
                        color: 'var(--sem-swapping-text)',
                      }
                    : isRear
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
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 24, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: isFront || isRear ? 1.05 : 1 }}
                      exit={{ opacity: 0, x: -24, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      className="flex flex-col items-center shrink-0"
                    >
                      <div
                        style={boxStyle}
                        className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono font-bold shadow-sm border-2 ${
                          isFront ? 'ring-2 ring-[#F43F5E]/40' : isRear ? 'ring-2 ring-[#10B981]/40' : ''
                        }`}
                      >
                        <span className="text-base font-extrabold tabular-nums leading-none">{item.val}</span>
                        <span className="text-[9px] opacity-65 mt-0.5 tabular-nums">[{idx}]</span>
                      </div>

                      <div className="flex gap-1 mt-1.5 min-h-[18px] items-center">
                        {isFront && (
                          <span
                            style={{
                              backgroundColor: 'var(--sem-swapping-solid)',
                              color: 'var(--sem-swapping-on-solid)',
                            }}
                            className="theme-solid-badge text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                          >
                            FRONT
                          </span>
                        )}
                        {isRear && (
                          <span
                            style={{
                              backgroundColor: 'var(--sem-sorted-solid)',
                              color: 'var(--sem-sorted-on-solid)',
                            }}
                            className="theme-solid-badge text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                          >
                            REAR
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Inflow Label (Rear / Enqueue) */}
          <div className="flex flex-col items-center text-emerald-400 font-mono text-xs font-bold shrink-0">
            <span>ENTRY ←</span>
            <span className="text-[9.5px] text-slate-500 font-normal">ENQUEUE (REAR)</span>
          </div>
        </div>

        {/* Served (FIFO Output) vs Arriving Stream */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-4xl">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F293D] text-[11px] font-mono">
            <span className="text-rose-400 font-bold">Served (FIFO):</span>
            {servedHistory.length === 0 ? (
              <span className="text-slate-500 italic">none yet</span>
            ) : (
              servedHistory.map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  style={{
                    backgroundColor: 'var(--sem-swapping-bg)',
                    borderColor: 'var(--sem-swapping-border)',
                    color: 'var(--sem-swapping-text)',
                  }}
                  className="px-1.5 py-0.5 rounded border font-bold tabular-nums"
                >
                  {v}
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F293D] text-[11px] font-mono">
            <span className="text-cyan-400 font-bold">Arriving Stream:</span>
            {incomingQueue.length === 0 ? (
              <span className="text-slate-500 italic">exhausted</span>
            ) : (
              incomingQueue.map((v, i) => (
                <span key={`${v}-${i}`} className="px-1.5 py-0.5 rounded bg-[#1E293B] border border-[#334155] text-slate-300 font-bold tabular-nums">
                  {v}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
};
