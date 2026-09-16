# CSIG 正发声 · AI 的加速度 —— 封面首页

叙事探索活动的封面式首页 + 点击进入的揭开转场。**后续七幕画卷尚未接入**，本目录只交付首页、转场接口与承接容器。

## 运行方式

静态站点，无构建步骤。需要本地服务（多 MB 素材，file:// 直接打开亦可运行，推荐 http）：

```bash
cd site
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 素材引用关系（全部来自 `output/home-cover/assets/`，已复制到本目录）

| 文件 | 用途 |
|---|---|
| `assets/background.png` | 全屏不透明背景（`.bg`，object-fit cover，允许裁切边缘碎纸） |
| `assets/archive-base.png` | 档案底册（内页），校准后常驻，打开时显露 |
| `assets/archive-cover-v2.png` | 独立封皮（2026-09-11 换图：AI 研究线索图案 + 「AI 的加速度」题字已生成在封皮上），覆盖底册，围绕左侧装订边转开 |
| `assets/archive-cover-v1.png` | 旧版封皮备份（无字，可随时切回） |
| `assets/archive-idle.png` | 完整档案图：仅作视觉对照，未直接上屏；素材加载失败时以 HTML 文案降级 |
| `assets/entry-paper.png` | 入口纸片按钮背景，文字「翻开看看」为 HTML |
| `assets/research-line.svg` | 延伸研究线：已**内联**进 `index.html`（便于描线动画），位于档案后方 |
| `assets/seam-glow.svg` | 纸缝暖光，叠在右下角卷角处，呼吸强度 opacity ≤ .4 |
| `assets/fonts/` | 字体资产：子集化 woff2 + `fonts.css`（@font-face、年代/角色 token、手写描边动画），方案见 `assets/fonts/README.md`，预览见 `font-preview.html` |
| `assets/handwriting/` | 关键词手写 SVG（非字体）：`laidejima.svg`「来得及吗？」（问号尾笔接入研究主线）、`manxialai.svg`「慢下来」；中线路径 `pathLength=1`，容器加 `.hw-play` 逐笔描边 |

### 校准参数（写死在 `styles.css` 注释与规则中）

设计坐标系 1203×1320（`--book-w/h`，即底册自然尺寸）：

- 底册：`left:0; top:0`（1192×1320）
- 封皮 v2：`left:-64px; top:20px`（992×1080 原图按内容高度对齐，scale 1.1907 → 1181×1286，内容左上角与底册内容左上角对齐；右侧露出底册纸边为预期效果）
- 装订边旋转轴：封皮自身 `9% 50%`（`transform-origin`，对准装订绳柱）
- 推近锚点：容器 `61% 52%`（内页棋子/手稿区域，`.bookScale` 的 transform-origin，已用 calc 补偿使静态视觉居中）
- 暖光位置：`left 650px / top 636px / width 680px`（对准卷角）
- 窄竖屏取景：以「绳柱→卷角」关键区（容器 x -10…1010）适配缩放，并经 `--shiftX` 左偏使关键区居中，保住装订绳柱与题字

校准依据见 `output/home-cover/calibrate.py` 生成的对照图。

## 封面文案与顶栏

- 封面题字「AI 的加速度」：已生成在封皮图内（带字版，字体为古典衬线混排，无缺字错字）；HTML 中保留 `<h1 class="sr-only">` 供屏幕阅读器。若后续改回无字封皮（`archive-cover-v1.png`），可恢复 HTML 题字（git 历史中的 `.coverTitle` 实现）。封面不放其他文案，入口仅「翻开看看」。
- 顶栏：左侧品牌标签图 `assets/brand-logo.png`（档案标签造型「CSIG 正发声」，高 65px / 手机 44px，alt 文本保留），右侧「预约直播」`assets/btn-live.png`、「现场报名」`assets/btn-onsite.png` 两个标签图按钮（同一批生成的标签视觉，从 `top-buttons-src.png` 裁切，文字已烘焙、alt 保留语义；`<a target="_blank" rel="noopener">` 接入乐享真实链接，新窗口打开不中断封面体验，hover 微抬 + 暖光，focus-visible 暖色描边）。

## 画卷接入位置（待接入）

- 挂载容器：`index.html` 中 `<div id="storyMount">`（第一幕从这里开始）。
- 转场结束回调：覆盖 `window.CoverExperience.onEnterStory = (storyRoot, { storyMount }) => {...}`；或提供全局 `window.mountCsigStory(storyMount)`，默认流程会自动调用并在渲染出内容后隐藏占位。
- `CoverExperience.config.openDuration`：展开时长（默认 1500ms，限制在 1200–1800）。
- 画卷未就绪时展示 `#storyFallback` 占位（中性打印纸风格，含「重试挂载 / 返回封面」），不会进入空白页。
- 转场为**揭开式**：封皮透视转开 + 镜头推近 + 暖色档案页过渡为中性打印纸；不是物理仿真翻页。

## 已验证场景

桌面 1600×1000、窄屏手机 390×844、小高度横屏 812×375；键盘 Enter/Space 与 focus-visible；点击单次锁定；`prefers-reduced-motion`；`?safe=1` 模拟主素材加载失败的降级态。
