# Teardown: Pathfinding-Visualizer & Sorting-Visualizer (Clement Mihailescu)

> Khảo sát read-only 2026-11-15, không chạy build. Hai repo snapshot 1 commit:
> Pathfinding-Visualizer `c51f2d5` (~6.140 dòng JS + bundle.js 2.999 dòng + 13.968 dòng CSS); Sorting-Visualizer `09aaec3` (12 file JS/JSX ~700 dòng + 3 CSS ~190 dòng).
> Bundle là artifact build (watchify/webpack). Mọi kết luận từ source; hành vi runtime chưa build thử.

## PHẦN A — Pathfinding-Visualizer

### A1. Kiến trúc chính

Không framework: HTML tĩnh + jQuery/Bootstrap CDN, entry `bundle.js`.

| File | Vai trò |
|---|---|
| `index.html` | Khung UI: navbar, dropdown Algorithms, dropdown Mazes & Patterns, legend, `#tutorial`, `#algorithmDescriptor`, `<table id='board'>` (`index.html:9-93`, `#board` `:92`) |
| `public/browser/board.js` | "God object" `Board`: grid, event, state, điều phối thuật toán + animation, tutorial, bật/tắt nút (1.114 dòng) |
| `public/browser/node.js` | `function Node(id, status)` (`node.js:1-25`) |
| `public/browser/getDistance.js` | Khoảng cách hướng-aware (cho bidirectional) (`getDistance.js:1-50`) |
| `public/browser/animations/*` | 3 renderer: `launchAnimations.js` (174), `launchInstantAnimations.js` (116), `mazeGenerationAnimations.js` (21) |
| `public/browser/pathfindingAlgorithms/*` | 5 file thuật toán |
| `public/browser/mazeAlgorithms/*` | 6 file sinh mê cung (2 file chết) |
| `public/styling/cssBasic.css` | Theme mặc định (7.108 dòng) |
| `public/styling/cssPokemon.css` | Theme phụ (6.860 dòng) — **không được load** |

Khởi động: `new Board(height, width); initialise()` (`board.js:1101-1106`), `initialise()` → `createGrid() → addEventListeners() → toggleTutorialButtons()` (`board.js:45-49`).

**Model `Node`** (`node.js:1-25`): `id` dạng `"r-c"`, `status`, `previousNode`, `path`, `direction`, `distance`, `totalDistance`, `heuristicDistance`, `weight`, cộng **bộ đôi field `other*`** cho Bidirectional (`node.js:15-24`; `bidirectional.js:10-11, 96-105`). `weight` chỉ 2 mức `0`/`15` (`board.js:197-200`, `weightedSearchAlgorithm.js:67`).

Ba nguồn dữ liệu song song: `this.nodes = {}` (`board.js:24, 70`), `this.boardArray = [[Node]]` (`board.js:23, 72`), và DOM `<td id="r-c">` là **nguồn sự thật** cho màu/`className` (`board.js:218, 428-517`).

### A2. Lên lịch animation

**(a) Animated.** Thuật toán chạy **đồng bộ trọn vẹn** trước, ghi node cần tô vào `nodesToAnimate` (`unweightedSearchAlgorithm.js:9`; `weightedSearchAlgorithm.js:19`; `astar.js:15`; `bidirectional.js:25-26`), rồi `launchAnimations` phát lại:
- delay: `fast = 0ms`, `average = 100ms`, `slow = 500ms` (`launchAnimations.js:6-8`);
- đệ quy `setTimeout` (`launchAnimations.js:10-83`, `timeout(index + 1)` `:81`, `}, speed)` `:82`);
- `change(currentNode, previousNode)` tô `"current"`/`"visited"` (`:85-109`; node weight → `"visited weight"` `:105`);
- pha vẽ đường đi (`index === nodes.length`): `drawShortestPathTimeout` (`:50`) **hard-code 40ms/frame** (`board.js:341-357`, `}, 40)` `:356`); class theo hướng `shortest-path-up/down/left/right` (`board.js:377-388`) hoặc `shortest-path-unweighted` (`:367-368`); xong thì `toggleButtons()` (`:351-353`).
- Thất bại: `console.log("Failure."); reset(); toggleButtons();` (`launchAnimations.js:31-36, 57-62`).

