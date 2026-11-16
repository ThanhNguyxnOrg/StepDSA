# Teardown: algorithm-visualizer (49,515 ⭐)

> Khảo sát read-only ngày 2026-11-15 từ source clone `algorithm-visualizer/algorithm-visualizer` (shallow, 1 commit `18de2ed`). Không chạy build; mọi khẳng định kèm file:line. Lưu ý: repo gốc là MIT nhưng báo cáo chỉ để học ý tưởng.

## 0. Phương pháp & mức độ xác minh

- `src/` 83 file (52 js/jsx, 28 scss, 1 md-symlink), tổng **4.021 dòng**; 17 component, 8 renderer, 9 tracer (1 base + 8 con).
- Web app = Create React App (react-scripts), React 16.8 + Redux 4 + react-router 5 + SCSS modules; deps: `ace/brace` (editor), `chart.js`, `screenfull`, `js-cookie`, `axios`, `bluebird`, `query-string`, `react-input-range`, `react-markdown`, `uuid` (`package.json:32-67`).

## 1. Bản đồ kiến trúc

### 1.1 Hệ sinh thái đa repo (README.md:41-54)

| Repo | Vai trò |
|---|---|
| `algorithm-visualizer` | Web app React: UI + **diễn giải commands thành visualization** (README.md:46) |
| `server` | Serve web app + API: GitHub sign-in, compile/run code (README.md:48; `package.json:27` proxy `localhost:8080`) |
| `algorithms` | Nội dung thuật toán cho side menu (README.md:50) |
| `tracers.*` (js/cpp/java) | Thư viện "trích xuất visualization commands từ code" (README.md:31-33, 52; `src/files/scratch-paper/README.md:7-10`) |

### 1.2 Phân chia web app vs runtime/server

- **Web app (trong repo):** editor đa file, playback, chuyển commands → cấu trúc dữ liệu, render, side menu, auth-cookie, gist CRUD (gọi thẳng GitHub API), layout kéo–dở, toast.
- **Server/runtime (ngoài repo):** OAuth GitHub (`/api/auth/request|destroy` — `Header/index.js:157,160`), danh mục thuật toán (`/api/algorithms` — `apis/index.js:51-52`), đọc visualization đã lưu (`/api/visualizations/:id` — `apis/index.js:56`), **chạy/compile code**: worker `/api/tracers/js/worker` cho JS và `POST /api/tracers/cpp|java` (`apis/index.js:85-104`), preload HTML qua biến `$ALGORITHM/$TITLE/$DESCRIPTION` (`public/index.html:19,26,31-33`).
- Không có backend code trong repo; `.gitpod.yml:1-8` clone repo `server` bên cạnh để chạy local.

### 1.3 Cấu trúc `src/`

- `apis/` tầng HTTP (`apis/index.js:1-13`).
- `common/` config ngôn ngữ (`common/config.js:3-18`), utils, stylesheet (`common/stylesheet/colors.scss:1-11` — palette tối + selected/patched/active).
- `components/` 17 UI component, export tập trung `components/index.js:1-17` (App, Header, Navigator, Player, VisualizationViewer, CodeEditor, TabContainer, ResizableContainer, ProgressBar, Button, ToastContainer, ListItem, ExpandableListItem, Divider, Ellipsis, FoldableAceEditor, BaseComponent).
- `core/` engine: `layouts/` (base + Horizontal + Vertical), `renderers/` (8), `tracers/` (8 + base).
- `files/` nội dung nhúng bằng raw-loader (`files/index.js:3-12`); `src/files/algorithm-visualizer/README.md` là **symlink** → README dự án (trang chủ hiển thị chính README dạng markdown).
- `reducers/` 5 reducer + routing (`index.js:11,16-20` route `/scratch-paper/:gistId`, `/:categoryKey/:algorithmKey`, `/`).
- State: `current` (`reducers/current.js:42-56`), `directory` (`reducers/directory.js:13-16`), `env` (`reducers/env.js:17-20`), `player` (`reducers/player.js:15-19`), `toast` (`reducers/toast.js:16-18`).
- Workspace 3 pane co giãn: Navigator | VisualizationViewer | CodeEditor (`App/index.js:238-245`), toggle side menu khi click title bar (`App/index.js:212-220`).

