import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export type BitwiseOp = 'AND' | 'OR' | 'XOR' | 'SHL' | 'SHR';

export interface BitwiseInput {
  a: number;
  b: number;
  op: BitwiseOp;
}

export interface BitwiseState {
  a: number;
  b: number;
  op: BitwiseOp;
  result: number;
  activeBitIndex: number | null;
  phase: 'init' | 'compute' | 'done';
}

export const bitwiseOperationsModule: AlgorithmModule<BitwiseInput, BitwiseState> = {
  id: 'bitwise-operations',
  title: 'Bitwise Manipulation (Binary Registers)',
  category: 'math',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1)',
    timeWorst: 'O(1)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Hardware ALU executes bitwise instructions in single CPU clock cycle',
  },
  theory: {
    overview:
      'Bitwise operations manipulate numbers directly at the binary bit level (0 and 1). In competitive programming and low-level systems, bit manipulation powers fast state masks, subsets, power of two checks, and O(1) mathematical tricks.',
    whyItWorks:
      'Every unsigned 8-bit integer is uniquely represented as sum_{i=0}^7 (bit_i * 2^i). Logical gates (AND, OR, XOR) operate independently on each parallel column bit.',
    invariant:
      'Bit k of (A op B) depends solely on bit k of A and bit k of B (no cross-bit carry overhead).',
    pitfalls: [
      'Operator precedence: addition/subtraction has higher precedence than bitwise AND/OR in C++ and JS (e.g. 1 << a + b is 1 << (a + b)).',
      'Negative signed integers using two\'s complement sign extension on bitwise right shift (>> vs >>>).',
    ],
  },
  codeSnippets: {
    python: `def bitwise_ops(a, b, op):
    if op == 'AND': return a & b
    if op == 'OR':  return a | b
    if op == 'XOR': return a ^ b
    if op == 'SHL': return (a << 1) & 0xFF
    if op == 'SHR': return a >> 1
    return 0`,
    typescript: `function bitwiseOps(a: number, b: number, op: string): number {
  switch (op) {
    case 'AND': return (a & b) & 0xFF;
    case 'OR':  return (a | b) & 0xFF;
    case 'XOR': return (a ^ b) & 0xFF;
    case 'SHL': return (a << 1) & 0xFF;
    case 'SHR': return (a >> 1) & 0xFF;
    default: return 0;
  }
}`,
    cpp: `uint8_t bitwiseOps(uint8_t a, uint8_t b, string op) {
    if (op == "AND") return a & b;
    if (op == "OR")  return a | b;
    if (op == "XOR") return a ^ b;
    if (op == "SHL") return (a << 1);
    if (op == "SHR") return (a >> 1);
    return 0;
}`,
    java: `public int bitwiseOps(int a, int b, String op) {
    switch (op) {
        case "AND": return (a & b) & 0xFF;
        case "OR":  return (a | b) & 0xFF;
        case "XOR": return (a ^ b) & 0xFF;
        case "SHL": return (a << 1) & 0xFF;
        case "SHR": return (a >>> 1) & 0xFF;
        default: return 0;
    }
}`,
    pseudocode: `function bitwise(A, B, op):
    match op:
        "AND": return A & B
        "OR":  return A | B
        "XOR": return A ^ B
        "SHL": return A << 1
        "SHR": return A >> 1`,
  },
  defaultInput: { a: 43, b: 29, op: 'AND' },
  presets: [
    { id: 'and_example', label: 'AND: 43 & 29', description: '00101011 & 00011101 = 00001001 (9)', data: { a: 43, b: 29, op: 'AND' } },
    { id: 'xor_example', label: 'XOR: 60 ^ 13', description: '00111100 ^ 00001101 = 00110001 (49)', data: { a: 60, b: 13, op: 'XOR' } },
    { id: 'or_example', label: 'OR: 18 | 9', description: '00010010 | 00001001 = 00011011 (27)', data: { a: 18, b: 9, op: 'OR' } },
    { id: 'shl_example', label: 'Shift Left (a << 1)', description: '43 << 1 = 86 (x2)', data: { a: 43, b: 1, op: 'SHL' } },
  ],
  generateTimeline: (input: BitwiseInput): ExecutionFrame<BitwiseState>[] => {
    const frames: ExecutionFrame<BitwiseState>[] = [];
    const a = input.a & 0xFF;
    const b = input.b & 0xFF;
    const op = input.op;

    let finalRes = 0;
    if (op === 'AND') finalRes = (a & b) & 0xFF;
    else if (op === 'OR') finalRes = (a | b) & 0xFF;
    else if (op === 'XOR') finalRes = (a ^ b) & 0xFF;
    else if (op === 'SHL') finalRes = (a << 1) & 0xFF;
    else if (op === 'SHR') finalRes = (a >> 1) & 0xFF;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize 8-bit registers: A = ${a} (${a.toString(2).padStart(8, '0')}), B = ${b} (${b.toString(2).padStart(8, '0')}). Operator = ${op}.`,
      isMilestone: true,
      milestoneTitle: 'Registers Initialized',
      soundCue: { type: 'start' },
      variables: { a, b, op, 'binaryA': a.toString(2).padStart(8, '0'), 'binaryB': b.toString(2).padStart(8, '0') },
      callStack: [{ name: 'bitwiseOp', params: { a, b, op }, line: 2, isCurrent: true }],
      conditionEval: { expr: `op === '${op}'`, result: true },
      state: {
        a,
        b,
        op,
        result: 0,
        activeBitIndex: null,
        phase: 'init',
      },
    });

    // Step through each bit 7 down to 0
    let runningRes = 0;
    for (let bit = 7; bit >= 0; bit--) {
      const bitA = (a >> bit) & 1;
      const bitB = (b >> bit) & 1;
      let bitRes = 0;

      if (op === 'AND') bitRes = bitA & bitB;
      else if (op === 'OR') bitRes = bitA | bitB;
      else if (op === 'XOR') bitRes = bitA ^ bitB;
      else if (op === 'SHL') bitRes = bit > 0 ? (a >> (bit - 1)) & 1 : 0;
      else if (op === 'SHR') bitRes = bit < 7 ? (a >> (bit + 1)) & 1 : 0;

      runningRes |= (bitRes << bit);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Bit index ${bit} (weight 2^${bit}=${1 << bit}): bitA=${bitA} ${op} bitB=${bitB} -> bitResult=${bitRes}. Running result = ${runningRes}.`,
        soundCue: { type: bitRes ? 'swap' : 'step' },
        variables: { bit, bitA, bitB, bitRes, runningRes, op },
        callStack: [{ name: 'computeBit', params: { bit, bitA, bitB }, line: 4, isCurrent: true }],
        conditionEval: { expr: `bitResult == 1`, result: bitRes === 1 },
        state: {
          a,
          b,
          op,
          result: runningRes,
          activeBitIndex: bit,
          phase: 'compute',
        },
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: `Operation complete: ${a} ${op} ${b} = ${finalRes} (${finalRes.toString(2).padStart(8, '0')} in binary).`,
      isMilestone: true,
      milestoneTitle: `Result: ${finalRes}`,
      soundCue: { type: 'complete' },
      variables: { a, b, op, finalRes, 'binaryResult': finalRes.toString(2).padStart(8, '0'), completed: true },
      callStack: [{ name: 'bitwiseOp.done', params: { result: finalRes }, line: 6, isCurrent: true }],
      conditionEval: { expr: `bit == -1`, result: true },
      state: {
        a,
        b,
        op,
        result: finalRes,
        activeBitIndex: null,
        phase: 'done',
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<BitwiseState>) => {
    const { a, b, op, result, activeBitIndex } = frame.state;

    const renderBits = (val: number, label: string, color: string) => {
      const bits = val.toString(2).padStart(8, '0').split('');
      return (
        <div className="flex items-center gap-4">
          <span className="w-20 text-xs font-mono text-slate-400 text-right">{label}</span>
          <div className="flex items-center gap-1.5">
            {bits.map((bit, idx) => {
              const bitPos = 7 - idx;
              const isActive = activeBitIndex === bitPos;
              return (
                <div
                  key={idx}
                  className={`w-9 h-12 rounded-lg border flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? 'border-amber-400 bg-amber-950/60 ring-2 ring-amber-400 scale-105'
                      : bit === '1'
                      ? `${color} border-slate-600 font-bold`
                      : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <span className="text-base font-mono">{bit}</span>
                  <span className="text-[8px] font-mono text-slate-500">2^{bitPos}</span>
                </div>
              );
            })}
          </div>
          <span className="w-12 text-sm font-mono font-bold text-white text-left pl-2">= {val}</span>
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Operator Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 px-6 py-2 rounded-xl">
          <span className="text-xs font-mono text-slate-400">ACTIVE OPERATION:</span>
          <span className="text-lg font-bold font-mono text-amber-400">{op}</span>
        </div>

        {/* Binary Register Rows */}
        <div className="flex flex-col gap-3 p-6 bg-slate-950/60 border border-slate-800 rounded-2xl">
          {renderBits(a, `Register A`, 'bg-indigo-950/60 text-indigo-300')}
          {op !== 'SHL' && op !== 'SHR' && renderBits(b, `Register B`, 'bg-sky-950/60 text-sky-300')}
          <div className="w-full h-px bg-slate-700 my-1"></div>
          {renderBits(result, `Result`, 'bg-emerald-950/70 text-emerald-300')}
        </div>
      </div>
    );
  },
};
