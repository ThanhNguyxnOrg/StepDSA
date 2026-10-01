import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface NQueensInput {
  n: number;
}

export interface NQueensState {
  boardSize: number;
  queens: number[]; // queens[row] = col, -1 if no queen in row
  currentRow: number;
  currentCol: number;
  isConflict: boolean;
  conflictDetails?: string;
  solutionsFound: number;
  actionPhase: 'TRY' | 'SUCCESS' | 'BACKTRACK' | 'DONE';
}

const defaultNQueensInput: NQueensInput = {
  n: 4,
};

export const nQueensModule: AlgorithmModule<NQueensInput, NQueensState> = {
  id: 'n-queens',
  title: 'N-Queens (Backtracking State-Space)',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N!)',
    timeAverage: 'O(N!) with state pruning',
    timeWorst: 'O(N!)',
    spaceAuxiliary: 'O(N) for board configuration and recursion stack',
    worstCaseCondition: 'Exploring the combinatorial state-space tree of size N^N with diagonal pruning',
  },
  theory: {
    overview:
      'The N-Queens problem is the quintessential backtracking challenge: place N chess queens on an N×N chessboard such that no two queens attack each other (i.e. no two queens share the same row, column, or diagonal). Backtracking systematically explores the solution tree, abandoning (pruning) dead-end branches as soon as a conflict is detected.',
    whyItWorks:
      'By placing queens row-by-row, row conflicts are automatically impossible. At row r, we test columns c in 0 ... N-1 for column and diagonal safety. If no column is safe, we immediately backtrack to row r - 1, removing the queen and trying the next available column.',
    invariant:
      'At any row r, all placed queens in rows 0 ... r-1 are mutually non-attacking.',
    pitfalls: [
      'Two queens at (r1, c1) and (r2, c2) share a diagonal if and only if |r1 - r2| == |c1 - c2|.',
      'Exponential explosion: N=4 has 2 solutions; N=8 has 92 solutions; limit interactive visualizers to N <= 6 for responsive playback.',
    ],
  },
  presets: [
    {
      id: '4-queens',
      label: '4-Queens (2 Solutions)',
      description: 'Compact 4×4 board, 2 total solutions',
      data: defaultNQueensInput,
    },
    {
      id: '5-queens',
      label: '5-Queens (10 Solutions)',
      description: '5×5 board with deeper backtracking branches',
      data: { n: 5 },
    },
  ],
  defaultInput: defaultNQueensInput,
  codeSnippets: {
    python: `def solve_n_queens(n):
    res = []
    board = [-1] * n

    def is_safe(row, col):
        for r in range(row):
            c = board[r]
            if c == col or abs(r - row) == abs(c - col):
                return False
        return True

    def backtrack(row):
        if row == n:
            res.append(board[:])
            return
        for col in range(n):
            if is_safe(row, col):
                board[row] = col
                backtrack(row + 1)
                board[row] = -1 # Backtrack

    backtrack(0)
    return res`,
    typescript: `function solveNQueens(n: number): number[][] {
  const solutions: number[][] = [];
  const board: number[] = new Array(n).fill(-1);

  function isSafe(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      const c = board[r];
      if (c === col || Math.abs(r - row) === Math.abs(c - col)) {
        return false;
      }
    }
    return true;
  }

  function backtrack(row: number): void {
    if (row === n) {
      solutions.push([...board]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row] = col;
        backtrack(row + 1);
        board[row] = -1; // Backtrack
      }
    }
  }

  backtrack(0);
  return solutions;
}`,
    cpp: `void solve(int row, int n, vector<int>& board, vector<vector<int>>& solutions) {
    if (row == n) {
        solutions.push_back(board);
        return;
    }
    for (int col = 0; col < n; col++) {
        bool safe = true;
        for (int r = 0; r < row; r++) {
            if (board[r] == col || abs(r - row) == abs(board[r] - col)) {
                safe = false; break;
            }
        }
        if (safe) {
            board[row] = col;
            solve(row + 1, n, board, solutions);
            board[row] = -1; // Backtrack
        }
    }
}`,
    java: `void backtrack(int row, int n, int[] board, List<int[]> solutions) {
    if (row == n) {
        solutions.add(board.clone());
        return;
    }
    for (int col = 0; col < n; col++) {
        boolean safe = true;
        for (int r = 0; r < row; r++) {
            if (board[r] == col || Math.abs(r - row) == Math.abs(board[r] - col)) {
                safe = false; break;
            }
        }
        if (safe) {
            board[row] = col;
            backtrack(row + 1, n, board, solutions);
            board[row] = -1; // Backtrack
        }
    }
}`,
    pseudocode: `procedure NQueens(row):
    if row == N: record_solution()
    for col = 0 to N - 1:
        if is_safe(row, col):
            place_queen(row, col)
            NQueens(row + 1)
            remove_queen(row, col) # Backtrack`,
  },

  generateTimeline: (input: NQueensInput): ExecutionFrame<NQueensState>[] => {
    const frames: ExecutionFrame<NQueensState>[] = [];
    const n = Math.min(Math.max(input.n, 4), 6);
    const board: number[] = new Array(n).fill(-1);
    let solutionsCount = 0;

    const makeState = (
      row: number,
      col: number,
      isConflict = false,
      conflictDetails?: string,
      action: 'TRY' | 'SUCCESS' | 'BACKTRACK' | 'DONE' = 'TRY'
    ): NQueensState => ({
      boardSize: n,
      queens: [...board],
      currentRow: row,
      currentCol: col,
      isConflict,
      conflictDetails,
      solutionsFound: solutionsCount,
      actionPhase: action,
    });

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized ${n}×${n} Chessboard. Objective: place ${n} mutually non-attacking queens using backtracking search.`,
      isMilestone: true,
      milestoneTitle: `Init ${n}×${n} Board`,
      soundCue: { type: 'start' },
      variables: { boardSize: n, totalQueensToPlace: n, solutionsCount: 0 },
      callStack: [{ name: 'solveNQueens', params: { n }, line: 1, isCurrent: true }],
      conditionEval: { expr: `n >= 4`, result: n >= 4 },
      scopeVariables: { boardSize: n, totalQueensToPlace: n },
      state: makeState(0, 0, false, undefined, 'TRY'),
    });

    const isSafe = (
      row: number,
      col: number
    ): { safe: boolean; reason?: string } => {
      for (let r = 0; r < row; r++) {
        const c = board[r];
        if (c === col) {
          return { safe: false, reason: `Column conflict with Queen at (${r}, ${c})` };
        }
        if (Math.abs(r - row) === Math.abs(c - col)) {
          return { safe: false, reason: `Diagonal conflict with Queen at (${r}, ${c})` };
        }
      }
      return { safe: true };
    };

    const backtrack = (row: number) => {
      if (row === n) {
        solutionsCount++;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `👑 SOLUTION #${solutionsCount} FOUND! All ${n} queens safely placed at positions: [${board.map((c, r) => `(${r},${c})`).join(', ')}].`,
          isMilestone: true,
          milestoneTitle: `Solution #${solutionsCount}`,
          soundCue: { type: 'complete' },
          variables: { solutionNumber: solutionsCount, queenCoords: board.join(', '), row },
          callStack: [{ name: 'recordSolution', params: { solutionId: solutionsCount }, line: 8, isCurrent: true }],
          conditionEval: { expr: `row == n (${row} == ${n})`, result: true },
          scopeVariables: { solutionNumber: solutionsCount, queenCoords: board.join(', ') },
          state: makeState(row - 1, board[row - 1], false, undefined, 'SUCCESS'),
        });
        return;
      }

      for (let col = 0; col < n; col++) {
        const check = isSafe(row, col);

        if (!check.safe) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            explanation: `Testing square (${row}, ${col}): ❌ Rejected! ${check.reason}.`,
            soundCue: { type: 'compare' },
            variables: { row, col, safe: false, conflict: check.reason || 'Collision' },
            callStack: [{ name: 'isSafe', params: { row, col }, line: 12, isCurrent: true }],
            conditionEval: { expr: `isSafe(${row}, ${col})`, result: false },
            scopeVariables: { row, col, conflict: check.reason || 'Collision' },
            state: makeState(row, col, true, check.reason, 'TRY'),
          });
        } else {
          board[row] = col;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 14,
            explanation: `Square (${row}, ${col}) is SAFE! Placed Queen #${row + 1}. Recursing to Row ${row + 1}.`,
            soundCue: { type: 'swap' },
            isMilestone: true,
            milestoneTitle: `Place Q at (${row},${col})`,
            variables: { row, col, placedQueens: row + 1, safe: true },
            callStack: [{ name: 'placeQueen', params: { row, col }, line: 14, isCurrent: true }],
            conditionEval: { expr: `isSafe(${row}, ${col})`, result: true },
            scopeVariables: { row, col, placedQueens: row + 1 },
            state: makeState(row, col, false, undefined, 'TRY'),
          });

          backtrack(row + 1);

          // Backtrack
          board[row] = -1;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 16,
            explanation: `↩️ Backtracking from Row ${row + 1}: Removed Queen from (${row}, ${col}). Testing subsequent columns.`,
            soundCue: { type: 'step' },
            isMilestone: true,
            milestoneTitle: `Backtrack from Row ${row + 1}`,
            variables: { row, col, backtracked: true, unplacedQueen: row + 1 },
            callStack: [{ name: 'backtrack', params: { row, col }, line: 16, isCurrent: true }],
            conditionEval: { expr: `board[${row}] == -1`, result: true },
            scopeVariables: { row, col, backtracked: true },
            state: makeState(row, col, false, undefined, 'BACKTRACK'),
          });
        }
      }
    };

    backtrack(0);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: `🎉 N-Queens state-space search complete! Found ${solutionsCount} distinct valid non-attacking configurations for N = ${n}.`,
      isMilestone: true,
      milestoneTitle: 'Search Complete',
      soundCue: { type: 'complete' },
      variables: { totalSolutions: solutionsCount, n, searchFinished: true },
      callStack: [{ name: 'solveNQueens.done', params: { solutions: solutionsCount }, line: 18, isCurrent: true }],
      conditionEval: { expr: `solutionsCount >= 0`, result: true },
      scopeVariables: { totalSolutions: solutionsCount },
      state: makeState(-1, -1, false, undefined, 'DONE'),
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<NQueensState>) => {
    const { boardSize, queens, currentRow, currentCol, isConflict, conflictDetails, solutionsFound, actionPhase } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Board Size: <span className="text-amber-400 font-bold">{boardSize}×{boardSize}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Solutions Found: <span className="text-emerald-400 font-bold">{solutionsFound}</span>
          </div>
          {isConflict && conflictDetails && (
            <div className="px-3.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-mono">
              {conflictDetails}
            </div>
          )}
          {actionPhase === 'BACKTRACK' && (
            <div className="px-3.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500 text-indigo-300 text-xs font-mono font-bold animate-pulse">
              ↩️ Backtracking
            </div>
          )}
        </div>

        {/* N×N Chessboard */}
        <div className="p-3 rounded-2xl bg-slate-950/90 border-2 border-slate-800 shadow-2xl flex flex-col gap-1">
          {Array.from({ length: boardSize }).map((_, r) => (
            <div key={r} className="flex gap-1">
              {Array.from({ length: boardSize }).map((_, c) => {
                const hasQueen = queens[r] === c;
                const isTesting = r === currentRow && c === currentCol;
                const isDarkSquare = (r + c) % 2 === 1;

                let squareBg = isDarkSquare ? 'bg-slate-800/80' : 'bg-slate-700/50';
                if (hasQueen) squareBg = 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
                if (isTesting && isConflict) squareBg = 'bg-rose-950/80 border-rose-500 text-rose-300';
                else if (isTesting && !hasQueen) squareBg = 'bg-amber-950/60 border-amber-400 text-amber-200';

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-all duration-200 ${squareBg} ${
                      isTesting ? 'ring-2 ring-white scale-105 z-10' : 'border-slate-700/60'
                    }`}
                  >
                    {hasQueen ? (
                      <span className="text-2xl drop-shadow-md">👑</span>
                    ) : isTesting && isConflict ? (
                      <span className="text-xs font-mono font-bold text-rose-400">✕</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500">
                        {r},{c}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
};
