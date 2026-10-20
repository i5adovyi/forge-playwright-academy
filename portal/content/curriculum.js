/** Original Forge Academy curriculum. Snippets are lesson fragments unless imports are shown.
 * Run exercises against the local lab only. Reference contract: docs/lab-api.md.
 * Sources checked 2026-10-20; documentation links remain the authority for installed versions.
 */
export const stages = [
  {id:'foundations',title:'Build your foundation',subtitle:'Think like a test engineer',color:'#a3e635',description:'Turn product risks into evidence. Learn the TypeScript and async patterns that make browser automation understandable.'},
  {id:'first-ui',title:'Your first UI suite',subtitle:'From a click to a trustworthy check',color:'#7dd3fc',description:'Discover the live shop, write accessible locators, exercise forms, and protect a complete customer journey.'},
  {id:'resilient-ui',title:'Make it resilient',subtitle:'Own time, network, and browser state',color:'#c4b5fd',description:'Replace fragile waits with observable conditions. Control dependencies and build useful visual and accessibility checks.'},
  {id:'api',title:'Go below the UI',subtitle:'HTTP contracts and state transitions',color:'#fbbf24',description:'Test the real API, explore invalid inputs, isolate sessions, and combine fast setup with meaningful browser evidence.'},
  {id:'architecture',title:'Engineer your framework',subtitle:'Scale without a maze of abstractions',color:'#f9a8d4',description:'Create focused fixtures, typed helpers, data builders, project boundaries, and parallel-safe tests.'},
  {id:'delivery',title:'Ship reliable signals',subtitle:'CI, traces, and failure economics',color:'#5eead4',description:'Diagnose failures from artifacts, choose a useful browser matrix, and make CI a credible release signal.'},
  {id:'agents',title:'Work with AI agents',subtitle:'Delegate the labor. Keep the judgment.',color:'#a5b4fc',description:'Use official Playwright agents, write executable plans, review generated code, and prevent false-green repairs.'},
  {id:'capstone',title:'Prove your craft',subtitle:'A portfolio worth showing',color:'#fb923c',description:'Deliver a risk-based checkout suite, investigate defects, publish evidence, and defend your engineering decisions.'}
];
const R = (title,path) => ({title,url:path.startsWith('http')?path:`https://playwright.dev/docs/${path}`});
const E = (id,title,brief,steps,acceptance,hint,solution) => ({id,title,brief,steps,acceptance,hint,solution});
const S = (heading,body,code) => ({heading,body,...(code?{code}:{})});
const Q = (question,options,answer,explanation) => ({question,options,answer,explanation});
const L = (id,stage,title,summary,minutes,tags,objectives,sections,exercises,quiz,resources) => ({id,stage,title,summary,minutes,level:Number(id.slice(0,2))<3?'Foundation':Number(id.slice(0,2))<6?'Intermediate':'Advanced',tags,objectives,sections,exercises,quiz,resources});
export const lessons = [
L('01-01','foundations','The automation engineer’s mindset','Choose checks that answer a business question before choosing a tool.',35,['strategy','risk'],
['Separate a test action from a test oracle','Prioritize checkout risks by impact and uncertainty','Describe evidence a reviewer can reproduce'],[
S('Start with a claim','A passing script proves only the claims it actually checks. Clicking Add to cart proves very little if you never inspect the cart. A useful claim is specific: adding two units of an available product increases the cart quantity by two and calculates the matching line total. The action creates the situation; the oracle tells you whether the result is acceptable.'),
S('Choose the cheapest useful layer','Check quantity validation through the API because it exposes exact status codes and state. Keep one browser journey to demonstrate that a customer can discover a product and complete checkout. Add a UI-specific check for a visible validation message. These checks answer different questions; duplicating every API input in every browser adds cost without proportional confidence.'),
S('Build an evidence ledger','For each risk, record a rule, a setup, an observation, and a remaining blind spot. Risk scores guide discussion; they are not objective measurements. Revisit them when the product changes.',`// A test title is a claim, not a sequence of clicks.
// Weak: "click product and checkout"
// Strong: "an empty cart cannot create an order"
// Evidence: rejected response AND unchanged order list.`)
],[
E('01-01-a','Create a checkout risk map','Write six concrete risks for the Forge Shop.', ['Inspect the shop and API contract.','Score impact and likelihood from 1–3.','Assign each risk a UI, API, or manual check.'],['Six rules with observable outcomes.','The three highest risks have a reason for their rank.'], 'Include one money risk, one state risk, and one usability risk.','Example: wrong total → impact 3, likelihood 2 → API arithmetic check plus one UI total check. Duplicate order → 3×2 → explicit repeated-submit experiment. Keyboard checkout → 2×2 → manual exploration and focus assertions.'),
E('01-01-b','Disprove a green check','Design a test that would pass despite a broken cart, then repair its oracle.',['Write an action-only scenario.','Name a plausible implementation bug it misses.','Add assertions that distinguish that bug.'],['The bug and the missing observation are explicit.','The repaired check fails for the imagined bug.'],'A button click can succeed while the server rejects the request.','Weak: click Add to cart, then end. Better: assert the selected product and quantity in the cart, then read /api/cart in the same session and check the persisted quantity.')
],Q('Which is strongest evidence that checkout persisted an order?',['The button was clicked','A success toast appeared','The returned order ID exists in the session’s order list'],2,'The last observation verifies persistence. A toast alone can be rendered before a failed write.'),[R('Playwright best practices','best-practices')]),
L('01-02','foundations','Set up a reproducible workshop','Understand the runner, the browser binaries, and your local practice target.',40,['setup','CLI'],
['Run one local test and find its report','Explain package versus browser installation','Record enough environment detail for another learner'],[
S('Know the moving parts','This repository contains a learning portal, a practice shop, and a Playwright test suite. Its Chromium browser project is named ui; chromium is the browser installation name. The Node server serves the target application; Playwright drives browsers and sends HTTP requests. Installing the JavaScript package does not guarantee that the matching browser binaries are installed. Use the repository scripts and lockfile as the starting point. If port 4173 is occupied, use the same PORT value for the server and test command, for example PORT=14827 npm run dev and PORT=14827 npm test.'),
S('Prerequisites you can verify','Use Node 22 or newer and run commands from the folder containing package.json. Check node --version, npm --version, and git status before changing files. JavaScript objects, functions, and arrays are enough to start; lessons 01-03 and 01-04 supply the test-specific TypeScript and promise concepts. Run npm run typecheck separately: Playwright transforms TypeScript but does not replace compiler validation.'),
S('Use a small feedback loop','Start with Chromium and one test file. Read the command output before opening the HTML report. A connection-refused error points to the target server, a missing-executable error points to browser installation, and a locator timeout usually means the browser reached the app but the expected state did not appear.',`npm ci
npx playwright install chromium
npm run dev
# In a second terminal, inspect the scripts in package.json.
npx playwright test --list
npx playwright test --project=ui
npx playwright show-report`),
S('Capture a baseline','Record Node version, Playwright version, operating system, commit, and the exact command. Baseline evidence makes later debugging much easier. Never use a global Playwright installation to bypass an unknown local version; use the project dependency.')
],[
E('01-02-a','First reproducible run','Run one existing reference test and retain its command and result.',['Install dependencies and Chromium.','Start the app or let webServer start it.','Run one listed test and open its report.'],['One real test passes.','You can identify the spec path and project.'],'Use --list to discover names instead of guessing.','Run npx playwright test --list; choose a returned spec and run npx playwright test path/to/spec --project=ui. Record the command and the report summary.'),
E('01-02-b','Classify setup failures','Produce and diagnose a harmless configuration error.',['Run npx playwright test --list --project=does-not-exist.','Read the unknown-project error and available names.','Run npx playwright test --list --project=ui and explain why the correction works.'],['The failed and corrected commands are recorded.','No assertion, dependency, or browser installation is changed.'],'The supplied webServer starts the app automatically; stopping a manual server is not a reliable way to cause connection refusal.','Unknown project: correct the CLI name to ui, which selects Chromium in this repository. Distinguish this from connection refused (target unavailable) and executable missing (browser binary absent). Do not delete browser binaries or break shared configuration to manufacture these errors.')
],Q('What does npx playwright install chromium install?',['Your app dependencies','The browser build expected by the local Playwright version','A production Chrome extension'],1,'Browser binaries are distinct from the JavaScript package and your target app.'),[R('Installation','intro'),R('Running tests','running-tests')]),
L('01-03','foundations','TypeScript for people who test','Model useful inputs and let types expose mistakes before a browser starts.',45,['TypeScript','data'],
['Use unions and typed objects for test data','Distinguish compile-time checks from runtime validation','Avoid accidental mutation of shared data'],[
S('Types are executable documentation','A quantity should be a number, and a product identifier should have a deliberate representation. Types catch passing "two" into a number parameter while you edit. They do not prove that a server response matches the declared shape: a TypeScript assertion disappears at runtime. Inspect JSON before trusting it.'),
S('Model scenarios, not every implementation detail','Start with the fields the test needs. A small typed scenario table is easier to review than an elaborate domain hierarchy. Use literal unions for expected categories or outcome labels, and return fresh objects from builders so tests cannot mutate one another’s data.',`type QuantityCase = { label: string; quantity: number; schemaValid: boolean };
const cases: QuantityCase[] = [
  { label: 'minimum', quantity: 1, schemaValid: true },
  { label: 'zero', quantity: 0, schemaValid: false },
  { label: 'fraction', quantity: 1.5, schemaValid: false },
];
const makeCase = (quantity = 1): QuantityCase =>
  ({ label: 'custom', quantity, schemaValid:
    Number.isInteger(quantity) && quantity >= 1 && quantity <= 99 });
// Schema validity is not purchase success: p1 stock is only 12.`),
S('Keep negative data possible','A strongly typed API helper can make malformed requests impossible to express. That is useful for happy-path setup but inconvenient for contract testing. Send intentionally malformed payloads directly through the request fixture, with a clear test title. Do not weaken every helper to any just to accommodate one negative case.')
],[
E('01-03-a','Build a quantity matrix','Create a typed table for 1, 0, -1, 1.5 and a documented upper boundary.',['Define a case type.','Name each boundary.','Write expected validity separately from the value.'],['Cases are readable without execution.','The upper boundary is taken from docs/lab-api.md.'],'Separate the quantity schema ceiling from product stock.','Use {label,quantity,expectedStatus,expectedCode} entries for p1. Quantities 1 and 12 succeed; 13 and 99 satisfy the 1–99 schema but return 409 INSUFFICIENT_STOCK; 100, 0, -1 and 1.5 return 400 INVALID_QUANTITY. The schema ceiling is not an available purchase quantity in this catalog.'),
E('01-03-b','Expose a false type promise','Show why casting JSON is not validation.',['Create an object with price as a string.','Cast it through unknown to a price-bearing type.','Add a runtime assertion that catches the mismatch.'],['The example explains why compilation can pass.','The runtime check rejects the malformed value.'],'typeof is enough for the first exercise.','const raw: unknown = { price: "49" }; const typed = raw as {price:number}; expect(typeof typed.price).toBe("number"); // fails: the cast did not convert the data.')
],Q('What does response as Product do at runtime?',['Validates every field','Converts field values','Nothing; it only changes TypeScript’s view'],2,'Use runtime assertions or a schema validator when you need to validate untrusted JSON.'),[R('TypeScript support','test-typescript'),R('TypeScript handbook','https://www.typescriptlang.org/docs/handbook/intro.html')]),
L('01-04','foundations','Async without superstition','Understand promises, sequencing, and the failures caused by missing await.',45,['async','JavaScript'],
['Sequence dependent browser operations','Use concurrency only for independent work','Explain why async forEach is misleading'],[
S('A promise is work in progress','Most Playwright actions return promises. Without await, the test can reach an assertion or finish before the action completes. Await expresses dependency: navigation must finish before you can inspect its resulting state. It is not a sleep and does not imply a fixed duration.'),
S('Choose sequencing deliberately','Use for...of for actions that share a page or depend on prior state. Promise.all is useful for independent API reads, but simultaneous clicks on one UI create a race. Array.forEach ignores the promises returned by its callback, so the outer test does not wait for that work.',`// Sequential, predictable interactions:
for (const term of ['keyboard', 'mouse']) {
  await page.getByRole('searchbox', { name: 'Search products' }).fill(term);
  await expect(page.getByRole('searchbox', { name: 'Search products' })).toHaveValue(term);
}
// Bootstrap cookie-only sessions before concurrent first requests.
// With the supplied fixture, a unique x-lab-session also fixes identity.
expect((await request.get('/api/session')).status()).toBe(200);
// Independent reads may now run together:
const [products, cart] = await Promise.all([
  request.get('/api/products'), request.get('/api/cart')
]);`),
S('Make the failure explainable','A missing await can appear intermittent because execution timing varies. Find the dependency error before adding retries. In reviews, scan every Playwright action and async assertion for an await or an intentionally returned promise.')
],[
E('01-04-a','Repair an async loop','Rewrite a loop that fills a search field using forEach(async ...).',['Create the broken loop with two search terms.','Rewrite using for...of.','Explain which promise the test now waits for.'],['Each fill and assertion is awaited.','No arbitrary timeout is added.'],'The problem is the callback contract of forEach.','for (const term of terms) { await search.fill(term); await expect(search).toHaveValue(term); } The test now waits at each statement; forEach itself returns undefined.'),
E('01-04-b','Design a concurrency boundary','Choose which operations may run in Promise.all.',['List two GET requests and two cart mutations.','Run the independent reads together.','Keep state-changing operations sequential and justify why.'],['Read results are checked independently.','No order-dependent mutation races exist.'],'Independent means neither operation needs the other’s outcome.','GET products and GET cart can run concurrently in a stable session. Reset, add item, then inspect cart must be sequenced because each establishes the next precondition.')
],Q('Why is forEach(async item => ...) dangerous in a test?',['It always runs sequentially','forEach does not await callback promises','Playwright forbids arrays'],1,'Use for...of when each iteration must finish, or explicitly await Promise.all for truly independent operations.'),[R('Writing tests','writing-tests'),R('MDN async functions','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function')]),
L('01-05','foundations','Test design that catches real bugs','Use boundaries, partitions, and state transitions instead of accumulating random examples.',50,['test-design','boundaries'],
['Derive cases from a stated rule','Cover meaningful state transitions','Explain what a passing test does not prove'],[
S('Partition the input space','For a quantity rule requiring a positive integer, useful partitions include valid integers, zero, negatives, fractions, strings, and missing fields. Test the contract’s exact boundaries. Ten arbitrary positive integers give weaker evidence than one valid value plus carefully chosen invalid classes.'),
S('State changes the meaning of an action','Checkout with an empty cart differs from checkout after login with stocked items. Draw states and transitions: guest/empty, guest/filled, signed-in/filled, ordered/empty. Attach an observation to every transition. Do not assume a second click is safe because the first succeeded.'),
S('Write small, falsifiable cases','A good case includes its precondition, operation, expected result, and state invariant. For invalid input, the invariant often matters most: the cart must remain unchanged after rejection.',`// Case design, before implementation:
// Given: isolated session, empty cart
// When: POST /api/cart with quantity 0
// Then: documented 4xx validation response
// And: GET /api/cart is still empty
// Counterexample caught: server returns 400 after mutating state`)
],[
E('01-05-a','Boundary card deck','Write eight cart cases without opening an editor.',['Read the quantity rule.','Cover valid, invalid, and missing values.','Include a post-request state assertion for each rejection.'],['Every case has a distinct reason to exist.','Boundary values match the actual contract.'],'Treat missing quantity separately from explicit zero.','For p1 use 1 and 12 as valid purchases; 13 and 99 return 409 INSUFFICIENT_STOCK, while 100 is 400 INVALID_QUANTITY. Add zero, fractional, string, missing quantity, and unknown product as distinct cases; missing quantity is 400 and unknown product is 404 here. Choose at least eight and assert the exact error code plus unchanged cart after every rejection.'),
E('01-05-b','Draw the checkout machine','Create a four-state diagram and choose the smallest useful suite.',['List guest/authenticated and empty/filled states.','Mark legal and rejected order transitions.','Select one UI journey and API checks for rejected transitions.'],['Every state has at least one tested transition.','Success and rejection both verify persisted state.'],'Ask which state is required before order creation.','Cover guest+filled rejection, authenticated+empty rejection, authenticated+filled success, then inspect empty cart and persisted order. Use API setup to avoid repeating login UI in every scenario.')
],Q('Which negative test is most complete?',['Assert 400 only','Assert rejection and unchanged cart','Catch any exception and pass'],1,'A rejected status does not prove that the server avoided partial mutation.'),[R('Best practices','best-practices')]),
L('02-01','first-ui','Your first meaningful browser test','Prove the catalog is useful, then deliberately make the test fail.',40,['UI','assertions'],
['Use page and expect fixtures','Write one meaningful business assertion','Interpret an intentional failing assertion'],[
S('Keep the first claim narrow','Start with catalog discovery. A successful page navigation is only setup; the claim is that the customer can find a known product. Use an accessible product article and assert its name or purchase control. Keep the test independent of login and cart so a catalog failure is easy to diagnose.'),
S('Read a test as a sentence','The fixture supplies an isolated page. Navigation establishes location. The locator identifies the product through its accessible name. The assertion waits for the expected state and reports a useful mismatch if it never arrives.',`import { test, expect } from '@playwright/test';
test('catalog offers Studio Headphones', async ({ page }) => {
  await page.goto('/lab/');
  const product = page.getByRole('article', { name: 'Studio Headphones', exact: true });
  await expect(product).toBeVisible();
  await expect(product.getByRole('button', { name: 'Add Studio Headphones to cart' })).toBeEnabled();
});`),
S('A controlled failure is part of learning','Change the expected product to a nonexistent name and inspect the report. A test you have only seen green may contain a weak assertion. Restore the intended value after the experiment. This is a lightweight way to check that your oracle can detect an error.')
],[
E('02-01-a','Catalog smoke test','Write a test that verifies one available product can be purchased.',['Navigate to /lab/.','Locate the product article.','Assert visibility and enabled purchase button.'],['A named product is verified.','No CSS structure or sleep is required.'],'Scope the button to its product article.','Use the example above with Mechanical Keyboard and its corresponding Add Mechanical Keyboard to cart button.'),
E('02-01-b','Prove the oracle fails','Run a deliberate wrong-product assertion and inspect the failure.',['Temporarily use a nonexistent product name.','Run only that test.','Record expected versus observed evidence and restore it.'],['The controlled mutation fails.','The restored test passes.'],'A failure before the assertion means your setup needs repair first.','The report should show the locator and expected visibility. If the server never starts, you have not validated the catalog assertion yet.')
],Q('Which part is the oracle?',['page.goto','getByRole','expect(...).toBeEnabled()'],2,'The assertion evaluates the claim; navigation and locating are supporting work.'),[R('Writing tests','writing-tests')]),
L('02-02','first-ui','Locators that survive change','Use accessible names and deliberate scope to avoid accidental matches.',50,['locators','accessibility'],
['Choose role, label, and test ID locators deliberately','Resolve strictness by intent rather than first()','Explain locator re-resolution'],[
S('Find what the user means','Role and accessible name often express the interface contract directly. A labeled email field is clearer than the third input in a form. A test ID is appropriate when no meaningful user-facing locator exists and the team agrees on a stable testing contract. CSS classes usually express presentation rather than intent.'),
S('Strictness is useful feedback','If a click matches multiple elements, Playwright raises a strictness error. Adding first() can hide ambiguity. Scope to a product article, dialog, or form so the test explains which control it means. Locators resolve when used, so they can follow rerendered elements without caching a stale DOM node.',`const headphones = page.getByRole('article', { name: 'Studio Headphones', exact: true });
await headphones.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
await page.getByRole('button', { name: /Cart \\(/ }).click();
await expect(page.getByLabel('Quantity for Studio Headphones')).toHaveValue('1');`),
S('Review names as product behavior','A missing label affects both test clarity and accessibility. Do not work around it immediately with a positional selector. Confirm the intended control and report the missing accessible relationship. Accessible locators improve test intent but do not constitute a full accessibility audit.')
],[
E('02-02-a','Locator replacement clinic','Replace three structural selectors with semantic locators.',['Find the search box, sign-in email, and one product button.','Write role or label locators.','Check each resolves to exactly one target in its state.'],['Locators communicate intent.','Repeated controls use meaningful scope.'],'Use getByLabel for form controls.','Search: getByRole("searchbox", {name:"Search products"}); email: getByLabel("Email", {exact:true}); product button: scope to its named article.'),
E('02-02-b','Ambiguity investigation','Explain why a generic Add button locator is unsafe.',['Count matching purchase controls.','Choose a specific product.','Use article scope and verify the resulting cart line.'],['No first() workaround is used.','The cart contains the intended product.'],'An index is not a product identity.','Use getByRole("article", {name:"Studio Headphones",exact:true}) followed by its named Add control, then assert Quantity for Studio Headphones.')
],Q('What should you do first when a locator matches two buttons?',['Use first()','Clarify scope or accessible name','Increase the timeout'],1,'Ambiguity is about intent, not timing. Fix the locator to describe the correct control.'),[R('Locators','locators')]),
L('02-03','first-ui','Forms, validation, and authentication','Exercise both successful login and the rejection users actually see.',50,['forms','auth'],
['Fill labeled fields and submit a form','Separate browser validation from server rejection','Assert identity after login'],[
S('A form has several failure layers','A malformed email may be blocked by native browser validation before any request. A well-formed but incorrect credential reaches the server and should produce an authentication error. These are distinct tests with distinct evidence. Choose deliberately which layer your input exercises.'),
S('Verify the authenticated state','Use the published local-only demo credentials. After submission, inspect the session API through page.request, which shares browser cookies. A successful HTTP response alone is weaker than checking the actual session identity. Do not print passwords or storage state into reports.',`await page.goto('/lab/');
await page.getByRole('button', { name: 'Sign in', exact: true }).click();
await page.getByLabel('Email', { exact: true }).fill('demo@forge.test');
await page.getByLabel('Password', { exact: true }).fill('Playwright123!');
// Scope this button to the visible login dialog when two Sign in buttons exist.
await page.getByRole('dialog').getByRole('button', { name: 'Sign in', exact: true }).click();
// click() finishes before the form's asynchronous request necessarily does.
await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
const session = await page.request.get('/api/session');
expect((await session.json()).user.email).toBe('demo@forge.test');`),
S('Keep rejection evidence honest','After an invalid password, assert both the visible error and an unauthenticated session. A message alone can coexist with a mistakenly authenticated backend. For empty required fields, inspect validity or focus without assuming the browser’s localized native message text.')
],[
E('02-03-a','Invalid password journey','Test a valid email with an incorrect password.',['Open the login form.','Submit a deliberately wrong password.','Verify visible feedback and user:null from /api/session.'],['The error is user-visible.','No authenticated session was created.'],'A valid email ensures the request reaches the server.','Use demo@forge.test with an incorrect password, assert the lab’s visible error text, then expect((await (await page.request.get("/api/session")).json()).user).toBeNull().'),
E('02-03-b','Required-field distinction','Compare an empty email with a wrong password.',['Attempt an empty-email submit.','Observe whether a request is sent.','Document why the two failures need different assertions.'],['Browser validation and server rejection are distinguished.','No locale-dependent native message is hardcoded.'],'Use an input validity property only for the native validation check.','For the empty required control, evaluate el.validity.valueMissing and assert true. For wrong credentials, wait for /api/login response and assert the documented error status plus UI feedback.')
],Q('Why use a syntactically valid email in an invalid-password test?',['To avoid browser validation blocking the server request','To make the password valid','To bypass login'],0,'You want to exercise authentication rejection, not the browser’s email-format validator.'),[R('Input actions','input'),R('Authentication','auth')]),
L('02-04','first-ui','Search, filters, and collections','Verify the entire result set instead of checking one convenient match.',50,['search','collections'],
['Assert positive and negative search results','Test composition of category and search filters','Avoid vacuous assertions on empty lists'],[
S('One visible match is not enough','A search can show the expected product while also showing every unrelated product. Check the collection size and its names. In Forge Shop, Audio includes Studio Headphones and Pocket Speaker; searching Headphones should narrow that set to one product.'),
S('Wait for the collection’s final state','Use retrying locator assertions for counts and text. Reading allTextContents immediately after an action can capture a transient list. When using a data extraction method, first wait for a condition that identifies the expected final result.',`await page.goto('/lab/');
await page.getByLabel('Category', { exact: true }).selectOption({ label: 'Audio' });
await page.getByRole('searchbox', { name: 'Search products' }).fill('Headphones');
const cards = page.getByRole('article');
await expect(cards).toHaveCount(1);
await expect(page.getByRole('article', { name: 'Studio Headphones', exact: true })).toBeVisible();`),
S('No results is a first-class state','Test a term that cannot match and verify both zero product cards and a useful empty-state message. An assertion that every result contains the term passes vacuously when there are no results; assert cardinality whenever a nonempty set is required.')
],[
E('02-04-a','Combined filters','Verify Audio plus Headphones produces exactly one intended product.',['Apply the category.','Enter the search term.','Assert count and product identity, then clear search.'],['Combined result is exactly one.','Clearing search restores two Audio products.'],'The category should remain selected when search is cleared.','Use toHaveCount(1), verify Studio Headphones, fill search with an empty string, then toHaveCount(2) and verify both Audio product articles.'),
E('02-04-b','Empty result recovery','Exercise a no-match term and recover to the full catalog.',['Search for a unique nonsense term.','Check the empty result state.','Clear filters and check all six products.'],['No unrelated card remains visible.','The user can recover without reloading.'],'Assert zero cards and useful feedback separately.','Use a term such as no-such-forge-item-937. Expect zero product articles, assert the displayed no-results text, clear search/category, then expect six cards.')
],Q('Why is results.every(match) insufficient alone?',['It cannot check strings','It also returns true for an empty array','It changes the page'],1,'Add an expected count or a nonempty assertion when at least one result must exist.'),[R('Locator assertions','test-assertions'),R('Locators','locators')]),
L('02-05','first-ui','A customer journey with real evidence','Connect product discovery, cart state, and order persistence.',65,['checkout','E2E'],
['Design one coherent end-to-end journey','Verify money using integer cents','Use API evidence to confirm a browser action'],[
S('Choose a golden path worth protecting','A golden path is the short journey whose failure would block normal use. For Forge Shop: choose an available product, sign in, review the cart, provide a shipping address, and place an order. Keep each step meaningful and verify the durable outcome, not just the final screen.'),
S('Money needs an independent expectation','Studio Headphones cost 12900 cents. Two cost 25800 before discounts. Calculate expected values from deliberately chosen inputs rather than reading the total back and comparing it with itself. Work in cents to avoid floating-point currency surprises.'),
S('Tie UI and persistence together','After placing the order, read /api/orders with page.request so the cookie jar matches the browser. Assert the chosen item, quantity, and total against the documented response. If the confirmation exposes an order ID, match that same ID. Check that the cart has been cleared.',`// After a completed browser checkout:
const ordersResponse = await page.request.get('/api/orders');
expect(ordersResponse.status()).toBe(200);
const cartResponse = await page.request.get('/api/cart');
const cart = await cartResponse.json();
expect(cart.items).toEqual([]);
// Inspect docs/lab-api.md and match the returned order's ID,
// items, and total to the exact purchase made in this test.`)
],[
E('02-05-a','One complete purchase','Automate a one-product checkout with shipping details.',['Use a fresh session and add p1 through the UI.','Log in and enter Full name, Street address, City, Postal code.','Place the order and verify persistence and empty cart.'],['Order contains one p1 at 12900 cents.','A user-visible confirmation and server record agree.'],'Use test.step to label the journey later; keep the first version readable.','Build the journey with semantic locators, use the demo account, submit Alex Tester / 1 Test Lane / London / SW1A 1AA, then compare /api/orders with your expected item and total.'),
E('02-05-b','Price oracle challenge','Improve a test that copies the displayed total into its expected value.',['Explain why self-comparison misses pricing bugs.','Set quantity two for p1.','Compute and assert 25800 cents and the matching UI currency.'],['Expected value is independent of the displayed total.','Both quantity and total are checked.'],'Reading a value twice does not make it an oracle.','Set the known quantity and calculate 12900 * 2. Assert API total 25800 and the cart’s formatted total. Do not use the response total to build the expected total.')
],Q('Which expected total is independent?',['The total copied from the UI','Known unit price multiplied by chosen quantity','The total returned by the same endpoint under test'],1,'A separately derived expected value can detect arithmetic defects.'),[R('API testing','api-testing'),R('Test steps','api/class-test#test-step')]),
L('03-01','resilient-ui','Auto-waiting and the race-condition clinic','Wait for the state you need, not for a number of milliseconds.',50,['waiting','flakiness'],
['Explain actionability versus business readiness','Replace fixed delays with observable assertions','Register event waits before the triggering action'],[
S('Two kinds of readiness','Playwright checks whether a button is actionable before clicking it. That does not prove the resulting server operation has completed. An enabled Place order button can still lead to a delayed response. Assert the resulting confirmation or persisted state, and observe a response only when its status is part of the claim.'),
S('Arm the listener first','A fast response can arrive before a wait registered after the click. Create the response promise first, perform the action, then await the promise. Match path and method so an unrelated request cannot satisfy the wait.',`const responsePromise = page.waitForResponse(response =>
  new URL(response.url()).pathname === '/api/cart' &&
  response.request().method() === 'POST'
);
await page.getByRole('button', { name: 'Add Studio Headphones to cart' }).click();
const response = await responsePromise;
expect(response.status()).toBe(200);
await expect(page.getByRole('button', { name: /Cart \\(1\\)/ })).toBeVisible();`),
S('Timeouts are budgets, not cures','Increasing a timeout can be appropriate for a genuinely slow operation with a defined budget. It does not repair a wrong locator or missing state transition. Avoid networkidle as a generic readiness signal; modern pages may keep background connections or become usable before all traffic settles.')
],[
E('03-01-a','Remove the sleep','Replace a waitForTimeout after adding a product.',['Identify the state the sleep was meant to protect.','Use a retrying assertion for that state.','Repeat the test several times.'],['No fixed delay remains.','The assertion checks a business outcome.'],'The cart count or line quantity is observable.','After the click, await expect(cartButton).toHaveText(/Cart \\(1\\)/) using the exact lab button text, or open the cart and assert quantity 1.'),
E('03-01-b','Catch a fast response','Write a response assertion that cannot miss a quick POST.',['Register waitForResponse.','Trigger the add action.','Assert method, status, and visible result.'],['Listener exists before the trigger.','The matcher cannot match GET /api/cart.'],'Use both pathname and request().method().','Use the promise-before-click pattern in the lesson. Keep the UI assertion because a successful response does not prove the UI updated.')
],Q('What does auto-waiting for click guarantee?',['The business transaction has completed','The element meets click actionability checks','All network traffic has stopped'],1,'Post-action business results still need their own assertions.'),[R('Auto-waiting','actionability'),R('Network','network')]),
L('03-02','resilient-ui','Control the network, expose the edge cases','Use request routing to reproduce outages and unusual catalogs on demand.',55,['mocking','network'],
['Install routes before navigation','Create realistic empty and failure responses','State clearly what a mocked test proves'],[
S('Mocks create controlled experiments','An empty catalog or server error can be hard to arrange reliably in a shared environment. Route fulfillment lets a browser test control that boundary. A mocked UI test proves how the client handles the chosen response; it does not prove that the real backend produces that response.'),
S('Preserve the contract shape','Forge Shop expects an object with products and total. Returning an array changes the experiment into a malformed-contract test. Keep status, content type, and response structure intentional. Install the route before navigation so the initial request cannot escape.',`await page.route('**/api/products*', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ products: [], total: 0 })
  });
});
await page.goto('/lab/');
// Zero cards also holds BEFORE the first response: prove loading finished.
await expect(page.getByRole('heading', { name: 'No products found' })).toBeVisible();
await expect(page.getByRole('article')).toHaveCount(0);`),
S('Pair controlled tests with integration evidence','Keep a real API catalog check alongside the mocked UI cases. If a route pattern matches too broadly, it can intercept unrelated endpoints and hide regressions. Limit it to the intended resource and describe the mocked dependency in the test name.')
],[
E('03-02-a','Empty catalog experiment','Mock a valid empty catalog and assert useful UI feedback.',['Route /api/products before navigation.','Return the documented wrapper with an empty array.','Assert no cards and the empty-state message.'],['The response is contract-shaped.','The test title identifies the mock.'],'Do not confuse zero results with a server error.','Return {products:[],total:0} with 200 and application/json, then assert the app’s no-results message and zero articles.'),
E('03-02-b','Service failure experiment','Simulate a catalog 503 and inspect recovery behavior.',['Fulfill the catalog request with 503 and a JSON error.','Assert visible failure feedback.','Remove the route and retry the user flow.'],['The test reports actual error behavior.','Recovery is verified or a reproducible product defect is recorded.'],'A missing error state is a finding; do not replace the assertion with a weaker one.','Use route.fulfill({status:503,json:{error:{code:"UNAVAILABLE",message:"Catalog unavailable."}}}). Assert the visible alert includes that message, then unroute the same pattern, change Category to Desk, and assert all three Desk product identities. The lab explicitly offers filter changes as its retry path.')
],Q('What does a mocked 503 UI test establish?',['The production service returns 503 correctly','The UI handles the supplied failure response','The whole system is healthy'],1,'A mock isolates client behavior. A real integration check covers the server boundary.'),[R('Mock APIs','mock'),R('Network','network')]),
L('03-03','resilient-ui','Browser isolation, sessions, and storage','Keep one customer’s state from becoming another test’s hidden dependency.',55,['isolation','cookies'],
['Distinguish browser isolation from server isolation','Share the correct cookie jar for hybrid tests','Inspect storage without leaking authentication artifacts'],[
S('A new context is not a new database','Playwright’s page fixture gets a fresh browser context. That isolates cookies and local storage, but two contexts can still mutate the same server-side account. Forge Shop isolates practice state using a lab_session cookie or x-lab-session header. Use a unique session per independent test.'),
S('Choose the request context deliberately','page.request and context.request share the browser context’s cookies. The built-in request fixture has separate cookie storage, but this repository’s extended fixture intentionally gives request and page the same x-lab-session header. Header identity takes precedence over cookies. In a cookie-only example, establish identity before navigation: page.goto does not wait for the application’s asynchronous session initialization.',`// Establish a browser-owned cookie before app initialization can race it.
expect((await page.request.get('/api/session')).status()).toBe(200);
await page.goto('/lab/');
const added = await page.request.post('/api/cart', {
  data: { productId: 'p1', quantity: 1 }
});
expect(added.status()).toBe(200);
await page.reload();
await page.getByRole('button', { name: /Cart \\(/ }).click();
await expect(page.getByLabel('Quantity for Studio Headphones')).toHaveValue('1');`),
S('Treat saved state as account access','Storage state may contain usable authentication cookies. Keep it out of version control and avoid attaching it to reports. Saving browser state is useful for expensive login flows, but reusing a single mutable session across parallel tests reintroduces interference.'),
S('Practice real storage-state reuse','Complete SK-02 in the supplemental browser-skills track described in docs/BROWSER-SKILLS.md. Log in through a cookie-only context, capture its storageState in memory, create another context from that state, and prove the restored context is signed in while a fresh context remains guest. Use browser.newContext({baseURL, extraHTTPHeaders:{}}), adding storageState for the restored context. Explicitly clear inherited headers: a configured x-lab-session overrides the restored cookie and can make the experiment test a different identity. State reuse preserves a session; it does not clone the server cart.',`# Run the worked browser-skill examples:
npm run test:skills
# Implement only SK-02 in its skipped practice starter, then:
npm run test:skills:practice -- --grep SK-02`)
],[
E('03-03-a','Two customers, two carts','Create two browser contexts and prove their carts differ.',['Open /lab/ in each context.','Add p1 through the first page’s request context.','Inspect both carts and close both contexts.'],['First cart has p1.','Second cart remains empty.'],'Use each page.request, not one shared standalone request.','Create two browser.newContext({baseURL, extraHTTPHeaders:{}}) contexts. Explicitly clear inherited headers; omitting extraHTTPHeaders may retain the configured x-lab-session. Bootstrap each via its own context.request.get("/api/session") before navigation. Visit /lab/, mutate A with a.request, inspect both through their own page.request, then close both in finally. Use the baseURL test fixture so a custom PORT is honored.'),
E('03-03-b','Diagnose invisible setup','Explain a test that seeds request but opens a different browser session.',['Seed a standalone request context.','Observe the fresh browser cart.','Repair by using page.request or an explicit shared session header.'],['The explanation identifies cookie jars.','The repaired setup is visible in the browser.'],'A successful POST can belong to the wrong customer.','For the broken case create browser.newContext({baseURL, extraHTTPHeaders:{}}) and playwright.request.newContext({baseURL, extraHTTPHeaders:{}}). Explicitly clear inherited headers in both; simply omitting the option may retain the repository fixture’s shared x-lab-session. For the repair bootstrap page.request.get("/api/session") before navigation, seed with page.request, then navigate. Alternatively use the supplied fixture, which deliberately shares a unique header between browser and API.')
],Q('Which context shares cookies with the active page?',['A separately created request.newContext()','page.request','Any request fixture automatically'],1,'page.request is associated with its BrowserContext and shares its cookie storage.'),[R('Isolation','browser-contexts'),R('API testing','api-testing'),R('Authentication','auth')]),
L('03-04','resilient-ui','Events, downloads, and deterministic time','Handle asynchronous browser events without missing them.',60,['events','downloads','clock'],
['Register download listeners before triggering downloads','Use saved artifacts as evidence','Control time in an isolated teaching fixture'],[
S('Events need a listener before a cause','Downloads, popups, and dialogs can happen immediately. Begin waiting before the click that triggers the event. If you create a dialog listener, it must accept or dismiss the dialog; leaving it unresolved blocks the page. Use the downloaded file’s content to verify behavior, not only its filename.'),
S('Capture a receipt deliberately','After checkout, inspect the receipt control’s accessible name in the live shop and use it in the trigger below. Save into testInfo.outputPath so parallel tests do not overwrite each other’s artifacts.',`// Adapt the trigger to the receipt control observed in the lab.
const downloadPromise = page.waitForEvent('download');
await page.getByRole('link', { name: /download receipt/i }).click();
const download = await downloadPromise;
const receiptPath = testInfo.outputPath(download.suggestedFilename());
await download.saveAs(receiptPath);
expect(await download.failure()).toBeNull();`),
S('Use synthetic fixtures for time concepts','The shop does not need a countdown just to teach timers. A small page.setContent fixture gives you a known timer you can control. Playwright’s clock must be installed before the timer-producing code. Advancing time tests timer behavior without waiting in real time.',`await page.clock.install();
await page.setContent('<button disabled>Ready</button><script>setTimeout(() => document.querySelector("button").disabled = false, 5000)</script>');
await expect(page.getByRole('button', { name: 'Ready' })).toBeDisabled();
await page.clock.fastForward(5000);
await expect(page.getByRole('button', { name: 'Ready' })).toBeEnabled();`),
S('Transfer the event pattern to other controls','The dedicated /skills/ page and docs/BROWSER-SKILLS.md add executable drills without pretending the shop implements every browser feature. SK-01 tests the precise timer boundary; SK-03 uses setInputFiles and verifies file content; SK-04 scopes a control inside frameLocator; SK-05 registers the popup listener before opening a tab and checks the new page; SK-06 accepts and dismisses native dialogs and verifies the parent page result. A native JavaScript dialog uses the dialog event; a rendered HTML dialog uses ordinary locators. Complete the drills with their actual fixture labels and close manually created pages or contexts.',`# Select a worked drill:
npm run test:skills -- --grep SK-05
# Remove skip from just the matching practice starter and implement it:
npm run test:skills:practice -- --grep SK-05`)
],[
E('03-04-a','Inspect a real receipt','Download a completed order’s receipt and validate its contents.',['Create an order in your isolated session.','Arm the download event, then trigger receipt download.','Read the saved file and compare order ID and total.'],['The download succeeds.','The content matches this test’s order.'],'Use testInfo.outputPath, never a shared receipt.txt.','Await download.saveAs(testInfo.outputPath(...)); read the file with node:fs/promises; assert the exact order ID and expected amount using the receipt’s documented format.'),
E('03-04-b','Advance a controlled timer','Use the synthetic timer fixture to avoid a five-second wait.',['Install page.clock.','Create the disabled button and timeout.','Advance time and assert enabled state.'],['The button begins disabled.','No real-time sleep is used.'],'Install the clock before creating timers.','Use the clock example in this lesson; add an assertion before fastForward so an always-enabled button cannot pass.')
],Q('When should waitForEvent("download") start?',['After clicking download','Before the action that starts it','After the test ends'],1,'Registering first prevents a fast event from being missed.'),[R('Downloads','downloads'),R('Clock','clock'),R('Dialogs','dialogs')]),
L('03-05','resilient-ui','Visual and accessibility checks with judgment','Add evidence for layout and keyboard behavior without worshipping snapshots.',60,['visual','accessibility'],
['Create a focused visual baseline','Test keyboard focus and accessible controls','Explain the limits of automated accessibility checks'],[
S('A screenshot is an approved expectation','A visual comparison detects pixel changes, not whether the new design is correct. Review the first baseline carefully. Stabilize viewport, browser, data, fonts, and animation. Prefer a component-sized screenshot when the claim concerns that component; full-page images can create unrelated churn.'),
S('Test a usable path through the interface','Keyboard checks can verify that a person can reach search, open the cart, and operate important controls. Semantic locators identify roles and names, but they do not prove color contrast or a sensible reading experience. Automated accessibility tools add coverage; manual exploration remains necessary.',`await page.goto('/lab/');
const search = page.getByRole('searchbox', { name: 'Search products' });
await search.focus();
await expect(search).toBeFocused();
await search.fill('Headphones');
await expect(page.getByRole('article')).toHaveCount(1);
await expect(page.getByRole('article', { name: 'Studio Headphones', exact: true }))
  .toHaveScreenshot('headphones-card.png', { animations: 'disabled' });`),
S('Review changes with a reason','Never approve updated snapshots simply to turn CI green. Ask whether the difference is intended, whether the baseline environment changed, and whether the change affects usability. Mask only genuinely irrelevant volatile content, not the thing you meant to test.')
],[
E('03-05-a','A focused visual contract','Create and review a product-card baseline.',['Fix the project viewport and browser.','Capture only the named product article.','Inspect the baseline, then introduce a local style change and observe the diff.'],['Baseline is visually reviewed.','A meaningful style mutation is detected.'],'Keep generated snapshots with the test they explain.','Use toHaveScreenshot on the article; run with --update-snapshots only after review. Restore the deliberate mutation and keep the approved baseline.'),
E('03-05-b','Keyboard checkout audit','Explore checkout without pointer clicks and automate one discovered risk.',['Navigate using Tab, Shift+Tab, Enter, and Escape.','Record focus order and any trapped or unreachable control.','Assert a critical focus transition.'],['Manual observations are recorded.','One automated focus assertion covers a real behavior.'],'An automated focus() call does not prove natural tab order.','Start from a known focus point, press Tab and assert the next intended control with toBeFocused. If the dialog fails to manage focus, report it rather than forcing focus in the test.')
],Q('When should a changed screenshot baseline be accepted?',['Whenever CI fails','After verifying the change is intended in the same rendering environment','Automatically on every run'],1,'Baselines are reviewed expectations, not disposable files that should follow any implementation change.'),[R('Visual comparisons','test-snapshots'),R('Accessibility testing','accessibility-testing')]),
L('04-01','api','HTTP as a testable contract','Read status, headers, shape, and meaning as separate layers of evidence.',50,['API','HTTP'],
['Send API requests using the built-in fixture','Validate status, content type, and meaningful fields','Avoid relying on status alone'],[
S('A 200 response can still be wrong','A server can return 200 with an empty object, a broken price, or the wrong product. Treat a response as several claims: status is appropriate, content type is usable, structure matches the contract, and values satisfy the business rule. Assert only the fields your scenario actually needs.'),
S('Inspect the real catalog','Forge prices are integer USD cents. The catalog wrapper contains products and total. Check both the wrapper and one known product, then inspect all prices for valid integer representation. Do not cast the JSON and assume that validates it.',`import { test, expect } from '@playwright/test';
test('catalog exposes known products in cents', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  const body = await response.json();
  expect(body.products).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'p1', name: 'Studio Headphones', price: 12900 })
  ]));
  expect(body.total).toBe(body.products.length);
  for (const product of body.products) {
    expect(Number.isInteger(product.price)).toBe(true);
    expect(product.price).toBeGreaterThanOrEqual(0);
  }
});`),
S('Failure messages are part of design','A giant deep equality assertion can hide which rule matters. Use exact equality for stable contract fields and partial matching when extra fields are allowed. Give loops useful labels or include the product ID in assertion messages so failures identify the offending record.')
],[
E('04-01-a','Catalog contract test','Assert a real catalog response at four layers.',['Check status and content type.','Check wrapper fields and nonempty products.','Verify p2 has the documented price and category.'],['At least one known value is verified.','Prices are validated at runtime.'],'p2 is Mechanical Keyboard, 8900 cents, Desk.','Assert status 200, JSON content type, array structure, total consistency, and an objectContaining({id:"p2",price:8900,category:"Desk"}) in products.'),
E('04-01-b','Find a weak contract assertion','Strengthen a test that checks only response.ok().',['List three incorrect bodies that still pass.','Write assertions for two meaningful invariants.','Explain which extra fields you intentionally permit.'],['The test rejects wrong data despite 200.','Assertions avoid unnecessary whole-response coupling.'],'An empty list may be a valid shape but wrong fixture data.','Counterexamples: {}, products with string prices, missing p1. Add array/nonempty checks and a known product assertion; allow harmless future metadata by using objectContaining.')
],Q('Does response.ok() validate the JSON body?',['Yes','No; it reflects a successful HTTP status','Only for GET'],1,'A successful status says nothing about the correctness of response fields.'),[R('API testing','api-testing'),R('APIRequestContext','api/class-apirequestcontext')]),
L('04-02','api','Query parameters, sorting, and invariants','Test the result set and its ordering with independent expectations.',50,['API','filtering'],
['Send encoded query parameters through params','Verify filtering excludes unrelated records','Check sorting without assuming a single hardcoded response'],[
S('The query is part of the contract','Search and category filters should compose. A test that verifies only one expected item misses leaked unrelated items. Forge’s Desk category contains p2, p4, and p6. Price ascending should produce 5900, 7900, and 8900 cents for that set.'),
S('Use params instead of hand-built URLs','The params option keeps query values separate from URL construction and handles encoding. Check both membership and ordering. For a general sort assertion, compare a copied numeric list with its independently sorted copy; never mutate the original list before comparing.',`const response = await request.get('/api/products', {
  params: { category: 'Desk', sort: 'price-asc' }
});
expect(response.status()).toBe(200);
const { products } = await response.json();
expect(products.map((p: { id: string }) => p.id)).toEqual(['p4', 'p6', 'p2']);
const prices = products.map((p: { price: number }) => p.price);
expect(prices).toEqual([...prices].sort((a, b) => a - b));`),
S('Metamorphic checks expose consistency','When exact data is dynamic, relationships can still be stable: ascending and descending should contain the same IDs; adding a category filter should not introduce a product outside that category. These relationships complement known-value examples, but they can all pass on an empty result, so require meaningful cardinality.')
],[
E('04-02-a','Exact Desk ordering','Verify all Desk products appear in ascending price order.',['Request category Desk and price-asc.','Assert exactly three IDs.','Assert their expected order and category.'],['No Audio or Video item leaks into results.','Order is p4, p6, p2.'],'Default string sorting is wrong for general numeric lists.','Use params and assert IDs ["p4","p6","p2"], every category Desk, and numeric prices [5900,7900,8900].'),
E('04-02-b','A relationship-based sort check','Compare ascending and descending catalogs.',['Request both sorts independently.','Check nonempty equal membership.','Verify reverse ordering when prices are distinct.'],['Both requests return the same products.','A reversed order assertion is based on documented distinct prices.'],'If equal prices are later added, compare price sequences instead of tie order.','Compare sorted ID sets; compare descending prices to [...ascendingPrices].reverse(). Do not require a particular order among equal-price products without a tie-break rule.')
],Q('Why copy an array before sort() in an oracle?',['sort() mutates its array','Playwright requires copies','JSON arrays cannot be sorted'],0,'Mutating the observed array can make the expected and actual values identical by construction.'),[R('APIRequestContext.get','api/class-apirequestcontext#api-request-context-get')]),
L('04-03','api','Mutations, invalid input, and unchanged state','Test cart updates as transitions with before-and-after evidence.',60,['API','negative-testing'],
['Distinguish set quantity from increment quantity','Verify rejection without partial mutation','Test stock and identity failures'],[
S('Read the verb’s actual semantics','Forge POST /api/cart sets the chosen product quantity; sending quantity 2 twice leaves quantity 2, not 4. HTTP method names do not fully define business semantics. Write tests from the documented operation and verify the resulting state.'),
S('Capture state before a rejected operation','For a negative case, first establish a known cart. Send the invalid request, assert the specific documented status, then inspect the cart again. Comparing relevant fields catches implementations that mutate state and only then return an error.',`await request.post('/api/reset');
await request.post('/api/cart', { data: { productId: 'p1', quantity: 2 } });
const before = await (await request.get('/api/cart')).json();
const rejected = await request.post('/api/cart', {
  data: { productId: 'p1', quantity: 0 }
});
expect(rejected.status()).toBe(400);
const after = await (await request.get('/api/cart')).json();
expect(after.items).toEqual(before.items);
expect(after.total).toBe(25800);`),
S('Different failures deserve separate cases','Unknown product, out-of-stock product, invalid quantity, and malformed JSON can produce different errors. Use the published contract’s statuses rather than treating every 4xx as interchangeable. A 404 can hide a routing mistake when you expected a 400 validation response.')
],[
E('04-03-a','Set, do not increment','Prove repeated identical cart updates are stable.',['Set p1 quantity to two.','Repeat the identical POST.','Read the cart and assert quantity and total.'],['Quantity remains two.','Total remains 25800.'],'The endpoint replaces that product’s quantity.','Send the same {productId:"p1",quantity:2} twice, assert exactly one p1 line with quantity 2 and lineTotal 25800.'),
E('04-03-b','Reject without damage','Test zero quantity and out-of-stock p5.',['Seed a valid p1 cart.','Send each invalid mutation in an independent test.','Assert the documented error and unchanged p1 state.'],['Both failure reasons are covered.','No rejected product appears in the cart.'],'Reset and reseed per test; do not chain failures in one shared state.','Quantity zero should return the documented validation status; p5 should return the documented stock status. In both cases compare items and total with the before snapshot.')
],Q('Why inspect the cart after a rejected mutation?',['To slow down the test','To detect partial or unintended state changes','To refresh the access token'],1,'An error response alone does not guarantee atomic rejection.'),[R('API testing','api-testing')]),
L('04-04','api','Authentication and session boundaries','Prove both access and isolation using separate customers.',60,['API','auth','isolation'],
['Test authenticated and guest order access','Create isolated API contexts','Dispose contexts and keep state local'],[
S('Authentication and isolation answer different questions','Authentication asks who may perform an operation. Isolation asks whose cart and orders are affected. The practice lab uses session IDs to make experiments independent; its demo login is intentionally simple and is not a production security model. Keep the distinction explicit in your test strategy.'),
S('Build two explicit customers','A unique x-lab-session header makes server-state ownership visible. Create separate contexts with different headers and dispose them after use. A logged-in context must not accidentally lend its cookies or headers to a guest check.',`const alice = await playwright.request.newContext({
  baseURL: 'http://127.0.0.1:' + (process.env.PORT || '4173'),
  extraHTTPHeaders: { 'x-lab-session': 'alice-' + crypto.randomUUID() }
});
try {
  const login = await alice.post('/api/login', {
    data: { email: 'demo@forge.test', password: 'Playwright123!' }
  });
  expect(login.status()).toBe(200);
  const session = await (await alice.get('/api/session')).json();
  expect(session.user.email).toBe('demo@forge.test');
} finally {
  await alice.dispose();
}`),
S('Authorization checks need an unchanged-state oracle','For an unauthenticated order attempt, verify rejection and no order creation. If a filled cart is required to reach the authentication branch, seed one first. Otherwise the request may fail for the wrong reason and never exercise the access rule.')
],[
E('04-04-a','Guest checkout rejection','Attempt order creation with a filled guest cart.',['Create a fresh guest session.','Add p1, then POST valid shipping data to /api/orders.','Assert unauthorized status and preserved cart.'],['Failure is authentication-related.','No order was created and the cart remains intact.'],'Provide otherwise valid input so auth is the variable.','Seed p1, post valid name/address/city/postalCode, assert 401 AUTH_REQUIRED, then verify the cart still has p1 and the session remains guest. Finally log in to the same session and assert GET /api/orders returns an empty list: a 401 alone cannot prove no order was accidentally created.'),
E('04-04-b','Cross-session independence','Authenticate A, leave B guest, and prove cart separation.',['Create contexts with unique session headers.','Log in and mutate A.','Inspect B’s session and cart, then dispose both.'],['B remains guest.','B cannot see A’s cart contents.'],'Use a different random identifier for each context.','A /api/session returns the demo user; B returns user:null. A cart has p1; B items is empty. Cleanup belongs in finally even when an assertion fails.')
],Q('Why give a guest order test valid shipping data?',['To bypass authentication','To ensure rejection tests the access rule rather than unrelated validation','To create a real shipment'],1,'Control other variables so the failure has the intended cause.'),[R('Authentication','auth'),R('APIRequest.newContext','api/class-apirequest#api-request-new-context')]),
L('04-05','api','Hybrid testing and order invariants','Set up quickly through the API, then verify the customer-facing result.',65,['hybrid','orders','money'],
['Use API setup without losing UI coverage','Verify order snapshots and cart clearing','Test discounts with an independent calculation'],[
S('Spend UI time on the claim','If your test is about the order confirmation, repeating login and product browsing through the UI adds unrelated failure points. Establish those preconditions through the API in the browser’s session, then use the UI for the behavior under test. Retain a separate full journey to cover the wiring.'),
S('Treat an order as a snapshot','An order should preserve the items and totals at purchase time. The cart can be cleared or rebuilt afterward without changing that order. This is a more valuable invariant than asserting only that the order list has one extra element.'),
S('Compute the discount yourself','SAVE10 applies the lab’s documented ten-percent rule. For one p1, subtotal is 12900, discount is 1290, total is 11610 cents. Check the API and UI agree with those independent numbers. Read the contract for rounding before testing prices that produce fractional cents.',`// Set up through the browser-owned request context before navigation.
const login = await page.request.post('/api/login', { data: {
  email: 'demo@forge.test', password: 'Playwright123!'
}});
expect(login.status()).toBe(200);
const added = await page.request.post('/api/cart', { data: { productId: 'p1', quantity: 1 } });
expect(added.status()).toBe(200);
const promo = await page.request.post('/api/cart/promo', { data: { code: 'SAVE10' } });
expect(promo.status()).toBe(200);
const cart = await (await page.request.get('/api/cart')).json();
expect(cart).toMatchObject({ subtotal: 12900, discount: 1290, total: 11610 });
await page.goto('/lab/'); // Let the UI read the prepared state.
await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();`)
],[
E('04-05-a','Discounted order evidence','Create a discounted order and verify its monetary snapshot.',['Log in, add p1, and apply SAVE10 in one session.','Submit valid shipping data.','Verify order subtotal/discount/total and empty cart.'],['Total is exactly 11610 cents.','The order retains its purchased item after cart clearing.'],'Use the returned order ID to identify the record.','Assert POST /api/orders succeeds with order fields matching 12900/1290/11610; GET orders contains the same ID; GET cart has no items.'),
E('04-05-b','Order immutability probe','Show that a later cart change does not rewrite an existing order.',['Create an order and capture its relevant fields.','Add p2 to the now-empty cart.','Read the original order again and compare its snapshot.'],['The existing order is unchanged.','The new cart independently contains p2.'],'Compare business fields, not volatile response metadata.','Store original order ID, items and totals. After adding p2, locate the same order and assert those fields are identical; assert cart total 8900.')
],Q('What should API setup replace in a confirmation-page test?',['The confirmation assertions','Unrelated prerequisite clicks','Every UI test in the suite'],1,'Use faster setup for prerequisites while preserving browser evidence for the behavior being tested.'),[R('API testing','api-testing')]),
L('05-01','architecture','Fixtures that own their cleanup','Make setup dependencies explicit and resources short-lived.',60,['fixtures','architecture'],
['Create a typed test-scoped fixture','Place teardown after use()','Prevent hidden global state'],[
S('A fixture is a lifecycle boundary','A helper performs an operation. A fixture owns a resource for a defined scope: create it, make it available, and release it. A session-specific API context is a natural fixture because every test needs predictable ownership and disposal. Avoid stuffing unrelated setup into an automatic fixture.'),
S('Use test scope for mutable state','A fresh session per test is easy to reason about. Worker-scoped resources are useful for expensive immutable setup or distinct worker accounts, but mutable shared carts require additional discipline. Begin with test scope and optimize only after measuring.',`import { test as base, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
export const test = base.extend<{ shopApi: APIRequestContext }>({
  shopApi: async ({ playwright }, use) => {
    const api = await playwright.request.newContext({
      baseURL: 'http://127.0.0.1:' + (process.env.PORT || '4173'),
      extraHTTPHeaders: { 'x-lab-session': randomUUID() }
    });
    try { await use(api); }
    finally { await api.dispose(); }
  }
});
export { expect };`),
S('Keep failures attributable','Validate setup responses so a failed login is reported as setup failure rather than an unrelated checkout timeout. Cleanup should be scoped to the resource this test owns. A global reset can erase another test’s state and create nondeterministic failures.')
],[
E('05-01-a','Own an API session','Create a shopApi fixture and migrate two API tests to it.',['Generate a unique session ID.','Yield a configured API context.','Dispose it after use.'],['Tests run independently.','Cleanup executes even on assertion failure.'],'Import your extended test instead of the base runner in migrated specs.','Use the typed fixture above. In specs import {test,expect} from your fixture module, then use async ({shopApi}) and send requests through that context.'),
E('05-01-b','Expose a teardown bug','Find why cleanup before use() breaks resource ownership.',['Write the lifecycle as setup → use → teardown.','Inspect a deliberately misplaced dispose call.','Move disposal into finally after use.'],['The resource is alive throughout the test.','Failure paths still release it.'],'use is the point where control passes into the test.','await api.dispose(); await use(api) is wrong. Use try { await use(api); } finally { await api.dispose(); } so the context exists during test execution.')
],Q('What does code after await use(resource) normally represent?',['Test registration','Fixture teardown','A second setup phase'],1,'The fixture resumes after the test or dependent fixture finishes using its resource.'),[R('Fixtures','test-fixtures')]),
L('05-02','architecture','Page objects that reveal intent','Extract repeated UI language without hiding the test’s expectations.',55,['page-objects','design'],
['Create a small page object with typed locators','Separate actions from scenario assertions','Recognize over-abstraction'],[
S('Name business actions, not wrapper mechanics','A useful page object can expose searchFor(term) or addProduct(name). Wrapping every click in clickElement(selector) adds indirection without meaning. Keep the object small enough that a reviewer can see what interaction it represents.'),
S('Keep the oracle visible','Assertions about the scenario belong near the scenario. A page object may assert a page is ready or an action completed when that is part of its clear contract, but hidden assertions about price or cart contents make tests hard to read. Return locators or data when the test should choose the expectation.',`import type { Page } from '@playwright/test';
export class CatalogPage {
  constructor(readonly page: Page) {}
  async open() { await this.page.goto('/lab/'); }
  product(name: string) {
    return this.page.getByRole('article', { name, exact: true });
  }
  async searchFor(term: string) {
    await this.page.getByRole('searchbox', { name: 'Search products' }).fill(term);
  }
  async addProduct(name: string) {
    await this.product(name).getByRole('button', { name: 'Add ' + name + ' to cart' }).click();
  }
}`),
S('Extract after repetition is understood','Two similar flows may have different contracts. Do not create a universal checkout method with ten booleans to serve every scenario. Start from repeated stable behavior, preserve readable test intent, and let a helper remain a function when a class adds no value.')
],[
E('05-02-a','Extract the catalog language','Refactor two catalog tests to a focused CatalogPage.',['Move stable locators and navigation.','Add searchFor and product methods.','Leave expected result counts in the tests.'],['Tests read as scenarios.','Assertions remain visible at call sites.'],'Do not move every expect into the class.','const catalog = new CatalogPage(page); await catalog.open(); await catalog.searchFor("Headphones"); await expect(catalog.product("Studio Headphones")).toBeVisible();'),
E('05-02-b','Reject a god object','Review a helper with login, HTTP setup, screenshots, and assertions in one class.',['List its unrelated responsibilities.','Split one lifecycle responsibility into a fixture.','Keep one business assertion in the spec.'],['The refactor reduces hidden side effects.','No boolean-heavy universal method is introduced.'],'Ownership and interaction are different responsibilities.','Move API context creation/disposal to a fixture; keep catalog locators in CatalogPage; leave expected totals in the checkout test. A class is not required for plain data construction.')
],Q('Which is the best page-object method name?',['clickElement(selector)','addProduct(name)','doEverything(isAdmin, useApi, checkTotal)'],1,'It expresses a stable user action without exposing selector mechanics or unrelated branches.'),[R('Page object models','pom')]),
L('05-03','architecture','Data builders and parameterized tests','Make scenario variation explicit while keeping every failure identifiable.',55,['data','parameterization'],
['Generate fresh valid defaults','Override one field per negative case','Register clear independent test cases'],[
S('A valid baseline isolates the variable','A shipping builder can return a complete valid address. Each negative case changes one field so the reason for rejection is unambiguous. Return a new object every time. A shared mutable object lets one test’s override leak into another.'),
S('Register a test for each meaningful case','A loop at definition time can create independent named tests. This gives separate reports and retries. One giant test looping through twenty requests stops at the first failure and hides the remaining cases. Do not turn every literal into a parameter; preserve understandable scenarios.',`type Shipping = { name: string; address: string; city: string; postalCode: string };
const shipping = (overrides: Partial<Shipping> = {}): Shipping => ({
  name: 'Alex Tester', address: '1 Test Lane', city: 'London', postalCode: 'SW1A 1AA',
  ...overrides
});
for (const field of ['name', 'address', 'city', 'postalCode'] as const) {
  test('rejects missing shipping ' + field, async ({ request }) => {
    // Establish a fresh authenticated session with a stocked cart here.
    const response = await request.post('/api/orders', { data: shipping({ [field]: '' }) });
    expect(response.status()).toBe(422);
  });
}`),
S('Setup must reach the intended branch','The abbreviated snippet requires authenticated, nonempty-cart setup. Without it, every case may return 401 and never test shipping validation. Include that setup using a fixture or explicit helper, and verify rejection leaves the cart intact.')
],[
E('05-03-a','Shipping builder','Create a builder and prove calls do not share mutable state.',['Return a fresh valid shipping object.','Override city in one call.','Verify another call still returns London.'],['Default data remains valid.','One override changes only the intended field.'],'Spread overrides after defaults.','const a=shipping({city:"Warsaw"}); const b=shipping(); expect(a.city).toBe("Warsaw"); expect(b.city).toBe("London"); expect(a).not.toBe(b).'),
E('05-03-b','Four distinct validation reports','Parameterize the four required shipping fields.',['Create valid login/cart setup per case.','Register a named test for each empty field.','Assert validation status and unchanged cart.'],['Four independent tests appear in --list.','Each request reaches shipping validation.'],'A shared beforeAll cart will be consumed by successful order tests.','Use a test-scoped authenticated cart fixture, builder override {[field]:""}, expected 422, and a cart assertion after rejection.')
],Q('Where should the parameterization loop run to create separate tests?',['Inside one test body','At test definition time','Only inside afterAll'],1,'Registering separate tests gives distinct names, results, retries, and isolation.'),[R('Parameterize tests','test-parameterize')]),
L('05-04','architecture','Parallel-safe by construction','Make state ownership explicit so faster execution does not create random failures.',60,['parallelism','state'],
['Identify shared mutable state','Use unique session ownership','Compare serial and parallel results without hiding races'],[
S('Concurrency exposes dependencies you already had','A suite that passes with one worker but fails with four often shares mutable state. Examples include one cart, one output filename, or a reset endpoint that clears everyone’s data. Parallelism is not the underlying bug; hidden ownership is.'),
S('Use identity, not timing, for separation','A UUID-backed lab session is stronger than a timestamp alone. Include test names in diagnostics, but use a unique identifier for storage ownership. Output artifacts should use testInfo.outputPath. Avoid relying on test execution order even within a file.',`import { randomUUID } from 'node:crypto';
test('owns its cart', async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { 'x-lab-session': randomUUID() }
  });
  try {
    const added = await api.post('/api/cart', { data: { productId: 'p2', quantity: 1 } });
    expect(added.status()).toBe(200);
    const cart = await (await api.get('/api/cart')).json();
    expect(cart.total).toBe(8900);
  } finally { await api.dispose(); }
});`),
S('Serial mode is a design choice, not a bandage','Some workflows intentionally represent one ordered scenario and can live in one test. Marking an entire suite serial to protect a shared cart hides coupling and slows feedback. Use serial execution only when the dependency is intentional and documented.')
],[
E('05-04-a','Parallel stress run','Run independent cart tests with multiple workers and repetitions.',['Confirm unique session ownership.','Run with --workers=4 --repeat-each=5.','Investigate any mismatch using session and test identity.'],['All cases remain independent.','Artifacts cannot overwrite one another.'],'Do not solve a race by enabling retries.','Use unique x-lab-session per test and testInfo.outputPath for files. Compare results with --workers=1; a parallel-only failure points to shared state or resource contention.'),
E('05-04-b','Shared-state autopsy','Explain why two tests using the same saved mutable session interfere.',['Test A sets p1 quantity one.','Test B resets that session.','Draw a possible interleaving and redesign ownership.'],['The race is explained as a concrete sequence.','The fix separates state rather than adding sleeps.'],'A new browser context can still load the same session cookie.','A adds → B resets → A reads empty cart. Give each test its own server session; reserve saved shared auth for operations that cannot mutate shared account state.')
],Q('What is the strongest fix for two tests resetting the same cart?',['Longer waits','Unique server-side session ownership','Five retries'],1,'State separation removes the interference instead of reducing its visibility.'),[R('Parallelism','test-parallel'),R('Fixtures','test-fixtures')]),
L('05-05','architecture','Projects, configuration, and suite boundaries','Build a test matrix that answers distinct questions without wasting runs.',55,['config','projects'],
['Define browser and API projects deliberately','Use a managed local webServer','Keep timeout and retry policy understandable'],[
S('Projects are execution contexts','A project can select a browser, device, environment, or subset of tests. API-only tests usually do not need to run once per browser engine. UI behavior may need Chromium, Firefox, and WebKit coverage. Split matching rules so your matrix represents real questions. This repository keeps the main config for daily practice and an optional playwright.matrix.config.ts for three-engine UI checks; inspect both with their --list commands before changing matching rules.'),
S('Let the runner manage the target','The webServer option can launch the local app and wait for readiness. Use a stable baseURL, a command that exists in package.json, and a readiness URL. Avoid accidentally testing an unrelated server already running on the same port in CI.',`import { defineConfig, devices } from '@playwright/test';
const baseURL = 'http://127.0.0.1:' + (process.env.PORT || '4173');
export default defineConfig({
  testDir: './tests',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev', url: baseURL + '/api/forge-health',
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },
    { name: 'ui', testMatch: '**/ui/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } }
  ]
});`),
S('Keep policy near its reason','A global timeout increase affects every test and can make broken builds much slower. A per-assertion budget is more precise for one known slow transition. Retain a small understandable configuration before adding custom reporters, environment switching, and shard logic.')
],[
E('05-05-a','Separate API and UI execution','Create project matching rules and inspect the discovered matrix.',['Identify existing spec directories.','Configure an API project and Chromium UI project.','Run --list for each project.'],['API specs run once.','UI specs match the intended browser project.'],'Check the repository config before replacing it; merge the idea into existing projects.','Use testMatch patterns for tests/api and tests/ui, then npx playwright test --list --project=api and --project=ui to verify membership.'),
E('05-05-b','Config review memo','Review a config with 120-second timeouts and five retries everywhere.',['Estimate worst-case failed-test duration.','Identify one justified local timeout.','Propose a narrower policy with trace evidence.'],['The proposal names a reason for each budget.','Retries are not described as a flake fix.'],'A slow failure is a cost paid by every developer.','Use modest defaults, targeted expect timeout only for a measured transition, and trace capture on failure/retry. Track flaky outcomes separately from clean passes.')
],Q('Why split API tests from browser projects?',['API tests cannot use Playwright','Browser duplication usually adds no new evidence for the same HTTP checks','To disable API assertions'],1,'A browser matrix is valuable for rendering and interaction differences, not repeated identical server requests.'),[R('Projects','test-projects'),R('Web server','test-webserver'),R('Configuration','test-configuration')]),
L('06-01','delivery','Trace-driven debugging','Reconstruct the failure from evidence instead of guessing at waits.',55,['debugging','traces'],
['Read action, DOM, network, and console evidence together','Separate setup failures from product failures','Write a concise causal diagnosis'],[
S('A timeout is a symptom','When a locator times out, possibilities include a wrong page, a failed request, an ambiguous locator, or a real missing UI state. A trace helps reconstruct the sequence. Start with the last successful action, inspect the state before the failing action, and follow the network operation that should have changed it.'),
S('Capture the failure you need','For a local investigation, run the selected test with trace enabled. Open the report’s trace attachment or the trace archive directly. Traces can contain page content and request details, so keep real credentials and private data out of shared artifacts.',`npx playwright test tests/ui --project=ui --trace on
npx playwright show-report
# Or open a specific archive produced by the runner:
npx playwright show-trace test-results/path-to-test/trace.zip`),
S('Write the causal chain','Useful diagnosis: POST /api/cart returned 400 because quantity was zero; the cart never changed; the later count assertion timed out. Weak diagnosis: Playwright is slow. Distinguish observation from hypothesis, reproduce the hypothesis, and change the smallest justified thing.')
],[
E('06-01-a','Trace a controlled failure','Make one expected product name wrong and inspect the trace.',['Run just the failing test with trace on.','Inspect the DOM snapshot and locator.','Write the smallest corrective change and rerun.'],['The diagnosis cites a trace observation.','The repair does not add a timeout.'],'Verify the page was correct before blaming the locator.','If the DOM contains Studio Headphones but the locator asks for Studio Headphone, fix the name. Evidence: successful navigation, catalog response 200, matching product visible under its actual accessible name.'),
E('06-01-b','Follow a backend rejection','Create a failure where an invalid API setup causes a later UI assertion to fail.',['Send an invalid cart setup and initially ignore its status.','Inspect the later UI failure.','Add setup response validation to reveal the real cause earlier.'],['The improved failure points to setup.','The final assertion remains meaningful.'],'Assertions in setup can improve attribution.','Check the add response immediately. A 400 should stop the test at setup, rather than allowing a misleading missing-cart timeout later.')
],Q('What should you inspect first after a locator timeout?',['Increase every timeout','The last successful action and state before failure','Delete the assertion'],1,'Reconstructing the sequence reveals whether the missing state is caused by navigation, data, network, or the locator itself.'),[R('Trace viewer','trace-viewer'),R('Debugging tests','debug')]),
L('06-02','delivery','Flakiness, retries, and false confidence','Measure unstable signals and repair their causes.',55,['flakiness','retries'],
['Differentiate deterministic failure from intermittent behavior','Use repetitions to investigate a hypothesis','Report flaky passes separately'],[
S('A retry is another observation','A test that fails then passes is flaky, not equivalent to a clean pass. Retries can preserve useful diagnostics and reduce transient pipeline blockage, but they do not remove the underlying race or dependency. Record first-run failures and their causes.'),
S('Classify before editing','Common classes are timing, shared state, external dependencies, selector ambiguity, environment variance, and real intermittent product bugs. For each suspect, propose a discriminating experiment. Compare one worker with several, mocked dependency with real dependency, or a precise assertion with a fixed sleep.',`npx playwright test tests/ui/shop.spec.ts --project=ui --grep "cart survives a page reload" --retries=0 --repeat-each=10
npx playwright test tests/ui/shop.spec.ts --project=ui --grep "cart survives a page reload" --retries=0 --workers=1
# Use actual discovered spec paths from --list.
# Keep repetitions targeted to a live hypothesis.`),
S('Track failure economics','Record failure count, run count, duration, and investigation time. A flaky check that runs hundreds of times can consume more engineering time than its execution cost suggests. Quarantine requires an owner, reason, and expiry; silently skipping a critical check creates a coverage hole.')
],[
E('06-02-a','Flake investigation worksheet','Investigate one deliberately unstable or suspicious check.',['Run a small targeted repetition sample.','Classify the failure with evidence.','Change one variable and repeat the same sample.'],['Before and after results are recorded.','The proposed cause is supported by an experiment.'],'Ten passes do not mathematically prove stability.','Record 2/10 failures with shared session, then 0/10 with unique sessions under the same worker count. This supports state interference as the cause; keep a longer-term observation plan.'),
E('06-02-b','Retry policy review','Write a policy that preserves flaky outcomes as visible work.',['Choose a small retry budget for CI.','Specify retained artifacts.','Define owner and expiry for quarantined tests.'],['A retry pass is not reported as clean.','Critical coverage gaps are explicit.'],'Policy should make failure cheaper to diagnose, not easier to ignore.','Example: one CI retry with trace on first retry; flaky results tracked; quarantine requires issue, owner, seven-day review and replacement coverage for critical checkout behavior.')
],Q('A test fails once then passes on retry. What do you know?',['The original failure was irrelevant','The outcome is intermittent and needs classification','The product is definitely broken'],1,'The observations establish instability; evidence is still needed to attribute its cause.'),[R('Retries','test-retries'),R('Timeouts','test-timeouts')]),
L('06-03','delivery','A CI pipeline people can trust','Make installation, execution, and evidence reproducible on a clean machine.',65,['CI','GitHub Actions'],
['Install from the lockfile and matching browser binaries','Retain failure artifacts in CI','Keep environment and secrets explicit'],[
S('CI is a fresh-environment experiment','Your laptop may have cached browsers, a running server, and uncommitted files. CI should install declared dependencies, install matching browser dependencies, launch the target through the configured runner, and execute the selected suite. A clean checkout is part of the test.'),
S('Make artifacts survive failure','Reports and traces are most valuable when tests fail. Configure artifact upload with an always condition and a bounded retention period. Avoid uploading storage-state files or unrelated workspace contents. Read the repository’s actual workflow before applying the illustrative sequence.',`# Core steps for a GitHub Actions job (inside jobs.<job>.steps):
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: npm
- run: npm ci
- run: npx playwright install --with-deps chromium
- run: npx playwright test --project=ui
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7`),
S('A green job should have run the intended checks','A pipeline can pass because no tests matched or because all important tests are skipped. Inspect discovered counts and project selection. For a real deployment target, use dedicated test accounts and environment-scoped configuration; the local Forge demo needs no production credentials.')
],[
E('06-03-a','Clean checkout rehearsal','Reproduce the CI sequence locally in a safe separate checkout or clean dependency state.',['Inspect lockfile and scripts.','Run the declared installation and browser commands.','Run the selected project and inspect its report.'],['The commands require no hidden global tools.','The expected test count actually runs.'],'Do not delete a user’s work to simulate cleanliness.','Use an isolated copy or Git worktree if available. npm ci requires a matching lockfile; install browsers for the selected project, then run the exact CI command.'),
E('06-03-b','Failure artifact audit','Review whether a failing run still preserves useful evidence.',['Inspect upload conditions and paths.','Trigger a controlled failure in a branch.','Verify report/trace availability and restore the test.'],['Artifacts upload after test failure.','Sensitive auth state is excluded.'],'A successful upload step is not proof that the directory contained a trace.','Use if: always(), targeted report/test-result paths, and trace capture in config. Download or open the artifact and confirm the failing test has the expected diagnostic files.')
],Q('Why use npm ci in a lockfile-based CI job?',['It silently upgrades all dependencies','It installs the lockfile-defined dependency set and rejects mismatch','It installs browser binaries too'],1,'Reproducible dependency installation is separate from Playwright browser installation.'),[R('Continuous integration','ci'),R('GitHub Actions workflow syntax','https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions')]),
L('06-04','delivery','Browser matrix, sharding, and cost','Spend execution time where it produces new evidence.',55,['browsers','sharding'],
['Choose a risk-based browser matrix','Explain workers versus shards','Merge reports without confusing duplicate execution'],[
S('More runs are useful only when they answer new questions','Chromium provides a fast feedback path, while Firefox and WebKit can reveal engine differences. Mobile emulation tests viewport and input assumptions but is not the same as testing on a physical device. Choose coverage based on the product’s users and risk.'),
S('Workers and shards solve different problems','Workers run tests concurrently within one invocation. Shards split the suite across separate invocations, often separate CI machines. Each shard still needs isolated test data. Sharding does not fix a shared account, and splitting a tiny suite can cost more in setup than it saves.',`# Two separate CI jobs, with the same commit and configuration:
npx playwright test --shard=1/2 --reporter=blob
npx playwright test --shard=2/2 --reporter=blob
# Download both jobs' blob reports into one directory, then:
npx playwright merge-reports --reporter=html ./all-blob-reports`),
S('Run a real browser matrix deliberately','A policy is not execution evidence. The optional playwright.matrix.config.ts supplies ui-chromium, ui-firefox and ui-webkit projects selecting only tests/ui. API checks remain in the normal configuration and are not multiplied across engines. Inspect the matrix, install the matching browsers, and run it using the commands below. Record the projects actually executed and any platform limitation. The default npm test still selects the smaller Chromium and API suite.',`npm run browsers:all
npm run test:matrix -- --list
npm run test:matrix
# Focus one engine during diagnosis:
npm run test:matrix -- --project=ui-firefox` ),
S('Measure before expanding','Compare total wall time, install time, test time, and flake rate. A reasonable small-project policy is a fast Chromium/API pull-request gate plus a broader browser run on a schedule or release candidate. This is a starting decision, not a universal rule.')
],[
E('06-04-a','Propose a browser policy','Design a pull-request and release matrix for the shop.',['Identify the most important customer journeys.','Assign fast and broad execution tiers.','Estimate total runs and explain each browser’s purpose.'],['The policy covers real browser risk.','API tests are not pointlessly multiplied.'],'Separate server contract coverage from rendering coverage.','Example: API + Chromium critical journeys on every change; all UI journeys on Firefox/WebKit before release. Record why mobile viewport coverage matters and what physical-device testing remains manual.'),
E('06-04-b','Shard a measured suite','Split the suite into two shards and merge evidence.',['Record the unsharded duration.','Execute both shards with blob reports.','Merge reports and confirm all intended tests appear once.'],['Merged counts match the intended suite.','Any time saving includes setup overhead.'],'Both shard invocations must use the same test universe.','Use --shard=1/2 and 2/2 from the same commit. Collect each blob report separately, then merge. Compare total wall time with the unsharded baseline; keep sharding only if it helps.')
],Q('What is a shard?',['A browser tab','A portion of the suite assigned to a separate test invocation','A retry of one failed test'],1,'Shards distribute tests across invocations; workers provide concurrency inside an invocation.'),[R('Sharding','test-sharding'),R('Browsers','browsers'),R('Emulation','emulation')]),
L('06-05','delivery','Reports that lead to decisions','Translate results into release evidence and actionable defect reports.',55,['reporting','triage'],
['Write an evidence-based defect report','Separate product, test, and environment failures','Describe residual risk honestly'],[
S('A report is a decision aid','Pass counts alone do not explain readiness. State which risks were exercised, which environment and commit were tested, which failures remain, and what was not covered. A small suite with clear evidence can be more useful than a huge unexplained green number.'),
S('Give defects a reproducible spine','Include the rule, minimal setup, exact action, expected and actual results, and artifacts. Explain impact without inventing severity from emotion. A screenshot shows appearance; a trace or request/response pair helps show cause. Remove secrets from attachments.'),
S('Make test steps tell the story','Named steps improve report navigation when they reflect business phases. Do not wrap every line in a step. A checkout test can use Prepare cart, Submit shipping, and Verify persisted order so the failure lands in a useful context.',`await test.step('Prepare the customer cart', async () => {
  const response = await page.request.post('/api/cart', {
    data: { productId: 'p1', quantity: 1 }
  });
  expect(response.status()).toBe(200);
});
await test.step('Verify the cart total in cents', async () => {
  const cart = await (await page.request.get('/api/cart')).json();
  expect(cart.total).toBe(12900);
});`)
],[
E('06-05-a','One-page release brief','Write a release recommendation from an actual local run.',['Record commit, environment, command, and counts.','Map results to top checkout risks.','State open issues and untested areas.'],['Every result is traceable to a run.','The recommendation includes residual risk.'],'Do not invent pass counts before running the suite.','Template: tested scope; run evidence; failures classified by product/test/environment; critical-risk coverage; untested constraints; recommendation and required follow-up.'),
E('06-05-b','Defect report compression','Turn a long debugging diary into a reproducible defect.',['Choose one observed or controlled failure.','Reduce to minimal setup and steps.','Attach one decisive artifact and state impact.'],['Another learner can reproduce it.','Expected behavior comes from a stated rule.'],'A controlled mutation must be labeled as a training simulation.','Title: quantity zero is rejected after changing the cart. Include session setup, before cart, POST payload/status, after cart, expected unchanged state, and request evidence. If simulated, label it clearly.')
],Q('Which belongs in a release brief?',['Only total passing tests','Covered risks, evidence, failures, and remaining blind spots','Every console line'],1,'Decision-makers need the meaning and limits of the test evidence, not just its volume.'),[R('Reporters','test-reporters'),R('Annotations','test-annotations')]),
L('07-01','agents','AI as a test engineering teammate','Delegate exploration and implementation while keeping the test oracle yours.',50,['AI','judgment'],
['Separate generation quality from test quality','Give an agent a bounded task and evidence requirements','Recognize plausible but ineffective generated checks'],[
S('Fluent code can still test the wrong thing','An agent can produce a beautifully formatted script that clicks through checkout and never verifies the order. Review the claim before reviewing the syntax. The human test engineer owns the product rule, the acceptable evidence, and the decision to keep a proposed change.'),
S('Delegate a small observable task','Provide the target URL, allowed scope, relevant files, known credentials for the local lab, and a concrete definition of done. Require the agent to inspect actual accessible names and API contracts instead of inventing selectors. Ask for exact commands and observed results, including failures.'),
S('Use a reviewable prompt','A useful prompt gives context and constraints without prescribing every line. The output should include the test, its evidence, and any unresolved uncertainty. A passing report is necessary but not sufficient: deliberately break the protected behavior and confirm the test can notice.',`Task: Add one test for invalid cart quantity in the local Forge lab.
Target: http://127.0.0.1:4173. Read docs/lab-api.md first.
Scope: tests and test helpers only; use a fresh session.
Claim: quantity 0 is rejected and the previous cart is unchanged.
Do not remove assertions, add skips, or change the application to pass.
Return: changed files, exact run command, observed result, and remaining uncertainty.`)
],[
E('07-01-a','Prompt with a falsifiable outcome','Write an agent brief for a stockout test.',['State the p5 stock rule.','Specify isolated state and allowed files.','Require rejection and unchanged-cart evidence.'],['The prompt defines success beyond a green run.','The scope prevents unrelated changes.'],'Tell the agent which oracle must survive its implementation choices.','Ask for p5 rejection according to docs/lab-api.md, unchanged preexisting p1 cart, exact execution evidence, and no application changes or skipped assertions.'),
E('07-01-b','Review a convincing weak test','Critique an AI-generated checkout test that only checks a toast.',['Name the false-positive scenario.','Add an independent persistence oracle.','Describe a mutation that should make the test fail.'],['The review addresses behavior, not formatting alone.','The mutation demonstrates meaningful detection.'],'A UI success message can precede a failed persistence write.','Add same-session GET /api/orders matched by order ID, item, quantity and expected total. Simulate a success-looking UI with no persisted order and confirm the stronger check fails.')
],Q('Who should own the expected business behavior in an AI-assisted test?',['The latest generated code','The product requirement and accountable reviewer','Whichever implementation makes CI green'],1,'Agents can propose checks, but the expected behavior must remain grounded in a reviewed requirement.'),[R('Playwright Test Agents','test-agents'),R('Best practices','best-practices')]),
L('07-02','agents','Planner: turn exploration into an executable plan','Use official Playwright agents to make scenarios precise before code exists.',60,['AI','planner','test-plan'],
['Initialize the supported agent definitions','Provide a seed test and local target','Review plans for preconditions, outcomes, and blind spots'],[
S('Know the official agent roles','Playwright documents planner, generator, and healer agents. The planner explores and writes a human-readable plan; the generator turns a plan into tests; the healer investigates and repairs failures. Their generated definitions should be refreshed after upgrading Playwright so tooling and instructions remain aligned.'),
S('Initialize the client definitions','Verify support in your installed package, run the setup matching your agent client, and inspect generated files. Agent definitions are optional; the same planning and review exercises work manually. Definitions do not automatically change the repository’s project discovery rules.',`npx playwright init-agents --help
npx playwright init-agents --loop=codex
# After saving the seed below, verify discovery and execute it:
npx playwright test tests/ui/seed.spec.ts --project=ui --list
npx playwright test tests/ui/seed.spec.ts --project=ui`),
S('Start with a discovered, runnable seed','Save this as tests/ui/seed.spec.ts so the existing ui project discovers it. A file at tests/seed.spec.ts is outside the configured project patterns. Use the actual fixture import and a readiness assertion; a planner must start from known state, not merely a completed navigation. If init-agents generated a different seed path, move or adapt it to the discovered location and pass that path to the planner.',`// tests/ui/seed.spec.ts
import { test, expect } from '../support/fixtures';
test('seed', async ({ page }) => {
  await page.goto('/lab/');
  await expect(page.getByRole('article')).toHaveCount(6);
});`),
S('Review the plan as a specification','A good plan includes the starting session state, concrete data, precise actions, expected UI and server results, and cleanup. Ask it to distinguish observed behavior from assumed requirements. A planner can describe an existing bug as normal behavior unless you supply the intended rule.')
],[
E('07-02-a','A checkout planner brief','Ask the planner for three checkout scenarios using the seed.',['Provide the local URL and contract.','Request success, guest rejection, and empty-cart rejection.','Review the plan before generating tests.'],['Each scenario names setup, action, and expected persistence.','Unverified assumptions are called out.'],'The plan should identify evidence for rejection as well as success.','Require authenticated+filled success, guest+filled 401, and authenticated+empty rejection, with exact contract statuses, cart invariants, and isolated sessions.'),
E('07-02-b','Plan review red team','Find omissions in a plan that says “login, buy item, expect success.”',['Identify missing data and preconditions.','Add independent expected totals.','Add one rejected state transition.'],['A generator could implement the revised plan without guessing business rules.','The negative scenario has a state invariant.'],'Success is not an observable value until defined.','Specify p1 quantity 1, known price 12900, valid shipping fields, returned order ID in order history, empty cart after success, and guest rejection leaving the cart intact.')
],Q('What should the seed test reflect?',['A random public website','The project’s real fixtures and initialization','A screenshot with no environment'],1,'The planner needs a runnable starting environment that matches the suite it will extend.'),[R('Official Playwright agents','test-agents')]),
L('07-03','agents','Generator: from plan to reviewed executable evidence','Use generated tests as a draft that must earn trust.',60,['AI','generator','review'],
['Map generated tests to planned scenarios','Check real locators and fixture imports','Verify generated claims with controlled failures'],[
S('Trace every assertion back to the plan','The generator should transform a reviewed scenario into executable checks. For each important expected result, identify the assertion that protects it. If the plan says the cart remains unchanged after rejection but the test only checks status 400, the translation is incomplete.'),
S('Review the generated diff in layers','First inspect scope: did the agent change the app or configuration unnecessarily? Next inspect isolation, locators, awaited promises, and oracles. Finally run the focused tests and inspect their evidence. A report saying “tests should pass” is not execution evidence.'),
S('Require a result ledger','Ask the agent for the scenario ID, spec path, exact command, outcome, and uncertainty. Keep claims proportional: one passing Chromium run does not prove cross-browser reliability. Generated data and helper abstractions should remain understandable to the learner.',`Generation brief:
Implement scenarios CHK-01 and CHK-02 from specs/checkout.md.
Use the existing fixture module and inspect the live local UI.
Every expected result must map to an assertion.
Run the focused tests. Do not claim tests ran if tooling is unavailable.
Return a table: scenario ID | spec | command | actual result | open issue.
Stop and report a product defect instead of weakening a required oracle.`)
],[
E('07-03-a','Assertion traceability review','Review generated code against a three-scenario plan.',['List each expected result from the plan.','Map it to a specific assertion.','Add or request missing checks.'],['No critical expected result is unmapped.','Assertions use independently chosen expected values.'],'One test can contain multiple distinct oracles.','Map CHK-01 total to toBe(12900), order persistence to same-ID order list lookup, and cart clearing to items:[]. Record missing mappings as review findings before accepting the generated diff.'),
E('07-03-b','Mutation test the generated oracle','Challenge one generated test with a reversible local defect or mocked incorrect response.',['Choose the behavior the test claims to protect.','Introduce a controlled violation.','Confirm failure, restore the change, and confirm success.'],['The violation is detected for the intended reason.','The baseline is restored afterward.'],'Do not publish the deliberate defect as a real product issue.','For a discounted-total check, supply a cart total without the discount in a controlled mock or temporary local change. The expected 11610 assertion must fail; restore and rerun.')
],Q('Which is valid execution evidence?',['The agent says the code looks correct','An exact command and observed result from the actual run','A test file exists'],1,'Code generation and execution are separate steps, and both need review.'),[R('Playwright Test Agents','test-agents'),R('Test generator','codegen')]),
L('07-04','agents','Healer: repair tests without erasing defects','Protect the oracle when an agent tries to turn red into green.',65,['AI','healer','debugging'],
['Distinguish locator drift from product regressions','Bound automatic repair scope','Reject skips and weaker assertions as unexplained repairs'],[
S('A red test can be correct','If a checkout total is wrong, the right output is a defect report and a failing test. If a button’s accessible name intentionally changed, updating the locator may be appropriate. The healer’s job must be constrained by the requirement; green is not the only acceptable outcome.'),
S('Use a repair contract','Supply the failing test, trace, relevant requirement, allowed files, and forbidden shortcuts. Require a causal explanation before accepting a patch. Official agent behavior can include skipping a test when functionality appears broken; treat any such skip as an explicit review item rather than restored coverage.'),
S('Compare the before and after oracle','A locator repair preserves the assertion’s meaning. Replacing exact total equality with visibility does not. Increasing timeout may be justified by measured latency, but adding force, retries, or catch-and-ignore can hide an actual defect.',`Repair brief:
Investigate the discounted checkout test you wrote in lesson 04-05.
Supply its actual spec path, failing command, and trace path.
Preserve: order total equals 11610 cents after SAVE10 on p1.
Allowed: test locators/helpers supported by observed UI changes.
Do not: skip, delete assertions, change expected totals, modify the app,
add arbitrary sleeps, or catch assertion failures.
Return: root cause evidence, smallest diff, focused rerun result.
If behavior violates the rule, report the defect and keep the test failing.`)
],[
E('07-04-a','Repair a renamed control','Give an agent a test with an intentionally stale accessible name.',['Capture the failure trace.','Provide the intended behavior and current control evidence.','Review that only the locator changes and rerun.'],['The repair is justified by observed UI.','The original business assertion remains intact.'],'A locator update is safe only if it still identifies the same action.','Update the stale name to the actual observed accessible name, retain cart/order assertions, and show both the diff and focused passing run.'),
E('07-04-b','Reject a false-green patch','Review a patch that changes total equality to toBeGreaterThan(0).',['Identify the lost requirement.','Write a concise rejection with a counterexample.','Request a root-cause investigation instead.'],['The review names the exact coverage loss.','The expected business value remains protected.'],'A positive but incorrect total now passes.','Reject: 12900 without SAVE10 is greater than zero but violates the required 11610 total. Keep equality, inspect promo response and order calculation, and report a product defect if confirmed.')
],Q('A healer makes a failing total check pass by removing it. Is coverage restored?',['Yes, the suite is green','No, the protected behavior is no longer checked','Only if retries are enabled'],1,'A passing result after deleting the oracle is a coverage loss, not a repair.'),[R('Official healer documentation','test-agents'),R('Trace viewer','trace-viewer')]),
L('07-05','agents','Build your AI testing operating system','Create reusable instructions, evidence gates, and a personal learning loop.',65,['AI','workflow','evaluation'],
['Write a practical repository instruction brief','Evaluate generated tests by outcomes','Use AI to accelerate learning without outsourcing understanding'],[
S('Make the local rules easy to find','An agent works better with a small accurate map: target URL, start/test commands, fixture import, API contract path, naming conventions, and required evidence. Keep secrets out. Explain state ownership and the prohibition on weakening assertions to hide product defects.'),
S('Evaluate the workflow, not its confidence','Compare manual and agent-assisted work on a fixed task. Measure time to a reviewed test, defects detected, review corrections, and reproducibility. Token count or code volume is not a quality metric. A generated suite that requires heavy debugging may still be useful, but its cost should be visible.'),
S('Use explain-back as a learning gate','Before accepting a generated test, explain every locator, await, fixture dependency, and assertion in your own words. Ask the agent for a counterexample that would pass the current test incorrectly. Then improve the test yourself and retain a short learning note.',`Repository agent brief outline:
1. Local target and documented commands
2. Fixture and session ownership rules
3. Selector preference: role/label, scoped by intent
4. API contract and integer-cent money rules
5. Required outcome assertions and negative-state invariants
6. Allowed change scope and no false-green shortcuts
7. Evidence: exact commands, actual results, trace for failures
8. Unknowns must be labeled; generated plans are reviewable artifacts`)
],[
E('07-05-a','Write a reusable agent brief','Create a concise local instruction file for future test work.',['Fill the outline with actual project commands and paths.','Add one good and one bad test example.','Use it on a small task and record corrections needed.'],['Instructions match the repository.','The brief protects meaningful assertions and state isolation.'],'Do not copy a generic instruction wall with nonexistent commands.','Include npm scripts actually present, /lab/ target, docs/lab-api.md, unique sessions, integer cents, exact run evidence, and the rule to report product defects rather than removing assertions.'),
E('07-05-b','Agent workflow scorecard','Compare two implementations of the same validation test.',['Define the same task and acceptance criteria.','Record time, review fixes, and mutation detection.','Choose which workflow you would repeat and explain why.'],['Both outputs face the same evaluation.','The conclusion is based on evidence, not confidence or line count.'],'A shorter implementation can still be weaker.','Score correctness, independence, readability, diagnostic quality, and mutation detection. Record review time as part of cost. Keep the workflow that reaches trustworthy evidence with fewer hidden assumptions.')
],Q('Which is the best metric for an AI testing workflow?',['Lines generated per minute','Time to reviewed, reproducible tests that detect the intended defects','How confident the agent sounds'],1,'The workflow should optimize trustworthy evidence and learning, not output volume.'),[R('Playwright Test Agents','test-agents'),R('Best practices','best-practices')]),
L('08-01','capstone','The checkout quality charter','Define a portfolio project around risk, evidence, and a clear finish line.',70,['capstone','strategy'],
['Write a bounded test charter','Map critical risks to test layers','Define delivery evidence and limitations'],[
S('Your mission','Deliver a credible quality assessment of Forge Shop checkout. Your audience is a developer deciding whether a change is safe and a reviewer deciding whether you can engineer tests. The deliverable is a small reliable suite with clear reasoning, not the largest possible test count.'),
S('Define acceptance before implementation','Cover catalog discovery, authenticated purchase, quantity validation, stockout rejection, guest rejection, discount arithmetic, order persistence, and session isolation. Choose which claims need UI evidence and which are clearer through the API. Include at least one controlled failure to demonstrate that a critical oracle works.'),
S('Bound the claim','This local teaching app has simplified authentication, in-memory data, and no real payment gateway. Your portfolio should say that directly. Do not claim payment security, production performance, legal compliance, or complete accessibility from this exercise.',`Capstone charter:
Goal: protect the customer checkout contract in the local lab.
Critical risks: wrong money, lost orders, invalid mutation, session leakage.
Layers: fast API invariants + focused UI journeys + manual keyboard review.
Evidence: runnable specs, report, trace, risk map, defect report, README.
Finish: clean reproducible run, reviewed failures, one mutation detected,
       and a written statement of untested production concerns.`)
],[
E('08-01-a','Write your quality charter','Create a one-page charter with measurable finish criteria.',['Name the stakeholder and release question.','Rank eight checkout risks.','Define evidence and explicit out-of-scope areas.'],['Every critical risk has planned evidence.','The charter avoids unsupported production claims.'],'Use the shop’s actual features and contract.','A strong charter maps wrong totals to exact cent assertions, lost orders to persisted IDs, invalid mutations to unchanged state, and session leakage to two-context checks, with UI coverage for customer flow.'),
E('08-01-b','Coverage budget challenge','Choose ten tests from fifteen candidate ideas.',['List the risk each candidate addresses.','Remove duplicates with no distinct evidence.','Explain one important manual investigation.'],['The suite covers all highest-ranked risks.','Tradeoffs are documented.'],'A low-level duplicate is cheaper than another browser journey but can still be redundant.','Keep API boundaries for quantities and auth, one full checkout, one discounted hybrid journey, one keyboard investigation, and independent session checks. Reject repeated happy paths that assert identical outcomes.')
],Q('What makes a capstone credible?',['A huge test count','Reproducible evidence tied to explicit risks and limits','A claim of complete coverage'],1,'Reviewers need to understand what the suite protects, how it proves it, and what remains unknown.'),[R('Best practices','best-practices'),R('API testing','api-testing')]),
L('08-02','capstone','Build the critical-path suite','Implement the charter in small slices that can be reviewed and trusted.',90,['capstone','implementation'],
['Deliver independent critical-path tests','Use focused abstractions only where justified','Demonstrate repeatable execution'],[
S('Implement vertical slices','Start with one risk, its setup, operation, oracle, and report evidence. Complete that slice before scaffolding a large framework. A useful sequence is catalog contract, valid cart mutation, invalid mutation, valid order, and one browser purchase. Each completed slice teaches you what helpers are actually needed.'),
S('Keep the suite independent','Every test should establish its own session and required state. Reuse a shipping builder and a small API helper where they reduce duplication, but keep expected business values in the spec. Avoid a numbered chain of tests that only passes in one order.'),
S('Review against the charter','Run the focused tests first, then the selected complete matrix. Confirm actual test counts, no accidental only markers, and no unexplained skips. A passing local run is a baseline; retain enough commands and artifacts for another person to reproduce it.',`Implementation checklist:
[ ] API catalog shape and known price
[ ] Cart set-quantity semantics
[ ] Invalid quantity leaves state unchanged
[ ] Stockout rejection
[ ] Guest order rejection
[ ] Successful persisted order and cleared cart
[ ] SAVE10 arithmetic
[ ] Separate customer sessions
[ ] UI product discovery and complete checkout
[ ] Focused keyboard or visual evidence`)
],[
E('08-02-a','Deliver the first five slices','Implement five independent tests covering catalog, cart, rejection, order, and UI discovery.',['Build one test to completion at a time.','Extract only repeated stable setup.','Run each alone and the group together.'],['Every test passes independently.','Expected money and quantities are explicit.'],'If a test needs another test to run first, move that setup into its own fixture.','Use a unique session fixture, small valid shipping builder, and direct assertions. Keep catalog read-only; use page.request for browser-owned hybrid setup.'),
E('08-02-b','Independence audit','Try to break the suite by changing execution conditions.',['Run selected tests alone.','Run multiple workers and a targeted repeat sample.','Inspect shared files, sessions, and reset behavior if results diverge.'],['No ordering dependency remains.','Any intermittent result has a recorded investigation.'],'Independence is demonstrated by evidence, not a folder name.','Run the discovered specs with --workers=1 and --workers=4, then a small --repeat-each sample. Repair ownership issues rather than disabling parallelism globally.')
],Q('When should a large helper framework be created?',['Before any test exists','When repeated stable behavior demonstrates a useful abstraction','Whenever generated code is long'],1,'Let real scenarios reveal the right abstraction boundaries.'),[R('Fixtures','test-fixtures'),R('Parallelism','test-parallel')]),
L('08-03','capstone','Adversarial testing and defect investigation','Challenge your own suite with plausible failures and honest uncertainty.',80,['capstone','mutation','defects'],
['Design controlled faults for critical rules','Distinguish a product issue from an incorrect expectation','Produce minimal reproductions'],[
S('Try to fool your tests','A test suite deserves an adversary. Ask whether it detects a missing discount, a wrong quantity, a success toast without persistence, or a cart shared between sessions. Controlled local mutations or mocks can reveal weak oracles without waiting for a real regression.'),
S('Keep experiments reversible and labeled','Use a local branch, temporary route, or synthetic fixture. Record the deliberate change and restore it after the experiment. A mocked failure demonstrates the test’s sensitivity at that boundary; it does not prove the real server contains the defect.'),
S('Investigate unexpected results','When an exercise reveals a mismatch, read the contract, reproduce minimally, inspect request and response, and classify the result. If the requirement is ambiguous, record the ambiguity rather than inventing a rule. A well-supported unresolved question is more valuable than a confident unsupported bug report.',`Fault experiment record:
Rule: p1 + SAVE10 totals 11610 cents.
Fault: response total changed to 12900 in a controlled mock.
Expected detector: exact total assertion.
Observed: assertion fails with expected 11610 / received 12900.
Restore: remove the mock and rerun the baseline.
Limit: demonstrates oracle sensitivity, not a production defect.`)
],[
E('08-03-a','Three oracle challenges','Challenge money, persistence, and isolation checks.',['Choose one controlled fault per rule.','Run the corresponding test and capture failure evidence.','Restore each fault and rerun cleanly.'],['All three faults are detected for the intended reason.','The repository ends without deliberate defects.'],'A setup crash is not evidence that the intended oracle works.','Money: wrong total. Persistence: no matching order despite success UI. Isolation: intentionally shared session. For each, identify the exact assertion that detects the violation.'),
E('08-03-b','A professional defect packet','Create a minimal reproducible report for one real finding or clearly labeled simulation.',['Reduce the scenario to essential requests/actions.','Attach expected versus actual evidence.','State impact, environment, and uncertainty.'],['The report is reproducible.','Simulation and real observations are not confused.'],'Include the invariant, not just a screenshot.','For a partial-mutation simulation, include seeded cart JSON, invalid POST body/status, resulting cart JSON, expected unchanged state, exact command, and a note that the fault was intentionally injected.')
],Q('If a controlled fault makes setup crash before the target assertion, what have you proved?',['The oracle detects the intended defect','Only that the setup failed under the experiment','Complete coverage'],1,'The intended oracle must actually be reached and fail for the expected reason.'),[R('Mock APIs','mock'),R('Trace viewer','trace-viewer')]),
L('08-04','capstone','Package a portfolio another engineer can run','Turn code into a clear, reproducible demonstration of engineering judgment.',80,['portfolio','documentation','CI'],
['Write a runnable project guide','Publish meaningful artifacts without sensitive state','Explain architecture and tradeoffs succinctly'],[
S('Optimize for the reviewer’s first ten minutes','A reviewer should understand the problem, start the target, run a focused suite, inspect evidence, and find your design decisions quickly. A polished portal helps discovery, but the README and actual commands establish credibility. Test the instructions on a clean environment when possible.'),
S('Show the decisions that matter','Explain why API setup is used, why sessions are per test, why totals use integer cents, and why some checks remain manual. Include a compact risk-to-test map and one instructive defect report. Do not bury the reader in an exhaustive diary of every edit.'),
S('Keep artifacts honest and safe','Include generated report examples only when they come from actual runs and identify the commit/environment. Avoid committing auth-state files, tokens, or private traces. A screenshot of a green report is a preview; the repository should still let the reviewer reproduce the result.',`Portfolio README outline:
1. Problem and tested scope
2. Prerequisites and exact quickstart commands
3. Test layers and directory map
4. Risk-to-test coverage table
5. State isolation and data strategy
6. CI and report/trace workflow
7. Known limitations and open findings
8. AI assistance used, reviews performed, and lessons learned`)
],[
E('08-04-a','Ten-minute reviewer journey','Write and test a concise portfolio quickstart.',['Ask what a reviewer needs before the first command.','Document actual setup and one focused run.','Follow the instructions from a clean shell and fix omissions.'],['Commands are accurate.','A reviewer can find the report and critical tests.'],'Do not claim a command works because it resembles another project.','Document the actual package scripts, supported Node version, browser installation, target URL, focused test command, and report command. Record any platform prerequisites.'),
E('08-04-b','Evidence and disclosure page','Create a short engineering narrative for your capstone.',['Describe three design decisions and their tradeoffs.','Include one real run and one oracle challenge.','Disclose AI assistance and remaining limitations.'],['Claims point to evidence.','The narrative shows your judgment rather than only generated output.'],'Explain one approach you rejected and why, without recounting every draft.','Example decisions: unique sessions for parallelism; API setup to focus UI tests; exact cents to catch money bugs. Include actual run command/date and the controlled discount-fault result.')
],Q('What is the strongest portfolio evidence?',['A badge without a reproducible command','Runnable tests, documented decisions, and traceable real results','A claim that AI generated everything instantly'],1,'A reviewer should be able to inspect the reasoning and reproduce the outcome.'),[R('CI','ci'),R('Reporters','test-reporters')]),
L('08-05','capstone','The final review and your next 90 days','Defend your work, identify your gaps, and turn practice into a durable skill.',75,['assessment','career','practice'],
['Explain the suite without relying on generated commentary','Assess evidence quality against a rubric','Plan targeted follow-up practice'],[
S('Demonstrate, explain, challenge','Run one critical test, explain every important line, then deliberately change the protected behavior and show the failure. Diagnose a second test from a trace. These tasks reveal understanding more clearly than memorizing an API list.'),
S('Use a balanced rubric','Use the eight weighted dimensions in docs/ASSESSMENT.md: risk analysis, UI coverage, API coverage, state and architecture, diagnosis, delivery, nonfunctional investigation, and documentation. The rubric totals 100 points; aim for at least 80 with no blocking integrity or critical-coverage failures. Beautiful abstractions cannot compensate for incorrect oracles, and many assertions cannot compensate for shared mutable state. Use the capstone manual’s rubric as the detailed review guide.'),
S('Plan practice around evidence gaps','For the next month, repair your weakest area with a small weekly challenge. Then add a second domain, such as an issue tracker or booking flow, to avoid memorizing this shop. Finally contribute a reviewed test change to a real project. Continue using AI for explanation and drafts while retaining explain-back and mutation checks.',`90-day practice ladder:
Days 1–30: one focused drill each week on your weakest rubric dimension.
Days 31–60: apply the framework ideas to a different local domain.
Days 61–90: deliver a reviewed change with CI evidence in a real project.
Weekly log: claim tested → evidence → failure learned from → next question.
Success measure: clearer, more reproducible decisions, not more lines of tests.`)
],[
E('08-05-a','Twenty-minute technical defense','Record an extended rehearsal of your capstone; the portfolio manual also provides a shorter ten-minute presentation format.',['Run a critical test and explain setup/oracle/cleanup.','Show one controlled failure and its diagnosis.','Explain one limitation and one next improvement.'],['You can explain every important line.','The demonstration uses actual observed results.'],'If you cannot explain a generated helper, simplify it before the review.','Structure: 3-minute risk map, 5-minute test walkthrough, 5-minute failure investigation, 4-minute architecture tradeoffs, 3-minute limits and next steps.'),
E('08-05-b','Personal improvement contract','Choose three measurable follow-up goals based on your review.',['Score the eight rubric dimensions honestly.','Select the weakest two plus one new domain challenge.','Define a weekly deliverable and review date.'],['Goals produce inspectable artifacts.','The plan is tied to observed gaps.'],'“Learn more Playwright” is not measurable.','Example: week 1 repair two shared-state tests and prove parallel independence; week 2 diagnose three traces; week 3 create a booking-state model; week 4 deliver five reviewed tests in that domain.')
],Q('Which best demonstrates that you understand your suite?',['Reciting Playwright method names','Explaining the oracle and showing it detect a controlled defect','Adding more helper layers'],1,'Understanding includes why a test passes, when it should fail, and what its evidence cannot establish.'),[R('Playwright documentation','intro'),R('Best practices','best-practices')])
];
