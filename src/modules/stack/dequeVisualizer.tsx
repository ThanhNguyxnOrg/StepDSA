import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DequeState {
  items: number[];
  recentAction?: 'INIT' | 'PUSH_FRONT' | 'PUSH_BACK' | 'POP_FRONT' | 'POP_BACK' | 'PEEK_FRONT' | 'PEEK_BACK';
  highlightedIndex?: number;
  stagedValue?: { val: number; port: 'FRONT' | 'REAR' };
  pendingInput?: number[];
  poppedHistory?: { val: number; port: 'FRONT' | 'REAR' }[];
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

dq = deque([15])    # seed initial element
dq.append(30)       # push_back (O(1))
dq.appendleft(45)   # push_front (O(1))
dq.append(60)       # push_back (O(1))
dq.popleft()        # pop_front -> 45
dq.pop()            # pop_back -> 60`,
    typescript: `class Deque<T> {
  private items: T[] = [];
  pushFront(val: T) { this.items.unshift(val); }
  pushBack(val: T) { this.items.push(val); }
  popFront(): T | undefined { return this.items.shift(); }
  popBack(): T | undefined { return this.items.pop(); }
  size(): number { return this.items.length; }
}`,
    cpp: `#include <deque>
std::deque<int> dq = {15};
dq.push_back(30);
dq.push_front(45);
dq.push_back(60);
dq.pop_front();
dq.pop_back();`,
    java: `Deque<Integer> dq = new ArrayDeque<>();
dq.addLast(15);
dq.addLast(30);
dq.addFirst(45);
dq.addLast(60);
dq.removeFirst();
dq.removeLast();`,
    pseudocode: `deque <- [input[0]]
for each next item x:
    alternate push_back(deque, x) / push_front(deque, x)
pop_front(deque)
pop_back(deque)`,
  },
  generateTimeline: (input: number[]) => {
    const raw = input && input.length > 0 ? input.slice(0, 10) : [15, 30, 45, 60];
    const seedVal = raw[0] ?? 15;
    const dq: number[] = [seedVal];
    const poppedHistory: { val: number; port: 'FRONT' | 'REAR' }[] = [];
    const frames: ExecutionFrame<DequeState>[] = [];

    // Frame 0: Initialized Deque with first element seeded and remaining input queued
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Initialized Double-Ended Queue (Deque) seeded with [${seedVal}]. Front = 0 (${seedVal}), Rear = 0 (${seedVal}). Pending stream: [${raw.slice(1).join(', ')}].`,
      isMilestone: true,
      milestoneTitle: `Seeded Deque [${seedVal}]`,
      soundCue: { type: 'start' },
      callStack: [
        { name: 'deque_init()', params: { seed: seedVal, pending: raw.length - 1 }, line: 3, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { size: dq.length, front: dq[0], rear: dq[dq.length - 1], isEmpty: false },
      conditionEval: { expr: 'size == 1', result: true },
      state: {
        items: [...dq],
        recentAction: 'INIT',
        highlightedIndex: 0,
        pendingInput: raw.slice(1),
        poppedHistory: [],
      },
    });

    // Process all remaining input items without skipping any element
    for (let i = 1; i < raw.length; i++) {
      const val = raw[i];
      const isPushBack = i % 2 === 1;
      const remainingAfter = raw.slice(i + 1);

      if (isPushBack) {
        // Stage at REAR port
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Staging PUSH_BACK(${val}) at REAR port (index ${dq.length}). Current rear element is ${dq[dq.length - 1]}.`,
          soundCue: { type: 'compare' },
          callStack: [
            { name: 'push_back(dq, val)', params: { val, sizeBefore: dq.length }, line: 4, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { op: 'PUSH_BACK', stagedVal: val, sizeBefore: dq.length, rear: dq[dq.length - 1] },
          conditionEval: { expr: 'port == REAR', result: true },
          state: {
            items: [...dq],
            recentAction: 'PUSH_BACK',
            highlightedIndex: dq.length - 1,
            stagedValue: { val, port: 'REAR' },
            pendingInput: remainingAfter,
            poppedHistory: [...poppedHistory],
          },
        });

        dq.push(val);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `PUSH_BACK(${val}) committed in O(1): Appended ${val} at rear index [${dq.length - 1}]. Deque: [${dq.join(', ')}].`,
          isMilestone: true,
          milestoneTitle: `Push Back (${val})`,
          soundCue: { type: 'swap' },
          callStack: [
            { name: 'push_back(dq, val)', params: { val, newSize: dq.length }, line: 4, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { op: 'PUSH_BACK', val, size: dq.length, front: dq[0], rear: dq[dq.length - 1] },
          state: {
            items: [...dq],
            recentAction: 'PUSH_BACK',
            highlightedIndex: dq.length - 1,
            pendingInput: remainingAfter,
            poppedHistory: [...poppedHistory],
          },
        });
      } else {
        // Stage at FRONT port
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Staging PUSH_FRONT(${val}) at FRONT port (head index 0). Current front element is ${dq[0]}.`,
          soundCue: { type: 'compare' },
          callStack: [
            { name: 'push_front(dq, val)', params: { val, sizeBefore: dq.length }, line: 5, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { op: 'PUSH_FRONT', stagedVal: val, sizeBefore: dq.length, front: dq[0] },
          conditionEval: { expr: 'port == FRONT', result: true },
          state: {
            items: [...dq],
            recentAction: 'PUSH_FRONT',
            highlightedIndex: 0,
            stagedValue: { val, port: 'FRONT' },
            pendingInput: remainingAfter,
            poppedHistory: [...poppedHistory],
          },
        });

        dq.unshift(val);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `PUSH_FRONT(${val}) committed in O(1): Prepended ${val} at head index [0]. Deque: [${dq.join(', ')}].`,
          isMilestone: true,
          milestoneTitle: `Push Front (${val})`,
          soundCue: { type: 'swap' },
          callStack: [
            { name: 'push_front(dq, val)', params: { val, newSize: dq.length }, line: 5, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { op: 'PUSH_FRONT', val, size: dq.length, front: dq[0], rear: dq[dq.length - 1] },
          state: {
            items: [...dq],
            recentAction: 'PUSH_FRONT',
            highlightedIndex: 0,
            pendingInput: remainingAfter,
            poppedHistory: [...poppedHistory],
          },
        });
      }
    }

    // Peek & Pop Front
    if (dq.length > 1) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `PEEK_FRONT(): Inspecting head element dq[0] = ${dq[0]} before removal. Underflow guard size (${dq.length}) > 0 is TRUE.`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'peek_front(dq)', params: { frontVal: dq[0] }, line: 7, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { peekFront: dq[0], size: dq.length, isEmpty: false },
        conditionEval: { expr: `size (${dq.length}) > 0`, result: true },
        state: {
          items: [...dq],
          recentAction: 'PEEK_FRONT',
          highlightedIndex: 0,
          pendingInput: [],
          poppedHistory: [...poppedHistory],
        },
      });

      const poppedFront = dq.shift()!;
      poppedHistory.push({ val: poppedFront, port: 'FRONT' });
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `POP_FRONT() -> ${poppedFront}: Removed ${poppedFront} from FRONT port in O(1). New front is ${dq[0]}.`,
        isMilestone: true,
        milestoneTitle: `Pop Front (${poppedFront})`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'pop_front(dq)', params: { popped: poppedFront, remainingSize: dq.length }, line: 7, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { poppedFront, size: dq.length, newFront: dq[0], rear: dq[dq.length - 1] },
        state: {
          items: [...dq],
          recentAction: 'POP_FRONT',
          highlightedIndex: 0,
          pendingInput: [],
          poppedHistory: [...poppedHistory],
        },
      });
    }

    // Peek & Pop Back
    if (dq.length > 1) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `PEEK_BACK(): Inspecting tail element dq[${dq.length - 1}] = ${dq[dq.length - 1]} before removal.`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: 'peek_back(dq)', params: { rearVal: dq[dq.length - 1] }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { peekBack: dq[dq.length - 1], size: dq.length, isEmpty: false },
        conditionEval: { expr: `size (${dq.length}) > 0`, result: true },
        state: {
          items: [...dq],
          recentAction: 'PEEK_BACK',
          highlightedIndex: dq.length - 1,
          pendingInput: [],
          poppedHistory: [...poppedHistory],
        },
      });

      const poppedBack = dq.pop()!;
      poppedHistory.push({ val: poppedBack, port: 'REAR' });
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `POP_BACK() -> ${poppedBack}: Removed ${poppedBack} from REAR port in O(1). Remaining Deque: [${dq.join(', ')}].`,
        isMilestone: true,
        milestoneTitle: `Pop Back (${poppedBack})`,
        soundCue: { type: 'complete' },
        callStack: [
          { name: 'pop_back(dq)', params: { popped: poppedBack, remainingSize: dq.length }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { poppedBack, size: dq.length, front: dq[0], rear: dq[dq.length - 1] },
        state: {
          items: [...dq],
          recentAction: 'POP_BACK',
          highlightedIndex: dq.length - 1,
          pendingInput: [],
          poppedHistory: [...poppedHistory],
        },
      });
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<DequeState>) => {
    const { items, recentAction, highlightedIndex, stagedValue, pendingInput = [], poppedHistory = [] } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-4">
        {/* Top Telemetry & Pending Stream Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
            Size: <span className="text-emerald-400 font-bold">{items.length}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
            Front: <span className="text-cyan-300 font-bold">{items[0] ?? '—'}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
            Rear: <span className="text-amber-300 font-bold">{items[items.length - 1] ?? '—'}</span>
          </div>
          {recentAction && (
            <div className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold">
              OP: {recentAction}
            </div>
          )}
        </div>

        {/* Dual-Ended Pipeline Container */}
        <div className="relative flex items-center justify-between gap-3 py-6 px-4 sm:px-6 bg-slate-950/80 border-2 border-slate-700/90 rounded-2xl max-w-4xl w-full shadow-xl">
          {/* Left: FRONT Port Controls + Staged Front Item */}
          <div className="flex flex-col items-center font-mono text-xs font-bold gap-1 shrink-0 min-w-[88px]">
            <span className="text-[10px] text-emerald-400">PUSH_FRONT ↷</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px]">
              FRONT PORT
            </span>
            <span className="text-[10px] text-rose-400">↶ POP_FRONT</span>
            {stagedValue?.port === 'FRONT' && (
              <div className="mt-1 px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg animate-bounce">
                +{stagedValue.val} →
              </div>
            )}
          </div>

          {/* Center: Active Deque Elements */}
          <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 px-2 flex-1">
            {items.map((val, idx) => {
              const isHighlight = idx === highlightedIndex;
              const isFront = idx === 0;
              const isRear = idx === items.length - 1;
              return (
                <div key={`${idx}-${val}`} className="flex flex-col items-center shrink-0">
                  <div className="h-4 flex items-center gap-1 mb-1">
                    {isFront && (
                      <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase">
                        HEAD
                      </span>
                    )}
                    {isFront && isRear && <span className="text-[9px] text-slate-500">/</span>}
                    {isRear && (
                      <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                        TAIL
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-mono font-bold text-base sm:text-lg border-2 shadow-lg transition-all duration-200 ${
                      isHighlight
                        ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 ring-2 ring-emerald-400/30 scale-105'
                        : 'border-slate-600 bg-slate-900 text-white'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1">[{idx}]</span>
                </div>
              );
            })}
          </div>

          {/* Right: REAR Port Controls + Staged Rear Item */}
          <div className="flex flex-col items-center font-mono text-xs font-bold gap-1 shrink-0 min-w-[88px]">
            <span className="text-[10px] text-emerald-400">↶ PUSH_BACK</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px]">
              REAR PORT
            </span>
            <span className="text-[10px] text-rose-400">POP_BACK ↷</span>
            {stagedValue?.port === 'REAR' && (
              <div className="mt-1 px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg animate-bounce">
                ← +{stagedValue.val}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Queue Context: Incoming Input Stream & Popped Elements */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400">Incoming Stream:</span>
            {pendingInput.length > 0 ? (
              <div className="flex items-center gap-1">
                {pendingInput.map((v, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-bold text-[11px]"
                  >
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-emerald-400 font-semibold">All inputs processed ✓</span>
            )}
          </div>

          {poppedHistory.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-slate-400">Popped:</span>
              <div className="flex items-center gap-1.5">
                {poppedHistory.map((p, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-[11px]"
                  >
                    {p.val} ({p.port})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
};
