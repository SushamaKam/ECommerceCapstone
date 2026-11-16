// Imports the page and locator types used by the cart page object.
import type { Locator, Page } from '@playwright/test';

/** Provides cart navigation, item lookup, removal, and checkout actions. */
export class CartPage {
  // Stores the test's page instance for all cart interactions.
  constructor(private readonly page: Page) {} // Ends the constructor.

  // Opens the cart directly.
  async goto(): Promise<void> {
    // Waits for initial HTML parsing instead of third-party resources.
    await this.page.goto('/view_cart', { waitUntil: 'domcontentloaded' });
  } // Ends cart navigation.

  // Returns the cart row that contains the specified product.
  productRow(productName: string): Locator {
    // Scopes the product-name match to rows in the cart table.
    return this.page.locator('#cart_info_table tbody tr').filter({ hasText: productName });
  } // Ends cart-row lookup.

  // Removes the requested item and verifies the server accepted the deletion.
  async removeProduct(productName: string): Promise<void> {
    // Starts listening before the click so the response cannot be missed.
    const deletion = this.page.waitForResponse(
      // Selects the endpoint used by the application to delete a cart item.
      (response) => response.url().includes('/delete_cart/'),
      // Gives the shared practice site extra time to answer the request.
      { timeout: 20_000 },
    ); // Prepares the response wait.
    // Clicks the remove control in the requested product's row.
    await this.productRow(productName).locator('.cart_quantity_delete').click();
    // Waits for the server response before evaluating the cart state.
    const response = await deletion;
    // Surfaces a failed HTTP response rather than reporting removal as successful.
    if (!response.ok()) {
      // Includes the HTTP status to make a failed deletion diagnosable.
      throw new Error(`Cart deletion failed with HTTP ${response.status()}`);
    } // Ends the non-success response check.
    // Reloads to confirm the server-side cart state, not just local DOM removal.
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  } // Ends cart-item removal.

  // Opens checkout from the cart.
  async proceedToCheckout(): Promise<void> {
    // Uses the site's checkout link class because it has no accessible name.
    await this.page.locator('a.check_out').click();
  } // Ends checkout navigation.
} // Ends the CartPage page object.
