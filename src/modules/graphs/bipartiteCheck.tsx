import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BipartiteNode {
  id: number;
  label: string;
  x: number;
  y: number;
  color: 0 | 1 | 2; // 0 = uncolored, 1 = Cyan/Set A, 2 = Rose/Set B
  status: 'unvisited' | 'active' | 'conflict' | 'colored';
}

export interface BipartiteEdge {
  from: number;
  to: number;
  isConflict?: boolean;
}

export interface BipartiteState {
  nodes: BipartiteNode[];
  edges: BipartiteEdge[];
  isBipartite: boolean;
  conflictNode?: number;
}

export const bipartiteCheckModule: AlgorithmModule<
  { isOddCyclePreset: boolean },
  BipartiteState
> = {
  id: 'bipartite-check',
  title: 'Bipartite Graph Verification (2-Coloring via BFS)',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V)',
    worstCaseCondition: 'Traverses all vertices and edges in unweighted graph',
  },
  theory: {
    overview:
      'A graph is Bipartite if its vertices can be partitioned into two independent sets U and V such that every edge connects a vertex in U to one in V (i.e. no two vertices within the same set share an edge). Equivalently, a graph is bipartite if and only if it contains NO odd-length cycles.',
    whyItWorks:
      'We run BFS starting with color 1 on the source. Each neighbor must be assigned the opposite color (3 - color). If we ever encounter an adjacent neighbor that has already been assigned the same color as the current vertex, an odd-length cycle exists, proving the graph is non-bipartite.',
    invariant:
      '2-Coloring Invariant: For all traversed edges (u, v), color[u] != color[v].',
    pitfalls: [
      'Disconnected graphs: must ensure BFS outer loop visits every unvisited connected component.',
      'Odd cycle detection requires checking already-colored neighbors, not just uncolored ones.',
    ],
  },
  presets: [
    {
      id: 'bipartite-4cycle',
      label: 'Bipartite (4-Cycle C4)',
      description: 'Even cycle can be strictly 2-colored without conflict',
      data: { isOddCyclePreset: false },
    },
    {
      id: 'non-bipartite-triangle',
      label: 'Non-Bipartite (Triangle 3-Cycle)',
      description: 'Odd cycle forces adjacent nodes to share same color',
      data: { isOddCyclePreset: true },
    },
  ],
  defaultInput: { isOddCyclePreset: false },
  codeSnippets: {
    python: `from collections import deque

def is_bipartite(graph):
    color = {}
    for node in range(len(graph)):
        if node not in color:
            color[node] = 1
            q = deque([node])
            while q:
                curr = q.popleft()
                for neighbor in graph[curr]:
                    if neighbor not in color:
                        color[neighbor] = 3 - color[curr]
                        q.append(neighbor)
                    elif color[neighbor] == color[curr]:
                        return False # Odd cycle detected!
    return True`,
    typescript: `function isBipartite(graph: number[][]): boolean {
  const n = graph.length;
  const colors = new Array(n).fill(0); // 0: uncolored, 1: Set A, 2: Set B
  for (let i = 0; i < n; ++i) {
    if (colors[i] !== 0) continue;
    colors[i] = 1;
    const queue = [i];
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const v of graph[u]) {
        if (colors[v] === 0) {
          colors[v] = colors[u] === 1 ? 2 : 1;
          queue.push(v);
        } else if (colors[v] === colors[u]) {
          return false; // Conflict!
        }
      }
    }
  }
  return true;
}`,
    cpp: `bool isBipartite(const vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> color(n, 0);
    for (int i = 0; i < n; ++i) {
        if (color[i] != 0) continue;
        color[i] = 1;
        queue<int> q; q.push(i);
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : graph[u]) {
                if (color[v] == 0) {
                    color[v] = 3 - color[u];
                    q.push(v);
                } else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
    java: `public boolean isBipartite(int[][] graph) {
    int n = graph.length;
    int[] color = new int[n];
    for (int i = 0; i < n; i++) {
        if (color[i] != 0) continue;
        color[i] = 1;
        Queue<Integer> q = new LinkedList<>();
        q.add(i);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : graph[u]) {
                if (color[v] == 0) {
                    color[v] = 3 - color[u];
                    q.add(v);
                } else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
    pseudocode: `function isBipartite(graph):
    color <- map all vertices to 0
    for each vertex u in graph:
        if color[u] == 0:
            color[u] <- 1
            queue <- [u]
            while queue is not empty:
                curr <- dequeue(queue)
                for each neighbor v of curr:
                    if color[v] == 0:
                        color[v] <- 3 - color[curr]
                        enqueue(queue, v)
                    else if color[v] == color[curr]:
                        return false
    return true`,
  },
  generateTimeline: (input) => {
    const isOdd = input.isOddCyclePreset;

    // Define topology
    // Even (4-cycle C4): 0-1, 1-2, 2-3, 3-0
    // Odd (3-cycle triangle C3): 0-1, 1-2, 2-0, plus node 3 attached
    const nodes: BipartiteNode[] = isOdd
      ? [
          { id: 0, label: '0', x: 190, y: 35, color: 0, status: 'unvisited' },
          { id: 1, label: '1', x: 100, y: 130, color: 0, status: 'unvisited' },
          { id: 2, label: '2', x: 280, y: 130, color: 0, status: 'unvisited' },
          { id: 3, label: '3', x: 360, y: 65, color: 0, status: 'unvisited' },
        ]
      : [
          { id: 0, label: '0', x: 110, y: 40, color: 0, status: 'unvisited' },
          { id: 1, label: '1', x: 270, y: 40, color: 0, status: 'unvisited' },
          { id: 2, label: '2', x: 270, y: 130, color: 0, status: 'unvisited' },
          { id: 3, label: '3', x: 110, y: 130, color: 0, status: 'unvisited' },
        ];

    const edges: BipartiteEdge[] = isOdd
      ? [
          { from: 0, to: 1 },
          { from: 1, to: 2 },
          { from: 2, to: 0 },
          { from: 2, to: 3 },
        ]
      : [
          { from: 0, to: 1 },
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 3, to: 0 },
        ];

    const adj: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [] };
    edges.forEach((e) => {
      adj[e.from].push(e.to);
      adj[e.to].push(e.from);
    });

    const frames: ExecutionFrame<BipartiteState>[] = [];
    const colors: Record<number, 0 | 1 | 2> = { 0: 0, 1: 0, 2: 0, 3: 0 };

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 4,
      explanation: `Initialized Bipartite Verification on ${
        isOdd ? 'Triangle Graph with Odd Cycle' : '4-Cycle Bipartite Graph'
      }. All 4 vertices uncolored (Color 0).`,
      isMilestone: true,
      milestoneTitle: 'Bipartite Initialized',
      soundCue: { type: 'start' },
      variables: { totalNodes: nodes.length, totalEdges: edges.length, isOddPreset: isOdd },
      callStack: [{ name: 'isBipartite', params: { V: nodes.length }, line: 4, isCurrent: true }],
      conditionEval: { expr: `nodes.length > 0`, result: true },
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: [...edges],
        isBipartite: true,
      },
    });

    // Start BFS from node 0
    colors[0] = 1;
    const queue: number[] = [0];

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 6,
      explanation: 'Assigned Color 1 (Cyan / Set A) to starting vertex 0. Enqueued vertex 0.',
      isMilestone: true,
      milestoneTitle: 'Color Vertex 0: Cyan',
      soundCue: { type: 'step' },
      variables: { seedVertex: 0, assignedColor: 1, colorName: 'Cyan' },
      callStack: [{ name: 'bfsSeed', params: { u: 0, color: 1 }, line: 6, isCurrent: true }],
      conditionEval: { expr: `queue.length > 0`, result: true },
      state: {
        nodes: nodes.map((n) => ({
          ...n,
          color: colors[n.id],
          status: n.id === 0 ? 'active' : 'unvisited',
        })),
        edges: [...edges],
        isBipartite: true,
      },
    });

    let conflict = false;

    while (queue.length > 0 && !conflict) {
      const u = queue.shift()!;

      for (const v of adj[u]) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          explanation: `Inspecting edge (${u} ↔ ${v}). Vertex ${u} has Color ${colors[u]} (${
            colors[u] === 1 ? 'Cyan' : 'Rose'
          }).`,
          soundCue: { type: 'compare' },
          variables: { u, v, uColor: colors[u], vColor: colors[v] },
          callStack: [{ name: 'checkEdge', params: { u, v }, line: 10, isCurrent: true }],
          conditionEval: { expr: `color[${v}] == 0 (${colors[v] === 0})`, result: colors[v] === 0 },
          state: {
            nodes: nodes.map((n) => ({
              ...n,
              color: colors[n.id],
              status: n.id === u || n.id === v ? 'active' : 'colored',
            })),
            edges: [...edges],
            isBipartite: true,
          },
        });

        if (colors[v] === 0) {
          const nextColor = (colors[u] === 1 ? 2 : 1) as 1 | 2;
          colors[v] = nextColor;
          queue.push(v);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            explanation: `Vertex ${v} was uncolored. Assigned opposite Color ${nextColor} (${
              nextColor === 1 ? 'Cyan' : 'Rose'
            }) and enqueued.`,
            isMilestone: true,
            milestoneTitle: `Color Vertex ${v}: ${nextColor === 1 ? 'Cyan' : 'Rose'}`,
            soundCue: { type: 'swap' },
            variables: { vertex: v, color: nextColor, colorName: nextColor === 1 ? 'Cyan' : 'Rose' },
            callStack: [{ name: 'assignColor', params: { v, color: nextColor }, line: 12, isCurrent: true }],
            conditionEval: { expr: `color[${v}] == 0`, result: true },
            state: {
              nodes: nodes.map((n) => ({
                ...n,
                color: colors[n.id],
                status: 'colored',
              })),
              edges: [...edges],
              isBipartite: true,
            },
          });
        } else if (colors[v] === colors[u]) {
          conflict = true;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 15,
            explanation: `COLOR CONFLICT! Adjacent vertices ${u} and ${v} share identical Color ${colors[u]}! Graph contains an odd cycle and is NOT bipartite.`,
            isMilestone: true,
            milestoneTitle: 'Conflict Detected: Non-Bipartite',
            soundCue: { type: 'complete' },
            variables: { u, v, sharedColor: colors[u], isBipartite: false, conflict: true },
            callStack: [{ name: 'conflictDetected', params: { u, v, color: colors[u] }, line: 15, isCurrent: true }],
            conditionEval: { expr: `color[${v}] == color[${u}] (${colors[v]} == ${colors[u]})`, result: true },
            state: {
              nodes: nodes.map((n) => ({
                ...n,
                color: colors[n.id],
                status: n.id === u || n.id === v ? 'conflict' : 'colored',
              })),
              edges: edges.map((e) => ({
                ...e,
                isConflict:
                  (e.from === u && e.to === v) || (e.from === v && e.to === u),
              })),
              isBipartite: false,
              conflictNode: v,
            },
          });
          break;
        }
      }
    }

    if (!conflict) {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 18,
        explanation: 'BFS completed with zero color conflicts across all edges. Graph is strictly BIPARTITE (2-colorable)!',
        isMilestone: true,
        milestoneTitle: 'Graph is Bipartite',
        soundCue: { type: 'complete' },
        variables: { isBipartite: true, conflict: false },
        callStack: [{ name: 'bipartite.verified', params: { result: true }, line: 18, isCurrent: true }],
        conditionEval: { expr: `!conflict`, result: true },
        state: {
          nodes: nodes.map((n) => ({
            ...n,
            color: colors[n.id],
            status: 'colored',
          })),
          edges: [...edges],
          isBipartite: true,
        },
      });
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame: ExecutionFrame<BipartiteState>) => {
    const { nodes, edges, isBipartite } = frame.state;

    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        {/* HUD */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Set A (Cyan)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>Set B (Rose)</span>
          </div>
          <div
            className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
              isBipartite
                ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300'
                : 'border-rose-500 bg-rose-950/80 text-rose-300 animate-pulse'
            }`}
          >
            {isBipartite ? '✓ BIPARTITE' : '✗ NOT BIPARTITE (ODD CYCLE)'}
          </div>
        </div>

        {/* SVG Graph */}
        <svg viewBox="0 0 400 180" className="w-[420px] h-[200px] bg-slate-950/60 rounded-3xl border border-slate-800 p-2">
          {edges.map((e, idx) => {
            const u = nodes.find((n) => n.id === e.from);
            const v = nodes.find((n) => n.id === e.to);
            if (!u || !v) return null;
            return (
              <line
                key={`edge-${idx}`}
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                stroke={e.isConflict ? '#EF4444' : '#64748B'}
                strokeWidth={e.isConflict ? '4' : '2.5'}
                strokeDasharray={e.isConflict ? '4 2' : 'none'}
              />
            );
          })}

          {nodes.map((n) => {
            const fillColor =
              n.status === 'conflict'
                ? '#EF4444'
                : n.color === 1
                ? '#06B6D4'
                : n.color === 2
                ? '#F43F5E'
                : '#1E293B';

            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="18"
                  fill={fillColor}
                  stroke={n.status === 'conflict' ? '#FCA5A5' : '#FFFFFF'}
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fill={n.color === 0 ? '#FFFFFF' : '#000000'}
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  },
};
