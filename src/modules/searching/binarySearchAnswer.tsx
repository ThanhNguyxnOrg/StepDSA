import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BinarySearchAnswerState {
  piles: number[];
  h: number;
  low: number;
  high: number;
  mid: number;
  hoursNeeded: number;
  isFeasible: boolean;
  bestSpeed: number;
  phase: 'search' | 'verify' | 'found';
}

export const binarySearchAnswerModule: AlgorithmModule<
  { piles: number[]; h: number },
  BinarySearchAnswerState
> = {
  id: 'binary-search-answer',
  title: 'Binary Search on Answer Space (Monotonic Predicate O(N log(max(P))))',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N log(max(P)))',
    timeWorst: 'O(N log(max(P)))',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Requires log2(max(piles)) predicate evaluations over N piles',
  },
  theory: {
    overview:
      'Binary Search on Answer Space optimizes a monotonic predicate f(x) over a bounded candidate range [low, high]. The canonical model (Koko Eating Bananas) seeks the minimum speed k such that all banana piles can be consumed within H hours.',
    whyItWorks:
      'Because the predicate "can complete in <= H hours at speed k" is monotonically non-decreasing (if speed k is feasible, all speeds > k are also feasible), the solution space splits cleanly into [False, ..., False, True, ..., True]. Binary search locates the first True in O(log(range)) iterations.',
    invariant:
      'Monotonic Boundary Invariant: The optimal minimum speed k* is guaranteed to lie within the active search window [low, high].',
    pitfalls: [
      'Choosing an invalid search bound (low must be 1, high must be max(piles)).',
      'Integer overflow when summing required hours ceil(pile / speed).',
    ],
  },
  presets: [
    {
      id: 'koko-standard',
      label: 'Standard Piles: [3, 6, 7, 11], H = 8',
      description: 'Optimal minimum eating speed k = 4',
      data: { piles: [3, 6, 7, 11], h: 8 },
    },
    {
      id: 'tight-time',
      label: 'Tight Deadline: [30, 11, 23, 4, 20], H = 5',
      description: 'H equals number of piles; speed must equal max(piles) = 30',
      data: { piles: [30, 11, 23, 4, 20], h: 5 },
    },
    {
      id: 'generous-time',
      label: 'Generous Deadline: [30, 11, 23, 4, 20], H = 10',
      description: 'Speed drops significantly to k = 12',
      data: { piles: [30, 11, 23, 4, 20], h: 10 },
    },
  ],
  defaultInput: { piles: [3, 6, 7, 11], h: 8 },
  codeSnippets: {
    python: `def minEatingSpeed(piles, h):
    def hours_needed(k):
        return sum((p + k - 1) // k for p in piles)

    low, high = 1, max(piles)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if hours_needed(mid) <= h:
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`,
    typescript: `function minEatingSpeed(piles: number[], h: number): number {
  const hoursNeeded = (k: number) =>
    piles.reduce((acc, p) => acc + Math.ceil(p / k), 0);

  let low = 1, high = Math.max(...piles);
  let ans = high;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (hoursNeeded(mid) <= h) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return ans;
}`,
    cpp: `int minEatingSpeed(vector<int>& piles, int h) {
    auto hoursNeeded = [&](long long k) {
        long long hours = 0;
        for (int p : piles) hours += (p + k - 1) / k;
        return hours;
    };
    int low = 1, high = *max_element(piles.begin(), piles.end());
    int ans = high;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (hoursNeeded(mid) <= h) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}`,
    java: `public int minEatingSpeed(int[] piles, int h) {
    int maxP = 0;
    for (int p : piles) maxP = Math.max(maxP, p);
    int low = 1, high = maxP, ans = high;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        long hours = 0;
        for (int p : piles) hours += (p + mid - 1) / mid;
        if (hours <= h) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}`,
    pseudocode: `function minEatingSpeed(piles, h):
    low = 1, high = max(piles)
    ans = high
    while low <= high:
        mid = (low + high) / 2
        hours = calculate_hours(piles, mid)
        if hours <= h:
            ans = mid
            high = mid - 1 // Search for smaller feasible speed
        else:
            low = mid + 1  // Speed too slow, increase low
    return ans`,
  },

  generateTimeline: (input: { piles: number[]; h: number }): ExecutionFrame<BinarySearchAnswerState>[] => {
    const piles = input.piles.length > 0 ? input.piles : [3, 6, 7, 11];
    const h = Math.max(piles.length, input.h || 8);
    const maxPile = Math.max(...piles);

    const calcHours = (speed: number) =>
      piles.reduce((acc, p) => acc + Math.ceil(p / speed), 0);

    const frames: ExecutionFrame<BinarySearchAnswerState>[] = [];

    // Frame 0: Initialization
    let low = 1;
    let high = maxPile;
    let bestSpeed = maxPile;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Set search boundaries for speed k: low = 1 (minimum possible speed), high = max(piles) = ${maxPile} (guaranteed finish in ${piles.length} hours). Total time allowance H = ${h}.`,
      variables: { low, high, maxPile, targetHours: h, bestSpeed },
      callStack: [
        { name: `minEatingSpeed(piles, ${h})`, params: { h, maxPile }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        piles,
        h,
        low,
        high,
        mid: Math.floor((low + high) / 2),
        hoursNeeded: calcHours(Math.floor((low + high) / 2)),
        isFeasible: false,
        bestSpeed,
        phase: 'search',
      },
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const hours = calcHours(mid);
      const feasible = hours <= h;

      // Evaluate predicate
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        explanation: `Test candidate speed k = ${mid} (midpoint of [${low}..${high}]). Required time: ${hours} hours across all piles.`,
        variables: { candidateSpeed: mid, hoursNeeded: hours, allowedHours: h, feasible: String(feasible) },
        conditionEval: {
          expr: `hoursNeeded(${mid}) [${hours}] <= H [${h}]`,
          result: feasible,
        },
        callStack: [
          { name: `checkFeasibility(k=${mid})`, params: { speed: mid, hours, target: h }, line: 8, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          piles,
          h,
          low,
          high,
          mid,
          hoursNeeded: hours,
          isFeasible: feasible,
          bestSpeed,
          phase: 'verify',
        },
      });

      if (feasible) {
        bestSpeed = mid;
        high = mid - 1;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          isMilestone: true,
          milestoneTitle: `Feasible Speed Found (k = ${mid})`,
          explanation: `Speed k = ${mid} succeeds (${hours} hrs <= ${h} hrs). Record bestSpeed = ${mid}. Narrow upper bound: high = mid - 1 = ${high} to search for even smaller speeds.`,
          variables: { bestSpeed, newHigh: high, low },
          callStack: [
            { name: `recordOptimal(${mid})`, params: { best: mid, newHigh: high }, line: 10, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            piles,
            h,
            low,
            high,
            mid,
            hoursNeeded: hours,
            isFeasible: true,
            bestSpeed,
            phase: 'search',
          },
        });
      } else {
        low = mid + 1;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          explanation: `Speed k = ${mid} is too slow (${hours} hrs > ${h} hrs). Discard speed <= ${mid}. Narrow lower bound: low = mid + 1 = ${low}.`,
          variables: { speedTooSlow: mid, newLow: low, high },
          callStack: [
            { name: `increaseSpeed(low=${low})`, params: { low, high }, line: 13, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            piles,
            h,
            low,
            high,
            mid,
            hoursNeeded: hours,
            isFeasible: false,
            bestSpeed,
            phase: 'search',
          },
        });
      }
    }

    // Final result frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      isMilestone: true,
      milestoneTitle: `Optimal Minimum Speed: k = ${bestSpeed}`,
      explanation: `Search space exhausted (low ${low} > high ${high}). Optimal minimum speed is k = ${bestSpeed} (finishes in ${calcHours(bestSpeed)} hrs <= ${h} hrs).`,
      variables: { optimalSpeed: bestSpeed, finalHours: calcHours(bestSpeed), limitH: h },
      callStack: [
        { name: 'complete()', params: { optimalK: bestSpeed }, line: 15, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        piles,
        h,
        low,
        high,
        mid: bestSpeed,
        hoursNeeded: calcHours(bestSpeed),
        isFeasible: true,
        bestSpeed,
        phase: 'found',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<BinarySearchAnswerState>) => {
    const { piles, h, low, high, mid, hoursNeeded, isFeasible, bestSpeed, phase } = frame.state;
    const maxPile = Math.max(...piles);

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Allowed Deadline: <strong className="text-white">H = {h} hrs</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Best Feasible Speed: <strong className="text-white">k = {bestSpeed}</strong>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            Active Interval: <strong className="text-cyan-300">[{low} .. {high}]</strong>
          </div>
        </div>

        {/* Answer Space Slider / Ruler */}
        <div className="w-full flex flex-col gap-2 p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-xl my-auto">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>ANSWER SEARCH SPACE [1 .. {maxPile}]</span>
            <span className={isFeasible ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {phase === 'found' ? 'OPTIMAL BOUND FOUND' : isFeasible ? 'FEASIBLE CANDIDATE' : 'INFEASIBLE (TOO SLOW)'}
            </span>
          </div>

          {/* 1D Answer Line */}
          <div className="relative w-full h-12 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center px-4">
            {/* Active Range Highlight */}
            {low <= high && (
              <div
                className="absolute h-8 rounded-xl bg-cyan-950/40 border border-cyan-500/30 transition-all duration-300"
                style={{
                  left: `${((low - 1) / maxPile) * 100}%`,
                  width: `${(Math.max(1, high - low + 1) / maxPile) * 100}%`,
                }}
              />
            )}

            {/* Current Midpoint Indicator */}
            {mid >= 1 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-300"
                style={{ left: `${(mid / maxPile) * 100}%` }}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-extrabold shadow-lg ${
                    isFeasible
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/50'
                      : 'bg-amber-500 text-slate-950 shadow-amber-500/50'
                  }`}
                >
                  {mid}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1">mid</span>
              </div>
            )}
          </div>
        </div>

        {/* Piles Simulation Card */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>BANANA PILES EVALUATION (Speed k = {mid})</span>
            <span className="font-bold text-white">
              Total Time: <strong className={hoursNeeded <= h ? 'text-emerald-400' : 'text-rose-400'}>{hoursNeeded}</strong> / {h} hrs
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {piles.map((pile, idx) => {
              const pileHours = Math.ceil(pile / mid);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center"
                >
                  <span className="text-[10px] font-mono text-slate-500">PILE #{idx + 1}</span>
                  <span className="text-xl font-mono font-bold text-white my-1">{pile}</span>
                  <span className="text-xs font-mono text-cyan-400">
                    ⌈{pile}/{mid}⌉ = <strong className="text-white">{pileHours}h</strong>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
