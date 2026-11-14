import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface DinicEdge {
  from: string;
  to: string;
  capacity: number;
  flow: number;
}

export interface DinicState {
  nodes: string[];
  edges: DinicEdge[];
  levels: Record<string, number>;
  source: string;
  sink: string;
  phase: 'BFS_LEVEL_GRAPH' | 'DFS_BLOCKING_FLOW' | 'TERMINATED';
  activeNode: string | null;
  totalFlow: number;
}

export const dinicModule: AlgorithmModule<
  { nodes: string[]; edges: { from: string; to: string; capacity: number }[]; source: string; sink: string },
  DinicState
> = {
  id: 'dinics-algorithm',
  title: "Dinic's Algorithm (Level Graph & Blocking Flow O(V^2 E))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(E sqrt(V)) on unit networks',
    timeAverage: 'O(V^2 E)',
    timeWorst: 'O(V^2 E)',
    spaceAuxiliary: 'O(V + E) for level graph and edge iterators',
    worstCaseCondition: 'At most V phase iterations, each finding a blocking flow in O(VE) time',
  },
  theory: {
    overview:
      "Dinic's algorithm is a strongly polynomial maximum flow algorithm that runs in O(V^2 E) for general networks and O(E sqrt(V)) for unit networks (e.g. bipartite matching). It decomposes flow computation into phases using BFS Level Graphs and DFS Blocking Flows.",
    whyItWorks:
      'In each phase, BFS builds a Level Graph assigning level[v] = shortest distance from s. DFS then pushes blocking flows strictly along admissible edges where level[v] == level[u] + 1. The distance to t strictly increases each phase, guaranteeing termination in at most V - 1 phases.',
    invariant:
      'Monotonically Increasing Sink Distance: In each successive phase, level[t] strictly increases: level_{k+1}[t] > level_k[t].',
    pitfalls: [
      'Forgetting the current edge pointer optimization (ptr array), degrading DFS to O(V^2) per push instead of O(VE) per phase.',
      'Allowing DFS to use edges that do not satisfy level[v] == level[u] + 1.',
    ],
  },
  presets: [
    {
      id: 'layered-network',
      label: 'Layered Network (4 Levels: S -> A, B -> C, D -> T)',
      description: 'Clear level graph structure with multi-path blocking flow',
      data: {
        nodes: ['S', 'A', 'B', 'C', 'T'],
        edges: [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'C', capacity: 4 },
          { from: 'A', to: 'T', capacity: 8 },
          { from: 'B', to: 'C', capacity: 9 },
          { from: 'C', to: 'T', capacity: 10 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
    {
      id: 'bipartite-unit',
      label: 'Bipartite Matching Network',
      description: 'Unit capacity edges demonstrating O(E sqrt(V)) matching speed',
      data: {
        nodes: ['S', 'L1', 'L2', 'R1', 'R2', 'T'],
        edges: [
          { from: 'S', to: 'L1', capacity: 1 },
          { from: 'S', to: 'L2', capacity: 1 },
          { from: 'L1', to: 'R1', capacity: 1 },
          { from: 'L1', to: 'R2', capacity: 1 },
          { from: 'L2', to: 'R2', capacity: 1 },
          { from: 'R1', to: 'T', capacity: 1 },
          { from: 'R2', to: 'T', capacity: 1 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
  ],
  defaultInput: {
    nodes: ['S', 'A', 'B', 'C', 'T'],
    edges: [
      { from: 'S', to: 'A', capacity: 10 },
      { from: 'S', to: 'B', capacity: 10 },
      { from: 'A', to: 'C', capacity: 4 },
      { from: 'A', to: 'T', capacity: 8 },
      { from: 'B', to: 'C', capacity: 9 },
      { from: 'C', to: 'T', capacity: 10 },
    ],
    source: 'S',
    sink: 'T',
  },
  codeSnippets: {
    cpp: `struct Edge { int to, cap, flow, rev; };
vector<vector<Edge>> adj;
vector<int> level, ptr;

bool bfs(int s, int t) {
    fill(level.begin(), level.end(), -1);
    level[s] = 0;
    queue<int> q; q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (auto& e : adj[u]) {
            if (e.cap - e.flow > 0 && level[e.to] == -1) {
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
        }
    }
    return level[t] != -1;
}

int dfs(int u, int t, int pushed) {
    if (pushed == 0 || u == t) return pushed;
    for (int& cid = ptr[u]; cid < adj[u].size(); ++cid) {
        auto& e = adj[u][cid];
        int tr = e.to;
        if (level[u] + 1 != level[tr] || e.cap - e.flow == 0) continue;
        int trPushed = dfs(tr, t, min(pushed, e.cap - e.flow));
        if (trPushed == 0) continue;
        e.flow += trPushed;
        adj[tr][e.rev].flow -= trPushed;
        return trPushed;
    }
    return 0;
}

int dinic(int s, int t) {
    int flow = 0;
    while (bfs(s, t)) {
        fill(ptr.begin(), ptr.end(), 0);
        while (int pushed = dfs(s, t, 1e9)) flow += pushed;
    }
    return flow;
}`,
    python: `def dinic(n, edges, s, t):
    # Construct residual graph and level graph
    flow = 0
    while True:
        level = [-1] * n
        level[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v, cap, f, _ in adj[u]:
                if cap - f > 0 and level[v] == -1:
                    level[v] = level[u] + 1
                    q.append(v)
        if level[t] == -1: break
        ptr = [0] * n
        def dfs(u, pushed):
            if u == t or not pushed: return pushed
            for cid in range(ptr[u], len(adj[u])):
                ptr[u] = cid
                v, cap, f, rev = adj[u][cid]
                if level[v] == level[u] + 1 and cap - f > 0:
                    tr = dfs(v, min(pushed, cap - f))
                    if tr > 0:
                        adj[u][cid][2] += tr
                        adj[v][rev][2] -= tr
                        return tr
            return 0
        while (pushed := dfs(s, float('inf'))):
            flow += pushed
    return flow`,
    typescript: `function dinic(n: number, s: number, t: number, cap: number[][]): number {
  let flow = 0;
  // Repeat BFS Level Graph construction + DFS Blocking Flow pushes
  return flow;
}`,
    java: `public int dinic(int s, int t) {
    int flow = 0;
    while (bfs(s, t)) {
        Arrays.fill(ptr, 0);
        int pushed;
        while ((pushed = dfs(s, t, Integer.MAX_VALUE)) > 0) flow += pushed;
    }
    return flow;
}`,
    pseudocode: `function dinic(s, t):
    maxFlow = 0
    while bfsLevelGraph(s, t):
        while true:
            path = dfsBlocking(s, t, infinity)   # admissible: level[v] == level[u] + 1
            if path is empty: break
            push = min residual capacity along path
            augment every edge on path by push
            maxFlow += push
    return maxFlow
function bfsLevelGraph(s, t):
    level = {s: 0}, queue = [s]
    while queue not empty:
        u = dequeue(queue)
        for each residual edge (u, v) with cap > 0:
            if v unlabeled:
                level[v] = level[u] + 1
                enqueue(queue, v)
    return t labeled`,
  },
  generateTimeline: (input: {
    nodes: string[];
    edges: { from: string; to: string; capacity: number }[];
    source: string;
    sink: string;
  }): ExecutionFrame<DinicState>[] => {
    const rawNodes = input?.nodes?.length ? input.nodes : ['S', 'A', 'B', 'C', 'T'];
    const rawEdges = input?.edges?.length
      ? input.edges
      : [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'C', capacity: 4 },
          { from: 'A', to: 'T', capacity: 8 },
          { from: 'B', to: 'C', capacity: 9 },
          { from: 'C', to: 'T', capacity: 10 },
        ];
    const source = input?.source || rawNodes[0];
    const sink = input?.sink || rawNodes[rawNodes.length - 1];

    const frames: ExecutionFrame<DinicState>[] = [];
    const flowEdges: DinicEdge[] = rawEdges.map((e) => ({ ...e, flow: 0 }));
    let totalFlow = 0;
    let checkpointAdded = false;

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Dinic's Network (Source: ${source}, Sink: ${sink})`,
      action: 'INIT',
      state: {
        nodes: rawNodes,
        edges: flowEdges.map((e) => ({ ...e })),
        levels: {},
        source,
        sink,
        phase: 'BFS_LEVEL_GRAPH',
        activeNode: null,
        totalFlow: 0,
      },
      callStack: [{ name: 'dinic', params: { source, sink, edgeCount: rawEdges.length }, line: 2, isCurrent: true }],
      variables: { source, sink, totalFlow: 0, residualEdges: flowEdges.length },
      conditionEval: { expr: 'source !== sink', result: true },
      soundCue: { type: 'step' },
      pedagogy: {
        what: `Dinic alternates two phases: BFS builds a level graph, then DFS pushes a blocking flow along strictly increasing levels.`,
        why: 'Each blocking flow phase pushes all flow that the current shortest path lengths allow; afterwards the shortest augmenting path gets strictly longer, bounding phases to O(V).',
        whatNext: `Phase 1 begins with BFS from "${source}".`,
      },
      explanation: `Initialized Dinic's Algorithm. Source = "${source}", Sink = "${sink}". Phase 1 begins with BFS Level Graph construction.`,
    });

    let phaseNum = 1;
    while (true) {
      // BFS for Level Graph
      const levels: Record<string, number> = {};
      const queue: string[] = [source];
      levels[source] = 0;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        action: 'BFS_START',
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          levels: { ...levels },
          source,
          sink,
          phase: 'BFS_LEVEL_GRAPH',
          activeNode: source,
          totalFlow,
        },
        callStack: [{ name: 'bfsLevelGraph', params: { phase: phaseNum, source }, line: 12, isCurrent: true }],
        variables: { phase: phaseNum, queue: [source], currentLevel: 0 },
        conditionEval: { expr: 'queue.length > 0', result: true },
        soundCue: { type: 'select' },
        pedagogy: {
          what: `Phase ${phaseNum} BFS: level["${source}"] = 0 and the queue starts with the source.`,
          why: 'Levels measure the fewest residual edges from the source in this phase; DFS may only descend level by level.',
          whatNext: 'Dequeue the source and label its residual neighbors.',
        },
        explanation: `Phase ${phaseNum} BFS: Initialize queue with source "${source}" at level 0.`,
      });

      while (queue.length > 0) {
        const u = queue.shift()!;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          action: 'DEQUEUE',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            levels: { ...levels },
            source,
            sink,
            phase: 'BFS_LEVEL_GRAPH',
            activeNode: u,
            totalFlow,
          },
          callStack: [{ name: `dequeue("${u}")`, params: { u }, line: 14, isCurrent: true }],
          variables: { current: u, level: levels[u], queue: queue.join(', ') || '(empty)' },
          pedagogy: {
            what: `"${u}" leaves the queue at level ${levels[u]}.`,
            why: 'BFS must finish all level-k vertices before level k+1, otherwise levels would not be shortest distances.',
            whatNext: `Label unlabeled residual neighbors of "${u}" with level ${levels[u] + 1}.`,
          },
          explanation: `Dequeue "${u}" (level ${levels[u]}). Scanning its residual edges.`,
        });

        for (const e of flowEdges) {
          if (e.from === u) {
            const resCap = e.capacity - e.flow;
            if (levels[e.to] === undefined && resCap > 0) {
              levels[e.to] = levels[u] + 1;
              queue.push(e.to);

              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 17,
                action: 'LEVEL_ASSIGNED',
                state: {
                  nodes: rawNodes,
                  edges: flowEdges.map((e) => ({ ...e })),
                  levels: { ...levels },
                  source,
                  sink,
                  phase: 'BFS_LEVEL_GRAPH',
                  activeNode: e.to,
                  totalFlow,
                },
                callStack: [{ name: 'assignLevel', params: { node: e.to, level: levels[e.to], from: u }, line: 17, isCurrent: true }],
                variables: { node: e.to, assignedLevel: levels[e.to], via: u, residualCap: resCap },
                conditionEval: { expr: `resCap(${u}->${e.to}) = ${resCap} > 0 && levels[${e.to}] == null`, result: true },
                soundCue: { type: 'insert' },
                pedagogy: {
                  what: `Forward residual ${u} → ${e.to} (${resCap} unit(s) free) labels "${e.to}" at level ${levels[e.to]}.`,
                  why: 'An unlabeled reachable vertex always belongs to the next BFS level.',
                  whatNext: `Enqueue "${e.to}".`,
                },
                explanation: `BFS explored edge (${u} -> ${e.to}): Residual capacity = ${resCap} > 0. Assigned level[${e.to}] = ${levels[e.to]} and enqueued.`,
              });
            } else if (resCap <= 0) {
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 17,
                action: 'LEVEL_REJECT',
                state: {
                  nodes: rawNodes,
                  edges: flowEdges.map((e) => ({ ...e })),
                  levels: { ...levels },
                  source,
                  sink,
                  phase: 'BFS_LEVEL_GRAPH',
                  activeNode: u,
                  totalFlow,
                },
                callStack: [{ name: `rejectEdge("${u}"→"${e.to}")`, params: { reason: 'NO_RESIDUAL' }, line: 17, isCurrent: true }],
                variables: { from: u, to: e.to, residualCapacity: resCap, reason: 'NO_RESIDUAL' },
                conditionEval: { expr: `resCap(${u}->${e.to}) = ${resCap} > 0`, result: false },
                pedagogy: {
                  what: `${u} → ${e.to} is saturated (${e.flow}/${e.capacity}); no residual capacity.`,
                  why: 'Saturated edges do not exist in the level graph; they can only reappear through a later cancellation.',
                  whatNext: 'Skip this edge.',
                },
                explanation: `Forward edge (${u} → ${e.to}) saturated: ${e.flow}/${e.capacity}. Not part of the level graph.`,
              });
            } else {
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 17,
                action: 'LEVEL_REJECT',
                state: {
                  nodes: rawNodes,
                  edges: flowEdges.map((e) => ({ ...e })),
                  levels: { ...levels },
                  source,
                  sink,
                  phase: 'BFS_LEVEL_GRAPH',
                  activeNode: u,
                  totalFlow,
                },
                callStack: [{ name: `rejectEdge("${u}"→"${e.to}")`, params: { reason: 'ALREADY_LABELED' }, line: 17, isCurrent: true }],
                variables: { from: u, to: e.to, existingLevel: levels[e.to], reason: 'ALREADY_LABELED' },
                conditionEval: { expr: `levels[${e.to}] == null`, result: false },
                pedagogy: {
                  what: `"${e.to}" already has level ${levels[e.to]} from an earlier BFS step.`,
                  why: 'Keeping the first label preserves shortest distances; relabeling through a longer route would break the level graph.',
                  whatNext: 'Skip this edge.',
                },
                explanation: `"${e.to}" already labeled level ${levels[e.to]}; keeping the shortest-distance label.`,
              });
            }
          } else if (e.to === u && e.flow > 0) {
            if (levels[e.from] === undefined) {
              levels[e.from] = levels[u] + 1;
              queue.push(e.from);

              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 17,
                action: 'LEVEL_ASSIGNED',
                state: {
                  nodes: rawNodes,
                  edges: flowEdges.map((e) => ({ ...e })),
                  levels: { ...levels },
                  source,
                  sink,
                  phase: 'BFS_LEVEL_GRAPH',
                  activeNode: e.from,
                  totalFlow,
                },
                callStack: [{ name: 'assignLevel', params: { node: e.from, level: levels[e.from], from: u, backward: true }, line: 17, isCurrent: true }],
                variables: { node: e.from, assignedLevel: levels[e.from], via: u, residualCap: e.flow, backward: true },
                conditionEval: { expr: `flow(${e.from}->${u}) = ${e.flow} > 0 && levels[${e.from}] == null`, result: true },
                soundCue: { type: 'insert' },
                pedagogy: {
                  what: `Backward residual: the ${e.flow} unit(s) flowing on ${e.from} → ${u} can be cancelled, so "${u}" reaches "${e.from}" with one residual edge.`,
                  why: 'The level graph includes backward residuals; that is how Dinic reroutes earlier choices within later phases.',
                  whatNext: `Label "${e.from}" at level ${levels[e.from]} and enqueue it.`,
                },
                explanation: `Backward residual edge (${u} → ${e.from}) via cancelling ${e.flow} unit(s). Assigned level[${e.from}] = ${levels[e.from]}.`,
              });
            } else if (levels[e.from] !== undefined) {
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 17,
                action: 'LEVEL_REJECT',
                state: {
                  nodes: rawNodes,
                  edges: flowEdges.map((e) => ({ ...e })),
                  levels: { ...levels },
                  source,
                  sink,
                  phase: 'BFS_LEVEL_GRAPH',
                  activeNode: u,
                  totalFlow,
                },
                callStack: [{ name: `rejectEdge("${u}"→"${e.from}")`, params: { reason: 'ALREADY_LABELED' }, line: 17, isCurrent: true }],
                variables: { from: u, to: e.from, existingLevel: levels[e.from], reason: 'ALREADY_LABELED', backward: true },
                conditionEval: { expr: `levels[${e.from}] == null`, result: false },
                pedagogy: {
                  what: `Backward target "${e.from}" already has level ${levels[e.from]}.`,
                  why: 'Same shortest-distance rule as forward edges: first (shortest) label wins.',
                  whatNext: 'Skip this edge.',
                },
                explanation: `Backward residual target "${e.from}" already labeled level ${levels[e.from]}.`,
              });
            }
          }
        }
      }

      if (levels[sink] === undefined) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 10,
          isMilestone: true,
          milestoneTitle: `Max Flow Reached: ${totalFlow}`,
          action: 'TERMINATED',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            levels,
            source,
            sink,
            phase: 'TERMINATED',
            activeNode: null,
            totalFlow,
          },
          callStack: [{ name: 'dinic', params: { maxFlow: totalFlow, status: 'DONE' }, line: 10, isCurrent: true }],
          variables: { totalFlow, status: 'Sink unreachable in residual graph', maxFlowOptimal: true },
          conditionEval: { expr: `levels['${sink}'] !== undefined`, result: false },
          soundCue: { type: 'complete' },
          pedagogy: {
            what: `BFS cannot reach "${sink}" in the residual graph, so the while loop ends and maxFlow = ${totalFlow} is returned.`,
            why: 'Unreachability certifies that no augmenting path exists; by max-flow min-cut the current flow is optimal.',
            whatNext: 'Compare with Edmonds-Karp: Dinic reaches the same max flow in fewer phases by pushing whole blocking flows.',
          },
          explanation: `Sink "${sink}" is unreachable from source in residual graph (no augmenting paths remain). Maximum Flow = ${totalFlow}.`,
        });
        break;
      }

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 3,
        isMilestone: true,
        milestoneTitle: `Phase ${phaseNum} Level Graph (Sink dist = ${levels[sink]})`,
        action: 'LEVEL_GRAPH_BUILT',
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          levels: { ...levels },
          source,
          sink,
          phase: 'BFS_LEVEL_GRAPH',
          activeNode: null,
          totalFlow,
        },
        callStack: [{ name: 'bfsLevelGraph', params: { phase: phaseNum, sinkLevel: levels[sink] }, line: 3, isCurrent: true }],
        variables: { phase: phaseNum, sinkLevel: levels[sink], levelsSummary: Object.entries(levels).map(([k, v]) => `${k}:${v}`).join(', ') },
        conditionEval: { expr: `levels['${sink}'] !== undefined`, result: true },
        soundCue: { type: 'step' },
        pedagogy: {
          what: `The level graph admits only edges with level[v] = level[u] + 1, and the sink sits at distance ${levels[sink]}.`,
          why: 'Restricting DFS to admissible edges makes every push follow a shortest augmenting path, so no shorter path survives the blocking flow.',
          whatNext: 'Push a blocking flow with DFS along admissible edges.',
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'dinic-blocking-flow',
              question: 'What does it mean to push a "blocking flow" in the level graph, and why is another BFS needed afterwards?',
              options: [
                'No admissible path of the current shortest length remains, so the next BFS must relabel at strictly greater distances',
                'The blocking flow is already the maximum flow, so the extra BFS is only a verification step',
              ],
              correctIndex: 0,
              explanation:
                'Blocking means every level-graph path is saturated. The next augmenting path, if any, must be longer, so BFS rebuilds levels; this is why the phase count is bounded by O(V).',
            }
          : undefined,
        explanation: `Phase ${phaseNum} Level Graph built successfully. Distance to sink = ${levels[sink]}. DFS will push blocking flow strictly along admissible edges where level[v] == level[u] + 1.`,
      });
      checkpointAdded = true;

      // DFS to find blocking flows
      let phasePushed = 0;
      while (true) {
        const path: string[] = [];
        const edgeIdxPath: number[] = [];
        const isRevPath: boolean[] = [];

        function dfs(curr: string): number {
          if (curr === sink) return Infinity;
          for (let i = 0; i < flowEdges.length; i++) {
            const e = flowEdges[i];
            if (e.from === curr && levels[e.to] === levels[curr] + 1 && e.capacity - e.flow > 0) {
              path.push(e.to);
              edgeIdxPath.push(i);
              isRevPath.push(false);
              const push = Math.min(e.capacity - e.flow, dfs(e.to));
              if (push > 0) return push;
              path.pop();
              edgeIdxPath.pop();
              isRevPath.pop();
            }
          }
          return 0;
        }

        path.push(source);
        const pushed = dfs(source);

        if (pushed === 0 || pushed === Infinity) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            isMilestone: true,
            milestoneTitle: `Phase ${phaseNum} Blocking Flow Done (+${phasePushed})`,
            action: 'BLOCKING_FLOW_DONE',
            state: {
              nodes: rawNodes,
              edges: flowEdges.map((e) => ({ ...e })),
              levels: { ...levels },
              source,
              sink,
              phase: 'DFS_BLOCKING_FLOW',
              activeNode: null,
              totalFlow,
            },
            callStack: [{ name: 'dfsBlocking', params: { phase: phaseNum, phasePushed }, line: 6, isCurrent: true }],
            variables: { phasePushed, totalFlow, status: 'No more admissible paths in this level graph' },
            conditionEval: { expr: `path is empty`, result: true },
            soundCue: { type: 'complete' },
            pedagogy: {
              what: `DFS finds no admissible path: every level-graph path is saturated. Phase ${phaseNum} pushed ${phasePushed} unit(s) in total.`,
              why: 'A blocking flow is complete exactly when the admissible subgraph has no s→t path left.',
              whatNext: 'Rebuild the level graph with another BFS — the next augmenting path, if any, is strictly longer.',
            },
            explanation: `Phase ${phaseNum} blocking flow complete: +${phasePushed} unit(s), cumulative ${totalFlow}. All admissible paths in this level graph are exhausted.`,
          });
          break;
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 5,
          isMilestone: true,
          milestoneTitle: `Admissible Path: ${path.join(' → ')}`,
          action: 'PATH_FOUND',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            levels: { ...levels },
            source,
            sink,
            phase: 'DFS_BLOCKING_FLOW',
            activeNode: path[path.length - 1],
            totalFlow,
          },
          callStack: [{ name: 'dfsBlocking', params: { path: path.join('->') }, line: 5, isCurrent: true }],
          variables: { path: path.join(' -> '), hops: path.length - 1, phasePushed },
          pedagogy: {
            what: `DFS descends only admissible edges (level + 1 each hop) and reaches the sink via ${path.join(' → ')}.`,
            why: 'Because every hop increases the level by exactly one, this path has the current shortest length ${path.length - 1}.',
            whatNext: 'Compute the bottleneck along this path.',
          },
          explanation: `DFS found admissible path [${path.join(' -> ')}] (length ${path.length - 1}) along level-increasing edges.`,
        });

        const pathResiduals = edgeIdxPath.map((idx) => flowEdges[idx].capacity - flowEdges[idx].flow);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 7,
          action: 'BOTTLENECK',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            levels: { ...levels },
            source,
            sink,
            phase: 'DFS_BLOCKING_FLOW',
            activeNode: path[path.length - 1],
            totalFlow,
          },
          callStack: [{ name: 'computeBottleneck', params: { push: pushed }, line: 7, isCurrent: true }],
          variables: {
            push: pushed,
            path: path.join(' -> '),
            residuals: pathResiduals.join(', '),
          },
          pedagogy: {
            what: `The bottleneck is ${pushed}, the smallest residual capacity on ${path.join(' → ')}.`,
            why: 'Pushing more would overflow the tightest edge; pushing less would leave capacity unused.',
            whatNext: 'Push the bottleneck along every path edge.',
          },
          explanation: `Bottleneck push = ${pushed}: minimum of residual capacities [${pathResiduals.join(', ')}] along the path.`,
        });

        for (let k = 0; k < edgeIdxPath.length; k++) {
          const idx = edgeIdxPath[k];
          const e = flowEdges[idx];
          const rev = isRevPath[k];
          const before = e.flow;
          if (rev) flowEdges[idx].flow -= pushed;
          else flowEdges[idx].flow += pushed;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            action: 'AUGMENT_EDGE',
            state: {
              nodes: rawNodes,
              edges: flowEdges.map((x) => ({ ...x })),
              levels: { ...levels },
              source,
              sink,
              phase: 'DFS_BLOCKING_FLOW',
              activeNode: e.to,
              totalFlow,
            },
            callStack: [{ name: `pushAlong("${e.from}" → "${e.to}")`, params: { delta: pushed }, line: 8, isCurrent: true }],
            variables: {
              pathEdge: `${e.from} → ${e.to}`,
              direction: rev ? 'BACKWARD_CANCEL' : 'FORWARD_PUSH',
              flowBefore: before,
              flowAfter: flowEdges[idx].flow,
              residualAfter: e.capacity - flowEdges[idx].flow,
            },
            pedagogy: {
              what: rev
                ? `Cancelled ${pushed} unit(s) on ${e.from} → ${e.to}: flow ${before} → ${flowEdges[idx].flow}.`
                : `Pushed ${pushed} unit(s) on ${e.from} → ${e.to}: flow ${before} → ${flowEdges[idx].flow} of ${e.capacity}.`,
              why: 'Each admissible edge carries the full bottleneck; the tightest edge becomes saturated and leaves the level graph.',
              whatNext: 'Continue with the next edge of the path.',
            },
            explanation: rev
              ? `Cancel ${pushed} on (${e.from} → ${e.to}): flow ${before} → ${flowEdges[idx].flow}.`
              : `Push ${pushed} on (${e.from} → ${e.to}): flow ${before} → ${flowEdges[idx].flow} of ${e.capacity}.`,
          });
        }

        totalFlow += pushed;
        phasePushed += pushed;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          action: 'MAXFLOW_UPDATE',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((e) => ({ ...e })),
            levels: { ...levels },
            source,
            sink,
            phase: 'DFS_BLOCKING_FLOW',
            activeNode: path[path.length - 1],
            totalFlow,
          },
          callStack: [{ name: 'dinic', params: { maxFlow: totalFlow, phasePushed }, line: 9, isCurrent: true }],
          variables: { pushed, currentFlow: totalFlow, path: path.join(' -> '), phasePushed },
          conditionEval: { expr: `pushedFlow > 0`, result: true },
          soundCue: { type: 'swap' },
          pedagogy: {
            what: `maxFlow += ${pushed} → ${totalFlow} (this phase: +${phasePushed}).`,
            why: 'Every push on an admissible path is a valid flow increase, so the total accumulates monotonically.',
            whatNext: 'Search for the next admissible path in the same level graph.',
          },
          explanation: `Pushed ${pushed} unit(s) along ${path.join(' -> ')}. Cumulative flow: ${totalFlow}.`,
        });
      }

      phaseNum++;
    }

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<DinicState>) => {
    const { nodes, edges, levels, source, sink, phase, totalFlow } = frame.state;

    // Group nodes by level
    const maxLevel = Math.max(...Object.values(levels).filter((l) => l !== undefined), 1);
    const width = 500;
    const height = 280;

    const positions: Record<string, { x: number; y: number }> = {};
    const levelBuckets: Record<number, string[]> = {};

    nodes.forEach((u) => {
      const lvl = levels[u] ?? 0;
      if (!levelBuckets[lvl]) levelBuckets[lvl] = [];
      levelBuckets[lvl].push(u);
    });

    Object.entries(levelBuckets).forEach(([lvlStr, bucket]) => {
      const lvl = Number(lvlStr);
      const x = 50 + (lvl * (width - 100)) / Math.max(1, maxLevel);
      bucket.forEach((u, idx) => {
        const y = 60 + ((height - 120) * (idx + 1)) / (bucket.length + 1);
        positions[u] = { x, y };
      });
    });

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-3xl mx-auto">
        {/* Banner */}
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Total Max Flow:</span>
            <span className="text-xl font-mono font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded">
              {totalFlow}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Phase:</span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                phase === 'TERMINATED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              }`}
            >
              {phase}
            </span>
          </div>
        </div>

        {/* SVG Level Graph */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <svg width={width} height={height} className="overflow-visible">
            {edges.map((e, idx) => {
              const p1 = positions[e.from];
              const p2 = positions[e.to];
              if (!p1 || !p2) return null;
              const isAdmissible = levels[e.to] === (levels[e.from] ?? 0) + 1;
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isAdmissible ? '#a855f7' : '#334155'}
                    strokeWidth={isAdmissible ? '3' : '1.5'}
                    strokeDasharray={!isAdmissible ? '3 3' : undefined}
                  />
                  <rect
                    x={midX - 16}
                    y={midY - 9}
                    width="32"
                    height="18"
                    rx="3"
                    fill="#0f172a"
                    stroke="#334155"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {e.flow}/{e.capacity}
                  </text>
                </g>
              );
            })}

            {nodes.map((u) => {
              const p = positions[u] || { x: 50, y: 140 };
              const isSource = u === source;
              const isSink = u === sink;
              const lvl = levels[u];

              return (
                <g key={u}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="19"
                    fill={isSource ? '#065f46' : isSink ? '#7f1d1d' : '#1e293b'}
                    stroke={isSource ? '#10b981' : isSink ? '#ef4444' : '#64748b'}
                    strokeWidth="3"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {u}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 25}
                    textAnchor="middle"
                    fill="#a78bfa"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    L:{lvl !== undefined ? lvl : '?'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
