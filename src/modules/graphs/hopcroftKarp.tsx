import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BipartiteEdge {
  u: number;
  v: number;
}

export interface HopcroftKarpState {
  uCount: number;
  vCount: number;
  edges: BipartiteEdge[];
  pairU: Record<number, number>; // u -> matched v (-1 if unmatched)
  pairV: Record<number, number>; // v -> matched u (-1 if unmatched)
  dist: Record<number, number>;
  activePath: { u: number; v: number }[];
  phase: 'BFS' | 'DFS' | 'COMPLETE';
  matchingSize: number;
}

export const hopcroftKarpModule: AlgorithmModule<
  { uCount: number; vCount: number; edges: BipartiteEdge[] },
  HopcroftKarpState
> = {
  id: 'hopcroft-karp',
  title: 'Hopcroft-Karp Algorithm (Maximum Bipartite Matching O(E sqrt(V)))',
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(E)',
    timeAverage: 'O(E sqrt(V))',
    timeWorst: 'O(E sqrt(V))',
    spaceAuxiliary: 'O(V) queue & distance arrays',
    worstCaseCondition: 'Dense graphs requiring O(sqrt(V)) full phases of BFS and DFS traversals',
  },
  theory: {
    overview:
      'The Hopcroft-Karp algorithm finds the maximum cardinality matching in a bipartite graph G = (U, V, E). By augmenting along multiple shortest vertex-disjoint augmenting paths simultaneously, it achieves an optimal O(E sqrt(V)) runtime, outperforming Edmonds-Karp and Ford-Fulkerson.',
    whyItWorks:
      'Each iteration runs a BFS to discover the length of the shortest augmenting paths and create a level graph, followed immediately by a maximal DFS that augments along disjoint paths without interference. The shortest path length increases strictly each phase, bounding iterations by 2 * sqrt(V).',
    invariant:
      'Alternating Path Invariant: Every augmenting path alternates between unmatched and matched edges, starting and ending at free (unmatched) vertices in U and V. Augmentation inverts edge membership, increasing total matching size by 1 per path.',
    pitfalls: [
      'Failing to reset visited markers between DFS searches within the same phase, leading to overlapping non-disjoint path augmentations.',
      'Allowing BFS to proceed past the minimum distance layer where a free vertex was already found.',
    ],
  },
  presets: [
    {
      id: 'bipartite-4x4-standard',
      label: '4x4 Bipartite Job Assignment',
      description: '4 workers and 4 tasks with overlapping qualifications',
      data: {
        uCount: 4,
        vCount: 4,
        edges: [
          { u: 1, v: 1 },
          { u: 1, v: 2 },
          { u: 2, v: 1 },
          { u: 2, v: 3 },
          { u: 3, v: 2 },
          { u: 3, v: 4 },
          { u: 4, v: 3 },
        ],
      },
    },
    {
      id: 'bipartite-chain',
      label: 'Alternating Path Chain',
      description: 'Requires multi-hop alternating path discovery across sets',
      data: {
        uCount: 4,
        vCount: 4,
        edges: [
          { u: 1, v: 1 },
          { u: 2, v: 1 },
          { u: 2, v: 2 },
          { u: 3, v: 2 },
          { u: 3, v: 3 },
          { u: 4, v: 3 },
          { u: 4, v: 4 },
        ],
      },
    },
  ],
  defaultInput: {
    uCount: 4,
    vCount: 4,
    edges: [
      { u: 1, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 1 },
      { u: 2, v: 3 },
      { u: 3, v: 2 },
      { u: 3, v: 4 },
      { u: 4, v: 3 },
    ],
  },
  codeSnippets: {
    cpp: `bool bfs() {
    queue<int> Q;
    for (int u = 1; u <= uCount; u++) {
        if (pairU[u] == 0) { dist[u] = 0; Q.push(u); }
        else dist[u] = INF;
    }
    dist[0] = INF;
    while (!Q.empty()) {
        int u = Q.front(); Q.pop();
        if (dist[u] < dist[0]) {
            for (int v : adj[u]) {
                if (dist[pairV[v]] == INF) {
                    dist[pairV[v]] = dist[u] + 1;
                    Q.push(pairV[v]);
                }
            }
        }
    }
    return dist[0] != INF;
}

bool dfs(int u) {
    if (u != 0) {
        for (int v : adj[u]) {
            if (dist[pairV[v]] == dist[u] + 1 && dfs(pairV[v])) {
                pairV[v] = u; pairU[u] = v;
                return true;
            }
        }
        dist[u] = INF;
        return false;
    }
    return true;
}`,
    python: `def hopcroft_karp(u_count, v_count, adj):
    pair_u = {u: None for u in range(1, u_count + 1)}
    pair_v = {v: None for v in range(1, v_count + 1)}
    dist = {}

    def bfs():
        queue = collections.deque()
        for u in range(1, u_count + 1):
            if pair_u[u] is None:
                dist[u] = 0
                queue.append(u)
            else:
                dist[u] = float('inf')
        dist[None] = float('inf')
        while queue:
            u = queue.popleft()
            if dist[u] < dist[None]:
                for v in adj[u]:
                    nxt = pair_v[v]
                    if dist[nxt] == float('inf'):
                        dist[nxt] = dist[u] + 1
                        queue.append(nxt)
        return dist[None] != float('inf')

    matching = 0
    while bfs():
        for u in range(1, u_count + 1):
            if pair_u[u] is None and dfs(u):
                matching += 1
    return matching`,
    typescript: `function hopcroftKarp(uCount: number, vCount: number, adj: number[][]): number {
  const pairU: number[] = new Array(uCount + 1).fill(0);
  const pairV: number[] = new Array(vCount + 1).fill(0);
  const dist: number[] = new Array(uCount + 1).fill(0);
  let matching = 0;

  while (bfs(uCount, pairU, pairV, dist, adj)) {
    for (let u = 1; u <= uCount; u++) {
      if (pairU[u] === 0 && dfs(u, pairU, pairV, dist, adj)) {
        matching++;
      }
    }
  }
  return matching;
}`,
    java: `public int hopcroftKarp() {
    matching = 0;
    while (bfs()) {
        for (int u = 1; u <= uCount; u++) {
            if (pairU[u] == 0 && dfs(u)) matching++;
        }
    }
    return matching;
}`,
    pseudocode: `function hopcroftKarp(G):
    matching = 0
    while bfsLevels():
        for each free vertex u in U:
            if dfsAugment(u):
                matching += 1
    return matching
function bfsLevels():
    dist[u] = 0 for free u in U, INF otherwise
    queue = free vertices of U
    while queue not empty:
        u = dequeue(queue)
        for each neighbor v of u:
            nextU = pairV[v]              # U vertex matched to v (0 = free)
            if dist[nextU] == INF:
                dist[nextU] = dist[u] + 1
                enqueue(queue, nextU)
    return dist[0] != INF                 # a free V vertex is reachable
function dfsAugment(u):
    for each neighbor v of u:
        nextU = pairV[v]
        if dist[nextU] == dist[u] + 1:
            if dfsAugment(nextU):
                pairV[v] = u; pairU[u] = v
                return true
    dist[u] = INF                         # prune dead end
    return false`,
  },
  generateTimeline: (input: {
    uCount: number;
    vCount: number;
    edges: BipartiteEdge[];
  }): ExecutionFrame<HopcroftKarpState>[] => {
    const uCount = input?.uCount ?? 4;
    const vCount = input?.vCount ?? 4;
    const edges = input?.edges ?? [
      { u: 1, v: 1 },
      { u: 1, v: 2 },
      { u: 2, v: 1 },
      { u: 2, v: 3 },
      { u: 3, v: 2 },
      { u: 3, v: 4 },
      { u: 4, v: 3 },
    ];

    const adj: Record<number, number[]> = {};
    for (let u = 1; u <= uCount; u++) adj[u] = [];
    for (const e of edges) {
      if (!adj[e.u]) adj[e.u] = [];
      adj[e.u].push(e.v);
    }

    const pairU: Record<number, number> = {};
    for (let u = 1; u <= uCount; u++) pairU[u] = 0;
    const pairV: Record<number, number> = {};
    for (let v = 1; v <= vCount; v++) pairV[v] = 0;
    const dist: Record<number, number> = {};

    const frames: ExecutionFrame<HopcroftKarpState>[] = [];
    let matchingSize = 0;
    let checkpointAdded = false;

    const baseState = (over: Partial<HopcroftKarpState> = {}): HopcroftKarpState => ({
      uCount,
      vCount,
      edges,
      pairU: { ...pairU },
      pairV: { ...pairV },
      dist: { ...dist },
      activePath: [],
      phase: 'BFS',
      matchingSize,
      ...over,
    });

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Hopcroft-Karp (|U|=${uCount}, |V|=${vCount})`,
      action: 'INIT',
      state: baseState(),
      callStack: [{ name: 'hopcroftKarp', params: { uCount, vCount, edgeCount: edges.length }, line: 2, isCurrent: true }],
      variables: { uCount, vCount, matchingSize: 0, phase: 'Initialization' },
      conditionEval: { expr: 'uCount > 0 && vCount > 0', result: true },
      soundCue: { type: 'step' },
      pedagogy: {
        what: `Hopcroft-Karp finds a maximum bipartite matching by alternating BFS level-building with DFS augmentation.`,
        why: 'Each phase finds a maximal set of shortest vertex-disjoint augmenting paths, so the shortest path length increases and at most O(√V) phases are needed.',
        whatNext: `Begin phase 1: BFS over alternating paths from free U vertices.`,
      },
      explanation: `Initialized bipartite graph with |U|=${uCount}, |V|=${vCount}, and ${edges.length} candidate edges. Matching size: 0.`,
    });

    const INF = 999999;

    function bfs(): boolean {
      const queue: number[] = [];
      for (let u = 1; u <= uCount; u++) {
        if (pairU[u] === 0) {
          dist[u] = 0;
          queue.push(u);
        } else {
          dist[u] = INF;
        }
      }
      dist[0] = INF;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 10,
        action: 'BFS_INIT',
        state: baseState({ phase: 'BFS' }),
        callStack: [{ name: 'bfsLevels.init', params: { freeU: queue.join(',') || 'none' }, line: 10, isCurrent: true }],
        variables: { freeU: queue.map((u) => `U${u}`).join(', ') || 'none', queueSize: queue.length },
        pedagogy: {
          what: queue.length
            ? `Free U vertices [${queue.map((u) => `U${u}`).join(', ')}] start at dist 0; matched ones get INF.`
            : 'No free U vertex remains — every U is matched, so BFS has nowhere to start.',
          why: 'Augmenting paths start at free U vertices and alternate unmatched/matched edges; dist 0 anchors their lengths.',
          whatNext: queue.length ? 'Dequeue free vertices and label the U vertices reached through matched edges.' : 'BFS returns false: the matching is maximum.',
        },
        explanation: `BFS seeded with free U vertices [${queue.map((u) => `U${u}`).join(', ') || 'none'}]; dist[0] = INF (no free V found yet).`,
      });

      while (queue.length > 0) {
        const u = queue.shift()!;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 12,
          action: 'DEQUEUE',
          state: baseState({ phase: 'BFS' }),
          callStack: [{ name: `dequeue(${u === 0 ? 'freeV' : `U${u}`})`, params: { u }, line: 12, isCurrent: true }],
          variables: { current: u === 0 ? 'free V (sink layer)' : `U${u}`, dist: dist[u], queue: queue.map((x) => (x === 0 ? 'freeV' : `U${x}`)).join(', ') || '(empty)' },
          pedagogy: {
            what: u === 0 ? 'The free-V sentinel was dequeued; BFS layers are complete.' : `U${u} (dist ${dist[u]}) is expanded next.`,
            why: 'BFS explores alternating paths level by level, measuring their lengths in dist[].',
            whatNext: u === 0 ? 'Dequeue the remaining vertices.' : `For each neighbor V, follow its matched U vertex.`,
          },
          explanation: `Dequeue ${u === 0 ? 'the free-V sentinel (dist ' + dist[0] + ')' : `U${u} (dist ${dist[u]})`}; scanning its edges.`,
        });

        if (dist[u] < dist[0]) {
          for (const v of adj[u] || []) {
            const nextU = pairV[v];
            if (dist[nextU] === INF) {
              dist[nextU] = dist[u] + 1;
              queue.push(nextU);

              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 16,
                action: 'LEVEL_ASSIGN',
                state: baseState({ phase: 'BFS' }),
                callStack: [{ name: `assignLevel(${nextU === 0 ? 'freeV' : `U${nextU}`})`, params: { via: `U${u}`, v }, line: 16, isCurrent: true }],
                variables: {
                  through: `U${u} — V${v}`,
                  nextU: nextU === 0 ? 'free V (path complete)' : `U${nextU}`,
                  assignedDist: dist[nextU],
                },
                conditionEval: { expr: `dist[nextU] == INF`, result: true },
                pedagogy: {
                  what: nextU === 0
                    ? `U${u} — V${v} reaches an unmatched V vertex: an augmenting path of length ${dist[u] + 1} exists.`
                    : `U${u} — V${v} continues through matched vertex U${nextU}, which gets dist ${dist[nextU]}.`,
                  why: 'The BFS alternates unmatched and matched edges; every hop adds one to the distance.',
                  whatNext: nextU === 0 ? 'Record the shortest length dist[0].' : `Enqueue U${nextU}.`,
                },
                explanation: nextU === 0
                  ? `U${u} — V${v} reaches free V: dist[0] = ${dist[0]} (shortest augmenting path length).`
                  : `Assigned dist[U${nextU}] = ${dist[nextU]} via U${u} — V${v}.`,
              });
            } else {
              frames.push({
                stepIndex: frames.length,
                totalSteps: 1,
                codeLine: 15,
                action: 'LEVEL_REJECT',
                state: baseState({ phase: 'BFS' }),
                callStack: [{ name: `rejectEdge(U${u} — V${v})`, params: { reason: nextU === 0 ? 'ALREADY_FOUND' : 'ALREADY_LABELED' }, line: 15, isCurrent: true }],
                variables: { through: `U${u} — V${v}`, nextU: nextU === 0 ? 'free V' : `U${nextU}`, existingDist: dist[nextU], reason: nextU === 0 ? 'ALREADY_FOUND' : 'ALREADY_LABELED' },
                conditionEval: { expr: `dist[nextU] == INF`, result: false },
                pedagogy: {
                  what: nextU === 0
                    ? `A free V vertex was already found with length ${dist[0]}.`
                    : `U${nextU} already has dist ${dist[nextU]} from an earlier (equal or shorter) alternating path.`,
                  why: 'Keeping the first label preserves shortest augmenting path lengths; longer routes are discarded.',
                  whatNext: 'Skip this edge.',
                },
                explanation: nextU === 0 ? `Free V already found at length ${dist[0]}.` : `U${nextU} already labeled dist ${dist[nextU]}.`,
              });
            }
          }
        }
      }
      return dist[0] !== INF;
    }

    function dfs(u: number, currentPath: { u: number; v: number }[]): boolean {
      if (u !== 0) {
        for (const v of adj[u] || []) {
          const nextU = pairV[v];
          if (dist[nextU] === dist[u] + 1) {
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 23,
              action: 'DFS_TRY',
              state: baseState({ phase: 'DFS', activePath: currentPath.map((e) => ({ ...e })) }),
              callStack: [{ name: `dfsAugment(U${u})`, params: { via: `V${v}`, nextU: nextU === 0 ? 'freeV' : `U${nextU}` }, line: 23, isCurrent: true }],
              variables: { from: `U${u}`, v, nextU: nextU === 0 ? 'free V' : `U${nextU}`, admissible: true },
              conditionEval: { expr: `dist[nextU] == dist[U${u}] + 1`, result: true },
              pedagogy: {
                what: `U${u} — V${v} is admissible: it advances exactly one BFS layer${nextU === 0 ? ' and lands on a free V vertex' : ` to U${nextU}`}.`,
                why: 'Only layered edges can appear on a shortest augmenting path; skipping others keeps the phase optimal.',
                whatNext: nextU === 0 ? 'Free V reached — augment along the whole path.' : `Recurse into U${nextU}.`,
              },
              explanation: `DFS explores admissible edge U${u} — V${v}${nextU === 0 ? ' reaching free V' : ` continuing to U${nextU}`}.`,
            });
            currentPath.push({ u, v });
            if (dfs(nextU, currentPath)) {
              pairV[v] = u;
              pairU[u] = v;
              return true;
            }
            currentPath.pop();
          } else {
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 22,
              action: 'DFS_REJECT',
              state: baseState({ phase: 'DFS', activePath: currentPath.map((e) => ({ ...e })) }),
              callStack: [{ name: `dfsAugment(U${u})`, params: { via: `V${v}` }, line: 22, isCurrent: true }],
              variables: { from: `U${u}`, v, nextU: nextU === 0 ? 'free V' : `U${nextU}`, admissible: false, nextDist: dist[nextU] },
              conditionEval: { expr: `dist[nextU] == dist[U${u}] + 1`, result: false },
              pedagogy: {
                what: `${nextU === 0 ? 'The free V vertex' : `U${nextU}`} sits at dist ${dist[nextU]}, not ${dist[u] + 1}.`,
                why: 'Following a non-layered edge would leave the shortest-path subgraph and could produce a non-shortest augmentation.',
                whatNext: `Try U${u}'s next edge.`,
              },
              explanation: `Edge U${u} — V${v} is not layered (dist ${dist[nextU]} ≠ ${dist[u] + 1}); skipped.`,
            });
          }
        }
        dist[u] = INF;

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 26,
          action: 'DFS_PRUNE',
          state: baseState({ phase: 'DFS', activePath: currentPath.map((e) => ({ ...e })) }),
          callStack: [{ name: `prune(U${u})`, params: { u }, line: 26, isCurrent: true }],
          variables: { pruned: `U${u}`, reason: 'No admissible continuation' },
          soundCue: { type: 'compare' },
          pedagogy: {
            what: `No admissible edge from U${u} leads to the sink layer, so dist[U${u}] is set to INF.`,
            why: 'Pruning dead ends prevents later DFS calls in the same phase from re-exploring them — this is what keeps each phase near-linear.',
            whatNext: 'Backtrack and let the caller try its next edge.',
          },
          explanation: `DFS dead end at U${u}: dist pruned to INF, backtracking.`,
        });
        return false;
      }
      return true;
    }

    let iteration = 0;
    while (bfs()) {
      iteration++;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 18,
        isMilestone: true,
        milestoneTitle: `BFS Phase ${iteration} Level Graph`,
        action: 'BFS_LAYER_BUILT',
        state: baseState({ phase: 'BFS' }),
        callStack: [{ name: 'bfsPhase', params: { iteration }, line: 18, isCurrent: true }],
        variables: { iteration, shortestAugPathLength: dist[0], currentMatching: matchingSize },
        conditionEval: { expr: `dist[0] !== INF`, result: true },
        soundCue: { type: 'step' },
        pedagogy: {
          what: `The layered graph is complete and a free V vertex sits at distance ${dist[0]}.`,
          why: 'Every augmenting path in this phase will have exactly this shortest length; DFS is restricted to layered edges to enforce it.',
          whatNext: 'Run DFS from each free U vertex to extract vertex-disjoint augmenting paths.',
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'hopcroft-karp-layer-dfs',
              question: 'Why does DFS only follow edges with dist[nextU] == dist[u] + 1?',
              options: [
                'Restricting to layered edges makes every augmentation shortest and vertex-disjoint, so the phase count is bounded by O(√V)',
                'It avoids walking matched edges twice, which would be slower',
              ],
              correctIndex: 0,
              explanation:
                'The layered condition guarantees each DFS augmentation has the current shortest length. The shortest length strictly grows after each phase, and one can show at most O(√V) phases are needed before the matching is maximum.',
            }
          : undefined,
        explanation: `BFS Phase ${iteration}: Level graph constructed. Shortest augmenting path layer distance = ${dist[0]}. DFS will now extract maximal vertex-disjoint paths.`,
      });
      checkpointAdded = true;

      for (let u = 1; u <= uCount; u++) {
        if (pairU[u] === 0) {
          const path: { u: number; v: number }[] = [];

          // Frame: DFS search attempt from free vertex
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 5,
            action: 'DFS_SEARCH',
            state: baseState({ phase: 'DFS' }),
            callStack: [{ name: `dfsAugment(U${u})`, params: { u }, line: 5, isCurrent: true }],
            variables: { startFreeU: `U${u}`, matchingSize },
            conditionEval: { expr: `pairU[U${u}] === 0`, result: true },
            soundCue: { type: 'compare' },
            pedagogy: {
              what: `U${u} is free, so it can be the start of an augmenting path this phase.`,
              why: 'Augmenting paths must begin and end at free vertices; starting only from free U avoids pointless searches.',
              whatNext: 'Follow admissible layered edges until a free V vertex is reached.',
            },
            explanation: `DFS initiated from unmatched vertex U${u} exploring admissible alternating edges where dist[nextU] == dist[u] + 1.`,
          });

          if (dfs(u, path)) {
            matchingSize++;
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 24,
              isMilestone: true,
              milestoneTitle: `Augmented: +1 Match (${matchingSize})`,
              action: 'AUGMENT_PATH',
              state: baseState({ phase: 'DFS', activePath: [...path] }),
              callStack: [{ name: 'dfsAugment', params: { startU: u, pathLength: path.length }, line: 24, isCurrent: true }],
              variables: {
                augmentedStartU: `U${u}`,
                newMatchingSize: matchingSize,
                pathSummary: path.map((e) => `U${e.u}-V${e.v}`).join(' -> '),
              },
              conditionEval: { expr: 'augmentingPathFound', result: true },
              soundCue: { type: 'insert' },
              pedagogy: {
                what: `Unmatched edges flip to matched along [${path.map((e) => `U${e.u}-V${e.v}`).join(' → ')}], growing the matching to ${matchingSize}.`,
                why: 'An augmenting path alternates unmatched/matched edges and has one more unmatched edge than matched, so flipping adds exactly one match.',
                whatNext: 'Try the next free U vertex in the same phase.',
              },
              explanation: `Augmented matching along path [${path.map((e) => `U${e.u}-V${e.v}`).join(' -> ')}]. Flipped edge matches, expanding matching cardinality to ${matchingSize}.`,
            });
          }
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 7,
      isMilestone: true,
      milestoneTitle: `Max Matching: ${matchingSize} Pairs`,
      action: 'COMPLETE',
      state: baseState({ phase: 'COMPLETE', dist: {} }),
      callStack: [{ name: 'complete', params: { maxMatching: matchingSize }, line: 7, isCurrent: true }],
      variables: { completed: true, maxMatching: matchingSize, matchedPairs: Object.entries(pairU).filter(([, v]) => v > 0).map(([u, v]) => `U${u}=V${v}`).join(', ') },
      conditionEval: { expr: 'bfsNoMoreAugmentingPaths', result: true },
      soundCue: { type: 'complete' },
      pedagogy: {
        what: `Return matching = ${matchingSize}: ${Object.entries(pairU).filter(([, v]) => v > 0).map(([u, v]) => `U${u}–V${v}`).join(', ')}.`,
        why: 'BFS found no free V vertex, i.e. no augmenting path exists; by Berge\'s theorem the matching is maximum.',
        whatNext: 'Compare with Edmonds-Karp: max matching is a unit-capacity max-flow, and Hopcroft-Karp is the specialized O(E√V) algorithm.',
      },
      explanation: `Hopcroft-Karp algorithm terminated. No augmenting paths remain. Maximum Bipartite Matching cardinality = ${matchingSize}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });

    return frames;
  },
  renderStage: (frame: ExecutionFrame<HopcroftKarpState>) => {
    const { uCount, vCount, edges, pairU, activePath, phase, matchingSize } = frame.state;

    const leftX = 140;
    const rightX = 460;
    const spacing = 65;
    const startY = 60;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Phase:</span>
            <span
              className={`font-mono text-xs font-bold px-3 py-1 rounded border ${
                phase === 'COMPLETE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : phase === 'DFS'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {phase}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Cardinality: <strong className="text-emerald-400 text-sm">{matchingSize}</strong>
            </span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[360px] flex items-center justify-center">
          <svg className="w-[600px] h-[340px]" viewBox="0 0 600 340">
            {/* Draw Edges */}
            {edges.map((e, idx) => {
              const uy = startY + (e.u - 1) * spacing;
              const vy = startY + (e.v - 1) * spacing;
              const isMatched = pairU[e.u] === e.v;
              const isPath = activePath.some((p) => p.u === e.u && p.v === e.v);

              let stroke = '#334155';
              let width = '1.5';
              let dash = '4 4';

              if (isPath) {
                stroke = '#f59e0b';
                width = '3.5';
                dash = undefined as any;
              } else if (isMatched) {
                stroke = '#10b981';
                width = '3';
                dash = undefined as any;
              }

              return (
                <line
                  key={`edge-${idx}`}
                  x1={leftX}
                  y1={uy}
                  x2={rightX}
                  y2={vy}
                  stroke={stroke}
                  strokeWidth={width}
                  strokeDasharray={dash}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Left Column U Vertices */}
            {Array.from({ length: uCount }).map((_, i) => {
              const u = i + 1;
              const y = startY + i * spacing;
              const isMatched = pairU[u] > 0;

              return (
                <g key={`u-${u}`}>
                  <circle
                    cx={leftX}
                    cy={y}
                    r="20"
                    fill={isMatched ? '#064e3b' : '#1e293b'}
                    stroke={isMatched ? '#34d399' : '#64748b'}
                    strokeWidth="2"
                  />
                  <text
                    x={leftX}
                    y={y + 5}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    U{u}
                  </text>
                  <text
                    x={leftX - 35}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {isMatched ? `-> V${pairU[u]}` : 'free'}
                  </text>
                </g>
              );
            })}

            {/* Right Column V Vertices */}
            {Array.from({ length: vCount }).map((_, i) => {
              const v = i + 1;
              const y = startY + i * spacing;
              const matchedU = Object.entries(pairU).find(([_, mv]) => mv === v)?.[0];
              const isMatched = !!matchedU;

              return (
                <g key={`v-${v}`}>
                  <circle
                    cx={rightX}
                    cy={y}
                    r="20"
                    fill={isMatched ? '#064e3b' : '#1e293b'}
                    stroke={isMatched ? '#34d399' : '#64748b'}
                    strokeWidth="2"
                  />
                  <text
                    x={rightX}
                    y={y + 5}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    V{v}
                  </text>
                  <text
                    x={rightX + 35}
                    y={y + 4}
                    textAnchor="start"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {isMatched ? `<- U${matchedU}` : 'free'}
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
