(() => {
  // Keep exactly one marquee, one cursor cue and one section navigator.
  const oldMarquee = document.querySelector('.marquee-band');
  const newMarquee = document.querySelector('.v3-marquee');
  if (oldMarquee && newMarquee) newMarquee.remove();
  document.querySelectorAll('.section-dock').forEach(el => el.remove());
  document.querySelectorAll('.cursor-cue').forEach(el => el.remove());

  // Point concept-page navigation to migrated concept routes while leaving
  // production/static legacy pages untouched elsewhere in the preview build.
  const routeMap = new Map([
    ['/conditions/','/concept/conditions/'],
    ['/treatments/','/concept/treatments/'],
    ['/treatments/pigmentation-treatment/','/concept/pigmentation-treatment/'],
    ['/treatments/hair-fall-treatment/','/concept/hair-fall-treatment/'],
    ['/treatments/laser-hair-reduction/','/concept/laser-hair-reduction/'],
  ]);
  document.querySelectorAll('a[href]').forEach((link) => {
    const raw = link.getAttribute('href');
    if (routeMap.has(raw)) link.setAttribute('href', routeMap.get(raw));
  });
})();
