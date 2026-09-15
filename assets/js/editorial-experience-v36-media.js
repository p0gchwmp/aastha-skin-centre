(() => {
  const SITE='https://www.aasthaskincentre.in';
  const cue=(name)=>`${SITE}/static/images/visual-cues/${name}-512.webp`;
  const prefer=(img,src)=>{
    if(!img||!src||img.dataset.v36Media==='1')return;
    const fallback=img.currentSrc||img.src;
    img.dataset.v36Media='1';
    img.addEventListener('error',()=>{if(fallback&&img.src!==fallback){img.src=fallback;}},{once:true});
    img.src=src;
  };
  const path=location.pathname.replace(/\/+$/,'/')||'/';
  if(path==='/concept/conditions/'){
    prefer(document.querySelector('.editorial-hero .hero-art img'),cue('clinical-skin-care'));
    document.querySelectorAll('.v30-card').forEach(card=>{
      const href=card.getAttribute('href')||'';
      let name='clinical-skin-care';
      if(href.includes('acne'))name='acne-care';
      else if(href.includes('pigmentation'))name='pigmentation-care';
      else if(href.includes('hair'))name='hair-scalp-care';
      else if(href.includes('eczema')||href.includes('dermatitis'))name='allergy-inflammatory-rashes';
      else if(href.includes('laser'))name='complete-care';
      prefer(card.querySelector('img'),cue(name));
    });
  }
  if(path==='/concept/treatments/'){
    prefer(document.querySelector('.editorial-hero .hero-art img'),cue('complete-care'));
    const names={medical:'allergy-inflammatory-rashes',scars:'acne-care',pigment:'pigmentation-care',hair:'hair-scalp-care',aesthetic:'skin-quality-ageing',procedures:'clinical-skin-care'};
    document.querySelectorAll('.v30-treatment-tile').forEach(tile=>prefer(tile.querySelector('img'),cue(names[tile.dataset.v30Filter]||'clinical-skin-care')));
  }
})();