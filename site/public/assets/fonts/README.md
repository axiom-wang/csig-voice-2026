# 字体方案 · CSIG 正发声「AI 的加速度」

对应《素材清单.md》"双主题中文字体方案与所需字体文件"交付项。三条原则：

1. **不用一款"像手写"的字体包打全场** —— 按内容角色分配字体；
2. **真正关键的词不用字体** —— 做成 SVG 手写（`site/assets/handwriting/`），逐笔描边生长，每处笔迹唯一；
3. **字体随年代切换** —— 排版本身参与"加速度"叙事。

## 一、双主题字体对应关系

| 内容角色 | 历史线（第二、三幕 · 魔法档案） | 当前线（第一、四至七幕 · 产品工作室） |
|---|---|---|
| 标题 | Noto Serif SC 700–900（古籍衬线） | 系统无衬线 PingFang / YaHei（现代 UI） |
| 正文/主句 | Noto Serif SC 400 | 系统无衬线 |
| 手写批注 | Ma Shan Zheng 研究者墨批（从容） | Long Cang 铅笔批注（快） |
| 数字/年份 | IBM Plex Mono（时间轴、日期） | IBM Plex Mono |

第三级手写：**Zhi Mang Xing 压力批注**（第五幕客户追问、交付提前，红色潦草）——批注从毛笔到硬笔到潦草，手写字体本身也在加速。

## 二、年代字体（世界层旁注）

| 年代 | 字体 | token | 用于 |
|---|---|---|---|
| 1956 | Special Elite 打字机 | `--font-era-typewriter` | 会议记录、"Artificial Intelligence"、早期终端 |
| 2012–2017 | EB Garamond 学术衬线（含斜体） | `--font-era-paper` | AlexNet / AlphaGo / 论文题名 *Attention Is All You Need* |
| 2022–2026 | Space Grotesk 科技无衬线 | `--font-era-launch` | ChatGPT / 腾讯混元 / Hunyuan 3D 2.0 / WorkBuddy |
| 贯穿 | IBM Plex Mono 等宽 | `--font-year` | 时间轴刻度 1956–2026、事件日期 |

打字机 → 学术印刷 → 数字无衬线，拉丁字体的机械化程度递增，与"先疏后密"的时间轴同构。

## 三、SVG 手写关键词

| 文件 | 内容 | 用于 | 说明 |
|---|---|---|---|
| `../handwriting/laidejima.svg` | 来得及吗？ | 第一幕问题便签、第七幕回归 | 问号尾笔 `.hw-trail` 向外延伸，接入研究主线 |
| `../handwriting/manxialai.svg` | 慢下来 | 第六幕「值得慢下来」核心词 | 收尾笔迹放缓 |

- 中线路径 `pathLength="1"`，笔画序号 `--i: 0…n`，给容器加 `.hw-play` 即逐笔描边（动画规则在 `fonts.css` 末尾，已含 `prefers-reduced-motion` 降级）。
- 颜色继承 `currentColor`，线宽可按主题笔触参数覆盖 `stroke-width`。

## 四、字库文件与 token

全部按站点文案子集化（983 字符，含 883 汉字），woff2 合计约 1.4MB，均为开源可商用许可：

| 文件 | 字体 | 许可 | 大小 |
|---|---|---|---|
| `NotoSerifSC.woff2` | Noto Serif SC 变量 400–900 | OFL | 316K |
| `MaShanZheng.woff2` | 马善政毛笔 | OFL | 376K |
| `LongCang.woff2` | 龙藏硬笔 | OFL | 336K |
| `ZhiMangXing.woff2` | 志莽行书 | OFL | 272K |
| `SpecialElite.woff2` | Special Elite | Apache 2.0 | 32K |
| `EBGaramond(-Italic).woff2` | EB Garamond 变量 + 斜体 | OFL | 48K |
| `SpaceGrotesk.woff2` | Space Grotesk 变量 | OFL | 12K |
| `IBMPlexMono(-Medium).woff2` | IBM Plex Mono | OFL | 8K |

接入方式：`index.html` 已预加载 `NotoSerifSC.woff2` 并引入 `fonts.css`；`fonts.css` 内含 `@font-face`、字体 token（`--font-note-ink / --font-note-pencil / --font-note-urgent / --font-era-* / --font-year`）、配套排版类（`.type-note-* / .type-era-* / .type-year`）与手写描边动画。

重新生成子集（文案变更后）：

```bash
pip install fonttools brotli
cd output/fonts/src
pyftsubset <原字体.ttf> --text-file=../charset.txt --flavor=woff2 \
  --output-file=../../../site/assets/fonts/<输出>.woff2 \
  --no-hinting --desubroutinize --layout-features='kern,liga,calt'
```

原字体与字符集留档在 `output/fonts/`。可视检查：`site/font-preview.html`。
