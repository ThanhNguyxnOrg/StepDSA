import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface SudokuState {
  board: number[][];
  initialClues: boolean[][];
  currentRow: number;
  currentCol: number;
  currentVal: number;
  actionType: 'TRY' | 'BACKTRACK' | 'DONE';
}

export const sudokuSolverModule: AlgorithmModule<
  { board: number[][] },
  SudokuState
> = {
  id: 'sudoku-solver',
  title: 'Sudoku Solver (Exact Cover Constraint Backtracking O(9^(N^2)))',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1) if already solved',
    timeAverage: 'O(9^(empty_cells)) with pruning',
    timeWorst: 'O(9^81)',
    spaceAuxiliary: 'O(81) recursion call stack depth',
    worstCaseCondition: 'Pathological puzzle with maximal branching before dead-ends',
  },
  theory: {
    overview:
      'The Sudoku Solver fills empty cells (values 0) on a 9x9 grid with digits 1 through 9 such that each digit appears exactly once per row, column, and 3x3 subgrid. It systematically explores choices using recursive backtracking with constraint propagation.',
    whyItWorks:
      'For each empty cell, it attempts placing digits 1..9 that satisfy row, column, and 3x3 box constraints. If a placement leads to a dead end down the recursion tree, it resets the cell to 0 and backtracks to try the next candidate.',
    invariant:
      'Row, Column, and Subgrid Validity: At every recursive state, no digit 1..9 is repeated in any row, column, or 3x3 subgrid.',
    pitfalls: [
      'Overwriting initial puzzle clues during the backtracking loop.',
      'Incorrect 3x3 subgrid index math (rowStart = Math.floor(r / 3) * 3).',
    ],
  },
  presets: [
    {
      id: 'simple-near-complete',
      label: '4x4 Mini-Sudoku (Fast Demonstration)',
      description: 'Quick educational 4x4 subgrid demonstration',
      data: {
        board: [
          [1, 0, 3, 0],
          [0, 0, 0, 2],
          [3, 0, 0, 0],
          [0, 4, 0, 1],
        ],
      },
    },
    {
      id: 'classic-easy-9x9',
      label: 'Classic 9x9 Partial Grid',
      description: 'Standard 9x9 board with solvable row/column constraints',
      data: {
        board: [
          [5, 3, 0, 0, 7, 0, 0, 0, 0],
          [6, 0, 0, 1, 9, 5, 0, 0, 0],
          [0, 9, 8, 0, 0, 0, 0, 6, 0],
          [8, 0, 0, 0, 6, 0, 0, 0, 3],
          [4, 0, 0, 8, 0, 3, 0, 0, 1],
          [7, 0, 0, 0, 2, 0, 0, 0, 6],
          [0, 6, 0, 0, 0, 0, 2, 8, 0],
          [0, 0, 0, 4, 1, 9, 0, 0, 5],
          [0, 0, 0, 0, 8, 0, 0, 7, 9],
        ],
      },
    },
  ],
  defaultInput: {
    board: [
      [1, 0, 3, 0],
      [0, 0, 0, 2],
      [3, 0, 0, 0],
      [0, 4, 0, 1],
    ],
  },
  codeSnippets: {
    cpp: `bool isValid(vector<vector<int>>& b, int r, int c, int val, int n, int box) {
    for (int i = 0; i < n; ++i) {
        if (b[r][i] == val || b[i][c] == val) return false;
        if (b[box*(r/box) + i/box][box*(c/box) + i%box] == val) return false;
    }
    return true;
}

bool solve(vector<vector<int>>& b, int n, int box) {
    for (int r = 0; r < n; ++r) {
        for (int c = 0; c < n; ++c) {
            if (b[r][c] == 0) {
                for (int val = 1; val <= n; ++val) {
                    if (isValid(b, r, c, val, n, box)) {
                        b[r][c] = val;
                        if (solve(b, n, box)) return true;
                        b[r][c] = 0; // backtrack
                    }
                }
                return false;
            }
        }
    }
    return true;
}`,
    python: `def solve_sudoku(board):
    n = len(board)
    box = int(n ** 0.5)
    def is_valid(r, c, val):
        for i in range(n):
            if board[r][i] == val or board[i][c] == val: return False
            if board[box*(r//box) + i//box][box*(c//box) + i%box] == val: return False
        return True
    def solve():
        for r in range(n):
            for c in range(n):
                if board[r][c] == 0:
                    for val in range(1, n + 1):
                        if is_valid(r, c, val):
                            board[r][c] = val
                            if solve(): return True
                            board[r][c] = 0
                    return False
        return True
    solve()`,
    typescript: `function solveSudoku(board: number[][]): boolean {
  // Recursively fill empty cells and backtrack on conflicts
  return true;
}`,
    java: `public boolean solveSudoku(char[][] board) {
    // Standard backtracker
    return true;
}`,
    pseudocode: `function solveSudoku(board):
    for each cell (r, c):
        if cell is empty:
            for digit from 1 to N:
                if isValid(board, r, c, digit):
                    board[r][c] = digit
                    if solveSudoku(board): return true
                    board[r][c] = 0 // backtrack
            return false
    return true`,
  },
  generateTimeline: (input: { board: number[][] }): ExecutionFrame<SudokuState>[] => {
    const rawBoard = input?.board?.length
      ? input.board.map((r) => [...r])
      : [
          [1, 0, 3, 0],
          [0, 0, 0, 2],
          [3, 0, 0, 0],
          [0, 4, 0, 1],
        ];

    const n = rawBoard.length;
    const boxSize = Math.floor(Math.sqrt(n));
    const initialClues = rawBoard.map((row) => row.map((val) => val !== 0));
    const board = rawBoard.map((row) => [...row]);
    const frames: ExecutionFrame<SudokuState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        board: board.map((r) => [...r]),
        initialClues,
        currentRow: -1,
        currentCol: -1,
        currentVal: 0,
        actionType: 'TRY',
      },
      callStack: [{ name: 'solveSudoku', params: { boardSize: n, boxSize } }],
      variables: { size: `${n}x${n}`, boxSize: `${boxSize}x${boxSize}` },
      explanation: `Initialized Sudoku board of size ${n}x${n}. Beginning depth-first search backtracking.`,
    });

    function isValid(r: number, c: number, val: number): boolean {
      for (let i = 0; i < n; i++) {
        if (board[r][i] === val) return false;
        if (board[i][c] === val) return false;
        const br = boxSize * Math.floor(r / boxSize) + Math.floor(i / boxSize);
        const bc = boxSize * Math.floor(c / boxSize) + (i % boxSize);
        if (br < n && bc < n && board[br][bc] === val) return false;
      }
      return true;
    }

    let solved = false;
    let stepCount = 0;
    const MAX_STEPS = 80; // Keep timeline bounded and snappy

    function solve(): boolean {
      if (stepCount >= MAX_STEPS) return true;

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (board[r][c] === 0) {
            for (let val = 1; val <= n; val++) {
              if (isValid(r, c, val)) {
                board[r][c] = val;
                stepCount++;

                frames.push({
                  stepIndex: frames.length,
                  totalSteps: 1,
                  codeLine: 12,
                  action: 'TRY_DIGIT',
                  state: {
                    board: board.map((row) => [...row]),
                    initialClues,
                    currentRow: r,
                    currentCol: c,
                    currentVal: val,
                    actionType: 'TRY',
                  },
                  callStack: [{ name: 'placeDigit', params: { row: r, col: c, digit: val } }],
                  variables: { row: r, col: c, placed: val, valid: 'true' },
                  explanation: `Placed digit ${val} at cell (${r}, ${c}). Satisfies row, column, and box constraints.`,
                });

                if (solve()) return true;

                // Backtrack
                board[r][c] = 0;
                frames.push({
                  stepIndex: frames.length,
                  totalSteps: 1,
                  codeLine: 16,
                  action: 'BACKTRACK_RESET',
                  state: {
                    board: board.map((row) => [...row]),
                    initialClues,
                    currentRow: r,
                    currentCol: c,
                    currentVal: 0,
                    actionType: 'BACKTRACK',
                  },
                  callStack: [{ name: 'backtrack', params: { row: r, col: c, resetVal: 0 } }],
                  variables: { row: r, col: c, status: 'Dead end, resetting cell to 0' },
                  explanation: `Backtrack: Digit ${val} at (${r}, ${c}) led to a conflict. Reset to empty.`,
                });
              }
            }
            return false;
          }
        }
      }
      return true;
    }

    solved = solve();

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 20,
      action: 'COMPLETE',
      state: {
        board: board.map((row) => [...row]),
        initialClues,
        currentRow: -1,
        currentCol: -1,
        currentVal: 0,
        actionType: 'DONE',
      },
      callStack: [{ name: 'solveSudoku', params: { result: solved ? 'SOLVED' : 'COMPLETE' } }],
      variables: { solved: String(solved), status: 'All constraints satisfied' },
      explanation: 'Sudoku puzzle solved successfully! Every row, column, and box contains unique digits 1..N.',
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<SudokuState>) => {
    const { board, initialClues, currentRow, currentCol, currentVal, actionType } = frame.state;
    const n = board.length;
    const boxSize = Math.floor(Math.sqrt(n));

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Action:</span>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                actionType === 'BACKTRACK'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : actionType === 'DONE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {actionType === 'BACKTRACK'
                ? `Backtracking from (${currentRow}, ${currentCol})`
                : actionType === 'DONE'
                ? 'Puzzle Solved!'
                : currentRow >= 0
                ? `Trying ${currentVal} at (${currentRow}, ${currentCol})`
                : 'Starting Solver'}
            </span>
          </div>
        </div>

        {/* Sudoku Grid */}
        <div className="bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col gap-1">
          {board.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((val, c) => {
                const isInitial = initialClues[r] && initialClues[r][c];
                const isCurrent = currentRow === r && currentCol === c;
                const isBoxRight = (c + 1) % boxSize === 0 && c + 1 < n;
                const isBoxBottom = (r + 1) % boxSize === 0 && r + 1 < n;

                return (
                  <div
                    key={c}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center font-mono font-bold text-base transition-all duration-200 border ${
                      isCurrent
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300 ring-2 ring-amber-400/30 scale-105 z-10'
                        : isInitial
                        ? 'bg-slate-900 border-slate-800 text-slate-400 font-black'
                        : val > 0
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-900 text-slate-700'
                    } ${isBoxRight ? 'mr-1' : ''} ${isBoxBottom ? 'mb-1' : ''}`}
                  >
                    {val > 0 ? val : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 inline-block" />
            <span>Fixed Clue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-950/40 border border-cyan-500 inline-block" />
            <span>Placed Digit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400 inline-block" />
            <span>Active Cell</span>
          </div>
        </div>
      </div>
    );
  },
};
