import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface GraphColoringState {
  nodes: string[];
  edges: { u: string; v: string }[];
  degrees: Record<string, number>;
  sortedOrder: string[];
  colors: Record<string, number>; // node -> colorId (0, 1, 2, ...)
  activeNode: string | null;
  currentColor: number;
}

const COLOR_PALETTE = [
  { name: 'Emerald', fill: '#10b981', border: '#059669', text: '#022c22' },
  { name: 'Cyan', fill: '#06b6d4', border: '#0891b2', text: '#083344' },
  { name: 'Amber', fill: '#f59e0b', border: '#d97706', text: '#451a03' },
  { name: 'Rose', fill: '#f43f5e', border: '#e11d48', text: '#4c0519' },
  { name: 'Purple', fill: '#a855f7', border: '#9333ea', text: '#3b0764' },
  { name: 'Blue', fill: '#3b82f6', border: '#2563eb', text: '#172554' },
];

export const graphColoringModule: AlgorithmModule<
  { nodes: string[]; edges: { u: string; v: string }[] },
  GraphColoringState
> = {
  id: 'graph-coloring',
  title: 'Graph Coloring (Greedy Welsh-Powell Algorithm O(V^2 + E))',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V log V + E)',
    timeAverage: 'O(V^2 + E)',
    timeWorst: 'O(V^2 + E)',
    spaceAuxiliary: 'O(V + E) for adjacency graph and degree table',
    worstCaseCondition: 'Dense graphs where checking neighbor colors takes O(V) per vertex',
  },
  theory: {
    overview:
      'Graph Coloring assigns colors to the vertices of an undirected graph such that no two adjacent vertices share the same color. The objective is to minimize the total number of colors used (chromatic number).',
    whyItWorks:
      'Welsh-Powell sorts vertices by descending degrees (highest degree vertices are most constrained). For each color c = 0, 1, 2..., it greedily assigns color c to the first uncolored vertex and then to every subsequent non-adjacent uncolored vertex in sorted order.',
    invariant:
      'Proper Coloring Invariant: For every edge (u, v) in E, if both u and v are colored, color(u) != color(v).',
    pitfalls: [
      'Greedy heuristics do not guarantee the minimum chromatic number for general graphs (optimal graph coloring is NP-hard).',
      'Forgetting that edges are undirected, requiring neighbor checks in both directions.',
    ],
  },
  presets: [
    {
      id: 'petersen-subgraph',
      label: 'Bipartite / Cycle: 5-Cycle Pentagon',
      description: 'Odd cycle C_5 requires exactly 3 colors',
      data: {
        nodes: ['A', 'B', 'C', 'D', 'E'],
        edges: [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'A' },
        ],
      },
    },
    {
      id: 'wheel-graph',
      label: 'Wheel Graph W_5: Central Hub with 4-Cycle',
      description: 'Hub node connects to all perimeter vertices',
      data: {
        nodes: ['Hub', '1', '2', '3', '4'],
        edges: [
          { u: 'Hub', v: '1' },
          { u: 'Hub', v: '2' },
          { u: 'Hub', v: '3' },
          { u: 'Hub', v: '4' },
          { u: '1', v: '2' },
          { u: '2', v: '3' },
          { u: '3', v: '4' },
          { u: '4', v: '1' },
        ],
      },
    },
  ],
  defaultInput: {
    nodes: ['A', 'B', 'C', 'D', 'E'],
    edges: [
      { u: 'A', v: 'B' },
      { u: 'B', v: 'C' },
      { u: 'C', v: 'D' },
      { u: 'D', v: 'E' },
      { u: 'E', v: 'A' },
    ],
  },
  codeSnippets: {
    cpp: `vector<int> welshPowell(int V, vector<pair<int,int>>& edges) {
    vector<vector<int>> adj(V);
    vector<int> deg(V, 0);
    for (auto& [u, v] : edges) {
        adj[u].push_back(v); adj[v].push_back(u);
        deg[u]++; deg[v]++;
    }
    vector<int> order(V);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) { return deg[a] > deg[b]; });
    vector<int> color(V, -1);
    int currentColor = 0;
    for (int u : order) {
        if (color[u] != -1) continue;
        color[u] = currentColor;
        for (int v : order) {
            if (color[v] == -1) {
                bool conflict = false;
                for (int nb : adj[v]) if (color[nb] == currentColor) conflict = true;
                if (!conflict) color[v] = currentColor;
            }
        }
        currentColor++;
    }
    return color;
}`,
    python: `def welsh_powell(nodes: list[str], edges: list[tuple[str, str]]) -> dict[str, int]:
    adj = {u: set() for u in nodes}
    for u, v in edges:
        adj[u].add(v); adj[v].add(u)
    order = sorted(nodes, key=lambda u: len(adj[u]), reverse=True)
    color = {}
    current_color = 0
    for u in order:
        if u in color: continue
        color[u] = current_color
        for v in order:
            if v not in color and not any(color.get(nb) == current_color for nb in adj[v]):
                color[v] = current_color
        current_color += 1
    return color`,
    typescript: `function welshPowell(nodes: string[], edges: { u: string; v: string }[]): Record<string, number> {
  const adj = new Map<string, Set<string>>();
  nodes.forEach(u => adj.set(u, new Set()));
  edges.forEach(({ u, v }) => {
    adj.get(u)!.add(v);
    adj.get(v)!.add(u);
  });
  const order = [...nodes].sort((a, b) => adj.get(b)!.size - adj.get(a)!.size);
  const color: Record<string, number> = {};
  let currentColor = 0;
  for (const u of order) {
    if (color[u] !== undefined) continue;
    color[u] = currentColor;
    for (const v of order) {
      if (color[v] === undefined) {
        const conflict = Array.from(adj.get(v)!).some(nb => color[nb] === currentColor);
        if (!conflict) color[v] = currentColor;
      }
    }
    currentColor++;
  }
  return color;
}`,
    java: `public Map<String, Integer> welshPowell(List<String> nodes, List<int[]> edges) {
    Map<String, Set<String>> adj = new HashMap<>();
    for (String u : nodes) adj.put(u, new HashSet<>());
    List<String> order = new ArrayList<>(nodes);
    order.sort((a, b) -> adj.get(b).size() - adj.get(a).size());
    Map<String, Integer> color = new HashMap<>();
    int currentColor = 0;
    for (String u : order) {
        if (color.containsKey(u)) continue;
        color.put(u, currentColor);
        for (String v : order) {
            if (!color.containsKey(v)) {
                boolean conflict = false;
                for (String nb : adj.get(v)) if (color.getOrDefault(nb, -1) == currentColor) conflict = true;
                if (!conflict) color.put(v, currentColor);
            }
        }
        currentColor++;
    }
    return color;
}`,
    pseudocode: `function welshPowell(nodes, edges):
    compute degree(v) for all v in nodes
    order = sort nodes by degree descending
    color = map all vertices to UNCOLORED
    currentColor = 0
    for u in order:
        if u is UNCOLORED:
            color[u] = currentColor
            for v in order:
                if v is UNCOLORED and no neighbor of v has currentColor:
                    color[v] = currentColor
            currentColor++
    return color`,
  },
  generateTimeline: (input: {
    nodes: string[];
    edges: { u: string; v: string }[];
  }): ExecutionFrame<GraphColoringState>[] => {
    const rawNodes = input?.nodes?.length ? input.nodes : ['A', 'B', 'C', 'D', 'E'];
    const rawEdges = input?.edges?.length
      ? input.edges
      : [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'A' },
        ];

    const frames: ExecutionFrame<GraphColoringState>[] = [];
    const adj = new Map<string, Set<string>>();
    rawNodes.forEach((u: string) => adj.set(u, new Set()));
    rawEdges.forEach(({ u, v }: { u: string; v: string }) => {
      adj.get(u)?.add(v);
      adj.get(v)?.add(u);
    });

    const degrees: Record<string, number> = {};
    rawNodes.forEach((u: string) => {
      degrees[u] = adj.get(u)?.size || 0;
    });

    const sortedOrder = [...rawNodes].sort((a, b) => degrees[b] - degrees[a]);
    const colors: Record<string, number> = {};

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      isMilestone: true,
      milestoneTitle: 'Compute Degrees & Sort Descending',
      action: 'INIT_DEGREE_SORT',
      state: {
        nodes: rawNodes,
        edges: rawEdges,
        degrees: { ...degrees },
        sortedOrder: [...sortedOrder],
        colors: {},
        activeNode: null,
        currentColor: 0,
      },
      callStack: [{ name: 'welshPowell', params: { nodeCount: rawNodes.length, edgeCount: rawEdges.length }, line: 1, isCurrent: true }],
      variables: {
        sortedOrder: sortedOrder.map((u) => `${u}(deg ${degrees[u]})`).join(', '),
        status: 'Degrees sorted descending',
      },
      conditionEval: { expr: 'nodes.length > 0', result: true },
      soundCue: { type: 'step' },
      explanation: `Computed degrees and sorted vertices in descending order: [${sortedOrder.map((u) => `${u}: ${degrees[u]}`).join(', ')}]. Vertices with highest degrees are prioritized because they are most constrained.`,
    });

    let currentColor = 0;
    for (const u of sortedOrder) {
      if (colors[u] !== undefined) continue;

      const paletteEntry = COLOR_PALETTE[currentColor % COLOR_PALETTE.length];
      colors[u] = currentColor;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 8,
        isMilestone: true,
        milestoneTitle: `Start Color #${currentColor} (${paletteEntry.name}) with ${u}`,
        action: 'COLOR_PRIMARY_VERTEX',
        state: {
          nodes: rawNodes,
          edges: rawEdges,
          degrees: { ...degrees },
          sortedOrder: [...sortedOrder],
          colors: { ...colors },
          activeNode: u,
          currentColor,
        },
        callStack: [{ name: 'welshPowell', params: { vertex: u, color: paletteEntry.name, colorId: currentColor }, line: 8, isCurrent: true }],
        variables: {
          activeNode: u,
          assignedColor: paletteEntry.name,
          colorId: currentColor,
          degree: degrees[u],
        },
        conditionEval: { expr: `colors['${u}'] === undefined`, result: true },
        soundCue: { type: 'select' },
        explanation: `Assigned Color ${currentColor} (${paletteEntry.name}) to uncolored vertex ${u} with highest degree (${degrees[u]}). Now scanning remaining vertices for non-adjacent candidates.`,
      });

      for (const v of sortedOrder) {
        if (colors[v] === undefined) {
          const neighbors = Array.from(adj.get(v) || []);
          const conflictingNeighbor = neighbors.find((nb) => colors[nb] === currentColor);
          const hasConflict = conflictingNeighbor !== undefined;

          if (hasConflict) {
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 11,
              action: 'CHECK_CONFLICT',
              state: {
                nodes: rawNodes,
                edges: rawEdges,
                degrees: { ...degrees },
                sortedOrder: [...sortedOrder],
                colors: { ...colors },
                activeNode: v,
                currentColor,
              },
              callStack: [{ name: 'checkConflict', params: { vertex: v, color: paletteEntry.name }, line: 11, isCurrent: true }],
              variables: {
                candidateNode: v,
                conflictFoundWith: conflictingNeighbor,
                colorChecked: paletteEntry.name,
              },
              conditionEval: { expr: `hasNeighborWithColor('${v}', ${paletteEntry.name})`, result: true },
              soundCue: { type: 'compare' },
              explanation: `Cannot color vertex ${v} with ${paletteEntry.name}: neighbor ${conflictingNeighbor} already has color ${paletteEntry.name}.`,
            });
          } else {
            colors[v] = currentColor;
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 13,
              isMilestone: true,
              milestoneTitle: `Assigned ${paletteEntry.name} to ${v}`,
              action: 'COLOR_GREEDY_PASS',
              state: {
                nodes: rawNodes,
                edges: rawEdges,
                degrees: { ...degrees },
                sortedOrder: [...sortedOrder],
                colors: { ...colors },
                activeNode: v,
                currentColor,
              },
              callStack: [{ name: 'welshPowell', params: { vertex: v, color: paletteEntry.name, colorId: currentColor }, line: 13, isCurrent: true }],
              variables: {
                activeNode: v,
                assignedColor: paletteEntry.name,
                reason: `No conflict with existing ${paletteEntry.name} vertices`,
              },
              conditionEval: { expr: `hasNeighborWithColor('${v}', ${paletteEntry.name})`, result: false },
              soundCue: { type: 'swap' },
              explanation: `Vertex ${v} has NO neighbors colored with ${paletteEntry.name}. Greedily assigned color ${currentColor} (${paletteEntry.name}).`,
            });
          }
        }
      }

      currentColor++;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      isMilestone: true,
      milestoneTitle: `Coloring Finished: ${currentColor} Colors`,
      action: 'COMPLETE',
      state: {
        nodes: rawNodes,
        edges: rawEdges,
        degrees: { ...degrees },
        sortedOrder: [...sortedOrder],
        colors: { ...colors },
        activeNode: null,
        currentColor,
      },
      callStack: [{ name: 'welshPowell', params: { totalColorsUsed: currentColor, status: 'DONE' }, line: 18, isCurrent: true }],
      variables: {
        totalColorsUsed: currentColor,
        chromaticEstimate: currentColor,
        status: 'Proper coloring achieved (0 adjacent conflicts)',
      },
      conditionEval: { expr: 'allVerticesColored && noAdjacentConflicts', result: true },
      soundCue: { type: 'complete' },
      explanation: `Graph coloring complete! Successfully colored all ${rawNodes.length} vertices using ${currentColor} colors with zero adjacent conflicts.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<GraphColoringState>) => {
    const { nodes, edges, degrees, sortedOrder, colors, activeNode, currentColor } = frame.state;
    const n = nodes.length;
    const radius = 130;
    const centerX = 200;
    const centerY = 170;

    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((u, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      positions[u] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Status banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Current Color Pass:</span>
            {currentColor < COLOR_PALETTE.length ? (
              <span
                className="px-2.5 py-0.5 rounded text-xs font-bold font-mono border"
                style={{
                  backgroundColor: `${COLOR_PALETTE[currentColor % COLOR_PALETTE.length].fill}25`,
                  borderColor: COLOR_PALETTE[currentColor % COLOR_PALETTE.length].fill,
                  color: COLOR_PALETTE[currentColor % COLOR_PALETTE.length].fill,
                }}
              >
                Color {currentColor} ({COLOR_PALETTE[currentColor % COLOR_PALETTE.length].name})
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-400 font-bold">Done ({currentColor} Colors)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Colored Vertices:</span>
            <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              {Object.keys(colors).length} / {nodes.length}
            </span>
          </div>
        </div>

        {/* Graph SVG Stage */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-around gap-6 w-full">
          <svg width="400" height="340" className="overflow-visible">
            {/* Edges */}
            {edges.map((e, idx) => {
              const p1 = positions[e.u];
              const p2 = positions[e.v];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={idx}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#334155"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Vertices */}
            {nodes.map((u) => {
              const p = positions[u];
              const cId = colors[u];
              const hasColor = cId !== undefined;
              const palette = hasColor ? COLOR_PALETTE[cId % COLOR_PALETTE.length] : null;
              const isActive = activeNode === u;

              return (
                <g key={u} className="cursor-pointer transition-transform duration-200">
                  {/* Glow circle if active */}
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="30"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="22"
                    fill={hasColor ? palette!.fill : '#0f172a'}
                    stroke={isActive ? '#fbbf24' : hasColor ? palette!.border : '#475569'}
                    strokeWidth="3"
                    className="transition-colors duration-300"
                  />
                  <text
                    x={p.x}
                    y={p.y + 5}
                    textAnchor="middle"
                    fill={hasColor ? palette!.text : '#f1f5f9'}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {u}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 27}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    deg:{degrees[u]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Sorted Order & Color Map Table */}
          <div className="flex flex-col gap-2 w-full md:w-64">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Welsh-Powell Degree Order:
            </span>
            <div className="flex flex-col gap-1.5">
              {sortedOrder.map((u) => {
                const cId = colors[u];
                const hasColor = cId !== undefined;
                const palette = hasColor ? COLOR_PALETTE[cId % COLOR_PALETTE.length] : null;
                const isActive = activeNode === u;

                return (
                  <div
                    key={u}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono border transition-all ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : hasColor
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{u}</span>
                      <span className="text-slate-500">(deg {degrees[u]})</span>
                    </div>
                    {hasColor ? (
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          backgroundColor: `${palette!.fill}30`,
                          color: palette!.fill,
                        }}
                      >
                        {palette!.name}
                      </span>
                    ) : (
                      <span className="text-slate-600">Uncolored</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
};
