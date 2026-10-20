import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { test as setup } from '@playwright/test';
import { authFile } from './paths';
import { loginWithCookies } from '../support/helpers';

setup('setup: capture the verified synthetic member', async ({ request }) => {
  await loginWithCookies(request);
  await mkdir(dirname(authFile), { recursive: true });
  await request.storageState({ path: authFile });
  // The gate probe fails AFTER allocation: consumers must not start, but
  // teardown must still revoke this session and remove its file.
  if (process.env.FORGE_AUTH_SETUP_FAIL === '1') throw new Error('CONTROLLED_AUTH_SETUP_FAILURE');
});
