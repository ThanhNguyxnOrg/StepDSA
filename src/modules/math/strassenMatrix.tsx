import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface StrassenState {
  matrixA: number[][];
  matrixB: number[][];
  matrixC: number[][];
  activeM: number | null;
  mProducts: { label: string; formula: string; val: number }[];
  highlightQuadrant: '11' | '12' | '21' | '22' | null;
  message: string;
}

export const strassenMatrixModule: AlgorithmModule<
  { matrixA: number[][]; matrixB: number[][] },
  StrassenState
> = {
  id: 'strassen-matrix',
  title: "Strassen's Matrix Multiplication (Sub-Cubic O(N^2.807) Block Algebra)",
  category: 'math',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N^2.807) sub-cubic matrix multiplication',
    timeAverage: 'O(N^2.807) across all dense matrices',
    timeWorst: 'O(N^2.807) vs naive O(N^3)',
    spaceAuxiliary: 'O(N^2) recursive sub-block allocations',
    worstCaseCondition: 'Recursion down to base 1x1 or 2x2 base cases with small constant factor crossovers',
  },
  theory: {
    overview:
      "Strassen's algorithm (1969) was the first algorithm to achieve sub-cubic time complexity for matrix multiplication by reducing the number of 2x2 recursive block multiplications from 8 to 7, resulting in T(N) = 7T(N/2) + O(N^2) = O(N^log2(7)) ≈ O(N^2.807).",
    whyItWorks:
      'Standard matrix multiplication requires 8 recursive calls to compute C11, C12, C21, C22. Volker Strassen devised clever algebraic combinations to compute 7 intermediate products (M1 through M7) using only matrix additions/subtractions, successfully eliminating one recursive multiplication.',
    invariant:
      'Algebraic Equivalence Invariant: At all dimensions, C11 = M1 + M4 - M5 + M7, C12 = M3 + M5, C21 = M2 + M4, and C22 = M1 - M2 + M3 + M6.',
    pitfalls: [
      'Numerical stability: Strassen is less numerically stable than standard multiplication due to catastrophic cancellation in floating-point subtractions.',
      'Crossover threshold: For small matrices (N < 64), cache effects and addition overhead make naive O(N^3) faster in practice.',
    ],
  },
  defaultInput: {
    matrixA: [
      [1, 2],
      [3, 4],
    ],
    matrixB: [
      [5, 6],
      [7, 8],
    ],
  },
  presets: [
    {
      id: 'standard-2x2',
      label: 'Standard 2x2 Matrix',
      description: 'Values 1-4 and 5-8 testing 7-product block algebra',
      data: {
        matrixA: [
          [1, 2],
          [3, 4],
        ],
        matrixB: [
          [5, 6],
          [7, 8],
        ],
      },
    },
    {
      id: 'diagonal-identity',
      label: 'Diagonal & Identity 2x2',
      description: 'Sparse matrices demonstrating sub-cubic operations',
      data: {
        matrixA: [
          [2, 0],
          [0, 3],
        ],
        matrixB: [
          [4, 1],
          [2, 5],
        ],
      },
    },
  ],
  codeSnippets: {
    cpp: `// Strassen's 7 Products:
int M1 = (A11 + A22) * (B11 + B22);
int M2 = (A21 + A22) * B11;
int M3 = A11 * (B12 - B22);
int M4 = A22 * (B21 - B11);
int M5 = (A11 + A12) * B22;
int M6 = (A21 - A11) * (B11 + B12);
int M7 = (A12 - A22) * (B21 + B22);

// Recombination:
int C11 = M1 + M4 - M5 + M7;
int C12 = M3 + M5;
int C21 = M2 + M4;
int C22 = M1 - M2 + M3 + M6;`,
    python: `# Strassen 7 products
m1 = (a11 + a22) * (b11 + b22)
m2 = (a21 + a22) * b11
m3 = a11 * (b12 - b22)
m4 = a22 * (b21 - b11)
m5 = (a11 + a12) * b22
m6 = (a21 - a11) * (b11 + b12)
m7 = (a12 - a22) * (b21 + b22)

c11 = m1 + m4 - m5 + m7
c12 = m3 + m5
c21 = m2 + m4
c22 = m1 - m2 + m3 + m6`,
    typescript: `const M1 = (a11 + a22) * (b11 + b22);
const M2 = (a21 + a22) * b11;
const M3 = a11 * (b12 - b22);
const M4 = a22 * (b21 - b11);
const M5 = (a11 + a12) * b22;
const M6 = (a21 - a11) * (b11 + b12);
const M7 = (a12 - a22) * (b21 + b22);

const C11 = M1 + M4 - M5 + M7;
const C12 = M3 + M5;
const C21 = M2 + M4;
const C22 = M1 - M2 + M3 + M6;`,
    java: `int m1 = (a11 + a22) * (b11 + b22);
// Recurrence: T(N) = 7 * T(N/2) + O(N^2) => O(N^2.807)`,
    pseudocode: `compute M1 through M7 using 7 multiplications
C11 = M1 + M4 - M5 + M7
C12 = M3 + M5
C21 = M2 + M4
C22 = M1 - M2 + M3 + M6`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<StrassenState>[] = [];
    const A = input.matrixA;
    const B = input.matrixB;

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: StrassenState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    const a11 = A[0][0], a12 = A[0][1], a21 = A[1][0], a22 = A[1][1];
    const b11 = B[0][0], b12 = B[0][1], b21 = B[1][0], b22 = B[1][1];

    addFrame(
      1,
      `Loaded 2x2 Matrices A and B. Preparing Strassen 7-product sub-cubic decomposition.`,
      {
        matrixA: A,
        matrixB: B,
        matrixC: [[0, 0], [0, 0]],
        activeM: null,
        mProducts: [],
        highlightQuadrant: null,
        message: 'Matrices partitioned into quadrants. Ready to calculate M1 through M7.',
      },
      {
        action: 'INIT',
        variables: { a11, a12, a21, a22, b11, b12, b21, b22 },
        callStack: [{ name: 'strassenMultiply', params: { N: 2 } }],
      }
    );

    const mDefs = [
      { label: 'M1', formula: '(A11 + A22) * (B11 + B22)', val: (a11 + a22) * (b11 + b22) },
      { label: 'M2', formula: '(A21 + A22) * B11', val: (a21 + a22) * b11 },
      { label: 'M3', formula: 'A11 * (B12 - B22)', val: a11 * (b12 - b22) },
      { label: 'M4', formula: 'A22 * (B21 - B11)', val: a22 * (b21 - b11) },
      { label: 'M5', formula: '(A11 + A12) * B22', val: (a11 + a12) * b22 },
      { label: 'M6', formula: '(A21 - A11) * (B11 + B12)', val: (a21 - a11) * (b11 + b12) },
      { label: 'M7', formula: '(A12 - A22) * (B21 + B22)', val: (a12 - a22) * (b21 + b22) },
    ];

    const currentM: typeof mDefs = [];

    for (let i = 0; i < mDefs.length; i++) {
      const m = mDefs[i];
      currentM.push(m);

      addFrame(
        4 + i,
        `Computed ${m.label} = ${m.formula} = ${m.val}.`,
        {
          matrixA: A,
          matrixB: B,
          matrixC: [[0, 0], [0, 0]],
          activeM: i + 1,
          mProducts: [...currentM],
          highlightQuadrant: null,
          message: `Calculated Strassen intermediate product ${m.label} = ${m.val}.`,
        },
        {
          action: 'COMPUTE_PRODUCT',
          variables: { product: m.label, value: m.val },
          callStack: [{ name: 'computeProduct', params: { label: m.label, val: m.val } }],
        }
      );
    }

    const m1 = mDefs[0].val;
    const m2 = mDefs[1].val;
    const m3 = mDefs[2].val;
    const m4 = mDefs[3].val;
    const m5 = mDefs[4].val;
    const m6 = mDefs[5].val;
    const m7 = mDefs[6].val;

    const c11 = m1 + m4 - m5 + m7;
    const c12 = m3 + m5;
    const c21 = m2 + m4;
    const c22 = m1 - m2 + m3 + m6;

    const cMatrix = [
      [c11, c12],
      [c21, c22],
    ];

    addFrame(
      12,
      `Recombined C11 = M1 + M4 - M5 + M7 = ${m1} + ${m4} - ${m5} + ${m7} = ${c11}.`,
      {
        matrixA: A,
        matrixB: B,
        matrixC: [[c11, 0], [0, 0]],
        activeM: null,
        mProducts: currentM,
        highlightQuadrant: '11',
        message: `C11 recombined: ${c11}.`,
      },
      {
        action: 'COMBINE_C11',
        variables: { c11 },
        callStack: [{ name: 'combineC11', params: { c11 } }],
      }
    );

    addFrame(
      14,
      `Recombined C12 = M3 + M5 = ${m3} + ${m5} = ${c12}.`,
      {
        matrixA: A,
        matrixB: B,
        matrixC: [[c11, c12], [0, 0]],
        activeM: null,
        mProducts: currentM,
        highlightQuadrant: '12',
        message: `C12 recombined: ${c12}.`,
      },
      {
        action: 'COMBINE_C12',
        variables: { c12 },
        callStack: [{ name: 'combineC12', params: { c12 } }],
      }
    );

    addFrame(
      16,
      `Recombined C21 = M2 + M4 = ${m2} + ${m4} = ${c21}.`,
      {
        matrixA: A,
        matrixB: B,
        matrixC: [[c11, c12], [c21, 0]],
        activeM: null,
        mProducts: currentM,
        highlightQuadrant: '21',
        message: `C21 recombined: ${c21}.`,
      },
      {
        action: 'COMBINE_C21',
        variables: { c21 },
        callStack: [{ name: 'combineC21', params: { c21 } }],
      }
    );

    addFrame(
      18,
      `Recombined C22 = M1 - M2 + M3 + M6 = ${m1} - ${m2} + ${m3} + ${m6} = ${c22}.`,
      {
        matrixA: A,
        matrixB: B,
        matrixC: cMatrix,
        activeM: null,
        mProducts: currentM,
        highlightQuadrant: '22',
        message: `C22 recombined: ${c22}. Full product matrix C established.`,
      },
      {
        action: 'COMBINE_C22',
        variables: { c22 },
        callStack: [{ name: 'combineC22', params: { c22 } }],
      }
    );

    addFrame(
      22,
      `Strassen Multiplication complete. Verified C = A * B. Saved 1 recursive multiplication per block level!`,
      {
        matrixA: A,
        matrixB: B,
        matrixC: cMatrix,
        activeM: null,
        mProducts: currentM,
        highlightQuadrant: null,
        message: `Strassen multiplication finalized with 7 products instead of 8. Asymptotic complexity: O(N^2.807).`,
      },
      {
        action: 'COMPLETE',
        variables: { N: 2, multiplicationsSaved: 1 },
        callStack: [{ name: 'complete', params: { ops: 7 } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<StrassenState>) => {
    const { matrixA, matrixB, matrixC, activeM, mProducts, highlightQuadrant, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Matrix Equation Display: A * B = C */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
          {/* Matrix A */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs font-mono text-cyan-400 font-bold">Matrix A</span>
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-900/80 border border-slate-700 rounded-xl font-mono text-sm font-bold">
              <div className="w-10 h-10 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-center">
                {matrixA[0][0]}
              </div>
              <div className="w-10 h-10 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-center">
                {matrixA[0][1]}
              </div>
              <div className="w-10 h-10 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-center">
                {matrixA[1][0]}
              </div>
              <div className="w-10 h-10 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-center">
                {matrixA[1][1]}
              </div>
            </div>
          </div>

          <span className="text-xl font-bold text-slate-500">×</span>

          {/* Matrix B */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs font-mono text-indigo-400 font-bold">Matrix B</span>
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-900/80 border border-slate-700 rounded-xl font-mono text-sm font-bold">
              <div className="w-10 h-10 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 flex items-center justify-center">
                {matrixB[0][0]}
              </div>
              <div className="w-10 h-10 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 flex items-center justify-center">
                {matrixB[0][1]}
              </div>
              <div className="w-10 h-10 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 flex items-center justify-center">
                {matrixB[1][0]}
              </div>
              <div className="w-10 h-10 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 flex items-center justify-center">
                {matrixB[1][1]}
              </div>
            </div>
          </div>

          <span className="text-xl font-bold text-slate-500">=</span>

          {/* Matrix C */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs font-mono text-emerald-400 font-bold">Result Matrix C</span>
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-900/80 border border-slate-700 rounded-xl font-mono text-sm font-bold">
              <div
                className={`w-10 h-10 rounded border flex items-center justify-center transition-all ${
                  highlightQuadrant === '11'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 scale-105 shadow-md'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {matrixC[0][0]}
              </div>
              <div
                className={`w-10 h-10 rounded border flex items-center justify-center transition-all ${
                  highlightQuadrant === '12'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 scale-105 shadow-md'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {matrixC[0][1]}
              </div>
              <div
                className={`w-10 h-10 rounded border flex items-center justify-center transition-all ${
                  highlightQuadrant === '21'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 scale-105 shadow-md'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {matrixC[1][0]}
              </div>
              <div
                className={`w-10 h-10 rounded border flex items-center justify-center transition-all ${
                  highlightQuadrant === '22'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 scale-105 shadow-md'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {matrixC[1][1]}
              </div>
            </div>
          </div>
        </div>

        {/* 7 Products Breakdown */}
        <div className="w-full flex flex-col p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Strassen's 7 Sub-Cubic Intermediate Multiplications
            </span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Saved 1 multiplication / block
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-xs">
            {mProducts.map((m, idx) => {
              const isCurrent = activeM === idx + 1;
              return (
                <div
                  key={`m-prod-${idx}`}
                  className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-indigo-400 font-bold">{m.label}:</span>
                  <span className="text-slate-400 text-[11px]">{m.formula}</span>
                  <span className="text-emerald-400 font-bold">= {m.val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
