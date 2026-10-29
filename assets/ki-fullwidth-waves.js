/* V6.2 — authentic continuous wave texture, seamlessly spanning the WHOLE section. */
(()=>{
  const scene=document.querySelector('.scroll-story .reference-viewport');
  const canvas=scene?.querySelector('.ki-fullwidth-wave');
  if(!scene || !canvas) return;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx) return;
  const tile=new Image();tile.decoding='async';tile.src='assets/ki-wave-one-piece.webp';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let showing=false,started=0,raf=0,last=0,CW=0,CH=0,ratio=1;
  function resize(){
    ratio=Math.min(window.devicePixelRatio||1,1.5);
    const r=canvas.getBoundingClientRect();
    CW=Math.round(r.width*ratio);CH=Math.round(r.height*ratio);
    if(!CW || !CH)return;
    if(canvas.width!==CW || canvas.height!==CH){canvas.width=CW;canvas.height=CH;}
    draw(performance.now(),true);
  }
  function draw(time,staticFrame=false){
    if(!tile.complete || !tile.naturalWidth || !CW || !CH) return;
    const t=reduce.matches || staticFrame?0:(time-started)/1000;
    ctx.clearRect(0,0,CW,CH);
    // A mirrored two-panel tile has a truly seamless periodic horizontal edge.
    // Moving the sample window to the LEFT makes the wave travel RIGHT.
    const srcW=tile.naturalWidth; // 3072
    const speed=36; // image pixels per second, continuous rightward travel
    const sampleScale=1536/Math.max(800,CW); // preserve the original perspective
    const centerAtRest=768-srcW/2;
    const step=5;
    // Animate physical horizontal travel AND wave-shaped height variation.
    for(let dx=0;dx<CW;dx+=step){
      const sw=Math.min(step,CW-dx);
      const relative=(dx-CW/2)*sampleScale+768;
      let sx=((relative-t*speed)%srcW+srcW)%srcW;
      const phase=(dx*sampleScale - t*speed)/182;
      const shiftY=(Math.sin(phase)*8+Math.sin(phase*.54+1.25)*4)*CH/300;
      // Tile texture is stored at the same height as the displayed wave scene.
      if(sx+sw*sampleScale<srcW){
        ctx.drawImage(tile,sx,0,sw*sampleScale,tile.naturalHeight,dx,shiftY,sw,CH);
      } else {
        const left=(srcW-sx)/sampleScale;
        ctx.drawImage(tile,sx,0,srcW-sx,tile.naturalHeight,dx,shiftY,left,CH);
        ctx.drawImage(tile,0,0,(sw-left)*sampleScale,tile.naturalHeight,dx+left,shiftY,sw-left,CH);
      }
    }
  }
  function tick(time){
    raf=0;
    if(!showing || document.hidden || reduce.matches)return;
    // 30 fps while visible, no background work in hidden tabs.
    if(time-last>=32){ last=time;draw(time); }
    raf=requestAnimationFrame(tick);
  }
  function schedule(){
    if(raf) cancelAnimationFrame(raf);raf=0;
    if(showing&&!document.hidden&&!reduce.matches){if(!started)started=performance.now();raf=requestAnimationFrame(tick);}
    else draw(performance.now(),true);
  }
  const io=new IntersectionObserver(entries=>{showing=entries.some(e=>e.isIntersecting);schedule();},{threshold:.02});
  io.observe(scene);
  const ro=new ResizeObserver(()=>resize());ro.observe(canvas);
  tile.onload=()=>{resize();schedule();};
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduce.addEventListener?.('change',()=>{started=0;schedule();});
  resize();
})();
