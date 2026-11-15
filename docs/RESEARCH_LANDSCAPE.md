# RESEARCH LANDSCAPE — Bản đồ cạnh tranh & nguồn học hỏi cho StepDSA

> Khảo sát ngày **2026-11-15** bằng GitHub API (số sao thật, lấy trực tiếp) + fetch trực tiếp
> trang chủ/README của từng sản phẩm. Mọi con số ⭐ là thời điểm khảo sát.
> Mục đích: biết StepDSA đang đứng ở đâu, kế thừa gì từ những sản phẩm được cộng đồng
> đánh giá cao nhất, và đề xuất roadmap tính năng.

---

## 0. TL;DR — 8 "đối thủ chuẩn mực" nên học

| # | Sản phẩm | Vì sao đáng học |
|---|---|---|
| 1 | **VisuAlgo** (visualgo.net) | 24 module + e-Lecture + hệ thống quiz tự sinh/tự chấm; input tùy biến kể cả vẽ graph; recursion tree visualizer cho hàm JS bất kỳ; so sánh 2 thuật toán bằng 2 cửa sổ |
| 2 | **hello-algo** (132,335 ⭐) | Sách điện tử animation + code chạy 1 click + đa ngôn ngữ/đa bản dịch; được GS Tsinghua & Mu Li (Amazon) khen |
| 3 | **USFCA David Galles** | Bộ visualizations cổ điển, phủ cực rộng (B+, fibonacci heap, leftist/skew heap, TST, B/B+, DP, geometry…), ổn định 15+ năm |
| 4 | **algorithm-visualizer.org** (49,515 ⭐) | Kiến trúc "visualize algorithms FROM CODE" với tracers.* cho từng ngôn ngữ — mô hình tracer/DSL |
| 5 | **Python Tutor** (25M+ users, 500M+ lượt visualize) | Visual debugger từng bước: stack frames, heap, pointers; teacher mode; được MIT/Harvard/Berkeley… dùng dạy |
| 6 | **Pathfinding Visualizer — Clement Mihailescu** (1,743 ⭐ + bản hướng dẫn 581 ⭐) | UX kéo thả start/goal, maze generators, 2 chế độ animated/instant; đi kèm tutorial + video |
| 7 | **Sound of Sorting — Timo Bingmann** (917 ⭐, GPL) | "Audibilization": so sánh → cao độ, đếm compares/array-access realtime, step mode, speed slider, cheat-sheet PDF |
| 8 | **OpenDSA** | Hạ tầng eTextbook mã nguồn mở + proficiency exercises (thao tác trực tiếp lên CTDL để chứng minh hiểu) + tự chấm |

Bổ sung đáng chú ý: **Toptal sorting** (8 thuật toán × 4 kiểu input, "Play All"), **Red Blob Games**
(bài A* interactive sống trong bài viết), **CS Academy graph editor**, **recursionvisualizer.com**,
**MisterBooo/LeetCodeAnimation** (76,707 ⭐, có web xem từng bước/tua lại/đổi tốc độ/thuyết minh),
**labuladong** (136,063 ⭐), **trekhleb/javascript-algorithms** (196,728 ⭐),
**jwasham/coding-interview-university** (364,390 ⭐).

Ghi chú trung thực: **sorting.at** (visualizer sorting nổi tiếng một thời) hiện KHÔNG còn ở địa chỉ đó —
domain đã thành trang tin kinh tế Áo (Marktwirtschaft.at).

---

## 1. Nền tảng trực quan hóa tương tác (web)

### 1.1 VisuAlgo — visualgo.net
- **Mô hình:** 2011, Gs. Steven Halim (NUS); tài trợ Optiver (2023→); không mã nguồn mở, cấm fork/tải lại.
- **Điểm mạnh đã xác nhận từ chính trang chủ:**
  - **24 visualization pages** + **e-Lecture Mode** đạt chuẩn bài giảng NUS.
  - **Hệ thống Online Quiz**: câu hỏi sinh tự động theo luật, chấm tự động phía server; Training mode mở
    cho mọi người, Test mode cho lớp học; "không script câu hỏi nào" — kho đề vô hạn.
  - **Input tùy biến**, gồm **vẽ graph** cho 9 module graph (Graph DS, DFS/BFS, MST, SSSP, Max Flow,
    Matching, MVC, Steiner, TSP).
  - **Recursion Tree/DAG visualizer**: visualize hàm đệ quy JavaScript bất kỳ (kể cả đệ quy có
    overlapping subproblems → DAG cho DP).
  - **So sánh 2 thuật toán** bằng cách mở 2 cửa sổ cạnh nhau (Kruskal vs Prim…).
  - Trilingual en/zh/id (+ notes tiếng Việt, Hàn, Thái), mobile lite từ 2022, 2 scale 1.0x/0.5x,
    list module (không auto re-layout để thấy O(1)), tài khoản lưu tùy chọn.
