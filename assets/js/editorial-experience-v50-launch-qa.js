(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  const wireTabSet = (list, panel, prefix, orientation = 'vertical') => {
    if (!list || !panel) return;
    const buttons = [...list.querySelectorAll('button[aria-selected]')];
    if (!buttons.length) return;

    const setIndex = [...document.querySelectorAll('[role="tablist"]')].indexOf(list) + 1;
    const panelId = panel.id || `${prefix}-panel-${Math.max(1, setIndex)}`;
    panel.id = panelId;
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-orientation', orientation);
    panel.setAttribute('role', 'tabpanel');

    const sync = (active) => {
      buttons.forEach((button) => {
        const selected = button === active;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      if (active?.id) panel.setAttribute('aria-labelledby', active.id);
    };

    buttons.forEach((button, buttonIndex) => {
      const buttonId = button.id || `${prefix}-tab-${Math.max(1, setIndex)}-${buttonIndex + 1}`;
      button.id = buttonId;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panelId);
      if (button.getAttribute('aria-selected') === 'true') sync(button);
      button.addEventListener('click', () => sync(button));
      button.addEventListener('keydown', (event) => {
        const keys = orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
        if (!keys.includes(event.key) && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault();
        const current = buttons.indexOf(button);
        let next = current;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === keys[0]) next = (current - 1 + buttons.length) % buttons.length;
        else next = (current + 1) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
      });
    });

    if (!buttons.some((button) => button.getAttribute('aria-selected') === 'true')) sync(buttons[0]);
  };

  ready(() => {
    /* Older atlas controls use aria-selected. Give them the tab semantics that attribute requires. */
    document.querySelectorAll('.v3-atlas').forEach((atlas, index) => {
      const list = atlas.querySelector('.v3-atlas-nav');
      const panel = atlas.querySelector('.v3-atlas-stage');
      wireTabSet(list, panel, `v50-atlas-${index + 1}`, 'vertical');
    });

    /* Clinical compass was the remaining four-node aria-allowed-attr failure on treatment pages. */
    document.querySelectorAll('.v6-compass').forEach((compass, index) => {
      const list = compass.querySelector('.v6-compass-nav');
      const panel = compass.querySelector('.v6-compass-stage');
      wireTabSet(list, panel, `v50-compass-${index + 1}`, matchMedia('(max-width:900px)').matches ? 'horizontal' : 'vertical');
    });

    /* Last-resort normalization for legacy button groups that use aria-selected without tab semantics. */
    document.querySelectorAll('button[aria-selected]:not([role])').forEach((button, index) => {
      const list = button.parentElement;
      const siblings = list ? [...list.querySelectorAll(':scope > button[aria-selected]')] : [];
      if (!list || siblings.length < 2) return;
      list.setAttribute('role', 'tablist');
      siblings.forEach((item, itemIndex) => {
        item.setAttribute('role', 'tab');
        item.tabIndex = item.getAttribute('aria-selected') === 'true' ? 0 : -1;
        if (!item.id) item.id = `v50-legacy-tab-${index + 1}-${itemIndex + 1}`;
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
