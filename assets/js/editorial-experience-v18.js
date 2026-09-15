(() => {
  const body = document.body;
  if (!body || !body.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/, '/') || '/';
  body.classList.add('v18-unified');

  const slug = path.split('/').filter(Boolean).pop() || 'home';
  const title = document.querySelector('h1')?.textContent.trim() || document.title.split('—')[0].trim();

  const inferFamily = () => {
    const s = `${slug} ${title}`.toLowerCase();
    if (/acne|scar|mnrf|co2|peel/.test(s)) return 'Acne & scars';
    if (/pigment|melasma|freck|dark|vitiligo|q-switched|sun damage|xanthelasma/.test(s)) return 'Pigmentation';
    if (/hair|alopecia|dandruff|scalp|transplant|prp|gfc/.test(s)) return 'Hair & scalp';
    if (/laser|ipl|tattoo/.test(s)) return 'Laser dermatology';
    if (/hifu|rf|filler|botulinum|hydrafacial|medifacial|cryo/.test(s)) return 'Aesthetic dermatology';
    if (/wart|mole|skin tag|biopsy|abscess|corn|cyst|lipoma|nail|dpn|keratosis/.test(s)) return 'Minor procedures';
    if (/eczema|psoriasis|urticaria|fungal|scabies|allergy|dermatitis|rosacea|lichen|molluscum|paediatric|sti|cancer/.test(s)) return 'Medical dermatology';
    if (/doctor|cheena/.test(s)) return 'Doctor profile';
    if (/location|karan|paloura|contact|book/.test(s)) return 'Clinic access';
    if (/blog|journal/.test(s)) return 'Skin journal';
    if (/media/.test(s)) return 'Media & updates';
    return 'Dermatology';
  };

  const family = inferFamily();
  body.dataset.pageFamily = family.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const profiles = {
    'acne-treatment': ['Active acne first','Severity + pattern','Marks ≠ scars','Maintenance matters'],
    'acne-scar-treatment': ['Scar type first','Active acne control','Skin tone matters','Combination planning'],
    'pigmentation-treatment': ['Diagnosis first','Depth + trigger','Photoprotection','Maintenance'],
    'melasma-treatment': ['Relapsing condition','Light + heat triggers','Layered treatment','Maintenance'],
    'hair-fall-treatment': ['Pattern first','Scalp health','Medical causes','Track progression'],
    'hair-transplant': ['Donor supply','Diagnosis first','Future loss','Realistic density'],
    'laser-hair-reduction': ['Dark hair responds','Skin type matters','Multiple sessions','Maintenance possible'],
    'hifu-treatment': ['Laxity ≠ volume loss','Depth selection','Gradual response','Suitability first'],
    'rf-skin-tightening': ['Surface RF','Not MNRF','Firmness goal','Course based'],
    'botulinum-toxin-dermal-fillers': ['Anatomy first','Movement vs volume','Natural expression','No preset map'],
    'laser-tattoo-removal': ['Colour matters','Ink depth matters','Multiple sessions','Scar risk assessed'],
    'vitiligo-treatment': ['Activity matters','Site matters','Look-alikes exist','Long-term review'],
    'fungal-infection-treatment': ['Confirm fungus','Avoid steroid mixes','Treat enough','Household sources'],
    'seborrheic-dermatitis-dandruff': ['Scalp inflammation','Relapsing pattern','Trigger control','Maintenance'],
    'skin-allergy-treatment': ['Name the rash','Exposure history','Patch testing sometimes','Avoid trigger'],
    'skin-cancer-screening': ['Change matters','ABCDE clues','Non-healing lesions','Biopsy if needed'],
    'sti-std-treatment': ['Confidential care','Symptoms can overlap','Testing by context','Time-sensitive care'],
    'paediatric-dermatology': ['Age-specific care','Body site matters','Gentle barrier care','Dose + duration matter'],
    'cryolipolysis-body-contouring': ['Contour ≠ weight loss','Localised fat','Skin laxity matters','Expectation setting'],
    'book-appointment': ['Choose clinic','Choose concern','Send request','Clinic confirms'],
    'contact': ['Call','WhatsApp','Directions','Two Jammu clinics'],
    'dr-cheena-langer': ['MBBS, MD Dermatology','20+ years in medicine','Medical + procedural care','Jammu'],
  };
  const familyProfiles = {
    'Acne & scars':['Diagnosis first','Pattern + severity','Skin type','Follow-up'],
    'Pigmentation':['Diagnosis first','Trigger + depth','Sun protection','Maintenance'],
    'Hair & scalp':['Pattern first','Scalp exam','Medical context','Progress review'],
    'Laser dermatology':['Right indication','Skin type','Settings matter','Aftercare'],
    'Aesthetic dermatology':['Anatomy first','Suitability','Natural goals','Review'],
    'Minor procedures':['Identify lesion','Site + symptoms','Procedure choice','Aftercare'],
    'Medical dermatology':['History','Examination','Diagnosis','Review'],
    'Doctor profile':['Qualifications','Clinical work','Academic activity','Jammu'],
    'Clinic access':['Karan Nagar','Paloura','WhatsApp','Call'],
    'Skin journal':['Dermatologist-reviewed','Patient education','Related care','Jammu'],
    'Media & updates':['Academic activity','Videos','Clinic stories','Press'],
    'Dermatology':['Concern first','Assessment','Options','Review']
  };
  const profile = profiles[slug] || familyProfiles[family] || familyProfiles.Dermatology;

  /* Replace generic hero placeholders with a page-authored clinical composition. */
  const heroArt = document.querySelector('.editorial-hero .hero-art');
  if (heroArt && !heroArt.classList.contains('v18-authored-media') && !body.classList.contains('concept-admin')) {
    heroArt.classList.add('v18-authored-media');
    const img = heroArt.querySelector('img');
    if (img) img.setAttribute('aria-hidden','true');
    heroArt.querySelector('.art-label')?.remove();
    const media = document.createElement('div');
    media.className = 'v18-media-composition';
    media.innerHTML = `
      <div class="v18-media-head"><small>${family}</small><strong>Aastha · Jammu</strong></div>
      <div class="v18-media-core"><span class="v18-media-index">${String((slug.length % 8) + 1).padStart(2,'0')}</span><h3>${title.replace(/\s*[|—-]\s*Aastha.*$/i,'')}</h3><p>${profile[0]} · ${profile[1]}</p><div class="v18-media-tags"><span>${profile[0]}</span><span>${profile[1]}</span><span>${profile[2]}</span></div></div>
      <div class="v18-media-foot"><div><small>Focus</small><strong>${profile[0]}</strong></div><div><small>Planning</small><strong>${profile[1]}</strong></div><div><small>Follow-through</small><strong>${profile[3]}</strong></div></div>`;
    heroArt.appendChild(media);
  }

  /* Page-specific strip on detail pages that do not already have a compact facts band. */
  const isDetail = path.startsWith('/concept/') && !/\/(blog|media|admin|treatments|conditions|locations|book-appointment|contact)\/?$/.test(path) && slug !== 'home';
  const hero = document.querySelector('.editorial-hero');
  if (isDetail && hero && !hero.nextElementSibling?.classList.contains('stats-band') && !hero.nextElementSibling?.classList.contains('v18-context-strip')) {
    const strip = document.createElement('section');
    strip.className = 'v18-context-strip';
    strip.setAttribute('aria-label','Page context');
    strip.innerHTML = `<div class="concept-shell v18-context-grid">${profile.map((item,i)=>`<div><small>${['Start with','Look at','Plan around','Keep in mind'][i]}</small><strong>${item}</strong></div>`).join('')}</div>`;
    hero.insertAdjacentElement('afterend', strip);
  }

  /* Make Blog and Media first-class public destinations without crowding admin into public nav. */
  document.querySelectorAll('.concept-links').forEach(nav => {
    const hrefs = [...nav.querySelectorAll('a')].map(a=>a.getAttribute('href'));
    if (!hrefs.includes('/concept/blog/')) {
      const a=document.createElement('a');a.href='/concept/blog/';a.textContent='Journal';nav.appendChild(a);
    }
    if (!hrefs.includes('/concept/media/')) {
      const a=document.createElement('a');a.href='/concept/media/';a.textContent='Media';nav.appendChild(a);
    }
  });

  /* Enrich command palette with system pages. */
  const addCommandItems = () => {
    const list = document.querySelector('.v3-command-list');
    if (!list || list.querySelector('[href="/concept/blog/"]')) return;
    [
      ['Journal','Patient guides and dermatologist-reviewed articles','/concept/blog/'],
      ['Media & updates','Academic activity, video library and clinic stories','/concept/media/'],
      ['About Aastha','Clinic approach and care model','/concept/about/'],
      ['Contact','Phones, WhatsApp, directions and clinic details','/concept/contact/']
    ].forEach(([name,desc,href],idx)=>{
      const a=document.createElement('a');a.className='v3-command-item';a.href=href;
      a.innerHTML=`<span>${String(80+idx)}</span><strong>${name}</strong><small>${desc}</small><b>↗</b>`;
      list.appendChild(a);
    });
  };
  addCommandItems();
  setTimeout(addCommandItems,250);

  /* Journal search. */
  const journalSearch = document.querySelector('[data-v18-journal-search]');
  if (journalSearch) {
    const cards=[...document.querySelectorAll('.v18-journal-card')];
    journalSearch.addEventListener('input',()=>{
      const q=journalSearch.value.trim().toLowerCase();
      cards.forEach(card=>card.hidden=!!q && !card.textContent.toLowerCase().includes(q));
    });
  }
})();