- **Bài học cho StepDSA:** quiz tự sinh + e-Lecture mode + so sánh song song + recursion visualizer
  + vẽ graph input + chế độ scale/compact cho test case lớn.

### 1.2 Data Structure Visualizations — USFCA (David Galles)
- **Link:** cs.usfca.edu/~galles/visualization/Algorithms.html — miễn phí, có bản Java + source.
- **Phủ (đã fetch toàn bộ danh mục):** Stack/Queue/List, Recursion (factorial, N-Queens), Indexing
  (binary/linear search, BST, AVL, Red-Black, Splay, Open/Closed hashing + buckets, Trie, Radix tree,
  TST, B trees, B+ trees), Sorting (6 so sánh + bucket/counting/radix/heap), Heap-like (heaps, binomial,
  Fibonacci, leftist, skew), Graph (BFS, DFS, CC, Dijkstra, Prim, topo×2, Floyd-Warshall, Kruskal),
  DP (fib, change, LCS), Geometry (2D/3D rotation), Disjoint sets, Huffman.
- **Bài học:** độ phủ + độ ổn định + "Create Your Own"; các cấu trúc StepDSA nên soi lại:
  **B+ tree, binomial/Fibonacci/leftist/skew heap, hashing open/closed + buckets chi tiết**.

### 1.3 algorithm-visualizer.org — 49,515 ⭐
- **Kiến trúc 3 tầng (từ README):** web app React (UI diễn giải commands) + server (API, chạy/compile,
  GitHub sign-in) + repo `algorithms` (nội dung side menu) + **`tracers.*`** — thư viện visualization
  theo từng ngôn ngữ, "extract visualization commands from code".
- **Ý tưởng cốt lõi:** người dùng *viết code thật*, code được tracer chèn lệnh vẽ → xem chính code
  mình chạy. Đây là cấp độ sâu nhất mà StepDSA chưa có.
- **Bài học:** mô hình tracer/DSL; tách nội dung (algorithms) khỏi engine (app) khỏi runtime (server).

### 1.4 Clement Mihailescu — Pathfinding & Sorting Visualizer (1,743 ⭐ / 667 ⭐ / tutorial 581 ⭐)
- Pathfinding: kéo thả start/end, vẽ tường, **maze generators** (đệ quy backtracker…), weights,
  animated vs instant, chọn thuật toán BFS/DFS/Dijkstra/A*/Greedy/Bi-directional.
- Sorting 667 ⭐ + **tutorial repo 334–581 ⭐** dạy cách làm lại từ đầu (nội dung "học bằng cách build").
- **Bài học:** UX trực tiếp trên lưới, maze generator, chế độ instant cho test lớn, kèm tutorial.

### 1.5 Sorting visualizers & "audibilization"
- **Toptal** (toptal.com/developers/sorting-algorithms): lưới 8 thuật toán × 4 initial conditions
  (Random/Nearly Sorted/Reversed/Few Unique), nút "Play All", chú thích màu (sorted/unsorted/pointers),
  thảo luận stable/adaptive/in-place — mẫu "so sánh đa thuật toán" rất tốt.
- **Sound of Sorting** (917 ⭐, panthema.net/2013/sound-of-sorting, GPL v3): `WMain` (GUI) + `WSortView`
  (mảng bị instrument, `swap()`, `mark()`, `watch()`) + `SortAlgo` (thuật toán) + `SortSound`
  (Oscillator, sóng tam giác + ADSR, map giá trị → 120–1212 Hz). Step mode, speed slider,
  đếm **compares + array accesses realtime**, SoS-CheatSheet.pdf, video viral (15 sorting in 6 min).
- **Khác:** clement Sorting 667 ⭐, LucasPilla 459 ⭐, w0rthy 117 ⭐ (audiolize + profile runtime),
  "22 Algorithms, 30 Visuals" 69 ⭐. Nổi tiếng cộng đồng: bubble/select-sort dance của Sapientia University.
