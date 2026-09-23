(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  ready(() => {
    /* Older atlas controls use aria-selected. Give them the tab semantics that attribute requires. */
    document.querySelectorAll('.v3-atlas').forEach((atlas, index) => {
      const list = atlas.querySelector('.v3-atlas-nav');
      const panel = atlas.querySelector('.v3-atlas-stage');
      const buttons = [...(list?.querySelectorAll('button') || [])];
      if (!list || !panel || !buttons.length) return;

      const panelId = panel.id || `v50-atlas-panel-${index + 1}`;
      panel.id = panelId;
      list.setAttribute('role', 'tablist');
      list.setAttribute('aria-orientation', 'vertical');
      panel.setAttribute('role', 'tabpanel');

      buttons.forEach((button, buttonIndex) => {
        const buttonId = button.id || `v50-atlas-tab-${index + 1}-${buttonIndex + 1}`;
        button.id = buttonId;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', panelId);
        const selected = button.getAttribute('aria-selected') === 'true';
        button.tabIndex = selected ? 0 : -1;
        if (selected) panel.setAttribute('aria-labelledby', buttonId);
        button.addEventListener('click', () => {
          buttons.forEach((item) => { item.tabIndex = item === button ? 0 : -1; });
          panel.setAttribute('aria-labelledby', buttonId);
        });
      });
    });

    /* Any genuinely scrollable region must be reachable by keyboard. */
    [...document.querySelectorAll('body *')].forEach((element) => {
      if (element.matches('a,button,input,select,textarea,[contenteditable="true"]')) return;
      const style = getComputedStyle(element);
      const scrollableStyle = /(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`);
      const actuallyScrolls = element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
      if (scrollableStyle && actuallyScrolls && element.tabIndex < 0) element.tabIndex = 0;
    });
  });

  /* Fail-safe close path for the Explore dialog. Never depend on an animation promise. */
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const overlay = document.querySelector('.v39-command:not([hidden])');
    if (!overlay) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    overlay.hidden = true;
    body.classList.remove('v39-command-open');
    document.querySelector('.v39-explore-trigger')?.focus({ preventScroll: true });
  }, true);
})();
