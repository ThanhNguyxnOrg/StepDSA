import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SieveNumber {
  val: number;
  isPrime: boolean;
  status: 'unprocessed' | 'current-prime' | 'crossing-multiple' | 'composite' | 'prime-confirmed';
  eliminatedBy?: number;
}

export interface SieveState {
  n: number;
  numbers: SieveNumber[];
  currentP?: number;
  currentMultiple?: number;
  primesFound: number[];
  isComplete: boolean;
}

export const sieveModule: AlgorithmModule<number, SieveState> = {
  id: 'sieve-of-eratosthenes',
  title: 'Sieve of Eratosthenes (Prime Grid)',
  category: 'math',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(N log log N)',
    timeAverage: 'O(N log log N)',
    timeWorst: 'O(N log log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Harmonic series sum over primes: sum(N/p) = N * log(log N)',
  },
  theory: {
    overview:
      'The Sieve of Eratosthenes is an ancient and optimal algorithm for finding all prime numbers up to a specified integer N by iteratively marking the multiples of each prime as composite (not prime), starting from 2.',
    whyItWorks:
      'Every composite number has a prime divisor <= sqrt(N). Marking multiples starting at p*p eliminates redundant operations and discovers all primes in sub-quadratic time.',
    invariant:
      'When considering prime p, all composite numbers strictly smaller than p*p have already been eliminated by earlier prime factors.',
    pitfalls: [
      'Starting multiple elimination from 2*p instead of p*p (redundant work).',
      'Forgetting that 0 and 1 are neither prime nor composite.',
    ],
  },
  presets: [
    { id: 'small-30', label: 'Primes up to 30', description: 'Quick walkthrough (10 primes)', data: 30 },
    { id: 'medium-50', label: 'Primes up to 50', description: 'Standard classroom demonstration', data: 50 },
    { id: 'large-100', label: 'Primes up to 100', description: 'Full 10x10 prime grid', data: 100 },
  ],
  defaultInput: 50,
  codeSnippets: {
    python: `def sieve_of_eratosthenes(n: int) -> list[int]:
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for i in range(p * p, n + 1, p):
                is_prime[i] = False
        p += 1
        
    return [i for i in range(2, n + 1) if is_prime[i]]`,
    typescript: `function sieveOfEratosthenes(n: number): number[] {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;

  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) {
      for (let i = p * p; i <= n; i += p) {
        isPrime[i] = false;
      }
    }
  }

  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
  }
  return primes;
}`,
    cpp: `vector<int> sieveOfEratosthenes(int n) {
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = isPrime[1] = false;

    for (int p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (int i = p * p; i <= n; i += p) {
                isPrime[i] = false;
            }
        }
    }

    vector<int> primes;
    for (int i = 2; i <= n; i++) {
        if (isPrime[i]) primes.push_back(i);
    }
    return primes;
}`,
    java: `public List<Integer> sieveOfEratosthenes(int n) {
    boolean[] isPrime = new boolean[n + 1];
    Arrays.fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;

    for (int p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (int i = p * p; i <= n; i += p) {
                isPrime[i] = false;
            }
        }
    }

    List<Integer> primes = new ArrayList<>();
    for (int i = 2; i <= n; i++) {
        if (isPrime[i]) primes.add(i);
    }
    return primes;
}`,
    pseudocode: `function sieveOfEratosthenes(n):
    isPrime[0..n] = true
    isPrime[0] = isPrime[1] = false
    for p = 2 while p*p <= n:
        if isPrime[p] is true:
            for multiple = p*p to n step p:
                isPrime[multiple] = false
    return all numbers with isPrime[i] == true`,
  },

  generateTimeline: (nInput: number): ExecutionFrame<SieveState>[] => {
    const frames: ExecutionFrame<SieveState>[] = [];
    const n = Math.min(Math.max(nInput, 10), 100);

    const nums: SieveNumber[] = [];
    for (let i = 2; i <= n; i++) {
      nums.push({
        val: i,
        isPrime: true,
        status: 'unprocessed',
      });
    }

    // Step 0: Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialized array for numbers 2 to ${n}. Assuming all numbers are prime initially.`,
      callStack: [
        { name: 'sieve(n)', params: { n }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { n, candidates: nums.length },
      state: {
        n,
        numbers: nums.map((x) => ({ ...x })),
        primesFound: [],
        isComplete: false,
      },
      invariantStatus: {
        isValid: true,
        label: `Grid initialized with ${nums.length} candidates`,
      },
    });

    const isPrimeArray = new Array(n + 1).fill(true);
    isPrimeArray[0] = isPrimeArray[1] = false;

    for (let p = 2; p * p <= n; p++) {
      if (isPrimeArray[p]) {
        // Frame: Found prime p
        const pObj = nums.find((x) => x.val === p);
        if (pObj) pObj.status = 'current-prime';

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          explanation: `Number ${p} is unmarked! Therefore ${p} is PRIME. Starting elimination of its multiples from ${p * p}.`,
          callStack: [
            { name: 'sieve(n)', params: { currentPrime: p, startMultiple: p * p }, line: 6, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          variables: { p, 'p*p': p * p, status: 'PRIME' },
          conditionEval: { expr: `isPrime[${p}]`, result: true },
          soundCue: { type: 'sorted' },
          state: {
            n,
            numbers: nums.map((x) => ({ ...x })),
            currentP: p,
            primesFound: nums.filter((x) => x.val <= p && x.isPrime).map((x) => x.val),
            isComplete: false,
          },
          invariantStatus: {
            isValid: true,
            label: `${p} is prime`,
          },
        });

        // Eliminate multiples
        for (let multiple = p * p; multiple <= n; multiple += p) {
          isPrimeArray[multiple] = false;
          const mObj = nums.find((x) => x.val === multiple);
          if (mObj) {
            mObj.isPrime = false;
            mObj.status = 'crossing-multiple';
            mObj.eliminatedBy = p;
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            explanation: `Crossing out multiple ${multiple} = ${p} × ${multiple / p}. Marked as COMPOSITE.`,
            callStack: [
              { name: 'sieve(n)', params: { prime: p, composite: multiple, factor: multiple / p }, line: 8, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            variables: { p, multiple, factor: multiple / p },
            soundCue: { type: 'discard' },
            state: {
              n,
              numbers: nums.map((x) => ({ ...x })),
              currentP: p,
              currentMultiple: multiple,
              primesFound: nums.filter((x) => x.val <= p && x.isPrime).map((x) => x.val),
              isComplete: false,
            },
          });

          if (mObj) {
            mObj.status = 'composite';
          }
        }

        if (pObj) pObj.status = 'prime-confirmed';
      }
    }

    // Final frame
    const finalPrimes = nums.filter((x) => isPrimeArray[x.val]);
    finalPrimes.forEach((x) => {
      x.status = 'prime-confirmed';
    });

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `Sieve complete! Found ${finalPrimes.length} primes up to ${n}: [${finalPrimes.map((x) => x.val).join(', ')}].`,
      callStack: [
        { name: 'sieve(n)', params: { totalPrimes: finalPrimes.length }, line: 12, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      variables: { totalPrimes: finalPrimes.length, maxTested: n },
      soundCue: { type: 'sorted' },
      isMilestone: true,
      milestoneTitle: `${finalPrimes.length} Primes Found`,
      state: {
        n,
        numbers: nums.map((x) => ({ ...x })),
        primesFound: finalPrimes.map((x) => x.val),
        isComplete: true,
      },
      invariantStatus: {
        isValid: true,
        label: `All primes <= ${n} confirmed`,
      },
    });

    const totalSteps = frames.length;
    return frames.map((f) => ({ ...f, totalSteps }));
  },

  renderStage: (frame: ExecutionFrame<SieveState>) => {
    const { numbers, currentP, currentMultiple, primesFound, isComplete, n } = frame.state;

    return (
      <div className="w-full h-full flex flex-col justify-between p-4 bg-[#0B0F19] rounded-2xl border border-[#1F293D] select-none">
        {/* Top Header */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400">Range:</span>{' '}
              <span className="font-bold text-white">2 to {n}</span>
            </div>
            {currentP && (
              <div>
                <span className="text-slate-400">Current Prime:</span>{' '}
                <span className="font-bold text-[#10B981]">p = {currentP}</span>
              </div>
            )}
            {currentMultiple && (
              <div>
                <span className="text-slate-400">Crossing Multiple:</span>{' '}
                <span className="font-bold text-[#F43F5E]">{currentMultiple}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 font-semibold">Primes Found:</span>
            <span className="px-2.5 py-0.5 rounded font-bold bg-[#10B981]/20 border border-[#10B981] text-[#10B981]">
              {primesFound.length} {isComplete ? '(Complete)' : ''}
            </span>
          </div>
        </div>

        {/* Center: Number Grid */}
        <div className="flex-1 flex items-center justify-center my-3 overflow-y-auto max-h-[340px] p-2">
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 max-w-xl">
            {numbers.map((item) => {
              let bgClass = 'bg-[#111827] border-[#1F293D] text-slate-300';

              if (item.status === 'prime-confirmed') {
                bgClass = 'bg-[#10B981]/25 border-[#10B981] text-[#10B981] font-bold shadow-sm shadow-[#10B981]/20';
              } else if (item.status === 'current-prime') {
                bgClass = 'bg-[#06B6D4]/30 border-2 border-[#06B6D4] text-cyan-200 font-extrabold ring-2 ring-[#06B6D4]/50 animate-pulse';
              } else if (item.status === 'crossing-multiple') {
                bgClass = 'bg-[#F43F5E]/40 border-2 border-[#F43F5E] text-rose-200 font-bold scale-95 transition-all';
              } else if (item.status === 'composite') {
                bgClass = 'bg-[#0E1420] border-[#1F2937] text-slate-600 line-through opacity-50';
              }

              return (
                <div
                  key={item.val}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex flex-col items-center justify-center font-mono text-xs transition-all relative ${bgClass}`}
                >
                  <span className="text-xs font-bold">{item.val}</span>
                  {item.eliminatedBy && (
                    <span className="text-[7px] text-rose-400/80 font-normal">
                      ÷{item.eliminatedBy}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Legend & Primes List */}
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> Prime
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#06B6D4]" /> Current P
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#F43F5E]" /> Multiple
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-700 opacity-50" /> Composite
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-sm">
            <span className="text-slate-500 shrink-0">Primes:</span>
            <span className="text-emerald-300 font-bold truncate">
              {primesFound.join(', ') || 'None yet'}
            </span>
          </div>
        </div>
      </div>
    );
  },
};
