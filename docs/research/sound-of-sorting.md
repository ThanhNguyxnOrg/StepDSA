# Teardown: The Sound of Sorting (917 ⭐, GPLv3)

> Khảo sát read-only ngày 2026-11-15 từ source clone `bingmann/sound-of-sorting` (shallow, 1 commit `5cfcaf7`, version 0.6.5 `configure.ac:5`).
> GPLv3 → **chỉ rút ý tưởng, không copy code**. Không build/không chạy; nhận xét runtime là suy luận từ mã.

## TÓM TẮT

- Kiến trúc: `WMain` (điều khiển + SDL + timer 30fps), `WSortView` (panel vẽ + interface `SortDelay` + thread thuật toán), `SortArray` (mảng *instrumented* + generators + đếm), `SortAlgo` (thuật toán + `g_algolist` + iterator adapter), `SortSound.cpp` (engine âm thanh SDL callback). **Không có file `SortAlgoStats`** — số liệu nằm trong `SortArray` + `WMain`.
- Tách instrumentation: lớp giá trị `ArrayItem` overload toán tử (đếm + phát âm thanh), container `SortArray` overload `[]`/`set`/`swap` (đếm + delay + tô màu); thuật toán không chứa mã đếm.
- Âm thanh: 44.1 kHz mono 16-bit, buffer 4096 mẫu (~93 ms); value→`f = 120 + 1200·(v/vmax)²` (120–1320 Hz, README ghi 1212); sóng tam giác + ADSR (A 2.5%, D 10%, S 0.9, R 30%); mỗi so sánh = 2 oscillator; thời lượng nốt = delay × sustain × 44100; trần 512 oscillator + voice stealing; chuẩn hoá gain theo đỉnh buffer (giảm ngay/tăng chậm 0.9), scale 24000, clip ±32200.
- Đếm realtime: `g_compare_count`/`g_access_count` (swap = 2 access; ternary cmp = 1 compare; trừ đếm ở bước kiểm tra sorted); hiển thị 30fps cùng Inversions/Runs.
- Step: mỗi array access gọi `DoDelay` → nếu `m_stepwise` chờ semaphore (timeout 200 ms để kiểm tra hủy); nút Step post semaphore. Speed slider 0..2000 → delay 0…2000 ms theo hàm mũ (mặc định 14.14 ms).
- 6 generator: random, ascending, descending, cubic skew, quintic skew, "n-2 equal"; cheat-sheet PDF không có trong repo (chỉ link trên website).
- 5 bài học cho StepDSA (Web Audio): (1) hàng đợi sự kiện + rải lịch trong cửa sổ frame; (2) duration gắn tốc độ + pool voice có voice-stealing; (3) ADSR/triangle + gain staging (compressor = bản hiện đại của AGC); (4) mapping giá trị→tần số phi tuyến, có sàn/trần; (5) dedupe/debounce tại lớp instrument, chỉ emit khi không mute.

## 1. Kiến trúc GUI C++ — vai trò từng file

