/* V6.5 — animate the existing artwork, without moving its layout or wave contours. */
(() => {
  'use strict';
  const scene = document.querySelector('.ki-workflow-scene');
  const img = scene?.querySelector('.ki-workflow-image');
  if (!img) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'ki-motion-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  scene.append(canvas);
  const profiles = {
    desktop: {
      width: 1983, height: 793, line: 2.2, dash: [6, 5], speed: 20,
      paths: [
        'M542 376 C558 384 572 387 582 386',
        'M541 484 C569 470 569 414 584 392',
        'M680 386 L714 386', 'M811 386 L845 386', 'M937 386 L971 386',
        'M1068 376 C1090 352 1105 330 1127 315',
        'M1068 392 C1090 414 1106 442 1128 456',
        'M907 336 C974 290 1056 268 1121 283',
        {d:'M1038 466 C1070 489 1103 486 1131 475',violet:true},
        { d: 'M1192 383 C1215 401 1216 414 1193 427', violet: true },
        'M1217 306 L1273 306', 'M1360 306 L1426 306',
        'M1217 465 L1270 465', 'M1360 465 L1425 465'
      ],
      circles: [[507,373,35],[507,485,35],[635,385,45],[768,385,45],[896,384,45],[1026,384,44],[1174,306,43],[1174,466,43],[1325,306,35],[1325,465,35],[1480,306,35],[1480,465,35]],
      labels: [[465,409,100,32],[466,519,105,34],[586,430,105,34],[717,430,110,34],[846,430,104,34],[973,430,110,34],[1114,350,130,35],[1116,512,126,34],[1287,340,79,35],[1285,500,83,34],[1429,341,108,34],[1433,500,102,35]],
      waveTop: x => x < 450 ? 405 + x * .28 : x < 1550 ? 560 : 560 - (x - 1550) * .24,
      caption: [626,672,735,55]
    },
    mobile: {
      width: 1086, height: 1448, line: 3.8, dash: [10, 8], speed: 33,
      paths: [
        'M376 294 C483 294 509 307 534 360',
        'M715 294 C610 291 571 310 545 359',
        'M615 467 L745 467', 'M769 578 L769 616',
        'M645 707 L510 707',
        'M501 823 C557 859 598 864 659 869 C673 870 682 876 688 881',
        'M520 838 C512 865 478 866 433 867 C410 867 398 874 391 880',
        { d:'M441 959 C527 981 573 975 641 959', violet:true },
        'M286 1086 L283 1101','M427 1087 L428 1101',
        'M658 1085 L657 1100','M807 1086 L807 1100',
        'M322 1158 L366 1158','M700 1158 L746 1158'
      ],
      circles: [[320,298,51],[766,298,51],[539,460,73],[851,470,73],[405,707,73],[725,708,73],[352,962,74],[715,962,74],[278,1160,42],[429,1160,42],[656,1160,42],[809,1160,42]],
      labels: [[254,341,172,56],[693,342,149,57],[444,531,191,57],[774,539,169,57],[320,779,180,58],[648,780,153,57],[258,1029,232,57],[615,1029,263,57],[221,1201,121,51],[354,1208,156,29],[619,1200,96,54],[743,1208,149,31]],
      waveTop: x => x < 220 ? 1090 : x < 900 ? 1253 : 1110,
      caption: [165,1313,759,97]
    }
  };
  const cache = new Map();
  let active = null, token = 0, raf = 0, last = 0, elapsed = 0, previous = 0;
  let showing = false, transform = null;
  function surface(w, h) {
    const c = document.createElement('canvas'); c.width=w; c.height=h; return c;
  }
  function smooth(a,b,x) { const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
  function inside(x,y,r,pad=0) { return x>=r[0]-pad && x<=r[0]+r[2]+pad && y>=r[1]-pad && y<=r[1]+r[3]+pad; }
  function protectedPixel(x,y,p) {
    return p.circles.some(([cx,cy,r])=>(x-cx)**2+(y-cy)**2<r*r) || p.labels.some(r=>inside(x,y,r,1));
  }
  function trace(svg, src, p, violet=false) {
    const length=svg.getTotalLength(), points=[];
    // Recover the actual dashed centerline from the raster, including its curves.
    // Sample along the tangent too, so gaps between dashes do not move the path.
    for(let s=0;s<=length;s+=1) {
      const q=svg.getPointAtLength(s),a=svg.getPointAtLength(Math.max(0,s-1)),b=svg.getPointAtLength(Math.min(length,s+1));
      const len=Math.hypot(b.x-a.x,b.y-a.y)||1, tx=(b.x-a.x)/len,ty=(b.y-a.y)/len,nx=-ty,ny=tx;
      let sum=0,weight=0;
      for(let d=-13;d<=13;d++)for(let along=-4;along<=4;along+=2){
        const x=Math.round(q.x+nx*d+tx*along),y=Math.round(q.y+ny*d+ty*along);
        if(x<0||y<0||x>=p.width||y>=p.height||protectedPixel(x,y,p))continue;
        const i=(y*p.width+x)*4;
        const cyan=violet?Math.min(src[i],src[i+1])-src[i+2]*.18:Math.min(src[i+1],src[i+2])-src[i]*.18;
        const v=Math.max(0,cyan-105)**3;
        sum+=d*v;weight+=v;
      }
      points.push({x:q.x,y:q.y,nx,ny,offset:weight?sum/weight:0});
    }
    return points.map((q,i)=>{
      let sum=0,n=0;
      for(let j=Math.max(0,i-6);j<=Math.min(points.length-1,i+6);j++){sum+=points[j].offset;n++;}
      const offset=sum/n;
      return {x:q.x+q.nx*offset,y:q.y+q.ny*offset};
    });
  }
  function prepare(image, p) {
    const w=p.width,h=p.height, base=surface(w,h), bc=base.getContext('2d',{willReadFrequently:true});
    bc.drawImage(image,0,0,w,h);
    const original=bc.getImageData(0,0,w,h), clean=new ImageData(new Uint8ClampedArray(original.data),w,h);
    const src=original.data, dst=clean.data;
    const coverage=new Float32Array(w*h);
    const sample=(x,y,k)=>src[(Math.max(0,Math.min(h-1,Math.round(y)))*w+Math.max(0,Math.min(w-1,Math.round(x))))*4+k];
    const radius=p.line*3.0, outer=radius+3;
    const paths=p.paths.map(entry=>{
      const spec=typeof entry==='string'?{d:entry}:entry;
      const svg=document.createElementNS('http://www.w3.org/2000/svg','path');
      svg.setAttribute('d',spec.d);
      const points=trace(svg,src,p,spec.violet);
      const length=svg.getTotalLength();
      const tracked=points||Array.from({length:Math.ceil(length)+1},(_,i)=>svg.getPointAtLength(Math.min(i,length)));
      const line=new Path2D();tracked.forEach((q,i)=>i?line.lineTo(q.x,q.y):line.moveTo(q.x,q.y));
      // Replace only the original dashed strokes. Their arrowheads stay untouched.
      for(let s=0;s<tracked.length;s++) {
        const q=tracked[s],a=tracked[Math.max(0,s-1)],b=tracked[Math.min(tracked.length-1,s+1)];
        const len=Math.hypot(b.x-a.x,b.y-a.y)||1, nx=-(b.y-a.y)/len, ny=(b.x-a.x)/len;
        const candidates=[];
        for(const offset of [outer+3,-outer-3,outer+8,-outer-8])for(const back of [0,10]){
          const rgb=[0,1,2].map(k=>sample(q.x+nx*offset+ny*back,q.y+ny*offset-nx*back,k));
          candidates.push({rgb,brightness:rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722});
        }
        candidates.sort((a,b)=>a.brightness-b.brightness);
        // Reject foreground text, circle rims and arrow glow as background samples.
        const background=[0,1,2].map(k=>(candidates[0].rgb[k]+candidates[1].rgb[k]+candidates[2].rgb[k])/3);
        for(let y=Math.max(0,Math.floor(q.y-outer-1));y<=Math.min(h-1,Math.ceil(q.y+outer+1));y++)for(let x=Math.max(0,Math.floor(q.x-outer-1));x<=Math.min(w-1,Math.ceil(q.x+outer+1));x++) {
          const dx=x-q.x,dy=y-q.y,d=dx*nx+dy*ny,along=-dx*ny+dy*nx;
          if(Math.abs(along)>1.2||Math.abs(d)>outer||protectedPixel(x,y,p))continue;
          const idx=y*w+x, blend=1-smooth(radius*.72,outer,Math.abs(d));
          if(blend<=coverage[idx])continue;
          coverage[idx]=blend;
          for(let k=0;k<3;k++){
            dst[idx*4+k]=src[idx*4+k]*(1-blend)+background[k]*blend;
          }
        }
      }
      return {...spec,path:line};
    });
    bc.putImageData(clean,0,0);
    const wave=surface(w,h), wc=wave.getContext('2d'), glow=wc.createImageData(w,h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      if(y<p.waveTop(x)||inside(x,y,p.caption,7))continue;
      const i=(y*w+x)*4, light=Math.max(src[i],src[i+1]), color=Math.max(src[i],src[i+1],src[i+2])-Math.min(src[i],src[i+1],src[i+2]);
      const strength=smooth(65,175,light)*smooth(25,90,color)*smooth(p.waveTop(x),p.waveTop(x)+32,y);
      glow.data[i]=src[i];glow.data[i+1]=src[i+1];glow.data[i+2]=src[i+2];glow.data[i+3]=Math.round(255*strength);
    }
    wc.putImageData(glow,0,0);
    return {p,base,wave,paths,frame:surface(w,h),network:surface(w,h),light:surface(w,h)};
  }
  function renderFrame(data, seconds) {
    const {p,base,paths,wave,frame,network,light}=data, w=p.width,h=p.height;
    const f=frame.getContext('2d'), l=light.getContext('2d'),n=network.getContext('2d');
    f.clearRect(0,0,w,h);f.drawImage(base,0,0);
    n.clearRect(0,0,w,h);n.save();n.lineCap='round';n.lineJoin='round';n.setLineDash(p.dash);n.lineDashOffset=-seconds*p.speed;
    for(const item of paths){
      n.strokeStyle=item.violet?'#FFE58C':'#9af7ff';n.shadowColor=item.violet?'#FFD45A':'#00cfff';
      n.shadowBlur=p.line*2.6;n.lineWidth=p.line;n.stroke(item.path);
    }
    n.restore();n.save();n.globalCompositeOperation='destination-out';
    p.circles.forEach(([x,y,r])=>{n.beginPath();n.arc(x,y,r+1,0,Math.PI*2);n.fill();});
    p.labels.forEach(([x,y,w,h])=>n.fillRect(x-2,y-2,w+4,h+4));
    n.restore();f.drawImage(network,0,0);
    // Curved light bands travel right, only through the ORIGINAL wave pixels.
    // No coordinates in the artwork are displaced, cropped or rescaled here.
    l.clearRect(0,0,w,h);l.globalCompositeOperation='source-over';
    const spacing=p.width===1983?370:300, band=spacing*.70;
    const phase=(seconds*95)%spacing;
    for(let y=0;y<h;y+=8){
      const shift=Math.sin(y/83-seconds*.8)*26;
      for(let x=phase-spacing;x<w+spacing;x+=spacing){
        const g=l.createLinearGradient(x+shift-band/2,0,x+shift+band/2,0);
        g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.88)');g.addColorStop(1,'rgba(255,255,255,0)');
        l.fillStyle=g;l.fillRect(x+shift-band/2,y,band,8);
      }
    }
    l.globalCompositeOperation='source-in';l.drawImage(wave,0,0);l.globalCompositeOperation='source-over';
    f.save();f.globalCompositeOperation='screen';f.globalAlpha=.80;f.drawImage(light,0,0);f.restore();
    return frame;
  }
  function resize() {
    if(!active)return;
    const r=img.getBoundingClientRect(),s=scene.getBoundingClientRect(),style=getComputedStyle(img);
    if(!r.width||!r.height)return;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.style.left=`${r.left-s.left}px`;canvas.style.top=`${r.top-s.top}px`;
    canvas.style.width=`${r.width}px`;canvas.style.height=`${r.height}px`;
    canvas.style.maskImage=style.maskImage;canvas.style.webkitMaskImage=style.webkitMaskImage;
    const cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);
    if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
    const p=active.p,scale=(style.objectFit==='contain'?Math.min:Math.max)(r.width/p.width,r.height/p.height);
    const position=style.objectPosition.split(' ').map(v=>parseFloat(v)/100);
    transform={dpr,x:(r.width-p.width*scale)*(position[0]||.5),y:(r.height-p.height*scale)*(position[1]||.5),width:p.width*scale,height:p.height*scale};
    paint(elapsed);
  }
  function paint(seconds) {
    if(!active||!transform||reduce.matches)return;
    const t=transform;
    ctx.setTransform(t.dpr,0,0,t.dpr,0,0);ctx.clearRect(0,0,canvas.width/t.dpr,canvas.height/t.dpr);
    ctx.drawImage(renderFrame(active,seconds),t.x,t.y,t.width,t.height);
  }
  function visible() {
    return showing&&!document.hidden&&!reduce.matches&&Number(getComputedStyle(scene).opacity)>.02;
  }
  function tick(now) {
    raf=0;
    if(!active||!visible()){previous=0;return;}
    if(now-last>=1000/30){
      if(previous)elapsed+=Math.min((now-previous)/1000,.10);
      previous=now;last=now;paint(elapsed);
    }
    raf=requestAnimationFrame(tick);
  }
  function schedule() {
    if(raf)cancelAnimationFrame(raf);raf=0;previous=0;
    const enabled=!!active&&!reduce.matches;
    canvas.hidden=!enabled;img.style.opacity=enabled?'0':'';
    if(enabled){resize();if(visible())raf=requestAnimationFrame(tick);}
  }
  async function load() {
    const current=++token;
    try {
      await img.decode();
      const key=img.currentSrc||img.src;
      if(!cache.has(key)) {
        const image=new Image();image.src=key;await image.decode();
        const profile=image.naturalWidth===1086?profiles.mobile:profiles.desktop;
        cache.set(key,prepare(image,profile));
      }
      if(current!==token)return;
      active=cache.get(key);scene.dataset.motion='ready';resize();schedule();
    }catch(error){
      if(current!==token)return;
      if(raf)cancelAnimationFrame(raf);raf=0;active=null;transform=null;
      canvas.hidden=true;img.style.opacity='';scene.dataset.motion='fallback';
    }
  }
  new IntersectionObserver(entries=>{showing=entries.some(e=>e.isIntersecting);schedule();},{threshold:.01}).observe(scene);
  new ResizeObserver(()=>{resize();schedule();}).observe(img);
  // app.js updates scroll progress in its own animation frame. Observe that
  // change so a single scroll/jump starts motion after the scene has appeared.
  new MutationObserver(()=>{
    if(visible()&&!raf)schedule();
    else if(!visible()&&raf){cancelAnimationFrame(raf);raf=0;previous=0;}
  }).observe(scene.closest('.scroll-story'),{attributes:true,attributeFilter:['style']});
  img.addEventListener('load',load);
  window.addEventListener('scroll',()=>{if(!raf&&visible())schedule();},{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduce.addEventListener('change',schedule);
  // Read-only deterministic frame access for local QA; absent from normal pages.
  if(new URLSearchParams(location.search).has('motionQA'))window.kiMotionQA={
    render(seconds){if(raf)cancelAnimationFrame(raf);raf=0;paint(seconds);return canvas.toDataURL('image/png');},
    native(seconds){return renderFrame(active,seconds).toDataURL('image/png');},
    profile(){return active?.p;},
    status(){return {elapsed,showing,raf,visible:visible(),opacity:getComputedStyle(scene).opacity,rect:scene.getBoundingClientRect().toJSON()};}
  };
  load();
})();
