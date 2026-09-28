import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface IntervalItem {
  id: string;
  start: number;
  end: number;
  status: 'pending' | 'comparing' | 'merged' | 'pushed';
}

export interface MergeIntervalsState {
  original: IntervalItem[];
  currentIndex: number;
  merged: IntervalItem[];
  activeInterval: IntervalItem | null;
  overlapDetected: boolean;
}

export const mergeIntervalsModule: AlgorithmModule<
  { intervals: [number, number][] },
  MergeIntervalsState
> = {
  id: 'merge-intervals',
  title: 'Merge Intervals (Sort & Greedy Sweep O(N log N))',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Dominated by the initial sorting of intervals by start time',
  },
  theory: {
    overview:
      'Given an array of intervals [start, end], merge all overlapping intervals into contiguous non-overlapping spans.',
    whyItWorks:
      'Sorting intervals by their starting boundary guarantees that any interval that could potentially overlap with the current candidate must appear immediately next in sequence. An overlap occurs if and only if next.start <= current.end.',
    invariant:
      'Greedy Sweep Invariant: At any step i, all intervals merged[0..k] are strictly pairwise disjoint and fully finalized except possibly the last one.',
    pitfalls: [
      'Forgetting to take max(current.end, next.end) when merging (a subsequent interval could be completely inside the current one).',
      'Forgetting to append the final open interval after the loop finishes.',
    ],
  },
  presets: [
    {
      id: 'classic-overlap',
      label: 'Classic Overlap: [[1,3],[2,6],[8,10],[15,18]]',
      description: 'First two merge into [1,6], rest remain distinct',
      data: {
        intervals: [
          [1, 3],
          [2, 6],
          [8, 10],
          [15, 18],
        ],
      },
    },
    {
      id: 'nested-intervals',
      label: 'Nested Intervals: [[1,4],[2,3],[3,5]]',
      description: 'All merge into single wide span [1,5]',
      data: {
        intervals: [
          [1, 4],
          [2, 3],
          [3, 5],
        ],
      },
    },
    {
      id: 'fully-disjoint',
      label: 'Disjoint Intervals: [[1,2],[4,5],[7,8]]',
      description: 'Zero overlaps; all intervals preserved as-is',
      data: {
        intervals: [
          [1, 2],
          [4, 5],
          [7, 8],
        ],
      },
    },
  ],
  defaultInput: {
    intervals: [
      [1, 3],
      [2, 6],
      [8, 10],
      [15, 18],
    ],
  },
  codeSnippets: {
    python: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for current in intervals:
        if not merged or merged[-1][1] < current[0]:
            merged.append(current)
        else:
            merged[-1][1] = max(merged[-1][1], current[1])
    return merged`,
    typescript: `function merge(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  for (const curr of intervals) {
    if (merged.length === 0 || merged[merged.length - 1][1] < curr[0]) {
      merged.push(curr);
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], curr[1]);
    }
  }
  return merged;
}`,
    cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> merged;
    for (const auto& curr : intervals) {
        if (merged.empty() || merged.back()[1] < curr[0]) {
            merged.push_back(curr);
        } else {
            merged.back()[1] = max(merged.back()[1], curr[1]);
        }
    }
    return merged;
}`,
    java: `public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> merged = new ArrayList<>();
    for (int[] curr : intervals) {
        if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < curr[0]) {
            merged.add(curr);
        } else {
            merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], curr[1]);
        }
    }
    return merged.toArray(new int[merged.size()][]);
}`,
    pseudocode: `function mergeIntervals(intervals):
    sort intervals ascending by start time
    merged = empty list
    for interval in intervals:
        if merged is empty or merged.last.end < interval.start:
            merged.append(interval)
        else:
            merged.last.end = max(merged.last.end, interval.end)
    return merged`,
  },

  generateTimeline: (input: { intervals: [number, number][] }): ExecutionFrame<MergeIntervalsState>[] => {
    const raw = input.intervals.length > 0 ? input.intervals : [[1, 3], [2, 6], [8, 10], [15, 18]];
    // Sort intervals by start ascending
    const sorted = [...raw].sort((a, b) => a[0] - b[0]);

    const frames: ExecutionFrame<MergeIntervalsState>[] = [];
    const originalItems: IntervalItem[] = sorted.map((iv, i) => ({
      id: `orig-${i}`,
      start: iv[0],
      end: iv[1],
      status: 'pending',
    }));

    // Step 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Sorted ${sorted.length} intervals by starting time: [${sorted.map((iv) => `[${iv[0]}, ${iv[1]}]`).join(', ')}].`,
      variables: { totalIntervals: sorted.length, mergedCount: 0 },
      callStack: [
        { name: `merge(${sorted.length} intervals)`, params: { count: sorted.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        original: [...originalItems],
        currentIndex: -1,
        merged: [],
        activeInterval: null,
        overlapDetected: false,
      },
    });

    const mergedList: IntervalItem[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const curr = sorted[i];
      const currItem: IntervalItem = {
        id: `curr-${i}`,
        start: curr[0],
        end: curr[1],
        status: 'comparing',
      };

      if (mergedList.length === 0) {
        // First interval automatically pushed
        mergedList.push({
          id: `merged-${mergedList.length}`,
          start: curr[0],
          end: curr[1],
          status: 'pushed',
        });

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          explanation: `Merged list is empty. Push first interval [${curr[0]}, ${curr[1]}] as initial anchor.`,
          variables: { current: `[${curr[0]}, ${curr[1]}]`, mergedSize: mergedList.length },
          callStack: [
            { name: `pushInitial([${curr[0]}, ${curr[1]}])`, params: { start: curr[0], end: curr[1] }, line: 5, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            original: originalItems.map((item, idx) => ({
              ...item,
              status: idx === i ? 'pushed' : idx < i ? 'merged' : 'pending',
            })),
            currentIndex: i,
            merged: [...mergedList],
            activeInterval: currItem,
            overlapDetected: false,
          },
        });
      } else {
        const last = mergedList[mergedList.length - 1];
        const isOverlap = curr[0] <= last.end;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 4,
          explanation: `Compare interval [${curr[0]}, ${curr[1]}] with last merged [${last.start}, ${last.end}]. Check curr.start (${curr[0]}) <= last.end (${last.end}).`,
          variables: {
            currStart: curr[0],
            lastEnd: last.end,
            overlap: isOverlap,
          },
          conditionEval: {
            expr: `${curr[0]} <= ${last.end}`,
            result: isOverlap,
          },
          callStack: [
            { name: `checkOverlap([${curr[0]}, ${curr[1]}], [${last.start}, ${last.end}])`, params: { overlap: String(isOverlap) }, line: 4, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            original: originalItems.map((item, idx) => ({
              ...item,
              status: idx === i ? 'comparing' : idx < i ? 'merged' : 'pending',
            })),
            currentIndex: i,
            merged: [...mergedList],
            activeInterval: currItem,
            overlapDetected: isOverlap,
          },
        });

        if (isOverlap) {
          const newEnd = Math.max(last.end, curr[1]);
          last.end = newEnd;
          last.status = 'merged';

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            isMilestone: true,
            milestoneTitle: `Merged into [${last.start}, ${newEnd}]`,
            explanation: `Overlap detected! Extended last merged interval end to max(${last.end}, ${curr[1]}) = ${newEnd}. Combined span: [${last.start}, ${newEnd}].`,
            variables: { mergedSpan: `[${last.start}, ${newEnd}]`, newEnd },
            callStack: [
              { name: `extendInterval(${last.start}, ${newEnd})`, params: { newEnd }, line: 7, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              original: originalItems.map((item, idx) => ({
                ...item,
                status: idx <= i ? 'merged' : 'pending',
              })),
              currentIndex: i,
              merged: [...mergedList],
              activeInterval: null,
              overlapDetected: true,
            },
          });
        } else {
          // No overlap, push as new interval
          mergedList.push({
            id: `merged-${mergedList.length}`,
            start: curr[0],
            end: curr[1],
            status: 'pushed',
          });

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 5,
            explanation: `No overlap (${curr[0]} > ${last.end}). Append [${curr[0]}, ${curr[1]}] as new distinct interval.`,
            variables: { newInterval: `[${curr[0]}, ${curr[1]}]`, totalMerged: mergedList.length },
            callStack: [
              { name: `pushInterval([${curr[0]}, ${curr[1]}])`, params: { start: curr[0], end: curr[1] }, line: 5, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              original: originalItems.map((item, idx) => ({
                ...item,
                status: idx <= i ? 'merged' : 'pending',
              })),
              currentIndex: i,
              merged: [...mergedList],
              activeInterval: null,
              overlapDetected: false,
            },
          });
        }
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      isMilestone: true,
      milestoneTitle: 'Sweep Complete',
      explanation: `All intervals merged. Final set of ${mergedList.length} non-overlapping intervals: [${mergedList.map((iv) => `[${iv.start}, ${iv.end}]`).join(', ')}].`,
      variables: {
        originalCount: sorted.length,
        mergedCount: mergedList.length,
        reductionPercent: `${Math.round(((sorted.length - mergedList.length) / sorted.length) * 100)}%`,
      },
      callStack: [
        { name: 'complete()', params: { total: mergedList.length }, line: 8, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        original: originalItems.map((item) => ({ ...item, status: 'merged' })),
        currentIndex: sorted.length,
        merged: [...mergedList],
        activeInterval: null,
        overlapDetected: false,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<MergeIntervalsState>) => {
    const { original, currentIndex, merged, overlapDetected } = frame.state;

    // Find min and max for timeline axis
    const allVals = [
      ...original.flatMap((i) => [i.start, i.end]),
      ...merged.flatMap((i) => [i.start, i.end]),
    ];
    const minVal = Math.min(0, ...allVals);
    const maxVal = Math.max(20, ...allVals) + 2;
    const range = maxVal - minVal || 1;

    const toPercent = (val: number) => `${((val - minVal) / range) * 100}%`;
    const toWidth = (start: number, end: number) => `${(Math.max(0.5, end - start) / range) * 100}%`;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Status Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Input Intervals: <strong className="text-white">{original.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Merged Spans: <strong className="text-white">{merged.length}</strong>
            </div>
          </div>

          {overlapDetected && (
            <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold animate-pulse">
              ⚡ OVERLAP DETECTED & MERGED
            </div>
          )}
        </div>

        {/* Visual Axis & Interval Tracks */}
        <div className="w-full flex flex-col gap-6 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          {/* Axis Scale */}
          <div className="relative w-full h-6 border-b border-slate-700 mb-2">
            {[0, 5, 10, 15, 20].filter((n) => n <= maxVal).map((tick) => (
              <div
                key={tick}
                className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                style={{ left: toPercent(tick) }}
              >
                <div className="w-0.5 h-2 bg-slate-600 mb-1" />
                <span className="text-[10px] font-mono text-slate-500">{tick}</span>
              </div>
            ))}
          </div>

          {/* Section 1: Input Intervals Track */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Input Intervals (Sorted by Start)
            </span>
            <div className="relative w-full h-24 bg-slate-900/60 rounded-2xl border border-slate-800 p-2 flex flex-col justify-around">
              {original.map((iv, idx) => {
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={iv.id}
                    className={`absolute h-7 rounded-xl flex items-center justify-between px-3 text-xs font-mono font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] z-10 scale-105'
                        : iv.status === 'merged'
                        ? 'bg-slate-800/60 text-slate-500 border border-slate-700'
                        : 'bg-slate-800 text-slate-300 border border-slate-600'
                    }`}
                    style={{
                      left: toPercent(iv.start),
                      width: toWidth(iv.start, iv.end),
                      top: `${(idx % 3) * 28 + 4}px`,
                    }}
                  >
                    <span>{iv.start}</span>
                    <span>{iv.end}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Final Merged Spans */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span>CONTIGUOUS MERGED INTERVALS</span>
            </span>
            <div className="relative w-full h-16 bg-emerald-950/20 rounded-2xl border border-emerald-900/40 p-2 flex items-center">
              {merged.length === 0 ? (
                <div className="w-full text-center text-xs font-mono text-slate-600 italic">
                  Merged intervals will appear here as iterations proceed...
                </div>
              ) : (
                merged.map((iv) => (
                  <div
                    key={iv.id}
                    className="absolute h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-between px-3 text-xs font-mono font-extrabold shadow-lg transition-all duration-300"
                    style={{
                      left: toPercent(iv.start),
                      width: toWidth(iv.start, iv.end),
                    }}
                  >
                    <span>[{iv.start}</span>
                    <span>{iv.end}]</span>
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
