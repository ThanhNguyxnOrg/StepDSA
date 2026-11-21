import { motion } from 'motion/react';
import { AlgorithmModule, ExecutionFrame } from '../../core/types';

export interface BloomOperation {
  op: 'insert' | 'query';
  item: string;
}

export interface BloomInput {
  size: number;
  operations: BloomOperation[];
}

export interface BloomState {
  bits: number[];
  insertedItems: string[];
  activeOp: BloomOperation | null;
  activeHashes: { name: string; idx: number; bitVal: number }[];
  verdict: 'none' | 'inserted' | 'definitely-absent' | 'probably-present' | 'false-positive';
}

const DEFAULT_BLOOM: BloomInput = {
  size: 16,
  operations: [
    { op: 'insert', item: 'redis' },
    { op: 'insert', item: 'kafka' },
    { op: 'insert', item: 'nginx' },
    { op: 'query', item: 'kafka' },
    { op: 'query', item: 'spark' },
    { op: 'query', item: 'envoy' },
  ],
};

function computeBloomHashes(item: string, m: number): [number, number, number] {
  let h1 = 5381;
  let h2 = 0;
  let h3 = 2166136261;
  for (let i = 0; i < item.length; i++) {
    const c = item.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) >>> 0;
    h2 = (h2 * 31 + c + i * 7) >>> 0;
    h3 = ((h3 ^ c) * 16777619) >>> 0;
  }
  return [h1 % m, h2 % m, h3 % m];
}