- **Bài học:** (1) audibilization thật bằng Web Audio (StepDSA đã có `soundCue` — nâng cấp thành
  "nghe được thuật toán"), (2) lưới so sánh nhiều thuật toán cùng input, (3) đếm chỉ số realtime
  + bảng runtime, (4) cheat-sheet xuất PDF.

### 1.6 Red Blob Games — bài A* tương tác
- Interactive diagrams sống trong bài viết (kéo blob start/end, xem frontier lan), code Python ngắn
  theo từng phần, so sánh trực quan BFS/Dijkstra/Greedy/A* cạnh nhau.
- **Bài học:** scrollytelling — mỗi khái niệm là 1 khối tương tác; StepDSA có thể tái dùng engine để
  nhúng "mini-visualizer" vào phần lý thuyết của chính module.

### 1.7 CS Academy Graph Editor
- Editor vẽ graph online được cộng đồng competitive programming dùng để tạo test/đề. Bản thân
  StepDSA đã có playground JSON; **kéo thả node/edge** là bước tiếp theo.

### 1.8 Recursion visualizers
- **recursionvisualizer.com**: dán hàm Python → cây đệ quy; preset virfib/count_partitions/luhn_sum;
  permalink + `&hide_function=true`; mã nguồn mở.
- **brpapa/recursion-tree-visualizer 523 ⭐** (JS/Python/Go), pamelafox/recursive-visualizations 66 ⭐,
  Bishalsarang 117 ⭐, dmytrobaida/recursion-viewer 37 ⭐ (kèm VS Code extension).
- **Bài học:** đệ quy là nỗi đau số 1 của người mới — đầu tư 1 module "chạy hàm của bạn → cây đệ quy"
  (StepDSA đã có recursion-trees; có thể nâng thành input tùy biến + permalink).

### 1.9 Python Tutor — pythontutor.com
- **Con số chính thức:** 25M+ người dùng từ 2010, 500M+ lượt visualize, 180+ quốc gia, 10.000+ trường;
  dùng tại MIT/Harvard/Princeton/UC Berkeley/Tsinghua/IIT.
- 5 ngôn ngữ (Python/Java/C/C++/JS), visualize **biến, object, pointer, cấu trúc dữ liệu, stack frames**;
  Teacher mode; embed được.
- **Bài học:** visual debugger (không phải chỉ minh họa thuật toán); "guess next step" trong lớp học;
  permalink/embed — StepDSA chưa có chia sẻ link trạng thái.

### 1.10 OpenDSA — opendsa-server.cs.vt.edu
- Hạ tầng eTextbook mã nguồn mở (NSF tài trợ) + JSAV; giáo viên tự tạo "sách" chọn từ kho nội dung;
  **proficiency exercises**: sinh viên *thao tác trực tiếp lên CTDL* (chứng minh hiểu) chứ không chỉ
  trắc nghiệm; nhiều loại bài (viết code nhỏ, bài tương tác, câu hỏi kiến thức).
- Repo gốc 383 ⭐ (nhưng là dự án học thuật quy mô lớn).
- **Bài học:** proficiency exercise + "build your own textbook" + tự chấm.

### 1.11 hello-algo — 132,335 ⭐
- Sách điện tử minh họa animation, code chạy được 1 click, **12 ngôn ngữ lập trình**, bản dịch
  zh/en/ja/ru/ko/zh-hant; miễn phí, CC BY-NC-SA.
- Trích dẫn đánh giá trong README: GS. Đặng Tuấn Huy (Đại học Thanh Hoa) — "rất khuyến khích cho
  người mới"; Mu Li (Principal Scientist, Amazon) — "nếu có Hello Algo hồi đó tôi học dễ gấp 10".
- **Bài học:** định dạng "sách + animation + code chạy", phát hành PDF/EPUB, cộng đồng dịch,
  tách chương rõ ràng cho từng CTDL.

---

## 2. Kho repo/khóa học lớn (chuẩn cộng đồng, không trực quan)

