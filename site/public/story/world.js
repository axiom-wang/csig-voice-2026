(() => {
  'use strict';
  const S=window.CsigStory;
  // 图像/文字共用一次入场；已出现元素留在原世界中。只有 M1 的一次性便签
  // 在返回工作台时随纸面离开取景，表面三态始终来自 visible 字段。
  function revealAt(it,theme){
    const id=it.id;
    if(theme==='history'){
      const e=id.match(/(?:paper-|-)e([1-5])/);
      if(e)return [[.674,.703],[.704,.738],[.744,.779],[.784,.824],[.818,.86]][+e[1]-1];
      if(/m3d/.test(id))return [.664,.69];
      if(/stone/.test(id))return [.424,.465];
      if(/alphago/.test(id))return [.43,.46];
      if(/transformer|paper-title/.test(id))return [.552,.60];
      if(/m3a/.test(id))return [.258,.295];
      if(/paper-rules|terminal|paper-fragment|ink-retry|mainframe/.test(id))return [.118,.148];
      return [-.05,0];
    }
    if(/note-msg1|txt-msg1/.test(id))return [0,.012];
    if(/note-msg2|txt-msg2/.test(id))return [.012,.024];
    if(/note-msg3|txt-msg3/.test(id))return [.024,.036];
    if(/prototype|txt-proto/.test(id))return [.305,.34];
    if(/client-feedback|txt-client/.test(id))return [.476,.50];
    if(/delivery-note|txt-delivery/.test(id))return [.514,.54];
    if(/review-product|txt-role-p/.test(id))return [.548,.57];
    if(/review-design|txt-role-d/.test(id))return [.574,.598];
    if(/review-eng|txt-role-e/.test(id))return [.61,.64];
    if(/m6/.test(id)){
      if(/desk-opp|txt-q1/.test(id))return [.685,.694];
      if(/desk-pacing|txt-q2/.test(id))return [.694,.703];
      if(/desk-collab|txt-q3/.test(id))return [.703,.712];
      return [.797,.809];
    }
    if(/m7/.test(id))return /note-return|hw-return/.test(id)?[.906,.933]:[.868,.897];
    if(it.visible?.[0]==='act4')return [.245,.27];
    if(it.visible?.[0]==='act5')return [.48,.50];
    return [-.02,0];
  }
  // 同一时段至多两组 Secondary；每组内部逐笔接力。
  const timings={
    's01-note-emphasis':[.032,.046],'s01-question-tail':[.049,.069],
    's01-mainline':[.069,.146],'s01-exit-path':[.146,.19],
    's02-mainline':[0,.27],'s02-neuron':[.005,.075],'s02-rules':[.12,.158],
    's02-strike':[.158,.181],'s02-erase':[.181,.204],'s02-chess-seed':[.202,.236],
    's03-chess-grid':[.252,.298],'s03-image-frames':[.277,.32],
    's03-go-grid':[.412,.446],'s03-move-ring':[.454,.49],
    's03-token-boxes':[.536,.58],'s03-attention':[.575,.635],
    's03d-branch-trunk':[.666,.69], 's03d-branch-01':[.678,.704],
    's03d-branch-02':[.714,.742],'s03d-branch-03':[.752,.78],
    's03d-branch-04':[.79,.819],'s03d-branch-05':[.825,.858],
    's03d-chat-dialog':[.682,.713],'s03d-content-blocks':[.717,.749],
    's03d-video-frames':[.755,.788],'s03d-3d-wireframe':[.793,.827],
    's03d-task-execution':[.83,.865],'s03d-exit-line':[.92,1],
    's04-chat-outline':[.27,.302],'s04-plan-to-prototype':[.302,.33],
    's04-execution':[.33,.388],'s04-check':[.388,.428],'s04-client-line':[.435,.478],
    's05-question':[.492,.516],'s05-date-revision':[.534,.558],
    's05-annotation-leaders-role-1':[.561,.579],'s05-annotation-leaders-role-3':[.595,.615],
    's05-annotation-leaders-role-2':[.642,.663],'s05-collab-extension':[.666,.705],
    's06-task-lines-upper':[.704,.727],'s06-task-lines-middle':[.743,.766],'s06-task-lines-lower':[.781,.801],
    's06-pause-marks':[.806,.817],'s06-convergence':[.818,.83],'s06-into-question':[.83,.845],
    's07-mainline-close':[.858,.9],'s07-question-circle':[.902,.928],
    's07-title-underline-long':[.933,.95],'s07-title-underline-short':[2,3],
    's07-button-feedback':[.962,.985]
  };
  function pathGroups(svg,it){
    if(it.handwriting){
      const times=it.id==='m1-hw-question'?[0,.048]:it.id==='m6-hw-slow'?[.819,.853]:[.91,.936];
      return [{paths:[...svg.querySelectorAll('path')],times,initial:0}];
    }
    const groups=[];
    for(const [id,times] of Object.entries(timings)){
      const el=svg.querySelector(`[data-semantic="${id}"]`);
      if(el)groups.push({paths:el.matches('path')?[el]:[...el.querySelectorAll('path')],times,initial:0});
    }
    return groups;
  }
  class World {
    constructor(theme,prefix='live',filterModules=null){
      this.theme=theme;this.data=CsigData.maps[theme];this.items=[];this.paths=[];
      this.el=S.el('div','story-world theme-'+theme);this.el.dataset.world=theme;
      this.el.style.setProperty('--paper-url',`url("${S.asset(this.data.paper.file)}")`);
      this.paper=S.el('div','world-paper',this.el);
      this.paper.style.backgroundImage=`url("${S.asset(this.data.paper.file)}")`;
      const modules=Object.fromEntries(this.data.modules.map(m=>[m.id,m]));
      [...this.data.items].sort((a,b)=>a.layer-b.layer).forEach(it=>{
        if(filterModules&&!filterModules.includes(it.module))return;
        const mod=modules[it.module],scale=it.scale??1;
        const el=S.el('div','world-item '+(it.type==='text'?'world-text '+it.cls:''),this.el);
        el.dataset.item=it.id;el.dataset.module=it.module;
        el.style.left=(mod.x+it.x)+'px';el.style.top=(mod.y+it.y)+'px';
        el.style.zIndex=it.layer;el.style.width=it.w*scale+'px';
        if(it.type!=='text')el.style.height=it.h*scale+'px';
        if(it.color)el.style.color=it.color;
        if(it.type==='img'){
          const img=S.el('img','',el);img.dataset.src=S.asset(it.file);img.alt='';img.draggable=false;img.decoding='async';
          if(theme==='current'&&it.filter)el.classList.add('cool-'+it.filter);
        }else if(it.type==='text'){
          el.style.fontSize=it.size+'px';el.textContent=it.text;
          if(it.id==='t-m3a-paper-title')el.style.fontStyle='italic';
          if(theme==='history'&&!it.cls.includes('note'))el.classList.add('history-label');
        }else{
          const svg=S.inline(it.file,prefix+'-'+it.id);el.append(svg);
          if(it.handwriting){
            el.classList.add('hw-play');
            svg.querySelectorAll('path').forEach(p=>{p.style.strokeWidth=it.strokeW/scale;p.style.animation='none';});
          }
          this.paths.push(...pathGroups(svg,it));
        }
        this.items.push({it,el,base:`translate(-50%,-50%) rotate(${it.rot||0}deg)`,times:revealAt(it,theme)});
      });
      const movingPaper=this.items.find(i=>i.it.id==='m6-question-paper');
      if(movingPaper)this.el.append(movingPaper.el); // 同层纸张中保持问题纸最上方，移动后仍能追踪。
      this.aging=S.el('div','world-aging',this.el);
      this.veil=S.el('div','world-veil',this.el);
      this.aging.style.backgroundImage=`url("${S.asset('output/imagegen/素材/38-aging-overlay.png')}")`;
      this.paths.forEach(g=>g.paths.forEach(p=>{p.style.strokeDasharray='1';p.style.strokeDashoffset='1';}));
    }
    render(t,{complete=false,act=null}={}){
      this.t=t;
      for(const item of this.items){
        const {it,el,base,times}=item;
        let u=complete?1:S.ss(...times,t),dx=0,dy=0;
        if(this.theme==='current'){
          const start=+it.visible[0].slice(3);
          // M1 三态依赖 visible；离开 M1 后，桌面素材留在远处。
          if(complete){const a='act'+act;if(!it.visible.includes(a))u=0;}
          else if(start===1&&it.visible.length===1&&t>.20){dx=-1500*S.ss(.20,.25,t);}
          else if(it.id==='m1-txt-chat-input'&&t>.478){dx=-900*S.ss(.478,.54,t);}
          // 第六幕→第七幕仅移动这一张实体问题纸，终点与原 M7 条目一致。
          if(it.id==='m6-question-paper'&&!complete){
            u=S.ss(.797,.809,t);const q=S.ss(.847,.896,t);dx=860*q;dy=-60*q;
            el.style.transform=`translate(-50%,-50%) translate3d(${dx}px,${dy}px,0) rotate(${-3*(1-q)}deg) scale(${S.mix(1,.13/.14,q)})`;
            el.style.opacity=u;if(u>0){const image=el.querySelector('img');if(image&&!image.hasAttribute('src'))image.src=image.dataset.src;}continue;
          }
          if(it.id==='m7-question-paper'&&!complete)u=0;
        }
        if(this.theme==='history'&&it.id.includes('stone-')&&!complete){
          const stones=this.items.filter(i=>i.it.id.includes('stone-'));
          const index=stones.findIndex(i=>i.it.id===it.id);
          const q=S.ss(.52,.565,t),tx=1483+index*100;
          el.style.transform=base+` translate3d(${(tx-(1200+it.x))*q}px,${(476-it.y)*q}px,0) scale(${1+.38*q},${1-.82*q})`;
          el.style.opacity=u*(1-S.ss(.535,.565,t));
          const img=el.querySelector('img');if(u>0&&!img.hasAttribute('src'))img.src=img.dataset.src;
          continue;
        }
        if(it.type==='svg'&&!it.handwriting)u=complete?u:1;
        const slide=it.type==='img'||it.type==='text';
        const offset=slide&&!complete?(1-u)*38:0;
        el.style.transform=base+` translate3d(${dx+offset}px,${dy-offset*.3}px,0)`;
        el.style.opacity=u;
        if(u>0){const image=el.querySelector('img');if(image&&!image.hasAttribute('src'))image.src=image.dataset.src;}
        el.setAttribute('aria-hidden',u===0||Math.abs(dx)>1000?'true':'false');
      }
      for(const g of this.paths){
        const overall=complete?1:S.clamp((t-g.times[0])/(g.times[1]-g.times[0]));
        g.paths.forEach((p,i)=>{
          let u=S.pen(S.clamp(overall*g.paths.length-i));
          if(p.dataset.semantic==='s02-mainline-stroke-01')u=1; // 与 s12 同 d 的入口已绘完。
          if(p.dataset.semantic==='s04-chat-outline-stroke-03'&&t>=.27)u=.35+.65*u;
          if(p.dataset.semantic?.includes('underline-short'))u=0;
          p.style.strokeDashoffset=1-u;
        });
      }
      const chat=this.select('s04-chat-outline');
      if(chat)chat.style.transform=`translateX(${-900*S.ss(.478,.54,t)}px)`;
      const short=this.select('s07-title-underline-short');if(short)short.style.display='none';
      this.aging.style.opacity='0';this.veil.style.opacity='0';
    }
    select(semantic){return this.el.querySelector(`[data-semantic="${semantic}"]`);}
    async ready(){await Promise.all([...this.el.querySelectorAll('img[src]')].map(img=>img.decode().catch(()=>{img.classList.add('asset-missing');})));}
    destroy(){this.el.remove();}
  }
  S.World=World;
})();
