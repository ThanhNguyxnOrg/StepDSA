import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DequeState {
  items: number[];
  recentAction?: 'PUSH_FRONT' | 'PUSH_BACK' | 'POP_FRONT' | 'POP_BACK';
  highlightedIndex?: number;
}

export const dequeVisualizerModule: AlgorithmModule<number[], DequeState> = {
  id: 'deque-visualizer',
  title: 'Deque (Double-Ended Queue)',
  category: 'stack-queue',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1)',
    timeWorst: 'O(1)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'All push and pop operations at either boundary are strictly constant time',
  },
  theory: {
    overview:
      'A Deque (Double-Ended Queue, pronounced "deck") is an indexed sequence container that allows fast O(1) insertions and deletions at both its beginning (head/front) and its end (tail/back).',
    whyItWorks:
      'Unlike a basic stack (LIFO, 1 end) or queue (FIFO, 2 opposite ends), a Deque combines the capabilities of both structures, serving as the core engine for sliding window algorithms and 0-1 BFS.',
    invariant:
      'Dual-Ended Access Invariant: Both front and rear endpoints support push and pop operations in independent O(1) time.',
    pitfalls: [
      'Popping from front or back when deque is empty (Underflow).',
      'Confusing push_front order with push_back order.',
    ],
  },
  presets: [
    {
      id: 'mixed-flow',
      label: 'Bidirectional Traffic',
      description: 'Push front & back, pop front & back',
      data: [15, 30, 45, 60],
    },
    {
      id: 'palindrome-check',
      label: 'Symmetric Ends',
      description: 'Pop both ends simultaneously',
      data: [9, 18, 27, 36],
    },
  ],
  defaultInput: [15, 30, 45, 60],
  codeSnippets: {
    python: `from collections import deque

dq = deque()
dq.append(30)       # push_back
dq.appendleft(15)   # push_front
dq.append(45)       # push_back
dq.popleft()        # pop_front -> 15
dq.pop()            # pop_back -> 45`,
    typescript: `class Deque<T> {
  private items: T[] = [];
  pushFront(val: T) { this.items.unshift(val); }
  pushBack(val: T) { this.items.push(val); }
  popFront(): T | undefined { return this.items.shift(); }
  popBack(): T | undefined { return this.items.pop(); }
  size(): number { return this.items.length; }
}`,
    cpp: `#include <deque>
std::deque<int> dq;
dq.push_back(30);
dq.push_front(15);
dq.push_back(45);
dq.pop_front();
dq.pop_back();`,
    java: `Deque<Integer> dq = new ArrayDeque<>();
dq.addLast(30);
dq.addFirst(15);
dq.addLast(45);
dq.removeFirst();
dq.removeLast();`,
    pseudocode: `deque <- empty
push_front(deque, 15)
push_back(deque, 30)
pop_front(deque)
pop_back(deque)`,
  },
  generateTimeline: (input: number[]) => {
    const dq: number[] = [];
    const frames: ExecutionFrame<DequeState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: 'Initialized empty Double-Ended Queue (Deque) with symmetric O(1) Head & Tail access ports.',
      isMilestone: true,
      milestoneTitle: 'Initialized Empty Deque',
      soundCue: { type: 'start' },
      callStack: [
        { name: 'deque_init()', params: { capacity: 'dynamic' }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { size: 0, front: null, rear: null, isEmpty: true },
      conditionEval: { expr: 'size == 0', result: true },
      state: { items: [], recentAction: undefined },
    });

    const v1 = input[0] ?? 10;
    // Step 1A: Prepare push_back
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Preparing PUSH_BACK(${v1}): Checking rear port capacity. Deque currently has ${dq.length} items.`,
      soundCue: { type: 'step' },
      callStack: [
        { name: 'push_back(deque, val)', params: { val: v1, currentSize: dq.length }, line: 4, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { action: 'PUSH_BACK', val: v1, sizeBefore: dq.length },
      state: { items: [...dq], recentAction: undefined },
    });
    // Step 1B: Commit push_back
    dq.push(v1);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      explanation: `PUSH_BACK(${v1}) Committed: Appended ${v1} to rear of Deque. Front=0, Rear=0.`,
      isMilestone: true,
      milestoneTitle: `Push Back (${v1})`,
      soundCue: { type: 'swap' },
      callStack: [
        { name: 'push_back(deque, val)', params: { val: v1, newSize: dq.length }, line: 4, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { action: 'PUSH_BACK', val: v1, size: dq.length, front: dq[0], rear: dq[dq.length - 1] },
      state: { items: [...dq], recentAction: 'PUSH_BACK', highlightedIndex: dq.length - 1 },
    });

    const v2 = input[1] ?? 20;
    // Step 2A: Prepare push_front
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 5,
      explanation: `Preparing PUSH_FRONT(${v2}): Inserting at head index 0. Existing items will shift logically.`,
      soundCue: { type: 'step' },
      callStack: [
        { name: 'push_front(deque, val)', params: { val: v2, currentSize: dq.length }, line: 5, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { action: 'PUSH_FRONT', val: v2, sizeBefore: dq.length },
      state: { items: [...dq], recentAction: undefined },
    });
    // Step 2B: Commit push_front
    dq.unshift(v2);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 5,
      explanation: `PUSH_FRONT(${v2}) Committed: Prepended ${v2} to front of Deque in O(1). Front=${dq[0]}, Rear=${dq[dq.length - 1]}.`,
      isMilestone: true,
      milestoneTitle: `Push Front (${v2})`,
      soundCue: { type: 'swap' },
      callStack: [
        { name: 'push_front(deque, val)', params: { val: v2, newSize: dq.length }, line: 5, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { action: 'PUSH_FRONT', val: v2, size: dq.length, front: dq[0], rear: dq[dq.length - 1] },
      state: { items: [...dq], recentAction: 'PUSH_FRONT', highlightedIndex: 0 },
    });

    const v3 = input[2] ?? 30;
    // Step 3: Push back v3
    dq.push(v3);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `PUSH_BACK(${v3}): Appended ${v3} to rear. Deque sequence is now [${dq.join(', ')}].`,
      isMilestone: true,
      milestoneTitle: `Push Back (${v3})`,
      soundCue: { type: 'swap' },
      callStack: [
        { name: 'push_back(deque, val)', params: { val: v3, size: dq.length }, line: 6, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { action: 'PUSH_BACK', val: v3, size: dq.length, front: dq[0], rear: dq[dq.length - 1] },
      state: { items: [...dq], recentAction: 'PUSH_BACK', highlightedIndex: dq.length - 1 },
    });

    // Step 4: Peek front before pop
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      explanation: `PEEK_FRONT(): Inspecting head element without removal -> ${dq[0]}. Underflow check: isEmpty is FALSE.`,
      soundCue: { type: 'compare' },
      callStack: [
        { name: 'peek_front(deque)', params: { frontVal: dq[0] }, line: 7, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { peekVal: dq[0], isEmpty: false },
      conditionEval: { expr: 'size > 0', result: true },
      state: { items: [...dq], recentAction: 'PUSH_FRONT', highlightedIndex: 0 },
    });

    // Step 5: Pop front
    const poppedFront = dq.shift();
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      explanation: `POP_FRONT(): Removed ${poppedFront} from the front port in O(1). Remaining elements: [${dq.join(', ')}].`,
      isMilestone: true,
      milestoneTitle: `Pop Front (${poppedFront})`,
      soundCue: { type: 'step' },
      callStack: [
        { name: 'pop_front(deque)', params: { popped: poppedFront, remainingSize: dq.length }, line: 7, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { poppedVal: poppedFront, size: dq.length, newFront: dq[0] },
      state: { items: [...dq], recentAction: 'POP_FRONT', highlightedIndex: 0 },
    });

    // Step 6: Peek back before pop
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `PEEK_BACK(): Inspecting rear element without removal -> ${dq[dq.length - 1]}. Underflow check passed.`,
      soundCue: { type: 'compare' },
      callStack: [
        { name: 'peek_back(deque)', params: { rearVal: dq[dq.length - 1] }, line: 8, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { rearVal: dq[dq.length - 1], isEmpty: false },
      conditionEval: { expr: 'size > 0', result: true },
      state: { items: [...dq], recentAction: 'PUSH_BACK', highlightedIndex: dq.length - 1 },
    });

    // Step 7: Pop back
    const poppedBack = dq.pop();
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `POP_BACK(): Removed ${poppedBack} from the rear port in O(1). Only [${dq.join(', ')}] remains.`,
      isMilestone: true,
      milestoneTitle: `Pop Back (${poppedBack})`,
      soundCue: { type: 'step' },
      callStack: [
        { name: 'pop_back(deque)', params: { popped: poppedBack, remainingSize: dq.length }, line: 8, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { poppedVal: poppedBack, size: dq.length, front: dq[0], rear: dq[0] },
      state: { items: [...dq], recentAction: 'POP_BACK', highlightedIndex: dq.length - 1 },
    });

    // Step 8: Terminal state summary
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      explanation: `🎉 Deque visualizer complete! Successfully demonstrated O(1) Push/Pop operations at both ends.`,
      isMilestone: true,
      milestoneTitle: 'Operations Complete',
      soundCue: { type: 'complete' },
      callStack: [
        { name: 'main()', params: { finalSize: dq.length }, line: 9, isCurrent: true },
      ],
      variables: { finalSize: dq.length, remainingElement: dq[0] },
      state: { items: [...dq], recentAction: undefined },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<DequeState>) => {
    const { items, recentAction, highlightedIndex } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* Header HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Size: <span className="text-emerald-400 font-bold">{items.length}</span>
          </div>
          {recentAction && (
            <div className="px-3 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-xs font-mono text-indigo-300 font-bold animate-pulse">
              ACTION: {recentAction}
            </div>
          )}
        </div>

        {/* Dual-Ended Pipeline */}
        <div className="relative flex items-center justify-center py-10 px-8 bg-slate-950/70 border-2 border-slate-700 rounded-3xl max-w-4xl w-full">
          {/* Front Controls */}
          <div className="absolute left-4 flex flex-col items-center text-cyan-400 font-mono text-xs font-bold gap-1">
            <span className="text-[10px] text-emerald-400">PUSH_FRONT ↷</span>
            <span className="text-slate-400">FRONT</span>
            <span className="text-[10px] text-rose-400">↶ POP_FRONT</span>
          </div>

          {/* Items */}
          <div className="flex items-center gap-3 overflow-x-auto px-28 py-4">
            {items.length === 0 ? (
              <div className="text-slate-500 font-mono text-xs py-4 italic">
                (Deque is currently empty)
              </div>
            ) : (
              items.map((val, idx) => {
                const isHighlight = idx === highlightedIndex;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-lg border-2 shadow-xl transition-all duration-300 ${
                        isHighlight
                          ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 ring-2 ring-cyan-400/40 scale-105'
                          : 'border-blue-500/40 bg-slate-900/90 text-white'
                      }`}
                    >
                      {val}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1">[{idx}]</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Rear Controls */}
          <div className="absolute right-4 flex flex-col items-center text-amber-400 font-mono text-xs font-bold gap-1">
            <span className="text-[10px] text-emerald-400">↶ PUSH_BACK</span>
            <span className="text-slate-400">REAR</span>
            <span className="text-[10px] text-rose-400">POP_BACK ↷</span>
          </div>
        </div>
      </div>
    );
  },
};
