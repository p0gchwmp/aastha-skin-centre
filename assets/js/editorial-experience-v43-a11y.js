(() => {
  const body=document.body;
  if(!body?.classList.contains('concept-page')) return;

  const wireTabs=(buttons,panel,{orientation='horizontal',prefix='tabs'}={})=>{
    if(!buttons.length||!panel) return;
    const list=buttons[0].parentElement;
    list?.setAttribute('role','tablist');
    if(list) list.setAttribute('aria-orientation',orientation);
    panel.id ||= `${prefix}-panel`;
    panel.setAttribute('role','tabpanel');

    const sync=(button,{focus=false,click=false}={})=>{
      buttons.forEach((item,index)=>{
        item.id ||= `${prefix}-tab-${index+1}`;
        item.setAttribute('role','tab');
        item.setAttribute('aria-controls',panel.id);
        const selected=item===button;
        item.setAttribute('aria-selected',String(selected));
        item.tabIndex=selected?0:-1;
      });
      if(button?.id) panel.setAttribute('aria-labelledby',button.id);
      if(click) button.click();
      if(focus) button.focus({preventScroll:true});
    };

    buttons.forEach((button,index)=>{
      button.addEventListener('click',()=>sync(button));
      button.addEventListener('keydown',(event)=>{
        let next=null;
        if(['ArrowRight','ArrowDown'].includes(event.key)) next=(index+1)%buttons.length;
        if(['ArrowLeft','ArrowUp'].includes(event.key)) next=(index-1+buttons.length)%buttons.length;
        if(event.key==='Home') next=0;
        if(event.key==='End') next=buttons.length-1;
        if(next===null) return;
        event.preventDefault();
        sync(buttons[next],{click:true,focus:true});
      });
    });

    sync(buttons.find((button)=>button.getAttribute('aria-selected')==='true')||buttons[0]);
  };

  document.querySelectorAll('.pattern-explorer').forEach((explorer,index)=>{
    wireTabs(
      [...explorer.querySelectorAll('.pattern-tabs [data-pattern]')],
      explorer.querySelector('[data-pattern-stage]'),
      {orientation:'vertical',prefix:`pattern-${index+1}`}
    );
  });

  document.querySelectorAll('[data-choice-matrix]').forEach((matrix,index)=>{
    wireTabs(
      [...matrix.querySelectorAll('[data-choice]')],
      matrix.querySelector('.v3-choice-result'),
      {orientation:'horizontal',prefix:`choice-${index+1}`}
    );
  });

  /* Hover-preview on the homepage should keep the roving tab state in sync. */
  const concernButtons=[...document.querySelectorAll('.concern-selector [data-concern]')];
  const concernPanel=document.querySelector('[data-concern-stage]');
  if(concernButtons.length&&concernPanel){
    concernButtons.forEach((button)=>button.addEventListener('mouseenter',()=>{
      if(button.getAttribute('aria-selected')!=='true') return;
      concernButtons.forEach((item)=>item.tabIndex=item===button?0:-1);
      if(button.id) concernPanel.setAttribute('aria-labelledby',button.id);
    }));
  }

  const routeResult=document.querySelector('[data-route-finder] .route-result');
  if(routeResult){
    routeResult.setAttribute('aria-live','polite');
    routeResult.setAttribute('aria-atomic','true');
  }

  const symptomExplain=document.querySelector('[data-symptom-explain]');
  if(symptomExplain){
    symptomExplain.setAttribute('role','status');
    symptomExplain.setAttribute('aria-live','polite');
    symptomExplain.setAttribute('aria-atomic','true');
  }
})();