# Teardown: brpapa/recursion-tree-visualizer (523 ⭐)

> Khảo sát read-only 2026-11-15 từ source clone (`c3f046e`, nhánh `master`). Monorepo 3 tầng: `web` (Next.js 14), `lambda` (AWS Lambda container chạy code người dùng), `terraform`.
> Layout cây tính **phía server**, client chỉ render. Mọi khẳng định kèm file:line.

## 1. Luồng nhận input

### 1.1 UI (client)
- Form: chọn ngôn ngữ (`node`/`python`/`golang`), template, 2 ô global variable, editor chứa **toàn bộ hàm đệ quy**, input chứa **lời gọi** (mặc định `fn()`), toggle `memoize`/`animate` — `web/src/components/function-form/index.tsx:120-230`; ngôn ngữ `web/src/config/consts.ts:6`; mặc định `python` (function-form/index.tsx:17).
- Editor: `react-simple-code-editor` + `prism-react-renderer` (highlight), không CodeMirror/Monaco — `code-editor/index.tsx:3-5,71-79`.
- **Validate sống khi gõ**: chỉ nhận code khớp regex cấu trúc hàm (`code-editor/index.tsx:42-46`; `function-form/index.tsx:187-189`); xoá trắng → reset về mẫu (`code-editor/index.tsx:37-40`).
- Lời gọi ép khớp `/^fn\(.*\)$/` (`use-form-input.ts:13-16`; `language-handler.ts:62-64`) — **tên hàm bắt buộc là `fn`**; lời gọi chỉ để lấy giá trị tham số ban đầu, không thực thi trực tiếp.
- State (lang, code, global vars, memoize, animate) lưu `localStorage` — `function-form/index.tsx:39-55`; `use-local-storage-state.ts:7-27`.
- Templates (fibo, binomial, subset-sum, knapsack, coin-change, LCS, TSP, fast-power; mcm comment) định nghĩa `fnData` cho cả 3 ngôn ngữ — `lambda/src/static/templates.ts:5-559`; web thêm template `custom` (`web/src/config/templates.ts:7-26`).

### 1.2 Parser — regex + quét ký tự thủ công (không eval, không tree-sitter, không AST lib)
- `LanguageHandler.parseFunctionData` — `web/src/logic/language-handler.ts:23-56`: tách `body` bằng `indexOf('{')`/`lastIndexOf('}')` (JS `:91-93`, Go `:147-149`) hoặc `indexOf(':\n')` (Python `:119-121`); tách params giữa cặp ngoặc đầu (`extractors.ts:156-181`, xử lý ngoặc lồng); split `,` mức 0 + xử lý `(){}[]` lồng + default `=` (`extractors.ts:11-100`); Go `ALWAYS_TYPE_AFTER_NAME_AND_NEVER_DEFAULT` (`:15-26`).
- Giá trị ban đầu lấy theo **vị trí** từ lời gọi, fallback default, nếu vẫn null → throw `'Incorrect params values'` (`:36-49`). Tham số dư trong lời gọi bị bỏ qua im lặng.
- Regex cấu trúc hàm: `language-handler.ts:109-111` (Node), `:137-139` (Python), `:167-169` (Go); test pass/fail `language-handler.test.ts:230-305`.
- Gửi POST `{lang, functionData{body,params[],returnType,globalVariables[]}, options{memoize}}` tới **endpoint AWS API Gateway hard-code** — `web/src/api.ts:5-24` (URL `:17`), gọi từ `app/index.tsx:25-29`; lỗi (422) hiện toast (`app/index.tsx:31-42`).
- Server validate bằng **joi**: whitelist `lang`, shape `functionData`, `memoize` default false — `lambda/src/validations/event.ts:9-65`; whitelist `lambda/src/config.ts:5`; handler trả 200/400/422/500 + CORS `*` (`lambda/src/index.ts:9-45`).

### 1.3 Sinh code & thực thi (server)
- Pipeline 4 bước: `toSourceCode → toInitialTree → toIntermediateTree → toFinalTree` — `lambda/src/runner/index.ts:16-47`.
- `toSourceCode` ghép **prelude** (imports + `safeStringify`) + **user code** + **postlude** (bộ đếm đệ quy) — `source-code.ts:8-30`; user code = global vars + đổi hàm user thành `_fn` + biến `memoize` (`:331-348`, `:352-393`).
- Thực thi: ghi file tạm `/tmp/<hex>.{js,py,go}` rồi chạy `node` / `python3` / `go run` bằng `child_process.exec` — `initial-tree.ts:62-84`, lệnh `:109-133`; xoá file trong `finally` (`:104-106`). Stdout JSON, lấy **dòng áp chót**, validate joi — `validations/stdout.ts:9-15,17-53`.
- Runtime: `amazon/aws-lambda-nodejs:14` + python3 + golang (`lambda/Dockerfile:2-6`). Không có d3/tree-sitter/WASM (deps: `debug, dotenv, fp-ts, joi`).

