# ROUND 3 — Quét toàn bộ visualizer cổ điển + hiện đại (2026-11-16, craft-anything live)

> Câu hỏi: ngoài các site đã điều tra, còn website visualize thuật toán/CTDL nào được cộng đồng đánh giá cao, và StepDSA nên học gì để mô phỏng chuẩn — đầy đủ — dễ hiểu hơn?
>
> Phạm vi: **48 trang USFCA** (toàn bộ danh mục Algorithms), **8 site hiện đại** (sortvisualizer, Clement Sorting, Princeton algs4, Algomation, PyAlgoViz, Graph Online, JSAV, Setosa), và **4 site cổ điển** (PathFinding.js, Bostock, AlgoAnim, sorting-algorithms.com).
>
> Phương pháp: craft-anything browser (Chrome riêng tư) → mở trang → capture screenshot + DOM (`page.html`) → trích control labels. Mọi kết luận có evidence id; site chết/bị chặn ghi trung thực.

---

## 0. TL;DR — chọn cái tốt nhất để học

| Nhu cầu của StepDSA | Best-in-class | Học gì |
|---|---|---|
| Transport + thao tác trực tiếp | **USFCA Galles** | Skip Back/Step Back/Pause/Step Forward/Skip Forward + Insert/Delete/Find/Print + mode toggles |
| Giảng giải từng bước | **VisuAlgo** (đã teardown) | e-Lecture, codetrace, checkpoint, training |
| Chia sẻ đúng phiên chạy | **Python Tutor** + **Graph Online** | Permalink mang theo code/đồ thị; StepDSA vừa bổ sung `?input=` |
| So sánh thuật toán | **USFCA ComparisonSort** + **Toptal** | Cùng một mảng, nhiều thuật toán, một transport |
| Chiến lược DP | **USFCA DPChange/DPFib/DPLCS** | Recursive / Memoized / Table / Greedy trên cùng bài toán |
| Biểu diễn đồ thị | **USFCA BFS/DFS/Dijkstra** | Logical ↔ Adjacency List ↔ Adjacency Matrix |
| Trang một thuật toán | **sortvisualizer.com** | Description (ẩn dụ) + Complexity table + Implementations + Variants |
| Tối giản, tập trung | **Clement Sorting** | Full-bleed bars, một hàng controls, speed slider |
| Thư viện mini-visualizer | **PyAlgoViz** | Gallery nhiều thuật toán, mỗi card chạy được, nhãn Big-O |
| Giải thích khám phá | **Bostock / Setosa** | Prose → figure → code → caveat, người đọc tự kéo/Chạy |

**Kết luận:** StepDSA đã có “xương sống” mạnh hơn phần lớn site (timeline tất định, pedagogy WHAT/WHY/NEXT, checkpoint, code-line, permalink). Khoảng trống lớn nhất không phải thêm hiệu ứng, mà là **so sánh nhiều thuật toán trên cùng input**, **chuyển chế độ chiến lược/biểu diễn**, và **thao tác trực tiếp** kiểu USFCA.

---

## 1. USFCA Galles — full sweep 48 trang

### 1.1 Inventory (trích từ DOM của từng trang)

