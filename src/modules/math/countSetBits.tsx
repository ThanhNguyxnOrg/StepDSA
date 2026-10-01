import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface CountSetBitsState {
  initialN: number;
  n: number;
  nMinus1: number;
  clearedBitPos: number; // 0-indexed position of rightmost set bit
  bitCount: number;
  isComplete: boolean;
}

export const countSetBitsModule: AlgorithmModule<{ n: number }, CountSetBitsState> = {
  id: 'count-set-bits',
  title: "Count Set Bits (Brian Kernighan's Algorithm O(K))",
  category: 'math',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1) when n is 0',
    timeAverage: 'O(K) where K is number of set bits',
    timeWorst: 'O(K) where K <= 32 (at most 32 operations)',
    spaceAuxiliary: 'O(1) in-place bitwise registers',
    worstCaseCondition: 'All bits set in integer (e.g. 0xFFFFFFFF requires 32 operations)',
  },
  theory: {
    overview:
      "Brian Kernighan's algorithm computes the Hamming weight (popcount) of an integer in O(K) time, where K is the number of 1-bits, skipping all 0-bits entirely.",
    whyItWorks:
      'Subtracting 1 from n flips all the bits up to and including the rightmost set bit. Therefore, bitwise AND-ing n with (n - 1) clears precisely the rightmost set bit in a single step.',
    invariant:
      'Bit Depletion Invariant: In each iteration, n = n & (n - 1) strictly clears the least significant set bit, decrementing the popcount by exactly 1.',
    pitfalls: [
      'Using naive 32-bit loop checking each bit when K << 32.',
      'Signed integer sign bit extension in languages with signed 32-bit integers.',
    ],
  },
  presets: [
    {
      id: 'number-53',
      label: 'Number 53: binary 00110101 (4 set bits)',
      description: 'Clears bits at positions 0, 2, 4, 5 in exactly 4 steps',
      data: { n: 53 },
    },
    {
      id: 'power-of-two',
      label: 'Power of Two: 64 (01000000 -> 1 step)',
      description: 'Single operation verifies whether a number is a power of 2',
      data: { n: 64 },
    },
    {
      id: 'dense-127',
      label: 'Dense: 127 (01111111 -> 7 set bits)',
      description: 'Successively peels off contiguous 1s',
      data: { n: 127 },
    },
  ],
  defaultInput: { n: 53 },
  codeSnippets: {
    cpp: `int countSetBits(unsigned int n) {
    int count = 0;
    while (n > 0) {
        n = n & (n - 1);
        count++;
    }
    return count;
}`,
    python: `def count_set_bits(n: int) -> int:
    count = 0
    while n > 0:
        n = n & (n - 1)
        count += 1
    return count`,
    typescript: `function countSetBits(n: number): number {
    let count = 0;
    let val = n >>> 0;
    while (val > 0) {
        val = val & (val - 1);
        count++;
    }
    return count;
}`,
    java: `public int countSetBits(int n) {
    int count = 0;
    while (n != 0) {
        n = n & (n - 1);
        count++;
    }
    return count;
}`,
    pseudocode: `function countSetBits(n):
    count = 0
    while n > 0:
        n = n AND (n - 1)
        count = count + 1
    return count`,
  },

  generateTimeline: (input: { n: number }): ExecutionFrame<CountSetBitsState>[] => {
    const initialN = Math.max(0, Math.min(typeof input.n === 'number' ? input.n : 53, 255));
    let n = initialN;
    let count = 0;

    const frames: ExecutionFrame<CountSetBitsState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Brian Kernighan's algorithm for n = ${n} (binary: ${n.toString(2).padStart(8, '0')}). Bit counter = 0.`,
      variables: { n, binary: n.toString(2).padStart(8, '0'), count: 0 },
      callStack: [{ name: `countSetBits(n=${n})`, params: { n }, line: 2, isCurrent: true }],
      state: {
        initialN,
        n,
        nMinus1: n > 0 ? n - 1 : 0,
        clearedBitPos: -1,
        bitCount: 0,
        isComplete: n === 0,
      },
    });

    let stepNum = 1;
    while (n > 0) {
      const nMinus1 = n - 1;
      const nextN = n & nMinus1;

      // Find the position of the bit cleared
      const diff = n ^ nextN;
      let bitPos = 0;
      let temp = diff;
      while (temp > 1) {
        temp >>= 1;
        bitPos++;
      }

      // Sub-frame 1: Loop condition check
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `Iteration ${stepNum}: Checking while condition: n (${n}) > 0 is TRUE. Proceed to eliminate rightmost set bit.`,
        soundCue: { type: 'compare' },
        callStack: [
          { name: `countSetBits(n=${initialN})`, params: { n, count }, line: 3, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: { n, binary: n.toString(2).padStart(8, '0'), count },
        conditionEval: { expr: `n (${n}) > 0`, result: true },
        state: {
          initialN,
          n,
          nMinus1: n > 0 ? n - 1 : 0,
          clearedBitPos: -1,
          bitCount: count,
          isComplete: false,
        },
      });

      // Sub-frame 2: Compute n - 1
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Compute n - 1 = ${nMinus1} (${nMinus1.toString(2).padStart(8, '0')}). Borrowing flips the rightmost 1 at 2^${bitPos} to 0, and all trailing 0s to 1s.`,
        soundCue: { type: 'step' },
        callStack: [
          { name: 'computeMinusOne()', params: { n, nMinus1, bitPos }, line: 4, isCurrent: true },
          { name: `countSetBits(n=${initialN})`, params: { n }, line: 4 },
        ],
        variables: { n, nMinus1, 'binary(n)': n.toString(2).padStart(8, '0'), 'binary(n-1)': nMinus1.toString(2).padStart(8, '0') },
        state: {
          initialN,
          n,
          nMinus1,
          clearedBitPos: bitPos,
          bitCount: count,
          isComplete: false,
        },
      });

      // Sub-frame 3: Execute n & (n - 1)
      count++;
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Bitwise AND (n & (n - 1)) = ${nextN} (${nextN.toString(2).padStart(8, '0')}). Successfully extinguished bit at 2^${bitPos}! Increment count to ${count}.`,
        soundCue: { type: 'swap' },
        isMilestone: true,
        milestoneTitle: `Extinguished Bit 2^${bitPos}`,
        callStack: [
          { name: `clearRightmostBit()`, params: { clearedPos: bitPos, nextN, count }, line: 4, isCurrent: true },
          { name: `countSetBits(n=${initialN})`, params: { n }, line: 4 },
        ],
        variables: {
          nBefore: n,
          nMinus1,
          bitwiseAND: nextN,
          clearedBitPower: `2^${bitPos}`,
          count,
        },
        conditionEval: { expr: `n & (n - 1) == ${nextN}`, result: true },
        state: {
          initialN,
          n: nextN,
          nMinus1,
          clearedBitPos: bitPos,
          bitCount: count,
          isComplete: nextN === 0,
        },
      });

      n = nextN;
      stepNum++;
    }

    // Step: While loop termination check
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Checking while condition: n (${n}) > 0 is FALSE. All set bits have been cleared.`,
      soundCue: { type: 'compare' },
      callStack: [{ name: `countSetBits(n=${initialN})`, params: { n: 0, count }, line: 3, isCurrent: true }],
      variables: { n: 0, finalCount: count },
      conditionEval: { expr: 'n (0) > 0', result: false },
      state: {
        initialN,
        n: 0,
        nMinus1: 0,
        clearedBitPos: -1,
        bitCount: count,
        isComplete: true,
      },
    });

    // Final Completion Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `🎉 All set bits eliminated (n = 0)! Total popcount for ${initialN} is ${count} set bit${count === 1 ? '' : 's'}. Algorithm ran in O(k) steps where k = number of set bits.`,
      soundCue: { type: 'complete' },
      isMilestone: true,
      milestoneTitle: `Popcount = ${count}`,
      variables: {
        originalN: initialN,
        totalSetBits: count,
        timeComplexity: `O(${count}) operations`,
      },
      callStack: [{ name: 'complete()', params: { totalSetBits: count }, line: 6, isCurrent: true }],
      state: {
        initialN,
        n: 0,
        nMinus1: 0,
        clearedBitPos: -1,
        bitCount: count,
        isComplete: true,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<CountSetBitsState>) => {
    const { initialN, n, nMinus1, clearedBitPos, bitCount, isComplete } = frame.state;

    const renderBits = (val: number, highlightPos: number = -1) => {
      const bitStr = (val >>> 0).toString(2).padStart(8, '0');
      return (
        <div className="flex items-center gap-1.5 font-mono">
          {bitStr.split('').map((bit, idx) => {
            const pos = 7 - idx; // power index 7..0
            const isTarget = pos === highlightPos;
            const isOne = bit === '1';
            return (
              <div
                key={idx}
                className={`w-9 h-11 rounded-xl flex flex-col items-center justify-center font-bold text-sm border transition-all duration-200 ${
                  isTarget
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 scale-110 shadow-lg shadow-amber-500/20'
                    : isOne
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                    : 'bg-slate-900 text-slate-600 border-slate-800'
                }`}
              >
                <span>{bit}</span>
                <span className="text-[9px] text-slate-500 font-normal">2^{pos}</span>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-4xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Input: <strong className="text-white">N = {initialN}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Current: <strong className="text-white">n = {n}</strong>
            </div>
          </div>

          <div
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold border ${
              isComplete
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Set Bits Count: <strong className="text-white text-sm">{bitCount}</strong>
          </div>
        </div>

        {/* Binary Register Cards */}
        <div className="w-full space-y-4 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          {/* n Register */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-mono font-bold text-slate-300 min-w-28">
              Register <span className="text-cyan-400">n</span> ({n})
            </div>
            {renderBits(n, clearedBitPos)}
          </div>

          {/* n - 1 Register */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs font-mono font-bold text-slate-300 min-w-28">
              Register <span className="text-amber-400">n - 1</span> ({nMinus1})
            </div>
            {renderBits(nMinus1, clearedBitPos)}
          </div>

          {/* Operation Explanation Banner */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <span>Operation: n & (n - 1)</span>
            {clearedBitPos >= 0 ? (
              <span className="text-amber-300 font-bold">
                Cleared least significant set bit at index 2^{clearedBitPos}!
              </span>
            ) : (
              <span className="text-slate-400">Waiting or complete</span>
            )}
          </div>
        </div>
      </div>
    );
  },
};
