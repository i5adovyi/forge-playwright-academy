# Beginner micro-exercises

Read [the complete beginner guide](../docs/BEGINNER-START.md), then follow the
portal's Start from zero route (lessons 00-01–00-06). All original tracks remain.

- `worked.spec.ts` contains eight runnable examples, BG-01–BG-08.
- `practice.spec.ts` contains their unfinished, intentionally skipped starters.
- Run one example: `npm run test:beginner -- --grep BG-05`.
- Run your own selected starter: `npm run test:beginner:practice -- --grep BG-05`.
- Implement every TODO, remove only that case's `.skip`, and replace its sentinel.

The workbook lists exact criteria, hints and controlled expectation changes.
Start with values, arrays, functions and await; then practice a heading check,
empty-search recovery, a catalog response and rejected quantity with no mutation.

The common config owns an isolated service on 4175 with browser-only study
storage. The support fixture assigns a fresh shop session per test. No learner
SQLite data is used. Cases must run independently, not in a required sequence.

A correct negative-input test passes when the expected rejection is verified.
A deliberately wrong expectation should fail at the intended assertion, then
be restored. An unrelated setup failure does not count as detecting a defect.

## Before editing: where the code goes

Open `practice.spec.ts` in your editor. Search for the selected ID, such as
`BG-01`, using the editor's Find command. Work **inside that test's braces**.
Keep the import at the top, the test title, and the closing `});`. Those are
the container that lets Playwright find and run your code. The tests containing
`({ page })` or `({ request })` receive a prepared browser page or HTTP client;
you do not have to construct those tools yet.

`TODO` is a comment describing work left for you. A **sentinel** is the supplied
line `expect(false, '...').toBe(true)`: it deliberately says that false should
be true, so it fails. Its message names the missing work. Replace it with the
required checks after implementing the selected case. Do not just delete it:
Playwright can report a passed test that made no assertions at all.

Use this routine for each small change:

1. Predict the result in your own words, before running anything.
2. Write one small chunk inside the selected test, then save the file.
3. Keep the sentinel while the remaining TODOs are unfinished. An intentional
   sentinel failure at this stage tells you the assignment is not complete.
4. Finish the criteria, replace the sentinel with real checks, and change only
   this case's `test.skip` to `test`. Save and run its **practice** command.
5. Confirm the reported file is `beginner/practice.spec.ts`, not the supplied
   `worked.spec.ts`. Record the result and explain what the assertions checked.
6. Try one safe challenge below, observe its intended failure, then restore the
   original code and confirm the passing control again. A **control** is the
   correct version you run before and after the deliberate mistake.

If you want to execute an intermediate chunk, remove that case's `.skip` earlier
and leave its sentinel. Expect an unfinished failure, not a completed exercise.
Never remove every skip at once. A syntax error elsewhere in the same file can
prevent even your selected test from loading; `--grep` selects tests, not a
subset of text to parse.

### The small assertion vocabulary

| Expression | What it compares | Where you use it |
| --- | --- | --- |
| `expect(value).toBe(expected)` | One number, string or boolean | Total, status, product name |
| `expect(arrayOrObject).toEqual(expected)` | Contents, including array order | Names, observed values, cart body |
| `expect(array).toHaveLength(expected)` | Number of items in a JavaScript array | API products array |
| `await expect(locator).toHaveCount(expected)` | Number of matching page elements | Product cards |
| `await expect(locator).toBeVisible()` | The matching page element is visible | Heading, empty-state feedback |
| `await expect(locator).toBeHidden()` | No matching element is visible | Empty-state feedback after recovery |

Here `value`, `array`, `locator` and `expected` stand for your own variable or
literal; they are not names already defined in your starter. A **literal** is a
value written directly, such as `25800`, `'p1'` or `false`. Page assertions need
`await` because they may recheck while the page changes. The value assertions
in these examples compare values already available to the test.

## Hints in small steps

