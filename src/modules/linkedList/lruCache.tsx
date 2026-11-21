import { motion, AnimatePresence } from 'motion/react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface LRUOperation {
  op: 'put' | 'get';
  key: number;
  val?: number;
}

export interface LRUInput {
  capacity: number;
  operations: LRUOperation[];
}

export interface LRUNodeView {
  key: number;
  val: number;
  status: 'default' | 'hit' | 'inserted' | 'evicted' | 'mru';
}

export interface LRUCacheState {
  capacity: number;
  order: LRUNodeView[]; // index 0 = MRU (Head), last = LRU (Tail)
  evictedNode: { key: number; val: number } | null;
  lastOp: string;
  lastResult: string;
  activeKey: number | null;
  opIndex: number;
  totalOps: number;
  hits: number;
  misses: number;
  evictions: number;
}

const DEFAULT_INPUT: LRUInput = {
  capacity: 3,
  operations: [
    { op: 'put', key: 1, val: 10 },
    { op: 'put', key: 2, val: 20 },
    { op: 'put', key: 3, val: 30 },
    { op: 'get', key: 1 },
    { op: 'put', key: 4, val: 40 },
    { op: 'get', key: 2 },
    { op: 'put', key: 5, val: 50 },
    { op: 'get', key: 3 },
  ],
};