| Nhóm | Trang | Controls / modes quan sát được |
|---|---|---|
| Stack/Queue | StackArray, StackLL | Push · Pop · Clear Stack |
| Stack/Queue | QueueArray, QueueLL | Enqueue · Dequeue · Clear Queue |
| Hash | OpenHash | Insert · Delete · Find · Hash Integer/Strings |
| Hash | ClosedHash | Insert · Delete · Find · Hash Integer/Strings · Linear/Quadratic/Double Probing |
| Hash | ClosedHashBucket | Insert · Delete · Find · Hash Integer/Strings |
| Heap | Heap | Insert · Remove Smallest · Clear Heap · BuildHeap |
| Heap | BinomialQueue, FibonacciHeap, LeftistHeap, SkewHeap | Insert · Remove Smallest · Clear Heap (+ Logical/Internal, Show Null Path Lengths) |
| BST | BST, AVLtree, RedBlack, SplayTree | Insert · Delete · Find · Print (+ Show Null Leaves ở RedBlack) |
| Multiway | BTree, BPlusTree | Insert · Delete · Find · Print · Clear · Max Degree 3–7 (+ Preemptive Split/Merge) |
| Trie | Trie, TST, RadixTree | Insert · Delete · Find · Print |
| Sorting | ComparisonSort | Randomize Array · Insertion/Selection/Bubble/Quick/Merge/Shell Sort · Change Size |
| Sorting | HeapSort, CountingSort, RadixSort, BucketSort | Randomize List · chạy đúng một thuật toán |
| Searching | Search | Linear Search · Binary Search · Small/Large |
| Graph | BFS, DFS, Dijkstra | Run · New Graph · Start Vertex · Directed/Undirected · Small/Large · **Logical / Adjacency List / Adjacency Matrix** |
| Graph | Prim, Kruskal | Run · New Graph · Start Vertex (Prim) · Small/Large · 3 representations |
| Graph | Floyd, TopoSortDFS, TopoSortIndegree, ConnectedComponent | Run · New Graph · Small/Large · 3 representations |
| Graph | DisjointSets | Find · Union · Path Compression · Union By Rank · Rank = #nodes / estimated height |
| DP | DPChange | **Change Recursive / Change Table / Change Memoized / Change Greedy** · coin presets |
| DP | DPFib | **Fibonacci Recursive / Table / Memoized** |
| DP | DPLCS | **LCS Recursive / Table / Memoized** · S1/S2 |
| Recursion | RecFact, RecQueens, RecReverse | Factorial · Queens (board 1–8) · Reverse |
| Geometry | ChangingCoordinates2D/3D | Transform Point · Move Objects · Hand↔World · Row/Column Major · Show all axes |
| Geometry | RotateScale2D, RotateScale3D, RotateTranslate2D | Transform/Rotate/Scale · Change Shape · angle/scale/translate · Row/Column Major · +y Up/Down · order toggles |

**Pattern chung của cả 48 trang:** mỗi trang là một “máy thao tác” — nhập một thao tác (Insert/Delete/Find/Push/Pop/Run) → transport phát lại đúng chuỗi animation → đổi mode bằng checkbox/radio/select → cùng một bộ **Skip Back · Step Back · Pause · Step Forward · Skip Forward** + **Animation Speed** + **Change Canvas Size** + **Move Controls** ở đáy.

### 1.2 Năm pattern đáng kế thừa nhất

1. **Direct operation console** (BST/Heap/Stack/Queue/Hash): người học không phải nghĩ ra “preset”, chỉ gõ một khóa rồi bấm Insert/Delete/Find. StepDSA hiện dùng preset + custom input; thiếu thao tác từng phát.
2. **Strategy toggle** (DPChange/DPFib/DPLCS): cùng một bài toán, bốn cách giải — Recursive → Memoized → Table → Greedy. Đây là cách dạy “vì sao DP nhanh hơn” rất trực quan; StepDSA đang tách module hoặc chỉ có một chiến lược.
3. **Representation toggle** (BFS/DFS/Dijkstra/Prim/Kruskal/Floyd/Topo/ConnectedComponent): Logical ↔ Adjacency List ↔ Adjacency Matrix, kèm Directed/Undirected và Small/Large. StepDSA có module `graph-representations` nhưng các stage graph khác chỉ hiển thị một biểu diễn.
4. **Implementation variants** (Stack Array vs Linked List, Queue Array vs LL, 5 họ heap): cùng interface, khác chi phí — USFCA đặt cạnh nhau để so sánh. StepDSA tách module và có sibling bar; có thể thêm “variants” cross-link.
5. **ComparisonSort**: một mảng, sáu thuật toán, một transport, đổi thuật toán bằng nút. Đây là tính năng “killer” StepDSA còn thiếu.

### 1.3 Điều USFCA chưa làm tốt (để StepDSA vượt)

- Không có pedagogy từng bước (WHAT/WHY/NEXT), không checkpoint, không code-line mapping.
- Không có permalink mang theo input/step (chỉ có URL trang).
- Không có time-travel bằng scrubber milestone; transport chỉ tiến/lùi.
- Không có code panel đa ngôn ngữ; không có quiz/proficiency.
- UI rất cũ (bảng màu, font, canvas), không responsive.

---

## 2. Modern best-in-class

### 2.1 sortvisualizer.com — “một trang một thuật toán” chuẩn mực

