import { AlgorithmModule, ExecutionFrame } from '../../core/types';
import { ArrayStage, ArrayStageState } from '../../components/stage/ArrayStage';

export const bucketSortModule: AlgorithmModule<number[], ArrayStageState> = {
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
  generateTimeline: (input: number[]) => {
    const arr = [...input];
    const n = arr.length;
    const numBuckets = 5;
    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);
    const bucketRange = Math.max(1, Math.floor((maxVal - minVal) / numBuckets) + 1);
    const frames: ExecutionFrame<ArrayStageState>[] = [];

    frames.push({
      stepIndex: 0,
      totalSteps: 1,
      codeLine: 3,
      explanation: `Initialized Bucket Sort with ${numBuckets} buckets. Range: [${minVal} .. ${maxVal}], bucket size = ${bucketRange}.`,
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
      },
    });

    const buckets: number[][] = Array.from({ length: numBuckets }, () => []);

    // Scatter phase
    for (let i = 0; i < n; ++i) {
      const val = arr[i];
      const bIdx = Math.min(Math.floor((val - minVal) / bucketRange), numBuckets - 1);
      buckets[bIdx].push(val);

      frames.push({
        stepIndex: frames.length,
        totalSteps: 1,
        codeLine: 9,
        explanation: `Scatter: element arr[${i}] = ${val} placed into Bucket #${bIdx} ([${bIdx * bucketRange + minVal}..${(bIdx + 1) * bucketRange + minVal - 1}]).`,
        state: {
          array: arr.map((v, idx) => ({
            id: idx,
            value: v,
            status: idx === i ? 'active' : 'default',
          })),
          pointers: { i, bucket: bIdx },
        },
      });
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 12,
      explanation: `All ${n} elements scattered into ${numBuckets} buckets. Beginning internal bucket sorting and concatenation.`,
      isMilestone: true,
      milestoneTitle: 'Scatter Phase Complete',
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'default' })),
        pointers: {},
      },
    });

    // Sort and gather
    let writeIdx = 0;
    const sortedResult: number[] = [];
    for (let b = 0; b < numBuckets; ++b) {
      const currentBucket = [...buckets[b]].sort((a, b) => a - b);
      for (const val of currentBucket) {
        arr[writeIdx] = val;
        sortedResult.push(val);
        frames.push({
          stepIndex: frames.length,
          totalSteps: 1,
          codeLine: 16,
          explanation: `Gather: sorted element ${val} from Bucket #${b} placed into position ${writeIdx}.`,
          state: {
            array: arr.map((v, idx) => ({
              id: idx,
              value: v,
              status: idx <= writeIdx ? 'sorted' : 'default',
            })),
            pointers: { writeIdx, bucket: b },
          },
        });
        writeIdx++;
      }
    }

    frames.push({
      stepIndex: frames.length,
      totalSteps: 1,
      codeLine: 18,
      explanation: 'All buckets gathered. Array is completely sorted!',
      isMilestone: true,
      milestoneTitle: 'Bucket Sort Completed',
      state: {
        array: arr.map((v, idx) => ({ id: idx, value: v, status: 'sorted' })),
        pointers: {},
      },
    });

    const total = frames.length;
    return frames.map((f, idx) => ({ ...f, stepIndex: idx, totalSteps: total }));
  },
  renderStage: (frame, projection) => {
    return <ArrayStage state={frame.state} projection={projection} />;
  },
};
