import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface RatInAMazeState {
  maze: number[][]; // 0 = wall, 1 = open path
  n: number;
  currentPos: [number, number];
  pathTrail: [number, number][];
  visited: boolean[][];
  solved: boolean;
  action: 'MOVE' | 'BACKTRACK' | 'GOAL' | 'START';
}

export const ratInAMazeModule: AlgorithmModule<{ maze: number[][] }, RatInAMazeState> = {
  id: 'rat-in-a-maze',
  title: 'Rat in a Maze (Grid Pathfinding Backtracking O(4^(N^2)))',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N^2) direct path to exit',
    timeAverage: 'O(4^(N^2)) state-space exploration',
    timeWorst: 'O(4^(N^2)) exhaustive backtracking',
    spaceAuxiliary: 'O(N^2) recursion stack and visited matrix',
    worstCaseCondition: 'Maze requires exploring all 4 directions across dead ends',
  },
  theory: {
    overview:
      'A rat starts at (0, 0) in an N x N grid and must reach (N-1, N-1). The rat can only move through open cells (1) and cannot pass through walls (0). Backtracking systematically explores paths, retreating when dead ends are hit.',
    whyItWorks:
      'The algorithm marks the current cell as part of the solution path and recursively tries moving DOWN, RIGHT, UP, LEFT. If none of these moves lead to the goal, the cell is un-marked (backtracked).',
    invariant:
      'Path Feasibility Invariant: At any step, the active path trail forms a simple self-avoiding chain of contiguous open cells starting from (0, 0).',
    pitfalls: [
      'Missing bounds checking causing out-of-grid index exceptions.',
      'Forgetting to unmark visited cells during backtracking, which blocks alternative valid routes.',
    ],
  },
  presets: [
    {
      id: 'classic-4x4',
      label: 'Classic 4x4 Maze',
      description: 'Standard maze with one clean path to bottom-right exit',
      data: {
        maze: [
          [1, 0, 0, 0],
          [1, 1, 0, 1],
          [0, 1, 0, 0],
          [1, 1, 1, 1],
        ],
      },
    },
    {
      id: 'dead-end',
      label: '4x4 with Dead End',
      description: 'Triggers backtracking from an attractive dead end',
      data: {
        maze: [
          [1, 1, 1, 0],
          [0, 0, 1, 0],
          [1, 1, 1, 1],
          [1, 0, 0, 1],
        ],
      },
    },
  ],
  defaultInput: {
    maze: [
      [1, 0, 0, 0],
      [1, 1, 0, 1],
      [0, 1, 0, 0],
      [1, 1, 1, 1],
    ],
  },
  codeSnippets: {
    cpp: `bool solveMaze(int r, int c, int n, const vector<vector<int>>& maze,
               vector<vector<int>>& sol) {
    if (r == n - 1 && c == n - 1 && maze[r][c] == 1) {
        sol[r][c] = 1;
        return true;
    }
    if (r >= 0 && r < n && c >= 0 && c < n && maze[r][c] == 1 && sol[r][c] == 0) {
        sol[r][c] = 1;
        if (solveMaze(r + 1, c, n, maze, sol)) return true; // Down
        if (solveMaze(r, c + 1, n, maze, sol)) return true; // Right
        if (solveMaze(r - 1, c, n, maze, sol)) return true; // Up
        if (solveMaze(r, c - 1, n, maze, sol)) return true; // Left
        sol[r][c] = 0; // Backtrack
    }
    return false;
}`,
    python: `def solve_maze(maze):
    n = len(maze)
    sol = [[0]*n for _ in range(n)]
    def dfs(r, c):
        if r == n - 1 and c == n - 1 and maze[r][c] == 1:
            sol[r][c] = 1
            return True
        if 0 <= r < n and 0 <= c < n and maze[r][c] == 1 and sol[r][c] == 0:
            sol[r][c] = 1
            for dr, dc in [(1,0), (0,1), (-1,0), (0,-1)]:
                if dfs(r + dr, c + dc): return True
            sol[r][c] = 0
        return False
    return dfs(0, 0)`,
    typescript: `function solveMaze(maze: number[][]): boolean {
    const n = maze.length;
    const sol = Array.from({ length: n }, () => Array(n).fill(0));
    function dfs(r: number, c: number): boolean {
        if (r === n - 1 && c === n - 1 && maze[r][c] === 1) {
            sol[r][c] = 1; return true;
        }
        if (r >= 0 && r < n && c >= 0 && c < n && maze[r][c] === 1 && sol[r][c] === 0) {
            sol[r][c] = 1;
            if (dfs(r + 1, c) || dfs(r, c + 1) || dfs(r - 1, c) || dfs(r, c - 1)) return true;
            sol[r][c] = 0; // Backtrack
        }
        return false;
    }
    return dfs(0, 0);
}`,
    java: `boolean solve(int r, int c, int n, int[][] maze, int[][] sol) {
    if (r == n - 1 && c == n - 1 && maze[r][c] == 1) {
        sol[r][c] = 1; return true;
    }
    if (r >= 0 && r < n && c >= 0 && c < n && maze[r][c] == 1 && sol[r][c] == 0) {
        sol[r][c] = 1;
        if (solve(r + 1, c, n, maze, sol)) return true;
        if (solve(r, c + 1, n, maze, sol)) return true;
        if (solve(r - 1, c, n, maze, sol)) return true;
        if (solve(r, c - 1, n, maze, sol)) return true;
        sol[r][c] = 0; // Backtrack
    }
    return false;
}`,
    pseudocode: `function solveMaze(r, c):
    if (r, c) is Goal: return true
    if (r, c) is Valid:
        mark (r, c) on path
        if solveMaze(Down) or solveMaze(Right) ... return true
        unmark (r, c) on path // Backtrack
    return false`,
  },

  generateTimeline: (input: { maze: number[][] }): ExecutionFrame<RatInAMazeState>[] => {
    const maze = input?.maze?.length
      ? input.maze
      : [
          [1, 0, 0, 0],
          [1, 1, 0, 1],
          [0, 1, 0, 0],
          [1, 1, 1, 1],
        ];
    const n = maze.length;

    const visited: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    const pathTrail: [number, number][] = [];
    const frames: ExecutionFrame<RatInAMazeState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Rat in a Maze on ${n}x${n} grid. Start at (0, 0), Goal at (${n - 1}, ${n - 1}).`,
      variables: { gridSize: `${n}x${n}`, start: '(0, 0)', goal: `(${n - 1}, ${n - 1})` },
      callStack: [{ name: 'solveMaze()', params: { n }, line: 2, isCurrent: true }],
      state: {
        maze,
        n,
        currentPos: [0, 0],
        pathTrail: [],
        visited: visited.map((r) => [...r]),
        solved: false,
        action: 'START',
      },
    });

    let solved = false;

    function dfs(r: number, c: number): boolean {
      if (r === n - 1 && c === n - 1 && maze[r][c] === 1) {
        pathTrail.push([r, c]);
        visited[r][c] = true;
        solved = true;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `GOAL REACHED at (${r}, ${c})! Valid escape path discovered with length ${pathTrail.length}.`,
          variables: { goal: `(${r}, ${c})`, pathLength: pathTrail.length },
          callStack: [{ name: `goalReached(${r}, ${c})`, params: { r, c }, line: 4, isCurrent: true }],
          state: {
            maze,
            n,
            currentPos: [r, c],
            pathTrail: [...pathTrail],
            visited: visited.map((row) => [...row]),
            solved: true,
            action: 'GOAL',
          },
        });
        return true;
      }

      if (r >= 0 && r < n && c >= 0 && c < n && maze[r][c] === 1 && !visited[r][c]) {
        visited[r][c] = true;
        pathTrail.push([r, c]);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `Advance to open cell (${r}, ${c}). Added to active solution path.`,
          variables: { r, c, pathDepth: pathTrail.length },
          callStack: [{ name: `dfs(r=${r}, c=${c})`, params: { r, c }, line: 8, isCurrent: true }],
          state: {
            maze,
            n,
            currentPos: [r, c],
            pathTrail: [...pathTrail],
            visited: visited.map((row) => [...row]),
            solved: false,
            action: 'MOVE',
          },
        });

        // Directions: Down, Right, Up, Left
        const directions: [number, number][] = [
          [1, 0],
          [0, 1],
          [-1, 0],
          [0, -1],
        ];

        for (const [dr, dc] of directions) {
          if (dfs(r + dr, c + dc)) return true;
        }

        // Backtrack
        pathTrail.pop();
        visited[r][c] = false;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          explanation: `Dead end from cell (${r}, ${c})! Backtracking to previous cell.`,
          variables: { backtrackedFrom: `(${r}, ${c})` },
          callStack: [{ name: `backtrack(${r}, ${c})`, params: { r, c }, line: 12, isCurrent: true }],
          state: {
            maze,
            n,
            currentPos: pathTrail.length > 0 ? pathTrail[pathTrail.length - 1] : [0, 0],
            pathTrail: [...pathTrail],
            visited: visited.map((row) => [...row]),
            solved: false,
            action: 'BACKTRACK',
          },
        });
      }

      return false;
    }

    dfs(0, 0);

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      explanation: solved
        ? `Maze solved! Path: ${pathTrail.map(([r, c]) => `(${r},${c})`).join(' -> ')}.`
        : 'No feasible path exists from start to exit.',
      variables: { solved, totalPathSteps: pathTrail.length },
      callStack: [{ name: 'complete()', params: { solved: String(solved) }, line: 14, isCurrent: true }],
      state: {
        maze,
        n,
        currentPos: pathTrail.length > 0 ? pathTrail[pathTrail.length - 1] : [0, 0],
        pathTrail: [...pathTrail],
        visited: visited.map((row) => [...row]),
        solved,
        action: solved ? 'GOAL' : 'BACKTRACK',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<RatInAMazeState>) => {
    const { maze, n, currentPos, pathTrail, solved } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Maze: <strong className="text-white">{n}x{n}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Current: <strong className="text-white">({currentPos[0]}, {currentPos[1]})</strong>
            </div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border ${
              solved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {solved ? `SOLVED (${pathTrail.length} steps)` : `Path Length: ${pathTrail.length}`}
          </div>
        </div>

        {/* Maze Grid */}
        <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl my-auto">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            }}
          >
            {maze.map((row, r) =>
              row.map((val, c) => {
                const isWall = val === 0;
                const isCurrent = currentPos[0] === r && currentPos[1] === c;
                const isPath = pathTrail.some(([pr, pc]) => pr === r && pc === c);
                const isStart = r === 0 && c === 0;
                const isGoal = r === n - 1 && c === n - 1;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-sm border transition-all duration-200 ${
                      isWall
                        ? 'bg-slate-900/90 border-slate-800 text-slate-700'
                        : isCurrent
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 scale-105 shadow-lg shadow-cyan-500/30'
                        : isPath
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <span>
                      {isWall ? '⬛' : isCurrent ? '🐭' : isGoal ? '🏁' : isStart ? '🚩' : isPath ? '🐾' : '·'}
                    </span>
                    <span className="text-[9px] text-slate-600 font-normal">
                      {r},{c}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  },
};
