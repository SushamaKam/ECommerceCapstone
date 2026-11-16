// Imports the locator and page types used to define login and signup interactions.
import type { Locator, Page } from '@playwright/test';

// Describes the profile data required by the site's account-registration form.
export type NewAccount = {
  // Name displayed in signup and the authenticated header.
  name: string;
  // Unique email used to register and later authenticate the test account.
  email: string;
  // Password used during account creation and the subsequent login check.
  password: string;
  // First name shown on the registered customer's delivery address.
  firstName: string;
  // Last name entered in the address profile.
  lastName: string;
  // Company value entered in the address profile.
  company: string;
  // Street address entered for delivery and billing.
  address: string;
  // Country option selected in the registration form.
  country: string;
  // State or region entered in the address profile.
  state: string;
  // City entered in the address profile.
  city: string;
  // Postal or ZIP code entered in the address profile.
  zipCode: string;
  // Contact phone number required by the registration form.
  mobileNumber: string;
}; // Completes the typed registration-data shape.

/** Provides login, signup, and account-registration actions. */
export class LoginPage {
  // Exposes the login form container to scope its repeated email placeholder.
  readonly loginForm: Locator;
  // Exposes the signup form container to avoid matching login/footer inputs.
  readonly signupForm: Locator;

  // Stores the page and creates locators for the two separate forms.
  constructor(private readonly page: Page) {
    // Scopes login controls to the login form section.
    this.loginForm = page.locator('.login-form');
    // Scopes signup controls to the new-user form section.
    this.signupForm = page.locator('.signup-form');
  } // Ends the constructor.

  // Opens the login and signup page.
  async goto(): Promise<void> {
    // Waits for the main document while avoiding unrelated resource delays.
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  } // Ends login-page navigation.

  // Submits the provided credentials through the login form.
  async login(email: string, password: string): Promise<void> {
    // Fills the email field inside the login form.
    await this.loginForm.getByPlaceholder('Email Address').fill(email);
    // Fills the password field inside the login form.
    await this.loginForm.getByPlaceholder('Password').fill(password);
    // Submits the credentials using the login form's button.
    await this.loginForm.getByRole('button', { name: 'Login' }).click();
  } // Ends login submission.

  // Starts account creation by submitting the name and unique email.
  async beginSignup(name: string, email: string): Promise<void> {
    // Fills the name field in the new-user signup form.
    await this.signupForm.getByPlaceholder('Name').fill(name);
    // Fills the signup email field, scoped separately from login's email.
    await this.signupForm.getByPlaceholder('Email Address').fill(email);
    // Submits the initial signup step to reveal the full account form.
    await this.signupForm.getByRole('button', { name: 'Signup' }).click();
  } // Ends initial signup.

  // Completes the profile form using the typed customer data.
  async completeSignup(account: NewAccount): Promise<void> {
    // Selects a gender option required by the registration form.
    await this.page.locator('#id_gender1').check();
    // Enters the new account's password.
    await this.page.locator('#password').fill(account.password);
    // Selects a valid birth day from the date-of-birth dropdown.
    await this.page.locator('#days').selectOption('10');
    // Selects a valid birth month from the date-of-birth dropdown.
    await this.page.locator('#months').selectOption('5');
    // Selects a valid birth year from the date-of-birth dropdown.
    await this.page.locator('#years').selectOption('1990');
    // Enters the customer's first name.
    await this.page.locator('#first_name').fill(account.firstName);
    // Enters the customer's last name.
    await this.page.locator('#last_name').fill(account.lastName);
    // Enters the customer's company.
    await this.page.locator('#company').fill(account.company);
    // Enters the customer's street address.
    await this.page.locator('#address1').fill(account.address);
    // Chooses the configured country by its visible option label.
    await this.page.locator('#country').selectOption({ label: account.country });
    // Enters the customer's state or region.
    await this.page.locator('#state').fill(account.state);
    // Enters the customer's city.
    await this.page.locator('#city').fill(account.city);
    // Enters the customer's postal code.
    await this.page.locator('#zipcode').fill(account.zipCode);
    // Brings the final required field into view for consistent browser interaction.
    await this.page.locator('#mobile_number').scrollIntoViewIfNeeded();
    // Enters the customer's mobile phone number.
    await this.page.locator('#mobile_number').fill(account.mobileNumber);
    // Submits the completed account details.
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  } // Ends account registration.
} // Ends the LoginPage page object.
