import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface FlowEdge {
  from: string;
  to: string;
  capacity: number;
  flow: number;
}

export interface EdmondsKarpState {
  nodes: string[];
  edges: FlowEdge[];
  source: string;
  sink: string;
  augmentingPath: string[] | null;
  bottleneck: number;
  totalFlow: number;
}

export const edmondsKarpModule: AlgorithmModule<
  { nodes: string[]; edges: { from: string; to: string; capacity: number }[]; source: string; sink: string },
  EdmondsKarpState
> = {
  id: 'edmonds-karp',
  title: "Ford-Fulkerson & Edmonds-Karp (BFS Augmenting Paths Max Flow O(V E^2))",
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(E)',
    timeAverage: 'O(V E^2)',
    timeWorst: 'O(V E^2)',
    spaceAuxiliary: 'O(V + E) for residual capacity graph and parent pointers',
    worstCaseCondition: 'Graphs requiring V * E / 2 augmentation iterations of length up to V',
  },
  theory: {
    overview:
      "The Edmonds-Karp algorithm computes the Maximum Flow in a flow network from source s to sink t. It specializes the Ford-Fulkerson method by choosing the shortest augmenting path (fewest edges) via Breadth-First Search (BFS), bounding execution to O(V E^2).",
    whyItWorks:
      'By using BFS to find augmenting paths in the residual graph, the shortest distance from s to any vertex in the residual graph monotonically increases throughout execution. Each edge can become critical at most V / 2 times.',
    invariant:
      'Flow Conservation & Capacity Constraints: For every node v != s, t: sum(inflow) == sum(outflow). For every edge: 0 <= flow <= capacity.',
    pitfalls: [
      'Using DFS instead of BFS (can lead to O(E * max_flow) worst-case time or infinite loops with irrational capacities).',
      'Forgetting to maintain backward residual edges with capacity equal to current forward flow.',
    ],
  },
  presets: [
    {
      id: 'classic-network',
      label: 'Diamond Network (4 Nodes: S -> A, B -> T)',
      description: 'Classic diamond flow network with bottleneck capacity 7',
      data: {
        nodes: ['S', 'A', 'B', 'T'],
        edges: [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'B', capacity: 2 },
          { from: 'A', to: 'T', capacity: 4 },
          { from: 'B', to: 'T', capacity: 8 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
    {
      id: 'bridge-network',
      label: 'Bottleneck Bridge (S -> A, B -> C, D -> T)',
      description: 'Single critical bridge edge between two clusters',
      data: {
        nodes: ['S', 'A', 'B', 'C', 'T'],
        edges: [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 5 },
          { from: 'A', to: 'C', capacity: 8 },
          { from: 'B', to: 'C', capacity: 4 },
          { from: 'C', to: 'T', capacity: 9 },
        ],
        source: 'S',
        sink: 'T',
      },
    },
  ],
  defaultInput: {
    nodes: ['S', 'A', 'B', 'T'],
    edges: [
      { from: 'S', to: 'A', capacity: 10 },
      { from: 'S', to: 'B', capacity: 10 },
      { from: 'A', to: 'B', capacity: 2 },
      { from: 'A', to: 'T', capacity: 4 },
      { from: 'B', to: 'T', capacity: 8 },
    ],
    source: 'S',
    sink: 'T',
  },
  codeSnippets: {
    cpp: `int edmondsKarp(int s, int t, int n, vector<vector<int>>& cap) {
    int maxFlow = 0;
    vector<int> parent(n);
    auto bfs = [&]() -> int {
        fill(parent.begin(), parent.end(), -1);
        parent[s] = -2;
        queue<pair<int, int>> q;
        q.push({s, 1e9});
        while (!q.empty()) {
            auto [u, flow] = q.front(); q.pop();
            for (int v = 0; v < n; ++v) {
                if (parent[v] == -1 && cap[u][v] > 0) {
                    parent[v] = u;
                    int newFlow = min(flow, cap[u][v]);
                    if (v == t) return newFlow;
                    q.push({v, newFlow});
                }
            }
        }
        return 0;
    };
    int push = 0;
    while ((push = bfs()) > 0) {
        maxFlow += push;
        for (int v = t; v != s; v = parent[v]) {
            int u = parent[v];
            cap[u][v] -= push;
            cap[v][u] += push;
        }
    }
    return maxFlow;
}`,
    python: `def edmonds_karp(capacity: list[list[int]], s: int, t: int) -> int:
    n = len(capacity)
    flow = [[0] * n for _ in range(n)]
    max_flow = 0
    while True:
        parent = [-1] * n
        parent[s] = s
        q = deque([s])
        while q and parent[t] == -1:
            u = q.popleft()
            for v in range(n):
                if parent[v] == -1 and capacity[u][v] - flow[u][v] > 0:
                    parent[v] = u
                    q.append(v)
        if parent[t] == -1: break
        path_flow = min(capacity[parent[v]][v] - flow[parent[v]][v] for v in range(t, s, parent[v]))
        v = t
        while v != s:
            u = parent[v]
            flow[u][v] += path_flow
            flow[v][u] -= path_flow
            v = u
        max_flow += path_flow
    return max_flow`,
    typescript: `function edmondsKarp(n: number, s: number, t: number, cap: number[][]): number {
  let maxFlow = 0;
  while (true) {
    const parent = new Array(n).fill(-1);
    parent[s] = s;
    const queue = [s];
    while (queue.length > 0 && parent[t] === -1) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && cap[u][v] > 0) {
          parent[v] = u;
          queue.push(v);
        }
      }
    }
    if (parent[t] === -1) break;
    let push = Infinity;
    for (let v = t; v !== s; v = parent[v]) push = Math.min(push, cap[parent[v]][v]);
    for (let v = t; v !== s; v = parent[v]) {
      const u = parent[v];
      cap[u][v] -= push;
      cap[v][u] += push;
    }
    maxFlow += push;
  }
  return maxFlow;
}`,
    java: `public int edmondsKarp(int s, int t, int n, int[][] cap) {
    int maxFlow = 0;
    while (true) {
        int[] parent = new int[n];
        Arrays.fill(parent, -1);
        parent[s] = s;
        Queue<Integer> q = new LinkedList<>();
        q.add(s);
        while (!q.isEmpty() && parent[t] == -1) {
            int u = q.poll();
            for (int v = 0; v < n; v++) {
                if (parent[v] == -1 && cap[u][v] > 0) {
                    parent[v] = u; q.add(v);
                }
            }
        }
        if (parent[t] == -1) break;
        int push = Integer.MAX_VALUE;
        for (int v = t; v != s; v = parent[v]) push = Math.min(push, cap[parent[v]][v]);
        for (int v = t; v != s; v = parent[v]) {
            int u = parent[v];
            cap[u][v] -= push; cap[v][u] += push;
        }
        maxFlow += push;
    }
    return maxFlow;
}`,
    pseudocode: `function edmondsKarp(s, t):
    maxFlow = 0
    while true:
        queue = [s], parent = {}
        while queue not empty and t not in parent:
            u = dequeue(queue)
            for each residual edge (u, v) with cap > 0:
                parent[v] = u, enqueue(queue, v)
        if t not in parent:
            break
        path = reconstruct(parent, t)
        bottleneck = min residual capacity along path
        for each edge (u, v) on path:
            residualCap(u, v) -= bottleneck
            residualCap(v, u) += bottleneck
            flow(u, v) += bottleneck
        maxFlow += bottleneck
    return maxFlow`,
  },
  generateTimeline: (input: {
    nodes: string[];
    edges: { from: string; to: string; capacity: number }[];
    source: string;
    sink: string;
  }): ExecutionFrame<EdmondsKarpState>[] => {
    const rawNodes = input?.nodes?.length ? input.nodes : ['S', 'A', 'B', 'T'];
    const rawEdges = input?.edges?.length
      ? input.edges
      : [
          { from: 'S', to: 'A', capacity: 10 },
          { from: 'S', to: 'B', capacity: 10 },
          { from: 'A', to: 'B', capacity: 2 },
          { from: 'A', to: 'T', capacity: 4 },
          { from: 'B', to: 'T', capacity: 8 },
        ];
    const source = input?.source || rawNodes[0];
    const sink = input?.sink || rawNodes[rawNodes.length - 1];

    const frames: ExecutionFrame<EdmondsKarpState>[] = [];
    const flowEdges: FlowEdge[] = rawEdges.map((e) => ({ ...e, flow: 0 }));
    let totalFlow = 0;
    let bfsCheckpointAdded = false;
    let bottleneckCheckpointAdded = false;

    const graphState = () => ({
      nodes: rawNodes,
      edges: flowEdges.map((e) => ({ ...e })),
      source,
      sink,
      augmentingPath: null as string[] | null,
      bottleneck: 0,
      totalFlow,
    });

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      action: 'INIT',
      state: graphState(),
      callStack: [{ name: 'edmondsKarp', params: { source, sink, edgeCount: rawEdges.length }, line: 2, isCurrent: true }],
      variables: { source, sink, totalFlow: 0, status: 'Ready for BFS' },
      pedagogy: {
        what: `Edmonds-Karp computes max flow from "${source}" to "${sink}" by repeatedly finding shortest augmenting paths in the residual graph.`,
        why: 'Always using a BFS shortest path bounds the number of rounds to O(V·E) — plain Ford-Fulkerson with DFS can be arbitrarily slow.',
        whatNext: 'Begin round 1 with a BFS from the source.',
      },
      explanation: `Initialized Edmonds-Karp with source "${source}" and sink "${sink}". Zero initial flow.`,
    });

    let bfsIteration = 1;
    while (true) {
      // Run BFS in residual graph
      const parent = new Map<string, string>();
      const parentEdgeIndex = new Map<string, number>();
      const isReverse = new Map<string, boolean>();
      const queue: string[] = [source];
      parent.set(source, source);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        action: 'BFS_START',
        state: graphState(),
        callStack: [{ name: 'bfsAugment()', params: { iteration: bfsIteration, source, sink }, line: 4, isCurrent: true }],
        variables: { bfsIteration, currentFlow: totalFlow, searchingForPath: true },
        conditionEval: { expr: 'queue.length > 0 && !parent.has(sink)', result: true },
        pedagogy: {
          what: `Round ${bfsIteration}: BFS explores residual edges (capacity − flow > 0 forward, flow > 0 backward) level by level from "${source}".`,
          why: 'The residual graph encodes both unused capacity and the option to cancel previous flow, which is what makes greedy augmentation globally optimal.',
          whatNext: `Dequeue "${source}" and expand its residual edges.`,
        },
        checkpoint: !bfsCheckpointAdded
          ? {
              id: 'edmonds-karp-bfs-shortest',
              question: 'Why does Edmonds-Karp insist on a BFS shortest augmenting path instead of any DFS path?',
              options: [
                'Shortest-path augmentation bounds the rounds to O(V·E); arbitrary DFS paths can need exponentially many rounds',
                'BFS paths always have the largest bottleneck, so fewer units need pushing',
              ],
              correctIndex: 0,
              explanation:
                'The shortest-path rule gives the O(V·E) round bound because each augmenting path length is non-decreasing. Bottleneck size is irrelevant to the round count; DFS can find tiny augmentations forever in pathological graphs.',
            }
          : undefined,
        explanation: `BFS Round ${bfsIteration}: Searching for shortest augmenting path from "${source}" to "${sink}" in residual graph.`,
      });
      bfsCheckpointAdded = true;

      while (queue.length > 0 && !parent.has(sink)) {
        const u = queue.shift()!;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          action: 'DEQUEUE',
          state: graphState(),
          callStack: [{ name: `dequeue("${u}")`, params: { u, queueRest: queue.length }, line: 6, isCurrent: true }],
          variables: { current: u, queue: queue.join(', ') || '(empty)', levelsExplored: queue.length },
          pedagogy: {
            what: `"${u}" leaves the BFS queue; its outgoing residual edges are inspected next.`,
            why: 'BFS order guarantees every discovered vertex is reached by a shortest path from the source.',
            whatNext: `Scan the ${flowEdges.length} edge(s) for residual capacity leaving "${u}".`,
          },
          explanation: `Dequeue "${u}" (queue now [${queue.join(', ')}]). Expanding its residual edges.`,
        });

        for (let i = 0; i < flowEdges.length; i++) {
          const e = flowEdges[i];

          if (e.from === u) {
            const resCap = e.capacity - e.flow;
            if (resCap > 0 && !parent.has(e.to)) {
              parent.set(e.to, u);
              parentEdgeIndex.set(e.to, i);
              isReverse.set(e.to, false);
              queue.push(e.to);

              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 8,
                action: 'BFS_EXPLORE',
                state: graphState(),
                callStack: [{ name: 'bfsExplore()', params: { from: u, to: e.to, resCap }, line: 8, isCurrent: true }],
                variables: { from: u, to: e.to, residualCapacity: resCap, isReverse: false, parent: `${e.to} ← ${u}` },
                conditionEval: { expr: `cap(${u}->${e.to}) - flow = ${resCap} > 0`, result: true },
                pedagogy: {
                  what: `Forward edge ${u} → ${e.to} still has ${resCap} unit(s) of unused capacity, so "${e.to}" joins the BFS tree under "${u}".`,
                  why: 'Parent pointers from BFS form the augmenting path once the sink is reached.',
                  whatNext: `Enqueue "${e.to}" and continue.`,
                },
                explanation: `Residual forward edge (${u} → ${e.to}) with ${resCap} unit(s) left. parent[${e.to}] = ${u}; enqueued.`,
              });
            } else if (resCap <= 0) {
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 8,
                action: 'BFS_REJECT',
                state: graphState(),
                callStack: [{ name: 'bfsReject()', params: { from: u, to: e.to, resCap }, line: 8, isCurrent: true }],
                variables: { from: u, to: e.to, residualCapacity: resCap, reason: 'SATURATED' },
                conditionEval: { expr: `cap(${u}->${e.to}) - flow = ${resCap} > 0`, result: false },
                pedagogy: {
                  what: `${u} → ${e.to} is saturated (flow ${e.flow} of capacity ${e.capacity}); no forward residual remains.`,
                  why: 'A saturated edge cannot carry more flow in this round; only a later cancellation (backward residual) could free it.',
                  whatNext: 'Skip this edge.',
                },
                explanation: `Forward edge (${u} → ${e.to}) saturated: ${e.flow}/${e.capacity}. Cannot enqueue "${e.to}" through it.`,
              });
            } else {
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 8,
                action: 'BFS_REJECT',
                state: graphState(),
                callStack: [{ name: 'bfsReject()', params: { from: u, to: e.to }, line: 8, isCurrent: true }],
                variables: { from: u, to: e.to, residualCapacity: resCap, reason: 'ALREADY_VISITED' },
                conditionEval: { expr: `!parent.has(${e.to})`, result: false },
                pedagogy: {
                  what: `"${e.to}" already has a parent from an earlier (equal or shorter) BFS level.`,
                  why: 'Keeping the first discovery preserves shortest-path distances; re-parenting would not shorten it.',
                  whatNext: 'Skip this edge and keep the existing parent.',
                },
                explanation: `"${e.to}" already discovered at an earlier BFS level; keeping parent ${parent.get(e.to)}.`,
              });
            }
          } else if (e.to === u && e.flow > 0) {
            if (!parent.has(e.from)) {
              parent.set(e.from, u);
              parentEdgeIndex.set(e.from, i);
              isReverse.set(e.from, true);
              queue.push(e.from);

              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 8,
                action: 'BFS_EXPLORE',
                state: graphState(),
                callStack: [{ name: 'bfsExplore()', params: { from: u, to: e.from, backwardFlow: e.flow }, line: 8, isCurrent: true }],
                variables: { from: u, to: e.from, residualCapacity: e.flow, isReverse: true, parent: `${e.from} ← ${u}` },
                conditionEval: { expr: `flow(${e.from}->${u}) = ${e.flow} > 0`, result: true },
                pedagogy: {
                  what: `Backward residual: the existing flow on ${e.from} → ${u} can be cancelled, so there is an edge "${u} → ${e.from}" of capacity ${e.flow} in the residual graph.`,
                  why: 'Cancellation is how augmentation reroutes earlier choices instead of getting stuck.',
                  whatNext: `Enqueue "${e.from}".`,
                },
                explanation: `Backward residual edge (${u} → ${e.from}) via cancelling ${e.flow} unit(s). parent[${e.from}] = ${u}; enqueued.`,
              });
            } else {
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 8,
                action: 'BFS_REJECT',
                state: graphState(),
                callStack: [{ name: 'bfsReject()', params: { from: u, to: e.from }, line: 8, isCurrent: true }],
                variables: { from: u, to: e.from, residualCapacity: e.flow, reason: 'ALREADY_VISITED' },
                conditionEval: { expr: `!parent.has(${e.from})`, result: false },
                pedagogy: {
                  what: `"${e.from}" already has a BFS parent.`,
                  why: 'First discovery wins; the residual cancellation route is already represented in the tree.',
                  whatNext: 'Skip this edge.',
                },
                explanation: `"${e.from}" already discovered; keeping parent ${parent.get(e.from)}.`,
              });
            }
          }
        }
      }

      if (!parent.has(sink)) {
        // Collect reachable nodes for Min-Cut
        const reachableFromSource = Array.from(parent.keys());
        const sinkPartition = rawNodes.filter((n) => !parent.has(n));

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          action: 'NO_MORE_PATHS',
          isMilestone: true,
          milestoneTitle: `No More Paths (flow ${totalFlow})`,
          state: graphState(),
          callStack: [{ name: 'edmondsKarp', params: { maxFlow: totalFlow, status: 'BFS exhausted' }, line: 9, isCurrent: true }],
          variables: {
            totalFlow,
            minCutS: `[${reachableFromSource.join(', ')}]`,
            minCutT: `[${sinkPartition.join(', ')}]`,
            status: 'BFS exhausted',
          },
          conditionEval: { expr: `t not in parent (sink "${sink}" unreached)`, result: true },
          pedagogy: {
            what: `BFS exhausted the residual graph without reaching "${sink}", so no augmenting path remains.`,
            why: 'The vertices BFS could reach form the source side of a minimum cut; every edge crossing it is saturated, so the current flow is maximum (max-flow min-cut theorem).',
            whatNext: 'Return the accumulated max flow.',
          },
          explanation: `No more augmenting paths exist (sink "${sink}" unreachable in the residual graph). Reachable: {${reachableFromSource.join(', ')}}. Min-Cut: S={${reachableFromSource.join(',')}}, T={${sinkPartition.join(',')}}.`,
        });
        break;
      }

      // Reconstruct path and bottleneck
      const path: string[] = [];
      let curr = sink;
      let bottleneck = Infinity;
      while (curr !== source) {
        path.unshift(curr);
        const p = parent.get(curr)!;
        const eIdx = parentEdgeIndex.get(curr)!;
        const rev = isReverse.get(curr)!;
        const e = flowEdges[eIdx];
        const resCap = rev ? e.flow : e.capacity - e.flow;
        bottleneck = Math.min(bottleneck, resCap);
        curr = p;
      }
      path.unshift(source);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 11,
        action: 'PATH_FOUND',
        isMilestone: true,
        milestoneTitle: `Augmenting Path Found: ${path.join(' → ')}`,
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          source,
          sink,
          augmentingPath: [...path],
          bottleneck: 0,
          totalFlow,
        },
        callStack: [{ name: 'reconstructPath', params: { path: path.join('->') }, line: 11, isCurrent: true }],
        variables: {
          augmentingPath: path.join(' -> '),
          hops: path.length - 1,
          currentTotalFlow: totalFlow,
        },
        pedagogy: {
          what: `Following parent pointers from "${sink}" back to "${source}" yields the shortest augmenting path ${path.join(' → ')}.`,
          why: 'Because BFS explores level by level, this path has the fewest residual edges among all current augmenting paths.',
          whatNext: 'Compute the bottleneck: the smallest residual capacity on this path.',
        },
        explanation: `Reconstructed augmenting path ${path.join(' -> ')} (${path.length - 1} hop(s)) from the BFS parent pointers.`,
      });

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 12,
        action: 'BOTTLENECK',
        isMilestone: true,
        milestoneTitle: `Bottleneck Δ = ${bottleneck}`,
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          source,
          sink,
          augmentingPath: [...path],
          bottleneck,
          totalFlow,
        },
        callStack: [{ name: 'computeBottleneck', params: { bottleneck }, line: 12, isCurrent: true }],
        variables: {
          bottleneck,
          limitingEdge: path
            .slice(0, -1)
            .map((node, idx) => {
              const to = path[idx + 1];
              const eIdx = flowEdges.findIndex(
                (e) => (e.from === node && e.to === to) || (e.to === node && e.from === to)
              );
              const e = flowEdges[eIdx];
              const rev = e.to === node;
              return { from: node, to, resCap: rev ? e.flow : e.capacity - e.flow };
            })
            .sort((a, b) => a.resCap - b.resCap)[0],
          currentTotalFlow: totalFlow,
        },
        pedagogy: {
          what: `Δ = ${bottleneck}: the smallest residual capacity along ${path.join(' → ')}.`,
          why: 'Pushing exactly Δ saturates the limiting edge but never over-saturates any edge, so the new flow stays feasible.',
          whatNext: 'Push Δ along every edge of the path.',
        },
        checkpoint: !bottleneckCheckpointAdded
          ? {
              id: 'edmonds-karp-bottleneck',
              question: `Why is pushing exactly Δ = ${bottleneck} units along the path always valid?`,
              options: [
                'Δ is the minimum residual capacity on the path, so no edge exceeds its capacity after the push',
                'Δ is the total capacity of the source, so the network can always absorb it',
              ],
              correctIndex: 0,
              explanation:
                'Feasibility is edge-local: each edge receives Δ ≤ its own residual capacity, so flow never exceeds capacity. The source total is irrelevant to this path\'s feasibility.',
            }
          : undefined,
        explanation: `Bottleneck Δ = ${bottleneck} along ${path.join(' -> ')}: the minimum residual capacity constrains the push.`,
      });
      bottleneckCheckpointAdded = true;

      // Apply augmentation
      curr = sink;
      while (curr !== source) {
        const p = parent.get(curr)!;
        const eIdx = parentEdgeIndex.get(curr)!;
        const rev = isReverse.get(curr)!;
        const e = flowEdges[eIdx];
        if (rev) {
          flowEdges[eIdx].flow -= bottleneck;
        } else {
          flowEdges[eIdx].flow += bottleneck;
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          action: 'AUGMENT_EDGE',
          state: {
            nodes: rawNodes,
            edges: flowEdges.map((x) => ({ ...x })),
            source,
            sink,
            augmentingPath: [...path],
            bottleneck,
            totalFlow,
          },
          callStack: [{ name: `pushAlong("${rev ? curr : p}" → "${rev ? p : curr}")`, params: { delta: bottleneck }, line: 16, isCurrent: true }],
          variables: {
            pathEdge: rev ? `${curr} → ${p} (cancel)` : `${p} → ${curr}`,
            direction: rev ? 'BACKWARD_CANCEL' : 'FORWARD_PUSH',
            flowBefore: rev ? e.flow + bottleneck : e.flow - bottleneck,
            flowAfter: e.flow,
            residualAfter: rev ? e.flow : e.capacity - e.flow,
          },
          pedagogy: {
            what: rev
              ? `Cancelled ${bottleneck} unit(s) on ${curr} → ${p}; its flow drops to ${e.flow}.`
              : `Pushed ${bottleneck} unit(s) on ${p} → ${curr}; its flow rises to ${e.flow} of ${e.capacity}.`,
            why: rev
              ? 'Backward residuals are the residual graph representation of undoing earlier flow, which lets augmentation reroute.'
              : 'Forward residuals represent unused capacity being consumed.',
            whatNext: 'Move to the next edge of the path.',
          },
          explanation: rev
            ? `Cancel ${bottleneck} on backward edge (${curr} → ${p}): flow ${e.flow + bottleneck} → ${e.flow}.`
            : `Push ${bottleneck} on forward edge (${p} → ${curr}): flow ${e.flow - bottleneck} → ${e.flow}.`,
        });

        curr = p;
      }

      totalFlow += bottleneck;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 17,
        action: 'AUGMENT_FLOW',
        state: {
          nodes: rawNodes,
          edges: flowEdges.map((e) => ({ ...e })),
          source,
          sink,
          augmentingPath: [...path],
          bottleneck,
          totalFlow,
        },
        callStack: [{ name: 'augmentFlow()', params: { addedFlow: bottleneck, newTotal: totalFlow }, line: 17, isCurrent: true }],
        variables: { pushedFlow: bottleneck, newTotalFlow: totalFlow, path: path.join(' -> ') },
        pedagogy: {
          what: `maxFlow += ${bottleneck} → ${totalFlow}.`,
          why: 'Each augmentation adds exactly the bottleneck; the total is a lower bound that keeps growing until no path remains.',
          whatNext: `Start round ${bfsIteration + 1} with another BFS.`,
        },
        explanation: `Augmentation complete: pushed ${bottleneck} unit(s) along ${path.join(' -> ')}. Cumulative flow is now ${totalFlow}.`,
      });

      bfsIteration++;
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      action: 'COMPLETE',
      isMilestone: true,
      milestoneTitle: `Max Flow = ${totalFlow}`,
      state: graphState(),
      callStack: [{ name: 'edmondsKarp.complete', params: { maxFlow: totalFlow, rounds: bfsIteration - 1 }, line: 18, isCurrent: true }],
      variables: { maxFlow: totalFlow, rounds: bfsIteration - 1 },
      pedagogy: {
        what: `Return maxFlow = ${totalFlow} after ${bfsIteration - 1} augmenting round(s).`,
        why: 'Unreachability of the sink in the residual graph certifies optimality via the max-flow min-cut theorem — no better flow exists.',
        whatNext: 'Compare the saturated cut with other flow algorithms (Dinic, Hopcroft-Karp for bipartite matching).',
      },
      explanation: `Edmonds-Karp complete: maximum flow from "${source}" to "${sink}" is ${totalFlow}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<EdmondsKarpState>) => {
    const { nodes, edges, source, sink, augmentingPath, bottleneck, totalFlow } = frame.state;
    const n = nodes.length;
    const width = 500;
    const height = 280;

    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((u, i) => {
      if (u === source) {
        positions[u] = { x: 50, y: height / 2 };
      } else if (u === sink) {
        positions[u] = { x: width - 50, y: height / 2 };
      } else {
        const col = 120 + ((width - 240) * (i - 1)) / Math.max(1, n - 2);
        const yOffset = i % 2 === 1 ? 70 : 210;
        positions[u] = { x: col, y: yOffset };
      }
    });

    const pathEdges = new Set<string>();
    if (augmentingPath) {
      for (let i = 0; i < augmentingPath.length - 1; i++) {
        pathEdges.add(`${augmentingPath[i]}->${augmentingPath[i + 1]}`);
        pathEdges.add(`${augmentingPath[i + 1]}->${augmentingPath[i]}`);
      }
    }

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
          {augmentingPath && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded animate-pulse">
                + Path: {augmentingPath.join('→')} (Capacity {bottleneck})
              </span>
            </div>
          )}
        </div>

        {/* Network Stage SVG */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <marker
                id="arrow-cyan"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
              </marker>
              <marker
                id="arrow-amber"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((e, idx) => {
              const p1 = positions[e.from];
              const p2 = positions[e.to];
              if (!p1 || !p2) return null;
              const isAugPath = pathEdges.has(`${e.from}->${e.to}`);
              const isSaturated = e.flow === e.capacity && e.capacity > 0;
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isAugPath ? '#f59e0b' : isSaturated ? '#ef4444' : '#334155'}
                    strokeWidth={isAugPath ? '4' : '2'}
                    strokeDasharray={isSaturated ? '4 3' : undefined}
                    markerEnd={isAugPath ? 'url(#arrow-amber)' : 'url(#arrow-cyan)'}
                    className="transition-colors duration-200"
                  />
                  <rect
                    x={midX - 18}
                    y={midY - 10}
                    width="36"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={isAugPath ? '#f59e0b' : '#334155'}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={isAugPath ? '#fef08a' : isSaturated ? '#f87171' : '#94a3b8'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {e.flow}/{e.capacity}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((u) => {
              const p = positions[u];
              const isSource = u === source;
              const isSink = u === sink;
              const inPath = augmentingPath && augmentingPath.includes(u);

              return (
                <g key={u}>
                  {inPath && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="26"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="18"
                    fill={isSource ? '#065f46' : isSink ? '#7f1d1d' : '#1e293b'}
                    stroke={isSource ? '#10b981' : isSink ? '#ef4444' : '#64748b'}
                    strokeWidth="3"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {u}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-700 border border-emerald-500 inline-block" />
            <span>Source (S)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-700 border border-rose-500 inline-block" />
            <span>Sink (T)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400 inline-block" />
            <span>Augmenting Path</span>
          </div>
        </div>
      </div>
    );
  },
};
