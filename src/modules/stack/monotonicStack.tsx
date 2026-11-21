import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
      isMilestone: true,
      milestoneTitle: 'Monotonic Stack Initialized',
      soundCue: { type: 'start' },
      variables: { n, stackSize: 0 },
      callStack: [{ name: 'nextGreaterElement', params: { n }, line: 2, isCurrent: true }],
      conditionEval: { expr: `stack.length == 0`, result: true },
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
        soundCue: { type: 'step' },
        variables: { i, currentVal, stackTop: stack.length > 0 ? stack[stack.length - 1] : null },
        callStack: [{ name: 'nextGreaterElement', params: { i, currentVal }, line: 5, isCurrent: true }],
        conditionEval: { expr: `i < n (${i} < ${n})`, result: true },
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
          soundCue: { type: 'swap' },
          variables: { i, currentVal, resolvedIdx: topIdx, nextGreater: currentVal },
          callStack: [{ name: 'resolveNextGreater', params: { topIdx, currentVal }, line: 7, isCurrent: true }],
          conditionEval: { expr: `nums[${i}] > nums[${topIdx}] (${currentVal} > ${input[topIdx]})`, result: true },
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
        soundCue: { type: 'step' },
        variables: { pushedIndex: i, currentVal, stackLength: stack.length },
        callStack: [{ name: 'stack.push', params: { index: i }, line: 9, isCurrent: true }],
        conditionEval: { expr: `stack.length > 0`, result: true },
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
      isMilestone: true,
      milestoneTitle: 'Monotonic Stack Complete',
      soundCue: { type: 'complete' },
      variables: { completed: true, n },
      callStack: [{ name: 'nextGreaterElement', params: { done: true }, line: 11, isCurrent: true }],
      conditionEval: { expr: `i == n (${n} == ${n})`, result: true },
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
    const maxVal = Math.max(...array.map((v) => Math.abs(v)), 1);

    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 w-full min-h-[360px] gap-6 select-none">
        {/* Input Array Bars + Next Greater Element Result Row */}
        <div className="flex flex-col items-center gap-2.5 w-full max-w-4xl">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
            Input Array &amp; Resolved Next Greater Element (NGE)
          </span>
          <div className="flex flex-wrap items-end justify-center gap-2.5">
            {array.map((val, idx) => {
              const isCurrent = currentIndex === idx;
              const inStack = stack.includes(idx);
              const resVal = result[idx];
              const isResolved = resVal !== null;
              const barH = Math.max(14, Math.round((Math.abs(val) / maxVal) * 72));

              const cardStyle: React.CSSProperties = isCurrent
                ? {
                    backgroundColor: 'var(--sem-comparing-bg)',
                    borderColor: 'var(--sem-comparing-border)',
                    color: 'var(--sem-comparing-text)',
                  }
                : inStack
                ? {
                    backgroundColor: 'var(--sem-pivot-bg)',
                    borderColor: 'var(--sem-pivot-border)',
                    color: 'var(--sem-pivot-text)',
                  }
                : isResolved
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
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  {/* Proportional bar */}
                  <div className="h-[74px] flex items-end justify-center">
                    <motion.div
                      initial={false}
                      animate={{ height: barH }}
                      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                      style={{
                        backgroundColor: isCurrent
                          ? 'var(--sem-comparing-solid)'
                          : inStack
                          ? 'var(--sem-pivot-solid)'
                          : isResolved
                          ? 'var(--sem-sorted-solid)'
                          : 'var(--sem-default-border)',
                      }}
                      className="w-8 rounded-t-md opacity-85"
                    />
                  </div>

                  {/* Value + NGE card */}
                  <div
                    style={cardStyle}
                    className={`flex flex-col items-center justify-between p-2 w-16 rounded-xl border-2 transition-all ${
                      isCurrent ? 'ring-2 ring-[#F59E0B]/45 scale-105 shadow-md' : ''
                    }`}
                  >
                    <span className="text-[10px] font-mono opacity-65 tabular-nums">[{idx}]</span>
                    <span className="text-base font-extrabold font-mono tabular-nums my-0.5">{val}</span>
                    <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B0F19]/60 border border-[#1F293D] w-full text-center font-bold tabular-nums">
                      {resVal !== null ? `→ ${resVal}` : '—'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monotonic Decreasing Stack Tray */}
        <div className="flex flex-col items-center gap-2 w-full max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider uppercase text-purple-400">
            <span>Monotonic Decreasing Stack (Waiting for Greater Element)</span>
            <span className="text-slate-500">· size {stack.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3 bg-[#111827] border-2 border-[#1F293D] rounded-xl min-w-[300px] justify-center min-h-[64px] shadow-sm">
            <AnimatePresence mode="popLayout">
              {stack.length === 0 ? (
                <span className="text-xs font-mono text-slate-500 italic">Empty Stack</span>
              ) : (
                stack.map((idx, pos) => {
                  const isTop = pos === stack.length - 1;
                  return (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.75, y: -10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                      style={{
                        backgroundColor: isTop ? 'var(--sem-comparing-bg)' : 'var(--sem-pivot-bg)',
                        borderColor: isTop ? 'var(--sem-comparing-border)' : 'var(--sem-pivot-border)',
                        color: isTop ? 'var(--sem-comparing-text)' : 'var(--sem-pivot-text)',
                      }}
                      className="flex flex-col items-center px-3 py-1.5 border-2 rounded-lg text-center font-mono relative"
                    >
                      {isTop && (
                        <span
                          style={{
                            backgroundColor: 'var(--sem-comparing-solid)',
                            color: 'var(--sem-comparing-on-solid)',
                          }}
                          className="theme-solid-badge absolute -top-2.5 px-1 py-0.2 rounded text-[7.5px] font-bold uppercase"
                        >
                          TOP
                        </span>
                      )}
                      <span className="text-sm font-extrabold tabular-nums">{array[idx]}</span>
                      <span className="text-[9.5px] opacity-75 tabular-nums">idx {idx}</span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  },
};
