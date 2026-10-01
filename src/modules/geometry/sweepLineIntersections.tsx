import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface SweepSegment {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SweepPoint {
  x: number;
  y: number;
  seg1Id: number;
  seg2Id: number;
}

export interface SweepLineState {
  segments: SweepSegment[];
  sweepX: number;
  activeSegmentIds: number[];
  intersections: SweepPoint[];
  currentEvent: { type: 'start' | 'end' | 'intersect'; x: number; y: number; segId?: number } | null;
  message: string;
}

export const sweepLineIntersectionsModule: AlgorithmModule<
  { segments: { x1: number; y1: number; x2: number; y2: number }[] },
  SweepLineState
> = {
  id: 'sweep-line-intersections',
  title: 'Sweep-Line Algorithm (Bentley-Ottmann Geometric Intersections)',
  category: 'math',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(N log N) with zero intersections (K = 0)',
    timeAverage: 'O((N + K) log N) for K intersection points',
    timeWorst: 'O((N + K) log N) vs naive O(N^2) all-pairs test',
    spaceAuxiliary: 'O(N + K) event queue and status structure BST',
    worstCaseCondition: 'Dense intersections (K ~ N^2) where all pairs cross',
  },
  theory: {
    overview:
      'The Bentley-Ottmann Sweep-Line algorithm finds all K intersections among N line segments in optimal O((N + K) log N) time by sweeping a vertical line from left to right.',
    whyItWorks:
      'Instead of testing all O(N^2) pairs, two segments can only intersect if they are adjacent in vertical order when the sweep line passes their intersection. Maintaining active segments in a balanced BST ordered by current Y coordinate restricts intersection tests strictly to newly adjacent neighbors.',
    invariant:
      'Sweep-Line Invariant: All segment intersections strictly to the left of the sweep line (x < sweepX) have already been detected and reported. Segments in the status structure are ordered by y(sweepX).',
    pitfalls: [
      'Numerical precision issues when segments are nearly parallel or have identical x-coordinates (vertical segments).',
      'Forgetting that when two segments cross, their relative order in the status structure swaps, necessitating neighbor checks with their new neighbors.',
    ],
  },
  defaultInput: {
    segments: [
      { x1: 10, y1: 20, x2: 70, y2: 80 },
      { x1: 20, y1: 80, x2: 80, y2: 30 },
      { x1: 40, y1: 10, x2: 90, y2: 60 },
      { x1: 15, y1: 50, x2: 60, y2: 15 },
    ],
  },
  presets: [
    {
      id: 'cross-pattern',
      label: 'Cross Pattern (4 Segments, 3 Intersections)',
      description: 'Multiple intersecting line segments in 2D space',
      data: {
        segments: [
          { x1: 10, y1: 30, x2: 80, y2: 70 },
          { x1: 15, y1: 75, x2: 85, y2: 25 },
          { x1: 30, y1: 15, x2: 70, y2: 85 },
          { x1: 50, y1: 90, x2: 90, y2: 10 },
        ],
      },
    },
    {
      id: 'disjoint-parallel',
      label: 'Disjoint Parallel Segments (0 Intersections)',
      description: 'Horizontal parallel lines verifying zero false intersections',
      data: {
        segments: [
          { x1: 10, y1: 20, x2: 80, y2: 20 },
          { x1: 15, y1: 45, x2: 85, y2: 45 },
          { x1: 20, y1: 70, x2: 90, y2: 70 },
        ],
      },
    },
  ],
  codeSnippets: {
    cpp: `// Bentley-Ottmann Event Queue:
enum EventType { START, END, INTERSECT };
struct Event {
    double x, y;
    EventType type;
    int seg1, seg2;
};

// Sweep-Line Status: std::set<Segment, YComparatorAtX>
void sweepLine(vector<Segment>& segs) {
    priority_queue<Event> Q;
    set<Segment> T; // Active segments ordered by y(x)
    while (!Q.empty()) {
        Event e = Q.top(); Q.pop();
        if (e.type == START) {
            auto it = T.insert(segs[e.seg1]);
            checkIntersect(prev(it), it);
            checkIntersect(it, next(it));
        } else if (e.type == END) {
            auto it = T.find(segs[e.seg1]);
            checkIntersect(prev(it), next(it));
            T.erase(it);
        } else {
            reportIntersection(e.x, e.y);
            swapPositions(e.seg1, e.seg2);
        }
    }
}`,
    python: `# Bentley-Ottmann Sweep-Line
# Event queue Q ordered by X
# Status structure T (BST ordered by Y)
def bentley_ottmann(segments):
    events = build_events(segments)
    status = []
    intersections = []
    while events:
        e = heapq.heappop(events)
        # process start, end, or intersection event`,
    typescript: `interface Event {
  x: number;
  type: 'start' | 'end' | 'intersect';
  seg1: number;
  seg2?: number;
}

function sweepLine(segs: Segment[]): Point[] {
  // O((N + K) log N) sweep line processing
  return intersections;
}`,
    java: `// Status structure ordered by y at current sweep x
TreeSet<Segment> status = new TreeSet<>((s1, s2) -> Double.compare(s1.getY(sweepX), s2.getY(sweepX)));`,
    pseudocode: `for each event e in EventQueue:
    sweepX = e.x
    if e is START:
        insert seg into Status
        testIntersection(seg, above(seg))
        testIntersection(seg, below(seg))
    if e is END:
        testIntersection(above(seg), below(seg))
        remove seg from Status
    if e is INTERSECT:
        record intersection
        swap(seg1, seg2) in Status`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<SweepLineState>[] = [];
    const raw = input.segments;
    const segs: SweepSegment[] = raw.map((s, idx) => {
      if (s.x1 <= s.x2) return { id: idx, ...s };
      return { id: idx, x1: s.x2, y1: s.y2, x2: s.x1, y2: s.y1 };
    });

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: SweepLineState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    function getIntersection(s1: SweepSegment, s2: SweepSegment): { x: number; y: number } | null {
      const d = (s1.x1 - s1.x2) * (s2.y1 - s2.y2) - (s1.y1 - s1.y2) * (s2.x1 - s2.x2);
      if (Math.abs(d) < 1e-6) return null;

      const t =
        ((s1.x1 - s2.x1) * (s2.y1 - s2.y2) - (s1.y1 - s2.y1) * (s2.x1 - s2.x2)) / d;
      const u =
        -((s1.x1 - s1.x2) * (s1.y1 - s2.y1) - (s1.y1 - s1.y2) * (s1.x1 - s2.x1)) / d;

      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: s1.x1 + t * (s1.x2 - s1.x1),
          y: s1.y1 + t * (s1.y2 - s1.y1),
        };
      }
      return null;
    }

    interface SweepEvent {
      x: number;
      type: 'start' | 'end';
      segId: number;
      y: number;
    }
    const events: SweepEvent[] = [];
    segs.forEach((s) => {
      events.push({ x: s.x1, type: 'start', segId: s.id, y: s.y1 });
      events.push({ x: s.x2, type: 'end', segId: s.id, y: s.y2 });
    });
    events.sort((a, b) => a.x - b.x);

    addFrame(
      1,
      `Loaded ${segs.length} line segments. Initialized Bentley-Ottmann Event Queue with ${events.length} endpoint events.`,
      {
        segments: segs,
        sweepX: 0,
        activeSegmentIds: [],
        intersections: [],
        currentEvent: null,
        message: 'Sweep-Line at x = 0. Status structure is empty.',
      },
      {
        action: 'INIT',
        variables: { totalSegments: segs.length, totalEvents: events.length },
        callStack: [{ name: 'initSweepLine', params: { segments: segs.length } }],
      }
    );

    let activeSegs: number[] = [];
    const intersections: SweepPoint[] = [];

    for (let eIdx = 0; eIdx < events.length; eIdx++) {
      const ev = events[eIdx];
      const seg = segs.find((s) => s.id === ev.segId)!;

      if (ev.type === 'start') {
        activeSegs.push(seg.id);
        addFrame(
          4,
          `Event START at x = ${ev.x.toFixed(1)}: Segment S${seg.id} entered sweep line status structure.`,
          {
            segments: segs,
            sweepX: ev.x,
            activeSegmentIds: [...activeSegs],
            intersections: [...intersections],
            currentEvent: { type: 'start', x: ev.x, y: ev.y, segId: seg.id },
            message: `Segment S${seg.id} inserted into active status tree at x=${ev.x.toFixed(1)}.`,
          },
          {
            action: 'EVENT_START',
            variables: { sweepX: ev.x, segId: seg.id, activeCount: activeSegs.length },
            callStack: [{ name: 'handleStart', params: { segId: seg.id, x: ev.x } }],
          }
        );

        for (let j = 0; j < activeSegs.length; j++) {
          const otherId = activeSegs[j];
          if (otherId !== seg.id) {
            const otherSeg = segs.find((s) => s.id === otherId)!;
            const pt = getIntersection(seg, otherSeg);
            if (pt && !intersections.some((ip) => Math.hypot(ip.x - pt.x, ip.y - pt.y) < 1e-4)) {
              intersections.push({ x: pt.x, y: pt.y, seg1Id: seg.id, seg2Id: otherId });
              addFrame(
                7,
                `INTERSECTION DETECTED: S${seg.id} and S${otherId} cross at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})!`,
                {
                  segments: segs,
                  sweepX: ev.x,
                  activeSegmentIds: [...activeSegs],
                  intersections: [...intersections],
                  currentEvent: { type: 'intersect', x: pt.x, y: pt.y, segId: seg.id },
                  message: `New intersection found between S${seg.id} and S${otherId} at (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}).`,
                },
                {
                  action: 'INTERSECTION_FOUND',
                  variables: {
                    seg1: seg.id,
                    seg2: otherId,
                    interX: pt.x.toFixed(1),
                    interY: pt.y.toFixed(1),
                    totalIntersections: intersections.length,
                  },
                  callStack: [{ name: 'reportIntersection', params: { x: pt.x.toFixed(1), y: pt.y.toFixed(1) } }],
                }
              );
            }
          }
        }
      } else if (ev.type === 'end') {
        activeSegs = activeSegs.filter((id) => id !== seg.id);
        addFrame(
          11,
          `Event END at x = ${ev.x.toFixed(1)}: Segment S${seg.id} finished; removed from active status structure.`,
          {
            segments: segs,
            sweepX: ev.x,
            activeSegmentIds: [...activeSegs],
            intersections: [...intersections],
            currentEvent: { type: 'end', x: ev.x, y: ev.y, segId: seg.id },
            message: `Segment S${seg.id} removed from sweep status structure at x=${ev.x.toFixed(1)}.`,
          },
          {
            action: 'EVENT_END',
            variables: { sweepX: ev.x, segId: seg.id, activeCount: activeSegs.length },
            callStack: [{ name: 'handleEnd', params: { segId: seg.id, x: ev.x } }],
          }
        );
      }
    }

    addFrame(
      16,
      `Sweep-Line sweep complete. Found all ${intersections.length} intersection points in O((N + K) log N) time.`,
      {
        segments: segs,
        sweepX: 100,
        activeSegmentIds: [],
        intersections: [...intersections],
        currentEvent: null,
        message: `Sweep complete: ${intersections.length} total geometric intersections discovered.`,
      },
      {
        action: 'COMPLETE',
        variables: { totalIntersections: intersections.length },
        callStack: [{ name: 'complete', params: { count: intersections.length } }],
      }
    );

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<SweepLineState>) => {
    const { segments, sweepX, activeSegmentIds, intersections, currentEvent, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* 2D Plane Vector Stage */}
        <div className="relative w-full max-w-2xl aspect-square bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Coordinate Grid */}
            <defs>
              <pattern id="sweep-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#sweep-grid)" />

            {/* Sweep Line */}
            <line
              x1={sweepX}
              y1={0}
              x2={sweepX}
              y2={100}
              stroke="#fbbf24"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.9"
            />
            <text
              x={Math.min(92, sweepX + 2)}
              y={6}
              fontSize="3.5"
              fill="#fef08a"
              fontFamily="monospace"
              fontWeight="bold"
            >
              x={sweepX.toFixed(1)}
            </text>

            {/* Segments */}
            {segments.map((s) => {
              const isActive = activeSegmentIds.includes(s.id);
              const strokeColor = isActive ? '#38bdf8' : '#64748b';
              const strokeWidth = isActive ? 1.5 : 1;

              return (
                <g key={`seg-${s.id}`}>
                  <line
                    x1={s.x1}
                    y1={s.y1}
                    x2={s.x2}
                    y2={s.y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  <circle cx={s.x1} cy={s.y1} r="1.5" fill={strokeColor} />
                  <circle cx={s.x2} cy={s.y2} r="1.5" fill={strokeColor} />
                  <text
                    x={s.x1 - 3}
                    y={s.y1 - 2}
                    fontSize="3"
                    fill="#94a3b8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    S{s.id}
                  </text>
                </g>
              );
            })}

            {/* Intersection Points */}
            {intersections.map((ip, idx) => (
              <g key={`inter-${idx}`}>
                <circle
                  cx={ip.x}
                  cy={ip.y}
                  r="3.5"
                  fill="#ef4444"
                  fillOpacity="0.4"
                  stroke="#ef4444"
                  strokeWidth="0.8"
                />
                <circle cx={ip.x} cy={ip.y} r="1.8" fill="#ffffff" />
                <text
                  x={ip.x + 3}
                  y={ip.y - 2}
                  fontSize="3"
                  fill="#fca5a5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ({ip.x.toFixed(0)}, {ip.y.toFixed(0)})
                </text>
              </g>
            ))}

            {/* Current Event Halo */}
            {currentEvent && (
              <circle
                cx={currentEvent.x}
                cy={currentEvent.y}
                r="4"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="1.5,1.5"
                className="animate-spin"
              />
            )}
          </svg>
        </div>

        {/* Status Telemetry & Active Status Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full font-mono text-xs">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">
              Sweep Status Structure (Active Segments)
            </span>
            <div className="flex flex-wrap gap-2">
              {activeSegmentIds.length > 0 ? (
                activeSegmentIds.map((id) => (
                  <span
                    key={`active-seg-${id}`}
                    className="px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-500 text-sky-200 font-bold"
                  >
                    S{id}
                  </span>
                ))
              ) : (
                <span className="text-slate-600 italic">No segments intersecting sweep line</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">
              Discovered Intersections (K={intersections.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {intersections.length > 0 ? (
                intersections.map((ip, idx) => (
                  <span
                    key={`found-inter-${idx}`}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 font-bold"
                  >
                    S{ip.seg1Id} ∩ S{ip.seg2Id} @ ({ip.x.toFixed(0)}, {ip.y.toFixed(0)})
                  </span>
                ))
              ) : (
                <span className="text-slate-600 italic">None discovered yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
