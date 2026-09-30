import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export type SlotEntry = { key: string; value: number } | 'EMPTY' | 'DELETED';

export interface HashTableOpenAddressingState {
  slots: SlotEntry[];
  tableSize: number;
  probingMode: 'LINEAR' | 'QUADRATIC';
  activeKey: string | null;
  activeSlot: number | null;
  probeStep: number;
  probeIndices: number[];
  loadFactor: number;
  message: string;
}

function hashKey(key: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % mod;
  }
  return (hash + mod) % mod;
}

export const hashTableOpenAddressingModule: AlgorithmModule<
  {
    operations: { op: 'INSERT' | 'SEARCH' | 'DELETE'; key: string; value?: number }[];
    tableSize: number;
    probingMode: 'LINEAR' | 'QUADRATIC';
  },
  HashTableOpenAddressingState
> = {
  id: 'hash-table-open-addressing',
  title: 'Hash Table (Open Addressing: Linear & Quadratic Probing)',
  category: 'searching',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(1)',
    timeAverage: 'O(1 / (1 - alpha))',
    timeWorst: 'O(N)',
    spaceAuxiliary: 'O(M) contiguous slot array',
    worstCaseCondition: 'High load factor alpha approaching 1.0 causing extensive clustering and probe cascades',
  },
  theory: {
    overview:
      'Open Addressing stores all key-value entries directly within the hash table array. When a collision occurs, the algorithm systematically probes alternate slots according to a deterministic sequence until an empty slot or the target key is discovered.',
    whyItWorks:
      'Linear probing checks (h(k) + i) % M, preserving cache locality but suffering from primary clustering. Quadratic probing checks (h(k) + i^2) % M, alleviating clustering by jumping quadratically further away on each collision.',
    invariant:
      'Probe Sequence Invariant: Search terminates with success if slot matches key, or terminates with failure upon encountering an EMPTY slot. DELETED slots (tombstones) are skipped during search but reused during insertion.',
    pitfalls: [
      'Removing elements by resetting slots to EMPTY instead of DELETED tombstones, breaking subsequent search probe chains.',
      'Allowing load factor alpha to exceed 0.7 (quadratic probing may fail to find empty slots if table is not prime and alpha > 0.5).',
    ],
  },
  presets: [
    {
      id: 'open-addressing-linear-cluster',
      label: 'Linear Probing Primary Clustering',
      description: 'Multiple keys hash to index 2, showing sequential rightward slot hopping',
      data: {
        tableSize: 7,
        probingMode: 'LINEAR',
        operations: [
          { op: 'INSERT', key: 'Cat', value: 11 },
          { op: 'INSERT', key: 'Dog', value: 22 },
          { op: 'INSERT', key: 'Fox', value: 33 },
          { op: 'INSERT', key: 'Owl', value: 44 },
          { op: 'SEARCH', key: 'Fox' },
        ],
      },
    },
    {
      id: 'open-addressing-tombstone-reuse',
      label: 'Tombstone Delete & Reuse',
      description: 'Deletes an element leaving a tombstone, then inserts a new key reusing the slot',
      data: {
        tableSize: 7,
        probingMode: 'LINEAR',
        operations: [
          { op: 'INSERT', key: 'Red', value: 1 },
          { op: 'INSERT', key: 'Blue', value: 2 },
          { op: 'DELETE', key: 'Red' },
          { op: 'SEARCH', key: 'Blue' },
          { op: 'INSERT', key: 'Green', value: 3 },
        ],
      },
    },
  ],
  defaultInput: {
    tableSize: 7,
    probingMode: 'LINEAR',
    operations: [
      { op: 'INSERT', key: 'Cat', value: 11 },
      { op: 'INSERT', key: 'Dog', value: 22 },
      { op: 'INSERT', key: 'Fox', value: 33 },
      { op: 'INSERT', key: 'Owl', value: 44 },
      { op: 'SEARCH', key: 'Fox' },
    ],
  },
  codeSnippets: {
    cpp: `class OpenHashTable {
    vector<pair<string, int>> table;
    vector<bool> occupied, deleted;
    int M;
public:
    OpenHashTable(int m) : M(m), table(m), occupied(m, false), deleted(m, false) {}

    bool insert(string key, int val) {
        int h = hash(key);
        for (int i = 0; i < M; i++) {
            int slot = (h + i) % M; // Linear: + i, Quadratic: + i*i
            if (!occupied[slot] || deleted[slot]) {
                table[slot] = {key, val};
                occupied[slot] = true; deleted[slot] = false;
                return true;
            }
            if (occupied[slot] && table[slot].first == key) {
                table[slot].second = val; return true;
            }
        }
        return false; // Table full
    }
};`,
    python: `class OpenHashTable:
    def __init__(self, m=7, mode="LINEAR"):
        self.m, self.mode = m, mode
        self.table = [None] * m # None or (key, val) or "DELETED"

    def insert(self, key, val):
        h = self._hash(key)
        first_tombstone = None
        for i in range(self.m):
            step = i if self.mode == "LINEAR" else i * i
            slot = (h + step) % self.m
            entry = self.table[slot]
            if entry == "DELETED" and first_tombstone is None:
                first_tombstone = slot
            elif entry is None:
                target = first_tombstone if first_tombstone is not None else slot
                self.table[target] = (key, val)
                return True
            elif entry[0] == key:
                self.table[slot] = (key, val)
                return True
        return False`,
    typescript: `function insertOpen(table: SlotEntry[], key: string, val: number, M: number, mode: 'LINEAR' | 'QUADRATIC'): boolean {
  const h = hash(key) % M;
  for (let i = 0; i < M; i++) {
    const step = mode === 'LINEAR' ? i : i * i;
    const slot = (h + step) % M;
    if (table[slot] === 'EMPTY' || table[slot] === 'DELETED') {
      table[slot] = { key, value: val };
      return true;
    }
    if (typeof table[slot] === 'object' && table[slot].key === key) {
      table[slot].value = val;
      return true;
    }
  }
  return false;
}`,
    java: `public boolean insert(String key, int val) {
    int h = hash(key);
    for (int i = 0; i < M; i++) {
        int slot = (h + (isLinear ? i : i * i)) % M;
        if (table[slot] == null || table[slot].isDeleted) {
            table[slot] = new Entry(key, val);
            return true;
        }
    }
    return false;
}`,
    pseudocode: `function insert(key, val):
    h = hash(key) mod M
    for i = 0 to M - 1:
        slot = (h + probe(i)) mod M
        if table[slot] is EMPTY or DELETED:
            table[slot] = (key, val)
            return true
    return false // Table full`,
  },
  generateTimeline: (input: {
    operations: { op: 'INSERT' | 'SEARCH' | 'DELETE'; key: string; value?: number }[];
    tableSize: number;
    probingMode: 'LINEAR' | 'QUADRATIC';
  }): ExecutionFrame<HashTableOpenAddressingState>[] => {
    const tableSize = input?.tableSize && input.tableSize > 0 ? input.tableSize : 7;
    const mode = input?.probingMode ?? 'LINEAR';
    const ops = input?.operations?.length
      ? input.operations
      : [
          { op: 'INSERT', key: 'Cat', value: 11 },
          { op: 'INSERT', key: 'Dog', value: 22 },
        ];

    const slots: SlotEntry[] = Array.from({ length: tableSize }, () => 'EMPTY');
    const frames: ExecutionFrame<HashTableOpenAddressingState>[] = [];

    function cloneSlots(): SlotEntry[] {
      return slots.map((s) => (typeof s === 'object' ? { ...s } : s));
    }

    function occupiedCount(): number {
      return slots.filter((s) => typeof s === 'object').length;
    }

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 1,
      action: 'INIT',
      state: {
        slots: cloneSlots(),
        tableSize,
        probingMode: mode,
        activeKey: null,
        activeSlot: null,
        probeStep: 0,
        probeIndices: [],
        loadFactor: 0,
        message: `Initialized Open Addressing table (Size M=${tableSize}, Mode=${mode})`,
      },
      callStack: [{ name: 'initTable', params: { tableSize, mode } }],
      variables: { tableSize, mode, loadFactor: 0 },
      explanation: `Initialized Open Addressing table with ${tableSize} EMPTY slots using ${mode} probing.`,
    });

    for (const op of ops) {
      const baseHash = hashKey(op.key, tableSize);
      const probeList: number[] = [];
      let resolved = false;

      for (let i = 0; i < tableSize; i++) {
        const step = mode === 'LINEAR' ? i : i * i;
        const slotIdx = (baseHash + step) % tableSize;
        probeList.push(slotIdx);

        const currentEntry = slots[slotIdx];

        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 12,
          action: 'PROBE_SLOT',
          state: {
            slots: cloneSlots(),
            tableSize,
            probingMode: mode,
            activeKey: op.key,
            activeSlot: slotIdx,
            probeStep: i,
            probeIndices: [...probeList],
            loadFactor: occupiedCount() / tableSize,
            message: `${op.op} "${op.key}": Probe #${i} at Slot ${slotIdx} (${
              typeof currentEntry === 'object'
                ? `Occupied: "${currentEntry.key}"`
                : currentEntry
            })`,
          },
          callStack: [{ name: op.op.toLowerCase(), params: { key: op.key, slot: slotIdx, step: i } }],
          variables: { key: op.key, probeStep: i, slotIdx, entryState: typeof currentEntry === 'object' ? currentEntry.key : currentEntry },
          explanation: `Probe #${i} checking slot ${slotIdx} (base ${baseHash} + step ${step} mod ${tableSize}). Slot status: ${
            typeof currentEntry === 'object' ? `Occupied by "${currentEntry.key}"` : currentEntry
          }.`,
        });

        if (op.op === 'INSERT') {
          if (currentEntry === 'EMPTY' || currentEntry === 'DELETED') {
            slots[slotIdx] = { key: op.key, value: op.value ?? 1 };
            resolved = true;
            frames.push({
              stepIndex: frames.length,
              totalSteps: frames.length + 1,
              codeLine: 15,
              action: 'INSERT_SUCCESS',
              state: {
                slots: cloneSlots(),
                tableSize,
                probingMode: mode,
                activeKey: op.key,
                activeSlot: slotIdx,
                probeStep: i,
                probeIndices: [...probeList],
                loadFactor: occupiedCount() / tableSize,
                message: `Inserted ("${op.key}", ${op.value ?? 1}) into Slot ${slotIdx}`,
              },
              callStack: [{ name: 'insertSuccess', params: { slot: slotIdx } }],
              variables: { key: op.key, slotIdx, newLoadFactor: occupiedCount() / tableSize },
              explanation: `Slot ${slotIdx} was available. Placed ("${op.key}", ${op.value ?? 1}) successfully.`,
            });
            break;
          } else if (currentEntry.key === op.key) {
            currentEntry.value = op.value ?? 1;
            resolved = true;
            frames.push({
              stepIndex: frames.length,
              totalSteps: frames.length + 1,
              codeLine: 18,
              action: 'UPDATE_SUCCESS',
              state: {
                slots: cloneSlots(),
                tableSize,
                probingMode: mode,
                activeKey: op.key,
                activeSlot: slotIdx,
                probeStep: i,
                probeIndices: [...probeList],
                loadFactor: occupiedCount() / tableSize,
                message: `Updated key "${op.key}" with value ${op.value ?? 1} at Slot ${slotIdx}`,
              },
              callStack: [{ name: 'updateSuccess', params: { slot: slotIdx } }],
              variables: { key: op.key, slotIdx },
              explanation: `Existing key "${op.key}" found at slot ${slotIdx}. Updated value.`,
            });
            break;
          }
        } else if (op.op === 'SEARCH') {
          if (currentEntry === 'EMPTY') {
            resolved = true;
            frames.push({
              stepIndex: frames.length,
              totalSteps: frames.length + 1,
              codeLine: 22,
              action: 'SEARCH_MISS',
              state: {
                slots: cloneSlots(),
                tableSize,
                probingMode: mode,
                activeKey: op.key,
                activeSlot: slotIdx,
                probeStep: i,
                probeIndices: [...probeList],
                loadFactor: occupiedCount() / tableSize,
                message: `Key "${op.key}" NOT found (halted at EMPTY slot ${slotIdx})`,
              },
              callStack: [{ name: 'searchMiss', params: { slot: slotIdx } }],
              variables: { key: op.key, found: false },
              explanation: `Encountered EMPTY slot ${slotIdx}. Search terminates with miss for "${op.key}".`,
            });
            break;
          } else if (typeof currentEntry === 'object' && currentEntry.key === op.key) {
            resolved = true;
            frames.push({
              stepIndex: frames.length,
              totalSteps: frames.length + 1,
              codeLine: 24,
              action: 'SEARCH_HIT',
              state: {
                slots: cloneSlots(),
                tableSize,
                probingMode: mode,
                activeKey: op.key,
                activeSlot: slotIdx,
                probeStep: i,
                probeIndices: [...probeList],
                loadFactor: occupiedCount() / tableSize,
                message: `Search hit! Found "${op.key}" (val=${currentEntry.value}) at Slot ${slotIdx}`,
              },
              callStack: [{ name: 'searchHit', params: { slot: slotIdx, val: currentEntry.value } }],
              variables: { key: op.key, found: true, slot: slotIdx },
              explanation: `Search hit! Key "${op.key}" located at slot ${slotIdx} with value ${currentEntry.value}.`,
            });
            break;
          }
        } else if (op.op === 'DELETE') {
          if (currentEntry === 'EMPTY') {
            resolved = true;
            frames.push({
              stepIndex: frames.length,
              totalSteps: frames.length + 1,
              codeLine: 27,
              action: 'DELETE_MISS',
              state: {
                slots: cloneSlots(),
                tableSize,
                probingMode: mode,
                activeKey: op.key,
                activeSlot: slotIdx,
                probeStep: i,
                probeIndices: [...probeList],
                loadFactor: occupiedCount() / tableSize,
                message: `Delete failed: key "${op.key}" does not exist`,
              },
              callStack: [{ name: 'deleteMiss', params: { slot: slotIdx } }],
              variables: { key: op.key, deleted: false },
              explanation: `Reached EMPTY slot ${slotIdx}. Key "${op.key}" is absent from table.`,
            });
            break;
          } else if (typeof currentEntry === 'object' && currentEntry.key === op.key) {
            slots[slotIdx] = 'DELETED'; // Tombstone
            resolved = true;
            frames.push({
              stepIndex: frames.length,
              totalSteps: frames.length + 1,
              codeLine: 30,
              action: 'TOMBSTONE_CREATED',
              state: {
                slots: cloneSlots(),
                tableSize,
                probingMode: mode,
                activeKey: op.key,
                activeSlot: slotIdx,
                probeStep: i,
                probeIndices: [...probeList],
                loadFactor: occupiedCount() / tableSize,
                message: `Deleted "${op.key}" from Slot ${slotIdx} (marked as DELETED tombstone)`,
              },
              callStack: [{ name: 'tombstone', params: { slot: slotIdx } }],
              variables: { key: op.key, deleted: true, slotIdx },
              explanation: `Deleted "${op.key}" from slot ${slotIdx}. Replaced with DELETED tombstone to protect probe sequence integrity.`,
            });
            break;
          }
        }
      }

      if (!resolved) {
        frames.push({
          stepIndex: frames.length,
          totalSteps: frames.length + 1,
          codeLine: 33,
          action: 'TABLE_FULL_FAIL',
          state: {
            slots: cloneSlots(),
            tableSize,
            probingMode: mode,
            activeKey: op.key,
            activeSlot: null,
            probeStep: tableSize,
            probeIndices: [...probeList],
            loadFactor: occupiedCount() / tableSize,
            message: `Operation failed: table full or probe sequence exhausted for "${op.key}"`,
          },
          callStack: [{ name: 'fail', params: { key: op.key } }],
          variables: { key: op.key, success: false },
          explanation: `Exhausted all ${tableSize} probe steps without finding an available slot or target key.`,
        });
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: frames.length + 1,
      codeLine: 38,
      action: 'COMPLETE',
      state: {
        slots: cloneSlots(),
        tableSize,
        probingMode: mode,
        activeKey: null,
        activeSlot: null,
        probeStep: 0,
        probeIndices: [],
        loadFactor: occupiedCount() / tableSize,
        message: 'Completed Open Addressing demonstration',
      },
      callStack: [{ name: 'complete', params: { occupied: occupiedCount() } }],
      variables: { completed: true, occupied: occupiedCount(), finalLoadFactor: occupiedCount() / tableSize },
      explanation: `Finished all Open Addressing operations. Occupied slots: ${occupiedCount()} / ${tableSize}.`,
    });

    frames.forEach((f) => {
      f.totalSteps = frames.length;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<HashTableOpenAddressingState>) => {
    const { slots, probingMode, activeSlot, probeIndices, loadFactor, message } =
      frame.state;

    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Status:</span>
            <span className="font-mono text-xs text-slate-200">{message}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Mode: <strong className="text-cyan-400">{probingMode}</strong></span>
            <span>Load Factor (&alpha;): <strong className="text-amber-400">{loadFactor.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Slot Array Visualizer */}
        <div className="flex items-center justify-center gap-3 flex-wrap w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 shadow-inner min-h-[220px]">
          {slots.map((slot, idx) => {
            const isActive = idx === activeSlot;
            const isProbed = probeIndices.includes(idx);
            const isTombstone = slot === 'DELETED';

            let border = 'border-slate-800';
            let bg = 'bg-slate-900';
            if (isActive) {
              border = 'border-amber-400 scale-105 shadow-lg';
              bg = 'bg-amber-500/20';
            } else if (isProbed) {
              border = 'border-cyan-500/60';
              bg = 'bg-cyan-950/30';
            } else if (isTombstone) {
              border = 'border-rose-800/60';
              bg = 'bg-rose-950/20';
            }

            return (
              <div
                key={`slot-${idx}`}
                className={`flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all duration-300 font-mono ${border} ${bg}`}
              >
                <span className="text-[11px] text-slate-500 font-bold">Slot [{idx}]</span>
                <div className="my-auto flex flex-col items-center">
                  {typeof slot === 'object' ? (
                    <>
                      <span className="text-sm font-bold text-slate-100">{slot.key}</span>
                      <span className="text-[10px] text-slate-400">v:{slot.value}</span>
                    </>
                  ) : isTombstone ? (
                    <span className="text-xs font-bold text-rose-400">TOMBSTONE</span>
                  ) : (
                    <span className="text-xs text-slate-600 italic">EMPTY</span>
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
