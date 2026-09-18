(() => {
  const body = document.body;
  if (!body?.classList.contains('concept-page')) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ready = () => {
    const M = window.Motion;
    if (!M?.animate) return;

    const { animate, scroll, inView } = M;
    const root = document.documentElement;
    root.classList.add('has-motion-dev');

    const spring = { type: 'spring', stiffness: 260, damping: 28, mass: .72 };
    const ease = [.22, .72, .24, 1];

    const safeAnimate = (target, keyframes, options = {}) => {
      if (!target || reduced) return null;
      try { return animate(target, keyframes, options); } catch (_) { return null; }
    };

    /* Hero: authored entrance + very light scroll depth. */
    const hero = document.querySelector('.editorial-hero');
    if (hero && !hero.dataset.v37Motion) {
      hero.dataset.v37Motion = '1';
      const targets = [
        hero.querySelector('.kicker'),
        hero.querySelector('.hero-title'),
        hero.querySelector('.hero-copy'),
        hero.querySelector('.hero-actions'),
        hero.querySelector('.hero-art')
      ].filter(Boolean);

      targets.forEach((el, index) => {
        safeAnimate(el,
          { opacity: [0.001, 1], y: [18, 0] },
          { duration: .58, delay: index * .055, ease }
        );
      });

      const art = hero.querySelector('.hero-art img');
      if (art && !reduced && scroll) {
        const artMotion = animate(art, { scale: [1, 1.035], y: [0, -18] }, { ease: 'linear' });
        scroll(artMotion, { target: hero, offset: ['start start', 'end start'] });
      }
    }

    /* Section hierarchy: Motion takes over the reveal role for high-value surfaces. */
    if (!reduced && inView) {
      const revealTargets = [
        ...document.querySelectorAll('.editorial-section .section-head'),
        ...document.querySelectorAll('.v30-gallery-head'),
        ...document.querySelectorAll('.v31-pigment-deck'),
        ...document.querySelectorAll('#approach .process-stage'),
        ...document.querySelectorAll('#doctor .hero-grid'),
        ...document.querySelectorAll('#clinics .clinic-switch')
      ];

      revealTargets.forEach(el => {
        if (el.dataset.v37Seen) return;
        inView(el, () => {
          if (el.dataset.v37Seen) return;
          el.dataset.v37Seen = '1';
          animate(el,
            { opacity: [0.001, 1], y: [16, 0] },
            { duration: .5, ease }
          );
        }, { amount: .18, margin: '0px 0px -8% 0px' });
      });
    }

    /* Photo-led cards: spring response, not pointer-follow gimmicks. */
    document.querySelectorAll('.v30-card,.v30-treatment-tile,.legacy-media-frame').forEach(card => {
      if (card.dataset.v37Hover) return;
      card.dataset.v37Hover = '1';
      const image = card.querySelector('img');
      if (!image || reduced) return;
      card.addEventListener('pointerenter', () => {
        if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
        animate(image, { scale: 1.035 }, spring);
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        animate(image, { scale: 1 }, spring);
      }, { passive: true });
    });

    /* Treatment rail: visual progress + active-card spring. */
    const rail = document.querySelector('#treatments [data-drag-rail]');
    const toolbar = document.querySelector('#treatments .v35-rail-toolbar');
    if (rail && toolbar && !toolbar.querySelector('.v37-rail-progress')) {
      const progress = document.createElement('div');
      progress.className = 'v37-rail-progress';
      progress.setAttribute('aria-hidden', 'true');
      progress.innerHTML = '<span></span>';
      toolbar.insertBefore(progress, toolbar.querySelector('.v35-rail-actions'));
      const fill = progress.firstElementChild;

      if (!reduced && scroll) {
        const progressMotion = animate(fill, { scaleX: [0, 1] }, { ease: 'linear' });
        scroll(progressMotion, { container: rail, axis: 'x', trackContentSize: true });
      } else {
        fill.style.transform = 'scaleX(0)';
      }

      const cards = [...rail.querySelectorAll('.drag-card')];
      if (!reduced && inView) {
        cards.forEach(card => {
          inView(card, () => {
            cards.forEach(c => c.classList.remove('is-v37-focused'));
            card.classList.add('is-v37-focused');
            animate(card, { scale: [0.985, 1], opacity: [.72, 1] }, spring);
            return () => card.classList.remove('is-v37-focused');
          }, { root: rail, amount: .58 });
        });
      }
    }

    /* How care works: a true scroll-linked progress track. */
    const approach = document.querySelector('#approach');
    const processNav = approach?.querySelector('.process-nav');
    if (approach && processNav && !processNav.querySelector('.v37-care-meter')) {
      const meter = document.createElement('div');
      meter.className = 'v37-care-meter';
      meter.setAttribute('aria-hidden', 'true');
      meter.innerHTML = '<span></span>';
      processNav.appendChild(meter);

      if (!reduced && scroll) {
        const fill = meter.firstElementChild;
        const careMotion = animate(fill, { scaleY: [0, 1] }, { ease: 'linear' });
        scroll(careMotion, {
          target: approach,
          offset: ['start 65%', 'end 35%']
        });
      }

      if (!reduced && inView) {
        approach.querySelectorAll('[data-process-chapter]').forEach(chapter => {
          const button = processNav.querySelector('[data-process-target="' + chapter.id + '"]');
          if (!button) return;
          inView(chapter, () => {
            animate(button, { x: [0, 5, 0], opacity: [.62, 1] }, { duration: .42, ease });
          }, { amount: .42, margin: '-18% 0px -36% 0px' });
        });
      }
    }

    /* Finder: show the actual route the visitor has composed. */
    const finder = document.querySelector('[data-route-finder]');
    const result = finder?.querySelector('.route-result');
    if (finder && result && !result.querySelector('.v37-route-map')) {
      const map = document.createElement('div');
      map.className = 'v37-route-map';
      map.innerHTML = [
        '<div class="v37-route-node"><small>Area</small><strong data-v37-area>Face</strong></div>',
        '<div class="v37-route-line"></div>',
        '<div class="v37-route-node"><small>Concern</small><strong data-v37-concern>Breakouts</strong></div>',
        '<div class="v37-route-line"></div>',
        '<div class="v37-route-node"><small>Guide</small><strong data-v37-guide>Acne & breakouts</strong></div>'
      ].join('');
      result.prepend(map);

      const sync = (withMotion = true) => {
        const area = finder.querySelector('[data-route-group="area"][aria-pressed="true"]');
        const concern = finder.querySelector('[data-route-group="concern"][aria-pressed="true"]');
        const guide = finder.querySelector('[data-route-title]');
        map.querySelector('[data-v37-area]').textContent = area?.textContent.trim() || 'Area';
        map.querySelector('[data-v37-concern]').textContent = concern?.textContent.trim() || 'Concern';
        map.querySelector('[data-v37-guide]').textContent = guide?.textContent.trim() || 'Suggested guide';
        if (withMotion && !reduced) {
          map.querySelectorAll('.v37-route-node').forEach((node, index) => {
            animate(node, { opacity: [.45, 1], x: [-5, 0] }, { duration: .3, delay: index * .04, ease });
          });
        }
      };
      sync(false);
      finder.addEventListener('click', event => {
        if (!event.target.closest('[data-route-choice]')) return;
        requestAnimationFrame(() => requestAnimationFrame(() => sync(true)));
      });
    }

    /* Pigmentation: photographic state changes now use Motion rather than a CSS flicker. */
    const pigment = document.querySelector('[data-v31-pigment]');
    if (pigment && !pigment.dataset.v37Motion) {
      pigment.dataset.v37Motion = '1';
      const image = pigment.querySelector('[data-v31-pigment-img]');
      const copy = pigment.querySelector('.v31-pigment-copy');
      const animateState = () => {
        if (reduced) return;
        if (image) animate(image, { opacity: [.58, 1], scale: [1.025, 1] }, { duration: .46, ease });
        if (copy) {
          const children = [...copy.children];
          children.forEach((child, index) => {
            animate(child, { opacity: [.55, 1], y: [8, 0] }, { duration: .32, delay: index * .025, ease });
          });
        }
      };
      pigment.querySelectorAll('[data-v31-state]').forEach(button => {
        button.addEventListener('click', () => requestAnimationFrame(animateState));
        button.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') requestAnimationFrame(animateState);
        });
      });
    }

    /* Concern explorer: selected state feels tactile without rearranging the page. */
    const concernStage = document.querySelector('[data-concern-stage]');
    document.querySelectorAll('[data-concern]').forEach(button => {
      if (button.dataset.v37Motion) return;
      button.dataset.v37Motion = '1';
      button.addEventListener('click', () => {
        if (!concernStage || reduced) return;
        requestAnimationFrame(() => {
          animate(concernStage, { opacity: [.7, 1], y: [8, 0] }, { duration: .34, ease });
          animate(button, { scale: [.985, 1] }, spring);
        });
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();
