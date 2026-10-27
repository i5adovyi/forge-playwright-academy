// Run before the stylesheets so a saved dark preference applies before paint.
// Appearance is browser-local and separate from the learner's progress record.
(() => {
  const key = 'forge-color-theme-v1';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark', 'system'].includes(value);
  let preference = 'system';
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) preference = saved;
  } catch { /* Browser storage may be unavailable; keep an in-memory choice. */ }

  function apply() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151b17' : '#f6f5f0');
    const select = document.querySelector('#color-theme');
    if (select) select.value = preference;
  }
  apply();
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : 'system';
    apply();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector('#color-theme');
    apply();
    select?.addEventListener('change', () => {
      if (!valid(select.value)) return;
      preference = select.value;
      apply();
      let message = `${select.selectedOptions[0].textContent} theme selected.`;
      try { localStorage.setItem(key, preference); }
      catch { message += ' Browser storage is unavailable; this choice lasts for this visit.'; }
      select.title = message;
      document.querySelector('#theme-status').textContent = message;
    });
  }, { once: true });
})();
