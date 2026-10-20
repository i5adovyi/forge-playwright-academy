import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { copySourceEntries } from './source-manifest.mjs';

const root = resolve(import.meta.dirname, '..');
const staging = await mkdtemp(join(tmpdir(), 'forge-source-build-'));
try {
  const entries = await copySourceEntries(root, staging);
  await mkdir(`${root}/portal/downloads`, { recursive: true });
  await rm(`${root}/portal/docs`, { recursive: true, force: true });
  await cp(`${staging}/docs`, `${root}/portal/docs`, { recursive: true });
  const manualZip = `${root}/portal/downloads/forge-manuals.zip`;
  const projectZip = `${root}/portal/downloads/forge-academy.zip`;
  await rm(manualZip, { force: true });
  await rm(projectZip, { force: true });
  execFileSync('zip', ['-qr', manualZip, 'docs'], { cwd: staging });
  execFileSync('zip', ['-qr', projectZip, ...entries], { cwd: staging });
  await rm(`${root}/dist`, { recursive: true, force: true });
  await cp(`${staging}/portal`, `${root}/dist`, { recursive: true });
  await cp(`${staging}/docs`, `${root}/dist/docs`, { recursive: true });
  await mkdir(`${root}/dist/downloads`, { recursive: true });
  await cp(manualZip, `${root}/dist/downloads/forge-manuals.zip`);
  await cp(projectZip, `${root}/dist/downloads/forge-academy.zip`);
  await writeFile(`${root}/dist/runtime.js`, "export const runtimeMode = 'static';\n");
  console.log(`Built static portal and source/manual downloads (${entries.length} source entries; personal data excluded).`);
} finally {
  await rm(staging, { recursive: true, force: true });
}
