import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface EuclideanGcdStep {
  stepNum: number;
  a: number;
  b: number;
  quotient: number;
  remainder: number;
}

export interface EuclideanGcdState {
  currentA: number;
  currentB: number;
  quotient: number | null;
  remainder: number | null;
  history: EuclideanGcdStep[];
  gcdResult: number | null;
  phase: 'init' | 'modulo' | 'shift' | 'done';
}

export interface EuclideanGcdInput {
  a: number;
  b: number;
}

const defaultGcdInput: EuclideanGcdInput = {
  a: 252,
  b: 105,
};

export const euclideanGcdModule: AlgorithmModule<EuclideanGcdInput, EuclideanGcdState> = {
  id: 'euclidean-gcd',
  title: 'Euclidean Algorithm (Greatest Common Divisor)',
  category: 'math',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(log(min(a, b)))',
    timeWorst: 'O(log(min(a, b)))',
    spaceAuxiliary: 'O(1) iterative / O(log N) recursive',
    worstCaseCondition: 'Consecutive Fibonacci numbers require the maximum number of modulo steps (Lamé Theorem)',
  },
  theory: {
    overview:
      'The Euclidean Algorithm calculates the Greatest Common Divisor (GCD) of two non-negative integers. It relies on the fundamental principle that gcd(a, b) = gcd(b, a mod b), repeatedly replacing (a, b) with (b, a mod b) until b becomes 0, at which point a is the GCD.',
    whyItWorks:
      'If integer d divides both a and b, it must also divide any linear combination of them, including the remainder r = a - q * b. Thus, common divisors of (a, b) are identical to common divisors of (b, r).',
    invariant:
      'gcd(a_current, b_current) == gcd(a_initial, b_initial) holds true across every single step.',
    pitfalls: [
      'Edge cases when either a or b is 0 (gcd(x, 0) = x).',
      'Negative integer inputs must be converted to absolute values |x| beforehand.',
    ],
  },
  presets: [
    { id: 'classic', label: 'Classic 252 & 105', description: 'GCD = 21 in 3 steps', data: { a: 252, b: 105 } },
    { id: 'fibonacci', label: 'Fibonacci (Worst Case)', description: 'F(8)=21 & F(7)=13', data: { a: 21, b: 13 } },
    { id: 'coprime', label: 'Coprime Numbers', description: 'GCD = 1 (35 & 18)', data: { a: 35, b: 18 } },
    { id: 'multiple', label: 'Direct Multiple', description: 'GCD = 24 (120 & 24)', data: { a: 120, b: 24 } },
  ],
  defaultInput: defaultGcdInput,
  codeSnippets: {
    python: `def gcd(a, b):
    while b != 0:
        remainder = a % b
        a = b
        b = remainder
    return a`,
    typescript: `function gcd(a: number, b: number): number {
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}`,
    cpp: `int gcd(int a, int b) {
    while (b != 0) {
        int remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}`,
    java: `public static int gcd(int a, int b) {
    while (b != 0) {
        int remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}`,
    pseudocode: `function GCD(a, b):
    while b != 0:
        remainder = a mod b
        a = b
        b = remainder
    return a`,
  },

  generateTimeline: (input: EuclideanGcdInput): ExecutionFrame<EuclideanGcdState>[] => {
    let a = Math.abs(Math.floor(input?.a ?? 252));
    let b = Math.abs(Math.floor(input?.b ?? 105));
    if (a < b) {
      const temp = a;
      a = b;
      b = temp;
    }

    const timeline: ExecutionFrame<EuclideanGcdState>[] = [];
    const history: EuclideanGcdStep[] = [];

    const baseFrame = (
      stepIdx: number,
      state: EuclideanGcdState,
      codeLine: number,
      explanation: string,
      action: string,
      isMilestone: boolean,
      scope: Record<string, string | number>,
      soundCueType: 'step' | 'compare' | 'swap' | 'complete' = 'step',
      condition?: { expr: string; result: boolean | number | string }
    ): ExecutionFrame<EuclideanGcdState> => ({
      stepIndex: stepIdx,
      totalSteps: 0,
      codeLine,
      state: {
        currentA: state.currentA,
        currentB: state.currentB,
        quotient: state.quotient,
        remainder: state.remainder,
        history: [...state.history],
        gcdResult: state.gcdResult,
        phase: state.phase,
      },
      codeHighlights: {
        python: [codeLine],
        typescript: [codeLine],
        cpp: [codeLine],
        java: [codeLine],
        pseudocode: [codeLine],
      },
      callStack: [
        {
          name: 'gcd',
          line: codeLine,
          params: { a: state.currentA, b: state.currentB },
          isCurrent: true,
        },
      ],
      variables: scope,
      conditionEval: condition ?? { expr: 'b !== 0', result: state.currentB !== 0 },
      explanation,
      action,
      isMilestone,
      soundCue: { type: soundCueType },
      invariantStatus:
        state.phase === 'done'
          ? `GCD is verified as ${state.gcdResult}.`
          : `gcd(${state.currentA}, ${state.currentB}) == gcd(${a}, ${b}) invariant maintained.`,
    });

    const state: EuclideanGcdState = {
      currentA: a,
      currentB: b,
      quotient: null,
      remainder: null,
      history: [],
      gcdResult: null,
      phase: 'init',
    };

    let step = 0;

    timeline.push(
      baseFrame(
        step++,
        state,
        2,
        `Initialized Euclidean Algorithm with a = ${a}, b = ${b}. Objective: compute gcd(${a}, ${b}) via successive remainder reductions.`,
        'Initialize GCD',
        true,
        { a, b, 'b !== 0': b !== 0 ? 'true' : 'false' },
        'step',
        { expr: 'b !== 0', result: b !== 0 }
      )
    );

    let stepCounter = 1;
    let curA = a;
    let curB = b;

    while (curB !== 0) {
      // Frame 1: Check loop condition
      state.phase = 'modulo';
      timeline.push(
        baseFrame(
          step++,
          state,
          2,
          `Loop test: b = ${curB} !== 0 is TRUE. Proceed with Euclidean division step #${stepCounter}.`,
          `Check b != 0`,
          false,
          { currentA: curA, currentB: curB, condition: 'curB !== 0' },
          'compare',
          { expr: `${curB} !== 0`, result: true }
        )
      );

      const q = Math.floor(curA / curB);
      const r = curA % curB;
      state.quotient = q;
      state.remainder = r;

      // Frame 2: Compute quotient and remainder
      timeline.push(
        baseFrame(
          step++,
          state,
          3,
          `Compute Euclidean division: ${curA} = (${q} × ${curB}) + ${r}. Remainder r = ${curA} % ${curB} = ${r}.`,
          `Calculate ${curA} mod ${curB}`,
          r === 0,
          { a: curA, b: curB, quotient: q, remainder: r, invariant: `gcd(${curA}, ${curB}) = gcd(${curB}, ${r})` },
          'compare',
          { expr: `${curA} % ${curB} === ${r}`, result: true }
        )
      );

      history.push({
        stepNum: stepCounter++,
        a: curA,
        b: curB,
        quotient: q,
        remainder: r,
      });
      state.history = [...history];

      // Shift values: a = b, b = remainder
      state.phase = 'shift';
      curA = curB;
      curB = r;
      state.currentA = curA;
      state.currentB = curB;

      // Frame 3: Shift parameters
      timeline.push(
        baseFrame(
          step++,
          state,
          4,
          `Shift parameters for next cycle: new a = ${curA}, new b = ${curB}.${
            curB === 0 ? ' Remainder reached zero! Next iteration will conclude the algorithm.' : ''
          }`,
          `Set a = ${curA}, b = ${curB}`,
          curB === 0,
          { newA: curA, newB: curB, nextRemainder: curB },
          curB === 0 ? 'complete' : 'swap',
          { expr: `b === 0`, result: curB === 0 }
        )
      );
    }

    state.phase = 'done';
    state.gcdResult = curA;
    state.quotient = null;
    state.remainder = null;

    timeline.push(
      baseFrame(
        step++,
        state,
        6,
        `Algorithm terminated because b = 0. The Greatest Common Divisor is a = ${curA}. gcd(${a}, ${b}) = ${curA}.`,
        `GCD Found: ${curA}`,
        true,
        { gcd: curA, totalSteps: history.length, verifiedGcd: curA },
        'complete',
        { expr: 'b === 0', result: true }
      )
    );

    const total = timeline.length;
    timeline.forEach((f) => {
      f.totalSteps = total;
    });

    return timeline;
  },

  renderStage: (frame: ExecutionFrame<EuclideanGcdState>) => {
    const { currentA, currentB, quotient, remainder, history, gcdResult, phase } = frame.state;

    return (
      <div className="w-full flex flex-col items-center justify-center p-6 space-y-6 select-none">
        {/* Top Active Equation Display */}
        <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Division Remainder Identity (a = q · b + r)
          </span>

          <div className="flex items-center gap-3 text-2xl md:text-3xl font-mono font-bold py-2">
            <span className="text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/30">
              {currentA}
            </span>
            <span className="text-slate-500">=</span>
            {quotient !== null ? (
              <>
                <span className="text-indigo-400">({quotient}</span>
                <span className="text-slate-500">×</span>
                <span className="text-sky-400">{currentB})</span>
                <span className="text-slate-500">+</span>
                <span className="text-rose-400 bg-rose-400/10 px-3 py-1 rounded-lg border border-rose-400/30">
                  {remainder}
                </span>
              </>
            ) : (
              <span className="text-slate-400 text-lg">
                {phase === 'done' ? `GCD = ${gcdResult}` : 'Evaluating step...'}
              </span>
            )}
          </div>

          {phase === 'done' && (
            <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-mono font-bold animate-bounce">
              Final Result: GCD = {gcdResult}
            </div>
          )}
        </div>

        {/* History Table */}
        <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-slate-400">Euclidean Step Log</span>
            <span className="text-xs font-mono text-slate-400">Invariant: gcd(a, b) constant</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Step</th>
                  <th className="py-2 px-3">a</th>
                  <th className="py-2 px-3">b</th>
                  <th className="py-2 px-3">q = ⌊a/b⌋</th>
                  <th className="py-2 px-3">r = a % b</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((row) => (
                  <tr key={row.stepNum} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-400 font-bold">#{row.stepNum}</td>
                    <td className="py-2 px-3 text-amber-300 font-bold">{row.a}</td>
                    <td className="py-2 px-3 text-sky-300 font-bold">{row.b}</td>
                    <td className="py-2 px-3 text-indigo-300">{row.quotient}</td>
                    <td className="py-2 px-3 text-rose-300 font-bold">{row.remainder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
};
