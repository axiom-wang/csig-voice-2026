/* CSIG 正发声 · AI 的加速度 —— 封面首页逻辑
 *
 * 对外契约（后续画卷接入点）：
 *   CoverExperience.config.openDuration  展开时长 ms，1200–1800 可调
 *   CoverExperience.config.pushScale     推近倍率
 *   CoverExperience.onEnterStory(storyRoot, { storyMount })
 *       转场结束后仅调用一次。默认实现见 defaultOnEnterStory：
 *       若存在全局 window.mountCsigStory(storyMount) 则调用它挂载画卷；
 *       否则展示“尚未接入”占位与重试入口，不进入空白页。
 *   CoverExperience.open()               以代码方式触发进入（等价点击入口）
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const coverRoot = $('coverRoot');
  const bookWrap = $('bookWrap');
  const bookPan = $('bookPan');
  const bookScale = $('bookScale');
  const entryZone = $('entryZone');
  const entryButton = $('entryButton');
  const storyRoot = $('storyRoot');
  const storyMount = $('storyMount');
  const storyFallback = $('storyFallback');
  const mountStatus = $('mountStatus');
  const storyHeading = $('storyHeading');
  const retryMount = $('retryMount');
  const backToCover = $('backToCover');

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');

  const state = { ready: false, opened: false, entered: false };

  /* ---------- 对外接口 ---------- */
  const CoverExperience = {
    config: { openDuration: 1500, pushScale: 2.35 },
    onEnterStory: null, // 可替换；为 null 时使用内置 defaultOnEnterStory
    open: () => beginOpen(),
    reset: () => resetCover(),
    get opened() { return state.opened; },
  };
  window.CoverExperience = CoverExperience;

  /* ---------- 素材预载与降级 ---------- */
  const ASSETS = {
    base: 'assets/archive-base.png',
    cover: 'assets/archive-cover-v2.png',
    entry: 'assets/entry-paper.png',
    bg: 'assets/background.png',
  };

  function preload(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error('load failed: ' + src));
      img.src = src;
    });
  }

  function initAssets() {
    const forceSafe = new URLSearchParams(location.search).has('safe');
    const jobs = Object.entries(ASSETS).map(([key, src]) =>
      (forceSafe && key !== 'bg' ? Promise.reject(new Error('safe mode')) : preload(src))
        .then(() => [key, true], () => [key, false])
    );
    return Promise.all(jobs).then((pairs) => {
      const ok = Object.fromEntries(pairs);
      if (!ok.base || !ok.cover) coverRoot.classList.add('degraded-book');
      if (!ok.entry) coverRoot.classList.add('degraded-entry');
      // 背景图失败时底色 --bg-fallback 自动接管，无需额外类
      state.ready = true;
      coverRoot.classList.add('is-ready');
    });
  }

  /* ---------- 取景：整体缩放 + 窄屏保住关键区（绳柱→卷角） ---------- */
  const BOOK_W = 1203;
  const BOOK_H = 1320;
  const CROP_ALLOW = 1.45; // 宽屏/横屏允许放大裁切的上限倍率
  const KEY_X = -10;       // 关键可视区左缘：装订绳柱（容器坐标）
  const KEY_W = 1020;      // 关键可视区宽度：绳柱 → 右下卷角

  function layout() {
    const rect = bookWrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const heightFit = (rect.height * 0.99) / BOOK_H;
    let scale;
    let shiftX = 0;
    if (rect.width / rect.height < 0.9) {
      // 窄竖屏：关键区完整可见，并让关键区（而非容器几何中心）视觉居中
      scale = Math.min(heightFit, (rect.width * 0.96) / KEY_W);
      shiftX = ((KEY_X + KEY_W / 2) - BOOK_W / 2) * scale;
    } else {
      const widthFit = (rect.width * 0.94) / BOOK_W;
      scale = Math.min(heightFit, widthFit * CROP_ALLOW);
    }
    coverRoot.style.setProperty('--bs', scale.toFixed(4));
    coverRoot.style.setProperty('--shiftX', shiftX.toFixed(1) + 'px');
  }

  /* ---------- 桌面指针小幅度视差 ---------- */
  const parallax = { tx: 0, ty: 0, x: 0, y: 0, raf: 0 };

  function parallaxLoop() {
    parallax.x += (parallax.tx - parallax.x) * 0.06;
    parallax.y += (parallax.ty - parallax.y) * 0.06;
    const x = parallax.x;
    const y = parallax.y;
    bookPan.style.transform = `translate3d(${(x * 10).toFixed(2)}px, ${(y * 8).toFixed(2)}px, 0) rotate(${(x * 0.35).toFixed(3)}deg)`;
    const bg = coverRoot.querySelector('.bg');
    if (bg) bg.style.transform = `translate3d(${(-x * 7).toFixed(2)}px, ${(-y * 6).toFixed(2)}px, 0)`;
    if (Math.abs(parallax.tx - parallax.x) > 0.001 || Math.abs(parallax.ty - parallax.y) > 0.001) {
      parallax.raf = requestAnimationFrame(parallaxLoop);
    } else {
      parallax.raf = 0;
    }
  }

  function initParallax() {
    if (!finePointer.matches) return;
    addEventListener('pointermove', (e) => {
      if (motionQuery.matches || state.opened) return;
      parallax.tx = e.clientX / innerWidth - 0.5;
      parallax.ty = e.clientY / innerHeight - 0.5;
      if (!parallax.raf) parallax.raf = requestAnimationFrame(parallaxLoop);
    }, { passive: true });
  }

  function settleParallax() {
    // 打开时让视差归零
    parallax.tx = 0;
    parallax.ty = 0;
    if (!parallax.raf) parallax.raf = requestAnimationFrame(parallaxLoop);
  }

  /* ---------- 打开与转场 ---------- */
  function beginOpen() {
    if (state.opened || !state.ready) return;
    state.opened = true;

    const reduced = motionQuery.matches;
    const duration = reduced
      ? 240
      : Math.min(1800, Math.max(1200, CoverExperience.config.openDuration | 0));

    coverRoot.style.setProperty('--openDur', duration + 'ms');
    coverRoot.style.setProperty('--push', String(CoverExperience.config.pushScale));

    entryButton.disabled = true;
    entryButton.setAttribute('aria-disabled', 'true');
    settleParallax();
    coverRoot.classList.add('is-opening');

    setTimeout(finishEnter, duration + 70);
  }

  async function finishEnter() {
    if (state.entered) return;
    state.entered = true;
    const handler = CoverExperience.onEnterStory || defaultOnEnterStory;
    try {
      await handler(storyRoot, { storyMount, storyFallback, mountStatus });
    } catch (err) {
      // 自定义 onEnterStory 抛错时仍给出可读反馈
      showFallback('画卷挂载出错：' + (err && err.message ? err.message : '未知错误'));
      revealStoryRoot();
    }
  }

  /* ---------- 默认承接：挂载检测 / 占位 / 重试 ---------- */
  function revealStoryRoot() {
    storyRoot.hidden = false;
    storyRoot.setAttribute('aria-hidden', 'false');
    // 先让故事层以同色系淡入，再隐藏封面，避免闪黑
    requestAnimationFrame(() => storyRoot.classList.add('is-live'));
    document.documentElement.classList.remove('cover-lock');
    setTimeout(() => { coverRoot.style.display = 'none'; }, 420);
  }

  function showFallback(message) {
    mountStatus.textContent = message || '';
    storyFallback.hidden = false;
  }

  async function defaultOnEnterStory() {
    revealStoryRoot();
    await attemptMount();
    if (!state.focusSent) {
      state.focusSent = true;
      storyHeading.focus({ preventScroll: true });
    }
  }

  async function attemptMount() {
    if (typeof window.mountCsigStory === 'function') {
      showFallback('正在加载第一幕画卷…');
      retryMount.disabled = true;
      try {
        await window.mountCsigStory(storyMount);
      } catch (err) {
        showFallback('画卷加载失败，请重试。' + (err && err.message ? '（' + err.message + '）' : ''));
        return;
      } finally {
        retryMount.disabled = false;
      }
      if (storyMount.childElementCount > 0) {
        storyFallback.hidden = true; // 画卷已接管
        mountStatus.textContent = '';
      } else {
        showFallback('画卷挂载完成但未渲染内容，请检查 mountCsigStory 实现。');
      }
    } else {
      showFallback('未检测到画卷挂载函数 window.mountCsigStory，第一幕尚待接入。');
    }
  }

  /* ---------- 返回封面（占位联调用） ---------- */
  function resetCover() {
    state.opened = false;
    state.entered = false;
    state.focusSent = false;
    storyRoot.classList.remove('is-live');
    storyRoot.hidden = true;
    storyRoot.setAttribute('aria-hidden', 'true');
    coverRoot.style.display = '';
    coverRoot.classList.remove('is-opening');
    document.documentElement.classList.add('cover-lock');
    entryButton.disabled = false;
    entryButton.removeAttribute('aria-disabled');
    layout();
    entryButton.focus({ preventScroll: true });
  }

  /* ---------- 事件 ---------- */
  entryButton.addEventListener('click', beginOpen);
  retryMount.addEventListener('click', () => { attemptMount(); });
  backToCover.addEventListener('click', resetCover);
  addEventListener('resize', layout, { passive: true });

  /* ---------- 启动 ---------- */
  layout();
  initParallax();
  initAssets().then(layout);
})();
