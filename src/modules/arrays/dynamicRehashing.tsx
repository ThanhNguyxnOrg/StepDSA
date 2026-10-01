import { AlgorithmModule, ExecutionFrame, CallStackFrame } from '../../core/types';

export interface HashSlot {
  key: number;
  val: string;
}

export interface DynamicRehashingState {
  capacity: number;
  oldCapacity: number | null;
  table: (HashSlot | null)[];
  oldTable: (HashSlot | null)[] | null;
  count: number;
  loadFactor: number;
  threshold: number;
  activeKey: number | null;
  activeSlotIdx: number | null;
  isRehashing: boolean;
  message: string;
}

export const dynamicRehashingModule: AlgorithmModule<
  { initialCapacity: number; threshold: number; insertions: { key: number; val: string }[] },
  DynamicRehashingState
> = {
  id: 'dynamic-rehashing',
  title: 'Dynamic Rehashing & Load Factor Resizing (Double Hashing)',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1) average lookup/insert',
    timeAverage: 'O(1) amortized insertion with load factor < 0.7',
    timeWorst: 'O(N) full rehash migration to new prime capacity table',
    spaceAuxiliary: 'O(M) contiguous hash bucket array',
    worstCaseCondition: 'Load factor crossing threshold triggering full re-indexing of all keys',
  },
  theory: {
    overview:
      'Dynamic Rehashing maintains O(1) expected hash map performance by monitoring the load factor alpha = N / M. When alpha exceeds a threshold (typically 0.7), the table dynamically reallocates a larger prime capacity (roughly 2x) and re-hashes every existing element.',
    whyItWorks:
      'In open addressing, collision cluster lengths explode exponentially as alpha -> 1.0. Resizing to the next prime capacity resets alpha back down to ~0.35. Using Double Hashing: h(k, i) = (h1(k) + i * h2(k)) % M eliminates primary and secondary clustering.',
    invariant:
      'Load Factor Invariant: At steady state, alpha = N / M <= threshold. If alpha > threshold after insertion, capacity is resized to the next prime P >= 2M + 1 and all keys are rehashed.',
    pitfalls: [
      'Resizing to a power of two instead of a prime number when using linear or double hashing, causing probe steps that do not cover the full cycle of buckets.',
      'Forgetting that existing key indices are invalid after capacity changes and must be recalculated with the new modulo M_new.',
    ],
  },
  defaultInput: {
    initialCapacity: 7,
    threshold: 0.7,
    insertions: [
      { key: 10, val: 'Alpha' },
      { key: 17, val: 'Beta' },
      { key: 24, val: 'Gamma' },
      { key: 31, val: 'Delta' },
      { key: 38, val: 'Epsilon' },
      { key: 45, val: 'Zeta' },
    ],
  },
  presets: [
    {
      id: 'rehash-trigger',
      label: 'Rehash Trigger (Cap 7 -> 17)',
      description: 'Threshold 70% reached, re-allocating prime capacity 17',
      data: {
        initialCapacity: 7,
        threshold: 0.7,
        insertions: [
          { key: 12, val: 'A' },
          { key: 19, val: 'B' },
          { key: 26, val: 'C' },
          { key: 33, val: 'D' },
          { key: 40, val: 'E' },
        ],
      },
    },
    {
      id: 'high-collisions-double-hashing',
      label: 'High Collisions Double Hashing',
      description: 'Congested table with step jumps h2(k) resolving clashes',
      data: {
        initialCapacity: 5,
        threshold: 0.6,
        insertions: [
          { key: 5, val: 'K5' },
          { key: 10, val: 'K10' },
          { key: 15, val: 'K15' },
          { key: 20, val: 'K20' },
        ],
      },
    },
  ],
  codeSnippets: {
    cpp: `int h1(int k, int M) { return k % M; }
int h2(int k, int M) { return 1 + (k % (M - 1)); }

void insert(int key, string val) {
    if ((double)(count + 1) / capacity > threshold) {
        rehash(nextPrime(capacity * 2));
    }
    int i = 0;
    while (table[(h1(key, capacity) + i * h2(key, capacity)) % capacity] != nullptr) {
        i++;
    }
    table[(h1(key, capacity) + i * h2(key, capacity)) % capacity] = new Entry{key, val};
    count++;
}`,
    python: `def insert(key, val):
    global count, capacity, table
    if (count + 1) / capacity > threshold:
        rehash(next_prime(capacity * 2))
    
    i = 0
    while True:
        idx = (h1(key, capacity) + i * h2(key, capacity)) % capacity
        if table[idx] is None:
            table[idx] = (key, val)
            count += 1
            break
        i += 1`,
    typescript: `function insert(key: number, val: string): void {
  if ((count + 1) / capacity > threshold) {
    rehash(findNextPrime(capacity * 2));
  }
  let i = 0;
  while (true) {
    const idx = (h1(key, capacity) + i * h2(key, capacity)) % capacity;
    if (!table[idx]) {
      table[idx] = { key, val };
      count++;
      break;
    }
    i++;
  }
}`,
    java: `int probe(int key, int i, int M) {
    int h1 = key % M;
    int h2 = 1 + (key % (M - 1));
    return (h1 + i * h2) % M;
}`,
    pseudocode: `if (count + 1) / capacity > threshold:
    newCap = nextPrime(capacity * 2)
    newTable = array(newCap)
    for each entry in table:
        re-insert into newTable with newCap
    table = newTable
    capacity = newCap`,
  },
  generateTimeline: (input) => {
    const frames: ExecutionFrame<DynamicRehashingState>[] = [];
    let capacity = input.initialCapacity || 7;
    const threshold = input.threshold || 0.7;
    let count = 0;
    let table: (HashSlot | null)[] = new Array(capacity).fill(null);

    const addFrame = (
      codeLine: number,
      explanation: string,
      state: DynamicRehashingState,
      options?: {
        action?: string;
        variables?: Record<string, string | number | boolean>;
        callStack?: CallStackFrame[];
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 0,
        codeLine,
        explanation,
        action: options?.action,
        variables: options?.variables,
        callStack: options?.callStack,
        state,
      });
    };

    const h1 = (k: number, M: number) => ((k % M) + M) % M;
    const h2 = (k: number, M: number) => 1 + (((k % (M - 1)) + (M - 1)) % (M - 1));

    const nextPrime = (n: number) => {
      let candidate = n % 2 === 0 ? n + 1 : n;
      const isP = (num: number) => {
        if (num < 2) return false;
        for (let i = 2; i * i <= num; i++) if (num % i === 0) return false;
        return true;
      };
      while (!isP(candidate)) candidate += 2;
      return candidate;
    };

    addFrame(
      1,
      `Initialized Hash Table with Prime capacity M = ${capacity}, Threshold = ${(threshold * 100).toFixed(0)}%.`,
      {
        capacity,
        oldCapacity: null,
        table: [...table],
        oldTable: null,
        count: 0,
        loadFactor: 0,
        threshold,
        activeKey: null,
        activeSlotIdx: null,
        isRehashing: false,
        message: `Hash table initialized with ${capacity} prime buckets.`,
      },
      {
        action: 'INIT',
        variables: { capacity, count: 0, loadFactor: '0.00' },
        callStack: [{ name: 'initTable', params: { capacity, threshold } }],
      }
    );

    for (let insIdx = 0; insIdx < input.insertions.length; insIdx++) {
      const { key, val } = input.insertions[insIdx];
      const futureLoad = (count + 1) / capacity;

      if (futureLoad > threshold) {
        const oldCap = capacity;
        const newCap = nextPrime(capacity * 2);
        const oldTableCopy = [...table];

        addFrame(
          4,
          `Load Factor Warning: (${count + 1} / ${oldCap} = ${futureLoad.toFixed(2)}) > threshold (${threshold}). Initiating Dynamic Rehashing!`,
          {
            capacity: oldCap,
            oldCapacity: oldCap,
            table: [...table],
            oldTable: oldTableCopy,
            count,
            loadFactor: count / oldCap,
            threshold,
            activeKey: key,
            activeSlotIdx: null,
            isRehashing: true,
            message: `Threshold exceeded! Allocating new prime bucket array of size ${newCap}.`,
          },
          {
            action: 'REHASH_TRIGGER',
            variables: { oldCap, newCap, currentCount: count, threshold },
            callStack: [{ name: 'rehashTriggered', params: { oldCap, newCap } }],
          }
        );

        const newTable: (HashSlot | null)[] = new Array(newCap).fill(null);

        for (let oldIdx = 0; oldIdx < oldCap; oldIdx++) {
          const item = oldTableCopy[oldIdx];
          if (item) {
            let probe = 0;
            let newSlot = (h1(item.key, newCap) + probe * h2(item.key, newCap)) % newCap;
            while (newTable[newSlot] !== null) {
              probe++;
              newSlot = (h1(item.key, newCap) + probe * h2(item.key, newCap)) % newCap;
            }
            newTable[newSlot] = item;

            addFrame(
              8,
              `Rehashing key ${item.key}: Old bucket [${oldIdx}] -> New bucket [${newSlot}] (probe step: ${probe}).`,
              {
                capacity: newCap,
                oldCapacity: oldCap,
                table: [...newTable],
                oldTable: oldTableCopy,
                count,
                loadFactor: count / newCap,
                threshold,
                activeKey: item.key,
                activeSlotIdx: newSlot,
                isRehashing: true,
                message: `Migrated key ${item.key} into new table slot [${newSlot}].`,
              },
              {
                action: 'MIGRATE_KEY',
                variables: { key: item.key, oldIdx, newSlot, newCap },
                callStack: [{ name: 'migrateKey', params: { key: item.key, newSlot } }],
              }
            );
          }
        }

        capacity = newCap;
        table = newTable;

        addFrame(
          12,
          `Rehashing complete. Old buffer reclaimed. New capacity = ${capacity}, Load Factor reset to ${(count / capacity).toFixed(2)}.`,
          {
            capacity,
            oldCapacity: null,
            table: [...table],
            oldTable: null,
            count,
            loadFactor: count / capacity,
            threshold,
            activeKey: null,
            activeSlotIdx: null,
            isRehashing: false,
            message: `Rehashing finished. Memory doubled to ${capacity} buckets; load factor healthy.`,
          },
          {
            action: 'REHASH_DONE',
            variables: { capacity, count, loadFactor: (count / capacity).toFixed(2) },
            callStack: [{ name: 'rehashComplete', params: { capacity } }],
          }
        );
      }

      let probe = 0;
      let slot = (h1(key, capacity) + probe * h2(key, capacity)) % capacity;

      while (table[slot] !== null) {
        addFrame(
          15,
          `Collision at bucket [${slot}] for key ${key}! Double Hashing jump: +${h2(key, capacity)}.`,
          {
            capacity,
            oldCapacity: null,
            table: [...table],
            oldTable: null,
            count,
            loadFactor: count / capacity,
            threshold,
            activeKey: key,
            activeSlotIdx: slot,
            isRehashing: false,
            message: `Collision at [${slot}]. Double hashing probe step ${probe + 1}.`,
          },
          {
            action: 'PROBE_COLLISION',
            variables: { key, collisionSlot: slot, step: h2(key, capacity), probe },
            callStack: [{ name: 'doubleHashProbe', params: { key, slot, probe } }],
          }
        );
        probe++;
        slot = (h1(key, capacity) + probe * h2(key, capacity)) % capacity;
      }

      table[slot] = { key, val };
      count++;

      addFrame(
        18,
        `Inserted (${key}, "${val}") into bucket [${slot}] (probes: ${probe}). Count = ${count}, Alpha = ${(count / capacity).toFixed(2)}.`,
        {
          capacity,
          oldCapacity: null,
          table: [...table],
          oldTable: null,
          count,
          loadFactor: count / capacity,
          threshold,
          activeKey: key,
          activeSlotIdx: slot,
          isRehashing: false,
          message: `Key ${key} stored at bucket [${slot}]. Current load factor: ${((count / capacity) * 100).toFixed(1)}%.`,
        },
        {
          action: 'INSERT_ENTRY',
          variables: { key, slot, count, loadFactor: (count / capacity).toFixed(2) },
          callStack: [{ name: 'insert', params: { key, slot } }],
        }
      );
    }

    frames.forEach((f) => (f.totalSteps = frames.length));
    return frames;
  },
  renderStage: (frame: ExecutionFrame<DynamicRehashingState>) => {
    const { capacity, table, oldTable, count, loadFactor, threshold, activeSlotIdx, isRehashing, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="text-sm font-mono text-center text-slate-200 px-4 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl w-full">
          {message}
        </div>

        {/* Load Factor Telemetry */}
        <div className="w-full flex flex-wrap items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-xl gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Load Factor (α = N/M):
            </span>
            <div className="w-40 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className={`h-full transition-all duration-300 ${
                  loadFactor > threshold ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (loadFactor / 1.0) * 100)}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                style={{ left: `${threshold * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              {(loadFactor * 100).toFixed(1)}% (Threshold: {(threshold * 100).toFixed(0)}%)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-300">
              Capacity: {capacity} (Prime)
            </span>
            <span className="px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
              Entries: {count}
            </span>
            {isRehashing && (
              <span className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 font-bold animate-pulse">
                DYNAMIC REHASHING
              </span>
            )}
          </div>
        </div>

        {/* Old Table Display (during rehashing) */}
        {isRehashing && oldTable && (
          <div className="w-full flex flex-col p-4 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Old Table ({oldTable.length} Buckets) - Migrating Entries
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {oldTable.map((slot, idx) => (
                <div
                  key={`old-slot-${idx}`}
                  className="w-14 h-16 rounded-xl border border-rose-800/60 bg-slate-900/60 flex flex-col items-center justify-between p-1 font-mono text-xs opacity-60"
                >
                  <span className="text-[10px] text-rose-400/80 font-bold">[{idx}]</span>
                  <span className="font-bold text-slate-300">
                    {slot ? slot.key : <span className="text-slate-600 font-normal">ø</span>}
                  </span>
                  <span className="text-[9px] text-slate-500">{slot ? slot.val : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Hash Table Buckets */}
        <div className="w-full flex flex-col p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Prime Hash Buckets (Capacity: {capacity})
          </span>

          <div className="flex flex-wrap gap-2.5 justify-center max-h-72 overflow-y-auto p-1">
            {table.map((slot, idx) => {
              const isActive = idx === activeSlotIdx;
              const isOccupied = slot !== null;

              let style = 'bg-slate-900/40 border-slate-800 text-slate-600';
              if (isActive) {
                style = 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-lg shadow-amber-500/20 scale-105';
              } else if (isOccupied) {
                style = 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200';
              }

              return (
                <div
                  key={`slot-${idx}`}
                  className={`w-16 h-18 rounded-xl border flex flex-col items-center justify-between p-1.5 font-mono transition-all duration-200 ${style}`}
                >
                  <span className="text-[10px] text-slate-400 font-bold">[{idx}]</span>
                  <span className="text-sm font-bold">
                    {slot ? slot.key : <span className="text-slate-700 font-normal">ø</span>}
                  </span>
                  <span className="text-[10px] text-cyan-300 truncate max-w-full">
                    {slot ? slot.val : 'empty'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-cyan-950/50 border border-cyan-500/50" />
            <span>Occupied Bucket</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-900/40 border border-slate-800" />
            <span>Empty Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-500/30 border border-amber-400" />
            <span>Active Probe / Target</span>
          </div>
        </div>
      </div>
    );
  },
};
