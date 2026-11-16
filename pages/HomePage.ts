// Imports Playwright locator types used by the page object.
import type { Locator, Page } from '@playwright/test';

/** Provides the storefront's navigation actions and hero-heading locator. */
export class HomePage {
  // Exposes the main hero heading for test assertions and visual comparison.
  readonly heroHeading: Locator;

  // Receives the test's page instance and prepares the stable heading locator.
  constructor(private readonly page: Page) {
    // Targets the hero by its accessible heading role and visible name.
    this.heroHeading = page.getByRole('heading', {
      // Uses the full heading text to avoid matching unrelated page content.
      name: 'Full-Fledged practice website for Automation Engineers',
    }); // Completes the heading locator definition.
  } // Ends the constructor.

  // Opens the storefront's root URL.
  async goto(): Promise<void> {
    // Waits for initial HTML parsing without waiting on third-party resources.
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  } // Ends homepage navigation.

  // Navigates from the homepage to the product catalog.
  async openProducts(): Promise<void> {
    // Uses the navigation link's accessible name rather than a brittle CSS path.
    await this.page.getByRole('link', { name: /Products/ }).click();
  } // Ends catalog navigation.

  // Navigates to the shopping cart from the site header.
  async openCart(): Promise<void> {
    // Requires an exact accessible name so a "View Cart" modal link cannot match.
    await this.page.getByRole('link', { name: 'Cart', exact: true }).click();
  } // Ends cart navigation.

  // Navigates to the signup and login screen.
  async openLogin(): Promise<void> {
    // Finds the header link by its user-facing text.
    await this.page.getByRole('link', { name: /Signup \/ Login/ }).click();
  } // Ends login navigation.

  // Navigates to the customer contact form.
  async openContactUs(): Promise<void> {
    // Matches the contact link without depending on its icon or CSS class.
    await this.page.getByRole('link', { name: /Contact us/i }).click();
  } // Ends contact navigation.
} // Ends the HomePage page object.
