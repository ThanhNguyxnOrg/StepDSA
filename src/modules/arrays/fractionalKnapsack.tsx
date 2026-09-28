import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface KnapsackItem {
  id: string;
  weight: number;
  value: number;
  density: number; // value / weight
  takenFraction: number; // 0 to 1
  status: 'pending' | 'inspecting' | 'taken' | 'partial' | 'skipped';
}

export interface FractionalKnapsackState {
  items: KnapsackItem[];
  currentIndex: number;
  capacity: number;
  remainingCapacity: number;
  totalValue: number;
}

export const fractionalKnapsackModule: AlgorithmModule<
  { items: { value: number; weight: number }[]; capacity: number },
  FractionalKnapsackState
> = {
  id: 'fractional-knapsack',
  title: 'Fractional Knapsack (Greedy Density Sort O(N log N))',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N log N)',
    timeAverage: 'O(N log N)',
    timeWorst: 'O(N log N)',
    spaceAuxiliary: 'O(N)',
    worstCaseCondition: 'Dominated by sorting items by unit density value/weight',
  },
  theory: {
    overview:
      'Given items with given weights and values, compute the maximum total value obtainable in a knapsack of capacity W. Fractions of items may be taken.',
    whyItWorks:
      'Unlike the 0/1 Knapsack problem (which requires Dynamic Programming because items are indivisible), the Fractional Knapsack exhibits the Greedy-Choice Property: selecting as much of the item with the highest density (value/weight) is mathematically optimal.',
    invariant:
      'Greedy Density Invariant: At any step, every item fully or partially packed has unit density >= any item remaining outside.',
    pitfalls: [
      'Applying greedy density sorting to 0/1 Knapsack (which fails to yield the optimal integer solution).',
      'Floating-point precision rounding errors when computing fractional gains.',
    ],
  },
  presets: [
    {
      id: 'classic-density',
      label: 'Standard Items (W=50)',
      description: 'Values: [60, 100, 120], Weights: [10, 20, 30], W=50',
      data: {
        items: [
          { value: 60, weight: 10 },
          { value: 100, weight: 20 },
          { value: 120, weight: 30 },
        ],
        capacity: 50,
      },
    },
    {
      id: 'fraction-exact',
      label: 'Partial Fraction Cut (W=60)',
      description: 'Density sorts and takes 2 full items + 2/3 of 3rd item',
      data: {
        items: [
          { value: 280, weight: 40 },
          { value: 100, weight: 10 },
          { value: 120, weight: 20 },
          { value: 120, weight: 24 },
        ],
        capacity: 60,
      },
    },
  ],
  defaultInput: {
    items: [
      { value: 60, weight: 10 },
      { value: 100, weight: 20 },
      { value: 120, weight: 30 },
    ],
    capacity: 50,
  },
  codeSnippets: {
    python: `def fractional_knapsack(items, capacity):
    # Sort descending by unit density (value / weight)
    items.sort(key=lambda x: x['value'] / x['weight'], reverse=True)
    total_val = 0.0
    for item in items:
        if capacity == 0: break
        if item['weight'] <= capacity:
            capacity -= item['weight']
            total_val += item['value']
        else:
            fraction = capacity / item['weight']
            total_val += item['value'] * fraction
            capacity = 0
    return total_val`,
    typescript: `function fractionalKnapsack(items: { value: number; weight: number }[], capacity: number): number {
  items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
  let totalValue = 0;
  let remCap = capacity;
  for (const item of items) {
    if (remCap === 0) break;
    if (item.weight <= remCap) {
      remCap -= item.weight;
      totalValue += item.value;
    } else {
      totalValue += item.value * (remCap / item.weight);
      remCap = 0;
    }
  }
  return totalValue;
}`,
    cpp: `double fractionalKnapsack(vector<pair<int, int>>& items, int W) {
    // items: pair<value, weight>
    sort(items.begin(), items.end(), [](const auto& a, const auto& b) {
        return (double)a.first / a.second > (double)b.first / b.second;
    });
    double totalVal = 0.0;
    for (const auto& item : items) {
        if (W <= 0) break;
        if (item.second <= W) {
            W -= item.second;
            totalVal += item.first;
        } else {
            totalVal += item.first * ((double)W / item.second);
            W = 0;
        }
    }
    return totalVal;
}`,
    java: `public double fractionalKnapsack(int[] val, int[] wt, int capacity) {
    int n = val.length;
    Integer[] idx = new Integer[n];
    for (int i = 0; i < n; i++) idx[i] = i;
    Arrays.sort(idx, (a, b) -> Double.compare((double)val[b] / wt[b], (double)val[a] / wt[a]));
    double totalVal = 0.0;
    int rem = capacity;
    for (int i : idx) {
        if (rem == 0) break;
        if (wt[i] <= rem) {
            rem -= wt[i];
            totalVal += val[i];
        } else {
            totalVal += val[i] * ((double)rem / wt[i]);
            rem = 0;
        }
    }
    return totalVal;
}`,
    pseudocode: `function fractionalKnapsack(items, capacity):
    sort items descending by (value / weight)
    totalValue = 0, remaining = capacity
    for item in items:
        if remaining == 0: break
        if item.weight <= remaining:
            remaining -= item.weight
            totalValue += item.value
            item.taken = 1.0
        else:
            fraction = remaining / item.weight
            totalValue += item.value * fraction
            remaining = 0
            item.taken = fraction
    return totalValue`,
  },

  generateTimeline: (input: {
    items: { value: number; weight: number }[];
    capacity: number;
  }): ExecutionFrame<FractionalKnapsackState>[] => {
    const rawItems = input.items.length > 0
      ? input.items
      : [
          { value: 60, weight: 10 },
          { value: 100, weight: 20 },
          { value: 120, weight: 30 },
        ];
    const capacity = Math.max(1, input.capacity || 50);

    // Compute densities and sort descending
    const sorted: KnapsackItem[] = rawItems
      .map((it, idx) => ({
        id: `item-${idx}`,
        weight: it.weight,
        value: it.value,
        density: Number((it.value / it.weight).toFixed(2)),
        takenFraction: 0,
        status: 'pending' as KnapsackItem['status'],
      }))
      .sort((a, b) => b.density - a.density);

    const frames: ExecutionFrame<FractionalKnapsackState>[] = [];

    // Step 0: Initial Frame
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Sorted ${sorted.length} items descending by unit value density (value / weight). Knapsack capacity: ${capacity}.`,
      variables: {
        capacity,
        totalItems: sorted.length,
        highestDensity: sorted[0]?.density ?? 0,
      },
      callStack: [
        { name: `fractionalKnapsack(items, ${capacity})`, params: { capacity, n: sorted.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        items: sorted.map((it) => ({ ...it })),
        currentIndex: -1,
        capacity,
        remainingCapacity: capacity,
        totalValue: 0,
      },
    });

    let currentCapacity = capacity;
    let accumulatedValue = 0;

    for (let i = 0; i < sorted.length; i++) {
      const it = sorted[i];

      // Inspecting item
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 5,
        explanation: `Inspecting item #${i} (val: $${it.value}, wt: ${it.weight}kg, density: $${it.density}/kg). Remaining capacity: ${currentCapacity}kg.`,
        variables: {
          item: i,
          value: it.value,
          weight: it.weight,
          density: it.density,
          remainingCapacity: currentCapacity,
        },
        callStack: [
          { name: `processItem(${it.value}, ${it.weight})`, params: { value: it.value, wt: it.weight, rem: currentCapacity }, line: 5, isCurrent: true },
          { name: 'main()', params: {}, line: 1 },
        ],
        state: {
          items: sorted.map((item, idx) => ({
            ...item,
            status: idx === i ? 'inspecting' : item.status,
          })),
          currentIndex: i,
          capacity,
          remainingCapacity: currentCapacity,
          totalValue: Number(accumulatedValue.toFixed(2)),
        },
      });

      if (currentCapacity === 0) {
        it.status = 'skipped';
        continue;
      }

      if (it.weight <= currentCapacity) {
        // Take 100%
        currentCapacity -= it.weight;
        accumulatedValue += it.value;
        it.takenFraction = 1.0;
        it.status = 'taken';

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 8,
          isMilestone: true,
          milestoneTitle: `Packed 100% of Item #${i}`,
          explanation: `Weight ${it.weight}kg fits entirely in remaining capacity (${currentCapacity + it.weight}kg). Packed 100%. Gained +$${it.value}.`,
          variables: {
            fraction: '100%',
            weightUsed: it.weight,
            gainedVal: it.value,
            remCap: currentCapacity,
            totVal: Number(accumulatedValue.toFixed(2)),
          },
          callStack: [
            { name: `takeFullItem(${it.value})`, params: { val: it.value, rem: currentCapacity }, line: 8, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            items: sorted.map((item) => ({ ...item })),
            currentIndex: i,
            capacity,
            remainingCapacity: currentCapacity,
            totalValue: Number(accumulatedValue.toFixed(2)),
          },
        });
      } else {
        // Take fraction
        const frac = currentCapacity / it.weight;
        const gain = it.value * frac;
        accumulatedValue += gain;
        it.takenFraction = Number(frac.toFixed(2));
        it.status = 'partial';
        currentCapacity = 0;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          isMilestone: true,
          milestoneTitle: `Packed ${(frac * 100).toFixed(1)}% of Item #${i}`,
          explanation: `Knapsack cannot fit entire ${it.weight}kg. Sliced fraction (${(frac * 100).toFixed(1)}%). Added +$${gain.toFixed(2)} to reach full knapsack capacity.`,
          variables: {
            fraction: `${(frac * 100).toFixed(1)}%`,
            gainedVal: Number(gain.toFixed(2)),
            totVal: Number(accumulatedValue.toFixed(2)),
            remCap: 0,
          },
          callStack: [
            { name: `takeFraction(${(frac * 100).toFixed(1)}%)`, params: { gain: gain.toFixed(2), frac: frac.toFixed(2) }, line: 12, isCurrent: true },
            { name: 'main()', params: {}, line: 1 },
          ],
          state: {
            items: sorted.map((item) => ({ ...item })),
            currentIndex: i,
            capacity,
            remainingCapacity: 0,
            totalValue: Number(accumulatedValue.toFixed(2)),
          },
        });
      }
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 14,
      isMilestone: true,
      milestoneTitle: 'Knapsack Max Value Reached',
      explanation: `Greedy selection completed. Maximum achievable profit: $${accumulatedValue.toFixed(2)} with knapsack capacity utilization ${capacity - currentCapacity}/${capacity}kg.`,
      variables: {
        optimalValue: `$${accumulatedValue.toFixed(2)}`,
        capacityUsed: `${capacity - currentCapacity}/${capacity} kg`,
      },
      callStack: [
        { name: 'complete()', params: { total: accumulatedValue.toFixed(2) }, line: 14, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        items: sorted.map((item) => ({ ...item })),
        currentIndex: sorted.length,
        capacity,
        remainingCapacity: currentCapacity,
        totalValue: Number(accumulatedValue.toFixed(2)),
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<FractionalKnapsackState>) => {
    const { items, currentIndex, capacity, remainingCapacity, totalValue } = frame.state;
    const usedCapacity = capacity - remainingCapacity;
    const usedPercent = Math.min(100, (usedCapacity / capacity) * 100);

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Capacity: <strong className="text-white">{usedCapacity} / {capacity} kg</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Total Value: <strong className="text-white">${totalValue.toFixed(2)}</strong>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Rem. Cap: <strong className="text-amber-400">{remainingCapacity} kg</strong>
          </div>
        </div>

        {/* Capacity Gauge Bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Knapsack Volume Fill</span>
            <span className="font-bold text-cyan-400">{usedPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-4 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>

        {/* Item Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 my-auto">
          {items.map((item, idx) => {
            const isCurrent = idx === currentIndex;
            const isTaken = item.status === 'taken';
            const isPartial = item.status === 'partial';

            return (
              <div
                key={item.id}
                className={`relative flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-105'
                    : isTaken
                    ? 'bg-emerald-950/30 border-emerald-500/60'
                    : isPartial
                    ? 'bg-amber-950/30 border-amber-500/60'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Fraction Badge */}
                {item.takenFraction > 0 && (
                  <div
                    className={`absolute -top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isTaken
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    }`}
                  >
                    {(item.takenFraction * 100).toFixed(0)}% TAKEN
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400">ITEM #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 text-[10px] font-mono font-bold">
                    ${item.density}/kg
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <div className="text-2xl font-bold font-mono text-white">${item.value}</div>
                  <div className="text-sm font-mono text-slate-400">{item.weight} kg</div>
                </div>

                {/* Fill Indicator */}
                <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isTaken ? 'bg-emerald-400' : isPartial ? 'bg-amber-400' : 'bg-transparent'
                    }`}
                    style={{ width: `${item.takenFraction * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
