// Imports the browser page type used by the contact form actions.
import type { Page } from '@playwright/test';

/** Provides navigation to and submission of the contact-us form. */
export class ContactUsPage {
  // Stores the current page for contact form interactions.
  constructor(private readonly page: Page) {} // Ends the constructor.

  // Opens the contact-us route.
  async goto(): Promise<void> {
    // Waits for the main document without blocking on third-party resources.
    await this.page.goto('/contact_us', { waitUntil: 'domcontentloaded' });
  } // Ends contact-page navigation.

  // Fills the contact fields and submits the completed message.
  async submit(name: string, email: string, subject: string, message: string): Promise<void> {
    // Enters the sender name using the field's visible placeholder.
    await this.page.getByPlaceholder('Name').fill(name);
    // Enters the sender email; exact matching avoids the footer email field.
    await this.page.getByPlaceholder('Email', { exact: true }).fill(email);
    // Enters the contact request subject.
    await this.page.getByPlaceholder('Subject').fill(subject);
    // Enters the body of the contact message.
    await this.page.getByPlaceholder('Your Message Here').fill(message);
    // Submits the form using its accessible button name.
    await this.page.getByRole('button', { name: 'Submit' }).click();
  } // Ends contact-form submission.
} // Ends the ContactUsPage page object.
