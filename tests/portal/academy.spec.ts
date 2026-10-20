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
  await expect(page.locator('.lesson-row')).toHaveCount(40);
  await page.getByLabel('Stage', { exact: true }).selectOption('api');
  await expect(page.locator('.lesson-row')).toHaveCount(5);
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
  await expect(page.locator('.metric-card').first()).toContainText('1 / 40');
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

test('all 40 lesson routes render without runtime errors', async ({ page }) => {
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
  await expect(page.locator('.metric-card').first()).toContainText('1 / 40');
});

test('valid import restores notes and escapes user-supplied text', async ({ page }) => {
  await page.goto('/#/progress');
  page.on('dialog', dialog=>dialog.accept());
  await page.locator('#progress-file').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({completed:['01-01'],notes:{'01-01':'<img src=x onerror=alert(1)>'},checks:{},quizzes:{},lastLesson:'01-01'}))});
  await expect(page.getByRole('status')).toContainText('restored');
  await expect(page.locator('.metric-card').first()).toContainText('1 / 40');
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
  await expect(page.locator('.lesson-row')).toHaveCount(40);
  await expect(page.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
