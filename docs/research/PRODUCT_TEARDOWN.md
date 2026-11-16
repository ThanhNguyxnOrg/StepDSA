# PRODUCT TEARDOWN — Tổng hợp điều tra các nền tảng visualizer (2026-11-15 → 16)

> Kết quả của giai đoạn "research + craft-anything" trước khi quay lại refactor 162 module.
> Gồm 3 loại bằng chứng: **(S)** đọc source có file:line (5 báo cáo trong `docs/research/`), **(L)** quan sát live qua craft-anything (Chrome riêng tư + a11y + screenshot + walkthrough script), **(F)** thông tin fetch công khai đã ghi trong `docs/RESEARCH_LANDSCAPE.md`.
> Mọi claim chưa xác minh đều ghi rõ. Toptal bị Cloudflare chặn (ghi trung thực, không quan sát live được).

---

## 1. Bản đồ điều tra

| Sản phẩm | Cách điều tra | Bằng chứng chính |
|---|---|---|
| VisuAlgo | (L) sorting module + training quiz + recursion tool | evidence ids phiên 2026-11-16 (xem §3); phiên 15/11 có screenshot (đã xem trực tiếp, file tạm bị dọn khi server restart) |
| algorithm-visualizer | (S) 1 commit shallow, 4.021 dòng src | `docs/research/algorithm-visualizer.md` |
| The Sound of Sorting | (S) GPLv3 — chỉ học ý tưởng | `docs/research/sound-of-sorting.md` |
| Clement Pathfinding + Sorting Visualizer | (S) 2 repo snapshot | `docs/research/clement-visualizers.md` |
| brpapa/recursion-tree-visualizer | (S) monorepo web+lambda+terraform | `docs/research/recursion-tree-visualizer.md` |
| OpenDSA | (S) repo 219 MB (RST + Python toolchain + JSAV vendor) | `docs/research/opendsa.md` |
| Toptal sorting | (F) fetch công khai; (L) **bị Cloudflare chặn** | finding craft-anything: Toptal blocked |
| Python Tutor | (L) edit page + iframe-embed chạy thật | ev_9f1768fc… / ev_b6804e21…(embed), ev_b1a19162…(edit page) |
| recursionvisualizer.com | (L) preset virfib + Visualize! | ev_ab435170… / ev_78dd983c… |
| LeetCodeAnimation web | (F) chưa điều tra sâu — ghi nhận là việc còn lại | — |

---

## 2. VisuAlgo — quan sát live (chi tiết)

### 2.1 Nền tảng kỹ thuật
- Server-rendered HTML + **Bootstrap 5** (biến `--bs-*`) + **jQuery 3.6 + 3.7 + jQuery UI** + **D3 3.5.16 + D3 7** (kèm `d3-force-boundary`).
- Engine riêng: **`js/viz-1.0.10.js`** + **`js/graph_library-1.0.13.js`** và các module `graph_library/` (Widget, GraphWidget, GraphVertexWidget, GraphEdgeWidget, GraphPolygonWidget, GraphTextWidget, drawgraph, force_directed_library, helperObjects) + `param_parser.js`. Không dùng framework SPA.
- i18n: en/zh/id (+ ghi chú vi/ko/th trong About).

### 2.2 e-Lecture Mode (mặc định cho khách chưa login)
- Hệ **slide có timeline + checkpoint**: `#e-lecture-timeline`, `.e-lecture-timeline-slide`, `.e-lecture-timeline-checkpoint`, `#e-lecture-f1map`; đếm `slide 1 (1%)`.
- Điều khiển: PageUp/PageDown đổi slide, **Esc toggle e-Lecture ↔ Exploration**, nút đóng `.electure-end` (hàm `end_eLecture()`), nút ✍ "Print the e-Lecture note".
- Slide có **câu hỏi quiz nhúng**: ids `mcq-answer-*` (trắc nghiệm 1 đáp án), `msq-3-choice-*` (nhiều đáp án), `answer-status-*` (trạng thái chấm).
- Panel "script" nổi giữa canvas hiển thị lời giảng; nhắc "Remarks: By default, we show e-Lecture Mode for first time (or non logged-in) visitor."

