# Reviewed visual references

Initial reference set reviewed by **Codex through image inspection**, October 20, 2026. This is not a claim that a human learner has approved the images. Learners should inspect them before treating them as their own expected design.

## macOS reference environment

- Platform: darwin, arm64; Node.js 24.22.0.
- Playwright 1.64.1; bundled Chromium 156.0.8078.4.
- Bundled Atkinson Hyperlegible regular/bold; font files and license remain in `../fonts/`.
- Fixed date 20 October 2026, en-US locale, UTC timezone, light theme, reduced motion, scale factor 1.
- Desktop 1100 × 800; mobile 390 × 844; complete configuration in `playwright.visual.config.ts` at the repository root.

All four PNGs were inspected: both products and amounts are legible, SAVE10 produces $79.20, mobile details are expanded and fit the viewport, only the reference badge is masked, and the component summary preserves its price hierarchy and action. The decorative action arrow is CSS geometry to avoid fallback-glyph instability.

An unchanged comparison passed all four cases with zero differing pixels allowed. The controlled defect failed against the unchanged summary reference; a missing-reference probe failed without creating a new reference. These checks verify detection behavior, not the universal correctness of the design.

For future updates, explain the intended change, generate candidates in the intended environment, review every affected image, update these review notes, and run ordinary comparison without an update flag. Do not copy images between operating systems or replace the reference with an image of the intentional defect. See `docs/VISUAL-BASELINES.md` at the repository root.


## Linux reference environment

The four Linux images came from the **ubuntu-24.04 GitHub-hosted runner**, using the workflow's Node.js 22 environment and locked Playwright 1.64.1 / Chromium 156.0.8078.4. They were generated from source commit `6a8adb9a5d604a6643853b5aa17c55f78ffad231` in [candidate run 39448007032](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39448007032), artifact `linux-visual-baseline-candidates`.

Codex inspected all four candidate PNGs before adding them to version control. Desktop and mobile content, amounts, expanded details, mask boundary, and summary hierarchy match the intended design. Font rasterization and some wrapping differ from macOS, which is why these images were generated independently. They were not copied from the macOS reference directory. Generation is separate from the subsequent ordinary Linux comparison job.


The independent [ordinary comparison run](https://github.com/i5adovyi/forge-playwright-academy/actions/runs/39449034919) then passed all four Linux cases in 4.6 seconds at commit `1680203e0bee0e89ee68cd40a2517d2bfad3893b`, without an update flag or retries. The candidate-generation result alone was not used as the comparison result.
