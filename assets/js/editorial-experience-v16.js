(() => {
  const body = document.body;
  if (!body || !body.classList.contains('concept-page')) return;

  /* Remove prototype/design-process language that should never be patient-facing. */
  const copyPatches = new Map([
    ['The original treatment directory is preserved here, but compressed into a filterable editorial interface instead of a long stack of cards.','Filter by care type or search directly for the concern, treatment or procedure you want to understand.'],
    ['The original concern directory, made faster to scan.','Browse concerns by family.'],
    ['The older website repeatedly makes the same clinical point: diagnosis comes before choosing creams, procedures or lasers. The new experience keeps that principle visible without making every page feel repetitive.','When the diagnosis is uncertain, examination comes before choosing creams, procedures or lasers. Similar-looking concerns can need very different treatment.'],
    ['The original site had more medical depth. This version keeps that depth but turns the consultation pathway into a scroll-linked story instead of a dense block of cards.','A consultation moves from understanding the concern to examination, explanation, treatment planning and review when needed.'],
    ['The site can stay visually bold while still giving search engines and patients the detailed pathways your original website had.','Use these pathways to explore concerns, treatments, clinic locations and practical appointment information without losing your place.'],
    ['Drag through the areas patients most often explore. The interaction is playful; the pathways stay clinically clear.','Explore commonly discussed care pathways, then open the detailed guide that matches your concern.']
  ]);
  document.querySelectorAll('p,h2,h3,.section-copy,.detail-intro').forEach(el => {
    const key = el.textContent.trim();
    if (copyPatches.has(key)) el.textContent = copyPatches.get(key);
  });

  /* Complete the treatment directory using premium routes that already exist. */
  const directory = document.querySelector('[data-directory="treatments"]');
  const extras = [
    ['medical','Contact dermatitis','Product, occupational and irritant reactions','/concept/contact-dermatitis-treatment/'],
    ['medical','Paediatric dermatology','Dermatologist-led child skin care','/concept/paediatric-dermatology/'],
    ['medical','Scabies','Night itch and household spread','/concept/scabies-treatment/'],
    ['medical','Molluscum contagiosum','Contagious viral bumps in children and adults','/concept/molluscum-contagiosum-treatment/'],
    ['medical','Lichen planus','Skin, scalp, nail and oral patterns','/concept/lichen-planus-treatment/'],
    ['medical','STI & genital skin','Confidential genital dermatology assessment','/concept/sti-std-treatment/'],
    ['medical','Skin cancer screening','Changing moles and suspicious lesions','/concept/skin-cancer-screening/'],
    ['scars','Chickenpox scars','Indented scars and post-inflammatory marks','/concept/chickenpox-scar-treatment/'],
    ['pigment','Freckles & sun spots','Selected focal pigmentation concerns','/concept/freckles-treatment/'],
    ['pigment','Dark lips','Lip pigmentation assessment','/concept/dark-lips-treatment/'],
    ['pigment','Dark neck / acanthosis','Velvety pigmentation and metabolic clues','/concept/black-neck-acanthosis-nigricans-treatment/'],
    ['pigment','Sun damage / photoageing','Pigment, texture and vascular sun changes','/concept/sun-damage-treatment/'],
    ['hair','White & grey hair removal','Planning where pigment-dependent laser cannot help','/concept/white-hair-removal/'],
    ['aesthetic','HIFU','Selected skin-laxity treatment','/concept/hifu-treatment/'],
    ['aesthetic','RF skin tightening','Surface radiofrequency for selected firmness concerns','/concept/rf-skin-tightening/'],
    ['procedures','Corn treatment','Painful pressure lesions of the foot','/concept/corn-removal-treatment/'],
    ['procedures','Cyst & lipoma assessment','Skin lumps and fatty swellings','/concept/cyst-lipoma-removal/'],
    ['procedures','Skin biopsy','Diagnostic sampling and histopathology planning','/concept/skin-biopsy/'],
    ['procedures','Xanthelasma','Yellow eyelid plaque assessment and removal planning','/concept/xanthelasma-removal/'],
    ['procedures','DPN & seborrheic keratosis','Benign raised pigmentation and growths','/concept/dpn-seborrheic-keratosis-removal/']
  ];
  if (directory) {
    extras.forEach(([category,title,desc,href]) => {
      if (directory.querySelector(`a[href="${href}"]`)) return;
      const a = document.createElement('a');
      a.dataset.category = category;
      a.href = href;
      a.innerHTML = `<strong>${title}</strong><span>${desc}</span>`;
      directory.appendChild(a);
    });

    const shell = directory.closest('.v3-search-shell');
    const panel = shell?.querySelector('.v3-filter-panel');
    if (shell && !shell.querySelector('.v16-directory-tools')) {
      const tools = document.createElement('div');
      tools.className = 'v16-directory-tools';
      tools.innerHTML = '<input class="v16-directory-search" type="search" autocomplete="off" aria-label="Search treatments" placeholder="Search treatments, concerns or procedures…"><span class="v16-directory-count" aria-live="polite"></span>';
      directory.parentNode.insertBefore(tools, directory);
      const empty = document.createElement('div');
      empty.className = 'v16-directory-empty';
      empty.hidden = true;
      empty.textContent = 'No matching treatment found. Try a broader term or browse another care family.';
      directory.appendChild(empty);

      const search = tools.querySelector('input');
      const count = tools.querySelector('.v16-directory-count');
      const filterButtons = [...(panel?.querySelectorAll('[data-filter]') || [])];
      const items = () => [...directory.querySelectorAll(':scope > a[data-category]')];
      let activeCategory = filterButtons.find(b => b.getAttribute('aria-pressed') === 'true')?.dataset.filter || 'all';

      const apply = () => {
        const q = search.value.trim().toLowerCase();
        let visible = 0;
        items().forEach(item => {
          const categoryOk = activeCategory === 'all' || item.dataset.category === activeCategory;
          const textOk = !q || item.textContent.toLowerCase().includes(q);
          item.hidden = !(categoryOk && textOk);
          if (!item.hidden) visible += 1;
        });
        count.textContent = `${visible} ${visible === 1 ? 'result' : 'results'}`;
        empty.hidden = visible !== 0;
      };
      search.addEventListener('input', apply);
      filterButtons.forEach(button => button.addEventListener('click', () => {
        activeCategory = button.dataset.filter || 'all';
        requestAnimationFrame(apply);
      }));
      apply();
    }
  }

  /* Turn previously text-only concern-family cards into useful exits. */
  const concernLinks = new Map([
    ['Itching, allergy & rashes','/concept/skin-allergy-treatment/'],
    ['Fungal & skin infections','/concept/fungal-infection-treatment/'],
    ['Moles, growths & nails','/concept/wart-mole-skin-tag-removal/']
  ]);
  document.querySelectorAll('.v3-reading-card').forEach(card => {
    const heading = card.querySelector('h3')?.textContent.trim();
    const href = concernLinks.get(heading);
    if (href && !card.querySelector('a')) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = 'Explore this family →';
      card.appendChild(a);
    }
  });
})();
