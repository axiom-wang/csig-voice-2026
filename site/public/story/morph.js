(() => {
  'use strict';
  const S=CsigStory;
  // 任意 path 拓扑先按弧长归一为等量顶点；只在活动 morph 区间更新 d。
  // 定稿 morphPairs 语义 id 保留在 data-morph，采样基于真实源 SVG 几何。
  class Morph {
    constructor(world){
      this.world=world;this.pairs=[];
      this.svg=S.svg('svg',{viewBox:'0 0 3600 800',width:3600,height:800,'aria-hidden':'true'},world.el);
      this.svg.classList.add('world-morph');
      const specs=[
        ['mp-rules-to-imagegrid','s02-rules','s03-chess-grid',.226,.246],
        ['mp-seed-to-imagegrid','s02-chess-seed','s03-chess-grid',.246,.278],
        ['mp-imagegrid-to-gogrid','s03-chess-grid','s03-go-grid',.384,.424],
        ['mp-frames-to-stones','s03-image-frames','s03-move-ring',.424,.447],
        ['mp-stones-to-tokens','s03-move-ring','s03-token-boxes',.52,.565],
        ['mp-attention-to-branches','s03-attention','s03d-branch-trunk',.645,.678]
      ];
      for(const [id,from,to,a,b] of specs){
        const A=world.select(from),B=world.select(to);if(!A||!B)continue;
        const pa=[...A.querySelectorAll('path')],pb=[...B.querySelectorAll('path')];
        if(!pa.length||!pb.length)continue;
        const g=S.svg('g',{'data-morph':id},this.svg),curves=[];
        for(let i=0;i<Math.max(pa.length,pb.length);i++){
          const p=pa[i%pa.length],q=pb[i%pb.length];
          const x=this.sample(p),y=this.sample(q);
          const path=S.svg('path',{pathLength:1,fill:'none',stroke:'var(--tech)','stroke-width':1.5,'vector-effect':'non-scaling-stroke','stroke-linecap':'round','stroke-linejoin':'round'},g);
          curves.push({path,x,y});
        }
        this.pairs.push({id,A,B,g,curves,a,b});
      }
    }
    sample(path){
      const it=path.closest('[data-item]');
      const spec=this.world.data.items.find(i=>i.id===it.dataset.item);
      const mod=this.world.data.modules.find(m=>m.id===spec.module);
      const offset={x:mod.x+spec.x-spec.w*(spec.scale||1)/2,y:mod.y+spec.y-spec.h*(spec.scale||1)/2};
      const total=path.getTotalLength();
      return Array.from({length:49},(_,i)=>{const p=path.getPointAtLength(total*i/48);return {x:p.x+offset.x,y:p.y+offset.y};});
    }
    render(t){
      for(const el of new Set(this.pairs.flatMap(p=>[p.A,p.B])))el.style.opacity='1';
      for(const p of this.pairs){
        const active=t>p.a&&t<p.b;p.g.style.opacity=active?'1':'0';
        // 旧手稿保留作痕迹，morph 实体沿镜头移动到新坐标。
        if(t>=p.b)p.B.querySelectorAll('path').forEach(path=>path.style.strokeDashoffset='0');
        if(!active)continue;
        p.A.style.opacity='.22';p.B.style.opacity='0';
        const u=S.ss(p.a,p.b,t),arc=28*Math.sin(Math.PI*u);
        for(const {path,x,y} of p.curves){
          path.setAttribute('d',x.map((v,i)=>`${i?'L':'M'}${S.mix(v.x,y[i].x,u).toFixed(2)},${(S.mix(v.y,y[i].y,u)-arc).toFixed(2)}`).join(' '));
        }
      }
    }
  }
  S.Morph=Morph;
})();
