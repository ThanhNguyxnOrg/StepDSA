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

    let checkpointAdded = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Flood Fill (${rows}x${cols})`,
      explanation: `Initialized Flood Fill on ${rows}x${cols} grid. Seed cell (${sr}, ${sc}) has original color ${origColor}. Target fill color: ${newColor}.`,
      variables: { rows, cols, seedRow: sr, seedCol: sc, origColor, newColor, filledCount: 0 },
      conditionEval: { expr: 'origColor !== newColor', result: origColor !== newColor },
      soundCue: { type: 'step' },
      callStack: [{ name: 'floodFill', params: { sr, sc, newColor }, line: 2, isCurrent: true }],
      pedagogy: {
        what: `The seed cell (${sr}, ${sc}) has original color ${origColor}; the whole 4-connected region of that color will be repainted ${newColor}.`,
        why: 'BFS spreads the wavefront one ring at a time, so every reachable cell of the original color is recolored exactly once.',
        whatNext: 'If the target color already matches the seed, stop immediately.',
      },
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
        codeLine: 3,
        isMilestone: true,
        milestoneTitle: 'Early Exit (Identical Color)',
        explanation: `Seed color ${origColor} already matches target color ${newColor}. Recoloring would be invisible and the wavefront could never detect which cells are already done. Returning the grid unchanged.`,
        variables: { origColor, newColor, earlyExit: true },
        conditionEval: { expr: 'origColor === newColor', result: true },
        soundCue: { type: 'complete' },
        callStack: [{ name: 'floodFill', params: { sr, sc, newColor }, line: 3, isCurrent: true }],
        pedagogy: {
          what: `origColor == newColor, so the fill is a no-op.`,
          why: 'Visited cells are recognized by their color change; if the colors are equal, no cell ever becomes distinguishable and the queue would cycle forever. The early return is a correctness guard, not just an optimization.',
          whatNext: 'Return the grid untouched.',
        },
        state: {
          grid: grid.map((r) => [...r]),
          startColor: origColor,
          newColor,
          filledCount: 0,
        },
      });
      return frames;
    }

    const queue: [number, number][] = [[sr, sc]];

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      state: {
        grid: grid.map((r) => [...r]),
        activeCell: [sr, sc],
        startColor: origColor,
        newColor,
        filledCount: 0,
      },
      callStack: [{ name: 'enqueueSeed', params: { r: sr, c: sc }, line: 4, isCurrent: true }],
      variables: { queue: `(${sr}, ${sc})`, queueSize: 1 },
      pedagogy: {
        what: `queue = [(${sr}, ${sc})]: the wavefront starts at the seed.`,
        why: 'BFS order guarantees cells are filled in rings of increasing distance from the seed.',
        whatNext: 'Recolor the seed before scanning its neighbors.',
      },
      explanation: `Enqueued seed cell (${sr}, ${sc}) into the wavefront queue.`,
    });

    grid[sr][sc] = newColor;
    let filledCount = 1;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 5,
      isMilestone: true,
      milestoneTitle: `Filled Seed Cell (${sr}, ${sc})`,
      explanation: `Recolored seed cell (${sr}, ${sc}) from ${origColor} to ${newColor}.`,
      variables: { seedCell: `(${sr}, ${sc})`, origColor, newColor, filledCount: 1 },
      conditionEval: { expr: `grid[${sr}][${sc}] = ${newColor}`, result: true },
      soundCue: { type: 'insert' },
      callStack: [{ name: 'fillSeed', params: { r: sr, c: sc, color: newColor }, line: 5, isCurrent: true }],
      pedagogy: {
        what: `The seed becomes ${newColor}.`,
        why: 'The color change is the visited mark: later neighbor scans only absorb cells that still equal origColor, so filled cells can never be re-enqueued.',
        whatNext: 'Pop the seed and scan its four orthogonal neighbors.',
      },
      checkpoint: !checkpointAdded
        ? {
            id: 'flood-fill-visited-by-color',
            question: 'Why does flood fill recolor cells instead of keeping a separate visited array?',
            options: [
              'The color change is the visited mark: only cells still equal to origColor can be absorbed, so filled cells can never be queued twice',
              'Because arrays of booleans are slower than integer grids in JavaScript',
            ],
            correctIndex: 0,
            explanation:
              'When a cell is recolored it no longer matches origColor, so it fails the wavefront condition on every later scan. This also explains why the origColor == newColor early exit is required: without the color change there is no visited mark at all.',
          }
        : undefined,
      state: {
        grid: grid.map((r) => [...r]),
        activeCell: [sr, sc],
        startColor: origColor,
        newColor,
        filledCount,
      },
    });
    checkpointAdded = true;

    const dirs = [
      [-1, 0, 'North'],
      [1, 0, 'South'],
      [0, -1, 'West'],
      [0, 1, 'East'],
    ] as const;

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 7,
        action: 'DEQUEUE_CELL',
        explanation: `Dequeued cell (${r}, ${c}) from wavefront queue. Scanning 4 orthogonal neighbors (North, South, West, East).`,
        variables: { currentCell: `(${r}, ${c})`, remainingInQueue: queue.length, filledCount },
        conditionEval: { expr: 'queue.length > 0', result: true },
        soundCue: { type: 'step' },
        callStack: [
          { name: 'expandWavefront', params: { r, c }, line: 7, isCurrent: true },
          { name: 'floodFill', params: { sr, sc }, line: 6 },
        ],
        pedagogy: {
          what: `Cell (${r}, ${c}) left the queue; its four neighbors are checked now.`,
          why: 'BFS processes cells in ring order, so the painted region always grows as a connected wavefront.',
          whatNext: 'For each direction, test bounds and the original color.',
        },
        state: {
          grid: grid.map((row) => [...row]),
          activeCell: [r, c],
          startColor: origColor,
          newColor,
          filledCount,
        },
      });

      for (const [dr, dc, dirName] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols;

        if (!inBounds) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            action: 'NEIGHBOR_REJECT',
            explanation: `${dirName} of (${r}, ${c}) is (${nr}, ${nc}), outside the ${rows}x${cols} grid. Skipping.`,
            variables: { direction: dirName, cell: `(${nr}, ${nc})`, reason: 'OUT_OF_BOUNDS' },
            conditionEval: { expr: `0 <= ${nr} < ${rows} && 0 <= ${nc} < ${cols}`, result: false },
            soundCue: { type: 'step' },
            callStack: [
              { name: `checkNeighbor(${dirName})`, params: { nr, nc }, line: 10, isCurrent: true },
              { name: 'floodFill', params: { sr, sc }, line: 6 },
            ],
            pedagogy: {
              what: `(${nr}, ${nc}) lies outside the grid, so there is no cell to paint.`,
              why: 'Bounds checking keeps the wavefront inside the canvas; without it the algorithm would read undefined cells.',
              whatNext: 'Check the next direction.',
            },
            state: {
              grid: grid.map((row) => [...row]),
              activeCell: [r, c],
              startColor: origColor,
              newColor,
              filledCount,
            },
          });
          continue;
        }

        const isMatch = grid[nr][nc] === origColor;

        if (isMatch) {
          grid[nr][nc] = newColor;
          filledCount++;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            isMilestone: true,
            milestoneTitle: `Filled ${dirName} (${nr}, ${nc})`,
            explanation: `Wavefront expanded ${dirName} to (${nr}, ${nc}): color still ${origColor}, recolored to ${newColor}. Filled count: ${filledCount}.`,
            variables: { direction: dirName, cell: `(${nr}, ${nc})`, origColor, newColor, filledCount },
            conditionEval: { expr: `grid[${nr}][${nc}] === ${origColor}`, result: true },
            soundCue: { type: 'insert' },
            callStack: [
              { name: 'fillNeighbor', params: { nr, nc, dir: dirName }, line: 11, isCurrent: true },
              { name: 'floodFill', params: { sr, sc }, line: 6 },
            ],
            pedagogy: {
              what: `(${nr}, ${nc}) matches the seed color, so it joins the region and becomes ${newColor}.`,
              why: 'Exactly the pre-recolor cell is filled; cells already recolored or of other colors are never touched.',
              whatNext: 'Enqueue the new cell so its own neighbors are explored.',
            },
            state: {
              grid: grid.map((row) => [...row]),
              activeCell: [nr, nc],
              startColor: origColor,
              newColor,
              filledCount,
            },
          });

          queue.push([nr, nc]);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            action: 'ENQUEUE_CELL',
            explanation: `Enqueued (${nr}, ${nc}); queue now holds ${queue.length} cell(s).`,
            variables: { cell: `(${nr}, ${nc})`, queueLength: queue.length },
            soundCue: { type: 'insert' },
            callStack: [
              { name: 'enqueue', params: { nr, nc }, line: 12, isCurrent: true },
              { name: 'floodFill', params: { sr, sc }, line: 6 },
            ],
            pedagogy: {
              what: `(${nr}, ${nc}) enters the wavefront queue.`,
              why: 'Each filled cell must be expanded once so the region grows outward in every direction.',
              whatNext: "Continue scanning the current cell's directions.",
            },
            state: {
              grid: grid.map((row) => [...row]),
              activeCell: [nr, nc],
              startColor: origColor,
              newColor,
              filledCount,
            },
          });
        } else {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            action: 'NEIGHBOR_REJECT',
            explanation: `${dirName} of (${r}, ${c}) is (${nr}, ${nc}) with color ${grid[nr][nc]}, not ${origColor}. Leaving it unchanged.`,
            variables: { direction: dirName, cell: `(${nr}, ${nc})`, cellColor: grid[nr][nc], reason: 'COLOR_MISMATCH' },
            conditionEval: { expr: `grid[${nr}][${nc}] === ${origColor}`, result: false },
            soundCue: { type: 'step' },
            callStack: [
              { name: `checkNeighbor(${dirName})`, params: { nr, nc }, line: 10, isCurrent: true },
              { name: 'floodFill', params: { sr, sc }, line: 6 },
            ],
            pedagogy: {
              what: `(${nr}, ${nc}) is not the seed color, so it is a boundary cell.`,
              why: 'Different-colored cells block the spread; this is what restricts the fill to one 4-connected region.',
              whatNext: 'Check the next direction.',
            },
            state: {
              grid: grid.map((row) => [...row]),
              activeCell: [r, c],
              startColor: origColor,
              newColor,
              filledCount,
            },
          });
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 13,
      isMilestone: true,
      milestoneTitle: `Flood Fill Finished (${filledCount} Cells)`,
      explanation: `Flood Fill complete! All 4-connected cells in component matching color ${origColor} recolored to ${newColor}. Total cells filled: ${filledCount}.`,
      variables: { totalFilled: filledCount, startColor: origColor, newColor, queueEmpty: true },
      conditionEval: { expr: 'queue.length === 0', result: true },
      soundCue: { type: 'complete' },
      callStack: [{ name: 'complete', params: { filledCount }, line: 13, isCurrent: true }],
      pedagogy: {
        what: `Return the grid with ${filledCount} cell(s) repainted.`,
        why: 'The queue emptied only after every reachable matching cell was recolored once and expanded once — each cell enters and leaves exactly once.',
        whatNext: 'The same wavefront idea powers island counting, connected components and maze solving.',
      },
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
