// Provides axe-core's accessibility scanner for the accessibility scenario below.
import AxeBuilder from '@axe-core/playwright';
// Imports the project's configured test runner and web-first assertion helpers.
import { test, expect } from '../fixtures/test';
// Reuses stable product names so test intent is separate from application actions.
import { products } from '../testdata/products';
// Creates a unique disposable customer for the registration and checkout scenario.
import { createAccount } from '../utils/userFactory';

// Confirms the storefront loads, its hero is visible, and product navigation works.
test('home page renders, supports navigation, and matches its visual baseline', async ({
  // Provides the browser tab for title, URL, and locator assertions.
  page,
  // Provides reusable home-page navigation and the hero-heading locator.
  homePage,
  // Identifies the current browser project so only Chromium captures the baseline.
  browserName,
}) => {
  // Opens the storefront using the page object's navigation method.
  await homePage.goto();

  // Checks the document title to confirm the expected site loaded.
  await expect(page).toHaveTitle(/Automation Exercise/);
  // Confirms the main hero heading is visible to the shopper.
  await expect(homePage.heroHeading).toBeVisible();
  // Keeps pixel comparisons stable by capturing the baseline only in Chromium.
  if (browserName === 'chromium') {
    // Compares the hero heading with the committed visual snapshot.
    await expect(homePage.heroHeading).toHaveScreenshot('home-hero-heading.png');
  } // Ends the Chromium-only visual check.

  // Follows the storefront's Products navigation link.
  await homePage.openProducts();
  // Confirms navigation reached the catalog route.
  await expect(page).toHaveURL(/\/products$/);
  // Verifies the catalog page identifies itself as All Products.
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
}); // Ends the storefront smoke and visual-baseline scenario.

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

// Exercises a complete disposable-customer journey, including purchase and account cleanup.
test('a registered customer can place an order and delete the test account', async ({
  // Provides the browser tab for outcome checks and account navigation.
  page,
  // Adds the catalog product that will be purchased.
  productPage,
  // Opens checkout from the cart.
  cartPage,
  // Registers the account, then logs back into it after checkout.
  loginPage,
  // Enters an order comment and fictional payment details.
  checkoutPage,
  // Restricts the end-to-end account flow to the verified Chromium project.
  browserName,
}) => {
  // The shared practice site's checkout script is inconsistent in Firefox and WebKit.
  test.skip(
    browserName !== 'chromium',
    "The public practice site's checkout script is inconsistent across engines.",
  ); // Skips this scenario on unsupported browser projects.
  // Generates a unique profile so parallel or repeated runs avoid duplicate accounts.
  const account = createAccount();
  // Opens the registration and login page.
  await loginPage.goto();
  // Submits the customer's name and unique email to begin registration.
  await loginPage.beginSignup(account.name, account.email);
  // Completes the registration form using the generated profile.
  await loginPage.completeSignup(account);

  // Verifies the site acknowledges successful account creation.
  await expect(page.getByRole('heading', { name: 'Account Created!' })).toBeVisible();
  // Continues from the confirmation page back into the storefront.
  await page.getByRole('link', { name: 'Continue' }).click();
  // Confirms the account is now authenticated.
  await expect(page.getByText(/Logged in as/)).toBeVisible();

  // Opens the catalog to add the product for the new customer.
  await productPage.goto();
  // Adds the selected product to the customer's cart.
  await productPage.addToCart(products.searchable);
  // Opens the cart using the add confirmation.
  await page.getByRole('link', { name: 'View Cart' }).click();
  // Proceeds from the cart into the checkout review.
  await cartPage.proceedToCheckout();
  // Confirms checkout uses the registered customer's delivery address.
  await expect(page.locator('#address_delivery')).toContainText(account.firstName);
  // Confirms the product selected earlier is listed for review.
  await expect(page.getByRole('row').filter({ hasText: products.searchable })).toBeVisible();

  // Adds a comment to the order before placing it.
  await checkoutPage.addOrderComment('Playwright capstone order');
  // Moves from the checkout review to the payment form.
  await checkoutPage.placeOrder();
  // Submits fictional test data; these values are not real payment credentials.
  await checkoutPage.pay({
    // Uses the generated account name as the cardholder name.
    nameOnCard: account.name,
    // Supplies a standard fictional test card number accepted by the practice site.
    cardNumber: '4111111111111111',
    // Supplies the test card's security code.
    cvc: '123',
    // Supplies the test card's expiry month.
    expiryMonth: '12',
    // Supplies a future test card expiry year.
    expiryYear: '2030',
  }); // Submits payment and confirms the order.

  // Confirms that the application reports the order as placed.
  await expect(page.getByText(/Order Placed!/)).toBeVisible();
  // Logs out to validate that the new account can authenticate independently.
  await page.getByRole('link', { name: 'Logout' }).click();
  // Confirms logout returned the shopper to the login route.
  await expect(page).toHaveURL(/\/login$/);
  // Logs back in using the account created during this test.
  await loginPage.login(account.email, account.password);
  // Confirms the second login succeeded before deleting the account.
  await expect(page.getByText(/Logged in as/)).toBeVisible();
  // Deletes the disposable account to reduce test data left on the public site.
  await page.getByRole('link', { name: 'Delete Account' }).click();
  // Verifies the application confirms account deletion.
  await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toBeVisible();
}); // Ends the registration, purchase, and cleanup journey.

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

// Demonstrates a scoped network mock so the search result is independent of catalog data.
test('product search renders a deterministic result when its network response is mocked', async ({
  // Provides routing support and assertions for the intercepted navigation.
  page,
  // Submits the search using the same user interaction as the live-search test.
  productPage,
}) => {
  // Intercepts only the product-search URL using the configured mock product name.
  await page.route(
    // Matches the catalog route only when its search query equals the mock value.
    (url) => url.pathname === '/products' && url.searchParams.get('search') === products.mocked,
    // Returns a minimal HTML page with the structure expected by the product locator.
    (route) =>
      route.fulfill({
        // Uses a successful HTTP status for the simulated search response.
        status: 200,
        // Identifies the response body as a rendered HTML document.
        contentType: 'text/html',
        // Provides a deterministic searched-product heading and card.
        body: `<!doctype html><html><body>
          <div class="features_items">
            <h2>Searched Products</h2>
            <div class="product-image-wrapper"><div class="productinfo">
              <h2>Rs. 777</h2><p>${products.mocked}</p>
              <a href="#">Add to cart</a>
            </div></div>
          </div>
        </body></html>`,
      }), // Completes the mocked HTTP response.
  ); // Registers the route handler for this test.

  // Opens the real catalog page before exercising the intercepted search.
  await productPage.goto();
  // Submits the query that matches the scoped route above.
  await productPage.searchFor(products.mocked);

  // Confirms the mocked document displays the expected results heading.
  await expect(page.getByRole('heading', { name: 'Searched Products' })).toBeVisible();
  // Confirms the mocked product card is rendered and discoverable.
  await expect(productPage.productCard(products.mocked)).toBeVisible();
}); // Ends the deterministic network-mocking scenario.

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
