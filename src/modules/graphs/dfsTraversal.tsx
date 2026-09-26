import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface DFSNode {
  id: number;
  label: string;
  x: number;
  y: number;
  status: 'unvisited' | 'visiting' | 'visited';
  discoveryTime?: number;
  finishTime?: number;
}

export interface DFSEdge {
  from: number;
  to: number;
  type: 'tree' | 'back' | 'forward' | 'cross' | 'default';
}

export interface DFSState {
  nodes: DFSNode[];
  edges: DFSEdge[];
  currentNode?: number;
  activePath: number[];
  cycleDetected?: boolean;
}

export interface DFSGraphInput {
  startNode: number;
  nodes: { id: number; label: string; x: number; y: number }[];
  edges: { from: number; to: number }[];
}

const defaultDFSGraph: DFSGraphInput = {
  startNode: 0,
  nodes: [
    { id: 0, label: '0', x: 80, y: 140 },
    { id: 1, label: '1', x: 220, y: 70 },
    { id: 2, label: '2', x: 220, y: 210 },
    { id: 3, label: '3', x: 380, y: 70 },
    { id: 4, label: '4', x: 380, y: 210 },
    { id: 5, label: '5', x: 520, y: 140 },
  ],
  edges: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 3, to: 0 }, // Back-edge (Cycle!)
    { from: 2, to: 4 },
    { from: 4, to: 5 },
    { from: 3, to: 5 },
  ],
};

