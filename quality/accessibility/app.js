const $ = selector => document.querySelector(selector);
const dialog = $('#preferences-dialog');
const preferencesButton = $('#preferences-open');
let savedReminders = false;

function updateDefects() {
  const missingName = $('#name-defect').checked;
  const lowContrast = $('#contrast-defect').checked;
  if (missingName) preferencesButton.removeAttribute('aria-label');
  else preferencesButton.setAttribute('aria-label', 'Edit workshop preferences');
  $('#privacy-note').classList.toggle('contrast-defect', lowContrast);
  const active = [missingName && 'missing button name', lowContrast && 'low-contrast text'].filter(Boolean);
  $('#fault-status').textContent = active.length ? `Deliberate defects enabled: ${active.join(' and ')}.` : 'No deliberate defects enabled.';
}
$('#name-defect').addEventListener('change', updateDefects);
$('#contrast-defect').addEventListener('change', updateDefects);
$('#repair').addEventListener('click', () => {
  $('#name-defect').checked = false;
  $('#contrast-defect').checked = false;
  updateDefects();
});
preferencesButton.addEventListener('click', () => {
  $('#reminders').checked = savedReminders;
  dialog.showModal();
  $('#reminders').focus();
});
dialog.addEventListener('close', () => preferencesButton.focus());
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('input:not(:disabled), button:not(:disabled)')];
  const first = controls[0];
  const last = controls.at(-1);
  // Explicitly wrap the component boundary. Some native-dialog implementations
  // otherwise move to browser chrome before returning to the document.
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
$('#preferences-cancel').addEventListener('click', () => dialog.close());
$('#preferences-form').addEventListener('submit', event => {
  event.preventDefault();
  savedReminders = $('#reminders').checked;
  $('#preferences-status').textContent = `Workshop reminders: ${savedReminders ? 'on' : 'off'}.`;
  dialog.close();
});

$('#signup-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#full-name');
  const email = $('#email');
  const fields = [
    { input: name, error: $('#name-error'), hint: 'name-hint', invalid: !name.value.trim() },
    { input: email, error: $('#email-error'), hint: 'email-hint', invalid: !email.value.trim() || email.validity.typeMismatch },
  ];
  const list = $('#error-links');
  list.replaceChildren();
  for (const field of fields) {
    field.error.hidden = !field.invalid;
    field.input.setAttribute('aria-invalid', String(field.invalid));
    field.input.setAttribute('aria-describedby', `${field.hint}${field.invalid ? ` ${field.error.id}` : ''}`);
    if (field.invalid) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${field.input.id}`;
      link.textContent = field.error.textContent;
      link.addEventListener('click', event => { event.preventDefault(); field.input.focus(); });
      item.append(link);
      list.append(item);
    }
  }
  const invalid = fields.some(field => field.invalid);
  $('#error-summary').hidden = !invalid;
  $('#signup-status').textContent = invalid ? '' : `You're on the list, ${name.value.trim()}. This is a demo; no registration was sent.`;
  if (invalid) $('#error-summary').focus();
});
