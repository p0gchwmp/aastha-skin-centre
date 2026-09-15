(() => {
  const body=document.body;if(!body?.classList.contains('concept-page'))return;
  const path=location.pathname.replace(/\/+$/,'/')||'/';
  if(path!=='/concept/'&&path!=='/')return;

  const finder=document.querySelector('#finder [data-route-finder]');
  if(finder){
    finder.removeAttribute('data-reveal');
    finder.classList.add('is-visible','v34-route-ready');
    finder.style.removeProperty('opacity');
    finder.style.removeProperty('transform');
    finder.style.removeProperty('visibility');
  }

  const section=document.getElementById('finder');
  if(section){
    section.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('is-visible'));
  }

  /* Give the section dock a semantic current state when navigating this page. */
  const ids=['concerns','finder','treatments','approach','doctor','directory','clinics','faq'];
  const links=[...document.querySelectorAll('.v3-side-index a[href^="#"]')];
  if('IntersectionObserver' in window&&links.length){
    const io=new IntersectionObserver(entries=>{
      const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!active)return;
      links.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')===`#${active.target.id}`));
    },{rootMargin:'-28% 0px -58% 0px',threshold:[.01,.2,.5]});
    ids.map(id=>document.getElementById(id)).filter(Boolean).forEach(el=>io.observe(el));
  }
})();
