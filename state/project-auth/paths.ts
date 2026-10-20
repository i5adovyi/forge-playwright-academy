import { join } from 'node:path';

// The launcher creates one directory per invocation and passes it to every worker.
// Do not generate an ID independently in each worker: they must agree on the path.
const directory = process.env.FORGE_AUTH_RUN_DIR;
if (!directory) throw new Error('Run this workshop with npm run test:state:auth.');
export const runDirectory = directory;
export const authFile = join(runDirectory, '.auth', 'member.json');
