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
      isMilestone: true,
      milestoneTitle: 'Circular Queue Initialized',
      soundCue: { type: 'start' },
      variables: { front: 0, rear: -1, count: 0, capacity },
      callStack: [{ name: 'CircularQueue.init', params: { capacity }, line: 2, isCurrent: true }],
      conditionEval: { expr: `count == 0`, result: true },
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
        soundCue: { type: 'swap' },
        variables: { enqueued: val, front, rear, count, capacity },
        callStack: [{ name: 'CircularQueue.enqueue', params: { val, rear }, line: 11, isCurrent: true }],
        conditionEval: { expr: `count <= capacity (${count} <= ${capacity})`, result: true },
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
        soundCue: { type: 'step' },
        variables: { dequeued: removedVal, oldFront, newFront: front, count },
        callStack: [{ name: 'CircularQueue.dequeue', params: { fromSlot: oldFront }, line: 18, isCurrent: true }],
        conditionEval: { expr: `count >= 0 (${count} >= 0)`, result: true },
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
          soundCue: { type: 'complete' },
          variables: { wrapVal: val, oldRear, newRear: rear, count, capacity, isWrap: rear < oldRear },
          callStack: [{ name: 'CircularQueue.enqueueWrap', params: { val, slot: rear }, line: 11, isCurrent: true }],
          conditionEval: { expr: `rear < oldRear (${rear} < ${oldRear})`, result: rear < oldRear },
          state: getFrameState('ENQUEUE'),
        });
      }
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<CircularQueueState>) => {
    const { buffer, front, rear, count, capacity, recentAction } = frame.state;
    const cx = 175;
    const cy = 148;
    const radius = 98;
    const slotR = 25;

    const slotCoord = (idx: number) => {
      const angle = (idx / Math.max(1, capacity)) * Math.PI * 2 - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        labelX: cx + (radius + 36) * Math.cos(angle),
        labelY: cy + (radius + 36) * Math.sin(angle),
      };
    };

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 gap-4 select-none">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Capacity: <span className="text-cyan-400 font-bold tabular-nums">{capacity}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Occupied: <span className="text-emerald-400 font-bold tabular-nums">{count}/{capacity}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Front: <span className="text-rose-400 font-bold tabular-nums">{front}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F293D] text-xs font-mono text-slate-300">
            Rear: <span className="text-emerald-400 font-bold tabular-nums">{rear}</span>
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

        {/* True 360° Circular Ring Buffer SVG */}
        <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#1F293D] p-3 flex flex-col items-center shadow-sm">
          <svg viewBox="0 0 350 296" className="w-full max-w-[360px] h-auto overflow-visible">
            <defs>
              <marker id="cq-cw-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'var(--svg-edge-default)' }} />
              </marker>
            </defs>

            {/* Ring guide track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              style={{ stroke: 'var(--svg-edge-default)' }}
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.55"
            />

            {/* Clockwise directional ticks between adjacent slots */}
            {buffer.map((_, idx) => {
              const nextIdx = (idx + 1) % capacity;
              const a = slotCoord(idx);
              const b = slotCoord(nextIdx);
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy) || 1;
              const ux = dx / dist;
              const uy = dy / dist;
              return (
                <line
                  key={`ring-edge-${idx}`}
                  x1={a.x + ux * (slotR + 4)}
                  y1={a.y + uy * (slotR + 4)}
                  x2={b.x - ux * (slotR + 7)}
                  y2={b.y - uy * (slotR + 7)}
                  style={{ stroke: 'var(--svg-edge-default)' }}
                  strokeWidth="1.75"
                  markerEnd="url(#cq-cw-arrow)"
                  opacity="0.7"
                />
              );
            })}

            {/* Center Modulo Formula Callout */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              style={{ fill: 'var(--theme-text-muted)' }}
              fontSize="9"
              fontFamily="monospace"
            >
              RING BUFFER
            </text>
            <text
              x={cx}
              y={cy + 8}
              textAnchor="middle"
              style={{ fill: 'var(--svg-label-cyan)' }}
              fontSize="10.5"
              fontWeight="bold"
              fontFamily="monospace"
            >
              (i + 1) % {capacity}
            </text>
            <text
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              style={{ fill: 'var(--theme-text-subtle)' }}
              fontSize="8.5"
              fontFamily="monospace"
            >
              ↻ clockwise wrap
            </text>

            {/* Circular Buffer Slots */}
            {buffer.map((val, idx) => {
              const pos = slotCoord(idx);
              const isFront = count > 0 && idx === front;
              const isRear = count > 0 && idx === rear;
              const isEmpty = val === null;

              const fill = isEmpty
                ? 'var(--theme-canvas)'
                : isFront && isRear
                ? 'var(--sem-pivot-bg)'
                : isFront
                ? 'var(--sem-swapping-bg)'
                : isRear
                ? 'var(--sem-sorted-bg)'
                : 'var(--sem-active-bg)';
              const stroke = isEmpty
                ? 'var(--svg-node-border)'
                : isFront && isRear
                ? 'var(--sem-pivot-border)'
                : isFront
                ? 'var(--sem-swapping-border)'
                : isRear
                ? 'var(--sem-sorted-border)'
                : 'var(--sem-active-border)';
              const textFill = isEmpty
                ? 'var(--theme-text-subtle)'
                : isFront && isRear
                ? 'var(--sem-pivot-text)'
                : isFront
                ? 'var(--sem-swapping-text)'
                : isRear
                ? 'var(--sem-sorted-text)'
                : 'var(--sem-active-text)';

              return (
                <g key={idx}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={slotR}
                    style={{ fill, stroke }}
                    strokeWidth={isFront || isRear ? 3 : 2}
                    strokeDasharray={isEmpty ? '4 3' : undefined}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    textAnchor="middle"
                    style={{ fill: textFill }}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {isEmpty ? '—' : val}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 15}
                    textAnchor="middle"
                    style={{ fill: 'var(--theme-text-muted)' }}
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    [{idx}]
                  </text>

                  {/* Outer FRONT / REAR Pointer Tag */}
                  {(isFront || isRear) && (
                    <g>
                      <rect
                        x={pos.labelX - 24}
                        y={pos.labelY - 8}
                        width={48}
                        height={16}
                        rx={4}
                        style={{
                          fill:
                            isFront && isRear
                              ? 'var(--sem-pivot-solid)'
                              : isFront
                              ? 'var(--sem-swapping-solid)'
                              : 'var(--sem-sorted-solid)',
                        }}
                      />
                      <text
                        x={pos.labelX}
                        y={pos.labelY + 3}
                        textAnchor="middle"
                        className="svg-on-solid"
                        style={{
                          fill:
                            isFront && isRear
                              ? 'var(--sem-pivot-on-solid)'
                              : isFront
                              ? 'var(--sem-swapping-on-solid)'
                              : 'var(--sem-sorted-on-solid)',
                        }}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {isFront && isRear ? 'F & R' : isFront ? 'FRONT' : 'REAR'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