**(b) Instant.** `launchInstantAnimations` = **bản sao renderer không setTimeout** (vòng `for` đồng bộ, `:7-13`), class riêng `instantvisited`/`instantshortest-path` (`:77, 84, 107`), vẽ đường trực tiếp `drawShortestPath` (`:17, :36, :38`). Điểm gọi duy nhất: `redoAlgorithm` (`board.js:607-610`) ← `onmouseenter` khi **kéo start/target/bomb sau khi thuật toán chạy xong** (`board.js:117-129`, `algoDone`). "Instant" = tính lại tức thì trong lúc kéo, không phải tuỳ chọn người dùng.

**(c) Maze animation.** `mazeGenerationAnimations` đệ quy `setTimeout` nhanh hơn: `fast = 5ms`, `average = 25ms`, `slow = 75ms` (`:3-5`), lặp `board.wallsToAnimate` (`:2, :13`), xong reset + `toggleButtons()` (`:9-10`). **3 công thức speed khác nhau** (0/100/500 – 40 – 5/25/75); instant bỏ qua speed.

**(d) Code chết:** `shortestPathTimeout` (`launchAnimations.js:111-141`) không bao giờ gọi; `shortestNodes` dựng `:55` rồi return `:56`; `resetHTMLNodes` (`board.js:626-631`); `testAlgorithm.js` không require; `weightedManhattanDistance`; `averageNumberOfNodesBetween`; `simpleDemonstration.js`; `weightsDemonstration.js`.

### A3. Kéo thả, weight, clear, grid size

Sự kiện trên từng `<td>` (`board.js:79-145`): `onmousedown` (`:86-97`) chốt `pressedNodeStatus` hoặc `changeNormalNode()`; `onmouseup` (`:98-110`) chốt `start/target/object`; `onmouseenter` (`:111-135`) `changeSpecialNode()` + `redoAlgorithm()` nếu `algoDone` (`:117-129`); `onmouseleave` (`:136-142`).

**Wall vs Weight:** `changeNormalNode` (`board.js:183-204`) — không phím → toggle wall; giữ **W (keyCode 87)** và không phải BFS/DFS → toggle `weight = 15` (`:195-203`); phím bắt bằng `window.onkeydown/onkeyup` (`board.js:1108-1114`). Nhược: giữ *bất kỳ* phím khác (Shift/Ctrl) → kéo chuột không vẽ được gì (`:187, :195`, suy luận từ mã).

**clear:** `clearPath` (`:428-518`, khôi phục special + re-bind handler "Visualize!" trùng lặp với `toggleButtons`); `clearWalls` (`:520-531`); `clearWeights` (`:533-543`, tự chạy khi chọn BFS/DFS `:881, :888`); `clearNodeStatuses` (`:545-559`); `Clear Board` (`:912-966`, tính lại start/target theo viewport nhưng **không dựng lại bảng** `:917-922` → lỗi tiềm ẩn sau resize).

**Grid size: KHÔNG có bộ chọn.** Suy từ viewport lúc load: `height = floor((docHeight - navbar - text) / 28)`, `width = floor(docWidth / 25)` (`board.js:1101-1104`), ô 25×25px (`cssBasic.css:439-442`). Không có listener resize.

### A4. Maze generators — danh sách đầy đủ

| Menu | Hàm | Thuật toán | Animated? |
|---|---|---|---|
| Recursive Division | `recursiveDivisionMaze.js:1-106` (`board.js:902`) | Recursive division cổ điển: viền wall (`:5-26`), hàng/chẵn ngẫu nhiên (`:28-39`), chừa 1 lỗ (`:43`), đệ quy; đổi trục khi hẹp (`:56-65, :95-104`) | Có |
| Recursive Division (vertical skew) | `otherMaze.js:1-90` | Bản sao, **ép hướng con `"vertical"`** (`:48, 51, 53`) | Có |
| Recursive Division (horizontal skew) | `otherOtherMaze.js:1-90` | Bản sao thứ ba, **ép `"horizontal"`** (`:48, 80, 82, 85`) | Có |
| Basic Random Maze | `createMazeOne("wall")` (`board.js:408-426, 892-896`) | Random `< 0.25` → wall (`:413-418`) | **Không** (tô trực tiếp) |
| Basic Weight Maze | `createMazeOne("weight")` (`:906-910`) | Random `< 0.35` → weight 15 (`:413, :419-422`) | **Không** |
| Simple Stair Pattern | `stairDemonstration.js:1-38` (`board.js:819-825`) | 3 vòng `while` vẽ bậc thang zíc-zắc | Có |

