# ROUND 2 — Điều tra các web rating cao còn lại (2026-11-16, craft-anything live)

> Vòng 2 sau `PRODUCT_TEARDOWN.md`: USFCA Galles, hello-algo, LeetCodeAnimation web (algomooc.com), Red Blob Games, CS Academy, OpenDSA live.
> Phương pháp: craft-anything browser (Chrome riêng tư + screenshot + capture HTML) — mọi kết luận kèm evidence id.

## 1. USFCA Galles (cs.usfca.edu) — bản mẫu "tối giản là vua"

**Quan sát (BST + Algorithms + Source):**
- **Transport đáy canvas**: `Skip Back | Step Back | Pause | Step Forward | Skip Forward` + **slider "Animation Speed"** + dòng message ("Animation Completed") + tham số canvas W/H + "Change Canvas Size" + "Move Controls" (người dùng kéo được panel điều khiển!) — ev_34f1595d…, ev_69876c28…
- **Nhập liệu trực tiếp từng thao tác**: mỗi thao tác = 1 ô nhập + 1 nút (`Insert`, `Delete`, `Find`, `Print`) — không dropdown, không preset phức tạp. ev_34f1595d…
- **Trang Source = tutorial "Create Your Own" đầy đủ** — ev_a585fc8d…, ev_db32d302…:
  - Một visualization mới = **1 file JS + 1 file HTML template**; tải bản `visualizations*.tar` (nén/không nén).
  - Kiến trúc: subclass `Algorithm` (`init`, `ctrlControls`, `reset`, `implementAction`) → **sinh mảng command string** (`this.cmd(...)`) → **Animation Manager** phát từng command theo **`this.cmd("step")`** (mỗi step = một đơn vị hoạt ảnh); `undo`/`end` event để rollback toàn bộ thao tác; "callbacks không được tự làm việc — dồn vào `implementAction`".
  - Điều khiển bằng API: `anim.addControlToAlgorithmBar(...)` (button/textbox/checkbox/radio), `anim.createCircle(...)`, `anim.move(...)`.

**Bài học cho StepDSA:**
1. Củng cố mạnh thiết kế command-stream/timeline của StepDSA (khớp cả algorithm-visualizer lẫn USFCA): **một "step" = biên một đơn vị mô phỏng** — StepDSA đã có (frames) và hơn ở pedagogy.
2. **"Jump to End"** còn thiếu trên thanh transport trong khi USFCA có "Skip Forward" — thêm nút (đối xứng với Jump to Start).
3. Mô hình phân phối "Create Your Own (JS+HTML)": StepDSA có Personal Code Studio (CLI/code tùy biến) → về lâu dài có thể phát hành **"module tự tạo" chia sẻ được qua permalink** (nối với P1 đã làm).

## 2. hello-algo — animation nhúng trong mạch lý thuyết

