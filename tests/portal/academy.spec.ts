import { test, expect } from '@playwright/test';

test('overview introduces the academy and opens the first lesson', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ship confidence. Not just tests.' })).toBeVisible();
  await page.getByRole('link', { name: 'Start your journey' }).click();
  await expect(page).toHaveURL(/#\/lesson\/01-01/);
  await expect(page.getByRole('heading', { name: 'The automation engineer’s mindset' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Put it into practice.' })).toBeVisible();
});

test('curriculum search and filters narrow real lesson content', async ({ page }) => {
  await page.goto('/#/curriculum');
  await expect(page.locator('.lesson-row')).toHaveCount(53);
  await page.getByLabel('Stage', { exact: true }).selectOption('api');
  await expect(page.locator('.lesson-row')).toHaveCount(6);
  await page.getByLabel('Search lessons', { exact: true }).fill('zz-no-match');
  await expect(page.getByText('No lessons match those filters.')).toBeVisible();
});

test('lesson notes, exercise checklists, and completion survive reload', async ({ page }) => {
  await page.goto('/#/lesson/01-01');
  await page.getByLabel('Your field notes').fill('An assertion needs a credible oracle.');
  await page.locator('.acceptance input').first().check();
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await page.reload();
  await expect(page.getByLabel('Your field notes')).toHaveValue('An assertion needs a credible oracle.');
  await expect(page.locator('.acceptance input').first()).toBeChecked();
  await expect(page.getByRole('button', { name: 'Completed · mark incomplete' })).toBeVisible();
  await page.getByRole('link', { name: 'My progress' }).click();
  await expect(page.locator('.metric-card').first()).toContainText('1 / 53');
});

test('quiz gives meaningful feedback and retains the chosen answer', async ({ page }) => {
  await page.goto('/#/lesson/01-01');
  await page.getByRole('button', { name: 'A. The button was clicked' }).click();
  await expect(page.locator('#quiz-feedback')).toContainText('Not quite.');
  await page.getByRole('button', { name: /C\. The returned order ID/ }).click();
  await expect(page.locator('#quiz-feedback')).toContainText('Correct.');
  await page.reload();
  await expect(page.getByRole('button', { name: /C\. The returned order ID/ })).toHaveAttribute('aria-pressed', 'true');
});

test('solutions stay hidden until deliberately revealed', async ({ page }) => {
  await page.goto('/#/lesson/01-01');
  const solution = page.locator('.solution-text').first();
  await expect(solution).not.toBeVisible();
  await page.getByText('Reveal the worked solution', { exact: true }).first().click();
  await expect(solution).toBeVisible();
});

test('global search finds relevant content and navigates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search academy' }).click();
  await page.getByLabel('Search lessons and resources').fill('HTTP');
  await expect(page.locator('.search-result').first()).toBeVisible();
  await page.locator('.search-result').first().click();
  await expect(page.locator('#search-dialog')).not.toBeVisible();
  await expect(page.locator('main h1')).toBeVisible();
});

test('resource format and price filters show only the selected shelf', async ({ page }) => {
  await page.goto('/#/library');
  await page.getByLabel('Resource type').selectOption('Book');
  const count = await page.locator('.resource-card').count();
  expect(count).toBeGreaterThan(0);
  for (const type of await page.locator('.resource-type').allTextContents()) expect(type).toBe('Book');
  await page.getByLabel('Search resources').fill('zz-no-match');
  await expect(page.getByText('Nothing on this shelf matches yet.')).toBeVisible();
});

test('all 53 lesson routes render without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/curriculum');
  const urls = await page.locator('.lesson-row').evaluateAll(links => links.map(a => a.getAttribute('href')!));
  for (const url of urls) {
    await page.goto('/'+url);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.exercise')).toHaveCount(2);
    await expect(page.locator('.quiz-option')).toHaveCount(3);
  }
  expect(errors).toEqual([]);
});

