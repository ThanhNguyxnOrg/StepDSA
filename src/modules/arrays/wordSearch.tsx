import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface WordSearchState {
  board: string[][];
  word: string;
  visited: [number, number][];
  currentPos: [number, number] | null;
  matchedLength: number;
  found: boolean;
}

export const wordSearchModule: AlgorithmModule<
  { board: string[][]; word: string },
  WordSearchState
> = {
  id: 'word-search',
  title: 'Word Search in 2D Grid (Directional DFS Backtracking O(N * 4^L))',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(L)',
    timeAverage: 'O(R * C * 4^L)',
    timeWorst: 'O(R * C * 4^L)',
    spaceAuxiliary: 'O(L) recursion call stack depth',
    worstCaseCondition: 'Grid filled with matching prefixes that diverge at the final character',
  },
  theory: {
    overview:
      'Word Search determines whether a given word exists in an R x C grid of letters. The word can be constructed from sequentially adjacent cells (horizontally or vertically neighboring), where the same letter cell cannot be used more than once.',
    whyItWorks:
      'Explores potential paths using Depth-First Search with backtracking. When checking cell (r, c) for word[idx]: if character matches, mark cell as visited, branch into 4 cardinal directions (up, down, left, right) for word[idx + 1], and backtrack (unmark) upon returning.',
    invariant:
      'Prefix Validity Invariant: At recursive depth k, the sequence of visited cells (c_0, ..., c_k) forms a valid, non-self-intersecting grid path spelling word[0..k].',
    pitfalls: [
      'Reusing the same cell multiple times in a single word path.',
      'Forgetting to unmark/restore the visited cell state during backtracking.',
      'Out-of-bounds array access on boundary cells.',
    ],
  },
  presets: [
    {
      id: 'classic-abcced',
      label: 'Classic Grid: Find "ABCCED"',
      description: 'Standard 3x4 board containing ABCCED along an S-shaped path',
      data: {
        board: [
          ['A', 'B', 'C', 'E'],
          ['S', 'F', 'C', 'S'],
          ['A', 'D', 'E', 'E'],
        ],
        word: 'ABCCED',
      },
    },
    {
      id: 'find-see',
      label: 'Short Word: Find "SEE"',
      description: 'Target word SEE in the bottom right corner',
      data: {
        board: [
          ['A', 'B', 'C', 'E'],
          ['S', 'F', 'C', 'S'],
          ['A', 'D', 'E', 'E'],
        ],
        word: 'SEE',
      },
    },
    {
      id: 'word-not-found',
      label: 'Not Found: Find "ABCB"',
      description: 'Cannot reuse B on the same path, fails gracefully',
      data: {
        board: [
          ['A', 'B', 'C', 'E'],
          ['S', 'F', 'C', 'S'],
          ['A', 'D', 'E', 'E'],
        ],
        word: 'ABCB',
      },
    },
  ],
  defaultInput: {
    board: [
      ['A', 'B', 'C', 'E'],
      ['S', 'F', 'C', 'S'],
      ['A', 'D', 'E', 'E'],
    ],
    word: 'ABCCED',
  },
  codeSnippets: {
    cpp: `bool exist(vector<vector<char>>& board, string word) {
    int R = board.size(), C = board[0].size();
    auto dfs = [&](auto& self, int r, int c, int idx) -> bool {
        if (idx == word.size()) return true;
        if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] != word[idx])
            return false;
        char temp = board[r][c];
        board[r][c] = '#';
        bool found = self(self, r+1, c, idx+1) || self(self, r-1, c, idx+1) ||
                     self(self, r, c+1, idx+1) || self(self, r, c-1, idx+1);
        board[r][c] = temp;
        return found;
    };
    for (int r = 0; r < R; ++r)
        for (int c = 0; c < C; ++c)
            if (dfs(dfs, r, c, 0)) return true;
    return false;
}`,
    python: `def exist(board: list[list[str]], word: str) -> bool:
    R, C = len(board), len(board[0])
    def dfs(r, c, idx):
        if idx == len(word):
            return True
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[idx]:
            return False
        temp, board[r][c] = board[r][c], '#'
        res = (dfs(r+1, c, idx+1) or dfs(r-1, c, idx+1) or
               dfs(r, c+1, idx+1) or dfs(r, c-1, idx+1))
        board[r][c] = temp
        return res
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))`,
    typescript: `function exist(board: string[][], word: string): boolean {
  const R = board.length, C = board[0].length;
  function dfs(r: number, c: number, idx: number): boolean {
    if (idx === word.length) return true;
    if (r < 0 || r >= R || c < 0 || c >= C || board[r][c] !== word[idx]) return false;
    const temp = board[r][c];
    board[r][c] = '#';
    const found = dfs(r+1, c, idx+1) || dfs(r-1, c, idx+1) ||
                  dfs(r, c+1, idx+1) || dfs(r, c-1, idx+1);
    board[r][c] = temp;
    return found;
  }
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (dfs(r, c, 0)) return true;
  return false;
}`,
    java: `public boolean exist(char[][] board, String word) {
    int R = board.length, C = board[0].length;
    for (int r = 0; r < R; r++) {
        for (int c = 0; c < C; c++) {
            if (dfs(board, word, r, c, 0)) return true;
        }
    }
    return false;
}
private boolean dfs(char[][] b, String w, int r, int c, int idx) {
    if (idx == w.length()) return true;
    if (r < 0 || r >= b.length || c < 0 || c >= b[0].length || b[r][c] != w.charAt(idx))
        return false;
    char temp = b[r][c];
    b[r][c] = '#';
    boolean res = dfs(b, w, r+1, c, idx+1) || dfs(b, w, r-1, c, idx+1) ||
                  dfs(b, w, r, c+1, idx+1) || dfs(b, w, r, c-1, idx+1);
    b[r][c] = temp;
    return res;
}`,
    pseudocode: `function exist(board, word):
    for r from 0 to R - 1:
        for c from 0 to C - 1:
            if dfs(r, c, 0): return true
    return false

function dfs(r, c, idx):
    if idx == length(word): return true
    if out_of_bounds(r, c) or board[r][c] != word[idx]: return false
    temp = board[r][c]; board[r][c] = VISITED
    for (nr, nc) in neighbors(r, c):
        if dfs(nr, nc, idx + 1): return true
    board[r][c] = temp
    return false`,
  },
  generateTimeline: (input: { board: string[][]; word: string }): ExecutionFrame<WordSearchState>[] => {
    const rawBoard = input?.board?.length
      ? input.board
      : [
          ['A', 'B', 'C', 'E'],
          ['S', 'F', 'C', 'S'],
          ['A', 'D', 'E', 'E'],
        ];
    const targetWord = input?.word || 'ABCCED';

    const frames: ExecutionFrame<WordSearchState>[] = [];
    const R = rawBoard.length;
    const C = rawBoard[0].length;
    const visitedSet = new Set<string>();
    const visitedList: [number, number][] = [];
    let found = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        board: rawBoard.map((row: string[]) => [...row]),
        word: targetWord,
        visited: [],
        currentPos: null,
        matchedLength: 0,
        found: false,
      },
      callStack: [{ name: 'exist', params: { word: targetWord, R, C } }],
      variables: { targetWord, R, C, status: 'Searching start cell' },
      explanation: `Begin Word Search for target "${targetWord}" on ${R}x${C} board.`,
    });

    const directions: [number, number, string][] = [
      [0, 1, 'RIGHT'],
      [1, 0, 'DOWN'],
      [0, -1, 'LEFT'],
      [-1, 0, 'UP'],
    ];

    function search(r: number, c: number, idx: number): boolean {
      if (idx === targetWord.length) {
        found = true;
        return true;
      }
      if (r < 0 || r >= R || c < 0 || c >= C) return false;
      const key = `${r},${c}`;
      if (visitedSet.has(key)) return false;
      if (rawBoard[r][c] !== targetWord[idx]) return false;

      visitedSet.add(key);
      visitedList.push([r, c]);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        action: 'MATCH_CHAR',
        state: {
          board: rawBoard.map((row: string[]) => [...row]),
          word: targetWord,
          visited: [...visitedList],
          currentPos: [r, c],
          matchedLength: idx + 1,
          found: idx + 1 === targetWord.length,
        },
        callStack: [
          { name: 'exist', params: { word: targetWord } },
          { name: 'dfs', params: { r, c, idx: idx + 1, char: rawBoard[r][c] } },
        ],
        variables: {
          r,
          c,
          char: rawBoard[r][c],
          matchedPrefix: targetWord.slice(0, idx + 1),
          matchedLength: idx + 1,
        },
        explanation: `Cell (${r}, ${c}) matches '${targetWord[idx]}' (matched prefix "${targetWord.slice(0, idx + 1)}").`,
      });

      if (idx + 1 === targetWord.length) {
        found = true;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          action: 'WORD_FOUND',
          state: {
            board: rawBoard.map((row: string[]) => [...row]),
            word: targetWord,
            visited: [...visitedList],
            currentPos: [r, c],
            matchedLength: targetWord.length,
            found: true,
          },
          callStack: [
            { name: 'exist', params: { word: targetWord } },
            { name: 'dfs', params: { r, c, idx: targetWord.length, result: 'TRUE' } },
          ],
          variables: { word: targetWord, status: 'FOUND', totalLength: targetWord.length },
          explanation: `Complete word "${targetWord}" found successfully in board!`,
        });
        return true;
      }

      for (const [dr, dc, dirName] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          action: 'EXPLORE_DIR',
          state: {
            board: rawBoard.map((row: string[]) => [...row]),
            word: targetWord,
            visited: [...visitedList],
            currentPos: [nr, nc],
            matchedLength: idx + 1,
            found: false,
          },
          callStack: [
            { name: 'exist', params: { word: targetWord } },
            { name: 'dfs', params: { r, c, nextDir: dirName, targetIdx: idx + 1 } },
          ],
          variables: {
            from: `(${r},${c})`,
            to: `(${nr},${nc})`,
            dir: dirName,
            lookingFor: targetWord[idx + 1],
          },
          explanation: `Try stepping ${dirName} to (${nr}, ${nc}) for '${targetWord[idx + 1]}'.`,
        });

        if (search(nr, nc, idx + 1)) return true;
      }

      // Backtrack
      visitedSet.delete(key);
      visitedList.pop();

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        action: 'BACKTRACK',
        state: {
          board: rawBoard.map((row: string[]) => [...row]),
          word: targetWord,
          visited: [...visitedList],
          currentPos: visitedList.length > 0 ? visitedList[visitedList.length - 1] : null,
          matchedLength: idx,
          found: false,
        },
        callStack: [
          { name: 'exist', params: { word: targetWord } },
          { name: 'backtrack', params: { unmarkRow: r, unmarkCol: c, idx } },
        ],
        variables: {
          backtrackedFrom: `(${r},${c})`,
          retainedPrefix: targetWord.slice(0, idx),
          matchedLength: idx,
        },
        explanation: `Backtrack from (${r}, ${c}), unmarking cell. Path dead-end for '${targetWord.slice(0, idx + 1)}'.`,
      });

      return false;
    }

    let searchDone = false;
    for (let r = 0; r < R && !searchDone; r++) {
      for (let c = 0; c < C && !searchDone; c++) {
        if (rawBoard[r][c] === targetWord[0]) {
          if (search(r, c, 0)) {
            searchDone = true;
          }
        }
      }
    }

    if (!found) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 18,
        action: 'SEARCH_COMPLETE_NOT_FOUND',
        state: {
          board: rawBoard.map((row: string[]) => [...row]),
          word: targetWord,
          visited: [],
          currentPos: null,
          matchedLength: 0,
          found: false,
        },
        callStack: [{ name: 'exist', params: { word: targetWord, result: 'FALSE' } }],
        variables: { word: targetWord, status: 'NOT_FOUND' },
        explanation: `Word "${targetWord}" cannot be formed using adjacent unused cells in the grid.`,
      });
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<WordSearchState>) => {
    const { board, word, visited, currentPos, matchedLength, found } = frame.state;
    const visitedSet = new Map<string, number>();
    visited.forEach(([r, c], idx) => {
      visitedSet.set(`${r},${c}`, idx + 1);
    });

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-2xl mx-auto">
        {/* Status header banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Target Word:</span>
            <div className="flex gap-1">
              {word.split('').map((ch, idx) => {
                const isMatched = idx < matchedLength;
                return (
                  <span
                    key={idx}
                    className={`font-mono font-bold px-2 py-0.5 rounded text-sm transition-all ${
                      isMatched
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 scale-105'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Status:</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded font-mono ${
                found
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {found ? 'FOUND' : `MATCHED ${matchedLength}/${word.length}`}
            </span>
          </div>
        </div>

        {/* 2D Board Matrix */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
          {board.map((row, r) => (
            <div key={r} className="flex gap-3">
              {row.map((cellChar, c) => {
                const key = `${r},${c}`;
                const stepNum = visitedSet.get(key);
                const isCurrent = currentPos && currentPos[0] === r && currentPos[1] === c;
                const isVisited = stepNum !== undefined;

                return (
                  <div
                    key={c}
                    className={`relative w-14 h-14 rounded-xl flex items-center justify-center font-mono font-extrabold text-xl transition-all duration-200 border-2 select-none shadow-md ${
                      isCurrent
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-4 ring-amber-400/20 scale-105 z-10'
                        : isVisited
                        ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 shadow-emerald-950/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{cellChar}</span>
                    {isVisited && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow">
                        {stepNum}
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-slate-500">
                      {r},{c}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400 inline-block" />
            <span>Active Head</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500 inline-block" />
            <span>Visited Prefix</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800 inline-block" />
            <span>Unvisited</span>
          </div>
        </div>
      </div>
    );
  },
};
