# Testing

Guidelines and commands for unit and (optional) e2e tests.

## Unit tests

- Runner: Karma
- Command: `npm test`
- Config: Angular CLI default (`@angular/build:karma`)
- Polyfills: `zone.js`, `zone.js/testing`

Recommendations:
- Prefer small, focused tests on services and pure functions
- Use spies/mocks for Firestore and AngularFire interactions
- Keep tests colocated near source or in a parallel `*.spec.ts`

## End-to-end (e2e)

- No e2e framework configured by default
- You may add Cypress or Playwright; wire it into CI as needed

## Coverage

- Set thresholds in Karma config if coverage becomes a gate
- Track coverage in CI for PRs
