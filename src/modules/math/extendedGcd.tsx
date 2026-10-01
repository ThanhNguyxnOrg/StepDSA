import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface ExtendedGcdState {
  a: number;
  b: number;
  steps: {
    q: number;
    r: number;
    x: number;
    y: number;
  }[];
  gcdVal?: number;
  coeffX?: number;
  coeffY?: number;
}

export const extendedGcdModule: AlgorithmModule<{ a: number; b: number }, ExtendedGcdState> = {
  id: 'extended-gcd',
  title: 'Extended Euclidean Algorithm (Bezout Coefficients & Inverse O(log min(A, B)))',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1) when b divides a',
    timeAverage: 'O(log(min(A, B)))',
    timeWorst: 'O(log(min(A, B))) for consecutive Fibonacci inputs',
    spaceAuxiliary: 'O(1) iterative or O(log min(A, B)) recursive',
    worstCaseCondition: 'Consecutive Fibonacci numbers yield quotient 1 at each step',
  },
  theory: {
    overview:
      "The Extended Euclidean Algorithm computes not only the Greatest Common Divisor gcd(a, b) of two integers, but also the Bezout coefficients x and y such that a * x + b * y = gcd(a, b). When gcd(a, m) = 1, x is the modular multiplicative inverse of a modulo m.",
    whyItWorks:
      'Starting from remainder division a = q * b + r, we recursively express gcd(b, r) as b * x1 + r * y1. Substituting r = a - q * b gives a * y1 + b * (x1 - q * y1), updating the coefficients backwards.',
    invariant:
      'Bezout Identity Invariant: At all completed steps, a * x + b * y = gcd(a, b).',
    pitfalls: [
      'Modular inverse only exists if gcd(a, m) == 1 (coprime).',
      'Negative coefficient x in modular arithmetic requires (x % m + m) % m normalization.',
    ],
  },
  presets: [
    {
      id: 'classic-coprime',
      label: 'Coprime: a = 35, b = 15 -> gcd = 5, 35(-1) + 15(3) = 5',
      description: 'Standard Bezout linear combination',
      data: { a: 35, b: 15 },
    },
    {
      id: 'modular-inverse',
      label: 'Modular Inverse: a = 7, m = 11 -> inverse = 8 (7 * 8 = 56 = 1 mod 11)',
      description: 'Computing modular inverse in cryptography',
      data: { a: 7, b: 11 },
    },
    {
      id: 'fibonacci',
      label: 'Fibonacci Worst Case: a = 55, b = 34',
      description: 'Maximizes Euclidean division depth',
      data: { a: 55, b: 34 },
    },
  ],
  defaultInput: { a: 35, b: 15 },
  codeSnippets: {
    cpp: `int extGcd(int a, int b, int& x, int& y) {
    if (b == 0) {
        x = 1; y = 0;
        return a;
    }
    int x1, y1;
    int gcd = extGcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - (a / b) * y1;
    return gcd;
}`,
    python: `def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    gcd, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return gcd, x, y`,
    typescript: `function extendedGCD(a: number, b: number): [number, number, number] {
    if (b === 0) return [a, 1, 0];
    const [gcd, x1, y1] = extendedGCD(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;
    return [gcd, x, y];
}`,
    java: `int[] extGcd(int a, int b) {
    if (b == 0) return new int[]{a, 1, 0};
    int[] res = extGcd(b, a % b);
    int gcd = res[0], x1 = res[1], y1 = res[2];
    int x = y1;
    int y = x1 - (a / b) * y1;
    return new int[]{gcd, x, y};
}`,
    pseudocode: `function extendedGcd(a, b):
    if b == 0: return (a, 1, 0)
    (g, x1, y1) = extendedGcd(b, a mod b)
    x = y1
    y = x1 - floor(a / b) * y1
    return (g, x, y)`,
  },

  generateTimeline: (input: { a: number; b: number }): ExecutionFrame<ExtendedGcdState>[] => {
    const a = Math.max(1, Math.abs(input?.a || 35));
    const b = Math.max(0, Math.abs(input?.b ?? 15));

    const frames: ExecutionFrame<ExtendedGcdState>[] = [];
    const steps: { q: number; r: number; x: number; y: number }[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Extended GCD(${a}, ${b})`,
      explanation: `Initialize Extended Euclidean Algorithm for a = ${a}, b = ${b}. Goal: compute gcd(${a}, ${b}) and integers (x, y) satisfying Bezout's identity: ${a}*x + ${b}*y = gcd(${a}, ${b}).`,
      variables: { a, b, goalEquation: `${a}*x + ${b}*y = gcd` },
      conditionEval: { expr: 'b >= 0', result: true },
      soundCue: { type: 'step' },
      callStack: [{ name: `extGcd(a=${a}, b=${b})`, params: { a, b }, line: 2, isCurrent: true }],
      state: {
        a,
        b,
        steps: [],
      },
    });

    function solve(currA: number, currB: number, depth: number): [number, number, number] {
      // Step: Function call entry and base case condition check
      const isBase = currB === 0;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 2,
        explanation: `Enter extGcd(a=${currA}, b=${currB}) at recursion depth ${depth}. Evaluating base case: currB === 0.`,
        soundCue: { type: 'step' },
        variables: { currA, currB, depth, isBase },
        conditionEval: { expr: `currB === 0`, result: isBase },
        callStack: [
          { name: `extGcd(${currA}, ${currB})`, params: { a: currA, b: currB, depth }, line: 2, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          a,
          b,
          steps: [...steps],
        },
      });

      if (isBase) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 3,
          isMilestone: true,
          milestoneTitle: `Base Case: b = 0 (gcd = ${currA})`,
          explanation: `Base case condition (b === 0) is TRUE! Therefore gcd = ${currA}. Set initial coefficients: x = 1, y = 0 since ${currA}*(1) + 0*(0) = ${currA}.`,
          variables: { currA, currB, gcd: currA, x: 1, y: 0, depth },
          conditionEval: { expr: 'currB === 0', result: true },
          soundCue: { type: 'complete' },
          callStack: [
            { name: `baseCase(${currA})`, params: { gcd: currA }, line: 3, isCurrent: true },
            { name: `solve(${currA}, 0)`, params: { a: currA, b: 0 }, line: 2 },
          ],
          state: {
            a,
            b,
            steps: [...steps],
            gcdVal: currA,
            coeffX: 1,
            coeffY: 0,
          },
        });
        return [currA, 1, 0];
      }

      const q = Math.floor(currA / currB);
      const r = currA % currB;

      // Division frame
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        explanation: `Euclidean Division at depth ${depth}: ${currA} ÷ ${currB} = ${q} remainder ${r}. Linear relation: ${currA} = ${q} * ${currB} + ${r}.`,
        variables: { currA, currB, quotient: q, remainder: r, depth },
        conditionEval: { expr: `${currA} = ${q} * ${currB} + ${r}`, result: true },
        soundCue: { type: 'compare' },
        callStack: [
          { name: `divide(${currA}, ${currB})`, params: { q, r }, line: 7, isCurrent: true },
          { name: `extGcd(${currA}, ${currB})`, params: { a: currA, b: currB }, line: 2 },
        ],
        state: {
          a,
          b,
          steps: [...steps],
        },
      });

      // Recurse frame
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Recurse downward: Calling extGcd(b=${currB}, r=${r}) to compute sub-problem Bezout coefficients.`,
        variables: { nextA: currB, nextB: r, depth: depth + 1 },
        conditionEval: { expr: 'currB !== 0', result: true },
        soundCue: { type: 'step' },
        callStack: [
          { name: `extGcd(${currB}, ${r})`, params: { a: currB, b: r }, line: 8, isCurrent: true },
          { name: `extGcd(${currA}, ${currB})`, params: { a: currA, b: currB }, line: 2 },
        ],
        state: {
          a,
          b,
          steps: [...steps],
        },
      });

      const [gcdVal, x1, y1] = solve(currB, r, depth + 1);

      const x = y1;
      const y = x1 - q * y1;

      steps.push({ q, r, x, y });

      // Frame: Bezout Substitution breakdown
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Unwinding recursion to depth ${depth}: Substitute remainder r = ${currA} - ${q}*${currB} into (${currB}*${x1} + ${r}*${y1} = ${gcdVal}).`,
        soundCue: { type: 'step' },
        variables: { currA, currB, x1, y1, q, r, gcdVal },
        conditionEval: { expr: `r === currA - q * currB`, result: true },
        callStack: [
          { name: `substitute(${currA}, ${currB})`, params: { x1, y1, q }, line: 9, isCurrent: true },
          { name: `extGcd(${currA}, ${currB})`, params: { a: currA, b: currB }, line: 2 },
        ],
        state: {
          a,
          b,
          steps: [...steps],
          gcdVal,
        },
      });

      // Backtrack coefficient update frame
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        isMilestone: true,
        milestoneTitle: `Coefficients for (${currA}, ${currB})`,
        explanation: `Backtrack to depth ${depth}: Collected terms give x = y1 = ${x}, y = x1 - q*y1 = ${x1} - (${q})*(${y1}) = ${y}. Verified: ${currA}*(${x}) + ${currB}*(${y}) = ${currA * x + currB * y}.`,
        variables: {
          currA,
          currB,
          x,
          y,
          formula: `x = y1 (${y1}), y = x1 - q*y1 (${x1} - ${q}*${y1} = ${y})`,
          identityCheck: `${currA}*(${x}) + ${currB}*(${y}) = ${currA * x + currB * y}`,
        },
        conditionEval: { expr: `${currA}*(${x}) + ${currB}*(${y}) === ${gcdVal}`, result: currA * x + currB * y === gcdVal },
        soundCue: { type: 'swap' },
        callStack: [
          { name: `backtrack(${currA}, ${currB})`, params: { x, y, gcd: gcdVal }, line: 9, isCurrent: true },
          { name: `extGcd(${currA}, ${currB})`, params: { a: currA, b: currB }, line: 2 },
        ],
        state: {
          a,
          b,
          steps: [...steps],
          gcdVal,
          coeffX: x,
          coeffY: y,
        },
      });

      return [gcdVal, x, y];
    }

    const [finalGcd, finalX, finalY] = solve(a, b, 0);

    // Final Completion Frame
    const isCoprime = finalGcd === 1;
    const modInverse = isCoprime && b > 0 ? ((finalX % b) + b) % b : null;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      isMilestone: true,
      milestoneTitle: `Bezout Identity: ${a}(${finalX}) + ${b}(${finalY}) = ${finalGcd}`,
      explanation: `Extended GCD Complete! gcd(${a}, ${b}) = ${finalGcd}. Bezout solution: ${a}*(${finalX}) + ${b}*(${finalY}) = ${finalGcd}.${
        isCoprime && b > 0 ? ` Since gcd=1, the modular inverse of ${a} mod ${b} is ${modInverse}.` : ''
      }`,
      variables: {
        gcd: finalGcd,
        x: finalX,
        y: finalY,
        coprime: isCoprime,
        modularInverse: modInverse ?? 'Undefined',
        verified: a * finalX + b * finalY === finalGcd,
      },
      conditionEval: { expr: `${a}*(${finalX}) + ${b}*(${finalY}) === ${finalGcd}`, result: true },
      soundCue: { type: 'complete' },
      callStack: [{ name: 'complete()', params: { gcd: finalGcd, x: finalX, y: finalY }, line: 10, isCurrent: true }],
      state: {
        a,
        b,
        steps: [...steps],
        gcdVal: finalGcd,
        coeffX: finalX,
        coeffY: finalY,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ExtendedGcdState>) => {
    const { a, b, gcdVal, coeffX, coeffY } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              a = <strong className="text-white">{a}</strong>, b = <strong className="text-white">{b}</strong>
            </div>
            {gcdVal !== undefined && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
                gcd({a}, {b}) = <strong className="text-white">{gcdVal}</strong>
              </div>
            )}
          </div>

          {coeffX !== undefined && coeffY !== undefined && (
            <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs font-mono text-emerald-300 font-bold">
              Bezout: {a}({coeffX}) + {b}({coeffY}) = {gcdVal}
            </div>
          )}
        </div>

        {/* Tableau Card */}
        <div className="w-full p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl my-auto text-center font-mono">
          <div className="text-xs text-slate-400 mb-4 font-bold">
            Bezout Identity & Modular Multiplicative Inverse
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-500 block">x Coefficient</span>
              <span className="text-xl font-bold text-cyan-400">{coeffX ?? '—'}</span>
            </div>
            <span className="text-xl text-slate-600 font-bold">+</span>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-500 block">y Coefficient</span>
              <span className="text-xl font-bold text-amber-400">{coeffY ?? '—'}</span>
            </div>
            <span className="text-xl text-slate-600 font-bold">=</span>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-xs text-slate-500 block">GCD</span>
              <span className="text-xl font-bold text-emerald-400">{gcdVal ?? '—'}</span>
            </div>
          </div>
          {gcdVal === 1 && coeffX !== undefined && (
            <div className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300">
              Modular Inverse of {a} mod {b} is: <strong>{((coeffX % b) + b) % b}</strong> (since {a} *{' '}
              {((coeffX % b) + b) % b} ≡ 1 mod {b})
            </div>
          )}
        </div>
      </div>
    );
  },
};
