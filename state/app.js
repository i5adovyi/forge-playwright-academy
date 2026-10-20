const $ = selector => document.querySelector(selector);
const THEME = 'forge-state-theme';
const DRAFT = 'forge-state-draft';
const database = new Promise((resolve, reject) => {
  const open = indexedDB.open('forge-state-db', 1);
  open.onupgradeneeded = () => open.result.createObjectStore('notes');
  open.onsuccess = () => resolve(open.result);
  open.onerror = () => reject(open.error);
});

async function notebook(value) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const writing = value !== undefined;
    const transaction = db.transaction('notes', writing ? 'readwrite' : 'readonly');
    const store = transaction.objectStore('notes');
    const request = writing ? store.put(value, 'lesson') : store.get('lesson');
    let result;
    request.onsuccess = () => { result = writing ? value : request.result; };
    transaction.oncomplete = () => resolve(result || 'No notebook note');
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Notebook transaction aborted.'));
  });
}
function refreshLocal() {
  const theme = localStorage.getItem(THEME) || 'system';
  $('[data-testid="theme-value"]').textContent = theme;
  $('#theme').value = ['system', 'light', 'dark'].includes(theme) ? theme : 'system';
}
function refreshDraft() {
  const draft = sessionStorage.getItem(DRAFT) || '';
  $('[data-testid="draft-value"]').textContent = draft || 'No draft';
  $('#draft').value = draft;
}
function ready(message = 'Ready to inspect.') { $('[data-testid="bench-ready"]').textContent = message; }
$('#save-theme').addEventListener('click', () => {
  localStorage.setItem(THEME, $('#theme').value);
  refreshLocal();
  ready('Ready to inspect.');
});
$('#save-draft').addEventListener('click', () => {
  sessionStorage.setItem(DRAFT, $('#draft').value);
  refreshDraft();
  ready('Ready to inspect.');
});
$('#save-notebook').addEventListener('click', async () => {
  try { $('[data-testid="notebook-value"]').textContent = await notebook($('#notebook').value); ready(); }
  catch (error) { ready(`Notebook unavailable: ${error.message}`); }
});
window.addEventListener('storage', event => { if (event.key === THEME) refreshLocal(); });
async function init() {
  try {
    refreshLocal();
    refreshDraft();
    $('[data-testid="notebook-value"]').textContent = await notebook();
    const response = await fetch('/api/session');
    if (!response.ok) throw new Error('Session could not be read.');
    const { user } = await response.json();
    $('[data-testid="identity"]').textContent = user ? `Signed in as ${user.name}` : 'Guest session';
    ready();
  } catch (error) { ready(`State unavailable: ${error.message}`); }
}
init();
