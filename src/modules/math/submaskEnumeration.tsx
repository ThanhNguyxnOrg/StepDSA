import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface SubmaskEnumerationState {
  mask: number;
  submask: number;
  submaskHistory: number[];
  numBits: number;
  stepType: 'start' | 'decrement' | 'and_mask' | 'done';
  message: string;
}

export const submaskEnumerationModule: AlgorithmModule<
  { mask: number },
  SubmaskEnumerationState
> = {
  id: 'submask-enumeration',
  title: 'Submask Enumeration (Submask Traversal via Bit Tricks)',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(2^k) where k = popcount(mask)',
    timeAverage: 'O(3^N) across all 2^N masks',
    timeWorst: 'O(3^N) state space total',
    spaceAuxiliary: 'O(1) in-place register operations',
    worstCaseCondition: 'All bits set in N-bit mask traversing 2^N submasks',
  },
  theory: {
    overview:
      'Submask enumeration visits every subset of bits that is a submask of a given mask in strictly decreasing numerical order using the bitwise recurrence: s = (s - 1) & mask.',
    whyItWorks:
      'Subtracting 1 flips the lowest set bit to 0 and turns all lower trailing zeros to 1s. Bitwise ANDing with the parent mask immediately zeroes out any bits that were not in the parent mask, hopping directly to the next valid submask without testing invalid numbers.',
    invariant:
      'Submask Property Invariant: At every iteration, (s | mask) == mask, meaning every bit set in s is guaranteed to be set in mask.',
    pitfalls: [
      'Infinite loop: forgetting that after s = 0, (0 - 1) & mask wraps back around to mask if using unsigned types or while (s >= 0).',
      'Thinking total time across all subsets is O(4^N); by the Binomial Theorem, sum(C(N, k) * 2^k) = (1 + 2)^N = 3^N.',
    ],
  },
  defaultInput: {
    mask: 22, // binary: 010110 (bits 1, 2, 4 set) -> 2^3 = 8 submasks
  },
  presets: [
    {
      id: 'mask-22',
      label: 'Mask 22 (Bits 1, 2, 4 -> 8 submasks)',
      description: '3 bits set traversing 2^3 = 8 submasks in descending order',
      data: { mask: 22 },
    },
    {
      id: 'mask-42',
      label: 'Mask 42 (Bits 1, 3, 5 -> 8 submasks)',
      description: 'Alternating bit pattern demonstrating submask jumps',
      data: { mask: 42 },
    },
    {
      id: 'mask-15',
      label: 'Dense Mask 15 (Bits 0, 1, 2, 3 -> 16 submasks)',
      description: 'Contiguous 4-bit mask exploring all 16 combinations',
      data: { mask: 15 },
    },
  ],
  codeSnippets: {
    cpp: `// Iterate over all submasks of 'mask'
for (int s = mask; s > 0; s = (s - 1) & mask) {
    // Process submask s
}
// s = 0 (empty submask) processed separately

// Total time to iterate all submasks of all masks of size N:
// Sum_{k=0}^N C(N, k) * 2^k = (1 + 2)^N = 3^N`,
    python: `# Iterate over all submasks of mask
s = mask
while s > 0:
    # Process submask s
    s = (s - 1) & mask
# Process s = 0`,
    typescript: `let s = mask;
while (s > 0) {
  // process submask s
  s = (s - 1) & mask;
}
// process submask 0`,
    java: `for (int s = mask; s > 0; s = (s - 1) & mask) {
    // process submask s
}`,
    pseudocode: `s <- mask
while s > 0:
    process(s)
    s <- (s - 1) AND mask
process(0)`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<SubmaskEnumerationState>[] = [];
    const mask = input.mask;
    const numBits = Math.max(6, Math.floor(Math.log2(mask || 1)) + 2);
    const history: number[] = [];

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: SubmaskEnumerationState,
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
      `Target mask: ${mask} (binary: ${mask.toString(2).padStart(numBits, '0')}). Initiating bit trick enumeration.`,
      {
        mask,
        submask: mask,
        submaskHistory: [],
        numBits,
        stepType: 'start',
        message: `Starting enumeration at s = mask = ${mask}.`,
      },
      {
        action: 'INIT',
        variables: { mask, binary: mask.toString(2).padStart(numBits, '0') },
        callStack: [{ name: 'submaskEnum', params: { mask } }],
      }
    );

    let s = mask;
    while (s > 0) {
      history.push(s);
      addFrame(
        3,
        `Active submask s = ${s} (binary: ${s.toString(2).padStart(numBits, '0')}). Submask valid: (s | mask) == mask.`,
        {
          mask,
          submask: s,
          submaskHistory: [...history],
          numBits,
          stepType: 'decrement',
          message: `Visiting submask ${s} [${s.toString(2).padStart(numBits, '0')}].`,
        },
        {
          action: 'VISIT_SUBMASK',
          variables: { s, binary: s.toString(2).padStart(numBits, '0'), visitedCount: history.length },
          callStack: [{ name: 'processSubmask', params: { s } }],
        }
      );

      const nextVal = (s - 1) & mask;
      addFrame(
        5,
        `Bitwise jump: (${s} - 1) & ${mask} = ${s - 1} & ${mask} = ${nextVal}.`,
        {
          mask,
          submask: nextVal,
          submaskHistory: [...history],
          numBits,
          stepType: 'and_mask',
          message: `Jumped directly to next valid submask: ${nextVal}.`,
        },
        {
          action: 'BITWISE_STEP',
          variables: { s, sMinusOne: s - 1, nextSubmask: nextVal },
          callStack: [{ name: 'nextStep', params: { prev: s, next: nextVal } }],
        }
      );

      s = nextVal;
    }

    // Include submask 0
    history.push(0);
    addFrame(
      8,
      `Visited empty submask s = 0. All submasks enumerated in strictly descending order.`,
      {
        mask,
        submask: 0,
        submaskHistory: [...history],
        numBits,
        stepType: 'done',
        message: `Enumeration complete! Visited ${history.length} submasks with zero redundant iterations.`,
      },
      {
        action: 'COMPLETE',
        variables: { finalSubmask: 0, totalSubmasks: history.length },
        callStack: [{ name: 'finish', params: { total: history.length } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<SubmaskEnumerationState>) => {
    const { mask, submask, submaskHistory, numBits, message } = frame.state;

    const toBitArray = (val: number, length: number) => {
      const bits: number[] = [];
      for (let i = length - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
      return bits;
    };

    const maskBits = toBitArray(mask, numBits);
    const submaskBits = toBitArray(submask, numBits);

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Binary Register Display */}
        <div className="w-full flex flex-col p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            CPU Register Bitwise Inspection (Bit 0 on right)
          </span>

          {/* Mask Row */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span className="text-indigo-400 font-bold">Parent Mask: {mask}</span>
              <span>0b{mask.toString(2).padStart(numBits, '0')}</span>
            </div>
            <div className="flex gap-1.5 justify-center">
              {maskBits.map((b, idx) => {
                const bitPos = numBits - 1 - idx;
                return (
                  <div
                    key={`mask-bit-${idx}`}
                    className={`w-10 h-12 rounded-lg border flex flex-col items-center justify-between p-1 font-mono ${
                      b === 1
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-bold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="text-[9px] text-slate-500">#{bitPos}</span>
                    <span className="text-sm">{b}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submask Row */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span className="text-amber-400 font-bold">Current Submask s: {submask}</span>
              <span>0b{submask.toString(2).padStart(numBits, '0')}</span>
            </div>
            <div className="flex gap-1.5 justify-center">
              {submaskBits.map((b, idx) => {
                const bitPos = numBits - 1 - idx;
                const isParentSet = maskBits[idx] === 1;

                let style = 'bg-slate-900/40 border-slate-800 text-slate-600';
                if (b === 1) {
                  style = 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-md shadow-amber-500/20';
                } else if (isParentSet) {
                  style = 'bg-slate-900/80 border-slate-700 text-slate-400';
                }

                return (
                  <div
                    key={`sub-bit-${idx}`}
                    className={`w-10 h-12 rounded-lg border flex flex-col items-center justify-between p-1 font-mono transition-all duration-200 ${style}`}
                  >
                    <span className="text-[9px] text-slate-500">#{bitPos}</span>
                    <span className="text-sm">{b}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submasks History Stream */}
        <div className="w-full flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Generated Submasks Sequence (Descending Order)
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Count: {submaskHistory.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
            {submaskHistory.map((val, idx) => {
              const isCurrent = val === submask;
              return (
                <div
                  key={`hist-${idx}`}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold scale-105 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 font-normal">#{idx + 1}:</span>
                  <span>{val}</span>
                  <span className="text-[10px] text-slate-500">
                    ({val.toString(2).padStart(numBits, '0')})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invariant Footer */}
        <div className="w-full p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400 text-center">
          Complexity Property: Sum over all 2^N masks yields 3^N submask evaluations.
        </div>
      </div>
    );
  },
};
