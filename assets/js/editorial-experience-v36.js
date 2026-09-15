(() => {
  const body=document.body;
  if(!body?.classList.contains('concept-admin'))return;

  const search=document.querySelector('[data-v36-admin-search]');
  const filter=document.querySelector('[data-v36-admin-filter]');
  const count=document.querySelector('[data-v36-admin-count]');
  const rows=[...document.querySelectorAll('[data-v36-admin-row]')];
  const apply=()=>{
    const q=(search?.value||'').trim().toLowerCase();
    const kind=(filter?.value||'all').toLowerCase();
    let visible=0;
    rows.forEach(row=>{
      const matchText=!q||(row.dataset.search||'').includes(q);
      const matchKind=kind==='all'||(row.dataset.kind||'')===kind;
      row.hidden=!(matchText&&matchKind);
      if(!row.hidden)visible++;
    });
    if(count)count.textContent=`${visible} route${visible===1?'':'s'}`;
  };
  search?.addEventListener('input',apply);
  filter?.addEventListener('change',apply);
  addEventListener('keydown',e=>{
    if(e.key==='/'&&!/input|textarea|select/i.test(document.activeElement?.tagName||'')){
      e.preventDefault();search?.focus();
    }
  });

  // Settings are intentionally local to the preview. Real saves belong to authenticated Wagtail.
  document.querySelectorAll('.v18-admin-form input,.v18-admin-form textarea,.v18-admin-form select').forEach((field,i)=>{
    const key=`aastha-admin-preview:${location.pathname}:${field.name||field.id||i}`;
    try{const saved=localStorage.getItem(key);if(saved!==null)field.value=saved;}catch{}
    field.addEventListener('change',()=>{try{localStorage.setItem(key,field.value);}catch{}});
  });
})();