Read the first hint, attempt the next line yourself, then use the next hint only
if needed. The original eight assignments and their criteria stay the same.
These hints are not additional assignments or automatic grading.

### BG-01: separate the calculation from its expected answer

- Write the multiplication as a new `const` value using the existing two names.
- `typeof quantity` produces the string `'number'`; `typeof '2'` produces
  `'string'`. Quotation marks are part of the distinction you are checking.
- Check the calculated total against `25800`, which you calculated independently.
  Comparing the total with itself would pass even if the calculation were wrong.
- After a passing control, change quantity to `3` but keep the original expected
  total. Predict `38700` as the received value; the total assertion must fail.
  Restore quantity `2`. This demonstrates an assertion, not a defect in the shop.

### BG-02: an array is more than its size

- Read a named object field with a dot; read the first array item with `[0]`.
- Use `toEqual` with an explicitly written two-name array, in the required order.
- Change only the second name to `'Unexpected product'` while leaving the
  expectation intact. A length-only check would still pass; the full-array
  comparison should fail. Restore the original name afterward.

### BG-03: trace one function call at a time

Before reading the reference answers below, predict the results for inputs
`0`, `1`, `99`, `100` and `1.5` on paper. For each input, record whether it is
an integer, whether it is inside the inclusive range, and your expected boolean.

**Reference answers — compare only after making your own predictions:**

| Input | Is it an integer? | Is it between 1 and 99, including both? | Expected result |
| --- | --- | --- | --- |
| 0 | Yes | No | false |
| 1 | Yes | Yes | true |
| 99 | Yes | Yes | true |
| 100 | Yes | No | false |
| 1.5 | No | Yes | false |

Rejecting a fraction must happen even when it is within the numeric range.
`return` finishes this particular call; it does not stop the entire test.
Call the function separately for each input and compare with its literal
boolean. Permit zero temporarily by changing the lower bound from `1` to `0`;
keep the five checks unchanged. The zero case should fail, then pass after
restoration. This function practices the stated integer rule; it does not
contact the shop or prove that a product has enough stock.

### BG-04: a promised number and a number are different

Start with the empty array already supplied. The `for...of` loop supplies `1`
on its first iteration and `2` on its second. Await the doubled number before
appending it with `observed.push(...)`. Check the final array against `[2, 4]`.
Do not write `[2, 4]` directly into `observed`: that bypasses the operation you
are supposed to practice.

The original multiplier challenge remains useful: multiplying by `3` should
produce `[3, 6]` and fail against `[2, 4]`. Restore it. It checks value comparison,
not asynchronous timing. `Promise.resolve` is already resolved in this example;
real network and browser timing come later.

Optional **missing-await experiment**, after your own BG-04 passes:

1. Find the line that awaits `Promise.resolve` in your completed starter. The
   worked example names its result `doubled`; your local name may differ. Change
   `const doubled = await Promise.resolve(value * 2);` to
   `const doubled = Promise.resolve(value * 2);`. Keep `observed` as `number[]`,
   keep the existing push and array assertion, and save.
2. Run `npm run typecheck`. At the push, TypeScript should report that
   `Promise<number>` is not assignable to `number`: the array accepts numbers,
   and you are trying to put a promise inside it. Keep the type annotation;
   do not add `any` or a cast to hide this useful signal.
3. Run `npm run test:beginner:practice -- --grep BG-04`. Playwright executes
   TypeScript without doing this separate type check. With the missing await,
   the array contains promises instead of numbers, so the `[2, 4]` assertion
   should fail. The report may display the promises differently by version;
   the meaningful mismatch is **promise objects versus resolved numbers**.
4. Restore that one `await`, save, then rerun typecheck and the selected starter.
   Both should pass if your other learner edits are also type-correct. If a
   different edited file fails typecheck, keep its filename and diagnose it
   separately; do not count it as the expected missing-await evidence.

