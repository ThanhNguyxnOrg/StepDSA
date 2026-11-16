# Teardown: OpenDSA (eTextbook + proficiency exercises + auto-grading)

> Khảo sát read-only 2026-11-15 từ source clone `OpenDSA/OpenDSA` (219 MB, không build). Không có `Books/` (build target) → kết luận về trang build dựa vào code generator. Điểm chưa xác minh ghi rõ.

## 1. Kiến trúc tổng thể repo

**Top-level**: `AV/ Exercises/ lib/ RST/ SourceCode/ tools/ config/ Doc/ Metadata/ khan-exercises/ Obsolete/ github/ .github/ Fig/ DataStructures/` + `Makefile app.py serve.py docker-compose.yml Dockerfile{,.server,.deforms} package.json .pnp.cjs (yarn PnP) requirements*.txt`.

- Mô tả thư mục: `README.md:67-129` (README lỗi thời: nói có `JSAV/` nhưng clone không có — JSAV vendor tại `lib/JSAV.js` (bundle, `lib/JSAV.js:8616`: `v1.0.1-41-g1503fe4`), `lib/JSAVD3.js`, `lib/dataStructures.js`, `lib/JSAV.css`).
- `Books/` là build target (`.gitignore:35-36`), không có trong clone.
- Nội dung eTextbook: RST thuần — `RST/en/**` có **861 file .rst**; thư mục `RST/en/{Sorting,List,Binary,Graph,Hashing,AlgAnal,RecurTutor,PL,Blockchain,...}`; dịch `RST/fi, RST/pt, RST/py4e`.
- Cấu hình sách: `config/` có **66 file .json** (mỗi file = 1 "book instance").
- Build toolchain (Python): `tools/configure.py` (619 dòng), `tools/ODSA_Config.py` (526), `tools/ODSA_RST_Module.py` (916), `tools/postprocessor.py` (956), `tools/simple2full.py`, `tools/tafe/` (feedback engine cho Deforms), `tools/rst2json.py`, `tools/irt_curve.py`.
- Make: `Makefile:115-135` — mỗi `config/%.json` → `make <Book>` → `python3 tools/configure.py $< --no-lms`; `Makefile:123` liệt kê `allbooks`.
- Dev server: Flask `app.py` — static + API: `/api/configure/` (`:103-114`), `/api/simple2full/` (117-128), `/api/irtcurve/` (131-139), `/deforms/api/deformsfeedback/` (142-151); redirect `/Books/<book>/` → `html/index.html` (`:82-85`).
- `docker-compose.yml`: `opendsa` (8080), `deforms` (8081), `proxy` Traefik; CI: `.github/workflows/staging.yml`, `github/workflows/prod-compile-CS3-book.yml`.
- Sphinx directives tùy biến: `RST/ODSAextensions/odsa/*` (avembed, inlineav, odsafig, codeinclude, extrtoolembed, splicetoolembed, avmetadata, odsatoctree, showhidecontent, iframe, odsatable, chapnum, odsascript, odsalink, accessibility, revealjs_stub, numfig) — đăng ký `tools/config_templates.py:164`.
- KA framework vendor `khan-exercises/` (bootstrap `khan-exercises/local-only/main.js:44-56`; answer types `khan-exercises/utils/answer-types.js`).
- Client framework: `lib/odsaUtils.js` (1898), `lib/odsaAV.js` (611), `lib/odsaMOD.js` (1642), `lib/odsaKA.js` (900), `lib/splice-iframe.js`, `lib/timeme.js`.
- Tài liệu kỹ thuật: `Doc/source/Configuration.rst` (887), `Client-sideFramework.rst` (527), `Extensions.rst` (656), `EventMessages.rst` (92), `OpenDSA-LTI-Implementation.rst` (455), `KAExercise.rst` (266).
- Metadata: `Metadata/extract_metadata.py` sinh `SLCItem_metadata.json` cho SPLICE (`Metadata/README.md:3-24`).

## 2. Định nghĩa & chấm bài tập