2 generator không nối UI: `simpleDemonstration.js`, `weightsDemonstration.js`. UX đáng học: generator ghi vào cùng queue `wallsToAnimate` → dùng y nguyên cơ chế "tô từng ô"; generator lo nội dung, animation lo nhịp.

### A5. Thuật toán + dropdown

Dropdown (`index.html:16-29`) → `currentAlgorithm`/`currentHeuristic`, đổi nhãn CTA (`board.js:828-890`): `dijkstra` (`:845`); `CLA` + `manhattanDistance` = Swarm (`:851-856`); `astar` + `poweredManhattanDistance` (`:858-863`); `CLA` + `extraPoweredManhattanDistance` = Convergent Swarm (`:865-870`); `greedy` (`:872`); `bfs` (`:878`); `dfs` (`:885`); `bidirectional` (`:828`). 3 "thuật toán" là **cùng hàm `CLA` với 3 heuristic** (`weightedSearchAlgorithm.js:66-75`, luỹ thừa 2/7); BFS/DFS cùng hàm (`unweightedSearchAlgorithm.js:8`, khác `shift()`/`pop()`).

**Dạy học qua descriptor** (`board.js:633-690`): text `#algorithmDescriptor` "weighted/unweighted + guarantees/does not guarantee shortest path" (`:655-660, 667-689`); gạch ngang legend Weight (unweighted) (`:661, :671`) và Bomb (bidirectional) (`:681, :684`); **đổi icon CSS** bằng sửa `document.styleSheets["1"].rules[j].style.backgroundImage` (`:662-676` — hack CSSOM dễ vỡ); BFS/DFS tự `clearWeights()` (`:881, :888`); bidirectional tự gỡ bomb (`:832-840`).

**Độ phức tạp:** `closestNode` **quét tuyến tính toàn bộ node** mỗi bước (`weightedSearchAlgorithm.js:30-40`; `astar.js:24-39` tie-break `heuristicDistance`; `bidirectional.js:46-68`) → O(V²) → phải "chạy trước, animate sau". A* lưu `totalDistance = distance + heuristicDistance` (`astar.js:54-58`). Bidirectional: 2 frontier, gặp nhau qua `visitedNodes`, `board.middleNode` (`bidirectional.js:12-43`), dựng 2 nửa đường bằng field `other*` (`board.js:297-334`).

### A6. Tutorial, legend, tốc độ (UX)

- **Tutorial 9 bước** khi mở trang (`index.html:60-69`; `board.js:692-741`): mỗi bước set `innerHTML` của `#tutorial` kèm ảnh/GIF (`:716-738`), Next/Previous/Skip, bước cuối Finish (`:733-737`); xong `toggleButtons()` (`:697, :736`). Nội dung: giới thiệu → khái niệm → chọn thuật toán (bảng weighted/unweighted) → 8 thuật toán + "guarantees shortest path?" → walls & weights (W + cost 15) → bomb → kéo thả (kể cả khi đã chạy xong) → navbar/speed → kết.
- **Legend** cố định dưới navbar: 8 mục (`index.html:72-89`), 2 mục gạch ngang theo ngữ cảnh (`:77-80`).
- **Learning nudge:** CTA tự đổi nhãn; chưa chọn gì → **"Pick an Algorithm!"** (`board.js:444-445, 752-753`).
- **Speed:** chỉ 3 mức Fast/Average/Slow (`index.html:47-55`; `board.js:804-817`); **không pause/step/scrub**.
- **Khoá UI khi chạy:** `toggleButtons()` set `onclick = null` + class `disabledA` cho ~30 phần tử (`board.js:1048-1096`), nút chính đỏ (`:1095`) — không thể clear/pause/đổi speed khi đang animate.

### A7. Quản lý state — nhận xét

Mô hình: **1 class `Board` + DOM là state**. Cờ trong constructor (`board.js:17-43`) + trường "mồ côi" (`middleNode` `bidirectional.js:30`; `wallsToAnimate` `:29`; `objectNodesToAnimate`; `shortestPathNodesToAnimate` `:25-29`).

**Ưu:** một chỗ tra cứu; thuật toán hàm thuần nhận `nodes/boardArray`; "tính trước, animate sau" hợp UI mượt; queue node khiến thêm thuật toán rẻ.
**Nhược:** `Board` ~1.100 dòng làm 6 việc; logic điều phối copy-paste 3 lần (`clearPath` `:443-492`, `toggleButtons` `:751-802`, `instantAlgorithm` `:561-605`); coupling ngược (animation require lại thuật toán cho pha bomb — `launchAnimations.js:1-2, 22-27, 121-126`); DOM mutation ~60 chỗ; hack `document.styleSheets`; 2 bộ field trùng trong `Node`.

