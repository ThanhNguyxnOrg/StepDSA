import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface MonotonicStackState {
  array: number[];
  result: (number | null)[];
  stack: number[]; // stack of indices
  currentIndex: number | null;
}

export const monotonicStackModule: AlgorithmModule<number[], MonotonicStackState> = {
  id: 'monotonic-stack',
  title: 'Next Greater Element (Monotonic Stack)',
  category: 'stack-queue',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Strictly decreasing array: all elements pushed before popping',
  },
  theory: {
    overview:
      'A monotonic stack maintains elements in strictly increasing or decreasing order. For Next Greater Element, we maintain a decreasing stack of indices. When a larger element arrives, it pops smaller elements and resolves their next greater value.',
    whyItWorks:
      'Each element is pushed onto the stack exactly once and popped at most once, yielding linear O(N) amortized time instead of nested O(N²) scanning.',
    invariant:
      'The elements corresponding to the stack indices are in strictly decreasing order from bottom to top.',
    pitfalls: [
      'Storing values instead of indices in the stack, making it impossible to update the result array at original positions.',
      'Using >= instead of > if strictly greater elements are required.',
    ],
  },
  codeSnippets: {
    python: `def next_greater_elements(nums):
    n = len(nums)
    result = [-1] * n
    stack = []  # stores indices
    for i in range(n):
        while stack and nums[i] > nums[stack[-1]]:
            idx = stack.pop()
            result[idx] = nums[i]
        stack.append(i)
    return result`,
    typescript: `function nextGreaterElement(nums: number[]): number[] {
  const n = nums.length;
  const result: number[] = new Array(n).fill(-1);
  const stack: number[] = []; // index stack
  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }
  return result;
}`,
    cpp: `vector<int> nextGreaterElements(vector<int>& nums) {
    int n = nums.size();
    vector<int> result(n, -1);
    stack<int> st; // stores indices
    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[i] > nums[st.top()]) {
            result[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }
    return result;
}`,
    java: `public int[] nextGreaterElements(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    Arrays.fill(result, -1);
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
            result[stack.pop()] = nums[i];
        }
        stack.push(i);
    }
    return result;
}`,
    pseudocode: `function nextGreaterElement(nums):
    result <- array of size N filled with -1
    stack <- empty stack of indices
    for i from 0 to N - 1:
        while stack is not empty and nums[i] > nums[stack.top]:
            idx <- stack.pop()
            result[idx] <- nums[i]
        stack.push(i)
    return result`,
  },
  defaultInput: [4, 5, 2, 10, 8],
  presets: [
    { id: 'mix', label: 'Standard Mix', description: '[4, 5, 2, 10, 8]', data: [4, 5, 2, 10, 8] },
    { id: 'dec', label: 'Strictly Decreasing', description: '[9, 7, 5, 3, 1]', data: [9, 7, 5, 3, 1] },
    { id: 'inc', label: 'Strictly Increasing', description: '[1, 3, 5, 7, 9]', data: [1, 3, 5, 7, 9] },
  ],
  generateTimeline: (input: number[]): ExecutionFrame<MonotonicStackState>[] => {
    const frames: ExecutionFrame<MonotonicStackState>[] = [];
    const n = input.length;
    const result: (number | null)[] = new Array(n).fill(null);
    const stack: number[] = [];

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: 'Initialize empty stack and result array filled with null (-1).',
      state: {
        array: [...input],
        result: [...result],
        stack: [],
        currentIndex: null,
      },
    });

    for (let i = 0; i < n; i++) {
      const currentVal = input[i];

      // Frame: Enter index i
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Examining index i = ${i} (value ${currentVal}). Check stack top.`,
        state: {
          array: [...input],
          result: [...result],
          stack: [...stack],
          currentIndex: i,
        },
      });

      // While stack not empty and nums[i] > nums[stack.top]
      while (stack.length > 0 && currentVal > input[stack[stack.length - 1]]) {
        const topIdx = stack.pop()!;
        result[topIdx] = currentVal;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `nums[${i}] (${currentVal}) > nums[${topIdx}] (${input[topIdx]}). Popped ${topIdx} -> next greater is ${currentVal}.`,
          state: {
            array: [...input],
            result: [...result],
            stack: [...stack],
            currentIndex: i,
          },
        });
      }

      // Push i onto stack
      stack.push(i);
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Push index ${i} (value ${currentVal}) onto monotonic stack.`,
        state: {
          array: [...input],
          result: [...result],
          stack: [...stack],
          currentIndex: i,
        },
      });
    }

    // Unresolved indices stay -1
    for (const idx of stack) {
      if (result[idx] === null) result[idx] = -1;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      explanation: 'Traversal complete. Remaining elements in stack have no greater element (-1).',
      state: {
        array: [...input],
        result: [...result],
        stack: [...stack],
        currentIndex: null,
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<MonotonicStackState>) => {
    const { array, result, stack, currentIndex } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-8">
        {/* Input Array and Results Table */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-mono text-slate-400 font-semibold tracking-wider">INPUT ARRAY & NEXT GREATER VALUE</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {array.map((val, idx) => {
              const isCurrent = currentIndex === idx;
              const inStack = stack.includes(idx);
              const resVal = result[idx];

              let boxClass = 'border-slate-700 bg-slate-900/60';
              if (isCurrent) boxClass = 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400';
              else if (inStack) boxClass = 'border-indigo-500 bg-indigo-950/40';

              return (
                <div key={idx} className={`flex flex-col items-center justify-between p-2 w-16 h-24 rounded-lg border-2 transition-all ${boxClass}`}>
                  <span className="text-xs font-mono text-slate-500">[{idx}]</span>
                  <span className="text-lg font-bold font-mono text-white">{val}</span>
                  <div className="text-[11px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300 w-full text-center">
                    {resVal !== null ? resVal : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monotonic Stack View */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-mono text-indigo-400 font-semibold tracking-wider">MONOTONIC STACK (INDEX : VALUE)</span>
          <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-700 rounded-xl min-w-[280px] justify-center min-h-[56px]">
            {stack.length === 0 ? (
              <span className="text-xs font-mono text-slate-500 italic">Empty Stack</span>
            ) : (
              stack.map((idx) => (
                <div key={idx} className="flex flex-col items-center px-3 py-1 bg-indigo-900/60 border border-indigo-500 rounded text-center">
                  <span className="text-xs font-mono text-indigo-200 font-bold">{array[idx]}</span>
                  <span className="text-[10px] font-mono text-slate-400">idx {idx}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  },
};