### 2.1 Schema bài tập (3 mảnh ghép, không có JSON Schema trung tâm)
1. **File nội dung**: `Exercises/<Topic>/<Name>{MCQ,TF,FIB,Summ,PRO}.html` (+ JS) hoặc `AV/<Topic>/<Name>{PRO,CON}.js` (+ `.html`).
2. **JSON của AV**: `translations`, `params` (JXOP-*), `code` — ví dụ `AV/Sorting/heapsortPRO.json:1-44` (`"params": {"JXOP-feedback":"continuous","JXOP-fixmode":"fix"}` dòng 34-37).
3. **Entry trong config sách** (points/required/threshold/exer_options/remove/showhide) — `Configuration.rst:431-476`; validate ở `tools/ODSA_Config.py:117-121` (`validate_exercise`, 106-134), `:142-146` cho module.
- `JXOP-*/JOP-*` map thành URL param → `JSAV_EXERCISE_OPTIONS`/`JSAV_OPTIONS` (`lib/odsaUtils.js:130-140`); build nối vào directive (`tools/ODSA_RST_Module.py:732-742`).

### 2.2 Các loại exercise
- Directive: `.. avembed:: path {ka|pe|ss|dgm}` (`Extensions.rst:24-51`), `.. inlineav:: id {ss|dgm|ff}` (215-277), `.. extrtoolembed::` (110-133), `.. splicetoolembed:: url` (CodeCheck/CodeWorkout — `RST/en/Development/splice_codecheck.rst:35`).
- Thống kê trong `RST/en`: `avembed ka=567, pe=244, ss=93`; `inlineav ss=674, dgm=262, ff=102`.
- Default theo loại (simple2full): `ka` required/T1đ/threshold 5; `pe` required/1đ/threshold 0.9; `ss`,`ff`,`dgm`,`ae`,`extr` — `tools/simple2full.py:32-73`. `ae` chưa thấy dùng.
- KA có: MCQ (`.solution` + `ul.choices`), TF (`data-category="true"`), FIB/text (`data-type="text"`), Summ (multipart).
- Deforms (bài kỹ thuật): JSON `parameters/workspaces/solutions` — `Exercises/DeformsTesting/DeformsDemoProblemPPROmaster.json:1-60`; feedback server-side `tools/tafe` qua `app.py:142-151`.

### 2.3 Ví dụ chấm điểm
- **PE kiểu mới (JSAV exercise API)**: `AV/Sorting/heapsortPRO.js:169-174` — `exercise = av.exercise(model, initialize, {compare:[{class:"unused"},{}], controls:$(".jsavexercisecontrols"), fix: fixState})`; model đánh dấu bước chấm `jsav.stepOption("grade", true)` (`:78-81, 97-106`); học viên gọi `exercise.gradeableStep()` (`:128, 156`); `fixState(modelHeap)` copy class/value/heapsize (`:58-70`).
- **Grader**: `lib/JSAV.js:8179-8216` grader `default` (so từng bước), `8236-8245` `finalStep` (chỉ trạng thái cuối), `8246-8274` `finder`; chọn qua option `grader` (`JSAV.js:8063-8074`); `showGrade` in "yourScore correct / total" + số bước fix (`:8346-8355`).
- **PE kiểu cũ (KA framework)**: `Exercises/Sorting/BubsortPRO.html:26-35` — `<div class="solution" data-type="custom">... bubsortPRO.checkAnswer(arr_size) ...`; logic `BubsortPRO.js:1-95` (random mảng, `answerArr`, `checkAnswer` từng phần tử, nút `#reset`).
- **KA auto-detect loại đáp án & validator**: `khan-exercises/khan-exercise.js:1284-1304` (`.choices` → `radio`, ngược lại `number`; `data-type` override); answer types: text (`utils/answer-types.js:134`), number (747), regex (787), radical (837), cuberoot (936), multiple (1047), set (1214), radio (1433), list (1707), **custom (1771)**, checkbox (1922), expression (2023). Custom validator trả `true/false/""/message` (1811-1840) — bài tập tự viết hàm chấm là công dân hạng nhất.
- **Ngưỡng mastery**: KA threshold = **số câu đúng** (`Configuration.rst:253-263`), PE threshold = **tỉ lệ bước đúng 0..1** (239-245); 2 chỉ số `score = correct/total`, `complete = (correct+undo+fix)/total` (`lib/odsaAV.js:347-354`).

## 3. JSAV: animation, nhúng, fix/model/undo