## 2. Cơ chế hiển thị — danh sách "visualizer"

Kiến trúc 2 tầng: **Tracer** (state + API dữ liệu) → **Renderer** qua `getRendererClass()`; `Tracer.render()` bọc renderer với `title` (`core/tracers/Tracer.jsx:13-25`).

| # | Tracer (file:line) | Renderer (file:line) | Ghi chú |
|---|---|---|---|
| 1 | Array2DTracer `core/tracers/Array2DTracer.js:12-15` | Array2DRenderer `core/renderers/Array2DRenderer/index.js:6-60` | Bảng; class `selected`/`patched` (48-49); pan/zoom (10-12); API patch/depatch/select/... (22-62) |
| 2 | Array1DTracer `core/tracers/Array1DTracer.js:4-7` | Array1DRenderer `core/renderers/Array1DRenderer/index.js:3-4` | Kế thừa Array2D; phân biệt 1D bằng `instanceof` (`Array2DRenderer/index.js:17`); cầu nối chart (36-43) |
| 3 | ChartTracer `core/tracers/ChartTracer.js:4-7` | ChartRenderer `core/renderers/ChartRenderer/index.js:6-32` | Bar chart (react-chartjs-2), `animation: false` (26) |
| 4 | ScatterTracer `core/tracers/ScatterTracer.js:4-7` | ScatterRenderer `core/renderers/ScatterRenderer/index.js:8-51` | Nhiều series, bán kính/màu theo thứ tự (12-18) |
| 5 | GraphTracer `core/tracers/GraphTracer.js:5-8` | GraphRenderer `core/renderers/GraphRenderer/index.js:6-123` | SVG; pan/zoom + **kéo node** (17-35, 49-56); tô theo `visitedCount`/`selectedCount` (69-119) |
| 5b | Tree = GraphTracer + layout | layoutTree `GraphTracer.js:159-204`; layoutCircle 145-157; layoutRandom 206-217 | Không renderer "tree" riêng — cây là đồ thị + layout |
| 6 | LogTracer `core/tracers/LogTracer.js:5-26` | LogRenderer `core/renderers/LogRenderer/index.js:5-29` | Auto-scroll (12-16); `dangerouslySetInnerHTML` (23 — rủi ro XSS) |
| 7 | MarkdownTracer `core/tracers/MarkdownTracer.js:4-12` | MarkdownRenderer `core/renderers/MarkdownRenderer/index.js:6-74` | react-markdown; anchor heading (20-38), link ngoài (40-46), post-process ảnh (48-63) |
| 8 | (base) `Tracer.jsx:4-33` | Renderer base `core/renderers/Renderer/index.js:6-108` | Pan/zoom chuột (33-71), format `∞/T/F` (73-85), tiêu đề Ellipsis (101) |

**Layout:** `core/layouts/Layout.js:5-53` (ResizableContainer 45-50; add/remove/removeAll 16-34; kéo divider 36-39) — chỉ Horizontal/Vertical, **không có GridLayout** (`core/layouts/index.js:1-3`).

**Vùng code:** CodeEditor ace (`components/CodeEditor/index.js:37-77`), marker dòng hiện tại (47-57) + animation 0.1s (`CodeEditor.module.scss:16-32`); tự gấp block comment kết thúc `{` — tức `// visualize { ... // }` (`FoldableAceEditor/index.js:30-40`).

## 3. Playback (frame stepping)

