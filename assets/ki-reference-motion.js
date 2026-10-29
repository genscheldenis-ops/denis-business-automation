
/* Reference-accurate horizontally travelling wave motion. No libraries, no tracking. */
(() => {
  const scene=document.querySelector('.scroll-story .reference-art');
  const canvas=scene?.querySelector('.reference-wave-motion');
  const source=scene?.querySelector('.reference-image');
  if(!scene||!canvas||!source) return;
  const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
  if(!ctx) return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let active=true,frame=0,visible=false,started=0;
  const observer=new IntersectionObserver((list)=>{visible=list[0]?.isIntersecting??false;if(visible) schedule();},{threshold:0.02});
  observer.observe(scene);
  function schedule(){if(!frame && visible && !document.hidden && !reduced.matches && active)frame=requestAnimationFrame(render);}
  function render(time){
    frame=0;
    if(!visible||document.hidden||reduced.matches||!source.complete||!source.naturalWidth) {schedule();return;}
    if(!started)started=time;
    const t=(time-started)/1000;
    ctx.clearRect(0,727,1536,168);
    // The phase x/155 - t*0.75 travels strictly to the RIGHT; y range stays fixed.
    // Each strip samples the original wave photons with a moving sine profile.
    for(let x=0;x<1536;x+=5){
       const phase=x/155 - t*0.78;
       const sx=Math.min(1531,Math.max(0,x+Math.sin(phase)*8));
       const sy=727+Math.sin(phase)*4;
       ctx.drawImage(source,sx,sy,5,168,x,727,5,168);
    }
    schedule();
  }
  source.addEventListener('load',schedule);
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener?.('change',()=>{if(reduced.matches){ctx.clearRect(0,0,1536,1024);}else{started=0;schedule();}});
  schedule();
})();
