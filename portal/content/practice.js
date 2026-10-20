/** Executable drills complement (and do not replace) the 80 lesson challenges.
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
  drill(6, 'Cart lifecycle', '01-foundations', ['02-05']),
  drill(7, 'Discount arithmetic', '01-foundations', ['02-05', '04-05']),
  drill(8, 'Keyboard-only dialog', '01-foundations', ['03-05']),
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
