const button = document.querySelector('#generate');
const resume = document.querySelector('#resume');
const status = document.querySelector('#status');
const error = document.querySelector('#error');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let activeJob = null;

async function run(create) {
  button.disabled = true;
  resume.disabled = true;
  resume.hidden = true;
  error.textContent = '';
  status.textContent = create ? 'Submitting' : 'Resuming observation';
  if (create) {
    activeJob = null;
    document.querySelector('#result').hidden = true;
    document.querySelector('#active-job').hidden = true;
  }
  const controller = new AbortController();
  const deadline = performance.now() + 5_000;
  const timer = setTimeout(() => controller.abort(), 5_000);
  let outcome = 'unknown';
  const read = async path => {
    const response = await fetch(path, { signal: controller.signal });
    if (!response.ok) throw new Error(`Report request failed: ${response.status}`);
    return response.json();
  };
  try {
    if (create) {
      const requestId = crypto.randomUUID();
      const submitted = await fetch('/jobs', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, customerId: 'customer-42', format: 'summary' }),
      });
      if (submitted.status !== 202) throw new Error('No usable acceptance response');
      const accepted = await submitted.json();
      if (typeof accepted.id !== 'string' || accepted.requestId !== requestId || accepted.customerId !== 'customer-42') {
        throw new Error('Submission identity mismatch');
      }
      activeJob = accepted;
      document.querySelector('#active-job code').textContent = accepted.id;
      document.querySelector('#active-job').hidden = false;
    }
    const job = activeJob;
    const requestId = job.requestId;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (performance.now() >= deadline) throw new Error('Report observation deadline exceeded');
      const value = await read(`/jobs/${job.id}`);
      if (value.id !== job.id || value.requestId !== requestId || value.customerId !== 'customer-42') throw new Error('Job identity mismatch');
      status.textContent = value.state;
      if (value.state === 'failed') {
        outcome = 'failed';
        throw new Error(`Report failed: ${value.error.code}`);
      }
      if (value.state === 'succeeded') {
        if (value.artifactPath !== `/jobs/${job.id}/artifact`) throw new Error('Artifact path mismatch');
        const artifact = await read(value.artifactPath);
        if (artifact.jobId !== job.id || artifact.requestId !== requestId || artifact.customerId !== 'customer-42') throw new Error('Artifact identity mismatch');
        document.querySelector('#job').textContent = artifact.jobId;
        document.querySelector('#customer').textContent = artifact.customerId;
        document.querySelector('#orders').textContent = String(artifact.summary.orderCount);
        document.querySelector('#total').textContent = `$${(artifact.summary.totalCents / 100).toFixed(2)}`;
        document.querySelector('#result').hidden = false;
        outcome = 'succeeded';
        return;
      }
      if (!['queued', 'running'].includes(value.state)) throw new Error('Unknown job state');
      await delay(Math.min(20, Math.max(0, deadline - performance.now())));
    }
    throw new Error('Report observation read limit exceeded');
  } catch (failure) {
    const cause = failure instanceof Error ? failure.message : String(failure);
    if (outcome === 'failed') {
      status.textContent = 'Job failed';
      error.textContent = cause;
    } else {
      status.textContent = activeJob ? 'Observation stopped' : 'Submission outcome unknown';
      error.textContent = activeJob
        ? `The outcome of job ${activeJob.id} is still unknown. Resume reads the same job without submitting again. ${cause}`
        : `No usable job identity was received. A job may exist; another submission could create duplicate work. ${cause}`;
    }
  } finally {
    clearTimeout(timer);
    // Observation failure never becomes permission to repeat this non-idempotent POST.
    button.disabled = outcome === 'unknown';
    if (outcome !== 'unknown') button.textContent = 'Generate another report';
    resume.hidden = outcome !== 'unknown' || !activeJob;
    resume.disabled = false;
  }
}
button.addEventListener('click', () => run(true));
resume.addEventListener('click', () => run(false));