export const bloomFilterModule: AlgorithmModule<BloomInput, BloomState> = {
  id: 'bloom-filter',
  title: 'Bloom Filter (Probabilistic Set)',
  category: 'arrays-pointers',
  difficulty: 'Intermediate',
  defaultInput: DEFAULT_BLOOM,
  presets: [
    {
      id: 'bloom-16bit',
      label: 'Standard Insert & Query (16-bit)',
      description: '16-bit vector with k=3 hash functions showing hits and guaranteed-absent queries.',
      data: DEFAULT_BLOOM,
    },
    {
      id: 'bloom-8bit-fp',
      label: 'High Collision Demo (8-bit)',
      description: 'Tight 8-bit array demonstrating how bit saturation triggers a False Positive.',
      data: {
        size: 8,
        operations: [
          { op: 'insert', item: 'cat' },
          { op: 'insert', item: 'dog' },
          { op: 'insert', item: 'fox' },
          { op: 'query', item: 'cat' },
          { op: 'query', item: 'owl' },
          { op: 'query', item: 'bat' },
        ],
      },
    },
  ],
  complexity: {
    timeBest: 'O(k)',
    timeAverage: 'O(k)',
    timeWorst: 'O(k)',
    spaceAuxiliary: 'O(m bits)',
    worstCaseCondition: 'Insert and query always evaluate exactly k hash functions in O(k) = O(1) time.',
  },
  theory: {
    overview:
      'A Bloom Filter represents a set using only a compact m-bit array and k independent hash functions instead of storing raw keys. Inserting sets k bit positions to 1; querying returns FALSE (100% absent) if any probed bit is 0, or TRUE (probably present) if all k bits are 1.',
    whyItWorks:
      'Zero False Negatives are mathematically guaranteed because bits are monotonically flipped 0 → 1 and never cleared.',
    invariant:
      'If any bit[hᵢ(x)] == 0, x was never inserted (0% false negative rate); all 1s means present or a bounded False Positive.',
    pitfalls: [
      'Standard Bloom filters cannot delete items (clearing a bit could break other overlapping keys — use a Counting Bloom Filter for deletes).',
      'Choosing too few bits m for the expected item count saturates the bit vector and spikes false positives.',
    ],
  },
  relatedModules: [
    { id: 'hash-table-chaining', label: 'Hash Table (Chaining)' },
    { id: 'hash-table-open-addressing', label: 'Open Addressing Hash Table' },
  ],
  codeSnippets: {
    pseudocode: `function insert(item):
  for i = 1 to k:
    idx = hash_i(item) % m
    bits[idx] = 1

function mightContain(item):
  for i = 1 to k:
    idx = hash_i(item) % m
    if bits[idx] == 0:
      return FALSE   // 100% Definitely Absent
  return TRUE        // Probably Present (may be FP)`,
    python: `class BloomFilter:
    def __init__(self, m: int):
        self.bits = [0] * m

    def insert(self, item: str) -> None:
        for idx in hashes(item, len(self.bits)):
            self.bits[idx] = 1

    def might_contain(self, item: str) -> bool:
        for idx in hashes(item, len(self.bits)):
            if self.bits[idx] == 0:
                return False  # Definitely absent
        return True           # Probably present`,
    typescript: `class BloomFilter {
  private bits: Uint8Array;
  constructor(private m: number) { this.bits = new Uint8Array(m); }

  insert(item: string): void {
    for (const idx of hashes(item, this.m)) {
      this.bits[idx] = 1;
    }
  }

  mightContain(item: string): boolean {
    for (const idx of hashes(item, this.m)) {
      if (this.bits[idx] === 0) return false;
    }
    return true;
  }
}`,
    cpp: `class BloomFilter {
    vector<bool> bits;
public:
    BloomFilter(int m) : bits(m, false) {}
    void insert(const string& item) {
        for (int idx : hashes(item, bits.size())) bits[idx] = true;
    }
    bool mightContain(const string& item) const {
        for (int idx : hashes(item, bits.size()))
            if (!bits[idx]) return false;
        return true;
    }
};`,
    java: `class BloomFilter {
    private final BitSet bits;
    private final int m;
    BloomFilter(int m) { this.m = m; this.bits = new BitSet(m); }

    void insert(String item) {
        for (int idx : hashes(item, m)) bits.set(idx);
    }

    boolean mightContain(String item) {
        for (int idx : hashes(item, m))
            if (!bits.get(idx)) return false;
        return true;
    }
}`,
  },
  generateTimeline: (input: BloomInput): ExecutionFrame<BloomState>[] => {
    const m = Math.max(8, Math.min(20, Number(input?.size) || 16));
    const ops = Array.isArray(input?.operations) && input.operations.length > 0
      ? input.operations
      : DEFAULT_BLOOM.operations;

    const bits = new Array<number>(m).fill(0);
    const trueSet = new Set<string>();
    const frames: ExecutionFrame<BloomState>[] = [];
    let checkpointAdded = false;

    const push = (
      codeLine: number,
      explanation: string,
      opts: {
        action?: string;
        activeOp?: BloomOperation | null;
        activeHashes?: { name: string; idx: number; bitVal: number }[];
        verdict?: BloomState['verdict'];
        soundCue?: ExecutionFrame['soundCue'];
        isMilestone?: boolean;
        milestoneTitle?: string;
        conditionEval?: ExecutionFrame['conditionEval'];
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
      } = {}
    ) => {
      const ones = bits.reduce((a, b) => a + b, 0);
      frames.push({
        stepIndex: frames.length,
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
          label: `m=${m} bits · ${ones}/${m} set (${Math.round((ones / m) * 100)}% fill)`,
          isValid: true,
        },
        callStack: [
          {
            name: opts.activeOp ? `${opts.activeOp.op}("${opts.activeOp.item}")` : 'BloomFilter(m)',
            params: { m, k: 3, setBits: ones },
            line: codeLine,
            isCurrent: true,
          },
        ],
        variables: { m, k: 3, setBits: ones, insertedCount: trueSet.size },
        state: {
          bits: [...bits],
          insertedItems: Array.from(trueSet),
          activeOp: opts.activeOp ?? null,
          activeHashes: opts.activeHashes ?? [],
          verdict: opts.verdict ?? 'none',
        },
      });
    };

    push(1, `Initialized empty ${m}-bit Bloom Filter with k = 3 hash functions (h₁, h₂, h₃). All bits start at 0.`, {
      action: 'init',
      soundCue: 'start',
      isMilestone: true,
      milestoneTitle: `Init ${m}-bit Filter`,
      pedagogy: {
        what: `Allocated an all-zero ${m}-bit array using just ${Math.ceil(m / 8)} byte(s) of memory.`,
        why: 'Storing bits instead of full strings saves 90%+ memory at the cost of a small false-positive probability.',
        whatNext: `Insert "${ops[0].item}" by setting its k=3 hashed bit slots to 1.`,
      },
    });

    ops.forEach((op, opIdx) => {
      const [i1, i2, i3] = computeBloomHashes(op.item, m);
      const idxs = [i1, i2, i3];

      if (op.op === 'insert') {
        idxs.forEach((i) => {
          bits[i] = 1;
        });
        trueSet.add(op.item);
        const activeHashes = [
          { name: 'h₁', idx: i1, bitVal: 1 },
          { name: 'h₂', idx: i2, bitVal: 1 },
          { name: 'h₃', idx: i3, bitVal: 1 },
        ];
        push(
          4,
          `INSERT "${op.item}" → h₁=${i1}, h₂=${i2}, h₃=${i3}. Flipped bits[${i1}], bits[${i2}], bits[${i3}] to 1.`,
          {
            action: 'insert',
            activeOp: op,
            activeHashes,
            verdict: 'inserted',
            soundCue: 'insert',
            isMilestone: opIdx === 0,
            milestoneTitle: `Insert "${op.item}"`,
            pedagogy: {
              what: `Hashed "${op.item}" into bit indices [${i1}, ${i2}, ${i3}] and set each bit to 1.`,
              why: 'Setting all k=3 independent positions creates a compact fingerprint for this item.',
              whatNext:
                opIdx < ops.length - 1
                  ? `Next operation: ${ops[opIdx + 1].op}("${ops[opIdx + 1].item}").`
                  : 'All operations complete.',
            },
          }
        );
      } else {
        const activeHashes = [
          { name: 'h₁', idx: i1, bitVal: bits[i1] },
          { name: 'h₂', idx: i2, bitVal: bits[i2] },
          { name: 'h₃', idx: i3, bitVal: bits[i3] },
        ];
        const allOnes = bits[i1] === 1 && bits[i2] === 1 && bits[i3] === 1;
        const actuallyPresent = trueSet.has(op.item);

        if (!allOnes) {
          const zeroBit = activeHashes.find((h) => h.bitVal === 0)!;
          const cp = !checkpointAdded
            ? {
                id: 'bloom-zero-bit-guarantee',
                question: `Querying "${op.item}" hits bits[${zeroBit.idx}] == 0. Could "${op.item}" still have been inserted earlier?`,
                options: [
                  'No — 100% Definitely Absent (0% False Negatives)',
                  'Maybe — it could be a False Negative',
                  'Yes — if another key cleared that bit',
                ],
                correctIndex: 0,
                explanation: `Since Bloom Filter bits are never reset to 0, a 0 at index ${zeroBit.idx} mathematically proves "${op.item}" was never inserted!`,
              }
            : undefined;
          if (cp) checkpointAdded = true;

          push(
            10,
            `QUERY "${op.item}" → h₁=${i1}(${bits[i1]}), h₂=${i2}(${bits[i2]}), h₃=${i3}(${bits[i3]}). Bit [${zeroBit.idx}] is 0 → 100% DEFINITELY ABSENT!`,
            {
              action: 'compare',
              activeOp: op,
              activeHashes,
              verdict: 'definitely-absent',
              soundCue: 'discard',
              isMilestone: true,
              milestoneTitle: `Absent: "${op.item}"`,
              conditionEval: { expr: `bits[${zeroBit.idx}] == 0`, result: true },
              checkpoint: cp,
              pedagogy: {
                what: `Found a 0 bit at index ${zeroBit.idx} while probing "${op.item}".`,
                why: 'Because inserts only turn 0 → 1, seeing even a single 0 guarantees the item is NOT in the set — avoiding an expensive disk lookup!',
                whatNext: opIdx < ops.length - 1 ? `Run next query/insert.` : 'Bloom Filter demo complete.',
              },
            }
          );
        } else if (actuallyPresent) {
          push(
            11,
            `QUERY "${op.item}" → all 3 bits [${i1}, ${i2}, ${i3}] are 1 → PROBABLY PRESENT (True Positive!).`,
            {
              action: 'found',
              activeOp: op,
              activeHashes,
              verdict: 'probably-present',
              soundCue: 'success',
              isMilestone: true,
              milestoneTitle: `Match: "${op.item}"`,
              conditionEval: { expr: `all k=3 bits == 1`, result: true },
              pedagogy: {
                what: `All 3 probed bit slots [${i1}, ${i2}, ${i3}] equal 1.`,
                why: 'The filter reports "Probably Present", allowing the system to proceed to verify against the backing store.',
                whatNext: opIdx < ops.length - 1 ? `Proceed to next operation.` : 'Demo complete.',
              },
            }
          );
        } else {
          push(
            11,
            `QUERY "${op.item}" → all 3 bits [${i1}, ${i2}, ${i3}] are 1, yet "${op.item}" was NEVER inserted → FALSE POSITIVE due to bit collision!`,
            {
              action: 'swap',
              activeOp: op,
              activeHashes,
              verdict: 'false-positive',
              soundCue: 'fail',
              isMilestone: true,
              milestoneTitle: `False Positive: "${op.item}"`,
              conditionEval: { expr: `all k=3 bits == 1 (collision!)`, result: true },
              pedagogy: {
                what: `Bit slots [${i1}, ${i2}, ${i3}] were already set to 1 by other keys, tricking the filter into returning TRUE for unseen "${op.item}".`,
                why: 'This is the fundamental tradeoff of Bloom Filters: tiny memory footprint + 0% false negatives, in exchange for occasional false positives as the bit array fills up.',
                whatNext: 'Try switching between the 16-bit and 8-bit presets to see how fill ratio impacts false positive rate!',
              },
            }
          );
        }
      }
    });

    const total = frames.length;
    frames.forEach((f, i) => {
      f.stepIndex = i;
      f.totalSteps = total;
    });
    return frames;
  },
  renderStage: (frame: ExecutionFrame<BloomState>) => {
    const { bits, insertedItems, activeOp, activeHashes, verdict } = frame.state;
    const activeIndexMap = new Map<number, string[]>();
    for (const h of activeHashes) {
      const existing = activeIndexMap.get(h.idx) || [];
      existing.push(h.name);
      activeIndexMap.set(h.idx, existing);
    }

    const verdictBadge =
      verdict === 'inserted'
        ? { label: 'BITS FLIPPED → 1', bg: 'var(--sem-active-bg)', border: 'var(--sem-active-border)', text: 'var(--sem-active-text)' }
        : verdict === 'definitely-absent'
        ? { label: '100% DEFINITELY ABSENT (0 HIT)', bg: 'var(--sem-sorted-bg)', border: 'var(--sem-sorted-border)', text: 'var(--sem-sorted-text)' }
        : verdict === 'probably-present'
        ? { label: 'PROBABLY PRESENT (TRUE POSITIVE)', bg: 'var(--sem-sorted-bg)', border: 'var(--sem-sorted-border)', text: 'var(--sem-sorted-text)' }
        : verdict === 'false-positive'
        ? { label: 'FALSE POSITIVE (BIT COLLISION!)', bg: 'var(--sem-swapping-bg)', border: 'var(--sem-swapping-border)', text: 'var(--sem-swapping-text)' }
        : null;

    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 select-none">
        {/* Operation & Hash Beam Card */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-4 shadow-sm flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded theme-accent-soft font-bold uppercase">
                {activeOp ? `${activeOp.op}("${activeOp.item}")` : 'IDLE'}
              </span>
              {verdictBadge && (
                <span
                  style={{
                    backgroundColor: verdictBadge.bg,
                    borderColor: verdictBadge.border,
                    color: verdictBadge.text,
                  }}
                  className="px-2.5 py-0.5 rounded border font-bold text-[11px]"
                >
                  {verdictBadge.label}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              True Set: {'{'} {insertedItems.join(', ') || '∅'} {'}'}
            </span>
          </div>

          {activeHashes.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 font-mono text-xs">
              {activeHashes.map((h) => (
                <div
                  key={h.name}
                  style={
                    h.bitVal === 0
                      ? { backgroundColor: 'var(--sem-swapping-bg)', borderColor: 'var(--sem-swapping-border)', color: 'var(--sem-swapping-text)' }
                      : { backgroundColor: 'var(--sem-active-bg)', borderColor: 'var(--sem-active-border)', color: 'var(--sem-active-text)' }
                  }
                  className="px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5"
                >
                  <span>{h.name}("{activeOp?.item}")</span>
                  <span>→</span>
                  <span>bit[{h.idx}] = {h.bitVal}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* m-Bit Array Grid */}
        <div className="rounded-xl bg-[#111827] border border-[#1F293D] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-[11px] font-mono">
            <span className="font-bold text-cyan-400 uppercase tracking-wider">
              {bits.length}-Bit Vector Array
            </span>
            <span className="text-slate-400">
              {bits.filter((b) => b === 1).length} / {bits.length} bits set to 1
            </span>
          </div>

          <div className="grid grid-cols-8 gap-2">
            {bits.map((bit, idx) => {
              const probes = activeIndexMap.get(idx);
              const isProbed = Boolean(probes && probes.length > 0);
              const style = isProbed
                ? bit === 0
                  ? { backgroundColor: 'var(--sem-swapping-bg)', borderColor: 'var(--sem-swapping-border)', color: 'var(--sem-swapping-text)' }
                  : { backgroundColor: 'var(--sem-comparing-bg)', borderColor: 'var(--sem-comparing-border)', color: 'var(--sem-comparing-text)' }
                : bit === 1
                ? { backgroundColor: 'var(--sem-active-bg)', borderColor: 'var(--sem-active-border)', color: 'var(--sem-active-text)' }
                : { backgroundColor: 'var(--sem-default-cell-bg)', borderColor: 'var(--sem-default-border)', color: 'var(--sem-default-text)' };

              return (
                <motion.div
                  key={idx}
                  animate={{ scale: isProbed ? 1.07 : 1 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                  style={style}
                  className="rounded-lg border-2 py-2 px-1 flex flex-col items-center justify-center font-mono relative"
                >
                  <span className="text-[9px] opacity-65">[{idx}]</span>
                  <span className="text-base font-extrabold leading-tight">{bit}</span>
                  <span className="text-[8.5px] font-bold h-3.5 text-center truncate max-w-full">
                    {probes ? probes.join(',') : ''}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
