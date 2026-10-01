import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface AStarPoint {
  id: string;
  r: number;
  c: number;
  isObstacle?: boolean;
}

export interface AStarInput {
  rows: number;
  cols: number;
  start: { r: number; c: number };
  goal: { r: number; c: number };
  obstacles: { r: number; c: number }[];
}

export interface AStarState {
  grid: {
    r: number;
    c: number;
    g: number;
    h: number;
    f: number;
    status: 'unvisited' | 'open' | 'closed' | 'obstacle' | 'start' | 'goal' | 'path';
  }[][];
  current?: { r: number; c: number };
  openCount: number;
  closedCount: number;
  pathFound: boolean;
}

const defaultAStarInput: AStarInput = {
  rows: 6,
  cols: 8,
  start: { r: 1, c: 1 },
  goal: { r: 4, c: 6 },
  obstacles: [
    { r: 1, c: 3 },
    { r: 2, c: 3 },
    { r: 3, c: 3 },
    { r: 4, c: 3 },
  ],
};

const manhattan = (r1: number, c1: number, r2: number, c2: number): number =>
  Math.abs(r1 - r2) + Math.abs(c1 - c2);

export const aStarModule: AlgorithmModule<AStarInput, AStarState> = {
  id: 'a-star-search',
  title: 'A* Search (Heuristic Pathfinding)',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N) direct line with perfect heuristic',
    timeAverage: 'O(E) focused beam',
    timeWorst: 'O(V log V) degenerate heuristic falls back to Dijkstra',
    spaceAuxiliary: 'O(V) for Open Priority Queue and Closed Set',
    worstCaseCondition: 'Misleading heuristic or maze obstacles forcing exhaustive frontier exploration',
  },
  theory: {
    overview:
      'A* (A-Star) is an informed search algorithm widely used in game development, robotics, and mapping. It computes the shortest path between start and goal nodes using an evaluation function f(n) = g(n) + h(n), where g(n) is the exact accumulated cost from start, and h(n) is an admissible heuristic estimate to the goal.',
    whyItWorks:
      'An admissible heuristic (one that never overestimates the true remaining distance) guarantees that A* always finds the mathematically optimal path while expanding significantly fewer nodes than uninformed Dijkstra search.',
    invariant:
      'The open set priority queue always extracts the frontier node with minimum f(n). Any node in the closed set has had its minimal g(n) proven optimal.',
    pitfalls: [
      'Inadmissible heuristics (overestimating distance) break the shortest-path guarantee and can yield suboptimal paths.',
      'Allowing diagonal movements without properly weighting √2 cost vs orthogonal 1.0 cost.',
    ],
  },
  presets: [
    {
      id: 'vertical-wall',
      label: 'Vertical Wall Obstacle',
      description: 'Navigates around a barrier wall',
      data: defaultAStarInput,
    },
    {
      id: 'corner-pocket',
      label: 'Corner Goal',
      description: 'Navigates from top-left to bottom-right',
      data: {
        rows: 5,
        cols: 6,
        start: { r: 0, c: 0 },
        goal: { r: 4, c: 5 },
        obstacles: [
          { r: 2, c: 1 },
          { r: 2, c: 2 },
          { r: 2, c: 3 },
          { r: 2, c: 4 },
        ],
      },
    },
  ],
  defaultInput: defaultAStarInput,
  codeSnippets: {
    python: `import heapq

def a_star(start, goal, grid):
    open_pq = [(0 + h(start, goal), 0, start)]
    g_score = {start: 0}
    came_from = {}
    closed = set()

    while open_pq:
        f, g, current = heapq.heappop(open_pq)
        if current == goal:
            return reconstruct_path(came_from, current)
        closed.add(current)

        for neighbor in get_neighbors(current, grid):
            if neighbor in closed:
                continue
            tentative_g = g + 1
            if tentative_g < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score = tentative_g + h(neighbor, goal)
                heapq.heappush(open_pq, (f_score, tentative_g, neighbor))
    return None`,
    typescript: `function aStar(start: Point, goal: Point, grid: Grid): Point[] {
  const gScore = new Map<string, number>();
  const cameFrom = new Map<string, Point>();
  const openSet = new MinPriorityQueue();

  gScore.set(key(start), 0);
  openSet.enqueue(start, manhattan(start, goal));

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    if (equals(current, goal)) return reconstructPath(cameFrom, current);

    for (const neighbor of getNeighbors(current, grid)) {
      const tentativeG = (gScore.get(key(current)) ?? Infinity) + 1;
      if (tentativeG < (gScore.get(key(neighbor)) ?? Infinity)) {
        cameFrom.set(key(neighbor), current);
        gScore.set(key(neighbor), tentativeG);
        const fScore = tentativeG + manhattan(neighbor, goal);
        openSet.enqueue(neighbor, fScore);
      }
    }
  }
  return [];
}`,
    cpp: `vector<Point> aStar(Point start, Point goal, vector<vector<int>>& grid) {
    priority_queue<tuple<int, int, Point>, vector<tuple<int, int, Point>>, greater<>> pq;
    map<Point, int> gScore;
    map<Point, Point> cameFrom;
    gScore[start] = 0;
    pq.push({h(start, goal), 0, start});

    while (!pq.empty()) {
        auto [f, g, cur] = pq.top(); pq.pop();
        if (cur == goal) return reconstruct(cameFrom, cur);
        for (Point next : neighbors(cur, grid)) {
            int tentG = g + 1;
            if (!gScore.count(next) || tentG < gScore[next]) {
                gScore[next] = tentG;
                cameFrom[next] = cur;
                pq.push({tentG + h(next, goal), tentG, next});
            }
        }
    }
    return {};
}`,
    java: `public List<Point> aStar(Point start, Point goal, int[][] grid) {
    PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.f));
    Map<Point, Integer> gScore = new HashMap<>();
    Map<Point, Point> cameFrom = new HashMap<>();
    gScore.put(start, 0);
    pq.add(new Node(start, 0, h(start, goal)));

    while (!pq.isEmpty()) {
        Node cur = pq.poll();
        if (cur.pt.equals(goal)) return reconstruct(cameFrom, cur.pt);
        for (Point next : getNeighbors(cur.pt, grid)) {
            int tentG = cur.g + 1;
            if (tentG < gScore.getOrDefault(next, Integer.MAX_VALUE)) {
                gScore.put(next, tentG);
                cameFrom.put(next, cur.pt);
                pq.add(new Node(next, tentG, tentG + h(next, goal)));
            }
        }
    }
    return Collections.emptyList();
}`,
    pseudocode: `function A_Star(start, goal):
    OpenSet = {start}
    gScore[start] = 0
    fScore[start] = h(start, goal)
    while OpenSet is not empty:
        current = node in OpenSet with lowest fScore
        if current == goal: return reconstruct_path()
        OpenSet.remove(current)
        ClosedSet.add(current)
        for neighbor of current:
            tentative_g = gScore[current] + d(current, neighbor)
            if tentative_g < gScore[neighbor]:
                cameFrom[neighbor] = current
                gScore[neighbor] = tentative_g
                fScore[neighbor] = tentative_g + h(neighbor, goal)
                OpenSet.add(neighbor)`,
  },

  generateTimeline: (input: AStarInput): ExecutionFrame<AStarState>[] => {
    const frames: ExecutionFrame<AStarState>[] = [];
    const { rows, cols, start, goal, obstacles } = input;

    const isObstacle = (r: number, c: number) =>
      obstacles.some((o) => o.r === r && o.c === c);

    // Grid model
    const gScore: number[][] = Array.from({ length: rows }, () =>
      new Array(cols).fill(Infinity)
    );
    const fScore: number[][] = Array.from({ length: rows }, () =>
      new Array(cols).fill(Infinity)
    );
    const cameFrom: Record<string, { r: number; c: number }> = {};
    const openSet: { r: number; c: number; f: number }[] = [];
    const closedSet: Set<string> = new Set();

    const key = (r: number, c: number) => `${r},${c}`;

    gScore[start.r][start.c] = 0;
    fScore[start.r][start.c] = manhattan(start.r, start.c, goal.r, goal.c);
    openSet.push({ r: start.r, c: start.c, f: fScore[start.r][start.c] });

    const makeGridState = (
      _current?: { r: number; c: number },
      pathCells: { r: number; c: number }[] = []
    ) => {
      const grid = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          const isSt = r === start.r && c === start.c;
          const isGl = r === goal.r && c === goal.c;
          const isObs = isObstacle(r, c);
          const inPath = pathCells.some((p) => p.r === r && p.c === c);
          const isOpen = openSet.some((p) => p.r === r && p.c === c);
          const isClosed = closedSet.has(key(r, c));

          let status: any = 'unvisited';
          if (isObs) status = 'obstacle';
          else if (inPath) status = 'path';
          else if (isSt) status = 'start';
          else if (isGl) status = 'goal';
          else if (isClosed) status = 'closed';
          else if (isOpen) status = 'open';

          const g = gScore[r][c] === Infinity ? -1 : gScore[r][c];
          const h = manhattan(r, c, goal.r, goal.c);
          const f = fScore[r][c] === Infinity ? -1 : fScore[r][c];

          row.push({ r, c, g, h, f, status });
        }
        grid.push(row);
      }
      return grid;
    };

    // Initial frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized A* Search on ${rows}x${cols} grid. Start: (${start.r},${start.c}), Goal: (${goal.r},${goal.c}). Initial h(start, goal) = ${manhattan(start.r, start.c, goal.r, goal.c)}.`,
      isMilestone: true,
      milestoneTitle: 'A* Initialized',
      soundCue: { type: 'start' },
      variables: { start: `(${start.r},${start.c})`, goal: `(${goal.r},${goal.c})`, initialH: manhattan(start.r, start.c, goal.r, goal.c) },
      callStack: [{ name: 'aStarSearch', params: { start: `(${start.r},${start.c})`, goal: `(${goal.r},${goal.c})` }, line: 1, isCurrent: true }],
      conditionEval: { expr: `openSet.length > 0`, result: true },
      scopeVariables: { start: `(${start.r},${start.c})`, goal: `(${goal.r},${goal.c})`, initialH: manhattan(start.r, start.c, goal.r, goal.c) },
      state: {
        grid: makeGridState(),
        current: start,
        openCount: 1,
        closedCount: 0,
        pathFound: false,
      },
    });

    let pathFound = false;
    const finalPath: { r: number; c: number }[] = [];

    while (openSet.length > 0) {
      // Extract node with lowest fScore
      openSet.sort((a, b) => a.f - b.f);
      const cur = openSet.shift()!;
      closedSet.add(key(cur.r, cur.c));

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Extract min f(n) from Open Set: (${cur.r}, ${cur.c}) with f = ${cur.f} (g=${gScore[cur.r][cur.c]}, h=${manhattan(cur.r, cur.c, goal.r, goal.c)}). Moving to Closed set.`,
        soundCue: { type: 'compare' },
        variables: {
          current: `(${cur.r},${cur.c})`,
          g: gScore[cur.r][cur.c],
          h: manhattan(cur.r, cur.c, goal.r, goal.c),
          f: cur.f,
          openSize: openSet.length,
        },
        callStack: [{ name: 'exploreMinNode', params: { r: cur.r, c: cur.c, f: cur.f }, line: 9, isCurrent: true }],
        conditionEval: { expr: `cur == goal (${cur.r === goal.r && cur.c === goal.c})`, result: cur.r === goal.r && cur.c === goal.c },
        scopeVariables: {
          current: `(${cur.r},${cur.c})`,
          g: gScore[cur.r][cur.c],
          h: manhattan(cur.r, cur.c, goal.r, goal.c),
          f: cur.f,
          openSize: openSet.length,
        },
        state: {
          grid: makeGridState(cur),
          current: cur,
          openCount: openSet.length,
          closedCount: closedSet.size,
          pathFound: false,
        },
      });

      if (cur.r === goal.r && cur.c === goal.c) {
        pathFound = true;
        // Reconstruct path
        let currPath: { r: number; c: number } | undefined = cur;
        while (currPath) {
          finalPath.unshift(currPath);
          currPath = cameFrom[key(currPath.r, currPath.c)];
        }
        break;
      }

      // Explore 4 orthogonal neighbors
      const neighbors = [
        { r: cur.r - 1, c: cur.c },
        { r: cur.r + 1, c: cur.c },
        { r: cur.r, c: cur.c - 1 },
        { r: cur.r, c: cur.c + 1 },
      ];

      for (const n of neighbors) {
        if (n.r < 0 || n.r >= rows || n.c < 0 || n.c >= cols) continue;
        if (isObstacle(n.r, n.c) || closedSet.has(key(n.r, n.c))) continue;

        const tentativeG = gScore[cur.r][cur.c] + 1;
        if (tentativeG < gScore[n.r][n.c]) {
          cameFrom[key(n.r, n.c)] = cur;
          gScore[n.r][n.c] = tentativeG;
          const hVal = manhattan(n.r, n.c, goal.r, goal.c);
          fScore[n.r][n.c] = tentativeG + hVal;

          const existingOpen = openSet.find((p) => p.r === n.r && p.c === n.c);
          if (!existingOpen) {
            openSet.push({ r: n.r, c: n.c, f: fScore[n.r][n.c] });
          } else {
            existingOpen.f = fScore[n.r][n.c];
          }

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 16,
            explanation: `Inspected neighbor (${n.r}, ${n.c}): g=${tentativeG}, h=${hVal}, f=${fScore[n.r][n.c]}. Added to Open Set frontier.`,
            soundCue: { type: 'step' },
            variables: { neighbor: `(${n.r},${n.c})`, g: tentativeG, h: hVal, f: fScore[n.r][n.c] },
            callStack: [{ name: 'updateNeighbor', params: { r: n.r, c: n.c, g: tentativeG, f: fScore[n.r][n.c] }, line: 16, isCurrent: true }],
            conditionEval: { expr: `tentativeG < gScore[n.r][n.c]`, result: true },
            scopeVariables: { neighbor: `(${n.r},${n.c})`, g: tentativeG, h: hVal, f: fScore[n.r][n.c] },
            state: {
              grid: makeGridState(cur),
              current: n,
              openCount: openSet.length,
              closedCount: closedSet.size,
              pathFound: false,
            },
          });
        }
      }
    }

    if (pathFound) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 20,
        explanation: `🎉 Goal reached! A* reconstructed optimal path of length ${finalPath.length - 1} steps from Start to Goal.`,
        isMilestone: true,
        milestoneTitle: `Goal Reached (${finalPath.length - 1} steps)`,
        soundCue: { type: 'complete' },
        variables: { pathLength: finalPath.length - 1, totalNodesExpanded: closedSet.size },
        callStack: [{ name: 'aStarSearch.reconstructPath', params: { steps: finalPath.length - 1 }, line: 20, isCurrent: true }],
        conditionEval: { expr: `pathFound == true`, result: true },
        scopeVariables: { pathLength: finalPath.length - 1, totalNodesExpanded: closedSet.size },
        state: {
          grid: makeGridState(goal, finalPath),
          current: goal,
          openCount: openSet.length,
          closedCount: closedSet.size,
          pathFound: true,
        },
      });
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame: ExecutionFrame<AStarState>) => {
    const { grid, current, openCount, closedCount, pathFound } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none">
        {/* Top HUD */}
        <div className="flex items-center gap-4 mb-4">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Open Set: <span className="text-amber-400 font-bold">{openCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Closed Set: <span className="text-cyan-400 font-bold">{closedCount}</span>
          </div>
          {pathFound && (
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold animate-pulse">
              Optimal Shortest Path Found!
            </div>
          )}
        </div>

        {/* 2D Grid Visualizer */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl flex flex-col gap-1.5">
          {grid.map((row, r) => (
            <div key={r} className="flex gap-1.5">
              {row.map((cell) => {
                const isCurrent = current?.r === cell.r && current?.c === cell.c;

                let cellBg = 'bg-slate-900/60 border-slate-800/80';
                if (cell.status === 'obstacle') cellBg = 'bg-slate-800 border-slate-700';
                else if (cell.status === 'start') cellBg = 'bg-emerald-600 border-emerald-400 text-slate-950 font-bold';
                else if (cell.status === 'goal') cellBg = 'bg-rose-600 border-rose-400 text-white font-bold';
                else if (cell.status === 'path') cellBg = 'bg-emerald-500/80 border-emerald-300 shadow-emerald-500/30 shadow-md';
                else if (cell.status === 'open') cellBg = 'bg-amber-950/60 border-amber-500/60 text-amber-200';
                else if (cell.status === 'closed') cellBg = 'bg-cyan-950/40 border-cyan-800/40 text-slate-400';

                return (
                  <div
                    key={`${cell.r}-${cell.c}`}
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-200 ${cellBg} ${
                      isCurrent ? 'ring-2 ring-white scale-105 z-10' : ''
                    }`}
                  >
                    {cell.status === 'obstacle' ? (
                      <span className="text-slate-600 text-base">■</span>
                    ) : cell.status === 'start' ? (
                      <span className="text-xs font-mono font-bold text-white">START</span>
                    ) : cell.status === 'goal' ? (
                      <span className="text-xs font-mono font-bold text-white">GOAL</span>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono font-bold">
                          {cell.f >= 0 ? `f:${cell.f}` : ''}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">
                          {cell.g >= 0 ? `g:${cell.g}` : ''}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-600" />
            <span>Goal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Open (Frontier)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-800" />
            <span>Closed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400" />
            <span>Optimal Path</span>
          </div>
        </div>
      </div>
    );
  },
};