**Quan sát** (landing + `/bubblesort` + `/quicksort`):
- Landing: catalog chia **Logarithmic / Quadratic / Weird**, mỗi nhóm liệt kê thuật toán; phần giới thiệu giải thích Big-O bằng ẩn dụ.
- Trang Bubble Sort: header có **shuffle**, **play**, **slider “Elements: 100”**; stage full-bleed; bên dưới là **DESCRIPTION** (ẩn dụ “bong bóng sủi”), **COMPLEXITY** (Average/Best/Worst/Space), **IMPLEMENTATIONS**, và **variants** (Shaker/Odd Even/Comb) cross-link.
- Quick Sort cùng cấu trúc; mỗi trang là một “bài học + máy chạy” độc lập.

**Học cho StepDSA:**
- TheoryDrawer đã có complexity grid + overview; có thể bổ sung **“Variants”** cross-link và **“Implementations”** (ngôn ngữ) ngay trong drawer.
- Slider “Elements” là cách đổi kích thước mượt hơn các nút size hiện tại; StepDSA đã có size buttons, có thể nâng thành slider ở P2.
- Ẩn dụ trong Description rất tốt cho người mới; StepDSA có thể thêm `analogy` ngắn vào theory của các module sorting.

### 2.2 Clement Mihailescu Sorting Visualizer — tối giản là vua

**Quan sát:** top bar chỉ có **Generate New Array**, **Change Array Size & Sorting Speed** (một slider), **Merge Sort · Quick Sort · Heap Sort · Bubble Sort**; toàn bộ phần còn lại là bars full-bleed. Không panel, không code, không theory.

**Học cho StepDSA:** stage của StepDSA đã sạch; nhưng thanh transport khá dày. Có thể thêm **speed slider** (thay vì cycle 0.25→2) và giữ các nút phụ ẩn sau “More” trên màn hình hẹp. Bài học lớn: **một màn hình chỉ nên có một “việc chính”** — StepDSA có thể tách “Focus mode” ẩn hết panel.

### 2.3 Princeton Algorithms 4E — sách + hình tĩnh, không phải visualizer tương tác

**Quan sát:**
- `https://algs4.cs.princeton.edu/visualizations/` trả **404**.
- Các chương (`/21elementary`, `/32bst`, `/33balanced`) chứa **hình tĩnh/GIF** và mô tả: “Visualizing sorting algorithms”, “visualization below shows the result of inserting 255 keys in a BST in random order”, “255 keys inserted into a red-black BST”.
- Không có transport/step controls; hình chỉ minh họa kết quả.

**Học cho StepDSA:** cấu trúc “prose → figure → code → complexity” của sách là chuẩn; StepDSA có thể tạo **figure caption + số hình** cho stage (như hello-algo) và **ảnh tĩnh “kết quả sau N thao tác”** trong theory. Không cần bắt chước vì StepDSA đã tương tác hơn.

### 2.4 PyAlgoViz — gallery mini-visualizer

**Quan sát:** trang chủ là lưới card; mỗi card là một **mini-visualization chạy được** (Bloom filter, Dijkstra, MST, Knapsack, N-Queens, Pi, …), kèm **nhãn Big-O** (O_log_n, O_n, O_n_2…), tên tác giả, “Click for details”, “My Algorithms”, và biểu đồ Big-O tổng quan.

**Học cho StepDSA:** dashboard đã có card + thumbnail; có thể thêm **preview tự chạy khi hover/focus** (dùng timeline có sẵn, chỉ seek vài frame) và **nhãn Big-O** trên card. “My Algorithms” gợi ý Personal Code Studio đã có — có thể hiển thị module tự tạo trong dashboard.

### 2.5 Graph Online — editor đồ thị + copy link

**Quan sát:** toolbar **Graph · View · Default · Add vertex · Connect vertices · Algorithms · Remove object · Settings**; canvas trắng; context menu **Edit edge / Delete edge / Connect / Rename / Delete / Add vertex / Background color**; **edge weight slider**; hỗ trợ **adjacency matrix / incidence matrix / edge list**; nút **Copy graph link**.

**Học cho StepDSA:** đây là mô hình cho **graph editor** (P2) — kéo/thả đỉnh, nối cạnh, gán trọng số, chọn thuật toán, copy link. StepDSA mới có grid editor cho A*; các module graph khác dùng preset. “Copy graph link” chính là `?input=` vừa bổ sung — nhưng cần editor để tạo graph trước.

### 2.6 Setosa “Explained Visually” + Bostock “Visualizing Algorithms” — explorable explanation

