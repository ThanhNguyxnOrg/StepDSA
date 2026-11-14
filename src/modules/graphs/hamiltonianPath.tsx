import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface HamiltonianEdge {
  u: number;
  v: number;
}

export interface HamiltonianState {
  vertices: number[];
  edges: HamiltonianEdge[];
  currentPath: number[];
  visitedMask: number;
  foundPath: number[] | null;
  foundCycle: boolean;
  message: string;
}

export const hamiltonianPathModule: AlgorithmModule<
  { vertices: number[]; edges: HamiltonianEdge[]; requireCycle?: boolean },
  HamiltonianState
> = {
  id: 'hamiltonian-path',
  title: 'Hamiltonian Path & Cycle (NP-Complete Backtracking & State Pruning)',
  category: 'graphs',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(V)',
    timeAverage: 'O(V!)',
    timeWorst: 'O(V!)',
    spaceAuxiliary: 'O(V) recursive call stack and path tracking',
    worstCaseCondition: 'Dense non-Hamiltonian graphs forcing exhaustive search over all V! permutation paths',
  },
  theory: {
    overview:
      'A Hamiltonian Path in an undirected or directed graph is a path that visits every vertex exactly once. A Hamiltonian Cycle is a closed loop that visits every vertex once and returns to the start vertex. Both problems are fundamental NP-Complete computational problems.',
    whyItWorks:
      'Backtracking systematically explores candidate vertex sequences. Pruning rules (e.g. isolated vertices, dead ends, degree checks) abort invalid paths early. Bitmask state tracking enables O(1) visited checks.',
    invariant:
      'Simple Path Invariant: At depth k, the path contains k distinct vertices. An edge exists between path[i] and path[i+1]. A cycle requires an edge from path[V-1] back to path[0].',
    pitfalls: [
      'Assuming Euler tours (edges once) and Hamiltonian paths (vertices once) have equivalent complexity; Euler is O(E) while Hamiltonian is NP-Complete.',
      'Failing to backtrack visited state properly across recursive branches.',
    ],
  },
  presets: [
    {
      id: 'hamiltonian-pentagon-cycle',
      label: '5-Vertex Pentagon with Chords (Cycle Exists)',
      description: 'Finds a complete Hamiltonian cycle visiting all 5 vertices',
      data: {
        vertices: [1, 2, 3, 4, 5],
        edges: [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 4 },
          { u: 4, v: 5 },
          { u: 5, v: 1 },
          { u: 1, v: 3 },
          { u: 2, v: 4 },
        ],
        requireCycle: true,
      },
    },
    {
      id: 'hamiltonian-path-line',
      label: 'Open Path (No Cycle)',
      description: 'Finds an open Hamiltonian path where no returning edge to start exists',
      data: {
        vertices: [1, 2, 3, 4, 5],
        edges: [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 4 },
          { u: 4, v: 5 },
          { u: 1, v: 3 },
        ],
        requireCycle: false,
      },
    },
  ],
  defaultInput: {
    vertices: [1, 2, 3, 4, 5],
    edges: [
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 4 },
      { u: 4, v: 5 },
      { u: 5, v: 1 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
    ],
    requireCycle: true,
  },
  codeSnippets: {
    cpp: `bool solve(int u, int count, vector<int>& path, vector<bool>& vis, int start) {
    if (count == V) {
        if (requireCycle) return isAdjacent(u, start);
        return true;
    }
    for (int v : adj[u]) {
        if (!vis[v]) {
            vis[v] = true; path.push_back(v);
            if (solve(v, count + 1, path, vis, start)) return true;
            vis[v] = false; path.pop_back();
        }
    }
    return false;
}`,
    python: `def hamiltonian(u, count, path, visited, start, require_cycle):
    if count == len(vertices):
        return (start in adj[u]) if require_cycle else True
    for v in adj[u]:
        if not visited[v]:
            visited[v] = True
            path.append(v)
            if hamiltonian(v, count + 1, path, visited, start, require_cycle):
                return True
            visited[v] = False
            path.pop()
    return False`,
    typescript: `function findHamiltonian(V: number, adj: number[][], requireCycle: boolean): number[] | null {
  const path: number[] = [1];
  const visited = new Set<number>([1]);

  function backtrack(u: number): boolean {
    if (path.length === V) {
      return requireCycle ? adj[u].includes(1) : true;
    }
    for (const v of adj[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        path.push(v);
        if (backtrack(v)) return true;
        visited.delete(v);
        path.pop();
      }
    }
    return false;
  }
  return backtrack(1) ? path : null;
}`,
    java: `public boolean hamiltonian(int u, int count) {
    if (count == V) return requireCycle ? adj[u].contains(start) : true;
    for (int v : adj[u]) {
        if (!visited[v]) {
            visited[v] = true;
            path.add(v);
            if (hamiltonian(v, count + 1)) return true;
            visited[v] = false;
            path.remove(path.size() - 1);
        }
    }
    return false;
}`,
    pseudocode: `function hamiltonian(graph, start):
    path = [start], count = 1
    return backtrack(start, count) ? path : null
function backtrack(u, count):
    if count == V:
        return requireCycle ? isConnected(u, start) : true
    for each neighbor v of u:
        if v not visited:
            mark v visited, append to path
            if backtrack(v, count + 1): return true
            unmark v, remove from path
    return false`,
  },
  generateTimeline: (input: {
    vertices: number[];
    edges: HamiltonianEdge[];
    requireCycle?: boolean;
  }): ExecutionFrame<HamiltonianState>[] => {
    const vertices = input?.vertices?.length ? input.vertices : [1, 2, 3, 4, 5];
    const edges = input?.edges?.length
      ? input.edges
      : [
          { u: 1, v: 2 },
          { u: 2, v: 3 },
          { u: 3, v: 4 },
          { u: 4, v: 5 },
          { u: 5, v: 1 },
        ];
    const requireCycle = input?.requireCycle ?? true;
    const V = vertices.length;

    const adj: Record<number, number[]> = {};
    for (const v of vertices) adj[v] = [];
    for (const e of edges) {
      if (!adj[e.u]) adj[e.u] = [];
      if (!adj[e.v]) adj[e.v] = [];
      adj[e.u].push(e.v);
      adj[e.v].push(e.u);
    }

    const frames: ExecutionFrame<HamiltonianState>[] = [];
    const path: number[] = [vertices[0]];
    const visited = new Set<number>([vertices[0]]);
    let foundPath: number[] | null = null;
    let foundCycle = false;
    let checkpointAdded = false;

    function getMask(): number {
      let mask = 0;
      for (const v of visited) mask |= 1 << v;
      return mask;
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 2,
      isMilestone: true,
      milestoneTitle: `Init Hamiltonian Search (Start: ${vertices[0]})`,
      action: 'INIT',
      state: {
        vertices,
        edges,
        currentPath: [...path],
        visitedMask: getMask(),
        foundPath: null,
        foundCycle: false,
        message: `Initialized search from vertex ${vertices[0]} (${requireCycle ? 'Hamiltonian Cycle' : 'Hamiltonian Path'})`,
      },
      callStack: [{ name: 'hamiltonianInit', params: { startVertex: vertices[0], V }, line: 2, isCurrent: true }],
      variables: { startVertex: vertices[0], targetLength: V, requireCycle, unvisitedRemaining: V - 1 },
      conditionEval: { expr: 'vertices.length > 0', result: true },
      soundCue: { type: 'step' },
      pedagogy: {
        what: `Backtracking search: path = [${vertices[0]}], count = 1. Target: visit all ${V} vertices${requireCycle ? ' and close the cycle back to the start' : ''}.`,
        why: 'Hamiltonian path is NP-complete, so the search explores candidates depth-first and undoes each choice that cannot succeed.',
        whatNext: `Try each unvisited neighbor of "${vertices[0]}" as the next step.`,
      },
      explanation: `Starting search from start vertex ${vertices[0]}. Target: visit all ${V} vertices${
        requireCycle ? ' and return to start vertex to form a closed cycle' : ''
      }.`,
    });

    function backtrack(u: number): boolean {
      if (path.length === V) {
        const canClose = adj[u]?.includes(vertices[0]) ?? false;

        // Frame: Evaluate closing edge condition
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 6,
          action: 'EVALUATE_CLOSURE',
          state: {
            vertices,
            edges,
            currentPath: [...path],
            visitedMask: getMask(),
            foundPath: null,
            foundCycle: false,
            message: `Visited all ${V} vertices! Testing closing edge (${u} -> ${vertices[0]})...`,
          },
          callStack: [{ name: 'checkClosure', params: { lastVertex: u, startVertex: vertices[0] }, line: 6, isCurrent: true }],
          variables: { lastVertex: u, startVertex: vertices[0], hasClosingEdge: canClose, requireCycle },
          conditionEval: { expr: `count == ${V} -> requireCycle ? isConnected(${u}, ${vertices[0]}) : true`, result: !requireCycle || canClose },
          soundCue: { type: 'compare' },
          pedagogy: {
            what: `All ${V} vertices are on the path; ${requireCycle ? `the closing edge (${u} → ${vertices[0]}) ${canClose ? 'exists' : 'is missing'}` : 'a cycle is not required, so the path is already valid'}.`,
            why: requireCycle
              ? 'A Hamiltonian cycle needs the last vertex to connect back to the start; otherwise the search must keep backtracking.'
              : 'For an open Hamiltonian path, reaching all vertices is sufficient.',
            whatNext: !requireCycle || canClose ? 'Accept the solution.' : 'Reject this branch and backtrack.',
          },
          explanation: `All ${V} vertices visited in path [${path.join(' -> ')}]! Testing closing edge back to start: (${u}, ${vertices[0]})${
            canClose ? ' EXISTS in graph!' : ' does not exist.'
          }`,
        });

        if (!requireCycle || canClose) {
          foundPath = [...path];
          foundCycle = canClose;
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 6,
            isMilestone: true,
            milestoneTitle: canClose ? `Hamiltonian Cycle Found!` : `Hamiltonian Path Found!`,
            action: 'SOLUTION_FOUND',
            state: {
              vertices,
              edges,
              currentPath: [...path],
              visitedMask: getMask(),
              foundPath: [...path],
              foundCycle: canClose,
              message: canClose
                ? `Hamiltonian Cycle found: [${path.join(' -> ')} -> ${vertices[0]}]`
                : `Hamiltonian Path found: [${path.join(' -> ')}]`,
            },
            callStack: [{ name: 'solution', params: { pathLength: path.length, cycle: canClose ? 1 : 0 }, line: 6, isCurrent: true }],
            variables: { path: path.join('->'), cycleFormed: canClose, totalVerticesVisited: V },
            conditionEval: { expr: 'return true', result: true },
            soundCue: { type: 'complete' },
            pedagogy: {
              what: `Return true: ${canClose ? `cycle [${path.join(' → ')} → ${vertices[0]}]` : `path [${path.join(' → ')}]`} is valid.`,
              why: 'The recursive calls now unwind all the way to the driver, which keeps exactly this path as the answer.',
              whatNext: 'Collect the path in the final frame and stop searching.',
            },
            explanation: `Success! Discovered complete ${canClose ? 'Hamiltonian Cycle' : 'Hamiltonian Path'}: [${path.join(
              ' -> '
            )}${canClose ? ` -> ${vertices[0]}` : ''}].`,
          });
          return true;
        }
      }

      const neighbors = adj[u] || [];

      for (const nextV of neighbors) {
        const alreadyVisited = visited.has(nextV);

        if (alreadyVisited) {
          frames.push({
            stepIndex: frames.length,
            totalSteps: 1,
            codeLine: 8,
            action: 'SKIP_VISITED',
            state: {
              vertices,
              edges,
              currentPath: [...path],
              visitedMask: getMask(),
              foundPath: null,
              foundCycle: false,
              message: `Neighbor ${nextV} is already visited, pruning candidate.`,
            },
            callStack: [{ name: 'checkNeighbor', params: { current: u, candidate: nextV }, line: 8, isCurrent: true }],
            variables: { current: u, candidate: nextV, alreadyInPath: true },
            conditionEval: { expr: `!visited.has(${nextV})`, result: false },
            soundCue: { type: 'step' },
            pedagogy: {
              what: `Neighbor ${nextV} is already on the path, so this branch is pruned.`,
              why: 'A Hamiltonian path is simple: revisiting a vertex wastes one of the V slots, so such a branch can never cover every vertex.',
              whatNext: `Try the next neighbor of ${u}.`,
            },
            checkpoint: !checkpointAdded
              ? {
                  id: 'hamiltonian-pruning',
                  question: `Why is a visited neighbor pruned immediately instead of explored?`,
                  options: [
                    'A Hamiltonian path must be simple: revisiting a vertex cannot cover all vertices in exactly V steps, so the branch is doomed',
                    'Because revisiting would repeat an edge, and edges must also be unique',
                  ],
                  correctIndex: 0,
                  explanation:
                    'Hamiltonian constraints are on vertices, not edges. Repeating a vertex means some other vertex can never be reached within the remaining steps, so pruning is safe.',
                }
              : undefined,
            explanation: `Neighbor ${nextV} is already in the current path. Skipping to maintain simple path invariant.`,
          });
          checkpointAdded = true;
          continue;
        }

        visited.add(nextV);
        path.push(nextV);

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 9,
          isMilestone: path.length === Math.ceil(V / 2),
          milestoneTitle: path.length === Math.ceil(V / 2) ? `Halfway: ${path.length}/${V} Vertices` : undefined,
          action: 'EXPLORE_STEP',
          state: {
            vertices,
            edges,
            currentPath: [...path],
            visitedMask: getMask(),
            foundPath: null,
            foundCycle: false,
            message: `Stepping: ${u} -> ${nextV} (Visited: ${path.length}/${V})`,
          },
          callStack: [{ name: 'backtrack', params: { current: nextV, depth: path.length }, line: 9, isCurrent: true }],
          variables: { currentVertex: nextV, pathLength: path.length, remaining: V - path.length },
          conditionEval: { expr: `!visited.has(${nextV})`, result: true },
          soundCue: { type: 'insert' },
          pedagogy: {
            what: `${nextV} is marked visited and appended: [${path.join(' → ')}] (${path.length}/${V}).`,
            why: 'Extending the path commits to this candidate; correct backtracking later undoes it if the branch fails.',
            whatNext: `Recurse into ${nextV} with count ${path.length}.`,
          },
          explanation: `Advancing along valid edge (${u}, ${nextV}). Current path: [${path.join(' -> ')}].`,
        });

        if (backtrack(nextV)) return true;

        visited.delete(nextV);
        path.pop();

        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 11,
          action: 'BACKTRACK',
          state: {
            vertices,
            edges,
            currentPath: [...path],
            visitedMask: getMask(),
            foundPath: null,
            foundCycle: false,
            message: `Backtracking from ${nextV} back to ${u}`,
          },
          callStack: [{ name: 'backtrackReturn', params: { from: nextV, to: u }, line: 11, isCurrent: true }],
          variables: { backtrackedFrom: nextV, current: u, pathLength: path.length },
          conditionEval: { expr: `subPathFailed`, result: true },
          soundCue: { type: 'swap' },
          pedagogy: {
            what: `The branch through ${nextV} failed, so it is unmarked and removed: path back to [${path.join(' → ')}].`,
            why: 'Undoing the choice restores exactly the state before this attempt — that is what lets the search try every candidate combination.',
            whatNext: `Try the next neighbor of ${u}.`,
          },
          explanation: `Dead end reached at vertex ${nextV}. Backtracking to ${u} to explore alternative edges.`,
        });
      }
      return false;
    }

    backtrack(vertices[0]);

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 3,
      isMilestone: true,
      milestoneTitle: foundPath
        ? foundCycle
          ? 'Hamiltonian Cycle Confirmed'
          : 'Hamiltonian Path Confirmed'
        : 'No Hamiltonian Configuration',
      action: 'COMPLETE',
      state: {
        vertices,
        edges,
        currentPath: foundPath ? [...foundPath] : [],
        visitedMask: getMask(),
        foundPath,
        foundCycle,
        message: foundPath
          ? `Search complete: Solution confirmed`
          : 'Search complete: No Hamiltonian configuration exists in this graph',
      },
      callStack: [{ name: 'complete', params: { solved: foundPath ? 1 : 0 }, line: 3, isCurrent: true }],
      variables: { completed: true, exists: foundPath !== null, path: foundPath ? (foundPath as number[]).join(' -> ') : 'none' },
      pedagogy: {
        what: foundPath
          ? `Return ${foundCycle ? `cycle [${(foundPath as number[]).join(' → ')} → ${vertices[0]}]` : `path [${(foundPath as number[]).join(' → ')}]`}.`
          : 'Return null: every branch was exhausted without covering all vertices.',
        why: foundPath
          ? 'The first valid completion short-circuits all remaining recursion, so this solution is guaranteed valid.'
          : 'Exhaustive backtracking visited every reachable state, which certifies that no Hamiltonian path exists for this start vertex.',
        whatNext: foundPath ? 'Compare with TSP dynamic programming, which searches the same state space in O(2^V · V).' : 'Try another start vertex or relax the cycle requirement.',
      },
      explanation: foundPath
        ? `Hamiltonian search terminated successfully.`
        : 'Exhausted state space: No valid Hamiltonian path or cycle exists.',
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<HamiltonianState>) => {
    const { vertices, edges, currentPath, foundPath, foundCycle, message } = frame.state;

    // Node layout in circle
    const radius = 110;
    const centerX = 300;
    const centerY = 160;

    const coords: Record<number, { x: number; y: number }> = {};
    vertices.forEach((v, idx) => {
      const angle = (idx * 2 * Math.PI) / vertices.length - Math.PI / 2;
      coords[v] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const activeEdges: { u: number; v: number }[] = [];
    const path = foundPath || currentPath;
    for (let i = 0; i < path.length - 1; i++) {
      activeEdges.push({ u: path[i], v: path[i + 1] });
    }
    if (foundCycle && path.length === vertices.length) {
      activeEdges.push({ u: path[path.length - 1], v: path[0] });
    }

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          {foundPath && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded">
                {foundCycle ? 'HAMILTONIAN CYCLE' : 'HAMILTONIAN PATH'}
              </span>
            </div>
          )}
        </div>

        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[340px] flex items-center justify-center">
          <svg className="w-[600px] h-[320px]" viewBox="0 0 600 320">
            {/* Draw Base Edges */}
            {edges.map((e, idx) => {
              const uCoord = coords[e.u];
              const vCoord = coords[e.v];
              if (!uCoord || !vCoord) return null;

              const isPathEdge = activeEdges.some(
                (ae) => (ae.u === e.u && ae.v === e.v) || (ae.u === e.v && ae.v === e.u)
              );

              return (
                <line
                  key={`edge-${idx}`}
                  x1={uCoord.x}
                  y1={uCoord.y}
                  x2={vCoord.x}
                  y2={vCoord.y}
                  stroke={isPathEdge ? (foundPath ? '#10b981' : '#f59e0b') : '#334155'}
                  strokeWidth={isPathEdge ? '3.5' : '1.5'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Draw Vertices */}
            {vertices.map((v) => {
              const coord = coords[v];
              if (!coord) return null;

              const inPath = path.includes(v);
              const isStart = path[0] === v;
              const isCurrent = path[path.length - 1] === v;

              let fill = '#0f172a';
              let stroke = '#334155';
              if (foundPath) {
                fill = '#064e3b';
                stroke = '#34d399';
              } else if (isCurrent) {
                fill = '#78350f';
                stroke = '#f59e0b';
              } else if (inPath) {
                fill = '#1e3a8a';
                stroke = '#38bdf8';
              }

              return (
                <g key={`v-${v}`} className="transition-all duration-300">
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="18"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isCurrent || isStart ? '3' : '1.5'}
                  />
                  <text
                    x={coord.x}
                    y={coord.y + 5}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {v}
                  </text>
                  {isStart && (
                    <text
                      x={coord.x}
                      y={coord.y - 24}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      START
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
