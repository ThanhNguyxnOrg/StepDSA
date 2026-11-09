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
    python: `def bucket_sort(arr, num_buckets=5):
    if len(arr) == 0: return arr
    min_val, max_val = min(arr), max(arr)
    bucket_range = max(1, (max_val - min_val) // num_buckets + 1)
    buckets = [[] for _ in range(num_buckets)]

    # Scatter
    for num in arr:
        idx = min((num - min_val) // bucket_range, num_buckets - 1)
        buckets[idx].append(num)

    # Sort & Gather
    output = []
    for bucket in buckets:
        output.extend(sorted(bucket))
    return output`,
    typescript: `function bucketSort(arr: number[], numBuckets: number = 5): number[] {
  if (arr.length === 0) return arr;
  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const bucketRange = Math.max(1, Math.floor((maxVal - minVal) / numBuckets) + 1);
  const buckets: number[][] = Array.from({ length: numBuckets }, () => []);

  // Scatter into buckets
  for (const num of arr) {
    const idx = Math.min(Math.floor((num - minVal) / bucketRange), numBuckets - 1);
    buckets[idx].push(num);
  }

  // Sort each bucket and gather
  const result: number[] = [];
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b);
    result.push(...bucket);
  }
  return result;
}`,
    cpp: `vector<int> bucketSort(vector<int>& arr, int numBuckets = 5) {
    if (arr.empty()) return arr;
    int minVal = *min_element(arr.begin(), arr.end());
    int maxVal = *max_element(arr.begin(), arr.end());
    int bucketRange = max(1, (maxVal - minVal) / numBuckets + 1);
    vector<vector<int>> buckets(numBuckets);

    for (int num : arr) {
        int idx = min((num - minVal) / bucketRange, numBuckets - 1);
        buckets[idx].push_back(num);
    }
    vector<int> result;
    for (auto& bucket : buckets) {
        sort(bucket.begin(), bucket.end());
        result.insert(result.end(), bucket.begin(), bucket.end());
    }
    return result;
}`,
    java: `public int[] bucketSort(int[] arr, int numBuckets) {
    if (arr.length == 0) return arr;
    int minVal = Arrays.stream(arr).min().getAsInt();
    int maxVal = Arrays.stream(arr).max().getAsInt();
    int range = Math.max(1, (maxVal - minVal) / numBuckets + 1);
    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i < numBuckets; i++) buckets.add(new ArrayList<>());
    for (int num : arr) {
        int idx = Math.min((num - minVal) / range, numBuckets - 1);
        buckets.get(idx).add(num);
    }
    int[] result = new int[arr.length];
    int idx = 0;
    for (List<Integer> bucket : buckets) {
        Collections.sort(bucket);
        for (int v : bucket) result[idx++] = v;
    }
    return result;
}`,
    pseudocode: `function bucketSort(arr, numBuckets):
    minVal <- min(arr), maxVal <- max(arr)
    buckets <- array of empty lists of size numBuckets
    for x in arr:
        bucketIdx <- (x - minVal) / range
        buckets[bucketIdx].append(x)
    for bucket in buckets:
        sort(bucket)
    return concatenate(buckets)`,
  },

  generateTimeline: (input: number[]): ExecutionFrame<BucketSortState>[] => {
    const arr = [...input];
    const n = arr.length;
    const numBuckets = 5;
    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);
    const bucketRange = Math.max(1, Math.floor((maxVal - minVal) / numBuckets) + 1);
    const frames: ExecutionFrame<BucketSortState>[] = [];

    const buckets: number[][] = Array.from({ length: numBuckets }, () => []);
    let writeIdx = 0;
    let checkpointAdded = false;
    let phase: BucketSortPhase = 'scatter';
    let activeBucket: number | null = null;

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

    const pushFrame = (
      codeLine: number,
      explanation: string,
      opts: {
        statusLabel: string;
        milestone?: string;
        soundCue?: ExecutionFrame['soundCue'];
        variables?: Record<string, any>;
        conditionEval?: { expr: string; result: boolean };
        callStack?: any[];
        pedagogy?: ExecutionFrame['pedagogy'];
        checkpoint?: ExecutionFrame['checkpoint'];
        statuses?: Record<number, 'active' | 'sorted' | 'comparing' | 'swapping'>;
        pointers?: Record<string, number>;
      }
    ) => {
      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine,
        explanation,
        isMilestone: !!opts.milestone,
        milestoneTitle: opts.milestone,
        soundCue: opts.soundCue ?? { type: 'step' },
        variables: opts.variables,
        conditionEval: opts.conditionEval,
        callStack: opts.callStack ?? [
          { name: 'bucketSort', params: { n, numBuckets }, line: codeLine, isCurrent: true },
        ],
        pedagogy: opts.pedagogy,
        checkpoint: opts.checkpoint,
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

    // Initial frame
    pushFrame(
      3,
      `Initialized Bucket Sort with ${numBuckets} buckets. Range: [${minVal} .. ${maxVal}], bucket size = ${bucketRange}.`,
      {
        statusLabel: `INIT: ${numBuckets} buckets over [${minVal}..${maxVal}]`,
        milestone: 'Bucket Sort Initialized',
        soundCue: { type: 'start' },
        variables: { n, numBuckets, minVal, maxVal, bucketRange },
        conditionEval: { expr: `numBuckets > 0`, result: true },
        pedagogy: {
          what: `Value range [${minVal}..${maxVal}] is split into ${numBuckets} buckets of width ${bucketRange}.`,
          why: 'Range partitioning means bucket i only ever holds values in one contiguous slice, so buckets never interleave.',
          whatNext: `Scatter: every value is routed to bucket (value − ${minVal}) ÷ ${bucketRange}.`,
        },
      }
    );

    // Scatter phase
    for (let i = 0; i < n; ++i) {
      const val = arr[i];
      const bIdx = Math.min(Math.floor((val - minVal) / bucketRange), numBuckets - 1);
      const bucketBefore = buckets[bIdx].length;
      buckets[bIdx].push(val);
      activeBucket = bIdx;

      pushFrame(
        9,
        `Scatter: element arr[${i}] = ${val} placed into Bucket #${bIdx} ([${bIdx * bucketRange + minVal}..${(bIdx + 1) * bucketRange + minVal - 1}]). Buckets: ${formatBucketsSummary()}`,
        {
          statusLabel: `SCATTER ${val} → B${bIdx}`,
          soundCue: { type: 'step' },
          variables: {
            i,
            val,
            bIdx,
            [`Bucket_${bIdx}`]: [...buckets[bIdx]],
            bucketsOverview: formatBucketsSummary(),
          },
          conditionEval: { expr: `bIdx = floor((${val} - ${minVal}) / ${bucketRange}) = ${bIdx}`, result: true },
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
        }
      );
    }

    // Scatter complete + invariant checkpoint
    phase = 'sort';
    activeBucket = null;
    const b0 = buckets[0] || [];
    const b1Lo = minVal + bucketRange;
    pushFrame(
      12,
      `All ${n} elements scattered into ${numBuckets} buckets (${formatBucketsSummary()}). Beginning per-bucket Insertion Sort and concatenation.`,
      {
        statusLabel: `SCATTERED: ${n} values distributed`,
        milestone: 'Scatter Phase Complete',
        variables: { totalScattered: n, bucketsCount: numBuckets, bucketsOverview: formatBucketsSummary() },
        conditionEval: { expr: `allScattered == true`, result: true },
        callStack: [
          { name: 'bucketSort', params: { phase: 'scatterComplete' }, line: 12, isCurrent: true },
        ],
        pedagogy: {
          what: `Every value sits in the bucket that owns its range.`,
          why: 'Because the bucket ranges partition [min..max], gathering buckets in index order will already order values between buckets — only the inside of each bucket remains unordered.',
          whatNext: `Sort each bucket internally (insertion sort here), then gather B0 → B${numBuckets - 1}.`,
        },
        checkpoint: !checkpointAdded
          ? {
              id: 'bucket-sort-range-invariant',
              question: `B0 owns range [${minVal}..${minVal + bucketRange - 1}] and holds [${b0.join(', ')}]; B1 starts at ${b1Lo}. Can any value in B1 be smaller than a value in B0?`,
              options: ['No — bucket ranges never overlap', 'Yes — values can land anywhere'],
              correctIndex: 0,
              explanation:
                'Routing is by value range, so every B1 value is ≥ every B0 value: ascending bucket order is globally sorted; only per-bucket internals need work.',
            }
          : undefined,
      }
    );
    checkpointAdded = true;

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

            pushFrame(
              14,
              `Sort Bucket #${b}: swapped ${tmp} and ${other} inside Bucket #${b} → [${currentBucket.join(', ')}].`,
              {
                statusLabel: `SORT B${b}: ${tmp} ⇄ ${other}`,
                soundCue: { type: 'compare' },
                variables: {
                  bucketIndex: b,
                  [`Bucket_${b}`]: [...currentBucket],
                  bucketsOverview: formatBucketsSummary(),
                },
                conditionEval: { expr: `B${b}[${bj}] (${tmp}) < B${b}[${bj - 1}] (${other})`, result: true },
                callStack: [{ name: `sortBucket(b=${b})`, params: { bucket: b }, line: 14, isCurrent: true }],
                pedagogy: {
                  what: `${tmp} and ${other} trade places inside B${b}.`,
                  why: 'Internal bucket order is the only thing left to fix: insertion sort is fine for the small bucket sizes.',
                  whatNext: `Continue inserting inside B${b}.`,
                },
              }
            );
            bj--;
          }
        }
      }

      if (currentBucket.length > 0) {
        pushFrame(
          14,
          currentBucket.length > 1
            ? `Bucket #${b} is now internally sorted: [${currentBucket.join(', ')}].`
            : `Bucket #${b} holds one value (${currentBucket[0]}) — already sorted by definition.`,
          {
            statusLabel: `B${b} SORTED: [${currentBucket.join(', ')}]`,
            soundCue: { type: 'sorted' },
            variables: {
              bucketIndex: b,
              [`Bucket_${b}`]: [...currentBucket],
              bucketsOverview: formatBucketsSummary(),
            },
            conditionEval: { expr: `isSorted(B${b})`, result: true },
            callStack: [{ name: `sortBucket(b=${b})`, params: { bucket: b }, line: 14, isCurrent: true }],
            pedagogy: {
              what: `B${b} is sorted internally: [${currentBucket.join(', ')}].`,
              why: 'Values between buckets are already ordered by range, so a fully sorted, ascending bucket list is globally sorted after gathering.',
              whatNext:
                b < numBuckets - 1
                  ? `Sort B${b + 1} next.`
                  : 'All buckets sorted — gather them into the array.',
            },
          }
        );
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

        pushFrame(
          16,
          `Gather: sorted element ${val} from Bucket #${b} placed into arr[${writeIdx}].`,
          {
            statusLabel: `GATHER B${b} → arr[${writeIdx}] = ${val}`,
            soundCue: { type: 'swap' },
            variables: {
              b,
              writeIdx,
              val,
              remainingInBucket: buckets[b].length,
              bucketsOverview: formatBucketsSummary(),
            },
            conditionEval: { expr: `writeIdx < n (${writeIdx} < ${n})`, result: true },
            callStack: [{ name: 'gatherBucket', params: { bucket: b, writeIdx, val }, line: 16, isCurrent: true }],
            statuses: { [writeIdx]: 'active' },
            pointers: { writeIdx, bucket: b },
            pedagogy: {
              what: `${val} leaves B${b} and fills arr[${writeIdx}] — the write cursor only ever moves right.`,
              why: `Bucket B${b} was sorted, and every later bucket holds only larger values, so appending cannot break global order.`,
              whatNext:
                buckets[b].length > 0
                  ? `Drain the next value from B${b}.`
                  : b < numBuckets - 1
                  ? `B${b} is empty — continue with B${b + 1}.`
                  : 'All buckets drained — the array is sorted.',
            },
          }
        );
        writeIdx++;
      }
    }

    // Done
    phase = 'done';
    activeBucket = null;
    pushFrame(18, 'All buckets gathered. Array is completely sorted!', {
      statusLabel: 'DONE: fully sorted',
      milestone: 'Bucket Sort Completed',
      soundCue: { type: 'complete' },
      variables: { totalSorted: writeIdx, n, isSorted: true },
      conditionEval: { expr: `writeIdx == n (${writeIdx} == ${n})`, result: true },
      callStack: [{ name: 'bucketSort', params: { done: true }, line: 18, isCurrent: true }],
      statuses: Object.fromEntries(arr.map((_, idx) => [idx, 'sorted' as const])),
      pedagogy: {
        what: `Final array: [${arr.join(', ')}] — built by scattering once and gathering once.`,
        why: 'Total work is O(N) scatter + per-bucket sorts + O(N) gather; uniform data makes buckets small and the sort near-linear.',
        whatNext: 'Try the clustered preset: fewer buckets do all the work there, showing the O(N²) skew risk.',
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },

  renderStage: (frame, projection) => {
    return <BucketSortStage state={frame.state} projection={projection} />;
  },
};