| File | Vai trò | Điểm neo |
|---|---|---|
| `src/wxg/main.cpp` | bootstrap wxApp | `wxg/Makefile` |
| `src/wxg/WMain_wxg.h/.cpp` | Form wxGlade sinh: ID widget, slider, label | `WMain_wxg.h:39-49`; widget `WMain_wxg.cpp:25-56`; tooltip `:58-73`; label đếm `:115-126`; slider Speed/Sustain `:37-39`; Array size `:47` |
| `src/wxg/sos.wxg` | "source of truth" GUI (XML) — range slider 0..2000 / 1..2048 (`sos.wxg:163,206,356`) | |
| `src/WMain.h/.cpp` | Controller: SDL audio, thread thuật toán, Run/Reset/Step/Sound/Random, timer 30fps | `WMain.cpp:80-95` (SDL); `:132-163` (RunAlgorithm); `:165-178` (Abort); `:419-439` (timer); `g_framerate=30` `WMain.h:36` |
| `src/WSortView.h/.cpp` | View: kế thừa `wxPanel` + `SortDelay`; vẽ cột; chứa `SortArray`; cổng delay/step | `WSortView.h:59-60,69,88-99,107-121`; `DoDelay` `WSortView.cpp:77-107`; `paint` `:146-240`; thread `:252-275` |
| `src/SortArray.h` | `ArrayItem` (giá trị instrumented), `SortDelay` (interface), `SortArray` (container + generators + counters + marks/watch) | `:48-51,54-120,124-130,134-446` |
| `src/SortArray.cpp` | hooks đếm/âm thanh, `FillData` 6 schema, inversion/runs, màu | `:38-49,60-103,105-189,191-197,199-226,243-324,326-411` |
| `src/SortAlgo.h/.cpp` | 30+ thuật toán + `g_algolist` + `MyIterator` cho STL | bảng `SortAlgo.cpp:46-118`; `MyIterator` `SortAlgo.h:109-190`; `SelectionSort` `:130`; `RadixSort*` `:906/963/973`; `StlSort` `:1019` |
| `src/SortSound.cpp` | **Toàn bộ engine âm thanh** | `:39-332` |
| `src/SortTest.cpp` | CLI test: mọi thuật toán × mọi input, so khớp `std::sort` | `:55-60,62-84,86-144`; `Makefile.am:19-25` |
| `src/wxClickText.h/.cpp` | Label click được (Inversions) | `wxClickText.cpp:37-48` |

Tách tầng: `WMain` (I/O) → `WSortView` (view + timing) → `SortArray`/`ArrayItem` (model instrumented) → `SortAlgo` (thuật toán thuần). Engine âm thanh không được thuật toán gọi trực tiếp; chỉ nhận sự kiện qua `SoundAccess()`/`SoundReset()` (`WSortView.h:34-46`).

## 2. Tách "instrumentation" khỏi thuật toán

- `ArrayItem` (`SortArray.h:54-120`): mọi toán tử so sánh (`:83-99`; `cmp()` ternary `:102-106`) → `OnComparison(a,b)` → tăng `g_compare_count` + đẩy 2 giá trị vào âm thanh (`SortArray.cpp:43-49`). *Mọi* so sánh bị "bắt" mà thuật toán không cần sửa.
- Truy cập: `operator[]` (`SortArray.h:267-286`), `get_mutable` (`:289-309`), `get_nocount` (`:312-332`), `set` (`:335-351`), `swap` (`:355-377`) — mỗi thao tác tăng `g_access_count` (`SortArray.cpp:191-197`) rồi gọi delay (`SortDelay` interface, `SortArray.h:124-130`; `WSortView::DoDelay` `WSortView.cpp:109-112`).
- Delay chỉ xảy ra ở **array access** → "một step" = một lần truy cập mảng.
- So sánh "không quan sát": `equal_direct/less_direct/greater_direct` (`SortArray.h:110-117`) cho inversions + bước kiểm tra (`SortArray.cpp:199-226`).
- `ArrayItem::get()` (`SortArray.h:72-73`) → `SoundAccess(value)` (`SortArray.cpp:38-41`) → radix sort có âm thanh dù không so sánh (`SortAlgo.cpp:923,941,945,990,1008,1012`).
- Adapter STL: `MyIterator` (`SortAlgo.h:109-190`), `operator*` → `get_mutable` (`:158-165`) → `std::sort(MyIterator…)` (`SortAlgo.cpp:1019-1032`) vẫn quan sát được nhưng mất `mark/watch/swap` → `inversion_count_limit = 512` (`SortAlgo.cpp:44`, `:107-118`).
- Hooks hình ảnh: `touch` (`SortArray.h:380-392`; `SortArray.cpp:326-365`), `mark/unmark/unmark_all` (`:394-426`), `watch/unwatch_all` theo con trỏ `volatile ssize_t*` (`:428-445`; ví dụ `SelectionSort` watch `jMin` `SortAlgo.cpp:133`).
- Hệ quả (từ mã): (a) sao chép vào mảng phụ không được đếm; (b) `std::swap` trên `ArrayItem&` không qua `SortArray::swap`; (c) `get_mutable`/`set` gọi `RecalcInversions()` (`SortArray.h:307,349`) — **O(n²) mỗi lần truy cập khi bật đếm inversions** → phải tắt hoặc giới hạn.

