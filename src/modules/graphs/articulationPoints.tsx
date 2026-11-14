import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface UndirectedEdge {
  u: string;
  v: string;
}

export interface ArticulationPointsState {
  nodes: string[];
  edges: UndirectedEdge[];
  activeNode: string | null;
  activeNeighbor: string | null;
  disc: Record<string, number>;
  low: Record<string, number>;
  cutVertices: string[];
}

export const articulationPointsModule: AlgorithmModule<
  { nodes: string[]; edges: UndirectedEdge[] },
  ArticulationPointsState
> = {
  id: 'articulation-points',
  title: 'Articulation Points (Cut Vertices & Root-Degree Checks O(V + E))',
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(V + E)',
    timeAverage: 'O(V + E)',
    timeWorst: 'O(V + E)',
    spaceAuxiliary: 'O(V) call stack and lowpoint arrays',
    worstCaseCondition: 'Single linear DFS traversal over vertices and undirected edges',
  },
  theory: {
    overview:
      'An articulation point (or cut vertex) is a vertex whose removal increases the number of connected components in an undirected graph.',
    whyItWorks:
      'In a DFS tree: (1) The root is a cut vertex iff it has >= 2 children in the DFS tree. (2) Any non-root vertex u is a cut vertex iff it has a child v such that low[v] >= disc[u], indicating that v has no back-edge reaching any proper ancestor of u.',
    invariant:
      'Cut Vertex Invariant: u separates v from ancestors of u if and only if low[v] >= disc[u].',
    pitfalls: [
      'Applying the non-root rule to the root vertex of the DFS tree.',
      'Counting duplicate entries for a cut vertex that separates multiple children.',
    ],
  },
  presets: [
    {
      id: 'classic-bowtie',
      label: 'Bowtie Graph: (A-B-C) and (C-D-E) with Bridge Node C',
      description: 'Vertex C is the central cut vertex connecting two triangles',
      data: {
        nodes: ['A', 'B', 'C', 'D', 'E'],
        edges: [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'A' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'C' },
        ],
      },
    },
    {
      id: 'linear-chain',
      label: 'Linear Chain: 0 - 1 - 2 - 3',
      description: 'Internal nodes 1 and 2 are articulation points',
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
    nodes: ['A', 'B', 'C', 'D', 'E'],
    edges: [
      { u: 'A', v: 'B' },
      { u: 'B', v: 'C' },
      { u: 'C', v: 'A' },
      { u: 'C', v: 'D' },
      { u: 'D', v: 'E' },
      { u: 'E', v: 'C' },
    ],
  },
  codeSnippets: {
    cpp: `void dfs(int u, int p, int& timer, vector<int>& disc, vector<int>& low,
         vector<bool>& isCut, const vector<vector<int>>& adj) {
    disc[u] = low[u] = ++timer;
    int children = 0;
    for (int v : adj[u]) {
        if (v == p) continue;
        if (disc[v] != -1) {
            low[u] = min(low[u], disc[v]);
        } else {
            children++;
            dfs(v, u, timer, disc, low, isCut, adj);
            low[u] = min(low[u], low[v]);
            if (p != -1 && low[v] >= disc[u]) isCut[u] = true;
        }
    }
    if (p == -1 && children > 1) isCut[u] = true;
}`,
    python: `def find_cut_vertices(nodes, edges):
    adj = {u: [] for u in nodes}
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    timer = 0
    disc, low = {}, {}
    cut_vertices = set()

    def dfs(u, parent):
        nonlocal timer
        timer += 1
        disc[u] = low[u] = timer
        children = 0
        for v in adj[u]:
            if v == parent: continue
            if v in disc:
                low[u] = min(low[u], disc[v])
            else:
                children += 1
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if parent is not None and low[v] >= disc[u]:
                    cut_vertices.add(u)
        if parent is None and children > 1:
            cut_vertices.add(u)

    for n in nodes:
        if n not in disc: dfs(n, None)
    return list(cut_vertices)`,
    typescript: `function findArticulationPoints(nodes: string[], edges: UndirectedEdge[]): string[] {
    const adj: Record<string, string[]> = {};
    for (const n of nodes) adj[n] = [];
    for (const e of edges) { adj[e.u].push(e.v); adj[e.v].push(e.u); }

    let timer = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const isCut: Record<string, boolean> = {};

    function dfs(u: string, parent: string | null) {
        disc[u] = low[u] = ++timer;
        let children = 0;
        for (const v of adj[u]) {
            if (v === parent) continue;
            if (disc[v] !== undefined) {
                low[u] = Math.min(low[u], disc[v]);
            } else {
                children++;
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                if (parent !== null && low[v] >= disc[u]) isCut[u] = true;
            }
        }
        if (parent === null && children > 1) isCut[u] = true;
    }
    for (const n of nodes) if (disc[n] === undefined) dfs(n, null);
    return Object.keys(isCut).filter(k => isCut[k]);
}`,
    java: `void dfs(String u, String parent, Map<String, List<String>> adj, Map<String, Integer> disc,
         Map<String, Integer> low, Set<String> cut, int[] timer) {
    disc.put(u, ++timer[0]);
    low.put(u, timer[0]);
    int children = 0;
    for (String v : adj.get(u)) {
        if (v.equals(parent)) continue;
        if (disc.containsKey(v)) {
            low.put(u, Math.min(low.get(u), disc.get(v)));
        } else {
            children++;
            dfs(v, u, adj, disc, low, cut, timer);
            low.put(u, Math.min(low.get(u), low.get(v)));
            if (parent != null && low.get(v) >= disc.get(u)) cut.add(u);
        }
    }
    if (parent == null && children > 1) cut.add(u);
}
List<String> findCutVertices(List<String> nodes, List<Edge> edges) {
    Map<String, List<String>> adj = new HashMap<>();
    for (String n : nodes) adj.put(n, new ArrayList<>());
    for (Edge e : edges) { adj.get(e.u).add(e.v); adj.get(e.v).add(e.u); }
    Map<String, Integer> disc = new HashMap<>(), low = new HashMap<>();
    Set<String> cut = new HashSet<>();
    int[] timer = {0};
    for (String n : nodes) if (!disc.containsKey(n)) dfs(n, null, adj, disc, low, cut, timer);
    return new ArrayList<>(cut);
}`,
    pseudocode: `function findCutVertices(graph):
    timer = 0, disc = {}, low = {}, cut = {}
    function dfs(u, parent):
        disc[u] = low[u] = ++timer, children = 0
        for each v in adj[u]:
            if v == parent: continue
            if v visited: low[u] = min(low[u], disc[v])
            else:
                children++
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if parent != null and low[v] >= disc[u]: cut[u] = true
        if parent == null and children > 1: cut[u] = true
    for each u in graph: if u unvisited: dfs(u, null)
    return cut`,
  },

  generateTimeline: (input: {
    nodes: string[];
    edges: UndirectedEdge[];
  }): ExecutionFrame<ArticulationPointsState>[] => {
    const nodes = input?.nodes?.length ? input.nodes : ['A', 'B', 'C', 'D', 'E'];
    const edges = input?.edges?.length
      ? input.edges
      : [
          { u: 'A', v: 'B' },
          { u: 'B', v: 'C' },
          { u: 'C', v: 'A' },
          { u: 'C', v: 'D' },
          { u: 'D', v: 'E' },
          { u: 'E', v: 'C' },
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
    const cutVertices = new Set<string>();

    const frames: ExecutionFrame<ArticulationPointsState>[] = [];

    let checkpointAdded = false;

    // Frame 0: Initialization
    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Tarjan's Cut Vertices Search`,
      explanation: `Initialize Tarjan's Articulation Points algorithm for ${nodes.length} vertices and ${edges.length} edges. Discovers discovery time (disc) and low-link (low) values via DFS tree traversal.`,
      variables: { totalNodes: nodes.length, totalEdges: edges.length },
      soundCue: { type: 'step' },
      callStack: [{ name: 'findArticulationPoints()', params: { n: nodes.length }, line: 2, isCurrent: true }],
      pedagogy: {
        what: `A cut vertex is a vertex whose removal increases the number of connected components.`,
        why: 'The DFS tree reveals this locally: a child subtree with no back-edge above its parent can only reach the rest of the graph through that parent.',
        whatNext: 'Run DFS from the first unvisited vertex and timestamp each visit.',
      },
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: {},
        low: {},
        cutVertices: [],
      },
    });

    function dfs(u: string, parent: string | null) {
      timer++;
      disc[u] = timer;
      low[u] = timer;
      let children = 0;

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 4,
        explanation: `Visit node "${u}" in DFS (parent: ${parent ?? 'none'}). Set disc[${u}]=${disc[u]}, low[${u}]=${low[u]}, children=0.`,
        variables: { node: u, disc: disc[u], low: low[u], parent: parent ?? 'null', timer },
        conditionEval: { expr: `disc['${u}'] === ${disc[u]}`, result: true },
        soundCue: { type: 'select' },
        callStack: [{ name: `dfs(u="${u}")`, params: { u, parent: parent ?? 'null' }, line: 4, isCurrent: true }],
        pedagogy: {
          what: `"${u}" gets discovery time ${disc[u]}; low[${u}] starts equal to it.`,
          why: 'low[u] will be lowered whenever u can reach an earlier-discovered vertex; the final value tells whether u\'s subtree can escape upward.',
          whatNext: `Scan the incident edges of "${u}".`,
        },
        state: {
          nodes,
          edges,
          activeNode: u,
          activeNeighbor: null,
          disc: { ...disc },
          low: { ...low },
          cutVertices: Array.from(cutVertices),
        },
      });

      for (const v of adj[u] || []) {
        if (v === parent) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            explanation: `Edge (${u} ↔ ${v}) is the tree edge back to the parent, so it is skipped — undirected graphs must not traverse it twice.`,
            variables: { node: u, parent: v, action: 'SKIP_PARENT' },
            conditionEval: { expr: `v == parent ('${v}' == '${parent}')`, result: true },
            soundCue: { type: 'compare' },
            callStack: [{ name: `skipParentEdge("${u}")`, params: { u, parent: v }, line: 6, isCurrent: true }],
            pedagogy: {
              what: `The edge to the parent leads back up the DFS tree, not into undiscovered territory.`,
              why: 'Treating it as a back-edge would wrongly lower low[u] to the parent\'s disc value, hiding real cut vertices.',
              whatNext: `Continue with "${u}"'s next edge.`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              cutVertices: Array.from(cutVertices),
            },
          });
          continue;
        }

        if (disc[v] !== undefined) {
          // Back-edge detected!
          const oldLow = low[u];
          low[u] = Math.min(low[u], disc[v]);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 7,
            explanation: `Back-edge (${u} ↔ ${v}): "${v}" was discovered earlier (disc ${disc[v]}). low[${u}] = min(${oldLow}, disc[${v}]) = ${low[u]}.`,
            variables: { node: u, ancestor: v, ancestorDisc: disc[v], previousLow: oldLow, newLow: low[u] },
            conditionEval: { expr: `disc['${v}'] !== undefined`, result: true },
            soundCue: { type: 'compare' },
            callStack: [{ name: 'handleBackEdge', params: { u, v, discV: disc[v] }, line: 7, isCurrent: true }],
            pedagogy: {
              what: `"${u}"'s subtree can reach "${v}", discovered at time ${disc[v]} — earlier than ${disc[u]}.`,
              why: 'This escape route is exactly what prevents "${u}" (and its ancestors) from being cut vertices through this branch.',
              whatNext: `Remember low[${u}] = ${low[u]} when the ancestors combine values.`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              cutVertices: Array.from(cutVertices),
            },
          });
        } else {
          children++;

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 9,
            explanation: `Edge (${u} ↔ ${v}): "${v}" is undiscovered, so it becomes child #${children} in the DFS tree. Recurse into it.`,
            variables: { node: u, child: v, children, edgeType: 'TREE_EDGE' },
            conditionEval: { expr: `disc['${v}'] === undefined`, result: true },
            soundCue: { type: 'select' },
            callStack: [{ name: `treeEdge("${u}" → "${v}")`, params: { u, v, children }, line: 9, isCurrent: true }],
            pedagogy: {
              what: `"${v}" has no discovery time, so the edge ${u} ↔ ${v} enters the DFS tree; "${u}" now has ${children} child/children.`,
              why: 'Each child subtree is a candidate to be separated from the rest of the graph if it cannot reach above "${u}".',
              whatNext: `Explore "${v}"'s subtree before returning.`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              cutVertices: Array.from(cutVertices),
            },
          });

          dfs(v, u);

          const oldLow = low[u];
          low[u] = Math.min(low[u], low[v]);

          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 11,
            explanation: `Returned from subtree "${v}" to "${u}": low[${u}] = min(${oldLow}, low[${v}]=${low[v]}) = ${low[u]}.`,
            variables: { node: u, child: v, lowChild: low[v], updatedLow: low[u] },
            conditionEval: { expr: `low[${u}] = min(${oldLow}, ${low[v]})`, result: low[u] },
            soundCue: { type: 'step' },
            callStack: [{ name: 'returnFromChild', params: { u, v }, line: 11, isCurrent: true }],
            pedagogy: {
              what: `"${u}" inherits the smallest reach of child "${v}" (low ${low[v]}).`,
              why: 'If the child\'s reach never gets above "${u}" (low[v] ≥ disc[u]), that subtree can only connect to the rest through "${u}".',
              whatNext: low[v] >= disc[u] ? `Check the cut condition: low[${v}] (${low[v]}) >= disc[${u}] (${disc[u]}).` : `No cut here: low[${v}] (${low[v]}) < disc[${u}] (${disc[u]}).`,
            },
            state: {
              nodes,
              edges,
              activeNode: u,
              activeNeighbor: v,
              disc: { ...disc },
              low: { ...low },
              cutVertices: Array.from(cutVertices),
            },
          });

          if (parent !== null && low[v] >= disc[u]) {
            cutVertices.add(u);
            frames.push({
              stepIndex: frames.length,
              totalSteps: 1,
              codeLine: 12,
              isMilestone: true,
              milestoneTitle: `Cut Vertex Found: "${u}"`,
              explanation: `Cut condition satisfied for "${u}": low[${v}]=${low[v]} >= disc[${u}]=${disc[u]}. Child "${v}"'s subtree has no back-edge reaching above "${u}", so removing "${u}" separates it.`,
              variables: { cutVertex: u, child: v, lowChild: low[v], discU: disc[u], conditionMet: true },
              conditionEval: { expr: `low['${v}'] (${low[v]}) >= disc['${u}'] (${disc[u]})`, result: true },
              soundCue: { type: 'swap' },
              callStack: [{ name: `cutVertexFound(${u})`, params: { u, v }, line: 12, isCurrent: true }],
              pedagogy: {
                what: `"${u}" is an articulation point: "${v}"'s whole subtree stays below "${u}" in reach.`,
                why: 'low[v] ≥ disc[u] means no vertex in that subtree can reach u\'s ancestors or u\'s other branches without passing through u.',
                whatNext: "Continue scanning the parent's edges; more children may confirm the same cut vertex.",
              },
              checkpoint: !checkpointAdded
                ? {
                    id: 'articulation-cut-condition',
                    question: `Why does low["${v}"] >= disc["${u}"] prove that "${u}" is a cut vertex?`,
                    options: [
                      'The subtree of v has no back-edge reaching u or any ancestor, so removing u disconnects that subtree',
                      'Because v has the largest low-link value among all children of u',
                    ],
                    correctIndex: 0,
                    explanation:
                      'The inequality says the lowest discovery time reachable from v\'s subtree is u itself or deeper. Without u, that subtree has no edge to the already-explored part, so the graph splits.',
                  }
                : undefined,
              state: {
                nodes,
                edges,
                activeNode: u,
                activeNeighbor: v,
                disc: { ...disc },
                low: { ...low },
                cutVertices: Array.from(cutVertices),
              },
            });
            checkpointAdded = true;
          }
        }
      }

      if (parent === null && children > 1) {
        cutVertices.add(u);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 13,
          isMilestone: true,
          milestoneTitle: `Root Cut Vertex: "${u}" (${children} Subtrees)`,
          explanation: `Root condition satisfied for "${u}": it is the DFS root with ${children} separate child subtrees. Removing "${u}" disconnects them because none can reach the others except through the root.`,
          variables: { rootCutVertex: u, childrenCount: children },
          conditionEval: { expr: `parent === null && children > 1 (${children} > 1)`, result: true },
          soundCue: { type: 'swap' },
          callStack: [{ name: `rootCutFound(${u})`, params: { u, children }, line: 13, isCurrent: true }],
          pedagogy: {
            what: `The root "${u}" has ${children} independent children in the DFS tree, so it is a cut vertex even though low[v] ≥ disc[u] may not hold for any child.`,
            why: 'A root has no ancestors: the non-root rule cannot apply. Its child subtrees are only linked through the root itself, so more than one child means removal splits the graph.',
            whatNext: 'Finish the DFS and continue the outer scan of remaining components.',
          },
          state: {
            nodes,
            edges,
            activeNode: u,
            activeNeighbor: null,
            disc: { ...disc },
            low: { ...low },
            cutVertices: Array.from(cutVertices),
          },
        });
      }
    }

    for (const n of nodes) {
      if (disc[n] === undefined) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 14,
          explanation: `Outer scan: "${n}" is still undiscovered, so start a new DFS root at it (parent = null).`,
          variables: { root: n, componentIndex: 1, action: 'NEW_ROOT' },
          conditionEval: { expr: `disc['${n}'] === undefined`, result: true },
          soundCue: { type: 'select' },
          callStack: [{ name: `newRoot("${n}")`, params: { n }, line: 14, isCurrent: true }],
          pedagogy: {
            what: `"${n}" was not reached by any earlier DFS, so it starts a separate connected component.`,
            why: 'A disconnected graph gets one DFS tree per component; cut vertices are computed within each component independently.',
            whatNext: `Run dfs("${n}", null).`,
          },
          state: {
            nodes,
            edges,
            activeNode: n,
            activeNeighbor: null,
            disc: { ...disc },
            low: { ...low },
            cutVertices: Array.from(cutVertices),
          },
        });
        dfs(n, null);
      }
    }

    // Final Completion
    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 15,
      isMilestone: true,
      milestoneTitle: `Found ${cutVertices.size} Articulation Point${cutVertices.size === 1 ? '' : 's'}`,
      explanation: `Articulation Points detection complete! Identified ${cutVertices.size} cut vertex/vertices: ${
        cutVertices.size > 0 ? Array.from(cutVertices).join(', ') : 'None (Graph is Biconnected)'
      }.`,
      variables: { totalCutVertices: cutVertices.size, cutVertices: Array.from(cutVertices).join(', ') },
      conditionEval: { expr: 'dfsTraversalExhausted', result: true },
      soundCue: { type: 'complete' },
      callStack: [{ name: 'complete()', params: { count: cutVertices.size }, line: 15, isCurrent: true }],
      pedagogy: {
        what: `Return ${cutVertices.size} cut vertex/vertices: ${cutVertices.size > 0 ? Array.from(cutVertices).join(', ') : 'none — the graph is biconnected'}.`,
        why: 'Each found vertex had either a child whose subtree could not escape upward, or (as a root) more than one DFS child; both are exactly the separation conditions.',
        whatNext: 'Bridges use the same low-link pass with a strict inequality (low[v] > disc[u]) — compare them next.',
      },
      state: {
        nodes,
        edges,
        activeNode: null,
        activeNeighbor: null,
        disc: { ...disc },
        low: { ...low },
        cutVertices: Array.from(cutVertices),
      },
    });

    const total = frames.length;
    frames.forEach((f) => {
      f.totalSteps = total;
    });

    return frames;
  },

  renderStage: (frame: ExecutionFrame<ArticulationPointsState>) => {
    const { nodes, edges, activeNode, disc, low, cutVertices } = frame.state;

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
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-400">
              Cut Vertices: <strong className="text-white">{cutVertices.length}</strong>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300">
            Articulation Points:{' '}
            <strong className="text-amber-400">
              {cutVertices.length > 0 ? cutVertices.join(', ') : 'None'}
            </strong>
          </div>
        </div>

        {/* Undirected Graph SVG */}
        <div className="w-full h-80 relative rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden my-auto flex items-center justify-center">
          <svg viewBox="0 0 500 360" className="w-full h-full">
            {edges.map((e, idx) => {
              const uPos = coords[e.u];
              const vPos = coords[e.v];
              if (!uPos || !vPos) return null;
              return (
                <line
                  key={idx}
                  x1={uPos.x}
                  y1={uPos.y}
                  x2={vPos.x}
                  y2={vPos.y}
                  stroke="#475569"
                  strokeWidth="2"
                />
              );
            })}

            {nodes.map((n) => {
              const pos = coords[n];
              if (!pos) return null;
              const isCurrent = n === activeNode;
              const isCut = cutVertices.includes(n);
              const hasDisc = disc[n] !== undefined;

              return (
                <g key={n} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r="22"
                    fill={isCut ? '#f59e0b22' : isCurrent ? '#06b6d422' : '#0f172a'}
                    stroke={isCut ? '#f59e0b' : isCurrent ? '#06b6d4' : hasDisc ? '#38bdf8' : '#334155'}
                    strokeWidth={isCut ? 3.5 : isCurrent ? 3 : 2}
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