### 2.3 Exploration Mode (module Sorting)
- Tab 8 thuật toán: `BUBBLE SORT | SEL | INS | MER | QUI | R-Q | COU | RAD`.
- Panel Actions (trái): **Create(A)** với các nhóm preset: `create-random`, `create-sorted` (+ non-decreasing/non-increasing), `create-nearly-sorted` (3 mức), `create-many-duplicates`, **`create-userdefined-input`** (+ biến thể), và nút **Sort** — biến thể `recursiveSort(true/false)` cho thuật toán đệ quy, `countingSortStable()` cho Counting Sort.
- Panel phải: **`#current-action`** (nhãn hành động, ví dụ "Bubble Sort") + **`#codetrace`** (khung code gồm `code1..code7` — 7 dòng cho Bubble Sort) bật/tắt bằng `panel-hide`; có nút "show/hide status panel" và "show/hide codetrace panel" (title).
- Thanh playback đáy: `goToBeginning / stepBackward / play / pause / stepForward / goToEnd` + thanh tiến độ; góc trái là slider scale **1.0x/0.5x**; nav có **Share**.
- Canvas vẽ bằng SVG (bars + label giá trị + chỉ số dưới).

### 2.4 Training (hệ quiz tự sinh)
- URL: `/training?diff=Medium&n=7&tl=0&module=sorting` — **tự sinh n câu theo module + độ khó**; `tl=0` = không giới hạn thời gian; hiển thị `ANONYMOUS, DIFF: MEDIUM`.
- UI: **1 câu/trang** + textbox trả lời ("Enter your answer"/"Enter a number") + **SUBMIT QUIZ** + thanh đáy `PREV QN | 1 2 3 4 5 6 7 | NEXT QN`.
- Dạng câu: tự luận số (ví dụ "Quicksort đã partition xong, hỏi có bao nhiêu phần tử có thể là pivot"), **MCQ** (`mcq-answer-*`), **MSQ** (`msq-*`).
- Nộp thiếu câu → dialog "You have not answered all the questions. Are you sure you want to end the quiz? (Yes/No)".
- **Đề đổi ngẫu nhiên mỗi lần tải** (2 lần tải cho 2 câu Quicksort khác nhau).

### 2.5 Recursion tool (visualgo.net/en/recursion)
- 3 chế độ: **RECURSION TREE / RECURSION DAG (DP) / MASTER THEOREM**.
- Panel nhập: combobox preset (Fibonacci, Binomial C(n,k), 0-1 Knapsack, LIS, Coin Change, Cutting Rod, Matrix Chain, LCS, Graph Matching, TSP, Merge/Quick analysis, mục 3-1 Factorial/Binary Search/Modulo Power/GCD/Max Range Sum/Catalan…), **textarea code sửa được** (body hàm), ô `#arguments_textBox` (n=6), nút **Run** (`go()`); có hỗ trợ **input 2D** (`#array-area`, `twoDimInputDone/Cancel`).
- Node = **(đối số, giá trị trả về)**; màu theo trạng thái: current đỏ, repeated teal, base case xanh.
- **Stats live**: "Number of subproblems visited / repeated (excluding base cases) / times base cases visited":
  - Tree fib(n=5): 15 / 3 / 8.
  - DAG fib(n=6): 7 / 0 / 2 (memoized — mỗi subproblem 1 lần, node xếp theo thứ tự tô-pô).
- Playback từng frame; scale 1.0x.

### 2.6 Bài học cho StepDSA (VisuAlgo)
1. **e-Lecture timeline + checkpoint** → StepDSA có thể thêm "chế độ bài giảng" auto-play theo milestones sẵn có (P2), kèm phím PageUp/PageDown/Esc.
2. **Quiz nhúng ngay trong luồng học + trang Training tự sinh theo module/difficulty** → mở rộng checkpoint 1 câu hiện tại thành quiz mini 3–5 câu, nhiều dạng (số/MCQ/MSQ), chấm tại chỗ (P1).
3. **Codetrace panel khớp code1..code7** → StepDSA đã có code panel + line mapping; bổ sung nhãn "current action" (status ngắn mỗi frame) lấy từ pedagogy WHAT/NEXT.
4. **Preset input chuẩn hoá theo nhóm** (random/sorted/nearly-sorted/duplicates/user-defined) → chuẩn hoá `presets` cho các module sorting (P1).
5. **Recursion Tree/DAG với stats lặp** → nâng module recursion-trees của StepDSA: hiển thị (đối số, kết quả) trên node, tô màu repeated/base, đếm subproblems — và bản DAG khi bật memo (P3).
6. **Nút Share + scale 1.0x/0.5x** → permalink bước + chế độ compact cho test lớn (P1).

