(() => {
  const story=document.querySelector('.scroll-story');
  const scene=story?.querySelector('.ki-workflow-scene');
  const image=scene?.querySelector('.ki-workflow-image');
  if(!image)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  let queued=0;
  function render(){
    queued=0;
    if(!image.naturalWidth)return;
    if(reduced.matches){scene.style.maskImage='none';scene.style.webkitMaskImage='none';return;}
    const p=Number(story.style.getPropertyValue('--story-progress'))||0;
    const sr=scene.getBoundingClientRect(),ir=image.getBoundingClientRect(),cs=getComputedStyle(image);
    const w=sr.width,h=sr.height;
    const mobile=image.naturalWidth===1086;
    const iw=mobile?1086:1983,ih=mobile?1448:793;
    const scale=(cs.objectFit==='contain'?Math.min:Math.max)(ir.width/iw,ir.height/ih);
    const pos=cs.objectPosition.split(' ').map(v=>parseFloat(v)/100);
    const ox=ir.left-sr.left+(ir.width-iw*scale)*(pos[0]??.5);
    const oy=ir.top-sr.top+(ir.height-ih*scale)*(pos[1]??.5);
    const progress=clamp((p-.06)/(mobile?.48:.84)),feather=Math.min(w*.13,160);
    const edge=-feather+progress*(w+2*feather);
    const nodes=mobile?
      [[440,385,195,204],[772,396,164,203],[644,632,167,211],[318,630,190,214],[258,887,240,203],[614,887,268,203]]:
      [[584,334,108,136],[714,334,112,136],[841,334,113,136],[969,334,117,136],[1109,259,139,130],[1109,419,139,130]];
    const start=mobile?[.34,.44,.54,.64,.74,.84]:nodes.map((r,i)=>{
      const x=ox+(r[0]+r[2]*.48)*scale;
      return .06+.84*(x+feather)/(w+2*feather)+(i===5?.08:0);
    });
    let covers='';
    const alphas=[];
    nodes.forEach((r,i)=>{
      const a=ease((p-start[i])/.09);alphas.push(a.toFixed(3));
      if(a>=1)return;
      covers+=`<rect x="${ox+r[0]*scale}" y="${oy+r[1]*scale}" width="${r[2]*scale}" height="${r[3]*scale}" rx="${Math.min(r[2],r[3])*.48*scale}" fill="black" opacity="${1-a}" filter="url(#soft)"/>`;
    });
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="wipe" gradientUnits="userSpaceOnUse" x1="${edge-feather}" x2="${edge+feather}"><stop stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><filter id="soft" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="${7*scale}"/></filter><mask id="m" maskUnits="userSpaceOnUse"><rect width="${w}" height="${h}" fill="url(#wipe)"/>${covers}</mask></defs><rect width="${w}" height="${h}" fill="white" mask="url(#m)"/></svg>`;
    const mask=`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    scene.style.maskImage=mask;scene.style.webkitMaskImage=mask;
    scene.dataset.revealProgress=p.toFixed(3);scene.dataset.nodeReveal=alphas.join(',');
  }
  function schedule(){if(!queued)queued=requestAnimationFrame(render);}
  render();story.classList.add('ki-scroll-reveal');
  new MutationObserver(schedule).observe(story,{attributes:true,attributeFilter:['style']});
  new ResizeObserver(schedule).observe(scene);
  image.addEventListener('load',schedule);window.addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',schedule);schedule();
})();
