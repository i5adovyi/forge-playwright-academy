import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { openProgressStore, decodeExport, MAX_BODY_BYTES } from './store.mjs';

const [command, ...args] = process.argv.slice(2);
const usage = 'Usage: node local-data/cli.mjs status | export /absolute/backup.json | import /absolute/backup.json --expected-revision N';
let store;
try {
  if (command === 'status' && args.length === 0) {
    store = openProgressStore();
    const { progress, ...status } = store.read();
    console.log(JSON.stringify({ ...status, completedLessons: progress.completed.length, notes: Object.keys(progress.notes).length }, null, 2));
  } else if (command === 'export' && args.length === 1 && path.isAbsolute(args[0])) {
    store = openProgressStore();
    const current = store.read();
    const exported = { ...current.progress, format: 'forge-academy-v1', exportedAt: new Date().toISOString() };
    // Compact encoding preserves the same byte ceiling as the HTTP record.
    await writeFile(args[0], JSON.stringify(exported) + '\n', { flag: 'wx', mode: 0o600 });
    console.log(`Exported revision ${current.revision} to ${args[0]}. Keep this private backup outside the repository.`);
  } else if (command === 'import' && args.length === 3 && path.isAbsolute(args[0]) && args[1] === '--expected-revision' && /^\d+$/.test(args[2]) && Number.isSafeInteger(Number(args[2]))) {
    if ((await stat(args[0])).size > MAX_BODY_BYTES) throw new Error('Backup exceeds 2 MiB.');
    const progress = decodeExport(JSON.parse(await readFile(args[0], 'utf8')));
    store = openProgressStore();
    const result = store.write({ databaseId: store.databaseId, baseRevision: Number(args[2]), progress });
    if (result.conflict) throw new Error(`Import stopped: current revision is ${result.revision}. Export it first, review both records, then repeat with the intended revision.`);
    console.log(`Imported progress as revision ${result.revision}. Database identity remains ${result.databaseId}.`);
  } else throw new Error(usage);
} catch (error) {
  console.error(error.code === 'EEXIST' ? 'Export stopped: that backup file already exists. Choose a new filename.' :
    error instanceof SyntaxError ? 'Import stopped: invalid JSON.' : error.message);
  process.exitCode = 1;
} finally {
  store?.close();
}
