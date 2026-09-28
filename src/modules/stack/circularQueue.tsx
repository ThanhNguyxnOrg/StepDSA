import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface CircularQueueState {
  buffer: (number | null)[];
  front: number;
  rear: number;
  count: number;
  capacity: number;
  recentAction?: 'ENQUEUE' | 'DEQUEUE';
}

export const circularQueueModule: AlgorithmModule<number[], CircularQueueState> = {
  id: 'circular-queue',
  title: 'Circular Queue (Ring Buffer Modulo)',
  category: 'stack-queue',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1)',
    timeWorst: 'O(1)',
    spaceAuxiliary: 'O(K)',
    worstCaseCondition: 'Constant time operations bounded strictly by fixed ring capacity',
  },
  theory: {
    overview:
      'A Circular Queue (Ring Buffer) connects the end of a fixed-size array back to the beginning using modulo arithmetic: index = (index + 1) % capacity. This eliminates the memory wastage of standard linear array queues.',
    whyItWorks:
      'In a linear array queue, dequeuing leaves vacated slots at the front that cannot be reused without expensive O(N) shifting. The circular queue reclaims vacated slots automatically by wrapping the rear index back to 0.',
    invariant:
      'Wrap Invariant: Valid elements always reside in the cyclic interval from front to rear. Full when count == capacity, empty when count == 0.',
    pitfalls: [
      'Disambiguating queue-full vs queue-empty when front == rear without maintaining a count variable or leaving 1 slot empty.',
      'Modulo indexing off-by-one errors.',
    ],
  },
  presets: [
    {
      id: 'wrap-around',
      label: 'Wrap-Around Demonstration',
      description: 'Fill 5 items, dequeue 3, enqueue 4 to wrap past end',
      data: [10, 20, 30, 40, 50, 60, 70, 80],
    },
    {
      id: 'fill-capacity',
      label: 'Fill Full Ring',
      description: 'Fill 6 slots until ring is full',
      data: [5, 15, 25, 35, 45, 55],
    },
  ],
  defaultInput: [10, 20, 30, 40, 50, 60, 70, 80],
  codeSnippets: {
    python: `class CircularQueue:
    def __init__(self, capacity=6):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = 0
        self.rear = -1
        self.count = 0

    def enqueue(self, val):
        if self.is_full():
            raise OverflowError("Circular Queue Full")
        self.rear = (self.rear + 1) % self.capacity
        self.queue[self.rear] = val
        self.count += 1

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Circular Queue Empty")
        val = self.queue[self.front]
        self.queue[self.front] = None
        self.front = (self.front + 1) % self.capacity
        self.count -= 1
        return val`,
    typescript: `class CircularQueue<T> {
  private queue: (T | null)[];
  private front = 0;
  private rear = -1;
  private count = 0;
  constructor(private capacity: number = 6) {
    this.queue = new Array(capacity).fill(null);
  }

  enqueue(val: T): boolean {
    if (this.count === this.capacity) return false;
    this.rear = (this.rear + 1) % this.capacity;
    this.queue[this.rear] = val;
    this.count++;
    return true;
  }

  dequeue(): T | null {
    if (this.count === 0) return null;
    const val = this.queue[this.front];
    this.queue[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    this.count--;
    return val;
  }
}`,
    cpp: `class CircularQueue {
    vector<int> q;
    int front = 0, rear = -1, count = 0, cap;
public:
    CircularQueue(int k = 6) : cap(k), q(k, -1) {}
    bool enQueue(int value) {
        if (count == cap) return false;
        rear = (rear + 1) % cap;
        q[rear] = value;
        count++;
        return true;
    }
    bool deQueue() {
        if (count == 0) return false;
        q[front] = -1;
        front = (front + 1) % cap;
        count--;
        return true;
    }
};`,
    java: `class CircularQueue {
    private int[] q;
    private int front = 0, rear = -1, count = 0, cap;
    public CircularQueue(int k) {
        this.cap = k;
        this.q = new int[k];
    }
    public boolean enQueue(int val) {
        if (count == cap) return false;
        rear = (rear + 1) % cap;
        q[rear] = val;
        count++;
        return true;
    }
    public boolean deQueue() {
        if (count == 0) return false;
        front = (front + 1) % cap;
        count--;
        return true;
    }
}`,
    pseudocode: `class CircularQueue:
    front <- 0, rear <- -1, count <- 0
    function enqueue(val):
        rear <- (rear + 1) % capacity
        queue[rear] <- val
        count <- count + 1
    function dequeue():
        val <- queue[front]
        front <- (front + 1) % capacity
        count <- count - 1
        return val`,
  },
  generateTimeline: (input: number[]) => {
    const capacity = 6;
    const buffer: (number | null)[] = new Array(capacity).fill(null);
    let front = 0;
    let rear = -1;
    let count = 0;
    const frames: ExecutionFrame<CircularQueueState>[] = [];

    const getFrameState = (recentAction?: 'ENQUEUE' | 'DEQUEUE'): CircularQueueState => ({
      buffer: [...buffer],
      front,
      rear,
      count,
      capacity,
      recentAction,
    });

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized empty Circular Queue with capacity ${capacity}. front = 0, rear = -1, count = 0.`,
      state: getFrameState(),
    });

    // Enqueue initial 4 elements
    for (let i = 0; i < 4 && i < input.length; ++i) {
      const val = input[i];
      rear = (rear + 1) % capacity;
      buffer[rear] = val;
      count++;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        explanation: `ENQUEUE(${val}): rear advanced to (${rear - 1 < 0 ? -1 : rear - 1} + 1) % ${capacity} = ${rear}. Buffer slot [${rear}] occupied.`,
        isMilestone: true,
        milestoneTitle: `Enqueue ${val} to slot ${rear}`,
        state: getFrameState('ENQUEUE'),
      });
    }

    // Dequeue 2 elements to free slots 0 and 1
    for (let d = 0; d < 2 && count > 0; ++d) {
      const removedVal = buffer[front];
      buffer[front] = null;
      const oldFront = front;
      front = (front + 1) % capacity;
      count--;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 18,
        explanation: `DEQUEUE(): Removed ${removedVal} from slot ${oldFront}. front advanced to (${oldFront} + 1) % ${capacity} = ${front}. Slot ${oldFront} is now free for wrap-around.`,
        isMilestone: true,
        milestoneTitle: `Dequeue from slot ${oldFront}`,
        state: getFrameState('DEQUEUE'),
      });
    }

    // Enqueue 3 more elements to trigger cyclic wrap-around!
    const wrapElements = [77, 88, 99];
    for (const val of wrapElements) {
      if (count < capacity) {
        const oldRear = rear;
        rear = (rear + 1) % capacity;
        buffer[rear] = val;
        count++;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          explanation: `ENQUEUE(${val}): rear wrapped around from ${oldRear} to (${oldRear} + 1) % ${capacity} = ${rear}! Reclaimed previously vacated memory slot.`,
          isMilestone: true,
          milestoneTitle: `Wrap Enqueue ${val} to slot ${rear}`,
          state: getFrameState('ENQUEUE'),
        });
      }
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<CircularQueueState>) => {
    const { buffer, front, rear, count, capacity, recentAction } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* Header HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Capacity: <span className="text-cyan-400 font-bold">{capacity}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Occupied: <span className="text-emerald-400 font-bold">{count}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Front: <span className="text-rose-400 font-bold">{front}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Rear: <span className="text-emerald-400 font-bold">{rear}</span>
          </div>
          {recentAction && (
            <div className="px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs font-mono text-indigo-300 font-bold animate-pulse">
              {recentAction}
            </div>
          )}
        </div>

        {/* Circular Ring Cells */}
        <div className="grid grid-cols-6 gap-3 max-w-2xl w-full p-6 bg-slate-950/70 border border-slate-800 rounded-3xl">
          {buffer.map((val, idx) => {
            const isFront = count > 0 && idx === front;
            const isRear = count > 0 && idx === rear;
            const isEmpty = val === null;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="text-[10px] font-mono text-slate-500 mb-1">Index {idx}</div>
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-lg border-2 shadow-lg transition-all duration-300 ${
                    isEmpty
                      ? 'border-dashed border-slate-800 bg-slate-900/30 text-slate-600'
                      : isFront
                      ? 'border-rose-400 bg-rose-950/60 text-rose-200 ring-2 ring-rose-400/40'
                      : isRear
                      ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-400/40'
                      : 'border-blue-500/40 bg-slate-900/90 text-cyan-200'
                  }`}
                >
                  {isEmpty ? '—' : val}
                </div>
                <div className="flex flex-col gap-1 mt-2 items-center min-h-[30px]">
                  {isFront && (
                    <span className="text-[9px] font-mono font-bold bg-rose-950 border border-rose-600 px-1 rounded text-rose-300">
                      FRONT
                    </span>
                  )}
                  {isRear && (
                    <span className="text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-600 px-1 rounded text-emerald-300">
                      REAR
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