- **Animation**: `displayInit()` → `recorded()` (`lib/JSAV.js:759-760`, reset `8434-8452`); bước có cờ `grade` (`JSAV.js:8061`); `gradeableStep()` = `stepOption("grade", true); step();` (`JSAV.js:8478-8489`).
- **Undo/redo**: 2 stack `_undo/_redo` (`JSAV.js:719-760`; undo 428-455; `backward` 470-486); Undo gọi `exer.undo()` (`JSAV.js:8111-8115, 8453-8471`).
- **Fix**: `fixmode: "undo"|"fix"|"none"` + `feedback: "atend"|"continuous"` (`JSAV.js:8065-8067`, dropdown 8133-8141); continuous: bước sai → `undo()`; nếu `fixmode==="fix"` + có `options.fix` → `fix(modelStructures)`, tăng `score.fix`; không → `score.undo` (`JSAV.js:8491-8542`; API 8559-8567). Ví dụ: `heapsortPRO.js:58-70`, `simpledemoPRO.js:46-60`, `DijkstraPE.js:189`, `BFSPE.js:155`.
- **Model answer**: JSAV instance riêng trong dialog (`JSAV.js:8356-8423, 8424-8433`; log `jsav-exercise-model-open` 8086-8092). Xem trước khi hoàn thành → **mất credit** kỳ này (`lib/odsaAV.js:371-385`), Reset phục hồi (386-397).
- **Nhúng**: `.. avembed::` → `<div class="embedContainer" data-frame-src data-points data-required data-threshold data-type>` + placeholder `_iframe` (`RST/ODSAextensions/odsa/avembed/avembed.py:37-60`, `run()` 189-291; kích thước từ `<body data-height data-width>` `:77-107`). Client `odsaMOD.initExercises()` tạo iframe động + nhét threshold/points/required + LMS IDs vào query string (`lib/odsaMOD.js:1484-1543`, `:1496-1507`), postMessage `ODSA.TP` (1566-1584). `.. inlineav::` nhúng trực tiếp (không iframe) (`inlineav.py:47-106 / 115-147 / 38-72`); script chung qua `html_context.odsa_scripts` (`config_templates.py:409-437`).
- **Cầu nối AV ↔ module**: iframe báo kích thước qua postMessage `resize-iframe` (`odsaAV.js:94-131`); mọi hành vi phát `jsav-log-event` → `processEventData` (`odsaAV.js:308-417`) → postMessage + localStorage.

## 4. "Build your own textbook"

- **Config**: `chapters → module (đường dẫn RST) → sections/exercises` (`Configuration.rst:382-500`); mỗi exercise override `points / required / threshold / exer_options / showhide / remove` (451-476, ví dụ 478-495). Ví dụ `config/CS2.json` (`"exer_options": {"JXOP-code": "none"}, "points": 1.0, "threshold": 1.0`); `config/Test.json:64-70`.
- **Global option sets**: `glob_mod_options / glob_exer_options / glob_pe_options / glob_ka_options / glob_ss_options / glob_extr_options` (`Configuration.rst:223-312`; `config/CS3.json:36-60`); default cứng `ODSA_Config.py:278-350`.
- **Pipeline** (`python3 tools/configure.py config/X.json --no-lms`, `Makefile:129-131`):
  1. Đọc + validate + default (`ODSA_Config.py:452-515`, `validate_config_file` 206-247).
  2. Sinh `index.rst` toctree (`configure.py:249-285`).
  3. Mỗi module: header JS flags (`ODSA.SETTINGS.*`, TimeMe) (`config_templates.py:2-48`; `ODSA_RST_Module.py:361-383`).
  4. **Merge config vào directive RST**: thêm `:points: :required: :threshold: :exer_opts:`; xoá exercise nếu `remove:true`; cắt section nếu `showsection:false` (`ODSA_RST_Module.py:595-745, 436-456, 702-709`).
  5. Sinh `Makefile` + `conf.py` Sphinx, chạy `make html` (`configure.py:539-575`).
  6. Post-process: đánh số chương/mục, link Canvas, sinh `lti_html/*.html` + `lti_config.json` khi không `--no-lms` (`postprocessor.py:343-367`) + widget tiến độ (`postprocessor.py:407-736`).
- `--standalone-modules`, `--dry-run`, `--slides` (`configure.py:599-619`); `simple2full.py:1-86`.
- **Giáo viên**: **Book Configuration GUI** (drag & drop modules, override điểm/threshold) — `Configuration.rst:560-740`; tạo "course offering" → sinh Canvas course (Canvas API + LTI) — `Configuration.rst:741-887`.

## 5. Theo dõi tiến độ người học

