import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BinaryExpInput {
  base: number;
  power: number;
  mod: number;
}

export interface BinaryExpStep {
  bitIndex: number;
  bitValue: number;
  currentBase: number;
  currentResult: number;
  currentPower: number;
}

export interface BinaryExpState {
  base: number;
  power: number;
  mod: number;
  currentBase: number;
  currentResult: number;
  remainingPower: number;
  history: BinaryExpStep[];
}

export const binaryExponentiationModule: AlgorithmModule<BinaryExpInput, BinaryExpState> = {
  id: 'binary-exponentiation',
  title: 'Binary Exponentiation (Fast Power)',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(log B)',
    timeAverage: 'O(log B)',
    timeWorst: 'O(log B)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Halves exponent at every iteration regardless of input',
  },
  theory: {
    overview:
      'Binary Exponentiation (Repeated Squaring) calculates a^b in O(log b) operations instead of linear O(b) multiplications by decomposing b into binary bits.',
    whyItWorks:
      'If b is even, a^b = (a^2)^(b/2). If b is odd, a^b = a * a^(b-1). By squaring the base when shifting bits, we cut remaining power in half at each iteration.',
    invariant:
      'At the start of each iteration: (currentResult * (currentBase ^ remainingPower)) % mod == (base ^ power) % mod.',
    pitfalls: [
      'Integer overflow before modulo reduction when multiplying 64-bit integers.',
      'Handling negative exponents without modular multiplicative inverse.',
    ],
  },
  codeSnippets: {
    python: `def power(base, exp, mod=1000000007):
    res = 1
    base = base % mod
    while exp > 0:
        if exp % 2 == 1:
            res = (res * base) % mod
        base = (base * base) % mod
        exp //= 2
    return res`,
    typescript: `function power(base: number, exp: number, mod: number = 1e9 + 7): number {
  let res = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      res = (res * base) % mod;
    }
    base = (base * base) % mod;
    exp = Math.floor(exp / 2);
  }
  return res;
}`,
    cpp: `long long power(long long base, long long exp, long long mod = 1e9 + 7) {
    long long res = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp >>= 1;
    }
    return res;
}`,
    java: `public long power(long base, long exp, long mod) {
    long res = 1;
    base %= mod;
    while (exp > 0) {
        if ((exp & 1) == 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp >>= 1;
    }
    return res;
}`,
    pseudocode: `function power(base, exp, mod):
    res <- 1
    base <- base % mod
    while exp > 0:
        if exp is odd:
            res <- (res * base) % mod
        base <- (base * base) % mod
        exp <- exp / 2
    return res`,
  },
  defaultInput: { base: 3, power: 13, mod: 1000 },
  presets: [
    { id: '3_13', label: '3^13 mod 1000', description: 'Base 3, Exp 13 (binary 1101_2)', data: { base: 3, power: 13, mod: 1000 } },
    { id: '2_10', label: '2^10 mod 10000', description: '2^10 = 1024', data: { base: 2, power: 10, mod: 10000 } },
    { id: '7_16', label: '7^16 mod 100', description: 'Power of 2 exponent', data: { base: 7, power: 16, mod: 100 } },
  ],
  generateTimeline: (input: BinaryExpInput): ExecutionFrame<BinaryExpState>[] => {
    const frames: ExecutionFrame<BinaryExpState>[] = [];
    let curBase = input.base % input.mod;
    let curRes = 1;
    let remExp = input.power;
    const history: BinaryExpStep[] = [];

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize result = 1, base = ${curBase}, exponent = ${remExp} (${remExp.toString(2)} in binary).`,
      state: {
        base: input.base,
        power: input.power,
        mod: input.mod,
        currentBase: curBase,
        currentResult: curRes,
        remainingPower: remExp,
        history: [],
      },
    });

    let bitIdx = 0;
    while (remExp > 0) {
      const isOdd = remExp % 2 === 1;

      // Frame: check LSB
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Check bit ${bitIdx}: exponent ${remExp} is ${isOdd ? 'ODD (bit is 1)' : 'EVEN (bit is 0)'}.`,
        state: {
          base: input.base,
          power: input.power,
          mod: input.mod,
          currentBase: curBase,
          currentResult: curRes,
          remainingPower: remExp,
          history: [...history],
        },
      });

      if (isOdd) {
        curRes = (curRes * curBase) % input.mod;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Bit is 1: multiply result by base (${curBase}) -> result = ${curRes} (mod ${input.mod}).`,
          state: {
            base: input.base,
            power: input.power,
            mod: input.mod,
            currentBase: curBase,
            currentResult: curRes,
            remainingPower: remExp,
            history: [...history],
          },
        });
      }

      history.push({
        bitIndex: bitIdx,
        bitValue: isOdd ? 1 : 0,
        currentBase: curBase,
        currentResult: curRes,
        currentPower: remExp,
      });

      curBase = (curBase * curBase) % input.mod;
      remExp = Math.floor(remExp / 2);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Square base: base = (base²) % mod = ${curBase}, divide exp by 2 -> exp = ${remExp}.`,
        state: {
          base: input.base,
          power: input.power,
          mod: input.mod,
          currentBase: curBase,
          currentResult: curRes,
          remainingPower: remExp,
          history: [...history],
        },
      });

      bitIdx++;
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `Exponent is 0. Final modular power result is ${curRes}.`,
      state: {
        base: input.base,
        power: input.power,
        mod: input.mod,
        currentBase: curBase,
        currentResult: curRes,
        remainingPower: 0,
        history: [...history],
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<BinaryExpState>) => {
    const { base, power, mod, currentBase, currentResult, remainingPower, history } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Expression Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-2xl">
          <span className="text-xl font-bold font-mono text-indigo-400">
            {base}^{power} mod {mod}
          </span>
          <span className="text-slate-500 font-mono text-sm">({power.toString(2)}₂ in binary)</span>
        </div>

        {/* Live Registers */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-amber-500/50">
            <span className="text-xs font-mono text-slate-400">CURRENT RESULT</span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1">{currentResult}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-sky-500/50">
            <span className="text-xs font-mono text-slate-400">CURRENT BASE</span>
            <span className="text-2xl font-bold font-mono text-sky-400 mt-1">{currentBase}</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-emerald-500/50">
            <span className="text-xs font-mono text-slate-400">EXPONENT REMAINING</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1">{remainingPower}</span>
          </div>
        </div>

        {/* Bit Decomposition Log */}
        {history.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
            {history.map((step) => (
              <div
                key={step.bitIndex}
                className={`flex flex-col items-center px-3 py-1.5 rounded-lg border text-xs font-mono ${
                  step.bitValue === 1 ? 'border-amber-500 bg-amber-950/40 text-amber-200' : 'border-slate-700 bg-slate-900/60 text-slate-400'
                }`}
              >
                <span>bit #{step.bitIndex} = {step.bitValue}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">res: {step.currentResult}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
};
