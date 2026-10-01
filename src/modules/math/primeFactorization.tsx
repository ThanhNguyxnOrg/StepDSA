import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface PrimeFactor {
  prime: number;
  count: number;
}

export interface PrimeFactorizationState {
  originalNumber: number;
  remainingNumber: number;
  candidate: number;
  factors: PrimeFactor[];
  stepExplanation: string;
}

export const primeFactorizationModule: AlgorithmModule<
  { number: number },
  PrimeFactorizationState
> = {
  id: 'prime-factorization',
  title: 'Integer Prime Factorization (Trial Division & Prime Decomposition O(sqrt(N)))',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(log N) for powers of 2',
    timeAverage: 'O(sqrt(N))',
    timeWorst: 'O(sqrt(N)) for large primes',
    spaceAuxiliary: 'O(log N) to store prime factors',
    worstCaseCondition: 'N is prime or product of two large identical primes (N = p^2)',
  },
  theory: {
    overview:
      'Integer Prime Factorization decomposes a composite integer N into a unique product of prime numbers (Fundamental Theorem of Arithmetic). Trial division tests prime candidates d up to sqrt(N).',
    whyItWorks:
      'If N has a proper factor, at least one factor must be <= sqrt(N). By continually dividing out factor d until N is no longer divisible by d, every extracted divisor is guaranteed to be prime without needing prior primality tests.',
    invariant:
      'Multiplicative Invariant: originalNumber == remainingNumber * product(p^count for all recorded prime factors).',
    pitfalls: [
      'Testing divisors past sqrt(N), leading to redundant O(N) loops instead of O(sqrt(N)).',
      'Forgetting that if remainingNumber > 1 at loop termination, the remainder itself is a prime factor.',
    ],
  },
  presets: [
    {
      id: 'classic-composite',
      label: 'Composite: 360 = 2^3 * 3^2 * 5',
      description: 'Standard multi-factor composite number',
      data: { number: 360 },
    },
    {
      id: 'semiprime',
      label: 'Semiprime: 85 = 5 * 17',
      description: 'Product of two distinct primes',
      data: { number: 85 },
    },
    {
      id: 'large-prime-remainder',
      label: 'Large Remainder: 94 = 2 * 47',
      description: 'Single small factor 2 leaves large prime 47',
      data: { number: 94 },
    },
  ],
  defaultInput: { number: 360 },
  codeSnippets: {
    cpp: `vector<pair<long long, int>> factorize(long long n) {
    vector<pair<long long, int>> factors;
    for (long long d = 2; d * d <= n; ++d) {
        if (n % d == 0) {
            int count = 0;
            while (n % d == 0) {
                count++;
                n /= d;
            }
            factors.push_back({d, count});
        }
    }
    if (n > 1) factors.push_back({n, 1});
    return factors;
}`,
    python: `def factorize(n: int) -> list[tuple[int, int]]:
    factors = []
    d = 2
    while d * d <= n:
        if n % d == 0:
            count = 0
            while n % d == 0:
                count += 1
                n //= d
            factors.append((d, count))
        d += 1
    if n > 1:
        factors.append((n, 1))
    return factors`,
    typescript: `function factorize(n: number): { prime: number; count: number }[] {
  const factors: { prime: number; count: number }[] = [];
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      let count = 0;
      while (n % d === 0) {
        count++;
        n = Math.floor(n / d);
      }
      factors.push({ prime: d, count });
    }
  }
  if (n > 1) factors.push({ prime: n, count: 1 });
  return factors;
}`,
    java: `public List<int[]> factorize(long n) {
    List<int[]> factors = new ArrayList<>();
    for (long d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            int count = 0;
            while (n % d == 0) {
                count++;
                n /= d;
            }
            factors.add(new int[]{(int)d, count});
        }
    }
    if (n > 1) factors.add(new int[]{(int)n, 1});
    return factors;
}`,
    pseudocode: `function factorize(N):
    factors = []
    for d = 2 to sqrt(N):
        if N mod d == 0:
            count = 0
            while N mod d == 0:
                count++
                N = N / d
            factors.append((d, count))
    if N > 1:
        factors.append((N, 1))
    return factors`,
  },
  generateTimeline: (input: { number: number }): ExecutionFrame<PrimeFactorizationState>[] => {
    const originalNumber = Math.max(2, input?.number ?? 360);
    const frames: ExecutionFrame<PrimeFactorizationState>[] = [];
    const factors: PrimeFactor[] = [];
    let rem = originalNumber;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Prime Factorization (${originalNumber})`,
      action: 'INIT',
      state: {
        originalNumber,
        remainingNumber: rem,
        candidate: 2,
        factors: [],
        stepExplanation: `Initialize factorization of ${originalNumber}`,
      },
      callStack: [{ name: 'factorize', params: { n: originalNumber }, line: 2, isCurrent: true }],
      variables: { n: originalNumber, remainder: rem, divisorLimit: Math.floor(Math.sqrt(originalNumber)) },
      conditionEval: { expr: 'originalNumber >= 2', result: true },
      soundCue: { type: 'step' },
      explanation: `Begin prime factorization of ${originalNumber}. Testing trial divisors up to sqrt(${originalNumber}) ≈ ${Math.floor(
        Math.sqrt(originalNumber)
      )}.`,
    });

    for (let d = 2; d * d <= rem; d++) {
      const isDivisible = rem % d === 0;

      // Candidate testing frame
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        action: 'TEST_DIVISOR',
        state: {
          originalNumber,
          remainingNumber: rem,
          candidate: d,
          factors: [...factors],
          stepExplanation: `Testing divisor d = ${d}: ${rem} % ${d} = ${rem % d}`,
        },
        callStack: [{ name: 'testDivisor', params: { d, rem }, line: 5, isCurrent: true }],
        variables: { candidateDivisor: d, currentRemainder: rem, isFactor: isDivisible },
        conditionEval: { expr: `${rem} % ${d} === 0`, result: isDivisible },
        soundCue: { type: 'compare' },
        explanation: `Test candidate divisor d = ${d}: ${rem} mod ${d} = ${rem % d}.${
          isDivisible ? ` Divisible! ${d} is a prime factor.` : ` Not divisible, advancing.`
        }`,
      });

      if (isDivisible) {
        let count = 0;
        while (rem % d === 0) {
          count++;
          rem = Math.floor(rem / d);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            action: 'EXTRACT_FACTOR',
            state: {
              originalNumber,
              remainingNumber: rem,
              candidate: d,
              factors: [...factors, { prime: d, count }],
              stepExplanation: `Divided by prime ${d}. Remaining quotient = ${rem}`,
            },
            callStack: [{ name: 'divideByPrime', params: { prime: d, newRemainder: rem }, line: 8, isCurrent: true }],
            variables: { primeFactor: d, currentExponent: count, remainingQuotient: rem },
            conditionEval: { expr: `rem % ${d} === 0`, result: true },
            soundCue: { type: 'insert' },
            explanation: `Extracted prime factor ${d} (power #${count}). Remaining quotient: ${rem}.`,
          });
        }
        factors.push({ prime: d, count });

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          isMilestone: true,
          milestoneTitle: `Factor Recorded: ${d}^${count}`,
          action: 'FACTOR_RECORDED',
          state: {
            originalNumber,
            remainingNumber: rem,
            candidate: d,
            factors: [...factors],
            stepExplanation: `Completed factor ${d}^${count}`,
          },
          callStack: [{ name: 'recordFactor', params: { prime: d, exponent: count }, line: 10, isCurrent: true }],
          variables: { factor: `${d}^${count}`, currentRemainder: rem },
          conditionEval: { expr: `${rem} % ${d} !== 0`, result: true },
          soundCue: { type: 'swap' },
          explanation: `Fully extracted prime ${d} with multiplicity ${count} (${d}^${count}). Continuing search on remaining quotient ${rem}.`,
        });
      }
    }

    if (rem > 1) {
      factors.push({ prime: rem, count: 1 });
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        isMilestone: true,
        milestoneTitle: `Prime Residue: ${rem}`,
        action: 'PRIME_REMAINDER',
        state: {
          originalNumber,
          remainingNumber: 1,
          candidate: rem,
          factors: [...factors],
          stepExplanation: `Remaining quotient ${rem} is prime`,
        },
        callStack: [{ name: 'appendRemainder', params: { primeRemainder: rem }, line: 14, isCurrent: true }],
        variables: { primeRemainder: rem, finalRemainder: 1 },
        conditionEval: { expr: 'rem > 1', result: true },
        soundCue: { type: 'insert' },
        explanation: `No divisors remain <= sqrt(${rem}). The surviving remainder ${rem} is prime and appended to factor list.`,
      });
    }

    const factorFormula = factors.map((f) => (f.count > 1 ? `${f.prime}^${f.count}` : `${f.prime}`)).join(' × ');

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      isMilestone: true,
      milestoneTitle: `Decomposition: ${originalNumber} = ${factorFormula}`,
      action: 'COMPLETE',
      state: {
        originalNumber,
        remainingNumber: 1,
        candidate: 0,
        factors: [...factors],
        stepExplanation: `Complete prime decomposition: ${factorFormula}`,
      },
      callStack: [{ name: 'factorize', params: { formula: factorFormula, status: 'DONE' }, line: 16, isCurrent: true }],
      variables: { completeDecomposition: factorFormula, totalUniquePrimes: factors.length },
      conditionEval: { expr: 'factorizationComplete', result: true },
      soundCue: { type: 'complete' },
      explanation: `Factorization complete! ${originalNumber} = ${factorFormula}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<PrimeFactorizationState>) => {
    const { originalNumber, remainingNumber, factors } = frame.state;
    const factorFormula = factors.map((f) => (f.count > 1 ? `${f.prime}^${f.count}` : `${f.prime}`)).join(' × ');

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-2xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Target Integer:</span>
            <span className="text-xl font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded">
              {originalNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Remaining Quotient:</span>
            <span className="text-sm font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
              {remainingNumber}
            </span>
          </div>
        </div>

        {/* Formula Display */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 w-full">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Prime Decomposition:</span>
          <div className="text-2xl font-mono font-black text-emerald-400 bg-emerald-950/30 border border-emerald-500/40 px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/50">
            {factors.length > 0 ? `${originalNumber} = ${factorFormula}` : 'Scanning...'}
          </div>

          {/* Factor Blocks */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {factors.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 font-mono"
              >
                <span className="text-cyan-400 font-extrabold text-lg">{f.prime}</span>
                <span className="text-slate-500 text-xs">power</span>
                <span className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-black px-2 py-0.5 rounded">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-400/30 border border-cyan-400 inline-block" />
            <span>Prime Base (p)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-400 inline-block" />
            <span>Multiplicity Exponent (k)</span>
          </div>
        </div>
      </div>
    );
  },
};
