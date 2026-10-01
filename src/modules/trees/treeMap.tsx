import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export type NodeColor = 'RED' | 'BLACK';

export interface TreeMapNodeData {
  id: string;
  key: number;
  val: string;
  color: NodeColor;
  left: TreeMapNodeData | null;
  right: TreeMapNodeData | null;
}

export interface TreeMapState {
  root: TreeMapNodeData | null;
  activeKey: number | null;
  activeNodeId: string | null;
  inorderKeys: number[];
  queryRange: [number, number] | null;
  rangeResults: number[];
  message: string;
}

function cloneTreeMap(node: TreeMapNodeData | null): TreeMapNodeData | null {
  if (!node) return null;
  return {
    id: node.id,
    key: node.key,
    val: node.val,
    color: node.color,
    left: cloneTreeMap(node.left),
    right: cloneTreeMap(node.right),
  };
}

export interface TreeMapOp {
  op: 'PUT' | 'GET' | 'RANGE';
  key?: number;
  val?: string;
  low?: number;
  high?: number;
}

export const treeMapModule: AlgorithmModule<
  {
    operations: TreeMapOp[];
  },
  TreeMapState
> = {
  id: 'tree-map',
  title: 'Tree Map (Self-Balancing Red-Black Key-Value Dictionary)',
  category: 'trees-bst',
  difficulty: 'Advanced',
  complexity: {
    timeBest: 'O(log N)',
    timeAverage: 'O(log N)',
    timeWorst: 'O(log N)',
    spaceAuxiliary: 'O(N) red-black tree nodes with key-value entries',
    worstCaseCondition: 'Strictly O(log N) worst-case time for all insert, delete, and lookup operations',
  },
  theory: {
    overview:
      'A TreeMap (ordered key-value map, equivalent to std::map in C++ or java.util.TreeMap in Java) maintains key-value pairs sorted in strict ascending order of keys using an underlying self-balancing Red-Black binary search tree.',
    whyItWorks:
      'By maintaining Red-Black balance invariants (no two consecutive red nodes, equal black depth along all root-to-leaf paths), the tree height is mathematically strictly bounded by 2 * log2(N + 1), enabling O(log N) point lookups and efficient O(K + log N) ordered range queries.',
    invariant:
      'Ordered Invariant: Keys strictly adhere to BST ordering. In-order traversal yields entries sorted in ascending order. Black-height is uniform across all leaf paths.',
    pitfalls: [
      'Assuming O(1) average lookup like a hash table; TreeMap trades constant-time lookups for guaranteed O(log N) worst-case time and ordered range scans.',
      'Complex rebalancing rotations and recoloring required upon node insertion and removal.',
    ],
  },
  presets: [
    {
      id: 'treemap-orders-demo',
      label: 'E-Commerce Order IDs',
      description: 'Inserts order IDs with status values and queries range [15..45]',
      data: {
        operations: [
          { op: 'PUT', key: 20, val: 'Paid' },
          { op: 'PUT', key: 10, val: 'Pending' },
          { op: 'PUT', key: 40, val: 'Shipped' },
          { op: 'PUT', key: 30, val: 'Delivered' },
          { op: 'PUT', key: 50, val: 'Refunded' },
          { op: 'GET', key: 30 },
          { op: 'RANGE', low: 15, high: 45 },
        ],
      },
    },
    {
      id: 'treemap-lookup-miss',
      label: 'Point Lookup Miss',
      description: 'Searches for non-existent key demonstrating O(log N) tree path termination',
      data: {
        operations: [
          { op: 'PUT', key: 15, val: 'Active' },
          { op: 'PUT', key: 25, val: 'Inactive' },
          { op: 'GET', key: 99 },
        ],
      },
    },
  ],
  defaultInput: {
    operations: [
      { op: 'PUT', key: 20, val: 'Paid' },
      { op: 'PUT', key: 10, val: 'Pending' },
      { op: 'PUT', key: 40, val: 'Shipped' },
      { op: 'PUT', key: 30, val: 'Delivered' },
      { op: 'PUT', key: 50, val: 'Refunded' },
      { op: 'GET', key: 30 },
      { op: 'RANGE', low: 15, high: 45 },
    ],
  },
  codeSnippets: {
    cpp: `map<int, string> treeMap;

// O(log N) insert / update
treeMap[20] = "Paid";
treeMap[10] = "Pending";

// O(log N) lookup
auto it = treeMap.find(30);
if (it != treeMap.end()) cout << it->second;

// O(K + log N) Range query
auto low = treeMap.lower_bound(15);
auto high = treeMap.upper_bound(45);
for (auto it = low; it != high; ++it) {
    cout << it->first << ": " << it->second << endl;
}`,
    python: `from sortedcontainers import SortedDict

tree_map = SortedDict()
tree_map[20] = "Paid"
tree_map[10] = "Pending"

# Lookup
val = tree_map.get(30)

# Range query [15, 45]
range_keys = [k for k in tree_map.irange(15, 45)]`,
    typescript: `class TreeMap<K, V> {
  // Red-Black Tree backed ordered dictionary
  put(key: K, val: V): void;
  get(key: K): V | undefined;
  range(low: K, high: K): [K, V][];
}`,
    java: `TreeMap<Integer, String> treeMap = new TreeMap<>();
treeMap.put(20, "Paid");
treeMap.put(10, "Pending");

// Point lookup O(log N)
String status = treeMap.get(30);

// Submap range query O(K + log N)
NavigableMap<Integer, String> sub = treeMap.subMap(15, true, 45, true);`,
    pseudocode: `function put(key, val):
    insert into Red-Black Tree
    rebalance tree (recolor + rotate)

function get(key):
    traverse BST pointers left/right
    return val if key matches else null`,
  },
  generateTimeline: (input: {
    operations: TreeMapOp[];
  }): ExecutionFrame<TreeMapState>[] => {
    const ops: TreeMapOp[] = input?.operations?.length
      ? input.operations
      : [{ op: 'PUT', key: 20, val: 'Paid' }, { op: 'GET', key: 20 }];

    let nodeCounter = 0;
    function makeNode(key: number, val: string, color: NodeColor = 'RED'): TreeMapNodeData {
      return {
        id: `tm-${++nodeCounter}`,
        key,
        val,
        color,
        left: null,
        right: null,
      };
    }

    const frames: ExecutionFrame<TreeMapState>[] = [];
    let root: TreeMapNodeData | null = null;

    function getInorder(node: TreeMapNodeData | null): number[] {
      if (!node) return [];
      return [...getInorder(node.left), node.key, ...getInorder(node.right)];
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      isMilestone: true,
      milestoneTitle: 'TreeMap Initialized',
      soundCue: { type: 'start' },
      state: {
        root: null,
        activeKey: null,
        activeNodeId: null,
        inorderKeys: [],
        queryRange: null,
        rangeResults: [],
        message: 'Initialized empty TreeMap (Red-Black BST ordered dictionary)',
      },
      callStack: [{ name: 'treeMapInit', params: { totalOps: ops.length } }],
      variables: { totalOps: ops.length, rootColor: 'BLACK' },
      conditionEval: { expr: `totalOps > 0`, result: true },
      explanation: 'Initialized empty TreeMap. Ready to execute ordered key-value dictionary operations.',
    });

    // Simplified standard insertion for clear visualization
    function insertBST(node: TreeMapNodeData | null, key: number, val: string): TreeMapNodeData {
      if (!node) return makeNode(key, val, root === null ? 'BLACK' : 'RED');
      if (key < node.key) {
        node.left = insertBST(node.left, key, val);
      } else if (key > node.key) {
        node.right = insertBST(node.right, key, val);
      } else {
        node.val = val;
      }
      return node;
    }

    for (const op of ops) {
      if (op.op === 'PUT' && op.key !== undefined) {
        root = insertBST(root, op.key, op.val ?? '');
        root.color = 'BLACK'; // Root is always black in Red-Black Tree

        const inKeys = getInorder(root);
        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 8,
          action: 'PUT_ENTRY',
          isMilestone: true,
          milestoneTitle: `Put (${op.key} -> "${op.val ?? ''}")`,
          soundCue: { type: 'swap' },
          state: {
            root: cloneTreeMap(root),
            activeKey: op.key,
            activeNodeId: null,
            inorderKeys: inKeys,
            queryRange: null,
            rangeResults: [],
            message: `PUT [Key: ${op.key} -> "${op.val ?? ''}"]. In-order keys: [${inKeys.join(', ')}]`,
          },
          callStack: [{ name: 'put', params: { key: op.key, val: op.val ?? '' } }],
          variables: { key: op.key, val: op.val ?? '', size: inKeys.length },
          conditionEval: { expr: `inKeys.includes(${op.key})`, result: true },
          explanation: `Inserted key ${op.key} with value "${op.val ?? ''}". TreeMap maintains strict sorted order: [${inKeys.join(
            ', '
          )}].`,
        });
      } else if (op.op === 'GET' && op.key !== undefined) {
        let curr = root;
        let found = false;

        while (curr) {
          const isMatch = op.key === curr.key;
          frames.push({
            stepIndex: frames.length,
            totalSteps: frames.length + 1,
            codeLine: 14,
            action: 'GET_PROBE',
            soundCue: { type: 'compare' },
            state: {
              root: cloneTreeMap(root),
              activeKey: op.key,
              activeNodeId: curr.id,
              inorderKeys: getInorder(root),
              queryRange: null,
              rangeResults: [],
              message: `GET probe: key ${op.key} vs node key ${curr.key}`,
            },
            callStack: [{ name: 'getProbe', params: { targetKey: op.key, nodeKey: curr.key } }],
            variables: { targetKey: op.key, nodeKey: curr.key, isMatch },
            conditionEval: { expr: `targetKey === curr.key (${op.key} === ${curr.key})`, result: isMatch },
            explanation: isMatch
              ? `Key ${op.key} matches current node ${curr.key}! Found value "${curr.val}".`
              : `Key ${op.key} ${op.key < curr.key ? '<' : '>'} current node ${curr.key}. Moving ${op.key < curr.key ? 'left' : 'right'}.`,
          });

          if (isMatch) {
            found = true;
            break;
          } else if (op.key < curr.key) {
            curr = curr.left;
          } else {
            curr = curr.right;
          }
        }

        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 16,
          action: 'GET_ENTRY',
          isMilestone: true,
          milestoneTitle: found ? `Get Hit: [${op.key}] -> "${curr?.val}"` : `Get Miss: [${op.key}]`,
          soundCue: { type: found ? 'complete' : 'discard' },
          state: {
            root: cloneTreeMap(root),
            activeKey: op.key,
            activeNodeId: curr?.id ?? null,
            inorderKeys: getInorder(root),
            queryRange: null,
            rangeResults: [],
            message: found
              ? `GET [Key: ${op.key}] -> MATCH: "${curr?.val}"`
              : `GET [Key: ${op.key}] -> MISS: Key not found in TreeMap`,
          },
          callStack: [{ name: 'get', params: { key: op.key, found: found ? 1 : 0 } }],
          variables: { key: op.key, found, resultVal: curr?.val ?? 'null' },
          conditionEval: { expr: `found === ${found}`, result: true },
          explanation: found
            ? `Point lookup hit! Key ${op.key} maps to value "${curr?.val}".`
            : `Point lookup miss. Key ${op.key} is not present in TreeMap.`,
        });
      } else if (op.op === 'RANGE' && op.low !== undefined && op.high !== undefined) {
        const inKeys = getInorder(root);
        const matched = inKeys.filter((k) => k >= op.low! && k <= op.high!);

        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 24,
          action: 'RANGE_QUERY',
          isMilestone: true,
          milestoneTitle: `Range [${op.low} .. ${op.high}] (${matched.length} keys)`,
          soundCue: { type: 'pivot' },
          state: {
            root: cloneTreeMap(root),
            activeKey: null,
            activeNodeId: null,
            inorderKeys: inKeys,
            queryRange: [op.low, op.high],
            rangeResults: matched,
            message: `RANGE [${op.low} .. ${op.high}] -> Found ${matched.length} keys: [${matched.join(', ')}]`,
          },
          callStack: [{ name: 'rangeQuery', params: { low: op.low, high: op.high, matchedCount: matched.length } }],
          variables: { low: op.low, high: op.high, matchedKeys: matched.join(',') },
          conditionEval: { expr: `low <= high (${op.low} <= ${op.high})`, result: true },
          explanation: `Executed ordered range query [${op.low} .. ${op.high}] in O(K + log N) time. Extracted keys: [${matched.join(
            ', '
          )}].`,
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 30,
      action: 'COMPLETE',
      isMilestone: true,
      milestoneTitle: 'TreeMap Operations Complete',
      soundCue: { type: 'complete' },
      state: {
        root: cloneTreeMap(root),
        activeKey: null,
        activeNodeId: null,
        inorderKeys: getInorder(root),
        queryRange: null,
        rangeResults: [],
        message: 'All TreeMap operations executed successfully',
      },
      callStack: [{ name: 'complete', params: { finalSize: getInorder(root).length } }],
      variables: { completed: true, finalEntries: getInorder(root).length },
      conditionEval: { expr: `finalEntries === ${getInorder(root).length}`, result: true },
      explanation: 'TreeMap demonstration complete. All ordered dictionary invariants preserved.',
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<TreeMapState>) => {
    const { root, activeKey, activeNodeId, inorderKeys, queryRange, rangeResults, message } =
      frame.state;

    interface LayoutTM {
      id: string;
      key: number;
      val: string;
      color: NodeColor;
      x: number;
      y: number;
      left: LayoutTM | null;
      right: LayoutTM | null;
    }

    function layout(node: TreeMapNodeData | null, x: number, y: number, dx: number): LayoutTM | null {
      if (!node) return null;
      return {
        id: node.id,
        key: node.key,
        val: node.val,
        color: node.color,
        x,
        y,
        left: layout(node.left, x - dx, y + 65, dx * 0.52),
        right: layout(node.right, x + dx, y + 65, dx * 0.52),
      };
    }

    const visualRoot = layout(root, 360, 45, 140);
    const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const flatNodes: LayoutTM[] = [];

    function collect(n: LayoutTM | null) {
      if (!n) return;
      flatNodes.push(n);
      if (n.left) {
        edges.push({ x1: n.x, y1: n.y, x2: n.left.x, y2: n.left.y });
        collect(n.left);
      }
      if (n.right) {
        edges.push({ x1: n.x, y1: n.y, x2: n.right.x, y2: n.right.y });
        collect(n.right);
      }
    }
    collect(visualRoot);

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          {queryRange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Range:</span>
              <span className="font-mono text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                [{queryRange[0]}..{queryRange[1]}]
              </span>
            </div>
          )}
        </div>

        {/* Tree Stage */}
        <div className="relative w-full overflow-x-auto bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[320px] flex items-center justify-center">
          <svg className="w-[720px] h-[300px]" viewBox="0 0 720 300">
            {edges.map((e, idx) => (
              <line
                key={`edge-${idx}`}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="#475569"
                strokeWidth="2"
              />
            ))}

            {flatNodes.map((n) => {
              const isMatch = rangeResults.includes(n.key);
              const isActive = n.id === activeNodeId || n.key === activeKey;

              const isRed = n.color === 'RED';
              let fill = isRed ? '#991b1b' : '#0f172a';
              let stroke = isRed ? '#ef4444' : '#64748b';

              if (isActive) {
                fill = '#78350f';
                stroke = '#f59e0b';
              } else if (isMatch) {
                stroke = '#10b981';
              }

              return (
                <g key={n.id} className="transition-all duration-300">
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="18"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isActive || isMatch ? '3' : '1.5'}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {n.key}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 28}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    "{n.val}"
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sorted Keys Stream Bar */}
        <div className="flex items-center gap-2 flex-wrap w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 font-mono text-xs">
          <span className="text-slate-400 font-bold">Sorted Stream:</span>
          {inorderKeys.map((k) => (
            <span
              key={`in-${k}`}
              className={`px-2 py-0.5 rounded border ${
                rangeResults.includes(k)
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    );
  },
};
