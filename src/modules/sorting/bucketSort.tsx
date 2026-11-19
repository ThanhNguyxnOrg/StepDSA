import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import {
  BucketSortPhase,
  BucketSortStage,
  BucketSortStageState,
  BucketSortView,
} from '../../components/stage/BucketSortStage';

interface BucketSortState extends BucketSortStageState {
  bucketView: BucketSortView;
}

const MAX_LEN = 12;
const MAX_ABS = 999;
const DEFAULT_ARRAY = [29, 25, 3, 49, 9, 37, 21, 43];

interface NormalisedInput {
  array: number[];
  notes: string[];
}

function normalise(input: number[] | undefined): NormalisedInput {
  const notes: string[] = [];

  if (!Array.isArray(input)) {
    notes.push('input was not an array, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }

  const usable = input.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  // An explicitly empty array is a valid run (nothing to sort), not an error.
  if (input.length > 0 && usable.length === 0) {
    notes.push('no usable numbers in the input, so the default array is used');
    return { array: [...DEFAULT_ARRAY], notes };
  }
  if (usable.length < input.length) {
    notes.push(`${input.length - usable.length} non-numeric value(s) dropped`);
  }

  const clamped = usable.map((value) => {
    const rounded = Math.max(-MAX_ABS, Math.min(MAX_ABS, Math.round(value)));
    if (rounded !== Math.round(value)) {
      notes.push(`value ${Math.round(value)} clamped to ${rounded} (±${MAX_ABS})`);
    }
    return rounded;
  });

  let array = clamped;
  if (array.length > MAX_LEN) {
    notes.push(`${array.length} values truncated to ${MAX_LEN} for a readable strip`);
    array = array.slice(0, MAX_LEN);
  }

  return { array, notes };
}

function isSorted(input: number[]): boolean {
  for (let i = 1; i < input.length; i++) {
    if (input[i] < input[i - 1]) return false;
  }
  return true;
}

export const bucketSortModule: AlgorithmModule<number[], BucketSortState> = {
  id: 'bucket-sort',
  title: 'Bucket Sort (Scatter-Gather Distribution)',
  category: 'sorting',
  difficulty: 'Intermediate',
  complexity: {
    timeBest: 'O(N + K)',
    timeAverage: 'O(N + K)',
    timeWorst: 'O(N²)',
    spaceAuxiliary: 'O(N + K)',
    worstCaseCondition: 'All elements hash into the same single bucket',
  },
  theory: {
    overview:
      'Bucket Sort distributes the elements of an array into several buckets. Each bucket is then sorted individually, either using a different sorting algorithm or recursively applying the bucket algorithm, and finally concatenated.',
    whyItWorks:
      'When input is uniformly distributed over a range, each bucket receives approximately N/K elements on average. Sorting each bucket takes O((N/K)²) time, so K * O((N/K)²) = O(N²/K). When K ≈ N, the total expected time is O(N).',
    invariant:
      'Distribution Invariant: Any element in bucket i is strictly less than or equal to all elements in bucket i + 1.',
    pitfalls: [
      'Skewed data distribution causes all elements to cluster in a single bucket, degrading to O(N²).',
      'Requires knowledge of minimum and maximum bounds to determine proper bucket ranges.',
    ],
  },
  presets: [
    {
      id: 'uniform',
      label: 'Uniformly Distributed',
      description: 'Even distribution across 5 buckets',
      data: [29, 25, 3, 49, 9, 37, 21, 43],
    },
    {
      id: 'clustered',
      label: 'Clustered Dataset',
      description: 'Values clustered closely together',
      data: [12, 14, 15, 12, 13, 28, 45, 11],
    },
    {
      id: 'descending',
      label: 'Descending Array',
      description: 'High to low distribution',
      data: [50, 42, 38, 30, 25, 18, 12, 5],
    },
  ],
  defaultInput: [29, 25, 3, 49, 9, 37, 21, 43],
  codeSnippets: {
    pseudocode: `function bucketSort(arr, numBuckets):
    if length(arr) == 0: return arr
    minVal = min(arr)
    maxVal = max(arr)
    bucketRange = floor((maxVal - minVal) / numBuckets) + 1
    create numBuckets empty buckets B[0..numBuckets-1]
    for each x in arr:
        idx = min((x - minVal) / bucketRange, numBuckets - 1)
        append x into B[idx]
    output = []
    for each bucket in B:
        sort bucket internally
        append bucket to output
    return output`,
    python: `def bucket_sort(arr, num_buckets=5):
    if len(arr) == 0: return arr
    min_val = min(arr)
    max_val = max(arr)
    bucket_range = max(1, (max_val - min_val) // num_buckets + 1)
    buckets = [[] for _ in range(num_buckets)]
    for num in arr:
        idx = min((num - min_val) // bucket_range, num_buckets - 1)
        buckets[idx].append(num)
    output = []
    for bucket in buckets:
        bucket.sort()
        output.extend(bucket)
    return output`,
    typescript: `function bucketSort(arr: number[], numBuckets: number = 5): number[] {
  if (arr.length === 0) return arr;
  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const bucketRange = Math.max(1, Math.floor((maxVal - minVal) / numBuckets) + 1);
  const buckets: number[][] = Array.from({ length: numBuckets }, () => []);
  for (const num of arr) {
    const idx = Math.min(Math.floor((num - minVal) / bucketRange), numBuckets - 1);
    buckets[idx].push(num); }
  const result: number[] = [];
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b);
    result.push(...bucket); }
  return result; }`,
    cpp: `vector<int> bucketSort(vector<int>& arr, int numBuckets = 5) {
    if (arr.empty()) return arr;
    int minVal = *min_element(arr.begin(), arr.end());
    int maxVal = *max_element(arr.begin(), arr.end());
    int bucketRange = max(1, (maxVal - minVal) / numBuckets + 1);
    vector<vector<int>> buckets(numBuckets);
    for (int num : arr) {
        int idx = min((num - minVal) / bucketRange, numBuckets - 1);
        buckets[idx].push_back(num); }
    vector<int> result;
    for (auto& bucket : buckets) {
        sort(bucket.begin(), bucket.end());
        result.insert(result.end(), bucket.begin(), bucket.end()); }
    return result; }`,
    java: `int[] bucketSort(int[] arr, int numBuckets) {
    if (arr.length == 0) return arr;
    int minVal = Arrays.stream(arr).min().getAsInt();
    int maxVal = Arrays.stream(arr).max().getAsInt();
    int bucketRange = Math.max(1, (maxVal - minVal) / numBuckets + 1);
    List<List<Integer>> buckets = new ArrayList<>(); for (int i = 0; i < numBuckets; i++) buckets.add(new ArrayList<>());
    for (int num : arr) {
        int idx = Math.min((num - minVal) / bucketRange, numBuckets - 1);
        buckets.get(idx).add(num); }
    int[] result = new int[arr.length]; int k = 0;
    for (List<Integer> bucket : buckets) {
        Collections.sort(bucket);
        for (int v : bucket) result[k++] = v; }
    return result; }`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<BucketSortState>[] => {
    const { array, notes } = normalise(input);
    const n = array.length;
    const numBuckets = 5;
    const frames: ExecutionFrame<BucketSortState>[] = [];

    const arr = [...array];
    const buckets: number[][] = Array.from({ length: numBuckets }, () => []);
    let writeIdx = 0;
    let phase: BucketSortPhase = 'scatter';
    let activeBucket: number | null = null;
    const stats = { scattered: 0, internalSwaps: 0, gathered: 0 };

    let scatterCheckpointAdded = false;
    let gatherCheckpointAdded = false;
    let halfMilestoneUsed = false;

    const minVal = n > 0 ? Math.min(...arr) : 0;
    const maxVal = n > 0 ? Math.max(...arr) : 0;
    const bucketRange = Math.max(1, Math.floor((maxVal - minVal) / numBuckets) + 1);

    const formatBucketsSummary = () =>
      buckets.map((b, idx) => `B${idx}:[${b.join(',')}]`).join(' ');

    const bucketViewSnapshot = (statusLabel: string): BucketSortView => ({
      buckets: buckets.map((b) => [...b]),
      numBuckets,
      bucketRange,
      minVal,
      activeBucket,
      writeIdx,
      phase,
      statusLabel,
    });

    const pushFrame = (opts: {
      codeLine: number;
      action: string;
      explanation: string;
      statusLabel: string;
      milestone?: string;
      soundCue?: ExecutionFrame['soundCue'];
      variables?: Record<string, any>;
      conditionEval?: { expr?: string; condition?: string; result: boolean | number };
      callStack?: any[];
      pedagogy?: ExecutionFrame['pedagogy'];
      checkpoint?: ExecutionFrame['checkpoint'];
      statuses?: Record<number, 'active' | 'sorted' | 'comparing' | 'swapping'>;
      pointers?: Record<string, number>;
    }) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: frames.length + 1,
        codeLine: opts.codeLine,
        action: opts.action,
        explanation: opts.explanation,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? 'step',
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        metrics: {
          comparisons: stats.internalSwaps,
          swaps: stats.scattered + stats.gathered,
          accesses: stats.scattered * 2 + stats.internalSwaps * 4 + stats.gathered * 2,
          lookups: 0,
        },
        callStack: opts.callStack ?? [
          { name: 'bucketSort', params: { n, numBuckets }, line: opts.codeLine, isCurrent: true },
        ],
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
        invariantStatus: {
          label:
            phase === 'done'
              ? 'the whole array is sorted'
              : phase === 'gather'
                ? 'buckets are drained in ascending index order into the write cursor'
                : 'bucket i only ever holds values from its own contiguous range slice',
          isValid: true,
        },
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: opts.statuses?.[idx] ?? (idx < writeIdx && phase !== 'scatter' ? 'sorted' : 'default'),
          })),
          pointers: opts.pointers ?? (activeBucket !== null ? { bucket: activeBucket } : {}),
          bucketView: bucketViewSnapshot(opts.statusLabel),
        },
      });
    };

    const maybeHalfMilestone = (): string | undefined => {
      if (!halfMilestoneUsed && writeIdx >= Math.ceil(n / 2)) {
        halfMilestoneUsed = true;
        return 'Half the Array Gathered';
      }
      return undefined;
    };

    // ── Frame 0: initialisation ─────────────────────────────────────────────
    if (n > 0) {
      pushFrame({
        codeLine: 5,
        action: 'INIT',
        explanation:
          `${numBuckets} buckets are cut over [${minVal}..${maxVal}]: bucket width = floor((${maxVal} - ${minVal}) / ${numBuckets}) + 1 = ${bucketRange}.` +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        statusLabel: `INIT: ${numBuckets} buckets over [${minVal}..${maxVal}]`,
        soundCue: 'start',
        variables: { n, numBuckets, minVal, maxVal, bucketRange },
        conditionEval: { expr: 'length(arr) == 0', condition: `${n} == 0`, result: false },
        pedagogy: {
          what: `Value range [${minVal}..${maxVal}] is split into ${numBuckets} buckets of width ${bucketRange}.`,
          why: 'Range partitioning means bucket i only ever holds values in one contiguous slice, so buckets never interleave.',
          whatNext: `Scatter: every value is routed to bucket (value − ${minVal}) ÷ ${bucketRange}.`,
        },
      });

      // Scatter phase
      phase = 'scatter';
      for (let i = 0; i < n; ++i) {
        const val = arr[i];
        const bIdx = Math.min(Math.floor((val - minVal) / bucketRange), numBuckets - 1);
        const bucketBefore = buckets[bIdx].length;
        buckets[bIdx].push(val);
        activeBucket = bIdx;
        stats.scattered += 1;

        pushFrame({
          codeLine: 9,
          action: 'SCATTER',
          explanation: `Scatter: arr[${i}] = ${val} lands in B${bIdx} (range [${bIdx * bucketRange + minVal}..${(bIdx + 1) * bucketRange + minVal - 1}], now ${bucketBefore + 1} value(s)).`,
          statusLabel: `SCATTER ${val} → B${bIdx}`,
          soundCue: 'step',
          variables: {
            i,
            val,
            bIdx,
            [`Bucket_${bIdx}`]: [...buckets[bIdx]],
            bucketsOverview: formatBucketsSummary(),
          },
          conditionEval: {
            expr: 'idx = min((num - minVal) / bucketRange, numBuckets - 1)',
            condition: `floor((${val} - ${minVal}) / ${bucketRange}) = ${bIdx}`,
            result: bIdx,
          },
          statuses: { [i]: 'active' },
          pointers: { i, bucket: bIdx },
          callStack: [{ name: 'scatterElement', params: { i, val, bucket: bIdx }, line: 9, isCurrent: true }],
          pedagogy: {
            what: `${val} lands in bucket B${bIdx}, whose range is [${bIdx * bucketRange + minVal}..${(bIdx + 1) * bucketRange + minVal - 1}] (bucket now holds ${bucketBefore + 1} value(s)).`,
            why: 'The routing formula uses only arithmetic — no comparisons — which is why scattering is a single linear pass.',
            whatNext:
              i < n - 1
                ? `Route the next value arr[${i + 1}].`
                : 'All values are bucketed — sort each bucket internally.',
          },
        });
      }

      // Scatter complete + invariant checkpoint
      phase = 'sort';
      activeBucket = null;
      const b0 = buckets[0] || [];
      const b1Lo = minVal + bucketRange;
      pushFrame({
        codeLine: 10,
        action: 'SCATTER_COMPLETE',
        explanation: `All ${n} elements scattered (${formatBucketsSummary()}). Beginning per-bucket sort and ascending gather.`,
        statusLabel: `SCATTERED: ${n} values distributed`,
        milestone: 'Scatter Phase Complete',
        variables: { totalScattered: n, bucketsCount: numBuckets, bucketsOverview: formatBucketsSummary() },
        conditionEval: { expr: 'allScattered == true', condition: `${n} scattered`, result: true },
        callStack: [
          { name: 'bucketSort', params: { phase: 'scatterComplete' }, line: 10, isCurrent: true },
        ],
        pedagogy: {
          what: 'Every value sits in the bucket that owns its range.',
          why: 'Because the bucket ranges partition [min..max], gathering buckets in index order will already order values between buckets — only the inside of each bucket remains unordered.',
          whatNext: `Sort each bucket internally (insertion sort here), then gather B0 → B${numBuckets - 1}.`,
        },
        checkpoint: !scatterCheckpointAdded
          ? {
              id: 'bucket-sort-range-invariant',
              question: `B0 owns range [${minVal}..${minVal + bucketRange - 1}] and holds [${b0.join(', ')}]; B1 starts at ${b1Lo}. Can any value in B1 be smaller than a value in B0?`,
              options: ['No — bucket ranges never overlap', 'Yes — values can land anywhere'],
              correctIndex: 0,
              explanation:
                'Routing is by value range, so every B1 value is ≥ every B0 value: ascending bucket order is globally sorted; only per-bucket internals need work.',
              hint: 'Do the bucket ranges share any values?',
            }
          : undefined,
      });
      scatterCheckpointAdded = true;

      // Sort each bucket internally (insertion sort) and gather in ascending order
      for (let b = 0; b < numBuckets; ++b) {
        const currentBucket = buckets[b];
        activeBucket = b;

        if (currentBucket.length > 1) {
          for (let bi = 1; bi < currentBucket.length; bi++) {
            let bj = bi;
            while (bj > 0 && currentBucket[bj] < currentBucket[bj - 1]) {
              const tmp = currentBucket[bj];
              const other = currentBucket[bj - 1];
              currentBucket[bj] = other;
              currentBucket[bj - 1] = tmp;
              stats.internalSwaps += 1;

              pushFrame({
                codeLine: 12,
                action: 'INTERNAL_SWAP',
                explanation: `Sort B${b}: ${tmp} ⇄ ${other} inside the bucket → [${currentBucket.join(', ')}].`,
                statusLabel: `SORT B${b}: ${tmp} ⇄ ${other}`,
                soundCue: 'compare',
                variables: {
                  bucketIndex: b,
                  [`Bucket_${b}`]: [...currentBucket],
                  bucketsOverview: formatBucketsSummary(),
                },
                conditionEval: {
                  expr: `B${b}[${bj}] < B${b}[${bj - 1}]`,
                  condition: `${tmp} < ${other}`,
                  result: true,
                },
                callStack: [{ name: `sortBucket(b=${b})`, params: { bucket: b }, line: 12, isCurrent: true }],
                pedagogy: {
                  what: `${tmp} and ${other} trade places inside B${b}.`,
                  why: 'Internal bucket order is the only thing left to fix: insertion sort is fine for the small bucket sizes.',
                  whatNext: `Continue inserting inside B${b}.`,
                },
              });
              bj--;
            }
          }
        }

        if (currentBucket.length > 0) {
          pushFrame({
            codeLine: 12,
            action: 'BUCKET_SORTED',
            explanation:
              currentBucket.length > 1
                ? `Bucket B${b} is now internally sorted: [${currentBucket.join(', ')}].`
                : `Bucket B${b} holds one value (${currentBucket[0]}) — already sorted by definition.`,
            statusLabel: `B${b} SORTED: [${currentBucket.join(', ')}]`,
            soundCue: 'sorted',
            variables: {
              bucketIndex: b,
              [`Bucket_${b}`]: [...currentBucket],
              bucketsOverview: formatBucketsSummary(),
            },
            conditionEval: { expr: 'isSorted(B)', condition: currentBucket.join(', '), result: true },
            callStack: [{ name: `sortBucket(b=${b})`, params: { bucket: b }, line: 12, isCurrent: true }],
            pedagogy: {
              what: `B${b} is sorted internally: [${currentBucket.join(', ')}].`,
              why: 'Values between buckets are already ordered by range, so a fully sorted, ascending bucket list is globally sorted after gathering.',
              whatNext:
                b < numBuckets - 1
                  ? `Sort B${b + 1} next.`
                  : 'All buckets sorted — gather them into the array.',
            },
          });
        }
      }

      // Gather phase: drain buckets in ascending order into the array
      phase = 'gather';
      for (let b = 0; b < numBuckets; ++b) {
        activeBucket = b;
        while (buckets[b].length > 0) {
          const val = buckets[b][0];
          buckets[b] = buckets[b].slice(1);
          arr[writeIdx] = val;
          writeIdx += 1;
          stats.gathered += 1;

          const gatherCheckpoint: ExecutionFrame['checkpoint'] | undefined = !gatherCheckpointAdded
            ? {
                id: 'bucket-sort-gather-order',
                question: `B${b} has just contributed arr[${writeIdx - 1}] = ${val}. In which order are the buckets drained overall?`,
                options: [
                  'Descending: B' + (numBuckets - 1) + ' → B0',
                  `Ascending: B0 → B${numBuckets - 1}`,
                  'Random bucket order',
                ],
                correctIndex: 1,
                explanation: 'Ascending bucket order concatenates non-overlapping range slices, which is what makes the gather globally sorted.',
                hint: 'Which bucket holds the smallest values?',
              }
            : undefined;

          const gatherMilestone = maybeHalfMilestone();

          pushFrame({
            codeLine: 13,
            action: 'GATHER',
            explanation: `Gather: ${val} leaves B${b} and fills arr[${writeIdx - 1}] (${stats.gathered}/${n} placed).`,
            statusLabel: `GATHER B${b} → arr[${writeIdx - 1}] = ${val}`,
            soundCue: 'swap',
            variables: {
              b,
              writeIdx: writeIdx - 1,
              val,
              remainingInBucket: buckets[b].length,
              bucketsOverview: formatBucketsSummary(),
            },
            conditionEval: { expr: 'writeIdx < n', condition: `${writeIdx - 1} < ${n}`, result: true },
            callStack: [{ name: 'gatherBucket', params: { bucket: b, writeIdx: writeIdx - 1, val }, line: 13, isCurrent: true }],
            statuses: { [writeIdx - 1]: 'active' },
            pointers: { writeIdx: writeIdx - 1, bucket: b },
            checkpoint: gatherCheckpoint,
            milestone: gatherMilestone,
            pedagogy: {
              what: `${val} leaves B${b} and fills arr[${writeIdx - 1}] — the write cursor only ever moves right.`,
              why: `Bucket B${b} was sorted, and every later bucket holds only larger values, so appending cannot break global order.`,
              whatNext:
                buckets[b].length > 0
                  ? `Drain the next value from B${b}.`
                  : b < numBuckets - 1
                    ? `B${b} is empty — continue with B${b + 1}.`
                    : 'All buckets drained — the array is sorted.',
            },
          });
          if (gatherCheckpoint) gatherCheckpointAdded = true;
        }
      }

      // Done
      phase = 'done';
      activeBucket = null;
      pushFrame({
        codeLine: 14,
        action: 'DONE',
        explanation: `Bucket Sort complete: [${arr.join(', ')}] is sorted after ${stats.scattered} scatter(s), ${stats.internalSwaps} internal swap(s) and ${stats.gathered} gather(s).`,
        statusLabel: 'DONE: fully sorted',
        milestone: 'Bucket Sort Completed',
        soundCue: 'complete',
        variables: {
          result: n,
          scattered: stats.scattered,
          internalSwaps: stats.internalSwaps,
          gathered: stats.gathered,
        },
        conditionEval: { expr: 'array is sorted', condition: arr.join(', '), result: isSorted(arr) },
        statuses: Object.fromEntries(arr.map((_, idx) => [idx, 'sorted' as const])),
        pedagogy: {
          what: `Final array: [${arr.join(', ')}] — built by scattering once and gathering once.`,
          why: 'Total work is O(N) scatter + per-bucket sorts + O(N) gather; uniform data makes buckets small and the sort near-linear.',
          whatNext: 'Try the clustered preset: fewer buckets do all the work there, showing the O(N²) skew risk.',
        },
      });
    } else {
      // Explicitly empty input: a valid two-frame run, not a fallback.
      pushFrame({
        codeLine: 2,
        action: 'INIT',
        explanation:
          'n = length(arr) = 0: the guard returns the array immediately — no range is computed and no bucket is filled.' +
          (notes.length ? ` Input adjusted: ${notes.join('; ')}.` : ''),
        statusLabel: 'INIT: nothing to scatter',
        soundCue: 'start',
        variables: { N: 0, numBuckets, minVal: null, maxVal: null },
        conditionEval: { expr: 'length(arr) == 0', condition: '0 == 0', result: true },
        pedagogy: {
          what: 'The array is empty, so min/max and the bucket ranges are undefined.',
          why: 'The length guard short-circuits before any bucket is allocated.',
          whatNext: 'Return the empty array; nothing is scattered or gathered.',
        },
      });
      phase = 'done';
      pushFrame({
        codeLine: 14,
        action: 'DONE',
        explanation: 'Bucket Sort complete on an empty array: zero scatters, zero internal swaps, zero gathers.',
        statusLabel: 'DONE: nothing to sort',
        milestone: 'Nothing to Sort',
        soundCue: 'complete',
        variables: { result: 0, scattered: 0, internalSwaps: 0, gathered: 0 },
        conditionEval: { expr: 'array is sorted', condition: '', result: true },
        pedagogy: {
          what: 'An empty array is sorted by definition.',
          why: 'There is no value to route, so the scatter and gather loops never run.',
          whatNext: 'Load a preset such as Uniformly Distributed to watch scatter → sort → gather run.',
        },
      });
    }

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <BucketSortStage state={frame.state} projection={projection} />;
  },
};
