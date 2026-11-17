import { AlgorithmModule, ExecutionFrame, PredictionCheckpoint, StepPedagogy } from '../../core/types';

export interface StairState {
  n: number;
  /** dp[i] = number of distinct ways to reach step i (1-indexed; dp[0] stays 0). */
  dpTable: (number | null)[];
  currentStair: number;
  phase: 'init' | 'base' | 'fill' | 'done';
  actionType: 'INIT' | 'ALLOC' | 'BASE' | 'ONE' | 'TWO' | 'SUM' | 'NONE';
  /** Indices whose values feed the current computation (i-1, i-2). */
  highlightedIndices: number[];
  candidate: { i: number; one: number; two: number; result: number } | null;
  stats: { sums: number };
}

const MAX_STEPS = 10;

interface NormalisedInput {
  n: number;
  notes: string[];
}

function normalise(input: number | undefined): NormalisedInput {
  const notes: string[] = [];
  let raw = 5;
  if (typeof input === 'number' && Number.isFinite(input)) {
    raw = input;
  } else {
    notes.push('invalid step count, so the default n = 5 is used');
  }
  const rounded = Math.round(raw);
  const n = Math.max(1, Math.min(MAX_STEPS, rounded));
  if (n !== rounded) {
    notes.push(`steps clamped from ${rounded} to ${n} (1..${MAX_STEPS})`);
  }
  return { n, notes };
}

function fibWays(n: number): number {
  let a = 1;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return n <= 1 ? 1 : b;
}

