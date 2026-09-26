import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface Interval {
  id: string;
  start: number;
  end: number;
  label: string;
}

export interface ActivitySelectionState {
  activities: Interval[];
  selectedIndices: number[];
  currentIndex: number | null;
  lastFinishTime: number;
  status: 'inspect' | 'selected' | 'rejected' | 'done';
}

export const activitySelectionModule: AlgorithmModule<Interval[], ActivitySelectionState> = {
  id: 'activity-selection-greedy',
  title: 'Activity Selection (Interval Scheduling)',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Sorting intervals by finish time dominates runtime',
  },
  theory: {
    overview:
      'Given a set of activities with start and finish times, select the maximum number of mutually non-overlapping activities. This is the canonical example of a Greedy algorithm proving the Greedy-Choice Property.',
    whyItWorks:
      'Selecting the activity that finishes earliest leaves the maximal remaining time available for subsequent activities.',
    invariant:
      'At each decision step, the set of chosen activities forms an optimal schedule for the timeline up to the current finish time.',
    pitfalls: [
      'Sorting by start time or duration instead of finish time, which fails on long overlapping intervals.',
      'Strict inequalities (< vs <=): two activities with start == finish can typically be scheduled back-to-back.',
    ],
  },
  codeSnippets: {
    python: `def activity_selection(activities):
    # Sort by finish time
    sorted_act = sorted(activities, key=lambda x: x['end'])
    selected = [sorted_act[0]]
    last_end = sorted_act[0]['end']
    for act in sorted_act[1:]:
        if act['start'] >= last_end:
            selected.append(act)
            last_end = act['end']
    return selected`,
    typescript: `function selectActivities(activities: Interval[]): Interval[] {
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const selected: Interval[] = [sorted[0]];
  let lastEnd = sorted[0].end;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start >= lastEnd) {
      selected.push(sorted[i]);
      lastEnd = sorted[i].end;
    }
  }
  return selected;
}`,
    cpp: `vector<Interval> selectActivities(vector<Interval>& act) {
    sort(act.begin(), act.end(), [](const Interval& a, const Interval& b) {
        return a.end < b.end;
    });
    vector<Interval> selected;
    selected.push_back(act[0]);
    int lastEnd = act[0].end;
    for (size_t i = 1; i < act.size(); ++i) {
        if (act[i].start >= lastEnd) {
            selected.push_back(act[i]);
            lastEnd = act[i].end;
        }
    }
    return selected;
}`,
    java: `public List<Interval> selectActivities(List<Interval> act) {
    act.sort(Comparator.comparingInt(a -> a.end));
    List<Interval> selected = new ArrayList<>();
    selected.add(act.get(0));
    int lastEnd = act.get(0).end;
    for (int i = 1; i < act.size(); i++) {
        if (act.get(i).start >= lastEnd) {
            selected.add(act.get(i));
            lastEnd = act.get(i).end;
        }
    }
    return selected;
}`,
    pseudocode: `function selectActivities(A):
    sort A by finish time ascending
    selected <- [A[0]]
    lastEnd <- A[0].end
    for i from 1 to N - 1:
        if A[i].start >= lastEnd:
            append A[i] to selected
            lastEnd <- A[i].end
    return selected`,
  },
  defaultInput: [
    { id: 'a1', start: 1, end: 4, label: 'Task A' },
    { id: 'a2', start: 3, end: 5, label: 'Task B' },
    { id: 'a3', start: 0, end: 6, label: 'Task C' },
    { id: 'a4', start: 5, end: 7, label: 'Task D' },
    { id: 'a5', start: 3, end: 8, label: 'Task E' },
    { id: 'a6', start: 5, end: 9, label: 'Task F' },
    { id: 'a7', start: 6, end: 10, label: 'Task G' },
    { id: 'a8', start: 8, end: 11, label: 'Task H' },
  ],
  presets: [
    {
      id: 'classic_clrs',
      label: 'CLRS Textbook Example',
      description: '8 tasks with varying overlaps',
      data: [
        { id: 'a1', start: 1, end: 4, label: 'Task A' },
        { id: 'a2', start: 3, end: 5, label: 'Task B' },
        { id: 'a3', start: 0, end: 6, label: 'Task C' },
        { id: 'a4', start: 5, end: 7, label: 'Task D' },
        { id: 'a5', start: 3, end: 8, label: 'Task E' },
        { id: 'a6', start: 5, end: 9, label: 'Task F' },
        { id: 'a7', start: 6, end: 10, label: 'Task G' },
        { id: 'a8', start: 8, end: 11, label: 'Task H' },
      ],
    },
    {
      id: 'dense',
      label: 'Dense Competitors',
      description: 'Short intervals competing around midpoint',
      data: [
        { id: 'd1', start: 1, end: 2, label: 'M1' },
        { id: 'd2', start: 2, end: 3, label: 'M2' },
        { id: 'd3', start: 1, end: 5, label: 'Long Block' },
        { id: 'd4', start: 3, end: 4, label: 'M3' },
      ],
    },
  ],
  generateTimeline: (input: Interval[]): ExecutionFrame<ActivitySelectionState>[] => {
    const frames: ExecutionFrame<ActivitySelectionState>[] = [];
    const sorted = [...input].sort((a, b) => a.end - b.end);
    const selected: number[] = [0];
    let lastEnd = sorted[0].end;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Sort all intervals by finish time ascending. Greedily pick first activity "${sorted[0].label}" [${sorted[0].start}..${sorted[0].end}].`,
      state: {
        activities: sorted,
        selectedIndices: [0],
        currentIndex: 0,
        lastFinishTime: lastEnd,
        status: 'selected',
      },
    });

    for (let i = 1; i < sorted.length; i++) {
      const act = sorted[i];
      const isCompatible = act.start >= lastEnd;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Inspect "${act.label}" [${act.start}..${act.end}]. Start ${act.start} vs last end ${lastEnd}: ${isCompatible ? 'COMPATIBLE (No overlap)' : 'OVERLAPPING (Conflict)'}.`,
        state: {
          activities: sorted,
          selectedIndices: [...selected],
          currentIndex: i,
          lastFinishTime: lastEnd,
          status: 'inspect',
        },
      });

      if (isCompatible) {
        selected.push(i);
        lastEnd = act.end;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          explanation: `ACCEPTED: Schedule "${act.label}" [${act.start}..${act.end}]. New finish time barrier = ${lastEnd}.`,
          state: {
            activities: sorted,
            selectedIndices: [...selected],
            currentIndex: i,
            lastFinishTime: lastEnd,
            status: 'selected',
          },
        });
      } else {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          explanation: `REJECTED: "${act.label}" starts at ${act.start} before last finish ${lastEnd}. Discarded.`,
          state: {
            activities: sorted,
            selectedIndices: [...selected],
            currentIndex: i,
            lastFinishTime: lastEnd,
            status: 'rejected',
          },
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 9,
      explanation: `Greedy selection complete. Scheduled ${selected.length} non-overlapping activities.`,
      state: {
        activities: sorted,
        selectedIndices: [...selected],
        currentIndex: null,
        lastFinishTime: lastEnd,
        status: 'done',
      },
    });

    const total = frames.length;
    frames.forEach((f, idx) => {
      f.stepIndex = idx;
      f.totalSteps = total;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<ActivitySelectionState>) => {
    const { activities, selectedIndices, currentIndex, lastFinishTime } = frame.state;
    const maxTime = Math.max(...activities.map((a) => a.end), 12);

    return (
      <div className="flex flex-col items-center justify-center p-6 w-full min-h-[380px] gap-6">
        {/* Metric Badges */}
        <div className="flex items-center gap-6 bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-2xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">ACTIVITIES SCHEDULED</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{selectedIndices.length}</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400">LAST FINISH BARRIER</span>
            <span className="text-xl font-bold font-mono text-amber-400">t = {lastFinishTime}</span>
          </div>
        </div>

        {/* Gantt Timeline Representation */}
        <div className="flex flex-col gap-2 w-full max-w-2xl bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
          {activities.map((act, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isCurrent = currentIndex === idx;
            const leftPct = (act.start / maxTime) * 100;
            const widthPct = ((act.end - act.start) / maxTime) * 100;

            let barColor = 'bg-slate-700/60 border-slate-600 text-slate-300';
            if (isSelected) {
              barColor = 'bg-emerald-600/80 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400';
            } else if (isCurrent) {
              barColor = 'bg-amber-500/80 border-amber-300 text-slate-950 font-bold';
            }

            return (
              <div key={act.id} className="relative h-7 w-full bg-slate-800/40 rounded flex items-center">
                <div
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  className={`absolute h-6 rounded border flex items-center justify-between px-2 text-[11px] font-mono transition-all ${barColor}`}
                >
                  <span className="font-semibold">{act.label}</span>
                  <span className="text-[9px] opacity-80">[{act.start}..{act.end}]</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