## 2. Cách bắt cây đệ quy

### 2.1 Mô hình node
`vertices[id] = { argsList: any[], adjList: [{childId, weight}], memoized: boolean }` — `lambda/src/types.ts:11-20`: `id` tăng dần; `weight` của cạnh cha→con = **giá trị trả về** của lời gọi con (`:16`).
`InitialTree = { vertices, fnResult }` (`:22`); stdout `{successValue, errorValue}` (`:23-26`).
Sau xử lý: `VerticesData{times[], coord, label, memoized}` (`:37-48`); `EdgesData{timeRange, label}` (`:50-58`); `FinalTree{times, edgesData, verticesData, svgBottomRight, logs}` (`:60-70`). Node **không có field `parent`** trong model cuối.

### 2.2 Instrumentation (wrapper `fn`/`_fn`)
Sinh tự động trong postlude (`source-code.ts`):
- **JS** `:46-108`: `vertices={}`, `currId=0`, `memoizedResults={}`, `stack=[]` (đỉnh stack = id cha, `:53`). Trong `fn(...args)`: check limit (`:56-63`); tạo vertex (`:65-69`); tạo `adj={childId, weight}` push vào `adjList` của cha (`:71-76`); `stack.push(currId++)` (`:78`); trúng cache → gán `weight` = kết quả cache, `memoized=true`, pop, return (`:80-86`); ngược lại gọi `_fn(...args)`, gán `adj.weight`, cache theo `safeStringify(args)`, pop (`:88-93`). Cuối cùng gọi `fn(<initialValues>)` và in JSON (`:96-107`).
- **Python** `:110-178` (tương đương; `sys.exit(0)` khi vượt limit `:134-140`).
- **Go** `:180-326`; cache `map[string]${returnType}` (`:242`) → chỉ scalar/comparable; `FIXME` list/map float (`:223`); `os.Exit(0)` vượt limit (`:257-264`).
- Mấu chốt: **user viết thân hàm gọi `fn(...)` bình thường**, không chèn logging — wrapper ghép quanh thân hàm (`_fn` = thân user, `fn` = tracker). `safeStringify` xử lý `Infinity/-Infinity/NaN` (`:38-45`, `:117-120`, `:194-200`).

### 2.3 Memoization
- Toggle UI → `options.memoize` → `buildRunner` (`runner/index.ts:26,36`) → biến `memoize` (`source-code.ts:347`).
- Cache theo **chuỗi JSON của args**; trúng cache **vẫn tạo node mới** (`currId++` trước check, `:65-86`) nhưng là **lá, không đệ quy**, gắn `memoized`; log "gets X from memory" (`final-tree.ts:41-46`); node memoized tô màu khác (`graph/index.tsx:44-50`, `vertice.tsx:62-88`).
- Hệ quả: các lời gọi trùng args là **nhiều node rời**, không nối về node gốc (không dùng chung subtree). Test: memoize giảm số bước — `lambda/tests/runner/index.test.ts:129-175`.
- Hạn chế: `undefined`/`None` không cache (`:80`, `is not None` `:157-162`); node memoized vẫn tính vào MAX_RECURSIVE_CALLS; không phát hiện chu trình.

### 2.4 Chống crash (5 lớp)
1. **Max 256 lời gọi** (`config.ts:8`), enforce **trong code user** (`source-code.ts:56-63` JS, `:134-140` Py, `:257-264` Go) → `ExceededRecursiveCallsLimit` → HTTP 422 (`initial-tree.ts:86-88`; `errors/tree.ts:14-19`; `index.ts:22-23`).
2. **Timeout 28000ms** (`config.ts:7`; exec `initial-tree.ts:82-84`); `err.killed` → `TimeoutError` (`initial-tree.ts:99-100`; `errors/child-process.ts:39-44`). Test vòng lặp vô hạn 3 ngôn ngữ — `index.test.ts:612-648`.
3. **Lỗi runtime/compile**: parse stderr regex lấy dòng lỗi đẹp → 422 (`errors/child-process.ts:10-37`; `initial-tree.ts:99-103`).
4. **Cây rỗng** (không gọi `fn`) → `EmptyTree` 422 (`initial-tree.ts:92-96`; `errors/tree.ts:9-12`).
5. **Giới hạn size source 384e6 bytes** (`config.ts:10`; check `initial-tree.ts:47-51`; `errors/tree.ts:21-26`).
6. Dọn dẹp: luôn `rmSync` file tạm (`:104-106`); lỗi bất ngờ → 500 (`index.ts:26-29`).
- Chưa xác minh: `exec` không set `maxBuffer` (mặc định 1MB) → stdout cực lớn có thể bị cắt (suy luận).

## 3. Hiển thị cây

