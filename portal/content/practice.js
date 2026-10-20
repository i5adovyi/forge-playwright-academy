/** Executable drills complement (and do not replace) the 116 lesson challenges.
 * Lesson IDs refer to curriculum.js; paths are relative to the downloaded repository.
 */
const drill = (number, title, file, lessons) => ({
  id: `EX-${String(number).padStart(2, '0')}`, title,
  file: `exercises/${file}.spec.ts`, lessons,
});
export const practiceTracks = [
  drill(1, 'Your first observable outcome', '01-foundations', ['01-02', '02-01']),
  drill(2, 'Search like a user', '01-foundations', ['02-02', '02-04']),
  drill(3, 'Empty results and recovery', '01-foundations', ['01-05', '02-04']),
  drill(4, 'Category + sort', '01-foundations', ['02-04']),
  drill(5, 'Unavailable products', '01-foundations', ['02-02']),
  drill(6, 'Cart lifecycle', '01-foundations', ['02-02', '02-05']),
  drill(7, 'Discount arithmetic', '01-foundations', ['02-05', '03-01', '04-05']),
  drill(8, 'Keyboard activation and focus return', '01-foundations', ['03-05']),
  drill(9, 'Catalog contract', '02-api', ['01-03', '04-01']),
  drill(10, 'Query parameters', '02-api', ['04-02']),
  drill(11, 'Create then update', '02-api', ['04-03']),
  drill(12, 'Boundary table', '02-api', ['01-05', '04-03', '05-03']),
  drill(13, 'Authentication contract', '02-api', ['02-03', '04-04']),
  drill(14, 'Order lifecycle', '02-api', ['04-05']),
  drill(15, 'Session isolation', '02-api', ['03-03', '04-04', '05-01', '05-04']),
  drill(16, 'Malformed and missing data', '02-api', ['04-01', '04-03']),
  drill(17, 'Hybrid checkout', '03-advanced', ['02-05', '04-05', '05-02', '08-02']),
  drill(18, 'Service outage', '03-advanced', ['03-02', '08-03']),
  drill(19, 'Deterministic empty state', '03-advanced', ['03-02']),
  drill(20, 'Receipt download', '03-advanced', ['03-04']),
  drill(21, 'Mobile commerce', '03-advanced', ['03-05', '05-05', '06-04']),
  drill(22, 'Stock error preserves state', '03-advanced', ['02-05', '04-03', '08-03']),
  drill(23, 'Observe network without racing', '03-advanced', ['01-04', '03-01', '06-02']),
  drill(24, 'Reset and recovery', '03-advanced', ['03-03', '05-01', '08-02']),
];
const skill = (number, title, lessons) => {
  const id = `SK-${String(number).padStart(2, '0')}`;
  return {id, title, lessons, file:'skills/practice.spec.ts', solution:'skills/worked.spec.ts', command:`npm run test:skills:practice -- --grep ${id}`};
};
export const skillTracks = [
  skill(1, 'Timer boundary', ['03-04']),
  skill(2, 'Reuse cookie authentication', ['03-03', '04-04', '05-01']),
  skill(3, 'Upload and inspect a file', ['03-04']),
  skill(4, 'Scope an iframe locator', ['02-02', '03-04']),
  skill(5, 'Capture a popup', ['03-04']),
  skill(6, 'Accept and dismiss a dialog', ['03-04']),
];
const qualityDrill = (prefix, number, title, track, lessons, script) => {
  const id = `${prefix}-${String(number).padStart(2, '0')}`;
  return {
    id, title, lessons,
    file: `quality/${track}/practice.spec.ts`,
    solution: `quality/${track}/worked.spec.ts`,
    command: `npm run test:${script}:practice -- --grep ${id}`,
  };
};
export const accessibilityTracks = [
  qualityDrill('AX', 1, 'Scoped scan and complete evidence', 'accessibility', ['03-05', '03-06'], 'a11y'),
  qualityDrill('AX', 2, 'Detect and repair a missing accessible name', 'accessibility', ['03-06'], 'a11y'),
  qualityDrill('AX', 3, 'Keyboard focus and modal recovery', 'accessibility', ['03-05', '03-07'], 'a11y'),
  qualityDrill('AX', 4, 'Form states and contrast detection', 'accessibility', ['02-03', '03-07'], 'a11y'),
];
export const visualTracks = [
  qualityDrill('VS', 1, 'Stable desktop baseline', 'visual', ['03-05', '06-06'], 'visual'),
  qualityDrill('VS', 2, 'Mobile expanded summary', 'visual', ['06-04', '06-06'], 'visual'),
  qualityDrill('VS', 3, 'Mask only volatile metadata', 'visual', ['06-07'], 'visual'),
  qualityDrill('VS', 4, 'Review a controlled visual regression', 'visual', ['06-07', '08-03'], 'visual'),
];

