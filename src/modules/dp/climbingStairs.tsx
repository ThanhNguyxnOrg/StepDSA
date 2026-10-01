import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface StairState {
  n: number;
  dpTable: (number | null)[];
  currentStair: number;
  highlightedIndices: number[];
}

export const climbingStairsModule: AlgorithmModule<number, StairState> = {
  id: 'climbing-stairs',
  title: 'Fibonacci & Climbing Stairs (DP Foundations)',
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) (reducible to O(1))',
    worstCaseCondition: 'Iterates sequentially up to step N',
  },
  theory: {
    overview:
      'You are climbing a staircase with N steps. Each time you can climb either 1 or 2 steps. In how many distinct ways can you climb to the top? This is isomorphic to the Fibonacci sequence: dp[i] = dp[i - 1] + dp[i - 2].',
    whyItWorks:
      'To reach step i, you could have only arrived from step (i - 1) taking a 1-step leap, or from step (i - 2) taking a 2-step leap. Since these two preceding events are mutually exclusive and collectively exhaustive, the total distinct ways is their sum.',
    invariant:
      'Optimal Substructure Invariant: dp[i] holds the exact total number of distinct valid paths from step 0 to step i.',
    pitfalls: [
      'Naive recursion without memoization exhibits O(2^N) exponential time complexity.',
      'Base case setup: dp[0] = 1 (1 way to stay at ground) or dp[1] = 1, dp[2] = 2.',
    ],
  },
  presets: [
    {
      id: 'n-5',
      label: '5 Steps (Fibonacci 8)',
      description: 'Standard 5-step staircase: 8 distinct paths',
      data: 5,
    },
    {
      id: 'n-7',
      label: '7 Steps (Fibonacci 21)',
      description: 'Larger progression up to 21 combinations',
      data: 7,
    },
  ],
  defaultInput: 5,
  codeSnippets: {
    python: `def climb_stairs(n):
    if n <= 2: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
    typescript: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  const dp: number[] = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; ++i) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`,
    cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    vector<int> dp(n + 1, 0);
    dp[1] = 1; dp[2] = 2;
    for (int i = 3; i <= n; ++i) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
    java: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int[] dp = new int[n + 1];
    dp[1] = 1; dp[2] = 2;
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
    pseudocode: `function climbStairs(n):
    dp[1] <- 1, dp[2] <- 2
    for i from 3 to n:
        dp[i] <- dp[i - 1] + dp[i - 2]
    return dp[n]`,
  },
  generateTimeline: (input: number) => {
    const n = Math.max(2, Math.min(input, 8));
    const dp: (number | null)[] = new Array(n + 1).fill(null);

    const frames: ExecutionFrame<StairState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized Climbing Stairs DP table of size ${n + 1} for n = ${n} steps.`,
      isMilestone: true,
      milestoneTitle: 'Climbing Stairs Initialized',
      soundCue: { type: 'start' },
      variables: { n, dpSize: n + 1 },
      callStack: [{ name: 'climbStairs', params: { n }, line: 2, isCurrent: true }],
      conditionEval: { expr: `n >= 1`, result: true },
      state: { n, dpTable: [...dp], currentStair: 0, highlightedIndices: [] },
    });

    // Base cases
    dp[1] = 1;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      explanation: 'Base case dp[1] = 1: Exactly 1 way to climb 1 step ([1]).',
      isMilestone: true,
      milestoneTitle: 'Base Case dp[1] = 1',
      soundCue: { type: 'step' },
      variables: { 'dp[1]': 1, n },
      callStack: [{ name: 'baseCase', params: { step: 1, ways: 1 }, line: 4, isCurrent: true }],
      conditionEval: { expr: `n >= 1`, result: true },
      state: { n, dpTable: [...dp], currentStair: 1, highlightedIndices: [1] },
    });

    dp[2] = 2;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 5,
      explanation: 'Base case dp[2] = 2: Exactly 2 ways to reach step 2 ([1+1] or [2]).',
      isMilestone: true,
      milestoneTitle: 'Base Case dp[2] = 2',
      soundCue: { type: 'step' },
      variables: { 'dp[1]': 1, 'dp[2]': 2, n },
      callStack: [{ name: 'baseCase', params: { step: 2, ways: 2 }, line: 5, isCurrent: true }],
      conditionEval: { expr: `n >= 2`, result: n >= 2 },
      state: { n, dpTable: [...dp], currentStair: 2, highlightedIndices: [2] },
    });

    // Transition loop
    for (let i = 3; i <= n; ++i) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Evaluating step ${i}: sum contributions from dp[${i - 1}] (${dp[i - 1]}) and dp[${i - 2}] (${dp[i - 2]}).`,
        soundCue: { type: 'compare' },
        variables: { i, 'dp[i-1]': dp[i - 1], 'dp[i-2]': dp[i - 2] },
        callStack: [{ name: 'computeStep', params: { i }, line: 6, isCurrent: true }],
        conditionEval: { expr: `i <= n (${i} <= ${n})`, result: true },
        state: { n, dpTable: [...dp], currentStair: i, highlightedIndices: [i - 1, i - 2] },
      });

      dp[i] = (dp[i - 1] ?? 0) + (dp[i - 2] ?? 0);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Computed dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]} distinct ways.`,
        isMilestone: true,
        milestoneTitle: `dp[${i}] = ${dp[i]} Ways`,
        soundCue: { type: 'swap' },
        variables: { i, 'dp[i]': dp[i], prev1: dp[i - 1], prev2: dp[i - 2] },
        callStack: [{ name: 'recordWays', params: { step: i, ways: dp[i] }, line: 7, isCurrent: true }],
        conditionEval: { expr: `dp[${i}] == dp[${i - 1}] + dp[${i - 2}]`, result: true },
        state: { n, dpTable: [...dp], currentStair: i, highlightedIndices: [i] },
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `Reached top step ${n}! Total distinct climbing combinations = ${dp[n]}.`,
      isMilestone: true,
      milestoneTitle: `Total Ways: ${dp[n]}`,
      soundCue: { type: 'complete' },
      variables: { n, totalWays: dp[n], completed: true },
      callStack: [{ name: 'climbStairs.done', params: { totalWays: dp[n] }, line: 8, isCurrent: true }],
      conditionEval: { expr: `i > n`, result: true },
      state: { n, dpTable: [...dp], currentStair: n, highlightedIndices: [n] },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<StairState>) => {
    const { n, dpTable, currentStair, highlightedIndices } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* HUD */}
        <div className="flex items-center gap-4 mb-8">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Total Steps: <span className="text-cyan-400 font-bold">{n}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Current Step: <span className="text-amber-400 font-bold">{currentStair}</span>
          </div>
          {dpTable[n] !== null && (
            <div className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500 text-xs font-mono text-emerald-300 font-bold animate-pulse">
              RESULT: {dpTable[n]} Distinct Ways
            </div>
          )}
        </div>

        {/* Staircase Graphic */}
        <div className="flex items-end justify-center gap-2 max-w-2xl w-full min-h-[220px] px-4 pb-2">
          {Array.from({ length: n }, (_, i) => i + 1).map((stepNum) => {
            const isCurrent = stepNum === currentStair;
            const isHighlighted = highlightedIndices.includes(stepNum);
            const val = dpTable[stepNum];

            return (
              <div key={stepNum} className="flex-1 flex flex-col items-center justify-end">
                {/* Ways Badge */}
                {val !== null && (
                  <span className="mb-2 text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 shadow">
                    {val} ways
                  </span>
                )}

                {/* Stair Bar */}
                <div
                  style={{ height: `${stepNum * 26 + 30}px` }}
                  className={`w-full rounded-t-xl flex flex-col items-center justify-between p-2 border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-950/70 text-amber-200 ring-2 ring-amber-400/40'
                      : isHighlighted
                      ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200'
                      : val !== null
                      ? 'border-blue-500/40 bg-slate-900/90 text-slate-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-600'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">Step {stepNum}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