---

## 3. Ghi nhận bằng chứng (evidence ids phiên craft-anything 2026-11-16)

| Quan sát | Evidence |
|---|---|
| VisuAlgo recursion: đóng e-Lecture, cấu trúc tool + stats | ev_c1bcd41dfdb8b22c7df6cf9962b122c7f961f6f32b1f621530b4bde0d4bef784 |
| VisuAlgo recursion: capture explore (ảnh + HTML) | ev_4660f5d26931ca6bcdfaca3c8f95761083e78215625fe973e1ce56324d6c83fa |
| VisuAlgo recursion: click tab DAG (stats 7/0/2) | ev_18aecaa39d28220e1340ea86141cf1e9182ff3da91e7bc2747cfd55fdfe733eb |
| VisuAlgo recursion: capture DAG | ev_779b1a273dd6418c03a6c8864737eb833436f67d41167e2290b2e64242fc5781 |
| Toptal: bị Cloudflare chặn | ev_caa7f43b280f0d844695bc6d3636cbc2d30884419db304c12620b9f37d92b3d6 |
| Python Tutor: trang edit + options/permanent link/Teacher Mode | ev_b1a191622a6e927535f850b0d2a1d75d80663dd217038c7826fd902eb4e13291 |
| Python Tutor: embed chạy thật (Step 1 of 3, Frames/Objects) | ev_b6804e21e6e9eebad430c344eed1e9e5a441f19f50ff7f5bf74a2ff1ba9c2300 |
| recursionvisualizer: preset virfib + Visualize! | ev_ab435170132984789a2aa1b38a77721e1de3e5fd0257a2b0ab610dbf6719317d |
| recursionvisualizer: capture | ev_78dd983c27e4c2c2aa8ce622ddde00035aa4dc052a6d7d7ab3304b5e4a44b69c |

> Lưu ý trung thực: các quan sát VisuAlgo sorting/training (e-Lecture, exploration, codetrace, quiz) diễn ra ở phiên 2026-11-15; server craft-anything restart giữa chừng làm mất evidence id của phiên đó (memory lưu theo session, không có project). Nội dung đã được quan sát trực tiếp (ảnh + accessibility tree) và ghi lại trong tài liệu này; không thể trích ev id cũ.

---

## 4. Python Tutor — quan sát live

- Trang edit (`visualize.html`): editor + combobox ngôn ngữ (Python/Java/C/C++/JS); checkbox **"show strings and numbers as objects"**, **"show list-of-lists as 2D array"**; nút **"Generate permanent link"**; **Teacher Mode** riêng; có quảng cáo (teacher/donate gỡ).
- **iframe-embed chạy thật** (`iframe-embed.html#code=...&mode=display`): render visual debugger đầy đủ — code pane với highlight "line that just executed" / "next line to execute", nút `< Prev` / `Next >`, **"Step 1 of 3"**, panel **Frames** + **Objects**, ô "Print output (drag lower right corner to resize)", link "Edit this code", "Visualized with pythontutor.com".
- Bài học: (1) **permalink trạng thái** (code nằm trong URL hash) — StepDSA nên có URL chia sẻ module+frame+input; (2) **tùy chọn hiển thị** (objects vs primitives, 2D array view); (3) **embed iframe** — StepDSA có thể xuất embed cho LMS; (4) teacher mode + chế độ "guess next step" khi giảng.

---

## 5. recursionvisualizer.com — quan sát live

- UI: heading "Visualize a recursive function"; combobox **preset** (`virfib`, `count_partitions`, `luhn_sum`); textarea "Or paste the function definition here (starting with def):"; input "Type your function call here:" (placeholder `func( 1, 2 )`); nút **Visualize!**.
- Chọn `virfib` → tự điền `def virfib(n): ... return virfib(n-1) + virfib(n-2)` + call `virfib(3)`; bấm Visualize! → trạng thái **"Computing call graph..."** (tính phía backend) rồi vẽ call graph (thư viện **rcviz** — credit @carlsborg; source trên GitHub).
- Bài học: luồng "chọn preset HOẶC dán hàm + nút Visualize + trạng thái đang tính" rất đơn giản để bắt chước; kết hợp với model wrapper `_fn`/`fn` của brpapa (đọc source) và sandbox Web Worker.