**Quan sát (chương Bubble Sort, bản EN):** ev_30413461…, ev_ff1ddac7…
- **Figure 11-4**: animation nằm giữa văn bản, có nút play + tiến độ `← 1/7 →`, **caption mô tả** ("Imagine the array as a row of bubbles…"), đánh số hình.
- **Figure 11-5**: hình tĩnh "all passes" (từng pass đánh dấu vùng đã sắp xếp + bảng khoảng chưa sắp xếp).
- **Code tabs 13 ngôn ngữ** (Python/C++/Java/C#/Go/Swift/JS/TS/Dart/Rust/C/Kotlin/Ruby), **tab = tên file** (`bubble_sort.py`), comment dạy học trong code; bản "optimized + flag" tách mục riêng (11.3.2).
- Mỗi code block có nút **"Visualize execution"** (mở Python Tutor mang theo code đó).
- **11.3.3 Algorithm properties**: bullet độ phức tạp có inline math (O(n²), Ω(n)…) + bảng complexity image.
- Điều hướng chương trước/sau + "Share your insights…" (comments).

**Bài học cho StepDSA:**
1. **Animation ngay trong mạch đọc** (không phải mở tab riêng): StepDSA hiện tách Workbench; trong tương lai có thể nhúng "mini-player" vào TheoryDrawer.
2. **Caption + số hình** cho từng animation — StepDSA có `StepNarrationBanner`; có thể thêm "caption" ngắn kiểu figure.
3. **Tab code theo tên file + nút chạy/visualize ngay dưới code** — StepDSA có CodeInspector; thêm hành động "mở trong Personal Code Studio" khi snippet tồn tại là lựa chọn tốt.
4. Bảng độ phức tạp dạng trực quan (image/bảng) trong theory.

## 3. LeetCodeAnimation web = algomooc.com — "lớp học hoàn chỉnh"

**Quan sát (trang two-sum):** ev_362314ab…, ev_a8a9684d…
- Player: tabs **先看动画演示 / 听吴师兄讲** (xem animation / nghe giảng), **▶▶ 播放动画**, **voice narration 2:32** (🔊), **speed 1.25×**, **"主线 27"** + thanh tiến độ, nút tua/tiếp, phụ đề (字幕).
- **Cấu trúc bài học 6 phần**: ① 题目描述 (đề + ví dụ I/O) → ② 思路解析 (một câu trả lời gọn → vì sao cách ngây thơ fail → vì sao hash map → vì sao thứ tự kiểm-tra-trước-khi-chèn quan trọng → complexity + edge) → ③ 参考代码 (Python/C++/Java tabs, comment dạy học) → ④ 复杂度 → ⑤ **易错点 (3 cặp ❌错误写法 vs ✅正确写法)** → ⑥ **面试追问 (Q&A mở rộng)**.
- Sidebar: TOC, video 22 phút, tiến độ chủ đề (3/20), **"卡住了？问小欧" chips** (câu hỏi gợi ý bấm là hỏi AI tutor), **相关题目** (bài liên quan).
- 256 bài LeetCode có animation, 编码注释 "看懂代码不等于写得出…" + editor inline (问小欧).

**Bài học cho StepDSA:**
1. **"Pitfalls: wrong vs right"** là mục cực giá trị cho người học — StepDSA đã có `theory.pitfalls`; nâng cấp thành cặp ❌/✅ trong theory panel là bước tiến rõ rệt (backlog P2).
2. **Hỏi-đáp gợi ý (chips)** + bài liên quan — StepDSA có thể thêm "Câu hỏi thường gặp" tĩnh + cross-link module liên quan (metadata mới `relatedModules`).
3. **Voice narration** — ngoài phạm vi ngắn hạn.

## 4. Red Blob Games — scrollytelling chuẩn mực

**Quan sát (A* introduction):** ev_b019683b…, ev_0d54b751…
- Mỗi khái niệm = **một mini-canvas riêng** với **"▶ Start animation"** hoặc **"< Step Backward | Step Forward >"**; diagram đổi theo đoạn văn; code Python ngắn nằm ngay cạnh diagram tương ứng; màu nhất quán (frontier/visited/path).
- Chuỗi: map → graph → grid → BFS (animation + step) → code → reconstruct path → …

**Bài học cho StepDSA:** cho phép "mini-visualizer" tái dùng engine (timeline) trong TheoryDrawer/About (P3) — mỗi khái niệm một canvas nhỏ với step controls.

## 5. CS Academy Graph Editor — không quan sát được (trung thực)

- Hai lần capture (kể cả chờ 5s) đều ra **ảnh trắng** — ev_457d30c6…, ev_62a05ef1…. Ghi nhận: không xác minh được UI; giữ tham chiếu từ mô tả cộng đồng ("editor vẽ graph cho competitive programming").

## 6. OpenDSA live

- Trang sách CS3 mở + capture thành công (ev_d9f2bc06…, ev_9ec6949d…) — chi tiết cơ chế đã có trong `opendsa.md` (nguồn); vòng này xác nhận site công khai truy cập được, dùng làm tham chiếu khi làm proficiency exercise.

---

## 7. Cải tiến chốt từ Round 2 (đưa vào code)

| Ưu tiên | Cải tiến | Nguồn học |
|---|---|---|
| ✅ Ngay | **Nút "Jump to End"** trên transport (đối xứng Jump to Start) | USFCA "Skip Forward" · Clement instant |
| P2 | Theory: cặp **❌/✅ pitfalls** + "Câu hỏi thường gặp" | algomooc 易错点/面试追问 |
| P2 | "Mở trong Personal Code Studio" từ code block + caption/số hình cho stage | hello-algo "Visualize execution" / figure captions |
| P3 | Mini-visualizer nhúng trong TheoryDrawer | hello-algo + Red Blob |
| P3 | `relatedModules` cross-link + chips gợi ý | algomooc 相关题目/问小欧 |
| — | (Không làm ngay) voice narration, 13 ngôn ngữ, AI tutor | algomooc |

## 8. Evidence ids (phiên 2026-11-16)

| Quan sát | Evidence |
|---|---|
| USFCA BST (transport + speed + message + W/H/Move Controls) | ev_34f1595d4b41912a381acde66056853d887d1ad80be341bae7f1dc2f1878851c |
| USFCA BST open | ev_69876c28d07edca9110d1c28be985686095ea7cf6fd1993a7a5feefe835456e0 |
| USFCA Source/tutorial Create Your Own | ev_a585fc8d9b271c9ce95c9aa983c55e80a5a4a4f1823188acd01e7e342cd41464, ev_db32d302dcf669d622e2925562fc04833f8f90e54bc8841c81bc1377f62cc510 |
| hello-algo bubble sort (animation 1/7, 13 tabs, Visualize execution) | ev_304134610258f3e4a115830b35c9d459c882dfd6f486c81fe3863cc4e2897707, ev_ff1ddac7e38fb845f3c7a3dbf1263c783ba2dcb1893a29b8c5a78e56a499b076 |
| algomooc two-sum (player 1.25× + voice, 易错点, 面试追问, chips) | ev_362314ab48a8fbffe649a3f97d3bf180d542259cb41128cf51d1ee0a2ea29e47, ev_a8a9684db76494c700832929c6dd2ec5dd15efc157a44bd3921e49f881f89ad3 |
| Red Blob A* (Start animation + Step Backward/Forward per section) | ev_b019683b556833eac6ef3cb0d54ffecfed1a962636b8aadb0791bb6e8bb6785f, ev_0d54b75124284191ffd95635be06104e683af5a4e11bea6b5c9d0bb7d8cf2065 |
| CS Academy (trắng — không quan sát được) | ev_457d30c6d8d3a9c3df28ed151b610ea6819cc17366e747cd3e8a1bcb6cec5036, ev_62a05ef146c0315e3ce70210e712c51354c33842d423a92736d3d7e4218aadf9 |
| OpenDSA live CS3 book | ev_d9f2bc061fdf4750bc6a3ba17850d84513fff753e39e548c08f64db348279682, ev_9ec6949d5b135166f80b38b16fb07aada72d105b08a4f5cda54fe753bcd57855 |
