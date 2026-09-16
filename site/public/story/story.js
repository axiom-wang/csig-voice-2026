(() => {
  'use strict';
  const S=CsigStory;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let app=null;
  const captions={
    '1':'一份未完成的方案旁，消息不断挤进来：客户想先看 Demo；新工具，试试？你用的版本又更新了。来得及吗？',
    '2A':'1956 / Artificial Intelligence。最初，我们问：机器能拥有智能吗？这一年是一次重要的历史定位，并非相关探索的绝对起点。',
    '2B':'人写规则，机器依照规则尝试解决问题。被划掉的研究方案、神经元草图与早期对话终端，留下探索与重来的痕迹。',
    '3A':'2012 / AlexNet。从数据中学习是长期发展的研究方向；这里呈现图像识别的一次重要突破。',
    '3B':'2016 / AlphaGo。学习与搜索结合，机器能应对更复杂的决策。',
    '3C':'2017 / Transformer。Attention Is All You Need。Token 之间的联系逐渐加密，模型有了更有效地联系上下文的方法。',
    '3D':'2022.11 · ChatGPT 发布；2023.09 · 腾讯混元正式亮相；2024.12 · 混元视频生成能力上线；2025.03 · Hunyuan 3D 2.0 系列开源；2026.03 · WorkBuddy 上线。',
    '4':'这些能力，逐渐来到每个人的输入框里。人们开始用自然语言，让 AI 协助写作、编程、分析和制作原型，改变具体工作的推进方式。帮我把这个想法做出来。',
    '5':'客户回复：我们也做了一版，你们的优势是什么？交付提前：本周五。产品、研发、设计的批注交叠在同一份 Demo 上。',
    '6':'机会来了，资源呢？产品做出来了，节奏怎么定？个人提效了，协作呢？又有什么，值得慢下来？',
    '7':'我们的身位、节奏、方向是什么？第一幕的「来得及吗？」便签，回到同一张圆桌上。'
  };
  function addFilter(parent){
    const svg=S.svg('svg',{width:0,height:0,'aria-hidden':'true'},parent);svg.style.position='absolute';
    const defs=S.svg('defs',{},svg),f=S.svg('filter',{id:'story-cool-paper','color-interpolation-filters':'sRGB'},defs);
    S.svg('feColorMatrix',{type:'matrix',values:'0.94 0 0 0 0.012 0 1 0 0 0 0 0 1.08 0 0.02 0 0 0 1 0'},f);
  }
  class Experience {
    constructor(mount){
      this.mount=mount;this.p=0;this.worlds={};this.seamCache={};this.raf=0;this.staticMode=false;
      this.root=S.el('div','story-experience');
      addFilter(this.root);
      const heading=S.el('h1','sr-only',this.root);heading.id='storyAccessibleHeading';heading.textContent='AI 的加速度：七幕滚动画卷';
      this.content=S.el('div','story-content',this.root);mount.replaceChildren(this.root);
      document.getElementById('storyRoot').setAttribute('aria-labelledby',heading.id);
      this.onScroll=()=>{if(this.raf||this.staticMode||document.getElementById('storyRoot').hidden)return;this.raf=requestAnimationFrame(()=>{this.raf=0;this.readScroll();});};
      this.onResize=()=>{if(this.staticMode)this.resizeStatic();else {this.size();this.seek(this.p,false);}};
      addEventListener('scroll',this.onScroll,{passive:true});addEventListener('resize',this.onResize,{passive:true});
      this.onMotion=()=>this.setMode(motion.matches);motion.addEventListener('change',this.onMotion);
    }
    world(theme){
      if(!this.worlds[theme])this.worlds[theme]=new S.World(theme);
      return this.worlds[theme];
    }
    attach(theme){const w=this.world(theme);if(w.el.parentNode!==this.universe)this.universe.append(w.el);return w;}
    size(){
      this.mobile=innerWidth<=700;this.w=this.stage.clientWidth;this.h=this.stage.clientHeight;
      this.distance=Math.round(Math.max(this.h,650)*(this.mobile?34:26));
      this.runway.style.height=this.distance+this.h+'px';
      this.origin=this.runway.getBoundingClientRect().top+scrollY;
    }
    async init(){
      this.setMode(motion.matches||new URLSearchParams(location.search).get('reading')==='static');
      if(!this.staticMode)await this.world('current').ready();
      await document.fonts.ready;
      this.root.dataset.ready='true';
      this.screen?.title.focus({preventScroll:true});
      this.preload();
      return this;
    }
    preload(){
      // 首幕优先；后续源图每次两张，避免一次抢占整个网络与解码队列。
      const first=new Set(CsigData.maps.current.items.filter(i=>i.visible.includes('act1')).map(i=>S.asset(i.file)));
      const urls=Object.values(CsigData.assets).filter(url=>!first.has(url));
      let index=0;
      const work=async()=>{while(index<urls.length){const img=new Image();img.decoding='async';img.src=urls[index++];await img.decode().catch(()=>{});}};
      const run=()=>Promise.all([work(),work()]);
      if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:1200});else setTimeout(run,50);
    }
    setMode(staticMode){
      this.staticMode=staticMode;cancelAnimationFrame(this.raf);this.raf=0;
      this.content.replaceChildren();this.worlds={};this.seamCache={};this.morph=null;
      if(staticMode){this.buildStatic();window.scrollTo(0,0);return;}
      this.runway=S.el('div','story-runway',this.content);
      this.stage=S.el('div','story-stage',this.runway);
      this.stage.setAttribute('aria-label','随滚动展开的纸面世界');
      this.universe=S.el('div','story-universe',this.stage);
      this.screen=new S.Screen(this.stage,()=>this.back(),()=>this.seek(1),()=>this.setMode(true));
      this.size();this.seek(this.p,true);
    }
    back(){
      this.p=0;window.scrollTo(0,0);window.CoverExperience.reset();
    }
    resume(){
      if(!this.staticMode){this.size();this.seek(0);this.screen.title.focus({preventScroll:true});}
      else window.scrollTo(0,0);
    }
    readScroll(){this.seek(S.clamp((scrollY-this.origin)/this.distance),false);}
    seek(p,scroll=true){
      if(this.staticMode)return;
      this.p=S.clamp(p);if(scroll)window.scrollTo({top:this.origin+this.p*this.distance,behavior:'instant'});
      const state=S.resolve(this.p);this.state=state;
      const {phase,t}=state;let cam;
      const seam=phase==='s12'||phase==='s34';
      Object.values(this.seamCache).forEach(s=>s.el.remove());
      if(seam){
        const cfg=S.seams[phase],A=this.attach(cfg.A),B=this.attach(cfg.B);
        let fx=this.seamCache[phase];if(!fx)fx=this.seamCache[phase]=new S.Seam(phase,this.universe);else this.universe.append(fx.el);
        if(this.morph)this.morph.render(1);
        this.seamState=fx.render(t,A,B,this.mobile);cam=this.seamState.cam;
        if(this.morph)this.morph.svg.style.opacity='0';
      }else{
        const theme=phase==='history'?'history':'current';
        const world=this.attach(theme);
        for(const [name,w] of Object.entries(this.worlds))if(name!==theme)w.el.remove();
        world.el.style.transform='';world.el.style.clipPath='none';world.el.style.zIndex=0;
        world.render(t);
        cam=S.camera(theme,t,this.mobile);
        if(theme==='history'){
          if(!this.morph)this.morph=new S.Morph(world);
          this.morph.svg.style.opacity='1';this.morph.render(t);
        }
        this.seamState=null;
      }
      this.cam=cam;S.transformCamera(this.universe,cam,this.w,this.h);
      this.screen.render(state,this.mobile);
      this.root.dataset.phase=phase;this.root.dataset.node=this.screen.el.dataset.node;
    }
    seekNode(id,subtime){
      const n=S.nodes.find(n=>n.id===id);if(!n)return;
      const t=subtime??n[this.mobile?'m':'d'];
      this.seek(S.globalFor(n.theme==='history'?'history':id==='1'?'opening':'present',t));
    }
    buildStatic(){
      this.staticFrames=[];this.staticSeams=[];
      const body=S.el('div','story-static',this.content),bar=S.el('div','static-toolbar',body);
      const brand=S.el('span','',bar);brand.textContent='CSIG 正发声 · AI 的加速度';
      const back=S.el('button','static-toggle',bar);back.textContent='返回封面';back.onclick=()=>this.back();
      const animate=S.el('button','static-toggle',bar);animate.textContent='滚动画卷';animate.onclick=()=>this.setMode(false);
      const mobile=innerWidth<=700;let counter=0;
      for(const n of S.nodes){
        if(n.id==='2A'||n.id==='4')this.staticSeam(body,n.id==='2A'?'s12':'s34',counter++);
        const chapter=S.el('section','static-chapter theme-'+n.theme,body);chapter.dataset.staticNode=n.id;
        const copy=S.el('header','static-copy',chapter);
        const eyebrow=S.el('p','story-eyebrow',copy);eyebrow.textContent=(n.theme==='history'?'历史档案':'当前现场')+' / '+n.label;
        const title=S.el('h2','story-title',copy);title.textContent=n.title;
        const allKeys=CsigData.maps[n.theme].camera[mobile?'mobile':'desktop'].keys;
        let keys=allKeys.filter(k=>k.node===n.id);
        // 静态端同样覆盖移动端每一焦点，五事件不是只留下末站。
        if(!mobile)keys=[{...S.camera(n.theme,n.d,false),t:n.d}];
        if(!keys.length)keys=[{...S.camera(n.theme,n.m,mobile),t:n.m}];
        const unique=keys.filter((k,i)=>i===0||k.x!==keys[i-1].x||k.y!==keys[i-1].y||k.z!==keys[i-1].z);
        for(const key of unique){
          const frame=S.el('div','static-frame',chapter);frame.setAttribute('aria-label',n.label+'，静态关键画面');
          const uni=S.el('div','story-universe',frame);
          const modules=n.theme==='history'?(n.act===2?['M2']:n.id==='3D'?['M3d']:['M3a']):n.id==='6'?['M6']:n.id==='7'?['M7']:['M1'];
          const world=new S.World(n.theme,'static-'+counter++,modules);uni.append(world.el);world.render(key.t,{complete:true,act:n.act});
          world.el.querySelectorAll('img').forEach(img=>img.loading='lazy');
          let timeline=null;if(n.theme==='history'){timeline=new S.Timeline(frame,'static-tl-'+counter++);timeline.render(S.ticks.find(t=>t[1]===n.year)?.[0]||60,1,0,true);}
          this.staticFrames.push({frame,uni,key,mobile});
        }
        const caption=S.el('p','static-caption',chapter);caption.textContent=captions[n.id];
        if(n.id==='7')S.activity(chapter);
      }
      this.resizeStatic();
    }
    staticSeam(parent,id,i){
      const section=S.el('section','static-seam',parent);section.dataset.staticSeam=id;
      const label=S.el('p','type-year',section);label.textContent=id==='s12'?'1956 · 进入档案':'2026 · 回到当前';
      const frame=S.el('div','static-seam-frame',section),uni=S.el('div','story-universe',frame);
      const cfg=S.seams[id];
      const A=new S.World(cfg.A,'static-seam-a-'+i,cfg.A==='current'?['M1']:['M3d']);
      const B=new S.World(cfg.B,'static-seam-b-'+i,cfg.B==='current'?['M1']:['M2']);
      uni.append(A.el,B.el);const fx=new S.Seam(id,uni);fx.render(.5,A,B,false,true);
      const x=id==='s12'?1400:(innerWidth<=700?4120:3800);
      const timeline=new S.Timeline(frame,'static-seam-timeline-'+i);timeline.render(id==='s12'?60:1140,1,0,true);
      this.staticSeams.push({frame,uni,key:{x,y:330,z:.6}});
    }
    resizeStatic(){
      for(const {frame,uni,key,mobile} of this.staticFrames||[]){
        const width=frame.clientWidth,height=frame.clientHeight;
        const scale=width/(mobile?390:1440);
        S.transformCamera(uni,{...key,z:key.z*scale},width,height);
      }
      for(const {frame,uni,key} of this.staticSeams||[])S.transformCamera(uni,key,frame.clientWidth,frame.clientHeight);
    }
    snapshot(){
      return {progress:this.p,phase:this.state?.phase,time:this.state?.t,node:this.root.dataset.node,camera:this.cam,seam:this.seamState,static:this.staticMode,worlds:[...this.content.querySelectorAll('.story-stage .story-world')].map(n=>n.dataset.world)};
    }
  }
  window.mountCsigStory=async mount=>{
    if(app&&app.mount===mount){app.resume();return;}
    try{app=new Experience(mount);await app.init();window.__csig=app;}
    catch(err){mount.replaceChildren();app=null;throw err;}
  };
})();
