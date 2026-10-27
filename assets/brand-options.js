(() => {
  function markChoice(){
    document.querySelectorAll('[data-brand-choice]').forEach(a=>{
      const active=a.dataset.brandChoice===document.body.dataset.brand;
      if(active)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('[data-brand-choice]').forEach(a=>a.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();
    const brand=a.dataset.brandChoice;
    const update=()=>{document.body.dataset.brand=brand;const url=new URL(location.href);url.searchParams.set('brand',brand);history.replaceState(null,'',url);markChoice();window.refreshMotion?.();};
    if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const t=document.startViewTransition(update);t.ready.catch(()=>{});t.finished.catch(()=>{});}else update();
  }));
  addEventListener('popstate',()=>{const choice=new URLSearchParams(location.search).get('brand');document.body.dataset.brand=['2','3'].includes(choice)?choice:'1';markChoice();});
  markChoice();
})();