**Quan sát:**
- Setosa: danh sách bài “Explained Visually” (OLS, PCA, Image Kernels, Eigenvectors, Pi, Sine/Cosine, Exponentiation, Markov Chains, Conditional Probability), mỗi bài có figure tương tác nhỏ ngay trong dòng.
- Bostock: bài dài, dẫn dắt bằng văn xuôi → hình → code ngắn → caveat; ví dụ sampling (best-candidate), sorting, maze. Code hiển thị ngay cạnh hình, có thể sửa tham số.

**Học cho StepDSA:** chế độ **“Explorable”** (P3): theory + mini-stage ngay trong drawer, mỗi đoạn có figure riêng và nút Step; không cần mở Workbench. Đây là hướng để “dễ hiểu” hơn nữa mà không biến StepDSA thành sách tĩnh.

### 2.7 PathFinding.js — grid editor kinh điển

**Quan sát:** chọn thuật toán (A*, IDA*, Best-First, Jump Point, Orthogonal JPS, Trace…), **heuristic radio** (Manhattan/Euclidean/Octile/Chebyshev), **Allow Diagonal**, **Weight**, **time limit** (IDA*), nút **Start Search / Pause Search / Clear Walls**; grid cho phép vẽ tường.

**Học cho StepDSA:** module A* có thể thêm **heuristic selector** + **Allow Diagonal** + **weight**; đây là các tham số ảnh hưởng trực tiếp đến số node mở — rất tốt để dạy “heuristic nào admissible”. Grid editor kéo thả đã nằm trong roadmap P2.

---

## 3. Site chết / bị chặn / không quan sát được (trung thực)

| Site | Kết quả | Ghi chú |
|---|---|---|
| `sorting-algorithms.com` | **ERR_CONNECTION** | Không tải được; không dùng làm bằng chứng. |
| `algomation.com` | **Bị chiếm domain** | Trả trang casino tiếng Indonesia (“Situs Judi Slot…”), không còn là algorithm visualizer. |
| `jsav.io` | **Bị chặn cert/redirect** | `net::ERR_CERT_*` / `ERR_BLOCKED`; không quan sát được. OpenDSA (dùng JSAV) đã có báo cáo source riêng. |
| `csacademy.com/app/graph_editor` | **Ảnh trắng** (2 lần, kể cả chờ 5s) | Không xác minh được UI; giữ ghi chú từ round 2. |
| `algs4.cs.princeton.edu/visualizations/` | **404** | Visualizations nằm rải trong chương dưới dạng hình tĩnh, không phải app. |
| `algoanim.ide.sk` | **Parking page** | Trả trang “websupport” chặn geo/admin, không còn visualizer. |

---

## 4. Gap analysis — StepDSA vs best-in-class

| Năng lực | Best-in-class | StepDSA hiện tại | Khoảng trống / ưu tiên |
|---|---|---|---|
| Transport đầy đủ | USFCA | ✅ Reset/Prev/Play/Next/Jump End + scrubber + milestone + Action | Đã ngang |
| Speed slider | USFCA/Clement | ⚠️ nút cycle 0.25–2× | P2: slider hoặc popover |
| Thao tác trực tiếp | USFCA | ❌ preset + custom input | P1: operation console cho BST/Heap/Stack/Queue/Hash |
| Strategy toggle DP | USFCA | ❌ chủ yếu một chiến lược/module | P1: Recursive/Memo/Table/Greedy cho coin-change, LCS, Fibonacci |
| Representation toggle | USFCA | ⚠️ có module `graph-representations`, stage graph khác chỉ 1 biểu diễn | P1: panel Logical/List/Matrix trong stage graph |
| Implementation variants | USFCA | ⚠️ module riêng + sibling bar | P2: “Variants” cross-link trong TheoryDrawer |
| So sánh nhiều thuật toán | USFCA ComparisonSort | ❌ | **P1: Compare mode (cùng mảng, 2–6 thuật toán)** |
| Elements slider | sortvisualizer/Clement | ⚠️ nút size | P2: slider |
| Description + Complexity + Implementations | sortvisualizer | ✅ TheoryDrawer (complexity grid, overview, pitfalls) | P2: thêm “Variants” + “Implementations” |
| Full-bleed minimal stage | Clement | ✅ stage sạch | P2: Focus mode ẩn panel |
| Gallery mini-visualizer | PyAlgoViz | ✅ dashboard card + thumbnail | P2: autoplay preview + Big-O label |
| Graph editor + copy link | Graph Online | ⚠️ A* grid preset; `?input=` vừa có | P2: graph editor kéo/thả; copy link đã có |
| Explorable explanation | Bostock/Setosa | ⚠️ theory tách khỏi stage | P3: mini-stage trong TheoryDrawer |
| Share exact input | Python Tutor/Graph Online | ✅ **vừa triển khai `?input=`** | Đã ngang |
| Permalink step | Python Tutor/VisuAlgo | ✅ `?module=&step=` | Đã ngang |
| Jump to End | USFCA | ✅ | Đã ngang |
| Pitfall ❌/✅ pairs | algomooc | ⚠️ danh sách pitfalls | P2: cặp wrong/right |
| Related problems | algomooc | ❌ | P2: `relatedModules` chips |
| Voice narration | algomooc | ❌ | P3 |
| Proficiency/gradeable | OpenDSA | ❌ | P2 |
| Recursion stats | VisuAlgo | ⚠️ recursion-trees còn ⬜ | P1: nâng recursion-trees |
| Animation trong mạch lý thuyết | hello-algo | ❌ | P3 |