- **Exercise registry**: name/points/required/threshold/type/id/uiid (`lib/odsaMOD.js:970-981`).
- **Credit**: `complete===1` + `score >= threshold` → `postGradeToLMS` + green check (`lib/odsaAV.js:347-368, 419-448, 183-204`).
- **Proficiency states**: `SUBMITTED/SUCCESS/ERROR/TIMEOUT` (`odsaMOD.js:72-89`); hiển thị: check xanh, **màu nút show/hide đỏ-vàng-xanh**, "Module Complete" (`odsaMOD.js:180-281`; `Client-sideFramework.rst:161-174`); bật/tắt `dispModComp` (`ODSA_RST_Module.py:69-85`).
- **KA mastery**: `highest_score >= threshold` (`lib/odsaKA.js:208-290, 260-266, 624-677`).
- **API backend** (server Rails `OpenDSA-LTI`, repo riêng): `POST /odsa_exercise_attempts/pe` (`odsaMOD.js:526-535`; `splice-iframe.js:82-158`), `GET /odsa_exercise_progresses` (`odsaMOD.js:402-439`), `POST /api/v1/userdata/isproficient/` & `/usermodule/ismoduleproficient/` (`odsaMOD.js:286-334`), `POST /api/v1/userdata/getgrade/` (340-397).
- **DB & LMS**: attempt → `odsa_exercise_progresses` → `update_proficiency` tính **điểm module** → `post_score_to_lms` nếu tăng; Canvas 1 gradable/module nên OpenDSA **gộp điểm cả module** (`OpenDSA-LTI-Implementation.rst:143-165, 34-56`).
- **Log**: event localStorage `event-<tstamp>-<rand>`, gửi batch (`odsaUtils.js:802-880, 937-1010`; `EventMessages.rst:26-57`); schema attempt/hint (`EventMessages.rst:59-92`).
- **SPLICE**: `SPLICE.reportScoreAndState(location, score 0..1, state)`, `getState(callback)` (restore bài làm), `sendEvent` — `splice-iframe.js:1-37, 160-206`; module nhận `SPLICE.*` (`odsaMOD.js:1023-1070`); score kèm `state` (currentStep, tstamp) (`splice-iframe.js:89-101`).
- **Gradebook**: tài liệu nói có trang Gradebook + `syncProficiency()` (`Client-sideFramework.rst:172-181`) — cơ chế sinh trang hiện tại **chưa xác minh**.

## 6. Chưa xác minh
- Không xem HTML đã build (không có `Books/`).
- Trang Gradebook; DB/server LTI (repo khác); loại `ae`; logic module-complete client đã bị comment (`odsaMOD.js:251-254`).
- `partial_credit`/`zeropt_assignments`/`req_full_ss` nhắc trong config&doc nhưng logic client chưa kiểm tra đủ.

## 7. Năm bài học cụ thể nhất cho StepDSA
1. **Tách "spec bài tập" khỏi "chính sách chấm"**: exercise tự khai hành vi (model/fix/grader: `heapsortPRO.js:169-174`), `points/required/threshold` ở config sách (`Configuration.rst:506-558`). StepDSA: checkpoint theo step-id trong module; điểm/required/ngưỡng ở lớp course config → đổi chính sách không cần sửa 162 module.
2. **Timeline per-step "gradeable"**: `stepOption("grade", true)` + `gradeableStep()` (`JSAV.js:8061, 8478-8489`) — chỉ cần thêm cờ "assessable step" vào timeline tất định sẵn có → checkpoint không giới hạn 1 câu/module; chấm theo *từng bước* (grader `finalStep` nếu chỉ cần trạng thái cuối — `JSAV.js:8236-8245`).
3. **3 chế độ phản hồi + auto-fix**: `feedback=atend|continuous`, `fixmode=undo|fix|none`, `fix(modelState)` đồng bộ từ lời giải mẫu (`JSAV.js:8065-8067, 8503-8522`; `heapsortPRO.js:58-70`) + `score.fix/score.undo` riêng.
4. **Model answer có hậu quả + có log**: instance riêng trong dialog (`JSAV.js:8356-8433`); xem sớm → mất credit + "Credit not given for this instance"; Reset phục hồi (`odsaAV.js:371-397`).
5. **Chuẩn hoá điểm & đồng bộ muộn (offline-first)**: `score=correct/total`, `complete=(correct+undo+fix)/total` + threshold per exercise (`odsaAV.js:347-354, 419-448`); localStorage → batch sync, idempotent, trạng thái SUBMITTED/ERROR (`odsaMOD.js:72-89, 457-507`); tham khảo SPLICE `reportScoreAndState(location,score,state)` để nhúng LMS + resume (`splice-iframe.js:1-37`).