const stateDrill = (number, title, lessons) => {
  const id = `FS-${String(number).padStart(2, '0')}`;
  return {id, title, lessons, file:'state/practice.spec.ts', solution:'state/worked.spec.ts', command:`npm run test:state:practice -- --grep ${id}`};
};
export const stateTracks = [
  stateDrill(1, 'Trace fixture setup and reverse teardown', ['05-01', '05-06']),
  stateDrill(2, 'Worker lifetime, fresh test resources', ['05-04', '05-07']),
  stateDrill(3, 'Options, automatic evidence, and lazy fixtures', ['05-08']),
  stateDrill(4, 'Two tabs, one context', ['03-08', '03-09']),
  stateDrill(5, 'Separate contexts, separate storage', ['03-08', '03-09']),
  stateDrill(6, 'Storage snapshots and IndexedDB', ['03-09', '03-10']),
  stateDrill(7, 'Restore tab state before application startup', ['03-10']),
  stateDrill(8, 'Browser-owned and standalone API cookies', ['03-08', '04-04', '05-09']),
  stateDrill(9, 'Copied authentication is not a cloned account', ['03-10', '05-09', '05-10']),
  stateDrill(10, 'An authenticated fixture with a guest control', ['05-06', '05-09', '05-10']),
];
export const docsLessonIds = ['03-08', '03-09', '03-10', '05-06', '05-07', '05-08', '05-09', '05-10'];

const apiDrill = (number, title, lessons) => {
  const id = `AP-${String(number).padStart(2, '0')}`;
  return {id, title, lessons, file:'api-workshop/practice.spec.ts', solution:'api-workshop/worked.spec.ts', command:`npm run test:api:practice -- --grep ${id}`};
};
export const apiTracks = [
  apiDrill(1, 'Request policy and response ownership', ['04-01', '04-06']),
  apiDrill(2, 'JSON bytes and rejected-body boundaries', ['04-03', '04-06']),
  apiDrill(3, 'Receipts belong to a session', ['04-04', '04-05']),
  apiDrill(4, 'Orders remain immutable after later purchases', ['04-05']),
];
export const apiLessonIds = ['04-01', '04-02', '04-03', '04-04', '04-05', '04-06'];

const uiDrill = (number, title, lessons) => {
  const id = `UI-${String(number).padStart(2, '0')}`;
  return {id, title, lessons, file:'ui-workshop/practice.spec.ts', solution:'ui-workshop/worked.spec.ts', command:`npm run test:ui:practice -- --grep ${id}`};
};
export const uiTracks = [
  uiDrill(1, 'Native validation, server rejection, and correction', ['02-03']),
  uiDrill(2, 'Guest recovery through a complete UI purchase', ['02-05']),
  uiDrill(3, 'Failed checkout preserves input and retries once', ['02-05', '03-02', '03-11']),
  uiDrill(4, 'The newest catalog selection survives an older response', ['02-04', '03-01', '03-02', '03-11']),
];
export const uiLessonIds = ['02-01', '02-02', '02-03', '02-04', '02-05', '03-01', '03-02', '03-03', '03-04', '03-05', '03-11'];

// Nine assignments; DB-02 expands into 48 separately registered test cases.
const workplaceDrill = (id, title, folder, lesson, command, starter = 'practice.spec.ts', solution = 'worked.spec.ts') => ({
  id, title, lessons: [lesson], file: `workplace/${folder}/${starter}`,
  solution: `workplace/${folder}/${solution}`, command,
});
export const workplaceTracks = [
  workplaceDrill('IN-01', 'Find the rejected setup behind a UI timeout', 'incidents', '06-08', 'npm run test:incidents:practice -- --enable-starters --grep IN-01'),
  workplaceDrill('IN-02', 'Separate browser isolation from server ownership', 'incidents', '06-08', 'npm run test:incidents:practice -- --enable-starters --grep IN-02'),
  workplaceDrill('IN-03', 'Replace a premature snapshot with a proven transition', 'incidents', '06-08', 'npm run test:incidents:practice -- --enable-starters --grep IN-03'),
  workplaceDrill('CG-01', 'Reject missing required execution', 'gates', '06-09', 'npm run test:gates:practice -- --stage inventory --prove-gate', 'starter-inventory.mjs', 'worked-gate.mjs'),
  workplaceDrill('CG-02', 'Reject misleading success and malformed evidence', 'gates', '06-09', 'npm run test:gates:practice -- --stage outcomes --prove-gate', 'starter-outcomes.mjs', 'worked-gate.mjs'),
  workplaceDrill('RF-01', 'Extract page objects with two independent consumers', 'refactoring', '05-11', 'npm run test:refactoring:practice -- --grep RF-01'),
  workplaceDrill('RF-02', 'Preserve ownership and locators across rerenders', 'refactoring', '05-11', 'npm run test:refactoring:practice -- --grep RF-02'),
  workplaceDrill('DB-01', 'Build fresh defaults and independently owned overrides', 'builders', '05-12', 'npm run test:builders:practice -- --grep DB-01'),
  workplaceDrill('DB-02', 'Register a complete shipping validation matrix', 'builders', '05-12', 'npm run test:builders:practice -- --grep DB-02'),
];
export const workplaceLessonIds = ['06-08', '06-09', '05-11', '05-12'];
