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
    'Dermatology':['Concern first','Assessment','Options','Review']
  };
  const profile = profiles[slug] || familyProfiles[family] || familyProfiles.Dermatology;

  /* Keep utility/system pages visually simple. Their main heading already carries
     the meaning, so duplicating it inside the artwork creates clutter. */
  const utilityPage = /^\/concept\/(?:book-appointment|contact|appointment-request-received|blog(?:\/|$)|media(?:\/|$)|about|privacy-policy|medical-disclaimer|terms-and-conditions)(?:\/|$)/.test(path);
  const heroArt = document.querySelector('.editorial-hero .hero-art');
  if (heroArt && utilityPage && !body.classList.contains('concept-admin')) {
    heroArt.classList.remove('v18-authored-media','v18-authored-media--simple');
    heroArt.classList.add('v19-utility-art');
    heroArt.querySelector('.v18-media-composition')?.remove();
    const figcaption = heroArt.querySelector('figcaption');
    if (figcaption && !figcaption.textContent.trim()) figcaption.textContent = 'Aastha Skin Centre · Jammu';
  }

  /* Clinical detail pages get one restrained authored visual, not a duplicate H1. */
  const canUseClinicalPlate = heroArt && !utilityPage && !body.classList.contains('concept-admin') &&
    !/^\/concept\/(?:treatments|conditions|locations)(?:\/)?$/.test(path);
  if (canUseClinicalPlate && !heroArt.classList.contains('v18-authored-media--simple')) {
    heroArt.classList.add('v18-authored-media','v18-authored-media--simple');
    const img = heroArt.querySelector('img');
    if (img) img.setAttribute('aria-hidden','true');
    heroArt.querySelector('.art-label')?.remove();
    heroArt.querySelector('figcaption:not(.art-label)')?.remove();
    heroArt.querySelector('.v18-media-composition')?.remove();
    const media = document.createElement('div');
    media.className = 'v18-media-composition v18-media-composition--simple';
    media.innerHTML = `
      <div class="v18-media-head"><small>${family}</small><strong>Aastha · Jammu</strong></div>
      <div class="v18-media-core"><h3>${profile[0]}</h3><p>${profile[1]} · ${profile[2]}</p></div>`;
    heroArt.appendChild(media);
  }

  /* Do not inject generic four-cell context strips. If a page needs a strip,
     it should be authored in that page's own content. */
  document.querySelectorAll('.v18-context-strip').forEach(el => el.remove());

  /* Normalize public navigation and de-duplicate destinations. */
  document.querySelectorAll('.concept-links').forEach(nav => {
    const seen = new Set();
    [...nav.querySelectorAll('a')].forEach(a => {
      const href = a.getAttribute('href') || '';
      const key = href.replace(/\/+$/, '/');
      if (seen.has(key)) a.remove(); else seen.add(key);
    });
    const add = (href,label) => {
      if ([...nav.querySelectorAll('a')].some(a => (a.getAttribute('href')||'').replace(/\/+$/,'/') === href)) return;
      const a=document.createElement('a');a.href=href;a.textContent=label;nav.appendChild(a);
    };
    add('/concept/blog/','Journal');
    add('/concept/media/','Media');
  });

  /* Enrich command palette with system pages once. */
  const addCommandItems = () => {
    const list = document.querySelector('.v3-command-list');
    if (!list || list.querySelector('[href="/concept/blog/"]')) return;
    [
      ['Journal','Patient guides','/concept/blog/'],
      ['Media','Clinic and academic updates','/concept/media/'],
      ['About Aastha','Clinic approach','/concept/about/'],
      ['Contact','Phones, WhatsApp and directions','/concept/contact/']
    ].forEach(([name,desc,href],idx)=>{
      const a=document.createElement('a');a.className='v3-command-item';a.href=href;
      a.dataset.search=`${name} ${desc}`.toLowerCase();
      a.innerHTML=`<span>${String(80+idx)}</span><strong>${name}</strong><small>${desc}</small><b>↗</b>`;
      list.appendChild(a);
    });
  };
  addCommandItems();
  setTimeout(addCommandItems,100);

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