export const lruCacheModule: AlgorithmModule<LRUInput, LRUCacheState> = {
  id: 'lru-cache',
  title: 'LRU Cache (Hash Map + Doubly Linked List)',
  category: 'linked-lists',
  difficulty: 'Intermediate',
  defaultInput: DEFAULT_INPUT,
  presets: [
    {
      id: 'lru-classic-cap3',
      label: 'Classic Eviction (Cap 3)',
      description: 'Fills 3 slots, hits key 1 to promote it to MRU, then evicts LRU key 2 on insert.',
      data: DEFAULT_INPUT,
    },
    {
      id: 'lru-update-cap2',
      label: 'Update Existing Key (Cap 2)',
      description: 'Updates key 1 in place (promoting it to MRU) so key 2 gets evicted instead.',
      data: {
        capacity: 2,
        operations: [
          { op: 'put', key: 1, val: 100 },
          { op: 'put', key: 2, val: 200 },
          { op: 'put', key: 1, val: 150 },
          { op: 'put', key: 3, val: 300 },
          { op: 'get', key: 2 },
          { op: 'get', key: 1 },
        ],
      },
    },
    {
      id: 'lru-high-hit',
      label: 'High-Hit Workload (Cap 3)',
      description: 'Frequent cache hits repeatedly promote hot keys to MRU Head.',
      data: {
        capacity: 3,
        operations: [
          { op: 'put', key: 7, val: 70 },
          { op: 'put', key: 8, val: 80 },
          { op: 'get', key: 7 },
          { op: 'put', key: 9, val: 90 },
          { op: 'get', key: 8 },
          { op: 'put', key: 10, val: 100 },
        ],
      },
    },
  ],
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1)',
    timeWorst: 'O(1)',
    spaceAuxiliary: 'O(capacity)',
    worstCaseCondition: 'All get() and put() operations execute in strict O(1) time via direct hash map pointers.',
  },
  theory: {
    overview:
      'An LRU Cache evicts the item that has gone the longest without being accessed whenever capacity is exceeded. Pairing a Hash Map (key → node pointer) with a Doubly Linked List (MRU Head ⇄ ... ⇄ LRU Tail) enables O(1) lookup, O(1) unlink, O(1) move-to-front, and O(1) tail eviction.',
    whyItWorks:
      'Every access (get or put) promotes the touched node to the MRU Head. Therefore, the node sitting at the Tail is always guaranteed to be the Least Recently Used item.',
    invariant:
      'Hash Map keys are always 1-to-1 with Doubly Linked List nodes, list size never exceeds capacity, Head = MRU, and Tail = LRU.',
    pitfalls: [
      'Forgetting to delete the evicted tail key from the Hash Map causes stale ghost pointers and memory leaks.',
      'Forgetting to promote an existing key on put(key, newVal) breaks recency order.',
      'Using a singly linked list instead of a doubly linked list makes unlinking a middle node O(N) instead of O(1).',
    ],
  },
  relatedModules: [
    { id: 'doubly-linked-list', label: 'Doubly Linked List' },
    { id: 'hash-table-chaining', label: 'Hash Table (Chaining)' },
  ],
  codeSnippets: {
    pseudocode: `function get(key):
  if key not in map:
    return -1   // Cache Miss
  node = map[key]
  moveToHead(node)   // Promote to MRU
  return node.val

function put(key, val):
  if key in map:
    node = map[key]; node.val = val
    moveToHead(node)
  else:
    if size == capacity:
      lru = removeTail()   // Evict LRU
      delete map[lru.key]
    node = new Node(key, val)
    addToHead(node); map[key] = node`,
    python: `class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}  # key -> Node
        self.head, self.tail = Node(0, 0), Node(0, 0)
        self.head.next, self.tail.prev = self.tail, self.head

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._move_to_head(node)
        return node.val

    def put(self, key: int, val: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.val = val
            self._move_to_head(node)
            return
        if len(self.cache) == self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
        node = Node(key, val)
        self._add_to_head(node)
        self.cache[key] = node`,
    typescript: `class LRUCache {
  private map = new Map<number, DLLNode>();
  constructor(private capacity: number) {}

  get(key: number): number {
    const node = this.map.get(key);
    if (!node) return -1;
    this.moveToHead(node);
    return node.val;
  }

  put(key: number, val: number): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.val = val;
      this.moveToHead(existing);
      return;
    }
    if (this.map.size === this.capacity) {
      const lru = this.removeTail();
      if (lru) this.map.delete(lru.key);
    }
    const node = new DLLNode(key, val);
    this.addToHead(node);
    this.map.set(key, node);
  }
}`,
    cpp: `class LRUCache {
    int cap;
    list<pair<int,int>> dll;
    unordered_map<int, list<pair<int,int>>::iterator> mp;
public:
    LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        if (!mp.count(key)) return -1;
        dll.splice(dll.begin(), dll, mp[key]);
        return mp[key]->second;
    }

    void put(int key, int val) {
        if (mp.count(key)) {
            mp[key]->second = val;
            dll.splice(dll.begin(), dll, mp[key]);
            return;
        }
        if ((int)dll.size() == cap) {
            mp.erase(dll.back().first);
            dll.pop_back();
        }
        dll.emplace_front(key, val);
        mp[key] = dll.begin();
    }
};`,
    java: `class LRUCache {
    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);

    public int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;
        moveToHead(node);
        return node.val;
    }

    public void put(int key, int val) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.val = val;
            moveToHead(node);
            return;
        }
        if (map.size() == cap) {
            Node lru = removeTail();
            map.remove(lru.key);
        }
        Node node = new Node(key, val);
        addToHead(node);
        map.put(key, node);
    }
}`,
  },
  generateTimeline: (input: LRUInput): ExecutionFrame<LRUCacheState>[] => {
    const capacity = Math.max(1, Math.min(6, Number(input?.capacity) || 3));
    const ops: LRUOperation[] = Array.isArray(input?.operations) && input.operations.length > 0
      ? input.operations
      : DEFAULT_INPUT.operations;

    const frames: ExecutionFrame<LRUCacheState>[] = [];
    const list: { key: number; val: number }[] = []; // index 0 = MRU Head, last = LRU Tail
    let hits = 0;
    let misses = 0;
    let evictions = 0;
    let addedCheckpoint = false;

    const snapshot = (
      highlightKey: number | null = null,
      highlightStatus: LRUNodeView['status'] = 'default'
    ): LRUNodeView[] =>
      list.map((item, idx) => ({
        key: item.key,
        val: item.val,
        status:
          highlightKey === item.key
            ? highlightStatus
            : idx === 0
            ? 'mru'
            : 'default',
      }));

    const pushFrame = (
      codeLine: number,
      explanation: string,
      opts: {
        action?: string;
        soundCue?: ExecutionFrame['soundCue'];
        opIndex: number;
        lastOp: string;
        lastResult: string;
        activeKey?: number | null;
        highlightStatus?: LRUNodeView['status'];
        evictedNode?: { key: number; val: number } | null;
        isMilestone?: boolean;
        milestoneTitle?: string;
        conditionEval?: ExecutionFrame['conditionEval'];
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
      }
    ) => {
      const idx = frames.length;
      frames.push({
        stepIndex: idx,
        totalSteps: 1,
        codeLine,
        action: opts.action,
        explanation,
        soundCue: opts.soundCue,
        isMilestone: opts.isMilestone,
        milestoneTitle: opts.milestoneTitle,
        conditionEval: opts.conditionEval,
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        invariantStatus: {
          label: `size ${list.length}/${capacity} · Map ↔ DLL synced`,
          isValid: list.length <= capacity,
        },
        callStack: [
          {
            name: opts.lastOp,
            params: { size: list.length, capacity },
            line: codeLine,
            isCurrent: true,
          },
          { name: 'LRUCache.driver()', params: { capacity }, line: 1 },
        ],
        variables: {
          size: list.length,
          capacity,
          hits,
          misses,
          evictions,
          MRU: list[0] ? `k=${list[0].key}` : 'null',
          LRU: list.length > 0 ? `k=${list[list.length - 1].key}` : 'null',
        },
        state: {
          capacity,
          order: snapshot(opts.activeKey ?? null, opts.highlightStatus ?? 'default'),
          evictedNode: opts.evictedNode ?? null,
          lastOp: opts.lastOp,
          lastResult: opts.lastResult,
          activeKey: opts.activeKey ?? null,
          opIndex: opts.opIndex,
          totalOps: ops.length,
          hits,
          misses,
          evictions,
        },
      });
    };

    pushFrame(1, `Initialized empty LRU Cache with capacity = ${capacity}. Hash Map is empty and Doubly Linked List has 0 nodes.`, {
      action: 'init',
      soundCue: 'start',
      opIndex: -1,
      lastOp: `LRUCache(${capacity})`,
      lastResult: 'Ready',
      isMilestone: true,
      milestoneTitle: `Cache Init (Cap ${capacity})`,
      pedagogy: {
        what: `Allocate an empty Hash Map and an empty Doubly Linked List bounded at capacity ${capacity}.`,
        why: 'The Hash Map gives O(1) lookup by key, while the Doubly Linked List tracks recency order in O(1).',
        whatNext: `Execute the first operation: ${ops[0].op}(${ops[0].key}${ops[0].val !== undefined ? `, ${ops[0].val}` : ''}).`,
      },
    });

    ops.forEach((op, opIdx) => {
      if (op.op === 'get') {
        const opStr = `get(${op.key})`;
        const foundIdx = list.findIndex((x) => x.key === op.key);

        if (foundIdx === -1) {
          misses++;
          pushFrame(3, `Cache MISS on ${opStr}: key ${op.key} is not in Hash Map → return -1.`, {
            action: 'compare',
            soundCue: 'fail',
            opIndex: opIdx,
            lastOp: opStr,
            lastResult: 'MISS → -1',
            activeKey: op.key,
            conditionEval: { expr: `map.has(${op.key})`, result: false },
            pedagogy: {
              what: `Looked up key ${op.key} in the Hash Map in O(1) and found no entry.`,
              why: 'When a key was never inserted or was previously evicted as LRU, get() returns -1 without mutating the list.',
              whatNext: 'Advance to the next cache operation.',
            },
          });
        } else {
          hits++;
          const [node] = list.splice(foundIdx, 1);
          list.unshift(node);
          pushFrame(
            5,
            `Cache HIT on ${opStr} = ${node.val}! Unlinked node(${node.key}) in O(1) and promoted it to MRU Head.`,
            {
              action: 'found',
              soundCue: 'success',
              opIndex: opIdx,
              lastOp: opStr,
              lastResult: `HIT → ${node.val} (Moved to MRU)`,
              activeKey: node.key,
              highlightStatus: 'hit',
              isMilestone: true,
              milestoneTitle: `HIT k=${node.key} → MRU`,
              conditionEval: { expr: `map.has(${op.key})`, result: true },
              pedagogy: {
                what: `Found key ${node.key} (val=${node.val}) via Hash Map and spliced it to the front of the Doubly Linked List.`,
                why: 'Touching key ' + node.key + ' makes it the Most Recently Used item so it is protected from upcoming evictions.',
                whatNext: `The current LRU candidate at the tail is now key ${list[list.length - 1].key}.`,
              },
            }
          );
        }
      } else {
        const val = op.val ?? op.key * 10;
        const opStr = `put(${op.key}, ${val})`;
        const foundIdx = list.findIndex((x) => x.key === op.key);

        if (foundIdx !== -1) {
          const [existing] = list.splice(foundIdx, 1);
          existing.val = val;
          list.unshift(existing);
          pushFrame(
            11,
            `Updated existing key ${op.key} → ${val} and promoted it to MRU Head in O(1).`,
            {
              action: 'insert',
              soundCue: 'insert',
              opIndex: opIdx,
              lastOp: opStr,
              lastResult: `Updated k=${op.key} → MRU`,
              activeKey: op.key,
              highlightStatus: 'inserted',
              conditionEval: { expr: `map.has(${op.key})`, result: true },
              pedagogy: {
                what: `Key ${op.key} already existed in the cache, so its value was overwritten with ${val} and moved to Head.`,
                why: 'Updating an existing key counts as recent usage and does not increase cache size.',
                whatNext: 'Proceed to the next operation.',
              },
            }
          );
        } else {
          if (list.length >= capacity) {
            const lruVictim = list[list.length - 1];
            const checkpoint = !addedCheckpoint
              ? {
                  id: 'lru-first-eviction',
                  question: `Cache is full (${capacity}/${capacity}). Before inserting key ${op.key}, which key must be evicted?`,
                  options: [
                    `Tail (LRU) key ${lruVictim.key}`,
                    `Head (MRU) key ${list[0].key}`,
                    `Smallest key value`,
                  ],
                  correctIndex: 0,
                  explanation: `Key ${lruVictim.key} sits at the Tail of the Doubly Linked List, meaning it has gone the longest without being accessed.`,
                }
              : undefined;
            if (checkpoint) addedCheckpoint = true;

            evictions++;
            const evicted = list.pop()!;
            pushFrame(
              14,
              `Cache FULL (${capacity}/${capacity})! Evicting LRU Tail node [key=${evicted.key}, val=${evicted.val}] and deleting map[${evicted.key}].`,
              {
                action: 'swap',
                soundCue: 'pop',
                opIndex: opIdx,
                lastOp: opStr,
                lastResult: `EVICTED LRU k=${evicted.key}`,
                evictedNode: evicted,
                isMilestone: true,
                milestoneTitle: `Evict LRU k=${evicted.key}`,
                conditionEval: { expr: `size (${capacity}) == capacity (${capacity})`, result: true },
                checkpoint,
                pedagogy: {
                  what: `Removed tail node (key=${evicted.key}) from the Doubly Linked List and deleted its pointer from the Hash Map.`,
                  why: 'Evicting from the tail guarantees we drop the Least Recently Used key in strict O(1) time.',
                  whatNext: `Insert the new node (${op.key}: ${val}) at the MRU Head.`,
                },
              }
            );
          }

          list.unshift({ key: op.key, val });
          pushFrame(
            17,
            `Inserted new node [key=${op.key}, val=${val}] at MRU Head and registered map[${op.key}] → node.`,
            {
              action: 'insert',
              soundCue: 'insert',
              opIndex: opIdx,
              lastOp: opStr,
              lastResult: `Inserted k=${op.key} at MRU`,
              activeKey: op.key,
              highlightStatus: 'inserted',
              conditionEval: { expr: `size (${list.length}) <= capacity (${capacity})`, result: true },
              pedagogy: {
                what: `Created node (${op.key} → ${val}), prepended it to the MRU Head, and stored its reference in the Hash Map.`,
                why: 'Newly inserted keys are the most recently used and must sit at the Head of the list.',
                whatNext:
                  opIdx < ops.length - 1
                    ? `Next operation: ${ops[opIdx + 1].op}(${ops[opIdx + 1].key}${ops[opIdx + 1].val !== undefined ? `, ${ops[opIdx + 1].val}` : ''}).`
                    : 'All workload operations complete!',
              },
            }
          );
        }
      }
    });

    pushFrame(
      17,
      `Workload complete! ${hits} hit(s), ${misses} miss(es), ${evictions} eviction(s). Final MRU→LRU order: [${list.map((x) => `${x.key}:${x.val}`).join(' → ')}].`,
      {
        action: 'complete',
        soundCue: 'complete',
        opIndex: ops.length,
        lastOp: 'Done',
        lastResult: `Hits: ${hits} · Misses: ${misses} · Evictions: ${evictions}`,
        isMilestone: true,
        milestoneTitle: 'Workload Complete',
        pedagogy: {
          what: `Processed all ${ops.length} operations in strict O(1) time per operation.`,
          why: 'Hash Map + Doubly Linked List guarantees O(1) lookup, promotion, and eviction regardless of cache capacity.',
          whatNext: 'Try switching presets to see in-place key updates or high-hit workloads.',
        },
      }
    );

    const total = frames.length;
    frames.forEach((f, i) => {
      f.stepIndex = i;
      f.totalSteps = total;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<LRUCacheState>) => {
    const { capacity, order, evictedNode, lastOp, lastResult, activeKey, hits, misses, evictions } = frame.state;

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 select-none">
        {/* Top Telemetry HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#111827] border border-[#1F293D] px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="px-2 py-0.5 rounded theme-accent-soft font-bold">{lastOp}</span>
            <span className="text-slate-300 font-semibold">{lastResult}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
            <span className="text-slate-400">
              Cap: <strong className="text-white">{order.length}/{capacity}</strong>
            </span>
            <span className="text-emerald-400">Hits: <strong>{hits}</strong></span>
            <span className="text-amber-400">Misses: <strong>{misses}</strong></span>
            <span className="text-rose-400">Evictions: <strong>{evictions}</strong></span>
          </div>
        </div>

        {/* Doubly Linked List (MRU Head <-> ... <-> LRU Tail) */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-[11px] font-mono">
            <span className="font-bold text-cyan-400 uppercase tracking-wider">
              Doubly Linked List (Recency Order)
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-emerald-400 font-bold">← MRU (Head)</span>
              <span className="text-rose-400 font-bold">LRU (Tail) →</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-3 px-1 min-h-[104px]">
            <div className="px-2 py-1 rounded border border-dashed border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-400 shrink-0">
              HEAD
            </div>
            <span className="text-slate-500 font-mono text-xs shrink-0">⇄</span>

            {order.length === 0 ? (
              <div className="px-4 py-2 rounded-lg border border-dashed border-slate-700 text-xs font-mono text-slate-400">
                (empty list)
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {order.map((node, idx) => {
                  const isMRU = idx === 0;
                  const isLRU = idx === order.length - 1;
                  const isHit = node.status === 'hit';
                  const isInserted = node.status === 'inserted';
                  const boxStyle = isHit
                    ? {
                        backgroundColor: 'var(--sem-sorted-bg)',
                        borderColor: 'var(--sem-sorted-border)',
                        color: 'var(--sem-sorted-text)',
                      }
                    : isInserted
                    ? {
                        backgroundColor: 'var(--sem-active-bg)',
                        borderColor: 'var(--sem-active-border)',
                        color: 'var(--sem-active-text)',
                      }
                    : {
                        backgroundColor: 'var(--sem-default-cell-bg)',
                        borderColor: 'var(--sem-default-border)',
                        color: 'var(--sem-default-text)',
                      };

                  return (
                    <motion.div
                      key={node.key}
                      layout
                      initial={{ opacity: 0, scale: 0.85, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 12 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      className="flex items-center gap-2 shrink-0"
                    >
                      <div className="relative flex flex-col items-center">
                        <div className="flex gap-1 mb-1 h-4">
                          {isMRU && (
                            <span
                              style={{
                                backgroundColor: 'var(--sem-sorted-solid)',
                                color: 'var(--sem-sorted-on-solid)',
                              }}
                              className="theme-solid-badge px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold"
                            >
                              MRU
                            </span>
                          )}
                          {isLRU && (
                            <span
                              style={{
                                backgroundColor: 'var(--sem-swapping-solid)',
                                color: 'var(--sem-swapping-on-solid)',
                              }}
                              className="theme-solid-badge px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold"
                            >
                              LRU
                            </span>
                          )}
                        </div>
                        <div
                          style={boxStyle}
                          className="rounded-lg border-2 flex items-stretch overflow-hidden font-mono shadow-sm"
                        >
                          <span className="px-1.5 py-2 text-[9px] opacity-60 border-r border-current/20 flex items-center">
                            ←P
                          </span>
                          <div className="px-3 py-1.5 flex flex-col items-center justify-center min-w-[64px]">
                            <span className="text-[10px] opacity-75">k={node.key}</span>
                            <span className="text-sm font-bold tabular-nums">{node.val}</span>
                          </div>
                          <span className="px-1.5 py-2 text-[9px] opacity-60 border-l border-current/20 flex items-center">
                            N→
                          </span>
                        </div>
                      </div>
                      {idx < order.length - 1 && (
                        <span className="text-slate-400 font-mono text-xs mt-4">⇄</span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            <span className="text-slate-500 font-mono text-xs shrink-0">⇄</span>
            <div className="px-2 py-1 rounded border border-dashed border-rose-500/50 text-[10px] font-mono font-bold text-rose-400 shrink-0">
              TAIL
            </div>

            {evictedNode && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                style={{
                  backgroundColor: 'var(--sem-swapping-bg)',
                  borderColor: 'var(--sem-swapping-border)',
                  color: 'var(--sem-swapping-text)',
                }}
                className="ml-3 px-3 py-1.5 rounded-lg border-2 border-dashed font-mono text-xs shrink-0"
              >
                <div className="text-[9px] font-bold uppercase">EVICTED</div>
                <div className="font-bold">k={evictedNode.key} → {evictedNode.val}</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Hash Map Lookup Table (O(1) key -> node*) */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 text-[11px] font-mono">
            <span className="font-bold text-purple-400 uppercase tracking-wider">
              Hash Map Index · O(1) Direct Node Pointers
            </span>
            <span className="text-slate-400">{order.length} active buckets</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {order.length === 0 ? (
              <span className="text-xs font-mono text-slate-400 italic">Map is empty {'{}'}</span>
            ) : (
              order.map((node, idx) => {
                const isActive = activeKey === node.key;
                return (
                  <div
                    key={node.key}
                    style={
                      isActive
                        ? {
                            backgroundColor: 'var(--sem-pivot-bg)',
                            borderColor: 'var(--sem-pivot-border)',
                            color: 'var(--sem-pivot-text)',
                          }
                        : undefined
                    }
                    className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 ${
                      isActive ? 'font-bold shadow-xs' : 'bg-[#0B0F19] border-[#1F293D] text-slate-300'
                    }`}
                  >
                    <span className="text-cyan-400 font-bold">key {node.key}</span>
                    <span className="text-slate-500">→</span>
                    <span>Node@{idx} ({node.val})</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  },
};
