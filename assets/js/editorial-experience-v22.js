(() => {
  const plate = document.querySelector('.hero-art.v18-authored-media.v21-motion-plate');
  if (!plate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (reduced || !finePointer) return;

  let frame = 0;
  let latest = null;
  const paint = () => {
    frame = 0;
    if (!latest) return;
    const rect = plate.getBoundingClientRect();
    const x = Math.max(0,Math.min(1,(latest.clientX-rect.left)/rect.width));
    const y = Math.max(0,Math.min(1,(latest.clientY-rect.top)/rect.height));
    const dx = x - .5;
    const dy = y - .5;
    plate.style.setProperty('--v22-img-x',`${(-dx*9).toFixed(2)}px`);
    plate.style.setProperty('--v22-img-y',`${(-dy*9).toFixed(2)}px`);
    plate.style.setProperty('--v22-ring1-x',`${(dx*14).toFixed(2)}px`);
    plate.style.setProperty('--v22-ring1-y',`${(dy*10).toFixed(2)}px`);
    plate.style.setProperty('--v22-ring2-x',`${(-dx*18).toFixed(2)}px`);
    plate.style.setProperty('--v22-ring2-y',`${(-dy*14).toFixed(2)}px`);
  };
  plate.addEventListener('pointermove',event => {
    latest = event;
    if (!frame) frame = requestAnimationFrame(paint);
  },{passive:true});
  plate.addEventListener('pointerleave',() => {
    latest = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    ['--v22-img-x','--v22-img-y','--v22-ring1-x','--v22-ring1-y','--v22-ring2-x','--v22-ring2-y'].forEach(name=>plate.style.setProperty(name,'0px'));
  },{passive:true});
})();
