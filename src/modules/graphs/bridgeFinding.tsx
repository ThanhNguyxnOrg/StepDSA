import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface UndirectedEdge {
  u: string;
  v: string;
}

export interface BridgeFindingState {
  nodes: string[];
  edges: UndirectedEdge[];
  activeNode: string | null;
  activeNeighbor: string | null;
  disc: Record<string, number>;
  low: Record<string, number>;
  bridges: string[]; // "u-v" strings
}

export const bridgeFindingModule: AlgorithmModule<
  { nodes: string[]; edges: UndirectedEdge[] },
  BridgeFindingState
> = {
  id: 'bridge-finding',
  title: 'Bridge Finding in Graphs (Tarjan DFS Low-Point O(V + E))',
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V) recursion stack and low-point arrays',
    worstCaseCondition: 'Single linear DFS traversal over vertices and undirected edges',
  },
  theory: {
    overview:
      'A bridge (or cut-edge) is an edge whose removal strictly increases the number of connected components in an undirected graph. Tarjan DFS identifies all bridges in O(V + E) time.',
    whyItWorks:
      'In a DFS tree, an edge (u, v) is a bridge if and only if no vertex in the subtree rooted at v has a back-edge to u or an ancestor of u. This condition is verified when low[v] > disc[u].',
    invariant:
      'Low-Point Invariant: low[u] is the earliest discovery time reachable from u via DFS tree edges and at most one back-edge.',
    pitfalls: [
      'Counting the edge back to the direct parent as a back-edge (must explicitly ignore parent edge during DFS).',
    ],
  },
  presets: [
    {
      id: 'classic-bridge',
      label: 'Two Triangles with Bridge: (A-B-C) - (C-D) - (D-E-F)',
      description: 'Edge C - D is the sole critical bridge',
      data: {
        nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
        edges: [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'A' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'F' },
          { u: 'F', v: 'D' },
        ],
      },
    },
    {
      id: 'simple-tree',
      label: 'Linear Tree: 4 Nodes (All Edges are Bridges)',
      description: 'In any tree, 100% of edges are bridges',
      data: {
        nodes: ['0', '1', '2', '3'],
        edges: [
          { u: '0', v: '1' },
          { u: '1', v: '2' },
          { u: '2', v: '3' },
        ],
      },
    },
  ],
  defaultInput: {
    nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [
      { u: 'A', v: 'B' },
      { u: 'B', v: 'C' },
      { u: 'C', v: 'A' },
      { u: 'C', v: 'D' },
      { u: 'D', v: 'E' },
      { u: 'E', v: 'F' },
      { u: 'F', v: 'D' },
    ],
  },
  codeSnippets: {
    cpp: `void findBridges(int u, int parent, int& timer, vector<int>& disc, vector<int>& low,
                 const vector<vector<int>>& adj, vector<pair<int, int>>& bridges) {
    disc[u] = low[u] = ++timer;
    for (int v : adj[u]) {
        if (v == parent) continue;
        if (disc[v] != -1) {
            low[u] = min(low[u], disc[v]);
        } else {
            findBridges(v, u, timer, disc, low, adj, bridges);
            low[u] = min(low[u], low[v]);
            if (low[v] > disc[u]) {
                bridges.push_back({u, v});
            }
        }
    }
}`,
    python: `def find_bridges(nodes, edges):
    adj = {u: [] for u in nodes}
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    timer = 0
    disc, low, bridges = {}, {}, []
    def dfs(u, parent):
        nonlocal timer
        timer += 1
        disc[u] = low[u] = timer
        for v in adj[u]:
            if v == parent: continue
            if v in disc:
                low[u] = min(low[u], disc[v])
            else:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridges.append((u, v))
    for u in nodes:
        if u not in disc: dfs(u, None)
    return bridges`,
    typescript: `function findBridges(nodes: string[], edges: UndirectedEdge[]): string[] {
    const adj: Record<string, string[]> = {};
    for (const n of nodes) adj[n] = [];
    for (const e of edges) {
        adj[e.u].push(e.v);
        adj[e.v].push(e.u);
    }
    let timer = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const bridges: string[] = [];

    function dfs(u: string, parent: string | null) {
        disc[u] = low[u] = ++timer;
        for (const v of adj[u]) {
            if (v === parent) continue;
            if (disc[v] !== undefined) {
                low[u] = Math.min(low[u], disc[v]);
            } else {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) {
                    bridges.push(\`\${u}-\${v}\`);
                }
            }
        }
    }
    for (const n of nodes) {
        if (disc[n] === undefined) dfs(n, null);
    }
    return bridges;
}`,
    java: `void dfs(int u, int p, int[] disc, int[] low, List<List<Integer>> adj, List<int[]> bridges) {
    disc[u] = low[u] = ++timer;
    for (int v : adj.get(u)) {
        if (v == p) continue;
        if (disc[v] != -1) {
            low[u] = Math.min(low[u], disc[v]);
        } else {
            dfs(v, u, disc, low, adj, bridges);
            low[u] = Math.min(low[u], low[v]);
            if (low[v] > disc[u]) {
                bridges.add(new int[]{u, v});
            }
        }
    }
}`,
    pseudocode: `function findBridges(graph):
    timer = 0, disc = {}, low = {}, bridges = []
    function dfs(u, parent):
        disc[u] = low[u] = ++timer
        for each v in adj[u]:
            if v == parent: continue
            if v visited:
                low[u] = min(low[u], disc[v])
            else:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridges.append((u, v))
    for each u in graph: if unvisited dfs(u, null)
    return bridges`,
  },

  generateTimeline: (input: {
    nodes: string[];
    edges: UndirectedEdge[];
  }): ExecutionFrame<BridgeFindingState>[] => {
    const nodes = input?.nodes?.length ? input.nodes : ['A', 'B', 'C', 'D', 'E', 'F'];
    const edges = input?.edges?.length
      ? input.edges
      : [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'A' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'F' },
          { u: 'F', v: 'D' },
        ];

    const adj: Record<string, string[]> = {};
    nodes.forEach((n) => {
      adj[n] = [];
    });
    edges.forEach((e) => {
      if (!adj[e.u]) adj[e.u] = [];
      if (!adj[e.v]) adj[e.v] = [];
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    });

    let timer = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const bridges: string[] = [];

    const frames: ExecutionFrame<BridgeFindingState>[] = [];

    let checkpointAdded = false;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      explanation: `Initialize Tarjan's Bridge-Finding algorithm for ${nodes.length} vertices and ${edges.length} edges.`,
      variables: { totalNodes: nodes.length, totalEdges: edges.length },
      callStack: [{ name: 'findBridges()', params: { vertices: nodes.length }, line: 2, isCurrent: true }],
      pedagogy: {
        what: 'A bridge is an edge whose removal disconnects the graph — the undirected analogue of a critical link.',
        why: 'Same low-link pass as articulation points, but with a strict comparison: an edge is critical only when the child subtree cannot even reach the parent.',
        whatNext: 'Run DFS and timestamp each visit.',
      },
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: {},
        low: {},
        bridges: [],
      },
    });

    function dfs(u: string, parent: string | null) {
      timer++;
      disc[u] = timer;
      low[u] = timer;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Visit node "${u}" (parent: ${parent ?? 'none'}). Set disc[${u}]=${disc[u]}, low[${u}]=${low[u]}.`,
        variables: { node: u, disc: disc[u], low: low[u], parent: parent ?? 'null' },
        callStack: [{ name: `dfs(u="${u}")`, params: { u, parent: parent ?? 'null' }, line: 4, isCurrent: true }],
        pedagogy: {
          what: `"${u}" receives discovery time ${disc[u]}; low[${u}] starts equal to it.`,
          why: 'low[u] will track the earliest vertex reachable from u\'s subtree; a bridge appears whenever a child\'s reach stops below u.',
          whatNext: `Scan the incident edges of "${u}".`,
        },
        state: {
          nodes,
          edges,
          activeNode: u,
          activeNeighbor: null,
          disc: { ...disc },
          low: { ...low },
          bridges: [...bridges],
        },
      });

      for (const v of adj[u] || []) {
        if (v === parent) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            explanation: `Edge (${u} ↔ ${v}) is the tree edge back to the parent, so it is skipped.`,
            variables: { node: u, parent: v, action: 'SKIP_PARENT' },
            conditionEval: { expr: `v == parent ('${v}' == '${parent}')`, result: true },
            callStack: [{ name: `skipParentEdge("${u}")`, params: { u, parent: v }, line: 6, isCurrent: true }],
            pedagogy: {
              what: `The parent edge is already part of the DFS tree.`,
              why: 'Re-processing it as a back-edge would lower low[u] to the parent\'s value and mask real bridges.',
              whatNext: `Continue with "${u}"'s next edge.`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              bridges: [...bridges],
            },
          });
          continue;
        }

        if (disc[v] !== undefined) {
          // Back-edge
          const oldLow = low[u];
          low[u] = Math.min(low[u], disc[v]);
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            explanation: `Back-edge (${u} ↔ ${v}): "${v}" was discovered earlier (disc ${disc[v]}). low[${u}] = min(${oldLow}, disc[${v}]) = ${low[u]}.`,
            variables: { u, v, lowU: low[u], discV: disc[v], previousLow: oldLow },
            conditionEval: { expr: `disc['${v}'] !== undefined`, result: true },
            callStack: [{ name: `backEdge(${u}, ${v})`, params: { u, v }, line: 8, isCurrent: true }],
            pedagogy: {
              what: `"${u}" can reach "${v}", discovered at time ${disc[v]} — an escape route around the tree path.`,
              why: 'Back-edges are what make an edge non-critical: the child subtree can reach an ancestor without using it.',
              whatNext: `Keep low[${u}] = ${low[u]} when ancestors combine child values.`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              bridges: [...bridges],
            },
          });
        } else {
          // Tree edge
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 10,
            explanation: `Edge (${u} ↔ ${v}): "${v}" is undiscovered, so recurse into it.`,
            variables: { u, child: v, edgeType: 'TREE_EDGE' },
            conditionEval: { expr: `disc['${v}'] === undefined`, result: true },
            callStack: [{ name: `treeEdge("${u}" → "${v}")`, params: { u, v }, line: 10, isCurrent: true }],
            pedagogy: {
              what: `The edge ${u} ↔ ${v} joins the DFS tree; "${v}" becomes a child of "${u}".`,
              why: 'Only tree edges can be bridges — removing a non-tree edge never disconnects a DFS tree.',
              whatNext: `Explore "${v}" and return with its low value.`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              bridges: [...bridges],
            },
          });
          dfs(v, u);

          const oldLow = low[u];
          low[u] = Math.min(low[u], low[v]);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            explanation: `Returned from child "${v}": low[${u}] = min(${oldLow}, low[${v}]=${low[v]}) = ${low[u]}.`,
            variables: { u, child: v, lowChild: low[v], updatedLow: low[u] },
            callStack: [{ name: `returnFromChild(${u}, ${v})`, params: { u, v }, line: 11, isCurrent: true }],
            pedagogy: {
              what: `"${u}" inherits the reach of child "${v}".`,
              why: 'The comparison low[v] > disc[u] now decides whether "${v}"\'s subtree can bypass "${u}" or not.',
              whatNext: `Evaluate the bridge condition for (${u} ↔ ${v}).`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              bridges: [...bridges],
            },
          });

          const isBridge = low[v] > disc[u];

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 12,
            explanation: isBridge
              ? `Bridge check (${u} ↔ ${v}): low[${v}]=${low[v]} > disc[${u}]=${disc[u]} — the subtree cannot reach "${u}" or above. The edge is critical.`
              : `Bridge check (${u} ↔ ${v}): low[${v}]=${low[v]} <= disc[${u}]=${disc[u]} — the subtree reaches an ancestor, so the edge is NOT a bridge.`,
            variables: { u, child: v, lowChild: low[v], discU: disc[u], isBridge: isBridge ? 'YES' : 'NO' },
            conditionEval: { expr: `low['${v}'] (${low[v]}) > disc['${u}'] (${disc[u]})`, result: isBridge },
            callStack: [{ name: `checkBridge(${u}, ${v})`, params: { isBridge: String(isBridge) }, line: 12, isCurrent: true }],
            pedagogy: {
              what: isBridge
                ? `Nothing in "${v}"'s subtree links back to "${u}" or earlier; the only link is this edge.`
                : `"${v}"'s subtree can reach an earlier vertex (low ${low[v]} ≤ disc ${disc[u]}), so a bypass exists — removing (${u} ↔ ${v}) keeps the graph connected.`,
              why: 'Strict inequality is the bridge signature: equality would mean the subtree reaches "${u}" itself, so removing the edge still leaves "${v}" connected through that route.',
              whatNext: isBridge ? 'Record the bridge.' : `Continue with "${u}"'s next edge.`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              bridges: [...bridges],
            },
          });

          if (isBridge) {
            bridges.push(`${u}-${v}`);
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 13,
              isMilestone: true,
              milestoneTitle: `Bridge Found: ${u} — ${v}`,
              explanation: `bridges.append(('${u}', '${v}')): removing this edge splits the graph. Total bridges: ${bridges.length}.`,
              variables: { bridge: `${u}-${v}`, totalBridges: bridges.length },
              callStack: [{ name: `bridgeFound(${u}, ${v})`, params: { u, v }, line: 13, isCurrent: true }],
              pedagogy: {
                what: `(${u} ↔ ${v}) is a bridge.`,
                why: 'low[v] > disc[u] means the subtree of "${v}" hangs from exactly this edge — there is no cycle covering it.',
                whatNext: 'Continue the DFS; other tree edges may also qualify.',
              },
              checkpoint: !checkpointAdded
                ? {
                    id: 'bridge-low-strict',
                    question: `Bridges use low[v] > disc[u], while articulation points use low[v] >= disc[u]. Why the strict inequality here?`,
                    options: [
                      'A bridge needs the child subtree to be unable to reach even the parent u; reaching u itself still gives a bypass path, so equality means the edge is safe',
                      'It is an arbitrary convention; both inequalities give the same result',
                    ],
                    correctIndex: 0,
                    explanation:
                      'If low[v] == disc[u], the subtree can reach u directly (or through a back-edge to u), so removing the edge (u, v) still leaves v connected via that route. Only when the reach stops strictly below u does the edge itself become the sole connection.',
                  }
                : undefined,
              state: {
                nodes,
                edges,
                activeNode: u,
                activeNeighbor: v,
                disc: { ...disc },
                low: { ...low },
                bridges: [...bridges],
              },
            });
            checkpointAdded = true;
          }
        }
      }
    }

    for (const node of nodes) {
      if (disc[node] === undefined) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          explanation: `Outer scan: "${node}" is still undiscovered, so start a new DFS root at it (parent = null).`,
          variables: { root: node, action: 'NEW_ROOT' },
          conditionEval: { expr: `disc['${node}'] === undefined`, result: true },
          callStack: [{ name: `newRoot("${node}")`, params: { node }, line: 14, isCurrent: true }],
          pedagogy: {
            what: `"${node}" begins a separate connected component.`,
            why: 'Bridges are found per DFS tree; a disconnected graph simply gets one pass per component.',
            whatNext: `Run dfs("${node}", null).`,
          },
          state: {
            nodes,
            edges,
            activeNode: node,
            activeNeighbor: null,
            disc: { ...disc },
            low: { ...low },
            bridges: [...bridges],
          },
        });
        dfs(node, null);
      }
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      explanation: `Bridge-finding complete! Identified ${bridges.length} bridge edge${bridges.length === 1 ? '' : 's'}: ${
        bridges.length > 0 ? bridges.join(', ') : 'None (2-edge-connected)'
      }.`,
      isMilestone: true,
      milestoneTitle: `Found ${bridges.length} Bridge${bridges.length === 1 ? '' : 's'}`,
      variables: { totalBridges: bridges.length, bridgesFound: bridges.join(', ') },
      callStack: [{ name: 'complete()', params: { bridges: bridges.length }, line: 15, isCurrent: true }],
      pedagogy: {
        what: `Return ${bridges.length} bridge edge(s): ${bridges.length > 0 ? bridges.join(', ') : 'none — every edge lies on a cycle'}.`,
        why: 'Each reported edge had a child subtree whose lowest reach stopped strictly below the parent, so no cycle covered it.',
        whatNext: 'Bridges define the 2-edge-connected components of the graph, just as cut vertices define its biconnected components.',
      },
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: { ...disc },
        low: { ...low },
        bridges: [...bridges],
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<BridgeFindingState>) => {
    const { nodes, edges, activeNode, activeNeighbor, disc, low, bridges } = frame.state;

    const total = nodes.length;
    const cx = 250;
    const cy = 180;
    const rx = 180;
    const ry = 110;

    const coords: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      coords[n] = {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
      };
    });

    return (
      <div className="w-full flex-1 flex flex-col items-center justify-between p-6 select-none max-w-5xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              Vertices: <strong className="text-white">{nodes.length}</strong> | Edges:{' '}
              <strong className="text-white">{edges.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-rose-400">
              Bridges: <strong className="text-white">{bridges.length}</strong>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300">
            Identified Cut-Edges:{' '}
            <strong className="text-rose-400">
              {bridges.length > 0 ? bridges.join(', ') : 'None'}
            </strong>
          </div>
        </div>

        {/* Undirected Graph SVG */}
        <div className="w-full h-80 relative rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden my-auto flex items-center justify-center">
          <svg viewBox="0 0 500 360" className="w-full h-full">
            {/* Edges */}
            {edges.map((e, idx) => {
              const uPos = coords[e.u];
              const vPos = coords[e.v];
              if (!uPos || !vPos) return null;
              const isBridge = bridges.includes(`${e.u}-${e.v}`) || bridges.includes(`${e.v}-${e.u}`);
              const isActive =
                (e.u === activeNode && e.v === activeNeighbor) ||
                (e.v === activeNode && e.u === activeNeighbor);

              return (
                <line
                  key={idx}
                  x1={uPos.x}
                  y1={uPos.y}
                  x2={vPos.x}
                  y2={vPos.y}
                  stroke={isBridge ? '#f43f5e' : isActive ? '#06b6d4' : '#475569'}
                  strokeWidth={isBridge ? 4 : isActive ? 3 : 2}
                  strokeDasharray={isBridge ? '6,3' : undefined}
                />
              );
            })}

            {/* Vertices */}
            {nodes.map((n) => {
              const pos = coords[n];
              if (!pos) return null;
              const isCurrent = n === activeNode;
              const hasDisc = disc[n] !== undefined;

              return (
                <g key={n} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r="22"
                    fill={isCurrent ? '#06b6d422' : '#0f172a'}
                    stroke={isCurrent ? '#06b6d4' : hasDisc ? '#38bdf8' : '#334155'}
                    strokeWidth={isCurrent ? 3 : 2}
                  />
                  <text
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono font-bold text-sm fill-white"
                  >
                    {n}
                  </text>
                  {hasDisc && (
                    <text
                      y="34"
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-400"
                    >
                      {disc[n]}/{low[n]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  },
};
