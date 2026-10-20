// Browser drafts protect work before the local SQLite server acknowledges it.
// Revisions protect work in another tab. Neither is an automatic cloud sync.
export const PROGRESS_KEY = 'forge-academy-v1';
const DRAFT_PREFIX = 'forge-academy-draft-v1:';
const TAB_KEY = 'forge-academy-tab-v1';
const empty = () => ({ completed: [], checks: {}, notes: {}, quizzes: {}, lastLesson: null });
const copy = value => JSON.parse(JSON.stringify(value));
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const meaningful = p => p.completed.length || Object.keys(p.checks).length || Object.keys(p.notes).length || Object.keys(p.quizzes).length || p.lastLesson;

export function createProgressStore({ runtimeMode, validate, onState = () => {}, onProgress = () => {} }) {
  let current = empty(), saved = empty(), revision = 0, databaseId = '', databasePath = '', updatedAt = null;
  let mode = 'loading', phase = 'loading', ready = false, draftOK = true, legacy = null, legacyAvailable = false;
  let timer, inflight, lastAttempt, recovery = null, detail = '', disposed = false, resolving = false, editVersion = 0;
  let tabId, previousDraftKey;
  try {
    const previous = sessionStorage.getItem(TAB_KEY);
    previousDraftKey = previous ? DRAFT_PREFIX + previous : null;
    // sessionStorage can be copied by window.open or Duplicate Tab. Every live
    // document needs its own write key; the previous key is only read for recovery.
    tabId = crypto.randomUUID();
    sessionStorage.setItem(TAB_KEY, tabId);
  } catch { tabId = crypto.randomUUID(); }
  let draftKey = DRAFT_PREFIX + tabId;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) legacy = validate(JSON.parse(raw));
  } catch { draftOK = false; detail = 'The previous browser record could not be read. Export your current work before closing.'; }

  const snapshot = () => ({
    mode, phase, ready, draftOK, databaseId, databasePath, revision, updatedAt, detail,
    legacyAvailable, recoveryAvailable: !!recovery, recoveryOtherDatabase: !!recovery && recovery.databaseId !== databaseId,
    hasDraft: !!meaningful(current), progress: copy(current),
  });
  const emit = () => { if (!disposed) onState(snapshot()); };
  const update = value => { current = copy(value); editVersion++; onProgress(copy(current)); };
  const removeDraft = () => { try { localStorage.removeItem(draftKey); } catch { /* Keep a recoverable duplicate if deletion is denied. */ } };
  const preserveDraft = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ databaseId, baseRevision: revision, conflict: phase === 'conflict', progress: current, at: new Date().toISOString() }));
      draftOK = true;
    } catch { draftOK = false; }
  };
  const readDraft = key => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || 'null');
      return raw && typeof raw.databaseId === 'string' && Number.isInteger(raw.baseRevision) && raw.baseRevision >= 0
        ? { ...raw, key, progress: validate(raw.progress) } : null;
    } catch { return null; }
  };
  function findRecovery() {
    recovery = null;
    try {
      const candidates = Object.keys(localStorage).filter(key => key.startsWith(DRAFT_PREFIX) && key !== draftKey)
        .map(readDraft).filter(d => d && !equal(d.progress, current) && (d.databaseId !== databaseId || !equal(d.progress, saved)));
      candidates.sort((a, b) => String(b.at).localeCompare(String(a.at)));
      recovery = candidates[0] || null;
    } catch { draftOK = false; }
  }
  async function request(method = 'GET', body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/api/learning/progress', {
        method, credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { 'X-Forge-Local': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json();
      if (method === 'GET' && response.ok && data.mode === 'browser') return data;
      if (!response.ok && response.status !== 409) throw new Error(`Progress service returned ${response.status}.`);
      if (data.mode !== 'sqlite' || typeof data.databaseId !== 'string' || !data.databaseId ||
          typeof data.databasePath !== 'string' || !Number.isInteger(data.revision) || data.revision < 0 ||
          !(data.updatedAt === null || typeof data.updatedAt === 'string')) throw new Error('The progress service returned an invalid record.');
      const progress = validate(data.progress);
      if (response.status === 409 && data.error?.code !== 'PROGRESS_CONFLICT') throw new Error('The progress service returned an invalid conflict.');
      return { ...data, progress, conflict: response.status === 409 };
    } finally { clearTimeout(timeout); }
  }
  function adoptRemote(data) {
    databaseId = data.databaseId; databasePath = data.databasePath;
    revision = data.revision; updatedAt = data.updatedAt; saved = copy(data.progress);
  }
  function browserSave() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
      draftOK = true; phase = 'saved'; detail = '';
    } catch {
      draftOK = false; phase = 'unsaved'; detail = 'Browser storage is unavailable. Export before closing this tab.';
    }
    emit();
    return phase === 'saved';
  }
  async function init() {
    clearTimeout(timer);
    phase = 'loading'; ready = false; emit();
    try {
      // Hosted/static output has no database API, including a static localhost preview.
      const data = runtimeMode === 'static' ? { mode: 'browser' } : await request();
      if (data.mode === 'browser') {
        mode = 'browser'; update(legacy || empty()); phase = draftOK ? 'saved' : 'unsaved'; ready = true; emit(); return;
      }
      mode = 'sqlite'; adoptRemote(data); update(saved); phase = 'saved'; ready = true;
      legacyAvailable = !!legacy && !!meaningful(legacy) && !equal(legacy, saved);
      const ownDraft = readDraft(draftKey) || (previousDraftKey && readDraft(previousDraftKey));
      if (ownDraft?.databaseId === databaseId && !equal(ownDraft.progress, saved)) {
        update(ownDraft.progress);
        phase = ownDraft.conflict || ownDraft.baseRevision !== revision ? 'conflict' : 'unsaved';
        detail = 'A browser draft was recovered. Review it, then retry or explicitly replace the saved record.';
        preserveDraft();
      } else {
        if (ownDraft?.key === draftKey && ownDraft.databaseId !== databaseId) {
          // A different data directory must not destroy the old database's draft.
          tabId = crypto.randomUUID(); draftKey = DRAFT_PREFIX + tabId;
          try { sessionStorage.setItem(TAB_KEY, tabId); } catch { /* This page still owns a unique key. */ }
        }
        removeDraft();
        if (revision === 0 && legacyAvailable) {
          update(legacy); preserveDraft(); phase = 'saving';
          detail = 'Copying your previous browser record into this new local database.';
        }
      }
      findRecovery(); emit();
      if (phase === 'saving') await flush();
    } catch {
      const ownDraft = readDraft(draftKey) || (previousDraftKey && readDraft(previousDraftKey));
      if (ownDraft) update(ownDraft.progress);
      else if (legacy) update(legacy);
      phase = 'unavailable'; detail = 'The local database could not be loaded. Start the local server and retry. Editing is paused to protect existing progress.';
      emit();
    }
  }
  function set(value) {
    if (!ready) return;
    const next = validate(value);
    if (equal(current, next)) return;
    current = copy(next); editVersion++;
    if (mode === 'browser') { browserSave(); return; }
    preserveDraft();
    if (phase === 'conflict' || phase === 'unsaved') { emit(); return; }
    phase = 'saving'; detail = ''; emit();
    clearTimeout(timer); timer = setTimeout(() => { void flush(); }, 160);
  }
  async function flush(allowDuringResolution = false) {
    clearTimeout(timer);
    if (!ready) return false;
    if (mode === 'browser') return phase === 'saved';
    if (resolving && !allowDuringResolution) return false;
    if (inflight) return inflight;
    if (phase === 'conflict' || phase === 'unsaved') return false;
    inflight = (async () => {
      while (!equal(current, saved)) {
        const attempted = { databaseId, baseRevision: revision, progress: copy(current) };
        lastAttempt = attempted; preserveDraft(); phase = 'saving'; emit();
        try {
          const data = await request('PUT', attempted);
          if (data.databaseId !== databaseId) throw new Error('The database changed while saving.');
          if (data.conflict) {
            adoptRemote(data); phase = 'conflict';
            detail = 'Another tab or restored database has a newer record. Your draft has been kept; choose which record to keep.';
            preserveDraft(); emit(); return false;
          }
          if (data.revision !== attempted.baseRevision + 1 || !equal(data.progress, attempted.progress)) throw new Error('The save acknowledgement did not match this draft.');
          adoptRemote(data); lastAttempt = null;
          // A newer edit may have arrived while this request was in flight.
        } catch {
          phase = 'unsaved'; detail = 'The database has not confirmed this draft. Retry checks the saved record before writing again.';
          preserveDraft(); emit(); return false;
        }
      }
      phase = 'saved'; detail = ''; legacyAvailable = !!legacy && !!meaningful(legacy) && !equal(legacy, saved);
      removeDraft(); emit(); return true;
    })();
    try { return await inflight; } finally { inflight = null; }
  }
  async function retry() {
    if (!ready) { await init(); return phase === 'saved'; }
    if (mode === 'browser') return browserSave();
    if (phase === 'conflict') return false;
    return resolveAction(async () => { try {
      const remote = await request();
      if (remote.mode !== 'sqlite' || remote.databaseId !== databaseId) throw new Error('A different database is attached.');
      if (equal(remote.progress, current)) {
        adoptRemote(remote); phase = 'saved'; detail = ''; removeDraft(); emit(); return true;
      }
      const knownAttempt = lastAttempt && equal(remote.progress, lastAttempt.progress);
      if ((remote.revision === revision && equal(remote.progress, saved)) || knownAttempt) {
        adoptRemote(remote); phase = 'saving'; detail = ''; emit(); return flush(true);
      }
      adoptRemote(remote); phase = 'conflict'; preserveDraft();
      detail = 'The saved record changed. Review your draft before replacing it.'; emit(); return false;
    } catch {
      phase = 'unsaved'; detail = 'The saved record could not be checked. Your draft is still available for export.'; preserveDraft(); emit(); return false;
    } });
  }
  async function resolveAction(action) {
    if (resolving) return false;
    resolving = true; clearTimeout(timer);
    try { if (inflight) await inflight; return await action(); }
    finally {
      resolving = false;
      if (phase === 'saving' && !equal(current, saved)) timer = setTimeout(() => { void flush(); }, 0);
    }
  }
  async function reloadSaved() {
    const versionAtConfirmation = editVersion;
    return resolveAction(async () => { try {
      const remote = await request();
      if (remote.mode !== 'sqlite') throw new Error('The database is unavailable.');
      if (editVersion !== versionAtConfirmation) {
        detail = 'You edited after choosing reload. Reload was cancelled and the newer draft has been kept.';
        preserveDraft(); emit(); return false;
      }
      adoptRemote(remote); update(saved); phase = 'saved'; detail = ''; lastAttempt = null; removeDraft(); findRecovery(); emit(); return true;
    } catch { detail = 'Reload failed. Your draft has been kept.'; emit(); return false; } });
  }
  async function replaceDraft(confirmReplace) {
    return resolveAction(async () => { try {
      const remote = await request();
      if (remote.mode !== 'sqlite' || remote.databaseId !== databaseId) throw new Error('A different database is attached.');
      if (!confirmReplace(remote.revision)) return false;
      adoptRemote(remote); phase = 'saving'; detail = ''; preserveDraft(); emit();
      return flush(true);
    } catch { phase = 'unsaved'; detail = 'The saved record could not be checked. Replacement was not attempted.'; preserveDraft(); emit(); return false; } });
  }
  async function exportSaved() {
    const remote = await request();
    if (remote.mode !== 'sqlite' || remote.databaseId !== databaseId) throw new Error('The saved database could not be verified.');
    return copy(remote.progress);
  }
  function recoverDraft() {
    if (!recovery || inflight || resolving) return;
    update(recovery.progress); phase = 'conflict'; detail = 'Recovered a browser draft. Export it or explicitly replace the database record.';
    preserveDraft(); recovery = null; emit();
  }
  function useLegacy() {
    if (!legacyAvailable || inflight || resolving) return;
    update(legacy); phase = 'conflict'; detail = 'Loaded the previous browser record as a draft. The database has not been changed.';
    preserveDraft(); emit();
  }
  return {
    init, set, flush, retry, reloadSaved, replaceDraft, exportSaved, recoverDraft, useLegacy,
    get state() { return snapshot(); },
    get legacy() { return legacy ? copy(legacy) : null; },
    dispose() { disposed = true; clearTimeout(timer); },
  };
}
