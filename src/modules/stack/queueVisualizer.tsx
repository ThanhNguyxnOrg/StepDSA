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
      <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Capacity: <span className="text-cyan-400 font-bold">{capacity}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Size: <span className="text-emerald-400 font-bold">{items.length}</span>
          </div>
          {recentAction && (
            <div className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs font-mono text-indigo-300 font-bold">
              ACTION: {recentAction}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Arriving Stream:</span>
            {incomingQueue.length === 0 ? (
              <span className="text-slate-600">exhausted</span>
            ) : (
              incomingQueue.map((v, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                  {v}
                </span>
              ))
            )}
          </div>
          {servedHistory.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/30 border border-rose-800/40 text-[11px] font-mono text-rose-300">
              <span>Served (FIFO):</span>
              {servedHistory.map((v, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/50 text-rose-200 font-bold">
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tube / Pipe Pipeline Container */}
        <div className="relative flex items-center justify-center py-6 px-6 bg-slate-950/60 border-y-2 border-slate-800 rounded-3xl max-w-4xl w-full">
          {/* Outflow Label (Front) */}
          <div className="absolute left-3 flex flex-col items-center text-rose-400 font-mono text-xs font-bold">
            <span>← EXIT</span>
            <span className="text-[10px] text-slate-500 font-normal">DEQUEUE</span>
          </div>

          {/* Queue Slot Cells */}
          <div className="flex items-center gap-3 overflow-x-auto px-16 py-2">
            {items.map((item, idx) => {
              const isFront = idx === frontIndex;
              const isRear = idx === rearIndex;

              return (
                <div key={item.id} className="flex flex-col items-center">
                  {/* Item Box */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-lg shadow-xl border-2 transition-all duration-300 ${
                      isFront
                        ? 'border-rose-400 bg-rose-950/60 text-rose-200 ring-2 ring-rose-400/40 scale-105'
                        : isRear
                        ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-400/40 scale-105'
                        : 'border-blue-500/40 bg-slate-900/90 text-white'
                    }`}
                  >
                    {item.val}
                  </div>

                  {/* Pointer Badges */}
                  <div className="flex flex-col gap-1 mt-2 items-center">
                    {isFront && (
                      <span className="text-[9px] font-mono font-bold bg-rose-950 border border-rose-600/60 text-rose-300 px-1.5 py-0.5 rounded">
                        FRONT
                      </span>
                    )}
                    {isRear && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-600/60 text-emerald-300 px-1.5 py-0.5 rounded">
                        REAR
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inflow Label (Rear) */}
          <div className="absolute right-3 flex flex-col items-center text-emerald-400 font-mono text-xs font-bold">
            <span>ENTRY ←</span>
            <span className="text-[10px] text-slate-500 font-normal">ENQUEUE</span>
          </div>
        </div>
      </div>
    );
  },
};
