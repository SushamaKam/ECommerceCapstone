// Imports assertions and Playwright's page and locator types.
import { expect, type Locator, type Page } from '@playwright/test';

/** Provides catalog navigation, searching, and add-to-cart behavior. */
export class ProductPage {
  // Exposes the catalog's search input for reuse and focused assertions.
  readonly searchInput: Locator;

  // Receives the test's page instance and identifies the search field.
  constructor(private readonly page: Page) {
    // Targets the search input by the site's stable element ID.
    this.searchInput = page.locator('#search_product');
  } // Ends the constructor.

  // Opens the product catalog route.
  async goto(): Promise<void> {
    // Navigates to the catalog using the baseURL from Playwright configuration.
    await this.page.goto('/products');
  } // Ends catalog navigation.

  // Submits a product-name query and waits for the matching search URL.
  async searchFor(productName: string): Promise<void> {
    // Enters the requested product name into the catalog search field.
    await this.searchInput.fill(productName);
    // Submits the search using the site's search button.
    await this.page.locator('#submit_search').click();
    // Waits for navigation and the exact submitted query before checking results.
    await this.page.waitForURL(
      // Verifies the URL path and decoded query parameter match this search.
      (url) => url.pathname === '/products' && url.searchParams.get('search') === productName,
      // Allows the public site additional time to complete navigation.
      { waitUntil: 'domcontentloaded', timeout: 30_000 },
    ); // Completes the URL synchronization check.
  } // Ends product search.

  // Returns the catalog card containing the requested product name.
  productCard(productName: string): Locator {
    // Restricts the match to catalog cards, avoiding similarly named modal content.
    return this.page.locator('.features_items .product-image-wrapper').filter({ hasText: productName });
  } // Ends product-card lookup.

  // Adds the requested catalog item to the shopper's cart.
  async addToCart(productName: string): Promise<void> {
    // Finds the card containing the product to add.
    const card = this.productCard(productName);
    // Reveals the add controls that the site displays on hover.
    await card.hover();
    // Clicks the first matching button because the card may render desktop and overlay controls.
    await card.locator('.add-to-cart').first().click();
    // Waits for the site's add confirmation before returning to the test.
    await expect(this.page.getByRole('heading', { name: 'Added!' })).toBeVisible();
  } // Ends add-to-cart action.
} // Ends the ProductPage page object.