This demonstrates promised versus resolved values, not a guarantee that every missing await
will produce this exact failure. Never turn it into a fixed-time sleep.

### BG-05: locating a heading is not checking it

Navigation is supplied in the starter. Build a locator by role `heading` and
the complete name `'Good tools. Great work.'`, with `exact: true`. Pass that
locator to an awaited visibility assertion. `getByRole` alone only describes
what to look for; it does not assert that the element appeared.

Temporarily expect `'This heading does not exist'` and rerun the same starter.
The visibility assertion should time out because no matching heading appears.
Restore the real name and rerun. The heading check does not verify checkout,
search or any other action.

### BG-06: build the recovery sequence in three chunks

First explore the shop manually: enter `quantum toaster`, then replace it with
`head`. Notice the empty message, product cards and disappearance of the empty
message. In the test, a product card has role `article`; it is not called `card`
in the locator API.

1. Open `/lab/`. Name the search locator (`searchbox`, name `Search products`)
   and the empty heading locator (`heading`, exact name `No products found`).
2. Use `await search.fill('quantum toaster')`. `fill` replaces the field's text.
   Check the empty heading is visible **before** checking that articles number
   zero. A page that has not loaded yet can also have zero articles.
3. Fill `head` in the same field, in the same test. Check exactly one article,
   the visible exact article name `Studio Headphones`, and hidden empty feedback.

Use the vocabulary table for `toHaveCount`, `toBeVisible` and `toBeHidden`.
Keep the sentinel until all three chunks are complete. After a successful run,
temporarily expect `Mechanical Keyboard` as the recovered article name. The
count still fits, but the product-name assertion must fail. Restore the name.

### BG-07: read the response before reading its data

Use three distinct steps: await `request.get`, check the response status,
then await `response.json()` into a body variable. `{ params: { search: 'head' } }`
adds the query to the URL. It does not submit a JSON request body.

Inspect `body.total` and `body.products`, then the first product's `id` and
`name`. `products[0]` is one object; `products` is the whole array. The expected
ID is `'p1'`, not a value copied from the response. Change only the expected ID
to `'p2'` for the safe challenge; status 200 should not hide the body mismatch.
Restore it. This checks one query, not all search terms.

### BG-08: keep before, rejection and after separate

Do all three phases inside this one test, using its supplied `request` client:

1. **Before:** GET `/api/cart`, check 200, parse its body, and check `items` is
   an empty array. Save that parsed body under a name such as `before`.
2. **Attempt:** POST `/api/cart` with a `data` option containing `productId`
   `'p1'` and numeric `quantity` `0`. The shape is
   `{ data: { productId: 'p1', quantity: 0 } }`. Check status 400 and parse the
   error body. Its `error.code` must be `'INVALID_QUANTITY'`. You may give the
   parsed error a separate variable instead of using nested parentheses.
3. **After:** GET `/api/cart` again, check 200, parse its body, and compare that
   whole body with `before` using `toEqual`. Do not compare the before value
   with itself, or compare two HTTP response objects instead of their data.

A 400 is the correct application response here, so the complete negative-input
test should pass. Temporarily expecting 200 for the rejected write should fail
at that status check; restore 400. This challenge demonstrates that the check
executes. It does not simulate an application that mutates state despite a
rejection. The existing-cart cases in [API testing](../docs/API-TESTING.md)
extend this idea later: an empty cart cannot reveal whether a rejection wrongly
erases items that were already present.

## Explain one result without copying the solution

For each completed starter, write one sentence for the input, one for the
expected outcome and one for what would make your check fail. Include the exact
practice command, the file reported by the runner and one behavior not covered.
If you needed a worked example, close it and explain the important lines back
in your own words. Return to one hint when a line still feels like magic.

A green supplied solution is a reference. A green starter with deleted checks
is weak evidence. A passing starter whose checks you can explain, deliberately
challenge and restore is the learning goal.
