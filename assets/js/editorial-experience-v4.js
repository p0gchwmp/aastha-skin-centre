(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const conceptMap = new Map([
    ['/treatments/','/concept/treatments/'],['/conditions/','/concept/conditions/'],['/treatments/acne-treatment/','/concept/acne-treatment/'],['/treatments/acne-scar-treatment/','/concept/acne-scar-treatment/'],['/treatments/pigmentation-treatment/','/concept/pigmentation-treatment/'],['/treatments/melasma-treatment/','/concept/melasma-treatment/'],['/treatments/hair-fall-treatment/','/concept/hair-fall-treatment/'],['/treatments/hair-transplant/','/concept/hair-transplant/'],['/treatments/laser-hair-reduction/','/concept/laser-hair-reduction/'],['/treatments/fungal-infection-treatment/','/concept/fungal-infection-treatment/'],['/treatments/botulinum-toxin-dermal-fillers/','/concept/botulinum-toxin-dermal-fillers/'],['/locations/karan-nagar/','/concept/locations/karan-nagar/'],['/locations/paloura/','/concept/locations/paloura/']
  ]);
  document.querySelectorAll('a[href^="/"]').forEach((a) => { const target = conceptMap.get(a.getAttribute('href')); if (target) a.setAttribute('href', target); });

  const paletteList = document.querySelector('.v3-command-list');
  const paletteInput = document.querySelector('.v3-command-head input');
  if (paletteList) {
    const extras = [
      ['10','Acne scars','Scar-type planning, MNRF, subcision and resurfacing','/concept/acne-scar-treatment/'],
      ['11','Melasma','Recurring facial pigmentation and maintenance','/concept/melasma-treatment/'],
      ['12','Fungal infection','Ringworm, recurrence and steroid-modified tinea','/concept/fungal-infection-treatment/'],
      ['13','Hair transplant','Diagnosis, donor planning and FUE/FUT overview','/concept/hair-transplant/'],
      ['14','Botulinum toxin & fillers','Facial anatomy-led injectable planning','/concept/botulinum-toxin-dermal-fillers/'],
      ['15','Locations','Compare both Jammu clinics','/concept/locations/'],
      ['16','Karan Nagar clinic','Timings, directions and services','/concept/locations/karan-nagar/'],
      ['17','Paloura clinic','Timings, directions and services','/concept/locations/paloura/']
    ];
    extras.forEach(([n,t,d,h]) => {
      if (paletteList.querySelector(`a[href="${h}"]`)) return;
      const a = document.createElement('a'); a.className='v3-command-item'; a.href=h; a.dataset.search=`${t} ${d}`.toLowerCase();
      a.innerHTML=`<small>${n}</small><div><strong>${t}</strong><small>${d}</small></div><span>↗</span>`; paletteList.appendChild(a);
    });
    if (paletteInput) paletteInput.addEventListener('input', () => {
      const q = paletteInput.value.trim().toLowerCase();
      paletteList.querySelectorAll('.v3-command-item').forEach((item) => item.hidden = !!q && !String(item.dataset.search || item.textContent).toLowerCase().includes(q));
    });
  }

  const path = location.pathname;
  document.querySelectorAll('.concept-links a').forEach((a) => { const href=a.getAttribute('href')||''; if(href.startsWith('/concept/')&&path===href)a.setAttribute('aria-current','page'); });

  document.querySelectorAll('.faq-stack,.v3-accordion').forEach((stack) => stack.addEventListener('toggle',(e)=>{ const opened=e.target; if(!(opened instanceof HTMLDetailsElement)||!opened.open)return; stack.querySelectorAll('details[open]').forEach((d)=>{if(d!==opened)d.open=false;}); },true));

  const relatedByPath = {
    '/concept/acne-treatment/':[['Acne scars','Move from active acne to scar-type planning','/concept/acne-scar-treatment/'],['Pigmentation','Understand post-acne marks and uneven tone','/concept/pigmentation-treatment/'],['Dr. Cheena','See the diagnosis-first consultation approach','/concept/dr-cheena-langer/']],
    '/concept/acne-scar-treatment/':[['Active acne','Control continuing breakouts first','/concept/acne-treatment/'],['Pigmentation','Separate colour changes from texture','/concept/pigmentation-treatment/'],['Treatments','Browse the full treatment library','/concept/treatments/']],
    '/concept/pigmentation-treatment/':[['Melasma','Go deeper into recurring facial pigmentation','/concept/melasma-treatment/'],['Acne','Explore active acne and post-acne marks','/concept/acne-treatment/'],['Laser hair reduction','See another assessment-led laser pathway','/concept/laser-hair-reduction/']],
    '/concept/melasma-treatment/':[['Pigmentation hub','Compare melasma with other pigment patterns','/concept/pigmentation-treatment/'],['Treatments','Browse peels, laser and medical pathways','/concept/treatments/'],['Book','Discuss recurrence and maintenance in consultation','/book-appointment/']],
    '/concept/hair-fall-treatment/':[['Hair transplant','Understand surgical suitability and donor planning','/concept/hair-transplant/'],['Conditions','Browse scalp and hair concerns','/concept/conditions/'],['Dr. Cheena','See the consultation approach','/concept/dr-cheena-langer/']],
    '/concept/hair-transplant/':[['Hair fall','Start with the diagnosis of hair loss','/concept/hair-fall-treatment/'],['Treatments','Browse hair and scalp pathways','/concept/treatments/'],['Book','Request a hair-restoration assessment','/book-appointment/']],
    '/concept/fungal-infection-treatment/':[['Conditions','Browse rashes, infections and itch','/concept/conditions/'],['Treatments','Explore medical dermatology','/concept/treatments/'],['Book','Request assessment for recurrent infection','/book-appointment/']],
    '/concept/botulinum-toxin-dermal-fillers/':[['Treatments','Browse aesthetic and medical pathways','/concept/treatments/'],['Dr. Cheena','Read the profile and care philosophy','/concept/dr-cheena-langer/'],['Book','Request an injectable consultation','/book-appointment/']],
    '/concept/laser-hair-reduction/':[['Hair fall','Explore medical hair and scalp assessment','/concept/hair-fall-treatment/'],['Treatments','Browse the laser treatment library','/concept/treatments/'],['Book','Request laser suitability assessment','/book-appointment/']],
    '/concept/locations/karan-nagar/':[['Paloura','Compare the second Jammu clinic','/concept/locations/paloura/'],['Dr. Cheena','Meet the consultant dermatologist','/concept/dr-cheena-langer/'],['Treatments','Browse care available at Aastha','/concept/treatments/']],
    '/concept/locations/paloura/':[['Karan Nagar','Compare the central Jammu clinic','/concept/locations/karan-nagar/'],['Dr. Cheena','Meet the consultant dermatologist','/concept/dr-cheena-langer/'],['Treatments','Browse care available at Aastha','/concept/treatments/']]
  };
  const related=relatedByPath[path],footer=document.querySelector('.concept-footer');
  if(related&&footer&&!document.querySelector('.v4-related')){const section=document.createElement('section');section.className='v4-related';section.innerHTML=`<div class="concept-shell"><div class="v4-related-head"><h2>Continue exploring.</h2><span>Related paths</span></div><div class="v4-related-grid">${related.map(([t,d,h],i)=>`<a class="v4-related-card" href="${h}"><small>0${i+1}</small><strong>${t}</strong><span>${d} →</span></a>`).join('')}</div></div>`;footer.insertAdjacentElement('beforebegin',section);}

  if(!reduced&&'IntersectionObserver'in window){const headings=[...document.querySelectorAll('.display-heading,.longform h3,.v4-note h3')];const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(!entry.isIntersecting)return;entry.target.animate([{opacity:.72,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:430,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});observer.unobserve(entry.target);}),{threshold:.2});headings.forEach((h)=>observer.observe(h));}
})();
