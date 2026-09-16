# CSIG 正发声 · AI 的加速度 预热站 执行计划

**Goal:** 将 `site/` 下已完成的纯静态预热宣传站（封面 + 七幕画卷）接入 static 模板并部署上线到 HRClaw 平台
**模板:** static（存量项目接入）
**needs_dw:** false
**needs_db:** false

---

- [x] **Task 1: 接入 static 模板（目录重组 + server.js + package.json + .deployignore）**

  **Files:**
  - Create: `site/public/`（由 `index.html`、`styles.css`、`main.js`、`assets/`、`story/` 移入）
  - Create: `site/server.js`
  - Create: `site/package.json`
  - Create: `site/.deployignore`

  **Step 1: 创建 public/ 并移入生产文件**

  ```bash
  cd "/Users/yitianyi/Desktop/jobs/csig正发声/site"
  mkdir -p public
  mv index.html styles.css main.js assets story public/
  ```

  开发产物（`shots/`、`test-shots.py`、`font-preview.html`、`README.md`）保留在 `site/` 根目录，不进入 `public/`，并通过 `.deployignore` 排除上传。

  **Step 2: 写入 server.js（static 模板，serve public/）**

  express 静态服务 + `/api/health` 健康检查 + SPA 兜底，端口 `process.env.PORT || 3001`。

  **Step 3: 写入 package.json**

  ```json
  {
    "name": "csig-voice-preheat-20260911-172646",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": { "start": "node server.js" },
    "dependencies": { "express": "^4.18.2", "cors": "^2.8.5" }
  }
  ```

  **Step 4: 写入 .deployignore（排除开发产物）**

  ```
  shots
  test-shots.py
  font-preview.html
  README.md
  docs
  node_modules
  .DS_Store
  .deploy-state.json
  ```

  **Step 5: 验证**

  - `site/public/index.html`、`site/public/assets/`、`site/public/story/` 存在
  - `site/server.js`、`site/package.json`、`site/.deployignore` 存在
  - `site/public/` 内无绝对路径引用（全部相对路径，`./styles.css`、`assets/...` 均正常）

- [x] **Task 2: 代码合规检查（C1/C2 自查）**

  按 `references/project-constraints.md` 自查：
  - C1 文件上传路径：本项目无文件上传功能 → 不适用
  - C2 MongoDB 数据库名：本项目无数据库（needsDb=false）→ 不适用
  - 附加自查：`public/` 内无数仓访问脚本（无 fetch 到 dos-dataview 等）、无硬编码 HR 数据 → 通过

- [x] **Task 3: 迭代预览**

  **Step 1: 部署到 AnyDev**

  ```bash
  echo '{"projectDir":"/Users/yitianyi/Desktop/jobs/csig正发声/site"}' | node "$PD" anydev full-deploy --input -
  ```

  **Step 2: 输出预览确认模板**（previewUrl 优先，否则 `http://{ip}:{port}`）

  **Step 3: 弹出「确认注册」确认按钮**，用户文字反馈则修改代码、追加 task、重新 full-deploy 循环

- [x] **Task 4: Dockerfile 检查/生成**

  用户点击「确认注册」后执行。复制 `Dockerfile.node.tmpl` 为 `site/Dockerfile`（含 `{{PROJECT_ID}}` 占位符），生成 `.dockerignore`，并持久化 projectType：

  ```bash
  echo '{"projectDir":"/Users/yitianyi/Desktop/jobs/csig正发声/site","fields":{"projectType":"node"}}' | node "$PD" state update --input -
  ```

- [x] **Task 5: 注册发布**

  ```bash
  echo '{"projectDir":"/Users/yitianyi/Desktop/jobs/csig正发声/site"}' | node "$PD" anydev publish --input -
  ```

  成功后输出部署输出模板，并 `state update` 标记 completed。