- **Không d3/react-d3-tree** — SVG thuần + styled-components (`web/src/components/graph-viewer/graph/index.tsx:16-57`).
- **Layout tính ở server** bằng **Reingold-Tilford / Buchheim tự viết**: `intermediate-tree.ts:15-168` — node `x,y,mod,thread` (`:3-13`), `firstTraversal` post-order + `shiftRightSubtree`/`contour` (`:57-136`), `lastTraversal` cộng `mod` ra tọa độ (`:139-149`), `y = depth + 1` (`:48`). Scale `SCALED_BY=[85,150]`, `TRANSLATED_BY=[50,50]`, xuất `svgBottomRight` (`final-tree.ts:140-146`).
- **Cuộn/zoom:** `viewBox="0 0 w h"` auto-fit; **không** zoom/pan/wheel/drag. **Không click-select node** (chỉ hover CSS `vertice.tsx:78-87`); node "current" theo bước thời gian (`graph/index.tsx:44-50`).
- **Animation theo bước:** `toFinalTree` chạy **Euler tour** sinh `times[]` (node hiện tại), `timeRange[start,end]` cho **cả 2 chiều** cạnh (đi xuống + quay lui), `logs[time]` (`final-tree.ts:18-75`; test `tree-viewer.test.ts:69-98`). Client render theo `time` (`graph/index.tsx:19-54`).
- **Playback:** `useInterval` 200ms (khi `animate`) hoặc nhảy cuối; progress bar seek + first/prev/next/last (`graph-viewer/index.tsx:12,49-55`; `progress-bar.tsx:29-55`); log bar (`log-bar.tsx:8-10`).
- **Nhãn:** node label = args nối `,` (`final-tree.ts:87`, `labelize` `:127-131`); số lớn > 1e5 → ký hiệu khoa học; label dài scale-down CSS (`vertice.tsx:29-49`); bán kính 35 (`:5`). Giá trị trả về hiển thị **trên cạnh** (`directed-edge/index.tsx:78-80`).
- **Vẽ cạnh:** cắt đoạn theo bán kính bằng vector math (`directed-edge/utils.ts:26-33`); arrow marker SVG + SMIL `beginElement()` (`:20-33,37-49,58-76`).

## 4. Client-side hay backend?

- Client (Next.js 14, App Router) **chỉ parse text và render**; **không eval, không Worker, không sandbox** (grep `eval(|new Function|Worker|vm2|isolated-vm|sandbox` — 0 usage).
- **Bắt buộc backend**: code chạy trong **AWS Lambda container**, qua **API Gateway REST** (endpoint hard-code `web/src/api.ts:17`). Lambda `timeout=45s, memory=512MB` (`terraform/main.tf:93-102`); API GW integration timeout `29000ms` (`main.tf:175`). Image + Go build cache `XDG_CACHE_HOME=/tmp/.cache` (`Dockerfile:2-13`).
- Bảo mật: endpoint công khai **không auth**, CORS `*` (`lambda/src/index.ts:40-44`), URL lộ trong bundle client — ai cũng chạy được code (chỉ cách ly bằng container).

## 5. Bài học cho StepDSA ("nhập hàm đệ quy tùy biến" an toàn trong trình duyệt)

1. **Đừng eval ở main thread**: JS → **Web Worker** có "step budget" + `worker.terminate()` watchdog (Worker không phải security boundary; code không tin cậy → iframe `sandbox="allow-scripts"` origin riêng + postMessage; hoặc runner từ xa). Python → Pyodide trong Worker (áp dụng prelude/postlude như repo).
2. **Kỹ thuật wrapper `_fn`/`fn`**: tracker tạo node, nối cha qua `stack`, ghi `weight` trả về, cache args — làm được không cần cắt chuỗi thủ công (JS: Babel transform/Proxy); output chuẩn JSON `{vertices:{id:{argsList,adjList:[{childId,weight}],memoized}}, fnResult}`.
3. **Tách 3 tầng capture → layout → view time-based**: Reingold-Tilford + **Euler tour `times[]`/`timeRange`/`logs[]`** — tua/step/animation không tính lại cây; client chỉ render time slice; **thêm zoom/pan + click-select** (repo thiếu).
4. **Giới hạn cứng + lỗi có kiểu**: cap node (2–5k) và steps ngay khi capture, timeout cứng, map lỗi thành message nghiệp vụ, cap output JSON (repo không set `maxBuffer`), cleanup `finally`.
5. **Memoization là chế độ hiển thị rõ ràng** (toggle, màu, log); cải tiến: cache key → **id node gốc**, vẽ **cạnh về subtree gốc** thay vì nhân bản node lá. Cảnh báo: `JSON.stringify(args)` thứ tự key; `None/undefined` không cache; giả định node gốc id 0.
6. **Nếu làm runner từ xa**: đừng copy sai lầm vận hành — endpoint không auth + CORS `*` + URL lộ = mời gọi lạm dụng; cần auth/rate-limit/captcha; timeout nhỏ hơn trần platform; cảnh giác chi phí `go run` compile mỗi request.

## 6. Chưa xác minh
- Hành vi thực tế của endpoint công khai (không gọi thử).
- `exec` maxBuffer overflow (suy luận).
