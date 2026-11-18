// Provides axe-core's accessibility scanner for the accessibility scenario below.
import AxeBuilder from '@axe-core/playwright';
// Imports the project's configured test runner and web-first assertion helpers.
import { test, expect } from '../fixtures/test';
// Reuses stable product names so test intent is separate from application actions.
import { products } from '../testdata/products';
// Creates a unique disposable customer for the registration and checkout scenario.
import { createAccount } from '../utils/userFactory';

// Covers both a product search hit and a search with no matching products.
test('search returns a matching product and handles an empty result set', async ({
  // Provides access to the page URL and catalog result assertions.
  page,
  // Provides reusable catalog navigation, search, and product locators.
  productPage,
}) => {
  // Opens the product catalog before submitting either search.
  await productPage.goto();
  // Searches for a known catalog item to verify the successful-result path.
  await productPage.searchFor(products.searchable);

  // Confirms the submitted search is represented in the URL.
  await expect(page).toHaveURL(/\/products\?search=/);
  // Confirms the catalog displays its searched-results heading.
  await expect(page.getByRole('heading', { name: 'Searched Products' })).toBeVisible();
  // Verifies the requested known product appears in the results.
  await expect(productPage.productCard(products.searchable)).toBeVisible();

  // Searches for a deliberately nonexistent item to exercise the empty state.
  await productPage.searchFor(products.noResults);
  // Confirms the page still renders the searched-results section.
  await expect(page.getByRole('heading', { name: 'Searched Products' })).toBeVisible();
  // Verifies there are no product cards in the catalog results container.
  await expect(page.locator('.features_items .product-image-wrapper')).toHaveCount(0);
}); // Ends the positive and empty product-search checks.

// Verifies an item can be added to the cart and then removed from it.
test('a shopper can add a product to the cart and remove it', async ({
  // Provides direct access to the tab and the post-add View Cart link.
  page,
  // Adds the known catalog product through reusable page-object actions.
  productPage,
  // Locates the cart row and performs the remove action.
  cartPage,
}) => {
  // Opens the catalog to begin the shopper's cart journey.
  await productPage.goto();
  // Adds the known product and waits for the application's confirmation.
  await productPage.addToCart(products.searchable);
  // Opens the cart from the add-to-cart confirmation.
  await page.getByRole('link', { name: 'View Cart' }).click();

  // Confirms the selected product is present in the cart.
  await expect(cartPage.productRow(products.searchable)).toBeVisible();
  // Removes the product and waits for the server-side deletion.
  await cartPage.removeProduct(products.searchable);
  // Confirms the product row is gone after reloading the cart.
  await expect(cartPage.productRow(products.searchable)).toHaveCount(0);
}); // Ends the cart add/remove scenario.

// Ensures a failed login displays the site's expected validation feedback.
test('login rejects invalid credentials with a clear error', async ({ page, loginPage }) => {
  // Opens the page containing the login form.
  await loginPage.goto();
  // Submits intentionally invalid credentials through the page object.
  await loginPage.login('invalid.user@example.com', 'incorrect-password');

  // Checks the exact error text shown for rejected credentials.
  await expect(page.getByText('Your email or password is incorrect!', { exact: true })).toBeVisible();
}); // Ends the invalid-login scenario.

// Checks that the contact form accepts valid input and shows success feedback.
test('contact us form accepts a valid message', async ({ page, contactUsPage }) => {
  // Opens the contact form.
  await contactUsPage.goto();
  // Accepts the browser confirmation dialog triggered by the site's form script.
  page.once('dialog', (dialog) => dialog.accept());
  // Fills and submits the contact details through the page object.
  await contactUsPage.submit(
    // Provides the sender's display name.
    'Playwright QA',
    // Provides a syntactically valid test email address.
    'playwright.qa@example.com',
    // Provides the contact request's subject.
    'Capstone feedback',
    // Provides the message content for the form submission.
    'Validating the customer contact journey.',
  ); // Submits the filled contact form.

  // Verifies the contact form's own success message, not the footer subscription message.
  await expect(page.locator('#contact-page .alert-success')).toContainText(
    // Checks the expected success message returned by the practice site.
    'Success! Your details have been submitted successfully.',
  ); // Completes the contact-form success assertion.
}); // Ends the contact-form scenario.

// Runs axe-core against the homepage and records findings for review.
test('home page has no critical axe-core accessibility violations', async ({ page, homePage }, testInfo) => {
  // Opens the page that will be scanned for accessibility issues.
  await homePage.goto();
  // Configures axe to check WCAG 2.0 A/AA and WCAG 2.1 A/AA rules.
  const results = await new AxeBuilder({ page })
    // Limits the scan to the selected accessibility standard tags.
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Runs the scan and returns violations plus their affected DOM nodes.
    .analyze();

  // Attaches the complete violation list to the test report for diagnosis.
  await testInfo.attach('axe-violations.json', {
    // Serializes the axe result as readable JSON.
    body: JSON.stringify(results.violations, null, 2),
    // Labels the attachment so report viewers can interpret it correctly.
    contentType: 'application/json',
  }); // Completes the accessibility report attachment.
  // Keeps only critical violations so the configured gate has a clear severity threshold.
  const unexpectedCriticalViolations = results.violations
    // Selects violations axe classifies as critical.
    .filter(({ impact }) => impact === 'critical')
    // Expands each violation into its affected nodes for target-level filtering.
    .flatMap((violation) => violation.nodes.map((node) => ({ violation, node })))
    // The site has a known unlabeled footer button; it remains included in the attached report.
    .filter(({ node }) => !node.target.includes('#subscribe'));
  // Fails the test if any critical violation remains outside the documented exception.
  expect(unexpectedCriticalViolations).toEqual([]);
}); // Ends the axe-core accessibility scenario.
