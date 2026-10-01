import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface Point2D {
  x: number;
  y: number;
}

export interface PointInPolygonState {
  polygon: Point2D[];
  testPoint: Point2D;
  activeEdgeIdx: number | null;
  intersectionCount: number;
  intersectionPoints: Point2D[];
  isInside: boolean | null;
  message: string;
}

export const pointInPolygonModule: AlgorithmModule<
  { polygon: Point2D[]; testPoint: Point2D },
  PointInPolygonState
> = {
  id: 'point-in-polygon',
  title: 'Point in Polygon Test (Ray Casting & Winding Number O(N))',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1) scalar intersection tracking',
    worstCaseCondition: 'Strictly linear in the number of polygon vertices N',
  },
  theory: {
    overview:
      'The Point in Polygon (PIP) problem tests whether a given 2D query point P lies inside, outside, or on the boundary of an arbitrary (convex or non-convex) polygon. The Ray Casting algorithm applies the Jordan Curve Theorem by casting a horizontal ray from P to infinity.',
    whyItWorks:
      'Any ray starting from an interior point must cross the polygon boundary an odd number of times before escaping to infinity. A ray starting from an exterior point enters and exits in pairs, resulting in an even number of boundary crossings.',
    invariant:
      'Jordan Parity Invariant: Point P is inside the polygon iff the total number of valid ray-edge intersections is odd. Edges with both endpoints strictly above or below the ray are ignored.',
    pitfalls: [
      'Ray passing exactly through a polygon vertex; handled by counting vertex intersections only if the edge endpoint has y >= Py and the other has y < Py.',
      'Failing to handle collinear horizontal edges correctly.',
    ],
  },
  presets: [
    {
      id: 'pip-star-inside',
      label: '5-Point Star (Point Inside)',
      description: 'Test point situated inside the central pentagon of a concave star',
      data: {
        polygon: [
          { x: 5, y: 1 },
          { x: 6.5, y: 4 },
          { x: 9.5, y: 4 },
          { x: 7, y: 6 },
          { x: 8, y: 9 },
          { x: 5, y: 7.5 },
          { x: 2, y: 9 },
          { x: 3, y: 6 },
          { x: 0.5, y: 4 },
          { x: 3.5, y: 4 },
        ],
        testPoint: { x: 5, y: 5 },
      },
    },
    {
      id: 'pip-u-shape-gap',
      label: 'Concave U-Shape (Point in Gap)',
      description: 'Point situated in the outer indentation cavity (Even crossings -> Outside)',
      data: {
        polygon: [
          { x: 1, y: 1 },
          { x: 7, y: 1 },
          { x: 7, y: 8 },
          { x: 5, y: 8 },
          { x: 5, y: 4 },
          { x: 3, y: 4 },
          { x: 3, y: 8 },
          { x: 1, y: 8 },
        ],
        testPoint: { x: 4, y: 6 },
      },
    },
  ],
  defaultInput: {
    polygon: [
      { x: 1, y: 1 },
      { x: 7, y: 1 },
      { x: 7, y: 8 },
      { x: 5, y: 8 },
      { x: 5, y: 4 },
      { x: 3, y: 4 },
      { x: 3, y: 8 },
      { x: 1, y: 8 },
    ],
    testPoint: { x: 4, y: 6 },
  },
  codeSnippets: {
    cpp: `bool isInside(const vector<Point>& poly, Point p) {
    int n = poly.size();
    bool inside = false;
    for (int i = 0, j = n - 1; i < n; j = i++) {
        if ((poly[i].y > p.y) != (poly[j].y > p.y) &&
            p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) {
            inside = !inside;
        }
    }
    return inside;
}`,
    python: `def is_inside(poly, p):
    n = len(poly)
    inside = False
    j = n - 1
    for i in range(n):
        if ((poly[i].y > p.y) != (poly[j].y > p.y)) and \
           (p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x):
            inside = not inside
        j = i
    return inside`,
    typescript: `function isPointInPolygon(poly: Point2D[], p: Point2D): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const intersect =
      poly[i].y > p.y !== poly[j].y > p.y &&
      p.x < ((poly[j].x - poly[i].x) * (p.y - poly[i].y)) / (poly[j].y - poly[i].y) + poly[i].x;
    if (intersect) inside = !inside;
  }
  return inside;
}`,
    java: `public boolean isInside(Point[] poly, Point p) {
    boolean inside = false;
    for (int i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        if ((poly[i].y > p.y) != (poly[j].y > p.y) &&
            (p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) {
            inside = !inside;
        }
    }
    return inside;
}`,
    pseudocode: `function isInside(polygon, point):
    crossings = 0
    for each edge (A, B) in polygon:
        if ray from point crosses edge (A, B):
            crossings++
    return (crossings mod 2 == 1)`,
  },
  generateTimeline: (input: {
    polygon: Point2D[];
    testPoint: Point2D;
  }): ExecutionFrame<PointInPolygonState>[] => {
    const poly = input?.polygon?.length
      ? input.polygon
      : [
          { x: 1, y: 1 },
          { x: 7, y: 1 },
          { x: 7, y: 8 },
          { x: 5, y: 8 },
          { x: 5, y: 4 },
          { x: 3, y: 4 },
          { x: 3, y: 8 },
          { x: 1, y: 8 },
        ];
    const p = input?.testPoint ?? { x: 4, y: 6 };

    const frames: ExecutionFrame<PointInPolygonState>[] = [];
    const n = poly.length;
    let count = 0;
    const hitPoints: Point2D[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        polygon: [...poly],
        testPoint: p,
        activeEdgeIdx: null,
        intersectionCount: 0,
        intersectionPoints: [],
        isInside: null,
        message: `Testing point P(${p.x}, ${p.y}) against ${n}-vertex polygon via Ray Casting`,
      },
      callStack: [{ name: 'pointInPolygonInit', params: { px: p.x, py: p.y, vertices: n } }],
      variables: { pointX: p.x, pointY: p.y, totalEdges: n, crossings: 0 },
      explanation: `Initialized Ray Casting from test point P(${p.x}, ${p.y}) directed rightwards towards +X infinity.`,
    });

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const p1 = poly[i];
      const p2 = poly[j];

      // Check if ray crosses edge (p1, p2)
      const condY = (p1.y > p.y) !== (p2.y > p.y);
      let crosses = false;
      let intersectX = 0;

      if (condY) {
        intersectX = ((p2.x - p1.x) * (p.y - p1.y)) / (p2.y - p1.y) + p1.x;
        if (p.x < intersectX) {
          crosses = true;
          count++;
          hitPoints.push({ x: intersectX, y: p.y });
        }
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 8,
        action: crosses ? 'EDGE_CROSSING_HIT' : 'EDGE_NO_CROSSING',
        state: {
          polygon: [...poly],
          testPoint: p,
          activeEdgeIdx: i,
          intersectionCount: count,
          intersectionPoints: [...hitPoints],
          isInside: count % 2 === 1,
          message: crosses
            ? `Edge ${j}->${i} crossed at x=${intersectX.toFixed(2)} (Total crossings: ${count})`
            : `Edge ${j}->${i} does not intersect horizontal ray`,
        },
        callStack: [{ name: 'checkEdge', params: { edgeIdx: i, crossings: count } }],
        variables: {
          edge: `(${p2.x},${p2.y}) -> (${p1.x},${p1.y})`,
          intersected: crosses,
          totalCrossings: count,
          currentParity: count % 2 === 1 ? 'ODD (Inside)' : 'EVEN (Outside)',
        },
        explanation: crosses
          ? `Ray intersected edge ${j}->${i} at coordinate (${intersectX.toFixed(2)}, ${
              p.y
            }). Cumulative crossings: ${count} (${count % 2 === 1 ? 'Odd -> Inside' : 'Even -> Outside'}).`
          : `Edge ${j}->${i} did not cross the horizontal ray from P.`,
      });
    }

    const finalInside = count % 2 === 1;

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 16,
      action: 'COMPLETE',
      state: {
        polygon: [...poly],
        testPoint: p,
        activeEdgeIdx: null,
        intersectionCount: count,
        intersectionPoints: [...hitPoints],
        isInside: finalInside,
        message: `Verdict: Point P is ${finalInside ? 'INSIDE' : 'OUTSIDE'} (${count} intersections = ${
          finalInside ? 'ODD' : 'EVEN'
        })`,
      },
      callStack: [{ name: 'complete', params: { inside: finalInside ? 1 : 0, crossings: count } }],
      variables: { completed: true, inside: finalInside, crossings: count },
      explanation: `Ray Casting algorithm completed. Total boundary intersections = ${count} (${
        finalInside ? 'Odd' : 'Even'
      }). Point P is mathematically ${finalInside ? 'INSIDE' : 'OUTSIDE'} the polygon.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<PointInPolygonState>) => {
    const { polygon, testPoint, activeEdgeIdx, intersectionCount, intersectionPoints, isInside, message } =
      frame.state;

    // Normalizing coordinates for SVG
    const maxX = Math.max(...polygon.map((p) => p.x), testPoint.x, 10);
    const maxY = Math.max(...polygon.map((p) => p.y), testPoint.y, 10);

    const mapX = (x: number) => 40 + (x / maxX) * 440;
    const mapY = (y: number) => 270 - (y / maxY) * 220;

    const pointsStr = polygon.map((p) => `${mapX(p.x)},${mapY(p.y)}`).join(' ');

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Verdict:</span>
            {isInside === null ? (
              <span className="text-slate-500 text-xs italic">Evaluating</span>
            ) : isInside ? (
              <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded">
                INSIDE (Odd Crossings: {intersectionCount})
              </span>
            ) : (
              <span className="font-mono text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-0.5 rounded">
                OUTSIDE (Even Crossings: {intersectionCount})
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-slate-300">{message}</span>
        </div>

        {/* 2D Polygon Visualization */}
        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[320px] flex items-center justify-center">
          <svg className="w-[560px] h-[300px]" viewBox="0 0 560 300">
            {/* Shaded Polygon */}
            <polygon
              points={pointsStr}
              fill="#06b6d4"
              fillOpacity="0.12"
              stroke="#0891b2"
              strokeWidth="2"
            />

            {/* Horizontal Ray from Test Point */}
            <line
              x1={mapX(testPoint.x)}
              y1={mapY(testPoint.y)}
              x2={540}
              y2={mapY(testPoint.y)}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Highlight Active Edge */}
            {activeEdgeIdx !== null && (
              <line
                x1={mapX(polygon[activeEdgeIdx === 0 ? polygon.length - 1 : activeEdgeIdx - 1].x)}
                y1={mapY(polygon[activeEdgeIdx === 0 ? polygon.length - 1 : activeEdgeIdx - 1].y)}
                x2={mapX(polygon[activeEdgeIdx].x)}
                y2={mapY(polygon[activeEdgeIdx].y)}
                stroke="#ec4899"
                strokeWidth="3.5"
              />
            )}

            {/* Intersection Points */}
            {intersectionPoints.map((hp, idx) => (
              <g key={`hit-${idx}`}>
                <circle cx={mapX(hp.x)} cy={mapY(hp.y)} r="6" fill="#ef4444" stroke="#fecaca" strokeWidth="2" />
              </g>
            ))}

            {/* Polygon Vertices */}
            {polygon.map((p, idx) => (
              <circle
                key={`vert-${idx}`}
                cx={mapX(p.x)}
                cy={mapY(p.y)}
                r="3.5"
                fill="#38bdf8"
                stroke="#0369a1"
                strokeWidth="1"
              />
            ))}

            {/* Test Point */}
            <circle
              cx={mapX(testPoint.x)}
              cy={mapY(testPoint.y)}
              r="7"
              fill={isInside ? '#10b981' : '#f43f5e'}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={mapX(testPoint.x) - 10}
              y={mapY(testPoint.y) - 12}
              fill="#fbbf24"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
            >
              P({testPoint.x},{testPoint.y})
            </text>
          </svg>
        </div>
      </div>
    );
  },
};
