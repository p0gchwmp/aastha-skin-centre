(() => {
  if (!document.body?.classList.contains('concept-page')) return;
  const path = location.pathname.replace(/\/+$/,'/') || '/';
  if (path !== '/concept/conditions/') return;
  const root = document.querySelector('.v23-atlas');
  if (!root) return;

  const data = {
    scalp:{label:'Scalp',title:'Scalp & hair',copy:'Hair fall, thinning, smooth patches, dandruff and scalp inflammation follow different pathways. Start with what you are actually noticing.',links:[['Hair fall','/concept/hair-fall-treatment/'],['Alopecia areata','/concept/alopecia-areata-treatment/'],['Dandruff','/concept/seborrheic-dermatitis-dandruff/']]},
    forehead:{label:'Forehead',title:'Forehead breakouts & pigment',copy:'Breakouts, post-acne marks and pigment change can overlap here. The next step depends on the dominant concern, not the area alone.',links:[['Acne','/concept/acne-treatment/'],['Pigmentation','/concept/pigmentation-treatment/'],['Melasma','/concept/melasma-treatment/']]},
    cheeks:{label:'Cheeks',title:'Cheeks & mid-face',copy:'Acne, marks, scars, melasma and redness can all involve the cheeks. The pattern matters more than choosing a treatment name first.',links:[['Acne','/concept/acne-treatment/'],['Acne scars','/concept/acne-scar-treatment/'],['Rosacea','/concept/rosacea-treatment/']]},
    undereye:{label:'Under-eye',title:'Under-eye changes',copy:'Dark circles, pigment and texture around the eyes need assessment before peels, lasers or other procedures are considered.',links:[['Dark circles','/concept/dark-circles-under-eye-treatment/'],['Pigmentation','/concept/pigmentation-treatment/']]},
    lips:{label:'Lips',title:'Lip pigmentation',copy:'Lip darkening can have several causes, including irritation, habits, sun exposure and medical context.',links:[['Dark lips','/concept/dark-lips-treatment/'],['Pigmentation','/concept/pigmentation-treatment/']]},
    jaw:{label:'Jaw / chin',title:'Jawline & chin',copy:'Persistent or recurrent breakouts around the lower face can follow a different pattern from occasional acne elsewhere.',links:[['Acne','/concept/acne-treatment/'],['Acne scars','/concept/acne-scar-treatment/']]}
  };

  root.className = 'v29-atlas';
  root.innerHTML = `
    <div class="v29-map">
      <div class="v29-map-head"><small>Concern map</small><span>Tap a marker<br>to explore</span></div>
      <svg class="v29-map-svg" viewBox="0 0 520 590" role="img" aria-label="Minimal face and scalp concern map">
        <path class="v29-head-outline" d="M260 62C174 62 126 124 126 219c0 72 24 112 55 145 20 21 27 51 32 88 6 47 23 76 47 83 24-7 41-36 47-83 5-37 12-67 32-88 31-33 55-73 55-145C394 124 346 62 260 62Z"/>
        <path class="v29-contour" d="M165 167c54-42 136-50 199-9M172 226c50-26 129-30 177-2M180 315c53 22 111 23 160 2M205 405c35 22 75 23 110 0"/>
        <path class="v29-contour" d="M212 469c31 16 65 17 96 0M260 62v468" opacity=".5"/>
        <line class="v29-axis" x1="86" y1="295" x2="434" y2="295"/>

        <g class="v29-hotspot" data-v29-region="scalp" tabindex="0" role="button" aria-label="Scalp and hair">
          <circle class="v29-hit" cx="260" cy="116" r="34"/><circle class="v29-ring" cx="260" cy="116" r="17"/><circle class="v29-dot" cx="260" cy="116" r="5"/><path class="v29-leader" d="M277 116h68"/><text x="355" y="120">Scalp</text>
        </g>
        <g class="v29-hotspot" data-v29-region="forehead" tabindex="0" role="button" aria-label="Forehead">
          <circle class="v29-hit" cx="260" cy="192" r="34"/><circle class="v29-ring" cx="260" cy="192" r="17"/><circle class="v29-dot" cx="260" cy="192" r="5"/><path class="v29-leader" d="M243 192h-72"/><text x="113" y="196">Forehead</text>
        </g>
        <g class="v29-hotspot" data-v29-region="undereye" tabindex="0" role="button" aria-label="Under-eye">
          <circle class="v29-hit" cx="318" cy="252" r="34"/><circle class="v29-ring" cx="318" cy="252" r="17"/><circle class="v29-dot" cx="318" cy="252" r="5"/><path class="v29-leader" d="M335 252h58"/><text x="402" y="256">Under-eye</text>
        </g>
        <g class="v29-hotspot" data-v29-region="cheeks" tabindex="0" role="button" aria-label="Cheeks">
          <circle class="v29-hit" cx="196" cy="302" r="36"/><circle class="v29-ring" cx="196" cy="302" r="17"/><circle class="v29-dot" cx="196" cy="302" r="5"/><path class="v29-leader" d="M179 302h-61"/><text x="61" y="306">Cheeks</text>
        </g>
        <g class="v29-hotspot" data-v29-region="lips" tabindex="0" role="button" aria-label="Lips">
          <circle class="v29-hit" cx="252" cy="354" r="32"/><circle class="v29-ring" cx="252" cy="354" r="17"/><circle class="v29-dot" cx="252" cy="354" r="5"/><path class="v29-leader" d="M235 354h-65"/><text x="128" y="358">Lips</text>
        </g>
        <g class="v29-hotspot" data-v29-region="jaw" tabindex="0" role="button" aria-label="Jaw and chin">
          <circle class="v29-hit" cx="311" cy="405" r="36"/><circle class="v29-ring" cx="311" cy="405" r="17"/><circle class="v29-dot" cx="311" cy="405" r="5"/><path class="v29-leader" d="M328 405h67"/><text x="404" y="409">Jaw / chin</text>
        </g>
      </svg>
    </div>
    <div class="v29-panel">
      <div class="v29-region-tabs">${Object.entries(data).map(([key,item],i)=>`<button type="button" data-v29-tab="${key}" aria-pressed="${i===0}">${item.label}</button>`).join('')}</div>
      <div class="v29-readout"><small>Selected area</small><h3 data-v29-title></h3><p data-v29-copy></p><div class="v29-route-links" data-v29-links></div></div>
      <div class="v29-panel-note"><span>This is a navigation aid, not a diagnosis.</span><a href="/concept/book-appointment/?context=Not%20sure%20which%20skin%20concern%20fits">Not sure? Book assessment ↗</a></div>
    </div>`;

  const title = root.querySelector('[data-v29-title]');
  const copy = root.querySelector('[data-v29-copy]');
  const links = root.querySelector('[data-v29-links]');
  const tabs = [...root.querySelectorAll('[data-v29-tab]')];
  const spots = [...root.querySelectorAll('[data-v29-region]')];
  const set = key => {
    const item = data[key]; if (!item) return;
    title.textContent = item.title;
    copy.textContent = item.copy;
    links.innerHTML = item.links.map(([label,href])=>`<a href="${href}">${label} ↗</a>`).join('');
    tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.v29Tab===key)));
    spots.forEach(spot=>spot.classList.toggle('is-active',spot.dataset.v29Region===key));
  };
  tabs.forEach(tab=>tab.addEventListener('click',()=>set(tab.dataset.v29Tab)));
  spots.forEach(spot=>{
    spot.addEventListener('click',()=>set(spot.dataset.v29Region));
    spot.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();set(spot.dataset.v29Region);}});
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) spot.addEventListener('pointerenter',()=>set(spot.dataset.v29Region),{passive:true});
  });
  set('scalp');
})();
