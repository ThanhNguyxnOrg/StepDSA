import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface HashItem {
  key: string;
  value: number;
}

export interface HashTableChainingState {
  buckets: HashItem[][];
  bucketCount: number;
  activeKey: string | null;
  activeBucket: number | null;
  activeItemIndex: number | null;
  loadFactor: number;
  message: string;
}

function hashString(key: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % mod;
  }
  return (hash + mod) % mod;
}

export const hashTableChainingModule: AlgorithmModule<
  { operations: { op: 'INSERT' | 'SEARCH' | 'DELETE'; key: string; value?: number }[]; bucketCount: number },
  HashTableChainingState
> = {
  id: 'hash-table-chaining',
  title: 'Hash Table (Separate Chaining with Linked Collision Buckets)',
  category: 'searching',
  difficulty: 'Beginner',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1 + alpha)',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(M + N) bucket array plus linked node allocations',
    worstCaseCondition: 'Pathological hash collisions where all N keys map to the same bucket chain',
  },
  theory: {
    overview:
      'Separate Chaining is a collision resolution strategy for Hash Tables. The table is an array of M buckets, where each bucket holds a linked list of key-value pairs that hash to that same index.',
    whyItWorks:
      'Under the Simple Uniform Hashing Assumption (SUHA), keys distribute uniformly across buckets. The expected length of any chain is the load factor alpha = N / M, providing average O(1) searches, insertions, and deletions.',
    invariant:
      'Chaining Invariant: A key K resides exclusively in the linked chain at bucket index h(K) = hash(K) mod M. No key is placed outside its designated bucket.',
    pitfalls: [
      'Allowing load factor alpha to grow excessively without dynamic resizing, degrading performance to O(N).',
      'Using a poor hash function that clusters keys into identical buckets.',
    ],
  },
  presets: [
    {
      id: 'chaining-collision-demo',
      label: 'Collisions on Mod 5',
      description: 'Inserts names that hash to the same bucket to visualize chain elongation',
      data: {
        bucketCount: 5,
        operations: [
          { op: 'INSERT', key: 'Alice', value: 101 },
          { op: 'INSERT', key: 'Bob', value: 202 },
          { op: 'INSERT', key: 'Charlie', value: 303 },
          { op: 'INSERT', key: 'Dave', value: 404 },
          { op: 'INSERT', key: 'Eve', value: 505 },
          { op: 'SEARCH', key: 'Charlie' },
        ],
      },
    },
    {
      id: 'chaining-delete-search',
      label: 'Insert, Delete, and Search',
      description: 'Demonstrates chain node unlinking and subsequent search miss',
      data: {
        bucketCount: 5,
        operations: [
          { op: 'INSERT', key: 'Apple', value: 10 },
          { op: 'INSERT', key: 'Banana', value: 20 },
          { op: 'DELETE', key: 'Apple' },
          { op: 'SEARCH', key: 'Apple' },
        ],
      },
    },
  ],
  defaultInput: {
    bucketCount: 5,
    operations: [
      { op: 'INSERT', key: 'Alice', value: 101 },
      { op: 'INSERT', key: 'Bob', value: 202 },
      { op: 'INSERT', key: 'Charlie', value: 303 },
      { op: 'INSERT', key: 'Dave', value: 404 },
      { op: 'INSERT', key: 'Eve', value: 505 },
      { op: 'SEARCH', key: 'Charlie' },
    ],
  },
  codeSnippets: {
    cpp: `class HashTable {
    int M;
    vector<list<pair<string, int>>> table;
public:
    HashTable(int m) : M(m), table(m) {}

    int hash(string key) {
        int h = 0;
        for (char c : key) h = (h * 31 + c) % M;
        return (h + M) % M;
    }

    void insert(string key, int val) {
        int idx = hash(key);
        for (auto& p : table[idx]) {
            if (p.first == key) { p.second = val; return; }
        }
        table[idx].push_back({key, val});
    }

    bool search(string key, int& val) {
        int idx = hash(key);
        for (auto& p : table[idx]) {
            if (p.first == key) { val = p.second; return true; }
        }
        return false;
    }
};`,
    python: `class HashTable:
    def __init__(self, m=5):
        self.m = m
        self.table = [[] for _ in range(m)]

    def _hash(self, key):
        return sum(ord(c) * (31 ** i) for i, c in enumerate(key)) % self.m

    def insert(self, key, val):
        idx = self._hash(key)
        for i, (k, v) in enumerate(self.table[idx]):
            if k == key:
                self.table[idx][i] = (key, val)
                return
        self.table[idx].append((key, val))

    def search(self, key):
        idx = self._hash(key)
        for k, v in self.table[idx]:
            if k == key: return v
        return None`,
    typescript: `class HashTable {
  private buckets: [string, number][][];
  constructor(private M = 5) {
    this.buckets = Array.from({ length: M }, () => []);
  }

  insert(key: string, val: number): void {
    const idx = this.hash(key);
    const chain = this.buckets[idx];
    const existing = chain.find(([k]) => k === key);
    if (existing) existing[1] = val;
    else chain.push([key, val]);
  }
}`,
    java: `class HashTable {
    private LinkedList<Entry>[] table;
    private int M;

    public void insert(String key, int val) {
        int idx = hash(key);
        for (Entry e : table[idx]) {
            if (e.key.equals(key)) { e.val = val; return; }
        }
        table[idx].add(new Entry(key, val));
    }
}`,
    pseudocode: `function insert(key, val):
    idx = hash(key) mod M
    for each entry in table[idx]:
        if entry.key == key: entry.val = val; return
    table[idx].append(new Entry(key, val))`,
  },
  generateTimeline: (input: {
    operations: { op: 'INSERT' | 'SEARCH' | 'DELETE'; key: string; value?: number }[];
    bucketCount: number;
  }): ExecutionFrame<HashTableChainingState>[] => {
    const bucketCount = input?.bucketCount && input.bucketCount > 0 ? input.bucketCount : 5;
    const ops = input?.operations?.length
      ? input.operations
      : [
          { op: 'INSERT', key: 'Alice', value: 101 },
          { op: 'INSERT', key: 'Bob', value: 202 },
          { op: 'INSERT', key: 'Charlie', value: 303 },
        ];

    const buckets: HashItem[][] = Array.from({ length: bucketCount }, () => []);
    const frames: ExecutionFrame<HashTableChainingState>[] = [];

    function cloneBuckets(): HashItem[][] {
      return buckets.map((b) => b.map((item) => ({ ...item })));
    }

    function totalItems(): number {
      return buckets.reduce((acc, b) => acc + b.length, 0);
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        buckets: cloneBuckets(),
        bucketCount,
        activeKey: null,
        activeBucket: null,
        activeItemIndex: null,
        loadFactor: 0,
        message: 'Initialized empty Hash Table with Separate Chaining',
      },
      callStack: [{ name: 'initTable', params: { bucketCount } }],
      variables: { bucketCount, totalElements: 0, loadFactor: 0 },
      explanation: `Initialized hash table with M=${bucketCount} empty buckets. Ready for operations.`,
    });

    for (const op of ops) {
      const bucketIdx = hashString(op.key, bucketCount);

      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: 8,
        action: 'HASH_KEY',
        state: {
          buckets: cloneBuckets(),
          bucketCount,
          activeKey: op.key,
          activeBucket: bucketIdx,
          activeItemIndex: null,
          loadFactor: totalItems() / bucketCount,
          message: `${op.op} "${op.key}": hash("${op.key}") % ${bucketCount} = Bucket ${bucketIdx}`,
        },
        callStack: [{ name: op.op.toLowerCase(), params: { key: op.key, bucket: bucketIdx } }],
        variables: { op: op.op, key: op.key, computedBucket: bucketIdx },
        explanation: `Computed hash for key "${op.key}": maps directly to Bucket index ${bucketIdx}.`,
      });

      const chain = buckets[bucketIdx];

      if (op.op === 'INSERT') {
        const val = op.value ?? 1;
        const existingIdx = chain.findIndex((item) => item.key === op.key);

        if (existingIdx !== -1) {
          chain[existingIdx].value = val;
          frames.push({
            stepIndex: frames.length,
            totalSteps: frames.length + 1,
            codeLine: 16,
            action: 'UPDATE_EXISTING',
            state: {
              buckets: cloneBuckets(),
              bucketCount,
              activeKey: op.key,
              activeBucket: bucketIdx,
              activeItemIndex: existingIdx,
              loadFactor: totalItems() / bucketCount,
              message: `Updated existing key "${op.key}" with value ${val} in Bucket ${bucketIdx}`,
            },
            callStack: [{ name: 'update', params: { key: op.key, val } }],
            variables: { key: op.key, val, bucketIdx },
            explanation: `Key "${op.key}" found at chain index ${existingIdx}. Updated value to ${val}.`,
          });
        } else {
          chain.push({ key: op.key, value: val });
          frames.push({
            stepIndex: frames.length,
            totalSteps: frames.length + 1,
            codeLine: 19,
            action: 'CHAIN_APPEND',
            state: {
              buckets: cloneBuckets(),
              bucketCount,
              activeKey: op.key,
              activeBucket: bucketIdx,
              activeItemIndex: chain.length - 1,
              loadFactor: totalItems() / bucketCount,
              message: `Appended ("${op.key}", ${val}) to Bucket ${bucketIdx} chain`,
            },
            callStack: [{ name: 'append', params: { key: op.key, val } }],
            variables: { key: op.key, val, newChainLength: chain.length, loadFactor: totalItems() / bucketCount },
            explanation: `Appended ("${op.key}", ${val}) to chain in Bucket ${bucketIdx}. Load factor is now ${(totalItems() / bucketCount).toFixed(2)}.`,
          });
        }
      } else if (op.op === 'SEARCH') {
        const foundIdx = chain.findIndex((item) => item.key === op.key);
        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 24,
          action: 'SEARCH_RESULT',
          state: {
            buckets: cloneBuckets(),
            bucketCount,
            activeKey: op.key,
            activeBucket: bucketIdx,
            activeItemIndex: foundIdx !== -1 ? foundIdx : null,
            loadFactor: totalItems() / bucketCount,
            message: foundIdx !== -1
              ? `Found "${op.key}" (val=${chain[foundIdx].value}) in Bucket ${bucketIdx}`
              : `Key "${op.key}" not found in Bucket ${bucketIdx}`,
          },
          callStack: [{ name: 'search', params: { key: op.key, found: foundIdx !== -1 ? 1 : 0 } }],
          variables: { key: op.key, found: foundIdx !== -1, result: foundIdx !== -1 ? chain[foundIdx].value : 'MISS' },
          explanation: foundIdx !== -1
            ? `Search hit! Key "${op.key}" located in Bucket ${bucketIdx} chain at index ${foundIdx} (value: ${chain[foundIdx].value}).`
            : `Search miss. Key "${op.key}" does not exist in Bucket ${bucketIdx} chain.`,
        });
      } else if (op.op === 'DELETE') {
        const removeIdx = chain.findIndex((item) => item.key === op.key);
        if (removeIdx !== -1) {
          chain.splice(removeIdx, 1);
          frames.push({
            stepIndex: frames.length,
            totalSteps: frames.length + 1,
            codeLine: 28,
            action: 'DELETE_UNLINK',
            state: {
              buckets: cloneBuckets(),
              bucketCount,
              activeKey: op.key,
              activeBucket: bucketIdx,
              activeItemIndex: null,
              loadFactor: totalItems() / bucketCount,
              message: `Unlinked "${op.key}" from Bucket ${bucketIdx} chain`,
            },
            callStack: [{ name: 'delete', params: { key: op.key } }],
            variables: { key: op.key, deleted: true, loadFactor: totalItems() / bucketCount },
            explanation: `Successfully unlinked and deleted key "${op.key}" from Bucket ${bucketIdx}.`,
          });
        } else {
          frames.push({
            stepIndex: frames.length,
            totalSteps: frames.length + 1,
            codeLine: 30,
            action: 'DELETE_MISS',
            state: {
              buckets: cloneBuckets(),
              bucketCount,
              activeKey: op.key,
              activeBucket: bucketIdx,
              activeItemIndex: null,
              loadFactor: totalItems() / bucketCount,
              message: `Cannot delete: key "${op.key}" not found in Bucket ${bucketIdx}`,
            },
            callStack: [{ name: 'delete', params: { key: op.key, success: 0 } }],
            variables: { key: op.key, deleted: false },
            explanation: `Delete failed: key "${op.key}" does not exist in Bucket ${bucketIdx}.`,
          });
        }
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 35,
      action: 'COMPLETE',
      state: {
        buckets: cloneBuckets(),
        bucketCount,
        activeKey: null,
        activeBucket: null,
        activeItemIndex: null,
        loadFactor: totalItems() / bucketCount,
        message: 'All operations executed successfully',
      },
      callStack: [{ name: 'complete', params: { totalItems: totalItems() } }],
      variables: { completed: true, finalElements: totalItems(), finalLoadFactor: totalItems() / bucketCount },
      explanation: `Finished executing all operations on Separate Chaining Hash Table. Final load factor: ${(totalItems() / bucketCount).toFixed(2)}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<HashTableChainingState>) => {
    const { buckets, bucketCount, activeKey, activeBucket, activeItemIndex, loadFactor, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Load Factor (&alpha;): <strong className="text-amber-400">{loadFactor.toFixed(2)}</strong></span>
            <span>Buckets (M): <strong className="text-cyan-400">{bucketCount}</strong></span>
          </div>
        </div>

        {/* Bucket Table Visualization */}
        <div className="flex flex-col gap-3 w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[300px]">
          {Array.from({ length: bucketCount }).map((_, bIdx) => {
            const isBucketActive = bIdx === activeBucket;
            const chain = buckets[bIdx] || [];

            return (
              <div key={`bucket-${bIdx}`} className="flex items-center gap-3">
                {/* Bucket Index Header */}
                <div
                  className={`flex items-center justify-center w-14 h-12 rounded-xl border font-mono text-xs font-bold transition-all duration-300 ${
                    isBucketActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 scale-105 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  [{bIdx}]
                </div>

                {/* Arrow connector */}
                <div className="text-slate-600 font-mono text-sm">&rarr;</div>

                {/* Linked chain elements */}
                <div className="flex items-center gap-2 flex-wrap">
                  {chain.map((item, itemIdx) => {
                    const isItemActive = isBucketActive && (itemIdx === activeItemIndex || item.key === activeKey);

                    return (
                      <div key={`${item.key}-${itemIdx}`} className="flex items-center gap-2">
                        <div
                          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border font-mono transition-all duration-300 ${
                            isItemActive
                              ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 scale-105 shadow-md'
                              : 'bg-slate-900/90 text-slate-300 border-slate-700/80'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.key}</span>
                          <span className="text-[10px] text-slate-500">val: {item.value}</span>
                        </div>
                        {itemIdx < chain.length - 1 && (
                          <span className="text-slate-600 text-xs font-mono">&rarr;</span>
                        )}
                      </div>
                    );
                  })}
                  {chain.length === 0 && (
                    <span className="text-slate-600 text-xs font-mono italic">empty</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