---

## 6. Tóm tắt 5 teardown source (chi tiết ở file riêng)

### 6.1 algorithm-visualizer (`docs/research/algorithm-visualizer.md`)
- Command-stream `{key, method, args}` + plugin registry tên-chuỗi→class; **chunk cắt tại `delay(lineNumber)`** → đồng bộ code↔bước (Ace marker).
- Playback: tiến = apply delta, **lùi/seek = reset + replay từ 0** (deterministic).
- Share: gist + `?visualizationId=` + preload SSR; nội dung = workspace file; `.md` render trong chính khung visualization.
- Anti-pattern: không keyboard shortcuts; XSS ở LogRenderer.

### 6.2 The Sound of Sorting (`docs/research/sound-of-sorting.md`) — GPLv3, chỉ học ý tưởng
- **Instrumentation bằng kiểu dữ liệu**: `ArrayItem` overload so sánh (đếm + âm), `SortArray` overload truy cập (đếm + delay) — thuật toán không chứa mã đếm.
- Audibilization: hàng đợi sự kiện + rải lịch trong buffer; `f = 120 + 1200·(v/vmax)²`; tam giác + ADSR; trần 512 voice có **voice stealing**; **AGC** chuẩn hoá gain.
- Step/speed: delay mũ 0→2000ms; step = semaphore mỗi array access.
- 10 gợi ý cụ thể cho bản Web Audio của StepDSA (pool 24–48 voice, DynamicsCompressor, duration theo tốc độ, dedupe, snapshot valueMax…).

### 6.3 Clement visualizers (`docs/research/clement-visualizers.md`)
- Triết lý chung: **pre-compute ops → replay bằng setTimeout**; "instant" của Pathfinding là **renderer thứ hai** (anti-pattern với StepDSA).
- Maze generators ghi vào cùng queue animation; 3 biến thể recursive division khác mỗi hằng số hướng.
- 6 bài học: grid editor + `dragMode`; playhead thay renderer; status current/frontier/visited/path + direction; maze = generator + timeline; capability matrix + descriptor; onboarding có GIF + giữ scrubber sống.
- Anti-pattern: khoá toàn navbar khi chạy; speed gộp vào kích thước (Sorting `max(0, 570 - n²)`).

### 6.4 recursion-tree-visualizer (`docs/research/recursion-tree-visualizer.md`)
- **Wrapper `_fn`/`fn` tự sinh quanh thân hàm user** (không sửa code user); chạy trên AWS Lambda container; parser regex tự viết.
- Layout Reingold-Tilford + **Euler tour sinh `times[]`/`timeRange`/`logs[]`** ở server; client chỉ render time slice (SVG thuần).
- Chặn 5 lớp: 256 calls, timeout 28s, cây rỗng, size input, map lỗi có kiểu; **memoization = node lá trùng gắn cờ** (chưa nối về node gốc).
- Bài học: Web Worker + step budget + terminate; tách capture/layout/view; cap node/steps; cải tiến memoize (trỏ về node gốc).

### 6.5 OpenDSA (`docs/research/opendsa.md`)
- 3 mảnh ghép: nội dung (RST/AV/Exercises) + JSON params (JXOP) + config sách (points/required/threshold) — **tách spec bài tập khỏi chính sách chấm**.
- **Gradeable step** trong JSAV (`stepOption("grade", true)`), grader default/finalStep/finder; **feedback continuous + fixmode fix/undo + `fix(modelState)`**; **model answer có hậu quả (mất credit) + log**; điểm `score=correct/total`, `complete=(correct+undo+fix)/total`.
- Offline-first: localStorage → batch sync (SUBMITTED/ERROR); SPLICE `reportScoreAndState(location, score, state)` để embed LMS + resume.
- KA framework: nhiều answer types (number/set/radio/custom validator…).

---

## 7. Tổng hợp bài học theo chủ đề → tính năng StepDSA

