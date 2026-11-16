// Imports the browser page type used by checkout actions.
import type { Page } from '@playwright/test';

// Describes the fictional payment fields expected by the practice checkout form.
export type PaymentDetails = {
  // Name printed on the test card.
  nameOnCard: string;
  // Fictional test card number accepted by the practice site.
  cardNumber: string;
  // Test card security code.
  cvc: string;
  // Test card expiration month.
  expiryMonth: string;
  // Test card expiration year.
  expiryYear: string;
}; // Completes the typed test-payment data shape.

/** Provides order-review, order-placement, and fictional payment actions. */
export class CheckoutPage {
  // Stores the current page for checkout form interactions.
  constructor(private readonly page: Page) {} // Ends the constructor.

  // Adds a shopper-provided note to the order review.
  async addOrderComment(comment: string): Promise<void> {
    // Fills the order message textarea with the supplied comment.
    await this.page.locator('textarea[name="message"]').fill(comment);
  } // Ends order-comment entry.

  // Advances from the order review to the payment form.
  async placeOrder(): Promise<void> {
    // Selects the visible Place Order link to open payment details.
    await this.page.getByRole('link', { name: 'Place Order' }).click();
  } // Ends the transition to payment.

  // Enters fictional payment data and submits the order.
  async pay(details: PaymentDetails): Promise<void> {
    // Fills the cardholder name supplied by the test.
    await this.page.locator('input[name="name_on_card"]').fill(details.nameOnCard);
    // Fills the fictional card number supplied by the test.
    await this.page.locator('input[name="card_number"]').fill(details.cardNumber);
    // Fills the test card's security code.
    await this.page.locator('input[name="cvc"]').fill(details.cvc);
    // Fills the test card's expiration month.
    await this.page.locator('input[name="expiry_month"]').fill(details.expiryMonth);
    // Fills the test card's expiration year.
    await this.page.locator('input[name="expiry_year"]').fill(details.expiryYear);
    // Submits the payment form to confirm the order.
    await this.page.getByRole('button', { name: 'Pay and Confirm Order' }).click();
  } // Ends payment submission.
} // Ends the CheckoutPage page object.