## PHẦN B — Sorting-Visualizer

### B1. Kiến trúc

React 15 + Redux (react-redux 5, redux-actions) + webpack, không TS (`package.json:12-34`). Container/presenter: `index.jsx:7-12` (`<Provider><Main/></Provider>`), `store.js:1-4`; `Main.jsx:11-18` (`<Toolbar/><Body/>`); `ToolbarContainer.js` = **toàn bộ logic tương tác** (`:23-45`); `BodyContainer.js:4-22`; `Body.jsx` render bar/màu.

### B2. Animation & màu theo state

**"Pre-compute ops rồi replay"**:
1. Thuật toán chạy trọn trên bản sao mảng, ghi sự kiện vào `toDispatch` (`quickSort.js:8-12`; `heapSort.js:8-25`; `mergeSort.js:8-11`; `bubbleSort.js:8-31`);
2. `handleDispatch` phát **1 dispatch mỗi `speed` ms** bằng đệ quy `setTimeout` (`bubbleSort.js:48-50`; `quickSort.js:73-75`; `heapSort.js:76-78`; `mergeSort.js:79-81`);
3. **Loại dispatch suy từ độ dài/kiểu queue** (không enum!): `length > 3 → setArray`; `length === 3 → setCurrentSwappers`; `[boolean, idx] → setCurrentSorted`; `length === 2 → setCurrentBubbleTwo/QuickTwo/HeapThree/MergeX` (`bubbleSort.js:43-47`; `quickSort.js:66-72`; `heapSort.js:71-74`; `mergeSort.js:65-78`);
4. Kết thúc: tô "đã sắp xếp", chờ **900ms** rồi `setRunning(false)` (`bubbleSort.js:34-42`; `quickSort.js:57-65`; `heapSort.js:63-70`; `mergeSort.js:56-64`).

**Màu (trong `render`, không CSS)** (`Body.jsx:45-51`): swapping đỏ `rgba(219,57,57,.8)`; comparing xanh lá `rgba(78,216,96,.8)`; pivot vàng `rgba(237,234,59,.8)`; sorted tím `rgba(169,92,232,.8)`; mặc định xanh dương `rgba(66,134,244,.8)`. Reducer `swappers`/`sorted` **cộng dồn** (`concat`) (`reducers/swappers/index.js:8-16`; `reducers/sorted/index.js:8-16`).

**Layout tự thích ứng** (`Body.jsx:21-40`): `numWidth = floor(docWidth / (array.length * 3))`; **ẩn số khi cột < 20px** (`:32`); cao bar = `number * 3 px` (`:55`). Điểm trừ: đọc `$(document).width()` trong `render` (`:21`).

### B3. Controls

| Control | Dòng | Hành vi |
|---|---|---|
| "Generate New Array" | `Toolbar.jsx:48-53` | `generateArray(array.length)`; khi chạy → vô hiệu (onClick=null) |
| Slider size+speed | `Toolbar.jsx:55-68`, `:24-28` | 0–100 → `n = floor((value+3) * 1.65)` ≈ 4–169 phần tử |
| 4 nút thuật toán | `Toolbar.jsx:70-89` | `setAlgorithm(name)`; nút chọn tím `rgb(241,94,255)` (`Toolbar.css:63-71`) |
| "Sort!" | `Toolbar.jsx:91-97` | hiện khi đã chọn thuật toán; disabled khi `isRunning` |
| Mount mặc định | `Toolbar.jsx:11-16` | 87 phần tử nhưng set `#changeSize.value = 50` bằng DOM → lệch nguồn sự thật |

**Speed thực chất:** `speed = 570 - n² > 0 ? 570 - n² : 0` (`Toolbar.jsx:39-40`) → **0ms khi `n ≥ 24`**; mặc định 87 → `setTimeout(…, 0)`. Lấy kích thước làm núm tốc độ — không thể vừa mảng lớn vừa chậm từng bước.

### B4. State — nhận xét