## 3. Audibilization — engine âm thanh

- **Thiết bị xuất:** SDL 44100 Hz, `AUDIO_S16SYS`, mono, 4096 samples (~93 ms/callback); callback = `SoundCallback`, userdata = `WSortView` (`WMain.cpp:80-95`; `SortSound.cpp:39`). Thread SDL ↔ thread thuật toán qua hàng đợi có mutex.
- **Hàng đợi:** `s_access_list` (`SortSound.cpp:202`) + mutex (`:205`); `SoundAccess(size_t)` nhận **giá trị mảng** (`:208-216`), return ngay nếu `g_sound_on == false` (`:210`) → mute không tốn CPU; `SoundReset()` xóa `s_pos` + oscillators (`:225-232`).
- **Map giá trị → tần số:** `arrayindex_to_frequency` (`:219-222`, tên gây nhầm — nhận giá trị): `f = 120 + 1200·x²`, `x = value / array_max` (`:263-264`). Dải **120 → 1320 Hz**; README ghi "120–1,212 Hz" (`README.md:68`) — chưa xác minh nguyên nhân lệch. Map bậc hai nén vùng nhỏ, giãn vùng lớn.
- **Lên lịch trong buffer:** mỗi callback lấy cả hàng đợi, `pscale = size / N` (`:259`) → oscillator i bắt đầu `p + i·pscale` (`:266`) — sự kiện trong 1 callback **rải đều** theo trục mẫu. Mỗi so sánh đẩy **2 giá trị** → 2 oscillator = "quãng hai nốt".
- **Oscillator & envelope (`:51-162`):** dạng sóng sin / sin³ (comment) và **triangle được chọn** (`:75-103`); ADSR `:108-135`: attack 2.5%, decay 10%, sustain 0.9, release 30% (`:120-123`); mix cộng dồn (`:140-151`). Duration mặc định 44100/8 = 125 ms (`:65`); từ sự kiện = `g_delay/1000 · g_sound_sustain · 44100` (`:266-267`) — **nốt ngắn/dài theo tốc độ** (mặc định ≈ 55.6 ms).
- **Chống "ứ âm" (3 tầng):**
  1. Trần `s_max_oscillators = 512` (`:48`); `add_oscillator` (`:171-199`) tái dùng oscillator hết hạn; hết chỗ → **thay cái cũ nhất** (voice stealing `:189-198`).
  2. Duration tỉ lệ delay/sustain → chạy nhanh nốt ngắn, tự giảm chồng lấn.
  3. Chuẩn hoá gain theo đỉnh buffer: `vol = max(wave)` (`:297`); giảm ngay/tăng chậm `vol = 0.9·oldvol` (`:299-307`); nội suy `24000·wave[i]/vol`, clip ±32200 (`:311-325`) — AGC/compressor tự chế, đỉnh ≈ 73% full-scale. Cảnh báo: dùng `max_element` (không `abs`) → buffer toàn âm bất thường; clip cứng có thể méo.
  4. Mute: callback xuất 0 khi `g_sound_on` false (`:237-240`); GUI `SDL_PauseAudio(0/1)` (`WMain.cpp:260-273`).
- **Race tiềm ẩn:** callback đọc `array_max()` (`:263`) khi main thread có thể đang `FillData`; `SoundReset` không khoá riêng cho `s_pos`/`s_osclist` (`:225-232`). Bản Web Audio nên **snapshot tham số**.

## 4. Đếm chỉ số realtime

