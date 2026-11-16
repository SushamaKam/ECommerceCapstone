# E-commerce Playwright Automation Framework

An enterprise-style Playwright + TypeScript framework for the public practice
store [Automation Exercise](https://automationexercise.com). The suite demonstrates
maintainable page objects, typed fixtures, isolated test data, cross-browser
execution, reporting, network mocking, accessibility checks, and visual regression.

## Requirements

- Node.js 20 or newer
- npm

## Setup

```powershell
npm install
npx playwright install
Copy-Item .env.example .env
```

Set `BASE_URL` in `.env` to run against another compatible environment. The
default is `https://automationexercise.com`.

## Run

```powershell
npm test                    # Chromium, Firefox, and WebKit
npm run test:chromium       # Fast local run
npm run test:headed         # Visible browser
npm run test:ui             # Playwright UI mode
npm run test:debug          # Inspector/debug mode
npm run typecheck           # TypeScript validation
npm run report              # Open the HTML report
```

The HTML report and traces/screenshots/videos for failed tests are written under
`reports/`. Browser projects are isolated and may run in parallel. The order test
creates a uniquely named disposable account and deletes it after a successful
purchase. A failed run can leave that account behind; use a fresh email if
re-running the scenario.

## Framework map

```text
config/       Environment configuration
fixtures/     Shared Playwright fixtures and test hooks
pages/        Page Object Model and user-flow actions
testdata/     Stable catalog inputs
tests/        Business-level scenarios and quality checks
utils/        Isolated/generated test data helpers
reports/      HTML report and failure artifacts (generated)
```

See [docs/framework-architecture.md](docs/framework-architecture.md) for a
short architecture presentation and design decisions.

## Test coverage

Eight scenarios cover storefront navigation and visual baseline, product search
and empty results, cart add/remove, invalid login, registration and order
placement, contact form submission, deterministic search-response mocking, and
axe-core accessibility scanning. The accessibility gate fails on critical
violations outside the practice site's known unlabeled footer subscription
button (`#subscribe`) and attaches the complete axe result set for review.
The full registration/checkout lifecycle is run in Chromium because the public
practice site's checkout client script is inconsistent across browser engines;
the remaining applicable scenarios exercise all three projects.

The visual baseline is pinned to Chromium; browser/OS/font differences make
cross-engine pixel baselines noisy. Review intentional UI changes before
updating it with `npm run test:update-snapshots`; commit only reviewed baseline
changes.

## Engineering practices

- Prefer role- and label-based locators; isolate site-specific CSS selectors in
  page objects where the practice site does not expose accessible names.
- Use Playwright auto-waiting and web-first assertions; avoid fixed sleeps.
- Generate unique account data per test and do not store real credentials.
- Keep traces, screenshots, and videos for failed tests; use Trace Viewer for
  diagnosis (`npx playwright show-trace <trace-file>`).
- Keep network mocks explicit and scoped to the test that needs determinism.
- AI-generated suggestions should be reviewed against the live application,
  typed, and validated. No generated code is accepted without human review.

## Known limitations

Automation Exercise is a shared public practice site, not a controlled staging
environment. Availability, third-party resources, seeded catalog data, and
server-side behavior may change. The checkout uses clearly fictional payment
details and should only be run against this practice application or an
authorized test environment.
