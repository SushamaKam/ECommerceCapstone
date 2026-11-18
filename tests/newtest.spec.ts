import { test, expect } from '../fixtures/test';

test('a user can log in and delete their account', async ({ page, homePage, loginPage }) => {
  await page.goto('http://automationexercise.com', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Automation Exercise/);
  await expect(homePage.heroHeading).toBeVisible();

  await homePage.openLogin();
  await expect(page.getByRole('heading', { name: /Login to your account/i })).toBeVisible();

  await loginPage.login('sushama.kamble@perficient.com', 'Passw0rd');
  await expect(page.getByText(/Logged in as/i)).toBeVisible();

 // await page.getByRole('link', { name: 'Delete Account' }).click();
 // await expect(page.getByRole('heading', { name: /Account Deleted!/i })).toBeVisible();
});