test('manual loads with copyable code and a downloadable original', async ({ page }) => {
  await page.goto('/#/manual/START-HERE');
  await expect(page.getByRole('heading', { name: 'Start here', exact: true })).toBeVisible();
  await expect(page.locator('.prose')).toContainText('npm');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download Markdown' }).click();
  expect((await download).suggestedFilename()).toBe('START-HERE.md');
});

test('export contains saved progress and invalid import is rejected', async ({ page }) => {
  await page.goto('/#/lesson/01-01');
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await page.goto('/#/progress');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export progress' }).click();
  const stream = await (await downloaded).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString()).completed).toEqual(['01-01']);
  await page.locator('#progress-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"wrong":true}')});
  await expect(page.getByRole('status')).toContainText('not a valid Forge');
  await expect(page.locator('.metric-card').first()).toContainText('1 / 53');
});

test('valid import restores notes and escapes user-supplied text', async ({ page }) => {
  await page.goto('/#/progress');
  page.on('dialog', dialog=>dialog.accept());
  await page.locator('#progress-file').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({completed:['01-01'],notes:{'01-01':'<img src=x onerror=alert(1)>'},checks:{},quizzes:{},lastLesson:'01-01'}))});
  await expect(page.getByRole('status')).toContainText('restored');
  await expect(page.locator('.metric-card').first()).toContainText('1 / 53');
  await expect(page.locator('main img')).toHaveCount(0);
  await page.goto('/#/lesson/01-01');
  await expect(page.getByLabel('Your field notes')).toHaveValue('<img src=x onerror=alert(1)>');
});

