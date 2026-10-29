import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface StackItem {
  id: string;
  val: number;
  status: 'normal' | 'top' | 'pushed' | 'popped';
}

export interface StackState {
  items: StackItem[];
  topIndex: number;
  capacity: number;
  recentAction?: 'PUSH' | 'POP' | 'PEEK';
  incomingQueue?: number[];
  poppedHistory?: number[];
}

export const stackVisualizerModule: AlgorithmModule<number[], StackState> = {
  id: 'stack-lifo',
  title: 'Stack (LIFO Dynamic Operations)',
  category: 'stack-queue',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1)',
    timeWorst: 'O(1)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Dynamic array reallocation on capacity exhaustion',
  },
  theory: {
    overview:
      'A Stack is a foundational linear data structure operating under the Last-In, First-Out (LIFO) discipline. Elements are inserted (pushed) and removed (popped) exclusively from the top of the stack.',
    whyItWorks:
      'Because all insertions and deletions occur at a single fixed end (the top pointer), stack operations execute in strictly constant O(1) time without requiring elements to shift.',
    invariant:
      'LIFO Invariant: The most recently inserted element that has not yet been removed is guaranteed to reside at the top of the stack.',
    pitfalls: [
      'Stack Underflow: attempting to pop or peek when the stack is empty.',
      'Stack Overflow: attempting to push into a fixed-capacity buffer that has reached capacity.',
    ],
  },
  presets: [
    {
      id: 'standard-push-pop',
      label: 'Function Call Simulation',
      description: 'Push 4 frames, pop 2, push 1',
      data: [101, 202, 303, 404, 505],
    },
    {
      id: 'short-sequence',
      label: 'Quick LIFO Reversal',
      description: 'Pushes and pops showing reverse order',
      data: [10, 20, 30],
    },
  ],
  defaultInput: [101, 202, 303, 404, 505],
  codeSnippets: {
    python: `class Stack:
    def __init__(self, capacity=8):
        self.items = []
        self.capacity = capacity

    def push(self, val):
        if len(self.items) >= self.capacity:
            raise OverflowError("Stack Overflow")
        self.items.append(val)

    def pop(self):
        if not self.items:
            raise IndexError("Stack Underflow")
        return self.items.pop()

    def peek(self):
        if not self.items: return None
        return self.items[-1]`,
    typescript: `class Stack<T> {
  private items: T[] = [];
  constructor(private capacity: number = 8) {}

  push(val: T): void {
    if (this.items.length >= this.capacity) throw new Error("Stack Overflow");
    this.items.push(val);
  }

  pop(): T | undefined {
    if (this.items.length === 0) throw new Error("Stack Underflow");
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}`,
    cpp: `template <typename T>
class Stack {
    vector<T> items;
    int capacity;
public:
    Stack(int cap = 8) : capacity(cap) {}
    void push(T val) {
        if (items.size() >= capacity) throw runtime_error("Stack Overflow");
        items.push_back(val);
    }
    T pop() {
        if (items.empty()) throw runtime_error("Stack Underflow");
        T val = items.back();
        items.pop_back();
        return val;
    }
    T peek() { return items.back(); }
};`,
    java: `public class Stack<T> {
    private List<T> items = new ArrayList<>();
    private int capacity;
    public Stack(int cap) { this.capacity = cap; }
    public void push(T val) {
        if (items.size() >= capacity) throw new RuntimeException("Stack Overflow");
        items.add(val);
    }
    public T pop() {
        if (items.isEmpty()) throw new RuntimeException("Stack Underflow");
        return items.remove(items.size() - 1);
    }
    public T peek() { return items.get(items.size() - 1); }
}`,
    pseudocode: `class Stack:
    items <- []
    top <- -1
    function push(val):
        top <- top + 1
        items[top] <- val
    function pop():
        val <- items[top]
        top <- top - 1
        return val`,
  },
  generateTimeline: (input: number[]) => {
    const rawItems = input && input.length > 0 ? input.slice(0, 6) : [101, 202, 303, 404, 505];
    const capacity = 8;
    const currentStack: number[] = [rawItems[0]];
    const poppedHistory: number[] = [];
    const frames: ExecutionFrame<StackState>[] = [];

    const getFrameState = (
      recentAction?: 'PUSH' | 'POP' | 'PEEK',
      highlightStatus?: 'pushed' | 'popped',
      streamStartIdx: number = 1
    ): StackState => ({
      items: currentStack.map((val, idx) => ({
        id: `stack-${idx}-${val}`,
        val,
        status:
          idx === currentStack.length - 1
            ? highlightStatus === 'pushed'
              ? 'pushed'
              : 'top'
            : 'normal',
      })),
      topIndex: currentStack.length - 1,
      capacity,
      recentAction,
      incomingQueue: rawItems.slice(streamStartIdx),
      poppedHistory: [...poppedHistory],
    });

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized Stack (capacity ${capacity}) and pushed base frame ${rawItems[0]} at index 0. ${rawItems.length - 1} more elements queued in input stream.`,
      isMilestone: true,
      milestoneTitle: `Seeded Base (${rawItems[0]})`,
      soundCue: { type: 'start' },
      variables: { top: 0, size: 1, baseVal: rawItems[0], capacity },
      callStack: [{ name: 'Stack.init', params: { capacity, seed: rawItems[0] }, line: 2, isCurrent: true }],
      conditionEval: { expr: `size < capacity (1 <= ${capacity})`, result: true },
      state: getFrameState('PUSH', 'pushed', 1),
    });

    // Push remaining values step-by-step
    for (let i = 1; i < rawItems.length; ++i) {
      const val = rawItems[i];
      currentStack.push(val);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `PUSH(${val}): Added element to top of stack. Top pointer advances to index ${currentStack.length - 1}.`,
        isMilestone: true,
        milestoneTitle: `Push ${val}`,
        soundCue: { type: 'swap' },
        variables: { pushedVal: val, top: currentStack.length - 1, size: currentStack.length },
        callStack: [{ name: 'Stack.push', params: { val }, line: 7, isCurrent: true }],
        conditionEval: { expr: `size < capacity (${currentStack.length} <= ${capacity})`, result: true },
        state: getFrameState('PUSH', 'pushed', i + 1),
      });
    }

    // PEEK operation
    if (currentStack.length > 0) {
      const topVal = currentStack[currentStack.length - 1];
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 16,
        explanation: `PEEK(): Inspecting top element without removing it. Current top at index ${currentStack.length - 1} is ${topVal}.`,
        isMilestone: true,
        milestoneTitle: `Peek (${topVal})`,
        soundCue: { type: 'compare' },
        variables: { peekVal: topVal, topIndex: currentStack.length - 1, size: currentStack.length },
        callStack: [{ name: 'Stack.peek', params: {}, line: 16, isCurrent: true }],
        conditionEval: { expr: `!isEmpty() (${currentStack.length} > 0)`, result: true },
        state: getFrameState('PEEK', undefined, rawItems.length),
      });
    }

    // POP 2 values
    for (let p = 0; p < 2 && currentStack.length > 1; ++p) {
      const poppedVal = currentStack.pop()!;
      poppedHistory.push(poppedVal);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        explanation: `POP(): Removed ${poppedVal} from top of stack (LIFO). New top is ${currentStack[currentStack.length - 1]} at index ${currentStack.length - 1}.`,
        isMilestone: true,
        milestoneTitle: `Pop ${poppedVal}`,
        soundCue: { type: 'step' },
        variables: { poppedVal, top: currentStack.length - 1, remainingSize: currentStack.length },
        callStack: [{ name: 'Stack.pop', params: {}, line: 12, isCurrent: true }],
        conditionEval: { expr: `size > 0 (${currentStack.length + 1} > 0)`, result: true },
        state: getFrameState('POP', 'popped', rawItems.length),
      });
    }

    // PUSH one more value to demonstrate LIFO re-insertion
    const extraVal = 999;
    currentStack.push(extraVal);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      explanation: `PUSH(${extraVal}): Re-pushed new value onto the vacated top slot at index ${currentStack.length - 1}.`,
      isMilestone: true,
      milestoneTitle: `Push ${extraVal}`,
      soundCue: { type: 'complete' },
      variables: { extraVal, top: currentStack.length - 1, size: currentStack.length },
      callStack: [{ name: 'Stack.push', params: { val: extraVal }, line: 7, isCurrent: true }],
      conditionEval: { expr: `size < capacity (${currentStack.length} <= ${capacity})`, result: true },
      state: getFrameState('PUSH', 'pushed', rawItems.length),
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<StackState>) => {
    const { items, topIndex, capacity, recentAction, incomingQueue = [], poppedHistory = [] } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-3">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Capacity: <span className="text-cyan-400 font-bold">{capacity}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Size: <span className="text-emerald-400 font-bold">{items.length}</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Top Index: <span className="text-amber-400 font-bold">{topIndex}</span>
          </div>
          {recentAction && (
            <div className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs font-mono text-indigo-300 font-bold">
              ACTION: {recentAction}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Incoming:</span>
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
          {poppedHistory.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/30 border border-rose-800/40 text-[11px] font-mono text-rose-300">
              <span>Popped (LIFO):</span>
              {poppedHistory.map((v, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/50 text-rose-200 font-bold">
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Vertical Stack Chamber */}
        <div className="relative flex flex-col-reverse items-center justify-start p-3.5 bg-slate-950/80 border-2 border-b-4 border-slate-700 rounded-b-2xl w-64 min-h-[250px]">
          {/* Stack Base Indicator */}
          <div className="absolute -bottom-5 text-[10px] font-mono text-slate-500 font-bold tracking-widest uppercase">
            Stack Base (Index 0)
          </div>

          {items.map((item, idx) => {
            const isTop = idx === topIndex;
            return (
              <div
                key={item.id}
                className={`w-full h-11 my-1 rounded-xl flex items-center justify-between px-4 font-mono font-bold text-sm shadow-md transition-all duration-300 border-2 ${
                  isTop
                    ? 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400/40 scale-102'
                    : 'border-blue-500/40 bg-slate-900/90 text-white'
                }`}
              >
                <span className="text-xs text-slate-400 font-normal">#{idx}</span>
                <span className="text-base text-cyan-300">{item.val}</span>
                {isTop ? (
                  <span className="text-[9px] font-bold bg-amber-900 border border-amber-600 px-1.5 py-0.5 rounded text-amber-200">
                    ← TOP
                  </span>
                ) : (
                  <span className="w-8"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
