(() => {
  'use strict';
  const S=CsigStory;
  // 几何、偏移、材质、前沿公式逐项来自 seam-contract.md。
  const configs=S.seams={
    s12:{A:'current',B:'history',aW:1200,bW:3600,bOff:1600,fStart:.6345,
      d:'M230 225 C231 251 218 265 204 278 C194 288 193 304 202 313 C211 322 229 318 243 324 C299 345 351 389 420 400 C450 408 474 389 492 398 C506 406 500 416 519 415 C613 411 690 422 780 403 C821 395 853 386 880 372 C905 360 911 365 927 354 C1003 300 1087 322 1200 320 C1300 318 1360 372 1440 368 C1520 364 1560 326 1600 320 C1690 320 1666 457 1767 479',
      headStart:[1200,320],swap:[.3,.6],lead:[.25,.55,140],flush:[.8,1,900],frontA:[.1,.75],aging:[.35,.9],veil:[.3,.85,.4],
      desktop:[[0,1000,350,1.45],[.2,1150,330,1.35],[.45,1440,365,1.15],[.7,1640,340,1.10],[.85,1780,380,1.05],[1,1900,415,1.05]],
      mobile:[[0,1000,340,1.3],[.25,1220,330,1.15],[.5,1440,365,1],[.75,1660,350,.85],[1,1895,400,.74]],
      aEdge:'37-print-paper-edge.png',bEdge:'36-archival-paper-edge.png'},
    s34:{A:'history',B:'current',aW:3600,bW:1200,bOff:4000,fStart:.2825,
      d:'M3568 650 C3590 556 3576 428 3600 322 C3630 215 3755 150 3910 158 C4060 166 4148 190 4166 246 C4176 282 4162 320 4154 344 C4160 318 4170 296 4168 270',
      headStart:[3600,322],swap:[.4,.7],lead:[.3,.6,120],flush:[.8,1,750],frontA:[.05,.7],aging:[.1,.6],veil:[.45,.9,.45],
      desktop:[[0,3440,470,1.3],[.3,3700,230,1.4],[.6,4000,220,1.6],[.8,4270,300,1.6],[1,4460,250,1.55]],
      mobile:[[0,3420,660,.9],[.35,3680,260,1],[.65,4080,220,1.3],[.85,4291,290,1.6],[1,4291,270,1.6]],
      aEdge:'36-archival-paper-edge.png',bEdge:'37-print-paper-edge.png'}
  };
  const wave=y=>14*Math.sin(.018*y+1.3)+8*Math.sin(.047*y+.5);
  S.wave=wave;
  function polygon(front,left=-2600){
    if(front<=0)return 'polygon(0 0,0 0,0 100%,0 100%)';
    // 波形延伸到取景框之外，纸底不会出现 800wu 的硬矩形边。
    const points=[`${left}px -2200px`];
    for(let y=-2200;y<=3000;y+=40)points.push(`${front+wave(y)}px ${y}px`);
    points.push(`${left}px 3000px`);return `polygon(${points.join(',')})`;
  }
  class Seam {
    constructor(id,parent){
      this.id=id;this.cfg=configs[id];this.el=S.el('div','seam-fx',parent);
      this.svg=S.svg('svg',{viewBox:'0 0 5200 800',width:5200,height:800,fill:'none','stroke-linecap':'round','aria-hidden':'true'},this.el);
      this.pencil=S.svg('path',{d:this.cfg.d,pathLength:1,stroke:'#4d4842','stroke-width':2.4,'vector-effect':'non-scaling-stroke'},this.svg);
      this.ink=S.svg('path',{d:this.cfg.d,pathLength:1,stroke:'#302d29','stroke-width':1.8,'vector-effect':'non-scaling-stroke'},this.svg);
      this.dot=S.svg('circle',{r:3.4,fill:'#4d4842'},this.svg);
      this.length=this.ink.getTotalLength();
      // fStart 用实际路径测量，误差≤.25wu，不将约值当作断点。
      let min=Infinity;
      for(let i=0;i<=8000;i++){const p=this.ink.getPointAtLength(this.length*i/8000);const d=(p.x-this.cfg.headStart[0])**2+(p.y-this.cfg.headStart[1])**2;if(d<min){min=d;this.start=i/8000;}}
      this.edgeA=this.edge(this.cfg.aEdge);this.edgeB=this.edge(this.cfg.bEdge);
      this.handoff=S.svg('path',{d:'M168 270 Q166 259 179 259 L403 261 Q415 261 414 274 L413 334 Q413 345 400 345 L226 344 L207 360 L208 344 L180 343 Q168 343 168 331 Z',transform:'translate(4000 0)',pathLength:1,stroke:'#4d4842','stroke-width':1.8,'vector-effect':'non-scaling-stroke'},this.svg);
    }
    edge(file){const edge=S.el('div','seam-edge',this.el);const face=S.el('i','',edge);face.style.backgroundImage=`url("${S.asset('output/imagegen/素材/'+file)}")`;return edge;}
    params(t,mobile){
      const c=this.cfg,h=S.mix(this.start,1,t),head=this.ink.getPointAtLength(this.length*h);
      const frontB=S.clamp(head.x-c.bOff+c.lead[2]*S.ss(c.lead[0],c.lead[1],t),0,c.bW)+c.flush[2]*S.ss(c.flush[0],c.flush[1],t);
      const frontA=c.aW*(1-S.ss(...c.frontA,t));
      const ink=S.ss(...c.swap,t),aging=.5*S.ss(...c.aging,t),veil=c.veil[2]*(1-S.ss(c.veil[0],c.veil[1],t));
      const keys=c[mobile?'mobile':'desktop'].map(([t,x,y,z])=>({t,x,y,z}));
      const cam=S.cameraAt(keys,t,true);
      return {h,head:{x:head.x,y:head.y},frontA,frontB,ink:this.id==='s12'?ink:1-ink,aging:this.id==='s12'?aging:.5-aging,veil,cam};
    }
    render(t,A,B,mobile,rm=false){
      const c=this.cfg,pr=this.params(t,mobile);
      if(rm){pr.frontA=c.aW;pr.frontB=this.id==='s12'?340:430;pr.h=1;pr.aging=.25;pr.veil=0;}
      A.el.style.transform='';B.el.style.transform=`translate3d(${c.bOff}px,0,0)`;
      A.el.style.clipPath=polygon(pr.frontA);B.el.style.clipPath=polygon(pr.frontB,-2600*S.ss(.82,1,t));
      A.el.style.zIndex=0;B.el.style.zIndex=1;
      const activeA=this.id==='s12'?.19:1,activeB=this.id==='s12'?0:.27;
      A.render(activeA);B.render(activeB);
      for(const [path,alpha] of [[this.ink,pr.ink],[this.pencil,1-pr.ink]]){
        path.style.strokeDasharray='1';path.style.strokeDashoffset=1-pr.h;path.style.opacity=alpha;
      }
      this.dot.style.transform=`translate(${pr.head.x}px,${pr.head.y}px)`;
      this.dot.style.opacity=rm?'0':'1';
      this.edgeA.style.transform=`translate3d(${pr.frontA-30}px,0,0)`;
      this.edgeB.style.transform=`translate3d(${c.bOff+pr.frontB-30}px,0,0)`;
      this.edgeA.style.opacity=pr.frontA>0?'1':'0';this.edgeB.style.opacity=pr.frontB>0&&t<.998?'1':'0';
      (this.id==='s12'?B:A).aging.style.opacity=pr.aging;
      B.veil.style.opacity=pr.veil;
      const u=S.ss(c.veil[0],c.veil[1],t),cold=[238,242,246],warm=[239,231,216];
      const a=this.id==='s12'?cold:warm,b=this.id==='s12'?warm:cold;
      B.veil.style.background=`rgb(${a.map((v,i)=>Math.round(S.mix(v,b[i],u))).join(',')})`;
      this.handoff.style.opacity=this.id==='s34'?S.ss(.86,1,t):0;
      this.handoff.style.strokeDasharray='1';this.handoff.style.strokeDashoffset=1-.35*S.ss(.86,1,t);
      if(this.id==='s34'){
        // 第四幕原生轮廓承接同一路径起笔，避免两条描边重复显影。
        const path=B.select('s04-chat-outline-stroke-03');if(path)path.style.strokeDashoffset=1-.35*S.ss(.86,1,t);
      }
      return pr;
    }
  }
  S.Seam=Seam;
})();
