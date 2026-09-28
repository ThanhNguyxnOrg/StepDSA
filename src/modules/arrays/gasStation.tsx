import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface GasStationState {
  gas: number[];
  cost: number[];
  currentIndex: number;
  startCandidate: number;
  currentTank: number;
  totalDeficit: number;
  circuitFeasible: boolean;
  phase: 'checking' | 'deficit_reset' | 'completed';
}

export const gasStationModule: AlgorithmModule<
  { gas: number[]; cost: number[] },
  GasStationState
> = {
  id: 'gas-station',
  title: 'Gas Station Circuit (Greedy Cumulative Deficit O(N))',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N)',
    timeAverage: 'O(N)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(1)',
    worstCaseCondition: 'Traverses N stations in a single linear pass',
  },
  theory: {
    overview:
      'There are N gas stations along a circular route, where the amount of gas at station i is gas[i]. It costs cost[i] of gas to travel from station i to station i+1. Return the starting gas station index if you can travel around the circuit once clockwise.',
    whyItWorks:
      'If total gas is less than total cost, completion is mathematically impossible. If tank drops below 0 when attempting to reach station i from starting candidate S, no station between S and i could possibly reach i either (they start with even less cumulative fuel). Hence, the candidate start must be advanced to i + 1.',
    invariant:
      'Greedy Pruning Invariant: If starting from S fails at i, then for every k where S <= k <= i, starting from k also fails to reach i.',
    pitfalls: [
      'Assuming multiple candidate restarts (the problem guarantees a unique solution if sum(gas) >= sum(cost)).',
      'Simulating circular array wraparound unnecessarily when a single linear pass suffices.',
    ],
  },
  presets: [
    {
      id: 'classic-leetcode',
      label: 'Standard: Gas [1,2,3,4,5], Cost [3,4,5,1,2]',
      description: 'Start at station 3 (fuel 4, cost 1)',
      data: { gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] },
    },
    {
      id: 'impossible-circuit',
      label: 'Impossible: Gas [2,3,4], Cost [3,4,3]',
      description: 'Total gas 9 < total cost 10; returns -1',
      data: { gas: [2, 3, 4], cost: [3, 4, 3] },
    },
  ],
  defaultInput: { gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] },
  codeSnippets: {
    python: `def canCompleteCircuit(gas, cost):
    total_tank, curr_tank = 0, 0
    start_station = 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total_tank += diff
        curr_tank += diff
        if curr_tank < 0:
            start_station = i + 1
            curr_tank = 0
    return start_station if total_tank >= 0 else -1`,
    typescript: `function canCompleteCircuit(gas: number[], cost: number[]): number {
  let totalTank = 0;
  let currTank = 0;
  let startStation = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    totalTank += diff;
    currTank += diff;
    if (currTank < 0) {
      startStation = i + 1;
      currTank = 0;
    }
  }
  return totalTank >= 0 ? startStation : -1;
}`,
    cpp: `int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int totalTank = 0, currTank = 0, startStation = 0;
    for (int i = 0; i < gas.size(); ++i) {
        int diff = gas[i] - cost[i];
        totalTank += diff;
        currTank += diff;
        if (currTank < 0) {
            startStation = i + 1;
            currTank = 0;
        }
    }
    return totalTank >= 0 ? startStation : -1;
}`,
    java: `public int canCompleteCircuit(int[] gas, int[] cost) {
    int totalTank = 0, currTank = 0, startStation = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        totalTank += diff;
        currTank += diff;
        if (currTank < 0) {
            startStation = i + 1;
            currTank = 0;
        }
    }
    return totalTank >= 0 ? startStation : -1;
}`,
    pseudocode: `function canCompleteCircuit(gas, cost):
    totalTank = 0, currTank = 0, start = 0
    for i from 0 to length(gas) - 1:
        diff = gas[i] - cost[i]
        totalTank += diff
        currTank += diff
        if currTank < 0:
            start = i + 1
            currTank = 0
    if totalTank < 0: return -1
    return start`,
  },

  generateTimeline: (input: { gas: number[]; cost: number[] }): ExecutionFrame<GasStationState>[] => {
    const gas = input.gas.length > 0 ? input.gas : [1, 2, 3, 4, 5];
    const cost = input.cost.length > 0 ? input.cost : [3, 4, 5, 1, 2];
    const n = gas.length;

    const frames: ExecutionFrame<GasStationState>[] = [];
    let totalTank = 0;
    let currTank = 0;
    let startStation = 0;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize circular circuit evaluation for ${n} stations. Starting candidate S = 0.`,
      variables: { totalStations: n, candidateStart: 0, currTank: 0, totalTank: 0 },
      callStack: [
        { name: 'canCompleteCircuit(gas, cost)', params: { count: n }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        gas,
        cost,
        currentIndex: -1,
        startCandidate: 0,
        currentTank: 0,
        totalDeficit: 0,
        circuitFeasible: false,
        phase: 'checking',
      },
    });

    for (let i = 0; i < n; i++) {
      const net = gas[i] - cost[i];
      totalTank += net;
      currTank += net;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 6,
        explanation: `Station #${i}: Fill +${gas[i]} gas, spend -${cost[i]} fuel to next. Net change: ${net >= 0 ? `+${net}` : net}. Tank balance: ${currTank}.`,
        variables: { station: i, gasEarned: gas[i], costPaid: cost[i], netDelta: net, tank: currTank },
        conditionEval: {
          expr: `currTank (${currTank}) >= 0`,
          result: currTank >= 0,
        },
        callStack: [
          { name: `visitStation(${i})`, params: { net, tank: currTank }, line: 6, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          gas,
          cost,
          currentIndex: i,
          startCandidate: startStation,
          currentTank: currTank,
          totalDeficit: totalTank,
          circuitFeasible: false,
          phase: currTank < 0 ? 'deficit_reset' : 'checking',
        },
      });

      if (currTank < 0) {
        const nextStart = i + 1;
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          isMilestone: true,
          milestoneTitle: `Deficit at Station #${i} ➔ Restart at #${nextStart}`,
          explanation: `Tank ran dry (balance ${currTank} < 0) attempting to reach station ${i + 1}. By greedy pruning, no station in [${startStation}..${i}] can work. Reset candidate start to #${nextStart} and tank to 0.`,
          variables: { failedStation: i, newCandidate: nextStart, resetTank: 0 },
          callStack: [
            { name: `resetCandidate(${nextStart})`, params: { newStart: nextStart }, line: 8, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            gas,
            cost,
            currentIndex: i,
            startCandidate: nextStart,
            currentTank: 0,
            totalDeficit: totalTank,
            circuitFeasible: false,
            phase: 'deficit_reset',
          },
        });

        startStation = nextStart;
        currTank = 0;
      }
    }

    // Final result frame
    const feasible = totalTank >= 0;
    const finalStart = feasible ? startStation : -1;

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 10,
      isMilestone: true,
      milestoneTitle: feasible ? `Optimal Start: Station #${finalStart}` : 'Circuit Impossible (Total Deficit)',
      explanation: feasible
        ? `Total net gas across circuit is ${totalTank} >= 0. Station #${finalStart} can complete the entire clockwise loop!`
        : `Total gas across entire circuit is negative (${totalTank} < 0). Insufficient fuel to complete circuit from any station (returns -1).`,
      variables: { overallNetGas: totalTank, optimalStartingStation: finalStart, feasible: String(feasible) },
      callStack: [
        { name: 'complete()', params: { result: finalStart }, line: 10, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        gas,
        cost,
        currentIndex: n,
        startCandidate: finalStart,
        currentTank: currTank,
        totalDeficit: totalTank,
        circuitFeasible: feasible,
        phase: 'completed',
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<GasStationState>) => {
    const { gas, cost, currentIndex, startCandidate, currentTank, totalDeficit, circuitFeasible, phase } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Candidate Start: <strong className="text-white">#{startCandidate}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Current Tank: <strong className="text-white">{currentTank} units</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-400">
              Net Deficit: <strong className="text-white">{totalDeficit}</strong>
            </div>
          </div>

          {phase === 'completed' && (
            <div
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                circuitFeasible
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              }`}
            >
              {circuitFeasible ? `START AT STATION #${startCandidate}` : 'NO VALID START (-1)'}
            </div>
          )}
        </div>

        {/* Circular Route Stations */}
        <div className="w-full flex flex-col gap-4 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>CIRCULAR GAS STATIONS (0 ➔ N-1 ➔ 0)</span>
            <span>Fuel Net: gas[i] - cost[i]</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {gas.map((g, idx) => {
              const c = cost[idx];
              const net = g - c;
              const isCurrent = idx === currentIndex;
              const isStart = idx === startCandidate;

              return (
                <div
                  key={idx}
                  className={`relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                      : isStart
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {isStart && (
                    <span className="absolute -top-3 px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-emerald-500 text-slate-950">
                      START
                    </span>
                  )}
                  {isCurrent && !isStart && (
                    <span className="absolute -top-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950">
                      CURRENT
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-slate-500 font-bold mb-1">STATION #{idx}</span>
                  <div className="text-sm font-mono text-slate-300 mb-1">
                    Gas: <strong className="text-emerald-400">+{g}</strong> | Cost: <strong className="text-rose-400">-{c}</strong>
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Net: {net >= 0 ? `+${net}` : net}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
