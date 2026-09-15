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
    if (/doctor|cheena/.test(s)) return 'Doctor';
    if (/location|karan|paloura|contact|book/.test(s)) return 'Clinic access';
    if (/blog|journal/.test(s)) return 'Skin journal';
    if (/media/.test(s)) return 'Media';
    return 'Dermatology';
  };

  const family = inferFamily();
  body.dataset.pageFamily = family.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  /* Only explicit page profiles carry clinical micro-copy. Unknown pages stay minimal. */
  const profiles = {
    'acne-treatment': ['Active acne first','Severity and pattern'],
    'acne-scar-treatment': ['Scar type first','Active acne control'],
    'pigmentation-treatment': ['Diagnosis first','Trigger and depth'],
    'melasma-treatment': ['Photoprotection','Long-term control'],
    'hair-fall-treatment': ['Pattern first','Scalp examination'],
    'hair-transplant': ['Donor supply','Future hair loss'],
    'laser-hair-reduction': ['Hair pigment','Skin type'],
    'hifu-treatment': ['Laxity','Anatomy'],
    'rf-skin-tightening': ['Surface RF','Firmness'],
    'botulinum-toxin-dermal-fillers': ['Anatomy','Movement or volume'],
    'laser-tattoo-removal': ['Ink colour','Ink depth'],
    'vitiligo-treatment': ['Activity','Distribution'],
    'fungal-infection-treatment': ['Confirm fungus','Avoid steroid mixes'],
    'seborrheic-dermatitis-dandruff': ['Scalp inflammation','Maintenance'],
    'skin-allergy-treatment': ['Identify the rash','Exposure history'],
    'skin-cancer-screening': ['Change matters','Biopsy when indicated'],
    'paediatric-dermatology': ['Age-specific care','Body site'],
    'book-appointment': ['Choose clinic','Send request'],
    'contact': ['Two Jammu clinics','Call or WhatsApp'],
    'dr-cheena-langer': ['MBBS, MD Dermatology','20+ years in medicine']
  };

  /* Replace generic SVG hero art with a restrained page-specific plate. */
  const heroArt = document.querySelector('.editorial-hero .hero-art');
  if (heroArt && !heroArt.classList.contains('v18-authored-media') && !body.classList.contains('concept-admin')) {
    heroArt.classList.add('v18-authored-media','v18-authored-media--simple');
    heroArt.querySelector('img')?.setAttribute('aria-hidden','true');
    heroArt.querySelector('.art-label')?.remove();
    const profile = profiles[slug];
    const media = document.createElement('div');
    media.className = 'v18-media-composition v18-media-composition--simple';
    media.innerHTML = `
      <div class="v18-media-head"><small>${family}</small><strong>Aastha · Jammu</strong></div>
      <div class="v18-media-core"><h3>${title.replace(/\s*[|—-]\s*Aastha.*$/i,'')}</h3>${profile ? `<p>${profile[0]} · ${profile[1]}</p>` : ''}</div>`;
    heroArt.appendChild(media);
  }

  /* Remove older automatically generated context strips. They added noise. */
  document.querySelectorAll('.v18-context-strip').forEach(el => el.remove());

  /* Normalize public navigation once, then deduplicate by destination. */
  document.querySelectorAll('.concept-links').forEach(nav => {
    [...nav.querySelectorAll('a')].forEach(a => {
      const label = a.textContent.trim().toLowerCase();
      if (label === 'doctor') a.href = '/concept/dr-cheena-langer/';
      if (label === 'journal' || label === 'blog') { a.href = '/concept/blog/'; a.textContent = 'Journal'; }
      if (label === 'media' || label === 'media & updates') { a.href = '/concept/media/'; a.textContent = 'Media'; }
    });

    const wanted = [
      ['Journal','/concept/blog/'],
      ['Media','/concept/media/']
    ];
    wanted.forEach(([label,href]) => {
      if (![...nav.querySelectorAll('a')].some(a => new URL(a.href,location.href).pathname === href)) {
        const a = document.createElement('a'); a.href = href; a.textContent = label; nav.appendChild(a);
      }
    });

    const seen = new Set();
    [...nav.querySelectorAll('a')].forEach(a => {
      const url = new URL(a.href, location.href);
      const key = `${url.pathname}${url.hash}`;
      if (seen.has(key)) a.remove(); else seen.add(key);
    });
  });

  document.querySelectorAll('.nav-cta').forEach(a => { a.href = '/concept/book-appointment/'; });
  document.querySelectorAll('a').forEach(a => {
    const t = a.textContent.trim().toLowerCase();
    if (t === 'book consultation' || t === 'book an appointment' || t === 'request an appointment') a.href = '/concept/book-appointment/';
    if (t.includes('doctor profile')) a.href = '/concept/dr-cheena-langer/';
  });

  /* Clean prototype language that should never reach patients. */
  const replacements = new Map([
    ['The original site had more medical depth. This version keeps that depth but turns the consultation pathway into a scroll-linked story instead of a dense block of cards.','History, examination and treatment options are reviewed in sequence so the plan stays clear.'],
    ['The site can stay visually bold while still giving search engines and patients the detailed pathways your original website had.','Browse conditions, treatments, clinic details and patient guides from one place.'],
    ['One switch instead of two repetitive cards. Timings, address and directions update in place.','Choose a clinic to see timings, address and directions.'],
    ['Drag through the areas patients most often explore. The interaction is playful; the pathways stay clinically clear.','Browse the main areas of care.'],
    ['A clinic, organised like chapters.','Explore care by category.']
  ]);
  document.querySelectorAll('p,h2,h3').forEach(el => {
    const next = replacements.get(el.textContent.trim());
    if (next) el.textContent = next;
  });

  /* Enrich command palette with only high-value system pages. */
  const addCommandItems = () => {
    const list = document.querySelector('.v3-command-list');
    if (!list) return;
    const entries = [
      ['Journal','Patient guides','/concept/blog/'],
      ['Media','Clinic, academic and video updates','/concept/media/'],
      ['Contact','Phones, directions and clinic details','/concept/contact/']
    ];
    entries.forEach(([name,desc,href],idx)=>{
      if (list.querySelector(`[href="${href}"]`)) return;
      const a=document.createElement('a');a.className='v3-command-item';a.href=href;
      a.dataset.search=`${name} ${desc}`.toLowerCase();
      a.innerHTML=`<small>${80+idx}</small><div><strong>${name}</strong><small>${desc}</small></div><span>↗</span>`;
      list.appendChild(a);
    });
  };
  addCommandItems();

  const journalSearch = document.querySelector('[data-v18-journal-search]');
  if (journalSearch) {
    const cards=[...document.querySelectorAll('.v18-journal-card')];
    journalSearch.addEventListener('input',()=>{
      const q=journalSearch.value.trim().toLowerCase();
      cards.forEach(card=>card.hidden=!!q && !card.textContent.toLowerCase().includes(q));
    });
  }
})();