export const dfsTraversalModule: AlgorithmModule<DFSGraphInput, DFSState> = {
  id: 'graph-dfs',
  title: 'Depth-First Search (DFS & Cycle Detection)',
  category: 'graphs',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V)',
    worstCaseCondition: 'Recursion depth hits V on a linear chain graph',
  },
  theory: {
    overview:
      'Depth-First Search explores as deep as possible along each branch before backtracking, utilizing the runtime Call Stack or an explicit LIFO Stack.',
    whyItWorks:
      '3-Color Invariant: White (unvisited), Gray (currently in recursion call stack), Black (fully explored and popped). A back-edge to a Gray node proves a directed cycle exists.',
    invariant:
      'Parenthesis Theorem: For any two vertices u and v, their active recursion intervals [d[u], f[u]] are either entirely disjoint or one contains the other.',
    pitfalls: [
      'Stack Overflow in languages with small default call stack limits when graph is a degenerate line.',
      'Failing to track vertices currently on the active stack (in-recursion) when detecting cycles in directed graphs.',
    ],
  },
  presets: [
    {
      id: 'cycle-dag',
      label: 'Graph with Cycle (0→1→3→0)',
      description: 'Demonstrates back-edge cycle detection during recursion',
      data: defaultDFSGraph,
    },
    {
      id: 'tree-dag',
      label: 'Acyclic Tree DAG',
      description: 'Clean tree branching without cycles',
      data: {
        startNode: 0,
        nodes: [
          { id: 0, label: '0 (Root)', x: 90, y: 140 },
          { id: 1, label: '1', x: 250, y: 70 },
          { id: 2, label: '2', x: 250, y: 210 },
          { id: 3, label: '3', x: 420, y: 70 },
          { id: 4, label: '4', x: 420, y: 210 },
        ],
        edges: [
          { from: 0, to: 1 },
          { from: 0, to: 2 },
          { from: 1, to: 3 },
          { from: 2, to: 4 },
        ],
      },
    },
  ],
  defaultInput: defaultDFSGraph,
  codeSnippets: {
    cpp: `bool dfs(int u, vector<vector<int>>& adj, vector<int>& state) {
    state[u] = 1; // 1 = VISITING (In Call Stack)

    for (int v : adj[u]) {
        if (state[v] == 1) {
            // Back-edge found -> Cycle detected!
            return true;
        }
        if (state[v] == 0 && dfs(v, adj, state)) {
            return true;
        }
    }

    state[u] = 2; // 2 = VISITED (Popped from Stack)
    return false;
}`,
    python: `def dfs(u, graph, state):
    state[u] = "VISITING" # On active recursion stack

    for v in graph[u]:
        if state[v] == "VISITING":
            # Cycle detected via back-edge!
            return True
        if state[v] == "UNVISITED" and dfs(v, graph, state):
            return True

    state[u] = "VISITED" # Backtrack & pop
    return False`,
    typescript: `function dfs(u: number, adj: number[][], state: number[]): boolean {
  state[u] = 1; // VISITING (in call stack)

  for (const v of adj[u]) {
    if (state[v] === 1) return true; // Cycle detected!
    if (state[v] === 0 && dfs(v, adj, state)) return true;
  }

  state[u] = 2; // VISITED
  return false;
}`,
    java: `boolean dfs(int u, List<List<Integer>> adj, int[] state) {
    state[u] = 1; // VISITING

    for (int v : adj.get(u)) {
        if (state[v] == 1) return true; // Cycle detected
        if (state[v] == 0 && dfs(v, adj, state)) return true;
    }

    state[u] = 2; // VISITED
    return false;
}`,
    pseudocode: `function dfs(u):
    state[u] = VISITING
    push u to Call Stack

    for each neighbor v of u:
        if state[v] == VISITING:
            report CYCLE detected
        if state[v] == UNVISITED:
            dfs(v)

    state[u] = VISITED
    pop u from Call Stack`,
  },

  generateTimeline: (input: DFSGraphInput): ExecutionFrame<DFSState>[] => {
    const { startNode, nodes, edges } = input;
    const frames: ExecutionFrame<DFSState>[] = [];

    // State trackers: 0 = unvisited, 1 = visiting (in stack), 2 = visited
    const nodeState: Record<number, 'unvisited' | 'visiting' | 'visited'> = {};
    const discoveryTime: Record<number, number> = {};
    const finishTime: Record<number, number> = {};
    const edgeTypes: Record<string, 'tree' | 'back' | 'forward' | 'cross' | 'default'> = {};

    nodes.forEach((n) => {
      nodeState[n.id] = 'unvisited';
    });

    let timer = 0;
    const callStack: CallStackFrame[] = [];
    const activePath: number[] = [];
    let cycleFound = false;

    const buildState = (currentNode?: number): DFSState => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        x: n.x,
        y: n.y,
        status: nodeState[n.id],
        discoveryTime: discoveryTime[n.id],
        finishTime: finishTime[n.id],
      })),
      edges: edges.map((e) => ({
        ...e,
        type: edgeTypes[`${e.from}->${e.to}`] || 'default',
      })),
      currentNode,
      activePath: [...activePath],
      cycleDetected: cycleFound,
    });

    // Frame 0: Init
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      explanation: `Initialized DFS from start node ${startNode}. Call stack is empty; all nodes unvisited.`,
      variables: { startNode, stackDepth: 0, timer: 0 },
      callStack: [],
      invariantStatus: {
        label: 'All vertices unvisited (State = 0)',
        isValid: true,
      },
      state: buildState(),
    });

    function dfsVisit(u: number) {
      timer++;
      discoveryTime[u] = timer;
      nodeState[u] = 'visiting';
      activePath.push(u);

      const stackFrame: CallStackFrame = {
        name: `dfs(u=${u})`,
        params: { u, discoveryTime: timer, status: 'VISITING' },
        line: 2,
        isCurrent: true,
      };
      callStack.unshift(stackFrame);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 2,
        explanation: `Pushed dfs(${u}) onto Call Stack. Marked node ${u} as VISITING (gray). Discovery time d[${u}] = ${timer}.`,
        variables: { u, state: 'VISITING', stackDepth: callStack.length, d: timer },
        callStack: [...callStack],
        isMilestone: true,
        milestoneTitle: `Visit Node ${u} (d=${timer})`,
        invariantStatus: {
          label: `Node ${u} is on active recursion stack`,
          isValid: true,
        },
        state: buildState(u),
      });

      const outgoing = edges.filter((e) => e.from === u);
      for (const edge of outgoing) {
        const v = edge.to;
        const eKey = `${u}->${v}`;

        if (nodeState[v] === 'visiting') {
          // Back-edge -> Cycle!
          edgeTypes[eKey] = 'back';
          cycleFound = true;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            explanation: `🚨 Back-edge detected (${u} → ${v})! Node ${v} is already in the active Call Stack. Directed cycle found: [${activePath.slice(
              activePath.indexOf(v)
            ).join(' → ')} → ${v}]!`,
            variables: { u, v, edgeType: 'BACK-EDGE', cycle: true },
            callStack: [...callStack],
            conditionEval: {
              expr: `state[${v}] == VISITING`,
              result: true,
            },
            isMilestone: true,
            milestoneTitle: `Cycle Detected (${u}→${v})`,
            invariantStatus: {
              label: `Cycle detected via back-edge to ancestor ${v}`,
              isValid: false,
            },
            state: buildState(u),
          });
        } else if (nodeState[v] === 'unvisited') {
          edgeTypes[eKey] = 'tree';

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `Tree-edge (${u} → ${v}): Node ${v} is unvisited. Recursively invoking dfs(${v})...`,
            variables: { u, v, edgeType: 'TREE-EDGE' },
            callStack: [...callStack],
            conditionEval: {
              expr: `state[${v}] == UNVISITED`,
              result: true,
            },
            state: buildState(u),
          });

          dfsVisit(v);
        } else {
          // Already visited
          edgeTypes[eKey] = 'forward';
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 4,
            explanation: `Edge (${u} → ${v}): Node ${v} was already fully explored. Skipping.`,
            variables: { u, v, status: 'SKIPPED' },
            callStack: [...callStack],
            state: buildState(u),
          });
        }
      }

      // Finish exploration & backtrack
      timer++;
      finishTime[u] = timer;
      nodeState[u] = 'visited';
      activePath.pop();
      callStack.shift();

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 13,
        explanation: `Finished exploring all branches of node ${u}. Marked VISITED (black). Finish time f[${u}] = ${timer}. Popped dfs(${u}) from Call Stack. Backtracking!`,
        variables: { u, state: 'VISITED', finishTime: timer, stackDepth: callStack.length },
        callStack: [...callStack],
        isMilestone: true,
        milestoneTitle: `Backtrack from ${u} (f=${timer})`,
        invariantStatus: {
          label: `Interval [${discoveryTime[u]}, ${timer}] closed for node ${u}`,
          isValid: true,
        },
        state: buildState(u),
      });
    }

    dfsVisit(startNode);

    // Final frame
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      isMilestone: true,
      milestoneTitle: 'DFS Traversal Complete',
      explanation: `DFS completed! Call stack is empty. Cycle status: ${
        cycleFound ? '⚠️ Directed cycle exists' : '✓ Directed Acyclic Graph (DAG)'
      }.`,
      variables: { status: 'COMPLETED', cycleDetected: cycleFound, totalSteps: frames.length },
      callStack: [],
      invariantStatus: {
        label: 'All visited nodes finalized',
        isValid: true,
      },
      state: buildState(),
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<DFSState>) => {
    const { nodes, edges, currentNode, cycleDetected } = frame.state;

    return (
      <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-4 max-w-5xl mx-auto min-h-[360px]">
        {/* SVG Graph Canvas */}
        <div className="flex-1 w-full bg-[#111827]/80 border border-[#1F293D] rounded-2xl p-4 relative flex items-center justify-center min-h-[300px]">
          <svg className="w-full h-[280px]" viewBox="0 0 620 300">
            <defs>
              <marker
                id="dfs-arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B" />
              </marker>
              <marker
                id="dfs-arrow-tree"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
              <marker
                id="dfs-arrow-back"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
              </marker>
            </defs>

            {/* Directed Edges */}
            {edges.map((edge, idx) => {
              const u = nodes.find((n) => n.id === edge.from);
              const v = nodes.find((n) => n.id === edge.to);
              if (!u || !v) return null;

              let stroke = '#334155';
              let strokeWidth = 2;
              let marker = 'url(#dfs-arrow)';
              let dash = '';

              if (edge.type === 'tree') {
                stroke = '#10B981';
                strokeWidth = 3;
                marker = 'url(#dfs-arrow-tree)';
              } else if (edge.type === 'back') {
                stroke = '#F43F5E';
                strokeWidth = 3.5;
                marker = 'url(#dfs-arrow-back)';
                dash = '4 4';
              }

              return (
                <line
                  key={`${edge.from}-${edge.to}-${idx}`}
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dash}
                  markerEnd={marker}
                  className="transition-colors duration-200"
                />
              );
            })}

            {/* Vertices */}
            {nodes.map((node) => {
              const isCurrent = node.id === currentNode;
              let fill = '#1E293B';
              let stroke = '#475569';
              let textColor = '#F1F5F9';

              if (node.status === 'visiting') {
                fill = '#06B6D4';
                stroke = '#0891B2';
                textColor = '#0B0F19';
              } else if (node.status === 'visited') {
                fill = '#10B981';
                stroke = '#059669';
                textColor = '#0B0F19';
              }

              return (
                <g key={node.id} className="cursor-pointer">
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={28}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ animationDuration: '4s' }}
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={22}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2.5}
                    className="transition-all duration-200 shadow-lg"
                  />

                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={13}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.label}
                  </text>

                  {/* Discovery & Finish Times [d/f] */}
                  {node.discoveryTime && (
                    <text
                      x={node.x}
                      y={node.y - 26}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize={10}
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      [{node.discoveryTime}/{node.finishTime || '·'}]
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend & Cycle Status Card */}
        <div className="w-full md:w-64 flex flex-col gap-3 shrink-0">
          {/* Cycle Banner */}
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
              cycleDetected
                ? 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
                : 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
            }`}
          >
            <span className="font-bold">
              {cycleDetected ? '⚠️ CYCLE DETECTED' : '✓ ACYCLIC (DAG)'}
            </span>
          </div>

          {/* Node Colors Legend */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-3 text-xs font-mono space-y-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400">3-Color State</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1E293B] border border-[#475569]" />
              <span className="text-slate-300">White: Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#06B6D4]" />
              <span className="text-cyan-200">Gray: In Call Stack</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10B981]" />
              <span className="text-emerald-200">Black: Finished (Popped)</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
