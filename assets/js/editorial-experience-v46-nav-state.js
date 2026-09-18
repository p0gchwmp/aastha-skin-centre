(() => {
  const nav=document.querySelector('.concept-links');
  if(!nav||!('IntersectionObserver' in window)) return;

  const links=[...nav.querySelectorAll('a[href^="#"]')];
  const pairs=links.map((link)=>{
    const id=decodeURIComponent(link.getAttribute('href').slice(1));
    return {link,section:document.getElementById(id)};
  }).filter((item)=>item.section);

  if(!pairs.length) return;

  const ratios=new Map();
  const setCurrent=(section)=>{
    pairs.forEach(({link,section:target})=>{
      if(target===section) link.setAttribute('aria-current','location');
      else if(link.getAttribute('aria-current')==='location') link.removeAttribute('aria-current');
    });
  };

  const observer=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>ratios.set(entry.target,entry.intersectionRatio));
    let best=null;
    let score=-1;
    pairs.forEach(({section})=>{
      const ratio=ratios.get(section)||0;
      if(ratio>score){
        best=section;
        score=ratio;
      }
    });
    if(best&&score>0) setCurrent(best);
  },{
    rootMargin:'-22% 0px -58% 0px',
    threshold:[0,.05,.15,.3,.55],
  });

  pairs.forEach(({section})=>observer.observe(section));

  links.forEach((link)=>link.addEventListener('click',()=>{
    const id=decodeURIComponent(link.getAttribute('href').slice(1));
    const section=document.getElementById(id);
    if(section) setCurrent(section);
  }));
})();