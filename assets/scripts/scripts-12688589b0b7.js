(() => {
  let controller=null,root=null,stage=null,frame=0,current=0,lastRendered=-1,generation=0,resizeObserver=null,loadPromise;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  // Short touch swipes must remain at their new position rather than snapping back.
  const freeScroll=matchMedia('(any-pointer: coarse), (max-width: 900px)');
  const clamp=n=>Math.min(1,Math.max(0,n));
  const chapters=[0,.215,.43,.65,1];
  function syncSnapPoints(){
    const enabled=!!controller&&!!root&&!reduce.matches&&!freeScroll.matches&&!root.classList.contains('is-static');
    if(!root||!stage){document.documentElement.classList.remove('has-cinema-snap');return;}
    const distance=Math.max(0,root.offsetHeight-stage.offsetHeight);
    let points=[...root.querySelectorAll('.cinema-snap-point')];
    if(!points.length){points=chapters.map(()=>{const point=document.createElement('div');point.className='cinema-snap-point';point.hidden=true;point.setAttribute('aria-hidden','true');root.append(point);return point})}
    points.forEach((point,i)=>{point.style.top=(chapters[i]*distance)+'px';point.hidden=!enabled});
    document.documentElement.classList.toggle('has-cinema-snap',enabled);
  }
  function loadScene(){
    if(window.UPCourt)return Promise.resolve(window.UPCourt);
    if(!loadPromise)loadPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='court-scene.js?v=club-panorama';s.onload=()=>window.UPCourt?resolve(window.UPCourt):reject(Error('Scene unavailable'));s.onerror=()=>{loadPromise=null;reject(Error('Scene unavailable'))};document.head.appendChild(s)});
    return loadPromise;
  }
  function dispose(){document.documentElement.classList.remove('has-cinema-snap');generation++;cancelAnimationFrame(frame);frame=0;resizeObserver?.disconnect();resizeObserver=null;controller?.dispose();controller=null;root=null;stage=null;lastRendered=-1;}
  function target(){if(!root||!stage)return 0;if(reduce.matches)return 1;const header=document.querySelector('.site-header').offsetHeight;return clamp((header-root.getBoundingClientRect().top)/Math.max(1,root.offsetHeight-stage.offsetHeight))}
  function placeSupport(){
    if(!stage||!controller)return;
    const scene=controller.info(),panels=[...stage.querySelectorAll('.cinema-support')];
    const space=scene.height-scene.court.bottom,short=scene.height<420&&scene.width/scene.height>1.3;
    // All four feature rows share the same anchor, regardless of their wording.
    const rowHeight=Math.max(...panels.map(panel=>panel.offsetHeight));
    const room=Math.max(0,space-rowHeight);
    const top=Math.max(scene.court.bottom+10,Math.min(scene.height*.80-rowHeight/2,scene.height-12-rowHeight));
    const rise=Math.min(short?4:scene.width<=600?8:24,room*.25);
    panels.forEach(panel=>{
      panel.style.top=top+'px';
      panel.style.setProperty('--support-rise',rise+'px');
    });
  }

  function paintCopy(p){
    if(!stage)return;
    const keys=chapters;
    const active=keys.reduce((a,k,i)=>Math.abs(k-p)<Math.abs(keys[a]-p)?i:a,0);
    const travel=reduce.matches?0:Math.min(stage.clientHeight*.12,stage.classList.contains('is-stacked')?64:96);
    stage.querySelectorAll('[data-shot]').forEach((el,i)=>{
      const distance=Math.abs(p-keys[i]);
      const halfGap=p<keys[i]?(keys[i]-keys[Math.max(0,i-1)])/2:(keys[Math.min(keys.length-1,i+1)]-keys[i])/2;
      const phase=clamp(distance/(halfGap||1));
      const fade=clamp((phase-.45)/.55),opacity=i===active?1-fade*fade*(3-2*fade):0;
      const offset=i===4?0:(p<keys[i]?1:-1)*travel*(.3*phase+.7*phase*phase);
      el.firstElementChild.style.transform=`translate3d(0,${offset}px,0)`;
      el.style.opacity=opacity;el.style.visibility=opacity>.005?'visible':'hidden';
      const interactive=opacity>.9&&Math.abs(offset)<12;
      el.inert=!interactive;el.style.pointerEvents=interactive?'auto':'none';el.setAttribute('aria-hidden',opacity<.5?'true':'false');
      el.querySelectorAll('a,button').forEach(control=>{control.tabIndex=interactive?0:-1});
      const panel=stage.querySelector(`[data-support="${i}"]`);
      if(panel){
        const endFade=clamp((p-.76)/.04),panelOpacity=opacity*(1-endFade*endFade*(3-2*endFade));
        const rise=Number.parseFloat(panel.style.getPropertyValue('--support-rise'))||0;
        panel.style.opacity=panelOpacity;panel.style.visibility=panelOpacity>.005?'visible':'hidden';
        panel.setAttribute('aria-hidden',panelOpacity<.5?'true':'false');
        panel.style.setProperty('--support-offset',((p<keys[i]?1:-1)*rise*(.3*phase+.7*phase*phase))+'px');
      }
    });
    stage.dataset.shot=String(active);
  }
  function tick(){
    frame=0;if(!root||!controller||document.hidden)return;
    if(root.classList.contains('is-static')!==reduce.matches){root.classList.toggle('is-static',reduce.matches);syncSnapPoints();lastRendered=-1;}
    const to=target(),delta=to-current;
    current=reduce.matches||Math.abs(delta)<.0003?to:current+delta*.19;
    if(Math.abs(to-current)<.0003)current=to;
    if(current!==lastRendered){controller.setProgress(current);paintCopy(current);lastRendered=current;}
    if(Math.abs(to-current)>.0003)frame=requestAnimationFrame(tick);
  }
  function request(){if(!frame&&controller&&!document.hidden)frame=requestAnimationFrame(tick)}
  async function mount(){
    const next=document.querySelector('.cinematic-home');if(next===root)return;
    dispose();if(!next)return;root=next;stage=root.querySelector('.cinema-stage');current=0;
    // Animate an inner layer so layout measurements never include the scroll offset.
    stage.querySelectorAll('.cinema-copy').forEach(el=>{const content=document.createElement('div');content.className='cinema-copy-content';content.append(...el.childNodes);el.append(content)});
    const token=generation,localRoot=root,localStage=stage;
    try{
      const api=await loadScene();if(token!==generation)return;
      const candidate=await api.create(stage.querySelector('canvas'),{logoUrl:window.__UP_LOGO_URL__||'assets/official-up-mark-grey.png',textureUrl:window.__UP_TEXTURE_URL__||'assets/ink-paper.webp'});
      if(token!==generation){candidate.dispose();return}controller=candidate;
      const resize=()=>{
        if(!controller||!stage)return;
        const header=document.querySelector('.site-header').offsetHeight;
        document.documentElement.style.setProperty('--header-height',header+'px');
        const width=stage.clientWidth,height=stage.clientHeight;
        const stacked=innerWidth<=600||innerWidth/innerHeight<1;
        const short=height<420&&width/height>1.3;
        stage.classList.toggle('is-stacked',stacked);
        stage.classList.toggle('is-short',short);
        stage.querySelectorAll('.cinema-support').forEach(el=>el.classList.toggle('is-short',short));
        const copy=[...stage.querySelectorAll('.cinema-copy:not(.cinema-copy-final)')];
        const copyHeight=Math.max(...copy.map(el=>el.offsetHeight));
        const copyTop=Math.max(12,Math.min(72,height*.20-copyHeight/2));
        stage.style.setProperty('--rally-copy-top',copyTop+'px');
        const stageBox=stage.getBoundingClientRect();
        const artBox=stage.querySelector('.cinema-final-art-slot').getBoundingClientRect();
        controller.resize(width,height,{copyBottom:copyTop+copyHeight,stacked,finalArt:{left:artBox.left-stageBox.left,top:artBox.top-stageBox.top,width:artBox.width,height:artBox.height}});
        placeSupport();syncSnapPoints();paintCopy(current);request();
      };
      resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resizeObserver.observe(document.querySelector('.site-header'));stage.querySelectorAll('.cinema-copy,.cinema-final-art-slot,.cinema-support').forEach(el=>resizeObserver.observe(el));document.fonts.ready.then(()=>{if(token===generation)resize()});resize();current=target();controller.setProgress(current);paintCopy(current);stage.classList.add('is-ready');root.classList.toggle('is-static',reduce.matches);syncSnapPoints();
    }catch(error){if(token!==generation)return;localRoot.classList.add('is-static');localStage.classList.add('is-fallback');syncSnapPoints();paintCopy(0);console.info('Court still image displayed.');}
  }
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else request()});
  freeScroll.addEventListener('change',()=>{syncSnapPoints();request()});
  reduce.addEventListener('change',()=>{root?.classList.toggle('is-static',reduce.matches||!controller);current=reduce.matches?1:0;lastRendered=-1;syncSnapPoints();request()});
  window.refreshHomeCinema=mount;
  window.UPCinema={info:()=>({progress:current,shot:stage?.dataset.shot,ready:!!controller,scene:controller?.info?.()}),refresh:mount};
  mount();
})();
