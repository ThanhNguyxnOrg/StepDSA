import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface Point2D {
  x: number;
  y: number;
}

export interface Segment {
  p: Point2D;
  q: Point2D;
}

export interface LineIntersectionState {
  seg1: Segment;
  seg2: Segment;
  orientations: {
    o1: number; // p1, q1, p2
    o2: number; // p1, q1, q2
    o3: number; // p2, q2, p1
    o4: number; // p2, q2, q1
  };
  intersects: boolean | null;
  intersectionType: 'GENERAL' | 'COLLINEAR' | 'NONE' | null;
  currentCheck: string;
}

function orientation(p: Point2D, q: Point2D, r: Point2D): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-9) return 0; // collinear
  return val > 0 ? 1 : 2; // 1: clockwise, 2: counterclockwise
}

function onSegment(p: Point2D, q: Point2D, r: Point2D): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

export const lineIntersectionModule: AlgorithmModule<
  { seg1: Segment; seg2: Segment },
  LineIntersectionState
> = {
  id: 'line-intersection',
  title: 'Line Segment Intersection (Orientation & Cross-Product Verification O(1))',
  category: 'math',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1)',
    timeWorst: 'O(1)',
    spaceAuxiliary: 'O(1) scalar arithmetic register space',
    worstCaseCondition: 'Strictly constant time evaluation using 4 orientation determinants',
  },
  theory: {
    overview:
      'Determining whether two 2D line segments intersect in O(1) time without dividing by zero slopes. It relies on the 2D cross-product orientation test to verify if endpoints of each segment straddle the line containing the opposite segment.',
    whyItWorks:
      'The sign of the 2D cross-product of vectors (q - p) and (r - q) determines whether point r lies to the left (counterclockwise), right (clockwise), or collinear with directed segment pq. Two segments intersect if and only if endpoints straddle each other or collinear points overlap.',
    invariant:
      'Straddle Invariant: Two non-collinear segments p1q1 and p2q2 intersect iff o1 != o2 and o3 != o4, where o1, o2 are orientations of p2, q2 relative to p1q1, and o3, o4 are orientations of p1, q1 relative to p2q2.',
    pitfalls: [
      'Using naive slope-intercept y = mx + c formulas causing division-by-zero crashes on vertical segments.',
      'Missing the 4 collinear projection edge cases where bounding boxes overlap.',
    ],
  },
  presets: [
    {
      id: 'segments-cross-x',
      label: 'Crossing "X" Segments',
      description: 'Classic general intersection with opposing straddle signs',
      data: {
        seg1: { p: { x: 2, y: 2 }, q: { x: 8, y: 8 } },
        seg2: { p: { x: 2, y: 8 }, q: { x: 8, y: 2 } },
      },
    },
    {
      id: 'segments-parallel',
      label: 'Parallel Disjoint Segments',
      description: 'Zero overlap and identical orientations with no intersection',
      data: {
        seg1: { p: { x: 1, y: 3 }, q: { x: 8, y: 3 } },
        seg2: { p: { x: 1, y: 7 }, q: { x: 8, y: 7 } },
      },
    },
    {
      id: 'segments-t-junction',
      label: 'T-Junction Intersection',
      description: 'Endpoint of seg2 lies exactly on seg1',
      data: {
        seg1: { p: { x: 2, y: 5 }, q: { x: 8, y: 5 } },
        seg2: { p: { x: 5, y: 2 }, q: { x: 5, y: 5 } },
      },
    },
  ],
  defaultInput: {
    seg1: { p: { x: 2, y: 2 }, q: { x: 8, y: 8 } },
    seg2: { p: { x: 2, y: 8 }, q: { x: 8, y: 2 } },
  },
  codeSnippets: {
    cpp: `int orientation(Point p, Point q, Point r) {
    long long val = 1LL * (q.y - p.y) * (r.x - q.x) - 1LL * (q.x - p.x) * (r.y - q.y);
    if (val == 0) return 0;  // collinear
    return (val > 0) ? 1 : 2; // 1: CW, 2: CCW
}

bool doIntersect(Point p1, Point q1, Point p2, Point q2) {
    int o1 = orientation(p1, q1, p2);
    int o2 = orientation(p1, q1, q2);
    int o3 = orientation(p2, q2, p1);
    int o4 = orientation(p2, q2, q1);

    if (o1 != o2 && o3 != o4) return true;

    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
    return false;
}`,
    python: `def orientation(p, q, r):
    val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1])
    if val == 0: return 0
    return 1 if val > 0 else 2

def do_intersect(p1, q1, p2, q2):
    o1 = orientation(p1, q1, p2)
    o2 = orientation(p1, q1, q2)
    o3 = orientation(p2, q2, p1)
    o4 = orientation(p2, q2, q1)

    if o1 != o2 and o3 != o4: return True
    if o1 == 0 and on_segment(p1, p2, q1): return True
    if o2 == 0 and on_segment(p1, q2, q1): return True
    if o3 == 0 and on_segment(p2, p1, q2): return True
    if o4 == 0 and on_segment(p2, q1, q2): return True
    return False`,
    typescript: `function doIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}`,
    java: `public boolean doIntersect(Point p1, Point q1, Point p2, Point q2) {
    int o1 = orientation(p1, q1, p2);
    int o2 = orientation(p1, q1, q2);
    int o3 = orientation(p2, q2, p1);
    int o4 = orientation(p2, q2, q1);

    if (o1 != o2 && o3 != o4) return true;
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;
    return false;
}`,
    pseudocode: `function doIntersect(seg1, seg2):
    o1 = orientation(p1, q1, p2)
    o2 = orientation(p1, q1, q2)
    o3 = orientation(p2, q2, p1)
    o4 = orientation(p2, q2, q1)
    if (o1 != o2) and (o3 != o4): return true
    if collinear and onSegment: return true
    return false`,
  },
  generateTimeline: (input: {
    seg1: Segment;
    seg2: Segment;
  }): ExecutionFrame<LineIntersectionState>[] => {
    const seg1 = input?.seg1 ?? { p: { x: 2, y: 2 }, q: { x: 8, y: 8 } };
    const seg2 = input?.seg2 ?? { p: { x: 2, y: 8 }, q: { x: 8, y: 2 } };

    const frames: ExecutionFrame<LineIntersectionState>[] = [];

    const o1 = orientation(seg1.p, seg1.q, seg2.p);
    const o2 = orientation(seg1.p, seg1.q, seg2.q);
    const o3 = orientation(seg2.p, seg2.q, seg1.p);
    const o4 = orientation(seg2.p, seg2.q, seg1.q);

    const orientations = { o1, o2, o3, o4 };

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      isMilestone: true,
      milestoneTitle: 'Line Segments Initialized',
      soundCue: { type: 'start' },
      state: {
        seg1,
        seg2,
        orientations: { o1: 0, o2: 0, o3: 0, o4: 0 },
        intersects: null,
        intersectionType: null,
        currentCheck: 'Initialized line segments',
      },
      callStack: [{ name: 'checkIntersection', params: { x1: seg1.p.x, y1: seg1.p.y } }],
      variables: {
        seg1: `(${seg1.p.x},${seg1.p.y}) -> (${seg1.q.x},${seg1.q.y})`,
        seg2: `(${seg2.p.x},${seg2.p.y}) -> (${seg2.q.x},${seg2.q.y})`,
      },
      conditionEval: { expr: `validSegments`, result: true },
      explanation: `Loaded segments p1q1: (${seg1.p.x},${seg1.p.y})->(${seg1.q.x},${seg1.q.y}) and p2q2: (${seg2.p.x},${seg2.p.y})->(${seg2.q.x},${seg2.q.y}).`,
    });

    const describeOri = (v: number) => (v === 0 ? 'Collinear' : v === 1 ? 'Clockwise (Right)' : 'Counter-Clockwise (Left)');

    // Step 1: Orientation o1 Cross Product
    const cross1 = (seg1.q.y - seg1.p.y) * (seg2.p.x - seg1.q.x) - (seg1.q.x - seg1.p.x) * (seg2.p.y - seg1.q.y);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      action: 'CALC_CROSS_1',
      soundCue: { type: 'compare' },
      state: {
        seg1,
        seg2,
        orientations: { o1: 0, o2: 0, o3: 0, o4: 0 },
        intersects: null,
        intersectionType: null,
        currentCheck: `Computing 2D cross product for (p1, q1, p2)`,
      },
      callStack: [{ name: 'crossProduct', params: { p: 'p1', q: 'q1', r: 'p2' } }],
      variables: {
        crossProductVal: cross1,
        formula: `(q.y - p.y)*(r.x - q.x) - (q.x - p.x)*(r.y - q.y)`,
        sign: cross1 === 0 ? 'Zero' : cross1 > 0 ? 'Positive (CW)' : 'Negative (CCW)',
      },
      conditionEval: { expr: `crossProduct === ${cross1}`, result: true },
      explanation: `Cross product of vectors p1->q1 and q1->p2 equals ${cross1}. Sign dictates turning orientation.`,
    });

    // Step 1b: Orientation o1 (p1, q1, p2)
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      action: 'EVAL_O1',
      isMilestone: true,
      milestoneTitle: `Orientation o1: ${describeOri(o1)}`,
      soundCue: { type: 'pivot' },
      state: {
        seg1,
        seg2,
        orientations: { o1, o2: 0, o3: 0, o4: 0 },
        intersects: null,
        intersectionType: null,
        currentCheck: `Testing orientation o1 (p1, q1, p2) -> ${describeOri(o1)}`,
      },
      callStack: [{ name: 'orientation', params: { p: 'p1', q: 'q1', r: 'p2' } }],
      variables: {
        testedPoint: `p2(${seg2.p.x},${seg2.p.y})`,
        againstSegment: `p1q1`,
        orientationVal: o1,
        result: describeOri(o1),
      },
      conditionEval: { expr: `o1 === ${o1}`, result: true },
      explanation: `Testing orientation of triplet (p1, q1, p2). Vector cross product yields orientation: ${describeOri(o1)}.`,
    });

    // Step 2: Orientation o2 Cross Product
    const cross2 = (seg1.q.y - seg1.p.y) * (seg2.q.x - seg1.q.x) - (seg1.q.x - seg1.p.x) * (seg2.q.y - seg1.q.y);
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 4,
      action: 'CALC_CROSS_2',
      soundCue: { type: 'compare' },
      state: {
        seg1,
        seg2,
        orientations: { o1, o2: 0, o3: 0, o4: 0 },
        intersects: null,
        intersectionType: null,
        currentCheck: `Computing 2D cross product for (p1, q1, q2)`,
      },
      callStack: [{ name: 'crossProduct', params: { p: 'p1', q: 'q1', r: 'q2' } }],
      variables: {
        crossProductVal: cross2,
        formula: `(q.y - p.y)*(r.x - q.x) - (q.x - p.x)*(r.y - q.y)`,
        sign: cross2 === 0 ? 'Zero' : cross2 > 0 ? 'Positive (CW)' : 'Negative (CCW)',
      },
      conditionEval: { expr: `crossProduct === ${cross2}`, result: true },
      explanation: `Cross product of vectors p1->q1 and q1->q2 equals ${cross2}. Sign dictates turning orientation.`,
    });

    // Step 2b: Orientation o2 (p1, q1, q2)
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      action: 'EVAL_O2',
      isMilestone: true,
      milestoneTitle: `Orientation o2: ${describeOri(o2)}`,
      soundCue: { type: 'pivot' },
      state: {
        seg1,
        seg2,
        orientations: { o1, o2, o3: 0, o4: 0 },
        intersects: null,
        intersectionType: null,
        currentCheck: `Testing orientation o2 (p1, q1, q2) -> ${describeOri(o2)}`,
      },
      callStack: [{ name: 'orientation', params: { p: 'p1', q: 'q1', r: 'q2' } }],
      variables: {
        testedPoint: `q2(${seg2.q.x},${seg2.q.y})`,
        againstSegment: `p1q1`,
        orientationVal: o2,
        result: describeOri(o2),
      },
      conditionEval: { expr: `o2 === ${o2}`, result: true },
      explanation: `Testing orientation of triplet (p1, q1, q2). Vector cross product yields orientation: ${describeOri(o2)}.`,
    });

    // Step 3: Check if segment 2 straddles line 1
    const straddles1 = o1 !== o2;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      action: 'CHECK_STRADDLE_1',
      state: {
        seg1,
        seg2,
        orientations: { o1, o2, o3: 0, o4: 0 },
        intersects: null,
        intersectionType: null,
        currentCheck: `Straddle Test 1: o1 !== o2 (${o1} !== ${o2}) -> ${straddles1}`,
      },
      callStack: [{ name: 'checkStraddle', params: { o1, o2 } }],
      conditionEval: {
        expr: `o1 !== o2 (${o1} !== ${o2})`,
        result: straddles1,
      },
      variables: { o1, o2, straddlesLine1: straddles1 },
      explanation: straddles1
        ? `Points p2 and q2 lie on opposite sides of line p1-q1 (o1 !== o2). Segment 2 straddles the line through segment 1!`
        : `Points p2 and q2 lie on the SAME side of line p1-q1 (o1 === o2). Segment 2 does not cross line 1.`,
    });

    // Step 4: Orientation o3 (p2, q2, p1)
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 11,
      action: 'EVAL_O3',
      isMilestone: true,
      milestoneTitle: `Orientation o3: ${describeOri(o3)}`,
      state: {
        seg1,
        seg2,
        orientations: { o1, o2, o3, o4: 0 },
        intersects: null,
        intersectionType: null,
        currentCheck: `Testing orientation o3 (p2, q2, p1) -> ${describeOri(o3)}`,
      },
      callStack: [{ name: 'orientation', params: { p: 'p2', q: 'q2', r: 'p1' } }],
      variables: {
        testedPoint: `p1(${seg1.p.x},${seg1.p.y})`,
        againstSegment: `p2q2`,
        orientationVal: o3,
        result: describeOri(o3),
      },
      explanation: `Testing orientation of triplet (p2, q2, p1). Vector cross product yields orientation: ${describeOri(o3)}.`,
    });

    // Step 5: Orientation o4 (p2, q2, q1)
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      action: 'EVAL_O4',
      isMilestone: true,
      milestoneTitle: `Orientation o4: ${describeOri(o4)}`,
      state: {
        seg1,
        seg2,
        orientations: { o1, o2, o3, o4 },
        intersects: null,
        intersectionType: null,
        currentCheck: `Testing orientation o4 (p2, q2, q1) -> ${describeOri(o4)}`,
      },
      callStack: [{ name: 'orientation', params: { p: 'p2', q: 'q2', r: 'q1' } }],
      variables: {
        testedPoint: `q1(${seg1.q.x},${seg1.q.y})`,
        againstSegment: `p2q2`,
        orientationVal: o4,
        result: describeOri(o4),
      },
      explanation: `Testing orientation of triplet (p2, q2, q1). Vector cross product yields orientation: ${describeOri(o4)}.`,
    });

    // Step 6: Check if segment 1 straddles line 2
    const straddles2 = o3 !== o4;
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 13,
      action: 'CHECK_STRADDLE_2',
      state: {
        seg1,
        seg2,
        orientations,
        intersects: null,
        intersectionType: null,
        currentCheck: `Straddle Test 2: o3 !== o4 (${o3} !== ${o4}) -> ${straddles2}`,
      },
      callStack: [{ name: 'checkStraddle', params: { o3, o4 } }],
      conditionEval: {
        expr: `o3 !== o4 (${o3} !== ${o4})`,
        result: straddles2,
      },
      variables: { o3, o4, straddlesLine2: straddles2 },
      explanation: straddles2
        ? `Points p1 and q1 lie on opposite sides of line p2-q2 (o3 !== o4). Segment 1 straddles the line through segment 2!`
        : `Points p1 and q1 lie on the SAME side of line p2-q2 (o3 === o4). Segment 1 does not cross line 2.`,
    });

    let intersects = false;
    let type: 'GENERAL' | 'COLLINEAR' | 'NONE' = 'NONE';

    // Step 7: Evaluate General Case intersection
    if (straddles1 && straddles2) {
      intersects = true;
      type = 'GENERAL';
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 15,
        action: 'VERIFY_GENERAL_INTERSECTION',
        isMilestone: true,
        milestoneTitle: 'General Intersection Confirmed',
        state: {
          seg1,
          seg2,
          orientations,
          intersects: true,
          intersectionType: 'GENERAL',
          currentCheck: 'General Case: (o1 != o2) && (o3 != o4) is TRUE',
        },
        callStack: [{ name: 'evaluateIntersection', params: { type: 'GENERAL' } }],
        conditionEval: {
          expr: `(o1 !== o2) && (o3 !== o4)`,
          result: true,
        },
        variables: { straddles1, straddles2, intersects: true, type: 'GENERAL' },
        explanation: `Both straddle tests passed: (o1 !== o2) AND (o3 !== o4) are both satisfied. Segments cross in General Case!`,
      });
    } else {
      // Step 8: Check Collinear special cases
      const c1 = o1 === 0 && onSegment(seg1.p, seg2.p, seg1.q);
      const c2 = o2 === 0 && onSegment(seg1.p, seg2.q, seg1.q);
      const c3 = o3 === 0 && onSegment(seg2.p, seg1.p, seg2.q);
      const c4 = o4 === 0 && onSegment(seg2.p, seg1.q, seg2.q);

      if (c1 || c2 || c3 || c4) {
        intersects = true;
        type = 'COLLINEAR';
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          action: 'VERIFY_COLLINEAR_INTERSECTION',
          isMilestone: true,
          milestoneTitle: 'Collinear Overlap Confirmed',
          state: {
            seg1,
            seg2,
            orientations,
            intersects: true,
            intersectionType: 'COLLINEAR',
            currentCheck: 'Collinear Overlap Detected',
          },
          callStack: [{ name: 'evaluateCollinear', params: { c1, c2, c3, c4 } }],
          variables: { c1, c2, c3, c4, type: 'COLLINEAR' },
          explanation: `Segments are collinear and have overlapping projection: collinear intersection holds!`,
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 18,
      action: 'COMPLETE',
      state: {
        seg1,
        seg2,
        orientations,
        intersects,
        intersectionType: type,
        currentCheck: intersects ? `Segments intersect (${type})` : 'Segments do not intersect',
      },
      callStack: [{ name: 'complete', params: { intersects: intersects ? 1 : 0 } }],
      variables: { intersects, intersectionType: type, verified: true },
      explanation: intersects
        ? `Verdict: Segments INTERSECT via ${type} condition.`
        : 'Verdict: Segments DO NOT intersect.',
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<LineIntersectionState>) => {
    const { seg1, seg2, orientations, intersects, intersectionType } = frame.state;

    // SVG coordinates mapping: range 0 to 10 mapped to 60..440 and 260..40
    const mapX = (x: number) => 60 + x * 38;
    const mapY = (y: number) => 260 - y * 22;

    const describeOri = (v: number) => (v === 0 ? 'Collinear (0)' : v === 1 ? 'CW (1)' : 'CCW (2)');

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Intersection:</span>
            {intersects === null ? (
              <span className="text-slate-500 text-xs italic">Evaluating</span>
            ) : intersects ? (
              <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded">
                INTERSECTS ({intersectionType})
              </span>
            ) : (
              <span className="font-mono text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 px-3 py-1 rounded">
                DISJOINT
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>o1: <strong className="text-cyan-400">{describeOri(orientations.o1)}</strong></span>
            <span>o2: <strong className="text-cyan-400">{describeOri(orientations.o2)}</strong></span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[340px] flex items-center justify-center">
          <svg className="w-[520px] h-[300px]" viewBox="0 0 520 300">
            {/* Grid Lines */}
            {Array.from({ length: 11 }).map((_, i) => (
              <g key={`grid-${i}`}>
                <line
                  x1={mapX(i)}
                  y1={40}
                  x2={mapX(i)}
                  y2={260}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <line
                  x1={60}
                  y1={mapY(i)}
                  x2={440}
                  y2={mapY(i)}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Segment 1 */}
            <line
              x1={mapX(seg1.p.x)}
              y1={mapY(seg1.p.y)}
              x2={mapX(seg1.q.x)}
              y2={mapY(seg1.q.y)}
              stroke="#06b6d4"
              strokeWidth="3.5"
            />
            <circle cx={mapX(seg1.p.x)} cy={mapY(seg1.p.y)} r="6" fill="#0891b2" stroke="#e0f2fe" strokeWidth="2" />
            <text x={mapX(seg1.p.x) - 10} y={mapY(seg1.p.y) - 10} fill="#38bdf8" fontSize="12" fontWeight="bold">
              P1({seg1.p.x},{seg1.p.y})
            </text>
            <circle cx={mapX(seg1.q.x)} cy={mapY(seg1.q.y)} r="6" fill="#0891b2" stroke="#e0f2fe" strokeWidth="2" />
            <text x={mapX(seg1.q.x) + 10} y={mapY(seg1.q.y) - 10} fill="#38bdf8" fontSize="12" fontWeight="bold">
              Q1({seg1.q.x},{seg1.q.y})
            </text>

            {/* Segment 2 */}
            <line
              x1={mapX(seg2.p.x)}
              y1={mapY(seg2.p.y)}
              x2={mapX(seg2.q.x)}
              y2={mapY(seg2.q.y)}
              stroke="#f59e0b"
              strokeWidth="3.5"
            />
            <circle cx={mapX(seg2.p.x)} cy={mapY(seg2.p.y)} r="6" fill="#d97706" stroke="#fef3c7" strokeWidth="2" />
            <text x={mapX(seg2.p.x) - 10} y={mapY(seg2.p.y) + 18} fill="#fbbf24" fontSize="12" fontWeight="bold">
              P2({seg2.p.x},{seg2.p.y})
            </text>
            <circle cx={mapX(seg2.q.x)} cy={mapY(seg2.q.y)} r="6" fill="#d97706" stroke="#fef3c7" strokeWidth="2" />
            <text x={mapX(seg2.q.x) + 10} y={mapY(seg2.q.y) + 18} fill="#fbbf24" fontSize="12" fontWeight="bold">
              Q2({seg2.q.x},{seg2.q.y})
            </text>
          </svg>
        </div>
      </div>
    );
  },
};
