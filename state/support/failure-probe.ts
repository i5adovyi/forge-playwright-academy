import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { expect, type TestInfo } from '@playwright/test';
import { attachEvidence } from './helpers';

const execute = promisify(execFile);
type ProbeResult = {
  status: string;
  errors: { message?: string }[];
  attachments: { name: string; body?: string }[];
};
type ProbeSuite = {
  specs?: { tests: { results: ProbeResult[] }[] }[];
  suites?: ProbeSuite[];
};
function results(suite: ProbeSuite): ProbeResult[] {
  return [
    ...(suite.specs ?? []).flatMap(spec => spec.tests.flatMap(test => test.results)),
    ...(suite.suites ?? []).flatMap(results),
  ];
}

/** Run one genuinely failing Playwright test; require exactly its deliberate
 * error and independently inspect after-teardown evidence from the JSON report.
 * A blanket test.fail() would also accept an accidental teardown failure. */
export async function inspectFailureProbe(
  testInfo: TestInfo,
  name: 'lifecycle-body-failure' | 'lifecycle-setup-failure' | 'member-body-failure',
  expectedError: string,
  baseURL?: string,
) {
  let stdout = '';
  let code = 0;
  try {
    const output = await execute(process.execPath, [
      fileURLToPath(import.meta.resolve('@playwright/test/cli')), 'test',
      '--config', fileURLToPath(new URL('./failure-probe.config.ts', import.meta.url)),
      '--grep', `${name}$`,
    ], {
      env: {
        ...process.env, FORCE_COLOR: '0',
        FORGE_STATE_PROBE_BASE_URL: baseURL,
        FORGE_STATE_PROBE_OUTPUT: testInfo.outputPath(`probe-${name}`),
      },
      timeout: 25_000, maxBuffer: 2 * 1024 * 1024,
    });
    stdout = output.stdout;
  } catch (error) {
    const failure = error as Error & { code?: number; stdout?: string };
    code = failure.code ?? -1;
    stdout = failure.stdout ?? '';
  }
  expect(code, 'The isolated probe must fail, not skip or unexpectedly pass.').toBe(1);
  const report = JSON.parse(stdout) as { suites: ProbeSuite[]; errors: unknown[] };
  expect(report.errors, 'Runner-level errors are not the intended test failure.').toEqual([]);
  const all = report.suites.flatMap(results);
  expect(all).toHaveLength(1);
  expect(all[0].status).toBe('failed');
  expect(all[0].errors).toHaveLength(1);
  // Reporter messages append a code frame and stack after the first line.
  expect(all[0].errors[0].message?.split('\n')[0]).toBe(`Error: ${expectedError}`);
  const wanted = name.startsWith('lifecycle')
    ? 'FS-01-complete-lifecycle.json' : 'FS-10-observed-cleanup.json';
  const evidence = all[0].attachments.find(item => item.name === wanted);
  expect(evidence?.body, 'The outer audit must have reached its after-teardown observation.').toBeTruthy();
  const observed = JSON.parse(Buffer.from(evidence!.body!, 'base64').toString('utf8'));
  if (name.startsWith('lifecycle')) {
    expect(observed.events).toEqual([
      'inventory:setup', 'lease:setup',
      ...(name === 'lifecycle-body-failure' ? ['test:use'] : []),
      'lease:teardown', 'inventory:teardown',
    ]);
  } else {
    expect(observed).toEqual({
      ownedContextClosed: true, ownedPageClosed: true,
      serverSessionAnonymous: true, ownedCartEmpty: true, unrelatedCartTotal: 8900,
    });
  }
  await attachEvidence(testInfo, `${name}-verified`, { childExit: code, deliberateErrors: 1, additionalErrors: 0, observed });
}
