(() => {
  const body=document.body;if(!body?.classList.contains('concept-page'))return;
  const path=location.pathname.replace(/\/+$/,'/')||'/';
  const photos={
    skin:'https://images.pexels.com/photos/20811446/pexels-photo-20811446.jpeg?auto=compress&cs=tinysrgb&w=1400',
    pigment:'https://images.pexels.com/photos/7479582/pexels-photo-7479582.jpeg?auto=compress&cs=tinysrgb&w=1400',
    hair:'https://images.pexels.com/photos/4780701/pexels-photo-4780701.jpeg?auto=compress&cs=tinysrgb&w=1400',
    medical:'https://images.pexels.com/photos/6642943/pexels-photo-6642943.jpeg?auto=compress&cs=tinysrgb&w=1400',
    laser:'https://images.pexels.com/photos/4586744/pexels-photo-4586744.jpeg?auto=compress&cs=tinysrgb&w=1400',
    clinic:'https://images.pexels.com/photos/7446690/pexels-photo-7446690.jpeg?auto=compress&cs=tinysrgb&w=1400',
    room:'https://images.pexels.com/photos/7016405/pexels-photo-7016405.jpeg?auto=compress&cs=tinysrgb&w=1400'
  };

  const setHero=(src,alt,label)=>{
    const img=document.querySelector('.editorial-hero .hero-art img');
    if(!img)return;
    body.classList.add('v30-image-hubs');
    img.src=src;img.alt=alt;img.loading='eager';img.decoding='async';
    const caption=img.closest('.hero-art')?.querySelector('.art-label');if(caption)caption.textContent=label;
  };

  const card=(item,i)=>`<a class="v30-card" data-tone="${item.tone||''}" href="${item.href}"><img src="${item.image}" alt="${item.alt}" loading="${i<2?'eager':'lazy'}" decoding="async"><div class="v30-card-copy"><div class="v30-card-index"><span>${String(i+1).padStart(2,'0')} / ${item.eyebrow}</span><span>↗</span></div><h3>${item.title}</h3><p>${item.copy}</p><span class="v30-card-route">Open guide <b>→</b></span></div></a>`;

  const buildConditions=()=>{
    if(path!=='/concept/conditions/')return;
    setHero(photos.skin,'Close-up of natural skin texture','Real skin · clear pathways');
    const atlas=document.querySelector('#atlas');if(!atlas||atlas.dataset.v30==='1')return;atlas.dataset.v30='1';body.classList.add('v30-image-atlas');
    const items=[
      {eyebrow:'Acne & scars',title:'Breakouts, marks & scars',copy:'Start here for active acne, post-acne marks, texture and scar concerns.',href:'/concept/acne-treatment/',image:photos.skin,alt:'Close-up of natural facial skin',tone:'skin'},
      {eyebrow:'Pigmentation',title:'Uneven tone & dark patches',copy:'Melasma, post-inflammatory marks, freckles and other colour changes.',href:'/concept/pigmentation-treatment/',image:photos.pigment,alt:'Close-up of naturally freckled skin',tone:'skin'},
      {eyebrow:'Hair & scalp',title:'Shedding, thinning & scalp',copy:'Hair fall, patchy loss, dandruff and scalp inflammation follow different pathways.',href:'/concept/hair-fall-treatment/',image:photos.hair,alt:'Close-up of hair in warm natural light',tone:'hair'},
      {eyebrow:'Medical dermatology',title:'Itching, rashes & inflammation',copy:'Eczema, allergy, psoriasis, fungal infection and recurring rashes need diagnosis first.',href:'/concept/eczema-atopic-dermatitis-treatment/',image:photos.medical,alt:'Close-up of natural human skin texture',tone:'skin'},
      {eyebrow:'Laser dermatology',title:'Hair, pigment & resurfacing',copy:'Explore laser pathways only after the treatment target and indication are clear.',href:'/concept/laser-hair-reduction/',image:photos.laser,alt:'Professional facial treatment in a clinic',tone:'laser'},
      {eyebrow:'Procedures',title:'Growths, nails & minor procedures',copy:'Warts, moles, skin tags, cysts, nail concerns and selected minor procedures.',href:'/concept/wart-mole-skin-tag-removal/',image:photos.clinic,alt:'Dermatology treatment in a modern clinic',tone:'clinic'}
    ];
    atlas.innerHTML=`<div class="concept-shell"><div class="v30-gallery-head"><small>01 / Explore by concern</small><div><h2>Start with what feels closest.</h2><p>You do not need to identify the diagnosis yourself. Choose the concern family that looks most relevant, then refine from there.</p></div></div><div class="v30-concern-grid">${items.map(card).join('')}</div><div class="v30-gallery-foot"><span>Photography is illustrative. Your diagnosis and treatment plan still require clinical assessment.</span><a href="/concept/book-appointment/">Not sure? Book assessment →</a></div></div>`;

    const familySection=[...document.querySelectorAll('.editorial-section')].find(s=>s.textContent.includes('Browse by family'));
    if(familySection)familySection.id='browse-family';
    const map={
      'Itching, allergy & rashes':'/concept/eczema-atopic-dermatitis-treatment/',
      'Fungal & skin infections':'/concept/fungal-infection-treatment/',
      'Moles, growths & nails':'/concept/wart-mole-skin-tag-removal/'
    };
    document.querySelectorAll('.v3-reading-card').forEach(el=>{
      if(el.querySelector('a'))return;const href=map[el.querySelector('h3')?.textContent.trim()];if(!href)return;
      el.tabIndex=0;el.setAttribute('role','link');el.style.cursor='pointer';
      const go=()=>location.href=href;el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
    });
  };

  const buildTreatments=()=>{
    if(path!=='/concept/treatments/')return;
    setHero(photos.clinic,'Dermatology treatment in a modern clinic','Treatment planning · dermatologist led');
    if(document.querySelector('.v30-treatment-gallery'))return;
    const directory=document.querySelector('#directory');if(!directory)return;
    const items=[
      ['medical','Medical dermatology',photos.medical],['scars','Scars & resurfacing',photos.skin],['pigment','Pigmentation & laser',photos.pigment],['hair','Hair & scalp',photos.hair],['aesthetic','Aesthetic dermatology',photos.clinic],['procedures','Minor procedures',photos.room]
    ];
    const section=document.createElement('section');section.className='v30-gallery-section v30-treatment-gallery';
    section.innerHTML=`<div class="concept-shell"><div class="v30-gallery-head"><small>01 / Treatment families</small><div><h2>Choose the kind of care.</h2><p>Use the visual families to narrow the directory. The treatment page should explain fit, limits and next steps—not sell a procedure before diagnosis.</p></div></div><div class="v30-treatment-strip">${items.map(([key,label,img],i)=>`<button class="v30-treatment-tile" type="button" data-v30-filter="${key}" aria-pressed="false"><img src="${img}" alt="" loading="${i<3?'eager':'lazy'}" decoding="async"><small>${String(i+1).padStart(2,'0')}</small><span>${label}</span></button>`).join('')}</div><div class="v30-gallery-foot"><span>Pick a family to filter the treatment directory below.</span><a href="/concept/conditions/">Not sure which treatment? Start with a concern →</a></div></div>`;
    directory.insertAdjacentElement('beforebegin',section);
    section.querySelectorAll('[data-v30-filter]').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.v30Filter;const filter=document.querySelector(`.v3-filter-buttons button[data-filter="${key}"]`);filter?.click();
      section.querySelectorAll('[data-v30-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
      directory.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
    }));
  };

  buildConditions();
  buildTreatments();
})();
