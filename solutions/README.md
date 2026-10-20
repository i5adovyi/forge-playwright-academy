# Worked solutions

These are executable explanations for EX-01–24. They use the same real application as the reference suite.

```sh
npm run test:solutions
npm run test:solutions -- --grep "EX-17"
```

The solution is one defensible approach, not the only one. A passing test is insufficient if it would also pass after the intended behavior breaks.

## Choices to notice

- **EX-01–08:** user-facing locators, scoped product assertions, exact ordered text, web-first assertions, and keyboard focus.
- **EX-09–16:** integer-cent arithmetic, stable error codes, validation boundaries, immutable order snapshots, and isolated contexts disposed in `finally`.
- **EX-17:** API setup avoids UI setup overhead while the action under test remains a real UI checkout.
- **EX-18–19:** routes test frontend behavior against controlled responses. They do not verify the real backend.
- **EX-20:** the download listener starts before the click. Content assertions add evidence beyond a filename.
- **EX-21:** narrow viewport coverage checks behavior and overflow; it does not claim to audit every accessibility requirement.
- **EX-22:** one test observes the same failed operation at UI and API layers.
- **EX-23:** a request-specific predicate avoids accidentally matching a different network response.
- **EX-24:** reset is a session-local fixture convenience, and its contract includes authentication and history.

No fixed sleeps, global shared user cart, conditional assertions, or forced clicks are needed. If your solution does need one, first inspect whether it is hiding a missing state transition.
