(() => {
  // Rebind palette filtering after all migration layers have appended destinations.
  const palette=document.querySelector('.v3-command');
  const input=palette?.querySelector('input[type="search"]');
  const list=palette?.querySelector('.v3-command-list');
  if(input&&list){
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLowerCase();
      [...list.querySelectorAll('.v3-command-item')].forEach((item)=>{
        const haystack=item.dataset.search||item.textContent.toLowerCase();
        item.hidden=Boolean(q&&!haystack.includes(q));
      });
    });
  }

  // Add intentional onward journeys to the latest migrated pages.
  const related={
    '/concept/mnrf-treatment/':[
      ['Acne scars','See how scar type determines the overall sequence','/concept/acne-scar-treatment/'],
      ['Fractional CO₂','Compare another scar-resurfacing pathway','/concept/fractional-co2-laser/'],
      ['Chemical peels','Explore pigment and superficial texture support','/concept/chemical-peels/']
    ],
    '/concept/fractional-co2-laser/':[
      ['Acne scars','Return to scar-type planning','/concept/acne-scar-treatment/'],
      ['MNRF','Compare microneedling radiofrequency','/concept/mnrf-treatment/'],
      ['Pigmentation','Understand post-inflammatory pigment risk','/concept/pigmentation-treatment/']
    ],
    '/concept/chemical-peels/':[
      ['Acne','See where peels fit into acne care','/concept/acne-treatment/'],
      ['Pigmentation','Explore diagnosis-led pigment management','/concept/pigmentation-treatment/'],
      ['Melasma','See long-term melasma maintenance','/concept/melasma-treatment/']
    ],
    '/concept/q-switched-laser-toning/':[
      ['Pigmentation','Start from the pigment diagnosis','/concept/pigmentation-treatment/'],
      ['Melasma','Understand why recurrence changes laser planning','/concept/melasma-treatment/'],
      ['Chemical peels','Compare a non-laser pigment procedure','/concept/chemical-peels/']
    ],
    '/concept/eczema-atopic-dermatitis-treatment/':[
      ['Conditions','Browse other itchy and inflammatory rashes','/concept/conditions/'],
      ['Fungal infection','Compare a common eczema look-alike','/concept/fungal-infection-treatment/'],
      ['Psoriasis','Compare another chronic inflammatory condition','/concept/psoriasis-treatment/']
    ],
    '/concept/psoriasis-treatment/':[
      ['Conditions','Browse skin, scalp and nail concerns','/concept/conditions/'],
      ['Eczema','Compare another inflammatory rash pathway','/concept/eczema-atopic-dermatitis-treatment/'],
      ['Urticaria','Compare transient wheals with persistent plaques','/concept/urticaria-hives-treatment/']
    ],
    '/concept/urticaria-hives-treatment/':[
      ['Conditions','Browse itching, allergy and rash concerns','/concept/conditions/'],
      ['Eczema','Compare chronic itchy patches','/concept/eczema-atopic-dermatitis-treatment/'],
      ['Book','Discuss recurrent hives with the clinic','/book-appointment/']
    ]
  };
  const links=related[location.pathname];
  const footer=document.querySelector('.concept-footer');
  if(links&&footer&&!document.querySelector('.v4-related')){
    const section=document.createElement('section');
    section.className='v4-related';
    section.innerHTML=`<div class="concept-shell"><div class="v4-related-head"><h2>Continue exploring.</h2><span>Related paths</span></div><div class="v4-related-grid">${links.map(([t,d,h],i)=>`<a class="v4-related-card" href="${h}"><small>0${i+1}</small><strong>${t}</strong><span>${d} →</span></a>`).join('')}</div></div>`;
    footer.insertAdjacentElement('beforebegin',section);
  }
})();
