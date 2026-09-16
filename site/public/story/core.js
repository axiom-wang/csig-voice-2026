/* 所有状态只由叙事进度产生；没有计时器驱动的叙事动画。 */
(() => {
  'use strict';
  const S = window.CsigStory = {};
  S.clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
  S.mix = (a,b,t) => a+(b-a)*t;
  S.ss = (a,b,p) => { const t=S.clamp((p-a)/(b-a)); return t*t*(3-2*t); };
  // 起笔稍慢，中段近匀速，收笔顿挫；仍然完全随 scroll scrub。
  S.pen = t => t<.15 ? .075*(t/.15)**2 : t>.85 ? 1-.075*((1-t)/.15)**2 : .075+(t-.15)*(.85/.7);
  S.el = (tag,cls,parent) => { const n=document.createElement(tag); if(cls)n.className=cls; if(parent)parent.append(n); return n; };
  S.svg = (tag,attrs={},parent) => {const n=document.createElementNS('http://www.w3.org/2000/svg',tag); for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v); if(parent)parent.append(n); return n;};
  S.asset = file => window.CsigData.assets[file];
  S.inline = (file,prefix) => {
    const template=document.createElement('template');
    template.innerHTML=window.CsigData.svgs[file].replace(/<\/svg\s*$/,'</svg>');
    const svg=template.content.querySelector('svg');
    if(!svg)throw Error('SVG 无法读取：'+file);
    svg.removeAttribute('width');svg.removeAttribute('height');svg.removeAttribute('style');
    svg.querySelectorAll('[id]').forEach(n=>{n.dataset.semantic=n.id;n.id=prefix+'-'+n.id;});
    svg.querySelectorAll('path').forEach(n=>{n.setAttribute('pathLength','1');n.style.animation='none';});
    return svg;
  };
  S.segments={opening:[0,.11],s12:[.11,.165],history:[.165,.58],s34:[.58,.65],present:[.65,1]};
  S.globalFor=(phase,t)=> {
    const [a,b]=S.segments[phase];
    const q=phase==='opening'?t/.19:phase==='present'?(t-.27)/.73:t;
    return S.mix(a,b,q);
  };
  S.resolve=p=> {
    p=S.clamp(p);
    let phase=p<.11?'opening':p<.165?'s12':p<.58?'history':p<.65?'s34':'present';
    const [a,b]=S.segments[phase],u=(p-a)/(b-a);
    return {p,phase,t:phase==='opening'?u*.19:phase==='present'?.27+u*.73:u};
  };
  S.cameraAt=(keys,t,continuous=false)=>{
    if(t<=keys[0].t)return {...keys[0]};
    const k=keys.findIndex((a,i)=>i>0&&t<=a.t);
    if(k<0)return {...keys.at(-1)};
    const a=keys[k-1],b=keys[k];
    let u=(t-a.t)/(b.t-a.t);
    // 阅读点两侧形成平台；密集区连续移动，不变成五次停顿。
    u=continuous?u:S.ss(.14,.86,u);
    const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||1;
    const arc=continuous?0:Math.min(18,dist*.03)*Math.sin(Math.PI*u);
    return {x:S.mix(a.x,b.x,u)-dy/dist*arc,y:S.mix(a.y,b.y,u)+dx/dist*arc,z:S.clamp(S.mix(a.z,b.z,u),.6,1.6)};
  };
  S.camera=(theme,t,mobile)=>{
    let keys=CsigData.maps[theme].camera[mobile?'mobile':'desktop'].keys;
    // 移动端第一段以契约 .19 出口收束；灰盒 .18 点本身仍保留。
    return S.cameraAt(keys,t,theme==='history'&&t>=.68);
  };
  S.transformCamera=(el,cam,w,h)=>{el.style.transform=`translate3d(${w/2-cam.x*cam.z}px,${h/2-cam.y*cam.z}px,0) scale(${cam.z})`;};
  S.nodes=[
    {id:'1',theme:'current',act:1,label:'来得及吗？',title:'是我在追 AI，还是 AI 在追我？',d:.06,m:.05},
    {id:'2A',theme:'history',act:2,label:'一个问题，可以研究很多年',title:'人们开始认真追问：机器能不能思考？',d:.06,m:.02,year:1956},
    {id:'2B',theme:'history',act:2,label:'早期探索',title:'最初，人要把解决问题的方法，一条条告诉机器。',d:.19,m:.15,year:1956},
    {id:'3A',theme:'history',act:3,label:'从数据中学习',title:'面对复杂的图像，机器开始从大量样本中学出规律。',d:.34,m:.36,year:2012},
    {id:'3B',theme:'history',act:3,label:'学习与搜索结合',title:'学习与搜索结合，机器能应对更复杂的决策。',d:.49,m:.49,year:2016},
    {id:'3C',theme:'history',act:3,label:'联系上下文',title:'模型有了更有效地联系上下文的方法。',d:.62,m:.65,year:2017},
    {id:'3D',theme:'history',act:3,label:'下一次突破，越来越近',title:'还没消化上一次，下一次已经来了。',d:.89,m:.88,year:2026},
    {id:'4',theme:'current',act:4,label:'变化，到了我的桌上',title:'过去要做几天，现在可以先跑一版。',d:.44,m:.44},
    {id:'5',theme:'current',act:5,label:'我快了，要求也快了',title:'我刚学会的，正在变成新的要求。',d:.62,m:.61},
    {id:'6',theme:'current',act:6,label:'一个人快，还不够',title:'我们怎样一起向前？',d:.81,m:.84},
    {id:'7',theme:'current',act:7,label:'把问题带到这里',title:'AI 的加速度',d:1,m:1}
  ];
  S.nodeAt=(theme,t)=>{
    const id=theme==='history'?(t<.12?'2A':t<.26?'2B':t<.42?'3A':t<.55?'3B':t<.68?'3C':'3D'):(t<.24?'1':t<.48?'4':t<.69?'5':t<.88?'6':'7');
    return S.nodes.find(n=>n.id===id);
  };
  S.ticks=[[60,1956],[420,1997],[640,2012],[760,2016],[850,2017],[960,2022],[1005,2023],[1050,2024],[1095,2025],[1140,2026]];
  S.yearX=t=>{
    const keys=[[0,60],[.12,60],[.23,420],[.275,640],[.39,640],[.43,760],[.52,760],[.565,850],[.668,850],[.702,960],[.714,960],[.739,1005],[.752,1005],[.779,1050],[.791,1050],[.827,1095],[.839,1095],[.873,1140],[1,1140]];
    let i=keys.findIndex((a,j)=>j>0&&t<=a[0]);if(i<0)return 1140;
    return S.mix(keys[i-1][1],keys[i][1],S.ss(keys[i-1][0],keys[i][0],t));
  };
})();
