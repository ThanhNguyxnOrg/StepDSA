import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface Point2D {
  x: number;
  y: number;
  id: string;
}

export interface ConvexHullState {
  points: Point2D[];
  pivot: Point2D | null;
  sortedPoints: Point2D[];
  hull: Point2D[];
  currentPoint: Point2D | null;
  actionType: 'INIT' | 'SORT' | 'PUSH' | 'POP' | 'DONE';
}

function crossProduct(o: Point2D, a: Point2D, b: Point2D): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export const convexHullModule: AlgorithmModule<
  { points: Point2D[] },
  ConvexHullState
> = {
  id: 'convex-hull',
  title: 'Convex Hull (Graham Scan & Cross-Product Orientation O(N log N))',
  category: 'math',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N) for sorted array and hull stack',
    worstCaseCondition: 'Bottlenecked by initial polar angle sorting O(N log N); scan itself takes O(N)',
  },
  theory: {
    overview:
      "The Graham Scan algorithm computes the 2D Convex Hull (the smallest convex polygon containing all points) in O(N log N) time using polar angle sorting and stack-based orientation tests.",
    whyItWorks:
      'After finding the lowest-Y pivot P0, points are sorted by polar angle. A stack maintains the current hull boundary. If adding the next point creates a clockwise or collinear turn (cross-product <= 0), the previous point cannot be on the convex hull and is popped.',
    invariant:
      'Strict Counter-Clockwise Invariant: Every consecutive triplet of points on the hull stack satisfies crossProduct(p_{k-1}, p_k, p_{k+1}) > 0 (strictly counter-clockwise left turn).',
    pitfalls: [
      'Collinear points requiring consistent tie-breaking (e.g. keeping the furthest point from the pivot).',
      'Incorrect 2D cross-product orientation sign (counter-clockwise is positive in right-handed systems).',
    ],
  },
  presets: [
    {
      id: 'classic-cloud',
      label: 'Random Point Cloud (8 Points)',
      description: 'Points with internal vertices that get pruned during Graham scan',
      data: {
        points: [
          { x: 30, y: 40, id: 'A' },
          { x: 60, y: 120, id: 'B' },
          { x: 120, y: 50, id: 'C' },
          { x: 90, y: 80, id: 'D' },
          { x: 150, y: 130, id: 'E' },
          { x: 40, y: 160, id: 'F' },
          { x: 170, y: 70, id: 'G' },
          { x: 100, y: 150, id: 'H' },
        ],
      },
    },
    {
      id: 'simple-square-with-center',
      label: 'Square with Interior Node',
      description: 'Prunes internal center point to preserve square perimeter',
      data: {
        points: [
          { x: 40, y: 40, id: 'P1' },
          { x: 160, y: 40, id: 'P2' },
          { x: 160, y: 160, id: 'P3' },
          { x: 40, y: 160, id: 'P4' },
          { x: 100, y: 100, id: 'Center' },
        ],
      },
    },
  ],
  defaultInput: {
    points: [
      { x: 30, y: 40, id: 'A' },
      { x: 60, y: 120, id: 'B' },
      { x: 120, y: 50, id: 'C' },
      { x: 90, y: 80, id: 'D' },
      { x: 150, y: 130, id: 'E' },
      { x: 40, y: 160, id: 'F' },
      { x: 170, y: 70, id: 'G' },
      { x: 100, y: 150, id: 'H' },
    ],
  },
  codeSnippets: {
    cpp: `vector<Point> grahamScan(vector<Point>& pts) {
    auto pivot = *min_element(pts.begin(), pts.end(), [](auto& a, auto& b) {
        return a.y < b.y || (a.y == b.y && a.x < b.x);
    });
    sort(pts.begin(), pts.end(), [&](auto& a, auto& b) {
        long long cp = crossProduct(pivot, a, b);
        if (cp == 0) return distSq(pivot, a) < distSq(pivot, b);
        return cp > 0;
    });
    vector<Point> hull;
    for (auto& p : pts) {
        while (hull.size() >= 2 && crossProduct(hull[hull.size()-2], hull.back(), p) <= 0)
            hull.pop_back();
        hull.push_back(p);
    }
    return hull;
}`,
    python: `def graham_scan(pts: list[tuple[int, int]]):
    pivot = min(pts, key=lambda p: (p[1], p[0]))
    def polar_angle(p):
        return math.atan2(p[1] - pivot[1], p[0] - pivot[0])
    sorted_pts = sorted(pts, key=polar_angle)
    hull = []
    for p in sorted_pts:
        while len(hull) >= 2 and cross_product(hull[-2], hull[-1], p) <= 0:
            hull.pop()
        hull.append(p)
    return hull`,
    typescript: `function grahamScan(pts: Point2D[]): Point2D[] {
  const pivot = pts.reduce((min, p) => (p.y < min.y || (p.y === min.y && p.x < min.x) ? p : min), pts[0]);
  const sorted = [...pts].sort((a, b) => {
    const cp = crossProduct(pivot, a, b);
    return cp === 0 ? distSq(pivot, a) - distSq(pivot, b) : -cp;
  });
  const hull: Point2D[] = [];
  for (const p of sorted) {
    while (hull.length >= 2 && crossProduct(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
      hull.pop();
    }
    hull.push(p);
  }
  return hull;
}`,
    java: `public List<Point> grahamScan(List<Point> pts) {
    Point pivot = pts.stream().min(Comparator.comparingInt((Point p) -> p.y).thenComparingInt(p -> p.x)).get();
    pts.sort((a, b) -> {
        int cp = crossProduct(pivot, a, b);
        return cp == 0 ? distSq(pivot, a) - distSq(pivot, b) : -cp;
    });
    Deque<Point> stack = new ArrayDeque<>();
    for (Point p : pts) {
        while (stack.size() >= 2 && crossProduct(secondFromTop(stack), stack.peek(), p) <= 0)
            stack.pop();
        stack.push(p);
    }
    return new ArrayList<>(stack);
}`,
    pseudocode: `function grahamScan(points):
    pivot = lowest point (min Y, then min X)
    sortedPoints = sort points by polar angle with pivot
    hull = []
    for p in sortedPoints:
        while length(hull) >= 2 and crossProduct(hull[-2], hull[-1], p) <= 0:
            hull.pop()
        hull.push(p)
    return hull`,
  },
  generateTimeline: (input: { points: Point2D[] }): ExecutionFrame<ConvexHullState>[] => {
    const pts = input?.points?.length ? input.points : [
      { x: 30, y: 40, id: 'A' },
      { x: 60, y: 120, id: 'B' },
      { x: 120, y: 50, id: 'C' },
      { x: 90, y: 80, id: 'D' },
      { x: 150, y: 130, id: 'E' },
      { x: 40, y: 160, id: 'F' },
      { x: 170, y: 70, id: 'G' },
      { x: 100, y: 150, id: 'H' },
    ];

    const frames: ExecutionFrame<ConvexHullState>[] = [];

    // Find pivot
    let pivot = pts[0];
    for (const p of pts) {
      if (p.y < pivot.y || (p.y === pivot.y && p.x < pivot.x)) {
        pivot = p;
      }
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: {
        points: pts,
        pivot,
        sortedPoints: [],
        hull: [],
        currentPoint: null,
        actionType: 'INIT',
      },
      callStack: [{ name: 'grahamScan', params: { pivotId: pivot.id, x: pivot.x, y: pivot.y } }],
      variables: { pivot: `${pivot.id}(${pivot.x},${pivot.y})`, totalPoints: pts.length },
      explanation: `Selected pivot point ${pivot.id} at (${pivot.x}, ${pivot.y}) with minimum Y coordinate.`,
    });

    // Polar sort
    function polarAngle(p: Point2D): number {
      return Math.atan2(p.y - pivot.y, p.x - pivot.x);
    }

    const sortedPoints = [...pts].sort((a, b) => {
      if (a.id === pivot.id) return -1;
      if (b.id === pivot.id) return 1;
      const angleA = polarAngle(a);
      const angleB = polarAngle(b);
      return angleA - angleB;
    });

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      action: 'SORT',
      state: {
        points: pts,
        pivot,
        sortedPoints,
        hull: [],
        currentPoint: null,
        actionType: 'SORT',
      },
      callStack: [{ name: 'polarSort', params: { count: sortedPoints.length } }],
      variables: { sortedOrder: sortedPoints.map((p) => p.id).join(' -> ') },
      explanation: `Sorted points counter-clockwise by polar angle around pivot ${pivot.id}: [${sortedPoints
        .map((p) => p.id)
        .join(', ')}].`,
    });

    const hull: Point2D[] = [];
    for (const p of sortedPoints) {
      while (hull.length >= 2) {
        const o = hull[hull.length - 2];
        const a = hull[hull.length - 1];
        const cp = crossProduct(o, a, p);

        if (cp <= 0) {
          const popped = hull.pop()!;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            action: 'POP',
            state: {
              points: pts,
              pivot,
              sortedPoints,
              hull: [...hull],
              currentPoint: p,
              actionType: 'POP',
            },
            callStack: [{ name: 'popClockwiseTurn', params: { popped: popped.id, candidate: p.id, crossProduct: cp } }],
            variables: { poppedNode: popped.id, candidate: p.id, crossProduct: cp, reason: 'Clockwise or collinear turn' },
            explanation: `Cross product (${o.id} -> ${a.id} -> ${p.id}) is ${cp} <= 0 (right turn). Popped internal point ${popped.id}.`,
          });
        } else {
          break;
        }
      }

      hull.push(p);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 14,
        action: 'PUSH',
        state: {
          points: pts,
          pivot,
          sortedPoints,
          hull: [...hull],
          currentPoint: p,
          actionType: 'PUSH',
        },
        callStack: [{ name: 'pushHull', params: { addedPoint: p.id, hullSize: hull.length } }],
        variables: { addedPoint: p.id, currentHull: hull.map((pt) => pt.id).join(' -> ') },
        explanation: `Added point ${p.id} to Convex Hull stack (left turn confirmed). Hull size: ${hull.length}.`,
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 16,
      action: 'DONE',
      state: {
        points: pts,
        pivot,
        sortedPoints,
        hull: [...hull],
        currentPoint: null,
        actionType: 'DONE',
      },
      callStack: [{ name: 'grahamScan', params: { totalHullVertices: hull.length, status: 'DONE' } }],
      variables: { convexHullVertices: hull.map((pt) => pt.id).join(' -> '), totalVertices: hull.length },
      explanation: `Graham Scan completed! Convex Hull formed by ${hull.length} boundary vertices: [${hull
        .map((pt) => pt.id)
        .join(', ')}].`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<ConvexHullState>) => {
    const { points, pivot, hull, currentPoint } = frame.state;

    // Coordinate mapping
    const minX = Math.min(...points.map((p) => p.x)) - 20;
    const maxX = Math.max(...points.map((p) => p.x)) + 20;
    const minY = Math.min(...points.map((p) => p.y)) - 20;
    const maxY = Math.max(...points.map((p) => p.y)) + 20;

    const width = 460;
    const height = 280;

    function scaleX(x: number) {
      return 30 + ((x - minX) / (maxX - minX)) * (width - 60);
    }
    function scaleY(y: number) {
      return height - 30 - ((y - minY) / (maxY - minY)) * (height - 60);
    }

    const hullPointsStr = hull.map((p) => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ');

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Hull Boundary:</span>
            <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded">
              {hull.length > 0 ? hull.map((p) => p.id).join(' → ') : 'Initializing'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Vertices:</span>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              {hull.length} / {points.length}
            </span>
          </div>
        </div>

        {/* 2D Plane SVG */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <svg width={width} height={height} className="overflow-visible">
            {/* Convex polygon fill */}
            {hull.length >= 3 && (
              <polygon
                points={hullPointsStr}
                fill="#10b98115"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            )}

            {/* Hull line segments */}
            {hull.length >= 2 &&
              hull.map((p, idx) => {
                if (idx === hull.length - 1) return null;
                const next = hull[idx + 1];
                return (
                  <line
                    key={idx}
                    x1={scaleX(p.x)}
                    y1={scaleY(p.y)}
                    x2={scaleX(next.x)}
                    y2={scaleY(next.y)}
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                );
              })}

            {/* Candidate line to currentPoint */}
            {currentPoint && hull.length > 0 && (
              <line
                x1={scaleX(hull[hull.length - 1].x)}
                y1={scaleY(hull[hull.length - 1].y)}
                x2={scaleX(currentPoint.x)}
                y2={scaleY(currentPoint.y)}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            )}

            {/* Points */}
            {points.map((p) => {
              const cx = scaleX(p.x);
              const cy = scaleY(p.y);
              const isPivot = pivot && pivot.id === p.id;
              const inHull = hull.some((h) => h.id === p.id);
              const isCurr = currentPoint && currentPoint.id === p.id;

              return (
                <g key={p.id}>
                  {isCurr && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill={isPivot ? '#3b82f6' : inHull ? '#10b981' : '#475569'}
                    stroke={isPivot ? '#60a5fa' : inHull ? '#34d399' : '#1e293b'}
                    strokeWidth="2"
                  />
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {p.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span>Pivot P0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>Convex Hull Boundary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
            <span>Interior Point</span>
          </div>
        </div>
      </div>
    );
  },
};
