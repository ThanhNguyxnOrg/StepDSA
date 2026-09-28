import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface UnboundedItem {
  id: string;
  name: string;
  weight: number;
  value: number;
}

export interface UnboundedKnapsackState {
  items: UnboundedItem[];
  capacity: number;
  dp: number[]; // dp[w] = max value with capacity w
  currentCapacity: number;
  currentItemIndex: number;
  itemChoiceCount: Record<string, number>;
  optimalItems: string[];
}

export const unboundedKnapsackModule: AlgorithmModule<
  { items: { name: string; weight: number; value: number }[]; capacity: number },
  UnboundedKnapsackState
> = {
  id: 'unbounded-knapsack',
  title: 'Unbounded Knapsack (Repetitive Choice 1D DP O(N * W))',
  category: 'dynamic-programming',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N * W)',
    timeAverage: 'O(N * W)',
    timeWorst: 'O(N * W)',
    spaceAuxiliary: 'O(W) rolling array',
    worstCaseCondition: 'Items can be reused an unbounded number of times to maximize value',
  },
  theory: {
    overview:
      'Given a knapsack of capacity W and N items each with a weight and a value, find the maximum value obtainable by packing items into the knapsack where each item can be chosen ANY number of times (unbounded supply).',
    whyItWorks:
      'In contrast to 0/1 Knapsack (which iterates capacity backwards to prevent reusing the same item), Unbounded Knapsack iterates capacity FORWARD: dp[w] = max(dp[w], dp[w - weight[i]] + value[i]). Since dp[w - weight[i]] already incorporates choices made for item i, multiple copies of item i can be chosen consecutively.',
    invariant:
      'Forward Rolling Invariant: For any weight w, dp[w] stores the optimal value achievable using any combination of items (including multiple instances of the same item) summing to at most w.',
    pitfalls: [
      'Iterating capacity backwards (which reduces the problem to 0/1 Knapsack where each item can only be picked once).',
      'Items with weight 0 causing infinite loops.',
    ],
  },
  presets: [
    {
      id: 'coin-density',
      label: 'Standard: W = 10, 3 Items',
      description: 'Items: A (wt 2, val 5), B (wt 3, val 8), C (wt 5, val 14)',
      data: {
        items: [
          { name: 'A', weight: 2, value: 5 },
          { name: 'B', weight: 3, value: 8 },
          { name: 'C', weight: 5, value: 14 },
        ],
        capacity: 10,
      },
    },
    {
      id: 'high-density-light',
      label: 'Dominant Light Item: W = 8',
      description: 'Light item has highest density; taken repeatedly 4 times',
      data: {
        items: [
          { name: 'Gem', weight: 2, value: 7 },
          { name: 'Relic', weight: 4, value: 10 },
          { name: 'Armor', weight: 6, value: 15 },
        ],
        capacity: 8,
      },
    },
  ],
  defaultInput: {
    items: [
      { name: 'A', weight: 2, value: 5 },
      { name: 'B', weight: 3, value: 8 },
      { name: 'C', weight: 5, value: 14 },
    ],
    capacity: 10,
  },
  codeSnippets: {
    python: `def unboundedKnapsack(W, items):
    dp = [0] * (W + 1)
    for w in range(1, W + 1):
        for item in items:
            wt, val = item['weight'], item['value']
            if wt <= w:
                dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]`,
    typescript: `function unboundedKnapsack(capacity: number, items: { weight: number; value: number }[]): number {
  const dp: number[] = Array(capacity + 1).fill(0);
  for (let w = 1; w <= capacity; w++) {
    for (const item of items) {
      if (item.weight <= w) {
        dp[w] = Math.max(dp[w], dp[w - item.weight] + item.value);
      }
    }
  }
  return dp[capacity];
}`,
    cpp: `int unboundedKnapsack(int W, const vector<pair<int, int>>& items) {
    // items: pair<weight, value>
    vector<int> dp(W + 1, 0);
    for (int w = 1; w <= W; ++w) {
        for (const auto& it : items) {
            if (it.first <= w) {
                dp[w] = max(dp[w], dp[w - it.first] + it.second);
            }
        }
    }
    return dp[W];
}`,
    java: `public int unboundedKnapsack(int W, int[] wt, int[] val) {
    int[] dp = new int[W + 1];
    for (int w = 1; w <= W; w++) {
        for (int i = 0; i < wt.length; i++) {
            if (wt[i] <= w) {
                dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
            }
        }
    }
    return dp[W];
}`,
    pseudocode: `function unboundedKnapsack(W, items):
    dp = array of size W + 1 initialized to 0
    for w from 1 to W:
        for each item in items:
            if item.weight <= w:
                dp[w] = max(dp[w], dp[w - item.weight] + item.value)
    return dp[W]`,
  },

  generateTimeline: (input: {
    items: { name: string; weight: number; value: number }[];
    capacity: number;
  }): ExecutionFrame<UnboundedKnapsackState>[] => {
    const rawItems = input.items.length > 0 ? input.items : [
      { name: 'A', weight: 2, value: 5 },
      { name: 'B', weight: 3, value: 8 },
      { name: 'C', weight: 5, value: 14 },
    ];
    const capacity = Math.max(1, Math.min(input.capacity || 10, 15));

    const items: UnboundedItem[] = rawItems.map((it, idx) => ({
      id: `item-${idx}`,
      name: it.name || `Item${idx + 1}`,
      weight: it.weight,
      value: it.value,
    }));

    const dp: number[] = Array(capacity + 1).fill(0);
    const parentChoice: (number | null)[] = Array(capacity + 1).fill(null);

    const frames: ExecutionFrame<UnboundedKnapsackState>[] = [];

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize 1D DP table of size ${capacity + 1} with 0s. Evaluating optimal item combinations with replacement.`,
      variables: { capacity, itemCount: items.length, baseCase: 'dp[0] = 0' },
      callStack: [
        { name: `unboundedKnapsack(W=${capacity})`, params: { W: capacity, N: items.length }, line: 2, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        items,
        capacity,
        dp: [...dp],
        currentCapacity: 0,
        currentItemIndex: -1,
        itemChoiceCount: {},
        optimalItems: [],
      },
    });

    for (let w = 1; w <= capacity; w++) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const canFit = item.weight <= w;

        if (canFit) {
          const candidateVal = dp[w - item.weight] + item.value;
          const isBetter = candidateVal > dp[w];

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            explanation: `Capacity w = ${w}: Test item "${item.name}" (wt ${item.weight}, val $${item.value}). Candidate value = dp[${
              w - item.weight
            }] ($${dp[w - item.weight]}) + $${item.value} = $${candidateVal} vs current dp[${w}] = $${dp[w]}.`,
            variables: {
              currentWeight: w,
              testingItem: item.name,
              itemWt: item.weight,
              itemVal: item.value,
              candidateVal,
              currentBest: dp[w],
              improved: String(isBetter),
            },
            conditionEval: {
              expr: `dp[${w - item.weight}] + ${item.value} ($${candidateVal}) > dp[${w}] ($${dp[w]})`,
              result: isBetter,
            },
            callStack: [
              { name: `testItem("${item.name}", w=${w})`, params: { item: item.name, candidateVal, currentBest: dp[w] }, line: 6, isCurrent: true },
              { name: 'main()', params: {}, line: 1 },
            ],
            state: {
              items,
              capacity,
              dp: [...dp],
              currentCapacity: w,
              currentItemIndex: i,
              itemChoiceCount: {},
              optimalItems: [],
            },
          });

          if (isBetter) {
            dp[w] = candidateVal;
            parentChoice[w] = i;

            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 7,
              isMilestone: true,
              milestoneTitle: `Updated dp[${w}] = $${candidateVal}`,
              explanation: `New optimal value found for capacity ${w}! Pack item "${item.name}" to achieve max value $${candidateVal}.`,
              variables: { weightCap: w, newOptimalValue: candidateVal, chosenItem: item.name },
              callStack: [
                { name: `updateDP(w=${w})`, params: { val: candidateVal, item: item.name }, line: 7, isCurrent: true },
                { name: 'main()', params: {}, line: 1 },
              ],
              state: {
                items,
                capacity,
                dp: [...dp],
                currentCapacity: w,
                currentItemIndex: i,
                itemChoiceCount: {},
                optimalItems: [],
              },
            });
          }
        }
      }
    }

    // Reconstruct item choices
    const chosen: string[] = [];
    const choiceCounts: Record<string, number> = {};
    let remW = capacity;
    while (remW > 0 && parentChoice[remW] !== null) {
      const idx = parentChoice[remW]!;
      const it = items[idx];
      chosen.push(it.name);
      choiceCounts[it.name] = (choiceCounts[it.name] || 0) + 1;
      remW -= it.weight;
    }

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 8,
      isMilestone: true,
      milestoneTitle: `Max Value: $${dp[capacity]}`,
      explanation: `Optimization complete! Maximum profit for knapsack capacity ${capacity} is $${dp[capacity]}. Selected items: [${chosen.join(
        ', '
      )}].`,
      variables: {
        maxProfit: `$${dp[capacity]}`,
        itemsSelected: chosen.join(' + ') || 'None',
        totalItemsCount: chosen.length,
      },
      callStack: [
        { name: 'complete()', params: { totalVal: dp[capacity] }, line: 8, isCurrent: true },
        { name: 'main()', params: {}, line: 1 },
      ],
      state: {
        items,
        capacity,
        dp: [...dp],
        currentCapacity: capacity,
        currentItemIndex: -1,
        itemChoiceCount: choiceCounts,
        optimalItems: chosen,
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<UnboundedKnapsackState>) => {
    const { items, capacity, dp, currentCapacity, currentItemIndex, optimalItems } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        {/* Metric Badges */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Knapsack Capacity: <strong className="text-white">W = {capacity}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400">
              Optimal Max Value: <strong className="text-white">${dp[capacity]}</strong>
            </div>
          </div>

          {optimalItems.length > 0 && (
            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
              Packed: [{optimalItems.join(' + ')}]
            </div>
          )}
        </div>

        {/* 1D DP Array Strip */}
        <div className="w-full flex flex-col gap-3 my-auto p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>1D FORWARD ROLLING DP ARRAY (w = 0 .. {capacity})</span>
            <span className="text-cyan-400">Allows Multiple Copies of Same Item</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto p-3 bg-slate-900/60 rounded-2xl border border-slate-800">
            {dp.map((val, w) => {
              const isCurrent = w === currentCapacity;
              return (
                <div key={w} className="relative flex flex-col items-center shrink-0">
                  {isCurrent && (
                    <span className="absolute -top-6 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-slate-950 animate-bounce">
                      w
                    </span>
                  )}
                  <div
                    className={`w-12 h-14 rounded-2xl flex flex-col items-center justify-center font-mono transition-all duration-300 ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-105 font-bold'
                        : val > 0
                        ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold">${val}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono mt-1">w={w}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Item Catalog Cards */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {items.map((it, idx) => {
            const isSelected = idx === currentItemIndex;
            return (
              <div
                key={it.id}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 shadow-md scale-105'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <span className="text-xs font-mono font-bold text-white mb-1">Item {it.name}</span>
                <span className="text-[11px] font-mono text-cyan-400">Weight: {it.weight}</span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Value: ${it.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