10 slice (`reducers/index.js:12-23`), 4 slice con trùng chức năng. **Ưu:** màu khai báo hoàn toàn (không DOM mutation); `isRunning` gate duy nhất; highlight khớp ngữ nghĩa thuật toán; dễ thêm thuật toán. **Nhược:** state explosion; dispatch theo hình dạng dữ liệu dễ vỡ (`heapSort.js:71-74`, `mergeSort.js:65-78`); `array` thay snapshot mỗi swap → re-render toàn列表; 4 `handleDispatch` gần trùng (copy-paste ~20 dòng/bản); không pause/step/rewind; `setTimeout` không clear khi unmount; `MainContainer` rỗng.

## PHẦN C — So sánh

| Tiêu chí | Pathfinding | Sorting |
|---|---|---|
| Stack | Vanilla JS + jQuery + Bootstrap | React 15 + Redux + webpack |
| Nguồn sự thật | DOM className + Node + boardArray | Redux store, render suy diễn |
| Nhịp | setTimeout 0/100/500 – 40 – 5/25/75ms | setTimeout `max(0, 570 - n²)` |
| Instant | **Code path thứ 2** + class CSS riêng | Không |
| Pre-compute | Có | Có (cùng triết lý) |
| Input | Lưới kéo thả + 6 generator | Random + slider |
| Legend | Có + tự gạch mục không áp dụng | **Không** |
| Onboarding | Tutorial 9 bước GIF | Không |
| Khoá UI | Toàn navbar ~30 phần tử | Nút generate/slider/sort |
| Test | Không | Không |

## PHẦN D — 6 bài học cụ thể cho StepDSA

Bối cảnh StepDSA: `ElementStatus` có `comparing|swapping|sorted|pivot|selected` (`src/core/types.ts:17-26`); `AlgorithmModule = presets + defaultInput + generateTimeline(input) + renderStage(frame)` (`:152-164`); `PlaybackController` có `seekTo/setSpeed/stepForward/stepToNextAction` (`:166-183`); A* đã mô hình hoá lưới `obstacles` (`src/modules/graphs/aStarSearch.tsx:8-41`); preset chips `PlaygroundBar.tsx:237-278`; scrubber `StepperControls.tsx:95, 205-221`.

1. **Grid editor kéo-thả** trên đúng schema `AStarInput.obstacles`: state machine `pointerdown/move/up` + `dragMode: 'start'|'goal'|'wall'|'weight'|null`; thả chuột → `generateTimeline(inputMới)` + `seekTo(0)` — tương đương `redoAlgorithm()` nhưng **không cần code path thứ hai**.
2. **"Animated vs instant" = playhead, không phải renderer**: StepDSA chỉ cần nút "Jump to end" + instant cho kéo-thả; tránh hard-code 40ms cho pha vẽ path — speed áp mọi frame.
3. **Mô hình hoá "current/frontier/visited/path"** trong frame state + CSS/SVG mũi tên theo `direction`; suy hướng trong `generateTimeline`, không trong `renderStage`.
4. **Maze generator = pure input-generator + timeline riêng**: `generators: ((g) => obstacles[])`, đăng ký qua `presets`; sinh cả timeline cho quá trình tạo mê cung; 3 biến thể recursive division + random + stair.
5. **Capability matrix + descriptor** trên `AlgorithmModule` (`capabilities: {weighted?, supportsWeights?, guaranteesOptimal?, supportsObstacles?}`) để UI tự sinh mô tả/legend/khoá tính năng — thay ~40 nhánh if-else và hack CSSOM.
6. **Onboarding theo ngữ cảnh + giữ scrubber sống khi chạy**: tour có GIF, CTA nhắc chọn thuật toán; **không khoá toàn bộ điều khiển** như Clement — chỉ disable hành động phá dữ liệu; thêm `jumpStart`/`jumpEnd`/step-to-next-milestone.

**Bài học phụ:** kích thước lưới/thanh cần núm tường minh + layout stage tự co (Sorting `Body.jsx:21-40` ẩn số khi cột <20px); tách núm tốc độ khỏi kích thước dữ liệu; giữ 2 kênh highlight *tích luỹ* (sorted) và *tạm thời* (swap).

## PHỤ LỤC — Chưa xác minh

1. Hành vi runtime (lag O(V²), lỗi Clear Board sau resize, lỗi "giữ phím bất kỳ") — suy từ mã.
2. Bản deploy hiện tại có thể khác snapshot (README chỉ kể 1 generator trong khi code có 6).
3. `cssPokemon.css` + asset không được tham chiếu — chưa rõ vai trò.
4. Chưa diff toàn bộ `bundle.js` với source (đã spot-check `Board` `:335`, `launchInstantAnimations` `:181` khớp).