| Chủ đề | Học từ | Tính năng đề xuất |
|---|---|---|
| Đánh giá & quiz | VisuAlgo (quiz nhúng + training tự sinh), OpenDSA (gradeable step, fix, model answer) | Quiz mini 3–5 câu/module (số/MCQ/MSQ) sinh theo module+độ khó; mở rộng checkpoint thành per-step; model answer có hậu quả |
| Chia sẻ | Python Tutor (permanent link), algorithm-visualizer (visualizationId), VisuAlgo (Share) | Permalink `module + frame + input` (hash/query); nút "Copy link to step" |
| Code ↔ bước | VisuAlgo (codetrace + current action), algorithm-visualizer (chunk+lineNumber) | Thêm "current action" ngắn mỗi frame từ pedagogy; giữ line mapping đã có |
| Input/playground | VisuAlgo (preset nhóm + user-defined + 2D input), SoS/Toptal (nhóm input), Clement (grid editor) | Chuẩn hoá preset theo nhóm; grid editor kéo thả cho A*; dialog input 2D cho DP |
| Recursion | VisuAlgo (Tree/DAG + stats), brpapa (sandbox + time-slice), recursionvisualizer (preset + compute status) | Nâng recursion-trees: (arg, value) + màu repeated/base + stats; công cụ nhập hàm tùy biến (Web Worker) |
| Bài giảng | VisuAlgo (e-Lecture + timeline checkpoint + phím tắt) | e-Lecture mode auto-play theo milestones + narration (P2) |
| Âm thanh | SoS (10 gợi ý) | Audibilization Web Audio (P2) |
| So sánh | Toptal (Play All), VisuAlgo (2 cửa sổ) | Split view 2 module cùng input (P2) |
| Hạ tầng | VisuAlgo (SSR + engine nhẹ), algorithm-visualizer (replay tất định), brpapa (worker sandbox) | Giữ timeline tất định; tránh renderer thứ hai; SSR/embed mở rộng |

---

## 8. Roadmap cập nhật (thay thế §7 trong RESEARCH_LANDSCAPE)

- **P1 (ngắn hạn):** (1) Quiz mini 3–5 câu/module (sinh theo module+difficulty, dạng số/MCQ/MSQ, chấm tại chỗ) — học VisuAlgo Training; (2) **Permalink "Copy link to step" ✅ đã triển khai 2026-11-16** — sync `?module=&step=` (debounce 250ms) + nút Copy Link trong StepperControls, helper `src/utils/permalink.ts` + test (học PT/algorithm-visualizer); **`?input=` ✅ đã triển khai 2026-11-16** — LZString nén input tùy chỉnh, validate bằng `generateTimeline`, copy link tái lập đúng mảng/đồ thị (học PT permanent link + Graph Online copy graph link); (3) Preset input theo nhóm cho sorting modules (random/sorted/nearly-sorted/duplicates/user-defined) — học VisuAlgo/SoS; (4) i18n vi/en.
- **P2:** e-Lecture auto-play theo milestones + narration (VisuAlgo); grid editor kéo thả start/goal/wall/weight cho A* (Clement); audibilization Web Audio (SoS); split view so sánh 2 module (Toptal/VisuAlgo).
- **P3:** Recursion tool tùy biến (worker + wrapper; time-slice model; stats) — brpapa + VisuAlgo + recursionvisualizer; proficiency exercises + fix/model answer (OpenDSA) cho 10 module trọng tâm; gradeable steps.
- **P4 (dài hạn):** tracer đa ngôn ngữ (algorithm-visualizer); embed LMS/iframe (PT embed, SPLICE); mobile/PWA (VisuAlgo mobile lite); sách PDF/EPUB song song (hello-algo).

---

## 9. Còn lại / chưa xác minh

- **LeetCodeAnimation web** (từng bước/tua/đổi tốc độ/thuyết minh) — chưa điều tra.
- **Toptal live** — bị Cloudflare chặn (P2 split view vẫn làm được theo thiết kế mô tả công khai).
- VisuAlgo "so sánh 2 thuật toán bằng 2 cửa sổ" — chưa tự mình kiểm chứng (mô tả trên trang About).
- Clement "tutorial repo" (hướng dẫn build) — chưa đọc.
- VisuAlgo mobile-lite — chưa kiểm chứng.
