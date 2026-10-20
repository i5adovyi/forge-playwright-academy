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