| Repo | ⭐ | Giá trị |
|---|---|---|
| jwasham/coding-interview-university | 364,390 | Lộ trình học CS tự học kinh điển |
| TheAlgorithms/Python | 226,126 | Cài đặt mọi thuật toán |
| trekhleb/javascript-algorithms | 196,728 | Giải thích + link đọc thêm từng thuật toán |
| labuladong/fucking-algorithm | 136,063 | "Crack LeetCode, not only how, but also why" — framework tư duy |
| MisterBooo/LeetCodeAnimation | 76,707 | Animation ~60 bài LeetCode; **bản web có từng bước/tua lại/đổi tốc độ/thuyết minh thoại** |
| TheAlgorithms/Java | 67,254 | Cài đặt Java |
| kdn251/interviews | 65,554 | Tổng hợp phỏng vấn + giải thích |
| OI-wiki/OI-wiki | 27,163 | Wiki OI/ICPC cộng đồng (TQ), cực chi tiết |
| cp-algorithms/cp-algorithms | 11,516 | Bản dịch e-maxx — chuẩn mực cho CP |
| DMOJ/online-judge | 1,202 | Nền tảng chấm bài (VNOJ dùng nền này) |

**Việt Nam:** VNOJ/VNOI (vnoi.info) — judge cộng đồng dựa trên DMOJ, **430+ tổ chức, 10M+ lượt nộp,
là hệ thống chấm chính thức ICPC Vietnam National & Regional 5 năm liền (2021–2025)**, tổ chức
VNOI Cup, có wiki + tạp chí. Note tiếng Việt của VisuAlgo tồn tại (link "vn" trong About), cho thấy
nhu cầu học DSA qua tiếng Việt là thật — **StepDSA nên i18n việt+anh sớm**.

---

## 3. Game hóa học thuật toán (tham khảo định hướng)

- **while True: learn()** — game về ML (mô phỏng khái niệm bằng puzzle).
- **Human Resource Machine / 7 Billion Humans** (Zachtronics) — lập trình bằng kéo thả lệnh, độ khó tăng dần.
- **Turing Complete** — xây máy tính từ cổng logic (được cộng đồng CS đánh giá rất cao).
- **The Farmer Was Replaced** — lập trình Python điều khiển nông trại (2024, đánh giá Very Positive).
- **TIS-100 / Shenzhen I/O / EXAPUNKS** (Zachtronics) — lập trình hệ thống, puzzle.
- **Screeps: World**, **CodeCombat**, **CodinGame** — code để chơi/đấu.
- **Algorithm City** (mobile) — game puzzle dạy thuật toán cơ bản cho trẻ.

> Ghi chú: mục này mang tính định hướng gamification; số liệu nền tảng game cần kiểm chứng lại
> khi làm feature thật (xem Unknowns).

---

## 4. Video/kênh animation (style & nội dung)

- **Abdul Bari** — khóa Algorithms huyền thoại (bảng trắng, trực quan bằng tay).
- **Reducible** — animation chất lượng cao (nén dữ liệu, A*, Fourier…), cộng đồng đánh giá rất cao.
- **William Fiset** — DSA + visualization từng bước.
- **Back To Back SWE**, **Michael Sambol** (animation ngắn 1 khái niệm), **TechWithTim**.
- **The Coding Train** (Daniel Shiffman) — p5.js + thuật toán (A*, genetic, sorting) — cầu nối
  "creative coding ↔ thuật toán".
- **Computerphile / Spanning Tree** — giải thích khái niệm.
- Kinh điển viral: "15 Sorting Algorithms in 6 Minutes" (Bingmann), bubble/selection sort
  Hungarian dance (Sapientia University) — được Toptal trích dẫn.

---

## 5. Thư viện/công nghệ để nâng cấp StepDSA

| Mục đích | Thư viện |
|---|---|
| Nhúng diagram tương tác vào lý thuyết | D3.js, p5.js |
| Animation mượt trong React | framer-motion, GSAP |
| Audoibilization (âm thanh theo giá trị) | Web Audio API, Tone.js |
| 3D (kd-tree, octree, pathfinding 3D) | Three.js / react-three-fiber |
| Graph lớn | Cytoscape.js, Sigma.js |
| Sách/PDF/EPUB | VitePress/Docusaurus + pandoc (hello-algo dùng mô hình này) |
| Tracer đa ngôn ngữ (dài hạn) | Mô hình tracers của algorithm-visualizer; Python Tutor dùng chạy code sandbox |
| Bài tập tương tác | JSAV (OpenDSA) hoặc tự viết trên engine StepDSA |

---

## 6. StepDSA đang hơn/thiếu gì so với top?

**StepDSA đang hơn:**
- 162 module — nhiều hơn VisuAlgo (24) và gần bằng/nhiều hơn Galles (~80); độ phủ thuật toán hiện đại
  (timsort, introsort, Dinic, Hopcroft-Karp, tarjan, boruvka, bogo/stooge/sleep sort…) tốt hơn cả hai.