test('mobile navigation works without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ship confidence. Not just tests.' })).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'Learning path' }).click();
  await expect(page.locator('.lesson-row')).toHaveCount(53);
  await expect(page.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('skip to content preserves the lesson route and survives reload', async ({ page }) => {
  await page.goto('/#/lesson/02-01');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL(/#\/lesson\/02-01$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your first meaningful browser test', exact: true })).toBeVisible();
});

test('invalid encoded routes recover and legacy content fragments still render', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/lesson/%E0%A4%A');
  await expect(page.getByRole('heading', { name: 'That page is not in the workshop.' })).toBeVisible();
  await page.getByRole('link', { name: 'Open the learning path' }).click();
  await expect(page.locator('.lesson-row')).toHaveCount(53);
  await page.goto('/#main');
  await expect(page.getByRole('heading', { name: 'Ship confidence. Not just tests.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('continue learning resumes the last unfinished lesson', async ({ page }) => {
  await page.goto('/#/lesson/03-02');
  await page.getByRole('link', { name: 'Overview', exact: false }).click();
  await expect(page.getByRole('link', { name: 'Continue learning' })).toHaveAttribute('href', '#/lesson/03-02');
  await page.reload();
  await page.getByRole('link', { name: 'Continue learning' }).click();
  await expect(page.getByRole('heading', { name: 'Control the network, expose the edge cases', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await page.getByRole('link', { name: 'My progress' }).click();
  await expect(page.getByRole('link', { name: 'Continue learning' })).toHaveAttribute('href', '#/lesson/01-01');
});

test('an old failed manual request cannot replace the newly opened page', async ({ page }) => {
  let release!: () => void;
  let requested!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  const intercepted = new Promise<void>(resolve => { requested = resolve; });
  await page.route('**/docs/START-HERE.md', async route => {
    requested();
    await pending;
    await route.fulfill({ status: 503, body: 'Temporarily unavailable' });
  });
  await page.goto('/#/manual/START-HERE');
  await intercepted;
  await page.getByRole('link', { name: 'Learning path' }).click();
  const failedResponse = page.waitForResponse(response => response.url().endsWith('/docs/START-HERE.md'));
  release();
  await (await failedResponse).finished();
  // Let the browser render the fetch completion before checking the active route.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
  await expect(page.getByRole('heading', { name: 'From curious to capable.' })).toBeVisible();
  await expect(page.locator('.lesson-row')).toHaveCount(53);
});

test('import discards unknown exercise checks and impossible quiz choices', async ({ page }) => {
  await page.goto('/#/progress');
  page.on('dialog', dialog => dialog.accept());
  await page.locator('#progress-file').setInputFiles({
    name: 'progress.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      completed: ['01-01', '01-01', 'fake-lesson'],
      checks: { 'nonexistent/check/0': true },
      quizzes: { '01-01': 9, '02-01': -1 },
      notes: {}, lastLesson: 'missing',
    })),
  });
  await expect(page.getByRole('status')).toContainText('restored');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('forge-academy-v1')!));
  expect(stored.completed).toEqual(['01-01']);
  expect(stored.checks).toEqual({});
  expect(stored.quizzes).toEqual({});
  expect(stored.lastLesson).toBeNull();
});

test('closed mobile navigation is outside the keyboard path and restores focus after Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Tab');
  const menu = page.getByRole('button', { name: 'Toggle navigation' });
  await expect(menu).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close navigation' })).toBeFocused();
  await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).toBeVisible();
  // The background cannot steal focus while the mobile navigation is open.
  await page.getByRole('button', { name: 'Search academy' }).evaluate((button: HTMLButtonElement) => button.focus());
  await expect(page.getByRole('button', { name: 'Close navigation' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('lesson and lab practice maps connect learners to runnable starter commands', async ({ page }) => {
  await page.goto('/#/lesson/02-01');
  const exercise = page.locator('[data-practice-id="EX-01"]');
  await exercise.locator('summary').first().click();
  await expect(exercise).toContainText('exercises/01-foundations.spec.ts');
  await expect(exercise.locator('pre')).toHaveText('npm run test:exercises -- --grep "EX-01"');
  await exercise.getByText('Where to compare your solution').click();
  await expect(exercise).toContainText('solutions/01-foundations.spec.ts');
  await page.goto('/#/lab');
  await expect(page.locator('[data-practice-id^="EX-"]')).toHaveCount(24);
  await expect(page.locator('[data-practice-id^="SK-"]')).toHaveCount(6);
  await expect(page.getByRole('link', { name: 'Open browser skills lab' })).toHaveAttribute('href', '/skills/');
  const skill = page.locator('[data-practice-id="SK-03"]');
  await skill.locator('summary').first().click();
  await expect(skill.locator('pre')).toHaveText('npm run test:skills:practice -- --grep SK-03');
  await skill.getByRole('link', { name: /03-04 · Events/ }).click();
  await expect(page).toHaveURL(/#\/lesson\/03-04$/);
  await expect(page.locator('[data-practice-id="SK-03"]')).toBeVisible();
});

test('accessibility and visual workshops connect lessons, starters, manuals, and local labs', async ({ page }) => {
  await page.goto('/#/lab');
  await expect(page.locator('[data-practice-id^="AX-"]')).toHaveCount(4);
  await expect(page.locator('[data-practice-id^="VS-"]')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Launch accessibility lab' })).toHaveAttribute('href', '/quality/accessibility/');
  await expect(page.getByRole('link', { name: 'Launch visual lab' })).toHaveAttribute('href', '/quality/visual/');
  await page.getByRole('link', { name: 'Start accessibility lessons' }).click();
  await expect(page).toHaveURL(/#\/lesson\/03-06$/);
  await expect(page.locator('[data-practice-id="AX-01"]')).toBeVisible();
  await page.goto('/#/lab');
  await page.getByRole('link', { name: 'Open visual workshop' }).click();
  await expect(page.locator('main h1')).toHaveText('Visual baseline workshop');
  await expect(page.locator('.prose')).toContainText('npm run test:visual');
  await expect(page.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute('href', './docs/VISUAL-BASELINES.md');
});

test('PW Docs track connects shared lesson progress, the workbook, and all ten state drills', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'PW Docs track', exact: true }).click();
  await expect(page.locator('main h1')).toHaveText('Fixtures. Contexts. State.');
  await expect(page.locator('.docs-lessons .lesson-row')).toHaveCount(8);
  await expect(page.locator('.docs-source')).toHaveCount(6);
  await expect(page.locator('main')).toContainText('npm run test:state:practice -- --grep FS-04');
  await expect(page.locator('main')).toContainText('A skipped result is unfinished work.');
  await expect(page.locator('main')).toContainText('npm run test:state:auth:gate');
  await expect(page.getByRole('link', { name: 'Open the state workbench' })).toHaveAttribute('href', '/state/');
  await page.getByRole('link', { name: 'Begin the track' }).click();
  await expect(page).toHaveURL(/#\/lesson\/03-08$/);
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await page.goto('/#/lesson/03-10');
  const trackNavigation = page.getByRole('navigation', { name: 'PW Docs lesson navigation' });
  await expect(trackNavigation.getByRole('link', { name: 'PW Docs overview' })).toHaveAttribute('href', '#/docs');
  await expect(page.getByRole('link', { name: 'Next lesson', exact: false })).toHaveAttribute('href', '#/lesson/04-01');
  await trackNavigation.getByRole('link', { name: 'Next in this track' }).click();
  await expect(page).toHaveURL(/#\/lesson\/05-06$/);
  await page.goto('/#/lesson/05-10');
  await expect(page.getByRole('navigation', { name: 'PW Docs lesson navigation' })
    .getByRole('link', { name: 'Review your evidence' })).toHaveAttribute('href', '#/manual/FIXTURES-AND-STATE');
  await page.goto('/#/docs');
  await expect(page.locator('.docs-lessons .lesson-row[href="#/lesson/03-08"] .lesson-status')).toHaveClass(/done/);
  await page.getByRole('link', { name: 'Read the complete workbook' }).click();
  await expect(page.locator('main h1')).toHaveText('Fixtures & browser state');
  await expect(page.locator('.prose')).toContainText('npm run test:state');
  await expect(page.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute('href', './docs/FIXTURES-AND-STATE.md');
  await page.goto('/#/lab');
  await expect(page.locator('[data-practice-id^="FS-"]')).toHaveCount(10);
  const starter = page.locator('[data-practice-id="FS-06"]');
  await starter.locator('summary').first().click();
  await expect(starter.locator('pre')).toHaveText('npm run test:state:practice -- --grep FS-06');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/docs');
  await expect(page.locator('main h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('API track connects six lessons, twelve drills, shared progress, and its workbook', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'API testing track', exact: true }).click();
  await expect(page.locator('main h1')).toHaveText('Test the contract. Prove the state.');
  await expect(page.locator('.api-lessons .lesson-row')).toHaveCount(6);
  await expect(page.locator('[data-practice-id^="EX-"]')).toHaveCount(8);
  await expect(page.locator('[data-practice-id^="AP-"]')).toHaveCount(4);
  await expect(page.locator('main')).toContainText('A skipped result is unfinished work.');
  await page.getByRole('link', { name: 'Begin the API track' }).click();
  await expect(page).toHaveURL(/#\/lesson\/04-01$/);
  await page.getByRole('button', { name: 'Mark lesson complete' }).click();
  await page.getByRole('navigation', { name: 'API lesson navigation' })
    .getByRole('link', { name: 'API track overview' }).click();
  await expect(page.locator('.api-lessons .lesson-row[href="#/lesson/04-01"] .lesson-status')).toHaveClass(/done/);
  const drill = page.locator('[data-practice-id="AP-02"]');
  await drill.locator('summary').first().click();
  await expect(drill.locator('pre')).toHaveText('npm run test:api:practice -- --grep AP-02');
  await page.getByRole('link', { name: 'Read the API workbook' }).click();
  await expect(page.locator('main h1')).toHaveText('API testing workbook');
  await expect(page.locator('.prose')).toContainText('npm run test:api:workshop');
  await page.goto('/#/lesson/04-06');
  await page.getByRole('navigation', { name: 'API lesson navigation' })
    .getByRole('link', { name: 'Review your API evidence' }).click();
  await expect(page).toHaveURL(/#\/manual\/API-TESTING$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/api');
  await expect(page.locator('main h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
