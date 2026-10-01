import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface Point2D {
  id: number;
  x: number;
  y: number;
}

export interface ClosestPairState {
  points: Point2D[];
  splitX: number | null;
  d: number;
  stripLeft: number | null;
  stripRight: number | null;
  closestPair: [Point2D, Point2D] | null;
  activeComparison: [Point2D, Point2D] | null;
  message: string;
}

function dist(p1: Point2D, p2: Point2D): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export const closestPairOfPointsModule: AlgorithmModule<
  { points: { x: number; y: number }[] },
  ClosestPairState
> = {
  id: 'closest-pair-points',
  title: 'Closest Pair of Points (O(N log N) Geometric Divide & Conquer)',
  category: 'math',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N) sorted coordinate buffers & strip partitions',
    worstCaseCondition: 'Strictly O(N log N) with 7-point strip packing bounding comparisons',
  },
  theory: {
    overview:
      'Given N points in the 2D plane, the Closest Pair problem finds the two points separated by the smallest Euclidean distance. Shamos and Hoey proved this can be solved in optimal O(N log N) time using Divide and Conquer, avoiding the naive O(N^2) all-pairs comparison.',
    whyItWorks:
      'The plane is partitioned by a vertical line at median x. We recursively find min distance d in both halves. In the boundary strip [x_mid - d, x_mid + d], geometric packing guarantees that for any point, at most 7 subsequent points in y-order can have distance less than d.',
    invariant:
      'Strip Packing Invariant: Any cross-boundary pair closer than d must lie within distance d horizontally from x_mid, and at most 7 candidate points in the y-sorted strip need inspection per point.',
    pitfalls: [
      'Re-sorting the strip by y-coordinate inside the recursive call, which degrades runtime to O(N log^2 N); resolved by pre-sorting or merging during divide step.',
      'Failing to handle base cases with N <= 3 directly via brute force.',
    ],
  },
  presets: [
    {
      id: 'closest-pair-cloud',
      label: '8-Point Coordinate Cloud',
      description: 'Finds nearest pair separated by a narrow boundary strip',
      data: {
        points: [
          { x: 2, y: 3 },
          { x: 12, y: 30 },
          { x: 40, y: 50 },
          { x: 5, y: 1 },
          { x: 12, y: 10 },
          { x: 3, y: 4 },
          { x: 25, y: 20 },
          { x: 18, y: 15 },
        ],
      },
    },
    {
      id: 'closest-pair-split-boundary',
      label: 'Dividing Line Boundary Case',
      description: 'Points straddling the middle divider with distance d < min(dL, dR)',
      data: {
        points: [
          { x: 1, y: 2 },
          { x: 4, y: 8 },
          { x: 9, y: 5 },
          { x: 11, y: 5.5 },
          { x: 16, y: 3 },
          { x: 20, y: 9 },
        ],
      },
    },
  ],
  defaultInput: {
    points: [
      { x: 2, y: 3 },
      { x: 12, y: 30 },
      { x: 40, y: 50 },
      { x: 5, y: 1 },
      { x: 12, y: 10 },
      { x: 3, y: 4 },
      { x: 25, y: 20 },
      { x: 18, y: 15 },
    ],
  },
  codeSnippets: {
    cpp: `double closestPair(vector<Point>& P) {
    sort(P.begin(), P.end(), [](Point a, Point b) { return a.x < b.x; });
    return solve(P, 0, P.size() - 1);
}

double solve(vector<Point>& P, int l, int r) {
    if (r - l <= 2) return bruteForce(P, l, r);
    int mid = (l + r) / 2;
    double d = min(solve(P, l, mid), solve(P, mid + 1, r));

    vector<Point> strip;
    for (int i = l; i <= r; i++)
        if (abs(P[i].x - P[mid].x) < d) strip.push_back(P[i]);

    sort(strip.begin(), strip.end(), [](Point a, Point b) { return a.y < b.y; });
    for (int i = 0; i < strip.size(); i++)
        for (int j = i + 1; j < strip.size() && (strip[j].y - strip[i].y) < d; j++)
            d = min(d, dist(strip[i], strip[j]));
    return d;
}`,
    python: `def closest_pair(pts):
    pts.sort(key=lambda p: p[0])
    def solve(l, r):
        if r - l <= 2: return brute_force(pts[l:r+1])
        mid = (l + r) // 2
        d = min(solve(l, mid), solve(mid + 1, r))
        strip = [p for p in pts[l:r+1] if abs(p[0] - pts[mid][0]) < d]
        strip.sort(key=lambda p: p[1])
        for i in range(len(strip)):
            for j in range(i + 1, min(i + 8, len(strip))):
                if strip[j][1] - strip[i][1] >= d: break
                d = min(d, dist(strip[i], strip[j]))
        return d
    return solve(0, len(pts) - 1)`,
    typescript: `function closestPair(points: Point[]): number {
  points.sort((a, b) => a.x - b.x);
  return divideAndConquer(points, 0, points.length - 1);
}`,
    java: `public double closestPair(Point[] pts) {
    Arrays.sort(pts, Comparator.comparingDouble(p -> p.x));
    return solve(pts, 0, pts.length - 1);
}`,
    pseudocode: `function closestPair(P):
    sort P by x
    split into left and right halves
    d = min(closest(left), closest(right))
    filter points within strip |x - mid_x| < d
    sort strip by y
    for each point in strip:
        check next 7 points in y-order, update d
    return d`,
  },
  generateTimeline: (input: { points: { x: number; y: number }[] }): ExecutionFrame<ClosestPairState>[] => {
    const rawPoints = input?.points?.length
      ? input.points
      : [
          { x: 2, y: 3 },
          { x: 12, y: 30 },
          { x: 5, y: 1 },
          { x: 3, y: 4 },
        ];

    const pts: Point2D[] = rawPoints.map((p, i) => ({ id: i + 1, x: p.x, y: p.y }));
    pts.sort((a, b) => a.x - b.x);

    const frames: ExecutionFrame<ClosestPairState>[] = [];
    let bestPair: [Point2D, Point2D] = [pts[0], pts[1]];
    let minD = dist(pts[0], pts[1]);

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      isMilestone: true,
      milestoneTitle: 'Points Initialized',
      soundCue: { type: 'start' },
      state: {
        points: [...pts],
        splitX: null,
        d: minD,
        stripLeft: null,
        stripRight: null,
        closestPair: null,
        activeComparison: null,
        message: `Loaded ${pts.length} 2D points. Sorting by X coordinate in O(N log N).`,
      },
      callStack: [{ name: 'closestPairInit', params: { totalPoints: pts.length } }],
      variables: { totalPoints: pts.length, initialDist: parseFloat(minD.toFixed(3)) },
      conditionEval: { expr: `pts.length >= 2`, result: true },
      explanation: `Points sorted by X: [${pts.map((p) => `(${p.x},${p.y})`).join(', ')}].`,
    });

    const midIdx = Math.floor(pts.length / 2);
    const midX = pts[midIdx].x;

    // Frame 1: Partition into Left and Right
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      action: 'DIVIDE_HALVES',
      isMilestone: true,
      milestoneTitle: `Divide: Split Line at X = ${midX}`,
      soundCue: { type: 'pivot' },
      state: {
        points: [...pts],
        splitX: midX,
        d: minD,
        stripLeft: null,
        stripRight: null,
        closestPair: null,
        activeComparison: null,
        message: `Dividing at midX = ${midX}: Left half has ${midIdx + 1} points, Right half has ${pts.length - midIdx - 1} points`,
      },
      callStack: [{ name: 'divide', params: { midX, leftSize: midIdx + 1, rightSize: pts.length - midIdx - 1 } }],
      variables: { midX, leftPoints: midIdx + 1, rightPoints: pts.length - midIdx - 1 },
      conditionEval: { expr: `midIdx === ${midIdx}`, result: true },
      explanation: `Dividing problem at vertical line x = ${midX}. Left partition: ${midIdx + 1} points, Right partition: ${pts.length - midIdx - 1} points.`,
    });

    // Check left half
    let dL = Infinity;
    let bestPairL: [Point2D, Point2D] = [pts[0], pts[1]];
    for (let i = 0; i <= midIdx; i++) {
      for (let j = i + 1; j <= midIdx; j++) {
        const d = dist(pts[i], pts[j]);
        const isBetter = d < dL;
        if (isBetter) {
          dL = d;
          bestPairL = [pts[i], pts[j]];
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          action: 'COMPARE_LEFT_PAIR',
          soundCue: { type: isBetter ? 'swap' : 'compare' },
          state: {
            points: [...pts],
            splitX: midX,
            d: dL,
            stripLeft: null,
            stripRight: null,
            closestPair: [...bestPairL],
            activeComparison: [pts[i], pts[j]],
            message: `Comparing left pair (P${pts[i].id}, P${pts[j].id}): dist=${d.toFixed(3)} ${isBetter ? '< new dL' : '>= dL'}`,
          },
          callStack: [{ name: 'compareLeft', params: { p1: pts[i].id, p2: pts[j].id, dist: d.toFixed(3) } }],
          variables: { p1: `P${pts[i].id}`, p2: `P${pts[j].id}`, calculatedDist: parseFloat(d.toFixed(3)), currentMinLeft: parseFloat(dL.toFixed(3)) },
          conditionEval: { expr: `dist (${d.toFixed(3)}) < dL`, result: isBetter },
          explanation: `Tested distance between P${pts[i].id} (${pts[i].x},${pts[i].y}) and P${pts[j].id} (${pts[j].x},${pts[j].y}) = ${d.toFixed(3)}.`,
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      action: 'LEFT_HALF_SOLVED',
      isMilestone: true,
      milestoneTitle: `Left Minimum: dL = ${dL.toFixed(3)}`,
      soundCue: { type: 'complete' },
      state: {
        points: [...pts],
        splitX: midX,
        d: dL,
        stripLeft: null,
        stripRight: null,
        closestPair: [...bestPairL],
        activeComparison: null,
        message: `Left half solved: d_L = ${dL.toFixed(3)} between P${bestPairL[0].id} and P${bestPairL[1].id}`,
      },
      callStack: [{ name: 'solveLeft', params: { midX, dL: dL.toFixed(3) } }],
      variables: { dLeft: parseFloat(dL.toFixed(3)), p1: `P${bestPairL[0].id}`, p2: `P${bestPairL[1].id}` },
      explanation: `Left half solved: minimum intra-left distance is dL = ${dL.toFixed(3)} between P${bestPairL[0].id} and P${bestPairL[1].id}.`,
    });

    // Check right half
    let dR = Infinity;
    let bestPairR: [Point2D, Point2D] = [pts[midIdx + 1], pts[midIdx + 2] || pts[midIdx + 1]];
    for (let i = midIdx + 1; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = dist(pts[i], pts[j]);
        if (d < dR) {
          dR = d;
          bestPairR = [pts[i], pts[j]];
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      action: 'INSPECT_RIGHT_HALF',
      state: {
        points: [...pts],
        splitX: midX,
        d: Math.min(dL, dR),
        stripLeft: null,
        stripRight: null,
        closestPair: dR < dL ? [...bestPairR] : [...bestPairL],
        activeComparison: [bestPairR[0], bestPairR[1]],
        message: `Inspecting right partition: testing pairs within x > ${midX}`,
      },
      callStack: [{ name: 'solveRightHalf', params: { rightPoints: pts.length - midIdx - 1 } }],
      variables: { side: 'RIGHT', inspectedPairs: ((pts.length - midIdx - 1) * (pts.length - midIdx - 2)) / 2 },
      explanation: `Examined all pairwise distances in right half. Best candidate pair found: P${bestPairR[0].id} and P${bestPairR[1].id}.`,
    });

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      action: 'RIGHT_HALF_SOLVED',
      isMilestone: true,
      milestoneTitle: `Right Minimum: dR = ${dR.toFixed(3)}`,
      state: {
        points: [...pts],
        splitX: midX,
        d: dR,
        stripLeft: null,
        stripRight: null,
        closestPair: [...bestPairR],
        activeComparison: null,
        message: `Right half solved: d_R = ${dR.toFixed(3)} between P${bestPairR[0].id} and P${bestPairR[1].id}`,
      },
      callStack: [{ name: 'solveRight', params: { dR: dR.toFixed(3) } }],
      variables: { dRight: parseFloat(dR.toFixed(3)), p1: `P${bestPairR[0].id}`, p2: `P${bestPairR[1].id}` },
      explanation: `Right half solved: minimum intra-right distance is dR = ${dR.toFixed(3)} between P${bestPairR[0].id} and P${bestPairR[1].id}.`,
    });

    minD = Math.min(dL, dR);
    bestPair = dL <= dR ? bestPairL : bestPairR;

    // Frame: Combine d = min(dL, dR)
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      action: 'COMBINE_HALVES',
      isMilestone: true,
      milestoneTitle: `d = min(dL, dR) = ${minD.toFixed(3)}`,
      state: {
        points: [...pts],
        splitX: midX,
        d: minD,
        stripLeft: null,
        stripRight: null,
        closestPair: [...bestPair],
        activeComparison: null,
        message: `Combined halves: d = min(${dL.toFixed(3)}, ${dR.toFixed(3)}) = ${minD.toFixed(3)}`,
      },
      callStack: [{ name: 'combine', params: { dL: dL.toFixed(3), dR: dR.toFixed(3), minD: minD.toFixed(3) } }],
      variables: { dL: parseFloat(dL.toFixed(3)), dR: parseFloat(dR.toFixed(3)), currentMinD: parseFloat(minD.toFixed(3)) },
      explanation: `Combined both halves: d = min(dL, dR) = ${minD.toFixed(3)}. Now need to check if any cross-boundary pair has distance < d.`,
    });

    // Strip check
    const strip = pts.filter((p) => Math.abs(p.x - midX) < minD);
    strip.sort((a, b) => a.y - b.y);

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      action: 'STRIP_CONSTRUCTED',
      isMilestone: true,
      milestoneTitle: `Boundary Strip: [${(midX - minD).toFixed(2)} .. ${(midX + minD).toFixed(2)}]`,
      state: {
        points: [...pts],
        splitX: midX,
        d: minD,
        stripLeft: midX - minD,
        stripRight: midX + minD,
        closestPair: [...bestPair],
        activeComparison: null,
        message: `Constructed strip [${(midX - minD).toFixed(2)} .. ${(midX + minD).toFixed(
          2
        )}] containing ${strip.length} candidate points`,
      },
      callStack: [{ name: 'scanStrip', params: { stripCount: strip.length, stripWidth: (2 * minD).toFixed(3) } }],
      variables: { stripWidth: parseFloat((2 * minD).toFixed(3)), pointsInStrip: strip.length },
      explanation: `Constructed boundary strip around x=${midX} of width 2d=${(2 * minD).toFixed(
        3
      )}. Only points within |x - midX| < d can possibly be closer than ${minD.toFixed(3)}. Sorted ${strip.length} strip points by Y.`,
    });

    // Check strip pairs
    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < minD; j++) {
        const d = dist(strip[i], strip[j]);
        if (d < minD) {
          minD = d;
          bestPair = [strip[i], strip[j]];

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 20,
            action: 'CROSS_BOUNDARY_UPDATE',
            isMilestone: true,
            milestoneTitle: `Strip Improvement: ${minD.toFixed(3)}`,
            state: {
              points: [...pts],
              splitX: midX,
              d: minD,
              stripLeft: midX - minD,
              stripRight: midX + minD,
              closestPair: [...bestPair],
              activeComparison: [strip[i], strip[j]],
              message: `Cross-boundary improvement! P${strip[i].id} and P${strip[j].id} have distance ${minD.toFixed(
                3
              )} < previous d`,
            },
            callStack: [{ name: 'stripImprovement', params: { newMin: minD.toFixed(3) } }],
            variables: { p1: `P${strip[i].id}`, p2: `P${strip[j].id}`, newDistance: parseFloat(minD.toFixed(3)) },
            explanation: `Found cross-boundary pair P${strip[i].id} and P${strip[j].id} with distance ${minD.toFixed(
              3
            )}, strictly smaller than left and right halves!`,
          });
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 25,
      action: 'COMPLETE',
      isMilestone: true,
      milestoneTitle: `Optimal Pair: (P${bestPair[0].id}, P${bestPair[1].id}) d = ${minD.toFixed(3)}`,
      state: {
        points: [...pts],
        splitX: midX,
        d: minD,
        stripLeft: midX - minD,
        stripRight: midX + minD,
        closestPair: [...bestPair],
        activeComparison: null,
        message: `Completed: Closest Pair is (P${bestPair[0].id}, P${bestPair[1].id}) with distance ${minD.toFixed(
          3
        )}`,
      },
      callStack: [{ name: 'complete', params: { finalMinDist: minD.toFixed(3) } }],
      variables: {
        closestPair: `(P${bestPair[0].id}, P${bestPair[1].id})`,
        finalDistance: parseFloat(minD.toFixed(3)),
        timeComplexity: 'O(N log N)',
      },
      explanation: `Divide & Conquer finished. Minimum Euclidean distance is ${minD.toFixed(
        3
      )} between P${bestPair[0].id} (${bestPair[0].x}, ${bestPair[0].y}) and P${bestPair[1].id} (${bestPair[1].x}, ${bestPair[1].y}).`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<ClosestPairState>) => {
    const { points, splitX, d, stripLeft, stripRight, closestPair, message } = frame.state;

    // Normalizing coordinates for SVG
    const maxX = Math.max(...points.map((p) => p.x), 45);
    const maxY = Math.max(...points.map((p) => p.y), 55);

    const mapX = (x: number) => 50 + (x / maxX) * 440;
    const mapY = (y: number) => 270 - (y / maxY) * 220;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Minimum Dist (d): <strong className="text-emerald-400 text-sm">{d.toFixed(3)}</strong></span>
          </div>
        </div>

        {/* 2D Plane Scatter Plot */}
        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[320px] flex items-center justify-center">
          <svg className="w-[560px] h-[300px]" viewBox="0 0 560 300">
            {/* Shaded Strip Region */}
            {stripLeft !== null && stripRight !== null && (
              <rect
                x={mapX(Math.max(0, stripLeft))}
                y={30}
                width={Math.max(0, mapX(stripRight) - mapX(Math.max(0, stripLeft)))}
                height={240}
                fill="#38bdf8"
                fillOpacity="0.08"
                stroke="#38bdf8"
                strokeOpacity="0.3"
                strokeDasharray="4 2"
              />
            )}

            {/* Middle Divider Line */}
            {splitX !== null && (
              <line
                x1={mapX(splitX)}
                y1={30}
                x2={mapX(splitX)}
                y2={270}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

            {/* Closest Pair Line */}
            {closestPair && (
              <line
                x1={mapX(closestPair[0].x)}
                y1={mapY(closestPair[0].y)}
                x2={mapX(closestPair[1].x)}
                y2={mapY(closestPair[1].y)}
                stroke="#10b981"
                strokeWidth="3"
                className="transition-all duration-300"
              />
            )}

            {/* Scatter Points */}
            {points.map((p) => {
              const isClosest =
                closestPair && (closestPair[0].id === p.id || closestPair[1].id === p.id);

              return (
                <g key={`pt-${p.id}`} className="transition-all duration-300">
                  <circle
                    cx={mapX(p.x)}
                    cy={mapY(p.y)}
                    r={isClosest ? '7' : '4.5'}
                    fill={isClosest ? '#10b981' : '#38bdf8'}
                    stroke={isClosest ? '#d1fae5' : '#0369a1'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={mapX(p.x) + 8}
                    y={mapY(p.y) + 3}
                    fill={isClosest ? '#34d399' : '#94a3b8'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isClosest ? 'bold' : 'normal'}
                  >
                    P{p.id}({p.x},{p.y})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
