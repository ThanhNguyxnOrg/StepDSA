import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface FloodFillState {
  grid: number[][];
  activeCell?: [number, number];
  startColor: number;
  newColor: number;
  filledCount: number;
}

export const floodFillModule: AlgorithmModule<
  { grid: number[][]; startRow: number; startCol: number; newColor: number },
  FloodFillState
> = {
  id: 'flood-fill',
  title: 'Connected Components & Flood Fill (Grid Scan)',
  category: 'graphs',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(R * C)',
    timeAverage: 'O(R * C)',
    timeWorst: 'O(R * C)',
    spaceAuxiliary: 'O(R * C)',
    worstCaseCondition: 'All grid cells share identical color, filling entire grid',
  },
  theory: {
    overview:
      'Flood Fill is an algorithm that determines and alters the area connected to a given node in a multi-dimensional array. It powers paint bucket tools (filling closed regions) and connected component identification.',
    whyItWorks:
      'Starting from a seed cell (sr, sc), BFS or DFS explores the 4 orthogonal cardinal directions (North, South, East, West). Any neighboring cell matching the original target color is recolored and enqueued.',
    invariant:
      'Fill Invariant: Every recolored cell is guaranteed to belong to the 4-connected component containing (sr, sc).',
    pitfalls: [
      'Infinite recursion / loop if startColor == newColor and no visited check is performed.',
      'Grid out-of-bounds indexing when expanding neighbors.',
    ],
  },
  presets: [
    {
      id: 'island-lake',
      label: '4x4 Enclosed Pond',
      description: 'Fill central 1s with color 2',
      data: {
        grid: [
          [1, 1, 1, 0],
          [1, 1, 0, 0],
          [1, 0, 1, 1],
          [0, 0, 1, 1],
        ],
        startRow: 0,
        startCol: 0,
        newColor: 2,
      },
    },
    {
      id: 'cross-shape',
      label: 'Cross Pattern',
      description: 'Orthogonal propagation along cross arms',
      data: {
        grid: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0],
        ],
        startRow: 1,
        startCol: 1,
        newColor: 3,
      },
    },
  ],
  defaultInput: {
    grid: [
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 1, 1],
      [0, 0, 1, 1],
    ],
    startRow: 0,
    startCol: 0,
    newColor: 2,
  },
  codeSnippets: {
    python: `def flood_fill(grid, sr, sc, new_color):
    rows, cols = len(grid), len(grid[0])
    orig_color = grid[sr][sc]
    if orig_color == new_color: return grid

    queue = [(sr, sc)]
    grid[sr][sc] = new_color
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while queue:
        r, c = queue.pop(0)
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == orig_color:
                grid[nr][nc] = new_color
                queue.append((nr, nc))
    return grid`,
    typescript: `function floodFill(grid: number[][], sr: number, sc: number, newColor: number): number[][] {
  const rows = grid.length, cols = grid[0].length;
  const origColor = grid[sr][sc];
  if (origColor === newColor) return grid;

  const queue: [number, number][] = [[sr, sc]];
  grid[sr][sc] = newColor;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === origColor) {
        grid[nr][nc] = newColor;
        queue.push([nr, nc]);
      }
    }
  }
  return grid;
}`,
    cpp: `vector<vector<int>> floodFill(vector<vector<int>>& grid, int sr, int sc, int newColor) {
    int rows = grid.size(), cols = grid[0].size();
    int orig = grid[sr][sc];
    if (orig == newColor) return grid;
    queue<pair<int, int>> q;
    q.push({sr, sc});
    grid[sr][sc] = newColor;
    int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};

    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int i = 0; i < 4; ++i) {
            int nr = r + dr[i], nc = c + dc[i];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == orig) {
                grid[nr][nc] = newColor;
                q.push({nr, nc});
            }
        }
    }
    return grid;
}`,
    java: `public int[][] floodFill(int[][] grid, int sr, int sc, int newColor) {
    int rows = grid.length, cols = grid[0].length;
    int orig = grid[sr][sc];
    if (orig == newColor) return grid;
    Queue<int[]> q = new LinkedList<>();
    q.add(new int[]{sr, sc});
    grid[sr][sc] = newColor;
    int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    while (!q.isEmpty()) {
        int[] curr = q.poll();
        for (int[] d : dirs) {
            int nr = curr[0] + d[0], nc = curr[1] + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == orig) {
                grid[nr][nc] = newColor;
                q.add(new int[]{nr, nc});
            }
        }
    }
    return grid;
}`,
    pseudocode: `function floodFill(grid, sr, sc, newColor):
    origColor <- grid[sr][sc]
    if origColor == newColor: return grid
    queue <- [(sr, sc)]
    grid[sr][sc] <- newColor
    while queue is not empty:
        (r, c) <- dequeue(queue)
        for (dr, dc) in [(-1,0), (1,0), (0,-1), (0,1)]:
            (nr, nc) <- (r + dr, c + dc)
            if inside bounds and grid[nr][nc] == origColor:
                grid[nr][nc] <- newColor
                enqueue(queue, (nr, nc))
    return grid`,
  },
  generateTimeline: (input) => {
    const grid = input.grid.map((row) => [...row]);
    const sr = input.startRow;
    const sc = input.startCol;
    const newColor = input.newColor;
    const origColor = grid[sr][sc];
    const rows = grid.length;
    const cols = grid[0].length;

    const frames: ExecutionFrame<FloodFillState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialized Flood Fill on ${rows}x${cols} grid. Seed cell (${sr}, ${sc}) has original color ${origColor}. Target fill color: ${newColor}.`,
      state: {
        grid: grid.map((r) => [...r]),
        activeCell: [sr, sc],
        startColor: origColor,
        newColor,
        filledCount: 0,
      },
    });

    if (origColor === newColor) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: 'Seed color equals target color. No fill required.',
        state: {
          grid: grid.map((r) => [...r]),
          startColor: origColor,
          newColor,
          filledCount: 0,
        },
      });
      return frames;
    }

    grid[sr][sc] = newColor;
    const queue: [number, number][] = [[sr, sc]];
    let filledCount = 1;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      explanation: `Recolored seed cell (${sr}, ${sc}) to ${newColor}. Enqueued cell to initiate wavefront.`,
      isMilestone: true,
      milestoneTitle: `Filled Seed Cell (${sr}, ${sc})`,
      state: {
        grid: grid.map((r) => [...r]),
        activeCell: [sr, sc],
        startColor: origColor,
        newColor,
        filledCount,
      },
    });

    const dirs = [
      [-1, 0, 'North'],
      [1, 0, 'South'],
      [0, -1, 'West'],
      [0, 1, 'East'],
    ] as const;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;

      for (const [dr, dc, dirName] of dirs) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (grid[nr][nc] === origColor) {
            grid[nr][nc] = newColor;
            filledCount++;
            queue.push([nr, nc]);

            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 16,
              explanation: `Wavefront expanded ${dirName} to (${nr}, ${nc}). Neighbor color ${origColor} matches seed! Recolored to ${newColor} and enqueued.`,
              isMilestone: true,
              milestoneTitle: `Filled (${nr}, ${nc})`,
              state: {
                grid: grid.map((row) => [...row]),
                activeCell: [nr, nc],
                startColor: origColor,
                newColor,
                filledCount,
              },
            });
          }
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: `Flood Fill complete! All 4-connected cells matching color ${origColor} recolored. Total cells filled: ${filledCount}.`,
      isMilestone: true,
      milestoneTitle: 'Flood Fill Finished',
      state: {
        grid: grid.map((row) => [...row]),
        startColor: origColor,
        newColor,
        filledCount,
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<FloodFillState>) => {
    const { grid, activeCell, startColor, newColor, filledCount } = frame.state;

    const getColorClass = (val: number, isAct: boolean) => {
      if (isAct) return 'bg-amber-400 border-white text-black scale-110 shadow-lg z-10';
      if (val === newColor) return 'bg-cyan-600/80 border-cyan-400 text-white font-bold shadow-md';
      if (val === 0) return 'bg-slate-900 border-slate-800 text-slate-500';
      if (val === 1) return 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300';
      return 'bg-purple-900/60 border-purple-600/60 text-purple-200';
    };

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Original: <span className="text-indigo-400 font-bold">{startColor}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Fill Color: <span className="text-cyan-400 font-bold">{newColor}</span>
          </div>
          <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Filled Cells: <span className="text-emerald-400 font-bold">{filledCount}</span>
          </div>
        </div>

        {/* 2D Grid Cells */}
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl shadow-2xl flex flex-col gap-2">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-2">
              {row.map((val, cIdx) => {
                const isActive = activeCell && activeCell[0] === rIdx && activeCell[1] === cIdx;
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center font-mono font-bold text-lg border-2 transition-all duration-300 ${getColorClass(
                      val,
                      Boolean(isActive)
                    )}`}
                  >
                    {val}
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