- **Dữ liệu:** commands cắt thành **chunks**; ranh giới = `{key:null, method:'delay', args:[lineNumber]}` — chunk hiện tại nhận `lineNumber` rồi mở chunk mới (`components/Player/index.js:43-66`). Redux: `chunks`, `cursor`, `lineIndicator` (`reducers/player.js:5-19`).
- **Cursor 1-based = số chunk đã áp dụng** (`Player/index.js:97-100`).
- **Điều khiển:** `prev()` 102-108; `next()` 127-133; `resume(wrap)` 110-117 lặp bằng `setTimeout` với `interval = 4000 / e^speed`, Play dùng `wrap=true`; `pause()` 119-125.
- **Tốc độ:** slider 0→4 (step 0.5, mặc định 2) ⇒ ~4000ms/bước → ~73ms (`Player/index.js:20-24, 170-180`).
- **Seek:** ProgressBar kéo chuột (`components/ProgressBar/index.js:14-45`) → đổi cursor theo tỉ lệ (`Player/index.js:139-144`).
- **Áp dụng:** `VisualizationViewer.update` (`VisualizationViewer/index.js:35-51`): tiến chỉ apply delta `chunks.slice(oldCursor, cursor)` (37-38); **lùi/seek thì `reset()` + replay từ 0** (39-42); set `lineIndicator {lineNumber, cursor}` (45-50).
- **Đồng bộ code ↔ animation:** marker Ace theo `lineIndicator.lineNumber` (`CodeEditor/index.js:47-56`).
- **Không có keyboard shortcuts** (grep 0 kết quả trong src).
- UI player ở hàng 2 Header (`Header/index.js:176`): Build → Play/Pause → prev → progress → next → speed (`Player/index.js:152-181`).
- Build/invalidate khi `editingFile` đổi và `current.shouldBuild` (`Player/index.js:31-41`; `reducers/current.js:79-86, 98-139`).

## 4. Mô hình "visualize algorithms FROM CODE"

1. **Authoring:** user import tracer theo ngôn ngữ — JS `require('algorithm-visualizer')` (`files/skeletons/code.js:2`), C++ `#include "algorithm-visualizer.h"` (`code.cpp:2`), Java `import org.algorithm_visualizer.*;` (`code.java:2`); vùng visualize bọc trong `// visualize { ... // }` (`code.js:23-28`).
2. **Sinh commands:** `TracerApi` (`apis/index.js:70-105`) — `.js` → Web Worker `/api/tracers/js/worker` + CancelToken (85-102); `.cpp`/`.java` → POST (103-104); `.md` → commands cục bộ (71-83); `.json` → parse thẳng (84). Thư viện tracer + runtime nằm ở repo riêng (`tracers.*`, `server`).
3. **Định dạng command:** `{key, method, args}`; `{key:null, method:'setRoot'|'delay'}` là meta-ops. Interpreter tại `VisualizationViewer.applyCommand` (53-76): `setRoot`; `destroy`; `method ∈ LayoutClasses` → new layout (61-64); `method ∈ TracerClasses` → new tracer (65-69); còn lại gọi method trên object (71); lỗi → toast (73-75). Registry = tên chuỗi khớp export (`core/tracers/index.js:1-8`, `core/renderers/index.js:1-8`, `core/layouts/index.js:1-3`).
4. **Replay kết quả đã lưu:** `?visualizationId=` → GET → scratch paper chứa `visualization.json` (`App/index.js:159-168`; `apis/index.js:55-57`) → Player coi JSON là mảng commands → phát lại y hệt. Preload: `window.__PRELOADED_ALGORITHM__` (`public/index.html:31-33`; `App/index.js:150-155`).

## 5. Tính năng UX đáng học