- **Deterministic time-travel engine + timeline frames**: sâu hơn mô hình "animation" thông thường
  (frame bất biến, audit được — có `timelineAudit`).
- **Pedagogy WHAT/WHY/NEXT + prediction checkpoint** trên từng bước — gần như chưa nơi nào có ở mức
  từng frame (VisuAlgo có e-lecture theo trang, OpenDSA có proficiency exercise theo bài).
- Code panel 5 ngôn ngữ + pseudocode chuẩn hóa theo line mapping.
- Milestones/jump-to-step, playground input.

**StepDSA đang thiếu (theo mức ưu tiên):**
1. **Quiz/training hệ thống + lưu tiến độ** (VisuAlgo, OpenDSA) — checkpoint hiện có mới là popup 1 câu.
2. **Chia sẻ/permalink + export GIF/video từng bước** (Python Tutor embed, LeetCodeAnimation web).
3. **Input tùy biến mạnh: kéo thả graph/grid editor** (CS Academy, Clement).
4. **Audibilization thật** cho sorting (Sound of Sorting).
5. **E-Lecture mode / slide auto-play** theo milestones (VisuAlgo).
6. **Chế độ so sánh 2 thuật toán song song** (VisuAlgo juxtaposition, Toptal Play All).
7. **i18n vi/en** (hello-algo; nhu cầu VN đã được xác nhận gián tiếp).
8. **Recursion visualizer từ code người dùng** (recursionvisualizer.com, brpapa).
9. **Proficiency exercises** — bắt người học thao tác hoàn thành thao tác (OpenDSA).
10. Bổ sung vài visualizations còn thiếu so với Galles: **B+ tree, binomial/Fibonacci/leftist/skew heap,
    hashing open/closed + buckets**.
11. **Mobile-lite/PWA** (VisuAlgo mobile lite).
12. Code tracer đa ngôn ngữ (algorithm-visualizer) — dài hạn, đắt.

---

## 7. Roadmap đề xuất (kế thừa có chọn lọc)

- **P1 (ngắn hạn, 1–2 batch):** i18n vi/en; nút "Share this step" (URL chứa module+frame);
  export ảnh/GIF một bước; nâng checkpoint thành "quiz mini" 3–5 câu/module.
- **P2:** graph editor kéo thả; so sánh 2 module cạnh nhau (split view); audibilization sorting.
- **P3:** e-Lecture auto-play theo milestones + narration; proficiency exercise cho 10 module trọng tâm;
  recursion visualizer input tùy biến.
- **P4 (dài hạn):** tracer đa ngôn ngữ; mobile lite; PDF/EPUB song song như hello-algo.

---

## 8. Nguồn & ghi chú độ tin cậy

- Số ⭐: GitHub REST API, 2026-11-15 (repo + search API).
- VisuAlgo facts: fetch trực tiếp visualgo.net/en (About/Terms/Privacy trên trang).
- USFCA: fetch trực tiếp danh mục Algorithms.html.
- Toptal: fetch trang sorting-algorithms.
- Sound of Sorting: fetch panthema.net/2013/sound-of-sorting (README + changelog).
- Python Tutor: fetch pythontutor.com (số liệu trên trang).
- OpenDSA: fetch opendsa-server.cs.vt.edu + GitHub org.
- VNOI: fetch vnoi.info (trang chủ + thông báo chính sách).
- recursionvisualizer.com: fetch trang chủ.
- **sorting.at: domain đã bị đổi mục đích** — không còn là sorting visualizer.
- Mục game/video ở §3–§4 viết theo hiểu biết chung, CHƯA fetch số liệu — cần kiểm chứng khi làm
  feature gamification (đã ghi vào Unknowns của phiên craft-anything).

## 9. Unknowns (cần điều tra tiếp bằng craft-anything)

- VisuAlgo làm quiz/training & e-Lecture chính xác thế nào (cấu trúc trong bundle)?
- Clement Pathfinding Visualizer tổ chức maze generator + animation ra sao?
- Toptal sorting page điều khiển "Play All" thế nào?
- algorithm-visualizer tracer DSL có thể học gì cho StepDSA?
- LeetCodeAnimation "web từng bước/tua lại/đổi tốc độ/thuyết minh" triển khai thế nào?