export const climbingStairsModule: AlgorithmModule<number, StairState> = {
  id: 'climbing-stairs',
  title: 'Fibonacci & Climbing Stairs (DP Foundations)',
  category: 'dynamic-programming',
  difficulty: 'Beginner',
  relatedModules: [
    { id: 'house-robber', label: 'House Robber (same recurrence)' },
    { id: 'recursion-trees', label: 'Recursion Tree → Memo DAG' },
    { id: 'unique-paths', label: 'Unique Paths (grid DP)' },
  ],
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(N) dp table (O(1) with two rolling variables)',
    worstCaseCondition: 'One linear pass adds the two previous answers for every step',
  },
  theory: {
    overview:
      'A staircase has N steps; each move climbs exactly 1 or 2 steps. How many distinct move sequences reach the top? The answer is the Fibonacci sequence: ways(n) = ways(n-1) + ways(n-2).',
    whyItWorks:
      'The final move into step i is either a 1-step from i-1 or a 2-step from i-2. Those two cases are mutually exclusive (different last moves) and exhaustive (no other move exists), so the counts add with no double counting.',
    invariant:
      'dp[i] holds the exact number of distinct 1/2-step sequences from the ground to step i; dp[1] = 1 ([1]) and dp[2] = 2 ([1+1], [2]).',
    pitfalls: [
      'Naive recursion recomputes the same subproblems and explodes to O(2^N) — the whole point of the DP table is to compute each dp[i] once.',
      'The guard `n <= 2` returns n directly: 1 step has 1 way, 2 steps have 2 ways, so the loop only runs from i = 3.',
      'dp is 1-indexed here and dp[0] stays 0 — the "ground" is not a step; alternative formulations use dp[0] = 1 and shift everything.',
      'Counts grow like Fibonacci: ways(10) = 89, ways(40) already overflows 32-bit integers (102,334,155 fits, but ways(47) does not).',
    ],
    steps: [
      'Guard: if n <= 2 the answer is n itself (1 or 2).',
      'Allocate dp[0..n] = 0 (1-indexed).',
      'Write dp[1] = 1 and dp[2] = 2 as the base cases.',
      'For i = 3..n: dp[i] = dp[i-1] + dp[i-2] — one way to read each predecessor.',
      'The answer is dp[n].',
    ],
    watchOut: [
      'This is pure counting: there is no max, no choice to optimise, and no reconstruction — the table itself is the answer.',
      'Every dp[i] is used twice (by i+1 and i+2), which is exactly why memoisation beats recursion.',
    ],
  },
  defaultInput: 5,
  presets: [
    {
      id: 'n-5',
      label: '5 Steps (8 ways)',
      description: 'Standard 5-step staircase — 8 distinct move sequences (Fibonacci)',
      data: 5,
    },
    {
      id: 'n-7',
      label: '7 Steps (21 ways)',
      description: 'Longer staircase — 21 combinations, every dp[i] feeds the next two cells',
      data: 7,
    },
    {
      id: 'n-2',
      label: '2 Steps (guard)',
      description: 'n = 2 hits the `n <= 2` guard: the loop never runs and the answer is 2 directly',
      data: 2,
    },
  ],
  codeSnippets: {
    pseudocode: `function climbStairs(n):
    if n <= 2: return n
    dp = array of size n + 1 filled with 0
    dp[1] = 1
    dp[2] = 2
    for i = 3 to n:
        one = dp[i - 1]
        two = dp[i - 2]
        dp[i] = one + two
    return dp[n]`,
    python: `def climb_stairs(n):
    if n <= 2: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        one = dp[i - 1]
        two = dp[i - 2]
        dp[i] = one + two
    return dp[n]`,
    typescript: `function climbStairs(n: number): number {
  if (n <= 2) return n;
  const dp: number[] = new Array(n + 1).fill(0);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    const one = dp[i - 1];
    const two = dp[i - 2];
    dp[i] = one + two; }
  return dp[n]; }`,
    cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    vector<int> dp(n + 1, 0);
    dp[1] = 1;
    dp[2] = 2;
    for (int i = 3; i <= n; i++) {
        int one = dp[i - 1];
        int two = dp[i - 2];
        dp[i] = one + two; }
    return dp[n]; }`,
    java: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int[] dp = new int[n + 1];
    dp[1] = 1;
    dp[2] = 2;
    for (int i = 3; i <= n; i++) {
        int one = dp[i - 1];
        int two = dp[i - 2];
        dp[i] = one + two; }
    return dp[n]; }`,
  },

  generateTimeline: (input: number) => {
    const { n, notes } = normalise(input);
    const dp: (number | null)[] = new Array(n + 1).fill(null);

    const frames: ExecutionFrame<StairState>[] = [];
    let phase: StairState['phase'] = 'init';
    let currentStair = 0;
    let actionType: StairState['actionType'] = 'INIT';
    let highlightedIndices: number[] = [];
    let candidate: StairState['candidate'] = null;
    const stats = { sums: 0 };

    let firstSumMilestone = false;
    let sumCheckpointAdded = false;

    const snapshot = (): StairState => ({
      n,
      dpTable: [...dp],
      currentStair,
      phase,
      actionType,
      highlightedIndices: [...highlightedIndices],
      candidate: candidate ? { ...candidate } : null,
      stats: { ...stats },
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      pedagogy: StepPedagogy;
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<StairState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<StairState>['soundCue'];
      checkpoint?: PredictionCheckpoint;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        state: snapshot(),
        callStack: [
          { name: 'climbStairs(n)', params: { n, i: currentStair }, line: opts.codeLine, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: { comparisons: stats.sums, swaps: 0, accesses: stats.sums * 2, lookups: 0 },
        invariantStatus: {
          label:
            phase === 'init'
              ? 'The table starts empty; dp is 1-indexed and dp[0] stays 0'
              : phase === 'base'
                ? `dp[${currentStair}] = ${dp[currentStair] ?? '—'} base case`
                : phase === 'fill'
                  ? `dp[${currentStair}] = ${dp[currentStair] ?? '—'} = ways to reach step ${currentStair}`
                  : `Answer: dp[${n}] = ${dp[n] ?? '—'} distinct ways`,
          isValid: true,
        },
        pedagogy: opts.pedagogy,
        ...(opts.milestone ? { isMilestone: true, milestoneTitle: opts.milestone } : {}),
        ...(opts.soundCue ? { soundCue: opts.soundCue } : {}),
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
      });
    };

    pushFrame({
      codeLine: 2,
      action: 'INIT',
      explanation:
        `n = ${n} step(s). The guard n <= 2 is ${n <= 2 ? 'TRUE — the answer is n directly and the loop never runs' : 'false, so the DP fills the table from the base cases upward'}.` +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'n <= 2', condition: `${n} <= 2`, result: n <= 2 },
      variables: { n, expectedWays: fibWays(n) },
      soundCue: 'start',
      pedagogy: {
        what: `A staircase of ${n} step(s), climbed with moves of exactly 1 or 2 steps.`,
        why: 'The guard answers the trivial streets immediately: 1 step has one way, 2 steps have two ([1+1] and [2]).',
        whatNext: n <= 2 ? `Return ${n} directly.` : 'Allocate the dp table and write the two base cases.',
      },
    });

    if (n <= 2) {
      phase = 'done';
      currentStair = n;
      pushFrame({
        codeLine: 2,
        action: 'SMALL_DONE',
        explanation: `Guard hit: n = ${n} returns ${n} directly — ${n === 1 ? 'the single move [1]' : 'the moves [1+1] and [2]'}. No table, no loop.`,
        conditionEval: { expr: 'return n', condition: `${n}`, result: n },
        variables: { n, totalWays: n, moves: n === 1 ? '[1]' : '[1+1], [2]' },
        milestone: 'Top Reached',
        soundCue: 'finish',
        pedagogy: {
          what: `The answer ${n} never touches the DP table.`,
          why: 'Base cases ARE the recurrence at the bottom: ways(1) = 1 and ways(2) = 2 are direct observations.',
          whatNext: 'Try a larger preset to watch the Fibonacci pattern build up.',
        },
      });
      frames.forEach((frame) => {
        frame.totalSteps = frames.length;
      });
      return frames;
    }

    phase = 'base';
    currentStair = 1;
    actionType = 'ALLOC';
    highlightedIndices = [];
    pushFrame({
      codeLine: 3,
      action: 'ALLOC',
      explanation: `Allocate dp[0..${n}] = 0. The table is 1-indexed: dp[0] represents the ground and stays 0 because the ground is not a step.`,
      variables: { dp: `[0 × ${n + 1}]`, indexing: '1-based' },
      soundCue: 'step',
      pedagogy: {
        what: `A table of ${n + 1} cell(s); index 0 is reserved for the ground.`,
        why: 'Keeping 1-indexing makes dp[i] mean "ways to reach step i" with no off-by-one in the recurrence.',
        whatNext: 'Write the base cases dp[1] = 1 and dp[2] = 2.',
      },
    });

    dp[1] = 1;
    actionType = 'BASE';
    currentStair = 1;
    highlightedIndices = [1];
    pushFrame({
      codeLine: 4,
      action: 'BASE_ONE',
      explanation: 'dp[1] = 1: exactly one way to stand on step 1 — the single move [1].',
      conditionEval: { expr: 'dp[1] = 1', condition: '1', result: 1, formatted: 'dp[1] = 1' },
      variables: { 'dp[1]': 1, moveSequences: '[1]' },
      soundCue: 'step',
      pedagogy: {
        what: 'The first base case is written.',
        why: 'A 1-step staircase has exactly one move sequence; every longer chain will be built from observations like this.',
        whatNext: 'Write dp[2] = 2.',
      },
    });

    dp[2] = 2;
    actionType = 'BASE';
    currentStair = 2;
    highlightedIndices = [2];
    pushFrame({
      codeLine: 5,
      action: 'BASE_TWO',
      explanation: 'dp[2] = 2: two distinct sequences reach step 2 — [1+1] and [2].',
      conditionEval: { expr: 'dp[2] = 2', condition: '2', result: 2, formatted: 'dp[2] = 2' },
      variables: { 'dp[1]': 1, 'dp[2]': 2, moveSequences: '[1+1], [2]' },
      milestone: 'Base Cases Set',
      soundCue: 'step',
      checkpoint: {
        id: 'climbing-stairs-why-two',
        question: 'Why does dp[2] equal 2 and not 1?',
        options: [
          'Two distinct move sequences exist: [1+1] and [2]',
          'Because dp[1] is counted twice',
          'Because a 2-step move counts as two moves',
        ],
        correctIndex: 0,
        explanation: 'A path is a sequence of moves, and [1+1] (two small steps) differs from [2] (one big step) — two sequences, so the count is 2.',
        hint: 'Count the ways as sequences of moves, not as move sizes.',
      },
      pedagogy: {
        what: 'The second base case is written: dp[2] = 2.',
        why: 'These two cells are the seed of the Fibonacci pattern; the guard already handled anything smaller.',
        whatNext: `Start the loop at i = 3: read dp[2] and dp[1], then sum them.`,
      },
    });

    phase = 'fill';
    for (let i = 3; i <= n; i++) {
      currentStair = i;
      actionType = 'ONE';
      highlightedIndices = [i - 1];
      candidate = null;

      pushFrame({
        codeLine: 7,
        action: 'READ_ONE',
        explanation: `Step ${i}, branch one: arrive with a 1-step move from step ${i - 1}, contributing dp[${i - 1}] = ${dp[i - 1]} sequences (each extended by one small step).`,
        variables: { i, 'dp[i-1]': dp[i - 1], branch: '1-step' },
        soundCue: 'step',
        pedagogy: {
          what: `The 1-step branch contributes ${dp[i - 1]} sequences.`,
          why: 'Appending a 1-step move to every sequence that reached step i-1 gives all sequences whose last move is small.',
          whatNext: `Read the 2-step branch from dp[${i - 2}].`,
        },
      });

      actionType = 'TWO';
      highlightedIndices = [i - 2];
      pushFrame({
        codeLine: 8,
        action: 'READ_TWO',
        explanation: `Step ${i}, branch two: arrive with a 2-step move from step ${i - 2}, contributing dp[${i - 2}] = ${dp[i - 2]} sequences (each extended by one big step).`,
        conditionEval: { expr: `i - 2 >= 1`, condition: `${i - 2} >= 1`, result: true },
        variables: { i, 'dp[i-2]': dp[i - 2], branch: '2-step' },
        soundCue: 'compare',
        pedagogy: {
          what: `The 2-step branch contributes ${dp[i - 2]} sequences.`,
          why: 'Appending a 2-step move to every sequence at step i-2 gives all sequences whose last move is big — disjoint from the small-move group.',
          whatNext: `Sum the two branches into dp[${i}].`,
        },
      });

      const one = dp[i - 1] ?? 0;
      const two = dp[i - 2] ?? 0;
      dp[i] = one + two;
      stats.sums++;
      actionType = 'SUM';
      highlightedIndices = [i];
      candidate = { i, one, two, result: dp[i]! };

      pushFrame({
        codeLine: 9,
        action: 'SUM_STEP',
        explanation: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${one} + ${two} = ${dp[i]} distinct move sequences.`,
        conditionEval: {
          expr: `dp[${i - 1}] + dp[${i - 2}]`,
          condition: `${one} + ${two}`,
          result: dp[i]!,
          formatted: `dp[${i}] = ${dp[i]}`,
        },
        variables: { i, one, two, 'dp[i]': dp[i], sums: stats.sums },
        milestone: !firstSumMilestone ? 'First Sum' : undefined,
        soundCue: 'success',
        checkpoint:
          !sumCheckpointAdded
            ? {
                id: 'climbing-stairs-fib-sum',
                question: `dp[${i}] counts all move sequences reaching step ${i}. The 1-step branch holds ${one} sequences and the 2-step branch ${two}. What is dp[${i}]?`,
                options: [
                  `${one + two} — the two disjoint groups add up`,
                  `${Math.max(one, two)} — only the larger group survives`,
                  `${one * two} — every group pairs with every other`,
                ],
                correctIndex: 0,
                explanation: `The last move partitions all sequences into small-move and big-move groups, so dp[${i}] = ${one} + ${two} = ${dp[i]}.`,
                hint: 'No sequence can end with both a 1-step and a 2-step move — the groups are disjoint.',
              }
            : undefined,
        pedagogy: {
          what: `dp[${i}] = ${dp[i]} — the Fibonacci pattern appears.`,
          why: 'Two disjoint arrival branches, two reads, one sum: each subproblem is computed once and reused twice later.',
          whatNext: i < n ? `Move to step ${i + 1}.` : `Top reached: dp[${n}] = ${dp[n]} is the answer.`,
        },
      });
      if (!firstSumMilestone) firstSumMilestone = true;
      sumCheckpointAdded = true;
    }

    phase = 'done';
    currentStair = n;
    highlightedIndices = [n];
    actionType = 'NONE';

    pushFrame({
      codeLine: 10,
      action: 'DONE',
      explanation: `Climbing Stairs solved: dp[${n}] = ${dp[n]} distinct ways to climb ${n} step(s) with 1- or 2-step moves — the ${n}th Fibonacci number.`,
      conditionEval: {
        expr: 'dp[n] == fib(n+1)',
        condition: `${dp[n]} == ${fibWays(n)}`,
        result: dp[n] === fibWays(n),
      },
      variables: { n, totalWays: dp[n], tableUsedTwice: 'every dp[i] feeds i+1 and i+2' },
      milestone: 'Top Reached',
      soundCue: 'finish',
      pedagogy: {
        what: `The answer is ${dp[n]} distinct move sequences.`,
        why: 'Each cell was the exact sum of its two disjoint arrival branches, built on the two observed base cases.',
        whatNext: 'Compare with house-robber — same recurrence, different meaning: there the sum is a choice, here it is a count.',
      },
    });

    frames.forEach((frame) => {
      frame.totalSteps = frames.length;
    });
    return frames;
  },

  renderStage: (frame: ExecutionFrame<StairState>) => {
    const { n, dpTable, currentStair, phase, actionType, highlightedIndices, candidate, stats } = frame.state;

    const phaseLabel = phase === 'init' ? 'guard' : phase === 'base' ? 'base cases' : phase === 'fill' ? 'summing' : 'done';
    const depSet = new Set(actionType === 'SUM' ? [] : highlightedIndices);
    const currentSet = new Set(actionType === 'SUM' ? highlightedIndices : [currentStair]);

    const formula = candidate
      ? `dp[${candidate.i}] = dp[${candidate.i - 1}] (${candidate.one}) + dp[${candidate.i - 2}] (${candidate.two}) = ${candidate.result}`
      : phase === 'done'
        ? `answer: dp[${n}] = ${dpTable[n] ?? '—'} distinct ways`
        : 'dp[i] = dp[i-1] + dp[i-2] — count sequences, not moves';

    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 p-3">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span
              className={`rounded-md border px-2 py-0.5 font-bold uppercase ${
                phase === 'done'
                  ? 'border-violet-500/40 bg-violet-500/20 text-violet-200'
                  : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200'
              }`}
            >
              {phaseLabel}
            </span>
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300">
              steps <span className="font-bold text-amber-300">{n}</span>
            </span>
            <span className="rounded-md border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-slate-300">
              sums <span className="font-bold text-cyan-300">{stats.sums}</span>/{Math.max(0, n - 2)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="rounded-md border border-emerald-800 bg-emerald-950/40 px-2 py-0.5 text-emerald-200">
              ways to top <span className="font-bold">{dpTable[n] ?? '—'}</span>
            </span>
          </div>
        </div>

        <div className="w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-center font-mono text-[11px] text-slate-200">
          {formula}
        </div>

        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 pb-4">
            <div className="flex items-end justify-center gap-2 px-2">
              {Array.from({ length: n }, (_, idx) => idx + 1).map((stepNum) => {
                const isCurrent = currentSet.has(stepNum);
                const isDep = depSet.has(stepNum);
                const val = dpTable[stepNum];
                let style = 'border-slate-800 bg-slate-950/60 text-slate-600';
                if (isCurrent) {
                  style =
                    actionType === 'SUM'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/40'
                      : actionType === 'BASE'
                        ? 'border-amber-400 bg-amber-500/15 text-amber-100'
                        : 'border-cyan-400 bg-cyan-500/20 text-cyan-100 ring-2 ring-cyan-400/40';
                } else if (isDep) {
                  style = actionType === 'ONE' ? 'border-amber-400 bg-amber-500/10 text-amber-100' : 'border-indigo-400 bg-indigo-500/10 text-indigo-100';
                } else if (val !== null) {
                  style = 'border-slate-700 bg-slate-900/80 text-slate-300';
                }
                return (
                  <div key={stepNum} className="flex flex-1 flex-col items-center justify-end">
                    {val !== null && (
                      <span
                        className={`mb-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          isCurrent
                            ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                            : 'border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {val}
                      </span>
                    )}
                    <div
                      style={{ height: `${stepNum * 22 + 28}px` }}
                      className={`flex w-full flex-col items-center justify-between rounded-t-xl border-2 p-1.5 transition-all ${style}`}
                    >
                      <span className="font-mono text-[9px] font-bold">step {stepNum}</span>
                      {isDep && (
                        <span className={`font-mono text-[8px] ${actionType === 'ONE' ? 'text-amber-300' : 'text-indigo-300'}`}>
                          {actionType === 'ONE' ? '1-step' : '2-step'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Legend</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-amber-400" />
                  <span>1-step branch (dp[i-1])</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-indigo-400" />
                  <span>2-step branch (dp[i-2])</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" />
                  <span>cell being summed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">badge</span>
                  <span>distinct sequences so far</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Stats</div>
              <div className="flex flex-col gap-0.5">
                <span>sums computed <span className="font-bold text-cyan-300">{stats.sums}</span></span>
                <span>recursion avoided <span className="font-bold text-emerald-300">O(2^n) → O(n)</span></span>
                <span>fibonacci check <span className="font-bold text-emerald-300">fib({n + 1}) = {fibWays(n)}</span></span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 font-mono text-[11px] text-slate-300">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-300">Why Fibonacci?</div>
              <div className="text-[10px] leading-relaxed text-slate-400">
                Every sequence into step i ends with a 1-step or a 2-step move. The two groups never overlap, so their counts add — the defining rule of the Fibonacci sequence.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
