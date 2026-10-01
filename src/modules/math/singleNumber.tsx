import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SingleNumberState {
  nums: number[];
  currentIndex: number;
  currentXor: number;
  singleFound?: number;
}

export const singleNumberModule: AlgorithmModule<{ nums: number[] }, SingleNumberState> = {
  id: 'single-number',
  title: 'Single Number & XOR Cancellation O(N)',
  category: 'math',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1) bitwise accumulator',
    worstCaseCondition: 'Strictly linear pass through array',
  },
  theory: {
    overview:
      'Given a non-empty array of integers where every element appears twice except for one unique element, find that single element in linear time and O(1) space.',
    whyItWorks:
      'Bitwise XOR is commutative and associative, with the properties: x ^ x = 0 and x ^ 0 = x. Accumulating XOR across all numbers cancels duplicate pairs to 0, isolating the single unique element.',
    invariant:
      'XOR Cancellation Invariant: accumulator = (x1 ^ x1) ^ (x2 ^ x2) ^ ... ^ target = 0 ^ target = target.',
    pitfalls: [
      'Assuming numbers appear an even number of times; does not work if duplicates appear 3 times (that requires bit counting modulo 3).',
    ],
  },
  presets: [
    {
      id: 'classic-single',
      label: 'Classic: [4, 1, 2, 1, 2] -> 4',
      description: 'Pairs (1, 1) and (2, 2) cancel out',
      data: { nums: [4, 1, 2, 1, 2] },
    },
    {
      id: 'short-array',
      label: 'Small: [2, 2, 1] -> 1',
      description: 'Single pair cancellation',
      data: { nums: [2, 2, 1] },
    },
    {
      id: 'larger-set',
      label: '7 Elements: [7, 3, 5, 4, 5, 3, 4] -> 7',
      description: 'Multiple pairs interleaved',
      data: { nums: [7, 3, 5, 4, 5, 3, 4] },
    },
  ],
  defaultInput: { nums: [4, 1, 2, 1, 2] },
  codeSnippets: {
    cpp: `int singleNumber(const vector<int>& nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}`,
    python: `def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
    typescript: `function singleNumber(nums: number[]): number {
    let result = 0;
    for (const num of nums) {
        result ^= num;
    }
    return result;
}`,
    java: `public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}`,
    pseudocode: `function singleNumber(nums):
    result = 0
    for each num in nums:
        result = result XOR num
    return result`,
  },

  generateTimeline: (input: { nums: number[] }): ExecutionFrame<SingleNumberState>[] => {
    const raw = input?.nums?.length ? input.nums : [4, 1, 2, 1, 2];
    const nums = [...raw];
    const n = nums.length;

    const frames: ExecutionFrame<SingleNumberState>[] = [];
    let acc = 0;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: 'Initialize XOR Accumulator',
      explanation: `Initialize XOR accumulator = 0 (binary: 0000_0000). Processing array of ${n} elements using bitwise identity x ^ x = 0 and x ^ 0 = x.`,
      variables: { accumulator: 0, arrayLength: n, bitPattern: '00000000' },
      conditionEval: { expr: 'accumulator === 0', result: true },
      soundCue: { type: 'step' },
      callStack: [{ name: 'singleNumber()', params: { n }, line: 2, isCurrent: true }],
      state: {
        nums,
        currentIndex: -1,
        currentXor: 0,
      },
    });

    const seenValues = new Set<number>();

    for (let i = 0; i < n; i++) {
      const val = nums[i];
      const prev = acc;
      const isSecondOccurrence = seenValues.has(val);
      seenValues.add(val);

      // Frame A: Inspect & prepare bitwise XOR
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        explanation: `Inspect nums[${i}] = ${val} (binary: ${val.toString(2).padStart(4, '0')}). ${
          isSecondOccurrence
            ? `Value ${val} has appeared before! This XOR operation will CANCEL out its bits to zero.`
            : `First time encountering ${val}. This XOR operation will introduce its bits into the accumulator.`
        }`,
        variables: {
          index: i,
          numValue: val,
          currentAccumulator: prev,
          isDuplicateMatch: isSecondOccurrence,
        },
        conditionEval: { expr: `isDuplicate(nums[${i}])`, result: isSecondOccurrence },
        soundCue: { type: 'compare' },
        callStack: [
          { name: `inspect(${val})`, params: { index: i, val }, line: 3, isCurrent: true },
          { name: 'singleNumber()', params: { n }, line: 2 },
        ],
        state: {
          nums,
          currentIndex: i,
          currentXor: prev,
        },
      });

      // Frame B: Execute XOR bitwise operation
      acc ^= val;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        isMilestone: isSecondOccurrence,
        milestoneTitle: isSecondOccurrence ? `Pair (${val}, ${val}) Cancelled` : undefined,
        explanation: `Execute ${prev} ^ ${val} -> New accumulator = ${acc} (binary: ${acc.toString(2).padStart(4, '0')}). ${
          isSecondOccurrence
            ? `Duplicate pair of ${val}'s successfully neutralized!`
            : `Bits of ${val} merged into accumulator.`
        }`,
        variables: {
          index: i,
          value: val,
          previousXor: prev,
          newXor: acc,
          binaryOperation: `${prev.toString(2).padStart(4, '0')} ^ ${val.toString(2).padStart(4, '0')} = ${acc.toString(2).padStart(4, '0')}`,
        },
        conditionEval: { expr: `${prev} ^ ${val}`, result: acc },
        soundCue: { type: isSecondOccurrence ? 'swap' : 'insert' },
        callStack: [
          { name: `applyXor(${val})`, params: { prev, val, acc }, line: 4, isCurrent: true },
          { name: 'singleNumber()', params: { n }, line: 2 },
        ],
        state: {
          nums,
          currentIndex: i,
          currentXor: acc,
        },
      });
    }

    // Final Completion Frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      isMilestone: true,
      milestoneTitle: `Single Number Found: ${acc}`,
      explanation: `All duplicate elements have cancelled out into 0! The only surviving non-zero residue is the unique element: ${acc}.`,
      variables: { singleUniqueNumber: acc, finalBits: acc.toString(2).padStart(4, '0') },
      conditionEval: { expr: 'traversalComplete', result: true },
      soundCue: { type: 'complete' },
      callStack: [{ name: 'complete()', params: { result: acc }, line: 6, isCurrent: true }],
      state: {
        nums,
        currentIndex: n,
        currentXor: acc,
        singleFound: acc,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<SingleNumberState>) => {
    const { nums, currentIndex, currentXor, singleFound } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Array: <strong className="text-white">[{nums.join(', ')}]</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              XOR Accumulator: <strong className="text-white">{currentXor}</strong> ({currentXor.toString(2).padStart(8, '0')})
            </div>
          </div>

          {singleFound !== undefined && (
            <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold">
              Unique Element: {singleFound}
            </div>
          )}
        </div>

        {/* Array Cards with Active Pointer */}
        <div className="w-full flex items-center justify-center gap-3 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl flex-wrap">
          {nums.map((val, idx) => {
            const isProcessed = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center transition-all duration-200 ${
                  isCurrent ? 'scale-110' : ''
                }`}
              >
                <div
                  className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-lg border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : isProcessed
                      ? 'bg-slate-900/60 text-slate-400 border-slate-800'
                      : 'bg-slate-900 text-white border-slate-700'
                  }`}
                >
                  <span>{val}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {val.toString(2).padStart(4, '0')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">
                  {isCurrent ? '▲ curr' : `[${idx}]`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
