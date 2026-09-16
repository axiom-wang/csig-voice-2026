(() => {
  'use strict';
  const S=CsigStory;
  S.links={live:'https://csig.lexiangla.com/lives/72f68d36a5c111f1817f4e743b115340?company_from=csig',onsite:'https://csig.lexiangla.com/teams/k100059/events/e69c6a3aab2f11f1930d1ef02f5a8c04?company_from=csig'};
  S.activity=parent=>{
    const card=S.el('div','story-activity',parent);
    const info=S.el('p','activity-info',card);info.innerHTML='<strong>CSIG 正发声</strong><span>9月20日 14:30–17:00 · 线上直播</span>';
    const actions=S.el('div','activity-actions',card);
    for(const [key,label] of [['live','预约直播'],['onsite','报名现场']]){
      const a=S.el('a','activity-link '+key,actions);a.href=S.links[key];a.target='_blank';a.rel='noopener';a.textContent=label;
      const arrow=S.el('span','',a);arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';
    }
    const guests=S.el('p','activity-guests',card);guests.textContent='Dowson · Coby · Sam · Cham · Wang';
    const end=S.el('p','activity-invite',card);end.textContent='带着你的问题，一起聊聊。';return card;
  };
  class Timeline {
    constructor(parent,prefix){
      this.el=S.el('div','story-timeline',parent);this.el.setAttribute('aria-label','AI 历史时间轴');
      this.svg=S.inline('output/svg-scenes/timeline.svg',prefix);this.svg.setAttribute('preserveAspectRatio','none');this.svg.setAttribute('aria-hidden','true');this.el.append(this.svg);
      this.labels=S.ticks.map(([x,year],i)=>{
        const span=S.el('span','timeline-year type-year'+(i===6||i===8?' lower':''),this.el);
        span.textContent=year>2022?String(year).slice(-2):year;
        span.setAttribute('aria-label',year+'年');span.style.left=x/12+'%';return span;
      });
      this.get=id=>this.svg.querySelector(`[data-semantic="${id}"]`);
      this.marker=this.get('tl-marker');this.progress=this.get('tl-progress');
      this.current=S.el('span','sr-only',this.el);
    }
    render(x,enter=1,exit=0,staticMode=false){
      this.el.style.transform=`translateY(${-72*(1-enter+exit)}px)`;
      this.el.style.opacity=enter===0||exit===1?'0':'1';
      this.el.setAttribute('aria-hidden',enter===0||exit===1?'true':'false');
      if(this.progress){this.progress.style.strokeDasharray='1';this.progress.style.strokeDashoffset=staticMode?0:1-S.clamp((x-60)/1080);}
      if(this.marker)this.marker.style.transform=`translateX(${x-60}px)`;
      let nearest=0;for(let i=0;i<S.ticks.length;i++)if(S.ticks[i][0]<=x+1)nearest=i;
      this.labels.forEach((label,i)=>{label.classList.toggle('is-past',i<nearest);label.classList.toggle('is-current',i===nearest);if(i===nearest)label.setAttribute('aria-current','date');else label.removeAttribute('aria-current');});
      this.current.textContent='当前年代：'+S.ticks[nearest][1]+'年';
      for(const [id,u] of [['tl-enter',enter],['tl-exit',exit]]){const g=this.get(id);g?.querySelectorAll('path').forEach(p=>{p.style.strokeDasharray='1';p.style.strokeDashoffset=1-u;});}
    }
  }
  S.Timeline=Timeline;
  class Screen {
    constructor(parent,onBack,onEnd,onRead){
      this.el=S.el('div','story-screen',parent);
      this.timeline=new Timeline(this.el,'live-timeline');
      this.copy=S.el('div','story-copy',this.el);
      this.eyebrow=S.el('p','story-eyebrow',this.copy);
      this.title=S.el('h2','story-title',this.copy);this.title.tabIndex=-1;
      this.explain=S.el('p','story-explain',this.copy);
      this.event=S.activity(this.el);this.event.hidden=true;
      const nav=S.el('nav','story-nav',this.el);nav.setAttribute('aria-label','画卷导航');
      const back=S.el('button','story-nav-button',nav);back.type='button';back.textContent='返回封面';back.onclick=onBack;
      this.position=S.el('span','story-position type-year',nav);this.position.setAttribute('aria-hidden','true');
      const read=S.el('button','story-nav-button',nav);read.type='button';read.textContent='静态阅读';read.onclick=onRead;
      this.skip=S.el('button','story-nav-button',nav);this.skip.type='button';this.skip.textContent='活动入口 ↗';this.skip.onclick=onEnd;
      this.hint=S.el('span','story-scroll-hint',this.el);this.hint.textContent='向下滚动，沿着研究线往前';
      this.track=S.el('div','story-progress',this.el);this.track.setAttribute('aria-hidden','true');this.bar=S.el('i','',this.track);
      this.last='';
    }
    render(state,mobile){
      const {phase,t,p}=state,seam=phase==='s12'||phase==='s34';
      let theme=phase==='history'?'history':'current';
      let node=S.nodeAt(theme,t),show=true;
      if(seam){theme=phase==='s12'?'history':'current';node=S.nodes.find(n=>n.id===(phase==='s12'?'2A':'4'));show=t>.88;}
      this.el.dataset.theme=theme;this.el.dataset.node=node.id;
      const copyOpacity=phase==='opening'?1-S.ss(.10,.12,t):(show?1:0);
      this.copy.style.opacity=copyOpacity;this.copy.setAttribute('aria-hidden',copyOpacity===0?'true':'false');
      const intro=node.id==='4'&&(phase==='s34'||t<.308);
      const title=intro?'这些能力，逐渐来到每个人的输入框里。':node.title;
      const key=node.id+'-'+intro;
      if(key!==this.last){
        this.eyebrow.textContent=(theme==='history'?'历史档案':'当前现场')+' / '+String(node.act).padStart(2,'0')+'　'+node.label;
        this.title.textContent=title;
        this.explain.textContent=intro?'人们开始用自然语言，让 AI 协助写作、编程、分析和制作原型，改变具体工作的推进方式。':node.id==='7'?'我们的身位、节奏、方向是什么？':'';
        this.last=key;
      }
      this.copy.className='story-copy'+(node.id==='2B'&&!mobile?' at-bottom':node.id==='3D'&&!mobile?' at-left-bottom':mobile&&['3C','3D','5'].includes(node.id)?' at-bottom':'')+(node.id==='7'?' finale-copy':'');
      const final=node.id==='7'&&t>=.944&&!seam;
      this.event.hidden=!final;
      this.el.classList.toggle('has-event',final);
      this.position.textContent=String(node.act).padStart(2,'0')+' / 07';
      this.hint.style.opacity=phase==='opening'&&t<.045?'1':'0';
      this.bar.style.transform=`scaleX(${p})`;
      let x=60,enter=0,exit=0;
      if(phase==='history'){enter=1;x=S.yearX(t);}
      if(phase==='s12'){enter=S.ss(.65,1,t);}
      if(phase==='s34'){enter=1;x=1140;exit=S.ss(.15,.35,t);}
      this.timeline.render(x,enter,exit);
    }
  }
  S.Screen=Screen;
})();