---

## 5. Đã triển khai ngay trong round này

### 5.1 `?input=` — permalink mang theo input tùy chỉnh

**Vấn đề:** trước đây `?module=&step=` chỉ mở đúng module + frame, nhưng mảng/đồ thị người học đã nhập bị mất — mở link ra lại thấy preset mặc định. Python Tutor lưu cả code trong URL; Graph Online có “Copy graph link”. StepDSA cần tương đương.

**Cách làm:**
- `src/utils/permalink.ts`:
  - `encodePermalinkInput(data)` / `decodePermalinkInput(raw)` dùng **LZString** (đã có sẵn dependency) → JSON nén, URL-safe.
  - `parsePermalinkInput(search)` đọc `?input=`.
  - `stableStringify` / `inputsEqual` so sánh input không phụ thuộc thứ tự key.
  - `buildPermalink({ moduleId, step, input, base })` — chỉ gắn `input` khi khác preset.
- `src/App.tsx`:
  - Khi tải trang: decode `?input=`, **validate bằng `generateTimeline`** trước khi nhận; lỗi → fallback preset (không làm vỡ stage).
  - URL sync debounce 250ms giữ `module + step + input`; copy link dùng cùng payload.
  - Bỏ qua sync khi đang mở CLI trace `#trace=`.
- `StepperControls`: tooltip “Copy link to this step (includes custom input)”.
- Test: 11 test helper (round-trip array/object/string, payload hỏng, key order) + 1 test App deep-link `?module=bubble-sort&step=2&input=<custom [77,66,55]>` xác nhận stage nhận đúng mảng và URL giữ `input=`.

**Kết quả:** link chia sẻ giờ tái lập **đúng input + đúng frame**, không chỉ đúng module.

---

## 6. Roadmap cập nhật (ưu tiên từ round 3)

- **P1 — làm ngay sau đợt refactor module:**
  1. **Compare mode** cho sorting: cùng một mảng, chọn 2–6 thuật toán, một transport, hiển thị song song + đếm compare/swap. Học USFCA ComparisonSort + Toptal.
  2. **Strategy toggle** cho DP: Recursive / Memoized / Table / Greedy (coin-change, LCS, Fibonacci), dùng lại timeline của từng biến thể. Học USFCA.
  3. **Graph representation panel**: Logical / Adjacency List / Adjacency Matrix trong stage của BFS/DFS/Dijkstra/Prim/Kruskal/Floyd/Topo. Học USFCA.
  4. **Operation console** cho BST/Heap/Stack/Queue/Hash: ô nhập + Insert/Delete/Find/Push/Pop. Học USFCA.
  5. **Nâng recursion-trees** theo VisuAlgo: node = (arg, value), màu repeated/base, stats, DAG mode khi memo.
- **P2:**
  6. Graph editor kéo/thả đỉnh-cạnh + trọng số + “Copy graph link” (Graph Online).
  7. Speed slider + Focus mode (Clement/USFCA).
  8. “Variants” + “Implementations” cross-link trong TheoryDrawer (sortvisualizer).
  9. Pitfall ❌/✅ pairs + `relatedModules` chips (algomooc).
  10. Proficiency exercise + fix/model answer cho 10 module trọng tâm (OpenDSA).
  11. A* heuristic/diagonal/weight controls (PathFinding.js).
