// Optional runway before the original curriculum. Existing lesson IDs remain unchanged.
export const beginnerLessons = [
  {
    "id": "00-01",
    "stage": "foundations",
    "title": "Your computer is the workshop",
    "summary": "Find the project folder, distinguish the terminal from the browser, and get one known test running.",
    "minutes": 50,
    "level": "Absolute beginner",
    "tags": [
      "beginner",
      "setup",
      "terminal"
    ],
    "objectives": [
      "Identify the editor, terminal, browser and project root",
      "Run a command from the correct folder and recognize its result",
      "Stop and restart the local server without losing saved study notes"
    ],
    "sections": [
      {
        "heading": "Four places, four jobs",
        "body": "The editor changes saved source files. A terminal runs commands in a working directory: the folder it currently points at. The browser displays a URL. The test runner reads spec files and executes their checks. A terminal command such as npm ci belongs in the terminal, not the browser address bar, a .ts file or the browser developer console. Open the extracted academy folder in an editor; package.json, server.mjs and README.md should be visible together. This is the project root."
      },
      {
        "heading": "Install once, verify each prerequisite",
        "body": "Use the BEGINNER-START guide for macOS, Windows PowerShell and Linux steps. Install Node 24 (this repo requires at least 22.13), reopen your terminal, then check node --version and npm --version. Node runs JavaScript outside the browser; npm installs the project packages. npm ci reads the supplied lockfile. Playwright also needs its matching browser binary. Do not create another project with npm init playwright inside this one.",
        "code": "node --version\nnpm --version\nnode -p \"process.cwd()\"\n# Confirm package.json is in this folder before continuing.\nnpm ci\nnpx playwright install chromium\nnpm run test:beginner -- --grep BG-05"
      },
      {
        "heading": "Know when a command has finished",
        "body": "A test command prints a summary and returns your terminal prompt. BG-05 should report one passed test. A skipped result means the test body did not run. npm run local starts a long-running server; leaving that terminal occupied is expected. Use a second terminal for tests. Press Control+C in the server terminal to stop it, then run npm run local to restart. On Windows the key is also Control+C. Never close while a local progress save is still pending."
      },
      {
        "heading": "Two different local addresses",
        "body": "Your study portal and manually explored shop use http://127.0.0.1:4173. Tests start and stop their own isolated service on 4175. localhost/127.0.0.1 means this computer; the port selects a service. Opening index.html with file:// is not starting a server. The hosted portal contains lessons, but its URL does not provide the local shop API. Test browsers use disposable study storage and must not be pointed at your personal SQLite record."
      }
    ],
    "exercises": [
      {
        "id": "00-01-a",
        "title": "Find your bearings",
        "brief": "Create a short setup log before installing anything.",
        "steps": [
          "Open the project folder in an editor and terminal.",
          "Record the working directory and Node/npm versions.",
          "Identify README.md, package.json and beginner/worked.spec.ts."
        ],
        "acceptance": [
          "The terminal points at the folder containing package.json.",
          "You can explain where commands, source code and URLs belong."
        ],
        "hint": "A ZIP may extract to a parent folder containing another folder; inspect before running npm.",
        "solution": "Example log: macOS; project root /my/projects/forge; Node v24.x; npm version as printed. package.json names scripts, worked.spec.ts contains runnable examples, and the browser needs an http:// URL."
      },
      {
        "id": "00-01-b",
        "title": "One known successful run",
        "brief": "Run BG-05 before editing a starter.",
        "steps": [
          "Install project packages and Chromium.",
          "Run npm run test:beginner -- --grep BG-05.",
          "Record passed/failed/skipped count and the spec path; use the guide if setup fails."
        ],
        "acceptance": [
          "Exactly one test executes and passes.",
          "You can distinguish an installation failure from a failed assertion."
        ],
        "hint": "The supplied config owns port 4175; you do not need to start the personal server for this test.",
        "solution": "Expected: one passed test from beginner/worked.spec.ts in the beginner project. Executable missing means install Chromium; no package.json means fix the working directory. Keep the original error if the environment cannot run it."
      }
    ],
    "quiz": {
      "question": "Where should npm ci be entered?",
      "options": [
        "In the terminal at the project root",
        "In the browser address bar",
        "Inside a TypeScript spec"
      ],
      "answer": 0,
      "explanation": "The terminal invokes npm, which reads package.json and the lockfile from this project."
    },
    "resources": [
      {
        "title": "Node downloads",
        "url": "https://nodejs.org/en/download"
      },
      {
        "title": "Playwright installation",
        "url": "https://playwright.dev/docs/intro"
      }
    ]
  },
  {
    "id": "00-02",
    "stage": "foundations",
    "title": "Read small pieces of JavaScript",
    "summary": "Learn values, names, objects, arrays and functions before using them inside a browser test.",
    "minutes": 65,
    "level": "Absolute beginner",
    "tags": [
      "beginner",
      "JavaScript",
      "TypeScript",
      "data"
    ],
    "objectives": [
      "Tell a number, string and boolean apart",
      "Read an object field and an array item",
      "Call a function with inputs and compare its result with a separately chosen answer"
    ],
    "sections": [
      {
        "heading": "Values and names",
        "body": "A string is text in quotes, such as \"2\". A number such as 2 supports arithmetic. A boolean is true or false. const gives a value a name; let permits later reassignment. The equals sign in const quantity = 2 assigns a value. Three equals signs compare values and types. Semicolons end statements; // begins a comment. Predict BG-01 before running it: quoted digits and numbers are different.",
        "code": "const quantity = 2;\nconst priceCents = 12900;\nconst totalCents = priceCents * quantity; // 25800\nconst label = \"Studio Headphones\";\nconst available = true;\n// \"2\" + 1 is \"21\"; 2 + 1 is 3.\n// typeof quantity is \"number\"."
      },
      {
        "heading": "Containers you can inspect",
        "body": "An object groups named fields in braces. A dot reads a field. An array is an ordered collection in square brackets; its first item is at index 0 and .length is its size. Object braces describe data here; braces also surround function bodies in other positions. In BG-02, check both product names in order, not just the number of items. const prevents reassignment of a variable but does not freeze fields inside its object. Calling names.push(\"Focus Lamp\") appends another item. In a typed declaration, number[] means an array whose items are numbers; an empty array is [].",
        "code": "const product = { name: \"Studio Headphones\", price: 12900 };\nconst names = [product.name, \"Mechanical Keyboard\"];\n// product.price -> 12900\n// names[0] -> \"Studio Headphones\"\n// names.length -> 2"
      },
      {
        "heading": "Functions, choices and repetition",
        "body": "A function groups instructions you can call with arguments. Its parameters name those inputs, and return gives the result back to its caller. In TypeScript, : number describes an expected input type; it is not a runtime conversion. if chooses a branch. && means both conditions must hold. A for...of loop takes one item from an array at a time. Use a plain function before learning the shorter arrow form. The exclamation mark ! means not, so !Number.isInteger(quantity) is true when the value is not an integer. Parentheses after a function name call it; the values inside are its arguments.",
        "code": "function lineTotal(price: number, quantity: number): number {\n  return price * quantity;\n}\nfunction allowedQuantity(quantity: number): boolean {\n  if (!Number.isInteger(quantity)) return false;\n  return quantity >= 1 && quantity <= 99;\n}\n// lineTotal(12900, 2) returns 25800.\n// allowedQuantity(0) returns false.\n// Schema validity does not guarantee that stock is available."
      },
      {
        "heading": "An assertion is a check with a consequence",
        "body": "expect(actual).toBe(expected) fails when primitive values differ. toEqual compares the contents of objects or arrays. Choose expected values from the stated rule before running the code. Expecting a result to equal itself proves nothing. BG-01 through BG-03 do not open a browser; they let you practice the language in the same runner. Follow them with 01-03 for deeper TypeScript and boundary design."
      }
    ],
    "exercises": [
      {
        "id": "00-02-a",
        "title": "Predict, then calculate",
        "brief": "Complete BG-01 and BG-02 one at a time.",
        "steps": [
          "Write the type and expected total for quantity 2 at 12900 cents.",
          "Read the two names from an object and array.",
          "Remove only the selected starter skip and implement its checks."
        ],
        "acceptance": [
          "The total is independently expected as 25800.",
          "The numeric/text distinction and the complete name sequence are checked."
        ],
        "hint": "Use toBe for a number and toEqual for the array.",
        "solution": "See beginner/worked.spec.ts BG-01 and BG-02. Numeric 2 is not the string \"2\"; object.price reads a field, and the first array position is zero."
      },
      {
        "id": "00-02-b",
        "title": "A function you can explain",
        "brief": "Implement BG-03 and predict each call.",
        "steps": [
          "Define a quantity function with an integer check and bounds 1–99.",
          "Check 0, 1, 99, 100 and 1.5 against literal expected booleans.",
          "Temporarily make zero valid; show the zero assertion fail, then restore."
        ],
        "acceptance": [
          "Both accepted boundaries and rejected neighbors execute.",
          "Expected booleans do not call the same function being tested."
        ],
        "hint": "Number.isInteger(1.5) is false.",
        "solution": "The solution rejects non-integers, then requires quantity >= 1 && quantity <= 99. This only checks the stated schema rule, not availability in the shop."
      }
    ],
    "quiz": {
      "question": "What is names[0]?",
      "options": [
        "The first array item",
        "The last array item",
        "The number of items"
      ],
      "answer": 0,
      "explanation": "Array indexing starts at zero; names.length gives the number of items."
    },
    "resources": [
      {
        "title": "MDN variables",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables"
      },
      {
        "title": "TypeScript for new programmers",
        "url": "https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html"
      }
    ]
  },
  {
    "id": "00-03",
    "stage": "foundations",
    "title": "What happens between a click and a response",
    "summary": "Connect HTML, accessible controls, URLs, HTTP and JSON to the local shop.",
    "minutes": 45,
    "level": "Absolute beginner",
    "tags": [
      "beginner",
      "HTML",
      "HTTP",
      "JSON"
    ],
    "objectives": [
      "Describe the browser-to-server request/response path",
      "Separate a response status from the data inside its body",
      "Read a small JSON object and identify a UI control by role and name"
    ],
    "sections": [
      {
        "heading": "A page is more than its pixels",
        "body": "HTML describes structure such as headings, labels and buttons. CSS controls presentation. JavaScript changes behavior. The browser builds a document tree called the DOM. A button has the role button; its visible text or associated label can give it an accessible name. Playwright can locate that meaning with getByRole instead of a fragile screen coordinate. Not every visible paragraph is a heading, so use the element role rather than guessing from its font size."
      },
      {
        "heading": "Read a URL",
        "body": "In http://127.0.0.1:4173/api/products?search=head, http is the protocol, 127.0.0.1 is the local host, 4173 is the port, /api/products is the path, and search=head is a query parameter. A portal #/lesson/00-03 fragment selects a learning page in the browser; it is not an API path. With npm run local running, visit the catalog URL in a browser to see data. Use only this practice service."
      },
      {
        "heading": "A request asks; a response answers",
        "body": "GET reads the catalog. POST submits data such as a cart quantity. A response has a status number, headers describing metadata, and a body. In this lab, 200 means that a catalog read succeeded, 400 rejects an invalid quantity, 401 means sign-in is required, and 404 means an item or route was not found. Status alone does not prove that the returned product is correct. The exact lab contract is docs/lab-api.md."
      },
      {
        "heading": "JSON is text that represents data",
        "body": "JSON uses double-quoted property names and strings, numeric values without quotes, arrays and objects. It cannot contain comments or functions. response.json() parses JSON text into JavaScript values; it does not validate their meaning. Here products is an array, products[0].name reads its first name, and total is a number.",
        "code": "{ \"products\": [{ \"id\": \"p1\", \"name\": \"Studio Headphones\" }], \"total\": 1 }"
      },
      {
        "heading": "Observe before automating",
        "body": "In the local shop, open browser developer tools, choose Network, then search for head. Find the products request and inspect its URL, status and response. Use the filter to avoid unrelated fonts or files. Developer tools observe a manual browser; the terminal runs Playwright. Describe the same behavior as input → request → response → displayed result before trying BG-07."
      }
    ],
    "exercises": [
      {
        "id": "00-03-a",
        "title": "Follow one search",
        "brief": "Inspect the local shop search manually.",
        "steps": [
          "Start npm run local and open /lab/.",
          "Search for head while observing Network.",
          "Record the request query, status, first product name and displayed product."
        ],
        "acceptance": [
          "The API and UI observations refer to the same search.",
          "Your note distinguishes response metadata from body data."
        ],
        "hint": "If you only see the portal document, open the shop at /lab/ first.",
        "solution": "Expected search=head, status 200, products[0].name Studio Headphones and total 1. The shop displays Studio Headphones; a 200 with a different name would still be wrong."
      },
      {
        "id": "00-03-b",
        "title": "Translate a tiny contract",
        "brief": "Read the JSON example and write a manual test case.",
        "steps": [
          "Name setup and action.",
          "State expected status and product name independently.",
          "Name a bug that status 200 alone would miss."
        ],
        "acceptance": [
          "The case contains setup, action and expected result.",
          "The expected name comes from the catalog contract."
        ],
        "hint": "Treat a manual test case as a recipe with a checkable outcome.",
        "solution": "Setup: local shop service available. Action: GET /api/products?search=head. Expected: 200, total 1, exact first product ID p1/name Studio Headphones. A server ignoring search could still return 200."
      }
    ],
    "quiz": {
      "question": "Does a 200 response prove that search returned the correct product?",
      "options": [
        "Yes, every 200 body is correct",
        "No, inspect the body against the expected result",
        "Only when the response is fast"
      ],
      "answer": 1,
      "explanation": "Transport/application success and business correctness are separate observations."
    },
    "resources": [
      {
        "title": "MDN web basics",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works"
      },
      {
        "title": "Playwright locators",
        "url": "https://playwright.dev/docs/locators"
      }
    ]
  },
  {
    "id": "00-04",
    "stage": "foundations",
    "title": "Your first browser test, line by line",
    "summary": "Understand the test wrapper, page, locator, await and assertion before editing a starter.",
    "minutes": 60,
    "level": "Absolute beginner",
    "tags": [
      "beginner",
      "UI",
      "async",
      "locators"
    ],
    "objectives": [
      "Explain the parts of a complete runnable spec",
      "Wait for an operation whose result the next line needs",
      "Verify visible search results and recovery with literal expectations"
    ],
    "sections": [
      {
        "heading": "Read a complete test",
        "body": "This is the complete BG-05 example in beginner/worked.spec.ts. import brings test and expect into the file. The project support module supplies ordinary Playwright tools plus a fresh training session. test registers a named check. The callback runs later when the runner selects it. ({ page }) takes the provided page from the callback argument; it is not a page you must create manually. The => symbol introduces an arrow function: the code inside its following braces is the callback body. test receives two arguments separated by a comma: a readable title and that function. The final }); closes the function body and the call. A method is a function attached to an object; page.goto(...) is one such call.",
        "code": "import { test, expect } from '../tests/support/fixtures';\n\ntest('BG-05 · Open the shop and check its heading', async ({ page }) => {\n  await page.goto('/lab/');\n  await expect(page.getByRole('heading', {\n    name: 'Good tools. Great work.', exact: true\n  })).toBeVisible();\n});"
      },
      {
        "heading": "Read an async line without magic",
        "body": "A promise represents a result that may not be available yet. async permits await inside a function. await pauses this function until the awaited operation resolves or rejects. It is not a fixed sleep. In BG-04, Promise.resolve supplies a small promised value; the loop awaits each value before recording it. In a browser test, await page.goto establishes navigation before the next check. Most Playwright actions and locator assertions need await."
      },
      {
        "heading": "A locator describes; an assertion checks",
        "body": "page.getByRole returns a locator describing the desired control. It does not itself check visibility. toBeVisible checks the outcome and retries while waiting for the condition within its timeout. exact: true requires the full accessible name. A click finishing successfully does not prove the server saved anything. Keep actions and result assertions visibly separate."
      },
      {
        "heading": "Edit one starter and run one named test",
        "body": "Open beginner/practice.spec.ts. Remove .skip from BG-05 only; replace its failing sentinel with the heading check. Save the file. Run npm run test:beginner:practice -- --grep BG-05. Compare the solution only after attempting it. In BG-06, an impossible search produces No products found and zero articles; searching head afterward produces exactly one article named Studio Headphones.",
        "code": "npm run test:beginner -- --grep BG-05\nnpm run test:beginner:practice -- --grep BG-05\n# A visible browser is optional:\nnpm run test:beginner:practice -- --grep BG-05 --headed"
      },
      {
        "heading": "A safe failure teaches the assertion",
        "body": "In your starter, temporarily expect the heading This heading does not exist. Run the same command and read the locator timeout and spec line. The app still works; your expectation is deliberately wrong. Restore the correct name and rerun. If the failure is a missing browser or occupied port, solve setup first; it is not evidence that the assertion detected the wrong heading."
      }
    ],
    "exercises": [
      {
        "id": "00-04-a",
        "title": "Sequence and explain",
        "brief": "Complete BG-04, then BG-05.",
        "steps": [
          "Predict the ordered list from the awaited loop.",
          "Explain import, test, async, page, goto and expect in BG-05.",
          "Run the focused starter and record the result."
        ],
        "acceptance": [
          "No arbitrary waits are added.",
          "The heading assertion executes and passes."
        ],
        "hint": "The project supplies page; the test does not need browser.launch.",
        "solution": "BG-04 records [2,4] in order; BG-05 navigates to /lab/ then awaits a role-based heading assertion. See worked.spec.ts for complete runnable examples."
      },
      {
        "id": "00-04-b",
        "title": "An outcome and its recovery",
        "brief": "Complete BG-06 without using another test as setup.",
        "steps": [
          "Visit the shop.",
          "Search for quantum toaster and check empty state plus zero cards.",
          "Search for head and check the exact resulting name and disappearance of empty state."
        ],
        "acceptance": [
          "Empty and recovered states are both asserted.",
          "The case passes by itself."
        ],
        "hint": "Product cards are article elements named for the product.",
        "solution": "The solution awaits search.fill, checks the No products found heading and zero articles, then fills head and checks one Studio Headphones article with the empty heading hidden."
      }
    ],
    "quiz": {
      "question": "What does getByRole by itself do?",
      "options": [
        "Checks that a test passed",
        "Describes how to locate an element",
        "Starts the local server"
      ],
      "answer": 1,
      "explanation": "Use an action or assertion on the locator; creating it is not an assertion."
    },
    "resources": [
      {
        "title": "Writing tests",
        "url": "https://playwright.dev/docs/writing-tests"
      },
      {
        "title": "Assertions",
        "url": "https://playwright.dev/docs/test-assertions"
      }
    ]
  },
  {
    "id": "00-05",
    "stage": "foundations",
    "title": "Your first API test and a rejected input",
    "summary": "Send a request, read its result and prove that rejection did not change the cart.",
    "minutes": 60,
    "level": "Absolute beginner",
    "tags": [
      "beginner",
      "API",
      "negative-testing"
    ],
    "objectives": [
      "Check a response status and exact expected data",
      "Keep requests in the same fresh test session",
      "Verify rejected input and unchanged state together"
    ],
    "sections": [
      {
        "heading": "A request fixture is an HTTP client",
        "body": "The supplied request fixture sends HTTP without opening a browser tab. It uses the configured local base URL, so /api/products goes to the test service. The shared support import gives each test a unique training session. Requests within one test use that session; another test starts fresh. You do not need to run BG-07 before BG-08, sign in, or reset a global cart."
      },
      {
        "heading": "Read one request in three steps",
        "body": "First await the request. Then inspect its status. Then await response.json() and compare the fields with the documented catalog. params constructs the query string. The request returning does not make the JSON body available as a parsed object automatically.",
        "code": "const response = await request.get('/api/products', {\n  params: { search: 'head' }\n});\nexpect(response.status()).toBe(200);\nconst body = await response.json();\nexpect(body.total).toBe(1);\nexpect(body.products).toHaveLength(1);\nexpect(body.products[0].id).toBe('p1');\nexpect(body.products[0].name).toBe('Studio Headphones');"
      },
      {
        "heading": "Rejected does not mean broken",
        "body": "Quantity zero is forbidden by this lab. POST /api/cart with { productId: \"p1\", quantity: 0 } should return 400 and error.code INVALID_QUANTITY. A test that expects that rejection should pass. A negative test checks a valid rule about invalid input; it is not meant to be a red test run."
      },
      {
        "heading": "Read after a rejected write",
        "body": "BG-08 first checks that the fresh cart is empty. Send zero, check the exact rejection, then GET /api/cart again in the same test. Compare the full cart with the initial body. A response saying no is weak evidence if the app secretly added an item. This is your first unchanged-state check. Later API and workplace lessons extend this idea to much more difficult cases."
      }
    ],
    "exercises": [
      {
        "id": "00-05-a",
        "title": "One product, checked precisely",
        "brief": "Complete BG-07.",
        "steps": [
          "GET products with search=head.",
          "Assert 200 before reading the parsed JSON.",
          "Assert total, length, ID and name from the catalog contract."
        ],
        "acceptance": [
          "The response is checked beyond its status.",
          "A response with a wrong product would fail."
        ],
        "hint": "The returned object contains products, which is an array.",
        "solution": "Expect 200, total 1, one product, ID p1 and name Studio Headphones. Derive the expected values from docs/lab-api.md, not by assigning expected = actual."
      },
      {
        "id": "00-05-b",
        "title": "Reject zero without a side effect",
        "brief": "Complete BG-08 as a standalone test.",
        "steps": [
          "Read the fresh cart and prove it is empty.",
          "POST quantity 0 and check the exact status/code.",
          "Read again and compare the complete cart to the initial body."
        ],
        "acceptance": [
          "The expected rejection passes the test.",
          "The cart remains unchanged in the same session."
        ],
        "hint": "Use toEqual for objects; it compares content.",
        "solution": "Initial items [], then status 400/error INVALID_QUANTITY, then status 200 and full cart equal to the initial snapshot. This does not prove every invalid quantity is covered; later boundary drills add more cases."
      }
    ],
    "quiz": {
      "question": "What should a correct negative test do when quantity zero is rejected as specified?",
      "options": [
        "Pass after checking the rejection and unchanged cart",
        "Fail because the HTTP status is 400",
        "Catch all errors and ignore the response"
      ],
      "answer": 0,
      "explanation": "The expected behavior is rejection without a side effect; that is a successful test result."
    },
    "resources": [
      {
        "title": "API testing",
        "url": "https://playwright.dev/docs/api-testing"
      }
    ]
  },
  {
    "id": "00-06",
    "stage": "foundations",
    "title": "Get unstuck and save your work",
    "summary": "Read the first useful error, preserve a small change and ask for help with evidence.",
    "minutes": 45,
    "level": "Absolute beginner",
    "tags": [
      "beginner",
      "debugging",
      "Git",
      "practice"
    ],
    "objectives": [
      "Distinguish environment, syntax, type, assertion and skipped outcomes",
      "Reproduce one failure with the exact command",
      "Save source changes and study progress using their separate mechanisms"
    ],
    "sections": [
      {
        "heading": "Find the first useful signal",
        "body": "Start with the command, project and spec line. No tests found usually means the path or --grep selected nothing. A skipped test did not execute. Syntax errors prevent code parsing. TypeScript errors appear in npm run typecheck. A missing executable is browser setup. An assertion shows actual versus expected or a locator that never met its condition. Fix one cause, rerun the same focused command, then broaden only if useful."
      },
      {
        "heading": "Expected versus actual",
        "body": "Expected is the rule you chose before the run; received is what the test observed. Do not change an expectation merely to match a failure. Ask whether the requirement, setup, application or test is wrong. If BG-05 fails because you deliberately changed its heading expectation, restore that one edit. If an untouched reference fails, record the environment and error instead of marking the exercise complete."
      },
      {
        "heading": "Save, commit and push are different",
        "body": "Saving writes an editor buffer to disk. Git records snapshots of source changes with commits; pushing copies commits to a remote repository when you have access. git status and git diff show your work before committing. A downloaded source ZIP may have no .git history; that is normal and does not block learning. Keep using saved files or follow the optional Git steps in BEGINNER-START. Do not run reset --hard, clean -fd or restore on learner work as a troubleshooting shortcut."
      },
      {
        "heading": "Progress has its own home",
        "body": "The My progress page stores study notes and checkmarks, not edited spec files. The full local app uses SQLite outside the repo; hosted/static pages use that browser origin. Wait for the save indicator and export before changing origins. Git does not back up those notes. Mark complete after running and explaining the exercise; all skipped is not a success signal."
      },
      {
        "heading": "Ask for a small explanation",
        "body": "A useful help request includes the exact command, operating system, Node version, spec name, relevant error and what you expected. Remove private paths or data when sharing. If using an AI agent, ask it to explain the first failing line and propose one hint before supplying a solution. Keep the criteria and ask why each assertion matters. The later AI track remains available after you can explain a small test yourself."
      }
    ],
    "exercises": [
      {
        "id": "00-06-a",
        "title": "A three-part diagnosis note",
        "brief": "Repeat the safe wrong-heading experiment in your BG-05 starter.",
        "steps": [
          "Record the focused command and first relevant error.",
          "Identify expected versus observed behavior and one plausible cause.",
          "Restore the correct heading and record the passing rerun."
        ],
        "acceptance": [
          "The deliberate failure occurs at the intended assertion.",
          "You can explain why a missing browser would be different evidence."
        ],
        "hint": "Keep the failing and passing summaries; do not need a screenshot of every terminal line.",
        "solution": "Example: BG-05 expected This heading does not exist; locator timed out at the assertion. Cause: deliberate test expectation edit. Restored Good tools. Great work.; one case passed."
      },
      {
        "id": "00-06-b",
        "title": "Ready for the original curriculum",
        "brief": "Demonstrate the runway exit gate.",
        "steps": [
          "Run one UI and one API starter separately.",
          "Explain every meaningful line and one blind spot.",
          "Save source, verify study save status and write your next lesson as 01-01."
        ],
        "acceptance": [
          "No unexplained copied code is required to demonstrate the checks.",
          "The evidence names the command, actual result and remaining limitation."
        ],
        "hint": "Take as many sessions as needed; this is a readiness check, not a speed test.",
        "solution": "A strong handover explains BG-05 heading presence and BG-08 zero-quantity rejection with unchanged state. It names uncovered behavior, saves the files, confirms progress storage, then continues at 01-01."
      }
    ],
    "quiz": {
      "question": "Which action backs up edited spec files to Git history?",
      "options": [
        "Marking a lesson complete",
        "Saving then committing the intended source changes",
        "Exporting browser learning progress"
      ],
      "answer": 1,
      "explanation": "Source history and learner progress are separate records. A remote push is an additional step after a commit."
    },
    "resources": [
      {
        "title": "Running tests",
        "url": "https://playwright.dev/docs/running-tests"
      },
      {
        "title": "Git recording changes",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository"
      }
    ]
  }
];
