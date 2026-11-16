# Framework architecture — presentation

## Slide 1 — Objective

Validate the critical retail journey on Automation Exercise while keeping test
code understandable, reusable, and runnable in Chromium, Firefox, and WebKit.

## Slide 2 — Layers

- **Tests** express business outcomes: browsing, search, cart, account, checkout,
  contact, accessibility, and resilience to a controlled network response.
- **Page objects** own selectors and user interactions; assertions remain in
  scenarios so the expected business behavior is visible.
- **Fixtures** construct page objects and apply shared setup.
- **Test data and utilities** provide stable catalog inputs and unique disposable
  customer profiles.
- **Configuration and reports** centralize the target URL, browser matrix,
  retries, evidence, and HTML reporting.

## Slide 3 — Reliability decisions

- Role-based locators are preferred; CSS selectors are limited to site-specific
  form fields and cart markup.
- Playwright auto-waiting and retrying assertions replace fixed delays.
- Each test gets a fresh browser context; account creation uses a unique email.
- Ads/analytics requests are isolated from the functional assertions, while
  product-search mocking is scoped to one test.
- Failures retain traces, screenshots, and video for Trace Viewer debugging.

## Slide 4 — Quality strategy

- Eight business and quality scenarios cover search, cart, authentication,
  end-to-end ordering, and contact form behavior.
- Chromium, Firefox, and WebKit projects provide cross-browser confidence.
- The order-placement flow is pinned to Chromium because the public practice
  site's checkout script does not behave consistently across browser engines.
- axe-core records WCAG 2A/AA and 2.1 A/AA findings; unexpected critical
  findings block the suite. The known unlabeled footer subscription button is
  documented as an upstream exception, not silently discarded.
- A focused Chromium heading screenshot provides a low-noise visual regression
  baseline without introducing cross-engine pixel noise.

## Slide 5 — Running and extending

Use `npm test` for the full browser matrix or `npm run test:chromium` locally.
Add a scenario in `tests/`, put selectors/actions in the relevant page object,
and keep reusable data in `testdata/` or `utils/`. Review trace evidence and
baseline diffs before accepting changes.

## Slide 6 — AI-assisted engineering

AI may help draft scenarios or suggest locators, but engineers verify selectors
against the application, review privacy and security implications, simplify
generated code, and run type checks and browser tests before merging.
