(() => {
  const body = document.body;
  const root = document.documentElement;
  if (!body || !body.classList.contains('concept-page')) return;

  root.dataset.aasthaPalette = 'current';
  root.dataset.aasthaMode = 'light';
  try {
    localStorage.removeItem('aastha-preview-theme-mode');
    localStorage.removeItem('aastha-preview-theme-palette');
    localStorage.removeItem('aastha-preview-palette');
  } catch (_) {}

  document.querySelector('.v11-palette-lab')?.remove();
  document.querySelector('.v12-theme-lab')?.remove();
  document.querySelector('.v12-mode-badge')?.remove();
})();