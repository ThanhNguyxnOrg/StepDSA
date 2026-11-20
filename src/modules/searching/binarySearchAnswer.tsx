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

const MAX_LEN = 8;
const MAX_PILE = 999;
const DEFAULT_INPUT = { piles: [3, 6, 7, 11], h: 8 };

interface NormalisedInput {
  piles: number[];
  h: number;
  notes: string[];
}

/**
 * Koko Eating Bananas needs positive integer piles: non-numeric entries and
 * non-positive piles are dropped, pile sizes are clamped to MAX_PILE, and the
 * input is truncated to MAX_LEN piles. Every adjustment is reported as a note
 * so the INIT frame can state it honestly. Empty piles are a valid run with
 * zero required hours, not an error.
 */
function normalise(input: { piles: number[]; h: number } | undefined): NormalisedInput {
  const notes: string[] = [];
  const raw = input && typeof input === 'object' ? input : DEFAULT_INPUT;
  const rawPiles = Array.isArray(raw.piles) ? raw.piles : DEFAULT_INPUT.piles;

  const usable = rawPiles.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value) && Math.round(value) > 0
  );

  if (rawPiles.length > 0 && usable.length === 0) {
    notes.push('no positive piles in the input, so the default piles are used');
    return { piles: [...DEFAULT_INPUT.piles], h: Math.max(1, Math.round(raw.h) || DEFAULT_INPUT.h), notes };
  }
  if (usable.length < rawPiles.length) {
    notes.push(`${rawPiles.length - usable.length} non-positive or non-numeric pile(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.min(MAX_PILE, Math.round(value));
    if (rounded !== Math.round(value)) {
      notes.push(`pile ${Math.round(value)} clamped to ${rounded} (max ${MAX_PILE})`);
    }
    return rounded;
  });

  let piles = clamped;
  if (piles.length > MAX_LEN) {
    notes.push(`${piles.length} piles truncated to ${MAX_LEN} for a readable strip`);
    piles = piles.slice(0, MAX_LEN);
  }

  let h = typeof raw.h === 'number' && Number.isFinite(raw.h) ? Math.round(raw.h) : DEFAULT_INPUT.h;
  if (h < 1) {
    notes.push('h was non-positive, so it is clamped to 1 hour');
    h = 1;
  }

  return { piles, h, notes };
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
      description: 'Minimum speed is k = 11 (exactly 10 hours)',
      data: { piles: [30, 11, 23, 4, 20], h: 10 },
    },
  ],
  defaultInput: { piles: [3, 6, 7, 11], h: 8 },
  codeSnippets: {
    pseudocode: `function minEatingSpeed(piles, h):
    define hours_needed(k):
        return sum over p of ceil(p / k)
    low = 1
    high = max(piles)
    ans = high
    while low <= high:
        mid = (low + high) / 2
        if hours_needed(mid) <= h:
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`,
    python: `def minEatingSpeed(piles, h):
    def hours_needed(k):
        return sum((p + k - 1) // k for p in piles)
    low = 1
    high = max(piles)
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
  let low = 1;
  let high = Math.max(...piles);
  let ans = high;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (hoursNeeded(mid) <= h) {
      ans = mid;
      high = mid - 1; }
    else {
      low = mid + 1; } }
  return ans; }`,
    cpp: `int minEatingSpeed(vector<int>& piles, int h) {
    auto hoursNeeded = [&](int k) {
        long long hours = 0; for (int p : piles) hours += (p + k - 1) / k; return hours; };
    int low = 1;
    int high = *max_element(piles.begin(), piles.end());
    int ans = high;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (hoursNeeded(mid) <= h) {
            ans = mid;
            high = mid - 1; }
        else {
            low = mid + 1; } }
    return ans; }`,
    java: `int minEatingSpeed(int[] piles, int h) {
    java.util.function.IntUnaryOperator hoursNeeded = k -> {
        int hours = 0; for (int p : piles) hours += (p + k - 1) / k; return hours; };
    int low = 1;
    int high = 0; for (int p : piles) high = Math.max(high, p);
    int ans = high;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (hoursNeeded(mid) <= h) {
            ans = mid;
            high = mid - 1; }
        else {
            low = mid + 1; } }
    return ans; }`,
  },

  generateTimeline: (input: { piles: number[]; h: number }): ExecutionFrame<BinarySearchAnswerState>[] => {
    const { piles, h, notes } = normalise(input);
    const n = piles.length;
    const maxPile = n > 0 ? Math.max(...piles) : 0;

    const calcHours = (speed: number) =>
      piles.reduce((acc, p) => acc + Math.ceil(p / speed), 0);

    const frames: ExecutionFrame<BinarySearchAnswerState>[] = [];
    let checkpointAdded = false;
    let firstFeasibleMilestoneUsed = false;
    let halfMilestoneUsed = false;

    let actionType: 'INIT' | 'ITERATION' | 'EVALUATE' | 'FEASIBLE' | 'TOO_SLOW' | 'DONE' = 'INIT';

    const pushFrame = (opts: {
      codeLine: number;
      explanation: string;
      pedagogy?: { what: string; why: string; whatNext: string };
      variables?: Record<string, any>;
      conditionEval?: ExecutionFrame<BinarySearchAnswerState>['conditionEval'];
      milestone?: string;
      soundCue?: ExecutionFrame<BinarySearchAnswerState>['soundCue'];
      checkpoint?: ExecutionFrame<BinarySearchAnswerState>['checkpoint'];
      mid: number;
      hoursNeeded: number;
      isFeasible: boolean;
      low: number;
      high: number;
      bestSpeed: number;
      phase: BinarySearchAnswerState['phase'];
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: actionType,
        explanation: opts.explanation,
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        pedagogy: opts.pedagogy,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        ...(opts.checkpoint ? { checkpoint: opts.checkpoint } : {}),
        callStack: [
          { name: `minEatingSpeed(piles, ${h})`, params: { h, maxPile }, line: opts.codeLine, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          piles,
          h,
          low: opts.low,
          high: opts.high,
          mid: opts.mid,
          hoursNeeded: opts.hoursNeeded,
          isFeasible: opts.isFeasible,
          bestSpeed: opts.bestSpeed,
          phase: opts.phase,
        },
      });
    };

    let low = 1;
    let high = maxPile;
    let bestSpeed = maxPile;

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    pushFrame({
      codeLine: 4,
      explanation:
        (n > 0
          ? `Set search boundaries for speed k: low = 1 (minimum possible speed), high = max(piles) = ${maxPile} (guaranteed finish in ${n} hours). Total time allowance H = ${h}.`
          : 'n = length(piles) = 0: there is nothing to eat, so the answer is trivially 0 required hours.') +
        (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
      conditionEval: { expr: 'length(piles) > 0', condition: `${n} > 0`, result: n > 0 },
      variables: { low, high, maxPile, targetHours: h, bestSpeed },
      milestone: n > 0 ? undefined : 'Nothing to Eat',
      soundCue: 'start',
      mid: 0,
      hoursNeeded: 0,
      isFeasible: false,
      low,
      high,
      bestSpeed,
      phase: n > 0 ? 'search' : 'found',
      pedagogy: {
        what:
          n > 0
            ? `Binary search on the answer: the search space is not an array but the range of possible eating speeds [1..${maxPile}].`
            : 'An empty pile list needs zero hours, so the optimal speed is undefined-but-trivially-satisfied.',
        why: `Feasibility is monotone — if speed k finishes within ${h} hours, every speed > k also does. So the feasible speeds form a suffix, and its first element can be binary-searched.`,
        whatNext: n > 0 ? 'Test the midpoint speed and count the hours it needs.' : 'Return the empty result.',
      },
    });

    if (n === 0) {
      actionType = 'DONE';
      pushFrame({
        codeLine: 14,
        explanation: 'No piles: zero hours are needed, so the optimal minimum speed is 0 (nothing to eat).',
        conditionEval: { expr: 'hoursNeeded(k) <= h', condition: '0 <= ' + h, result: true },
        variables: { optimalSpeed: 0, finalHours: 0, limitH: h },
        milestone: 'Nothing to Eat',
        soundCue: 'complete',
        mid: 0,
        hoursNeeded: 0,
        isFeasible: true,
        low,
        high,
        bestSpeed: 0,
        phase: 'found',
        pedagogy: {
          what: 'With no piles, the predicate is satisfied at any speed — including 0.',
          why: 'There is no food to consume, so the deadline can never be missed.',
          whatNext: 'Load a preset such as Standard Piles to watch the binary search run.',
        },
      });
      const totalEarly = frames.length;
      return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: totalEarly }));
    }

    let iter = 1;
    while (low <= high) {
      // Loop condition frame
      actionType = 'ITERATION';
      pushFrame({
        codeLine: 7,
        explanation: `Iteration #${iter}: Checking loop condition low (${low}) <= high (${high}). Search space contains ${high - low + 1} candidate speeds.`,
        variables: { iteration: iter, low, high, rangeSize: high - low + 1, currentBest: bestSpeed },
        conditionEval: { expr: 'low <= high', condition: `${low} <= ${high}`, result: true },
        mid: Math.floor((low + high) / 2),
        hoursNeeded: calcHours(Math.floor((low + high) / 2)),
        isFeasible: false,
        low,
        high,
        bestSpeed,
        phase: 'search',
        pedagogy: {
          what: `${high - low + 1} candidate speed(s) remain in [${low}..${high}]; best recorded so far is ${bestSpeed}.`,
          why: 'The answer is the smallest feasible speed, so the window shrinks toward the feasibility boundary.',
          whatNext: 'Evaluate the midpoint speed.',
        },
      });

      const mid = Math.floor((low + high) / 2);
      const pileHours = piles.map((p) => Math.ceil(p / mid));
      const hours = pileHours.reduce((a, b) => a + b, 0);
      const feasible = hours <= h;

      // Evaluate predicate with pile breakdown
      actionType = 'EVALUATE';
      const monotoneCheckpoint: ExecutionFrame<BinarySearchAnswerState>['checkpoint'] | undefined =
        !checkpointAdded
          ? {
              id: 'binary-search-answer-monotone',
              question: `k = ${mid} needs ${hours} hrs against budget ${h}. Since feasibility is monotone, where is the minimum feasible speed?`,
              options: [
                feasible
                  ? `Strictly above k = ${mid} — larger speeds are always safer`
                  : `At k = ${mid} or below — smaller speeds save time`,
                feasible
                  ? `At k = ${mid} or below — record ${mid} and move high down`
                  : `Strictly above k = ${mid} — every speed ≤ ${mid} is also too slow`,
              ],
              correctIndex: 1,
              explanation: feasible
                ? `Speed ${mid} already works, so the optimum is ≤ ${mid}; keep it as best and search lower.`
                : `Speed ${mid} misses the deadline, and any slower speed misses it too, so the optimum is > ${mid}.`,
              hint: 'If a speed works, do larger speeds work too?',
            }
          : undefined;

      pushFrame({
        codeLine: 9,
        explanation: `Test candidate speed k = ${mid}: Compute ceil(pile / ${mid}) for each pile -> [${pileHours.join(' + ')}] = ${hours} total hours needed (Budget H = ${h}).`,
        variables: { candidateSpeed: mid, hoursNeeded: hours, allowedHours: h, feasible: String(feasible), pileBreakdown: pileHours.join('+') },
        conditionEval: {
          expr: 'hoursNeeded(mid) <= h',
          condition: `${hours} <= ${h}`,
          result: feasible,
        },
        soundCue: 'compare',
        checkpoint: monotoneCheckpoint,
        mid,
        hoursNeeded: hours,
        isFeasible: feasible,
        low,
        high,
        bestSpeed,
        phase: 'verify',
        pedagogy: {
          what: `Predicate check: at speed ${mid}, each pile takes ⌈pile/${mid}⌉ hours — total ${hours} vs budget ${h}.`,
          why: 'Each pile is eaten sequentially, so hours add up; a pile is never split across hours.',
          whatNext: feasible ? 'Feasible: record it and try smaller speeds.' : 'Too slow: every speed ≤ this one fails, so move up.',
        },
      });
      if (monotoneCheckpoint) checkpointAdded = true;

      if (feasible) {
        bestSpeed = mid;
        high = mid - 1;
        actionType = 'FEASIBLE';

        const feasibleMilestone = !firstFeasibleMilestoneUsed ? 'First Feasible Found' : undefined;
        if (feasibleMilestone) firstFeasibleMilestoneUsed = true;

        pushFrame({
          codeLine: 11,
          explanation: `Speed k = ${mid} succeeds (${hours} hrs ≤ ${h} hrs). Record bestSpeed = ${mid}. Narrow upper bound: high = mid - 1 = ${high} to search for smaller feasible speeds.`,
          variables: { bestSpeed, newHigh: high, low, verified: true },
          conditionEval: { expr: 'hoursNeeded(mid) <= h', condition: `${hours} <= ${h}`, result: true },
          milestone: feasibleMilestone,
          soundCue: 'swap',
          mid,
          hoursNeeded: hours,
          isFeasible: true,
          low,
          high,
          bestSpeed,
          phase: 'search',
          pedagogy: {
            what: `Speed ${mid} finishes in ${hours} ≤ ${h} hours, so it is a valid answer; best becomes ${mid}.`,
            why: 'We are minimizing, so a feasible candidate only proves the optimum is at most mid — search below it.',
            whatNext: `Set high = ${high} and keep looking for a smaller feasible speed.`,
          },
        });
      } else {
        low = mid + 1;
        actionType = 'TOO_SLOW';

        pushFrame({
          codeLine: 13,
          explanation: `Speed k = ${mid} is too slow (${hours} hrs > ${h} hrs). Discard speed <= ${mid}. Narrow lower bound: low = mid + 1 = ${low}.`,
          variables: { speedTooSlow: mid, newLow: low, high, tooSlow: true },
          conditionEval: { expr: 'hoursNeeded(mid) <= h', condition: `${hours} <= ${h}`, result: false },
          soundCue: 'compare',
          mid,
          hoursNeeded: hours,
          isFeasible: false,
          low,
          high,
          bestSpeed,
          phase: 'search',
          pedagogy: {
            what: `Speed ${mid} needs ${hours} > ${h} hours — infeasible; every speed ≤ ${mid} is also infeasible.`,
            why: 'Slower speeds can only increase each pile\'s hours, so the entire lower half is eliminated at once.',
            whatNext: `Set low = ${low} and test faster speeds.`,
          },
        });
      }

      // The answer-space elimination milestone: once the window drops below half the original range.
      const originalRange = maxPile;
      const eliminated = originalRange - (high - low + 1);
      if (!halfMilestoneUsed && eliminated >= Math.ceil(originalRange / 2)) {
        halfMilestoneUsed = true;
        actionType = 'ITERATION';
        pushFrame({
          codeLine: 7,
          explanation: `Answer-space milestone: over half of the original range [1..${originalRange}] has been eliminated. Remaining window: [${low}..${high}].`,
          variables: { low, high, remaining: high - low + 1, eliminated },
          milestone: 'Half Answer Space Eliminated',
          mid,
          hoursNeeded: hours,
          isFeasible: feasible,
          low,
          high,
          bestSpeed,
          phase: 'search',
          pedagogy: {
            what: `The candidate window [${low}..${high}] has shrunk to less than half of [1..${originalRange}].`,
            why: 'Each predicate test discards one whole side of the speed range — that is the O(log(maxPile)) cost model at work.',
            whatNext: 'Continue testing the midpoint until the window is empty.',
          },
        });
      }

      iter++;
    }

    // Final result frame
    actionType = 'DONE';
    pushFrame({
      codeLine: 14,
      explanation: `Search space exhausted (low ${low} > high ${high}). Optimal minimum speed is k = ${bestSpeed} (finishes in ${calcHours(bestSpeed)} hrs ≤ ${h} hrs).`,
      variables: { optimalSpeed: bestSpeed, finalHours: calcHours(bestSpeed), limitH: h },
      milestone: `Optimal Minimum Speed: k = ${bestSpeed}`,
      soundCue: 'complete',
      mid: bestSpeed,
      hoursNeeded: calcHours(bestSpeed),
      isFeasible: true,
      low,
      high,
      bestSpeed,
      phase: 'found',
      pedagogy: {
        what: `The window is empty; bestSpeed = ${bestSpeed} is the smallest speed that meets the ${h}-hour deadline.`,
        why: 'The loop moved past the feasibility boundary: every speed below bestSpeed was tested and failed, every speed ≥ it is feasible.',
        whatNext: 'Return bestSpeed.',
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
                    ceil({pile}/{mid}) = <strong className="text-white">{pileHours}h</strong>
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
