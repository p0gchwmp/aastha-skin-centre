(() => {
  const body=document.body;
  if(!body?.classList.contains('concept-page')) return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const motion=()=>window.Motion?.animate ? window.Motion : null;

  const clinicPanel=document.querySelector('[data-clinic-panel]');
  const clinicButtons=[...document.querySelectorAll('[data-clinic]')];
  if(clinicPanel&&clinicButtons.length){
    clinicButtons.forEach((button)=>{
      button.addEventListener('click',()=>{
        if(reduced) return;
        requestAnimationFrame(()=>{
          const M=motion();
          if(!M) return;
          const parts=[
            clinicPanel.querySelector('.kicker'),
            clinicPanel.querySelector('[data-clinic-name]'),
            clinicPanel.querySelector('[data-clinic-address]'),
            clinicPanel.querySelector('[data-clinic-hours]'),
            ...clinicPanel.querySelectorAll('p:not([data-clinic-hours])'),
            clinicPanel.querySelector('.hero-actions'),
          ].filter(Boolean);
          parts.forEach((part,index)=>{
            try{
              M.animate(part,{opacity:[.58,1],y:[7,0]},{
                duration:.28,
                delay:index*.022,
                ease:[.22,.72,.24,1],
              });
            }catch{}
          });
          try{
            M.animate(button,{scale:[.985,1]},{
              duration:.24,
              ease:[.22,.72,.24,1],
            });
          }catch{}
        });
      });
    });
  }

  document.querySelectorAll('.faq-stack details,.v3-accordion details').forEach((details)=>{
    details.addEventListener('toggle',()=>{
      if(!details.open||reduced) return;
      requestAnimationFrame(()=>{
        const M=motion();
        const answer=details.querySelector('.faq-answer-v2,.answer');
        if(!M||!answer) return;
        try{
          M.animate(answer,{opacity:[.45,1],y:[6,0]},{
            duration:.24,
            ease:[.22,.72,.24,1],
          });
        }catch{}
      });
    });
  });
})();