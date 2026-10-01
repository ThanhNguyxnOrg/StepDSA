import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface DynamicArrayState {
  elements: (number | null)[];
  size: number;
  capacity: number;
  activeOp: 'push' | 'pop' | 'reallocate' | 'idle';
  highlightIndex: number | null;
  oldElements?: (number | null)[];
  isResizing: boolean;
  message: string;
}

export const dynamicArrayModule: AlgorithmModule<
  { initialCapacity: number; operations: { op: 'push' | 'pop'; value?: number }[] },
  DynamicArrayState
> = {
  id: 'dynamic-array',
  title: 'Static Array & Dynamic Array (Contiguous Memory Allocation & Amortized Doubling)',
  category: 'arrays-pointers',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1) amortized append',
    timeAverage: 'O(1) amortized append',
    timeWorst: 'O(N) geometric resize copy',
    spaceAuxiliary: 'O(N) contiguous memory buffer',
    worstCaseCondition: 'Appends triggering buffer doubling requiring full array element copying',
  },
  theory: {
    overview:
      'A Dynamic Array (std::vector in C++, ArrayList in Java, list in Python) builds on a fixed static array by automatically reallocating a new contiguous buffer of doubled capacity (2x) when full.',
    whyItWorks:
      'Although doubling requires O(N) copy steps, inserting N elements triggers resizes at 1, 2, 4, 8, ... N. The total copies sum to 1 + 2 + 4 + ... + N = 2N - 1 < 2N. Averaging 2N work over N operations yields O(1) amortized time per insertion.',
    invariant:
      'Contiguous Buffer Invariant: Elements [0 ... size-1] reside contiguously in allocated memory with capacity >= size. Memory indices [size ... capacity-1] are uninitialized spare capacity.',
    pitfalls: [
      'Resizing by a fixed constant additive step (e.g. +10) degrades amortized append time from O(1) to O(N).',
      'Pointer invalidation: reallocating the backing array renders existing raw pointers/iterators dangling.',
    ],
  },
  defaultInput: {
    initialCapacity: 4,
    operations: [
      { op: 'push', value: 10 },
      { op: 'push', value: 20 },
      { op: 'push', value: 30 },
      { op: 'push', value: 40 },
      { op: 'push', value: 50 },
      { op: 'push', value: 60 },
      { op: 'pop' },
    ],
  },
  presets: [
    {
      id: 'geometric-doubling',
      label: 'Geometric Doubling (4 -> 8 -> 16)',
      description: 'Capacity starts at 2 and doubles repeatedly as elements are added',
      data: {
        initialCapacity: 2,
        operations: [
          { op: 'push', value: 5 },
          { op: 'push', value: 12 },
          { op: 'push', value: 28 },
          { op: 'push', value: 37 },
          { op: 'push', value: 42 },
        ],
      },
    },
    {
      id: 'mixed-push-pop',
      label: 'Mixed Push & Pop',
      description: 'Sequence of interleaved push and pop operations',
      data: {
        initialCapacity: 4,
        operations: [
          { op: 'push', value: 100 },
          { op: 'push', value: 200 },
          { op: 'pop' },
          { op: 'push', value: 300 },
          { op: 'push', value: 400 },
          { op: 'push', value: 500 },
          { op: 'push', value: 600 },
        ],
      },
    },
  ],
  codeSnippets: {
    cpp: `template <typename T>
class DynamicArray {
    T* data;
    int size = 0, capacity;
public:
    DynamicArray(int cap = 2) : capacity(cap), data(new T[cap]) {}
    void push_back(T val) {
        if (size == capacity) {
            capacity *= 2;
            T* next = new T[capacity];
            for (int i = 0; i < size; ++i) next[i] = data[i];
            delete[] data;
            data = next;
        }
        data[size++] = val;
    }
    T pop_back() {
        if (size > 0) return data[--size];
        throw std::out_of_range("Empty");
    }
};`,
    python: `class DynamicArray:
    def __init__(self, capacity=2):
        self.capacity = capacity
        self.size = 0
        self.data = [None] * capacity

    def push(self, val):
        if self.size == self.capacity:
            self._resize(self.capacity * 2)
        self.data[self.size] = val
        self.size += 1

    def _resize(self, new_cap):
        new_data = [None] * new_cap
        for i in range(self.size):
            new_data[i] = self.data[i]
        self.data = new_data
        self.capacity = new_cap`,
    typescript: `class DynamicArray<T> {
  private data: (T | null)[];
  public size = 0;
  public capacity: number;

  constructor(initialCap = 2) {
    this.capacity = initialCap;
    this.data = new Array(initialCap).fill(null);
  }

  push(val: T): void {
    if (this.size === this.capacity) {
      this.resize(this.capacity * 2);
    }
    this.data[this.size++] = val;
  }

  private resize(newCap: number): void {
    const next = new Array(newCap).fill(null);
    for (let i = 0; i < this.size; i++) next[i] = this.data[i];
    this.data = next;
    this.capacity = newCap;
  }
}`,
    java: `public class DynamicArray<T> {
    private Object[] data;
    private int size = 0;
    private int capacity;

    public DynamicArray(int initialCap) {
        this.capacity = initialCap;
        this.data = new Object[initialCap];
    }

    public void push(T val) {
        if (size == capacity) {
            resize(capacity * 2);
        }
        data[size++] = val;
    }

    private void resize(int newCap) {
        Object[] next = new Object[newCap];
        System.arraycopy(data, 0, next, 0, size);
        data = next;
        capacity = newCap;
    }
}`,
    pseudocode: `function push(val):
    if size == capacity:
        newCapacity = capacity * 2
        newBuffer = allocate(newCapacity)
        for i from 0 to size - 1:
            newBuffer[i] = buffer[i]
        free(buffer)
        buffer = newBuffer
        capacity = newCapacity
    buffer[size] = val
    size = size + 1`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<DynamicArrayState>[] = [];
    let capacity = input.initialCapacity || 4;
    let size = 0;
    let elements: (number | null)[] = new Array(capacity).fill(null);

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: DynamicArrayState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    addFrame(
      1,
      `Initialized Dynamic Array with capacity = ${capacity}, size = 0.`,
      {
        elements: [...elements],
        size,
        capacity,
        activeOp: 'idle',
        highlightIndex: null,
        isResizing: false,
        message: `Allocated contiguous buffer of ${capacity} slots.`,
      },
      {
        action: 'INIT',
        variables: { size, capacity, isResizing: false },
        callStack: [{ name: 'init', params: { capacity, size } }],
      }
    );

    for (let opIdx = 0; opIdx < input.operations.length; opIdx++) {
      const op = input.operations[opIdx];
      if (op.op === 'push') {
        const val = op.value ?? 0;
        if (size === capacity) {
          const oldCap = capacity;
          const newCap = capacity * 2;
          const oldElements = [...elements];

          addFrame(
            4,
            `Buffer Full! size (${size}) == capacity (${oldCap}). Initiating reallocation: Doubling capacity to ${newCap}.`,
            {
              elements: [...elements],
              oldElements,
              size,
              capacity: oldCap,
              activeOp: 'reallocate',
              highlightIndex: null,
              isResizing: true,
              message: `Capacity exhausted! Allocating new contiguous memory of size ${newCap}.`,
            },
            {
              action: 'REALLOC_START',
              variables: { size, oldCap, newCap, isResizing: true },
              callStack: [{ name: 'push', params: { val, size, capacity: oldCap } }],
            }
          );

          // Create new buffer
          const newBuffer: (number | null)[] = new Array(newCap).fill(null);
          for (let i = 0; i < size; i++) {
            newBuffer[i] = elements[i];
            addFrame(
              6,
              `Copied element data[${i}] = ${elements[i]} to new memory block.`,
              {
                elements: [...newBuffer],
                oldElements,
                size,
                capacity: newCap,
                activeOp: 'reallocate',
                highlightIndex: i,
                isResizing: true,
                message: `Relocating: element ${elements[i]} copied into index ${i} of new buffer.`,
              },
              {
                action: 'COPY_ELEMENT',
                variables: { i, copiedVal: elements[i] ?? 0, newCap },
                callStack: [{ name: 'resize', params: { i, size, newCap } }],
              }
            );
          }

          capacity = newCap;
          elements = newBuffer;

          addFrame(
            9,
            `Reallocation complete. Old buffer freed. New capacity is ${capacity}.`,
            {
              elements: [...elements],
              size,
              capacity,
              activeOp: 'push',
              highlightIndex: null,
              isResizing: false,
              message: `Switched pointer to new buffer (capacity = ${capacity}).`,
            },
            {
              action: 'REALLOC_DONE',
              variables: { size, capacity, isResizing: false },
              callStack: [{ name: 'push', params: { val, size, capacity } }],
            }
          );
        }

        // Now append element
        elements[size] = val;
        const insertIdx = size;
        size++;

        addFrame(
          12,
          `Inserted value ${val} at index ${insertIdx}. Size updated to ${size}.`,
          {
            elements: [...elements],
            size,
            capacity,
            activeOp: 'push',
            highlightIndex: insertIdx,
            isResizing: false,
            message: `Appended ${val} into slot [${insertIdx}]. Amortized cost: O(1).`,
          },
          {
            action: 'APPEND',
            variables: { insertIdx, val, size, capacity },
            callStack: [{ name: 'push', params: { val, insertIdx, size } }],
          }
        );
      } else if (op.op === 'pop') {
        if (size === 0) {
          addFrame(
            15,
            `Cannot pop from an empty dynamic array.`,
            {
              elements: [...elements],
              size,
              capacity,
              activeOp: 'pop',
              highlightIndex: null,
              isResizing: false,
              message: `Array is empty; pop operation discarded.`,
            },
            {
              action: 'POP_EMPTY',
              variables: { size, capacity },
              callStack: [{ name: 'pop', params: { error: 'EmptyArray' } }],
            }
          );
        } else {
          size--;
          const poppedVal = elements[size];
          elements[size] = null;

          addFrame(
            16,
            `Popped element ${poppedVal} from index ${size}. New size = ${size}.`,
            {
              elements: [...elements],
              size,
              capacity,
              activeOp: 'pop',
              highlightIndex: size,
              isResizing: false,
              message: `Popped value ${poppedVal}. Slot [${size}] marked free.`,
            },
            {
              action: 'POP',
              variables: { poppedVal: poppedVal ?? 0, size, capacity },
              callStack: [{ name: 'pop', params: { poppedVal: poppedVal ?? 0, newSize: size } }],
            }
          );
        }
      }
    }

    addFrame(
      20,
      `All operations executed. Final size = ${size}, capacity = ${capacity}.`,
      {
        elements: [...elements],
        size,
        capacity,
        activeOp: 'idle',
        highlightIndex: null,
        isResizing: false,
        message: `Final load factor: ${((size / capacity) * 100).toFixed(1)}% (${size}/${capacity} utilized).`,
      },
      {
        action: 'FINISH',
        variables: { size, capacity, loadFactor: size / capacity },
        callStack: [{ name: 'finish', params: { size, capacity } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<DynamicArrayState>) => {
    const { elements, size, capacity, highlightIndex, isResizing, oldElements, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto space-y-6">
        {/* Telemetry Header */}
        <div className="flex flex-wrap items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Load Factor:
            </span>
            <div className="w-36 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${
                  size / capacity > 0.8
                    ? 'bg-rose-500'
                    : size / capacity > 0.5
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (size / capacity) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              {size} / {capacity} ({((size / capacity) * 100).toFixed(0)}%)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2.5 py-1 bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 rounded-md">
              Capacity: {capacity}
            </span>
            <span className="px-2.5 py-1 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 rounded-md">
              Size: {size}
            </span>
            {isResizing && (
              <span className="px-2.5 py-1 bg-rose-950/80 border border-rose-500/60 text-rose-300 rounded-md animate-pulse font-bold">
                REALLOCATING (2x)
              </span>
            )}
          </div>
        </div>

        {/* Message Banner */}
        <div className="text-sm font-mono text-center text-slate-300 px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg w-full">
          {message}
        </div>

        {/* Old Array Buffer (Shown during resizing) */}
        {isResizing && oldElements && (
          <div className="w-full flex flex-col items-center p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Old Deprecated Buffer (Freeing Memory)
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {oldElements.map((val, idx) => (
                <div
                  key={`old-${idx}`}
                  className="w-12 h-14 rounded-lg flex flex-col items-center justify-center font-mono border bg-slate-800/40 border-rose-600/50 text-rose-300 opacity-60"
                >
                  <span className="text-xs text-rose-400/80 font-mono">#{idx}</span>
                  <span className="text-sm font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Memory Buffer Grid */}
        <div className="w-full flex flex-col items-center space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Contiguous Memory Slots
          </span>
          <div className="flex flex-wrap gap-2.5 justify-center max-w-full">
            {elements.map((val, idx) => {
              const isOccupied = idx < size && val !== null;
              const isHighlighted = idx === highlightIndex;

              let slotColor = 'bg-slate-900/60 border-slate-700/60 text-slate-500';
              if (isHighlighted) {
                slotColor = 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20 scale-105';
              } else if (isOccupied) {
                slotColor = 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200';
              }

              return (
                <div
                  key={`slot-${idx}`}
                  className={`w-14 h-16 rounded-xl flex flex-col items-center justify-between p-1.5 font-mono border transition-all duration-200 ${slotColor}`}
                >
                  <span className="text-[10px] text-slate-400 font-semibold">[{idx}]</span>
                  <span className="text-base font-bold">
                    {val !== null ? val : <span className="text-slate-600 text-xs font-normal">null</span>}
                  </span>
                  <span className="text-[9px] uppercase tracking-tighter text-slate-400">
                    {isOccupied ? 'used' : 'spare'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-cyan-950/70 border border-cyan-500/50" />
            <span>Occupied Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-900/60 border border-slate-700/60" />
            <span>Spare Allocated Capacity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-400" />
            <span>Active Pointer</span>
          </div>
        </div>
      </div>
    );
  },
};