- **P3:**
  12. Explorable explanation: mini-stage trong TheoryDrawer (Bostock/Setosa).
  13. Voice narration (algomooc) — cân nhắc chi phí.
  14. Animation nhúng trong mạch lý thuyết (hello-algo).
  15. Autoplay preview + Big-O label trên dashboard card (PyAlgoViz).

---

## 7. Evidence index

### 7.1 USFCA — capture evidence (48 trang)

| Trang | Evidence |
|---|---|
| AVLtree | `ev_492519073b906ff7bd01f7a04806e14edc3bc5689bc4f04d4951f013828affdd` |
| BFS | `ev_47ce3dd0b051459c6ed50b38c0a04f401806c08c4528dbfa6e48fefc416a118b` |
| BinomialQueue | `ev_82004f51f384fd179fe235503039fc23b76848a3a42f05a050e67b4057f508e2` |
| BPlusTree | `ev_84a1441929747336ee4aebbd8842a131868974353c7e241d7fd988fe5e17a303` |
| BST | `ev_1fd29fb6bf582c2f208f555962895427434e55d2e55f83db95d8f4fab505680b` |
| BTree | `ev_4c933326adc5b69da011f5988a4f2f9d3df2887abdd952c031e42eb700579f96` |
| BucketSort | `ev_7c57ee1067a3a90487ce0d0682e7c69f0622d155e99e52d33e97edba23357123` |
| ChangingCoordinates2D | `ev_31bfc4bdde6707527937fd5c357d3f092791e4bc4bce6e2d89cfcb0c50550113` |
| ChangingCoordinates3D | `ev_284652bb58233b47c149075938f0e6044ee6eb5c01ea8a9445a3ac3ac39fa98c` |
| ClosedHashBucket | `ev_f4ed56df02cc03f38d7efacf8bb4a80ecc5fe8254fe5e920c8ead7f2bfcd3970` |
| ClosedHash | `ev_de355096eeed446528b86dbdec06a3bd714a78db50fea6092a712504512b008c` |
| ComparisonSort | `ev_5f260b72e1e17bbe457d5e4554e79cc235c3401c053894723b8f85803470a81a` |
| ConnectedComponent | `ev_e17c6bee9a55964b5f007465db14b5f945be54db31e6195217db4827d313cfb2` |
| CountingSort | `ev_ffad6c47c410746b7f6072bdddfa553ad3beb0a28e1fa0a32ef3e594520504e3` |
| DFS | `ev_26229ec1bcd0541c9a6257dfe44614576ed28d502890ea36ce73af83c8927397` |
| Dijkstra | `ev_0c7fba1cab9136ffcd27700015b4a46a8524f44f570ac8879e2e9c179f6f70a3` |
| DisjointSets | `ev_55c294b38fa25a1a738313be1f2803b6db7d6dc7206d4b65b6e09302250938cf` |
| DPChange | `ev_5693f6006fa87f692fe242d8f44288f52971e63b60f946bcb4c04fbbeebcfb8b` |
| DPFib | `ev_f4a1aa1ce040d090347393d34c3d855c86a7981a8083c671c26a79a88d52b0b4` |
| DPLCS | `ev_b56e354ff824a25001c655bc022621725f3ad9bd3b736bb1d3a1925b195ae0b9` |
| FibonacciHeap | `ev_e0499815ee2d7179ce3f2735d29b9f6f9eff956d20e3964a88ef488768d13361` |
| Floyd | `ev_6ac4f72dd4754ded15435ff2c581b042e6c7dcbe20937ded7d5b5c25cc8e5d3b` |
| Heap | `ev_ad20cfbfe407c9a52d67d4c945e9c22daf192889d996e9127affacd0f02612f7` |
| HeapSort | `ev_d4ec1ed7bb94352447840f31d7e38ed52814d50d5439cdc4beb5c3c57ab36204` |
| Kruskal | `ev_5912b01f8d6bd9ad485c7b4f0842eef177cee7398bc60145d33923dbfc3ab56e` |
| LeftistHeap | `ev_8fb186fb865008938ce6f613a7db1e3967b668be4f6f61e0d041669d035bbe7b` |
| OpenHash | `ev_b3bf1a0d724b5daf3a7eed2cbe66672b73fab369ab133ac663b95e0a85873254` |
| Prim | `ev_8515a46e01367f626ba0d67b66ddc659dcf62c46a1a90088ee739352834e9461` |
| QueueArray | `ev_b1794a1a993a7eeab78079d0a8cc690c77acd8cc87625ade34826013189884b1` |
| QueueLL | `ev_b9f12dc49f1082ae9aa827c25f4179d6bd6fe7425460634a6fe29ee0ee3af88f` |
| RadixSort | `ev_5a73304d4ff22d6d9dd27a002915ac1045b9e9b496201c3bcb7dbf0200592472` |
| RadixTree | `ev_fb31628a4d5ac2fa7ba1f79ec11e1e905e381ef31f823d8e09222a4d7eff582a` |
| RecFact | `ev_29dbcf1553b9fdf9a91b4b573f5f7c994fee459541c653f1aa1eec96f30a9a49` |
| RecQueens | `ev_e2b6424c9f65d59f6a9c39aeb9263c47e0d1bbebb90de6aaa29395df32389f67` |
| RecReverse | `ev_19fb08f3281664c5208a11aa549a490005f5ce1699ffa714e577791b77133168` |
| RedBlack | `ev_dbfaa078d903fb02dafd5b9b08b7a82f57b205d3db14edd02b6d3839d99a49a1` |
| RotateScale2D | `ev_fbcd591abe9a53916c80eeff13d4dc86eb5f7b13e825fa45b98fbfff87fe0b74` |
| RotateScale3D | `ev_2d906c03000d2ce726fb0034887134ee8c995524c9d6154e2f7ab70cc98f904a` |
| RotateTranslate2D | `ev_59378a30854756700d456347f2aec0e3bbe8fa0ebed628cf7ceb56437494700b` |
| Search | `ev_f8cbc7c8cd7e3e4a1cebd77581ef14877ec9092cc88b1359ac413875e590ebac` |
| SkewHeap | `ev_a2b2a1dbd7a4eb1877090ac02ae79cfc298ef333b9d2d8cd7366ed888695c125` |
| SplayTree | `ev_4311a08d0677edd406660ab8aef3b8cf27f9d5659093184dc67c6baf1e5a3363` |
| StackArray | `ev_347ef1439d58a828c56184e53d2514e219d1f81f123ab487329aa9c5f91b7312` |
| StackLL | `ev_9e9b3c42716679f5a3c0864b54c1c07c18d7fc1cad69bc8b1b1b8c0208396c9e` |
| TopoSortDFS | `ev_67b1278b6e8495e1026e0d4c2684582dcfd094470e3e1e77960203b8bf2c04f9` |
| TopoSortIndegree | `ev_ec6404567c677996471347e984c922bb525a695acb8d2476aa532ee7cab80d76` |
| Trie | `ev_8c09f051c25a2e01ea4f77379925a1a910ab4b035c8efc37e25dc797ae1649b7` |
| TST | `ev_16e30d70a1e25775243e221788c6cc6f5fa72181c4c593547b3f705ec3259601` |

