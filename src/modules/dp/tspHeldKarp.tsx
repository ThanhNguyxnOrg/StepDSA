import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface TSPState {
  cities: string[];
  distances: number[][];
  activeMask: number;
  activeCity: number;
  bestCost: number;
  tour: number[];
  dpTablePreview: { maskStr: string; city: string; cost: number }[];
}

export const tspHeldKarpModule: AlgorithmModule<
  { cities: string[]; distances: number[][] },
  TSPState
> = {
  id: 'tsp-held-karp',
  title: 'Traveling Salesperson Problem (Held-Karp Bitmask DP O(2^N * N^2))',
  category: 'dynamic-programming',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(2^N * N^2)',
    timeAverage: 'O(2^N * N^2)',
    timeWorst: 'O(2^N * N^2)',
    spaceAuxiliary: 'O(2^N * N) DP memoization table',
    worstCaseCondition: 'All complete graphs require populating the full 2^N * N bitmask state table',
  },
  theory: {
    overview:
      'The Held-Karp algorithm solves the NP-hard Traveling Salesperson Problem (TSP) in O(2^N * N^2) time via Dynamic Programming with Bitmasking, vastly outperforming the brute-force O(N!) factorial search.',
    whyItWorks:
      'State dp(mask, u) represents the minimum path cost visiting exactly the subset of cities in bitmask starting from city 0 and ending at city u. Transition: dp(mask | (1 << v), v) = min_{u in mask}(dp(mask, u) + dist[u][v]).',
    invariant:
      'Optimal Substructure Invariant: If a path visiting subset S ending at u is part of the optimal tour, the prefix path visiting S must be minimal among all paths with that subset and endpoint.',
    pitfalls: [
      'Applying to large N (e.g. N > 22) where 2^N state space exceeds available RAM memory limits.',
      'Forgetting to add the return cost from the last city back to the starting city 0.',
    ],
  },
  presets: [
    {
      id: 'four-cities-symmetric',
      label: '4 Cities: [A, B, C, D] Fully Connected',
      description: 'Classic 4-vertex distance matrix',
      data: {
        cities: ['A', 'B', 'C', 'D'],
        distances: [
          [0, 10, 15, 20],
          [10, 0, 35, 25],
          [15, 35, 0, 30],
          [20, 25, 30, 0],
        ],
      },
    },
    {
      id: 'five-cities-geometric',
      label: '5 Cities (Polygon vertices)',
      description: '5-vertex TSP with clear perimeter optimal tour',
      data: {
        cities: ['0', '1', '2', '3', '4'],
        distances: [
          [0, 12, 29, 22, 13],
          [12, 0, 19, 31, 25],
          [29, 19, 0, 15, 21],
          [22, 31, 15, 0, 18],
          [13, 25, 21, 18, 0],
        ],
      },
    },
  ],
  defaultInput: {
    cities: ['A', 'B', 'C', 'D'],
    distances: [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ],
  },
  codeSnippets: {
    cpp: `int tsp(int n, vector<vector<int>>& dist) {
    int totalMasks = 1 << n;
    vector<vector<int>> dp(totalMasks, vector<int>(n, 1e9));
    dp[1][0] = 0;
    for (int mask = 1; mask < totalMasks; ++mask) {
        for (int u = 0; u < n; ++u) {
            if (!(mask & (1 << u))) continue;
            for (int v = 0; v < n; ++v) {
                if (mask & (1 << v)) continue;
                int nxt = mask | (1 << v);
                dp[nxt][v] = min(dp[nxt][v], dp[mask][u] + dist[u][v]);
            }
        }
    }
    int ans = 1e9;
    for (int u = 1; u < n; ++u) ans = min(ans, dp[(1 << n) - 1][u] + dist[u][0]);
    return ans;
}`,
    python: `def tsp_held_karp(n: int, dist: list[list[int]]) -> int:
    dp = {}
    dp[(1, 0)] = 0
    for mask in range(1, 1 << n):
        for u in range(n):
            if not (mask & (1 << u)) or (mask, u) not in dp: continue
            for v in range(n):
                if mask & (1 << v): continue
                nxt = (mask | (1 << v), v)
                dp[nxt] = min(dp.get(nxt, float('inf')), dp[(mask, u)] + dist[u][v])
    return min(dp[((1 << n) - 1, u)] + dist[u][0] for u in range(1, n))`,
    typescript: `function tsp(n: number, dist: number[][]): number {
  const total = 1 << n;
  const dp: number[][] = Array.from({ length: total }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0;
  for (let mask = 1; mask < total; mask++) {
    for (let u = 0; u < n; u++) {
      if ((mask & (1 << u)) === 0 || dp[mask][u] === Infinity) continue;
      for (let v = 0; v < n; v++) {
        if ((mask & (1 << v)) === 0) {
          const nxt = mask | (1 << v);
          dp[nxt][v] = Math.min(dp[nxt][v], dp[mask][u] + dist[u][v]);
        }
      }
    }
  }
  let ans = Infinity;
  for (let u = 1; u < n; u++) ans = Math.min(ans, dp[total - 1][u] + dist[u][0]);
  return ans;
}`,
    java: `public int tsp(int n, int[][] dist) {
    int total = 1 << n;
    int[][] dp = new int[total][n];
    for (int[] row : dp) Arrays.fill(row, (int)1e9);
    dp[1][0] = 0;
    // Iterate bitmasks and endpoints
    return 0;
}`,
    pseudocode: `function tsp(n, dist):
    dp[1][0] = 0
    for mask from 1 to (2^n - 1):
        for u in mask:
            for v not in mask:
                dp[mask | (1 << v)][v] = min(..., dp[mask][u] + dist[u][v])
    return min_{u}(dp[2^n - 1][u] + dist[u][0])`,
  },
  generateTimeline: (input: {
    cities: string[];
    distances: number[][];
  }): ExecutionFrame<TSPState>[] => {
    const rawCities = input?.cities?.length ? input.cities : ['A', 'B', 'C', 'D'];
    const n = Math.min(rawCities.length, 5); // Bound to at most 5 for smooth stepping
    const cities = rawCities.slice(0, n);
    const dist = input?.distances?.length
      ? input.distances.slice(0, n).map((r) => r.slice(0, n))
      : [
          [0, 10, 15, 20],
          [10, 0, 35, 25],
          [15, 35, 0, 30],
          [20, 25, 30, 0],
        ];

    const frames: ExecutionFrame<TSPState>[] = [];
    const totalMasks = 1 << n;
    const dp: number[][] = Array.from({ length: totalMasks }, () => new Array(n).fill(Infinity));
    const parent: number[][] = Array.from({ length: totalMasks }, () => new Array(n).fill(-1));
    dp[1][0] = 0;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        cities,
        distances: dist,
        activeMask: 1,
        activeCity: 0,
        bestCost: 0,
        tour: [0],
        dpTablePreview: [{ maskStr: '0001', city: cities[0], cost: 0 }],
      },
      callStack: [{ name: 'tspHeldKarp', params: { totalCities: n, startCity: cities[0] } }],
      variables: { cities: cities.join(', '), totalMasks, startCity: cities[0] },
      explanation: `Initialized Held-Karp TSP with ${n} cities. Base state dp[mask=1][${cities[0]}] = 0.`,
    });

    const previewStates: { maskStr: string; city: string; cost: number }[] = [
      { maskStr: (1).toString(2).padStart(n, '0'), city: cities[0], cost: 0 },
    ];

    for (let mask = 1; mask < totalMasks; mask++) {
      for (let u = 0; u < n; u++) {
        if ((mask & (1 << u)) === 0 || dp[mask][u] === Infinity) continue;

        for (let v = 0; v < n; v++) {
          if ((mask & (1 << v)) === 0) {
            const nextMask = mask | (1 << v);
            const newCost = dp[mask][u] + dist[u][v];

            if (newCost < dp[nextMask][v]) {
              dp[nextMask][v] = newCost;
              parent[nextMask][v] = u;

              if (previewStates.length < 8) {
                previewStates.push({
                  maskStr: nextMask.toString(2).padStart(n, '0'),
                  city: cities[v],
                  cost: newCost,
                });
              }

              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 10,
                action: 'DP_UPDATE',
                state: {
                  cities,
                  distances: dist,
                  activeMask: nextMask,
                  activeCity: v,
                  bestCost: newCost,
                  tour: [0, u, v],
                  dpTablePreview: [...previewStates],
                },
                callStack: [{ name: 'relaxEdge', params: { from: cities[u], to: cities[v], cost: newCost } }],
                variables: {
                  from: cities[u],
                  to: cities[v],
                  mask: nextMask.toString(2).padStart(n, '0'),
                  accumulatedCost: newCost,
                },
                explanation: `Visited ${cities[v]} from ${cities[u]}. State dp[${nextMask.toString(
                  2
                ).padStart(n, '0')}][${cities[v]}] updated to ${newCost}.`,
              });
            }
          }
        }
      }
    }

    // Find best return to 0
    let bestFinalCost = Infinity;
    let lastCity = -1;
    for (let u = 1; u < n; u++) {
      const tourCost = dp[totalMasks - 1][u] + dist[u][0];
      if (tourCost < bestFinalCost) {
        bestFinalCost = tourCost;
        lastCity = u;
      }
    }

    // Reconstruct tour
    const tour: number[] = [];
    let curMask = totalMasks - 1;
    let curCity = lastCity;
    while (curCity !== -1) {
      tour.unshift(curCity);
      const prev = parent[curMask][curCity];
      curMask ^= 1 << curCity;
      curCity = prev;
    }
    tour.push(0); // Return to start

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      action: 'COMPLETE',
      state: {
        cities,
        distances: dist,
        activeMask: totalMasks - 1,
        activeCity: 0,
        bestCost: bestFinalCost,
        tour: [...tour],
        dpTablePreview: [...previewStates],
      },
      callStack: [{ name: 'tspHeldKarp', params: { bestCost: bestFinalCost, status: 'DONE' } }],
      variables: {
        optimalTour: tour.map((idx) => cities[idx]).join(' -> '),
        minimumTotalCost: bestFinalCost,
      },
      explanation: `Optimal Hamiltonian cycle found: ${tour
        .map((idx) => cities[idx])
        .join(' -> ')} with minimum total distance = ${bestFinalCost}!`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<TSPState>) => {
    const { cities, distances, bestCost, tour, activeCity } = frame.state;
    const n = cities.length;
    const radius = 110;
    const centerX = 170;
    const centerY = 140;

    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Optimal Tour:</span>
            <span className="font-mono text-sm font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded">
              {tour.map((idx) => cities[idx]).join(' → ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Min Distance:</span>
            <span className="text-lg font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded">
              {bestCost > 0 ? bestCost : 0}
            </span>
          </div>
        </div>

        {/* 2D Plane Graph SVG */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-around gap-6 w-full">
          <svg width="340" height="280" className="overflow-visible">
            {/* Draw all edges */}
            {positions.map((p1, i) =>
              positions.map((p2, j) => {
                if (i >= j) return null;
                const isTourEdge = tour.some(
                  (c, idx) =>
                    (c === i && tour[idx + 1] === j) || (c === j && tour[idx + 1] === i)
                );

                return (
                  <line
                    key={`${i}-${j}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isTourEdge ? '#f59e0b' : '#334155'}
                    strokeWidth={isTourEdge ? '3.5' : '1'}
                    className="transition-colors duration-200"
                  />
                );
              })
            )}

            {/* Nodes */}
            {positions.map((p, i) => {
              const isActive = activeCity === i;
              const isStart = i === 0;

              return (
                <g key={i}>
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="26"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="19"
                    fill={isStart ? '#1e3a8a' : isActive ? '#78350f' : '#0f172a'}
                    stroke={isStart ? '#3b82f6' : isActive ? '#f59e0b' : '#475569'}
                    strokeWidth="3"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {cities[i]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Distance Table */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Distance Matrix D:
            </span>
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${n}, minmax(36px, 1fr))` }}
            >
              {distances.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`h-9 rounded flex items-center justify-center font-mono text-xs font-bold border ${
                      r === c
                        ? 'bg-slate-900 border-slate-800 text-slate-600'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