- Compares: `++g_compare_count` trong `ArrayItem::OnComparison` (`SortArray.cpp:45`) — mọi thuật toán, kể cả `std::sort` qua iterator. Ternary `cmp()` = 1 (`SortArray.h:102-106`; README.md:57-58).
- Accesses: `++g_access_count` trong `SortArray::OnAccess` (`SortArray.cpp:193`) — `operator[]`, `get_mutable`, `get_nocount` (trừ lại 1, `SortArray.h:327`), `set` (1), `swap` (**2**, `:373-375`).
- "Swaps" không có biến riêng — suy qua swap() tạo 2 access.
- Bước kiểm tra cuối hiệu chỉnh: `g_compare_count--` (`SortArray.cpp:213`), `get_nocount` (`SortArray.h:327`).
- Hiển thị: timer 30fps (`WMain.h:36`, `WMain.cpp:101`) đọc biến toàn cục, set label + `Refresh(false)` (`WMain.cpp:419-439`); label "Comparisons:", "Array Accesses:", "Inversions:", "Runs:" (`WMain_wxg.cpp:115-126`); Inversions là `wxClickText` bật/tắt (`WMain_wxg.cpp:43,69`; `WMain.cpp:340-343`), quá lớn → "skipped" (`WMain.cpp:428-432`).
- Chỉ số chất lượng input: `GetInversions`/`RecalcInversions`/`UpdateInversions` (`SortArray.cpp:243-306`), `GetRuns` (`:308-324`).

## 5. Step mode + speed slider

- Speed: slider 0..2000 (`WMain_wxg.cpp:37`) → `SetDelay` (`WMain.cpp:313-333`): `g_delay = 4^(pos/2000 · ln(20000)/ln4)/10` (GTK); `pos=0 → 0 ms`; 500 → 1.19 ms; **1000 → 14.14 ms**; 1500 → 168 ms; 2000 → 2000 ms. Nhánh không-GTK bỏ /10 (`:323`).
- Sustain: slider 0..2000 (`WMain_wxg.cpp:39`) → `g_sound_sustain = 4^(pos/2000·ln50/ln4)` (`WMain.cpp:345-355`) ⇒ 1…50×, mặc định 700 → 3.93×.
- Delay/step trong thread thuật toán: mỗi access → `DoDelay` (`SortArray.cpp:191-197`, `WSortView.cpp:109-112`). `DoDelay` (`WSortView.cpp:77-107`): assert thread (`:79-81`), kiểm tra cờ hủy (`:83-84`), **`m_stepwise` → chờ semaphore `WaitTimeout(200 ms)`**, timeout → `TestDestroy()/Yield()` (`:87-95`), sau đó ngủ vi mô (`:99-106`).
- Nút Step (`WMain.cpp:240-258`): chưa chạy → `RunAlgorithm()` + `SetStepwise(true)`; đang chạy → `Resume()` + stepwise; cuối cùng post semaphore (`WSortView.cpp:114-120`).
- Run toggle = pause/resume thread (`WMain.cpp:180-213`); Reset = `AbortAlgorithm()` (`:165-178`); kết thúc post `ID_RUN_FINISHED` (`WSortView.cpp:271-272`).
- Vẽ độc lập tốc độ nhờ timer 30fps + double-buffer (`WSortView.cpp:131-138,146-240`); `m_access1/m_access2` cột đỏ cuối, `m_access_list` vệt truy cập, `mark/watch` màu thuật toán (`SortArray.cpp:326-411`).
- `g_algo_running`, `g_algo_name` (`WSortView.h:54,57`) chỉ ghi không đọc.

## 6. Input generators + test harness

- 6 schema (`SortArray::FillInputlist`, `SortArray.cpp:105-113`; `WMain.cpp:57-63`): 0 Random Shuffle [1,n] (`:121-127`), 1 Ascending (`:128-132`), 2 Descending (`:133-137`), 3 Shuffled Cubic (x³ chia 3 — giảm độ phân giải/trùng giá trị, `:138-154`), 4 Shuffled Quintic (x⁵, `:155-171`), 5 "n-2 Equal" — few-unique (`:172-182`); fallback schema 0 (`:183-186`). `FinishFill` (`:188`) tính `m_array_max`, reset counters, tính inversions (`:80-103`).
- Kích thước: slider 1..2048 (`WMain_wxg.cpp:47`; `WMain.cpp:362-372`), mặc định 100 (`WMain.cpp:62-65`).
- Cheat-sheet PDF không có trong repo (website link `SoS-CheatSheet.pdf`, 174 KiB).
- Test harness `src/SortTest.cpp`: mọi thuật toán × 6 input × size (`:55-60`), kiểm chứng `CheckSorted()` (`SortArray.cpp:199-226`) + so multiset với `std::sort` (`SortTest.cpp:62-84`) — "lưới an toàn" đáng bắt chước.