### 7.2 Modern sites

| Trang | Evidence |
|---|---|
| USFCA Algorithms index | `ev_1697d17a94b9549db218e5aa5035accaa6a2c68e5a5480aae1000d6c568b2393` (open), `ev_2a223d44fbdac775b1da867373c3fd98715cf35cb2f9fff90a7c011ccde51ff3` (capture) |
| sortvisualizer landing | `ev_3945936d3d43fd7df7349adab677000b9c449f775920288c78b23b171a741350` (open), `ev_d7f989599bc303a18ad1083a6f6834159a7e60ca888eaba68d084485079b3210` (capture) |
| sortvisualizer /bubblesort | `ev_404461006083fc079c16a3f606ac3afa5ac452cb8ec272f82bafaf9173f79881` (open), `ev_bdd7c65170ea06e36760ac405d45a2b9cf7987742d9a458172979d2ffd50ee09` (capture) |
| sortvisualizer /quicksort | `ev_c20419125c60e16372dbdc26c0253b4ef106b49a136e8a1710885077e1fab7e2` |
| Clement Sorting Visualizer | `ev_8473b2d30a24bee697fbc8f8be1b5271bd4bb80057a351568cb1076874a815d0` (open), `ev_77b51a78f443db194102e3b5dfe92c5252e923a301e400d1e407c63e7431f734` (capture) |
| Princeton /visualizations/ (404) | `ev_a375c8f11592de68b20cf323d7cc78646cabe4c2fa389b7bf349428f18b33cb9` (open), `ev_8a86446375e7401750c8eb0038aecbe7ea45d966c125ad60e2d184b235e18707` (capture) |
| Princeton 2.1 Elementary Sorts | `ev_a2fe9148bfa8348c557e041a5cb17b0dd4aa1e8a76423a6c0593a1fd2e9dab8d` (open), `ev_cc7b636d5660156c893b36fc208fb87c2e7b6512fd82c4a0d42398f7c0e28164` (capture) |
| Princeton 3.2 BST | `ev_32d13dd9e06bb5c3b6deebe95f5cadee5cf3cfec5315b335ab5a9bd3f751e5d5` (open), `ev_148a7fb7fa47b375b27d5d49c3c0b9b2ef303f74e233ae8624a85b3e7c51fce2` (capture) |
| Princeton 3.3 Balanced Search Trees | `ev_7f87b4671ae9279ee50f37d620208921f8004a4b0fb3a4d43019f7a3817a6006` (open), `ev_447ca65bdec8d76d0e647ac067c67ca7e9359f842c3d6bb08710bfcfb76aaf02` (capture) |
| Algomation (hijacked) | `ev_c3360be0657644a1274e463c92224e931a502ec38a2551128ef95681a53e15be` (open), `ev_532c4a5ec2a92f901be0be7478586ff47d5747e5ded6dfaea1bb84a7055bd354` (capture) |
| PyAlgoViz | `ev_1e7fa7d25a54f1f27265ff9c2598b4361b85222841d792aeeaee55b3aeb71b06` (open), `ev_1f187116631222f874b68a2c3eff333aaf1e616653c8fa101862f1da17bb9695` (capture) |
| Graph Online | `ev_43e99a07690c8d171916da609bec4930077c69c9abd7b49d89a8f8221ec335a8` (open), `ev_e5b58dbd80d18d975dfcc9da2d46c88329acdb8fc35368e40c9276ea36b5acf1` (capture) |
| Setosa | `ev_0b6cb39d606e18b92d66b404d895b75e150b522c54619a65e1c0f375f31cfd93` (open), `ev_b906dbf555877103c97180a6fedf875eed60209727e33ebbbb7e8aa2f21679b1` (capture) |
| Setosa Explained Visually | `ev_013ac0ac0b6489ee10b414dd7be04d6fdba5ebd1755ff937fe9527d6a8442806` (open), `ev_a8ecda8d5ba8dcf8d4366a9532ea2277e65412308de4fc02eef6b070dd5a2521` (capture) |
| Bostock Visualizing Algorithms | `ev_74b3fedbfe3a8a4265845a58fe5a9530b0fed41b7f22a337469fa87ae28cc78d` (open), `ev_73eac931b9a7a7e23fd30d1207091c0b579088dac00803d41703d864b6f7849a` (capture) |
| PathFinding.js | `ev_392a473d0543b49e6b3cb68f4352e86b810c0a4dd090f240dc2c54356f22d23b` (open), `ev_afe333bbff27fc646b21d8fe34d57ec6915b60ee372cc908a01d5ebe3d834f13` (capture) |
| AlgoAnim (dead) | `ev_ade9296a90f25aa5f2f431c8022856035e482016d8a1117209ff10c892ce3c73` (open), `ev_e24a4dba36dd3336f9ba95fe3eff34d377c7977496804d00156f31a22004172a` (capture) |
| CS Academy (blank) | `ev_457d30c6d8d3a9c3df28ed151b610ea6819cc17366e747cd3e8a1bcb6cec5036`, `ev_62a05ef146c0315e3ce70210e712c51354c33842d423a92736d3d7e4218aadf9` |

### 7.3 Giới hạn của round 3

- **JSAV**: không mở được (cert/redirect) — không kết luận về UI live; chỉ dùng báo cáo source OpenDSA.
- **sorting-algorithms.com**: không kết nối được — không dùng làm bằng chứng.
- **Princeton**: chỉ quan sát hình tĩnh trong chương, không có app tương tác.
- **Algomation / AlgoAnim**: domain đã đổi chủ — không còn nội dung thuật toán.
- Các toggle của USFCA (Path Compression, Union By Rank, Preemptive Split/Merge, Show Null Leaves…) mới được **đọc nhãn trong DOM**, chưa thao tác từng cái; báo cáo không khẳng định hành vi chi tiết ngoài nhãn.