1. **Side menu nội dung** (Navigator): search fuzzy theo chữ cái đầu (`Navigator/index.js:62-69`) + auto mở category (50-60); highlight bài đang mở (103-105); footer Scratch Paper/API Reference/GitHub (113-128); dữ liệu từ `/api/algorithms` (`App/index.js:52-54`).
2. **GitHub gist như "project"**: Save/Edit/Fork/Delete (`Header/index.js:41-109`); marker file ảo `algorithm-visualizer` (58-60) + lọc gists (`App/index.js:131`); xoá file bằng giá trị `null` (53-57); **Delete "Click to Confirm" 2 giây** (`Button/index.js:32-57`).
3. **Login GitHub qua server OAuth** (không lộ secret): `/api/auth/request|destroy` (`Header/index.js:157,160`); token cookie `access_token` (`App/index.js:103-122`; `apis/index.js:59-68`).
4. **URL chia sẻ được:** `/scratch-paper/:gistId`, robots.txt chặn index; preload + `<Helmet>` (SEO) (`App/index.js:231-234`).
5. **Fullscreen** (screenfull) (`Header/index.js:26-34,146-147`); PWA manifest landscape/fullscreen (`public/manifest.json:4-8`).
6. **Guard thay đổi chưa lưu:** `history.block` + `onbeforeunload` (`App/index.js:78-101`).
7. **Chọn tab mặc định thông minh:** ưu tiên `*.json` → đúng ngôn ngữ → ext khác → file cuối (`App/index.js:197-205`).
8. **Đổi ngôn ngữ nhớ bằng cookie `ext`** (`reducers/env.js:6-9,17-20`), skeleton riêng theo ngôn ngữ (`TabContainer/index.js:12-20`).
9. **Docs-as-visualization:** file `.md` build thành MarkdownTracer commands, hiển thị trong chính khung visualization (`apis/index.js:71-83`; trang chủ `/` nạp README — `reducers/current.js:39-56`).

## 6. Năm bài học cho StepDSA

1. **Command-stream 2 tầng + plugin registry**: `{key, method, args}` + tra `method ∈ TracerClasses|LayoutClasses` để instantiate (`VisualizationViewer/index.js:53-76`) → StepDSA có thể chuẩn hoá timeline thành JSON ops, tách engine khỏi UI.
2. **Chunk theo `delay` + `lineNumber`**: mỗi `Tracer.delay()` đóng chunk mang số dòng code (`Player/index.js:49-57`) — vừa là bước animation vừa là con trỏ code (`CodeEditor/index.js:47-56`). Cơ chế cốt lõi để "đồng bộ code ↔ từng bước".
3. **Seek-forward delta / seek-back replay**: tiến apply delta; lùi reset + replay từ 0 (`VisualizationViewer/index.js:35-43`) — đơn giản, deterministic, không cần undo-stack (điều kiện: command pure/idempotent khi replay).
4. **UX "workspace file" cho nội dung**: bài học = folder file (code + README + visualization.json), side menu từ API, search fuzzy; scratch paper = gist; share = URL gist hoặc `visualizationId`; preload server-side. StepDSA có thể chuyển pedagogy thành markdown trong workspace + chọn tab ưu tiên (`App/index.js:197-205`).
5. **Tiện ích "IDE thu nhỏ"**: fullscreen, pane kéo được (`ResizableContainer/index.js:6-64`), zoom/pan/kéo node (`Renderer/index.js:33-71`, `GraphRenderer/index.js:17-35`), fold `// visualize {}`, toast tập trung (`BaseComponent/index.js:10-20`).

**Anti-pattern cần tránh:** XSS ở LogRenderer (`LogRenderer/index.js:23`); không có keyboard shortcuts; `setTimeout` throttle khi tab nền; cursor 1-based với chunk[0] rỗng dễ off-by-one; `react-markdown` v4 `escapeHtml={false}` (`MarkdownRenderer/index.js:67-68`).

## 7. Chưa xác minh

- Nội dung repo `server` và `tracers.js/cpp/java` (cơ chế sinh command, format `visualization.json`, APIs) — không có trong clone.
- Deploy thật có SSR/service worker không (repo chỉ chứa placeholder).
- Lịch sử phiên bản cũ (shallow clone 1 commit).