## 7. Đáng học gì cho bản Web Audio tự viết (StepDSA)

1. **Kiến trúc sự kiện, không gọi âm thanh trong thuật toán**: wrapper đẩy `{value}` vào queue; audio lấy theo batch. Web Audio: gom sự kiện theo `requestAnimationFrame`, `schedule` bằng `ctx.currentTime + lookahead (20–50 ms)`, rải offset trong khoảng frame (tương đương `pscale`).
2. **Đa âm có trần + voice stealing**: pool 24–48 `OscillatorNode`+`GainNode`, tái dùng node đã `stop()`, cướp voice cũ nhất. Trần sự kiện/frame ≤ pool size.
3. **Envelope + dạng sóng**: tam giác + ADSR attack ≥1–3 ms (tránh click), decay 10%, sustain 0.9, release 30%; `linearRampToValueAtTime`, `stop()` sau release. Thử `sin³` hoặc low-pass.
4. **Gain staging thay tự chuẩn hóa thủ công**: master `GainNode` + `DynamicsCompressorNode` (threshold ≈ −12 dB, ratio 4–8, knee mềm), hoặc gain mỗi nốt ≈ 0.7/√N; đỉnh ≈ −3 dBFS.
5. **Mapping giá trị → tần số**: sàn ~100–150 Hz (tránh ù), trần ~1.2–1.5 kHz (tránh chói); luật x² hoặc log `f = fmin·(fmax/fmin)^x`; có thể pan L/R cho "hợp âm so sánh".
6. **Duration gắn với tốc độ**: duration = stepDelay × sustainMultiplier; slider "Sustain" 1–50× (mặc định ~4×).
7. **Debounce/dedupe**: bỏ qua truy cập lặp liên tiếp cùng index; mute → không enqueue; coalesce khi mật độ > ngưỡng (> 8 sự kiện/frame thì lấy mẫu thưa).
8. **Counter trong wrapper, không trong thuật toán**: `arr.get(i)/set(i,v)/swap(i,j)/compare(a,b)` trả counter chuẩn hoá + cờ `isSoundEvent`; swap = 2 access; ternary = 1.
9. **Step/pause trong JS**: `await gate` ở mỗi access: paused ⇒ await Promise; mỗi click Step ⇒ resolve 1 lần; kèm `AbortSignal`. Khi pause **không** phát nốt mới, nốt đang kêu release tự nhiên.
10. **Snapshot trạng thái cho audio**: gửi kèm `valueMax` trong mỗi sự kiện (tránh race như SoS).

## 8. Chưa xác minh

- README 120–1212 Hz vs mã 1320 Hz — chưa rõ nguyên nhân (shallow clone).
- Nội dung `SoS-CheatSheet.pdf`.
- Nhận định runtime (latency 93 ms, voice stealing, méo clip, race) là suy luận từ mã.
- `SortArray::SaveAccess` khai báo không định nghĩa; `g_algo_running`/`g_algo_name` chỉ ghi.

## 9. Bảng tra cứu nhanh

- Âm thanh: `SortSound.cpp:39` (samplerate) · `:45,48` (sustain, trần 512) · `:65` (dur) · `:88-103` (triangle) · `:108-135` (ADSR) · `:140-151` (mix) · `:171-199` (pool/stealing) · `:208-216` (SoundAccess) · `:219-222` (freq) · `:225-232` (reset) · `:235-332` (callback; `:259` spread; `:263-264` map; `:266-267` duration; `:287-328` AGC/clip) · `:237-240` (mute).
- Đếm: `SortArray.cpp:34-36,38-49,191-197,199-226` · `SortArray.h:48,51,72-73,83-106,267-377`.
- Step/speed: `WSortView.cpp:77-120` · `WSortView.h:88-99` · `WMain.cpp:240-258,313-333,345-355`.
- Input: `SortArray.cpp:105-189` · `WMain.cpp:57-65`.
- Thuật toán: `SortAlgo.cpp:44,46-118,1019-1032` · `SortAlgo.h:109-190`.
- Test: `SortTest.cpp:55-84` · `Makefile.am:5-25`.
