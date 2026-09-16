# 目的

给CSIG正发声活动做一个预热宣传网站。用一段有审美、有参与感的 AI 历史旅程，让 CSIG 的同学先亲身感受到“加速度”，再带着对自身处境的思考，期待这次正发声活动。

# 字体资产

字体方案与字库已交付，接入画卷前必读 `site/assets/fonts/README.md`：

- 字库：`site/assets/fonts/*.woff2`（按站点文案子集化）+ `fonts.css`（@font-face、角色/年代 token、手写描边动画）。
- 原则：不用一款手写字体包打全场（墨批 Ma Shan Zheng / 铅笔 Long Cang / 压力批注 Zhi Mang Xing 三级）；拉丁旁注随年代换字体（1956 打字机 → 2012–17 学术衬线 → 2022–26 科技无衬线，数字用 IBM Plex Mono）。
- 真正关键的词不用字体：`site/assets/handwriting/` 下手写 SVG（来得及吗？/ 慢下来），`pathLength=1` + 笔画序号 `--i`，容器加 `.hw-play` 逐笔描边；「来得及吗？」问号尾笔 `.hw-trail` 接入研究主线。
- 预览：`site/font-preview.html`。文案变更后按 `site/assets/fonts/README.md` 末尾命令重新子集化（原料留档 `output/fonts/`）。